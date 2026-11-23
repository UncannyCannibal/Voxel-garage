/* ===== SURFACE NET SKIN: a smooth surface drawn over a voxel panel (rendering only) =====
   The voxel grid stays the shape: every fit, collision and audit test still reads the grid (geometry.userData.src). What changes is what is drawn: instead of
   cube faces, one vertex per 2x2x2 block of cells that the surface passes through (a "surface net"), relaxed a few times toward its neighbours but never further
   than half a cell (5 mm on a 10 mm panel) from where the voxel surface is. A sloped pillar or a crowned roof then reads as one continuous surface instead of
   10 mm stairs, and an edge between two faces is rounded to about one cell (10 mm), as a pressed steel edge is.
   Colours stay per cell: every quad takes the colour of the solid cell it covers, so a 10 mm shut line, a gasket ring or a badge keeps its cells.
   Output: geoData-shaped buffers for the painted cells (sel 1) and the rest (sel 2), sharing positions and normals so the two meet without a seam. */
const SN_EDGES=(()=>{const e=[];for(let c=0;c<8;c++)for(const b of [1,2,4])if(!(c&b))e.push([c,c|b]);return e;})();
const SN_AMB=(()=>{const T=new Array(256).fill(null);for(let m=1;m<255;m++){const seen=new Set(),comps=[];
  for(let c=0;c<8;c++){if(m&(1<<c)||seen.has(c))continue;const comp=[],st=[c];seen.add(c);while(st.length){const a=st.pop();comp.push(a);for(const b of [1,2,4]){const n=a^b;if(!(m&(1<<n))&&!seen.has(n)){seen.add(n);st.push(n);}}}comps.push(comp);}
  if(comps.length>1)T[m]=comps;}return T;})();
function surfaceNet(g,opt){
  opt=opt||{};const iters=opt.iters===undefined?40:opt.iters,lam=opt.lambda===undefined?.6:opt.lambda;
  const nx=g.nx,ny=g.ny,nz=g.nz,syz=ny*nz;let D=g.d;
  let at=(i,j,k)=>(i<0||j<0||k<0||i>=nx||j>=ny||k>=nz)?-1:D[i*syz+j*nz+k];
  // thin skin: where a panel's shell is one cell thick along an axis (outside the measured volume on one side, inside it on the other: a stair of a diagonal
  // pillar), its outer and inner surfaces would share one row of net vertices, which then sit half-way through the sheet and draw a pit in the paint. The
  // drawn copy of the grid gets the missing inner cell (inner-layer colour), so the two surfaces stay apart; the voxel grid itself is not changed.
  if(opt.snap){D=Int32Array.from(g.d);const inside=opt.snap.inside,sc=opt.snap.scale||.5,INNER=opt.innerColor===undefined?0x2a2b2e:opt.innerColor,add=[];
    const out=(i,j,k)=>!inside((i+g.x0)*sc,(j+g.y0)*sc,(k+g.z0)*sc);
    for(let i=0;i<nx;i++)for(let j=0;j<ny;j++)for(let k=0;k<nz;k++){if(D[i*syz+j*nz+k]<0)continue;
      for(const [dx,dy,dz] of [[1,0,0],[0,1,0],[0,0,1]]){const a=at(i+dx,j+dy,k+dz),b=at(i-dx,j-dy,k-dz);if(a>=0||b>=0)continue;
        const oa=out(i+dx,j+dy,k+dz),ob=out(i-dx,j-dy,k-dz);if(oa===ob)continue;add.push(oa?[i-dx,j-dy,k-dz]:[i+dx,j+dy,k+dz]);}}
    for(const [x,y,z] of add)if(x>=0&&y>=0&&z>=0&&x<nx&&y<ny&&z<nz)D[x*syz+y*nz+z]=INNER;
    at=(i,j,k)=>(i<0||j<0||k<0||i>=nx||j>=ny||k>=nz)?-1:D[i*syz+j*nz+k];
    // ambiguous 2x2x2 blocks: where the empty corners of a block fall apart into separate groups (outside on one corner, the cabin on the opposite one: a
    // diagonal skin thinner than one cell), the net would fold one vertex through the skin. The groups lying wholly inside the volume are filled.
    for(let pass=0;pass<2;pass++){const fill=[];
      const o1=syz,o2=nz,o4=1;
      for(let i=0;i<nx-1;i++)for(let j=0;j<ny-1;j++){let b=i*syz+j*nz;for(let k=0;k<nz-1;k++,b++){
        const m=(D[b]>=0?1:0)|(D[b+o1]>=0?2:0)|(D[b+o2]>=0?4:0)|(D[b+o1+o2]>=0?8:0)|(D[b+o4]>=0?16:0)|(D[b+o1+o4]>=0?32:0)|(D[b+o2+o4]>=0?64:0)|(D[b+o1+o2+o4]>=0?128:0);
        if(m===0||m===255)continue;const T=SN_AMB[m];if(!T)continue;
        for(const comp of T){let allIn=true;for(const c of comp)if(out(i+(c&1),j+((c>>1)&1),k+((c>>2)&1))){allIn=false;break;}if(allIn)for(const c of comp)fill.push([i+(c&1),j+((c>>1)&1),k+((c>>2)&1)]);}}}
      for(const [x,y,z] of fill)if(x>=0&&y>=0&&z>=0&&x<nx&&y<ny&&z<nz)D[x*syz+y*nz+z]=INNER;if(!fill.length)break;}}
  const CY=ny+1,CZ=nz+1,vid=new Int32Array((nx+1)*CY*CZ).fill(-1);   // cube (ci,cj,ck), ci in -1..nx-1, spans cell centres ci..ci+1
  let P=[],CB=[];
  const vtx=(ci,cj,ck)=>{const key=((ci+1)*CY+(cj+1))*CZ+(ck+1);let v=vid[key];if(v>=0)return v;
    const o=[0,0,0,0,0,0,0,0];for(let c=0;c<8;c++)o[c]=at(ci+(c&1),cj+((c>>1)&1),ck+((c>>2)&1))>=0?1:0;
    let sx=0,sy=0,sz=0,n=0;for(const [a,b] of SN_EDGES)if(o[a]!==o[b]){sx+=((a&1)+(b&1))*.5;sy+=(((a>>1)&1)+((b>>1)&1))*.5;sz+=(((a>>2)&1)+((b>>2)&1))*.5;n++;}
    v=P.length/3;P.push(ci+sx/n,cj+sy/n,ck+sz/n);CB.push(ci,cj,ck);vid[key]=v;return v;};
  const Q=[],QC=[];   // quads (4 vertex ids) and the colour of the solid cell under each
  const dirs=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
  for(let i=0;i<nx;i++)for(let j=0;j<ny;j++){const base=i*syz+j*nz;for(let k=0;k<nz;k++){const c=D[base+k];if(c<0)continue;
    for(let d=0;d<6;d++){const [dx,dy,dz]=dirs[d];if(at(i+dx,j+dy,k+dz)>=0)continue;
      const ax=d>>1,L=[i,j,k];if(dx+dy+dz<0)L[ax]-=1;            // the edge's lower cell along the axis
      const u=(ax+1)%3,w=(ax+2)%3,cs=[[-1,-1],[0,-1],[0,0],[-1,0]],q=cs.map(([a,b])=>{const C=L.slice();C[u]+=a;C[w]+=b;return vtx(C[0],C[1],C[2]);});
      // orientation: the quad's normal points from the solid cell to the empty one
      const cu=[0,0,0],cw=[0,0,0];cu[u]=1;cw[w]=1;const nrm=[cu[1]*cw[2]-cu[2]*cw[1],cu[2]*cw[0]-cu[0]*cw[2],cu[0]*cw[1]-cu[1]*cw[0]];
      if(nrm[0]*dx+nrm[1]*dy+nrm[2]*dz<0)q.reverse();
      Q.push(q[0],q[1],q[2],q[3]);QC.push(c);}}}
  const NV=P.length/3;P=new Float32Array(P);CB=new Int32Array(CB);
  const deg=new Int32Array(NV+1);for(let q=0;q<Q.length;q+=4)for(let e=0;e<4;e++){deg[Q[q+e]+1]++;deg[Q[q+(e+1)%4]+1]++;}
  for(let v=0;v<NV;v++)deg[v+1]+=deg[v];const adj=new Int32Array(deg[NV]),fill=deg.slice(0,NV);
  for(let q=0;q<Q.length;q+=4)for(let e=0;e<4;e++){const a=Q[q+e],b=Q[q+(e+1)%4];adj[fill[a]++]=b;adj[fill[b]++]=a;}
  // relax: each free vertex moves toward the mean of its quad neighbours, kept inside its own cube (within half a cell of the voxel surface)
  const relax=(n_it,fixed)=>{let cur=P,nxt=new Float32Array(P.length);
    for(let it=0;it<n_it;it++){for(let v=0;v<NV;v++){if(fixed&&fixed[v]){nxt[v*3]=cur[v*3];nxt[v*3+1]=cur[v*3+1];nxt[v*3+2]=cur[v*3+2];continue;}
        let sx=0,sy=0,sz=0;const a0=deg[v],a1=deg[v+1],n=a1-a0;for(let a=a0;a<a1;a++){const b=adj[a]*3;sx+=cur[b];sy+=cur[b+1];sz+=cur[b+2];}
        for(let t=0;t<3;t++){const m=(t===0?sx:t===1?sy:sz)/n,p=cur[v*3+t]+(m-cur[v*3+t])*lam,lo=CB[v*3+t]+.02,hi=CB[v*3+t]+.98;nxt[v*3+t]=p<lo?lo:(p>hi?hi:p);}}
      const tmp=cur;cur=nxt;nxt=tmp;}
    P=cur;};
  // normals: area-weighted over every quad (both meshes), so painted and unpainted quads meet with one normal
  const normals=()=>{const N=new Float32Array(NV*3);
    for(let q=0;q<Q.length;q+=4){const a=Q[q]*3,b=Q[q+1]*3,c=Q[q+2]*3,d=Q[q+3]*3;
      const ex=P[c]-P[a],ey=P[c+1]-P[a+1],ez=P[c+2]-P[a+2],fx=P[d]-P[b],fy=P[d+1]-P[b+1],fz=P[d+2]-P[b+2];   // diagonals: their cross product is twice the quad's area vector
      const nx_=ey*fz-ez*fy,ny_=ez*fx-ex*fz,nz_=ex*fy-ey*fx;for(const v of [a,b,c,d]){N[v]+=nx_;N[v+1]+=ny_;N[v+2]+=nz_;}}
    for(let v=0;v<NV;v++){const l=Math.hypot(N[v*3],N[v*3+1],N[v*3+2])||1;N[v*3]/=l;N[v*3+1]/=l;N[v*3+2]/=l;}return N;};
  if(iters>0&&NV)relax(iters);
  // snap (opt.snap = {inside(x,y,z) in world units, scale: world units per cell}): where the panel's outer skin has a measured shape behind it, each vertex of
  // that skin is moved along its normal onto the true surface (inside 0.8 cell behind it, outside 0.8 cell in front, the crossing found by bisection), so
  // the drawn panel is the measured surface itself, not a smoothed staircase; vertices of cuts, openings and inner skins have no such crossing and stay
  // where the relaxation put them, then the free vertices next to snapped ones relax again to meet them
  if(opt.snap&&NV){const S=opt.snap.inside,sc=opt.snap.scale||.5,N0=normals(),fixed=new Uint8Array(NV),R=.8;
    for(let v=0;v<NV;v++){const px=P[v*3]+g.x0,py=P[v*3+1]+g.y0,pz=P[v*3+2]+g.z0,nx_=N0[v*3],ny_=N0[v*3+1],nz_=N0[v*3+2];
      const In=t=>S((px+nx_*t)*sc,(py+ny_*t)*sc,(pz+nz_*t)*sc);
      if(!In(-R)||In(R))continue;let lo=-R,hi=R;for(let b=0;b<9;b++){const m=(lo+hi)/2;if(In(m))lo=m;else hi=m;}const t=(lo+hi)/2;
      P[v*3]+=nx_*t;P[v*3+1]+=ny_*t;P[v*3+2]+=nz_*t;fixed[v]=1;}
    // the snapped skin's edges (where it meets a cut face: a shut line, a window opening) still step along the voxel cut in plan; snapped vertices next to
    // free ones slide along the surface (normal component removed) toward their neighbours' mean, which straightens those edges, then the free ones relax again
    {const rim=new Uint8Array(NV);for(let v=0;v<NV;v++){if(!fixed[v])continue;for(let a=deg[v];a<deg[v+1];a++)if(!fixed[adj[a]]){rim[v]=1;break;}}
     for(let ring=0;ring<2;ring++){const add=[];for(let v=0;v<NV;v++){if(!fixed[v]||rim[v])continue;for(let a=deg[v];a<deg[v+1];a++)if(rim[adj[a]]===ring+1||(ring===0&&rim[adj[a]])){add.push(v);break;}}for(const v of add)rim[v]=ring+2;}
     for(let it=0;it<10;it++){const nx2=P.slice();for(let v=0;v<NV;v++){if(!rim[v])continue;let sx=0,sy=0,sz=0;const a0=deg[v],a1=deg[v+1],n=a1-a0;for(let a=a0;a<a1;a++){const b=adj[a]*3;sx+=P[b];sy+=P[b+1];sz+=P[b+2];}
         const dx=sx/n-P[v*3],dy=sy/n-P[v*3+1],dz=sz/n-P[v*3+2],dn=dx*N0[v*3]+dy*N0[v*3+1]+dz*N0[v*3+2],tx=dx-dn*N0[v*3],ty=dy-dn*N0[v*3+1],tz=dz-dn*N0[v*3+2];
         for(let t=0;t<3;t++){const p=P[v*3+t]+.5*(t===0?tx:t===1?ty:tz),lo=CB[v*3+t]-.3,hi=CB[v*3+t]+1.3;nx2[v*3+t]=p<lo?lo:(p>hi?hi:p);}}
       P=nx2;}}
    relax(8,fixed);}
  // seat (opt.seat = {inside, scale}): a part resting on a measured panel (a spoiler on the hatch, a flare on the fender): its vertices that face into that
  // panel within 0.8 cell of its surface are moved onto it, so the part sits on the panel as drawn, with neither a gap nor an overlap
  if(opt.seat&&NV){const S=opt.seat.inside,sc=opt.seat.scale||.5,N0=normals(),fixed=new Uint8Array(NV),R=.8;
    for(let v=0;v<NV;v++){const px=P[v*3]+g.x0,py=P[v*3+1]+g.y0,pz=P[v*3+2]+g.z0,nx_=N0[v*3],ny_=N0[v*3+1],nz_=N0[v*3+2];
      const In=t=>S((px+nx_*t)*sc,(py+ny_*t)*sc,(pz+nz_*t)*sc);
      if(In(-R)||!In(R))continue;let lo=-R,hi=R;for(let b=0;b<9;b++){const m=(lo+hi)/2;if(In(m))hi=m;else lo=m;}const t=(lo+hi)/2;
      P[v*3]+=nx_*t;P[v*3+1]+=ny_*t;P[v*3+2]+=nz_*t;fixed[v]=1;}
    relax(6,fixed);}
  const N=normals();
  return {P,N,Q,QC,NV,CB,x0:g.x0,y0:g.y0,z0:g.z0};   // CB: each vertex's cube (grid cell coordinates), so a caller can match vertices between nets
}
// geoData-shaped buffers from a surface net: sel 1 = painted quads (white vertex colour, the paint material tints it), sel 2 = every other quad in its cell's colour.
// Vertices are split per colour so a one-cell detail keeps a crisp colour edge; positions and normals are the net's, so there is no shading seam.
function netGeo(g,net,sel,paintHex){
  const {P,N,Q,QC,x0,y0,z0}=net,pos=[],nor=[],col=[],idx=[],map=new Map();
  for(let q=0;q<Q.length;q+=4){const c=QC[q>>2],isP=c===PAINT||c===PAINT_SHADE,sf=c===PAINT_SHADE?SHADE_F:1;if(sel===1&&!isP)continue;if(sel===2&&isP)continue;
    const rgb=isP&&sel===1?[sf,sf,sf]:(isP?hexRGB(paintHex===undefined?0xaa2222:paintHex).map(v=>v*sf):hexRGB(c)),ids=[];
    for(let e=0;e<4;e++){const v=Q[q+e],key=v*4+(isP?0:1)+'|'+c;let id=map.get(key);
      if(id===undefined){id=pos.length/3;map.set(key,id);pos.push(P[v*3]+x0,P[v*3+1]+y0,P[v*3+2]+z0);nor.push(N[v*3],N[v*3+1],N[v*3+2]);col.push(rgb[0],rgb[1],rgb[2]);}ids.push(id);}
    // split along the shorter diagonal
    const d02=Math.hypot(pos[ids[0]*3]-pos[ids[2]*3],pos[ids[0]*3+1]-pos[ids[2]*3+1],pos[ids[0]*3+2]-pos[ids[2]*3+2]),d13=Math.hypot(pos[ids[1]*3]-pos[ids[3]*3],pos[ids[1]*3+1]-pos[ids[3]*3+1],pos[ids[1]*3+2]-pos[ids[3]*3+2]);
    if(d02<=d13)idx.push(ids[0],ids[1],ids[2],ids[0],ids[2],ids[3]);else idx.push(ids[0],ids[1],ids[3],ids[1],ids[2],ids[3]);}
  return {pos,nor,col,idx,src:g,sel};
}
// cells of an inner-layer colour that face the OUTSIDE (an empty neighbour outside the measured volume) are outer skin: painted. Where a two-cell shell
// thins to one cell at a step, the shelling marks that cell as inner; drawn as a smooth skin it showed as a dark pit in the paint.
function repaintExposed(G,inside,from,scale){const sc=scale||.5,F=new Set(from),fix=[];
  eachCell(G,null,(i,j,k,n)=>{if(!F.has(G.d[n]))return;for(const [a,b,c] of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]])if(G.get(i+a,j+b,k+c)<0&&!inside((i+a)*sc,(j+b)*sc,(k+c)*sc)){fix.push(n);return;}});
  for(const n of fix)G.d[n]=PAINT;return fix.length;}
if(typeof module!=='undefined')module.exports={surfaceNet,netGeo,repaintExposed};
