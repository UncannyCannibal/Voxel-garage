// SCENE AUDIT: tests what the page actually draws. Every mesh in the loaded car keeps the voxel grid it was built from (geometry.userData.src);
// each grid cell is a cube in its mesh's own frame. A part's cells are sampled (one point per 10 mm, at cell centres) and tested against every other
// part's cubes in that part's own frame, so rotated parts (doors, hood, steered wheels, links) are tested exactly as drawn. Contact (faces touching) is
// not a collision; a sample point inside another part's cube is.
// Run: node scene_audit.js [car] [mode]   mode: states (default) | library | all.   Exit code 1 on any FAIL.
const CAR=process.argv[2]||'ef',MODE=process.argv[3]||'states';
(async()=>{
const {w,E,errs,$}=await require('./garage_boot.js')();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
if(E.CARID!==CAR){await E.switchCar(CAR);for(let i=0;i<300&&w.document.getElementById('boot').style.display!=='none';i++)await sleep(200);}
const T=E.THREE,S=E.state,P=E.P;
let fails=0,checks=0;const PF=(ok,m)=>{checks++;console.log((ok?'PASS ':'FAIL ')+m);if(!ok)fails++;};
// ---- part labels: the nearest ancestor that the car module keeps in P (or a wheel part)
function labels(){const L=new Map(),add=(o,k)=>{if(o&&o.isObject3D&&!L.has(o))L.set(o,k);};
  for(const n in E.wheels){const W=E.wheels[n];add(W.tire,'tyre'+n);add(W.rim,'rim'+n);add(W.rot,'rotor'+n);add(W.cal,'caliper'+n);if(W.kn)add(W.kn,'knuckle'+n);}
  for(const k of Object.keys(P)){const v=P[k];if(v&&v.isObject3D)add(v,k);
    else if(Array.isArray(v))v.forEach((o,i)=>{if(o&&o.isObject3D)add(o,k);else if(o&&typeof o==='object')for(const f in o)if(o[f]&&o[f].isObject3D)add(o[f],'link'+(o.nm||i)+'.'+f);});}
  return L;}
const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
// ---- collect the drawn parts in the body frame
function collect(){
  E.scene.updateMatrixWorld(true);const L=labels(),inv=new T.Matrix4().copy(E.body.matrixWorld).invert(),parts=new Map();
  E.carRoot.traverse(o=>{if(!o.isMesh||!o.geometry||!o.geometry.userData||!o.geometry.userData.src||!visible(o))return;
    let lab=null;for(let p=o;p&&!lab;p=p.parent)lab=L.get(p)||null;if(!lab)lab=(o.name||o.parent&&o.parent.name)||'unnamed';
    const M=new T.Matrix4().multiplyMatrices(inv,o.matrixWorld),Mi=new T.Matrix4().copy(M).invert();
    const src=o.geometry.userData.src;if(src.__id===undefined)src.__id=++GID;
    if(!parts.has(lab))parts.set(lab,{name:lab,meshes:[]});parts.get(lab).meshes.push({g:o.geometry.userData.src,sel:o.geometry.userData.sel,M,Mi,o});});
  for(const p of parts.values()){let n=0;for(const m of p.meshes){const ck=m.g.__id+'|'+m.sel+'|'+Array.from(m.M.elements,v=>v.toFixed(4)).join(',');let c=CACHE.get(ck);if(!c){c=pointsOf(m);if(CACHE.size>4000)CACHE.clear();CACHE.set(ck,c);}m.pts=c;n+=m.pts.length/3;}
    const b=[1e9,-1e9,1e9,-1e9,1e9,-1e9];for(const m of p.meshes){const a=m.pts;for(let i=0;i<a.length;i+=3){b[0]=Math.min(b[0],a[i]);b[1]=Math.max(b[1],a[i]);b[2]=Math.min(b[2],a[i+1]);b[3]=Math.max(b[3],a[i+1]);b[4]=Math.min(b[4],a[i+2]);b[5]=Math.max(b[5],a[i+2]);}}
    p.box=b;p.n=n;}
  return parts;}
const PAINT=0x00fe01,CACHE=new Map();   // e30_core.js PAINT (top-level consts of the page are not reachable through w.eval)
let GID=0;
const take=(v,sel)=>v>=0&&(sel===1?(v===PAINT||v===0x00fe02):sel===2?(v!==PAINT&&v!==0x00fe02):true);   // 0x00fe02: shaded paint (shut lines), drawn with the paint
function pointsOf(m){const g=m.g,e=m.M.elements,col=i=>Math.hypot(e[i],e[i+1],e[i+2]),n=[0,4,8].map(i=>Math.max(1,Math.round(col(i)/.5)));   // samples per 10 mm along each local axis
  const off=n.map(k=>Array.from({length:k},(_,i)=>(i+.5)/k-.5)),out=[];let idx=0;
  for(let x=g.x0;x<=g.x1;x++)for(let y=g.y0;y<=g.y1;y++)for(let z=g.z0;z<=g.z1;z++){const v=g.d[idx++];if(!take(v,m.sel))continue;
    for(const a of off[0])for(const b of off[1])for(const c of off[2]){const X=x+a,Y=y+b,Z=z+c;out.push(e[0]*X+e[4]*Y+e[8]*Z+e[12],e[1]*X+e[5]*Y+e[9]*Z+e[13],e[2]*X+e[6]*Y+e[10]*Z+e[14]);}}
  return new Float32Array(out);}
// strictly inside: a point on a cube's face (within 1 % of a cell) is contact, not overlap
const IN=X=>Math.abs(X-Math.round(X))<.49;
function inside(part,x,y,z){for(const m of part.meshes){const e=m.Mi.elements,X=e[0]*x+e[4]*y+e[8]*z+e[12],Y=e[1]*x+e[5]*y+e[9]*z+e[13],Z=e[2]*x+e[6]*y+e[10]*z+e[14];if(IN(X)&&IN(Y)&&IN(Z)&&take(m.g.get(X,Y,Z),m.sel))return true;}return false;}
const overl=(a,b)=>a[0]<=b[1]&&b[0]<=a[1]&&a[2]<=b[3]&&b[2]<=a[3]&&a[4]<=b[5]&&b[4]<=a[5];
function hitsAB(A,B){const b=B.box;let n=0;const hb=[1e9,-1e9,1e9,-1e9,1e9,-1e9],cl=new Map();
  for(const m of A.meshes){const a=m.pts;for(let i=0;i<a.length;i+=3){const x=a[i],y=a[i+1],z=a[i+2];if(x<b[0]-.5||x>b[1]+.5||y<b[2]-.5||y>b[3]+.5||z<b[4]-.5||z>b[5]+.5)continue;
    if(inside(B,x,y,z)){n++;const ck=Math.floor(x/4)+','+Math.floor(y/4)+','+Math.floor(z/4);cl.set(ck,(cl.get(ck)||0)+1);hb[0]=Math.min(hb[0],x);hb[1]=Math.max(hb[1],x);hb[2]=Math.min(hb[2],y);hb[3]=Math.max(hb[3],y);hb[4]=Math.min(hb[4],z);hb[5]=Math.max(hb[5],z);}}}
  return {n,hb,cl};}
// hits grouped in 80 mm bins, the biggest few with their centres (mm)
const clusters=cl=>[...cl.entries()].sort((a,b)=>b[1]-a[1]).slice(0,4).map(([k,v])=>{const [i,j,l]=k.split(',').map(Number);return v+'@('+((i*4+2)*20)+','+((j*4+2)*20)+','+((l*4+2)*20)+')';}).join(' ');
const mm=b=>'x '+(b[0]*20|0)+'..'+(b[1]*20|0)+', y '+(b[2]*20|0)+'..'+(b[3]*20|0)+', z '+(b[4]*20|0)+'..'+(b[5]*20|0)+' mm';
// ---- declared mounts: parts that are fastened into another part (their mount overlaps by design), with the most cells allowed and why
const MOUNTS=require('./scene_mounts.js')[CAR]||[];
const allowed=(a,b)=>{for(const [pa,pb,max,why] of MOUNTS){const ra=new RegExp('^'+pa+'$'),rb=new RegExp('^'+pb+'$');if((ra.test(a)&&rb.test(b))||(ra.test(b)&&rb.test(a)))return {max,why};}return null;};
function audit(label,only){if(typeof only==="string")only=new RegExp(only);{const nanK=['x','z','psi','v','roll','pitch','bodyY'].filter(k=>!isFinite(S[k]));if(nanK.length){PF(false,label+': the car state is not a number ('+nanK.join(', ')+'): every position is meaningless');return {bad:1,parts:[]};}}const parts=[...collect().values()];let bad=0;const lines=[];
  for(let i=0;i<parts.length;i++)for(let j=i+1;j<parts.length;j++){const A=parts[i],B=parts[j];if(only&&!only.test(A.name)&&!only.test(B.name))continue;if(!overl(A.box,B.box))continue;
    const r1=hitsAB(A,B),r2=hitsAB(B,A),n=Math.max(r1.n,r2.n);if(!n)continue;const al=allowed(A.name,B.name),hb=r1.n>=r2.n?r1.hb:r2.hb;
    if(al&&n<=al.max){lines.push('  mount '+A.name+' / '+B.name+': '+n+' cells (allowed '+al.max+': '+al.why+')');continue;}
    bad++;lines.push('  COLLISION '+A.name+' / '+B.name+': '+n+' cells at '+mm(hb)+(al?' (mount allows '+al.max+')':'')+(process.env.CL?'\n      bins '+clusters(r1.n>=r2.n?r1.cl:r2.cl):''));}
  PF(bad===0,label+': '+parts.length+' parts, '+bad+' colliding pairs');if(bad||process.env.VERBOSE)for(const l of lines)if(bad&&l.startsWith('  COLLISION')||process.env.VERBOSE)console.log(l);
  return {bad,parts};}
// ---- measurements on the drawn car: lowest points (world), half-shaft joint angles, tyre to damper gap
function measure(tag,parts,lock){const bw=E.body.matrixWorld.elements,low=re=>{let m=1e9;for(const p of parts.values())if(re.test(p.name))for(const q of p.meshes){const a=q.pts;for(let i=0;i<a.length;i+=3)m=Math.min(m,bw[1]*a[i]+bw[5]*a[i+1]+bw[9]*a[i+2]+bw[13]-.25);}return m*20;};
  if(!lock){const lp=low(/^(engMesh|gbMesh|accMesh|exh|exhTips|under|hoses)$/),dr=E.cfg.drop||0;PF(lp+dr>=100,tag+' drivetrain, exhaust and subframe lowest point '+lp.toFixed(0)+' mm above the ground at '+dr+' mm drop ('+(lp+dr).toFixed(0)+' mm at stock height; need 100 there, catalogue 150: lowering takes clearance away, which the shop warns about)');}
  for(const L of (P.links||[]))if(L.shaft){const q=L.shaft.quaternion,d=new T.Vector3(0,0,1).applyQuaternion(q),inner=Math.atan2(Math.hypot(d.x,d.y),Math.abs(d.z))*180/Math.PI;
    const W=E.wheels[L.nm],ax=new T.Vector3(0,0,1).applyAxisAngle(new T.Vector3(0,1,0),W.st.rotation.y),outer=Math.acos(Math.min(1,Math.abs(d.dot(ax))))*180/Math.PI;
    const li=lock?25:22,lo=47;PF(inner<=li&&outer<=lo,tag+' '+L.nm+' half-shaft joint angles: inner '+inner.toFixed(1)+' deg (limit '+li+'), outer '+outer.toFixed(1)+' deg (limit '+lo+')');}   // DESIGN limits: tripod inner joint 22 static / 25 at lock, fixed outer joint 47 (typical Honda)
  const dam=new Set();for(const p of parts.values())if(/^link..\.(strut|spring|forkA|forkB)$/.test(p.name))for(const q of p.meshes){const a=q.pts;for(let i=0;i<a.length;i+=3)dam.add(Math.round(a[i]*2)+','+Math.round(a[i+1]*2)+','+Math.round(a[i+2]*2));}
  let gap=99;for(const p of parts.values())if(/^tyre/.test(p.name))for(const q of p.meshes){const a=q.pts;for(let i=0;i<a.length;i+=3){const X=Math.round(a[i]*2),Y=Math.round(a[i+1]*2),Z=Math.round(a[i+2]*2);
    for(let r=0;r<Math.min(gap,4);r++){let hit=false;for(let dx=-r;dx<=r&&!hit;dx++)for(let dy=-r;dy<=r&&!hit;dy++)for(let dz=-r;dz<=r&&!hit;dz++)if(Math.max(Math.abs(dx),Math.abs(dy),Math.abs(dz))===r&&dam.has((X+dx)+','+(Y+dy)+','+(Z+dz)))hit=true;if(hit){gap=Math.min(gap,r);break;}}}}
  console.log('INFO  '+tag+' tyre to damper, spring or fork: '+(gap>=4?'40 mm or more':'about '+gap*10+' mm'));}
// ---- attachment: every drawn part must be part of the car. Parts are joined when sample points of the two lie within 15 mm (cells touching);
// walking those joins from the body shell must reach every part. A part that is not reached floats (a mis-scaled or mis-placed mesh). JOINS declares links through parts the page does not draw.
const JOINS=(require('./scene_mounts.js').joins||{})[CAR]||[];
function attached(tag,parts){const L=[...parts.values()],K=16384,key=(x,y,z)=>((x+8192)*K+(y+8192))*K+(z+8192),sets=L.map(p=>{const S=new Set();for(const m of p.meshes){const a=m.pts;for(let i=0;i<a.length;i+=3)S.add(key(Math.round(a[i]*4),Math.round(a[i+1]*4),Math.round(a[i+2]*4)));}return S;});   // sample points on a 5 mm lattice
  const OFF=[];for(let dx=-3;dx<=3;dx++)for(let dy=-3;dy<=3;dy++)for(let dz=-3;dz<=3;dz++)if(dx*dx+dy*dy+dz*dz<=11)OFF.push([dx,dy,dz]);   // joined: sample points within 15 mm across the face, 5 mm along it (touching cells of 10 or 20 mm, whose grids sit a quarter cell apart)
  const near=(i,j)=>{const a=L[i].box,b=L[j].box;if(a[0]>b[1]+1||b[0]>a[1]+1||a[2]>b[3]+1||b[2]>a[3]+1||a[4]>b[5]+1||b[4]>a[5]+1)return false;const [S,T]=sets[i].size<sets[j].size?[sets[i],sets[j]]:[sets[j],sets[i]];
    for(const k of S){const z=k%K-8192,y=Math.floor(k/K)%K-8192,x=Math.floor(k/K/K)-8192;for(const [dx,dy,dz] of OFF)if(T.has(key(x+dx,y+dy,z+dz)))return true;}return false;};
  const adj=L.map(()=>[]);for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){const decl=JOINS.some(([a,b])=>{const ra=new RegExp('^'+a+'$'),rb=new RegExp('^'+b+'$');return (ra.test(L[i].name)&&rb.test(L[j].name))||(ra.test(L[j].name)&&rb.test(L[i].name));});if(decl||near(i,j)){adj[i].push(j);adj[j].push(i);}}
  const root=L.findIndex(p=>p.name==='bodyMesh'||p.name==='bodyCut');const seen=new Set([root]),q=[root];while(q.length){const i=q.shift();for(const j of adj[i])if(!seen.has(j)){seen.add(j);q.push(j);}}
  const lost=L.filter((p,i)=>!seen.has(i)).map(p=>p.name+' ('+mm(p.box)+')');
  PF(root>=0&&lost.length===0,tag+' every drawn part is attached to the car ('+L.length+' parts'+(lost.length?'; floating: '+lost.join('; '):'')+')');}
// ---- the same, piece by piece: a part's own cells split into pieces that touch nothing of each other (an engine's loose bracket, a pipe that stops short);
// every piece must reach the body through touching pieces of any part. Parts with very many sample points (the shells) count as one piece.
function attachedPieces(tag,parts){const K=16384,key=(x,y,z)=>((x+8192)*K+(y+8192))*K+(z+8192),dec=k=>[Math.floor(k/K/K)-8192,Math.floor(k/K)%K-8192,k%K-8192];
  const OFF=[];for(let dx=-3;dx<=3;dx++)for(let dy=-3;dy<=3;dy++)for(let dz=-3;dz<=3;dz++)if(dx*dx+dy*dy+dz*dz<=11)OFF.push([dx,dy,dz]);
  const PC=[];for(const p of parts.values()){const S=new Set();for(const m of p.meshes){const a=m.pts;for(let i=0;i<a.length;i+=3)S.add(key(Math.round(a[i]*4),Math.round(a[i+1]*4),Math.round(a[i+2]*4)));}
    const shell=S.size>150000||p.name==='bodyMesh'||p.name==='bodyCut';if(shell){PC.push({name:p.name,S,shell:true});continue;}
    const seen=new Set();for(const k of S){if(seen.has(k))continue;const C=new Set([k]);seen.add(k);const q=[k];while(q.length){const [x,y,z]=dec(q.pop());for(const [dx,dy,dz] of OFF){const n=key(x+dx,y+dy,z+dz);if(S.has(n)&&!seen.has(n)){seen.add(n);C.add(n);q.push(n);}}}PC.push({name:p.name,S:C});}}
  for(const c of PC){const b=[1e9,-1e9,1e9,-1e9,1e9,-1e9];for(const k of c.S){const [x,y,z]=dec(k);b[0]=Math.min(b[0],x);b[1]=Math.max(b[1],x);b[2]=Math.min(b[2],y);b[3]=Math.max(b[3],y);b[4]=Math.min(b[4],z);b[5]=Math.max(b[5],z);}c.box=b;}
  const near=(A,B)=>{const a=A.box,b=B.box;if(a[0]>b[1]+4||b[0]>a[1]+4||a[2]>b[3]+4||b[2]>a[3]+4||a[4]>b[5]+4||b[4]>a[5]+4)return false;const [S,T]=A.S.size<B.S.size?[A.S,B.S]:[B.S,A.S];
    for(const k of S){const [x,y,z]=dec(k);for(const [dx,dy,dz] of OFF)if(T.has(key(x+dx,y+dy,z+dz)))return true;}return false;};
  const decl=(a,b)=>JOINS.some(([x,y])=>{const ra=new RegExp('^'+x+'$'),rb=new RegExp('^'+y+'$');return (ra.test(a)&&rb.test(b))||(ra.test(b)&&rb.test(a));});
  const adj=PC.map(()=>[]);for(let i=0;i<PC.length;i++)for(let j=i+1;j<PC.length;j++)if((PC[i].name!==PC[j].name&&decl(PC[i].name,PC[j].name))||near(PC[i],PC[j])){adj[i].push(j);adj[j].push(i);}
  const seen=new Set();const q=[];PC.forEach((c,i)=>{if(c.name==='bodyMesh'||c.name==='bodyCut'){seen.add(i);q.push(i);}});while(q.length){const i=q.shift();for(const j of adj[i])if(!seen.has(j)){seen.add(j);q.push(j);}}
  const lost=PC.filter((c,i)=>!seen.has(i)).map(c=>c.name+' piece of '+c.S.size+' points at x '+(c.box[0]*5)+'..'+(c.box[1]*5)+', y '+(c.box[2]*5)+'..'+(c.box[3]*5)+', z '+(c.box[4]*5)+'..'+(c.box[5]*5)+' mm');
  PF(lost.length===0,tag+' every piece of every part touches the car ('+PC.length+' pieces'+(lost.length?'; floating: '+lost.slice(0,12).join('; ')+(lost.length>12?'; and '+(lost.length-12)+' more':''):'')+')');}
// ---- openings: with a door or the hatch fully open, nothing may stand in its aperture (the outline of the closed panel seen along its hinge-free axis),
// within 100 mm inside its closed inner face. Catches skin left behind when a panel is cut out of the body (a strip across the doorway).
function openings(tag){const OB=new Map(),ROWS=new Map();   // hatch: a row of the opening counts when what stands in it covers half of the row's middle third (a strip across the opening; the flanges and gutters at its sides do not)
  const under=(o,R)=>{for(let q=o;q;q=q.parent)if(q===R)return true;return false;};   // a mesh rides on the panel (badges share one label wherever they sit)
  const cells=(all,on)=>{const out=[];const parts=collect();for(const p of parts.values()){if(!all(p.name))continue;for(const m of p.meshes){if(on&&!on(m.o))continue;const a=m.pts;for(let i=0;i<a.length;i+=3)out.push([Math.round(a[i]*2),Math.round(a[i+1]*2),Math.round(a[i+2]*2),p.name]);}}return out;};
  const PANS=['doorL','doorR','rdoorL','rdoorR','trunk'],save={};for(const k of PANS)save[k]=[S[k]||0,E.anim[k]||0];
  for(const [pan,own] of [['doorL',/^(doorL|dglassL|doorCards|part_)/],['doorR',/^(doorR|dglassR|doorCards|part_)/],['rdoorL',/^(rdoorL|rglassL|rventL|rdoorCards|part_)/],['rdoorR',/^(rdoorR|rglassR|rventR|rdoorCards|part_)/],['trunk',/^(trunk|lamp_garnish|spoiler|part_|badge|plateR|paneRW|wiperRigR|linkS[LR]\.)/]]){
    if(!P[pan])continue;for(const k of PANS){S[k]=0;E.anim[k]=0;}settle();E.update(0);
    // closed panel (for the hatch, 40 mm in front of its inner face too, where a wall left across the loading opening would be, away from the 60 mm flanges at its sides, the hinge at its top and the sill (lock panel) at its bottom; gaps up to 40 mm filled: a strip left between two parts of the panel; wider gaps are openings the panel goes round): for a door, each column x (10 mm) from its lowest to its highest cell, with the panel's inner and outer |z| at each height (gaps take the nearest height's values);
    // for the hatch, each row y from its leftmost to its rightmost cell, with its foremost and rearmost x
    const door=pan!=='trunk',sg=/L$/.test(pan)?-1:/R$/.test(pan)?1:0,cl=cells(n=>own.test(n)&&!/^(part_|doorCards)/.test(n)&&!(door&&sg*0),o=>under(o,P[pan])),M=new Map();
    for(const c of cl){if(door&&Math.sign(c[2])!==sg)continue;const a=door?c[0]:c[1],b=door?c[1]:c[2],d=door?Math.abs(c[2]):c[0];if(!M.has(a))M.set(a,new Map());const r=M.get(a);const v=r.get(b);if(!v)r.set(b,[d,d]);else{v[0]=Math.min(v[0],d);v[1]=Math.max(v[1],d);}}
    const span=new Map();let topA=-1e9,botA=1e9;for(const a of M.keys()){topA=Math.max(topA,a);botA=Math.min(botA,a);}for(const [a,r] of M){if(!door&&(a>topA-8||a<botA+3))continue;const bs=[...r.keys()].sort((p,q)=>p-q);const lo=door?bs[0]:bs[0]+6,hi=door?bs[bs.length-1]:bs[bs.length-1]-6,F=new Map();for(let b=lo;b<=hi;b++){if(r.has(b)){F.set(b,r.get(b));continue;}let n=null;for(let d=1;!n&&d<=4;d++)n=r.get(b-d)||r.get(b+d);if(n)F.set(b,n);}span.set(a,F);}
    S[pan]=1;E.anim[pan]=1;E.update(0);
    const hits=new Map(),box=new Map();for(const c of cells(n=>!own.test(n))){if(door&&Math.sign(c[2])!==sg)continue;const a=door?c[0]:c[1],b=door?c[1]:c[2],F=span.get(a);if(!F)continue;const v=F.get(b);if(!v)continue;const d=door?Math.abs(c[2]):c[0];
      if(d>=v[0]&&d<=v[1]+(door?0:4)){if(!door){if(!ROWS.has(a))ROWS.set(a,new Set());ROWS.get(a).add(b);if(process.env.CL){const kk=c[3]+' y'+a*10+' x'+c[0]*10;OB.set(kk,(OB.get(kk)||0)+1);}continue;}hits.set(c[3],(hits.get(c[3])||0)+1);if(process.env.CL){const kk=c[3]+' y'+c[1]*10+' x'+Math.floor(c[0]/8)*80;OB.set(kk,(OB.get(kk)||0)+1);}const bb=box.get(c[3])||[1e9,-1e9,1e9,-1e9,1e9,-1e9];box.set(c[3],[Math.min(bb[0],c[0]),Math.max(bb[1],c[0]),Math.min(bb[2],c[1]),Math.max(bb[3],c[1]),Math.min(bb[4],c[2]),Math.max(bb[5],c[2])]);}}
    if(!door)for(const [a,set] of ROWS){const F=span.get(a);if(!F)continue;const ks=[...F.keys()],lo=Math.min(...ks),hi=Math.max(...ks),m0=lo+(hi-lo)/3,m1=hi-(hi-lo)/3;let n=0,t=0;for(let q=Math.ceil(m0);q<=m1;q++){t++;if(set.has(q))n++;}if(t&&n>=.5*t)hits.set('strip across the opening at y '+a*10+' mm',n);}ROWS.clear();
    const h=[...hits.entries()].map(([n,c])=>{const b=box.get(n);if(!b)return n+' ('+c+' cells)';return n+' '+c+' cells at x '+b[0]*10+'..'+b[1]*10+', y '+b[2]*10+'..'+b[3]*10+', z '+b[4]*10+'..'+b[5]*10+' mm';});
    if(process.env.CL&&OB.size)console.log('      '+[...OB.entries()].sort((p,q)=>q[1]-p[1]).slice(0,30).map(e=>e[0]+':'+e[1]).join('  '));OB.clear();PF(h.length===0,tag+' '+(door?pan:'hatch / trunk')+' fully open: nothing left where the closed panel was'+(h.length?' ('+h.join('; ')+')':''));}
  for(const k in save){S[k]=save[k][0];E.anim[k]=save[k][1];}settle();}
const run=(s,dt)=>{for(let i=0;i<Math.round(s/(dt||.016));i++)E.update(dt||.016);};
const settle=()=>{S.v=0;S.steer=0;S.roll=S.pitch=0;S.bodyY=0;S.bobExtra=0;S.rpm=0;E.update(0);};
// ---- the states a car shows: closed at rest, every panel through its swing, full lock both ways, body roll and pitch at their limits, cockpit controls at their ends
async function states(tag){
  settle();run(.6);settle();
  {const r=audit(tag+' at rest, everything closed');measure(tag+' at rest',r.parts,false);attached(tag+' at rest',new Map(r.parts.map(p=>[p.name,p])));if(process.env.PIECES!=='0')attachedPieces(tag+' at rest',new Map(r.parts.map(p=>[p.name,p])));}
  const SW=['doorL','doorR','rdoorL','rdoorR','hood','trunk','win','cover'];
  for(const f of [.25,.5,.75,1]){for(const k of SW)S[k]=0;settle();for(const k of SW){E.anim[k]=f;S[k]=f;}E.update(0);
    audit(tag+' doors, hood, hatch, cargo cover at '+(f*100)+' % of their swing, windows '+(f*100)+' % down','^(door|rdoor|hood|trunk|spoiler|dglass|rglass|rvent|plateR|paneRW|wiperRigR|part_hatch|part_gtwing|part_trunklip|part_ducktail|shelf|linkS[LR]\\.)');}
  for(const k of SW){S[k]=0;E.anim[k]=0;}
  openings(tag);
  for(const st of [-1,-.5,.5,1]){settle();S.steer=st;E.update(0);const r=audit(tag+' steering '+(st>0?'left':'right')+' '+Math.abs(st*100)+' % lock (wheels '+(S.delta*180/Math.PI).toFixed(1)+' deg bicycle)','^(tyre|rim|rotor|caliper|link|rack|swheel|swm)');if(Math.abs(st)===1)measure(tag+' full '+(st>0?'left':'right')+' lock',r.parts,true);}
  const BLm=E.MOD.bodyLimits?E.MOD.bodyLimits(E.cfg):{roll:.1,pitch:.05},RL=BLm.roll,PL=BLm.pitch;
  for(const [r,p] of [[RL,0],[-RL,0],[0,PL],[0,-PL],[RL,PL],[-RL,-PL]]){settle();S.roll=r;S.pitch=p;E.update(0);audit(tag+' body roll '+(r*180/Math.PI).toFixed(1)+' deg, pitch '+(p*180/Math.PI).toFixed(1)+' deg','^(tyre|rim|rotor|caliper|link|exh|under)');}
  settle();S.steer=1;S.roll=BLm.rollLock!==undefined?BLm.rollLock:RL;E.update(0);audit(tag+' full lock with full roll'+(BLm.rollLock!==undefined?' ('+(S.roll*180/Math.PI).toFixed(1)+' deg, the car\'s limit at full lock)':''),'^(tyre|rim|rotor|caliper|link)');
  settle();S.wipers=true;S.wipT=Math.PI;for(let i=0;i<30;i++)E.update(0);audit(tag+' wipers at the end of their sweep','^wipers');S.wipers=false;E.anim.wip=0;
  settle();if(P.ped_gas){P.ped_gas.rotation.z=-.45;P.ped_brake.rotation.z=-.45;P.ped_clutch.rotation.z=-.4;}if(P.shifter){P.shifter.rotation.z=-.12;P.shifter.rotation.x=.1;}
  audit(tag+' pedals pressed, shifter in first','^(ped_|shifter)');if(P.shifter){P.shifter.rotation.z=.12;P.shifter.rotation.x=-.1;audit(tag+' shifter in reverse','^shifter');}
  settle();}
if(MODE==='rest'&&process.env.PART){for(const pa of process.env.PART.split(';')){const [sl,id]=pa.split(':');const r=E.applyPart(E.cfg,sl,id);console.log('APPLY '+sl+' '+id+': '+r.state+(r.reason?' ('+r.reason+')':'')+(r.notes&&r.notes.length?' '+r.notes.join(', '):''));if(r.state==='blocked'||r.state==='later'){console.log('SKIP (the shop does not fit it)');process.exit(0);}Object.assign(E.cfg,r.cfg);E.refresh();settle();run(.3);}}
if(MODE==='rest'){if(process.env.CFG0){for(const c0 of JSON.parse(process.env.CFG0)){for(const k in c0)E.cfg[k]=c0[k];E.refresh();settle();run(.3);}}if(process.env.CFG){const C=JSON.parse(process.env.CFG);for(const k in C)E.cfg[k]=C[k];E.refresh();}settle();run(.6);settle();const r=audit('at rest, everything closed');measure('at rest',r.parts,false);attached('at rest',new Map(r.parts.map(p=>[p.name,p])));if(process.env.PIECES!=='0')attachedPieces('at rest',new Map(r.parts.map(p=>[p.name,p])));openings('at rest');}
if(MODE==='states'||MODE==='all'||MODE==='stock'){
  for(const [n] of (MODE==='stock'?E.MOD.presets.slice(0,1):E.MOD.presets).filter(([n])=>!process.env.PRESET||process.env.PRESET.split(',').includes(n))){[...w.document.querySelectorAll('#shop .row button')].find(b=>b.textContent===n).click();run(.3);if(process.env.CFG){const C=JSON.parse(process.env.CFG);for(const k in C)E.cfg[k]=C[k];E.refresh();run(.3);}console.log('\nPRESET '+n+(process.env.CFG?' with '+process.env.CFG:''));await states(n);}
}
// ---- library: every part the shop lets this car take, every engine and gearbox pairing it accepts, a sweep of wheel sizes, offsets and drops.
// A configuration the fit rules ACCEPT must be collision-free when drawn (else the rule is too lenient: FAIL). One they REFUSE is checked too and reported when it is clean (the rule is stricter than the geometry: INFO).
const presetBtn=n=>[...w.document.querySelectorAll('#shop .row button')].find(b=>b.textContent===n);
const setCfg=c=>{const C=JSON.parse(JSON.stringify(c));for(const k in C)E.cfg[k]=C[k];E.refresh();settle();E.update(0);};
function quick(tag,only){settle();const r0=audit(tag+' at rest',only);let bad=r0.bad;if(!only||process.env.ATTACH){attached(tag+' at rest',new Map(r0.parts.map(p=>[p.name,p])));if(process.env.PIECES!=='0')attachedPieces(tag+' at rest',new Map(r0.parts.map(p=>[p.name,p])));}for(const st of [-1,1]){settle();S.steer=st;E.update(0);bad+=audit(tag+' full '+(st>0?'left':'right')+' lock',only||'^(tyre|rim|rotor|caliper|link|rack)').bad;}
  const BLm=E.MOD.bodyLimits?E.MOD.bodyLimits(E.cfg):{roll:.1,pitch:.05};for(const [r,p] of [[BLm.roll,BLm.pitch],[-BLm.roll,-BLm.pitch]]){settle();S.roll=r;S.pitch=p;E.update(0);bad+=audit(tag+' roll '+(r*180/Math.PI).toFixed(1)+' pitch '+(p*180/Math.PI).toFixed(1)+' deg',only||'^(tyre|rim|rotor|caliper|link|exh|under)').bad;}
  settle();return bad;}
async function library(){
  presetBtn('Stock').click();run(.3);const base=JSON.parse(JSON.stringify(E.cfg));let tried=0,refused=0;
  const ONLY=process.env.SLOTS?process.env.SLOTS.split(','):null;   // SLOTS=aeroF,aeroR,...,mix: audit only these library slots (and the aero mixes with 'mix'); no wheel, drivetrain or removal sweeps
  for(const slot of ['engine','gearbox','swapkit','diff','exhaust','seats','steering','suspension','brakes','aeroF','aeroR','flares','skirts','aerokit','frame'].filter(s=>!ONLY||ONLY.includes(s))){
    const list=E.partList(slot);   // what the shop offers this car
    for(const part of list){const r=E.applyPart(base,slot,part.id);if(r.state==='blocked'||r.state==='later'){refused++;console.log('REFUSED '+slot+' '+part.id+': '+(r.reason||'').slice(0,90));continue;}tried++;setCfg(r.cfg);
      console.log('\nLIBRARY '+slot+' = '+part.id+(r.cfg.swapkit&&r.cfg.swapkit!=='none'?' (kit '+r.cfg.swapkit+', gearbox '+r.cfg.gearbox+')':''));quick(slot+' '+part.id,process.env.ONLYRX);}}
  // aero mixes: any front lip with any rear spoiler or wing, with the flares and skirts on (where this car has them)
  if(!ONLY||ONLY.includes('mix')){const L=s=>E.partList(s).filter(p=>p.id!=='none');for(const f of L('aeroF'))for(const r of L('aeroR')){let c=JSON.parse(JSON.stringify(base));c.aeroF=f.id;c.aeroR=r.id;
    for(const [s,id] of [['flares','wide'],['skirts','skirts']]){const t=E.applyPart(c,s,id);if(t.state!=='blocked'&&t.state!=='later')c=t.cfg;}
    const fit=E.checkFit(c);if(fit.issues.some(i=>i.sev==='BLOCK')){refused++;console.log('REFUSED aero mix '+f.id+' + '+r.id+': '+fit.issues.find(i=>i.sev==='BLOCK').text.slice(0,90));continue;}
    tried++;setCfg(c);console.log('\nLIBRARY aero mix = '+f.id+' + '+r.id+' + flares '+c.flares+' + skirts '+c.skirts);quick('aero '+f.id+'+'+r.id,process.env.ONLYRX);}}
  if(ONLY){console.log('\nLIBRARY: '+tried+' parts fitted and audited, '+refused+' refused by the shop for this car');return;}
  for(const p of E.CATALOG.wheel){const ex=p.dia?{style:p.style,dia:p.dia,width:p.width,et:p.et,pcd:p.pcd,bore:p.bore,tw:p.tw,ar:p.ar}:{style:p.id};const r=E.applyPart(base,'wheel',p.id,ex);
    if(r.state==='blocked'||r.state==='later'){refused++;console.log('REFUSED wheel '+p.id+': '+r.reason.slice(0,90));continue;}tried++;setCfg(r.cfg);console.log('\nLIBRARY wheel = '+p.id);quick('wheel '+p.id);}
  // every removable part taken off on its own: what was mounted on it goes with it (nothing left floating), nothing else changes
  for(const k of Object.keys(E.CAR.removables||{})){const c=JSON.parse(JSON.stringify(base));c.removed={[k]:true};setCfg(c);console.log('\nLIBRARY removed = '+k);quick('removed '+k);tried++;}
  console.log('\nLIBRARY: '+tried+' parts fitted and audited, '+refused+' refused by the shop for this car');
  // engine x gearbox pairs the shop accepts (with the kit it picks)
  let pairs=0;for(const e of E.CATALOG.engine)for(const g of E.CATALOG.gearbox){const c=Object.assign(JSON.parse(JSON.stringify(base)),{engine:e.id,gearbox:g.id});const rr=w.eval('resolveDrivetrain')(c);if(!rr.ok)continue;
    if(e.id===base.engine&&g.id===base.gearbox)continue;pairs++;setCfg(rr.cfg);console.log('\nDRIVETRAIN '+e.id+' + '+g.id+' (kit '+rr.cfg.swapkit+')');quick('drivetrain '+e.id+'+'+g.id);}
  console.log('\nDRIVETRAINS: '+pairs+' engine and gearbox pairs accepted and audited');
  // wheels: sizes, widths, offsets, drops (coilovers allow 0-80 mm); accepted ones must be clean, refused ones are reported when clean
  setCfg(Object.assign(JSON.parse(JSON.stringify(base)),{suspension:'coil'}));let acc=0,accBad=0,ref=0,refClean=0;const strict=[];
  for(const dia of [13,14,15,16,17,18])for(const width of [5.5,6,6.5,7,7.5,8,8.5,9,10])for(const et of [-10,15,25,35,45,50])for(const drop of [0,30,60,80]){
    const c=Object.assign(JSON.parse(JSON.stringify(E.cfg)),{drop,wheel:{style:'mesh',dia,width,et,pcd:base.wheel.pcd,bore:base.wheel.bore}}),fit=E.checkFit(c);
    const allBlocks=fit.issues.filter(i=>i.sev==='BLOCK'),wheelBlocks=allBlocks.filter(i=>/barrel/i.test(i.text)).concat(fit.issues.filter(i=>i.sev==='WARN'&&/rub/i.test(i.text)));   // a fitment the shop warns will RUB (poke past the lip, against the strut, into the arch at lock) is allowed to touch; one it accepts without that warning must be clean
    if(allBlocks.length&&!wheelBlocks.length)continue;if(wheelBlocks.length&&ref>=60)continue;   // refused ones: the first 60 are drawn and checked
    setCfg(c);const tag='wheel '+dia+'x'+width+' ET'+et+' drop '+drop+' ('+fit.tyre.sizeStr+')';
    const quiet=process.env.VERBOSE?0:1,sv=console.log;if(quiet&&wheelBlocks.length)console.log=()=>{};
    const f0=fails,bad=quick(tag,'^(tyre|rim|rotor|caliper)');console.log=sv;
    if(wheelBlocks.length){fails=f0;ref++;if(!bad){refClean++;strict.push(tag+': refused ('+wheelBlocks[0].text.slice(0,70)+')');}}else{acc++;if(bad)accBad++;}}
  // camber: the same rule with the wheel tilted (0 to -8 degrees front and rear) on a wide, low-offset fitment
  for(const cam of [-2,-4,-6,-8])for(const [width,et] of [[8,25],[9,15],[9.5,10]]){const c=Object.assign(JSON.parse(JSON.stringify(E.cfg)),{drop:60,camberF:cam,camberR:cam,wheel:{style:'mesh',dia:16,width,et,pcd:base.wheel.pcd,bore:base.wheel.bore}}),fit=E.checkFit(c);
    const rub=fit.issues.filter(i=>i.sev==='WARN'&&/rub/i.test(i.text));setCfg(c);const tag='camber '+cam+' deg, 16x'+width+' ET'+et+' drop 60';const sv=console.log;if(rub.length&&!process.env.VERBOSE)console.log=()=>{};const f0=fails,bad=quick(tag,'^(tyre|rim|rotor|caliper|link|knuckle)');console.log=sv;
    if(rub.length){fails=f0;ref++;if(!bad){refClean++;strict.push(tag+': warned ('+rub[0].text.slice(0,70)+')');}}else{acc++;if(bad)accBad++;}}
  setCfg(Object.assign(JSON.parse(JSON.stringify(base)),{camberF:0,camberR:0}));
  console.log('\nWHEELS: '+acc+' sizes accepted without a rub warning audited, '+accBad+' with a collision (rule too lenient); '+ref+' sizes the shop warns will rub drawn, '+refClean+' of them clean when drawn (the warning is conservative: it keeps bump travel the page does not draw)');
  PF(accBad===0,'every wheel size the shop accepts is collision-free when drawn ('+acc+' sizes)');
  for(const t of strict.slice(0,12))console.log('INFO  '+t);
}
if(MODE==='library'||MODE==='all')await library();
console.log('\nSCENE AUDIT ('+CAR+', '+MODE+'): '+(fails?'FAIL':'PASS')+' ('+checks+' checks, '+fails+' failing)'+(errs.length?' page errors: '+errs.length:''));
if(errs.length)console.log(errs.slice(0,5).join('\n'));
process.exit(fails?1:0);
})();
