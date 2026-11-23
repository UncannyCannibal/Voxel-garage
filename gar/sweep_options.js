// OPTION SWEEP: every option of every slot is fitted to the car (with the companion parts it needs to pass the fitment engine),
// then the full collision suite runs on that build. Prints one PASS/FAIL line per option, and the suite's own failures.
const fs=require('fs'),cp=require('child_process');
let src=['e30_core.js','e30_parts.js','e30_shop_parts.js','modshop.js'].map(f=>fs.readFileSync(__dirname+'/'+f,'utf8').replace(/if\(typeof module[\s\S]*$/,'')).join('\n');
src+=';return {CATALOG,byId,checkFit,defaultCfg};';
const M=new Function(src)();
const gbFor=e=>{const eng=M.byId('engine',e);return M.CATALOG.gearbox.find(g=>g.bell===eng.bell).id;};
const kitFor=e=>{const eng=M.byId('engine',e);const k=M.CATALOG.swapkit.find(k=>k.accepts.includes(eng.mount));return k?k.id:'none';};
function fitFor(slot,id){
  const c=M.defaultCfg();c.wheel={style:'mesh',dia:15,width:7,et:25,pcd:'4x100'};
  if(slot==='engine'){c.engine=id;c.swapkit=kitFor(id);c.gearbox=gbFor(id);}
  else if(slot==='swapkit'){c.swapkit=id;const e=id==='none'?'M20B25':M.CATALOG.engine.find(e=>M.byId('swapkit',id).accepts.includes(e.mount)).id;c.engine=e;c.gearbox=gbFor(e);}
  else if(slot==='gearbox'){c.gearbox=id;const gb=M.byId('gearbox',id);const e=M.CATALOG.engine.find(e=>e.bell===gb.bell).id;c.engine=e;c.swapkit=kitFor(e);if(gb.tunnel>330&&c.swapkit==='none')c.swapkit='kit-s54';}
  else if(slot==='suspension'){c.suspension=id;c.wheel=M.defaultCfg().wheel;const su=M.byId('suspension',id);for(let d=su.maxDrop;d>=su.minDrop;d-=5){c.drop=d;if(M.checkFit(c).ok)break;}}   // the lowest drop the fitment engine accepts
  else if(slot==='brakes'){c.brakes=id;c.wheel.dia={stock:14,m3:15,e36:15,bbk4:17,bbk6:18}[id];c.wheel.width=c.wheel.dia>=17?8:7;c.wheel.et=c.wheel.dia>=17?35:25;}
  else if(slot==='frame'){c.frame=id;if(M.byId('frame',id).needsSeats)c.seats='bucket';}
  else if(slot==='wheel'){c.wheel.style=id;}
  else c[slot]=id;
  return c;
}
let fails=0,n=0;const rows=[];
for(const slot of ['engine','swapkit','gearbox','diff','exhaust','seats','wheel','steering','suspension','brakes','aero','frame']){
  for(const opt of M.CATALOG[slot]){const c=fitFor(slot,opt.id),f=M.checkFit(c);n++;
    if(!f.ok){fails++;console.log('FAIL '+slot+' / '+opt.id+': no fitting build found ('+f.issues.filter(i=>i.sev==='BLOCK').map(i=>i.text).join(' | ')+')');continue;}
    let out='',ok=true;try{out=cp.execFileSync('node',[__dirname+'/collision_suite.js','json',JSON.stringify(c)],{encoding:'utf8'});}catch(e){out=e.stdout||String(e);ok=false;}
    const passN=(out.match(/^PASS/mg)||[]).length,bad=(out.match(/^FAIL.*$/mg)||[]);
    if(!ok||bad.length)fails++;
    console.log((ok&&!bad.length?'PASS ':'FAIL ')+slot+' / '+opt.id+': fits ('+f.issues.length+' warnings), collision suite '+passN+' PASS, '+bad.length+' FAIL'+(bad.length?' -> '+bad.join(' || '):'')+'   build: '+c.engine+'/'+c.swapkit+'/'+c.gearbox+', '+c.wheel.dia+'x'+c.wheel.width+' ET'+c.wheel.et+', drop '+c.drop+', seats '+c.seats);
  }}
// wheel sizes at the lowest accepted coilover drop (tyre at full lock against the arches and bumpers)
for(const [dia,wd,et] of [[14,6,35],[15,7,24],[16,7,25],[17,8,35],[18,9,16]]){const c=M.defaultCfg();c.suspension='coil';c.wheel={style:'star',dia,width:wd,et,pcd:'4x100'};if(dia>=18){c.aero='wide';}
  for(let d=80;d>=0;d-=5){c.drop=d;if(M.checkFit(c).ok)break;}const f=M.checkFit(c);n++;if(!f.ok){fails++;console.log('FAIL wheels '+dia+'x'+wd+': no fitting drop');continue;}
  let out='',ok=true;try{out=cp.execFileSync('node',[__dirname+'/collision_suite.js','json',JSON.stringify(c)],{encoding:'utf8'});}catch(e){out=e.stdout||String(e);ok=false;}
  const passN=(out.match(/^PASS/mg)||[]).length,bad=(out.match(/^FAIL.*$/mg)||[]);if(!ok||bad.length)fails++;
  console.log((ok&&!bad.length?'PASS ':'FAIL ')+'wheels '+dia+'x'+wd+' ET'+et+' at the lowest accepted drop ('+c.drop+' mm'+(c.aero==='wide'?', widebody':'')+'): collision suite '+passN+' PASS, '+bad.length+' FAIL'+(bad.length?' -> '+bad.join(' || '):''));}
console.log('\nSWEEP RESULT: '+(fails?'FAIL':'PASS')+' ('+n+' options, '+fails+' failing)');process.exit(fails?1:0);
