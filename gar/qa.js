/* ===== QA: the same checks as t/scene_audit.js, run inside the page (View tab > Check this build), so anyone (Muse, the owner, a buyer) can verify a
   car without the test tools. Every visible part's voxel cells are sampled one point per 10 mm in the body's frame:
   1. collisions: a sample point strictly inside another part's cube is an overlap; declared mounts (QA_MOUNTS, the joints where parts are fastened into
      each other) may overlap up to their limit;
   2. floating pieces: each part is split into its separate pieces (points within 15 mm join); every piece must reach the body through touching pieces.
   The report is plain text, ready to paste. ===== */
const QA={};
function qaLabels(){const L=new Map(),add=(o,k)=>{if(o&&o.isObject3D&&!L.has(o))L.set(o,k);};
  for(const n in wheels){const W=wheels[n];add(W.tire,'tyre'+n);add(W.rim,'rim'+n);add(W.rot,'rotor'+n);add(W.cal,'caliper'+n);if(W.kn)add(W.kn,'knuckle'+n);}
  for(const k of Object.keys(P)){const v=P[k];if(v&&v.isObject3D)add(v,k);
    else if(Array.isArray(v))v.forEach((o,i)=>{if(o&&o.isObject3D)add(o,k);else if(o&&typeof o==='object')for(const f in o)if(o[f]&&o[f].isObject3D)add(o[f],'link'+(o.nm||i)+'.'+f);});}
  return L;}
function qaCollect(){
  const vis=o=>{for(let p=o;p&&p!==carRoot;p=p.parent)if(!p.visible)return false;return true;};
  scene.updateMatrixWorld(true);const L=qaLabels(),inv=new THREE.Matrix4().copy(body.matrixWorld).invert(),parts=new Map();
  carRoot.traverse(o=>{if(!o.isMesh||!o.geometry||!o.geometry.userData||!o.geometry.userData.src||!vis(o))return;
    let lab=null;for(let p=o;p&&!lab;p=p.parent)lab=L.get(p)||null;if(!lab)lab=(o.name||o.parent&&o.parent.name)||'unnamed';
    const M=new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld),Mi=new THREE.Matrix4().copy(M).invert();
    if(!parts.has(lab))parts.set(lab,{name:lab,meshes:[]});parts.get(lab).meshes.push({o,g:o.geometry.userData.src,sel:o.geometry.userData.sel,M,Mi});});
  const PNT=0x00fe01,take=(v,sel)=>v>=0&&(sel===1?(v===PNT||v===0x00fe02):sel===2?(v!==PNT&&v!==0x00fe02):true);
  for(const p of parts.values()){for(const m of p.meshes){const g=m.g,e=m.M.elements,col=i=>Math.hypot(e[i],e[i+1],e[i+2]),n=[0,4,8].map(i=>Math.max(1,Math.round(col(i)/.5)));
      const off=n.map(k=>Array.from({length:k},(_,i)=>(i+.5)/k-.5)),out=[];let idx=0;m.take=take;
      for(let x=g.x0;x<=g.x1;x++)for(let y=g.y0;y<=g.y1;y++)for(let z=g.z0;z<=g.z1;z++){const v=g.d[idx++];if(!take(v,m.sel))continue;
        for(const a of off[0])for(const b of off[1])for(const c of off[2]){const X=x+a,Y=y+b,Z=z+c;out.push(e[0]*X+e[4]*Y+e[8]*Z+e[12],e[1]*X+e[5]*Y+e[9]*Z+e[13],e[2]*X+e[6]*Y+e[10]*Z+e[14]);}}
      m.pts=new Float32Array(out);}
    const b=[1e9,-1e9,1e9,-1e9,1e9,-1e9];for(const m of p.meshes){const a=m.pts;for(let i=0;i<a.length;i+=3){b[0]=Math.min(b[0],a[i]);b[1]=Math.max(b[1],a[i]);b[2]=Math.min(b[2],a[i+1]);b[3]=Math.max(b[3],a[i+1]);b[4]=Math.min(b[4],a[i+2]);b[5]=Math.max(b[5],a[i+2]);}}p.box=b;}
  return [...parts.values()];}
// every shape the car can show has real numbers in it: hidden ones too (a window's lower steps, a part not fitted now), since the game can show any of them.
// A NaN or infinite corner draws nothing useful and makes three.js print "computeBoundingSphere(): Computed radius is NaN" on screen (the EF's and the
// E30 Touring's door glass at its last step down did, Nov 23: e30_core.js glassSurface).
function qaFinite(){const L=qaLabels(),out=[];
  carRoot.traverse(o=>{const g=o.geometry,a=g&&g.attributes&&g.attributes.position&&g.attributes.position.array;if(!a)return;let bad=0;for(let i=0;i<a.length;i++)if(!Number.isFinite(a[i]))bad++;if(!bad)return;
    let lab=null;for(let p=o;p&&!lab;p=p.parent)lab=L.get(p)||null;out.push((lab||o.name||'unnamed')+': '+bad+' of '+a.length+' coordinates not finite'+(o.visible?'':' (hidden now)'));});
  return out;}
const qaMM=b=>'x '+(b[0]*20|0)+'..'+(b[1]*20|0)+', y '+(b[2]*20|0)+'..'+(b[3]*20|0)+', z '+(b[4]*20|0)+'..'+(b[5]*20|0)+' mm';
function qaCollisions(parts,only){   // only: a regex; then just the pairs where one part matches (the parts that moved)
  const IN=X=>Math.abs(X-Math.round(X))<.49,inside=(part,x,y,z)=>{for(const m of part.meshes){const e=m.Mi.elements,X=e[0]*x+e[4]*y+e[8]*z+e[12],Y=e[1]*x+e[5]*y+e[9]*z+e[13],Z=e[2]*x+e[6]*y+e[10]*z+e[14];if(IN(X)&&IN(Y)&&IN(Z)&&m.take(m.g.get(X,Y,Z),m.sel))return true;}return false;};
  const overl=(a,b)=>a[0]<=b[1]&&b[0]<=a[1]&&a[2]<=b[3]&&b[2]<=a[3]&&a[4]<=b[5]&&b[4]<=a[5];
  const hits=(A,B)=>{const b=B.box;let n=0;const hb=[1e9,-1e9,1e9,-1e9,1e9,-1e9];for(const m of A.meshes){const a=m.pts;for(let i=0;i<a.length;i+=3){const x=a[i],y=a[i+1],z=a[i+2];
      if(x<b[0]-.5||x>b[1]+.5||y<b[2]-.5||y>b[3]+.5||z<b[4]-.5||z>b[5]+.5)continue;if(inside(B,x,y,z)){n++;hb[0]=Math.min(hb[0],x);hb[1]=Math.max(hb[1],x);hb[2]=Math.min(hb[2],y);hb[3]=Math.max(hb[3],y);hb[4]=Math.min(hb[4],z);hb[5]=Math.max(hb[5],z);}}}return {n,hb};};
  const MO=(typeof QA_MOUNTS!=='undefined'&&QA_MOUNTS[CARID])||[],allowed=(a,b)=>{for(const [pa,pb,max] of MO){const ra=new RegExp('^'+pa+'$'),rb=new RegExp('^'+pb+'$');if((ra.test(a)&&rb.test(b))||(ra.test(b)&&rb.test(a)))return max;}return null;};
  const out=[];for(let i=0;i<parts.length;i++)for(let j=i+1;j<parts.length;j++){const A=parts[i],B=parts[j];if(only&&!only.test(A.name)&&!only.test(B.name))continue;if(!overl(A.box,B.box))continue;const r1=hits(A,B),r2=hits(B,A),n=Math.max(r1.n,r2.n);if(!n)continue;
    const al=allowed(A.name,B.name);if(al!==null&&n<=al)continue;out.push(A.name+' / '+B.name+': '+n+' cells at '+qaMM(r1.n>=r2.n?r1.hb:r2.hb)+(al!==null?' (mount allows '+al+')':''));}
  return out;}
function qaPieces(parts){
  const K=16384,key=(x,y,z)=>((x+8192)*K+(y+8192))*K+(z+8192),dec=k=>[Math.floor(k/K/K)-8192,Math.floor(k/K)%K-8192,k%K-8192];
  const OFF=[];for(let dx=-3;dx<=3;dx++)for(let dy=-3;dy<=3;dy++)for(let dz=-3;dz<=3;dz++)if(dx*dx+dy*dy+dz*dz<=11)OFF.push([dx,dy,dz]);
  const PC=[];for(const p of parts){const S=new Set();for(const m of p.meshes){const a=m.pts;for(let i=0;i<a.length;i+=3)S.add(key(Math.round(a[i]*4),Math.round(a[i+1]*4),Math.round(a[i+2]*4)));}
    if(S.size>150000||p.name==='bodyMesh'||p.name==='bodyCut'){PC.push({name:p.name,S});continue;}
    const seen=new Set();for(const k of S){if(seen.has(k))continue;const C=new Set([k]);seen.add(k);const q=[k];while(q.length){const [x,y,z]=dec(q.pop());for(const [dx,dy,dz] of OFF){const n=key(x+dx,y+dy,z+dz);if(S.has(n)&&!seen.has(n)){seen.add(n);C.add(n);q.push(n);}}}PC.push({name:p.name,S:C});}}
  for(const c of PC){const b=[1e9,-1e9,1e9,-1e9,1e9,-1e9];for(const k of c.S){const [x,y,z]=dec(k);b[0]=Math.min(b[0],x);b[1]=Math.max(b[1],x);b[2]=Math.min(b[2],y);b[3]=Math.max(b[3],y);b[4]=Math.min(b[4],z);b[5]=Math.max(b[5],z);}c.box=b;}
  const near=(A,B)=>{const a=A.box,b=B.box;if(a[0]>b[1]+4||b[0]>a[1]+4||a[2]>b[3]+4||b[2]>a[3]+4||a[4]>b[5]+4||b[4]>a[5]+4)return false;const [S,T]=A.S.size<B.S.size?[A.S,B.S]:[B.S,A.S];
    for(const k of S){const [x,y,z]=dec(k);for(const [dx,dy,dz] of OFF)if(T.has(key(x+dx,y+dy,z+dz)))return true;}return false;};
  const JO=(typeof QA_MOUNTS!=='undefined'&&QA_MOUNTS.joins&&QA_MOUNTS.joins[CARID])||[],decl=(a,b)=>JO.some(([x,y])=>{const ra=new RegExp('^'+x+'$'),rb=new RegExp('^'+y+'$');return (ra.test(a)&&rb.test(b))||(ra.test(b)&&rb.test(a));});   // links through parts the page does not draw
  const adj=PC.map(()=>[]);for(let i=0;i<PC.length;i++)for(let j=i+1;j<PC.length;j++)if((PC[i].name!==PC[j].name&&decl(PC[i].name,PC[j].name))||near(PC[i],PC[j])){adj[i].push(j);adj[j].push(i);}
  const seen=new Set(),q=[];PC.forEach((c,i)=>{if(c.name==='bodyMesh'||c.name==='bodyCut'){seen.add(i);q.push(i);}});while(q.length){const i=q.shift();for(const j of adj[i])if(!seen.has(j)){seen.add(j);q.push(j);}}
  return PC.filter((c,i)=>!seen.has(i)).map(c=>c.name+' piece of '+c.S.size+' points at x '+(c.box[0]*5)+'..'+(c.box[1]*5)+', y '+(c.box[2]*5)+'..'+(c.box[3]*5)+', z '+(c.box[4]*5)+'..'+(c.box[5]*5)+' mm');}
// openings: with a door or the hatch fully open, nothing may stand where the closed panel was, within its closed thickness (for the hatch, 40 mm in front
// of it too). The same rule as t/scene_audit.js: it catches body skin left in a doorway when a door was drawn but never cut out of the body.
function qaOpenings(){const out=[],ROWS=new Map(),under=(o,R)=>{for(let q=o;q;q=q.parent)if(q===R)return true;return false;};
  const cells=(all,on)=>{const r=[];for(const p of qaCollect()){if(!all(p.name))continue;for(const m of p.meshes){if(on&&!on(m.o))continue;const a=m.pts;for(let i=0;i<a.length;i+=3)r.push([Math.round(a[i]*2),Math.round(a[i+1]*2),Math.round(a[i+2]*2),p.name]);}}return r;};
  const PANS=['doorL','doorR','rdoorL','rdoorR','trunk'],save={};for(const k of PANS)save[k]=[state[k]||0,anim[k]||0];
  for(const [pan,own] of [['doorL',/^(doorL|dglassL|doorCards|part_)/],['doorR',/^(doorR|dglassR|doorCards|part_)/],['rdoorL',/^(rdoorL|rglassL|rventL|rdoorCards|part_)/],['rdoorR',/^(rdoorR|rglassR|rventR|rdoorCards|part_)/],['trunk',/^(trunk|lamp_garnish|spoiler|part_|badge|plateR|paneRW|wiperRigR|linkS[LR]\.)/]]){
    if(!P[pan])continue;for(const k of PANS){state[k]=0;anim[k]=0;}qaSettle();
    const door=pan!=='trunk',sg=/L$/.test(pan)?-1:/R$/.test(pan)?1:0,cl=cells(n=>own.test(n)&&!/^(part_|doorCards)/.test(n),o=>under(o,P[pan])),M=new Map();
    for(const c of cl){if(door&&Math.sign(c[2])!==sg)continue;const a=door?c[0]:c[1],b=door?c[1]:c[2],d=door?Math.abs(c[2]):c[0];if(!M.has(a))M.set(a,new Map());const r=M.get(a);const v=r.get(b);if(!v)r.set(b,[d,d]);else{v[0]=Math.min(v[0],d);v[1]=Math.max(v[1],d);}}
    const span=new Map();let topA=-1e9,botA=1e9;for(const a of M.keys()){topA=Math.max(topA,a);botA=Math.min(botA,a);}
    for(const [a,r] of M){if(!door&&(a>topA-8||a<botA+3))continue;const bs=[...r.keys()].sort((p,q)=>p-q);const lo=door?bs[0]:bs[0]+6,hi=door?bs[bs.length-1]:bs[bs.length-1]-6,F=new Map();for(let b=lo;b<=hi;b++){if(r.has(b)){F.set(b,r.get(b));continue;}let n=null;for(let d=1;!n&&d<=4;d++)n=r.get(b-d)||r.get(b+d);if(n)F.set(b,n);}span.set(a,F);}
    state[pan]=1;anim[pan]=1;update(0);
    const hits=new Map(),box=new Map();for(const c of cells(n=>!own.test(n))){if(door&&Math.sign(c[2])!==sg)continue;const a=door?c[0]:c[1],b=door?c[1]:c[2],F=span.get(a);if(!F)continue;const v=F.get(b);if(!v)continue;const d=door?Math.abs(c[2]):c[0];
      if(d>=v[0]&&d<=v[1]+(door?0:4)){if(!door){if(!ROWS.has(a))ROWS.set(a,new Set());ROWS.get(a).add(b);continue;}hits.set(c[3],(hits.get(c[3])||0)+1);const bb=box.get(c[3])||[1e9,-1e9,1e9,-1e9,1e9,-1e9];box.set(c[3],[Math.min(bb[0],c[0]),Math.max(bb[1],c[0]),Math.min(bb[2],c[1]),Math.max(bb[3],c[1]),Math.min(bb[4],c[2]),Math.max(bb[5],c[2])]);}}
    if(!door)for(const [a,set] of ROWS){const F=span.get(a);if(!F)continue;const ks=[...F.keys()],lo=Math.min(...ks),hi=Math.max(...ks),m0=lo+(hi-lo)/3,m1=hi-(hi-lo)/3;let n=0,t=0;for(let q=Math.ceil(m0);q<=m1;q++){t++;if(set.has(q))n++;}if(t&&n>=.5*t)hits.set('strip across the opening at y '+a*10+' mm',n);}ROWS.clear();
    const h=[...hits.entries()].map(([n,c])=>{const b=box.get(n);return b?n+' '+c+' cells at x '+b[0]*10+'..'+b[1]*10+', y '+b[2]*10+'..'+b[3]*10+', z '+b[4]*10+'..'+b[5]*10+' mm':n+' ('+c+' cells)';});
    out.push([(door?pan:'hatch / trunk')+' fully open: nothing left where the closed panel was',h]);}
  for(const k in save){state[k]=save[k][0];anim[k]=save[k][1];}qaSettle();return out;}
function qaSettle(){state.v=state.vy=state.yawR=0;state.steer=0;state.roll=state.pitch=0;state.bodyY=0;state.bobExtra=0;update(0);}
const qaWait=()=>new Promise(r=>setTimeout(r,20));
// full: also every panel through its swing, the openings, full steering lock, and body roll and pitch at the car's limits (the same states as scene_audit's states mode)
QA.run=async(say,full)=>{
  const keep={};for(const k of ['mode','v','vy','yawR','steer','roll','pitch','bodyY','bobExtra','doorL','doorR','rdoorL','rdoorR','hood','trunk','win','cover','lights'])keep[k]=state[k];const keepA=Object.assign({},anim);
  const t0=performance.now(),res=[],step=async(label,fn)=>{say((full?'Full':'Quick')+' check: '+label+'...');await qaWait();const r=fn();res.push([label,r]);return r;};
  let nParts=0;
  try{
    qaSettle();
    say((full?'Full':'Quick')+' check: collecting parts...');await qaWait();const ps=qaCollect();nParts=ps.length;
    await step('parked, everything shut: collisions',()=>qaCollisions(ps));
    await step('parked: every piece attached',()=>qaPieces(ps));
    await step('every shape has finite corners (hidden ones included)',()=>qaFinite());
    if(full){
      const SW=['doorL','doorR','rdoorL','rdoorR','hood','trunk','win','cover'],MV=/^(pods|door|rdoor|hood|trunk|spoiler|dglass|rglass|rvent|plateR|paneRW|wiperRigR|part_hatch|part_gtwing|part_trunklip|part_ducktail|shelf|linkS[LR]\.)/;
      for(const f of [.5,1])await step('doors, hood, hatch, cover at '+(f*100)+' % of their swing, windows '+(f*100)+' % down, pop-up lamps '+(f*100)+' % up',()=>{for(const k of SW)state[k]=0;qaSettle();for(const k of SW){anim[k]=f;state[k]=f;}state.lights=1;anim.pop=f;update(0);const r=qaCollisions(qaCollect(),MV);for(const k of SW){state[k]=0;anim[k]=0;}state.lights=0;anim.pop=0;qaSettle();return r;});
      say('Full check: doorways and hatch opening...');await qaWait();for(const [label,h] of qaOpenings())res.push([label,h]);
      const WH=/^(tyre|rim|rotor|caliper|link|rack|swheel|swm)/;
      for(const st of [-1,1])await step('full '+(st>0?'left':'right')+' steering lock',()=>{qaSettle();state.steer=st;update(0);return qaCollisions(qaCollect(),WH);});
      const BL=MOD.bodyLimits?MOD.bodyLimits(cfg):{roll:.1,pitch:.05},RD=180/Math.PI,BR=/^(tyre|rim|rotor|caliper|link|exh|under)/;
      for(const [r,p] of [[BL.roll,BL.pitch],[-BL.roll,-BL.pitch],[BL.roll,-BL.pitch],[-BL.roll,BL.pitch]])await step('body roll '+(r*RD).toFixed(1)+' deg, pitch '+(p*RD).toFixed(1)+' deg',()=>{qaSettle();state.roll=r;state.pitch=p;update(0);return qaCollisions(qaCollect(),BR);});
      await step('full lock with full roll',()=>{qaSettle();state.steer=1;state.roll=BL.rollLock!==undefined?BL.rollLock:BL.roll;update(0);return qaCollisions(qaCollect(),/^(tyre|rim|rotor|caliper|link)/);});
    }
  }finally{Object.assign(state,keep);Object.assign(anim,keepA);update(0);}
  const bad=res.filter(r=>r[1].length).length;
  const lines=['VOXEL GARAGE QA ('+(full?'full':'quick')+'): '+(CAR.name||CARID)+' ('+CARID+'), '+new Date().toISOString().slice(0,16).replace('T',' '),'Build: '+JSON.stringify(cfg),
    nParts+' parts, '+res.length+' checks, '+((performance.now()-t0)/1000).toFixed(1)+' s'];
  for(const [label,r] of res){lines.push((r.length?'FAIL ':'PASS ')+label+(r.length?': '+r.length:''));const QM=(typeof window!=='undefined'&&window.QA_MAX)||30;for(const l of r.slice(0,QM))lines.push('  '+l);if(r.length>QM)lines.push('  ... '+(r.length-QM)+' more');}
  lines.push('QA '+(bad?'FAIL ('+bad+' of '+res.length+' checks)':'PASS'));
  return lines.join('\n');};
{const go=full=>async()=>{const o=$('qaOut'),bs=[$('bQA'),$('bQA2')];o.hidden=false;o.value='Running...';bs.forEach(b=>b&&(b.disabled=true));
    try{o.value=await QA.run(t=>o.value=t,full);}catch(e){o.value='QA error: '+e.message;}bs.forEach(b=>b&&(b.disabled=false));o.focus();o.select();};
  if($('bQA'))$('bQA').onclick=go(false);if($('bQA2'))$('bQA2').onclick=go(true);}
// probes reach the check's own part collection through this handle (read-only use: tests and debugging)
if(typeof window!=='undefined')window.__QA={collect:qaCollect,collisions:qaCollisions,pieces:qaPieces,finite:qaFinite};
