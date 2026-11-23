/* Model X module: same factory/stage interface as AE86; all geometry is car-specific.
   Cabin and articulated opening panels. Unpublished geometry is DESIGN. */
CAR_MODULES.modelx=function(G){
'use strict';
const {THREE,body,carRoot,P,wheels,state,anim,phys,mk,paintable,matPaint,matV,group,build,SKIN,segTo,zAxis,bodyPt,bodyM,keys,bufGeo}=G;
const MX=makeModelX(),stages=[];
const stage=(name,fn)=>stages.push([name,fn]);
const cabin={windows:[],displays:[],materials:[]};
stage('Shaping separate Model X panels',()=>{
  const oldSkin=SKIN.mode;SKIN.mode='net'; // Existing renderer; QA still measures the original 10 mm panel cells.
  const grids=buildModelXBody(MX);build.mx=grids;
  // v2.1 (Opus): each panel is ONE surface net. Paint, trim, frit, window frame and lamp cells of a panel are drawn from the same net (shared vertices),
  // so a lamp or a frame never leaves a seam or a gap against its panel. The lit lamps get their own meshes cut from that net (render only; the panel's
  // rest mesh keeps the cells for the checks). Joins between separate panels are the real shut lines.
  const lampOf=new Map();for(const [grp,keys] of Object.entries(MX_LAMP_GROUPS))for(const k of keys)lampOf.set(MX_LAMP[k],grp);
  const cut=(g,net,keep)=>{const {P:V,N,Q,QC,x0,y0,z0}=net,pos=[],nor=[],col=[],idx=[],map=new Map();
    for(let q=0;q<Q.length;q+=4){const c=QC[q>>2];if(!keep(c))continue;const rgb=[(c>>16&255)/255,(c>>8&255)/255,(c&255)/255],ids=[];
      for(let e=0;e<4;e++){const v=Q[q+e];let id=map.get(v);if(id===undefined){id=pos.length/3;map.set(v,id);pos.push(V[v*3]+x0,V[v*3+1]+y0,V[v*3+2]+z0);nor.push(N[v*3],N[v*3+1],N[v*3+2]);col.push(rgb[0],rgb[1],rgb[2]);}ids.push(id);}
      idx.push(ids[0],ids[1],ids[2],ids[0],ids[2],ids[3]);}
    return {pos,nor,col,idx};};
  const isPaint=c=>c===PAINT||c===PAINT_SHADE;
  // v2.2 (Opus): the closed body is ONE surface. Every opaque panel is drawn on the vertex positions of one net taken over all of them together, wherever
  // that net has a vertex, so two panels that meet share the same surface along their join: no groove, no gap, no step. Each panel's own net still
  // supplies its cut edge (seen once the panel opens). The shut lines are drawn as thin dark lines along the joins (render only, below); the checks keep
  // every panel's own cells and colours.
  const MOVING=/^(hood|trunk|door[LR]|rupper[LR]|rdoor[LR])$/,opaque=Object.keys(grids).filter(n=>!/Glass|panorama/.test(n));
  const KEY=(i,j,k)=>((i+400)*600+(j+100))*600+(k+300),owner=new Map(),ids=opaque;
  for(const n of opaque)for(const [x,y,z] of (grids._render[n]||grids[n]).list())owner.set(KEY(x,y,z),n);
  const out_=(x,y,z)=>!MX.solidAt(x*.5,y*.5,z*.5);
  const drawn={};for(const n of opaque)drawn[n]=grids._render[n]||grids[n];
  // the glass panes are in the one surface too: each pane is drawn on it (glazing stage), so glass and frame meet on the same vertices, no gap round a window
  const panes=Object.keys(grids).filter(n=>/Glass|panorama/.test(n));for(const n of panes)for(const [x,y,z] of grids[n].list())owner.set(KEY(x,y,z),n);
  const U=mxGrid(opaque.flatMap(n=>drawn[n].list()).concat(panes.flatMap(n=>grids[n].list()))),un=surfaceNet(U,{snap:{inside:MX.solidAt,scale:.5}}),uv=new Map();
  for(let v=0;v<un.NV;v++)uv.set(KEY(un.CB[v*3]+U.x0,un.CB[v*3+1]+U.y0,un.CB[v*3+2]+U.z0),v);
  const adopt=(rg,net)=>{const ad=new Uint8Array(net.NV);net.ad=ad;for(let v=0;v<net.NV;v++){const w=uv.get(KEY(net.CB[v*3]+rg.x0,net.CB[v*3+1]+rg.y0,net.CB[v*3+2]+rg.z0));if(w===undefined)continue;
    net.P[v*3]=un.P[w*3]+U.x0-rg.x0;net.P[v*3+1]=un.P[w*3+1]+U.y0-rg.y0;net.P[v*3+2]=un.P[w*3+2]+U.z0-rg.z0;for(let t=0;t<3;t++)net.N[v*3+t]=un.N[w*3+t];ad[v]=1;}
    // the panel's cut edge (its own vertices next to adopted ones) is kept at least 3.5 mm under the shared surface, so no corner of it shows through the paint
    const nb=new Map();for(let q=0;q<net.Q.length;q+=4)for(let e=0;e<4;e++){const a=net.Q[q+e],b=net.Q[q+(e+1)%4];if(ad[a]!==ad[b]){const u=ad[a]?b:a,o=ad[a]?a:b;(nb.get(u)||nb.set(u,new Set()).get(u)).add(o);}}
    for(const [u,os] of nb){const n=[0,0,0],c=[0,0,0];for(const o of os)for(let t=0;t<3;t++){n[t]+=net.N[o*3+t];c[t]+=net.P[o*3+t]/os.size;}const l=Math.hypot(...n)||1;
      const d=[0,1,2].reduce((s_,t)=>s_+(net.P[u*3+t]-c[t])*n[t]/l,0);if(d>-.35)for(let t=0;t<3;t++)net.P[u*3+t]-=n[t]/l*(d+.35);}};
  // shut lines: the edges of the one surface where an outer quad of a moving panel meets an outer quad of another panel, chained, smoothed along the chain
  // (the cell stairs of a diagonal join become one straight line), lifted 1 mm off the paint; a 4 mm dark ribbon plus a one-pixel line so it reads at any
  // distance. Each line rides with its moving panel.
  const seams={},paneQ={};{const {Q,CB,P:UP,N:UN,NV}=un,qOwn=new Array(Q.length/4),ek=new Map();
    for(let q=0;q<Q.length;q+=4){const c=[0,1,2,3].map(e=>Q[q+e]);let ax=-1;for(let a=0;a<3;a++)if(c.every(v=>CB[v*3+a]===CB[c[0]*3+a])){ax=a;break;}if(ax<0)continue;
      const cell=[0,1,2].map(a=>a===ax?CB[c[0]*3+a]:Math.max(...c.map(v=>CB[v*3+a])));const o0=[U.x0,U.y0,U.z0],A=cell.map((v,a)=>v+o0[a]),B=A.slice();B[ax]+=1;
      let sol=A,emp=B;if(U.get(...A)<0){sol=B;emp=A;}if(U.get(...sol)<0||!out_(...emp))continue;const o=owner.get(KEY(...sol));if(!o)continue;qOwn[q/4]=o;
      if(/Glass|panorama/.test(o)){(paneQ[o]=paneQ[o]||[]).push(q);continue;}
      for(let e=0;e<4;e++){const a=c[e],b=c[(e+1)%4],k=Math.min(a,b)*NV+Math.max(a,b);(ek.get(k)||ek.set(k,[]).get(k)).push(o);}}
    const adj=new Map(),add=(a,b,n)=>{(adj.get(a)||adj.set(a,[]).get(a)).push([b,n]);};
    for(const [k,os] of ek){if(os.length!==2||os[0]===os[1])continue;const mv=os.filter(o=>MOVING.test(o));if(!mv.length)continue;
      const n=mv.find(o=>/^door/.test(o))||mv.find(o=>/^rdoor/.test(o))||mv[0],a=Math.floor(k/NV),b=k%NV;add(a,b,n);add(b,a,n);}
    const done=new Set(),pos=v=>[UP[v*3]+U.x0,UP[v*3+1]+U.y0,UP[v*3+2]+U.z0];
    for(const [start] of adj){for(const [nb,n] of adj.get(start)){const ek2=Math.min(start,nb)*NV+Math.max(start,nb);if(done.has(ek2))continue;
      // walk both ways from this edge along edges of the same panel
      const chain=[start,nb];done.add(ek2);
      for(const dir of [1,0]){for(;;){const end=dir?chain[chain.length-1]:chain[0],prev=dir?chain[chain.length-2]:chain[1];const nx=(adj.get(end)||[]).find(([w,m])=>m===n&&w!==prev&&!done.has(Math.min(end,w)*NV+Math.max(end,w)));
        if(!nx)break;done.add(Math.min(end,nx[0])*NV+Math.max(end,nx[0]));if(dir)chain.push(nx[0]);else chain.unshift(nx[0]);if(nx[0]===chain[dir?0:chain.length-1])break;}}
      let p=chain.map(pos);const nrm=chain.map(v=>[UN[v*3],UN[v*3+1],UN[v*3+2]]);
      for(let it=0;it<8;it++)p=p.map((q,i)=>i===0||i===p.length-1?q:q.map((x,a)=>.5*x+.25*(p[i-1][a]+p[i+1][a])));
      p=p.map((q,i)=>q.map((x,a)=>x+nrm[i][a]*.12));(seams[n]=seams[n]||[]).push({p,nrm});}}}
  // each pane's outer quads of the one surface, in body cells (the glazing stage draws the closed pane with them)
  build.mxPane={};for(const n in paneQ){const pos=[],idx=[],m=new Map();for(const q of paneQ[n]){const id=[0,1,2,3].map(e=>{const v=un.Q[q+e];if(!m.has(v)){m.set(v,pos.length/3);pos.push(un.P[v*3]+U.x0,un.P[v*3+1]+U.y0,un.P[v*3+2]+U.z0);}return m.get(v);});
    idx.push(id[0],id[1],id[2],id[0],id[2],id[3]);}build.mxPane[n]={pos,idx};}
  const seamMat=new THREE.MeshBasicMaterial({color:0x34373c,side:THREE.DoubleSide}),seamLine=new THREE.LineBasicMaterial({color:0x4a4e54});
  const seamMeshes=(list)=>{const pos=[],idx=[],lp=[];for(const {p,nrm} of list){for(let i=0;i<p.length;i++){const a=p[Math.max(0,i-1)],b=p[Math.min(p.length-1,i+1)],t=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],n=nrm[i];
      let sx=t[1]*n[2]-t[2]*n[1],sy=t[2]*n[0]-t[0]*n[2],sz=t[0]*n[1]-t[1]*n[0];const l=Math.hypot(sx,sy,sz)||1,w=.2/l;sx*=w;sy*=w;sz*=w;const k=pos.length/3;
      pos.push(p[i][0]-sx,p[i][1]-sy,p[i][2]-sz,p[i][0]+sx,p[i][1]+sy,p[i][2]+sz);if(i)idx.push(k-2,k-1,k+1,k-2,k+1,k);if(i)lp.push(...p[i-1],...p[i]);}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);
    const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(lp,3));return [new THREE.Mesh(g,seamMat),new THREE.LineSegments(lg,seamLine)];};
  for(const [name,grid] of Object.entries(grids)){const grp=new THREE.Group();grp.scale.setScalar(.5);body.add(grp);P[name]=grp;
    const rg=drawn[name]||grids._render[name]||grid,net=surfaceNet(rg,{snap:{inside:MX.solidAt,scale:.5}});   // rg: the drawn cells (a seal strip may close a mechanical relief); the checks keep the panel's own cells
    if(drawn[name])adopt(rg,net);
    // v2.2: a panel's inner side (its quads facing an empty cell INSIDE the body's measured volume: the cabin, the frunk, behind the bumpers) is drawn in
    // the interior trim's dark grey, not paint (white stairs showed on the A-pillars from the seats). Cut edges against another panel keep their colour.
    if(drawn[name]){const {Q,CB,QC}=net;for(let q=0;q<Q.length;q+=4){const c=[Q[q],Q[q+1],Q[q+2],Q[q+3]];let ax=-1;for(let a=0;a<3;a++)if(c.every(v=>CB[v*3+a]===CB[c[0]*3+a])){ax=a;break;}if(ax<0)continue;
      const o0=[rg.x0,rg.y0,rg.z0],A=[0,1,2].map(a=>(a===ax?CB[c[0]*3+a]:Math.max(...c.map(v=>CB[v*3+a])))+o0[a]),B=A.slice();B[ax]+=1;const emp=rg.get(...A)<0?A:B;
      if(owner.has(KEY(...emp))&&owner.get(KEY(...emp))!==name&&c.every(v=>net.ad[v]))QC[q>>2]=-2;   // a cut-edge face lying wholly on the shared surface (a stair corner of a join): not drawn, it showed as dark diamonds
      else if(!out_(...emp)&&!owner.has(KEY(...emp))&&!lampOf.has(QC[q>>2]))QC[q>>2]=0x2b2f34;}}
    const a=bufGeo(Object.assign(netGeo(rg,net,1),{src:grid}));if(a)grp.add(new THREE.Mesh(a,matPaint));
    const rest=Object.assign(cut(rg,net,c=>c!==-2&&!isPaint(c)&&!lampOf.has(c)),{src:grid,sel:2});
    if(!rest.idx.length)rest.idx=[0,0,0],rest.pos=[0,0,0],rest.nor=[0,1,0],rest.col=[0,0,0];   // a panel of paint and lamps only: an empty rest mesh still carries its cells for the checks
    const b=bufGeo(rest);if(b)grp.add(new THREE.Mesh(b,matV));
    if(seams[name])for(const m of seamMeshes(seams[name]))grp.add(m);   // the shut lines along this panel's joins
    const lamps=new Map();for(const c of new Set(grid.d))if(lampOf.has(c))lamps.set(lampOf.get(c),true);
    for(const lg of lamps.keys()){const cols=new Set(MX_LAMP_GROUPS[lg].map(k=>MX_LAMP[k])),d=cut(rg,net,c=>cols.has(c));if(!d.idx.length)continue;
      const geo=bufGeo(d);geo.userData={};const m=new THREE.Mesh(geo,matV);grp.add(m);(P[lg]=P[lg]||[]).push(m);}}
  SKIN.mode=oldSkin;
});
stage('Adding shell trim and exterior fittings',()=>{
  const oldSkin=SKIN.mode;SKIN.mode='net';
  // DESIGN dimensions traced from the five supplied photographs, not factory drawings.
  const used=new Set();for(const g of Object.values(build.mx))for(const p of g.list())used.add(p.slice(0,3).join(','));
  const detail=(name,grids)=>{const cells=[];for(const g of grids)for(const p of g.list()){const key=p.slice(0,3).join(',');if(!used.has(key)){used.add(key);cells.push(p);}}
    const g=mxGrid(cells);build.mx[name]=g;P[name]=paintable(g,body,matPaint,.5,true);};
  for(const sd of [-1,1]){
    const side=sd<0?'L':'R';
    detail('mirror'+side,mxMirror(sd));
    for(const [key,s] of [['front',2680],['rear',2910]]){const x=MX.origin-s,z=sd*MX.half(s,1050);detail(key+'Handle'+side,[mxBox(x-95,x+95,1040,1060,z-sd*10,z+sd*10,0x22262a)]);}
  }
  detail('plateF',mxPlateF(MX));
  detail('plateR',mxPlateR(MX));
  detail('spoiler',mxSpoilerUp(MX));   // v2.3: the Plaid spoiler, raised as in the owner's photo
  detail('chmsl',mxChmsl(MX));
  SKIN.mode=oldSkin;
});
stage('Hinging front doors, falcon wings, frunk and liftgate',()=>{
  // DESIGN pivots in body mm. Patent US 8,511,738 B2 Fig. 2 establishes
  // upper/lower articulation only; it supplies no pivot dimensions or timing.
  const move=(name,parent,pivot)=>{const m=P[name];if(!m)return;parent.add(m);m.position.set(...pivot.map(v=>-v/20));};
  const hinge=(name,pivot)=>{const mesh=P[name],g=group(body,...pivot.map(v=>v/20));g.add(mesh);mesh.position.set(...pivot.map(v=>-v/20));P[name]=g;return g;};
  for(const sd of [-1,1]){
    const side=sd<0?'L':'R',h=MODELX_M.frontHinge.map((v,i)=>i===2?v*sd:v),d=hinge('door'+side,h);
    for(const n of ['door'+side+'Glass','mirror'+side,'frontHandle'+side])move(n,d,h);
    const root=MODELX_M.roofHinge.map((v,i)=>i===2?v*sd:v),elbow=MODELX_M.elbow.map((v,i)=>i===2?v*sd:v);
    const lowerSkin=P['rdoor'+side],upperSkin=P['rupper'+side],g=group(body,...root.map(v=>v/20));
    // v2: the elbow hinge line is tilted to follow the seam: e (at the elbow) > A (tilt) > F (the fold, rotation.x) > B (untilt) > lower section
    const e=group(g,...elbow.map((v,i)=>(v-root[i])/20)),A=group(e);A.rotation.z=MODELX_M.elbowTilt;const Fo=group(A);build['elbow'+side]=Fo;
    const Bi=group(Fo);Bi.rotation.z=-MODELX_M.elbowTilt;build['elbowIn'+side]=Bi;
    Bi.add(lowerSkin);lowerSkin.position.set(...elbow.map(v=>-v/20));
    P['rdoor'+side]=g;delete P['rupper'+side];P['rdoor'+side+'Upper']=upperSkin;
    move('rdoor'+side+'Upper',g,root);
    for(const n of ['rdoor'+side+'Glass','rearHandle'+side])move(n,Bi,elbow);
  }
  const hh=[1222,1190,0],th=[-1510,1550,0];hinge('hood',hh);const trunk=hinge('trunk',th);   // v2: the hood pivots on its rear edge's top (1245 from the nose), a 25 mm gap ahead of the windshield
  for(const n of ['trunkGlass','plateR','chmsl','spoiler'])move(n,trunk,th);   // v2.1: the liftgate's lamps are cut from its own skin and ride with it
  {const b=mk(mxBadgePlaid(MX),matV,0,trunk,.25);if(b){b.position.set(...th.map(v=>-v/20));P.badgePlaid=b;(P.badges=P.badges||[]).push(b);}}   // PLAID lettering rides on the liftgate; the Badges switch hides it
});
stage('Connecting physical panel hinges',()=>{
  // DESIGN hardware. Fixed brackets reach existing structure; moving leaves
  // reach their panel. Pin/knuckle contact is measured, never a body exemption.
  const occupied=Object.values(build.mx),col=0x444e57;
  const combine=grids=>mxGrid(grids.flatMap(g=>g.list()));
  const tube=(a,b,r=10,c=col)=>mxTube(a,b,r,c),rk=0x161a20;   // v2.2: hardware on the black roof is black (the pins showed as grey crosses on it)
  const fixed=(name,grids)=>{const g=combine(grids);for(const [x,y,z] of g.list())if(occupied.some(o=>o.get(x,y,z)>=0))g.set(x,y,z,-1);P[name]=mk(g,matV,0,body,.5);};
  // Hinge leaves are mechanical parts, not the closed panel area used by the
  // doorway test. The supplemental sweep checks EVERY moving leaf against all parts.
  const leaf=(name,parent,pivot,grids,skins)=>{const g=combine(grids);
    for(const [x,y,z] of g.list())if(skins.some(n=>build.mx[n]&&build.mx[n].get(x,y,z)>=0))g.set(x,y,z,-1);
    const m=mk(g,matV,0,parent,.5);m.position.set(...pivot.map(v=>-v/20));P[name]=m;};
  for(const sd of [-1,1]){
    const side=sd<0?'L':'R',h=MODELX_M.frontHinge.map((v,i)=>i===2?v*sd:v),F=[],D=[];
    for(const y of [700,950]){const a=[h[0],y,h[2]];
      F.push(tube([1030,y,sd*(Math.floor(MX.half(MX.m(1030),y)/10)*10-10)],a,8,0x2a2d31),tube([a[0],y-15,a[2]],[a[0],y+15,a[2]],5,0x2a2d31));   // v2: the leaves end on their own skins
      D.push(tube(a,[970,y,sd*(Math.floor(MX.half(MX.m(970),y)/10)*10-10)],8,0x2a2d31));
    }
    fixed('frontHinge'+side,F);leaf('frontLeaf'+side,P['door'+side],h,D,['door'+side,'door'+side+'Glass']);
    const root=MODELX_M.roofHinge.map((v,i)=>i===2?v*sd:v),elbow=MODELX_M.elbow.map((v,i)=>i===2?v*sd:v);
    // Upper roof skin and its hinge leaves share one QA part, like the lower skin.
    const old=P['rdoor'+side+'Upper'],upper=group(P['rdoor'+side]);upper.add(old);P['rdoor'+side+'Upper']=upper;
    const B=[],U=[],E=[];
    for(const x of [-560,-840]){
      const a=[x,root[1],root[2]],e=[x,elbow[1]+(x-elbow[0])*Math.tan(MODELX_M.elbowTilt),elbow[2]],s=MX.m(x);
      B.push(tube([x,Math.floor(MX.top(s,260)/10)*10,sd*260],a,5,rk),tube([x-15,a[1],a[2]],[x+15,a[1],a[2]],5,rk));   // v2.2: one-cell rods (they stood 30 mm proud of the roof as 16 mm tubes)
      U.push(tube(a,[x,Math.floor(MX.top(s,360)/10)*10-10,sd*360],5,rk),tube([x,Math.floor(MX.top(s,MODELX_M.seamZ-10)/10)*10-10,sd*(MODELX_M.seamZ-10)],e,8,rk),tube([x-15,e[1],e[2]],[x+15,e[1],e[2]],5,rk));
      E.push(tube(e,[x,1500,sd*(Math.floor(MX.half(s,1500)/10)*10-10)],8,rk));
    }
    fixed('roofHinge'+side,B);leaf('falconUpperLeaf'+side,upper,root,U,['rupper'+side,'rdoor'+side,'rdoor'+side+'Glass']);   // v2: its elbow pins stop at the lower section's frame (the hinge line runs along the seam)
    leaf('falconLowerLeaf'+side,build['elbowIn'+side],elbow,E,['rdoor'+side,'rdoor'+side+'Glass']);
  }
  for(const [name,pivot,ax,mx] of [['hood',[1222,1190,0],1195,1260],['trunk',[-1510,1550,0],-1490,-1540]]){
    const F=[],D=[];
    for(const sd of [-1,1]){const z=sd*(name==='hood'?600:550),a=[pivot[0],pivot[1],z];
      F.push(tube([ax,Math.floor(MX.top(MX.m(ax),z)/10)*10-10,z],a,8),tube([a[0],a[1],z-15],[a[0],a[1],z+15],5));
      D.push(tube(a,[mx,Math.floor(MX.top(MX.m(mx),z)/10)*10-10,z],8));
    }
    fixed(name+'Hinge',F);leaf(name==='trunk'?'liftgateLeaf':'hoodLeaf',P[name],pivot,D,[name,name+'Glass']);
  }
});
function setWheels(){
  for(const W of Object.values(wheels))carRoot.remove(W.c);
  const w=G.cfg.wheel;
  for(const [name,x,sd,rear] of [['FL',MX.AX_F,-1,false],['FR',MX.AX_F,1,false],['RL',MX.AX_R,-1,true],['RR',MX.AX_R,1,true]]){
    // VERIFIED staggered dimensions and track, DESIGN 15 mm static tyre deflection.
    const tw=rear?(w.dia===22?285:275):265,ar=rear?(w.dia===22?35:45):w.ar,width=rear?10:9;
    const y=(w.dia*25.4/2+tw*ar/100-15)/20,z=sd*(rear?1710:1705)/40;
    const S=mxSuspension(rear),c=group(carRoot),st=group(c),off=group(st,0,S.hubLocalY/20,sd*S.hubLocalZ/20),sp=group(off),local=group(sp);
    off.rotation.x=-sd*Math.atan2(-20,280); // Upright inclination is not static wheel camber.
    if(sd<0)local.rotation.y=Math.PI;
    const tireLocal=group(off);if(sd<0)tireLocal.rotation.y=Math.PI;
    const tireGrid=mxWheelGrid(w.dia,width,tw,ar,'tire',rear),tire=mk(tireGrid,matV,0,tireLocal,.5);
    const rim=mk(mxWheelGrid(w.dia,width,tw,ar,'rim',rear),matV,0,local,.5);
    const fixed=group(off);if(sd<0)fixed.rotation.y=Math.PI;
    const rot=mk(mxWheelGrid(w.dia,width,tw,ar,'rotor',rear),matV,0,fixed,.5);
    const kn=mk(mxUpright(S,sd),matV,0,st,.5),cal=mk(mxCaliper(rear,sd),matV,0,fixed,.5);
    const bottom=new Map();for(const [i,j,k] of tireGrid.list()){const key=i+','+k;if(!bottom.has(key)||j<bottom.get(key)[1])bottom.set(key,[i,j,k]);}
    const contact=[...bottom.values()].map(p=>new THREE.Vector3(...p.map(v=>v*.5)));
    wheels[name]={c,st,off,sp,tire,rim,rot,kn,cal,sd,steer:!rear,S,hubHeight:y,contact};
  }
}
stage('Fitting staggered wheels and chassis rails',()=>{
  setWheels();
  const own=build.mx.bodyMesh;
  const trim=g=>{for(const [x,y,z] of g.list())if(own.get(x,y,z)>=0)g.set(x,y,z,-1);return g;};
  const rails=[];
  for(const sd of [-1,1]){const cells=[];for(let x=-1900;x<=1900;x+=10){const nearAxle=Math.abs(x)>1000,z=sd*(nearAxle?(x>0?420:480):600);for(const p of mxBox(x,x,330,350,z-20,z+20,0x353a40).list())cells.push(p);}
    for(const x of [-1000,1000])for(const p of mxBox(x-10,x+10,330,350,sd*400,sd*620,0x353a40).list())cells.push(p);
    rails.push(mk(trim(mxGrid(cells)),matV,0,body,.5));}
  P.rails=rails;
});
stage('Packaging three motors and the floor battery',()=>{
  // ECE 314/309/309 kW VERIFIED; total 761 kW, not the sum. Geometry DESIGN.
  const parts={batteryPack:mxBattery(),motorF:mxMotor(1280,500,0,160,420),
    motorRL:mxMotor(-1480,510,-310,140,320),motorRR:mxMotor(-1480,510,310,140,320),
    reductionF:mxBox(1450,1670,340,550,-120,120,0x626c73),
    reductionRL:mxBox(-1570,-1390,360,540,-530,-480,0x626c73),
    reductionRR:mxBox(-1570,-1390,360,540,480,530,0x626c73)};
  for(const [name,g] of Object.entries(parts)){P[name]=mk(g,matV,0,body,.5);build.mx[name]=g;}
  // Physical mounting crossmembers terminate against housings/floor/rails.
  const occupied=Object.values(build.mx).concat(P.rails.map(m=>m.geometry.userData.src));
  const mountCells=[];
  const bars=[mxBox(1250,1310,330,350,-450,450,0x343c43),
    mxBox(-1520,-1440,350,370,-400,-220,0x343c43),mxBox(-1520,-1440,350,370,220,400,0x343c43)];
  for(const g of bars)for(const p of g.list())if(!occupied.some(o=>o.get(...p.slice(0,3))>=0))mountCells.push(p);
  P.driveMounts=mk(mxGrid(mountCells),matV,0,body,.5);
});
stage('Articulating control arms, air springs and half-shafts',()=>{
  P.links=[];const brackets=[];
  const link=(parent,r=14,col=0x66727b)=>mk(mxLinkGrid(r,col),matV,0,parent,.5);
  for(const [nm,W] of Object.entries(wheels)){
    const S=W.S,sd=W.sd,L={nm,lower:group(carRoot),upper:group(carRoot)};
    L.lower.userData.legs=[link(L.lower),link(L.lower),link(L.lower)];L.upper.userData.legs=[link(L.upper,12),link(L.upper,12)];
    L.rod=link(carRoot,10);L.shaft=link(carRoot,12,0x49535b);L.air=link(carRoot,40,0x242c32);L.damper=link(carRoot,13,0xabb6bc);L.drop=link(carRoot,10);L.barArm=link(carRoot,12,0x4e5c67);
    P.links.push(L);
    // Chassis bush brackets: two lower clevises, two upper towers and air-spring top cap.
    for(const sg of [-1,1]){
      brackets.push(mxBox(S.ax+sg*S.lowSpan-15,S.ax+sg*S.lowSpan+15,280,350,sd*(S.zi-20),sd*(W.steer?480:520),0x3e4850));
      brackets.push(mxBox(S.ax+sg*S.upSpan-20,S.ax+sg*S.upSpan+20,350,690,sd*(S.zu-20),sd*(S.zu+20),0x3e4850));
      brackets.push(mxBox(S.ax+sg*S.upSpan-20,S.ax+sg*S.upSpan+20,350,370,sd*S.zu,sd*540,0x3e4850));
    }
    brackets.push(mxBox(S.ax-S.upSpan-20,S.ax+S.upSpan+20,690,710,sd*(W.steer?430:S.zu),sd*590,0x3e4850));
    brackets.push(mxBox(S.ax-(W.steer?400:340),S.ax-(W.steer?360:300),350,W.steer?430:380,sd*(W.steer?410:450),sd*(W.steer?460:480),0x3e4850));
    if(!W.steer)brackets.push(mxBox(S.ax+280,S.ax+320,300,350,sd*460,sd*500,0x3e4850));
  }
  for(const sd of [-1,1]){brackets.push(mxBox(1210,1240,320,350,sd*390,sd*410,0x3e4850));brackets.push(mxBox(1210,1240,330,350,sd*400,sd*500,0x3e4850));}
  const occupied=Object.values(build.mx).concat(P.rails.map(m=>m.geometry.userData.src),[P.driveMounts.geometry.userData.src]);
  const cells=[];for(const b of brackets)for(const p of b.list())if(!occupied.some(g=>g.get(...p.slice(0,3))>=0))cells.push(p);
  P.suspMounts=mk(mxGrid(cells),matV,0,body,.5);
  for(const rear of [false,true]){const S=mxSuspension(rear),list=[],barY=rear?380:430,barX=S.ax-(rear?320:380),barZ=rear?470:430;
    for(const b of [mxTube([barX,barY,-barZ],[barX,barY,barZ],12,0x4e5c67)])for(const p of b.list())list.push(p);
    P['stabilizer'+(rear?'R':'F')]=mk(mxGrid(list),matV,0,body,.5);
  }
  P.rack=group(body);const housing=mxBox(1210,1240,290,320,-450,450,0x505d67);
  for(const [x,y,z] of housing.list())if(x>121&&x<124&&y>29&&y<32)housing.set(x,y,z,-1);
  mk(housing,matV,0,P.rack,.5);build.rackBar=mk(mxBox(1220,1230,300,310,-450,450,0x89959e),matV,0,P.rack,.5);
});
stage('Fitting six seats, dashboard and storage',()=>{
  // VERIFIED six-seat layout. All dimensions/positions below are DESIGN mm.
  const combine=gs=>mxGrid(gs.flatMap(g=>g.list())),dark=0x272d33,ivory=0xe6e3dc,wood=0x6e4a30,wood2=0x7c5639,blk=0x1b1f24;   // v2.2 trim from the owner's interior photo: cream, walnut, black
  const part=(name,gs,parent=body,pivot)=>{const m=mk(combine(gs),matV,0,parent,.5,0);if(pivot)m.position.set(...pivot.map(v=>-v/20));P[name]=m;return m;};
  // Carpet terminates on the existing metal floor; no hidden attachment bridges.
  const floorObstacles=[...Object.values(build.mx),...P.rails.map(m=>m.geometry.userData.src),P.driveMounts.geometry.userData.src,P.suspMounts.geometry.userData.src];
  // v2.5: the carpet is laid on the floor only (the floor's cells, 0x30353b) and stays 40 mm inside the body's outer surface, clear of the wheel arches.
  // It copied EVERY body cell 340 up, so it also ran along the rear quarters' and the bumper's skin and into the front of the rear arches, and its
  // edge showed outside the car (gap scan, Nov 13)
  const inBody=(x,z)=>[1,2,3,4].every(d=>[[0,1],[1,1],[-1,1],[1,0],[-1,0],[1,-1],[-1,-1]].every(([dx,dz])=>MX.solidAt((x+dx*d)*.5,35*.5,(z+Math.sign(z||1)*dz*d)*.5)));   // 40 mm of body round it, outboard, fore and aft (the arches' edges)
  part('carpet',[mxGrid(build.mx.bodyMesh.list().filter(p=>p[1]===34&&p[0]<103&&p[3]===0x30353b).map(([x,y,z])=>[x,35,z,0x23282d]).filter(([x,y,z])=>!floorObstacles.some(g=>g.get(x,y,z)>=0)&&inBody(x,z)))]);
  const seat=(name,x,z,w,y,top)=>{
    // v2 (Opus): contoured seats in place of stacked boxes. Cushion with a raised front edge and side bolsters, a backrest reclined 22 degrees with wings,
    // a rounded top and a separate headrest on two posts. Proportions DESIGN from the interior photos; positions and heights unchanged (Astra's fit).
    const cells=[],put=(px,py,pz,c)=>cells.push([Math.round(px/10),Math.round(py/10),Math.round(pz/10),c]),hw=w/2,third=y>700,lean=Math.tan((third?10:22)*Math.PI/180);   // the third row sits more upright and thinner, ahead of the cargo cover's cassette
    for(let dx=-180;dx<=200;dx+=10)for(let dz=-hw;dz<=hw;dz+=10){const az=Math.abs(dz),edge=hw-az,bol=edge<70?30*(1-edge/70):0,front=dx>140?15*(dx-140)/60:0;
      const t=y+80+bol+front-(dx>185?10:0);for(let py=y;py<=t;py+=10)put(x+dx,py,z+dz,py>t-12?(edge<70?dark:ivory):dark);}            // cushion
    const bh=top-y-260;   // backrest height above the cushion (to the headrest gap)
    for(let h=0;h<=bh;h+=10){const fx=x-190-h*lean,th=(third?70:110)-(h<bh*.6?0:30*(h-bh*.6)/(bh*.4)),wing=h>60&&h<bh*.75?40:0,ww=hw-(h>bh-60?(h-(bh-60))*.9:0);
      for(let dz=-ww;dz<=ww;dz+=10){const az=Math.abs(dz),edge=ww-az,f=fx+(edge<60?wing*(1-edge/60):0);
        for(let d=0;d<=th;d+=10)put(f-d,y+90+h,z+dz,d<12?(edge<60?dark:ivory):dark);}}                                                     // backrest
    const hy=y+90+bh+40,hx=x-190-(bh+40)*lean;
    for(let h=0;h<=170;h+=10)for(let dz=-130;dz<=130;dz+=10){const az=Math.abs(dz),r=Math.max(0,az-80)**2+Math.max(0,Math.abs(h-85)-45)**2;if(r>2500)continue;
      for(let d=0;d<=80;d+=10)put(hx-h*lean*.5-d,hy+h,z+dz,d<12?ivory:dark);}                                                                // headrest
    for(const sd of [-1,1])for(let h=-50;h<=40;h+=10)put(hx-40-(h)*lean*.5,hy+h,z+sd*70,0x9aa2a8);                                           // its two posts
    const gs=[mxGrid(cells)];
    for(const sd of [-1,1]){
      gs.push(mxBox(x-(y>700?240:180),x+(y>700?-160:160),360,390,z+sd*(w/2-70)-15,z+sd*(w/2-70)+15,dark));
      gs.push(mxBox(x-160,x-120,400,y-10,z+sd*(w/2-70)-15,z+sd*(w/2-70)+15,dark));
    }
    P[name]=paintable(combine(gs),body,matPaint,.5);
  };
  for(const sd of [-1,1]){
    const s=sd<0?'L':'R';seat('seatFront'+s,180,sd*470,460,550,1340);
    seat('seatMiddle'+s,-710,sd*470,460,590,1350);
    seat('seatRear'+s,-1680,sd*270,380,790,1240);
  }
  // DESIGN inner cards follow their own lower door skin, with a 30 mm liner.
  // Narrow end margins preserve the tested seal/hinge sweep clearances.
  P.doorCards=[];
  for(const sd of [-1,1])for(const rear of [false,true]){
    const side=sd<0?'L':'R',name=(rear?'rdoor':'door')+side,inner=new Map();
    const xMin=rear?-1430:-260,xMax=rear?-390:920;
    for(const [x,y,z] of build.mx[name].list())if(x*10>=xMin&&x*10<=xMax&&y>=48&&y<=101&&(!rear||Math.hypot(x*10+1482.5,y*10-360)>530)){
      const key=x+','+y;inner.set(key,Math.min(inner.get(key)||Infinity,Math.abs(z)));
    }
    const cells=[];for(const [key,z] of inner){const [x,y]=key.split(',').map(Number);
      for(let d=1;d<=3;d++)cells.push([x,y,sd*(z-d),y>=95?blk:y>=58?ivory:dark]);}   // v2.2 (interior photo): black sill, cream panel, dark pocket
    const m=mk(mxGrid(cells),matV,0,rear?build['elbowIn'+side]:P[name],.5,0);
    const pivot=(rear?MODELX_M.elbow:MODELX_M.frontHinge).map((v,i)=>i===2?v*sd:v);m.position.set(...pivot.map(v=>-v/20));P.doorCards.push(m);
  }
  // v2.2 (owner's interior photo, 2022 Model X): the dash in horizontal layers across the car: a deep black top under the windshield, a walnut band
  // (grain: alternating tone every 30 mm), a cream band below it, and the black lower dash recessed for the knees (clear of the pedals). Sizes DESIGN.
  const grain=(x0,x1,y0,y1,z0,z1)=>{const cells=[];for(let z=Math.ceil(z0/10);z<=Math.floor(z1/10);z++)for(let x=Math.ceil(x0/10);x<=Math.floor(x1/10);x++)for(let y=Math.ceil(y0/10);y<=Math.floor(y1/10);y++)cells.push([x,y,z,(Math.floor(z/3)+(y%2))%2?wood:wood2]);return mxGrid(cells);};
  part('dash',[mxBox(700,1020,1010,1030,-850,850,blk),grain(660,700,970,1010,-860,860),mxBox(690,730,890,960,-860,860,ivory),mxBox(700,1020,960,1000,-850,850,blk),
    mxBox(740,880,640,880,-860,860,dark),mxBox(880,1020,800,880,-860,860,dark)]);
  // the centre console is a bridge (photo): walnut top from the dash back to the cream armrest, black body under it with an open bay, two charging pads.
  part('console',[mxBox(-250,560,360,560,-150,150,dark),mxBox(-250,730,560,640,-150,-140,dark),mxBox(-250,730,560,640,140,150,dark),mxBox(560,730,560,640,-150,150,dark),
    mxBox(20,730,650,660,-130,130,blk),grain(20,730,620,660,-150,-140),grain(20,730,620,660,140,150),mxBox(-250,20,640,710,-150,150,ivory),mxBox(380,560,661,661,-120,-20,0x30363c),mxBox(380,560,661,661,20,120,0x30363c)]);   // gloss-black top, walnut along both edges (photo)
  part('column',[mxTube([450,950,-470],[668,950,-470],18,0x1b1f24)]);   // v2.2: reaches the dash's cream band (690)
  P.swheel=group(body,430/20,950/20,-470/20);
  // Open-top yoke, not the round-wheel option introduced later.
  P.swm=mk(combine([mxBox(-20,0,-50,40,-65,65,dark),mxBox(-20,0,-100,-60,-170,170,dark),
    mxBox(-20,0,-50,-50,-160,160,dark),mxBox(-20,0,-50,100,-180,-150,dark),mxBox(-20,0,-50,100,150,180,dark)]),matV,0,P.swheel,.5,0);
  // Pedals visibly respond to the real throttle/brake. Hinged from firewall.
  for(const [name,z,width] of [['gas',-350,60],['brake',-530,120]]){
    const pivot=[1010,740,z],g=group(body,...pivot.map(v=>v/20));P['ped_'+name]=g;
    const m=mk(combine([mxTube([0,0,0],[-100,-160,0],12,dark),mxBox(-120,-100,-190,-120,-width/2,width/2,0xa3aab1)]),matV,0,g,.5,0);
  }
  // Front bin above the motor/reducer; rear edge meets the firewall, not the hood.
  part('frunkLiner',[mxBox(1040,2050,740,750,-540,540,0x23282e),mxBox(1040,1050,760,940,-540,540,0x23282e),
    mxBox(2040,2050,760,930,-540,540,0x23282e),mxBox(1060,2030,760,930,-540,-530,0x23282e),mxBox(1060,2030,760,930,530,540,0x23282e)]);
  // Retracting DESIGN cover behind row three. Permanent cassette on body floor.
  part('coverCassette',[mxBox(-2040,-2000,360,910,-620,-600,dark),mxBox(-2040,-2000,360,910,600,620,dark),mxBox(-2050,-1990,920,960,-620,620,dark)]);
  P.cover=group(body,-2050/20,940/20,0);cabin.cover=mk(mxBox(-400,-10,-10,0,-590,590,0x343a40),matV,0,P.cover,.5,0);
});
stage('Glazing the cabin and winding four windows',()=>{
  // Eleven exposed-pane positions, as in the AE86. The hidden portion runs
  // inside the door and is not drawn. Curved surface and seals stay in their guides.
  const glass=new THREE.MeshPhongMaterial({color:0x3e5462,transparent:true,opacity:.5,depthWrite:false,side:THREE.DoubleSide,shininess:100});
  glass.userData.glass=true;   // window tint (C-06): the privacy glass, its clone, carries the flag too
  const privacy=glass.clone();privacy.color.setHex(0x1f2d37);privacy.opacity=.74;cabin.materials.push(glass,privacy);
  // A quad only where the source has a pane cell. A single best-fit plane would
  // bridge the disconnected quarter-light strips across the falcon doorway.
  const sidePane=(grid,parent,mat)=>{
    const cols=new Map();for(const [x,y,z] of grid.list()){const k=x+','+y,a=cols.get(k)||[0,0];a[0]+=z;a[1]++;cols.set(k,a);}
    const pos=[],idx=[];
    for(const [key,a] of cols){const [x,y]=key.split(',').map(Number),start=pos.length/3;
      for(const [dx,dy] of [[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]]){
        const near=[];for(const xx of [Math.floor(x+dx),Math.ceil(x+dx)])for(const yy of [Math.floor(y+dy),Math.ceil(y+dy)]){const n=cols.get(xx+','+yy);if(n)near.push(n[0]/n[1]);}
        pos.push(x+dx,y+dy,near.reduce((s,v)=>s+v,0)/near.length);
      }idx.push(start,start+1,start+2,start,start+2,start+3);
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();geo.userData.src=grid;geo.userData.sel=0;
    const m=new THREE.Mesh(geo,mat);parent.add(m);return m;
  };
  for(const name of ['panorama','trunkGlass','quarterGlassL','quarterGlassR','doorLGlass','doorRGlass','rdoorLGlass','rdoorRGlass']){
    const root=P[name],grid=build.mx[name];if(!root||!grid)continue;
    for(const c of root.children.slice()){c.traverse(o=>{if(o.geometry)o.geometry.dispose();});root.remove(c);}
    const cells=grid.list(),pane=cells.filter(p=>p[3]===0x31434c),seal=cells.filter(p=>p[3]!==0x31434c);
    if(seal.length)mk(mxGrid(seal),matV,0,root,1,0);
    const moving=/^(r?door)/.test(name),steps=[];
    const tops=new Map();for(const [x,y] of pane)tops.set(x,Math.max(tops.get(x)||0,y));
    for(let i=0;i<=(moving?10:0);i++){
      const cells=pane.filter(([x,y])=>y<=(tops.get(x)-i*50/10));
      if(!cells.length){steps.push(null);continue;}
      const material=/quarter|rdoor|trunk/.test(name)?privacy:glass;
      const m=/panorama|trunk/.test(name)?G.mkGlassSheet(mxGrid(cells),root,1,MX.solidAt,0,undefined,[1,1,1],material):sidePane(mxGrid(cells),root,material);
      if(m&&i===0&&build.mxPane&&build.mxPane[name]){const d=build.mxPane[name],g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(d.pos,3));g.setIndex(d.idx);g.computeVertexNormals();
        g.userData=m.geometry.userData;m.geometry.dispose();m.geometry=g;m.scale.setScalar(1);m.position.set(0,0,0);}   // v2.2: the closed pane drawn on the body's one surface (flush with its frame); the checks keep its cells
      if(m)m.visible=i===0;steps.push(m);
    }
    if(moving)cabin.windows.push(steps);
  }
});
stage('Connecting the cabin displays',()=>{
  // Display diagonals VERIFIED in spec.md. Active rectangles calculated from
  // 2200:1300 (centre); other aspect ratios, frames, placements and UI are DESIGN.
  const display=(name,pos,w,h,cw,ch,frame)=>{
    const root=group(body,...pos.map(v=>v/20));P[name]=root;
    mk(mxBox(...frame,0x10171e),matV,0,root,.5,0);
    const cv=document.createElement('canvas');cv.width=cw;cv.height=ch;
    const tex=new THREE.CanvasTexture(cv),mat=new THREE.MeshBasicMaterial({map:tex});
    const plane=new THREE.Mesh(new THREE.PlaneGeometry(w/20,h/20),mat);plane.rotation.y=-Math.PI/2;plane.position.x=-6/20;root.add(plane);
    const d={name,root,plane,cv,ctx:cv.getContext('2d'),tex,mat,buttons:[]};cabin.displays.push(d);return d;
  };
  const centre=display('screenCentre',[630,1050,0],371.8,219.7,880,520,[0,20,-120,120,-200,200]);
  display('screenDriver',[710,1110,-470],290,115,700,278,[0,20,-70,70,-160,160]);
  const rear=display('screenRear',[-270,580,0],177,99.6,640,360,[0,10,-60,60,-100,100]);
  const controls=[['Windows','tWin','win',false],['Headlights','tLights','lights',false],['Front left','tDoorL','doorL',true],['Front right','tDoorR','doorR',true],['Falcon doors','tRDoor','rdoorL',true],['Liftgate','tTrunk','trunk',true],['Front storage','tHood','hood',true],['Cargo cover','tCover','cover',true]];
  controls.push(['Wipers','tWip','wipers',false],['Hazards','tHaz','hazard',false]);   // v2: wipers and hazard lights on the screen (DESIGN placement: the hazard switch's real location is not sourced)
  centre.buttons=controls.map(([label,id,key,park],i)=>({label,id,key,park,x:24+(i%2)*428,y:120+Math.floor(i/2)*70,w:404,h:58}));
  rear.buttons=[{label:'Windows',id:'tWin',key:'win',park:false,x:28,y:244,w:584,h:88}];
  cabin.headMat=G.matHead.clone();cabin.tailMat=G.matTailRed.clone();cabin.materials.push(cabin.headMat,cabin.tailMat);
  for(const n of ['headlampL','headlampR'])for(const o0 of [].concat(P[n]||[]))o0.traverse(o=>{if(o.isMesh)o.material=cabin.headMat;});
  for(const n of ['tailLampL','tailLampR','trunkLamp'])for(const o0 of [].concat(P[n]||[]))o0.traverse(o=>{if(o.isMesh)o.material=cabin.tailMat;});
  // Removal is an existing THREE lifecycle event. It fires on switchCar's
  // body.remove(root), so listeners/textures cannot leak into the next car.
  centre.root.addEventListener('removed',()=>{
    if(cabin.detach)cabin.detach();
    for(const d of cabin.displays){d.tex.dispose();d.mat.dispose();}
    for(const m of cabin.materials)m.dispose();
  });
  build.mxCabin={displays:cabin.displays,windows:cabin.windows};
  drawCabin();
});
function drawCabin(){
  const mph=Math.round(Math.abs(state.v||0)*2.23694),battery=Number.isFinite(state.batteryKWh)?state.batteryKWh.toFixed(1):'--';
  const sig=[mph,battery,state.mode,state.gear,...['win','lights','doorL','doorR','rdoorL','rdoorR','trunk','hood','cover'].map(k=>state[k])].join('|');
  if(cabin.displaySig===sig)return;cabin.displaySig=sig;
  for(const d of cabin.displays){
    const c=d.ctx,w=d.cv.width,h=d.cv.height;c.fillStyle='#101923';c.fillRect(0,0,w,h);c.textAlign='left';
    c.fillStyle='#f4f7fa';c.font='bold 34px sans-serif';c.fillText(d.name==='screenCentre'?'CONTROLS':d.name==='screenDriver'?'DRIVER':'REAR CABIN',24,48);
    c.font='28px sans-serif';c.fillStyle='#adbecd';
    if(d.name==='screenDriver'){
      c.font='bold 90px sans-serif';c.fillStyle='#fff';c.fillText(String(mph),30,155);c.font='28px sans-serif';c.fillText('mph',200,155);
      c.fillText(state.mode==='garage'?'P':state.gear===-1?'R':'D',585,155);c.fillStyle='#9eb5c9';c.fillText(battery+' kWh remaining',26,230);
    }else{
      c.fillText(d.name==='screenCentre'?mph+' mph   |   '+battery+' kWh   |   '+(state.mode==='garage'?'PARK':'DRIVE'):battery+' kWh remaining',24,96);
      if(d.name==='screenRear'){c.font='26px sans-serif';c.fillText((state.rdoorL||state.rdoorR)?'Falcon doors open':'Falcon doors closed',28,162);}
      for(const b of d.buttons){const disabled=b.park&&state.mode!=='garage',on=!!state[b.key]||(b.id==='tRDoor'&&state.rdoorR);
        c.fillStyle=disabled?'#222b34':on?'#206988':'#2a3b4d';c.fillRect(b.x,b.y,b.w,b.h);
        c.fillStyle=disabled?'#71808e':'#fff';c.font='28px sans-serif';c.fillText(b.label,b.x+15,b.y+29);
        c.font='20px sans-serif';c.fillStyle=disabled?'#71808e':'#bcd3e2';c.fillText(disabled?'Park to open':on?'ON / tap to close':'OFF / tap to open',b.x+15,b.y+55);
      }
      if(d.name==='screenCentre'){c.font='20px sans-serif';c.fillStyle='#9cb0c2';c.fillText('Tap a control. Drive controls stay on the HUD.',24,500);}
    }
    d.tex.needsUpdate=true;
  }
}
stage('Wiring lamps, signals, wipers and mirrors',()=>{
  // v2 (Opus): every exterior lamp on its own material, so each answers its own control. Functions per the Tesla manual's lighting list (low/high beams,
  // DRLs, tail, side markers, turn signals, hazards; brake lamps). Lamp locations from the photos; which segment does what is NOT VERIFIED unless noted.
  const L=cabin.lamp={},clone=(m,hex)=>{const c=m.clone();if(hex!==undefined&&c.emissive)c.emissive.setHex(hex);cabin.materials.push(c);return c;};
  const wear=(names,mat)=>{for(const n of names)for(const o0 of [].concat(P[n]||[]))o0.traverse(o=>{if(o.isMesh)o.material=mat;});return mat;};   // a lamp may span panels: P[name] is then a list of meshes
  L.drlL=wear(['drlL'],clone(G.matHead,0xffffff));L.drlR=wear(['drlR'],clone(G.matHead,0xffffff));
  L.tailL=wear(['tailLampL'],clone(G.matTailRed));L.tailR=wear(['tailLampR'],clone(G.matTailRed));L.tailC=wear(['trunkLamp'],clone(G.matTailRed));
  L.chmsl=wear(['chmsl'],clone(G.matTailRed));L.rev=wear(['reverseL','reverseR'],clone(G.matTailWht));
  L.repL=wear(['repeaterL'],clone(G.matFrontAmb));L.repR=wear(['repeaterR'],clone(G.matFrontAmb));
  // low beams: two spot lights from the projector lenses (lamp centres s 150, 870 up, |z| 700)
  P.beams=[];for(const sd of [-1,1]){const sl=new THREE.SpotLight(0xfff4e0,0,1600,.45,.5,1);sl.position.set(2320/20,870/20,sd*700/20);carRoot.add(sl);const tg=new THREE.Object3D();tg.position.set(600,4,sd*700/20);carRoot.add(tg);sl.target=tg;P.beams.push(sl);}
  state.signal=0;cabin.sigArmed=false;
  // the yoke (2022 launch yoke, VERIFIED in spec.md): open top, flat bottom, two grips, capacitive buttons on its spokes. Shape DESIGN from photos, 5 mm cells.
  if(P.swm){P.swm.parent.remove(P.swm);P.swm.geometry.dispose();}
  const yc=[],put=(x,y,z,c)=>yc.push([x,y,z,c]),LEA=0x1b1e22,HUB=0x24282d;
  for(let y=-24;y<=14;y++)for(let z=-37;z<=37;z++){const az=Math.abs(z);let c=-1;
    if(az>=29&&az<=37&&y<=14-Math.max(0,az-33)*1.6&&y>=-24)c=LEA;                                   // the grips, rounded over at the top outboard
    if(y>=-24&&y<=-19&&az<=33)c=LEA;                                                                  // the flat lower bar
    if(y>=-7&&y<=0&&az>=11&&az<=29)c=HUB;                                                             // the spokes
    if(y>=-10&&y<=4&&az<=11)c=HUB;                                                                    // the hub
    if(c<0)continue;for(let x=-5;x<=0;x++){if((az>=29||y<=-19)&&(x===-5||x===0)&&((az===29||az===37)||(y===-24||y===-19)))continue;put(x,y,z,c);}}
  P.swm=mk(mxGrid(yc),matV,0,P.swheel,.25,0);
  cabin.yokeButtons=[];const btn=(name,z,y,col,act)=>{const g=mxGrid([0,1].flatMap(dy=>[0,1,2].map(dz=>[-6,y+dy,z+dz,col])));const m=mk(g,matV,0,P.swheel,.25,0);P['yoke_'+name]=m;cabin.yokeButtons.push({mesh:m,act,label:name});return m;};
  // left spoke (the driver's left thumb): left and right signals, high beams flash, wipers (refresh yoke layout; exact order NOT VERIFIED)
  const sig=d=>()=>{state.signal=state.signal===d?0:d;cabin.sigArmed=false;};
  btn('signalLeft',-27,-5,0xd8dde2,sig(-1));btn('signalRight',-23,-5,0xd8dde2,sig(1));btn('wipers',-19,-5,0x9aa6b0,()=>G.$('tWip').click());btn('highBeam',-15,-5,0x7fa7d8,()=>{cabin.flash=.6;});
  // wipers: two blades in tandem parked along the windshield base, sweeping toward the driver's pillar (count and park side DESIGN)
  const ws=build.mx.panorama.list().filter(p=>p[3]===0x31434c&&MX.m(p[0]*10)<1760);
  const gp=ws.length>40?glassPane(mxGrid(ws),{bodies:[build.mx.bodyMesh,build.mx.hood],surf:MX.solidAt,lift:.1}):null;
  if(gp){P.wiperRig=wiperRig(gp,body,[{pivot:12,park:4,arm:52,blade:66,sweep:78,dir:-1},{pivot:72,park:4,arm:48,blade:58,sweep:74,dir:-1}],.5);P.wipers=P.wiperRig.meshes;P.wiperPivots=[];}
  // door mirrors that reflect (HANDOFF section 11): a glass plane on each housing's rear face, riding on its door
  for(const sd of [-1,1]){const side=sd<0?'L':'R',d=P['door'+side],h=MODELX_M.frontHinge.map((v,i)=>i===2?v*sd:v);if(!d)continue;
    const pos=new THREE.Vector3(634/20-h[0]/20,1175/20-h[1]/20,sd*1050/20-h[2]/20);
    G.MIRRORS.push(G.makeMirror(d,pos,140/20,82/20,'mirror'+side,-sd*(sd===-1?12:14)*Math.PI/180,[P['mirror'+side]].filter(Boolean)));}
});
function connectCabin(){
  const canvas=G.$('c'),ray=new THREE.Raycaster(),uv=new THREE.Vector2();let pressed=null;
  const hit=e=>{
    const box=canvas.getBoundingClientRect();uv.set(2*(e.clientX-box.left)/box.width-1,1-2*(e.clientY-box.top)/box.height);
    G.camera.updateMatrixWorld();body.updateWorldMatrix(true,true);ray.setFromCamera(uv,G.camera);
    for(const h of ray.intersectObject(body,true)){
      let visible=true;for(let o=h.object;o;o=o.parent)if(!o.visible){visible=false;break;}if(!visible)continue;
      const yb=(cabin.yokeButtons||[]).find(b=>b.mesh===h.object);if(yb)return yb;   // v2: the yoke's buttons
      const d=cabin.displays.find(d=>d.plane===h.object);
      if(d){const x=h.uv.x*d.cv.width,y=(1-h.uv.y)*d.cv.height;
        return d.buttons.find(b=>x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h)||null;}
      const m=h.object.material;if(m&&m.transparent&&m.opacity<.5)continue;
      return null; // opaque cabin/body blocks the screen; never click through it
    }return null;
  };
  const stop=e=>{e.preventDefault();e.stopImmediatePropagation();};
  const down=e=>{if(e.button!==0)return;const b=hit(e);if(!b)return;pressed={b,x:e.clientX,y:e.clientY,id:e.pointerId};canvas.setPointerCapture(e.pointerId);stop(e);};
  const move=e=>{if(pressed&&pressed.id===e.pointerId)stop(e);};
  const up=e=>{if(!pressed||pressed.id!==e.pointerId)return;const p=pressed;pressed=null;stop(e);
    if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
    if(Math.hypot(e.clientX-p.x,e.clientY-p.y)<=6&&hit(e)===p.b&&(!p.b.park||state.mode==='garage')){if(p.b.act)p.b.act();else G.$(p.b.id).click();drawCabin();}
  };
  const cancel=e=>{if(pressed&&pressed.id===e.pointerId){pressed=null;stop(e);}};
  const events=[['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',cancel]];
  for(const [n,f] of events)canvas.addEventListener(n,f,true);
  cabin.detach=()=>{for(const [n,f] of events)canvas.removeEventListener(n,f,true);pressed=null;};
}
function pre(dt){
  state.drop=0;
  const ease=(k,sp)=>{anim[k]=(anim[k]||0)+((state[k]||0)-(anim[k]||0))*Math.min(1,dt*sp);return anim[k];},rad=Math.PI/180;
  for(const sd of [-1,1]){const side=sd<0?'L':'R';
    P['door'+side].rotation.y=sd*65*rad*ease('door'+side,6);
    const f=ease('rdoor'+side,3);
    P['rdoor'+side].rotation.x=-sd*80*rad*f;
    // DESIGN temporary elbow fold reduces outward sweep, then unfolds overhead.
    build['elbow'+side].rotation.x=sd*25*rad*Math.pow(Math.sin(Math.PI*f),2);   // v2: eased in, so the lower edge clears the sill and arch as the wing starts to rise
  }
  P.hood.rotation.z=65*rad*ease('hood',4);P.trunk.rotation.z=-78*rad*ease('trunk',4);
  const wi=Math.round(ease('win',5)*10);for(const steps of cabin.windows)steps.forEach((m,i)=>{if(m)m.visible=i===wi;});
  if(cabin.cover)cabin.cover.scale.x=.5*Math.max(.025,1-ease('cover',5));
  if(P.swheel){P.swheel.rotation.x=-(state.sw||0);P.swm.visible=!state.swOff;}
  if(P.ped_gas)P.ped_gas.rotation.z=-state.throttle*.25;
  if(P.ped_brake)P.ped_brake.rotation.z=-state.brake*.25;
  // v2 lighting. Low beams with the Headlights control; DRLs on while the car is out of Park or the lights are on; a turn or the hazards turn the DRL of
  // that side amber and flash it with the repeater and the tail light (90 flashes a minute); brake lamps and the third brake lamp answer the pedal; the reversing
  // lamps answer R. Self-cancelling signal: armed once the yoke turns past 25 % toward it, cancelled when it comes back to centre (DESIGN).
  const Lm=cabin.lamp||{},on=!!state.lights,drive=state.mode!=='garage'||on,rev=state.gear===0&&state.mode!=='garage';
  // v2.4: the brake lamps answer the driver's brake (the pedal while moving forward, the throttle while rolling back, or the hand brake), not the
  // simulator's foot-hold at rest (it held them lit at every stop: owner, Nov 12)
  const brk=!!state.brakeLamp;   // the shared signal (garage_core.js): the driver's pedal, keys, touch or controller (was its own copy of the same rule)
  if(cabin.flash>0)cabin.flash-=dt;const high=cabin.flash>0;
  if(state.signal){if(state.steer*-state.signal>.25)cabin.sigArmed=true;else if(cabin.sigArmed&&Math.abs(state.steer)<.05){state.signal=0;cabin.sigArmed=false;}}
  const ph=Math.floor((state.t||0)*3)%2===0,blL=ph&&(state.hazard||state.signal<0),blR=ph&&(state.hazard||state.signal>0),amb=(m,b)=>{if(m&&m.emissive)m.emissive.setHex(b?0xff9a1a:0xffffff);};
  if(cabin.headMat)cabin.headMat.emissiveIntensity=on||high?.85:0;
  for(const b of P.beams||[])b.intensity=on||high?(high?2.4:1.5):0;
  const turnL=state.hazard||state.signal<0,turnR=state.hazard||state.signal>0;
  if(Lm.drlL){amb(Lm.drlL,turnL);Lm.drlL.emissiveIntensity=turnL?(blL?1.5:0):drive?1:0;}
  if(Lm.drlR){amb(Lm.drlR,turnR);Lm.drlR.emissiveIntensity=turnR?(blR?1.5:0):drive?1:0;}
  if(Lm.repL)Lm.repL.emissiveIntensity=blL?1.6:0;if(Lm.repR)Lm.repR.emissiveIntensity=blR?1.6:0;
  const tail=brk?.95:on?.35:.04;
  if(Lm.tailL)Lm.tailL.emissiveIntensity=turnL?(blL?1.3:(on?.2:.04)):tail;if(Lm.tailR)Lm.tailR.emissiveIntensity=turnR?(blR?1.3:(on?.2:.04)):tail;
  if(Lm.tailC)Lm.tailC.emissiveIntensity=tail;if(Lm.chmsl)Lm.chmsl.emissiveIntensity=brk?1.2:0;if(Lm.rev)Lm.rev.emissiveIntensity=rev?1.2:0;
  if(state.wipers){state.wipT=(state.wipT||0)+dt*2.4;}   // about 46 strokes a minute, then back to the park position when switched off
  const wsw=state.wipers?(.5-.5*Math.cos(state.wipT||0)):0;anim.wip=(anim.wip||0)+(wsw-(anim.wip||0))*.4;if(!state.wipers&&anim.wip<.002)state.wipT=0;
  if(P.wiperRig)P.wiperRig.update(anim.wip);
  drawCabin();
}
function post(){
  const B=p=>bodyPt(p[0]/20,p[1]/20,p[2]/20),V=(x,y,z)=>new THREE.Vector3(x,y,z),qx=a=>new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),a);
  const rack=mxRackForDelta(state.delta||0);if(build.rackBar)build.rackBar.position.z=rack/20;
  for(const W of Object.values(wheels)){
    const S=W.S,sd=W.sd;
    const evaluate=yl=>{const p=mxLinkage(S,yl),steer=mxSteer(S,p,sd,W.steer?rack:0),q=body.quaternion.clone().multiply(qx(sd*p.angle)),base=B([S.ax,p.yl,sd*p.zl]);
      const hub=V(0,S.hubLocalY/20,sd*S.hubLocalZ/20).applyAxisAngle(new THREE.Vector3(0,1,0),steer).applyQuaternion(q).add(base);
      const qw=q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),steer)).multiply(W.off.quaternion),n=V(0,1,0).applyQuaternion(qw.clone().invert());
      let bottom=Infinity;for(const v of W.contact)bottom=Math.min(bottom,v.dot(n));bottom-=.25*(Math.abs(n.x)+Math.abs(n.y)+Math.abs(n.z));
      return {p,q,base,steer,error:hub.y+bottom};};
    // Solve chassis-relative arm position while tyres remain on the road plane.
    let yl=S.yL,r;
    for(let n=0;n<12;n++){r=evaluate(yl);if(Math.abs(r.error)<1e-6)break;
      const derivative=(evaluate(yl+.01).error-r.error)/.01;
      yl-=r.error/derivative;
      if(Math.abs(yl-S.yL)>80)throw new Error('Model X contact exceeds DESIGN linkage range');
    }
    if(Math.abs(r.error)>.0001)throw new Error('Model X ground contact did not converge');
    W.c.position.copy(r.base);W.c.quaternion.copy(r.q);W.st.rotation.y=r.steer;W.sp.rotation.z=-state.spin;W.pose=r.p;
  }
  const tip=(W,p)=>V(p[0]/20,p[1]/20,p[2]/20).applyAxisAngle(new THREE.Vector3(0,1,0),W.st.rotation.y).applyQuaternion(W.c.quaternion).add(W.c.position);
  const set=(m,a,b)=>segTo(m,a,b,zAxis,40,.5);
  for(const L of P.links||[]){const W=wheels[L.nm],S=W.S,sd=W.sd,low=W.c.position.clone(),up=tip(W,[0,S.upright,0]);
    for(const [i,sg] of [-1,1].entries()){
      set(L.lower.userData.legs[i],B([S.ax+sg*S.lowSpan,S.yI,sd*S.zi]),low);
      set(L.upper.userData.legs[i],B([S.ax+sg*S.upSpan,S.yIu,sd*S.zu]),up);
    }
    const crossT=W.steer?.8:.6,crossA=B([S.ax-S.lowSpan,S.yI,sd*S.zi]).lerp(low,crossT),crossB=B([S.ax+S.lowSpan,S.yI,sd*S.zi]).lerp(low,crossT);
    set(L.lower.userData.legs[2],crossA,crossB);
    const airLow=W.steer?B([S.ax-S.lowSpan,S.yI,sd*S.zi]).lerp(low,.6):crossA.clone().lerp(crossB,.5+100/(S.lowSpan*.8)),airTop=B([S.ax-(W.steer?60:30),680,sd*(W.steer?450:570)]);
    // Air bellows shorten with travel; the damper rod extends into the housing.
    set(L.air,airLow.clone().lerp(airTop,.45),airTop);set(L.damper,airLow,airLow.clone().lerp(airTop,.44));
    const shaftInner=W.steer?[1482.5,530,sd*130]:[-1482.5,410,sd*540];
    set(L.shaft,B(shaftInner),tip(W,[0,S.hubLocalY,-sd*25]));
    const rodInner=[S.ax+(W.steer?-260:300),S.yI,sd*S.zi+(W.steer?rack:0)];
    set(L.rod,B(rodInner),tip(W,[W.steer?-150:150,0,0]));
    // Rotating anti-roll arm and fixed-length drop link, with a torsion-bar axis along z.
    const barY=W.steer?430:380,barZ=W.steer?440:620,barOffset=W.steer?380:320,barInner=W.steer?430:470,barLength=W.steer?290:220;
    const antiLow=B([S.ax-S.lowSpan,S.yI,sd*S.zi]).lerp(low,.5),dx=barOffset-S.lowSpan/2,dy=(S.yI+W.pose.yl)/2-barY,dz=(S.zi+W.pose.zl)/2-barZ;
    const dropLength=Math.hypot(barOffset-barLength-S.lowSpan/2,(S.yI+S.yL)/2-barY,(S.zi+S.zL)/2-barZ);
    const q=(dx*dx+dy*dy+barLength*barLength+dz*dz-dropLength*dropLength)/(2*barLength*Math.hypot(dx,dy));
    if(Math.abs(q)>1)throw new Error('Model X anti-roll linkage exceeded DESIGN travel');
    const angle=Math.atan2(dy,dx)+Math.acos(q),barEnd=B([S.ax-barOffset+barLength*Math.cos(angle),barY+barLength*Math.sin(angle),sd*barZ]);
    set(L.barArm,B([S.ax-barOffset,barY,sd*barInner]),barEnd);set(L.drop,barEnd,antiLow);
    L.lower.userData.lengths=L.lower.userData.legs.map(m=>m.scale.z*800);
    L.upper.userData.lengths=L.upper.userData.legs.map(m=>m.scale.z*800);
  }
}
return {id:'modelx',title:'Tesla Model X Plaid (2022 refresh)',tagline:'Six-seat cabin',
  paints:[['Pearl white',0xf2f2ee],['Deep blue',0x152f60]],stages,pre,post,
  // DESIGN +/-40 mm sprung-body travel budget: 20 mm roll + 20 mm pitch at the axles.
  // The earlier 2.2/1.2-degree shell placeholders exceeded the physical arch envelope.
  maxSteer:mxSteerCentre(65),bodyLimits:()=>({roll:Math.atan2(20,855),pitch:Math.atan2(20,1482.5)}),
  presets:[['22 inch Turbine',()=>{}],['20 inch Cyberstream',c=>{c.wheel=Object.assign({},byId('wheel','modelx-20'));}]],
  sigs:{wheels:c=>[c.wheel,c.brakes]},apply:{wheels:setWheels},
  envelope:(x,y,z)=>MX.solidAt(x,y,z),   // the body's outer envelope, (x,y,z) in 20 mm units (t/gap_scan.py: a seen surface well inside it is seen through a hole)
  cockpit:()=>({eye:{x:1.5,y:64.5,z:-23.5},look:[90,40]}),sound:{cyl:0},   // v2 cockpit: the eye over the driver's seat (30, 1290, -470 mm), not at the yoke
  rearDoors:true,trunkLabel:'Liftgate',coverLabel:'Cargo cover',camOpens:{engine:{hood:1},interior:{doorR:1,rdoorR:1}},
  camPresets:(psi,P2)=>({showroom:{az:psi+.9,el:.22,dist:370,ty:38,ox:0,oy:0,oz:0},front:{az:psi+P2,el:.1,dist:340,ty:38,ox:0,oy:0,oz:0},rear:{az:psi-P2+.35,el:.16,dist:360,ty:38,ox:0,oy:0,oz:0},engine:{az:psi+P2+.35,el:.8,dist:200,ty:35,ox:70,oy:0,oz:0},wheels:{az:psi+.25,el:.1,dist:160,ty:22,ox:74,oy:0,oz:35},interior:{az:psi-.5,el:.6,dist:190,ty:45,ox:0,oy:0,oz:8},under:{az:psi+.7,el:.03,dist:320,ty:8,ox:0,oy:0,oz:0}}),onLoaded:connectCabin};
};
