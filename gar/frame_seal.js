/* ===== WINDOW-FRAME RUBBER LINES — rendering =====
   Owner, Nov 13: where a thin pillar meets the black window rubber on a diagonal, the 10 mm steps showed as alternating paint-and-black blocks ("the
   black and white or the red and white"); the owner chose a smooth line where the paint meets the rubber ("the voxel paint stays; the edge reads as
   one clean line").
   The voxel cells stay as they are (the checks measure them); only their colour is redrawn near the edge. On the voxel surface, the edges where an
   exposed paint face meets an exposed dark face (the rubber, the black trim) near the glass are joined into lines; each line's 10 mm stairs are
   relaxed into the straight or curved line they step along (each point kept within 7.5 mm of its stair). Then every face by the line is split
   along it, on the face itself: the part of a paint face on the rubber's side is covered in the rubber's colour, and the part of a rubber face on
   the paint's side in the paint (the covers lie on the faces, drawn a hair forward in depth only: nothing is lifted, nothing floats). Where the
   line runs down a pillar across its 10 mm terraces, a thin fence stands in the same cut, paint on one face and rubber on the other, up to the
   highest terrace beside it, so from the side the line is straight too.
   Left as the voxels have it: real corners (a notch, a finger of colour along a terrace, a window's corner), creases that run close to a grid axis
   (their rare steps are single jogs, and the crease is the edge), and faces that stand across the line (a terrace's riser).
   Units: the grids' 10 mm index units (the covers are drawn in the panels' paintable groups, which scale them by 0.5 to world units). */
function frameSealData(panels,glass,opt){
  opt=opt||{};
  const CLAMP=opt.clamp||.75,REACH=opt.reach||6,ITER=opt.iter||40,MINLEN=opt.minLen||3,COVER=opt.cover||1,REACHL=opt.reachLine||1.8;
  const out=panels.map(()=>({black:[],paint:[],fence:[]})),lines=[];
  const isPaint=v=>v===PAINT||v===PAINT_SHADE;
  const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],len3=v=>Math.hypot(v[0],v[1],v[2]),dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  // every occupied cell (all panels and the glass): what it is (1 paint, 2 rubber, 0 other, 3 glass) and whose
  const occ=new Map(),K3=(x,y,z)=>x+','+y+','+z;
  // rubber: near-black and grey (every channel under 64, within 8 of each other); a dark coloured part (a red lens, a red spoiler) is not rubber
  const rubber=v=>{const r=(v>>16)&255,g=(v>>8)&255,b=v&255;return Math.max(r,g,b)<64&&Math.max(r,g,b)-Math.min(r,g,b)<=8;};
  panels.forEach((p,o)=>{for(const [x,y,z,v] of p.g.list())occ.set(K3(x,y,z),{c:isPaint(v)?1:(rubber(v)?2:0),o,v});});
  // near the glass: 4-cell bins that hold glass, dilated by the reach
  const B=4,bins=new Set(),bk=(x,y,z)=>Math.floor(x/B)+','+Math.floor(y/B)+','+Math.floor(z/B);
  for(const G of glass){if(!G)continue;for(const [x,y,z] of G.list()){occ.set(K3(x,y,z),{c:3,o:-1});bins.add(bk(x,y,z));}}
  const FG=new Set();for(const G of opt.fenceGlass||[])if(G)for(const [x,y,z] of G.list())FG.add(K3(x,y,z));   // the glass whose frame gets fences
  const R=Math.ceil(REACH/B),nearG=new Set();for(const b of bins){const [a,c,d]=b.split(',').map(Number);for(let i=-R;i<=R;i++)for(let j=-R;j<=R;j++)for(let k=-R;k<=R;k++)nearG.add((a+i)+','+(c+j)+','+(d+k));}
  // exposed faces of the paint, rubber and glass cells near the glass (FH: their centres, hashed; FL: the paint and rubber faces, to split), and
  // their four edges per kind (keyed by the edge's midpoint, doubled to stay integer)
  const FN=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
  const EK=[null,new Map(),new Map(),new Map()],FH=new Map(),FL=[],fk=(x,y,z)=>Math.floor(x)+','+Math.floor(y)+','+Math.floor(z);
  for(const [key,cell] of occ){if(!cell.c)continue;const [x,y,z]=key.split(',').map(Number);if(!nearG.has(bk(x,y,z)))continue;
    for(let fi=0;fi<6;fi++){const n=FN[fi];if(occ.has(K3(x+n[0],y+n[1],z+n[2])))continue;
      // the face centre is cell + n/2; its edges lie along the two axes other than n's
      const ax=n[0]?0:n[1]?1:2,u=(ax+1)%3,w=(ax+2)%3,c=[x+n[0]/2,y+n[1]/2,z+n[2]/2];
      {const k=fk(c[0],c[1],c[2]);(FH.get(k)||FH.set(k,[]).get(k)).push({c,n,k:cell.c,o:cell.o,v:cell.v});}
      if(cell.c===1||cell.c===2)FL.push({cell:[x,y,z],f:fi,n,c,k:cell.c,o:cell.o});
      for(const [du,dw] of [[.5,0],[-.5,0],[0,.5],[0,-.5]]){const m=c.slice();m[u]+=du;m[w]+=dw;const mk=K3(m[0]*2,m[1]*2,m[2]*2),dir=du?w:u;
        const M=EK[cell.c],e=M.get(mk)||{m,dir,n:[0,0,0],o:cell.o};e.n[0]+=n[0];e.n[1]+=n[1];e.n[2]+=n[2];M.set(mk,e);}}}
  const faces=(p,r,f)=>{const X=Math.floor(p[0]),Y=Math.floor(p[1]),Z=Math.floor(p[2]),q=Math.ceil(r);for(let i=-q;i<=q;i++)for(let j=-q;j<=q;j++)for(let l=-q;l<=q;l++){const F=FH.get((X+i)+','+(Y+j)+','+(Z+l));if(F)for(const t of F)f(t);}};
  // the stepped edges: a paint face beside a rubber face. Each is kept as a point (the edge's midpoint) with the two faces' normals summed, on the
  // panel that owns the paint
  const pts=[],pt=(e,f,o)=>({m:e.m,n:[e.n[0]+f.n[0],e.n[1]+f.n[1],e.n[2]+f.n[2]],o});
  for(const [k,e] of EK[1]){const d=EK[2].get(k);if(d)pts.push(pt(e,d,e.o));}
  // lines, per panel. On a curved panel a stepped edge runs over the terraces and down their risers, the rubber's two edges run a cell apart, and
  // lines meet at corners, so the edges do not chain one to one. Instead: the points within a cell of each other are joined into a minimum
  // spanning tree; the tree's longest path is a line; the points within COVER of it are that line's (a second rail of the same edge, a cell
  // over); what is left of the tree is searched again, until no line of MINLEN cells or more is left.
  for(let o=0;o<panels.length;o++){const Pt=pts.filter(p=>p.o===o),n=Pt.length;if(!n||!out[o])continue;
    const H=new Map(),hk=(x,y,z)=>x+','+y+','+z;
    Pt.forEach((p,i)=>{const k=hk(Math.floor(p.m[0]),Math.floor(p.m[1]),Math.floor(p.m[2]));(H.get(k)||H.set(k,[]).get(k)).push(i);});
    const near=(m,r,f)=>{const X=Math.floor(m[0]),Y=Math.floor(m[1]),Z=Math.floor(m[2]),q=Math.ceil(r);
      for(let i=-q;i<=q;i++)for(let j=-q;j<=q;j++)for(let k=-q;k<=q;k++){const L=H.get(hk(X+i,Y+j,Z+k));if(L)for(const t of L){const d=len3(sub(Pt[t].m,m));if(d<=r)f(t,d);}}};
    const pairs=[];for(let i=0;i<n;i++)near(Pt[i].m,1.05,(j,d)=>{if(j>i)pairs.push([d,i,j]);});pairs.sort((a,b)=>a[0]-b[0]);
    const par=Int32Array.from({length:n},(_,i)=>i),find=i=>{while(par[i]!==i){par[i]=par[par[i]];i=par[i];}return i;};
    const T=Array.from({length:n},()=>[]);for(const [d,i,j] of pairs){const a=find(i),b=find(j);if(a===b)continue;par[a]=b;T[i].push([j,d]);T[j].push([i,d]);}
    const alive=new Uint8Array(n).fill(1);
    const far=s=>{const dist=new Map([[s,0]]),prev=new Map([[s,-1]]),st=[s];let best=s;
      while(st.length){const u=st.pop();for(const [v,d] of T[u]){if(!alive[v]||dist.has(v))continue;dist.set(v,dist.get(u)+d);prev.set(v,u);if(dist.get(v)>dist.get(best))best=v;st.push(v);}}return {best,dist,prev};};
    const queue=[];{const seen=new Uint8Array(n);for(let s=0;s<n;s++){if(seen[s])continue;const A=far(s);for(const k of A.dist.keys())seen[k]=1;queue.push(s);}}
    while(queue.length){const s=queue.pop();if(!alive[s])continue;
      const A=far(s),Bf=far(A.best),L=Bf.dist.get(Bf.best),comp=[...A.dist.keys()];
      if(L<MINLEN){for(const k of comp)alive[k]=0;continue;}
      const path=[];for(let u=Bf.best;u>=0;u=Bf.prev.get(u))path.push(u);
      const P=path.map(i=>Pt[i].m.slice()),N=path.map(i=>Pt[i].n);
      const closed=P.length>8&&len3(sub(P[0],P[P.length-1]))<=1.5;
      const cov=new Set(path);for(const u of path)near(Pt[u].m,COVER,t=>{if(alive[t])cov.add(t);});
      lines.push({o,P,N,closed});
      for(const t of cov)alive[t]=0;
      // what is left of this tree: each remaining piece goes back on the queue
      const seen=new Set();for(const k of comp){if(!alive[k]||seen.has(k))continue;const Rr=far(k);for(const q of Rr.dist.keys())seen.add(q);queue.push(k);}}
  }
  const LN=[],LH=new Map(),LNF=[];
  for(const {o,P,N,closed} of lines){const L=P.length,wrap=(A,k)=>closed?A[((k%L)+L)%L]:A[Math.max(0,Math.min(L-1,k))];
    // relax the stairs (an open line's ends held), each point kept within CLAMP of the stair it came from: a stair's corners lie within about half
    // a cell of the line it steps along, so the line can straighten, but a real corner of the frame is only rounded by that much, not cut
    let Q=P.map(p=>p.slice());for(let it=0;it<ITER;it++){const Q2=Q.map(p=>p.slice());
      for(let k=closed?0:1;k<(closed?L:L-1);k++){for(let c=0;c<3;c++)Q2[k][c]=.5*Q[k][c]+.25*(wrap(Q,k-1)[c]+wrap(Q,k+1)[c]);
        const d=sub(Q2[k],P[k]),dl=len3(d);if(dl>CLAMP)for(let c=0;c<3;c++)Q2[k][c]=P[k][c]+d[c]*CLAMP/dl;}Q=Q2;}
    // the surface's normal along the line: the mean of the paint and rubber faces within 1.5 cells (terrace tops and risers together give the
    // slope; the edges' own normals lean toward whichever faces meet there)
    let NS=Q.map((p,k)=>{const v=[0,0,0];faces(p,1.5,f=>{if(f.k!==3&&len3(sub(f.c,p))<=1.5){v[0]+=f.n[0];v[1]+=f.n[1];v[2]+=f.n[2];}});const u=len3(v)>.5?v:N[k];const l=len3(u)||1;return u.map(x=>x/l);});
    for(let it=0;it<8;it++){const N2=NS.map((_,k)=>[0,1,2].map(c=>wrap(NS,k-1)[c]+2*NS[k][c]+wrap(NS,k+1)[c]));NS=N2.map(v=>{const l=len3(v)||1;return v.map(x=>x/l);});}
    // the frame along the line: t along it, s across it in the surface, n out of the surface
    const TT=[],SS=[];for(let k=0;k<L;k++){let t=sub(wrap(Q,k+1),wrap(Q,k-1));const tl=len3(t)||1;t=t.map(v=>v/tl);let nn=NS[k];
      let s=[nn[1]*t[2]-nn[2]*t[1],nn[2]*t[0]-nn[0]*t[2],nn[0]*t[1]-nn[1]*t[0]];const sl=len3(s)||1;s=s.map(v=>v/sl);
      NS[k]=[t[1]*s[2]-t[2]*s[1],t[2]*s[0]-t[0]*s[2],t[0]*s[1]-t[1]*s[0]];TT.push(t);SS.push(s);}
    // which side of the line the paint is on, point by point (the paint faces near it against the rubber faces), held steady along the line
    let sg=Q.map((p,k)=>{let v=0;faces(p,1.5,f=>{if(f.k===3)return;const d=sub(f.c,p);if(len3(d)>1.5)return;v+=(f.k===1?1:-1)*dot(d,SS[k]);});return v;});
    for(let it=0;it<3;it++)sg=sg.map((_,k)=>wrap(sg,k-2)+wrap(sg,k-1)+sg[k]+wrap(sg,k+1)+wrap(sg,k+2));
    const SG=sg.map(v=>v>=0?1:-1);
    // the fence: on a curved panel the line crosses the terraces, and from the side every terrace shows its 10 mm step where the paint meets the
    // rubber, however straight the line is on each face. So a thin upright fence stands in the cut plane along the line, its face toward the
    // paint in the paint and its face toward the rubber in the rubber, from below the lowest terrace beside it up to the highest (evened out
    // along the line, never below a terrace it passes). Its top edge is then the line seen from the side: straight, and it stands on the panel.
    let top=Q.map(()=>-1e9),foot=Q.map(()=>1e9);
    Q.forEach((p,k)=>faces(p,2.5,f=>{if(f.k!==1&&f.k!==2)return;const d=sub(f.c,p);if(Math.abs(dot(d,TT[k]))>.75||dot(f.n,NS[k])<.5)return;const ds=Math.abs(dot(d,SS[k])),h=dot(d,NS[k]);
      if(ds<=1.5)top[k]=Math.max(top[k],h);if(ds<=1)foot[k]=Math.min(foot[k],h);}));
    top=top.map(v=>v>-1e8?v:0);foot=foot.map(v=>v<1e8?v:0);
    const rmax=A=>A.map((_,k)=>Math.max(...[-3,-2,-1,0,1,2,3].map(j=>wrap(A,k+j)))),rmin=A=>A.map((_,k)=>Math.min(...[-2,-1,0,1,2].map(j=>wrap(A,k+j))));
    const ev=A=>{let X=A;for(let it=0;it<3;it++)X=X.map((_,k)=>.25*wrap(X,k-1)+.5*X[k]+.25*wrap(X,k+1));return X;};
    const TOP=ev(rmax(top)).map((v,k)=>Math.max(v,top[k])),FOOT=ev(rmin(foot)).map((v,k)=>Math.min(v,foot[k])-.15);
    // where the line turns a real corner (more than 60 degrees within 4 points: a notch in the rubber, a finger of colour along a terrace, the
    // corner of a window), there is no one edge to straighten, and rounding it would cut triangles off the corner: within 4 points of a turn
    // like that the voxels are left as they are
    const pin=TT.map((_,k)=>dot(wrap(TT,k-2),wrap(TT,k+2))<.5);
    // where the colour changes at a crease of the surface (paint on top, rubber down the side: the edge's two faces are not in one plane) and
    // the crease runs within 15 degrees of a grid axis, its steps are rare and the crease is the edge: a straightened line would leave the crease
    // and cut long slivers off the faces beside it, so it is left as it is
    const crease=N.map(n=>len3(n)<1.9),shallow=Q.map((_,k)=>{const c=sub(wrap(Q,k+6),wrap(Q,k-6)),l=len3(c)||1;return Math.max(Math.abs(c[0]),Math.abs(c[1]),Math.abs(c[2]))/l>.966&&[-3,-2,-1,0,1,2,3].filter(j=>wrap(crease,k+j)).length>=4;});   // the run's direction over 12 points, so the short ramp a rare step makes counts too
    const bad=pin.map((_,k)=>[-4,-3,-2,-1,0,1,2,3,4].some(j=>wrap(pin,k+j))||shallow[k]);
    // the fence only where the line runs down across the terraces (its slope along the surface's main axis at least 0.3), so the terraces' steps
    // come often and small; across gentle slopes they come seldom, and a fence over them would stand up in long fins
    const steep=TT.map((t,k)=>{const n=NS[k],a=Math.abs(n[0])>=Math.abs(n[1])&&Math.abs(n[0])>=Math.abs(n[2])?0:Math.abs(n[1])>=Math.abs(n[2])?1:2;return Math.abs(t[a])>=.3&&TOP[k]-top[k]<=1.05&&TOP[k]-FOOT[k]<=2;});   // and never taller than two cells: where the surface beside the line drops further (a pillar's foot on the cowl) the fence would stand up as a fin
    // and only where it stays on the panel: its top and its middle each within 12.5 mm of an occupied cell's centre (where the averaged normal leans off
    // the panel, as at a door frame's edge, the fence would stand out into the air beside it)
    const onPanel=x=>{const X=Math.round(x[0]),Y=Math.round(x[1]),Z=Math.round(x[2]);for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)for(let l=-1;l<=1;l++){const c=occ.get(K3(X+i,Y+j,Z+l));if(c&&c.c&&len3([X+i-x[0],Y+j-x[1],Z+l-x[2]])<=1.25)return true;}return false;};
    const g0=Q.map((q,k)=>onPanel(q.map((v,c)=>v+NS[k][c]*TOP[k]))&&onPanel(q.map((v,c)=>v+NS[k][c]*(TOP[k]+FOOT[k])/2))),grounded=g0.map((_,k)=>[-1,0,1].filter(j=>wrap(g0,k+j)).length>=2);   // a single miss between two hits is noise
    // and not on a crease (paint on top, rubber down the side): there the rubber falls away from the line, and a fence up to the paint's level
    // would stand out over it as a fin. Fences only where paint and rubber lie side by side on one surface.
    const flat=Q.map((_,k)=>[-3,-2,-1,0,1,2,3].filter(j=>wrap(crease,k+j)).length<=2);
    // and only beside the glass named for fences (the windshield: its pillars are what the owner looked at, and they are where the terraces
    // cross the line most; elsewhere the faces' covers alone are enough)
    const byFG=Q.map(q=>{const X=Math.round(q[0]),Y=Math.round(q[1]),Z=Math.round(q[2]);for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++)for(let l=-2;l<=2;l++)if(FG.has(K3(X+i,Y+j,Z+l)))return true;return false;});
    const fenceOn=steep.map((v,k)=>!bad[k]&&grounded[k]&&flat[k]&&byFG[k]&&[-1,0,1].every(j=>wrap(steep,k+j)));
    LNF.push({o,Q,S:SS,N:NS,SG,TOP,FOOT,closed,on:fenceOn});
    const li=LN.length;LN.push({Q,S:SS,T:TT,N:NS,sg:SG,closed,bad});
    for(let k=0;k<L;k++){const h=fk(Q[k][0],Q[k][1],Q[k][2]);(LH.get(h)||LH.set(h,[]).get(h)).push([li,k]);}
    if(opt.chains)(out.chains||(out.chains=[])).push({o,P,Q,N:NS,closed,sg,T:TT,bad,crease:N.map(n=>len3(n)<1.9),steep,grounded,fenceOn,TOP,FOOT,top});
  }
  // the fences (above), each side a strip of quads; their colours come from the drawn faces beside them (mkFrameSeals)
  for(const {o,Q,S,N,SG,TOP,FOOT,closed,on} of LNF){const D=out[o];if(!D)continue;const L=Q.length;
    for(const side of [1,-1]){const F={pos:[],nor:[],at:[],idx:[],sel:side>0?1:2};
      for(let k=0;k<L;k++){const lo=Q[k].map((v,c)=>v+N[k][c]*FOOT[k]),hi=Q[k].map((v,c)=>v+N[k][c]*TOP[k]);F.pos.push(...lo,...hi);F.nor.push(...N[k],...N[k]);
        // where to take the colour from: just to this side of the line, on the highest terrace
        F.at.push(Q[k].map((v,c)=>v+S[k][c]*SG[k]*side*.6+N[k][c]*TOP[k]));}
      for(let k=0;k<(closed?L:L-1);k++){if(!on[k]||!on[(k+1)%L])continue;const a=2*k,b=2*((k+1)%L),out_=S[k].map(v=>v*SG[k]*side);
        const P=i=>F.pos.slice(3*i,3*i+3),u=sub(P(b),P(a)),w=sub(P(a+1),P(a)),c=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]];
        if(dot(c,out_)>=0)F.idx.push(a,b,b+1,a,b+1,a+1);else F.idx.push(a,a+1,b+1,a,b+1,b);}
      D.fence.push(F);}}
  // split the faces by the lines: each paint or rubber face near a line is cut by the plane through the nearest point of the line, across it
  // (the plane holds the line and the surface's normal); the part on the other side of it is covered in the other colour
  const clip=(poly,fn)=>{const r=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],fa=fn(a),fb=fn(b);if(fa>=0)r.push(a);
    if((fa>=0)!==(fb>=0)){const t=fa/(fa-fb);r.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]);}}return r;};
  const area=poly=>{let x=0,y=0,z=0;for(let i=1;i+1<poly.length;i++){const u=sub(poly[i],poly[0]),v=sub(poly[i+1],poly[0]);x+=u[1]*v[2]-u[2]*v[1];y+=u[2]*v[0]-u[0]*v[2];z+=u[0]*v[1]-u[1]*v[0];}return Math.hypot(x,y,z)/2;};
  for(const F of FL){if(!out[F.o])continue;let best=null;const X=Math.floor(F.c[0]),Y=Math.floor(F.c[1]),Z=Math.floor(F.c[2]);
    for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++)for(let l=-2;l<=2;l++){const E=LH.get((X+i)+','+(Y+j)+','+(Z+l));if(!E)continue;
      for(const [li,k] of E){const d=len3(sub(F.c,LN[li].Q[k]));if(d<=REACHL&&(!best||d<best.d))best={d,li,k};}}
    if(!best)continue;const ln=LN[best.li],k=best.k,p0=ln.Q[k],sv=ln.S[k],tv=ln.T[k],Lq=ln.Q.length;if(ln.bad[k])continue;
    // past an open line's ends the stairs are left as they are
    if(!ln.closed&&((k===0&&dot(sub(F.c,p0),tv)<-.5)||(k===Lq-1&&dot(sub(F.c,p0),tv)>.5)))continue;
    // a face across the line (a terrace's riser the line runs down over) is left as it is: the cut through it would stand nearly upright on
    // it and show from the side as a spike
    if(Math.abs(dot(F.n,tv))>.45)continue;
    // nor a face on the panel's other side (its inner skin facing the cabin, the underside of a rail): it faces away from the surface the line
    // is drawn on, or lies more than a cell and a half under it. Through the glass those would show as flecks of paint inside the frame.
    {const nv=LN[best.li].N[k];if(dot(F.n,nv)<-.2||dot(sub(F.c,p0),nv)<-1.5)continue;}
    // the paint's side of the plane: s > 0 there
    const side=x=>ln.sg[k]*dot(sub(x,p0),sv),FC=FACES[F.f].c,poly=FC.map(c=>[F.cell[0]+c[0],F.cell[1]+c[1],F.cell[2]+c[2]]);
    const part=F.k===1?clip(poly,x=>-side(x)):clip(poly,x=>side(x));
    if(part.length<3||area(part)<.01)continue;
    out[F.o][F.k===1?'black':'paint'].push(opt.chains?{poly:part,f:F.f,cell:F.cell,li:best.li,k}:{poly:part,f:F.f,cell:F.cell});
  }
  return out;}
