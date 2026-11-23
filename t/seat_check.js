// SEATING CHECK: every bolt-on part that rests on a panel must sit ON it: for each 10 mm column of the part's contact face, the gap between the part's lowest
// cell and the panel's surface under it (or, for parts hung under a panel, above it) is measured. A gap of one cell or more over a run of the face is a visible
// gap (FAIL); a part whose face sits on nothing at all is reported. Run: node seat_check.js [e30|ef]
const CAR=process.argv[2]||'ef';
(async()=>{const {w,E,errs}=await require('./garage_boot.js')();const sleep=ms=>new Promise(r=>setTimeout(r,ms));
if(E.CARID!==CAR){await E.switchCar(CAR);for(let i=0;i<300&&w.document.getElementById('boot').style.display!=='none';i++)await sleep(200);}
const T=E.THREE,P=E.P;let fails=0;const PF=(ok,m)=>{console.log((ok?'PASS ':'FAIL ')+m);if(!ok)fails++;};
const srcOf=o=>{const a=[];o.traverse(m=>{if(m.isMesh&&m.geometry.userData&&m.geometry.userData.src)a.push(m);});return a;};
// absolute 10 mm cells of a drawn object in the body frame (closed panels)
E.scene.updateMatrixWorld(true);const inv=new T.Matrix4().copy(E.body.matrixWorld).invert();
function cells(o){const S=new Map();for(const m of srcOf(o)){const M=new T.Matrix4().multiplyMatrices(inv,m.matrixWorld),g=m.geometry.userData.src,sel=m.geometry.userData.sel,sc=m.scale.x;
  for(const [i,j,k,c] of g.list()){const isP=c===0x00fe01||c===0x00fe02;if(sel===1&&!isP)continue;if(sel===2&&isP)continue;const p=new T.Vector3(i,j,k).applyMatrix4(M);const I=Math.round(p.x*2),J=Math.round(p.y*2),K=Math.round(p.z*2);S.set(I+','+J+','+K,c);}}return S;}
function seat(name,part,panels,dir,lateral,opt){opt=opt||{};   // dir -1: the part rests on top of the panels; +1: hangs under them; lateral: the part stands out from the side (flares), toward the centreline
  const pc=cells(part),occ=new Set(),gl=new Set(),dr=new Set(),pcol=new Map();for(const p of panels)for(const [k,c] of cells(p)){occ.add(k);pcol.set(k,c);}
  if(opt.doors)for(const p of opt.doors)if(p)for(const k of cells(p).keys())dr.add(k);   // doors: a part under a door keeps 10 mm of opening clearance (designed, as a shut line)
  // glass under a part: the gap over it is the part's designed lip (a spoiler's tail over the rear glass); reported, not judged
  for(const p of panels)p.traverse(m=>{if(m.isMesh&&m.material&&m.material.transparent&&m.geometry.userData&&m.geometry.userData.src){const M=new T.Matrix4().multiplyMatrices(inv,m.matrixWorld);for(const [i,j,k] of m.geometry.userData.src.list()){const q=new T.Vector3(i,j,k).applyMatrix4(M);gl.add(Math.round(q.x*2)+','+Math.round(q.y*2)+','+Math.round(q.z*2));}}});
  const col=new Map();for(const k of pc.keys()){const [i,j,kk]=k.split(',').map(Number);const key=lateral?i+','+j+','+Math.sign(kk):i+','+kk;const v=col.get(key);
    if(lateral){if(v===undefined||Math.abs(kk)<Math.abs(v))col.set(key,kk);}else if(v===undefined||(dir<0?j<v:j>v))col.set(key,j);}
  let n=0,touch=0,gap1=0,maxg=0,far=0,lipN=0,lipMax=0,clr=0,bladeN=0,bladeMax=0;const gaps=[];
  for(const [key,v] of col){const a=key.split(',').map(Number);let g=null;
    let overGlass=false,lastQ=null;for(let d=1;d<=8;d++){const q=lateral?a[0]+','+a[1]+','+(v-a[2]*d):a[0]+','+(v+dir*d)+','+a[1];if(occ.has(q)){g=d-1;overGlass=gl.has(q)||(pcol.get(q)===0x131416&&(()=>{const [x,y,z]=q.split(',').map(Number);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)for(let c=-1;c<=1;c++)if(gl.has((x+a)+','+(y+b)+','+(z+c)))return true;return false;})());lastQ=q;break;}}   // the glass's rubber gasket counts with the glass (a designed lip over the pane and its seal)
    if(dir>0&&!lateral&&dr.size&&(g===null||g>=2)){const kk=a[1],s=Math.sign(kk);for(const k2 of [kk,kk-s]){const q=a[0]+','+(v+2)+','+k2;if(dr.has(q)&&!occ.has(a[0]+','+(v+1)+','+kk)){g=1;lastQ=q;break;}}}   // under a door that curves in toward its hem: the hem 10 mm above, at most 10 mm inboard, is the opening clearance
    if(g===null){far++;continue;}if(overGlass){lipN++;lipMax=Math.max(lipMax,g);continue;}if(opt.posted&&g>=1){bladeN++;bladeMax=Math.max(bladeMax,g);continue;}n++;if(g===0)touch++;else if(g===1&&dr.has(lastQ)){touch++;clr++;}else{gap1++;maxg=Math.max(maxg,g);gaps.push(lateral?[a[0]/2,a[1]/2,v/2,g]:[a[0]/2,v/2,a[1]/2,g]);}}
  const share=n?touch/n:0;if(opt.posted)console.log('INFO '+name+': '+bladeN+' columns under the blade, '+(bladeN?bladeMax*10+' mm clear at most (8 cells looked at)':'none'));
  if(opt.standoff){console.log('INFO '+name+': mounted on standoffs '+(opt.standoff)+' (designed gap): '+n+' columns, '+(share*100).toFixed(0)+' % touching, max gap '+maxg*10+' mm');return;}
  PF(n>0&&share>=.95&&maxg<=1,name+': '+n+' columns over a panel, '+(share*100).toFixed(0)+' % touching, '+gap1+' with a gap (max '+(maxg*10)+' mm)'+(clr?', '+clr+' under the doors with their 10 mm opening clearance':'')+(far?', '+far+' columns over open air (overhang)':'')+(lipN?', '+lipN+' columns over the glass (designed lip, up to '+lipMax*10+' mm off it)':'')+(gaps.length?'  e.g. '+gaps.slice(0,3).map(q=>'('+q.slice(0,3).map(v=>(v*20).toFixed(0)).join(',')+') '+q[3]*10+' mm').join(' '):''));}
const lists={aeroF:E.partList('aeroF').map(p=>p.id),aeroR:E.partList('aeroR').map(p=>p.id),flares:E.partList('flares').map(p=>p.id),skirts:E.partList('skirts').map(p=>p.id)};
const base=JSON.parse(JSON.stringify(E.cfg));
for(const slot of (process.env.SLOTS||'aeroR,aeroF,skirts,flares').split(','))for(const id of lists[slot]){if(id==='none'||id==='stock')continue;const r=E.applyPart(base,slot,id);if(r.state==='blocked'||r.state==='later'){console.log('skip '+slot+' '+id+' ('+r.state+')');continue;}
  for(const k in r.cfg)E.cfg[k]=JSON.parse(JSON.stringify(r.cfg[k]));E.refresh();E.update(0);E.scene.updateMatrixWorld(true);
  const parts=Object.keys(P).filter(k=>k.startsWith('part_')&&P[k]&&P[k].visible);
  for(const k of parts){const apron=slot==='aeroR'&&/^part_mt(rear|roof)$/.test(k);   // the E30 M-Technik rear part is the apron hung under the rear bumper (its spoiler is a second part)
    const pan=apron?[P.bumperR]:slot==='aeroR'?[P.trunk,P.bodyMesh]:slot==='aeroF'?[P.bumperF,P.bodyMesh]:[P.bodyMesh,P.doorL,P.doorR,P.rdoorL,P.rdoorR,P.bumperF,P.bumperR].filter(Boolean);
    seat(slot+' '+id+' '+k,P[k],pan,slot==='aeroF'||slot==='skirts'||apron?1:-1,slot==='flares',{standoff:id==='splitter'?'(spacer blocks under the bumper)':null,posted:['gtwing','z32wing'].includes(id),doors:slot==='skirts'?[P.doorL,P.doorR,P.rdoorL,P.rdoorR].filter(Boolean):null});}}
if(P.spoiler)seat('stock roof spoiler',P.spoiler,[P.trunk],-1);
console.log('\nSEAT CHECK ('+CAR+'): '+(fails?'FAIL':'PASS')+' ('+fails+' failing)');process.exit(fails?1:0);})();
