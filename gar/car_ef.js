/* ===== CAR MODULE: Honda Civic EF9 SiR hatchback (JDM, right-hand drive). Body measured from the Honda catalogue drawing and photographs (ef_body.js, ef_detail.js, ref/ef/SOURCES.md);
   cabin, bay and running gear from the generic rig builders (rig_gen.js, rig_gen_ext.js) with the EF's own parameters (ef_rig.js). Collisions: ef_collision.js.
   World units: 1 unit = 20 mm; x forward, y up, z = the car's right; x = 0 is the middle of the wheelbase. ===== */
CAR_MODULES.ef=function(G){
'use strict';
const {mkFrameSeals,THREE,scene,camera,carRoot,body,P,wheels,MIRRORS,state,anim,phys,keys,mk,paintable,mkGlass,mkPane,mkGlassSheet,SKIN,group,bufGeo,makeMirror,swapGeo,matPaint,matV,matGlass,matMirror,matMirrorPaint,matHead,matTailRed,matTailAmb,matTailWht,matFrontAmb,cfg,D2R,clamp,lerp,V3,Q,yAxis,zAxis,segTo,bodyM,bodyPt,build,$}=G;
const PAINTS=[['Rio red',0xb3221e],['Granada black pearl',0x15171c,'metallic'],['Frost white',0xe4e4de],['Blade silver',0x9aa0a6,'metallic'],['Satin silver grey',0x7d8086,'metallic'],['Saxony blue',0x4a73a8,'metallic'],['Yellow',0xdcae2a]];   // [name, colour, finish]
const EG=makeEF(),RG=makeRig(EG,EF_RIG),SU=EF_RIG.susp;
const {NOSE_X,REAR_X,AX_F,AX_R,WR,BELT,ROOF,DOOR_F,DOOR_R,halfW}=EG,cp=EF_RIG.cp,DS=EF_RIG.dash,CT=EF_RIG.console,BAY=EF_RIG.bay,SIDE=cp.side||1;
const SHAKE_SLOW=.2,CRANK_SLOW=.035;           // display slow-motion factors (declared)
const HOOD_HINGE=EG.HOOD_HINGE,HATCH_HINGE=EG.HATCH_HINGE;
// knuckle: ball joints 110 mm inboard of the STOCK wheel's centre plane (they belong to the hub carrier, so a wheel's offset moves the wheel, not them); kingpin 10 mm outboard of the ball joints (DESIGN)
const SH=SHELLS.ef,ZK=(SH.hubFaceZ-SH.stockET)/20-5,KZ=ZK,WB=AX_F-AX_R;   // the kingpin is the line through the front ball joints (vertical, 100 mm inboard of the stock wheel's centre plane)
// steering lock from the catalogue's 5.1 m minimum turning radius (outer front wheel, VERIFIED 221616.com): bicycle angle atan(WB/(sqrt(5100^2-2500^2)-track/2)) = 33.9 deg; each wheel steers to its own Ackermann angle
const MAX_STEER=Math.atan(2500/(Math.sqrt(5100*5100-2500*2500)-1440/2));
function ackermann(d){if(Math.abs(d)<1e-6)return [0,0];const Rr=WB/Math.tan(Math.abs(d)),inn=Math.atan(WB/(Rr-KZ)),out=Math.atan(WB/(Rr+KZ));return d>0?[inn,out]:[-out,-inn];}   // [left, right]; d>0 turns left, so the left wheel is the inner one
let CRANK_Y=EF_RIG.power.crankY,ENG_X=AX_F+EF_RIG.power.dx;   // crank line (ef_rig.js); setEngine moves it for a swap kit's mounts
// hood underside over the engine: the outer surface less the 20 mm skin and 8 mm clearance, lowest point over the engine's footprint (CALCULATED from the body)
const hoodUnder=(x0,x1,zh)=>{let m=1e9;for(let x=x0;x<=x1;x+=.5)m=Math.min(m,EG.top(x,zh)-1.4);return m;};
const turnPhase=()=>Math.floor(state.t*1.5)%2===0;
let WY=WR,ENG_Z=0;   // WR = hub height of the stock 195/60R14 (loaded radius 280 mm, MEASURED)
const stages=[];
function stage(label,fn){stages.push([label,fn]);}

stage('Shaping the body panels',()=>{
  PCA_R=PAINT_PCA_R;   // smooth paint (e30_core.js PAINT_PCA_R, owner Nov 13); was 0:   // the EF keeps the shading the owner signed off (averaged exposure normals)
  SKIN.mode='voxel';   // the EF keeps its voxel panels (the look the owner signed off); only its glass, seals, wipers and mirrors are new
  const r=buildEFBody(EG);build.r=r;build.EG=EG;const H=r.hi;
  build.lamps=efLamps(EG,H);                     // lenses are the panel skin, moved out of the body before its mesh is made
  const GL_=Object.values(H.glass),SM={body:[H.hood,H.trunk,H.doorL,H.doorR,...GL_],hood:[H.body,H.doorL,H.doorR,...GL_],trunk:[H.body,...GL_],doorL:[H.body,H.hood,H.trunk,H.doorR,...GL_],doorR:[H.body,H.hood,H.trunk,H.doorL,...GL_]};
  // windshield and hatch panes first: the panels round them are cut back to their straightened outlines before the panels are drawn (glass_trim.js)
  // voxel panels (the EF's look): the glass is a sheet on the measured surface over exactly its own cells' columns, i.e. the openings in the panels, which keep
  // their one-cell rubber ring round it and are not cut (a straight-edged pane over 10 mm stairs stood off the pillars); the pane frames carry the wipers
  const gpWS=glassPane(H.glass.ws,{bodies:[H.body,H.hood],rLo:1.5,rHi:4,surf:EG.solidAt,lift:.1}),gpRW=glassPane(H.glass.rw,{bodies:[H.trunk],rLo:1.5,rHi:4,surf:EG.solidAt,lift:.1});
  P.bodyMesh=paintable(H.body,body,undefined,.5,{o:SM.body,wy:[.45,.8],snap:EG.solidAt});   // snap: the skin is drawn ON the measured surface (surfnet.js)
  const hh=group(body,HOOD_HINGE[0],HOOD_HINGE[1],0),hm=paintable(H.hood,hh,undefined,.5,{o:SM.hood,snap:EG.solidAt});hm.position.set(-HOOD_HINGE[0],-HOOD_HINGE[1],0);P.hood=hh;
  const th=group(body,HATCH_HINGE[0],HATCH_HINGE[1],0),tm=paintable(H.trunk,th,undefined,.5,{o:SM.trunk,snap:EG.solidAt});tm.position.set(-HATCH_HINGE[0],-HATCH_HINGE[1],0);P.trunk=th;
  // hatch glass: the voxel-mode sheet over its own cells in the hatch, inside the hatch's rubber ring (glass_trim.js glassSheet), riding on the hatch; its wiper below it
  {const m=mkGlassSheet(H.glass.rw,th,.5,EG.solidAt);P.paneRW={pane:m,gp:gpRW,meshes:[m]};if(m)m.position.set(-HATCH_HINGE[0],-HATCH_HINGE[1],0);}
  const sp=paintable(efSpoiler(EG,H.trunk,H.glass.rw),th,undefined,.5,{seat:EG.solidAt});sp.position.set(-HATCH_HINGE[0],-HATCH_HINGE[1],0);P.spoiler=sp;
  // doors hinge on the outermost door skin at the front edge (so nothing sweeps forward into the fender)
  let zOut=0;for(const D of [H.doorL,H.doorR])for(const [i,j,k] of D.list())if(i/2>=DOOR_F-1.5)zOut=Math.max(zOut,Math.abs(k)/2);
  build.doorHingeZ=zOut;
  const doorMesh={};for(const sd of [-1,1]){
    const hz=sd*zOut,dg=group(body,DOOR_F,0,hz),DG=sd<0?H.doorL:H.doorR,dm=paintable(DG,dg,undefined,.5,{snap:EG.solidAt});dm.position.set(-DOOR_F,0,-hz);doorMesh[sd<0?'L':'R']=dm;
    // door glass: winding it down slides the pane down along its own curved surface, 0..400 mm in 11 steps; the part inside the door runs in the door's cavity and is not drawn
    const GS=glassSteps(sd<0?H.glass.dgL:H.glass.dgR,sd).map((G,i)=>{const m=mkGlass(G,'side',dg,.5);if(m){m.position.set(-DOOR_F,0,-hz);m.visible=i===0;}return m;});
    P['door'+(sd<0?'L':'R')]=dg;P['dglass'+(sd<0?'L':'R')]=GS;
    const mr=efMirror(EG,sd);
    let mSelf;{const ms=paintable(mr.shell,dg,undefined,.5,{seat:EG.solidAt});ms.position.set(-DOOR_F,0,-hz);const mg=mk(mr.glass,matMirror,0,dg,.5);if(mg)mg.position.set(-DOOR_F,0,-hz);mSelf=[ms,mg].filter(Boolean);}
    MIRRORS.push(makeMirror(dg,new THREE.Vector3(mr.glassCenter[0]-DOOR_F,mr.glassCenter[1],mr.glassCenter[2]-hz),mr.glassSize[0],mr.glassSize[1],'door'+(sd<0?'L':'R'),-sd*(sd===cp.side?12:14)*D2R,mSelf));   // adjusted toward the driver: 12 degrees on his side, 14 on the far side (a sliver of the flank on the inboard edge)
    const dc=mk(genDoorCard(sd,sd<0?H.doorL:H.doorR,{x0:DOOR_R+2,x1:DOOR_F-2.5,y0:EF_RIG.doorCard.y0,y1:BELT-1.2,trim:0x575b63,hi:1,xMin:y=>EG.doorRear(y)+1.5}),matV,0,dg,.5);if(dc){dc.position.set(-DOOR_F,0,-hz);(P.doorCards=P.doorCards||[]).push(dc);}
    // door handle: black pull at the rear of the door, just under the belt (MEASURED side view 2300-2420 mm, 760-800 mm)
    const hx=EG.wx(2360),hy=EG.u(780),hs=EG.halfAt(hx,hy),hd=mk(buildHandle(),matV,0,dg);hd.position.set(hx-DOOR_F,hy,sd*(hs+.1)-hz);hd.rotation.y=sd>0?-Math.PI/2:Math.PI/2;if(sd<0)hd.position.x=hx-3.5-DOOR_F;
  }
  P.frameSeals=mkFrameSeals([{g:H.body,grp:P.bodyMesh},{g:H.doorL,grp:doorMesh.L},{g:H.doorR,grp:doorMesh.R},{g:H.trunk,grp:tm},{g:H.hood,grp:hm}],Object.values(H.glass),{fenceGlass:[H.glass.ws]});   // smooth rubber lines on the window frames (frame_seal.js, owner Nov 13)
  const g=H.glass;{const m=mkGlassSheet(g.ws,body,.5,EG.solidAt);P.paneWS={pane:m,gp:gpWS,meshes:[m]};}P.glassWS=P.paneWS.pane;P.glassQL=mkGlass(g.qgL,'side',body,.5);P.glassQR=mkGlass(g.qgR,'side',body,.5);
});

stage('Fitting bumpers, lamps and trim',()=>{
  const bf=efBumper(EG,true),bb=efBumper(EG,false);build.bf=bf;build.bb=bb;
  P.bumperF=paintable(bf.grid,body,undefined,.5,{seat:EG.solidAt});P.bumperR=paintable(bb.grid,body,undefined,.5,{seat:EG.solidAt});
  const MATS={frame:matV,head:matHead,famb:matFrontAmb,red:matTailRed,amb:matTailAmb,wht:matTailWht,garnish:matV};
  const add=(lamps,parent,off)=>{for(const k in lamps){const m=mk(lamps[k],MATS[k]||matV,0,parent,.5);if(m){if(off)m.position.set(...off);(P['lamp_'+k]=P['lamp_'+k]||[]).push(m);}}};
  const L=build.lamps,onHatch={garnish:L.garnish},onBody={};for(const k in L)if(k!=='garnish')onBody[k]=L[k];
  add(onBody,body);add(onHatch,P.trunk,[-HATCH_HINGE[0],-HATCH_HINGE[1],0]);
  P.badges=[];for(const B of efBadges(build.r.hi,L)){const m=mk(B.grid,matV,0,P.trunk,B.scale,.01);if(m){m.position.set(-HATCH_HINGE[0],-HATCH_HINGE[1],0);P.badges.push(m);}}   // CIVIC / VTEC / HONDA lettering rides on the hatch
  for(const k in bf.lamps){const m=mk(bf.lamps[k],MATS[k]||matV,0,P.bumperF,1);if(m)(P['lamp_'+k]=P['lamp_'+k]||[]).push(m);}
  P.tailRed=P.lamp_red||[];P.tailAmb=P.lamp_amb||[];P.tailWht=P.lamp_wht||[];P.frontAmb=P.lamp_famb||[];P.head=P.lamp_head||[];
  // licence plates on the bumpers (plain white plates, JDM size 330 x 165 mm)
  const plate=(front,pl)=>{const w=Math.round(pl.w*2/2),h=Math.round(pl.h*2);const g=new Grid(front?0:-1,front?1:0,0,h,-w,w);g.fill((x,y,z)=>{const az=Math.abs(z);return (az>=w||y<=0||y>=h)?0x20262c:COL.white;});return g;};
  const plateX=(front,B)=>{const pl=B.plate,j0=Math.round((pl.y-pl.h/2)*2),j1=j0+Math.round(pl.h*2),w=Math.round(pl.w);let m=front?-1e9:1e9;
    for(const [i,j,k] of B.grid.list())if(j>=j0&&j<=j1&&Math.abs(k)<=w)m=front?Math.max(m,i):Math.min(m,i);return (front?m+1:m-1)*.5;};   // plate cell 0 one cell proud of the bumper
  const pf=mk(plate(true,bf.plate),matV,0,body,.5);pf.position.set(plateX(true,bf),bf.plate.y-bf.plate.h/2,0);P.plateF=pf;
  const pr=mk(plate(false,bb.plate),matV,0,body,.5);pr.position.set(plateX(false,bb),bb.plate.y-bb.plate.h/2,0);P.plateR=pr;
});

stage('Mounting the engine bay',()=>{
  P.bay=mk(RG.bay(),matV,0,body);
  P.hoses=new THREE.Mesh(new THREE.BufferGeometry(),matV);body.add(P.hoses);   // filled by setEngine
  const eg=group(body,ENG_X,CRANK_Y,0);P.engGroup=eg;P.engine=eg;
  const cpu=group(eg,0,0,0);P.crankP=cpu;P.altP=group(eg,0,0,0);P.psP=group(eg,0,0,0);
  const fn=group(body,BAY.radX-3.6,22,-4);const fm=mk(buildFan(),matV,0,fn,.42);P.fan=fn;
  setEngine(cfg.engine||'B16A',cfg.gearbox||'EF9-5MT');
  // under the body: subframe, cross-members, fuel tank under the rear seat (kept above the 150 mm ground clearance); exhaust
  P.under=mk(genUnder(Object.assign({fx0:AX_R+6,fx1:AX_F+EF_RIG.under.fx1dx,rx:AX_R+8},EF_RIG.under)),matV,0,body);
  // the sub-frames bolt to the body: posts from the rails up to the floor pan, the radiator support and the sills, each ending flush on what it bolts to (10 mm cells)
  {const U=EF_RIG.under,top=U.subY+1.5,solid=solidOf([build.r.hi.body],[P.bay.geometry.userData.src]),posts=[];
   for(const s of [-1,1]){posts.push({x:U.railX0+.75,z:s*U.railZ,y0:top},{x:U.railX1,z:s*U.railZ,y0:top});
     if(U.rearRails)posts.push({x:U.rearRails.x1-6,z:s*U.rearRails.z,y0:top},{x:U.rearRails.x0+6,z:s*U.rearRails.z,y0:top});   // between the lower arms' pivots
     for(const [tx,tz] of (U.trailBr||[]))posts.push({x:tx,z:s*(tz+1),y0:top});}
   P.underMounts=mk(genPosts(posts,solid,0x2a2c30),matV,0,body,.5);}
  {const tip=byIdSafe('exhaust',cfg.exhaust||'stock').tip;P.exh=mk(buildExhaustEF(tip),matV,0,body);P.exhTips=mk(genExhaustTips(tip,exhF()),matV,0,body,.5,.02);}
});

stage('Furnishing the cabin',()=>{
  P.interior=mk(RG.interior(),matV,0,body);
  const dd=mk(RG.dashDetail(),matV,0,body,.5,.03);dd.position.set(...RG.dashDetailPos);P.dashDetail=dd;
  const W0=cp.wheel,sw=group(body,W0.x,W0.y,W0.z);sw.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),new THREE.Vector3(...W0.n).normalize());
  {const im=buildInteriorMirror(build.r);const a=mk(im.shell,matV,0,body,.5),b=mk(im.glass,matMirror,0,body,.5);a.position.set(...im.pos);b.position.set(...im.pos);P.imirror=[a,b];P.visors=[];
   MIRRORS.push(makeMirror(body,new THREE.Vector3(...im.glassCenter),im.glassSize[0],im.glassSize[1],'interior',cp.side*9*D2R,[a,b]));   // tilted 9 degrees toward the driver
   for(const sd of [-1,1]){const v=buildVisor(build.r,sd),vm=mk(v.grid,matV,0,body,.5);vm.position.set(...v.pos);P.visors.push(vm);}}
  const swi=group(sw,0,0,0);P.swheel=swi;P.swm=mk(genSteeringWheel(360,{}),matV,0,swi,.5);P.swm.position.set(0,0,-.75);
  setSeats();
  // cargo bay: trims, load floor, lock-panel trim; the parcel shelf on its hinge behind the seat back; the hatch's two gas struts (ball studs on the body by the
  // tail lamps and on the hatch frame by the glass's top corners; DESIGN positions from photos)
  P.dTrim=mk(efDPillarTrim(EG,build.r.hi),matV,0,body,.5,.02,true);   // D-pillar trims inside the hatch opening (smooth-shaded moulded plastic)
  {const C=efCargo(EG,build.r.hi,build.lamps.garnish);P.cargo=mk(C.fixed,matV,0,body,.5,.03);
   const sg=group(body,C.pivot[0],C.pivot[1],0),sm=mk(C.shelf,matV,0,sg,.5,.03);sm.position.set(-C.pivot[0],-C.pivot[1],0);P.shelf=sg;
   const cylG=bufGeo(geoData(genLink(28,1.15,0x1b1c1e),0,0,0)),rodG=bufGeo(geoData(genLink(28,.45,COL.chrome),0,0,0));
   P.struts=[];for(const sd of [-1,1]){const a=new THREE.Mesh(cylG,matV),b=new THREE.Mesh(rodG,matV);body.add(a);body.add(b);P.struts.push({nm:'S'+(sd<0?'L':'R'),cyl:a,rod:b,B0:new V3(-84,47.5,sd*31.2),H0:new V3(-76.25,60,sd*24.1)});}}   // lower ball stud on the D-pillar trim's inner face 950 mm up; upper on the hatch frame near its top corner: closed, the strut lies just inboard of the trim
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
  const w0=cfg.wheel||{style:'star',dia:14,width:5.5,et:45};
  const ty0=tyreFor(w0.dia,w0.width,w0.tw,w0.ar);
  const tireG=bufGeo(geoData(buildTireP(ty0.OD,ty0.tw,w0.dia,w0.width),0,.03,0)),rimG=bufGeo(geoData(buildRimP(w0.style,w0.dia,w0.width,w0.et,'plain',{exact:1}),0,.03,0)),
        rotG=bufGeo(geoData(buildRotorP(240),0,.03,0)),calG=bufGeo(geoData(buildCaliperP(240,'stock',1),0,.03,0));
  P.rimMeshes=[];
  const zcF0=(SH.hubFaceZ-w0.et+(cfg.spacerF||0))/20,zcR0=(SH.hubFaceZ-w0.et+(cfg.spacerR||0))/20;
  const hub=(name,x,sd,steer)=>{   // c: on the kingpin (steers), off: out to the wheel's centre plane, fl: the wheel (mirrored on the left), sp: spins
    const c=group(carRoot,x,WR,sd*KZ),cb=group(c,0,-5.5,0),st=group(cb,0,5.5,0),off=group(st,0,0,sd*((steer?zcF0:zcR0)-KZ)),fl=group(off);if(sd<0)fl.rotation.y=Math.PI;
    const sp=group(fl);
    const tire=new THREE.Mesh(tireG,matV);tire.scale.setScalar(.5);sp.add(tire);
    const rim=new THREE.Mesh(rimG,matV);rim.scale.setScalar(.5);sp.add(rim);P.rimMeshes.push(rim);
    const rot=new THREE.Mesh(rotG,matV);rot.scale.setScalar(.5);sp.add(rot);
    const cg=group(fl);cg.rotation.z=sd<0?Math.PI:0;const cal=new THREE.Mesh(calG,matV);cal.scale.setScalar(.5);cg.add(cal);
    const kn=new THREE.Mesh(bufGeo(geoData(efKnuckle(sd,steer,240),0,.03,0)),matV);kn.scale.setScalar(.5);st.add(kn);   // the knuckle (upright) steers with the wheel; it does not spin
    wheels[name]={c,cb,st,off,sp,sd,steer,tire,rim,rot,cal,cg,kn};   // cb: camber (knuckle and wheel turn about the lower ball joint, 110 mm under the hub)
  };
  hub('FL',AX_F,-1,true);hub('FR',AX_F,1,true);hub('RL',AX_R,-1,false);hub('RR',AX_R,1,false);
  // suspension links: double wishbones front and rear, dampers with coil springs, tie rods, half-shafts (hardpoints in ef_rig.js)
  const LK=EF_RIG.links,armG=bufGeo(geoData(genLink(LK.n,LK.arm,0x2b2e33),0,0,0)),rodG=bufGeo(geoData(genLink(LK.n,LK.rod,0x3a3d42),0,0,0)),forkG=bufGeo(geoData(genLink(LK.n,LK.fork,0x3b3f45),0,0,0)),
        DM=EF_RIG.damper,CO=EF_RIG.coil,strG=bufGeo(geoData(genDamper(DM.n,DM.bodyR,DM.rodR,DM.bodyFrac),0,0,0)),sprG=coilGeo(true),sprGR=coilGeo(false),shG=bufGeo(geoData(genLink(LK.n,LK.shaft,0x8d9298),0,0,0)),boltG=bufGeo(geoData(genLink(LK.n,1.2,0x8d9298),0,0,0));
  P.links=[];
  const mkSeg=(geo,mat)=>{const m=new THREE.Mesh(geo,mat||matV);carRoot.add(m);return m;};
  for(const nm of ['FL','FR','RL','RR']){
    const L={nm,lowF:mkSeg(armG),lowR:mkSeg(armG),upF:mkSeg(armG),upR:mkSeg(armG),strut:mkSeg(strG),spring:mkSeg(nm[0]==='F'?sprG:sprGR)};
    if(nm[0]==='F'){L.rod=mkSeg(rodG);L.shaft=mkSeg(shG);L.forkA=mkSeg(forkG);L.forkB=mkSeg(forkG);L.bolt=mkSeg(boltG);}else{L.trail=mkSeg(armG);}
    P.links.push(L);
  }
  P.rack=mk(RG.rack(),matV,0,body);P.rack.position.set(AX_F+SU.front.rack.dx,SU.front.rack.y,0);
  const sg=new THREE.Mesh(new THREE.PlaneGeometry(275,135),G.shadowMat());
  sg.rotation.x=-Math.PI/2;sg.position.set(0,.25,0);carRoot.add(sg);
  for(const sd of [-1,1]){const sl=new THREE.SpotLight(0xfff0cf,0,1400,.5,.55,1);sl.position.set(NOSE_X+2,31,sd*25);carRoot.add(sl);const tg=new THREE.Object3D();tg.position.set(500,6,sd*25);carRoot.add(tg);sl.target=tg;(P.beams=P.beams||[]).push(sl);}
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
function exhF(){const X=EF_RIG.exh,d=build.downpipe,F=Object.assign({},X,d?{x0:d[0],y0:d[1]-1.5,z0:d[2]}:{x0:(build.engX||ENG_X)+X.dx,z0:ENG_Z},{tipX:EG.wx(X.tipMM)});
  // anchors for the Japanese tails: the silencer's outlet, the rear bumper's rearmost face and bottom edge, the spears outboard of the hatch (it swings between them),
  // the side exit 40 mm ahead of the rear arch at the sill
  let rx=1e9;if(build.bb)for(const [i] of build.bb.grid.list())rx=Math.min(rx,i);rx=rx===1e9?EG.REAR_X:(rx-.5)/2;
  const zt=EG.u(EF_M.hatch.sideHalf)+3.5;
  F.jdm={out:[F.mufX1,F.pipeY,F.side*F.mufZ],rearX:rx,botY:EFD.bumperR.bot/20,tyZ:[-zt,zt],spears:{3:[[-zt,0],[zt,0],[zt,-3.5]],4:[[-zt,0],[-zt,-3.5],[zt,0],[zt,-3.5]]},topY:62.5,side:{from:[-38,F.pipeY,0],sg:1,y:7.4,z:EG.halfAt(-38,9.5)}};   // side exit 190 mm ahead of the rear arch (clear of the trailing-link bracket), its 50 mm pipe below the sill (bottom 180 mm)
  return F;}
function buildExhaustEF(tip){return genExhaust(EG,tip,exhF());}   // the exhaust bolts to the end of the engine's down pipe
// suspension pick-up points for a corner, body frame (shared with ef_collision.js through EF_RIG.susp)
function suspPts(front,sd){const S=front?SU.front:SU.rear,ax=front?AX_F:AX_R,bp=a=>[ax+a[0],a[1],sd*a[2]];
  return {lowF:bp(S.lowF),lowR:bp(S.lowR),upF:bp(S.upF),upR:bp(S.upR),strutTop:bp(S.strutTop),trail:S.trail?bp(S.trail):null,
          lbj:[ax,WY+S.lbj[0],sd*(ZK+S.lbj[1])],ubj:[ax,WY+S.ubj[0],sd*(ZK+S.ubj[1])],strutLow:[ax+S.strutDx,WY+S.strutLy,sd*(ZK-S.strutLowDz)],springTopY:S.springTopY,springLow:S.springLow||.3,rodTo:S.rodTo};}
// a point on the front knuckle turned about the kingpin by the wheel's steer angle (same rotation as the wheel's st group)
// the knuckle in its steering frame (kingpin at hub height): hub-bearing housing out to the disc's inner face (45 mm inboard of the hub face), upright between the
// ball joints 5-25 mm inboard of the kingpin plane (inside the tyre's inner sidewall, outside the spring with room for the body's roll), steering arm to the tie-rod end (front), caliper lug, trailing-link lug (rear)
function efKnuckle(sd,front,rotorMM){const hubIn=(SH.hubFaceZ-45)/20-KZ,S=front?SU.front:SU.rear;
  return genKnuckle(sd,{boss:[0,hubIn-.25,2.25],lbj:S.lbj[0],ubj:S.ubj[0],armZ:[-1,-.5],steer:front?[-5.5,-3.2,-.8]:null,cal:[-(.6*rotorMM/40)+.05,0,hubIn-.75],trail:front?null:[0,SU.rear.trailY,.5]});}
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
  // camber: the upright turns about its lower ball joint; the upper ball joint, the steering arm, the outer CV joint and the trailing-link lug move with it
  const camP=(v,sd,front)=>{const c=sd*camberOf(front),py=WY-5.5,pz=sd*KZ,dy=v.y-py,dz=v.z-pz;v.y=py+dy*Math.cos(c)-dz*Math.sin(c);v.z=pz+dy*Math.sin(c)+dz*Math.cos(c);return v;};
  // steering arms on the knuckles (behind the axle) turn with their wheels; the rack moves by their mean lateral travel
  const RK=SU.front.rack,knk=sd=>[AX_F-5.5,WY-3.2,sd*(ZK-.8)],kL=rotK(knk(-1),-1,aL),kR=rotK(knk(1),1,aR),rackShift=((kL[2]-knk(-1)[2])+(kR[2]-knk(1)[2]))/2;
  P.rack.position.set(AX_F+RK.dx,RK.y,rackShift);   // the rack is fixed to the body (body frame)
  const LK=EF_RIG.links,V=a=>new V3(a[0],a[1],a[2]),B=a=>bodyPt(a[0],a[1],a[2]);
  for(const L of P.links){
    const front=L.nm[0]==='F',sd=L.nm[1]==='R'?1:-1,ax=front?AX_F:AX_R,S=suspPts(front,sd),th=front?(sd<0?aL:aR):0,rk=p=>front?rotK(p,sd,th):p;
    const lbj=V(rk(S.lbj)),ubj=camP(V(rk(S.ubj)),sd,front);
    const lp=B(S.lowR);segTo(L.lowR,lp,lbj,zAxis,LK.n,.5);segTo(L.lowF,B(S.lowF),S.rodTo?new V3().lerpVectors(lp,lbj,S.rodTo):lbj,zAxis,LK.n,.5);   // the front radius rod meets the lower link part-way out
    segTo(L.upF,B(S.upF),ubj,zAxis,LK.n,.5);segTo(L.upR,B(S.upR),ubj,zAxis,LK.n,.5);
    const lo=V(S.strutLow),up=B(S.strutTop);   // the damper is mounted on the lower arm and does not steer
    const DM=EF_RIG.damper,CO=EF_RIG.coil,sTop=up.clone().addScaledVector(new V3().subVectors(lo,up).normalize(),(S.strutTop[1]-S.springTopY));   // the top seat hangs a fixed distance under the top mount (body side)
    segTo(L.spring,new V3().lerpVectors(lo,up,S.springLow),sTop,yAxis,CO.n,.5);
    const armY=z=>{const t=Math.max(0,Math.min(1,(z-lp.z)/(lbj.z-lp.z)));return lp.y+(lbj.y-lp.y)*t;},yb=armY(lo.z);   // the lower link's centre line under the damper's lower mount
    if(front){
      const F=SU.front,tf=(WY+F.forkTop-lo.y)/(up.y-lo.y),ft=new V3().lerpVectors(lo,up,tf);
      segTo(L.strut,ft,up,yAxis,DM.n,.5);
      segTo(L.forkA,new V3(lo.x+F.forkDx,yb,lo.z),new V3(ft.x+F.forkDx,ft.y,ft.z),zAxis,LK.n,.5);segTo(L.forkB,new V3(lo.x-F.forkDx,yb,lo.z),new V3(ft.x-F.forkDx,ft.y,ft.z),zAxis,LK.n,.5);   // the fork straddles the lower link
      segTo(L.bolt,new V3(lo.x-F.forkDx-.5,yb,lo.z),new V3(lo.x+F.forkDx+.5,yb,lo.z),zAxis,LK.n,.5);   // its through-bolt and bush in the link
      segTo(L.rod,B([AX_F+RK.dx,RK.y,sd*RK.half+rackShift]),camP(V(sd<0?kL:kR),sd,true),zAxis,LK.n,.5);
      const inner=sd<0?P.hsL:P.hsR;if(inner)segTo(L.shaft,bodyPt(inner.x,inner.y,inner.z),camP(V(rotK([AX_F,WY,sd*(KZ+.8)],sd,th)),sd,true),zAxis,LK.n,.5);   // outer joint on the knuckle
    }else{segTo(L.strut,new V3(lo.x,yb,lo.z),up,yAxis,DM.n,.5);segTo(L.trail,B(S.trail),camP(new V3(ax,WY+SU.rear.trailY,sd*(ZK+.5)),sd,false),zAxis,LK.n,.5);}
  }
  // engine rock about the crank axis (z), at the firing frequency shown in slow motion; pulleys at crank speed times the drawn pulley ratios
  const shake=(state.rpm/6000)*.35+.1,fireHz=state.rpm/60*(P.cyl||4)/2;
  P.engGroup.rotation.z=Math.sin(state.t*Math.PI*2*Math.min(fireHz*SHAKE_SLOW,12))*.0012*shake*60*((P.amp||1)/1);
  const crank=state.t*state.rpm/60*Math.PI*2*CRANK_SLOW;
  P.crankP.rotation.z=crank;P.altP.rotation.z=-crank*(6/3.5);P.psP.rotation.z=-crank*(6/3);
  P.fan.rotation.x=(state.v>.5||state.throttle>.2)?state.t*3.2:P.fan.rotation.x;
  if(P.swm)P.swm.visible=!state.swOff;   // pulled off its quick-release hub: the hub boss stays on the column
  P.swheel.rotation.z=state.sw||0;
  P.speedo.rotation.x=(-120+clamp(Math.abs(state.v)*3.6,0,240)/240*240)*D2R;P.tach.rotation.x=(-120+clamp(state.rpm,0,9000)/9000*240)*D2R;
  P.ped_gas.rotation.z=state.throttle*.2;P.ped_brake.rotation.z=state.brake*.24;P.ped_clutch.rotation.z=(state.shiftT>0?.42:0);   // hanging pedals swing forward, toward the firewall (pad travel about 65 mm throttle, 80 mm brake, 140 mm clutch)
  const g=state.gear,ss=shiftSS(cfg);   // short-throw: the lever moves less with every shift (SPEC-INTERIOR §2.4)
  P.shifter.rotation.z+=((g===1||g===3||g===5?-.12*ss:g===0?0:.12*ss)-P.shifter.rotation.z)*.2;
  P.shifter.rotation.x+=((g<=2?.1*ss:g<=4?0:-.1*ss)-P.shifter.rotation.x)*.2;
  const on=state.lights>0,haz=state.hazard>0,blink=(haz||state.signal)&&turnPhase(),braking=!!state.brakeLamp,reverse=state.gear===0;
  matHead.emissiveIntensity+=((on?1.1:0)-matHead.emissiveIntensity)*.3;
  for(const b of P.beams)b.intensity=on?1.6:0;
  matTailRed.emissiveIntensity=braking?1.4:(on?.55:.02);
  matTailAmb.emissiveIntensity=blink?1.5:0;matFrontAmb.emissiveIntensity=blink?1.5:0;matTailWht.emissiveIntensity=reverse?1.2:0;
  if(state.wipers){state.wipT=(state.wipT||0)+dt*2.2;}
  const ws=state.wipers?(.5-.5*Math.cos(state.wipT||0)):0;anim.wip+=(ws-anim.wip)*.4;
  if(P.wiperRig)P.wiperRig.update(anim.wip);if(P.rearWiper)P.rearWiper.update(anim.wip);
}

/* ---------- shop visuals ---------- */
function setEngine(eid,gid){
  for(const k of ['engMesh','gbMesh','accMesh']){if(P[k]){P.engGroup.remove(P[k]);P[k].geometry.dispose();P[k]=null;}}
  const KIT=(byId('swapkit',cfg.swapkit||'none')||{}).place||{},ED0=byId('engine',eid),ED=Object.assign({},ED0,{pan:(ED0&&ED0.pan||140)-(KIT.panCut||0)}),GD=Object.assign({across:260},byId('gearbox',gid)),E=RG.engine(Object.assign({len:450,wid:480,hgt:570,pan:140},ED)),T=RG.transaxle(GD,E);   // a swap kit's mounts may move the engine and shorten its pan (declared in the kit record)
  const ENG_X=AX_F+EF_RIG.power.dx+(KIT.dx||0),CRANK_Y=EF_RIG.power.crankY+(KIT.dy||0);   // parts that cannot fit this car (longitudinal engines, rear-drive gearboxes) are drawn with the nearest generic body so the shop can show why they are refused
  // centre the engine and gearbox across the car (cells -> units: half), crank line at CRANK_Y
  const zmin=E.zFly-GD.across/10-3,zmax=E.zBelt+4,oz=-((zmin+zmax)/2)*.5;
  P.engGroup.position.set(ENG_X,CRANK_Y,oz);
  const yPan=-E.crankY*.5;
  // squash the static castings if the engine is tall for the bay (declared: the swap kit's low-profile pan and intake are drawn this way); the limit is the hood underside over the engine's footprint
  const hu=hoodUnder(ENG_X-E.Dc*.4,ENG_X+E.Dc*.4,Math.max(Math.abs(oz+E.zFly*.5),Math.abs(oz+E.zBelt*.5)));
  const sy=Math.min(1,(hu-(CRANK_Y+yPan))/(E.yTop*.5));
  P.engMesh=mk(E.grid,matV,0,P.engGroup,.5);P.engMesh.position.set(0,yPan,0);P.engMesh.scale.y=.5*sy;
  const GZ=E.zFly*.5-.5;   // the transaxle's bell face one cell outboard of the block's flywheel face (they bolt face to face)
  P.gbMesh=mk(T.grid,matV,0,P.engGroup,.5);P.gbMesh.position.set(0,yPan,GZ);P.gbMesh.scale.y=.5*sy;
  P.engSy=sy;P.cyl=ED.cyl;P.amp={4:1.0,5:.8,6:.35,8:.6}[ED.cyl]||1;build.eng={E,T,oz,sy,yPan,hu,GZ};
  // accessories on the belt end: alternator, power-steering pump, their belt (static meshes), pulleys (rotating groups)
  const Dc=E.Dc,pc=E.pc,Hc=E.hgt/10,zb=E.zBelt;
  const EPt=E.pts,A={x:EPt.blockFront+4.7,y:EPt.yB+4.5},S={x:EPt.blockRear-3.9,y:EPt.yB+4};   // alternator ahead of the block, power-steering pump behind it, both low at the belt end and clear of the castings
  const acc=new Grid(-Math.ceil(Dc),Math.ceil(Dc),0,Math.ceil(Hc+6),-Math.ceil(E.Wc),Math.ceil(E.Wc)+8);
  cylZ(acc,A.x,A.y,4.2,zb-11,zb-1,0x6b6f76);cylZ(acc,A.x,A.y,3,zb-1,zb,0x2a2c30);          // alternator
  cylZ(acc,S.x,S.y,3.4,zb-8,zb-1,0x4c5056);                                                 // power-steering pump
  const bz=zb+2,bc=0x131416,tan=(p,q,r1,r2)=>{const dx=q.x-p.x,dy=q.y-p.y,l=Math.hypot(dx,dy),nx=-dy/l,ny=dx/l;return [[p.x+nx*r1,p.y+ny*r1],[q.x+nx*r2,q.y+ny*r2]];};
  // the belt runs round the pulleys as they are placed (the pulleys keep their size when a tall engine's castings are squashed under the hood): its tangents are
  // found in the pulleys' own space and mapped back into the accessories' (squashed) cells
  const Cc={x:0,y:pc},cv=p=>({x:p.x,y:(p.y-pc)*sy}),toAcc=y=>y/sy-yPan/(.5*sy),t1=tan(cv(Cc),cv(A),6,3.5),t2=tan(cv(A),cv(S),3.5,3),t3=tan(cv(S),cv(Cc),3,6);
  for(const [a,b] of [t1,t2,t3])segFill(acc,[a[0],toAcc(a[1]),bz],[b[0],toAcc(b[1]),bz],.75,bc);   // (thick enough that a sloping run stays one piece in 10 mm cells)
  P.accMesh=mk(acc,matV,0,P.engGroup,.5);P.accMesh.position.set(0,yPan,0);P.accMesh.scale.y=.5*sy;
  for(const [g,x,y,r] of [[P.crankP,0,pc,6],[P.altP,A.x,A.y,3.5],[P.psP,S.x,S.y,3]]){while(g.children.length){const c=g.children[0];g.remove(c);c.geometry.dispose();}
    const m=mk(genPulleyZ(r,r===6?0x41454b:0x50555c),matV,0,g,.5);g.position.set(x*.5,(y-pc)*.5*sy,zb*.5+.05);}
  // half-shaft inner joints (body frame): left at the gearbox output flange, right at the belt end of the engine
  const ox=ENG_X,oy=CRANK_Y,yj=oy+(T.outY-E.crankY)*.5*sy;
  P.hsL={x:ox+T.outX*.5,y:yj,z:oz+GZ+T.outZ*.5};P.hsR={x:ox+T.outX*.5,y:yj,z:oz+zb*.5+1.5};
  // hoses and intake tube (static, body frame), routed for this engine: radiator tank outlets just outside the fan shroud, inboard of the wheelhouse walls, under the air box,
  // to the thermostat housing and water inlet at the flywheel end; intake from the air box top to the throttle body. A cell of the engine (10 mm) in the body frame: EB().
  const EB=p=>[ox+p[0]*.5,oy+yPan+p[1]*.5*sy,oz+p[2]*.5],hz=new Grid(40,100,5,45,-30,30),hc=0x15161a,rad=BAY.radX,HR=EF_RIG.hoses,pl=(pts,r,c)=>{for(let i=0;i<pts.length-1;i++)segFill(hz,pts[i],pts[i+1],r,c);};
  const th=EB(EPt.thermo),wi=EB(EPt.waterIn),tb=EB(EPt.tb);build.nosTb=tb;
  pl([[rad-.6,HR.upY,-HR.tankZ],[HR.shroudX,HR.upY,-HR.tankZ],[HR.turnX,HR.upY,-19.5],[HR.turnX-2.2,HR.upY,-12],[th[0]+1.5,HR.upY,th[2]-1],[th[0],th[1],th[2]]],HR.r,hc);   // upper radiator hose
  pl([[rad-.6,HR.loY,-HR.tankZ],[HR.shroudX,HR.loY,-HR.tankZ],[HR.turnX+.8,HR.loY,-18],[HR.turnX-.7,HR.loY,-12],[wi[0]+1.5,wi[1],wi[2]+.5],[wi[0],wi[1],wi[2]]],HR.r,hc);   // lower radiator hose
  {const AB=BAY.airbox,az=BAY.airZ||-1,zf=az*AB.z1;pl([[tb[0],tb[1],tb[2]-.6],[tb[0],tb[1]-2,tb[2]-3.5],[AB.x0+4,(AB.y0+AB.y1)/2,zf+2.2],[AB.x0+4,(AB.y0+AB.y1)/2,zf+.8]],HR.intakeR,0x1c1d20);}   // intake tube: throttle body to the air box's inboard face
  if(P.hoses){P.hoses.geometry.dispose();P.hoses.geometry=bufGeo(geoData(hz,0,.05,0));}
  ENG_Z=oz;build.engX=ENG_X;build.downpipe=EB(EPt.downpipe);
  if(P.fan)P.fan.visible=true;
}
function setSeats(){
  (P.seatMeshes||[]).forEach(m=>{body.remove(m);m.geometry.dispose();});P.seatMeshes=[];
  const LOOKS={stock:{cush:0x2d2f34,bol:0x3a3d44,bolH:1.2,back:22,hw:9.5,head:'post'},comfort:{cush:0x4a4339,bol:0x564e43,bolH:.5,back:22,hw:9.5,head:'post'},sport:{cush:0x26282c,bol:0x3a3d44,bolH:2.0,back:22,hw:9.5,head:'post',slide:1},recliner:{cush:0x24262a,bol:0x30333a,bolH:1.2,back:22,hw:9.5,head:'post'},bucket:{cush:0x1b1c1f,bol:0x0f1012,bolH:2.5,back:30,hw:9,head:'none',bucket:true}};
  const sp=byId('seats',cfg.seats||'ef-si'),look=Object.assign({},LOOKS[cfg.seats]||(sp&&sp.look&&LOOKS[sp.look.base])||{},sp&&sp.look||{});   // a universal seat: its look over its base shape
  const delRear=!!(byId('frame',cfg.frame||'stock')||{}).deletesRearSeat||!!(cfg.removed&&cfg.removed.rearSeat);
  for(const sd of [-1,1]){if(sd===-cp.side&&cfg.removed&&cfg.removed.passengerSeat)continue;P.seatMeshes.push(mk(RG.seat(look,sd*cp.H.z),matV,0,body));}   // the passenger's seat comes out with its rails (Take weight off)
  if(!delRear)P.seatMeshes.push(mk(RG.rearBench(build.r.body),matV,0,body));
  P.hiRef=build.r&&build.r.hi;   // v20: the body's 10 mm panels, for the Stage B-D helpers (nothing they place may float or overlap)
  stageBParts(cfg,body,P,cp,mk,matV);   // Stage B (SPEC-INTERIOR §1/§4/§6): the wall / plush parts for the rear and passenger areas, and the dash set — rebuilt with the seats
  stageCParts(cfg,body,P,cp,build.nosTb,mk,matV);
  stageDParts(cfg,body,P,cp,mk,matV);   // v20 Stage D: the drift handbrake and the mirror hanger, rebuilt with the seats   // Stage C (SPEC-INTERIOR §5): the nitrous bottle + bay hardware — rebuilt with the seats (the seats sig carries rearArea)
}
function setSteering(id){
  const d=byIdSafe('steering',id),look=id==='honda-itr'?{rim:0x141517,stitch:0xa32820,rimW:2.6}:(d.look||{});
  swapGeo(P.swm,genSteeringWheel(d.dia,look));
}
function setShifter(){const m=P.shifter&&P.shifter.children[0];if(m)swapGeo(m,genShifter(17,cfg));}   // Stage A (SPEC-INTERIOR §2): the fitted shifter's knob, swapped live
function setExhaust(id){const tip=byIdSafe('exhaust',id).tip;swapGeo(P.exh,buildExhaustEF(tip));if(P.exhTips)swapGeo(P.exhTips,genExhaustTips(tip,exhF()));}
// aero parts are built when first needed and kept hidden; parts on the hatch ride on it
const ADDON={
  frontlip:{p:'body',fn:()=>[efAeroFront(EG,build.bf.grid,'lip')]},
  splitter:{p:'body',fn:()=>[efAeroFront(EG,build.bf.grid,'splitter')]},
  hatchspoiler:{p:'hatch',fn:()=>[efAeroHatch(EG,build.r.hi.trunk,'spoiler',build.r.hi.glass.rw)]},
  gtwing:{p:'hatch',fn:()=>[efAeroHatch(EG,build.r.hi.trunk,'wing',build.r.hi.glass.rw)]},
  // bolt-on widebody flares: a 60 mm ring round each arch from its edge outward, 30 mm proud at the edge, blending into the panel (DESIGN, the fit rule's +30 mm)
  wide:{p:'body',fn:()=>[genFlares([build.r.hi.body,build.r.hi.doorL,build.r.hi.doorR],[build.bf.grid,build.bb.grid],{axles:[{x:EG.ARCH_F.x,y:EG.ARCH_F.y},{x:EG.ARCH_RR.x,y:EG.ARCH_RR.y}],R0:EG.ARCH_F.r+.3,band:3,out:1.5,jMin:21,col:PAINT,skip:(x,y)=>x<EG.DOOR_F+1.5&&x>EG.doorRear(Math.max(y,11))-1.5})]},
  // side skirts: 150-205 mm (30 mm under the 180 mm sill, under the doors' 221 mm bottom edge), between the arches
  skirts:{p:'body',fn:()=>[genSkirts([build.r.hi.body],{x0:EG.ARCH_RR.x+EG.ARCH_RR.r+.8,x1:EG.ARCH_F.x-EG.ARCH_F.r-.8,j0:15,j1:20,arches:[EG.ARCH_F,EG.ARCH_RR],col:PAINT,doors:[build.r.hi.doorL,build.r.hi.doorR]})]}
};
function lazyPart(name){
  if(P['part_'+name])return P['part_'+name];
  const A=ADDON[name],parent=A.p==='hatch'?P.trunk:body,grp=new THREE.Group();for(const b of A.fn())paintable(b,grp,undefined,.5,{seat:EG.solidAt});   // the EF's aero grids are 10 mm cells (mesh scale .5)
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
function coilGeo(front,col){const CO=EF_RIG.coil,DM=EF_RIG.damper,S=front?SU.front:SU.rear,lowOnBody=(S.springLow||.3)<DM.bodyFrac;
  return bufGeo(geoData(genCoil(CO.n,CO.R,CO.w,CO.turns,col,[front&&lowOnBody?DM.bodyR+.3:(front?DM.rodR+.5:DM.bodyR+.3),DM.rodR+.5]),0,0,0));}   // the rear damper reaches down to the lower arm, so its body runs up past the seat: the rear lower seat clears it
function setSprings(id){
  const col={stock:0xc4261f,hd:0xc4261f,sport:0x2a6fd6,cup:0x16171a,coil:0xe0b52a,air:0x3a3c41}[id];
  const gF=coilGeo(true,col),gR=coilGeo(false,col);
  for(const L of P.links){L.spring.geometry=L.nm[0]==='F'?gF:gR;}
}
function setWheels(){
  const w=cfg.wheel,ty=tyreFor(w.dia,w.width,w.tw,w.ar),zcF=(SH.hubFaceZ-w.et+(cfg.spacerF||0))/20,zcR=(SH.hubFaceZ-w.et+(cfg.spacerR||0))/20,br=byId('brakes',cfg.brakes);
  const tireG=bufGeo(geoData(buildTireP(ty.OD,ty.tw,w.dia,w.width),0,.03,0)),rimG=bufGeo(geoData(buildRimP(w.style,w.dia,w.width,w.et,'plain',{exact:1}),0,.03,0)),
        rotG=bufGeo(geoData(buildRotorP(br.rotor),0,.03,0)),calG=bufGeo(geoData(buildCaliperP(br.rotor,calType(br),1,calCol(br)),0,.03,0));
  for(const k in wheels){const W=wheels[k];W.tire.geometry=tireG;W.rim.geometry=rimG;W.rot.geometry=rotG;W.cal.geometry=calG;
    const sp=(W.steer?cfg.spacerF:cfg.spacerR)||0;W.off.position.z=W.sd*((W.steer?zcF:zcR)-KZ);W.rot.position.z=(w.et-sp)/20;W.cg.position.z=(w.et-sp)/20;   // a spacer moves the wheel out off the hub face; the rotor and caliper stay on the hub (C-08)
   W.kn.geometry=bufGeo(geoData(efKnuckle(W.sd,W.steer,br.rotor),0,.03,0));}   // the wheel's offset moves the wheel out from the fixed knuckle
  WY=(ty.OD/2-15)/20;phys.WR_M=ty.OD/2000;   // hub height = loaded radius (15 mm static deflection); the body rides up with a taller tyre (post())
}

const PRESETS=[
 ['Stock',c=>{}],
 ['B18C swap',c=>{Object.assign(c,{engine:'B18C1',swapkit:'kit-ef-b',gearbox:'EF9-5MT',exhaust:'catback',seats:'dc2-gsr',steering:'honda-itr',suspension:'stock',drop:0,brakes:'integra262'});c.wheel={style:'split',dia:15,width:6,et:45,pcd:'4x100',bore:56.1,tw:195,ar:55};}],
 ['K20 swap',c=>{Object.assign(c,{engine:'K20A2',swapkit:'kit-ef-k',gearbox:'K-X2M5',exhaust:'quad',seats:'bucket',steering:'honda-itr',suspension:'coil',drop:15,brakes:'integra262',aeroF:'splitter'});c.wheel={style:'mesh',dia:16,width:7,et:45,pcd:'4x100',bore:56.1};}],
 ['Weight-cut build',c=>{Object.assign(c,{engine:'B18C1',swapkit:'kit-ef-b',gearbox:'EF9-5MT',seats:'delsol-si',removed:{bumperF:1,bumperR:1,doorCards:1,rearSeat:1}});c.wheel={style:'star',dia:14,width:5.5,et:45,pcd:'4x100',bore:56.1,tw:195,ar:60};}]
];
function applyRemoved(){const R=cfg.removed||{};
  if(P.bumperF){P.bumperF.visible=!R.bumperF;if(P.plateF)P.plateF.visible=!R.bumperF;}
  if(P.bumperR){P.bumperR.visible=!R.bumperR;if(P.plateR)P.plateR.visible=!R.bumperR;}
  (P.doorCards||[]).forEach(m=>m.visible=!R.doorCards);
  // with the bumper removed the crash bar behind it shows
  for(const sg of [1,-1]){const key=sg>0?'crashF':'crashR',gone=sg>0?R.bumperF:R.bumperR;
    if(!P[key]&&gone){const C=EF_RIG.crash,hb=build.r.hi.body;let f=sg>0?-1e9:1e9;   // the body's outermost cell over the bar's face (10 mm cells), the bar's 20 mm cells start just beyond it
      for(const [i,j,k] of hb.list())if(j>=C.y0*2&&j<=C.y1*2&&Math.abs(k)<=C.half*2)f=sg>0?Math.max(f,i):Math.min(f,i);
      const face=sg>0?(f+.5)*.5:(f-.5)*.5;P[key]=mk(RG.crashBar(sg,sg>0?Math.round(face+.5):Math.round(face-.5)),matV,0,body);}   // the nearest 20 mm cell to the body's face: flush, or 5 mm into its skin where the grids sit a quarter cell apart
    if(P[key])P[key].visible=!!gone;}
}
return {
  id:'ef',title:'Honda Civic EF9 SiR',maxSteer:MAX_STEER,
  // body roll and pitch stop where the travel runs out (CALCULATED from the model): the arch must stay 15 mm above the tyre (60 % of the gap to roll, 40 % to pitch at the axle 1250 mm out),
  // and the rear tub wall, moving out by its height times the roll angle, must stay 5 mm from the tyre's inner face
  bodyLimits:c=>{const w=c.wheel,ty=tyreFor(w.dia,w.width,w.tw,w.ar),zc=SH.hubFaceZ-w.et+Math.max(c.spacerF||0,c.spacerR||0),hub=WR*20+(c.drop||0),top=hub+ty.OD/2,A=EF_M.arch;
    const gv=Math.min(A.f.y+A.f.r,A.r.y+A.r.r)-top-15,gl=zc-ty.tw/2-EF_M.tubR.zIn-5,as=v=>Math.asin(Math.max(0,Math.min(1,v)));
    return {roll:Math.min(as(gv*.6/zc),as(gl/top),4*Math.PI/180),pitch:Math.min(as(gv*.4/1250),2.5*Math.PI/180)};},   // and never more than 4 deg roll / 2.5 deg pitch (DESIGN: a soft stock car at the grip limit)
  tagline:'Drive it. Park it. Modify it.',paints:PAINTS,stages,pre,post,presets:PRESETS,trunkLabel:'Hatch',coverLabel:'Cover out',
  camOpens:{engine:{hood:1},interior:{doorR:1}},
  sigs:{wheels:c=>[c.wheel,c.brakes,c.spacerF,c.spacerR],engine:c=>[c.engine,c.gearbox,c.exhaust],seats:c=>[c.seats,c.shifter,c.handbrake,c.mirrorHang,c.trunk,c.rearArea,c.passArea,c.dashPlush,!!(byId('frame',c.frame)||{}).deletesRearSeat,!!(c.removed&&c.removed.rearSeat),!!(c.removed&&c.removed.passengerSeat)],steering:c=>c.steering,shifter:c=>c.shifter,exhaust:c=>c.exhaust,aero:c=>[...AERO_SLOTS.map(s=>c[s]),c.frame,!!(c.removed&&c.removed.bumperF)],suspension:c=>c.suspension,removed:c=>c.removed||{}},
  cockpit:()=>({eye:cp.eye,look:[60,48]}),
  sound:{cyl:4},
  camPresets:(psi,P2)=>({showroom:{az:psi+.9,el:.2,dist:300,ty:24,ox:0,oy:0,oz:0},front:{az:psi+P2,el:.12,dist:300,ty:24,ox:0,oy:0,oz:0},rear:{az:psi-P2+.35,el:.16,dist:300,ty:26,ox:-6,oy:0,oz:0},
    engine:{az:psi+P2+.35,el:.95,dist:180,ty:24,ox:62,oy:0,oz:0},wheels:{az:psi+.25,el:.1,dist:140,ty:15,ox:60,oz:34},interior:{az:psi-.5,el:.6,dist:180,ty:36,ox:4,oy:0,oz:8},under:{az:psi+.7,el:.03,dist:230,ty:8,ox:0,oy:0,oz:0}}),
  apply:{wheels:()=>setWheels(),engine:()=>{setEngine(cfg.engine,cfg.gearbox);setExhaust(cfg.exhaust);},seats:()=>setSeats(),steering:()=>setSteering(cfg.steering),shifter:()=>setShifter(),exhaust:()=>setExhaust(cfg.exhaust),aero:()=>setAero(cfg),suspension:()=>setSprings(cfg.suspension),removed:applyRemoved},
  onLoaded:()=>{}
};
};
