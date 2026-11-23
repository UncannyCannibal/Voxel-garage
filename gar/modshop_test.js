const M=require('./modshop.js');
let pass=0,fail=0;
function T(name,cfgMut,expectOk,expectSlotText){
  const c=M.defaultCfg();cfgMut(c);const r=M.checkFit(c);
  const blocks=r.issues.filter(i=>i.sev==='BLOCK');
  let good=(r.ok===expectOk)&&(!expectSlotText||blocks.some(i=>i.slot===expectSlotText[0]&&i.text.includes(expectSlotText[1])));
  console.log((good?'PASS ':'FAIL ')+name+'  -> '+(r.ok?'fits':'BLOCKED: '+blocks.map(b=>'['+b.slot+'] '+b.text).join(' | ')));
  good?pass++:fail++;
}
T('stock car fits',c=>{},true);
T('S14 from the E30 M3 drops in (direct mounts) but needs its own gearbox',c=>{c.engine='S14B23';c.gearbox='G265';},true);
T('S14 with the stock M20 gearbox is blocked (bellhousing)',c=>{c.engine='S14B23';},false,['gearbox','bellhousing']);
T('2JZ with no kit is blocked (mounts)',c=>{c.engine='2JZGTE';c.gearbox='V160';},false,['engine','mount pattern']);
T('2JZ + kit + V160 gearbox fits (kit lowers the engine 60 mm)',c=>{c.engine='2JZGTE';c.gearbox='V160';c.swapkit='kit-jz';},true);
T('LS3 + LS kit + T56 fits',c=>{c.engine='LS3';c.gearbox='T56';c.swapkit='kit-ls';},true);
T('LS3 + JZ kit is blocked (kit does not accept GM mounts)',c=>{c.engine='LS3';c.gearbox='T56';c.swapkit='kit-jz';},false,['engine','swap kit']);
T('2JZ + kit + stock G260 mates through the adapter plate',c=>{c.engine='2JZGTE';c.gearbox='G260';c.swapkit='kit-jz';},true);
T('2JZ + kit + T56 blocked (GM bellhousing, no adapter)',c=>{c.engine='2JZGTE';c.gearbox='T56';c.swapkit='kit-jz';},false,['gearbox','bellhousing']);
T('wheels with 5x120 pattern blocked',c=>{c.wheel.pcd='5x120';},false,['wheel','bolt pattern']);
T('big brake kit on 14-inch wheels blocked',c=>{c.brakes='bbk4';},false,['brakes','larger wheel']);
T('big brake kit on 17x8 ET20 fits? (outer face check)',c=>{c.brakes='bbk4';c.wheel={style:'star',dia:17,width:8,et:20,pcd:'4x100'};},false,['wheel','Outer tyre face']);
T('18x9 ET50 blocked by the strut (inner tyre face 565.5 mm vs 566 mm)',c=>{c.brakes='bbk4';c.wheel={style:'star',dia:18,width:9,et:50,pcd:'4x100'};},false,['wheel','strut']);
T('BBK + 17x8 ET35 fits (outer face 815.5 mm, limit 818)',c=>{c.brakes='bbk4';c.wheel={style:'star',dia:17,width:8,et:35,pcd:'4x100'};},true);
T('BBK + 17x8 ET26 sticks out past the fender',c=>{c.brakes='bbk4';c.wheel={style:'star',dia:17,width:8,et:26,pcd:'4x100'};},false,['wheel','fender']);
T('the OEM 15x7 ET24 Style 10 fits a stock 325i (bimmertips)',c=>{c.wheel={style:'star',dia:15,width:7,et:24,pcd:'4x100'};},true);
T('track 6-pot on 17-inch wheels blocked',c=>{c.brakes='bbk6';c.wheel={style:'star',dia:17,width:8,et:28,pcd:'4x100'};},false,['brakes','larger wheel']);
T('track 6-pot on 18x9 with widebody and ET16 fits',c=>{c.brakes='bbk6';c.aero='wide';c.wheel={style:'dish',dia:18,width:9,et:16,pcd:'4x100'};},true);
T('18x9 ET22 without widebody blocked (fender)',c=>{c.wheel={style:'dish',dia:18,width:9,et:22,pcd:'4x100'};},false,['wheel','widebody']);
T('coilovers at 30 mm drop fit on stock wheels',c=>{c.suspension='coil';c.drop=30;},true);
T('coilovers at 60 mm drop on stock 14s hit the arch at full lock',c=>{c.suspension='coil';c.drop=60;},false,['suspension','full steering lock']);
T('stock springs cannot drop 40 mm',c=>{c.drop=40;},false,['suspension','allows']);
T('coilovers 80 mm drop on 14x6 blocked',c=>{c.suspension='coil';c.drop=80;},false,['suspension','full steering lock']);
T('roll cage without bucket seats blocked',c=>{c.frame='cage';},false,['frame','bucket']);
T('roll cage with bucket seats fits',c=>{c.frame='cage';c.seats='bucket';},true);
console.log('\n'+pass+' passed, '+fail+' failed');
// readouts
for(const [n,f] of [['stock',c=>{}],['S14 + G265 + 4.10 LSD + catback',c=>{c.engine='S14B23';c.gearbox='G265';c.diff='lsd410';c.exhaust='catback';}]]){
  const c=M.defaultCfg();f(c);const r=M.readout(c);
  console.log(n+': mass',r.mass,'kg, power',r.hp,'hp, power/weight',r.pw.toFixed(0),'hp/t, rev-limited top gear',r.vmaxGear[r.vmaxGear.length-1].toFixed(0),'km/h, drag-limited',r.drag.toFixed(0),'km/h, top',r.top.toFixed(0),'km/h, front weight',r.frontPct.toFixed(1)+'%, tyre',M.tyreFor(c.wheel.dia,c.wheel.width).sizeStr);
}
const t=M.tyreFor(17,8);console.log('17x8 tyre auto-size:',t.sizeStr,'OD',t.OD.toFixed(0),'mm vs stock 590 ->',((t.OD/590-1)*100).toFixed(1)+'%');
