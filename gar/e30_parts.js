/* ===== E30 PARTS. Full-res grids are 20 mm voxels; "half" grids are 10 mm (mesh scale .5). ===== */
const COL={black:0x121315,rubber:0x17181a,dgrey:0x2a2c30,grey:0x4b4f55,silver:0xaeb3ba,chrome:0xdde1e6,white:0xeeeeee,red:0xc2202a,amber:0xf09a2a,blue:0x1c69d4,clear:0xdfe8ec,
  alu:0x969ca3,iron:0x5b6168,cast:0x6a5e55,carpet:0x232427,fabric:0x2d2f34,fabric2:0x3a3d44,dash:0x26272b,trim:0x3b3d42,glass:0x5c8aa0};
const PX={'0':['111','101','101','101','111'],'1':['010','110','010','010','111'],'2':['111','001','111','100','111'],'3':['111','001','111','001','111'],'4':['101','101','111','001','001'],'5':['111','100','111','001','111'],'6':['111','100','111','101','111'],'7':['111','001','010','010','010'],'8':['111','101','111','101','111'],'9':['111','101','111','001','111'],B:['110','101','110','101','110'],M:['101','111','111','101','101'],W:['101','101','111','111','101'],E:['111','100','110','100','111'],' ':['000','000','000','000','000']};
function pixText(g,txt,x0,y0,z,fn,c){let cx=x0;for(const ch of txt){const m=PX[ch]||PX[' '];for(let r=0;r<5;r++)for(let q=0;q<3;q++)if(m[r][q]==='1')fn(g,cx+q,y0+(4-r),z,c);cx+=4;}}

/* ---------- bumpers (10 mm cells; absolute hi grids, drawn at mesh scale .5) ---------- */
/* ---- E30 1988-91 ("facelift") bumpers. e30zone wiki (Bodywork): "Following the 1988 facelift, bumpers were made of colour-coded plastic, with black plastic
   inserts on the leading face", and "all E30s left the factory with a plastic lower edge on their front valance" (the black chin spoiler); the front valance
   carries the fog lamps and (facelift) the brake-cooling ducts. Heights and set-backs MEASURED (+-15 mm) on the-blueprints.com 1990 E30 coupe drawing
   (ref/e30/bp_tb_1990*.npy, 5.83 mm/px; side, front and rear views):
   FRONT  black insert 455-542 mm on the leading face, wrapping round the corners and along the fenders to the wheel arch; body-colour top edge to 550 and
          roll-under 430-455; valance (body colour) 345-430 mm, set back 100-115 mm, with the fog lamps (lens 150 x 60 mm, centre 560 mm off the centreline,
          370-430 mm high, in a black 190 x 100 mm bezel), the brake-cooling ducts (345-455 mm off centre) and the radiator intake (540 mm wide); black chin
          spoiler 245-345 mm, 115 mm behind the tip at its top and 160 mm at its bottom edge, wrapping round the corners and along the fenders to the arches;
          indicators in the ends of the insert (150 x 40 mm, 500-650 mm off centre, 485-525 mm high). Body-colour apron 550-590 mm under the headlamps,
          flush with the nose face.
   REAR   black insert 455-542 mm, body-colour top edge to 552, wrapping along the quarter panels to the arches; body-colour lower part 340-455 mm whose face
          falls back from 60 to 120 mm ahead of the tip (the drawing's side view shows 85-150 mm, the user's photograph less: ESTIMATED between the two);
          valance 260-340 mm rolling under; exhaust cut-out in the left of the valance (user's photograph, ESTIMATED).
   Plan: the face bows back 26 mm at 720 mm off centre and rounds into the side with a 140 mm (front) / 180 mm (rear) radius (DESIGN from photographs).
   Tips 4326 mm apart (1990-91 coupe, VERIFIED). ---- */
const BUMPER_BLACK=0x2e3035,LIP_BLACK=0x1e2023,BUMPER_IN=0x2a2b2e,BUMPER_UNDER=0x1a1b1e;   // satin black plastic reads dark grey in daylight; the chin spoiler is a darker, harder plastic
// set-back of a rounded edge of radius r: a top edge (dir 1) or a bottom edge (dir -1) at height e
function rollIn(y,e,r,dir){const q=Math.min(r,dir>0?y-(e-r):(e+r)-y);return q>0?r-Math.sqrt(Math.max(0,r*r-q*q)):0;}
// plan: the face bows back toward the ends and rounds into the side with radius Rc (99 = past the side)
function planBack(az,W,Rc,bow){let b=bow*(az/36)*(az/36);const d=az-(W-Rc);if(d>0){if(d>=Rc)return 99;b+=Rc-Math.sqrt(Rc*Rc-d*d);}return b;}
function snapFace(f,sg){return sg>0?Math.floor((f+.25)*2+1e-9)/2:Math.ceil((f-.25)*2-1e-9)/2;}   // centre of the outermost 10 mm cell of a face at f
const BF={sgn:1,x0:108.5,top:27.5,ins:[22.75,27.1],val:21.5,lip:17.25,bot:12.25,apron:29.25,Rc:7,RcV:6,bow:1.3,depth:9.5,wrapTo:80};
const bfBarW=y=>halfAt(94,Math.max(y,21.5))+1.0, bfValW=y=>halfAt(98.5,Math.max(y,12))+.15;
function bfZone(y){const B=BF;return y>B.top+.01?(y<=B.apron+.01?'apron':null):y>=B.val-.01?'bar':y>=B.lip-.01?'val':y>=B.bot-.01?'lip':null;}
// set-back of the front bumper's outer face from the tip at height y and lateral distance az
function bfBack(y,az){const B=BF,z=bfZone(y);
  if(z==='bar')return rollIn(y,B.top,1.2,1)+rollIn(y,B.val,1.25,-1)+planBack(az,bfBarW(y),B.Rc,B.bow);
  if(z==='val')return 5.0+(B.val-y)/(B.val-B.lip)*.6+planBack(az,bfValW(y),B.RcV,B.bow);
  if(z==='lip')return 5.75+(B.lip-y)/(B.lip-B.bot)*2.25+planBack(az,bfValW(y)+.35,B.RcV,B.bow);
  if(z==='apron')return B.x0-noseX(az);
  return 99;}
function bfFaceX(y,az){return snapFace(BF.x0-bfBack(y,az),1);}
const bumperFaceX=(B,y,az)=>bfFaceX(y,az);                                  // (kept for callers of the old signature)
function bfSolid(x,y,z){const B=BF,az=Math.abs(z),zn=bfZone(y);if(!zn)return false;const b=B.x0-x;
  const yy=Math.max(y,10.5),hz=halfAt(x,yy)+archLip(x,yy),onBody=x<=NOSE_X-6.4+.01;      // behind x 98.6 the fender skin comes down to the sill
  if((onBody&&az<=hz)||bodySolid(x,y,z))return false;if(Math.hypot(x-ARCH_F.x,y-ARCH_F.y)<ARCH_F.r+1)return false;
  if(zn==='apron')return !onBody&&b<=B.depth&&x<=noseX(az)+1e-6&&az<=halfAt(Math.min(x,NOSE_X),29.6);
  if(onBody){if(x<B.wrapTo)return false;                                 // along the fender, outside its skin, to the arch:
    if(zn==='bar')return az<=Math.max(bfBarW(y),hz+1.0);                    //   the bar's side wrap (20 mm proud at least)
    if(zn==='lip')return az<=hz+1.0;                                        //   the chin spoiler's wing
    return false;}
  const f=bfBack(y,az);if(b<f-.25)return false;
  if(zn==='bar')return az<=bfBarW(y)&&b<=B.depth;
  if(zn==='val')return az<=bfValW(y)&&b<=B.depth;
  const W=bfValW(y)+.35;                                                    // chin spoiler: a 30 mm plate under the valance and a side plate round the corner
  return az<=W&&(b<=f+1.5||az>W-1.0);}
function bumperFront(){
  const B=BF,g=hgrid(78,110,12,30,-44,44);
  fillW(g,null,(x,y,z)=>bfSolid(x,y,z)?1:-1);
  shellHi(g,(x,y,z,inner)=>{if(inner)return BUMPER_IN;const zn=bfZone(y);if(zn==='lip')return LIP_BLACK;if(zn==='bar'&&y>=B.ins[0]-.01&&y<=B.ins[1]+.01)return BUMPER_BLACK;return PAINT;},2);
  const vf=(y,az)=>B.x0-bfBack(y,az);                                       // valance face x
  carveW(g,null,(x,y,z)=>{const az=Math.abs(z);if(y<17.74||y>21.01)return false;                                  // radiator intake (540 mm) and brake-cooling ducts, two cells deep
    return (az<=13.5||(az>=17&&az<=22.75&&y>=19.24))&&x>=vf(y,az)-1.01;});
  fillW(g,[96,110,17.5,21.5,-14,14],(x,y,z)=>{const az=Math.abs(z);if(az>13.5)return -1;if(!(Math.abs(y-18.5)<.01||Math.abs(y-19.75)<.01))return -1;   // two black slats across the intake
    const f=vf(y,az);return (x>=f-1.6&&x<=f-1.4)?0x111214:-1;});
  for(const L of frontLamps())for(const [I,J,K] of L.cells())for(let i=I;i<=I+6;i++)g.set(i,J,K,-1);   // each lamp sits in a pocket: nothing of the bumper stands in front of its lens
  return g;
}
/* ---- rear ---- */
const RR={sgn:-1,x0:-107.7,top:27.6,ins:[22.75,27.1],lo:17.0,bot:13.0,Rc:9,bow:1,wrapTo:-76,depthA:4.5,sideDepth:2.6,cutZ:[-17.5,-9.5],cutTop:15.5};
function rrW(y){return halfAt(-96,Math.max(y,26))+.8-(y<RR.ins[0]?.7:0);}
function rrBack(y){const R=RR;
  if(y>=R.ins[0]-.01)return rollIn(y,R.top,1.0,1)+rollIn(y,R.ins[0],.9,-1);
  if(y>=R.lo-.01)return 3.0+(R.ins[0]-y)/(R.ins[0]-R.lo)*3.0;
  return 6.0+rollIn(y,R.bot,1.5,-1);}
function rrFaceX(y,az){return RR.x0+rrBack(y)+planBack(az,rrW(y),RR.Rc,RR.bow);}
function bumperRear(){
  const R=RR,g=hgrid(-108.5,-74,12.5,28,-44,44);
  fillW(g,null,(x,y,z)=>{
    if(y<R.bot-.01||y>R.top+.01||x>R.wrapTo)return -1;
    const az=Math.abs(z),W=rrW(y),yy=Math.max(y,10.5),hz=halfAt(x,yy)+archLip(x,yy);
    const bar=y>=R.ins[0]-.01,Ws=bar?Math.max(W,hz+1.0):W;if(az>Ws)return -1;   // the insert band stands 20 mm proud of the quarter panel all the way to the arch
    const fx=rrFaceX(y,Math.min(az,W-.01));if(x<fx-.25)return -1;
    if(x>fx+R.depthA&&az<Ws-R.sideDepth)return -1;                          // hollow behind the face; the side wall is a plate along the quarter panel
    return 1;});
  shellHi(g,(x,y,z,inner)=>inner?BUMPER_IN:(y<R.bot+.6?BUMPER_UNDER:(y>=R.ins[0]-.01&&y<=R.ins[1]+.01?BUMPER_BLACK:PAINT)),2);
  carveW(g,null,(x,y,z)=>z>=R.cutZ[0]&&z<=R.cutZ[1]&&y<=R.cutTop);          // exhaust cut-out in the valance, car's left (-z)
  eachCell(g,null,(i,j,k,n)=>{if(g.d[n]<0)return;const x=i/HR,y=j/HR,z=k/HR,az=Math.abs(z),yy=Math.max(y,10.5),hz=halfAt(x,yy)+archLip(x,yy);
    if(Math.hypot(x-ARCH_RR.x,y-ARCH_RR.y)<ARCH_RR.r+1||bodySolid(x,y,z))g.d[n]=-1;});   // nothing inside the wheelhouse or the body panels
  return g;
}
const BUMPER={F:BF,R:RR};
const hiToCoarse=g=>coarsen(g,3,[-110,110,0,72,-46,46]);
function buildBumperF(){return hiToCoarse(bumperFront());}       // 20 mm views for collision and fitting
function buildBumperR(){return hiToCoarse(bumperRear());}
/* ---------- front indicators and fog lamps, set into recesses in the bumper ----------
   Indicators: amber lenses in the ends of the black insert, flush with its face, 150 x 40 mm, 500-650 mm off centre, 485-525 mm high (1990 drawing, MEASURED).
   Fog lamps: in the valance, lens 150 x 60 mm centred 560 mm off the centreline and 400 mm high, in a black 190 x 100 mm bezel (1990 drawing, MEASURED);
   optional equipment on the 325i (DECLARED). The lens positions come from the bumper's own face (bfFaceX), so each lens is flush at any bow. */
function frontLamps(){
  const L=[];
  for(const sd of [-1,1]){
    {const zc=28.75,fx=bfFaceX(25.25,zc),pos=[fx-1,24.5,sd*zc];
     L.push({kind:'indicator',sd,pos,
      lens:()=>{const g=new Grid(0,2,0,3,-7,7);g.fill((x,y,z)=>x>=1?(x===2?0xf3a530:0xc9781a):0x2a2c30);return g;},
      cells:()=>{const g=new Grid(0,2,0,3,-7,7);g.fill(()=>1);return g.list().map(([x,y,z])=>[Math.round(pos[0]*2)+x,Math.round(pos[1]*2)+y,Math.round(pos[2]*2)+z]);}});}
    {const yc=20,zc=28,fx=bfFaceX(yc,zc),pos=[fx-1.5,yc,sd*zc];
     const inRect=(y,z,m)=>Math.abs(z)<=7.5+m&&Math.abs(y)<=2.9+m;
     L.push({kind:'fog',sd,pos,
      lens:()=>{const g=new Grid(0,3,-5,5,-10,10);g.fill((x,y,z)=>{if(!inRect(y,z,2))return -1;if(!inRect(y,z,0))return 0x0e0f10;if(x===3)return (Math.abs(z)>6.4||Math.abs(y)>1.9)?COL.chrome:0xe6ecef;if(x===2)return 0xb9c3c9;return 0x1b1c1e;});return g;},
      cells:()=>{const out=[];for(let x=0;x<=3;x++)for(let y=-5;y<=5;y++)for(let z=-10;z<=10;z++)if(inRect(y,z,2))out.push([Math.round(pos[0]*2)+x,Math.round(pos[1]*2)+y,Math.round(pos[2]*2)+z]);return out;}});}
  }
  return L;
}
/* ---------- lamps (half res; x = front/back depth) ---------- */
/* E30 headlamps: a black surround with two round lamps per side (quad round headlamps), set under the hood lip with the lens face flush with the
   kidney grille faces and the surround wrapping round the nose corner (its face follows the body outline noseX), 60 mm deep. The bumper stands proud of
   them, as on the car. Lamp size 150 mm and spacing are ESTIMATED from photographs; the layout (two round lamps each side) is the E30's.
   Half-res grid, local to HEAD_POS (z mirrored per side); cell x index = hi index - 2*HEAD_POS[0]. */
function buildHeadlamp(sd){
  sd=sd||1;const O=[HEAD_POS[0],30.5,sd*27],g=new Grid(-4,16,-1,17,-24,24);
  const lamps=[[20.5,34.3],[30.5,34.3]],R=3.6;                                      // centres (|z|, y) and radius in world units
  for(let i=-4;i<=16;i++)for(let j=-1;j<=17;j++)for(let k=-24;k<=24;k++){
    const wx=O[0]+i*.5,wy=O[1]+j*.5,wz=O[2]+k*.5,az=Math.abs(wz);
    if(az<15.8||az>37.2||wy<30.5||wy>38.1)continue;
    const cy=Math.min(Math.max(wy,31.4),37.2),cz=Math.min(Math.max(az,16.7),36.1);if(Math.hypot(wy-cy,az-cz)>.95)continue;   // rounded corners on the surround
    const fx=noseX(az);if(wx>fx+1e-6||wx<fx-3.1)continue;                           // the lens face is the body outline itself: flush all the way round the corner
    let rl=1e9;for(const [lz,ly] of lamps)rl=Math.min(rl,Math.hypot(az-lz,wy-ly));
    const front=wx>fx-.51;
    let c;
    if(rl<=R){c=front?(rl>R-.6?COL.chrome:(rl<1.1?0xe9eef1:0xcfd8de)):(rl<R-.6&&wx>fx-1.01?0xaeb4ba:COL.black);}   // chrome ring, clear lens with a brighter centre, reflector behind
    else c=front&&wx>fx-.51?0x141517:COL.black;                                                                          // black surround
    g.set(i,j,k,c);}
  return g;
}
function buildKidney(){
  const g=new Grid(0,6,0,17,-14,14);
  g.fill((x,y,z)=>{
    const az=Math.abs(z);if(az>13)return -1;
    const top=15-(az>9?(az-9)*1.2:0),bot=(az>9?(az-9)*1.0:0);   // top at y 37.9, under the hood's front edge
    if(y>top-.5||y<bot)return -1;
    const edge=az>=12||y>=top-1.5||y<=bot+1;
    if(x>=4)return edge?COL.chrome:(az%2===0?COL.black:0x24262a);
    return COL.black;});
  return g;
}
/* TAIL LAMP (late 1988-91 lamps), from photographs of real cars: a 1990 325i coupe (Commons "1990 BMW 325i Coupe in Sterling Silver Metallic, Rear Right"),
   a 1989 316i coupe (Commons "BMW E30 rear 20080409") and a 1991 coupe (Commons "BMW 3 Series E30 V8 (7155523414)"). One long, low lamp per side between the plate
   recess and the quarter corner: 165 mm tall including its black housing border (the photographs give a width to height of 2.7 to 3.2 for the 475 mm lamp; the
   earlier 240 mm lamp read from one photograph made the rear look square), its top on the trunk lid's lower edge (790 mm), so the lid's own rear face (roundel, model
   badge) stands 115 mm above it. Layout seen from behind, inner to outer: a wide inner column (red, with the white reverse lens in the middle row), two narrower red
   columns, and the full-height amber indicator, whose inner edge lines up with the trunk lid's side edge; three equal rows with thin bright ridges between them,
   darker dividers between the columns; the face follows the body corner (rearX). Proportions MEASURED from the photographs (column widths 1.25 : 1 : 1 : 0.95).
   Half-res grid, local to TAIL_POS (z mirrored per side); cell x index = hi index - 2*TAIL_POS[0]. */
const TAIL_POS=[REAR_X+.1,30.5,27];   // the lamp's lower edge 610 mm up (180 mm tall, its top at the lid's lower edge, 790 mm), 50 mm of body colour under it to the bumper
function buildTaillamp(sd){
  // MEASURED from a square-on photograph of a 1990 318i's lamp (Wikimedia Commons, 1990-BMW318i-E30-rear-light): lens 476 x 180 mm (2.64 : 1), columns from the
  // inner end 143 : 117 : 119 : 97 mm (white reverse in the inner column's middle row, amber outer column), rows 70 : 74 : 80 (top to bottom), thin dark lines
  // between the segments, the outer corners tight (15-20 mm) where the lens wraps round the body's corner
  sd=sd||1;const NY=17,D=()=>new Grid(0,16,0,NY,-24,24),g=D(),red=D(),amb=D(),wht=D();
  const TRIM=0x1c0c0e,DIV=0x3a0b10,LO=14.6,HI=38.4,AM=33.55,C1=21.75,C2=27.6;   // column edges (distance from the centreline)
  const ROWS=[[1,5],[7,11],[13,16]];                                                // bottom, middle, top rows (cells); rows 6 and 12 are the lines between them
  for(let z=-24;z<=24;z++){const az=TAIL_POS[2]+sd*z*.5;if(az<LO||az>HI)continue;   // az = distance from the centreline, per side
    const iOut=Math.ceil(2*rearX(az)-1e-9)-Math.round(2*TAIL_POS[0]);               // lens face cell for this column (follows the corner)
    const col=az>=AM?3:(az>=C2?2:(az>=C1?1:0)),vdiv=(Math.abs(az-C1)<.25||Math.abs(az-C2)<.25||Math.abs(az-AM)<.25);   // col 0 inner (widest), 1, 2 red; 3 amber (outer)
    // the outer end, where the lens wraps round the body's corner: tight corners (photograph), 15 mm at the bottom, 20 mm at the top (cell units)
    const E=(HI-az)*2+.5,RB=1.5,RT=2;
    for(let y=0;y<=NY;y++){const Y=y+.5,YT=NY+1-Y;let rc=-1;
      if(E<RB&&Y<RB)rc=RB-Math.hypot(RB-E,RB-Y);else if(E<RT&&YT<RT)rc=RT-Math.hypot(RT-E,RT-YT);   // rc: distance inside the corner's arc (cells), -1 = not in a corner
      if(rc!==-1&&rc<0)continue;                                                       // outside the rounded corner: the panel stays there
    for(let d=0;d<=8;d++){const x=iOut+d;
      if(x<0||x>16)continue;
      // never outside the body's side (the quarter leans in toward the shoulder, so near the lamp's top its outer end would stand out of the side); where the
      // lamp meets the side skin the lens wraps round the corner onto it for 50 mm (photographs), then the quarter panel's own skin carries on
      const hw=halfAt(TAIL_POS[0]+x*.5,TAIL_POS[1]+y*.5);if(az>hw)continue;const sideX=az+.5>hw,WRAP=5;
      if(sideX&&d>WRAP)continue;
      if(d>=3&&!sideX){g.set(x,y,z,COL.black);continue;}                              // housing behind the lens
      const edge=y===0||y===NY||az<LO+.5||(rc!==-1&&rc<1)||(sideX&&d===WRAP);
      if(edge){g.set(x,y,z,TRIM);continue;}                                           // black housing border, flush with the lens
      const row=ROWS.findIndex(([a,b])=>y>=a&&y<=b),hdiv=row<0,rib=(y%2)?0:1;
      if(vdiv&&!hdiv){g.set(x,y,z,DIV);continue;}                                     // thin dark dividers between the columns
      if(col===3){amb.set(x,y,z,hdiv?0x9a5512:(rib?0xf2a12e:0xe39326));continue;}     // amber indicator, full height, outer column (darker line between its segments)
      if(col===0&&row===1){wht.set(x,y,z,rib?0xe9eef1:0xd7dfe3);continue;}            // white reverse lens, middle row of the inner column
      red.set(x,y,z,hdiv?0x5e0a10:(rib?0xb6151f:0xa2111a));}}}                        // red tail / brake; a lighter ridge between the rows (a 3 mm ridge drawn 10 mm wide: kept close to the lens colour)
  return {frame:g,red,amb,wht};
}
function buildPlate(front){
  const g=new Grid(0,1,0,11,-27,27);
  g.fill((x,y,z)=>{const az=Math.abs(z);if(az>26||y>10)return -1;return (az>=25||y<=0||y>=10)?0x20262c:COL.white;});
  pixText(g,front?'M20 325':'BMW E30',-13,3,1,(G,a,b,c,col)=>front?G.set(1,b,-a,col):G.set(0,b,a,col),0x1a1c20);
  return g;
}
function roundel(r){          // half-res disc in the y-z plane (normal = +x), radius r
  const g=new Grid(0,1,-r-1,r+1,-r-1,r+1);
  g.fill((x,y,z)=>{const d=Math.hypot(y,z);if(d>r)return -1;if(d>r-1)return 0x111214;
    return ((y>=0)!==(z>=0))?COL.white:COL.blue;});
  return g;
}
function roundelTop(r){       // disc lying flat (normal = +y)
  const g=new Grid(-r-1,r+1,0,1,-r-1,r+1);
  g.fill((x,y,z)=>{const d=Math.hypot(x,z);if(d>r)return -1;if(d>r-1)return 0x111214;return ((x>=0)!==(z>=0))?COL.white:COL.blue;});
  return g;
}
/* ---------- mirrors / handles ---------- */
function buildMirror(){
  const g=new Grid(0,8,0,6,0,10);
  g.fill((x,y,z)=>{if(x>=1&&x<=7&&y<=5&&z<=9){return z>=8?COL.black:PAINT;}if(x<=2&&y<=2&&z<=3)return COL.black;return -1;});
  g.carve((x,y,z)=>x>=1&&x<=7&&y>=1&&y<=4&&z>=8);
  const gl=new Grid(0,8,0,6,0,10);gl.fill((x,y,z)=>(x>=2&&x<=6&&y>=1&&y<=4&&z===8)?0x9bb4c0:-1);
  return {shell:g,glass:gl};
}
function buildHandle(){const g=new Grid(0,2,0,2,0,7);g.fill((x,y,z)=>z>=1&&z<=6?(z===6&&y===1&&x===2?COL.chrome:0x17181b):(z===0?COL.black:-1));return g;}   // black pull handle with a chrome lock cylinder (E30)

/* ---------- wheels ---------- */
function ringPattern(style,r,a){
  // returns true where the wheel face has metal; r in half-voxels, a in radians
  if(r<5.5||r>17.6)return false;
  if(style==='mesh'){
    const k=Math.abs(Math.sin(a*14+r*.62)),m=Math.abs(Math.sin(a*14-r*.62));
    return k<.34||m<.34||r<7.2||r>16.2;
  }
  if(style==='star'){
    const w=(Math.PI/5)*(0.46-0.18*((r-5.5)/12)),f=((a%(Math.PI*2/5))+Math.PI*2/5)%(Math.PI*2/5)-Math.PI/5;
    return Math.abs(f)<w||r<7||r>16.4;
  }
  const holes=(r>9.5&&r<14.5)&&Math.abs(((a%(Math.PI/4))+Math.PI/4)%(Math.PI/4)-Math.PI/8)<.20;   // 'dish' with 8 slots
  return !holes;
}
function buildTire(){
  const g=new Grid(-31,31,-31,31,-10,10);
  g.fill((x,y,z)=>{
    const r=Math.hypot(x,y),az=Math.abs(z);
    const ro=30-Math.max(0,az-7)*1.35;
    if(r>ro||r<18.4)return -1;
    const a=Math.atan2(y,x);
    if(r>=ro-1.4){                                     // tread
      if(az<=.5||(az>=4&&az<=4.6))return 0x07080a;
      return (Math.floor(a*20/Math.PI+(az>4?.5:0))&1)?0x1c1d20:0x121315;
    }
    if(az>=8.4&&((r>24.4&&r<25.2)||(r>21.2&&r<21.8)))return 0x2c2d30;
    if(az>=9.4&&r>22.4&&r<23.6&&((Math.floor(a*9)%3)!==0))return 0x3d3e41;   // sidewall lettering ring
    return 0x0e0f11;});
  return g;
}
function buildRim(style){
  const g=new Grid(-21,21,-21,21,-9,10);
  g.fill((x,y,z)=>{
    const r=Math.hypot(x,y),a=Math.atan2(y,x);
    if(r>20.6)return -1;
    if(r>=17&&r<=18.6&&z>=-8&&z<=8)return 0x8d9298;                 // barrel
    if(r>=18.6&&r<=20.4&&(Math.abs(z)>=8&&Math.abs(z)<=9.4))return COL.chrome; // lips
    if(z>=5.5&&z<=7.4&&r<18.6&&ringPattern(style,r,a)){
      if(r<7.2)return 0x2a2c2f;
      return (z>=7)?0xcfd4da:0x80858c;}
    if(z>=4&&z<=9&&r<=4.8){                                         // hub + lug bolts
      if(r<=2.2&&z>=8)return ((x>=0)!==(y>=0))?COL.white:COL.blue;
      for(let i=0;i<4;i++){const q=i*Math.PI/2+Math.PI/4;if(Math.hypot(x-3.4*Math.cos(q),y-3.4*Math.sin(q))<=.95&&z>=8)return COL.chrome;}
      return 0x3a3d42;}
    return -1;});
  return g;
}
function buildRotor(){
  const g=new Grid(-16,16,-16,16,-7,-1);
  g.fill((x,y,zz)=>{const z=-zz,r=Math.hypot(x,y);
    if(z>=2.5&&z<=4.5&&r>=7.6&&r<=14.8){return ((Math.floor(Math.atan2(y,x)*12/Math.PI)&1)&&r>9&&r<14)?0x8f949a:0xa6abb1;}
    if(z>=3&&z<=6.5&&r<=7.6)return 0x6a6e75;
    return -1;});
  return g;
}
function buildCaliper(){
  const g=new Grid(-18,18,-18,18,1,8);
  g.fill((x,y,z)=>{const r=Math.hypot(x,y),a=Math.atan2(y,x);
    if(r>=9&&r<=15.8&&Math.abs(Math.abs(a)-Math.PI)<.45&&z>=1&&z<=7)return (z===7||r>15)?0x8e9399:0xb9bec5;
    return -1;});
  return g;
}
/* ---------- suspension bits (full res) ---------- */
function buildArm(len){const g=new Grid(0,2,0,2,0,len);g.fill((x,y,z)=>(x<=1&&y<=1)?COL.dgrey:-1);return g;}
function buildStrutTube(len){const g=new Grid(-3,3,0,len,-3,3);g.fill((x,y,z)=>{const r=Math.hypot(x,z);if(y<len*.45&&r<=1.9)return 0x3b3f45;if(y>=len*.45&&r<=.9)return COL.chrome;return -1;});return g;}
function buildSpring(len,rad,col){col=col||0xc4261f;const g=new Grid(-5,5,0,len+1,-5,5);for(let t=0;t<=1;t+=.0015){const a=7*Math.PI*2*t,y=Math.round(len*t),px=Math.round(rad*Math.cos(a)),pz=Math.round(rad*Math.sin(a));g.set(px,y,pz,col);g.set(px,y+1,pz,col);}return g;}
function buildRod(){const g=new Grid(0,0,0,0,0,10);g.fill(()=>0x2b2e33);return g;}
function buildShaft(){const g=new Grid(-84,0,-3,3,-3,3);g.fill((x,y,z)=>{const r=Math.hypot(y,z);if(r>2.2)return -1;return (Math.floor(x/4)&1)?0x30343a:0x8d9298;});return g;}
function buildExhaust(){
  const g=new Grid(-109,40,2,24,0,24);
  segFill(g,[24,14,5.5],[AX_R,14,5.5],2,0x7a7f86);segFill(g,[AX_R,14,5.5],[AX_R-8,7,10],2,0x7a7f86);segFill(g,[AX_R-8,7,10],[-74,7,12],2,0x7a7f86);
  box(g,-92,-72,5,9,6,18,0x6c7178);box(g,-93,-92,5,9,7,17,0x5a5f66);
  segFill(g,[-92,7,13],[-108,7,13],1.9,COL.chrome);
  return g;
}
function buildDiff(){
  const g=new Grid(AX_R-8,AX_R+8,8,24,-18,18);
  cylX(g,14.5,0,6.5,AX_R-6,AX_R+6,0x6d7279);box(g,AX_R-5,AX_R+5,10.5,18.5,-8,8,0x565b61);
  segFill(g,[AX_R,14.5,-6],[AX_R,14.5,-31],1.6,0x4b4f55);segFill(g,[AX_R,14.5,6],[AX_R,14.5,31],1.6,0x4b4f55);
  return g;
}

/* ---------- M20B25 engine bay (half res, local x forward, origin = rear/bottom) ---------- */
function buildEngine(){
  const g=new Grid(-60,86,0,60,-56,56);
  box(g,8,60,0,8,-14,14,0x4a4f55);                         // oil pan
  box(g,4,70,8,34,-19,19,COL.iron);                         // block
  for(let i=0;i<6;i++)box(g,6+i*10,6+i*10,9,33,-19,-19,0x4a4f55); // cylinder-jug lines (visual ribs)
  box(g,6,68,34,48,-17,17,0x8c9298);                        // head
  box(g,10,64,48,52,-12,12,0xb4b8be);                       // valve cover
  for(let x=12;x<=62;x+=5)box(g,x,x,52,52,-12,12,0xd7dade);  // cover ribs
  box(g,66,74,8,46,-12,12,COL.black);                       // timing cover
  cylY(g,5,0,5,40,53,COL.black);box(g,4,6,46,50,-4,6,0x8a2c1c); // distributor
  /* intake (left, -z) */
  box(g,10,64,40,50,-32,-24,0x3d4046);
  for(let i=0;i<6;i++)segFill(g,[14+i*9.4,42,-17],[14+i*9.4,45,-26],2.2,0x50545a);
  box(g,44,62,40,54,-44,-34,COL.black);                      // air-flow meter
  box(g,30,76,16,40,-54,-38,0x1c1d20);                       // airbox
  segFill(g,[58,48,-36],[44,46,-28],3,0x1b1c1e);            // rubber bellows
  /* exhaust (right, +z) */
  for(let i=0;i<6;i++)segFill(g,[14+i*9.4,36,17],[14+i*9.4,33,24],2.1,COL.cast);
  segFill(g,[10,33,24],[66,33,24],3.4,COL.cast);
  segFill(g,[10,33,24],[8,10,24],3.4,COL.cast);
  /* alternator + belt run */
  cylX(g,24,26,5,58,68,0x70757c);
  /* spark plug leads */
  for(let i=0;i<6;i++)segFill(g,[14+i*9.4,50,12],[6,52,6],.7,0x0e0f10);
  /* power-steering reservoir / oil filter */
  cylY(g,30,17,3,34,44,0x8a1d1a);cylX(g,16,19,3.5,30,38,0x2b6aa8);
  return g;
}
function buildPulley(){const g=new Grid(0,6,-10,10,-10,10);g.fill((x,y,z)=>{const r=Math.hypot(y,z);if(r>9)return -1;if(x<=1)return r<=9?0x2b2d31:-1;if(x>=2&&x<=4)return (r>=6.5)?0x41454b:(r<=3?0x8d9298:-1);return r<=3?0x8d9298:-1;});
  for(let i=0;i<8;i++){}
  g.set(2,9,0,COL.white);g.set(2,8,0,COL.white);g.set(2,7,0,COL.white);return g;}
function buildFan(tip){tip=tip||18.5;const g=new Grid(0,5,-19,19,-19,19);   // tip: blade-tip radius in 10 mm cells (default 370 mm fan)
  g.fill((x,y,z)=>{const r=Math.hypot(y,z),a=Math.atan2(z,y);if(r<=6&&x<=3)return 0x3a3d42;if(r>6&&r<=tip&&x>=Math.round(1+Math.sin(a*6)*1.2)&&x<=Math.round(1+Math.sin(a*6)*1.2)+1&&Math.abs(Math.sin(a*3))>.12)return 0x1b1c1e;return -1;});
  return g;}
function buildBay(opts){
  opts=opts||{};const rs=opts.radShift||0;   // swap kits move a slimline radiator forward and drop the mechanical fan
  const g=new Grid(40,100,10,50,-30,30);
  box(g,93+rs,94+rs,16,33,-25,25,0x2a2d31);                   // radiator core (kept inside the engine bay)
  for(let z=-25;z<=25;z+=2)box(g,95+rs,95+rs,17,32,z,z,0x4b5057);  // fins
  if(!rs)box(g,96,97,14,33,-27,27,0x16171a);                  // radiator support (top below the hood panel)
  if(!opts.relocate){box(g,80,90,13,22,22,28,0x15161a);box(g,82,83,22,23,23,24,COL.red);box(g,87,88,22,23,23,24,COL.black);} // battery (the LS kit relocates it to the trunk)
  const zi=opts.notch?25:22;for(const s of [-1,1]){box(g,AX_F-10.5,AX_F-0.5,30,38,s*zi,s*28.3,0x34363b);box(g,AX_F-6.5,AX_F-2.5,38,39,s*Math.max(24,zi+1),s*26,COL.chrome);}  // strut towers (top kept under the hood; notched on the inside for the LS kit)
  cylX(g,36,-20,4.5,45,52,0x1b1c1e);cylX(g,36,-20,2,52,56,0x7a7f86);    // brake booster + master cylinder (driver side, outboard of the engine)
  if(!opts.relocate)box(g,AX_F+1,AX_F+9,14,22,21,27,0x2a6aa8);        // washer bottle (right side, clear of the air box; relocated with the battery for the LS kit)
  return g;
}

/* ---------- interior (full res, world coords) ----------
   COCKPIT holds every seating and control position, so the seats, wheel, pedals, shifter and camera agree.
   Front hip point (H-point) from the published front headroom 37.0 in and legroom 39.0 in (iSeeCars, 1987 3 Series):
   SAE H61 headroom = H-point to headliner along a line 8 deg back from vertical + 102 mm -> 940 - 102 = 838 mm -> 41.9 voxels below the 67.5 headliner -> y 26.
   SAE L34 legroom = ankle pivot to H-point + 254 mm -> about 737 mm from the ankle on the accelerator -> x -6 with the pedals at x 33. (CALCULATED from VERIFIED-source figures)
   Everything else (back angles, seat sizes, rear seat) is DESIGN, checked by the occupant tests. */
const COCKPIT={
  H:{x:-6,y:26,z:20.5},back:25,                      // front seats: H-point, lateral centre 410 mm off the car centreline (driver at -z; DESIGN: the seat fits between the transmission tunnel and the door card), back angle in degrees
  rearH:{x:-41.5,y:24},rearBack:24,                 // rear bench H-point (DESIGN: set by rear knee room behind the front seats)
  wheel:{x:14,y:45.5,z:-20.5,n:[-0.906,0.423,0]},     // steering wheel centre and its axis (toward the driver)
  pedalX:33,pedals:[['clutch',-26.5],['brake',-20.5],['gas',-14.5]],
  shifter:{x:15,y:25},eye:{x:-17.4,y:55.9,z:-20.5}    // eye = H + 33 voxels along the 25 deg torso line + 2.5 forward for neck flexion
};
function buildInterior(opts){
  const g=new Grid(-60,46,10,52,-40,40);
  for(const sd of [-1,1])box(g,-58,40,11,12,sd*9,sd*34,COL.carpet);   // floor carpet (the tunnel is part of the body)
  box(g,-6,5,25,26,-4,4,0x2a2b2f);                                     // rear console section between the seats (handbrake)
  box(g,6,17,25,29,-5,5,0x2a2b2f);                                     // shift console: its top (y 29.5) is flush with the tunnel hump in front of it
  for(let x=18;x<=30;x++)for(let y=25;y<=32;y++)if(x>=18.5+(y-25)*1.15)for(let z=-6;z<=6;z++)g.set(x,y,z,0x2a2b2f);   // lower centre console: slopes from the tunnel up to the centre stack
  // dashboard (ends stop inboard of the door cards)
  g.fill((x,y,z)=>{
    if(x<27||x>43||Math.abs(z)>33)return -1;
    const top=44.6-(x-27)*.15+(x>36?-(x-36)*.9:0);
    if(y>top||y<33)return -1;
    return x>=39?0x1c1d20:COL.dash;});
  // instrument binnacle on the driver's centreline
  box(g,26,32,43,49,-30,-11,0x1d1e21);
  // centre stack
  box(g,30,40,33,44,-8,8,0x30333a);box(g,31,33,38,41,-6,6,0x131416);
  for(let z=-5;z<=5;z+=3)box(g,31,32,35,36,z,z,0x9aa0a8);
  // steering column from the wheel hub into the dash, along the wheel axis
  {const w=COCKPIT.wheel,n=w.n;segFill(g,[w.x-n[0]*1.6,w.y-n[1]*1.6,w.z],[w.x-n[0]*14,w.y-n[1]*14,w.z],1.5,COL.dash);}
  // parcel shelf: from the rear backrest top back to the rear window
  {const rh=COCKPIT.rearH,t=Math.tan(COCKPIT.rearBack*Math.PI/180),xt=Math.round(rh.x-6-(45-20)*t)-4;box(g,-60,xt,45,45,-30,30,0x2a2b2f);}
  if(opts&&opts.cage){const d2=(p,a,b)=>{const ab=[b[0]-a[0],b[1]-a[1]],ap=[p[0]-a[0],p[1]-a[1]],t=Math.max(0,Math.min(1,(ap[0]*ab[0]+ap[1]*ab[1])/(ab[0]**2+ab[1]**2)));return Math.hypot(p[0]-a[0]-ab[0]*t,p[1]-a[1]-ab[1]*t);};
    g.carve((x,y,z)=>CAGE_FRONT.some(([a,b])=>d2([x,y],a,b)<1.8&&Math.abs(Math.abs(z)-(a[2]+(b[2]-a[2])*Math.max(0,Math.min(1,(y-a[1])/(b[1]-a[1])))))<1.8));}   // a cage's front tubes pass through notches in the dash, as in real cage installs
  if(!(opts&&opts.noSeats)){for(const sd of [-1,1])for(const [x,y,z,c] of buildSeatV('stock',sd*COCKPIT.H.z).list())g.set(x,y,z,c);for(const [x,y,z,c] of buildRearBench(opts&&opts.body).list())g.set(x,y,z,c);}
  return g;
}
/* ---- cockpit detail (10 mm cells), aligned to the 20 mm faces: pos [0.25,0.25,0.25], so cell i spans [i/2, i/2+0.5] in world voxels ----
   E30 centre stack, top to bottom: two centre vents, clock / on-board computer, DIN radio, heater controls (three sliders and a fan knob), ashtray with lighter.
   Console: shift surround bezel and gear boot, window switches, handbrake lever. Dash: glovebox lid, light switch, round end vents.
   Layout from photographs (DESIGN); sizes ESTIMATED (DIN radio 180 x 50 mm is the ISO 7736 size, VERIFIED standard). */
const DASH_DETAIL_POS=[.25,.25,.25];
function buildDashDetail(){
  const g=new Grid(-130,90,48,100,-70,70);
  const put=(x0,x1,y0,y1,z0,z1,c)=>{for(let i=Math.round(x0*2);i<Math.round(x1*2);i++)for(let j=Math.round(y0*2);j<Math.round(y1*2);j++)for(let k=Math.round(z0*2);k<Math.round(z1*2);k++)g.set(i,j,k,c);};
  const FACE=26.5,F0=FACE-.5;   // centre stack face (rear-facing, flush with the dash face) at x 26.5; detail is one 10 mm layer proud of it
  // two centre vents with horizontal slats
  for(const zs of [[-7,-.5],[.5,7]]){put(F0,FACE,42,44,zs[0],zs[1],0x0e0f11);for(let y=42.5;y<44;y+=1)put(F0-.5,F0,y,y+.5,zs[0]+.5,zs[1]-.5,0x3a3c41);}
  // clock / on-board computer with a green display
  put(F0,FACE,40.5,41.5,-4,4,0x0d0e10);put(F0-.5,F0,41,41.5,-2,2,0x3fa86a);
  // DIN radio: 180 x 50 mm, amber display, two knobs, preset buttons
  put(F0,FACE,37.5,40,-4.5,4.5,0x101113);put(F0-.5,F0,39,39.5,-2,2,0xd08a2a);
  for(const z of [-4,3.5])put(F0-1,F0,38.5,39.5,z,z+.5,0xb9bec5);
  for(let z=-2;z<2;z+=1)put(F0-.5,F0,38,38.5,z,z+.5,0x6a6e75);
  // heater controls: three slider slots with white-tipped levers, round fan knob
  put(F0,FACE,34,36.5,-5,5,0x18191c);
  [[36,-1.5],[35.25,.5],[34.5,-3]].forEach(([y,k])=>{put(F0-.5,F0,y,y+.5,-4,2,0x050506);put(F0-1,F0-.5,y,y+.5,k,k+.5,0xe8e8e8);});
  put(F0-1,F0,34.75,35.75,3,4,0xb9bec5);
  // ashtray with chrome strip and lighter
  put(F0,FACE,33,34,-4,4,0x1d1e21);put(F0-.5,F0,33.5,34,-3.5,3.5,0xaab0b8);put(F0-1,F0,33,33.5,2.5,3.5,0x8a9098);
  // shift surround: a raised bezel frame on the console top (y 29.5) around the leather gear boot, which tapers up the lever
  for(const [x0,x1,z0,z1] of [[11.5,18,-3.5,-3],[11.5,18,3,3.5],[11.5,12,-3.5,3.5],[17.5,18,-3.5,3.5]])put(x0,x1,29.5,30,z0,z1,0x3a3c41);
  for(let y=29.5;y<32;y+=.5){const r=2.6-(y-29.5)*.65;for(let x=15-r;x<15+r;x+=.5)for(let z=-r;z<r;z+=.5)if(Math.hypot(x+.25-15,z+.25)<=r)put(x,x+.5,y,y+.5,z,z+.5,(y===29.5&&Math.hypot(x+.25-15,z+.25)>r-.6)?0x101112:0x18191b);}
  // window switches on the console behind the lever (E30 position)
  for(const z of [-2.5,1.5])put(8,10,29.5,30,z,z+1,0x0d0e10);for(const z of [-2.5,1.5])put(9,9.5,30,30.5,z,z+1,0x6a6e75);
  // handbrake: slot in the rear console top (y 26.5), lever from its pivot back and up, black grip, chrome release button
  put(-3,4.5,26.5,27,-1,1,0x0b0c0d);
  for(let t=0;t<=1;t+=.04){const x=4-12*t,y=27+3*t,r=t>.6?.75:.5;put(x-r,x+r,y-r,y+r,-r,r,t>.6?0x111214:0x1d1e21);}put(-8.5,-8,30,30.5,-.25,.25,0xd8dde2);
  // glovebox lid on the passenger side of the dash face (dash face x 26.5), seam outline and chrome latch
  put(26,26.5,34,39.5,12,27,0x2b2c30);for(const [y0,y1,z0,z1] of [[34,34.5,12,27],[39,39.5,12,27],[34,39.5,12,12.5],[34,39.5,26.5,27]])put(26,26.5,y0,y1,z0,z1,0x141517);put(25.5,26,38,38.5,18.5,20.5,0xc2c7cd);
  // light switch knob left of the steering column
  put(25.5,26.5,37,38,-31,-30,0x1a1b1d);
  // round end vents on the dash face
  for(const zc of [-30.5,30.5]){for(let y=39.5;y<42.5;y+=.5)for(let z=zc-1.5;z<zc+1.5;z+=.5)if(Math.hypot(y+.25-41,z+.25-zc)<=1.5)put(26,26.5,y,y+.5,z,z+.5,(Math.round(y*2)%2)?0x0e0f11:0x3a3c41);}
  return g;
}
function buildShifter(){   // 10 mm cells, origin at the lever pivot (COCKPIT.shifter): lever rod, round 52 mm knob with the shift pattern on top (white H)
  const g=new Grid(-3,3,0,25,-3,3);
  g.fill((x,y,z)=>{const r=Math.hypot(x,z);if(y<=18&&r<=.75)return 0x8d9298;const d=Math.hypot(x,(y-21.5)*1.1,z);if(d<=2.9)return 0x121315;return -1;});
  for(const [x,z] of [[-1,-1],[0,-1],[1,-1],[0,0],[-1,1],[0,1],[1,1]])g.set(x,25,z,-1);for(const [x,z] of [[-1,-1],[-1,0],[-1,1],[1,-1],[1,0],[1,1],[0,0]])if(g.get(x,24,z)>=0)g.set(x,24,z,0xe8e8e8);
  return g;
}
function buildPedal(w,h){const g=new Grid(0,1,0,h,-w,w);g.fill(()=>0x30343a);for(let y=1;y<h;y+=2)for(let z=-w;z<=w;z+=2)g.set(1,y,z,0x6a6f76);return g;}
function buildSteeringWheel(){            // half res, in x-y plane facing +z
  const g=new Grid(-21,21,-21,21,0,3);
  g.fill((x,y,z)=>{const r=Math.hypot(x,y);
    if(r>=16&&r<=19.5)return 0x141517;
    if(r<=5.5)return z>=2?(((x>=0)!==(y>=0))?COL.white:COL.blue):0x1a1b1d;
    const a=Math.atan2(y,x);
    for(const s of [Math.PI,0,-Math.PI/2])if(Math.abs(Math.sin(a-s))<.12&&Math.cos(a-s)>0&&r<16.2)return 0x1b1c1e;
    return -1;});
  return g;
}
function buildNeedle(len){const g=new Grid(0,len,0,0,0,0);g.fill(()=>COL.red);return g;}
function buildGaugeFace(r,mark){          // half res disc in y-z plane facing -x
  const g=new Grid(0,0,-r,r,-r,r);
  g.fill((x,y,z)=>{const d=Math.hypot(y,z);if(d>r)return -1;if(d>r-1)return 0x888b90;
    const a=Math.atan2(z,y);if(d>r-3&&Math.abs(((a*mark)%(Math.PI*2)))<.3)return COL.white;return 0x0b0c0e;});
  return g;
}
function buildWiper(len){const g=new Grid(0,len,0,1,0,1);g.fill((x,y,z)=>x<4?COL.black:(y===0?0x1a1b1d:COL.black));return g;}
function buildGearbox(){
  const g=new Grid(-60,8,0,34,-16,16);
  g.fill((x,y,z)=>{const t=x>-8?1:Math.max(.55,1-(-8-x)/90);const r=Math.hypot(y-15,z);if(r<=15*t)return x>-6?0x6f757c:0x80868d;return -1;});
  box(g,-30,-24,28,34,-3,3,0x5a5f66);
  return g;
}
if(typeof module!=='undefined')module.exports={bumperFront,bumperRear,bumperFaceX,bfFaceX,BUMPER,BF,RR,rollIn,planBack,buildDashDetail,DASH_DETAIL_POS,COL,buildBumperF,buildBumperR,buildHeadlamp,buildKidney,buildTaillamp,buildPlate,roundel,roundelTop,buildMirror,buildHandle,buildTire,buildRim,buildRotor,buildCaliper,buildArm,buildStrutTube,buildSpring,buildRod,buildShaft,buildExhaust,buildDiff,buildEngine,buildPulley,buildFan,buildBay,buildInterior,buildShifter,buildPedal,buildSteeringWheel,buildNeedle,buildGaugeFace,buildWiper,buildGearbox};
