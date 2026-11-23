/* ===== CAR MODULE: BMW E30 325i, coupe and Touring. The approved exterior, interior and mechanical rig, packaged for the garage shell; the Touring (1988-94)
   is the same car with the body variant's rear doors, tailgate and load bay (e30_core.js setE30Variant), built by the same code with TOUR branches.
   The shell (garage_app.js) owns the renderer, physics, camera, shop UI and saves; this module builds the car and animates it. ===== */
function makeE30Car(V){return function(G){
'use strict';
setE30Variant(V);const TOUR=V==='touring',SID=TOUR?'e30t':'e30';
const {mkFrameSeals,THREE,scene,camera,carRoot,body,P,wheels,MIRRORS,state,anim,phys,keys,mk,paintable,mkGlass,mkPane,mkGlassSheet,SKIN,group,bufGeo,makeMirror,swapGeo,matPaint,matV,matGlass,matMirror,matMirrorPaint,matHead,matTailRed,matTailAmb,matTailWht,matFrontAmb,cfg,D2R,clamp,lerp,V3,Q,yAxis,zAxis,segTo,bodyM,bodyPt,build,$}=G;
// [name, colour, finish]: E30-era BMW colours (names from BMW's paint charts; the colours are approximations on screen); 'metallic' paints get the metallic finish
const PAINTS=[['Henna red',0xb3221e],['Diamond black',0x101216,'metallic'],['Alpine white',0xe6e6e1],['Lachs silver',0x9aa0a6,'metallic'],['Misano blue',0x1d4fa8,'metallic'],['Delphin grey',0x666d74,'metallic'],['Sunburst yellow',0xdcae2a],
  ['Brilliant red',0xc4161c],['Zinnober red',0xc8361e],['Macao blue',0x1f3554,'metallic'],['Royal blue',0x23397a,'metallic'],['Malachite green',0x1d3b2c,'metallic'],['Granite silver',0x7d8186,'metallic'],['Sterling silver',0xb3b6b8,'metallic']];
const SHAKE_SLOW=.2,CRANK_SLOW=.035,ACC={alt:6/3.5,fan:6/5};   // display slow-motion factors (declared); accessory ratios = crank pulley radius / driven pulley radius (as drawn)
// steering lock (STEER-03): the 325i's 10.5 m turning circle (auto-data.net, 325i E30 facelift: 10.5 m; e30zone wiki 325i: 34.4 ft), wheelbase 2570, front
// track 1407 (auto-data.net). The Eclipse's verified order: the outer radius less the half-track first gives the front axle's centre, 4546.5 mm; the rear
// axle's centre then turns on sqrt(4546.5^2-2570^2) = 3750.4 mm, so the bicycle angle is atan(2570/3750.4) = 0.6007 rad (34.4 deg). With the rack's 4 turns
// that is 20.9:1, against the 20.5:1 published. (The garage used a generic 0.52 rad, 29.8 deg, before.)
const E30_LOCK=Math.atan(2570/Math.sqrt(Math.pow(5250-1407/2,2)-2570*2570));
let WY=15;
const EG30=makeE30Shell(),RG=makeRig(EG30,E30_RIG),cp=E30_RIG.cp,DS=E30_RIG.dash,CT=E30_RIG.console;
const PW=E30_RIG.power,SHE=SHELLS[SID],SU=E30_SUSP,KZ=(SHE.hubFaceZ-SHE.stockET)/20-5,KZR=KZ+((SHE.hubFaceZR||SHE.hubFaceZ)-SHE.hubFaceZ)/20;   // KZR: the rear corner (the rear track is 8 mm wider than the front)
  //   // KZ: the steering axis, 100 mm inboard of the stock wheel's centre plane (as the EF's); the lower ball joint on it
// the cabin furniture with notches where a cage's front tubes pass through the dash (as in real cage installs)
function e30Interior(frame){const g=RG.interior();
  g.carve((x,y,z)=>Math.abs(z)<=9&&x>=16.5&&x<=46&&y<=28.5);
  g.carve((x,y,z)=>x>=DOOR_R-1&&x<=DOOR_F+1.5&&y<=BELT+.5&&Math.abs(z)>=halfAt(x,Math.min(Math.max(y,DOOR_B),BELT))-6);   // nothing of the cabin trim inside the doors' swing   // nothing of the console below the bellhousing hump's top (the gearbox is in the tunnel under it)
  if(TOUR){const RF=wxm(E30M.touring.rdFront);g.carve((x,y,z)=>x>=wxm(E30M.touring.rdRearBelt)-1&&x<=RF+1&&y<=BELT+1.5&&Math.abs(z)>=halfAt(x,Math.min(Math.max(y,DOOR_B),BELT))-6);}   // and the rear doors' (Touring)
  if(frame&&frame!=='stock'){const cut=cageNotch(frame);g.carve(cut);}   // a cage's tubes pass through notches in the dash and the carpet (as in real installs)
  return g;}
function e30DashDetail(frame){const g=RG.dashDetail();if(frame&&frame!=='stock'){const cut=cageNotch(frame),o=RG.dashDetailPos;for(const [i,j,k] of g.list())if(cut(i/2+o[0],j/2+o[1],k/2+o[2]))g.set(i,j,k,-1);}return g;}
const turnPhase=()=>Math.floor(state.t*1.5)%2===0;
const TG_SWING=80,RD_SWING=66;   // Touring: the tailgate lifts 80 deg about its roof hinges, the rear doors swing 66 deg (DESIGN)
// the door glass lowered in steps of 40 mm along its own surface: each cell moves down and takes the pane's outer z at its new height (rows that leave the glass's
// own height range are inside the door and not drawn)
function glassSteps(G,sd){const outer=new Map(),bottom=new Map(),K=(i,j)=>i+','+j;
  for(const [i,j,k] of G.list()){const a=Math.abs(k),key=K(i,j);if(!outer.has(key)||a>outer.get(key))outer.set(key,a);if(!bottom.has(i)||j<bottom.get(i))bottom.set(i,j);}
  const out=[];for(let s=0;s<=10;s++){const T=s*4,N=new Grid(G.x0,G.x1,G.y0,G.y1,G.z0,G.z1);
    for(const [i,j,k,v] of G.list()){const r=j-T;if(r<bottom.get(i))continue;const kn=outer.get(K(i,r));if(kn===undefined)continue;N.set(i,r,sd*(kn-(outer.get(K(i,j))-Math.abs(k))),v);}
    out.push(N);}
  return out;}
const stages=[];
function stage(label,fn){stages.push([label,fn]);}
stage('Shaping the body panels',()=>{
  setE30Variant(V);   // the coupe and the Touring share the body tables: this car's are set before anything is built
  const FLANK=.4;   // the flanks' cube faces lean 40 % toward the panel's real surface: the side's curvature shades (depth), the 10 mm terraces stay
  PCA_R=PAINT_PCA_R;   // smooth paint (e30_core.js PAINT_PCA_R, owner Nov 13); was 0:   // the voxel look of the EF (the owner's call): cube faces shaded as cubes on the flanks, so the 10 mm terraces read as the car's real dimensions
  SKIN.mode=(typeof location!=='undefined'&&/skin=net/.test(location.search))?'net':'voxel';   // voxel panels like the EF (the owner's choice); ?skin=net draws them as smooth skins on the measured surface
  const r=buildE30Body();build.r=r;const H=r.hi;   // H: the 10 mm panels that are drawn (mesh scale .5); r.body ... are the same panels at 20 mm for fitting and collision
  const RDs=TOUR?[H.doorRL,H.doorRR]:[],GL_=Object.values(H.glass),SM={body:[H.hood,H.trunk,H.doorL,H.doorR,...RDs,...GL_],hood:[H.body,H.doorL,H.doorR,...GL_],trunk:[H.body,...RDs,...GL_],doorL:[H.body,H.hood,H.trunk,H.doorR,...RDs,...GL_],doorR:[H.body,H.hood,H.trunk,H.doorL,...RDs,...GL_]};
  if(TOUR){SM.doorRL=[H.body,H.trunk,H.doorL,H.doorR,H.doorRR,...GL_];SM.doorRR=[H.body,H.trunk,H.doorL,H.doorR,H.doorRL,...GL_];}   // neighbouring panels close each panel's shut lines for shading
  // windshield and rear window panes first: the panels round them are cut back to their straightened outlines before the panels are drawn (glass_trim.js)
  // voxel panels: the glass is a sheet on the measured surface over exactly its own cells' columns (the opening in the panels), the panels keep their one-cell
  // rubber ring round it, nothing is cut; smooth skins: a straight-edged pane in a seal ribbon, the panels cut back to its outline and their cells under the
  // seal turned to rubber. Both: the pane frame (gp) carries the wipers on the same measured surface.
  const VOX=SKIN.mode!=='net',GL_LIFT=VOX?.1:undefined;
  const gpWS=glassPane(H.glass.ws,{bodies:[H.body,H.hood],rLo:1.5,rHi:4,surf:bodySurfIn,lift:GL_LIFT}),gpRW=glassPane(H.glass.rw,{bodies:[H.body,H.trunk],rLo:1.5,rHi:4,surf:bodySurfIn,lift:GL_LIFT});
  if(!VOX){fitPaneToPanels(gpWS,H.glass.ws,[H.body]);fitPaneToPanels(gpRW,H.glass.rw,[H.body,H.trunk]);
    sealBand(gpWS,[H.body],{paint:PAINT,old:0x131416});sealBand(gpRW,[H.body,H.trunk],{paint:PAINT,old:0x131416});}
  repaintExposed(H.body,bodySurfIn,[0x2a2b2e]);
  const body0=paintable(H.body,body,undefined,.5,{o:SM.body,wy:[.45,.8],flank:FLANK,snap:bodySurfIn});P.bodyMesh=body0;   // snap: the skin is drawn ON the measured surface (surfnet.js)
  // hood
  const HX=HOOD_X0,HY=topY(HOOD_X0)+.8,TX=TRUNK_X0,TY=topY(TRUNK_X0)+.8;   // hinges 16 mm above the panels' edges at the cowl and at the rear window's base
  const hh=group(body,HX,HY,0);const hm=paintable(H.hood,hh,undefined,.5,{o:SM.hood,wy:[.45,.8],flank:FLANK,snap:bodySurfIn});hm.position.set(-HX,-HY,0);P.hood=hh;
  const th=group(body,TX,TY,0);const tm=paintable(H.trunk,th,undefined,.5,{o:SM.trunk,wy:[.45,.8],flank:FLANK,snap:bodySurfIn});tm.position.set(-TX,-TY,0);P.trunk=th;
  // doors (hinge at front edge)
  const doorMesh={};for(const sd of [-1,1]){
    const DF=DOOR_F,hz=sd*41,dg=group(body,DF,0,hz),DG=sd<0?H.doorL:H.doorR,dm=paintable(DG,dg,undefined,.5,{o:sd<0?SM.doorL:SM.doorR,wy:[.45,.8],flank:FLANK,snap:bodySurfIn});dm.position.set(-DF,0,-hz);doorMesh[sd<0?'L':'R']=dm;
    // door glass: winding it down slides the pane down along its own curved surface, 0..400 mm in 11 steps; the part inside the door runs in its cavity and is not drawn (as the EF's)
    P['door'+(sd<0?'L':'R')]=dg;
    // door mirror: sail plate seated INTO the door and A-pillar skin (read from the skin, per cell), short thick arm, rounded housing with the glass facing rearward
    const skinZ=(x,y)=>{const I=Math.round(x*2),J=Math.round(y*2);for(let k=88;k>=0;k--)if(DG.get(I,J,sd*k)>=0||H.body.get(I,J,sd*k)>=0)return k/2;return 0;};
    const mr=buildDoorMirror(sd,skinZ);
    for(const G of [mr.shell,mr.plate,mr.housing])for(const [i,j,k] of G.list())if(H.body.get(i,j,k)>=0)G.set(i,j,k,-1);   // the sail is seated into the door's skin only: where the skin under it is the A-pillar's root (the body), it sits on it
    let mSelf;{const ms=paintable(mr.shell,dg,undefined,.5,{seat:bodySurfIn});ms.position.set(-DF,0,-hz);const mg=mk(mr.glass,matMirror,0,dg,.5);if(mg)mg.position.set(-DF,0,-hz);mSelf=[ms,mg].filter(Boolean);}   // smooth skin, the sail plate seated on the door skin
    MIRRORS.push(makeMirror(dg,new THREE.Vector3(mr.glassCenter[0]-DF,mr.glassCenter[1],mr.glassCenter[2]-hz),mr.glassSize[0],mr.glassSize[1],'door'+(sd<0?'L':'R'),-sd*(sd===cp.side?12:14)*D2R,mSelf));   // adjusted toward the driver: 12 degrees on his side, 14 on the far side (a sliver of the flank on the inboard edge)   // live glass over the voxel glass
    {const Gl=sd<0?H.glass.dgL:H.glass.dgR;for(const [i,j,k] of Gl.list())if(DG.get(i,j,k)>=0||mr.shell.get(i,j,k)>=0)Gl.set(i,j,k,-1);}   // the pane stops at the door's top rail and the mirror's sail
    P['dglass'+(sd<0?'L':'R')]=glassSteps(sd<0?H.glass.dgL:H.glass.dgR,sd).map((Gd,i)=>{const m=mkGlass(Gd,'side',dg,.5);if(m){m.position.set(-DF,0,-hz);m.visible=i===0;}return m;});
    // interior door card with armrest, pocket, speaker, switches and release lever; it rides on the door
    const dc=mk(genDoorCard(sd,DG,{x0:DOOR_R+2,x1:DOOR_F-2.5,y0:E30_RIG.doorCard.y0,y1:BELT-1.2,trim:0x575b63,hi:1}),matV,0,dg,.5);if(dc){dc.position.set(-DF,0,-hz);(P.doorCards=P.doorCards||[]).push(dc);}
    // handle: its base is seated on the skin where the handle stands (read from the skin)
    const hx=-5,hy=BELT-3.6,hs=skinZ(hx,hy),hd=mk(buildHandle(),matV,0,dg);hd.position.set(-5-DF,hy,sd*(hs-.2)-hz);hd.rotation.y=sd>0?-Math.PI/2:Math.PI/2;if(sd<0)hd.position.x=-12-DF;   // 70 mm under the belt near the door's rear edge
  }
  // the Touring's rear doors (hinged at their front edge on the B-pillar): drop glass winding down in its cavity like the front's, the fixed pane behind the bar,
  // a door card and the handle 70 mm under the belt at the door's rear edge
  if(TOUR)for(const sd of [-1,1]){const T=E30M.touring,RF=wxm(T.rdFront),hz=sd*41,rg=group(body,RF,0,hz),DG=sd<0?H.doorRL:H.doorRR,S2=sd<0?'L':'R';
    const dm=paintable(DG,rg,undefined,.5,{o:SM['doorR'+S2],wy:[.45,.8],flank:FLANK,snap:bodySurfIn});dm.position.set(-RF,0,-hz);P['rdoor'+S2]=rg;doorMesh['R'+S2]=dm;
    const Gl=H.glass['rg'+S2];for(const [i,j,k] of Gl.list())if(DG.get(i,j,k)>=0)Gl.set(i,j,k,-1);
    P['rglass'+S2]=glassSteps(Gl,sd).map((Gd,i)=>{const m=mkGlass(Gd,'side',rg,.5);if(m){m.position.set(-RF,0,-hz);m.visible=i===0;}return m;});
    const vg=mkGlass(H.glass['rv'+S2],'side',rg,.5);if(vg)vg.position.set(-RF,0,-hz);P['rvent'+S2]=vg;
    const rb=wxm(T.rdRearBelt),AR=u(T.rdArch)+1.5,xMin=y=>Math.max(rb+2,ARCH_RR.x+Math.sqrt(Math.max(0,AR*AR-(y-ARCH_RR.y)**2)));   // the card stops 30 mm short of the door's edge round the arch
    const dc=mk(genDoorCard(sd,DG,{x0:rb+2,x1:RF-2,y0:E30_RIG.doorCard.y0,y1:BELT-.6,trim:0x575b63,hi:1,xMin}),matV,0,rg,.5);if(dc){dc.position.set(-RF,0,-hz);(P.rdoorCards=P.rdoorCards||[]).push(dc);}
    const skinZ=(x,y)=>{const I=Math.round(x*2),J=Math.round(y*2);for(let k=88;k>=0;k--)if(DG.get(I,J,sd*k)>=0)return k/2;return 0;};
    const hx=rb+8.5,hy=BELT-3.4,hs=skinZ(hx-3.5,hy),hd=mk(buildHandle(),matV,0,rg);hd.position.set(hx-RF,hy,sd*(hs-.2)-hz);hd.rotation.y=sd>0?-Math.PI/2:Math.PI/2;if(sd<0)hd.position.x=hx-7-RF;}   // the 140 mm handle ends 30 mm ahead of the door's rear edge
  if(VOX)P.frameSeals=mkFrameSeals([{g:H.body,grp:body0},{g:H.doorL,grp:doorMesh.L},{g:H.doorR,grp:doorMesh.R},{g:H.trunk,grp:tm},{g:H.hood,grp:hm},...(TOUR?[{g:H.doorRL,grp:doorMesh.RL},{g:H.doorRR,grp:doorMesh.RR}]:[])],Object.values(H.glass),{fenceGlass:[H.glass.ws]});   // smooth rubber lines on the window frames (frame_seal.js, owner Nov 13)
  // fixed glass
  const g=H.glass;   // windshield and rear window: straight-edged panes with tight corners in their black rubber seals (glass_trim.js; corner radii from photographs)
  const rwP=TOUR?P.trunk:body;   // the Touring's rear glass rides on the tailgate
  if(VOX){const ws=mkGlassSheet(g.ws,body,.5,bodySurfIn,undefined,[H.body]),rw=mkGlassSheet(g.rw,rwP,.5,bodySurfIn,undefined,[H.body,H.trunk]);if(TOUR&&rw)rw.position.set(-TX,-TY,0);P.paneWS={pane:ws,gp:gpWS,meshes:[ws]};P.paneRW={pane:rw,gp:gpRW,meshes:[rw]};}
  else{P.paneWS=mkPane(g.ws,body,.5,{gp:gpWS});P.paneRW=mkPane(g.rw,rwP,.5,{gp:gpRW});if(TOUR&&P.paneRW.pane)P.paneRW.pane.position.set(-TX,-TY,0);}
  P.glassWS=P.paneWS.pane;P.glassRW=P.paneRW.pane;
  P.glassQL=mkGlass(g.qgL,'side',body,.5);P.glassQR=mkGlass(g.qgR,'side',body,.5);
});
stage('Fitting bumpers, lamps and trim',()=>{
  const bfG=bumperFront(),brG=bumperRear();build.bfHi=bfG;build.brHi=brG;P.bumperF=paintable(bfG,body,undefined,.5,{seat:bodySurfIn});P.bumperR=paintable(brG,body,undefined,.5,{seat:bodySurfIn});   // 1988-91 bumpers: body-colour plastic with black inserts (front valance body colour, black chin spoiler)
  for(const sd of [-1,1]){
    const h=mk(buildHeadlamp(sd),matHead,0,body,.5);h.position.set(HEAD_POS[0],HEAD_POS[1],sd*HEAD_POS[2]);
    (P.head=P.head||[]).push(h);
    const k=mk(buildKidneyFitted(build.r,sd),matV,0,body,.5);k.position.set(KID_POS[0],KID_POS[1],sd*KID_POS[2]);(P.kidneys=P.kidneys||[]).push(k);   // notched around the hood roundel
    const t=buildTaillamp(sd),tf=mk(t.frame,matV,0,body,.5);tf.position.set(TAIL_POS[0],TAIL_POS[1],sd*TAIL_POS[2]);(P.tailFrames=P.tailFrames||[]).push(tf);
    const tr=mk(t.red,matTailRed,0,body,.5),ta=mk(t.amb,matTailAmb,0,body,.5),tw=mk(t.wht,matTailWht,0,body,.5);
    for(const m of [tr,ta,tw])m.position.copy(tf.position);
    (P.tailRed=P.tailRed||[]).push(tr);(P.tailAmb=P.tailAmb||[]).push(ta);(P.tailWht=P.tailWht||[]).push(tw);
  }
  // front indicators and fog lamps sit in recesses cut in the bumper (lens faces flush with the bumper face)
  for(const L of frontLamps()){const m=mk(L.lens(),L.kind==='indicator'?matFrontAmb:matV,0,body,.5);m.position.set(...L.pos);if(L.kind==='indicator')(P.frontAmb=P.frontAmb||[]).push(m);else (P.fogs=P.fogs||[]).push(m);}
  const pf=mk(buildPlate(true),matV,0,body,.5);pf.position.set(...PLATE_F);P.plateF=pf;
  const pr=mk(buildPlate(false),matV,0,TOUR?P.trunk:body,.5);pr.position.set(...PLATE_R);if(TOUR){const TX=TRUNK_X0,TY=topY(TRUNK_X0)+.8;pr.position.x-=TX;pr.position.y-=TY;}P.plateR=pr;   // the Touring's plate is on its tailgate
  // badges, flap and markers are placed on MEASURED surfaces (ray cast onto the painted metal), never at guessed coordinates; their grids are absolute 10 mm cells
  const BG=buildBadges(build.r);for(const it of BG)for(const [i,j,k] of it.grid.list())if(build.r.hi.body.get(i,j,k)>=0)it.grid.set(i,j,k,-1);build.badgeGrids=BG.map(it=>it.grid);P.badges=[];for(const it of BG){const onLid=/^badge-(trunk|325i)/.test(it.id),m=mk(it.grid,matV,0,onLid?P.trunk:body,.5);if(m){if(onLid)m.position.set(-TRUNK_X0,-(topY(TRUNK_X0)+.8),0);else m.position.set(0,0,0);P.badges.push(m);}}   // the roundel and the model badge ride on the trunk lid
});
stage('Mounting the engine bay',()=>{
  // engine-bay furniture, the engine (tilted to the right about its crank) with its gearbox, accessories, belt and pulleys, the engine arms on the axle carrier;
  // under the body: axle carrier, rack, rear sub-frame, fuel tank; driveshaft in two halves on its centre bearing, final drive; exhaust from the manifolds to the tip
  P.bay=mk(genBayE30({fan:null}),matV,0,body,.5);
  const eg=group(body,PW.x,PW.crankY,0);P.engGroup=eg;P.engine=eg;
  P.crankP=group(eg);P.altP=group(eg);P.fan=group(eg);
  P.hoses=new THREE.Mesh(new THREE.BufferGeometry(),matV);P.hoses.scale.setScalar(.5);body.add(P.hoses);
  P.mounts=new THREE.Mesh(new THREE.BufferGeometry(),matV);P.mounts.scale.setScalar(.5);body.add(P.mounts);
  build.underG=genUnderE30(solidOf([build.r.hi.body],[]));P.under=mk(build.underG,matV,0,body,.5);build.underNotch=false;
  P.diff=mk(genDiffE30(),matV,0,body,.5);
  P.ds=[0,1].map(i=>{const g=group(body),m=mk(genShaftE30(70,i===0),matV,0,g);return {nm:i?'DSR':'DSF',g,m};});
  P.cbear=new THREE.Mesh(new THREE.BufferGeometry(),matV);P.cbear.scale.setScalar(.5);body.add(P.cbear);
  P.driveshaft=P.ds[0].m;
  setEngine(cfg.engine||'M20B25',cfg.gearbox||'G260');
  {const tip=(byId('exhaust',cfg.exhaust||'stock')||{tip:'stock'}).tip;P.exh=mk(genExhaust(EG30,tip,exhF()),matV,0,body);P.exhTips=mk(genExhaustTips(tip,exhF()),matV,0,body,.5,.02);}
});
stage('Furnishing the cabin',()=>{
  // cabin from the generic builders (the EF's), with the E30's own numbers (e30_rig.js): carpet on the floor pan, tunnel console, dash with the binnacle and centre stack, column
  P.interior=mk(e30Interior('stock'),matV,0,body);P.interiorCage='stock';
  {const dd=mk(e30DashDetail('stock'),matV,0,body,.5,.03);dd.position.set(...RG.dashDetailPos);P.dashDetail=dd;}   // centre stack, radio, heater controls, console, handbrake, glovebox (10 mm detail)
  // steering wheel (turns with the road wheels)
  const W0=cp.wheel,sw=group(body,W0.x,W0.y,W0.z);sw.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),new THREE.Vector3(...W0.n).normalize());
  // interior mirror and sun visors, all hung from the headliner (e30_detail.js)
  {const im=buildInteriorMirror(build.r);const a=mk(im.shell,matV,0,body,.5),b=mk(im.glass,matMirror,0,body,.5);a.position.set(...im.pos);b.position.set(...im.pos);P.imirror=[a,b];P.visors=[];
   MIRRORS.push(makeMirror(body,new THREE.Vector3(...im.glassCenter),im.glassSize[0],im.glassSize[1],'interior',cp.side*9*D2R,[a,b]));build.imRoof=im;P.imirrorM=MIRRORS[MIRRORS.length-1];P.imirrorBar=false;   // tilted 9 degrees toward the driver
   for(const sd of [-1,1]){const v=buildVisor(build.r,sd),vm=mk(v.grid,matV,0,body,.5);vm.position.set(...v.pos);P.visors.push(vm);}}
  const swi=group(sw,0,0,0);const swm=mk(buildSteeringWheelV(380,'stock'),matV,0,swi,.5);swm.position.set(0,0,-.75);P.swheel=swi;P.swm=swm;
  {const bz=Math.round(-E30_RIG.columnGap*2)-1,bg=new Grid(-3,3,-3,3,bz,-2);bg.fill((x,y,z)=>Math.hypot(x,y)<=2.4?0x1a1b1d:-1);P.swBoss=mk(bg,matV,0,swi,.5);}   // the wheel's hub boss on the column's shaftsetSeats('stock',false);
  // gauges on the binnacle face in front of the driver: speedometer left, tachometer right (E30 layout), 80 mm dials
  for(const [z,name,mark] of [[cp.H.z*cp.side-4.5,'speedo',12],[cp.H.z*cp.side+4.5,'tach',7]]){
    const f=mk(buildGaugeFace(4,mark),matV,0,body,.5);f.position.set(DS.rearX-1.5,DS.top+1.5,z);(P.gaugeFaces=P.gaugeFaces||[]).push(f);
    const nd=group(body,DS.rearX-1.7,DS.top+1.5,z);const nm=mk(buildNeedle(3.5),matV,0,nd,.5);nm.rotation.z=Math.PI/2;P[name]=nd;
  }
  // hanging pedals on their pivot shaft and its brackets (pad sizes in e30_rig.js)
  cp.pedals.forEach(([n,z,w,h])=>{const pg=group(body,cp.pedalX,cp.pedalY,z);mk(genPedal(w,h,cp.pedalLen),matV,0,pg,.5);P['ped_'+n]=pg;});
  {const zs=cp.pedals.map(p=>p[1]);P.pedalBox=mk(genPedalBox(cp.pedalX,cp.pedalY,Math.min(...zs)-3,Math.max(...zs)+3,solidOf([build.r.hi.body],[P.interior.geometry.userData.src])),matV,0,body,.5);}
  // shifter: pivot just under the shift boot on the console's top; knob 170 mm above it
  const sh=group(body,cp.shifter.x,cp.shifter.y+.5,0);mk(genShifter(17,cfg),matV,0,sh,.5,.02);P.shifter=sh;
  // wipers (LHD): the driver's pivot 360 mm left of the centreline, the passenger's 40 mm right of it, both on the cowl 22 mm under the glass's lower edge;
  // parked toward the passenger side, the driver's blade higher on the glass than the passenger's; 400 mm arms, 440 / 380 mm blades (DESIGN after photographs:
  // the passenger blade's tip stops short of the right A-pillar). The blades lie on the glass (glass_trim.js wiperRig).
  {const sd=cp.side;P.wiperRig=wiperRig(P.paneWS.gp,body,[{pivot:sd*36,park:5,arm:40,blade:44,sweep:72,dir:-sd},{pivot:-sd*4,park:3,arm:40,blade:38,sweep:66,dir:-sd}],.5);P.wipers=[];P.wiperPivots=[];}
  // the Touring's roller load cover (standard, unixnerd): its cassette across the rear seat's back under the backrest's top, the blind drawn back at the belt to its
  // hooks on the D-pillars (x -90), between the load bay's side trims; 'Cover out' rolls it away
  if(TOUR){const B=build.r.hi.body,g=new Grid(-182,-118,82,92,-62,62),j=89;
    for(let i=-180;i<=-124;i++)for(const sd of [-1,1])for(let K=sd>0?1:0;K<=60;K++){const k=sd*K;if(B.get(i,j,k)>=0||B.get(i,j+1,k)>=0||B.get(i,j-1,k)>=0)break;g.set(i,j,k,i<=-179?0x8d9298:0x232427);}   // the blind, its aluminium pull bar at the back
    for(let i=-125;i<=-121;i++)for(let jj=84;jj<=88;jj++)for(let k=-52;k<=52;k++){if(B.get(i,jj,k)>=0)continue;if((i===-125||i===-121)&&(jj===84||jj===88))continue;g.set(i,jj,k,0x1b1c1e);}   // the cassette
    P.cover=mk(g,matV,0,body,.5);}
  // the Touring's rear wash/wipe (standard, unixnerd): one arm from a pivot under the glass's lower edge on the centreline, parked along the lower edge, on the tailgate
  if(TOUR&&P.paneRW&&P.paneRW.gp){const TX=TRUNK_X0,TY=topY(TRUNK_X0)+.8,rg=group(P.trunk,-TX,-TY,0);P.wiperRigR=wiperRig(P.paneRW.gp,rg,[{pivot:0,park:2.5,arm:36,blade:36,sweep:150,dir:1}],.5);}
});
stage('Assembling wheels and suspension',()=>{
  const w0=cfg.wheel||SHELLS.e30.stock.wheel,ty0=tyreFor(w0.dia,w0.width,w0.tw,w0.ar),zc0=(SHE.hubFaceZ-(w0.et!==undefined?w0.et:35))/20;
  const tireG=bufGeo(geoData(buildTireP(ty0.OD,ty0.tw,w0.dia,w0.width),0,.03,0)),rotG=bufGeo(geoData(buildRotorP(260),0,.03,0)),calG=bufGeo(geoData(buildCaliperP(260,'stock',1),0,.03,0));
  P.rim={mesh:bufGeo(geoData(buildRimP(w0.style||'bottlecap',w0.dia,w0.width,w0.et,'bmw',{exact:1}),0,.03,0))};
  P.rimMeshes=[];
  // c: on the kingpin (steers), off: out to the wheel's centre plane, fl: the wheel (mirrored on the left), sp: spins; the knuckle (front: strut housing; rear: the
  // semi-trailing arm's hub carrier) rides in st and does not spin
  const hub=(name,x,sd,steer)=>{
    const c=group(carRoot,x,WR,sd*(steer?KZ:KZR)),cb=group(c,0,-5.5,0),st=group(cb,0,5.5,0),off=group(st,0,0,sd*(zc0+((steer?cfg.spacerF:cfg.spacerR)||0)/20-KZ)),fl=group(off);if(sd<0)fl.rotation.y=Math.PI;
    const sp=group(fl);
    const tire=new THREE.Mesh(tireG,matV);tire.scale.setScalar(.5);sp.add(tire);
    const rim=new THREE.Mesh(P.rim.mesh,matV);rim.scale.setScalar(.5);sp.add(rim);P.rimMeshes.push(rim);
    const rot=new THREE.Mesh(rotG,matV);rot.scale.setScalar(.5);sp.add(rot);
    const cg=group(fl);cg.rotation.z=sd<0?Math.PI:0;const cal=new THREE.Mesh(calG,matV);cal.scale.setScalar(.5);cg.add(cal);
    const kn=new THREE.Mesh(bufGeo(geoData(e30Knuckle(sd,steer,260),0,.03,0)),matV);kn.scale.setScalar(.5);st.add(kn);
    wheels[name]={c,cb,st,off,sp,sd,steer,tire,rim,rot,cal,cg,kn};   // cb: camber (knuckle and wheel turn about the lower ball joint, 110 mm under the hub)
  };
  hub('FL',AX_F,-1,true);hub('FR',AX_F,1,true);hub('RL',AX_R,-1,false);hub('RR',AX_R,1,false);
  {const D=SU.rear.damper,B=build.r.hi.body,i=Math.round(D.x*2),k=Math.round(D.z*2);let j=Math.round(24*2);while(j<140&&B.get(i,j,k)<0)j++;P.damperTop=j/2-.25;}   // the rear dampers' top mounts on the underside of the wheelhouse roof (measured)
  // links: front lower arms (two legs to the ball joint), tie rods, struts with their springs; rear semi-trailing arms (two legs), springs, dampers, half-shafts
  const LK=E30_RIG.links,DM=E30_RIG.damper,RD=E30_RIG.rdamper,
        armG=bufGeo(geoData(genLink(LK.n,LK.arm,0x2b2e33),0,0,0)),rodG=bufGeo(geoData(genLink(LK.n,LK.rod,0x3a3d42),0,0,0)),trG=bufGeo(geoData(genLink(LK.n,LK.trail,0x34373c),0,0,0)),
        strG=bufGeo(geoData(genDamper(DM.n,DM.bodyR,DM.rodR,DM.bodyFrac),0,0,0)),rdG=bufGeo(geoData(genDamper(RD.n,RD.bodyR,RD.rodR,RD.bodyFrac),0,0,0)),
        hsG=bufGeo(geoData(genHalfShaftE30(LK.n),0,0,0)),webG=bufGeo(geoData(genLink(8,LK.trail,0x34373c),0,0,0)),padG=bufGeo(geoData(genLink(4,SU.rear.spring.pad*2,0x2a2c30),0,0,0));
  P.links=[];
  const mkSeg=(geo,mat)=>{const m=new THREE.Mesh(geo,mat||matV);carRoot.add(m);return m;};
  for(const nm of ['FL','FR','RL','RR']){
    const L={nm,legA:mkSeg(nm[0]==='F'?armG:trG),legB:mkSeg(nm[0]==='F'?armG:trG),strut:mkSeg(nm[0]==='F'?strG:rdG),spring:mkSeg(coilGeo(nm[0]==='F'))};
    if(nm[0]==='F')L.rod=mkSeg(rodG);else{L.shaft=mkSeg(hsG);L.pad=mkSeg(padG);L.legC=mkSeg(webG);}
    P.links.push(L);
  }
  // under-car shadow
  const sg=new THREE.Mesh(new THREE.PlaneGeometry(300,140),G.shadowMat());
  sg.rotation.x=-Math.PI/2;sg.position.set(2,.25,0);carRoot.add(sg);
  // headlight beams
  for(const sd of [-1,1]){const sl=new THREE.SpotLight(0xfff0cf,0,1400,.5,.55,1);sl.position.set(104,32,sd*27);carRoot.add(sl);const tg=new THREE.Object3D();tg.position.set(500,6,sd*27);carRoot.add(tg);sl.target=tg;(P.beams=P.beams||[]).push(sl);}
});
/* ---------- per-frame animation ---------- */
function pre(dt){
  // openables ease toward targets
  const ease=(k,tg,sp)=>{anim[k]+=(tg-anim[k])*Math.min(1,dt*sp);return anim[k];};
  P.doorL.rotation.y=-ease('doorL',state.doorL,6)*64*D2R;P.doorR.rotation.y=ease('doorR',state.doorR,6)*64*D2R;
  P.hood.rotation.z=ease('hood',state.hood,4)*62*D2R;P.trunk.rotation.z=-ease('trunk',state.trunk,4)*(TOUR?TG_SWING:58)*D2R;
  if(TOUR){P.rdoorL.rotation.y=-ease('rdoorL',state.rdoorL||0,6)*RD_SWING*D2R;P.rdoorR.rotation.y=ease('rdoorR',state.rdoorR||0,6)*RD_SWING*D2R;}
  if(P.cover)P.cover.visible=!state.cover;
  const wv=ease('win',state.win,5),ws=Math.round(wv*10);for(const k of TOUR?['dglassL','dglassR','rglassL','rglassR']:['dglassL','dglassR'])P[k].forEach((m,i)=>{if(m)m.visible=i===ws;});
}
const camberOf=front=>(front?(cfg.camberF||0):(cfg.camberR||0))*D2R;   // degrees in the build, negative = the top of the wheel leans in
function post(dt){
  // wheels: the fronts steer about the steering axis (KZ); the knuckles' steering arms behind the axle push the rack by their mean lateral travel
  const d=state.delta,F=SU.front,R=SU.rear,RK=F.rack,LK=E30_RIG.links,DM=E30_RIG.damper,RD=E30_RIG.rdamper,CO=E30_RIG.coil,RC=E30_RIG.rcoil;
  for(const k in wheels){const w=wheels[k];w.c.position.y=WY;w.cb.rotation.x=w.sd*camberOf(w.steer);w.st.rotation.y=w.steer?d:0;w.sp.rotation.z=(w.sd<0?1:-1)*state.spin;}
  // camber: what rides on the knuckle (strut socket, steering arm, damper lug, hub) turns with it about the lower ball joint; the arms' ball joints stay put
  const camP=(v,sd,front)=>{const c=sd*camberOf(front),py=WY-5.5,pz=sd*(front?KZ:KZR),dy=v.y-py,dz=v.z-pz;v.y=py+dy*Math.cos(c)-dz*Math.sin(c);v.z=pz+dy*Math.sin(c)+dz*Math.cos(c);return v;};
  const V=a=>new V3(a[0],a[1],a[2]),B=a=>bodyPt(a[0],a[1],a[2]);
  const rotK=(l,sd,th)=>[AX_F+l[0]*Math.cos(th)+l[2]*Math.sin(th),WY+l[1],sd*KZ-l[0]*Math.sin(th)+l[2]*Math.cos(th)];   // a point of the knuckle (steering frame, z mirrored) in the car's frame
  const arm=sd=>[F.steer[0],F.steer[1],sd*F.steer[2]],kL=rotK(arm(-1),-1,d),kR=rotK(arm(1),1,d),rackShift=((kL[2]-rotK(arm(-1),-1,0)[2])+(kR[2]-rotK(arm(1),1,0)[2]))/2;
  // the semi-trailing arms turn about their pivot axis (body frame) by the hub's rise over its distance from the axis
  const iB=new THREE.Matrix4().copy(bodyM).invert();
  const rotA=(p,sd,th)=>{const a=V([R.pivI[0],R.pivI[1],sd*R.pivI[2]]),u=V([R.pivO[0]-R.pivI[0],0,sd*(R.pivO[2]-R.pivI[2])]).normalize(),v=V(p).sub(a);
    return v.applyAxisAngle(u,th).add(a);};
  for(const L of P.links){
    const front=L.nm[0]==='F',sd=L.nm[1]==='R'?1:-1;
    if(front){
      const lbj=V([AX_F,WY-5.5,sd*KZ]),low=camP(V(rotK([0,F.low[1]-WR,sd*(F.low[2]-KZ)],sd,d)),sd,true),top=B([F.top[0],F.top[1],sd*F.top[2]]);
      segTo(L.legA,B([F.armF[0],F.armF[1],sd*F.armF[2]]),lbj,zAxis,LK.n,.5);segTo(L.legB,B([F.armR[0],F.armR[1],sd*F.armR[2]]),lbj,zAxis,LK.n,.5);   // lower arm: front leg to the carrier, rear leg to its bushing
      segTo(L.strut,low,top,yAxis,DM.n,.5);
      const t0=(F.springLow-F.low[1])/(F.top[1]-F.low[1]),t1=(F.springTop-F.low[1])/(F.top[1]-F.low[1]);
      segTo(L.spring,new V3().lerpVectors(low,top,t0),new V3().lerpVectors(low,top,t1),yAxis,CO.n,.5);
      segTo(L.rod,B([AX_F+RK.dx,RK.y,sd*RK.half+rackShift]),camP(V(sd<0?kL:kR),sd,true),zAxis,LK.n,.5);   // tie rod from the rack's end to the steering arm
    }else{
      const a=[R.pivI[0],sd*R.pivI[2]],u=[R.pivO[0]-R.pivI[0],sd*(R.pivO[2]-R.pivI[2])],ul=Math.hypot(u[0],u[1]),dist=Math.abs((AX_R-a[0])*u[1]-(sd*KZR-a[1])*u[0])/ul;   // the hub's distance from the axis, in plan
      const hb=V([AX_R,WY,sd*KZR]).applyMatrix4(iB),th=-sd*Math.asin(Math.max(-.5,Math.min(.5,(hb.y-WR)/dist)));   // + about pivI->pivO lowers the right hub and raises the left one
      const P2=p=>rotA(p,sd,th).applyMatrix4(bodyM);
      const ci=P2([R.ci[0],WR+R.ci[1],sd*R.ci[2]]),co=P2([R.co[0],WR+R.co[1],sd*R.co[2]]),S=R.spring,pI=B([R.pivI[0],R.pivI[1],sd*R.pivI[2]]),pO=B([R.pivO[0],R.pivO[1],sd*R.pivO[2]]);
      const from=(p,q)=>p.clone().addScaledVector(new V3().subVectors(q,p).normalize(),3.1);   // a leg starts at its bush housing's face
      segTo(L.legA,from(pI,ci),ci,zAxis,LK.n,.5);segTo(L.legB,from(pO,co),co,zAxis,LK.n,.5);
      const t=(S.x-R.pivI[0])/(R.ci[0]-R.pivI[0]),onA=[S.x,R.pivI[1]+(WR+R.ci[1]-R.pivI[1])*t,sd*(R.pivI[2]+(R.ci[2]-R.pivI[2])*t)];   // the inner leg under the spring
      segTo(L.legC,P2([onA[0],onA[1]+1,onA[2]]),P2([S.x,S.seat-1.25,sd*(Math.abs(onA[2])-1.2)]),zAxis,8,.5);   // web up from the leg to the spring pad
      segTo(L.pad,P2([S.x,S.seat-1,sd*S.z]),P2([S.x,S.seat,sd*S.z]),zAxis,4,.5);
      segTo(L.spring,P2([S.x,S.seat+.25,sd*S.z]),B([S.x,S.top-.25,sd*S.z]),yAxis,RC.n,.5);
      segTo(L.strut,camP(V([R.damper.x,WY+R.damper.low,sd*R.damper.z]),sd,false),B([R.damper.x,P.damperTop,sd*R.damper.z]),yAxis,RD.n,.5);   // damper from its lug on the hub carrier to the top mount under the tub
      segTo(L.shaft,B([AX_R,WR,sd*6.75]),camP(V([AX_R,WY,sd*(KZR+.5)]),sd,false),zAxis,LK.n,.5);   // half-shaft from the final drive's flange to the hub
    }
  }
  // engine rock about the crank axis on its tilt (firing frequency in slow motion), pulleys at crank speed times the drawn pulley ratios, driveshaft at the final drive's input speed
  const shake=(state.rpm/6000)*.35+.1,fireHz=state.rpm/60*(P.cyl||6)/2;
  P.engine.rotation.x=(P.engTilt||0)+Math.sin(state.t*Math.PI*2*Math.min(fireHz*SHAKE_SLOW,12))*.0012*shake*60*((P.amp||.35)/.35);
  const crank=state.t*state.rpm/60*Math.PI*2*CRANK_SLOW;
  P.crankP.rotation.x=crank;P.altP.rotation.x=crank*ACC.alt;P.fan.rotation.x=crank*ACC.fan;
  for(const D of P.ds)D.m.rotation.z=-state.spin*phys.FINAL;
  // cockpit
  if(P.swm)P.swm.visible=!state.swOff;   // pulled off its quick-release hub: the hub boss stays on the column
  P.swheel.rotation.z=state.sw||0;   // + = anticlockwise seen from the driver (the wheel axis points at the driver), so steering left turns the rim left
  P.speedo.rotation.x=(-120+clamp(Math.abs(state.v)*3.6,0,240)/240*240)*D2R;P.tach.rotation.x=(-120+clamp(state.rpm,0,7000)/7000*240)*D2R;
  // hanging pedals swing FORWARD (+x, toward the firewall) when pressed: pad travel at 330 mm under the pivot about 65 mm throttle, 80 mm brake, 140 mm clutch (DESIGN)
  P.ped_gas.rotation.z=state.throttle*.2;P.ped_brake.rotation.z=state.brake*.24;P.ped_clutch.rotation.z=(state.shiftT>0?.42:0);
  const g=state.gear,ss=shiftSS(cfg),gx=[0,-.12,.12,-.0,.0,.12,.12][g]||0,gy=[0,-.1,-.1,0,0,.1,.1][g]||0;   // short-throw: the lever moves less with every shift (SPEC-INTERIOR §2.4)
  P.shifter.rotation.z+=((g===1||g===3||g===5?-.12*ss:g===0?0:.12*ss)*(g===3||g===4?1:1)-P.shifter.rotation.z)*.2;
  P.shifter.rotation.x+=((g<=2?.1*ss:g<=4?0:-.1*ss)-P.shifter.rotation.x)*.2;
  // lights
  const on=state.lights>0,haz=state.hazard>0,blink=(haz||state.signal)&&turnPhase();
  const braking=!!state.brakeLamp;
  const reverse=state.gear===0;
  matHead.emissiveIntensity+=((on?1.1:0)-matHead.emissiveIntensity)*.3;
  for(const b of P.beams)b.intensity=on?1.6:0;
  matTailRed.emissiveIntensity=braking?1.4:(on?.55:.02);
  matTailAmb.emissiveIntensity=blink?1.5:0;matFrontAmb.emissiveIntensity=blink?1.5:0;matTailWht.emissiveIntensity=reverse?1.2:0;
  // wipers
  if(state.wipers){state.wipT=(state.wipT||0)+dt*2.2;}
  const ws=state.wipers?(.5-.5*Math.cos(state.wipT||0)):0;anim.wip+=(ws-anim.wip)*.4;
  if(P.wiperRig)P.wiperRig.update(anim.wip);if(P.wiperRigR)P.wiperRigR.update(anim.wip);
}

/* ---------- shop visuals ---------- */
// the hood's underside: the lowest hood cell over a footprint (world units), less the cell's half height
let HOODLOW=null;
function hoodLow(x0,x1,z0,z1){if(!HOODLOW){HOODLOW=new Map();for(const [i,j,k] of build.r.hi.hood.list()){const key=i+','+k,v=HOODLOW.get(key);if(v===undefined||j<v)HOODLOW.set(key,j);}}
  let m=1e9;for(let i=Math.round(x0*2);i<=Math.round(x1*2);i++)for(let k=Math.round(z0*2);k<=Math.round(z1*2);k++){const v=HOODLOW.get(i+','+k);if(v!==undefined)m=Math.min(m,v/2-.25);}return m;}
function setEngine(eid,gid){
  for(const k of ['engMesh','gbMesh','accMesh']){const m=P[k];if(m){m.parent.remove(m);m.geometry.dispose();P[k]=null;}}
  for(const g of [P.crankP,P.altP,P.fan])while(g.children.length){const c=g.children[0];g.remove(c);if(c.geometry)c.geometry.dispose();}
  const ED0=byId('engine',eid)||byId('engine','M20B25'),kit=byId('swapkit',cfg.swapkit||'none')||{id:'none'},own=SHE.mountPatterns.includes(ED0.mount),
        rel=(own&&kit.id==='none')?{}:(kit.relief||{}),ED=Object.assign({cyl:4,layout:'I'},ED0,{pan:Math.max(110,(ED0.pan||150)-(rel.pan||0))});   // a swap kit's shallow sump (fit.js relief)
  if(ED0.orient==='trans')ED.layout='I';   // another car's transverse engine is drawn as an inline block in this bay; the shop refuses it
  const deg=PW.incline[eid]!==undefined?PW.incline[eid]:(ED.layout==='V'?0:PW.inclineDefault),tl=deg*D2R,ct=Math.cos(tl),st=Math.sin(tl);
  // the oil pan's deep sump clears the axle carrier: ahead of it where the block reaches far enough forward, else behind it (each engine's swap pan)
  const Bl=Math.round(ED.len/10-6),C0=SU.front.carrier,fx=Math.ceil((C0.x1+.75-PW.x)*2),rx=Math.floor((Math.min(C0.x0-.75,AX_F+SU.front.rack.dx-2)-PW.x)*2),sump=Bl-2-fx>=12?[fx,Bl-2]:[2,rx];   // behind the carrier the sump also stops short of the steering rack
  // the oil pan's shallow part over the axle carrier: as deep as the engine's own, unless (tilted) its low corner would stand on the carrier; then shallower,
  // a cell at a time, until it clears the carrier's top by 5 mm (an S14 leans 30 degrees: its pan's right corner hung 20 mm into the carrier)
  const C_=SU.front.carrier,panLow=E=>{let lo=1e9;for(const [x,y,z] of E.grid.list()){const wx=PW.x+x*.5;if(wx<C_.x0-.75||wx>C_.x1+.75)continue;const l1=(y-E.pc)*.5,l2=z*.5,wz=l1*st+l2*ct;if(Math.abs(wz)>C_.z+.5)continue;lo=Math.min(lo,PW.crankY+l1*ct-l2*st-.25);}return lo;};
  // an inline engine's front exhaust manifold ends in a flange low on its leaning side: one that would land over the carrier is moved back behind it (as the
  // 30-degree engines' ports drop the flange onto the carrier's top)
  let manX;if(ED.layout!=='V'){const Lc0=ED.len/10,Bl0=Math.round(Lc0-6),lo=(C_.x0-PW.x)*2,hi=(C_.x1-PW.x)*2,xf=Bl0*.73;if(xf+3.5>lo&&xf-3.5<hi)manX=[.27,(lo-4)/Bl0];}
  // ... and nowhere stands in the floor pan's crossmembers and rails (the underbody as drawn): the shallowest pan that clears both, else the one that touches least
  const UG0=build.underG,underHits=E=>{if(!UG0)return 0;let n=0;for(const [x,y,z] of E.grid.list()){const l1=(y-E.pc)*.5,l2=z*.5,wy=PW.crankY+l1*ct-l2*st;if(wy>18)continue;const wx=PW.x+x*.5,wz=l1*st+l2*ct;if(UG0.get(Math.round(wx*2),Math.round(wy*2),Math.round(wz*2))>=0)n++;}return n;};
  // (the alternator, low on the block's right front, may stand on the crossmember too: then its bracket carries it higher, 10 mm at a time)
  let E=null,best=null;search:for(const al of [0,2,4,6,8])for(const sm of [undefined,14,12,10,9,8,7,6,5]){E=genEngineLong(ED,{tilt:tl,sump,mountX:(AX_F-PW.x)*2,shallowMax:sm,manX,altLift:al});const ok=panLow(E)>=C_.y1+.25,uh=underHits(E);
    if(ok&&uh===0){best=null;break search;}if(ok&&(!best||uh<best.uh))best={E,uh};}
  if(best)E=best.E;
  const GD=Object.assign({tunnel:300,ratios:[1,1,1,1,1]},byId('gearbox',gid)||{}),T=genGearboxLong(GD,E.pc);
  // squashed only if it would reach the hood's underside (20 mm clear): a swap kit's low-profile intake is drawn this way
  let top=-1e9;for(const [x,y,z] of E.grid.list()){const wy=PW.crankY+((y-E.pc)*ct-z*st)*.5;if(wy>top)top=wy;}
  const hu=hoodLow(PW.x,PW.x+E.Lc*.5,-E.Wc*.3,E.Wc*.3)-1,sy=Math.min(1,(hu-PW.crankY)/(top-PW.crankY));
  const eg=P.engGroup;eg.position.set(PW.x,PW.crankY,0);eg.rotation.set(tl,0,0);
  P.engMesh=mk(E.grid,matV,0,eg,.5);P.engMesh.position.set(0,-E.pc*.5*sy,0);P.engMesh.scale.y=.5*sy;
  P.gbMesh=mk(T.grid,matV,0,eg,.5);P.gbMesh.position.set(-.5,-E.pc*.5*sy,0);P.gbMesh.scale.y=.5*sy;   // the bell's face one cell behind the block's (they bolt face to face)
  P.engSy=sy;P.engTilt=tl;P.cyl=ED.cyl;P.amp={4:1.0,5:.8,6:.35,8:.6}[ED.cyl]||1;
  const Pt=E.pts,L2=p=>[p[0]*.5,(p[1]-E.pc)*.5*sy,p[2]*.5],W=p=>{const l=L2(p);return [PW.x+l[0],PW.crankY+l[1]*ct-l[2]*st,l[1]*st+l[2]*ct];};   // engine cell -> group frame, -> body frame
  // pulleys in the belt plane (the alternator's shaft carried forward to it), the belt; the viscous fan on the water pump (engines that keep the mechanical fan)
  const mech=!!ED0.mechFan&&own&&kit.id==='none',xb=Pt.crank[0],alt=[xb,Pt.alt[1],Pt.alt[2]];
  const acc=new Grid(Math.floor(E.Bl)-14,Math.ceil(E.Lc)+12,-10,Math.ceil(E.Hc)+4,-Math.ceil(E.Wc/2)-4,Math.ceil(E.Wc/2)+4);
  cylX(acc,alt[1],alt[2],1.4,Pt.alt[0]+1,xb,0x8d9298);
  const tan=(p,q,r1,r2)=>{const dy=q[1]-p[1],dz=q[2]-p[2],l=Math.hypot(dy,dz),ny=-dz/l,nz=dy/l;return [[p[1]+ny*r1,p[2]+nz*r1],[q[1]+ny*r2,q[2]+nz*r2]];};
  const Cc=[0,Pt.crank[1],Pt.crank[2]],Fp=[0,Pt.fan[1],Pt.fan[2]],Ap=[0,alt[1],alt[2]],bx=xb+2;
  for(const [a,b,r1,r2] of [[Cc,Ap,6,3.5],[Ap,Fp,3.5,5],[Fp,Cc,5,6]]){const t=tan(a,b,r1,r2);segFill(acc,[bx,t[0][0],t[0][1]],[bx,t[1][0],t[1][1]],.55,0x131416);}
  P.accMesh=mk(acc,matV,0,eg,.5);P.accMesh.position.set(0,-E.pc*.5*sy,0);P.accMesh.scale.y=.5*sy;
  for(const [g,p,r] of [[P.crankP,Pt.crank,6],[P.altP,alt,3.5],[P.fan,Pt.fan,5]]){const l=L2(p);g.position.set(l[0],l[1],l[2]);
    const m=mk(genPulleyZ(r,r===6?0x41454b:0x50555c),matV,0,g,.5);m.rotation.y=Math.PI/2;}
  if(mech){const cl=new Grid(0,4,-4,4,-4,4);cl.fill((x,y,z)=>Math.hypot(y,z)<=3.5?(x===4?0x8d9298:0x5c6168):-1);const c=mk(cl,matV,0,P.fan,.5);c.position.x=2;
    const f=mk(buildFan(),matV,0,P.fan,.5);f.position.x=4;}
  const Wf=W(Pt.fan);
  swapGeo(P.bay,genBayE30({fan:mech?{y:Wf[1],z:Wf[2],r:9.25}:null,efan:!mech,radShift:(eid==='2JZGTE'||eid==='S54B32')?.75:0,relocate:eid==='LS3'}));
  // engine arms from the block's sides down to rubber mounts on the axle carrier; the gear lever's carrier from the gearbox's case back under the shifter
  {const h=HC(),C=SU.front.carrier;for(const [p,sd] of [[Pt.mountL,-1],[Pt.mountR,1]]){const b=W(p),pad=[(C.x0+C.x1)/2,C.y1+1.25,sd*11.5];
     h.box(pad[0]-1.25,pad[0]+1.25,C.y1+.25,C.y1+1,pad[2]-1.25,pad[2]+1.25,0x111214);h.seg(b,[pad[0],C.y1+1.5,pad[2]],.9,0x3a3d42);}
   h.seg([PW.x+(T.out[0]+14)*.5,PW.crankY+4.25,0],[cp.shifter.x+.5,21.6,0],.55,0x5a5f66);h.box(cp.shifter.x-.5,cp.shifter.x+1,21,22.25,-.75,.75,0x2a2c30);
   build.mountG=h.grid();P.mounts.geometry.dispose();P.mounts.geometry=bufGeo(geoData(build.mountG,0,.05,0));}
  // hoses (body frame): upper radiator hose over the shroud's top into the left end tank, lower hose under it into the right tank, the intake boot from the air-flow meter to the throttle body
  {const h=HC(),th=W(Pt.thermo),wi=W(Pt.waterIn),tb=W(Pt.tb);build.hosePts={th,wi,tb};build.nosTb=tb;const rs=(eid==='2JZGTE'||eid==='S54B32')?.75:0,hc=0x15161a;
   h.poly([th,[th[0]+.5,th[1]+3,th[2]-2],[th[0]+1.5,36,-15.25],[94+rs,36.4,-15.25],[95.5+rs,36.25,-15.25]],.9,hc);
   {const tail=[[92+rs,14.75,14.5],[94.5+rs,14.85,15.25],[95.5+rs,14.85,15.25]],MG=build.mountG,UG=build.underG;   // lower hose: from the water inlet on the block's right side behind the alternator, forward low beside the frame rail
    const hits=pts=>{let n0=0;for(let s=0;s<pts.length-1;s++){const a=pts[s],b=pts[s+1],L=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]),n=Math.max(1,Math.ceil(L/.25));for(let q=0;q<=n;q++){const t=q/n,c=[0,1,2].map(m=>a[m]+(b[m]-a[m])*t);
      for(let dx=-1;dx<=1;dx+=.5)for(let dy=-1;dy<=1;dy+=.5)for(let dz=-1;dz<=1;dz+=.5){if(dx*dx+dy*dy+dz*dz>.81)continue;const k=[Math.round((c[0]+dx)*2),Math.round((c[1]+dy)*2),Math.round((c[2]+dz)*2)];
        if((MG&&MG.get(...k)>=0)||(UG&&UG.get(...k)>=0))n0++;
        else if(Math.hypot(c[0]-wi[0],c[1]-wi[1],c[2]-wi[2])>2){const X=c[0]+dx,Y=c[1]+dy,Z=c[2]+dz,l0=X-PW.x,d=Y-PW.crankY,l1=d*ct+Z*st,l2=-d*st+Z*ct;if(E.grid.get(Math.round(l0*2),Math.round(l1/(.5*sy)+E.pc),Math.round(l2*2))>=0)n0++;}}}}return n0;};   // the engine itself, past the inlet's slip-on joint
    const W0=[wi[0],wi[1],wi[2]+.4],routes=[[W0,[W0[0]+1,14.75,13],...tail]];   // (the hose end sits on the inlet's spigot, 20 mm proud of the block)   // as before; else the first of: back behind the engine arm, forward ahead of it, over it (from the spigot straight out first)
    for(const out of [.9,1.8])for(const [dx,dy] of [[-2,-.5],[-3,0],[2.5,0],[3.5,.5],[0,2.5],[1,3.5]])routes.push([W0,[W0[0],W0[1],W0[2]+out],[W0[0]+dx,W0[1]+dy,W0[2]+out+.6],[W0[0]+dx,dy>1?W0[1]+dy:14.5,13.5],[Math.max(W0[0]+dx,W0[0]+1)+1.5,14.75,13.75],...tail]);
    let pick=routes[0],ph=hits(pick);if(ph>0)for(const r of routes.slice(1)){const n=hits(r);if(n<ph){pick=r;ph=n;if(!n)break;}}
    h.poly(pick,.9,hc);}
   const vee=(byId('engine',eid)||{}).layout==='V';   // a V engine's throttle body faces forward at the top of the vee: its tube runs forward and right to the kit's cone filter
   h.poly(vee?[[tb[0]+.75,tb[1],tb[2]],[tb[0]+2.25,tb[1],tb[2]],[87.75,tb[1]+.4,tb[2]+6],[87.75,35,15],[87.75,35,19.75]]:[[80.25,34.5,-21],[79.25,33.25,-17.5],[80.5,29,-14.5],[tb[0]+2,tb[1]+.5,tb[2]-1.25],[tb[0]+.75,tb[1],tb[2]]],1.5,0x1c1d20);
   P.hoses.geometry.dispose();P.hoses.geometry=bufGeo(geoData(h.grid(),0,.05,0));}
  // driveshaft: the front half from the gearbox's output flange to the centre bearing, the rear half to the final drive's input flange; the bearing's cradle and strap
  {const o=[PW.x+T.out[0]*.5-.75,PW.crankY,0],d=[AX_R+8,WR-1.25,0],cb=[-16,o[1]+(d[1]-o[1])*(o[0]+16)/(o[0]-d[0]),0];
   segTo(P.ds[0].g,new V3(...o),new V3(...cb),zAxis,70,.5);segTo(P.ds[1].g,new V3(...cb),new V3(...d),zAxis,70,.5);
   P.ds[1].m.geometry.dispose();P.ds[1].m.geometry=bufGeo(geoData(genShaftE30(70,false),0,.05,0));
   const h=HC();h.cyl('x',cb[1],0,2.6,cb[0]-1,cb[0]+1,0x15161a,1.65);h.box(cb[0]-.75,cb[0]+.75,cb[1]+2.25,cb[1]+3,-7.75,7.75,0x2a2c30);for(const s of [-1,1])h.box(cb[0]-.75,cb[0]+.75,cb[1]-.5,cb[1]+3,s*7.25,s*7.75,0x2a2c30);
   P.cbear.geometry.dispose();P.cbear.geometry=bufGeo(geoData(h.grid(),0,.05,0));}
  // exhaust front pipes: from each manifold's flange down to 170 mm (in front of the axle carrier when the flange is ahead of it, so they pass under it), back under
  // the bellhousing to the collector at the firewall (exF), where the exhaust proper begins
  {const C=SU.front.carrier,X=E30_RIG.exh,pr=X.pr;
   // what the front pipes must clear: the engine and gearbox as drawn (their cells, through the engine's tilt and squash), the axle carrier
   const inEng=(x,y,z)=>{const l0=x-PW.x,dy=y-PW.crankY,l1=dy*ct+z*st,l2=-dy*st+z*ct,j=Math.round(l1/(.5*sy)+E.pc),k=Math.round(l2*2);return E.grid.get(Math.round(l0*2),j,k)>=0||T.grid.get(Math.round((l0+.5)*2),j,k)>=0;};
   const inCar=(x,y,z)=>x>=C.x0-.25&&x<=C.x1+.25&&y>=C.y0-.25&&y<=C.y1+.25&&Math.abs(z)<=C.z+.25;
   const UG=build.underG,inUnder=(x,y,z)=>!!UG&&UG.get(Math.round(x*2),Math.round(y*2),Math.round(z*2))>=0;   // and the floor pan's underside, its rails and crossmembers
   const clear=(pts,f)=>{const R=pr+.2;for(let s=0;s<pts.length-1;s++){const a=pts[s],b=pts[s+1],L=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]),n=Math.max(1,Math.ceil(L/.25));
       for(let q=0;q<=n;q++){const t=q/n,c=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];if(Math.hypot(c[0]-f[0],c[1]-f[1],c[2]-f[2])<pr+1)continue;   // the flange's own joint
         for(let dx=-R;dx<=R;dx+=.5)for(let dy=-R;dy<=R;dy+=.5)for(let dz=-R;dz<=R;dz+=.5){const r2=dx*dx+dy*dy+dz*dz;if(r2>R*R)continue;const x=c[0]+dx,y=c[1]+dy,z=c[2]+dz;if(inEng(x,y,z)||inCar(x,y,z)||(r2<=pr*pr&&inUnder(x,y,z)))return false;}}}return true;};
   build.pipeAlt=[];const boxed=[];build.frontPipes=Pt.manifolds.map(m=>{const f=W(m),sg=Math.sign(f[2])||1,dx=f[0]>C.x0-1.5?Math.max(f[0],C.x1+1.75):f[0]-.5,zz=sg*Math.max(Math.abs(f[2])-1,X.zRun);
     const over=f[0]>C.x0-1.5&&f[0]<C.x1+1.75,yo=Math.max(f[1],C.y1+pr+.35);   // a flange over the carrier: the pipe runs forward over its top (clear by 7 mm) before it drops
     const tail=[[52,X.frontY,X.zRun],[X.x0,X.frontY,X.zRun]];
     const first=over?[f,[f[0],yo,f[2]],[dx,yo,f[2]*.95],[dx,X.frontY,zz],...tail]:[f,[dx,f[1]-2.5,f[2]*.95],[dx,X.frontY,zz],...tail];
     if(clear(first,f))return first;(build.pipeAlt=build.pipeAlt||[]).push(m);
     // otherwise the first clear of a few routes: out from the block first, then down ahead of or behind the carrier (an S14's ports are low on its leaning side)
     if(!over)for(const xd of [f[0]-3,f[0]-4.5,f[0]-6,f[0]-7.5]){const r=[f,[xd,f[1],f[2]],[xd,X.frontY,zz],...tail];if(clear(r,f))return r;}   // straight back at the flange's height, then down behind the crossmember
     for(const out of [1.5,3,4.5,6])for(const xd of over?[C.x1+1.75,C.x1+3,C.x0-1.75]:[f[0]-.5,f[0]+1.5,f[0]-2.5,f[0]-4,f[0]-5.5,f[0]-7])for(const up of over?[yo,yo+1]:[f[1],f[1]+1.5,f[1]+3]){   // (a flange behind the carrier: back over the crossmember's top first, if need be)
       const zo=sg*(Math.abs(f[2])+out),r=over?[f,[f[0],f[1],zo],[f[0],up,zo],[xd,up,zo],[xd,X.frontY,zo],...tail]:[f,[f[0],up,zo],[xd,up-1,zo],[xd,X.frontY,zo],...tail];
       if(clear(r,f))return r;}
     boxed.push(first);return first;});   // no clear route: a flange boxed in between the block and the crossmember's top (the S14's front pair)
   // there the crossmember is notched round the pipe, as the M3's own is shaped round its header; the notch goes again with another engine
   if(boxed.length||build.underNotch){const G0=build.underG,g=new Grid(G0.x0,G0.x1,G0.y0,G0.y1,G0.z0,G0.z1);g.d.set(G0.d);const R=pr+.3;
     for(const pts of boxed)for(let s=0;s<pts.length-1;s++){const a=pts[s],b=pts[s+1],L=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]),n=Math.max(1,Math.ceil(L/.25));
       for(let q=0;q<=n;q++){const t=q/n,c=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
         for(let dx=-R;dx<=R;dx+=.5)for(let dy=-R;dy<=R;dy+=.5)for(let dz=-R;dz<=R;dz+=.5){if(dx*dx+dy*dy+dz*dz>R*R)continue;const i=Math.round((c[0]+dx)*2),j=Math.round((c[1]+dy)*2),k=Math.round((c[2]+dz)*2);if(g.get(i,j,k)>=0)g.set(i,j,k,-1);}}}
     swapGeo(P.under,g);build.underNotch=boxed.length>0;}}
  if(P.exh)setExhaust(cfg.exhaust);
  // TURBO-02: a turbo kit (parts_lib: m20-t3t4-kit): the turbo on the M20's exhaust side (+z) beside the block, the front-mount intercooler low in the
  // nose ahead of the radiator support, the charge pipes routed round the bay (through holes in the support's sides where needed). Search ranges from
  // the bay map (t/probe/map.js, Nov 14): free beside the block from x 1060 to 1700 mm, z 160 to 560 mm, y 360 to 600 mm; ahead of the support only
  // 40 mm at bumper height, so the core goes below it
  setTurboKit(cfg,body,P,mk,matV,build.nosTb,{tx:[60,86],ty:[24,31],tz:[9,24],icx:[100,95],icy:[8,14],box:[48,106,5,40,-30,30],cutX:93,cutZ:17,pg:[96,212,10,80,-60,60]});
}
function setSeats(style,noRear){
  (P.seatMeshes||[]).forEach(m=>{body.remove(m);m.geometry.dispose();});P.seatMeshes=[];
  const LOOKS={stock:{cush:0x2d2f34,bol:0x3a3d44,bolH:1.6,back:22,hw:9.5,head:'post'},comfort:{cush:0x4a4339,bol:0x564e43,bolH:.5,back:22,hw:9.5,head:'post'},sport:{cush:0x26282c,bol:0x3a3d44,bolH:2.0,back:22,hw:9.5,head:'post',slide:1},recliner:{cush:0x24262a,bol:0x30333a,bolH:1.2,back:22,hw:9.5,head:'post'},bucket:{cush:0x1b1c1f,bol:0x0f1012,bolH:2.5,back:30,hw:9,head:'none',bucket:true}};
  const sp=byId('seats',style),lk=sp&&sp.look,look=lk?Object.assign({},LOOKS[lk.base]||LOOKS.stock,lk):(LOOKS[style]||LOOKS.stock);   // a universal seat: its look over the base shape
  for(const sd of [-1,1]){if(sd===-cp.side&&cfg.removed&&cfg.removed.passengerSeat)continue;P.seatMeshes.push(mk(RG.seat(look,sd*cp.H.z),matV,0,body));}   // the passenger's seat comes out with its rails (Take weight off)
  if(!noRear){const rb=buildRearBenchHi(build.r.hi.body,[build.r.hi.glass.qgL,build.r.hi.glass.qgR]);P.seatMeshes.push(mk(rb.cushion,matV,0,body,.5,.03,true));const bk=mk(rb.back,matV,0,body,.5,.03,true);bk.position.set(...rb.backPos);bk.rotation.z=rb.backRot;P.seatMeshes.push(bk);}   // the E30 coupe bench: cushion, and the backrest drawn at its angle (roll bars and cages delete the rear seat)
  P.hiRef=build.r&&build.r.hi;   // v20: the body's 10 mm panels, for the Stage B-D helpers (nothing they place may float or overlap)
  stageBParts(cfg,body,P,cp,mk,matV);   // Stage B (SPEC-INTERIOR §1/§4/§6): the wall / plush parts for the rear and passenger areas, and the dash set — rebuilt with the seats
  stageCParts(cfg,body,P,cp,build.nosTb,mk,matV);
  stageDParts(cfg,body,P,cp,mk,matV);   // v20 Stage D: the drift handbrake and the mirror hanger, rebuilt with the seats   // Stage C (SPEC-INTERIOR §5): the nitrous bottle + bay hardware — rebuilt with the seats (the seats sig carries rearArea)
}
function setSteering(id){const d=byId('steering',id);swapGeo(P.swm,d.look?genSteeringWheel(d.dia,d.look):buildSteeringWheelV(d.dia,id));}   // universal wheels come with their look
function setShifter(){const m=P.shifter&&P.shifter.children[0];if(m)swapGeo(m,genShifter(17,cfg));}   // Stage A (SPEC-INTERIOR §2): the fitted shifter's knob, swapped live
function setExhaust(id){const tip=(byId('exhaust',id)||byId('exhaust','stock')).tip,F=exhF();swapGeo(P.exh,genExhaust(EG30,tip,F));if(P.exhTips)swapGeo(P.exhTips,genExhaustTips(tip,F));}
// the exhaust's route (e30_rig.js exh) from the front pipes' collector; the Japanese tails start at the silencer's outlet (left), stand under the rear valance (rearmost
// face x -107.7, bottom 260 mm) close together behind the plate (the trunk lid lifts away from them); the side exit 40 mm ahead of the rear arch at the sill
function exhF(){const X=E30_RIG.exh,F=Object.assign({},X,{x0:X.x0,y0:X.frontY,z0:X.zRun,front:build.frontPipes||[]});
  let sz=0;const B=build.r.body,xs=AX_R+ARCH_RR.r+2;for(let z=0;z<=50;z++)if(B.get(Math.round(xs),12,-z)>=0)sz=z+.5;
  F.jdm={out:[X.mufX1,X.lowY,X.side*X.mufZ],rearX:RR.x0,botY:RR.bot,tyZ:[-6,6],spears:{3:[[-9,0],[0,0],[9,0]],4:[[-11,0],[-4,0],[4,0],[11,0]]},topY:62.5,side:{from:[xs,X.pipeY,X.zRun],sg:-1,y:7.6,z:sz||41}};
  return F;}
// add-on parts: the aero slots (front lip, rear spoiler or wing, flares, skirts: any mix) and the chassis parts. Aero parts are 10 mm grids seated on what they bolt to;
// trunk parts ride on the lid. Built when first needed, kept hidden.
const TRUNK_HINGE=[TRUNK_X0,topY(TRUNK_X0)+.8];
const ADDON={
  frontlip:{hi:1,fn:()=>[buildFrontLipE30(build.bfHi,[build.r.hi.body])]},islip:{hi:1,fn:()=>[buildISLipE30(build.bfHi,[build.r.hi.body])]},splitter:{hi:1,fn:()=>[buildSplitterE30(build.bfHi,[build.r.hi.body])]},
  hatchspoiler:{hi:1,p:'trunk',fn:()=>[buildRoofSpoilerE30T(build.r.hi.trunk)]},   // the Touring's roof spoiler (the shop offers it on the Touring only: rear 'hatch')
  mtfront:{hi:1,fn:()=>[buildMTechFrontE30(build.bfHi,[build.r.hi.body])]},mtskirts:{hi:1,fn:()=>[buildMTechSkirtsE30(build.r.hi)]},   // M-Technik II
  mtrear:{hi:1,onBumperR:1,fn:()=>[buildMTechApronE30(build.brHi,[build.r.hi.body])],extra:'mtlid'},mtroof:{hi:1,onBumperR:1,fn:()=>[buildMTechApronE30(build.brHi,[build.r.hi.body])],extra:'hatchspoiler'},
  mtlid:{hi:1,p:'trunk',fn:()=>[buildTrunkAeroE30(build.r.hi.trunk,'mtech')]},
  trunklip:{hi:1,p:'trunk',fn:()=>[buildTrunkAeroE30(build.r.hi.trunk,'lip')]},ducktail:{hi:1,p:'trunk',fn:()=>[buildTrunkAeroE30(build.r.hi.trunk,'ducktail')]},gtwing:{hi:1,p:'trunk',fn:()=>[buildTrunkAeroE30(build.r.hi.trunk,'wing')]},
  wide:{hi:1,fn:()=>[flareGrid()]},skirts:{hi:1,fn:()=>[buildSkirtsE30(build.r.hi)]},
  skirtsW:{hi:1,fn:()=>[underFlares(buildSkirtsE30(build.r.hi))]},mtskirtsW:{hi:1,fn:()=>[underFlares(buildMTechSkirtsE30(build.r.hi))]},   // with the flares on, the skirts stop under them
  strutbar:{fn:()=>[buildStrutBar()]},rollbar:{fn:()=>[buildRollBar()]},cage:{fn:()=>[buildCage()]},cage10:{fn:()=>[buildCage10()]}};
function flareGrid(){if(!build.flareG)build.flareG=buildFlaresE30(build.r.hi,[build.bfHi,build.brHi,...(build.badgeGrids||[])]);return build.flareG;}
function underFlares(g){const F=flareGrid();for(const [i,j,k] of g.list())if(F.get(i,j,k)>=0||F.get(i,j+1,k)>=0&&F.get(i,j,k)>=0)g.set(i,j,k,-1);return g;}
function lazyPart(name){
  if(P['part_'+name])return P['part_'+name];
  const A=ADDON[name],grp=new THREE.Group();for(const b of A.fn())paintable(b,grp,undefined,A.hi?.5:undefined,{seat:bodySurfIn});   // aero parts are drawn seated on the body's measured surface
  if(A.p==='trunk'){grp.position.set(-TRUNK_HINGE[0],-TRUNK_HINGE[1],0);P.trunk.add(grp);}else body.add(grp);
  P['part_'+name]=grp;grp.visible=false;return grp;
}
function setAero(c,frame){
  for(const n in ADDON)if(P['part_'+n])P['part_'+n].visible=false;
  const offF=!!(c.removed&&c.removed.bumperF);   // the front lip and splitter bolt to the bumper: off with it
  for(const s of AERO_SLOTS){let id=c[s];if(!id||id==='none'||!ADDON[id])continue;if(s==='skirts'&&c.flares==='wide'&&ADDON[id+'W'])id+='W';if(s==='aeroF'&&offF)continue;const A=ADDON[id];
    if(!(A.onBumperR&&c.removed&&c.removed.bumperR))lazyPart(id).visible=true;if(A.extra)lazyPart(A.extra).visible=true;}   // an M-Technik rear part: the apron (on the rear bumper: off with it) and its spoiler
  if(frame&&frame!=='stock')lazyPart(frame).visible=true;
  const wide=c.flares==='wide';if(P.bodyMesh&&(P.bodyCut||wide)){if(wide&&!P.bodyCut){P.bodyCut=paintable(archCutHi(build.r.hi.body),body,undefined,.5);}P.bodyCut.visible=wide;P.bodyMesh.visible=!wide;}   // widebody: arch lips cut back under the flares
  {const bar=frame==='cage'||frame==='cage10';if(P.imirror&&P.imirrorM&&P.imirrorBar!==bar){const im=bar?(build.imBar||(build.imBar=buildInteriorMirrorBar(buildCage()))):build.imRoof;   // a cage's header bar carries the mirror
    swapGeo(P.imirror[0],im.shell);swapGeo(P.imirror[1],im.glass);for(const m of P.imirror)m.position.set(...im.pos);
    const M=P.imirrorM;M.plane.position.set(...im.glassCenter);M.plane.geometry.dispose();M.plane.geometry=new THREE.PlaneGeometry(im.glassSize[0],im.glassSize[1]);M.w=im.glassSize[0];M.h=im.glassSize[1];P.imirrorBar=bar;}}
  const fr=frame||'stock';if(P.interior&&P.interiorCage!==fr){swapGeo(P.interior,e30Interior(fr));if(P.dashDetail)swapGeo(P.dashDetail,e30DashDetail(fr));P.interiorCage=fr;}   // cage tubes pass through notches in the dash and carpet
}
// the coil with its seats: front, the lower seat on the strut tube and the upper one under the top mount; rear, the arm's pad below and the body pocket's cap above
function coilGeo(front,col){const CO=front?E30_RIG.coil:E30_RIG.rcoil,DM=E30_RIG.damper;
  return bufGeo(geoData(genCoil(CO.n,CO.R,CO.w,CO.turns,col,front?[DM.bodyR+.3,DM.rodR+.5]:[1.5,1.5]),0,0,0));}
function setSprings(id){
  const col={stock:0xc4261f,hd:0xc4261f,sport:0x2a6fd6,cup:0x16171a,coil:0xe0b52a,air:0x3a3c41}[id];
  const gF=coilGeo(true,col),gR=coilGeo(false,col);
  for(const L of P.links)L.spring.geometry=L.nm[0]==='F'?gF:gR;
}
// knuckles in their steering frame (origin on the steering axis at hub height): front, the strut housing's foot with the hub, the ball joint below, the steering arm
// behind the axle and the caliper lug; rear, the semi-trailing arm's hub carrier. hubIn: the brake disc's inner face (45 mm inboard of the hub face)
function e30Knuckle(sd,front,rotorMM){const hubIn=(SHE.hubFaceZ-45)/20-KZ,F=SU.front,R0=SU.rear,az=F.low[2]-KZ;
  return front?genKnuckle(sd,{boss:[0,hubIn-.25,2.25],lbj:-5.5,ubj:2,armZ:[az-.3,az+.35],steer:F.steer.slice(),cal:[-(.6*rotorMM/40)+.05,0,hubIn-.75]})
              :genKnuckle(sd,{boss:[-1,hubIn-.25,2.5],lbj:-5,ubj:2.5,armZ:[-2.1,-1.1],trail:[R0.damper.x-AX_R,R0.damper.low,R0.damper.z-KZR],cal:[-(.6*rotorMM/40)+.05,0,hubIn-.75]});}
function setWheels(){
  const w=cfg.wheel,ty=tyreFor(w.dia,w.width,w.tw,w.ar),zc=(SHE.hubFaceZ-w.et)/20,br=byId('brakes',cfg.brakes);
  const tireG=bufGeo(geoData(buildTireP(ty.OD,ty.tw,w.dia,w.width),0,.03,0)),rimG=bufGeo(geoData(buildRimP(w.style,w.dia,w.width,w.et,'bmw',{exact:1}),0,.03,0)),   // the tyre's bead on the rim's seat; the rim's mounting face exactly ET outboard
        rotG=bufGeo(geoData(buildRotorP(br.rotor),0,.03,0)),calG=bufGeo(geoData(buildCaliperP(br.rotor,calType(br),1,calCol(br)),0,.03,0));   // the caliper leaves the disc's slot
  for(const k in wheels){const W=wheels[k];W.tire.geometry=tireG;W.rim.geometry=rimG;W.rot.geometry=rotG;W.cal.geometry=calG;
    const sp=(W.steer?cfg.spacerF:cfg.spacerR)||0;W.off.position.z=W.sd*(zc+sp/20-KZ);W.rot.position.z=(w.et-sp)/20;W.cg.position.z=(w.et-sp)/20;W.kn.geometry=bufGeo(geoData(e30Knuckle(W.sd,W.steer,br.rotor),0,.03,0));}   // the wheel's offset moves the wheel out from the fixed knuckle
  WY=ty.OD/40;phys.WR_M=ty.OD/2000;
}

const PRESETS=[
 ['Stock',c=>{}],
 ['M3 spec',c=>{Object.assign(c,{engine:'S14B23',gearbox:'G265',diff:'lsd410',exhaust:'catback',seats:'recliner',steering:'sport',suspension:'sport',drop:30});c.wheel={style:'mesh',dia:15,width:7,et:25,pcd:'4x100'};}],
 ['2JZ swap',c=>{Object.assign(c,{engine:'2JZGTE',swapkit:'kit-jz',gearbox:'V160',diff:'lsd373',exhaust:'oval',seats:'bucket',steering:'small',suspension:'coil',drop:30,brakes:'bbk4',aeroF:'splitter'});c.wheel={style:'star',dia:17,width:8,et:35,pcd:'4x100'};}],
 ['LS swap',c=>{Object.assign(c,{engine:'LS3',swapkit:'kit-ls',gearbox:'T56',diff:'lsd346',exhaust:'catback',seats:'recliner',steering:'sport',suspension:'coil',drop:30,brakes:'bbk4',aeroR:'ducktail'});c.wheel={style:'dish',dia:17,width:8,et:35,pcd:'4x100'};}],
 ['Track widebody',c=>{Object.assign(c,{engine:'S14B23',gearbox:'G265',diff:'lsd410',exhaust:'catback',seats:'bucket',steering:'small',suspension:'coil',drop:30,brakes:'bbk6',flares:'wide',skirts:'skirts',aeroF:'splitter',aeroR:'gtwing',frame:'cage'});c.wheel={style:'dish',dia:18,width:9,et:16,pcd:'4x100'};}]
];
// the Touring's presets: its own stock car and the swaps that suit an estate (no trunk-lid aero on a tailgate)
const PRESETS_T=[
 ['Stock',c=>{}],
 ['2JZ swap',c=>{Object.assign(c,{engine:'2JZGTE',swapkit:'kit-jz',gearbox:'V160',diff:'lsd373',exhaust:'oval',seats:'bucket',steering:'small',suspension:'coil',drop:30,brakes:'bbk4',aeroF:'splitter'});c.wheel={style:'star',dia:17,width:8,et:35,pcd:'4x100'};}],
 ['LS swap',c=>{Object.assign(c,{engine:'LS3',swapkit:'kit-ls',gearbox:'T56',diff:'lsd346',exhaust:'catback',seats:'recliner',steering:'sport',suspension:'coil',drop:30,brakes:'bbk4'});c.wheel={style:'dish',dia:17,width:8,et:35,pcd:'4x100'};}]
];
// removable trim: only the pieces the E30 draws as separate meshes change on screen; the rest change mass and balance only
function applyRemoved(){const R=cfg.removed||{};
  if(P.bumperF)P.bumperF.visible=!R.bumperF;if(P.bumperR)P.bumperR.visible=!R.bumperR;
  for(const m of [...(P.frontAmb||[]),...(P.fogs||[]),P.plateF])if(m)m.visible=!R.bumperF;   // the indicators, fog lamps and front plate are mounted in the front bumper
  (P.doorCards||[]).forEach(m=>m.visible=!R.doorCards);(P.rdoorCards||[]).forEach(m=>m.visible=!R.doorCards);
}
return {
  // body roll and pitch stop where the travel runs out (CALCULATED, as the EF's): the arch stays 15 mm above the tyre (60 % of the gap to roll, 40 % to pitch at the axle
  // 1285 mm out), the rear tub wall (480 mm from the centreline) 5 mm from the tyre's inner face; never more than 4 deg roll / 2.5 deg pitch
  bodyLimits:c=>{const w=c.wheel,ty=tyreFor(w.dia,w.width,w.tw,w.ar),zc=SHE.hubFaceZ-w.et+Math.max(c.spacerF||0,c.spacerR||0),top=ty.OD+(c.drop||0),A=E30M.arch;
    const gv=Math.min(A.f.y+A.f.r,A.r.y+A.r.r)-top-15,gl=zc-ty.tw/2-480-5,as=v=>Math.asin(Math.max(0,Math.min(1,v)));
    const roll=Math.min(as(gv*.6/zc),as(gl/top),4*Math.PI/180);
    return {roll,rollLock:roll*.55,pitch:Math.min(as(gv*.4/1285),2.5*Math.PI/180)};},   // rollLock: at full lock the tyre's leading shoulder sweeps up into the arch's front lip, so the body may roll only about half as far there (DESIGN; at full lock the car is slow, so its lean is small anyway)
  maxSteer:E30_LOCK,
  id:SID,title:TOUR?'BMW E30 Touring':'BMW E30',tagline:'Drive it. Park it. Modify it.',paints:PAINTS,stages,pre,post,presets:TOUR?PRESETS_T:PRESETS,trunkLabel:TOUR?'Tailgate':'Trunk',rearDoors:TOUR,coverLabel:TOUR?'Cover out':undefined,
  camOpens:{engine:{hood:1},interior:{doorL:1}},
  sigs:{wheels:c=>[c.wheel,c.brakes,c.spacerF,c.spacerR],engine:c=>[c.engine,c.gearbox,c.swapkit,c.turbo],seats:c=>[c.seats,c.shifter,c.handbrake,c.mirrorHang,c.trunk,c.rearArea,c.passArea,c.dashPlush,!!byId('frame',c.frame).deletesRearSeat,!!(c.removed&&c.removed.rearSeat),!!(c.removed&&c.removed.passengerSeat)],steering:c=>c.steering,shifter:c=>c.shifter,exhaust:c=>c.exhaust,aero:c=>[...AERO_SLOTS.map(s=>c[s]),c.frame,!!(c.removed&&c.removed.bumperF),!!(c.removed&&c.removed.bumperR)],suspension:c=>c.suspension,removed:c=>c.removed||{}},
  cockpit:()=>({eye:cp.eye,look:[60,48]}),
  sound:{cyl:6},
  // camera presets in the car's own frame (psi = the car's heading)
  camPresets:(psi,P2)=>({showroom:{az:psi+.9,el:.2,dist:300,ty:26,ox:0,oy:0,oz:0},front:{az:psi+P2,el:.12,dist:300,ty:26,ox:0,oy:0,oz:0},rear:{az:psi-P2+.35,el:.16,dist:300,ty:28,ox:-10,oy:0,oz:0},
    engine:{az:psi+P2+.35,el:.95,dist:190,ty:26,ox:68,oy:0,oz:0},wheels:{az:psi+.25,el:.1,dist:140,ty:15,ox:60,oy:0,oz:30},interior:{az:psi+Math.PI-.5,el:.6,dist:190,ty:38,ox:4,oy:0,oz:-8},under:{az:psi+.7,el:.03,dist:240,ty:8,ox:0,oy:0,oz:0}}),
  apply:{wheels:()=>setWheels(),engine:()=>setEngine(cfg.engine,cfg.gearbox),seats:()=>setSeats(cfg.seats,!!byId('frame',cfg.frame).deletesRearSeat||!!(cfg.removed&&cfg.removed.rearSeat)),steering:()=>setSteering(cfg.steering),shifter:()=>setShifter(),exhaust:()=>setExhaust(cfg.exhaust),aero:()=>setAero(cfg,cfg.frame),suspension:()=>setSprings(cfg.suspension),removed:applyRemoved},
  onLoaded:()=>{}
};
};}
