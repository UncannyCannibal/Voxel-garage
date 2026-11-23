/* ===== E30 CORE — 1 voxel = 20 mm. x forward(+), y up, z = car's right(+). ===== */
const VMM=20, PAINT=0x00fe01, PAINT_SHADE=0x00fe02, SHADE_F=.34;   // PAINT_SHADE: a shut line's gap, drawn as the paint itself in shadow (34 %) so it reads as a thin gap in any colour, not a black outline
function clampv(x,a,b){return Math.min(b,Math.max(a,x));}
function sm(a,b,x){const t=clampv((x-a)/(b-a),0,1);return t*t*(3-2*t);}
function hashv(x,y,z){let h=Math.imul(x|0,374761393)^Math.imul(y|0,668265263)^Math.imul(z|0,2147483647);h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return (h>>>0)/4294967295;}

class Grid{
  constructor(x0,x1,y0,y1,z0,z1){
    this.x0=x0;this.y0=y0;this.z0=z0;this.x1=x1;this.y1=y1;this.z1=z1;
    this.nx=x1-x0+1;this.ny=y1-y0+1;this.nz=z1-z0+1;
    this.d=new Int32Array(this.nx*this.ny*this.nz).fill(-1);
  }
  ix(x,y,z){return ((x-this.x0)*this.ny+(y-this.y0))*this.nz+(z-this.z0);}
  inb(x,y,z){return x>=this.x0&&x<=this.x1&&y>=this.y0&&y<=this.y1&&z>=this.z0&&z<=this.z1;}
  set(x,y,z,c){x=Math.round(x);y=Math.round(y);z=Math.round(z);if(this.inb(x,y,z))this.d[this.ix(x,y,z)]=c;}   // coordinates are rounded: a fractional index would silently drop the cell
  get(x,y,z){x=Math.round(x);y=Math.round(y);z=Math.round(z);return this.inb(x,y,z)?this.d[this.ix(x,y,z)]:-1;}
  fill(fn){let n=0;for(let x=this.x0;x<=this.x1;x++)for(let y=this.y0;y<=this.y1;y++)for(let z=this.z0;z<=this.z1;z++){const c=fn(x,y,z);if(c>=0)this.d[n]=c;n++;}}
  carve(fn){let n=0;for(let x=this.x0;x<=this.x1;x++)for(let y=this.y0;y<=this.y1;y++)for(let z=this.z0;z<=this.z1;z++){if(this.d[n]>=0&&fn(x,y,z))this.d[n]=-1;n++;}}
  count(){let c=0;for(let i=0;i<this.d.length;i++)if(this.d[i]>=0)c++;return c;}
  list(){const out=[];let n=0;for(let x=this.x0;x<=this.x1;x++)for(let y=this.y0;y<=this.y1;y++)for(let z=this.z0;z<=this.z1;z++){const v=this.d[n++];if(v>=0)out.push([x,y,z,v]);}return out;}
}
/* helpers to place simple solids */
function box(g,x0,x1,y0,y1,z0,z1,c){[x0,x1]=[Math.min(x0,x1),Math.max(x0,x1)];[y0,y1]=[Math.min(y0,y1),Math.max(y0,y1)];[z0,z1]=[Math.min(z0,z1),Math.max(z0,z1)];   // bounds in either order (sd*a, sd*b on the left side)
  for(let x=Math.ceil(x0);x<=Math.floor(x1);x++)for(let y=Math.ceil(y0);y<=Math.floor(y1);y++)for(let z=Math.ceil(z0);z<=Math.floor(z1);z++)g.set(x,y,z,c);}
function cylX(g,cy,cz,r,x0,x1,c,rin){for(let x=Math.ceil(x0);x<=Math.floor(x1);x++)for(let y=Math.floor(cy-r);y<=Math.ceil(cy+r);y++)for(let z=Math.floor(cz-r);z<=Math.ceil(cz+r);z++){const d=Math.hypot(y-cy,z-cz);if(d<=r&&(rin===undefined||d>=rin))g.set(x,y,z,c);}}
function cylY(g,cx,cz,r,y0,y1,c,rin){for(let y=Math.ceil(y0);y<=Math.floor(y1);y++)for(let x=Math.floor(cx-r);x<=Math.ceil(cx+r);x++)for(let z=Math.floor(cz-r);z<=Math.ceil(cz+r);z++){const d=Math.hypot(x-cx,z-cz);if(d<=r&&(rin===undefined||d>=rin))g.set(x,y,z,c);}}
function cylZ(g,cx,cy,r,z0,z1,c,rin){for(let z=Math.ceil(z0);z<=Math.floor(z1);z++)for(let x=Math.floor(cx-r);x<=Math.ceil(cx+r);x++)for(let y=Math.floor(cy-r);y<=Math.ceil(cy+r);y++){const d=Math.hypot(x-cx,y-cy);if(d<=r&&(rin===undefined||d>=rin))g.set(x,y,z,c);}}
function segFill(g,a,b,r,c){const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2])/.5)+1;for(let i=0;i<=n;i++){const t=i/n,px=a[0]+(b[0]-a[0])*t,py=a[1]+(b[1]-a[1])*t,pz=a[2]+(b[2]-a[2])*t;for(let x=Math.floor(px-r);x<=Math.ceil(px+r);x++)for(let y=Math.floor(py-r);y<=Math.ceil(py+r);y++)for(let z=Math.floor(pz-r);z<=Math.ceil(pz+r);z++)if((x-px)**2+(y-py)**2+(z-pz)**2<=r*r)g.set(x,y,z,c);}}

/* ---------- geometry from grid (exposed faces, vertex colours) ---------- */
const FACES=[
  {n:[1,0,0],c:[[.5,-.5,-.5],[.5,.5,-.5],[.5,.5,.5],[.5,-.5,.5]],s:.9},
  {n:[-1,0,0],c:[[-.5,-.5,.5],[-.5,.5,.5],[-.5,.5,-.5],[-.5,-.5,-.5]],s:.9},
  {n:[0,1,0],c:[[-.5,.5,.5],[.5,.5,.5],[.5,.5,-.5],[-.5,.5,-.5]],s:1},
  {n:[0,-1,0],c:[[-.5,-.5,-.5],[.5,-.5,-.5],[.5,-.5,.5],[-.5,-.5,.5]],s:.66},
  {n:[0,0,1],c:[[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]],s:.82},
  {n:[0,0,-1],c:[[.5,-.5,-.5],[-.5,-.5,-.5],[-.5,.5,-.5],[.5,.5,-.5]],s:.82}
];
function hexRGB(h){return [((h>>16)&255)/255,((h>>8)&255)/255,(h&255)/255];}
// smooth shading normals: each cell's exposed faces give a local 'stair' normal; summing them over a 5-voxel neighbourhood recovers the true surface
// direction of a stepped slope (treads + risers), independent of what is behind the skin. Used for rendering only.
// paintOnly: count only the painted outer skin (a 2-voxel shell's inner faces would cancel the outer ones);
// others: neighbouring panels (doors, hood, trunk, glass) that close this panel's seams, so a shut line does not shade as a rounded edge
function smoothNormals(g,paintOnly,others,hf,outside){
  // outside(X,Y,Z) (grid index units, optional): true where a point lies outside the panel's measured volume. A face counts as the skin's outer face only if the
  // empty cell beyond it is outside: a one-cell skin (a lid over its open inner frame) then faces out, not both ways, and cavities never count as outside
  const EX=new Map(),occ=(X,Y,Z)=>{if(g.get(X,Y,Z)>=0)return true;if(others)for(const o of others)if(o.get(X,Y,Z)>=0)return true;return false;};
  for(let i=0;i<g.nx;i++)for(let j=0;j<g.ny;j++)for(let k=0;k<g.nz;k++){const n=(i*g.ny+j)*g.nz+k;if(g.d[n]<0||(paintOnly&&g.d[n]!==PAINT&&g.d[n]!==PAINT_SHADE))continue;const X=i+g.x0,Y=j+g.y0,Z=k+g.z0;let a=0,b=0,c=0;
    for(const F of FACES)if(!occ(X+F.n[0],Y+F.n[1],Z+F.n[2])&&(!outside||outside(X+F.n[0],Y+F.n[1],Z+F.n[2]))){a+=F.n[0];b+=F.n[1];c+=F.n[2];}
    if(a||b||c)EX.set(n,[a,b,c]);}
  const at=(X,Y,Z)=>{const i=X-g.x0,j=Y-g.y0,k=Z-g.z0;if(i<0||j<0||k<0||i>=g.nx||j>=g.ny||k>=g.nz)return -1;return (i*g.ny+j)*g.nz+k;};
  // hf (radius in cells): the skin's heightfield along the axis it mostly faces (up for a roof, sideways for a door, forward for a nose), taken per column
  // as its outermost skin cell; the normal is the slope of a plane fitted to that heightfield over the radius, so a gently curved panel shades as one smooth
  // surface instead of bands at its 10 mm terraces (columns more than 4 cells off are other surfaces: left out). Fields are built when first needed.
  const N=[g.nx,g.ny,g.nz],HFS=new Map();
  const field=(ax,sg)=>{const key=ax*2+(sg>0?1:0);if(HFS.has(key))return HFS.get(key);const ua=(ax+1)%3,va=(ax+2)%3,F=new Int16Array(N[ua]*N[va]).fill(-32768);
    for(const [n,e] of EX){if(e[ax]*sg<=0)continue;const k=n%g.nz,j=((n-k)/g.nz)%g.ny,i=(n-k-j*g.nz)/(g.nz*g.ny),c=[i,j,k],q=c[ua]*N[va]+c[va],h=c[ax];
      if(F[q]===-32768||(sg>0?h>F[q]:h<F[q]))F[q]=h;}
    HFS.set(key,F);return F;};
  const plane=(c,ax,sg)=>{const ua=(ax+1)%3,va=(ax+2)%3,F=field(ax,sg),u0=c[ua],v0=c[va],h0=c[ax];if(F[u0*N[va]+v0]!==h0)return null;   // the column's outermost cell only
    let S=0,Su=0,Sv=0,Suu=0,Svv=0,Suv=0,Sh=0,Suh=0,Svh=0;
    for(let a=-hf;a<=hf;a++){const u=u0+a;if(u<0||u>=N[ua])continue;for(let b=-hf;b<=hf;b++){const v=v0+b;if(v<0||v>=N[va]||a*a+b*b>hf*hf)continue;const h=F[u*N[va]+v];if(h===-32768||Math.abs(h-h0)>4)continue;
      const dh=h-h0;S++;Su+=a;Sv+=b;Suu+=a*a;Svv+=b*b;Suv+=a*b;Sh+=dh;Suh+=a*dh;Svh+=b*dh;}}
    if(S<hf*hf)return null;const mu=Su/S,mv=Sv/S,mh=Sh/S,cuu=Suu/S-mu*mu,cvv=Svv/S-mv*mv,cuv=Suv/S-mu*mv,cuh=Suh/S-mu*mh,cvh=Svh/S-mv*mh,det=cuu*cvv-cuv*cuv;if(Math.abs(det)<1e-6)return null;
    const gu=(cuh*cvv-cvh*cuv)/det,gv=(cvh*cuu-cuh*cuv)/det,l=Math.hypot(gu,gv,1),r=[0,0,0];r[ax]=sg/l;r[ua]=-sg*gu/l;r[va]=-sg*gv/l;return r;};
  return (X,Y,Z)=>{let r=null;
    {let sx=0,sy=0,sz=0;for(let a=-2;a<=2;a++)for(let b=-2;b<=2;b++)for(let c=-2;c<=2;c++){if(a*a+b*b+c*c>6.5)continue;const n=at(X+a,Y+b,Z+c);if(n<0)continue;const e=EX.get(n);if(!e)continue;const w=1/(1+a*a+b*b+c*c);sx+=e[0]*w;sy+=e[1]*w;sz+=e[2]*w;}
      const l=Math.hypot(sx,sy,sz);if(l<1e-6)return null;r=[sx/l,sy/l,sz/l];}
    if(hf){const ax=Math.abs(r[0])>=Math.abs(r[1])&&Math.abs(r[0])>=Math.abs(r[2])?0:(Math.abs(r[1])>=Math.abs(r[2])?1:2),sg=r[ax]>0?1:-1;
      if(Math.abs(r[ax])>(PCA_R>0?.5:.75)&&(PCA_R>0||ax===1)){const p=plane([X-g.x0,Y-g.y0,Z-g.z0],ax,sg);if(p&&Math.abs(p[ax])>.45)return p;}}   // (without PCA_R, as before: top surfaces only)
    if(PCA_R>0){const pn=pcaNormal(g,paintOnly,EX,at,X,Y,Z,PCA_R);if(pn)return pn;}   // where no heightfield plane fits (edges, arches, creases): the fitted plane of the nearby skin
    return r;};
}
// PCA_R (cells): when > 0, the smooth normal of every skin cell is the normal of the plane fitted (principal components) through the skin cells within that
// radius that face the same way: the 10 mm terraces of a curved panel then shade as the panel's real surface (no ripples, no banding on the flanks), while
// the cubes themselves, and so the voxel silhouette, stay as they are. Set per car before its panels are built (0: the averaged exposure normals as before).
let PCA_R=0,PCA_FLAT=.1;   // PCA_FLAT: the largest smallest-eigenvalue (as a share of the mean) a neighbourhood may have and still count as a plane
function pcaNormal(g,paintOnly,EX,at,X,Y,Z,R){const c0=EX.get(at(X,Y,Z));if(!c0)return null;let n=0,mx=0,my=0,mz=0;const P=[];
  for(let a=-R;a<=R;a++)for(let b=-R;b<=R;b++)for(let c=-R;c<=R;c++){if(a*a+b*b+c*c>R*R+.01)continue;const q=at(X+a,Y+b,Z+c);if(q<0)continue;const e=EX.get(q);if(!e||e[0]*c0[0]+e[1]*c0[1]+e[2]*c0[2]<=0)continue;P.push(a,b,c);mx+=a;my+=b;mz+=c;n++;}
  if(n<7)return null;mx/=n;my/=n;mz/=n;let xx=0,xy=0,xz=0,yy=0,yz=0,zz=0;
  for(let i=0;i<P.length;i+=3){const x=P[i]-mx,y=P[i+1]-my,z=P[i+2]-mz;xx+=x*x;xy+=x*y;xz+=x*z;yy+=y*y;yz+=y*z;zz+=z*z;}
  // smallest eigenvalue of the symmetric 3x3 (trigonometric solution), its eigenvector from the cross product of two rows of (C - l I)
  const p1=xy*xy+xz*xz+yz*yz,q=(xx+yy+zz)/3,p2=(xx-q)**2+(yy-q)**2+(zz-q)**2+2*p1,pp=Math.sqrt(p2/6);if(pp<1e-9)return null;
  const B=[[(xx-q)/pp,xy/pp,xz/pp],[xy/pp,(yy-q)/pp,yz/pp],[xz/pp,yz/pp,(zz-q)/pp]];
  const detB=B[0][0]*(B[1][1]*B[2][2]-B[1][2]*B[2][1])-B[0][1]*(B[1][0]*B[2][2]-B[1][2]*B[2][0])+B[0][2]*(B[1][0]*B[2][1]-B[1][1]*B[2][0]);
  const r=Math.max(-1,Math.min(1,detB/2)),phi=Math.acos(r)/3,l=q+2*pp*Math.cos(phi+2*Math.PI/3);   // the smallest of the three
  if(l>PCA_FLAT*q)return null;   // the nearby skin is not near a plane (a saddle, as at the A-pillar's root, or a tight crease): no fitted normal there, the averaged one instead
  const M=[[xx-l,xy,xz],[xy,yy-l,yz],[xz,yz,zz-l]],cr=(u,v)=>[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
  let best=null,bl=0;for(const [i,j] of [[0,1],[0,2],[1,2]]){const v=cr(M[i],M[j]),L=Math.hypot(...v);if(L>bl){bl=L;best=v;}}if(!best||bl<1e-9)return null;
  let s=0;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)for(let c=-1;c<=1;c++){const q2=at(X+a,Y+b,Z+c);if(q2<0)continue;const e=EX.get(q2);if(e)s+=e[0]*best[0]+e[1]*best[1]+e[2]*best[2];}
  const f=(s<0?-1:1)/bl;return [best[0]*f,best[1]*f,best[2]*f];}
// PAINT_PCA_R (owner, Nov 13: the paint striped black and white or red and white on the roofs, pillars and round the front doors): every voxel car's
// painted cells are shaded with the normal of the panel's fitted surface (radius 3 cells), on treads and risers alike, so a 10 mm staircase reads as
// one painted surface. The cubes are still there (the outline, the edges, the geometry the checks measure); what went is the light catching every
// tread (white glints in rows) and every riser in shade (dark lines). Cube-shaded flanks (PCA_R 0, as signed off on the EF) made those stripes. Set
// it to 0 to go back. The cars' module code reads it (PCA_R=PAINT_PCA_R).
let PAINT_PCA_R=3;   // PAINT-03 tried 6 (smoother paint); the owner, Nov 15: "Put it back" - he had not asked for smoother paint
let SMOOTH_BLEND=.9,PCA_BLEND=1,PCA_RISER=1;   // PCA_BLEND / PCA_RISER: how far a cube face's normal leans toward the panel's fitted surface normal (a tread / a riser, turned 60 degrees or more from the surface). Were .62 / .92: the terraces still caught the light as stripes   // how far a smoothed face's normal moves from the flat face normal toward the true slope: 0 = flat voxel faces, 1 = fully smoothed. Paint stays matte either way.
function geoData(g,paintHex,jit,sel,smooth){
  const pos=[],nor=[],col=[],idx=[];let vc=0;
  const pr=hexRGB(paintHex===undefined?0xaa2222:paintHex);
  const J=jit===undefined?.06:jit,others=Array.isArray(smooth)?smooth:(smooth&&smooth.o)||null,wy=smooth&&smooth.wy,SN=smooth?smoothNormals(g,sel===1,others,smooth&&smooth.hf,smooth&&smooth.outside):null;   // smooth: true | [neighbouring panels] | {o:[neighbouring panels], wy:[a,b]} (wy: only surfaces facing up between a and b are smoothed, so near-vertical flanks stay crisp)
  const CN=new Map(),cellN=new Map(),snC=(X,Y,Z)=>{const k=X+','+Y+','+Z;if(!cellN.has(k))cellN.set(k,(g.get(X,Y,Z)>=0)?SN(X,Y,Z):null);return cellN.get(k);};
  const cornerN=(cx,cy,cz)=>{const k=cx+','+cy+','+cz;if(CN.has(k))return CN.get(k);let a=0,b=0,c=0;
    for(const dx of [-.5,.5])for(const dy of [-.5,.5])for(const dz of [-.5,.5]){const X=cx+dx,Y=cy+dy,Z=cz+dz;if(g.get(X,Y,Z)<0||(sel===1&&g.get(X,Y,Z)!==PAINT&&g.get(X,Y,Z)!==PAINT_SHADE))continue;const v=snC(X,Y,Z);if(v){a+=v[0];b+=v[1];c+=v[2];}}
    const l=Math.hypot(a,b,c),r=l<1e-6?null:[a/l,b/l,c/l];CN.set(k,r);return r;};
  for(let i=0;i<g.nx;i++){const X=i+g.x0;for(let j=0;j<g.ny;j++){const Y=j+g.y0;for(let k=0;k<g.nz;k++){
    const v=g.d[(i*g.ny+j)*g.nz+k];if(v<0)continue;const isP=v===PAINT||v===PAINT_SHADE;if(sel===1&&!isP)continue;if(sel===2&&isP)continue;const Z=k+g.z0;let base=null,cn=undefined;
    for(let f=0;f<6;f++){const F=FACES[f];if(g.get(X+F.n[0],Y+F.n[1],Z+F.n[2])>=0)continue;
      if(!base){const sf=v===PAINT_SHADE?SHADE_F:1,rgb=sel===1?[sf,sf,sf]:(isP?pr.map(c=>c*sf):hexRGB(v)),JP=isP&&PCA_R>0?J*.3:J,jj=1-JP+2*JP*hashv(X,Y,Z);base=[rgb[0]*jj,rgb[1]*jj,rgb[2]*jj];}
      let n=F.n,sh=F.s,useSmooth=false;
      if(smooth){if(cn===undefined)cn=SN(X,Y,Z);useSmooth=!!cn&&cn[0]*F.n[0]+cn[1]*F.n[1]+cn[2]*F.n[2]>-.15;}
      for(let q=0;q<4;q++){const cx=X+F.c[q][0],cy=Y+F.c[q][1],cz=Z+F.c[q][2];pos.push(cx,cy,cz);
        if(useSmooth){const m0=cornerN(cx,cy,cz)||cn,B=SMOOTH_BLEND===0?0:PCA_R>0?((n[0]*m0[0]+n[1]*m0[1]+n[2]*m0[2])<.5?PCA_RISER:PCA_BLEND):SMOOTH_BLEND*(wy?Math.max(smooth.flank||0,Math.min(1,(m0[1]-wy[0])/(wy[1]-wy[0]))):1),mx=B*m0[0]+(1-B)*n[0],my=B*m0[1]+(1-B)*n[1],mz=B*m0[2]+(1-B)*n[2],ml=Math.hypot(mx,my,mz)||1,m=[mx/ml,my/ml,mz/ml];nor.push(m[0],m[1],m[2]);const s2=(.83+.17*m0[1])*B+sh*(1-B);col.push(base[0]*s2,base[1]*s2,base[2]*s2);}   // per-corner normal shared by every face that meets there: continuous shading
        else{nor.push(n[0],n[1],n[2]);col.push(base[0]*sh,base[1]*sh,base[2]*sh);}}
      idx.push(vc,vc+1,vc+2,vc,vc+2,vc+3);vc+=4;}
  }}}
  return {pos,nor,col,idx,src:g,sel:sel||0};   // src/sel: the voxel grid behind the mesh (scene_audit.js tests what is drawn)
}
// smooth glass: a continuous surface fitted through the voxel glass (rendering; the voxel glass stays the collision geometry).
// kind 'slope' (windshield, rear window): y = a + b x + c z^2 over the cells; kind 'side' (door and quarter glass): z = a + b y + c x.
// One quad per column (slope) or per row (side) spanning the cells' extent, so the edge follows the opening and the face has no steps.
function glassSurface(G,kind){
  const cells=G.list();if(!cells.length)return null;
  // least squares for t = k0 + k1 f1 + k2 f2. A term whose feature never varies over the cells (a pane wound down to its last row has a single y, and a single
  // column a single x) cannot be told from the constant: it is left out (k = 0) rather than solved, which divided by zero and drew the pane at NaN (Nov 23).
  const fit=(rows)=>{const use=[0];for(const q of [1,2]){let lo=Infinity,hi=-Infinity;for(const [f] of rows){lo=Math.min(lo,f[q]);hi=Math.max(hi,f[q]);}if(hi-lo>1e-9)use.push(q);}
    const n=use.length,A=use.map(()=>new Array(n).fill(0)),B=new Array(n).fill(0);
    for(const [f,t] of rows){for(let i=0;i<n;i++){B[i]+=f[use[i]]*t;for(let j=0;j<n;j++)A[i][j]+=f[use[i]]*f[use[j]];}}
    for(let i=0;i<n;i++){let p=i;for(let r=i+1;r<n;r++)if(Math.abs(A[r][i])>Math.abs(A[p][i]))p=r;[A[i],A[p]]=[A[p],A[i]];[B[i],B[p]]=[B[p],B[i]];
      for(let r=i+1;r<n;r++){const m=A[r][i]/A[i][i];for(let c=i;c<n;c++)A[r][c]-=m*A[i][c];B[r]-=m*B[i];}}
    const y=new Array(n).fill(0);for(let i=n-1;i>=0;i--){let s=B[i];for(let c=i+1;c<n;c++)s-=A[i][c]*y[c];y[i]=s/A[i][i];}
    const x=[0,0,0];use.forEach((q,i)=>x[q]=y[i]);return x;};
  const pos=[],idx=[],quads=[];let vc=0,dev=0;
  if(kind==='slope'){
    const k=fit(cells.map(([x,y,z])=>[[1,x,z*z],y])),f=(x,z)=>k[0]+k[1]*x+k[2]*z*z;
    for(const [x,y,z] of cells)dev=Math.max(dev,Math.abs(y-f(x,z)));
    const byZ={};for(const [x,,z] of cells){const r=byZ[z]||(byZ[z]=[1e9,-1e9]);r[0]=Math.min(r[0],x);r[1]=Math.max(r[1],x);}
    for(const z in byZ){const [x0,x1]=byZ[z],Z=+z,P=[[x0-.5,Z-.5],[x1+.5,Z-.5],[x1+.5,Z+.5],[x0-.5,Z+.5]];for(const [x,zz] of P)pos.push(x,f(x,zz),zz);idx.push(vc,vc+1,vc+2,vc,vc+2,vc+3);vc+=4;quads.push(P.map(([x,zz])=>[x,f(x,zz),zz]));}
  }else{
    const k=fit(cells.map(([x,y,z])=>[[1,y,x],z])),f=(x,y)=>k[0]+k[1]*y+k[2]*x;
    for(const [x,y,z] of cells)dev=Math.max(dev,Math.abs(z-f(x,y)));
    const byY={};for(const [x,y] of cells){const r=byY[y]||(byY[y]=[1e9,-1e9]);r[0]=Math.min(r[0],x);r[1]=Math.max(r[1],x);}
    for(const y in byY){const [x0,x1]=byY[y],Y=+y,P=[[x0-.5,Y-.5],[x1+.5,Y-.5],[x1+.5,Y+.5],[x0-.5,Y+.5]];for(const [x,yy] of P)pos.push(x,yy,f(x,yy));idx.push(vc,vc+1,vc+2,vc,vc+2,vc+3);vc+=4;quads.push(P.map(([x,yy])=>[x,yy,f(x,yy)]));}
  }
  return {pos,idx,quads,dev};
}

/* ---------- body profile: MEASURED tables (ref/e30/SOURCES.md) ----------
   The exterior is generated at 10 mm (HR = 2 cells per unit) from these tables. Millimetres: x rearward from the FRONT BUMPER TIP, y up from the ground,
   half-widths from the centreline. MEASURED = read off the-blueprints.com 1987 E30 coupe drawing (canvas pixel scans, 12.854 mm/px from the 2570 mm wheelbase
   between the fitted hub circles); side-view heights normalised so the roof is the catalogue 1380 mm (x 0.9942); plan widths to the catalogue 1645 mm (x 1.0154);
   sections from its front and rear views (x 1.008). Cross-checked against the getoutlines.com 1988 325i coupe drawing (windshield, roof and rear window positions
   agree within 40 mm). VERIFIED = catalogue (length 4325, width 1645, height 1380, wheelbase 2570). World: x = (2175 - mm)/20 (front axle 765 mm behind the tip).
   r.hi holds the 10 mm panels (what is drawn); r.body / r.hood / ... are the same panels coarsened to 20 mm cells (collision, fitting). */
const HR=2;                                    // body cells per world unit
const E30M={
  // centreline top profile: nose (hood leading edge) -> hood -> cowl -> windshield -> roof -> rear window -> deck -> tail (MEASURED)
  top:[[75,767],[96,780],[109,785],[122,790],[148,800],[175,805],[212,816],[250,821],[300,833],[350,845],[400,852],[450,858],[500,866],[550,872],[600,878],[650,886],[700,890],
       [750,894],[800,897],[850,902],[900,904],[950,905],[1000,907],[1040,914],[1080,920],[1112,928],[1138,937],[1150,941],[1175,936],[1200,934],[1220,937],[1240,950],
       [1266,967],[1292,984],[1318,1006],[1343,1022],[1369,1044],[1395,1061],[1420,1079],[1446,1096],[1472,1112],[1497,1126],[1523,1145],[1549,1162],[1575,1178],
       [1600,1196],[1626,1209],[1652,1225],[1677,1239],[1703,1254],[1729,1273],[1755,1288],[1780,1302],[1795,1312],[1808,1326],[1822,1337],[1845,1344],[1870,1352],
       [1950,1355],[2010,1357],[2050,1364],[2100,1367],[2150,1370],[2200,1374],[2250,1378],[2300,1379],[2400,1380],[2500,1381],[2600,1380],[2700,1379],[2800,1377],
       [2900,1369],[3000,1366],[3080,1362],[3110,1355],[3160,1351],[3194,1343],[3210,1334],[3233,1312],[3258,1290],[3284,1268],[3310,1251],[3336,1232],[3361,1210],
       [3387,1193],[3413,1168],[3438,1149],[3464,1128],[3490,1107],[3516,1086],[3541,1062],[3567,1038],[3593,1020],[3618,998],[3644,974],[3670,954],[3696,944],
       [3721,937],[3760,935],[3850,935],[3900,931],[3950,927],[3990,925],[4030,922],[4080,921],[4120,918],[4150,914],[4185,909],[4215,904],[4232,898],[4243,889],[4249,876],[4252,860]],
  // window bottom (DLO) line: from the cowl up to the windshield base, the door and quarter glass, sweeping up into the deck behind the C-pillar (MEASURED)
  belt:[[1220,937],[1300,900],[1430,864],[2000,864],[2420,873],[2600,888],[3250,895],[3450,922],[3660,935]],
  // plan half-width of the lower body (MEASURED top view): arches flared 20 mm over the doors; nose and tail corners
  plan:[[75,560],[90,615],[109,680],[130,730],[148,760],[186,770],[264,782],[341,793],[418,803],[500,808],[572,812],[650,815],[765,819],[1000,819],[1035,806],
        [1080,796],[1150,792],[1300,794],[1400,798],[1536,800],[2650,800],[2800,797],[3050,800],[3150,808],[3194,819],[3348,822],[3420,818],[3503,812],[3580,803],
        [3657,797],[3734,791],[3850,792],[4004,789],[4081,781],[4158,777],[4197,768],[4230,759],[4252,748]],
  // lower-body section: fraction of the plan half-width by height (MEASURED front and rear views): the side is widest at the 580 mm swage line, tucks
  // under to the sill and leans in above to the shoulder under the belt
  // the shoulder crease (photographs: the feature line through the door handles, from the headlamps' top to the tail lamps' top) at 790 mm: below it the side
  // leans in gently (about 6 degrees), above it the shoulder turns in at about 34 degrees to the belt (a kink in the section, not a blend)
  sLow:[[226,.94],[260,.955],[300,.97],[400,.99],[480,1],[650,1],[700,.996],[750,.99],[790,.983],[830,.955],[850,.94],[870,.92],[960,.92]],
  // greenhouse: half-width by height at its widest (MEASURED front and rear views): the side glass leans in about 24 degrees, the roof edge rolls over
  tumble:[[863,728],[880,726],[919,713],[945,700],[970,690],[1009,680],[1035,670],[1060,657],[1086,651],[1099,642],[1120,635],[1145,622],[1163,612],[1189,600],
          [1215,592],[1228,583],[1253,571],[1266,557],[1292,544],[1318,538],[1330,518],[1343,486],[1356,411],[1369,252],[1381,0]],
  aPillar:{x0:1307,y0:864,h0:705,x1:1800,y1:1292,h1:565,k:.45},       // windshield side edge / A-pillar, base -> top (MEASURED side and top views); behind it the greenhouse widens 0.45 mm per mm
  cPillar:{x0:3187,y0:1292,x1:3659,y1:870,h:475,hb:670,k:1.8,pw:85},       // rear window side edge, top -> base (MEASURED side view); its half-width 475 mm at the roof, 670 at the deck (MEASURED top view 482 / 678,
                                                                        // rear view 477 / 663: the glass is a trapezoid); ahead of it the C-pillar sail widens 1.8 mm per mm out to the greenhouse side (a narrow sail, DESIGN from photos)
                                                                        // pw: the C-pillar's rounded top runs on 85 mm beyond the glass's side edge before it rolls over into the sail (photographs: the pillars frame the
                                                                        // glass from behind; with the greenhouse ending AT the glass edge the window wrapped down the roll-over and stood off the pillar)
  dgFront:{x0:1432,y0:863,x1:1896,y1:1246},                             // door glass front edge (MEASURED)
  bPillar:{xt:2520,yt:1283,xb:2430,yb:870,rear:2600},                   // B-pillar: door glass rear edge (slanted), quarter glass front edge (MEASURED)
  qgRear:{x0:3015,y0:1283,x1:3285,y1:910},                              // quarter glass rear edge (MEASURED)
  dloDrop:90,                                                            // window tops 90 mm under the roof's centreline (MEASURED 86-91)
  arch:{f:{x:765,y:300,r:365},r:{x:3335,y:310,r:375}},                   // wheel openings (MEASURED fitted circles)
  door:{front:1350,rear:2435,bottom:300},                               // door shut lines and lower edge (MEASURED)
  hood:{x0:1150,half:703},trunk:{x0:3700,half:648,lowY:790},            // hood rear edge at the cowl, lid front edge at the rear window base, lid lower edge at the tail-lamp tops (MEASURED)
  rocker:226,nose:75,tail:4252                                          // sill bottom; nose and tail faces (MEASURED)
};
const u=m=>m/20,wxm=m=>(2175-m)/20,mmx=x=>2175-x*20;
/* ---- body variants: the coupe (E30M as measured) and the Touring (estate, 1988-94). The Touring shares the coupe's nose, front doors' lower panels, lower body,
   arches, tail lamps and bumpers (E30 parts catalogue; e30zone.net "Bodywork": rear doors 4-door and Touring only, tailgate Touring only); above the belt behind
   the B-pillar it has its own roof, rear doors with a fixed rear pane, a bonded window between the C- and D-pillars (the Hofmeister kink on the D-pillar) and
   the tailgate. MEASURED from BMW's brochure drawing of the 1988 325i Touring (the-blueprints.com 60221, 500 x 447 px): side view registered on the hubs
   (8.79 mm/px over the wheelbase), behind the rear hub stretched 7 % so the tail-lamp face lands on the coupe's (the drawing's tail is short), heights from the
   roof (1376 mm, the coupe's) down to the belt at 10.7 mm/px (the drawing is taller above the belt than below it). setE30Variant() swaps the tables in place. ---- */
const E30M_COUPE=JSON.parse(JSON.stringify(E30M));
const E30M_TOURING={
  top:E30M.top.filter(([m])=>m<=2500).concat([[2600,1380],[2800,1379],[3000,1378],[3200,1377],[3400,1376],[3480,1374],[3540,1369],[3600,1357],[3680,1330],[3773,1282],
       [3867,1222],[3961,1155],[4055,1085],[4121,1030],[4170,985],[4200,945],[4222,905],[4238,880],[4249,868],[4252,860]]),   // roof on to the tailgate's top edge, the tailgate raked about 37 deg
  belt:[[1220,937],[1300,900],[1430,864],[2000,864],[2420,873],[2600,888],[3250,895],[3920,905],[4185,912]],                    // window line level to the D-pillar's kink
  cPillar:{x0:3540,y0:1345,x1:4185,y1:912,h:480,hb:615,k:1.6,pw:85},   // here the TAILGATE glass's side edge, roof -> base, its half-width at both ends: at the top inside the
                                                                        // roof's drip rails (the roof rolls over beyond 538 mm), at the base about the load opening's 48 in
                                                                        // (drawing's top view); ahead of it the D-pillar's sail widens into the greenhouse
  trunk:{x0:3480,half:640,lowY:790},                                    // the tailgate: its top edge on the roof's rear lip, its lower edge at the lamp tops beside the lamps
  // the 4-door front door's window: its rear edge stands upright at 2350 (the coupe's leans back 90 mm); behind its frame the black B-pillar, the rear door's frame and
  // glass from 2480 (MEASURED from the drawing's pixel rows: front frame 2348-2418, pillar 2418-2471)
  bPillar:{xt:2352,yt:1283,xb:2348,yb:870,rear:2480},
  touring:{tgLowC:600,tgHalfLow:290,                                    // and between the lamps (inner edges 292 mm off the centreline) down to 600 mm: it carries the plate panel
    rdFront:2455,rdRearBelt:2999,rdArch:420,                            // rear doors: front shut line, rear shut line at the belt, then round the rear arch 45 mm off its lip
    rdBar:2983,rdBarW:44,                                               // the drop glass's rear edge: the frame's vertical bar, 44 mm, the fixed pane behind it
    cF:{x0:3100,y0:1300,x1:3188,y1:895},                                // the fixed pane's rear edge (glass), the door frame's rear member behind it to the door's
    cS:{x0:3135,y0:1300,x1:3231,y1:895},                                // shut line on the C-pillar, the body-colour C-pillar on to the bonded window's front edge
    cR:{x0:3200,y0:1300,x1:3334,y1:895},                                // (MEASURED: three lines in the drawing's rows 288-320 px, about 9, 10 and 13 deg off vertical)
    glassBase:912,                                                      // the tailgate glass's lower edge
    dP:[[3492,1324],[3600,1272],[3700,1210],[3800,1110],[3870,1020],[3905,955],[3912,925],[3890,906]]}   // D-pillar: the bonded window's rear edge, roof -> belt, with the kink
};
let E30V='coupe';
function setE30Variant(v){if(v===E30V)return;E30V=v;const src=JSON.parse(JSON.stringify(E30M_COUPE));if(v==='touring')Object.assign(src,JSON.parse(JSON.stringify(E30M_TOURING)));
  for(const k of Object.keys(E30M))if(!(k in src))delete E30M[k];
  for(const k in src){const a=E30M[k],b=src[k];if(a&&b&&typeof a==='object'&&typeof b==='object'&&!Array.isArray(a)&&!Array.isArray(b)){for(const kk of Object.keys(a))delete a[kk];Object.assign(a,b);}else E30M[k]=b;}
  TOP=E30M.top.map(([m,y])=>[wxm(m),u(y)]);GH_X0=wxm(E30M.aPillar.x0);GH_X1=wxm(E30M.cPillar.x1);
  TRUNK_X0=wxm(E30M.trunk.x0);TRUNK_HALF=u(E30M.trunk.half);TRUNK_LOW=u(E30M.trunk.lowY);X_QG=wxm(E30M.bPillar.rear);
  if(typeof module!=='undefined'&&module.exports)Object.assign(module.exports,{TOP,X_QG,TRUNK_X0,TRUNK_HALF,TRUNK_LOW});}
function tabv(T,v){if(v<=T[0][0])return T[0][1];for(let i=0;i<T.length-1;i++){const a=T[i],b=T[i+1];if(v<=b[0])return a[1]+(b[1]-a[1])*(v-a[0])/(b[0]-a[0]);}return T[T.length-1][1];}
const NOSE_X=wxm(E30M.nose), REAR_X=wxm(E30M.tail);   // nose panel face (headlamp and grille faces), rear panel face (tail lamp faces)
let TOP=E30M.top.map(([m,y])=>[wxm(m),u(y)]);
const BELT=u(864), ROOF=69, ROCK=u(E30M.rocker), AX_F=70.5, AX_R=-58, WR=15;   // axles: front overhang 765 mm, wheelbase 2570 mm (auto-data.net 761 / 2570, VERIFIED); BELT: the door's top edge
// lowest point of the body shell along its length: the nose panel ends above the bumper; the tail is cut away under the rear panel (the bumper hangs below it)
const YBOT=x=>x>NOSE_X-6.4?29.5:(x<-76?ROCK+Math.min(1,(-76-x)/21.5)*(25.5-ROCK):ROCK);
function topY(x){const T=TOP,n=T.length;if(x>T[0][0]||x<T[n-1][0])return x>NOSE_X?20:40;let lo=0,hi=n-1;while(hi-lo>1){const m=(lo+hi)>>1;if(T[m][0]>=x)lo=m;else hi=m;}   // TOP runs front to rear (x falling): binary search for its segment
  const a=T[lo],b=T[hi],t=a[0]===b[0]?0:(a[0]-x)/(a[0]-b[0]);return a[1]+(b[1]-a[1])*t;}
// greenhouse span: between the A-pillar's foot and the C-pillar's foot the window line is the belt table; ahead of and behind it the hood and deck are the top
let GH_X0=wxm(E30M.aPillar.x0), GH_X1=wxm(E30M.cPillar.x1);
function beltAt(x){if(x>GH_X0||x<GH_X1)return topY(x);return Math.min(topY(x),u(tabv(E30M.belt,mmx(x))));}
function pw(x){return tabv(E30M.plan,mmx(x))/800;}   // plan width relative to the doors (800 mm): kept for the parts that scale with it
const A_=E30M.aPillar,C_=E30M.cPillar;
function aEnv(x,y){const t=clampv((y*20-A_.y0)/(A_.y1-A_.y0),0,1),xa=A_.x0+(A_.x1-A_.x0)*t,ha=A_.h0+(A_.h1-A_.h0)*t,m=mmx(x);return u(ha+Math.max(0,m-xa)*A_.k);}
function cEnv(x,y){const t=clampv((C_.y0-y*20)/(C_.y0-C_.y1),0,1),xc=C_.x0+(C_.x1-C_.x0)*t,m=mmx(x);return u(C_.h+(C_.hb-C_.h)*t+(C_.pw||0)+Math.max(0,xc-m)*C_.k);}   // pw: the pillar's top beside the glass
// the rear window's half-width at x: where its side edge (the C-pillar line) passes this x
function rwHalf(x){const t=clampv((mmx(x)-C_.x0)/(C_.x1-C_.x0),0,1);return u(C_.h+(C_.hb-C_.h)*t);}
// where the pillar envelopes meet the greenhouse section the surfaces blend over 30 mm (a soft minimum) instead of meeting in a crease down the C-pillar
const smin=(a,b,k)=>.5*(a+b-Math.sqrt((a-b)*(a-b)+k*k));
function ghHalf(x,y){const sh=clampv(1380-topY(x)*20,0,40);return smin(smin(u(tabv(E30M.tumble,y*20+sh)),aEnv(x,y),1.5),cEnv(x,y),1.5);}
// the shoulder crease's height along the car (photographs): it leaves the nose at the top of the headlamp panel (760 mm), rises along the front fender to the door
// handles' line (790 mm) at the A-pillar and runs level from there to the tail lamps' tops; the section (sLow, its crease at 790) is slid up or down to it
function creaseShift(x){const m=mmx(x);return m>=1300?0:(790-760)*(1-clampv((m-75)/(1300-75),0,1));}
function halfBase(x,y){
  const b=beltAt(x);let ys=Math.min(y,b)*20;const ws=clampv((ys-600)/100,0,1);ys+=creaseShift(x)*ws;
  // the tail-lamp housings (photographs): over the lamps' height (610-790 mm) the last 80 mm of the quarter panels is the lamp's flat vertical side, so the lamp's
  // outer edge is straight up and down in a rear view (the side's lean above the 650 mm line starts ahead of it, faired in over 40 mm)
  if(ys>610&&ys<=790){const t=clampv((REAR_X+6-x)/2,0,1);ys+=(610-ys)*t;}
  const lo=u(tabv(E30M.plan,mmx(x)))*tabv(E30M.sLow,ys);
  if(y<=b)return lo;const gg=ghHalf(x,y),S=1.5+2.5*aFoot(x);return y<b+S?lo+(gg-lo)*sm(b,b+S,y):gg;   // a 30 mm rolled shoulder from the body side into the glass (80 mm at the A-pillar's foot)
}
// the A-pillar's foot (photographs): from the door glass's front edge forward to just past the A-pillar line, the shoulder from the belt into the greenhouse is
// 80 mm tall instead of 30, so the pillar's root and the door frame's front corner, where the mirror stands, come out to the door skin and fair into the pillar
// above (with the 30 mm shoulder they stood 30-50 mm in from the door skin right behind the mirror and read as a flat, crooked corner); 1 = full, fading over 20 mm
function aFoot(x){const x0=wxm(E30M.dgFront.x0)-.5,x1=xA(BELT)+1;if(x<x0-1||x>x1+1)return 0;if(x>=x0&&x<=x1)return 1;return x<x0?sm(x0-1,x0,x):1-sm(x1,x1+1,x);
}
const EDGE_R=1.7, ROCK_R=1.5, ARCH_R=u(E30M.arch.f.r), LIP=.3;
const ARCH_F={x:AX_F,y:u(E30M.arch.f.y),r:u(E30M.arch.f.r)}, ARCH_RR={x:AX_R,y:u(E30M.arch.r.y),r:u(E30M.arch.r.r)};
/* ---- running-gear hard points shared by the body (strut towers, wheelhouse tubs, frame rails, rear spring and damper pockets) and the rig (e30_rig.js, car_e30.js).
   World units. DESIGN, laid out after E30 photographs and its published layout (front MacPherson struts on a forged lower arm, rack on the axle carrier; rear
   semi-trailing arms with the spring ahead of the axle and the damper behind it, its top in the trunk). The scene audit checks every part against the others. ----
   front: strut axis through low (top of the knuckle) and top (the top mount under the tower's cap); the spring's outer edge stays within 561 mm of the centreline at
   the tyre's shoulder (the fit rule's strutInner 566 mm less 5 mm); lbj the lower ball joint (110 mm inboard of the stock tyre's inner sidewall, inside the rim);
   arm pivots: the front one on the axle carrier, the rear one in a bracket under the frame rail. rear: arm pivots on the sub-frame ahead of the axle, spring and
   damper axes (x, |z|), their body seats. */
const E30_SUSP={
  front:{low:[AX_F,17,26.2],top:[AX_F-3,38,23],towerR:4,towerTop:38.5,wallZ:20.5,railZ:[17,20.25],railY:[13.5,17.5],roofR:19,shelf:30.5,
         lbj:[AX_F,9.5,30.5],armF:[AX_F+1,10.5,14.5],armR:[AX_F-13.5,7.75,17.5],carrier:{x0:AX_F-1.5,x1:AX_F+2.5,y0:10,y1:13.25,z:20.25},
         rack:{dx:-5.25,y:11.25,half:13.5},steer:[-5,-3.5,-1.65],springLow:24.5,springTop:36.5},
  rear:{pivI:[AX_R+16,9.5,13.5],pivO:[AX_R+13,9.5,25],ci:[AX_R+1.5,-5,28],co:[AX_R,-4.5,31.5],sub:{x0:AX_R+11,x1:AX_R+16,y:8.25,z:25,arch:7.75},spring:{x:AX_R+4.5,z:22,r:4.8,top:23,seat:13.25,pad:3.6},damper:{x:AX_R-3.5,z:27.25,low:-4.5}}
};
// the strut's axis: [x, z] (right side) at height y
function strutAxis(y){const F=E30_SUSP.front,t=(y-F.low[1])/(F.top[1]-F.low[1]);return [F.low[0]+(F.top[0]-F.low[0])*t,F.low[2]+(F.top[2]-F.low[2])*t];}
function halfAt(x,y){                          // half-width of the body side at (x,y): cross-section with the rolled top edge and the tucked rocker
  let r=halfBase(x,y);
  const ty=topY(x);if(x<=NOSE_X&&x>=REAR_X&&ty<beltAt(x)+.5){const dt=ty-y;if(dt>=0&&dt<EDGE_R){const q=EDGE_R-dt;r-=EDGE_R-Math.sqrt(Math.max(0,EDGE_R*EDGE_R-q*q));}}   // hood and deck edges roll into the sides
  if(y>=ROCK&&y<ROCK+ROCK_R){const q=ROCK+ROCK_R-y;r-=ROCK_R-Math.sqrt(Math.max(0,ROCK_R*ROCK_R-q*q));}
  return r;
}
// plan-view corners: the nose and the tail are rounded in plan by the plan table itself; the headlamps and tail lamps follow noseX / rearX
const NOSE_RC=3, REAR_RC=2.5;
const NOSE_XC=NOSE_X-NOSE_RC, NOSE_ZC=halfAt(NOSE_XC,34)-NOSE_RC, REAR_XC=REAR_X+REAR_RC, REAR_ZC=halfAt(REAR_XC,38)-REAR_RC;
function noseX(az){return az<=NOSE_ZC?NOSE_X:NOSE_XC+Math.sqrt(Math.max(0,NOSE_RC*NOSE_RC-(az-NOSE_ZC)*(az-NOSE_ZC)));}
function rearX(az){return az<=REAR_ZC?REAR_X:REAR_XC-Math.sqrt(Math.max(0,REAR_RC*REAR_RC-(az-REAR_ZC)*(az-REAR_ZC)));}
// the A-pillar bases (photographs): ahead of the doors, between the hood's rear corners and the A-pillar line, the pillar's root falls away from the windshield's
// side edge to the fender top (the window line) at 45 degrees, so it meets the fender and the hood's rear corner instead of standing up as a block at the
// windshield base's height across the whole corner
function aBaseCut(x,y,az){const xa=xA(BELT);if(x>=HOOD_X0||x<=xa)return false;
  const t=(HOOD_X0-x)/(HOOD_X0-xa),fT=(topY(HOOD_X0)-.6)*(1-t)+(BELT+.6)*t;if(y<=fT)return false;   // the fender top: from the hood's rear corner down to the door's top edge
  const e=aEnv(x,y)-1.5;if(az<=e)return false;return y>Math.max(fT,topY(x)-(az-e));}
// is (x,y,z) inside the body's solid outer volume (before arches and cavities are cut)? The same test the body builder fills with, for parts that must stay outside it
function bodySolid(x,y,z){if(x>NOSE_X+1e-6||x<REAR_X-1e-6)return false;if(y<YBOT(x)-1e-6||y>topY(x)+1e-6)return false;const az=Math.abs(z);if(aBaseCut(x,y,az))return false;
  if(az>Math.floor((halfAt(x,y)+archLip(x,y))*HR+1e-9)/HR+1e-6)return false;
  if(x>NOSE_XC){const c=halfAt(NOSE_XC,y)-NOSE_RC;if(az>c&&Math.hypot(x-NOSE_XC,az-c)>NOSE_RC)return false;}
  if(x<REAR_XC){const c=halfAt(REAR_XC,y)-REAR_RC;if(az>c&&Math.hypot(x-REAR_XC,az-c)>REAR_RC)return false;}
  return true;}
// the same outer volume without the voxel rounding: what the painted skin's surface net is snapped to (surfnet.js), so the drawn surface is the measured one
function bodySurfIn(x,y,z){if(x>NOSE_X||x<REAR_X)return false;if(y<YBOT(x)||y>topY(x))return false;const az=Math.abs(z),h=halfAt(x,y)+archLip(x,y);if(az>h)return false;if(aBaseCut(x,y,az))return false;
  if(x>NOSE_XC){const c=halfAt(NOSE_XC,y)-NOSE_RC;if(az>c&&Math.hypot(x-NOSE_XC,az-c)>NOSE_RC)return false;}
  if(x<REAR_XC){const c=halfAt(REAR_XC,y)-REAR_RC;if(az>c&&Math.hypot(x-REAR_XC,az-c)>REAR_RC)return false;}
  return true;}
function archLip(x,y){let l=0;for(const a of [ARCH_F,ARCH_RR]){const d=Math.hypot(x-a.x,y-a.y);if(d>=a.r&&d<a.r+1.8)l=Math.max(l,LIP*(1-(d-a.r)/1.8));}return l;}
function profDist(x,y){                       // distance from (x,y) to the top profile polyline (the painted skin of the hood, roof and deck follows it in every direction)
  let best=1e9;for(let i=0;i<TOP.length-1;i++){const a=TOP[i],b=TOP[i+1],dx=b[0]-a[0],dy=b[1]-a[1],L=dx*dx+dy*dy,t=L?clampv(((x-a[0])*dx+(y-a[1])*dy)/L,0,1):0;best=Math.min(best,Math.hypot(x-(a[0]+dx*t),y-(a[1]+dy*t)));}return best;}
const DOOR_F=wxm(E30M.door.front), DOOR_R=wxm(E30M.door.rear), DOOR_B=u(E30M.door.bottom);
const HOOD_X0=wxm(E30M.hood.x0), HOOD_HALF=u(E30M.hood.half);let TRUNK_X0=wxm(E30M.trunk.x0), TRUNK_HALF=u(E30M.trunk.half), TRUNK_LOW=u(E30M.trunk.lowY);
function lineX(L,y){const t=clampv((y*20-L.y0)/(L.y1-L.y0),0,1);return wxm(L.x0+(L.x1-L.x0)*t);}
function xA(y){return wxm(A_.x0+(A_.x1-A_.x0)*clampv((y*20-A_.y0)/(A_.y1-A_.y0),0,1));}          // A-pillar line (windshield side edge)
function xC(y){return wxm(C_.x0+(C_.x1-C_.x0)*clampv((C_.y0-y*20)/(C_.y0-C_.y1),0,1));}          // C-pillar line (rear window side edge)
function xDG(y){return lineX(E30M.dgFront,y);}                                                      // door glass front edge
function xBP(y){const B=E30M.bPillar;return wxm(B.xb+(B.xt-B.xb)*clampv((y*20-B.yb)/(B.yt-B.yb),0,1));}   // door glass rear edge (B-pillar front)
let X_QG=wxm(E30M.bPillar.rear);                                                                  // quarter glass front edge (B-pillar rear)
function xQR(y){return lineX(E30M.qgRear,y);}                                                       // quarter glass rear edge

/* ---------- 10 mm grids and helpers (world-unit arguments) ---------- */
function hgrid(x0,x1,y0,y1,z0,z1){return new Grid(Math.round(x0*HR),Math.round(x1*HR),Math.round(y0*HR),Math.round(y1*HR),Math.round(z0*HR),Math.round(z1*HR));}
function hset(G,x,y,z,c){G.set(Math.round(x*HR),Math.round(y*HR),Math.round(z*HR),c);}
function hget(G,x,y,z){return G.get(Math.round(x*HR),Math.round(y*HR),Math.round(z*HR));}
function eachCell(G,b,fn){                      // b = [x0,x1,y0,y1,z0,z1] in world units (or null = whole grid); fn(i,j,k,idx) on cell indices
  const i0=b?Math.max(G.x0,Math.ceil(b[0]*HR-1e-9)):G.x0,i1=b?Math.min(G.x1,Math.floor(b[1]*HR+1e-9)):G.x1,j0=b?Math.max(G.y0,Math.ceil(b[2]*HR-1e-9)):G.y0,j1=b?Math.min(G.y1,Math.floor(b[3]*HR+1e-9)):G.y1,k0=b?Math.max(G.z0,Math.ceil(b[4]*HR-1e-9)):G.z0,k1=b?Math.min(G.z1,Math.floor(b[5]*HR+1e-9)):G.z1;
  for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const base=((i-G.x0)*G.ny+(j-G.y0))*G.nz-G.z0;for(let k=k0;k<=k1;k++)fn(i,j,k,base+k);}
}
function carveW(G,b,fn){eachCell(G,b,(i,j,k,n)=>{if(G.d[n]>=0&&fn(i/HR,j/HR,k/HR,G.d[n]))G.d[n]=-1;});}
function fillW(G,b,fn){eachCell(G,b,(i,j,k,n)=>{const c=fn(i/HR,j/HR,k/HR);if(c>=0)G.d[n]=c;});}
// hollow a solid in place: keep the outer t layers, colour them with colorFn(x,y,z,innerLayer). Uses byte masks so a 10 mm car body stays light on memory.
function shellHi(S,colorFn,t){
  const n=S.d.length,sx=S.ny*S.nz,sy=S.nz;let cur=new Uint8Array(n);for(let p=0;p<n;p++)cur[p]=S.d[p]>=0?1:0;
  for(let q=0;q<t;q++){const nx=new Uint8Array(n);
    for(let i=1;i<S.nx-1;i++)for(let j=1;j<S.ny-1;j++){let p=i*sx+j*sy+1;for(let k=1;k<S.nz-1;k++,p++)if(cur[p]&&cur[p+sx]&&cur[p-sx]&&cur[p+sy]&&cur[p-sy]&&cur[p+1]&&cur[p-1])nx[p]=1;}
    if(q<t-1){cur=nx;}else{ // last erosion: cur = cells at depth <= t-1 kept as 'inner layer' test, nx = core
      for(let i=0;i<S.nx;i++)for(let j=0;j<S.ny;j++){let p=i*sx+j*sy;for(let k=0;k<S.nz;k++,p++){
        if(S.d[p]<0)continue;if(nx[p]){S.d[p]=-1;continue;}
        const adj=(i<S.nx-1&&nx[p+sx])||(i>0&&nx[p-sx])||(j<S.ny-1&&nx[p+sy])||(j>0&&nx[p-sy])||(k<S.nz-1&&nx[p+1])||(k>0&&nx[p-1]);
        S.d[p]=colorFn((i+S.x0)/HR,(j+S.y0)/HR,(k+S.z0)/HR,!!adj);}}
      return S;}
  }
  return S;
}
// coarsen a 10 mm grid to 20 mm cells (cell index = world unit). A coarse cell is filled when >= thr of its 8 weighted sub-cells are (hi cells straddle the coarse boundaries).
function coarsen(G,thr,b){
  const X0=Math.floor((G.x0-1)/2),X1=Math.ceil((G.x1+1)/2),Y0=Math.floor((G.y0-1)/2),Y1=Math.ceil((G.y1+1)/2),Z0=Math.floor((G.z0-1)/2),Z1=Math.ceil((G.z1+1)/2);
  const C=b?new Grid(b[0],b[1],b[2],b[3],b[4],b[5]):new Grid(X0,X1,Y0,Y1,Z0,Z1);
  const acc=new Float32Array(C.d.length),bw=new Float32Array(C.d.length);
  const ax=I=>(I&1)?[[(I-1)/2,.5],[(I+1)/2,.5]]:[[I/2,1]];
  eachCell(G,null,(i,j,k,n)=>{const v=G.d[n];if(v<0)return;const xs=ax(i),ys=ax(j),zs=ax(k);
    for(const [X,wx] of xs)for(const [Y,wy] of ys)for(const [Z,wz] of zs){if(!C.inb(X,Y,Z))continue;const q=C.ix(X,Y,Z),w=wx*wy*wz;acc[q]+=w;if(w>bw[q]||(w===bw[q]&&v===PAINT)){bw[q]=w;C.d[q]=v;}}});
  for(let q=0;q<acc.length;q++)if(acc[q]<thr)C.d[q]=-1;
  return C;
}

/* ---------- build the panels ---------- */
function buildE30Body(){
  const INT=0x2a2b2e, UNDER=0x15171a, SASH=0x17181a, GASK=0x131416, SEAM=0x1d1112;
  const S=hgrid(Math.floor(REAR_X-1),Math.ceil(NOSE_X+1),0,71.5,-42.5,42.5);
  // 1. solid outer volume from the real profile: side profile x cross-section, rounded plan corners, wheel-arch lips
  for(let i=S.x0;i<=S.x1;i++){const x=i/HR;if(x>NOSE_X||x<REAR_X)continue;const ty=topY(x);
    for(let j=S.y0;j<=S.y1;j++){const y=j/HR;
      const yb=YBOT(x);if(y<yb||y>ty)continue;
      const h=halfAt(x,y)+archLip(x,y),K=Math.floor(h*HR+1e-9),base=((i-S.x0)*S.ny+(j-S.y0))*S.nz-S.z0;
      const nzc=x>NOSE_XC?halfAt(NOSE_XC,y)-NOSE_RC:99,rzc=x<REAR_XC?halfAt(REAR_XC,y)-REAR_RC:99;
      for(let k=-K;k<=K;k++){const az=Math.abs(k)/HR;
        if(x>NOSE_XC&&az>nzc&&Math.hypot(x-NOSE_XC,az-nzc)>NOSE_RC)continue;
        if(x<REAR_XC&&az>rzc&&Math.hypot(x-REAR_XC,az-rzc)>REAR_RC)continue;
        if(aBaseCut(x,y,az))continue;
        S.d[base+k]=1;}}}
  // 2. wheel arches (cylinders through the outer wall)
  carveW(S,null,(x,y,z)=>(Math.abs(z)>19&&Math.hypot(x-ARCH_F.x,y-ARCH_F.y)<ARCH_F.r)||(Math.abs(z)>24&&Math.hypot(x-ARCH_RR.x,y-ARCH_RR.y)<ARCH_RR.r));   // rear wheelhouse inner wall at 500 mm from the centreline
  // 3. cut the moving panels out of the solid
  const IS_T=E30V==='touring';
  const hood=hgrid(HOOD_X0-.5,NOSE_X+.5,30,50,-HOOD_HALF-.5,HOOD_HALF+.5),trunk=IS_T?hgrid(REAR_X-.5,TRUNK_X0+.5,u(E30M.touring.tgLowC)-1,71,-TRUNK_HALF-.5,TRUNK_HALF+.5):hgrid(REAR_X-.5,TRUNK_X0+.5,TRUNK_LOW-1,50,-TRUNK_HALF-.5,TRUNK_HALF+.5),
        doorL=hgrid(Math.min(xBP(ROOF)-2,DOOR_R-1),DOOR_F+.5,DOOR_B-1,70,-42.5,0),doorR=hgrid(Math.min(xBP(ROOF)-2,DOOR_R-1),DOOR_F+.5,DOOR_B-1,70,0,42.5);   // (the 4-door's upright window frame ends ahead of the door's rear edge)
  const take=(dst,pred)=>eachCell(dst,null,(i,j,k)=>{const x=i/HR,y=j/HR,z=k/HR;const n=S.ix(i,j,k);if(!S.inb(i,j,k)||S.d[n]<0)return;if(pred(x,y,z)){dst.d[dst.ix(i,j,k)]=S.d[n];S.d[n]=-1;}});
  const HT=2.7;
  take(hood,(x,y,z)=>x>=HOOD_X0&&x<=NOSE_X&&Math.abs(z)<=HOOD_HALF&&profDist(x,y)<HT&&y>=33);
  // ---- the Touring's own panels (E30M.touring): rear doors, tailgate ----
  const TT=IS_T?E30M.touring:null;
  const RD_F=TT?wxm(TT.rdFront):0,RA=TT?u(TT.rdArch):0,RD_RB=TT?wxm(TT.rdRearBelt):0;
  // the rear door's rear edge below the belt: upright at 2999 mm down to the arch, then round it 45 mm off the lip (to 2915 at the sill)
  const rdRear=y=>{const dy=y-ARCH_RR.y,r=Math.sqrt(Math.max(0,RA*RA-dy*dy)),xa=ARCH_RR.x+r;return y>=ARCH_RR.y&&xa<=RD_RB?RD_RB:Math.min(wxm(2915),Math.max(RD_RB,xa));};
  const xCF=y=>lineX(TT.cF,y),xCS=y=>lineX(TT.cS,y),xCR=y=>lineX(TT.cR,y);
  const xDP=y=>{const P=TT.dP,m=y*20;if(m>=P[0][1])return wxm(P[0][0]);for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1];if(m>=b[1])return wxm(a[0]+(b[0]-a[0])*(m-a[1])/(b[1]-a[1]));}return wxm(P[P.length-1][0]);};
  const TG_LOW=TT?u(TT.tgLowC):0,TG_HL=TT?u(TT.tgHalfLow):0,TG_GB=TT?u(TT.glassBase):0;
  // over the glass the tailgate is the glass and a 35 mm frame, under it the full lid width; always 50 mm inside the greenhouse's side at the side glass's top
  // (the D-pillars stand outboard of it from the roof down)
  const tgHalf=(x,y)=>y>=TG_GB?Math.min(TRUNK_HALF,rwHalf(x)+1.75,halfAt(x,Math.min(y,topY(x)-u(E30M.dloDrop)))-2.5):TRUNK_HALF;
  // within d of the outside, probed up, back and up-back (the tailgate's roof lip, its raked face and its upright lower face)
  const tgOuter=(x,y,z,d)=>!bodySolid(x,y+d,z)||!bodySolid(x-d,y,z)||!bodySolid(x-.6*d,y+.8*d,z);
  if(TT)take(trunk,(x,y,z)=>{if(x<REAR_X||x>TRUNK_X0)return false;const az=Math.abs(z);if(y<(az<=TG_HL?TG_LOW:TRUNK_LOW)||az>tgHalf(x,y))return false;return tgOuter(x,y,z,HT);});
  else take(trunk,(x,y,z)=>x>=REAR_X&&x<=TRUNK_X0&&Math.abs(z)<=TRUNK_HALF&&y>=TRUNK_LOW&&(profDist(x,y)<HT||x<REAR_X+HT));   // the lid wraps down the tail to the lamp tops
  const inDoor=(x,y,z)=>x>=DOOR_R&&x<=DOOR_F&&y>=DOOR_B&&y<=BELT&&Math.abs(z)>=halfAt(x,y)-4.2;
  take(doorL,(x,y,z)=>z<0&&inDoor(x,y,z));take(doorR,(x,y,z)=>z>0&&inDoor(x,y,z));
  let doorRL=null,doorRR=null;
  if(TT){doorRL=hgrid(xCS(BELT)-1.5,RD_F+.5,DOOR_B-1,70,-42.5,0);doorRR=hgrid(xCS(BELT)-1.5,RD_F+.5,DOOR_B-1,70,0,42.5);
    const inRD=(x,y,z)=>x<=RD_F&&x>=rdRear(y)&&y>=DOOR_B&&y<=beltAt(x)&&Math.abs(z)>=halfAt(x,y)-4.2;
    take(doorRL,(x,y,z)=>z<0&&inRD(x,y,z));take(doorRR,(x,y,z)=>z>0&&inRD(x,y,z));}
  // 3b. underbody channels: transmission tunnel with a raised bellhousing hump, rear axle kick-up
  carveW(S,[AX_R-9,46,0,28,-20,20],(x,y,z)=>(x>=AX_R-4&&x<=46&&Math.abs(z)<=8&&y<=(x>=18?27.5:22.5))||(x>=AX_R-9&&x<=AX_R+10&&Math.abs(z)<=20&&y<=22.5));
  carveW(S,[AX_R-9,AX_R+15,0,18,-27,27],(x,y,z)=>Math.abs(z)<=27&&y<=18);   // beside the channel the floor over the semi-trailing arms is raised to 340 mm (their travel)
  // 4. cavities: engine bay and trunk well
  if(!TT){carveW(S,[-100,98,12,72,-30,30],(x,y,z)=>(x>=44&&x<=98&&Math.abs(z)<=28.5&&y>=12)
    ||(x>=-100&&x<=-60&&Math.abs(z)<=29.5&&y>=(x>AX_R-13?25:Math.max(13,YBOT(x)+2.2))&&(x<=TRUNK_X0||y<=44)&&!(Math.abs(z)>=22&&Math.hypot(x-AX_R,y-WR)<20.5)));   // under the rear window the well stops at the parcel shelf
    carveW(S,[REAR_X+HT,-99.5,TRUNK_LOW-.25,50,-15,15],(x,y,z)=>x>=REAR_X+HT-.01);}   // between the tail lamps the opening goes down to the lid's lower edge: nothing of the rear panel stands behind the lid
  else{carveW(S,[44,98,12,72,-30,30],(x,y,z)=>x>=44&&x<=98&&Math.abs(z)<=28.5&&y>=12);
    // the Touring's load bay (DESIGN after photographs): a flat floor 550 mm up over the spare-wheel well and the tank, from the rear seat's back to the tailgate, open
    // to the roof (no parcel shelf), the wheel tubs standing in it; between the lamps it runs out to the tailgate's lower edge at 600 mm (the load sill)
    carveW(S,[-100,-60,27.5,72,-30,30],(x,y,z)=>{const az=Math.abs(z);if(x<-100||x>-60||y<27.5||y>topY(x)-1.5)return false;if(az>Math.min(29.5,halfAt(x,y)-1.5))return false;
      return !(az>=22&&Math.hypot(x-AX_R,y-WR)<20.5);});
    carveW(S,[REAR_X+HT,-99.5,27.5,72,-30,30],(x,y,z)=>{const az=Math.abs(z);if(x<REAR_X+HT-.01||y>topY(x)-1.5)return false;
      return az<=TG_HL+.25||(y>=TRUNK_LOW+.5&&az<=Math.min(29.5,halfAt(x,y)-1.5));});}   // over the lamps the opening is the tailgate's full width
  // 5. shell the body: outer skin = paint, inner layer = dark
  shellHi(S,(x,y,z,inner)=>{
    if(y<14&&!inner)return UNDER;                      // the belly is undercoated
    if(!inner&&y<30&&x>NOSE_X-6.4)return UNDER;        // panels hidden behind the front bumper are undercoated, not painted
    if(!inner&&x<-76&&y<YBOT(x)+1.3&&Math.abs(z)<halfAt(x,Math.max(y,YBOT(x)))-1.1)return UNDER;   // the cut-away underside of the tail is undercoated (the quarter panels' side skin stays painted to its lower edge)
    return inner?INT:PAINT;},2);
  const bodyG=S;
  // the trunk well and the space under the rear window are interior surfaces (trim colour), apart from the painted flange round the lid opening
  if(!TT)eachCell(bodyG,[REAR_X+1.5,-50,12,47,-30.5,30.5],(i,j,k,n)=>{if(bodyG.d[n]!==PAINT)return;const x=i/HR,y=j/HR;if(y>topY(x)-1.6)return;bodyG.d[n]=INT;});
  else eachCell(bodyG,[REAR_X+1.5,-50,12,72,-30.5,30.5],(i,j,k,n)=>{if(bodyG.d[n]!==PAINT)return;const x=i/HR,y=j/HR,z=k/HR;if(y>topY(x)-1.6||Math.abs(z)>=halfAt(x,y)-1.2)return;bodyG.d[n]=INT;});   // the load bay's walls (not the outer skin)
  // the Touring's load bay opens into the cabin over the rear seat's back: the shell's wall left at the bay's front (x -60, the edge of its carve) is taken away
  // above the backrest's top (440 mm and up to the headliner); under it the wall stays as the backrest's support (the coupe's trunk bulkhead)
  if(TT)eachCell(bodyG,[-61,-57.5,44.5,72,-30.5,30.5],(i,j,k,n)=>{if(bodyG.d[n]<0)return;const x=i/HR,y=j/HR,z=k/HR;if(y>topY(x)-1.6||Math.abs(z)>=halfAt(x,y)-1.2)return;bodyG.d[n]=-1;});
  // rear parcel shelf under the rear window (DESIGN, as the car: a flat board at the window's base height between the C-pillars, from the rear seat back to the glass)
  if(!TT)for(let i=Math.round(TRUNK_X0*HR);i<=Math.round(-53*HR);i++)for(let j=Math.round(44.5*HR);j<=Math.round(45*HR);j++)for(const sd of [-1,1])for(let k=0;k<=80;k++){
    if(bodyG.get(i,j,sd*k)>=0)break;bodyG.set(i,j,sd*k,0x26272b);}
  // 5b. door apertures: the body keeps the sill (y <= 15) and the pillars; the opening goes through to the cabin
  carveW(bodyG,[DOOR_R+1,DOOR_F-1,DOOR_B+1,BELT,-44,44],(x,y,z)=>x>=DOOR_R+1&&x<=DOOR_F-1&&y>=DOOR_B+1&&y<=BELT&&Math.abs(z)>=24);
  // the rear doors' apertures (Touring): from the B-pillar to 20 mm inside the door's rear edge, clear of the rear wheel tub
  const inRDOpen=(x,y)=>x<=RD_F-1&&x>=rdRear(y)+1&&y>=DOOR_B+1&&y<=beltAt(x)&&Math.hypot(x-ARCH_RR.x,y-ARCH_RR.y)>=RA+1;
  if(TT)carveW(bodyG,[RD_RB,RD_F,DOOR_B+1,BELT+2,-44,44],(x,y,z)=>inRDOpen(x,y)&&Math.abs(z)>=24);
  // 5c. door shells: outer skin paint, inner skin dark
  const doorSkin=(x,y,z)=>Math.abs(z)>=halfAt(x,Math.min(y,BELT))-1.1?PAINT:0x3a3b3f;
  shellHi(doorL,doorSkin,2);shellHi(doorR,doorSkin,2);
  if(TT){const rdSkin=(x,y,z)=>Math.abs(z)>=halfAt(x,Math.min(y,beltAt(x)))-1.1?PAINT:0x3a3b3f;shellHi(doorRL,rdSkin,2);shellHi(doorRR,rdSkin,2);}
  // hood and trunk lid: two layers of skin, inner layer cut into a frame (perimeter and cross braces), like a pressed inner panel
  const skinPaint=(G,x,y)=>profDist(x,y)<1.1;
  const HM=(HOOD_X0+NOSE_X)/2,TM=(TRUNK_X0+REAR_X)/2;
  for(const [G,fr] of [[hood,(x,y,z)=>x<=HOOD_X0+1.5||x>=NOSE_X-1.9||Math.abs(z)>=HOOD_HALF-1.7||Math.abs(Math.abs(z)-(x-HOOD_X0-3)*0.53)<1.1||Math.abs(x-HM)<1.1],[trunk,(x,y,z)=>x>=TRUNK_X0-1.5||x<=REAR_X+2.6||y<TRUNK_LOW+1.5||Math.abs(z)>=TRUNK_HALF-2.6||Math.abs(x-TM)<1.1||Math.abs(z)<1.1]]){
    if(TT&&G===trunk){   // the tailgate: outer skin two cells deep, the inner panel a frame round the glass (its top rail, the sides and everything under the glass)
      eachCell(G,null,(i,j,k,n)=>{if(G.d[n]<0)return;const x=i/HR,y=j/HR,z=k/HR;if(tgOuter(x,y,z,1.1))G.d[n]=PAINT;else if(x>=TRUNK_X0-1.5||y<TG_GB+1||Math.abs(z)>=tgHalf(x,y)-2.6)G.d[n]=INT;else G.d[n]=-1;});continue;}
    eachCell(G,null,(i,j,k,n)=>{if(G.d[n]<0)return;const x=i/HR,y=j/HR,z=k/HR;if(skinPaint(G,x,y))G.d[n]=PAINT;else if(fr(x,y,z))G.d[n]=INT;else G.d[n]=-1;});}
  // the lid's wrap down the tail: its rear face is outer skin (painted) down to the lower edge over the lamps; the profile test above only covers the deck
  {const W=[];eachCell(trunk,null,(i,j,k,n)=>{if(trunk.d[n]<0||trunk.d[n]===PAINT)return;const x=i/HR;if(x<REAR_X+HT&&trunk.get(i-1,j,k)<0)W.push(n);});for(const n of W)trunk.d[n]=PAINT;}
  // 6. window openings (through the roof shell) and glass slabs. Window outlines are rounded rectangles; glass is flush with the painted surface.
  const hwc=(x,y)=>halfAt(x,y);
  // side windows (MEASURED outlines): the door glass between its slanted front edge and the B-pillar, the quarter glass between the B-pillar and the C-pillar sail;
  // bottoms on the belt line, tops 90 mm under the roof's centreline, corners rounded
  const rr=(x,y,cx,cy,R,sx,sy)=>!(sx*(x-cx)>0&&sy*(y-cy)>0&&Math.hypot(x-cx,y-cy)>R);   // inside the quarter-circle corner at (cx,cy) of radius R
  const dloTop=x=>topY(x)-u(E30M.dloDrop);
  const dgIn=(x,y)=>{const yb=beltAt(x)+.25,yt=dloTop(x);if(y<yb||y>yt)return false;const xf=xDG(y),xr=xBP(y);if(x>xf||x<xr)return false;
    return rr(x,y,xDG(yt-3)-3,yt-3,3,1,1)&&rr(x,y,xBP(yt-2.5)+2.5,yt-2.5,2.5,-1,1)&&rr(x,y,xBP(yb+1.2)+1.2,yb+1.2,1.2,-1,-1);};
  const qgIn=(x,y)=>{const yb=beltAt(x)+.25,yt=dloTop(x);if(y<yb||y>yt)return false;const xf=X_QG,xr=xQR(y);if(x>xf||x<xr)return false;
    return rr(x,y,xf-2.5,yt-2.5,2.5,1,1)&&rr(x,y,xQR(yt-3)+3,yt-3,3,-1,1)&&rr(x,y,xQR(yb+2.5)+2.5,yb+2.5,2.5,-1,-1)&&rr(x,y,xf-1.2,yb+1.2,1.2,1,-1);};
  // windshield and rear window: the glass inside the pillars (30 mm in from the A-pillar line, 470 mm half-width at the rear), corners rounded
  // Touring side glass: the rear door's drop glass (B-pillar to the bar), its fixed pane (the bar to the frame's rear member) and the bonded window between the C- and
  // D-pillars, all on the belt line, tops 90 mm under the roof's centreline like the front door's
  const xBarF=TT?wxm(TT.rdBar):0,xBarR=TT?wxm(TT.rdBar+TT.rdBarW):0;
  const rgIn=(x,y)=>{const yb=beltAt(x)+.25,yt=dloTop(x);if(y<yb||y>yt||x>X_QG||x<xBarF)return false;return rr(x,y,X_QG-2.5,yt-2.5,2.5,1,1)&&rr(x,y,X_QG-1.2,yb+1.2,1.2,1,-1);};
  const rvIn=(x,y)=>{const yb=beltAt(x)+.25,yt=dloTop(x);if(y<yb||y>yt||x>xBarR||x<xCF(y))return false;return rr(x,y,xCF(yt-2.5)+2.5,yt-2.5,2.5,-1,1)&&rr(x,y,xCF(yb+1.2)+1.2,yb+1.2,1.2,-1,-1);};
  const qtIn=(x,y)=>{const yb=beltAt(x)+.25,yt=dloTop(x);if(y<yb||y>yt||x>xCR(y)||x<xDP(y))return false;
    return rr(x,y,xCR(yt-2.5)-2.5,yt-2.5,2.5,1,1)&&rr(x,y,xCR(yb+1.2)-1.2,yb+1.2,1.2,1,-1)&&rr(x,y,xDP(yt-3)+3,yt-3,3,-1,1)&&rr(x,y,xDP(yb+1.2)+1.2,yb+1.2,1.2,-1,-1);};
  const WS_X0=wxm(1800),WS_X1=wxm(1228),RW_X0=TT?wxm(E30M.cPillar.x1):wxm(3700),RW_X1=TT?wxm(3560):wxm(3196),RW_Y0=TT?TG_GB+.15:46;
  // corners (photographs of real cars): tight at the base (15 mm), 40 mm at the roof; the earlier 60 mm rounds made the deck and the cowl curl up into the pillars
  const WS_RB=.75,WS_RT=2;
  // the windshield's side edge: 30 mm inside the A-pillar's envelope, and never closer than 50 mm to the greenhouse's own edge at that height (toward the roof the
  // greenhouse rolls in narrower than the pillar envelope: without this the glass ran out over the roll-over and left no pillar at the top corners)
  const tumbleHalf=(x,y)=>u(tabv(E30M.tumble,y*20+clampv(1380-topY(x)*20,0,40)));
  const wsIn=(x,z,y)=>{if(x<WS_X0||x>WS_X1)return false;const hz=Math.min(aEnv(x,y)-1.5,tumbleHalf(x,y)-2.5),az=Math.abs(z);if(az>hz)return false;
    return rr(x,az,WS_X1-WS_RB,hz-WS_RB,WS_RB,1,1)&&rr(x,az,WS_X0+WS_RT,hz-WS_RT,WS_RT,-1,1);};
  const rwIn=(x,z,y)=>{if(x<RW_X0||x>RW_X1||y<RW_Y0)return false;const hz=rwHalf(x),az=Math.abs(z);if(az>hz)return false;
    return rr(x,az,RW_X1-WS_RT,hz-WS_RT,WS_RT,1,1)&&rr(x,az,RW_X0+WS_RB,hz-WS_RB,WS_RB,-1,1);};
  const winOpen=(x,y,z)=>{const az=Math.abs(z),ty=topY(x);
    if(y>=BELT-.1){
      if(az>=hwc(x,y)-4.2&&dgIn(x,y))return 'dg';
      if(TT){if(az>=hwc(x,y)-4.2){if(rgIn(x,y))return 'rg';if(rvIn(x,y))return 'rv';if(qtIn(x,y))return 'qg';}return null;}
      if(az>=hwc(x,y)-4.2&&qgIn(x,y))return 'qg';}
    return null;};
  carveW(bodyG,[RW_X0-1,WS_X1+1,BELT-1,70,-44,44],(x,y,z)=>!!winOpen(x,y,z));
  // windshield and rear window: in every column inside the outline the glass replaces the top of the shell where the surface actually is (the glass is
  // curved across the car like the roof: its sides sit lower than the centreline), two cells of glass on the cut
  const GLC={ws:[],rw:[]};
  for(const [gk,inF,x0,x1] of [['ws',wsIn,WS_X0,WS_X1],['rw',rwIn,RW_X0,RW_X1]])for(let i=Math.ceil(x0*HR);i<=Math.floor(x1*HR);i++){const x=i/HR,ty=topY(x),SRC=(TT&&gk==='rw')?trunk:bodyG;   // the Touring's rear glass is the tailgate's
    for(let k=-88;k<=88;k++){let js=null;for(let j=Math.ceil((ty+.6)*HR);j>=Math.floor((ty-7)*HR);j--)if(SRC.get(i,j,k)>=0){js=j;break;}
      if(js===null&&gk==='ws'&&inF(x,k/HR,ty)){   // over the engine bay's opening the shell has no top: the windshield's lower edge still runs straight across at its measured
        let lo=null,hi=ty+.6;for(let y=ty+.6;y>=ty-3;y-=.25){if(bodySurfIn(x,y,k/HR)){lo=y;break;}hi=y;}   // base line, the glass on the measured surface (it rests on the cowl)
        if(lo!==null){for(let q=0;q<8;q++){const m=(lo+hi)/2;if(bodySurfIn(x,m,k/HR))lo=m;else hi=m;}const J=Math.floor(lo*HR+.5)-0;GLC[gk].push([i,J,k],[i,J-1,k]);}continue;}
      if(js===null||js<(ty-3)*HR||!inF(x,k/HR,js/HR))continue;   // the glass is the window's surface: never a pillar's side wall far below it
      for(let j=js;j>=js-3;j--)SRC.set(i,j,k,-1);GLC[gk].push([i,js,k],[i,js-1,k]);}}
  carveW(bodyG,[NOSE_X-7.4,NOSE_X+.6,30,39,-44,44],(x,y,z)=>x>=NOSE_X-3.9&&y>=31&&y<=37.9&&((Math.abs(z)>=15&&Math.abs(z)<=39)||(Math.abs(z)>=1.2&&Math.abs(z)<=14.5)));
  // 6b. the black window frame (sash) around each door glass belongs to the DOOR, so it opens with the door: from 30 mm behind the glass's rear edge (along the
  //     B-pillar) to 30 mm ahead of the glass's front edge (no further than 70 mm behind the A-pillar line), from the belt to 60 mm under the roof's centreline. The B-pillar behind it is black trim on the body.
  eachCell(bodyG,[xBP(ROOF)-2,xA(BELT)+1,BELT-1,70,-44,44],(i,j,k,n)=>{if(bodyG.d[n]<0)return;const x=i/HR,y=j/HR,z=k/HR;
    if(y<beltAt(x)-.1||y>topY(x)-3||x<xBP(y)-1.5||x>(y<=BELT+4.25?xA(y)-3.5:Math.min(xA(y)-3.5,xDG(y)+1.5)))return;if(Math.abs(z)<(y<=BELT+1?33:hwc(x,y)-4.2))return;   // the mirror's triangle (up to 85 mm over the belt) is the door's, up to the A-pillar line; above it, along the A-pillar, the frame is about 20 mm wide across its slant, 30 mm along x (photographs of 1988-91 coupes); the body-colour pillar runs on ahead of it
    const D=z<0?doorL:doorR;D.d[D.ix(i,j,k)]=SASH;bodyG.d[n]=-1;});
  // the rear door's frame (Touring): everything left round its glass from the C-pillar's shut line to the door's front edge, from the belt to 60 mm under the roof's
  // centreline (the front member, the top rail over both panes, the bar and the rear member along the C-pillar); black like the front door's
  if(TT){   // first its top rail (the panel between the belt and the glass, painted, as the front door's; under the fixed pane it is the frame's lower member)
    eachCell(bodyG,[xCS(BELT)-.5,RD_F+.1,BELT,BELT+3,-44,44],(i,j,k,n)=>{if(bodyG.d[n]<0)return;const x=i/HR,y=j/HR,z=k/HR,b=beltAt(x);if(y<=b||y>b+1.1||x<xCS(y)||x>RD_F||Math.abs(z)<halfAt(x,b)-4.6)return;
      const D=z<0?doorRL:doorRR;D.d[D.ix(i,j,k)]=bodyG.d[n];bodyG.d[n]=-1;});
    // the frame's top at one height along the door (the lowest of 60 mm under the roof over its length): a cell row left over the door's front end would stand level
    // with the roof's edge behind it and the door would swing into the roof
    let RD_TOP=1e9;for(let x=xCS(BELT);x<=RD_F;x+=.5)RD_TOP=Math.min(RD_TOP,topY(x)-3);
    eachCell(bodyG,[xCS(BELT)-.5,RD_F+.5,BELT-1,70,-44,44],(i,j,k,n)=>{if(bodyG.d[n]<0)return;const x=i/HR,y=j/HR,z=k/HR;
      if(y<=beltAt(x)+1.1||y>RD_TOP||x<xCS(y)||x>RD_F)return;if(Math.abs(z)<hwc(x,y)-4.2)return;
      const D=z<0?doorRL:doorRR;D.d[D.ix(i,j,k)]=SASH;bodyG.d[n]=-1;});}
  eachCell(bodyG,[X_QG-.5,xBP(BELT)+1,BELT-1,70,-44,44],(i,j,k,n)=>{if(bodyG.d[n]!==PAINT)return;const x=i/HR,y=j/HR,z=k/HR;
    if(y<beltAt(x)+.25||y>topY(x)-3.4||x<X_QG||x>xBP(y)+.5)return;if(Math.abs(z)<hwc(x,y)-1.2)return;bodyG.d[n]=SASH;});   // up to where the door frame's rear member closes on it (no strip of paint left between them: one black B-pillar)
  // the door's top rail: the strip of panel between the belt and the glass along the whole door is the door's (it opens with it; nothing is left standing in the opening)
  eachCell(bodyG,[DOOR_R-.1,DOOR_F-.4,BELT,BELT+1.1,-44,44],(i,j,k,n)=>{if(bodyG.d[n]<0)return;const x=i/HR,y=j/HR,z=k/HR;if(y<=BELT||Math.abs(z)<halfAt(x,BELT)-4.6)return;
    const D=z<0?doorL:doorR;D.d[D.ix(i,j,k)]=bodyG.d[n];bodyG.d[n]=-1;});
  // glass slabs: two cells thick, flush with the outer surface (the voxel glass stays the collision shape)
  const glass={};const GL=0x5c8aa0;glass.ws=hgrid(WS_X0-1,WS_X1+1,44,70,-44,44);glass.rw=hgrid(RW_X0-1,RW_X1+1,44,70,-44,44);
  const SGK=TT?['dgL','dgR','rgL','rgR','rvL','rvR','qgL','qgR']:['dgL','dgR','qgL','qgR'],SGX0=TT?wxm(4000):xQR(BELT)-2;
  for(const k of SGK)glass[k]=hgrid(SGX0,xDG(BELT)+2,42,70,k.endsWith('L')?-44:0,k.endsWith('L')?0:44);
  for(const gk of ['ws','rw'])for(const [i,j,k] of GLC[gk])glass[gk].set(i,j,k,GL);   // the glass is the top of its opening, flush with the painted surface
  const sideIn=TT?[['dg',dgIn],['rg',rgIn],['rv',rvIn],['qg',qtIn]]:[['dg',dgIn],['qg',qgIn]];
  for(let i=glass.dgL.x0;i<=glass.dgL.x1;i++)for(let j=glass.dgL.y0;j<=glass.dgL.y1;j++){const x=i/HR,y=j/HR;if(y<BELT||y>70)continue;const h=hwc(x,y);
    for(const sd of [-1,1]){const zc=Math.round((h-1.0)*HR);
      for(const [gk,inF] of sideIn)if(inF(x,y))for(let q=0;q<2;q++)glass[gk+(sd<0?'L':'R')].set(i,j,sd*(zc-q),GL);}}
  // rubber gaskets (photographs: the E30's windshield and rear window sit in a black rubber gasket about 20 mm wide all round). Built in plan view so the frame
  // is a continuous band on the 10 mm stairs of a slanted pillar, not one black cell per step: the glass's outermost column all round is the gasket's lip over
  // the glass's edge (opaque rubber in place of glass), and in every column next to the lip the panel's paint is the gasket's body, from the panel's top down
  // to the lip's height (the riser of a step facing the glass included)
  for(const gk of ['ws','rw']){const G=glass[gk],top=new Map();for(const [i,j,k] of G.list()){const key=i+','+k;if(!top.has(key)||j>top.get(key))top.set(key,j);}
    const lip=[];for(const [key,j] of top){const [i,k]=key.split(',').map(Number);if([[1,0],[-1,0],[0,1],[0,-1]].some(([a,c])=>!top.has((i+a)+','+(k+c))))lip.push([i,k,j]);}
    const PG=(TT&&gk==='rw')?trunk:bodyG;   // the panel round the glass (the Touring's tailgate carries its glass and gasket)
    for(const [i,k,j] of lip){for(let jj=j;jj>=j-1;jj--)if(G.get(i,jj,k)>=0){G.set(i,jj,k,-1);if(doorL.get(i,jj,k)<0&&doorR.get(i,jj,k)<0)PG.set(i,jj,k,GASK);}}   // at the lower corners the door's frame owns the cell
    const lipAt=new Map();for(const [i,k,j] of lip){lipAt.set(i+','+k,j);top.delete(i+','+k);}
    const done=new Set();for(const [i,k,j] of lip)for(let a=-1;a<=1;a++)for(let c=-1;c<=1;c++){const I=i+a,K=k+c,key=I+','+K;if(lipAt.has(key)||top.has(key)||done.has(key))continue;done.add(key);
      let jt=null;for(let jj=j+4;jj>=j-4;jj--)if(PG.get(I,jj,K)>=0){jt=jj;break;}if(jt===null)continue;
      for(let jj=jt;jj>=Math.min(jt,j-1);jj--)if(PG.get(I,jj,K)===PAINT)PG.set(I,jj,K,GASK);}}
  // 6b3. side window trims (photographs of 1988-91 coupes; shadowline: the trims are black). The quarter glass sits in a black rubber surround about 20 mm wide
  //      along its top and its rear edge on the C-pillar, 10 mm along its lower edge where the belt strip runs; the door's top edge carries the belt strip
  //      (a black cap from the outer skin to the glass) the whole length of the door. Colours: rubber 0x131416, belt strip 0x1f2124.
  {const RUB=0x131416,BS=0x1f2124;
   for(const [G,sd] of [[glass.qgL,-1],[glass.qgR,1]]){const occ=new Set(),bot=new Map();for(const [i,j] of G.list()){occ.add(i+','+j);if(!bot.has(i)||j<bot.get(i))bot.set(i,j);}
     const done=new Set();
     for(const key of occ){const [i,j]=key.split(',').map(Number);if(![[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>!occ.has((i+a)+','+(j+b))))continue;
       for(let a=-2;a<=2;a++)for(let b=-2;b<=2;b++){if(a*a+b*b>5)continue;const I=i+a,J=j+b,kk=I+','+J;if(occ.has(kk)||done.has(kk))continue;
         const below=bot.has(I)&&J<bot.get(I);if(below&&J<bot.get(I)-1)continue;done.add(kk);   // under the glass: one row (the belt strip's height)
         let Ko=null;for(let K=88;K>=30;K--)if(bodyG.get(I,J,sd*K)>=0){Ko=K;break;}if(Ko===null)continue;
         for(let K=Ko;K>=Ko-3;K--){const v=bodyG.get(I,J,sd*K);if(v===PAINT)bodyG.set(I,J,sd*K,below?BS:RUB);}}}}
   for(const D of [doorL,doorR]){const W=[];eachCell(D,[DOOR_R-.5,DOOR_F+.5,BELT-1.5,BELT+1.5,-44,44],(i,j,k,n)=>{if(D.d[n]!==PAINT)return;if(D.get(i,j+1,k)>=0)return;const x=i/HR;if(x<DOOR_R||x>DOOR_F)return;W.push(n);});for(const n of W)D.d[n]=BS;}
   if(TT)for(const D of [doorRL,doorRR]){const W=[];eachCell(D,[xCS(BELT)-.5,RD_F+.5,BELT-1,BELT+3,-44,44],(i,j,k,n)=>{if(D.d[n]!==PAINT)return;if(D.get(i,j+1,k)>=0)return;const x=i/HR,y=j/HR;if(y<beltAt(x)-.6)return;W.push(n);});for(const n of W)D.d[n]=BS;}}   // the rear doors' belt strip, on to the C-pillar under the fixed pane
  // 6b4. door aperture seals (photographs of open E30 doors): a black rubber seal on the body's flange all round the door opening, the A- and B-pillar faces and
  //      the sill, where the door's inner face closes on it: the body's cells facing the opening within 30 mm inside the door's inner face (the door is
  //      halfAt - 84 mm thick at its edges); hidden with the door shut, a black frame round the opening with it open
  {const RUB=0x131416,N6=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
   const inOpen=(X,Y)=>X>DOOR_R+.5&&X<DOOR_F-.5&&Y>DOOR_B+.5&&Y<=BELT;
   for(const sd of [-1,1]){const D=sd<0?doorL:doorR,W=[];
     eachCell(bodyG,sd<0?[DOOR_R-1,DOOR_F+1,DOOR_B-1,BELT+.5,-44,-18]:[DOOR_R-1,DOOR_F+1,DOOR_B-1,BELT+.5,18,44],(i,j,k,n)=>{const v=bodyG.d[n];if(v<0)return;const x=i/HR,y=j/HR,az=Math.abs(k/HR);
       const hz=halfAt(Math.min(Math.max(x,DOOR_R),DOOR_F),Math.min(Math.max(y,DOOR_B),BELT));if(az<hz-5.7||az>=hz-4.2)return;
       for(const [a,b,c] of N6){const I=i+a,J=j+b,K=k+c;if(bodyG.get(I,J,K)>=0||D.get(I,J,K)>=0)continue;if(inOpen(I/HR,J/HR)){W.push(n);return;}}});
     for(const n of W)bodyG.d[n]=RUB;}
   if(TT)for(const sd of [-1,1]){const D=sd<0?doorRL:doorRR,W=[];   // the rear doors' apertures likewise (the door's inner face at its own belt)
     eachCell(bodyG,sd<0?[RD_RB-1.5,RD_F+1,DOOR_B-1,BELT+2,-44,-18]:[RD_RB-1.5,RD_F+1,DOOR_B-1,BELT+2,18,44],(i,j,k,n)=>{const v=bodyG.d[n];if(v<0)return;const x=i/HR,y=j/HR,az=Math.abs(k/HR);
       const xc=Math.min(Math.max(x,rdRear(y)),RD_F),hz=halfAt(xc,Math.min(Math.max(y,DOOR_B),beltAt(xc)));if(az<hz-5.7||az>=hz-4.2)return;
       for(const [a,b,c] of N6){const I=i+a,J=j+b,K=k+c;if(bodyG.get(I,J,K)>=0||D.get(I,J,K)>=0)continue;if(inRDOpen(I/HR,J/HR)){W.push(n);return;}}});
     for(const n of W)bodyG.d[n]=RUB;}}
  // 6b6. door sill (photographs of open E30 doors): under the closed door the sill's top is a black plastic scuff plate from the aperture seal out to the door's outer
  //      skin; its outermost cell (the gap under the door, seen from outside) stays the paint's shut line
  {const SCUFF=0x1b1c1e;for(const sd of [-1,1]){const D=sd<0?doorL:doorR,W=[];
     eachCell(bodyG,sd<0?[DOOR_R,DOOR_F,DOOR_B-2,DOOR_B+.5,-44,-18]:[DOOR_R,DOOR_F,DOOR_B-2,DOOR_B+.5,18,44],(i,j,k,n)=>{const v=bodyG.d[n];if(v<0||v===0x131416)return;if(D.get(i,j+1,k)<0)return;
       if(bodyG.get(i,j,k+sd)<0&&D.get(i,j,k+sd)<0)return;W.push(n);});for(const n of W)bodyG.d[n]=SCUFF;}
   if(TT)for(const sd of [-1,1]){const D=sd<0?doorRL:doorRR,W=[];
     eachCell(bodyG,sd<0?[RD_RB,RD_F,DOOR_B-2,DOOR_B+.5,-44,-18]:[RD_RB,RD_F,DOOR_B-2,DOOR_B+.5,18,44],(i,j,k,n)=>{const v=bodyG.d[n];if(v<0||v===0x131416)return;if(D.get(i,j+1,k)<0)return;
       if(bodyG.get(i,j,k+sd)<0&&D.get(i,j,k+sd)<0)return;W.push(n);});for(const n of W)bodyG.d[n]=SCUFF;}}
  // 6b5. trunk opening seal: the body's flange round the lid opening, under the lid's edge (where the lid closes on it), is black rubber all round
  {const RUB=0x131416,W=[];eachCell(bodyG,[REAR_X-1,TRUNK_X0+1,TRUNK_LOW-2,60,-TRUNK_HALF-2,TRUNK_HALF+2],(i,j,k,n)=>{const v=bodyG.d[n];if(v<0||v===RUB)return;
     if(bodyG.get(i,j+1,k)>=0||trunk.get(i,j+1,k)<0)return;   // the body's top cell with the lid's own cell right over it: the flange the lid closes on
     W.push(n);});for(const n of W)bodyG.d[n]=RUB;}
  // 6c. shut lines: a dark seam, one cell wide, where the hood, trunk lid and doors meet the body (cut into the outer skin only)
  const seam=(G,b,pred)=>eachCell(G,b,(i,j,k,n)=>{if(G.d[n]!==PAINT)return;const x=i/HR,y=j/HR,z=k/HR;if(pred(x,y,z))G.d[n]=PAINT_SHADE;});   // shut lines: the paint in the gap's shadow
  // hood and trunk lid shut lines: every painted body cell that borders the lid (face neighbours) is the dark gap, so the line follows the lid's edge all along
  // its length, over the crowned fender tops too (a band test at a fixed height broke it into dashes where the crown fell away)
  for(const L of [hood,trunk]){const W=[];eachCell(bodyG,[L.x0-1,L.x1+1,L.y0-1,L.y1+1,L.z0-1,L.z1+1].map((v,i)=>v/HR),(i,j,k,n)=>{if(bodyG.d[n]!==PAINT)return;
    for(const [a,b,c] of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]])if(L.get(i+a,j+b,k+c)>=0){W.push(n);return;}});for(const n of W)bodyG.d[n]=PAINT_SHADE;}
  seam(bodyG,[DOOR_F+.1,DOOR_F+.8,DOOR_B-1,BELT+1,-44,44],(x,y,z)=>x>DOOR_F+.1&&x<=DOOR_F+.55&&y>=DOOR_B&&y<=BELT&&Math.abs(z)>=halfAt(x,y)-4.2);   // door front shut line
  seam(bodyG,[DOOR_R-.8,DOOR_R-.1,DOOR_B-1,BELT+1,-44,44],(x,y,z)=>x<DOOR_R-.1&&x>=DOOR_R-.55&&y>=DOOR_B&&y<=BELT&&Math.abs(z)>=halfAt(x,y)-4.2);   // door rear shut line
  seam(bodyG,[DOOR_R,DOOR_F,DOOR_B-1.5,DOOR_B,-44,44],(x,y,z)=>y<DOOR_B&&y>=DOOR_B-.6&&x>=DOOR_R&&x<=DOOR_F&&Math.abs(z)>=halfAt(x,y)-4.2);           // door sill shut line
  seam(bodyG,[TRUNK_X0-1,TRUNK_X0+1,40,TT?72:52,-TRUNK_HALF-1,TRUNK_HALF+1],(x,y,z)=>x>=TRUNK_X0-.1&&x<=TRUNK_X0+.7&&Math.abs(z)<=TRUNK_HALF+.5&&y>topY(x)-1.5);   // trunk lid front edge
  // the rear doors' shut lines (Touring): every painted outer-skin body cell that borders the door, all round it (the B-pillar gap, along the C-pillar, round the
  // arch, under the sill)
  if(TT)for(const D of [doorRL,doorRR]){const W=[];eachCell(bodyG,[D.x0-1,D.x1+1,D.y0-1,D.y1+1,D.z0-1,D.z1+1].map(v=>v/HR),(i,j,k,n)=>{if(bodyG.d[n]!==PAINT)return;const x=i/HR,y=j/HR,z=k/HR;
    if(Math.abs(z)<halfAt(x,Math.min(y,beltAt(x)))-1.2&&y<=beltAt(x)+1.2)return;
    for(const [a,b,c] of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]])if(D.get(i+a,j+b,k+c)>=0){W.push(n);return;}});for(const n of W)bodyG.d[n]=PAINT_SHADE;}
  // 6d. rear panel (from the reference photo): the black plate surround between the lamps, a body-colour band under them, and the lid's lower edge as a dark shut line
  for(const G of TT?[bodyG,trunk]:[bodyG])eachCell(G,[REAR_X-1,REAR_X+2,29.5,TRUNK_LOW,-16,16],(i,j,k,n)=>{if(G.d[n]!==PAINT)return;const x=i/HR,y=j/HR,z=k/HR;if(x<REAR_X+1&&Math.abs(z)<=14.6&&y>=30.4&&y<=TRUNK_LOW-.6)G.d[n]=0x16171a;});   // (the Touring's is on the tailgate)
  seam(bodyG,[REAR_X-1,REAR_X+4,TRUNK_LOW-1,TRUNK_LOW+.5,-TRUNK_HALF-1,TRUNK_HALF+1],(x,y,z)=>x<REAR_X+3.5&&y>=TRUNK_LOW-.6&&y<TRUNK_LOW&&Math.abs(z)<=TRUNK_HALF+.5);
  // 6d2. fuel filler flap (photograph of a 1988-91 coupe's right rear quarter): just behind the rear arch, its centre 250 mm behind the rear axle and 710 mm up
  //      (its top just under the shoulder crease), a 115 x 115 mm panel with 25 mm corners, flush in the skin; its shut line is a seam cut into the skin, with the finger notch at its rear edge (DESIGN size)
  {const cx=AX_R-12.5,cy=35.5,hw=2.875,hh=2.875,rc=1.25,sdf=(x,y)=>{const qx=Math.abs(x-cx)-(hw-rc),qy=Math.abs(y-cy)-(hh-rc);return Math.hypot(Math.max(qx,0),Math.max(qy,0))+Math.min(Math.max(qx,qy),0)-rc;};
   for(let i=Math.floor((cx-hw-1)*HR);i<=Math.ceil((cx+hw+1)*HR);i++)for(let j=Math.floor((cy-hh-1)*HR);j<=Math.ceil((cy+hh+1)*HR);j++){
     const x=i/HR,y=j/HR,d=sdf(x,y),notch=x<=cx-hw+.5&&x>=cx-hw&&Math.abs(y-cy)<=.5;if(Math.abs(d)>.26&&!notch)continue;
     for(let k=100;k>=50;k--){const v=bodyG.get(i,j,k);if(v<0)continue;if(v===PAINT)bodyG.set(i,j,k,PAINT_SHADE);break;}}}
  // 6e. side protection mouldings (1990 drawing, MEASURED: a black strip 500-542 mm high on the fender behind the front arch, on the door and on the quarter panel
  //     ahead of the rear arch, level with the bumpers' black inserts). 10 mm proud with a 20 mm bead along its middle and rounded ends (DESIGN); gaps at the door
  //     shut lines (30 mm at the hinge side so the door's moulding clears the fender's as it swings open).
  const MOULD=0x2e3035;
  const mould=(G,sd,x0,x1)=>{const i0=Math.ceil(x0*HR),i1=Math.floor(x1*HR);
    for(let i=i0;i<=i1;i++)for(let j=50;j<=54;j++){let ko=null;for(let k=85;k>=30;k--)if(G.get(i,j,sd*k)>=0){ko=k;break;}
      if(ko===null||G.get(i,j,sd*ko)!==PAINT)continue;G.set(i,j,sd*(ko+1),MOULD);
      if(j>=51&&j<=53&&i>i0&&i<i1)G.set(i,j,sd*(ko+2),MOULD);}};
  for(const sd of [-1,1]){
    const fArch=ARCH_F.x-Math.sqrt(ARCH_F.r*ARCH_F.r-(26-ARCH_F.y)*(26-ARCH_F.y))-2,rArch=ARCH_RR.x+Math.sqrt(ARCH_RR.r*ARCH_RR.r-(26-ARCH_RR.y)*(26-ARCH_RR.y))+2;
    mould(bodyG,sd,DOOR_F+1.25,fArch);mould(sd<0?doorL:doorR,sd,DOOR_R+.75,DOOR_F-1.0);
    if(TT){mould(sd<0?doorRL:doorRR,sd,rdRear(26)+.75,RD_F-.75);mould(bodyG,sd,rArch,rdRear(26)-.75);}else mould(bodyG,sd,rArch,DOOR_R-.75);}
  // 7. rear spring pockets: each coil spring stands on its semi-trailing arm ahead of the axle and seats in a pressed pocket in the floor beside the axle channel
  //    (ring wall and cap, E30_SUSP.rear.spring); the dampers stand behind the axle in the wheelhouses, their top mounts under the tubs' roofs (reached from the trunk)
  {const S=E30_SUSP.rear.spring;for(const sd of [-1,1]){const zc=sd*S.z;
    carveW(bodyG,[S.x-S.r,S.x+S.r,8,S.top,zc-S.r,zc+S.r],(x,y,z)=>y<S.top&&Math.hypot(x-S.x,z-zc)<S.r);
    eachCell(bodyG,[S.x-S.r-.6,S.x+S.r+.6,18,S.top+.5,zc-S.r-.6,zc+S.r+.6],(i,j,k,n)=>{const x=i/HR,y=j/HR,z=k/HR,d=Math.hypot(x-S.x,z-zc);
      if(bodyG.d[n]<0&&((d>=S.r&&d<S.r+.55&&y<S.top)||(y>=S.top&&d<S.r+.55)))bodyG.d[n]=y<12.5?UNDER:PAINT;});}
   carveW(bodyG,[AX_R-3.5,AX_R+3.5,10.5,19.5,-25,25],(x,y,z)=>Math.abs(z)>=19.25&&Math.abs(z)<=24.75&&Math.hypot(x-AX_R,y-15)<3.5);}   // openings in the axle channel's walls and the floor strip beside it for the half-shafts
  // 7b. engine bay structure (DESIGN after E30 photographs): the bay floor is open between the frame rails (the oil pan and the front axle carrier hang below it);
  //     box-section frame rails along the bay's lower edges; the inner fender aprons, each with the wheelhouse roof over the tyre and a strut tower round the strut
  //     (its cap with the top mount's three studs); the radiator support's lower cross-member and side posts; the upper support panel open behind the kidney grilles
  {const F=E30_SUSP.front,roof=x=>{const d=x-AX_F;return Math.abs(d)<F.roofR?Math.max(F.shelf,ARCH_F.y+Math.sqrt(F.roofR*F.roofR-d*d)):F.shelf;};
   carveW(bodyG,[44,99,0,12.75,-28.5,28.5],()=>true);
   const tdist=(x,y,z)=>{const [ax,az]=strutAxis(Math.min(y,F.top[1]));return Math.hypot(x-ax,Math.abs(z)-az);};
   eachCell(bodyG,[44,98.5,11.5,F.towerTop+1.5,-29,29],(i,j,k,n)=>{const x=i/HR,y=j/HR,z=k/HR,az=Math.abs(z);if(bodyG.d[n]>=0)return;
     const rf=roof(x),d=tdist(x,y,z),[,axz]=strutAxis(Math.min(y,F.top[1]));let c=-1;
     if(az>=F.railZ[0]&&az<=F.railZ[1]&&y>=F.railY[0]&&y<=F.railY[1])c=y<F.railY[0]+.25?UNDER:PAINT;   // (the arms and tie rods pass under the rails)                         // frame rail
     else if(Math.abs(az-F.wallZ)<.3&&y>F.railY[1]&&y<rf&&d>=F.towerR)c=PAINT;                                                   // apron wall
     else if(y>=rf&&y<rf+.6&&az>=F.wallZ-.25&&az<=29&&d>=F.towerR)c=PAINT;                                                       // wheelhouse roof / apron shelf
     else if(y>=26&&y<F.towerTop&&d>=F.towerR&&d<F.towerR+.6&&(y>=rf||az<axz))c=PAINT;                                          // strut tower wall (inside the tub only its inboard half)
     else if(y>=F.towerTop&&y<F.towerTop+.6&&d<F.towerR+.6&&d>=1.1)c=PAINT;                                                      // tower cap with the strut rod's hole
     if(c>=0)bodyG.d[n]=c;});
   for(const sd of [-1,1]){const [tx,tz]=strutAxis(F.top[1]);for(const a of [Math.PI/2,Math.PI*7/6,Math.PI*11/6])hset(bodyG,tx+2.6*Math.sin(a),F.towerTop+.75,sd*(tz+2.6*Math.cos(a)),0x8d9298);}   // top-mount studs
   fillW(bodyG,[97.5,98.5,11.5,14,-26,26],(x,y)=>y<12?UNDER:PAINT);                                                              // radiator support: lower cross-member
   fillW(bodyG,[97.5,98.5,14,30,-24,24],(x,y,z)=>Math.abs(z)>=21.5?PAINT:-1);                                                   // side posts up to the upper panel
   carveW(bodyG,[98.25,99.75,31,36.5,-13.5,13.5],()=>true);}                                                                    // the upper panel open behind the kidneys
  // 7c. cowl: the black plastic cover with the fresh-air grille between the firewall's top and the hood's rear edge (the wipers' pivots stand on it), filled out to the body sides
  // (the windshield's lower edge runs straight across; nothing of the cowl lies over the glass)
  {const cy=x=>47.5-(x-43.5)*(3.4/8.25);for(let i=Math.round(43.75*HR);i<=Math.round(51.25*HR);i++){const x=i/HR,J=Math.round(cy(x)*HR)-(x<=WS_X1?2:0);   // under the glass it runs on 20 mm lower (the plenum's top, seen through the glass's lower edge)
    for(const sd of [-1,1])for(let K=sd<0?0:1;K<=80;K++){const k=sd*K;if(bodyG.get(i,J,k)>=0||glass.ws.get(i,J,k)>=0||glass.ws.get(i,J+1,k)>=0)break;bodyG.set(i,J,k,(K>=6&&K<=60&&i%3===0&&x>44.5&&x<50.5)?0x0b0c0d:0x1b1c1e);}}}
  // under the windshield's lower edge the plenum is dark: the bulkhead's front face and anything else painted that is seen down through the glass there (it showed
  // as a red line along the glass's base from above and from the front) is the plenum's black
  eachCell(bodyG,[42.5,WS_X1+.5,34,50,-40,40],(i,j,k,n)=>{if(bodyG.d[n]!==PAINT)return;for(let q=1;q<=8;q++)if(glass.ws.get(i,j+q,k)>=0){bodyG.d[n]=0x1b1c1e;return;}});
  const hi={body:bodyG,hood,trunk,doorL,doorR,glass};if(TT){hi.doorRL=doorRL;hi.doorRR=doorRR;}
  if(typeof fitOpenings==='function')fitOpenings({hi,body:null});   // lamp, grille and plate openings are cut to the parts (detail pack), at 10 mm
  // coarse 20 mm views of the same panels: collision, fitting and the interior trim use these
  const CB=[-110,110,0,72,-44,44],out={hi,HR};
  out.body=coarsen(bodyG,4,CB);out.hood=coarsen(hood,4,CB);out.trunk=coarsen(trunk,4,CB);out.doorL=coarsen(doorL,4,CB);out.doorR=coarsen(doorR,4,CB);
  if(TT){out.doorRL=coarsen(doorRL,4,CB);out.doorRR=coarsen(doorRR,4,CB);}
  out.glass={};for(const k in glass)out.glass[k]=coarsen(glass[k],2,CB);
  return out;
}

if(typeof module!=='undefined')module.exports={setE30Variant,e30Variant:()=>E30V,bodySurfIn,E30M,beltAt,aEnv,cEnv,xDG,xBP,xQR,X_QG,HOOD_X0,HOOD_HALF,TRUNK_X0,TRUNK_HALF,TRUNK_LOW,DOOR_B,ARCH_F,ARCH_RR,YBOT,HR,NOSE_X,REAR_X,noseX,rearX,archLip,coarsen,hgrid,hset,hget,eachCell,carveW,fillW,shellHi,halfBase,glassSurface,smoothNormals,Grid,box,cylX,cylY,cylZ,segFill,geoData,shellGrid,buildE30Body,topY,halfAt,PAINT,TOP,BELT,ROOF,AX_F,AX_R,WR,DOOR_F,DOOR_R,xA,xC,pw,sm,clampv,hashv,FACES,hexRGB};
