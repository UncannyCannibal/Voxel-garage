(async()=>{
  const {w,E,errs,$}=await require('./garage_boot.js')();
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  await E.switchCar('ef');for(let i=0;i<300&&w.document.getElementById('boot').style.display!=='none';i++)await sleep(200);
  const run=s=>{for(let i=0;i<Math.round(s/.016);i++)E.update(.016);};
  const presetBtn=n=>[...w.document.querySelectorAll('#shop .row button')].find(b=>b.textContent===n);
  for(const n of ['B18C swap','K20 swap']){presetBtn(n).click();run(.3);const r=E.checkFit(E.cfg);console.log(n,JSON.stringify(r.problems||r.items||r,null,0).slice(0,900));}
  // find the part that throws
  $('mGarage').click();run(1);presetBtn('Stock').click();
  for(const slot of ['engine','swapkit','gearbox','diff','exhaust','seats','steering','suspension','brakes','wheel','aerokit','aeroF','aeroR','flares','skirts','frame']){
    E.openPicker(slot);[...w.document.querySelectorAll('#ppChips button')].find(b=>b.textContent.startsWith('All')).click();
    const n=[...w.document.querySelectorAll('#ppList .prow')].length;
    for(let i=0;i<n;i++){const rows=[...w.document.querySelectorAll('#ppList .prow')];if(!rows[i])break;const e0=errs.length;const nm=rows[i].textContent.slice(0,50);rows[i].click();run(.05);if(errs.length>e0)console.log('ERR after',slot,nm,'|',errs[errs.length-1].slice(0,200));}
  }
  process.exit(0);
})();
