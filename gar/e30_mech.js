/* ===== E30 running gear and engine-bay furniture. 10 mm cells, absolute (cell i spans world (i-.5)/2 .. (i+.5)/2; meshes drawn at scale .5) unless a builder says
   it is local. Hard points come from E30_SUSP (e30_core.js, shared with the body's towers, tubs, rails and pockets) and E30_RIG (e30_rig.js).
   Layout after E30 325i photographs (LHD): radiator with the expansion tank in its right-hand end tank, viscous fan in a shroud, air box and air-flow meter in the
   front left corner, brake booster and master cylinder on the left of the firewall above the steering column's exit, fuse and relay box on the left apron, washer
   bottle on the right apron; battery in the trunk (325i). Front axle carrier under the engine with the rack behind it; rear sub-frame ahead of the axle carrying
   the semi-trailing arms and the final drive (Type 188 small case). Sizes DESIGN unless marked. ===== */
function HC(){const cells=[],W=v=>Math.round(v*2);
  const o={cells,
    put:(x,y,z,c)=>cells.push([W(x),W(y),W(z),c]),
    box:(x0,x1,y0,y1,z0,z1,c)=>{const a=[x0,x1].sort((p,q)=>p-q),b=[y0,y1].sort((p,q)=>p-q),d=[z0,z1].sort((p,q)=>p-q);
      for(let i=Math.ceil(a[0]*2-1e-9);i<=Math.floor(a[1]*2+1e-9);i++)for(let j=Math.ceil(b[0]*2-1e-9);j<=Math.floor(b[1]*2+1e-9);j++)for(let k=Math.ceil(d[0]*2-1e-9);k<=Math.floor(d[1]*2+1e-9);k++)cells.push([i,j,k,typeof c==='function'?c(i/2,j/2,k/2):c]);},
    // cylinder along an axis ('x','y','z'); (a,b) its centre in the other two axes in order (x: y,z; y: x,z; z: x,y); u0..u1 along the axis; rin: hollow
    cyl:(ax,a,b,r,u0,u1,c,rin)=>{const U0=Math.ceil(Math.min(u0,u1)*2-1e-9),U1=Math.floor(Math.max(u0,u1)*2+1e-9),A0=Math.floor((a-r)*2),A1=Math.ceil((a+r)*2),B0=Math.floor((b-r)*2),B1=Math.ceil((b+r)*2);
      for(let u=U0;u<=U1;u++)for(let p=A0;p<=A1;p++)for(let q=B0;q<=B1;q++){const d=Math.hypot(p/2-a,q/2-b);if(d>r||(rin!==undefined&&d<rin))continue;const col=typeof c==='function'?c(u/2,d):c;
        if(ax==='x')cells.push([u,p,q,col]);else if(ax==='y')cells.push([p,u,q,col]);else cells.push([p,q,u,col]);}},
    seg:(P,Q,r,c)=>{const n=Math.ceil(Math.hypot(Q[0]-P[0],Q[1]-P[1],Q[2]-P[2])*4)+1;for(let t=0;t<=n;t++){const p=[0,1,2].map(m=>(P[m]+(Q[m]-P[m])*t/n)*2),R=r*2;
      for(let i=Math.floor(p[0]-R);i<=Math.ceil(p[0]+R);i++)for(let j=Math.floor(p[1]-R);j<=Math.ceil(p[1]+R);j++)for(let k=Math.floor(p[2]-R);k<=Math.ceil(p[2]+R);k++)if(Math.hypot(i-p[0],j-p[1],k-p[2])<=R)cells.push([i,j,k,c]);}},
    poly:(pts,r,c)=>{for(let i=0;i<pts.length-1;i++)o.seg(pts[i],pts[i+1],r,c);},
    grid:()=>cellsToGrid(cells)};
  return o;}

/* ---- engine-bay furniture. o: {fan:{y,z,r} the engine's viscous fan (world) or null, efan: an electric fan on the radiator instead (swap kits), radShift (units,
   a slimline radiator moved forward), relocate (washer bottle moved to the trunk with the battery: LS kit)} ---- */
function genBayE30(o){o=o||{};const h=HC(),F=E30_SUSP.front,rs=o.radShift||0,BLK=0x16171a,DK=0x1b1c1e;
  // radiator (cross-flow): core 600 x 390 mm, plastic end tanks; the right-hand tank carries the expansion tank and its cap (M20 E30)
  const rx0=94.75+rs,rx1=96.25+rs;
  h.box(rx0,rx1,15.5,35,-13.5,13.5,(x,y,z)=>x<=rx0+.1?((Math.round(y*2)%2)?0x3a3e44:0x2a2d31):0x2a2d31);
  h.box(rx0-.25,rx1+.25,15,35.5,-16.75,-13.75,BLK);h.box(rx0-.25,rx1+.25,15,37.5,13.75,16.75,BLK);   // end tanks, inboard of the frame rails
  h.box(rx0+.25,rx1-.25,37.5,38,14,16.5,0xcfcab8);h.cyl('y',rx0+.75,15.25,.9,38,38.75,0x2b2c2f);   // expansion chamber top and its cap
  for(const z of [-12,12])h.box(rx0+.25,rx1-.25,14.5,15.25,z-1,z+1,0x0f1011);                           // rubber feet on the lower cross-member, up to the core's bottom tank
  for(const z of [-9,9])h.box(rx1+.25,98.25,34.5,35.25,z-.75,z+.75,DK);                                 // upper brackets to the front panel
  // fan shroud on the radiator's back face, its ring round the viscous fan; or a flat shroud with an electric fan (swap kits)
  if(o.fan&&!o.efan){const f=o.fan,R=f.r+.5;
    h.box(93.25+rs,93.75+rs,16.5,35,-16.75,16.75,(x,y,z)=>Math.hypot(y-f.y,z-f.z)<R?-1:DK);
    for(const [y0,y1,z0,z1] of [[16.5,17,-16.75,16.75],[34.5,35,-16.75,16.75],[16.5,35,-16.75,-16.25],[16.5,35,16.25,16.75]])h.box(93.75+rs,rx0-.25,y0,y1,z0,z1,DK);
    h.cyl('x',f.y,f.z,R+.5,90.75,93.25+rs,DK,R);}
  else{const f={y:25,z:0,r:8.5};
    h.box(93.25+rs,93.75+rs,16.5,35,-16.75,16.75,(x,y,z)=>Math.hypot(y-f.y,z-f.z)<f.r+.4?-1:DK);
    h.cyl('x',f.y,f.z,f.r+.9,92.25+rs,93.25+rs,DK,f.r+.4);h.cyl('x',f.y,f.z,1.6,91.25+rs,92.75+rs,0x2a2c30);
    for(let a=0;a<3;a++){const t=a*Math.PI*2/3+Math.PI/2;h.seg([91.75+rs,f.y+1.5*Math.sin(t),f.z+1.5*Math.cos(t)],[92.75+rs,f.y+(f.r+.6)*Math.sin(t),f.z+(f.r+.6)*Math.cos(t)],.35,0x2a2c30);}
    for(let a=0;a<7;a++){const t=a*Math.PI*2/7;for(let r=1.8;r<=f.r;r+=.4){const tt=t+r*.06;h.put(92.75+rs,f.y+r*Math.sin(tt),f.z+r*Math.cos(tt),0x101113);h.put(92.75+rs,f.y+r*Math.sin(tt+.12),f.z+r*Math.cos(tt+.12),0x101113);}}}
  // air cleaner box in the front left corner on the apron shelf, its cold-air snorkel behind the headlamp, the air-flow meter on its rear face
  if(!o.relocate){h.box(86.5,93,31.5,37.5,-28.25,-19.25,(x,y,z)=>y>35.5?0x232427:DK);for(const x of [88,91.5])h.box(x,x+.5,35,36,-28.75,-28.25,0x8d9298);
    h.box(93,97,32.5,35.5,-24.5,-20.5,DK);
    h.box(81,86.5,32,36.5,-23.5,-19,0x2c2e31);h.box(82.5,85,36.5,37,-22.5,-20,0xa9adb3);}
  else{   // the LS kit: no air box or air-flow meter (the LS meters its air at the throttle body's tube); a cone filter on the right apron shelf, where the washer bottle was
    h.box(85.5,90,31.5,32,20,25.5,DK);h.cyl('y',87.75,22.75,.6,32,33,0x5a5f66);   // bracket on the shelf
    h.cyl('z',87.75,35,1.9,19.5,20.5,0x1b1c1e);for(let z=20.5;z<=25;z+=.5){const r=2.6-(z-20.5)*.18;h.cyl('z',87.75,35,r,z,z+.5,(Math.round(z*2)%2)?0xa3201c:0x8e1b18);}h.cyl('z',87.75,35,1.6,25,25.5,0x1b1c1e);}
  // brake booster on the left of the firewall above the column's exit, master cylinder with its fluid reservoir forward of it
  {const mc=o.relocate?50.75:53.25,rb=o.relocate?[48.75,50.5]:[49,52.5];   // the LS kit's short-body master cylinder: the left cam cover's rear corner sits where a stock one ends (DESIGN)
   h.cyl('x',35,-13,5.25,43.75,48.25,DK);h.cyl('x',35,-13,1.4,48.25,mc,0x7a7f86);h.box(rb[0],rb[1],36.5,38.5,-14.5,-11.5,0xd8d4c4);h.cyl('y',(rb[0]+rb[1])/2,-13,.8,38.5,39.25,0x111214);}
  // fuse and relay box on the left apron shelf behind the strut tower
  h.box(51.5,57,31.5,35.5,-27.5,-21.75,(x,y,z)=>y>34.6?0x202124:0x16171a);
  // washer bottle on the right apron shelf (moved to the trunk with the battery by the LS kit)
  if(!o.relocate){h.box(84,92,31.5,37.5,21.5,27.75,0x9bb7c9);h.cyl('y',86,24.5,.9,37,38,0x111214);}
  // steering: the column leaves the firewall below the booster; universal joint, intermediate shaft with its flexible disc, the rack's pinion housing
  {const W=E30_RIG.cp.wheel,n=W.n,t=(43.5-W.x)/n[0],ex=[43.5,W.y+n[1]*t,W.z];   // the column's axis where it meets the firewall
   // the LS kit (relocate) moves the flexible disc 50 mm forward and down the shaft: the left header's flange would stand on the stock one (as LS swap kits ship a
   // steering shaft for their headers)
   const RK=F.rack,pin=[AX_F+RK.dx,RK.y+2.4,-11.5],u=[46.5,ex[1]-1.2,ex[2]+.4],gd=o.relocate?[59.5,15.5,-14.5]:[57,16.5,-15.25];
   h.seg(ex,u,.75,0x8d9298);h.cyl('x',u[1],u[2],1.1,u[0]-.6,u[0]+.6,0x5a5f66);h.seg(u,gd,.75,0x8d9298);h.seg(gd,gd,1.6,0x111214);
   h.seg(gd,pin,.75,0x8d9298);h.cyl('y',pin[0],pin[2],1.5,RK.y+1.25,pin[1],0x5a5f66);}
  return h.grid();
}

/* ---- under the body: front axle carrier with the lower arms' front pivots, the arms' rear bushing brackets under the rails, the rack housing and its mounts;
   rear sub-frame (arched over the driveshaft) with the semi-trailing arms' pivots, its rubber mounts, the final drive's front mounting arms; the fuel tank's
   lower shell under the rear floor on the right (DESIGN) ---- */
function genUnderE30(solid){const h=HC(),F=E30_SUSP.front,R=E30_SUSP.rear,C=F.carrier,D=0x2a2c30,D2=0x3a3d42,RB=0x111214;
  h.box(C.x0,C.x1,C.y0,C.y1,-C.z+3.5,C.z-3.5,(x,y,z)=>(Math.abs(x-(C.x0+C.x1)/2)<.8&&Math.abs(y-(C.y0+C.y1)/2)<.8&&Math.abs(Math.abs(z)-8)<1.6)?-1:D);   // the beam with two lightening holes
  for(const s of [-1,1]){h.box(C.x0,C.x1,C.y0,F.railY[0]-.25,s*(C.z-3.5),s*C.z,D);                                      // its ends under the frame rails
    const a=F.armF;h.box(a[0]-1,a[0]+1,a[1]-1.25,C.y0,s*(a[2]-1.25),s*(a[2]+1.25),D2);                                    // front pivot ear (the arm's inner ball joint)
    const b=F.armR;h.box(b[0]-1.75,b[0]+1.75,b[1]-1.25,F.railY[0]-.25,s*(b[2]-1.75),s*(b[2]+1.75),D2);h.cyl('x',b[1],s*b[2],.9,b[0]-1.5,b[0]+1.5,RB);}   // rear bushing bracket on the rail
  const RK=F.rack,rx=AX_F+RK.dx;h.cyl('z',rx,RK.y,1.35,-RK.half+2.5,RK.half-2.5,0x666b72);for(const s of [-1,1])h.cyl('z',rx,RK.y,1.8,s*(RK.half-2.5),s*RK.half,RB);   // rack housing and its boots
  for(const z of [-7,7])h.box(rx+.5,C.x0,RK.y-.75,RK.y+.75,z-.75,z+.75,D);                                                // its clamps to the carrier
  // rear sub-frame: the beam, arched over the driveshaft; pivot ears; rubber mounts up to the body
  const S=R.sub,yb=S.y,arch=z=>Math.abs(z)<7.75?S.arch:0;   // stepped up inside the tunnel over the driveshaft and the exhaust, under the floor outside it
  for(let k=Math.round(-S.z*2);k<=Math.round(S.z*2);k++){const z=k/2,dy=arch(z);h.box(S.x0,S.x1,yb+dy,yb+2+dy,z,z,D);if(Math.abs(Math.abs(z)-7.75)<.01)h.box(S.x0,S.x1,yb+2,yb+S.arch,z,z,D);}
  for(const s of [-1,1]){for(const p of [R.pivI,R.pivO]){h.box(p[0]-1.5,p[0]+1.5,p[1]-1.5,p[1]+1.5,s*(p[2]-1.25),s*(p[2]+1.25),D2);h.cyl('z',p[0],p[1],.75,s*p[2]-1.75,s*p[2]+1.75,RB);}   // pivot housings with the bushes' bolts (along the pivot axis, nearly across the car)
    h.box(S.x0-5,S.x0,yb+S.arch-2.5,yb+S.arch-1,s*3.5,s*5,D2);}                                                                         // final-drive front arms
  if(solid){const posts=[];for(const s of [-1,1])posts.push({x:(S.x0+S.x1)/2,z:s*(S.z-4),y0:yb+2.25,yMax:yb+14,hw:2,hd:2,col:RB});const P=genPosts(posts,solid,RB);for(const [i,j,k,c] of P.list())h.cells.push([i,j,k,c]);}
  // fuel tank's lower shell under the rear floor, right of the driveshaft, with its two straps
  h.box(-40.5,-26,9.5,11.25,9.5,21,0x2f3237);for(const x of [-37,-29.5])h.box(x,x+.5,9.25,9.5,9.5,21,0x8d9298);
  return h.grid();
}

/* ---- final drive (Type 188 small case), body frame, absolute cells: carrier round the crown wheel, finned rear cover, pinion nose with the input flange,
   output flanges, the rear mount to the body ---- */
function genDiffE30(){const h=HC(),x0=AX_R,y0=WR,ALU=0x7d8288,CI=0x5c6168;
  h.cyl('z',x0+.5,y0,5.6,-5.5,5.5,(u,d)=>CI);                                                                        // carrier (cast iron)
  h.cyl('x',y0,0,6,x0-4.5,x0-3,(u,d)=>(d>4.5&&Math.round(d*2)%2===0)?0x6b7076:ALU);                                   // cover with its fins
  for(let k=-8;k<=8;k+=2)h.box(x0-5,x0-4.5,y0-5,y0+5,k/2,k/2,ALU);
  h.cyl('x',y0-1.25,0,3.2,x0+4,x0+7,CI);h.cyl('x',y0-1.25,0,2.4,x0+7,x0+8,0x8d9298);                                 // pinion nose, input flange
  for(const s of [-1,1])h.cyl('z',x0,y0,2,s*5.5,s*6.75,0x8d9298);                                                     // output flanges
  h.box(x0-4.5,x0-2,y0+5.5,22.25,-1.25,1.25,0x2a2c30);h.box(x0-4,x0-2.5,21.75,22.25,-3,3,0x111214);                  // rear mount to the body
  return h.grid();
}

/* ---- local parts drawn along +z from 0 to n (10 mm cells) and placed with segTo(mesh,p0,p1,zAxis,n,.5) ----
   driveshaft half: tube with a flexible disc (front) or a universal joint (rear) at its forward end and the centre bearing's yoke at the other */
function genShaftE30(n,front){const g=new Grid(-8,8,-8,8,0,n);
  g.fill((x,y,z)=>{const r=Math.hypot(x,y);
    if(front&&z<=2)return r<=6.5?(r<=2?0x8d9298:0x15161a):-1;                                                          // flexible disc ("guibo")
    if(!front&&z<=3)return r<=3.6?0x7a7f86:-1;                                                                           // universal joint and flange
    if(front&&z>=n-3)return r<=3.6?0x7a7f86:-1;                                                                          // slip yoke into the centre bearing
    if(!front&&z>=n-2)return r<=3.8?0x7a7f86:-1;                                                                         // flange at the final drive
    return r<=3.1?((z%14<1)?0x5c6168:0x30343a):-1;});
  return g;}
function genHalfShaftE30(n){const g=new Grid(-3,3,-3,3,0,n);g.fill((x,y,z)=>{const r=Math.hypot(x,y);if(z<=5||z>=n-5){const t=z<=5?z:n-z;return r<=Math.min(2.6,1.4+t*.3)?0x15161a:-1;}return r<=1.2?0x8d9298:-1;});return g;}
// the driveshaft's centre bearing in its rubber cradle, and the bracket up to the tunnel's roof (absolute cells)
function genCentreBearingE30(p,solid){const h=HC();h.cyl('x',p[1],p[2],2.6,p[0]-1,p[0]+1,0x15161a,1.65);
  const posts=[{x:p[0],z:-3.25,y0:p[1],yMax:p[1]+10,hw:1,hd:0},{x:p[0],z:3.25,y0:p[1],yMax:p[1]+10,hw:1,hd:0}],P=genPosts(posts,solid,0x2a2c30);for(const [i,j,k,c] of P.list())h.cells.push([i,j,k,c]);
  return h.grid();}
if(typeof module!=='undefined')module.exports={HC,genBayE30,genUnderE30,genDiffE30,genShaftE30,genHalfShaftE30,genCentreBearingE30};
