/* ===== MITSUBISHI ECLIPSE GSX (2Gb, 1997-1999, LHD, 5MT, AWD).
   Detail table in millimetres, same pattern as AE86D. Labels: V = VERIFIED,
   MEASURED = photo ledger (MEASUREMENTS-ECLIPSE.md), DESIGN = laid out, reason
   stated. Bumper face sections are DESIGN bands (ledger OPEN-VERT: stock
   bumper heights NOT measured); the enforcer render check judges them.
   Lamp widths/heights MEASURED: headlamps 500x120, amber OUTER ends, black
   interior + chrome reflectors, no upper grille; tail band 1485, outer red 400
   each, centre ECLIPSE panel 680, height 140, NO amber in the US cluster;
   reverse round ~100 in the bumper fascia at +/-510 (2Gb relocation);
   single LEFT exhaust tip ~420 left of centreline (MEASURED, three rear views);
   GSX pedestal spoiler span 1150 on the HATCH EDGE (hatch-open photo proof). */
const ECLIPSE_M={
  ovF:930,WB:2510,L:4375,   // v2: factory D33A figures (ref/eclipse-2gb/closure_sheet.md): 930 + 2510 + 935 = 4375. At 750 every station-placed panel sat 180 mm too far back on the rig (the cowl ran into the dash)
  hubY:308.4,rocker:145,
  // v3 (2026-11-06): centreline top profile read off the drawing ref/eclipse-2gb/bp_tb_gsx_all.png column by column (side view: wheel centres 184.75 px
  // apart = 2510, 13.59 mm/px; heights from the tyres' ground line, stretched 2.3 % so the roof peak is the factory 1275; the drawing's rear overhang 917
  // stretched to the factory 935; CALCULATED). Hood 790-855 from 600 to the cowl, windshield base 1240 at 872 (the v1 table had 765: ~110 low), header
  // ~1960 at ~1220, roof peak 1275 at 2450-2640, hatch glass to ~4000 at 960, lip deck 902-885 to 4286, the near-vertical tail face (lamp band) to the
  // bumper. The nose ahead of 600 is still the v1 table (OPEN: the drawing's fascia runs 494 at 40 to 688 at 300 with the headlamps ~500-620 mm up;
  // the bumper, lamps and hood front need re-laying together). v3 step 6: the nose too, from the same columns (its 971 mm overhang scaled to 930).
  top:[[0,430],[42,494],[94,549],[146,591],[198,633],[250,660],[302,688],[380,716],[459,744],[536,772],[600,790],[692,813],[771,827],[849,834],[927,841],[1035,855],[1198,857],[1240,872],[1280,897],[1416,966],[1579,1050],[1687,1105],[1850,1175],[1932,1209],[2000,1232],[2100,1250],[2200,1262],[2300,1268],[2450,1275],[2640,1275],[2780,1268],[2900,1258],[3000,1244],[3130,1216],[3236,1189],[3345,1161],[3482,1119],[3603,1077],[3787,1022],[3842,1008],[3920,985],[4011,960],[4100,928],[4150,918],[4262,910],[4268,870],[4276,745],[4316,722],[4334,690],[4348,630],[4354,570],[4361,548],[4370,450],[4375,400]],
  // v4: the tail re-read from the drawing's SIDE view row by row (CALCULATED, calibration in HANDOFF v4): the hatch lip's rear face 4262-4268 from 910 down to
  // the lamp band's top (side_2.jpg / rear_1.jpg: a ~40 mm body-colour lip carries MITSUBISHI and GSX), the band's face near-vertical at 4268-4276 down to 745
  // (drawing 4254-4280), then the bumper's top surface 722 at 4316 and its face 4334 at 690, 4348 at 630, 4361 at 548, 4375 at 400 and below (drawing).
  // v3: a sloped tail 885 at 4286 -> 640 at 4375 with the bumper's top at 600
  belt:[[0,740],[750,760],[1240,834],[1700,841],[2000,850],[2300,862],[2450,869],[2600,880],[2800,893],[3000,900],[3150,911],[3300,924],[3700,924],[4000,915],[4290,885],[4375,870]],   // v3: window line read off the drawing (CALCULATED as the top table): 834 at the cowl's side, 841 under the door glass's front, 869 at the door's rear edge, the rear quarter's shoulder rising to 924 over the rear wheel, down to the tail's lip 885 (v1: 785 flat). Ahead of the cowl v1 (OPEN with the nose)
  // v4 (exterior): plan read off the drawing's TOP view row by row (bp_tb_gsx_all.png, nose x 340 / tail x 17 = 4375, 13.54 mm/px, centre line row 269.8;
  // CALCULATED): station of the outline at each lateral offset, inverted to half-width per station. The nose is round (flat only over +/-190 at the tip,
  // +/-510 at 80 mm, +/-700 at 220, +/-837 at 460); the tail is round in plan (+/-440 flat at the tip, +/-650 at 75 mm, +/-761 at 220, +/-842 at 525).
  // The widest 871 in the drawing (its printed 1740) is held at 867.5 (the v1 width cell; factory 1745 = +/-872.5, one 5 mm half-cell). v3 was a box: 780 at the nose, 820 at the tail
  plan:[[0,190],[20,290],[40,400],[80,510],[120,590],[160,645],[220,700],[250,728],[320,755],[380,782],[460,835],[515,852],[680,857],[1000,860],[1400,866],[1800,867.5],[3000,867.5],[3560,866],[3730,863],[3850,842],[3995,815],[4085,788],[4155,761],[4210,734],[4250,707],[4280,680],[4300,650],[4320,600],[4335,545],[4355,490],[4375,440]],
  // v4: tuck-under, CALCULATED from the drawing's REAR view silhouette (13.63 mm/px on its printed 1740, heights x 1.017 to the 1275 roof): 840 at 243 mm,
  // 848 at 298, 853 at 367, 860 at 437, 869 at 506, 872 widest (ratios to 872)
  sLow:[[0,0.95],[243,0.963],[298,0.972],[367,0.978],[437,0.986],[506,0.997],[560,1.0]],
  // v4: shoulder roll above ys up to yt (the window line, or the hood/fender top ahead of the cowl): the side curves in by D along a quarter ellipse.
  // CALCULATED from the drawing: front view (front fenders) 856 at 743, 842 at 771, 825 at 798, 801 at 825, 726 at 839 (the fender top); top view: the
  // door's window line at +/-713 (868 - 155); rear view (hips over the rear wheel) 864 at 741, 858 at 769, 849 at 797, 833 at 825, 807 at 852. Rows [station, ys, D]
  roll:[[0,720,140],[1100,720,140],[1240,730,135],[1429,730,150],[2700,730,150],[2900,700,160],[3900,700,160],[4375,700,140]],
  // v4: GSX side skirt (fan-details 8), CALCULATED from side_2.jpg (stock car, 2.596 mm/px on its wheel centres, heights 2.70 on the 1275 roof): a body-colour
  // panel from the front arch (1299) to the rear arch (3064), its crease at 337 (here 315, just under the door's bottom edge at 320 so the opening door
  // clears it), its face standing proud of the door (rear34_2.jpg; 870 here: the body's 1740 at the skirt, inside the factory 1745), the body above the
  // crease tucked only to .985 so the step reads ~15 mm (DESIGN), and its rear end sweeping up into the rear arch (side_2: the crease rises ~30 mm over its
  // last ~100 mm; rear34_2.jpg more; here +50 over the last 170, DESIGN)
  skirt:{m0:1300,m1:3070,top:315,upM:2900,upTop:365,half:870,above:.985},
  // v4: fuel flap, RIGHT rear quarter only (fan-details 9), CALCULATED from side_1.jpg (3.21 mm/px on its wheel centres, heights 3.43 on the roof): a rounded
  // rectangle 3633-3825 x 703-847, corners ~35; drawn as a seam ring on the skin
  fuel:{m0:3635,m1:3825,y0:705,y1:845,r:35},
  // v4: the rear quarter above the bumper sits inside the bumper's bulge (the top view's tail outline is the bumper): rear_1.jpg puts the lens tip (on the
  // quarter at station ~3945, 740 mm up) at +/-770 against the body's widest +/-857 at that height (CALCULATED: rear_1 at M-08's scale, the tip's and the
  // widest point's distances from a ~11 m camera taken out; side_2.jpg shows the bumper cover bulging below its 621 top line). Above y0..y1 the body
  // behind m0..m1 comes in by A (here the plan's 821 at the tip -> ~771)
  tailIn:{m0:3600,m1:3950,A:50,y0:600,y1:690},
  rollTopX:[1100,1300],   // v4 DESIGN: ahead of 1100 the roll ends at the fender/hood top (topC), behind 1300 at the window line (belt); blended between
  aPillar:{x0:1240,x1:1960,y0:872,y1:1220,h0:715,h1:550},   // v3: base and header stations/heights from the drawing (CALCULATED, as the top table). v4: half-widths CALCULATED, drawing top view: the window line +/-713 at the base, the windshield header +/-546 (the roof's edge line); v1 800 / 700
  cPillar:{x0:2890,x1:3950,y0:1260,y1:963,h0:560,h1:660},   // v3: the hatch glass's side edge from the roof's rear corner to the glass bottom (drawing, CALCULATED). v4: half-widths CALCULATED: the roof's edge +/-546 at its rear corner (top view), +/-651 at the hatch lip's height beside the glass (rear_1.jpg at M-08's scale); v1 700 / 780
  // v4: tumblehome, CALCULATED from the drawing's rear and front views (greenhouse silhouette): 705 at 962, 691 at 976-1037, 645 at 1078, 628 at 1120,
  // 612 at 1150, 589 at 1175, 577 at 1216, 535 at 1243 (the roof's edge); the window line +/-713 (top view). v3 (v1 table): 800 at 785, 760 at 1000, 700 at the roof
  tumble:[[850,715],[1000,690],[1100,640],[1150,612],[1180,592],[1220,572],[1245,540],[1262,450],[1275,300]],
  crownT:[[0,20],[1240,20],[1960,50],[2200,80],[2700,80],[3000,40],[4000,0]],   // v4: roof cross-camber CALCULATED from the drawing's rear view: the roof's top 1275 on the centre line, 1243 at +/-535 (32 mm: a quadratic crown of ~80 over the half-width); v3 40 flat over 1960-2900 with steps at its ends
  arch:{f:{x:930,y:328,r:393.5},r:{x:3440,y:328,r:393.5},lip:30},   // v2: the arches stand on the axles (ovF 930, ovF + WB 3440)
  wheelF:{zIn:470,bayHalf:420},   // v3: front wheelhouse inner wall 560 -> 470 (CALCULATED: the tyre and rim's swept envelope at full lock, 28.6 deg, with full roll reaches |z| 483 at its rear corner and 514 at its front; env.js probe, 13 mm clear)
  tubR:{zIn:600},   // v3: CALCULATED, M-11 band 600-645 (rear track 1510/2 = 755 less half the 215 tyre = 648 inner sidewall plane; the wall clears it)
  towerF:{x:930,dx:110,zIn:430,top:740},   // v3: top DESIGN 740 = the hood's underside over the axle (top 785 at 930 less the 48 mm hood less ~10 clearance); the strut top (rig 700) sits 15 mm under its cap
  towerR:{x:3475,dx:185,zIn:330,top:760},   // v3: DESIGN, centred on the multi-link's body-side points (upper-arm pivots 3320/3560, damper top 3580; rig ECLIPSE_RIG.susp.rear): M-11 VERIFIED layout, the upper control arms bolt to the body inside the wheelhouse; inner wall 330 inboard of the arm pivots (360), cap 760 over the damper top (720)
  apronF:{dx:280,bot:390},   // v3: DESIGN, the front inner fenders end 390 mm up within 280 mm of the axle: the drive shafts (296 +/- 28) and tie rods pass under them with the hub's 75 mm rise at the roll and pitch limits (CALCULATED from bodyLimits)
  bay:{x0:1200,x1:200,half:420,upY:600,upHalf:440,frontHalf:490},   // v2: the firewall at 1200 clears the steering rack (rig, 1175). v3 frontHalf DESIGN: ahead of the front wheel arches the bay opens to 490 between the headlamp buckets (the rig's 920 mm radiator core and its tank hoses at 450-465)
  tunnel:{x0:1150,x1:3480,half:160,top:370},   // v2: the GSX's propshaft (link0.m) runs at 250-370 mm under the tunnel's skin (375-395, the console stands on it). v3 half 125 -> 160 (DESIGN): the exhaust runs beside the propshaft in the tunnel (rig exh.zRun -100)
  kick:{x0:3380,x1:3530,half:600,top:420},   // v3: DESIGN rear floor kick-up over the axle line: the half-shafts (308 +/- 14), the diff and the links' inner ends, plus the hub's rise at the roll/pitch limits
  floorStep:2800,   // v3: DESIGN, the floor steps up under the rear seat here: the rig's raised carpet starts at x -30 (ECLIPSE_RIG.floorAt); the step's wall (the front floor's last two cells, x -605..-615) stands between the two carpets
  door:{front:1429,rearTop:2700,rearMid:[2700,500],rearLow:[2690,400],rearBot:[2670,320],bottom:320},   // v3 CALCULATED (drawing side view, 13.59 mm/px from the front axle): front edge 1429, rear edge 2700 (near vertical, rounding at its foot), lower edge 320 over the GSX's side skirt (v1: 1370-2550, down to 160)
  bPillar:{botF:2700,topF:2730,botR:2770,topR:2800},   // v3 CALCULATED (drawing): the black B-pillar band behind the door glass, 2700-2770 at the belt, leaning back 30 mm to the roof
  quarter:[[2780,885],[2790,1172],[3420,960],[3430,945]],   // v4: the quarter window's dark panel (the glass in its black surround) CALCULATED from side_2.jpg (B-pillar 2725 / 1175 to the rear tip 3375 / 937) and side_1.jpg (2702 / 1190 to 3472 / 974), averaged, its lower rear corner held at 945 (the cargo cover's edge is at 930 inside); the drawing shows only the glass inset (2833-3130 x 927-1123). v3: [2780,880],[2800,1170],[3100,1125],[3260,925] (100-170 mm short at the rear)
  hood:{x0:120,x1:1240,half:720},   // FIX1 V-4: x0/x1 were swapped vs the shared convention (HOOD_X0=wx(x1)=COWL, HOOD_X1=wx(x0)=NOSE); the swap emptied take(hood), so P.hood rotated an empty grid
  hatch:{hingeX:2900,glassBot:963,lampTop:870,bottom:870,sideHalf:535,garnishHalf:535,roofHalf:450},   // v3: the liftgate is the glass plus the body-colour lip above the tail lamps (rear_1.jpg: MITSUBISHI and GSX sit on that lip; M-11 VERIFIED: top-hinged at the roof's rear edge). bottom = lampTop 870 = the tail band's top (CALCULATED: drawing rear view, 13.65 mm/px on its printed 1740); sideHalf 535 CALCULATED (the lip 1069 wide in rear_1.jpg at M-08's calibration, 1745 / 973 px); roofHalf 450 ESTIMATED (M-11: opening ~900-950). The old hatch carried the whole tail panel down to 600 and +/-740 (into the cargo bay)
  molding:{x0:1400,x1:3900,y0:445,y1:455},   // FIX1 F-5: 1-cell strip (was a 50 mm band)
  bottomF:250,bottomR:280,floorC:230,floorR:310   // v3 DESIGN (M-11: floor heights NOT FOUND): the floor pan's top skin under the rig's carpets (front 250, under the rear seat 330), so the carpet lies on it; the saddle tank's lobes (M-11 VERIFIED layout) under the rear-seat floor; behind the axle the floor 280 clears the silencer (top 250). Factory ground clearance 117 (dims.md) is the lowest underbody point, the exhaust
};
function makeEclipse(){
  const M=ECLIPSE_M,XM=M.ovF+M.WB/2,wx=m=>(XM-m)/20,u=m=>m/20,mm=x=>XM-x*20;
  const g={S:M,wx,u,mm};
  const tab=(T,v)=>{if(v<=T[0][0])return T[0][1];for(let i=0;i<T.length-1;i++){const a=T[i],b=T[i+1];if(v<=b[0])return a[1]+(b[1]-a[1])*(v-a[0])/(b[0]-a[0]);}return T[T.length-1][1];};
  g.tab=tab;
  g.NOSE_X=wx(0);g.REAR_X=wx(M.L);g.AX_F=wx(M.ovF);g.AX_R=wx(M.ovF+M.WB);g.WR=u(M.hubY);g.ROCK=u(M.rocker);g.BELT=u(834);g.ROOF=u(1275);g.halfW=u(867.5);
  const TOPW=M.top.map(([x,y])=>[wx(x),u(y)]);g.TOP=TOPW;
  const topC=g.topC=x=>{const m=mm(x);if(m<M.top[0][0]||m>M.top[M.top.length-1][0])return -1;return u(tab(M.top,m));};
  const crownMM=m=>tab(M.crownT,m);   // v4: continuous table (v3: 20 / 40 / 30 with steps at the header and the hinge)
  g.crown=x=>u(crownMM(mm(x)));
  const top=g.top=(x,z)=>{const c=topC(x);if(c<0)return -1;const k=Math.abs(z)/43.375;return c-g.crown(x)*k*k;};
  g.topY=x=>topC(x)<0?(x>0?20:40):topC(x);
  const belt=g.belt=x=>u(tab(M.belt,mm(x)));
  const plan=g.plan=x=>u(tab(M.plan,mm(x)));
  const sLow=y=>tab(M.sLow,y*20);
  const A=M.aPillar,C=M.cPillar;
  const aEnv=(x,y)=>{const t=clampv((y*20-A.y0)/(A.y1-A.y0),0,1),xa=A.x0+(A.x1-A.x0)*t,ha=A.h0+(A.h1-A.h0)*t,m=mm(x);return u(ha+Math.max(0,m-xa)*.45);};
  const cEnv=(x,y)=>{const t=clampv((C.y0-y*20)/(C.y0-C.y1),0,1),xc=C.x0+(C.x1-C.x0)*t,hc=C.h0+(C.h1-C.h0)*t,m=mm(x);return u(hc+Math.max(0,xc-m)*.45);};
  g.aEnv=aEnv;g.cEnv=cEnv;
  const gh=g.gh=(x,y)=>{const tc=topC(x),sh=clampv(1275-tc*20,0,40);return Math.min(u(tab(M.tumble,y*20+sh)),aEnv(x,y),cEnv(x,y));};
  const EDGE_R=1.6;
  // v4: the body side below the window line: plan x tuck-under, less the shoulder roll (a quarter ellipse from ys up to yt, D at yt). Ahead of the cowl
  // there is no greenhouse: the roll runs up to the fender/hood top and the side meets the hood there (v3 put an 800 mm wide 'greenhouse' band above the
  // 740-834 belt ahead of the windshield: the step that made the nose read as a box)
  const R0=M.rollTopX[0],R1=M.rollTopX[1],rollAt=m=>{const T=M.roll;let i=0;while(i<T.length-2&&m>T[i+1][0])i++;const a=T[i],b=T[i+1],t=clampv((m-a[0])/(b[0]-a[0]),0,1);return [a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];};
  const SK=M.skirt,skTop=m=>m<SK.upM?SK.top:SK.top+(SK.upTop-SK.top)*((m-SK.upM)/(SK.m1-SK.upM))**2;
  const lowHalf=g.lowHalf=(x,y)=>{const m=mm(x),ym=y*20,inSk=m>=SK.m0&&m<=SK.m1;if(inSk&&ym<skTop(m))return u(SK.half);   // v4: the side skirt's face
    const p=plan(x)*(inSk?Math.max(sLow(y),SK.above):sLow(y)),[ys,D]=rollAt(m);if(ym<=ys)return p;
    const tc=topC(x),bt=belt(x)*20,w=clampv((m-R0)/(R1-R0),0,1),yt=Math.max(ys+20,(tc>0?tc*20:bt)*(1-w)+bt*w);const t=clampv((ym-ys)/(yt-ys),0,1);return p-u(D)*(1-Math.sqrt(1-t*t));};
  const GH0=M.aPillar.x0;
  const halfAt=g.halfAt=(x,y)=>{
    const b=belt(x),m=mm(x);
    let r;
    if(y<=b||m<GH0)r=lowHalf(x,y);else{const lo=lowHalf(x,b),gg=gh(x,y);r=y<b+1.5?lo+(gg-lo)*sm(b,b+1.5,y):gg;}
    const tc=topC(x);if(tc>0&&tc<b+.5){const dt=tc-y;if(dt>=0&&dt<EDGE_R){const q=EDGE_R-dt;r-=EDGE_R-Math.sqrt(Math.max(0,EDGE_R*EDGE_R-q*q));}}
    if(y>=g.ROCK&&y<g.ROCK+1.5){const q=g.ROCK+1.5-y;r-=1.5-Math.sqrt(Math.max(0,2.25-q*q));}
    {const TI=M.tailIn;if(m>TI.m0)r-=u(TI.A)*sm(TI.m0,TI.m1,m)*sm(TI.y0,TI.y1,y*20);}   // v4: the quarter above the rear bumper's bulge
    return r;};
  g.frontLimit=y=>y*20<510?wx(200):g.NOSE_X;g.rearLimit=y=>y*20<ECLIPSED.bumperR.top?wx(4100):g.REAR_X;   // v3 front: under the front fascia's top (510) the body stops at 200 (the bumper is the nose). v4: rear threshold = the rear bumper's top (720, under the lamp band: the drawing's step at 745-717 and rear_1.jpg's shut line under the lamps); the bumper covers below it
  g.bottom=x=>{const m=mm(x);return u(m<420?M.bottomF:(m<1150?(Math.abs(m-M.ovF)<=M.apronF.dx?M.apronF.bot:280):(m>3800?M.bottomR:M.rocker)));};   // v3: the inner fenders beside the bay end 390 mm up round the front axle (apronF), 280 elsewhere
  // v2 (2026-11-06): inside the engine bay's box there is no body below the hood (the bay is open underneath; its crossmember and shields are the rig's):
  // the old floor of 280 mm there ran through the engine, the gearbox and the rack
  g.bottomZ=(x,z)=>{const m=mm(x),b=g.bottom(x);if(m>=M.bay.x1&&m<=M.bay.x0&&Math.abs(z)<=u(m<M.arch.f.x-M.arch.f.r?M.bay.frontHalf:M.bay.half))return g.top(x,z)-2.4;   // v3: wider ahead of the front arches (bay.frontHalf)
    {const T=M.tunnel;if(m>=T.x0&&m<=T.x1&&Math.abs(z)<=u(T.half))return u(T.top);}   // the floor rises over the tunnel (v3: the v2 exhaust channel is gone: the exhaust runs in the tunnel, the cabin floor stays under the carpet)
    return (m>=1150&&m<=3800&&Math.abs(z)<u(m>M.arch.r.x-M.arch.r.r?M.tubR.zIn:560))?u(m>=M.floorStep?M.floorR:M.floorC):b;};
  g.YBOT=g.bottom;
  g.ARCH_R=u(M.arch.f.r);g.ARCH_F={x:wx(M.arch.f.x),y:u(M.arch.f.y),r:u(M.arch.f.r)};g.ARCH_RR={x:wx(M.arch.r.x),y:u(M.arch.r.y),r:u(M.arch.r.r)};
  g.archLip=(x,y)=>{let l=0;for(const a of [g.ARCH_F,g.ARCH_RR]){const d=Math.hypot(x-a.x,y-a.y);if(d>=a.r&&d<a.r+u(M.arch.lip))l=Math.max(l,.2*(1-(d-a.r)/u(M.arch.lip)));}return l;};
  g.profDist=(x,y)=>{let best=1e9;const T=TOPW;for(let i=0;i<T.length-1;i++){const a=T[i],b=T[i+1],dx=b[0]-a[0],dy=b[1]-a[1],L=dx*dx+dy*dy,t=L?clampv(((x-a[0])*dx+(y-a[1])*dy)/L,0,1):0;best=Math.min(best,Math.hypot(x-(a[0]+dx*t),y-(a[1]+dy*t)));}return best;};
  g.profDistZ=(x,y,z)=>{const k=Math.abs(z)/43.375;return g.profDist(x,y+g.crown(x)*k*k);};
  g.noseX=az=>g.NOSE_X;g.rearX=az=>g.REAR_X;
  g.xA=y=>wx(A.x0+(A.x1-A.x0)*clampv((y*20-A.y0)/(A.y1-A.y0),0,1));
  g.xC=y=>wx(C.x0+(C.x1-C.x0)*clampv((C.y0-y*20)/(C.y0-C.y1),0,1));
  g.DOOR_F=wx(M.door.front);g.DOOR_R=wx(M.door.rearTop);
  g.doorRear=y=>{const D=M.door,m=y*20;if(m>=D.rearMid[1])return wx(D.rearTop);if(m>=D.rearLow[1])return wx(D.rearMid[0]+(D.rearLow[0]-D.rearMid[0])*(D.rearMid[1]-m)/(D.rearMid[1]-D.rearLow[1]));
    return wx(D.rearLow[0]+(D.rearBot[0]-D.rearLow[0])*(D.rearLow[1]-m)/(D.rearLow[1]-D.rearBot[1]));};
  g.HOOD_X0=wx(M.hood.x1);g.HOOD_X1=wx(M.hood.x0);g.HOOD_HALF=u(M.hood.half);
  g.HATCH_X=wx(M.hatch.hingeX);
  g.HOOD_HINGE=[g.HOOD_X0,topC(g.HOOD_X0)+1.0];g.HATCH_HINGE=[g.HATCH_X,topC(g.HATCH_X)+1.0];
  return g;
}

/* ---- Eclipse detail tables (mm) ---- */
const ECLIPSED={
  bumperF:{face:[[130,50],[250,20],[400,0],[510,25]],top:510,   // v3: top 620 -> 510 (CALCULATED, drawing front view: the fascia's upper line under the headlamps, 13.56 mm/px on its printed 1740)
   bot:130,botSide:110,bow:40,cornerZ:500,cornerR:300,
    turn:{z0:740,z1:815,y0:380,y1:440},intake:{z:322,y0:180,y1:415,slot:384,bar:[296,318],dip:12},fog:{z:460,y:315,r:38,hz0:405,hz1:522,hy0:262,hy1:372},vent:{z0:565,z1:670,y0:216,y1:342,r:28},plate:{y:375,w:300,h:150}},   // v5 (Opus, Nov 13): from the drawing's front view (rows 111-127) and front_1.jpg: the intake's dark upper slot over one bar with the intercooler behind; round fog lenses (z 460, r 38) in dark rectangular housings; dark corner vents (brake ducts) outboard at 565-670
  // v4: rear bumper face CALCULATED from the drawing's side view (row by row): the bottom curves under from 4361 at 268 to 4140 at 190 (the tail 'curves
  // under'); rearmost 4375 at 340-400; 4350 at 630; its top 720 just under the lamp band (v3: top 600, face 4320-4365, bottom 220). bot 190 / botSide 180
  // (drawing: 162-216 under the overhang). recess: the plate recess, a rounded panel +/-365 x 490-700, 15 mm deep (drawing rear view: outer outline +/-367,
  // 475-683; rear_1.jpg at M-08's scale +/-363, 490-703; depth DESIGN). plate centre 590 (drawing rear view: 517-667; v3 450). reverse rounds 635 mm up at
  // +/-520, 96 across (drawing rear view: 633 at +/-525; ledger +/-510 MEASURED; v3 320 up: 300 mm low)
  bumperR:{face:[[190,4140],[205,4220],[225,4280],[255,4330],[290,4358],[340,4372],[400,4375],[550,4362],[630,4350],[690,4336],[720,4318]],top:720,sideTop:615,sideM:3950,bot:190,botSide:180,bow:25,cornerZ:560,cornerR:260,
    recess:{z:365,y0:490,y1:700,r:90,d:30},
    scallop:{zOut:585,endW:80,top:369,vZ:110,v:298,lip:258,d:30},
    plate:{y:590,w:300,h:150},exhaust:{z:-420,w:120,y:240},reverse:{z:520,y:635,r:48,dish:12}},
  // v5 (Opus, Nov 13): recess depth 15 -> 30 (DESIGN: rear_1.jpg shows the recess's upper brow throwing a clear shadow; 15 mm was one cell and did not read).
  // scallop: the two concave scallops across the lower bumper, meeting in a V at the centre (rear_1.jpg and the drawing's rear view both show them;
  // CALCULATED, photo 1.31 mm/px on the reverse lamps' 635 / drawing 2.26 mm/px on its printed 1740, heights x 1.017): outer ends 583 / 588 -> 585, top edge
  // 386 / 352 -> 369, the V's tip at the centre 308 / 287 -> 298, the lower lip 262 / 253 -> 258; the V starts ~124 / ~80 from the centre (110); depth DESIGN
  // (30: deepest under the top edge, which overhangs it, sloping back out to the lip). reverse.dish: the round dish the lamp sits in (rear_1.jpg: ~1.25x the
  // lamp's diameter -> a 12 mm ring)
  tail:{y0:733,y1:860,zIn:307,zOut:742.5,tipM:3945},   // v3: on the BODY's rear face (the lamps stay when the hatch opens: rear_1.jpg). y0 733 CALCULATED (drawing rear view); top row 860, under the hatch's lip (band top 870, drawing; M-08's photo reading 767-936 measured on a frame calibrated to the roof's rear edge reads high); centre panel 614 wide (zIn 307, CALCULATED, drawing rear view; rear_1.jpg ~580); zOut 742.5 MEASURED (ledger)
  head:{y0:520,y1:645,zIn:320,zOut:855,ambOut:755},   // v3: 520-645 mm up, inner end 320 from the centre (CALCULATED, drawing front view 511-633 x 1.023 and side view 507-618; v1 640-760 stood ~120 mm high); zOut/ambOut v1
  mirror:{x0:1640,x1:1820,y0:845,y1:955,out0:0,out1:150},   // v3: on the door's sail at the window's front corner, its foot on the belt (drawing side view: the black mirror base at ~1770-1860, 840-930; CALCULATED approx.); 180 x 110 housing (v1 size), 150 out from the belt-line skin it stands on
  spoiler:{top:1172,depth:45,bladeF:4080,rear:4235,frontE:[[3620,1072],[4080,1157],[4235,1172]],rearE:[[4100,928],[4235,1172]],zIn:420,zOut:520,taperM:3900,taper:.15,fillet:140,cornerR:140}   // v4: see eclipseSpoiler (side_1/side_2/drawing side profile, rear_1.jpg; CALCULATED). v5: fillet 60 -> 140, cornerR 50 -> 140 (rear_1.jpg at 1.27 mm/px:
  // the hoop's outer top corners ~125-160 and the opening's upper corners ~145; rear34_1.jpg and the drawing's rear view show the same big-radius hoop; v4's
  // small radii drew a square frame)
};
function eclipseTab(T,v){if(v<=T[0][0])return T[0][1];for(let i=0;i<T.length-1;i++){const a=T[i],b=T[i+1];if(v<=b[0])return a[1]+(b[1]-a[1])*(v-a[0])/(b[0]-a[0]);}return T[T.length-1][1];}

/* ---- bumpers: same construction as ae86Bumper (40 mm moulding, body cut back
   behind it), ECLIPSED sections and Eclipse stations. Bumpers body-coloured
   (2Gb); the lower intake is a genuine recess with slat bars, not a flat dark
   panel; the front plate rides proud on a bracket over the intake's centre. ---- */
function eclipseBumperIn(g,front,x,y,z,T){const B=front?ECLIPSED.bumperF:ECLIPSED.bumperR,m=g.mm(x),ym=y*20,az=Math.abs(z)*20;
  if(ym>eclipseBTop(B,m)||(front?m>660:m<3650))return false;const arch=front?g.ARCH_F:g.ARCH_RR;if(Math.hypot(x-arch.x,y-arch.y)<arch.r)return false;
  const hw=g.halfAt(x,Math.min(y,g.u(B.top)))*20;if(az>hw+4)return false;
  const sm=(a,b,v)=>Math.max(0,Math.min(1,(v-a)/(b-a))),bot=front?B.bot+(B.botSide-B.bot)*sm(200,360,m):B.botSide+(B.bot-B.botSide)*sm(3800,4050,m);if(ym<bot)return false;
  const k=az/867.5,pl=B.bow*k*k+(az>B.cornerZ?(B.cornerR-Math.sqrt(Math.max(0,B.cornerR*B.cornerR-Math.min(B.cornerR,az-B.cornerZ)**2))):0);
  const d=front?m-(eclipseTab(B.face,ym)+pl):(eclipseTab(B.face,ym)-pl-eclipseRecess(B,az,ym))-m;if(d<0)return false;return d<=T||hw-az<=T;}
function eclipseBumperOutside(g,front,x,y,z){const B=front?ECLIPSED.bumperF:ECLIPSED.bumperR,m=g.mm(x),ym=y*20,az=Math.abs(z)*20;
  if(ym>eclipseBTop(B,m)||(front?m>660:m<3650))return false;const arch=front?g.ARCH_F:g.ARCH_RR;if(Math.hypot(x-arch.x,y-arch.y)<arch.r)return false;
  const sm=(a,b,v)=>Math.max(0,Math.min(1,(v-a)/(b-a))),bot=front?B.bot+(B.botSide-B.bot)*sm(200,360,m):B.botSide+(B.bot-B.botSide)*sm(3800,4050,m);if(ym<bot)return false;
  const k=az/867.5,pl=B.bow*k*k+(az>B.cornerZ?(B.cornerR-Math.sqrt(Math.max(0,B.cornerR*B.cornerR-Math.min(B.cornerR,az-B.cornerZ)**2))):0);
  return (front?m-(eclipseTab(B.face,ym)+pl):(eclipseTab(B.face,ym)-pl-eclipseRecess(B,az,ym))-m)<0;}
// v4: the bumper cover's top edge at station m: the rear cover's top is B.top (720, under the lamps) behind B.sideM and B.sideTop (615) ahead of it, along the
// rear quarter to the arch (side_2.jpg: the cover's top line drops from the lamp's tip at ~3950 and runs forward at ~621; drawing side view ~605)
function eclipseBTop(B,m){return (B.sideTop&&m<B.sideM)?B.sideTop:B.top;}
// v4: depth of the rear bumper's plate recess at (|z|, height) in mm (a rounded rectangle, B.recess), 0 outside it
function eclipseRecess(B,az,ym){const R=B.recess;if(!R)return 0;const yc=(R.y0+R.y1)/2,hh=(R.y1-R.y0)/2,dz=Math.max(0,az-(R.z-R.r)),dy=Math.max(0,Math.abs(ym-yc)-(hh-R.r));return Math.hypot(dz,dy)<=R.r?R.d:eclipseScallop(B,az,ym);}
// v5: depth of the lower bumper's scallops at (|z|, height) in mm (B.scallop), 0 outside them: the top edge level at S.top, falling in a V to S.v at the
// centre and rounding down to the lip over the outer S.endW; deepest under the top edge, sloping back out to the lip
function eclipseScallop(B,az,ym){const S=B.scallop;if(!S||az>=S.zOut||ym<=S.lip)return 0;
  const yT=az<S.vZ?S.v+(S.top-S.v)*az/S.vZ:(az>S.zOut-S.endW?S.top-(S.top-S.lip)*((az-(S.zOut-S.endW))/S.endW)**2:S.top);
  return ym<yT?S.d*(ym-S.lip)/(yT-S.lip):0;}
function eclipseBumperRelief(g,x,y,z,more){const T=50+(more||0);return eclipseBumperIn(g,true,x,y,z,T)||eclipseBumperIn(g,false,x,y,z,T)||(!more&&(eclipseBumperOutside(g,true,x,y,z)||eclipseBumperOutside(g,false,x,y,z)));}
function eclipseBumper(g,front){
  const B=front?ECLIPSED.bumperF:ECLIPSED.bumperR,{wx,u,halfAt}=g,mmx=x=>g.mm(x);
  const arch=front?g.ARCH_F:g.ARCH_RR,ext=Math.ceil(g.halfW+1.5);
  const plan=az=>{const k=az/867.5;let d=B.bow*k*k;if(az>B.cornerZ){const q=Math.min(B.cornerR,az-B.cornerZ);d+=B.cornerR-Math.sqrt(B.cornerR*B.cornerR-q*q);}return d;};
  const x0=front?wx(660):wx(4380),x1=front?wx(-12):wx(3650);
  const G=hgrid(Math.min(x0,x1)-1,Math.max(x0,x1)+1,u(Math.min(B.bot,B.botSide))-1,u(B.top)+1,-ext,ext);
  eachCell(G,null,(i,j,k,n)=>{if(eclipseBumperIn(g,front,i/HR,j/HR,k/HR,40))G.d[n]=1;});
  shellHi(G,(x,y,z,inner)=>{if(inner)return 0x1a1b1d;return PAINT;},2);
  const faceCells=(pred,fn)=>eachCell(G,null,(i,j,k,n)=>{if(G.d[n]<0)return;const x=i/HR,y=j/HR,z=k/HR;if(pred(mmx(x),y*20,Math.abs(z)*20,z))fn(n,x,y,z);});
  const lamps={};const put=(kind,i,j,k,c)=>{(lamps[kind]=lamps[kind]||[]).push([i,j,k,c]);};
  if(front){
    const T=B.turn;
    faceCells((m,ym,az)=>az>=T.z0&&az<=T.z1&&ym>=T.y0&&ym<=T.y1&&m<eclipseTab(B.face,ym)+plan(az)+12,(n,x,y,z)=>{const az=Math.abs(z)*20,edge=(az<T.z0+12||az>T.z1-12||y*20<T.y0+12||y*20>T.y1-12);
      put(edge?'frame':'famb',Math.round(x*HR),Math.round(y*HR),Math.round(z*HR),edge?0x1a1b1d:0xf09a2a);G.d[n]=-1;});   // front bumper amber markers, amber
    const I=B.intake;
    const inIntake=(m,ym,az)=>az<=I.z&&ym>=I.y0&&ym<=I.y1&&m<eclipseTab(B.face,ym)+plan(az)+30;
    const outerMap=pred=>{const outer=new Map();faceCells(pred,(n,x,y,z)=>{const key=y+','+z,o=outer.get(key);if(!o||x>o.x)outer.set(key,{x,n});});return outer;};
    // v5: the intake (front_1.jpg, drawing rows 111-127): the outer skin is opened 10 mm deep; one bar stays at the surface (dipping in a shallow V at the
    // centre, as the 2Gb's); above it a near-black slot, below and behind it the intercooler's core (finned grey)
    const barAt=(ym,az)=>{const dp=az<90?I.dip*(1-az/90):0;return ym>=I.bar[0]-dp&&ym<=I.bar[1]-dp;};
    for(const [key,o] of outerMap(inIntake)){const [y,z]=key.split(',').map(Number),ym=y*20,az=Math.abs(z)*20;if(barAt(ym,az)){G.d[o.n]=0x2c2e33;continue;}G.d[o.n]=-1;}
    for(const [key,o] of outerMap(inIntake)){const [y,z]=key.split(',').map(Number),ym=y*20,az=Math.abs(z)*20;if(barAt(ym,az))continue;
      G.d[o.n]=ym>=I.slot?0x0b0c0e:(Math.round(ym/10)%2?0x23262b:0x32363c);}
    // v5: dark corner vents outboard of the fogs (drawing: 565-670, 216-342), opened the same way
    const V=B.vent,inVent=(m,ym,az)=>{const dz=Math.max(0,Math.max(V.z0+V.r-az,az-(V.z1-V.r))),dy=Math.max(0,Math.max(V.y0+V.r-ym,ym-(V.y1-V.r)));return Math.hypot(dz,dy)<=V.r;};   // the front-most cell per (height, |z|) is taken: the cover's corners stand well behind the face table there
    for(const [,o] of outerMap(inVent))G.d[o.n]=-1;
    for(const [,o] of outerMap(inVent))G.d[o.n]=0x0d0e10;
    // v5: fog lamps: a dark rectangular housing opened 10 mm into the cover, the round lens in it (lens pale, a chrome ring)
    const F=B.fog,inHous=(m,ym,az)=>az>=F.hz0&&az<=F.hz1&&ym>=F.hy0&&ym<=F.hy1;
    for(const [,o] of outerMap(inHous))G.d[o.n]=-1;
    for(const [key,o] of outerMap(inHous)){const [y,z]=key.split(',').map(Number),r=Math.hypot(Math.abs(z)*20-F.z,y*20-F.y);
      if(r<=F.r){const [x]=[o.x];put(r>F.r-10?'frame':'fog',Math.round(x*HR),Math.round(y*HR),Math.round(z*HR),r>F.r-10?0x9aa1a8:0xdfe2dc);G.d[o.n]=-1;}else G.d[o.n]=0x141517;}   // (glass static - not switchable; recorded limitation)
  }else{
    const E=B.exhaust;faceCells((m,ym,az,z)=>z*20>=E.z-E.w&&z*20<=E.z+E.w&&ym<E.y+45,(n)=>{G.d[n]=-1;});   // tail-pipe cut-out, car's LEFT only (MEASURED single left tip)
    // reverse rounds in the bumper fascia at +/-510 (2Gb relocation, MEASURED). v5 (rear_1.jpg close-up): a clear lens (its reflector darker at the centre)
    // in a chrome bezel, the lamp in a shallow round dish whose rim reads as a ring of shade: the rearmost cell of the ring is taken out (the cover's next
    // cell shows 10 mm in). v4 drew a black ring round a white disc
    const R=B.reverse,rearMap=pred=>{const o=new Map();faceCells(pred,(n,x,y,z)=>{const key=y+','+z,c=o.get(key);if(!c||x<c.x)o.set(key,{x,n});});return o;};
    for(const [key,o] of rearMap((m,ym,az)=>Math.hypot(az-R.z,ym-R.y)<=R.r+R.dish&&m>eclipseTab(B.face,ym)-plan(az)-30)){const [y,z]=key.split(',').map(Number),r=Math.hypot(Math.abs(z)*20-R.z,y*20-R.y);
      if(r>R.r){G.d[o.n]=-1;continue;}const edge=r>R.r-10;
      put(edge?'frame':'wht',Math.round(o.x*HR),Math.round(y*HR),Math.round(z*HR),edge?0xb3bac1:(r<14?0xc4cad0:0xeceff1));G.d[o.n]=-1;}
    // v5: the shadow line under the plate recess's brow and under the scallops' top edges (rear_1.jpg: both edges overhang and throw a sharp shadow): the
    // rearmost cell of the row just under each upper edge is the paint in shade (PAINT_SHADE, as a shut line), so the relief reads in any colour
    {const rm=new Map(),S=B.scallop,RC=B.recess;faceCells((m,ym,az)=>ym>S.lip&&ym<=RC.y1+10&&az<=Math.max(RC.z,S.zOut),(n,x,y,z)=>{const key=y+','+z,c=rm.get(key);if(!c||x<c.x)rm.set(key,{x,n});});
     const recD=(az,ym)=>eclipseRecess({recess:RC},az,ym),scD=(az,ym)=>eclipseScallop(B,az,ym);
     for(const [key,o] of rm){const [y,z]=key.split(',').map(Number),ym=y*20,az=Math.abs(z)*20;
       if(((recD(az,ym)>0&&recD(az,ym+10)===0)||(scD(az,ym)>0&&scD(az,ym+10)===0))&&G.d[o.n]===PAINT)G.d[o.n]=PAINT_SHADE;}}
  }
  const out={grid:G,lamps:{}};
  for(const k in lamps){const L=lamps[k];let b=[1e9,-1e9,1e9,-1e9,1e9,-1e9];for(const [i,j,kk] of L)b=[Math.min(b[0],i),Math.max(b[1],i),Math.min(b[2],j),Math.max(b[3],j),Math.min(b[4],kk),Math.max(b[5],kk)];
    const Gl=new Grid(b[0],b[1],b[2],b[3],b[4],b[5]);for(const [i,j,kk,c] of L)Gl.set(i,j,kk,c);out.lamps[k]=Gl;}
  const pl=B.plate,py=pl.y;out.plate={x:wx(eclipseTab(B.face,py))+(front?.6:-.6),y:u(py),w:u(pl.w),h:u(pl.h)};
  return out;
}

/* ---- Eclipse lamps: FIXED exposed lamps — NO pods, NO pop-up mechanism
   (the Eclipse's defining difference from the Trueno; a pod on this car is a
   build failure). Headlamps are taken out of the nose skin (amber OUTER ends,
   black interior + chrome reflectors); the tail band is taken out of the hatch
   (outer red 400 each, centre ECLIPSE panel 680, height 140, NO amber in the
   US cluster). Each lamp gets a dark backing cell so the unit reads as a
   housed lamp, not a painted patch. ---- */
function eclipseLamps(g,hi){
  const {wx,u,halfAt,NOSE_X,REAR_X}=g;
  const out={},cell=(kind,i,j,k,c)=>{(out[kind]=out[kind]||[]).push([i,j,k,c]);};
  const HD=ECLIPSED.head,TL=ECLIPSED.tail,BUCKET=0x17181c;
  const B=hi.body,H=hi.trunk,HD2=hi.hood;
  const CHROME=0xa3acb4,AMBER=0xf09a2a,DARK=0x1a1b1d,BULB=0xeae6d0,RED=0xc0201c,BOWL=0x5d666f,BOWLR=0xd7dce0;   // v5: chrome field darker (it read as a white slab); bowls   // RED = the existing outer red (enforcer PASS), shared by the centre panel
  // ---- FIX1 V-1: FRONT-FACING corner lamps on the nose front plane ----
  // Old code scanned each (j,k) for the body's MAXIMUM i and tiled whatever
  // surface it found with an alternating (j+k)%2 pattern: above the nose
  // top (720 mm < lamp band top 760 mm) the body's front-most cell is the
  // sloping hood/fender top, so the lamp tiled a slope lying on the nose
  // top as a checkerboard. New code: a vertical face at the nose front
  // plane (body front cells sit at i=floor(NOSE_X*HR)=200), full spec band
  // 640..760 x 355..855, amber at the OUTER ends, chrome field, bulb
  // blocks, dark bezel. FIX2 H-1: the face is STEPPED onto the body's own
  // front surface (no flat plane, no wedge) — see the block below.
  // Body cells at the face plane are removed first (no z-fighting).
  const y0H=Math.round(u(HD.y0)*HR),y1H=Math.round(u(HD.y1)*HR),zInH=Math.round(u(HD.zIn)*HR),zOutH=Math.round(u(HD.zOut)*HR),zAmbH=Math.round(u(HD.ambOut)*HR);
  const iFace=Math.floor(NOSE_X*HR);
  // ---- FIX2 H-1: STEPPED face following the body's own front surface ----
  // The old flat face at iFace spanned +-86 cells (860mm) while the body's
  // nose at the face plane spans only ~+-72 cells (plan rounding: halfAt +
  // NOSE_RC) and ~+-79 cells at the rounding tangent, so the flat face plus
  // its 32-cell wedge stuck out up to ~140mm past the nose corners as boxes
  // bolted on. New code: for each (j,k) the face cell sits AT the body's own
  // front-most surface cell iFront (measured from the natural body/hood
  // grids before any deletion), so the lamp follows the nose curvature and
  // cannot protrude past it; no wedge is needed because the face IS the
  // surface. Top rows (j>=y1H-3, above the 720mm nose-top profile) only step
  // where the front surface is within 8 cells of the tip plane, so the face
  // never tiles the receding hood slope (the original V-1 bug). Amber stays
  // at the outer end (az>=zAmbH on the face + the side wrap below); bezel =
  // boundary of the stepped face region; bulb blocks kept at az 50/64, rows
  // 68-72. Spec zOut 855 retained as the station; the built face ends where
  // the body ends (~79 cells) — the spec's 500mm is the lamp's developed
  // length incl. wrap, not a flat frontal span the nose can contain
  // (flagged for the verifier; SPEC not edited here).
  const iFront=new Map();
  for(let j=y0H;j<=y1H;j++)for(let k=-zOutH;k<=zOutH;k++){
    const az=Math.abs(k);if(az<zInH)continue;
    let f=-1;for(let i=iFace;i>=iFace-40;i--){if(B.get(i,j,k)>=0||HD2.get(i,j,k)>=0){f=i;break;}}
    if(f<0)continue;
    if(j>=y1H-3&&f<iFace-8)continue;
    iFront.set(j+','+k,f);
  }
  for(const [key,f] of iFront){
    const [j,k]=key.split(',').map(Number),az=Math.abs(k);
    if(B.get(f,j,k)>=0)B.set(f,j,k,-1);
    if(HD2.get(f,j,k)>=0)HD2.set(f,j,k,-1);
    const nb=(jj,kk)=>iFront.has(jj+','+kk);
    const frame=j===y0H||j===y1H||az===zInH||!nb(j,k-1)||!nb(j,k+1)||!nb(j-1,k)||!nb(j+1,k);
    const jm=Math.round((y0H+y1H)/2),bd=Math.min(Math.hypot(az-50,j-jm),Math.hypot(az-64,j-jm));   // v5: two round reflector bowls at the lamp's mid height (front_1.jpg); they were set at 700 mm, above the lamp, and never drawn
    const c=frame?DARK:(az>=zAmbH?AMBER:(bd<=1.5?BULB:bd<=3?BOWLR:bd<=4?BOWL:CHROME));
    cell('head',f,j,k,c);
  }
  // Amber wrap round the corner: the body's side-surface cells at the nose
  // (outermost |k| per (i,j), i near the nose plane, amber z-band) are
  // recoloured amber in place, so the amber continues round the corner
  // instead of stopping dead at the face edge.
  for(let j=y0H;j<=y1H;j++)for(let i=iFace-8;i<=iFace;i++){
    for(const s of [-1,1]){let km=-1;for(let k=B.z0;k<=B.z1;k++)if(s*k>0&&B.get(i,j,k)>=0)km=Math.max(km,s*k);
      if(km>0&&km>=zAmbH&&g.mm(i/HR)<450)B.set(i,j,s*km,AMBER);}
  }
  // ---- v4: the tail lamps as two lens units wrapped round the corners + the darker centre panel (rear_1.jpg, rear34_1/2.jpg, side_1/2.jpg) ----
  // Each lens is the band of exterior (PAINT) body cells between yb and yt, parametrised by p = the distance from the lens's inner end along the tail
  // ((|z| - zIn) across the rear face plus (4268 - station) along the side): its top edge falls gently from 860 at the inner end (850 by mid-lens) then
  // rounds down to the bottom edge at the tip, the bottom edge level at 733 all the way (rear_1.jpg: the outer end's top curves down to a tip at the band's
  // bottom; side_2.jpg along the side: top 856 at 4180, 837 at 4076, 797 at 3998, 756 at 3959, tip 734 at 3946, bottom level ~735; CALCULATED on its
  // wheel centres, 2.596 mm/px, heights 2.70 on the 1275 roof); the tip at station 3945 (side_1.jpg 3938). A darker red block sits in each lens's inner
  // part (rear_1.jpg), a 10 mm dark gap separates the lenses from the centre panel, and the centre panel (ECLIPSE) is a darker red than the lenses (v3:
  // one flat band cut at the rearmost cell of each row, which scattered on the curved corners)
  const y0T=Math.round(u(TL.y0)*HR),y1T=Math.round(u(TL.y1)*HR),zInT=TL.zIn,FACE=4268,pTip=(halfAt(wx(TL.tipM),u(800))*20-zInT)+(FACE-TL.tipM);
  const LENS=0xc0201c,LENS_D=0x86130f,PANEL=0x961814;
  const iTip=Math.round(wx(TL.tipM)*HR);
  for(let j=y0T;j<=y1T;j++)for(let k=B.z0;k<=B.z1;k++)for(let i=B.x0;i<=iTip;i++){
    if(B.get(i,j,k)!==PAINT)continue;const s=k<0?-1:1,az=Math.abs(k)*10,ym=j*10,m=g.mm(i/HR);
    const open=(a,b,c)=>B.get(a,b,c)<0&&H.get(a,b,c)<0;if(!(open(i-1,j,k)||(k!==0&&open(i,j,k+s))))continue;   // exposed rearward or outward (not just upward)
    if(az<zInT){if(m<FACE-30)continue;const edge=j===y0T||j===y1T||az>=zInT-14;cell('garnish',i,j,k,edge?DARK:PANEL);}
    else{const p=(az-zInT)+Math.max(0,FACE-m);if(p>pTip)continue;const q=p/pTip,yt=q<=.5?860-20*q:740+110*Math.sqrt(Math.max(0,1-((q-.5)/.5)**2)),yb=733;if(ym<yb||ym>yt)continue;
      const edge=ym<yb+10||ym>yt-10,dk=p>=30&&p<=150&&ym>=770&&ym<=835;cell('red',i,j,k,edge?DARK:(dk?LENS_D:LENS));}
    B.set(i,j,k,-1);if(B.inb(i+1,j,k)&&B.get(i+1,j,k)<0)B.set(i+1,j,k,BUCKET);
  }
  const out2={};for(const k in out){const L=out[k];let b=[1e9,-1e9,1e9,-1e9,1e9,-1e9];for(const [i,j,kk] of L)b=[Math.min(b[0],i),Math.max(b[1],i),Math.min(b[2],j),Math.max(b[3],j),Math.min(b[4],kk),Math.max(b[5],kk)];
    const Gl=new Grid(b[0],b[1],b[2],b[3],b[4],b[5]);for(const [i,j,kk,c] of L)Gl.set(i,j,kk,c);out2[k]=Gl;}
  return out2;
}

function eclipseMirror(g,sd){
  const {wx,u,halfAt}=g,M=ECLIPSED.mirror;
  const xu0=wx(M.x1),xu1=wx(M.x0),yu0=u(M.y0),yu1=u(M.y1);
  let zSide=0;for(let i=Math.round(xu0*HR);i<=Math.round(xu1*HR);i++)for(let j=Math.round(yu0*HR);j<=Math.round(yu0*HR)+1;j++){const h=halfAt(i/HR,j/HR);if(h>zSide)zSide=h;}   // v3: the skin at the housing's foot (the belt), so the housing stands on the door
  const za0=zSide+u(M.out0),za1=zSide+u(M.out1);
  const kA=Math.round(sd*za0*HR),kB=Math.round(sd*za1*HR),k0=Math.min(kA,kB),k1=Math.max(kA,kB);
  const sh=new Grid(Math.round(xu0*HR),Math.round(xu1*HR),Math.round(yu0*HR),Math.round(yu1*HR),k0,k1);
  sh.fill(()=>PAINT);
  const i0=Math.round(xu0*HR),j0=Math.round(yu0*HR),j1=Math.round(yu1*HR);
  const gl=new Grid(i0,i0+1,j0+2,j1-2,k0+1,k1-1);
  gl.fill(()=>0x9bb4c0);
  const cx=i0/HR,cy=(j0+j1)/2/HR,cz=sd*(za0+za1)/2;
  return {shell:sh,glass:gl,glassCenter:[cx,cy,cz],glassSize:[(M.x1-M.x0)/20,(M.y1-M.y0)/20]};
}

/* ---- badges (v3, M-08 positions, CALCULATED from rear_1.jpg): plain block lettering in 5 mm cells (mesh scale .25), each letter cell set
   5 mm proud of the surface under it, column by column, so the letters follow the panel and touch it. No maker logo artwork is drawn.
   ECLIPSE: silver, centred on the red centre panel (body-mounted), span ~435 (here 430: 5x7 glyphs, each pixel 2 cells wide, 20 mm gaps), 35 mm tall
   (M-08 ~34), centred in the band. MITSUBISHI (dark, span ~200; here 210) centred 395 mm LEFT and GSX (span ~115; here 110) centred 415 mm RIGHT, both
   on the hatch's lip above the lamps, 25 mm tall (M-08), their centre 22 mm above the band's top (M-08: 958 over a 936 band top). v5: the M is five
   cells wide (its 3-cell glyph read as an H: 'HITSUBISHI'); MITSUBISHI now spans 220. ---- */
const ECLIPSE_FONT7={E:['11111','10000','10000','11110','10000','10000','11111'],C:['01111','10000','10000','10000','10000','10000','01111'],
  L:['10000','10000','10000','10000','10000','10000','11111'],I:['1','1','1','1','1','1','1'],P:['11110','10001','10001','11110','10000','10000','10000'],
  S:['01111','10000','10000','01110','00001','00001','11110']};
const ECLIPSE_FONT5={M:['10001','11011','10101','10001','10001'],I:['1','1','1','1','1'],T:['111','010','010','010','010'],S:['111','100','111','001','111'],
  U:['101','101','101','101','111'],B:['110','101','110','101','110'],H:['101','101','111','101','101'],G:['111','100','101','101','111'],X:['101','101','010','101','101']};
function eclipseWord(word,font,sx,gap,zc,yc,surf,col){   // yc, zc: centre in 5 mm cells; surf(j5,k5): the rearmost surface cell (5 mm index) at that row/column, or null
  const rows=font[word[0]].length,ws=[...word].map(ch=>font[ch][0].length*sx),tot=ws.reduce((a,b)=>a+b,0)+gap*(word.length-1),cells=[];
  let kz=Math.round(zc-tot/2);   // seen from behind (looking forward, +x) the viewer's left is the car's left (-z): the word runs from -z to +z
  for(let w=0;w<word.length;w++){const gl=font[word[w]];
    for(let r=0;r<rows;r++)for(let q=0;q<gl[r].length;q++)if(gl[r][q]==='1')for(let d=0;d<sx;d++){const k=kz+(q*sx+d),j=Math.round(yc+(rows-1)/2-r),f=surf(j,k);if(f!==null)cells.push([f-1,j,k,col]);}
    kz+=ws[w]+gap;}
  return cells;}
function eclipseBadges(hi,lamps){
  const out=[],mkG=L=>{let b=[1e9,-1e9,1e9,-1e9,1e9,-1e9];for(const [i,j,k] of L)b=[Math.min(b[0],i),Math.max(b[1],i),Math.min(b[2],j),Math.max(b[3],j),Math.min(b[4],k),Math.max(b[5],k)];
    const G=new Grid(b[0],b[1],b[2],b[3],b[4],b[5]);for(const [i,j,k,c] of L)G.set(i,j,k,c);return G;};
  const rearmost=Gs=>(j5,k5)=>{const j=Math.floor(j5/2),k=Math.floor(k5/2);let f=null;for(const G of Gs){for(let i=G.x0;i<=G.x1;i++)if(G.get(i,j,k)>=0){f=f===null?i:Math.min(f,i);break;}}return f===null?null:2*f-1;};   // 10 mm cell i spans 5 mm cells 2i-1..2i+1
  const TL=ECLIPSED.tail,u5=mm=>mm/5;
  if(lamps&&lamps.garnish){const L=eclipseWord('ECLIPSE',ECLIPSE_FONT7,2,4,0,u5((TL.y0+TL.y1)/2),rearmost([lamps.garnish]),0xcfd4da);if(L.length)out.push({grid:mkG(L),scale:.25,onHatch:false});}
  const yl=u5(ECLIPSE_M.hatch.bottom+22),lip=rearmost([hi.trunk]);
  for(const [w,zc,sx,col] of [['MITSUBISHI',-395,1,0x1a1b1d],['GSX',415,2,0x2a2c30]]){const L=eclipseWord(w,ECLIPSE_FONT5,sx,2,u5(zc),yl,lip,col);if(L.length)out.push({grid:mkG(L),scale:.25,onHatch:true});}
  return out;
}

/* ---- cargo bay (10 mm cells): load floor, side trims, lock-panel trim; the
   parcel shelf on its hinge behind the seat back. ---- */
function eclipseCargo(g,hi,garnish){
  const fixed=new Grid(-238,-116,52,72,-96,96);
  fixed.fill((x,y,z)=>{
    if(y===52&&x>=-216&&x<=-116&&Math.abs(z)<=48)return 0x2b2c30;   // load floor (520 mm, RIG cargo floorY 26 units)
    if(y>52&&y<=70&&Math.abs(z)>=44&&Math.abs(z)<=48&&x>=-216&&x<=-116)return 0x2a2b2f;   // side trims
    if(x>=-238&&x<=-232&&y>=52&&y<=70&&Math.abs(z)<=48)return 0x2a2b2f;   // lock-panel trim at the tail opening
    return -1;});
  const shelf=new Grid(-216,-116,70,71,-92,92);
  shelf.fill(()=>0x2b2c30);
  return {fixed,shelf,pivot:[-58,35]};
}
function eclipseDPillarTrim(g,hi){
  const G=new Grid(-238,-90,60,126,-84,84);
  G.fill((x,y,z)=>{
    if(Math.abs(z)>=76&&Math.abs(z)<=83&&x>=-216&&x<=-90&&y>=60&&y<=120)return 0x3a3c41;   // D-pillar side trims on the opening walls
    if(y>=120&&y<=126&&x>=-110&&x<=-90&&Math.abs(z)<=78)return 0x3a3c41;   // roof rear trim
    return -1;});
  return G;
}

/* ---- v4: the GSX hoop spoiler, from side_1.jpg / side_2.jpg (side profile, each calibrated on its own wheel centres: 3.21 / 2.596 mm/px), the
   drawing's side view and rear_1.jpg (rear view). Two swept arms stand on the hatch beside its glass and carry the blade across the top, high over
   the deck with daylight under it (fan-details 1). Side profile (CALCULATED): the arm's upper edge runs straight from its front foot on the hatch at
   3620 (side_1 3600, side_2 3596; drawing ~3700) up to the blade's top 1172 at 4080 and on, shallower, to the rear tip at 4235 (side_1 4259, side_2
   4159, drawing 4287); the trailing edge drops nearly vertically from the tip to the deck at 4100 (side_1 4114, side_2 4089, drawing 4098). Blade
   top 1172 (drawing 1165-1186), 45 mm deep (rear_1.jpg ~40). Rear view (rear_1.jpg at M-08's scale): the arms' outer faces +/-540, inner +/-412,
   so the arms stand at +/-420..520 (M-11's feet centres +/-460 from the same photo), on the hatch frame beside the glass (+/-420), narrowing toward
   the front foot (DESIGN); the blade's underside meets the arms in a 60 mm fillet, its top corners round 50 mm. Each foot cell sits one cell above
   the hatch's (or its glass's) topmost cell in that column: seated on the surface, never in it. v3: a 150 mm blade at 1120-1150 on stubby feet over
   3830-3970 (it barely read). ---- */
function eclipseSpoiler(g,trunk,glassRW){
  const S=ECLIPSED.spoiler,XM=ECLIPSE_M.ovF+ECLIPSE_M.WB/2,iOf=m=>Math.round((XM-m)/10),mOf=i=>XM-i*10;
  const lin=(P,y)=>{const [a,b]=[P[0],P[P.length-1]];if(y<=a[1])return a[0];for(let n=0;n<P.length-1;n++){const p=P[n],q=P[n+1];if(y<=q[1])return p[0]+(q[0]-p[0])*(y-p[1])/(q[1]-p[1]);}return b[0];};
  const kz=Math.round(S.zOut/10),G=new Grid(iOf(S.rear),iOf(S.frontE[0][0])+1,Math.floor(S.rearE[0][1]/10)-6,Math.ceil(S.top/10),-kz,kz);
  const topJ=(i,k)=>{let t=null;for(const H of [trunk,glassRW])for(let j=H.y1;j>=H.y0;j--)if(H.get(i,j,k)>=0){if(t===null||j>t)t=j;break;}return t;};
  const yb=S.top-S.depth;
  for(let i=G.x0;i<=G.x1;i++){const m=mOf(i),zIn=S.zIn+Math.max(0,S.taperM-m)*S.taper;for(let k=-kz;k<=kz;k++){const az=Math.abs(k)*10,arm=az>=zIn&&az<=S.zOut;if(az>S.zOut)continue;
    const jt=topJ(i,k);if(jt===null)continue;
    for(let j=jt+1;j<=G.y1;j++){const ym=j*10;if(ym>S.top)break;
      const F=lin(S.frontE,ym),R=lin(S.rearE,ym);if(m>R)continue;
      let on=false;
      if(arm)on=m>=F;   // the swept arm (side profile between its upper/front and trailing edges)
      if(!on&&ym>=yb&&m>=Math.max(S.bladeF,F))on=true;   // the blade across the top
      if(!on&&az>=S.zIn-S.fillet&&az<S.zIn&&ym>=yb-S.fillet&&ym<yb&&m>=Math.max(S.bladeF,F)&&Math.hypot(az-(S.zIn-S.fillet),ym-(yb-S.fillet))>=S.fillet)on=true;   // fillet under the blade's ends
      if(on&&az>S.zOut-S.cornerR&&ym>S.top-S.cornerR&&Math.hypot(az-(S.zOut-S.cornerR),ym-(S.top-S.cornerR))>S.cornerR)on=false;   // rounded top corners
      if(on)G.set(i,j,k,PAINT);}}}
  return G;
}

/* ---- Eclipse body: same architecture as buildAE86Body (solid -> depth ->
   wheel openings -> tower pockets -> bay/tunnel/exhaust carves -> panels out
   -> skin -> hatch opening -> windows -> glass slabs -> rubber rings ->
   moulding rib -> shut lines), Eclipse tables and Eclipse belt/roof heights
   (785 / 1266, not the AE86's 873 / 1335). Glass is neutral dark (OPEN-TINT:
   the AE86 bronze must NOT be imported, and no tint is measured yet). ---- */
function buildEclipseBody(g){
  const M=ECLIPSE_M,{NOSE_X,REAR_X,AX_F,AX_R,WR,BELT,ROOF,u,wx,halfAt,top,topC,belt}=g;
  const INT=0x2a2b2e,UNDER=0x15171a,SASH=0x141517,GASK=0x131416,SEAM=0x1d1112,MOLD=0x18191b;
  const hw=g.halfW,ext=Math.ceil(hw+1.5);
  const S0=hgrid(Math.floor(REAR_X-2),Math.ceil(NOSE_X+1),0,ROOF+2,-ext,ext);
  const solidAt=(x,y,z)=>{if(x>g.frontLimit(y)||x<g.rearLimit(y))return false;if(y<g.bottomZ(x,z))return false;if(typeof eclipseBumperRelief==='function'&&eclipseBumperRelief(g,x,y,z))return false;
    if(y>top(x,z))return false;return Math.abs(z)<=halfAt(x,y)+g.archLip(x,y);};
  g.solidAt=solidAt;
  eachCell(S0,null,(i,j,k,n)=>{const x=i/HR,y=j/HR,z=k/HR;if(solidAt(x,y,z))S0.d[n]=1;});
  const DEP=new Uint8Array(S0.d.length);{const sx=S0.ny*S0.nz,sy=S0.nz;let front=[];
    for(let p=0;p<S0.d.length;p++)if(S0.d[p]>=0){const i=Math.floor(p/sx),j=Math.floor((p%sx)/sy),k=p%sy;
      if(i===0||j===0||k===0||i===S0.nx-1||j===S0.ny-1||k===S0.nz-1||S0.d[p+sx]<0||S0.d[p-sx]<0||S0.d[p+sy]<0||S0.d[p-sy]<0||S0.d[p+1]<0||S0.d[p-1]<0){DEP[p]=1;front.push(p);}}
    for(let dd=2;dd<=8&&front.length;dd++){const nx=[];for(const p of front)for(const q of [p+sx,p-sx,p+sy,p-sy,p+1,p-1])if(q>=0&&q<S0.d.length&&S0.d[q]>=0&&!DEP[q]){DEP[q]=dd;nx.push(q);}front=nx;}}
  const AF=g.ARCH_F,AR=g.ARCH_RR,zF=u(M.wheelF.zIn),zR=u(M.tubR.zIn);
  carveW(S0,null,(x,y,z)=>(Math.abs(z)>=zF&&Math.hypot(x-AF.x,y-AF.y)<AF.r)||(Math.abs(z)>=zR&&Math.hypot(x-AR.x,y-AR.y)<AR.r));   // v3: >= (was >): the cells AT the wall line stood below the floor as a 10 mm fin through the links and drive shafts
  const TF=M.towerF,TR=M.towerR,deep=(x,y,z)=>{const i=Math.round(x*HR),j=Math.round(y*HR),k=Math.round(z*HR);if(!S0.inb(i,j,k))return false;const v=DEP[S0.ix(i,j,k)];return !v||v>3;};
  carveW(S0,null,(x,y,z)=>{const inW=Math.hypot(x-AF.x,y-AF.y)<AF.r;return Math.abs(x-wx(TF.x))<=u(TF.dx)&&Math.abs(z)>u(TF.zIn)&&(Math.abs(z)<halfAt(x,y)-2||inW)&&y<u(TF.top-20)&&((y>AF.y&&deep(x,y,z))||inW);});   // v3: the strut tower is open below into the wheelhouse (the strut rises out of it), as the rear towers
  carveW(S0,null,(x,y,z)=>Math.abs(x-wx(TR.x))<=u(TR.dx)&&Math.abs(z)>u(TR.zIn)&&(Math.abs(z)<halfAt(x,y)-2||Math.hypot(x-AR.x,y-AR.y)<AR.r)&&y<u(TR.top-20)&&y>u(190)&&(deep(x,y,z)||Math.hypot(x-AR.x,y-AR.y)<AR.r));
  const B=M.bay,nearW=x=>Math.abs(x-AF.x)<=AF.r+2,aheadW=x=>x>AF.x+AF.r;
  carveW(S0,null,(x,y,z)=>x<=Math.max(wx(B.x0),wx(B.x1))&&x>=Math.min(wx(B.x0),wx(B.x1))&&Math.abs(z)<=(aheadW(x)&&y<=u(B.upY)?u(B.frontHalf):(y>u(B.upY)?u(B.upHalf):(nearW(x)&&y>u(400)?u(M.wheelF.bayHalf):u(B.half))))&&y>=0&&y<top(x,z)-1.6);   // v3: ahead of the front arches the bay opens to B.frontHalf. v3: x range by min/max (this table's x0 is the firewall, x1 the nose side: as written the carve's x test was never true, the bay was empty only through bottomZ)
  const T=M.tunnel;carveW(S0,null,(x,y,z)=>x<=wx(T.x0)&&x>=wx(T.x1)&&Math.abs(z)<=u(T.half)&&y<=u(T.top));
  const K=M.kick;carveW(S0,null,(x,y,z)=>x<=wx(K.x0)&&x>=wx(K.x1)&&Math.abs(z)<=u(K.half)&&y<=u(K.top));   // v3: the rear floor's kick-up over the axle line
  const hood=hgrid(g.HOOD_X0-.5,NOSE_X+.5,u(400),ROOF,-g.HOOD_HALF-.5,g.HOOD_HALF+.5);
  const HT=2.4;
  const take=(dst,pred)=>eachCell(dst,null,(i,j,k)=>{const x=i/HR,y=j/HR,z=k/HR;if(!S0.inb(i,j,k))return;const n=S0.ix(i,j,k);if(S0.d[n]<0)return;if(pred(x,y,z)){dst.d[dst.ix(i,j,k)]=1;S0.d[n]=-1;}});
  take(hood,(x,y,z)=>x>=g.HOOD_X0&&x<=g.HOOD_X1+.6&&Math.abs(z)<=g.HOOD_HALF&&top(x,z)-y<HT);
  const H=M.hatch,hx=g.HATCH_X;
  const hatchHalf=y=>{const m=y*20;if(m>=H.glassBot){const t=clampv((m-H.glassBot)/(1275-H.glassBot),0,1);return Math.min(g.cEnv(g.xC(y),y)+.6,u(H.sideHalf+(H.roofHalf-H.sideHalf)*t));}return u(H.sideHalf);};   // v3: the hatch narrows from the lip (sideHalf) to the roof edge (roofHalf)
  const hatch=hgrid(REAR_X-.5,hx+.5,u(H.bottom)-1,ROOF+1,-u(H.sideHalf)-1,u(H.sideHalf)+1);
  const depthAt=(x,y,z)=>{const i=Math.round(x*HR),j=Math.round(y*HR),k=Math.round(z*HR);if(!S0.inb(i,j,k))return 99;const v=DEP[S0.ix(i,j,k)];return v||99;};
  const inHatch=(x,y,z,inset,dmax)=>{if(x>hx||y<u(H.bottom)||Math.abs(z)>hatchHalf(y)-inset||depthAt(x,y,z)>dmax)return false;const m=g.mm(x);
    if(y*20<H.glassBot)return m>=3780+inset*20;return m>=g.mm(g.xC(y))-20+inset*20||Math.abs(z)<=u(H.roofHalf)-inset;};
  take(hatch,(x,y,z)=>inHatch(x,y,z,0,5));
  const D=M.door,dz0=ext;
  const doorL=hgrid(g.DOOR_R-.5,g.DOOR_F+.5,u(D.bottom)-1,ROOF,-dz0,0),doorR=hgrid(g.DOOR_R-.5,g.DOOR_F+.5,u(D.bottom)-1,ROOF,0,dz0);
  const inDoor=(x,y,z)=>{if(y<u(D.bottom)||x>g.DOOR_F||x<g.doorRear(y))return false;if(y<=belt(x))return Math.abs(z)>=halfAt(x,y)-4.2;return false;};
  take(doorL,(x,y,z)=>z<0&&inDoor(x,y,z));take(doorR,(x,y,z)=>z>0&&inDoor(x,y,z));
  const PFRONT=wx(200),PREAR=wx(4100);
  const inArch=(x,y,z)=>{for(const a of [AF,AR]){if(Math.hypot(x-a.x,y-a.y)<a.r+.6&&Math.abs(z)<halfAt(x,y)-1.2)return true;}
    return (Math.abs(x-wx(TF.x))<=u(TF.dx)+.6&&Math.abs(z)>u(TF.zIn)-.6&&y<u(TF.top)&&y>AF.y&&Math.abs(z)<halfAt(x,y)-1.2)||(Math.abs(x-wx(TR.x))<=u(TR.dx)+.6&&Math.abs(z)>u(TR.zIn)-.6&&y<u(TR.top)&&y>u(170)&&Math.abs(z)<halfAt(x,y)-1.2);};
  shellHi(S0,(x,y,z,inner)=>{
    if(inArch(x,y,z)&&depthAt(x,y,z)>1)return UNDER;
    if(inner)return INT;
    if(y<u(205))return UNDER;
    if(x>PFRONT-.6&&y<u(550))return UNDER;
    if(x<PREAR+.6&&y<u(ECLIPSED.bumperR.top))return UNDER;
    if(typeof eclipseBumperRelief==='function'&&eclipseBumperRelief(g,x,y,z,40))return UNDER;
    {const m=g.mm(x);if((m<450&&y<u(ECLIPSED.bumperF.bot))||(m>3850&&y<u(ECLIPSED.bumperR.bot)))return UNDER;}
    return PAINT;},2);
  const bodyG=S0;
  carveW(S0,null,(x,y,z)=>x<=hx-1.5&&inHatch(x,y,z,1.5,y*20>=H.glassBot?99:12));
  carveW(S0,null,(x,y,z)=>{if(y*20<H.glassBot||x>hx-1.5||y<u(H.bottom))return false;const az=Math.abs(z);if(az<=u(H.roofHalf)-3||az>hatchHalf(y)-2.5)return false;
    return g.mm(x)>=g.mm(g.xC(y))-50&&depthAt(x,y,z)>2;});
  {const inner=new Map();for(const [i,j,k] of hatch.list()){const key=j+','+k;if(!inner.has(key)||i>inner.get(key))inner.set(key,i);}
   for(const [key,f] of inner){const [j,k]=key.split(',').map(Number),y=j/HR,z=k/HR;if(y*20>=H.glassBot||y<u(H.bottom)||Math.abs(z)>hatchHalf(y)-1.5)continue;
     for(let i=f+1;i<=f+30;i++)if(S0.inb(i,j,k))S0.d[S0.ix(i,j,k)]=-1;}}
  {const sx=S0.ny*S0.nz,sy=S0.nz;for(let p=0;p<S0.d.length;p++){if(S0.d[p]<0||DEP[p]<2)continue;const i=Math.floor(p/sx)+S0.x0,j=Math.floor((p%sx)/sy)+S0.y0,k=p%sy+S0.z0;
     for(const [a,b,c] of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]])if(hatch.get(i+a,j+b,k+c)>=0){S0.d[p]=GASK;break;}}}
  const INT2=0x2b2c2f,byDepth=(x,y,z)=>{const d=depthAt(x,y,z);return d<=1?PAINT:(d===2?INT2:INT);};
  shellHi(hood,(x,y,z,inner)=>byDepth(x,y,z),2);
  shellHi(hatch,(x,y,z,inner)=>byDepth(x,y,z),2);
  const doorSkin=(x,y,z,inner)=>depthAt(x,y,z)<=1?PAINT:0x3a3b3f;
  shellHi(doorL,doorSkin,2);shellHi(doorR,doorSkin,2);
  eachCell(hood,null,(i,j,k,n)=>{if(hood.d[n]!==INT)return;const x=i/HR,z=k/HR,x0=g.HOOD_X0,x1=g.HOOD_X1;
    const keep=x<=x0+1.5||x>=x1-1.5||Math.abs(z)>=g.HOOD_HALF-1.2||Math.abs(Math.abs(z)-(x-x0)*.75)<1.1||Math.abs(x-(x0+x1)/2)<1.1;if(!keep)hood.d[n]=-1;});
  {const x0=wx(TF.x)-u(TF.dx),x1=wx(TF.x)+u(TF.dx),zi=u(TF.zIn),capY=u(TF.top-20),clear=(i,j,k)=>hood.get(i,j,k)<0&&hood.get(i,j+1,k)<0&&hood.get(i,j+2,k)<0;
   eachCell(bodyG,[x0,x1,u(340),u(TF.top)+1,-ext,ext],(i,j,k,n)=>{if(bodyG.d[n]>=0)return;const x=i/HR,y=j/HR,z=k/HR,az=Math.abs(z);if(x<x0||x>x1)return;
     const cap=y>=capY-.25&&y<=capY+.75&&az>=zi-1.25&&az<=halfAt(x,y)-1&&clear(i,j,k),wall=az>=zi-1.25&&az<=zi-.75&&y>=u(340)&&y<capY-.25&&clear(i,j,k);
     if(cap||wall)bodyG.d[n]=PAINT;});}
  const DB=u(D.bottom);
  carveW(bodyG,[g.DOOR_R-1,g.DOOR_F+1,DB,ROOF,-ext,ext],(x,y,z)=>{if(y<DB+1||x>g.DOOR_F-1||x<g.doorRear(y)+1)return false;if(y>belt(x))return false;return Math.abs(z)>=halfAt(x,y)-7;});
  const P=M.bPillar,bpF=y=>wx(P.botF+(P.topF-P.botF)*clampv((y*20-869)/(1275-869),0,1)),bpR=y=>wx(P.botR+(P.topR-P.botR)*clampv((y*20-869)/(1275-869),0,1));
  const roofEdge=x=>topC(x)-2.6;
  const sail=y=>wx(1600-1.2*(y*20-841));   // v3: the door glass's front edge (mirror sail) follows the new door and belt (v1: 1540 at 785)
  const dgIn=(x,y)=>y>belt(x)+.4&&y<roofEdge(x)&&x>bpF(y)+.3&&x<g.xA(y)-3.2&&x<sail(y);
  const qPoly=M.quarter.map(([a,b])=>[wx(a),u(b)]);
  const inPoly=(x,y,poly)=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,yi]=poly[i],[xj,yj]=poly[j];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))c=!c;}return c;};
  const qgIn=(x,y)=>inPoly(x,y,qPoly)&&x<bpR(y)-.4;
  const wsX0=wx(2050),wsX1=wx(1250);
  const wsIn=(x,y,z)=>x<=wsX1&&x>=wsX0&&Math.abs(z)<g.aEnv(g.xA(y),y)-3.2&&y>u(800);
  const rwIn=(x,y,z)=>x<=g.xC(60.8)+1.5&&y>u(H.glassBot)+.6&&y<u(1240)&&Math.abs(z)<g.cEnv(g.xC(y),y)-2.4&&x<hx;
  const sideOpen=(x,y,z)=>Math.abs(z)>=halfAt(x,y)-4.5;
  carveW(bodyG,[REAR_X,NOSE_X,BELT-1,ROOF+1,-ext,ext],(x,y,z)=>sideOpen(x,y,z)&&(dgIn(x,y)||qgIn(x,y)));
  const glass={},GL=0x232a2e;   // neutral dark glass (OPEN-TINT: unmeasured; the AE86 bronze must NOT be imported)
  glass.ws=hgrid(wsX0-.5,wsX1+.5,BELT,ROOF+1,-ext,ext);glass.rw=hgrid(REAR_X-.5,hx+.5,u(H.glassBot)-.5,ROOF+1,-ext,ext);
  const skinToGlass=(Gp,Gg,inR)=>eachCell(Gp,null,(i,j,k,n)=>{const v=Gp.d[n];if(v<0)return;const x=i/HR,y=j/HR,z=k/HR;if(!inR(x,y,z))return;if(v===PAINT)Gg.set(i,j,k,GL);Gp.d[n]=-1;});
  skinToGlass(bodyG,glass.ws,(x,y,z)=>wsIn(x,y,z)&&y>top(x,z)-3.6);
  skinToGlass(hatch,glass.rw,(x,y,z)=>rwIn(x,y,z));
  eachCell(bodyG,[g.DOOR_R-1,g.DOOR_F+2,BELT,ROOF,-ext,ext],(i,j,k,n)=>{if(bodyG.d[n]<0)return;const x=i/HR,y=j/HR,z=k/HR;
    if(y<=belt(x)||y>roofEdge(x)+1.1)return;if(x>g.xA(y)-1.7||x<Math.min(bpF(y),g.doorRear(y)))return;if(!sideOpen(x,y,z))return;
    const Dd=z<0?doorL:doorR;Dd.set(i,j,k,y<=belt(x)+.4?bodyG.d[n]:SASH);bodyG.d[n]=-1;});
  eachCell(bodyG,[wx(P.topR)-1,wx(P.botF)+1,BELT,ROOF,-ext,ext],(i,j,k,n)=>{if(bodyG.d[n]!==PAINT)return;const x=i/HR,y=j/HR,z=k/HR;if(y>belt(x)&&y<roofEdge(x)+.6&&x<=bpF(y)&&x>=bpR(y))bodyG.d[n]=SASH;});
  for(const kk of ['dgL','dgR','qgL','qgR'])glass[kk]=hgrid(REAR_X+10,NOSE_X-10,BELT-1,ROOF+1,kk.endsWith('L')?-ext:0,kk.endsWith('L')?0:ext);
  for(let i=glass.dgL.x0;i<=glass.dgL.x1;i++)for(let j=glass.dgL.y0;j<=glass.dgL.y1;j++){const x=i/HR,y=j/HR;if(y<BELT-.5||y>ROOF)continue;const h=halfAt(x,y);
    for(const sd of [-1,1]){const zc=Math.round((h-.9)*HR);
      if(dgIn(x,y))for(let q=0;q<2;q++)(sd<0?glass.dgL:glass.dgR).set(i,j,sd*(zc-q),GL);
      if(qgIn(x,y))for(let q=0;q<2;q++)(sd<0?glass.qgL:glass.qgR).set(i,j,sd*(zc-q),GL);}}
  for(const [Dd,Gg] of [[doorL,glass.dgL],[doorR,glass.dgR]])for(const [i,j,k] of Gg.list())Dd.set(i,j,k,-1);
  const nearGlass=(Gg,i,j,k)=>{for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)for(let c=-1;c<=1;c++)if(Gg.get(i+a,j+b,k+c)>=0)return true;return false;};
  eachCell(bodyG,[wsX0-1,wsX1+1,BELT-1,ROOF+1,-ext,ext],(i,j,k,n)=>{if(bodyG.d[n]!==PAINT)return;if(nearGlass(glass.ws,i,j,k))bodyG.d[n]=GASK;});
  eachCell(hatch,null,(i,j,k,n)=>{if(hatch.d[n]!==PAINT)return;if(nearGlass(glass.rw,i,j,k))hatch.d[n]=GASK;});
  eachCell(bodyG,[REAR_X-1,wx(2700)+1,BELT-1,ROOF+1,-ext,ext],(i,j,k,n)=>{if(bodyG.d[n]!==PAINT)return;if(nearGlass(glass.qgL,i,j,k)||nearGlass(glass.qgR,i,j,k))bodyG.d[n]=GASK;});
  const MO=M.molding,rib=(Gg)=>{const outer=new Map();eachCell(Gg,[wx(MO.x1),wx(MO.x0),u(MO.y0),u(MO.y1),-ext,ext],(i,j,k,n)=>{if(Gg.d[n]<0)return;const key=i+','+j;if(k>0){const o=outer.get(key+',1');if(!o||k>o.k)outer.set(key+',1',{k});}if(k<0){const o=outer.get(key+',-1');if(!o||k<o.k)outer.set(key+',-1',{k});}});
    for(const [key,o] of outer){const [i,j,sd]=key.split(',').map(Number),kk=sd>0?o.k+1:o.k-1;if(Gg===bodyG&&(doorL.get(i,j,kk)>=0||doorR.get(i,j,kk)>=0))continue;Gg.set(i,j,kk,MOLD);}};   // v3: the body's rib skips the doors' own cells (at the door's shut face it stood inside the closed door)
  // v4: no body-side moulding: side_1.jpg, side_2.jpg and both rear 3/4 photos show bare doors (the only line low on the side is the skirt's crease); the rib builder stays for reference, not called
  const seam=(Gg,b,pred)=>eachCell(Gg,b,(i,j,k,n)=>{if(Gg.d[n]!==PAINT)return;const x=i/HR,y=j/HR,z=k/HR;if(pred(x,y,z))Gg.d[n]=SEAM;});
  seam(bodyG,[g.HOOD_X0-1.2,g.HOOD_X0+.4,u(400),ROOF,-hw,hw],(x,y,z)=>x<=g.HOOD_X0+.1&&Math.abs(z)<=g.HOOD_HALF+.5&&y>top(x,z)-1.5);
  seam(bodyG,[g.HOOD_X1-.4,g.HOOD_X1+1.2,u(400),ROOF,-hw,hw],(x,y,z)=>x>=g.HOOD_X1-.1&&Math.abs(z)<=g.HOOD_HALF+.5&&y>top(x,z)-1.5);
  seam(bodyG,[g.HOOD_X0,NOSE_X,u(400),ROOF,-hw,hw],(x,y,z)=>Math.abs(Math.abs(z)-(g.HOOD_HALF+.6))<.3&&x>=g.HOOD_X0+.5&&y>top(x,z)-1.6);
  seam(bodyG,[g.DOOR_F+.1,g.DOOR_F+.8,DB,BELT+1,-ext,ext],(x,y,z)=>x>g.DOOR_F+.1&&x<=g.DOOR_F+.55&&y>=DB+.5&&y<=belt(x)&&Math.abs(z)>=halfAt(x,y)-4.2);
  seam(bodyG,[g.DOOR_R-6,g.DOOR_R+.2,DB,BELT+1,-ext,ext],(x,y,z)=>{const xr=g.doorRear(y);return x<xr-.1&&x>=xr-.55&&y>=DB+.5&&y<=belt(x)&&Math.abs(z)>=halfAt(x,y)-4.2;});
  seam(bodyG,[g.DOOR_R-6,g.DOOR_F,DB-1,DB+.5,-ext,ext],(x,y,z)=>y<DB+.5&&y>=DB-.1&&x>=g.doorRear(y)&&x<=g.DOOR_F&&Math.abs(z)>=halfAt(x,y)-4.2);
  seam(bodyG,[hx-.8,hx+.5,u(1200),ROOF+1,-ext,ext],(x,y,z)=>x>=hx-.6&&x<=hx+.2&&Math.abs(z)<=hatchHalf(y)+.5&&y>top(x,z)-1.5);
  seam(bodyG,[REAR_X,hx,u(H.bottom)-1,ROOF+1,-ext,ext],(x,y,z)=>{const hh=hatchHalf(y);return Math.abs(Math.abs(z)-(hh+.6))<.3&&g.profDistZ(x,y,z)<1.4&&x<=hx;});
  {const F=M.fuel,cx=(F.m0+F.m1)/2,cy=(F.y0+F.y1)/2,hx=(F.m1-F.m0)/2,hy=(F.y1-F.y0)/2;   // v4: the fuel flap's seam ring, right side only
   seam(bodyG,[wx(F.m1)-1,wx(F.m0)+1,u(F.y0)-1,u(F.y1)+1,0,ext],(x,y,z)=>{if(z<=0)return false;const qx=Math.abs(g.mm(x)-cx)-(hx-F.r),qy=Math.abs(y*20-cy)-(hy-F.r);
     return Math.abs(Math.hypot(Math.max(qx,0),Math.max(qy,0))+Math.min(Math.max(qx,qy),0)-F.r)<=6;});}
  const hi={body:bodyG,hood,trunk:hatch,doorL,doorR,glass};
  const CB=[Math.floor(REAR_X-3),Math.ceil(NOSE_X+3),0,Math.ceil(ROOF+2),-ext-1,ext+1],out={hi,HR};
  out.body=coarsen(bodyG,4,CB);out.hood=coarsen(hood,4,CB);out.trunk=coarsen(hatch,4,CB);out.doorL=coarsen(doorL,4,CB);out.doorR=coarsen(doorR,4,CB);
  out.glass={};for(const kk in glass)out.glass[kk]=coarsen(glass[kk],2,CB);
  out.rwOnLid=true;out.hatchHalf=hatchHalf;
  return out;
}

const ECLIPSE_RIG={
  cp:{
    side:-1,   // LHD, explicit: makeRig SD = cp.side || -1; -1 = left-hand drive. The driver's door is doorL (camOpens interior:{doorL:1}), NOT doorR.
    // Codebase convention (caught at splice): cp.H.z is a MAGNITUDE — the seat
    // loop places seats at sd*H.z, so H.z must stay POSITIVE 18.5 for the
    // driver's seat to land at -18.5 (left) and the passenger-removal check
    // (sd === -cp.side) to remove the passenger, not the driver. A negative
    // H.z would mirror both seats AND delete the driver's seat on removal.
    // Likewise the pedals are NOT a naive z-negation of the EF set: clutch
    // stays the LEFTMOST pedal from the driver's view (left = -z), so with
    // the driver at -18.5 the set is clutch -24 / brake -18.5 / gas -13
    // (EF offsets -6/0/+5.5 about the driver centre, order preserved).
    // eye/wheel z ARE absolute driver-side positions and stay -18.5.
    // ALL stations still INTERIM until OPEN-INT measures the Eclipse's own.
    H:{x:10,y:25.5,z:18.5},back:24,rearH:{x:-37,y:25},rearBack:22,
    wheel:{x:19,y:36,z:-18.5,n:[-0.9,0.436,0]},   // FIX2 W-1 INTERIM (was 26,42): old rim top pierced the windshield plane ~306mm (rim top x 30.25u vs glass 14.94u at that height, driver column); new centre derived from the build's own glass line (rim-top clearance ~24mm) + column reach (column end x 31.6 vs dash rear 31, y 29.9 vs dash bot 30). OPEN-INT still open — stations unmeasured.
    pedalX:38,pedalY:28.5,pedalLen:290,   // v3 DESIGN: the pivot shaft 570 mm up, under the dash's lower edge (590; the 630 pivot stood in the dash), pads 280 mm up over the 250-270 carpet
    pedals:[['clutch',-24,75,65],['brake',-18.5,75,65],['gas',-13,50,110]],
    shifter:{x:22,y:25},eye:{x:-1.5,y:56.5,z:-18.5},
    // ALL INTERIM (EF form adapted to LHD, NOT mirrored blindly — see above).
    // OPEN-INT replaces every cockpit station from interior photos; the cabin
    // stage stays gated on OPEN-INT and the interior mirror is verified
    // against this eye vector before it ships (the EF failure class).
  },
  dash:{rearX:31,top:37,bot:30,cowlX:47.5,halfZ:33,slope:0.12},   // INTERIM (EF form; top/bot lowered to the Eclipse cowl ~38.25 world; OPEN-INT replaces). v3: top 38 -> 37, the binnacle's hood stood 10 mm into the windshield
  console:{rearX:-6,shiftX0:15,shiftX1:29,top:25,y0:20},   // INTERIM (EF form; OPEN-INT replaces). v3 DESIGN: y0 20 = its foot on the tunnel's skin (370 + 20; the propshaft ran through it at 15.5), top 25 (500) so the centre stack's radio and ashtray stand above it, shift section to the stack's face
  floorY:12.5,carpetIn:10,rackR:1.3,rackHalf:15,   // INTERIM (EF pattern, 250 mm floor pan; Eclipse floor pan unmeasured; M-11: NOT FOUND). v3: carpetIn 10 = the carpet starts outside the tunnel's walls (160-185); rack 26 mm radius, body to +/-300 where the tie rods start (AE86/Z32 values; the 44 mm x 800 mm generic rack ran through the propshaft and the rods)
  floorAt:x=>x>-30?12.5:16.5,   // INTERIM (EF pattern: raised floor under the rear seat). The body's floor steps up between the two carpets (ECLIPSE_M.floorStep 2780 = x -29.75)
  floorHalf:x=>{const XM=ECLIPSE_M.ovF+ECLIPSE_M.WB/2,TR=ECLIPSE_M.towerR,fa=Math.abs(x-62.75)<=20,ra=Math.abs(x+62.75)<=21,tw=Math.abs(x-(XM-TR.x)/20)<=TR.dx/20+1;return fa?20:(tw?15:(ra?27.5:34));},   // DESIGN (EF form adapted to the Eclipse axles: front wheelhouse walls, rear tubs (600), sills). v3: beside the rear towers (inner wall 330) the carpet stops at 300
  cargo:{frontX:-58,rearX:-108,floorY:26,half:24,hi:true},   // DESIGN (load floor toward the tail -118.75, short of it; rear-tower half OPEN-ARCH refines)
  bay:{
    x0:50,x1:97,top:33.5,radX:95,   // v3: top 35.5 -> 33.5 (DESIGN): the radiator support and its slam panel stay under the lowered nose's hood (underside ~600 at station 215)
   batX:78,towerTop:40,airZ:1,towers:false,rails:false,   // DESIGN (x0/x1/radX adapted to Eclipse nose 100.25 / axle 62.75; EF pattern)
    battery:{x0:79,x1:84,y0:13,y1:20,z0:-12,z1:-20.5},batTray:{outZ:-21.5},   // v3: batTray DESIGN: the tray and its bracket out to the inner fender (the battery stood loose 15 mm off it)
      // DESIGN (EF pattern; OPEN-BAY repositions). v3: 20 mm forward, clear of the alternator pulley
    fwX:(ECLIPSE_M.ovF+ECLIPSE_M.WB/2-ECLIPSE_M.bay.x0)/20,   // v3 CALCULATED: the firewall's face (body bay.x0 1200 -> x 49.25); the booster and the reservoirs stand on it (at x0+1 = 51 they floated 35 mm off it)
    airbox:{x0:70,x1:78,y0:28,y1:34,z0:-20.5,z1:-12.5},   // DESIGN (EF pattern; OPEN-BAY repositions)
    boosterZ:17,boosterR:3.8,mcLen:7,fuse:{z0:-20.5,z1:-15},   // DESIGN (EF pattern)
  },
  crash:{y0:15,y1:21,half:33},   // DESIGN (EF pattern; bumper heights OPEN-VERT refine)
  hoses:{r:0.9,intakeR:1.5,tankZ:22.5,shroudX:92,turnX:89,upY:26.3,loY:16.5},   // DESIGN (EF pattern; shroud/turn shifted to Eclipse radX 95; OPEN-BAY reroutes)
  doorCard:{y0:18},   // DESIGN (EF pattern)
  links:{n:40,arm:2,rod:1.2,fork:1.2,shaft:1.4},   // DESIGN convention (generic part-builder params; fork is unused by a MacPherson front — carried, not read)
  damper:{n:60,bodyR:2.5,rodR:1,bodyFrac:0.5},   // DESIGN convention
  coil:{n:40,R:4.5,w:0.9,turns:6},   // DESIGN convention
  power:{dx:3,crankY:17},   // DESIGN (EF-pattern transverse layout: crank line 3 units ahead of the front axle, 340 mm up; OPEN-BAY refines dx/crankY against the 4G63T block + 117 mm clearance)
  exh:{
    dx:-10,y0:12,pipeY:10.2,zRun:-5,pr:1.3,catX:30,catW:2.5,catH:2,mufX0:-100,mufX1:-80,mufZ:21,mufH:2.4,
    via:[[-66,10.2,-5],[-76,10.2,-14]],   // v3 DESIGN route: down pipe -> the run in the floor tunnel 100 mm left of the propshaft (zRun -5; the saddle tank's lobes straddle the tunnel, M-11) past the rear diff's left flank, then left behind the rear subframe (rails end x -76) to the silencer across the left rear behind the rear suspension (x -80 .. -100, its inlet at the front: mufX1 is the inlet end); 52 mm pipe (pr 1.3) as the AE86. The old run crossed the floor diagonally through the tank, the rear rails and the lower links
    side:-1,   // MEASURED: single tip, LEFT side (three rear views)
    stockTips:1,   // FIX1 V-3: stock is a SINGLE tip — without this, genExhaustTips draws twins (the GS-T import the enforcer vetoed)
    tipMM:4350,   // DESIGN: 30 mm from the tail (EF pattern: EF tipMM 3965 on a 3995 body)
    tipY:9.9,   // DESIGN (198 mm tip height, EF pattern)
    // genExhaust/genExhaustTips compute the tip line as side*mufZ, so mufZ
    // is the MAGNITUDE 21: the tip line lands at -21 units = 420 mm left of
    // the centreline, on the MEASURED cut-out (the draft's mufZ -13 with
    // side -1 would have put the tip at +13 units on the RIGHT — a sign
    // error caught at splice). The silencer centre sits on the same line.
    // Tip BORE is OPEN (the photo car's ~100 mm bore is aftermarket).
  },
  under:{
    subY:8,railZ:21,railX0:50,railX1:97,brkX:61.75,fx1dx:13.5,   // DESIGN (rails from the Eclipse bay; brkX near the front axle 62.75)
    tank:{x0:-51,x1:-32,y0:7.6,y1:15,half:4.5,zc:14.5},   // v3: M-11 VERIFIED layout: a SADDLE tank under the rear-seat floor ahead of the rear axle, two lobes straddling the propshaft tunnel (60 L GSX). This is the RIGHT lobe; car_eclipse.js mirrors it on the left. Lobe size DESIGN (|z| 190-390 outside the tunnel walls, stations 2800-3205 between the floor step and the rear subframe, 150-310 mm up to the floor pan); the crossover over the tunnel is not drawn
    rearBeam:false,
    rearRails:{x0:-76,x1:-52,z:22},   // DESIGN (rails around the rear axle -62.75 carrying the multi-link brackets)
    trailBr:[[-42.75,26]],   // DESIGN (trailing-arm bracket, EF/AE86 pattern). v3 CALCULATED: at the trailing link's pivot (susp.rear.trail dx 20 from the axle -62.75); at -45 the link ran through it
    diffCarrier:{x:-62.75,y:14,z:0},   // DESIGN (rear differential carrier AT the rear axle, for the AWD rear builder)
  },
  // ---- suspension: module-read (NOT makeRig-read). Field NAMES follow the
  // AE86 adapted MacPherson front; VALUES are DESIGN layout.
  susp:{
    front:{
      lowF:[13,8.5,23],lowR:[-1,8.25,20.5],rodTo:0.6,lbj:[-5.5,0],
      // Lower-link pattern ADOPTED from the EF/AE86 MacPherson convention as
      // DESIGN layout. The adapted knuckle builder reads EXACTLY: lowF/lowR,
      // rodTo, lbj, strutTop, springTopY, strutDx, strutLy, strutLowDz,
      // springLow, rack — and MUST NOT read upF/upR/forkTop/forkDx
      // (wishbone fields a strut front does not have; AE86 verifier major-4).
      strutTop:[0,35.5,25],springTopY:34,strutDx:0.5,strutLy:4.5,strutLowDz:5,springLow:0.3,   // DESIGN (tower/spring positions; OPEN-BAY refines). v3: top 770 -> 710, 5 mm under its tower cap (715) and the hood (its underside ~735 over the axle; the old top stood in the hood); the strut's foot 90 mm ABOVE the hub (it was 70 below) so the drive shaft passes under the strut clamp, as on any front-drive MacPherson
      rack:{dx:-10,y:13.4,half:15},   // DESIGN layout (rack position; ratio 17.1:1 is SECONDARY, a separate figure). v3: 268 mm up, between the exhaust's front pipe (top 230) and the propshaft (bottom 307 here); tie rods near level to the steering arms (244)
    },
    rear:{
      // Multi-link INDEPENDENT rear — NOT a live axle, NOT a double wishbone.
      // The module's rear builder reads: carrier, linkUp/linkLow, springSeat,
      // damperTop, trail. It must NOT reuse the AE86 live-axle builder
      // (tubeY/panhard, no uprights, no half-shafts) or the EF rear wishbone
      // builder (upF/upR/ubj).
      carrier:{x:0,y:14,z:0},   // relative to the rear axle: differential carrier at the axle, y near the hub height 15.42
      linkUp:[[-6,20,18],[6,20,18]],linkLow:[[-12,8.25,23],[9,8.25,21]],   // DESIGN link-pivot layout (relative pivots, adopted pattern, not Eclipse measurements)
      springSeat:[-2,18,24],damperTop:[-7,36,26],trail:[20,8,26],   // DESIGN
      // v3: the outer ends on the knuckle's own lugs (the knuckle builder's: lower and upper ball joints 110 mm under / over the hub, trailing lug 50 mm under it);
      // they all met at the hub centre, through the half-shaft and each other. M-11 VERIFIED layout: lower arms, toe links and trailing links on the subframe, upper arms to the body, all to the knuckle.
      lbj:[-5.5,-.4],ubj:[5.5,-.4],trailLug:[-2.5,.5],eyeOnArm:.65,   // [dy from the hub, dz from the kingpin line]; damper's lower eye 65 % out along the rear lower leg (DESIGN)
    },
  },
};

/* ---- D-pillar trims inside the hatch opening (EF's builder adapted to the
   Eclipse's stations: quarter-glass rear edge to the hatch shut line, grey
   plastic from the cargo cover up to the roof, black seal along the opening
   edge. Row range 900..1260 mm (Eclipse quarter glass), tail scan from the
   tail tip cells (-238). 10 mm cells, absolute (mesh scale .5). ---- */
function eclipseDPillarTrim(g,hi){const B=hi.body,H=hi.trunk,GW=hi.glass.rw,TRIMG=0x7a7d82,SEAL=0x141517,cells=[],box=new Set(),key=(i,j,k)=>i+','+j+','+k,V1=Math.round(g.NOSE_X*2-200.5);   // v3: V1 = +18 cells: these cell numbers were laid out on the v1 frame (nose x 100.25, ovF 750); the body moved 180 mm forward on the rig with ovF 930
  for(const sd of [-1,1]){const Q=sd<0?hi.glass.qgL:hi.glass.qgR;
    for(let j=90;j<=126;j++){let gi=null;for(let i=Q.x0;i<=Q.x1&&gi===null;i++)for(let k=Q.z0;k<=Q.z1;k++)if(Q.get(i,j,k)>=0){gi=i;break;}
      if(gi===null)gi=-200+V1;let rear=null;const kin=new Map();
      for(let i=-238+V1;i<Math.min(gi,-122);i++){   // v3: behind the rear seat back (its top reaches x -1130) and the cargo cover's front brackets (x -1180..-1210)
let a=null;for(let k=40;k<=88;k++)if(B.get(i,j,sd*k)>=0){a=k;break;}if(a===null)continue;if(rear===null)rear=i;kin.set(i,a);}
      if(rear===null)continue;
      const cnt=new Map();for(const [i,a] of kin)if(i<=rear+6)cnt.set(a,(cnt.get(a)||0)+1);let ks=null,best=0;for(const [a,n] of cnt)if(n>best||(n===best&&a>ks)){best=n;ks=a;}
      if(ks===null||ks<50)continue;
      const T=Math.round(j<=100?8:j>=120?6:8-2*(j-100)/20);
      for(const [i,a] of kin){if(a<ks-T)continue;for(let k=ks-T;k<=a-1;k++){if(B.get(i,j,sd*k)>=0)continue;let nearH=false;
          for(let di=-2;di<=1&&!nearH;di++)for(let dj=-1;dj<=1&&!nearH;dj++)for(let dk=-1;dk<=1&&!nearH;dk++)if(H.get(i+di,j+dj,sd*k+dk)>=0||GW.get(i+di,j+dj,sd*k+dk)>=0)nearH=true;   // v3: the hatch glass is cut out of the hatch grid: avoid it too
          if(!nearH){cells.push([i,j,sd*k,ks-k<=1?2:1]);box.add(key(i,j,sd*k));}}}}}
  for(const c of cells){const [i,j,k,o]=c;c[3]=(!box.has(key(i-1,j,k))&&o===2)?SEAL:TRIMG;}
  if(!cells.length)return new Grid(0,0,0,0,0,0);let b=[1e9,-1e9,1e9,-1e9,1e9,-1e9];for(const [i,j,k] of cells)b=[Math.min(b[0],i),Math.max(b[1],i),Math.min(b[2],j),Math.max(b[3],j),Math.min(b[4],k),Math.max(b[5],k)];
  const G=new Grid(b[0],b[1],b[2],b[3],b[4],b[5]);for(const [i,j,k,c] of cells)G.set(i,j,k,c);return G;}

/* ---- cargo bay (EF's builder adapted to the Eclipse's stations): side
   trims one cell inside the body's inner skin, carpeted load floor at 520 mm,
   trim caps on the towers/tubs, lock-panel trim with striker at the tail,
   fabric cargo cover on ledges with brackets at its front corners, pull lip.
   I0/I1 in 10 mm cells: seat back -58 units to hatch inner face -108 units;
   cover rear edge -114 units (55 mm ahead of the hatch inner face, EF's 50 mm
   pattern); cover height 870 mm (DESIGN — Eclipse cover height unmeasured).
   10 mm cells, absolute (mesh scale .5). ---- */
function eclipseCargo(g,hi,lamps){const garnish=lamps&&lamps.garnish,B=hi.body,cells=[],put=(i,j,k,c)=>cells.push([i,j,k,c]);const TRIM=0x3a3c41,CARPET=0x2b2c30,BLK=0x161719,V1=Math.round(g.NOSE_X*2-200.5);   // v3: V1 as in eclipseDPillarTrim (the tail-end cells follow the body; the seat-back end I0 is the rig's and stays)
  const I0=-116,I1=-216+V1,J0=52,J1=87;   // x -58 .. -108 units, y 520 .. 870 mm
  const wall=(i,j)=>{for(let k=20;k<=90;k++)if(B.get(i,j,k)>=0||B.get(i,j,-k)>=0)return k;return null;};
  for(let i=I1;i<=I0;i++){
    for(let j=J0+1;j<=J1;j++){const kw=wall(i,j);if(kw===null)continue;for(const s of [-1,1])if(B.get(i,j,s*(kw-1))<0)put(i,j,s*(kw-1),TRIM);}
    const kf=wall(i,J0+1);if(kf!==null)for(let k=-(kf-1);k<=kf-1;k++)if(B.get(i,J0,k)<0)put(i,J0,k,CARPET);}
  for(let i=I1;i<=I0;i++)for(let k=20;k<=78;k++)for(const s of [-1,1])for(let j=J0+1;j<J1;j++)if(B.get(i,j,s*k)>=0&&B.get(i,j+1,s*k)<0){const kw=wall(i,j+1);if(kw!==null&&k<kw-1)put(i,j+1,s*k,TRIM);}
  const hatchAt=(i,j,k)=>hi.trunk.get(i,j,k)>=0||(garnish&&garnish.get(i,j,k)>=0);
  for(let k=-30;k<=30;k++)for(let i=-237+V1;i<=I1+1;i++){let jt=null;for(let j=40;j>=28;j--)if(B.get(i,j,k)>=0){jt=j;break;}if(jt!==null&&B.get(i,jt+1,k)<0&&!hatchAt(i,jt+1,k)&&!hatchAt(i,jt+2,k))put(i,jt+1,k,BLK);}
  {const IS=-232+V1;let jt=null;for(let j=40;j>=28;j--)if(B.get(IS,j,0)>=0){jt=j;break;}if(jt!==null)for(const [di,dj,dk] of [[0,2,-1],[0,2,1],[0,3,-1],[0,3,1],[0,4,-1],[0,4,0],[0,4,1]])put(IS+di,jt+1+dj,dk,0xb7bcc3);}
  const FAB=0x4a4b50,FABE=0x2c2d31,FABR=0x404146,shelf=[],RE=-228+V1,TAB=12;
  const hw=i=>{let m=null;for(let j=J1;j<=J1+2;j++){const kw=wall(i,j);if(kw!==null)m=m===null?kw:Math.min(m,kw);}return m===null?null:m-3;};
  const hR=hw(RE),corner=(i,k)=>{const r=5,ci=RE+r,ck=hR-r,a=Math.abs(k);return !(i<ci&&a>ck&&Math.hypot(i-ci,a-ck)>r);};
  const recess=(i,k)=>{const i0=-121,i1=-141,h=hw(i),r=4;if(i>i0||i<i1||h===null)return false;const kk=hw(i0)-7,a=Math.abs(k);if(a>kk)return false;
    const ci=Math.min(i0-r,Math.max(i1+r,i)),ck=Math.min(a,kk-r);return Math.hypot(i-ci,a-ck)<=r;};
  for(let i=RE;i<=I0-1;i++){const h=hw(i);if(h===null)continue;
    for(let k=-h;k<=h;k++){if(!corner(i,k))continue;if(i>=-121&&i<=-118&&Math.abs(k)>=hw(-119)-5)continue;const rc=recess(i,k);shelf.push([i,J1+1,k,rc?FABR:FABE]);if(!rc)shelf.push([i,J1+2,k,FAB]);}}
  for(let i=RE;i<=RE+1;i++)for(let k=-TAB;k<=TAB;k++)shelf.push([i,J1,k,FABE]);
  {const h=hw(-119);for(const sd of [-1,1])for(let i=-121;i<=-118;i++)for(let j=J1+1;j<=J1+6;j++)for(let k=h-5;k<=(j<=J1+2?h:h-4);k++)put(i,j,sd*k,BLK);}
  for(let i=I1;i<=I0;i++){const kw=wall(i,J1);if(kw===null)continue;for(const sd of [-1,1])for(let k=Math.min(kw-1,40);k<kw;k++)if(B.get(i,J1,sd*k)<0)put(i,J1,sd*k,TRIM);}
  const mkG=L=>{if(!L.length)return new Grid(0,0,0,0,0,0);let b=[1e9,-1e9,1e9,-1e9,1e9,-1e9];for(const [i,j,k] of L)b=[Math.min(b[0],i),Math.max(b[1],i),Math.min(b[2],j),Math.max(b[3],j),Math.min(b[4],k),Math.max(b[5],k)];
    const G=new Grid(b[0],b[1],b[2],b[3],b[4],b[5]);for(const [i,j,k,c] of L)G.set(i,j,k,c);return G;};
  // v3: nothing of the cargo trims or the cover may stand in (or within 10 mm of) the closed hatch, its glass or the tail lamps (the hatch and lamps were
  // re-laid: hatch = glass + lip above the lamps, lamps body-mounted); within 20 mm of the lamps for the cover (the ECLIPSE letters stand 5 mm proud of them)
  const OB=[hi.trunk,hi.glass.rw],LP=lamps?Object.values(lamps):[],near=(i,j,k,r,Gs)=>{for(const G of Gs)for(let a=-r;a<=r;a++)for(let b=-r;b<=r;b++)for(let c=-r;c<=r;c++)if(G.get(i+a,j+b,k+c)>=0)return true;return false;};
  const okC=c=>B.get(c[0],c[1],c[2])<0&&!near(c[0],c[1],c[2],1,OB)&&!near(c[0],c[1],c[2],1,LP),okS=c=>!near(c[0],c[1],c[2],1,OB)&&!near(c[0],c[1],c[2],2,LP);
  const cellsF=cells.filter(okC);let shelfF=shelf.filter(okS);
  {const ks=new Set(shelfF.filter(c=>c[1]>J1).map(c=>c[0]+','+c[2]));shelfF=shelfF.filter(c=>c[1]!==J1||ks.has(c[0]+','+c[2]));}   // the pull tab only where it hangs under the cover
  return {fixed:mkG(cellsF),shelf:mkG(shelfF),pivot:[(I0-1+.5)/2,(J1+1.5)/2]};}
if(false)module.exports={ECLIPSE_M,makeEclipse,ECLIPSE_RIG};
