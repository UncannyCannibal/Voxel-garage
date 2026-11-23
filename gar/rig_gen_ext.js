/* ===== GENERIC EXTERIOR PARTS (any shell): bumpers, lamps, door card, door mirror. Same construction as the E30's, driven by the shell geometry g (makeShell) and a parameter block. ===== */

/* ---- bumpers. A moulded bar with an optional rubber strip, a recessed valance below it, a bowed plan that rounds into the sides and wraps back along the body to just short of the wheel arch.
   B: {sgn:+1 front / -1 rear, tip (mm beyond the body panel), bar:[y0,y1] mm, valance:[y0,y1] mm, strip:[y0,y1]|null mm, Rc (plan corner radius mm), bow, setV, wrapLen (mm along the body), painted:true|false, cutouts:[{z0,z1,y1}] mm} ---- */
function genBumper(g,B){
  const sg=B.sgn,{halfAt,archLip,AX_F,AX_R,WR,NOSE_X,REAR_X}=g,u=g.u;
  const faceBody=sg>0?NOSE_X:REAR_X,x0=faceBody+sg*u(B.tip),bar=B.bar.map(u),val=B.valance.map(u),strip=B.strip?B.strip.map(u):null,Rc=u(B.Rc||140),arch=sg>0?AX_F:AX_R;
  const wrapTo=faceBody-sg*u(B.wrapLen||1100),yRef=Math.max(bar[0],10.5);
  const widthAt=(y,inBar)=>halfAt(faceBody-sg*u(60),Math.max(y,10.5))+(inBar?1.0:.9);
  const back=(y,az)=>{const inBar=y>=bar[0]&&y<=bar[1],W=widthAt(y,inBar);let b=0;
    if(inBar){const r=1.2,t=bar[1],bt=bar[0];
      if(y>t-r)b+=r-Math.sqrt(Math.max(0,r*r-(y-(t-r))*(y-(t-r))));
      if(y<bt+r)b+=(r-Math.sqrt(Math.max(0,r*r-((bt+r)-y)*((bt+r)-y))))*.8;
      if(strip&&(y>=strip[0]-1&&y<strip[0]||y>strip[1]&&y<=strip[1]+1))b+=.5;}
    else{b+=B.setV;const bt=val[0];if(y<bt+2.2)b+=(bt+2.2-y)*.55;if(y>bar[0]-1.2)b+=.4;}
    b+=B.bow*Math.pow(az/36,2);
    const d=Math.max(0,az-(W-Rc));if(d>=Rc)return 99;b+=Rc-Math.sqrt(Rc*Rc-d*d);return b;};
  const lo=Math.min(x0,wrapTo)-1,hiX=Math.max(x0,wrapTo)+1,ymin=Math.min(val[0],bar[0]),ymax=bar[1];
  const G=hgrid(lo,hiX,ymin-.5,ymax+.5,-g.halfW-3,g.halfW+3);
  fillW(G,null,(x,y,z)=>{
    const inBar=y>=bar[0]&&y<=bar[1],inVal=y>=val[0]&&y<bar[0];if(!inBar&&!inVal)return -1;
    const az=Math.abs(z),yy=Math.max(y,10.5),hz=halfAt(x,yy)+archLip(x,yy),W=widthAt(y,inBar);if(az>W)return -1;
    const bk=back(y,az);if(bk>50)return -1;const face=x0-sg*bk;if(sg*(x-face)>.25)return -1;
    const behindBody=sg>0?x<=faceBody-.2:x>=faceBody+.3;
    if(behindBody){if(az<=hz)return -1;if(sg*(x-wrapTo)<0)return -1;if(Math.hypot(x-arch,y-WR)<g.ARCH_R+1)return -1;}
    if(inBar)return (strip&&y>=strip[0]&&y<=strip[1])?COL.rubber:(B.painted?PAINT:0x2e3035);
    return B.painted?0x2a2b2e:0x232529;});
  if(B.painted)shellHi(G,(x,y,z,inner)=>inner?0x2a2b2e:(y<bar[0]+.6?0x1a1b1e:(y>bar[1]-.6?0x1d1112:PAINT)),2);
  for(const c of B.cutouts||[]){const z0=u(c.z0),z1=u(c.z1),yt=u(c.y1);carveW(G,null,(x,y,z)=>z>=Math.min(z0,z1)&&z<=Math.max(z0,z1)&&y<=yt);}
  // nothing inside the wheelhouse or the body panels
  eachCell(G,null,(i,j,k,n)=>{if(G.d[n]<0)return;const x=i/HR,y=j/HR,z=k/HR,az=Math.abs(z),yy=Math.max(y,10.5),hz=halfAt(x,yy)+archLip(x,yy);
    if(Math.hypot(x-arch,y-WR)<g.ARCH_R+1||(az<=hz&&(sg>0?x<=g.noseX(az)-.01:x>=g.rearX(az)+.01)&&y>=g.YBOT(x)-.01))G.d[n]=-1;});
  G.faceX=(y,az)=>x0-sg*back(y,az);
  return G;
}

/* ---- lamps: a lens set into the skin at a given height and lateral position, flush with the local panel face (read from the body grid) ---- */
// lens block: w (z), h (y), d (x depth) in 10 mm cells; colours per layer. pos: {y,z} mm; face x is measured from the body so the lens is flush.
function bodyFaceX(hi,sg,y,z){   // outermost body/hood/lid cell at (y,z) along x (world units), scanning in from outside
  const grids=[hi.body,hi.hood,hi.trunk];const I0=sg>0?Math.round(NOSE_FACE_GUESS*2)+8:-Math.round(NOSE_FACE_GUESS*2)-8;
  for(let I=I0;sg>0?I>=-400:I<=400;I-=sg)for(const G of grids)if(G.get(I,Math.round(y*2),Math.round(z*2))>=0)return I/2;
  return null;
}
let NOSE_FACE_GUESS=100;
function genLens(w,h,d,cols){   // cols: {rim,lens,inner}
  const G=new Grid(0,d,0,h,-Math.round(w/2),Math.round(w/2));
  G.fill((x,y,z)=>{const edge=Math.abs(z)>=Math.round(w/2)-0||y===0||y===h;if(x===d)return edge?cols.rim:cols.lens;if(x===d-1)return edge?cols.rim:(cols.mid||cols.lens);return cols.inner;});
  return G;
}

/* ---- door card: panel with belt cap, armrest and pull, release lever, pocket with floor, speaker. dims in world units from the door's own extents. ---- */
function genDoorCard(sd,door,dm){   // dm.xMin(y): the card stops short of the door's rear edge where it slants
  const inner=new Map();for(const [x,y,z] of door.list()){const k=x+','+y,a=Math.abs(z);if(!inner.has(k)||a<inner.get(k))inner.set(k,a);}
  const X0=dm.x0,X1=dm.x1,Y0=dm.y0,Y1=dm.y1,W=X1-X0,Hh=Y1-Y0;
  const g=new Grid(Math.floor(X0*2)-8,Math.ceil(X1*2)+8,Math.floor((Y0-4)*2),Math.ceil((Y1+6)*2),-80,80);
  const zAt=dm.hi?((x,y,d)=>{if(dm.xMin&&x<dm.xMin(y))return null;const v=inner.get(Math.round(x*2)+','+Math.round(y*2));return v===undefined?null:sd*(v-1-d)/2;})   // dm.hi: door is the drawn 10 mm door grid; the card sits one cell inside its innermost cell
             :((x,y,d)=>{const v=inner.get(Math.round(x)+','+Math.round(y));return v===undefined?null:sd*(v-1-d*.5);});
  const P=(x0,x1,y0,y1,d0,d1,c)=>{for(let i=Math.ceil(x0*2);i<Math.ceil(x1*2);i++)for(let j=Math.ceil(y0*2);j<Math.ceil(y1*2);j++)for(let d=d0;d<=d1;d++){
    const z=zAt(i/2,j/2,d);if(z===null)continue;if(c<0)g.set(i,j,Math.round(z*2),-1);else g.set(i,j,Math.round(z*2),c);}};
  const trim=dm.trim||0x6b6f77,dk=0x34373d,vdk=0x0e0f11,belt=0x1d1e21,pad=0x4a4e55;
  const fx=f=>X0+W*f,fy=f=>Y0+Hh*f;
  P(X0,X1,Y0,Y1,0,0,trim);P(X0,X1,Y1-1.5,Y1,0,1,belt);P(X0,X1,Y0,Y0+1.5,0,1,dk);P(X0,X0+1,Y0,Y1,0,1,dk);P(X1-1,X1,Y0,Y1,0,1,dk);
  P(fx(.3),fx(.78),fy(.45),fy(.52),1,5,dk);P(fx(.3),fx(.78),fy(.50),fy(.52),1,5,pad);P(fx(.4),fx(.66),fy(.46),fy(.50),1,2,vdk);   // armrest, pad, pull recess
  P(fx(.8),fx(.97),fy(.7),fy(.78),1,1,dk);P(fx(.82),fx(.95),fy(.72),fy(.76),2,2,COL.chrome);                                          // release lever
  P(fx(.07),fx(.55),Y0+1.5,fy(.2),1,5,dk);P(fx(.1),fx(.52),Y0+2.5,fy(.2),2,4,-1);P(fx(.1),fx(.52),Y0+2.5,Y0+3.5,2,4,vdk);              // pocket
  for(let i=Math.ceil(fx(.5)*2);i<=Math.ceil(fx(.9)*2);i++)for(let j=Math.ceil((Y0+1.5)*2);j<=Math.ceil(fy(.3)*2);j++){const dd=Math.hypot(i/2-fx(.7),j/2-(Y0+fy(.15)-Y0));if(dd>3.2)continue;const z=zAt(i/2,j/2,1);if(z===null)continue;g.set(i,j,Math.round(z*2),dd>2.7?dk:(((i+j)%2===0)?0x50555c:vdk));}   // speaker
  return g;
}

/* ---- link (wishbone leg, trailing arm, tie rod, half-shaft, damper fork leg) in 10 mm cells along z, cells 0..n. Drawn with segTo(mesh,p0,p1,zAxis,n,.5) it runs from p0 to p1
   (half a cell past each end) with a round section of radius r cells; eye: bushing eyes r+eye at both ends ---- */
function genLink(n,r,col,eye){const R=Math.ceil(r+(eye||0)),g=new Grid(-R,R,-R,R,0,n);
  g.fill((x,y,z)=>{const d=Math.hypot(x,y);if(eye&&(z<=1||z>=n-1)&&d<=r+eye)return 0x1b1c1e;return d<=r?(col||0x2b2e33):-1;});return g;}
/* ---- damper and coil spring in 10 mm cells along y, cells 0..n; drawn with segTo(mesh,p0,p1,yAxis,n,.5). Damper: body radius bodyR over the lower bodyFrac, chrome rod radius rodR above;
   coil: mean radius R, wire radius w, 'turns' turns ---- */
function genDamper(n,bodyR,rodR,bodyFrac,col){const R=Math.ceil(bodyR),g=new Grid(-R,R,0,n,-R,R);
  g.fill((x,y,z)=>{const r=Math.hypot(x,z);if(y<=n*bodyFrac)return r<=bodyR?(y>=n*bodyFrac-1?0x2a2c30:(col||0x3b3f45)):-1;return r<=rodR?COL.chrome:-1;});return g;}
function genCoil(n,R,w,turns,col,perch){const C=Math.ceil(R+w),g=new Grid(-C,C,0,n,-C,C);col=col||0xc4261f;
  for(let t=0;t<=1;t+=.0008){const a=turns*Math.PI*2*t,cx=R*Math.cos(a),cz=R*Math.sin(a),cy=w+(n-2*w)*t;
    for(let x=Math.floor(cx-w);x<=Math.ceil(cx+w);x++)for(let y=Math.floor(cy-w);y<=Math.ceil(cy+w);y++)for(let z=Math.floor(cz-w);z<=Math.ceil(cz+w);z++)if(Math.hypot(x-cx,y-cy,z-cz)<=w)g.set(x,y,z,col);}
  if(perch)for(const [y,rin] of [[0,perch[0]],[n,perch[1]]])for(let x=-C;x<=C;x++)for(let z=-C;z<=C;z++){const r=Math.hypot(x,z);if(r>=rin&&r<=R+w)g.set(x,y,z,0x2a2c30);}   // spring seats: the lower one on the damper, the upper one on the top mount (perch [inner radius at the bottom, at the top])
  return g;}
/* ---- hanging pedal in 10 mm cells, origin at the pivot: a 20 mm arm down to a ribbed pad facing the driver (-x). padW, padH, len in mm ---- */
function genPedal(padW,padH,len){const L=Math.round(len/10),hw=Math.round(padW/20),ph=Math.round(padH/10),g=new Grid(-2,1,-L,0,-hw,hw);
  for(let y=-L;y<=0;y++){if(y<=-L+ph){for(let z=-hw;z<=hw;z++){g.set(0,y,z,0x30343a);g.set(-1,y,z,((y+L)%2===1&&Math.abs(z)<hw)?0x6a6f76:0x2b2e33);}}
    else for(let z=-1;z<=0;z++)g.set(0,y,z,0x2b2e33);}
  return g;}
/* ---- door mirror: black housing on a sail plate seated into the skin (positions in world units: X0 Y0 = the sail plate's lower front corner) ---- */
function genDoorMirror(sd,skinZ,X0,Y0,sz){
  sz=sz||1;const BLK=0x16171a,GLS=0x9bb4c0,gi=x=>Math.round(2*X0)+x,gj=y=>Math.round(2*Y0)+y;
  const zr=skinZ(X0+2.5,Y0+4.5),kref=Math.round(2*zr);
  const mkG=()=>new Grid(gi(-2),gi(14),gj(-2),gj(18),-100,100),shell=mkG(),glass=mkG(),plate=mkG(),housing=mkG();
  const S=(G,x,y,k,c)=>G.set(gi(x),gj(y),sd*k,c);
  for(let x=0;x<=10;x++)for(let y=0;y<=13;y++)if(y<=13-x*1.25){const zs=skinZ((gi(x))/2,(gj(y))/2);if(zs<=0)continue;const kp=Math.round(2*zs);for(let k=kp-2;k<=kp+1;k++){S(shell,x,y,k,BLK);S(plate,x,y,k,BLK);}}
  for(let x=2;x<=6;x++)for(let y=4;y<=9;y++)for(let k=kref-2;k<=kref+5;k++)S(shell,x,y,k,BLK);
  const cz=15,cy=8,a=10*sz,b=6*sz,inside=(y,z,s)=>Math.pow(Math.abs(z-cz)/(a*s),4)+Math.pow(Math.abs(y-cy)/(b*s),4)<=1;
  for(let x=0;x<=9;x++){const sc=x<=5?1:1-(x-5)*.11;for(let y=0;y<=16;y++)for(let z=4;z<=27;z++)if(inside(y,z,sc)){
    if(x===0&&inside(y,z,.85))continue;S(shell,x,y,kref+z,BLK);S(housing,x,y,kref+z,BLK);}}
  for(let y=0;y<=16;y++)for(let z=4;z<=27;z++)if(inside(y,z,.85)){S(glass,1,y,kref+z,GLS);S(shell,1,y,kref+z,-1);}
  return {shell,glass,plate,housing,glassCenter:[X0+.225,Y0+cy*.5,sd*(kref+cz)/2],glassSize:[8.5*sz,5.1*sz]};
}

/* ---- steering wheel (10 mm cells, x-y plane facing +z): rim, three spokes (left, right, bottom), dark hub pad with a plain silver badge disc. look: {rim colour, spoke colour, stitch} ---- */
function genSteeringWheel(dia,look){
  look=Object.assign({rim:0x141517,spoke:0x1b1c1e,hub:0x1a1b1d,badge:0xb9bec5,stitch:0,rimW:2.8,spokes:[Math.PI,0,-Math.PI/2]},look||{});
  const R=dia/20,g=new Grid(-Math.ceil(R)-2,Math.ceil(R)+2,-Math.ceil(R)-2,Math.ceil(R)+2,0,3);
  g.fill((x,y,z)=>{const r=Math.hypot(x,y),a=Math.atan2(y,x);
    if(r>=R-look.rimW&&r<=R)return (look.stitch&&z===0&&Math.abs(y)<1&&x<0&&r>R-look.rimW-.1)?look.stitch:look.rim;
    if(r<=5.5)return z>=2?(r<=2.3?look.badge:look.hub):look.hub;
    for(const s of look.spokes)if(Math.abs(Math.sin(a-s))<.13&&Math.cos(a-s)>0&&r<R-look.rimW)return look.spoke;
    return -1;});
  if(look.stitch)for(let a=0;a<Math.PI*2;a+=.05){const r=R-look.rimW*.5,x=Math.round(r*Math.cos(a)),y=Math.round(r*Math.sin(a));if(Math.abs(Math.sin(a-Math.PI/2))<.12)g.set(x,y,2,look.stitch);}   // top centre mark
  return g;
}
/* ---- short-throw shifters (SPEC-INTERIOR §2): shift time, lever travel and knob style all follow the fitted LIB.shifter record ---- */
function shiftTimeFor(p){return Math.max(0.20,0.35*(1-0.5*((p&&p.throwReduction)||0)));}   // §2.3: hand travel is half a shift; floor 0.20 s (synchros) — DESIGN, never calibrated silently to 1.0
function shiftTime(c){return shiftTimeFor(byId('shifter',c.shifter));}   // the fitted shifter's shift time (stock 0.35 s)
function shiftSS(c){const r=byId('shifter',c.shifter);return 1-((r&&r.throwReduction)||0);}   // §2.4: lever rotation targets scale by (1 - throwReduction)
function shifterKnobStyle(c){const r=byId('shifter',c.shifter);return (r&&r.knob&&r.knob.style)||'ball';}
/* ---- short floor shifter (10 mm cells, origin at the lever pivot): rod and knob at height h (cells) ---- */
function genShifter(h,c){
  const R=byId('shifter',c.shifter)||{},ks=shifterKnobStyle(c),H=h+Math.round((R.leverExtMm||0)/10),g=new Grid(-3,3,0,H,-3,3);   // v20: an extension adds its length to the lever under the knob
  const tiCol=y=>{const t=Math.min(1,Math.max(0,y/Math.max(1,H)));return t<.3?0xb08a4a:t<.55?0x7a4f8a:t<.8?0x3d5aa8:0x5a7fc0;};   // burnt titanium: straw -> purple -> blue up the lever (heat tint)
  const rod=y=>R.lever==='alu'?0xc9ced4:R.lever==='chrome'?0xe6e9ec:R.lever==='ti'?tiCol(y):0x8d9298;
  g.fill((x,y,z)=>{const r=Math.hypot(x,z);
    if(ks==='pistol'){if(y>=H-10&&r<=1.5)return 0x121315;if(y<=H-6&&r<=.75)return rod(y);return -1;}   // pistol grip: a tall vertical grip above the rod (height ~100-130 mm E)
    if(R.leverExtMm&&y>=h-6&&y<=h-4&&r<=1.2)return 0x5c6168;   // the extension's coupler, where the stock knob used to thread on
    if(ks==='puck'){if(y>=H-3&&r<=2.5)return y===H?0xdfe3e6:0xb9bec4;if(y<H-3&&r<=.75)return rod(y);return -1;}   // 50 mm aluminium puck
    if(ks==='alucyl'){if(y>=H-5&&r<=2.2)return y===H-3?0x2a2c30:0xc9ced4;if(y<H-5&&r<=.75)return rod(y);return -1;}   // 45 mm billet cylinder with a dark grip band
    if(ks==='teardrop'){const yc=H-3,f=y<yc?.55+.45*Math.max(0,1-(yc-y)/4):1,d=Math.hypot(x/(2.6*f),(y-yc)/3.1,z/(2.6*f));if(d<=1)return 0xd9dde1;if(y<=H-6&&r<=.75)return rod(y);return -1;}   // weighted steel teardrop, chromed
    if(ks==='tiball'){if(Math.hypot(x,y-(H-2.5),z)<=2.5)return y>H-2?0x5a7fc0:0x7a4f8a;if(y<=H-4&&r<=.75)return rod(y);return -1;}
    if(y<=H-6&&r<=.75)return rod(y);const d=Math.hypot(x,(y-(H-3.5))*1.1,z);if(d<=2.9)return ks==='wood'?0x6b3f1f:0x121315;return -1;});   // ball: black ellipsoid; wood: same shape, Nardi-family wood
  if(ks==='ball'||ks==='wood')for(const [x,z] of [[-1,-1],[-1,0],[-1,1],[1,-1],[1,0],[1,1],[0,0]])if(g.get(x,H-1,z)>=0)g.set(x,H-1,z,0xe8e8e8);   // white H shift pattern on the ball/wood knob's top
  return g;
}
/* ---- Stage B (SPEC-INTERIOR §1/§4/§6): speaker walls + plushies. Every position below is from MEASUREMENT-INT-B0 (never re-measured, never guessed). ---- */
// Wall placement per bench car (mm): rear face at the bench-back rear face (B0 §1.3), capped forward on the E30/e30t to clear the rear-window frame base
// (-1055 at y=900); depth 350 (spec §4 envelope 300-400); top = floor 270 + 830 (E30) / 800 (others) — clears every roof by 175 mm+ and the seat-back lean
// by 45 mm+ at the top front corner (B0-3, §1.1 seat-back-at-height table: E30 -595..-645 at wall-top height vs the wall front face at -690).
const WALL_POS={e30:{x0:-1040,top:1100},e30t:{x0:-1040,top:1100},ef:{x0:-1010,top:1070},ae86:{x0:-1110,top:1070},eclipse:{x0:-1010,top:1070}};
// Bench-set mounts (mm): bench cushion centre x + cushion top y (B0 §1.1/§2.4). The E30 large plush sits on the CUSHION — the parcel shelf does NOT clear
// (1305 vs 1294 glass, B0 §1.4 decision); no shelf mount is offered.
const BENCH_POS={e30:{x:-725,y:500},e30t:{x:-725,y:500},ef:{x:-790,y:440},ae86:{x:-890,y:440},eclipse:{x:-790,y:440}};
// Dash-set mounts (world units, B0 §2.2): the passenger-side dash-top run centre. The three small plushies sit side by side along z at +/-5 units.
const DASH_POS={e30:[32,44,18],e30t:[32,44,18],ef:[38.5,41.5,-18],ae86:[22.5,41,-18],z32:[24.5,40,-18],eclipse:[38.5,37,18],gt2000:[10,41,-18]};
// Eye-line check data (SPEC §6.4 frozen E, world units; eye-to-glass mm from B0 §2.1; dash-top highest point mm from B0 §2.2/§2.3).
// Eclipse eye INTERIM — the check re-runs when the eye is re-measured.
const PLUSH_EYE={e30:{E:[-17.4,55.9,-20.5],glass:1008,hi:890},e30t:{E:[-17.4,55.9,-20.5],glass:1008,hi:890},ef:{E:[-1.5,56.5,18.5],glass:510,hi:830},ae86:{E:[-6.5,56.5,19],glass:650,hi:830},z32:{E:[-24.3,51,21.5],glass:876,hi:811},eclipse:{E:[-1.5,56.5,-18.5],glass:160,hi:750},gt2000:{E:[-36.5,53,20],glass:900,hi:830}};
function segHitsAABB(a,b,box){let t0=0,t1=1;const d=[b[0]-a[0],b[1]-a[1],b[2]-a[2]];   // slab test: segment a->b vs box [x0,x1,y0,y1,z0,z1] (world units)
  for(let i=0;i<3;i++){const o=a[i],mn=box[i*2],mx=box[i*2+1];
    if(Math.abs(d[i])<1e-9){if(o<mn||o>mx)return false;}
    else{let ta=(mn-o)/d[i],tb=(mx-o)/d[i];if(ta>tb){const t=ta;ta=tb;tb=t;}t0=Math.max(t0,ta);t1=Math.min(t1,tb);if(t0>t1)return false;}}
  return true;}
// the three small dash plushies' AABBs (world units): 150 mm tall on a 120 mm footprint, base on the dash-top mount, side by side along z
function dashPlushAABBs(carId){const m=DASH_POS[carId];if(!m)return [];const out=[];for(const off of [-5,0,5])out.push([m[0]-3,m[0]+3,m[1],m[1]+8,m[2]+off-3,m[2]+off+3]);return out;}   // 8 units = 160 mm: the tallest BUILT small plush (the alien's antennae) measures 160 mm live; a 150 mm box understated its top by 10 mm
// SPEC §6.4: BLOCK iff any dash plush AABB intersects the sightline segment E->W. clearanceMm = the built 160 mm plush's (tallest small) vertical clearance over the
// highest dash-top point (B0 §2.3 method; Z32 49 mm is the thin one — the Stage B verifier confirms the built height there).
function eyeLineCheck(carId){const t=PLUSH_EYE[carId];if(!t)return {blocked:false,clearanceMm:null};
  const E=t.E,W=[E[0]+t.glass/20,E[1],E[2]];let blocked=false;
  for(const b of dashPlushAABBs(carId))if(segHitsAABB(E,W,b))blocked=true;
  return {blocked,clearanceMm:Math.round(E[1]*20-(t.hi+160))};}   // 160 mm = the tallest built small plush; Z32 is the thin one (49 mm after this fix, was 59 on the 150 mm figure)
function plushBlob(g,cx,cy,cz,rx,ry,rz,col){for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++)for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++)for(let z=Math.floor(cz-rz);z<=Math.ceil(cz+rz);z++){const d=((x-cx)/rx)**2+((y-cy)/ry)**2+((z-cz)/rz)**2;if(d<=1)g.set(x,y,z,col);}}
// a plush critter in local 10 mm cells: origin at the base centre, y up, face toward +x. s scales the 30-cell medium design (small 150, medium 300, large 400).
// Original designs only, generic style terms (§6.2): white cat with bow, blue alien with big ears, brown bear, pink bunny, frog. No trademarked names or likeness.
function genPlush(kind,sizeMm){
  const s=sizeMm/300,R=Math.ceil(13*s),H=Math.ceil(33*s),g=new Grid(-R,R,0,H,-R,R);
  const P=(x,y,z,rx,ry,rz,c)=>plushBlob(g,x*s,y*s,z*s,Math.max(1,rx*s),Math.max(1,ry*s),Math.max(1,rz*s),c);
  const D=0x1a1a1a;   // face dots (eyes / nose / mouth)
  if(kind==='bear'){P(0,9,0,8,9,7,0x8b5a2b);P(6,9,0,2,5,4,0xd2a679);P(0,23,0,6.5,6.5,6,0x8b5a2b);P(0,28,4.5,2.5,2.5,2,0x8b5a2b);P(0,28,-4.5,2.5,2.5,2,0x8b5a2b);P(5.5,21,0,2,2,2.5,0xd2a679);P(6,25,2.5,1,1,1,D);P(6,25,-2.5,1,1,1,D);P(7.5,22,0,1,1,1,D);}
  else if(kind==='bunny'){P(0,7,0,6,7,5,0xf2a7c3);P(0,19,0,5.5,5.5,5,0xf2a7c3);P(0,27,2.5,2,5,1.5,0xf2a7c3);P(0,27,-2.5,2,5,1.5,0xf2a7c3);P(0,27,2.5,1,3.5,0.8,0xf78fb3);P(0,27,-2.5,1,3.5,0.8,0xf78fb3);P(5,21,2.5,1,1,1,D);P(5,21,-2.5,1,1,1,D);P(5.5,19,0,1,1,1,0xd6336c);}
  else if(kind==='cat'){P(0,7,0,6,7,5,0xf2f0eb);P(0,19,0,5.5,5,5,0xf2f0eb);P(0,24,4,2.5,3,1.5,0xf2f0eb);P(0,24,-4,2.5,3,1.5,0xf2f0eb);P(0,24,4,1.2,1.8,0.8,0xf2a7c3);P(0,24,-4,1.2,1.8,0.8,0xf2a7c3);P(5,21,2.5,1,1,1,D);P(5,21,-2.5,1,1,1,D);P(5.5,19,0,1,1,1,0xf2a7c3);g.set(Math.round(4*s),Math.round(15*s),0,0xc4261f);g.set(Math.round(4*s),Math.round(15*s),Math.round(2*s),0xc4261f);g.set(Math.round(4*s),Math.round(15*s),Math.round(-2*s),0xc4261f);}   // a red bow at the neck
  else if(kind==='alien'){P(0,7,0,6,7,5,0x3a6fd6);P(5,7,0,1.5,5,3.5,0x7aa7e8);P(0,20,0,7,7,6.5,0x3a6fd6);P(0,20,8,2,4,3,0x3a6fd6);P(0,20,-8,2,4,3,0x3a6fd6);P(6,22,3,1,2.5,2,D);P(6,22,-3,1,2.5,2,D);P(0,28,3,1,2.5,1,0x3a6fd6);P(0,28,-3,1,2.5,1,0x3a6fd6);g.set(0,Math.round(30*s),Math.round(3*s),0xe8e8e8);g.set(0,Math.round(30*s),Math.round(-3*s),0xe8e8e8);}   // antennae with pale tips
  else if(kind==='frog'){P(0,7,0,7,7,6,0x4caf50);P(5,7,0,1.5,5,4,0xc8e6a0);P(0,19,0,6,5,5.5,0x4caf50);P(0,24,3,2.5,2.5,2.5,0x4caf50);P(0,24,-3,2.5,2.5,2.5,0x4caf50);P(2,24,3,1,1,1,D);P(2,24,-3,1,1,1,D);for(let z=-3;z<=3;z++)g.set(Math.round(5*s),Math.round(17*s),Math.round(z*s),D);}   // wide mouth
  // v20 original characters (owner, 2026-11-05: more variety, sized in proportion): a fox, a duckling, a panda, a seal pup
  else if(kind==='fox'){P(0,8,0,6.5,8,5.5,0xe0712b);P(4.5,8,0,2,5.5,3.5,0xf6e7d2);P(0,20,0,5.5,5,5,0xe0712b);P(4.5,18.5,0,2.5,2,2.5,0xf6e7d2);P(0,26,3.2,1.6,3.5,1.2,0xe0712b);P(0,26,-3.2,1.6,3.5,1.2,0xe0712b);P(0,28.5,3.2,1,1.2,.8,0x2a1a10);P(0,28.5,-3.2,1,1.2,.8,0x2a1a10);P(-6,6,3,5,3,3,0xe0712b);P(-9.5,7,4.5,2,2,2,0xf6e7d2);P(5,21.5,2.2,1,1,1,D);P(5,21.5,-2.2,1,1,1,D);P(7,19,0,1,1,1,D);}
  else if(kind==='duck'){P(0,8,0,7,7,6,0xf4d03f);P(0,19,1,5,5,4.5,0xf4d03f);P(5,18,0,2.5,1,2,0xe67e22);P(2,1,2.5,3,1,2,0xe67e22);P(2,1,-2.5,3,1,2,0xe67e22);P(0,9,6,4,4,1.5,0xf1c40f);P(0,9,-6,4,4,1.5,0xf1c40f);P(4,20.5,2,1,1,1,D);P(4,20.5,-2,1,1,1,D);}
  else if(kind==='panda'){P(0,9,0,8,9,7,0xf2f2f2);P(0,23,0,6.5,6.5,6,0xf2f2f2);P(0,28,4.5,2.5,2.5,2,0x1c1c1c);P(0,28,-4.5,2.5,2.5,2,0x1c1c1c);P(5,24.5,2.5,1.5,2,1.5,0x1c1c1c);P(5,24.5,-2.5,1.5,2,1.5,0x1c1c1c);P(6,25,2.5,.8,.8,.8,0xf2f2f2);P(6,25,-2.5,.8,.8,.8,0xf2f2f2);P(6.5,21.5,0,1,1,1,D);P(3,13,6.5,2.5,5,2.5,0x1c1c1c);P(3,13,-6.5,2.5,5,2.5,0x1c1c1c);P(4,2,3.5,3,2,2.5,0x1c1c1c);P(4,2,-3.5,3,2,2.5,0x1c1c1c);}
  else if(kind==='seal'){P(0,8,0,8,8,7,0xdfe6ec);P(0,18,0,6,6,6,0xdfe6ec);P(3,6,6.5,3,1.5,2,0xc5cfd6);P(3,6,-6.5,3,1.5,2,0xc5cfd6);P(-8,3,0,3,2,4,0xc5cfd6);P(5.5,19.5,2.2,1,1,1,D);P(5.5,19.5,-2.2,1,1,1,D);P(6,17.5,0,1,.8,1.2,D);P(5,17,3.5,.8,.8,1,0xf2a7c3);P(5,17,-3.5,.8,.8,1,0xf2a7c3);}
  return g;}
const _wallGrids={},_plushGrids={};
function buildWallGrid(kind,carId){ // 10 mm cells, absolute car coords (mm/10): the wall stands in the bench area, rear face at the bulkhead, front face 350 forward
  const p=WALL_POS[carId];if(!p)return new Grid(0,0,0,0,0,0);
  const x0=Math.round(p.x0/10),x1=x0+35,y0=27,y1=Math.round(p.top/10),z0=-53,z1=53;
  const g=new Grid(x0,x1+3,y0,y1,z0,z1),MDF=0x2a2c30,face=x1;   // +3: the discs reach face+2 and the amp boxes face+3 — the Grid's max must cover them or Grid.set silently drops the protrusion cells (caught by grid dump: all disc/amp colours were a single flat layer at x=face)
  box(g,x0,x1,y0,y1,z0,z1,MDF);   // the MDF wall panel, solid
  const disc=(cy,cz,r,ring,cone,cap)=>{cylX(g,cy,cz,r,face,face+2,ring);cylX(g,cy,cz,r-2,face,face+2,cone);cylX(g,cy,cz,Math.max(2,r-9),face,face+2,cap);};
  for(const sz of [-32,32])disc(50,sz,15,0x3a3d44,0x141518,0x2f3237);   // 2x 12-inch subs, low, dia 305 mm
  const quad=(zc)=>{for(const dy of [-8,8])for(const dz of [-8,8])disc(82+dy,zc+dz,8,0x3a3d44,0x1a1c1f,0x2f3237);};   // a chuchero quad box: 2x2 of dia 160 mm mids
  if(kind==='wall-street'){quad(0);box(g,face,face+3,27,39,-12,12,0x16171a);box(g,face,face+3,32,34,-12,12,0x8d9298);}   // 1 quad box high centre + 1 amp low centre (silver stripe)
  else{quad(-36);quad(36);box(g,face,face+3,27,39,-12,12,0x16171a);box(g,face,face+3,32,34,-12,12,0x8d9298);box(g,face,face+3,41,53,-12,12,0x16171a);box(g,face,face+3,46,48,-12,12,0x8d9298);}   // 2 quad boxes + 2 amps
  return g;}
function genWallGrid(kind,carId){const k=kind+'/'+carId;if(!_wallGrids[k])_wallGrids[k]=buildWallGrid(kind,carId);return _wallGrids[k];}   // cached: the wall depends only on kind + car (geoData never mutates a grid)
function genPlushCached(kind,sizeMm){const k=kind+'/'+sizeMm;if(!_plushGrids[k])_plushGrids[k]=genPlush(kind,sizeMm);return _plushGrids[k];}
/* v20 the trunk (the AE86's hatch area, behind the rear seat back): plushies in rows by size facing the hatch, the biggest against the seat
   back; or a fitted speaker wall / a twin-12 sub box on the cargo floor against the seat back, firing at the hatch (the classic hatchback
   install). TRUNK_POS mm: x0 = the seat back's rear face, x1 = the cargo floor's rear end at the hatch opening (read off the AE86 build). */
const TRUNK_POS={ae86:{x0:-1125,x1:-1880,half:27}};
function stageTrunk(c,body,P,o,push,carId){const t=TRUNK_POS[carId],r=c.trunk&&c.trunk!=='none'&&byId('trunk',c.trunk);if(!t||!r)return;
  const X0=t.x0/20,X1=t.x1/20;
  if(r.kind==='plush'){for(const m of plushStack(Object.assign({},o,{rotY:true}),X1,X0,t.half,0,-1))push(m);}
  else if(r.kind==='wall'||r.kind==='box'){const xb=Math.round(t.x0/10)-1,G=buildWallFit(r.kind==='box'?'box':r.wall,carId,o.solid,{x0:xb-(r.kind==='box'?37:34),x1:xb,dir:-1,yCap:r.kind==='box'?40:140,zCap:r.kind==='box'?40:75});if(G)push(o.mk(G,o.matV,0,body,.5));}}
// called from each module's setSeats, after the seats/bench are built; pushes the Stage B meshes into P.seatMeshes so they rebuild with the seats.
// c = cfg (the IIFE-local cfg is passed in — this helper is top-level); body/P/cp are the module's own.
// mk + matV are passed in too: both live inside the driver IIFE (mk line 9388), exposed on G and destructured by each module's prologue — bare mk/matV are undefined at top level (probe crash: 'mk is not defined').
/* ---- v20: nothing floats. cabinSolid: is a body-frame point (world units) inside the body's 10 mm panels or any cabin mesh (interior, dash, trim,
   seats built so far, placed items)? dropOn: lower a 10 mm-cell grid (origin = base centre, drawn at scale .5) from yTop until one of its columns'
   lowest cells sits on something; fitsAt: none of its cells inside anything. occ: the 10 mm cells already taken by items placed in this pass. ---- */
function cabinSolid(P,body,skip,keys){
  const hiG=[];const R=P.hiRef||null;   // the module puts build.r.hi on P before its stage calls (build is not visible up here)
  if(R)for(const v of Object.values(R)){if(v instanceof Grid)hiG.push(v);else if(v&&typeof v==='object')for(const w of Object.values(v))if(w instanceof Grid)hiG.push(w);}
  body.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(body.matrixWorld).invert(),L=[];
  const add=o=>{if(!o||(skip&&skip.includes(o)))return;if(Array.isArray(o)){o.forEach(add);return;}if(!o.isObject3D)return;
    if(o.isMesh&&o.visible!==false&&o.geometry&&o.geometry.userData&&o.geometry.userData.src){const M=new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld).invert();L.push({G:o.geometry.userData.src,e:M.elements,sel:o.geometry.userData.sel||0});}
    for(const c of o.children||[])add(c);};
  for(const k of keys||['interior','dashDetail','cargo','dTrim','shelf','pedalBox','seatMeshes','doorCards','imirror','visors','popLiner'])add(P[k]);
  const PNT=0x00fe01,take=(v,sel)=>v>=0&&(sel===1?(v===PNT||v===0x00fe02):sel===2?(v!==PNT&&v!==0x00fe02):true);
  const memo=new Map();   // one answer per 10 mm cell (the drops ask the same cells many times)
  return (x,y,z)=>{const i=Math.round(x*2),j=Math.round(y*2),k=Math.round(z*2),key=((i+1000)*2000+(j+1000))*2000+(k+1000);let r=memo.get(key);if(r!==undefined)return r;r=false;
    for(const G of hiG)if(G.get(i,j,k)>=0){r=true;break;}
    if(!r){const X0=i/2,Y0=j/2,Z0=k/2;for(const q of L){const e=q.e,X=e[0]*X0+e[4]*Y0+e[8]*Z0+e[12],Y=e[1]*X0+e[5]*Y0+e[9]*Z0+e[13],Z=e[2]*X0+e[6]*Y0+e[10]*Z0+e[14];if(take(q.G.get(X,Y,Z),q.sel)){r=true;break;}}}
    memo.set(key,r);return r;};}
const occKey=(x,y,z)=>Math.round(x*2)+','+Math.round(y*2)+','+Math.round(z*2);
function itemCells(G,rotY){const o=[];for(const [i,j,k] of G.list())o.push([rotY?-i:i,j,rotY?-k:k]);return o;}
function dropOn(G,x,z,yTop,yMin,solid,occ,rotY){const low=new Map();for(const [i,j,k] of itemCells(G,rotY)){const q=i+','+k;if(!low.has(q)||j<low.get(q)[1])low.set(q,[i,j,k]);}
  const pts=[...low.values()],hit=(px,py,pz)=>solid(px,py,pz)||(occ&&occ.has(occKey(px,py,pz)));
  for(let y=yTop;y>=yMin;y-=.5)for(const [i,j,k] of pts)if(hit(x+i*.5,y+(j-1)*.5,z+k*.5))return y;return null;}
function fitsAt(G,x,y,z,solid,occ,rotY){for(const [i,j,k] of itemCells(G,rotY)){const px=x+i*.5,py=y+j*.5,pz=z+k*.5;if(solid(px,py,pz)||(occ&&occ.has(occKey(px,py,pz))))return false;}return true;}
function occAdd(G,x,y,z,occ,rotY){for(const [i,j,k] of itemCells(G,rotY))occ.add(occKey(x+i*.5,y+j*.5,z+k*.5));}
function ceilingAt(solid,x,z,y0){let y=y0;while(y<72&&!solid(x,y,z))y+=.5;while(y<72&&solid(x,y,z))y+=.5;while(y<72&&!solid(x,y,z))y+=.5;return y;}   // up from under the car: through the floor, then to the first thing above it (the headliner, a parcel shelf, the cargo cover)
// place one item: dropped from just under the headliner at (x,z); nudged up to 3 cells toward the centre line if its sides catch; returns the mesh or null
function placeItem(G,x,z,o){const H=(G.y1+1)*.5,rotY=!!o.rotY;
  const zs=[z];for(const d of [.5,1,1.5])if(Math.abs(z-(o.zc||0))<.25)zs.push(z-d,z+d);else zs.push(z-Math.sign(z-(o.zc||0))*d);
  for(const zz of zs){
    const c=ceilingAt(o.solid,x,zz,o.yMin+1),y=dropOn(G,x,zz,Math.min(o.yTop,c-H-.5),o.yMin,o.solid,o.occ,rotY);if(y===null)continue;
    if(!fitsAt(G,x,y,zz,o.solid,o.occ,rotY))continue;const m=o.mk(G,o.matV,0,o.body,.5);if(!m)return null;m.position.set(x,y,zz);if(rotY)m.rotation.y=Math.PI;occAdd(G,x,y,zz,o.occ,rotY);return m;}
  return null;}
// plushies arranged by size, like a class photo: the big ones in the back row, the middling ones in front of them, the small ones at the front;
// each sits on the floor (or the seat) it is lowered onto, side by side along the row with a cell between neighbours; nothing is stacked
// a pile with some thought in it: the biggest that fit stand on the floor in a row at the back; the next size down sits in the gaps between them
// (each lowered until it rests on the ones below, so it nestles rather than towers); the small ones go in the gaps of that tier and along the front
const PLUSH_TIERS=[[400,['bear','panda']],[300,['fox','bunny','cat','seal','alien','frog']],[150,['duck','cat','frog','bunny','fox','seal']]];
function plushStack(o,x0,x1,zHalf,zc,dir){zc=zc||0;dir=dir||1;const out=[],depth=x1-x0;let q=0,prevZ=null,xb=null;
  const tiers=PLUSH_TIERS.filter(([size])=>(Math.ceil(13*size/300)+1)<=depth+.5);   // only sizes whose depth fits the area
  for(const [size,kinds] of tiers){const G0=genPlushCached(kinds[0],size),half=(G0.x1+1)*.5,w=(G0.z1-G0.z0+2)*.5;
    const x=(dir>0?x0:x1)+dir*(half+.25);let zs=[];
    if(prevZ===null){const n=Math.max(1,Math.floor((2*zHalf+.5)/w));for(let c=0;c<n;c++)zs.push(zc+(c-(n-1)/2)*w);}
    else{for(let c=0;c<prevZ.length-1;c++)zs.push((prevZ[c]+prevZ[c+1])/2);zs.push(prevZ[0]-w/2,prevZ[prevZ.length-1]+w/2);}
    const placed=[];for(const z of zs){if(Math.abs(z-zc)>zHalf)continue;const G=genPlushCached(kinds[(q++)%kinds.length],size);let m=null;for(let k=0;k<=10&&!m;k++)m=placeItem(G,x+dir*k*.5,z,o);if(m){out.push(m);placed.push(z);}}
    if(placed.length)prevZ=placed.sort((a,b)=>a-b);}
  // a front row of small ones on the floor, if the area is deep enough
  const S=genPlushCached('duck',150),sh=(S.x1+1)*.5,sw=(S.z1-S.z0+2)*.5,xf=(dir>0?x1:x0)-dir*(sh+.25);
  for(let c=0;c<Math.floor((2*zHalf+.5)/sw);c++){const z=zc+(c-(Math.floor((2*zHalf+.5)/sw)-1)/2)*sw,G=genPlushCached(PLUSH_TIERS[2][1][(q++)%6],150),m=placeItem(G,xf,z,o);if(m)out.push(m);}
  return out;}
// the speaker wall, built to the car: an MDF slab between the bulkhead and 350 mm forward, each 10 mm column from the floor (or the wheel tub) up to
// 10 mm under the headliner, 10 mm off the trims; the subs, the quad boxes and the amps on its front face only where the slab is behind them
function buildWallFit(kind,carId,solid,at){   // at (optional): {x0,x1 (10 mm cells), dir: +1 face forward / -1 face rearward, yCap, zCap}
  const p=WALL_POS[carId];if(!p&&!at)return null;const x0=at?at.x0:Math.round(p.x0/10)+1,x1=at?at.x1:x0+34,dir=at?at.dir:1,face=dir>0?x1:x0,FO=dir,yCap=at&&at.yCap||140,zCap=at&&at.zCap||75,MDF=0x2a2c30,cells=new Map(),key=(i,j,k)=>i+','+j+','+k;
  const free=(i,j,k)=>!solid(i/2,j/2,k/2);
  for(let k=-zCap;k<=zCap;k++)for(let i=x0;i<=x1;i++){let j=14;while(j<70&&free(i,j,k))j++;if(j>=70)continue;   // up from under the car to the floor (or the tub)...
      while(j<140&&!free(i,j,k))j++;   // ...through it...
      j=Math.max(j,27);   // not below 270 mm: the rear links' tops reach 255 under the floor's thinnest spots (the panel is one rigid piece; it bears on the floor everywhere else)
      const jTop=Math.min(140,j+yCap);for(;j<jTop;j++){if(!free(i,j+1,k)||!free(i,j,k-1)||!free(i,j,k+1))break;cells.set(key(i,j,k),MDF);}}   // ...and up from its top surface (to the cap, for a box)
  if(!cells.size)return null;
  const has=(i,j,k)=>cells.has(key(i,j,k)),put=(i,j,k,c)=>{if(i===face+1||has(face,j,k))cells.set(key(i,j,k),c);};
  const disc=(cy,cz,r,ring,cone,cap)=>{for(let j=Math.floor(cy-r);j<=Math.ceil(cy+r);j++)for(let k=Math.floor(cz-r);k<=Math.ceil(cz+r);k++){const d=Math.hypot(j-cy,k-cz);if(d>r||!has(face,j,k))continue;
      for(let t=1;t<=2;t++)cells.set(key(face+FO*t,j,k),d>r-2?ring:(d>Math.max(2,r-9)?cone:cap));}};
  // where the slab is: its mid height and half width at the subs' and the quads' heights
  let ys=[];for(const q of cells.keys()){const [i,j,k]=q.split(',').map(Number);if(i===face)ys.push(j);}ys.sort((a,b)=>a-b);const jLo=ys[0],jHi=ys[ys.length-1];
  const half=j=>{let m=0;for(let k=0;k<=75;k++)if(has(face,j,k)&&has(face,j,-k))m=k;return m;};
  const jSub=Math.min(jLo+17,Math.floor((jLo+jHi)/2)),hS=half(jSub),zSub=Math.min(32,hS-16);for(const sz of [-zSub,zSub])disc(jSub,sz,15,0x3a3d44,0x141518,0x2f3237);   // 2x 12-inch subs, low (dia 305 mm)
  const quad=(jc,zc)=>{for(const dy of [-8,8])for(const dz of [-8,8])disc(jc+dy,zc+dz,8,0x3a3d44,0x1a1c1f,0x2f3237);};   // a quad box: 2x2 of dia 160 mm mids
  const jQ=Math.min(jHi-10,jSub+33),hQ=half(jQ);
  const amp=(j0,j1)=>{for(let j=j0;j<=j1;j++)for(let k=-12;k<=12;k++)if(has(face,j,k))for(let t=1;t<=3;t++)cells.set(key(face+FO*t,j,k),(j===Math.round((j0+j1)/2)||j===Math.round((j0+j1)/2)+1)?0x8d9298:0x16171a);};
  if(kind==='box'){}   // a sub box: the two subs only
  else if(kind==='wall-street'){quad(jQ,0);amp(jLo+1,jLo+12);}
  else{const zq=Math.min(36,hQ-17);quad(jQ,-zq);quad(jQ,zq);amp(jLo+1,jLo+12);amp(jSub+19,jSub+30);}   // 2 quad boxes + 2 amps
  let b=[1e9,-1e9,1e9,-1e9,1e9,-1e9];for(const q of cells.keys()){const [i,j,k]=q.split(',').map(Number);b=[Math.min(b[0],i),Math.max(b[1],i),Math.min(b[2],j),Math.max(b[3],j),Math.min(b[4],k),Math.max(b[5],k)];}
  const G=new Grid(...b);for(const [q,c] of cells){const [i,j,k]=q.split(',').map(Number);G.set(i,j,k,c);}return G;}
// called from each module's setSeats, after the seats/bench are built; pushes the Stage B meshes into P.seatMeshes so they rebuild with the seats.
// c = cfg (the IIFE-local cfg is passed in — this helper is top-level); body/P/cp are the module's own.
function stageBParts(c,body,P,cp,mk,matV){
  const carId=CAR.id,occ=new Set(),solid=cabinSolid(P,body),o={solid,occ,mk,matV,body,yMin:8,yTop:70};
  const push=m=>{if(m)P.seatMeshes.push(m);};
  if(c.rearArea&&c.rearArea!=='stock'&&c.rearArea!=='removed'){const r=byId('rearArea',c.rearArea);
    if(r&&r.kind==='wall'){const G=buildWallFit(r.id,carId,solid);if(G)push(mk(G,matV,0,body,.5));}
    else if(r&&r.kind==='plush'){const bp=BENCH_POS[carId];   // the bench set sits ON the bench cushion: each plush is lowered onto it
      if(bp){push(placeItem(genPlushCached('bear',400),bp.x/20,0,o));push(placeItem(genPlushCached('bunny',300),bp.x/20,-22,o));push(placeItem(genPlushCached('cat',300),bp.x/20,22,o));}}
    else if(r&&r.kind==='plushwall'){const wp=WALL_POS[carId],bp=BENCH_POS[carId];   // the rear area stacked full, bench out: from the bulkhead to the bench's front edge
      if(wp&&bp)for(const m of plushStack(o,wp.x0/20+.5,(bp.x+260)/20,30))push(m);}}
  stageTrunk(c,body,P,o,push,carId);
  if(c.passArea&&c.passArea!=='stock'&&c.passArea!=='removed'){const r=byId('passArea',c.passArea);
    if(r&&cp&&cp.H){const passSd=(cp.eye&&cp.eye.z<0)?1:-1,pz=passSd*cp.H.z;   // the passenger side is opposite the driver's eye (B0 §2.2 convention)
      if(r.kind==='plush'){push(placeItem(genPlushCached('alien',300),cp.H.x,pz-7*passSd,o));push(placeItem(genPlushCached('frog',300),cp.H.x,pz+7*passSd,o));}   // side by side on the floor where the seat was (they overlapped at +/-5)
      else if(r.kind==='plushwall'){const sub={solid:(x,y,z)=>solid(x,y,z)||Math.abs(z-pz)>13,occ,mk,matV,body,yMin:8,yTop:50,zc:pz};for(const m of plushStack(sub,cp.H.x-14,cp.H.x+12,12,pz))push(m);}}}   // the seat's footprint: a big one at the back, smaller ones in front
  if(c.dashPlush&&c.dashPlush!=='none'){const r=byId('dashPlush',c.dashPlush),dm=DASH_POS[carId];
    if(r&&dm){const kinds=['cat','alien','frog'],od=Object.assign({},o,{rotY:true,yTop:dm[1]+6,yMin:dm[1]-8});
      for(let i=0;i<3;i++)push(placeItem(genPlushCached(kinds[i],150),dm[0],dm[2]+(i-1)*5,od));}}   // lowered onto the dash top, facing the cabin
}
// ---------- INTERIOR STAGE C (SPEC-INTERIOR §5): nitrous — the bottle + bay hardware ----------
// The bottle stands in the REAR BENCH AREA on a bracketed base plate — never in the trunk:
// the E30 coupe trunk floor is a slope (265→555 over 480 mm, no flat 180 mm spot for a
// standing Ø178 mm bottle — B0 §5). The bench floor under the bottle footprint, bench
// removed, was measured live (probe-interior-stageC-measure.py + measure2.py): flat on
// every bench car over the full 200 mm plate — e30/e30t 475, ef 315, eclipse 345, and
// ae86 315, where the floor steps 315→295 forward of x=-890, so the AE86 bottle centre
// sits 100 mm rearward (-990) and its plate spans -1090..-890, all on the 315 flat
// (the bulkhead face is at -1110; the plate's rear edge clears it by 20 mm).
// NITROUS_BOTTLE_POS: bottle centre x (mm) + bench-floor height (mm) per bench car.
const NITROUS_BOTTLE_POS={e30:{x:-725,floor:475},e30t:{x:-725,floor:475},ef:{x:-790,floor:315},ae86:{x:-990,floor:315},eclipse:{x:-790,floor:345}};
const NITROUS_BOTTLE={dia:178,len:480};   // Ø178 mm frozen (§5.2); body 480 mm (E — sourced overall 533 mm NOS / 513 mm NX with valve, body ≈ overall minus valve; OPEN-INT-7)
function nosBox(g,x0,y0,z0,x1,y1,z1,c){for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++)for(let z=z0;z<=z1;z++)g.set(x,y,z,c);}
// a 10 lb nitrous bottle in local 10 mm cells: origin at the base centre on the floor,
// y up, +x forward. Built diameter quantizes to 170 mm (r=8.9 cells) on the 10 mm grid —
// documented, not hidden. Plate 200×20×200, body NOS blue, white label band, 2 clamp
// bands + straps, brass valve + red T-handle + pressure gauge, braided feed-line stub
// down the rear face to the floor.
function genNitrousBottle(){
  const g=new Grid(-12,12,0,56,-13,12);
  nosBox(g,-10,0,-10,10,1,10,0x2a2c30);   // base plate 200×20×200
  cylY(g,0,0,8.9,2,50,0x1a3a8f);   // bottle body, y 20..500 (480 mm)
  cylY(g,0,0,9.0,20,28,0xf2f2f2);   // white label band, y 200..280
  cylY(g,0,0,9.2,8,9,0x1c1e22);cylY(g,0,0,9.2,42,43,0x1c1e22);   // clamp bands
  nosBox(g,-2,2,9,2,43,10,0x1c1e22);nosBox(g,-2,2,-10,2,43,-9,0x1c1e22);   // straps, plate to top band
  cylY(g,0,0,2,50,53,0xb08d3c);   // brass valve, y 500..530
  nosBox(g,-3,53,-1,3,54,1,0x8a1f1f);   // red T-handle
  nosBox(g,2,51,-1,4,51,1,0xb08d3c);cylY(g,4,0,1.5,51,52,0xf2f2f2);   // pressure gauge on a brass arm
  segFill(g,[0,51,-9.5],[0,44,-11.5],0.8,0x8a8f96);   // braided feed-line stub, valve → floor
  segFill(g,[0,44,-11.5],[0,2,-11.5],0.8,0x8a8f96);
  segFill(g,[0,2,-11.5],[-5,0,-11.5],0.8,0x8a8f96);
  return g;}
// the bay hardware in local 10 mm cells, origin at the throttle body (tb, body-frame
// world units), +x forward. Solenoid block tight to the tb (mounted on the intake),
// fogger nozzle forward into the tb, feed line solenoids→nozzle. Wet kits add the
// dark-red fuel solenoid beside the blue nitrous one.
function genNitrousBay(wet){
  const g=new Grid(-8,8,-4,8,-8,8);
  nosBox(g,-4,1,-2,-1,4,2,0x1a3a8f);   // nitrous solenoid, 30×30×40, tight to the tb
  if(wet)nosBox(g,-4,1,3,-1,4,6,0x8a1f1f);   // fuel solenoid (wet only)
  cylX(g,0,0,1,0,4,0xb08d3c);   // brass fogger nozzle, tb forward 40 mm
  segFill(g,[-4,4,0],[1,1,0],0.6,0x8a8f96);   // feed line, solenoids→nozzle
  return g;}
function stageCParts(c,body,P,cp,tb,mk,matV){
  const carId=CAR.id,kit=c&&c.rearArea?byId('rearArea',c.rearArea):null;   // CAR.id, as stageBParts does — P.carId is never assigned and cfg.car is not set, so the (P&&P.carId)||(c&&c.car)||'e30' chain fell through to 'e30' on every car
  if(!kit||kit.kind!=='nitrous')return;
  const bp=NITROUS_BOTTLE_POS[carId];if(!bp)return;
  const NG=genNitrousBottle(),solid=cabinSolid(P,body),ny=dropOn(NG,bp.x/20,0,bp.floor/20+8,bp.floor/20-6,solid,null);   // v20: the base plate is lowered onto the floor it bolts to (measured, not assumed)
  const bm=mk(NG,matV,0,body,.5);
  if(bm){bm.position.set(bp.x/20,ny===null?bp.floor/20:ny,0);P.seatMeshes.push(bm);}
  if(tb){const BG=genNitrousBay(!!kit.wet),es=cabinSolid(P,body,null,['engMesh','hoses','bay','fan','accMesh','mounts','popLiner']);let at=null;   // v20: the solenoid block goes where it clears the intake and the hoses and still bears on the intake
    const touches=(x,y,z)=>{for(const [i,j,k] of itemCells(BG,false))for(const [a,b,c] of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]])if(es(x+(i+a)*.5,y+(j+b)*.5,z+(k+c)*.5))return true;return false;};
    for(const dy of [0,.5,1,1.5,2,2.5,3])for(const dz of [0,-.5,.5,-1,1,-1.5,1.5,-2,2,-3,3])for(const dx of [0,-1,1,-2,2]){if(at)break;const x=tb[0]+dx,y=tb[1]+dy,z=tb[2]+dz;if(fitsAt(BG,x,y,z,es,null,false)&&touches(x,y,z))at=[x,y,z];}
    const bay=at&&mk(BG,matV,0,body,.5);if(bay){bay.position.set(...at);P.seatMeshes.push(bay);}}
}
/* ---- v20 STAGE D: the drift handbrake and the mirror hanger (owner, 2026-11-05) ---- */
// hydraulic handbrake, 10 mm cells, origin on the lever pivot at the top of its base plate, +x forward: base plate bolted to the tunnel, the master
// cylinder lying behind the pivot with its reservoir, two braided lines down into the tunnel, the lever (L cells) and its rubber grip
function genHydroBase(){const g=new Grid(-16,4,-6,4,-3,3);
  nosBox(g,-5,-1,-3,3,0,3,0x2a2c30);   // base plate 90 x 70, 20 thick
  cylX(g,1.5,0,1.3,-14,-2,0xb9bec4);   // master cylinder, 25 mm bore body, 130 mm long, behind the pivot
  cylY(g,-12,0,1.2,2,4,0x1c1e22);      // fluid reservoir with a black cap
  segFill(g,[-14,1,-1],[-16,-5,-1],.6,0x8a8f96);segFill(g,[-14,1,1],[-16,-5,1],.6,0x8a8f96);   // braided lines into the tunnel
  for(const z of [-2,2])nosBox(g,-1,1,z,1,3,z,0x5c6168);   // the lever's clevis cheeks
  return g;}
function genHydroLever(L){const g=new Grid(-2,2,0,L+1,-2,2);
  for(let y=0;y<=L;y++)for(let x=-1;x<=0;x++)for(let z=-1;z<=0;z++)g.set(x,y,z,y>L-11?0x121315:0xc9ced4);   // polished lever, rubber grip on the top 110 mm
  for(let y=L-11;y<=L;y++)for(const [x,z] of [[-2,-1],[-2,0],[1,-1],[1,0],[-1,-2],[0,-2],[-1,1],[0,1]])g.set(x,y,z,0x121315);
  g.set(-1,L+1,-1,0xc02b25);g.set(0,L+1,0,0xc02b25);g.set(-1,L+1,0,0xc02b25);g.set(0,L+1,-1,0xc02b25);   // red end cap
  return g;}
// mirror hangers, 10 mm cells, origin on the cord's knot at the mirror stem, hanging toward -y
function genHanger(kind){const g=new Grid(-8,8,-30,0,-10,10),cord=(a,b,c)=>segFill(g,a,b,.75,c||0x1a1a1a);
  const cube=(cx,cy,cz,c,pip)=>{for(let x=-3;x<=3;x++)for(let y=-3;y<=3;y++)for(let z=-3;z<=3;z++){const edge=Math.abs(x)===3&&Math.abs(y)===3||Math.abs(y)===3&&Math.abs(z)===3||Math.abs(x)===3&&Math.abs(z)===3;if(!edge)g.set(cx+x,cy+y,cz+z,c);}
    for(const [x,y,z] of pip)g.set(cx+x,cy+y,cz+z,0x111111);};
  if(kind==='dice'){cord([0,0,0],[0,-12,-3]);cord([0,0,0],[0,-15,3]);
    cube(0,-15.5,-3.5,0xf4f4f4,[[3,0,0],[-3,1,1],[-3,-1,-1],[0,0,-3],[1,1,3],[-1,-1,3],[0,0,3]]);cube(0,-18.5,3.5,0xc0222b,[[3,1,1],[3,-1,-1],[-3,0,0],[0,1,3],[0,-1,3],[0,0,-3]].map(p=>p));}   // a white and a red die, 70 mm, fuzzy edges rounded off
  else if(kind==='ring'){for(let y=0;y>=-7;y--)for(const z of [-1,0])g.set(0,y,z,0xe8e0c8);   // canvas strap
    for(let t=0;t<64;t++){const a=t/64*Math.PI*2,y=-14+6.2*Math.cos(a),z=6.2*Math.sin(a);for(const d of [-.5,0,.5])g.set(0,Math.round(y+d),Math.round(z),0xf2c500);}}   // yellow strap ring, 140 mm
  else if(kind==='charm'){cord([0,0,0],[0,-6,0],0xd4a017);nosBox(g,-1,-14,-2,0,-7,2,0xc0222b);nosBox(g,-1,-8,-2,0,-8,2,0xd4a017);g.set(-1,-11,0,0xd4a017);}   // red silk bag with a gold knot
  else if(kind==='tree'){cord([0,0,0],[0,-6,0],0xe8e8e8);for(let y=-7;y>=-17;y--){const w=Math.floor((y+7)/-3)+1+Math.floor(((-7-y)%3)/2);for(let z=-w;z<=w;z++)g.set(0,y,z,0x2e8b3a);}for(let y=-18;y>=-19;y--)g.set(0,y,0,0x6b4a2b);}
  else if(kind==='beads'){for(const sd of [-1,1]){let prev=[0,0,0];for(let t=1;t<=8;t++){const p=[0,-1.6*t,sd*(3*Math.sin(t/8*Math.PI))];segFill(g,prev,p,.75,0x3a2614);prev=p;}   // the string, a loop
      for(let t=1;t<8;t+=1){const y=Math.round(-1.6*t),z=Math.round(sd*(3*Math.sin(t/8*Math.PI)));for(const [a,b] of [[0,0],[1,0],[-1,0],[0,1]])g.set(a,y+b,z,t%2?0x5a3a1f:0x8b5a2b);}}   // wooden beads threaded on it
    for(let y=-13;y>=-19;y--)for(const z of [-1,0,1])if(y<-14||z===0)g.set(0,y,z,0xc0222b);}   // a red tassel at the bottom of the loop
  else if(kind==='plush')cord([0,0,0],[0,-6,0]);
  return g;}
function cgroup(parent,x,y,z){const g=new THREE.Group();g.position.set(x||0,y||0,z||0);if(parent)parent.add(g);return g;}
function stageDParts(c,body,P,cp,mk,matV){
  for(const g of P.cabinGroups||[])body.remove(g);P.cabinGroups=[];P.hbLever=null;P.hang=null;   // groups (not meshes): kept apart from P.seatMeshes, whose clean-up disposes geometry
  const hb=byId('handbrake',c.handbrake||'stock');
  if(hb&&hb.id==='hydro'&&cp&&cp.shifter){const drv=(cp.eye&&cp.eye.z<0)?-1:1,x=cp.shifter.x-5,z=drv*3.5,solid=cabinSolid(P,body,[P.shifter]);
    let y=null;for(let yy=cp.shifter.y+6;yy>cp.shifter.y-14;yy-=.5)if(solid(x,yy-.5,z)){y=yy;break;}   // the tunnel / console top under the base plate
    if(y!==null){const g=cgroup(body,x,y+.5,z),bm=mk(genHydroBase(),matV,0,g,.5),lg=cgroup(g,0,1,0),lm=mk(genHydroLever(Math.round(hb.leverMm/10)),matV,0,lg,.5);
      P.hbLever=lg;P.cabinGroups.push(g);}}
  const mh=byId('mirrorHang',c.mirrorHang||'none');
  if(mh&&mh.id!=='none'&&P.imirror&&P.imirror[0]&&!P.imirrorBar){const p0=P.imirror[0].position,SG=P.imirror[0].geometry.userData.src;   // the knot sits on the stem just above the head, touching the head's front face
    let hj=-1e9;for(const [i,j,k] of SG.list())if(i<=-3&&k===0)hj=Math.max(hj,j);let ia=-1e9;for(const [i,j,k] of SG.list())if(j===hj+1&&k===0)ia=Math.max(ia,i);if(ia===-1e9)ia=-3;
    const g=cgroup(body,p0.x+(ia+1)*.5,p0.y+(hj+1)*.5,0),m=mk(genHanger(mh.kind),matV,0,g,.5);
    if(mh.kind==='plush'){const pg=genPlushCached('cat',100),pl=mk(pg,matV,0,g,.5);if(pl){let jc=0;for(const [i,j,k] of pg.list())if(i===0&&k===0)jc=Math.max(jc,j);pl.rotation.y=Math.PI;pl.position.set(0,-3.5-jc*.5,0);}}   // hangs by the top of its head from the cord's end
    P.hang={g,L:mh.kind==='ring'?.2:mh.kind==='dice'?.17:.14,a:0,va:0,b:0,vb:0,vel:null};P.cabinGroups.push(g);}
}
// per frame (garage_core, after the car's own post): the hydro lever follows the handbrake; the hanger swings as a damped pendulum on the car's acceleration
function updateCabinMovers(dt,P,state){if(!dt||!P)return;
  if(P.hbLever){const tg=state.hb?22*Math.PI/180:0;P.hbLever.rotation.z+=(tg-P.hbLever.rotation.z)*Math.min(1,dt*18);}
  const H=P.hang;if(!H)return;
  const pos=new THREE.Vector3(state.x,0,state.z);if(!H.vel){H.p=pos.clone();H.vel=new THREE.Vector3();return;}
  const v=pos.clone().sub(H.p).divideScalar(dt*50),acc=v.clone().sub(H.vel).divideScalar(dt);H.p.copy(pos);H.vel.copy(v);   // world units are 20 mm: /50 -> m/s
  const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(0,state.psi,0)).invert();acc.applyQuaternion(q);   // into the car's frame: x forward, z right
  const ax=Math.max(-25,Math.min(25,acc.x)),az=Math.max(-25,Math.min(25,acc.z)),g=9.81,w2=g/H.L,c=1.6,sh=(state.rpm||0)/6000*.6*Math.sin(state.t*90);
  H.va+=(-w2*Math.sin(H.a)-(ax/H.L)*Math.cos(H.a)-c*H.va+sh)*dt;H.a=Math.max(-1.1,Math.min(1.1,H.a+H.va*dt));
  H.vb+=(-w2*Math.sin(H.b)-(az/H.L)*Math.cos(H.b)-c*H.vb)*dt;H.b=Math.max(-1.1,Math.min(1.1,H.b+H.vb*dt));
  H.g.rotation.set(-H.b,0,H.a);}
/* ---- v20 turbo kit hardware: the turbo on the manifold side, the front-mount intercooler behind the bumper, and the two charge pipes
   (compressor -> intercooler -> throttle body) routed through the bay's free space by A* on 20 mm cells with one cell of clearance, so no pipe
   passes through the engine, the hoses, the radiator or the body. Every piece is placed where it fits AND bears on something. ---- */
function genTurboUnit(){const g=new Grid(-8,11,-13,9,-8,8);
  for(let x=-7;x<=-2;x++)for(let y=-8;y<=8;y++)for(let z=-8;z<=8;z++){const a=Math.atan2(z,y)+Math.PI,r=4.6+1.9*a/(2*Math.PI);if(Math.hypot(y,z)<=r)g.set(x,y,z,0x4a4d52);}   // turbine scroll, cast iron
  cylX(g,0,0,3.2,-1,2,0x6b6f75);   // bearing housing
  for(let x=3;x<=8;x++)for(let y=-8;y<=8;y++)for(let z=-8;z<=8;z++){const a=Math.atan2(-z,y)+Math.PI,r=4.4+1.8*a/(2*Math.PI);if(Math.hypot(y,z)<=r)g.set(x,y,z,0xb9bec4);}   // compressor scroll, aluminium
  cylX(g,0,0,3,9,11,0xb9bec4,1.8);cylX(g,0,0,1.8,9,9,0x2a2c30);   // compressor inlet bell and its mouth
  cylY(g,5.5,0,2,6,9,0xb9bec4);   // compressor outlet, up
  for(let y=-2;y<=2;y++)for(let z=4;z<=7;z++)for(let x=4;x<=6;x++)g.set(x,y,z,0xc02b25);   // wastegate actuator can, on the compressor's outboard side
  for(let x=-6;x<=-3;x++)for(let y=-3;y<=3;y++)for(let z=-8;z<=-4;z++)g.set(x,y,z,z===-8?0x6b6f75:0x4a4d52);   // turbine inlet and its T25 flange, facing the manifold (-z: the unit sits right of the engine, inlet inboard)
  cylY(g,-4.5,0,2.4,-13,-7,0x8a8f96);   // downpipe flange and pipe stub
  return g;}
function genIntercooler(){const g=new Grid(-3,3,0,12,-28,28);   // sized to the AE86's room behind the bumper (probe map: ~60-70 mm between the skin and the support, 240-320 mm up): core 450 x 130 x 50 [DESIGN]
  for(let x=-2;x<=2;x++)for(let y=0;y<=12;y++)for(let z=-22;z<=22;z++)g.set(x,y,z,(y%2||Math.abs(x)===2)?0x2a2d31:0x4b5057);   // bar-and-plate core
  for(const s of [-1,1])for(let x=-2;x<=2;x++)for(let y=0;y<=12;y++)for(let z=23;z<=25;z++)g.set(x,y,s*z,0xb9bec4);   // end tanks
  for(const s of [-1,1])cylZ(g,-1,6,2,s*25,s*28,0xb9bec4);   // the tanks' pipe stubs, outward
  return g;}
function cylZ(g,cx,cy,r,z0,z1,c){for(let z=Math.min(z0,z1);z<=Math.max(z0,z1);z++)for(let x=Math.floor(cx-r);x<=Math.ceil(cx+r);x++)for(let y=Math.floor(cy-r);y<=Math.ceil(cy+r);y++)if(Math.hypot(x-cx,y-cy)<=r)g.set(x,y,z,c);}
function routePipe(free,a,b,box,inside){const [x0,x1,y0,y1,z0,z1]=box,nx=x1-x0+1,ny=y1-y0+1,nz=z1-z0+1,id=(i,j,k)=>((i-x0)*ny+(j-y0))*nz+(k-z0);
  const A=a.map(Math.round),B=b.map(Math.round),dist=new Float32Array(nx*ny*nz).fill(1e9),prev=new Int32Array(nx*ny*nz).fill(-1),open=[[0,...A]];dist[id(...A)]=0;
  const h=(i,j,k)=>Math.abs(i-B[0])+Math.abs(j-B[1])+Math.abs(k-B[2]);let found=false,it=0;
  while(open.length&&it++<200000){let bi=0;for(let q=1;q<open.length;q++)if(open[q][0]<open[bi][0])bi=q;const [f,i,j,k]=open[bi];open[bi]=open[open.length-1];open.pop();
    if(i===B[0]&&j===B[1]&&k===B[2]){found=true;break;}const d0=dist[id(i,j,k)];
    for(const [di,dj,dk] of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]){const I=i+di,J=j+dj,K=k+dk;if(I<x0||I>x1||J<y0||J>y1||K<z0||K>z1)continue;
      const near=(Math.abs(I-A[0])+Math.abs(J-A[1])+Math.abs(K-A[2])<=2)||(Math.abs(I-B[0])+Math.abs(J-B[1])+Math.abs(K-B[2])<=2);if(near?!inside(I,J,K):!free(I,J,K))continue;   // the last cells into each stub may run close to it, never into anything
      const nd=d0+1,n=id(I,J,K);if(nd<dist[n]){dist[n]=nd;prev[n]=id(i,j,k);open.push([nd+h(I,J,K),I,J,K]);}}}
  if(!found)return null;const path=[];let n=id(...B);while(n>=0){const k=n%nz+z0,j=Math.floor(n/nz)%ny+y0,i=Math.floor(n/nz/ny)+x0;path.push([i,j,k]);n=prev[n];}return path.reverse();}
function setTurboKit(c,body,P,mk,matV,tb,geo){
  // TURBO-02: where to look, per bay (geo; the AE86's own values are the defaults): the turbo's search box (tx, ty, tz: body cells, nearest the engine's
  // centre first), the intercooler's (icx from the front back, icy), the pipe router's box, the panels a pipe may be cut through (ahead of cutX, outboard
  // of |z| cutZ) and the pipes' grid (10 mm cells)
  const GEO=Object.assign({tx:[tb?tb[0]-6:0,tb?tb[0]+10:0],ty:[16,30],tz:[9,21],icx:[96,84],icy:[10,24],box:[45,101,8,36,-30,30],cutX:85,cutZ:16,pg:[90,202,16,72,-60,60]},geo||{});
  for(const m of P.turboKit||[])body.remove(m);P.turboKit=[];
  if(P.bayOrig&&P.bay){body.remove(P.bay);P.bay=mk(P.bayOrig,matV,0,body);P.bayOrig=null;}   // the support panels come back whole when the kit comes off
  const kit=byId('turbo',c.turbo);if(!kit||kit.id==='none'||kit.stock||!tb)return;
  const solid0=cabinSolid(P,body,null,['engMesh','hoses','bay','fan','accMesh','mounts','popLiner','gbMesh','exh','rack','under','underMounts','bumperF','lamp_famb','lamp_frame']),occ=new Set();
  // the fan and the belt drive turn: their whole swept boxes (+10 mm) are solid to the turbo hardware, not just where the blades happen to be
  body.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(body.matrixWorld).invert(),spin=[P.fan,P.accMesh].filter(Boolean).map(o=>{const b=new THREE.Box3().setFromObject(o);b.min.applyMatrix4(inv);b.max.applyMatrix4(inv);return [Math.min(b.min.x,b.max.x)-.5,Math.max(b.min.x,b.max.x)+.5,Math.min(b.min.y,b.max.y)-.5,Math.max(b.min.y,b.max.y)+.5,Math.min(b.min.z,b.max.z)-.5,Math.max(b.min.z,b.max.z)+.5];});
  const solid=(x,y,z)=>solid0(x,y,z)||spin.some(b=>x>=b[0]&&x<=b[1]&&y>=b[2]&&y<=b[3]&&z>=b[4]&&z<=b[5]);
  // a front-mount kit's pipes go through holes cut in the radiator support's side panels, as real AE86 kits do: ahead of x 85 (station ~310) and
  // outboard of |z| 320 mm (clear of the radiator core and the fan) the bay's own panels are passable to the router, and the holes are cut after
  const bayS=cabinSolid(P,body,null,['bay']),noBay=cabinSolid(P,body,null,['engMesh','hoses','fan','accMesh','mounts','popLiner','gbMesh','exh','rack','under','underMounts','bumperF','lamp_famb','lamp_frame']);
  const cuttable=(x,y,z)=>x>GEO.cutX&&Math.abs(z)>=GEO.cutZ&&bayS(x,y,z)&&!noBay(x,y,z)&&!spin.some(b=>x>=b[0]&&x<=b[1]&&y>=b[2]&&y<=b[3]&&z>=b[4]&&z<=b[5]);
  const mounts=k=>cabinSolid(P,body,null,k),onEng=mounts(['engMesh','exh']),onFront=mounts(['bay','bumperF','under','underMounts']);
  const touches=(G,x,y,z,on)=>{for(const [i,j,k] of itemCells(G,false))for(const [a,b,cc] of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]])if(on(x+(i+a)*.5,y+(j+b)*.5,z+(k+cc)*.5))return true;return false;};
  const place=(G,cands,on)=>{for(const [x,y,z] of cands)if(fitsAt(G,x,y,z,solid,occ,false)&&touches(G,x,y,z,on)){occAdd(G,x,y,z,occ,false);const m=mk(G,matV,0,body,.5);if(m){m.position.set(x,y,z);P.turboKit.push(m);}return [x,y,z];}return null;};
  // the turbo: on the manifold (exhaust) side, ahead of the strut tower, as close to the engine as it fits
  const TU=genTurboUnit(),tc=[];for(let x=GEO.tx[0];x<=GEO.tx[1];x+=.5)for(let y=GEO.ty[0];y<=GEO.ty[1];y+=.5)for(let z=GEO.tz[0];z<=GEO.tz[1];z+=.5)tc.push([x,y,z]);tc.sort((p,q)=>Math.abs(p[2])-Math.abs(q[2]));   // on the header: this build's 4A-GE has it on the right (+z); the real car's is on the left (M-07) — moves with the engine handing fix
  const clear25=(x,y,z)=>{for(let a=-2.5;a<=2.5;a+=.5)for(let b=-2.5;b<=2.5;b+=.5)for(let c2=-2.5;c2<=2.5;c2+=.5)if(a*a+b*b+c2*c2<=6.25&&solid(x+a*.5*2/2,y+b,z+c2))return false;return true;};
  const tcOK=tc.filter(([x,y,z])=>clear25(x+2.75,y+6.5,z)&&clear25(x+2.75,y+8,z));   // the compressor outlet must have room for its pipe (behind the fan, not in it)
  const onHdr=mounts(['engMesh']);const at=place(TU,tcOK,onHdr);if(!at){P.turboNote='turbo: no place with room for its outlet pipe';return;}   // bolted to the manifold: it must bear on the engine or the exhaust
  // the intercooler: behind the bumper, ahead of the radiator support, centred
  const wantIC=kit.bundle&&kit.bundle.intercooler==='front';let ai=[0,0,0];
  if(wantIC){const IC=genIntercooler(),ic=[];for(let x=GEO.icx[0];x>=GEO.icx[1];x-=.5)for(let y=GEO.icy[0];y<=GEO.icy[1];y+=.5)for(const z of [0,-.5,.5,-1,1])ic.push([x,y,z]);ai=place(IC,ic,onFront);if(!ai){P.turboNote='intercooler: no room found';return;}}   // on the bumper reinforcement / radiator support
  // charge pipes, 50 mm (2.5 cells): compressor outlet -> the intercooler's left stub -> the right stub -> the throttle body
  const OFS=[];for(let a=-3;a<=3;a++)for(let b=-3;b<=3;b++)for(let cc=-3;cc<=3;cc++)if(a*a+b*b+cc*cc<=9.5)OFS.push([a*.5,b*.5,cc*.5]);   // 10 mm samples within 30 mm of the pipe's centre line (the pipe is 50 mm)
  const free=(i,j,k)=>{for(const [a,b,cc] of OFS){const x=i+a,y=j+b,z=k+cc;if(solid(x,y,z)||occ.has(occKey(x,y,z)))return false;}return true;};
  const OFS2=OFS.filter(([a,b,cc])=>a*a+b*b+cc*cc<=6.3/4*4/4*1),free25=(i,j,k)=>{for(const [a,b,cc] of OFS)if(a*a+b*b+cc*cc<=1.5625&&solid(i+a,j+b,k+cc))return false;return true;};   // 25 mm: the pipe's own radius - it may touch, never overlap
  const box=GEO.box,cOut=[at[0]+2.75,at[1]+5,at[2]],icL=[ai[0]-.5,ai[1]+3,ai[2]-14.5],icR=[ai[0]-.5,ai[1]+3,ai[2]+14.5],tbIn=[tb[0]+2.5,tb[1],tb[2]];
  // the charge pipe meets the intake tract where the tract is reachable: the free cell nearest the throttle body that touches the intake hose
  const hs=cabinSolid(P,body,null,['hoses']);let tbBest=null,bd=1e9;for(let x=-6;x<=6;x++)for(let y=-4;y<=6;y++)for(let z=-6;z<=6;z++){const q=[Math.round(tb[0])+x,Math.round(tb[1])+y,Math.round(tb[2])+z];if(!free25(...q)||occ.has(occKey(...q)))continue;
    if(![[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]].some(([a,b,cc])=>hs(q[0]+a*1.75,q[1]+b*1.75,q[2]+cc*1.75)))continue;const d=Math.hypot(x,y,z);if(d<bd){bd=d;tbBest=q;}}
  P.turboNote=tbBest?null:'no reachable point on the intake tract';if(!tbBest)return;const tbGoal=tbBest;
  const pg=new Grid(...GEO.pg);let ok=true;
  for(const [a,b] of (wantIC?[[[cOut[0],cOut[1]+1.5,cOut[2]],icL],[icR,tbGoal]]:[[[cOut[0],cOut[1]+1.5,cOut[2]],tbGoal]])){const path=routePipe(free,a,b,box,free25)||routePipe((i,j,k)=>free25(i,j,k)&&!occ.has(occKey(i,j,k)),a,b,box,free25);if(!path){ok=false;const f=q=>[q.map(v=>Math.round(v*20)),free25(...q.map(Math.round))?'f25':'x25',free(...q.map(Math.round))?'f':'x'];P.turboNote='no free route '+JSON.stringify([f(a),f(b)]);break;}   // first with 5 mm of air round the pipe; if the bay has no such route, run it against the panels (clamped, as real kits do)
    let prev=a;for(const p of [...path,b]){segFill(pg,[prev[0]*2,prev[1]*2,prev[2]*2],[p[0]*2,p[1]*2,p[2]*2],2.3,0xc9ced4);prev=p;}}
  if(!ok&&wantIC){ok=true;const sCut=(x,y,z)=>solid(x,y,z)&&!cuttable(x,y,z),fCut=(i,j,k)=>{for(const [a,b,cc] of OFS){const x=i+a,y=j+b,z=k+cc;if(sCut(x,y,z)||occ.has(occKey(x,y,z)))return false;}return true;},
      f25c=(i,j,k)=>{for(const [a,b,cc] of OFS)if(a*a+b*b+cc*cc<=1.5625&&sCut(i+a,j+b,k+cc))return false;return true;};pg.fill&&0;const pg2=new Grid(...GEO.pg),cut=[];
    for(const [a,b] of [[[cOut[0],cOut[1]+1.5,cOut[2]],icL],[icR,tbGoal]]){const path=routePipe(fCut,a,b,box,f25c)||routePipe((i,j,k)=>f25c(i,j,k)&&!occ.has(occKey(i,j,k)),a,b,box,f25c);if(!path){ok=false;P.turboNote='no route even through the support panels';break;}
      let prev=a;for(const p of [...path,b]){segFill(pg2,[prev[0]*2,prev[1]*2,prev[2]*2],[p[0]*2,p[1]*2,p[2]*2],2.3,0xc9ced4);cut.push(p);prev=p;}}
    if(ok&&P.bay){const BG=P.bay.geometry.userData.src,keep=new Grid(BG.x0,BG.x1,BG.y0,BG.y1,BG.z0,BG.z1);for(const [i,j,k] of BG.list())keep.set(i,j,k,BG.get(i,j,k));let n=0;
      for(const [px,py,pz] of cut)for(let i=Math.floor(px-2);i<=Math.ceil(px+2);i++)for(let j=Math.floor(py-2);j<=Math.ceil(py+2);j++)for(let k=Math.floor(pz-2);k<=Math.ceil(pz+2);k++)if(Math.hypot(i-px,j-py,k-pz)<=1.75&&BG.get(i,j,k)>=0&&cuttable(i,j,k)){BG.set(i,j,k,-1);n++;}   // the pipe holes, 70 mm, in the support panels only
      body.remove(P.bay);P.bayOrig=keep;P.bay=mk(BG,matV,0,body);P.turboHoles=n;pg.d=pg2.d;}
    if(ok){const m=mk(pg2,matV,0,body,.5);if(m)P.turboKit.push(m);}}
  else if(ok){const m=mk(pg,matV,0,body,.5);if(m)P.turboKit.push(m);}
}
/* ---- sun visor under the headliner: x0..x1 = where it hangs (world units), found below the lowest roof cell over its footprint ---- */
function genVisor(r,sd,x0,x1,z0,z1){   // stowed flat against the headliner: its top face on the lowest point of the roof's inner skin over its footprint (10 mm body cells)
  const H=r.hi;let ceil=1e9;for(let i=Math.round(x0*2);i<=Math.round(x1*2);i++)for(let k=Math.round(z0*2);k<=Math.round(z1*2);k++)for(let j=96;j<=170;j++)if(H.body.get(i,j,sd*k)>=0||H.glass.ws.get(i,j,sd*k)>=0){ceil=Math.min(ceil,(j-.5)/2);break;}
  const g=new Grid(0,Math.ceil((x1-x0)*2)+1,0,4,-40,40),y0=ceil-.75;
  for(let i=0;i<=(x1-x0)*2;i++)for(let k=-17;k<=17;k++)for(let j=0;j<=1;j++)g.set(i,j,k,j===0?0x3a3d42:0x2f3136);
  return {grid:g,pos:[x0,y0,sd*(z0+z1)/2],ceil};
}
/* ---- what is solid at a 10 mm cell (index i,j,k: centre at world i/2,j/2,k/2): any cell of the 10 mm grids given, or a 20 mm grid's cell that holds the centre
   strictly inside it (a centre on a 20 mm cell's face is contact, so a bracket built up to there ends flush on that grid) ---- */
function solidOf(hiGrids,grids){const IN=v=>Math.abs(v-Math.round(v))<.49;
  return (i,j,k)=>{for(const G of hiGrids)if(G.get(i,j,k)>=0)return true;const x=i/2,y=j/2,z=k/2;if(!(IN(x)&&IN(y)&&IN(z)))return false;for(const G of grids)if(G.get(Math.round(x),Math.round(y),Math.round(z))>=0)return true;return false;};}
/* ---- mounting posts and brackets (10 mm cells, absolute: cell i spans world (i-.5)/2..(i+.5)/2). Each post rises from y0 (world) at (x,z) to the underside of
   whatever solid(i,j,k) reports above it (body, bay, interior), column by column, so it ends flush on the structure it bolts to; it is not drawn if nothing is
   found within yMax. hw, hd: half sizes in cells along x and z. ---- */
function genPosts(posts,solid,col){const cells=[];
  for(const P of posts){const i0=Math.round(P.x*2),k0=Math.round(P.z*2),j0=Math.round(P.y0*2),jm=Math.round((P.yMax||P.y0+15)*2),hw=P.hw||1,hd=P.hd||1,dir=P.down?-1:1;let ok=false;const tmp=[];
    for(let i=i0-hw;i<=i0+hw;i++)for(let k=k0-hd;k<=k0+hd;k++){for(let j=j0;dir>0?j<=jm:j>=jm;j+=dir){if(solid(i,j,k)){ok=true;break;}tmp.push([i,j,k]);}}
    if(ok)for(const c of tmp)cells.push([c[0],c[1],c[2],P.col||col||0x2a2c30]);}
  if(!cells.length)return new Grid(0,0,0,0,0,0);
  let b=[1e9,-1e9,1e9,-1e9,1e9,-1e9];for(const [i,j,k] of cells)b=[Math.min(b[0],i),Math.max(b[1],i),Math.min(b[2],j),Math.max(b[3],j),Math.min(b[4],k),Math.max(b[5],k)];
  const G=new Grid(b[0],b[1],b[2],b[3],b[4],b[5]);for(const [i,j,k,c] of cells)G.set(i,j,k,c);return G;}
/* ---- pedal box (10 mm cells, absolute): the pivot shaft through the pedals (z0, z1: its ends, clear of the outer pedals) and a bracket at each end up to the structure above (the dash or the cowl)
   or forward to the firewall, whichever is nearer ---- */
function genPedalBox(px,py,z0,z1,solid){const cells=[],I=Math.round(px*2),J=Math.round(py*2),K0=Math.round(z0*2),K1=Math.round(z1*2);
  for(let k=K0;k<=K1;k++)for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)if(Math.abs(a)+Math.abs(b)<2)cells.push([I+a,J+b,k,0x8d9298]);   // shaft, 30 mm across
  for(const K of [K0,K0+1,K1-1,K1]){let up=null,fw=null;for(let d=2;d<60&&up===null;d++)if(solid(I,J+d,K))up=d;for(let d=2;d<60&&fw===null;d++)if(solid(I+d,J,K))fw=d;
    if(up!==null&&(fw===null||up<=fw))for(let a=-2;a<=2;a++)for(let d=-2;d<=up;d++){if(d>=1&&solid(I+a,J+d,K))break;cells.push([I+a,J+d,K,0x2a2c30]);}
    else if(fw!==null)for(let b=-2;b<=2;b++)for(let d=-2;d<=fw;d++){if(d>=1&&solid(I+d,J+b,K))break;cells.push([I+d,J+b,K,0x2a2c30]);}}   // each row of the bracket stops at its own wall
  let bb=[1e9,-1e9,1e9,-1e9,1e9,-1e9];for(const [i,j,k] of cells)bb=[Math.min(bb[0],i),Math.max(bb[1],i),Math.min(bb[2],j),Math.max(bb[3],j),Math.min(bb[4],k),Math.max(bb[5],k)];
  const G=new Grid(bb[0],bb[1],bb[2],bb[3],bb[4],bb[5]);for(const [i,j,k,c] of cells)G.set(i,j,k,c);return G;}
/* ---- wheel knuckle (upright), 10 mm cells in the steering frame: origin on the kingpin at hub height, x forward, y up, z outward (right side; sd mirrors it).
   o.boss [z0, z1, r]: the hub-bearing housing round the axle, from the kingpin plane out to the brake disc's inner face; o.lbj, o.ubj: ball-joint heights;
   o.armZ [z0, z1]: the upright's run between the ball joints (inboard of the tyre's inner sidewall); o.steer: tie-rod end; o.cal: caliper mounting lug end;
   o.trail: trailing-link lug. World units in, drawn at mesh scale .5 ---- */
function genKnuckle(sd,o){const G=new Grid(-24,24,Math.floor(o.lbj*2)-4,Math.ceil(o.ubj*2)+4,-16,16),C=0x3f4349,C2=0x2f3237;
  const put=(i,j,k,c)=>{if(G.inb(i,j,sd*k))G.set(i,j,sd*k,c);};
  const seg=(a,b,r,c)=>{const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2])*4)+1;for(let t=0;t<=n;t++){const p=[0,1,2].map(q=>(a[q]+(b[q]-a[q])*t/n)*2);
    for(let i=Math.floor(p[0]-r);i<=Math.ceil(p[0]+r);i++)for(let j=Math.floor(p[1]-r);j<=Math.ceil(p[1]+r);j++)for(let k=Math.floor(p[2]-r);k<=Math.ceil(p[2]+r);k++)if(Math.hypot(i-p[0],j-p[1],k-p[2])<=r)put(i,j,k,c);}};
  const [b0,b1,br]=o.boss;for(let k=Math.round(b0*2);k<=Math.round(b1*2);k++)for(let i=-Math.ceil(br*2);i<=Math.ceil(br*2);i++)for(let j=-Math.ceil(br*2);j<=Math.ceil(br*2);j++)if(Math.hypot(i,j)<=br*2)put(i,j,k,C);   // hub-bearing housing
  const az=(o.armZ[0]+o.armZ[1])/2,ar=(o.armZ[1]-o.armZ[0]);   // upright: a 30 mm bar between the ball joints, inboard of the tyre
  for(let k=Math.round(o.armZ[0]*2);k<=Math.round(o.armZ[1]*2);k++)for(let j=Math.round(o.lbj*2);j<=Math.round(o.ubj*2);j++)for(let i=-1;i<=1;i++)put(i,j,k,C);
  seg([0,o.lbj,0],[0,o.lbj,az],1.6,C2);seg([0,o.ubj,0],[0,o.ubj,az],1.6,C2);   // ball-joint bosses
  if(o.steer)seg([0,o.steer[1],az],o.steer,1.2,C);    // steering arm to the tie-rod end
  if(o.cal)seg([0,0,o.cal[2]],o.cal,1.2,C);          // caliper lug
  if(o.trail)seg([0,o.trail[1],az],o.trail,1.2,C);   // trailing-link lug
  return G;}
/* ---- pulley with the axis along z (10 mm cells), radius r cells: back plate, grooved rim, hub ---- */
function genPulleyZ(r,col){
  const G=new Grid(-r-1,r+1,-r-1,r+1,0,3);col=col||0x41454b;
  G.fill((x,y,z)=>{const d=Math.hypot(x,y);if(d>r+.5)return -1;if(z===0)return 0x2b2d31;if(z>=1&&z<=2)return d>=r-1.5?col:(d<=1.8?0x8d9298:-1);return d<=1.8?0x8d9298:-1;});
  G.set(0,Math.round(r)-1,2,COL.white);G.set(0,Math.round(r)-2,2,COL.white);
  return G;
}
/* ---- lamp set into the skin: the cells of an outline (z0..z1 across the car, y0..y1 up; world units, both sides) are re-skinned one layer proud of the outermost body cell at each (y,z).
   fn(u,v,edge) -> [kind,colour] with u 0..1 from the inboard edge outward and v 0..1 from the bottom; kinds are the lamp groups drawn with their own material. Grids are hi-resolution (absolute 10 mm cells). ---- */
function genSkinLamp(hi,sg,sd,z0,z1,y0,y1,fn){
  const grids=[hi.body,hi.hood,hi.trunk],cells={};
  const J0=Math.round(y0*2),J1=Math.round(y1*2),K0=Math.round(Math.min(z0,z1)*2),K1=Math.round(Math.max(z0,z1)*2);
  for(let J=J0;J<=J1;J++)for(let K=K0;K<=K1;K++){
    let face=null;for(let I=sg>0?236:-236;sg>0?I>=-200:I<=200;I-=sg){let hit=false;for(const G of grids)if(G.get(I,J,sd*K)>=0){hit=true;break;}if(hit){face=I;break;}}
    if(face===null)continue;
    const u=(K-K0)/Math.max(1,K1-K0),v=(J-J0)/Math.max(1,J1-J0),edge=K===K0||K===K1||J===J0||J===J1;
    const c=fn(u,v,edge);if(!c)continue;
    (cells[c[0]]=cells[c[0]]||[]).push([face+sg,J,sd*K,c[1]]);
  }
  const out={};
  for(const k in cells){const L=cells[k];let b=[1e9,-1e9,1e9,-1e9,1e9,-1e9];for(const [i,j,kk] of L){b=[Math.min(b[0],i),Math.max(b[1],i),Math.min(b[2],j),Math.max(b[3],j),Math.min(b[4],kk),Math.max(b[5],kk)];}
    const G=new Grid(b[0],b[1],b[2],b[3],b[4],b[5]);for(const [i,j,kk,c] of L)G.set(i,j,kk,c);out[k]=G;}
  return out;
}
/* ---- exhaust: collector -> down pipe -> front pipe -> catalytic converter -> centre pipe -> silencer -> tail pipe and tip(s). F: {x0,y0,z0 collector; pipeY; zRun (centre run); catX; mufX0,mufX1; mufZ; tipX; tipY; side} ---- */
const JDM_TIPS=['takeyari2','takeyari1','takeyari3','takeyari4','naname2','side','rappa','slash','turndown','canon'];
function genExhaust(g,tip,F){
  if(tip==='single')tip='stock';if(tip==='dual')tip='catback';const side=tip==='side',jdm=JDM_TIPS.includes(tip);if(jdm)tip='jdm';   // 'dual' is the catalogue's name for the cat-back's twin tips; the Japanese tails keep the stock silencer
  // optional (E30): F.pr pipe radius, F.catW / F.catH the converter's half width / height, F.mufH the silencer's half height, F.front: polylines drawn first (front pipes
  // from the manifolds to the collector), F.lowY: after the converter the run steps down to lowY (F.dropX where it starts, over F.dropLen, to z F.dropZ), the silencer
  // and tail at that height
  let yTop=Math.ceil(F.y0)+3;if(F.front)for(const L of F.front)for(const p of L)yTop=Math.max(yTop,Math.ceil(p[1])+3);
  const G=new Grid(Math.floor(g.REAR_X)-6,Math.ceil(Math.max(F.x0,...(F.front||[]).flat().map(p=>p[0])))+3,2,yTop,-26,26);
  const pr=F.pr||(tip==='oval'?2.4:2),col=tip==='oval'?0xc9ced4:0x7a7f86,mid=(tip==='stock'||tip==='race')?F.side*F.mufZ:0,zr=F.zRun,py=F.pipeY,cw=F.catW||3,ch=F.catH||2.2,mh=F.mufH||2.6;
  if(F.front)for(const L of F.front)for(let i=0;i<L.length-1;i++)segFill(G,L[i],L[i+1],pr,col);
  const y1=Math.min(py,F.y0);   // an engine whose down pipe ends below the run height: the pipe leaves it level, then rises to the run (never back up through the down pipe)
  segFill(G,[F.x0,F.y0,F.z0],[F.x0-1,y1,F.z0],pr,col);                                           // down pipe
  segFill(G,[F.x0-1,y1,F.z0],[F.x0-5,py,zr],pr,col);                                              // sweeps to the centre run
  segFill(G,[F.x0-5,py,zr],[F.catX,py,zr],pr,col);
  box(G,F.catX-7,F.catX,py-ch,py+ch,zr-cw,zr+cw,0x6c7178);box(G,F.catX-7,F.catX-6,py-ch-.2,py+ch+.2,zr-cw-.2,zr+cw+.2,0x5a5f66);   // catalytic converter and its flange
  const bx=F.tipX,ty=F.tipYOf&&F.tipYOf(tip)!==undefined?F.tipYOf(tip):(tip==='stock'||tip==='jdm'||F.tipYLow===undefined?F.tipY:F.tipYLow),ly=F.lowY!==undefined?F.lowY:py;let p0=[F.catX-7,py,zr];   // tipYLow: other tips hang below the valance
  if(F.lowY!==undefined&&!side){segFill(G,p0,[F.dropX,py,zr],pr,col);p0=[F.dropX-F.dropLen,ly,F.dropZ!==undefined?F.dropZ:zr];segFill(G,[F.dropX,py,zr],p0,pr,col);}
  if(F.via&&!side)for(const v of F.via){segFill(G,p0,v,pr,col);p0=v;}   // further bends before the silencer
  if(side){segFill(G,[F.catX-7,py,zr],[F.jdm.side.from[0],py,zr],pr,col);return G;}   // the side exit leaves the run ahead of the rear wheel: no rear silencer
  if(tip==='stock'||tip==='catback'||tip==='quad'||tip==='oval'||tip==='jdm'){
    segFill(G,p0,[F.mufX1,ly,(tip==='stock'||tip==='jdm')?F.side*F.mufZ:0],pr,col);
    const w=(tip==='stock'||tip==='jdm')?6:(tip==='oval'?9:8),zc=(tip==='stock'||tip==='jdm')?F.side*F.mufZ:0;
    {const x0=Math.min(F.mufX0,F.mufX1),x1=Math.max(F.mufX0,F.mufX1),dark=!!F.mufDark;   // silencer: an oval canister (superellipse section) with rolled end seams
     for(let x=Math.floor(x0);x<=Math.ceil(x1);x++)for(let y=Math.floor(ly-mh);y<=Math.ceil(ly+mh);y++)for(let z=Math.floor(zc-w);z<=Math.ceil(zc+w);z++){
       const q=Math.pow(Math.abs(z-zc)/w,2.6)+Math.pow(Math.abs(y-ly)/mh,2.6);if(q>1)continue;const endS=x<=x0+.5||x>=x1-.5;
       G.set(x,y,z,dark?(endS?0x2b2d31:0x3b3e43):(endS?0x5a5f66:0x6c7178));}}
  }
  // pipes to the tips stop where the tips begin (bx + 4); the tips themselves are drawn round at 10 mm by genExhaustTips
  if(tip==='stock')segFill(G,[F.mufX0,ly,mid],[bx+4.5,ty,mid],F.pr?Math.min(1.6,F.pr):1.6,col);
  if(tip==='race'){const rd=F.raceDrop!==undefined?F.raceDrop:(F.mufH?1:0),ry=ly-rd;segFill(G,[p0[0],p0[1]-rd,p0[2]],[F.mufX0,ry,mid],2.2,0x8a9098);segFill(G,[F.mufX0,ry,mid],[bx+4.5,ty,mid],2.2,0x8a9098);}   // the 88 mm straight pipe runs 20 mm lower than the silencer's centre line, under the floor's kick-up
  if(tip==='catback'||tip==='quad'){const zs=tip==='catback'?[-12,12]:(F.tipsZ||[-15,-10.5,10.5,15]);for(const z of zs)segFill(G,[F.mufX0,ly,Math.sign(z)*4],[bx+4.5,ty,z],1.5,col);}   // F.tipsZ: a car's own quad layout (the Z32's pairs in the valance's corners)
  if(tip==='oval')segFill(G,[F.mufX0,ly,0],[bx+4.5,ty,0],2,0xc9ced4);
  return G;
}
/* ---- Japanese kaido / shakotan tails (10 mm cells, absolute), from the silencer's outlet. DESIGN shapes after period street cars (no one maker's part):
   takeyari2: twin "bamboo spear" pipes, 60 mm, red with black caps, rising behind the bumper at 68 deg and splayed 8 deg, tops 1250 mm up;
   takeyari1: one such pipe; side: yoko-dashi exit ahead of the rear wheel, 60 mm chrome tip turned down 15 deg, flush with the sill;
   rappa: a trumpet tip flaring 60 to 120 mm over 300 mm under the bumper; slash: a straight 70 mm chrome pipe cut at 45 deg.
   A (world units): out [x,y,z] the silencer outlet; rearX the bumper's rearmost face; botY its bottom edge; tyZ [z...] where the spears stand (a hatchback's stand
   outboard of the hatch so it swings between them); side {x,z,y} the side exit; topY the spears' tops ---- */
function genJdmTail(style,A){const cells=[],RED=0xc0201c,CH=0xdfe3e8,CH2=0xb7bcc3,DK=0x1a1b1d;
  const tube=(a,b,r,col)=>{const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2])*4)+1;for(let t=0;t<=n;t++){const p=[0,1,2].map(q=>(a[q]+(b[q]-a[q])*t/n)*2);
    for(let i=Math.floor(p[0]-r);i<=Math.ceil(p[0]+r);i++)for(let j=Math.floor(p[1]-r);j<=Math.ceil(p[1]+r);j++)for(let k=Math.floor(p[2]-r);k<=Math.ceil(p[2]+r);k++)if(Math.hypot(i-p[0],j-p[1],k-p[2])<=r)cells.push([i,j,k,col]);}};
  const cap=(p,r,col)=>{const c=p.map(v=>v*2);for(let i=Math.floor(c[0]-r);i<=Math.ceil(c[0]+r);i++)for(let j=Math.floor(c[1]-r);j<=Math.ceil(c[1]+r);j++)for(let k=Math.floor(c[2]-r);k<=Math.ceil(c[2]+r);k++)if(Math.hypot(i-c[0],j-c[1],k-c[2])<=r)cells.push([i,j,k,col]);};
  const [ox,oy,oz]=A.out,xb=A.rearX-1.6,yl=Math.min(oy,A.botY-2.5),PR=2.5,SR=3;   // radii in 10 mm cells: 50 mm pipes, 60 mm spears (DESIGN: the common takeyari size)   // the run passes under the bumper and turns up 30 mm behind its rearmost face
  // takeyari (bamboo spears): 1 to 4 spears standing 68 degrees up behind the bumper, splayed 8 degrees outward; naname-dashi: two shorter pipes raked back at 35 degrees.
  // Spear positions per car (A.spears: [z, x step back] lists): behind the plate on a trunk-lid car, outboard of the hatch's swing on a hatchback
  const SPEARS={takeyari1:[[A.tyZ[A.tyZ.length-1],0]],takeyari2:A.tyZ.map(z=>[z,0]),naname2:A.tyZ.map(z=>[z,0]),takeyari3:(A.spears&&A.spears[3])||null,takeyari4:(A.spears&&A.spears[4])||null};
  if(SPEARS[style]){const naname=style==='naname2',ang=naname?35:68,H=naname?12:A.topY-yl,lean=1/Math.tan(ang*Math.PI/180),spl=Math.tan((naname?4:8)*Math.PI/180);
    tube([ox,oy,oz],[ox-1,yl,oz],PR,0x7a7f86);
    for(const [z,dx] of SPEARS[style]){const fx=xb+.5-dx;tube([ox-1,yl,oz],[fx,yl,z],PR,0x7a7f86);   // under the bumper to the foot of the spear
      const top=[fx-.5-H*lean,yl+.5+H,z+Math.sign(z||1)*H*spl*(z?1:0)];tube([fx,yl,z],[fx-.5,yl+.5,z],SR,RED);tube([fx-.5,yl+.5,z],top,SR,RED);cap(top,SR+.3,DK);}}
  // kanjo turn-down: the pipe runs straight back under the bumper and turns 55 degrees down just short of its rear face, a chrome tip opening to the road
  if(style==='turndown'){tube([ox,oy,oz],[xb+2.5,yl,oz],PR,0x7a7f86);const e=[xb+1,yl-2.1,oz];tube([xb+2.5,yl,oz],e,3,CH);cap([e[0]-.15,e[1]-.2,e[2]],2,DK);}
  // cannon (N1 street style): one 120 mm straight-cut can, 300 mm long, its outlet 20 mm behind the bumper's rear face, a rolled lip round a dark bore
  if(style==='canon'){tube([ox,oy,oz],[xb+5,yl+.5,oz],PR,0x7a7f86);const yc=yl+.5;for(let x2=Math.round((xb+5)*2);x2>=Math.round((xb-1)*2);x2--)for(let j=Math.floor(yc*2-6);j<=Math.ceil(yc*2+6);j++)for(let k=Math.floor(oz*2-6);k<=Math.ceil(oz*2+6);k++){
      const d=Math.hypot(j-yc*2,k-oz*2);if(d>6)continue;const end=x2===Math.round((xb-1)*2);if(end&&d<4.9){cells.push([x2,j,k,DK]);continue;}if(!end&&d<4.9&&x2<Math.round((xb+5)*2))continue;cells.push([x2,j,k,d>5.4?CH:CH2]);}}
  if(style==='side'){const S=A.side,[fx,fy,fz]=S.from,sg=S.sg||Math.sign(fz||1);   // from the end of the main pipe: down below the floor and the sill, then out to the sill's face
    tube([fx,fy,fz],[fx,S.y,fz],PR,0x7a7f86);tube([fx,S.y,fz],[fx,S.y,sg*(S.z-2)],PR,0x7a7f86);
    tube([fx,S.y,sg*(S.z-2.2)],[fx,S.y-.55,sg*S.z],3,CH);cap([fx,S.y-.55,sg*(S.z-.05)],2.1,DK);}   // tip turned 15 deg down at the sill's face
  if(style==='rappa'){tube([ox,oy,oz],[xb+3,yl,oz],PR,0x7a7f86);const L=15;for(let q=0;q<=L;q++){const t=q/L,x=xb+3-t*7.5,y=yl-t*.9,r=3+t*t*3;
      for(let j=Math.floor(y*2-r);j<=Math.ceil(y*2+r);j++)for(let k=Math.floor(oz*2-r);k<=Math.ceil(oz*2+r);k++){const d=Math.hypot(j-y*2,k-oz*2);if(d>r)continue;if(q===L&&d<r-1.1){cells.push([Math.round(x*2),j,k,DK]);continue;}if(q<L&&d<r-1.1)continue;cells.push([Math.round(x*2),j,k,q>L-3?CH:CH2]);}}}
  if(style==='slash'){tube([ox,oy,oz],[xb+2,yl,oz],3.5,0x7a7f86);for(let q=0;q<=10;q++){const x=xb+2-q*.5;for(let j=Math.floor(yl*2-3.5);j<=Math.ceil(yl*2+3.5);j++)for(let k=Math.floor(oz*2-3.5);k<=Math.ceil(oz*2+3.5);k++){const d=Math.hypot(j-yl*2,k-oz*2);if(d>3.5)continue;
      const cut=xb+2-5-(j-yl*2)*.5;if(x<cut)continue;cells.push([Math.round(x*2),j,k,(x<cut+.6||d<2.4)?DK:CH]);}}}   // 45 deg slash: the upper lip reaches furthest back, the opening faces down and back; a 10 mm wall round the dark bore
  const keep=new Map();for(const c of cells){const key=c[0]+','+c[1]+','+c[2];const o=keep.get(key);if(!o||c[3]===DK||(c[3]!==0x7a7f86&&o[3]===0x7a7f86))keep.set(key,c);}
  const L2=[...keep.values()];let b=[1e9,-1e9,1e9,-1e9,1e9,-1e9];for(const [i,j,k] of L2)b=[Math.min(b[0],i),Math.max(b[1],i),Math.min(b[2],j),Math.max(b[3],j),Math.min(b[4],k),Math.max(b[5],k)];
  const G=new Grid(b[0],b[1],b[2],b[3],b[4],b[5]);for(const [i,j,k,c] of L2)G.set(i,j,k,c);return G;}
/* ---- exhaust tips (10 mm cells, absolute): round chrome tips with a rolled lip and a dark bore, 80 mm long from bx (world) forward.
   stock: the SiR's twin 50 mm tips side by side (ph_sir_rear34.jpg); catback: two 70 mm tips; quad: four 60 mm; race: one 100 mm; oval: 115 x 70 mm (DESIGN sizes) ---- */
function genExhaustTips(tip,F){if(tip==='single')tip='stock';if(tip==='dual')tip='catback';if(JDM_TIPS.includes(tip))return genJdmTail(tip,F.jdm);const bx=F.tipX,ty=F.tipYOf&&F.tipYOf(tip)!==undefined?F.tipYOf(tip):(tip==='stock'||F.tipYLow===undefined?F.tipY:F.tipYLow),mid=(tip==='stock'||tip==='race')?F.side*F.mufZ:0,cells=[];
  const round=(zc,r,ry)=>{ry=ry||r;const I0=Math.round(bx*2),J=ty*2,K=zc*2;for(let i=I0;i<=I0+8;i++)for(let j=Math.floor(J-ry-1);j<=Math.ceil(J+ry+1);j++)for(let k=Math.floor(K-r-1);k<=Math.ceil(K+r+1);k++){
      const d=Math.hypot((j-J)/ry,(k-K)/r);if(d>1)continue;const lip=d>1-1.2/Math.min(r,ry);if(i===I0&&!lip){cells.push([i,j,k,0x1a1b1d]);continue;}if(i>I0&&!lip)continue;cells.push([i,j,k,i<=I0+1?0xdfe3e8:0xb7bcc3]);}};   // open bore at the outlet, a 10 mm wall behind it
  if(tip==='stock'&&F.stockTips===1)round(mid,F.stockR||2.6);else if(tip==='stock'){round(mid-3,2.6);round(mid+3,2.6);const I=Math.round(bx*2)+8;for(let i=I-1;i<=I+1;i++)for(let j=Math.round(ty*2)-2;j<=Math.round(ty*2)+2;j++)for(let k=Math.round((mid-3)*2);k<=Math.round((mid+3)*2);k++)cells.push([i,j,k,0x9aa0a8]);}   // the twin tips' Y-piece on the tail pipe
  if(tip==='race')round(mid,5);
  if(tip==='catback')for(const z of [-12,12])round(z,3.5);
  if(tip==='quad')for(const z of (F.tipsZ||[-15,-10.5,10.5,15]))round(z,F.tipR||3);
  if(tip==='oval')round(0,5.75,3.5);
  let b=[1e9,-1e9,1e9,-1e9,1e9,-1e9];for(const [i,j,k] of cells)b=[Math.min(b[0],i),Math.max(b[1],i),Math.min(b[2],j),Math.max(b[3],j),Math.min(b[4],k),Math.max(b[5],k)];
  const G=new Grid(b[0],b[1],b[2],b[3],b[4],b[5]);for(const [i,j,k,c] of cells)G.set(i,j,k,c);return G;}
/* ---- underbody: front subframe (side rails and front cross-member), rear cross-member, fuel tank, spare-wheel well panel. P: {axF,axR,subY,railZ,fx0,fx1,tank:{x0,x1,y0,y1,half}} ---- */
function genUnder(U){
  const G=new Grid(-100,100,3,16,-30,30),c=0x24262a,c2=0x3a3d42;
  const rx0=U.railX0!==undefined?U.railX0:U.fx0;   // rails start (a front subframe under the bay only: railX0 = the firewall)
  if(U.railX1!==undefined)for(const s of [-1,1])box(G,U.fx1,U.railX1,U.subY,U.subY+1.5,s*U.railZ-1,s*U.railZ+1,c);   // rails carried forward to the radiator support's lower cross-member
  if(U.rearRails)for(const s of [-1,1])box(G,U.rearRails.x0,U.rearRails.x1,U.subY,U.subY+1.5,s*U.rearRails.z-1,s*U.rearRails.z+1,c);   // rear sub-frame side members (carry the lower arms' inner pivots)
  if(U.trailBr)for(const [tx,tz] of U.trailBr)for(const s of [-1,1])box(G,tx-1.5,tx+1.5,U.subY-.5,U.subY+1.5,s*(tz-1.5),s*(tz+1.5),c2);   // trailing-link pivot brackets
  for(const s of [-1,1]){box(G,rx0,U.fx1,U.subY,U.subY+1.5,s*U.railZ-1,s*U.railZ+1,c);const bx=U.brkX!==undefined?U.brkX-1:rx0+1;box(G,bx,bx+2,U.subY-.5,U.subY+2,s*(U.railZ-1),s*(U.railZ+(U.brkX!==undefined?1.5:3)),c2);}   // lower-arm pivot brackets
  box(G,U.fx1-1.5,U.fx1,U.subY,U.subY+1.5,-U.railZ,U.railZ,c);                                   // front cross-member
  if(U.rearBeam!==false)box(G,U.rx-1.5,U.rx,U.subY+.5,U.subY+2,-U.railZ,U.railZ,c);if(U.rearBr!==false)for(const s of [-1,1])box(G,U.rx-1.5,U.rx,U.subY+.5,U.subY+2,s*U.railZ-1,s*U.railZ+1,c2);   // rear cross-member (or just its two brackets; rearBr:false = neither, e.g. a live axle whose links bolt to the floor)
  const t=U.tank,tz=t.zc||0;box(G,t.x0,t.x1,t.y0,t.y1,tz-t.half,tz+t.half,0x2f3237);for(const s of [-1,1])box(G,t.x0-.5,t.x1+.5,t.y0+1,t.y0+1.5,tz+s*(t.half-1),tz+s*(t.half-1),0x8d9298);   // tank and its two straps
  return G;
}
/* ---- longitudinal engine (10 mm cells) for front-engine rear-drive shells. Local frame: x along the crank, x = 0 at the flywheel (rear) face, +x forward;
   y up from the pan bottom (crank at y = pc); z across, intake side -z (left), exhaust side +z (right). From the engine record: len (rear face to the timing
   cover's front, the pulleys and fan drawn separately), wid (across the manifolds), hgt (pan bottom to cam cover top), pan (pan bottom to crank), cyl, layout
   'I' (inline, one head) or 'V' (two banks at 90 deg). The front sump (deep part ahead of x = 0.55 of the block) leaves room over the front cross-member
   behind it (opts.sumpFront false: a rear sump). Proportions DESIGN from photographs of the M20, S14, M50/S54, 2JZ and LS engines; the record's dimensions
   are kept exactly (the bounding box is len x wid x hgt). ---- */
function genEngineLong(e,opts){opts=opts||{};
  const Lc=e.len/10,Wc=e.wid/10,Hc=e.hgt/10,pc=e.pan/10,n=e.cyl||6,V=e.layout==='V',tl=opts.tilt||0,ct=Math.cos(tl),st=Math.sin(tl);
  const Bl=Math.round(Lc-6),C=Object.assign({cover:V?0x1d1f22:0xb4b8be,block:0x6b7078,head:0x8c9298,intake:0x3d4046,man:0x7a6a5e,pan:0x4a4f55,red:0},e.colors||{});
  const G=new Grid(-2,Math.ceil(Lc)+2,-8,Math.ceil(Hc)+2,-Math.ceil(Wc/2)-2,Math.ceil(Wc/2)+2);
  const hb=(Hc-pc)*.42,hh=(Hc-pc)*.30,yD=pc+hb,yH=yD+hh,yT=Math.min(Hc-1,yH+(Hc-pc)*.12);   // deck, head top, cam cover top
  const sx0=opts.sumpX0!==undefined?opts.sumpX0:.55,sumpX=opts.sump?opts.sump:(opts.sumpFront===false?[2,Bl*.45]:[Bl*sx0,Bl-2]),shallow=pc-Math.min(opts.shallowMax||99,Math.max(5,pc*.45));   // the shallow part of the pan stays above the cross-member
  // oil pan: shallow tray under the whole block, the deep sump at one end; on a tilted engine its floor stays level in the car (the pan is cast to the tilt), so its
  // depth is measured square to the car: wy = the cell's height below the crank in the car's frame
  const wy=(y,z)=>(y-pc)*ct-z*st,hw=Wc*.19,hs=Wc*.16;
  for(let x=2;x<=Bl-2;x++)for(let y=-8;y<=pc-2;y++)for(let z=-Math.ceil(hw);z<=Math.ceil(hw);z++){const sump=x>=sumpX[0]&&x<=sumpX[1],a=Math.abs(z);
    const depth=sump&&a<=hs?pc:pc-shallow,w=wy(y,z);if(a>hw||w<-depth||(y<shallow-2&&!sump&&w<-(pc-shallow)))continue;
    if(y>=pc-4||w>=-depth+1||!sump)G.set(x,y,z,C.pan);else G.set(x,y,z,(x-Math.ceil(sumpX[0]))%3===2&&a<=Wc*.13?0x3c4146:C.pan);}   // cooling ribs on the sump floor
  if(!V){
    box(G,0,Bl,pc-2,yD,-Wc*.21,Wc*.21,C.block);                                           // block with its skirt
    for(let i=1;i<n;i++){const x=Bl*i/n;box(G,x,x,pc+2,yD-2,-Wc*.215,-Wc*.215,0x5c6168);box(G,x,x,pc+2,yD-2,Wc*.215,Wc*.215,0x5c6168);}   // water-jacket ribs between the bores
    box(G,1,Bl-1,yD,yH,-Wc*.19,Wc*.19,C.head);                                            // head
    box(G,3,Bl-3,yH,yT,-Wc*.16,Wc*.16,C.cover);                                           // cam cover
    for(let x=6;x<=Bl-6;x+=4)box(G,x,x+1,yT,yT,-Wc*.12,Wc*.12,C.red?0xb3201b:0xd2d5d9);   // cover ribs (red on the M heads)
    box(G,5,Bl-5,yT,yT,-1,1,0x1b1c1e);                                                    // spark-plug lead cover along the middle
    box(G,Bl-9,Bl-7,yT,yT+1,Wc*.06,Wc*.10,0x141517);                                      // oil filler cap
    // intake: n runners from the head's left face, out and down into a log plenum along the block, throttle body at its front end
    const zR=-Wc*.19,zP=-Wc*.43,yP=pc+hb*.55;
    for(let i=0;i<n;i++){const x=Bl*(i+.5)/n;segFill(G,[x,yD+hh*.5,zR],[x,yH-1,zR-Wc*.08],2,C.intake);segFill(G,[x,yH-1,zR-Wc*.08],[x,yP+3,zP+2],2,C.intake);}
    box(G,4,Bl-3,yP-3.5,yP+3.5,zP-2.5,zP+2.5,C.intake);cylX(G,yP,zP,3,Bl-3,Bl+2,0x6a6e75);   // plenum, throttle body (pointing forward)
    // exhaust: two cast manifolds of n/2 ports each on the right, each ending in a flange under the block's side (the front pipes are the exhaust's)
    const zE=Wc*.19,zC=Wc*.36,yE=yD+hh*.35;
    const MX=opts.manX||[.27,.73];for(let i=0;i<n;i++){const x=Bl*(i+.5)/n,xc=Bl*(i<n/2?MX[0]:MX[1]);segFill(G,[x,yE,zE],[x,yE-1,zC-1],1.6,C.man);segFill(G,[x,yE-1,zC-1],[xc,yE-3,zC],1.6,C.man);}
    for(const xc of [Bl*MX[0],Bl*MX[1]]){segFill(G,[xc,yE-3,zC],[xc,pc+1,zC],2,C.man);box(G,xc-2.5,xc+2.5,pc,pc,zC-2.5,zC+2.5,0x5a5f66);}
  }else{
    const vz=Wc*.14;box(G,0,Bl,pc-2,pc+hb*.8,-Wc*.2,Wc*.2,C.block);                        // V block (the vee's bottom)
    const yb=Math.round(pc+hb*.8),km=Math.floor(hh+hb*.4);   // whole cells, so each bank's layers and its cam cover stack without a gap
    for(const s of [-1,1]){for(let k=0;k<=km;k++){const zc=s*(vz+k*.75),y=yb+k;box(G,1,Bl-1,y,y,zc-5,zc+5,k<hb*.4?C.block:C.head);}
      const zt=s*(vz+km*.75),y0=yb+km+1;box(G,3,Bl-4,y0,Math.max(y0,Math.min(Hc-2,y0+2)),zt-4.5,zt+4.5,C.cover);   // cam covers, on the heads
      for(let i=0;i<n/2;i++){const x=Bl*(i+.5)/(n/2);segFill(G,[x,pc+hb*.5,s*Wc*.24],[x,pc+1,s*Wc*.4],1.6,C.man);}   // headers down the outside of each bank
      segFill(G,[Bl*.9,pc+1,s*Wc*.4],[Bl*.15,pc+1,s*Wc*.4],2,C.man);}
    box(G,4,Bl-4,pc+hb*.8,Math.min(Hc-1,yT),-vz+1,vz-1,C.intake);cylX(G,yH-2,0,3,Bl-2,Bl+2,0x6a6e75);   // intake manifold in the vee, throttle body forward
  }
  box(G,Bl,Bl+2,pc-3,V?Math.min(Hc-3,yH):yH,-Wc*.17,Wc*.17,0x16171a);                    // timing cover (belt or chain), one plate over the cam and crank drives
  // accessories: alternator low on the right front, water pump and thermostat housing on the front top left, distributor at the head's front (inline engines), oil filter on the left
  // (opts.altLift: a higher alternator bracket where a car's crossmember is under it)
  const A={x:Bl-6,y:pc+1.5+(opts.altLift||0),z:Wc*.30,r:5.5};cylX(G,A.y,A.z,A.r,A.x-6,A.x+5,0x8d9298);cylX(G,A.y,A.z,2,A.x+5,A.x+6,0x2a2c30);
  cylX(G,yD+2,-Wc*.10,3,Bl+1,Bl+2,0x7d8289);box(G,Bl-2,Bl+1,yD+1,yD+4,-Wc*.16,-Wc*.08,0x7d8289);
  if(!V)cylX(G,yH-1,-Wc*.06,2.4,Bl+1,Bl+4,0x1b1c1e);
  cylY(G,Bl*.42,-(Wc*(V?.2:.21)+2.3),2.8,pc,pc+7,0x2b4a8a);   // oil filter, screwed to the block's left side (a V block is narrower at its skirt than the heads)
  // connection points (local cells): crank pulley seat (its back face; the pulleys are 4 cells deep, so their front is at Lc), water pump shaft (the fan),
  // thermostat outlet, water inlet, throttle body mouth, the exhaust manifolds' flanges, the alternator, the block's sides where the engine arms bolt on
  const mX=opts.mountX!==undefined?opts.mountX:Bl*.55;
  let wiX=Bl-14;if(Math.abs(wiX-mX)<5)wiX=mX+5<=Bl-4?mX+5:mX-5;   // the water inlet stands clear of the right engine arm's root (a short block put them together)
  const pts={crank:[Bl+3,pc,0],fan:[Bl+3,yD+2,-Wc*.10],thermo:[Bl-2,yD+4,-Wc*.12],waterIn:[wiX,pc+2,Wc*.21],tb:V?[Bl+2,yH-2,0]:[Bl+2,pc+hb*.55,-Wc*.43],
    manifolds:V?[[Bl*.15,pc+1,-Wc*.4],[Bl*.15,pc+1,Wc*.4]]:[[Bl*(opts.manX||[.27])[0],pc,Wc*.36],[Bl*(opts.manX||[0,.73])[1],pc,Wc*.36]],alt:[A.x+6,A.y,A.z],altR:A.r,
    mountL:[mX,pc+2,-Wc*.21],mountR:[mX,pc+2,Wc*.21]};
  // opts.mirrorZ (v20b): the engine handed the other way across the car, e.g. the AE86's 4A-GE, whose exhaust is on the car's LEFT and intake on
  // the right (M-07, VERIFIED); the generic inline has its intake left and exhaust right. Every cell and every connection point is mirrored; the
  // engine arms swap names so mountL stays the car's left.
  if(opts.mirrorZ){const M=new Grid(G.x0,G.x1,G.y0,G.y1,-G.z1,-G.z0);for(const [x,y,z,c] of G.list())M.set(x,y,-z,c);
    const f=q=>Array.isArray(q)?(Array.isArray(q[0])?q.map(f):[q[0],q[1],-q[2]]):q;for(const k of Object.keys(pts))pts[k]=f(pts[k]);const t=pts.mountL;pts.mountL=pts.mountR;pts.mountR=t;
    return {grid:M,pts,Lc,Wc,Hc,pc,Bl,yD,yH,yTop:yT,V,tilt:tl,mirrorZ:true};}
  return {grid:G,pts,Lc,Wc,Hc,pc,Bl,yD,yH,yTop:yT,V,tilt:tl};
}
/* ---- longitudinal gearbox (10 mm cells): clutch bell bolted to the engine's rear face, main case, tail housing with the output flange. Local frame as the engine
   (x = 0 at the bell face, the case extends toward -x); t: the gearbox record (tunnel = width), cy: crank height (cells). ---- */
function genGearboxLong(t,cy){
  const W=(t.tunnel||300)/10,len=Math.round(40+(t.ratios?t.ratios.length:5)*4+W*.1),bellR=Math.min(W/2,15),caseR=Math.min(W/2-2,10),tail=12;
  const G=new Grid(-len-4,1,Math.floor(cy-bellR)-1,Math.ceil(cy+bellR+6),-Math.ceil(W/2)-1,Math.ceil(W/2)+1);
  for(let x=-len;x<=0;x++){const f=-x/len,bell=x>-14,r=bell?bellR-(-x)*.25:(x>-len+tail?caseR*(1-.15*(f-.25)):caseR*.55);
    for(let y=Math.floor(cy-r);y<=Math.ceil(cy+r);y++)for(let z=-Math.ceil(r);z<=Math.ceil(r);z++){const d=Math.hypot(y-cy,z*(bell?1:1.05));if(d<=r)G.set(x,y,z,bell?(x>-2?0x6a6e75:0x80868d):(d>r-1?0x6f757c:0x80868d));}}
  for(let x=-len+tail+4;x<=-16;x+=5)cylX(G,cy,0,caseR+.6,x,x,0x5c6168);                    // case ribs
  box(G,-len+tail+2,-len+tail+6,Math.round(cy+caseR*.6),Math.round(cy+caseR*.6)+4,-2,2,0x5a5f66);   // shift linkage platform on the case top
  cylX(G,cy,0,3.5,-len-3,-len,0x8d9298);                                                    // output flange
  return {grid:G,len,out:[-len-3,cy,0]};
}
/* ---- generic body-side aero, 10 mm absolute cells, PAINT (body colour): built on the panels' real outer skin, outside it ---- */
function cellsToGrid(cells){const L=cells.filter(c=>c[3]>=0);if(!L.length)return new Grid(0,0,0,0,0,0);let b=[1e9,-1e9,1e9,-1e9,1e9,-1e9];
  for(const [i,j,k] of L)b=[Math.min(b[0],i),Math.max(b[1],i),Math.min(b[2],j),Math.max(b[3],j),Math.min(b[4],k),Math.max(b[5],k)];
  const G=new Grid(b[0],b[1],b[2],b[3],b[4],b[5]);for(const [i,j,k,c] of L)G.set(i,j,k,c);return G;}
// close the joint between a part hung under a panel and that panel: in every column of the part, cells are added from its top cell up to the panel's underside
// when the panel is within maxD cells above it (a lip or skirt bolted under a panel follows the panel's underside instead of leaving a gap under it)
function closeUp(cells,panels,maxD,clear){clear=clear||0;   // clear: cells left open under the panel (a door's opening clearance)
  const top=new Map();for(const c of cells){if(c[3]<0)continue;const key=c[0]+','+c[2];const t=top.get(key);if(!t||c[1]>t[1])top.set(key,c);}
  const add=[];for(const c of top.values()){const i=c[0],k=c[2];for(let d=1;d<=maxD;d++){if(panels.some(G=>G&&G.get(i,c[1]+d,k)>=0)){for(let q=1;q<d-clear;q++)add.push([i,c[1]+q,k,c[3]]);break;}}}
  return cells.concat(add);}
// outermost |k| of the panels in column (i,j) on side sd (null if none)
function skinK(panels,i,j,sd,kMax){for(let k=kMax||90;k>=10;k--)for(const G of panels)if(G&&G.get(i,j,sd*k)>=0)return k;return null;}
// side skirts: from behind the front arch to ahead of the rear arch, from o.j0 (below the sill) up to o.j1 (under the doors' bottom edge);
// 20 mm proud of the sill skin with a 10 mm top and bottom edge (rounded), the ends tapered; below the sill they follow the sill's lowest skin line
function genSkirts(panels,o){const cells=[];const i0=Math.ceil(o.x0*2),i1=Math.floor(o.x1*2);
  // a door swings out over the skirt: under a door's whole length (and the hinge's reach ahead of it) nothing rises past 10 mm under the door's lowest edge,
  // even where the cell above a column is a fixed panel's (otherwise the door's lower edge sweeps through it as it opens)
  // ahead: how far ahead of the door's front edge its swing can reach (0 when the hinge is at that edge and outboard of the skin, as on the E30, whose
  // door points move outward and back as it opens). colCap: the cap follows the door's lowest cell in each column (a door's points keep their place along
  // the car to within a millimetre until they are past the skirt, so only the door's own column passes over a skirt cell), e.g. under a slanted rear edge
  const dSpan=(o.doors||[]).filter(Boolean).map(G=>{let a=1e9,b=-1e9,jl=1e9;const C=new Map();for(const [i,j] of G.list()){a=Math.min(a,i);b=Math.max(b,i);jl=Math.min(jl,j);if(!C.has(i)||j<C.get(i))C.set(i,j);}return {a,b0:b,b:b+(o.ahead===undefined?6:o.ahead),cap:jl-2,C};});
  const capAt=i=>{let c=1e9;for(const d of dSpan)if(i>=d.a&&i<=d.b)c=Math.min(c,o.colCap?(d.C.has(Math.min(i,d.b0))?d.C.get(Math.min(i,d.b0))-2:d.cap):d.cap);return c;};
  for(let i=i0;i<=i1;i++)for(const sd of [-1,1]){let kb=null;for(let j=o.j0;j<=o.j1+12;j++){const k=skinK(panels,i,j,sd);if(k!==null){kb=k;break;}}if(kb===null)continue;
    for(let j=o.j0;j<=o.j1;j++){const x=i/2,y=j/2;if(j>capAt(i))continue;if(o.arches.some(a=>Math.hypot(x-a.x,y-a.y)<a.r+.6))continue;
      const k0=Math.max(kb,skinK(panels,i,j,sd)||0),end=Math.min(i-i0,i1-i),edge=j===o.j0||j===o.j1||end<2,n=edge?1:2;
      for(let q=1;q<=n;q++)cells.push([i,j,sd*(k0+q),o.col]);}}
  // close the joint upward in every column: up to the first panel cell above it; where that cell is a door's, 10 mm short of it (the door opens over the skirt)
  const top=new Map();for(const c of cells){const key=c[0]+','+c[2];const t=top.get(key);if(!t||c[1]>t[1])top.set(key,c);}const add=[];
  for(const c of top.values()){const i=c[0],k=c[2],cap=capAt(i);for(let d=1;d<=8;d++){const j=c[1]+d;if(j>cap){for(let q=1;q<d;q++)add.push([i,c[1]+q,k,c[3]]);break;}
    if(panels.some(G=>G&&G.get(i,j,k)>=0)){for(let q=1;q<d;q++)add.push([i,c[1]+q,k,c[3]]);break;}
    if(o.doors&&o.doors.some(G=>G&&G.get(i,j,k)>=0)){for(let q=1;q<d-1;q++)add.push([i,c[1]+q,k,c[3]]);break;}}}
  const out=cells.concat(add);
  return cellsToGrid(out);}
// bolt-on fender flares: a ring round each wheel centre from the widened opening (R0) outward over a band, standing out o.out at the opening and blending into the
// panel at the band's outer edge; never on the doors (o.skip), never inside the bumpers (they meet the flare at the arch)
function genFlares(panels,bumpers,o){const cells=[];
  for(const A of o.axles){for(let i=Math.floor((A.x-o.R0-o.band-1)*2);i<=Math.ceil((A.x+o.R0+o.band+1)*2);i++)for(let j=o.jMin;j<=Math.ceil((A.y+o.R0+o.band)*2);j++){
    const x=i/2,y=j/2,d=Math.hypot(x-A.x,y-A.y);if(d<o.R0-.01||d>o.R0+o.band)continue;if(o.skip&&o.skip(x,y))continue;
    const t=(d-o.R0)/o.band,n=Math.round(o.out*2*(1-t*t));if(n<1)continue;
    for(const sd of [-1,1]){const k0=skinK(panels,i,j,sd);if(k0===null)continue;for(let q=1;q<=n;q++){const k=sd*(k0+q);if(bumpers.some(b=>b&&b.get(i,j,k)>=0))break;cells.push([i,j,k,o.col]);}}}}
  return cellsToGrid(cells);}
/* ---- aero parts (any hatchback / notch shell). All hi-resolution (10 mm) absolute grids, drawn at mesh scale .5 ---- */
function genFrontLip(g,fx,lenU){ // fx(y,az) = front bumper face x at height y, lateral az (world units)
  const G=hgrid(g.NOSE_X-3,g.NOSE_X+9,5,10,-g.halfW,g.halfW);
  fillW(G,null,(x,y,z)=>{const az=Math.abs(z);if(y<6.4||y>7.6)return -1;const f=fx(7.5,az);if(f<g.NOSE_X-14)return -1;const front=f+lenU,back=f-2.2;if(x>front||x<back)return -1;if(az>g.halfW-3.5)return -1;return (y>=7.1)?0x16171a:0x0e0f11;});
  return G;
}
function genSplitter(g,fx){
  const G=hgrid(g.NOSE_X-3,g.NOSE_X+12,4,12,-g.halfW,g.halfW);
  fillW(G,null,(x,y,z)=>{const az=Math.abs(z);const f=fx(7.5,Math.min(az,g.halfW-6));if(f<g.NOSE_X-14)return -1;
    if(y>=5.4&&y<=6.4&&x<=f+7.5&&x>=f-3&&az<=g.halfW-1.5)return 0x111214;
    if(az>=g.halfW-2.6&&az<=g.halfW-1.6&&y>=5.4&&y<=8.4&&x<=f+7.5&&x>=f-.5)return 0x0e0f11;      // end fences
    return -1;});
  return G;
}
function genHatchSpoiler(g,xe,ye,slope){   // roof-edge spoiler: xe, ye = where the roof ends (world); follows the glass slope
  const G=hgrid(xe-14,xe+1,ye-8,ye+4,-32,32);
  fillW(G,null,(x,y,z)=>{const az=Math.abs(z);if(az>29-Math.max(0,(x-(xe-3)))*0)return -1;const L=xe-x;if(L<0||L>11)return -1;const yc=ye+1.6-L*slope*.55+Math.sin(Math.min(1,L/11)*Math.PI)*.4;if(y<yc-.5||y>yc+.5)return -1;return 0x1a1b1e;});
  for(const s of [-1,1])fillW(G,null,(x,y,z)=>{if(Math.abs(z-s*24)>.6)return -1;const L=xe-x;if(L<1||L>8||y<ye-L*slope-.4||y>ye+1.1-L*slope*.55)return -1;return 0x111214;});
  return G;
}
function genGTWing(g,xw,yBase,yWing){      // wing on the hatch near its rear edge: xw = blade leading edge, yBase = lid surface under it, yWing = blade height
  const G=hgrid(xw-12,xw+2,yBase-2,yWing+7,-36,36);
  fillW(G,null,(x,y,z)=>{const az=Math.abs(z);
    if(az<=33&&y>=yWing-.4&&y<=yWing+.4+Math.max(0,(xw-x))*.12&&x<=xw&&x>=xw-8.5)return 0x15161a;                         // blade with a rear lift
    if(az>=33&&az<=33.8&&y>=yWing-1.2&&y<=yWing+4.5&&x<=xw+.3&&x>=xw-9)return 0x0e0f11;                                    // end plates
    for(const s of [-1,1])if(Math.abs(z-s*22)<=.9&&y>=yBase&&y<=yWing&&x<=xw-3&&x>=xw-4.6)return 0x2a2c30;                   // struts
    return -1;});
  return G;
}
