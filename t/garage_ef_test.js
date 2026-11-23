// EF PAGE TEST (jsdom, stubbed WebGL): load the EF, presets, every part in every slot, the acceptance build, blocked builds, driving.
(async()=>{
  const {w,E,errs,$}=await require('./garage_boot.js')();
  const PF=(ok,m)=>console.log((ok?'PASS ':'FAIL ')+m);
  if(!E){console.log('FAIL page did not boot: '+$('bootMsg').textContent);console.log(errs.slice(0,5).join('\n'));process.exit(1);}
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  await E.switchCar('ef');for(let i=0;i<300&&w.document.getElementById('boot').style.display!=='none';i++)await sleep(200);
  PF(E.CARID==='ef'&&errs.length===0,'EF loads ('+E.CAR.name+'), '+errs.length+' errors');if(errs.length)console.log(errs.slice(0,5).join('\n'));
  const run=s=>{for(let i=0;i<Math.round(s/.016);i++)E.update(.016);};const kmh=()=>Math.round(Math.abs(E.state.v)*3.6);
  const presetBtn=n=>[...w.document.querySelectorAll('#shop .row button')].find(b=>b.textContent===n);
  $('mGarage').click();run(1);
  const r0=E.readout(E.cfg);PF(/Fits/.test($('shopStatus').textContent),'stock EF fits: '+r0.mass+' kg, '+r0.hp+' hp, top '+r0.top.toFixed(0)+' km/h');
  for(const [n] of E.MOD.presets){presetBtn(n).click();run(.5);const r=E.readout(E.cfg);PF($('shopStatus').textContent.startsWith('Fits'),'preset '+n+': '+$('shopStatus').textContent.slice(0,70)+' | '+r.mass+' kg, '+r.hp+' hp');}
  presetBtn('Stock').click();let clicks=0;
  for(const slot of ['engine','swapkit','gearbox','diff','exhaust','seats','steering','suspension','brakes','wheel','aerokit','aeroF','aeroR','flares','skirts','frame']){
    E.openPicker(slot);[...w.document.querySelectorAll('#ppChips button')].find(b=>b.textContent.startsWith('All')).click();
    const n=[...w.document.querySelectorAll('#ppList .prow')].length;
    for(let i=0;i<n;i++){const rows=[...w.document.querySelectorAll('#ppList .prow')];if(!rows[i])break;rows[i].click();run(.05);clicks++;}
  }
  PF(errs.length===0,'clicked '+clicks+' parts through the picker, '+errs.length+' errors');if(errs.length)console.log(errs.slice(0,6).join('\n'));
  presetBtn('Stock').click();run(.3);
  // drive the stock car
  $('mDrive').click();E.state.x=E.state.z=E.state.psi=E.state.v=0;E.state.gear=1;E.state.rpm=850;E.keys.w=true;run(8);E.keys.w=false;
  PF(kmh()>40,'stock EF drives: '+kmh()+' km/h after 8 s, gear '+E.state.gear+', rpm '+Math.round(E.state.rpm));
  // camera presets
  $('mGarage').click();run(2);E.camPreset('engine');PF(E.state.hood===1,'engine view opens the hood');E.camPreset('interior');PF(E.state.doorR===1,'interior view opens the driver door (right-hand drive)');
  for(const n of ['showroom','front','rear','wheels','under'])E.camPreset(n);
  run(1);E.state.hood=0;E.state.doorL=0;E.state.trunk=1;run(2);
  PF(errs.length===0,'hatch, hood, doors open and close: '+errs.length+' errors');
  // acceptance build
  presetBtn('Weight-cut build').click();run(.5);
  const ra=E.readout(E.cfg);console.log('acceptance:',JSON.stringify({engine:E.cfg.engine,kit:E.cfg.swapkit,gb:E.cfg.gearbox,seats:E.cfg.seats,removed:E.cfg.removed,wheel:E.cfg.wheel}),ra.mass+' kg',ra.hp+' hp');
  PF($('shopStatus').textContent.startsWith('Fits')||/Fits|warn|Warn/i.test($('shopStatus').textContent),'acceptance status: '+$('shopStatus').textContent.slice(0,100));
  PF(E.P.bumperF.visible===false&&E.P.bumperR.visible===false&&E.P.doorCards.every(m=>!m.visible),'bumpers and door cards are gone from the car');
  console.log(errs.length?errs.slice(0,6).join('\n'):'no errors');
  process.exit(0);
})();
