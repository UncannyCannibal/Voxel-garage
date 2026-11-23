CAR_MODULES.ae86=function(G){
'use strict';
const {mkFrameSeals,THREE,scene,camera,carRoot,body,P,wheels,MIRRORS,state,anim,phys,keys,mk,paintable,mkGlass,mkPane,mkGlassSheet,SKIN,group,bufGeo,makeMirror,swapGeo,matPaint,matV,matGlass,matMirror,matMirrorPaint,matHead,matTailRed,matTailAmb,matTailWht,matFrontAmb,cfg,D2R,clamp,lerp,V3,Q,yAxis,zAxis,segTo,bodyM,bodyPt,build,$}=G;
const PAINTS=[['Panda two-tone',0xf2f2ee]];   // the ONLY closed colour (ledger minor 11: non-panda GT-APEX colours are OPEN from photos). Paint-path limit: the shell's setPaint tints ONE hex, so two-tone cannot live in PAINTS — the black lower band is baked into the body/door/bumper skins below the 520 mm break (DESIGN break at the moulding line); when a single colour is confirmed, the band must become paint-driven (body-builder change).
const AG=makeAE86(),RG=makeRig(AG,AE86_RIG),SU=AE86_RIG.susp;
const matGlassAE86=matGlass.clone();matGlassAE86.opacity=.42;
const matPaintAE86=matPaint.clone();matPaintAE86.specular.setHex(0x555555);matPaintAE86.shininess=90;
const matHeadAE86=matHead.clone();matHeadAE86.emissiveIntensity=.25;   // V-4: shared matHead eases to emissive 1.1 with the lights on, which washed the pod-lens pattern to uniform white (diagnosed from the live mesh colours) — this AE86-only clone keeps the pattern legible
const GLASS_TINT=[.48,.40,.32];   // RF-1: bronze-tinted glass (GT-APEX catalogue), darker than the steel-blue default
const {NOSE_X,REAR_X,AX_F,AX_R,WR,BELT,ROOF,DOOR_F,DOOR_R,halfW}=AG,cp=AE86_RIG.cp,DS=AE86_RIG.dash,CT=AE86_RIG.console,BAY=AE86_RIG.bay,SIDE=cp.side||1;
const SHAKE_SLOW=.2,CRANK_SLOW=.035,ACC={alt:6/3.5,fan:6/5};   // Z32's named accessory ratios (EF hard-coded them in post)           // display slow-motion factors (declared)
const HOOD_HINGE=AG.HOOD_HINGE,HATCH_HINGE=AG.HATCH_HINGE;
// knuckle: ball joints 110 mm inboard of the STOCK wheel's centre plane (they belong to the hub carrier, so a wheel's offset moves the wheel, not them); kingpin 10 mm outboard of the ball joints (DESIGN)
const REAR_DZ=-(1355-1345)/2/20;   // V: rear track 1345 vs front 1355 (dims.md): each rear wheel 5 mm further inboard
const SH=SHELLS.ae86,ZK=(SH.hubFaceZ-SH.stockET)/20-5,KZ=ZK,WB=AX_F-AX_R;   // the kingpin is the line through the front ball joints (vertical, 100 mm inboard of the stock wheel's centre plane)
// steering lock from the catalogue's 4.8 m minimum turning radius (outer front wheel): bicycle angle atan(WB/(sqrt(4800^2-2400^2)-track/2)) = 34.6 deg; each wheel steers to its own Ackermann angle
const MAX_STEER=Math.atan(2400/(Math.sqrt(4800*4800-2400*2400)-1355/2));
function ackermann(d){if(Math.abs(d)<1e-6)return [0,0];const Rr=WB/Math.tan(Math.abs(d)),inn=Math.atan(WB/(Rr-KZ)),out=Math.atan(WB/(Rr+KZ));return d>0?[inn,out]:[-out,-inn];}   // [left, right]; d>0 turns left, so the left wheel is the inner one
let CRANK_Y=AE86_RIG.power.crankY,ENG_X=AX_F+AE86_RIG.power.dx,OX=ENG_X-14;   // crank line; OX = the block's rear face (block 560 mm centred ~700 mm from the nose -> rear face 980 mm from the nose -> wx(980) = 51.5; a longer swap engine extends forward from OX)
// hood underside over the engine: the outer surface less the 20 mm skin and 8 mm clearance, lowest point over the engine's footprint (CALCULATED from the body)
const ae86HoodLow=(x0,x1,z0,z1)=>{let m=1e9;for(let x=x0;x<=x1;x+=.5)for(let z=z0;z<=z1;z+=.5)m=Math.min(m,AG.top(x,z)-1.4);return m;};   // hood underside over the engine: the outer surface less the 20 mm skin and 8 mm clearance, lowest point over the engine's footprint (CALCULATED from the body);
const turnPhase=()=>Math.floor(state.t*1.5)%2===0;
let WY=WR;   // WR = hub height of the stock 185/70R13 (loaded radius 280 mm, spec section 2b)
const stages=[];
function stage(label,fn){stages.push([label,fn]);}

stage('Shaping the body panels',()=>{
  PCA_R=PAINT_PCA_R;   // smooth paint (e30_core.js PAINT_PCA_R, owner Nov 13); was 0:   // averaged exposure normals (EF convention, carried over)
  matPaintAE86.color.copy(matPaint.color);   // V-1: the clone is built at module construction, BEFORE switchCar's buildPaints()->setPaint updates shared matPaint to the selected paint — sync here (stage 1 runs after buildPaints) so the clone follows the selected paint; never hard-code a colour here
  SKIN.mode='voxel';   // voxel panels (EF convention); glass, seals, wipers and mirrors are new
  const r=buildAE86Body(AG);build.r=r;build.AG=AG;const H=r.hi;
  build.lamps=ae86Lamps(AG,H);                     // lenses are the panel skin, moved out of the body before its mesh is made
  build.pop=ae86PopUps(AG,H,build.lamps);                       // v20: pop-up lids out of the panels, their swept pockets carved, before the meshes are made
  const GL_=Object.values(H.glass),SM={body:[H.hood,H.trunk,H.doorL,H.doorR,...GL_],hood:[H.body,H.doorL,H.doorR,...GL_],trunk:[H.body,...GL_],doorL:[H.body,H.hood,H.trunk,H.doorR,...GL_],doorR:[H.body,H.hood,H.trunk,H.doorL,...GL_]};
  // windshield and hatch panes first: the panels round them are cut back to their straightened outlines before the panels are drawn (glass_trim.js)
  // voxel panels (the EF's look): the glass is a sheet on the measured surface over exactly its own cells' columns, i.e. the openings in the panels, which keep
  // their one-cell rubber ring round it and are not cut (a straight-edged pane over 10 mm stairs stood off the pillars); the pane frames carry the wipers
  const gpWS=glassPane(H.glass.ws,{bodies:[H.body,H.hood],rLo:1.5,rHi:4,surf:AG.solidAt,lift:.1}),gpRW=glassPane(H.glass.rw,{bodies:[H.trunk],rLo:1.5,rHi:4,surf:AG.solidAt,lift:.1});
  P.bodyMesh=paintable(H.body,body,matPaintAE86,.5,{o:SM.body,wy:[.45,.8],snap:AG.solidAt});   // snap: the skin is drawn ON the measured surface (surfnet.js)
  const hh=group(body,HOOD_HINGE[0],HOOD_HINGE[1],0),hm=paintable(H.hood,hh,matPaintAE86,.5,{o:SM.hood,snap:AG.solidAt});hm.position.set(-HOOD_HINGE[0],-HOOD_HINGE[1],0);P.hood=hh;
  const th=group(body,HATCH_HINGE[0],HATCH_HINGE[1],0),tm=paintable(H.trunk,th,matPaintAE86,.5,{o:SM.trunk,snap:AG.solidAt});tm.position.set(-HATCH_HINGE[0],-HATCH_HINGE[1],0);P.trunk=th;
  // hatch glass: the voxel-mode sheet over its own cells in the hatch, inside the hatch's rubber ring (glass_trim.js glassSheet), riding on the hatch; its wiper below it
  {const m=mkGlassSheet(H.glass.rw,th,.5,AG.solidAt,undefined,undefined,GLASS_TINT,matGlassAE86);P.paneRW={pane:m,gp:gpRW,meshes:[m]};if(m)m.position.set(-HATCH_HINGE[0],-HATCH_HINGE[1],0);}
  // doors hinge on the outermost door skin at the front edge (so nothing sweeps forward into the fender)
  let zOut=0;for(const D of [H.doorL,H.doorR])for(const [i,j,k] of D.list())if(i/2>=DOOR_F-1.5)zOut=Math.max(zOut,Math.abs(k)/2);
  build.doorHingeZ=zOut;
  const doorMesh={};for(const sd of [-1,1]){
    const hz=sd*zOut,dg=group(body,DOOR_F,0,hz),DG=sd<0?H.doorL:H.doorR,dm=paintable(DG,dg,matPaintAE86,.5,{snap:AG.solidAt});dm.position.set(-DOOR_F,0,-hz);doorMesh[sd<0?'L':'R']=dm;
    // door glass: winding it down slides the pane down along its own curved surface, 0..400 mm in 11 steps; the part inside the door runs in the door's cavity and is not drawn
    const GS=glassSteps(sd<0?H.glass.dgL:H.glass.dgR,sd).map((G,i)=>{const m=mkGlass(G,'side',dg,.5,GLASS_TINT,matGlassAE86);if(m){m.position.set(-DOOR_F,0,-hz);m.visible=i===0;}return m;});
    P['door'+(sd<0?'L':'R')]=dg;P['dglass'+(sd<0?'L':'R')]=GS;
    const mr=ae86Mirror(AG,sd);
    let mSelf;{const ms=paintable(mr.shell,dg,matPaintAE86,.5,{seat:AG.solidAt});ms.position.set(-DOOR_F,0,-hz);const mg=mk(mr.glass,matMirror,0,dg,.5);if(mg)mg.position.set(-DOOR_F,0,-hz);mSelf=[ms,mg].filter(Boolean);}
    MIRRORS.push(makeMirror(dg,new THREE.Vector3(mr.glassCenter[0]-DOOR_F,mr.glassCenter[1],mr.glassCenter[2]-hz),mr.glassSize[0],mr.glassSize[1],'door'+(sd<0?'L':'R'),-sd*(sd===cp.side?12:14)*D2R,mSelf));   // adjusted toward the driver: 12 degrees on his side, 14 on the far side (a sliver of the flank on the inboard edge)
    const dc=mk(genDoorCard(sd,sd<0?H.doorL:H.doorR,{x0:DOOR_R+2,x1:DOOR_F-2.5,y0:AE86_RIG.doorCard.y0,y1:BELT-1.2,trim:0x575b63,hi:1,xMin:y=>AG.doorRear(y)+1.5}),matV,0,dg,.5);if(dc){dc.position.set(-DOOR_F,0,-hz);(P.doorCards=P.doorCards||[]).push(dc);}
    // door handle: black pull at the rear of the door, just under the belt (DESIGN: near the rear of the door, just under the belt 873 mm)
    const hx=AG.wx(2470),hy=AG.u(780),hs=AG.halfAt(hx,hy),hd=mk(buildHandle(),matV,0,dg);hd.position.set(hx-DOOR_F,hy,sd*(hs+.1)-hz);hd.rotation.y=sd>0?-Math.PI/2:Math.PI/2;if(sd<0)hd.position.x=hx-3.5-DOOR_F;
  }
  P.frameSeals=mkFrameSeals([{g:H.body,grp:P.bodyMesh},{g:H.doorL,grp:doorMesh.L},{g:H.doorR,grp:doorMesh.R},{g:H.trunk,grp:tm},{g:H.hood,grp:hm}],Object.values(H.glass),{fenceGlass:[H.glass.ws]});   // smooth rubber lines on the window frames (frame_seal.js, owner Nov 13)
  const g=H.glass;{const m=mkGlassSheet(g.ws,body,.5,AG.solidAt,undefined,undefined,GLASS_TINT,matGlassAE86);P.paneWS={pane:m,gp:gpWS,meshes:[m]};}P.glassWS=P.paneWS.pane;P.glassQL=mkGlass(g.qgL,'side',body,.5,GLASS_TINT,matGlassAE86);P.glassQR=mkGlass(g.qgR,'side',body,.5,GLASS_TINT,matGlassAE86);
});

stage('Fitting bumpers, lamps and trim',()=>{
  const bf=ae86Bumper(AG,true),bb=ae86Bumper(AG,false);build.bf=bf;build.bb=bb;
  P.bumperF=paintable(bf.grid,body,matPaintAE86,.5,{seat:AG.solidAt});P.bumperR=paintable(bb.grid,body,matPaintAE86,.5,{seat:AG.solidAt});
  const MATS={frame:matV,head:matHead,famb:matFrontAmb,red:matTailRed,amb:matTailAmb,wht:matTailWht,garnish:matV};
  const add=(lamps,parent,off)=>{for(const k in lamps){const m=mk(lamps[k],MATS[k]||matV,0,parent,.5);if(m){if(off)m.position.set(...off);(P['lamp_'+k]=P['lamp_'+k]||[]).push(m);}}};
  const L=build.lamps,onHatch={garnish:L.garnish},onBody={};for(const k in L)if(k!=='garnish')onBody[k]=L[k];
  add(onBody,body);add(onHatch,P.trunk,[-HATCH_HINGE[0],-HATCH_HINGE[1],0]);
  P.badges=[];for(const B of ae86Badges(build.r.hi,L,AG.wx)){const parent=B.parent==='body'?body:P.trunk;const m=mk(B.grid,matV,0,parent,B.scale,.01);if(m){if(B.parent!=='body')m.position.set(-HATCH_HINGE[0],-HATCH_HINGE[1],0);P.badges.push(m);}}   // SPRINTER rides on the hatch garnish; TRUENO badges ride on the quarter panels
  for(const k in bf.lamps){const m=mk(bf.lamps[k],MATS[k]||matV,0,P.bumperF,1);if(m)(P['lamp_'+k]=P['lamp_'+k]||[]).push(m);}
  P.tailRed=P.lamp_red||[];P.tailAmb=P.lamp_amb||[];P.tailWht=P.lamp_wht||[];P.frontAmb=P.lamp_famb||[];P.head=P.lamp_head||[];
  // licence plates on the bumpers (plain white plates, JDM size 330 x 165 mm)
  const plate=(front,pl)=>{const w=Math.round(pl.w*2/2),h=Math.round(pl.h*2);const g=new Grid(front?0:-1,front?1:0,0,h,-w,w);g.fill((x,y,z)=>{const az=Math.abs(z);return (az>=w||y<=0||y>=h)?0x20262c:COL.white;});return g;};
  const plateX=(front,B)=>{const pl=B.plate,j0=Math.round((pl.y-pl.h/2)*2),j1=j0+Math.round(pl.h*2),w=Math.round(pl.w);let m=front?-1e9:1e9;
    for(const [i,j,k] of B.grid.list())if(j>=j0&&j<=j1&&Math.abs(k)<=w)m=front?Math.max(m,i):Math.min(m,i);return (front?m+1:m-1)*.5;};   // plate cell 0 one cell proud of the bumper
  const pf=mk(plate(true,bf.plate),matV,0,body,.5);pf.position.set(plateX(true,bf),bf.plate.y-bf.plate.h/2,0);P.plateF=pf;   // M-1: one extra cell (10 mm) proud of the bumper face plane, so the plate back can never sit coplanar with the bumper face
  {const pl=bb.plate;let m=1e9;const j0=Math.round((pl.y-pl.h/2)*2),j1=j0+Math.round(pl.h*2),w=Math.round(pl.w);const inBand=(i,j,k)=>j>=j0&&j<=j1&&Math.abs(k)<=w;for(const [i,j,k] of build.r.hi.trunk.list())if(inBand(i,j,k))m=Math.min(m,i);if(build.lamps.garnish)for(const [i,j,k] of build.lamps.garnish.list())if(inBand(i,j,k))m=Math.min(m,i);const pr=mk(plate(false,pl),matV,0,P.trunk,.5);pr.position.set((m===1e9?REAR_X:(m-1)*.5)-HATCH_HINGE[0],pl.y-pl.h/2-HATCH_HINGE[1],0);P.plateR=pr;}   // V-2: the rear plate rides on the HATCH (garnish recess, centre), not the bumper — tail surface is MINIMUM i (nose is +x), mirroring plateX(false); the old maximum-i scan buried it inside the car
  {const gl=build.lamps.garnish;let m=1e9;if(gl)for(const [i,j,k] of gl.list())if(j>=76&&j<=78&&Math.abs(k)<=3)m=Math.min(m,i);if(m!==1e9){const lg=new Grid(0,0,0,2,-3,3);lg.fill(()=>0xe8ecef);const lm=mk(lg,matV,0,P.trunk,.5);lm.position.set(m*.5-.5-HATCH_HINGE[0],38-HATCH_HINGE[1],0);P.plateLamp=lm;}}   // V-3: small clear lamp above the rear plate, on the garnish's REAR face — the old maximum-i scan put it on the forward face inside the hatch
});

stage('Mounting the engine bay',()=>{
  {const bg=RG.bay();ae86PopCarve(AG,bg);P.bay=mk(bg,matV,0,body);
   const L=build.pop.liner;if(L.length){let b=[1e9,-1e9,1e9,-1e9,1e9,-1e9];for(const [i,j,k] of L)b=[Math.min(b[0],i),Math.max(b[1],i),Math.min(b[2],j),Math.max(b[3],j),Math.min(b[4],k),Math.max(b[5],k)];
     const G=new Grid(...b);for(const [i,j,k] of L)if(bg.get(Math.round(i/2),Math.round(j/2),Math.round(k/2))<0)G.set(i,j,k,0x0d0e10);P.popLiner=mk(G,matV,0,body,.5);}}   // v20: the pop-up pockets' black walls   // v20: the pop-up pockets are cut out of the radiator support
  const eg=group(body,OX,CRANK_Y,0);P.engGroup=eg;P.engine=eg;
  P.crankP=group(eg,0,0,0);P.altP=group(eg,0,0,0);P.fan=group(eg,0,0,0);
  P.hoses=new THREE.Mesh(new THREE.BufferGeometry(),matV);P.hoses.scale.setScalar(.5);body.add(P.hoses);   // filled by setEngine (10 mm cells, Z32 pattern)
  P.mounts=new THREE.Mesh(new THREE.BufferGeometry(),matV);P.mounts.scale.setScalar(.5);body.add(P.mounts);   // filled by setEngine
  P.cbear=new THREE.Mesh(new THREE.BufferGeometry(),matV);P.cbear.scale.setScalar(.5);body.add(P.cbear);   // filled by setEngine
  setEngine(cfg.engine||SH.stock.engine,cfg.gearbox||SH.stock.gearbox);
  // under the body: subframe, cross-members, fuel tank under the rear seat (kept above the 150 mm ground clearance); exhaust
  P.under=mk(genUnder(Object.assign({fx0:AX_R+6,fx1:AX_F+AE86_RIG.under.fx1dx,rx:AX_R+8},AE86_RIG.under)),matV,0,body);
  // the sub-frames bolt to the body: posts from the rails up to the floor pan, the radiator support and the sills, each ending flush on what it bolts to (10 mm cells)
  {const U=AE86_RIG.under,top=U.subY+1.5,solid=solidOf([build.r.hi.body],[P.bay.geometry.userData.src]),posts=[];
   for(const s of [-1,1]){for(const [px,pz,hd] of (U.posts||[[U.railX0+.75,U.railZ],[U.railX1,U.railZ]]))posts.push({x:px,z:s*pz,y0:top,hd});   // U.posts: [x, |z|, half depth in cells] where the rails meet structure
     if(U.rearRails)posts.push({x:U.rearRails.x1-6,z:s*U.rearRails.z,y0:top},{x:U.rearRails.x0+6,z:s*U.rearRails.z,y0:top});   // between the lower arms' pivots
     for(const [tx,tz] of (U.trailBr||[]))posts.push({x:tx,z:s*(tz+1),y0:top});}
   P.underMounts=mk(genPosts(posts,solid,0x2a2c30),matV,0,body,.5);}
  {const tip=byIdSafe('exhaust',cfg.exhaust||'stock').tip;P.exh=mk(ae86Exhaust(tip),matV,0,body);P.exhTips=mk(genExhaustTips(tip,ae86ExhF()),matV,0,body,.5,.02);}
  // v20 pop-up units on their pivots (ae86PopUps): the lid (closed pose) turns with the group; the bucket and lens are built in the OPEN pose and
  // held at -rise inside the group, so they stand square when the group reaches rise. The bucket is drawn only while the unit is off its stop.
  {const PU=build.pop;P.pods=[];P.popG=[];
   for(const S of PU.sides){const G=group(body,PU.P.x,PU.P.y,0),lid=paintable(S.lid,G,matPaintAE86,.5);lid.position.set(-PU.P.x,-PU.P.y,0);
     const W=group(G,0,0,0);W.rotation.z=-PU.th;const hs=mk(S.house,matV,0,W,.5),ln=mk(S.lens,matHeadAE86,0,W,.5);for(const m of [hs,ln])if(m)m.position.set(-PU.P.x,-PU.P.y,0);
     W.visible=false;P.popG.push({G,W});P.pods.push(lid,...[hs,ln].filter(Boolean));}}
});

stage('Furnishing the cabin',()=>{
  P.interior=mk(RG.interior(),matV,0,body);
  const dd=mk(RG.dashDetail(),matV,0,body,.5,.03);dd.position.set(...RG.dashDetailPos);P.dashDetail=dd;
  const W0=cp.wheel,sw=group(body,W0.x,W0.y,W0.z);sw.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),new THREE.Vector3(...W0.n).normalize());
  {const im=buildInteriorMirror(build.r);const a=mk(im.shell,matV,0,body,.5),b=mk(im.glass,matMirror,0,body,.5);a.position.set(...im.pos);b.position.set(...im.pos);P.imirror=[a,b];P.visors=[];
   MIRRORS.push(makeMirror(body,new THREE.Vector3(...im.glassCenter),im.glassSize[0],im.glassSize[1],'interior',cp.side*9*D2R,[a,b]));   // tilted 9 degrees toward the driver
   for(const sd of [-1,1]){const v=buildVisor(build.r,sd),vm=mk(v.grid,matV,0,body,.5);vm.position.set(...v.pos);P.visors.push(vm);}}
  const swi=group(sw,0,0,0);P.swheel=swi;P.swm=mk(genSteeringWheel(380,{}),matV,0,swi,.5);P.swm.position.set(0,0,-.75);
  setSeats();
  // cargo bay: trims, load floor, lock-panel trim; the parcel shelf on its hinge behind the seat back; the hatch's two gas struts (ball studs on the body by the
  // tail lamps and on the hatch frame by the glass's top corners; DESIGN positions from photos)
  P.dTrim=mk(ae86DPillarTrim(AG,build.r.hi),matV,0,body,.5,.02,true);   // D-pillar trims inside the hatch opening (smooth-shaded moulded plastic)
  {const C=ae86Cargo(AG,build.r.hi,build.lamps.garnish);P.cargo=mk(C.fixed,matV,0,body,.5,.03);
   const sg=group(body,C.pivot[0],C.pivot[1],0),sm=mk(C.shelf,matV,0,sg,.5,.03);sm.position.set(-C.pivot[0],-C.pivot[1],0);P.shelf=sg;
   const cylG=bufGeo(geoData(genLink(28,1.15,0x1b1c1e),0,0,0)),rodG=bufGeo(geoData(genLink(28,.45,COL.chrome),0,0,0));
   P.struts=[];for(const sd of [-1,1]){const a=new THREE.Mesh(cylG,matV),b=new THREE.Mesh(rodG,matV);body.add(a);body.add(b);P.struts.push({nm:'S'+(sd<0?'L':'R'),cyl:a,rod:b,B0:new V3(-88,45.75,sd*20),H0:new V3(-72,59,sd*19)});}}   // lower ball stud 915 mm up, 400 mm out (inboard of the D-pillar trim), 1760 mm behind mid-wheelbase: above the cargo cover and ahead of the hatch glass's lower frame (v18: was 950 mm up under the new deck); upper on the hatch frame near its top corner: closed, the strut lies just inboard of the trim
  // gauges on the binnacle face (tachometer and speedometer, 80 mm dials) in front of the driver
  for(const [z,name,mark] of [[cp.H.z-4.5,'tach',7],[cp.H.z+4,'speedo',12]]){
    const f=mk(buildGaugeFace(4,mark),matV,0,body,.5);f.position.set(DS.rearX-1.5,DS.top+1.5,z);(P.gaugeFaces=P.gaugeFaces||[]).push(f);
    const nd=group(body,DS.rearX-1.7,DS.top+1.5,z);const nm=mk(buildNeedle(3.5),matV,0,nd,.5);nm.rotation.z=Math.PI/2;P[name]=nd;
  }
  cp.pedals.forEach(([n,z,w,h])=>{const pg=group(body,cp.pedalX,cp.pedalY,z);mk(genPedal(w,h,cp.pedalLen),matV,0,pg,.5);P['ped_'+n]=pg;});   // hanging pedals (pad sizes in ef_rig.js)
  {const zs=cp.pedals.map(p=>p[1]);P.pedalBox=mk(genPedalBox(cp.pedalX,cp.pedalY,Math.min(...zs)-3,Math.max(...zs)+3,solidOf([build.r.hi.body],[P.interior.geometry.userData.src,P.bay.geometry.userData.src])),matV,0,body,.5);}   // pivot shaft and its brackets to the dash / firewall
  const sh=group(body,cp.shifter.x,cp.shifter.y+.5,0);mk(genShifter(17,cfg),matV,0,sh,.5,.02);P.shifter=sh;
  // wipers: pivots on the cowl just under the glass's lower edge (as before: 380 mm left of the centreline and 60 mm right of it), parked toward the right; the
  // blades lie on the glass (glass_trim.js wiperRig). Rear wiper: its pivot on the hatch panel under the glass's lower edge at the centre, parked along that
  // edge toward the left, sweeping 150 degrees (DESIGN after photographs of the 3-door)
  P.wiperRig=wiperRig(P.paneWS.gp,body,[{pivot:-SIDE*38,park:5,arm:40,blade:46,sweep:70,dir:SIDE},{pivot:SIDE*6,park:3,arm:36,blade:40,sweep:64,dir:SIDE}],.5);P.wipers=[];P.wiperPivots=[];
  P.rearWiper=wiperRig(P.paneRW.gp,P.trunk,[{pivot:0,park:3.5,arm:30,blade:34,sweep:150,dir:-SIDE}],.5);P.rearWiper.group.position.set(-HATCH_HINGE[0],-HATCH_HINGE[1],0);
});

stage('Assembling wheels and suspension',()=>{
  const w0=cfg.wheel||{style:'ae86-13',dia:13,width:5.5,et:27};
  const ty0=tyreFor(w0.dia,w0.width,w0.tw,w0.ar);
  const tireG=bufGeo(geoData(buildTireP(ty0.OD,ty0.tw,w0.dia,w0.width),0,.03,0)),rimG=bufGeo(geoData(buildRimP(w0.style,w0.dia,w0.width,w0.et,'plain',{exact:1}),0,.03,0)),
        rotG=bufGeo(geoData(buildRotorP(260),0,.03,0)),calG=bufGeo(geoData(buildCaliperP(260,'stock',1),0,.03,0));   // stock brakes: 260 mm rotors (catalogue 'stock')
  P.rimMeshes=[];
  const zc0=(SH.hubFaceZ-w0.et)/20;
  const hub=(name,x,sd,steer)=>{   // c: on the kingpin (steers), off: out to the wheel's centre plane, fl: the wheel (mirrored on the left), sp: spins
    const c=group(carRoot,x,WR,sd*KZ),cb=group(c,0,-5.5,0),st=group(cb,0,5.5,0),off=group(st,0,0,sd*(zc0+((steer?cfg.spacerF:cfg.spacerR)||0)/20-KZ+(steer?0:REAR_DZ))),fl=group(off);if(sd<0)fl.rotation.y=Math.PI;
    const sp=group(fl);
    const tire=new THREE.Mesh(tireG,matV);tire.scale.setScalar(.5);sp.add(tire);
    const rim=new THREE.Mesh(rimG,matV);rim.scale.setScalar(.5);sp.add(rim);P.rimMeshes.push(rim);
    const rot=new THREE.Mesh(rotG,matV);rot.scale.setScalar(.5);sp.add(rot);
    const cg=group(fl);cg.rotation.z=sd<0?Math.PI:0;const cal=new THREE.Mesh(calG,matV);cal.scale.setScalar(.5);cg.add(cal);
    const kn=new THREE.Mesh(bufGeo(geoData(ae86Knuckle(sd,steer,260),0,.03,0)),matV);kn.scale.setScalar(.5);st.add(kn);   // the knuckle (upright) steers with the wheel; it does not spin
    kn.visible=!!steer;   // v17: a live axle has no rear knuckle: the hub bearing sits in the axle tube's end
    wheels[name]={c,cb,st,off,sp,sd,steer,tire,rim,rot,cal,cg,kn};   // cb: camber (knuckle and wheel turn about the lower ball joint, 110 mm under the hub)
  };
  hub('FL',AX_F,-1,true);hub('FR',AX_F,1,true);hub('RL',AX_R,-1,false);hub('RR',AX_R,1,false);
  // suspension links: MacPherson struts up front (the strut steers), a live axle at the rear (one rigid tube, 4 links, Panhard rod, no half-shafts, no rear steering)
  const LK=AE86_RIG.links,armG=bufGeo(geoData(genLink(LK.n,LK.arm,0x2b2e33),0,0,0)),rodG=bufGeo(geoData(genLink(LK.n,LK.rod,0x3a3d42),0,0,0)),
        DM=AE86_RIG.damper,CO=AE86_RIG.coil,strG=bufGeo(geoData(genDamper(DM.n,DM.bodyR,DM.rodR,DM.bodyFrac),0,0,0)),sprG=coilGeo(true),sprGR=coilGeo(false);
  P.links=[];
  const mkSeg=(geo,mat)=>{const m=new THREE.Mesh(geo,mat||matV);carRoot.add(m);return m;};
  for(const nm of ['FL','FR','RL','RR']){
    const L={nm,lowF:mkSeg(armG),strut:mkSeg(strG),spring:mkSeg(nm[0]==='F'?sprG:sprGR)};
    if(nm[0]==='F'){L.lowR=mkSeg(armG);L.rod=mkSeg(rodG);}else{L.upF=mkSeg(armG);}
    P.links.push(L);
  }
  // the live axle: one rigid tube + the final-drive pumpkin, in the axle's own frame (post() sets its height to WY)
  {const axG=new Grid(-4,4,-4,4,-68,68);
   for(let i=-4;i<=4;i++)for(let j=-4;j<=4;j++)for(let k=-65;k<=65;k++)if(Math.hypot(i,j)<=3.5)axG.set(i,j,k,0x3a3d42);   // v17: the tube ends at the axle-shaft flange, inboard of the rotor hat
   for(let i=-6;i<=6;i++)for(let j=-6;j<=6;j++)for(let k=-8;k<=8;k++)if(Math.hypot(i,j)<=6)axG.set(i,j,k,0x2b2e33);
   P.axle=mk(axG,matV,0,carRoot,.5);P.axle.position.set(AX_R,WR,0);}
  P.panhard=mkSeg(armG);
  P.rack=mk(RG.rack(),matV,0,body);P.rack.position.set(AX_F+SU.front.rack.dx,SU.front.rack.y,0);
  const sg=new THREE.Mesh(new THREE.PlaneGeometry(235,105),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.38,depthWrite:false}));
  sg.rotation.x=-Math.PI/2;sg.position.set(0,.25,0);carRoot.add(sg);
  for(const sd of [-1,1]){const sl=new THREE.SpotLight(0xfff0cf,0,1400,.5,.55,1);sl.position.set(build.pop.lens.x+.6,build.pop.lens.y,sd*build.pop.lens.z);carRoot.add(sl);const tg=new THREE.Object3D();tg.position.set(500,6,sd*build.pop.lens.z);carRoot.add(tg);sl.target=tg;(P.beams=P.beams||[]).push(sl);}   // beams at the raised pods' lens height
});

/* ---------- helpers ---------- */
function glassSteps(G,sd){const outer=new Map(),bottom=new Map(),K=(i,j)=>i+','+j;
  for(const [i,j,k] of G.list()){const a=Math.abs(k),key=K(i,j);if(!outer.has(key)||a>outer.get(key))outer.set(key,a);if(!bottom.has(i)||j<bottom.get(i))bottom.set(i,j);}
  const out=[];for(let s=0;s<=10;s++){const T=s*4,N=new Grid(G.x0,G.x1,G.y0,G.y1,G.z0,G.z1);
    for(const [i,j,k,v] of G.list()){const r=j-T;if(r<bottom.get(i))continue;const kn=outer.get(K(i,r));if(kn===undefined)continue;N.set(i,r,sd*(kn-(outer.get(K(i,j))-Math.abs(k))),v);}
    out.push(N);}
  return out;}
function byIdSafe(slot,id){return byId(slot,id)||byId(slot,'stock');}
// exhaust route (DESIGN): header at the firewall side of the engine, pipe in the floor tunnel, silencer under the rear floor on the right, tip under the right of the rear bumper (as on the photos)
// exhaust route (DESIGN inside OPEN-10): header at the engine, pipe in the floor tunnel, silencer under the rear floor on the car's right, tip under the right of the rear bumper.
// The tip side itself is UNRESOLVED from the side view (ledger OPEN-10/minor 12): routed to the right (rig side:1) as DESIGN, to be confirmed from a rear photo.
function ae86ExhF(){const X=AE86_RIG.exh,d=build.downpipe,F=Object.assign({},X,d?{x0:d[0],y0:d[1]-1.5,z0:d[2]}:{x0:OX+X.dx,z0:0},{tipX:AG.wx(X.tipMM)});
  // anchors for the Japanese tails: the silencer's outlet, the rear bumper's rearmost face and bottom edge, the spears outboard of the hatch (it swings between them),
  // the side exit ahead of the rear arch at the sill
  let rx=1e9;if(build.bb)for(const [i] of build.bb.grid.list())rx=Math.min(rx,i);rx=rx===1e9?AG.REAR_X:(rx-.5)/2;
  const zt=AG.u(AE86_M.hatch.sideHalf)+3.5;
  F.jdm={out:[F.mufX1,F.pipeY,F.side*F.mufZ],rearX:rx,botY:AE86D.bumperR.bot/20,tyZ:[-zt,zt],spears:{3:[[-zt,0],[zt,0],[zt,-3.5]],4:[[-zt,0],[-zt,-3.5],[zt,0],[zt,-3.5]]},topY:62.5,side:{from:[-38,F.pipeY,0],sg:1,y:7.4,z:AG.halfAt(-38,9.5)}};   // side exit ahead of the rear arch, its 50 mm pipe below the sill (bottom 180 mm)
  return F;}
function ae86Exhaust(tip){return genExhaust(AG,tip,ae86ExhF());}   // the exhaust bolts to the end of the engine's down pipe

// suspension pick-up points for a corner, body frame. Front: MacPherson (adapted field list only — no upper wishbone, no fork).
// Rear: live axle. Each rear link pair in the rig is [body pivot, axle pivot] as [dx from the axle, height at stock ride height, z];
// the axle pivot's height follows the tyre (WY + (y - WR)) because the axle is unsprung.
function ae86SuspPts(front,sd){const S=front?SU.front:SU.rear,ax=front?AX_F:AX_R,bp=a=>[ax+a[0],a[1],sd*a[2]];
  if(front)return {lowF:bp(S.lowF),lowR:bp(S.lowR),strutTop:bp(S.strutTop),
          lbj:[ax,WY+S.lbj[0],sd*(ZK+S.lbj[1])],strutLow:[ax+S.strutDx,WY+S.strutLy,sd*(ZK-S.strutLowDz)],springTopY:S.springTopY,springLow:S.springLow||.3,rodTo:S.rodTo};
  const ap=a=>[ax+a[0],WY+(a[1]-WR),sd*a[2]];
  return {lowF:bp(S.linkLow[0]),upF:bp(S.linkUp[0]),aLow:ap(S.linkLow[1]),aUp:ap(S.linkUp[1]),
          damperTop:bp(S.damperTop),aDamp:ap(S.springSeat),springTop:bp(S.damperTop),aSpring:ap(S.springSeat)};}
// a point on the front knuckle turned about the kingpin by the wheel's steer angle (same rotation as the wheel's st group)
// the knuckle in its steering frame (kingpin at hub height): hub-bearing housing out to the disc's inner face (45 mm inboard of the hub face), upright between the
// lower ball joint and the strut clamp (DESIGN: 360 mm above the hub — the strut, not a wishbone, carries the top), steering arm to the tie-rod end (front), caliper lug.
// The rear "knuckle" is only a hub carrier: a compact boss with a caliper lug, no steering arm, no ball joints.
function ae86Knuckle(sd,front,rotorMM){const hubIn=(SH.hubFaceZ-45)/20-KZ,S=front?SU.front:SU.rear;
  return genKnuckle(sd,{boss:[0,hubIn-.25,2.25],lbj:front?S.lbj[0]:-5.5,ubj:front?18:5.5,armZ:[-1,-.5],steer:front?[-5.5,-3.2,-.8]:null,cal:[-(.6*rotorMM/40)+.05,0,hubIn-.75],trail:null});}

const rotK=(p,sd,th)=>{if(!th)return p;const dx=p[0]-AX_F,dz=p[2]-sd*KZ;return [AX_F+dx*Math.cos(th)+dz*Math.sin(th),p[1],sd*KZ-dx*Math.sin(th)+dz*Math.cos(th)];};

/* ---------- per-frame animation ---------- */
function pre(dt){
  const ease=(k,tg,sp)=>{anim[k]+=(tg-anim[k])*Math.min(1,dt*sp);return anim[k];};
  P.doorL.rotation.y=-ease('doorL',state.doorL,6)*62*D2R;P.doorR.rotation.y=ease('doorR',state.doorR,6)*62*D2R;
  P.hood.rotation.z=ease('hood',state.hood,4)*58*D2R;P.trunk.rotation.z=-ease('trunk',state.trunk,4)*62*D2R;
  {const th=P.trunk.rotation.z,c=Math.cos(th),s=Math.sin(th),hx=HATCH_HINGE[0],hy=HATCH_HINGE[1];   // gas struts follow the hatch
   if(P.struts)for(const S of P.struts){const dx=S.H0.x-hx,dy=S.H0.y-hy,H=new V3(hx+dx*c-dy*s,hy+dx*s+dy*c,S.H0.z),d=new V3().subVectors(H,S.B0),L=d.length(),M=new V3().copy(S.B0).addScaledVector(d,Math.min(14,L-1.5)/L);
     segTo(S.cyl,S.B0,M,zAxis,28,.5);segTo(S.rod,M,H,zAxis,28,.5);}
   if(P.shelf)P.shelf.visible=!state.cover;}   // 'Cover' takes the cargo cover out (it cannot tilt far on its brackets: the quarter glass and the struts are over its edges)
  const wv=ease('win',state.win,5),ws=Math.round(wv*10);for(const k of ['dglassL','dglassR'])P[k].forEach((m,i)=>{if(m)m.visible=i===ws;});
}
const camberOf=front=>(front?(cfg.camberF||0):(cfg.camberR||0))*D2R;   // degrees in the build, negative = the top of the wheel leans in
function post(dt){
  const lift=WY-WR;if(lift){body.position.y+=lift;body.updateMatrix();bodyM.copy(body.matrix);}   // in the body frame the hub stays where the suspension holds it
  const [aL,aR]=ackermann(state.delta);
  for(const k in wheels){const w=wheels[k];w.c.position.y=WY;w.cb.rotation.x=w.sd*camberOf(w.steer);w.st.rotation.y=w.steer?(w.sd<0?aL:aR):0;w.sp.rotation.z=(w.sd<0?1:-1)*state.spin;}
  // camber: the upright turns about its lower ball joint; the steering arm moves with it
  const camP=(v,sd,front)=>{const c=sd*camberOf(front),py=WY-5.5,pz=sd*KZ,dy=v.y-py,dz=v.z-pz;v.y=py+dy*Math.cos(c)-dz*Math.sin(c);v.z=pz+dy*Math.sin(c)+dz*Math.cos(c);return v;};
  // steering arms on the knuckles (behind the axle) turn with their wheels; the rack moves by their mean lateral travel
  const RK=SU.front.rack,knk=sd=>[AX_F-5.5,WY-3.2,sd*(ZK-.8)],kL=rotK(knk(-1),-1,aL),kR=rotK(knk(1),1,aR),rackShift=((kL[2]-knk(-1)[2])+(kR[2]-knk(1)[2]))/2;
  P.rack.position.set(AX_F+RK.dx,RK.y,rackShift);   // the rack is fixed to the body (body frame)
  const LK=AE86_RIG.links,V=a=>new V3(a[0],a[1],a[2]),B=a=>bodyPt(a[0],a[1],a[2]);
  for(const L of P.links){
    const front=L.nm[0]==='F',sd=L.nm[1]==='R'?1:-1,ax=front?AX_F:AX_R,S=ae86SuspPts(front,sd),th=front?(sd<0?aL:aR):0,rk=p=>front?rotK(p,sd,th):p;
    if(front){
      const lbj=V(rk(S.lbj)),lp=B(S.lowR);
      segTo(L.lowR,lp,lbj,zAxis,LK.n,.5);segTo(L.lowF,B(S.lowF),S.rodTo?new V3().lerpVectors(lp,lbj,S.rodTo):lbj,zAxis,LK.n,.5);   // the front radius rod meets the lower link part-way out
      const lo=V(rk(S.strutLow)),up=B(S.strutTop);   // the MacPherson strut STEERS with the wheel (unlike a wishbone damper): its lower mount turns about the kingpin
      const DM=AE86_RIG.damper,CO=AE86_RIG.coil,sTop=up.clone().addScaledVector(new V3().subVectors(lo,up).normalize(),(S.strutTop[1]-S.springTopY));
      segTo(L.strut,lo,up,yAxis,DM.n,.5);
      // the lower spring seat is on the strut tube, a fixed distance above the strut's foot (it moves with the wheel; the spring is what shortens in bump and roll)
      const rest=Math.hypot(S.strutTop[0]-S.strutLow[0],S.strutTop[1]-S.strutLow[1],S.strutTop[2]-S.strutLow[2]);
      segTo(L.spring,lo.clone().addScaledVector(new V3().subVectors(up,lo).normalize(),rest*S.springLow),sTop,yAxis,CO.n,.5);
      segTo(L.rod,B([AX_F+RK.dx,RK.y,sd*RK.half+rackShift]),camP(V(sd<0?kL:kR),sd,true),zAxis,LK.n,.5);
    }else{
      // live axle: one bar per link, body pivot to axle pivot; damper + spring between the axle seat and the body mount
      segTo(L.lowF,B(S.lowF),V(S.aLow),zAxis,LK.n,.5);segTo(L.upF,B(S.upF),V(S.aUp),zAxis,LK.n,.5);
      const DM=AE86_RIG.damper,CO=AE86_RIG.coil;
      segTo(L.strut,V(S.aDamp),B(S.damperTop),yAxis,DM.n,.5);
      segTo(L.spring,V(S.aSpring),B(S.springTop),yAxis,CO.n,.5);
    }
  }
  // the axle tube rides at hub height; the Panhard rod ties the body to the axle across the car
  if(P.axle)P.axle.position.y=WY;
  if(P.panhard){const RS=SU.rear;segTo(P.panhard,B([AX_R-3,RS.panhardY,-19.5]),V([AX_R-1.5,WY+2,21]),zAxis,LK.n,.5);}   // v17: behind the tube, body end under the kick-up roof, axle end on a bracket on the tube; clear of the coils
  // driveshaft: one rotation per wheel rotation times the final drive (4.30 stock, from applyDrive)
  if(P.ds)for(const D of P.ds)D.m.rotation.z=-state.spin*phys.FINAL;
  // engine rock about the crank axis (x, longitudinal), at the firing frequency shown in slow motion; pulleys at crank speed times the drawn pulley ratios
  const shake=(state.rpm/6000)*.35+.1,fireHz=state.rpm/60*(P.cyl||4)/2;
  P.engGroup.rotation.x=Math.sin(state.t*Math.PI*2*Math.min(fireHz*SHAKE_SLOW,12))*.0012*shake*60*((P.amp||1)/1);
  const crank=state.t*state.rpm/60*Math.PI*2*CRANK_SLOW;
  P.crankP.rotation.x=crank;P.altP.rotation.x=-crank*ACC.alt;P.fan.rotation.x=-crank*ACC.fan;   // the fan is engine-driven (DESIGN: clutch fan assumed; see setEngine)
  // pop-up units: the motor runs them up with the lights and back down when they go off, at a steady speed (D.secs end to end), easing at the stops
  if(P.popG){const tg=state.lights>0?1:0,st=dt/AE86D.pod.secs;anim.pop=anim.pop||0;anim.pop=tg>anim.pop?Math.min(tg,anim.pop+st):Math.max(tg,anim.pop-st);
    const k=anim.pop,e=k*k*(3-2*k);for(const q of P.popG){q.G.rotation.z=e*build.pop.th;q.W.visible=k>0;}}
  if(P.swm)P.swm.visible=!state.swOff;   // pulled off its quick-release hub: the hub boss stays on the column
  P.swheel.rotation.z=state.sw||0;
  P.speedo.rotation.x=(-120+clamp(Math.abs(state.v)*3.6,0,240)/240*240)*D2R;P.tach.rotation.x=(-120+clamp(state.rpm,0,8000)/8000*240)*D2R;   // tacho display scale 8000 (DISPLAY scale, not the catalogue redline: 7600 is SECONDARY, OPEN-8)
  P.ped_gas.rotation.z=state.throttle*.2;P.ped_brake.rotation.z=state.brake*.24;P.ped_clutch.rotation.z=(state.shiftT>0?.42:0);   // hanging pedals swing forward, toward the firewall (pad travel about 65 mm throttle, 80 mm brake, 140 mm clutch)
  const g=state.gear,ss=shiftSS(cfg);   // short-throw: the lever moves less with every shift (SPEC-INTERIOR §2.4)
  P.shifter.rotation.z+=((g===1||g===3||g===5?-.12*ss:g===0?0:.12*ss)-P.shifter.rotation.z)*.2;
  P.shifter.rotation.x+=((g<=2?.1*ss:g<=4?0:-.1*ss)-P.shifter.rotation.x)*.2;
  const on=state.lights>0,haz=state.hazard>0,blink=(haz||state.signal)&&turnPhase(),braking=!!state.brakeLamp,reverse=state.gear===0;
  matHead.emissiveIntensity+=((on?1.1:0)-matHead.emissiveIntensity)*.3;
  for(const b of P.beams)b.intensity=on&&(anim.pop||0)>.97?1.6:0;   // v20: the beams light once the units are up
  matTailRed.emissiveIntensity=braking?1.4:(on?.55:.02);
  matTailAmb.emissiveIntensity=blink?1.5:0;matFrontAmb.emissiveIntensity=blink?1.5:0;matTailWht.emissiveIntensity=reverse?1.2:0;
  if(state.wipers){state.wipT=(state.wipT||0)+dt*2.2;}
  const ws=state.wipers?(.5-.5*Math.cos(state.wipT||0)):0;anim.wip+=(ws-anim.wip)*.4;
  if(P.wiperRig)P.wiperRig.update(anim.wip);if(P.rearWiper)P.rearWiper.update(anim.wip);
}

/* ---------- shop visuals ---------- */
function setEngine(eid,gid){
  for(const k of ['engMesh','gbMesh','accMesh']){const m=P[k];if(m){m.parent.remove(m);m.geometry.dispose();P[k]=null;}}
  for(const g of [P.crankP,P.altP,P.fan])while(g.children.length){const c=g.children[0];g.remove(c);if(c.geometry)c.geometry.dispose();}
  const ED0=byId('engine',eid)||byId('engine',SH.stock.engine),kit=byId('swapkit',cfg.swapkit||'none')||{id:'none'},own=SH.mountPatterns.includes(ED0.mount),
        rel=(own&&kit.id==='none')?{}:(kit.relief||{}),ED=Object.assign({cyl:4,layout:'I'},ED0,{pan:Math.max(110,(ED0.pan||170)-(rel.pan||0))});
  if(ED0.orient==='trans')ED.layout='I';
  const Bl=Math.round(ED.len/10-6),RK=SU.front.rack,
        shallowMax=Math.max(5,Math.floor((CRANK_Y-(RK.y+1.5)-.5)*2)),
        E=genEngineLong(ED,{tilt:0,sump:[2,Math.max(8,Bl-6)],shallowMax,manX:[.24,.5],mountX:Math.min(Bl-4,(AX_F-3-OX)*2)}),   // LOGGED (M-07, VERIFIED): the real 4A-GE is exhaust-LEFT, intake-right, thermostat on the exhaust side; this generic inline is exhaust-right. opts.mirrorZ exists, but the hoses, air box and battery must be re-laid with it — next AE86 step
        GD=Object.assign({tunnel:330,ratios:[1,1,1,1,1]},byId('gearbox',gid)||{}),T=genGearboxLong(GD,E.pc);
  let top=-1e9;for(const [x,y,z] of E.grid.list()){const wy=CRANK_Y+(y-E.pc)*.5;if(wy>top)top=wy;}
  // v20: the engine is drawn full size unless a cell would actually reach the hood's underside above it (skin 20 + 8 mm clearance), checked cell by cell;
  // the old test took the lowest hood point over the front half against the engine's highest cell anywhere, and squashed a 4A-GE that fits
  let sy=1;for(const [x,y,z] of E.grid.list()){const wy=(y-E.pc)*.5;if(wy<=0)continue;const hu=AG.top(OX+x*.5,z*.5)-1.4;sy=Math.min(sy,(hu-CRANK_Y)/wy);}
  const Pt=E.pts,L2=p=>[p[0]*.5,(p[1]-E.pc)*.5*sy,p[2]*.5],W=p=>{const l=L2(p);return [OX+l[0],CRANK_Y+l[1],l[2]];};   // engine cell -> group frame, -> body frame (rear face fixed at OX; a longer engine extends forward)
  const eg=P.engGroup;eg.position.set(OX,CRANK_Y,0);eg.rotation.set(0,0,0);
  P.engMesh=mk(E.grid,matV,0,eg,.5);P.engMesh.position.set(0,-E.pc*.5*sy,0);P.engMesh.scale.y=.5*sy;
  P.gbMesh=mk(T.grid,matV,0,eg,.5);P.gbMesh.position.set(-.5,-E.pc*.5*sy,0);P.gbMesh.scale.y=.5*sy;
  P.engSy=sy;P.cyl=ED.cyl;P.amp={4:1.0,5:.8,6:.35,8:.6}[ED.cyl]||1;build.eng={E,T,sy};
  // pulleys in the belt plane, the belt; the fan on the water pump (DESIGN: engine-driven clutch fan assumed for the 4A-GE)
  const xb=Pt.crank[0],alt=[xb,Pt.alt[1],Pt.alt[2]];
  const acc=new Grid(Math.floor(E.Bl)-14,Math.ceil(E.Lc)+12,-10,Math.ceil(E.Hc)+4,-Math.ceil(E.Wc/2)-4,Math.ceil(E.Wc/2)+4);
  cylX(acc,alt[1],alt[2],1.4,Pt.alt[0]+1,xb,0x8d9298);
  const tan=(p,q,r1,r2)=>{const dy=q[1]-p[1],dz=q[2]-p[2],l=Math.hypot(dy,dz),ny=-dz/l,nz=dy/l;return [[p[1]+ny*r1,p[2]+nz*r1],[q[1]+ny*r2,q[2]+nz*r2]];};
  const Cc=[0,Pt.crank[1],Pt.crank[2]],Fp=[0,Pt.fan[1],Pt.fan[2]],Ap=[0,alt[1],alt[2]],bx=xb+2;
  for(const [a,b,r1,r2] of [[Cc,Ap,6,3.5],[Ap,Fp,3.5,5],[Fp,Cc,5,6]]){const t=tan(a,b,r1,r2);segFill(acc,[bx,t[0][0],t[0][1]],[bx,t[1][0],t[1][1]],.55,0x131416);}
  P.accMesh=mk(acc,matV,0,eg,.5);P.accMesh.position.set(0,-E.pc*.5*sy,0);P.accMesh.scale.y=.5*sy;
  for(const [g,p,r] of [[P.crankP,Pt.crank,6],[P.altP,alt,3.5],[P.fan,Pt.fan,5]]){const l=L2(p);g.position.set(l[0],l[1],l[2]);const m=mk(genPulleyZ(r,r===6?0x41454b:0x50555c),matV,0,g,.5);m.rotation.y=Math.PI/2;}
  {const cl=new Grid(0,4,-4,4,-4,4);cl.fill((x,y,z)=>Math.hypot(y,z)<=3.5?(x===4?0x8d9298:0x5c6168):-1);const c=mk(cl,matV,0,P.fan,.5);c.position.x=2;const fw=W([Pt.fan[0],Pt.fan[1],Pt.fan[2]]);let hu=1e9;for(let dx=0;dx<=3;dx+=.5)for(let dz=-9.5;dz<=9.5;dz+=.5)hu=Math.min(hu,AG.top(fw[0]+dx,fw[2]+dz)-1.4);
   const tip=Math.min(18.5,Math.floor(((hu-fw[1])*2)*2)/2);P.fanTip=tip;const f=mk(buildFan(tip),matV,0,P.fan,.5);f.position.x=4;}   // v20: the blades as big as the hood above allows, at most the 370 mm fan (the stock fan's size is NOT FOUND)
  // engine arms from the block's sides down to rubber mounts on the front cross-member (10 mm cells, body frame)
  {const U=AE86_RIG.under,mg=new Grid(Math.floor((OX-2)*2),Math.ceil((AX_F+2)*2),10,Math.ceil((CRANK_Y+8)*2),-30,30),padY=U.subY+3.5;
   for(const [p,sd] of [[Pt.mountL,-1],[Pt.mountR,1]]){const m=W(p),pad=[AX_F-3,padY,sd*11];
     segFill(mg,[m[0]*2,m[1]*2,m[2]*2],[pad[0]*2,pad[1]*2,pad[2]*2],2,0x3a3d42);
     for(let i=Math.round((pad[0]-1.25)*2);i<=Math.round((pad[0]+1.25)*2);i++)for(let j=Math.round((U.subY+2.5)*2);j<=Math.round((U.subY+3)*2);j++)for(let k=Math.round((pad[2]-1.25)*2);k<=Math.round((pad[2]+1.25)*2);k++)mg.set(i,j,k,0x111214);}
   P.mounts.geometry.dispose();P.mounts.geometry=bufGeo(geoData(mg,0,.05,0));}
  // exhaust front pipes: from each manifold flange down to the collector behind the gearbox (the collector is where the tunnel run starts)
  {const X=AE86_RIG.exh,collX=OX+T.out[0]*.5+2,py=X.pipeY,zr=X.zRun;
   build.frontPipes=Pt.manifolds.map(m=>{const f=W(m),sg=Math.sign(f[2])||1;
     return [f,[f[0]-1,f[1]-3,f[2]],[OX-2,py+2,sg*9.5],[collX+2,py,sg*7.5],[collX,py,zr]];});
   build.downpipe=[collX,py,zr];}
  // hoses: upper radiator hose from the thermostat forward over the pulleys to the radiator's left tank, lower from the water inlet to the right tank,
  // intake boot from the throttle body to the air box (DESIGN routes: simple polylines, no clearance routing — the bay is open and the runs are short)
  {const BAY=AE86_RIG.bay,hg=new Grid(Math.floor((OX-2)*2),Math.ceil((BAY.radX+2)*2),10,Math.ceil((BAY.top+4)*2),-54,54),
         rx=BAY.radX-1.5,T1=[rx,24.5,-20.5],T2=[rx,16,20.5],AB=BAY.airbox||{x0:BAY.radX-14,x1:BAY.radX-5,y0:19,y1:BAY.top-3,z0:15,z1:25},
         ABc=[(AB.x0+AB.x1)/2,(AB.y0+AB.y1)/2,(AB.z0+AB.z1)/2],hi=p=>p.map(v=>v*2);
   const th=W(Pt.thermo),wi=W(Pt.waterIn),tb=W(Pt.tb);build.nosTb=tb;build.hosePts={th,wi,tb};
   // v17: routes laid out against the measured bay (probe maps at 460-700 mm): the old runs went through the cam covers, the belt and the fan, and the lower hose
   // detoured back to where the rack used to be. Each hose now leaves its spigot, clears the engine, the belt and the fan, and enters its tank or the air box.
   const run=(pts,r,c)=>{for(let i=0;i<pts.length-1;i++)segFill(hg,hi(pts[i]),hi(pts[i+1]),r,c);};
   run([th,[th[0],31,th[2]],[76.5,31,th[2]],[76.5,31,-12],[85,30,-13.5],T1],1.5,0x15161a);   // upper: up off the thermostat, forward to the belt's plane, left between the cam cover and the air box, forward past the fan's edge to the left tank
   run([wi,[wi[0],wi[1],13],[wi[0],22.5,13],[85,22.5,13],[87.5,18,20.5],T2],1.5,0x15161a);    // lower: out of the water inlet past the block's right flank, up, forward over the battery and the alternator, down to the right tank
   run([tb,[tb[0]+2.5,tb[1],tb[2]],[80,tb[1],-16.5],[80,31,-16.5],[78.5,31,-16.5]],3,0x1c1d20);   // intake boot: forward off the throttle body, left, up, back into the air box's front face
   P.hoses.geometry.dispose();P.hoses.geometry=bufGeo(geoData(hg,0,.05,0));}
  // driveshaft: the front half from the gearbox's output flange to the centre bearing, the rear half to the final drive's input flange
  {const o=[OX+T.out[0]*.5-.75,CRANK_Y,0],d=[AX_R+8.5,WR-1.25,0],cbx=(o[0]+d[0])/2,cb=[cbx,o[1]+(d[1]-o[1])*(o[0]-cbx)/(o[0]-d[0]),0];
   if(P.ds){segTo(P.ds[0].g,new V3(...o),new V3(...cb),zAxis,70,.5);segTo(P.ds[1].g,new V3(...cb),new V3(...d),zAxis,70,.5);}
   else{P.ds=[0,1].map(i=>{const g=group(body),m=mk(genShaftE30(70,i===0),matV,0,g);return {nm:i?'DSR':'DSF',g,m};});segTo(P.ds[0].g,new V3(...o),new V3(...cb),zAxis,70,.5);segTo(P.ds[1].g,new V3(...cb),new V3(...d),zAxis,70,.5);}
   // v17: the bearing as on the E30 (a ring the shaft runs through, not a solid block), its cradle legs inside the tunnel and the strap bolted under the tunnel roof (AE86_M.tunnel.top)
   const TT=AE86_M.tunnel.top/20+.25,h=HC();h.cyl('x',cb[1],0,2.6,cbx-1,cbx+1,0x15161a,1.65);h.box(cbx-.75,cbx+.75,TT-1,TT,-6,6,0x2a2c30);for(const s of [-1,1])h.box(cbx-.75,cbx+.75,cb[1]-.5,TT-1,s*5.5,s*6,0x2a2c30);
   P.cbear.geometry.dispose();P.cbear.geometry=bufGeo(geoData(h.grid(),0,.05,0));}
  if(P.exh)setExhaust(cfg.exhaust);
  setTurboKit(cfg,body,P,mk,matV,build.nosTb);   // v20: the turbo, the intercooler and the charge pipes (nothing when no kit is fitted)
}

function setSeats(){
  (P.seatMeshes||[]).forEach(m=>{body.remove(m);m.geometry.dispose();});P.seatMeshes=[];
  const LOOKS={stock:{cush:0x2d2f34,bol:0x3a3d44,bolH:1.2,back:22,hw:9.5,head:'post'},comfort:{cush:0x4a4339,bol:0x564e43,bolH:.5,back:22,hw:9.5,head:'post'},sport:{cush:0x26282c,bol:0x3a3d44,bolH:2.0,back:22,hw:9.5,head:'post',slide:1},recliner:{cush:0x24262a,bol:0x30333a,bolH:1.2,back:22,hw:9.5,head:'post'},bucket:{cush:0x1b1c1f,bol:0x0f1012,bolH:2.5,back:30,hw:9,head:'none',bucket:true}};
  const sp=byId('seats',cfg.seats||SH.stock.seats),look=Object.assign({},LOOKS[cfg.seats]||{},sp&&sp.look||{});
  const delRear=!!(byId('frame',cfg.frame||'stock')||{}).deletesRearSeat||!!(cfg.removed&&cfg.removed.rearSeat);
  for(const sd of [-1,1]){if(sd===-cp.side&&cfg.removed&&cfg.removed.passengerSeat)continue;P.seatMeshes.push(mk(RG.seat(look,sd*cp.H.z),matV,0,body));}   // the passenger's seat comes out with its rails (Take weight off)
  if(!delRear)P.seatMeshes.push(mk(RG.rearBench(build.r.body),matV,0,body));
  P.hiRef=build.r&&build.r.hi;   // v20: the body's 10 mm panels, for the Stage B-D helpers (nothing they place may float or overlap)
  stageBParts(cfg,body,P,cp,mk,matV);   // Stage B (SPEC-INTERIOR §1/§4/§6): the wall / plush parts for the rear and passenger areas, and the dash set — rebuilt with the seats
  stageCParts(cfg,body,P,cp,build.nosTb,mk,matV);
  stageDParts(cfg,body,P,cp,mk,matV);   // v20 Stage D: the drift handbrake and the mirror hanger, rebuilt with the seats   // Stage C (SPEC-INTERIOR §5): the nitrous bottle + bay hardware — rebuilt with the seats (the seats sig carries rearArea)
}
function setSteering(id){
  const d=byIdSafe('steering',id),look={};
  swapGeo(P.swm,genSteeringWheel(d.dia,look));
}
function setShifter(){const m=P.shifter&&P.shifter.children[0];if(m)swapGeo(m,genShifter(17,cfg));}   // Stage A (SPEC-INTERIOR §2): the fitted shifter's knob, swapped live
function setExhaust(id){const tip=byIdSafe('exhaust',id).tip;swapGeo(P.exh,ae86Exhaust(tip));if(P.exhTips)swapGeo(P.exhTips,genExhaustTips(tip,ae86ExhF()));}
// aero parts are built when first needed and kept hidden; parts on the hatch ride on it
const ADDON={
  frontlip:{p:'body',fn:()=>[ae86AeroFront(AG,build.bf.grid,'lip')]},
  splitter:{p:'body',fn:()=>[ae86AeroFront(AG,build.bf.grid,'splitter')]},
  hatchspoiler:{p:'hatch',fn:()=>[ae86AeroHatch(AG,build.r.hi.trunk,'spoiler',build.r.hi.glass.rw)]},
  gtwing:{p:'hatch',fn:()=>[ae86AeroHatch(AG,build.r.hi.trunk,'wing',build.r.hi.glass.rw)]},
  // bolt-on widebody flares: a 60 mm ring round each arch from its edge outward, 30 mm proud at the edge, blending into the panel (DESIGN, the fit rule's +30 mm)
  wide:{p:'body',fn:()=>[genFlares([build.r.hi.body,build.r.hi.doorL,build.r.hi.doorR],[build.bf.grid,build.bb.grid],{axles:[{x:AG.ARCH_F.x,y:AG.ARCH_F.y},{x:AG.ARCH_RR.x,y:AG.ARCH_RR.y}],R0:AG.ARCH_F.r+.3,band:3,out:1.5,jMin:21,col:PAINT,skip:(x,y)=>x<AG.DOOR_F+1.5&&x>AG.doorRear(Math.max(y,11))-1.5})]},
  // side skirts: 150-205 mm (30 mm under the 180 mm sill, under the doors' 221 mm bottom edge), between the arches
  skirts:{p:'body',fn:()=>[genSkirts([build.r.hi.body],{x0:AG.ARCH_RR.x+AG.ARCH_RR.r+.8,x1:AG.ARCH_F.x-AG.ARCH_F.r-.8,j0:15,j1:20,arches:[AG.ARCH_F,AG.ARCH_RR],col:PAINT,doors:[build.r.hi.doorL,build.r.hi.doorR]})]}
};
function lazyPart(name){
  if(P['part_'+name])return P['part_'+name];
  const A=ADDON[name],parent=A.p==='hatch'?P.trunk:body,grp=new THREE.Group();for(const b of A.fn())paintable(b,grp,undefined,.5,{seat:AG.solidAt});   // the EF's aero grids are 10 mm cells (mesh scale .5)
  if(A.p==='hatch')grp.position.set(-HATCH_HINGE[0],-HATCH_HINGE[1],0);parent.add(grp);
  P['part_'+name]=grp;grp.visible=false;return grp;
}
function setAero(c){   // the aero slots, any mix: front lip, rear spoiler or wing, flares, skirts
  for(const n in ADDON)if(P['part_'+n])P['part_'+n].visible=false;
  const offF=!!(c.removed&&c.removed.bumperF),show=[];
  for(const s of AERO_SLOTS){const id=c[s];if(!id||id==='none'||!ADDON[id])continue;if(s==='aeroF'&&offF)continue;show.push(id);lazyPart(id).visible=true;}
  if(P.spoiler)P.spoiler.visible=!(show.includes('hatchspoiler')||show.includes('gtwing'));   // the factory roof spoiler comes off for the aftermarket ones
}
// the coil with its seats: the lower seat on the damper body (front) or rod (rear: the seat stands above the body), the upper one round the rod at the top mount
function coilGeo(front,col){const CO=AE86_RIG.coil,DM=AE86_RIG.damper,S=front?SU.front:SU.rear,lowOnBody=(S.springLow||.3)<DM.bodyFrac;
  return bufGeo(geoData(genCoil(CO.n,CO.R,CO.w,CO.turns,col,[front&&lowOnBody?DM.bodyR+.3:(front?DM.rodR+.5:DM.bodyR+.3),DM.rodR+.5]),0,0,0));}   // the rear damper reaches down to the lower arm, so its body runs up past the seat: the rear lower seat clears it
function setSprings(id){
  const col={stock:0x16171a,hd:0xc4261f,sport:0x2a6fd6,cup:0x16171a,coil:0xe0b52a,air:0x3a3c41}[id];   // M-2: stock springs BLACK (real stock springs are black; the red read through the arch gap. Spring sits on the strut axis, inboard of the tyre face — position correct, colour was the defect)
  const gF=coilGeo(true,col),gR=coilGeo(false,col);
  for(const L of P.links){L.spring.geometry=L.nm[0]==='F'?gF:gR;}
}
function setWheels(){
  const w=cfg.wheel,ty=tyreFor(w.dia,w.width,w.tw,w.ar),zc=(SH.hubFaceZ-w.et)/20,br=byId('brakes',cfg.brakes);
  const tireG=bufGeo(geoData(buildTireP(ty.OD,ty.tw,w.dia,w.width),0,.03,0)),rimG=bufGeo(geoData(buildRimP(w.style,w.dia,w.width,w.et,'plain',{exact:1}),0,.03,0)),
        rotG=bufGeo(geoData(buildRotorP(br.rotor),0,.03,0)),calG=bufGeo(geoData(buildCaliperP(br.rotor,calType(br),1,calCol(br)),0,.03,0));
  for(const k in wheels){const W=wheels[k];W.tire.geometry=tireG;W.rim.geometry=rimG;W.rot.geometry=rotG;W.cal.geometry=calG;
    const sp=(W.steer?cfg.spacerF:cfg.spacerR)||0;W.off.position.z=W.sd*(zc+sp/20-KZ+(W.steer?0:REAR_DZ));W.rot.position.z=(w.et-sp)/20;W.cg.position.z=(w.et-sp)/20;W.kn.geometry=bufGeo(geoData(ae86Knuckle(W.sd,W.steer,br.rotor),0,.03,0));}   // the wheel's offset moves the wheel out from the fixed knuckle
  WY=(ty.OD/2-15)/20;phys.WR_M=ty.OD/2000;   // hub height = loaded radius (15 mm static deflection); the body rides up with a taller tyre (post())
}

const PRESETS=[
 ['Stock',c=>{}],
 ['GT-APEX + LSD + 14s',c=>{Object.assign(c,{diff:'lsd430',exhaust:'stock',seats:'stock',steering:'stock',suspension:'stock',drop:0,brakes:'stock'});c.wheel={style:'ae86-14',dia:14,width:5.5,et:27,pcd:'4x114.3',bore:60.1,tw:185,ar:60};}]
];

function applyRemoved(){const R=cfg.removed||{};
  if(P.bumperF){P.bumperF.visible=!R.bumperF;if(P.plateF)P.plateF.visible=!R.bumperF;}
  if(P.bumperR)P.bumperR.visible=!R.bumperR;   // the rear plate rides on the hatch, not the bumper, so it stays
  (P.doorCards||[]).forEach(m=>m.visible=!R.doorCards);
  // with the bumper removed the crash bar behind it shows
  for(const sg of [1,-1]){const key=sg>0?'crashF':'crashR',gone=sg>0?R.bumperF:R.bumperR;
    if(!P[key]&&gone){const C=AE86_RIG.crash,hb=build.r.hi.body;let f=sg>0?-1e9:1e9;   // the body's outermost cell over the bar's face (10 mm cells), the bar's 20 mm cells start just beyond it
      for(const [i,j,k] of hb.list())if(j>=C.y0*2&&j<=C.y1*2&&Math.abs(k)<=C.half*2)f=sg>0?Math.max(f,i):Math.min(f,i);
      const face=sg>0?(f+.5)*.5:(f-.5)*.5;P[key]=mk(RG.crashBar(sg,sg>0?Math.round(face+.5):Math.round(face-.5)),matV,0,body);}   // the nearest 20 mm cell to the body's face: flush, or 5 mm into its skin where the grids sit a quarter cell apart
    if(P[key])P[key].visible=!!gone;}
}
return {
  id:'ae86',title:'Toyota Sprinter Trueno AE86',maxSteer:MAX_STEER,
  // body roll and pitch stop where the travel runs out (CALCULATED from the model): the arch must stay 15 mm above the tyre (60 % of the gap to roll, 40 % to pitch at the axle 1200 mm out),
  // and the rear tub wall, moving out by its height times the roll angle, must stay 5 mm from the tyre's inner face
  bodyLimits:c=>{const w=c.wheel,ty=tyreFor(w.dia,w.width,w.tw,w.ar),zc=SH.hubFaceZ-w.et+Math.max(c.spacerF||0,c.spacerR||0),hub=WR*20+(c.drop||0),top=hub+ty.OD/2,A=AE86_M.arch;
    const gv=Math.min(A.f.y+A.f.r,A.r.y+A.r.r)-top-15,gl=zc+REAR_DZ*20-ty.tw/2-AE86_M.tubR.zIn-5,as=v=>Math.asin(Math.max(0,Math.min(1,v)));
    return {roll:Math.min(as(gv*.6/zc),as(gl/top),4*Math.PI/180),pitch:Math.min(as(gv*.4/1200),2.5*Math.PI/180)};},   // and never more than 4 deg roll / 2.5 deg pitch (DESIGN: a soft stock car at the grip limit)
  tagline:'Drive it. Park it. Modify it.',paints:PAINTS,stages,pre,post,presets:PRESETS,trunkLabel:'Hatch',coverLabel:'Cover out',
  camOpens:{engine:{hood:1},interior:{doorR:1}},
  sigs:{wheels:c=>[c.wheel,c.brakes,c.spacerF,c.spacerR],engine:c=>[c.engine,c.gearbox,c.exhaust,c.swapkit,c.turbo],seats:c=>[c.seats,c.shifter,c.handbrake,c.mirrorHang,c.trunk,c.rearArea,c.passArea,c.dashPlush,!!(byId('frame',c.frame)||{}).deletesRearSeat,!!(c.removed&&c.removed.rearSeat),!!(c.removed&&c.removed.passengerSeat)],steering:c=>c.steering,shifter:c=>c.shifter,exhaust:c=>c.exhaust,aero:c=>[...AERO_SLOTS.map(s=>c[s]),c.frame,!!(c.removed&&c.removed.bumperF)],suspension:c=>c.suspension,removed:c=>c.removed||{}},
  cockpit:()=>({eye:cp.eye,look:[60,48]}),
  sound:{cyl:4},
  camPresets:(psi,P2)=>({showroom:{az:psi+.9,el:.2,dist:300,ty:24,ox:0,oy:0,oz:0},front:{az:psi+P2,el:.12,dist:300,ty:24,ox:0,oy:0,oz:0},rear:{az:psi-P2+.35,el:.16,dist:300,ty:26,ox:-6,oy:0,oz:0},
    engine:{az:psi+P2+.35,el:.95,dist:180,ty:24,ox:62,oy:0,oz:0},wheels:{az:psi+.25,el:.1,dist:140,ty:15,ox:60,oz:34},interior:{az:psi-.5,el:.6,dist:180,ty:36,ox:-2,oy:0,oz:8},under:{az:psi+.7,el:.03,dist:230,ty:8,ox:0,oy:0,oz:0}}),
  apply:{wheels:()=>setWheels(),engine:()=>{setEngine(cfg.engine,cfg.gearbox);setExhaust(cfg.exhaust);},seats:()=>setSeats(),steering:()=>setSteering(cfg.steering),shifter:()=>setShifter(),exhaust:()=>setExhaust(cfg.exhaust),aero:()=>setAero(cfg),suspension:()=>setSprings(cfg.suspension),removed:applyRemoved},
  onLoaded:()=>{}
};
};
/* ECLIPSE MODULE — CAR_MODULES.eclipse (1999 GSX, 2Gb, LHD, 5MT, AWD).
   Adapted from the EF module shape (this copy's stage runner), NOT from
   AE86: transverse setEngine in the EF form (power {dx,crankY}), MacPherson
   front ADAPTED (no upF/upR/fork — the AE86 lesson), rear multi-link
   independent (NOT the AE86 live axle, NOT the EF rear wishbone verbatim).
   Fixed exposed lamps — NO pods, NO pop-up mechanism (the Eclipse's defining
   difference from the Trueno; a pod here is a build failure).
   The G destructure below is verbatim the shared G object (line 7143); any
   NEW shared object must be added to G AND here or boot throws. Everything
   else (SHELLS, LIB, byId, Grid, makeRig, genUnder, ...) is script-scope.
   All INTERIM/DESIGN values are labelled; OPEN items gate their stage. */
