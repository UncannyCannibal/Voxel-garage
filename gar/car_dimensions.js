// E30 model dimensions against the sourced spec (auto-data.net, carsales.com.au): 4325 x 1645 x 1380 mm, wheelbase 2570 mm
const fs=require('fs');
let src=['e30_core.js','e30_parts.js','modshop.js'].map(f=>fs.readFileSync(f,'utf8').replace(/if\(typeof module[\s\S]*$/,'')).join('\n');
src+=';return {buildE30Body,bumperFront,bumperRear,AX_F,AX_R,CAR};';
const M=new Function(src)();
const r=M.buildE30Body();let lo=[1e9,1e9,1e9],hi=[-1e9,-1e9,-1e9];
// the drawn exterior is a 10 mm grid: hi cell i spans world i/2 +- 0.25 (1 world unit = 20 mm)
const add=g=>{for(const [x,y,z] of g.list()){const c=[x,y,z].map(v=>v/2);lo=[Math.min(lo[0],c[0]-.25),Math.min(lo[1],c[1]-.25),Math.min(lo[2],c[2]-.25)];hi=[Math.max(hi[0],c[0]+.25),Math.max(hi[1],c[1]+.25),Math.max(hi[2],c[2]+.25)];}};
for(const k of ['body','hood','trunk','doorL','doorR'])add(r.hi[k]);add(M.bumperFront());add(M.bumperRear());
const L=(hi[0]-lo[0])*20,W=(hi[2]-lo[2])*20,H=hi[1]*20;          // height measured from the ground plane y = 0
const chk=(ok,t)=>console.log((ok?'PASS ':'FAIL ')+t);
console.log('model overall (mm): length',L.toFixed(0),'width',W.toFixed(0),'height',H.toFixed(0),'(10 mm cells)');
chk(Math.abs(L/4325-1)<=0.01,'length within 1% of 4325 mm [VERIFIED] ('+((L/4325-1)*100).toFixed(2)+'%)');
chk(Math.abs(W/1645-1)<=0.01,'width within 1% of 1645 mm [VERIFIED] ('+((W/1645-1)*100).toFixed(2)+'%)');
chk(Math.abs(H/1380-1)<=0.01,'height within 1% of 1380 mm [VERIFIED] ('+((H/1380-1)*100).toFixed(2)+'%)');
const wb=(M.AX_F-M.AX_R)*20;chk(Math.abs(wb/2570-1)<=0.02,'wheelbase within 2% of 2570 mm [VERIFIED] ('+wb.toFixed(0)+' mm)');
chk(Math.abs(M.CAR.stockOD/590-1)<1e-9,'stock rolling diameter 590 mm = 14 x 25.4 + 2 x 0.60 x 195 [CALCULATED]');
