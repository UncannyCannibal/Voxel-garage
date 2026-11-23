/* ===== HONDA CIVIC EF HATCHBACK (1987-1991, 3-door): body measured from references (ref/ef/SOURCES.md).
   Tables are millimetres: x rearward from the FRONT BUMPER TIP, y up from the ground, half-widths from the centreline.
   MEASURED = read off the Honda catalogue drawing (bp_factory_1990.png) at 12.136 mm/px along x (2500 mm wheelbase between the fitted hub circles),
   heights normalised so the roof sits at the catalogue height; plan and sections from the same drawing's top, front and rear views (12.26 mm/px, 1680 mm width)
   and checked against the Commons photos. VERIFIED = catalogue (221616.com E-EF9 SiR: 3995 x 1680 x 1335, wheelbase 2500, ground clearance 150).
   DESIGN = no view shows it (inner structure: bay, towers, tunnel, cargo floor). World units: 1 unit = 20 mm, x forward, y up, z = car's right, x = 0 mid-wheelbase. ===== */
const EF_M={
  L:3995,W:1680,H:1335,WB:2500,ovF:790,hubY:280,                    // VERIFIED L W H WB; MEASURED front overhang 790, hub height 280 (static radius of 195/60R14)
  // centreline top profile, nose (top of the bumper) -> headlamp face -> hood -> cowl -> windshield -> roof -> hatch top -> hatch glass -> hatch panel -> tail lamp face (MEASURED)
  top:[[74,570],[92,592],[116,616],[135,637],[153,661],[171,679],[201,698],[250,720],[298,738],[347,754],[396,765],[456,777],[517,789],[578,801],[638,813],[711,826],[784,837],[881,850],[978,862],[1106,878],
       [1148,903],[1245,960],[1366,1036],[1488,1106],[1609,1172],[1730,1236],[1803,1272],[1864,1298],[1925,1313],[1998,1323],[2095,1330],[2216,1335],[2337,1337],[2580,1338],[2774,1337],[2944,1332],[3066,1326],[3187,1319],
       [3300,1310],[3380,1298],[3450,1284],[3510,1265],[3560,1240],[3610,1200],[3672,1148],[3721,1094],[3769,1029],[3818,963],[3854,904],[3872,856],[3885,808],[3893,761],[3899,689],[3903,642],[3909,612]],
  belt:[[1100,868],[2592,870],[3672,894],[3909,900]],                 // window bottom line (MEASURED)
  // plan half-width of the lower body (MEASURED top view; the nose and tail corners are the wrap-around lamps)
  plan:[[74,688],[100,722],[130,748],[171,776],[225,800],[300,820],[450,832],[600,837],[800,840],[3650,840],[3760,838],[3820,830],[3860,817],[3890,800],[3909,785]],
  // lower-body section: fraction of the plan half-width by height (MEASURED front view: 840 below 500 mm, 828 at 530-750, 815 at 783)
  sLow:[[180,.935],[205,.962],[240,.98],[300,.995],[360,1],[510,1],[545,.988],[740,.984],[790,.968],[850,.952],[905,.94]],
  // greenhouse: half-width by height at the B-pillar (MEASURED front and rear views; the side glass leans in about 23 degrees)
  tumble:[[860,742],[970,742],[1006,732],[1042,714],[1079,697],[1115,680],[1152,657],[1189,632],[1225,607],[1262,582],[1298,555],[1320,528],[1333,492],[1340,380],[1346,0]],
  aPillar:{x0:1150,y0:880,h0:760,x1:1885,y1:1295,h1:545},              // windshield side edge, base -> top (MEASURED side + Gr.A top view)
  cPillar:{x0:3491,y0:1285,h0:540,x1:3817,y1:904,h1:762},              // hatch side edge, top -> bottom (MEASURED: the hatch shut line in the side view, 3530/1240 -> 3784/943; plan width from the top view)
  arch:{f:{x:793,y:300,r:376},r:{x:3290,y:305,r:376},lip:30},           // wheel openings (MEASURED fitted circles), flare lip ring 30 mm (MEASURED 34 px outer line)
  door:{front:1250,rearTop:2598,rearMid:[2598,546],rearLow:[2519,308],rearBot:[2459,225],bottom:221},   // MEASURED
  bPillar:{botF:2544,botR:2683,topF:2604,topR:2714},                   // black B-pillar (MEASURED)
  quarter:[[2714,1266],[3405,1254],[3490,1216],[3660,951],[3642,904],[3575,894],[2714,886]],            // rear quarter window (MEASURED)
  hood:{x0:171,x1:1065,half:700},                                       // hood front edge, cowl shut line, hood/fender seam (MEASURED side + top view)
  hatch:{hingeX:3300,roofHalf:480,glassBot:904,lampTop:779,lampBot:642,garnishHalf:325,sideHalf:735,bottom:600},     // MEASURED rear view and photos
  molding:{x0:1175,x1:2910,y0:513,y1:544},                              // black side molding (MEASURED, photos: front arch to rear arch)
  rocker:180,bottomF:250,bottomR:250,                                   // MEASURED sill; DESIGN hidden panel bottoms behind the bumpers
  // inner structure (DESIGN, sized to clear the parts that live there; the collision suite checks them)
  bay:{x0:150,x1:1030,half:545,floor:240,upY:700,upHalf:675},                              // engine bay: radiator support face .. firewall, between the inner fender aprons
  towerF:{x:793,dx:210,zIn:440,top:800},wheelF:{zIn:440,bayHalf:420},   // front towers: the wheelhouse top round the damper and the upper wishbone's pivots (DESIGN);                                 // front damper towers in the bay
  tubR:{zIn:585},towerR:{x:3350,dx:170,zIn:470,top:840},   // rear damper towers: 340 mm long pockets round the upper wishbone's pivots and the damper standing behind it (ef_rig.js), bulging 115 mm into the cargo bay                 // rear wheel tubs and damper towers in the cargo bay
  tunnel:{x0:1030,x1:2600,half:150,top:270},exhCh:{x0:2300,x1:3880,z0:-440,z1:440,top:280},floorC:230,floorR:300,                            // exhaust tunnel
  cargoFloor:520
};

function makeEF(){
  const M=EF_M,XM=M.ovF+M.WB/2,wx=m=>(XM-m)/20,u=m=>m/20,mm=x=>XM-x*20;
  const g={S:M,wx,u,mm};
  const tab=(T,v)=>{if(v<=T[0][0])return T[0][1];for(let i=0;i<T.length-1;i++){const a=T[i],b=T[i+1];if(v<=b[0])return a[1]+(b[1]-a[1])*(v-a[0])/(b[0]-a[0]);}return T[T.length-1][1];};
  g.tab=tab;
  g.NOSE_X=wx(74);g.REAR_X=wx(3909);g.AX_F=wx(M.ovF);g.AX_R=wx(M.ovF+M.WB);g.WR=u(M.hubY);g.ROCK=u(M.rocker);g.BELT=u(869);g.ROOF=u(1338);g.halfW=u(840);
  const TOPW=M.top.map(([x,y])=>[wx(x),u(y)]);g.TOP=TOPW;
  const topC=g.topC=x=>{const m=mm(x);if(m<M.top[0][0]||m>M.top[M.top.length-1][0])return -1;return u(tab(M.top,m));};
  // crown: off-centre the hood, windshield and hatch surfaces fall away (MEASURED: windshield corners 125 mm behind the centre at the base -> 70 mm lower; hood 25 mm at the seam)
  const crownMM=m=>{if(m<1106)return 30;if(m<1885)return 70*(1-(m-1106)/779);if(m<3300)return 0;return 45*clampv((m-3300)/250,0,1);};
  g.crown=x=>u(crownMM(mm(x)));
  const top=g.top=(x,z)=>{const c=topC(x);if(c<0)return -1;const k=Math.abs(z)/42;return c-g.crown(x)*k*k;};
  g.topY=x=>topC(x)<0?(x>0?20:40):topC(x);
  const belt=g.belt=x=>u(tab(M.belt,mm(x)));
  const plan=g.plan=x=>u(tab(M.plan,mm(x)));
  const sLow=y=>tab(M.sLow,y*20);
  // greenhouse half-width: the B-pillar section shifted with the local roof (max 40 mm), limited by the A-pillar and C-pillar envelopes
  const A=M.aPillar,C=M.cPillar;
  const aEnv=(x,y)=>{const t=clampv((y*20-A.y0)/(A.y1-A.y0),0,1),xa=A.x0+(A.x1-A.x0)*t,ha=A.h0+(A.h1-A.h0)*t,m=mm(x);return u(ha+Math.max(0,m-xa)*.45);};
  const cEnv=(x,y)=>{const t=clampv((C.y0-y*20)/(C.y0-C.y1),0,1),xc=C.x0+(C.x1-C.x0)*t,hc=C.h0+(C.h1-C.h0)*t,m=mm(x);return u(hc+Math.max(0,xc-m)*.45);};
  g.aEnv=aEnv;g.cEnv=cEnv;
  const gh=g.gh=(x,y)=>{const tc=topC(x),sh=clampv(1338-tc*20,0,40);return Math.min(u(tab(M.tumble,y*20+sh)),aEnv(x,y),cEnv(x,y));};
  // half-width of the body side at (x,y): lower body below the belt, a 30 mm rolled shoulder, then the greenhouse
  const EDGE_R=1.6;
  const halfAt=g.halfAt=(x,y)=>{
    const b=belt(x),lo=plan(x)*sLow(Math.min(y,b));
    let r;
    if(y<=b)r=lo;else{const gg=gh(x,y);r=y<b+1.5?lo+(gg-lo)*sm(b,b+1.5,y):gg;}
    // rolled edge where the hood / deck meets the side (below the belt only; the greenhouse has its own section)
    const tc=topC(x);if(tc>0&&tc<b+.5){const dt=tc-y;if(dt>=0&&dt<EDGE_R){const q=EDGE_R-dt;r-=EDGE_R-Math.sqrt(Math.max(0,EDGE_R*EDGE_R-q*q));}}
    if(y>=g.ROCK&&y<g.ROCK+1.5){const q=g.ROCK+1.5-y;r-=1.5-Math.sqrt(Math.max(0,2.25-q*q));}
    return r;};
  // nose and tail faces behind the bumpers (below the lamp faces)
  g.frontLimit=y=>y*20<570?wx(130):g.NOSE_X;g.rearLimit=y=>y*20<612?wx(3880):g.REAR_X;
  g.bottom=x=>{const m=mm(x);return u(m<420?M.bottomF:(m<1030?280:(m>3660?M.bottomR:M.rocker)));};   // DESIGN: the fender aprons beside the bay end 280 mm up (the lower arms pass beneath)
  g.bottomZ=(x,z)=>{const m=mm(x),b=g.bottom(x);return (m>=1030&&m<=3660&&Math.abs(z)<u(m>M.arch.r.x-M.arch.r.r?M.tubR.zIn:560))?u(m>=2300?M.floorR:M.floorC):b;};   // the 180 mm sill runs only between the arches; beside the rear wheel the floor reaches the tub wall   // DESIGN: the floor pan sits 230 mm up between the 180 mm sills, 300 mm under the rear seat (over the tank and exhaust)
  g.YBOT=g.bottom;
  g.ARCH_R=u(M.arch.f.r);g.ARCH_F={x:wx(M.arch.f.x),y:u(M.arch.f.y),r:u(M.arch.f.r)};g.ARCH_RR={x:wx(M.arch.r.x),y:u(M.arch.r.y),r:u(M.arch.r.r)};
  g.archLip=(x,y)=>{let l=0;for(const a of [g.ARCH_F,g.ARCH_RR]){const d=Math.hypot(x-a.x,y-a.y);if(d>=a.r&&d<a.r+u(M.arch.lip))l=Math.max(l,.2*(1-(d-a.r)/u(M.arch.lip)));}return l;};
  g.profDist=(x,y)=>{let best=1e9;const T=TOPW;for(let i=0;i<T.length-1;i++){const a=T[i],b=T[i+1],dx=b[0]-a[0],dy=b[1]-a[1],L=dx*dx+dy*dy,t=L?clampv(((x-a[0])*dx+(y-a[1])*dy)/L,0,1):0;best=Math.min(best,Math.hypot(x-(a[0]+dx*t),y-(a[1]+dy*t)));}return best;};
  g.profDistZ=(x,y,z)=>{const k=Math.abs(z)/42;return g.profDist(x,y+g.crown(x)*k*k);};
  g.noseX=az=>g.NOSE_X;g.rearX=az=>g.REAR_X;
  // windshield and A/C-pillar lines used by panels, glass and the rig
  g.xA=y=>wx(A.x0+(A.x1-A.x0)*clampv((y*20-A.y0)/(A.y1-A.y0),0,1));
  g.xC=y=>wx(C.x0+(C.x1-C.x0)*clampv((C.y0-y*20)/(C.y0-C.y1),0,1));
  g.DOOR_F=wx(M.door.front);g.DOOR_R=wx(M.door.rearTop);
  g.doorRear=y=>{const D=M.door,m=y*20;if(m>=D.rearMid[1])return wx(D.rearTop);if(m>=D.rearLow[1])return wx(D.rearMid[0]+(D.rearLow[0]-D.rearMid[0])*(D.rearMid[1]-m)/(D.rearMid[1]-D.rearLow[1]));
    return wx(D.rearLow[0]+(D.rearBot[0]-D.rearLow[0])*(D.rearLow[1]-m)/(D.rearLow[1]-D.rearBot[1]));};
  g.HOOD_X0=wx(M.hood.x1);g.HOOD_X1=wx(M.hood.x0);g.HOOD_HALF=u(M.hood.half);
  g.HATCH_X=wx(M.hatch.hingeX);
  // hinge lines sit 20 mm above the panel edge (gooseneck hinges), so the edges swing clear of the cowl and the roof
  g.HOOD_HINGE=[g.HOOD_X0,topC(g.HOOD_X0)+1.0];g.HATCH_HINGE=[g.HATCH_X,topC(g.HATCH_X)+1.0];
  return g;
}

/* ---- body panels (10 mm cells): solid -> arches, towers, bay, tunnel -> panels taken out -> 2-layer skin -> door apertures -> windows and glass -> trim colours -> shut lines ---- */
function buildEFBody(g){
  const M=EF_M,{NOSE_X,REAR_X,AX_F,AX_R,WR,BELT,ROOF,u,wx,halfAt,top,topC,belt}=g;
  const INT=0x2a2b2e,UNDER=0x15171a,SASH=0x141517,GASK=0x131416,SEAM=0x1d1112,MOLD=0x18191b;
  const hw=g.halfW,ext=Math.ceil(hw+1.5);
  const S0=hgrid(Math.floor(REAR_X-2),Math.ceil(NOSE_X+1),0,ROOF+2,-ext,ext);
  const solidAt=(x,y,z)=>{if(x>g.frontLimit(y)||x<g.rearLimit(y))return false;if(y<g.bottomZ(x,z))return false;if(typeof efBumperRelief==='function'&&efBumperRelief(g,x,y,z))return false;
    if(y>top(x,z))return false;return Math.abs(z)<=halfAt(x,y)+g.archLip(x,y);};
  g.solidAt=solidAt;   // the measured outer volume: the painted skin's surface net is snapped to it (surfnet.js)
  // 1. solid
  eachCell(S0,null,(i,j,k,n)=>{const x=i/HR,y=j/HR,z=k/HR;if(solidAt(x,y,z))S0.d[n]=1;});
  // depth of every solid cell below the outside surface (cells, 6-neighbour steps), measured on the plain solid so inner carves do not count
  const DEP=new Uint8Array(S0.d.length);{const sx=S0.ny*S0.nz,sy=S0.nz;let front=[];
    for(let p=0;p<S0.d.length;p++)if(S0.d[p]>=0){const i=Math.floor(p/sx),j=Math.floor((p%sx)/sy),k=p%sy;
      if(i===0||j===0||k===0||i===S0.nx-1||j===S0.ny-1||k===S0.nz-1||S0.d[p+sx]<0||S0.d[p-sx]<0||S0.d[p+sy]<0||S0.d[p-sy]<0||S0.d[p+1]<0||S0.d[p-1]<0){DEP[p]=1;front.push(p);}}
    for(let dd=2;dd<=8&&front.length;dd++){const nx=[];for(const p of front)for(const q of [p+sx,p-sx,p+sy,p-sy,p+1,p-1])if(q>=0&&q<S0.d.length&&S0.d[q]>=0&&!DEP[q]){DEP[q]=dd;nx.push(q);}front=nx;}}
  // 2. wheel openings: cylinders through the outer wall, front wheelhouse and rear tub walls inboard
  const AF=g.ARCH_F,AR=g.ARCH_RR,zF=u(M.wheelF.zIn),zR=u(M.tubR.zIn);
  carveW(S0,null,(x,y,z)=>(Math.abs(z)>zF&&Math.hypot(x-AF.x,y-AF.y)<AF.r)||(Math.abs(z)>zR&&Math.hypot(x-AR.x,y-AR.y)<AR.r));
  // damper towers (front in the bay, rear in the cargo bay): pockets above the wheelhouses for the damper tops
  const TF=M.towerF,TR=M.towerR,deep=(x,y,z)=>{const i=Math.round(x*HR),j=Math.round(y*HR),k=Math.round(z*HR);if(!S0.inb(i,j,k))return false;const v=DEP[S0.ix(i,j,k)];return !v||v>3;};   // pockets keep a 30 mm skin under every outside surface (no holes in the fender tops)
  carveW(S0,null,(x,y,z)=>Math.abs(x-wx(TF.x))<=u(TF.dx)&&Math.abs(z)>u(TF.zIn)&&Math.abs(z)<halfAt(x,y)-2&&y<u(TF.top-20)&&y>AF.y&&deep(x,y,z));   // the fender skin outboard of the tower stays
  carveW(S0,null,(x,y,z)=>Math.abs(x-wx(TR.x))<=u(TR.dx)&&Math.abs(z)>u(TR.zIn)&&(Math.abs(z)<halfAt(x,y)-2||Math.hypot(x-AR.x,y-AR.y)<AR.r)&&y<u(TR.top-20)&&y>u(190)&&(deep(x,y,z)||Math.hypot(x-AR.x,y-AR.y)<AR.r));   // rear towers reach down to the floor so the damper and upper arms sit inside them
  // 3. engine bay (open underneath), tunnel
  const B=M.bay,nearW=x=>Math.abs(x-AF.x)<=AF.r+2;   // beside the front wheels the bay narrows to the wheelhouse walls (the tyre needs the room at full lock)
  carveW(S0,null,(x,y,z)=>x<=wx(B.x0)&&x>=wx(B.x1)&&Math.abs(z)<=(y>u(B.upY)?u(B.upHalf):(nearW(x)&&y>u(400)?u(M.wheelF.bayHalf):u(B.half)))&&y>=0&&y<top(x,z)-1.6);   // above the wheelhouses the bay opens out to the fender flanges under the hood edges   // below 400 mm the wheelhouse is open to the bay (half-shafts, arms, tie rods pass)
  const T=M.tunnel;carveW(S0,null,(x,y,z)=>x<=wx(T.x0)&&x>=wx(T.x1)&&Math.abs(z)<=u(T.half)&&y<=u(T.top));
  const XC=M.exhCh;carveW(S0,null,(x,y,z)=>x<=wx(XC.x0)&&x>=wx(XC.x1)&&z>=u(XC.z0)&&z<=u(XC.z1)&&y<=u(XC.top));   // exhaust channel under the rear seat and cargo floor (silencer on the right)
  // 4. moving panels out of the solid (before the skin, so each gets its own two-layer shell)
  const hood=hgrid(g.HOOD_X0-.5,NOSE_X+.5,u(640),ROOF,-g.HOOD_HALF-.5,g.HOOD_HALF+.5);
  const HT=2.4;
  const take=(dst,pred)=>eachCell(dst,null,(i,j,k)=>{const x=i/HR,y=j/HR,z=k/HR;if(!S0.inb(i,j,k))return;const n=S0.ix(i,j,k);if(S0.d[n]<0)return;if(pred(x,y,z)){dst.d[dst.ix(i,j,k)]=1;S0.d[n]=-1;}});
  take(hood,(x,y,z)=>x>=g.HOOD_X0&&x<=g.HOOD_X1+.6&&Math.abs(z)<=g.HOOD_HALF&&y>=u(668)&&top(x,z)-y<HT);
  // hatch: glass part + panel above the lamps (full width between the quarter panels) + the centre garnish between the tail lamps
  const H=M.hatch,hx=g.HATCH_X;
  const hatchHalf=y=>{const m=y*20;if(m>=H.glassBot)return Math.min(g.cEnv(g.xC(y),y)+.6,u(H.sideHalf));if(m>=H.lampTop)return u(H.sideHalf);return u(H.garnishHalf);};
  const hatch=hgrid(REAR_X-.5,hx+.5,u(H.bottom)-1,ROOF+1,-u(H.sideHalf)-1,u(H.sideHalf)+1);
  const depthAt=(x,y,z)=>{const i=Math.round(x*HR),j=Math.round(y*HR),k=Math.round(z*HR);if(!S0.inb(i,j,k))return 99;const v=DEP[S0.ix(i,j,k)];return v||99;};
  // the outer 50 mm of the tail inside the hatch outline: behind the C-pillar line the whole width is hatch; ahead of it only cells well inboard of the side (the top skin, not the quarter panel)
  const inHatch=(x,y,z,inset,dmax)=>{if(x>hx||y<u(H.bottom)||Math.abs(z)>hatchHalf(y)-inset||depthAt(x,y,z)>dmax)return false;const m=g.mm(x);
    if(y*20<H.glassBot)return m>=3780+inset*20;return m>=g.mm(g.xC(y))-20+inset*20||Math.abs(z)<=u(H.roofHalf)-inset;};   // ahead of the C-pillar line the hatch is the roof panel inside the drip rails
  take(hatch,(x,y,z)=>inHatch(x,y,z,0,5));

  // doors: outer 84 mm of the side between the shut lines, plus the window frame above the belt
  const D=M.door,dz0=ext;
  const doorL=hgrid(g.DOOR_R-.5,g.DOOR_F+.5,u(D.bottom)-1,ROOF,-dz0,0),doorR=hgrid(g.DOOR_R-.5,g.DOOR_F+.5,u(D.bottom)-1,ROOF,0,dz0);
  const inDoor=(x,y,z)=>{if(y<u(D.bottom)||x>g.DOOR_F||x<g.doorRear(y))return false;if(y<=belt(x))return Math.abs(z)>=halfAt(x,y)-4.2;return false;};
  take(doorL,(x,y,z)=>z<0&&inDoor(x,y,z));take(doorR,(x,y,z)=>z>0&&inDoor(x,y,z));
  // 5. skin
  const PFRONT=wx(130),PREAR=wx(3880);
  const inArch=(x,y,z)=>{for(const a of [AF,AR]){if(Math.hypot(x-a.x,y-a.y)<a.r+.6&&Math.abs(z)<halfAt(x,y)-1.2)return true;}
    return (Math.abs(x-wx(TF.x))<=u(TF.dx)+.6&&Math.abs(z)>u(TF.zIn)-.6&&y<u(TF.top)&&y>AF.y&&Math.abs(z)<halfAt(x,y)-1.2)||(Math.abs(x-wx(TR.x))<=u(TR.dx)+.6&&Math.abs(z)>u(TR.zIn)-.6&&y<u(TR.top)&&y>u(170)&&Math.abs(z)<halfAt(x,y)-1.2);};
  shellHi(S0,(x,y,z,inner)=>{
    if(inArch(x,y,z)&&depthAt(x,y,z)>1)return UNDER;      // wheelhouses and damper towers in underbody black (never the car's outside skin, e.g. the fender tops over the towers)
    if(inner)return INT;
    if(y<u(205))return UNDER;
    if(x>PFRONT-.6&&y<u(570))return UNDER;                 // panel behind the front bumper
    if(x<PREAR+.6&&y<u(612))return UNDER;                  // panel behind the rear bumper
    if(typeof efBumperRelief==='function'&&efBumperRelief(g,x,y,z,40))return UNDER;   // the cut-back skin behind the bumpers' side wings: dark, as it reads in the gaps on the real car
    {const m=g.mm(x);if((m<450&&y<u(EFD.bumperF.bot))||(m>3640&&y<u(EFD.bumperR.bot)))return UNDER;}   // the body below the bumpers' bottom edges
    return PAINT;},2);
  const bodyG=S0;
  // the opening under the hatch: the body skin just below it is cut away (into the hollow cargo bay), leaving a 30 mm flange round the edge for the hatch to close on.
  // Above the glass's bottom edge the whole depth goes: the opening is the hatch's outline (owner's photos: no body inside it but the flange; the solid that
  // stood under the hatch's wrap-round sides had been skinned into two sloping panels inside the rear corners)
  carveW(S0,null,(x,y,z)=>x<=hx-1.5&&inHatch(x,y,z,1.5,y*20>=H.glassBot?99:12));
  // where the hatch wraps round onto the sides, the body stops at its shut line: only a 50 mm lip of the quarter panel's outer skin stays there for the hatch's
  // side edge to close on (the band 30 mm ahead of the shut line was left standing across the whole D-pillar: two sloping walls inside the rear corners)
  carveW(S0,null,(x,y,z)=>{if(y*20<H.glassBot||x>hx-1.5||y<u(H.bottom))return false;const az=Math.abs(z);if(az<=u(H.roofHalf)-3||az>hatchHalf(y)-2.5)return false;
    return g.mm(x)>=g.mm(g.xC(y))-50&&depthAt(x,y,z)>2;});
  // ... and below the glass nothing of the body stays in front of the hatch inside that flange (the solid left behind the hatch's lower panel was skinned into a
  // wall across the opening): body cells up to 300 mm in front of the hatch's inner face go
  {const inner=new Map();for(const [i,j,k] of hatch.list()){const key=j+','+k;if(!inner.has(key)||i>inner.get(key))inner.set(key,i);}
   for(const [key,f] of inner){const [j,k]=key.split(',').map(Number),y=j/HR,z=k/HR;if(y*20>=H.glassBot||y<u(H.bottom)||Math.abs(z)>hatchHalf(y)-1.5)continue;
     for(let i=f+1;i<=f+30;i++)if(S0.inb(i,j,k))S0.d[S0.ix(i,j,k)]=-1;}}
  // the rubber seal round the opening: the body's flange cells next to the closed hatch (under its outer paint layer) are black weatherstrip (owner's photo
  // ref/ef/cargo_cover2.png: a black seal all round the opening, on the D-pillars, the roof's rear edge and the lock panel)
  {const sx=S0.ny*S0.nz,sy=S0.nz;for(let p=0;p<S0.d.length;p++){if(S0.d[p]<0||DEP[p]<2)continue;const i=Math.floor(p/sx)+S0.x0,j=Math.floor((p%sx)/sy)+S0.y0,k=p%sy+S0.z0;
     for(const [a,b,c] of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]])if(hatch.get(i+a,j+b,k+c)>=0){S0.d[p]=GASK;break;}}}
  // paint only on the original outside surface (depth 1); the second layer stays as the panel's inner skin, deeper cells are the inner frame
  const INT2=0x2b2c2f,byDepth=(x,y,z)=>{const d=depthAt(x,y,z);return d<=1?PAINT:(d===2?INT2:INT);};
  shellHi(hood,(x,y,z,inner)=>byDepth(x,y,z),2);
  shellHi(hatch,(x,y,z,inner)=>byDepth(x,y,z),2);
  const doorSkin=(x,y,z,inner)=>depthAt(x,y,z)<=1?PAINT:0x3a3b3f;
  shellHi(doorL,doorSkin,2);shellHi(doorR,doorSkin,2);
  // the hood keeps a frame of inner panel (x-brace) like a real hood; the hatch keeps its outer skin and a frame round the glass
  eachCell(hood,null,(i,j,k,n)=>{if(hood.d[n]!==INT)return;const x=i/HR,z=k/HR,x0=g.HOOD_X0,x1=g.HOOD_X1;
    const keep=x<=x0+1.5||x>=x1-1.5||Math.abs(z)>=g.HOOD_HALF-1.2||Math.abs(Math.abs(z)-(x-x0)*.75)<1.1||Math.abs(x-(x0+x1)/2)<1.1;if(!keep)hood.d[n]=-1;});
  // front damper towers: the pocket gets its cap, 20 mm thick, which the damper's top mount bolts under, and the inner apron toward the bay, which the upper
  // wishbone's pivots bolt to (DESIGN: the pocket is the measured wheelhouse top; cap at 780-800 mm, apron 420 mm from the centreline above the half-shaft).
  // Both stay one cell under the hood wherever the hood is above them; painted like the rest of the bay.
  {const x0=wx(TF.x)-u(TF.dx),x1=wx(TF.x)+u(TF.dx),zi=u(TF.zIn),capY=u(TF.top-20),clear=(i,j,k)=>hood.get(i,j,k)<0&&hood.get(i,j+1,k)<0&&hood.get(i,j+2,k)<0;
   eachCell(bodyG,[x0,x1,u(340),u(TF.top)+1,-ext,ext],(i,j,k,n)=>{if(bodyG.d[n]>=0)return;const x=i/HR,y=j/HR,z=k/HR,az=Math.abs(z);if(x<x0||x>x1)return;
     const cap=y>=capY-.25&&y<=capY+.75&&az>=zi-1.25&&az<=halfAt(x,y)-1&&clear(i,j,k),wall=az>=zi-1.25&&az<=zi-.75&&y>=u(340)&&y<capY-.25&&clear(i,j,k);
     if(cap||wall)bodyG.d[n]=PAINT;});}
  // 6. door apertures through the side (sill, pillars and the roof rail stay)
  const DB=u(D.bottom);
  carveW(bodyG,[g.DOOR_R-1,g.DOOR_F+1,DB,ROOF,-ext,ext],(x,y,z)=>{if(y<DB+1||x>g.DOOR_F-1||x<g.doorRear(y)+1)return false;if(y>belt(x))return false;return Math.abs(z)>=halfAt(x,y)-7;});
  // 7. windows: door glass (A-pillar .. B-pillar), quarter glass, windshield, hatch glass
  const P=M.bPillar,bpF=y=>wx(P.botF+(P.topF-P.botF)*clampv((y*20-869)/(1267-869),0,1)),bpR=y=>wx(P.botR+(P.topR-P.botR)*clampv((y*20-872)/(1269-872),0,1));
  const roofEdge=x=>topC(x)-2.6;                                            // side-glass top edge sits just under the roof rail
  const sail=y=>wx(1420-1.2*(y*20-869));   // door glass front edge at the belt; the black sail triangle in front of it carries the mirror (MEASURED photos)
  const dgIn=(x,y)=>y>belt(x)+.4&&y<roofEdge(x)&&x>bpF(y)+.3&&x<g.xA(y)-3.2&&x<sail(y);
  const qPoly=M.quarter.map(([a,b])=>[wx(a),u(b)]);
  const inPoly=(x,y,poly)=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,yi]=poly[i],[xj,yj]=poly[j];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))c=!c;}return c;};
  const qgIn=(x,y)=>inPoly(x,y,qPoly)&&x<bpR(y)-.4;
  const wsX0=wx(1885),wsX1=wx(1106);
  const wsIn=(x,y,z)=>x<=wsX1&&x>=wsX0&&Math.abs(z)<g.aEnv(g.xA(y),y)-3.2&&y>u(890);
  const rwIn=(x,y,z)=>x<=g.xC(1285/20)+1.5&&y>u(H.glassBot)+.6&&y<u(1278)&&Math.abs(z)<g.cEnv(g.xC(y),y)-2.4&&x<hx;
  const sideOpen=(x,y,z)=>Math.abs(z)>=halfAt(x,y)-4.5;
  carveW(bodyG,[REAR_X,NOSE_X,BELT-1,ROOF+1,-ext,ext],(x,y,z)=>sideOpen(x,y,z)&&(dgIn(x,y)||qgIn(x,y)));
  const glass={},GL=0x5c8aa0;
  glass.ws=hgrid(wsX0-.5,wsX1+.5,BELT,ROOF+1,-ext,ext);glass.rw=hgrid(REAR_X-.5,hx+.5,u(H.glassBot)-.5,ROOF+1,-ext,ext);
  const skinToGlass=(Gp,Gg,inR)=>eachCell(Gp,null,(i,j,k,n)=>{const v=Gp.d[n];if(v<0)return;const x=i/HR,y=j/HR,z=k/HR;if(!inR(x,y,z))return;if(v===PAINT)Gg.set(i,j,k,GL);Gp.d[n]=-1;});
  skinToGlass(bodyG,glass.ws,(x,y,z)=>wsIn(x,y,z)&&y>top(x,z)-3.6);
  skinToGlass(hatch,glass.rw,(x,y,z)=>rwIn(x,y,z));
  // the door's window frame: body cells round the door glass (A-pillar trim strip .. B-pillar) move to the door, painted black like the EF's sash; its rear edge is the door's
  // rear shut line carried up from the belt (the front 54 mm of the black B-pillar trim is on the door frame), so no body cell is left over the door's rear corner
  eachCell(bodyG,[g.DOOR_R-1,g.DOOR_F+2,BELT,ROOF,-ext,ext],(i,j,k,n)=>{if(bodyG.d[n]<0)return;const x=i/HR,y=j/HR,z=k/HR;
    if(y<=belt(x)||y>roofEdge(x)+1.1)return;if(x>g.xA(y)-1.7||x<Math.min(bpF(y),g.doorRear(y)))return;if(!sideOpen(x,y,z))return;
    const Dd=z<0?doorL:doorR;Dd.set(i,j,k,y<=belt(x)+.4?bodyG.d[n]:SASH);bodyG.d[n]=-1;});   // the 10 mm layer just over the belt is the door's top edge (it keeps its colour); above it, the black sash
  // black B-pillar appliqué and the black triangle (mirror sail) at the front of the door glass
  eachCell(bodyG,[wx(P.topR)-1,wx(P.botF)+1,BELT,ROOF,-ext,ext],(i,j,k,n)=>{if(bodyG.d[n]!==PAINT)return;const x=i/HR,y=j/HR,z=k/HR;if(y>belt(x)&&y<roofEdge(x)+.6&&x<=bpF(y)&&x>=bpR(y))bodyG.d[n]=SASH;});
  // glass slabs, flush with the outer surface
  for(const kk of ['dgL','dgR','qgL','qgR'])glass[kk]=hgrid(REAR_X+10,NOSE_X-10,BELT-1,ROOF+1,kk.endsWith('L')?-ext:0,kk.endsWith('L')?0:ext);
  for(let i=glass.dgL.x0;i<=glass.dgL.x1;i++)for(let j=glass.dgL.y0;j<=glass.dgL.y1;j++){const x=i/HR,y=j/HR;if(y<BELT-.5||y>ROOF)continue;const h=halfAt(x,y);
    for(const sd of [-1,1]){const zc=Math.round((h-.9)*HR);
      if(dgIn(x,y))for(let q=0;q<2;q++)(sd<0?glass.dgL:glass.dgR).set(i,j,sd*(zc-q),GL);
      if(qgIn(x,y))for(let q=0;q<2;q++)(sd<0?glass.qgL:glass.qgR).set(i,j,sd*(zc-q),GL);}}
  // the door glass sits in its frame: door cells where the pane is go to the glass
  for(const [Dd,Gg] of [[doorL,glass.dgL],[doorR,glass.dgR]])for(const [i,j,k] of Gg.list())Dd.set(i,j,k,-1);
  // rubber gaskets round the windshield and the hatch glass
  const nearGlass=(Gg,i,j,k)=>{for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)for(let c=-1;c<=1;c++)if(Gg.get(i+a,j+b,k+c)>=0)return true;return false;};
  eachCell(bodyG,[wsX0-1,wsX1+1,BELT-1,ROOF+1,-ext,ext],(i,j,k,n)=>{if(bodyG.d[n]!==PAINT)return;if(nearGlass(glass.ws,i,j,k))bodyG.d[n]=GASK;});
  eachCell(hatch,null,(i,j,k,n)=>{if(hatch.d[n]!==PAINT)return;if(nearGlass(glass.rw,i,j,k))hatch.d[n]=GASK;});
  // side molding (black band across the doors and quarters)
  const MO=M.molding,mold=(Gg)=>eachCell(Gg,[wx(MO.x1),wx(MO.x0),u(MO.y0),u(MO.y1),-ext,ext],(i,j,k,n)=>{if(Gg.d[n]!==PAINT)return;const x=i/HR,y=j/HR,z=k/HR;if(Math.abs(z)>=halfAt(x,y)-1.1)Gg.d[n]=MOLD;});
  mold(bodyG);mold(doorL);mold(doorR);
  // shut lines in the outer skin
  const seam=(Gg,b,pred)=>eachCell(Gg,b,(i,j,k,n)=>{if(Gg.d[n]!==PAINT)return;const x=i/HR,y=j/HR,z=k/HR;if(pred(x,y,z))Gg.d[n]=SEAM;});
  seam(bodyG,[g.HOOD_X0-1.2,g.HOOD_X0+.4,u(640),ROOF,-hw,hw],(x,y,z)=>x<=g.HOOD_X0+.1&&Math.abs(z)<=g.HOOD_HALF+.5&&y>top(x,z)-1.5);
  seam(bodyG,[g.HOOD_X0,NOSE_X,u(640),ROOF,-hw,hw],(x,y,z)=>Math.abs(Math.abs(z)-(g.HOOD_HALF+.6))<.3&&x>=g.HOOD_X0+.5&&y>top(x,z)-1.6);
  seam(bodyG,[g.DOOR_F+.1,g.DOOR_F+.8,DB,BELT+1,-ext,ext],(x,y,z)=>x>g.DOOR_F+.1&&x<=g.DOOR_F+.55&&y>=DB+.5&&y<=belt(x)&&Math.abs(z)>=halfAt(x,y)-4.2);
  seam(bodyG,[g.DOOR_R-6,g.DOOR_R+.2,DB,BELT+1,-ext,ext],(x,y,z)=>{const xr=g.doorRear(y);return x<xr-.1&&x>=xr-.55&&y>=DB+.5&&y<=belt(x)&&Math.abs(z)>=halfAt(x,y)-4.2;});
  seam(bodyG,[g.DOOR_R-6,g.DOOR_F,DB-1,DB+.5,-ext,ext],(x,y,z)=>y<DB+.5&&y>=DB-.1&&x>=g.doorRear(y)&&x<=g.DOOR_F&&Math.abs(z)>=halfAt(x,y)-4.2);
  seam(bodyG,[hx-.8,hx+.5,u(1200),ROOF+1,-ext,ext],(x,y,z)=>x>=hx-.6&&x<=hx+.2&&Math.abs(z)<=hatchHalf(y)+.5&&y>top(x,z)-1.5);
  seam(bodyG,[REAR_X,hx,u(H.bottom)-1,ROOF+1,-ext,ext],(x,y,z)=>{const hh=hatchHalf(y);return Math.abs(Math.abs(z)-(hh+.6))<.3&&g.profDistZ(x,y,z)<1.4&&x<=hx;});
  const hi={body:bodyG,hood,trunk:hatch,doorL,doorR,glass};
  const CB=[Math.floor(REAR_X-3),Math.ceil(NOSE_X+3),0,Math.ceil(ROOF+2),-ext-1,ext+1],out={hi,HR};
  out.body=coarsen(bodyG,4,CB);out.hood=coarsen(hood,4,CB);out.trunk=coarsen(hatch,4,CB);out.doorL=coarsen(doorL,4,CB);out.doorR=coarsen(doorR,4,CB);
  out.glass={};for(const kk in glass)out.glass[kk]=coarsen(glass[kk],2,CB);
  out.rwOnLid=true;out.hatchHalf=hatchHalf;
  return out;
}
if(typeof module!=='undefined')module.exports={EF_M,makeEF,buildEFBody};
