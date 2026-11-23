/* ===== GARAGE SHELL (part 2 of 2): car picker, part picker, shop, saves, modes, boot. ===== */
const CAR_LIST=[   // every car the garage will hold; ready = a module is built. The rest are queued, not hidden.
  {id:'e30',name:'BMW E30 325i coupe',sub:'1982-1994 · front engine, rear drive · inline-6'},
  {id:'e30t',name:'BMW E30 325i Touring',sub:'1988-1994 · front engine, rear drive · inline-6 · five doors'},
  {id:'ef',name:'Honda Civic EF hatchback',sub:'1988-1991 · front engine, front drive · transverse four'},
  {id:'z32',name:'Nissan Fairlady Z / 300ZX (Z32)',sub:'1989-2000 · front engine, rear drive · twin-turbo V6'},
  {id:'ae86',name:'Toyota Sprinter Trueno AE86',sub:'1983-1987 · front engine, rear drive · 4A-GE'},
  {id:'eclipse',name:'Mitsubishi Eclipse GSX',sub:'1997-1999 · front engine, four-wheel drive · turbo four'},
  {id:'gt2000',name:'Toyota 2000GT',sub:'1967-1968 · front engine, rear drive · inline-6'},
  {id:'modelx',name:'Tesla Model X Plaid',sub:'2022+ refresh · three motors, all-wheel drive · falcon-wing doors'},
  {id:'wk2',name:'Jeep Grand Cherokee Trackhawk',sub:'2018-2021 · front engine, four-wheel drive · supercharged V8'},
  {id:'jl',name:'Jeep Wrangler',sub:'front engine, four-wheel drive · solid axles'},
  {id:'lc',name:'Dodge Challenger Hellcat',sub:'2015-2023 · front engine, rear drive · supercharged V8'}
];
const SLOTS=[['engine','Engine'],['turbo','Turbocharger'],['swapkit','Swap kit'],['gearbox','Gearbox'],['diff','Differential'],['exhaust','Exhaust'],['seats','Seats'],['rearArea','Rear seat area'],['passArea','Passenger seat area'],['dashPlush','Dash plush set'],['shifter','Gear shifter'],['handbrake','Handbrake'],['mirrorHang','Mirror hanger'],['trunk','Trunk'],['steering','Steering wheel'],['suspension','Suspension'],['brakes','Brakes'],['wheel','Wheels and tires'],['tyre','Tire compound'],['aerokit','Aero kit'],['aeroF','Front lip'],['aeroR','Rear spoiler or wing'],['flares','Fenders'],['skirts','Side skirts'],['frame','Chassis']];
const PCDS=['4x100','4x114.3','5x100','5x108','5x112','5x114.3','5x120'];
function el(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e;}
let toastT=null;function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),4200);}
function setToggle(id,on){const b=$(id);if(b)b.classList.toggle('on',!!on);}

/* ---------- HUD, toggles, view ---------- */
const hud={spd:$('hSpd'),gear:$('hGear'),rpm:$('hRpm'),bar:$('hBar')};
// speed units: mph by default, km/h in the View tab; the choice is kept on this device
const UNITS={mph:true};try{UNITS.mph=localStorage.getItem('vg.units')!=='kmh';}catch(e){}
const spd=kmh=>UNITS.mph?(kmh/1.609344).toFixed(0)+' mph':kmh.toFixed(0)+' km/h';
function setUnits(mph){UNITS.mph=mph;try{localStorage.setItem('vg.units',mph?'mph':'kmh');}catch(e){}const u=$('hSpdU');if(u)u.textContent=mph?'mph':'km/h';for(const b of document.querySelectorAll('#units button'))b.classList.toggle('on',(b.dataset.u==='mph')===mph);if(typeof refresh==='function'&&MOD)refresh();}
for(const b of document.querySelectorAll('#units button'))b.onclick=()=>setUnits(b.dataset.u==='mph');
const ASSIST_NOTE={normal:'Normal: the car grips. Traction and stability control keep it straight; pull the handbrake (Shift, E) to throw it sideways.',drift:'Drift: no traction or stability control. Power or the handbrake breaks the rear loose; steering and throttle hold the angle.',off:'Off: the raw car, no help at all.'};
function setAssist(m){ASSIST.mode=m;try{localStorage.setItem('vg.assist',m);}catch(e){}for(const b of document.querySelectorAll('#assist button'))b.classList.toggle('on',b.dataset.a===m);const n=$('assistNote');if(n)n.textContent=ASSIST_NOTE[m];}
for(const b of document.querySelectorAll('#assist button'))b.onclick=()=>setAssist(b.dataset.a);
function updateHud(){
  {const d=Math.abs(state.slip||0)*57.3,on=d>9&&Math.hypot(state.v,state.vy||0)>5,fd=(state.fade||1)<.9;const esc=!!state.esc&&state.mode==='drive';const e=$('hDrift');if(e){e.hidden=!on&&!fd&&!esc;if(on)e.textContent='Drift '+Math.round(d)+'°';else if(esc)e.textContent='Stability control';else if(fd)e.textContent='Brakes fading';}}
  hud.spd.textContent=Math.round(Math.abs(state.v)*(UNITS.mph?2.23694:3.6));hud.gear.textContent=(state.mode==='garage'&&Math.abs(state.v)<.2)?'P':(state.gear===0?'R':state.gear);hud.rpm.textContent=Math.round(state.rpm/10)*10;hud.bar.style.width=(clamp(state.rpm/7000,0,1)*100)+'%';hud.bar.style.background=state.rpm>6200?'var(--accent)':'var(--text)';
  if(phys.EV){hud.gear.textContent=state.mode==='garage'?'P':state.gear===0?'R':'D';hud.bar.style.width=(clamp(state.rpm/phys.RED,0,1)*100)+'%';hud.bar.style.background='var(--text)';}
  // Stage C (SPEC-INTERIOR §5.8): the six frozen HUD fields, visible during a spray (and whenever a kit is fitted).
  {const e=$('hNos');if(e){const nz=state.nitrous;e.hidden=!nz;
    if(nz)e.textContent='N2O '+nz.shotHp+'hp · '+Math.round(nz.pressure)+' psi · '+nz.fill.toFixed(1)+' lb · '+(nz.armed?'ARMED':'disarmed')+(nz.spraying?' · SPRAYING':'')+(nz.lockout?' · LOCKOUT':'');}}
}
const swWrap=$('paints');
function buildPaints(){
  swWrap.textContent='';const PAINTS=MOD.paints;
  PAINTS.forEach(([n,h],i)=>{const b=el('button','sw'+(i===state.paint?' on':''));b.style.background='#'+h.toString(16).padStart(6,'0');b.title=n;b.setAttribute('aria-label',n);
    b.onclick=()=>setPaint(i);swWrap.appendChild(b);});
  // the custom colour: any colour from the system picker (the rainbow swatch), kept with the build
  const cu=el('input','sw swc');cu.type='color';cu.title='Custom colour';cu.setAttribute('aria-label','Custom colour');cu.value=hexStr(state.paintHex!=null?state.paintHex:PAINTS[0][1]);
  cu.oninput=()=>setCustomPaint(parseInt(cu.value.slice(1),16));swWrap.appendChild(cu);
  if(state.paint<0&&state.paintHex!=null)setCustomPaint(state.paintHex,true,state.finish);else setPaint(clamp(state.paint,0,PAINTS.length-1),true);
}
const hexStr=h=>'#'+(h>>>0).toString(16).padStart(6,'0');
// window tint (C-06; owner, Nov 13: "a slider-controlled tint. Not black windows, and not presets"): cfg.glassTint, 0-100, kept with the build. It is
// applied as paint is (setPaint above): material state, live, no rebuild. Every glass material on the car (flagged userData.glass: the shared matGlass,
// each car's clone of it, the Model X's glass and privacy glass) goes from its own stock look at 0 to about 5 % light through at 100: its opacity up
// toward .95 and its colour darkened toward 15 %. From the driver's seat the same film reads lighter (as a real film does against a bright outside):
// 60 % of the darkening there, so the view out never goes black.
const TINT={t:-1,inside:null,stock:new Map()};   // every material ever tinted, with its stock look (kept outside the material: a clone copies userData)
// before another car's module loads (the first time, it clones matGlass), every tinted material goes back to its stock look. From this record, not
// from the car: by then unloadCar has already taken the old car's meshes away
function tintReset(){for(const [m,st] of TINT.stock){m.opacity=st.op;m.color.setHex(st.col);}TINT.t=-1;}
function applyTint(force){const t=clamp((+cfg.glassTint||0)/100,0,1),inside=state.view==='cockpit';if(!force&&t===TINT.t&&inside===TINT.inside)return;TINT.t=t;TINT.inside=inside;
  const e=1-(1-t)*(1-t),k=inside?e*.6:e,seen=new Set();   // eased: half the slider is three quarters of the darkening, so the middle reads as a mid tint
  carRoot.traverse(o=>{if(!o.isMesh)return;for(const m of [].concat(o.material)){if(!m||!m.userData||!m.userData.glass||seen.has(m))continue;seen.add(m);let st=TINT.stock.get(m);
    if(!st){st={op:m.opacity,col:m.color.getHex()};TINT.stock.set(m,st);}m.opacity=st.op+(.95-st.op)*k;m.color.setHex(st.col).multiplyScalar(1-.85*k);}});
  const r=$('tint'),v=Math.round(t*100);if(r&&+r.value!==v)r.value=v;const o=$('tintO');if(o)o.textContent=v+'%';}
$('tint').oninput=()=>{cfg.glassTint=+$('tint').value;applyTint(true);scheduleAutosave();};
// finishes: the paint's highlight (gloss as before; metallic a brighter, tighter highlight; matte almost none)
const FINISH={gloss:{sh:70,sp:0x1c1c1c},metallic:{sh:96,sp:0x5c5c5c},matte:{sh:5,sp:0x050505}};
function applyFinish(f,quiet){state.finish=FINISH[f]?f:'gloss';const F=FINISH[state.finish];for(const m of [matPaint,matMirrorPaint]){m.shininess=F.sh;m.specular.setHex(F.sp);m.needsUpdate=true;}
  [...$('finish').children].forEach(b=>b.classList.toggle('on',b.dataset.f===state.finish));if(!quiet)scheduleAutosave();}
[...$('finish').children].forEach(b=>b.onclick=()=>applyFinish(b.dataset.f));
function setCustomPaint(h,quiet,fin){state.paint=-1;state.paintHex=h;matPaint.color.setHex(h);matMirrorPaint.color.setHex(h);
  const ch=[...swWrap.children];ch.forEach((c,j)=>c.classList.toggle('on',j===ch.length-1));const cu=ch[ch.length-1];if(cu){cu.style.setProperty('--cust',hexStr(h));if(cu.value!==hexStr(h))cu.value=hexStr(h);}
  $('paintName').textContent='Custom '+hexStr(h).toUpperCase();if(fin)applyFinish(fin,true);if(!quiet)scheduleAutosave();}
function setPaint(i,quiet,fin){state.paint=i;const [n,h,f0]=MOD.paints[i];matPaint.color.setHex(h);matMirrorPaint.color.setHex(h);applyFinish(fin||f0||'gloss',true);[...swWrap.children].forEach((c,j)=>c.classList.toggle('on',j===i));$('paintName').textContent=n;if(!quiet)scheduleAutosave();}
const tg=(id,key,fn)=>{$(id).onclick=()=>{state[key]=state[key]?0:1;setToggle(id,state[key]);if(fn)fn();};};
// badges: one switch hides every maker's emblem and model lettering on the car (for a version without the brands)
function applyBadges(){const on=!state.badgesOff;for(const m of [...(P.badges||[]),...(P.tailLetters||[])])if(m)m.visible=on;setToggle('tBadge',on);}
$('tBadge').onclick=()=>{state.badgesOff=!state.badgesOff;applyBadges();};
tg('tDoorL','doorL');tg('tDoorR','doorR');$('tRDoor').onclick=()=>{const v=(state.rdoorL||state.rdoorR)?0:1;state.rdoorL=state.rdoorR=v;setToggle('tRDoor',v);};tg('tHood','hood');tg('tTrunk','trunk');tg('tCover','cover');tg('tWin','win');tg('tLights','lights');tg('tHaz','hazard');tg('tWip','wipers');tg('tSW','swOff');
$('tSound').onclick=()=>{state.sound=!state.sound;setToggle('tSound',state.sound);if(state.sound){if(!audio)initAudio();if(audio&&audio.ctx.state==='suspended')audio.ctx.resume();}};
$('tView').onclick=()=>{const order=['orbit','chase','cockpit'];state.view=order[(order.indexOf(state.view)+1)%3];$('tView').textContent='View: '+state.view[0].toUpperCase()+state.view.slice(1);};
$('tReset').onclick=()=>{state.x=state.z=state.psi=state.v=0;state.vy=state.yawR=state.axF=0;state.rpm=850;state.gear=1;cam.azOff=0;worldSpawn();};
const hold=(id,key)=>{const b=$(id);const on=e=>{e.preventDefault();state[key]=true;b.classList.add('on');if(audio&&audio.ctx.state==='suspended')audio.ctx.resume();};const off=e=>{state[key]=false;b.classList.remove('on');};b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointerleave',off);b.addEventListener('pointercancel',off);};
hold('bGas','padGas');hold('bBrk','padBrake');hold('bHB','padHB');
const st=$('steer');st.oninput=e=>{state.steerIn=-(+e.target.value)/100;};['pointerup','touchend','pointercancel','mouseup'].forEach(ev=>st.addEventListener(ev,()=>{st.value=0;state.steerIn=0;st.blur();}));
// the on-screen pedals and steering slider are for touch screens: hidden where there is only a mouse and keyboard (they took keyboard focus and got in the way of W A S D),
// and shown again the moment the screen is touched
const touchScreen=()=>{try{return matchMedia('(any-pointer: coarse)').matches||navigator.maxTouchPoints>0;}catch(e){return true;}};
document.body.classList.toggle('notouch',!touchScreen());addEventListener('touchstart',()=>document.body.classList.remove('notouch'),{passive:true});
$('drive').querySelectorAll('button').forEach(b=>b.addEventListener('pointerup',()=>b.blur()));
addEventListener('keydown',e=>{if(e.target&&/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();keys[k]=true;if(k==='h')$('tLights').click();if(k==='z')$('tHaz').click();if(k==='c')$('tView').click();if(k==='g')setMode(state.mode==='garage'?'drive':'garage');if(k==='n')setNitrousArm(!(state.nitrous&&state.nitrous.armed));});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false;});
/* ---------- game controller (owner, Nov 13: "i just want to be able to plug in a controller") ----------
   Any controller the browser reports in the standard layout: a DualShock 4 or DualSense over USB or Bluetooth, an Xbox pad and most others, in Chrome,
   Edge or Firefox. A browser shows a controller to a page after its first button press. Left stick: the wheel (analog); R2: gas and L2: brake (analog,
   L2 reverses from a stop as S does); Cross/A: handbrake; Circle/B: camera; Triangle/Y: lights; Square/X: arm nitrous; L1/LB: hazards; Options/Start:
   garage or drive; right stick: the camera (orbit, or look round the cabin in the driver's view); R3: look ahead again. The pedals and the wheel go
   through the same filters as the keys (garage_core.js stepCar), so a car drives the same either way. */
const PAD={on:false,prev:[],dz:.12,blocked:false};
const padAxis=(v,dz)=>{const a=Math.abs(v);return a<dz?0:Math.sign(v)*Math.pow((a-dz)/(1-dz),1.5);};   // dead zone (stick drift), then finer near the centre
function pollPad(dt){
  // a page in a frame that disallows the gamepad feature (an embed, an app's HTML preview) throws SecurityError on getGamepads: then the game
  // stops asking, and plays on keys and touch (owner, Nov 14: the preview went black, the loop stopped on the throw)
  if(PAD.blocked)return;let list=[];
  try{list=navigator.getGamepads?navigator.getGamepads()||[]:[];}catch(e){PAD.blocked=true;state.gpThr=state.gpBrk=state.gpSteer=0;state.gpHB=false;return;}
  let gpd=null;
  for(const g of list)if(g&&g.connected&&(g.mapping==='standard'||g.buttons.length>=16)){gpd=g;break;}
  if(!gpd){if(PAD.on){PAD.on=false;PAD.prev=[];state.gpThr=state.gpBrk=state.gpSteer=0;state.gpHB=false;}return;}
  PAD.on=true;const B=i=>gpd.buttons[i]||{pressed:false,value:0},A=i=>gpd.axes[i]||0,down=i=>B(i).pressed&&!PAD.prev[i];
  const trig=i=>{const v=B(i).value||(B(i).pressed?1:0);return v<.05?0:Math.min(1,(v-.05)/.9);};
  state.gpThr=trig(7);state.gpBrk=trig(6);state.gpSteer=-padAxis(A(0),PAD.dz);state.gpHB=!!B(0).pressed;   // stick right = steer right (negative, as the touch slider)
  if(down(1))$('tView').click();if(down(3))$('tLights').click();if(down(4))$('tHaz').click();
  if(down(2))setNitrousArm(!(state.nitrous&&state.nitrous.armed));if(down(9))setMode(state.mode==='garage'?'drive':'garage');
  const rx=padAxis(A(2),PAD.dz),ry=padAxis(A(3),PAD.dz);
  if(state.view==='cockpit'){if(rx||ry){state.lookYaw=clamp(state.lookYaw-rx*dt*2.2,-2.6,2.6);state.lookPitch=clamp(state.lookPitch-ry*dt*1.6,-1.0,.75);state.lookHold=true;}
    if(down(11)){state.lookYaw=state.lookPitch=0;state.lookHold=false;}}
  else if(rx||ry){cam.goal=null;if(state.view==='chase')cam.azOff-=rx*dt*2.4;else cam.az-=rx*dt*2.4;cam.el=clamp(cam.el+ry*dt*1.2,.03,1.4);}
  PAD.prev=gpd.buttons.map(b=>b.pressed);
}
addEventListener('gamepadconnected',e=>toast('Controller connected: left stick steers, R2 gas, L2 brake, Cross handbrake, Options for garage or drive.'));
addEventListener('gamepaddisconnected',()=>toast('Controller disconnected.'));

/* ---------- one product: Drive and Garage in the same environment ---------- */
const menuEl=$('menu');let prevView='orbit';
function setTab(t){menuEl.dataset.tab=t;if(t==='saves'&&window.__bootDone)renderSaves();[...$('tabs').children].forEach(b=>b.classList.toggle('on',b.dataset.tab===t));}
function closePanels(){
  for(const k of ['hood','doorL','doorR','trunk','cover']){if(state[k]){state[k]=0;setToggle({hood:'tHood',doorL:'tDoorL',doorR:'tDoorR',trunk:'tTrunk',cover:'tCover'}[k],0);}}
  if(state.rdoorL||state.rdoorR){state.rdoorL=state.rdoorR=0;setToggle('tRDoor',0);}
  cam.goal=null;}
function setMode(m){
  if(m===state.mode){if(m==='drive')closePanels();return;}state.mode=m;if(m==='garage'&&window.__bootDone)scheduleAutosave();   // parking saves the odometer
  $('mDrive').classList.toggle('on',m==='drive');$('mGarage').classList.toggle('on',m==='garage');
  if(m==='garage'){prevView=state.view;state.view='orbit';$('tView').textContent='View: Orbit';menuEl.classList.add('open');setTab('parts');camPreset('showroom');}
  else{state.view=(prevView==='cockpit'?'cockpit':'chase');$('tView').textContent='View: '+state.view[0].toUpperCase()+state.view.slice(1);menuEl.classList.remove('open');closeSheets();
    closePanels();}
  $('hint').textContent=m==='garage'?'Garage: the car is parked. Edit parts, then press Drive to test them. Drag to orbit, scroll to zoom.':'Drive: W/S throttle and brake, A/D steer, Space brake, Shift or E handbrake, H lights, C view, N nitrous arm, G garage. Driver\'s view: hold Space and use W A S D, or drag, to look around.';
}
function camPreset(n){
  const psi=state.psi,P2=Math.PI/2,T=MOD.camPresets(psi,P2)[n];
  if(!T)return;state.view='orbit';cam.goal=T;
  const want=MOD.camOpens[n]||{};
  for(const k of ['hood','doorL','doorR']){const v=(want[k]||0);if(state.mode==='drive'&&v)continue;if(n==='engine'||n==='interior'||state[k]){state[k]=v;const tid={hood:'tHood',doorL:'tDoorL',doorR:'tDoorR'}[k];if($(tid))setToggle(tid,v);}}   // the driver's door may be either side; REDO L-3: presets never OPEN panels in drive mode (closing still applies) — the interior/engine preset opened the door at speed
}
$('mDrive').onclick=()=>setMode('drive');$('mGarage').onclick=()=>setMode('garage');
$('mMenu').onclick=()=>{menuEl.classList.toggle('open');};
[...$('tabs').children].forEach(b=>b.onclick=()=>{if(b.dataset.tab==='parts'&&state.mode!=='garage'){setMode('garage');}setTab(b.dataset.tab);menuEl.classList.add('open');});
for(const b of document.querySelectorAll('#camtab [data-cam]'))b.onclick=()=>camPreset(b.dataset.cam);
$('bTest').onclick=()=>setMode('drive');
setTab('body');

/* ---------- applying a build to the car ---------- */
let applied={};
function applyDrive(res){
  if(CAR.powertrain==='electric'){MODELX_EV.driveSetup(phys,state,cfg,res);return;}
  phys.EV=false;
  const eng=byId('engine',cfg.engine),gb=byId('gearbox',cfg.gearbox),df=byId('diff',cfg.diff),ex=byId('exhaust',cfg.exhaust),eff=effEngine(cfg),ro=readout(cfg);
  phys.GEAR=[0].concat(gb.ratios);phys.FINAL=gb.final||df.ratio;phys.MASS=ro.mass;phys.curve=torqueCurve(eff);phys.TQ=(eff.hp+ex.hp)/eff.hp;phys.NQ=(function(){const k=byId('rearArea',cfg.rearArea);return k&&k.kind==='nitrous'?k.shotHp/eng.hp:0;})();/* Stage C: NQ = kit.shotHp / record eng.hp, set together with state.nitrous.shotHp at refresh — if the turbo effEngine lands later, turbo+nitrous needs a revisit */phys.RED=eng.red;phys.CYL=eng.cyl;phys.EXH=ex.sound;phys.BUILD_OK=res.runs!==false;phys.MU=res.muLat||.9;phys.MU_LONG=res.muLong||1;
  Object.assign(phys,vehiclePhysics(cfg,res,ro));phys.MU*=phys.muMul;phys.MU_LONG*=phys.muMul;phys.WHEELBASE=CAR.wheelbase/1000;phys.LAYOUT=CAR.layout||'FR';phys.WF=ro.frontPct?ro.frontPct/100:(CAR.wf||({FF:.61,FR:.53,MR:.43,RR:.4,AWD:.56}[phys.LAYOUT]||.53));phys.HCG=CAR.hcg||.5;   // weight on the front axle, CG height (m): typical of each layout unless the car says (DESIGN)
  phys.CdA=CAR.stockDragCdA*aeroDrag(cfg);phys.BRAKE=1.15*9.81*ro.mass;   // the brakes can out-pull the tyres (E): stopping is grip-limited, and limited by fade as they heat
  if(state.gear>phys.GEAR.length-1)state.gear=phys.GEAR.length-1;state.drop=cfg.drop;
}
// Stage C (SPEC-INTERIOR §5.5/§5.8): the nitrous kit state — ONE state, owned here.
// syncNitrous() runs at the top of refresh(): no kit ⇒ null; a new or changed kit ⇒ a
// fresh full bottle; the SAME kit ⇒ fill/armed/sprayT/lockout survive every other refresh.
// wet is a kit-identity key only (the spec's state is fill/armed/spraying/pressure/
// shotHp/sprayT/lockout); it is never read as a state value.
function syncNitrous(){const k=byId('rearArea',cfg.rearArea),kit=k&&k.kind==='nitrous'?k:null;
  if(!kit){state.nitrous=null;return;}
  if(!state.nitrous||state.nitrous.shotHp!==kit.shotHp||state.nitrous.wet!==!!kit.wet)
    state.nitrous={fill:10,armed:false,spraying:false,pressure:925,shotHp:kit.shotHp,wet:!!kit.wet,sprayT:0,lockout:false};}
function setNitrousArm(on){const nz=state.nitrous;if(!nz)return;
  if(on&&!nz.armed){nz.lockout=false;}   // RE-ARM (OFF→ON): the lockout clears, sprayT stays 0
  if(!on&&nz.armed){nz.spraying=false;nz.sprayT=0;}   // DISARM (ON→OFF): spraying stops, sprayT resets, lockout UNCHANGED
  nz.armed=!!on;
  if(typeof refresh==='function')refresh(false);}   // keep the shop panel + button label in step (the HUD updates every frame; the shop only re-renders on refresh)
function refillNitrous(){const nz=state.nitrous;if(!nz)return;nz.fill=10;nz.pressure=925;}   // refill: sprayT and lockout UNCHANGED
function refresh(full){
  syncNitrous();
  const res=checkFit(cfg),ro=readout(cfg);
  for(const k in MOD.apply){const s=JSON.stringify(MOD.sigs[k](cfg));if(full||applied[k]!==s){applied[k]=s;MOD.apply[k]();}}
  applyDrive(res);applyTint(true);   // a rebuilt part may bring new glass at its stock look
  renderShop(res,ro);
  if(window.__bootDone)scheduleAutosave();
}

/* ---------- mod shop: slot rows, readouts, wheels, weight ---------- */
const shopEl=$('shop');let ppSlot=null,ppFilter='can',ppQuery='';
const SLOTLABEL=Object.fromEntries(SLOTS.concat([['motor','Motors'],['reduction','Reduction'],['battery','Battery']]));
function nameOf(slot,id){if(slot==='wheel')return wheelName(cfg.wheel);if(slot==='aerokit'){const k=kitMatch(cfg);return k?(k.id==='none'?'No aero':k.name):'Your own mix (parts below)';}
  // Stage B (SPEC-INTERIOR §1.8): 'stock'/'removed'/'none' are literal states, not LIB records — nameOf reads them directly
  if((slot==='rearArea'||slot==='passArea')&&id==='stock')return 'Stock';if((slot==='rearArea'||slot==='passArea')&&id==='removed')return 'Removed';if(slot==='dashPlush'&&id==='none')return 'None';
  // SPEC-TURBO §4 item 6: [O]-SAFE display — a field is shown ONLY when frozen; [O] fields are omitted, never printed as 'undefined'
  if(slot==='turbo'){const t=byId('turbo',id);if(!t)return id;if(t.id==='none')return 'No turbo';const bits=[t.name];if(t.boostPsi!=null)bits.push(t.boostPsi+' psi');if(t.fullBoost!=null)bits.push('full boost '+t.fullBoost+' rpm');if(t.hpClass)bits.push(t.hpClass[0]+'–'+t.hpClass[1]+' hp');return bits.join(' · ');}
  const p=byId(slot,id);return p?p.name:id;}
// the offset a wheel of this width can be made with: its mounting face stays inside the rim (half the width plus the 13 mm flange, less a 20 mm centre)
const etLim=wid=>Math.floor(wid*12.7-7);
function wheelName(w){const p=LIB.wheel.find(x=>x.id===w.style);return (p?p.name:w.style)+' · '+w.dia+'x'+w.width+' ET'+w.et+' '+w.pcd;}
function slotState(slot){   // the colour dot of a slot row: what the current fit check says about the part now fitted
  if(!CAR)return '';const r=checkFit(cfg);const sl=REL[slot]||[slot];
  if(r.issues.some(i=>i.sev==='BLOCK'&&sl.includes(i.slot)))return 'blocked';
  if(r.issues.some(i=>i.sev==='WARN'&&sl.includes(i.slot)))return 'warn';return '';
}
function buildShop(){
  shopEl.textContent='';
  const head=el('div','shead');head.appendChild(el('b',null,'Mod shop'));head.appendChild(el('span','sub','Pick any part. The shop checks fitment against this car and says why.'));shopEl.appendChild(head);
  const pre=el('div','row');pre.appendChild(el('span','lbl','Presets'));
  for(const [n,f] of MOD.presets){const b=el('button',null,n);b.onclick=()=>{const d=clone(defaultCfg());for(const k of Object.keys(cfg))delete cfg[k];Object.assign(cfg,d);f(cfg);refresh(true);};pre.appendChild(b);}
  shopEl.appendChild(pre);
  for(const [id,cls] of [['shopStatus','status'],['shopIssues','issues'],['shopHand','readout hand'],['shopRead','readout']]){const d=el('div',cls);d.id=id;shopEl.appendChild(d);}
  const rows=el('div','rows');rows.id='shopRows';shopEl.appendChild(rows);
  for(const [slot,label] of (CAR.powertrain==='electric'?MODELX_EV.slots:SLOTS)){
    if(slot==='diff'&&CAR.layout==='FF')continue;   // the final drive is inside the transaxle
    if(slot==='rearArea'&&!(CAR.removables&&CAR.removables.rearSeat))continue;   // Stage B (SPEC-INTERIOR §1.2): 2-seaters have no rear area — no state, no picker section
    const r=el('div','srow');r.dataset.slot=slot;r.appendChild(el('span','sl',label));const v=el('span','sv');r.appendChild(v);r.appendChild(el('span','dot'));
    const b=el('button',null,'Change');b.onclick=()=>openPicker(slot);r.appendChild(b);rows.appendChild(r);
    if(slot==='suspension'){const d=el('div','slider');d.appendChild(el('span',null,'Drop'));const g=document.createElement('input');g.type='range';g.min=0;g.max=80;g.step=5;g.id='dropR';g.oninput=()=>{const su=byId('suspension',cfg.suspension);cfg.drop=Math.max(su.minDrop,Math.min(su.maxDrop,+g.value));refresh(false);};d.appendChild(g);const o=el('b',null,'0 mm');o.id='dropO';d.appendChild(o);rows.appendChild(d);
      // camber (camber plates / adjustable arms): 0 to -10 degrees per axle, the top of the wheel leaning in
      for(const [k,lab] of [['camberF','Camber front'],['camberR','Camber rear']]){const c=el('div','slider');c.appendChild(el('span',null,lab));const r=document.createElement('input');r.type='range';r.min=-10;r.max=0;r.step=.5;r.id=k+'R';r.oninput=()=>{cfg[k]=+r.value;refresh(false);};c.appendChild(r);const b=el('b',null,'0.0°');b.id=k+'O';c.appendChild(b);rows.appendChild(c);}}
    if(slot==='wheel'){
      const mkSel=(lab,id,opts,set)=>{const d=el('div','slider');d.appendChild(el('span',null,lab));const s=document.createElement('select');s.id=id;for(const o of opts){const op=document.createElement('option');op.value=o;op.textContent=o;s.appendChild(op);}s.onchange=()=>{set(s.value);refresh(false);};d.appendChild(s);return d;};
      const own=()=>{delete cfg.wheel.bore;delete cfg.wheel.tw;delete cfg.wheel.ar;};
      rows.appendChild(mkSel('Diameter (in)','wDia',CAR.wheelDia,v=>{own();cfg.wheel.dia=+v;}));
      rows.appendChild(mkSel('Width (in)','wWid',CAR.wheelWid,v=>{own();cfg.wheel.width=+v;const L=etLim(+v);cfg.wheel.et=Math.max(-L,Math.min(L,cfg.wheel.et));}));
      rows.appendChild(mkSel('Bolt pattern','wPcd',PCDS,v=>{own();cfg.wheel.pcd=v;}));
      // tyre: width and sidewall chosen freely ('auto' keeps the rolling diameter near stock); any size fits the build, what rubs is shown as a warning
      rows.appendChild(mkSel('Tire width (mm)','wTw',['auto',...Array.from({length:17},(_,i)=>155+i*10)],v=>{delete cfg.wheel.bore;if(v==='auto')delete cfg.wheel.tw;else cfg.wheel.tw=+v;}));
      rows.appendChild(mkSel('Sidewall (%)','wAr',['auto',25,30,35,40,45,50,55,60,65,70],v=>{if(v==='auto')delete cfg.wheel.ar;else cfg.wheel.ar=+v;}));
      const e=el('div','slider');e.appendChild(el('span',null,'Offset ET'));const er=document.createElement('input');er.type='range';er.min=-40;er.max=60;er.step=1;er.id='wEt';er.oninput=()=>{const L=etLim(cfg.wheel.width);cfg.wheel.et=Math.max(-L,Math.min(L,+er.value));refresh(false);};e.appendChild(er);const eo=el('b',null,'25');eo.id='wEtO';e.appendChild(eo);rows.appendChild(e);const sF=el('div','slider');sF.appendChild(el('span',null,'Spacer front (mm)'));const sr=document.createElement('input');sr.type='range';sr.min=0;sr.max=80;sr.step=5;sr.id='wSpF';sr.oninput=()=>{cfg.spacerF=+sr.value;refresh(false);};sF.appendChild(sr);const soF=el('b',null,'0 mm');soF.id='wSpFO';sF.appendChild(soF);rows.appendChild(sF);const sR=el('div','slider');sR.appendChild(el('span',null,'Spacer rear (mm)'));const rr=document.createElement('input');rr.type='range';rr.min=0;rr.max=80;rr.step=5;rr.id='wSpR';rr.oninput=()=>{cfg.spacerR=+rr.value;refresh(false);};sR.appendChild(rr);const soR=el('b',null,'0 mm');soR.id='wSpRO';sR.appendChild(soR);rows.appendChild(sR);
    }
  }
  const rm=el('details','sec');rm.open=true;rm.appendChild(el('summary',null,'Take weight off'));rm.id='rmSec';
  rm.appendChild(el('div','sub','Each item changes mass and weight balance. Masses are estimates (E) until weighed.'));
  for(const k in CAR.removables){const R=CAR.removables[k];const row=el('label','rm');const cb=document.createElement('input');cb.type='checkbox';cb.dataset.rm=k;
    cb.onchange=()=>{cfg.removed=cfg.removed||{};cfg.removed[k]=cb.checked;if(!cb.checked)delete cfg.removed[k];
      // Stage B (SPEC-INTERIOR §1.3): the checkboxes stay the removal UI — checking sets the area state to 'removed', unchecking sets it to 'stock'
      if(k==='rearSeat'){if(cb.checked){if(cfg.rearArea==='stock')cfg.rearArea='removed';}else cfg.rearArea='stock';}
      if(k==='passengerSeat'){if(cb.checked){if(cfg.passArea==='stock')cfg.passArea='removed';}else cfg.passArea='stock';}
      refresh(false);};
    const t=el('div');t.appendChild(el('div',null,(R.swap?'Swap: ':'Remove: ')+R.name));t.appendChild(el('div','rs','saves '+R.mass.toFixed(1)+' kg ['+R.label+']'));row.appendChild(cb);row.appendChild(t);rm.appendChild(row);}
  shopEl.appendChild(rm);
  if(CAR.powertrain==='electric'){rm.hidden=true;for(const e of rows.querySelectorAll('.slider'))e.hidden=true;}
  // Stage C (SPEC-INTERIOR §5.8): the nitrous panel — status + arm/disarm + refill (free).
  // Hidden when no kit is fitted; renderShop() keeps it current.
  const nos=el('details');nos.id='nosSec';nos.open=true;
  nos.appendChild(el('summary',null,'Nitrous'));
  const nstat=el('div');nstat.id='nosStat';nos.appendChild(nstat);
  const narm=el('button');narm.id='nosArm';narm.textContent='Arm nitrous';narm.onclick=()=>{setNitrousArm(!(state.nitrous&&state.nitrous.armed));refresh(false);};nos.appendChild(narm);
  const nref=el('button');nref.id='nosRefill';nref.textContent='Refill bottle (free)';nref.onclick=()=>{refillNitrous();refresh(false);};nos.appendChild(nref);
  shopEl.appendChild(nos);
}
function renderShop(res,ro){
  for(const r of shopEl.querySelectorAll('.srow')){const slot=r.dataset.slot;r.querySelector('.sv').textContent=nameOf(slot,cfg[slot]);const d=r.querySelector('.dot');d.className='dot '+slotState(slot);}
  $('wDia').value=cfg.wheel.dia;$('wWid').value=cfg.wheel.width;$('wPcd').value=cfg.wheel.pcd;$('wEt').value=cfg.wheel.et;$('wEtO').textContent='ET'+cfg.wheel.et;$('wTw').value=cfg.wheel.tw||'auto';$('wAr').value=cfg.wheel.ar||'auto';for(const id of ['wSpF','wSpR'])$(id).parentNode.style.display=CARID==='modelx'?'none':'';   // spacers: every voxel car (C-08); the Model X has its own wheel work
  $('wSpF').value=cfg.spacerF||0;$('wSpFO').textContent=(cfg.spacerF||0)+' mm';$('wSpR').value=cfg.spacerR||0;$('wSpRO').textContent=(cfg.spacerR||0)+' mm';
  for(const k of ['camberF','camberR']){$(k+'R').value=cfg[k]||0;$(k+'O').textContent=(+(cfg[k]||0)).toFixed(1)+'°';}
  const su=byId('suspension',cfg.suspension),dr=$('dropR');dr.min=su.minDrop;dr.max=Math.max(su.maxDrop,su.minDrop+1);dr.disabled=su.minDrop===su.maxDrop;dr.value=cfg.drop;$('dropO').textContent=cfg.drop+' mm';
  for(const cb of shopEl.querySelectorAll('input[data-rm]'))cb.checked=!!(cfg.removed&&cfg.removed[cb.dataset.rm]);
  const stEl=$('shopStatus'),nb=res.issues.filter(i=>i.sev==='BLOCK').length;const nw=res.issues.filter(i=>i.sev==='WARN').length;stEl.textContent=res.ok?(nw?'Fits with '+nw+' warning'+(nw>1?'s':'')+'. The car will start.':'Fits. The car will start.'):(res.runs?'Parts need attention ('+nb+'), but the car will start.':'Does not fit ('+nb+' problem'+(nb>1?'s':'')+'). The car will not start.');stEl.className='status '+(res.ok?'ok':(res.runs?'warn':'bad'));
  const is=$('shopIssues');is.textContent='';for(const i of res.issues)is.appendChild(el('div','issue '+i.sev.toLowerCase(),(i.sev==='BLOCK'?'Blocked: ':'Warning: ')+i.text));
  const r=$('shopRead');r.textContent='';const kv=(a,b)=>{const d=el('div','kv');d.appendChild(el('span',null,a));d.appendChild(el('b',null,b));r.appendChild(d);};
  kv('Mass',ro.mass+' kg [C]');kv('Power',ro.hp+' hp ['+(ro.powerLabel||'E')+']');kv('Power to weight',ro.pw.toFixed(0)+' hp/t [C]');kv(phys.EV?'Speed limiter':'Top speed',spd(ro.top)+(phys.EV?' [VERIFIED]':' [C]'));
  if(phys.EV){kv('System torque',ro.tq+' Nm [ESTIMATED: sources 1020–1424]');kv('Regeneration cap','80 kW [DESIGN]');}else kv('Rev limit in top gear',spd(ro.vmaxGear[ro.vmaxGear.length-1])+' [C]');
  kv('Tire',res.tyre.sizeStr+' ('+res.tyre.OD.toFixed(0)+' mm) [C]');kv('Speedometer error',(ro.speedoErr>=0?'+':'')+ro.speedoErr.toFixed(1)+'% [C]');kv('Tire to arch gap',Math.round(res.archGap)+' mm [C]');kv('Front weight',ro.frontPct.toFixed(1)+'% [E]');
  {const nos=$('nosSec');if(nos){const nz=state.nitrous,kit=byId('rearArea',cfg.rearArea);
    nos.hidden=!(kit&&kit.kind==='nitrous');
    if(nz){$('nosStat').textContent=nz.shotHp+' hp '+(nz.wet?'wet':'dry')+' shot · bottle '+Math.round(nz.pressure)+' psi · '+nz.fill.toFixed(1)+' lb · '+(nz.armed?'ARMED':'disarmed')+(nz.spraying?' · SPRAYING':'')+(nz.lockout?' · LOCKOUT — disarm + re-arm to clear':'');
      $('nosArm').textContent=nz.armed?'Disarm nitrous':'Arm nitrous';}}}
  renderHandling(res,ro);
  if(ppSlot&&$('partPick').classList.contains('open'))renderPicker();
}
// handling vs stock: what the build does to the way the car drives, before you drive it (estimates from the driving model's own numbers)
function renderHandling(res,ro){const h=$('shopHand');if(!h)return;h.textContent='';const H=handling(cfg,res,ro),S0=handlingStock();
  h.appendChild(el('div','hh','Handling vs stock'));
  const row=(label,val,pct,better,tip)=>{const d=el('div','kv');d.title=tip;d.appendChild(el('span',null,label));const b=el('b',null,val);
    if(Math.abs(pct)>=.5){const c=el('i','dlt '+(better?'up':'dn'),(pct>0?'+':'')+Math.round(pct)+'%');b.appendChild(c);}d.appendChild(b);h.appendChild(d);};
  const pc=(a,b)=>(a/b-1)*100;
  row('Cornering grip',H.lat.toFixed(2)+' g',pc(H.lat,S0.lat),H.lat>=S0.lat,'The most sideways acceleration the tires hold in a steady corner: grip, width, camber, compound, weight on each end, CG height and track.');
  const bd=UNITS.mph?Math.round(H.brake*3.281)+' ft from 62 mph':Math.round(H.brake)+' m from 100 km/h';
  row('Braking',bd,pc(H.brake,S0.brake),H.brake<=S0.brake,'Stopping distance with the tires at their braking limit (ABS): grip, width, camber and compound. Shorter is better.');
  row('Body lean',H.roll.toFixed(1)+'° per g',pc(H.roll,S0.roll),H.roll<=S0.roll,'How far the body rolls in a corner: springs, dampers and bars. Less lean, quicker response; more lean, softer ride.');
  row('Steering response',(H.resp/S0.resp>=1.03?'sharper':H.resp/S0.resp<=.97?'softer':'as stock'),pc(H.resp,S0.resp),H.resp>=S0.resp,'How quickly the tires build grip when you turn: lower-profile sidewalls and stickier compounds are sharper.');
  row('Brake fade',(H.fade/S0.fade>=1.05?'holds longer':H.fade/S0.fade<=.95?'fades sooner':'as stock'),pc(H.fade,S0.fade),H.fade>=S0.fade,'How many hard stops before the brakes overheat: bigger rotors hold out longer.');
  h.appendChild(el('div','hn','[E] estimates from the driving model: drive it to feel the rest.'));}

/* ---------- part picker: every part in the library for a slot, with what happens if you fit it ---------- */
function specLine(slot,p){
  if(['motor','battery','reduction'].includes(slot))return p.name+' · '+p.label;
  switch(slot){
    case 'engine':return p.hp+' hp @ '+p.hpRpm+' · '+p.tq+' Nm · '+p.mass+' kg · '+(p.layout==='V'?'V':p.layout==='F'?'flat-':'inline-')+p.cyl+(p.turbo?' turbo':'')+' · '+(p.orient==='trans'?'transverse':'longitudinal');
    case 'gearbox':return p.ratios.length+'-speed · '+(p.kind==='transaxle'?'transaxle':'rear-drive')+' · '+p.mass+' kg · rated '+p.tq+' Nm';
    case 'diff':return p.ratio+':1 · '+(p.lsd?'limited-slip':'open')+(p.mass?' · +'+p.mass+' kg':'');
    case 'exhaust':return (p.mass?(p.mass>0?'+':'')+p.mass+' kg':'stock weight')+(p.hp?' · +'+p.hp+' hp':'')+' · tip '+p.tipW+' mm';
    case 'seats':return p.mass+' kg each';
    case 'shifter':return (p.throwReduction?Math.round(p.throwReduction*100)+'% shorter throw · ':'stock throw · ')+shiftTimeFor(p).toFixed(2)+' s per shift · '+(p.leverExtMm?'+'+p.leverExtMm+' mm taller · ':'')+({ball:'weighted steel ball knob',pistol:'pistol-grip knob',wood:'wood / leather knob',puck:'aluminium puck knob',teardrop:'weighted steel teardrop knob',tiball:'burnt-titanium ball knob',alucyl:'billet aluminium knob'}[p.knob.style]||'knob');
    case 'handbrake':return p.id==='stock'?'the stock lever between the seats':(p.mass+' kg · '+p.leverMm+' mm lever on the tunnel · locks the rear wheels');
    case 'mirrorHang':return p.id==='none'?'':'hangs from the rear-view mirror and swings with the car';
    case 'trunk':return p.id==='none'?'':(p.mass+' kg · in the hatch area'+(p.kind==='plush'?'':' · visual + mass — no audio system in this garage (yet)'));
    case 'steering':return p.dia+' mm · '+p.mass+' kg';
    case 'suspension':return p.minDrop===p.maxDrop?(p.minDrop?'-'+p.minDrop+' mm':'stock height'):'-'+p.minDrop+' to -'+p.maxDrop+' mm';
    case 'brakes':return p.rotor+' mm rotor · '+p.mass+' kg per axle side';
    case 'tyre':return 'grip '+(p.mu>=1?'+':'')+Math.round((p.mu-1)*100)+'% over touring tires'+(p.B>0?' · sharper turn-in':p.B<0?' · softer turn-in':'');
    case 'swapkit':return p.id==='none'?'':('+'+p.mass+' kg · takes '+(p.accepts==='*'?'any engine':(p.accepts.length?p.accepts.join(', '):'-')));
    case 'wheel':return p.dia?(p.dia+'x'+p.width+' ET'+p.et+' · '+p.pcd+(p.donor?' · '+p.donor:'')):'style, size set below';
    case 'aeroF':case 'aeroR':case 'flares':case 'skirts':return [p.mass?p.mass+' kg':'',p.lip?'lip '+p.lip+' mm':'',p.skirt?(p.skirt+' mm below the sill'):'',p.flare?'+'+p.flare+' mm per side':'',p.drag?'+'+Math.round(p.drag*100)+'% drag':''].filter(Boolean).join(' · ');
    case 'aerokit':return AERO_SLOTS.filter(s=>p.set[s]&&p.set[s]!=='none').map(s=>byId(s,p.set[s]).name).join(' + ')||'every aero part back to stock';
    case 'rearArea':if(p.id==='stock')return 'Rear bench fitted as stock';if(p.id==='removed')return 'Bench out · saves '+(CAR.removables.rearSeat?CAR.removables.rearSeat.mass.toFixed(1):'?')+' kg';if(p.kind==='wall')return p.mass+' kg · '+p.contents+' · visual + mass — no audio system in this garage (yet)';if(p.kind==='plushwall')return p.mass+' kg · '+p.contents;if(p.kind==='nitrous')return p.shotHp+' hp '+(p.wet?'wet':'dry')+' shot · 10 lb bottle · '+nitrousKitMass(p).toFixed(1)+' kg now (12.9 full, 8.35 empty)';return p.contents+' · '+p.mass+' kg';
    case 'passArea':if(p.id==='stock')return 'Passenger seat fitted as stock';if(p.id==='removed')return 'Seat out · saves '+(CAR.removables.passengerSeat?CAR.removables.passengerSeat.mass.toFixed(1):'?')+' kg';return p.contents+' · '+p.mass+' kg';
    case 'dashPlush':if(p.id==='none')return 'No plushies on the dash';return p.contents+' · '+p.mass+' kg';
    case 'frame':return p.mass+' kg'+(p.deletesRearSeat?' · removes the rear seat':'')+(p.needsSeats?' · needs bucket seats':'');
  }return '';
}
function partList(slot){if(slot==='aerokit')return aeroKits();
  if(CAR.powertrain==='electric')return (LIB[slot]||[]).filter(p=>(MODELX_EV.allowed[slot]||[]).includes(p.id));
  if(slot==='rearArea'){if(!(CAR.removables&&CAR.removables.rearSeat))return [];return [{id:'stock',name:'Stock — rear bench fitted'},{id:'removed',name:'Rear bench removed'},...LIB.rearArea.filter(p=>shellOK(p))];}   // Stage B: no rear area on a 2-seater — an empty list, never a guess
  if(slot==='passArea')return [{id:'stock',name:'Stock — passenger seat fitted'},{id:'removed',name:'Passenger seat removed'},...LIB.passArea.filter(p=>shellOK(p))];
  if(slot==='dashPlush')return [{id:'none',name:'No plushies on the dash'},...LIB.dashPlush.filter(p=>shellOK(p))];
  // the turbo list (owner, Nov 14: "we have 0 turbos"): only what this car can take. Another engine's factory turbo is not a part to buy, and a kit
  // with no model for this car yet ('later') is left off rather than listed greyed out; the fitted record always shows
  if(slot==='turbo')return LIB.turbo.filter(p=>shellOK(p)&&(p.id===cfg.turbo||(!(p.stock&&p.stockFor!==cfg.engine)&&!notBuilt('turbo',p.id))));
  return slot==='swapkit'?kitsFor():LIB[slot].filter(p=>shellOK(p));}
function partIsOn(slot,p){
  if(slot==='wheel'){const w=cfg.wheel;return p.dia?(w.style===p.style&&w.dia===p.dia&&w.width===p.width&&w.et===p.et&&w.pcd===p.pcd&&(w.bore||0)===(p.bore||0)):w.style===p.id;}
  if(slot==='aerokit'){const k=kitMatch(cfg);return !!k&&k.id===p.id;}
  return cfg[slot]===p.id;
}
function pickStatus(slot,p){
  if(slot==='wheel'){const ex=p.dia?{style:p.style,dia:p.dia,width:p.width,et:p.et,pcd:p.pcd,bore:p.bore,tw:p.tw,ar:p.ar}:{style:p.id};return applyPart(cfg,'wheel',p.id,ex);}
  if(slot==='swapkit'){const c=clone(cfg);c.swapkit=p.id;const bl=blocksOf(c,['engine','gearbox']);return {cfg:c,notes:[],state:bl.length?'blocked':'fits',reason:bl.length?bl[0].text:'',warns:[]};}
  return applyPart(cfg,slot,p.id);
}
const BADGE={fits:'Fits',swap:'Fits',kit:'Fits',blocked:'Does not fit',later:'Not built yet'};
function openPicker(slot){ppSlot=slot;ppQuery='';$('ppSearch').value='';ppFilter='can';$('ppTitle').textContent=SLOTLABEL[slot];$('partPick').classList.add('open');renderPicker();$('ppList').scrollTop=0;}
function closeSheets(){$('partPick').classList.remove('open');$('carPick').classList.remove('open');if($('kitPick'))$('kitPick').classList.remove('open');ppSlot=null;}
function renderPicker(){
  const slot=ppSlot,list=partList(slot),q=ppQuery.trim().toLowerCase();
  const items=list.map(p=>({p,r:pickStatus(slot,p)}));
  const can=it=>it.r.state!=='blocked'&&it.r.state!=='later';
  const later=it=>it.r.state==='later',blk=it=>it.r.state==='blocked';
  const counts={can:items.filter(can).length,blocked:items.filter(blk).length,later:items.filter(later).length,all:items.length};
  const chips=$('ppChips');chips.textContent='';
  for(const [k,l] of [['can','Fits ('+counts.can+')'],['blocked','Does not fit ('+counts.blocked+')']].concat(counts.later?[['later','Not built yet ('+counts.later+')']]:[],[['all','All ('+counts.all+')']])){const b=el('button','chip'+(ppFilter===k?' on':''),l);b.onclick=()=>{ppFilter=k;renderPicker();};chips.appendChild(b);}
  const box=$('ppList');const keep=box.scrollTop;box.textContent='';
  let shown=items.filter(it=>(ppFilter==='all'||(ppFilter==='can'?can(it):ppFilter==='later'?later(it):blk(it)))&&(!q||(it.p.name+' '+(it.p.donor||'')+' '+(it.p.id||'')).toLowerCase().includes(q)));
  const rank={fits:0,swap:1,kit:2,blocked:3,later:4};
  const groupOf=p=>p.donor?p.donor.split(' ')[0]:'';
  shown.sort((a,b)=>(partIsOn(slot,b.p)-partIsOn(slot,a.p))||(rank[a.r.state]-rank[b.r.state])||(groupOf(a.p)<groupOf(b.p)?-1:groupOf(a.p)>groupOf(b.p)?1:0));
  let lastG=null;
  if(!shown.length)box.appendChild(el('div','sub','Nothing here for this filter.'));
  for(const it of shown){
    const g=groupOf(it.p);if(g&&g!==lastG){box.appendChild(el('div','grp',g));lastG=g;}
    const on=partIsOn(slot,it.p),b=el('button','prow '+it.r.state+(on?' on':''));
    b.appendChild(el('div','pn',it.p.name));const sp=specLine(slot,it.p);if(sp)b.appendChild(el('div','ps',sp));
    let msg=on?'Fitted now':(it.r.state==='blocked'||it.r.state==='later'?it.r.reason:it.r.notes.length?it.r.notes.join('. '):'Fits');
    if(!on&&it.r.state!=='blocked'&&it.r.warns&&it.r.warns.length)msg+='. Warning: '+it.r.warns[0];
    b.appendChild(el('div','pb',msg));
    if(it.r.state!=='later')b.onclick=()=>{pickPart(slot,it);};else b.disabled=true;box.appendChild(b);
  }
  box.scrollTop=keep;
}
function pickPart(slot,it){
  const prev=clone(cfg);
  if(slot==='wheel'||slot==='swapkit'){for(const k of Object.keys(it.r.cfg))cfg[k]=it.r.cfg[k];}
  else {for(const k of Object.keys(it.r.cfg))cfg[k]=it.r.cfg[k];}
  refresh(false);
  const msgs=it.r.state==='blocked'?['Fitted, but it does not fit: '+it.r.reason+' The car will not start.']:it.r.notes;
  if(msgs.length)toast(msgs.join('. '));
  if(innerWidth<=820)closeSheets();else renderPicker();
}
$('ppClose').onclick=closeSheets;$('ppSearch').oninput=e=>{ppQuery=e.target.value;renderPicker();};

/* ---------- car picker ---------- */
function renderCarList(){
  const box=$('carList');box.textContent='';
  for(const c of CAR_LIST){const ready=!!CAR_MODULES[c.id],b=el('button','carcard'+(c.id===CARID?' on':'')+(ready?'':' off'));
    const t=el('div');t.appendChild(el('div','nm',c.name));t.appendChild(el('div','sub',c.sub));b.appendChild(t);
    b.appendChild(el('span','tag'+(ready?' ready':''),c.id===CARID?'In the garage':ready?'Ready':'Coming soon'));
    if(ready)b.onclick=()=>{$('carPick').classList.remove('open');if(c.id!==CARID)switchCar(c.id);};box.appendChild(b);}
}
$('carBtn').onclick=()=>{renderCarList();$('carPick').classList.toggle('open');$('partPick').classList.remove('open');};
$('carClose').onclick=()=>$('carPick').classList.remove('open');

/* ---------- saves: five build slots plus an autosave per car, and the odometer. Private per viewer in this artifact's database; a page outside claude.ai uses this browser's storage. ---------- */
const SAVE_SLOTS=['slot1','slot2','slot3','slot4','slot5'];
const saves={backend:'none',db:null,uid:null,data:{},timer:null,chain:Promise.resolve(),restored:false,quiet:false};
function buildName(){const e=CAR.powertrain==='electric'?byId('motor',cfg.motor):byId('engine',cfg.engine);return CAR.short+': '+e.id+', '+cfg.wheel.dia+'-inch wheels, '+(state.paint<0?'custom '+hexStr(state.paintHex||0):MOD.paints[state.paint][0]);}
function snapshotSave(name){return {v:2,car:CARID,name:(name||'').slice(0,40)||buildName(),savedAt:new Date().toISOString(),cfg:clone(cfg),paint:state.paint,paintHex:state.paintHex,finish:state.finish,odoKm:Math.round((state.odo||0)*100)/100};}
const docName=id=>CARID+'-'+id;
function slotRef(name){return saves.db.collection('data/users/'+saves.uid).doc(name);}
function localOK(){try{localStorage.setItem('garage.t','1');localStorage.removeItem('garage.t');return true;}catch(e){return false;}}
async function readRaw(name){
  try{if(saves.backend==='db'){const s=await slotRef(name).get();return s.exists?s.data():null;}
      if(saves.backend==='local'){const t=localStorage.getItem('garage.save.'+name);return t?JSON.parse(t):null;}}catch(e){}
  return null;}
function writeRaw(name,data){   // one write at a time (each document is written in order)
  saves.chain=saves.chain.then(async()=>{
    if(saves.backend==='db'){try{await slotRef(name).set(data);}catch(e){if(e&&e.code==='invalid_argument'){saves.backend=localOK()?'local':'none';renderSaveWhere();if(saves.backend==='local')localStorage.setItem('garage.save.'+name,JSON.stringify(data));}else throw e;}}
    else if(saves.backend==='local')localStorage.setItem('garage.save.'+name,JSON.stringify(data));
    else throw new Error('Saving is not available here.');});
  return saves.chain;}
function removeRaw(name){saves.chain=saves.chain.then(async()=>{if(saves.backend==='db')await slotRef(name).delete();else if(saves.backend==='local')localStorage.removeItem('garage.save.'+name);});return saves.chain;}
const readSlot=id=>readRaw(docName(id));
function writeSlot(id,data){return writeRaw(docName(id),data).then(()=>{saves.data[id]=data;});}
function removeSlot(id){return removeRaw(docName(id)).then(()=>{saves.data[id]=null;});}
function validCfg(c){   // a save from an older catalogue keeps only parts that still exist
  const tintOf=c=>c&&Number.isFinite(+c.glassTint)?Math.max(0,Math.min(100,Math.round(+c.glassTint))):undefined;   // window tint (C-06): every car, the Model X too
  if(CAR.powertrain==='electric'){const o=MODELX_EV.valid(c),t=tintOf(c);if(o&&t!==undefined)o.glassTint=t;return o;}
  const out=defaultCfg();if(!c||typeof c!=='object')return out;c=migrateAero(clone(c));
  for(const k of ['tyre','engine','turbo','swapkit','gearbox','diff','exhaust','seats','shifter','handbrake','mirrorHang','trunk','steering','suspension','brakes','aeroF','aeroR','flares','skirts','frame'])if(typeof c[k]==='string'&&byId(k,c[k])&&!notBuilt(k,c[k])&&!(CAR.refuse&&CAR.refuse[k]&&CAR.refuse[k][c[k]])&&!(LIB[k]&&LIB[k].some(p=>p.id===c[k]&&p.shells&&!p.shells.includes(CAR.id))))out[k]=c[k];
  // Stage B (SPEC-INTERIOR §1.3): the area states are literals, not LIB ids — their own validation, NOT the plain byId check above
  if(typeof c.rearArea==='string'&&(c.rearArea==='stock'||c.rearArea==='removed'||byId('rearArea',c.rearArea))&&(CAR.removables&&CAR.removables.rearSeat)&&!(LIB.rearArea||[]).some(p=>p.id===c.rearArea&&p.shells&&!p.shells.includes(CAR.id)))out.rearArea=c.rearArea;
  if(typeof c.passArea==='string'&&(c.passArea==='stock'||c.passArea==='removed'||byId('passArea',c.passArea))&&!(LIB.passArea||[]).some(p=>p.id===c.passArea&&p.shells&&!p.shells.includes(CAR.id)))out.passArea=c.passArea;
  if(typeof c.dashPlush==='string'&&(c.dashPlush==='none'||byId('dashPlush',c.dashPlush)))out.dashPlush=c.dashPlush;
  const w=c.wheel||{};if(LIB.wheel.some(x=>x.id===w.style))out.wheel.style=w.style;
  if(CAR.wheelDia.includes(+w.dia))out.wheel.dia=+w.dia;if(CAR.wheelWid.includes(+w.width))out.wheel.width=+w.width;
  if(+w.bore>0&&+w.bore<200)out.wheel.bore=+w.bore;else delete out.wheel.bore;if(+w.tw>0&&+w.tw<400)out.wheel.tw=+w.tw;else delete out.wheel.tw;if(+w.ar>0&&+w.ar<100)out.wheel.ar=+w.ar;else delete out.wheel.ar;
  if(Number.isFinite(+w.et)){const L=etLim(+out.wheel.width||+w.width||7);out.wheel.et=Math.max(Math.max(-40,-L),Math.min(Math.min(60,L),Math.round(+w.et)));}
  for(const k of ['camberF','camberR'])if(Number.isFinite(+c[k]))out[k]=Math.max(-10,Math.min(0,Math.round(+c[k]*2)/2));if(PCDS.includes(w.pcd))out.wheel.pcd=w.pcd;
   for(const k of ['camberF','camberR'])if(Number.isFinite(+c[k]))out[k]=Math.max(-10,Math.min(0,Math.round(+c[k]*2)/2));
   if(Number.isFinite(+c.spacerF))out.spacerF=Math.max(0,Math.min(80,Math.round(+c.spacerF/5)*5));
   if(tintOf(c)!==undefined)out.glassTint=tintOf(c);
   if(Number.isFinite(+c.spacerR))out.spacerR=Math.max(0,Math.min(80,Math.round(+c.spacerR/5)*5));
   if(PCDS.includes(w.pcd))out.wheel.pcd=w.pcd;
  const su=byId('suspension',out.suspension);out.drop=Math.max(su.minDrop,Math.min(su.maxDrop,Math.round(+c.drop||0)));
  out.removed={};if(c.removed&&typeof c.removed==='object')for(const k in c.removed)if(c.removed[k]&&CAR.removables[k])out.removed[k]=true;
  // Stage B (SPEC-INTERIOR §1.3): drift repair — the state and the removed flag must agree; never a BLOCK for a self-consistent repair
  if(out.rearArea&&out.rearArea!=='stock')out.removed.rearSeat=true;else if(out.removed.rearSeat&&out.rearArea!==undefined)out.rearArea='removed';if(out.rearArea==='stock')delete out.removed.rearSeat;
  if(out.passArea&&out.passArea!=='stock')out.removed.passengerSeat=true;else if(out.removed.passengerSeat&&out.passArea!==undefined)out.passArea='removed';if(out.passArea==='stock')delete out.removed.passengerSeat;
  return out;}
function applySave(s){
  saves.quiet=true;
  const c=validCfg(s.cfg);for(const k of Object.keys(cfg))delete cfg[k];Object.assign(cfg,c);
  if((+s.paint)<0&&s.paintHex!=null)setCustomPaint(+s.paintHex,true,s.finish);else setPaint(Math.max(0,Math.min(MOD.paints.length-1,(+s.paint)|0)),true,s.finish);
  state.odo=Math.max(state.odo||0,+s.odoKm||0);
  refresh(false);saves.quiet=false;renderSaves();}
function scheduleAutosave(){if(saves.quiet||saves.backend==='none')return;clearTimeout(saves.timer);saves.timer=setTimeout(()=>{writeSlot('auto',snapshotSave('Autosave')).then(renderSaves).catch(()=>{});},2500);}
function renderSaveWhere(){$('saveWhere').textContent={db:'Saved to your Claude account, private to you, on any device.',local:'Saved in this browser only, for now (account-wide saves come with the release).',none:'Saving is not available in this view.'}[saves.backend];}
function fmtDate(t){try{return new Date(t).toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});}catch(e){return '';}}
function renderSaves(){
  renderSaveWhere();$('saveOdo').textContent=(state.odo||0).toFixed(1);
  const box=$('saveSlots');box.textContent='';
  for(const id of ['auto',...SAVE_SLOTS]){const s=saves.data[id],row=el('div','slot'),meta=el('div','meta');
    meta.appendChild(el('b',null,id==='auto'?'Autosave':'Slot '+id.slice(4)));
    meta.appendChild(document.createTextNode(s?(s.name+' · '+fmtDate(s.savedAt)+' · '+(+s.odoKm||0).toFixed(1)+' km'):'Empty'));row.appendChild(meta);
    if(id!=='auto'){const b=el('button',null,'Save');b.dataset.save=id;b.disabled=saves.backend==='none';b.onclick=()=>{const data=snapshotSave($('saveName').value.trim());$('saveMsg').textContent='Saving…';
        writeSlot(id,data).then(()=>{$('saveMsg').textContent='Saved to slot '+id.slice(4)+'.';renderSaves();}).catch(e=>{$('saveMsg').textContent=e&&e.code==='quota_exceeded'?'Storage is full: delete a save first.':'Could not save ('+((e&&e.message)||'error')+').';});};row.appendChild(b);}
    const l=el('button',null,'Load');l.dataset.load=id;l.disabled=!s;l.onclick=()=>{if(state.mode!=='garage')setMode('garage');applySave(s);$('saveMsg').textContent='Loaded '+(id==='auto'?'the autosave':'slot '+id.slice(4))+': '+s.name+'.';};row.appendChild(l);
    if(id!=='auto'){const d=el('button',null,'Delete');d.dataset.del=id;d.disabled=!s;d.onclick=()=>{removeSlot(id).then(()=>{$('saveMsg').textContent='Deleted slot '+id.slice(4)+'.';renderSaves();}).catch(()=>{$('saveMsg').textContent='Could not delete.';});};row.appendChild(d);}
    box.appendChild(row);}
}
async function initBackend(){
  try{const C=window.claude;if(C&&typeof C.use==='function'){const [db,user]=await Promise.all([C.use('db'),C.use('user')]);const uid=user?await user.id():null;if(db&&uid){saves.db=db;saves.uid=uid;saves.backend='db';}}}catch(e){}
  if(saves.backend==='none'&&localOK())saves.backend='local';
}
async function loadSaves(){
  saves.data={};for(const id of ['auto',...SAVE_SLOTS])saves.data[id]=await readSlot(id);
  if(saves.data.auto){applySave(saves.data.auto);}
  renderSaves();
}

/* ---------- loading a car (staged so the page stays responsive) ---------- */
let loading=false;
function switchCar(id){
  return new Promise((resolve,reject)=>{
    loading=true;window.__bootDone=false;closeSheets();$('boot').style.display='flex';$('bootBar').style.width='0';$('bootMsg').textContent='Loading '+(CAR_LIST.find(c=>c.id===id)||{name:id}).name+'…';
    clearTimeout(saves.timer);
    setTimeout(()=>{
      try{
        if(MOD){for(const k of Object.keys(applied))delete applied[k];unloadCar();}
        tintReset();setShell(id);CARID=id;MOD=moduleFor(id);
        const d=defaultCfg();for(const k of Object.keys(cfg))delete cfg[k];Object.assign(cfg,d);state.paint=0;state.paintHex=null;state.finish='gloss';
        document.title='Garage: '+CAR.short;$('carTitle').textContent=CAR.name;$('carTag').textContent=MOD.tagline;
        $('tTrunk').textContent=MOD.trunkLabel||'Trunk';$('tRDoor').hidden=!MOD.rearDoors;setToggle('tRDoor',0);$('tCover').hidden=!MOD.coverLabel;if(MOD.coverLabel)$('tCover').textContent=MOD.coverLabel;setToggle('tCover',0);
        buildPaints();buildShop();
      }catch(e){console.error(e);$('bootMsg').textContent='Build error: '+e.message;reject(e);return;}
      let si=0;const stages=MOD.stages;
      const run=()=>{
        if(si>=stages.length){
          (async()=>{
            try{refresh(true);if(MOD.onLoaded)MOD.onLoaded();applyBadges();
              await writeRaw('last',{car:id}).catch(()=>{});
              await loadSaves();
              window.__bootDone=true;loading=false;$('boot').style.display='none';update(0.016);state.mode==='garage'?camPreset('showroom'):0;resolve();
            }catch(e){console.error(e);$('bootMsg').textContent='Build error: '+e.message;reject(e);}
          })();return;}
        $('bootMsg').textContent=stages[si][0]+'…';$('bootBar').style.width=((si+1)/stages.length*100)+'%';
        setTimeout(()=>{try{stages[si][1]();}catch(e){console.error(e);$('bootMsg').textContent='Build error: '+e.message;reject(e);return;}si++;run();},30);
      };
      run();
    },30);
  });
}

/* ---------- main loop ---------- */
let last=performance.now();
// the next frame is asked for first, so one frame's error cannot stop the game for good; the first error is still thrown (outside the frame) so it
// shows in the console and fails the checks, as before
let loopErr=null;
function loop(now){requestAnimationFrame(loop);const rdt=(now-last)/1000,dt=Math.min(.05,rdt);last=now;if(loading)return;
  try{gfxFrame(rdt);pollPad(dt);update(dt);updateCamera(dt);applyTint(false);renderMirrors();renderer.render(scene,camera);updateAudio();}
  catch(e){if(!loopErr){loopErr=e;setTimeout(()=>{throw e;});}}}
async function start(){
  layRoad();gfxApply(GFX.level);setUnits(UNITS.mph);setAssist(ASSIST.mode);
  await initBackend();
  let id=CAR_MODULES.gt2000?'gt2000':CAR_LIST.find(c=>CAR_MODULES[c.id]).id;const l=await readRaw('last');if(l&&CAR_MODULES[l.car])id=l.car;   // merged from the WIP's REDO L-5 rule: bare open lands on the GT2000; saved-'last' override stays, menu switching unchanged. A build that hides the 2000GT (--hide, the launch build) lands on the first car on the list
  await switchCar(id);
  requestAnimationFrame(t=>{last=t;requestAnimationFrame(loop);});
}
window.__GARAGE={pollPad,ASSIST,setAssist,WORLD,setWorld,gfxPick,GFX,build,anim,saves,validCfg,partList,nameOf,snapshotSave,COCKPIT:typeof COCKPIT!=='undefined'?COCKPIT:null,MIRRORS,aimMirror,THREE,state,P,wheels,update,cfg,refresh,checkFit,readout,effEngine,densityRatio,CATALOG,setMode,camPreset,keys,cam,switchCar,applyPart,setNitrousArm,refillNitrous,phys,openPicker,pickStatus,renderPicker,loadSaves,get CAR(){return CAR;},get MOD(){return MOD;},get CARID(){return CARID;},startLoop:()=>requestAnimationFrame(t=>{last=t;requestAnimationFrame(loop);}),scene,carRoot,body,renderer,camera};
window.__GARAGE.sound=SOUND;   // SOUND-01: the engine-sound synth, for the QA (t/sound)
window.__E30=window.__GARAGE;   // the existing E30 test suite looks for this name
start().catch(e=>{console.error(e);});
