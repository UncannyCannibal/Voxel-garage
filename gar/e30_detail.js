/* ===== E30 DETAIL PACK (realism): everything here is placed on MEASURED surfaces, never at guessed coordinates =====
   The exterior skin is a 10 mm grid (r.hi, index i = world coordinate i/2). Half-res part grids (10 mm) are placed at positions that are multiples of 0.5, so every
   part cell lands exactly on a skin cell: openings are cut cell for cell and parts sit flush.
   Needs: Grid, box (core), PAINT, COL, topY, halfAt (core/parts). */

function hbox(g,x0,x1,y0,y1,z0,z1,c){   // box in WORLD units, [x0,x1) etc., on a half-res grid
  for(let i=Math.ceil(x0*2);i<Math.ceil(x1*2);i++)for(let j=Math.ceil(y0*2);j<Math.ceil(y1*2);j++)for(let k=Math.ceil(z0*2);k<Math.ceil(z1*2);k++)g.set(i,j,k,c);
}
// first solid cell along a ray through any of the named grids (20 mm cells). returns {name,t,p,paint}
function rayHit(grids,o,d,maxT){
  for(let t=0;t<(maxT||140);t+=.25){
    const p=[o[0]+d[0]*t,o[1]+d[1]*t,o[2]+d[2]*t];
    for(const k in grids){const c=grids[k].get(Math.round(p[0]),Math.round(p[1]),Math.round(p[2]));if(c>=0)return {name:k,t,p,paint:c===PAINT,cell:[Math.round(p[0]),Math.round(p[1]),Math.round(p[2])]};}
  }
  return null;
}
// the same on 10 mm grids (hi cells). p is in world units; cell is the hi index
function rayHitHi(grids,o,d,maxT){
  for(let t=0;t<(maxT||140);t+=.1){
    const p=[o[0]+d[0]*t,o[1]+d[1]*t,o[2]+d[2]*t],I=Math.round(p[0]*2),J=Math.round(p[1]*2),K=Math.round(p[2]*2);
    for(const k in grids){const c=grids[k].get(I,J,K);if(c>=0)return {name:k,t,p,paint:c===PAINT,cell:[I,J,K],color:c};}
  }
  return null;
}
// outer face coordinate (world units) of the cell the ray hit, along an axis (axis 0,1,2; sign = direction the ray travelled)
function faceOf(hit,axis,dirSign){return hit.cell[axis]-dirSign*.5;}
function faceOfHi(hit,axis,dirSign){return (hit.cell[axis]-dirSign*.5)/2;}

// ---------- front and rear parts mounted in body openings: one list used by the page, the openings and the tests ----------
// positions are multiples of 0.5 world units (whole 10 mm cells)
const HEAD_POS=[NOSE_X-3.4,30.5,27],KID_POS=[NOSE_X-3.4,30.5,8],PLATE_F=[109,21.5,0],PLATE_R=[REAR_X-.9,32.5,0];   // lamps and grille 68 mm behind the nose face; the rear plate on the rear panel, centred on the tail lamps' height (photographs)
function mountedParts(){
  const P=[];
  for(const sd of [-1,1]){
    P.push({id:'headlamp'+(sd<0?'L':'R'),grid:buildHeadlamp(sd),pos:[HEAD_POS[0],HEAD_POS[1],sd*HEAD_POS[2]]});
    P.push({id:'kidney'+(sd<0?'L':'R'),grid:buildKidney(),pos:[KID_POS[0],KID_POS[1],sd*KID_POS[2]],kidney:true});
    const t=buildTaillamp(sd);for(const k of ['frame','red','amb','wht'])P.push({id:'taillamp'+(sd<0?'L':'R')+'-'+k,grid:t[k],pos:[TAIL_POS[0],TAIL_POS[1],sd*TAIL_POS[2]]});
  }
  P.push({id:'plateF',grid:buildPlate(true),pos:PLATE_F});P.push({id:'plateR',grid:buildPlate(false),pos:PLATE_R});
  return P;
}
// hi cells of a half-res part: index = 2*pos + local index
const hiCells=p=>p.grid.list().map(([x,y,z,c])=>[Math.round(p.pos[0]*2)+x,Math.round(p.pos[1]*2)+y,Math.round(p.pos[2]*2)+z,c]);
function fitOpenings(r){
  const hi=r.hi||r;
  for(const p of mountedParts()){if(p.id.startsWith('plate'))continue;for(const [I,J,K] of hiCells(p))for(const G of [hi.body,hi.hood,hi.trunk])if(G.get(I,J,K)>=0)G.set(I,J,K,-1);}   // the hood's and the lid's edges are notched over the lamps and grilles
  // nothing of the body or the lid stands proud of a tail lamp's lens: at the quarter corners the body's plan rounding (taken per height) reaches further back than
  // the lamp face (which follows rearX at one height), so per lamp (y,z) column the panel cells beyond the lamp's rearmost cell are cleared (up to 80 mm)
  const back=new Map();for(const p of mountedParts()){if(!p.id.startsWith('taillamp'))continue;for(const [I,J,K] of hiCells(p)){const key=J+','+K,c=back.get(key);if(c===undefined||I<c)back.set(key,I);}}
  for(const [key,I] of back){const [J,K]=key.split(',').map(Number);for(let a=1;a<=8;a++)for(const G of [hi.body,hi.trunk])if(G.get(I-a,J,K)>=0)G.set(I-a,J,K,-1);}
  clearRoundelFace(hi);seatRearBadges(hi);
}
// remove the cells of a half-res part that come within one 10 mm cell of a keep-out set (absolute half-unit keys)
function notchGrid(grid,pos,keep){
  for(const [x,y,z] of grid.list()){const i=Math.round(pos[0]*2)+x,j=Math.round(pos[1]*2)+y,k=Math.round(pos[2]*2)+z;let hit=false;
    for(let a=-1;a<=1&&!hit;a++)for(let b=-1;b<=1&&!hit;b++)for(let c=-1;c<=1&&!hit;c++)if(keep.has((i+a)+','+(j+b)+','+(k+c)))hit=true;if(hit)grid.set(x,y,z,-1);}
  return grid;
}
// the kidney grilles are notched around the hood roundel that sits between their top corners
function buildKidneyFitted(r,sd){const keep=new Set();for(const [I,J,K] of noseCells())keep.add(I+','+J+','+K);
  return notchGrid(buildKidney(),[KID_POS[0],KID_POS[1],sd*KID_POS[2]],keep);}

// ---------- badges: discs with one layer (10 mm), normal along +x, +y or +z in local coordinates ----------
function badgeDisc(rHalf,normal){
  const R=rHalf+1,g=normal==='y'?new Grid(-R,R,0,0,-R,R):(normal==='x'?new Grid(0,0,-R,R,-R,R):new Grid(-R,R,-R,R,0,0));
  g.fill((x,y,z)=>{const a=normal==='y'?x:(normal==='x'?y:x),b=normal==='y'?z:(normal==='x'?z:y);
    const d=Math.hypot(a,b);if(d>rHalf+.3)return -1;if(d>rHalf-.7)return 0x111214;return ((a>=0)!==(b>=0))?COL.white:COL.blue;});
  return g;
}
const GL={'3':['111','001','011','001','111'],'2':['111','001','111','100','111'],'5':['111','100','111','001','111'],'i':['1','0','1','1','1']};
function badgeText(txt,color){   // flat lettering in the x-z plane, letters read along +z, letter-up = +x (seen from behind the car)
  const g=new Grid(0,6,0,0,0,20);let cz=0;
  for(const ch of txt){const m=GL[ch];const w=m[0].length;for(let r=0;r<5;r++)for(let q=0;q<w;q++)if(m[r][q]==='1')g.set(4-r,0,cz+q,color);cz+=w+1;}
  return g;
}
function ringDisc(rHalf,normal,color){   // thin outline ring (flap, caps)
  const R=rHalf+1,g=normal==='z'?new Grid(-R,R,-R,R,0,0):new Grid(-R,R,0,0,-R,R);
  g.fill((x,y,z)=>{const a=x,b=normal==='z'?y:z;const d=Math.hypot(a,b);return (d<=rHalf+.3&&d>rHalf-.9)?color:-1;});return g;
}

// Sizes: hood roundel 82 mm diameter VERIFIED (BimmerWorld, part 51148132375) -> disc radius 4 cells (about 86 mm at 10 mm cells).
// Trunk roundel: size not found for the E30 non-M part 51141872969; drawn the same as the hood (ESTIMATED).
// 325i lettering: 5-row glyphs at 10 mm cells are about 50 mm tall, roughly twice the real lettering; the resolution sets it (DECLARED).
// ---- front roundel: on the nose panel between the two kidney grilles, flush with the panel face (hi cell 207 = one cell proud), facing forward.
// A body-colour boss behind the disc seats it where it overlaps the kidney corners (the kidneys are notched round it).
const NOSE_FACE_I=Math.floor(NOSE_X*2+1e-9);          // outermost body cell of the nose panel (hi index)
const ROUNDEL_Y=72;                                   // hi y of the roundel centre: world 36
function noseCells(){const o=[];for(let j=-5;j<=5;j++)for(let k=-5;k<=5;k++){if(Math.hypot(j,k)<=4.6)for(const i of [NOSE_FACE_I-1,NOSE_FACE_I])o.push([i,ROUNDEL_Y+j,k]);}return o;}
function noseRoundel(r){   // grid in hi coordinates (absolute), drawn at mesh scale .5
  const R=4.1,X=NOSE_FACE_I+1,out=new Grid(X,X,ROUNDEL_Y-5,ROUNDEL_Y+5,-5,5);
  for(let j=-5;j<=5;j++)for(let k=-5;k<=5;k++){const d=Math.hypot(j,k);if(d>R+.01)continue;out.set(X,ROUNDEL_Y+j,k,d>R-1?0x111214:(((j>=0)!==(k>=0))?COL.white:COL.blue));}
  return out;
}
function clearRoundelFace(hi){
  for(const [I,J,K] of noseCells())for(const G of [hi.hood,hi.body]){if(G.get(I,J,K)>=0&&I>NOSE_FACE_I-1)G.set(I,J,K,-1);}
  for(const [I,J,K] of noseCells()){if(hi.hood.get(I,J,K)<0&&hi.body.get(I,J,K)<0)hi.body.set(I,J,K,PAINT);}
}
// ---- rear badges: on the rear panel just above the tail lamps and the plate, between the lamps (E30: roundel centred, 325i on the right).
// The surface is read from the skin itself: face position x(y) at the badge column, tilt from its slope; each badge is a flat plate built in that plane,
// pushed out along the normal until its cells clear the skin, with the seat behind it filled.
function rearFace(hi,y,z){for(let I=-230;I<=-190;I++)for(const G of [hi.body,hi.trunk])if(G.get(I,Math.round(y*2),Math.round(z*2))>=0)return I/2-.25;return null;}   // outer face x at height y
function rearNormal(hi,y,z){const a=rearFace(hi,y-.75,z),b=rearFace(hi,y+.75,z);if(a===null||b===null)return [-1,0];const s=(b-a)/1.5,l=Math.hypot(1,s);return [-1/l,s/l];}
function rearBadgeSpecs(){
  const disc=[],txt=[];
  for(let a=-5;a<=5;a++)for(let k=-5;k<=5;k++){const d=Math.hypot(a,k);if(d>4.1+.01)continue;disc.push([a,k,d>3.1?0x111214:(((a>=0)!==(k>=0))?COL.white:COL.blue)]);}
  const t=badgeText('325i',COL.chrome);let zm=0;for(const [x,,z] of t.list())zm=Math.max(zm,z);for(const [x,,z,c] of t.list())txt.push([x-2,z-zm/2,c]);
  // the Touring's badges sit on the tailgate's panel between the glass's lower edge (912 mm) and the lamps' tops (790 mm), centred in it (photographs: roundel on the
  // centreline, the model badge at the right)
  const yc=(typeof E30V!=='undefined'&&E30V==='touring')?42.6:42.0;   // v20: the sedan's lid rear face runs 790-885 mm on the centre line (read off the built lid); 47.2 (944 mm) was above the lid, so neither rear badge was built
  return [{id:'badge-trunk',yc,zc:0,cells:disc},{id:'badge-325i',yc,zc:9.5,cells:txt,text:true}];
}
function placeRearBadge(hi,sp){
  // every cell of the badge is conformed to the skin individually (a thin emblem follows the surface), measured along the face normal at the badge centre
  const N=rearNormal(hi,sp.yc,sp.zc),xf=rearFace(hi,sp.yc,sp.zc);if(xf===null)return [];
  const TT=[N[1],-N[0]];                                            // tangent up the face (unit): perpendicular to the normal, y positive
  const occ=p=>{const I=Math.round(p[0]*2),J=Math.round(p[1]*2),K=Math.round(p[2]*2);return hi.body.get(I,J,K)>=0||hi.trunk.get(I,J,K)>=0;};
  const at=(q,t)=>[xf-.25+N[0]*t+q[0]*.5*TT[0],sp.yc+N[1]*t+q[0]*.5*TT[1],sp.zc+q[1]*.5];
  const out=[],seen=new Set();
  for(const q of sp.cells){let t=-2;while(t<5&&occ(at(q,t)))t+=.05;const p=at(q,t+.02),I=Math.round(p[0]*2),J=Math.round(p[1]*2),K=Math.round(p[2]*2),key=I+','+J+','+K;
    if(seen.has(key)||hi.body.get(I,J,K)>=0||hi.trunk.get(I,J,K)>=0)continue;seen.add(key);out.push([I,J,K,q[2]]);}
  return out;
}
function seatRearBadges(hi){
  for(const sp of rearBadgeSpecs()){const cells=placeRearBadge(hi,sp);if(!cells.length)continue;const N=rearNormal(hi,sp.yc,sp.zc),bc=new Set(cells.map(c=>c[0]+','+c[1]+','+c[2]));
    const seatG=(typeof E30V!=='undefined'&&E30V==='touring')?hi.trunk:hi.body;   // the seat behind a badge belongs to the panel it is on (the Touring's tailgate)
    for(const [I,J,K] of cells)for(let s=1;s<=8;s++){const i=Math.round(I-N[0]*s*.75),j=Math.round(J-N[1]*s*.75);if(hi.body.get(i,j,K)>=0||hi.trunk.get(i,j,K)>=0)break;if(!bc.has(i+','+j+','+K))seatG.set(i,j,K,PAINT);}}
}
function rearBadgeGrid(hi,sp){const cells=placeRearBadge(hi,sp);if(!cells.length)return new Grid(0,0,0,0,0,0);let b=[1e9,-1e9,1e9,-1e9,1e9,-1e9];for(const [i,j,k] of cells)b=[Math.min(b[0],i),Math.max(b[1],i),Math.min(b[2],j),Math.max(b[3],j),Math.min(b[4],k),Math.max(b[5],k)];
  const g=new Grid(b[0],b[1],b[2],b[3],b[4],b[5]);for(const [i,j,k,c] of cells)g.set(i,j,k,c);return g;}
// items: {id, grid, parent, pos, normal, kind}. All badge grids are ABSOLUTE hi cells (pos [0,0,0], drawn at scale .5). parent: body (the hood roundel rides on the nose panel).
function buildBadges(r){
  const hi=r.hi||r,items=[],sk={body:hi.body,hood:hi.hood,trunk:hi.trunk,doorL:hi.doorL,doorR:hi.doorR};
  items.push({id:'badge-hood',kind:'badge',grid:noseRoundel(r),parent:'body',pos:[0,0,0],normal:[1,0,0]});
  for(const sp of rearBadgeSpecs()){const N=rearNormal(hi,sp.yc,sp.zc);items.push({id:sp.id,kind:'badge',grid:rearBadgeGrid(hi,sp),parent:'body',pos:[0,0,0],normal:[N[0],N[1],0],text:!!sp.text});}
  // fuel flap: its shut line is cut into the quarter panel's skin (e30_core.js 6d2), nothing stands on the skin
  // amber side repeaters on the front wings, just behind the front wheel arch (e30zone wiki)
  for(const sd of [-1,1]){const hm=rayHitHi({body:hi.body},[AX_F-21.5,27.5,sd*70],[0,0,-sd]);if(!hm)continue;
    const ci=Math.round((AX_F-21.5)*2),cj=55,ck=hm.cell[2]+sd,out=new Grid(ci-4,ci+3,cj,cj+1,ck,ck);for(let i=ci-4;i<=ci+3;i++)for(let j=cj;j<=cj+1;j++)out.set(i,j,ck,COL.amber);
    items.push({id:'marker-'+(sd>0?'R':'L'),kind:'marker',grid:out,parent:'body',pos:[0,0,0],normal:[0,0,sd]});}
  return items;
}

// ---------- door card (interior trim panel) on the door's own inner surface. Half-res grid, WORLD coordinates ----------
// depth d (half-voxel layers) is measured inward from the door's inner skin, so the card follows the door's tumblehome
function buildDoorCard(sd,door){
  const inner=new Map();for(const [x,y,z] of door.list()){const k=x+','+y,a=Math.abs(z);if(!inner.has(k)||a<inner.get(k))inner.set(k,a);}
  const g=new Grid(-30,90,24,100,-80,80);
  const zAt=(x,y,d)=>{const v=inner.get(Math.round(x)+','+Math.round(y));return v===undefined?null:sd*(v-1-d*.5);};   // first layer 5 mm off the door's inner skin; integer half-steps so left and right round the same way
  const P=(x0,x1,y0,y1,d0,d1,c)=>{for(let i=Math.ceil(x0*2);i<Math.ceil(x1*2);i++)for(let j=Math.ceil(y0*2);j<Math.ceil(y1*2);j++)for(let d=d0;d<=d1;d++){
    const z=zAt(i/2,j/2,d);if(z===null)continue;if(c<0)g.set(i,j,Math.round(z*2),-1);else g.set(i,j,Math.round(z*2),c);}};
  const trim=0x6b6f77,dk=0x34373d,vdk=0x0e0f11,belt=0x1d1e21,pad=0x4a4e55;
  const XR=DOOR_R+1.5,XF=DOOR_F-1.5,YT=BELT-1,YB=DOOR_B+.5;   // the card inside the door's shut lines, from the sill to the belt
  P(XR,XF,YB,YT,0,0,trim);                                 // card panel
  P(XR,XF,YT-1.5,YT,0,1,belt);                             // belt-line cap under the window seal
  P(XR,XF,YB,YB+1.5,0,1,dk);                               // kick strip (the card starts above the sill)
  P(XR,XR+1,YB,YT,0,1,dk);P(XF-1,XF,YB,YT,0,1,dk);        // side beads
  P(4,26,32,35,1,5,dk);P(4,26,34.5,35,1,5,pad);            // armrest and its pad, about 180 mm above the seat surface
  P(8,22,32.5,34,1,2,vdk);                                 // pull-handle recess in the armrest
  P(26,36,YT-6,YT-4,1,1,dk);P(27,35,YT-5.5,YT-4.5,2,2,COL.chrome); // door release base and chrome lever (window switches are on the centre console)
  P(XR+2.5,25,YB+1.5,YB+7,1,5,dk);P(XR+4,23.5,YB+2.5,YB+7,2,4,-1);P(XR+4,23.5,YB+2.5,YB+3,2,4,vdk);   // door pocket: hollow, open at the top, with a floor
  for(let i=Math.ceil((XF-11)*2);i<=Math.ceil((XF-1)*2);i++)for(let j=Math.ceil((YB+1)*2);j<=Math.ceil((YB+11)*2);j++){   // speaker grille
    const dd=Math.hypot(i/2-(XF-6),j/2-(YB+6));if(dd>4.2)continue;const z=zAt(i/2,j/2,1);if(z===null)continue;g.set(i,j,Math.round(z*2),dd>3.6?dk:(((i+j)%2===0)?0x50555c:vdk));}
  P(-6.25,-5.75,YT,YT+2.5,0,0,0xb3201b);                   // lock pin on the belt
  return g;
}
// ---------- door mirror: black housing (ESTIMATED for the 325i), triangular sail plate, short thick arm, rounded housing with the glass facing REARWARD (-x).
// 10 mm cells, ABSOLUTE hi coordinates (z sign = door side). The sail plate is seated INTO the skin: for every cell of the plate the skin position is read from the
// door / pillar surface (skinZ), and the plate runs from two cells inside the skin to two cells proud of it, so the mirror is attached to the car at any skin shape.
// Housing 200 x 120 x 90 mm (DESIGN from photographs); the arm leaves the plate and carries the housing 50 mm off the skin.
function buildDoorMirror(sd,skinZ){
  const BLK=0x16171a,GLS=0x9bb4c0,X0=Math.round(xDG(BELT+1.5)*2-1)/2,Y0=Math.round((BELT-2.5)*2)/2,gi=x=>Math.round(2*X0)+x,gj=y=>Math.round(2*Y0)+y;   // the sail plate in the door frame's front corner, ahead of the glass
  const kref=Math.round(2*skinZ(X0+2.5,BELT-.6))-6;   // the housing's reference: 60 mm inside the door skin's plane at the belt (the housing stands where it always did, whatever the frame's corner does)
  const mkG=()=>new Grid(gi(-2),gi(14),gj(-2),gj(18),-100,100),shell=mkG(),glass=mkG(),plate=mkG(),housing=mkG();
  const S=(G,x,y,k,c)=>G.set(gi(x),gj(y),sd*k,c);
  // mirror base: the door frame's front corner, from the glass's front edge forward to the door's front edge along the A-pillar (xA - 70 mm), from 50 mm under
  // the belt to 80 mm over it (photographs of 1988-91 coupes: a black base fills the corner the mirror stands on). Seated two cells into the skin and pulled out
  // from the frame's leaning surface to a face at the door skin's plane at the belt, leaning in 12 degrees above it (half the glass's lean), up to the arm's
  // root: the mirror stands on a solid black base with depth instead of a flat corner
  const tl=Math.tan(12*Math.PI/180),kb=x=>Math.round(2*skinZ(gi(x)/2,BELT-.6)),yTop=BELT+4;
  for(let x=0;x<=12;x++){const kbx=kb(x),xw=gi(x)/2;for(let y=0;y<=16;y++){const yA=gj(y)/2;if(yA>yTop||xw>xA(Math.max(yA,BELT))-3.75)continue;
    const zs=skinZ(xw,yA);if(zs<=0)continue;const kp=Math.round(2*zs),kT=Math.min(Math.round(kbx-2*Math.max(0,yA-BELT)*tl),kref+3);
    for(let k=Math.max(kp-2,kT-8);k<=Math.max(kp+1,kT);k++){S(shell,x,y,k,BLK);S(plate,x,y,k,BLK);}}}
  for(let x=3;x<=6;x++)for(let y=5;y<=9;y++)for(let k=kref-2;k<=kref+5;k++)if(!((x===3||x===6)&&(y===5||y===9)))S(shell,x,y,k,BLK);   // neck, its edges rounded: black like the base (the housing is body colour on 1988-91 cars)
  // housing: a rounded shell (superellipse section, exponent 2.6) whose front half closes in an ellipse to a blunt nose, the outboard end a little taller (E30 1988-91 mirror)
  const cz=15,cy=8,a=10,b=6,inside=(y,z,s)=>{const t=(z-cz)/a,bb=b*(1+.08*t);return Math.pow(Math.abs(z-cz)/(a*s),2.6)+Math.pow(Math.abs(y-cy)/(bb*s),2.6)<=1;};
  for(let x=0;x<=10;x++){const sc=x<=2?1:Math.sqrt(Math.max(0,1-Math.pow((x-2)/8.6,2)));if(sc<.2)continue;for(let y=0;y<=16;y++)for(let z=4;z<=27;z++)if(inside(y,z,sc)){
    if(x===0&&inside(y,z,.85))continue;S(shell,x,y,kref+z,(x===0||x===1)&&!inside(y,z,.95)?BLK:PAINT);S(housing,x,y,kref+z,PAINT);}}   // body-colour housing (1988-91 cars, photographs) with a black bezel round the glass
  for(let y=0;y<=16;y++)for(let z=4;z<=27;z++)if(inside(y,z,.85)){S(glass,1,y,kref+z,GLS);S(shell,1,y,kref+z,-1);}   // glass one layer in from the bezel
  return {shell,glass,plate,housing,glassCenter:[X0+.225,Y0+cy*.5,sd*(kref+cz)/2],glassSize:[8.5,5.1]};
}
// ---------- interior mirror and sun visors: both hang from the HEADLINER (the roof's inner skin), never from the glass ----------
// the headliner's underside over a 10 mm column: scanning down from above the roof through the roof shell, the first empty cell under it (index), or null
function roofUnder(H,i,k){let j=150;const occ=j=>H.body.get(i,j,k)>=0;while(j>70&&!occ(j))j--;if(j<=70)return null;while(j>70&&occ(j-1))j--;return j-1;}
// the windshield's top (rear) edge on the centreline, hi index
function wsTopEdgeI(H){let gx=1e9;for(const [i,j,k] of H.glass.ws.list())if(k===0)gx=Math.min(gx,i);return gx;}
function buildInteriorMirror(r){
  // its base is screwed to the roof frame through the headliner, 30 mm behind the windshield's top edge on the centreline (E30 and EF alike); a short stem
  // drops 50 mm and leans back to the ball joint of a 250 x 70 mm head whose glass faces rearward; nothing of it touches the glass
  const H=r.hi,im=wsTopEdgeI(H)-3,c=roofUnder(H,im,0);
  const sh=new Grid(-12,4,-14,2,-16,16),gl=new Grid(-12,4,-14,2,-16,16),B=COL.black,BS=0x1d1e21;
  {let lo=0;for(let x=-2;x<=1;x++)for(let z=-2;z<=2;z++){const cc=roofUnder(H,im+x,z);if(cc!==null)lo=Math.min(lo,cc-c);}
   for(let x=-2;x<=1;x++)for(let z=-2;z<=2;z++){const cc=roofUnder(H,im+x,z);if(cc===null)continue;for(let y=lo;y<=cc-c;y++)sh.set(x,y,z,BS);}}   // base plate on the headliner: each column of it reaches the roof's underside there
  for(let t=0;t<=1.0001;t+=.1){const x=Math.round(-.5-2.5*t),y=Math.round(-1-4*t);for(const [dx,dz] of [[0,0],[0,-1],[-1,0],[-1,-1]])sh.set(x+dx,y,dz,B);}   // stem
  const hx=-5,hy=-8;
  for(let z=-12;z<=12;z++)for(let y=hy-3;y<=hy+3;y++){if(Math.abs(z)>10&&Math.abs(y-hy)>2)continue;for(let x=hx;x<=hx+2;x++)sh.set(x,y,z,B);gl.set(hx-1,y,z,0x9bb4c0);}   // housing and glass
  const pos=[im/2,c/2,0];
  return {shell:sh,glass:gl,pos,glassCenter:[pos[0]+(hx-1)*.5-.26,pos[1]+hy*.5,0],glassSize:[12.5,3.5]};
}
// with a cage's windshield header bar across the mirror's place, the mirror moves onto the bar (as in real cage installs): a strap round the bar, a short stem
// and a 250 x 50 mm head hanging just under it. cageG: the cage's grid in 20 mm cells; the header bar is found as its cells on the centreline near x 16
function buildInteriorMirrorBar(cageG){
  let i0=1e9,i1=-1e9,j0=1e9,j1=-1e9;for(const [i,j,k] of cageG.list())if(k===0&&i>=10&&i<=20&&j>=55){i0=Math.min(i0,i);i1=Math.max(i1,i);j0=Math.min(j0,j);j1=Math.max(j1,j);}
  const X0=2*i0-2,X1=2*i1+3,Y0=2*j0-2,Y1=2*j1+3,B=COL.black;   // the strap's ring in 10 mm cells, a cell's gap round the bar
  const sh=new Grid(X0-8,X1+2,Y0-10,Y1+1,-16,16),gl=new Grid(X0-8,X1+2,Y0-10,Y1+1,-16,16);
  for(let z=-2;z<=2;z++){for(let x=X0;x<=X1;x++){sh.set(x,Y0,z,B);sh.set(x,Y1,z,B);}for(let y=Y0;y<=Y1;y++){sh.set(X0,y,z,B);sh.set(X1,y,z,B);}}
  const xc=Math.round((X0+X1)/2),hx=xc-3,hy=Y0-3;
  for(const [dx,dz] of [[0,0],[0,-1],[-1,0],[-1,-1]])sh.set(xc+dx,Y0-1,dz,B);   // stem
  for(let z=-12;z<=12;z++)for(let y=hy-2;y<=hy+2;y++){if(Math.abs(z)>10&&Math.abs(y-hy)>1)continue;for(let x=hx;x<=hx+2;x++)sh.set(x,y,z,B);gl.set(hx-1,y,z,0x9bb4c0);}   // housing and glass
  return {shell:sh,glass:gl,pos:[0,0,0],glassCenter:[(hx-1)*.5-.26,hy*.5,0],glassSize:[12.5,2.5]};
}
// sun visor stowed against the headliner: every column of its 30 mm thick pad sits on the headliner's underside over that column (so it follows the roof's
// curve with no gap and no overlap), corners rounded 30 mm; its pivot bracket at the outer front corner and its clip at the inner front corner are on the
// headliner too. x0..x1 (rear..front), z0..z1 (inner..outer) in world units; the front edge must stay behind the windshield's top edge.
function visorOnHeadliner(r,sd,x0,x1,z0,z1){const H=r.hi,i0=Math.round(x0*2),i1=Math.round(x1*2),k0=Math.round(z0*2),ni=i1-i0,R=3;
  // the visor's outer end stays 20 mm inboard of the door's window frame and the A-pillar trim (the doors' own cells are their grids, not the body's)
  let kOut=Math.round(z1*2);for(let i=i0;i<=i1+2;i++)for(let k=k0;k<=Math.round(z1*2)+6;k++)for(let j=110;j<=140;j++){if((sd<0?H.doorL:H.doorR).get(i,j,sd*k)>=0){kOut=Math.min(kOut,k-3);break;}}
  const k1=kOut,nk=k1-k0;
  const g=new Grid(i0-1,i1+3,60,150,Math.min(sd*(k0-2),sd*(k1+2)),Math.max(sd*(k0-2),sd*(k1+2)));let ceil=1e9;
  for(let i=i0;i<=i1;i++)for(let k=k0;k<=k1;k++){const ci=i-i0,ck=k-k0,dx=Math.max(R-ci,ci-(ni-R),0),dz=Math.max(R-ck,ck-(nk-R),0);if(dx*dx+dz*dz>R*R)continue;
    const c=roofUnder(H,i,sd*k);if(c===null)continue;ceil=Math.min(ceil,c/2);for(let t=0;t<3;t++)g.set(i,c-t,sd*k,t===2?0x3a3d42:0x2f3136);}
  for(const [kk,w] of [[k1-1,2],[k0+1,1]]){for(let b=0;b<w;b++){const c=roofUnder(H,i1+1,sd*(kk-b));if(c===null)continue;for(let t=0;t<2;t++)if(H.glass.ws.get(i1+1,c-t,sd*(kk-b))<0)g.set(i1+1,c-t,sd*(kk-b),0x1f2023);}}   // pivot bracket, clip (never on the glass)
  return {grid:g,pos:[0,0,0],ceil};}
function buildVisor(r,sd){const xt=wsTopEdgeI(r.hi)/2;return visorOnHeadliner(r,sd,xt-9,xt-1.5,8.25,25.75);}   // 150 mm deep, from 20 mm behind the windshield's top edge
if(typeof module!=='undefined')module.exports={buildInteriorMirrorBar,roofUnder,wsTopEdgeI,visorOnHeadliner,NOSE_FACE_I,ROUNDEL_Y,mountedParts,fitOpenings,notchGrid,buildKidneyFitted,noseRoundel,PLATE_F,PLATE_R,HEAD_POS,KID_POS,hiCells,noseCells,rearNormal,rearFace,rayHitHi,faceOfHi,hbox,rayHit,faceOf,badgeDisc,badgeText,ringDisc,buildBadges,buildDoorCard,buildDoorMirror,buildInteriorMirror,buildVisor};
