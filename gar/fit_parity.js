// parity: the new fit engine must give the same BLOCK/WARN verdicts as the old E30 modshop for every old-catalogue build
const {LIB}=require('./parts_lib.js'),{SHELLS}=require('./shells.js');
global.LIB=LIB;global.SHELLS=SHELLS;
const fs=require('fs');const src=fs.readFileSync('./fit.js','utf8').replace(/if\(typeof module[\s\S]*$/,'');
const N=new Function('LIB','SHELLS',src+';return {setShell,byId,tyreFor,checkFit,readout,defaultCfg,massOf};')(LIB,SHELLS);N.setShell('e30');
const O=require('./modshop_old.js');
let n=0,bad=0;const oldIds=s=>O.CATALOG[s].map(p=>p.id);
const sample=(arr,k)=>arr[k%arr.length];
function cmp(cfg,tag){n++;const a=O.checkFit(JSON.parse(JSON.stringify(cfg))),b=N.checkFit(JSON.parse(JSON.stringify(cfg)));
  const NEW=t=>/is rated about|custom-machined adapter/.test(t),norm=t=>t.replace(/uses the .* mount pattern.*$/,'MOUNT');const sa=a.issues.map(i=>i.sev+i.slot+norm(i.text)).sort().join('|'),sb=b.issues.filter(i=>!NEW(i.text)).map(i=>i.sev+i.slot+norm(i.text)).sort().join('|');
  const ra=O.readout(JSON.parse(JSON.stringify(cfg))),rb=N.readout(JSON.parse(JSON.stringify(cfg)));
  const rd=Math.abs(ra.mass-rb.mass)<.51&&Math.abs(ra.hp-rb.hp)<1e-9&&Math.abs(ra.top-rb.top)<1e-6;
  if(sa!==sb||a.ok!==b.ok||!rd){bad++;if(bad<8)console.log('DIFF',tag,JSON.stringify(cfg).slice(0,200),'\n old:',sa.slice(0,300),'\n new:',sb.slice(0,300),'\n mass',ra.mass,rb.mass,ra.frontPct,rb.frontPct);}}
// one-slot-at-a-time over the whole old catalogue, on the stock build and on 3 other bases
const bases=[{},{engine:'S14B23',gearbox:'G265'},{engine:'2JZGTE',gearbox:'V160',swapkit:'kit-jz'},{engine:'LS3',gearbox:'T56',swapkit:'kit-ls'}];
for(const b of bases)for(const slot of ['engine','swapkit','gearbox','diff','exhaust','seats','steering','suspension','brakes','aero','frame']){
  for(const id of oldIds(slot)){const c=O.defaultCfg();Object.assign(c,b);c[slot]=id;if(slot==='suspension'){const su=O.CATALOG.suspension.find(p=>p.id===id);c.drop=Math.max(su.minDrop,Math.min(su.maxDrop,30));}
    delete c.removed;cmp(c,slot+'='+id);}}
for(const dia of [14,15,16,17,18])for(const wid of [6,7,8,9])for(const et of [10,16,20,25,35,45])for(const pcd of ['4x100','5x120']){const c=O.defaultCfg();c.wheel={style:'star',dia,width:wid,et,pcd};cmp(c,'wheel');}
for(const drop of [0,20,30,35,40,60,80])for(const dia of [14,15,16,17,18]){const c=O.defaultCfg();c.suspension='coil';c.drop=drop;c.wheel={style:'dish',dia,width:dia>=17?8:6,et:30,pcd:'4x100'};cmp(c,'drop');}
console.log('parity:',n,'builds compared,',bad,'differ');process.exit(bad?1:0);
