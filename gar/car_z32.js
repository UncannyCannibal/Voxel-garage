/* ===== CAR MODULE: Nissan Fairlady Z 300ZX Twin Turbo (Z32, CZ32), 2-seater, T-bar roof, JDM right-hand drive. Body measured from the-blueprints.com drawing
   and the Commons photographs (z32_body.js, z32_detail.js, ref/z32/SOURCES.md); cabin, bay and running gear from the generic builders (rig_gen.js, rig_gen_ext.js)
   with the Z32's own parameters (z32_rig.js): a longitudinal V6 behind the front axle, the gearbox in the tunnel, a two-piece driveshaft to the final drive,
   upper and lower arms at each corner (Nissan's multi-link drawn as A-arms), the rear half-shafts.
   World units: 1 unit = 20 mm; x forward, y up, z = the car's right; x = 0 is the middle of the wheelbase. ===== */
CAR_MODULES.z32=function(G){
'use strict';
const {mkFrameSeals,THREE,scene,camera,carRoot,body,P,wheels,MIRRORS,state,anim,phys,keys,mk,paintable,mkGlass,mkPane,mkGlassSheet,SKIN,group,bufGeo,makeMirror,swapGeo,matPaint,matV,matGlass,matMirror,matMirrorPaint,matHead,matTailRed,matTailAmb,matTailWht,matFrontAmb,cfg,D2R,clamp,lerp,V3,Q,yAxis,zAxis,segTo,bodyM,bodyPt,build,$}=G;
const PAINTS=[['Super red',0xb3221e],['Black pearl',0x15171c,'metallic'],['Pearl white',0xe4e4de,'metallic'],['Platinum silver',0x9aa0a6,'metallic'],['Deep jade pearl',0x1f4a46,'metallic'],['Aztec gold',0xa88a3e,'metallic'],['Shadow blue',0x2a3f66,'metallic'],['Yellow pearl',0xdcb42a,'metallic']];   // [name, colour, finish]
const ZG=makeZ32(),RG=makeRig(ZG,Z32_RIG),SU=Z32_RIG.susp;
const {NOSE_X,REAR_X,AX_F,AX_R,WR,BELT,ROOF,DOOR_F,DOOR_R,halfAt}=ZG,cp=Z32_RIG.cp,DS=Z32_RIG.dash,BAY=Z32_RIG.bay,PW=Z32_RIG.power,SIDE=cp.side||1;
const SHAKE_SLOW=.2,CRANK_SLOW=.035,ACC={alt:6/3.5,fan:6/5};
const HOOD_HINGE=ZG.HOOD_HINGE,HATCH_HINGE=ZG.HATCH_HINGE;
// the steering axis 100 mm inboard of the stock wheel's centre plane (as the EF's); ball joints follow the knuckle
const SH=SHELLS.z32,KZ=(SH.hubFaceZ-SH.stockET)/20-6.5,ZK=KZ,KZR=KZ+((SH.hubFaceZR||SH.hubFaceZ)-SH.hubFaceZ)/20,WB=AX_F-AX_R;   // KZR: the rear corner, 20 mm further out per side (the rear track is 40 mm wider than the front)   // the 225 tyre is wider than the EF's: the steering axis 130 mm inboard of the wheel's centre plane
// steering lock from the catalogue's 5.3 m minimum turning radius (outer front wheel, E): bicycle angle atan(WB/(sqrt(R^2-WB^2)-track/2))
const MAX_STEER=Math.atan(2450/(Math.sqrt(5300*5300-2450*2450)-1495/2));
function ackermann(d){if(Math.abs(d)<1e-6)return [0,0];const Rr=WB/Math.tan(Math.abs(d)),inn=Math.atan(WB/(Rr-KZ)),out=Math.atan(WB/(Rr+KZ));return d>0?[inn,out]:[-out,-inn];}
const turnPhase=()=>Math.floor(state.t*1.5)%2===0;
let WY=WR;
const stages=[];
function stage(label,fn){stages.push([label,fn]);}
// the door glass lowered in steps of 40 mm along its own surface (as the E30's and the EF's)
function glassSteps(Gr,sd){const outer=new Map(),bottom=new Map(),K=(i,j)=>i+','+j;
  for(const [i,j,k] of Gr.list()){const a=Math.abs(k),key=K(i,j);if(!outer.has(key)||a>outer.get(key))outer.set(key,a);if(!bottom.has(i)||j<bottom.get(i))bottom.set(i,j);}
  const out=[];for(let s=0;s<=10;s++){const T=s*4,N=new Grid(Gr.x0,Gr.x1,Gr.y0,Gr.y1,Gr.z0,Gr.z1);
    for(const [i,j,k,v] of Gr.list()){const r=j-T;if(r<bottom.get(i))continue;const kn=outer.get(K(i,r));if(kn===undefined)continue;N.set(i,r,sd*(kn-(outer.get(K(i,j))-Math.abs(k))),v);}
    out.push(N);}
  return out;}
function byIdSafe(slot,id){return byId(slot,id)||byId(slot,'stock');}

stage('Shaping the body panels',()=>{
  SKIN.mode='voxel';   // PAINT-03: set again (an edit had left it inside the comment, so the Z32 drew in whatever mode the car before it left: smooth skins when it was the first car opened)
  PCA_R=PAINT_PCA_R;   // smooth paint (e30_core.js PAINT_PCA_R, owner Nov 13); was 0;   // voxel panels like the E30 and the EF (the owner's look): 10 mm terraces on the measured surfaces
  const r=buildZ32Body(ZG);build.r=r;build.ZG=ZG;const H=r.hi;
  build.lamps=z32Lamps(ZG,H);z32Flap(ZG,H);   // lenses are the panel skin, moved out of the panels before their meshes are made; the fuel flap's shut line in the left quarter
  const GL_=Object.values(H.glass),SM={body:[H.hood,H.trunk,H.doorL,H.doorR,...GL_],hood:[H.body,H.doorL,H.doorR,...GL_],trunk:[H.body,...GL_],doorL:[H.body,H.hood,H.trunk,H.doorR,...GL_],doorR:[H.body,H.hood,H.trunk,H.doorL,...GL_]};
  const gpWS=glassPane(H.glass.ws,{bodies:[H.body,H.hood],rLo:1.5,rHi:4,surf:ZG.solidAt,lift:.1});
  const FL=.4;
  P.bodyMesh=paintable(H.body,body,undefined,.5,{o:SM.body,wy:[.45,.8],flank:FL,snap:ZG.solidAt});
  const hh=group(body,HOOD_HINGE[0],HOOD_HINGE[1],0),hm=paintable(H.hood,hh,undefined,.5,{o:SM.hood,wy:[.45,.8],flank:FL,snap:ZG.solidAt});hm.position.set(-HOOD_HINGE[0],-HOOD_HINGE[1],0);P.hood=hh;
  const th=group(body,HATCH_HINGE[0],HATCH_HINGE[1],0),tm=paintable(H.trunk,th,undefined,.5,{o:SM.trunk,wy:[.45,.8],flank:FL,snap:ZG.solidAt});tm.position.set(-HATCH_HINGE[0],-HATCH_HINGE[1],0);P.trunk=th;
  // hatch glass: the voxel sheet over its own cells, inside the hatch's rubber ring, riding on the hatch
  {const m=mkGlassSheet(H.glass.rw,th,.5,ZG.solidAt,undefined,[H.trunk]);P.paneRW={pane:m,meshes:[m]};if(m)m.position.set(-HATCH_HINGE[0],-HATCH_HINGE[1],0);}
  // doors hinge on the outermost door skin at the front edge
  let zOut=0;for(const D of [H.doorL,H.doorR])for(const [i,j,k] of D.list())if(i/2>=DOOR_F-1.5)zOut=Math.max(zOut,Math.abs(k)/2);
  build.doorHingeZ=zOut;
  const doorMesh={};for(const sd of [-1,1]){
    const hz=sd*zOut,dg=group(body,DOOR_F,0,hz),DG=sd<0?H.doorL:H.doorR,dm=paintable(DG,dg,undefined,.5,{o:sd<0?SM.doorL:SM.doorR,wy:[.45,.8],flank:FL,snap:ZG.solidAt});dm.position.set(-DOOR_F,0,-hz);doorMesh[sd<0?'L':'R']=dm;
    // frameless door glass: winding it down slides the pane down along its own curved surface, 0..400 mm in 11 steps; the part inside the door is not drawn
    const GS=glassSteps(sd<0?H.glass.dgL:H.glass.dgR,sd).map((Gr,i)=>{const m=mkGlass(Gr,'side',dg,.5);if(m){m.position.set(-DOOR_F,0,-hz);m.visible=i===0;}return m;});
    P['door'+(sd<0?'L':'R')]=dg;P['dglass'+(sd<0?'L':'R')]=GS;
    const mr=z32Mirror(ZG,sd);
    for(const Gm of [mr.shell,mr.glass])for(const [i,j,k] of Gm.list())if(H.body.get(i,j,k)>=0||DG.get(i,j,k)>=0)Gm.set(i,j,k,-1);   // seated on the sail, never inside it
    let mSelf;{const ms=paintable(mr.shell,dg,undefined,.5,{seat:ZG.solidAt});ms.position.set(-DOOR_F,0,-hz);const mg=mk(mr.glass,matMirror,0,dg,.5);if(mg)mg.position.set(-DOOR_F,0,-hz);mSelf=[ms,mg].filter(Boolean);}
    MIRRORS.push(makeMirror(dg,new THREE.Vector3(mr.glassCenter[0]-DOOR_F,mr.glassCenter[1],mr.glassCenter[2]-hz),mr.glassSize[0],mr.glassSize[1],'door'+(sd<0?'L':'R'),-sd*(sd===cp.side?12:14)*D2R,mSelf));
    const dc=mk(genDoorCard(sd,DG,{x0:DOOR_R+2,x1:DOOR_F-2.5,y0:Z32_RIG.doorCard.y0,y1:BELT-1.2,trim:0x4a4d53,hi:1,xMin:y=>ZG.doorRear(y)+1.5}),matV,0,dg,.5);if(dc){dc.position.set(-DOOR_F,0,-hz);(P.doorCards=P.doorCards||[]).push(dc);}
    // door pull: the black handle recess near the door's rear top (MEASURED side view 2724-2850 mm, 681-739 mm), seated on the skin
    {const Hd=Z32D.handle,hx=ZG.wx((Hd.x0+Hd.x1)/2),hy=ZG.u((Hd.y0+Hd.y1)/2),I=Math.round(hx*2),J=Math.round(hy*2);let ks=null;for(let k=95;k>=40;k--)if(DG.get(I,J,sd*k)>=0){ks=k/2;break;}
     const hd=mk(buildHandle(),matV,0,dg);hd.position.set(hx+(sd>0?3.5:-3.5)-DOOR_F,hy,sd*((ks||halfAt(hx,hy))-.2)-hz);hd.rotation.y=sd>0?-Math.PI/2:Math.PI/2;}   // 140 mm long, centred on the measured pull
  }
  P.frameSeals=mkFrameSeals([{g:H.body,grp:P.bodyMesh},{g:H.doorL,grp:doorMesh.L},{g:H.doorR,grp:doorMesh.R},{g:H.trunk,grp:tm},{g:H.hood,grp:hm}],Object.values(H.glass),{fenceGlass:[H.glass.ws]});   // smooth rubber lines on the window frames (frame_seal.js, owner Nov 13)
  const g=H.glass;{const m=mkGlassSheet(g.ws,body,.5,ZG.solidAt,undefined,[H.body]);P.paneWS={pane:m,gp:gpWS,meshes:[m]};}P.glassWS=P.paneWS.pane;
  P.glassQL=mkGlass(g.qgL,'side',body,.5);P.glassQR=mkGlass(g.qgR,'side',body,.5);
  // T-bar roof panels: tinted glass on the roof either side of the spine (removable: 'T-tops off' in the build)
  P.ttops=[mkGlassSheet(g.ttL,body,.5,ZG.solidAt,undefined,[H.body]),mkGlassSheet(g.ttR,body,.5,ZG.solidAt,undefined,[H.body])].filter(Boolean);
});

stage('Fitting bumpers, lamps and trim',()=>{
  const bf=z32Bumper(ZG,true),bb=z32Bumper(ZG,false);build.bf=bf;build.bb=bb;
  P.bumperF=paintable(bf.grid,body,undefined,.5,{seat:ZG.solidAt});P.bumperR=paintable(bb.grid,body,undefined,.5,{seat:ZG.solidAt});
  const MATS={frame:matV,head:matHead,fog:matHead,famb:matFrontAmb,red:matTailRed,hmsl:matTailRed,amb:matTailAmb,wht:matTailWht,garnish:matV};
  const add=(lamps,parent,off)=>{for(const k in lamps){const m=mk(lamps[k],MATS[k]||matV,0,parent,.5);if(m){if(off)m.position.set(...off);(P['lamp_'+k]=P['lamp_'+k]||[]).push(m);}}};
  const L=build.lamps,onHatch={},onBody={};for(const k in L)(k==='garnish'||k==='hmsl'?onHatch:onBody)[k]=L[k];
  add(onBody,body);add(onHatch,P.trunk,[-HATCH_HINGE[0],-HATCH_HINGE[1],0]);
  for(const k in bf.lamps){const m=mk(bf.lamps[k],MATS[k]||matV,0,P.bumperF,1);if(m)(P['lamp_'+k]=P['lamp_'+k]||[]).push(m);}
  for(const k in bb.lamps){const m=mk(bb.lamps[k],matV,0,P.bumperR,1);if(m)(P.rearRefl=P.rearRefl||[]).push(m);}   // the side reflectors do not light
  P.tailRed=P.lamp_red||[];P.tailAmb=P.lamp_amb||[];P.tailWht=P.lamp_wht||[];P.frontAmb=P.lamp_famb||[];P.head=P.lamp_head||[];
  {const B=z32Badges(build.r.hi,L);P.badges=[];P.tailLetters=[];for(const it of B.body){const m=mk(it.grid,matV,0,body,it.scale,.01);if(m)P.tailLetters.push(m);}   // the 300ZX letters are on the body's lamp panel; NISSAN rides on the hatch
   for(const it of B.hatch){const m=mk(it.grid,matV,0,P.trunk,it.scale,.01);if(m){m.position.set(-HATCH_HINGE[0],-HATCH_HINGE[1],0);P.badges.push(m);}}}
  // licence plates on the bumpers (JDM size 330 x 165 mm), in the recesses
  const plate=(front,pl)=>{const w=Math.round(pl.w/20),h=Math.round(pl.h/10);const g=new Grid(front?0:-1,front?1:0,0,h,-w,w);g.fill((x,y,z)=>{const az=Math.abs(z);return (az>=w||y<=0||y>=h)?0x20262c:COL.white;});return g;};
  const plateX=(front,B)=>front?(B.plate.backI+1)/2:(B.plate.backI-1)/2;   // the plate's back face on the pocket's back wall
  const pf=mk(plate(true,bf.plate),matV,0,body,.5);pf.position.set(plateX(true,bf),ZG.u(bf.plate.y-bf.plate.h/2),0);P.plateF=pf;
  const pr=mk(plate(false,bb.plate),matV,0,body,.5);pr.position.set(plateX(false,bb),ZG.u(bb.plate.y-bb.plate.h/2),0);P.plateR=pr;
});

/* ---------- running gear helpers (10 mm cells, absolute) ---------- */
function genDiffZ32(){const h=HC(),x0=AX_R,y0=WR,ALU=0x7d8288,CI=0x5c6168;   // R230 final drive (cast iron carrier, finned aluminium cover), mounted to the rear sub-frame
  h.cyl('z',x0+.5,y0,6,-6,6,(u,d)=>CI);
  h.cyl('x',y0,0,6.4,x0-5,x0-3.5,(u,d)=>(d>4.8&&Math.round(d*2)%2===0)?0x6b7076:ALU);for(let k=-8;k<=8;k+=2)h.box(x0-5.5,x0-5,y0-5,y0+5,k/2,k/2,ALU);
  h.cyl('x',y0-1.25,0,3.4,x0+4.5,x0+7.5,CI);h.cyl('x',y0-1.25,0,2.5,x0+7.5,x0+8.5,0x8d9298);
  for(const s of [-1,1])h.cyl('z',x0,y0,2.1,s*6,s*7.25,0x8d9298);
  return h.grid();}
// under the body: front sub-frame (rails and the cross-member under the engine), rear sub-frame members, the saddle fuel tank over the driveshaft under the cargo deck
function genUnderZ32(){const U=Z32_RIG.under,h=HC(),c=0x24262a,c2=0x3a3d42;
  for(const s of [-1,1]){h.box(U.railX0,U.railX1,U.subY,U.subY+1.5,s*U.railZ-1,s*U.railZ+1,c);h.box(U.brkX-1,U.brkX+1,U.subY-.5,U.subY+2,s*(U.railZ-1),s*(U.railZ+2),c2);}
  h.box(AX_F-4.5,AX_F-1.5,U.subY,U.subY+2,-U.railZ,U.railZ,c);                                   // front cross-member under the engine (the engine mounts sit on it)
  const R=U.rearRails,ry=U.rearY;for(const s of [-1,1])h.box(R.x0,R.x1,ry,ry+1.5,s*R.z-1,s*R.z+1,c);h.box(R.x1-1.5,R.x1,ry,ry+1.5,-R.z,R.z,c);h.box(R.x0,R.x0+1.5,ry,ry+1.5,-R.z,R.z,c);   // above the exhaust run
  const T=U.tank;h.box(T.x0,T.x1,T.y1-2.5,T.y1,-T.half,T.half,0x2f3237);for(const s of [-1,1])h.box(T.x0,T.x1,T.y0,T.y1-2.5,s*3.75,s*T.half,0x2f3237);   // saddle: a bridge over the shaft, a leg either side
  for(const s of [-1,1])h.box(T.x0+2,T.x0+2.5,T.y0-.5,T.y0,s*4,s*T.half,0x8d9298);
  return h.grid();}

stage('Mounting the engine bay',()=>{
  P.bay=mk(RG.bay(),matV,0,body);
  const eg=group(body,PW.x,PW.crankY,0);P.engGroup=eg;P.engine=eg;
  P.crankP=group(eg);P.altP=group(eg);P.fan=group(eg);P.psP=group(eg);
  P.hoses=new THREE.Mesh(new THREE.BufferGeometry(),matV);P.hoses.scale.setScalar(.5);body.add(P.hoses);
  P.mounts=new THREE.Mesh(new THREE.BufferGeometry(),matV);P.mounts.scale.setScalar(.5);body.add(P.mounts);
  P.under=mk(genUnderZ32(),matV,0,body,.5);
  P.diff=mk(genDiffZ32(),matV,0,body,.5);
  P.ds=[0,1].map(i=>{const g=group(body),m=mk(genShaftE30(70,i===0),matV,0,g);return {nm:i?'DSR':'DSF',g,m};});
  P.cbear=new THREE.Mesh(new THREE.BufferGeometry(),matV);P.cbear.scale.setScalar(.5);body.add(P.cbear);
  P.driveshaft=P.ds[0].m;
  setEngine(cfg.engine||SH.stock.engine,cfg.gearbox||SH.stock.gearbox);
  {const tip=byIdSafe('exhaust',cfg.exhaust||SH.stock.exhaust).tip,F=exhF();P.exh=mk(genExhaust(ZG,tip,F),matV,0,body);P.exhTips=mk(genExhaustTips(tip,F),matV,0,body,.5,.02);}
});

stage('Furnishing the cabin',()=>{
  P.interior=mk(RG.interior(),matV,0,body);
  {const dd=mk(RG.dashDetail(),matV,0,body,.5,.03);dd.position.set(...RG.dashDetailPos);P.dashDetail=dd;}
  const W0=cp.wheel,sw=group(body,W0.x,W0.y,W0.z);sw.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),new THREE.Vector3(...W0.n).normalize());
  // interior mirror on the windshield header, sun visors on the header (the T-bar roof's glass starts 120 mm behind it, so the visors are 90 mm deep)
  {const im=buildInteriorMirror(build.r);const a=mk(im.shell,matV,0,body,.5),b=mk(im.glass,matMirror,0,body,.5);a.position.set(...im.pos);b.position.set(...im.pos);P.imirror=[a,b];P.visors=[];
   MIRRORS.push(makeMirror(body,new THREE.Vector3(...im.glassCenter),im.glassSize[0],im.glassSize[1],'interior',cp.side*9*D2R,[a,b]));
   const xt=wsTopEdgeI(build.r.hi)/2;for(const sd of [-1,1]){const v=visorOnHeadliner(build.r,sd,xt-5.5,xt-1.5,8.25,25.75),vm=mk(v.grid,matV,0,body,.5);vm.position.set(...v.pos);P.visors.push(vm);}}
  const swi=group(sw,0,0,0);P.swheel=swi;P.swm=mk(genSteeringWheel(370,{}),matV,0,swi,.5);P.swm.position.set(0,0,-.75);
  {const bz=Math.round(-Z32_RIG.columnGap*2)-1,bg=new Grid(-3,3,-3,3,bz,-2);bg.fill((x,y,z)=>Math.hypot(x,y)<=2.4?0x1a1b1d:-1);P.swBoss=mk(bg,matV,0,swi,.5);}   // the wheel's hub boss on the column's shaft
  setSeats();
  // gauges in the binnacle in front of the driver: tachometer in the middle-left, speedometer right (Z32 layout), 90 mm dials
  for(const [z,name,mark] of [[cp.H.z-4.5,'tach',8],[cp.H.z+4.5,'speedo',12]]){
    const f=mk(buildGaugeFace(4.5,mark),matV,0,body,.5);f.position.set(DS.rearX-1.5,DS.top+1.5,z);(P.gaugeFaces=P.gaugeFaces||[]).push(f);
    const nd=group(body,DS.rearX-1.7,DS.top+1.5,z);const nm=mk(buildNeedle(3.8),matV,0,nd,.5);nm.rotation.z=Math.PI/2;P[name]=nd;}
  cp.pedals.forEach(([n,z,w,h])=>{const pg=group(body,cp.pedalX,cp.pedalY,z);mk(genPedal(w,h,cp.pedalLen),matV,0,pg,.5);P['ped_'+n]=pg;});
  {const zs=cp.pedals.map(p=>p[1]);P.pedalBox=mk(genPedalBox(cp.pedalX,cp.pedalY,Math.min(...zs)-3,Math.max(...zs)+3,solidOf([build.r.hi.body],[P.interior.geometry.userData.src,P.bay.geometry.userData.src])),matV,0,body,.5);}
  const sh=group(body,cp.shifter.x,cp.shifter.y+.5,0);mk(genShifter(15,cfg),matV,0,sh,.5,.02);P.shifter=sh;
  // wipers (RHD): pivots on the cowl under the glass's lower edge, parked toward the left; the blades lie on the glass (glass_trim.js wiperRig)
  P.wiperRig=wiperRig(P.paneWS.gp,body,[{pivot:-SIDE*36,park:5,arm:40,blade:46,sweep:72,dir:SIDE},{pivot:SIDE*4,park:3,arm:38,blade:42,sweep:66,dir:SIDE}],.5);P.wipers=[];P.wiperPivots=[];
  // hatch gas struts: ball studs on the body inside the opening by the quarter's top, and on the hatch frame beside the glass (DESIGN)
  {const cylG=bufGeo(geoData(genLink(28,1.15,0x1b1c1e),0,0,0)),rodG=bufGeo(geoData(genLink(28,.45,COL.chrome),0,0,0));
   const Hb=build.r.hi.body,Ht=build.r.hi.trunk;
   // lower stud: one cell inside the body's inner skin by the quarter's top (840 mm up, 3600 mm back); upper stud: one cell under the hatch's inner face beside the glass
   const inner=(x,y,sd)=>{const I=Math.round(x*2),J=Math.round(y*2);let k=95;while(k>30&&Hb.get(I,J,sd*k)<0)k--;while(k>30&&Hb.get(I,J,sd*k)>=0)k--;return k/2-.5;};
   const under=(x,z)=>{const I=Math.round(x*2),K=Math.round(z*2);for(let j=Ht.y0;j<=Ht.y1;j++)if(Ht.get(I,j,K)>=0)return j/2-.9;return 52;};
   P.struts=[];for(const sd of [-1,1]){const a=new THREE.Mesh(cylG,matV),b=new THREE.Mesh(rodG,matV);body.add(a);body.add(b);const bx=ZG.wx(3640),hx=ZG.wx(3360),zb=22,zh=27.5;   // lower stud on the cargo side trim's outer face (720 mm up), upper on the hatch frame beside the glass
     P.struts.push({nm:'S'+(sd<0?'L':'R'),cyl:a,rod:b,B0:new V3(bx,36,sd*zb),H0:new V3(hx,under(hx,sd*zh),sd*zh)});}}   // the lower stud on the opening's side flange, inside the C-pillar
});

stage('Assembling wheels and suspension',()=>{
  const w0=cfg.wheel||SH.stock.wheel,ty0=tyreFor(w0.dia,w0.width,w0.tw,w0.ar);
  const tireG=bufGeo(geoData(buildTireP(ty0.OD,ty0.tw,w0.dia,w0.width),0,.03,0)),rimG=bufGeo(geoData(buildRimP(w0.style,w0.dia,w0.width,w0.et,'plain',{exact:1}),0,.03,0)),
        rotG=bufGeo(geoData(buildRotorP(296),0,.03,0)),calG=bufGeo(geoData(buildCaliperP(296,'4pot',1),0,.03,0));
  P.rimMeshes=[];
  const zc0=(SH.hubFaceZ-w0.et)/20;
  const hub=(name,x,sd,steer)=>{
    const c=group(carRoot,x,WR,sd*(steer?KZ:KZR)),cb=group(c,0,-5.5,0),st=group(cb,0,5.5,0),off=group(st,0,0,sd*(zc0+((steer?cfg.spacerF:cfg.spacerR)||0)/20-KZ)),fl=group(off);if(sd<0)fl.rotation.y=Math.PI;
    const sp=group(fl);
    const tire=new THREE.Mesh(tireG,matV);tire.scale.setScalar(.5);sp.add(tire);
    const rim=new THREE.Mesh(rimG,matV);rim.scale.setScalar(.5);sp.add(rim);P.rimMeshes.push(rim);
    const rot=new THREE.Mesh(rotG,matV);rot.scale.setScalar(.5);sp.add(rot);
    const cg=group(fl);cg.rotation.z=sd<0?Math.PI:0;const cal=new THREE.Mesh(calG,matV);cal.scale.setScalar(.5);cg.add(cal);
    const kn=new THREE.Mesh(bufGeo(geoData(z32Knuckle(sd,steer,296),0,.03,0)),matV);kn.scale.setScalar(.5);st.add(kn);
    wheels[name]={c,cb,st,off,sp,sd,steer,tire,rim,rot,cal,cg,kn};
  };
  hub('FL',AX_F,-1,true);hub('FR',AX_F,1,true);hub('RL',AX_R,-1,false);hub('RR',AX_R,1,false);
  const LK=Z32_RIG.links,armG=bufGeo(geoData(genLink(LK.n,LK.arm,0x2b2e33),0,0,0)),rodG=bufGeo(geoData(genLink(LK.n,LK.rod,0x3a3d42),0,0,0)),
        DM=Z32_RIG.damper,strG=bufGeo(geoData(genDamper(DM.n,DM.bodyR,DM.rodR,DM.bodyFrac),0,0,0)),sprG=coilGeo(true),sprGR=coilGeo(false),hsG=bufGeo(geoData(genHalfShaftE30(LK.n),0,0,0));
  P.links=[];
  const mkSeg=(geo,mat)=>{const m=new THREE.Mesh(geo,mat||matV);carRoot.add(m);return m;};
  for(const nm of ['FL','FR','RL','RR']){
    const L={nm,lowF:mkSeg(armG),lowR:mkSeg(armG),upF:mkSeg(armG),upR:mkSeg(armG),strut:mkSeg(strG),spring:mkSeg(nm[0]==='F'?sprG:sprGR)};
    if(nm[0]==='F')L.rod=mkSeg(rodG);else{L.trail=mkSeg(rodG);L.shaft=mkSeg(hsG);}
    P.links.push(L);
  }
  P.rack=mk(RG.rack(),matV,0,body);P.rack.position.set(AX_F+SU.front.rack.dx,SU.front.rack.y,0);
  const sg=new THREE.Mesh(new THREE.PlaneGeometry(285,142),G.shadowMat());
  sg.rotation.x=-Math.PI/2;sg.position.set(0,.25,0);carRoot.add(sg);
  for(const sd of [-1,1]){const sl=new THREE.SpotLight(0xfff0cf,0,1400,.5,.55,1);sl.position.set(NOSE_X-12,31,sd*24);carRoot.add(sl);const tg=new THREE.Object3D();tg.position.set(500,6,sd*24);carRoot.add(tg);sl.target=tg;(P.beams=P.beams||[]).push(sl);}
});

/* ---------- helpers ---------- */
// exhaust route (z32_rig.js exh) from the turbines' front pipes; anchors for the Japanese tails
function exhF(){const X=Z32_RIG.exh,F=Object.assign({},X,{y0:X.frontY,z0:X.zRun,front:build.frontPipes||[]});
  F.raceDrop=0;   // the race pipe on the run's own line: 20 mm lower would leave it 92 mm off the ground under this floor
  F.tipYOf=t=>t==='quad'?X.tipY:(['stock','single','race','catback','dual','oval'].includes(t)?8.75:undefined);   // the quad tips sit in the valance's four cut-outs; every other layout hangs under the bumper (its bottom is 230 mm up), 125 mm off the ground
  let rx=1e9;if(build.bb)for(const [i,j] of build.bb.grid.list())if(j<=60)rx=Math.min(rx,i);rx=rx===1e9?REAR_X:(rx-.5)/2;
  F.jdm={out:[X.mufX1,X.pipeY,0],rearX:rx,botY:Z32D.bumperR.bot/20,tyZ:[-6,6],spears:{3:[[-9,0],[0,0],[9,0]],4:[[-12,0],[-4,0],[4,0],[12,0]]},topY:62.5,side:{from:[-36,X.pipeY,X.zRun],sg:1,y:6.6,z:halfAt(-36,8)}};
  return F;}
// suspension pick-up points for a corner, body frame
function suspPts(front,sd){const S=front?SU.front:SU.rear,ax=front?AX_F:AX_R,bp=a=>[ax+a[0],a[1],sd*a[2]],ZK=front?KZ:KZR;
  return {lowF:bp(S.lowF),lowR:bp(S.lowR),upF:bp(S.upF),upR:bp(S.upR),strutTop:bp(S.strutTop),trail:S.trail?bp(S.trail):null,
          lbj:[ax,WY+S.lbj[0],sd*(ZK+S.lbj[1])],ubj:[ax,WY+S.ubj[0],sd*(ZK+S.ubj[1])],strutLow:[ax+S.strutDx,WY+S.strutLy,sd*(ZK-S.strutLowDz)],springTopY:S.springTopY,springLow:S.springLow||.3};}
// the knuckle in its steering frame (kingpin at hub height): hub-bearing housing, upright between the ball joints inboard of the tyre, steering arm (front), caliper lug, toe-link lug (rear)
function z32Knuckle(sd,front,rotorMM){const hubIn=(SH.hubFaceZ-45)/20-KZ,S=front?SU.front:SU.rear;
  return genKnuckle(sd,{boss:[0,hubIn-.25,2.25],lbj:S.lbj[0],ubj:S.ubj[0],armZ:[-1,-.5],steer:front?[5.5,-3.2,-.8]:null,cal:[-(.6*rotorMM/40)+.05,0,hubIn-.75],trail:front?null:[0,SU.rear.trailY,.5]});}
const rotK=(p,sd,th)=>{if(!th)return p;const dx=p[0]-AX_F,dz=p[2]-sd*KZ;return [AX_F+dx*Math.cos(th)+dz*Math.sin(th),p[1],sd*KZ-dx*Math.sin(th)+dz*Math.cos(th)];};

/* ---------- per-frame animation ---------- */
function pre(dt){
  const ease=(k,tg,sp)=>{anim[k]+=(tg-anim[k])*Math.min(1,dt*sp);return anim[k];};
  P.doorL.rotation.y=-ease('doorL',state.doorL,6)*62*D2R;P.doorR.rotation.y=ease('doorR',state.doorR,6)*62*D2R;
  P.hood.rotation.z=ease('hood',state.hood,4)*55*D2R;P.trunk.rotation.z=-ease('trunk',state.trunk,4)*58*D2R;
  {const th=P.trunk.rotation.z,c=Math.cos(th),s=Math.sin(th),hx=HATCH_HINGE[0],hy=HATCH_HINGE[1];   // gas struts follow the hatch
   if(P.struts)for(const S of P.struts){const dx=S.H0.x-hx,dy=S.H0.y-hy,H=new V3(hx+dx*c-dy*s,hy+dx*s+dy*c,S.H0.z),d=new V3().subVectors(H,S.B0),L=d.length(),M=new V3().copy(S.B0).addScaledVector(d,Math.min(14,L-1.5)/L);
     segTo(S.cyl,S.B0,M,zAxis,28,.5);segTo(S.rod,M,H,zAxis,28,.5);}}
  const wv=ease('win',state.win,5),ws=Math.round(wv*10);for(const k of ['dglassL','dglassR'])P[k].forEach((m,i)=>{if(m)m.visible=i===ws;});
  if(P.ttops)for(const m of P.ttops)m.visible=!state.cover;   // 'T-tops off': the two glass panels come out (stowed)
}
const camberOf=front=>(front?(cfg.camberF||0):(cfg.camberR||0))*D2R;
function post(dt){
  const lift=WY-WR;if(lift){body.position.y+=lift;body.updateMatrix();bodyM.copy(body.matrix);}
  const [aL,aR]=ackermann(state.delta);
  for(const k in wheels){const w=wheels[k];w.c.position.y=WY;w.cb.rotation.x=w.sd*camberOf(w.steer);w.st.rotation.y=w.steer?(w.sd<0?aL:aR):0;w.sp.rotation.z=(w.sd<0?1:-1)*state.spin;}
  const camP=(v,sd,front)=>{const c=sd*camberOf(front),py=WY-5.5,pz=sd*(front?KZ:KZR),dy=v.y-py,dz=v.z-pz;v.y=py+dy*Math.cos(c)-dz*Math.sin(c);v.z=pz+dy*Math.sin(c)+dz*Math.cos(c);return v;};
  const RK=SU.front.rack,knk=sd=>[AX_F+5.5,WY-3.2,sd*(ZK-.8)],kL=rotK(knk(-1),-1,aL),kR=rotK(knk(1),1,aR),rackShift=((kL[2]-knk(-1)[2])+(kR[2]-knk(1)[2]))/2;
  P.rack.position.set(AX_F+RK.dx,RK.y,rackShift);
  const LK=Z32_RIG.links,V=a=>new V3(a[0],a[1],a[2]),B=a=>bodyPt(a[0],a[1],a[2]);
  for(const L of P.links){
    const front=L.nm[0]==='F',sd=L.nm[1]==='R'?1:-1,S=suspPts(front,sd),th=front?(sd<0?aL:aR):0,rk=p=>front?rotK(p,sd,th):p;
    const lbj=V(rk(S.lbj)),ubj=camP(V(rk(S.ubj)),sd,front);
    segTo(L.lowR,B(S.lowR),lbj,zAxis,LK.n,.5);segTo(L.lowF,B(S.lowF),lbj,zAxis,LK.n,.5);
    segTo(L.upF,B(S.upF),ubj,zAxis,LK.n,.5);segTo(L.upR,B(S.upR),ubj,zAxis,LK.n,.5);
    const lo=V(S.strutLow),up=B(S.strutTop),CO=Z32_RIG.coil,sTop=up.clone().addScaledVector(new V3().subVectors(lo,up).normalize(),(S.strutTop[1]-S.springTopY));
    const lp=B(S.lowR),armY=z=>{const t=Math.max(0,Math.min(1,(z-lp.z)/(lbj.z-lp.z)));return lp.y+(lbj.y-lp.y)*t;},yb=armY(lo.z);
    segTo(L.strut,new V3(lo.x,yb,lo.z),up,yAxis,Z32_RIG.damper.n,.5);   // the damper stands on the lower arm
    segTo(L.spring,new V3().lerpVectors(new V3(lo.x,yb,lo.z),up,S.springLow),sTop,yAxis,CO.n,.5);
    if(front)segTo(L.rod,B([AX_F+RK.dx,RK.y,sd*RK.half+rackShift]),camP(V(sd<0?kL:kR),sd,true),zAxis,LK.n,.5);
    else{segTo(L.trail,B(S.trail),camP(new V3(AX_R,WY+SU.rear.trailY,sd*(KZR+.5)),sd,false),zAxis,LK.n,.5);
      segTo(L.shaft,B([AX_R,WR,sd*7.25]),camP(V([AX_R,WY,sd*(KZR+.5)]),sd,false),zAxis,LK.n,.5);}   // half-shaft from the final drive's flange to the hub
  }
  const shake=(state.rpm/6000)*.35+.1,fireHz=state.rpm/60*(P.cyl||6)/2;
  P.engine.rotation.x=Math.sin(state.t*Math.PI*2*Math.min(fireHz*SHAKE_SLOW,12))*.0012*shake*60*((P.amp||.35)/.35);
  const crank=state.t*state.rpm/60*Math.PI*2*CRANK_SLOW;
  P.crankP.rotation.x=crank;P.altP.rotation.x=crank*ACC.alt;P.fan.rotation.x=crank*ACC.fan;
  for(const D of P.ds)D.m.rotation.z=-state.spin*phys.FINAL;
  if(P.swm)P.swm.visible=!state.swOff;
  P.swheel.rotation.z=state.sw||0;
  P.speedo.rotation.x=(-120+clamp(Math.abs(state.v)*3.6,0,240)/240*240)*D2R;P.tach.rotation.x=(-120+clamp(state.rpm,0,8000)/8000*240)*D2R;
  P.ped_gas.rotation.z=state.throttle*.2;P.ped_brake.rotation.z=state.brake*.24;P.ped_clutch.rotation.z=(state.shiftT>0?.42:0);   // hanging pedals swing forward, toward the firewall
  const g=state.gear,ss=shiftSS(cfg);   // short-throw: the lever moves less with every shift (SPEC-INTERIOR §2.4)
  P.shifter.rotation.z+=((g===1||g===3||g===5?-.12*ss:g===0?0:.12*ss)-P.shifter.rotation.z)*.2;
  P.shifter.rotation.x+=((g<=2?.1*ss:g<=4?0:-.1*ss)-P.shifter.rotation.x)*.2;
  const on=state.lights>0,haz=state.hazard>0,blink=(haz||state.signal)&&turnPhase(),braking=!!state.brakeLamp,reverse=state.gear===0;
  matHead.emissiveIntensity+=((on?1.1:0)-matHead.emissiveIntensity)*.3;
  for(const b of P.beams)b.intensity=on?1.6:0;
  matTailRed.emissiveIntensity=braking?1.4:(on?.55:.02);
  matTailAmb.emissiveIntensity=blink?1.5:0;matFrontAmb.emissiveIntensity=blink?1.5:0;matTailWht.emissiveIntensity=reverse?1.2:0;
  if(state.wipers){state.wipT=(state.wipT||0)+dt*2.2;}
  const wsw=state.wipers?(.5-.5*Math.cos(state.wipT||0)):0;anim.wip+=(wsw-anim.wip)*.4;
  if(P.wiperRig)P.wiperRig.update(anim.wip);
}

/* ---------- shop visuals ---------- */
let HOODLOW=null;
function hoodLow(x0,x1,z0,z1){if(!HOODLOW){HOODLOW=new Map();for(const [i,j,k] of build.r.hi.hood.list()){const key=i+','+k,v=HOODLOW.get(key);if(v===undefined||j<v)HOODLOW.set(key,j);}}
  let m=1e9;for(let i=Math.round(x0*2);i<=Math.round(x1*2);i++)for(let k=Math.round(z0*2);k<=Math.round(z1*2);k++){const v=HOODLOW.get(i+','+k);if(v!==undefined)m=Math.min(m,v/2-.25);}return m;}
// ---- clearance routing for what hangs off the engine (engine arms, front pipes, hoses). A candidate path is drawn as the page would draw it (the 10 mm cells within
// its radius of the line), 2 mm fatter, and tested cell by cell (a shared cell is a collision, a shared face is contact): against the engine's own grids exactly (the cell whose cube holds the path cell's centre: the
// block and its castings, the belt, the pulleys, the gearbox; tilt 0), against everything else placed so far on the lattice (sub-frame, rack, arms, pipes, the
// bay's battery and air box, the hoses already routed), and with body set against the body shell and the closed hood. skip: [point, distance, 'e' | 'a']: path
// cells within it are not tested against the engine ('e': the connection on the engine) or against anything ('a': the connection in the bay)
const OK_=(i,j,k)=>((i+600)*1200+(j+600))*1200+(k+600);
function capsule(pts,r,fn){const R=r*2,RR=R*R;   // the lattice cells (half-cell indices) within r of the polyline; fn returning true stops the walk (and capsule returns true)
  for(let s=0;s<pts.length-1;s++){const a=[pts[s][0]*2,pts[s][1]*2,pts[s][2]*2],b=[pts[s+1][0]*2,pts[s+1][1]*2,pts[s+1][2]*2],d=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],L2=d[0]*d[0]+d[1]*d[1]+d[2]*d[2]||1e-9;
    for(let i=Math.ceil(Math.min(a[0],b[0])-R);i<=Math.max(a[0],b[0])+R;i++)for(let j=Math.ceil(Math.min(a[1],b[1])-R);j<=Math.max(a[1],b[1])+R;j++)for(let k=Math.ceil(Math.min(a[2],b[2])-R);k<=Math.max(a[2],b[2])+R;k++){
      let t=((i-a[0])*d[0]+(j-a[1])*d[1]+(k-a[2])*d[2])/L2;t=t<0?0:t>1?1:t;const x=i-a[0]-t*d[0],y=j-a[1]-t*d[1],z=k-a[2]-t*d[2];if(x*x+y*y+z*z<=RR&&fn(i,j,k))return true;}}
  return false;}
function Occ(eng){const SO=new Set(),h=HC(),fl=()=>{for(const c of h.cells)SO.add(OK_(c[0],c[1],c[2]));h.cells.length=0;},HB=build.r.hi;
  const inEng=(i,j,k)=>{const a=Math.round((i/2-eng.x0)*2),b=Math.round((j/2-eng.cy)/(.5*eng.sy)+eng.pc);for(const [g,ox] of eng.grids)if(g.get(a-ox,b,k)>=0)return true;return false;};
  return {eng:(x,y,z)=>inEng(Math.round(x*2),Math.round(y*2),Math.round(z*2)),box:(x0,x1,y0,y1,z0,z1)=>{h.box(x0,x1,y0,y1,z0,z1,1);fl();},seg:(a,b,r)=>{h.seg(a,b,r,1);fl();},poly:(p,r)=>{h.poly(p,r,1);fl();},cyl:(ax,a,b,r,u0,u1)=>{h.cyl(ax,a,b,r,u0,u1,1);fl();},
    clear(pts,r,skip,body){let last=null;
      const hit=capsule(pts,r+.1,(i,j,k)=>{let te=true,to=true;if(skip)for(const [q,d,w] of skip)if(Math.hypot(i/2-q[0],j/2-q[1],k/2-q[2])<d){te=false;if(w==='a')to=false;}
        if(te&&inEng(i,j,k)){last=['engine',[i/2,j/2,k/2]];return true;}
        if(to&&(SO.has(OK_(i,j,k))||(body&&(HB.body.get(i,j,k)>=0||HB.hood.get(i,j,k)>=0)))){last=[SO.has(OK_(i,j,k))?'other':'body',[i/2,j/2,k/2]];return true;}
        return false;});
      this.last=last;return !hit;}};}
function setEngine(eid,gid){
  for(const k of ['engMesh','gbMesh','accMesh']){const m=P[k];if(m){m.parent.remove(m);m.geometry.dispose();P[k]=null;}}
  for(const g of [P.crankP,P.altP,P.fan])while(g.children.length){const c=g.children[0];g.remove(c);if(c.geometry)c.geometry.dispose();}
  const ED0=byId('engine',eid)||byId('engine',SH.stock.engine),kit=byId('swapkit',cfg.swapkit||'none')||{id:'none'},own=SH.mountPatterns.includes(ED0.mount),
        rel=(own&&kit.id==='none')?{}:(kit.relief||{}),ED=Object.assign({cyl:6,layout:'V'},ED0,{pan:Math.max(110,(ED0.pan||170)-(rel.pan||0))});
  if(ED0.orient==='trans')ED.layout='I';
  const deg=PW.incline[eid]!==undefined?PW.incline[eid]:(ED.layout==='V'?0:PW.inclineDefault),tl=deg*D2R,ct=Math.cos(tl),st=Math.sin(tl);
  // the deep sump behind the front cross-member (the engine sits behind the axle): from the rear face to 60 mm short of the member
  const Bl=Math.round(ED.len/10-6),cm=Math.floor((AX_F-4.5-.75-PW.x)*2),sump=[2,Math.max(8,Math.min(Bl-6,cm))];
  // the shallow front of the pan stays above the steering rack (it runs under a long block's front): at most 30 mm over the rack's top below the crank
  const RK=SU.front.rack,shallowMax=Math.max(5,Math.floor((PW.crankY-(RK.y+1.5)-.5)*2));
  const E=genEngineLong(ED,{tilt:tl,sump,shallowMax,manX:[.24,.5],mountX:Math.min(Bl-4,(AX_F-3-PW.x)*2)}),GD=Object.assign({tunnel:330,ratios:[1,1,1,1,1]},byId('gearbox',gid)||{}),T=genGearboxLong(GD,E.pc);
  let top=-1e9;for(const [x,y,z] of E.grid.list()){const wy=PW.crankY+((y-E.pc)*ct-z*st)*.5;if(wy>top)top=wy;}
  const hu=hoodLow(PW.x,PW.x+E.Lc*.5,-E.Wc*.3,E.Wc*.3)-1,sy=Math.min(1,(hu-PW.crankY)/(top-PW.crankY));
  const Pt=E.pts,L2=p=>[p[0]*.5,(p[1]-E.pc)*.5*sy,p[2]*.5],W=p=>{const l=L2(p);return [PW.x+l[0],PW.crankY+l[1]*ct-l[2]*st,l[1]*st+l[2]*ct];};   // engine cell -> group frame, -> body frame
  // the block's rear face meets the firewall's face (1420 mm from the nose) above and beside the bellhousing hump, which takes the bell and the block's lower
  // rear corner: an inline block's top rear edge (its deck reaches higher than a V's) is trimmed by the 10 mm the flywheel face sits behind the firewall's face
  {const fw=ZG.wx(Z32_M.bay.x1)+.1,Hm=Z32_M.hump,hy=Hm.top/20-.75,hz=Hm.half/20-.75;
   for(const [x,y,z] of E.grid.list()){const w=W([x,y,z]);if(w[0]<fw&&(w[1]>hy||Math.abs(w[2])>hz))E.grid.set(x,y,z,-1);}}
  const eg=P.engGroup;eg.position.set(PW.x,PW.crankY,0);eg.rotation.set(tl,0,0);
  P.engMesh=mk(E.grid,matV,0,eg,.5);P.engMesh.position.set(0,-E.pc*.5*sy,0);P.engMesh.scale.y=.5*sy;
  P.gbMesh=mk(T.grid,matV,0,eg,.5);P.gbMesh.position.set(-.5,-E.pc*.5*sy,0);P.gbMesh.scale.y=.5*sy;
  P.engSy=sy;P.engTilt=tl;P.cyl=ED.cyl;P.amp={4:1.0,5:.8,6:.35,8:.6}[ED.cyl]||1;build.eng={E,T,sy};
  // pulleys in the belt plane, the belt; the viscous fan on the water pump
  const mech=!!ED0.mechFan&&own&&kit.id==='none',xb=Pt.crank[0],alt=[xb,Pt.alt[1],Pt.alt[2]];
  const acc=new Grid(Math.floor(E.Bl)-14,Math.ceil(E.Lc)+12,-10,Math.ceil(E.Hc)+4,-Math.ceil(E.Wc/2)-4,Math.ceil(E.Wc/2)+4);
  cylX(acc,alt[1],alt[2],1.4,Pt.alt[0]+1,xb,0x8d9298);
  const tan=(p,q,r1,r2)=>{const dy=q[1]-p[1],dz=q[2]-p[2],l=Math.hypot(dy,dz),ny=-dz/l,nz=dy/l;return [[p[1]+ny*r1,p[2]+nz*r1],[q[1]+ny*r2,q[2]+nz*r2]];};
  const Cc=[0,Pt.crank[1],Pt.crank[2]],Fp=[0,Pt.fan[1],Pt.fan[2]],Ap=[0,alt[1],alt[2]],bx=xb+2;
  for(const [a,b,r1,r2] of [[Cc,Ap,6,3.5],[Ap,Fp,3.5,5],[Fp,Cc,5,6]]){const t=tan(a,b,r1,r2);segFill(acc,[bx,t[0][0],t[0][1]],[bx,t[1][0],t[1][1]],.55,0x131416);}
  P.accMesh=mk(acc,matV,0,eg,.5);P.accMesh.position.set(0,-E.pc*.5*sy,0);P.accMesh.scale.y=.5*sy;
  for(const [g,p,r] of [[P.crankP,Pt.crank,6],[P.altP,alt,3.5],[P.fan,Pt.fan,5]]){const l=L2(p);g.position.set(l[0],l[1],l[2]);const m=mk(genPulleyZ(r,r===6?0x41454b:0x50555c),matV,0,g,.5);m.rotation.y=Math.PI/2;}
  if(mech){const cl=new Grid(0,4,-4,4,-4,4);cl.fill((x,y,z)=>Math.hypot(y,z)<=3.5?(x===4?0x8d9298:0x5c6168):-1);const c=mk(cl,matV,0,P.fan,.5);c.position.x=2;const f=mk(buildFan(),matV,0,P.fan,.5);f.position.x=4;}
  // what is drawn on and around the engine, on the 10 mm lattice (body frame), for routing what hangs off it: the block and its castings, the belt, the pulleys,
  // the fan, the gearbox; then the sub-frame, the rack and the engine arms; then the front pipes; then each hose as it is placed
  const PG=new Grid(-4,Math.ceil(E.Lc)+14,-12,Math.ceil(E.Hc)+8,-Math.ceil(E.Wc/2)-10,Math.ceil(E.Wc/2)+10);   // the pulleys' discs (4 cells deep, a cell either side)
  for(const [p,r] of [[Pt.crank,6],[alt,3.5],[Pt.fan,5]])for(let dx=-1;dx<=4;dx++)for(let dy=-r;dy<=r;dy++)for(let dz=-r;dz<=r;dz++)if(dy*dy+dz*dz<=r*r)PG.set(p[0]+dx,p[1]+dy,p[2]+dz,1);
  build.routeLog=[];const OC=Occ({x0:PW.x,cy:PW.crankY,sy,pc:E.pc,grids:[[E.grid,0],[acc,0],[T.grid,-1],[PG,0]]}),U=Z32_RIG.under,X=Z32_RIG.exh,pr=X.pr;   // the engine's tilt is 0 in this car
  if(mech){const c=W(Pt.fan);OC.cyl('x',c[1],c[2],9.5,c[0]+1,c[0]+3.5);}
  // engine arms from the block's sides down to rubber mounts on the front cross-member, each arm's top on the block's side face, moved back past whatever hangs
  // there (the alternator on a short block); the shift lever's rod from the gearbox's top to the shifter
  {const h=HC(),arms=[];
   for(const [p,sd] of [[Pt.mountL,-1],[Pt.mountR,1]]){const pad=[AX_F-3,U.subY+3.5,sd*11];let b=null;
     for(const dx of [0,-2,-4,-6,-8,-10,-12,-14]){for(const dy of [0,-2]){const q=W([p[0]+dx,p[1]+dy,p[2]+sd*1.5]);if(OC.clear([q,pad],.9,[[q,1.75,'e']])){b=q;break;}}if(b)break;}
     b=b||W([p[0],p[1],p[2]+sd*1.5]);arms.push([b,pad]);
     h.box(pad[0]-1.25,pad[0]+1.25,U.subY+2.5,U.subY+3,pad[2]-1.25,pad[2]+1.25,0x111214);h.seg(b,pad,.9,0x3a3d42);}
   const gx=PW.x+(T.out[0]+16)*.5;h.seg([gx,PW.crankY+5,0],[cp.shifter.x,cp.shifter.y-.5,0],.55,0x5a5f66);h.box(cp.shifter.x-.75,cp.shifter.x+.75,cp.shifter.y-1,cp.shifter.y,-.75,.75,0x2a2c30);
   P.mounts.geometry.dispose();P.mounts.geometry=bufGeo(geoData(h.grid(),0,.05,0));
   for(const [b,pad] of arms){OC.seg(b,pad,.9);OC.box(pad[0]-1.25,pad[0]+1.25,U.subY+2.5,U.subY+3,pad[2]-1.25,pad[2]+1.25);}}
  OC.box(AX_F-4.5,AX_F-1.5,U.subY,U.subY+2,-U.railZ,U.railZ);for(const s of [-1,1])OC.box(U.railX0,U.railX1,U.subY,U.subY+1.5,s*U.railZ-1,s*U.railZ+1);
  OC.box(AX_F+RK.dx-1.5,AX_F+RK.dx+1.5,RK.y-1.5,RK.y+1.5,-(Z32_RIG.rackHalf||20)-.5,(Z32_RIG.rackHalf||20)+.5);   // the rack's 20 mm cells
  // exhaust front pipes: from under each turbine outlet or manifold flange (a V's at the banks' rear ends, an inline engine's two on its exhaust side) down to the
  // run under the tunnel (exh.frontY), joining behind the gearbox (exh.x0). A flange over the front cross-member takes its pipe outboard of the engine arm,
  // over the member, and down behind it
  {const cmX=AX_F-4.5,tail=sg=>[[PW.x-4,X.frontY,sg*7.5],[X.x0+2,X.frontY,sg*7.5],[X.x0,X.frontY,X.zRun]];
   build.frontPipes=Pt.manifolds.map(m=>{const f=W(m),sg=Math.sign(f[2])||1,s=[f[0],f[1]-(E.V?1:.25)-(pr-.5),f[2]];
     const C=[[s,[s[0]-.5,Math.max(X.frontY+3,s[1]-4),sg*Math.max(10,Math.abs(s[2])*.8)],[PW.x+1.5,X.frontY,sg*9.5],...tail(sg)]];
     for(const zo of [13.5,14.5,15.5])for(const yo of [11.25,12,12.75])C.push([s,[s[0],s[1]-.75,sg*Math.max(Math.abs(s[2]),zo)],[s[0],yo,sg*zo],[cmX-2.25,yo-.5,sg*(zo-1)],[PW.x+1.5,X.frontY,sg*9.5],...tail(sg)]);
     const fails=[],c=C.find(c=>{const ok=OC.clear(c,pr,[[s,pr+.9,'e']],true);if(!ok)fails.push(OC.last);return ok;})||C[0];(build.routeLog=build.routeLog||[]).push({pipe:1,n:C.length,idx:C.indexOf(c),fails:fails.slice(0,6)});return c;});
   for(const pp of build.frontPipes)OC.poly(pp,pr);}
  // hoses: the upper radiator hose from the top of the timing cover's front (the thermostat housing) forward over the pulleys to the radiator's left tank, the lower
  // from the water inlet on the block's right side to the right tank, the intake boot from the throttle body to the air box. Each takes the first of its routes
  // that clears the engine, the arms, the pipes, the rack, the bay's battery and air box, the hood and the hoses already placed
  {const h=HC(),hc=0x15161a,AB=BAY.airbox,BT=BAY.battery,az=BAY.airZ||-1,rx=BAY.radX-1.5,T1=[rx,24.5,-20.5],T2=[rx,16,20.5],front=PW.x+E.Lc*.5+3;
   {const bz=[-az*BT.z0,-az*BT.z1].sort((a,b)=>a-b),az_=[az*AB.z0,az*AB.z1].sort((a,b)=>a-b);OC.box(BT.x0-.5,BT.x1+.5,BT.y0-.5,BT.y1+.5,bz[0]-.5,bz[1]+.5);OC.box(AB.x0-.5,AB.x1+.5,AB.y0-.5,AB.y1+.5,az_[0]-.5,az_[1]+.5);}   // the bay's 20 mm cells
   const route=(C,r,skip,col)=>{const fails=new Map();const c=C.find(q=>{const ok=OC.clear(q.k||q,r,skip(q),true);if(!ok){const k=JSON.stringify(OC.last);fails.set(k,(fails.get(k)||0)+1);}return ok;})||C[0];(build.routeLog=build.routeLog||[]).push({n:C.length,idx:C.indexOf(c),fails:[...fails.entries()].slice(0,10)});h.poly(c,r,col);OC.poly(c,r);return c;};
   const th=W([Pt.thermo[0]+4,E.yH-1.5,Pt.thermo[2]]),wi=W(Pt.waterIn),tb=W(Pt.tb),sgw=Math.sign(wi[2])||1,UC=[],LC=[],IC=[];build.nosTb=tb;
   if(E.V){const t0=W(Pt.thermo),yT=PW.crankY+(E.yH-E.pc)*.5*sy+.75,c=[t0,[t0[0],yT,t0[2]],[front,yT,-12],[rx-2,T1[1],T1[2]],T1];c.k=c.slice(1);UC.push(c);}   // a V's outlet in the vee: the hose rises out of it
   for(const u of [0,1,2,3])for(const fx of [front,front+1.5,front+3])for(const zv of [-12,-15,-9,-18])UC.push([th,[th[0]+1.5,th[1]+u,th[2]],[fx,th[1]+u,zv],[rx-2,T1[1],T1[2]],T1]);
   route(UC,.9,c=>[[c[0],c.k?.5:1.75,'e'],[T1,2.6,'a']],hc);
   // lower hose: out of the inlet (back, clear of the alternator), down under the alternator, forward over the rack or round its end, up to the right tank
   const rkX=AX_F+RK.dx,rkT=RK.y+1.5;
   const aF=W(Pt.alt)[0]+.75,aZ=Math.abs(W(Pt.alt)[2])+E.pts.altR*.5+1.4;   // the alternator's front end, its outboard side
   // second set, tried only when none of the first clears (so engines that route today keep their route): where the inlet's point lies inside a casting that
   // is wider there (a timing case or water-pump housing at the block's front), the hose starts at that casting's outer face, straight outboard of the point
   const surf=w0=>{for(let d=0;d<=8;d+=.5){const q=[w0[0],w0[1],w0[2]+sgw*d];let hit=false;for(let a=-1;a<=1&&!hit;a+=.5)for(let b=-1;b<=1&&!hit;b+=.5)if(a*a+b*b<=1&&OC.eng(q[0]+a,q[1]+b,q[2]))hit=true;if(!hit)return [q[0],q[1],q[2]-sgw*.25];}return null;};
   for(const S2 of [0,1])for(const wdx of [0,-3,-6,3])for(const dx1 of [-.75,-.5,-1,0,-1.5])for(const dy1 of [0,-2])for(const o of S2?[.75,1.5,2.5]:[1.25,2.25]){const w0=W([Pt.waterIn[0]+wdx,Pt.waterIn[1],Pt.waterIn[2]]),wi=S2?surf(w0):w0;if(!wi)continue;const p1=[wi[0]+dx1,wi[1]+dy1,wi[2]+sgw*o];   // the inlet along the block's side, clear of the engine arm
     for(const zA of [aZ,aZ+1])for(const yA of [p1[1],15,14,16.5])for(const zR of [15,17]){const yR=Math.max(yA,rkT+1.5);   // outboard of the alternator, over the rack
       LC.push([wi,p1,[p1[0],yA,sgw*zA],[rkX-3,yR,sgw*Math.max(zR,zA)],[rkX+3,yR,sgw*Math.max(zR,zA)],[rx-2,16,sgw*20],T2]);}
     for(const yL of [12,11.5,11,12.5])for(const [zR,up] of [[15,1],[19.25,0],[16,1]]){const p2=[p1[0],yL,p1[2]+sgw*.5],yR=up?rkT+1.5:yL;   // under it, then over the rack or round its end
       LC.push([wi,p1,p2,[aF,yL,p2[2]+sgw*1],[rkX-3,yR,sgw*zR],[rkX+3,yR,sgw*zR],[rx-2,16,sgw*20],T2]);}}
   // third set, last: an inlet boxed in by the alternator outboard and the engine arm behind (a V6's): straight down inboard of the alternator, forward
   // under it and the belt, then up over the rack or round its end to the right tank
   for(const wdx of [0,-3,3,6])for(const yD of [12,11.5,12.5,11])for(const zD of [7,6,8,5])for(const xr of [aF+.5,aF+2])for(const [zR,up] of [[15,1],[17,1],[19.25,0]]){
     const w0=W([Pt.waterIn[0]+wdx,Pt.waterIn[1],Pt.waterIn[2]]),yR=up?rkT+1.5:yD;LC.push([w0,[w0[0],yD,sgw*zD],[xr,yD,sgw*zD],[rkX-3,yR,sgw*zR],[rkX+3,yR,sgw*zR],[rx-2,16,sgw*20],T2]);}
   // fourth set, only when nothing above clears (an inlet boxed in on every side, the VQ's under its alternator): the hose starts at the free space nearest
   // the inlet, where the inlet housing's elbow would face, and runs from there as the sets above do
   {const skL=c=>[[c[0],1.75,'e'],[T2,2.6,'a']];
    if(!LC.some(c=>OC.clear(c,.9,skL(c),true))){const w0=W(Pt.waterIn),fr=[];
      // the pulleys as drawn (their discs are not squashed with the engine's height scale, as the routing lattice's are): a route that passes within the
      // hose's radius of their boxes is left out
      body.updateMatrixWorld(true);const ib=new THREE.Matrix4().copy(body.matrixWorld).invert(),PB=[P.crankP,P.altP,P.fan].map(g=>{g.updateMatrixWorld(true);return new THREE.Box3().setFromObject(g).applyMatrix4(ib);}).filter(b=>!b.isEmpty());
      const nearPB=q=>PB.some(b=>Math.hypot(Math.max(b.min.x-q[0],0,q[0]-b.max.x),Math.max(b.min.y-q[1],0,q[1]-b.max.y),Math.max(b.min.z-q[2],0,q[2]-b.max.z))<1.05);
      const hitsPB=c=>{for(let q=0;q<c.length-1;q++){const a=c[q],b=c[q+1],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2])/.25));for(let t=0;t<=n;t++){const u=t/n;if(nearPB([a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u]))return true;}}return false;};
      const push=c=>{if(!hitsPB(c))LC.push(c);};
      for(let x=w0[0]-4;x<=w0[0]+9;x+=.5)for(let y=w0[1]-5;y<=w0[1]+5;y+=.5)for(let z=Math.abs(w0[2])-4;z<=Math.abs(w0[2])+6;z+=.5){const p=[x,y,sgw*z];if(OC.clear([p,p],.9,[],false))fr.push([Math.hypot(x-w0[0],y-w0[1],sgw*z-w0[2]),p]);}
      fr.sort((a,b)=>a[0]-b[0]);
      for(const [,ws] of fr.slice(0,6)){const zs=Math.abs(ws[2]);
        for(const yD of [ws[1],12,11.5,12.5,13])for(const xr of [aF+.5,aF+2])for(const [zR,up] of [[15,1],[17,1],[19.25,0]]){const yR=up?rkT+1.5:yD;
          push([ws,[ws[0],yD,sgw*zs],[xr,yD,sgw*zs],[rkX-3,yR,sgw*zR],[rkX+3,yR,sgw*zR],[rx-2,16,sgw*20],T2]);}
        for(const zA of [aZ,aZ+1])for(const zR of [15,17])push([ws,[ws[0],ws[1],sgw*zA],[rkX-3,Math.max(ws[1],rkT+1.5),sgw*Math.max(zR,zA)],[rkX+3,Math.max(ws[1],rkT+1.5),sgw*Math.max(zR,zA)],[rx-2,16,sgw*20],T2]);}}}
   route(LC,.9,c=>[[c[0],1.75,'e'],[T2,2.6,'a']],hc);
   const ABc=[AB.x0-1.5,(AB.y0+AB.y1)/2,(AB.z0+AB.z1)/2*az];
   for(const yi of [0,2,-2,4])for(const zi of [0,3,-3,6])for(const fx of [front,front+2])IC.push([[tb[0]+.5,tb[1],tb[2]],[tb[0]+2,tb[1],tb[2]],[fx,tb[1]+yi,tb[2]+zi],[ABc[0]-3,ABc[1],ABc[2]],ABc]);
   route(IC,1.5,c=>[[c[0],2.4,'e'],[ABc,2.6,'a']],0x1c1d20);
   P.hoses.geometry.dispose();P.hoses.geometry=bufGeo(geoData(h.grid(),0,.05,0));}
  // driveshaft: the front half from the gearbox's output flange to the centre bearing, the rear half to the final drive's input flange
  {const o=[PW.x+T.out[0]*.5-.75,PW.crankY,0],d=[AX_R+8.5,WR-1.25,0],cbx=(o[0]+d[0])/2,cb=[cbx,o[1]+(d[1]-o[1])*(o[0]-cbx)/(o[0]-d[0]),0];
   segTo(P.ds[0].g,new V3(...o),new V3(...cb),zAxis,70,.5);segTo(P.ds[1].g,new V3(...cb),new V3(...d),zAxis,70,.5);
   const h=HC();h.cyl('x',cb[1],0,2.6,cb[0]-1,cb[0]+1,0x15161a,1.65);h.box(cb[0]-.75,cb[0]+.75,cb[1]+2.25,cb[1]+3,-4,4,0x2a2c30);for(const s of [-1,1])h.box(cb[0]-.75,cb[0]+.75,cb[1]-.5,cb[1]+3,s*3.5,s*4,0x2a2c30);
   P.cbear.geometry.dispose();P.cbear.geometry=bufGeo(geoData(h.grid(),0,.05,0));}
  if(P.exh)setExhaust(cfg.exhaust);
}
function setSeats(){
  (P.seatMeshes||[]).forEach(m=>{body.remove(m);m.geometry.dispose();});P.seatMeshes=[];
  const LOOKS={stock:{cush:0x2d2f34,bol:0x3a3d44,bolH:1.6,back:22,hw:9.5,head:'integral'},bucket:{cush:0x1b1c1f,bol:0x0f1012,bolH:2.5,back:27.5,hw:9,head:'none',bucket:true}};   // the bucket's shell 50 mm lower than the E30's: the Z32's greenhouse tucks in over the seats
  const sp=byId('seats',cfg.seats||SH.stock.seats),base=sp&&sp.look&&sp.look.base,look=Object.assign({},LOOKS[cfg.seats]||(base==='bucket'?LOOKS.bucket:LOOKS.stock),sp&&sp.look||{});
  if(base==='bucket')look.back=LOOKS.bucket.back;else if(base)Object.assign(look,{back:LOOKS.stock.back,head:LOOKS.stock.head});   // the Z32's own heights: its greenhouse tucks in over the seats
  for(const sd of [-1,1]){if(sd===-cp.side&&cfg.removed&&cfg.removed.passengerSeat)continue;P.seatMeshes.push(mk(RG.seat(look,sd*cp.H.z),matV,0,body));}   // 2-seater: no rear seat
  P.hiRef=build.r&&build.r.hi;   // v20: the body's 10 mm panels, for the Stage B-D helpers (nothing they place may float or overlap)
  stageBParts(cfg,body,P,cp,mk,matV);   // Stage B (SPEC-INTERIOR §1/§4/§6): the wall / plush parts for the rear and passenger areas, and the dash set — rebuilt with the seats
  stageCParts(cfg,body,P,cp,build.nosTb,mk,matV);
  stageDParts(cfg,body,P,cp,mk,matV);   // v20 Stage D: the drift handbrake and the mirror hanger, rebuilt with the seats   // Stage C (SPEC-INTERIOR §5): the nitrous bottle + bay hardware — rebuilt with the seats (the seats sig carries rearArea)
}
function setSteering(id){const d=byIdSafe('steering',id);swapGeo(P.swm,genSteeringWheel(d.dia,d.look||{}));}
function setShifter(){const m=P.shifter&&P.shifter.children[0];if(m)swapGeo(m,genShifter(15,cfg));}   // Stage A (SPEC-INTERIOR §2): the fitted shifter's knob, swapped live
function setExhaust(id){const tip=byIdSafe('exhaust',id).tip,F=exhF();swapGeo(P.exh,genExhaust(ZG,tip,F));if(P.exhTips)swapGeo(P.exhTips,genExhaustTips(tip,F));}
// aero parts are built when first needed and kept hidden; parts on the hatch ride on it
const ADDON={
  frontlip:{p:'body',fn:()=>[z32AeroFront(ZG,build.bf.grid,'lip',build.r.hi.body)]},
  splitter:{p:'body',fn:()=>[z32AeroFront(ZG,build.bf.grid,'splitter',build.r.hi.body)]},
  z32wing:{p:'hatch',fn:()=>[z32Wing(ZG,build.r.hi.trunk)]},
  gtwing:{p:'hatch',fn:()=>[z32GTWing(ZG,build.r.hi.trunk)]},
  wide:{p:'body',fn:()=>[genFlares([build.r.hi.body,build.r.hi.doorL,build.r.hi.doorR],[build.bf.grid,build.bb.grid],{axles:[{x:ZG.ARCH_F.x,y:ZG.ARCH_F.y},{x:ZG.ARCH_RR.x,y:ZG.ARCH_RR.y}],R0:ZG.ARCH_F.r+.3,band:3,out:1.5,jMin:20,col:PAINT,skip:(x,y)=>x<ZG.doorFront(Math.max(y,14))+1.5&&x>ZG.doorRear(Math.max(y,14))-1.5})]},
  skirts:{p:'body',fn:()=>[genSkirts([build.r.hi.body],{x0:ZG.ARCH_RR.x+ZG.ARCH_RR.r+.8,x1:ZG.ARCH_F.x-ZG.ARCH_F.r-.8,j0:9,j1:14,arches:[ZG.ARCH_F,ZG.ARCH_RR],col:PAINT,doors:[build.r.hi.doorL,build.r.hi.doorR]})]}
};
function lazyPart(name){
  if(P['part_'+name])return P['part_'+name];
  const A=ADDON[name],parent=A.p==='hatch'?P.trunk:body,grp=new THREE.Group();for(const b of A.fn())paintable(b,grp,undefined,.5,{seat:ZG.solidAt});
  if(A.p==='hatch')grp.position.set(-HATCH_HINGE[0],-HATCH_HINGE[1],0);parent.add(grp);
  P['part_'+name]=grp;grp.visible=false;return grp;
}
function setAero(c){
  for(const n in ADDON)if(P['part_'+n])P['part_'+n].visible=false;
  const offF=!!(c.removed&&c.removed.bumperF);
  for(const s of AERO_SLOTS){const id=c[s];if(!id||id==='none'||!ADDON[id])continue;if(s==='aeroF'&&offF)continue;lazyPart(id).visible=true;}
}
function coilGeo(front,col){const CO=Z32_RIG.coil,DM=Z32_RIG.damper,S=front?SU.front:SU.rear,lowOnBody=(S.springLow||.3)<DM.bodyFrac;
  return bufGeo(geoData(genCoil(CO.n,CO.R,CO.w,CO.turns,col,[lowOnBody?DM.bodyR+.3:DM.rodR+.5,DM.rodR+.5]),0,0,0));}
function setSprings(id){
  const col={stock:0xc4261f,hd:0xc4261f,sport:0x2a6fd6,cup:0x16171a,coil:0xe0b52a,air:0x3a3c41}[id];
  const gF=coilGeo(true,col),gR=coilGeo(false,col);
  for(const L of P.links)L.spring.geometry=L.nm[0]==='F'?gF:gR;
}
function setWheels(){
  const w=cfg.wheel,ty=tyreFor(w.dia,w.width,w.tw,w.ar),zc=(SH.hubFaceZ-w.et)/20,br=byId('brakes',cfg.brakes)||byId('brakes',SH.stock.brakes);
  const tireG=bufGeo(geoData(buildTireP(ty.OD,ty.tw,w.dia,w.width),0,.03,0)),rimG=bufGeo(geoData(buildRimP(w.style,w.dia,w.width,w.et,'plain',{exact:1}),0,.03,0)),
        rotG=bufGeo(geoData(buildRotorP(br.rotor),0,.03,0)),calG=bufGeo(geoData(buildCaliperP(br.rotor,calType(br),1,calCol(br)),0,.03,0)),
        // the rear: its own disc and caliper where the option names them (a front-only big brake kit leaves the stock rear: C-10); the older entries as before
        rotGR=br.rotorR?bufGeo(geoData(buildRotorP(br.rotorR),0,.03,0)):rotG,calGR=br.pot?bufGeo(geoData(buildCaliperP(br.rotorR||br.rotor,calType(br,1),1,calCol(br,1)),0,.03,0)):calG;
  for(const k in wheels){const W=wheels[k];W.tire.geometry=tireG;W.rim.geometry=rimG;W.rot.geometry=W.steer?rotG:rotGR;W.cal.geometry=W.steer?calG:calGR;
    const sp=(W.steer?cfg.spacerF:cfg.spacerR)||0;const hubZ=(Math.ceil(w.et/10)-.5)/2-sp/20;W.off.position.z=W.sd*(zc+sp/20-KZ);W.rot.position.z=hubZ;W.cg.position.z=hubZ;W.kn.geometry=bufGeo(geoData(z32Knuckle(W.sd,W.steer,W.steer?br.rotor:(br.rotorR||br.rotor)),0,.03,0));}   // the rotor's flange on the wheel's mounting face (its first 10 mm cell plane: the face sits ET outboard, rounded to the cell)
  WY=(ty.OD/2-10)/20;phys.WR_M=ty.OD/2000;   // hub height = loaded radius (10 mm static deflection of the 50-series tyre); the body rides up with a taller tyre (post())
}

const PRESETS=[
 ['Stock',c=>{}],
 ['Version S wing',c=>{Object.assign(c,{aeroR:'z32wing'});}],
 ['Street (lowered, mesh wheels)',c=>{Object.assign(c,{aeroF:'frontlip',skirts:'skirts',aeroR:'z32wing',suspension:'coil',drop:20});c.wheel={style:'mesh',dia:17,width:8.5,et:25,pcd:'5x114.3',bore:66.1};}],
 ['RB26 swap',c=>{Object.assign(c,{engine:'RB26DETT',swapkit:'kit-z32-rb',gearbox:'Z32-5MT',exhaust:'catback',seats:'bucket',suspension:'coil',drop:25,brakes:'bbk4',aeroF:'frontlip'});c.wheel={style:'spoke6',dia:17,width:9,et:22,pcd:'5x114.3',bore:66.1};}],
 ['Track widebody',c=>{Object.assign(c,{exhaust:'race',seats:'bucket',steering:'small',suspension:'coil',drop:30,brakes:'bbk6',flares:'wide',skirts:'skirts',aeroF:'splitter',aeroR:'gtwing'});c.wheel={style:'dish3',dia:18,width:9.5,et:15,pcd:'5x114.3',bore:66.1};}]
];
function applyRemoved(){const R=cfg.removed||{};
  if(P.bumperF){P.bumperF.visible=!R.bumperF;if(P.plateF)P.plateF.visible=!R.bumperF;}
  if(P.bumperR){P.bumperR.visible=!R.bumperR;if(P.plateR)P.plateR.visible=!R.bumperR;}
  (P.doorCards||[]).forEach(m=>m.visible=!R.doorCards);
  for(const sg of [1,-1]){const key=sg>0?'crashF':'crashR',gone=sg>0?R.bumperF:R.bumperR;
    if(!P[key]&&gone){const C=Z32_RIG.crash,hb=build.r.hi.body;let f=sg>0?-1e9:1e9;
      for(const [i,j,k] of hb.list())if(j>=C.y0*2&&j<=C.y1*2&&Math.abs(k)<=C.half*2)f=sg>0?Math.max(f,i):Math.min(f,i);
      const face=sg>0?(f+.5)*.5:(f-.5)*.5;P[key]=mk(RG.crashBar(sg,sg>0?Math.round(face+.5):Math.round(face-.5)),matV,0,body);}
    if(P[key])P[key].visible=!!gone;}
}
return {
  id:'z32',title:'Nissan Fairlady Z (Z32)',maxSteer:MAX_STEER,
  bodyLimits:c=>{const w=c.wheel,ty=tyreFor(w.dia,w.width,w.tw,w.ar),zc=SH.hubFaceZ-w.et+Math.max(c.spacerF||0,c.spacerR||0),hub=WR*20+(c.drop||0),top=hub+ty.OD/2,A=Z32_M.arch;
    const gv=Math.min(A.f.y+A.f.r,A.r.y+A.r.r)-top-15,gl=zc-ty.tw/2-Z32_M.tubR.zIn-5,as=v=>Math.asin(Math.max(0,Math.min(1,v)));
    return {roll:Math.min(as(gv*.6/zc),as(gl/top),3.5*Math.PI/180),pitch:Math.min(as(gv*.4/1225),2*Math.PI/180)};},
  tagline:'Drive it. Park it. Modify it.',paints:PAINTS,stages,pre,post,presets:PRESETS,trunkLabel:'Hatch',coverLabel:'T-tops off',
  camOpens:{engine:{hood:1},interior:{doorR:1}},
  sigs:{wheels:c=>[c.wheel,c.brakes,c.spacerF,c.spacerR],engine:c=>[c.engine,c.gearbox,c.exhaust,c.swapkit],seats:c=>[c.seats,c.shifter,c.handbrake,c.mirrorHang,c.trunk,c.rearArea,c.passArea,c.dashPlush,!!(c.removed&&c.removed.passengerSeat)],steering:c=>c.steering,shifter:c=>c.shifter,exhaust:c=>c.exhaust,aero:c=>[...AERO_SLOTS.map(s=>c[s]),c.frame,!!(c.removed&&c.removed.bumperF)],suspension:c=>c.suspension,removed:c=>c.removed||{}},
  cockpit:()=>({eye:cp.eye,look:[60,46]}),
  sound:{cyl:6},
  camPresets:(psi,P2)=>({showroom:{az:psi+.9,el:.2,dist:300,ty:22,ox:0,oy:0,oz:0},front:{az:psi+P2,el:.12,dist:300,ty:22,ox:0,oy:0,oz:0},rear:{az:psi-P2+.35,el:.16,dist:300,ty:24,ox:-6,oy:0,oz:0},
    engine:{az:psi+P2+.35,el:.95,dist:190,ty:22,ox:50,oy:0,oz:0},wheels:{az:psi+.25,el:.1,dist:140,ty:15,ox:60,oz:36},interior:{az:psi-.5,el:.6,dist:180,ty:34,ox:-6,oy:0,oz:8},under:{az:psi+.7,el:.03,dist:240,ty:8,ox:0,oy:0,oz:0}}),
  apply:{wheels:()=>setWheels(),engine:()=>{setEngine(cfg.engine,cfg.gearbox);setExhaust(cfg.exhaust);},seats:()=>setSeats(),steering:()=>setSteering(cfg.steering),shifter:()=>setShifter(),exhaust:()=>setExhaust(cfg.exhaust),aero:()=>setAero(cfg),suspension:()=>setSprings(cfg.suspension),removed:applyRemoved},
  onLoaded:()=>{}
};
};
