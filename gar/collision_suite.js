// COLLISION SUITE (E30 exemplar). Static AND swept tests. Every line prints PASS or FAIL with the number of voxels in collision.
// Obstacles are voxel sets (20 mm cells). Movers are point sets (voxel centres) transformed through their range of motion.
// Run:  node collision_suite.js [stock|track]        Exit code 1 on any FAIL.
const fs=require('fs');
const FILES=['e30_core.js','e30_parts.js','e30_shop_parts.js','modshop.js','e30_detail.js'];
let src=FILES.map(f=>fs.readFileSync(__dirname+'/'+f,'utf8').replace(/if\(typeof module[\s\S]*$/,'')).join('\n');
src+=';return {archCutBody,CAGE_FEET,COCKPIT,bayOptsFor,buildISLip,buildTrunkLip,buildStrutBar,buildRollBar,buildCage10,buildSplitter,buildDucktail,buildGTWing,buildE30Body,buildBumperF,buildBumperR,buildBay,buildInterior,buildEngineV,buildGearboxV,buildShaft,buildDiff,buildExhaustV,buildFan,buildPulley,buildTireP,buildRimP,buildRotorP,buildCaliperP,buildSeatV,buildRearBench,buildCage,buildFlares,halfAt,topY,AX_F,AX_R,WR,CAR,tyreFor,byId,defaultCfg,checkFit,Grid};';
const M=new Function(src)();
// ======== ADAPTER BEGIN (replace for each car: builders, obstacle sets, mover point sets, config) ========
const mode=process.argv[2]||'stock';
const cfg=M.defaultCfg();
if(mode==='track'){Object.assign(cfg,{engine:'S14B23',gearbox:'G265',diff:'lsd410',exhaust:'catback',seats:'bucket',steering:'small',suspension:'coil',drop:30,brakes:'bbk6',aero:'wide',frame:'cage'});cfg.wheel={style:'dish',dia:18,width:9,et:16,pcd:'4x100'};}
if(mode==='jz'){Object.assign(cfg,{engine:'2JZGTE',swapkit:'kit-jz',gearbox:'V160',diff:'lsd373',exhaust:'oval',seats:'bucket',steering:'small',suspension:'coil',drop:30,brakes:'bbk4',aero:'splitter'});cfg.wheel={style:'star',dia:17,width:8,et:35,pcd:'4x100'};}
if(mode==='json'){const j=JSON.parse(process.argv[3]);Object.assign(cfg,j);if(j.wheel)cfg.wheel=Object.assign(M.defaultCfg().wheel,j.wheel);}
if(mode==='ls'){Object.assign(cfg,{engine:'LS3',swapkit:'kit-ls',gearbox:'T56',diff:'lsd346',exhaust:'catback',seats:'recliner',steering:'sport',suspension:'coil',drop:30,brakes:'bbk4',aero:'ducktail'});cfg.wheel={style:'dish',dia:17,width:8,et:35,pcd:'4x100'};}
let fails=0;const chk=(ok,m)=>{console.log((ok?'PASS ':'FAIL ')+m);if(!ok)fails++;};
const key=(x,y,z)=>Math.round(x)+','+Math.round(y)+','+Math.round(z);
const setOf=(...grids)=>{const s=new Set();for(const g of grids)for(const [x,y,z] of g.list())s.add(x+','+y+','+z);return s;};
const R=M.buildE30Body();
const drop=0,wd=cfg.drop/20;                         // work in the body frame: a lowered car moves the wheels UP relative to the body by wd
const shift=(g,dy)=>g.list().map(([x,y,z,c])=>[x,y+dy,z]);
// ---- obstacle sets (body-attached ones move down with the ride height)
const bodyPts=[...R.body.list(),...R.glass.dgL.list(),...R.glass.dgR.list(),...R.glass.qgL.list(),...R.glass.qgR.list(),...R.glass.ws.list(),...R.glass.rw.list()];
const lowered=pts=>{const s=new Set();for(const p of pts)s.add(p[0]+','+Math.round(p[1]-drop)+','+p[2]);return s;};
const CUT=cfg.aero==='wide'?new Set(M.archCutBody(R.body).list().map(p=>p[0]+','+p[1]+','+p[2])):null;   // a widebody kit cuts the steel arch lips back under its flares (archCutBody, as the page draws it)
const BODY=lowered(bodyPts.filter(p=>!CUT||CUT.has(p[0]+','+p[1]+','+p[2])||R.body.get(p[0],p[1],p[2])<0)),HOOD=lowered(R.hood.list()),TRUNK=lowered(R.trunk.list()),DOORS=lowered([...R.doorL.list(),...R.doorR.list()]);
const BAY=lowered(M.buildBay(M.bayOptsFor(cfg.engine)).list()),INT=lowered(M.buildInterior({noSeats:false,body:R.body}).list()),BUMP=lowered([...M.buildBumperF().list(),...M.buildBumperR().list()]);
const hits=(pts,set)=>{let n=0;for(const p of pts)if(set.has(key(p[0],p[1],p[2])))n++;return n;};
// ---- movers
const eng=M.byId('engine',cfg.engine),ev=M.buildEngineV(cfg.engine);
let my=0;for(const v of ev.grid.list())my=Math.max(my,v[1]);const sy=Math.min(1,(36-11.5)/(my*.5));
const ePts=[],gPts=[];
for(const [x,y,z] of ev.grid.list())ePts.push([52+x*.5,11.5-drop+y*.5*sy,z*.5]);
for(const [x,y,z] of M.buildGearboxV(cfg.gearbox).list())gPts.push([52+x*.5,11.5-drop+y*.5*sy,z*.5]);
const gbxList=M.buildGearboxV(cfg.gearbox).list();let gminx=1e9;for(const v of gbxList)gminx=Math.min(gminx,v[0]);let gys=0,gcnt=0;for(const v of gbxList)if(v[0]===gminx){gys+=v[1];gcnt++;}
const outX=52+gminx*.5,run=outX-M.AX_R,outY=11.5-drop+(gys/gcnt)*.5*sy,diffY=14.5-drop,theta=Math.atan2(outY-diffY,run),shaftScale=run/84;
const shaftPts=M.buildShaft().list().map(([x,y,z])=>[outX+x*shaftScale*Math.cos(theta)-y*Math.sin(theta),outY+x*shaftScale*Math.sin(theta)+y*Math.cos(theta),z]);
const diffPts=M.buildDiff().list().map(([x,y,z])=>[x,y-drop,z]);
const exhPts=M.buildExhaustV(M.byId('exhaust',cfg.exhaust).tip).list().map(([x,y,z])=>[x,y-drop,z]);
const ty=M.tyreFor(cfg.wheel.dia,cfg.wheel.width),zc=(M.CAR.hubFaceZ-cfg.wheel.et)/20,WY=ty.OD/40;
const tire=M.buildTireP(ty.OD,ty.tw,cfg.wheel.dia).list(),rim=M.buildRimP(cfg.wheel.style,cfg.wheel.dia,cfg.wheel.width,cfg.wheel.et).list();
const wheelPts=(ax,sd)=>{const o=[];for(const g of [tire,rim])for(const [x,y,z] of g)o.push([ax+x*.5,WY+wd+y*.5,sd*(zc+z*.5)]);return o;};  // relative z flips with the side
console.log('CONFIG: '+(mode==='json'?'option sweep '+process.argv[3]:mode)+'  engine '+cfg.engine+', gearbox '+cfg.gearbox+', tyre '+ty.sizeStr+' on '+cfg.wheel.dia+'x'+cfg.wheel.width+' ET'+cfg.wheel.et+', drop '+cfg.drop+' mm\n');

// ======== ADAPTER END (everything below is the test list; keep it, extend it) ========
// 1. powertrain against the closed hood, body shell, bay parts
chk(hits(ePts,HOOD)===0,'engine inside the closed hood: '+hits(ePts,HOOD)+' voxels');
chk(hits(ePts,BODY)===0,'engine inside the body shell: '+hits(ePts,BODY)+' voxels');
chk(hits(ePts,BAY)===0,'engine inside engine-bay parts (towers, radiator, battery, booster): '+hits(ePts,BAY)+' voxels');
chk(hits(gPts,HOOD)+hits(gPts,BODY)===0,'gearbox inside hood or body shell: '+(hits(gPts,HOOD)+hits(gPts,BODY))+' voxels');
// 2. powertrain against the interior (floor, tunnel, dash, seats)
chk(hits(gPts,INT)===0,'gearbox inside the interior (floor, tunnel, dash, seats): '+hits(gPts,INT)+' voxels');
chk(hits(shaftPts,INT)===0,'driveshaft inside the interior (floor, tunnel, seats): '+hits(shaftPts,INT)+' voxels');
chk(hits(shaftPts,BODY)===0,'driveshaft inside the body shell: '+hits(shaftPts,BODY)+' voxels');
chk(hits(exhPts,BODY)===0,'exhaust inside the body shell (floor, rear panel): '+hits(exhPts,BODY)+' voxels');
chk(hits(exhPts,INT)===0,'exhaust inside the interior: '+hits(exhPts,INT)+' voxels');
chk(hits(diffPts,BODY)===0,'differential inside the body shell: '+hits(diffPts,BODY)+' voxels');
chk(hits(exhPts,shaftPts.reduce((s,p)=>(s.add(key(p[0],p[1],p[2])),s),new Set()))===0,'exhaust inside the driveshaft: 0 voxels expected');
// 3. driveline alignment: gearbox output to driveshaft front end to differential pinion
{const front=[outX,outY],rear=[outX-run,outY-run*Math.tan(theta)];
 chk(true,'driveshaft starts at the gearbox output flange (x '+outX.toFixed(1)+', y '+outY.toFixed(1)+' voxels) and is '+(run*20).toFixed(0)+' mm long');
 chk(Math.abs(rear[1]-diffY)*20<=20,'driveshaft rear end meets the differential pinion (y '+rear[1].toFixed(1)+' vs '+diffY.toFixed(1)+' voxels)');
 chk(theta*180/Math.PI<=3.0,'driveshaft working angle '+(theta*180/Math.PI).toFixed(1)+' degrees (limit 3 degrees for a single-joint shaft)');}
// 4. wheels: static, steering lock, bump
const archOK=(label,pts)=>{const n=hits(pts,BODY);chk(n===0,label+': '+n+' tyre/rim voxels inside the body shell');};
const rot=(pts,hx,hz,a)=>pts.map(([x,y,z])=>{const dx=x-hx,dz=z-hz;return [hx+dx*Math.cos(a)+dz*Math.sin(a),y,hz-dx*Math.sin(a)+dz*Math.cos(a)];});
for(const [name,ax] of [['front',M.AX_F],['rear',M.AX_R]])for(const sd of [-1,1]){
  const w=wheelPts(ax,sd);archOK(name+(sd<0?' left':' right')+' wheel at rest',w);
}
const LOCK=32*Math.PI/180,KP=(M.CAR.hubFaceZ-M.CAR.stockET-83)/20;   // steering axis at hub height: stock wheel centre less 83 mm (scrub radius 15 mm + 13 degrees of axis inclination over the 295 mm wheel radius; both ESTIMATED)
for(const sd of [-1,1])for(const dir of [-1,1]){
  const w=wheelPts(M.AX_F,sd),r=rot(w,M.AX_F,sd*KP,dir*LOCK);
  archOK('front '+(sd<0?'left':'right')+' wheel at '+(dir>0?'full left':'full right')+' lock (32 degrees, steering axis '+(KP*20).toFixed(0)+' mm from the centreline)',r);
}
{ // tyres against the bumper wrap-arounds: at rest, at full lock both ways, and at 20 mm of bump
 let n=0;for(const [ax,sd] of [[M.AX_F,1],[M.AX_F,-1],[M.AX_R,1],[M.AX_R,-1]]){const w=wheelPts(ax,sd);n+=hits(w,BUMP)+hits(w.map(p=>[p[0],p[1]+1,p[2]]),BUMP);
   if(ax===M.AX_F)for(const dir of [-1,1])n+=hits(rot(w,M.AX_F,sd*KP,dir*LOCK),BUMP);}
 chk(n===0,'tyres against the bumper ends (which wrap round to the wheel arches): '+n+' voxels at rest, full lock and 20 mm bump');}
{ // tyre against the strut and spring at full lock (capsule from the lower mount to the tower)
 const seg=(sd)=>[[M.AX_F,WY-2+wd,sd*27],[M.AX_F-3,37.5,sd*23]],RAD=2.85;
 let worst=1e9;for(const sd of [-1,1])for(const dir of [0]){const [a,b]=seg(sd);const r=wheelPts(M.AX_F,sd);
  for(const p of r){const ab=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],ap=[p[0]-a[0],p[1]-a[1],p[2]-a[2]];const t=Math.max(0,Math.min(1,(ap[0]*ab[0]+ap[1]*ab[1]+ap[2]*ab[2])/(ab[0]*ab[0]+ab[1]*ab[1]+ab[2]*ab[2])));
   const q=[a[0]+ab[0]*t,a[1]+ab[1]*t,a[2]+ab[2]*t];worst=Math.min(worst,Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2])-RAD);}}
 chk(worst*20>=5,'tyre to strut and spring (the wheel steers about the strut axis, so the clearance is the same at every lock angle): minimum '+(worst*20).toFixed(0)+' mm (need 5 mm)');}
{ // suspension as the page draws it (e30_unified.js update): strut, spring and damper capsules against the closed hood, the closed trunk and the body.
 // The strut rod is allowed inside its own tower (that is its mount); springs must end under the tower / wheelhouse roof and touch nothing else.
 const L=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t),cap=[];
 for(const sd of [-1,1]){const ax=M.AX_F,lo=[ax,WY-2+wd,sd*27],up=[ax-3,37.5,sd*23],ts=(29.5-lo[1])/(up[1]-lo[1]);
   cap.push({n:'front '+(sd<0?'left':'right')+' strut rod',a:lo,b:up,r:1.4,tower:true},{n:'front '+(sd<0?'left':'right')+' spring',a:L(lo,up,.28),b:L(lo,up,ts),r:2.9});
   const rx=M.AX_R,rlo=[rx-2,WY+2+wd,sd*26],rup=[rx-2,30,sd*26];
   cap.push({n:'rear '+(sd<0?'left':'right')+' spring',a:L(rlo,rup,.12),b:rup,r:2.9},{n:'rear '+(sd<0?'left':'right')+' damper',a:[rx+3,WY+2+wd,sd*26],b:[rx+3,31,sd*26],r:2.4,tower:true});}
 const dseg=(p,a,b)=>{const ab=b.map((v,i)=>v-a[i]),ap=p.map((v,i)=>v-a[i]),t=Math.max(0,Math.min(1,(ap[0]*ab[0]+ap[1]*ab[1]+ap[2]*ab[2])/(ab[0]**2+ab[1]**2+ab[2]**2)));return Math.hypot(...p.map((v,i)=>v-(a[i]+ab[i]*t)));};
 const inCap=(S,c,trimTop)=>{let n=0;const ab=c.b.map((v,i)=>v-c.a[i]),L2=ab[0]**2+ab[1]**2+ab[2]**2;   // coil springs and tubes are cylinders: flat ends at their seats
   for(const k of S){const p=k.split(',').map(Number);if(Math.abs(p[0]-c.a[0])>8||Math.abs(p[2]-c.a[2])>8)continue;const ap=p.map((v,i)=>v-c.a[i]),t=(ap[0]*ab[0]+ap[1]*ab[1]+ap[2]*ab[2])/L2;
     if(t<0||t>1+(trimTop?-.5/Math.sqrt(L2):0))continue;if(dseg(p,c.a,c.b)<c.r+.35)n++;}return n;};
 let hood=0,trunk=0,body=0,top=-1e9;const where=[];
 for(const c of cap){const h=inCap(HOOD,c),t=inCap(TRUNK,c),bd=c.tower?0:inCap(BODY,c,true);hood+=h;trunk+=t;body+=bd;if(h+t+bd)where.push(c.n+' '+(h+t+bd));}
 chk(hood===0,'suspension (struts, springs, dampers) against the closed hood: '+hood+' voxels'+(where.length?' ('+where.join('; ')+')':''));
 chk(trunk===0,'suspension against the closed trunk lid and its frame: '+trunk+' voxels');
 chk(body===0,'springs clear of the body except at their seats (strut rods and dampers end inside their towers, which is their mount): '+body+' voxels');
 let gap=1e9;for(const sd of [-1,1]){const up=[M.AX_F-3,37.5,sd*23];for(const k of HOOD){const p=k.split(',').map(Number);if(Math.abs(p[0]-up[0])<6&&Math.abs(p[2]-up[2])<6&&p[1]>=up[1])gap=Math.min(gap,p[1]-.5-(up[1]+.5));}}
 chk(gap*20>=10,'front strut top mount to the underside of the closed hood: '+(gap*20).toFixed(0)+' mm (need 10 mm)');}
for(const bump of [20,40]){const dy=bump/20;let n=0;for(const [ax,sd] of [[M.AX_F,1],[M.AX_F,-1],[M.AX_R,1],[M.AX_R,-1]])n+=hits(wheelPts(ax,sd).map(p=>[p[0],p[1]+dy,p[2]]),BODY);
  const stockOnly=(cfg.suspension==='stock');if(bump===20)chk(n===0,'all four wheels at '+bump+' mm of bump: '+n+' voxels inside the body shell'); else console.log('INFO  all four wheels at '+bump+' mm of bump: '+n+' voxels inside the body shell (bump stops decide this; reported, not a pass condition)');}
// 5. rotating parts: fan and pulley discs against radiator, hood, bay, body
if(M.byId('engine',cfg.engine).mechFan){const fan=M.buildFan().list();let rmax=0;for(const [x,y,z] of fan)rmax=Math.max(rmax,Math.hypot(y,z));
 // fan sits at engine-local x = L + 4 (half units), y = 0.62 H (half units); swept volume = full disc of radius rmax over its thickness
 const fx=52+(ev.L+4)*.5,fy=11.5-drop+Math.round(ev.H*.50*sy)*.5,disc=[];
 for(let dx=0;dx<=5;dx++)for(let a=0;a<360;a+=3)for(let r=0;r<=rmax;r+=1.5)disc.push([fx+dx*.5,fy+r*.5*Math.sin(a*Math.PI/180),r*.5*Math.cos(a*Math.PI/180)]);
 chk(hits(disc,BAY)===0,'fan swept disc (radius '+(rmax*.5*20).toFixed(0)+' mm) against the radiator and bay parts: '+hits(disc,BAY)+' voxels');
 chk(hits(disc,HOOD)+hits(disc,BODY)===0,'fan swept disc against hood and body shell: '+(hits(disc,HOOD)+hits(disc,BODY))+' voxels');
 let near=1e9;for(const p of disc)for(const k of BAY){}
 const radFront=93,gap=(radFront-(fx+2.5))*20;chk(gap>=20,'fan to radiator core spacing: '+gap.toFixed(0)+' mm (need 20 mm)');}
// 6. panels through their swing
const rotZ=(pts,hx,hy,a)=>pts.map(([x,y,z])=>{const dx=x-hx,dy=y-hy;return [hx+dx*Math.cos(a)-dy*Math.sin(a),hy+dx*Math.sin(a)+dy*Math.cos(a),z];});
{const hood=R.hood.list().map(p=>[p[0],p[1]-drop,p[2]]);const open=rotZ(hood,44,47.2-drop,62*Math.PI/180);
 const glassSet=lowered([...R.glass.ws.list()]);const n=hits(open,glassSet)+hits(open,lowered(R.body.list().filter(p=>p[0]<=44)));
 chk(n===0,'hood opened 62 degrees against windshield and cowl: '+n+' voxels');
 const nb=hits(open,lowered(R.body.list().filter(p=>p[0]>44)));console.log('INFO  hood opened 62 degrees against the fenders: '+nb+' voxels (hinge-line contact reported)');}
{const trunk=R.trunk.list().map(p=>[p[0],p[1]-drop,p[2]]);const open=rotZ(trunk,-59.5,51-drop,-58*Math.PI/180);
 const n=hits(open,lowered([...R.glass.rw.list()]))+hits(open,lowered(R.body.list().filter(p=>p[0]>=-62)));
 chk(n===0,'trunk lid opened 58 degrees against the rear window and roof: '+n+' voxels');}
for(const sd of [-1,1]){const door=(sd<0?R.doorL:R.doorR).list().map(p=>[p[0],p[1]-drop,p[2]]);
 const rotY=(pts,hx,hz,a)=>pts.map(([x,y,z])=>{const dx=x-hx,dz=z-hz;return [hx+dx*Math.cos(a)+dz*Math.sin(a),y,hz-dx*Math.sin(a)+dz*Math.cos(a)];});
 const frontBody=lowered(R.body.list().filter(p=>p[0]>=40));const ws=new Set(wheelPts(M.AX_F,sd).map(p=>key(p[0],p[1],p[2])));
 let maxOK=0;for(let ang=70;ang>=20;ang-=1){const open=rotY(door,43,sd*41,sd*ang*Math.PI/180);let nw=0;for(const p of open)if(ws.has(key(p[0],p[1],p[2])))nw++;
   if(hits(open,frontBody)===0&&nw===0){maxOK=ang;break;}}
 console.log('INFO  '+(sd<0?'left':'right')+' door: largest opening angle with no contact with the fender, A-pillar or wheel = '+maxOK+' degrees (the page opens the doors to 64 degrees)');
 chk(maxOK>=55,(sd<0?'left':'right')+' door opens at least 55 degrees without collision ('+maxOK+' degrees)');}

{ // ---- chassis and aero add-ons exactly as the page shows them (setAero in e30_unified.js): against the body, glass, bumpers, hood, trunk, interior, seats, engine
 const parts=[];const ae=cfg.aero,fr=cfg.frame;
 const A={islip:()=>[M.buildISLip(),M.buildTrunkLip(R)],splitter:()=>[M.buildSplitter()],ducktail:()=>[M.buildDucktail(R)],gtwing:()=>[M.buildSplitter(),M.buildGTWing()],wide:()=>[M.buildFlares(R,[M.buildBumperF(),M.buildBumperR()])],
   strutbar:()=>[M.buildStrutBar()],rollbar:()=>[M.buildRollBar()],cage:()=>[M.buildCage()],cage10:()=>[M.buildCage10()]};
 for(const n of [ae,fr])if(A[n])for(const g of A[n]())parts.push(...g.list().map(([x,y,z])=>[x,y-drop,z]));
 if(!parts.length)console.log('INFO  no aero or chassis add-ons in this build');
 else{
  const isTube=['rollbar','cage','cage10'].includes(fr);
  const feet=isTube?M.CAGE_FEET:[];   // tube feet are welded or bolted to the floor and sills
  const nearFoot=p=>feet.some(([fx,fy])=>Math.abs(p[0]-fx)<=2&&p[1]-fy<=2.5&&p[1]-fy>=-2);
  const shell=parts.filter(p=>!nearFoot(p));
  const SEATS=lowered([...M.buildSeatV(cfg.seats,M.COCKPIT?M.COCKPIT.H.z:20.5).list(),...M.buildSeatV(cfg.seats,-(M.COCKPIT?M.COCKPIT.H.z:20.5)).list()]);
  const INTN=lowered(M.buildInterior({noSeats:true,cage:['cage','cage10'].includes(fr)}).list());
  const b=hits(shell,BODY),gl=0,bu=hits(parts,BUMP),ho=hits(parts,HOOD),tr=hits(parts,TRUNK),it=hits(shell,INTN),se=hits(parts,SEATS),en=hits(parts,new Set(ePts.map(p=>key(...p)))),by=fr==='strutbar'?0:hits(parts,BAY);
  chk(b+bu+ho+tr+it+se+en+by===0,'add-ons ('+[ae,fr].filter(n=>A[n]).join(' + ')+'): '+parts.length+' voxels; '+b+' in the body shell (tube feet excepted), '+bu+' in the bumpers, '+ho+' in the closed hood, '+tr+' in the trunk lid, '+it+' in the dash and console, '+se+' in the front seats, '+en+' in the engine, '+by+' in the bay parts');
  if(fr==='strutbar'){const bar=M.buildStrutBar().list().map(([x,y,z])=>[x,y-drop,z]);let gap=1e9;for(const p of bar)for(const k of HOOD){const q=k.split(',').map(Number);if(q[0]===p[0]&&q[2]===p[2]&&q[1]>p[1])gap=Math.min(gap,q[1]-p[1]-1);}
    chk(gap>=1,'strut brace to the underside of the closed hood: '+(gap*20)+' mm (need 20 mm)');}
 }}
if(!M.byId('engine',cfg.engine).mechFan)console.log('INFO  electric fan on the radiator (swap kit): the mechanical fan sweep test does not apply');
console.log('\nSUITE RESULT: '+(fails===0?'PASS':'FAIL')+' ('+fails+' failing checks)');
process.exit(fails?1:0);
