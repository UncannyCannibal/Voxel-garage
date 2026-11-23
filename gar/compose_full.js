// FULL composite of what the page shows, for the unified renderer. node compose_full.js <name> [all|cutaway|doorsopen|crop:x0,x1,y0,y1,z0,z1]
const fs=require('fs');
let src=['e30_core.js','e30_parts.js','e30_shop_parts.js','modshop.js','e30_detail.js'].map(f=>fs.readFileSync(__dirname+'/'+f,'utf8').replace(/if\(typeof module[\s\S]*$/,'')).join('\n');
src+=';return {buildShifter,buildDashDetail,DASH_DETAIL_POS,TAIL_POS,byId,buildSplitter,buildDucktail,buildGTWing,buildFlares,buildCage,PAINT,COL,buildE30Body,buildBumperF,buildBumperR,buildHeadlamp,buildKidney,buildTaillamp,buildPlate,buildHandle,buildBay,buildInterior,buildDiff,buildShaft,buildSeatV,buildRearBench,buildSteeringWheelV,buildTireP,buildRimP,buildRotorP,buildCaliperP,buildEngineV,buildGearboxV,buildExhaustV,buildCage,tyreFor,byId,defaultCfg,AX_F,AX_R,CAR,buildBadges,buildKidneyFitted,frontLamps,PLATE_F,PLATE_R,HEAD_POS,KID_POS,bumperFront,bumperRear,buildDoorCard,buildDoorMirror,buildInteriorMirror,buildVisor};';
const M=new Function(src)();
function compose(cfg,opt){
  opt=opt||{};const out=[],paint=0xb3221e,col=c=>c===M.PAINT?paint:c,doorA=(opt.doors||0)*Math.PI/180;
  const add=(g,s,ox,oy,oz)=>{for(const [x,y,z,c] of g.list())out.push([ox+x*s,oy+y*s,oz+z*s,s,col(c)]);};
  const addH=(g,ox,oy,oz,sz)=>{for(const [x,y,z,c] of g.list())out.push([ox+x*.5,oy+y*.5,oz+(sz||1)*z*.5,.5,col(c)]);};
  const r=M.buildE30Body();
  // door group: everything that rides on a door is rotated about its hinge (x 43, z = sd*41)
  const onDoor=(sd,pts)=>{const a=sd*doorA;return pts.map(([x,y,z,s,c])=>{const dx=x-43,dz=z-sd*41;return [43+dx*Math.cos(a)+dz*Math.sin(a),y,sd*41-dx*Math.sin(a)+dz*Math.cos(a),s,c];});};
  // the exterior is a 10 mm grid: hi cell i sits at world i/2, size .5 (same as the page: e30_unified.js)
  const addA=g=>{for(const [x,y,z,c] of g.list())out.push([x*.5,y*.5,z*.5,.5,col(c)]);};
  for(const k of ['body','trunk','hood'])addA(r.hi[k]);
  for(const k of ['ws','rw','qgL','qgR'])addA(r.hi.glass[k]);
  for(const sd of [-1,1]){
    const dp=[];const DG=sd<0?r.hi.doorL:r.hi.doorR,door=sd<0?r.doorL:r.doorR;
    const skinZ=(x,y)=>{const I=Math.round(x*2),J=Math.round(y*2);for(let k=88;k>=0;k--)if(DG.get(I,J,sd*k)>=0||r.hi.body.get(I,J,sd*k)>=0)return k/2;return 0;};
    for(const [x,y,z,c] of DG.list())dp.push([x*.5,y*.5,z*.5,.5,col(c)]);for(const [x,y,z,c] of (sd<0?r.hi.glass.dgL:r.hi.glass.dgR).list())dp.push([x*.5,y*.5,z*.5,.5,c]);
    for(const [x,y,z,c] of M.buildDoorCard(sd,door).list())dp.push([x*.5,y*.5,z*.5,.5,c]);
    const m=M.buildDoorMirror(sd,skinZ);for(const g of [m.shell,m.glass])for(const [x,y,z,c] of g.list())dp.push([x*.5,y*.5,z*.5,.5,col(c)]);
    const h=M.buildHandle(),th=sd>0?-Math.PI/2:Math.PI/2,hs=skinZ(-5,44.2),hp=[sd>0?-5:-12,44.2,sd*(hs-.2)];
    for(const [x,y,z,c] of h.list())dp.push([hp[0]+(x*Math.cos(th)+z*Math.sin(th)),hp[1]+y,hp[2]+(-x*Math.sin(th)+z*Math.cos(th)),1,c]);
    out.push(...onDoor(sd,dp));
    addH(M.buildHeadlamp(sd),M.HEAD_POS[0],M.HEAD_POS[1],sd*M.HEAD_POS[2]);addH(M.buildKidneyFitted(r,sd),M.KID_POS[0],M.KID_POS[1],sd*M.KID_POS[2]);const t=M.buildTaillamp(sd);for(const k of ['frame','red','amb','wht'])addH(t[k],M.TAIL_POS[0],M.TAIL_POS[1],sd*M.TAIL_POS[2]);
    const v=M.buildVisor(r,sd);addH(v.grid,...v.pos);
  }
  addA(M.bumperFront());addA(M.bumperRear());addH(M.buildPlate(true),...M.PLATE_F);addH(M.buildPlate(false),...M.PLATE_R);
  for(const L of M.frontLamps())addH(L.lens(),...L.pos);
  for(const it of M.buildBadges(r))addA(it.grid);
  const im=M.buildInteriorMirror(r);addH(im.shell,...im.pos);addH(im.glass,...im.pos);
  add(M.buildInterior({noSeats:true}),1,0,0,0);addH(M.buildDashDetail(),...M.DASH_DETAIL_POS);addH(M.buildShifter(),15,25.5,0);
  {const g=M.buildSteeringWheelV(380,'stock'),n=[-.906,.423,0],l=Math.hypot(...n);n[0]/=l;n[1]/=l;const ax=[-n[1],n[0],0],al=Math.hypot(...ax),k=ax.map(v=>v/al),ang=Math.acos(n[2]),c=Math.cos(ang),s=Math.sin(ang);
   for(const [x,y,z,c0] of g.list()){const v=[x*.5,y*.5,(z-1.5)*.5],dot=k[0]*v[0]+k[1]*v[1]+k[2]*v[2],cr=[k[1]*v[2]-k[2]*v[1],k[2]*v[0]-k[0]*v[2],k[0]*v[1]-k[1]*v[0]];
     out.push([14+v[0]*c+cr[0]*s+k[0]*dot*(1-c),45.5+v[1]*c+cr[1]*s+k[1]*dot*(1-c),-20.5+v[2]*c+cr[2]*s+k[2]*dot*(1-c),.5,c0]);}}
  add(M.buildBay({radShift:cfg.engine==='2JZGTE'?2:0,notch:cfg.engine==='LS3',relocate:cfg.engine==='LS3'}),1,0,0,0);add(M.buildDiff(),1,0,0,0);add(M.buildExhaustV(M.byId('exhaust',cfg.exhaust).tip),1,0,0,0);
  for(const sd of [-1,1])add(M.buildSeatV(cfg.seats,sd*20.5),1,0,0,0);if(cfg.frame!=='cage')add(M.buildRearBench(r.body),1,0,0,0);
  const ev=M.buildEngineV(cfg.engine);let my=0;for(const v of ev.grid.list())my=Math.max(my,v[1]);const sy=Math.min(1,(36-11.5)/(my*.5));
  for(const g of [ev.grid,M.buildGearboxV(cfg.gearbox)])for(const [x,y,z,c] of g.list())out.push([52+x*.5,11.5+y*.5*sy,z*.5,.5,c]);
  const ty=M.tyreFor(cfg.wheel.dia,cfg.wheel.width),zc=(M.CAR.hubFaceZ-cfg.wheel.et)/20;
  const T=M.buildTireP(ty.OD,ty.tw,cfg.wheel.dia),Rm=M.buildRimP(cfg.wheel.style,cfg.wheel.dia,cfg.wheel.width,cfg.wheel.et),br=M.byId('brakes',cfg.brakes),RO=M.buildRotorP(br.rotor),CA=M.buildCaliperP(br.rotor,br.id==='bbk6'?'6pot':br.id==='bbk4'?'4pot':'stock');
  for(const ax of [M.AX_F,M.AX_R])for(const sd of [-1,1])for(const g of [T,Rm,RO,CA])for(const [x,y,z,c] of g.list())out.push([ax+x*.5,ty.OD/40+y*.5,sd*(zc+z*.5),.5,c]);
  if(cfg.aero==='splitter'||cfg.aero==='gtwing')add(M.buildSplitter(),1,0,0,0);if(cfg.aero==='ducktail')add(M.buildDucktail(r),1,0,0,0);
  if(cfg.aero==='gtwing')add(M.buildGTWing(),1,0,0,0);if(cfg.aero==='wide')add(M.buildFlares(r,[M.buildBumperF(),M.buildBumperR()]),1,0,0,0);if(cfg.frame==='cage')add(M.buildCage(),1,0,0,0);
  return out;
}
module.exports={compose,M};
if(require.main===module){
  const name=process.argv[2]||'full',mode=process.argv[3]||'all',cfg=M.defaultCfg();
  if(mode==='modded'){Object.assign(cfg,{engine:'S14B23',gearbox:'G265',diff:'lsd410',exhaust:'catback',seats:'bucket',steering:'small',suspension:'coil',drop:30,brakes:'bbk6',aero:'wide',frame:'cage'});cfg.wheel={style:'dish',dia:18,width:9,et:16,pcd:'4x100'};}   // the track widebody preset
  let v=compose(cfg,{doors:mode==='doorsopen'||mode.startsWith('open')?64:0});
  if(mode==='cutaway')v=v.filter(p=>p[2]<=0.01);
  if(mode.includes('crop:')){const [x0,x1,y0,y1,z0,z1]=mode.split('crop:')[1].split(',').map(Number);v=v.filter(p=>p[0]>=x0&&p[0]<=x1&&p[1]>=y0&&p[1]<=y1&&p[2]>=z0&&p[2]<=z1);}
  fs.writeFileSync(name+'.json',JSON.stringify({name,unit_mm:20,voxels:v}));console.log(name,v.length,'voxels');
}
