// Contract tests for the new EV adapter; no browser or third-party dependency.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..','gar'),ctx=vm.createContext({console,assert});
for(const f of ['parts_lib.js','parts_honda.js','parts_jdm.js','parts_nissan.js','parts_dsm.js','parts_2000gt.js','parts_modelx.js','shells.js','fit.js','modelx_ev.js','e30_core.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
vm.runInContext(`
setShell('modelx');
const c=defaultCfg(),res=checkFit(c),p={},s={v:0,throttle:1,gear:1};
assert.equal(res.ok,true);assert.equal('engine' in c,false);assert.equal('gearbox' in c,false);
assert.equal(readout(c).hp,1020);assert.equal(readout(c).torqueLabel,'ESTIMATED');assert.equal(massOf(c).mass,2468);
MODELX_EV.driveSetup(p,s,c,res);
const start=MODELX_EV.force(p,s,false);assert.ok(start>18000);assert.equal(s.rpm,0);assert.equal(s.gear,1);
s.v=60;const high=MODELX_EV.force(p,s,false);assert.ok(high*60<=761000*.94+1);
s.v=262/3.6;assert.equal(MODELX_EV.force(p,s,false),0);
s.v=24/3.6;assert.equal(Math.abs(MODELX_EV.force(p,s,true)),0);
s.v=0;s.batteryKWh=0;assert.equal(MODELX_EV.force(p,s,false),0);
s.v=20;s.throttle=0;s.batteryKWh=76;const regen=MODELX_EV.force(p,s,false);assert.ok(regen<0);assert.ok(-regen*20<=80000+1);
const before=s.batteryKWh;MODELX_EV.energy(s,regen*20,1);assert.ok(s.batteryKWh>before);
s.batteryKWh=95;assert.equal(MODELX_EV.force(p,s,false),0);
s.batteryKWh=76;s.throttle=1;s.v=0;MODELX_EV.driveSetup(p,s,c,res);assert.equal(s.batteryKWh,76);
assert.equal(applyPart(c,'engine','M20B25').state,'blocked');assert.equal(applyPart(c,'gearbox','G260').state,'blocked');
assert.equal('engine' in MODELX_EV.valid({engine:'M20B25'}),false);
const twenty=applyPart(c,'wheel','modelx-20');assert.equal(twenty.state,'fits');assert.equal(twenty.cfg.wheel.tw,265);
setShell('e30');assert.equal(defaultCfg().engine,'M20B25');assert.equal(defaultCfg().gearbox,'G260');
console.log('PASS Model X EV contracts: force/power limits, zero idle, reverse limit, depletion, regen/full battery, refresh, denied combustion swaps, saves, wheel sets, ICE config.');
`,ctx);
