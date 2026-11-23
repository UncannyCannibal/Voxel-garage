/* ===== TOYOTA 2000GT (early MF10, 1967-1968): profile tables, body builder,
   detail builders, rig. From SPEC-GT2000.md (897 lines, verifier R2 APPROVED).
   Units: module units are 20 mm; x forward (+) from wheelbase centre, y up from
   ground, z to the car's right (+). Stations in mm are converted by u()/wx().
   PROVISIONAL/OPEN flags travel with the values that carry them (OPEN-1 overhang
   split, OPEN-5 hub face, OPEN-13 cabin, OPEN-16 arch gap, OPEN-18 cap/aerial,
   OPEN-21 grille/bumper heights, OPEN-BAY bay furniture). ===== */
const GT2000_M={
  // §2b envelope (PROVISIONAL split OPEN-1: total 4175 exact regardless of split)
  NOSE:119.75,TAIL:-89.00,AX_F:58.25,AX_R:-58.25,
  arch:{f:{x:1165,y:308,r:347.5},r:{x:-1165,y:308,r:347.5}},   // mm, for bodyLimits: arch centre = hub 308, radius = tyre radius 322.5 + 25 close-fit gap (Osaka side + early-wheel photos; OPEN-16 closed by this photo evidence)
  wheelF:{zIn:28},tubR:{zIn:28},   // DESIGN units: wheelhouse inner walls just inboard of the stock inner tyre face (567.5 mm = 28.375 units)
  bay:{x0:15,x1:107,half:26},   // module units, DESIGN (OPEN-BAY): bay furniture span; the body carve matches the bay grid
  tunnel:{x0:-70,x1:25,half:6,top:16},   // module units, DESIGN: gearbox tunnel to the rear floor
  door:{bottom:10.4},   // sill 208 mm PHOTO-DERIVED ±40
  bPillar:{botF:-58.0,topF:-57.1,botR:-61.0,topR:-60.1},   // DESIGN: 60 mm pillar, slight rearward rake
  quarter:[[-62,41.5],[-61,55],[-86,40.5]],   // DESIGN triangle: B-pillar rear to the rear-glass bottom (fastback side glass, chrome-surrounded)
  // §5 stations (mm from the nose tip unless noted; bands in SPEC-GT2000.md §5)
  doorFront:2600,doorRear:3555,handle:3425,   // MINFIX S1/S5: door front +50 mm (door length 1030->980, centre of 980±60; behind-axle 1370/2325/2195 + PROVISIONAL ovF 1230; handle 130 mm ahead of door rear edge, centre of 130±40)
  mirror:1970,   // fender mirror 740 behind axle + 1230
  cowl:2009,   // MINFIX WS-1: bonnet top length 2009 = cowl station 779 behind axle + 1230 (DERIVED, inherits PROVISIONAL); cowl moved to close the windshield quadruple: length 440 at 45°, cowl height 849, roof 1160, nose 700 — all inside bands (was 2050, which forced the 382 mm windshield)
  lampC:513,   // driving-lamp centres ±510 ±40; centre-to-centre 1026 ±60 -> ±513 satisfies both
  grilleW:616,   // grille width; height OPEN-21 (DESIGN 120 in the builder)
  popC:513,popLen:400,popWid:250,   // pop-up cover oval, centres above the driving lamps
  tailSurroundW:340,tailLampDia:130,   // per side, shared chrome surround; function order OPEN-7
};
function makeGT2000(){
  const NOSE_X=GT2000_M.NOSE,REAR_X=GT2000_M.TAIL,AX_F=GT2000_M.AX_F,AX_R=GT2000_M.AX_R,WR=15.375,BELT=40.4,ROOF=58.0;
  const u=mm=>mm/20,wx=m=>NOSE_X-m/20,mm=x=>(NOSE_X-x)*20;
  const DOOR_F=wx(GT2000_M.doorFront),DOOR_R=wx(GT2000_M.doorRear);
  const HOOD_X0=wx(GT2000_M.cowl),HOOD_X1=NOSE_X,HOOD_HALF=38,HATCH_X=-86;
  const HOOD_HINGE=[HOOD_X0,42.45],HATCH_HINGE=[-50,58.0];   // MINFIX WS-1+T8: bonnet hinged at the new cowl (19.3, 42.45); deck HATCH hinged at the ROOF (-50, 58.0) — the moving panel is glass+deck, not the old 70 mm strip hinged at the rear-glass bottom
  const planW=x=>{
    if(x>=95)return 33+7*Math.sqrt(Math.max(0,1-((x-95)/(NOSE_X-95))**2));   // FIX1 V-4: elliptical nose rounding — full width longer, then a round corner into the tip (was a linear taper: sharp plan corners)
    if(x<=-70)return 40-(40-38)*((-70-x)/(89-70));
    return 40.0;};
  const ghF=y=>y<=BELT?1:1-0.15*Math.min(1,(y-BELT)/(ROOF-BELT));
  const halfAt=(x,y)=>planW(x)*ghF(y);
  // Roofline profile (side view). MINFIX WS-1 SOLVED: windshield 45 deg from the cowl
  // (19.3, 42.45) to the roof (3.75, 58.0) — slope length 440 mm (15.55u x sqrt2), inside
  // 470 ±60; cowl height 849 mm (inside 890 ±60), cowl 779 mm behind the front axle (inside
  // ~820 ±120), bonnet length 2009 mm (inside 2050 ±100), roof 1160 and nose 700 held.
  // The old quadruple (cowl 890 + angle 45 + roof 1160) forced a 382 mm windshield; moving
  // the cowl 41 mm down/forward and taking length 440 (not 470) closes all four at once.
  // Roof flat 58.0 to -50 (DESIGN apex extent) with a subtle twin-crown valley (10 mm at the
  // centreline, DESIGN depth — the crown form is measured, its depth is not).
  // Rear glass: straight 26 deg from (-50, 58.0) to (-86, 40.45) — 800 mm EXACT at 26 deg.
  // Deck: -86..-89 at 40.45 (Kamm truncation; the deck lid is short BECAUSE the measured
  // glass is long — the trade-off is recorded, not resolved by guessing a shorter glass).
  const top=(x,z)=>{
    if(x>=19.3){const t=(x-19.3)/100.45,zn=Math.min(1,Math.abs(z)/HOOD_HALF);return 42.45-7.45*Math.pow(t,1.6)+Math.sin(Math.PI*t)*(1-zn*zn);}   // FIX1 V-4+F-5: curved bonnet (flat at the cowl, steepening to the nose) — kills the ruler-edge slope and the regular 108 mm step rhythm that read as ribs; endpoints 44.5/35.0 held; REDO L-2: transverse crown (20 mm max at mid-bonnet centreline, 0 at cowl/nose/edges) — the branch ignored z, reading as a flat table from above; roof untouched
    if(x>=3.75)return 42.45+(19.3-x);   // MINFIX WS-1: 45 deg, 440 mm slope (see roofline comment)
    if(x>=-50)return 58.0-(Math.abs(z)<15?0.5*(1-Math.abs(z)/15):0);
    if(x>=-86)return 58.0+(x+50)*(17.55/36.0);
    return 40.45;};
  const topC=x=>top(x,0),topY=(x,z)=>top(x,z);
  const belt=x=>x<=-10.25?40.4:(x>=19.3?42.45:40.4+2.05*(x+10.25)/29.55);   // MINFIX WS-1: beltline rises to the new cowl height (door range still flat 40.4)
  const doorRear=y=>-58.0;
  const frontLimit=y=>NOSE_X,rearLimit=y=>REAR_X,bottomZ=(x,z)=>10.4,archLip=(x,y)=>0;
  const xA=y=>19.3-(y-42.45),xC=y=>-50-(58-y)*2.0503;   // MINFIX WS-1: A-pillar line follows the new cowl
  const ARCH_F={x:AX_F,y:15.375,r:17.375},ARCH_RR={x:AX_R,y:15.375,r:17.375};   // FIX1 F-6: arch circle centred at hub height (307.5 mm) with radius 347.5 (tyre 322.5 + 25 close-fit gap) — top 655, gap above the tyre 25 mm (was centre 328 + radius 392.5: 90.5 mm visible gap)
  return {NOSE_X,REAR_X,AX_F,AX_R,WR,BELT,ROOF,DOOR_F,DOOR_R,halfW:40.0,u,wx,mm,halfAt,top,topC,topY,belt,doorRear,frontLimit,rearLimit,bottomZ,archLip,xA,xC,ARCH_F,ARCH_RR,HOOD_X0,HOOD_X1,HOOD_HALF,HATCH_X,HOOD_HINGE,HATCH_HINGE};
}
function buildGT2000Body(g){
  const M=GT2000_M,{NOSE_X,REAR_X,AX_F,AX_R,WR,BELT,ROOF,u,wx,halfAt,top,topC,belt}=g;
  const INT=0x2a2b2e,UNDER=0x15171a,SASH=0x141517,GASK=0x131416,SEAM=0x1d1112;
  const hw=g.halfW,ext=Math.ceil(hw+1.5);
  const S0=hgrid(Math.floor(REAR_X-2),Math.ceil(NOSE_X+1),0,ROOF+2,-ext,ext);
  const solidAt=(x,y,z)=>{if(x>g.frontLimit(y)||x<g.rearLimit(y))return false;if(y<g.bottomZ(x,z))return false;
    if(y>top(x,z))return false;return Math.abs(z)<=halfAt(x,y)+g.archLip(x,y);};
  g.solidAt=solidAt;
  eachCell(S0,null,(i,j,k,n)=>{const x=i/HR,y=j/HR,z=k/HR;if(solidAt(x,y,z))S0.d[n]=1;});
  const DEP=new Uint8Array(S0.d.length);{const sx=S0.ny*S0.nz,sy=S0.nz;let front=[];
    for(let p=0;p<S0.d.length;p++)if(S0.d[p]>=0){const i=Math.floor(p/sx),j=Math.floor((p%sx)/sy),k=p%sy;
      if(i===0||j===0||k===0||i===S0.nx-1||j===S0.ny-1||k===S0.nz-1||S0.d[p+sx]<0||S0.d[p-sx]<0||S0.d[p+sy]<0||S0.d[p-sy]<0||S0.d[p+1]<0||S0.d[p-1]<0){DEP[p]=1;front.push(p);}}
    for(let dd=2;dd<=8&&front.length;dd++){const nx=[];for(const p of front)for(const q of [p+sx,p-sx,p+sy,p-sy,p+1,p-1])if(q>=0&&q<S0.d.length&&S0.d[q]>=0&&!DEP[q]){DEP[q]=dd;nx.push(q);}front=nx;}}
  const AF=g.ARCH_F,AR=g.ARCH_RR,zF=M.wheelF.zIn,zR=M.tubR.zIn;
  carveW(S0,null,(x,y,z)=>(Math.abs(z)>zF&&Math.hypot(x-AF.x,y-AF.y)<AF.r)||(Math.abs(z)>zR&&Math.hypot(x-AR.x,y-AR.y)<AR.r));
  const B=M.bay;
  carveW(S0,null,(x,y,z)=>x<=B.x1&&x>=B.x0&&Math.abs(z)<=B.half&&y>=0&&y<top(x,z)-1.6);
  const T=M.tunnel;carveW(S0,null,(x,y,z)=>x<=T.x1&&x>=T.x0&&Math.abs(z)<=T.half&&y<=T.top);
  const hood=hgrid(g.HOOD_X0-.5,NOSE_X+.5,u(400),ROOF,-g.HOOD_HALF-.5,g.HOOD_HALF+.5);
  const HT=2.4;
  const take=(dst,pred)=>eachCell(dst,null,(i,j,k)=>{const x=i/HR,y=j/HR,z=k/HR;if(!S0.inb(i,j,k))return;const n=S0.ix(i,j,k);if(S0.d[n]<0)return;if(pred(x,y,z)){dst.d[dst.ix(i,j,k)]=1;S0.d[n]=-1;}});
  take(hood,(x,y,z)=>x>=g.HOOD_X0&&x<=g.HOOD_X1+.6&&Math.abs(z)<=g.HOOD_HALF&&top(x,z)-y<HT);
  const trunk=hgrid(REAR_X-.5,g.HATCH_X+.5,u(800),ROOF+1,-38,38);
  const depthAt=(x,y,z)=>{const i=Math.round(x*HR),j=Math.round(y*HR),k=Math.round(z*HR);if(!S0.inb(i,j,k))return 99;const v=DEP[S0.ix(i,j,k)];return v||99;};
  take(trunk,(x,y,z)=>x>=REAR_X&&x<=g.HATCH_X&&Math.abs(z)<=36&&top(x,z)-y<HT);
  const D=M.door,dz0=ext;
  const doorL=hgrid(g.DOOR_R-.5,g.DOOR_F+.5,D.bottom-1,ROOF,-dz0,0),doorR=hgrid(g.DOOR_R-.5,g.DOOR_F+.5,D.bottom-1,ROOF,0,dz0);
  const inDoor=(x,y,z)=>{if(y<D.bottom||x>g.DOOR_F||x<g.doorRear(y))return false;if(y<=belt(x))return Math.abs(z)>=halfAt(x,y)-4.2;return false;};
  take(doorL,(x,y,z)=>z<0&&inDoor(x,y,z));take(doorR,(x,y,z)=>z>0&&inDoor(x,y,z));
  const PFRONT=wx(200),PREAR=wx(3975);
  const inArch=(x,y,z)=>{for(const a of [AF,AR]){if(Math.hypot(x-a.x,y-a.y)<a.r+.6&&Math.abs(z)<halfAt(x,y)-1.2)return true;}return false;};
  shellHi(S0,(x,y,z,inner)=>{
    if(inArch(x,y,z)&&depthAt(x,y,z)>1)return UNDER;
    if(inner)return INT;
    if(x>PFRONT-.6&&y<u(550))return UNDER;
    // FIX1 V-3: the rear UNDER rule is DELETED — it painted the whole tail below the lamp line near-black (the flat black slab); those cells now fall to PAINT (body-coloured down to the bumper, per the early-rear photo). The front UNDER rule above stays (black intake/bumper area, not failed).
    return PAINT;},2);
  const bodyG=S0;
  // Deck-lid inner edge gasket: body cells touching the trunk panel read as gasket.
  {const sx=S0.ny*S0.nz,sy=S0.nz;for(let p=0;p<S0.d.length;p++){if(S0.d[p]<0||DEP[p]<2)continue;const i=Math.floor(p/sx)+S0.x0,j=Math.floor((p%sx)/sy)+S0.y0,k=p%sy+S0.z0;
     for(const [a,b,c] of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]])if(trunk.get(i+a,j+b,k+c)>=0){S0.d[p]=GASK;break;}}}
  const INT2=0x2b2c2f,byDepth=(x,y,z)=>{const d=depthAt(x,y,z);return d<=1?PAINT:(d===2?INT2:INT);};
  shellHi(hood,(x,y,z,inner)=>byDepth(x,y,z),2);
  shellHi(trunk,(x,y,z,inner)=>byDepth(x,y,z),2);
  const doorSkin=(x,y,z,inner)=>depthAt(x,y,z)<=1?PAINT:0x3a3b3f;
  shellHi(doorL,doorSkin,2);shellHi(doorR,doorSkin,2);
  // Hood and deck undersides read hollow (edge returns only) — no invented bracing.
  eachCell(hood,null,(i,j,k,n)=>{if(hood.d[n]!==INT)return;const x=i/HR,z=k/HR,x0=g.HOOD_X0,x1=g.HOOD_X1;
    const keep=x<=x0+1.5||x>=x1-1.5||Math.abs(z)>=g.HOOD_HALF-1.2;if(!keep)hood.d[n]=-1;});
  // (No trunk INT cleanup: the 3-unit deck lid is all edge band — its underside stays solid.)
  const DB=D.bottom;
  carveW(bodyG,[g.DOOR_R-1,g.DOOR_F+1,DB,ROOF,-ext,ext],(x,y,z)=>{if(y<DB+1||x>g.DOOR_F-1||x<g.doorRear(y)+1)return false;if(y>belt(x))return false;return Math.abs(z)>=halfAt(x,y)-7;});
  const P=M.bPillar,bpF=y=>P.botF+(P.topF-P.botF)*clampv((y*20-808)/(1160-808),0,1),bpR=y=>P.botR+(P.topR-P.botR)*clampv((y*20-808)/(1160-808),0,1);
  const roofEdge=x=>topC(x)-1.5;
  const dgFront=y=>-13.5+(y-40.4)*(4.5/16.1);   // MINFIX S18: door-glass front edge 20 mm rearward (with the rear edge below, glass 825-899 mm, inside 850±80, frames 65 mm each end at the belt)
  const dgIn=(x,y)=>y>belt(x)+.4&&y<roofEdge(x)&&x>bpF(y)+3.25&&x<dgFront(y);   // MINFIX S18: glass rear edge 59 mm forward of the B-pillar (65 mm frame at the belt, was a 6 mm sliver)
  const qPoly=M.quarter.map(([a,b])=>[a,b]);
  const inPoly=(x,y,poly)=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,yi]=poly[i],[xj,yj]=poly[j];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))c=!c;}return c;};
  const qgIn=(x,y)=>inPoly(x,y,qPoly)&&x<bpR(y)-.4;
  const wsX0=3.75,wsX1=19.3;   // MINFIX WS-1: windshield base at the new cowl
  const wsIn=(x,y,z)=>x<=wsX1&&x>=wsX0&&Math.abs(z)<halfAt(x,y)-3.2&&y>u(800);
  const rwIn=(x,y,z)=>x<=-50&&x>=-86&&Math.abs(z)<halfAt(x,y)-2.4&&y>u(800);
  const sideOpen=(x,y,z)=>Math.abs(z)>=halfAt(x,y)-4.5;
  carveW(bodyG,[REAR_X,NOSE_X,BELT-1,ROOF+1,-ext,ext],(x,y,z)=>sideOpen(x,y,z)&&(dgIn(x,y)||qgIn(x,y)));
  const glass={},GL=0x232a2e;   // neutral dark glass (OPEN-20: unmeasured; no other car's tint imported)
  glass.ws=hgrid(wsX0-.5,wsX1+.5,BELT,ROOF+1,-ext,ext);glass.rw=hgrid(-86.5,-49.5,u(800),ROOF+1,-ext,ext);
  const skinToGlass=(Gp,Gg,inR)=>eachCell(Gp,null,(i,j,k,n)=>{const v=Gp.d[n];if(v<0)return;const x=i/HR,y=j/HR,z=k/HR;if(!inR(x,y,z))return;if(v===PAINT)Gg.set(i,j,k,GL);Gp.d[n]=-1;});
  skinToGlass(bodyG,glass.ws,(x,y,z)=>wsIn(x,y,z)&&y>top(x,z)-3.6);
  skinToGlass(bodyG,glass.rw,(x,y,z)=>rwIn(x,y,z)&&y>top(x,z)-3.6);
  eachCell(bodyG,[g.DOOR_R-1,g.DOOR_F+2,BELT,ROOF,-ext,ext],(i,j,k,n)=>{if(bodyG.d[n]<0)return;const x=i/HR,y=j/HR,z=k/HR;
    if(y<=belt(x)||y>roofEdge(x)+1.1)return;if(x>g.xA(y)-1.7||x<Math.min(bpF(y),g.doorRear(y)))return;if(!sideOpen(x,y,z))return;
    const Dd=z<0?doorL:doorR;Dd.set(i,j,k,y<=belt(x)+.4?bodyG.d[n]:SASH);bodyG.d[n]=-1;});
  // PAINT-04 (owner, Nov 15): the 2000GT's pillar between the door glass and the quarter glass is body colour; its window frames are chrome
  // ("Minimalist bumpers were chrome-plated to match the front intake shroud, door handles, bezels, badges and window frames": supercarnostalgia.com).
  // The black pillar here was a DESIGN copy of the EF's. The pillar is paint now; the black sash should become chrome (left for the 2000GT's own tasks).
  for(const kk of ['dgL','dgR','qgL','qgR'])glass[kk]=hgrid(REAR_X+10,NOSE_X-10,BELT-1,ROOF+1,kk.endsWith('L')?-ext:0,kk.endsWith('L')?0:ext);
  for(let i=glass.dgL.x0;i<=glass.dgL.x1;i++)for(let j=glass.dgL.y0;j<=glass.dgL.y1;j++){const x=i/HR,y=j/HR;if(y<BELT-.5||y>ROOF)continue;const h=halfAt(x,y);
    for(const sd of [-1,1]){const zc=Math.round((h-.9)*HR);
      if(dgIn(x,y))for(let q=0;q<2;q++)(sd<0?glass.dgL:glass.dgR).set(i,j,sd*(zc-q),GL);
      if(qgIn(x,y))for(let q=0;q<2;q++)(sd<0?glass.qgL:glass.qgR).set(i,j,sd*(zc-q),GL);}}
  for(const [Dd,Gg] of [[doorL,glass.dgL],[doorR,glass.dgR]])for(const [i,j,k] of Gg.list())Dd.set(i,j,k,-1);
  const nearGlass=(Gg,i,j,k)=>{for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)for(let c=-1;c<=1;c++)if(Gg.get(i+a,j+b,k+c)>=0)return true;return false;};
  eachCell(bodyG,[wsX0-1,wsX1+1,BELT-1,ROOF+1,-ext,ext],(i,j,k,n)=>{if(bodyG.d[n]!==PAINT)return;if(nearGlass(glass.ws,i,j,k))bodyG.d[n]=GASK;});
  eachCell(bodyG,[-86.5,-49.5,u(800)-1,ROOF+1,-ext,ext],(i,j,k,n)=>{if(bodyG.d[n]!==PAINT)return;if(nearGlass(glass.rw,i,j,k))bodyG.d[n]=GASK;});
  eachCell(bodyG,[REAR_X-1,wx(2700)+1,BELT-1,ROOF+1,-ext,ext],(i,j,k,n)=>{if(bodyG.d[n]!==PAINT)return;if(nearGlass(glass.qgL,i,j,k)||nearGlass(glass.qgR,i,j,k))bodyG.d[n]=GASK;});
  const seam=(Gg,b,pred)=>eachCell(Gg,b,(i,j,k,n)=>{if(Gg.d[n]!==PAINT)return;const x=i/HR,y=j/HR,z=k/HR;if(pred(x,y,z))Gg.d[n]=SEAM;});
  seam(bodyG,[g.HOOD_X0-1.2,g.HOOD_X0+.4,u(400),ROOF,-hw,hw],(x,y,z)=>x<=g.HOOD_X0+.1&&Math.abs(z)<=g.HOOD_HALF+.5&&y>top(x,z)-1.5);
  seam(bodyG,[g.HOOD_X1-.4,g.HOOD_X1+1.2,u(400),ROOF,-hw,hw],(x,y,z)=>x>=g.HOOD_X1-.1&&Math.abs(z)<=g.HOOD_HALF+.5&&y>top(x,z)-1.5);
  seam(bodyG,[g.HOOD_X0,NOSE_X,u(400),ROOF,-hw,hw],(x,y,z)=>Math.abs(Math.abs(z)-(g.HOOD_HALF+.6))<.3&&x>=g.HOOD_X0+.5&&y>top(x,z)-1.6);
  seam(bodyG,[g.DOOR_F+.1,g.DOOR_F+.8,DB,BELT+1,-ext,ext],(x,y,z)=>x>g.DOOR_F+.1&&x<=g.DOOR_F+.55&&y>=DB+.5&&y<=belt(x)&&Math.abs(z)>=halfAt(x,y)-4.2);
  seam(bodyG,[g.DOOR_R-6,g.DOOR_R+.2,DB,BELT+1,-ext,ext],(x,y,z)=>{const xr=g.doorRear(y);return x<xr-.1&&x>=xr-.55&&y>=DB+.5&&y<=belt(x)&&Math.abs(z)>=halfAt(x,y)-4.2;});
  seam(bodyG,[g.DOOR_R-6,g.DOOR_F,DB-1,DB+.5,-ext,ext],(x,y,z)=>y<DB+.5&&y>=DB-.1&&x>=g.doorRear(y)&&x<=g.DOOR_F&&Math.abs(z)>=halfAt(x,y)-4.2);
  seam(bodyG,[g.HATCH_X-.8,g.HATCH_X+.5,u(800),ROOF+1,-ext,ext],(x,y,z)=>x>=g.HATCH_X-.6&&x<=g.HATCH_X+.2&&Math.abs(z)<=36.5&&y>top(x,z)-1.5);
  seam(bodyG,[REAR_X,g.HATCH_X,u(800),ROOF+1,-ext,ext],(x,y,z)=>Math.abs(Math.abs(z)-36.6)<.3&&x<=g.HATCH_X);
  // Pop-up cover ovals (closed-state panel lines on the bonnet leading edge): ellipse
  // outlines at the measured cover stations — MINFIX F24/F25/F35: 400 fore-aft (x) x 270
  // across (z), centres (102.25, ±25.65), half extents 10 (x) x 6.75 (z) units. The old
  // ovals were TRANSPOSED (250 along x, 400 across z). Tolerance tightened 0.25->0.12 so
  // the outline paints ~1 cell (voxel floor 10 mm; the photo's ~5 mm shut line is below
  // one cell and is NOT claimed). The covers themselves are the pod meshes (stage 2),
  // hidden when the lamps are down; these seams are the closed read.
  seam(hood,[92,113,30,ROOF,-33,33],(x,y,z)=>{const ex=(x-102.25)/10,ez=(Math.abs(z)-25.65)/6.75;return Math.abs(ex*ex+ez*ez-1)<0.12&&y>top(x,z)-1.6;});
  // REDO L-2: cover rings read as bold black from above — recolor the oval seams to the F-1 shadowed seam tone (shut line on red paint, not a black ring); shape/position untouched
  eachCell(hood,[92,113,30,ROOF,-33,33],(i,j,k,n)=>{if(hood.d[n]===SEAM)hood.d[n]=0x4a1e20;});
  // Lower-rear-front-fender rectangular panel seam (SEAM ONLY — function unidentified,
  // NOT a vent, NOT a flap; OPEN-9 closed the vent question, the seam itself is measured).
  seam(bodyG,[10,35,12,25,-ext,ext],(x,y,z)=>Math.abs(z)>=halfAt(x,y)-.6&&(((Math.abs(x-10)<.3||Math.abs(x-35)<.3)&&y>=12&&y<=25)||((Math.abs(y-12)<.3||Math.abs(y-25)<.3)&&x>=10&&x<=35)));
  // MINFIX F36: cowl vent row — slots on the bonnet rear strip at the windshield base.
  // No separate cowl panel exists in this geometry (the bonnet rear edge IS the windshield
  // base), so the row sits on the hood top just forward of the hinge line; DESIGN placement
  // (slot width 60 mm, gap 40 mm, row 1200 mm across, from LC22 + early-front photos).
  eachCell(hood,[19.6,21.6,30,ROOF,-30,30],(i,j,k,n)=>{if(hood.d[n]<0)return;const x=i/HR,y=j/HR,z=k/HR;
    if(y<top(x,z)-1.6)return;if((Math.abs(z)%5)<3)hood.d[n]=0x17181c;});
  // FIX1 F-1: soften the fender panel seam from SEAM near-black to a shadowed seam tone — it must read as a shut line on the red paint, not a heavy black rectangle (size kept: the Osaka photo's panel is the same ~500x260).
  eachCell(bodyG,[10,35,12,25,-ext,ext],(i,j,k,n)=>{if(bodyG.d[n]===SEAM)bodyG.d[n]=0x4a1e20;});
  const hi={body:bodyG,hood,trunk,doorL,doorR,glass};
  const CB=[Math.floor(REAR_X-3),Math.ceil(NOSE_X+3),0,Math.ceil(ROOF+2),-ext-1,ext+1],out={hi,HR};
  out.body=coarsen(bodyG,4,CB);out.hood=coarsen(hood,4,CB);out.trunk=coarsen(trunk,4,CB);out.doorL=coarsen(doorL,4,CB);out.doorR=coarsen(doorR,4,CB);
  out.glass={};for(const kk in glass)out.glass[kk]=coarsen(glass[kk],2,CB);
  out.rwOnLid=true;   // MINFIX T8: the rear glass RIDES the deck hatch (glass+deck panel hinged at the roof) — the old 'fixed in body' note described the strip mechanism, not the real car
  return out;
}
// ---- GT2000 detail builders (grids in absolute 10 mm cells unless noted;
// mk with scale .5, matching the mirror-glass / interior-mesh convention) ----
function gt2000BumperF(){   // thin chrome blade, full nose width, 2 cells proud of the face (no overlap with body face cells, so no coplanar double-draw)
  const g=new Grid(240,241,27,32,-64,64);g.fill(()=>COL.chrome);   // FIX1 F-8: y 13.5..16 (270..320 mm, 50 mm blade, centre 295 kept) — thinner toward the real thin blade (DESIGN height OPEN-21; blade stops inside the nose corners)
  const ov=new Grid(242,242,28,44,27,34);ov.fill(()=>0x17181c);   // D1D2 D-1: black vertical overriders STRADDLING the grille edge (grille half-width 310 mm; overrider 270..340 mm, 80 mm wide); mesh y 275..445 mm, centre 360 mm, top 445 mm overlapping the grille band (375..505 mm) by 70 mm — measured from the live mesh (the old 'centre 380' label was the mesh TOP edge, never the centre)
  const ov2=new Grid(242,242,28,44,-34,-27);ov2.fill(()=>0x17181c);   // D1D2 D-1: mirror of ov (same y 28..44: mesh 275..445 mm, centre 360 mm)
  return {grid:g,over:[ov,ov2]};}
function gt2000BumperR(){   // thin chrome blade following the Kamm tail + bumperettes flanking the plate recess
  const g=new Grid(-180,-179,27,31,-74,74);g.fill(()=>COL.chrome);   // MINFIX R13: y 13.5..15.5 (50 mm cube span, centre 290 mm — was 80 mm cube span; photo ~52 mm est.)
  const bm=new Grid(-181,-180,20,41,20,28);bm.fill(()=>COL.chrome);   // MINFIX R16: chrome guards 220 mm tall (was 190; photo ~218 mm derived)
  const bm2=new Grid(-181,-180,20,41,-28,-20);bm2.fill(()=>COL.chrome);   // MINFIX R16: mirror of bm
  const rb=new Grid(-182,-182,20,41,20,28);rb.fill(()=>0x17181c);   // MINFIX R16: rubber matches the guard height
  const rb2=new Grid(-182,-182,20,41,-28,-20);rb2.fill(()=>0x17181c);   // MINFIX R16: mirror of rb
  return {grid:g,over:[bm,bm2,rb,rb2]};}
function gt2000DriveLamp(sd){   // FIX1 V-1: round driving/fog lamp in a CHROME BEZEL set into a BLACK fender recess, fluted lens with a warm bulb centre (headlamp-closeup photo); size/station kept (centres ±510, lens Ø250, bezel Ø290 within the 270±20 band)
  const G=new Grid(240,241,31,65,sd<0?-68:-34,sd<0?-34:68);
  for(let j=31;j<=65;j++)for(let k=(sd<0?-68:-34);k<=(sd<0?-34:68);k++){const d=Math.hypot(j-48,k-sd*51);
    if(d<=16.5)G.set(240,j,k,0x17181c);   // black recess cup Ø330, flush with the face
    if(d<=14.5){if(d>12.5)G.set(241,j,k,COL.chrome);else G.set(241,j,k,d<=3.5?0xe8dcc0:(((k%4)+4)%4<2?0xd8dde2:0xc2cad2));}}   // bezel Ø290 proud of the cup; fluted lens Ø250 (vertical flutes alternate by column), warm bulb centre
  return G;}
function gt2000Signal(sd){   // amber front signal, 300x60, under the bumper blade (y 10..12.5, clear of the blade's bottom row)
  const G=new Grid(240,241,20,25,sd<0?-66:-36,sd<0?-36:66);
  for(let j=20;j<=25;j++)for(let k=(sd<0?-66:-36);k<=(sd<0?-36:66);k++)if(Math.abs(k)>=36&&Math.abs(k)<=66)G.set(240,j,k,0xe8a020),G.set(241,j,k,0xe8a020);
  return G;}
function gt2000Grille(){   // 616 wide x 120 tall DESIGN (OPEN-21): dark recess, chrome border + slats, 1 cell proud of the nose face
  const g=new Grid(240,241,38,50,-31,31);g.fill(()=>0x141517);
  for(let k=-31;k<=31;k++){g.set(240,50,k,COL.chrome);g.set(241,50,k,COL.chrome);g.set(240,44,k,COL.chrome);g.set(241,44,k,COL.chrome);}
  for(let j=38;j<=50;j++){g.set(240,j,0,COL.chrome);g.set(241,j,0,COL.chrome);g.set(240,j,-31,COL.chrome);g.set(241,j,-31,COL.chrome);g.set(240,j,31,COL.chrome);g.set(241,j,31,COL.chrome);}
  return g;}
function gt2000Tail(sd){   // FIX1 V-6: ROUNDED SHARED CHROME SURROUND per side (two lamps inside one rounded surround, per the early-rear photo) — not a flat black box; lamps unlit, function order OPEN-7
  const g=new Grid(-180,-179,49,70,sd<0?-74:40,sd<0?-40:74);   // MINFIX R8: surround 220 mm tall (was 180; photo ~218 mm derived), centre 595 mm kept
  for(let j=49;j<=70;j++)for(let k=(sd<0?-74:-40);k<=(sd<0?-40:74);k++){if(Math.abs(k)<40||Math.abs(k)>74)continue;
    const cj=Math.min(66,Math.max(53,j)),ck=Math.min(70,Math.max(44,Math.abs(k)));
    if(Math.hypot(j-cj,Math.abs(k)-ck)<=4.5)for(const i of [-180,-179])g.set(i,j,k,COL.chrome);}   // rounded-rect surround (corner radius ~4.5 cells)
  for(const kc of [49,65])for(let j=51;j<=68;j++)for(let k=(sd<0?-74:-40);k<=(sd<0?-40:74);k++){if(Math.abs(k)<40||Math.abs(k)>74)continue;const d=Math.hypot(j-60,k-sd*kc);
    if(d<=7.5)for(const i of [-180,-179])g.set(i,j,k,d<=6.5?0xc02028:0x17181c);}   // red discs Ø130 with a 1-cell dark gasket ring each
  return g;}
function gt2000Marker(sd){   // small red disc + chrome teardrop, low on the rear fender (EARLY form; form simplified, DESIGN)
  const g=new Grid(-164,-153,38,42,sd*79,sd*79);
  for(let i=-164;i<=-157;i++){const hw=0.5+(i+164)*0.21;for(let j=38;j<=42;j++)if(Math.abs(j-40)<=hw)g.set(i,j,sd*79,COL.chrome);}
  for(let i=-157;i<=-153;i++)for(let j=38;j<=42;j++)if(Math.hypot(i+155,j-40)<=2.5)g.set(i,j,sd*79,0xc02028);
  return g;}
function gt2000DeckBadge(){   // MINFIX R12: TOYOTA 2000GT plate FLAT on the horizontal deck lid at 809 mm (was on the vertical tail face at 720 mm); black field, chrome border, silver 3x5 micro-font letters (emblem-mf10 photo); 530 across (z) x 70 fore-aft (x) so all 12 letters fit unclipped (plate dimensions themselves are UNMEASURED — R9); letter tops point forward so the plate reads from behind the car; the plate rides the trunk group (stage 2), so it opens with the hatch
  const g=new Grid(-178,-172,81,82,-26,26);g.fill(()=>0x141517);
  const F={T:['111','010','010','010','010'],O:['111','101','101','101','111'],Y:['101','101','010','010','010'],A:['010','101','111','101','101'],'2':['111','001','111','100','111'],'0':['111','101','101','101','111'],G:['111','100','101','101','111']};
  let k=-25;
  for(const ch of 'TOYOTA 2000GT'){if(ch===' '){k+=2;continue;}const pat=F[ch];for(let r=0;r<5;r++)for(let c=0;c<3;c++)if(pat[r][c]==='1')g.set(-173-r,82,k+c,0xc8c8c8);k+=4;}
  for(let kk=-26;kk<=26;kk++){g.set(-178,81,kk,COL.chrome);g.set(-172,81,kk,COL.chrome);g.set(-178,82,kk,COL.chrome);g.set(-172,82,kk,COL.chrome);}
  for(let xx=-178;xx<=-172;xx++){g.set(xx,81,-26,COL.chrome);g.set(xx,81,26,COL.chrome);g.set(xx,82,-26,COL.chrome);g.set(xx,82,26,COL.chrome);}
  return g;}
function gt2000Triangle(sd){   // small triangular badge (red/black), front fender behind the wheel (form simplified, DESIGN)
  const g=new Grid(38,42,68,72,sd*81,sd*81);
  for(let i=38;i<=42;i++){const tp=68+(2-Math.abs(i-40))*2;for(let j=68;j<=tp;j++)g.set(i,j,sd*81,j===68?0x17181c:0xc02028);}
  return g;}
function gt2000Cap(){   // round chrome fuel cap Ø100, LEFT rear fender top ahead of the tail lamp (OPEN-18: observed region, exact station unmeasured)
  const g=new Grid(-155,-145,81,82,-77,-67);
  for(let i=-155;i<=-145;i++)for(let k=-77;k<=-67;k++)if(Math.hypot(i+150,k+72)<=5)for(let j=81;j<=82;j++)g.set(i,j,k,COL.chrome);
  return g;}
function gt2000Aerial(){   // thin chrome mast, RIGHT rear fender top near the deck edge (OPEN-18: side unmeasured — flagged, opposite the cap by DESIGN choice)
  const g=new Grid(-172,-168,81,105,68,72);
  for(let i=-172;i<=-168;i++)for(let k=68;k<=72;k++)g.set(i,81,k,COL.chrome);
  for(let j=81;j<=105;j++)g.set(-170,j,70,COL.chrome);
  return g;}
function gt2000Pod(sd,GT){   // MINFIX F24/F25/F30: raised pod as a LOW WEDGE over the CORRECTED cover footprint (400 fore-aft x 270 across — the old body was transposed 250 x 410), round lamp in a chrome bezel on its front face, sloping dark lid-flap top (LC22 pods-up photo); lens plane 145 mm behind the nose tip (was 65); toggle kept (visible iff lights > 0)
  const z0=sd<0?-64:38,z1=sd<0?-38:64;   // MINFIX: 27 cells = 270 mm across, centred ±510 mm (was 40 cells = 410 mm)
  const bonnetTop=x=>GT?GT.top(x,0):42.45-7.45*Math.pow((x-19.3)/100.45,1.6);   // bonnet top in units (GT.top is the single source of truth; the fallback repeats the WS-1 curve)
  const rearTop=Math.round(bonnetTop(92.5)*2)+1;   // wedge rear sits 1 cell above the bonnet (new rear at 92.5u)
  const body=new Grid(185,224,60,90,z0,z1);   // MINFIX: 40 cells = 400 mm fore-aft (was 26 cells = 260 mm)
  for(let i=185;i<=224;i++){const topY=Math.round(rearTop+(89-rearTop)*(i-185)/39);for(let j=60;j<=topY;j++)for(let k=z0;k<=z1;k++)body.set(i,j,k,0x17181c);}
  const lens=new Grid(225,225,65,89,z0,z1);   // MINFIX F30: lens plane 225 cells = 145 mm behind the nose tip (was 233 = 65 mm)
  for(let j=65;j<=89;j++)for(let k=z0;k<=z1;k++){const d=Math.hypot(j-77,k-sd*51);
    if(d>10.5&&d<=12)lens.set(225,j,k,COL.chrome);   // chrome bezel Ø240 (MINFIX: plane follows the grid — the 233 here was the old plane and silently emptied the lens)
    else if(d<=10.5)lens.set(225,j,k,d<=3.5?0xe8dcc0:(((k%4)+4)%4<2?0xd8dde2:0xc2cad2));}   // fluted lens with a warm bulb centre
  return {body,lens};}
function gt2000Handle(){   // MINFIX S2/S4: 210 mm pull CENTRED on the origin (x -10..10 cells = 210 mm, 30 mm tall, 40 mm deep), black pull with chrome end caps — same colours as the old handle; symmetric by construction (no rotation, so both sides share one centre station)
  const g=new Grid(-10,10,0,2,0,3);g.fill((x,y,z)=>((x<=-9||x>=9)?COL.chrome:0x17181b));return g;}
function gt2000LockDisc(){   // single 20 mm chrome cell (unit grid, mk without scale, like buildHandle)
  const g=new Grid(0,0,0,0,0,0);g.set(0,0,0,COL.chrome);return g;}
function gt2000FenderMirror(g,sd){   // FIX1 F-4: fender bullet mirror — TEARDROP head (170 long x 80 high x 70 wide, rounded front, flat glass rear face), NOT a sphere; stalk + seating + rear-face glass kept
  const shell=new Grid(34,51,86,100,sd<0?-84:-84,sd<0?-75:84);
  for(let j=86;j<=95;j++)for(let i=42;i<=43;i++)for(const kk of [78,79])shell.set(i,j,sd*kk,0x3a3b3f);   // stalk unchanged (paintable base colour; the shell mesh takes matPaint)
  for(let i=34;i<=51;i++){const dx=(i-42.5)/8.5,prof=dx>=0?Math.sqrt(Math.max(0,1-dx*dx)):(1-0.15*Math.abs(dx));if(prof<0.2)continue;
    for(let j=91;j<=99;j++)for(let k=(sd<0?-83:-83);k<=(sd<0?-75:83);k++){const d=((j-95)/(4*prof))**2+((k-sd*79)/(3.5*prof))**2;if(d<=1)shell.set(i,j,k,PAINT);}}
  const glass=new Grid(34,34,91,99,sd<0?-82:-82,sd<0?-76:82);
  for(let j=91;j<=99;j++)for(let k=(sd<0?-82:-76);k<=(sd<0?-76:82);k++){const d=((j-95)/3)**2+((k-sd*79)/2.6)**2;if(d<=1)glass.set(34,j,k,0x8fa8b8);}
  return {shell,glass,glassCenter:[17.25,47.5,sd*39.6],glassSize:[4,4]};}
const GT2000_RIG={
  KZ:27.5,MAX_STEER:0.565,   // KZ DESIGN (100 mm inboard convention: 650/20-5); MAX_STEER 0.565 rad PROVISIONAL bicycle (OPEN-15; alternate 0.525 carried, not used)
  cp:{side:1,   // RHD EXPLICIT (makeRig defaults SD = cp.side || -1; omitting it silently builds LHD — AE86 lane proved this)
    H:{x:-25,y:22,z:20},back:24,   // seat centre + back height, INTERIM (OPEN-13)
    wheel:{x:-5,y:40,z:20,n:[-0.9,0.436,0]},   // DIAMETER OPEN (OPEN-13) — stage 4 uses genSteeringWheel(360,{}) INTERIM (Eclipse pattern)
    pedalX:10,pedalY:30,pedalLen:330,
    pedals:[['clutch',14.5,70,60],['brake',20,70,60],['gas',25.5,45,110]],   // RHD Z32 pattern: clutch INBOARD of driver centre 20; naive mirroring of the LHD set would put the clutch outboard on the wrong side
    shifter:{x:0,y:26},eye:{x:-36.5,y:53,z:20}},   // eye INTERIM EF-form ONLY (11.5 behind H.x, 31 above H.y, driver centre +20) — boot/drive placeholder flagged; THE INTERIOR MIRROR IS NOT BUILT FROM THIS VECTOR
  // Rig-top-level fields below (makeRig reads R.dash/R.console/R.floorY/R.floorAt/R.floorHalf/R.cargo, NOT cp.* — Eclipse's rig lays them out this way; putting them inside cp would break interior()).
  dash:{rearX:0,top:42,bot:33,cowlX:19.3,halfZ:33,slope:0.12},   // INTERIM/DESIGN (MINFIX WS-1: cowlX 19.3 = cowl station 779 behind front axle, DERIVED from bonnet 2009 − PROVISIONAL ovF 1230, inherits PROVISIONAL flag + both bands; dash top 42 = 840 mm below cowl height 42.45 = 849, inside 890 ±60)
  console:{rearX:-30,shiftX0:-8,shiftX1:8,top:26,y0:15.5},   // INTERIM/DESIGN (EF form)
  floorY:10,floorAt:x=>10,   // DESIGN flat floor (200 mm floor pan; the 2-seater cargo deck is the separate cargo table, not a raised floor)
  floorHalf:x=>{const fa=Math.abs(x-58.25)<=20,ra=Math.abs(x+58.25)<=19.5,tw=Math.abs(x+58.25)<=8.5;return fa?20:(tw?22:(ra?27.5:34));},   // DESIGN (Eclipse structure, GT2000 axles)
  cargo:{frontX:-45,rearX:-85,floorY:26,half:22.5},   // DESIGN luggage deck behind the seats (Z32 pattern, NO hi flag: cargo without hi builds the generic load floor, which is what the GT2000 wants; rearX -85 stops short of PROVISIONAL tail -89.00, OPEN-1 moves it if the split moves)
  bay:{x0:15,x1:107,top:38,radX:100,batX:85,towerTop:38,airZ:1,towers:false,rails:false,   // DESIGN layout (Z32 field list, GT2000 values; OPEN-BAY refines); airZ 1 follows the Z32 battery/airbox-side convention
    battery:{x0:82,x1:88,y0:14,y1:21,z0:14,z1:23},res:{z0:16,z1:18},airbox:{x0:82,x1:88,y0:22,y1:28,z0:14,z1:23,inlet:false},fan:{y:21,z:0,r:8.5},boosterZ:17,boosterR:4,mcLen:7,fuse:{z0:-24,z1:-19}},
  crash:{y0:15,y1:21,half:30},doorCard:{y0:15},   // DESIGN (Z32 pattern)
  links:{n:40,arm:2,rod:1.2,shaft:1.4},   // Z32 pattern, NO fork field (fork = two legs straddling a half-shaft, EF-front-only; the GT2000 front has no half-shaft, so a fork field would be a wrong part not a spare)
  damper:{n:60,bodyR:2.5,rodR:1,bodyFrac:.5},coil:{n:40,R:4.5,w:.9,turns:6},   // renderer resolution copied verbatim from Z32/AE86, labelled not car data
  power:{x:20,crankY:16,incline:{},inclineDefault:0},   // DESIGN front-mid (flywheel face 20 units ahead of wheelbase centre = 765 mm behind front axle, 14 mm ahead of cowl 19.3 after the WS-1 move, so the bell sits in the tunnel hump; engine front (20+35) = 55, 3.25 units behind front axle — whole block behind axle, ahead of cabin, front-mid; crank 320 mm up vs Z32 310, AE86 340; OPEN-BAY refines)
  exh:{x0:0,frontY:7.8,pipeY:7.8,zRun:0,pr:1.6,catX:-14,catW:3.2,catH:2.2,mufH:2.4,mufX0:-70,mufX1:-85,mufZ:0,side:0,tipX:-91,tipY:10,tipsZ:[-1.5,1.5],tipR:3,mufDark:1,via:[[-50,7.8,0],[-72,7.8,0],[-79,7.8,0]]},   // twin-centre layout (see genExhaust 'quad' branch); FIX1 V-7: tipR is in CELLS in genExhaustTips (default 3 = Ø60) — the spliced 1.5 built Ø30 tips that read as crosses; tipX -91 puts the outlet 20 mm proud of the bumper rear
  under:{subY:10.4,rearY:10.75,railZ:20,railX0:36,railX1:90,brkX:63,fx1dx:0,   // FIX1 F-7: subY 7 -> 10.4 (rails/brackets/cross-member at 208..238 mm, FLUSH with the sill bottom 10.4 — no longer hanging 38..68 mm below the sill as unfinished blocks; front rails read as bay frame rails, rear rails hide inside the body); DESIGN otherwise (Z32 field list); rearY UNUSED by genUnder (carried flagged, never presented as consumed); NO rx field — the call-site value AX_R+8 wins in the Object.assign order (a present rx would override it)
    tank:{x0:-70,x1:-50,y0:12,y1:21,half:16,zc:-16,saddle:0},rearBeam:false,rearRails:{x0:-72,x1:-50,z:20}},   // tank in LEFT rear fender, side SECONDARY-confirmed, zc -16 = left, NOT a saddle tank over the driveshaft so saddle:0 unlike Z32; fuel tank 60 L SECONDARY
  susp:{   // double wishbones all round (VERIFIED type); field list = the copy's full double-wishbone table as consumed by suspPts; all hardpoints DESIGN sized from parts that live there; the arch sweep + full-lock test adjust them, never AE86/Eclipse/Z32 numbers as GT2000 figures
    front:{lowF:[10,8,20],lowR:[-10,8,20],upF:[8,30,24],upR:[-8,30,24],lbj:[-5.5,0],ubj:[18,0],strutTop:[0,35,26.5],springTopY:31,strutDx:0.5,strutLy:-3.5,strutLowDz:5,springLow:0.375,rack:{dx:10,y:10,half:16}},
    rear:{lowF:[9,8,20],lowR:[-9,8,20],upF:[4,30,25],upR:[-4,30,25],lbj:[-5.5,0],ubj:[18,0],strutTop:[-6.5,35,27.5],springTopY:31,strutDx:-6.5,strutLy:-2.5,strutLowDz:4.5,springLow:0.6,trail:[18,8,26],trailY:-2.5}}
};
CAR_MODULES.e30=makeE30Car('coupe');CAR_MODULES.e30t=makeE30Car('touring');
