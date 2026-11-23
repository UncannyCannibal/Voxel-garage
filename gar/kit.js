/* ===== Cube kit: the car on screen as real building cubes (snap cubes, mini bricks, 3D bead builds). View tab > Cube kit.
   Every visible part's voxel cells (10 mm) are binned into cubes of the chosen size (1 cube = 50 to 150 mm of real car). A cube is filled when its cells
   would make at least a fifth of a 10 mm sheet across it. The outside air is flood-filled from round the car (cube faces only), so a cube is "outside"
   when a face touches that air: its colour is the colour most of its cells nearest that face have (what you see from outside). Cubes no air reaches
   are "inside": any colour, or left out for a hollow shell. Colours are merged to at most 14, or matched to a basic set of 12.
   The plan is layer by layer from the ground up, seen from above with the front at the top; the 3D view shows the cubes up to the chosen layer. ===== */
const KIT={on:false,d:null,scale:100,pal:'model',layer:0,grp:null,im:null,raf:0};
const KIT_GLASS=0x9cc3d6,KIT_INSIDE=0x8b9098;
const KIT_BASIC=[['White',0xf2f2f2],['Light grey',0xa9acb1],['Dark grey',0x4b4e54],['Black',0x161616],['Red',0xc4161c],['Orange',0xef7a1a],['Yellow',0xf4c800],
  ['Green',0x2f8f3a],['Light blue',0x86b8dc],['Blue',0x1f4fa3],['Brown',0x6e4428],['Tan',0xd2b48c]];
const kitKey=(i,j,k)=>((i+512)*1024+(j+512))*1024+(k+512),kitDec=k=>[Math.floor(k/1048576)-512,Math.floor(k/1024)%1024-512,k%1024-512];
const kitDist=(a,b)=>{const r1=a>>16&255,g1=a>>8&255,b1=a&255,r2=b>>16&255,g2=b>>8&255,b2=b&255,rm=(r1+r2)/2,dr=r1-r2,dg=g1-g2,db=b1-b2;   // "redmean": a cheap perceptual distance
  return Math.sqrt((2+rm/256)*dr*dr+4*dg*dg+(2+(255-rm)/256)*db*db);};
const kitNearest=(c,list)=>{let bi=0,bd=1e9;list.forEach((e,i)=>{const d=kitDist(c,e);if(d<bd){bd=d;bi=i;}});return bi;};
const kitHex=c=>'#'+c.toString(16).padStart(6,'0');
// every visible voxel cell of the car, in the body's frame (world units): cb(x, y, z, weight in 10 mm cells, colour as drawn)
function kitCells(cb){
  const vis=o=>{for(let p=o;p&&p!==carRoot;p=p.parent)if(!p.visible)return false;return true;};   // carRoot itself is hidden while the kit is on screen
  scene.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(body.matrixWorld).invert(),M=new THREE.Matrix4(),PNT=0x00fe01,PSH=0x00fe02,paint=matPaint.color.getHex();
  carRoot.traverse(o=>{if(!o.isMesh||!o.geometry||!o.geometry.userData||!o.geometry.userData.src||!vis(o))return;
    const g=o.geometry.userData.src,sel=o.geometry.userData.sel,mat=Array.isArray(o.material)?o.material[0]:o.material,glass=!!(mat&&mat.transparent),mc=mat&&mat.color?mat.color:new THREE.Color(1,1,1);
    if(!g.d||g.x0===undefined)return;
    M.multiplyMatrices(inv,o.matrixWorld);const e=M.elements,w=Math.max(1,Math.round(Math.pow(Math.hypot(e[0],e[1],e[2])/.5,3)));
    let idx=0;for(let x=g.x0;x<=g.x1;x++)for(let y=g.y0;y<=g.y1;y++)for(let z=g.z0;z<=g.z1;z++){const v=g.d[idx++];if(v<0)continue;const isP=v===PNT||v===PSH;if((sel===1&&!isP)||(sel===2&&isP))continue;
      const c=glass?KIT_GLASS:isP?(sel===1?mc.getHex():paint):((Math.round((v>>16&255)*mc.r)<<16)|(Math.round((v>>8&255)*mc.g)<<8)|Math.round((v&255)*mc.b));
      cb(e[0]*x+e[4]*y+e[8]*z+e[12],e[1]*x+e[5]*y+e[9]*z+e[13],e[2]*x+e[6]*y+e[10]*z+e[14],w,c);}});}
function kitMake(sMM,palMode){   // the car parked and level, as the checks see it
  const keep={};for(const k of ['steer','roll','pitch','bodyY','bobExtra'])keep[k]=state[k];state.steer=state.roll=state.pitch=state.bodyY=state.bobExtra=0;update(0);
  try{return kitMake0(sMM,palMode);}finally{Object.assign(state,keep);update(0);}}
function kitMake0(sMM,palMode){
  const b=sMM/20,cnt=new Map(),D6=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
  kitCells((x,y,z,w)=>{const k=kitKey(Math.floor(x/b),Math.floor(y/b),Math.floor(z/b));cnt.set(k,(cnt.get(k)||0)+w);});
  const th=Math.max(2,.2*(sMM/10)**2),occ=new Set(),lo=[1e9,1e9,1e9],hi=[-1e9,-1e9,-1e9];
  for(const [k,n] of cnt)if(n>=th){occ.add(k);const p=kitDec(k);for(let a=0;a<3;a++){lo[a]=Math.min(lo[a],p[a]);hi[a]=Math.max(hi[a],p[a]);}}
  if(!occ.size)return null;
  const air=new Set(),q=[kitKey(lo[0]-1,lo[1]-1,lo[2]-1)],inB=(i,j,k)=>i>=lo[0]-1&&i<=hi[0]+1&&j>=lo[1]-1&&j<=hi[1]+1&&k>=lo[2]-1&&k<=hi[2]+1;air.add(q[0]);
  while(q.length){const [i,j,k]=kitDec(q.pop());for(const [a,c,e] of D6){const I=i+a,J=j+c,K=k+e;if(!inB(I,J,K))continue;const n=kitKey(I,J,K);if(air.has(n)||occ.has(n))continue;air.add(n);q.push(n);}}
  const outer=new Map();for(const k of occ){const [i,j,kk]=kitDec(k);let m=0;D6.forEach(([a,c,e],d)=>{if(air.has(kitKey(i+a,j+c,kk+e)))m|=1<<d;});if(m)outer.set(k,m);}
  const near=new Map(),all=new Map();
  kitCells((x,y,z,w,col)=>{const fx=x/b,fy=y/b,fz=z/b,i=Math.floor(fx),j=Math.floor(fy),k=Math.floor(fz),key=kitKey(i,j,k),m=outer.get(key);if(m===undefined)return;
    const u=[fx-i,fy-j,fz-k];let dm=9;for(let d=0;d<6;d++){if(!(m>>d&1))continue;const ax=d>>1,dep=d&1?u[ax]:1-u[ax];if(dep<dm)dm=dep;}
    const H=dm<.34?near:all;let h=H.get(key);if(!h){h=new Map();H.set(key,h);}h.set(col,(h.get(col)||0)+w);});
  const raw=new Map(),tot=new Map();
  for(const k of outer.keys()){const h=near.get(k)||all.get(k);let best=0,bw=-1;if(h)for(const [c,w] of h)if(w>bw){bw=w;best=c;}raw.set(k,best);tot.set(best,(tot.get(best)||0)+1);}
  // palette: the car's own colours, near ones merged (at most 14), or the nearest of a basic 12
  let kept,map=new Map();
  if(palMode==='basic'){kept=KIT_BASIC.map(e=>e[1]);for(const c of tot.keys())map.set(c,kitNearest(c,kept));}
  else{kept=[];for(const c of [...tot.keys()].sort((p,q)=>tot.get(q)-tot.get(p))){let n=-1,nd=1e9;kept.forEach((e,i)=>{const d=kitDist(c,e);if(d<nd){nd=d;n=i;}});
      if(n>=0&&(nd<90||kept.length>=14))map.set(c,n);else{kept.push(c);map.set(c,kept.length-1);}}}
  const cubes=[];for(const k of occ){const [i,j,kk]=kitDec(k);cubes.push({i,j,k:kk,p:outer.has(k)?map.get(raw.get(k)):-1});}
  const used=new Map();for(const c of cubes)if(c.p>=0)used.set(c.p,(used.get(c.p)||0)+1);
  const order=[...used.keys()].sort((p,q)=>used.get(q)-used.get(p)),re=new Map(order.map((p,n)=>[p,n]));
  const seen=new Map(),pal=order.map((p,n)=>{const hex=kept[p];let nm=palMode==='basic'?KIT_BASIC[p][0]:(hex===KIT_GLASS?'Clear or light blue (glass)':KIT_BASIC[kitNearest(hex,KIT_BASIC.map(e=>e[1]))][0]);
    const r=(seen.get(nm)||0)+1;seen.set(nm,r);if(r>1)nm+=' '+r;   // two shades near one basic colour: "Black", "Black 2"
    return {hex,name:nm,letter:String.fromCharCode(65+n),n:used.get(p)};});
  for(const c of cubes)if(c.p>=0)c.p=re.get(c.p);
  cubes.sort((p,q)=>p.j-q.j||q.i-p.i||p.k-q.k);
  const layers=hi[1]-lo[1]+1,start=new Array(layers+1).fill(0);for(const c of cubes)start[c.j-lo[1]+1]++;for(let n=1;n<=layers;n++)start[n]+=start[n-1];
  return {sMM,b,lo,hi,cubes,pal,start,layers,inside:cubes.filter(c=>c.p<0).length,outside:cubes.filter(c=>c.p>=0).length,car:CAR.name||CARID,cfg:JSON.stringify(cfg)};}
function kitMesh(){const d=KIT.d;if(KIT.grp){scene.remove(KIT.grp);KIT.im.geometry.dispose();KIT.im.material.dispose();}
  const s=d.b*.93,geo=new THREE.BoxGeometry(s,s,s),mat=new THREE.MeshLambertMaterial({color:0xffffff}),im=new THREE.InstancedMesh(geo,mat,d.cubes.length),m4=new THREE.Matrix4(),col=new THREE.Color();
  d.cubes.forEach((c,n)=>{m4.makeTranslation((c.i+.5)*d.b,(c.j+.5)*d.b,(c.k+.5)*d.b);im.setMatrixAt(n,m4);col.setHex(c.p<0?KIT_INSIDE:d.pal[c.p].hex);im.setColorAt(n,col);});
  im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;
  KIT.grp=new THREE.Group();KIT.grp.matrixAutoUpdate=false;KIT.grp.add(im);KIT.im=im;scene.add(KIT.grp);kitShow(true);}
function kitShow(on){KIT.on=on;carRoot.visible=!on;if(KIT.grp)KIT.grp.visible=on;cancelAnimationFrame(KIT.raf);
  if(on){const tick=()=>{if(!KIT.on)return;if(!$('kitPick').classList.contains('open')||state.mode!=='garage'||!window.__bootDone){kitShow(false);return;}
      KIT.grp.matrix.copy(body.matrixWorld);KIT.grp.matrixWorldNeedsUpdate=true;KIT.raf=requestAnimationFrame(tick);};tick();}}
function kitLayer(L){const d=KIT.d;KIT.layer=Math.max(1,Math.min(d.layers,L));$('kitL').value=KIT.layer;if(KIT.im)KIT.im.count=d.start[KIT.layer];kitDraw();}
function kitDraw(){const d=KIT.d,cv=$('kitCv'),L=KIT.layer,j=d.lo[1]+L-1,nx=d.hi[0]-d.lo[0]+1,nz=d.hi[2]-d.lo[2]+1;
  const avail=Math.max(160,cv.parentElement.clientWidth-4),px=Math.max(5,Math.min(22,Math.floor(avail/nz))),dpr=Math.min(2,window.devicePixelRatio||1),W=nz*px+2,H=nx*px+2;
  cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+'px';cv.style.height=H+'px';const g=cv.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);
  const cs=getComputedStyle(document.documentElement),fg=cs.getPropertyValue('--text').trim()||'#111',mu=cs.getPropertyValue('--line').trim()||'rgba(0,0,0,.14)';
  g.clearRect(0,0,W,H);const at=(i,k)=>[1+(k-d.lo[2])*px,1+(d.hi[0]-i)*px];   // front (+x) at the top, the car's right (+z) on the right
  const here=d.cubes.slice(d.start[L-1],d.start[L]),below=L>1?d.cubes.slice(d.start[L-2],d.start[L-1]):[];
  g.fillStyle=mu;for(const c of below){const [X,Y]=at(c.i,c.k);g.fillRect(X+px*.4,Y+px*.4,px*.2,px*.2);}   // the layer below, as dots, to line up on
  for(const c of here){const [X,Y]=at(c.i,c.k);g.fillStyle=kitHex(c.p<0?KIT_INSIDE:d.pal[c.p].hex);g.fillRect(X+.5,Y+.5,px-1,px-1);
    if(c.p<0){g.strokeStyle='rgba(255,255,255,.5)';g.beginPath();g.moveTo(X+2,Y+px-2);g.lineTo(X+px-2,Y+2);g.stroke();}
    else if(px>=13){const h=d.pal[c.p].hex,lum=.3*(h>>16&255)+.59*(h>>8&255)+.11*(h&255);g.fillStyle=lum>140?'#000':'#fff';g.font='600 '+Math.round(px*.62)+'px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(d.pal[c.p].letter,X+px/2,Y+px/2+.5);}}
  g.strokeStyle=mu;g.lineWidth=1;for(let a=0;a<=nz;a+=5){g.beginPath();g.moveTo(1+a*px,1);g.lineTo(1+a*px,H-1);g.stroke();}for(let a=0;a<=nx;a+=5){g.beginPath();g.moveTo(1,1+a*px);g.lineTo(W-1,1+a*px);g.stroke();}
  const per=new Map();let ins=0;for(const c of here){if(c.p<0)ins++;else per.set(c.p,(per.get(c.p)||0)+1);}
  $('kitLn').textContent='Layer '+L+' of '+d.layers+': '+here.length+' cubes';
  $('kitLeg').innerHTML='<table><tr><th></th><th>Colour</th><th>This layer</th><th>Whole kit</th></tr>'+d.pal.map((p,n)=>'<tr><td><span class="ksw" style="background:'+kitHex(p.hex)+'">'+p.letter+'</span></td><td>'+p.name+' <span class="khx">'+kitHex(p.hex)+'</span></td><td>'+(per.get(n)||'')+'</td><td>'+p.n+'</td></tr>').join('')+
    '<tr><td><span class="ksw ins"></span></td><td>Inside: any colour, or leave out for a hollow shell</td><td>'+(ins||'')+'</td><td>'+d.inside+'</td></tr></table>';}
function kitText(){const d=KIT.d,nx=d.hi[0]-d.lo[0]+1,nz=d.hi[2]-d.lo[2]+1,lines=['VOXEL GARAGE CUBE KIT: '+d.car+', 1 cube = '+d.sMM+' mm of the real car','Build: '+d.cfg,
    'Size: '+nx+' long x '+nz+' wide x '+d.layers+' high (cubes). With 1 cm cubes the model is '+nx+' x '+nz+' x '+d.layers+' cm; with 2 cm cubes, double that.',
    'Cubes: '+(d.outside+d.inside)+' ('+d.outside+' on the outside'+(d.inside?', '+d.inside+' inside (any colour; leave them out for a hollow shell)':'')+')','','Colours:'];
  for(const p of d.pal)lines.push('  '+p.letter+'  '+p.name+' ('+kitHex(p.hex)+'): '+p.n);
  lines.push('','Layers, from the ground up (seen from above, front at the top; rows front to back, columns left to right; . = empty, * = inside):');
  for(let L=1;L<=d.layers;L++){const j=d.lo[1]+L-1,G=new Map();for(const c of d.cubes.slice(d.start[L-1],d.start[L]))G.set(c.i+','+c.k,c.p<0?'*':d.pal[c.p].letter);
    lines.push('','Layer '+L+' ('+(d.start[L]-d.start[L-1])+' cubes)');for(let i=d.hi[0];i>=d.lo[0];i--){let r='';for(let k=d.lo[2];k<=d.hi[2];k++)r+=G.get(i+','+k)||'.';lines.push('  '+r);}}
  return lines.join('\n');}
async function kitBuild(){const s=$('kitSum');s.textContent='Building the kit…';await new Promise(r=>setTimeout(r,30));
  const d=kitMake(KIT.scale,KIT.pal);if(!d){s.textContent='Nothing to build.';return;}KIT.d=d;kitMesh();
  const nx=d.hi[0]-d.lo[0]+1,nz=d.hi[2]-d.lo[2]+1;
  s.innerHTML='<b>'+(d.outside+d.inside).toLocaleString()+' cubes</b> in '+d.pal.length+' colours: '+d.outside.toLocaleString()+' outside'+(d.inside?', '+d.inside.toLocaleString()+' inside (optional)':'')+
    '. '+nx+' × '+nz+' × '+d.layers+' cubes, so '+nx+' × '+nz+' × '+d.layers+' cm with 1 cm cubes. The plan is seen from above, front at the top.';
  $('kitL').max=d.layers;kitLayer(d.layers);}
{const open=()=>{if(state.mode!=='garage')setMode('garage');menuEl.classList.remove('open');$('kitPick').classList.add('open');camPreset('showroom');kitBuild();};
  if($('bKit'))$('bKit').onclick=open;
  $('kitClose').onclick=()=>{$('kitPick').classList.remove('open');kitShow(false);};
  [...$('kitTools').querySelectorAll('button')].forEach(bt=>bt.onclick=()=>{if(bt.dataset.s)KIT.scale=+bt.dataset.s;if(bt.dataset.p)KIT.pal=bt.dataset.p;
    [...$('kitTools').querySelectorAll('button')].forEach(x=>x.classList.toggle('on',x.dataset.s?+x.dataset.s===KIT.scale:x.dataset.p===KIT.pal));kitBuild();});
  $('kitL').oninput=e=>kitLayer(+e.target.value);$('kitDn').onclick=()=>kitLayer(KIT.layer-1);$('kitUp').onclick=()=>kitLayer(KIT.layer+1);
  $('kitCopy').onclick=()=>{if(!KIT.d)return;const t=kitText(),ta=$('kitTxt'),fb=()=>{ta.hidden=false;ta.value=t;ta.focus();ta.select();};
    try{navigator.clipboard.writeText(t).then(()=>toast('Kit list copied: colours, counts and every layer'),fb);}catch(e){fb();}};
  addEventListener('resize',()=>{if(KIT.on&&KIT.d)kitDraw();});}
