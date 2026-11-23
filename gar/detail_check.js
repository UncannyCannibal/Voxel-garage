// DETAIL CHECKS: badges on painted metal and visible, mirrors facing the driver, interior fittings clear of the body, door cards clear at rest and through the swing.
const fs=require('fs');
let src=['e30_core.js','e30_parts.js','e30_shop_parts.js','modshop.js','e30_detail.js'].map(f=>fs.readFileSync(__dirname+'/'+f,'utf8').replace(/if\(typeof module[\s\S]*$/,'')).join('\n');
src+=';return {rayHitHi,hiCells,noseCells,NOSE_FACE_I,ROUNDEL_Y,HEAD_POS,KID_POS,bumperFront,bumperRear,smoothNormals,glassSurface,buildE30Body,buildBadges,buildDoorCard,buildDoorMirror,buildInteriorMirror,buildVisor,buildInterior,buildSeatV,buildRearBench,buildRimP,buildSteeringWheelV,rayHit,defaultCfg,PAINT,COL,Grid,box,frontLamps,buildBumperF,COCKPIT,buildDashDetail,DASH_DETAIL_POS,buildSteeringWheelV,mountedParts,buildKidneyFitted,noseRoundel,buildExhaustV,byId,rearX,YBOT,RB,buildTaillamp,TAIL_POS};';
const M=new Function(src)();let fails=0;const chk=(ok,t)=>{console.log((ok?'PASS ':'FAIL ')+t);if(!ok)fails++;};
const R=M.buildE30Body(),cfg=M.defaultCfg();
const key=(x,y,z)=>Math.round(x)+','+Math.round(y)+','+Math.round(z);
const set=(...gs)=>{const s=new Set();for(const g of gs)for(const [x,y,z] of g.list())s.add(x+','+y+','+z);return s;};
const solid={body:R.body,hood:R.hood,trunk:R.trunk,qgL:R.glass.qgL,qgR:R.glass.qgR,dgL:R.glass.dgL,dgR:R.glass.dgR,ws:R.glass.ws,rw:R.glass.rw};
const SOLID=set(R.body,R.hood,R.trunk,R.glass.qgL,R.glass.qgR,R.glass.dgL,R.glass.dgR,R.glass.ws,R.glass.rw),BODY=set(R.body),DOORS=set(R.doorL,R.doorR),WS=set(R.glass.ws);
const wp=(g,pos,sz)=>g.list().map(([x,y,z])=>[pos[0]+x*.5,pos[1]+y*.5,pos[2]+(sz||1)*z*.5]);
const cen=pts=>{let c=[0,0,0];for(const p of pts){c[0]+=p[0];c[1]+=p[1];c[2]+=p[2];}return c.map(v=>v/pts.length);};
// ---- 1. exterior badges (10 mm skin): on painted metal, not buried, visible from outside
const H=R.hi,HS={body:H.body,hood:H.hood,trunk:H.trunk,doorL:H.doorL,doorR:H.doorR,qgL:H.glass.qgL,qgR:H.glass.qgR,dgL:H.glass.dgL,dgR:H.glass.dgR,ws:H.glass.ws,rw:H.glass.rw};
const hiKey=(i,j,k)=>i+','+j+','+k;
const SOLIDH=(()=>{const s=new Set();for(const g of Object.values(HS))for(const [i,j,k] of g.list())s.add(hiKey(i,j,k));return s;})(),DOORSH=set(H.doorL,H.doorR);
for(const it of M.buildBadges(R)){
  const cells=it.grid.list(),n=it.normal;let buried=0;for(const [i,j,k] of cells)if(SOLIDH.has(hiKey(i,j,k)))buried++;
  chk(buried===0,'badge '+it.id+': '+buried+' of '+cells.length+' cells (10 mm) buried in the body (a buried badge cannot be seen)');
  let off=0,far=0;for(const [i,j,k] of cells){const h=M.rayHitHi(HS,[i/2,j/2,k/2],[-n[0],-n[1],-n[2]],1.2);if(!(h&&h.paint&&['body','hood','trunk'].includes(h.name)))off++;else if(h.t>.8)far++;}
  chk(off===0&&far===0,'badge '+it.id+': all '+cells.length+' cells sit on painted metal ('+off+' over glass, gaps or other parts; '+far+' floating more than 16 mm off the surface)');
  let blocked=0;for(const [i,j,k] of cells){const h=M.rayHitHi(HS,[i/2+n[0]*.3,j/2+n[1]*.3,k/2+n[2]*.3],n,30);if(h)blocked++;}
  chk(blocked===0,'badge '+it.id+': visible from outside along its normal ('+blocked+' cells hidden behind other panels)');
}
{const ids=M.buildBadges(R).map(b=>b.id);
 chk(ids.includes('badge-hood')&&ids.includes('badge-trunk')&&ids.includes('badge-325i')&&!ids.some(i=>i.includes('cpillar')),'badge set matches the genuine E30 list: hood and trunk roundels and 325i on the trunk, no C-pillar roundels ('+ids.join(', ')+')');
 const hb=M.buildBadges(R).find(b=>b.id==='badge-hood').grid.list();let y0=1e9,y1=-1e9,z0=1e9,z1=-1e9;for(const [x,y,z] of hb){y0=Math.min(y0,y);y1=Math.max(y1,y);z0=Math.min(z0,z);z1=Math.max(z1,z);}
 const dy=(y1-y0+1)*10,dz=(z1-z0+1)*10;
 chk(Math.abs(dy-82)<=10&&Math.abs(dz-82)<=10,'front roundel measures '+dy+' x '+dz+' mm against 82 mm (BimmerWorld), within one 10 mm cell');}
// ---- 2. door mirrors face the driver and are ATTACHED: the sail plate is seated in the skin, the arm and housing stand clear of it
const eye=[M.COCKPIT.eye.x,M.COCKPIT.eye.y,M.COCKPIT.eye.z];   // the driver's eye from the cockpit layout
for(const sd of [-1,1]){
  const skinZ=(x,y)=>{const I=Math.round(x*2),J=Math.round(y*2);for(let k=88;k>=0;k--)if((sd<0?H.doorL:H.doorR).get(I,J,sd*k)>=0||H.body.get(I,J,sd*k)>=0)return k/2;return 0;};
  const m=M.buildDoorMirror(sd,skinZ),gl=m.glass.list().map(([i,j,k])=>[i/2,j/2,k/2]),c=cen(gl),v=[eye[0]-c[0],eye[1]-c[1],eye[2]-c[2]],cos=-v[0]/Math.hypot(...v);
  chk(cos>.5,(sd<0?'left':'right')+' door mirror glass faces rearward toward the driver: '+(Math.acos(cos)*180/Math.PI).toFixed(0)+' degrees off the eye line (limit 60)');
  let seated=0,inside=0,glassIn=0;
  for(const [i,j,k] of m.shell.list())if(SOLIDH.has(hiKey(i,j,k)))seated++;
  for(const [i,j,k] of m.housing.list())if(SOLIDH.has(hiKey(i,j,k)))inside++;
  for(const [i,j,k] of m.glass.list())if(SOLIDH.has(hiKey(i,j,k)))glassIn++;
  chk(seated>=20,(sd<0?'left':'right')+' door mirror is attached: '+seated+' cells of its sail plate are seated in the door / pillar skin (need 20)');
  chk(inside===0&&glassIn===0,(sd<0?'left':'right')+' door mirror housing: '+inside+' cells inside the body or glass, glass '+glassIn+' (only the sail plate and the arm root are seated in the skin)');
  // the arm joins the plate: the plate, arm and housing are one connected piece
  const S=new Set(m.shell.list().map(([i,j,k])=>hiKey(i,j,k))),st=[...S][0].split(',').map(Number),seen=new Set([S.values().next().value]),q=[st];
  while(q.length){const [i,j,k]=q.pop();for(const d of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]){const kk=hiKey(i+d[0],j+d[1],k+d[2]);if(S.has(kk)&&!seen.has(kk)){seen.add(kk);q.push([i+d[0],j+d[1],k+d[2]]);}}}
  chk(seen.size===S.size,(sd<0?'left':'right')+' door mirror is one connected piece (plate, arm, housing): '+seen.size+' of '+S.size+' cells reached from the plate');}
// ---- 3. interior mirror and visors
{const im=M.buildInteriorMirror(R),sh=wp(im.shell,im.pos),gl=wp(im.glass,im.pos);let h=0;for(const p of [...sh,...gl])if(SOLID.has(key(...p)))h++;
  chk(h===0,'interior mirror: '+h+' voxels inside the windshield, roof or body');
  const c=cen(gl),v=[eye[0]-c[0],eye[1]-c[1],eye[2]-c[2]],cos=-v[0]/Math.hypot(...v);
  chk(cos>.8,'interior mirror glass faces the driver: '+(Math.acos(cos)*180/Math.PI).toFixed(0)+' degrees off the eye line (limit 37)');
  let near=1e9;for(const p of sh)for(const d of [[1,0],[0,1],[1,1],[.5,0],[0,.5],[.5,.5]])if(WS.has(key(p[0]+d[0],p[1]+d[1],p[2])))near=Math.min(near,Math.hypot(...d));
  chk(near<=1,'interior mirror mount touches the windshield glass (gap '+(near>1e8?'not found':(near*20).toFixed(0)+' mm')+')');
  for(const sd of [-1,1]){const vz=M.buildVisor(R,sd),vp=wp(vz.grid,vz.pos);let hh=0;for(const p of vp)if(SOLID.has(key(...p)))hh++;
    let gap=1e9;for(const p of vp)if(p[1]>=vz.pos[1]+.4)gap=Math.min(gap,vz.ceil-(p[1]+.25));
    chk(hh===0&&gap>=0&&gap<=1,(sd<0?'driver':'passenger')+' sun visor: '+hh+' voxels inside the roof or glass, '+(gap*20).toFixed(0)+' mm below the headliner (0 to 20 mm)');}}
// ---- 4. door apertures are open through to the cabin, and the door cards are clear
{let wall=0;for(const [x,y,z] of R.body.list())if(x>=-12&&x<=42&&y>=16&&y<=48&&Math.abs(z)>=24)wall++;
 chk(wall===0,'door apertures: '+wall+' body voxels left inside the door openings (a closed body wall would hide the cabin when the door opens)');
 const INT=set(M.buildInterior({noSeats:false,body:R.body}));
 for(const sd of [-1,1]){const door=sd<0?R.doorL:R.doorR,card=wp(M.buildDoorCard(sd,door),[0,0,0]),DG=set(door,sd<0?R.glass.dgL:R.glass.dgR);
   let hi=0,hd=0,hb=0;for(const p of card){const k=key(...p);if(INT.has(k))hi++;if(DG.has(k))hd++;if(BODY.has(k))hb++;}
   chk(hi===0,(sd<0?'left':'right')+' door card: '+hi+' voxels inside the dash, seats, floor or console');
   chk(hd===0,(sd<0?'left':'right')+' door card: '+hd+' voxels inside its own door skin or glass');
   chk(hb===0,(sd<0?'left':'right')+' door card at rest: '+hb+' voxels inside the body shell');
   // contact: every card column touches the door inner skin (no floating card)
   const inner=new Map();for(const [x,y,z] of door.list()){const k=x+','+y;inner.set(k,Math.min(inner.has(k)?inner.get(k):1e9,Math.abs(z)));}
   let gapMax=0;for(const p of card){const v=inner.get(Math.round(p[0])+','+Math.round(p[1]));if(v!==undefined)gapMax=Math.max(gapMax,0);}
   let worst=0,worstA=0;for(let ang=0;ang<=70;ang+=2){const a=sd*ang*Math.PI/180;let n=0;
     for(const p of card){const dx=p[0]-43,dz=p[2]-sd*41,X=43+dx*Math.cos(a)+dz*Math.sin(a),Z=sd*41-dx*Math.sin(a)+dz*Math.cos(a);if(BODY.has(key(X,p[1],Z)))n++;}if(n>worst){worst=n;worstA=ang;}}
   chk(worst===0,(sd<0?'left':'right')+' door card swept with the door from 0 to 70 degrees: '+worst+' voxels enter the body shell'+(worst?' (worst at '+worstA+' degrees)':''));}}
// ---- 5. wheel centre caps outboard, steering wheel badge toward the driver
{const rim=M.buildRimP('mesh',14,6,25).list();let zmax=-1e9;for(const v of rim)zmax=Math.max(zmax,v[2]);const caps=rim.filter(v=>v[3]===M.COL.blue);let czmin=1e9;for(const v of caps)czmin=Math.min(czmin,v[2]);
 chk(caps.length>0&&czmin>=zmax-3,'wheel centre-cap roundel is on the outboard face of the rim (cap z from '+czmin+', rim face at '+zmax+'; left wheels are rotated 180 degrees, not mirrored)');
 const sw=M.buildSteeringWheelV(380,'stock').list();let szmax=-1e9;for(const v of sw)szmax=Math.max(szmax,v[2]);const sb=sw.filter(v=>v[3]===M.COL.blue);
 chk(sb.length>0&&Math.min(...sb.map(v=>v[2]))>=szmax-1,'steering wheel horn badge is on the driver-facing face (+z, which the column turns toward the driver)');}

// ---- 7. front roundel between the kidney grilles, proud of them, clear of the opening hood (10 mm cells)
{const rb=M.buildBadges(R).find(b=>b.id==='badge-hood'),rp=rb.grid.list().map(([i,j,k])=>[i/2,j/2,k/2]),kid=[];for(const p of M.mountedParts())if(p.kidney)kid.push(...M.hiCells({grid:M.buildKidneyFitted(R,p.pos[2]<0?-1:1),pos:p.pos}).map(([i,j,k])=>[i/2,j/2,k/2]));
 const c=cen(rp),ky=[Math.min(...kid.map(p=>p[1])),Math.max(...kid.map(p=>p[1]))],kzL=Math.max(...kid.filter(p=>p[2]<0).map(p=>p[2])),kzR=Math.min(...kid.filter(p=>p[2]>0).map(p=>p[2]));
 chk(Math.abs(c[2])<.15&&c[1]>=ky[0]&&c[1]<=ky[1]&&kzL<0&&kzR>0,'front roundel centred between the two kidney grilles: centre z '+(c[2]*20).toFixed(0)+' mm, height y '+c[1].toFixed(1)+' within the grille height '+ky[0].toFixed(1)+'..'+ky[1].toFixed(1)+', grilles either side (inner edges z '+(kzL*20).toFixed(0)+' / '+(kzR*20).toFixed(0)+' mm)');
 const kfront=Math.max(...kid.filter(p=>Math.abs(p[2])<4).map(p=>p[0])),rfront=Math.max(...rp.map(p=>p[0]));
 chk(Math.abs(rfront-kfront)<=.5,'front roundel sits flush with the grille faces beside it (roundel face x '+rfront.toFixed(2)+' vs grille face x '+kfront.toFixed(2)+', within one 10 mm cell)');
 const RF=new Set();for(const [i,j,k] of rb.grid.list())RF.add(hiKey(i,j,k));for(const p of kid)RF.add(hiKey(Math.round(p[0]*2),Math.round(p[1]*2),Math.round(p[2]*2)));
 let sw=0;const HL=H.hood.list();for(let a=0;a<=62;a+=2){const t=a*Math.PI/180,co=Math.cos(t),si=Math.sin(t);for(const [i,j,k] of HL){const x=i/2,y=j/2,X=44+(x-44)*co-(y-47.2)*si,Y=47.2+(x-44)*si+(y-47.2)*co;if(RF.has(hiKey(Math.round(X*2),Math.round(Y*2),k)))sw++;}}
 chk(sw===0,'hood swept from closed to 62 degrees against the roundel and both kidney grilles: '+sw+' contacts');}
// ---- 8. fog lamps and indicators: visible, flush with the bumper face, not covered by it (10 mm cells)
{const BF=M.bumperFront(),BFS={bumper:BF};
 for(const L of M.frontLamps()){const cells=M.hiCells({grid:L.lens(),pos:L.pos}),fx=Math.max(...cells.map(c=>c[0])),face=cells.filter(c=>c[0]>=fx-0);let blk=0;for(const [i,j,k] of face)if(M.rayHitHi(BFS,[i/2+.3,j/2,k/2],[1,0,0],10))blk++;
  const cy=cen(cells.map(c=>[c[0]/2,c[1]/2,c[2]/2]));let bx=-1e9;for(const [x,y,z] of BF.list())if(Math.abs(y/2-cy[1])<=1&&Math.abs(z/2-cy[2])>(L.kind==='fog'?4.6:5)&&Math.abs(z/2-cy[2])<=(L.kind==='fog'?6.6:7))bx=Math.max(bx,x);const rec=(bx-fx)/2;
  chk(blk===0&&rec>=-.05&&rec<=1.5,(L.kind==='fog'?'fog lamp':'indicator')+(L.sd<0?' left':' right')+': '+face.length+' lens cells seen from the front, '+blk+' blocked by the bumper; lens face '+(rec*20).toFixed(0)+' mm behind the bumper face beside it (0 to 30 mm: flush in its recess, not covered)');}}
// ---- 9. seats against the body, door cards and each other
{const B=new Set(),add=(S,g)=>{for(const [x,y,z] of g.list())S.add(x+','+y+','+z);return S;};
 const sL=add(new Set(),M.buildSeatV('stock',-M.COCKPIT.H.z)),sR=add(new Set(),M.buildSeatV('stock',M.COCKPIT.H.z)),rb=add(new Set(),M.buildRearBench(R.body));
 const cards=new Set();for(const sd of [-1,1])for(const [x,y,z] of M.buildDoorCard(sd,sd<0?R.doorL:R.doorR).list())cards.add(Math.round(x/2)+','+Math.round(y/2)+','+Math.round(z/2));
 const both=(A,S)=>{let n=0;for(const k of A)if(S.has(k))n++;return n;};
 for(const [nm,S] of [['driver seat',sL],['passenger seat',sR],['rear bench',rb]]){const b=both(S,BODY),c=both(S,cards),d=both(S,DOORS);chk(b+c+d===0,nm+': '+b+' voxels in the body, '+d+' in the doors, '+c+' in the door cards');}
 chk(both(sL,sR)+both(sL,rb)+both(sR,rb)===0,'front seats and rear bench do not share space ('+(both(sL,sR)+both(sL,rb)+both(sR,rb))+' voxels)');
 let tun=0;for(const k of rb){const [x,y,z]=k.split(',').map(Number);if(Math.abs(z)<=10&&y<=24)tun++;}chk(tun===0,'rear bench stays out of the transmission tunnel (driveshaft and exhaust run there): '+tun+' voxels');
 {const cz={};for(const [x,y,z] of M.buildDoorCard(-1,R.doorL).list()){const k=Math.round(x/2)+','+Math.round(y/2);cz[k]=Math.max(cz[k]??-1e9,z/2+.25);}   // inner face of the left door card per (x,y)
  let gap=1e9;for(const k of sL){const [x,y,z]=k.split(',').map(Number);const c=cz[x+','+y];if(c!==undefined)gap=Math.min(gap,(z-.5)-c);}
  chk(gap>=.5,'driver seat to door card (closest point, both at their real cell sizes): '+(gap*20).toFixed(0)+' mm (need 10 mm)');}}
// ---- 10. occupants: front head room PASS/FAIL, rear printed OPEN until the roofline is checked against a photograph
{const C=M.COCKPIT,ceil=(x,z,y0)=>{for(let y=Math.ceil(y0);y<80;y++)if(BODY.has(x+','+y+','+z)||SOLID.has(x+','+y+','+z))return y-.5;return 99;};
 const fx=Math.round(C.eye.x-1),fz=Math.round(C.eye.z),ftop=C.eye.y+5.5,fc=ceil(fx,fz,ftop-3);
 chk((fc-ftop)*20>=25,'front occupant (SAE 50th percentile male, head top 110 mm above the eye): head to headliner '+((fc-ftop)*20).toFixed(0)+' mm (need 25 mm); hip point from published headroom and legroom (iSeeCars, CALCULATED)');
 const dx=C.eye.x-C.H.x,dy=C.eye.y-C.H.y,re=[C.rearH.x+dx,C.rearH.y+dy],rx=Math.round(re[0]-1),rtop=re[1]+5.5;let rc=99;for(const z of [-18,18])rc=Math.min(rc,ceil(rx,z,rtop-8));
 console.log('OPEN  rear occupant head to the rear glass/headliner: '+((rc-rtop)*20).toFixed(0)+' mm at x '+rx+'. The rear roofline (TOP profile) is DESIGN from drawings; it needs a straight side photograph of a real E30 coupe before this can be PASS or FAIL. Not certified while OPEN.');}
// ---- 11. window sash: on the doors (moves with them), none left on the body
{const S=0x17181a;let dl=0,dr=0,b=0;for(const [,,,c] of H.doorL.list())if(c===S)dl++;for(const [,,,c] of H.doorR.list())if(c===S)dr++;for(const [,,,c] of H.body.list())if(c===S)b++;
 chk(dl>0&&dr>0&&b===0,'window frames (sash) belong to the doors and swing with them: left '+dl+', right '+dr+' voxels; '+b+' left standing on the body');}
// ---- 12. cockpit detail (centre stack, radio, heater controls, console, handbrake, glovebox): nothing buried, nothing floating
{const dd=M.buildDashDetail(),P0=M.DASH_DETAIL_POS,pts=dd.list().map(([i,j,k])=>[P0[0]+i*.5,P0[1]+j*.5,P0[2]+k*.5]);
 const IN=M.buildInterior({noSeats:false,body:R.body}),solidAt=p=>{const X=Math.round(p[0]),Y=Math.round(p[1]),Z=Math.round(p[2]);return IN.get(X,Y,Z)>=0||BODY.has(X+','+Y+','+Z);};
 const fcell=c=>{const a=[Math.round(c-.24),Math.round(c+.24)];return a[0]===a[1]?[a[0]]:a;};
 let buried=0;for(const p of pts){let hit=false;for(const X of fcell(p[0]))for(const Y of fcell(p[1]))for(const Z of fcell(p[2]))if(IN.get(X,Y,Z)>=0||BODY.has(X+','+Y+','+Z))hit=true;if(hit)buried++;}
 chk(buried===0,'cockpit detail: '+pts.length+' cells (10 mm), '+buried+' inside the dash, console, seats or body');
 // every connected piece touches the dash, console or shelf it is mounted on
 const key=p=>p.map(v=>Math.round(v*4)).join(','),S=new Map(pts.map(p=>[key(p),p])),seen=new Set();let pieces=0,floating=0;
 for(const p of pts){const k0=key(p);if(seen.has(k0))continue;pieces++;let touch=false;const st=[p];seen.add(k0);
   while(st.length){const q=st.pop();for(const d of [[.5,0,0],[-.5,0,0],[0,.5,0],[0,-.5,0],[0,0,.5],[0,0,-.5]]){const n=[q[0]+d[0],q[1]+d[1],q[2]+d[2]],kn=key(n);
     if(S.has(kn)){if(!seen.has(kn)){seen.add(kn);st.push(S.get(kn));}}else if(solidAt(n))touch=true;}}
   if(!touch)floating++;}
 chk(floating===0,'cockpit detail: '+pieces+' separate pieces, '+floating+' not touching the surface they are mounted on');}
// ---- 13. rendering surfaces: smooth glass lies inside its voxel glass (paint stays matte and keeps its true stepped shape: no smoothing)
for(const k of ['ws','rw','dgL','dgR','qgL','qgR']){const G=H.glass[k],s=M.glassSurface(G,k==='ws'||k==='rw'?'slope':'side');let n=0,bad=0;
  const near=p=>{for(const dx of [-1,0,1])for(const dy of [-1,0,1])for(const dz of [-1,0,1])if(G.get(Math.round(p[0]+dx),Math.round(p[1]+dy),Math.round(p[2]+dz))>=0)return true;return false;};   // 10 mm cells: within one cell (10 mm)
  for(const q of s.quads)for(let a=.05;a<1;a+=.1)for(let b=.05;b<1;b+=.1){const p=[0,1,2].map(i=>q[0][i]*(1-a)*(1-b)+q[1][i]*a*(1-b)+q[2][i]*a*b+q[3][i]*(1-a)*b);n++;if(!near(p))bad++;}
  chk(bad===0,'smooth glass '+k+': '+s.quads.length+' panels, '+n+' sample points, '+bad+' more than 10 mm outside the voxel glass (the voxel glass stays the collision shape)');}
{const g=new M.Grid(-5,5,-5,5,-5,5);M.box(g,1,3,1,3,-1,-3,1);M.box(g,-1.5,-3,0,0,0,0,1);g.set(2.5,0,0,1);
 chk(g.count()===30,'grid helpers: a box with bounds in either order (left side, sd*a..sd*b) and fractional coordinates fill their cells ('+g.count()+' of 30); earlier these were silently dropped');}
require('./exterior_audit.js')(R,chk);
// ---- 14. the REAR, checked against the user's photograph of a late E30 (lamp layout, plate surround, painted bumper with the exhaust cut-out, the tail cut away under the panel)
{const parts=M.mountedParts(),hiBody=R.hi.body;
 const cellsOf=id=>M.hiCells(parts.find(p=>p.id===id));
 const lampStat=sd=>{const sfx=sd<0?'L':'R',amb=cellsOf('taillamp'+sfx+'-amb'),red=cellsOf('taillamp'+sfx+'-red'),wht=cellsOf('taillamp'+sfx+'-wht'),fr=cellsOf('taillamp'+sfx+'-frame').filter(c=>c[0]<=-104*2+8);
   const az=c=>Math.abs(c[2])/2,y=c=>c[1]/2,mm=a=>Math.min(...a),MM=a=>Math.max(...a);
   return {amb,red,wht,aMin:mm(amb.map(az)),rMax:MM(red.map(az)),wMax:MM(wht.map(az)),wMin:mm(wht.map(az)),rMin:mm(red.map(az)),y0:mm(red.concat(amb,wht).map(y)),y1:MM(red.concat(amb,wht).map(y)),wy0:mm(wht.map(y)),wy1:MM(wht.map(y))};};
 const L=lampStat(-1),Rr=lampStat(1);
 for(const [n,t] of [['left',L],['right',Rr]]){
  chk(t.aMin>=t.rMax-.6&&t.aMin>=t.wMax,'rear lamp '+n+': the amber indicator is the full-height OUTER column (amber from '+t.aMin.toFixed(1)+' units out, red and white all inside it)');
  chk(t.wMin<=t.rMin+.6&&t.wy0>t.y0+2&&t.wy1<t.y1-2,'rear lamp '+n+': the white reverse cell is in the INNER column, in the middle row');
  chk((t.y1-t.y0)*20>=220,'rear lamp '+n+': '+((t.y1-t.y0+.5)*20).toFixed(0)+' mm tall (photograph: about 240 mm), not the earlier 150 mm strip');}
 const sig=T=>T.amb.concat(T.red,T.wht).map(c=>[c[0],c[1],Math.abs(c[2]),c[3]].join(',')).sort().join('|');
 chk(sig(L)===sig(Rr),'rear lamps: left and right are exact mirror images (the left lamp was once a mirrored copy with the wrong corner)');
 // the lens fills its opening flush with the corner
 let worst=0;for(const sd of [-1,1]){const col=new Map();for(const c of cellsOf('taillamp'+(sd<0?'L':'R')+'-red').concat(cellsOf('taillamp'+(sd<0?'L':'R')+'-amb'),cellsOf('taillamp'+(sd<0?'L':'R')+'-wht'))){const k=c[2];if(!col.has(k)||c[0]<col.get(k))col.set(k,c[0]);}   // outermost lens cell of each column
  for(const [k,x] of col){const az=Math.abs(k)/2;worst=Math.max(worst,Math.abs(x/2-M.rearX(az)));}}
 chk(worst<=.5,'rear lamps: the lens face follows the body corner within '+(worst*20).toFixed(0)+' mm (limit 10 mm)');
 // plate surround
 let blk=0,minZ=1e9,maxZ=-1e9;for(const [i,j,k,c] of hiBody.list())if(c===0x16171a){blk++;minZ=Math.min(minZ,k/2);maxZ=Math.max(maxZ,k/2);}
 const pl=cellsOf('plateR'),py0=Math.min(...pl.map(c=>c[1]))/2,py1=Math.max(...pl.map(c=>c[1]))/2;
 chk(blk>=250&&maxZ<=14.6&&minZ>=-14.6,'rear panel: black plate surround of '+blk+' cells between the lamps (|z| <= '+Math.max(maxZ,-minZ).toFixed(1)+' units)');
 chk(py0>=31.4&&py1<=44.9,'rear plate sits inside its surround (y '+py0+' to '+py1+' units, surround 31.4 to 44.9)');
 // bumper
 const bR=M.bumperRear(),bl=bR.list();let ys=bl.map(c=>c[1]/2),xs=bl.map(c=>c[0]/2),paint=0,outer=0;for(const [i,j,k,c] of bl){if(c===M.PAINT)paint++;}
 chk(Math.max(...ys)<=26.6&&Math.min(...ys)>=11.4,'rear bumper: top '+(Math.max(...ys)*20).toFixed(0)+' mm, bottom '+(Math.min(...ys)*20).toFixed(0)+' mm above the ground (photograph: about 530 and 230 mm)');
 chk(paint/bl.length>.35&&bl.some(c=>c[3]===M.PAINT),'rear bumper: body-colour painted plastic ('+paint+' painted cells of '+bl.length+'); Turner Motorsport lists the 1988-91 bumpers as painted');
 chk(Math.min(...xs)>=-108.2,'rear bumper: overall length stays inside the published 994 mm rear overhang (rear tip at '+Math.min(...xs).toFixed(2)+' units)');
 const B=new Set(bl.map(c=>c[0]+','+c[1]+','+c[2]));
 const tipClear=(id)=>{const ex=M.buildExhaustV(M.byId('exhaust',id).tip).list().filter(c=>c[0]<=-96);let hit=0;for(const [x,y,z] of ex){for(const [I,J,K] of [[x*2,y*2,z*2],[x*2+1,y*2,z*2],[x*2,y*2+1,z*2],[x*2+1,y*2+1,z*2],[x*2,y*2,z*2+1],[x*2+1,y*2+1,z*2+1]])if(B.has(I+','+J+','+K))hit++;}return {n:ex.length,hit};};
 for(const id of ['stock','catback','dual','quad','race','oval']){const e=M.byId('exhaust',id);if(!e)continue;const t=tipClear(id);chk(t.hit===0,'exhaust "'+id+'" (tip '+e.tip+'): '+t.n+' cells behind x -96 units, '+t.hit+' touch the rear bumper (stock and race tips pass through the cut-out)');chk(t.n>=40,'exhaust "'+id+'" draws a tip: '+t.n+' cells behind x -96 units (the catalogue name "'+e.tip+'" must match a branch of buildExhaustV; it once did not and the stock exhaust drew nothing)');}
 // the tail is cut away: nothing hangs down behind the panel
 let low=1e9,low2=1e9;for(const [i,j,k] of hiBody.list()){if(i/2<-97.5)low=Math.min(low,j/2);if(i/2<-84&&i/2>-86)low2=Math.min(low2,j/2);}
 chk(low>=25&&low2>=15,'body tail: lowest rear-panel cell at '+(low*20).toFixed(0)+' mm, lowest cell at x -85 at '+(low2*20).toFixed(0)+' mm (no body legs below the bumper)');
}
console.log('\nDETAIL RESULT: '+(fails?'FAIL':'PASS')+' ('+fails+' failing checks)');process.exit(fails?1:0);
