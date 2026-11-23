/* Model X 2022 refresh. Nominal envelope VERIFIED from dims.md.
   Contour stations and panel boundaries DESIGN, traced against bp_tb_refresh_all.png
   and side_1/front_1/rear_1. Drawing's obsolete printed length is NOT used.
   Geometry uses 10 mm cells; x forward from wheelbase centre, y up, z right. */
// v2.1 lamp cells: each lit function has its own colour code inside its panel's skin; car_modelx.js draws those quads with the lamp's material from the
// panel's own surface net, so lens and body are one surface. Codes differ in the last digit only (the colour seen is the same left and right).
// v2.4: the tail light pipe's unlit colour is a dull red; it reads lit only when its lamp lights (it looked lit all the time: owner, Nov 12)
const MX_LAMP={drlL:0xe9eff1,drlR:0xe9eff2,headL:0x20272d,headR:0x20272e,projL:0x2e373e,projR:0x2e373f,tailL:0x7a1c24,tailR:0x7a1c25,tailC:0x7a1c26,revL:0x3b1418,revR:0x3b1419,repL:0x15181c,repR:0x15181d};
const MX_LAMP_GROUPS={drlL:['drlL'],drlR:['drlR'],headlampL:['headL','projL'],headlampR:['headR','projR'],tailLampL:['tailL'],tailLampR:['tailR'],trunkLamp:['tailC'],reverseL:['revL'],reverseR:['revR'],repeaterL:['repL'],repeaterR:['repR']};
// v2.2 headlamp outline in the front view, [|z|, height] mm (bp_tb_refresh_all.png front view), and its lower edge
const MX_HEAD=[[518,836],[560,862],[620,905],[660,918],[800,922],[880,930],[945,950],[948,820],[900,788],[700,781],[580,784],[530,806]];
const MX_HEAD_LO=[[518,836],[530,806],[580,784],[700,781],[900,788],[948,820]];
function mxHoodY(az){return az<470?842-12*Math.max(0,1-az/140):az<518?842-6*(az-470)/48:mxTab(MX_HEAD,Math.min(az,820));}   // the hood's leading edge height in the front view
function mxIn(P,u,v){let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>v)!==(b[1]>v)&&u<(b[0]-a[0])*(v-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;}
const MODELX_M={L:5057,W:1999,H:1680,WB:2965,ovF:988,trackF:1705,trackR:1710,
  // v2 shape (Opus, 2026-11-12). Every table is CALCULATED from bp_tb_refresh_all.png (the-blueprints #23077, 2021 refresh), read pixel by pixel:
  // side and top views at 14.43 mm/px from the hubs (px 76 / 281.5 = the VERIFIED 2965 mm wheelbase, nose at px 9), heights at 14.6 mm/px scaled
  // so the roof peak is the VERIFIED 1680 mm, front and rear views at 14.49 mm/px. Reading error about +/-1 px (15-20 mm). Stations s from the nose.
  top:[[0,800],[110,880],[270,940],[470,1013],[685,1060],[900,1095],[1120,1160],[1262,1190],[1406,1279],[1623,1382],[1912,1515],[2150,1575],
       [2400,1615],[2650,1650],[2850,1680],[3100,1668],[3400,1645],[3650,1620],[3900,1575],[4150,1505],[4400,1432],[4600,1385],[4800,1336],
       [4950,1318],[5010,1300],[5057,1220]],                                    // centre-line top (the side silhouette)
  plan:[[0,180],[20,297],[36,371],[50,429],[64,493],[79,529],[93,558],[108,593],[137,658],[165,707],[180,729],[324,872],[469,922],[613,987],
        [757,994],[900,999.5],[1190,999.5],[1334,994],[1479,953],[1623,951],[2056,963],[2344,963],[2633,958],[3066,958],[3355,951],[3499,979],
        [3643,994],[3932,994],[4076,987],[4220,987],[4365,972],[4500,941],[4653,865],[4798,829],[4855,779],[4913,715],[4971,643],[5000,565],
        [5028,465],[5057,329]],                                                // outermost half-width (the top view), arch flares included
  bot:[[0,300],[100,226],[450,211],[700,205],[1300,195],[3500,195],[4350,197],[4610,227],[4697,241],[4783,256],[4870,285],[4956,314],[5043,373],[5057,400]],
  belt:[[0,1250],[1262,1150],[1480,1131],[2780,1170],[3950,1210],[4300,1290],[4560,1400],[5057,1400]],   // the side glass's lower edge (DLO)
  doorF:[1480,2780],doorR:[2810,3950],seamZ:700,                                // falcon wing: upper section inside |z| 700 (the roof's edge), lower outside
  archR:440,archY:360,frontHinge:[1000,1080,960], // DESIGN hinge world mm; v2.2: 10 mm outboard of the door's outermost cell (was 990, which stood the hinges 40 mm out of the skin)
  roofHinge:[-700,1680,300],elbow:[-700,1592,700],elbowTilt:Math.atan2(89,1140) // DESIGN: roof pivots from the open photos and patent topology. v2: the elbow hinge line follows the roof-edge seam, falling 89 mm from s 2810 (1620 up) to s 3950 (1531 up)
};
function mxTab(t,x){if(x<=t[0][0])return t[0][1];for(let i=1;i<t.length;i++)if(x<=t[i][0])return t[i-1][1]+(t[i][1]-t[i-1][1])*(x-t[i-1][0])/(t[i][0]-t[i-1][0]);return t[t.length-1][1];}
function mxGrid(cells){if(!cells.length)return new Grid(0,0,0,0,0,0);const b=[Infinity,-Infinity,Infinity,-Infinity,Infinity,-Infinity];for(const p of cells)for(let a=0;a<3;a++){b[a*2]=Math.min(b[a*2],p[a]);b[a*2+1]=Math.max(b[a*2+1],p[a]);}const g=new Grid(...b);for(const p of cells)g.set(...p);return g;}
function mxBox(x0,x1,y0,y1,z0,z1,c){const cells=[];for(let x=Math.ceil(Math.min(x0,x1)/10);x<=Math.floor(Math.max(x0,x1)/10);x++)for(let y=Math.ceil(Math.min(y0,y1)/10);y<=Math.floor(Math.max(y0,y1)/10);y++)for(let z=Math.ceil(Math.min(z0,z1)/10);z<=Math.floor(Math.max(z0,z1)/10);z++)cells.push([x,y,z,c]);return mxGrid(cells);}
function mxTube(a,b,r,c){const lo=a.map((v,i)=>Math.floor((Math.min(v,b[i])-r)/10)),hi=a.map((v,i)=>Math.ceil((Math.max(v,b[i])+r)/10)),d=b.map((v,i)=>v-a[i]),ll=d.reduce((s,v)=>s+v*v,0),cells=[];
  for(let x=lo[0];x<=hi[0];x++)for(let y=lo[1];y<=hi[1];y++)for(let z=lo[2];z<=hi[2];z++){const p=[x*10,y*10,z*10],t=clampv(p.reduce((s,v,i)=>s+(v-a[i])*d[i],0)/ll,0,1);if(Math.hypot(...p.map((v,i)=>v-a[i]-t*d[i]))<=r)cells.push([x,y,z,c]);}return mxGrid(cells);}
function makeModelX(){const M=MODELX_M,origin=M.ovF+M.WB/2;
  const m=x=>origin-x,belt=s=>mxTab(M.belt,s),W=s=>mxTab(M.plan,s),T=s=>mxTab(M.top,s);
  // the roof's crown across the car (front view: 1686 at |z| 464, 1672 at 652, 1657 at 681); the hood and the liftgate fall away more
  const crown=s=>s<1262?70:s<1900?70-40*(s-1262)/638:s<4300?30:30+40*clampv((s-4300)/500,0,1);
  const top=(s,z)=>{const w=Math.max(1,W(s)*.97);return T(s)-crown(s)*Math.pow(Math.min(1.2,Math.abs(z)/Math.min(w,700)),4);};
  // section (front view, normalised): the body side is widest at the arch tops and shoulder (600-860 up), tucks 3.5 % at the sill, rolls in 7 % to the belt
  const low=(s,y)=>{const b=belt(s);let f=y<350?.965:y<600?.965+.035*(y-350)/250:y<860?1:1-.07*clampv((y-860)/Math.max(60,b-860),0,1);return W(s)*f;};
  // greenhouse: the side glass leans in from 942 at 1058 up to 681 at 1657 (front and rear views); narrower again where the plan narrows at the tail
  const gh=(s,y)=>{const k=Math.min(1,Math.pow(W(s)/963,1.6));return (942-.435*(y-1058))*k;};
  const half=(s,y)=>{const b=belt(s);return y<=b?low(s,y):Math.min(low(s,b),gh(s,y));};
  const bot=s=>mxTab(M.bot,s);
  return {M,origin,m,top,half,belt,bot,W,T,wx:s=>(origin-s)/20,AX_F:M.WB/40,AX_R:-M.WB/40};
}
function buildModelXBody(g){const M=g.M,lists={},put=(n,i,j,k,c)=>{(lists[n]||(lists[n]=[])).push([i,j,k,c]);},black=0x161a20,glass=0x31434c,closeout=[];
  const archRadius=z=>M.archR+50*clampv((980-Math.abs(z))/100,0,1);
  const skin=(x,y,z)=>{const s=g.m(x),az=Math.abs(z);if(s<0||s>M.L||y<g.bot(s)||y>g.top(s,z)||az>g.half(s,y))return false;
    if(y<790&&s<(790-y)*.2)return false;   // the nose's lower face leans back to the chin (side view)
    if(y<1200&&s>M.L-8-(y<450?(450-y)*.25:0))return false;   // the tail face: upright under the liftgate, the bumper tucked under at the bottom
    for(const ax of [988,3953])if(az>660&&Math.hypot(s-ax,y-M.archY)<archRadius(z))return false;return true;};
  g.solidAt=(x,y,z)=>skin(x*20,y*20,z*20);
  // v2.1: the front-most and rear-most skin station at each (height, |z|), so lamps sit on the faces they are seen on (front and rear views), not on the hood
  const faceF=new Map(),faceR=new Map(),face=(y,az,rear)=>{const k=y*2000+az,F=rear?faceR:faceF;if(F.has(k))return F.get(k);let r=rear?-1:1e9;
    if(rear){for(let s=M.L;s>M.L-700;s-=10)if(skin(g.origin-s,y,az)){r=s;break;}}else{for(let s=0;s<700;s+=10)if(skin(g.origin-s,y,az)){r=s;break;}}F.set(k,r);return r;};
  // Outer skin is partitioned once. No panel occupies another panel's cells.
  for(let i=-259;i<=248;i++){const x=i*10,s=g.m(x);if(s<0||s>M.L)continue;const tc=mxTab(M.top,s),b=g.belt(s);
    for(let j=Math.floor(g.bot(s)/10);j<=Math.floor(tc/10);j++){const y=j*10,w=g.half(s,y),kl=Math.floor(w/10);
      for(let k=-kl;k<=kl;k++){const z=k*10,az=Math.abs(z);if(!skin(x,y,z))continue;
        const nearSide=w-az<20,nearTop=g.top(s,z)-y<20,nearBot=y-g.bot(s)<20;
        let nearArch=false;for(const ax of [988,3953])if(az>660&&Math.abs(Math.hypot(s-ax,y-M.archY)-archRadius(z))<20)nearArch=true;
        // v2.2: at the nose and tail every cell within 20 mm fore or aft of the real surface is skin (it was only within 90 mm of the nose tip and 120 mm of the
        // tail end, which left holes where the plan rounds the corners: 1380 cells, the dots in the bumper face). The bumpers' undersides as before.
        // v2.5 (owner, Nov 13: "a gap that i can see from the outside to the inside"): the shoulder at the belt. Toward the tail the greenhouse is
        // narrower than the body under it, so the shoulder has a top face between the side skin and the glass's base; it was never skin (only cells near
        // the side, the top and the arches were), and from above you looked through it into the cargo area along both rear quarters
        const ledge=!nearTop&&y>b-30&&y<=b+10&&(!skin(x,y+10,z)||!skin(x,y+20,z));
        // v2.5: the wheel tubs' inner walls (render only, closeout below): inside each arch the body was open inboard of the tyre, so through the wheel
        // you saw the seats and the carpet. Two cells at |z| 640-660, inside the arch's circle, from the arch's lower edge up
        if(az>=640&&az<=660&&y>=g.bot(s)&&[988,3953].some(ax=>Math.hypot(s-ax,y-M.archY)<archRadius(z<0?-670:670)))closeout.push([i,j,k,0x16181b]);
        if(!nearSide&&!nearTop&&!nearArch&&!ledge&&!((s<700||s>4300)&&(!skin(x+20,y,z)||!skin(x-20,y,z))))continue;
        let name='bodyMesh',c=PAINT;const side=z<0?'L':'R',sideSurface=(nearSide||ledge)&&!nearTop;
        if(y<300)c=black;   // black sill cladding (side_1: 190-270 up, the door's lower edge at 314)
        // v2.3: the liftgate's outline from the drawing's rear view (rows 239-254): its sides at |z| 655 (widening 0.2 mm per mm above 1250, round the
        // glass), its lower edge at 720 in the middle rising to 760 at the corners (a shallow U under the plate); was a 760 x 760 rectangle
        const tw=655+Math.max(0,y-1250)*.2,tb=720+40*clampv((az-560)/95,0,1);
        if(s<600&&y<790)name='bumperF';else if(s>4800&&y<tb)name='bumperR';   // the front bumper cover runs back to the front arch
        else if(s>3980&&az<tw&&(nearTop||s>4920)&&y>=tb)name='trunk';
        else if(s<=1245&&nearTop&&az<820&&(s>=170+340*Math.pow(Math.min(1,az/820),2)||y>=mxHoodY(az)))name='hood';   // v2.2: its front edge comes down to the nose strip's and the lamps' top edges (front_1.jpg: the hood's leading edge is their upper edge)   // v2.1: the hood's front edge sweeps back over the headlamps (170 at the centre, 510 at its corners; front_1.jpg)   // hood: leading-edge crease to the windshield base (top view px 19-93)
        else if(s>=1480&&s<=2780&&sideSurface&&y>=340)name='door'+side;
        else if(s>=2810&&s<=3950&&y>=340&&(sideSurface||(nearTop&&az>=310)))name=(az<M.seamZ?'rupper':'rdoor')+side;
        else if(s<1480&&nearSide)name='fender'+side;
        else if(s>3950&&nearSide)name='quarter'+side;
        else if(y<340&&s>1480&&s<3950)name='sill'+side;
        else if(nearTop&&s>2650&&s<3980&&az<310)name='roof';
        // Side glass: the black perimeter is owned by the same opening panel.
        if(sideSurface&&!name.startsWith('rupper')&&s>1510&&s<4560&&y>b+25&&y<g.top(s,az)-30){
          const axisY=M.elbow[1]+(g.origin-s-M.elbow[0])*Math.tan(M.elbowTilt);   // the falcon's elbow hinge line: a black frame band above the glass carries it
          const edge=y<b+45||y>tc-85||Math.abs(s-2780)<65||Math.abs(s-3950)<35||(s>2810&&s<3950&&y>axisY-25);
          c=edge?black:glass;
          if(!edge){if(name.startsWith('door'))name+='Glass';else if(name.startsWith('rdoor'))name+='Glass';else name='quarterGlass'+side;}   // v2.1: the black frame stays in the opening panel's own skin (one surface, no seam); only the pane is glass
        }
        // Unbroken panoramic windshield extends over the first row.
        if(nearTop&&s>1270&&s<2650&&az<g.half(s,y)-45){if(az>g.half(s,y)-75||s<1300)c=black;else{name='panorama';c=glass;}}   // the windshield runs from the cowl (1262) over the front seats; its 30 mm black frit border belongs to the body skin around it
        // v2.2: the liftgate glass as the drawing's rear view has it (bp_tb_refresh_all.png rear view, rows 186-218): a rounded rectangle whose lower edge runs
        // straight across the trailing edge at 1250 up (the stowed spoiler's line), sides at |z| 623 widening 0.16 mm per mm of height, 80 mm corners. The outer
        // 45 mm is its black frame; beside it the liftgate is paint (the white D-pillars, rear_1.jpg). Edges defined in the rear view, so no stairs across the tail.
        if(name==='trunk'&&y>=1170){const hb=623+Math.max(0,y-1250)*.16,r=80,qx=az-(hb-r),qy=1250+r-y,d=Math.hypot(Math.max(qx,0),Math.max(qy,0))+Math.min(Math.max(qx,qy),0)-r;
          if(d<0){if(d<-45&&nearTop&&s>=4010&&s<4990){c=glass;name='trunkGlass';}else c=black;}}
        if(name.startsWith('rupper')&&az>140&&az<M.seamZ-40&&s>2900&&s<3850)c=glass;
        // Refresh nose: narrow moustache and a low intake, no upright grille.
        if(s<200&&y>815-40*Math.max(0,1-az/140)&&y<842-12*Math.max(0,1-az/140)&&az<470)c=black;   // the thin nose strip between the lamps, its centre dipping in a V (front_1.jpg)
        if(name==='bumperF'&&s<260&&y>350&&y<515&&az<405+(y-350)*1.03)c=0x101317;   // v2.2: the lower intake is wider at its top (|z| 570) than its bottom (405), drawing front view rows 99-110 and front_1.jpg
        if((s<700||s>4400)&&y<g.bot(s)+35&&!nearSide)c=black;   // the bumpers' undersides and lower lips are black   // lower intake (front view rows 99-110)
        {const lo=530+(az-650)*.14;if(name==='bumperF'&&s<330&&y>lo&&y<lo+46&&az>650&&az<875)c=y>lo+32?0xc4ccd2:0x22292f;}   // v2.2: slim corner lamps, a dark lens under a bright bezel, rising outward (front_1.jpg; front view rows 92-98)
        if(name==='bumperF'&&s<380&&y>440&&y<640&&az>885&&az<925)c=0x101317;   // the vertical air-curtain slot outboard of each lamp (front_1.jpg)
        if(nearSide&&s>1365&&s<1415&&y>895&&y<935)c=MX_LAMP['rep'+side];   // side repeater camera on the front fender, a small black triangle (side_1.jpg: s 1390, 910 up)
        if(name==='bumperR'&&y<510+80*Math.pow(az/950,4))c=black;   // black lower bumper and diffuser (rear view rows 268-290)
        if(name==='bumperR'&&s>4900&&az>420&&az<790&&y>480&&y<540)c=0x7e1a24;   // rear reflectors (rear view rows 266-270)
        if(nearArch)c=black;   // v2.2: the whole arch is black (its roof showed white inside the wheel well)
        if(nearTop&&s>2650&&s<3980)c=black;
        // Lamp lenses use the skin cells, so there is no buried overlap.
        // v2.2: the headlamp's outline from the drawing's front view (bp_tb_refresh_all.png rows 70-81 at 14.49 mm/px): a pointed inner end at |z| 520 and
        // 835 up, the top edge rising under the hood's edge to 920 by |z| 660, the bottom edge near level at 785, the outer end wrapping the corner at |z| 945.
        // On the front-facing skin (the front-most cells at that height and |z|), ahead of the hood's edge. As front_1.jpg / front34_1.jpg show it: a dark smoked lamp,
        // the DRL a bright line along the whole lower edge from the pointed inner tip to the outer end, two chrome projector bowls inside.
        if(name!=='hood'&&s<200+340*Math.pow(Math.min(1,az/820),2)&&az>510&&az<950&&y>775&&y<955&&mxIn(MX_HEAD,az,y)&&s-face(Math.round(y/10)*10,Math.round(az/10)*10,false)<45){
          const pr=Math.hypot(az-640,(y-866)*1.3)<20||Math.hypot(az-775,(y-872)*1.3)<22;const lo=mxTab(MX_HEAD_LO,az);c=(y>lo+8&&y<lo+30)||az>916?MX_LAMP['drl'+side]:pr?MX_LAMP['proj'+side]:MX_LAMP['head'+side];}   // the DRL line inside the lamp, a dark lip under it (front34_1.jpg)
        {const t=clampv((640-az)/180,0,1),lo=954+46*t,hi=1146-46*t;if(s>4700&&y>lo&&y<hi&&az>440&&face(Math.round(y/10)*10,Math.round(az/10)*10,true)-s<45){const pipe=(y>hi-22&&az>520)||(y<lo+22&&az>700)||az>950,inner=s>4920&&az<655;
          c=pipe?(inner?MX_LAMP.tailC:MX_LAMP['tail'+side]):0x4a1218;   // v2.3: a smoked dark-red lens round the bright light pipe (owner's rear photo, rear_1.jpg)
          if(inner&&!pipe&&az<520&&y>lo+50&&y<lo+80)c=MX_LAMP['rev'+side];}}   // v2.1: lamp cells stay in their panel's skin (no seam); the light pipe two cells thick so it reads unbroken   // rear_1.jpg: smoked lenses with a red C-shaped light pipe (top edge, outer end, lower edge outboard); rear view |z| 435-1000, 954-1146 up. Reversing segment at the inner end: DESIGN (location not sourced)
        if(s>4990&&az<445&&y>=1055&&y<=1090){name='trunk';c=black;}   // the black strip joining the lamps across the liftgate (v2.3: drawing rear view rows 228-232, 1042-1101: higher)
        if(name==='bumperF'&&y<330&&c===PAINT)c=black;
        if(s>1480&&s<4600&&y>g.top(s,az)-30&&!nearTop&&c===PAINT)c=black;   // v2.1: above the side windows the roof's edge is black (glass and frit), as in side_1.jpg; no white strip between frame and roof
        if(s>=1250&&s<2800&&y>g.belt(s)+10&&c===PAINT&&name!=='hood')c=black;   // v2.2: A-pillars and the roof rail over the front doors are black (the windshield wraps them, side_1/front34_1); paint showed as stairs along the glass   // v2.2: the A-pillars are black (the windshield wraps them, side_1/front34_1); paint specks showed between frit and frame
        if(/^rupper/.test(name)&&c===PAINT)c=black;   // the falcon wings' upper sections are black roof (glass panels and frame)   // the front bumper's lower lip is black under the intake (front_1.jpg)
        // v2.1: every FIXED panel is one skin (one surface net): bumpers, fenders, quarters, sills and the roof spine join without a seam. Only the parts
        // that move (doors, falcon sections, hood, liftgate) and the glass panes are separate, and their joins are the real shut lines.
        if(/^(bumperF|bumperR|fender[LR]|quarter[LR]|sill[LR]|roof)$/.test(name))name='bodyMesh';
        put(name,i,j,k,c);
      }
    }
  }
  // Load-bearing floor and firewall. DESIGN packaging, floor around wheel tubs.
  for(let s=1440;s<=4750;s+=10){const x=Math.round((g.origin-s)/10),w=s>3510&&s<4400?530:Math.floor(g.half(s,330)/10)*10;
    for(let z=-w;z<=w;z+=10)for(const y of [330,340])put('bodyMesh',x,y/10,z/10,0x30353b);}
  for(let y=350;y<=1060;y+=10)for(let z=-920;z<=920;z+=10)put('bodyMesh',103,y/10,z/10,0x30353b);
  // v2.5: the floor pan closed where it stopped short (render only, closeout): beside the rear wheel tubs (the floor is 530 wide there, the tub walls stand
  // at 640-660) and behind s 4750 to the tail. From below and through the arches the cabin's carpet showed
  for(let s=3510;s<=M.L;s+=10){const x=Math.round((g.origin-s)/10),w=Math.floor(g.half(s,330)/10)*10;
    for(let z=-w;z<=w;z+=10){const az=Math.abs(z);if(s<4750&&(az<=530||az>660))continue;if(!skin(x*10,330,z))continue;for(const y of [330,340])closeout.push([x,y/10,z/10,0x30353b]);}}
  // A narrow B-pillar and central roof cross-member tie the roof to the floor.
  for(const s of [2795,3970])for(let y=350;y<mxTab(M.top,s)-20;y+=10)for(const sd of [-1,1]){const z=sd*Math.round((g.half(s,y)-25)/10),x=Math.round((g.origin-s)/10);if(skin(x*10,y,z*10))put('bodyMesh',x,y/10,z,black);}
  // Floor/firewall terminate at the inside of the outer panels, never in their cells.
  const occupied=new Set();for(const [n,cells] of Object.entries(lists))if(n!=='bodyMesh')for(const p of cells)occupied.add(p.slice(0,3).join(','));
  lists.bodyMesh=lists.bodyMesh.filter(p=>!occupied.has(p.slice(0,3).join(',')));
  // DESIGN 10 mm voxel seal relief along the fixed upper front-door surround.
  // The old zero-gap partition catches the curved header during initial swing.
  const fixed=new Set(lists.bodyMesh.map(p=>p.slice(0,3).join(',')));
  const doorSeal={};   // v2.1: the relieved cells are drawn back as the door's black rubber seal (render only): the swing keeps its clearance, no gap shows
  for(const n of ['doorL','doorR','doorLGlass','doorRGlass'])lists[n]=lists[n].filter(([x,y,z,c])=>{
    if(y<100)return true;
    for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)for(let dz=-1;dz<=1;dz++)if(fixed.has([x+dx,y+dy,z+dz].join(','))){{const h=n.replace('Glass','');(doorSeal[h]=doorSeal[h]||[]).push([x,y,z,0x16181b]);}return false;}   // v2.2: a pane's relieved cells too, drawn as its door's seal (they left holes round the glass)
    return true;
  });
  // DESIGN 10 mm seam relief between the falcon's sections (the fold needs it). The checks see the gap; the drawn skin closes it with the door's black
  // rubber seal (render only, out._render), so no gap shows from outside.
  const render={};for(const n in doorSeal)render[n]=mxGrid(lists[n].concat(doorSeal[n]));
  // v2.5: the closeouts are drawn with the body (render only, like the door seals): the checks keep the body's own cells, so nothing new can meet a
  // suspension arm or a half-shaft in the swing and travel sweeps; only cells no panel owns
  {const taken=new Set();for(const n in lists)for(const p of lists[n])taken.add(p.slice(0,3).join(','));const add=[];
   for(const p of closeout){const k=p.slice(0,3).join(',');if(taken.has(k))continue;taken.add(k);add.push(p);}if(add.length)render.bodyMesh=mxGrid(lists.bodyMesh.concat(add));}
  for(const n of ['rupperL','rupperR'])if(lists[n]){const relief=lists[n].filter(([x,y,z])=>Math.abs(z)*10>=M.seamZ-10).map(([x,y,z])=>[x,y,z,0x16181b]);
    lists[n]=lists[n].filter(([x,y,z])=>Math.abs(z)*10<M.seamZ-10);render[n]=mxGrid(lists[n].concat(relief));}
  const out={};for(const n in lists)out[n]=mxGrid(lists[n]);Object.defineProperty(out,'_render',{value:render,enumerable:false});return out;
}
// Own staggered wheel geometry. VERIFIED sizes; DESIGN tyre contour/spoke twist.
function mxWheelGrid(dia,width,tw,ar,kind,rear){const rr=dia*25.4/20,od=(dia*25.4+2*tw*ar/100)/20,hw=tw/20,rw=width*25.4/20,cells=[];
  for(let x=-Math.ceil(od);x<=Math.ceil(od);x++)for(let y=-Math.ceil(od);y<=Math.ceil(od);y++)for(let z=-Math.ceil(Math.max(hw,kind==='knuckle'?17:hw));z<=Math.ceil(hw);z++){
    const r=Math.hypot(x,y),az=Math.abs(z);let c=-1;
    if(kind==='tire'&&y>=-(od-1.5)&&r>=rr&&r<=od-.055*Math.max(0,az-hw*.65)**2&&az<=hw&&(r>rr+1||az>rw-1))c=r>od-1?0x222429:0x171a1e;
    if(kind==='rim'&&r<=rr&&r>=rr-1&&az<=rw)c=0x3a3d43;
    if(kind==='rim'&&r<rr-1&&z>=-6&&z<=8){const a=(Math.atan2(y,x)+(dia===22?r/rr*.23:0)+Math.PI*4)%(Math.PI/5),spoke=Math.min(a,Math.PI/5-a);if(r<4.8||(z>=6&&spoke<.072&&r>4))c=r<4.8?0x33363b:0x55585d;}
    if(kind==='rotor'&&r<=(rear?365:380)/20&&z>=-8&&z<=-7)c=0x727980;
    if(kind==='knuckle'&&r<=3.8&&z>=-17&&z<=-9)c=0x42464b;
    if(c>=0)cells.push([x,y,z,c]);
  }return mxGrid(cells);
}
// DESIGN packaging: NOT FOUND dimensions/mass in ev_spec. See HANDOFF MX-03 rationale.
function mxMotor(cx,cy,cz,r,length){const cells=[];
  for(let x=Math.ceil((cx-r)/10);x<=Math.floor((cx+r)/10);x++)for(let y=Math.ceil((cy-r)/10);y<=Math.floor((cy+r)/10);y++)for(let z=Math.ceil((cz-length/2)/10);z<=Math.floor((cz+length/2)/10);z++){
    const rad=Math.hypot(x*10-cx,y*10-cy);if(rad<=r&&(rad>=r-20||Math.abs(z*10-cz)>length/2-20))cells.push([x,y,z,Math.abs(z%4)===0?0x66747a:0x454f55]);
  }return mxGrid(cells);
}
function mxBattery(){const cells=[];
  for(let x=-112;x<=96;x++)for(let y=17;y<=32;y++)for(let z=-65;z<=65;z++){
    const skin=x<=-111||x>=95||y===17||y===32||Math.abs(z)>=64,rib=(x+112)%26===0;
    if(skin||rib)cells.push([x,y,z,y===17?0x313a40:rib?0x56666e:0x444e57]);
  }return mxGrid(cells);
}
// DESIGN hardpoints in mm. Topology from Tesla manual; no factory hardpoint dimensions.
function mxSuspension(rear){const hubY=rear?364.15:357.15,zHub=rear?855:852.5,zL=rear?735:730,zU=zL-20,yL=hubY-100,yU=hubY+180;
  const zi=rear?490:450,yI=300,zu=rear?500:490,yIu=640,angle=Math.atan2(zU-zL,yU-yL);
  return {ax:rear?-1482.5:1482.5,hubY,zHub,zL,zU,yL,yU,zi,yI,zu,yIu,
    lowSpan:rear?260:180,upSpan:rear?220:150,
    lowLength:Math.hypot(zL-zi,yL-yI),upLength:Math.hypot(zU-zu,yU-yIu),upright:Math.hypot(zU-zL,yU-yL),
    hubLocalY:100*Math.cos(angle)+(zHub-zL)*Math.sin(angle),hubLocalZ:-100*Math.sin(angle)+(zHub-zL)*Math.cos(angle)};
}
// Circle intersection: two rigid arms plus a rigid upright. The outward branch is the working assembly.
function mxLinkage(S,yl){const zl=S.zi+Math.sqrt(Math.max(0,S.lowLength*S.lowLength-(yl-S.yI)**2)),dz=S.zu-zl,dy=S.yIu-yl,d=Math.hypot(dz,dy);
  const a=(S.upright*S.upright-S.upLength*S.upLength+d*d)/(2*d),h2=S.upright*S.upright-a*a;
  if(h2<0)throw new Error('Model X DESIGN suspension exceeded linkage travel');
  const h=Math.sqrt(h2),zu=zl+a*dz/d+h*dy/d,yu=yl+a*dy/d-h*dz/d;
  return {yl,zl,yu,zu,angle:Math.atan2(zu-zl,yu-yl)};
}
function mxUpright(S,sd){const cells=[],u=mxTube([0,0,0],[0,S.upright,0],20,0x4e5962);
  for(const p of u.list())cells.push(p);
  const hub=mxBox(-30,30,S.hubLocalY-30,S.hubLocalY+30,0,sd*(S.hubLocalZ-90),0x59656e);
  for(const p of hub.list())cells.push(p);
  // DESIGN tie point shares the lower-arm swing circle: rearward at front, forward at rear.
  // This eliminates zero-input bump steer instead of stretching the tie rod.
  for(const p of mxBox(S.ax>0?-20:20,S.ax>0?-150:150,-10,10,-10,10,0x4e5962).list())cells.push(p);
  return mxGrid(cells);
}
function mxCaliper(rear,sd){const radius=rear?182.5:190,cells=[];
  const boxes=[mxBox(-radius,-radius+55,-50,50,-100,-90,0xb32a24),mxBox(-radius,-radius+55,-50,50,-60,-50,0xb32a24),
    mxBox(-radius-25,-radius-5,-50,50,-100,-50,0x92312d),mxBox(-radius,-30,-10,10,-110,-100,0x424c55)];
  for(const b of boxes)for(const [x,y,z,c] of b.list())cells.push([sd<0?-x:x,y,z,c]);return mxGrid(cells);
}
// Link template has its own QA source cells and is transformed between physical endpoints.
function mxLinkGrid(radius,color){return mxGrid(mxTube([0,0,0],[0,0,400],radius,color).list().filter(p=>p[2]>=0&&p[2]<=40));}
// Fixed-length steering/toe rod. Rack translation sets front angle; rear anchor is fixed.
function mxSteer(S,p,sd,rack){const arm=S.ax>0?-150:150,ix=S.ax>0?-260:300,iy=S.yI,zi=S.zi,point=(pose,a)=>{const y=0,z=-arm*Math.sin(a),c=Math.cos(sd*pose.angle),s=Math.sin(sd*pose.angle);return [arm*Math.cos(a),pose.yl+y*c-z*s,sd*pose.zl+y*s+z*c];};
  const neutral={yl:S.yL,zl:S.zL,angle:Math.atan2(-20,280)},v=point(neutral,0),length=Math.hypot(v[0]-ix,v[1]-iy,v[2]-sd*zi);
  // Solve the circle/rod intersection analytically; endpoint sign tests miss two-root cases.
  const c=Math.cos(sd*p.angle),s=Math.sin(sd*p.angle),dy=iy-p.yl,dz=sd*zi+rack-sd*p.zl;
  const innerY=dy*c+dz*s,innerZ=-dy*s+dz*c,y=0;
  const q=(arm*arm+ix*ix+(y-innerY)**2+innerZ*innerZ-length*length)/(2*arm*Math.hypot(ix,innerZ));
  if(Math.abs(q)>1+1e-9)throw new Error('Model X steering/toe linkage exceeded DESIGN range: axle='+S.ax+' lowerY='+p.yl+' side='+sd+' rack='+rack+' intersection='+q);
  const phi=Math.atan2(-innerZ,ix),delta=Math.acos(clampv(q,-1,1)),a=phi-delta,b=phi+delta;
  return Math.abs(a)<Math.abs(b)?a:b;
}
// Equivalent bicycle angle from the two neutral front wheel angles (cotangent mean).
function mxSteerCentre(rack){if(Math.abs(rack)<1e-8)return 0;const S=mxSuspension(false),p=mxLinkage(S,S.yL),a=mxSteer(S,p,-1,rack),b=mxSteer(S,p,1,rack);return Math.atan(2/(1/Math.tan(a)+1/Math.tan(b)));}
function mxRackForDelta(delta){let lo=-65,hi=65;for(let i=0;i<22;i++){const mid=(lo+hi)/2;if(mxSteerCentre(mid)<delta)lo=mid;else hi=mid;}return (lo+hi)/2;}

// v2 fittings (Opus, 2026-11-12). Mirror: on the front door's window corner (side_1.jpg: head from about s 1610 to 1830, 1120-1230 up), the
// VERIFIED 2271 mm span (|z| 1135), a rounded body-colour head tapering forward, the glass on its rear face. Housing shape DESIGN.
function mxMirror(sd){const cells=[],x0=640,x1=860,yc=1175,ry=55,z0=960,z1=1135,zc=(z0+z1)/2,rz=(z1-z0)/2;
  for(let x=x0;x<=x1;x+=10)for(let y=yc-ry;y<=yc+ry;y+=10)for(let z=z0;z<=z1;z+=10){const u=(x-x0)/(x1-x0),t=1-.55*Math.pow(u,2.2),v=(y-yc)/(ry*t),w=(z-zc)/(rz*(1-.25*u));
    if(v*v+w*w>1)continue;cells.push([x/10,y/10,sd*z/10,x===x0&&Math.abs(v)<.82&&Math.abs(w)<.86?0x71848c:PAINT]);}
  for(let x=810;x<=880;x+=10)for(let y=1110;y<=1150;y+=10)for(let z=880;z<=990;z+=10)cells.push([x/10,y/10,sd*z/10,0x1b2025]);   // the black base on the door, rising into the head (v2.2: slimmer, 70 x 40 mm; it read as a block)
  return [mxGrid(cells)];}
// Plaid spoiler (rear_1.jpg): a black blade along the rear glass's lower edge, stowed flush on the liftgate (s 4900-5040), inside the tail's plan. DESIGN section.
function mxSpoiler(g){const cells=[];
  for(let s=4900;s<=5040;s+=10){const x=Math.round((g.origin-s)/10);for(let z=-760;z<=760;z+=10){const y=Math.floor(g.top(s,z)/10)+1;if(Math.abs(z)>g.half(s,y*10)-30)continue;cells.push([x,y,z/10,0x1c2228]);}}
  return [mxGrid(cells)];}
// plates one cell proud of their skins: front on the lower bumper above the intake (520-630 up), leaning with the nose's face; rear on the tail (750-900)
function mxPlateF(g){const cells=[];for(let y=520;y<=630;y+=10){const s=(790-y)*.2,x=Math.floor((g.origin-s)/10)+1;for(let z=-260;z<=260;z+=10)cells.push([x,y/10,z/10,Math.abs(z)>=250||y===520||y===630?0x20262c:0xdde2e5]);}return [mxGrid(cells)];}
function mxPlateR(g){const cells=[],x=-Math.floor((g.M.L-8-g.origin)/10)-1;for(let y=740;y<=890;y+=10)for(let z=-160;z<=160;z+=10)cells.push([x,y/10,z/10,Math.abs(z)>=150||y===740||y===890?0x20262c:0xdde2e5]);return [mxGrid(cells)];}   // v2.3: low on the liftgate, just above its lower edge (owner's rear photo, rear_1.jpg)
// Plaid badge (rear_1.jpg at 1.6 mm/px): a tartan emblem, not lettering, 118 x 50 mm on the liftgate's lower right (|z| 496-614, 778-828 up). Drawn as a
// plain tartan at the 5 mm grid (no emblem artwork): a dark field with bright and maroon vertical bars crossed by thin bright horizontal lines.
// 5 mm cells, each one step proud of the liftgate's skin.
function mxBadgePlaid(g){const cells=[],W=24,H=10,z0=496,y0=828,V='DCRDDCDRDCDDDDCDRDCDDRCD',HL=[2,4,7];
  for(let r=0;r<H;r++)for(let k=0;k<W;k++){const y=y0-r*5,z=z0+k*5,col=V[k];
    let c={D:0x26282d,C:0xc3c7cc,R:0x6e2630}[col];if(HL.includes(r))c=col==='C'?0xe2e4e7:col==='R'?0xa0585f:0x9da1a7;if(k===0||k===W-1||r===0||r===H-1)c=0x8e9399;
    let x=-2600;while(x<-2300&&!g.solidAt(x/20,y/20,z/20))x+=5;x=Math.floor((x-5)/10)*10-5;cells.push([x/5,Math.round(y/5),Math.round(z/5),c]);}   // just outside the 10 mm skin cell the surface falls in
  return mxGrid(cells);}
// third brake lamp: a red strip along the raised spoiler's trailing edge (rear34_1.jpg: the lit red line on the blade). Width DESIGN
function mxChmsl(g){const cells=[],x=Math.round((g.origin-5040)/10);for(let y=1360;y<=1370;y+=10)for(let z=-250;z<=250;z+=10)cells.push([x,y/10,z/10,0x3e1a1e]);return [mxGrid(cells)];}   // v2.4: dark until it lights
// v2.3 Plaid spoiler, raised (owner's rear photo, rear_1/rear34_1, the drawing's side view rows 40-43): a blade over the rear glass's lower edge, chord
// s 4870-5030, 40-50 mm clear of the liftgate and following its crown across the car (1360 up at the centre, lower toward the ends, as in the photos),
// span |z| 600, paint on top and black under; short end plates at |z| 600-620 down to the liftgate.
function mxSpoilerUp(g){const cells=[],yb=z=>Math.round((g.top(4950,z)+45)/10)*10;
  for(let s=4870;s<=5030;s+=10){const x=Math.round((g.origin-s)/10);
    for(let z=-600;z<=600;z+=10){const b=yb(z);for(let y=b;y<=b+10;y+=10)cells.push([x,y/10,z/10,y===b+10?PAINT:0x15181c]);}
    if(s>=4900&&s<=5000)for(const sd of [-1,1])for(let az=610;az<=620;az+=10){const z=sd*az;for(let y=Math.floor(g.top(s,z)/10)*10+10;y<=yb(z)+10;y+=10)cells.push([x,y/10,z/10,0x15181c]);}}
  return [mxGrid(cells)];}
