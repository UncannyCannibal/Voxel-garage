/* ===== TOYOTA SPRINTER TRUENO AE86 (builder lane 2; scout/spec/verifier R2 approved) ===== */
const AE86_M={
  L:4205,W:1625,H:1335,WB:2400,ovF:810,hubY:280,                    // V L W H WB; MEASURED front overhang 810 (ledger OPEN-1, sum-constrained); hub 280 = loaded radius of 185/70R13 (spec §2b)
  // centreline top profile, nose (bumper top) -> hood -> cowl -> windshield -> roof -> hatch slope -> tail-lamp face.
  // v19: windshield header 1875 (two drawings, the-blueprints #26459 ~1950 and the Fujimi kit sheet ~1900, placed relative to the door like the door itself)
  // MEASURED stations: cowl 1374, roof crown 1335, tail point height 955, lamp bottom 785.
  // v18 front (MEASURED, photo camera fits on side_2.jpg and rear34_1.jpg, two views from opposite ends; wheel hubs, contact patches and the door's belt
  // corners as the fit points): fender line 775-800 at the nose, 835-840 at 640, 875-895 at the A-pillar foot; windshield header (roof front) 1700-1750 at
  // 1290-1310; door-glass top front corner 1800-1860. The old table put the cowl at 1100 and the header at 2050 (a 18 deg windshield, a wedge nose): the hood
  // centreline below is the fender line + the 30 mm crown; the windshield runs 1374/925 -> 1780/1290 (42 deg). Stations between are DESIGN (smooth).
  // v20 nose + hood (MEASURED, two dimensioned drawings read column by column: the-blueprints zenki sheet and the Fujimi kit sheet, 13.5 / 12.7 mm per px,
  // scaled by their 2400 wheelbases): bumper top ~555 to ~85 from the nose, the nose face rising to ~690 at 150, hood 713 at 200, ~753 at 400, ~792 at 600,
  // ~831 at 800, ~867 at 1000, ~886 at 1200 (the two sheets agree within ~25 mm; mean taken). v18's camera fits had the front 60-120 mm higher.
  top:[[0,560],[60,565],[85,580],[100,640],[125,670],[150,690],[200,713],[300,735],[400,753],[500,775],[600,794],[700,816],[800,831],[900,849],[1000,867],[1100,877],[1200,888],[1300,905],[1374,925],
       [1500,1020],[1600,1100],[1700,1180],[1800,1255],[1875,1300],[1950,1320],[2050,1330],[2200,1334],[2300,1335],[2600,1335],[2900,1335],[3100,1330],[3250,1300],[3400,1240],[3550,1160],[3700,1085],[3850,1030],[3950,1005],[4050,995],[4130,988],[4205,960]],
  // v18 tail (MEASURED: rear_1.jpg scaled by the 330 x 165 mm JDM plate, rear34_1.jpg camera fit): the hatch glass ends ~1000, a short deck, then a near-vertical
  // face: white hatch panel with the badges ~790-985, black lamp band ~575-790 with the plate between the lamps, the bumper right under it (top ~560).
  // The old tail dropped to 780 at the very back and had the lamps at 785-955 with a 230 mm white strip under them: the layout upside down.
  belt:[[1100,870],[2534,873],[3600,900],[4205,910]],                 // window bottom line: 873 MEASURED (dealer); rise to the rear DESIGN
  // plan half-width of the lower body (DESIGN: max half 812, the builder's half-cell choice for 1625/2 = 812.5, stated per spec §2b)
  plan:[[0,300],[40,500],[100,650],[200,750],[400,800],[800,805],[3600,805],[3900,800],[4100,760],[4205,600]],   // v21: max half 805 (was 812): the body measured 1640 mm over its outermost cells against the VERIFIED 1625; 10 mm cells give 1620 or 1640, and 1620 is the nearer
  // lower-body section: fraction of the plan half-width by height (DESIGN, EF pattern)
  sLow:[[150,.98],[200,.99],[300,1],[400,1],[700,1],[800,.98],[870,.95],[950,.92]],   // U-1: near-flush sill (16 mm inset at 150 mm, 8 mm at 200 mm, flush at 300 mm) instead of the 40-80 mm tuck
  // greenhouse half-width by height at the B-pillar (DESIGN: belt 735 narrowing to 350 at the roof rail; EF pattern, AE86 heights)
  tumble:[[873,735],[950,730],[1050,700],[1150,655],[1250,590],[1300,520],[1335,350]],
  aPillar:{x0:1374,y0:873,h0:740,x1:1875,y1:1300,h1:520},              // windshield side edge, base (cowl MEASURED) -> top (v18 MEASURED header 1700-1750 at the side: photo camera fits)
  cPillar:{x0:3200,y0:1310,h0:500,x1:3650,y1:955,h1:760},              // hatch side edge, top (roof rear DESIGN) -> bottom (tail point MEASURED 955)
  arch:{f:{x:810,y:300,r:365},r:{x:3210,y:300,r:365},lip:30},           // wheel openings: centres on the axles, y 300, r 365 DESIGN (589 mm tyre + clearance; EF pattern)
  door:{front:1370,rearTop:2680,rearMid:[2675,400],rearLow:[2655,300],rearBot:[2625,225],bottom:225},   // v19 MEASURED: two drawings (the-blueprints #26459: 1428-2721; Fujimi kit sheet: 1373-2694, both with ~834 overhangs) and the photos' arch gaps (~180 mm each end) agree; placed at those gaps from this model's axles. Below the belt the door runs ~150 mm behind the door glass, under the B-pillar (side_2.jpg). The ledger's 1309-2534 was wrong
     // front/rearTop MEASURED (ledger); rear edge shape DESIGN (EF pattern)
  bPillar:{botF:2534,botR:2630,topF:2495,topR:2591},   // v18: the top leans FORWARD (photo camera fits: door-glass top rear corner 2320-2410; it leaned back 46 mm)
                     // black B-pillar (DESIGN; minor 19: added, towerF does not cover it; M-3: narrowed 20 mm from the quarter side, door rear edge 2534 MEASURED untouched)
  quarter:[[2600,1260],[3200,1250],[3493,955],[3400,905],[2640,905]],   // v18: front edge follows the forward-leaning B-pillar (clipped at its rear edge)
    // hatch glass outline, side view (DESIGN from OPEN-3: front-top 1260, rear point 3493/955, bottom 905)
  hood:{x0:150,x1:1374,half:700},                                       // hood front edge (DESIGN), cowl shut line 1374 (MEASURED), half-width DESIGN
  hatch:{hingeX:3200,roofHalf:480,glassBot:1000,lampTop:790,lampBot:580,garnishHalf:325,sideHalf:760,bottom:580},     // v18 glassBot/lampTop/lampBot/bottom MEASURED (rear photos, see the tail note); hingeX/roofHalf/garnishHalf/sideHalf DESIGN
  molding:{x0:810,x1:3210,y0:525,y1:550},                              // black side molding, arch to arch (T-1: band moved wholly above the 520 mm panda break — dealer side photo puts the stripe just above the break, ~535 mm; height DESIGN)
  rocker:160,bottomF:250,bottomR:250,                                   // rocker MEASURED (sill 160, ledger); bottomF/bottomR DESIGN (EF pattern)
  // inner structure (DESIGN, sized to clear the parts that live there; the collision suite checks them)
  bay:{x0:150,x1:1150,half:545,floor:240,upY:700,upHalf:675},                              // engine bay: radiator support face .. firewall, between the inner fender aprons (4A-GE 560 wide clears 2x545)
  towerF:{x:810,dx:210,zIn:420,top:800},wheelF:{zIn:440,bayHalf:420},   // front strut towers round the MacPherson struts (DESIGN); front wheelhouse inner (minor 19)
  tubR:{zIn:555},towerR:{x:3280,dx:150,zIn:440,top:840},   // v17: centred on the springs and dampers (behind the axle), inboard to clear the coils
   // rear wheel tubs + damper towers round the live axle links (DESIGN)
  tunnel:{x0:1150,x1:2900,half:125,top:460},   // v17: top raised 270 -> 460 so the T50 (top 440) and the driveshaft run inside the tunnel, not through the floor (DESIGN, 20 mm clearance)
  kick:{x0:2950,x1:3320,top:420,half:585},   // v17: rear floor kick-up over the live axle: axle tube, pumpkin, Panhard rod and the link ends with bump travel (DESIGN)
  tankP:{x0:2640,x1:3010,zc:-220,half:175,top:295},   // v17: pocket in the floor pan for the fuel tank under the rear seat (DESIGN)
 exhCh:{x0:2900,x1:4205,z0:-440,z1:440,top:280},floorC:230,floorR:300,                            // tunnel half 125 = T50 tunnel 250 (catalogue); exhaust channel DESIGN
  cargoFloor:520
};

function makeAE86(){
  const M=AE86_M,XM=M.ovF+M.WB/2,wx=m=>(XM-m)/20,u=m=>m/20,mm=x=>XM-x*20;
  const g={S:M,wx,u,mm};
  const tab=(T,v)=>{if(v<=T[0][0])return T[0][1];for(let i=0;i<T.length-1;i++){const a=T[i],b=T[i+1];if(v<=b[0])return a[1]+(b[1]-a[1])*(v-a[0])/(b[0]-a[0]);}return T[T.length-1][1];};
  g.tab=tab;
  g.NOSE_X=wx(0);g.REAR_X=wx(M.L);g.AX_F=wx(M.ovF);g.AX_R=wx(M.ovF+M.WB);g.WR=u(M.hubY);g.ROCK=u(M.rocker);g.BELT=u(873);g.ROOF=u(1335);g.halfW=u(805);
  const TOPW=M.top.map(([x,y])=>[wx(x),u(y)]);g.TOP=TOPW;
  const topC=g.topC=x=>{const m=mm(x);if(m<M.top[0][0]||m>M.top[M.top.length-1][0])return -1;return u(tab(M.top,m));};
  // crown: off-centre the hood, windshield and hatch surfaces fall away (DESIGN, EF pattern scaled to AE86 stations)
  const crownMM=m=>{if(m<1374)return 30;if(m<1875)return 70*(1-(m-1374)/501);if(m<3200)return 0;return 45*clampv((m-3200)/250,0,1);};
  g.crown=x=>u(crownMM(mm(x)));
  const top=g.top=(x,z)=>{const c=topC(x);if(c<0)return -1;const k=Math.abs(z)/40.6;return c-g.crown(x)*k*k;};
  g.topY=x=>topC(x)<0?(x>0?20:40):topC(x);
  const belt=g.belt=x=>u(tab(M.belt,mm(x)));
  const plan=g.plan=x=>u(tab(M.plan,mm(x)));
  const sLow=y=>tab(M.sLow,y*20);
  const A=M.aPillar,C=M.cPillar;
  const aEnv=(x,y)=>{const t=clampv((y*20-A.y0)/(A.y1-A.y0),0,1),xa=A.x0+(A.x1-A.x0)*t,ha=A.h0+(A.h1-A.h0)*t,m=mm(x);return u(ha+Math.max(0,m-xa)*.45);};
  const cEnv=(x,y)=>{const t=clampv((C.y0-y*20)/(C.y0-C.y1),0,1),xc=C.x0+(C.x1-C.x0)*t,hc=C.h0+(C.h1-C.h0)*t,m=mm(x);return u(hc+Math.max(0,xc-m)*.45);};
  g.aEnv=aEnv;g.cEnv=cEnv;
  const gh=g.gh=(x,y)=>{const tc=topC(x),sh=clampv(1335-tc*20,0,40);return Math.min(u(tab(M.tumble,y*20+sh)),aEnv(x,y),cEnv(x,y));};
  const EDGE_R=1.6;
  const halfAt=g.halfAt=(x,y)=>{
    const b=belt(x),lo=plan(x)*sLow(Math.min(y,b));
    let r;
    if(y<=b)r=lo;else{const gg=gh(x,y);r=y<b+1.5?lo+(gg-lo)*sm(b,b+1.5,y):gg;}
    const tc=topC(x);if(tc>0&&tc<b+.5){const dt=tc-y;if(dt>=0&&dt<EDGE_R){const q=EDGE_R-dt;r-=EDGE_R-Math.sqrt(Math.max(0,EDGE_R*EDGE_R-q*q));}}
    if(y>=g.ROCK&&y<g.ROCK+1.5){const q=g.ROCK+1.5-y;r-=1.5-Math.sqrt(Math.max(0,2.25-q*q));}
    return r;};
  g.frontLimit=y=>y*20<500?wx(150):g.NOSE_X;g.rearLimit=y=>y*20<560?wx(4100):g.REAR_X;
  g.bottom=x=>{const m=mm(x);return u(m<420?M.bottomF:(m<1150?280:(m>3800?M.bottomR:M.rocker)));};   // DESIGN: the fender aprons beside the bay end 280 mm up (the lower arms pass beneath)
  g.bottomZ=(x,z)=>{const m=mm(x),b=g.bottom(x);return (m>=1150&&m<=3800&&Math.abs(z)<u(m>M.arch.r.x-M.arch.r.r?M.tubR.zIn:560))?u(m>=2900?M.floorR:M.floorC):b;};
  g.YBOT=g.bottom;
  g.ARCH_R=u(M.arch.f.r);g.ARCH_F={x:wx(M.arch.f.x),y:u(M.arch.f.y),r:u(M.arch.f.r)};g.ARCH_RR={x:wx(M.arch.r.x),y:u(M.arch.r.y),r:u(M.arch.r.r)};
  g.archLip=(x,y)=>{let l=0;for(const a of [g.ARCH_F,g.ARCH_RR]){const d=Math.hypot(x-a.x,y-a.y);if(d>=a.r&&d<a.r+u(M.arch.lip))l=Math.max(l,.2*(1-(d-a.r)/u(M.arch.lip)));}return l;};
  g.profDist=(x,y)=>{let best=1e9;const T=TOPW;for(let i=0;i<T.length-1;i++){const a=T[i],b=T[i+1],dx=b[0]-a[0],dy=b[1]-a[1],L=dx*dx+dy*dy,t=L?clampv(((x-a[0])*dx+(y-a[1])*dy)/L,0,1):0;best=Math.min(best,Math.hypot(x-(a[0]+dx*t),y-(a[1]+dy*t)));}return best;};
  g.profDistZ=(x,y,z)=>{const k=Math.abs(z)/40.6;return g.profDist(x,y+g.crown(x)*k*k);};
  g.noseX=az=>g.NOSE_X;g.rearX=az=>g.REAR_X;
  g.xA=y=>wx(A.x0+(A.x1-A.x0)*clampv((y*20-A.y0)/(A.y1-A.y0),0,1));
  g.xC=y=>wx(C.x0+(C.x1-C.x0)*clampv((C.y0-y*20)/(C.y0-C.y1),0,1));
  g.DOOR_F=wx(M.door.front);g.DOOR_R=wx(M.door.rearTop);
  g.doorRear=y=>{const D=M.door,m=y*20;if(m>=D.rearMid[1])return wx(D.rearTop);if(m>=D.rearLow[1])return wx(D.rearMid[0]+(D.rearLow[0]-D.rearMid[0])*(D.rearMid[1]-m)/(D.rearMid[1]-D.rearLow[1]));
    return wx(D.rearLow[0]+(D.rearBot[0]-D.rearLow[0])*(D.rearLow[1]-m)/(D.rearLow[1]-D.rearBot[1]));};
  g.HOOD_X0=wx(M.hood.x1);g.HOOD_X1=wx(M.hood.x0);g.HOOD_HALF=u(M.hood.half);
  g.HATCH_X=wx(M.hatch.hingeX);
  // HATCH_HINGE is EF's HATCH_X equivalent (minor 18): the hinge line sits 20 mm above the panel edge (gooseneck hinges)
  g.HOOD_HINGE=[g.HOOD_X0,topC(g.HOOD_X0)+1.0];g.HATCH_HINGE=[g.HATCH_X,topC(g.HATCH_X)+1.0];
  return g;
}


/* ===== TOYOTA SPRINTER TRUENO AE86 (1983-1987, zenki liftback GT-APEX).
   Detail table in millimetres, same pattern as EFD/Z32D. Labels: V = VERIFIED,
   MEASURED = photo ledger (MEASUREMENTS-AE86.md), DESIGN = laid out, reason stated.
   Bumper face sections are DESIGN bands (ledger OPEN-2: bumper heights NOT measured);
   the enforcer render check judges them. Lamp widths/heights: lamp width 415 MEASURED
   (widebody-caveated, ledger OPEN-4); lamp height 170 DESIGN (width x ~0.41).
   Pod width 380 / gap 711 / inset 75 MEASURED (ledger OPEN-5); pod depth 380 and
   closed-panel height 130 DESIGN. Mirror mount DESIGN (door angle not measured;
   aim 12/14 deg carried from EF form, DESIGN, enforcer judges). */
const AE86D={
  // front bumper (JDM short bumper, body-coloured GT-APEX): face x station by height,
  // bottom 250 at the face, 210 on the side lips; top 555. Indicators in the bumper
  // corners (zenki: small, non-wraparound); centre intake slot below the plate.
  bumperF:{face:[[250,80],[300,60],[440,30],[470,15],[500,5],[520,15],[545,35],[555,55]],top:555,bot:250,botSide:210,bow:40,cornerZ:500,cornerR:300,
    turn:{z0:560,z1:740,y0:380,y1:430},intake:{z:300,y0:290,y1:380},plate:{y:400,w:330,h:165}},
  // rear bumper: face near the tail, top 555, bottom 250; exhaust notch on the
  // car's LEFT only (rig exh.side:-1; tip side MEASURED from rear_1.jpg / rear34_2.jpg).
  bumperR:{face:[[320,4140],[360,4165],[440,4185],[470,4195],[500,4195],[540,4180],[555,4150]],top:555,bot:320,botSide:300,bow:25,cornerZ:560,cornerR:260,   // v18 bottom 320 (MEASURED ~360 on rear34_1 and rear_1; was 250)
    plate:{y:670,w:330,h:165},exhaust:{z:-265,w:115,y:240}},
  // rear lamps, per lamp (MEASURED order outer->inner amber/red/clear; width 415):
  // amber 615..740 (125), red 425..615 (190), clear 325..425 (100) — segment
  // widths inside the 415 are DESIGN (only order + total width were measured).
  tail:{y0:580,y1:790,zIn:325,zAmb:615,zRev:425},   // v18: band 580-790 (MEASURED, rear photos; was 785-955)
  
  // pop-up pods (MEASURED width/gap/inset; depth + closed height DESIGN):
  // v20 pop-up units (MEASURED from the zenki sheet's front and top views: unit 260 wide, inner edge ~372, outer ~632 from the centre line; lamp ~185 x 145;
  // raised top 818-849 in the front and side views). The lid is the panel between x0 and x1 (stations); it turns about a transverse pivot under its rear edge
  // (pivDown below the skin), front edge up, through rise degrees, like the real unit: closed, the lid is flush and the lamp faces down into the nose;
  // open, the lamp faces forward over the grille and the lid slopes back to the hood. rise/eyebrow/bezel DESIGN, chosen so the raised top lands at ~833.
  pod:{zIn:375,zOut:635,x0:110,x1:295,pivDown:15,rise:60,eyebrow:30,bezel:35,lensW:180,lensH:140,lid:30,secs:.8},
  mirror:{x0:1440,x1:1530,y0:900,y1:1005,out0:55,out1:235},   // v18: 80 mm further back, on the door's sail behind the A-pillar foot (photo camera fits put the housing at 1400-1530); it overhung the body's A-pillar foot
     // v17: housing 20 mm further out so its arm can rise clear of the body's flank to the door's top edge   // DESIGN mount on the door by the sail
  sail:{x0:1479,slope:1.2}   // door glass front edge at the belt (door front 1309 + 170, EF pattern)
};
function ae86Tab(T,v){if(v<=T[0][0])return T[0][1];for(let i=0;i<T.length-1;i++){const a=T[i],b=T[i+1];if(v<=b[0])return a[1]+(b[1]-a[1])*(v-a[0])/(b[0]-a[0]);}return T[T.length-1][1];}

/* ---- bumpers: same construction as efBumper (40 mm moulding, body cut back
   behind it), AE86D sections and AE86 stations. Panda rule: below the 520 mm
   break the bumper is black, above it body colour (DESIGN break, see body). ---- */
function ae86BumperIn(g,front,x,y,z,T){const B=front?AE86D.bumperF:AE86D.bumperR,m=g.mm(x),ym=y*20,az=Math.abs(z)*20;
  if(ym>B.top||(front?m>560:m<3650))return false;const arch=front?g.ARCH_F:g.ARCH_RR;if(Math.hypot(x-arch.x,y-arch.y)<arch.r)return false;
  const hw=g.halfAt(x,Math.min(y,g.u(B.top)))*20;if(az>hw+4)return false;
  const sm=(a,b,v)=>Math.max(0,Math.min(1,(v-a)/(b-a))),bot=front?B.bot+(B.botSide-B.bot)*sm(200,360,m):B.botSide+(B.bot-B.botSide)*sm(3800,4050,m);if(ym<bot)return false;
  const k=az/812,pl=B.bow*k*k+(az>B.cornerZ?(B.cornerR-Math.sqrt(Math.max(0,B.cornerR*B.cornerR-Math.min(B.cornerR,az-B.cornerZ)**2))):0);
  const d=front?m-(ae86Tab(B.face,ym)+pl):(ae86Tab(B.face,ym)-pl)-m;if(d<0)return false;return d<=T||hw-az<=T;}
function ae86BumperOutside(g,front,x,y,z){const B=front?AE86D.bumperF:AE86D.bumperR,m=g.mm(x),ym=y*20,az=Math.abs(z)*20;
  if(ym>B.top||(front?m>560:m<3650))return false;const arch=front?g.ARCH_F:g.ARCH_RR;if(Math.hypot(x-arch.x,y-arch.y)<arch.r)return false;
  const sm=(a,b,v)=>Math.max(0,Math.min(1,(v-a)/(b-a))),bot=front?B.bot+(B.botSide-B.bot)*sm(200,360,m):B.botSide+(B.bot-B.botSide)*sm(3800,4050,m);if(ym<bot)return false;
  const k=az/812,pl=B.bow*k*k+(az>B.cornerZ?(B.cornerR-Math.sqrt(Math.max(0,B.cornerR*B.cornerR-Math.min(B.cornerR,az-B.cornerZ)**2))):0);
  return (front?m-(ae86Tab(B.face,ym)+pl):(ae86Tab(B.face,ym)-pl)-m)<0;}
function ae86BumperRelief(g,x,y,z,more){const T=50+(more||0);return ae86BumperIn(g,true,x,y,z,T)||ae86BumperIn(g,false,x,y,z,T)||(!more&&(ae86BumperOutside(g,true,x,y,z)||ae86BumperOutside(g,false,x,y,z)));}
function ae86Bumper(g,front){
  const B=front?AE86D.bumperF:AE86D.bumperR,{wx,u,halfAt}=g,mmx=x=>g.mm(x);
  const arch=front?g.ARCH_F:g.ARCH_RR,ext=Math.ceil(g.halfW+1.5);
  const plan=az=>{const k=az/812;let d=B.bow*k*k;if(az>B.cornerZ){const q=Math.min(B.cornerR,az-B.cornerZ);d+=B.cornerR-Math.sqrt(B.cornerR*B.cornerR-q*q);}return d;};
  const x0=front?wx(560):wx(4210),x1=front?wx(-12):wx(3650);
  const G=hgrid(Math.min(x0,x1)-1,Math.max(x0,x1)+1,u(Math.min(B.bot,B.botSide))-1,u(B.top)+1,-ext,ext);
  eachCell(G,null,(i,j,k,n)=>{if(ae86BumperIn(g,front,i/HR,j/HR,k/HR,40))G.d[n]=1;});
  shellHi(G,(x,y,z,inner)=>{if(inner)return 0x1a1b1d;return y<u(480)?0x15171c:PAINT;},2);   // panda: black below, body colour above; v18: the bumpers' white top band is ~80 mm deep (MEASURED side_2.jpg 464-554, rear_1.jpg 483-560), so the break is at 480 on the bumpers (520 on the body)
  const faceCells=(pred,fn)=>eachCell(G,null,(i,j,k,n)=>{if(G.d[n]<0)return;const x=i/HR,y=j/HR,z=k/HR;if(pred(mmx(x),y*20,Math.abs(z)*20,z))fn(n,x,y,z);});
  const lamps={};const put=(kind,i,j,k,c)=>{(lamps[kind]=lamps[kind]||[]).push([i,j,k,c]);};
  if(front){
    const T=B.turn,I=B.intake;
    faceCells((m,ym,az)=>az>=T.z0&&az<=T.z1&&ym>=T.y0&&ym<=T.y1&&m<ae86Tab(B.face,ym)+plan(az)+12,(n,x,y,z)=>{const az=Math.abs(z)*20,edge=(az<T.z0+12||az>T.z1-12||y*20<T.y0+12||y*20>T.y1-12);
      put(edge?'frame':'famb',Math.round(x*HR),Math.round(y*HR),Math.round(z*HR),edge?0x1a1b1d:0xf09a2a);G.d[n]=-1;});   // zenki bumper indicators, amber
    {const band=(m,ym,az)=>az<=I.z&&ym>=I.y0&&ym<=I.y1&&m<ae86Tab(B.face,ym)+plan(az)+30;
     const outerMap=()=>{const outer=new Map();faceCells(band,(n,x,y,z)=>{const key=y+','+z,o=outer.get(key);if(!o||x>o.x)outer.set(key,{x,n});});return outer;};
     const keepFace=(y,z)=>{const ym=y*20,az=Math.abs(z)*20;return ym>=310&&ym<=495&&az<=175;};
     for(let pass=0;pass<2;pass++)for(const [key,o] of outerMap()){const [y,z]=key.split(',').map(Number);if(keepFace(y,z))continue;G.d[o.n]=-1;}
     for(const [key,o] of outerMap()){const [y,z]=key.split(',').map(Number);if(keepFace(y,z))continue;G.d[o.n]=0x08090a;}}   // V-5: centre intake as a 20 mm recess with a near-black floor, not a 10 mm dimple whose floor matched the black face (the plate-covered centre keeps its face on every pass)
  }else{
    const E=B.exhaust;faceCells((m,ym,az,z)=>z*20>=E.z-E.w&&z*20<=E.z+E.w&&ym<E.y+45,(n)=>{G.d[n]=-1;});   // tail-pipe cut-out, car's right only (rig side:1, DESIGN)
  }
  const out={grid:G,lamps:{}};
  for(const k in lamps){const L=lamps[k];let b=[1e9,-1e9,1e9,-1e9,1e9,-1e9];for(const [i,j,kk] of L)b=[Math.min(b[0],i),Math.max(b[1],i),Math.min(b[2],j),Math.max(b[3],j),Math.min(b[4],kk),Math.max(b[5],kk)];
    const Gl=new Grid(b[0],b[1],b[2],b[3],b[4],b[5]);for(const [i,j,kk,c] of L)Gl.set(i,j,kk,c);out.lamps[k]=Gl;}
  const pl=B.plate,py=pl.y;out.plate={x:wx(ae86Tab(B.face,py))+(front?.6:-.6),y:u(py),w:u(pl.w),h:u(pl.h)};
  return out;
}


/* ---- AE86 lamps (zenki Trueno): NO fixed headlamp lens while the pods are
   closed — a fixed lens would read as a Levin nose (forbidden). Headlamp light
   comes from the pop-up units (stage 2, P.pods), which rise when lights switch on.
   Nose: smooth closed panel + narrow black grille slot below the pods + small
   amber corner lights outboard of the pods (ledger OPEN-5, front-jpd photo).
   Rear: per lamp amber / red / clear outer->inner (ledger OPEN-4, photo-confirmed
   order; segment widths inside the measured 415 mm width are DESIGN), black
   garnish band across the tail with the plate recess at centre (SPRINTER lettering
   on the viewer's right — side ambiguity flagged in the build report). ---- */
function ae86Lamps(g,hi){
  const {wx,u,halfAt,NOSE_X,REAR_X}=g,hw=g.halfW,TL=AE86D.tail;
  const out={},cell=(kind,i,j,k,c)=>{(out[kind]=out[kind]||[]).push([i,j,k,c]);};
  const isOut=new Set(),key=(i,j,k)=>i+','+j+','+k;
  for(const [gr,box] of [[hi.body,[wx(450),NOSE_X+1,u(350),u(740),-hw-1,hw+1]],[hi.hood,[wx(450),NOSE_X+1,u(350),u(740),-hw-1,hw+1]],[hi.body,[REAR_X-1,wx(3650),u(560),u(800),-hw-1,hw+1]],[hi.trunk,[REAR_X-1,wx(3650),u(560),u(800),-hw-1,hw+1]]])   // v18: the nose's grille band and corner lamps (565-720) and the rear lamp band (580-790)
    eachCell(gr,box,(i,j,k)=>{if(gr.get(i,j,k)>=0)isOut.add(key(i,j,k));});
  const scan=(gr,pred)=>eachCell(gr,null,(i,j,k)=>{if(gr.get(i,j,k)<0||!isOut.has(key(i,j,k)))return;const x=i/HR,y=j/HR,z=k/HR,m=g.mm(x),ym=y*20,az=Math.abs(z)*20;pred(m,ym,az,x,y,z,()=>{gr.set(i,j,k,-1);});});
  const bowF=az=>{const k=az/812;let d=40*k*k;if(az>500){const q=Math.min(300,az-500);d+=300-Math.sqrt(300*300-q*q);}return d;};
  // front amber corner lights (outboard of the pods, on the nose face + wrap)
  // v18: the amber lamps sit on the fender corners just above the bumper (MEASURED side_2.jpg 576-650; front34_1/2): they were at 430-560, behind the bumper
  scan(hi.body,(m,ym,az,x,y,z,kill)=>{if(ym<570||ym>655||az<AE86D.pod.zOut)return;const face=m<200,side=az>halfAt(x,Math.min(y,u(655)))*20-25&&m<170;if(!face&&!side)return;
    const edge=ym<580||ym>645||az>800||m>190&&face;cell(edge?'frame':'famb',Math.round(x*HR),Math.round(y*HR),Math.round(z*HR),edge?0x1a1b1d:0xf09a2a);kill();});
  scan(hi.hood,(m,ym,az,x,y,z,kill)=>{if(ym<570||ym>655||az<AE86D.pod.zOut)return;const face=m<200,side=az>halfAt(x,Math.min(y,u(655)))*20-25&&m<170;if(!face&&!side)return;
    const edge=ym<580||ym>645||az>800||m>190&&face;cell(edge?'frame':'famb',Math.round(x*HR),Math.round(y*HR),Math.round(z*HR),edge?0x1a1b1d:0xf09a2a);kill();});
  // narrow black grille slot below the pods (zenki closed nose: NO full-width grille) — F-1: carved as a real 1-cell pocket, not flush paint: ONLY the +x-surface cell is removed (its +x neighbour must be empty, else it is interior and stays) and the cell behind it is darkened as the pocket floor
  // v18: the zenki grille is a full-width black band across the nose face between the corner lamps, from the bumper top up to the pods (front_1.jpg,
  // front34_1.jpg, front34_2.jpg; the TRUENO badge sits on it); it was a 50 mm slot at 380-430, behind the bumper
  scan(hi.body,(m,ym,az,x,y,z,kill)=>{if(m>=150||ym<570||ym>(az>=AE86D.pod.zIn-10?720:670)||az>=AE86D.pod.zOut)return;   // v20: under each pop-up unit the black runs up to the unit (the closed unit's front plate)
  const i=Math.round(x*HR),j=Math.round(y*HR),k=Math.round(z*HR);if(hi.body.get(i+1,j,k)>=0)return;kill();if(hi.body.get(i-1,j,k)>=0)hi.body.set(i-1,j,k,0x0d0e10);});
  // rear lamps: body + hatch, face (near tail) or side wrap
  const rear=(m,ym,az,x,y,z,kill)=>{if(ym<TL.y0||ym>TL.y1||az<TL.zIn)return;const face=m>4100,side=az>halfAt(x,Math.min(y,u(TL.y1)))*20-25&&m>4080;if(!face&&!side)return;   // v18: the wrap onto the side is ~100 mm (rear34_1/2); from 3650 it painted a 550 mm black box on each quarter
    const edge=ym<TL.y0+10||ym>TL.y1-10||az>730;   // v18: the rear face is vertical now, so the old 'rearmost cells are frame' rule would have blacked out every lens
    const kind=edge?'frame':(az>=TL.zAmb?'amb':(az>=TL.zRev?'red':'wht'));
    const col=kind==='frame'?0x1a1b1d:(kind==='amb'?0xf09a2a:(kind==='red'?0xc02b25:0xe8ecef));
    cell(kind,Math.round(x*HR),Math.round(y*HR),Math.round(z*HR),col);kill();};
  scan(hi.body,rear);scan(hi.trunk,rear);
  // black garnish band across the tail (hatch), plate recess at centre
  eachCell(hi.trunk,null,(i,j,k)=>{if(hi.trunk.get(i,j,k)<0)return;const x=i/HR,y=j/HR,z=k/HR,m=g.mm(x),ym=y*20,az=Math.abs(z)*20;
    if(m<=4100||ym<TL.y0||ym>TL.y1||az>TL.zIn)return;cell('garnish',i,j,k,0x141517);hi.trunk.set(i,j,k,-1);});
  const grids={};
  for(const kind in out){const L=out[kind];let b=[1e9,-1e9,1e9,-1e9,1e9,-1e9];for(const [i,j,k] of L)b=[Math.min(b[0],i),Math.max(b[1],i),Math.min(b[2],j),Math.max(b[3],j),Math.min(b[4],k),Math.max(b[5],k)];
    const G=new Grid(b[0],b[1],b[2],b[3],b[4],b[5]);for(const [i,j,k,c] of L)G.set(i,j,k,c);grids[kind]=G;}
  return grids;
}


/* ---- v20 pop-up headlamp units (zenki Trueno), the real mechanism: each unit is a lamp bucket under a body-colour lid, on a
   transverse pivot under the lid's rear edge. Closed: the lid is the panel, flush in the skin, and the lamp faces down into
   the nose (hidden). Lights on: the motor turns the unit front-edge-up through D.rise degrees; the lamp ends facing forward
   over the grille, the black top of the bucket (the strip under the closed lid's front edge) becomes the raised unit's brow,
   and the lid slopes back to the hood. The lid cells are taken out of the panels (the hood is notched round them, as on the
   car); every cell the unit sweeps through between closed and open is carved out of the body and the hood (and, later, the
   bay), and the cells left round that pocket are blacked: the rim round each lid and the pocket walls. The pocket set is
   kept on g, so solidAt (the skin's surface net) and other builders see the opening. Returns per side: lid (closed pose),
   house + lens (OPEN pose, axis-aligned, so the lens stays square-cut), the pivot P and the angle th (radians). ---- */
function ae86PopUps(g,hi,lamps){
  const D=AE86D.pod,{wx,u}=g,zc=(D.zIn+D.zOut)/2,th=D.rise*Math.PI/180;
  const S=m=>g.top(wx(m),u(zc))*20;                                       // skin height (mm) at station m on the unit's centre line
  const P={x:wx(D.x1),y:u(S(D.x1)-D.pivDown)};
  const rot=(x,y,a)=>{const c=Math.cos(a),s=Math.sin(a),dx=x-P.x,dy=y-P.y;return [P.x+dx*c-dy*s,P.y+dx*s+dy*c];};
  const F=[wx(D.x0),u(S(D.x0))],Fo=rot(F[0],F[1],th),R=[wx(D.x1),u(S(D.x1))],Ro=rot(R[0],R[1],th);
  const xFace=Fo[0]+u(D.eyebrow),yTop=Fo[1],lensTop=yTop-u(D.bezel),lensBot=lensTop-u(D.lensH),yBot=lensBot-u(20);
  const dx=Ro[0]-Fo[0],dy=Ro[1]-Fo[1],dl=Math.hypot(dx,dy),nx=dy/dl,ny=-dx/dl;   // open lid: top line Fo->Ro, normal pointing up and back
  const botAt=x=>yBot+(P.y-u(10)-yBot)*Math.min(1,Math.max(0,(xFace-x)/(xFace-P.x)));
  const zA=u(D.zIn+5),zB=u(D.zOut-5);
  const inHouse=(x,y,az)=>{if(az<zA||az>zB||x>xFace||x<Ro[0]||y>yTop||y<botAt(x))return false;
    if(x<Fo[0]&&(x-Fo[0])*nx+(y-Fo[1])*ny>-u(D.lid))return false;return true;};
  const inLid=(x,y,az)=>{const m=g.mm(x);if(m<D.x0||m>D.x1||az*20<D.zIn+5||az*20>D.zOut-5)return false;const t=g.top(x,az);return y<=t+.25&&y>t-u(D.lid);};
  const out={P,th,rot,lens:{x:xFace,y:(lensTop+lensBot)/2,z:u(zc)},sides:[],pocket:new Set()};
  const key=(i,j,k)=>i+','+j+','+k;
  // the swept volume, closed -> open, in 2-degree steps (10 mm cells, tested at the cell centre)
  const i0=Math.floor(wx(D.x1+60)*2),i1=Math.ceil(wx(D.x0-80)*2),j0=Math.floor(u(520)*2),j1=Math.ceil((yTop+1)*2),kA=Math.floor(D.zIn/10)-1,kB=Math.ceil(D.zOut/10)+1;
  const N=Math.ceil(D.rise/2);
  for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++)for(let ak=kA;ak<=kB;ak++){const x=i/2,y=j/2,az=ak/2;let hit=false;
    for(let n=0;n<=N&&!hit;n++){const a=th*n/N,po=rot(x,y,th-a),pc=rot(x,y,-a);if(inHouse(po[0],po[1],az)||inLid(pc[0],pc[1],az))hit=true;}
    if(hit){out.pocket.add(key(i,j,ak));out.pocket.add(key(i,j,-ak));}}
  for(const sd of [-1,1]){
    const lid=new Grid(i0,i1,j0,j1,sd<0?-kB:kA,sd<0?-kA:kB);
    for(const G of [hi.hood,hi.body])for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++)for(let ak=kA;ak<=kB;ak++){const k=sd*ak,v=G.get(i,j,k);if(v<0)continue;
      if(inLid(i/2,j/2,ak/2)&&lid.get(i,j,k)<0){lid.set(i,j,k,v);G.set(i,j,k,-1);}}
    // bucket and lens, OPEN pose: the face is the most forward cell column; the lens sits one cell back inside a black bezel
    const fI=Math.floor(xFace*2),hI0=Math.floor(Ro[0]*2),hJ0=Math.floor(Math.min(yBot,P.y-1)*2),hJ1=Math.ceil(yTop*2);
    const house=new Grid(hI0,fI,hJ0,hJ1,sd<0?-kB:kA,sd<0?-kA:kB),lens=new Grid(fI-1,fI-1,hJ0,hJ1,sd<0?-kB:kA,sd<0?-kA:kB);
    const lz0=zc-D.lensW/2,lz1=zc+D.lensW/2,inLens=(y,az)=>y*20>=lensBot*20&&y*20<=lensTop*20&&az*20>=lz0&&az*20<=lz1;
    for(let i=hI0;i<=fI;i++)for(let j=hJ0;j<=hJ1;j++)for(let ak=kA;ak<=kB;ak++){const x=i/2,y=j/2,az=ak/2;if(!inHouse(x,y,az))continue;const k=sd*ak;
      if(i===fI&&inLens(y,az))continue;   // the lens is recessed one cell behind the bezel
      if(i===fI-1&&inLens(y,az)){const yl=(y*20-lensBot*20)/(D.lensH),zl=(az*20-lz0)/D.lensW,rim=yl<.08||yl>.92||zl<.06||zl>.94,bulb=yl>.38&&yl<.62&&zl>.42&&zl<.58;
        lens.set(i,j,k,rim?0x2a2c30:(bulb?0xfff3cf:0xc9ced4));continue;}
      house.set(i,j,k,0x17181c);}
    out.sides.push({sd,lid,house,lens});}
  // carve the pocket out of the panels, then black every panel cell left touching it (the rim round the lid, the pocket walls)
  const nb=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
  for(const G of [hi.body,hi.hood]){for(const q of out.pocket){const [i,j,k]=q.split(',').map(Number);if(G.get(i,j,k)>=0)G.set(i,j,k,-1);}}
  for(const G of [hi.body,hi.hood]){for(const q of out.pocket){const [i,j,k]=q.split(',').map(Number);for(const [a,b,c] of nb){const v=G.get(i+a,j+b,k+c);if(v>=0&&!out.pocket.has(key(i+a,j+b,k+c)))G.set(i+a,j+b,k+c,0x0d0e10);}}}
  // the pocket's liner: every empty cell touching the pocket that lies inside the car's outer volume gets a black wall cell, so the opening shows a
  // closed black pocket instead of a window into the bay (the bay stage drops the liner cells that the bay's own parts occupy)
  out.liner=[];{const seen=new Set();for(const q of out.pocket){const [i,j,k]=q.split(',').map(Number);for(const [a,b,c] of nb){const I=i+a,J=j+b,K=k+c,kk=key(I,J,K);if(seen.has(kk)||out.pocket.has(kk))continue;seen.add(kk);
    if(J<56||hi.body.get(I,J,K)>=0||hi.hood.get(I,J,K)>=0||Object.values(lamps||{}).some(L=>L.get(I,J,K)>=0))continue;if(!g.solidAt(I/2,J/2,K/2))continue;out.liner.push([I,J,K]);}}}   // not under 560 mm (the hoses run there), not where the lamps are
  g.podPocket=out.pocket;
  return out;
}
/* the same pocket carved out of a 20 mm grid (the bay): a 20 mm cell goes if any of its eight 10 mm cells is in the pocket */
function ae86PopCarve(g,G){if(!g.podPocket)return;for(let i=G.x0;i<=G.x1;i++)for(let j=G.y0;j<=G.y1;j++)for(let k=G.z0;k<=G.z1;k++){if(G.get(i,j,k)<0)continue;let hit=false;
  for(const a of [-1,0,1])for(const b of [-1,0,1])for(const c of [-1,0,1])if(g.podPocket.has((2*i+a)+','+(2*j+b)+','+(2*k+c)))hit=true;if(hit)G.set(i,j,k,-1);}}

/* ---- glyphs: EF_GLYPH has no U or P; AE86 needs SPRINTER (garnish) + TRUENO
   (quarter panels). Same 5-row string form as EF_GLYPH ('1' = filled). ---- */
const AE86_GLYPH_U=['1...1','1...1','1...1','1...1','.111.'],
      AE86_GLYPH_P=['111.','1..1','111.','1...','1...'],
      AE86_GLYPH=Object.assign({},EF_GLYPH,{U:AE86_GLYPH_U,P:AE86_GLYPH_P});
/* Rear-face badge (garnish SPRINTER): EF's efBadge, AE86 glyphs + surfaces. */
function ae86Badge(surfaces,text,cellMM,yMM,zMM){
  const c=cellMM/20,gap=1,glyphs=[...text].map(ch=>AE86_GLYPH[ch]),W=glyphs.reduce((a,g)=>a+g[0].length,0)+gap*(glyphs.length-1);
  const face=(y,z)=>{const j=Math.round(y*2),k=Math.round(z*2);let m=1e9;for(const G of surfaces){if(!G)continue;for(let i=G.x0;i<=G.x1;i++)if(G.get(i,j,k)>=0){m=Math.min(m,i);break;}}return m===1e9?null:(m-.5)/2;};   // rear face of the panel (x of its rearmost cell's outer face)
  const cells=[];let col0=0;
  for(const g of glyphs){for(let r=0;r<5;r++)for(let q=0;q<g[r].length;q++){if(g[r][q]!=='1')continue;
      const y=yMM/20+(2-r)*c,z=zMM/20+(col0+q-(W-1)/2)*c,f=face(y,z);if(f===null)continue;cells.push([Math.round((f-c/2)/c),Math.round(y/c),Math.round(z/c)]);}
    col0+=g[0].length+gap;}
  if(!cells.length)return null;let b=[1e9,-1e9,1e9,-1e9,1e9,-1e9];for(const [i,j,k] of cells)b=[Math.min(b[0],i),Math.max(b[1],i),Math.min(b[2],j),Math.max(b[3],j),Math.min(b[4],k),Math.max(b[5],k)];
  const G=new Grid(b[0],b[1],b[2],b[3],b[4],b[5]);for(const [i,j,k] of cells)G.set(i,j,k,0xc9ced4);return {grid:G,scale:c};
}
/* Side badge (quarter-panel TRUENO): letters in the x-y plane, one fine cell proud
   of the side skin. xW is a WORLD x (pass the body's wx() on the mm station: the old
   xMM/20 mapping put the badge at world +155, outside the car, so it silently built
   nothing). Position PHOTO-DERIVED (crop-cb-rear / side-carsandbids): x centre
   2700 mm, y centre 520 mm — immediately ahead of the rear arch lip, on the side
   stripe. Cells are 5 mm (cellMM) on a fine grid, mesh scale c, like ae86Badge. */
function ae86SideBadge(hi,text,cellMM,xW,yMM,sd){
  const c=cellMM/20,gap=1,glyphs=[...text].map(ch=>AE86_GLYPH[ch]),W=glyphs.reduce((a,g)=>a+g[0].length,0)+gap*(glyphs.length-1);
  const cells=[];let col0=0;for(const g of glyphs){for(let r=0;r<5;r++)for(let q=0;q<g[r].length;q++){if(g[r][q]!=='1')continue;
      const x=xW+(col0+q-(W-1)/2)*c,y=yMM/20+(2-r)*c;
      const i=Math.round(x*HR),j=Math.round(y*HR);let kMax=null;
      for(let k=260;k>=0;k--)if(hi.get(i,j,sd*k)>=0){kMax=k;break;}
      if(kMax===null)continue;cells.push([Math.round(x/c),Math.round(y/c),sd*(2*kMax+2)]);}
    col0+=g[0].length+gap;}
  if(!cells.length)return null;let b=[1e9,-1e9,1e9,-1e9,1e9,-1e9];for(const [i,j,k] of cells)b=[Math.min(b[0],i),Math.max(b[1],i),Math.min(b[2],j),Math.max(b[3],j),Math.min(b[4],k),Math.max(b[5],k)];
  const G=new Grid(b[0],b[1],b[2],b[3],b[4],b[5]);for(const [i,j,k] of cells)G.set(i,j,k,0xc9ced4);
  return {grid:G,scale:c};
}
/* Front badge (grille TRUENO, v20): letters in the y-z plane on the nose's grille band, one fine cell proud of its face, read
   from the front (viewer's left = car's right, +z). Position from front_1.jpg / front34_1.jpg: on the band's lower part, just
   left of the centre line (car's left). Size: ~175 x 25 mm at 5 mm cells (the badge reads ~170 mm wide against the 330 mm plate). */
function ae86FrontBadge(surfaces,text,cellMM,yMM,zMM){
  const c=cellMM/20,gap=1,glyphs=[...text].map(ch=>AE86_GLYPH[ch]),W=glyphs.reduce((a,g)=>a+g[0].length,0)+gap*(glyphs.length-1);
  const face=(y,z)=>{const j=Math.round(y*2),k=Math.round(z*2);let m=-1e9;for(const G of surfaces){if(!G)continue;for(let i=G.x1;i>=G.x0;i--)if(G.get(i,j,k)>=0){m=Math.max(m,i);break;}}return m===-1e9?null:(m+.5)/2;};
  const cells=[];let col0=0;
  for(const g of glyphs){for(let r=0;r<5;r++)for(let q=0;q<g[r].length;q++){if(g[r][q]!=='1')continue;
      const y=yMM/20+(2-r)*c,z=zMM/20-(col0+q-(W-1)/2)*c,f=face(y,z);if(f===null)continue;cells.push([Math.round((f+c/2)/c),Math.round(y/c),Math.round(z/c)]);}
    col0+=g[0].length+gap;}
  if(!cells.length)return null;let b=[1e9,-1e9,1e9,-1e9,1e9,-1e9];for(const [i,j,k] of cells)b=[Math.min(b[0],i),Math.max(b[1],i),Math.min(b[2],j),Math.max(b[3],j),Math.min(b[4],k),Math.max(b[5],k)];
  const G=new Grid(b[0],b[1],b[2],b[3],b[4],b[5]);for(const [i,j,k] of cells)G.set(i,j,k,0xc9ced4);return {grid:G,scale:c};
}
function ae86Badges(hi,lamps,wx){
  const out=[];
  const sp=ae86Badge([hi.trunk,lamps.garnish,lamps.red,lamps.amb,lamps.wht,lamps.frame],'SPRINTER',4,772,540);   // v18: on the right lamp's top edge (rear_1.jpg)
  if(sp){sp.parent='trunk';out.push(sp);}   // M-4: car's RIGHT on the garnish (+z = driver side = right on this RHD car: wheel/eye z +19; vecteezy rear-right photo shows SPRINTER right of the plate)
  const fr=ae86FrontBadge([hi.body],'TRUENO',5,600,-60);if(fr){fr.parent='body';out.push(fr);}   // v20: the grille badge (front_1.jpg, front34_1.jpg)
  for(const sd of [-1,1]){const tr=ae86SideBadge(hi.body,'TRUENO',5,wx(2772),520,sd);   // v19: just behind the door's rear edge, ahead of the arch flare (rear34_1.jpg)
    if(tr){tr.parent='body';out.push(tr);}}   // both quarters, M-5 station
  return out;
}


function ae86Mirror(g,sd){
  const {u,wx}=g,Mi=AE86D.mirror;
  const X0=wx(Mi.x1),X1=wx(Mi.x0),Y0=u(Mi.y0),Y1=u(Mi.y1);
  const zs=g.halfAt(wx((Mi.x0+Mi.x1)/2),u(952))*20;   // outer skin at the mount
  const Z0=u(zs+Mi.out0),Z1=u(zs+Mi.out1);
  const shell=hgrid(X0-1,X1+1,Y0-2,Y1+1,sd<0?-Z1-1:u(zs-30),sd<0?-u(zs-30):Z1+1),glass=hgrid(X0-1,X1+1,Y0-2,Y1+1,sd<0?-Z1-1:Z0,sd<0?-Z0:Z1+1);
  const BLK=0x16171a,GLS=0x9bb4c0,cy=(Y0+Y1)/2,cz=(Z0+Z1)/2,a=(Z1-Z0)/2,b=(Y1-Y0)/2;
  const inside=(y,z,s)=>Math.pow(Math.abs(z-cz)/(a*s),4)+Math.pow(Math.abs(y-cy)/(b*s),4)<=1;
  eachCell(shell,null,(i,j,k,n)=>{const x=i/HR,y=j/HR,z=Math.abs(k/HR);
    // housing: rounded box, tapering toward the front
    if(x>=X0&&x<=X1&&z>=Z0-.5&&z<=Z1+.5){const t=(x-X0)/(X1-X0),s=1-.18*t;if(inside(y,z,s)){if(x<X0+.6&&inside(y,z,.86)){glass.set(i,j,k,GLS);return;}shell.d[n]=BLK;return;}}   // v18: black housing (every photo in ref/ae86 and fan-details #6; it was body colour)
    // arm from the sail to the housing
    if(x>=X0+3.3&&x<=X0+4.1&&y>=u(870)&&y<=cy+.5&&z>=(y<=u(875)?u(zs-30):g.halfAt(x,y)+.6)&&z<Z0+.5)shell.d[n]=BLK;});   // v17: the arm's foot is bolted into the door's top edge (it moves with the door) and rises clear of the body's sail; it used to stand 30 mm inside the sail and the housing hung free of the door
  return {shell,glass,glassCenter:[X0-.05,cy,sd*cz],glassSize:[(Z1-Z0)*.86,(Y1-Y0)*.86]};
}

function ae86Cargo(g,hi,garnish){const B=hi.body,cells=[],put=(i,j,k,c)=>cells.push([i,j,k,c]);const TRIM=0x3a3c41,CARPET=0x2b2c30,BLK=0x161719;
  const I0=-122,I1=-200,J0=52,J1=87;   // v17: x -1220 .. -2000 mm (was -1100 .. -2100: the cover's front ran into the rear seat back, the trims into the closed hatch); y 520 .. 870 mm
  const wall=(i,j)=>{for(let k=20;k<=90;k++)if(B.get(i,j,k)>=0||B.get(i,j,-k)>=0)return k;return null;};
  for(let i=I1;i<=I0;i++){
    for(let j=J0+1;j<=J1;j++){const kw=wall(i,j);if(kw===null)continue;for(const s of [-1,1])if(B.get(i,j,s*(kw-1))<0)put(i,j,s*(kw-1),TRIM);}   // side trims, one cell inside the body's inner skin
    const kf=wall(i,J0+1);if(kf!==null)for(let k=-(kf-1);k<=kf-1;k++)if(B.get(i,J0,k)<0)put(i,J0,k,CARPET);}   // load floor
  // trim caps on the tops of the damper towers and wheel tubs inside the bay
  for(let i=I1;i<=I0;i++)for(let k=20;k<=78;k++)for(const s of [-1,1])for(let j=J0+1;j<J1;j++)if(B.get(i,j,s*k)>=0&&B.get(i,j+1,s*k)<0){const kw=wall(i,j+1);if(kw!==null&&k<kw-1)put(i,j+1,s*k,TRIM);}
  // lock panel trim across the bottom of the opening, with the striker
  const hatchAt=(i,j,k)=>hi.trunk.get(i,j,k)>=0||(garnish&&garnish.get(i,j,k)>=0);
  for(let k=-30;k<=30;k++)for(let i=-219;i<=I1+1;i++){let jt=null;for(let j=64;j>=40;j--)if(B.get(i,j,k)>=0){jt=j;break;}if(jt!==null&&B.get(i,jt+1,k)<0&&!hatchAt(i,jt+1,k)&&!hatchAt(i,jt+2,k))put(i,jt+1,k,BLK);}   // in front of the closed hatch's lower edge
  {const SI=-207;let jt=null;for(let j=64;j>=40;j--)if(B.get(SI,j,0)>=0){jt=j;break;}if(jt!==null)for(const [di,dj,dk] of [[0,2,-1],[0,2,1],[0,3,-1],[0,3,1],[0,4,-1],[0,4,0],[0,4,1]])put(SI+di,jt+1+dj,dk,0xb7bcc3);}   // v18: striker 70 mm further in, at the garnish's inner face (the garnish now reaches down to the lock panel)
  // cargo cover (DESIGN adaptation of the EF cover (AE86 part number not sourced)): one fabric-covered board, 20 mm (j J1+1..J1+2), filling the opening
  // from wall to wall (a 10 mm gap to each side) and from the seat back to 50 mm ahead of the closed hatch's lower panel (its inner face is at x -2000 mm at
  // this height); its rear edge straight across with a pull lip at the middle and rounded corners, a moulded recess in its front half. It rests on the
  // ledges and hangs on two black brackets at its front corners; it lifts out ('Cover').
  const FAB=0x4a4b50,FABE=0x2c2d31,FABR=0x404146,shelf=[],RE=-195,TAB=12;
  const hw=i=>{let m=null;for(let j=J1;j<=J1+2;j++){const kw=wall(i,j);if(kw!==null)m=m===null?kw:Math.min(m,kw);}return m===null?null:m-3;};
  const hR=hw(RE),corner=(i,k)=>{const r=5,ci=RE+r,ck=hR-r,a=Math.abs(k);return !(i<ci&&a>ck&&Math.hypot(i-ci,a-ck)>r);};
  const recess=(i,k)=>{const i0=I0-5,i1=I0-25,h=hw(i),r=4;if(i>i0||i<i1||h===null)return false;const kk=hw(i0)-7,a=Math.abs(k);if(a>kk)return false;   // rounded rectangle
    const ci=Math.min(i0-r,Math.max(i1+r,i)),ck=Math.min(a,kk-r);return Math.hypot(i-ci,a-ck)<=r;};
  for(let i=RE;i<=I0-1;i++){const h=hw(i);if(h===null)continue;
    for(let k=-h;k<=h;k++){if(!corner(i,k))continue;if(i>=I0-5&&i<=I0-2&&Math.abs(k)>=hw(I0-3)-5)continue;const rc=recess(i,k);shelf.push([i,J1+1,k,rc?FABR:FABE]);if(!rc)shelf.push([i,J1+2,k,FAB]);}}
  for(let i=RE;i<=RE+1;i++)for(let k=-TAB;k<=TAB;k++)shelf.push([i,J1,k,FABE]);   // the pull lip under the rear edge
  {const h=hw(I0-3);for(const sd of [-1,1])for(let i=I0-5;i<=I0-2;i++)for(let j=J1+1;j<=J1+6;j++)for(let k=h-5;k<=(j<=J1+2?h:h-4);k++)put(i,j,sd*k,BLK);}   // the brackets: a foot under the cover's corner and a post 40 mm proud of it, clear of the quarter glass's lean
  for(let i=I1;i<=I0;i++){const kw=wall(i,J1);if(kw===null)continue;for(const sd of [-1,1])for(let k=Math.min(kw-1,40);k<kw;k++)if(B.get(i,J1,sd*k)<0)put(i,J1,sd*k,TRIM);}   // ledges under the cover's sides

  const mkG=L=>{if(!L.length)return new Grid(0,0,0,0,0,0);let b=[1e9,-1e9,1e9,-1e9,1e9,-1e9];for(const [i,j,k] of L)b=[Math.min(b[0],i),Math.max(b[1],i),Math.min(b[2],j),Math.max(b[3],j),Math.min(b[4],k),Math.max(b[5],k)];
    const G=new Grid(b[0],b[1],b[2],b[3],b[4],b[5]);for(const [i,j,k,c] of L)G.set(i,j,k,c);return G;};
  return {fixed:mkG(cells),shelf:mkG(shelf),pivot:[(I0-1+.5)/2,(J1+1.5)/2]};}   // the cover's hinge: its front edge on the brackets

function ae86DPillarTrim(g,hi){const B=hi.body,H=hi.trunk,TRIMG=0x7a7d82,SEAL=0x141517,cells=[],box=new Set(),key=(i,j,k)=>i+','+j+','+k;
  for(const sd of [-1,1]){const Q=sd<0?hi.glass.qgL:hi.glass.qgR;
    for(let j=90;j<=126;j++){let gi=null;for(let i=Q.x0;i<=Q.x1&&gi===null;i++)for(let k=Q.z0;k<=Q.z1;k++)if(Q.get(i,j,k)>=0){gi=i;break;}   // the quarter glass's rear edge in this row
      if(gi===null)gi=-200;let rear=null;const kin=new Map();
      for(let i=-219;i<gi;i++){let a=null;for(let k=40;k<=84;k++)if(B.get(i,j,sd*k)>=0){a=k;break;}if(a===null)continue;if(rear===null)rear=i;kin.set(i,a);}
      if(rear===null)continue;
      const cnt=new Map();for(const [i,a] of kin)if(i<=rear+6)cnt.set(a,(cnt.get(a)||0)+1);let ks=null,best=0;for(const [a,n] of cnt)if(n>best||(n===best&&a>ks)){best=n;ks=a;}   // the skin's inner face along the pillar by the shut line
      if(ks===null||ks<50)continue;
      const T=Math.round(j<=100?8:j>=120?6:8-2*(j-100)/20);   // the pillar's depth inboard of its skin: 80 mm low down, 60 mm at the roof
      for(const [i,a] of kin){if(a<ks-T)continue;for(let k=ks-T;k<=a-1;k++){if(B.get(i,j,sd*k)>=0)continue;let nearH=false;   // never within 10 mm of the closed hatch
          for(let di=-2;di<=1&&!nearH;di++)for(let dj=-1;dj<=1&&!nearH;dj++)for(let dk=-1;dk<=1&&!nearH;dk++)if(H.get(i+di,j+dj,sd*k+dk)>=0)nearH=true;
          if(!nearH){cells.push([i,j,sd*k,ks-k<=1?2:1]);box.add(key(i,j,sd*k));}}}}}
  // colour: grey trim; the face toward the opening carries the black rubber seal along its outer 20 mm (by the skin)
  for(const c of cells){const [i,j,k,o]=c;c[3]=(!box.has(key(i-1,j,k))&&o===2)?SEAL:TRIMG;}
  if(!cells.length)return new Grid(0,0,0,0,0,0);let b=[1e9,-1e9,1e9,-1e9,1e9,-1e9];for(const [i,j,k] of cells)b=[Math.min(b[0],i),Math.max(b[1],i),Math.min(b[2],j),Math.max(b[3],j),Math.min(b[4],k),Math.max(b[5],k)];
  const G=new Grid(b[0],b[1],b[2],b[3],b[4],b[5]);for(const [i,j,k,c] of cells)G.set(i,j,k,c);return G;}
/* ---- hatch gas strut: a 22 mm body from the ball stud on the body and an 8 mm rod to the stud on the hatch (10 mm cells along z, drawn with segTo) ---- */

function ae86AeroFront(g,bumper,kind){const cells=[],put=(i,j,k,c)=>cells.push([i,j,k,c]);const mmx=x=>g.mm(x);
  const bot=new Map(),B=(i,k)=>bot.get(i+','+k);for(const [i,j,k] of bumper.list()){if(mmx(i/2)>500)continue;const key=i+','+k;if(!bot.has(key)||j<bot.get(key))bot.set(key,j);}
  const ks=new Map();for(const key of bot.keys()){const [i,k]=key.split(',').map(Number);if(!ks.has(k))ks.set(k,[]);ks.get(k).push(i);}
  const edge=new Map();for(const [k,is] of ks){let jm=1e9;for(const i of is)jm=Math.min(jm,B(i,k));let ie=-1e9;for(const i of is)if(B(i,k)<=jm+1)ie=Math.max(ie,i);edge.set(k,ie);}   // leading edge of the bumper's underside
  const archFront=g.wx(AE86_M.arch.f.x-AE86_M.arch.f.r)-1,kMax=Math.max(...ks.keys());
  if(kind==='lip'){for(const [k,ie] of edge){for(let i=ie-2;i<=ie;i++){const jb=B(i,k);if(jb===undefined||i/2<archFront+1)continue;for(let d=1;d<=2;d++)put(i,jb-d,k,d===1?0x16171a:0x0e0f11);}
      const jb=B(ie,k);if(jb!==undefined){for(let d=0;d<=2;d++)put(ie+1,jb-d,k,0x0e0f11);let jt=null;for(let j=jb+1;j<=jb+4;j++)if(bumper.get(ie+1,j,k)>=0){jt=j;break;}if(jt!==null)for(let j=jb+1;j<jt;j++)put(ie+1,j,k,0x0e0f11);}}}   // under the leading edge and one cell proud of it, up to the bumper's face where it bulges over the lip (no slot between them)
  else{const foot=[];for(const [k,ie] of edge){if(Math.abs(k)>kMax-6)continue;for(let i=ie-14;i<=ie+7;i++)if(i/2>=archFront)foot.push([i,k]);}
    let jp=1e9;for(const [i,k] of foot){const jb=B(i,k);if(jb!==undefined)jp=Math.min(jp,jb-3);}
    for(const [i,k] of foot)put(i,jp,k,0x111214);
    for(const zc of [0,-25,25,-50,50])for(let dk=-1;dk<=1;dk++){const k=zc*2+dk,ie=edge.get(k);if(ie===undefined)continue;for(let i=ie-4;i<=ie-2;i++){const jb=B(i,k);if(jb===undefined)continue;for(let j=jp+1;j<jb;j++)put(i,j,k,0x2a2c30);}}   // spacer blocks up to the bumper's underside
    for(const s of [-1,1]){const k=s*(kMax-6),ie=edge.get(k);if(ie===undefined)continue;for(let i=ie-4;i<=ie+7;i++)for(let j=jp+1;j<=jp+4;j++){const jb=B(i,k);if(jb!==undefined&&j>=jb)continue;put(i,j,k,0x0e0f11);}}}   // end fences
  if(!cells.length)return new Grid(0,0,0,0,0,0);
  let b=[1e9,-1e9,1e9,-1e9,1e9,-1e9];for(const [i,j,k] of cells)b=[Math.min(b[0],i),Math.max(b[1],i),Math.min(b[2],j),Math.max(b[3],j),Math.min(b[4],k),Math.max(b[5],k)];
  const G=new Grid(b[0],b[1],b[2],b[3],b[4],b[5]);for(const [i,j,k,c] of cells)G.set(i,j,k,c);return G;}

function ae86AeroHatch(g,hatch,kind,glass){const cells=[],put=(i,j,k,c)=>cells.push([i,j,k,c]);
  const top=new Map();for(const [i,j,k] of hatch.list()){const key=i+','+k;if(!top.has(key)||j>top.get(key))top.set(key,j);}
  const gtop=new Map();if(glass)for(const [i,j,k] of glass.list()){const key=i+','+k;if(!gtop.has(key)||j>gtop.get(key))gtop.set(key,j);}
  const T=(i,k)=>top.get(i+','+k);
  if(kind==='spoiler'){   // roof-edge visor spoiler: glued to the hatch's top frame from 3180 to 3480 mm, the blade carried 140 mm further back over the glass. Every column of
    // its underside follows the surface under it (the frame, then the glass, 10 mm off it), so it follows the hatch's crown out to its ends; 20 mm thick, 35 mm at the tail
    const i0=Math.round(g.wx(3180)*2),i2=Math.round(g.wx(3480)*2),half=Math.round(g.u(520)*2);
    for(let k=-half;k<=half;k++)for(let i=i2;i<=i0;i++){const t=T(i,k),gt=gtop.get(i+','+k),onFrame=t!==undefined&&(gt===undefined||t>=gt),sf=onFrame?t:gt;if(sf===undefined)continue;
      const L=(i0-i)/(i0-i2),y0=sf+1+(onFrame?0:1),y1=y0+1+Math.round(L*1.5);for(let j=y0;j<=y1;j++)put(i,j,k,j===y1?0x1a1b1e:0x141517);}
  }else{   // GT wing: stands at 3250 mm, 400 mm either side of the centre; blade 150 mm over the frame, 220 mm chord, rear edge 20 mm up; 1240 mm span with end plates
    const iS=Math.round(g.wx(3250)*2),iL=Math.round(g.wx(3200)*2),iT=Math.round(g.wx(3450)*2),half=Math.round(g.u(620)*2);
    let yb=-1e9;for(const zz of [-40,40])for(let i=iS-2;i<=iS+2;i++)for(let dk=-1;dk<=1;dk++){const t=T(i,zz+dk);if(t!==undefined)yb=Math.max(yb,t);}
    const yw=yb+15;
    for(let k=-half;k<=half;k++)for(let i=iT;i<=iL;i++){const L=(iL-i)/(iL-iT),yc=yw+Math.round(L*2);put(i,yc,k,0x15161a);put(i,yc+1,k,L<.15?0x15161a:-1);}   // blade
    for(const s of [-1,1])for(let i=iT-2;i<=iL+1;i++)for(let j=yw-4;j<=yw+7;j++)put(i,j,s*(half+1),0x0e0f11);   // end plates
    for(const s of [-1,1])for(let i=iS-2;i<=iS+1;i++)for(let dk=-1;dk<=0;dk++){const k=s*40+dk,t=T(i,k);if(t===undefined)continue;for(let j=t+1;j<yw;j++)put(i,j,k,0x2a2c30);}}   // stands on the hatch frame
  const L=cells.filter(c=>c[3]>=0);if(!L.length)return new Grid(0,0,0,0,0,0);
  let b=[1e9,-1e9,1e9,-1e9,1e9,-1e9];for(const [i,j,k] of L)b=[Math.min(b[0],i),Math.max(b[1],i),Math.min(b[2],j),Math.max(b[3],j),Math.min(b[4],k),Math.max(b[5],k)];
  const G=new Grid(b[0],b[1],b[2],b[3],b[4],b[5]);for(const [i,j,k,c] of L)G.set(i,j,k,c);return G;}

/* ---- the cargo bay behind the rear seat (DESIGN from photos of EF hatches: carpeted load floor, grey side trims moulded round the damper towers and wheel tubs,
   black trim over the lock panel with the striker, the cargo cover, two gas struts).
   The cargo cover is described where it is built below. 10 mm cells, absolute. Heights: load floor 520 mm (ef_body cargoFloor), cover 880-900 mm. ---- */
function efCargo(g,hi,garnish){const B=hi.body,cells=[],put=(i,j,k,c)=>cells.push([i,j,k,c]);const TRIM=0x3a3c41,CARPET=0x2b2c30,BLK=0x161719;
  const I0=-116,I1=-175,J0=52,J1=87;   // x -58 .. -87.5, y 520 .. 870 mm
  const wall=(i,j)=>{for(let k=20;k<=90;k++)if(B.get(i,j,k)>=0||B.get(i,j,-k)>=0)return k;return null;};
  for(let i=I1;i<=I0;i++){
    for(let j=J0+1;j<=J1;j++){const kw=wall(i,j);if(kw===null)continue;for(const s of [-1,1])if(B.get(i,j,s*(kw-1))<0)put(i,j,s*(kw-1),TRIM);}   // side trims, one cell inside the body's inner skin
    const kf=wall(i,J0+1);if(kf!==null)for(let k=-(kf-1);k<=kf-1;k++)if(B.get(i,J0,k)<0)put(i,J0,k,CARPET);}   // load floor
  // trim caps on the tops of the damper towers and wheel tubs inside the bay
  for(let i=I1;i<=I0;i++)for(let k=20;k<=78;k++)for(const s of [-1,1])for(let j=J0+1;j<J1;j++)if(B.get(i,j,s*k)>=0&&B.get(i,j+1,s*k)<0){const kw=wall(i,j+1);if(kw!==null&&k<kw-1)put(i,j+1,s*k,TRIM);}
  // lock panel trim across the bottom of the opening, with the striker
  const hatchAt=(i,j,k)=>hi.trunk.get(i,j,k)>=0||(garnish&&garnish.get(i,j,k)>=0);
  for(let k=-30;k<=30;k++)for(let i=-185;i<=I1+1;i++){let jt=null;for(let j=64;j>=40;j--)if(B.get(i,j,k)>=0){jt=j;break;}if(jt!==null&&B.get(i,jt+1,k)<0&&!hatchAt(i,jt+1,k)&&!hatchAt(i,jt+2,k))put(i,jt+1,k,BLK);}   // in front of the closed hatch's lower edge
  {let jt=null;for(let j=64;j>=40;j--)if(B.get(-180,j,0)>=0){jt=j;break;}if(jt!==null)for(const [di,dj,dk] of [[0,2,-1],[0,2,1],[0,3,-1],[0,3,1],[0,4,-1],[0,4,0],[0,4,1]])put(-180+di,jt+1+dj,dk,0xb7bcc3);}
  // cargo cover (part 84400-SR3 'shelf, rear'; owner's photos ref/ef/cargo_cover*.png): one fabric-covered board, 20 mm (j J1+1..J1+2), filling the opening
  // from wall to wall (a 10 mm gap to each side) and from the seat back to 50 mm ahead of the closed hatch's lower panel (its inner face is at x -1740 mm at
  // this height); its rear edge straight across with a pull lip at the middle and rounded corners, a moulded recess in its front half. It rests on the
  // ledges and hangs on two black brackets at its front corners; it lifts out ('Cover').
  const FAB=0x4a4b50,FABE=0x2c2d31,FABR=0x404146,shelf=[],RE=-169,TAB=12;
  const hw=i=>{let m=null;for(let j=J1;j<=J1+2;j++){const kw=wall(i,j);if(kw!==null)m=m===null?kw:Math.min(m,kw);}return m===null?null:m-3;};
  const hR=hw(RE),corner=(i,k)=>{const r=5,ci=RE+r,ck=hR-r,a=Math.abs(k);return !(i<ci&&a>ck&&Math.hypot(i-ci,a-ck)>r);};
  const recess=(i,k)=>{const i0=-121,i1=-141,h=hw(i),r=4;if(i>i0||i<i1||h===null)return false;const kk=hw(i0)-7,a=Math.abs(k);if(a>kk)return false;   // rounded rectangle
    const ci=Math.min(i0-r,Math.max(i1+r,i)),ck=Math.min(a,kk-r);return Math.hypot(i-ci,a-ck)<=r;};
  for(let i=RE;i<=I0-1;i++){const h=hw(i);if(h===null)continue;
    for(let k=-h;k<=h;k++){if(!corner(i,k))continue;if(i>=-121&&i<=-118&&Math.abs(k)>=hw(-119)-5)continue;const rc=recess(i,k);shelf.push([i,J1+1,k,rc?FABR:FABE]);if(!rc)shelf.push([i,J1+2,k,FAB]);}}
  for(let i=RE;i<=RE+1;i++)for(let k=-TAB;k<=TAB;k++)shelf.push([i,J1,k,FABE]);   // the pull lip under the rear edge
  {const h=hw(-119);for(const sd of [-1,1])for(let i=-121;i<=-118;i++)for(let j=J1+1;j<=J1+6;j++)for(let k=h-5;k<=(j<=J1+2?h:h-4);k++)put(i,j,sd*k,BLK);}   // the brackets: a foot under the cover's corner and a post 40 mm proud of it, clear of the quarter glass's lean
  for(let i=I1;i<=I0;i++){const kw=wall(i,J1);if(kw===null)continue;for(const sd of [-1,1])for(let k=Math.min(kw-1,40);k<kw;k++)if(B.get(i,J1,sd*k)<0)put(i,J1,sd*k,TRIM);}   // ledges under the cover's sides

  const mkG=L=>{if(!L.length)return new Grid(0,0,0,0,0,0);let b=[1e9,-1e9,1e9,-1e9,1e9,-1e9];for(const [i,j,k] of L)b=[Math.min(b[0],i),Math.max(b[1],i),Math.min(b[2],j),Math.max(b[3],j),Math.min(b[4],k),Math.max(b[5],k)];
    const G=new Grid(b[0],b[1],b[2],b[3],b[4],b[5]);for(const [i,j,k,c] of L)G.set(i,j,k,c);return G;};
  return {fixed:mkG(cells),shelf:mkG(shelf),pivot:[(I0-1+.5)/2,(J1+1.5)/2]};}   // the cover's hinge: its front edge on the brackets
/* ---- D-pillar trims (owner's photo of an EF with the hatch open, ref/ef/cargo_cover2.png): inside the hatch opening each D-pillar, between the quarter glass's
   rear edge and the hatch's shut line, is lined with a smooth grey plastic trim from the cargo cover up to the roof; a black rubber seal runs along the opening's
   edge and the gas strut's lower ball stud stands on the trim. Built from the body's own skin row by row: the pillar is closed 80 mm inboard of its skin (60 mm
   at the roof), from the shut-line lip forward to the glass; its face toward the opening carries the seal by the skin. 10 mm cells, absolute (mesh scale .5). ---- */
function efDPillarTrim(g,hi){const B=hi.body,H=hi.trunk,TRIMG=0x7a7d82,SEAL=0x141517,cells=[],box=new Set(),key=(i,j,k)=>i+','+j+','+k;
  for(const sd of [-1,1]){const Q=sd<0?hi.glass.qgL:hi.glass.qgR;
    for(let j=90;j<=124;j++){let gi=null;for(let i=Q.x0;i<=Q.x1&&gi===null;i++)for(let k=Q.z0;k<=Q.z1;k++)if(Q.get(i,j,k)>=0){gi=i;break;}   // the quarter glass's rear edge in this row
      if(gi===null)gi=-150;let rear=null;const kin=new Map();
      for(let i=-192;i<gi;i++){let a=null;for(let k=40;k<=88;k++)if(B.get(i,j,sd*k)>=0){a=k;break;}if(a===null)continue;if(rear===null)rear=i;kin.set(i,a);}
      if(rear===null)continue;
      const cnt=new Map();for(const [i,a] of kin)if(i<=rear+6)cnt.set(a,(cnt.get(a)||0)+1);let ks=null,best=0;for(const [a,n] of cnt)if(n>best||(n===best&&a>ks)){best=n;ks=a;}   // the skin's inner face along the pillar by the shut line
      if(ks===null||ks<50)continue;
      const T=Math.round(j<=100?8:j>=120?6:8-2*(j-100)/20);   // the pillar's depth inboard of its skin: 80 mm low down, 60 mm at the roof
      for(const [i,a] of kin){if(a<ks-T)continue;for(let k=ks-T;k<=a-1;k++){if(B.get(i,j,sd*k)>=0)continue;let nearH=false;   // never within 10 mm of the closed hatch
          for(let di=-2;di<=1&&!nearH;di++)for(let dj=-1;dj<=1&&!nearH;dj++)for(let dk=-1;dk<=1&&!nearH;dk++)if(H.get(i+di,j+dj,sd*k+dk)>=0)nearH=true;
          if(!nearH){cells.push([i,j,sd*k,ks-k<=1?2:1]);box.add(key(i,j,sd*k));}}}}}
  // colour: grey trim; the face toward the opening carries the black rubber seal along its outer 20 mm (by the skin)
  for(const c of cells){const [i,j,k,o]=c;c[3]=(!box.has(key(i-1,j,k))&&o===2)?SEAL:TRIMG;}
  if(!cells.length)return new Grid(0,0,0,0,0,0);let b=[1e9,-1e9,1e9,-1e9,1e9,-1e9];for(const [i,j,k] of cells)b=[Math.min(b[0],i),Math.max(b[1],i),Math.min(b[2],j),Math.max(b[3],j),Math.min(b[4],k),Math.max(b[5],k)];
  const G=new Grid(b[0],b[1],b[2],b[3],b[4],b[5]);for(const [i,j,k,c] of cells)G.set(i,j,k,c);return G;}
/* ---- hatch gas strut: a 22 mm body from the ball stud on the body and an 8 mm rod to the stud on the hatch (10 mm cells along z, drawn with segTo) ---- */
/* ---- roof spoiler on the hatch top (paint), from the side profile; ends rounded down ---- */
function efSpoiler(g,hatch,glass){
  const {u,wx}=g,S=EFD.spoiler,mmx=x=>g.mm(x),hw=u(S.half);
  // over the glass the lip's underside keeps its measured gap at every point across the car: where the glass falls away with its crown the lip comes down with it
  const gtop=new Map();if(glass)for(const [i,j,k] of glass.list()){const key=i+','+k;if(!gtop.has(key)||j>gtop.get(key))gtop.set(key,j);}
  const crownDrop=(i,k)=>{const c=gtop.get(i+',0'),e=gtop.get(i+','+k);return (c!==undefined&&e!==undefined)?(c-e)*10:0;};
  const G=hgrid(wx(3610),wx(3290),u(1240),u(1330),-hw-1,hw+1);
  // top of the hatch skin in each column: the spoiler sits on it and never wider than the hatch under it
  const topJ=new Map();if(hatch)for(const [i,j,k] of hatch.list()){const key=i+','+k;if(!topJ.has(key)||topJ.get(key)<j)topJ.set(key,j);}
  eachCell(G,null,(i,j,k,n)=>{const x=i/HR,y=j/HR,z=k/HR,m=mmx(x),ym=y*20,az=Math.abs(z)*20;
    if(m<S.top[0][0]||m>S.top[S.top.length-1][0])return;
    const endDrop=az>S.half-60?(az-(S.half-60))*.6:0;
    const tj=topJ.get(i+','+k);if(hatch&&tj===undefined&&m<3540)return;   // over the glass the lip overhangs freely; elsewhere it needs hatch under it
    const cd=tj===undefined?crownDrop(i,k):0,tp=efTab(S.top,m)-endDrop-cd,un=efTab(S.under.slice().reverse().map(([a,b])=>[a,b]),m)-cd;
    if(ym>tp||az>S.half)return;if(tj!==undefined){if(j<=tj)return;}else if(ym<un)return;
    G.d[n]=1;});
  shellHi(G,(x,y,z,inner)=>inner?0x1a1b1d:PAINT,2);
  return G;
}

function buildAE86Body(g){
  const M=AE86_M,{NOSE_X,REAR_X,AX_F,AX_R,WR,BELT,ROOF,u,wx,halfAt,top,topC,belt}=g;
  const INT=0x2a2b2e,UNDER=0x15171a,SASH=0x141517,GASK=0x131416,SEAM=0x1d1112,MOLD=0x18191b;
  const hw=g.halfW,ext=Math.ceil(hw+1.5);
  const S0=hgrid(Math.floor(REAR_X-2),Math.ceil(NOSE_X+1),0,ROOF+2,-ext,ext);
  const solidAt=(x,y,z)=>{if(g.podPocket&&g.podPocket.has(Math.round(x*2)+','+Math.round(y*2)+','+Math.round(z*2)))return false;   // v20: the pop-up pockets are open
    if(x>g.frontLimit(y)||x<g.rearLimit(y))return false;if(y<g.bottomZ(x,z))return false;if(typeof ae86BumperRelief==='function'&&ae86BumperRelief(g,x,y,z))return false;
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
  carveW(S0,null,(x,y,z)=>x<=wx(B.x0)&&x>=wx(B.x1)&&Math.abs(z)<=(y>u(B.upY)?u(B.upHalf):(nearW(x)&&y>u(420)?u(M.wheelF.bayHalf):u(B.half)))&&y>=0&&y<top(x,z)-1.6);   // above the wheelhouses the bay opens out to the fender flanges under the hood edges   // below 420 mm the wheelhouse is open to the bay (arms, tie rods pass; at full lock the tyre reaches |z| 440 up to 419 mm)
  const T=M.tunnel;carveW(S0,null,(x,y,z)=>x<=wx(T.x0)&&x>=wx(T.x1)&&Math.abs(z)<=u(T.half)&&y<=u(T.top));
  const K=M.kick;carveW(S0,null,(x,y,z)=>x<=wx(K.x0)&&x>=wx(K.x1)&&Math.abs(z)<=u(K.half)&&y<=u(K.top));   // v17: rear kick-up over the axle
  const TP=M.tankP;carveW(S0,null,(x,y,z)=>x<=wx(TP.x0)&&x>=wx(TP.x1)&&Math.abs(z-u(TP.zc))<=u(TP.half)&&y<=u(TP.top));   // v17: fuel-tank pocket
  const XC=M.exhCh;carveW(S0,null,(x,y,z)=>x<=wx(XC.x0)&&x>=wx(XC.x1)&&z>=u(XC.z0)&&z<=u(XC.z1)&&y<=u(XC.top));   // exhaust channel under the rear seat and cargo floor (silencer on the right)
  // 4. moving panels out of the solid (before the skin, so each gets its own two-layer shell)
  const hood=hgrid(g.HOOD_X0-.5,NOSE_X+.5,u(400),ROOF,-g.HOOD_HALF-.5,g.HOOD_HALF+.5);
  const HT=2.4;
  const take=(dst,pred)=>eachCell(dst,null,(i,j,k)=>{const x=i/HR,y=j/HR,z=k/HR;if(!S0.inb(i,j,k))return;const n=S0.ix(i,j,k);if(S0.d[n]<0)return;if(pred(x,y,z)){dst.d[dst.ix(i,j,k)]=1;S0.d[n]=-1;}});
  take(hood,(x,y,z)=>x>=g.HOOD_X0&&x<=g.HOOD_X1+.6&&Math.abs(z)<=g.HOOD_HALF&&top(x,z)-y<HT);
  // hatch: glass part + panel above the lamps (full width between the quarter panels) + the centre garnish between the tail lamps
  const H=M.hatch,hx=g.HATCH_X;
  const hatchHalf=y=>{const m=y*20;if(m>=H.glassBot)return Math.min(g.cEnv(g.xC(y),y)+.6,u(H.sideHalf));if(m>=H.lampTop)return u(H.sideHalf);return u(H.garnishHalf);};
  const hatch=hgrid(REAR_X-.5,hx+.5,u(H.bottom)-1,ROOF+1,-u(H.sideHalf)-1,u(H.sideHalf)+1);
  const depthAt=(x,y,z)=>{const i=Math.round(x*HR),j=Math.round(y*HR),k=Math.round(z*HR);if(!S0.inb(i,j,k))return 99;const v=DEP[S0.ix(i,j,k)];return v||99;};
  // the outer 50 mm of the tail inside the hatch outline: behind the C-pillar line the whole width is hatch; ahead of it only cells well inboard of the side (the top skin, not the quarter panel)
  const inHatch=(x,y,z,inset,dmax)=>{if(x>hx||y<u(H.bottom)||Math.abs(z)>hatchHalf(y)-inset||depthAt(x,y,z)>dmax)return false;const m=g.mm(x);
    if(y*20<H.glassBot)return (y*20>=930&&m>=3940+inset*20)||m>=4150+inset*20;return m>=g.mm(g.xC(y))-20+inset*20||Math.abs(z)<=u(H.roofHalf)-inset;};   // below the glass: the deck behind it and the rear face (v18: the quarter panels' sides stay body); ahead of the C-pillar line the hatch is the roof panel inside the drip rails
  take(hatch,(x,y,z)=>inHatch(x,y,z,0,5));

  // doors: outer 84 mm of the side between the shut lines, plus the window frame above the belt
  const D=M.door,dz0=ext;
  const doorL=hgrid(g.DOOR_R-.5,g.DOOR_F+.5,u(D.bottom)-1,ROOF,-dz0,0),doorR=hgrid(g.DOOR_R-.5,g.DOOR_F+.5,u(D.bottom)-1,ROOF,0,dz0);
  const inDoor=(x,y,z)=>{if(y<u(D.bottom)||x>g.DOOR_F||x<g.doorRear(y))return false;if(y<=belt(x))return Math.abs(z)>=halfAt(x,y)-4.2;return false;};
  take(doorL,(x,y,z)=>z<0&&inDoor(x,y,z));take(doorR,(x,y,z)=>z>0&&inDoor(x,y,z));
  // 5. skin
  const PFRONT=wx(150),PREAR=wx(4100);
  const inArch=(x,y,z)=>{for(const a of [AF,AR]){if(Math.hypot(x-a.x,y-a.y)<a.r+.6&&Math.abs(z)<halfAt(x,y)-1.2)return true;}
    return (Math.abs(x-wx(TF.x))<=u(TF.dx)+.6&&Math.abs(z)>u(TF.zIn)-.6&&y<u(TF.top)&&y>AF.y&&Math.abs(z)<halfAt(x,y)-1.2)||(Math.abs(x-wx(TR.x))<=u(TR.dx)+.6&&Math.abs(z)>u(TR.zIn)-.6&&y<u(TR.top)&&y>u(170)&&Math.abs(z)<halfAt(x,y)-1.2);};
  shellHi(S0,(x,y,z,inner)=>{
    if(inArch(x,y,z)&&depthAt(x,y,z)>1)return UNDER;      // wheelhouses and damper towers in underbody black (never the car's outside skin, e.g. the fender tops over the towers)
    if(inner)return INT;
    if(y<u(205))return UNDER;
    if(x>PFRONT-.6&&y<u(550))return UNDER;                 // panel behind the front bumper
    if(x<PREAR+.6&&y<u(600))return UNDER;                  // panel behind the rear bumper
    if(typeof ae86BumperRelief==='function'&&ae86BumperRelief(g,x,y,z,40))return UNDER;   // the cut-back skin behind the bumpers' side wings: dark, as it reads in the gaps on the real car
    {const m=g.mm(x);if((m<450&&y<u(AE86D.bumperF.bot))||(m>3850&&y<u(AE86D.bumperR.bot)))return UNDER;}   // the body below the bumpers' bottom edges
    for(const a of [AF,AR]){const d=Math.hypot(x-a.x,y-a.y);if(d>=a.r-.3&&d<a.r+u(M.arch.lip+25)&&Math.abs(z)>=halfAt(x,y)-1.6)return 0x15171c;}   // v18: GT-APEX black arch flares, ~55 mm wide round each arch (fan-details #4; side_2, front34_2, rear34_1)
    return y<u(520)?0x15171c:PAINT;},2);
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
  const doorSkin=(x,y,z,inner)=>depthAt(x,y,z)<=1?(y<u(520)?0x15171c:PAINT):0x3a3b3f;
  shellHi(doorL,doorSkin,2);shellHi(doorR,doorSkin,2);
  // the hood keeps a frame of inner panel (x-brace) like a real hood; the hatch keeps its outer skin and a frame round the glass
  eachCell(hood,null,(i,j,k,n)=>{if(hood.d[n]!==INT)return;const x=i/HR,z=k/HR,x0=g.HOOD_X0,x1=g.HOOD_X1;
    const keep=x<=x0+1.5||x>=x1-1.5||Math.abs(z)>=g.HOOD_HALF-1.2||Math.abs(Math.abs(z)-(x-x0)*.75)<1.1||Math.abs(x-(x0+x1)/2)<1.1;if(!keep)hood.d[n]=-1;});
  // front damper towers: the pocket gets its cap, 20 mm thick, which the damper's top mount bolts under, and the inner apron toward the bay, which the upper
  // strut mount bolts to (DESIGN: the pocket is the measured wheelhouse top; cap at 780-800 mm, apron 420 mm from the centreline above the half-shaft).
  // Both stay one cell under the hood wherever the hood is above them; painted like the rest of the bay.
  {const x0=wx(TF.x)-u(TF.dx),x1=wx(TF.x)+u(TF.dx),zi=u(TF.zIn),capY=u(TF.top-20),clear=(i,j,k)=>hood.get(i,j,k)<0&&hood.get(i,j+1,k)<0&&hood.get(i,j+2,k)<0;
   eachCell(bodyG,[x0,x1,u(340),u(TF.top)+1,-ext,ext],(i,j,k,n)=>{if(bodyG.d[n]>=0)return;const x=i/HR,y=j/HR,z=k/HR,az=Math.abs(z);if(x<x0||x>x1)return;
     const cap=y>=capY-.25&&y<=capY+.75&&az>=zi-1.25&&az<=halfAt(x,y)-1&&clear(i,j,k),wall=az>=zi-1.25&&az<=zi-.75&&y>=u(340)&&y<capY-.25&&clear(i,j,k);
     if(cap||wall)bodyG.d[n]=PAINT;});}
  // 6. door apertures through the side (sill, pillars and the roof rail stay)
  const DB=u(D.bottom);
  carveW(bodyG,[g.DOOR_R-1,g.DOOR_F+1,DB,ROOF,-ext,ext],(x,y,z)=>{if(y<DB+1||x>g.DOOR_F-1||x<g.doorRear(y)+1)return false;if(y>belt(x))return false;return Math.abs(z)>=halfAt(x,y)-7;});
  // 7. windows: door glass (A-pillar .. B-pillar), quarter glass, windshield, hatch glass
  const P=M.bPillar,bpF=y=>wx(P.botF+(P.topF-P.botF)*clampv((y*20-873)/(1335-873),0,1)),bpR=y=>wx(P.botR+(P.topR-P.botR)*clampv((y*20-873)/(1335-873),0,1));
  const roofEdge=x=>topC(x)-2.6;                                            // side-glass top edge sits just under the roof rail
  const sail=y=>wx(1479-1.2*(y*20-873));   // door glass front edge at the belt; the black sail triangle in front of it carries the mirror (MEASURED photos)
  const dgIn=(x,y)=>y>belt(x)+.4&&y<roofEdge(x)&&x>bpF(y)+.3&&x<g.xA(y)-3.2&&x<sail(y);
  const qPoly=M.quarter.map(([a,b])=>[wx(a),u(b)]);
  const inPoly=(x,y,poly)=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,yi]=poly[i],[xj,yj]=poly[j];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))c=!c;}return c;};
  const qgIn=(x,y)=>inPoly(x,y,qPoly)&&x<bpR(y)-.4;
  const wsX0=wx(1875),wsX1=wx(1374);
  const wsIn=(x,y,z)=>x<=wsX1&&x>=wsX0&&Math.abs(z)<g.aEnv(g.xA(y),y)-3.2&&y>u(880);
  const rwIn=(x,y,z)=>x<=g.xC(1285/20)+1.5&&y>u(H.glassBot)+.6&&y<u(1278)&&Math.abs(z)<g.cEnv(g.xC(y),y)-2.4&&x<hx;
  const sideOpen=(x,y,z)=>Math.abs(z)>=halfAt(x,y)-4.5;
  carveW(bodyG,[REAR_X,NOSE_X,BELT-1,ROOF+1,-ext,ext],(x,y,z)=>sideOpen(x,y,z)&&(dgIn(x,y)||qgIn(x,y)));
  const glass={},GL=0x6b5a44;   // RF-1: bronze-tinted glass in grid truth too (was steel blue 0x5c8aa0)
  glass.ws=hgrid(wsX0-.5,wsX1+.5,BELT,ROOF+1,-ext,ext);glass.rw=hgrid(REAR_X-.5,hx+.5,u(H.glassBot)-.5,ROOF+1,-ext,ext);
  const skinToGlass=(Gp,Gg,inR)=>eachCell(Gp,null,(i,j,k,n)=>{const v=Gp.d[n];if(v<0)return;const x=i/HR,y=j/HR,z=k/HR;if(!inR(x,y,z))return;if(v===PAINT)Gg.set(i,j,k,GL);Gp.d[n]=-1;});
  skinToGlass(bodyG,glass.ws,(x,y,z)=>wsIn(x,y,z)&&y>top(x,z)-3.6);
  skinToGlass(hatch,glass.rw,(x,y,z)=>rwIn(x,y,z));
  // the door's window frame: body cells round the door glass (A-pillar trim strip .. B-pillar) move to the door, painted black like the EF's sash; its rear edge is the door's
  // rear shut line carried up from the belt (the front 54 mm of the black B-pillar trim is on the door frame), so no body cell is left over the door's rear corner
  eachCell(bodyG,[g.DOOR_R-1,g.DOOR_F+2,BELT,ROOF,-ext,ext],(i,j,k,n)=>{if(bodyG.d[n]<0)return;const x=i/HR,y=j/HR,z=k/HR;
    if(y<=belt(x)||y>roofEdge(x)+1.1)return;if(x>g.xA(y)-1.7||x<Math.max(bpF(y),g.doorRear(y)))return;if(!sideOpen(x,y,z))return;
    const Dd=z<0?doorL:doorR;Dd.set(i,j,k,y<=belt(x)+.4?bodyG.d[n]:SASH);bodyG.d[n]=-1;});   // the 10 mm layer just over the belt is the door's top edge (it keeps its colour); above it, the black sash
  // PAINT-04 (owner, Nov 15: the black pillar is right on the E30, "but no every car"; "if it does have the black piece then leave it"): the AE86 liftback's
  // B-pillar is body colour. The black appliqué here was a DESIGN addition (minor 19), copied from the EF; AE86 owners: "I like the blacked out B pillar on
  // 2 door coupes, but don't think it works as well on 3 door hatch" (ae86drivingclub.com.au, "Check the pillars": a hatch with its pillars blacked out
  // as a modification). The pillar stays paint; the door's own window frame (sash) in front of it stays black.
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
  eachCell(bodyG,[REAR_X-1,wx(2700)+1,BELT-1,ROOF+1,-ext,ext],(i,j,k,n)=>{if(bodyG.d[n]!==PAINT)return;if(nearGlass(glass.qgL,i,j,k)||nearGlass(glass.qgR,i,j,k))bodyG.d[n]=GASK;});   // R-1: quarter-glass rubber surround (same 1-cell ring as windshield/hatch)
  // side molding (T-1): a RAISED rib, one cell (10 mm) proud of the skin with its own top/bottom edges, on body + both door skins (so it moves with the doors); the old flat MOLD paint vanished into the side
  const DCOL=new Set();for(const [Dd,sd] of [[doorL,-1],[doorR,1]])for(const [i,j] of Dd.list())DCOL.add(i+','+j+','+sd);   // v17: (i,j) columns the doors own: the body gets no rib there (it doubled the door's rib cell at the door's ends)
  const MO=M.molding,rib=(Gg,skip)=>{const outer=new Map();eachCell(Gg,[wx(MO.x1),wx(MO.x0),u(MO.y0),u(MO.y1),-ext,ext],(i,j,k,n)=>{if(Gg.d[n]<0)return;if(skip&&DCOL.has(i+','+j+','+(k<0?-1:1)))return;if(Math.abs(k)/HR<halfAt(i/HR,j/HR)-1.6)return;const key=i+','+j;if(k>0){const o=outer.get(key+',1');if(!o||k>o.k)outer.set(key+',1',{k});}if(k<0){const o=outer.get(key+',-1');if(!o||k<o.k)outer.set(key+',-1',{k});}});for(const [key,o] of outer){const [i,j,sd]=key.split(',').map(Number);Gg.set(i,j,sd>0?o.k+1:o.k-1,MOLD);}};
  rib(bodyG,true);rib(doorL);rib(doorR);
  // shut lines in the outer skin
  const seam=(Gg,b,pred)=>eachCell(Gg,b,(i,j,k,n)=>{if(Gg.d[n]!==PAINT)return;const x=i/HR,y=j/HR,z=k/HR;if(pred(x,y,z))Gg.d[n]=SEAM;});
  // v18: fuel filler door on the RIGHT rear quarter only (fan-details #8, rear34_2.jpg; the left quarter in rear34_1.jpg is clean): a 140 x 120 mm outline behind the arch, below the quarter glass (DESIGN size and place from the photos)
  seam(bodyG,[wx(3800),wx(3640),u(690),u(830),0,ext],(x,y,z)=>{const m=g.mm(x),ym=y*20;if(z<=0||m<3650||m>3790||ym<700||ym>820||Math.abs(z)<halfAt(x,y)-1.2)return false;return m<3660||m>3780||ym<710||ym>810;});
  seam(bodyG,[g.HOOD_X0-1.2,g.HOOD_X0+.4,u(400),ROOF,-hw,hw],(x,y,z)=>x<=g.HOOD_X0+.1&&Math.abs(z)<=g.HOOD_HALF+.5&&y>top(x,z)-1.5);
  seam(bodyG,[g.HOOD_X1-.4,g.HOOD_X1+1.2,u(400),ROOF,-hw,hw],(x,y,z)=>x>=g.HOOD_X1-.1&&Math.abs(z)<=g.HOOD_HALF+.5&&y>top(x,z)-1.5);   // S-1: hood FRONT edge shut line (nose side), mirror of the cowl seam
  seam(bodyG,[g.HOOD_X0,NOSE_X,u(400),ROOF,-hw,hw],(x,y,z)=>Math.abs(Math.abs(z)-(g.HOOD_HALF+.6))<.3&&x>=g.HOOD_X0+.5&&y>top(x,z)-1.6);
  seam(bodyG,[g.DOOR_F+.1,g.DOOR_F+.8,DB,BELT+1,-ext,ext],(x,y,z)=>x>g.DOOR_F+.1&&x<=g.DOOR_F+.55&&y>=DB+.5&&y<=belt(x)&&Math.abs(z)>=halfAt(x,y)-4.2);
  seam(bodyG,[g.DOOR_R-6,g.DOOR_R+.2,DB,BELT+1,-ext,ext],(x,y,z)=>{const xr=g.doorRear(y);return x<xr-.1&&x>=xr-.55&&y>=DB+.5&&y<=belt(x)&&Math.abs(z)>=halfAt(x,y)-4.2;});
  seam(bodyG,[g.DOOR_R-6,g.DOOR_F,DB-1,DB+.5,-ext,ext],(x,y,z)=>y<DB+.5&&y>=DB-.1&&x>=g.doorRear(y)&&x<=g.DOOR_F&&Math.abs(z)>=halfAt(x,y)-4.2);
  seam(bodyG,[hx-.8,hx+.5,u(1200),ROOF+1,-ext,ext],(x,y,z)=>x>=hx-.6&&x<=hx+.2&&Math.abs(z)<=hatchHalf(y)+.5&&y>top(x,z)-1.5);
  seam(bodyG,[REAR_X,hx,u(H.bottom)-1,ROOF+1,-ext,ext],(x,y,z)=>{const hh=hatchHalf(y);return Math.abs(Math.abs(z)-(hh+.6))<.3&&g.profDistZ(x,y,z)<1.4&&x<=hx;});
  // v20: the pop-up lids' outlines are no longer painted here: ae86PopUps (below) takes each lid out of the panels and blacks the one-cell rim round its opening
  const hi={body:bodyG,hood,trunk:hatch,doorL,doorR,glass};
  const CB=[Math.floor(REAR_X-3),Math.ceil(NOSE_X+3),0,Math.ceil(ROOF+2),-ext-1,ext+1],out={hi,HR};
  out.body=coarsen(bodyG,4,CB);out.hood=coarsen(hood,4,CB);out.trunk=coarsen(hatch,4,CB);out.doorL=coarsen(doorL,4,CB);out.doorR=coarsen(doorR,4,CB);
  out.glass={};for(const kk in glass)out.glass[kk]=coarsen(glass[kk],2,CB);
  out.rwOnLid=true;out.hatchHalf=hatchHalf;
  return out;
}

const AE86_RIG={
  cp:{side:1,H:{x:-6,y:25,z:19},back:24,rearH:{x:-42,y:25},rearBack:22,wheel:{x:10.5,y:42,z:19,n:[-.9,.436,0]}/* builder-lane fix: draft 21.5 sat inside the dash (rearX 15.3); 10.5 = 4.8 behind the dash face, EF convention; OPEN-9 DESIGN */,pedalX:33.5,pedalY:31.5,pedalLen:330,pedals:[['clutch',12.5,75,65],['brake',18.5,75,65],['gas',24,50,110]],shifter:{x:10,y:28},eye:{x:-17.5,y:56.5,z:19}},
  // v17: the driver's seat (H point and eye) 220 mm further back: the cushion reached under the steering wheel and its front edge stood 170 mm from the pedals.
  // Now H is 420 mm behind the dash face and the wheel 320 mm ahead of H, the same proportions as the measured EF cabin. Shifter between the seat fronts, clear of the dash.

  dash:{rearX:15,top:42,bot:33,cowlX:31.8,halfZ:33,slope:.12},
  console:{rearX:-11,shiftX0:4,shiftX1:14,top:28,y0:24.5},   // v17: shift section ends at the centre stack's face (dash rearX 15), not under it   // v17: the console's foot on the raised tunnel (top 460 + skin), not down through it
  floorY:12.5,rackR:1.3,carpetIn:10,columnGap:1.6,   // v17: dash rearX on a whole cell so the stack, binnacle and their detail touch; column shroud reaches the wheel hub (was 3.4: the wheel floated)
  
  floorAt:x=>x>-30?12.5:(x>-46?16.5:22.5),   // v17: behind x -46 (920 mm) the carpet lies on the kick-up over the axle (pocket roof 430 + skin)
     // DESIGN: carpet on the 230 mm floor pan, raised floor under the rear seat
  floorHalf:(x,y)=>{const fa=Math.abs(x-60)<=20,ra=Math.abs(x+60)<=19.5,tw=Math.abs(x+60)<=8.5;return fa?20:(tw?22:(ra?26.5:34));},   // front wheelhouse walls (440), rear tubs (555), sills
  cargo:{frontX:-55,rearX:-101,floorY:26,half:22,hi:true},   // v17: half 24 -> 22, the load floor stops inboard of the rear coil springs   // DESIGN: load floor between the rear damper towers, to the tail
  bay:{x0:43,x1:93,fwX:43,top:35.5,radX:91,batX:76,towerTop:40,airZ:1,towers:false,rails:false,
       battery:{x0:78,x1:83,y0:13,y1:20,z0:-13,z1:-21.5},airbox:{x0:70,x1:78,y0:28,y1:34,z0:-20.5,z1:-12.5},boosterZ:17,boosterR:3.8,mcLen:7,fuse:{z0:-20.5,z1:-15}},   // DESIGN layout, EF pattern; battery/airbox sides follow airZ
  crash:{y0:15,y1:21,half:33},   // DESIGN (minor 14: EF pattern {y0,y1,half} named; bumperTipMax method in SHELLS note)
  hoses:{r:.9,intakeR:1.5,tankZ:22.5,shroudX:85.2,turnX:82.7,upY:26.3,loY:16.5},   // DESIGN (EF pattern)
  doorCard:{y0:18},
  links:{n:40,arm:2,rod:1.2,fork:1.2,shaft:1.4},
  damper:{n:60,bodyR:2.5,rodR:1,bodyFrac:.5},coil:{n:40,R:4.0,w:.9,turns:6},
  // powertrain: crank line 5.5 units (110 mm) ahead of the front axle, 340 mm up (DESIGN: 4A-GE block 560 long centred ~700 mm from the nose)
  power:{dx:5.5,crankY:17.75},   // v17: 10 mm higher, so the sump clears the front cross-member that carries the lower arms
  // exhaust route (DESIGN): header at the firewall side, pipe in the floor tunnel, silencer under the rear floor, tip under the rear bumper.
  // side:-1: the tail pipe exits on the car's LEFT (MEASURED: rear_1.jpg, rear34_1.jpg, rear34_2.jpg all show it there; OPEN-10 closed). The run stays in the
  // centre past the fuel tank (left, under the rear seat), then swings left round the pumpkin; 50 mm pipe (pr 1.3) so it clears the axle tube at full pitch.
  exh:{dx:-10,y0:12,pipeY:9.25,zRun:0,catX:30,mufX0:-70,mufX1:-90,mufZ:13,side:-1,tipMM:4100,tipY:9.9,pr:1.3,via:[[-51,9.25,0],[-56,9.25,-7]]},
  // underbody (DESIGN): front subframe under the bay only, live-axle link brackets at the rear, fuel tank under the rear seat
  under:{subY:8,railZ:18,railX0:55.5,railX1:93,brkX:59,fx1dx:-1,posts:[[56.5,20,0],[91,18,1]],   // v18: rails 360 mm out (inboard of the tyres' sweep at full lock), from ahead of the tie rods to the radiator support; cross-member on the axle line carrying the lower arms; posts up to the strut-tower aprons and the bay's front
         tank:{x0:-50,x1:-32,y0:7.6,y1:13.5,half:8,zc:-11},rearBeam:false,rearBr:false,rearRails:null,trailBr:null},   // v17: no rear sub-frame on a live axle; the links bolt to brackets on the floor and in the kick-up
  // suspension hardpoints: [dx from the axle, y, |z|]. DESIGN, laid out so nothing crosses.
  // FRONT: MacPherson strut, ADAPTED (minor 4 / spec §3c) — the adapted knuckle builder reads EXACTLY:
  //   lower-link pivots (lowF/lowR), radius/steady-arm pivot (rodTo), strutTop, strutLow, springTopY, springLow, lbj, rack.
  //   It must NOT read upF/upR/forkTop/forkDx (wishbone fields a strut front does not have).
  // REAR: 4-link live axle — no uprights, no rear steering, no half-shafts. The rear axle builder (next lane)
  //   reads tubeY, linkUp/linkLow, panhardY, springSeat, damperTop; it must NOT use the EF rear wishbone code.
  susp:{
    front:{lowF:[13,8.5,18],lowR:[-1,8.25,19],rodTo:.6,lbj:[-5.5,0],strutTop:[0,38.5,24],springTopY:34,strutDx:.5,strutLy:-2.5,strutLowDz:6,springLow:.45,rack:{dx:-10.85,y:10,half:15}   // v17: rack 200 mm up, below the bellhousing, level with the steering-arm ends (was 280: inside the bellhousing)
},
    // v17: link pairs are [body pivot, axle pivot]. The links run FORWARD from the axle to the body (4-link: lower trailing links outboard, upper links angled in to the pumpkin);
    // the old table had the body pivots behind the axle and the axle pivots 180 mm ahead of it, off the tube (DESIGN after the AE86 4-link layout)
    rear:{tubeY:14,linkUp:[[13,15.5,15],[1,17,9]],linkLow:[[20,11.75,23],[-1,11.5,23]],panhardY:21,springSeat:[-2,18,24],damperTop:[-7,36,26],trail:[20,8,26]}
  }
};

if(false)module.exports={AE86_M,makeAE86,AE86_RIG};
