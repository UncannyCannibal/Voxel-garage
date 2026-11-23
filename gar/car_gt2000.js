CAR_MODULES.gt2000=function(G){
'use strict';
const {mkFrameSeals,THREE,scene,camera,carRoot,body,P,wheels,MIRRORS,state,anim,phys,keys,mk,paintable,mkGlass,mkPane,mkGlassSheet,SKIN,group,bufGeo,makeMirror,swapGeo,matPaint,matV,matGlass,matMirror,matMirrorPaint,matHead,matTailRed,matTailAmb,matTailWht,matFrontAmb,cfg,D2R,clamp,lerp,V3,Q,yAxis,zAxis,segTo,bodyM,bodyPt,build,$}=G;
const SH=SHELLS.gt2000,GT=makeGT2000(),RG=makeRig(GT,GT2000_RIG),cp=GT2000_RIG.cp,DS=GT2000_RIG.dash,BAY=GT2000_RIG.bay,PW=GT2000_RIG.power,SU=GT2000_RIG.susp;
const matGlassGT2000=matGlass.clone();matGlassGT2000.opacity=.42;   // REDO L-1: GT2000-only glass (AE86 precedent: clone + .42); shared matGlass untouched
const GT_GLASS_TINT=[.14,.17,.18];   // REDO L-1: the GT2000's own grid-truth glass colour GL=0x232a2e (neutral dark, OPEN-20 unmeasured) — the render default [.55,.72,.80] pale steel-blue discarded it; photo-matched dark read, OPEN-20 flag KEPT (no measured tint claimed)
const {NOSE_X,REAR_X,AX_F,AX_R,WR,BELT,ROOF,DOOR_F,DOOR_R,HOOD_HINGE,HATCH_HINGE}=GT;
const KZ=GT2000_RIG.KZ,ZK=KZ,HUB_F=SH.hubFaceZ,HUB_R=SH.hubFaceZ,MAX_STEER=GT2000_RIG.MAX_STEER,WB=116.5;
let WY=WR,ENG_X=0,CRANK_Y=0,ENG_Z=0;
const matHeadGT=matHead.clone();matHeadGT.emissiveIntensity=.02;   // GT2000-only pod-lens material (the AE86 flood lesson: shared matHead eases to 1.1 with lights on and drowns lens patterns)
const PAINTS=[['Solar Red',0xa81e22],['Pegasus White',0xe9e7e0]];
const SHAKE_SLOW=.2,CRANK_SLOW=.035;
function ackermann(d){if(Math.abs(d)<1e-6)return [0,0];const Rr=WB/Math.tan(Math.abs(d)),inn=Math.atan(WB/(Rr-KZ)),out=Math.atan(WB/(Rr+KZ));return d>0?[inn,out]:[-out,-inn];}   // [left, right]; d>0 turns left, so the left wheel is the inner one
const turnPhase=()=>Math.floor(state.t*1.5)%2===0;
const stages=[];
function stage(label,fn){stages.push([label,fn]);}
function byIdSafe(slot,id){return byId(slot,id)||byId(slot,'stock');}   // DESIGN-hex examples ONLY (OPEN-19 — examples, not a verified list)
const mkSeg=(geo,mat)=>{const m=new THREE.Mesh(geo,mat||matV);carRoot.add(m);return m;};
function glassSteps(G,sd){const outer=new Map(),bottom=new Map(),K=(i,j)=>i+','+j;
  for(const [i,j,k] of G.list()){const a=Math.abs(k),key=K(i,j);if(!outer.has(key)||a>outer.get(key))outer.set(key,a);if(!bottom.has(i)||j<bottom.get(i))bottom.set(i,j);}
  const out=[];for(let s=0;s<=10;s++){const T=s*4,N=new Grid(G.x0,G.x1,G.y0,G.y1,G.z0,G.z1);
    for(const [i,j,k,v] of G.list()){const r=j-T;if(r<bottom.get(i))continue;const kn=outer.get(K(i,r));if(kn===undefined)continue;N.set(i,r,sd*(kn-(outer.get(K(i,j))-Math.abs(k))),v);}
    out.push(N);}
  return out;}
function gt2000Wheel(dia,widthIn){   // centre-lock face: black face, 8 elongated slots in a ring, polished lip, chrome knock-off nut + 5 hub bolts. NEVER a bolted face.
  const rim=dia*25.4/20,hw=widthIn*25.4/20,R=Math.ceil(rim+2),Z=Math.ceil(hw+3),g=new Grid(-R,R,-R,R,-Z,Z),halfW=hw,face=0;
  g.fill((x,y,z)=>{
    const r=Math.hypot(x,y),a=Math.atan2(y,x);
    if(r>rim+1.2)return -1;
    if(r>=rim-1.7&&r<=rim-.2&&z>=-halfW&&z<=halfW)return 0x8d9298;   // barrel
    if(r>=rim-.2&&r<=rim+1.2&&Math.abs(z)>=halfW-1.3&&Math.abs(z)<=halfW)return COL.chrome;   // polished rim lip
    if(z>=face-1&&z<=face+4&&r<=8.8){   // MINFIX W5/W6/W10: LARGE chrome centre-lock assembly FIRST (the face block below would otherwise swallow the hub region): Ø170 chrome disc + Ø88 raised centre nut + 5 proud hub bolts on a Ø120 circle (early-wheel photo; nut markings are VOXEL-LIMITED and are NOT faked)
      if(r<=4.4&&z>=face+2.2)return COL.chrome;   // MINFIX W5: raised centre nut Ø88 (was Ø70; handed threads, TOYOTA/UNDO/side markings below voxel resolution — not faked)
      for(let i=0;i<5;i++){const q=i*Math.PI*2/5;if(Math.hypot(x-6.0*Math.cos(q),y-6.0*Math.sin(q))<=.95&&z>=face+2.2)return COL.chrome;}   // MINFIX W10: 5 hub bolts on a Ø120 circle (was Ø104), proud of the disc
      if(r<=8.5&&z>=face+1.2)return COL.chrome;   // MINFIX W6: chrome disc Ø170 (was Ø130)
      return 0x3a3d42;}
    if(z>=face-1&&z<=face+.8&&r<rim-1.7){   // black magnesium face with 8 elongated slots
      const rin=5.5,rout=rim-1.2,t=(r-rin)/(rout-rin),n=8,f=((a%(Math.PI*2/n))+Math.PI*2/n)%(Math.PI*2/n)-Math.PI/n;
      if(r<rin+1.5||r>rout-1.2)return 0x17181c;
      const slot=t>.15&&t<.88&&Math.abs(f)<.15;if(slot)return -1;return 0x17181c;}   // FIX1 V-5: ELONGATED slots — 90 mm radial x ~36 mm wide (2.5:1, early-wheel photo), not near-square fragments
    return -1;});
  return g;}
function gt2000Knuckle(sd,front,rotorMM){const hubIn=(650-45)/20-KZ,S=front?SU.front:SU.rear;
  return genKnuckle(sd,{boss:[0,hubIn-.25,2.25],lbj:S.lbj[0],ubj:S.ubj[0],armZ:[-1,-.5],steer:front?[-5.5,-3.2,-.8]:null,cal:[-(.6*rotorMM/40)+.05,0,hubIn-.75],trail:front?null:[0,SU.rear.trailY,.5]});}
function rotK(p,sd,th){const c=Math.cos(th),s=Math.sin(th),x=p[0]-AX_F,z=p[2]-sd*KZ;return [AX_F+x*c+sd*z*s,p[1],sd*KZ-sd*x*s+z*c];}   // rotate a knuckle point about the kingpin axis (Eclipse form; the steer arm [-5.5,-3.2,-.8] matches gt2000Knuckle's)
function exhF(){const X=GT2000_RIG.exh,d=build.downpipe;return Object.assign({},X,d?{x0:d[0],y0:d[1]-1.5,z0:d[2]}:{x0:X.x0,y0:X.frontY,z0:X.zRun});}
// FIX2 V-7: the catalog 'stock' exhaust carries tip:'single' (not 'stock'), so the
// old tip0==='stock' test never fired and genExhaustTips' single->stock alias built
// the generic twin branch (r=2.6) whose 1.4-cell bore renders as a PLUS, not a round
// hole — and at ±3 units, not this car's twin-centre layout. Map the stock part to
// the quad branch with this car's own tipsZ, and reshape the outlet plane to a true
// stepped-circle bore (the shared builder's 3x3 square bore at r=3 would not read
// round either). Module-local only: the shared builder is untouched, and non-stock
// shop tips pass through unchanged (only the quad/stock case is reshaped).
function gt2000TipMap(t){return (t==='stock'||t==='single')?'quad':t;}
function gt2000Tips(tip,F){
  const G=genExhaustTips(tip,F);
  if(tip!=='quad')return G;
  const R=F.tipR||3,i0=G.x0,ty=F.tipYOf&&F.tipYOf(tip)!==undefined?F.tipYOf(tip):F.tipY,J=Math.round(ty*2);   // outlet plane = rearmost plane; grid rows are tipY*2 (10 mm cells)
  for(const zc of (F.tipsZ||[-1.5,1.5])){
    const K=Math.round(zc*2);
    for(let j=J-R;j<=J+R;j++)for(let k=K-R;k<=K+R;k++){
      const d=Math.hypot(j-J,k-K);
      if(d>R)continue;
      G.set(i0,j,k,d<=R-1?0x1a1b1d:0xdfe3e8);   // dark round bore + 1-cell chrome annulus, centred on the pipe axis
    }
  }
  return G;
}
function coilGeo(front,col){const CO=GT2000_RIG.coil,DM=GT2000_RIG.damper,S=front?SU.front:SU.rear,lowOnBody=(S.springLow||.3)<DM.bodyFrac;
  return bufGeo(geoData(genCoil(CO.n,CO.R,CO.w,CO.turns,col,[front&&lowOnBody?DM.bodyR+.3:(front?DM.rodR+.5:DM.bodyR+.3),DM.rodR+.5]),0,0,0));}
function suspPts(front,sd){const S=front?SU.front:SU.rear,ax=front?AX_F:AX_R,bp=a=>[ax+a[0],a[1],sd*a[2]];
  return {lowF:bp(S.lowF),lowR:bp(S.lowR),upF:bp(S.upF),upR:bp(S.upR),strutTop:bp(S.strutTop),trail:S.trail?bp(S.trail):null,
          lbj:[ax,WY+S.lbj[0],sd*(ZK+S.lbj[1])],ubj:[ax,WY+S.ubj[0],sd*(ZK+S.ubj[1])],strutLow:[ax+S.strutDx,WY+S.strutLy,sd*(ZK-S.strutLowDz)],springTopY:S.springTopY,springLow:S.springLow||.3};}
function hoodLow(x0,x1,z0,z1){let m=1e9;for(let x=x0;x<=x1;x+=.5)for(let z=z0;z<=z1;z+=.5)m=Math.min(m,GT.top(x,z)-1.4);return m;}   // hood underside over the engine footprint (Z32 form)
stage('Shaping the body panels',()=>{
  PCA_R=PAINT_PCA_R;   // smooth paint (e30_core.js PAINT_PCA_R, owner Nov 13); it used whatever the car before it had set
  SKIN.mode='voxel';   // voxel panels like the E30 and the EF (the owner's look): 10 mm terraces on the measured surfaces
  const r=buildGT2000Body(GT);build.r=r;build.GT=GT;const H=r.hi;
  const GL_=Object.values(H.glass),SM={body:[H.hood,H.trunk,H.doorL,H.doorR,...GL_],hood:[H.body,H.doorL,H.doorR,...GL_],trunk:[H.body,...GL_],doorL:[H.body,H.hood,H.trunk,H.doorR,...GL_],doorR:[H.body,H.hood,H.trunk,H.doorL,...GL_]};
  const gpWS=glassPane(H.glass.ws,{bodies:[H.body,H.hood],rLo:1.5,rHi:4,surf:GT.solidAt,lift:.1});
  P.bodyMesh=paintable(H.body,body,undefined,.5,{o:SM.body,wy:[.45,.8],snap:GT.solidAt});   // snap: the skin is drawn ON the measured surface
  const hh=group(body,HOOD_HINGE[0],HOOD_HINGE[1],0),hm=paintable(H.hood,hh,undefined,.5,{o:SM.hood,snap:GT.solidAt});hm.position.set(-HOOD_HINGE[0],-HOOD_HINGE[1],0);P.hood=hh;
  const th=group(body,HATCH_HINGE[0],HATCH_HINGE[1],0),tm=paintable(H.trunk,th,undefined,.5,{o:SM.trunk,snap:GT.solidAt});tm.position.set(-HATCH_HINGE[0],-HATCH_HINGE[1],0);P.trunk=th;
  // Doors hinge on the outermost door skin at the front edge (so nothing sweeps forward into the fender).
  let zOut=0;for(const D of [H.doorL,H.doorR])for(const [i,j,k] of D.list())if(i/2>=DOOR_F-1.5)zOut=Math.max(zOut,Math.abs(k)/2);
  build.doorHingeZ=zOut;
  const doorMesh={};for(const sd of [-1,1]){
    const hz=sd*zOut,dg=group(body,DOOR_F,0,hz),DG=sd<0?H.doorL:H.doorR,dm=paintable(DG,dg,undefined,.5,{snap:GT.solidAt});dm.position.set(-DOOR_F,0,-hz);doorMesh[sd<0?'L':'R']=dm;
    // Door glass: winding it down slides the pane down along its own curved surface, 0..400 mm in 11 steps; the part inside the door runs in the door's cavity and is not drawn.
    const GS=glassSteps(sd<0?H.glass.dgL:H.glass.dgR,sd).map((Gr,i)=>{const m=mkGlass(Gr,'side',dg,.5,GT_GLASS_TINT,matGlassGT2000);if(m){m.position.set(-DOOR_F,0,-hz);m.visible=i===0;}return m;});
    P['door'+(sd<0?'L':'R')]=dg;P['dglass'+(sd<0?'L':'R')]=GS;
    const dc=mk(genDoorCard(sd,DG,{x0:DOOR_R+2,x1:DOOR_F-2.5,y0:GT2000_RIG.doorCard.y0,y1:BELT-1.2,trim:0x232427,hi:1,xMin:y=>GT.doorRear(y)+1.5}),matV,0,dg,.5);if(dc){dc.position.set(-DOOR_F,0,-hz);(P.doorCards=P.doorCards||[]).push(dc);}
    // Door handle: MINFIX S2/S4/S5/S6 — symmetric 210 mm pull centred on its station (the old buildHandle mesh is origin-at-one-end + rotated ±90°, which put the two sides' centres 120 mm apart at 140 mm long). Station: 2195 mm behind the front axle (m 3425 = 130 mm ahead of the door rear edge), y 778 (belt 808 less 30).
    const hx=GT.wx(GT2000_M.handle),hy=GT.u(778),hs=GT.halfAt(hx,hy),hd=mk(gt2000Handle(),matV,0,dg,.5);hd.position.set(hx-DOOR_F,hy,sd*(hs+.1)-hz);
    const lk=mk(gt2000LockDisc(),matV,0,dg);lk.position.set(hx-4.5-DOOR_F,hy-3,sd*(hs+.2)-hz);   // lock 90 mm behind the handle centre = 15 mm inboard of the handle's rear end, under the rear portion (doorline photo); identical both sides
  }
  P.frameSeals=mkFrameSeals([{g:H.body,grp:P.bodyMesh},{g:H.doorL,grp:doorMesh.L},{g:H.doorR,grp:doorMesh.R},{g:H.trunk,grp:tm},{g:H.hood,grp:hm}],Object.values(H.glass),{fenceGlass:[H.glass.ws]});   // smooth rubber lines on the window frames (frame_seal.js, owner Nov 13)
  // Fender bullet mirrors (MEASURED: fender-mounted, never door mirrors). Body-mounted:
  // the glass faces rearward toward the driver; photograph seating from BEHIND.
  for(const sd of [-1,1]){
    const mr=gt2000FenderMirror(GT,sd);
    let mSelf;{const ms=paintable(mr.shell,body,undefined,.5,{seat:GT.solidAt});const mg=mk(mr.glass,matMirror,0,body,.5);mSelf=[ms,mg].filter(Boolean);}
    MIRRORS.push(makeMirror(body,new THREE.Vector3(mr.glassCenter[0],mr.glassCenter[1],mr.glassCenter[2]),mr.glassSize[0],mr.glassSize[1],'fender'+(sd<0?'L':'R'),-sd*(sd===cp.side?12:14)*D2R,mSelf));
  }
  const g=H.glass;{const m=mkGlassSheet(g.ws,body,.5,GT.solidAt,undefined,undefined,GT_GLASS_TINT,matGlassGT2000);P.paneWS={pane:m,gp:gpWS,meshes:[m]};}P.glassWS=P.paneWS.pane;
  {const m=mkGlassSheet(g.rw,th,.5,GT.solidAt,undefined,undefined,GT_GLASS_TINT,matGlassGT2000);P.paneRW={pane:m,meshes:[m]};if(m)m.position.set(-HATCH_HINGE[0],-HATCH_HINGE[1],0);}   // MINFIX T8: rear-glass pane rides the hatch group (EF/Z32/AE86 pattern); the body gasket ring round the opening stays in the body
  P.glassQL=mkGlass(g.qgL,'side',body,.5,GT_GLASS_TINT,matGlassGT2000);P.glassQR=mkGlass(g.qgR,'side',body,.5,GT_GLASS_TINT,matGlassGT2000);
});

stage('Bumpers, lamps and trim',()=>{
  const bf=gt2000BumperF(),bb=gt2000BumperR();build.bf=bf;build.bb=bb;
  const _smB=SMOOTH_BLEND;SMOOTH_BLEND=0;   // flat face normals on the bumper faces only (Eclipse fix-2 lesson: the smoothing itself read as wavy drape)
  P.bumperF=paintable(bf.grid,body,undefined,.5,{seat:GT.solidAt});P.bumperR=paintable(bb.grid,body,undefined,.5,{seat:GT.solidAt});
  SMOOTH_BLEND=_smB;
  for(const ov of bf.over){const m=mk(ov,matV,0,P.bumperF,1);if(m)(P.bumperOver=P.bumperOver||[]).push(m);}   // FIX1 F-3: scale 1, NOT .5 — P.bumperF is already a .5 paintable group, so .5 here double-scaled to .25 and buried the overriders mid-body
  for(const ov of bb.over){const m=mk(ov,matV,0,P.bumperR,1);if(m)(P.bumperOver=P.bumperOver||[]).push(m);}   // FIX1 F-3: scale 1 — the bumperettes + rubber inserts were buried at quarter coordinates by the same double-scale bug; at correct scale they flank the plate recess per spec
  // Licence plates on the bumpers (plain white plates, 300 x 150 mm DESIGN).
  const plateG=()=>{const g=new Grid(0,1,0,15,-15,15);g.fill((x,y,z)=>{const az=Math.abs(z);return (az>=15||y<=0||y>=15)?0x20262c:COL.white;});return g;};
  const pf=mk(plateG(),matV,0,body,.5);pf.position.set(120.75,7,0);P.plateF=pf;   // on the front blade's face, below the bumper centre
  const pr=mk(plateG(),matV,0,body,.5);pr.position.set(-91.0,12,0);P.plateR=pr;   // MINFIX R23: in the rear plate recess between the bumperettes, rear face FLUSH with the guard rubber rear (-1825 mm; was 25 mm proud)
  // TWO lighting systems, both honoured: pop-up pods (lights state) AND fixed plexiglass
  // driving/fog lamps (ALWAYS visible, never wired to lights state).
  P.lamp_drive=[];
  for(const sd of [-1,1]){const m=mk(gt2000DriveLamp(sd),matV,0,body,.5);if(m)P.lamp_drive.push(m);}
  P.lamp_signal=[];
  for(const sd of [-1,1]){const m=mk(gt2000Signal(sd),matFrontAmb,0,body,.5);if(m)P.lamp_signal.push(m);}   // amber signals blink (observed function)
  {const m=mk(gt2000Grille(),matV,0,body,.5);if(m)P.grille=m;}
  P.lamp_tail=[];
  for(const sd of [-1,1]){const m=mk(gt2000Tail(sd),matV,0,body,.5);if(m)P.lamp_tail.push(m);}   // tail lamps render UNLIT (OPEN-7: function order not encoded, never the AE86 order)
  for(const sd of [-1,1]){const m=mk(gt2000Marker(sd),matV,0,body,.5);if(m)(P.markers=P.markers||[]).push(m);}
  {const m=mk(gt2000DeckBadge(),matV,0,P.trunk,.5);if(m){m.position.set(-HATCH_HINGE[0],-HATCH_HINGE[1],0);P.deckBadge=m;}}   // MINFIX R12: badge rides the hatch (deck lid), not the body
  for(const sd of [-1,1]){const m=mk(gt2000Triangle(sd),matV,0,body,.5);if(m)(P.triBadges=P.triBadges||[]).push(m);}
  {const m=mk(gt2000Cap(),matV,0,body,.5);if(m)P.fuelCap=m;}
  {const m=mk(gt2000Aerial(),matV,0,body,.5);if(m)P.aerial=m;}
  // Pop-up pods: standalone meshes from fresh grids (never shell grids), visible iff
  // state.lights > 0 (AE86 pod pattern). Raised pod = dark bucket body + round lens on
  // its front face; the cover rotates with the assembly (LID-1 lesson: no body-white lid).
  P.pods=[];
  for(const sd of [-1,1]){const pd=gt2000Pod(sd,GT),pg=new THREE.Group();
    mk(pd.body,matV,0,pg,.5);mk(pd.lens,matHeadGT,0,pg,.5);body.add(pg);pg.visible=false;P.pods.push(pg);}
  P.driveLamps=P.lamp_drive;P.frontAmb=P.lamp_signal;P.tailLamps=P.lamp_tail;
});
stage('Mounting the engine bay',()=>{
  P.bay=mk(RG.bay(),matV,0,body);
  P.hoses=new THREE.Mesh(new THREE.BufferGeometry(),matV);body.add(P.hoses);   // filled by setEngine
  P.mounts=new THREE.Mesh(new THREE.BufferGeometry(),matV);body.add(P.mounts);   // filled by setEngine
  const eg=group(body,ENG_X,CRANK_Y,0);P.engGroup=eg;P.engine=eg;
  const cpu=group(eg,0,0,0);P.crankP=cpu;P.altP=group(eg,0,0,0);P.fan=group(eg,0,0,0);
  setEngine(cfg.engine||'3M',cfg.gearbox||'gt2000-5mt');
  P.under=mk(genUnder(Object.assign({fx0:AX_R+6,fx1:AX_F+GT2000_RIG.under.fx1dx,rx:AX_R+8},GT2000_RIG.under)),matV,0,body);
  // FIX1 F-7: under-mount posts DELETED — with the rails at the floor pan (subY 10.4) the posts would be zero-length; the rails bolt to the floor they already touch. (No other code reads P.underMounts.)
  {const tip=gt2000TipMap(byIdSafe('exhaust',cfg.exhaust||'stock').tip);   // FIX2 V-7: catalog 'stock' exhaust carries tip:'single', so the old tip0==='stock' test never fired (twin centre-rear tips, not the generic single tip)
   P.exh=mk(genExhaust(GT,tip,exhF()),matV,0,body);P.exhTips=mk(gt2000Tips(tip,exhF()),matV,0,body,.5,.02);}
  // RWD propshaft (single segment, spun x FINAL in post) + rear differential carrier (unit grid, body frame). The propshaft is NOT part of
  // the engine swap: it is built once here and survives setEngine re-runs.
  {const dsg=group(body),dsm=mk(genShaftE30(100,false),matV,0,dsg);P.ds=[{g:dsg,m:dsm}];}
  {const dg=new Grid(AX_R-2,AX_R+2,12,16,-3,3);dg.fill(()=>0x2a2c30);box(dg,AX_R+2,AX_R+5,13,15,-1,1,0x2a2c30);P.diff=mk(dg,matV,0,body);}
});

stage('Furnishing the cabin',()=>{
  P.interior=mk(RG.interior(),matV,0,body);
  const dd=mk(RG.dashDetail(),matV,0,body,.5,.03);dd.position.set(...RG.dashDetailPos);P.dashDetail=dd;
  const W0=cp.wheel,sw=group(body,W0.x,W0.y,W0.z);sw.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),new THREE.Vector3(...W0.n).normalize());
  // Interior mirror: WITHHELD per OPEN-13 (Eclipse F-3 lesson). The INTERIM eye vector
  // (draft cp.eye) is a boot/drive placeholder, NOT a measured station — no mirror is
  // placed from it, and no eye is moved by guess. Visors stay (they hang from the roof).
  P.visors=[];
  for(const sd of [-1,1]){const v=buildVisor(build.r,sd),vm=mk(v.grid,matV,0,body,.5);vm.position.set(...v.pos);P.visors.push(vm);}
  const swi=group(sw,0,0,0);P.swheel=swi;P.swm=mk(genSteeringWheel(360,{}),matV,0,swi,.5);P.swm.position.set(0,0,-.75);   // 360 mm INTERIM (Eclipse pattern); OPEN-13 measures the GT2000 wheel, setSteering replaces it
  setSeats();
  // Gauges on the binnacle face in front of the driver. Side-multiplied: cp.H.z is a
  // MAGNITUDE, so the driver's gauges sit at side*(H.z-/+) — a bare H.z-/+ would put
  // them on the passenger side for RHD (the naive-mirror trap, caught at splice).
  for(const [z,name,mark] of [[cp.side*(cp.H.z-4.5),'tach',7],[cp.side*(cp.H.z+4),'speedo',12]]){
    const f=mk(buildGaugeFace(4,mark),matV,0,body,.5);f.position.set(DS.rearX-1.5,DS.top+1.5,z);(P.gaugeFaces=P.gaugeFaces||[]).push(f);
    const nd=group(body,DS.rearX-1.7,DS.top+1.5,z);const nm=mk(buildNeedle(3.5),matV,0,nd,.5);nm.rotation.z=Math.PI/2;P[name]=nd;
  }
  cp.pedals.forEach(([n,z,w,h])=>{const pg=group(body,cp.pedalX,cp.pedalY,z);mk(genPedal(w,h,cp.pedalLen),matV,0,pg,.5);P['ped_'+n]=pg;});   // RHD set: clutch inboard (14.5), brake at driver centre (20), gas outboard (25.5) — NOT a naive mirror of LHD
  {const zs=cp.pedals.map(p=>p[1]);P.pedalBox=mk(genPedalBox(cp.pedalX,cp.pedalY,Math.min(...zs)-3,Math.max(...zs)+3,solidOf([build.r.hi.body],[P.interior.geometry.userData.src,P.bay.geometry.userData.src])),matV,0,body,.5);}   // pivot shaft and its brackets to the dash / firewall
  const sh=group(body,cp.shifter.x,cp.shifter.y+.5,0);mk(genShifter(17,cfg),matV,0,sh,.5,.02);P.shifter=sh;
  // Front wipers only (DESIGN pivots — wiper layout unmeasured for the GT2000): pivots on
  // the cowl just under the glass's lower edge, parked toward the right; blades on the glass.
  // NO rear wiper (none observed on the coupe's fixed rear glass).
  P.wiperRig=wiperRig(P.paneWS.gp,body,[{pivot:38,park:5,arm:40,blade:46,sweep:70,dir:1},{pivot:-6,park:3,arm:36,blade:40,sweep:64,dir:1}],.5);P.wipers=[];P.wiperPivots=[];
});

stage('Assembling wheels and suspension',()=>{
  const w0=cfg.wheel||{style:'gt2000-15',dia:15,width:5,et:null,tw:165,ar:80};
  const ty0=tyreFor(w0.dia,w0.width,w0.tw,w0.ar);
  const tireG=bufGeo(geoData(buildTireP(ty0.OD,ty0.tw,w0.dia,w0.width),0,.03,0)),
        rimG=bufGeo(geoData(w0.style==='gt2000-15'?gt2000Wheel(w0.dia,w0.width):buildRimP(w0.style,w0.dia,w0.width,w0.et,'plain',{exact:1}),0,.03,0)),
        rotFG=bufGeo(geoData(buildRotorP(279),0,.03,0)),calFG=bufGeo(geoData(buildCaliperP(279,'stock',1),0,.03,0)),
        rotRG=bufGeo(geoData(buildRotorP(267),0,.03,0)),calRG=bufGeo(geoData(buildCaliperP(267,'stock',1),0,.03,0));
  P.rimMeshes=[];
  const hub=(name,x,sd,steer)=>{   // c: on the kingpin (steers), off: out to the wheel's centre plane, fl: the wheel (mirrored on the left), sp: spins
    const front=name[0]==='F',zc0=((front?HUB_F:HUB_R)-(w0.et||0))/20,rotor=front?279:267;
    const c=group(carRoot,x,WR,sd*KZ),cb=group(c,0,-5.5,0),st=group(cb,0,5.5,0),off=group(st,0,0,sd*(zc0+((front?cfg.spacerF:cfg.spacerR)||0)/20-KZ)),fl=group(off);if(sd<0)fl.rotation.y=Math.PI;
    const sp=group(fl);
    const tire=new THREE.Mesh(tireG,matV);tire.scale.setScalar(.5);sp.add(tire);
    const rim=new THREE.Mesh(rimG,matV);rim.scale.setScalar(.5);sp.add(rim);P.rimMeshes.push(rim);
    const rot=new THREE.Mesh(front?rotFG:rotRG,matV);rot.scale.setScalar(.5);sp.add(rot);
    const cg=group(fl);cg.rotation.z=sd<0?Math.PI:0;const cal=new THREE.Mesh(front?calFG:calRG,matV);cal.scale.setScalar(.5);cg.add(cal);
    const kn=new THREE.Mesh(bufGeo(geoData(gt2000Knuckle(sd,steer,rotor),0,.03,0)),matV);kn.scale.setScalar(.5);st.add(kn);   // the knuckle (upright) steers with the wheel; it does not spin
    wheels[name]={c,cb,st,off,sp,sd,steer,tire,rim,rot,cal,cg,kn};   // cb: camber (knuckle and wheel turn about the lower ball joint, 110 mm under the hub)
  };
  hub('FL',AX_F,-1,true);hub('FR',AX_F,1,true);hub('RL',AX_R,-1,false);hub('RR',AX_R,1,false);
  // Suspension links: double wishbones front and rear (VERIFIED type), coil-over dampers,
  // tie rods (front), rear half-shafts from the final-drive flange to the hub carriers.
  const LK=GT2000_RIG.links,armG=bufGeo(geoData(genLink(LK.n,LK.arm,0x2b2e33),0,0,0)),rodG=bufGeo(geoData(genLink(LK.n,LK.rod,0x3a3d42),0,0,0)),
        DM=GT2000_RIG.damper,CO=GT2000_RIG.coil,strG=bufGeo(geoData(genDamper(DM.n,DM.bodyR,DM.rodR,DM.bodyFrac),0,0,0)),sprG=coilGeo(true,0x16171a),sprGR=coilGeo(false,0x16171a),shG=bufGeo(geoData(genLink(LK.n,LK.shaft,0x8d9298),0,0,0));
  P.links=[];
  for(const nm of ['FL','FR','RL','RR']){
    const L={nm,lowF:mkSeg(armG),lowR:mkSeg(armG),upA:mkSeg(armG),upB:mkSeg(armG),strut:mkSeg(strG),spring:mkSeg(nm[0]==='F'?sprG:sprGR)};
    if(nm[0]==='F'){L.rod=mkSeg(rodG);}else{L.trail=mkSeg(armG);L.rshaft=mkSeg(shG);}
    P.links.push(L);
  }
  P.rack=mk(RG.rack(),matV,0,body);P.rack.position.set(AX_F+SU.front.rack.dx,SU.front.rack.y,0);
  const sg=new THREE.Mesh(new THREE.PlaneGeometry(240,105),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.38,depthWrite:false}));
  sg.rotation.x=-Math.PI/2;sg.position.set(0,.25,0);carRoot.add(sg);
  for(const sd of [-1,1]){const sl=new THREE.SpotLight(0xfff0cf,0,1400,.5,.55,1);sl.position.set(112.5,38,sd*25.65);carRoot.add(sl);const tg=new THREE.Object3D();tg.position.set(500,6,sd*25.65);carRoot.add(tg);sl.target=tg;(P.beams=P.beams||[]).push(sl);}   // beams at the pop-up lamps' height, aimed down the road
});
/* ---------- per-frame animation ---------- */
function pre(dt){
  const ease=(k,tg,sp)=>{anim[k]+=(tg-anim[k])*Math.min(1,dt*sp);return anim[k];};
  P.doorL.rotation.y=-ease('doorL',state.doorL,6)*62*D2R;P.doorR.rotation.y=ease('doorR',state.doorR,6)*62*D2R;
  P.hood.rotation.z=ease('hood',state.hood,4)*58*D2R;P.trunk.rotation.z=-ease('trunk',state.trunk,4)*62*D2R;   // MINFIX T8: glass+deck hatch hinged at the roof — points aft of the roof rise
  const wv=ease('win',state.win,5),ws=Math.round(wv*10);for(const k of ['dglassL','dglassR'])P[k].forEach((m,i)=>{if(m)m.visible=i===ws;});
}
const camberOf=front=>(front?(cfg.camberF||0):(cfg.camberR||0))*D2R;   // degrees in the build, negative = the top of the wheel leans in
function post(dt){
  const lift=WY-WR;if(lift){body.position.y+=lift;body.updateMatrix();bodyM.copy(body.matrix);}   // in the body frame the hub stays where the suspension holds it
  const [aL,aR]=ackermann(state.delta);
  for(const k in wheels){const w=wheels[k];w.c.position.y=WY;w.cb.rotation.x=w.sd*camberOf(w.steer);w.st.rotation.y=w.steer?(w.sd<0?aL:aR):0;w.sp.rotation.z=(w.sd<0?1:-1)*state.spin;}
  // Camber: the upright turns about its lower ball joint; the upper ball joints, the steering arm and the trailing-link lugs move with it.
  const camP=(v,sd,front)=>{const c=sd*camberOf(front),py=WY-5.5,pz=sd*KZ,dy=v.y-py,dz=v.z-pz;v.y=py+dy*Math.cos(c)-dz*Math.sin(c);v.z=pz+dy*Math.sin(c)+dz*Math.cos(c);return v;};
  // Steering arms on the knuckles (behind the axle) turn with their wheels; the rack moves by their mean lateral travel.
  const RK=SU.front.rack,knk=sd=>[AX_F-5.5,WY-3.2,sd*(ZK-.8)],kL=rotK(knk(-1),-1,aL),kR=rotK(knk(1),1,aR),rackShift=((kL[2]-knk(-1)[2])+(kR[2]-knk(1)[2]))/2;
  P.rack.position.set(AX_F+RK.dx,RK.y,rackShift);   // the rack is fixed to the body (body frame)
  const LK=GT2000_RIG.links,V=a=>new V3(a[0],a[1],a[2]),B=a=>bodyPt(a[0],a[1],a[2]);
  for(const L of P.links){
    const front=L.nm[0]==='F',sd=L.nm[1]==='R'?1:-1,ax=front?AX_F:AX_R,S=suspPts(front,sd),th=front?(sd<0?aL:aR):0,rk=p=>front?rotK(p,sd,th):p;
    const DM=GT2000_RIG.damper,CO=GT2000_RIG.coil;
    const lbj=V(rk(S.lbj)),ubj=V(rk(S.ubj));
    segTo(L.lowF,B(S.lowF),lbj,zAxis,LK.n,.5);segTo(L.lowR,B(S.lowR),lbj,zAxis,LK.n,.5);
    segTo(L.upA,B(S.upF),ubj,zAxis,LK.n,.5);segTo(L.upB,B(S.upR),ubj,zAxis,LK.n,.5);
    const lo=V(S.strutLow),up=B(S.strutTop);   // double wishbone: the damper does NOT steer with the knuckle (unlike a MacPherson strut) — its lower mount is on the arm, its top on the body
    const sTop=up.clone().addScaledVector(new V3().subVectors(lo,up).normalize(),(S.strutTop[1]-S.springTopY));   // the top seat hangs a fixed distance under the top mount (body side)
    segTo(L.spring,new V3().lerpVectors(lo,up,S.springLow),sTop,yAxis,CO.n,.5);
    segTo(L.strut,lo,up,yAxis,DM.n,.5);
    if(front)segTo(L.rod,B([AX_F+RK.dx,RK.y,sd*RK.half+rackShift]),camP(V(sd<0?kL:kR),sd,true),zAxis,LK.n,.5);
    else{const hubC=camP(V([ax,WY,sd*(KZ+.8)]),sd,false);segTo(L.trail,B(S.trail),hubC,zAxis,LK.n,.5);segTo(L.rshaft,bodyPt(ax,WY,sd*4),hubC,zAxis,LK.n,.5);}   // rear half-shaft: diff output to the hub carrier
  }
  // RWD propshaft: gearbox output flange to the rear differential, spun at crank speed / gear / FINAL (SECONDARY final — the chain proof on it does
  // NOT remove the OPEN-4 flag; only a sourced final-drive table does).
  if(P.ds)for(const D of P.ds){const F=build.dsFrom||[ENG_X-8,CRANK_Y,0];segTo(D.g,new V3(F[0],F[1],F[2]),new V3(AX_R,14,0),zAxis,100,.5);D.m.rotation.z=-state.spin*phys.FINAL;}
  // Engine rock about the crank axis (x — LONGITUDINAL, the Z32 form), at the firing frequency shown in slow motion; pulleys at crank speed times the drawn pulley ratios.
  const shake=(state.rpm/6000)*.35+.1,fireHz=state.rpm/60*(P.cyl||6)/2;
  P.engGroup.rotation.x=(P.engTilt||0)+Math.sin(state.t*Math.PI*2*Math.min(fireHz*SHAKE_SLOW,12))*.0012*shake*60*((P.amp||1)/1);
  const crank=state.t*state.rpm/60*Math.PI*2*CRANK_SLOW;
  P.crankP.rotation.x=crank;P.altP.rotation.x=-crank*(6/3.5);P.fan.rotation.x=-crank*(6/5);   // fan PULLEY only — no fan blades modelled (mech fan OPEN-BAY, not assumed)
  if(P.swm)P.swm.visible=!state.swOff;   // pulled off its quick-release hub: the hub boss stays on the column
  P.swheel.rotation.z=state.sw||0;
  P.speedo.rotation.x=(-120+clamp(Math.abs(state.v)*3.6,0,250)/250*240)*D2R;P.tach.rotation.x=(-120+clamp(state.rpm,0,8000)/8000*240)*D2R;   // speedo 250 / tach 8000 display scales DESIGN (gauge faces unmeasured, OPEN-13)
  P.ped_gas.rotation.z=state.throttle*.2;P.ped_brake.rotation.z=state.brake*.24;P.ped_clutch.rotation.z=(state.shiftT>0?.42:0);   // hanging pedals swing forward, toward the firewall
  const g=state.gear,ss=shiftSS(cfg);   // short-throw: the lever moves less with every shift (SPEC-INTERIOR §2.4)
  P.shifter.rotation.z+=((g===1||g===3||g===5?-.12*ss:g===0?0:.12*ss)-P.shifter.rotation.z)*.2;
  P.shifter.rotation.x+=((g<=2?.1*ss:g<=4?0:-.1*ss)-P.shifter.rotation.x)*.2;
  const on=state.lights>0,haz=state.hazard>0,blink=(haz||state.signal)&&turnPhase();
  if(P.pods)for(const pd of P.pods)pd.visible=on;   // pop-ups iff lights on (AE86 pattern)
  for(const b of P.beams)b.intensity=on?1.6:0;
  matHeadGT.emissiveIntensity=on?.25:.02;   // FIX1 V-2: pod lenses only — .6 flooded the lens pattern white (AE86 flood lesson); .25 keeps the bezel/flutes readable with lights on. The shared matHead is never driven by this module
  matFrontAmb.emissiveIntensity=blink?1.5:0;   // front signals blink; NO tail emissive driving (OPEN-7: tail functions stay open, lamps render unlit)
  if(state.wipers){state.wipT=(state.wipT||0)+dt*2.2;}
  const ws=state.wipers?(.5-.5*Math.cos(state.wipT||0)):0;anim.wip+=(ws-anim.wip)*.4;
  if(P.wiperRig)P.wiperRig.update(anim.wip);   // front wipers only — no rear wiper
}

/* ---------- shop visuals ---------- */
function setEngine(eid,gid){
  for(const k of ['engMesh','gbMesh','accMesh']){const m=P[k];if(m){m.parent.remove(m);m.geometry.dispose();P[k]=null;}}
  for(const g of [P.crankP,P.altP,P.fan])while(g.children.length){const c=g.children[0];g.remove(c);if(c.geometry)c.geometry.dispose();}
  const ED0=byId('engine',eid)||byId('engine',SH.stock.engine),kit=byId('swapkit',cfg.swapkit||'none')||{id:'none'},
        ED=Object.assign({cyl:6,layout:'I'},ED0);   // layout:'I' EXPLICIT: the 3M is a straight-six; Z32's default layout:'V' would draw it as a V (the draft's critical note)
  const deg=PW.incline[eid]!==undefined?PW.incline[eid]:PW.inclineDefault,tl=deg*D2R,ct=Math.cos(tl),st=Math.sin(tl);
  const E=genEngineLong(ED,{tilt:tl}),GD=Object.assign({tunnel:250,ratios:[1,1,1,1,1]},byId('gearbox',gid)||{}),T=genGearboxLong(GD,E.pc);
  let top=-1e9;for(const [x,y,z] of E.grid.list()){const wy=PW.crankY+((y-E.pc)*ct-z*st)*.5;if(wy>top)top=wy;}
  const hu=hoodLow(PW.x,PW.x+E.Lc*.5,-E.Wc*.3,E.Wc*.3)-1,sy=Math.min(1,(hu-PW.crankY)/(top-PW.crankY));
  const Pt=E.pts,L2=p=>[p[0]*.5,(p[1]-E.pc)*.5*sy,p[2]*.5],W=p=>{const l=L2(p);return [PW.x+l[0],PW.crankY+l[1]*ct-l[2]*st,l[1]*st+l[2]*ct];};
  const eg=P.engGroup;eg.position.set(PW.x,PW.crankY,0);eg.rotation.set(tl,0,0);
  P.engMesh=mk(E.grid,matV,0,eg,.5);P.engMesh.position.set(0,-E.pc*.5*sy,0);P.engMesh.scale.y=.5*sy;
  P.gbMesh=mk(T.grid,matV,0,eg,.5);P.gbMesh.position.set(-.5,-E.pc*.5*sy,0);P.gbMesh.scale.y=.5*sy;
  P.engSy=sy;P.engTilt=tl;P.cyl=ED.cyl;P.amp={4:1.0,5:.8,6:.35,8:.6}[ED.cyl]||1;build.eng={E,T,sy};
  // Pulleys + belt in the belt plane (longitudinal: the belt plane is y-z, pulleys spin about x).
  const alt=[Pt.crank[0],Pt.alt[1],Pt.alt[2]];
  const acc=new Grid(Math.floor(E.Bl)-14,Math.ceil(E.Lc)+12,-10,Math.ceil(E.Hc)+4,-Math.ceil(E.Wc/2)-4,Math.ceil(E.Wc/2)+4);
  cylX(acc,alt[1],alt[2],1.4,Pt.alt[0]+1,Pt.crank[0],0x8d9298);
  const tan=(p,q,r1,r2)=>{const dy=q[1]-p[1],dz=q[2]-p[2],l=Math.hypot(dy,dz),ny=-dz/l,nz=dy/l;return [[p[1]+ny*r1,p[2]+nz*r1],[q[1]+ny*r2,q[2]+nz*r2]];};
  const Cc=[0,Pt.crank[1],Pt.crank[2]],Fp=[0,Pt.fan[1],Pt.fan[2]],Ap=[0,alt[1],alt[2]],bx=Pt.crank[0]+2;
  for(const [a,b,r1,r2] of [[Cc,Ap,6,3.5],[Ap,Fp,3.5,5],[Fp,Cc,5,6]]){const t=tan(a,b,r1,r2);segFill(acc,[bx,t[0][0],t[0][1]],[bx,t[1][0],t[1][1]],.55,0x131416);}
  P.accMesh=mk(acc,matV,0,eg,.5);P.accMesh.position.set(0,-E.pc*.5*sy,0);P.accMesh.scale.y=.5*sy;
  for(const [g,p,r] of [[P.crankP,Pt.crank,6],[P.altP,alt,3.5],[P.fan,Pt.fan,5]]){const l=L2(p);g.position.set(l[0],l[1],l[2]);const m=mk(genPulleyZ(r,r===6?0x41454b:0x50555c),matV,0,g,.5);m.rotation.y=Math.PI/2;}
  // Mounts (fixed DESIGN arms — no Occ routing in this lane; OPEN-BAY refines): block sides
  // down to rubber mounts on the front cross-member, plus the shifter rod.
  {const hz=new Grid(-100,100,3,30,-30,30),U=GT2000_RIG.under;
   if(Pt.mountL&&Pt.mountR)for(const sd of [-1,1]){const pad=[AX_F-3,U.subY+3.5,sd*11],topPt=W([Pt.mountL[0],Pt.mountL[1],Pt.mountL[2]+sd*1.5]);
     segFill(hz,topPt,pad,.9,0x3a3d42);box(hz,pad[0]-1.25,pad[0]+1.25,U.subY+2.5,U.subY+3,pad[2]-1.25,pad[2]+1.25,0x111214);}
   const gx=PW.x+((T.out?T.out[0]:0)+16)*.5;segFill(hz,[gx,PW.crankY+5,0],[cp.shifter.x,cp.shifter.y-.5,0],.55,0x5a5f66);box(hz,cp.shifter.x-.75,cp.shifter.x+.75,cp.shifter.y-1,cp.shifter.y,-.75,.75,0x2a2c30);
   if(P.mounts){P.mounts.geometry.dispose();P.mounts.geometry=bufGeo(geoData(hz,0,.05,0));}}
  // Hoses (fixed DESIGN routes — no Occ routing in this lane; OPEN-BAY refines): upper
  // radiator hose, lower radiator hose, intake boot to the air box. Withheld entirely if
  // the engine generator exposes no thermostat/water-inlet/throttle points (never drawn blind).
  if(Pt.thermo&&Pt.waterIn&&Pt.tb){const hz=new Grid(40,110,5,45,-30,30),hc=0x15161a,AB=BAY.airbox,rad=BAY.radX,pl=(pts,r,c)=>{for(let i=0;i<pts.length-1;i++)segFill(hz,pts[i],pts[i+1],r,c);};
   const th=W([Pt.thermo[0]+4,E.yH-1.5,Pt.thermo[2]]),wi=W(Pt.waterIn),tb=W(Pt.tb);build.nosTb=tb;
   pl([[rad-.6,24.5,-20.5],[rad-2,24.5,-20.5],[th[0]+1.5,24.5,th[2]-1],[th[0],th[1],th[2]]],.9,hc);
   pl([[rad-.6,16,20.5],[rad-2,16,20.5],[wi[0]+1.5,wi[1],wi[2]+.5],[wi[0],wi[1],wi[2]]],.9,hc);
   {const az=BAY.airZ||-1,zf=az*AB.z1;pl([[tb[0],tb[1],tb[2]-.6],[tb[0],tb[1]-2,tb[2]-3.5],[AB.x0+4,(AB.y0+AB.y1)/2,zf+2.2],[AB.x0+4,(AB.y0+AB.y1)/2,zf+.8]],.9,0x1c1d20);}
   if(P.hoses){P.hoses.geometry.dispose();P.hoses.geometry=bufGeo(geoData(hz,0,.05,0));}}
  ENG_X=PW.x;CRANK_Y=PW.crankY;ENG_Z=0;build.engX=ENG_X;
  if(T.out)build.dsFrom=[PW.x+(T.out[0]*.5-.5),PW.crankY+(T.out[1]-E.pc)*.5*sy,T.out[2]*.5];   // gearbox output flange (body frame) — the propshaft starts here, not inside the case
  if(Pt.manifolds&&Pt.manifolds.length){const m0=Pt.manifolds[0];build.downpipe=W(m0);}   // the longitudinal generator exposes manifolds, not a downpipe point
}
function setSeats(){
  (P.seatMeshes||[]).forEach(m=>{body.remove(m);m.geometry.dispose();});P.seatMeshes=[];
  const LOOKS={stock:{cush:0x2d2f34,bol:0x3a3d44,bolH:1.2,back:22,hw:9.5,head:'post'},comfort:{cush:0x4a4339,bol:0x564e43,bolH:.5,back:22,hw:9.5,head:'post'},sport:{cush:0x26282c,bol:0x3a3d44,bolH:2.0,back:22,hw:9.5,head:'post',slide:1},recliner:{cush:0x24262a,bol:0x30333a,bolH:1.2,back:22,hw:9.5,head:'post'},bucket:{cush:0x1b1c1f,bol:0x0f1012,bolH:2.5,back:30,hw:9,head:'none',bucket:true}};
  const sp=byId('seats',cfg.seats||'stock'),look=Object.assign({},LOOKS[cfg.seats]||{},sp&&sp.look||{});
  for(const sd of [-1,1]){if(sd===-cp.side&&cfg.removed&&cfg.removed.passengerSeat)continue;P.seatMeshes.push(mk(RG.seat(look,sd*cp.H.z),matV,0,body));}   // the passenger's seat comes out with its rails (Take weight off); NO rear bench — a 2-seater (the shop must not offer rear-seat removal: SHELLS.gt2000.removables.rearSeat is deleted)
  P.hiRef=build.r&&build.r.hi;   // v20: the body's 10 mm panels, for the Stage B-D helpers (nothing they place may float or overlap)
  stageBParts(cfg,body,P,cp,mk,matV);   // Stage B (SPEC-INTERIOR §1/§4/§6): the wall / plush parts for the rear and passenger areas, and the dash set — rebuilt with the seats
  stageCParts(cfg,body,P,cp,build.nosTb,mk,matV);
  stageDParts(cfg,body,P,cp,mk,matV);   // v20 Stage D: the drift handbrake and the mirror hanger, rebuilt with the seats   // Stage C (SPEC-INTERIOR §5): the nitrous bottle + bay hardware — rebuilt with the seats (the seats sig carries rearArea)
}
function setSteering(id){
  const d=byIdSafe('steering',id);
  swapGeo(P.swm,genSteeringWheel(d.dia,{}));
}
function setShifter(){const m=P.shifter&&P.shifter.children[0];if(m)swapGeo(m,genShifter(17,cfg));}   // Stage A (SPEC-INTERIOR §2): the fitted shifter's knob, swapped live
function setExhaust(id){const tip=gt2000TipMap(byIdSafe('exhaust',id).tip);swapGeo(P.exh,genExhaust(GT,tip,exhF()));if(P.exhTips)swapGeo(P.exhTips,gt2000Tips(tip,exhF()));}   // FIX2 V-7: stock->quad mapping fixed (catalog tip is 'single'); twin-centre bore reshaped round in gt2000Tips
function setSprings(id){
  const col={stock:0x16171a,hd:0x16171a,sport:0x2a6fd6,cup:0x16171a,coil:0xe0b52a,air:0x3a3c41}[id];   // stock springs BLACK (the AE86 M-2 lesson: real stock springs are black and hidden behind the wheelhouse wall — never red)
  const gF=coilGeo(true,col),gR=coilGeo(false,col);
  for(const L of P.links){L.spring.geometry=L.nm[0]==='F'?gF:gR;}
}
// No aero addons modelled for the GT2000 (no factory spoiler, no aftermarket wing mesh):
// selecting one changes aeroDrag but shows nothing — the Eclipse rear-wing limitation,
// extended here to all aero slots until a GT2000 aero part is modelled. Never a crash.
function setAero(c){}
function setWheels(){
  const w=cfg.wheel,ty=tyreFor(w.dia,w.width,w.tw,w.ar),br=byId('brakes',cfg.brakes);
  const tireG=bufGeo(geoData(buildTireP(ty.OD,ty.tw,w.dia,w.width),0,.03,0)),
        rimG=bufGeo(geoData(w.style==='gt2000-15'?gt2000Wheel(w.dia,w.width):buildRimP(w.style,w.dia,w.width,w.et,'plain',{exact:1}),0,.03,0)),
        rotFG=bufGeo(geoData(buildRotorP(br.rotor),0,.03,0)),calFG=bufGeo(geoData(buildCaliperP(br.rotor,calType(br),1,calCol(br)),0,.03,0)),
        rotRG=bufGeo(geoData(buildRotorP(br.rotorR||br.rotor),0,.03,0)),calRG=bufGeo(geoData(buildCaliperP(br.rotorR||br.rotor,calType(br,1),1,calCol(br,1)),0,.03,0));
  for(const k in wheels){const W=wheels[k],front=k[0]==='F',rotor=front?br.rotor:(br.rotorR||br.rotor),zc=((front?HUB_F:HUB_R)-(w.et||0))/20;
    W.tire.geometry=tireG;W.rim.geometry=rimG;W.rot.geometry=front?rotFG:rotRG;W.cal.geometry=front?calFG:calRG;
    const sp=(W.steer?cfg.spacerF:cfg.spacerR)||0;W.off.position.z=W.sd*(zc+sp/20-KZ);W.rot.position.z=((w.et||0)-sp)/20;W.cg.position.z=((w.et||0)-sp)/20;W.kn.geometry=bufGeo(geoData(gt2000Knuckle(W.sd,W.steer,rotor),0,.03,0));}   // the wheel's offset moves the wheel out from the fixed knuckle; et:null coerces to the centre plane (OPEN-5)
  WY=(ty.OD/2-15)/20;phys.WR_M=ty.OD/2000;   // hub height = loaded radius (15 mm static deflection); the body rides up with a taller tyre (post())
}
function applyRemoved(){const R=cfg.removed||{};
  if(P.bumperF){P.bumperF.visible=!R.bumperF;if(P.plateF)P.plateF.visible=!R.bumperF;}
  if(P.bumperR){P.bumperR.visible=!R.bumperR;if(P.plateR)P.plateR.visible=!R.bumperR;}
  (P.doorCards||[]).forEach(m=>m.visible=!R.doorCards);
  // With the bumper removed the crash bar behind it shows.
  for(const sg of [1,-1]){const key=sg>0?'crashF':'crashR',gone=sg>0?R.bumperF:R.bumperR;
    if(!P[key]&&gone){const C=GT2000_RIG.crash,hb=build.r.hi.body;let f=sg>0?-1e9:1e9;   // the body's outermost cell over the bar's face (10 mm cells), the bar's 20 mm cells start just beyond it
      for(const [i,j,k] of hb.list())if(j>=C.y0*2&&j<=C.y1*2&&Math.abs(k)<=C.half*2)f=sg>0?Math.max(f,i):Math.min(f,i);
      const face=sg>0?(f+.5)*.5:(f-.5)*.5;P[key]=mk(RG.crashBar(sg,sg>0?Math.round(face+.5):Math.round(face-.5)),matV,0,body);}   // the nearest 20 mm cell to the body's face: flush, or 5 mm into its skin where the grids sit a quarter cell apart
    if(P[key])P[key].visible=!!gone;}
}
const PRESETS=[
 ['Stock',c=>{}]   // no period-correct second preset: no second preset's parts were fixed before this splice, and inventing one would be guessing
];
return {
  id:'gt2000',title:'Toyota 2000GT',maxSteer:MAX_STEER,
  // Body roll and pitch stop where the travel runs out (CALCULATED from the model): the arch must stay 15 mm above the tyre (60 % of the gap to roll, 40 % to pitch at the axle 1165 mm out),
  // and the rear tub wall, moving out by its height times the roll angle, must stay 5 mm from the tyre's inner face. NOTE: the roll cap is tight because the DESIGN tub wall (560 mm)
  // sits only 7.5 mm inboard of the stock inner tyre face — OPEN-16/arch sweep refines both.
  bodyLimits:c=>{const w=c.wheel,ty=tyreFor(w.dia,w.width,w.tw,w.ar),zc=SH.hubFaceZ-(w.et||0)+Math.max(c.spacerF||0,c.spacerR||0),hub=WR*20+(c.drop||0),top=hub+ty.OD/2,A=GT2000_M.arch;
    const gv=Math.min(A.f.y+A.f.r,A.r.y+A.r.r)-top-15,gl=zc-ty.tw/2-GT2000_M.tubR.zIn*20-5,as=v=>Math.asin(Math.max(0,Math.min(1,v)));
    return {roll:Math.min(as(gv*.6/zc),as(gl/top),4*Math.PI/180),pitch:Math.min(as(gv*.4/1165),2.5*Math.PI/180)};},   // and never more than 4 deg roll / 2.5 deg pitch (DESIGN: a soft stock car at the grip limit)
  tagline:'Drive it. Park it. Modify it.',paints:PAINTS,stages,pre,post,presets:PRESETS,trunkLabel:'Trunk',coverLabel:undefined,   // no parcel shelf on the GT2000, so no fake Cover toggle (E30 coupe precedent)
  camOpens:{engine:{hood:1},interior:{doorR:1}},   // RHD: the driver's door is doorR, NOT doorL
  sigs:{wheels:c=>[c.wheel,c.brakes,c.spacerF,c.spacerR],engine:c=>[c.engine,c.swapkit,c.gearbox,c.exhaust],seats:c=>[c.seats,c.shifter,c.handbrake,c.mirrorHang,c.trunk,c.rearArea,c.passArea,c.dashPlush,!!(byId('frame',c.frame)||{}).deletesRearSeat,!!(c.removed&&c.removed.rearSeat),!!(c.removed&&c.removed.passengerSeat)],steering:c=>c.steering,shifter:c=>c.shifter,exhaust:c=>c.exhaust,aero:c=>[...AERO_SLOTS.map(s=>c[s]),c.frame,!!(c.removed&&c.removed.bumperF)],suspension:c=>c.suspension,removed:c=>c.removed||{}},
  cockpit:()=>({eye:cp.eye,look:[60,48]}),   // INTERIM (OPEN-13 measures the GT2000's own eye vector; look is EF-form INTERIM)
  sound:{cyl:6},
  camPresets:(psi,P2)=>({showroom:{az:psi+.9,el:.2,dist:300,ty:24,ox:0,oy:0,oz:0},front:{az:psi+P2,el:.12,dist:300,ty:24,ox:0,oy:0,oz:0},rear:{az:psi-P2+.35,el:.16,dist:300,ty:26,ox:-6,oy:0,oz:0},
    engine:{az:psi+P2+.35,el:.95,dist:180,ty:24,ox:55,oy:0,oz:0},wheels:{az:psi+.25,el:.1,dist:140,ty:15,ox:58,oz:34},interior:{az:psi-.5,el:.6,dist:180,ty:36,ox:-15,oy:0,oz:10},under:{az:psi+.7,el:.03,dist:230,ty:8,ox:0,oy:0,oz:0}}),
  apply:{wheels:()=>setWheels(),engine:()=>{setEngine(cfg.engine,cfg.gearbox);setExhaust(cfg.exhaust);},seats:()=>setSeats(),steering:()=>setSteering(cfg.steering),shifter:()=>setShifter(),exhaust:()=>setExhaust(cfg.exhaust),aero:()=>setAero(cfg),suspension:()=>setSprings(cfg.suspension),removed:applyRemoved},
  onLoaded:()=>{}
};
};
