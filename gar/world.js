/* ===== WORLD: where the car drives. The lot (the checker floor laid by layRoad) or the highway: three 3.6 m lanes each way, a concrete median barrier,
   guardrails, lane markings, lights, overhead signs and scenery, with NPC traffic that keeps its lane, follows at a safe gap (the intelligent driver model),
   passes on the left and keeps right. Units as everywhere: 1 = 20 mm. The car drives along +x and its right is +z, so the player's carriageway (right-hand
   traffic) is the +z side of the median. Figures are DESIGN after US interstate practice (12 ft lanes, 10 ft dashes on 40 ft, a 32 in median barrier,
   guardrail posts every 6 ft 3 in, 17 ft sign clearance) unless noted. NPC cars are voxel shells, 40 mm cells (trucks 70 mm), meshed greedily so a car is a
   few hundred faces; each body style is one instanced mesh for its paint and one for everything else, so the whole traffic is 14 draw calls. ===== */
const HW={LANE:180,MED:15,IN:60,RAIL:780,DASH:600,SNAP:3000,LEN:54000,TILE:9600,SIGN:48000,HILL:60000,WIN:40000,DRAW:27000};
const laneZ=(dir,l)=>dir*(HW.MED+HW.IN+HW.LANE*(l+.5));   // lane 0 by the median (fast), 2 by the shoulder (slow)
const WORLD={kind:'lot',density:.4,built:false,grp:null,snap:[],npcs:[],types:[],t:0};
const wRnd=(()=>{let s=20261030;return ()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};})();   // scenery: the same every visit

/* ---- geometry: flat-shaded quads with a colour each. quad() takes an axis d (0 x, 1 y, 2 z), the face's sign, a corner o and edge lengths along the
   other two axes u=(d+1)%3, v=(d+2)%3; u x v = d, so o, o+du, o+du+dv, o+dv runs counter-clockwise seen from +d ---- */
function wGeoAcc(){return {P:[],N:[],C:[]};}
function wQuad(A,d,sg,o,lu,lv,col,jit){const u=(d+1)%3,v=(d+2)%3,a=o.slice(),b=o.slice(),c=o.slice(),e=o.slice();b[u]+=lu;c[u]+=lu;c[v]+=lv;e[v]+=lv;
  const q=sg>0?[a,b,c,a,c,e]:[a,e,c,a,c,b],n=[0,0,0];n[d]=sg;const k=1+(jit?(Math.random()-.5)*jit:0);
  for(const p of q){A.P.push(p[0],p[1],p[2]);A.N.push(n[0],n[1],n[2]);A.C.push(col.r*k,col.g*k,col.b*k);}}
function wBox(A,x0,x1,y0,y1,z0,z1,hex,jit){const c=new THREE.Color(hex),m=[x0,y0,z0],s=[x1-x0,y1-y0,z1-z0];
  for(let d=0;d<3;d++){const u=(d+1)%3,v=(d+2)%3,o=m.slice();wQuad(A,d,-1,o,s[u],s[v],c,jit);const o2=m.slice();o2[d]+=s[d];wQuad(A,d,1,o2,s[u],s[v],c,jit);}}
function wGeo(A){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(A.P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(A.N,3));
  g.setAttribute('color',new THREE.Float32BufferAttribute(A.C,3));g.computeBoundingSphere();return g;}
// greedy mesher over a voxel grid (Uint8 palette indices, 0 empty): every exposed face of a kept colour, merged into the largest rectangles of one colour
function wGreedy(V,pal,keep,scale,off){const A=wGeoAcc(),dims=[V.nx,V.ny,V.nz],get=(i,j,k)=>V.g[(j*V.nz+k)*V.nx+i],cols=pal.map(h=>new THREE.Color(h));
  for(let d=0;d<3;d++){const u=(d+1)%3,v=(d+2)%3,x=[0,0,0],q=[0,0,0];q[d]=1;const mask=new Int16Array(dims[u]*dims[v]);
    for(x[d]=-1;x[d]<dims[d];){let n=0;
      for(x[v]=0;x[v]<dims[v];x[v]++)for(x[u]=0;x[u]<dims[u];x[u]++){const a=x[d]>=0?get(x[0],x[1],x[2]):0,b=x[d]<dims[d]-1?get(x[0]+q[0],x[1]+q[1],x[2]+q[2]):0;
        mask[n++]=(a&&!b&&keep(a))?a:((b&&!a&&keep(b))?-b:0);}
      x[d]++;n=0;
      for(let j=0;j<dims[v];j++)for(let i=0;i<dims[u];){const c=mask[n];if(!c){i++;n++;continue;}
        let w=1;while(i+w<dims[u]&&mask[n+w]===c)w++;let h=1;outer:for(;j+h<dims[v];h++)for(let k=0;k<w;k++)if(mask[n+k+h*dims[u]]!==c)break outer;
        const o=[0,0,0];o[d]=x[d];o[u]=i;o[v]=j;const oo=[o[0]*scale+off[0],o[1]*scale+off[1],o[2]*scale+off[2]];
        wQuad(A,d,c>0?1:-1,oo,w*scale,h*scale,cols[Math.abs(c)],.06);
        for(let l=0;l<h;l++)for(let k=0;k<w;k++)mask[n+k+l*dims[u]]=0;i+=w;n+=w;}}}
  return wGeo(A);}

/* ---- the NPC body styles (metres; x from the rear bumper forward, y up from the ground). top: the silhouette's upper edge; belt: the waistline; green:
   the glasshouse's x range; pil: pillar bands painted between the side glass; axles: wheel centres; R: tyre radius; hl/gr/tl/pl: headlamp, grille,
   tail-lamp and plate heights. Proportions after typical cars of each class (DESIGN) ---- */
const NPAL=[0,0xffffff,0x25303b,0x141516,0x9aa0a7,0xf1eee0,0xa3141c,0x1b1d20,0xe6e6e0,0xdcdedb,0xb9bdc2,0x8c8c8c,0x3a3d42];   // 1 paint (the instance's colour) 2 glass 3 black trim and tyres 4 wheel face 5 lamp 6 tail lamp 7 grille 8 plate 9 trailer 10 chrome 11 shut line (paint, darker) 12 wheel spokes
const NMASS={sedan:1550,hatch:1250,wagon:1600,coupe:1500,crossover:1650,suv:2400,pickup:2500,van:2700,semi:16000,box:8000};   // kg, typical kerb weights of each class with a driver (E; the semi and box truck part-loaded)
const NTYPES=[   // proportions after typical cars of each class (DESIGN): a midsize sedan, a compact hatch, an estate, a two-door coupe, a compact crossover, a full-size SUV, a crew-cab pickup, a full-size van, a tractor-trailer and a 26 ft box truck
  {id:'sedan',w:.25,L:4.85,W:1.84,H:1.45,clr:.15,belt:1.0,top:[[0,.88],[.1,1.0],[.95,1.04],[1.62,1.42],[2.95,1.45],[3.62,1.02],[4.62,.86],[4.85,.72]],green:[.95,3.62],pil:[[2.25,2.36]],doors:[3.5,2.3,1.18],axles:[1.0,3.85],R:.33,hl:[.66,.77],gr:[.47,.62],tl:[.83,.94],pl:.52,mirror:[3.38,3.52]},
  {id:'hatch',w:.1,L:4.15,W:1.75,H:1.44,clr:.14,belt:.98,top:[[0,.92],[.1,1.12],[.5,1.38],[.8,1.44],[2.25,1.44],[2.98,1.0],[3.95,.85],[4.15,.72]],green:[.14,2.98],pil:[[1.62,1.74]],doors:[2.88,1.68,.82],axles:[.72,3.28],R:.32,hl:[.66,.76],gr:[.46,.6],tl:[.88,1.06],pl:.5,mirror:[2.78,2.92]},
  {id:'wagon',w:.05,L:4.85,W:1.82,H:1.48,clr:.15,belt:1.0,top:[[0,.95],[.06,1.36],[.28,1.46],[3.0,1.48],[3.62,1.03],[4.62,.86],[4.85,.72]],green:[.1,3.62],pil:[[2.2,2.31],[1.02,1.12]],doors:[3.5,2.25,1.12],axles:[.98,3.88],R:.33,hl:[.66,.77],gr:[.47,.62],tl:[.86,1.02],pl:.54,mirror:[3.4,3.54]},
  {id:'coupe',w:.05,L:4.7,W:1.9,H:1.34,clr:.13,belt:.92,top:[[0,.88],[.12,1.0],[.75,1.04],[1.55,1.31],[2.4,1.34],[3.12,.97],[4.48,.8],[4.7,.66]],green:[.8,3.12],pil:[[1.45,1.58]],doors:[2.98,1.62],axles:[1.05,3.78],R:.35,hl:[.62,.72],gr:[.38,.56],tl:[.8,.92],pl:.5,mirror:[2.88,3.02]},
  {id:'crossover',w:.14,L:4.55,W:1.86,H:1.64,clr:.19,belt:1.1,top:[[0,1.04],[.06,1.48],[.4,1.61],[2.9,1.64],[3.46,1.16],[4.35,1.0],[4.55,.86]],green:[.1,3.46],pil:[[2.06,2.18],[.95,1.06]],doors:[3.35,2.12,1.0],axles:[.92,3.62],R:.36,hl:[.76,.87],gr:[.5,.72],tl:[.98,1.12],pl:.6,mirror:[3.2,3.34],rails:1},
  {id:'suv',w:.12,L:5.0,W:1.98,H:1.82,clr:.23,belt:1.22,top:[[0,1.12],[.05,1.68],[.3,1.79],[3.2,1.82],[3.72,1.26],[4.78,1.1],[5.0,.94]],green:[.08,3.72],pil:[[2.3,2.43],[1.12,1.24]],doors:[3.6,2.36,1.2],axles:[1.0,3.98],R:.39,hl:[.88,1.0],gr:[.58,.86],tl:[1.08,1.26],pl:.64,mirror:[3.48,3.64],rails:1},
  {id:'pickup',w:.11,L:5.85,W:2.02,H:1.95,clr:.25,belt:1.24,top:[[0,1.24],[1.98,1.24],[2.03,1.88],[2.3,1.95],[3.42,1.95],[3.98,1.33],[5.62,1.24],[5.85,1.0]],green:[2.1,3.98],pil:[[2.98,3.1]],doors:[3.86,3.04,2.06],axles:[1.28,4.78],R:.4,hl:[1.0,1.12],gr:[.62,.98],tl:[.98,1.16],pl:.62,mirror:[3.8,3.96],
    cut:(x,y,az,T)=>x>.08&&x<1.96&&y>.88&&az<T.W/2-.07},
  {id:'van',w:.07,L:5.3,W:2.0,H:2.08,clr:.2,belt:1.16,top:[[0,1.98],[.08,2.08],[4.05,2.08],[4.62,1.26],[5.1,1.06],[5.3,.9]],green:[3.64,4.62],pil:[[3.64,3.76]],doors:[4.5,3.7,2.6],axles:[1.0,4.28],R:.37,hl:[.82,.94],gr:[.55,.8],tl:[.9,1.42],pl:.55,mirror:[4.38,4.52],white:.6},
  {id:'semi',w:.07,L:21.5,W:2.6,H:4.1,cs:.07,axles:[1.25,2.55,16.0,17.3,20.6],R:.52,fill:'semi',truck:1},
  {id:'box',w:.04,L:9.6,W:2.5,H:3.6,cs:.06,axles:[1.9,7.9],R:.5,fill:'box',truck:1,white:.85}];
// the trucks are drawn from their parts (x from the rear, metres)
const NFILL={
  semi:(x,y,az)=>{
    if(x<16.2&&y>1.25&&y<4.1&&az<=1.3)return y<1.4&&az>1.18?3:(az>1.26&&Math.abs(((x+.6)%1.22)-.61)<.04?10:9);   // the trailer box, its rub rail and side posts
    if(x<16.2&&y>1.05&&y<=1.25&&az<1.2)return 3;
    if(x>4.5&&x<5.0&&y>.7&&y<1.25&&az<1.15)return 3;                                                     // landing gear
    if(x>14.8&&x<20.9&&y>.55&&y<1.05&&az<.55)return 3;                                                   // frame rails
    if(x>17.6&&x<18.9&&y>.55&&y<1.15&&az>.6&&az<1.15)return 10;                                           // fuel tanks
    if(x>17.3&&x<17.5&&az>1.04&&az<1.2&&y>1.0&&y<4.05)return 10;                                          // stacks
    if(x>17.5&&x<19.6&&y>1.05&&y<3.55&&az<=1.22){if(x>19.32&&y>2.35&&y<3.0&&az<1.05)return 2;if(x>18.5&&x<19.4&&y>2.35&&y<3.0&&az>1.12)return 2;return 1;}   // sleeper and cab
    if(x>17.5&&x<19.2&&y>=3.55&&y<4.0&&az<1.15-(y-3.55)*.6)return 1;                                      // roof fairing
    if(x>=19.6&&x<21.5&&y>1.05&&y<2.25-(x-19.6)*.2&&az<=1.0-Math.max(0,x-20.9)*.5)return x>21.3&&y>1.2&&y<2.0&&az<.6?10:1;   // hood and grille
    if(x>19.9&&x<21.0&&y>.85&&y<1.55&&az>1.0&&az<1.24)return 1;                                          // front fenders
    if(x>21.15&&x<21.5&&y>.6&&y<1.05&&az<1.2)return 10;                                                   // bumper
    return 0;},
  box:(x,y,az)=>{
    if(x<7.25&&y>1.05&&y<3.6&&az<=1.25)return y<1.18?3:9;                                                // the box
    if(x>=7.25&&x<7.4&&y>1.05&&y<3.2&&az<1.1)return 3;
    if(x>7.4&&x<9.0&&y>.75&&y<2.75-(x>8.6?(x-8.6)*.6:0)&&az<=1.15-(y>2.0?(y-2.0)*.2:0)){if(y>1.85&&x>8.15&&az<1.02&&x<8.95)return 2;if(y>1.85&&x>7.6&&x<8.5&&az>1.0)return 2;return 1;}   // cab
    if(x>=9.0&&x<9.6&&y>.75&&y<1.75-(x-9.0)*.3&&az<=1.08)return x>9.45&&y>.95&&y<1.5&&az<.55?7:1;           // hood and grille
    if(x>0&&x<9.4&&y>.55&&y<.78&&az<.5)return 3;                                                          // frame
    if(x>9.4&&x<9.6&&y>.45&&y<.78&&az<1.15)return 10;                                                     // bumper
    return 0;}};
function npcGrid(T){const cs=T.cs||.04,zw=T.W/2+.15,nx=Math.ceil(T.L/cs),ny=Math.ceil((T.H+.06)/cs),nz=Math.ceil(2*zw/cs),g=new Uint8Array(nx*ny*nz),I=(i,j,k)=>(j*nz+k)*nx+i;
  const X=i=>(i+.5)*cs,Y=j=>(j+.5)*cs,AZ=k=>Math.abs((k+.5)*cs-zw),W2=T.W/2,F=T.fill&&NFILL[T.fill];
  const top=x=>{const p=T.top;for(let n=1;n<p.length;n++)if(x<=p[n][0]){const a=p[n-1],b=p[n];return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);}return p[p.length-1][1];};
  const hwAt=(x,y)=>{let w=W2;const r=.32,e=Math.min(x,T.L-x);if(e<r)w-=r-Math.sqrt(r*r-(r-e)*(r-e));if(y>T.belt)w-=(y-T.belt)*.32;if(y<T.clr+.1)w-=(T.clr+.1-y)*.6;
    const yt=top(x);if(y>yt-.05)w-=.03;return w;};
  for(let i=0;i<nx;i++){const x=X(i),yt=F?T.H:top(x);for(let j=0;j<ny;j++){const y=Y(j);if(!F&&(y<T.clr||y>yt))continue;const hw=F?9:hwAt(x,y);
    for(let k=0;k<nz;k++){const az=AZ(k);let c=0;
      if(F)c=F(x,y,az);
      else if(az<=hw){c=1;const side=az>hw-.07;
        if(y>T.belt+.03&&y<T.H-.06&&x>T.green[0]&&x<T.green[1]){const slope=yt<T.H-.06;c=(slope&&side)?1:(!slope&&side&&(T.pil||[]).some(p=>x>p[0]&&x<p[1]))?3:2;}   // glass; A and C pillars in the paint, B pillars black
        else if(side&&y>T.belt-.01&&y<=T.belt+.03&&x>T.green[0]-.05&&x<T.green[1])c=3;                  // the window line's black seal
        else if(y<T.clr+.08)c=3;                                                                          // sills and the bumpers' lower edge
        else if(side&&(T.doors||[]).some(d=>Math.abs(x-d)<cs*.5)&&y<T.belt)c=11;                           // door shut lines
        if(T.rails&&y>T.H-.03&&az>W2-.5&&az<W2-.38&&x>.5&&x<T.green[1]-.6)c=3;                             // roof rails
        if(T.cut&&T.cut(x,y,az,T))c=0;}
      if(c)g[I(i,j,k)]=c;}}}
  if(T.rails)for(let i=0;i<nx;i++){const x=X(i);if(x<.5||x>T.green[1]-.6)continue;for(let k=0;k<nz;k++){const az=AZ(k);if(az<W2-.5||az>W2-.38)continue;const j=Math.ceil((T.H)/cs);if(j<ny)g[I(i,j,k)]=3;}}
  // lamps, grille and plate on the front-most and rear-most cells of each row; the lamps wrap round the corners
  const front=(y,az)=>F?(y>(T.fill==='box'?.95:1.25)&&y<(T.fill==='box'?1.12:1.45)&&az>.62&&az<.98?5:0):(y>T.hl[0]&&y<T.hl[1]&&az>W2-.44&&az<W2-.06)?5:(az<.38&&y>T.gr[0]&&y<T.gr[1])?7:(az<.62&&y>T.clr+.08&&y<T.clr+.21)?7:0,
        rear=(y,az)=>F?(y>1.3&&y<1.48&&az>.95&&az<1.26?6:(az<.25&&y>1.22&&y<1.36?8:0)):(y>T.tl[0]&&y<T.tl[1]&&az>W2-.46&&az<W2-.03)?6:(az<.27&&y>T.pl&&y<T.pl+.13)?8:0;
  for(let j=0;j<ny;j++)for(let k=0;k<nz;k++){const y=Y(j),az=AZ(k);let f=-1,r=-1;for(let i=nx-1;i>=0;i--)if(g[I(i,j,k)]){f=i;break;}for(let i=0;i<nx;i++)if(g[I(i,j,k)]){r=i;break;}
    const cf=f>=0?front(y,az):0,cr=r>=0?rear(y,az):0;
    if(cf)for(let q=0;q<2&&f-q>=0;q++)if(g[I(f-q,j,k)])g[I(f-q,j,k)]=cf;if(cr)for(let q=0;q<2&&r+q<nx;q++)if(g[I(r+q,j,k)])g[I(r+q,j,k)]=cr;}
  if(!F)for(let i=0;i<nx;i++){const x=X(i);const fr=x>T.L-.3,rr=x<.24;if(!fr&&!rr)continue;for(let j=0;j<ny;j++){const y=Y(j);const lamp=fr?(y>T.hl[0]&&y<T.hl[1]?5:0):(y>T.tl[0]&&y<T.tl[1]?6:0);if(!lamp)continue;
    for(let k=0;k<nz;k++){const n=I(i,j,k);if(g[n]!==1)continue;const az=AZ(k),hw=hwAt(x,y);if(az>hw-.06)g[n]=lamp;}}}
  // wheel arches (lined black) and wheels: tyre black, the wheel's face grey with five dark spokes' gaps
  for(const xw of T.axles)for(let i=0;i<nx;i++){const x=X(i);if(Math.abs(x-xw)>T.R+.14)continue;for(let j=0;j<ny;j++){const y=Y(j),d=Math.hypot(x-xw,y-T.R);if(d>T.R+.14)continue;
    for(let k=0;k<nz;k++){const az=AZ(k),n=I(i,j,k);
      if(!F){if(d<=T.R+.08&&az>W2-.3)g[n]=0;else if(g[n]===1&&d<T.R+.14&&az<=W2-.26)g[n]=3;}
      if(d<=T.R&&az>W2-.28&&az<W2-.03){const face=az>W2-.09&&d<T.R*.66,a=Math.atan2(y-T.R,x-xw);g[n]=face?((d>T.R*.22&&d<T.R*.58&&Math.cos(5*a)>.55)?12:4):3;}}}}
  if(T.mirror)for(let i=0;i<nx;i++){const x=X(i);if(x<T.mirror[0]||x>T.mirror[1])continue;for(let j=0;j<ny;j++){const y=Y(j);if(y<T.belt+.02||y>T.belt+.16)continue;
    for(let k=0;k<nz;k++){const az=AZ(k);if(az>W2-.05&&az<W2+.12)g[I(i,j,k)]=1;}}}
  return {g,nx,ny,nz,cs,zw};}
const NPC_COL=[[0xf1f1ee,.23],[0x151617,.2],[0x6b7077,.17],[0xb7bbc0,.14],[0x1d3c6e,.09],[0x9b1b1e,.09],[0x1f4a35,.03],[0xc9b99a,.02],[0xe0b51e,.01],[0xd8611c,.01],[0x3a87c6,.01]];
function pickW(list){let tot=0;for(const it of list)tot+=it.w;let r=Math.random()*tot;for(const it of list){r-=it.w;if(r<=0)return it;}return list[list.length-1];}

/* ---- the static highway: one strip HW.LEN long, moved in whole HW.SNAP steps under the car so its markings and posts never shift ---- */
function roadTexture(){const W=256,H=1024,cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d'),pz=z=>(z+800)/1600*H,px=x=>x/HW.DASH*W;
  const band=(z0,z1,col)=>{g.fillStyle=col;const a=pz(Math.min(z0,z1)),b=pz(Math.max(z0,z1));g.fillRect(0,a,W,b-a);};
  band(-800,800,'#5b5d5f');
  for(const s of [-1,1]){const e0=HW.MED+HW.IN,e1=e0+3*HW.LANE;band(s*HW.MED,s*e0,'#4b4e53');band(s*e0,s*e1,'#3c3f44');band(s*e1,s*(HW.RAIL+12),'#4b4e53');
    for(let l=0;l<3;l++){const c=e0+HW.LANE*(l+.5);for(const w of [-1,1]){g.fillStyle='rgba(20,22,26,.28)';const a=pz(s*(c+w*48)),b=pz(s*(c+w*72));g.fillRect(0,Math.min(a,b),W,Math.abs(b-a));}}   // wheel tracks
    g.fillStyle='#d8b33a';{const a=pz(s*(e0+2)),b=pz(s*(e0+9.5));g.fillRect(0,Math.min(a,b),W,Math.abs(b-a));}      // yellow left edge line
    g.fillStyle='#e7e7e1';{const a=pz(s*(e1-9.5)),b=pz(s*(e1-2));g.fillRect(0,Math.min(a,b),W,Math.abs(b-a));}      // white right edge line
    for(let l=1;l<3;l++){const c=s*(e0+HW.LANE*l),a=pz(c-3.75),b=pz(c+3.75);g.fillRect(0,a,px(150),b-a);}          // lane dashes: 3 m of every 12
    g.fillStyle='rgba(15,16,18,.35)';for(let x=0;x<W;x+=8){const a=pz(s*(e1+14)),b=pz(s*(e1+30));g.fillRect(x,Math.min(a,b),3,Math.abs(b-a));}}   // rumble strip
  const im=g.getImageData(0,0,W,H),d=im.data;for(let i=0;i<d.length;i+=4){const n=(Math.random()-.5)*14;d[i]+=n;d[i+1]+=n;d[i+2]+=n;}g.putImageData(im,0,0);
  const t=new THREE.CanvasTexture(cv);t.wrapS=THREE.RepeatWrapping;t.wrapT=THREE.ClampToEdgeWrapping;t.anisotropy=Math.min(8,(renderer.capabilities&&renderer.capabilities.getMaxAnisotropy?renderer.capabilities.getMaxAnisotropy():1));return t;}
function grassTexture(){const S=128,cv=document.createElement('canvas');cv.width=cv.height=S;const g=cv.getContext('2d'),im=g.createImageData(S,S),d=im.data;
  for(let i=0;i<S*S;i++){const n=Math.random(),b=(i%S<64)!==(Math.floor(i/S)<64)?6:0;d[i*4]=72+n*22+b;d[i*4+1]=108+n*30+b;d[i*4+2]=52+n*14;d[i*4+3]=255;}g.putImageData(im,0,0);
  const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t;}
function signTexture(lines,sub){const cv=document.createElement('canvas');cv.width=512;cv.height=256;const g=cv.getContext('2d');
  g.fillStyle='#0d6b3c';g.fillRect(0,0,512,256);g.strokeStyle='#f4f4ee';g.lineWidth=7;g.strokeRect(10,10,492,236);g.fillStyle='#f4f4ee';g.textAlign='center';
  g.font='600 30px "Barlow Semi Condensed",system-ui,sans-serif';g.fillText(sub,256,62);g.font='600 64px "Barlow Semi Condensed",system-ui,sans-serif';g.fillText(lines[0],256,140);
  g.font='600 40px "Barlow Semi Condensed",system-ui,sans-serif';g.fillText(lines[1],256,206);const t=new THREE.CanvasTexture(cv);t.anisotropy=4;return t;}
function treeGeo(kind){const n=kind?11:9,h=kind?20:18,V={nx:n,ny:h,nz:n,g:new Uint8Array(n*h*n)},c=(n-1)/2,greens=[0x2f5a2a,0x386a30,0x2a4f27,0x44763a];const pal=[0,0x5b4330,...greens];
  for(let j=0;j<h;j++)for(let k=0;k<n;k++)for(let i=0;i<n;i++){const dx=i-c,dz=k-c;let v=0;
    if(j<4&&Math.abs(dx)<=.5&&Math.abs(dz)<=.5)v=1;
    else if(kind){const r=4.6-Math.abs(j-10.5)*.62;if(j>=4&&r>0&&dx*dx+dz*dz<=r*r)v=2+((i*7+j*3+k*5)%4);}                                       // round crown
    else{const r=(h-j)*.32;if(j>=3&&dx*dx+dz*dz<=r*r)v=2+((i*3+j+k*7)%4);}                                                                    // conifer
    V.g[(j*n+k)*n+i]=v;}
  return wGreedy(V,pal,v=>v>0,20,[-c*20-10,0,-c*20-10]);}
function buildHighway(){const grp=new THREE.Group();grp.visible=false;scene.add(grp);const matW=new THREE.MeshLambertMaterial({vertexColors:true});
  // road surface and the ground beyond it
  const rt=roadTexture();rt.repeat.set(HW.LEN/HW.DASH,1);const road=new THREE.Mesh(new THREE.PlaneGeometry(HW.LEN,1600),new THREE.MeshLambertMaterial({map:rt}));road.rotation.x=-Math.PI/2;
  const gt=grassTexture();gt.repeat.set(120,60);const gm=new THREE.MeshLambertMaterial({map:gt}),ground=new THREE.Group();
  for(const sd of [-1,1]){const grass=new THREE.Mesh(new THREE.PlaneGeometry(120000,60000),gm);grass.rotation.x=-Math.PI/2;grass.position.set(0,-.6,sd*(795+30000));ground.add(grass);}   // beside the road, never under it
  const strip=new THREE.Group();strip.add(road);grp.add(strip);grp.add(ground);
  // barriers, rails, posts, light poles (one geometry for the whole strip)
  const A=wGeoAcc(),L2=HW.LEN/2;
  wBox(A,-L2,L2,0,6,-15,15,0xa9a59c);wBox(A,-L2,L2,6,14,-11,11,0xb3afa6);wBox(A,-L2,L2,14,40,-5,5,0xbdb9b0);                              // median barrier (Jersey profile in steps)
  for(let x=-L2;x<L2;x+=HW.DASH)wBox(A,x-.6,x+.6,0,40.2,-15.2,15.2,0x8d8a83);                                                              // its joints
  for(const s of [-1,1]){const r0=s*HW.RAIL,zz=(a,b)=>[Math.min(r0+s*a,r0+s*b),Math.max(r0+s*a,r0+s*b)];
    {const [a,b]=zz(-4,0);wBox(A,-L2,L2,21,36,a,b,0xa7acb1);}{const [a,b]=zz(-4.6,-4);wBox(A,-L2,L2,26.5,30.5,a,b,0x8c9196);}             // W-beam rail and its fold
    for(let x=-L2;x<L2;x+=100){const [a,b]=zz(0,8);wBox(A,x-4,x+4,0,34,a,b,0x6d7278);const [c,d]=zz(-.2,3);wBox(A,x-3,x+3,23,34,c,d,0x5d6268);}}   // posts and blocks
  for(let x=-L2;x<L2;x+=HW.SNAP){wBox(A,x-4,x+4,40,560,-4,4,0x8a8f95);for(const s of [-1,1]){const a=s>0?4:-170,b=s>0?170:-4;wBox(A,x-3,x+3,548,556,a,b,0x8a8f95);
    wBox(A,x-9,x+9,538,548,s>0?150:-176,s>0?176:-150,0x50555b);wBox(A,x-7,x+7,536,538,s>0?152:-174,s>0?174:-152,0xf3efd8);}}               // median light poles every 60 m
  strip.add(new THREE.Mesh(wGeo(A),matW));
  // trees: a 192 m tile of random positions beside the road, seven tiles laid end to end
  const trees=[treeGeo(0),treeGeo(1)].map(g=>new THREE.InstancedMesh(g,matW,7*96));const tc=[0,0],m4=new THREE.Matrix4(),q=new THREE.Quaternion(),sv=new THREE.Vector3();
  const spots=[];for(let n=0;n<96;n++){const s=n%2?1:-1;spots.push([wRnd()*HW.TILE,s*(1050+Math.pow(wRnd(),1.6)*6500),.7+wRnd()*.7,wRnd()<.45?1:0,wRnd()*6.28]);}
  WORLD.treeN=[];for(const t of [0,-1,1,-2,2,-3,3]){for(const [x,z,sc,kd,ry] of spots){q.setFromAxisAngle(yAxis,ry);sv.set(sc,sc*(.85+(x%7)/20),sc);m4.compose(new THREE.Vector3(t*HW.TILE+x,-1,z),q,sv);trees[kd].setMatrixAt(tc[kd]++,m4);}WORLD.treeN.push(tc.slice());}   // nearest tile first
  const forest=new THREE.Group();trees.forEach((m,i)=>{m.count=tc[i];m.frustumCulled=false;forest.add(m);});grp.add(forest);WORLD.trees=trees;
  // overhead signs every 960 m, one for each carriageway
  const signs=new THREE.Group(),SA=wGeoAcc();
  for(const s of [-1,1]){const za=s*30,zb=s*(HW.RAIL+40),z0=Math.min(za,zb),z1=Math.max(za,zb);wBox(SA,-6,6,0,450,za-5,za+5,0x80858b);wBox(SA,-6,6,0,450,zb-5,zb+5,0x80858b);
    wBox(SA,-5,5,420,450,z0,z1,0x80858b);const p0=s*255,p1=s*620;wBox(SA,s>0?-2:-4,s>0?4:2,262,420,Math.min(p0,p1),Math.max(p0,p1),0x0d6b3c);}
  signs.add(new THREE.Mesh(wGeo(SA),matW));
  const face=(s,tex)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(365,158),new THREE.MeshLambertMaterial({map:tex}));m.position.set(s>0?-2.5:2.5,341,s*437.5);m.rotation.y=s>0?-Math.PI/2:Math.PI/2;signs.add(m);};
  face(1,signTexture(['Voxel Garage','EXIT 42  ·  1 MILE'],'Interstate 9 EAST'));face(-1,signTexture(['Garage District','EXIT 41  ·  2 MILES'],'Interstate 9 WEST'));
  const signRow=new THREE.Group();for(let t=-1;t<=1;t++){const c=signs.clone();c.position.x=t*HW.SIGN;signRow.add(c);}grp.add(signRow);
  // hills far off, terraced, hazed by the fog
  const HB=wGeoAcc();wBox(HB,-.5,.5,0,1,-.5,.5,0xffffff);const hills=new THREE.InstancedMesh(wGeo(HB),new THREE.MeshLambertMaterial({vertexColors:true}),3*3*40);let hc=0;const hcol=new THREE.Color();
  const hspots=[];for(let n=0;n<40;n++){const s=n%2?1:-1;hspots.push([wRnd()*HW.HILL,s*(12000+wRnd()*14000),5000+wRnd()*12000,3000+wRnd()*7000,300+wRnd()*1500]);}
  for(let t=-1;t<=1;t++)for(const [x,z,w,d,h] of hspots)for(let st=0;st<3;st++){const f=1-st*.3;m4.compose(new THREE.Vector3(t*HW.HILL+x,-2+st*h*.33,z),q.set(0,0,0,1),sv.set(w*f,h*.34,d*f));hills.setMatrixAt(hc,m4);
    hcol.setHSL(.25+st*.015,.3,.33+st*.04);hills.setColorAt(hc,hcol);hc++;}
  hills.count=hc;hills.frustumCulled=false;const range=new THREE.Group();range.add(hills);grp.add(range);WORLD.range=range;
  // the traffic's instanced meshes: per body style, the paint (coloured per car) and the rest
  const matNP=new THREE.MeshPhongMaterial({vertexColors:true,shininess:55,specular:0x2a2a2a}),white=new THREE.Color(1,1,1);
  WORLD.types=NTYPES.map(T=>{const V=npcGrid(T),off=[-T.L/2*50,0,-V.zw*50],sc=V.cs*50,cap=T.truck?50:220;
    const paint=new THREE.InstancedMesh(wGreedy(V,NPAL,c=>c===1||c===11,sc,off),matNP,cap),rest=new THREE.InstancedMesh(wGreedy(V,NPAL,c=>c>1&&c!==11,sc,off),matW,cap);
    paint.setColorAt(0,white);for(const m of [paint,rest]){m.count=0;m.frustumCulled=false;grp.add(m);}return {T,paint,rest};});
  WORLD.grp=grp;WORLD.snap=[[strip,HW.SNAP],[ground,1000],[forest,HW.TILE],[signRow,HW.SIGN],[range,HW.HILL]];WORLD.built=true;}

/* ---- traffic. Each car: dir (+1 our side, -1 oncoming), lane, x (units), z (units, eases to the lane's centre), v (m/s), v0 (its wanted speed) ---- */
const IDM={s0:2.5,T:1.3,b:2.4};
function laneWant(dir,l,truck){const kmh=truck?88+Math.random()*12:[118,108,98][l]+(Math.random()-.5)*16;return kmh/3.6;}
function npcMake(dir,l,x){const ty=WORLD.types.length?pickW(WORLD.types.map(t=>({w:t.T.w,t}))).t:null;if(!ty)return null;let lane=l;if(ty.T.truck&&lane===0)lane=1+Math.floor(Math.random()*2);
  const pal=ty.T.white&&Math.random()<ty.T.white?[[0xf1f1ee,1]]:NPC_COL,col=new THREE.Color(pickW(pal.map(c=>({w:c[1],c}))).c[0]);
  const v0=laneWant(dir,lane,ty.T.truck);return {ty,dir,lane,x,z:laneZ(dir,lane),zt:laneZ(dir,lane),v:v0*(.92+Math.random()*.08),v0,len:ty.T.L,hw:ty.T.W/2*50,col,lc:2+Math.random()*4,a:ty.T.truck?.7:1.4};}
function trafficTarget(){const d=WORLD.density;return d<=0?0:Math.round(6*(2*HW.WIN/50000)*(1.5+22*Math.pow(d,1.4)));}   // cars per km per lane: 1.5 (light) to 23.5 (rush hour)
function trafficPopulate(){const N=trafficTarget(),L=WORLD.npcs;const px=state.x;
  while(L.length>N)L.pop();
  let guard=0;while(L.length<N&&guard++<N*4){const dir=Math.random()<.5?1:-1,l=Math.floor(Math.random()*3),x=px+(Math.random()*2-1)*HW.WIN;
    if(Math.abs(x-px)<3000&&dir>0)continue;if(L.some(o=>o.dir===dir&&o.lane===l&&Math.abs(o.x-x)<(o.len+6)*50*1.6))continue;const n=npcMake(dir,l,x);if(n)L.push(n);}}
function trafficStep(dt){const L=WORLD.npcs,px=state.x,pz=state.z,ph=Math.cos(state.psi),pvx=state.v*ph;
  // per carriageway and lane, the cars in order of travel; the player joins every lane it overlaps as one more car
  const lanes=new Map(),key=(d,l)=>d*10+l;for(const o of L){const k=key(o.dir,o.lane);if(!lanes.has(k))lanes.set(k,[]);lanes.get(k).push(o);
    if(o.z!==o.zt){const kl=key(o.dir,o.from);if(o.from!==undefined&&o.from!==o.lane){if(!lanes.has(kl))lanes.set(kl,[]);lanes.get(kl).push(o);}}}
  const me={x:px,v:Math.max(0,pvx),len:4.4,me:1};
  for(let l=0;l<3;l++)for(const d of [-1,1])if(Math.abs(pz-laneZ(d,l))<150&&Math.sign(pz)===d){const k=key(d,l);if(!lanes.has(k))lanes.set(k,[]);lanes.get(k).push({...me,v:Math.max(0,pvx*d)});}
  for(const [k,arr] of lanes){const d=k>0?1:-1;arr.sort((a,b)=>(a.x-b.x)*d);for(let i=0;i<arr.length;i++){const o=arr[i];if(o.me)continue;const ld=arr[i+1];
    const lead=ld?{gap:Math.abs(ld.x-o.x)/50-(ld.len+o.len)/2,v:ld.v}:null;if(!o.lead||(lead&&lead.gap<o.lead.gap))o.lead=lead;}}
  for(const o of L){const s=o.lead?Math.max(.1,o.lead.gap):1e4,dv=o.lead?o.v-o.lead.v:0,ss=IDM.s0+Math.max(0,o.v*IDM.T+o.v*dv/(2*Math.sqrt(o.a*IDM.b)));
    let acc=o.a*(1-Math.pow(o.v/o.v0,4)-(ss/s)*(ss/s));acc=Math.max(-9,Math.min(o.a,acc));o.v=Math.max(0,o.v+acc*dt);o.x+=o.dir*o.v*dt*50;
    const dz=o.zt-o.z,st=HW.LANE/3.2*dt;o.zv=Math.abs(dz)<=st?dz/dt:Math.sign(dz)*HW.LANE/3.2;o.z=Math.abs(dz)<=st?o.zt:o.z+Math.sign(dz)*st;if(o.z===o.zt)o.from=o.lane;
    if(o.bumpZ){o.z+=o.bumpZ*50*dt;o.bumpZ*=Math.max(0,1-dt*2.5);if(Math.abs(o.bumpZ)<.05)o.bumpZ=0;const zs=o.dir*o.z;if(zs<HW.MED+o.hw||zs>HW.RAIL-o.hw){o.z=o.dir*clamp(zs,HW.MED+o.hw,HW.RAIL-o.hw);o.bumpZ=0;}}   // knocked sideways by a hit: it drifts off its line, its driver steers back to the lane
    // lane changes: out to pass a slower car, back in to keep right; only into a gap that needs nobody to brake hard
    o.lc-=dt;if(o.lc<=0&&o.z===o.zt){o.lc=1.5+Math.random()*3;const want=[];const slowed=o.lead&&o.lead.gap<90&&o.lead.v<o.v0-2;
      if(slowed&&o.lane>0&&!(o.ty.T.truck&&o.lane===1))want.push(o.lane-1);if(o.lane<2&&Math.random()<.6)want.push(o.lane+1);if(slowed&&o.lane<2)want.push(o.lane+1);
      for(const nl of want){const g=gapsAt(o,nl);if(!g)continue;const keepRight=nl>o.lane;if(keepRight&&!slowed&&g.ahead<120)continue;if(keepRight&&slowed&&g.aheadV<o.v)continue;
        if(g.ahead>Math.max(14,o.v*.9)&&g.behind>Math.max(10,(g.behindV-o.v)*3+g.behindV*.7)){o.from=o.lane;o.lane=nl;o.zt=laneZ(o.dir,nl);break;}}}
    o.lead=null;
    // out of the window: on to the far end of it, into a free spot
    const dx=o.x-px;if(Math.abs(dx)>HW.WIN){o.x-=Math.sign(dx)*2*HW.WIN*(.97+Math.random()*.03);const nl=Math.floor(Math.random()*3);
      if(!(o.ty.T.truck&&nl===0)&&!L.some(p=>p!==o&&p.dir===o.dir&&p.lane===nl&&Math.abs(p.x-o.x)<(p.len+o.len)*50)){o.lane=o.from=nl;o.z=o.zt=laneZ(o.dir,nl);}o.v=o.v0*.95;}}
  // the player against the traffic: three discs along the car against each car's box; the player stops sharing the space, the other car brakes
  const fx=Math.cos(state.psi),fz=-Math.sin(state.psi),R=44;for(const o of L){if(Math.abs(o.x-px)>700||Math.abs(o.z-pz)>260)continue;const hl=o.len*25;
    for(const t of [-68,0,68]){const cx=px+fx*t,cz=pz+fz*t,qx=Math.max(o.x-hl,Math.min(cx,o.x+hl)),qz=Math.max(o.z-o.hw,Math.min(cz,o.z+o.hw)),ex=cx-qx,ez=cz-qz,dd=Math.hypot(ex,ez);
      if(dd>=R)continue;const nx=dd>1e-3?ex/dd:Math.sign(cx-o.x)||1,nz=dd>1e-3?ez/dd:0,pen=R-dd;state.x+=nx*pen;state.z+=nz*pen;
      // a collision between two bodies: the impulse at the contact point (on the player's disc, toward the other car) with both masses; the player is
      // pushed and turned by where it was hit, the other car takes the opposite impulse along the road and sideways
      const om=NMASS[o.ty.T.id]||1500,j=contactImpulse(nx,nz,(fx*t-nx*R)*.02,(fz*t-nz*R)*.02,o.dir*o.v,(o.zv||0)/50,om,.25,.35);
      if(j>0){o.v=Math.max(0,o.v-j*nx/om*o.dir+(WORLD.hitJt||0)*nz/om*o.dir);o.bumpZ=(o.bumpZ||0)-(j*nz+(WORLD.hitJt||0)*nx)/om;WORLD.bump=Math.max(WORLD.bump||0,Math.min(.45,WORLD.hitV*.04));}}
    // the open panels against this car's box, below its roof: the deepest point is pushed out the short way and takes the impulse there
    const pts=WORLD.panelPts||[];if(!pts.length)continue;const c=Math.cos(state.psi),sn=Math.sin(state.psi),top=(o.ty.T.H||1.5)*50;let hit=null;
    for(const q of pts){if(q.y<0||q.y>top)continue;const ox=q.x*c+q.z*sn,oz=-q.x*sn+q.z*c,wx=state.x+ox,wz=state.z+oz,ex=hl-Math.abs(wx-o.x),ez=o.hw-Math.abs(wz-o.z);
      if(ex<=0||ez<=0)continue;const pen=Math.min(ex,ez);if(!hit||pen>hit.pen)hit=ex<ez?{pen,nx:Math.sign(wx-o.x)||1,nz:0,ox,oz,k:q.k}:{pen,nx:0,nz:Math.sign(wz-o.z)||1,ox,oz,k:q.k};}
    if(hit){state.x+=hit.nx*hit.pen;state.z+=hit.nz*hit.pen;WORLD.panelHit=hit.k;
      const om=NMASS[o.ty.T.id]||1500,j=contactImpulse(hit.nx,hit.nz,hit.ox*.02,hit.oz*.02,o.dir*o.v,(o.zv||0)/50,om,.25,.35);
      if(j>0){o.v=Math.max(0,o.v-j*hit.nx/om*o.dir+(WORLD.hitJt||0)*hit.nz/om*o.dir);o.bumpZ=(o.bumpZ||0)-(j*hit.nz+(WORLD.hitJt||0)*hit.nx)/om;WORLD.bump=Math.max(WORLD.bump||0,Math.min(.45,WORLD.hitV*.04));}}}}
function gapsAt(o,nl){let ahead=1e4,aheadV=99,behind=1e4,behindV=0;for(const p of WORLD.npcs){if(p===o||p.dir!==o.dir||(p.lane!==nl&&p.from!==nl))continue;const g=(p.x-o.x)*o.dir/50,c=(p.len+o.len)/2;
    if(g>0){if(g-c<ahead){ahead=g-c;aheadV=p.v;}}else if(-g-c<behind){behind=-g-c;behindV=p.v;}}
  const pz=state.z;if(Math.abs(pz-laneZ(o.dir,nl))<150&&Math.sign(pz)===o.dir){const g=(state.x-o.x)*o.dir/50,c=(4.4+o.len)/2,pv=Math.max(0,state.v*Math.cos(state.psi)*o.dir);
    if(g>0){if(g-c<ahead){ahead=g-c;aheadV=pv;}}else if(-g-c<behind){behind=-g-c;behindV=pv;}}
  return {ahead,aheadV,behind,behindV};}
const wM=new THREE.Matrix4(),wQ=new THREE.Quaternion(),wP=new THREE.Vector3(),wS=new THREE.Vector3(1,1,1);
function trafficDraw(){const cnt=new Map();for(const ty of WORLD.types)cnt.set(ty,0);const px=state.x;
  for(const o of WORLD.npcs){if(Math.abs(o.x-px)>HW.DRAW)continue;const ty=o.ty,n=cnt.get(ty);if(n>=ty.paint.instanceMatrix.count)continue;
    const yaw=(o.dir>0?0:Math.PI)-Math.atan2((o.zv||0)/50,Math.max(1,o.v))*o.dir;wQ.setFromAxisAngle(yAxis,yaw);wP.set(o.x,0,o.z);wM.compose(wP,wQ,wS);
    ty.paint.setMatrixAt(n,wM);ty.rest.setMatrixAt(n,wM);ty.paint.setColorAt(n,o.col);cnt.set(ty,n+1);}
  for(const ty of WORLD.types){const n=cnt.get(ty);ty.paint.count=ty.rest.count=n;ty.paint.instanceMatrix.needsUpdate=ty.rest.instanceMatrix.needsUpdate=true;if(ty.paint.instanceColor)ty.paint.instanceColor.needsUpdate=true;}}

/* ---- graphics settings. Auto starts at Medium on phones and tablets (a coarse pointer or a small screen) and at High elsewhere, and steps down a level
   when the frame rate stays under 28 fps for 4 s. A level sets the render resolution, how often and how sharply the mirrors are redrawn, the highway's
   view distance and fog, how far traffic is drawn and how many trees stand. Everything stays voxels at every level ---- */
const GFX_LV={low:{pr:.75,mirEvery:3,mirRes:.5,draw:13000,fog:[1600,14000],far:18000,trees:3,hills:false},
  medium:{pr:1,mirEvery:2,mirRes:.75,draw:20000,fog:[2200,20000],far:26000,trees:5,hills:true},
  high:{pr:2,mirEvery:1,mirRes:1,draw:27000,fog:[2600,26000],far:40000,trees:7,hills:true}};
const GFX={pick:'auto',level:'high',acc:0,n:0,frame:0,lowered:false};
const gfxAuto=()=>{const coarse=!!(window.matchMedia&&matchMedia('(pointer: coarse)').matches),small=Math.min(innerWidth,innerHeight)<600;return coarse||small?'medium':'high';};
const gfxL=()=>GFX_LV[GFX.level]||GFX_LV.high;
function gfxApply(level){GFX.level=level;const L=gfxL();renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,L.pr));resize();
  for(const m of MIRRORS)if(m.rt)m.rt.setSize(Math.round(320*L.mirRes),Math.max(24,Math.round(320*L.mirRes*m.h/m.w)));
  HW.DRAW=L.draw;if(WORLD.trees)WORLD.trees.forEach((m,i)=>m.count=WORLD.treeN[L.trees-1][i]);if(WORLD.range)WORLD.range.visible=L.hills;
  if(WORLD.kind==='highway'){FOGR[0]=L.fog[0];FOGR[1]=L.fog[1];themeBG();camera.far=L.far;camera.updateProjectionMatrix();}
  for(const b of document.querySelectorAll('#gfx button'))b.classList.toggle('on',b.dataset.g===GFX.pick);
  const nm=GFX.level[0].toUpperCase()+GFX.level.slice(1);$('gfxNote').textContent=GFX.pick==='auto'?'Auto is using '+nm+(GFX.lowered?' (lowered to keep the frame rate up).':' for this device.'):nm+' quality.';}
function gfxPick(p){GFX.pick=p;GFX.lowered=false;GFX.acc=GFX.n=0;try{localStorage.setItem('vg.gfx',p);}catch(e){}gfxApply(p==='auto'?gfxAuto():p);}
function gfxFrame(dt){GFX.frame++;if(GFX.pick!=='auto')return;GFX.acc+=dt;GFX.n++;if(GFX.acc<4)return;const fps=GFX.n/GFX.acc;GFX.acc=GFX.n=0;
  if(fps<28&&GFX.level!=='low'){GFX.lowered=true;gfxApply(GFX.level==='high'?'medium':'low');}}
const mirrorsDue=()=>{const e=gfxL().mirEvery*(state.view==='cockpit'?1:2);return GFX.frame%e===0;};
for(const b of document.querySelectorAll('#gfx button'))b.onclick=()=>gfxPick(b.dataset.g);
{let p='auto';try{p=localStorage.getItem('vg.gfx')||'auto';}catch(e){}if(!GFX_LV[p]&&p!=='auto')p='auto';GFX.pick=p;GFX.level=p==='auto'?gfxAuto():p;}

// a still lineup of every body style beside the car, for checking the models (tests and renders)
WORLD.lineup=(gap)=>{WORLD.frozen=true;WORLD.npcs.length=0;let x=state.x+400;for(const ty of WORLD.types){const o=npcMake(1,2,0);o.ty=ty;o.len=ty.T.L;o.hw=ty.T.W/2*50;o.lane=2;o.z=o.zt=laneZ(1,2);
  o.x=x+ty.T.L*25;o.v=0;o.col=new THREE.Color([0xb3221e,0x1d3c6e,0xb7bbc0,0x151617,0xf1f1ee,0x1f4a35,0xd8611c,0x6b7077,0xf1f1ee,0xf1f1ee][WORLD.npcs.length%10]);x+=ty.T.L*50+(gap||250);WORLD.npcs.push(o);}trafficDraw();return WORLD.npcs.map(o=>[o.ty.T.id,Math.round(o.x)]);};
/* ---- per frame (called from update after the car's own step) ---- */
// the car's footprint (world units, the body's frame): front and rear bumper faces and half the body's width, from the drawn body's cells. The
// opening panels are left out of it (closed, they lie inside the body; open, they are tested on their own: openPanelPts), so the footprint no longer
// depends on what happened to be open when the car was first measured
let DIMS=null;
// open panels (owner, Nov 14: "collision on the doors, like the car itself becomes one whole asset"): an open door, falcon wing, hood or hatch is part
// of the car's solid. Each open panel is sampled as a 3 x 3 x 3 lattice over its own box (its meshes' bounds in the panel's frame, so a thin door
// stays a thin slab however far it swings), carried into the body's frame as it stands this frame. The points are tested against the barriers and
// the traffic at their heights: a falcon wing passes over the knee-high median wall, a front door swung out does not.
const PANEL_KEYS=['doorL','doorR','rdoorL','rdoorR','hood','trunk'];
const pnInv=new THREE.Matrix4(),pnM=new THREE.Matrix4(),pnR=new THREE.Matrix4(),pnV=new THREE.Vector3(),pnB=new THREE.Box3();
function openPanelPts(){const out=[];pnInv.copy(carRoot.matrixWorld).invert();
  for(const k of PANEL_KEYS){const g=P[k];if(!g||!g.isObject3D||!((anim[k]||0)>.03))continue;g.updateMatrixWorld(true);
    const gi=new THREE.Matrix4().copy(g.matrixWorld).invert();pnB.makeEmpty();
    g.traverse(o=>{if(!o.isMesh||!o.visible||!o.geometry)return;const G=o.geometry;if(!G.boundingBox)G.computeBoundingBox();const b=G.boundingBox;if(!b||b.isEmpty())return;
      pnM.multiplyMatrices(gi,o.matrixWorld);for(let i=0;i<8;i++){pnV.set(i&1?b.max.x:b.min.x,i&2?b.max.y:b.min.y,i&4?b.max.z:b.min.z).applyMatrix4(pnM);pnB.expandByPoint(pnV);}});
    if(pnB.isEmpty())continue;pnR.multiplyMatrices(pnInv,g.matrixWorld);
    for(let i=0;i<3;i++)for(let j=0;j<3;j++)for(let l=0;l<3;l++){pnV.set(pnB.min.x+(pnB.max.x-pnB.min.x)*i/2,pnB.min.y+(pnB.max.y-pnB.min.y)*j/2,pnB.min.z+(pnB.max.z-pnB.min.z)*l/2).applyMatrix4(pnR);
      out.push({x:pnV.x,y:pnV.y,z:pnV.z,k});}}
  return out;}
// the median wall's face (its distance from the centre line) at a height: the Jersey profile's three steps, as drawn (buildHighway)
const medFace=y=>y<6?15:y<14?11:5;
WORLD.openPanelPts=openPanelPts;   // for the tests (t/door_collide.js)
function carDims(){if(DIMS&&DIMS.id===CARID)return DIMS;let x0=1e9,x1=-1e9,zw=0;
  const ib=new THREE.Matrix4().copy(carRoot.matrixWorld).invert(),M=new THREE.Matrix4(),v=new THREE.Vector3();carRoot.updateMatrixWorld(true);
  const inPanel=o=>{for(let q=o;q&&q!==carRoot;q=q.parent)for(const k of PANEL_KEYS)if(P[k]===q)return true;return false;};
  carRoot.traverse(o=>{if(!o.isMesh||!o.geometry||!o.geometry.userData||!o.geometry.userData.src)return;const g=o.geometry.userData.src;if(g.x0===undefined||inPanel(o))return;M.multiplyMatrices(ib,o.matrixWorld);
    for(const X of [g.x0,g.x1])for(const Y of [g.y0,g.y1])for(const Z of [g.z0,g.z1]){v.set(X,Y,Z).applyMatrix4(M);x0=Math.min(x0,v.x);x1=Math.max(x1,v.x);if(o===P.bodyMesh||(o.parent&&o.parent===P.bodyMesh))zw=Math.max(zw,Math.abs(v.z));}});
  if(!(x1>x0))return {id:null,xf:110,xr:-110,hw:42};
  DIMS={id:CARID,xf:x1,xr:x0,hw:zw>20?zw:(CAR.fenderOuter?CAR.fenderOuter/20:42)};return DIMS;}
// an impulse at a contact on the car: normal (nx, nz) pointing out of what was hit, contact offset from the car's centre (px, pz in metres, world axes);
// the other body moves at (ovx, ovz) m/s with mass om (1e9: a wall); restitution e, friction mu. Returns the normal impulse (N s)
function contactImpulse(nx,nz,px,pz,ovx,ovz,om,e,mu){
  const M=phys.MASS,L=phys.WHEELBASE,wf=phys.WF||.52,Iz=M*L*L*wf*(1-wf)*1.05,c=Math.cos(state.psi),sn=Math.sin(state.psi),fx=c,fz=-sn,lx=-sn,lz=-c;
  let Vx=state.v*fx+(state.vy||0)*lx,Vz=state.v*fz+(state.vy||0)*lz,r=state.yawR||0;
  const vpx=Vx+r*pz-ovx,vpz=Vz-r*px-ovz,vn=vpx*nx+vpz*nz;WORLD.hitV=0;if(vn>=0)return 0;   // separating already
  const tx=-nz,tz=nx,vt=vpx*tx+vpz*tz,cn=nx*pz-nz*px,ct=tx*pz-tz*px,iM=1/M+1/om;
  const j=-(1+e)*vn/(iM+cn*cn/Iz),jt=clamp(-vt/(iM+ct*ct/Iz),-mu*j,mu*j);
  Vx+=(j*nx+jt*tx)/M;Vz+=(j*nz+jt*tz)/M;r+=(j*cn+jt*ct)/Iz;
  state.v=Vx*fx+Vz*fz;state.vy=Vx*lx+Vz*lz;state.yawR=r;WORLD.hitV=-vn;WORLD.hitJ=j;WORLD.hitJt=jt;return j;}
function worldStep(dt){if(WORLD.kind!=='highway'||!WORLD.built)return;
  // barriers: the median wall and the guardrail are rigid. Each corner of the car's footprint is tested against them; a corner past a wall is pushed
  // back out and the contact takes an impulse (restitution and scraping friction) at that corner, so the car bounces off, loses speed along the wall
  // and is turned by where it hit: nose-first it swings round, a glancing touch scrapes along
  {const s=Math.sign(state.z)||1,D=carDims(),c=Math.cos(state.psi),sn=Math.sin(state.psi);let best=null;
   for(const ox of [D.xf,D.xr])for(const oy of [D.hw,-D.hw]){const px=ox*c-oy*sn,pz=-ox*sn-oy*c,zc=state.z+pz;   // corner offset (units): ox forward, oy left
     const pin=HW.MED-s*zc,pout=s*zc-HW.RAIL;if(pin>0&&(!best||pin>best.pen))best={pen:pin,nz:s,px,pz};if(pout>0&&(!best||pout>best.pen))best={pen:pout,nz:-s,px,pz};}
   // the open panels' points, each at its height: the median wall up to 40 (its profile's face at that height), the guardrail up to 36
   WORLD.panelPts=openPanelPts();WORLD.panelHit=null;
   for(const q of WORLD.panelPts){if(q.y<0||q.y>40)continue;const px=q.x*c+q.z*sn,pz=-q.x*sn+q.z*c,zc=state.z+pz;
     const pin=medFace(q.y)-s*zc,pout=q.y<=36?s*zc-(HW.RAIL-4):-1;
     if(pin>0&&(!best||pin>best.pen)){best={pen:pin,nz:s,px,pz,k:q.k};}if(pout>0&&(!best||pout>best.pen)){best={pen:pout,nz:-s,px,pz,k:q.k};}}
   if(best&&best.k)WORLD.panelHit=best.k;
   if(best){state.z+=best.nz*best.pen;contactImpulse(0,best.nz,best.px*.02,best.pz*.02,0,0,1e9,.2,.45);WORLD.bump=Math.max(WORLD.bump||0,Math.min(.45,WORLD.hitV*.04));}}
  if(!WORLD.frozen){if(trafficTarget()!==WORLD.npcs.length)trafficPopulate();trafficStep(dt);}trafficDraw();
  if(WORLD.bump>0){WORLD.bump-=dt;state.bobExtra=Math.sin(WORLD.bump*60)*.25*WORLD.bump;}else state.bobExtra=0;
  for(const [g,p] of WORLD.snap)g.position.x=Math.round(state.x/p)*p;}
function worldSpawn(){if(WORLD.kind!=='highway')return;state.x=Math.round(state.x/HW.SNAP)*HW.SNAP;state.z=laneZ(1,2)+170;state.psi=0;state.v=state.vy=state.yawR=0;}   // on the right shoulder, facing the traffic's way
function setWorld(kind){if(kind===WORLD.kind)return;if(kind==='highway'&&!WORLD.built)buildHighway();WORLD.kind=kind;const hw=kind==='highway';
  WORLD.grp&&(WORLD.grp.visible=hw);if(floorMesh)floorMesh.visible=!hw;const L=gfxL();FOGR[0]=hw?L.fog[0]:900;FOGR[1]=hw?L.fog[1]:3200;themeBG();camera.far=hw?L.far:6000;camera.updateProjectionMatrix();if(hw)gfxApply(GFX.level);
  if(hw){worldSpawn();WORLD.npcs.length=0;trafficPopulate();if(state.view==='orbit'&&state.mode==='drive'){state.view='chase';$('tView').textContent='View: Chase';}}
  else{state.x=state.z=state.psi=state.v=0;state.bobExtra=0;}
  $('wLot').classList.toggle('on',!hw);$('wHwy').classList.toggle('on',hw);$('wTrafWrap').hidden=!hw;}
$('wLot').onclick=()=>setWorld('lot');$('wHwy').onclick=()=>setWorld('highway');
$('wTraf').oninput=e=>{WORLD.density=(+e.target.value)/100;$('wTrafV').textContent=WORLD.density<=0?'Empty':WORLD.density<.3?'Light':WORLD.density<.65?'Busy':'Rush hour';};
