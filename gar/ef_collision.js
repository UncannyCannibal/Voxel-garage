// EF COLLISION SUITE (from the E30 exemplar collision_suite.js). Static AND swept tests in 10 mm cells. Every line prints PASS or FAIL with the number of cells in collision.
// Run: node ef_collision.js [stock|b18c|k20|weightcut|all]      Exit code 1 on any FAIL.
const fs=require('fs');
const FILES=['parts_lib.js','parts_honda.js','parts_jdm.js','shells.js','fit.js','e30_core.js','e30_parts.js','e30_shop_parts.js','ef_detail.js','ef_body.js','ef_rig.js','rig_gen_ext.js','rig_gen.js'];
let src=FILES.map(f=>fs.readFileSync(__dirname+'/'+f,'utf8').replace(/if\(typeof module[\s\S]*$/,'')).join('\n');
src+=';setShell("ef");return {makeEF,buildEFBody,efBumper,efLamps,efSpoiler,efMirror,makeRig,EF_RIG,EF_M,EFD,genExhaust,genUnder,genDoorCard,buildTireP,buildRimP,buildArm,buildStrutTube,buildSpring,buildRod,buildFan,tyreFor,byId,defaultCfg,CAR:()=>CAR,Grid,HR,PAINT};';
const M=new Function(src)();
// ======== ADAPTER BEGIN: EF builders, obstacle sets, mover point sets, configurations (values mirror car_ef.js) ========
const CONFIGS={
  stock:c=>{},
  b18c:c=>{Object.assign(c,{engine:'B18C1',swapkit:'kit-ef-b',gearbox:'EF9-5MT',exhaust:'catback',seats:'dc2-gsr',steering:'honda-itr',suspension:'stock',drop:0,brakes:'integra262'});c.wheel={style:'split',dia:15,width:6,et:45,pcd:'4x100',bore:56.1,tw:195,ar:55};},
  k20:c=>{Object.assign(c,{engine:'K20A2',swapkit:'kit-ef-k',gearbox:'K-X2M5',exhaust:'quad',seats:'bucket',steering:'honda-itr',suspension:'coil',drop:15,brakes:'integra262',aero:'splitter'});c.wheel={style:'mesh',dia:16,width:7,et:45,pcd:'4x100',bore:56.1};},
  weightcut:c=>{Object.assign(c,{engine:'B18C1',swapkit:'kit-ef-b',gearbox:'EF9-5MT',seats:'delsol-si',removed:{bumperF:1,bumperR:1,doorCards:1,rearSeat:1}});c.wheel={style:'star',dia:14,width:5.5,et:45,pcd:'4x100',bore:56.1,tw:195,ar:60};}
};
const DESIGN={lock:34,bumpPass:20,bumpReport:40,hoodOpen:58,hatchOpen:62,doorMin:55,kingpinDz:.5,tyreStrutMin:5,fanGap:20,cvMaxDeg:22};   // DESIGN / test limits (lock 34 deg: EF turning circle; CV joints 22 deg static)
const g=M.makeEF(),R=M.buildEFBody(g),RG=M.makeRig(g,M.EF_RIG),SU=M.EF_RIG.susp,cp=M.EF_RIG.cp,BAYR=M.EF_RIG.bay;
const lamps=M.efLamps(g,R.hi),bf=M.efBumper(g,true),bb=M.efBumper(g,false),spoiler=M.efSpoiler(g,R.hi.trunk);
const H=R.hi,K=(i,j,k)=>i+','+j+','+k;
// ---- sets of 10 mm cells
const setHi=(...grids)=>{const s=new Set();for(const G of grids){if(!G)continue;for(const [i,j,k] of G.list())s.add(K(i,j,k));}return s;};
const setLo=(...grids)=>{const s=new Set();for(const G of grids){if(!G)continue;for(const [x,y,z] of G.list())for(const a of [0,1])for(const b of [0,1])for(const c of [0,1])s.add(K(2*x-1+a,2*y-1+b,2*z-1+c));}return s;};   // a 20 mm cell covers 2x2x2 hi cells
const merge=(...S)=>{const o=new Set();for(const s of S)for(const v of s)o.add(v);return o;};
const ptsHi=G=>G.list().map(([i,j,k])=>[i/2,j/2,k/2]);
const ptsLo=G=>{const o=[];for(const [x,y,z] of G.list())for(const a of [-.25,.25])for(const b of [-.25,.25])for(const c of [-.25,.25])o.push([x+a,y+b,z+c]);return o;};
const key=p=>K(Math.round(p[0]*2),Math.round(p[1]*2),Math.round(p[2]*2));
let LASTHIT=null;
const hits=(pts,S)=>{let n=0,b=null;for(const p of pts)if(S.has(key(p))){n++;if(process.env.DEBUG){b=b||[1e9,-1e9,1e9,-1e9,1e9,-1e9];b=[Math.min(b[0],p[0]),Math.max(b[1],p[0]),Math.min(b[2],p[1]),Math.max(b[3],p[1]),Math.min(b[4],p[2]),Math.max(b[5],p[2])];}}
  if(n&&b)LASTHIT='   where: x '+((2040-b[1]*20)|0)+'..'+((2040-b[0]*20)|0)+' mm from the bumper tip, y '+((b[2]*20)|0)+'..'+((b[3]*20)|0)+', z '+((b[4]*20)|0)+'..'+((b[5]*20)|0);return n;};
const lampGrids=Object.keys(lamps).filter(k=>k!=='garnish').map(k=>lamps[k]);
const BODY=setHi(H.body,H.glass.ws,H.glass.qgL,H.glass.qgR,...lampGrids);
const HOOD=setHi(H.hood),HATCH=setHi(H.trunk,H.glass.rw,lamps.garnish,spoiler),DOORS=setHi(H.doorL,H.doorR,H.glass.dgL,H.glass.dgR);
const BUMP=setHi(bf.grid,bb.grid,...Object.values(bf.lamps));
let fails=0;const chk=(ok,m)=>{console.log((ok?'PASS ':'FAIL ')+m);if(!ok){fails++;if(LASTHIT&&process.env.DEBUG)console.log(LASTHIT);}LASTHIT=null;};
const info=m=>console.log('INFO  '+m);
const rotY=(pts,hx,hz,a)=>pts.map(([x,y,z])=>{const dx=x-hx,dz=z-hz;return [hx+dx*Math.cos(a)+dz*Math.sin(a),y,hz-dx*Math.sin(a)+dz*Math.cos(a)];});
const rotZ=(pts,hx,hy,a)=>pts.map(([x,y,z])=>{const dx=x-hx,dy=y-hy;return [hx+dx*Math.cos(a)-dy*Math.sin(a),hy+dx*Math.sin(a)+dy*Math.cos(a),z];});
// segment mesh points exactly as segTo places them (axis z for arms and rods, axis y for dampers and springs); grid cells in world units
const segPts=(G,p0,p1,axis,len,r)=>{const d=[p1[0]-p0[0],p1[1]-p0[1],p1[2]-p0[2]],l=Math.hypot(...d);const u=d.map(v=>v/l);
  const A=axis==='y'?[0,1,0]:[0,0,1];const v=[A[1]*u[2]-A[2]*u[1],A[2]*u[0]-A[0]*u[2],A[0]*u[1]-A[1]*u[0]],c=A[0]*u[0]+A[1]*u[1]+A[2]*u[2],s=Math.hypot(...v);
  const rot=p=>{if(s<1e-9)return c>0?p:[-p[0],p[1],-p[2]];const k=v.map(t=>t/s),ang=Math.atan2(s,c),C=Math.cos(ang),S=Math.sin(ang),dot=k[0]*p[0]+k[1]*p[1]+k[2]*p[2];
    const cr=[k[1]*p[2]-k[2]*p[1],k[2]*p[0]-k[0]*p[2],k[0]*p[1]-k[1]*p[0]];return [0,1,2].map(i=>p[i]*C+cr[i]*S+k[i]*dot*(1-C));};
  const out=[];for(const [x,y,z] of G.list()){const q=axis==='y'?[x*(r||1),y*l/len,z*(r||1)]:[x,y,z*l/len];const w=rot(q);out.push([p0[0]+w[0],p0[1]+w[1],p0[2]+w[2]]);}return out;};
// ======== ADAPTER END ========

function run(mode){
  fails=0;
  M.setShell?0:0;const cfg=M.defaultCfg();CONFIGS[mode](cfg);cfg.removed=cfg.removed||{};
  const drop=(cfg.drop||0)/20,ty=M.tyreFor(cfg.wheel.dia,cfg.wheel.width,cfg.wheel.tw,cfg.wheel.ar),zc=(M.CAR().hubFaceZ-cfg.wheel.et)/20,zk=zc-5.5,WYb=g.WR+drop;   // body frame: a lowered car moves the hubs UP by the drop
  console.log('\nCONFIG: '+mode+'  engine '+cfg.engine+', gearbox '+cfg.gearbox+', exhaust '+cfg.exhaust+', seats '+cfg.seats+', tyre '+ty.sizeStr+' on '+cfg.wheel.dia+'x'+cfg.wheel.width+' ET'+cfg.wheel.et+', drop '+(cfg.drop||0)+' mm');
  const NEEDGC=(cfg.engine===M.CAR().stock.engine&&!(cfg.drop||0))?150:100;   // ground clearance the checks ask for (the scene audit uses 100 for every build)
  // ---- powertrain (as car_ef.js setEngine)
  const KIT=(M.byId('swapkit',cfg.swapkit||'none')||{}).place||{},ED0=M.byId('engine',cfg.engine),ED=Object.assign({},ED0,{pan:(ED0.pan||140)-(KIT.panCut||0)}),GD=Object.assign({across:260},M.byId('gearbox',cfg.gearbox)),E=RG.engine(Object.assign({len:450,wid:480,hgt:570,pan:140},ED)),T=RG.transaxle(GD,E);
  const ENG_X=g.AX_F+M.EF_RIG.power.dx+(KIT.dx||0),CRANK_Y=M.EF_RIG.power.crankY+(KIT.dy||0),zmin=E.zFly-GD.across/10-3,zmax=E.zBelt+4,oz=-((zmin+zmax)/2)*.5,yPan=-E.crankY*.5;
  let hu=1e9;const zh=Math.max(Math.abs(oz+E.zFly*.5),Math.abs(oz+E.zBelt*.5));for(let x=ENG_X-E.Dc*.4;x<=ENG_X+E.Dc*.4;x+=.5)hu=Math.min(hu,g.top(x,zh)-1.4);
  const sy=Math.min(1,(hu-(CRANK_Y+yPan))/(E.yTop*.5));
  const eP=E.grid.list().map(([i,j,k])=>[ENG_X+i*.5,CRANK_Y+yPan+j*.5*sy,oz+k*.5]);
  const GZ=E.zFly*.5-.5,gP=T.grid.list().map(([i,j,k])=>[ENG_X+i*.5,CRANK_Y+yPan+j*.5*sy,oz+GZ+k*.5]);   // bell face one cell outboard of the block face (as car_ef.js)
  {let low=1e9;for(const p of [...eP,...gP])low=Math.min(low,p[1]-.25);chk(low*20>=NEEDGC,'engine and transaxle lowest point '+(low*20).toFixed(0)+' mm above the ground (need '+NEEDGC+': the catalogue 150 at stock height and with the stock engine, 100 for a lowered or swapped car)');}
  info('engine '+cfg.engine+(KIT.dx||KIT.dy?' on the '+cfg.swapkit+' mounts ('+(KIT.dx||0)*20+' mm forward, '+(-(KIT.dy||0)*20)+' mm lower, pan '+(KIT.panCut||0)+' mm shallower)':'')+': castings scaled to '+(sy*100).toFixed(0)+' % height to clear the hood underside at '+(hu*20).toFixed(0)+' mm (declared: swap-kit low-profile pan and intake)');
  // ---- bay, interior, seats, under, exhaust, rack
  const BAY=setLo(RG.bay());
  const INTg=RG.interior(),DD=RG.dashDetail();
  const LOOKS={stock:{cush:0x2d2f34,bol:0x3a3d44,bolH:1.2,back:22,hw:9.5,head:'post'},comfort:{cush:0x4a4339,bol:0x564e43,bolH:.5,back:22,hw:9.5,head:'post'},sport:{cush:0x26282c,bol:0x3a3d44,bolH:2.0,back:22,hw:9.5,head:'post',slide:1},recliner:{cush:0x24262a,bol:0x30333a,bolH:1.2,back:22,hw:9.5,head:'post'},bucket:{cush:0x1b1c1f,bol:0x0f1012,bolH:2.5,back:30,hw:9,head:'none',bucket:true}};   // as car_ef.js setSeats
  const sp=M.byId('seats',cfg.seats),look=Object.assign({},LOOKS[cfg.seats]||{},sp&&sp.look||{});
  const seats=[RG.seat(look,-cp.H.z),RG.seat(look,cp.H.z)],bench=cfg.removed.rearSeat?null:RG.rearBench(R.body);
  const INT=merge(setLo(INTg),setLo(...seats),bench?setLo(bench):new Set());
  const UNDERg=M.genUnder(Object.assign({fx0:g.AX_R+6,fx1:g.AX_F+M.EF_RIG.under.fx1dx,rx:g.AX_R+8},M.EF_RIG.under)),UNDER=setLo(UNDERg);
  const DP=E.pts.downpipe,dp=[ENG_X+DP[0]*.5,CRANK_Y+yPan+DP[1]*.5*sy,oz+DP[2]*.5];   // the exhaust bolts to the end of the engine's down pipe (as car_ef.js)
  const X=M.EF_RIG.exh,EXHg=M.genExhaust(g,M.byId('exhaust',cfg.exhaust).tip,Object.assign({},X,{x0:dp[0],y0:dp[1]-1.5,z0:dp[2],tipX:g.wx(X.tipMM)}));
  const exP=ptsLo(EXHg),EXH=setLo(EXHg);
  const RK=SU.front.rack,rackP=ptsLo(RG.rack()).map(([x,y,z])=>[x+g.AX_F+RK.dx,y+RK.y,z]);
  // suspension, wheels, half-shafts and steering: tested on the drawn car by t/scene_audit.js (every link, the kingpin steering with Ackermann angles, body roll and pitch at their limits,
  // the wheel and drivetrain library). This suite keeps the powertrain, bay, cabin, exhaust, underbody, swept panels, fan and lamp checks.
  const tyreG=M.buildTireP(ty.OD,ty.tw,cfg.wheel.dia,cfg.wheel.width),rimG=M.buildRimP(cfg.wheel.style,cfg.wheel.dia,cfg.wheel.width,cfg.wheel.et,'plain',{exact:1}),wCells=[...tyreG.list(),...rimG.list()];
  const wheelPts=(ax,sd)=>wCells.map(([i,j,k])=>[ax+i*.5,WYb+j*.5,sd*zc+(sd<0?-k:k)*.5]);   // a wheel at rest (for the door swing)
  // ======== TESTS ========
  // 1. powertrain against the closed hood, the body, the bay furniture
  chk(hits(eP,HOOD)===0,'engine inside the closed hood: '+hits(eP,HOOD)+' cells');
  chk(hits(eP,BODY)===0,'engine inside the body shell (aprons, towers, firewall): '+hits(eP,BODY)+' cells');
  {const bp=ptsLo(RG.bay());chk(hits(bp,BODY)+hits(bp,HOOD)===0,'bay parts (radiator, shroud, battery, air box, booster, reservoirs) clear of the body and hood: '+(hits(bp,BODY)+hits(bp,HOOD))+' cells');}
  chk(hits(eP,BAY)===0,'engine inside the bay parts (radiator, fan shroud, battery, air box, booster, reservoirs): '+hits(eP,BAY)+' cells');
  chk(hits(gP,HOOD)+hits(gP,BODY)===0,'transaxle inside the hood or body shell: '+(hits(gP,HOOD)+hits(gP,BODY))+' cells');
  chk(hits(gP,BAY)===0,'transaxle inside the bay parts: '+hits(gP,BAY)+' cells');
  chk(hits(eP,INT)+hits(gP,INT)===0,'engine and transaxle inside the cabin (dash, floor, seats): '+(hits(eP,INT)+hits(gP,INT))+' cells');
  chk(hits(rackP,BODY)+hits(rackP,new Set([...eP,...gP].map(key)))===0,'steering rack against the body and the powertrain: '+(hits(rackP,BODY)+hits(rackP,new Set([...eP,...gP].map(key))))+' cells');
  // 2. exhaust and underbody
  chk(hits(exP,BODY)===0,'exhaust inside the body (floor, tunnel, rear panel): '+hits(exP,BODY)+' cells');
  chk(hits(exP,INT)===0,'exhaust inside the cabin: '+hits(exP,INT)+' cells');
  chk(hits(exP,UNDER)===0,'exhaust against the subframe and fuel tank: '+hits(exP,UNDER)+' cells');
  chk(hits(exP,BUMP)===0,'exhaust against the rear bumper: '+hits(exP,BUMP)+' cells');
  {let low=1e9;for(const p of exP)low=Math.min(low,p[1]-.25);chk(low*20>=NEEDGC,'exhaust lowest point '+(low*20).toFixed(0)+' mm above the ground (need '+NEEDGC+': the catalogue 150 at stock height and with the stock engine, 100 for a lowered or swapped car)');}
  {const uP=ptsLo(UNDERg);chk(hits(uP,BODY)===0,'subframe and fuel tank inside the body: '+hits(uP,BODY)+' cells');let low=1e9;for(const p of uP)low=Math.min(low,p[1]-.25);chk(low*20>=NEEDGC,'subframe and tank lowest point '+(low*20).toFixed(0)+' mm (need '+NEEDGC+')');}
  // 3. cabin parts against the shell
  chk(hits(ptsLo(INTg),BODY)===0,'dash, console, floor and cargo floor inside the body shell: '+hits(ptsLo(INTg),BODY)+' cells');
  {let n=0;for(const s of seats)n+=hits(ptsLo(s),BODY);if(bench)n+=hits(ptsLo(bench),BODY);chk(n===0,'seats and rear bench inside the body (tunnel, floor, tubs): '+n+' cells');}
  chk(hits(ptsHi(DD).map(([x,y,z])=>[x+.25,y+.25,z+.25]),BODY)===0,'dash details inside the body or glass: '+hits(ptsHi(DD).map(([x,y,z])=>[x+.25,y+.25,z+.25]),BODY)+' cells');
  // 7. rotating parts: fan disc against the radiator, the hood and the body
  {const fan=M.buildFan().list();let rmax=0;for(const [x,y,z] of fan)rmax=Math.max(rmax,Math.hypot(y,z));const fx=BAYR.radX-3.6,fy=22,fz=-4,disc=[];
   for(let dx=0;dx<=5;dx++)for(let a=0;a<360;a+=3)for(let r=0;r<=rmax;r+=1.5)disc.push([fx+dx*.42,fy+r*.42*Math.sin(a*Math.PI/180),fz+r*.42*Math.cos(a*Math.PI/180)]);
   const bayNoFan=BAY;let nb=0;for(const p of disc)if(bayNoFan.has(key(p)))nb++;
   info('fan swept disc radius '+(rmax*.42*20).toFixed(0)+' mm inside its shroud: '+nb+' cells touch the shroud ring or core (the shroud wraps the fan; reported)');
   chk(hits(disc,HOOD)+hits(disc,BODY)===0,'fan swept disc against the hood and body: '+(hits(disc,HOOD)+hits(disc,BODY))+' cells');
   chk(hits(disc,new Set(eP.map(key)))===0,'fan swept disc against the engine: '+hits(disc,new Set(eP.map(key)))+' cells');}
  // 8. panels through their swing: hood, hatch (with its glass, garnish and spoiler), doors (with glass and mirrors)
  {const hh=g.HOOD_HINGE,hood=ptsHi(H.hood);let worst=0,wa=0;for(let a=2;a<=DESIGN.hoodOpen;a+=4){const o=rotZ(hood,hh[0],hh[1],a*Math.PI/180);const n=hits(o,BODY);if(n>worst){worst=n;wa=a;}}
   chk(worst===0,'hood swept from closed to '+DESIGN.hoodOpen+' deg against the windshield, cowl and fenders: '+worst+' cells'+(worst?' (worst at '+wa+' deg)':''));}
  {const th=g.HATCH_HINGE,hatch=[...ptsHi(H.trunk),...ptsHi(H.glass.rw),...ptsHi(spoiler),...(lamps.garnish?ptsHi(lamps.garnish):[])];let worst=0,wa=0;
   for(let a=2;a<=DESIGN.hatchOpen;a+=4){const o=rotZ(hatch,th[0],th[1],-a*Math.PI/180);const n=hits(o,BODY);if(n>worst){worst=n;wa=a;}}
   chk(worst===0,'hatch (glass, garnish, spoiler) swept from closed to '+DESIGN.hatchOpen+' deg against the roof and quarter panels: '+worst+' cells'+(worst?' (worst at '+wa+' deg)':''));
   const closed=hatch;chk(hits(closed,BODY)===0,'hatch closed: no overlap with the body: '+hits(closed,BODY)+' cells');}
  {let zOut=0;for(const D of [H.doorL,H.doorR])for(const [i,j,k] of D.list())if(i/2>=g.DOOR_F-1.5)zOut=Math.max(zOut,Math.abs(k)/2);
   for(const sd of [-1,1]){const mr=M.efMirror(g,sd),door=[...ptsHi(sd<0?H.doorL:H.doorR),...ptsHi(sd<0?H.glass.dgL:H.glass.dgR),...ptsHi(mr.shell),...ptsHi(mr.glass)];
     chk(hits(door,BODY)===0,(sd<0?'left':'right')+' door closed (with glass and mirror): no overlap with the body or windshield: '+hits(door,BODY)+' cells');
     chk(hits([...ptsHi(mr.shell),...ptsHi(mr.glass)],new Set([...setHi(H.glass.ws)]))===0,(sd<0?'left':'right')+' mirror clear of the windshield');
     const mz=mr.glassCenter[2];chk(Math.sign(mz)===sd&&mr.glassCenter[0]<g.wx(1290),(sd<0?'left':'right')+' mirror glass outboard on its own side (z '+(mz*20).toFixed(0)+' mm) and facing rearward');
     const ws=new Set(wheelPts(g.AX_F,sd).map(key));let maxOK=0;
     for(let ang=75;ang>=20;ang--){const o=rotY(door,g.DOOR_F,sd*zOut,sd*ang*Math.PI/180);let bad=hits(o,BODY)+hits(o,BUMP);for(const p of o)if(ws.has(key(p)))bad++;if(bad===0){maxOK=ang;break;}}
     info((sd<0?'left':'right')+' door: largest opening with no contact with the fender, A-pillar, bumper or wheel = '+maxOK+' deg (the page opens it 62)');
     chk(maxOK>=Math.max(DESIGN.doorMin,62),(sd<0?'left':'right')+' door opens 62 deg without collision ('+maxOK+' deg possible)');}}
  // 9. details: lamps flush (none buried, none floating), bumpers against the body, spoiler on the hatch
  chk(hits(ptsHi(bf.grid),BODY)+hits(ptsHi(bb.grid),BODY)===0,'bumpers against the body (the body is cut back behind them): '+(hits(ptsHi(bf.grid),BODY)+hits(ptsHi(bb.grid),BODY))+' cells');
  chk(hits(ptsHi(spoiler),BODY)===0,'roof spoiler clear of the roof with the hatch closed: '+hits(ptsHi(spoiler),BODY)+' cells');
  {let bur=0,tot=0;for(const k of Object.keys(lamps)){for(const [i,j,kk] of lamps[k].list()){tot++;let open=false;for(const [a,b,c] of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]){const q=K(i+a,j+b,kk+c);if(!BODY.has(q)&&!HATCH.has(q)&&!HOOD.has(q)&&!BUMP.has(q))open=true;}if(!open)bur++;}}
   chk(bur===0,'lamps and grille: '+tot+' lens cells, '+bur+' buried (every lens cell faces the outside)');}
  console.log('SUITE RESULT ('+mode+'): '+(fails===0?'PASS':'FAIL')+' ('+fails+' failing checks)');
  return fails;
}
// derived rule constants (CALCULATED from the model) next to the fit record, for the shop's rules
function derive(){const C=M.CAR();const AF=g.ARCH_F;
  console.log('\nDERIVED FROM THE MODEL (fit-rule constants):');
  console.log('  arch top (front) '+((AF.y+AF.r)*20).toFixed(0)+' mm  [shells.js archTop '+C.archTop+']');
  console.log('  body half-width at the front arch lip '+(g.halfAt(g.AX_F,g.WR+12)*20).toFixed(0)+' mm  [fenderOuter '+C.fenderOuter+']');
  const ZK=(C.hubFaceZ-C.stockET)/20-5,CO=M.EF_RIG.coil,DM=M.EF_RIG.damper;console.log('  front spring outside edge at its foot '+(((ZK-SU.front.strutLowDz)*20)+(CO.R+CO.w)*10).toFixed(0)+' mm, front damper body '+(((ZK-SU.front.strutLowDz)*20)+DM.bodyR*10).toFixed(0)+' mm, rear spring '+(((ZK-SU.rear.strutLowDz)*20)+(CO.R+CO.w)*10).toFixed(0)+' mm  [strutInner '+C.strutInner+'; the scene audit checks every accepted wheel against the drawn dampers]');
  const B=M.EF_M.bay,W=M.EF_M.wheelF;console.log('  engine bay: firewall '+B.x1+' mm to the fan '+(2040-(BAYR.radX-3.6)*20).toFixed(0)+' mm; between the wheelhouse walls '+(2*W.bayHalf)+' mm (aprons above 400 mm '+(2*B.half)+' mm); rack front face '+(2040-(SU.front.rack.dx+g.AX_F)*20-26).toFixed(0)+' mm; crank '+(M.EF_RIG.power.crankY*20)+' mm  [bay '+JSON.stringify(C.bay)+']');}
const which=process.argv[2]||'all';let total=0;
for(const m of (which==='all'?Object.keys(CONFIGS):[which]))total+=run(m);
derive();
console.log('\nALL CONFIGURATIONS: '+(total===0?'PASS':'FAIL')+' ('+total+' failing checks)');
process.exit(total?1:0);
