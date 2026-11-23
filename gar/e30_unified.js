/* ===== E30 APP ===== */
(function(){
'use strict';
const D2R=Math.PI/180,$=id=>document.getElementById(id);
const clamp=clampv,lerp=(a,b,t)=>a+(b-a)*t;
const canvas=$('c');let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true});}catch(e){$('boot').textContent='This page needs WebGL, which your browser did not provide.';return;}
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(42,1,1,6000);
function themeBG(){const c=getComputedStyle(document.documentElement).getPropertyValue('--sky').trim()||'#aab6c2';scene.background=new THREE.Color(c);scene.fog=new THREE.Fog(c,900,3200);}
themeBG();
if(window.matchMedia){const mq=matchMedia('(prefers-color-scheme: dark)');if(mq.addEventListener)mq.addEventListener('change',themeBG);}
new MutationObserver(themeBG).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
scene.add(new THREE.HemisphereLight(0xffffff,0x59606b,.85));
const sun=new THREE.DirectionalLight(0xffffff,.95);sun.position.set(180,320,120);scene.add(sun);
const fillL=new THREE.DirectionalLight(0xbcd0ff,.3);fillL.position.set(-200,90,-160);scene.add(fillL);

/* ---------- materials ---------- */
const PAINTS=[['Henna red',0xb3221e],['Diamond black',0x101216],['Alpine white',0xe6e6e1],['Lachs silver',0x9aa0a6],['Misano blue',0x1d4fa8],['Delphin grey',0x666d74],['Sunburst yellow',0xdcae2a]];
const matPaint=new THREE.MeshPhongMaterial({vertexColors:true,color:PAINTS[0][1],shininess:70,specular:0x1c1c1c});
const matV=new THREE.MeshLambertMaterial({vertexColors:true});
const matGlass=new THREE.MeshPhongMaterial({vertexColors:true,transparent:true,opacity:.34,shininess:100,specular:0xcccccc,depthWrite:false,side:THREE.DoubleSide});
const matMirror=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
const matMirrorPaint=new THREE.MeshPhongMaterial({vertexColors:true,color:PAINTS[0][1],shininess:70,side:THREE.DoubleSide});
// ---- live mirrors: each glass is a plane showing what the eye would see reflected in it.
// Exact planar mirror: a camera at the eye's reflection behind the glass, with an off-axis frustum through the glass rectangle (left/right/top/bottom from its corners).
const MIRRORS=[];
function makeMirror(parent,pos,w,h,name){
  const rt=new THREE.WebGLRenderTarget(192,Math.max(32,Math.round(192*h/w)));rt.texture.wrapS=THREE.RepeatWrapping;rt.texture.repeat.x=-1;rt.texture.offset.x=1;   // a mirror reverses left and right
  const plane=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:rt.texture,side:THREE.FrontSide}));
  plane.position.copy(pos);plane.rotation.y=-Math.PI/2;parent.add(plane);   // faces -x (rearward / toward the driver)
  const cam=new THREE.PerspectiveCamera(30,w/h,.5,6000);cam.matrixAutoUpdate=false;
  return {name,plane,cam,rt,w,h};
}
function aimMirror(m,eye){
  const V=THREE.Vector3;m.plane.updateMatrixWorld(true);const M=m.plane.matrixWorld,c=new V().setFromMatrixPosition(M);
  const px=new V().setFromMatrixColumn(M,0).normalize(),py=new V().setFromMatrixColumn(M,1).normalize(),n=new V().setFromMatrixColumn(M,2).normalize();   // n = the side the glass faces
  const k=new V().subVectors(eye,c).dot(n);if(k<=.05)return false;                       // the eye is behind the glass: nothing to show
  const ep=eye.clone().addScaledVector(n,-2*k);                                            // the eye reflected through the glass plane
  const z=n.clone().negate(),x=new V().crossVectors(py,z).normalize(),y=new V().crossVectors(z,x);
  m.cam.matrixWorld.makeBasis(x,y,z).setPosition(ep);m.cam.matrixWorldInverse.copy(m.cam.matrixWorld).invert();
  let l=1e9,r=-1e9,b=1e9,t=-1e9;for(const [sx,sy] of [[-1,-1],[1,-1],[-1,1],[1,1]]){const q=c.clone().addScaledVector(px,sx*m.w/2).addScaledVector(py,sy*m.h/2).applyMatrix4(m.cam.matrixWorldInverse);l=Math.min(l,q.x);r=Math.max(r,q.x);b=Math.min(b,q.y);t=Math.max(t,q.y);}
  const near=k*.999,f=near/k;m.cam.projectionMatrix.makePerspective(l*f,r*f,t*f,b*f,near,6000);   // the glass corners lie at depth k; the frustum is given at the near planem.cam.projectionMatrixInverse.copy(m.cam.projectionMatrix).invert();
  return true;
}
function renderMirrors(){
  const eye=camera.getWorldPosition(new THREE.Vector3());
  for(const m of MIRRORS){if(!aimMirror(m,eye))continue;m.plane.visible=false;renderer.setRenderTarget(m.rt);renderer.render(scene,m.cam);m.plane.visible=true;}
  renderer.setRenderTarget(null);
}
const matHead=new THREE.MeshPhongMaterial({vertexColors:true,emissive:0xfff2c8,emissiveIntensity:0,shininess:80});
const matTailRed=new THREE.MeshPhongMaterial({vertexColors:true,emissive:0xff1010,emissiveIntensity:.05});
const matTailAmb=new THREE.MeshPhongMaterial({vertexColors:true,emissive:0xff9a10,emissiveIntensity:0});
const matTailWht=new THREE.MeshPhongMaterial({vertexColors:true,emissive:0xffffff,emissiveIntensity:0});
const matFrontAmb=new THREE.MeshPhongMaterial({vertexColors:true,emissive:0xff9a10,emissiveIntensity:0});

function bufGeo(d){if(!d.idx.length)return null;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(d.pos),3));g.setAttribute('normal',new THREE.BufferAttribute(new Float32Array(d.nor),3));g.setAttribute('color',new THREE.BufferAttribute(new Float32Array(d.col),3));g.setIndex(new THREE.BufferAttribute(new Uint32Array(d.idx),1));return g;}
function mk(grid,mat,sel,parent,scale,jit,smooth){const geo=bufGeo(geoData(grid,0,jit===undefined?.05:jit,sel||0,smooth));if(!geo)return null;const m=new THREE.Mesh(geo,mat);if(scale)m.scale.setScalar(scale);if(parent)parent.add(m);return m;}
function paintable(grid,parent,mp,scale,smooth){const grp=new THREE.Group();mk(grid,mp||matPaint,1,grp,undefined,undefined,smooth);mk(grid,matV,2,grp);if(scale)grp.scale.setScalar(scale);if(parent)parent.add(grp);return grp;}
// smooth glass mesh fitted through the voxel glass (glassSurface in e30_core): one continuous glossy pane, no steps
function mkGlass(G,kind,parent,scale){const s=glassSurface(G,kind);if(!s)return null;const geo=new THREE.BufferGeometry(),c=new Float32Array(s.pos.length);
  for(let i=0;i<c.length;i+=3){c[i]=.55;c[i+1]=.72;c[i+2]=.80;}
  geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(s.pos),3));geo.setAttribute('color',new THREE.BufferAttribute(c,3));geo.setIndex(s.idx);geo.computeVertexNormals();
  const m=new THREE.Mesh(geo,matGlass);if(scale)m.scale.setScalar(scale);if(parent)parent.add(m);return m;}
function group(parent,x,y,z){const g=new THREE.Group();g.position.set(x||0,y||0,z||0);if(parent)parent.add(g);return g;}

/* ---------- scene graph ---------- */
const carRoot=new THREE.Group();scene.add(carRoot);
const body=new THREE.Group();carRoot.add(body);
const wheels={};              // FL FR RL RR
const P={};                    // misc animated parts
const SHAKE_SLOW=.2,CRANK_SLOW=.035,ACC={alt:9/(9*.6),fan:9/9};   // display slow-motion factors (declared); accessory ratios = crank pulley radius / driven pulley radius (alternator pulley drawn at .6 scale, fan pulley same size)
const state={mode:'drive',paint:0,wheel:'mesh',drop:0,doorL:0,doorR:0,hood:0,trunk:0,win:0,lights:0,hazard:0,wipers:0,sound:false,view:'orbit',
  x:0,z:0,psi:0,v:0,throttle:0,brake:0,steer:0,steerIn:0,rpm:850,gear:1,spin:0,drive:0,
  bodyY:0,pitch:0,roll:0,ax:0,ay:0};
const anim={doorL:0,doorR:0,hood:0,trunk:0,win:0,wip:0};

/* ---------- build (staged so the page stays responsive) ---------- */
const stages=[];
let build={};
function stage(label,fn){stages.push([label,fn]);}

stage('Shaping the body panels',()=>{
  const r=buildE30Body();build.r=r;const H=r.hi;   // H: the 10 mm panels that are drawn (mesh scale .5); r.body ... are the same panels at 20 mm for fitting and collision
  const GL_=Object.values(H.glass),SM={body:[H.hood,H.trunk,H.doorL,H.doorR,...GL_],hood:[H.body,H.doorL,H.doorR,...GL_],trunk:[H.body,...GL_],doorL:[H.body,H.hood,H.trunk,H.doorR,...GL_],doorR:[H.body,H.hood,H.trunk,H.doorL,...GL_]};   // neighbouring panels close each panel's shut lines for shading
  const body0=paintable(H.body,body,undefined,.5,{o:SM.body,wy:[.45,.8]});P.bodyMesh=body0;
  // hood
  const hh=group(body,44,47.2,0);const hm=paintable(H.hood,hh,undefined,.5,SM.hood);hm.position.set(-44,-47.2,0);P.hood=hh;
  const th=group(body,-59.5,51,0);const tm=paintable(H.trunk,th,undefined,.5,SM.trunk);tm.position.set(59.5,-51,0);P.trunk=th;
  // doors (hinge at front edge)
  for(const sd of [-1,1]){
    const hz=sd*41,dg=group(body,43,0,hz),DG=sd<0?H.doorL:H.doorR,dm=paintable(DG,dg,undefined,.5);dm.position.set(-43,0,-hz);
    const gl=mkGlass(sd<0?H.glass.dgL:H.glass.dgR,'side',dg,.5);gl.position.set(-43,0,-hz);
    P['door'+(sd<0?'L':'R')]=dg;P['dglass'+(sd<0?'L':'R')]=gl;
    // door mirror: sail plate seated INTO the door and A-pillar skin (read from the skin, per cell), short thick arm, rounded housing with the glass facing rearward
    const skinZ=(x,y)=>{const I=Math.round(x*2),J=Math.round(y*2);for(let k=88;k>=0;k--)if(DG.get(I,J,sd*k)>=0||H.body.get(I,J,sd*k)>=0)return k/2;return 0;};
    const mr=buildDoorMirror(sd,skinZ);
    for(const [G,mt,sel] of [[mr.shell,matMirrorPaint,1],[mr.shell,matMirror,2],[mr.glass,matMirror,0]]){const m=mk(G,mt,sel,dg,.5);if(m)m.position.set(-43,0,-hz);}
    MIRRORS.push(makeMirror(dg,new THREE.Vector3(mr.glassCenter[0]-43,mr.glassCenter[1],mr.glassCenter[2]-hz),mr.glassSize[0],mr.glassSize[1],'door'+(sd<0?'L':'R')));   // live glass over the voxel glass
    // interior door card with armrest, pocket, speaker, switches and release lever; it rides on the door
    const dc=mk(buildDoorCard(sd,sd<0?r.doorL:r.doorR),matV,0,dg,.5);dc.position.set(-43,0,-hz);
    // handle: its base is seated on the skin where the handle stands (read from the skin)
    const hx=-5,hy=44.2,hs=skinZ(hx,hy),hd=mk(buildHandle(),matV,0,dg);hd.position.set(-5-43,44.2,sd*(hs-.2)-hz);hd.rotation.y=sd>0?-Math.PI/2:Math.PI/2;if(sd<0)hd.position.x=-12-43;
  }
  // fixed glass
  const g=H.glass;mkGlass(g.ws,'slope',body,.5);mkGlass(g.rw,'slope',body,.5);mkGlass(g.qgL,'side',body,.5);mkGlass(g.qgR,'side',body,.5);
});
stage('Fitting bumpers, lamps and trim',()=>{
  mk(bumperFront(),matV,0,body,.5);P.bumperR=paintable(bumperRear(),body,undefined,.5);   // the 1988-91 rear bumper is painted body colour
  for(const sd of [-1,1]){
    const h=mk(buildHeadlamp(sd),matHead,0,body,.5);h.position.set(HEAD_POS[0],HEAD_POS[1],sd*HEAD_POS[2]);
    (P.head=P.head||[]).push(h);
    const k=mk(buildKidneyFitted(build.r,sd),matV,0,body,.5);k.position.set(KID_POS[0],KID_POS[1],sd*KID_POS[2]);   // notched around the hood roundel
    const t=buildTaillamp(sd),tf=mk(t.frame,matV,0,body,.5);tf.position.set(TAIL_POS[0],TAIL_POS[1],sd*TAIL_POS[2]);
    const tr=mk(t.red,matTailRed,0,body,.5),ta=mk(t.amb,matTailAmb,0,body,.5),tw=mk(t.wht,matTailWht,0,body,.5);
    for(const m of [tr,ta,tw])m.position.copy(tf.position);
    (P.tailRed=P.tailRed||[]).push(tr);(P.tailAmb=P.tailAmb||[]).push(ta);(P.tailWht=P.tailWht||[]).push(tw);
  }
  // front indicators and fog lamps sit in recesses cut in the bumper (lens faces flush with the bumper face)
  for(const L of frontLamps()){const m=mk(L.lens(),L.kind==='indicator'?matFrontAmb:matV,0,body,.5);m.position.set(...L.pos);if(L.kind==='indicator')(P.frontAmb=P.frontAmb||[]).push(m);}
  const pf=mk(buildPlate(true),matV,0,body,.5);pf.position.set(...PLATE_F);
  const pr=mk(buildPlate(false),matV,0,body,.5);pr.position.set(...PLATE_R);
  // badges, flap and markers are placed on MEASURED surfaces (ray cast onto the painted metal), never at guessed coordinates; their grids are absolute 10 mm cells
  for(const it of buildBadges(build.r)){const m=mk(it.grid,matV,0,body,.5);if(m)m.position.set(0,0,0);}
});
stage('Mounting the engine bay',()=>{
  P.bay=mk(buildBay(),matV,0,body);
  const eg=group(body,52,11.5,0);eg.scale.set(.5,.5,.5);P.engine=eg;
  P.engGroup=eg;
  const cp=group(eg,74,14,0);mk(buildPulley(),matV,0,cp);P.crankP=cp;
  const fn=group(eg,74,34,0);mk(buildFan(),matV,0,fn);mk(buildPulley(),matV,0,fn);P.fan=fn;
  const ap=group(eg,66,24,26);ap.scale.setScalar(.6);mk(buildPulley(),matV,0,ap);P.altP=ap;
  setEngine('M20B25','G260');
  // driveshaft, diff, exhaust
  const ds=group(body,22,18.4,0);ds.rotation.order='ZXY';mk(buildShaft(),matV,0,ds);P.driveshaft=ds;setEngine('M20B25','G260');
  mk(buildDiff(),matV,0,body);P.exh=mk(buildExhaustV('stock'),matV,0,body);
});
stage('Furnishing the cabin',()=>{
  const ig=buildInterior({noSeats:true});P.interior=mk(ig,matV,0,body);P.interiorCage=false;
  {const dd=mk(buildDashDetail(),matV,0,body,.5,.03);dd.position.set(...DASH_DETAIL_POS);}   // centre stack, radio, heater controls, console, handbrake, glovebox (10 mm detail)   // includes the steering column on the wheel axis
  // steering wheel (turns with the road wheels)
  const W0=COCKPIT.wheel,sw=group(body,W0.x,W0.y,W0.z);sw.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),new THREE.Vector3(...W0.n).normalize());
  // interior mirror on the windshield and sun visors on the headliner
  {const im=buildInteriorMirror(build.r);const a=mk(im.shell,matV,0,body,.5),b=mk(im.glass,matMirror,0,body,.5);a.position.set(...im.pos);b.position.set(...im.pos);
   MIRRORS.push(makeMirror(body,new THREE.Vector3(im.pos[0]-5.27,im.pos[1]-4,im.pos[2]),12.5,3.5,'interior'));
   for(const sd of [-1,1]){const v=buildVisor(build.r,sd),vm=mk(v.grid,matV,0,body,.5);vm.position.set(...v.pos);}}
  const swi=group(sw,0,0,0);const swm=mk(buildSteeringWheelV(380,'stock'),matV,0,swi,.5);swm.position.set(0,0,-.75);P.swheel=swi;P.swm=swm;setSeats('stock',false);
  // gauges
  for(const [z,name,mark] of [[-27,'tach',7],[-17,'speedo',12]]){
    const f=mk(buildGaugeFace(9,mark),matV,0,body,.5);f.position.set(25.6,45.6,z);
    const nd=group(body,25.3,45.6,z);const nm=mk(buildNeedle(8),matV,0,nd,.5);nm.rotation.z=Math.PI/2;P[name]=nd;
  }
  // pedals
  COCKPIT.pedals.forEach(([n,z])=>{const pg=group(body,COCKPIT.pedalX,21,z);const pm=mk(buildPedal(n==='gas'?1.6:(n==='brake'?2.6:3),8),matV,0,pg);pm.position.set(0,-8,0);P['ped_'+n]=pg;});
  // shifter
  const sh=group(body,COCKPIT.shifter.x,COCKPIT.shifter.y+.5,0);mk(buildShifter(),matV,0,sh,.5,.02);P.shifter=sh;   // pivot just under the console top; knob about 220 mm above the console
  // wipers (sweep on the windshield plane)
  const t=new THREE.Vector3(-16,21.6,0).normalize(),n=new THREE.Vector3(t.y,-t.x,0).normalize(),zz=new THREE.Vector3(0,0,1);
  const M=new THREE.Matrix4().makeBasis(t,zz,n);
  P.wipers=[];
  for(const zc of [19,-3]){const w=new THREE.Group();w.position.set(41.6,47.9,zc);w.quaternion.setFromRotationMatrix(M);const arm=group(w,0,0,.7);const wm=mk(buildWiper(46),matV,0,arm,.5);arm.rotation.z=-90*D2R;P.wipers.push(arm);body.add(w);}
});
stage('Assembling wheels and suspension',()=>{
  P.rim={mesh:bufGeo(geoData(buildRimP('mesh',14,6,25),0,.03,0))};
  const tireG=bufGeo(geoData(buildTireP(590,195,14),0,.03,0)),rotG=bufGeo(geoData(buildRotorP(260),0,.03,0)),calG=bufGeo(geoData(buildCaliperP(260,'stock'),0,.03,0));
  P.rimMeshes=[];
  const hub=(name,x,z,steer)=>{
    const sd=z>0?1:-1,c=group(carRoot,x,WR,z);
    const st=group(c);const fl=group(st);if(sd<0)fl.rotation.y=Math.PI;
    const sp=group(fl);
    const tire=new THREE.Mesh(tireG,matV);tire.scale.setScalar(.5);sp.add(tire);
    const rim=new THREE.Mesh(P.rim[state.wheel],matV);rim.scale.setScalar(.5);rim.position.z=0;sp.add(rim);P.rimMeshes.push(rim);
    const rot=new THREE.Mesh(rotG,matV);rot.scale.setScalar(.5);sp.add(rot);
    const cg=group(fl);cg.rotation.z=sd<0?Math.PI:0;const cal=new THREE.Mesh(calG,matV);cal.scale.setScalar(.5);cg.add(cal);
    wheels[name]={c,st,sp,sd,steer,tire,rim,rot,cal,cg};
  };
  hub('FL',AX_F,-34,true);hub('FR',AX_F,34,true);hub('RL',AX_R,-34.5,false);hub('RR',AX_R,34.5,false);
  // suspension links
  const armG=bufGeo(geoData(buildArm(1),0,0,0)),rodG=bufGeo(geoData(buildRod(),0,0,0)),
        strG=bufGeo(geoData(buildStrutTube(30),0,0,0)),sprG=bufGeo(geoData(buildSpring(30,2.4),0,0,0));
  P.links=[];
  const mkSeg=(geo,mat)=>{const m=new THREE.Mesh(geo,mat||matV);carRoot.add(m);return m;};
  for(const nm of ['FL','FR','RL','RR']){
    const L={nm,arm:mkSeg(armG),strut:mkSeg(strG),spring:mkSeg(sprG)};
    if(nm[0]==='F')L.rod=mkSeg(rodG);else{L.damper=mkSeg(strG);L.strut.visible=false;}
    P.links.push(L);
  }
  const rk=new Grid(-3,3,-3,3,-20,20);rk.fill((x,y,z)=>Math.hypot(x,y)<=2.2?0x666b72:-1);
  P.rack=mk(rk,matV,0,body);P.rack.position.set(AX_F-6,13,0);
  // under-car shadow
  const sg=new THREE.Mesh(new THREE.PlaneGeometry(260,110),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.38,depthWrite:false}));
  sg.rotation.x=-Math.PI/2;sg.position.set(2,.25,0);carRoot.add(sg);
  // headlight beams
  for(const sd of [-1,1]){const sl=new THREE.SpotLight(0xfff0cf,0,1400,.5,.55,1);sl.position.set(104,32,sd*27);carRoot.add(sl);const tg=new THREE.Object3D();tg.position.set(500,6,sd*27);carRoot.add(tg);sl.target=tg;(P.beams=P.beams||[]).push(sl);}
});
stage('Laying the road',()=>{
  const cv=document.createElement('canvas');cv.width=cv.height=128;const x=cv.getContext('2d');
  x.fillStyle='#7d838b';x.fillRect(0,0,128,128);x.fillStyle='#737982';x.fillRect(0,0,64,64);x.fillRect(64,64,64,64);
  x.fillStyle='rgba(255,255,255,.35)';x.fillRect(0,62,128,4);x.fillRect(62,0,4,128);
  const tx=new THREE.CanvasTexture(cv);tx.wrapS=tx.wrapT=THREE.RepeatWrapping;tx.repeat.set(60,60);tx.anisotropy=4;
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(9600,9600),new THREE.MeshLambertMaterial({map:tx}));fl.rotation.x=-Math.PI/2;scene.add(fl);P.floor=fl;P.tile=9600/60*2;   // checker period (2 cells)
});

/* ---------- placement helpers ---------- */
const V3=THREE.Vector3,Q=new THREE.Quaternion(),yAxis=new V3(0,1,0),zAxis=new V3(0,0,1);
function segTo(mesh,p0,p1,axis,len,r){
  const d=new V3().subVectors(p1,p0),l=d.length();if(l<1e-3)return;d.divideScalar(l);
  mesh.position.copy(p0);mesh.quaternion.setFromUnitVectors(axis,d);
  if(axis===yAxis)mesh.scale.set(r||1,l/len,r||1);else mesh.scale.set(1,1,l/len);
}
const bodyM=new THREE.Matrix4();
function bodyPt(x,y,z){return new V3(x,y,z).applyMatrix4(bodyM);}

/* ---------- driving model ---------- */
let GEAR=[0,3.83,2.20,1.40,1.00,.81],FINAL=3.73,WR_M=.295,MASS=1275,TQ=1,RED=6900,CYL=6,EXH=0,BUILD_OK=true,WY=15;
function torque(rpm){const pts=[[800,120],[2000,175],[3000,205],[4300,222],[5500,215],[6500,185],[7000,110]];for(let i=0;i<pts.length-1;i++){if(rpm<=pts[i+1][0])return lerp(pts[i][1],pts[i+1][1],clamp((rpm-pts[i][0])/(pts[i+1][0]-pts[i][0]),0,1));}return 90;}
const keys={};
function stepCar(dt){
  const drv=state.mode==='drive';   // in the garage the car is parked: no throttle, no steering, brakes held
  const kT=drv&&(keys.w||keys.arrowup||state.padGas),kB=drv&&(keys.s||keys.arrowdown||state.padBrake);
  const steerKey=((keys.a||keys.arrowleft)?1:0)-((keys.d||keys.arrowright)?1:0);
  let target=drv?(steerKey!==0?steerKey:state.steerIn):0;
  state.steer+= (target-state.steer)*Math.min(1,dt*(steerKey!==0?4:6));
  let fwd=state.v;
  let thr=0,brk=0,rev=false;
  if(kT&&BUILD_OK){thr=1;}
  if(kB){if(state.v>.6)brk=1;else if(BUILD_OK){rev=true;thr=1;}}
  if(keys[' ']&&drv)brk=Math.max(brk,.7);if(!drv)brk=1;   // parked: brake held
  state.throttle+=(thr-state.throttle)*Math.min(1,dt*8);state.brake+=(brk-state.brake)*Math.min(1,dt*10);
  const sp=Math.abs(state.v);
  // gearbox: automatic shifter for the five-speed
  const wheelRpm=sp/(2*Math.PI*WR_M)*60;
  if(!rev){
    let g=state.gear;
    if(state.rpm>RED-400&&g<GEAR.length-1)g++;
    if(g>1&&wheelRpm*GEAR[g]*FINAL<2300&&state.throttle<.9)g--;
    if(g>1&&wheelRpm*GEAR[g-1]*FINAL<5200&&state.throttle>.9&&g>2)g--;
    if(sp<2)g=1;
    if(g!==state.gear){state.gear=g;state.shiftT=.35;}
  }else state.gear=0;
  const geared=wheelRpm*GEAR[Math.max(1,state.gear)]*FINAL;
  const clutch=sp<3.5?clamp(sp/3.5,0,1):1;
  const free=850+state.throttle*(RED-1300);
  let rpmT=lerp(Math.max(850,Math.min(free,6800)),Math.max(850,geared),clutch);
  if(state.shiftT>0){state.shiftT-=dt;rpmT*=.86;}
  state.rpm+=(rpmT-state.rpm)*Math.min(1,dt*(rpmT>state.rpm?9:5));
  state.rpm=clamp(state.rpm,800,RED);
  // forces
  let F=0;
  if(state.throttle>0){const T=torque(state.rpm)*TQ*state.throttle*(state.rpm>RED-200?0:1);F=T*GEAR[Math.max(1,state.gear)]*FINAL*.88/WR_M*(rev?-.5:1)*(clutch*.65+.35);}
  const drag=.5*1.2*.62*1.85*sp*sp*Math.sign(state.v),roll=140*Math.sign(state.v)*(sp>.05?1:0);
  const brakeF=state.brake*9500*(sp>.05?Math.sign(state.v):0);
  let a=(F-drag-roll-brakeF)/MASS;
  if(sp<.15&&F===0&&state.brake>0.05)state.v=0;
  state.v+=a*dt;state.odo=(state.odo||0)+Math.abs(state.v)*dt/1000;   // odometer in km
  if(rev&&state.v<-5)state.v=-5;
  if(!rev&&state.v<0&&!kB)state.v=Math.min(0,state.v+3*dt);
  state.ax=a;
  // steering geometry (bicycle model)
  const maxSteer=.52/(1+Math.abs(state.v)/14);
  const delta=state.steer*maxSteer;state.delta=delta;
  const yaw=state.v/2.57*Math.tan(delta);
  state.psi+=yaw*dt;state.ay=state.v*yaw;
  state.x+=Math.cos(state.psi)*state.v*dt/.02;state.z-=Math.sin(state.psi)*state.v*dt/.02;
  state.spin+=state.v*dt/WR_M;
  // body attitude (springs)
  const rollT=clamp(state.ay*.0075,-.1,.1),pitchT=clamp(state.ax*.006,-.05,.05);
  state.roll+=(rollT-state.roll)*Math.min(1,dt*7);state.pitch+=(pitchT-state.pitch)*Math.min(1,dt*7);
  const bob=Math.sin(state.t*(.9+sp*.05))*.04*Math.min(1,sp/6)+(state.rpm/6000)*Math.sin(state.t*70)*.035;
  state.bodyY=bob+state.bobExtra;
}
state.t=0;state.bobExtra=0;state.shiftT=0;

/* ---------- animation / per-frame update ---------- */
const turnPhase=()=>Math.floor(state.t*1.5)%2===0;
function update(dt){
  state.t+=dt;
  stepCar(dt);
  // openables ease toward targets
  const ease=(k,tg,sp)=>{anim[k]+=(tg-anim[k])*Math.min(1,dt*sp);return anim[k];};
  P.doorL.rotation.y=-ease('doorL',state.doorL,6)*64*D2R;P.doorR.rotation.y=ease('doorR',state.doorR,6)*64*D2R;
  P.hood.rotation.z=ease('hood',state.hood,4)*62*D2R;P.trunk.rotation.z=-ease('trunk',state.trunk,4)*58*D2R;
  const wv=ease('win',state.win,5);P.dglassL.position.y=P.dglassR.position.y=-wv*21;
  // car transform
  updateHud();
  carRoot.position.set(state.x,0,state.z);carRoot.rotation.y=state.psi;
  body.position.y=-state.drop/20+state.bodyY;body.rotation.set(state.roll,0,state.pitch*1);body.updateMatrix();bodyM.copy(body.matrix);
  // wheels
  for(const k in wheels){const w=wheels[k];w.c.position.y=WY;w.st.rotation.y=w.steer?state.delta:0;w.sp.rotation.z=(w.sd<0?1:-1)*state.spin;}
  // steering rack + links
  const rackShift=6*Math.sin(state.delta);P.rack.position.z=rackShift;P.rack.position.y=13+state.bodyY-state.drop/20;
  const pitchA=state.pitch;
  for(const L of P.links){
    const front=L.nm[0]==='F',sd=L.nm[1]==='R'?1:-1,w=wheels[L.nm],ax=front?AX_F:AX_R;
    const hubP=new V3(ax,WR,sd*34);
    if(front){
      segTo(L.arm,bodyPt(ax-6,12.5,sd*14),new V3(ax,WY-5.5,sd*27.5),zAxis,1,0);
      const lo=new V3(ax,WY-2,sd*27),up=bodyPt(ax-3,37.5,sd*23);   // strut top mount inside the tower, below the hood
      segTo(L.strut,lo,up,yAxis,30,1);
      const ts=(29.5-lo.y)/(up.y-lo.y);segTo(L.spring,new V3().lerpVectors(lo,up,.28),new V3().lerpVectors(lo,up,ts),yAxis,30,1);   // spring ends at the tower underside
      const knuckle=new V3(ax-6*Math.cos(state.delta),WY-2,sd*27+6*Math.sin(state.delta)*1);
      segTo(L.rod,new V3(ax-6,14,sd*(14)+rackShift),knuckle,zAxis,10,0);
    }else{
      segTo(L.arm,bodyPt(-46,13,sd*21),new V3(ax,WY-1,sd*27.5),zAxis,1,0);
      const lo=new V3(ax-2,WY+2,sd*26),up=bodyPt(ax-2,30,sd*26);   // spring seat in the wheelhouse roof
      segTo(L.spring,new V3().lerpVectors(lo,up,.12),up,yAxis,30,1);
      segTo(L.damper,new V3(ax+3,WY+2,sd*26),bodyPt(ax+3,31,sd*26),yAxis,30,1);
    }
  }
  // engine idle shake / pulleys / fan
  const shake=(state.rpm/6000)*.35+.1;
  // live engine behaviour: torque-reaction rock at the FIRING frequency (rpm/60 x cylinders/2 Hz) shown in slow motion (SHAKE_SLOW), amplitude by engine order; pulleys turn at crank speed x the ratio of the drawn pulley radii, shown in slow motion (CRANK_SLOW)
  const fireHz=state.rpm/60*(P.cyl||6)/2;
  P.engine.rotation.x=Math.sin(state.t*Math.PI*2*Math.min(fireHz*SHAKE_SLOW,12))*.0012*shake*60*((P.amp||.35)/.35);P.engine.rotation.z=Math.sin(state.t*state.rpm/60*Math.PI*2*SHAKE_SLOW+1)*.0009*shake*60;
  const crank=state.t*state.rpm/60*Math.PI*2*CRANK_SLOW;
  P.crankP.rotation.x=crank;P.altP.rotation.x=-crank*ACC.alt;P.fan.rotation.x=crank*ACC.fan;
  P.driveshaft.rotation.x=-state.spin*GEAR[Math.max(1,state.gear)]*0+(-state.spin*FINAL);
  // cockpit
  P.swheel.rotation.z=state.steer*1.35*Math.PI;   // + = anticlockwise seen from the driver (the wheel axis points at the driver), so steering left turns the rim left
  P.speedo.rotation.x=(-120+clamp(Math.abs(state.v)*3.6,0,240)/240*240)*D2R;P.tach.rotation.x=(-120+clamp(state.rpm,0,7000)/7000*240)*D2R;
  P.ped_gas.rotation.z=-state.throttle*.45;P.ped_brake.rotation.z=-state.brake*.45;P.ped_clutch.rotation.z=-(state.shiftT>0?.4:0);
  const g=state.gear,gx=[0,-.12,.12,-.0,.0,.12,.12][g]||0,gy=[0,-.1,-.1,0,0,.1,.1][g]||0;
  P.shifter.rotation.z+=((g===1||g===3||g===5?-.12:g===0?0:.12)*(g===3||g===4?1:1)-P.shifter.rotation.z)*.2;
  P.shifter.rotation.x+=((g<=2?.1:g<=4?0:-.1)-P.shifter.rotation.x)*.2;
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
  P.wipers.forEach((a,i)=>a.rotation.z=(-90+ (i?64:68)*anim.wip)*D2R);
  // floor follows the car (period = two checker cells)
  P.floor.position.set(Math.round(state.x/P.tile)*P.tile,0,Math.round(state.z/P.tile)*P.tile);
}

/* ---------- camera ---------- */
const cam={az:-.65,el:.22,dist:300,tx:0,ty:26,tz:0,ox:0,oy:0,oz:0,goal:null};
const shortest=a=>{while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a;};
function updateCamera(dt){
  if(cam.goal){const g=cam.goal,k=.12;cam.az+=shortest(g.az-cam.az)*k;cam.el+=(g.el-cam.el)*k;cam.dist+=(g.dist-cam.dist)*k;cam.ty+=(g.ty-cam.ty)*k;cam.ox+=(g.ox-cam.ox)*k;cam.oy+=(g.oy-cam.oy)*k;cam.oz+=(g.oz-cam.oz)*k;
    if(Math.abs(shortest(g.az-cam.az))+Math.abs(g.el-cam.el)+Math.abs(g.dist-cam.dist)<.02)cam.goal=null;}
  const cp=carRoot.position;
  if(state.view==='cockpit'){
    const E0=COCKPIT.eye,e=new V3(E0.x,E0.y,E0.z).applyMatrix4(bodyM).applyEuler(carRoot.rotation).add(cp);
    const f=new V3(60,48,E0.z-state.steer*40).applyMatrix4(bodyM).applyEuler(carRoot.rotation).add(cp);
    camera.position.copy(e);camera.lookAt(f);camera.fov=70;camera.updateProjectionMatrix();return;
  }
  if(camera.fov!==42){camera.fov=42;camera.updateProjectionMatrix();}
  const baseAz=state.view==='chase'?(state.psi-Math.PI/2)+cam.azOff:cam.az;
  const ce=Math.cos(cam.el);
  const off=new V3(cam.ox,0,cam.oz).applyEuler(carRoot.rotation),tx=cp.x+off.x,tz=cp.z+off.z;   // look-at offset is in the car's own frame
  camera.position.set(tx+cam.dist*Math.sin(baseAz)*ce,cam.ty+cam.dist*Math.sin(cam.el),tz+cam.dist*Math.cos(baseAz)*ce);
  camera.lookAt(tx,cam.ty,tz);
}
cam.azOff=0;
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();if(w/h<1)cam.dist=Math.max(cam.dist,430);}
addEventListener('resize',resize);resize();
const ptrs={};let pinch=0;
canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);ptrs[e.pointerId]={x:e.clientX,y:e.clientY};const ids=Object.keys(ptrs);if(ids.length===2){const a=ptrs[ids[0]],b=ptrs[ids[1]];pinch=Math.hypot(a.x-b.x,a.y-b.y);}});
canvas.addEventListener('pointermove',e=>{const p=ptrs[e.pointerId];if(!p)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;const ids=Object.keys(ptrs);
  cam.goal=null;if(ids.length===1){if(state.view==='chase')cam.azOff-=dx*.006;else cam.az-=dx*.006;cam.el=clamp(cam.el+dy*.005,.03,1.4);}
  else if(ids.length>=2){const a=ptrs[ids[0]],b=ptrs[ids[1]],d=Math.hypot(a.x-b.x,a.y-b.y);if(pinch>0)cam.dist=clamp(cam.dist*pinch/d,110,1200);pinch=d;}});
const endP=e=>{delete ptrs[e.pointerId];pinch=0;};canvas.addEventListener('pointerup',endP);canvas.addEventListener('pointercancel',endP);
canvas.addEventListener('wheel',e=>{e.preventDefault();cam.goal=null;cam.dist=clamp(cam.dist*Math.exp(e.deltaY*.001),110,1200);},{passive:false});

/* ---------- sound (inline-six) ---------- */
let audio=null;
function initAudio(){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;const ctx=new AC(),m=ctx.createGain(),lp=ctx.createBiquadFilter();m.gain.value=0;lp.type='lowpass';lp.frequency.value=900;lp.Q.value=1.1;
  const o=[ctx.createOscillator(),ctx.createOscillator(),ctx.createOscillator()],g=[ctx.createGain(),ctx.createGain(),ctx.createGain()];
  o[0].type='sawtooth';o[1].type='square';o[2].type='sawtooth';g[0].gain.value=.5;g[1].gain.value=.22;g[2].gain.value=.16;
  o.forEach((x,i)=>{x.connect(g[i]);g[i].connect(lp);x.start();});lp.connect(m);m.connect(ctx.destination);audio={ctx,m,lp,o};}
function updateAudio(){if(!audio)return;const t=audio.ctx.currentTime,f=state.rpm/60*CYL/2;audio.o[0].frequency.setTargetAtTime(f,t,.04);audio.o[1].frequency.setTargetAtTime(f/2,t,.04);audio.o[2].frequency.setTargetAtTime(f*2,t,.04);
  audio.lp.frequency.setTargetAtTime(380+state.rpm*.55+state.throttle*900+EXH*700,t,.06);audio.m.gain.setTargetAtTime(state.sound?(.05+.1*state.throttle+state.rpm/90000):0,t,.08);}

/* ---------- UI ---------- */
const hud={spd:$('hSpd'),gear:$('hGear'),rpm:$('hRpm'),bar:$('hBar')};
function setToggle(id,on){const b=$(id);if(b)b.classList.toggle('on',!!on);}
const swWrap=$('paints');PAINTS.forEach(([n,h],i)=>{const b=document.createElement('button');b.className='sw'+(i===0?' on':'');b.style.background='#'+h.toString(16).padStart(6,'0');b.title=n;b.setAttribute('aria-label',n);
  b.onclick=()=>{state.paint=i;scheduleAutosave();matPaint.color.setHex(h);matMirrorPaint.color.setHex(h);[...swWrap.children].forEach((c,j)=>c.classList.toggle('on',j===i));$('paintName').textContent=n;};swWrap.appendChild(b);});
$('paintName').textContent=PAINTS[0][0];
const tg=(id,key,fn)=>{$(id).onclick=()=>{state[key]=state[key]?0:1;setToggle(id,state[key]);if(fn)fn();};};
tg('tDoorL','doorL');tg('tDoorR','doorR');tg('tHood','hood');tg('tTrunk','trunk');tg('tWin','win');tg('tLights','lights');tg('tHaz','hazard');tg('tWip','wipers');
$('tSound').onclick=()=>{state.sound=!state.sound;setToggle('tSound',state.sound);if(state.sound){if(!audio)initAudio();if(audio&&audio.ctx.state==='suspended')audio.ctx.resume();}};
$('tView').onclick=()=>{const order=['orbit','chase','cockpit'];state.view=order[(order.indexOf(state.view)+1)%3];$('tView').textContent='View: '+state.view[0].toUpperCase()+state.view.slice(1);};
$('tReset').onclick=()=>{state.x=state.z=state.psi=state.v=0;state.rpm=850;state.gear=1;cam.azOff=0;};
// hold-to-drive controls
const hold=(id,key)=>{const b=$(id);const on=e=>{e.preventDefault();state[key]=true;b.classList.add('on');if(audio&&audio.ctx.state==='suspended')audio.ctx.resume();};const off=e=>{state[key]=false;b.classList.remove('on');};b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointerleave',off);b.addEventListener('pointercancel',off);};
hold('bGas','padGas');hold('bBrk','padBrake');
const st=$('steer');st.oninput=e=>{state.steerIn=-(+e.target.value)/100;};['pointerup','touchend','pointercancel','mouseup'].forEach(ev=>st.addEventListener(ev,()=>{st.value=0;state.steerIn=0;}));
addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();keys[k]=true;if(k==='h')$('tLights').click();if(k==='z')$('tHaz').click();if(k==='c')$('tView').click();if(k==='g')setMode(state.mode==='garage'?'drive':'garage');});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false;});

/* ---------- one product: Drive and Garage in the same environment ---------- */
const menuEl=$('menu');let prevView='orbit';
function setTab(t){menuEl.dataset.tab=t;if(t==='saves'&&window.__bootDone)renderSaves();[...$('tabs').children].forEach(b=>b.classList.toggle('on',b.dataset.tab===t));}
function setMode(m){
  if(m===state.mode)return;state.mode=m;if(m==='garage'&&window.__bootDone)scheduleAutosave();   // parking saves the odometer
  $('mDrive').classList.toggle('on',m==='drive');$('mGarage').classList.toggle('on',m==='garage');
  if(m==='garage'){prevView=state.view;state.view='orbit';$('tView').textContent='View: Orbit';menuEl.classList.add('open');setTab('parts');camPreset('showroom');}
  else{state.view=(prevView==='cockpit'?'cockpit':'chase');$('tView').textContent='View: '+state.view[0].toUpperCase()+state.view.slice(1);menuEl.classList.remove('open');
    for(const k of ['hood','doorL','doorR','trunk']){if(state[k]){state[k]=0;setToggle({hood:'tHood',doorL:'tDoorL',doorR:'tDoorR',trunk:'tTrunk'}[k],0);}}cam.goal=null;}
  $('hint').textContent=m==='garage'?'Garage: the car is parked. Edit parts, then press Drive to test them. Drag to orbit, scroll to zoom.':'Drive: W/S throttle and brake, A/D steer, Space brake, H lights, C view, G garage.';
}
function camPreset(n){
  const psi=state.psi,P2=Math.PI/2;
  const T={showroom:{az:psi+.9,el:.2,dist:300,ty:26,ox:0,oy:0,oz:0},front:{az:psi+P2,el:.12,dist:300,ty:26,ox:0,oy:0,oz:0},rear:{az:psi-P2+.35,el:.16,dist:300,ty:28,ox:-10,oy:0,oz:0},
    engine:{az:psi+P2+.35,el:.95,dist:190,ty:26,ox:68,oy:0,oz:0},wheels:{az:psi+.25,el:.1,dist:140,ty:15,ox:60,oy:0,oz:30},interior:{az:psi+Math.PI-.5,el:.6,dist:190,ty:38,ox:4,oy:0,oz:-8},under:{az:psi+.7,el:.03,dist:240,ty:8,ox:0,oy:0,oz:0}}[n];
  if(!T)return;state.view='orbit';cam.goal=T;
  const want={engine:{hood:1},interior:{doorL:1},wheels:{},showroom:{},front:{},rear:{trunk:0},under:{}}[n]||{};
  for(const k of ['hood','doorL']){const v=(want[k]||0);if(n==='engine'||n==='interior'||state[k]){state[k]=v;setToggle(k==='hood'?'tHood':'tDoorL',v);}}
}
$('mDrive').onclick=()=>setMode('drive');$('mGarage').onclick=()=>setMode('garage');
$('mMenu').onclick=()=>{menuEl.classList.toggle('open');};
[...$('tabs').children].forEach(b=>b.onclick=()=>{if(b.dataset.tab==='parts'&&state.mode!=='garage'){setMode('garage');}setTab(b.dataset.tab);menuEl.classList.add('open');});
for(const b of document.querySelectorAll('#camtab [data-cam]'))b.onclick=()=>camPreset(b.dataset.cam);
$('bTest').onclick=()=>setMode('drive');
setTab('body');
/* ---------- boot ---------- */
function updateHud(){
  hud.spd.textContent=Math.round(Math.abs(state.v)*3.6);hud.gear.textContent=(state.mode==='garage'&&Math.abs(state.v)<.2)?'P':(state.gear===0?'R':state.gear);hud.rpm.textContent=Math.round(state.rpm/10)*10;hud.bar.style.width=(clamp(state.rpm/7000,0,1)*100)+'%';hud.bar.style.background=state.rpm>6200?'var(--accent)':'var(--text)';
}
let last=performance.now();
function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;update(dt);updateCamera();renderMirrors();renderer.render(scene,camera);updateAudio();

  requestAnimationFrame(loop);}
let si=0;
function runStage(){
  if(si>=stages.length){refresh(true);window.__bootDone=true;initSaves();$('boot').style.display='none';update(0.016);requestAnimationFrame(t=>{last=t;requestAnimationFrame(loop);});return;}
  $('bootMsg').textContent=stages[si][0]+'…';$('bootBar').style.width=((si+1)/stages.length*100)+'%';
  setTimeout(()=>{try{stages[si][1]();}catch(e){console.error(e);$('bootMsg').textContent='Build error: '+e.message;return;}si++;runStage();},30);
}
/* ===================== MOD SHOP: visuals + fitment UI ===================== */
const cfg=defaultCfg();let applied={};
function swapGeo(mesh,grid,jit){mesh.geometry.dispose();mesh.geometry=bufGeo(geoData(grid,0,jit===undefined?.05:jit,0));}
function setEngine(eid,gid){
  if(P.engMesh){P.engGroup.remove(P.engMesh);P.engMesh.geometry.dispose();P.engGroup.remove(P.gbMesh);P.gbMesh.geometry.dispose();}
  const ev=buildEngineV(eid);P.engMesh=mk(ev.grid,matV,0,P.engGroup);P.gbMesh=mk(buildGearboxV(gid),matV,0,P.engGroup);
  const ED=byId('engine',eid),W=ED.wid/10;P.cyl=ED.cyl;P.amp={4:1.0,6:.35,8:.6}[ED.cyl];   // width in 10 mm cells; shake amplitude by engine order (I4 strongest, I6 smoothest; ESTIMATED)
  let my=0;for(const v of ev.grid.list())my=Math.max(my,v[1]);const sy=Math.min(1,(36-11.5)/(my*.5));P.engGroup.scale.set(.5,.5,.5);P.engMesh.scale.y=sy;P.gbMesh.scale.y=sy;P.engSy=sy;   // uniform group scale keeps fan and pulleys round; only the castings are squashed
  P.crankP.position.set(ev.L+4,Math.round(ev.pan*.9*sy),0);P.fan.position.set(ev.L+4,Math.round(ev.H*.50*sy),0);P.altP.position.set(ev.L-6,Math.round((ev.pan+4)*sy),W/2+6);
  if(P.driveshaft){const gl=buildGearboxV(gid).list();let mx=1e9,ys=0,n=0;for(const v of gl)mx=Math.min(mx,v[0]);for(const v of gl)if(v[0]===mx){ys+=v[1];n++;}
   const outY=11.5+(ys/n)*.5*sy,outX=52+mx*.5,run=outX-AX_R;P.driveshaft.position.set(outX,outY,0);P.driveshaft.scale.x=run/84;P.driveshaft.rotation.z=Math.atan2(outY-14.5,run);}
  if(P.bay){swapGeo(P.bay,buildBay(bayOptsFor(eid)));P.fan.visible=!!ED.mechFan;}
}
function setSeats(style,noRear){
  (P.seatMeshes||[]).forEach(m=>{body.remove(m);m.geometry.dispose();});P.seatMeshes=[];
  for(const sd of [-1,1])P.seatMeshes.push(mk(buildSeatV(style,sd*COCKPIT.H.z),matV,0,body));
  if(!noRear){const rb=buildRearBenchHi(build.r.hi.body);P.seatMeshes.push(mk(rb.cushion,matV,0,body,.5,.03,true));const bk=mk(rb.back,matV,0,body,.5,.03,true);bk.position.set(...rb.backPos);bk.rotation.z=rb.backRot;P.seatMeshes.push(bk);}   // the E30 coupe bench: cushion, and the backrest drawn at its angle   // roll bars and cages delete the rear seat
}
function setSteering(id){const d=byId('steering',id);swapGeo(P.swm,buildSteeringWheelV(d.dia,id));}
function setExhaust(id){swapGeo(P.exh,buildExhaustV(byId('exhaust',id).tip));}
const ADDON={splitter:()=>[buildSplitter()],ducktail:()=>[buildDucktail(build.r)],gtwing:()=>[buildGTWing()],wide:()=>[buildFlares(build.r,[buildBumperF(),buildBumperR()])],islip:()=>[buildISLip(),buildTrunkLip(build.r)],
  strutbar:()=>[buildStrutBar()],rollbar:()=>[buildRollBar()],cage:()=>[buildCage()],cage10:()=>[buildCage10()]};
function lazyPart(name){
  if(P['part_'+name])return P['part_'+name];
  const grp=new THREE.Group();for(const b of ADDON[name]())paintable(b,grp);body.add(grp);
  P['part_'+name]=grp;grp.visible=false;return grp;
}
function setAero(id,frame){
  for(const n in ADDON)if(P['part_'+n])P['part_'+n].visible=false;
  const show={none:[],islip:['islip'],splitter:['splitter'],ducktail:['ducktail'],gtwing:['splitter','gtwing'],wide:['wide']}[id]||[];
  for(const n of show)lazyPart(n).visible=true;
  if(frame&&frame!=='stock')lazyPart(frame).visible=true;
  const wide=id==='wide';if(P.bodyMesh&&(P.bodyCut||wide)){if(wide&&!P.bodyCut){P.bodyCut=paintable(archCutHi(build.r.hi.body),body,undefined,.5);}P.bodyCut.visible=wide;P.bodyMesh.visible=!wide;}   // widebody: arch lips cut back under the flares
  const caged=frame==='cage'||frame==='cage10';if(P.interior&&P.interiorCage!==caged){swapGeo(P.interior,buildInterior({noSeats:true,cage:caged}));P.interiorCage=caged;}   // cage tubes pass through notches in the dash
}
function setSprings(id){
  const col={stock:0xc4261f,hd:0xc4261f,sport:0x2a6fd6,cup:0x16171a,coil:0xe0b52a,air:0x3a3c41}[id];
  const g=bufGeo(geoData(buildSpring(30,2.4,col),0,0,0));
  for(const L of P.links){L.spring.geometry=g;}
}
function setWheels(){
  const w=cfg.wheel,ty=tyreFor(w.dia,w.width),zc=(CAR.hubFaceZ-w.et)/20,br=byId('brakes',cfg.brakes);
  const tireG=bufGeo(geoData(buildTireP(ty.OD,ty.tw,w.dia),0,.03,0)),rimG=bufGeo(geoData(buildRimP(w.style,w.dia,w.width,w.et),0,.03,0)),
        rotG=bufGeo(geoData(buildRotorP(br.rotor),0,.03,0)),calG=bufGeo(geoData(buildCaliperP(br.rotor,br.id==='bbk6'?'6pot':br.id==='bbk4'?'4pot':'stock'),0,.03,0));
  const first=Object.values(wheels)[0];if(first&&!P.oldWheelGeo){}
  for(const k in wheels){const W=wheels[k];W.tire.geometry=tireG;W.rim.geometry=rimG;W.rot.geometry=rotG;W.cal.geometry=calG;
    W.c.position.z=W.sd*zc;W.rot.position.z=w.et/20;W.cg.position.z=w.et/20;}
  WY=ty.OD/40;WR_M=ty.OD/2000;
}
function applyDrive(res){
  const eng=byId('engine',cfg.engine),gb=byId('gearbox',cfg.gearbox),df=byId('diff',cfg.diff),ex=byId('exhaust',cfg.exhaust),ro=readout(cfg);
  GEAR=[0].concat(gb.ratios);FINAL=df.ratio;MASS=ro.mass;TQ=(eng.hp+ex.hp)/170;RED=eng.red;CYL=eng.cyl;EXH=ex.sound;BUILD_OK=res.ok;
  if(state.gear>GEAR.length-1)state.gear=GEAR.length-1;state.drop=cfg.drop;
}
const SLOTS=[['engine','Engine'],['swapkit','Swap kit'],['gearbox','Gearbox'],['diff','Differential'],['exhaust','Exhaust'],['seats','Seats'],['steering','Steering wheel'],['suspension','Suspension'],['brakes','Brakes'],['aero','Aero and body'],['frame','Chassis']];
const shopEl=$('shop');
function el(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e;}
function optStatus(slot,id){const c=JSON.parse(JSON.stringify(cfg));c[slot]=id;if(slot==='suspension'){const su=byId('suspension',id);c.drop=Math.max(su.minDrop,Math.min(su.maxDrop,c.drop));}
  const r=checkFit(c);const rel=r.issues.filter(i=>i.sev==='BLOCK'&&(i.slot===slot||(slot==='swapkit'&&i.slot==='engine')));return rel.length?rel[0].text:'';}
function buildShop(){
  shopEl.innerHTML='';
  const head=el('div','shead');head.appendChild(el('b',null,'Mod shop'));head.appendChild(el('span','sub','Pick parts. The shop checks fitment and says why.'));shopEl.appendChild(head);
  const pre=el('div','row');pre.appendChild(el('span','lbl','Presets'));
  for(const [n,f] of PRESETS){const b=el('button',null,n);b.onclick=()=>{Object.assign(cfg,JSON.parse(JSON.stringify(defaultCfg())));f(cfg);refresh(true);};pre.appendChild(b);}
  shopEl.appendChild(pre);
  const stat=el('div','status');stat.id='shopStatus';shopEl.appendChild(stat);
  const iss=el('div','issues');iss.id='shopIssues';shopEl.appendChild(iss);
  const ro=el('div','readout');ro.id='shopRead';shopEl.appendChild(ro);
  for(const [slot,label] of SLOTS){
    const sec=el('details','sec');sec.open=(slot==='engine'||slot==='swapkit'||slot==='gearbox');sec.appendChild(el('summary',null,label));
    const row=el('div','opts');row.dataset.slot=slot;
    for(const p of CATALOG[slot]){const b=el('button','opt',p.name);b.dataset.id=p.id;b.onclick=()=>{cfg[slot]=p.id;if(slot==='suspension'){const su=byId('suspension',p.id);cfg.drop=Math.max(su.minDrop,Math.min(su.maxDrop,su.id==='sport'?30:cfg.drop));}refresh(false);};row.appendChild(b);}
    sec.appendChild(row);
    if(slot==='suspension'){const d=el('div','slider');d.appendChild(el('span',null,'Drop'));const r=document.createElement('input');r.type='range';r.min=0;r.max=80;r.step=5;r.id='dropR';r.oninput=()=>{const su=byId('suspension',cfg.suspension);cfg.drop=Math.max(su.minDrop,Math.min(su.maxDrop,+r.value));refresh(false);};d.appendChild(r);const o=el('b',null,'0 mm');o.id='dropO';d.appendChild(o);sec.appendChild(d);}
    shopEl.appendChild(sec);
  }
  // wheels
  const ws=el('details','sec');ws.open=true;ws.appendChild(el('summary',null,'Wheels and tyres'));
  const wr=el('div','opts');wr.dataset.slot='wheelstyle';for(const p of CATALOG.wheel){const b=el('button','opt',p.name);b.dataset.id=p.id;b.onclick=()=>{cfg.wheel.style=p.id;refresh(false);};wr.appendChild(b);}ws.appendChild(wr);
  const mkSel=(lab,id,opts,get,set)=>{const d=el('div','slider');d.appendChild(el('span',null,lab));const s=document.createElement('select');s.id=id;for(const o of opts){const op=document.createElement('option');op.value=o;op.textContent=o;s.appendChild(op);}s.onchange=()=>{set(s.value);refresh(false);};d.appendChild(s);return d;};
  ws.appendChild(mkSel('Diameter (in)','wDia',[14,15,16,17,18],()=>cfg.wheel.dia,v=>cfg.wheel.dia=+v));
  ws.appendChild(mkSel('Width (in)','wWid',[6,7,8,9],()=>cfg.wheel.width,v=>cfg.wheel.width=+v));
  ws.appendChild(mkSel('Bolt pattern','wPcd',['4x100','5x120'],()=>cfg.wheel.pcd,v=>cfg.wheel.pcd=v));
  const e=el('div','slider');e.appendChild(el('span',null,'Offset ET'));const er=document.createElement('input');er.type='range';er.min=-10;er.max=50;er.step=1;er.id='wEt';er.oninput=()=>{cfg.wheel.et=+er.value;refresh(false);};e.appendChild(er);const eo=el('b',null,'25');eo.id='wEtO';e.appendChild(eo);ws.appendChild(e);
  shopEl.appendChild(ws);
}
const PRESETS=[
 ['Stock',c=>{}],
 ['M3 spec',c=>{Object.assign(c,{engine:'S14B23',gearbox:'G265',diff:'lsd410',exhaust:'catback',seats:'recliner',steering:'sport',suspension:'sport',drop:30});c.wheel={style:'mesh',dia:15,width:7,et:25,pcd:'4x100'};}],
 ['2JZ swap',c=>{Object.assign(c,{engine:'2JZGTE',swapkit:'kit-jz',gearbox:'V160',diff:'lsd373',exhaust:'oval',seats:'bucket',steering:'small',suspension:'coil',drop:30,brakes:'bbk4',aero:'splitter'});c.wheel={style:'star',dia:17,width:8,et:35,pcd:'4x100'};}],
 ['LS swap',c=>{Object.assign(c,{engine:'LS3',swapkit:'kit-ls',gearbox:'T56',diff:'lsd346',exhaust:'catback',seats:'recliner',steering:'sport',suspension:'coil',drop:30,brakes:'bbk4',aero:'ducktail'});c.wheel={style:'dish',dia:17,width:8,et:35,pcd:'4x100'};}],
 ['Track widebody',c=>{Object.assign(c,{engine:'S14B23',gearbox:'G265',diff:'lsd410',exhaust:'catback',seats:'bucket',steering:'small',suspension:'coil',drop:30,brakes:'bbk6',aero:'wide',frame:'cage'});c.wheel={style:'dish',dia:18,width:9,et:16,pcd:'4x100'};}]
];
function refresh(full){
  const res=checkFit(cfg),ro=readout(cfg);
  // visuals: rebuild only what changed
  const sig=k=>JSON.stringify(k==='wheels'?[cfg.wheel,cfg.brakes]:k==='engine'?[cfg.engine,cfg.gearbox]:k==='seats'?[cfg.seats,!!byId('frame',cfg.frame).deletesRearSeat]:k==='aero'?[cfg.aero,cfg.frame]:cfg[k]);
  for(const k of ['wheels','engine','seats','steering','exhaust','aero','suspension']){const s=sig(k);if(full||applied[k]!==s){applied[k]=s;
    if(k==='wheels')setWheels();else if(k==='engine')setEngine(cfg.engine,cfg.gearbox);else if(k==='seats')setSeats(cfg.seats,!!byId('frame',cfg.frame).deletesRearSeat);else if(k==='steering')setSteering(cfg.steering);else if(k==='exhaust')setExhaust(cfg.exhaust);else if(k==='aero')setAero(cfg.aero,cfg.frame);else if(k==='suspension')setSprings(cfg.suspension);}}
  applyDrive(res);
  // UI state
  for(const row of shopEl.querySelectorAll('.opts')){const slot=row.dataset.slot;for(const b of row.children){
    if(slot==='wheelstyle'){b.classList.toggle('on',cfg.wheel.style===b.dataset.id);continue;}
    b.classList.toggle('on',cfg[slot]===b.dataset.id);const why=optStatus(slot,b.dataset.id);b.classList.toggle('bad',!!why);b.title=why||'Fits';}}
  $('wDia').value=cfg.wheel.dia;$('wWid').value=cfg.wheel.width;$('wPcd').value=cfg.wheel.pcd;$('wEt').value=cfg.wheel.et;$('wEtO').textContent='ET'+cfg.wheel.et;
  const su=byId('suspension',cfg.suspension),dr=$('dropR');dr.min=su.minDrop;dr.max=Math.max(su.maxDrop,su.minDrop+1);dr.disabled=su.minDrop===su.maxDrop;dr.value=cfg.drop;$('dropO').textContent=cfg.drop+' mm';
  const st=$('shopStatus');st.textContent=res.ok?'Fits. The car will start.':'Does not fit ('+res.issues.filter(i=>i.sev==='BLOCK').length+' problems). The car will not start.';st.className='status '+(res.ok?'ok':'bad');
  const is=$('shopIssues');is.innerHTML='';for(const i of res.issues){const d=el('div','issue '+i.sev.toLowerCase(),(i.sev==='BLOCK'?'Blocked: ':'Warning: ')+i.text);is.appendChild(d);}
  const r=$('shopRead');r.innerHTML='';const kv=(a,b)=>{const d=el('div','kv');d.appendChild(el('span',null,a));d.appendChild(el('b',null,b));r.appendChild(d);};
  kv('Mass',ro.mass+' kg [C]');kv('Power',ro.hp+' hp [E]');kv('Power to weight',ro.pw.toFixed(0)+' hp/t [C]');kv('Top speed',ro.top.toFixed(0)+' km/h [C]');kv('Rev limit in top gear',ro.vmaxGear[ro.vmaxGear.length-1].toFixed(0)+' km/h [C]');
  kv('Tyre',res.tyre.sizeStr+' ('+res.tyre.OD.toFixed(0)+' mm) [C]');kv('Speedometer error',(ro.speedoErr>=0?'+':'')+ro.speedoErr.toFixed(1)+'% [C]');kv('Tyre to arch gap',Math.round(res.archGap)+' mm [C]');kv('Front weight',ro.frontPct.toFixed(1)+'% [E]');
  if(window.__bootDone)scheduleAutosave();
}
buildShop();

/* ---------- saves: five build slots plus an autosave, and the odometer. Kept private per viewer in this artifact's database
   (data/users/<id>/...), so they follow the person to any device; a page opened outside claude.ai falls back to this browser's storage. ---------- */
const SAVE_SLOTS=['slot1','slot2','slot3','slot4','slot5'];
const saves={backend:'none',db:null,uid:null,data:{},timer:null,chain:Promise.resolve(),restored:false,quiet:false};
function buildName(){const e=byId('engine',cfg.engine),w=byId('wheel',cfg.wheel.style);return e.id+', '+cfg.wheel.dia+'-inch '+(w?w.name.toLowerCase():'wheels')+', '+PAINTS[state.paint][0];}
function snapshotSave(name){return {v:1,name:(name||'').slice(0,40)||buildName(),savedAt:new Date().toISOString(),cfg:JSON.parse(JSON.stringify(cfg)),paint:state.paint,odoKm:Math.round((state.odo||0)*100)/100};}
function slotRef(id){return saves.db.collection('data/users/'+saves.uid).doc('e30-'+id);}
async function readSlot(id){
  try{if(saves.backend==='db'){const s=await slotRef(id).get();return s.exists?s.data():null;}
      if(saves.backend==='local'){const t=localStorage.getItem('e30.save.'+id);return t?JSON.parse(t):null;}}catch(e){}
  return null;}
function writeSlot(id,data){   // one write at a time (each document is written in order)
  saves.chain=saves.chain.then(async()=>{
    if(saves.backend==='db'){try{await slotRef(id).set(data);}catch(e){if(e&&e.code==='invalid_argument'){saves.backend=localOK()?'local':'none';renderSaveWhere();if(saves.backend==='local')localStorage.setItem('e30.save.'+id,JSON.stringify(data));}else throw e;}}
    else if(saves.backend==='local')localStorage.setItem('e30.save.'+id,JSON.stringify(data));
    else throw new Error('Saving is not available here.');
    saves.data[id]=data;});
  return saves.chain;}
function removeSlot(id){saves.chain=saves.chain.then(async()=>{if(saves.backend==='db')await slotRef(id).delete();else if(saves.backend==='local')localStorage.removeItem('e30.save.'+id);saves.data[id]=null;});return saves.chain;}
function localOK(){try{localStorage.setItem('e30.t','1');localStorage.removeItem('e30.t');return true;}catch(e){return false;}}
function validCfg(c){   // a save from an older catalogue keeps only parts that still exist
  const out=defaultCfg();if(!c||typeof c!=='object')return out;
  for(const k of ['engine','swapkit','gearbox','diff','exhaust','seats','steering','suspension','brakes','aero','frame'])if(typeof c[k]==='string'&&byId(k,c[k]))out[k]=c[k];
  const w=c.wheel||{};if(byId('wheel',w.style))out.wheel.style=w.style;if([14,15,16,17,18].includes(+w.dia))out.wheel.dia=+w.dia;if([6,7,8,9].includes(+w.width))out.wheel.width=+w.width;
  if(Number.isFinite(+w.et))out.wheel.et=Math.max(-10,Math.min(50,Math.round(+w.et)));if(['4x100','5x120'].includes(w.pcd))out.wheel.pcd=w.pcd;
  const su=byId('suspension',out.suspension);out.drop=Math.max(su.minDrop,Math.min(su.maxDrop,Math.round(+c.drop||0)));return out;}
function applySave(s){
  saves.quiet=true;
  const c=validCfg(s.cfg);for(const k in c)cfg[k]=c[k];
  const p=Math.max(0,Math.min(PAINTS.length-1,(+s.paint)|0));const sw=$('paints').children[p];if(sw)sw.click();
  state.odo=Math.max(state.odo||0,+s.odoKm||0);
  refresh(false);saves.quiet=false;renderSaves();}
function scheduleAutosave(){if(saves.quiet||saves.backend==='none')return;clearTimeout(saves.timer);saves.timer=setTimeout(()=>{writeSlot('auto',snapshotSave('Autosave')).then(renderSaves).catch(()=>{});},2500);}
function renderSaveWhere(){$('saveWhere').textContent={db:'Saved to your Claude account, private to you, on any device.',local:'Saved in this browser only, for now (account-wide saves come with the release).',none:'Saving is not available in this view.'}[saves.backend];}
function fmtDate(t){try{return new Date(t).toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});}catch(e){return '';}}
function renderSaves(){
  renderSaveWhere();$('saveOdo').textContent=(state.odo||0).toFixed(1);
  const box=$('saveSlots');box.textContent='';
  for(const id of ['auto',...SAVE_SLOTS]){const s=saves.data[id],row=el('div','slot'),meta=el('div','meta');
    const t=el('b',null,id==='auto'?'Autosave':'Slot '+id.slice(4));meta.appendChild(t);
    meta.appendChild(document.createTextNode(s?(s.name+' · '+fmtDate(s.savedAt)+' · '+(+s.odoKm||0).toFixed(1)+' km'):'Empty'));row.appendChild(meta);
    if(id!=='auto'){const b=el('button',null,'Save');b.dataset.save=id;b.disabled=saves.backend==='none';b.onclick=()=>{const data=snapshotSave($('saveName').value.trim());$('saveMsg').textContent='Saving…';
        writeSlot(id,data).then(()=>{$('saveMsg').textContent='Saved to slot '+id.slice(4)+'.';renderSaves();}).catch(e=>{$('saveMsg').textContent=e&&e.code==='quota_exceeded'?'Storage is full: delete a save first.':'Could not save ('+((e&&e.message)||'error')+').';});};row.appendChild(b);}
    const l=el('button',null,'Load');l.dataset.load=id;l.disabled=!s;l.onclick=()=>{if(state.mode!=='garage')setMode('garage');applySave(s);$('saveMsg').textContent='Loaded '+(id==='auto'?'the autosave':'slot '+id.slice(4))+': '+s.name+'.';};row.appendChild(l);
    if(id!=='auto'){const d=el('button',null,'Delete');d.dataset.del=id;d.disabled=!s;d.onclick=()=>{removeSlot(id).then(()=>{$('saveMsg').textContent='Deleted slot '+id.slice(4)+'.';renderSaves();}).catch(()=>{$('saveMsg').textContent='Could not delete.';});};row.appendChild(d);}
    box.appendChild(row);}
}
async function initSaves(){
  try{const C=window.claude;if(C&&typeof C.use==='function'){const [db,user]=await Promise.all([C.use('db'),C.use('user')]);const uid=user?await user.id():null;if(db&&uid){saves.db=db;saves.uid=uid;saves.backend='db';}}}catch(e){}
  if(saves.backend==='none'&&localOK())saves.backend='local';
  for(const id of ['auto',...SAVE_SLOTS])saves.data[id]=await readSlot(id);
  if(saves.data.auto&&!saves.restored){saves.restored=true;applySave(saves.data.auto);}
  renderSaves();
}
window.__E30={saves,initSaves,validCfg,snapshotSave,COCKPIT,MIRRORS,aimMirror,THREE,state,P,wheels,update,cfg,refresh,checkFit,readout,PRESETS,CATALOG,setMode,camPreset,keys,cam};

runStage();
})();

