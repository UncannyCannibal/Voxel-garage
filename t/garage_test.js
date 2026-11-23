// PAGE TEST: presets, every option, blocked builds, and the drive / park / edit / drive loop in one environment.
(async()=>{
  const {w,E,errs,$}=await require('./garage_boot.js')();
  const PF=(ok,m)=>console.log((ok?'PASS ':'FAIL ')+m);
  if(!E){console.log('FAIL page did not boot: '+$('bootMsg').textContent);console.log(errs.slice(0,5).join('\n'));process.exit(1);}
  PF(true,'page boots ("'+$('bootMsg').textContent+'" finished, boot screen hidden)');
  const run=s=>{for(let i=0;i<Math.round(s/.016);i++)E.update(.016);};const kmh=()=>Math.round(Math.abs(E.state.v)*3.6);
  // A. the one-product loop
  PF(E.state.mode==='drive'&&!$('menu').classList.contains('open'),'starts in Drive mode with the menu closed');
  E.keys.w=true;run(6);const vDrive=kmh();PF(vDrive>20,'Drive: full throttle for 6 s reaches '+vDrive+' km/h');
  $('mGarage').click();run(1);PF(E.state.mode==='garage'&&$('menu').classList.contains('open')&&$('menu').dataset.tab==='parts','Garage opens the menu on the Parts tab');
  run(9);PF(kmh()===0&&$('hGear').textContent==='P','the car brakes to a stop and parks (speed '+kmh()+' km/h, gear shows '+$('hGear').textContent+')');
  run(3);PF(kmh()===0,'throttle is ignored while parked (W still held, '+kmh()+' km/h)');E.keys.w=false;
  // B. every preset fits and the car starts
  const presetBtn=n=>[...w.document.querySelectorAll('#shop .row button')].find(b=>b.textContent===n);
  for(const [n] of E.MOD.presets){presetBtn(n).click();run(.5);const r=E.readout(E.cfg);PF($('shopStatus').textContent.startsWith('Fits'),'preset '+n+' fits: '+r.mass+' kg, '+r.hp+' hp, top '+r.top.toFixed(0)+' km/h');}
  // C. open the part picker for every slot and click EVERY part with frames between clicks
  presetBtn('Stock').click();let clicks=0;
  for(const [slot] of [['engine'],['swapkit'],['gearbox'],['diff'],['exhaust'],['seats'],['steering'],['suspension'],['brakes'],['wheel'],['aerokit'],['aeroF'],['aeroR'],['flares'],['skirts'],['frame']]){
    E.openPicker(slot);const rows0=[...w.document.querySelectorAll('#ppList .prow')].length;
    [...w.document.querySelectorAll('#ppChips button')].find(b=>b.textContent.startsWith('All')).click();
    const n=[...w.document.querySelectorAll('#ppList .prow')].length;
    for(let i=0;i<n;i++){const rows=[...w.document.querySelectorAll('#ppList .prow')];if(!rows[i])break;rows[i].click();run(.05);clicks++;}
  }
  PF(clicks>=60&&errs.length===0,'clicked '+clicks+' parts through the picker with frames between clicks, '+errs.length+' errors');
  // D. a blocked build refuses to drive
  presetBtn('Stock').click();E.openPicker('engine');
  const pick=(slot,id)=>{E.openPicker(slot);[...w.document.querySelectorAll('#ppChips button')].find(b=>b.textContent.startsWith('All')).click();const nm=E.CATALOG[slot]?E.CATALOG[slot].find(p=>p.id===id).name:id;const r=[...w.document.querySelectorAll('#ppList .prow')].find(b=>b.querySelector('.pn').textContent===nm);r.click();};
  pick('engine','2JZGTE');PF(E.cfg.swapkit==='kit-jz'&&E.cfg.gearbox==='V160','picking the 2JZ engine adds the 2JZ swap kit and the Supra gearbox by itself ('+E.cfg.swapkit+' / '+E.cfg.gearbox+')');
  E.cfg.swapkit='none';E.refresh(false);run(.3);
  PF(!$('shopStatus').textContent.startsWith('Fits'),'2JZ with no swap kit is blocked: "'+$('shopStatus').textContent.slice(0,60)+'"');
  $('mDrive').click();E.keys.w=true;run(4.8);E.keys.w=false;PF(kmh()===0,'the blocked build refuses to drive ('+kmh()+' km/h after 4.8 s of throttle)');
  // E. edit live, then the change shows up on the road
  $('mGarage').click();run(1);presetBtn('Stock').click();run(.3);const rS=E.readout(E.cfg);$('mDrive').click();E.state.x=E.state.z=E.state.psi=E.state.v=0;E.state.gear=1;E.state.rpm=850;E.keys.w=true;run(8);const vS=kmh();E.keys.w=false;
  $('mGarage').click();run(10);presetBtn('LS swap').click();run(.3);const rL=E.readout(E.cfg);
  $('mDrive').click();E.state.x=E.state.z=E.state.psi=E.state.v=0;E.state.gear=1;E.state.rpm=850;E.keys.w=true;run(8);const vL=kmh();E.keys.w=false;
  PF(rL.hp>rS.hp+200&&vL>vS+15,'the LS swap made in the garage changes the driving: '+vL+' km/h after 8 s against '+vS+' km/h on the stock engine ('+rS.hp+' hp to '+rL.hp+' hp)');
  // F. camera presets and panels
  $('mGarage').click();run(10);E.camPreset('engine');PF(E.state.hood===1&&E.cam.goal&&E.cam.goal.el>.8,'Engine bay view opens the hood and looks down into the bay');
  E.camPreset('interior');PF(E.state.doorL===1,'Interior view opens the left door');
  $('mDrive').click();run(.2);PF(E.state.hood===0&&E.state.doorL===0&&E.state.doorR===0&&E.state.trunk===0,'going back to Drive closes the hood, doors and trunk');
  // G. menu while driving
  $('mMenu').click();PF($('menu').classList.contains('open'),'Menu opens while driving');
  [...$('tabs').children].find(b=>b.dataset.tab==='body').click();$('paints').children[3].click();PF(E.state.paint===3,'paint can be changed while driving ('+$('paints').children.length+' colours)');
  [...$('tabs').children].find(b=>b.dataset.tab==='parts').click();PF(E.state.mode==='garage','tapping Parts while driving parks the car in the garage');
  // H. detail meshes exist on the page
  PF(!!E.P.doorL&&E.P.doorL.children.length>=4&&E.P.doorR.children.length>=4,'each door carries skin, glass, mirror and door card ('+E.P.doorL.children.length+' and '+E.P.doorR.children.length+' parts)');
  // I. steering direction: left input turns the rim's top to the driver's left (-z in the car frame) and the car to the left
  {$('mDrive').click();E.state.x=E.state.z=E.state.psi=E.state.v=0;E.state.gear=1;E.state.rpm=850;let root=E.P.swheel;while(root.parent&&root.parent.type!=='Scene')root=root.parent;
   const V=E.P.swheel.position.constructor;let loc=null;
   const top=()=>{root.updateMatrixWorld(true);return root.worldToLocal(E.P.swheel.localToWorld(loc.clone()));};
   E.keys.a=false;E.keys.d=false;run(1);root.updateMatrixWorld(true);{const c=root.worldToLocal(E.P.swheel.localToWorld(new V(0,0,0)));loc=E.P.swheel.worldToLocal(root.localToWorld(new V(c.x,c.y+9,c.z)));}   // the rim's top point with the wheels straight
   const z0=top().z;E.keys.a=true;run(.06);const zL=top().z,sL=E.state.steer;run(.6);E.keys.w=true;run(3);E.keys.w=false;const zc=E.state.z;E.keys.a=false;run(1);
   PF(sL>0&&zL<z0-1&&zc<-1,'steering: holding left turns the rim top to the driver\'s left (first 60 ms of input: '+z0.toFixed(1)+' to '+zL.toFixed(1)+' voxels in z) and the car moves left (z '+zc.toFixed(1)+')');
   E.state.x=E.state.z=E.state.psi=E.state.v=0;E.keys.d=true;run(.06);const zR=top().z;E.keys.d=false;run(1);PF(zR>z0+1,'steering: holding right turns the rim top to the driver\'s right ('+zR.toFixed(1)+')');}
  // J. live mirrors: each glass shows exactly what the driver's eye sees reflected in it (planar mirror law), facing rearward
  {const T=E.THREE,V=T.Vector3,body=E.P.hood.parent;E.state.x=E.state.z=E.state.psi=E.state.v=0;run(.1);body.updateMatrixWorld(true);
   const C=E.COCKPIT,eye=body.localToWorld(new V(C.eye.x,C.eye.y,C.eye.z));
   PF(E.MIRRORS.length===3,'three live mirrors on the page: '+E.MIRRORS.map(m=>m.name).join(', '));
   for(const m of E.MIRRORS){const okAim=E.aimMirror(m,eye);const Mw=m.plane.matrixWorld,c=new V().setFromMatrixPosition(Mw),n=new V().setFromMatrixColumn(Mw,2).normalize();
     const k=eye.clone().sub(c).dot(n),ep=eye.clone().addScaledVector(n,-2*k);
     const target=body.localToWorld(new V(-160,38,m.name==='doorL'?-70:m.name==='doorR'?70:0));   // a point behind the car on that side
     const d=target.clone().sub(ep),s=-(ep.clone().sub(c).dot(n))/d.dot(n),Mp=ep.clone().addScaledVector(d,s);   // where the reflected ray meets the glass plane
     const inc=Mp.clone().sub(eye).normalize(),refl=inc.clone().addScaledVector(n,-2*inc.dot(n)),out=target.clone().sub(Mp).normalize();
     const lp=m.plane.worldToLocal(Mp.clone()),uP=lp.x/m.w+.5,vP=lp.y/m.h+.5;
     const q=target.clone().applyMatrix4(m.cam.matrixWorldInverse).applyMatrix4(m.cam.projectionMatrix),uI=(q.x+1)/2,vI=(q.y+1)/2;
     const tx=m.rt.texture,err=Math.hypot(uI-(uP*tx.repeat.x+tx.offset.x),vI-(vP*tx.repeat.y+tx.offset.y)),ctr=new V().subVectors(c,eye).normalize(),cr=ctr.clone().addScaledVector(n,-2*ctr.dot(n)),crB=cr.clone().transformDirection(new T.Matrix4().copy(body.matrixWorld).invert());
     PF(okAim&&refl.distanceTo(out)<1e-6&&err<1e-6&&crB.x<-.5,m.name+' mirror: a point behind the car appears where the law of reflection puts it on the glass (texture error '+err.toExponential(1)+', left and right reversed), and the glass looks rearward (centre ray x '+crB.x.toFixed(2)+', z '+crB.z.toFixed(2)+')');}}
  // K. saves: five slots plus autosave and the odometer; private per viewer in the artifact database on claude.ai, this browser's storage elsewhere
  {const sleep=ms=>new Promise(r=>setTimeout(r,ms));await sleep(300);
   PF(['db','local'].includes(E.saves.backend),'saves have a place to live in this view ('+E.saves.backend+'; jsdom has no claude.ai viewer, so it is browser storage here)');
   [...$('tabs').children].find(b=>b.dataset.tab==='saves').click();PF($('saveSlots').querySelectorAll('.slot').length===6,'Saves tab lists the autosave and five slots');
   $('mGarage').click();run(1);presetBtn('LS swap').click();run(.2);$('saveName').value='My LS build';
   w.document.querySelector('[data-save=slot1]').click();await E.saves.chain;await sleep(50);
   const s1=E.saves.data.slot1;PF(!!s1&&s1.name==='My LS build'&&s1.cfg.engine==='LS3','Save to slot 1 stores the build ('+(s1&&s1.name)+', '+(s1&&s1.cfg.engine)+')');
   presetBtn('Stock').click();run(.2);w.document.querySelector('[data-load=slot1]').click();run(.2);
   PF(E.cfg.engine==='LS3'&&E.cfg.gearbox==='T56'&&$('shopStatus').textContent.startsWith('Fits'),'Load slot 1 puts the LS build back on the car, and it fits ('+E.cfg.engine+' / '+E.cfg.gearbox+')');
   presetBtn('M3 spec').click();run(.2);await sleep(2800);await E.saves.chain;
   const a=E.saves.data.auto;PF(!!a&&a.cfg.engine==='S14B23','the build autosaves 2.5 s after a change ('+(a&&a.cfg.engine)+')');
   const o0=E.state.odo||0;$('mDrive').click();E.state.v=0;E.state.gear=1;E.keys.w=true;run(6);E.keys.w=false;PF((E.state.odo||0)-o0>0.02,'the odometer counts distance driven ('+(((E.state.odo||0)-o0)*1000).toFixed(0)+' m in 6 s)');
   const bad=E.validCfg({engine:'V12-imaginary',gearbox:'G260',wheel:{style:'nope',dia:21,width:6,et:999},drop:500,suspension:'coil'});
   PF(bad.engine==='M20B25'&&bad.wheel.dia===14&&bad.wheel.et===60&&bad.drop===80,'a damaged or outdated save is cleaned: unknown parts fall back to stock, numbers are clamped');
   w.document.querySelector('[data-del=slot1]').click();await E.saves.chain;PF(!E.saves.data.slot1,'Delete empties the slot');}
  console.log('errors: '+errs.length);if(errs.length)console.log(errs.slice(0,5).join('\n'));process.exit(0);
})();
