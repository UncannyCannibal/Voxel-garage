/* ===== GLASS PANES AND THEIR RUBBER SEALS (windshields, rear windows, hatch glass) — rendering =====
   The voxel glass stays the collision shape. What is drawn is built from it:
   - the pane's plane (a line fitted through the glass cells in side view; the glass is symmetric about the centreline), its outline in that plane traced
     round the cells and straightened (Douglas-Peucker, 9 mm tolerance) so a slanted pillar edge is one straight line, not 10 mm stairs; its corners are
     rounded only by the radii given (the real E30 and EF panes have tight corners, the bottom ones tighter than the top);
   - the pane's own curvature: a quadratic surface fitted through the cells (crown across the car, bow along it);
   - a black rubber seal round the outline: 3 to 4 mm proud of the glass on its inner edge and resting on the body (or hatch, or lid) on its outer edge,
     whose height there is read from the panel's cells under it, so it closes the joint everywhere instead of floating over or sinking into the paint.
   Units: the grids' 10 mm index units (meshes are scaled by 0.5 to world units, as mkGlass). */
function glassPane(G,opt){
  opt=opt||{};const cells=G.list();if(cells.length<20)return null;
  const W=opt.seal===undefined?1.6:opt.seal,rLo=opt.rLo===undefined?1.5:opt.rLo,rHi=opt.rHi===undefined?4:opt.rHi,lift=opt.lift===undefined?(opt.surf?.12:.8):opt.lift,bodies=opt.bodies||[];
  // plane: principal direction of the cells in side view (x,y); e2 = the car's z axis
  let mx=0,my=0;for(const c of cells){mx+=c[0];my+=c[1];}mx/=cells.length;my/=cells.length;
  let sxx=0,sxy=0,syy=0;for(const c of cells){const a=c[0]-mx,b=c[1]-my;sxx+=a*a;sxy+=a*b;syy+=b*b;}
  const th=.5*Math.atan2(2*sxy,sxx-syy);let e1=[Math.cos(th),Math.sin(th),0];if(e1[1]<0)e1=[-e1[0],-e1[1],0];   // up the glass
  let n=[-e1[1],e1[0],0];if(n[1]<0)n=[-n[0],-n[1],0];                                                       // outward (the glass faces up)
  const toU=(x,y)=>(x-mx)*e1[0]+(y-my)*e1[1],toW=(x,y)=>(x-mx)*n[0]+(y-my)*n[1];
  const P3=(u,v,w)=>[mx+u*e1[0]+w*n[0],my+u*e1[1]+w*n[1],v];
  // curvature: w = a + b u + c v^2 + d u^2 + e u v^2 (symmetric about v = 0)
  const F=(u,v)=>[1,u,v*v,u*u,u*v*v];const A=[...Array(5)].map(()=>new Array(5).fill(0)),B=new Array(5).fill(0);
  for(const c of cells){const u=toU(c[0],c[1]),w=toW(c[0],c[1]),f=F(u,c[2]);for(let i=0;i<5;i++){B[i]+=f[i]*w;for(let j=0;j<5;j++)A[i][j]+=f[i]*f[j];}}
  for(let i=0;i<5;i++){let p=i;for(let r=i+1;r<5;r++)if(Math.abs(A[r][i])>Math.abs(A[p][i]))p=r;[A[i],A[p]]=[A[p],A[i]];[B[i],B[p]]=[B[p],B[i]];for(let r=i+1;r<5;r++){const m=A[r][i]/A[i][i];for(let c=i;c<5;c++)A[r][c]-=m*A[i][c];B[r]-=m*B[i];}}
  const K=new Array(5).fill(0);for(let i=4;i>=0;i--){let s=B[i];for(let c=i+1;c<5;c++)s-=A[i][c]*K[c];K[i]=s/A[i][i];}
  const wq=(u,v)=>{const f=F(u,v);let s=0;for(let i=0;i<5;i++)s+=K[i]*f[i];return s;};
  let wf=wq;
  // outline: raster of the cells in (u,v), 1 unit pixels, one pass of hole filling, boundary traced and straightened
  let u0=1e9,u1=-1e9,v0=1e9,v1=-1e9;const UV=cells.map(c=>{const u=toU(c[0],c[1]);u0=Math.min(u0,u);u1=Math.max(u1,u);v0=Math.min(v0,c[2]);v1=Math.max(v1,c[2]);return [u,c[2]];});
  // the pane ON the measured surface (opt.surf = the car's continuous outer volume, world units): the glass's height above every point is found along the
  // pane's normal (bisection, 0.1 mm) and sampled every 10 mm, so the pane follows the real crown and roll-off to its edges, where the voxel panels round
  // it were cut from the same volume (a global quadratic cannot follow the roll-off at the pillars: the pane stood off the body there)
  if(opt.surf){const SF=opt.surf,inS=(u,v,w)=>{const p=P3(u,v,w);return SF(p[0]/2,p[1]/2,p[2]/2);};
    const su0=Math.floor(u0)-5,sv0=Math.floor(v0)-5,SU=Math.ceil(u1-u0)+11,SV=Math.ceil(v1-v0)+11,T=new Float32Array(SU*SV);
    for(let a=0;a<SU;a++)for(let b=0;b<SV;b++){const u=su0+a,v=sv0+b,w0=wq(u,v);let hi=w0+6,lo=null;
      for(let w=w0+6;w>=w0-6;w-=.5){if(inS(u,v,w)){lo=w;break;}hi=w;}
      if(lo===null){T[a*SV+b]=w0+.5;continue;}
      for(let q=0;q<9;q++){const m=(lo+hi)/2;if(inS(u,v,m))lo=m;else hi=m;}T[a*SV+b]=(lo+hi)/2;}
    wf=(u,v)=>{const fa=Math.max(0,Math.min(SU-1.001,u-su0)),fb=Math.max(0,Math.min(SV-1.001,v-sv0)),a=Math.floor(fa),b=Math.floor(fb),ta=fa-a,tb=fb-b;
      return (T[a*SV+b]*(1-tb)+T[a*SV+b+1]*tb)*(1-ta)+(T[(a+1)*SV+b]*(1-tb)+T[(a+1)*SV+b+1]*tb)*ta;};}
  const NU=Math.ceil(u1-u0)+3,NVv=Math.ceil(v1-v0)+3,occ=new Uint8Array(NU*NVv),O=(a,b)=>a>=0&&b>=0&&a<NU&&b<NVv&&occ[a*NVv+b];
  for(const [u,v] of UV)occ[(Math.floor(u-u0+.5)+1)*NVv+Math.round(v-v0)+1]=1;
  for(let a=1;a<NU-1;a++)for(let b=1;b<NVv-1;b++)if(!occ[a*NVv+b]&&(O(a-1,b)+O(a+1,b)+O(a,b-1)+O(a,b+1))>=3)occ[a*NVv+b]=1;
  // boundary edges of the occupied pixels, chained into loops (pixel corners as nodes); keep the longest loop
  const nxt=new Map();const key=(a,b)=>a*100000+b;
  for(let a=0;a<NU;a++)for(let b=0;b<NVv;b++){if(!O(a,b))continue;
    if(!O(a,b-1))nxt.set(key(a,b),key(a+1,b));if(!O(a+1,b))nxt.set(key(a+1,b),key(a+1,b+1));if(!O(a,b+1))nxt.set(key(a+1,b+1),key(a,b+1));if(!O(a-1,b))nxt.set(key(a,b+1),key(a,b));}
  const seen=new Set();let best=[];
  for(const s of nxt.keys()){if(seen.has(s))continue;const loop=[];let c=s;while(c!==undefined&&!seen.has(c)){seen.add(c);loop.push(c);c=nxt.get(c);}if(loop.length>best.length)best=loop;}
  let poly=best.map(k=>[Math.floor(k/100000)-1+u0-.5,(k%100000)-1+v0-.5]);
  // straighten: the panes are convex, so their outline is the convex hull of the traced boundary (the stairs' outer corners), with nearly straight runs merged
  {const pts=poly.slice().sort((p,q)=>p[0]-q[0]||p[1]-q[1]),cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]),lo=[],hi=[];
   for(const p of pts){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p);}
   for(let i=pts.length-1;i>=0;i--){const p=pts[i];while(hi.length>=2&&cr(hi[hi.length-2],hi[hi.length-1],p)<=0)hi.pop();hi.push(p);}
   poly=lo.slice(0,-1).concat(hi.slice(0,-1));   // counter-clockwise
   const tolA=(opt.mergeDeg===undefined?7:opt.mergeDeg)*Math.PI/180;let changed=true;   // drop vertices where the outline turns by less than tolA, or that sit within 0.6 unit of the line past them
   while(changed&&poly.length>4){changed=false;for(let i=0;i<poly.length&&poly.length>4;i++){const a=poly[(i-1+poly.length)%poly.length],p=poly[i],b=poly[(i+1)%poly.length];
     const t1=Math.atan2(p[1]-a[1],p[0]-a[0]),t2=Math.atan2(b[1]-p[1],b[0]-p[0]);let d=Math.abs(t2-t1);if(d>Math.PI)d=2*Math.PI-d;
     const L=Math.hypot(b[0]-a[0],b[1]-a[1])||1e-9,off=Math.abs((b[0]-a[0])*(a[1]-p[1])-(a[0]-p[0])*(b[1]-a[1]))/L;
     if(d<tolA||off<.6){poly.splice(i,1);changed=true;i--;}}}}
  // corner fillets: radius rLo on the lower half of the pane, rHi on the upper half (limited to 45 % of the shorter neighbouring edge)
  const um=(u0+u1)/2,out=[];
  for(let i=0;i<poly.length;i++){const p=poly[i],a=poly[(i-1+poly.length)%poly.length],b=poly[(i+1)%poly.length];
    const da=[a[0]-p[0],a[1]-p[1]],db=[b[0]-p[0],b[1]-p[1]],la=Math.hypot(...da),lb=Math.hypot(...db);const ta=[da[0]/la,da[1]/la],tb=[db[0]/lb,db[1]/lb];
    const cosA=ta[0]*tb[0]+ta[1]*tb[1],ang=Math.acos(Math.max(-1,Math.min(1,cosA)));   // interior angle
    if(ang>Math.PI*.86){out.push(p);continue;}
    const r=p[0]<um?rLo:rHi,dist=Math.min(r/Math.tan(ang/2),.45*la,.45*lb),rr=dist*Math.tan(ang/2);
    const pa=[p[0]+ta[0]*dist,p[1]+ta[1]*dist],pb=[p[0]+tb[0]*dist,p[1]+tb[1]*dist],bis=[ta[0]+tb[0],ta[1]+tb[1]],bl=Math.hypot(...bis),cd=rr/Math.sin(ang/2);
    const c=[p[0]+bis[0]/bl*cd,p[1]+bis[1]/bl*cd],s0=Math.atan2(pa[1]-c[1],pa[0]-c[0]),s1=Math.atan2(pb[1]-c[1],pb[0]-c[0]);let ds=s1-s0;while(ds>Math.PI)ds-=2*Math.PI;while(ds<-Math.PI)ds+=2*Math.PI;
    const ns=Math.max(2,Math.ceil(Math.abs(ds)/(Math.PI/12)));for(let q=0;q<=ns;q++){const s=s0+ds*q/ns;out.push([c[0]+rr*Math.cos(s),c[1]+rr*Math.sin(s)]);}}
  poly=out;
  // orientation: counter-clockwise in (u,v)
  {let s=0;for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length];s+=a[0]*b[1]-b[0]*a[1];}if(s<0)poly.reverse();}
  // pane: rows across v at every outline vertex's u and every 2 units between, M samples per row (the outline is convex along u)
  const span=u=>{let lo=1e9,hi=-1e9;for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length];if((a[0]-u)*(b[0]-u)>0)continue;const t=a[0]===b[0]?.5:(u-a[0])/(b[0]-a[0]),v=a[1]+(b[1]-a[1])*t;lo=Math.min(lo,v);hi=Math.max(hi,v);}return lo<hi?[lo,hi]:null;};
  let pu0=1e9,pu1=-1e9;for(const p of poly){pu0=Math.min(pu0,p[0]);pu1=Math.max(pu1,p[0]);}
  const us=new Set();for(const p of poly)us.add(+p[0].toFixed(4));for(let u=Math.ceil(pu0);u<pu1;u+=2)us.add(u);
  const rows=[...us].sort((a,b)=>a-b).map(u=>Math.min(pu1-1e-4,Math.max(pu0+1e-4,u)));
  const M=24,ppos=[],pidx=[];let prev=null;
  for(const u of rows){const s=span(u);if(!s)continue;const base=ppos.length/3;for(let q=0;q<=M;q++){const v=s[0]+(s[1]-s[0])*q/M;ppos.push(...P3(u,v,wf(u,v)+lift));}
    if(prev!==null)for(let q=0;q<M;q++){const a=prev+q,b=prev+q+1,c=base+q+1,d=base+q;pidx.push(a,b,c,a,c,d);}prev=base;}
  // seal: inner edge over the glass, crown, outer edge on the panel under it (probed along the normal through the given grids)
  const probe=(u,v)=>{const w0=wf(u,v);for(let w=w0+5;w>=w0-4;w-=.25){const p=P3(u,v,w);for(const B of bodies)if(B.get(Math.round(p[0]),Math.round(p[1]),Math.round(p[2]))>=0)return w+.5;}return -1e9;};
  const N2=poly.length,spos=[],sidx=[],rowsS=[[-.6,0],[.15,1],[.55,2],[1,3]];   // [fraction of the seal's width along the outward normal (inner edge over the glass), height rule]
  for(let i=0;i<N2;i++){const a=poly[(i-1+N2)%N2],p=poly[i],b=poly[(i+1)%N2];let tx=b[0]-a[0],ty=b[1]-a[1];const l=Math.hypot(tx,ty)||1;tx/=l;ty/=l;const on=[ty,-tx];   // outward for a ccw outline
    const hgO=wf(p[0]+on[0]*W,p[1]+on[1]*W)+lift,pb=probe(p[0]+on[0]*W,p[1]+on[1]*W),hOut=opt.surf?(pb>-1e8?Math.max(pb,hgO-1.5):hgO):Math.max(hgO,pb);   // on the measured surface the seal's outer edge rests on the panel, even where the panel's 10 mm cells sit lower than the glass
    for(const [f,rule] of rowsS){const q=[p[0]+on[0]*W*f,p[1]+on[1]*W*f],hg=wf(q[0],q[1])+lift;
      const h=rule===0?hg+.15:rule===3?(opt.surf?hOut:Math.max(hOut,hg))+.12:rule===1?Math.max(hg,Math.min(hOut,hg+1.2))+.4:(opt.surf?Math.max(hOut,hg-.2):Math.max(hOut,hg))+.35;spos.push(...P3(q[0],q[1],h));}}
  for(let i=0;i<N2;i++){const a=i*4,b=((i+1)%N2)*4;for(let r=0;r<3;r++)sidx.push(a+r,b+r,b+r+1,a+r,b+r+1,a+r+1);}
  // black ceramic band printed round the pane's edge (inside the seal): it hides the body's flange behind the glass's edge, as on the real panes (25 mm)
  const fpos=[],fidx=[],FW=opt.frit===undefined?2.6:opt.frit;
  for(let i=0;i<N2;i++){const a=poly[(i-1+N2)%N2],p=poly[i],b=poly[(i+1)%N2];let tx=b[0]-a[0],ty=b[1]-a[1];const l=Math.hypot(tx,ty)||1;tx/=l;ty/=l;const on=[ty,-tx];
    for(const f of [-FW,-.1]){const q=[p[0]+on[0]*f,p[1]+on[1]*f];fpos.push(...P3(q[0],q[1],wf(q[0],q[1])+lift+.06));}}
  for(let i=0;i<N2;i++){const a=i*2,b=((i+1)%N2)*2;fidx.push(a,b,b+1,a,b+1,a+1);}
  // a point on the glass's outer surface (for wipers): world-index coordinates of (u,v) with an extra offset along the normal
  const onGlass=(u,v,off)=>P3(u,v,wf(u,v)+lift+(off||0));
  return {pane:{pos:ppos,idx:pidx},seal:{pos:spos,idx:sidx},frit:{pos:fpos,idx:fidx},poly,frame:{m:[mx,my],e1,n},wf,onGlass,toU,toW,lift};
}

/* ---- WIPERS that rest on the glass (rendering; follows the pane's fitted surface) ----
   Each wiper: a spindle standing on the cowl just below the glass's lower edge, the arm from its head to the blade's centre (kept at least 5 mm clear of the
   glass along its length), and the blade lying ON the glass: its rubber edge on the pane's surface at every point of its length, so it bends with the glass's
   crown as a real blade does, in every position of the sweep (re-laid every frame; 24 segments).
   spec: [{pivot:v (index units across the car), park:u above the glass's lower edge, arm, blade (index units), sweep (degrees), dir:+1|-1 (the side the blade
   parks toward)}]. update(t): t = 0 parked .. 1 end of the sweep. Units: index units of the pane (the group is scaled 0.5 like the pane). */
function wiperRig(gp,parent,spec,scale){
  const grp=new THREE.Group();if(scale)grp.scale.setScalar(scale);parent.add(grp);
  const n=gp.frame.n,e1=gp.frame.e1,uMin=Math.min(...gp.poly.map(p=>p[0])),V=THREE.Vector3;
  const mat=new THREE.MeshPhongMaterial({color:0x141517,shininess:30,specular:0x333333}),rub=new THREE.MeshPhongMaterial({color:0x0b0b0c,shininess:8});
  const tube=(N)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(N*4*3),3));const idx=[];
    for(let i=0;i<N-1;i++)for(let s=0;s<4;s++){const a=i*4+s,b=i*4+(s+1)%4,c=(i+1)*4+(s+1)%4,d=(i+1)*4+s;idx.push(a,b,c,a,c,d);}
    idx.push(0,2,1,0,3,2);const L=(N-1)*4;idx.push(L,L+1,L+2,L,L+2,L+3);g.setIndex(idx);return g;};
  // lay a rectangular section (w across, h up from the base line) along points with the glass normal as 'up'
  const lay=(g,pts,w,h,h0)=>{const P=g.attributes.position.array,up=new V(n[0],n[1],n[2]);
    for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],t=new V(b[0]-a[0],b[1]-a[1],b[2]-a[2]).normalize(),U=Math.abs(t.dot(up))>.9?new V(e1[0],e1[1],e1[2]):up,sd=new V().crossVectors(t,U).normalize(),up2=new V().crossVectors(sd,t).normalize();
      const c=[[-w/2,h0],[w/2,h0],[w/2,h0+h],[-w/2,h0+h]];for(let s=0;s<4;s++){const o=(i*4+s)*3;const uu=Math.abs(t.dot(up))>.9?up2:up;P[o]=pts[i][0]+sd.x*c[s][0]+uu.x*c[s][1];P[o+1]=pts[i][1]+sd.y*c[s][0]+uu.y*c[s][1];P[o+2]=pts[i][2]+sd.z*c[s][0]+uu.z*c[s][1];}}
    g.attributes.position.needsUpdate=true;g.computeVertexNormals();g.computeBoundingSphere();};
  const W=spec.map(s=>{const NB=24,blade=tube(NB),frame=tube(NB),arm=tube(3),spin=tube(2);
    const m=[new THREE.Mesh(blade,rub),new THREE.Mesh(frame,mat),new THREE.Mesh(arm,mat),new THREE.Mesh(spin,mat)];for(const x of m)grp.add(x);
    const pu=uMin-2.2,pv=s.pivot,cu=uMin+s.park,th0=Math.asin(Math.max(-.9,Math.min(.9,(cu-pu)/s.arm)));
    return {s,NB,blade,frame,arm,spin,m,pu,pv,th0};});
  const update=t=>{for(const w of W){const s=w.s,th=w.th0+t*s.sweep*Math.PI/180;
      const du=Math.sin(th),dv=s.dir*Math.cos(th),cu=w.pu+s.arm*du,cv=w.pv+s.arm*dv;   // blade centre
      const bth=th-w.th0,bu=Math.sin(bth),bv=s.dir*Math.cos(bth);                       // the blade lies across the glass when parked and turns with the arm
      const bp=[];for(let i=0;i<w.NB;i++){const q=-s.blade/2+s.blade*i/(w.NB-1);bp.push(gp.onGlass(cu+q*bu,cv+q*bv,0));}
      lay(w.blade,bp,.5,.45,0);lay(w.frame,bp,.9,.9,.45);                               // rubber edge on the glass, the blade's frame on top of it
      // arm: spindle head (12 mm over the glass plane at the pivot) -> knee -> blade centre (on top of the frame); the knee is lifted until the arm clears the glass by 5 mm
      const head=gp.onGlass(w.pu,w.pv,1.2),tip=gp.onGlass(cu,cv,1.6);let lift=0;
      for(let k=0;k<12;k++){let ok=true;const knee=gp.onGlass(w.pu+(cu-w.pu)*.45,w.pv+(cv-w.pv)*.45,1.6+lift);
        for(let a=.05;a<1;a+=.05){const P=a<.45?[head,knee,a/.45]:[knee,tip,(a-.45)/.55],p=[0,1,2].map(i=>P[0][i]+(P[1][i]-P[0][i])*P[2]);const uu=gp.toU(p[0],p[1]),ww=gp.toW(p[0],p[1]),gz=gp.wf(uu,p[2])+gp.lift;if(ww-gz<.5+.45){ok=false;break;}}
        if(ok)break;lift+=.25;}
      const knee=gp.onGlass(w.pu+(cu-w.pu)*.45,w.pv+(cv-w.pv)*.45,1.6+lift);lay(w.arm,[head,knee,tip],1.2,.8,-.4);
      lay(w.spin,[gp.onGlass(w.pu,w.pv,-3),head],1.4,1.4,-.7);}};   // spindle: from under the cowl skin up to the arm's head
  update(0);
  return {group:grp,update,meshes:W.flatMap(w=>w.m)};
}
// the panel round a pane is cut back to the pane's straightened outline: its cells inside the outline (inset 0.4) within 3 cells of the glass plane are removed
// (nothing of the panel shows inside the seal; the voxel glass, the collision shape, keeps its cells)
function fitPaneToPanels(gp,G,panels){let cut=0,fill=0;const inP=(u,v)=>{const P=gp.poly;let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>v)!==(b[1]>v)&&u<(b[0]-a[0])*(v-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
  const inset=(u,v)=>inP(u,v)&&inP(u+.4,v)&&inP(u-.4,v)&&inP(u,v+.4)&&inP(u,v-.4);
  let u0=1e9,u1=-1e9,v0=1e9,v1=-1e9;for(const p of gp.poly){u0=Math.min(u0,p[0]);u1=Math.max(u1,p[0]);v0=Math.min(v0,p[1]);v1=Math.max(v1,p[1]);}
  for(const B of panels)eachCell(B,null,(i,j,k,n)=>{if(B.d[n]<0)return;if(k<v0-1||k>v1+1)return;const u=gp.toU(i,j);if(u<u0-1||u>u1+1)return;const w=gp.toW(i,j)-gp.wf(u,k);if(w<-3||w>3)return;if(inset(u,k)){B.d[n]=-1;cut++;}});
  return {cut,fill};}
// the panel's cells under the seal's width are the rubber: recoloured to the seal's black, so where a 10 mm cell's edge stands above the smooth seal ribbon it
// reads as the gasket and not as paint poking through it; past the seal the old one-cell gasket ring goes back to paint. o: {W (seal width, index units),
// col (rubber colour), paint (the panel's paint value), old (the colour of an earlier gasket ring, restored to paint past the seal)}
function sealBand(gp,panels,o){o=o||{};const W=(o.W===undefined?1.6:o.W)+.3,col=o.col===undefined?0x131416:o.col,paint=o.paint,old=o.old;let n0=0,n1=0;
  const P=gp.poly,inP=(u,v)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>v)!==(b[1]>v)&&u<(b[0]-a[0])*(v-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
  const dist=(u,v)=>{let best=1e9;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[j],b=P[i],dx=b[0]-a[0],dy=b[1]-a[1],L2=dx*dx+dy*dy||1e-9;let t=((u-a[0])*dx+(v-a[1])*dy)/L2;t=Math.max(0,Math.min(1,t));const ex=a[0]+dx*t-u,ey=a[1]+dy*t-v;best=Math.min(best,ex*ex+ey*ey);}return Math.sqrt(best);};
  let u0=1e9,u1=-1e9,v0=1e9,v1=-1e9;for(const p of P){u0=Math.min(u0,p[0]);u1=Math.max(u1,p[0]);v0=Math.min(v0,p[1]);v1=Math.max(v1,p[1]);}
  for(const B of panels)eachCell(B,null,(i,j,k,n)=>{const c=B.d[n];if(c<0||(c!==paint&&c!==old))return;if(k<v0-W-3||k>v1+W+3)return;const u=gp.toU(i,j);if(u<u0-W-3||u>u1+W+3)return;
    const w=gp.toW(i,j)-gp.wf(u,k);if(w<-1.6||w>1.2)return;const d=inP(u,k)?-dist(u,k):dist(u,k);
    if(d>=-1.5&&d<=W&&w>=-.9){if(c!==col){B.d[n]=col;n0++;}}else if(d>W&&d<W+3&&c===old&&old!==col&&paint!==undefined){B.d[n]=paint;n1++;}});
  return {rubber:n0,restored:n1};}
// VOXEL-MODE GLASS: a smooth sheet over exactly the glass's own 10 mm columns, i.e. the opening cut in the voxel panels, so it fills the opening edge to edge
// with no gap and no overlap. Inside, every cell corner sits on the measured surface (bisection on the car's outer volume), kept within the glass cells' own
// top faces; along the edge it sits exactly on the top faces of the cells round it (the rubber gasket's lip), so where the real surface rolls over at a corner
// the glass never drops under the rubber and shows its edge as a curve. inside(x,y,z): world units; lift: index units; panels: the grids that hold the gasket.
function glassSheet(G,inside,lift,panels){lift=lift===undefined?.1:lift;panels=panels||[];
  const top=new Map();for(const [i,j,k] of G.list()){const key=i+','+k;if(!top.has(key)||j>top.get(key))top.set(key,j);}
  const rimTop=(i,k,jr)=>{for(let j=jr+2;j>=jr-2;j--)for(const P of panels)if(P&&P.get(i,j,k)>=0)return j+.5;return null;};   // the top face of the panel's cell next to the glass
  const pos=[],idx=[],vid=new Map();let vc=0;
  const V=(a,b,jh)=>{const key=a+','+b;if(vid.has(key))return vid.get(key);
    const T=[],R=[];for(const [da,db] of [[-.5,-.5],[.5,-.5],[-.5,.5],[.5,.5]]){const i=a+da,k=b+db,t=top.get(i+','+k);if(t!==undefined)T.push(t+.5);else{const r=rimTop(i,k,jh);if(r!==null)R.push(r);}}
    let h;
    if(R.length){const all=T.concat(R);h=all.reduce((p,q)=>p+q,0)/all.length;}   // edge: on the gasket's top faces
    else{let lo=null,hi=jh+3;for(let y=jh+3;y>=jh-3;y-=.25){if(inside(a/2,y/2,b/2)){lo=y;break;}hi=y;}
      h=jh+.5;if(lo!==null){for(let q=0;q<9;q++){const m=(lo+hi)/2;if(inside(a/2,m/2,b/2))lo=m;else hi=m;}h=(lo+hi)/2;}
      if(T.length)h=Math.max(Math.min(...T)-.5,Math.min(Math.max(...T),h));}   // within the glass cells' own top faces
    pos.push(a,h+lift,b);vid.set(key,vc);return vc++;};
  for(const [key,j] of top){const [i,k]=key.split(',').map(Number);const q=[V(i-.5,k-.5,j),V(i+.5,k-.5,j),V(i+.5,k+.5,j),V(i-.5,k+.5,j)];idx.push(q[0],q[2],q[1],q[0],q[3],q[2]);}
  return {pos,idx};}
if(typeof module!=='undefined')module.exports={glassPane,wiperRig,fitPaneToPanels,sealBand,glassSheet};
