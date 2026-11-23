/* ===== GENERIC RIG BUILDERS: everything inside and under a shell that is not body panels, driven by the shell geometry g (makeShell) and a parameter block R (one per car).
   Same construction as the approved E30 parts, parametrised: cabin and dash, seats, rear bench, dash detail, engine bay, transverse engine and transaxle, half-shafts, exhaust, aero.
   World units: 1 unit = 20 mm. Grids named "(10 mm)" use half-unit cells and are drawn at mesh scale .5; the rest are 20 mm cells. ===== */
function makeRig(g,R){
  const {NOSE_X,REAR_X,AX_F,AX_R,WR,BELT,ROOF,halfAt,topY,u,wx}=g,cp=R.cp,rig={cp,R,g},SD=cp.side||-1,zs=(a,b)=>SD<0?[a,b]:[-b,-a];   // SD: driver side (-1 left-hand drive, +1 right-hand drive); zs mirrors a driver-side z range
  const tb=Math.tan(cp.back*Math.PI/180),tr=Math.tan(cp.rearBack*Math.PI/180);
  const D=R.dash,CT=R.console;

  /* ---- cabin: floor, tunnel console, dash, binnacle, centre stack, steering column, cargo floor (20 mm) ---- */
  rig.interior=function(){
    const X0=Math.floor(REAR_X+2),X1=Math.ceil(D.cowlX),G=new Grid(X0,X1,8,Math.ceil(ROOF-2),-40,40),fy=R.floorY,fyAt=x=>R.floorAt?R.floorAt(x):fy;   // floorAt: carpet height along the car (a raised rear floor)
    const zl=x=>Math.floor(R.floorHalf?R.floorHalf(x,fyAt(x)+2):halfAt(x,fy+2)-6);                                                      // floorHalf: keeps the carpet out of the wheelhouses
    for(let x=Math.ceil(R.cargo.frontX);x<=X1-1;x++)for(const sd of [-1,1])box(G,x,x,fyAt(x),fyAt(x)+1,sd*(R.carpetIn||9),sd*zl(x),COL.carpet);                // cabin floor (the tunnel is part of the body)
    if(R.cargo&&!R.cargo.hi){const c=R.cargo;for(let x=Math.ceil(c.rearX);x<=Math.floor(c.frontX);x++)box(G,x,x,c.floorY,c.floorY,-Math.floor(c.half-1.5),Math.floor(c.half-1.5),COL.carpet);   // load floor of the hatch bay
      for(const sd of [-1,1])for(let x=Math.ceil(c.rearX);x<=Math.floor(c.frontX);x++)for(let y=c.floorY+1;y<=c.floorY+9;y++)G.set(x,y,sd*Math.floor(c.half-1.5),0x2a2b2f);}   // side trims
    // tunnel console: low rear section with the handbrake, shift console, ramp up to the centre stack
    box(G,CT.rearX,CT.shiftX0,CT.y0||fy+1,CT.top-3,-5,5,0x2a2b2f);
    box(G,CT.shiftX0,CT.shiftX1,CT.y0||fy+1,CT.top,-5.5,5.5,0x2a2b2f);
    for(let x=CT.shiftX1+1;x<=D.rearX+2;x++)for(let y=CT.top;y<=D.bot+1;y++)if(x>=CT.shiftX1+1+(y-CT.top)*1.1)for(let z=-6;z<=6;z++)G.set(x,y,z,0x2a2b2f);
    // dashboard: a thin pad that falls to the cowl, ends stop inboard of the door cards
    G.fill((x,y,z)=>{
      if(x<D.rearX||x>D.cowlX||Math.abs(z)>D.halfZ)return -1;
      const top=D.top-(x-D.rearX)*D.slope-(x>D.cowlX-3?(x-(D.cowlX-3))*.6:0);
      if(y>top||y<D.bot)return -1;
      return x>=D.cowlX-8?0x1c1d20:COL.dash;});
    // kick panels and the firewall's carpeted face under the dash
    for(const sd of [-1,1])box(G,D.cowlX-2,D.cowlX,fy+1,D.bot,sd*(R.carpetIn||9),sd*Math.min(zl(D.cowlX),zl(D.cowlX-2)),COL.carpet);
    box(G,D.cowlX-2,D.cowlX,R.kickY0||CT.y0||fy+1,D.bot,-9,9,0x2a2b2f);   // R.kickY0: where a bellhousing hump stands under it
    // instrument binnacle on the driver's centreline: a hooded pod standing proud of the dash top
    box(G,D.rearX-1,D.rearX+5,D.top-1,D.top+4,...zs(-30,-11),0x1d1e21);box(G,D.rearX+1,D.rearX+5,D.top+4,D.top+5,...zs(-29,-12),0x1d1e21);
    // centre stack
    box(G,D.rearX,D.rearX+6,CT.top,D.top-.5,-8,8,0x30333a);
    // steering column from the hub into the dash, along the wheel axis
    {const w=cp.wheel,n=w.n,l=Math.hypot(...n),c0=R.columnGap||1.6;segFill(G,[w.x-n[0]/l*c0,w.y-n[1]/l*c0,w.z],[w.x-n[0]/l*14,w.y-n[1]/l*14,w.z],1.5,COL.dash);}   // column shroud starts columnGap behind the wheel's centre
    return G;
  };
  rig.dashDetailPos=[.25,.25,.25];
  /* ---- dash and console detail (10 mm), laid out like the E30's: vents, heater sliders, radio, ashtray, glovebox, light switch, end vents; shift boot, window switches, handbrake. ---- */
  rig.dashDetail=function(){
    const G=new Grid(-60,110,40,100,-70,70),put=(x0,x1,y0,y1,z0,z1,c)=>{for(let i=Math.round(x0*2);i<Math.round(x1*2);i++)for(let j=Math.round(y0*2);j<Math.round(y1*2);j++)for(let k=Math.round(z0*2);k<Math.round(z1*2);k++)G.set(i,j,k,c);};
    const FACE=D.rearX-.5,F0=FACE-.5,yT=D.top-.7;   // stack face plane; detail one layer proud of it
    for(const zs of [[-7,-.5],[.5,7]]){put(F0,FACE,yT-2,yT,zs[0],zs[1],0x0e0f11);for(let y=yT-1.5;y<yT;y+=1)put(F0-.5,F0,y,y+.5,zs[0]+.5,zs[1]-.5,0x3a3c41);}      // centre vents with slats
    put(F0,FACE,yT-5.5,yT-3,-5,5,0x18191c);                                                                                                        // heater panel
    [[yT-3.6,-1.5],[yT-4.4,.5],[yT-5.2,-3]].forEach(([y,k])=>{put(F0-.5,F0,y,y+.5,-4,2,0x050506);put(F0-1,F0-.5,y,y+.5,k,k+.5,0xe8e8e8);});
    put(F0-1,F0,yT-4.8,yT-3.8,3,4,0xb9bec5);
    put(F0,FACE,yT-9,yT-6.5,-4.5,4.5,0x101113);put(F0-.5,F0,yT-7,yT-6.5,-2,2,0xd08a2a);                                                           // DIN radio (180 x 50 mm), amber display
    for(const z of [-4,3.5])put(F0-1,F0,yT-7.5,yT-6.5,z,z+.5,0xb9bec5);for(let z=-2;z<2;z+=1)put(F0-.5,F0,yT-8,yT-7.5,z,z+.5,0x6a6e75);
    put(F0,FACE,yT-10.5,yT-9.5,-4,4,0x1d1e21);put(F0-.5,F0,yT-10,yT-9.5,-3.5,3.5,0xaab0b8);                                                       // ashtray
    // glovebox lid on the passenger side, seam and latch
    put(FACE-.5,FACE,D.bot+.5,yT-1.5,...zs(-28,-10).map(v=>-v).sort((a,b)=>a-b),0x2b2c30);for(const [y0,y1,z0,z1] of [[D.bot+.5,D.bot+1,10,28],[yT-2,yT-1.5,10,28],[D.bot+.5,yT-1.5,10,10.5],[D.bot+.5,yT-1.5,27.5,28]])put(FACE-.5,FACE,y0,y1,...(SD<0?[z0,z1]:[-z1,-z0]),0x141517);
    put(FACE-1,FACE-.5,yT-3.5,yT-3,...(SD<0?[17,19]:[-19,-17]),0xc2c7cd);
    put(FACE-1,FACE,yT-1.5,yT-.5,...zs(-31.5,-30.5),0x1a1b1d);                                                                                                // light switch
    for(const zc of [-30.5,30.5]){for(let y=yT-3.8;y<yT-.8;y+=.5)for(let z=zc-1.5;z<zc+1.5;z+=.5)if(Math.hypot(y+.25-(yT-2.3),z+.25-zc)<=1.5)put(FACE-.5,FACE,y,y+.5,z,z+.5,(Math.round(y*2)%2)?0x0e0f11:0x3a3c41);}   // round end vents
    // console: shift boot (bezel + tapered boot), window switches, handbrake
    const sx=cp.shifter.x,ct=CT.top+.5;   // on the console's top surface (its 20 mm cells end half a unit above CT.top)
    for(const [x0,x1,z0,z1] of [[sx-3.5,sx+3,-3.5,-3],[sx-3.5,sx+3,3,3.5],[sx-3.5,sx-3,-3.5,3.5],[sx+2.5,sx+3,-3.5,3.5]])put(x0,x1,ct,ct+.5,z0,z1,0x3a3c41);
    for(let y=ct;y<ct+2.5;y+=.5){const r=2.6-(y-ct)*.65;for(let x=sx-r;x<sx+r;x+=.5)for(let z=-r;z<r;z+=.5)if(Math.hypot(x+.25-sx,z+.25)<=r)put(x,x+.5,y,y+.5,z,z+.5,(y===ct&&Math.hypot(x+.25-sx,z+.25)>r-.6)?0x101112:0x18191b);}
    for(const z of [-2.5,1.5])put(sx-7,sx-5,ct,ct+.5,z,z+1,0x0d0e10);
    put(CT.rearX+1,CT.shiftX0-3,CT.top-2.5,CT.top-2,-1,1,0x0b0c0d);   // handbrake slot on the rear console's top surface
    for(let t=0;t<=1;t+=.04){const x=CT.shiftX0-3-12*t,y=CT.top-1.5+3*t,r=t>.6?.75:.5;put(x-r,x+r,y-r,y+r,-r,r,t>.6?0x111214:0x1d1e21);}
    return G;
  };
  /* ---- seats: hip point cp.H, back angle cp.back. look: {cush,bol,bolH,back (height of the back above the hip point),hw,head:'post'|'integral'|'none',pad,bucket,slide} ---- */
  rig.seat=function(look,zc){
    const H=cp.H,L=Object.assign({cush:0x2d2f34,bol:0x3a3d44,bolH:1.2,back:22,hw:9.5,head:'post',pad:0x3a3d44,slide:0},look||{});
    const g=new Grid(Math.round(H.x-26),Math.round(H.x+26),Math.floor(R.floorY),Math.round(H.y+L.back+14),Math.round(zc-14),Math.round(zc+14));   // integer bounds (floorY may be fractional)
    const hw=L.hw,ySurf=Math.round(H.y-4),x0=H.x-6,x1=H.x+18+L.slide,fl=R.floorY+1;
    for(let x=Math.round(x0-2);x<=Math.round(x1-4);x++)for(const s of [-1,1])g.set(x,fl,Math.round(zc+s*(hw-3)),0x8d9298);                       // floor rails
    box(g,x0-1,x1-5,fl+1,ySurf-4,zc-(hw-2.5),zc+(hw-2.5),0x1b1c1f);                                                                           // base
    for(let x=Math.round(x0);x<=Math.round(x1);x++){const top=ySurf+(x-x0)/(x1-x0)*1.5;for(let z=Math.round(zc-hw);z<=Math.round(zc+hw);z++){const edge=Math.abs(z-zc)>hw-1.8;
      for(let y=ySurf-3;y<=Math.round(top+(edge?L.bolH:0));y++)g.set(x,y,z,edge?L.bol:L.cush);}}
    const topB=Math.round(H.y+L.back);
    for(let y=ySurf-3;y<=topB;y++){const xf=Math.round(H.x-5-(y-ySurf)*tb),tp=L.bucket&&y>topB-6;   // a bucket's shoulders taper over its top 120 mm (and stay a cell inside the side glass either side)
      for(let x=xf-3;x<=xf;x++)for(let z=tp?Math.ceil(zc-hw+.5):Math.round(zc-hw);z<=(tp?Math.floor(zc+hw-.5):Math.round(zc+hw));z++){
      const edge=Math.abs(z-zc)>hw-2&&y<topB-8;if(edge&&x===xf&&y<topB-10)g.set(x+1,y,z,L.bol);g.set(x,y,z,edge?L.bol:(L.bucket&&y>topB-3?0x15161a:L.cush));}}
    if(L.bucket){for(let y=ySurf+8;y<=topB-2;y++)for(const sd of [-1,1])g.set(Math.round(H.x-5-(y-ySurf)*tb)-1,y,Math.round(zc+sd*(hw-.5)),0x9aa0a8);
      for(let z=Math.round(zc-3);z<=Math.round(zc+3);z++)for(let y=topB+1;y<=topB+4&&y<=g.y1;y++)g.set(Math.round(H.x-5-(y-ySurf)*tb)+1,y,z,0x0b0c0e);}   // the harness loop's frame, on the shell's top
    else if(L.head==='post'){for(let y=topB+1;y<=topB+2;y++)for(const sd of [-1,1])g.set(Math.round(H.x-6.5-(y-ySurf)*tb),y,Math.round(zc+sd*3),0x8d9298);
      for(let y=topB+3;y<=Math.min(topB+9,g.y1);y++){const xf=Math.round(H.x-6-(y-ySurf)*tb);for(let x=xf-3;x<=xf;x++)for(let z=Math.round(zc-5.5);z<=Math.round(zc+5.5);z++)g.set(x,y,z,L.pad);}}
    else if(L.head==='integral'){for(let y=topB+1;y<=Math.min(topB+9,g.y1);y++){const xf=Math.round(H.x-5-(y-ySurf)*tb),w=Math.round(hw-2.5-(y-topB)*.1);for(let x=xf-3;x<=xf;x++)for(let z=Math.round(zc-w);z<=Math.round(zc+w);z++)g.set(x,y,z,y>=topB+3&&y<=topB+7&&Math.abs(z-zc)<=2&&x===xf-3?0x0b0c0e:L.cush);}}
    return g;
  };
  /* ---- rear bench around cp.rearH, trimmed one cell clear of the body ---- */
  rig.rearBench=function(body){
    const H=cp.rearH,fyR=R.floorAt?R.floorAt(H.x):R.floorY,g=new Grid(Math.round(H.x-26),Math.round(H.x+20),Math.floor(fyR),Math.round(H.y+28),-34,34),x0=H.x-6,x1=H.x+15,ySurf=Math.round(H.y-4),fl=fyR+1;
    if(ySurf-4>=Math.ceil(fl))for(const sd of [-1,1])box(g,x0-1,x1-4,fl,ySurf-4,sd*11,sd*27,0x1b1c1f);   // cushion frame on the floor (none when the floor is raised up to the cushion)
    for(let x=Math.round(x0);x<=Math.round(x1);x++)for(const zc of [-18,0,18])for(let z=zc-9;z<=zc+9;z++){const top=ySurf+(x-x0)/(x1-x0)*1.2;for(let y=ySurf-3;y<=Math.round(top);y++)g.set(x,y,z,Math.abs(z-zc)>7.5?0x3a3d44:0x2d2f34);}
    for(let y=ySurf-3;y<=Math.round(H.y+22);y++){const xf=Math.round(H.x-6-(y-ySurf)*tr);for(let x=xf-3;x<=xf;x++)for(let z=-27;z<=27;z++)g.set(x,y,z,(Math.abs(z)%18>15||Math.abs(z)%18<2)&&y<H.y+16?0x3a3d44:0x2d2f34);}
    if(body)for(const [x,y,z] of g.list()){let near=false;for(let dx=-1;dx<=1&&!near;dx++)for(let dy=-1;dy<=1&&!near;dy++)for(let dz=-1;dz<=1&&!near;dz++)if(body.get(x+dx,y+dy,z+dz)>=0)near=true;if(near)g.set(x,y,z,-1);}
    return g;
  };

  /* ---- engine bay furniture (20 mm): radiator and its support, fan, battery, air box, damper towers, brake booster, reservoirs, fuse box ---- */
  rig.bay=function(o){
    o=o||{};const B=R.bay,rs=o.radShift||0,G=new Grid(Math.floor(B.x0),Math.ceil(B.x1),10,Math.ceil(B.top+1),-30,30);
    box(G,B.radX+rs,B.radX+rs+1,15,B.top-6,-23,23,0x2a2d31);                                                          // radiator core
    for(let z=-23;z<=23;z+=2)box(G,B.radX+rs+2,B.radX+rs+2,16,B.top-7,z,z,0x4b5057);
    if(!rs)box(G,B.radX+3,B.radX+4,13,B.top-5,-26,26,0x16171a);box(G,B.radX+3,B.radX+4,B.top-5,B.top-4,-26,26,0x16171a);   // radiator support and slam panel
    {const F=B.fan||{y:22,z:-4,r:9};box(G,B.radX-3,B.radX-1,17,B.top-8,-21,21,0x1a1b1d);for(let x=B.radX-3;x<=B.radX-1;x++)for(let y=Math.floor(F.y-F.r);y<=Math.ceil(F.y+F.r);y++)for(let z=Math.floor(F.z-F.r);z<=Math.ceil(F.z+F.r);z++)if(Math.hypot(y-F.y,z-F.z)<F.r)G.set(x,y,z,-1);
     cylX(G,F.y,F.z,F.r+1,B.radX-4,B.radX-1,0x2a2c30,F.r);
     cylX(G,F.y,F.z,2.2,B.radX-5,B.radX-4,0x1b1c1e);for(const a of [Math.PI/2,Math.PI*7/6,Math.PI*11/6])segFill(G,[B.radX-5,F.y+2*Math.sin(a),F.z+2*Math.cos(a)],[B.radX-5,F.y+(F.r+.5)*Math.sin(a),F.z+(F.r+.5)*Math.cos(a)],.5,0x1b1c1e);}   // the fan motor behind the hub on three struts to the ring                                                       // fan shroud: a panel with a round opening and a ring around the fan (the fan turns inside the opening)
    const az=B.airZ||-1;   // side of the air box (+1 right); the battery goes to the other side
    const BT=B.battery||{x0:B.batX,x1:B.batX+7,y0:13,y1:20,z0:14,z1:23},AB=B.airbox||{x0:B.radX-14,x1:B.radX-5,y0:19,y1:B.top-3,z0:15,z1:25,inlet:true};
    if(!o.relocate){box(G,BT.x0,BT.x1,BT.y0,BT.y1,-az*BT.z0,-az*BT.z1,0x15161a);if(B.batTray){const T=B.batTray;box(G,BT.x0-.5,BT.x1+.5,BT.y0-1,BT.y0-1,-az*(BT.z0-.5),-az*T.outZ,0x2a2c30);const bx=Math.round((BT.x0+BT.x1)/2);box(G,bx-1,bx+1,BT.y0-1,BT.y1-2,-az*(BT.z1+.5),-az*T.outZ,0x2a2c30);}   // tray and its bracket to the inner fender
     box(G,BT.x0+1,BT.x0+2,BT.y1,BT.y1+1,-az*(BT.z0+1),-az*(BT.z0+2),COL.red);box(G,BT.x1-2,BT.x1-1,BT.y1,BT.y1+1,-az*(BT.z0+1),-az*(BT.z0+2),COL.black);}
    box(G,AB.x0,AB.x1,AB.y0,AB.y1,az*AB.z0,az*AB.z1,0x1c1d20);if(AB.inlet)box(G,B.radX-6,B.radX-1,21,25,az*20,az*24,0x1c1d20);     // air box and its inlet
    if(B.towers!==false)for(const s of [-1,1]){box(G,AX_F-5.5,AX_F+5.5,12,B.towerTop,s*22,s*27,0x34363b);box(G,AX_F-2,AX_F+2,B.towerTop,B.towerTop+1,s*23,s*25.5,COL.chrome);}   // damper towers
    if(B.rails!==false)for(const s of [-1,1])box(G,B.x0+8,B.radX-6,12,15,s*15,s*18,0x232529);                                            // frame rails
    const fw=B.fwX!==undefined?B.fwX:B.x0+1;   // the firewall's face: the booster, the reservoir and the fuse box stand on it
    {const bz=SD*(B.boosterZ||17),br=B.boosterR||4.2;cylX(G,B.top-6,bz,br,fw,B.x0+4,0x1b1c1e);cylX(G,B.top-6,bz,2,B.x0+4,B.x0+(B.mcLen||9),0x7a7f86);}   // brake booster and master cylinder on the driver's side
    {const RS=B.res||{z0:10,z1:14};box(G,fw,B.x0+5,B.top-4,B.top-1,-az*RS.z0,-az*RS.z1,0xc9a43a);}                                                      // coolant / washer reservoir
    {const F=B.fuse||{z0:az*19,z1:az*25};box(G,fw,B.x0+6,B.top-8,B.top-4,F.z0,F.z1,0x15161a);}                       // fuse box
    return G;
  };
  /* ---- subframe cross-member and steering rack (20 mm) ---- */
  rig.rack=function(){const hz=R.rackHalf||20,k=new Grid(-3,3,-3,3,-hz,hz),rr=R.rackR||2.2;k.fill((x,y,z)=>Math.hypot(x,y)<=rr?0x666b72:-1);return k;};
  rig.crashBar=function(sg,cIn){   // cIn: the bar's inner cell when the car module measured where its body ends (the bar bolts flat against it); otherwise the generic place with brackets
    if(cIn!==undefined){const x0=sg>0?cIn:cIn-1,G=new Grid(x0-1,x0+2,12,24,-36,36);box(G,x0,x0+1,(R.crash&&R.crash.y0)||15,(R.crash&&R.crash.y1)||21,-(R.crash&&R.crash.half||33),(R.crash&&R.crash.half||33),0x3a3d42);return G;}
    const x0=sg>0?NOSE_X-3:REAR_X+1;const G=new Grid(Math.floor(Math.min(x0,x0+2))-1,Math.ceil(Math.max(x0,x0+2))+1,12,24,-36,36);
    box(G,x0,x0+2,(R.crash&&R.crash.y0)||15,(R.crash&&R.crash.y1)||21,-33,33,0x3a3d42);
    for(const s of [-1,1])box(G,x0-sg*2,x0,(R.crash&&R.crash.y0)||15,(R.crash&&R.crash.y1)||21,s*20,s*22,0x2a2c30);return G;};

  /* ---- transverse engine (10 mm cells). Local frame: x forward, y up from the pan bottom, z across with the belt end at +z; origin at the crank line's centre.
         dims from the engine record: len (front-to-back), wid (across), hgt, pan (pan depth below the crank line). ---- */
  rig.engine=function(e){
    const C=Object.assign({cover:0x1b1c1f,block:0x7d8289,head:0x8c9298,intake:0x25272b,vtec:0},e.colors||{});
    const Wc=e.wid/10,Dc=e.len/10,Hc=e.hgt/10,pc=e.pan/10,hb=(Hc-pc)*.44,hh=(Hc-pc)*.30,ch=Math.max(5,(Hc-pc)*.13);
    const G=new Grid(-Math.ceil(Dc*.75),Math.ceil(Dc*.75),0,Math.ceil(Hc+8),-Math.ceil(Wc*.62),Math.ceil(Wc*.62));
    const yB=Math.round(pc),yH=Math.round(pc+hb),yC=Math.round(pc+hb+hh),yT=Math.round(pc+hb+hh+ch);
    const zb0=-Wc*.40,zb1=Wc*.40;                                                                                  // block runs between the flywheel end (-z) and the belt end (+z)
    box(G,-Dc*.26,Dc*.22,0,yB,zb0*.85,zb1*.80,0x4a4f55);                                                          // oil pan
    box(G,-Dc*.30,-Dc*.24,2,yB-2,zb0*.5,zb1*.4,0x4a4f55);                                                         // pan sump well (inside the block's footprint)
    box(G,-Dc*.32,Dc*.32,yB,yH,zb0,zb1,C.block);                                                                   // block
    for(let i=1;i<4;i++){const z=zb0+(zb1-zb0)*i/4;box(G,Dc*.32,Dc*.32,yB+1,yH-1,z,z,0x5c6168);}                   // bore-pitch ribs
    box(G,-Dc*.30,Dc*.30,yH,yC,zb0+1,zb1-1,C.head);                                                                // head
    box(G,-Dc*.23,Dc*.23,yC,yT,zb0+3,zb1-3,C.cover);                                                               // cam cover
    for(let z=Math.ceil(zb0+5);z<=zb1-5;z+=4)box(G,-Dc*.2,Dc*.2,yT,yT,z,z,0x3a3d42);                              // cover ribs
    if(C.vtec)box(G,-Dc*.1,Dc*.1,yT,yT+1,(zb0+zb1)/2-7,(zb0+zb1)/2+7,0xc2202a);                                    // VTEC badge plate
    box(G,-Dc*.30,Dc*.30,yB-1,yC+1,zb1,zb1+3,0x16171a);                                                           // timing belt cover (belt end), one plate over the cam and crank sprockets
    // intake side (toward the firewall): four runners rising from the head to the plenum, throttle body
    const xr=-Dc*.30,n=4;
    for(let i=0;i<n;i++){const z=zb0+4+(zb1-zb0-8)*(i+.5)/n;segFill(G,[xr,yH+hh*.5,z],[xr-Dc*.1,yH+hh*.9,z],2.1,C.intake);segFill(G,[xr-Dc*.1,yH+hh*.9,z],[xr-Dc*.2,yC+ch*.6,z],2.1,C.intake);}
    box(G,-Dc*.46,-Dc*.30,yC,yC+Math.round(ch*.9),zb0+4,zb1-5,C.intake);cylZ(G,-Dc*.40,yC+ch*.5,2.6,zb0,zb0+5,0x6a6e75);   // plenum; throttle body at the flywheel end (Honda B and K series)
    // exhaust side (toward the radiator): header runners into a collector, downpipe
    for(let i=0;i<n;i++){const z=zb0+4+(zb1-zb0-8)*(i+.5)/n;segFill(G,[Dc*.30,yH+hh*.25,z],[Dc*.38,yH-1,z],1.7,COL.cast);segFill(G,[Dc*.38,yH-1,z],[Dc*.42,yB,(zb0+zb1)/2],1.7,COL.cast);}
    segFill(G,[Dc*.42,yB,(zb0+zb1)/2],[Dc*.44,2,(zb0+zb1)/2],2.6,COL.cast);
    cylY(G,-Dc*.05,zb0+3,3,yH-3,yH+3,0x2b2c30);                                                                    // distributor / sensor
    // flywheel-end: the transaxle bolts here; belt-end: crank, water pump and accessory pulleys are drawn separately
    const M=new Grid(-G.x1,-G.x0,G.y0,G.y1,G.z0,G.z1);for(const [x,y,z,c] of G.list())M.set(-x,y,z,c);   // mirrored: intake runners and plenum face forward (radiator side), header and collector face the firewall, as on the Honda front-drive engines
    // connection points (engine-local 10 mm cells, after the mirror: +x = radiator side): throttle body mouth, thermostat outlet, water inlet, downpipe end, block faces
    const pts={tb:[Dc*.40,yC+ch*.5,zb0-.5],thermo:[Dc*.31,yH+1,zb0+1.5],waterIn:[Dc*.33,yB+2,zb0+2],downpipe:[-Dc*.44,2,(zb0+zb1)/2],blockFront:Dc*.32,blockRear:-Dc*.32,yB,yH,ch};
    return {grid:M,pan:e.pan,hgt:e.hgt,wid:e.wid,len:e.len,zBelt:zb1+3,zFly:zb0,crankY:pc,yTop:yT,Dc,Wc,pc,yH,yC,pts};
  };
  /* ---- transaxle (10 mm): clutch bell, gear case with the shift tower, output flange. Local frame as the engine, case extends toward -z from the engine's flywheel face. ---- */
  rig.transaxle=function(t,eng){
    const A=t.across/10,Dc=eng.len/10*1.05,cy=eng.crankY,bellR=Math.min(Dc*.40,(t.bellR||145)/10),caseW=Math.min(Dc*.46,(t.caseHalf||175)/10),caseH=Math.min(Dc*.34,bellR*.85),y0=Math.floor(cy-bellR)-1;   // bell sized by the clutch (145 mm radius for a 225 mm clutch, DESIGN), not the engine
    const G=new Grid(-Math.ceil(Dc*.7),Math.ceil(Dc*.7),y0,Math.ceil(cy+Dc*.7),-Math.ceil(A+4),4);
    for(let z=-Math.round(A*.30);z<=0;z++)for(let x=-Math.ceil(bellR);x<=Math.ceil(bellR);x++)for(let y=y0;y<G.y1;y++){const d=Math.hypot(x,y-cy);if(d<=bellR)G.set(x,y,z,(z>=-2)?0x6a6e75:0x80868d);}   // clutch bell
    for(let z=-Math.round(A);z<-Math.round(A*.30);z++){const k=(z+A*.30)/(A*.7);for(let x=-Math.ceil(caseW);x<=Math.ceil(caseW);x++)for(let y=y0;y<G.y1;y++){
      const dx=x/caseW,dy=(y-cy)/(caseH*(1-.12*Math.abs(k)));if(Math.pow(Math.abs(dx),3)+Math.pow(Math.abs(dy),3)<=1)G.set(x,y,z,(z<-A+2)?0x6a6e75:(Math.abs(dx)>.8?0x5c6168:0x80868d));}}
    box(G,-3,3,Math.round(cy+caseH*.9),Math.round(cy+caseH*.9)+4,-Math.round(A*.55),-Math.round(A*.55)+5,0x5a5f66);       // shift tower
    cylZ(G,0,cy-caseH*.45,2.3,-Math.round(A)-3,-Math.round(A),0x8d9298);                                              // output flange
    return {grid:G,outY:cy-caseH*.45,outX:0,outZ:-A-3,zEnd:-A};
  };
  rig.crankPulley=function(){const G=new Grid(0,6,-10,10,-10,10);G.fill((x,y,z)=>{const r=Math.hypot(y,z);if(r>8.5)return -1;if(x<=1)return 0x2b2d31;if(x>=2&&x<=4)return r>=6?0x41454b:(r<=3?0x8d9298:-1);return r<=3?0x8d9298:-1;});G.set(2,8,0,COL.white);G.set(2,7,0,COL.white);return G;};
  rig.halfShaft=function(){const k=new Grid(0,0,-2,2,-2,2);return null;};
  return rig;
}
if(typeof module!=='undefined')module.exports={makeRig};
