(async()=>{
  const {w,E,errs,$}=await require('./garage_boot.js')();
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  await E.switchCar('ef');for(let i=0;i<300&&w.document.getElementById('boot').style.display!=='none';i++)await sleep(200);
  for(const [k,v] of [['exhaust','catback'],['gearbox','T56'],['engine','M20B25']]){E.cfg[k]=v;try{E.MOD.apply[k==='gearbox'?'engine':k]();console.log(k,v,'ok');}catch(e){console.log(k,v,'THROWS',e.stack.split('\n').slice(0,4).join(' | '));}}
  process.exit(0);
})();
