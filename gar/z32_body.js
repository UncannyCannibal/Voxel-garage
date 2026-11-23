/* ===== NISSAN FAIRLADY Z / 300ZX (Z32, 1989-2000), 2-seater T-bar roof: body measured from references (ref/z32/SOURCES.md).
   Tables are millimetres: x rearward from the FRONT BUMPER TIP, y up from the ground, half-widths from the centreline.
   MEASURED = read off the-blueprints.com "Nissan 300ZX (1995)" vector drawing (bp_tb_1995.png, ref/z32/tools/measure.py): along x 5.799 mm/px (bumper to bumper =
   the JDM catalogue 4310 mm), heights 5.845 mm/px (roof normalised to the catalogue 1245 mm), plan from the top view (5.737 mm/px across, 1790 mm), sections from
   the front and rear views; checked against the Commons photographs (ph_*.jpg). VERIFIED = catalogue (Nissan Heritage / carfromjapan E-CZ32: 4310 x 1790 x 1245,
   wheelbase 2450, tread 1495 / 1535). DESIGN = no view shows it (inner structure: bay, towers, tunnel, cargo floor).
   World units: 1 unit = 20 mm, x forward, y up, z = the car's right, x = 0 mid-wheelbase. ===== */
const Z32_M={
  L:4310,W:1790,H:1245,WB:2450,ovF:928,hubY:305,                  // VERIFIED L W H WB; MEASURED front overhang (fitted hub circle 929.7); hub 305 = loaded radius of the stock 225/50R16 (CALCULATED)
  // centreline top profile: bumper face -> hood nose -> hood -> cowl -> windshield -> roof (T-bar) -> roof's rear lip -> hatch glass -> hatch panel -> lip -> tail-lamp face (MEASURED)
  top:[[0,430],[12,486],[47,505],[81,520],[116,539],[151,559],[186,580],[221,599],[255,617],[290,631],[325,645],[360,659],[394,672],[429,685],[464,697],[499,709],[534,722],[568,732],[603,744],[638,756],
       [673,766],[708,775],[742,785],[777,792],[812,797],[847,802],[882,808],[916,815],[951,820],[986,826],[1021,831],[1056,837],[1090,841],[1125,845],[1160,850],[1195,853],[1230,856],[1264,859],[1299,861],
       [1334,863],[1369,864],[1404,866],[1438,880],[1473,898],[1508,913],[1543,930],[1578,950],[1612,968],[1647,987],[1682,1003],[1717,1020],[1752,1037],[1786,1053],[1821,1069],[1856,1086],[1891,1102],
       [1925,1117],[1960,1131],[1995,1146],[2030,1161],[2065,1176],[2099,1190],[2134,1201],[2169,1209],[2204,1216],[2239,1222],[2273,1227],[2308,1231],[2343,1236],[2378,1239],[2413,1242],[2447,1244],[2600,1245],
       [2656,1242],[2691,1239],[2726,1236],[2761,1231],[2795,1226],[2830,1221],[2865,1216],[2900,1211],[2935,1206],[2969,1201],[3004,1195],[3039,1190],[3074,1184],[3109,1178],[3143,1172],[3175,1165],[3205,1142],
       [3248,1133],[3283,1127],[3317,1120],[3352,1114],[3387,1108],[3422,1100],[3456,1091],[3491,1082],[3526,1073],[3561,1064],[3596,1056],[3630,1048],[3665,1040],[3700,1032],[3735,1023],[3770,1015],[3804,1009],
       [3839,1003],[3874,998],[3909,994],[3932,992],[3990,986],[4060,978],[4110,970],[4140,955],[4152,925],[4164,856],[4188,769],[4202,693],[4211,658]],
  // window bottom line: door glass, quarter glass, then the hatch's lower side edge along the rear shoulder (MEASURED)
  belt:[[1560,800],[1845,804],[2343,810],[2773,833],[3063,868],[3184,882],[3300,905],[3700,912],[4140,925]],
  // plan half-width of the lower body (MEASURED top view; the nose and tail corners are the bumpers' plan)
  plan:[[0,318],[18,421],[35,460],[53,520],[70,553],[88,581],[105,603],[122,618],[140,636],[163,653],[221,690],[279,725],[337,759],[395,792],[453,825],[511,858],[569,885],[627,898],[743,900],
        [1033,897],[1323,892],[1613,889],[1903,886],[2483,886],[2773,891],[3063,893],[3353,892],[3643,890],[3735,883],[3828,866],[3921,849],[4014,831],[4106,813],[4199,785],[4246,742],[4280,640],[4300,470],[4310,300]],
  // lower-body section: fraction of the plan half-width by height (MEASURED front and rear views: full width 290-700 mm, the shoulder rolls in above 720 mm; the sill tucks under)
  sLow:[[110,.90],[150,.94],[200,.97],[260,.985],[290,1],[690,1],[720,.995],[750,.98],[790,.955],[830,.935],[870,.92],[930,.90]],
  // greenhouse half-width by height: at the B-pillar (front view's side glass, top view: 763 mm at the belt, 590 at the roof rail) and behind the quarter glass (rear view)
  tumbleB:[[800,775],[850,752],[900,728],[961,700],[1017,675],[1073,642],[1129,603],[1167,575],[1185,560],[1204,540],[1223,455],[1241,300],[1246,0]],
  tumbleR:[[900,830],[930,760],[975,640],[1011,615],[1101,590],[1191,556],[1209,540],[1227,471],[1246,0]],
  aPillar:{x0:1555,y0:880,h0:711,x1:2190,y1:1200,h1:556},           // windshield side edge, base corner -> header corner (MEASURED top + front views)
  arch:{f:{x:928,y:323,r:350},r:{x:3378,y:325,r:350},lip:35},        // wheel openings round the drawn hubs (MEASURED rings r 60 / 66 px)
  door:{front:1580,frontTop:1594,frontBot:1566,rearTop:2899,rearMid:[2850,496],rearLow:[2754,320],rearBot:[2696,278],bottom:272},   // MEASURED (contrast-stretched shut lines)
  dglass:[[1845,780],[1835,932],[2309,1160],[2778,1137],[2778,790]],   // its bottom edge below the belt: the glass starts at the door's top edge   // door glass (frameless), its front edge behind the mirror's black sail triangle (MEASURED)
  bPillar:{x0:2778,x1:2995},                                          // black B-pillar between the door glass and the quarter glass (MEASURED; photographs)
  quarter:[[2995,1078],[3060,1076],[3126,1031],[3190,1002],[3254,944],[3283,896],[3270,883],[2995,883]],   // rear quarter window (MEASURED: the light area's outline row by row)
  ttop:{x0:2300,x1:2915,zIn:35,zOut:500,r:120},                        // T-bar roof glass panels either side of the 70 mm spine (MEASURED top view 2300-2915, 29-505 mm)
  hatchGlass:[[3212,505],[3300,535],[3590,545],[3640,480],[3700,412],[3760,370],[3800,290],[3812,0]],   // hatch glass half-width along x (MEASURED top view)
  hood:{x0:40,x1:1395,half:760,notchX:470,notchZ:290},               // hood: nose edge .. cowl shut line, side shut lines on the fender tops; notched round the headlamps (photographs)
  headlamp:{x0:190,x1:450,z0:300,z1:655,y0:555,y1:680},              // clear covers on the front corners (MEASURED side, top and front views)
  hatch:{hingeX:3175,botSide:905,botRear:905,tailX:4152},             // hatch: hinged at the roof's rear lip, its lower side edges along the rear shoulders, lower rear edge over the tail lamps (photographs)
  rocker:120,crease:272,                                              // MEASURED sill bottom and the lower-body crease (the door's bottom edge)
  // inner structure (DESIGN, sized to clear what lives there; the collision suite checks them)
  bay:{x0:250,x1:1420,half:585,floor:200,upY:640,upHalf:760},        // engine bay: radiator support face .. firewall, between the inner fender aprons
  towerF:{x:928,dx:200,zIn:460,top:785},wheelF:{zIn:520,bayHalf:520},
  tubR:{zIn:600},towerR:{x:3378,dx:180,zIn:460,top:780},
  tunnel:{x0:1420,x1:3050,half:200,top:420},hump:{x0:1420,x1:1900,half:190,top:480},exhCh:{x0:3760,x1:4300,z0:-560,z1:560,top:300},floorC:190,floorR:440,   // the bellhousing hump; the silencer's channel behind the rear axle; the floor kicks up to 440 mm behind the seats (over the tank, driveshaft and final drive)
  cargoFloor:520,cargoX:[2930,4120]
};

function makeZ32(){
  const M=Z32_M,XM=M.ovF+M.WB/2,wx=m=>(XM-m)/20,u=m=>m/20,mm=x=>XM-x*20;
  const g={S:M,wx,u,mm};
  const tab=(T,v)=>{if(v<=T[0][0])return T[0][1];for(let i=0;i<T.length-1;i++){const a=T[i],b=T[i+1];if(v<=b[0])return a[1]+(b[1]-a[1])*(v-a[0])/(b[0]-a[0]);}return T[T.length-1][1];};
  g.tab=tab;
  g.NOSE_X=wx(0);g.REAR_X=wx(M.L);g.AX_F=wx(M.ovF);g.AX_R=wx(M.ovF+M.WB);g.WR=u(M.hubY);g.ROCK=u(M.rocker);g.BELT=u(805);g.ROOF=u(1246);g.halfW=u(900);
  const TOPW=M.top.map(([x,y])=>[wx(x),u(y)]);g.TOP=TOPW;
  const topC=g.topC=x=>{const m=mm(x);if(m<M.top[0][0]||m>M.top[M.top.length-1][0])return -1;return u(tab(M.top,m));};
  // crown: off-centre the hood, windshield and hatch fall away (MEASURED: the fender tops 76 mm under the cowl's centre, the windshield's base corners 880 mm high
  // at 711 mm out, its header corners 1200 mm at 556 mm out); the roof's edges are rounded by the greenhouse section instead
  const crownMM=m=>{if(m<1404)return 40+40*clampv(m/1404,0,1);if(m<2190)return 80-50*(m-1404)/786;if(m<3175)return 20;if(m<3932)return 40;return 40;};
  g.crown=x=>u(crownMM(mm(x)));
  const top=g.top=(x,z)=>{const c=topC(x);if(c<0)return -1;const k=Math.abs(z)/45;return c-g.crown(x)*k*k;};
  g.topY=x=>topC(x)<0?(x>0?22:42):topC(x);
  const belt=g.belt=x=>u(tab(M.belt,mm(x)));
  const plan=g.plan=x=>u(tab(M.plan,mm(x)));
  const sLow=y=>tab(M.sLow,y*20);
  const A=M.aPillar;
  const aEnv=(x,y)=>{const t=clampv((y*20-A.y0)/(A.y1-A.y0),0,1),xa=A.x0+(A.x1-A.x0)*t,ha=A.h0+(A.h1-A.h0)*t,m=mm(x);return u(ha+Math.max(0,m-xa)*.45);};
  g.aEnv=aEnv;
  // greenhouse half-width: the B-pillar section ahead of the quarter glass, the rear-view section behind it (blended over 150 mm), limited ahead by the A-pillar envelope
  const gh=g.gh=(x,y)=>{const m=mm(x),t=clampv((m-3100)/150,0,1),ym=y*20,b=tab(M.tumbleB,ym),r=tab(M.tumbleR,ym);return Math.min(u(b+(r-b)*t),aEnv(x,y));};
  // half-width of the body side at (x,y): lower body below the belt, a 30 mm rolled shoulder, then the greenhouse
  const EDGE_R=1.6;
  const halfAt=g.halfAt=(x,y)=>{
    const b=belt(x),lo=plan(x)*sLow(Math.min(y,b));
    let r;
    if(y<=b)r=lo;else{const gg=gh(x,y),g2=Math.min(gg,lo),SH=g.shoulderH(x);r=y<b+SH?g2+(lo-g2)*Math.sqrt(Math.max(0,1-((y-b)/SH)**2)):g2;}   // the shoulder rolls over convex (a quarter ellipse) into the glass's base, no S-bend
    const tc=topC(x);if(tc>0&&tc<b+.5){const dt=tc-y;if(dt>=0&&dt<EDGE_R){const q=EDGE_R-dt;r-=EDGE_R-Math.sqrt(Math.max(0,EDGE_R*EDGE_R-q*q));}}
    if(y>=g.ROCK&&y<g.ROCK+1.5){const q=g.ROCK+1.5-y;r-=1.5-Math.sqrt(Math.max(0,2.25-q*q));}
    return r;};
  // nose and tail faces behind the bumpers (below the hood nose / the tail-lamp panel)
  g.frontLimit=y=>y*20<470?wx(150):g.NOSE_X;g.rearLimit=y=>y*20<660?wx(4170):g.REAR_X;
  g.bottom=x=>{const m=mm(x);return u(m<520?140:(m<M.arch.f.x+M.arch.f.r?220:(m>3640?240:M.rocker)));};   // the sill runs forward to the front wheel opening (its outer skin; the apron inside it stays at 220)   // the rocker ends at the rear arch's lower corner (the tyre's swing at full roll)   // DESIGN: the fender aprons beside the bay end 220 mm up (the lower arms pass beneath)
  g.bottomZ=(x,z)=>{const m=mm(x),b=g.bottom(x);if(m>=M.arch.f.x+M.arch.f.r&&m<1450&&Math.abs(z)<=u(760))return u(220);return (m>=1450&&m<=3740&&Math.abs(z)<=u(m>M.arch.r.x-M.arch.r.r-60&&m<M.arch.r.x+M.arch.r.r+60?M.tubR.zIn:760))?u(m>=2900?M.floorR:M.floorC):b;};   // DESIGN: floor pan 190 mm up between the 120 mm sills (the side skirts), 330 mm under the cargo bay (over the final drive and the tank)
  g.YBOT=g.bottom;
  g.ARCH_R=u(M.arch.f.r);g.ARCH_F={x:wx(M.arch.f.x),y:u(M.arch.f.y),r:u(M.arch.f.r)};g.ARCH_RR={x:wx(M.arch.r.x),y:u(M.arch.r.y),r:u(M.arch.r.r)};
  g.archLip=(x,y)=>{let l=0;for(const a of [g.ARCH_F,g.ARCH_RR]){const d=Math.hypot(x-a.x,y-a.y);if(d>=a.r&&d<a.r+u(M.arch.lip))l=Math.max(l,.25*(1-(d-a.r)/u(M.arch.lip)));}return l;};
  g.profDist=(x,y)=>{let best=1e9;const T=TOPW;for(let i=0;i<T.length-1;i++){const a=T[i],b=T[i+1],dx=b[0]-a[0],dy=b[1]-a[1],L=dx*dx+dy*dy,t=L?clampv(((x-a[0])*dx+(y-a[1])*dy)/L,0,1):0;best=Math.min(best,Math.hypot(x-(a[0]+dx*t),y-(a[1]+dy*t)));}return best;};
  g.profDistZ=(x,y,z)=>{const k=Math.abs(z)/45;return g.profDist(x,y+g.crown(x)*k*k);};
  g.noseX=az=>g.NOSE_X;g.rearX=az=>g.REAR_X;
  // the edge where a deck (hood, hatch) meets the body side: rolled with this radius (front view of the drawing: the fender tops are full radii, about 120 mm;
  // the tail's shoulders behind the hatch glass about 80 mm); none along the greenhouse, whose sections are measured (tumble tables) and rounded already
  // the shoulder's roll height over the belt: 30 mm along the side glass; behind the quarter glass the rear shoulders swell up into the C-pillars and the hatch's
  // sides over 80 mm (photographs: the haunches over the rear wheels are full, no hollow between them and the glass)
  // and at the A-pillar's foot, from just ahead of the pillar line back to the door glass's front edge (where the mirror's sail stands), 80 mm too: the pillar's root
  // and the sail come out to the fender and door skins and fair into the pillar above (with 30 mm they stood 50 mm in from the skin: a pocket by the mirror)
  g.shoulderH=x=>{const m=mm(x);if(m>=1520&&m<=1860){const f=Math.min(1,(m-1520)/30,(1860-m)/30);return 1.5+2.5*f;}return m<3290?1.5:(m<3450?1.5+2.5*(m-3290)/160:4);};
  // in front the roll starts 20 mm outboard of the hood's side shut line, so the hood's edge sits on the fender's crest instead of standing proud of it
  const ERC=new Map();
  g.edgeR=x=>{const m=mm(x);if(m>=1500&&m<3600)return 0;if(m>=3600)return m<3800?4*(m-3600)/200:4;
    const key=Math.round(x*4);let R=ERC.get(key);if(R===undefined){const tc=topC(x),room=tc>0?halfAt(x,tc-.5)-u(M.hood.half)-1:6;R=clampv(Math.min(6,room),1.5,6)*(m<1300?1:1-.7*(m-1300)/200);ERC.set(key,R);}return R;};
  g.xA=y=>wx(A.x0+(A.x1-A.x0)*clampv((y*20-A.y0)/(A.y1-A.y0),0,1));
  g.DOOR_F=wx(M.door.front);g.DOOR_R=wx(M.door.rearTop);
  g.doorFront=y=>{const D=M.door,t=clampv((y*20-D.bottom)/(805-D.bottom),0,1);return wx(D.frontBot+(D.frontTop-D.frontBot)*t);};
  g.doorRear=y=>{const D=M.door,m=y*20;if(m>=D.rearMid[1])return wx(D.rearTop+(D.rearMid[0]-D.rearTop)*clampv((805-m)/(805-D.rearMid[1]),0,1));if(m>=D.rearLow[1])return wx(D.rearMid[0]+(D.rearLow[0]-D.rearMid[0])*(D.rearMid[1]-m)/(D.rearMid[1]-D.rearLow[1]));
    return wx(D.rearLow[0]+(D.rearBot[0]-D.rearLow[0])*clampv((D.rearLow[1]-m)/(D.rearLow[1]-D.rearBot[1]),0,1));};
  g.HOOD_X0=wx(M.hood.x1);g.HOOD_X1=wx(M.hood.x0);g.HOOD_HALF=u(M.hood.half);
  g.HATCH_X=wx(M.hatch.hingeX);
  g.hatchGlassHalf=x=>u(tab(M.hatchGlass,mm(x)));
  // hinge lines 20 mm above the panel edges (gooseneck hinges), so the edges swing clear of the cowl and the roof's rear lip
  g.HOOD_HINGE=[g.HOOD_X0,topC(g.HOOD_X0)+1.0];g.HATCH_HINGE=[g.HATCH_X,topC(g.HATCH_X)+1.0];
  return g;
}

/* ---- body panels (10 mm cells): solid -> arches, towers, bay, tunnel -> panels taken out -> 2-layer skin -> door apertures -> windows and glass -> trim colours -> shut lines ---- */
function buildZ32Body(g){
  const M=Z32_M,{NOSE_X,REAR_X,AX_F,AX_R,WR,BELT,ROOF,u,wx,halfAt,top,topC,belt}=g;
  const INT=0x2a2b2e,UNDER=0x15171a,SASH=0x141517,GASK=0x131416,SEAM=PAINT_SHADE;
  const hw=g.halfW,ext=Math.ceil(hw+1.5);
  const relief=(x,y,z,more)=>typeof z32BumperRelief==='function'&&z32BumperRelief(g,x,y,z,more);
  const S0=hgrid(Math.floor(REAR_X-2),Math.ceil(NOSE_X+1),0,ROOF+2,-ext,ext);
  const solidAt=(x,y,z)=>{if(x>g.frontLimit(y)||x<g.rearLimit(y))return false;if(y<g.bottomZ(x,z))return false;if(relief(x,y,z))return false;
    const tp=top(x,z);if(y>tp)return false;const hs=halfAt(x,y)+g.archLip(x,y),az=Math.abs(z);if(az>hs)return false;
    const R=g.edgeR(x);if(R>0){const d1=tp-y,d2=hs-az;if(d1<R&&d2<R&&(R-d1)*(R-d2)>0&&(R-d1)**2+(R-d2)**2>R*R)return false;}   // the fender tops and the tail's shoulders rolled round (front view: the corners are full radii)
    return true;};
  g.solidAt=solidAt;   // the measured outer volume: the painted skin's surface net is snapped to it (surfnet.js)
  // 1. solid
  eachCell(S0,null,(i,j,k,n)=>{const x=i/HR,y=j/HR,z=k/HR;if(solidAt(x,y,z))S0.d[n]=1;});
  // depth of every solid cell below the outside surface (cells, 6-neighbour steps), measured on the plain solid so inner carves do not count
  const DEP=new Uint8Array(S0.d.length);{const sx=S0.ny*S0.nz,sy=S0.nz;let front=[];
    for(let p=0;p<S0.d.length;p++)if(S0.d[p]>=0){const i=Math.floor(p/sx),j=Math.floor((p%sx)/sy),k=p%sy;
      if(i===0||j===0||k===0||i===S0.nx-1||j===S0.ny-1||k===S0.nz-1||S0.d[p+sx]<0||S0.d[p-sx]<0||S0.d[p+sy]<0||S0.d[p-sy]<0||S0.d[p+1]<0||S0.d[p-1]<0){DEP[p]=1;front.push(p);}}
    for(let dd=2;dd<=8&&front.length;dd++){const nx=[];for(const p of front)for(const q of [p+sx,p-sx,p+sy,p-sy,p+1,p-1])if(q>=0&&q<S0.d.length&&S0.d[q]>=0&&!DEP[q]){DEP[q]=dd;nx.push(q);}front=nx;}}
  const depthAt=(x,y,z)=>{const i=Math.round(x*HR),j=Math.round(y*HR),k=Math.round(z*HR);if(!S0.inb(i,j,k))return 99;const v=DEP[S0.ix(i,j,k)];return v||99;};
  // 2. wheel openings: cylinders through the outer wall, wheelhouse and tub walls inboard
  const AF=g.ARCH_F,AR=g.ARCH_RR,zF=u(M.wheelF.zIn),zR=u(M.tubR.zIn);
  carveW(S0,null,(x,y,z)=>(Math.abs(z)>zF&&Math.hypot(x-AF.x,y-AF.y)<AF.r)||(Math.abs(z)>zR&&Math.hypot(x-AR.x,y-AR.y)<AR.r));
  // inside the fenders the wheelhouses reach 60 mm past the openings (the tyre's corners at full lock and full roll), the outer 30 mm of skin keeps the openings' measured edge
  carveW(S0,null,(x,y,z)=>{const az=Math.abs(z);if(az>=halfAt(x,y)-1.5)return false;return (az>zF&&Math.hypot(x-AF.x,y-AF.y)<AF.r+3&&y>u(120))||(az>zR&&Math.hypot(x-AR.x,y-AR.y)<AR.r+3&&y>u(120));});
  // damper towers: pockets above the wheelhouses for the damper tops and the upper links' pivots, keeping a 30 mm skin under every outside surface
  const TF=M.towerF,TR=M.towerR,deep=(x,y,z)=>{const v=depthAt(x,y,z);return v===99||v>3;};
  carveW(S0,null,(x,y,z)=>Math.abs(x-wx(TF.x))<=u(TF.dx)&&Math.abs(z)>u(TF.zIn)&&Math.abs(z)<halfAt(x,y)-2&&y<u(TF.top-20)&&y>AF.y&&deep(x,y,z));
  carveW(S0,null,(x,y,z)=>Math.abs(x-wx(TR.x))<=u(TR.dx)&&Math.abs(z)>u(TR.zIn)&&(Math.abs(z)<halfAt(x,y)-2||Math.hypot(x-AR.x,y-AR.y)<AR.r)&&y<u(TR.top-20)&&y>u(200)&&(deep(x,y,z)||Math.hypot(x-AR.x,y-AR.y)<AR.r));
  // 3. engine bay (open underneath), tunnel, exhaust channel
  const B=M.bay,nearW=x=>Math.abs(x-AF.x)<=AF.r+2;
  carveW(S0,null,(x,y,z)=>x<=wx(B.x0)&&x>=wx(B.x1)&&Math.abs(z)<=(y>u(B.upY)?u(B.upHalf):(nearW(x)&&y>u(380)?u(M.wheelF.bayHalf):u(B.half)))&&y>=0&&y<top(x,z)-1.6);
  const T=M.tunnel,HU=M.hump;carveW(S0,null,(x,y,z)=>x<=wx(T.x0)&&x>=wx(T.x1)&&Math.abs(z)<=u(T.half)&&y<=u(T.top));carveW(S0,null,(x,y,z)=>x<=wx(HU.x0)&&x>=wx(HU.x1)&&Math.abs(z)<=u(HU.half)&&y<=u(HU.top));
  const XC=M.exhCh;carveW(S0,null,(x,y,z)=>x<=wx(XC.x0)&&x>=wx(XC.x1)&&z>=u(XC.z0)&&z<=u(XC.z1)&&y<=u(XC.top));
  // 4. moving panels out of the solid (before the skin, so each gets its own two-layer shell)
  const HD=M.hood,hood=hgrid(g.HOOD_X0-.5,NOSE_X+.5,u(440),ROOF,-g.HOOD_HALF-.5,g.HOOD_HALF+.5),HT=2.4;
  const take=(dst,pred)=>eachCell(dst,null,(i,j,k)=>{const x=i/HR,y=j/HR,z=k/HR;if(!S0.inb(i,j,k))return;const n=S0.ix(i,j,k);if(S0.d[n]<0)return;if(pred(x,y,z)){dst.d[dst.ix(i,j,k)]=1;S0.d[n]=-1;}});
  const inHoodPlan=(x,z)=>{const m=g.mm(x),az=Math.abs(z)*20;if(m<HD.x0||m>HD.x1||az>HD.half)return false;if(m<HD.notchX&&az>HD.notchZ)return false;return true;};   // the headlamp corners stay with the fenders
  take(hood,(x,y,z)=>x>=g.HOOD_X0&&inHoodPlan(x,z)&&y>=u(470)&&top(x,z)-y<HT);
  // hatch: everything of the outer 50 mm behind the roof's rear lip, above its lower edges (the rear shoulders, the top of the tail-lamp panel)
  const H=M.hatch,hx=g.HATCH_X,hb=x=>{const m=g.mm(x);return u(m>H.tailX-20?H.botRear:H.botSide+(H.botRear-H.botSide)*clampv((m-3300)/850,0,1));};
  const hatchHalf=y=>{const r=halfAt(wx(3600),Math.max(y,u(H.botSide)));return r;};
  const hatch=hgrid(REAR_X-.5,hx+.5,u(H.botSide)-1,ROOF+1,-ext,ext);
  // its side edges: behind the roof's rear lip over the glass, behind the quarter glass's rear edge (+40 mm) on the C-pillars (photographs: the shut line runs down the pillar to the shoulder)
  const qRear=y=>{const ym=y*20;return ym>=1076?3060:3060+(3283-3060)*clampv((1076-ym)/(1076-896),0,1);};
  g.qRear=qRear;
  const inHatch=(x,y,z,inset,dmax)=>{if(x>hx-inset||y<hb(x)+inset||depthAt(x,y,z)>dmax)return false;const az=Math.abs(z);if(az>u(560)-inset&&g.mm(x)<qRear(y)+40+inset*20)return false;return az<=halfAt(x,y)-inset;};
  take(hatch,(x,y,z)=>inHatch(x,y,z,0,5));
  // doors: the outer 84 mm of the side between the shut lines, from the crease up to the belt
  const D=M.door;
  const doorL=hgrid(g.DOOR_R-.5,g.DOOR_F+1.5,u(D.bottom)-1,ROOF,-ext,0),doorR=hgrid(g.DOOR_R-.5,g.DOOR_F+1.5,u(D.bottom)-1,ROOF,0,ext);
  const inDoor=(x,y,z)=>{if(y<u(D.bottom)||x>g.doorFront(y)||x<g.doorRear(y))return false;if(y<=belt(x))return Math.abs(z)>=halfAt(x,y)-4.2;return false;};
  take(doorL,(x,y,z)=>z<0&&inDoor(x,y,z));take(doorR,(x,y,z)=>z>0&&inDoor(x,y,z));
  // 5. skin
  const PFRONT=wx(150),PREAR=wx(4170);
  const inArch=(x,y,z)=>{for(const a of [AF,AR]){if(Math.hypot(x-a.x,y-a.y)<a.r+.6&&Math.abs(z)<halfAt(x,y)-1.2)return true;}
    return (Math.abs(x-wx(TF.x))<=u(TF.dx)+.6&&Math.abs(z)>u(TF.zIn)-.6&&y<u(TF.top)&&y>AF.y&&Math.abs(z)<halfAt(x,y)-1.2)||(Math.abs(x-wx(TR.x))<=u(TR.dx)+.6&&Math.abs(z)>u(TR.zIn)-.6&&y<u(TR.top)&&y>u(180)&&Math.abs(z)<halfAt(x,y)-1.2);};
  shellHi(S0,(x,y,z,inner)=>{
    if(inArch(x,y,z)&&depthAt(x,y,z)>1)return UNDER;
    if(inner)return INT;
    if(y<u(150))return UNDER;
    if(y<u(470)&&g.mm(x)>1420&&g.mm(x)<4170&&Math.abs(z)<halfAt(x,y)-2.2)return UNDER;   // the floor pan, the tunnel and the kick-up seen from underneath: underbody black
    if(x>PFRONT-.6&&y<u(470))return UNDER;                 // panel behind the front bumper
    if(x<PREAR+.6&&y<u(660))return UNDER;                  // panel behind the rear bumper
    if(relief(x,y,z,40))return UNDER;                      // the cut-back skin behind the bumpers' side wings
    return PAINT;},2);
  const bodyG=S0;
  // the opening under the hatch: the body just inside it is cut away into the cargo bay, a 30 mm flange left round the edge for the hatch to close on
  const inOutline=(x,y,z,inset)=>{const az=Math.abs(z);if(az>u(560)-inset&&g.mm(x)<qRear(y)+40+inset*20)return false;return az<=halfAt(x,y)-inset;};
  carveW(S0,null,(x,y,z)=>x<=hx-1.5&&y>=hb(x)+.25&&inOutline(x,y,z,1.5));   // everything of the body under the hatch above its lower edges goes (the cargo bay), 30 mm in from its outline
  // the rubber seal round the opening: the body's flange cells next to the closed hatch
  {const sx=S0.ny*S0.nz,sy=S0.nz;for(let p=0;p<S0.d.length;p++){if(S0.d[p]<0||DEP[p]<2)continue;const i=Math.floor(p/sx)+S0.x0,j=Math.floor((p%sx)/sy)+S0.y0,k=p%sy+S0.z0;
     for(const [a,b,c] of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]])if(hatch.get(i+a,j+b,k+c)>=0){S0.d[p]=GASK;break;}}}
  // paint only on the original outside surface (depth 1); the second layer stays as the panel's inner skin, deeper cells are the inner frame
  const INT2=0x2b2c2f,byDepth=(x,y,z)=>{const d=depthAt(x,y,z);return d<=1?PAINT:(d===2?INT2:INT);};
  shellHi(hood,(x,y,z,inner)=>byDepth(x,y,z),2);
  shellHi(hatch,(x,y,z,inner)=>byDepth(x,y,z),2);
  const doorSkin=(x,y,z,inner)=>depthAt(x,y,z)<=1?PAINT:0x3a3b3f;
  shellHi(doorL,doorSkin,2);shellHi(doorR,doorSkin,2);
  // the hood keeps a frame of inner panel (x-brace)
  eachCell(hood,null,(i,j,k,n)=>{if(hood.d[n]!==INT)return;const x=i/HR,z=k/HR,x0=g.HOOD_X0,x1=g.HOOD_X1;
    const keep=x<=x0+1.5||x>=x1-1.5||Math.abs(z)>=g.HOOD_HALF-1.2||Math.abs(Math.abs(z)-(x-x0)*.6)<1.1||Math.abs(x-(x0+x1)/2)<1.1;if(!keep)hood.d[n]=-1;});
  // front damper towers: the pocket's cap (20 mm) the damper's top mount bolts under, and the inner apron toward the bay the upper link pivots bolt to; one cell under the hood
  // (under the hood's lowest cell with a cell to spare, and under the outer surface: toward its edges the crowned hood comes down to 765 mm, below the 785 mm cap)
  {const x0=wx(TF.x)-u(TF.dx),x1=wx(TF.x)+u(TF.dx),zi=u(TF.zIn),capY=u(TF.top-20),hb=new Map();for(const [i,j,k] of hood.list()){const key=i+','+k,v=hb.get(key);if(v===undefined||j<v)hb.set(key,j);}
   // the cap's height in each column: 765 mm, or lower where the hood or the fender top come down (20 mm under the hood's inner skin, 30 mm under the surface)
   const cyAt=(i,k)=>{const b=hb.get(i+','+k);let c=capY;if(b!==undefined)c=Math.min(c,(b-2)/HR-.25);return Math.min(c,top(i/HR,k/HR)-1.5-.75);};
   const clear=(i,j,k)=>{const b=hb.get(i+','+k);return b===undefined||j<=b-2;};
   eachCell(bodyG,[x0,x1,u(320),u(TF.top)+1,-ext,ext],(i,j,k,n)=>{if(bodyG.d[n]>=0)return;const x=i/HR,y=j/HR,z=k/HR,az=Math.abs(z);if(x<x0||x>x1)return;const cy=cyAt(i,k);
     const cap=y>=cy-.25&&y<=cy+.75&&az>=zi-1.25&&az<=halfAt(x,y)-1&&clear(i,j,k),wall=az>=zi-1.25&&az<=zi-.25&&y>=u(320)&&y<cy-.25&&clear(i,j,k);
     if(cap||wall)bodyG.d[n]=(wall&&az>zi-.75)||(cap&&y<cy+.25)?UNDER:PAINT;});}   // painted toward the bay and on top, wheelhouse black toward the wheel
  // 6. door apertures through the side (sill, pillars and the roof rail stay)
  const DB=u(D.bottom);
  carveW(bodyG,[g.DOOR_R-1,g.DOOR_F+2,DB,ROOF,-ext,ext],(x,y,z)=>{if(y<DB+1||x>g.doorFront(y)-1||x<g.doorRear(y)+1)return false;if(y>belt(x))return false;return Math.abs(z)>=halfAt(x,y)-7;});
  // 7. windows: door glass (frameless), quarter glass, windshield, hatch glass, T-bar roof panels
  const inPoly=(x,y,poly)=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,yi]=poly[i],[xj,yj]=poly[j];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))c=!c;}return c;};
  const dPoly=M.dglass.map(([a,b])=>[wx(a),u(b)]),qPoly=M.quarter.map(([a,b])=>[wx(a),u(b)]);
  const dgIn=(x,y)=>y>belt(x)&&inPoly(x,y,dPoly),qgIn=(x,y)=>inPoly(x,y,qPoly);   // frameless glass: from the door's top edge up (nothing of the body between them)
  const sideOpen=(x,y,z)=>Math.abs(z)>=halfAt(x,y)-4.5;
  // the side openings: through the greenhouse's side wall where the door and quarter glass are (frameless door glass: the opening is the glass's own outline)
  carveW(bodyG,[REAR_X,NOSE_X,BELT-1,ROOF+1,-ext,ext],(x,y,z)=>sideOpen(x,y,z)&&(dgIn(x,y)||qgIn(x,y)));
  const glass={},GL=0x5c8aa0;
  const wsX0=wx(2178),wsX1=wx(1395);
  const wsIn=(x,y,z)=>x<=wsX1&&x>=wsX0&&Math.abs(z)<g.aEnv(g.xA(y),y)-2.4&&y>u(868);
  const rwIn=(x,y,z)=>x<=hx-1&&Math.abs(z)<g.hatchGlassHalf(x)&&g.mm(x)<3812;
  const TT=M.ttop,ttIn=(x,z)=>{const m=g.mm(x),az=Math.abs(z)*20;if(m<TT.x0||m>TT.x1||az<TT.zIn||az>TT.zOut)return false;
    const cx=clampv(m,TT.x0+TT.r,TT.x1-TT.r),cz=clampv(az,TT.zIn+TT.r,TT.zOut-TT.r);return Math.hypot(m-cx,az-cz)<=TT.r;};   // rounded corners (photographs)
  glass.ws=hgrid(wsX0-.5,wsX1+.5,BELT,ROOF+1,-ext,ext);glass.rw=hgrid(REAR_X-.5,hx+.5,u(900),ROOF+1,-ext,ext);
  glass.ttL=hgrid(wx(TT.x1)-.5,wx(TT.x0)+.5,u(1100),ROOF+1,-ext,0);glass.ttR=hgrid(wx(TT.x1)-.5,wx(TT.x0)+.5,u(1100),ROOF+1,0,ext);
  const skinToGlass=(Gp,Gg,inR)=>eachCell(Gp,null,(i,j,k,n)=>{const v=Gp.d[n];if(v<0)return;const x=i/HR,y=j/HR,z=k/HR;if(!inR(x,y,z))return;if(v===PAINT)Gg.set(i,j,k,GL);Gp.d[n]=-1;});
  skinToGlass(bodyG,glass.ws,(x,y,z)=>wsIn(x,y,z)&&y>top(x,z)-3.6);
  skinToGlass(hatch,glass.rw,(x,y,z)=>rwIn(x,y,z));
  skinToGlass(bodyG,glass.ttL,(x,y,z)=>z<0&&ttIn(x,z)&&y>top(x,z)-3.6);skinToGlass(bodyG,glass.ttR,(x,y,z)=>z>0&&ttIn(x,z)&&y>top(x,z)-3.6);
  // the mirror's sail: the black triangle at the door glass's front lower corner (body cells between the A-pillar and the glass, over the belt) belongs to the door
  const sailIn=(x,y)=>y>belt(x)&&y<u(935)&&x<=g.doorFront(y)&&g.mm(x)<1846&&x<g.xA(y)-1.2+.0;
  eachCell(bodyG,[wx(1845)-1,wx(1560)+1,BELT-1,u(960),-ext,ext],(i,j,k,n)=>{if(bodyG.d[n]<0)return;const x=i/HR,y=j/HR,z=k/HR;if(!sailIn(x,y)||!sideOpen(x,y,z))return;
    const Dd=z<0?doorL:doorR;Dd.set(i,j,k,SASH);bodyG.d[n]=-1;});
  // black B-pillar trim between the door glass and the quarter glass
  const BP=M.bPillar;eachCell(bodyG,[wx(BP.x1)-1,wx(BP.x0)+1,BELT,ROOF,-ext,ext],(i,j,k,n)=>{if(bodyG.d[n]!==PAINT)return;const x=i/HR,y=j/HR,z=k/HR,m=g.mm(x);
    if(m>=BP.x0&&m<=BP.x1&&y>belt(x)+.2&&y<u(1150)&&sideOpen(x,y,z))bodyG.d[n]=SASH;});
  // side glass slabs, flush with the outer surface
  for(const kk of ['dgL','dgR','qgL','qgR'])glass[kk]=hgrid(REAR_X+10,NOSE_X-10,BELT-1,ROOF+1,kk.endsWith('L')?-ext:0,kk.endsWith('L')?0:ext);
  for(let i=glass.dgL.x0;i<=glass.dgL.x1;i++)for(let j=glass.dgL.y0;j<=glass.dgL.y1;j++){const x=i/HR,y=j/HR;if(y<BELT-.5||y>ROOF)continue;const h=halfAt(x,y);
    for(const sd of [-1,1]){const zc=Math.round((h-.9)*HR);
      if(dgIn(x,y))for(let q=0;q<2;q++)(sd<0?glass.dgL:glass.dgR).set(i,j,sd*(zc-q),GL);
      if(qgIn(x,y))for(let q=0;q<2;q++)(sd<0?glass.qgL:glass.qgR).set(i,j,sd*(zc-q),GL);}}
  for(const [Dd,Gg] of [[doorL,glass.dgL],[doorR,glass.dgR]])for(const [i,j,k] of Gg.list())Dd.set(i,j,k,-1);
  // rubber gaskets round the windshield, the hatch glass and the roof panels
  const nearGlass=(Gg,i,j,k)=>{for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)for(let c=-1;c<=1;c++)if(Gg.get(i+a,j+b,k+c)>=0)return true;return false;};
  eachCell(bodyG,[wsX0-1,wsX1+1,BELT-1,ROOF+1,-ext,ext],(i,j,k,n)=>{if(bodyG.d[n]!==PAINT)return;if(nearGlass(glass.ws,i,j,k))bodyG.d[n]=GASK;});
  eachCell(bodyG,[wx(TT.x1)-1,wx(TT.x0)+1,u(1100),ROOF+1,-ext,ext],(i,j,k,n)=>{if(bodyG.d[n]!==PAINT)return;if(nearGlass(glass.ttL,i,j,k)||nearGlass(glass.ttR,i,j,k))bodyG.d[n]=GASK;});
  eachCell(hatch,null,(i,j,k,n)=>{if(hatch.d[n]!==PAINT)return;if(nearGlass(glass.rw,i,j,k))hatch.d[n]=GASK;});
  // the glass run seals on the body round the door glass (the A-pillar's rear edge, the roof rail) and the quarter glass: the aperture's cut edge is rubber,
  // not paint (seen from the seats, the painted outer layer's edge showed as red steps along the pillar)
  eachCell(bodyG,[wx(3300)-1,wx(1500)+1,BELT-1,ROOF+1,-ext,ext],(i,j,k,n)=>{if(bodyG.d[n]!==PAINT)return;if(j/HR<=belt(i/HR)+.25)return;const L=k<0;
    if(nearGlass(L?glass.dgL:glass.dgR,i,j,k)||nearGlass(L?glass.qgL:glass.qgR,i,j,k))bodyG.d[n]=GASK;});
  // shut lines in the outer skin (paint in shadow, 34 %)
  const seam=(Gg,b,pred)=>eachCell(Gg,b,(i,j,k,n)=>{if(Gg.d[n]!==PAINT)return;const x=i/HR,y=j/HR,z=k/HR;if(pred(x,y,z))Gg.d[n]=SEAM;});
  // hood: the cowl edge, the side lines on the fender tops, round the headlamp notches
  seam(bodyG,[g.HOOD_X0-1.2,g.HOOD_X0+.4,u(440),ROOF,-hw,hw],(x,y,z)=>x<=g.HOOD_X0+.1&&Math.abs(z)<=g.HOOD_HALF+.5&&y>top(x,z)-1.5);
  seam(bodyG,[g.HOOD_X0,NOSE_X,u(440),ROOF,-hw,hw],(x,y,z)=>{const m=g.mm(x),az=Math.abs(z)*20;if(y<=top(x,z)-1.6)return false;
    if(m>=HD.notchX)return Math.abs(az-(HD.half+12))<6;return Math.abs(az-(HD.notchZ+12))<6||(Math.abs(m-(HD.notchX+12))<6&&az>HD.notchZ&&az<=HD.half+12);});
  // doors
  seam(bodyG,[g.DOOR_F-1,g.DOOR_F+1.5,DB,BELT+2,-ext,ext],(x,y,z)=>{const xf=g.doorFront(y);return x>xf+.1&&x<=xf+.55&&y>=DB+.5&&y<=belt(x)&&Math.abs(z)>=halfAt(x,y)-4.2;});
  seam(bodyG,[g.DOOR_R-1,g.DOOR_R+12,DB,BELT+2,-ext,ext],(x,y,z)=>{const xr=g.doorRear(y);return x<xr-.1&&x>=xr-.55&&y>=DB+.5&&y<=belt(x)&&Math.abs(z)>=halfAt(x,y)-4.2;});
  seam(bodyG,[g.DOOR_R-1,g.DOOR_F+1,DB-1,DB+.5,-ext,ext],(x,y,z)=>y<DB+.5&&y>=DB-.1&&x>=g.doorRear(y)&&x<=g.doorFront(y)&&Math.abs(z)>=halfAt(x,y)-4.2);
  // hatch: the roof's rear lip, the side edges along the shoulders, the lower edge over the tail lamps
  seam(bodyG,[hx-.8,hx+.5,u(1100),ROOF+1,-ext,ext],(x,y,z)=>x>=hx-.6&&x<=hx+.2&&y>top(x,z)-1.5);
  seam(bodyG,[REAR_X,hx,u(H.botSide)-1,u(1000),-ext,ext],(x,y,z)=>Math.abs(y-(hb(x)-.25))<.3&&Math.abs(z)>=halfAt(x,y)-2.5&&g.mm(x)>=qRear(y)+40);
  seam(bodyG,[REAR_X,hx,u(880),u(1090),-ext,ext],(x,y,z)=>{const m=g.mm(x),q=qRear(y)+40;return m<q&&m>=q-12&&y>hb(x)&&Math.abs(z)>=halfAt(x,y)-2.5;});   // down the C-pillars
  // the lower-body crease line along the doors and sills (MEASURED 272 mm)
  for(const Gg of [bodyG,doorL,doorR])seam(Gg,[REAR_X,NOSE_X,u(M.crease)-.6,u(M.crease)+.6,-ext,ext],(x,y,z)=>Math.abs(y-u(M.crease))<.26&&Math.abs(z)>=halfAt(x,y)-1.1&&Math.abs(x-AF.x)>AF.r+1.8&&Math.abs(x-AR.x)>AR.r+1.8);
  const hi={body:bodyG,hood,trunk:hatch,doorL,doorR,glass};
  const CB=[Math.floor(REAR_X-3),Math.ceil(NOSE_X+3),0,Math.ceil(ROOF+2),-ext-1,ext+1],out={hi,HR};
  out.body=coarsen(bodyG,4,CB);out.hood=coarsen(hood,4,CB);out.trunk=coarsen(hatch,4,CB);out.doorL=coarsen(doorL,4,CB);out.doorR=coarsen(doorR,4,CB);
  out.glass={};for(const kk in glass)out.glass[kk]=coarsen(glass[kk],2,CB);
  out.rwOnLid=true;out.hatchBottom=hb;out.hatchHalf=hatchHalf;
  return out;
}
if(typeof module!=='undefined')module.exports={Z32_M,makeZ32,buildZ32Body};
