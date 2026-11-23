/* ===== BODY GENERATOR: any car shell from sourced dimensions plus a side profile. It follows the E30 pipeline step for step
   (solid from side profile x cross-section, arches, panels cut out of the solid, cavities, 2-layer skin, glass, shut lines),
   so every shell gets the same construction quality. All spec lengths are millimetres; x is measured from the front tip rearward, y from the ground.
   World units: 1 unit = 20 mm, x forward, y up, z = the car's right. World x = 0 is the middle of the wheelbase. ===== */
function makeShell(S){
  const g={S};
  const XM=S.axF+S.WB/2,wx=m=>(XM-m)/20,u=m=>m/20;g.wx=wx;g.u=u;
  g.NOSE_X=wx(0);g.REAR_X=wx(S.L);g.AX_F=wx(S.axF);g.AX_R=wx(S.axF+S.WB);g.WR=S.wheelR/20;g.ROCK=S.rock/20;g.BELT=S.belt/20;g.ROOF=S.H/20;
  const NOSE_X=g.NOSE_X,REAR_X=g.REAR_X,AX_F=g.AX_F,AX_R=g.AX_R,WR=g.WR,ROCK=g.ROCK,BELT=g.BELT,ROOF=g.ROOF;
  const TOP=g.TOP=S.top.map(([x,y])=>[wx(x),u(y)]);
  g.halfW=S.W/2/20;
  const topY=g.topY=x=>{for(let i=0;i<TOP.length-1;i++){const a=TOP[i],b=TOP[i+1];if(x<=a[0]&&x>=b[0]){const t=a[0]===b[0]?0:(a[0]-x)/(a[0]-b[0]);return a[1]+(b[1]-a[1])*t;}}return x>NOSE_X?20:40;};
  const P=S.plan;
  const pw=g.pw=x=>{let f=1;
    const ns=NOSE_X-u(P.noseLen);if(x>ns)f-=P.noseDrop*Math.pow(sm(ns,NOSE_X+4.6,x),1.5);
    const ts=REAR_X+u(P.tailLen);if(x<ts)f-=P.tailDrop*Math.pow(sm(ts,REAR_X-2.4,x),1.5);
    f+=P.swell*(Math.exp(-Math.pow((x-AX_F)/13,2))+1.3*Math.exp(-Math.pow((x-AX_R)/13,2)));return f;};
  const halfBase=g.halfBase=(x,y)=>{const h=g.halfW*pw(x);
    if(y<=BELT)return h*(.955+.045*Math.sin(clampv((y-ROCK)/(BELT-ROCK),0,1)*Math.PI/2));
    const t=Math.min(1,(y-BELT)/(ROOF-BELT));let r=h*(1-S.roofNarrow*Math.pow(t,.85));if(y>ROOF-3.5)r-=(y-(ROOF-3.5))*.9;return r;};
  const EDGE_R=g.EDGE_R=1.7,ROCK_R=1.5,ARCH_R=g.ARCH_R=S.archR/20,LIP=.3;
  const halfAt=g.halfAt=(x,y)=>{let r=halfBase(x,y);
    if(x<=NOSE_X&&x>=REAR_X){const dt=topY(x)-y;if(dt>=0&&dt<EDGE_R){const q=EDGE_R-dt;r-=EDGE_R-Math.sqrt(Math.max(0,EDGE_R*EDGE_R-q*q));}}
    if(y>=ROCK&&y<ROCK+ROCK_R){const q=ROCK+ROCK_R-y;r-=ROCK_R-Math.sqrt(Math.max(0,ROCK_R*ROCK_R-q*q));}return r;};
  const NOSE_RC=S.noseRc,REAR_RC=S.tailRc;
  const NOSE_XC=NOSE_X-NOSE_RC,NOSE_ZC=halfAt(NOSE_XC,34)-NOSE_RC,REAR_XC=REAR_X+REAR_RC,REAR_ZC=halfAt(REAR_XC,42)-REAR_RC;
  g.NOSE_XC=NOSE_XC;g.REAR_XC=REAR_XC;g.NOSE_RC=NOSE_RC;g.REAR_RC=REAR_RC;
  g.noseX=az=>az<=NOSE_ZC?NOSE_X:NOSE_XC+Math.sqrt(Math.max(0,NOSE_RC*NOSE_RC-(az-NOSE_ZC)*(az-NOSE_ZC)));
  g.rearX=az=>az<=REAR_ZC?REAR_X:REAR_XC-Math.sqrt(Math.max(0,REAR_RC*REAR_RC-(az-REAR_ZC)*(az-REAR_ZC)));
  g.archLip=(x,y)=>{let l=0;for(const ax of [AX_F,AX_R]){const d=Math.hypot(x-ax,y-WR);if(d>=ARCH_R&&d<ARCH_R+1.8)l=Math.max(l,LIP*(1-(d-ARCH_R)/1.8));}return l;};
  g.profDist=(x,y)=>{let best=1e9;for(let i=0;i<TOP.length-1;i++){const a=TOP[i],b=TOP[i+1],dx=b[0]-a[0],dy=b[1]-a[1],L=dx*dx+dy*dy,t=L?clampv(((x-a[0])*dx+(y-a[1])*dy)/L,0,1):0;best=Math.min(best,Math.hypot(x-(a[0]+dx*t),y-(a[1]+dy*t)));}return best;};
  // lowest point of the body shell along its length (the bumpers hang below the front and rear panels)
  const fpB=u(S.frontPanelBottom),fpX=NOSE_X-u(S.frontPanelLen),tB=u(S.tailPanelBottom),tX=REAR_X+u(S.tailPanelLen);
  g.YBOT=x=>x>fpX?fpB:(x<tX?ROCK+Math.min(1,(tX-x)/(tX-REAR_X))*(tB-ROCK):ROCK);
  // greenhouse lines: the windshield (A-pillar) and rear-window (C-pillar) slopes, read from the side profile
  const seg=(i0,i1)=>{const a=TOP[i0],b=TOP[i1];return y=>a[0]+(b[0]-a[0])*clampv((y-a[1])/(b[1]-a[1]),0,1);};
  g.xA=seg(S.wsSeg[0],S.wsSeg[1]);g.xC=seg(S.rwSeg[0],S.rwSeg[1]);
  g.DOOR_F=wx(S.door.front);g.DOOR_R=wx(S.door.rear);
  return g;
}

/* ---- build the panels for a shell ---- */
function buildBodyGen(g){
  const S=g.S,{NOSE_X,REAR_X,AX_F,AX_R,WR,ROCK,BELT,ROOF,topY,halfAt,profDist,YBOT,xA,xC,DOOR_F,DOOR_R,NOSE_XC,REAR_XC,NOSE_RC,REAR_RC,ARCH_R,wx,u}=g;
  const INT=0x2a2b2e,UNDER=0x15171a,SASH=0x17181a,GASK=0x131416,SEAM=0x1d1112;
  const hw=g.halfW,ext=Math.ceil(hw+1.5);
  const S0=hgrid(Math.floor(REAR_X-2),Math.ceil(NOSE_X+1),0,ROOF+2.5,-ext,ext);
  // 1. solid outer volume from the profile x cross-section, rounded plan corners, wheel-arch lips
  for(let i=S0.x0;i<=S0.x1;i++){const x=i/HR;if(x>NOSE_X||x<REAR_X)continue;const ty=topY(x);
    for(let j=S0.y0;j<=S0.y1;j++){const y=j/HR;
      const yb=YBOT(x);if(y<yb||y>ty)continue;
      const h=halfAt(x,y)+g.archLip(x,y),K=Math.floor(h*HR+1e-9),base=((i-S0.x0)*S0.ny+(j-S0.y0))*S0.nz-S0.z0;
      const nzc=x>NOSE_XC?halfAt(NOSE_XC,y)-NOSE_RC:99,rzc=x<REAR_XC?halfAt(REAR_XC,y)-REAR_RC:99;
      for(let k=-K;k<=K;k++){const az=Math.abs(k)/HR;
        if(x>NOSE_XC&&az>nzc&&Math.hypot(x-NOSE_XC,az-nzc)>NOSE_RC)continue;
        if(x<REAR_XC&&az>rzc&&Math.hypot(x-REAR_XC,az-rzc)>REAR_RC)continue;
        S0.d[base+k]=1;}}}
  // 2. wheel arches (cylinders through the outer wall)
  const innerF=u(S.archInnerF||380),innerR=u(S.archInnerR||500);
  carveW(S0,null,(x,y,z)=>(Math.abs(z)>innerF&&Math.hypot(x-AX_F,y-WR)<ARCH_R)||(Math.abs(z)>innerR&&Math.hypot(x-AX_R,y-WR)<ARCH_R));
  // 3. cut the moving panels out of the solid
  const hoodX0=wx(S.hood.x),hoodZ=hw-u(S.hood.inset),hoodY0=u(S.hood.yMin);
  const door=S.door,dz0=ext;
  const hood=hgrid(hoodX0-.5,NOSE_X+.5,hoodY0-3,ROOF,-hoodZ-.5,hoodZ+.5),
        doorL=hgrid(DOOR_R-.5,DOOR_F+.5,u(door.sill)-1,ROOF,-dz0,0),doorR=hgrid(DOOR_R-.5,DOOR_F+.5,u(door.sill)-1,ROOF,0,dz0);
  const rearP=S.rear;let rearG;
  const take=(dst,pred)=>eachCell(dst,null,(i,j,k)=>{const x=i/HR,y=j/HR,z=k/HR;const n=S0.ix(i,j,k);if(!S0.inb(i,j,k)||S0.d[n]<0)return;if(pred(x,y,z)){dst.d[dst.ix(i,j,k)]=S0.d[n];S0.d[n]=-1;}});
  const HT=2.7;
  take(hood,(x,y,z)=>x>=hoodX0&&x<=NOSE_X&&Math.abs(z)<=hoodZ+.5&&profDist(x,y)<HT&&y>=hoodY0);
  const rearZ=hw-u(rearP.inset);
  if(rearP.type==='hatch'){const hx=wx(rearP.hingeX),by=u(rearP.bottomY);rearG=hgrid(REAR_X-.5,hx+.5,by-1,ROOF,-rearZ-.5,rearZ+.5);
    take(rearG,(x,y,z)=>x<=hx&&Math.abs(z)<=rearZ+.5&&y>=by&&(profDist(x,y)<HT||x<=g.rearX(Math.abs(z))+HT));}
  else{const tx=wx(rearP.frontX),by=u(rearP.bottomY);rearG=hgrid(REAR_X-.5,tx+.5,by-1,ROOF,-rearZ-.5,rearZ+.5);
    take(rearG,(x,y,z)=>x<=tx&&Math.abs(z)<=rearZ+.5&&profDist(x,y)<HT&&y>=by);}
  const inDoor=(x,y,z)=>x>=DOOR_R&&x<=DOOR_F&&y>=u(door.sill)&&y<=BELT&&Math.abs(z)>=halfAt(x,y)-4.2;
  take(doorL,(x,y,z)=>z<0&&inDoor(x,y,z));take(doorR,(x,y,z)=>z>0&&inDoor(x,y,z));
  // 3b. underbody channels
  for(const t of S.tunnels||[]){const x0=wx(t.x1),x1=wx(t.x0),hwz=u(t.half),yt=u(t.top);carveW(S0,[x0-1,x1+1,0,yt+1,-hwz-1,hwz+1],(x,y,z)=>x>=x0&&x<=x1&&Math.abs(z)<=hwz&&y<=yt);}
  // 4. cavities: engine bay and (for a notchback) trunk well / (for a hatch) the cargo bay under the lid
  const bay=S.bay;carveW(S0,[wx(bay.x1)-1,wx(bay.x0)+1,u(bay.floor),ROOF+1,-u(bay.half)-1,u(bay.half)+1],(x,y,z)=>x>=wx(bay.x1)&&x<=wx(bay.x0)&&Math.abs(z)<=u(bay.half)&&y>=u(bay.floor)&&!(x>=hoodX0&&y<hoodY0&&profDist(x,y)<2.3));   // the nose panel in front of the hood's leading edge keeps its skin
  if(rearP.type==='hatch'){const c=rearP.cargo,x0=wx(c.x1),x1=wx(c.x0);
    carveW(S0,[x0-1,x1+1,u(c.floor)-1,ROOF+1,-u(c.half)-1,u(c.half)+1],(x,y,z)=>x>=x0&&x<=x1&&Math.abs(z)<=u(c.half)&&y>=u(c.floor)&&!(Math.abs(z)>=u(c.wellHalf||c.half-100)&&Math.hypot(x-AX_R,y-WR)<ARCH_R+1.6));}
  else if(rearP.well){const c=rearP.well;carveW(S0,[wx(c.x1)-1,wx(c.x0)+1,u(c.floor)-1,ROOF+1,-u(c.half)-1,u(c.half)+1],(x,y,z)=>x>=wx(c.x1)&&x<=wx(c.x0)&&Math.abs(z)<=u(c.half)&&y>=u(c.floor)&&!(Math.abs(z)>=u(c.half)-6&&Math.hypot(x-AX_R,y-WR)<ARCH_R+1.6));}
  // 5. shell the body: outer skin = paint, inner layer = dark
  shellHi(S0,(x,y,z,inner)=>{
    if(y<14&&!inner)return UNDER;
    if(!inner&&x>NOSE_X-u(S.frontPanelLen)&&y<u(S.frontPanelBottom)+1)return UNDER;
    if(!inner&&x<REAR_X+u(S.tailPanelLen)&&y<YBOT(x)+1.3)return UNDER;
    return inner?INT:PAINT;},2);
  const bodyG=S0;
  // 5b. door apertures
  carveW(bodyG,[DOOR_R+1,DOOR_F-1,u(door.sill)+1,BELT,-ext,ext],(x,y,z)=>x>=DOOR_R+1&&x<=DOOR_F-1&&y>=u(door.sill)+1&&y<=BELT&&Math.abs(z)>=halfAt(x,y)-6);
  // 5c. door shells
  const doorSkin=(x,y,z)=>Math.abs(z)>=halfAt(x,Math.min(y,BELT))-1.1?PAINT:0x3a3b3f;
  shellHi(doorL,doorSkin,2);shellHi(doorR,doorSkin,2);
  // hood and rear lid: skin plus a frame of the inner panel
  const skinPaint=(x,y)=>profDist(x,y)<1.1;
  eachCell(hood,null,(i,j,k,n)=>{if(hood.d[n]<0)return;const x=i/HR,y=j/HR,z=k/HR;
    if(skinPaint(x,y))hood.d[n]=PAINT;else if(x<=hoodX0+1.5||x>=NOSE_X-1.5||Math.abs(z)>=hoodZ-1.2||Math.abs(Math.abs(z)-(x-hoodX0)*0.53)<1.1||Math.abs(x-(hoodX0+NOSE_X)/2)<1.1)hood.d[n]=INT;else hood.d[n]=-1;});
  eachCell(rearG,null,(i,j,k,n)=>{if(rearG.d[n]<0)return;const x=i/HR,y=j/HR,z=k/HR;
    const surf=profDist(x,y)<1.1||x<=g.rearX(Math.abs(z))+1.1;
    if(surf)rearG.d[n]=PAINT;else if(Math.abs(z)>=rearZ-1.2||Math.abs(z)<1.1||x>=wx(rearP.type==='hatch'?rearP.hingeX:rearP.frontX)-1.5)rearG.d[n]=INT;else rearG.d[n]=-1;});
  // 6. window openings and glass slabs
  const winOK=(x,y,xr,xfFn,yb,yt,R)=>{if(y<yb||y>yt||x<xr)return false;if(x>xfFn(y))return false;
    if(x<xr+R&&y>yt-R&&Math.hypot(x-(xr+R),y-(yt-R))>R)return false;const cx=xfFn(yt-R)-R;if(x>cx&&y>yt-R&&Math.hypot(x-cx,y-(yt-R))>R)return false;
    if(x<xr+R*.5&&y<yb+R*.5&&Math.hypot(x-(xr+R*.5),y-(yb+R*.5))>R*.5)return false;return true;};
  const gh=S.glass,dgFront=y=>xA(y)-u(gh.dgFront||90),qgFront=y=>DOOR_R-5;
  const dgIn=(x,y)=>winOK(x,y,DOOR_R+.5,dgFront,BELT+1.1,topY(x)-4,3.2);
  const qgIn=gh.quarter?(x,y)=>winOK(x,y,xC(y)+6,qgFront,BELT+1.5,topY(x)-4,3):()=>false;
  const wsX0=wx(gh.ws[1]),wsX1=wx(gh.ws[0]),rwX0=wx(gh.rw[1]),rwX1=wx(gh.rw[0]),rwY0=u(gh.rwY||0);
  const wsIn=(x,z,y)=>x>=wsX0&&x<=wsX1&&Math.abs(z)<halfAt(x,y)-6&&!(Math.abs(z)>halfAt(x,y)-9&&x>wsX1-3&&Math.hypot(x-(wsX1-3),Math.abs(z)-(halfAt(x,y)-9))>3)&&!(Math.abs(z)>halfAt(x,y)-9&&x<wsX0+3&&Math.hypot(x-(wsX0+3),Math.abs(z)-(halfAt(x,y)-9))>3);
  const rwIn=(x,z,y)=>x>=rwX0&&x<=rwX1&&y>=rwY0&&Math.abs(z)<halfAt(x,y)-6&&!(Math.abs(z)>halfAt(x,y)-9&&x<rwX0+3&&Math.hypot(x-(rwX0+3),Math.abs(z)-(halfAt(x,y)-9))>3)&&!(Math.abs(z)>halfAt(x,y)-9&&x>rwX1-3&&Math.hypot(x-(rwX1-3),Math.abs(z)-(halfAt(x,y)-9))>3);
  const winOpen=(x,y,z)=>{const az=Math.abs(z),ty=topY(x);
    if(y>=BELT-.1){
      if(y>ty-3.4&&wsIn(x,z,y))return 'ws';
      if(y>ty-3.4&&rwIn(x,z,y))return 'rw';
      if(az>=halfAt(x,y)-4.2&&dgIn(x,y))return 'dg';
      if(az>=halfAt(x,y)-4.2&&qgIn(x,y))return 'qg';}
    return null;};
  carveW(bodyG,[rwX0-1,wsX1+1,BELT-1,ROOF+1,-ext,ext],(x,y,z)=>{const w=winOpen(x,y,z);return w==='ws'||w==='dg'||w==='qg'||(w==='rw'&&rearP.type!=='hatch');});
  if(rearP.type==='hatch')carveW(rearG,null,(x,y,z)=>winOpen(x,y,z)==='rw');
  // 6b. the black window frame (sash) around each door glass belongs to the DOOR
  eachCell(bodyG,[DOOR_R,xA(ROOF),BELT,ROOF,-ext,ext],(i,j,k,n)=>{if(bodyG.d[n]<0)return;const x=i/HR,y=j/HR,z=k/HR;
    if(y<BELT+1.1||y>topY(x)-3||x<DOOR_R||x>xA(y)-3.5)return;if(Math.abs(z)<(y<=BELT+1.5?hw-8:halfAt(x,y)-4.2))return;
    const D=z<0?doorL:doorR;D.d[D.ix(i,j,k)]=SASH;bodyG.d[n]=-1;});
  // glass slabs, flush with the outer surface
  const glass={};const GL=0x5c8aa0;
  glass.ws=hgrid(wsX0-.5,wsX1+.5,BELT,ROOF+1,-ext,ext);glass.rw=hgrid(rwX0-.5,rwX1+.5,rwY0-.5,ROOF+1,-ext,ext);
  for(const k of ['dgL','dgR','qgL','qgR'])glass[k]=hgrid(REAR_X+10,NOSE_X-10,BELT-1,ROOF+1,k.endsWith('L')?-ext:0,k.endsWith('L')?0:ext);
  for(const gk of ['ws','rw'])eachCell(glass[gk],null,(i,j,k,n)=>{const x=i/HR,y=j/HR,z=k/HR,ty=topY(x);
    if(y>ty-1.3&&y<=ty+1e-9&&winOpen(x,y,z)===gk)glass[gk].d[n]=GL;});
  for(let i=glass.dgL.x0;i<=glass.dgL.x1;i++)for(let j=glass.dgL.y0;j<=glass.dgL.y1;j++){const x=i/HR,y=j/HR;if(y<BELT||y>ROOF)continue;const h=halfAt(x,y);
    for(const sd of [-1,1]){const zc=Math.round((h-1.0)*HR);
      if(dgIn(x,y))for(let q=0;q<2;q++)(sd<0?glass.dgL:glass.dgR).set(i,j,sd*(zc-q),GL);
      if(qgIn(x,y))for(let q=0;q<2;q++)(sd<0?glass.qgL:glass.qgR).set(i,j,sd*(zc-q),GL);}}
  // rubber gasket around the windshield and rear window
  const nearGlass=(G,i,j,k)=>{for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)for(let c=-1;c<=1;c++)if(G.get(i+a,j+b,k+c)>=0)return true;return false;};
  eachCell(bodyG,[wsX0-1,wsX1+1,BELT-1,ROOF+1,-ext,ext],(i,j,k,n)=>{if(bodyG.d[n]!==PAINT)return;if(nearGlass(glass.ws,i,j,k))bodyG.d[n]=GASK;});
  eachCell(rearP.type==='hatch'?rearG:bodyG,[rwX0-1,rwX1+1,rwY0-1,ROOF+1,-ext,ext],(i,j,k,n)=>{const G=rearP.type==='hatch'?rearG:bodyG;if(G.d[n]!==PAINT)return;if(nearGlass(glass.rw,i,j,k))G.d[n]=GASK;});
  // 6c. shut lines (cut into the outer skin only)
  const seam=(G,b,pred)=>eachCell(G,b,(i,j,k,n)=>{if(G.d[n]!==PAINT)return;const x=i/HR,y=j/HR,z=k/HR;if(pred(x,y,z))G.d[n]=SEAM;});
  seam(bodyG,[hoodX0-1.2,hoodX0+.4,hoodY0-2,ROOF,-hw,hw],(x,y,z)=>x<=hoodX0+.1&&Math.abs(z)<=hoodZ+.5&&y>topY(x)-1.5);
  seam(bodyG,[hoodX0,NOSE_X,hoodY0-2,ROOF,-hw,hw],(x,y,z)=>Math.abs(Math.abs(z)-(hoodZ+.7))<.3&&x>=hoodX0+.5&&y>topY(x)-1.5);
  seam(bodyG,[DOOR_F+.1,DOOR_F+.8,u(door.sill),BELT+1,-ext,ext],(x,y,z)=>x>DOOR_F+.1&&x<=DOOR_F+.55&&y>=u(door.sill)+.5&&y<=BELT&&Math.abs(z)>=halfAt(x,y)-4.2);
  seam(bodyG,[DOOR_R-.8,DOOR_R-.1,u(door.sill),BELT+1,-ext,ext],(x,y,z)=>x<DOOR_R-.1&&x>=DOOR_R-.55&&y>=u(door.sill)+.5&&y<=BELT&&Math.abs(z)>=halfAt(x,y)-4.2);
  seam(bodyG,[DOOR_R,DOOR_F,u(door.sill)-1,u(door.sill)+.5,-ext,ext],(x,y,z)=>y<u(door.sill)+.5&&y>=u(door.sill)-.1&&x>=DOOR_R&&x<=DOOR_F&&Math.abs(z)>=halfAt(x,y)-4.2);
  const lidX=wx(rearP.type==='hatch'?rearP.hingeX:rearP.frontX);
  seam(bodyG,[lidX-.8,lidX+.5,u(rearP.bottomY)-2,ROOF,-ext,ext],(x,y,z)=>x>=lidX-.6&&x<=lidX+.2&&Math.abs(z)<=rearZ+.5&&y>topY(x)-1.5);
  seam(bodyG,[REAR_X,lidX,u(rearP.bottomY)-2,ROOF,-ext,ext],(x,y,z)=>Math.abs(Math.abs(z)-(rearZ+.7))<.3&&y>topY(x)-1.5&&x<=lidX);
  // lower edge of the lid across the tail panel
  seam(bodyG,[REAR_X-1,REAR_X+4,u(rearP.bottomY)-2,u(rearP.bottomY)+1,-ext,ext],(x,y,z)=>y>=u(rearP.bottomY)-.8&&y<u(rearP.bottomY)-.2&&Math.abs(z)<=rearZ+.5&&x<REAR_X+3);
  // pockets for lamps, grille and plate recesses
  for(const c of S.cuts||[]){const x0=wx(c.x1),x1=wx(c.x0),y0=u(c.y0),y1=u(c.y1),z0=u(c.z0),z1=u(c.z1);
    for(const sd of (c.mirror?[-1,1]:[1])){const za=sd*z0,zb=sd*z1,lo=Math.min(za,zb),hi=Math.max(za,zb);
      for(const G of [bodyG,hood,rearG])carveW(G,[x0-.5,x1+.5,y0-.5,y1+.5,lo-.5,hi+.5],(x,y,z)=>x>=x0&&x<=x1&&y>=y0&&y<=y1&&z>=lo&&z<=hi);}}
  const hi={body:bodyG,hood,trunk:rearG,doorL,doorR,glass};
  const CB=[Math.floor(REAR_X-3),Math.ceil(NOSE_X+3),0,Math.ceil(ROOF+2),-ext-1,ext+1],out={hi,HR};
  out.body=coarsen(bodyG,4,CB);out.hood=coarsen(hood,4,CB);out.trunk=coarsen(rearG,4,CB);out.doorL=coarsen(doorL,4,CB);out.doorR=coarsen(doorR,4,CB);
  out.glass={};for(const k in glass)out.glass[k]=coarsen(glass[k],2,CB);
  out.rwOnLid=rearP.type==='hatch';
  return out;
}
if(typeof module!=='undefined')module.exports={makeShell,buildBodyGen};
