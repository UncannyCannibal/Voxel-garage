// EXTERIOR FIT AUDIT (10 mm skin): every exterior part against the body panels and every other part, cell for cell. Prints PASS/FAIL.
//  1. no two parts share a cell (glass is bonded into the frame; the mirror's sail plate is seated into the skin: those pairs are allowed)
//  2. every exterior part touches something (a panel, the bumper or another part): nothing floats
const fs=require('fs');
let src=['e30_core.js','e30_parts.js','e30_shop_parts.js','modshop.js','e30_detail.js'].map(f=>fs.readFileSync(__dirname+'/'+f,'utf8').replace(/if\(typeof module[\s\S]*$/,'')).join('\n');
src+=';return {buildE30Body,bumperFront,bumperRear,mountedParts,hiCells,buildKidneyFitted,frontLamps,buildBadges,buildDoorMirror,buildHandle};';
const M=new Function(src)();
module.exports=function(R,chk){
  R=R||M.buildE30Body();const H=R.hi;
  const parts={};const add=(name,cells)=>{const p=parts[name]=parts[name]||new Set();for(const [i,j,k] of cells)p.add(i+','+j+','+k);};
  const gl=g=>g.list();
  for(const k of ['body','hood','trunk','doorL','doorR'])add(k,gl(H[k]));for(const k of ['ws','rw','qgL','qgR','dgL','dgR'])add('glass',gl(H.glass[k]));
  add('bumperF',gl(M.bumperFront()));add('bumperR',gl(M.bumperRear()));
  for(const p of M.mountedParts()){const grid=p.kidney?M.buildKidneyFitted(R,p.pos[2]<0?-1:1):p.grid;add(p.id.split('-')[0],M.hiCells({grid,pos:p.pos}));}
  for(const L of M.frontLamps())add(L.kind+(L.sd<0?'L':'R'),M.hiCells({grid:L.lens(),pos:L.pos}));
  const skinZ=sd=>(x,y)=>{const I=Math.round(x*2),J=Math.round(y*2);for(let k=88;k>=0;k--)if((sd<0?H.doorL:H.doorR).get(I,J,sd*k)>=0||H.body.get(I,J,sd*k)>=0)return k/2;return 0;};
  for(const sd of [-1,1]){const m=M.buildDoorMirror(sd,skinZ(sd));add('mirror'+(sd<0?'L':'R'),gl(m.shell));add('mirror'+(sd<0?'L':'R'),gl(m.glass));}
  for(const it of M.buildBadges(R))add(it.id,gl(it.grid));
  const allowed=new Set(['doorL|mirrorL','doorR|mirrorR','body|mirrorL','body|mirrorR']);   // the sail plate is seated into the door and pillar skin
  const names=Object.keys(parts),bad=[];
  for(let i=0;i<names.length;i++)for(let j=i+1;j<names.length;j++){const a=names[i],b=names[j];if(allowed.has(a+'|'+b)||allowed.has(b+'|'+a))continue;
    let n=0;const A=parts[a],B=parts[b];const [S,T]=A.size<B.size?[A,B]:[B,A];for(const k of S)if(T.has(k))n++;if(n)bad.push(a+' x '+b+' '+n);}
  chk(bad.length===0,'exterior fit: '+names.length+' parts checked pairwise against each other and the panels at 10 mm; '+(bad.length?bad.length+' overlapping pairs: '+bad.join('; '):'no part shares a cell with another (glass in its opening, sail plates seated in the skin)'));
  // contact: each exterior part has a cell face-adjacent to (or inside) a different part
  const owner=new Map();for(const n of names)for(const k of parts[n])if(!owner.has(k))owner.set(k,n);
  const panels=new Set(['body','hood','trunk','doorL','doorR','glass']);const floating=[];
  for(const n of names){if(panels.has(n))continue;let touch=false;
    outer:for(const k of parts[n]){const [i,j,kk]=k.split(',').map(Number);for(const d of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1],[0,0,0]]){const o=owner.get((i+d[0])+','+(j+d[1])+','+(kk+d[2]));if(o&&o!==n){touch=true;break outer;}}}
    if(!touch)floating.push(n);}
  chk(floating.length===0,'exterior contact: every part touches the car ('+(floating.length?floating.length+' floating: '+floating.join(', '):names.length-6+' parts, none floating')+')');
  return parts;
};
if(require.main===module){let f=0;module.exports(null,(ok,m)=>{console.log((ok?'PASS ':'FAIL ')+m);if(!ok)f++;});process.exit(f?1:0);}
