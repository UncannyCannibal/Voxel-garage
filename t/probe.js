// node probe.js <car> <script.js>: boots the garage page, switches car, runs the script with (w,E,P,T) in scope; the script's return value is printed
(async()=>{
  const {w,E,errs,$}=await require('./garage_boot.js')();
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));const car=process.argv[2];
  if(E.CARID!==car){await E.switchCar(car);for(let i=0;i<300&&w.document.getElementById('boot').style.display!=='none';i++)await sleep(200);}
  const src=require('fs').readFileSync(process.argv[3],'utf8');
  const f=new Function('w','E','P','T','S','run','$',src);const run=s=>{for(let i=0;i<Math.round(s/.016);i++)E.update(.016);};
  try{const r=await f(w,E,E.P,E.THREE,E.state,run,$);if(r!==undefined)console.log(typeof r==='string'?r:JSON.stringify(r));}catch(e){console.log('ERR',e.stack);}
  if(errs.length)console.log(errs.slice(0,5).join('\n'));process.exit(0);
})();
