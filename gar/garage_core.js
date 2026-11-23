/* ===== GARAGE SHELL (part 1 of 2): renderer, scene, materials, helpers, physics, camera, car loading.
   Car-agnostic. A car is a module (CAR_MODULES[id]) that builds its own meshes into carRoot/body and animates them; this file owns everything else. ===== */
const D2R=Math.PI/180,$=id=>document.getElementById(id);
const clamp=clampv,lerp=(a,b,t)=>a+(b-a)*t;
const canvas=$('c');let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true});}catch(e){$('boot').textContent='This page needs WebGL, which your browser did not provide.';throw e;}
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(42,1,1,6000);
const FOGR=[900,3200];   // fog from and to (units); the highway sets a longer view (world.js)
function themeBG(){const c=getComputedStyle(document.documentElement).getPropertyValue('--sky').trim()||'#aab6c2';scene.background=new THREE.Color(c);scene.fog=new THREE.Fog(c,FOGR[0],FOGR[1]);}
themeBG();
if(window.matchMedia){const mq=matchMedia('(prefers-color-scheme: dark)');if(mq.addEventListener)mq.addEventListener('change',themeBG);}
new MutationObserver(themeBG).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
scene.add(new THREE.HemisphereLight(0xffffff,0x59606b,.85));
const sun=new THREE.DirectionalLight(0xffffff,.95);sun.position.set(180,320,120);scene.add(sun);
const fillL=new THREE.DirectionalLight(0xbcd0ff,.3);fillL.position.set(-200,90,-160);scene.add(fillL);

/* ---------- materials ---------- */
const matPaint=new THREE.MeshPhongMaterial({vertexColors:true,color:0xb3221e,shininess:70,specular:0x1c1c1c});
const matV=new THREE.MeshLambertMaterial({vertexColors:true}),matSealFace=new THREE.MeshLambertMaterial({vertexColors:true,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-4});   // matSealFace: the rubber's covers over paint faces (frame_seal.js)
const matGlass=new THREE.MeshPhongMaterial({vertexColors:true,transparent:true,opacity:.34,shininess:100,specular:0xcccccc,depthWrite:false,side:THREE.DoubleSide});
matGlass.userData.glass=true;   // window tint (C-06) finds every glass material by this flag; a car's clone of matGlass carries it
const matMirror=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
const matMirrorPaint=new THREE.MeshPhongMaterial({vertexColors:true,color:0xb3221e,shininess:70,side:THREE.DoubleSide});
// ---- live mirrors: each glass is a plane showing what the eye would see reflected in it.
// Exact planar mirror: a camera at the eye's reflection behind the glass, with an off-axis frustum through the glass rectangle (left/right/top/bottom from its corners).
const MIRRORS=[];
function makeMirror(parent,pos,w,h,name,yaw,self){   // self: the mirror's own housing and glass meshes, hidden while its view is rendered   // yaw: the glass is adjusted toward the driver by this angle about its vertical axis (the housing stays square to the car)
  const RW=Math.round(320*gfxL().mirRes),rt=new THREE.WebGLRenderTarget(RW,Math.max(24,Math.round(RW*h/w)));rt.texture.wrapS=THREE.RepeatWrapping;rt.texture.repeat.x=-1;rt.texture.offset.x=1;   // a mirror reverses left and right
  const plane=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:rt.texture,side:THREE.FrontSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4}));   // drawn over the voxel glass it lies on
  plane.position.copy(pos);plane.rotation.y=-Math.PI/2;parent.add(plane);   // faces -x (rearward / toward the driver)
  const cam=new THREE.PerspectiveCamera(30,w/h,.5,6000);cam.matrixAutoUpdate=false;
  return {name,plane,cam,rt,w,h,yaw:yaw||0,self:self||[]};
}
function aimMirror(m,eye){
  const V=THREE.Vector3;m.plane.updateMatrixWorld(true);const M=m.plane.matrixWorld,c=new V().setFromMatrixPosition(M);
  const px=new V().setFromMatrixColumn(M,0).normalize(),py=new V().setFromMatrixColumn(M,1).normalize(),n0=new V().setFromMatrixColumn(M,2).normalize();   // n0 = the side the glass faces
  // the glass as a driver sets it, from where the eye is: its centre reflects a level ray straight back past the car (interior mirror: through the rear window);
  // a door mirror's centre ray 3/4 of its half-angle outboard, so the car's flank shows as a sliver along the glass's inboard edge
  const d=new V().subVectors(c,eye).normalize(),side=/L$/.test(m.name)?-1:/R$/.test(m.name)?1:0;let o=n0.clone();
  if(side){const half=Math.atan2(m.w/2,eye.distanceTo(c)),a=.75*half;o=n0.clone().multiplyScalar(Math.cos(a)).addScaledVector(px,side*Math.sin(a));}
  o.y=n0.y;let n=o.normalize().sub(d).normalize();if(n.dot(n0)<=0)n=n0.clone();
  if(new V().subVectors(eye,c).dot(n0)<=.05)return false;                                  // the eye is behind the glass: nothing to show
  const k=new V().subVectors(eye,c).dot(n);if(k<=.05)return false;
  const ep=eye.clone().addScaledVector(n,-2*k);                                            // the eye reflected through the mirror surface
  const z=n.clone().negate(),x=new V().crossVectors(py,z).normalize(),y=new V().crossVectors(z,x);
  m.cam.matrixWorld.makeBasis(x,y,z).setPosition(ep);m.cam.matrixWorldInverse.copy(m.cam.matrixWorld).invert();
  // the frustum through the drawn glass rectangle: each corner projected to the near plane (with an adjusted mirror the corners lie at different depths)
  const Q=[[-1,-1],[1,-1],[-1,1],[1,1]].map(([sx,sy])=>c.clone().addScaledVector(px,sx*m.w/2).addScaledVector(py,sy*m.h/2).applyMatrix4(m.cam.matrixWorldInverse));
  const dmin=Math.min(...Q.map(q=>-q.z));if(dmin<=.05)return false;const near=dmin*.999;let l=1e9,r=-1e9,b=1e9,t=-1e9;
  for(const q of Q){const f=near/(-q.z);l=Math.min(l,q.x*f);r=Math.max(r,q.x*f);b=Math.min(b,q.y*f);t=Math.max(t,q.y*f);}
  m.cam.projectionMatrix.makePerspective(l,r,t,b,near,6000);
  m.clip=(m.clip||new THREE.Plane()).setFromNormalAndCoplanarPoint(n,c);   // the mirror surface itself is the clip: nothing on the glass's back side (its own glass cells, housing, bezel) is seen in it
  m.cam.projectionMatrixInverse.copy(m.cam.projectionMatrix).invert();
  return true;
}
function renderMirrors(){
  if(!mirrorsDue())return;   // the graphics level sets how often (world.js)
  const eye=camera.getWorldPosition(new THREE.Vector3());
  for(const m of MIRRORS){if(!aimMirror(m,eye))continue;m.plane.visible=false;const vis=m.self.map(o=>o.visible);for(const o of m.self)o.visible=false;renderer.clippingPlanes=[m.clip];renderer.setRenderTarget(m.rt);renderer.render(scene,m.cam);m.self.forEach((o,i)=>o.visible=vis[i]);m.plane.visible=true;}
  renderer.clippingPlanes=[];renderer.setRenderTarget(null);
}
const matHead=new THREE.MeshPhongMaterial({vertexColors:true,emissive:0xfff2c8,emissiveIntensity:0,shininess:80});
const matTailRed=new THREE.MeshPhongMaterial({vertexColors:true,emissive:0xff1010,emissiveIntensity:.05});
const matTailAmb=new THREE.MeshPhongMaterial({vertexColors:true,emissive:0xff9a10,emissiveIntensity:0});
const matTailWht=new THREE.MeshPhongMaterial({vertexColors:true,emissive:0xffffff,emissiveIntensity:0});
const matFrontAmb=new THREE.MeshPhongMaterial({vertexColors:true,emissive:0xff9a10,emissiveIntensity:0});

function bufGeo(d){if(!d.idx.length)return null;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(d.pos),3));g.setAttribute('normal',new THREE.BufferAttribute(new Float32Array(d.nor),3));g.setAttribute('color',new THREE.BufferAttribute(new Float32Array(d.col),3));g.setIndex(new THREE.BufferAttribute(new Uint32Array(d.idx),1));g.userData.src=d.src;g.userData.sel=d.sel||0;return g;}
function mk(grid,mat,sel,parent,scale,jit,smooth){const geo=bufGeo(geoData(grid,0,jit===undefined?.05:jit,sel||0,smooth));if(!geo)return null;const m=new THREE.Mesh(geo,mat);if(scale)m.scale.setScalar(scale);if(parent)parent.add(m);return m;}
// painted panels: drawn as a smooth surface-net skin over their cells (surfnet.js) unless SKIN.mode is 'voxel' (cube faces with smoothed normals, as before)
const SKIN={mode:'net'};
// PAINT-03 (owner, Nov 14: the E30's black B-pillar showed as ridges, "that black part with the ridges"): the trim cells of a voxel panel (sashes,
// pillars, rubber) were drawn with plain cube normals, so every 10 mm tread of a slanted pillar caught the light and every riser fell dark, a ladder.
// They now take the same fitted-surface normals as the paint: a black pillar reads as one black piece.
let TRIM_SMOOTH=true;
function paintable(grid,parent,mp,scale,smooth){const grp=new THREE.Group();
  if(SKIN.mode==='net'){const net=surfaceNet(grid,{snap:smooth&&smooth.snap?{inside:smooth.snap,scale:scale||1}:undefined,seat:smooth&&smooth.seat?{inside:smooth.seat,scale:scale||1}:undefined}),a=bufGeo(netGeo(grid,net,1)),b=bufGeo(netGeo(grid,net,2));if(a)grp.add(new THREE.Mesh(a,mp||matPaint));if(b)grp.add(new THREE.Mesh(b,matV));}
  else{const sc=scale||1,sm=smooth&&smooth.snap?Object.assign({},smooth,{outside:(X,Y,Z)=>!smooth.snap(X*sc,Y*sc,Z*sc)}):smooth;mk(grid,mp||matPaint,1,grp,undefined,undefined,sm);mk(grid,matV,2,grp,undefined,undefined,TRIM_SMOOTH?sm:undefined);}   // panels cut from the measured volume know which way is out
  if(scale)grp.scale.setScalar(scale);if(parent)parent.add(grp);return grp;}
// window rubber lines (frame_seal.js, owner Nov 13): where paint meets the black rubber on a stepped edge, the faces by the edge are covered, on the
// face, in the other colour up to a smoothed line. panels: [{g: the panel's grid, grp: its paintable group}]; each cover is drawn in the group of
// the panel its face belongs to (so it moves with it), the rubber's in the trim material, the paint's in that panel's paint (it follows the colour
// picked). A cover takes its normals and colours from the drawn face of the other colour beside it in the same plane, so it shades as that does.
// The fences (upright, along a line down a pillar's terraces) are drawn the same way, each side coloured as the face of its colour beside it.
function mkFrameSeals(panels,glass,opt){const D=frameSealData(panels,glass,opt),made=[],LIFT=0;
  const FM=new Map(),key=(x,y,z)=>Math.round(x*2)+','+Math.round(y*2)+','+Math.round(z*2),paintMat=[];
  panels.forEach((p,i)=>{if(!p.grp)return;for(const m of p.grp.children){const g=m.geometry,u=g&&g.userData;if(!u||!u.src||!u.sel)continue;if(u.sel===1&&!paintMat[i])paintMat[i]=m.material;
    const P=g.attributes.position.array,N=g.attributes.normal.array,C=g.attributes.color.array;
    for(let v=0;v+3<g.attributes.position.count;v+=4){const c=[0,0,0];for(let q=0;q<4;q++)for(let a=0;a<3;a++)c[a]+=P[(v+q)*3+a]/4;
      const cs=[0,1,2,3].map(q=>({p:[P[(v+q)*3],P[(v+q)*3+1],P[(v+q)*3+2]],n:[N[(v+q)*3],N[(v+q)*3+1],N[(v+q)*3+2]],c:[C[(v+q)*3],C[(v+q)*3+1],C[(v+q)*3+2]]}));
      FM.set(key(c[0],c[1],c[2]),{sel:u.sel,cs});}}});
  // the face of the given colour (sel) beside a cell's face, in the same plane: nearest first
  const OFF=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1],[2,0],[-2,0],[0,2],[0,-2]];
  const beside=(cell,f,sel)=>{const n=FACES[f].n,ax=n[0]?0:n[1]?1:2,u=(ax+1)%3,w=(ax+2)%3;
    for(const [du,dw] of OFF){const c=cell.slice();c[u]+=du;c[w]+=dw;const e=FM.get(key(c[0]+n[0]/2,c[1]+n[1]/2,c[2]+n[2]/2));if(e&&e.sel===sel)return {e,u,w};}return null;};
  // bilinear in the face's plane, from its four corners (and on past them, a little, for a cover beside it)
  const at=(B,x)=>{const {e,u,w}=B,us=e.cs.map(c=>c.p[u]),ws=e.cs.map(c=>c.p[w]),u0=Math.min(...us),w0=Math.min(...ws);
    const a=Math.max(-1,Math.min(2,x[u]-u0)),b=Math.max(-1,Math.min(2,x[w]-w0)),r={n:[0,0,0],c:[0,0,0]};
    for(const c of e.cs){const ca=c.p[u]-u0>.5?a:1-a,cb=c.p[w]-w0>.5?b:1-b,k=ca*cb;for(let i=0;i<3;i++){r.n[i]+=c.n[i]*k;r.c[i]+=c.c[i]*k;}}
    const l=Math.hypot(...r.n)||1;r.n=r.n.map(v=>v/l);r.c=r.c.map(v=>Math.max(0,Math.min(1,v)));return r;};
  D.forEach((d,i)=>{if(!panels[i].grp||!d.black)return;
    for(const [kind,sel,mat] of [['black',2,matV],['paint',1,paintMat[i]]]){const L=d[kind];if(!L.length||!mat)continue;const pos=[],nor=[],col=[],idx=[];
      for(const c of L){const n=FACES[c.f].n,B=beside(c.cell,c.f,sel),base=pos.length/3;
        for(const x of c.poly){pos.push(x[0]+n[0]*LIFT,x[1]+n[1]*LIFT,x[2]+n[2]*LIFT);
          if(B){const r=at(B,x);nor.push(...r.n);col.push(...r.c);}else{const s=FACES[c.f].s;nor.push(...n);col.push(...(sel===1?[.85*s,.85*s,.85*s]:[.1*s,.1*s,.11*s]));}}
        for(let k=1;k+1<c.poly.length;k++)idx.push(base,base+k,base+k+1);}
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(pos),3));geo.setAttribute('normal',new THREE.BufferAttribute(new Float32Array(nor),3));
      geo.setAttribute('color',new THREE.BufferAttribute(new Float32Array(col),3));geo.setIndex(idx);
      // drawn on the face itself, pulled forward in depth only (polygon offset) so it wins over the face it covers: no gap at a face's edge, nothing
      // lifted off the panel. The paint's cover shares the panel's paint material (so it takes the colour and finish picked) and sets the offset
      // on it for its own draw only.
      const m=new THREE.Mesh(geo,kind==='black'?matSealFace:mat);m.userData.frameSeal=kind;
      if(kind==='paint')offsetDraw(m);
      panels[i].grp.add(m);made.push(m);}});
  // the fences: each side coloured as the drawn face of its colour nearest beside it, lit with the surface's normal (as the smoothed paint is)
  const nearest=(x,sel)=>{let b=null,bd=1e9;const X=Math.round(x[0]),Y=Math.round(x[1]),Z=Math.round(x[2]);
    for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++)for(let k=-2;k<=2;k++)for(const F of FACES){const c=[X+i+F.n[0]/2,Y+j+F.n[1]/2,Z+k+F.n[2]/2],e=FM.get(key(c[0],c[1],c[2]));if(!e||e.sel!==sel)continue;
      const d=Math.hypot(c[0]-x[0],c[1]-x[1],c[2]-x[2]);if(d<bd){bd=d;b=e;}}return b;};
  D.forEach((d,i)=>{if(!panels[i].grp||!d.fence)return;
    for(const sel of [1,2]){const mat=sel===1?paintMat[i]:matV;if(!mat)continue;const pos=[],nor=[],col=[],idx=[];   // no polygon offset: a fence stands across the faces, and an offset (which grows as a face turns edge-on) would show it through them
      for(const F of d.fence){if(F.sel!==sel||!F.idx.length)continue;const base=pos.length/3;pos.push(...F.pos);nor.push(...F.nor);for(const j of F.idx)idx.push(base+j);
        F.at.forEach(x=>{const e=nearest(x,sel),c=e?[0,1,2].map(a=>(e.cs[0].c[a]+e.cs[1].c[a]+e.cs[2].c[a]+e.cs[3].c[a])/4):(sel===1?[.85,.85,.85]:[.1,.1,.11]);col.push(...c,...c);});}
      if(!idx.length)continue;const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(pos),3));geo.setAttribute('normal',new THREE.BufferAttribute(new Float32Array(nor),3));
      geo.setAttribute('color',new THREE.BufferAttribute(new Float32Array(col),3));geo.setIndex(idx);
      const m=new THREE.Mesh(geo,mat);m.userData.frameSeal=sel===1?'fencePaint':'fenceRubber';panels[i].grp.add(m);made.push(m);}});
  return made;}
// draw a mesh that shares a material with its polygon offset pulled forward, for its own draw only
function offsetDraw(m){let was;m.onBeforeRender=(r,sc,cam,g,mt)=>{was=[mt.polygonOffset,mt.polygonOffsetFactor,mt.polygonOffsetUnits];mt.polygonOffset=true;mt.polygonOffsetFactor=-1;mt.polygonOffsetUnits=-4;};
  m.onAfterRender=(r,sc,cam,g,mt)=>{if(was)[mt.polygonOffset,mt.polygonOffsetFactor,mt.polygonOffsetUnits]=was;};}
// smooth glass mesh fitted through the voxel glass (glassSurface in e30_core): one continuous glossy pane, no steps
function mkGlass(G,kind,parent,scale,tint,mat){const s=glassSurface(G,kind);if(!s)return null;const geo=new THREE.BufferGeometry(),c=new Float32Array(s.pos.length),T=tint||[.55,.72,.80];
  for(let i=0;i<c.length;i+=3){c[i]=T[0];c[i+1]=T[1];c[i+2]=T[2];}
  geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(s.pos),3));geo.setAttribute('color',new THREE.BufferAttribute(c,3));geo.setIndex(s.idx);geo.computeVertexNormals();geo.userData.src=G;geo.userData.sel=0;
  const m=new THREE.Mesh(geo,mat||matGlass);if(scale)m.scale.setScalar(scale);if(parent)parent.add(m);return m;}
// windshields, rear windows, hatch glass: a smooth pane inside a straightened outline, with its black rubber seal resting on the panel round it (glass_trim.js)
const matSeal=new THREE.MeshPhongMaterial({color:0x0d0e10,shininess:28,specular:0x2a2a2a,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2});
// voxel-mode windshield / rear window / hatch glass: the sheet over the glass's own columns (glass_trim.js glassSheet)
function mkGlassSheet(G,parent,scale,inside,lift,panels,tint,mat){const s=glassSheet(G,inside,lift,panels);if(!s.idx.length)return null;const geo=new THREE.BufferGeometry(),c=new Float32Array(s.pos.length),T=tint||[.55,.72,.80];
  for(let i=0;i<c.length;i+=3){c[i]=T[0];c[i+1]=T[1];c[i+2]=T[2];}
  geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(s.pos),3));geo.setAttribute('color',new THREE.BufferAttribute(c,3));geo.setIndex(s.idx);geo.computeVertexNormals();geo.userData.src=G;geo.userData.sel=0;
  const m=new THREE.Mesh(geo,mat||matGlass);if(scale)m.scale.setScalar(scale);if(parent)parent.add(m);return m;}
function mkPane(G,parent,scale,opt){const gp=(opt&&opt.gp)||glassPane(G,opt);if(!gp)return null;
  const geo=new THREE.BufferGeometry(),c=new Float32Array(gp.pane.pos.length);for(let i=0;i<c.length;i+=3){c[i]=.55;c[i+1]=.72;c[i+2]=.80;}
  geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(gp.pane.pos),3));geo.setAttribute('color',new THREE.BufferAttribute(c,3));geo.setIndex(gp.pane.idx);geo.computeVertexNormals();geo.userData.src=G;geo.userData.sel=0;
  const m=new THREE.Mesh(geo,matGlass),sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(gp.seal.pos),3));sg.setIndex(gp.seal.idx);sg.computeVertexNormals();
  const s=new THREE.Mesh(sg,matSeal),fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(gp.frit.pos),3));fg.setIndex(gp.frit.idx);fg.computeVertexNormals();
  const f=new THREE.Mesh(fg,matSeal);for(const o of [m,s,f]){if(scale)o.scale.setScalar(scale);if(parent)parent.add(o);}
  return {pane:m,seal:s,frit:f,gp,meshes:[m,s,f]};}
function group(parent,x,y,z){const g=new THREE.Group();g.position.set(x||0,y||0,z||0);if(parent)parent.add(g);return g;}
function swapGeo(mesh,grid,jit){mesh.geometry.dispose();mesh.geometry=bufGeo(geoData(grid,0,jit===undefined?.05:jit,0));}

/* ---------- scene graph (rebuilt per car; the objects themselves persist so car modules can hold references) ---------- */
const carRoot=new THREE.Group();scene.add(carRoot);
const body=new THREE.Group();carRoot.add(body);
const wheels={};              // FL FR RL RR
const P={};                    // misc animated parts
const build={};                // per-car build products (shell grids etc.)
const state={mode:'drive',paint:0,wheel:'mesh',drop:0,doorL:0,doorR:0,rdoorL:0,rdoorR:0,hood:0,trunk:0,win:0,lights:0,hazard:0,wipers:0,sound:false,view:'orbit',
  x:0,z:0,psi:0,v:0,throttle:0,brake:0,steer:0,steerIn:0,rpm:850,gear:1,spin:0,drive:0,
  bodyY:0,pitch:0,roll:0,ax:0,ay:0,t:0,bobExtra:0,shiftT:0,odo:0,lookYaw:0,lookPitch:0,nitrous:null};
const anim={doorL:0,doorR:0,rdoorL:0,rdoorR:0,hood:0,trunk:0,win:0,wip:0,cover:0,pop:0};
const cfg=defaultCfg();                // the build being edited; persists across cars (replaced in place)
const keys={};

/* ---------- placement helpers ---------- */
const V3=THREE.Vector3,Q=new THREE.Quaternion(),yAxis=new V3(0,1,0),zAxis=new V3(0,0,1);
function segTo(mesh,p0,p1,axis,len,r){
  const d=new V3().subVectors(p1,p0),l=d.length();if(l<1e-3)return;d.divideScalar(l);
  mesh.position.copy(p0);mesh.quaternion.setFromUnitVectors(axis,d);
  if(axis===yAxis)mesh.scale.set(r||1,l/len,r||1);else mesh.scale.set(r||1,r||1,l/len);   // r: cross-section scale (.5 for links built in 10 mm cells)
}
const bodyM=new THREE.Matrix4();
function bodyPt(x,y,z){return new V3(x,y,z).applyMatrix4(bodyM);}

/* ---------- driving model. phys is derived from the build (applyDrive); the car module reads it for the visuals ---------- */
const phys={GEAR:[0,3.83,2.20,1.40,1.00,.81],FINAL:3.73,WR_M:.295,MASS:1275,curve:rpm=>200,TQ:1,NQ:0,RED:6900,CYL:6,EXH:0,BUILD_OK:true,WHEELBASE:2.57,TACH:7000,MU:.9,MU_LONG:1};
function torque(rpm){return phys.curve(rpm);}
// driving assists (View tab): normal: traction control and stability control, as a modern car has (stability control pauses while the handbrake is
// pulled and half a second after, so a handbrake turn works); drift: a limiter that stops a slide past about 35 degrees from becoming a spin; off: the raw
// car. None of them touches the steering (STEER-03): the front wheels always point where the steering wheel puts them. Kept on this device.
const ASSIST={mode:'normal'};try{const m=localStorage.getItem('vg.assist');if(m==='drift'||m==='off')ASSIST.mode=m;}catch(e){}
/* ---------- steering (STEER-03, owner Nov 14: "it should be realistic. dependent and relevant to the drivetrain. and responsive to the steering wheel";
   picked real car steering, driven on the keyboard). The keys, the pad's stick and the touch slider turn the STEERING WHEEL. The front wheels follow it
   through the car's own rack: road-wheel angle = steering-wheel angle / ratio, from the car's sourced turns lock to lock or ratio (CAR.steer, shells.js)
   and its lock (MOD.maxSteer, from its turning circle). Nothing holds the angle to what the tyres can take: past their grip the car slides, as a real
   one does. The cockpit wheel shows the same angle (state.sw).
   - Keys: the driver's hands turn the wheel. They start gently and speed up as the key is held, so a tap is a small correction and a hold winds on.
     They are quick at parking speed and slower at speed, as hands are: 600 deg/s parked, 350 at 36 km/h, 95 at 100 km/h, 27 at 200 [D].
   - Let go: the caster turns the wheels toward where the front axle is travelling. In a turn that is straight ahead; in a slide it is into the slide,
     the opposite lock a driver's loose hands let the wheel spin to. Mid-corner the front tyres' slip goes first, then the turn eases off. At a crawl
     there is little caster, and the hands unwind it at their own pace.
   - Steering back the other way, the hands and the caster work together.
   - The stick and the slider set the wheel's angle (a curve, so small moves are fine), at the hands' quick rate. ---------- */
const HAND=v=>10.5/(1+(v/12)*(v/12));   // the hands' full rate, steering-wheel radians per second, at speed v (m/s) [D]
function steerSpec(){   // {lock: road-wheel lock (rad), sw: steering-wheel angle at that lock (rad), ratio, turns}
  const lock=(MOD&&MOD.maxSteer)||.52,s=(typeof CAR!=='undefined'&&CAR&&CAR.steer)||{turns:3};
  const ratio=s.ratio||(s.turns*Math.PI/lock),sw=lock*ratio;return {lock,sw,ratio,turns:sw/Math.PI};}
function steerStep(dt,drv,steerKey,analog){
  const S=steerSpec(),v=state.v,vS=Math.max(0,v),hand=HAND(Math.abs(v))/S.sw;   // the hands' rate, in full locks per second
  // where the caster points the wheels: the front axle's direction of travel, moving forward above a walk
  const L=phys.WHEELBASE||2.5,aF=L*(1-(phys.WF||.52)),bF=Math.atan2((state.vy||0)+aF*(state.yawR||0),Math.max(.1,vS));
  const free=drv?clamp(.7*bF/S.lock,-1,1)*clamp((vS-2)/4,0,1):0;   // 0.7: the weight on the front wheels (kingpin inclination and caster lift the car as the wheels turn) pulls them toward straight ahead too [D]
  const tau=.25+.8/(1+vS),capR=20.9/S.sw;   // the caster's pull, slowed by the hands still on the rim: a time constant of 0.28 s at 100 km/h, 0.32 s at 36 km/h, 0.37 s at 20 km/h; at most 1200 deg/s of wheel. Slow enough that taps on a key hold a steady part-turn through a long corner
  const toward=t=>clamp(Math.abs(state.steer-t)/tau,0,capR);
  if(steerKey!==0){if(state.kDir!==steerKey){state.kDir=steerKey;state.kT=0;}state.kT+=dt;}else{state.kDir=0;state.kT=0;}
  let target,rate;
  if(steerKey!==0){target=steerKey;rate=hand*(.4+.6*Math.min(1,state.kT/.4));   // a held key: the hands wind on, gently at first
    if(state.steer*steerKey<0)rate=Math.max(rate,toward(free));}   // back through the centre: the caster helps
  else if(analog!==0){target=Math.sign(analog)*Math.pow(Math.abs(analog),1.5);rate=hand*1.6;if(Math.abs(target)<Math.abs(state.steer)||target*state.steer<0)rate=Math.max(rate,toward(free));}
  else{target=free;rate=Math.max(hand*clamp(1-vS/8,0,1)*(drv?1:.6),toward(free));}   // hands off: the caster; at a crawl, where the caster is weak, the hands unwind it
  state.steer=clamp(state.steer+clamp(target-state.steer,-rate*dt,rate*dt),-1,1);
  state.sw=state.steer*S.sw;   // the steering wheel's angle (rad), left positive
  return state.steer*S.lock;}   // the front wheels' angle (the bicycle angle; the car module splits it into each wheel's Ackermann angle)
function stepCar(dt){
  const drv=state.mode==='drive';   // in the garage the car is parked: no throttle, no steering, brakes held
  // driver's view, Space held: the brake stays on and W A S D (or the arrows) turn the driver's head instead of driving; the head comes back to the road once
  // the car moves off again without Space held
  const looking=state.view==='cockpit'&&!!keys[' '];
  if(looking){const yr=((keys.a||keys.arrowleft)?1:0)-((keys.d||keys.arrowright)?1:0),pr=((keys.w||keys.arrowup)?1:0)-((keys.s||keys.arrowdown)?1:0);
    state.lookYaw=clamp(state.lookYaw+yr*dt*1.8,-2.6,2.6);state.lookPitch=clamp(state.lookPitch+pr*dt*1.3,-1.0,.75);}
  else if(Math.abs(state.v)>.8&&!state.lookHold){state.lookYaw*=Math.max(0,1-dt*3);state.lookPitch*=Math.max(0,1-dt*3);}
  const kT=drv&&!looking&&(keys.w||keys.arrowup||state.padGas),kB=drv&&!looking&&(keys.s||keys.arrowdown||state.padBrake);
  // a game controller (pollPad in garage_ui.js, owner Nov 13): its triggers are analog pedals (R2 gas, L2 brake, and reverse from a stop as S does), its
  // left stick an analog wheel. Keys win when both are used; the pedal and wheel filters below are the same for both
  const gp=drv&&!looking,thrIn=Math.max(kT?1:0,gp?state.gpThr||0:0),brkIn=Math.max(kB?1:0,gp?state.gpBrk||0:0);
  // the brake lamps answer the driver (the pedal while rolling forward, the throttle while rolling back, Space), not the foot-hold at rest below or the
  // parked brake in the garage: they were lit at every stop and in the garage on every car (owner's Model X note, Nov 12)
  state.brakeLamp=drv&&((brkIn>0&&state.v>.6)||(thrIn>0&&state.v<-.6)||!!keys[' ']);
  const steerKey=looking?0:((keys.a||keys.arrowleft)?1:0)-((keys.d||keys.arrowright)?1:0),gpS=gp?state.gpSteer||0:0;
  // the steering wheel (steerStep above). With the wheel pulled off its quick-release hub there is nothing to steer with: only the caster turns it
  const hands=drv&&!state.swOff,delta=steerStep(dt,drv,hands?steerKey:0,hands?(gpS!==0?gpS:(state.steerIn||0)):0);
  let thr=0,brk=0,rev=false;
  const GEAR=phys.GEAR,FINAL=phys.FINAL,WR_M=phys.WR_M,RED=phys.RED,MASS=phys.MASS,BUILD_OK=phys.BUILD_OK;
  if(thrIn>0&&BUILD_OK){thr=thrIn;}
  if(brkIn>0){if(state.v>.6)brk=brkIn;else if(BUILD_OK){rev=true;thr=brkIn;}}
  if(keys[' ']&&drv)brk=Math.max(brk,.7);if(!drv)brk=1;   // parked: brake held
  // off the pedals below 8 km/h the driver's foot holds the car (it stops and stays stopped, as a driver at a light)
  const sp0=Math.hypot(state.v,state.vy||0);if(drv&&!thr&&!brkIn&&sp0<2.2)brk=Math.max(brk,.35);
  // the pedal goes down over a third of a second (a foot squeezes it; keys would slam it) and comes up in a tenth; at rest nothing is left over
  state.throttle=clamp(state.throttle+clamp(thr-state.throttle,-dt*10,dt*(ASSIST.mode==='off'?8:3)),0,1);
  state.brake+=(brk-state.brake)*Math.min(1,dt*10);if(!brk&&state.brake<.01)state.brake=0;
  const sp=Math.abs(state.v);
  // gearbox: automatic shifter
  const wheelRpm=sp/(2*Math.PI*WR_M)*60;
  const clutch=phys.EV?1:(sp<3.5?clamp(sp/3.5,0,1):1);
  if(phys.EV){state.gear=rev?0:1;state.rpm=wheelRpm*FINAL;state.shiftT=0;}
  else{
  if(!rev){
    let g=state.gear;
    if(state.rpm>RED-400&&g<GEAR.length-1)g++;
    if(g>1&&wheelRpm*GEAR[g]*FINAL<2300&&state.throttle<.9)g--;
    if(g>1&&wheelRpm*GEAR[g-1]*FINAL<5200&&state.throttle>.9&&g>2)g--;
    if(sp<2)g=1;
    if(g!==state.gear){state.gear=g;state.shiftT=shiftTime(cfg);}   // SPEC-INTERIOR §2.3: the fitted shifter's shift time (stock 0.35 s)
  }else state.gear=0;
  const geared=(wheelRpm+(state.wspin||0)*6/(2*Math.PI*WR_M)*60)*GEAR[Math.max(1,state.gear)]*FINAL;   // a spinning wheel turns faster than the road
  const free=850+state.throttle*(RED-1300);
  let rpmT=lerp(Math.max(850,Math.min(free,RED-200)),Math.max(850,geared),clutch);
  if(state.shiftT>0){state.shiftT-=dt;rpmT*=.86;}
  state.rpm+=(rpmT-state.rpm)*Math.min(1,dt*(rpmT>state.rpm?9:5));
  state.rpm=clamp(state.rpm,800,RED);
  }
  // ---- forces: a two-axle (bicycle) model with tyres, each axle's two wheels loaded separately. Every number that a part changes comes from the build
  // (vehiclePhysics in fit.js): tyre grip (width, camber) and stiffness (profile), roll and its front/rear split (springs, dampers), CG height (ride
  // height, cage), track (offsets), differential, brake heat capacity, aero lift and downforce, turbo lag.
  //  - Longitudinal load transfer: braking loads the front, power the rear. Lateral load transfer: each axle's share (lltdF) moves load from the inside
  //    wheel to the outside one, and since a tyre grips less per newton as its load rises (load sensitivity, Milliken), the axle carrying more of the
  //    transfer loses grip: stiffer at the front pushes wide, stiffer at the rear rotates the car.
  //  - Lateral force: a Pacejka-type curve (C 1.3) peaking near 8 degrees of slip and holding about 90 % of its peak sliding (D: 1.5 held only 70 % and
  //    made every slide a spin); the rear tyres are 40 % stiffer (they peak near 6 degrees) and have 7 % more grip (D: production cars are set up to understeer at the limit).
  //    The slip angle is taken in each wheel's own frame, so a car sliding sideways or backward after a spin is still held by its tyres.
  //  - Traction shares the grip (friction circle): too much power spins the driven wheels and a spinning tyre holds little sideways, so a rear-drive car
  //    steps out. Differential: an open diff can only send the inside wheel's grip to both (one-wheel peel); an LSD sends up to its bias ratio times that.
  //  - Brakes: ABS (where the car has it) keeps them at the limit; without it they lock. They heat with every stop and fade; bigger rotors take longer.
  //  - The handbrake locks the rear wheels. Below walking pace the car follows the plain steering geometry.
  //  - Assists (ASSIST): traction control keeps the driven tyres inside their friction circle for the sideways force they carry; stability control
  //    brakes one wheel against a yaw rate beyond the steering's and cuts the power. A real car's systems do the same. The steering is the driver's alone.
  const hbK=drv&&!looking&&!!(keys.shift||keys.e||state.padHB||state.gpHB);state.hb=hbK?1:0;state.hbT=hbK?.5:Math.max(0,(state.hbT||0)-dt);
  const L=phys.WHEELBASE,wf=phys.WF||.52,hcg=phys.hcg||phys.HCG||.5,mu=(phys.MU||.9),muL=Math.min(mu*1.05,mu*(phys.MU_LONG||1)),g9=9.81,Iz=MASS*L*L*wf*(1-wf)*1.05;
  const aF=L*(1-wf),bR=L*wf,lay=phys.LAYOUT||'FR',track=phys.track||1.42,lltd=phys.lltdF||.55,tbr=phys.tbr||1,Bt=(phys.B||11)*1.6,Ct=1.3,rho=1.2,RB=1.07;
  const AS=drv?ASSIST.mode:'off',TC=AS==='normal',ESC=AS==='normal'&&state.hbT<=0&&!rev;
  // turbo boost (spools with revs and time) and the torque at the wheels
  if(phys.boost){const B0=phys.boost,tgt=state.throttle*clamp((state.rpm-B0.from)/(B0.full-B0.from),0,1);state.boost=(state.boost||0)+(tgt-(state.boost||0))*Math.min(1,dt/B0.tau);}else state.boost=1;
  // Stage C (SPEC-INTERIOR §5.6/§5.7): the nitrous spray state machine — ONE state, read
  // here (drive) and by readout(). Pressure: 925 psi while fill > 3 lb, linear to 0 at
  // fill = 0; spray DISABLED below 800 psi (cutoff at fill ≈ 2.6 lb). Max continuous
  // spray 15 s → cutoff + lockout. The lockout clears ONLY on disarm + re-arm via the
  // switch (setNitrousArm) — a throttle lift pauses the spray and changes NOTHING else.
  const nz=state.nitrous;
  if(nz){nz.pressure=nz.fill>3?925:925*nz.fill/3;
    const wot=state.throttle>0.95,want=nz.armed&&wot&&state.rpm>=3000&&!nz.lockout&&nz.pressure>=800;
    if(want&&!nz.spraying)nz.spraying=true;
    if(!want&&nz.spraying)nz.spraying=false;   // pause: sprayT and lockout UNCHANGED
    if(nz.spraying){nz.fill=Math.max(0,nz.fill-nz.shotHp*0.00113*dt);nz.sprayT+=dt;
      if(nz.sprayT>=15){nz.spraying=false;nz.lockout=true;}}}
  const bmul=phys.boost?phys.boost.off+(1-phys.boost.off)*state.boost:1;
  const nmul=nz&&nz.spraying?1+(phys.NQ||0):1;
  let Fdrive=phys.EV?MODELX_EV.force(phys,state,rev):0;if(!phys.EV&&state.throttle>0){const T=torque(state.rpm)*bmul*nmul*phys.TQ*state.throttle*(state.rpm>RED-200?0:1);Fdrive=T*GEAR[Math.max(1,state.gear)]*FINAL*.88/WR_M*(rev?-.5:1)*(clutch*.65+.35);}
  else if(!phys.EV&&state.gear>0&&state.v>2)Fdrive=-torque(state.rpm)*.12*GEAR[state.gear]*FINAL/WR_M*Math.min(1,state.rpm/3000);   // engine braking off the throttle
  // the front wheels' angle is the steering wheel's over the rack ratio (steerStep): no assist changes it
  state.delta=delta;
  const tyre=(al,D,B)=>-D*Math.sin(Ct*Math.atan(B*al));   // lateral force for slip angle al, peak D, stiffness B (the rear's 40 % stiffer: D, a production car's linear-range understeer, about 0.8 degrees per g with this model)
  const sens=(Fz,F0)=>Math.max(0,Fz*(1-.12*(Fz/F0-1)));   // load sensitivity (Milliken: peak Fy/Fz falls about 12 % as a tyre's load doubles)
  // brake heat: energy in, cooling out (faster with airflow); past the onset the brakes give less (fade)
  const heatCap=1.2e6*(phys.heat||1);state.bheat=Math.max(0,(state.bheat||0)-((state.bheat||0)*(.012+Math.abs(state.v)*.0009))*dt);   // (D: stock brakes start to fade on the third or fourth hard stop from 100 km/h in a row)
  const fade=1-.45*clamp((state.bheat/heatCap-1)/.8,0,1);state.fade=fade;
  let vx=state.v,vy=state.vy||0,r=state.yawR||0,axS=0,ayS=0,spin=0,lock=0,escOn=0,YfP=state.YfP||0,YrP=state.YrP||0;const n=dt>0?Math.max(1,Math.ceil(dt/.004)):0,h=n?dt/n:0,lagK=Math.min(1,h/(phys.lag||.12));   // (a zero step, as the tests use to settle the car, moves nothing)
  const cd=Math.cos(delta),sd=Math.sin(delta);
  for(let it=0;it<n;it++){
    const s=Math.abs(vx),sg=s>.05?Math.sign(vx):0,v2=vx*vx,vt=Math.hypot(vx,vy);
    // axle loads: static, aero (lift or downforce grows with the square of speed), longitudinal transfer
    const ax0=state.axF||0,aeroF=.5*rho*v2*(phys.clF||0),aeroR=.5*rho*v2*(phys.clR||0);
    const Fzf=Math.max(.15*MASS,MASS*g9*bR/L-MASS*ax0*hcg/L+aeroF),Fzr=Math.max(.15*MASS,MASS*g9*aF/L+MASS*ax0*hcg/L+aeroR);
    const F0f=MASS*g9*bR/L/2,F0r=MASS*g9*aF/L/2;   // each wheel's static share
    // lateral transfer per axle (from the lagged lateral acceleration), and each axle's grip with its inside and outside wheel
    const dT=MASS*Math.abs(state.ayF||0)*hcg/track,dFf=Math.min(Fzf/2,dT*lltd),dFr=Math.min(Fzr/2,dT*(1-lltd));
    const gripF=mu*(sens(Fzf/2-dFf,F0f)+sens(Fzf/2+dFf,F0f)),gripR=mu*RB*(sens(Fzr/2-dFr,F0r)+sens(Fzr/2+dFr,F0r));
    // traction: what the differential can put down on the driven axle: the whole axle's grip, or less when the inside wheel's grip times the bias ratio is
    // smaller (then only the light inside wheel spins: an open diff's one-wheel peel, which costs little cornering grip; an LSD spins both and steps out)
    const diffCap=(Fz,dF)=>{const ax=muL*Fz,df=muL*(Fz/2-dF)*(1+tbr);return df<ax?{t:df,inside:(Fz/2-dF)/Fz}:{t:ax,inside:0};};
    const tcF=diffCap(Fzf,dFf),tcR=diffCap(Fzr,dFr);let penF=1,penR=1;
    // braking: the pedal's force (faded), split 65/35; ABS holds each axle at its limit, without it a wheel past its limit locks
    const brakeF=state.brake*phys.BRAKE*fade*sg;
    let Xf=-brakeF*.65,Xr=-brakeF*.35,capF=muL*Fzf,capR=muL*Fzr;
    if(phys.abs){Xf=Math.sign(Xf)*Math.min(Math.abs(Xf),capF*.97);Xr=Math.sign(Xr)*Math.min(Math.abs(Xr),capR*.97);}
    let slipF=false,slipR=false;
    if(Math.abs(Xf)>capF){Xf=Math.sign(Xf)*capF*.85;slipF=true;lock=1;}if(Math.abs(Xr)>capR){Xr=Math.sign(Xr)*capR*.85;slipR=true;lock=1;}
    // stability control: the yaw rate the steering asks for (a mildly understeering car, no more than the tyres can give) against the car's
    let Mesc=0,dCut=1;
    if(ESC&&vx>5){const rSS=vx*Math.tan(delta)/(L*(1+.0006*v2)),rMax=.9*mu*g9/vx,rRef=clamp(rSS,-rMax,rMax),beta=Math.atan2(vy,vx);
      const over=Math.abs(r)>Math.abs(rRef)*1.1+.05&&(Math.sign(r)!==Math.sign(rRef)||Math.abs(r)>Math.abs(rRef)),eR=r-rRef;
      if(over||Math.abs(beta)>.09){const Mmax=muL*Fzf*.5*track*.5;Mesc=clamp(-eR*Iz*7+beta*Iz*3*(Math.abs(beta)>.09?1:0),-Mmax,Mmax);escOn=1;dCut=clamp(1-Math.abs(Mesc)/Mmax*1.6,0,1);}}
    // drive by layout, limited by the differential; traction control keeps the driven axle inside its friction circle for the sideways force it carries
    let Fd=Fdrive>0?Fdrive*dCut:Fdrive;const dr0=phys.EV?[Fd*314/932,Fd*618/932]:lay==='FF'?[Fd,0]:lay==='AWD'?[Fd*.4,Fd*.6]:[0,Fd];
    let electricalForce=0; // actual motor force after traction limits; used for battery energy only
    if(TC&&Fd>0){if(dr0[0])dr0[0]=Math.min(dr0[0],Math.min(tcF.t,capF*Math.sqrt(Math.max(0,1-(YfP/Math.max(1,gripF))**2)))*.97);
      if(dr0[1])dr0[1]=Math.min(dr0[1],Math.min(tcR.t,capR*Math.sqrt(Math.max(0,1-(YrP/Math.max(1,gripR))**2)))*.97);}
    if(dr0[0]){const T=tcF;let d=dr0[0];if(Math.abs(d)>T.t){d=Math.sign(d)*T.t*.95;if(Fd>0)spin=1;if(T.inside)penF=1-.3*T.inside;else slipF=true;}Xf+=d;electricalForce+=d;}
    if(dr0[1]){const T=tcR;let d=dr0[1];if(Math.abs(d)>T.t){d=Math.sign(d)*T.t*.95;if(Fd>0)spin=1;if(T.inside)penR=1-.3*T.inside;else slipR=true;}Xr+=d;electricalForce+=d;}
    if(phys.EV)MODELX_EV.energy(state,electricalForce*vx,h);
    if(hbK&&s>.5){Xr=-muL*Fzr*.85*sg;slipR=true;}
    // the friction circle: what traction and braking use is not there for cornering; a spinning or locked tyre holds less still
    const latF=Math.sqrt(Math.max(.05,1-Math.min(1,(Xf/capF)*(Xf/capF))))*(slipF?.8:penF),latR=Math.sqrt(Math.max(.05,1-Math.min(1,(Xr/capR)*(Xr/capR))))*(slipR?.8:penR);
    const drag=.5*rho*phys.CdA*vx*vt,roll=.0112*MASS*g9*sg;
    state.bheat=(state.bheat||0)+Math.abs((Xf+Xr)<0&&state.brake>0?(Math.min(0,Xf)+Math.min(0,Xr))*vx:0)*h;   // braking work becomes heat
    if(vt>1.5){
      // slip angles in each wheel's own frame (forward, sideways or backward)
      const vyF=vy+aF*r,vyR=vy-bR*r,vlF=vx*cd+vyF*sd,vsF=-vx*sd+vyF*cd;
      const alF=Math.atan2(vsF,Math.max(.3,Math.abs(vlF))),alR=Math.atan2(vyR,Math.max(.3,Math.abs(vx)));
      const Yf=tyre(alF,gripF*latF,Bt),Yr=tyre(alR,gripR*latR,Bt*1.4);YfP=Math.abs(Yf);YrP=Math.abs(Yr);
      let Mz=aF*(Yf*cd+Xf*sd)-bR*Yr+Mesc;
      // drift mode: past 35 degrees of slide, a rotation that would make it a spin is damped (the driver's countersteer and throttle, quicker than keys)
      if(AS==='drift'){const beta=Math.atan2(vy,Math.abs(vx)+.1);if(r*beta<0&&Math.abs(beta)>.6)Mz-=r*Iz*6*clamp((Math.abs(beta)-.6)/.4,0,1);}
      const fx=Xf*cd-Yf*sd+Xr-drag-roll-(escOn?Math.abs(Mesc)/(track*.5)*.5*sg:0),fy=Xf*sd+Yf*cd+Yr;
      const dvx=fx/MASS+vy*r,dvy=fy/MASS-vx*r,drr=Mz/Iz;
      const k=Math.min(1,(vt-1.5)/2.5);   // blend in from the plain geometry over 1.5 to 4 m/s
      vx+=dvx*h;vy+=dvy*h;r+=drr*h;
      const rk=vx/L*Math.tan(delta);r=r*k+rk*(1-k);vy*=k+(1-k)*Math.max(0,1-h*8);
      axS+=(fx/MASS)*h;ayS+=(fy/MASS)*h;state.ayF=(state.ayF||0)+(fy/MASS-(state.ayF||0))*lagK;}
    else{   // walking pace and reversing: the steering geometry alone
      let fx=Xf+Xr-drag-roll;if(s<.15&&Fdrive===0&&state.brake>.05){vx=0;fx=0;}
      vx+=fx/MASS*h;if(rev&&vx<-(phys.EV?MODELX_SPEC.reverseKph/3.6:5))vx=-(phys.EV?MODELX_SPEC.reverseKph/3.6:5);if(!rev&&vx<0&&!brkIn)vx=Math.min(0,vx+3*h);
      if(Fdrive===0&&Math.abs(vx)<.35){vx*=Math.max(0,1-h*6);if(Math.abs(vx)<.03)vx=0;}   // rolling resistance holds a car at rest: off the throttle it comes to a stop and stays
      r=vx/L*Math.tan(delta);vy*=Math.max(0,1-h*8);if(Math.abs(vy)<.02)vy=0;axS+=(fx/MASS)*h;ayS+=vx*r*h;state.ayF=(state.ayF||0)+(vx*r-(state.ayF||0))*lagK;YfP=YrP=0;}
    state.axF=(state.axF||0)+((axS/((it+1)*h))-(state.axF||0))*lagK;   // the load transfer follows the acceleration with the dampers' lag
    state.psi+=r*h;const c=Math.cos(state.psi),sn=Math.sin(state.psi);
    state.x+=(vx*c-vy*sn)*h/.02;state.z+=(-vx*sn-vy*c)*h/.02;}
  // at rest: parked, or stopped with no pedal, the car does not move at all
  if(!drv||(!thr&&Math.hypot(vx,vy)<.25&&Math.abs(r)<.08)){vx=vy=r=0;}
  state.lock=lock;state.esc=escOn;state.YfP=YfP;state.YrP=YrP;
  state.v=vx;state.vy=vy;state.yawR=r;state.ax=dt>0?axS/dt:0;state.ay=dt>0?ayS/dt:0;state.slip=Math.atan2(vy,Math.max(1,Math.abs(vx)));   // body slip angle (drift angle), left positive
  state.wspin=lerp(state.wspin||0,spin,Math.min(1,dt*(spin?6:3)));
  state.odo=(state.odo||0)+Math.hypot(vx,vy)*dt/1000;   // odometer in km
  state.spin+=(vx+state.wspin*6)*dt/WR_M;
  // body attitude (springs)
  const BL=(MOD&&MOD.bodyLimits)?MOD.bodyLimits(cfg):null,RL0=BL?BL.roll:.1,RL=BL&&BL.rollLock!==undefined?lerp(RL0,BL.rollLock,Math.min(1,Math.abs(state.steer))):RL0,PL=BL?BL.pitch:.05;   // less roll travel toward full lock, where a car module says so   // a car module may limit roll and pitch to the travel its arches and tubs leave
  if(!isFinite(state.roll))state.roll=0;if(!isFinite(state.pitch))state.pitch=0;if(!isFinite(state.axF))state.axF=0;if(!isFinite(state.ayF))state.ayF=0;
  const rollT=clamp(state.ay/9.81*(phys.rollPerG||4.3)*D2R,-RL,RL),pitchT=clamp(state.ax*.006,-PL,PL);   // roll per g from the springs and bars
  state.roll+=(rollT-state.roll)*Math.min(1,dt*7);state.pitch+=(pitchT-state.pitch)*Math.min(1,dt*7);
  const bob=Math.sin(state.t*(.9+sp*.05))*.04*Math.min(1,sp/6)+(phys.EV?0:(state.rpm/6000)*Math.sin(state.t*70)*.035);
  state.bodyY=bob+state.bobExtra;
}

/* ---------- the loaded car ---------- */
let MOD=null,CARID=null,floorMesh=null;
// the car's contact shadow: a soft rounded patch (a hard-edged dark rectangle read as a mat under the car)
let shadowTex=null;function shadowMat(){if(!shadowTex){const S=128,cv=document.createElement('canvas');cv.width=S;cv.height=S/2;const g=cv.getContext('2d'),im=g.createImageData(S,S/2),d=im.data;
  for(let y=0;y<S/2;y++)for(let x=0;x<S;x++){const u=Math.abs((x+.5)/S*2-1),v=Math.abs((y+.5)/(S/2)*2-1),q=Math.pow(Math.pow(u,4)+Math.pow(v,4),.25),a=Math.max(0,Math.min(1,(1-q)/.38));const i=(y*S+x)*4;d[i]=d[i+1]=d[i+2]=0;d[i+3]=Math.round(255*a*a*(3-2*a));}
  g.putImageData(im,0,0);shadowTex=new THREE.CanvasTexture(cv);}
  return new THREE.MeshBasicMaterial({map:shadowTex,transparent:true,opacity:.62,depthWrite:false});}
const G={mkFrameSeals,shadowMat,THREE,scene,camera,carRoot,body,P,wheels,MIRRORS,state,anim,phys,keys,mk,paintable,mkGlass,mkPane,mkGlassSheet,SKIN,group,bufGeo,makeMirror,swapGeo,matPaint,matV,matGlass,matMirror,matMirrorPaint,matHead,matTailRed,matTailAmb,matTailWht,matFrontAmb,cfg,D2R,clamp,lerp,V3,Q,yAxis,zAxis,segTo,bodyM,bodyPt,build,$};
const MODS={};   // instantiated modules by id
function moduleFor(id){if(!MODS[id]){const f=CAR_MODULES[id];if(!f)throw new Error('no car module '+id);MODS[id]=f(G);}return MODS[id];}

/* ---------- animation / per-frame update ---------- */
function update(dt){
  state.t+=dt;
  stepCar(dt);
  worldStep(dt);   // the world (world.js): barriers and traffic
  MOD.pre(dt);
  updateHud();
  carRoot.position.set(state.x,0,state.z);carRoot.rotation.y=state.psi;
  body.position.y=-state.drop/20+state.bodyY;body.rotation.set(state.roll,0,state.pitch*1);body.updateMatrix();bodyM.copy(body.matrix);
  MOD.post(dt);
  if(typeof updateCabinMovers==='function')updateCabinMovers(dt,P,state);   // v20: the hydro handbrake lever and the mirror hanger
  floorMesh.position.set(Math.round(state.x/floorMesh.userData.tile)*floorMesh.userData.tile,0,Math.round(state.z/floorMesh.userData.tile)*floorMesh.userData.tile);   // floor follows the car (period = two checker cells)
}

/* ---------- camera ---------- */
const cam={az:-.65,el:.22,dist:300,tx:0,ty:26,tz:0,ox:0,oy:0,oz:0,goal:null,azOff:0};
const shortest=a=>{while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a;};
function updateCamera(dt){
  if(cam.goal){const g=cam.goal,k=.12;cam.az+=shortest(g.az-cam.az)*k;cam.el+=(g.el-cam.el)*k;cam.dist+=(g.dist-cam.dist)*k;cam.ty+=(g.ty-cam.ty)*k;cam.ox+=(g.ox-cam.ox)*k;cam.oy+=(g.oy-cam.oy)*k;cam.oz+=(g.oz-cam.oz)*k;
    if(Math.abs(shortest(g.az-cam.az))+Math.abs(g.el-cam.el)+Math.abs(g.dist-cam.dist)<.02)cam.goal=null;}
  const cp=carRoot.position;
  if(state.view==='cockpit'){
    const ck=MOD.cockpit(),E0=ck.eye,yw=state.lookYaw||0,pt=state.lookPitch||0;
    // the head turns about the neck: looking back it also leans 40 mm toward the car's centre and 30 mm forward, clear of the headrest
    const lean=1-Math.cos(yw),side=Math.sign(E0.z)||1,eyeB=new V3(E0.x+1.5*lean,E0.y,E0.z-side*2*lean);
    const e=eyeB.clone().applyMatrix4(bodyM).applyEuler(carRoot.rotation).add(cp);
    // straight ahead: toward the look point, turned with the steering; then the head's yaw (about the car's up axis) and pitch
    const fw=new V3(ck.look[0]-E0.x,ck.look[1]-E0.y,-state.steer*40*(1-Math.min(1,Math.abs(yw)*2))),L=fw.length();fw.normalize();
    const d=new V3(fw.x,0,fw.z).normalize(),cy=Math.cos(yw),sy=Math.sin(yw);const hx=d.x*cy+d.z*sy,hz=-d.x*sy+d.z*cy;
    const el=Math.atan2(fw.y,Math.hypot(fw.x,fw.z))+pt,ce=Math.cos(el);
    const f=new V3(eyeB.x+hx*ce*L,eyeB.y+Math.sin(el)*L,eyeB.z+hz*ce*L).applyMatrix4(bodyM).applyEuler(carRoot.rotation).add(cp);
    camera.position.copy(e);camera.lookAt(f);camera.near=.5;camera.fov=70;camera.updateProjectionMatrix();return;
  }
  if(camera.fov!==42||camera.near!==1){camera.fov=42;camera.near=1;camera.updateProjectionMatrix();}
  const baseAz=state.view==='chase'?(state.psi-Math.PI/2)+cam.azOff:cam.az;
  const ce=Math.cos(cam.el);
  const off=new V3(cam.ox,0,cam.oz).applyEuler(carRoot.rotation),tx=cp.x+off.x,tz=cp.z+off.z;   // look-at offset is in the car's own frame
  camera.position.set(tx+cam.dist*Math.sin(baseAz)*ce,cam.ty+cam.dist*Math.sin(cam.el),tz+cam.dist*Math.cos(baseAz)*ce);
  camera.lookAt(tx,cam.ty,tz);
}
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();if(w/h<1)cam.dist=Math.max(cam.dist,430);}
addEventListener('resize',resize);resize();
const ptrs={};let pinch=0;
canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);ptrs[e.pointerId]={x:e.clientX,y:e.clientY};const ids=Object.keys(ptrs);if(ids.length===2){const a=ptrs[ids[0]],b=ptrs[ids[1]];pinch=Math.hypot(a.x-b.x,a.y-b.y);}});
canvas.addEventListener('pointermove',e=>{const p=ptrs[e.pointerId];if(!p)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;const ids=Object.keys(ptrs);
  cam.goal=null;if(ids.length===1&&state.view==='cockpit'){state.lookYaw=clamp((state.lookYaw||0)+dx*.005,-2.6,2.6);state.lookPitch=clamp((state.lookPitch||0)+dy*.004,-1.0,.75);state.lookHold=true;}   // driver's view: drag to look round the cabin
  else if(ids.length===1){if(state.view==='chase')cam.azOff-=dx*.006;else cam.az-=dx*.006;cam.el=clamp(cam.el+dy*.005,.03,1.4);}
  else if(ids.length>=2){const a=ptrs[ids[0]],b=ptrs[ids[1]],d=Math.hypot(a.x-b.x,a.y-b.y);if(pinch>0)cam.dist=clamp(cam.dist*pinch/d,110,1200);pinch=d;}});
const endP=e=>{delete ptrs[e.pointerId];pinch=0;state.lookHold=false;};canvas.addEventListener('pointerup',endP);canvas.addEventListener('pointercancel',endP);
canvas.addEventListener('wheel',e=>{e.preventDefault();cam.goal=null;cam.dist=clamp(cam.dist*Math.exp(e.deltaY*.001),110,1200);},{passive:false});

/* ---------- sound: gar/sound.js (SOUND-01) ---------- */

/* ---------- the road (shared by every car) ---------- */
function layRoad(){
  const cv=document.createElement('canvas');cv.width=cv.height=128;const x=cv.getContext('2d');
  x.fillStyle='#7d838b';x.fillRect(0,0,128,128);x.fillStyle='#737982';x.fillRect(0,0,64,64);x.fillRect(64,64,64,64);
  x.fillStyle='rgba(255,255,255,.35)';x.fillRect(0,62,128,4);x.fillRect(62,0,4,128);
  const tx=new THREE.CanvasTexture(cv);tx.wrapS=tx.wrapT=THREE.RepeatWrapping;tx.repeat.set(60,60);tx.anisotropy=4;
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(9600,9600),new THREE.MeshLambertMaterial({map:tx}));fl.rotation.x=-Math.PI/2;fl.userData.tile=9600/60*2;scene.add(fl);floorMesh=fl;   // checker period (2 cells)
}

/* ---------- unloading the previous car (a phone has little memory: only the current car's geometry is kept) ---------- */
function unloadCar(){
  const kill=o=>{for(const c of o.children.slice()){kill(c);}if(o.geometry)o.geometry.dispose();};
  for(const c of carRoot.children.slice()){if(c===body)continue;kill(c);carRoot.remove(c);}
  for(const c of body.children.slice()){kill(c);body.remove(c);}
  for(const m of MIRRORS){if(m.rt)m.rt.dispose();}MIRRORS.length=0;
  for(const k of Object.keys(P))delete P[k];for(const k of Object.keys(wheels))delete wheels[k];for(const k of Object.keys(build))delete build[k];
  for(const k of ['doorL','doorR','rdoorL','rdoorR','hood','trunk','win','wip','cover','pop'])anim[k]=0;
  for(const k of ['doorL','doorR','rdoorL','rdoorR','hood','trunk','win','cover'])state[k]=0;
  state.x=state.z=state.psi=state.v=0;state.rpm=850;state.gear=1;state.spin=0;state.steer=0;state.sw=0;state.steerIn=0;state.roll=state.pitch=0;state.bodyY=0;state.drop=0;cam.azOff=0;state.vy=state.yawR=state.axF=state.wspin=0;
  delete state.batteryKWh;delete state.evPowerKW;
  body.position.set(0,0,0);body.rotation.set(0,0,0);carRoot.position.set(0,0,0);carRoot.rotation.set(0,0,0);
  worldSpawn();
}
