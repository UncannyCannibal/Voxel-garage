/* ===== MOD SHOP VISUAL PARTS. "half" grids = 10 mm voxels (mesh scale .5 in the 20 mm world). ===== */
/* ---- parametric wheel set (axle along z). All sizes derive from the real inputs. ---- */
function buildTireP(ODmm,twmm,rimIn,rimWIn){   // rimWIn: the rim's width; given, the bead sits on the rim's bead seat and inside its flanges (no overlap with the rim)
  const ro=ODmm/20,rimR=rimIn*25.4/20,ri=rimWIn?rimR-.2:rimR-0.6,hw=twmm/20,rhw=rimWIn?rimWIn*25.4/20:0;               // half-voxel units (10 mm)
  const R=Math.ceil(ro)+1,Z=Math.ceil(hw)+1;
  const g=new Grid(-R,R,-R,R,-Z,Z);
  g.fill((x,y,z)=>{
    const r=Math.hypot(x,y),az=Math.abs(z);if(az>hw)return -1;
    const rr2=ro-Math.max(0,az-hw*.7)*1.35;if(r>rr2||r<ri)return -1;if(rimWIn&&az>=rhw-1.3&&r<rimR+1.2)return -1;   // beside the rim flanges the bead starts above them
    const a=Math.atan2(y,x);
    const rr=rr2;if(r>=rr-1.4){if(az<=.5||(az>=hw*.4&&az<=hw*.4+.6))return 0x07080a;return (Math.floor(a*20/Math.PI+(az>hw*.4?.5:0))&1)?0x1c1d20:0x121315;}
    if(az>=hw-1.6&&((r>ri+(ro-ri)*.62&&r<ri+(ro-ri)*.68)||(r>ri+(ro-ri)*.38&&r<ri+(ro-ri)*.42)))return 0x2c2d30;
    return 0x0e0f11;});
  return g;
}
function ringPatternP(style,r,a,rim){
  const rin=5.5,rout=rim-1.2;if(r<rin||r>rout)return false;
  const t=(r-rin)/(rout-rin);
  if(style==='mesh'){const k=Math.abs(Math.sin(a*14+r*.62)),m=Math.abs(Math.sin(a*14-r*.62)),w=.34+.12*t;return k<w||m<w||r<rin+1.7||r>rout-1.4;}   // the cross-spokes thicken toward the rim, so each stays one piece in 10 mm cells
  if(style==='star'){const w=(Math.PI/5)*(0.46-0.18*t),f=((a%(Math.PI*2/5))+Math.PI*2/5)%(Math.PI*2/5)-Math.PI/5;return Math.abs(f)<w||r<rin+1.5||r>rout-1.2;}
  if(style==='steel'){if(r<rin+1.5||r>rout-1.2)return true;const n=6,f=((a%(Math.PI*2/n))+Math.PI*2/n)%(Math.PI*2/n)-Math.PI/n;return !(t>.42&&t<.7&&Math.abs(f)<.17&&Math.abs(t-.56)<.15);}   // pressed steel: a plain disc with a ring of six slots
  if(style==='bottlecap'){if(r<rin+1.5||r>rout-1.2)return true;const n=10,f=((a%(Math.PI*2/n))+Math.PI*2/n)%(Math.PI*2/n)-Math.PI/n;return !(t>.35&&t<.7&&Math.hypot(f*r,(t-.52)*(rout-rin))<1.6);}   // flat disc with ten round holes
  if(style==='turbine'){if(r<rin+1.5||r>rout-1.2)return true;const n=12,f=(((a+t*.9)%(Math.PI*2/n))+Math.PI*2/n)%(Math.PI*2/n);return f<Math.PI*2/n*.55;}   // curved fan blades
  if(style==='split'){if(r<rin+1.5||r>rout-1.2)return true;const n=5,f=((a%(Math.PI*2/n))+Math.PI*2/n)%(Math.PI*2/n)-Math.PI/n,w=(Math.PI/n)*(.34-.1*t);return Math.abs(Math.abs(f)-w*1.15)<w*.55;}   // five split (double) spokes
  if(style==='spoke6'||style==='spoke8'){const n=style==='spoke6'?6:8,f=((a%(Math.PI*2/n))+Math.PI*2/n)%(Math.PI*2/n)-Math.PI/n,w=(Math.PI/n)*(n===6?(.44-.2*t):(.36-.14*t));return Math.abs(f)<w||r<rin+1.5||r>rout-1.1;}   // straight spokes, wider at the hub
  if(style==='z32'){if(r<rin+1.5||r>rout-1.2)return true;const n=5,f=((a%(Math.PI*2/n))+Math.PI*2/n)%(Math.PI*2/n)-Math.PI/n,w=.42*(1-t)+.12;return !(t>.12&&t<.9&&Math.abs(f)<w*(t*1.1+.25));}   // flat disc with five teardrop windows, narrow at the hub (the Z32 Twin Turbo wheel)
  if(style==='dish3'){if(r<rin+1.5)return true;if(r>rout-2.2)return r>rout-1.1||Math.abs(((a*16/Math.PI)%2+2)%2-1)<.3;const n=10,f=((a%(Math.PI*2/n))+Math.PI*2/n)%(Math.PI*2/n)-Math.PI/n;return Math.abs(f)<(Math.PI/n)*(.28-.08*t);}   // thin spokes, an assembly-bolt ring at the lip
  if(style==='split5'){if(r<rin+1.5||r>rout-1.2)return true;const n=5,f=((a%(Math.PI*2/n))+Math.PI*2/n)%(Math.PI*2/n)-Math.PI/n,w=(Math.PI/n)*(.34-.1*t);return Math.abs(Math.abs(f)-w*1.15)<w*.55;}   // five split (double) spokes, as 'split': the Eclipse GSX 17-in face (five split pairs = 10 spokes, photo-derived)
  if(style==='spoke5'){if(r<rin+1.5||r>rout-1.2)return true;const n=5,f=((a%(Math.PI*2/n))+Math.PI*2/n)%(Math.PI*2/n)-Math.PI/n,w=(Math.PI/n)*(.40-.17*t);return Math.abs(f)<w||r<rin+1.5||r>rout-1.1;}   // straight five spokes: the Eclipse 2Ga 16-in option face (DESIGN)
  const holes=(t>.28&&t<.78)&&Math.abs(((a%(Math.PI/4))+Math.PI/4)%(Math.PI/4)-Math.PI/8)<.20;return !holes;
}
function buildRimP(style,rimIn,widthIn,etMM,cap,opts){   // opts.exact: the centre disc's mounting face sits exactly ET from the rim centreline (outboard), as on the real wheel   // cap: 'bmw' (default, the E30's roundel) or 'plain' (dark cap with a silver ring, for every other make)
  const rim=rimIn*25.4/20,hw=widthIn*25.4/20;                       // rim radius and width in half-voxels
  const R=Math.ceil(rim+2),Z=Math.ceil(hw+3);
  const g=new Grid(-R,R,-R,R,-Z,Z);
  const halfW=hw,face=(opts&&opts.exact)?Math.min(etMM/10,halfW-.5)+1:halfW-3.5-Math.max(0,(etMM-10)/9);   // exact: spokes from the mounting face (ET) outward; legacy: wheel face recess grows with offset
  g.fill((x,y,z)=>{
    const r=Math.hypot(x,y),a=Math.atan2(y,x);
    if(r>rim+1.2)return -1;
    if(r>=rim-1.7&&r<=rim-.2&&z>=-halfW&&z<=halfW)return 0x8d9298;           // barrel
    if(r>=rim-.2&&r<=rim+1.2&&Math.abs(z)>=halfW-1.3&&Math.abs(z)<=halfW)return COL.chrome;  // lips
    if(z>=face-1&&z<=face+.8&&r<rim-1.7&&ringPatternP(style,r,a,rim)){return r<7.2?0x2a2c2f:(style==='steel'?(z>=face?0x62666d:0x4a4d53):(z>=face?0xcfd4da:0x80858c));}
    if(z>=face-1&&z<=face+2.6&&r<=4.8){if(r<=2.2&&z>=face+1.6)return cap==='plain'?(r>=1.5?0xb9bec5:0x1d1e21):(((x>=0)!==(y>=0))?COL.white:COL.blue);for(let i=0;i<4;i++){const q=i*Math.PI/2+Math.PI/4;if(Math.hypot(x-3.4*Math.cos(q),y-3.4*Math.sin(q))<=.95&&z>=face+1.6)return COL.chrome;}return 0x3a3d42;}
    return -1;});
  // a pattern cell touching no other cell by a face or an edge (a lone corner of a cross-spoke at the face) is dropped: it would read as a loose speck
  const N18=[];for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)for(let dz=-1;dz<=1;dz++){const n=Math.abs(dx)+Math.abs(dy)+Math.abs(dz);if(n===1||n===2)N18.push([dx,dy,dz]);}
  {const seen=new Set(),key=(x,y,z)=>x+','+y+','+z;for(const [x,y,z] of g.list()){const k0=key(x,y,z);if(seen.has(k0))continue;const comp=[[x,y,z]];seen.add(k0);
    for(let q=0;q<comp.length;q++){const [a,b,c]=comp[q];for(const [dx,dy,dz] of N18){const k=key(a+dx,b+dy,c+dz);if(!seen.has(k)&&g.get(a+dx,b+dy,c+dz)>=0){seen.add(k);comp.push([a+dx,b+dy,c+dz]);}}}
    if(comp.length<12)for(const [a,b,c] of comp)g.set(a,b,c,-1);}}   // (and any loose bit smaller than a dozen cells)
  return g;
}
function buildRotorP(rotorMM){   // origin on the hub face: the hat's mounting flange sits on it (clamped between hub and wheel), the disc 25-45 mm inboard
  const rr=rotorMM/20,R=Math.ceil(rr)+1;const g=new Grid(-R,R,-R,R,-5,0);
  g.fill((x,y,zz)=>{const z=-zz,r=Math.hypot(x,y);
    if(z>=2.5&&z<=4.5&&r>=rr*.5&&r<=rr){return ((Math.floor(Math.atan2(y,x)*12/Math.PI)&1)&&r>rr*.62&&r<rr*.95)?0x8f949a:0xa6abb1;}
    if(z>=1&&z<=4.5&&r<=rr*.5&&r>=1.6)return 0x6a6e75;return -1;});return g;}   // hat with its centre bore (the hub spigot); its face is the hub face: no cell of it stands outboard of that plane, where the wheel's mounting face bears on it
// the caliper drawn for a brake option (C-10): a real kit names its piston count (pot: '4pot' / '6pot') and colour (calCol); its rear is potR / calColR, or
// the stock caliper when the kit is front-only. The older entries keep the old rule (bbk4 / bbk6 by id; the Z32 Twin Turbo's 4-piston)
function calType(br,rear){if(br.pot)return rear?(br.potR||'stock'):br.pot;return br.id==='bbk6'?'6pot':(br.id==='bbk4'||br.id==='z32-tt')?'4pot':'stock';}
function calCol(br,rear){return br.pot?(rear?br.calColR:br.calCol):undefined;}
function buildCaliperP(rotorMM,type,slot,colour){   // slot: leave the slot the disc runs in (pads either side, bridge over its edge); colour: the kit's caliper colour
  const rr=rotorMM/20,R=Math.ceil(rr)+3;const g=new Grid(-R,R,-R,R,-9,-1);
  const span=type==='6pot'?.62:type==='4pot'?.5:.38,col=colour!==undefined?colour:type==='stock'?0xb9bec5:(type==='4pot'?0xc2202a:0xe0b52a),h=type==='stock'?7:9;
  g.fill((x,y,zz)=>{const z=-zz,r=Math.hypot(x,y),a=Math.atan2(y,x);
    if(slot&&z>=2&&z<=5&&r<=rr+.7)return -1;
    if(r>=rr*.6&&r<=rr+2.4&&Math.abs(Math.abs(a)-Math.PI)<span&&z>=1&&z<=h)return (z===h||r>rr+1.6)?0x8e9399:col;return -1;});return g;}

/* ---- engines (local x forward from the rear face, y up from pan bottom, z centred) ---- */
function buildEngineV(id){   // engines this car has no model for (other cars' parts shown in the shop) are drawn with the nearest E30 engine of the same cylinder count
  const known=['M20B25','S14B23','2JZGTE','LS3','M20B27','M42B18','M50B25','S52B32','S54B32'];
  if(!known.includes(id)){const e=(typeof byId==='function'&&byId('engine',id))||{};id={4:'S14B23',6:'M20B25',8:'LS3'}[e.cyl]||'M20B25';}
  const E={M20B25:{n:6,V:0,L:70,W:52,H:56,pan:15,cover:0xb4b8be,block:COL.iron,head:0x8c9298},
           S14B23:{n:4,V:0,L:62,W:50,H:56,pan:14,cover:0x25272b,block:0x5f656c,head:0x8c9298,red:1},
           '2JZGTE':{n:6,V:0,L:78,W:58,H:64,pan:19,cover:0x1d1f22,block:0x6b7078,head:0x4a4f55,turbo:1},
           LS3:{n:8,V:1,L:70,W:66,H:64,pan:21,cover:0x1d1f22,block:0x8a9097,head:0x7c8289},
           M20B27:{n:6,V:0,L:70,W:52,H:56,pan:15,cover:0xa9adb3,block:COL.iron,head:0x8c9298},
           M42B18:{n:4,V:0,L:60,W:52,H:60,pan:15,cover:0x2a2c30,block:0x8a9097,head:0x8c9298,dohc:1},
           M50B25:{n:6,V:0,L:72,W:56,H:64,pan:17,cover:0x1f2124,block:COL.iron,head:0x8c9298,dohc:1,coils:1},
           S52B32:{n:6,V:0,L:73,W:58,H:65,pan:18,cover:0x1f2124,block:COL.iron,head:0x8c9298,dohc:1,coils:1,red:1},
           S54B32:{n:6,V:0,L:76,W:60,H:68,pan:19,cover:0xb4b8be,block:COL.iron,head:0x9aa0a6,dohc:1,coils:1,red:1}}[id];
  const g=new Grid(-4,E.L+14,0,E.H+14,-E.W/2-24,E.W/2+24);
  const Hn=E.H-4,hB=Math.round((Hn-E.pan-4)*.62),hH=Math.round((Hn-E.pan-4)*.38);
  box(g,8,E.L-10,0,Math.min(8,E.pan/2),-14,14,0x4a4f55);box(g,8,E.L-10,0,E.pan-1,-12,12,0x4a4f55);   // oil pan
  if(!E.V){
    box(g,4,E.L,E.pan-1,E.pan+hB,-19,19,E.block);
    box(g,6,E.L-2,E.pan+hB,E.pan+hB+hH,-17,17,E.head);
    box(g,10,E.L-6,E.pan+hB+hH,E.pan+hB+hH+4,E.dohc?-15:-12,E.dohc?15:12,E.cover);                     // cam cover (twin-cam heads are wider)
    if(E.coils){box(g,14,E.L-12,E.pan+hB+hH+5,E.pan+hB+hH+6,-6,6,0x2c2e32);for(let i=0;i<E.n;i++){const x=16+i*((E.L-30)/(E.n-1));box(g,x,x+1,E.pan+hB+hH+5,E.pan+hB+hH+6,-2,2,E.red?0xb3201b:0x6a6e75);}}   // coil-pack cover
    else for(let x=12;x<=E.L-8;x+=5)box(g,x,x,E.pan+hB+hH+4,E.pan+hB+hH+4,-12,12,E.red?0xb3201b:0xd7dade);
    box(g,E.L-4,E.L+4,E.pan-1,E.pan+hB+hH,-12,12,COL.black);                                            // timing cover
    const yI=E.pan+hB+hH-4;
    box(g,10,E.L-4,yI,yI+9,-32,-24,0x3d4046);                                                          // plenum
    for(let i=0;i<E.n;i++){const x=14+i*((E.L-26)/(E.n-1));segFill(g,[x,yI,-17],[x,yI+3,-26],2.2,0x50545a);}
    for(let i=0;i<E.n;i++){const x=14+i*((E.L-26)/(E.n-1));segFill(g,[x,yI-2,17],[x,yI-5,24],2.1,COL.cast);}
    segFill(g,[10,yI-5,24],[E.L-4,yI-5,24],3.4,COL.cast);
    if(E.turbo){cylY(g,E.L*.5,34,8,yI-20,yI-2,0x7a7f86);cylX(g,yI-10,34,6,E.L*.5-14,E.L*.5+14,0x6a5e55);segFill(g,[E.L*.5+10,yI-10,34],[E.L*.5+34,yI+6,10],2.4,0x9aa0a8);segFill(g,[E.L*.5-12,yI-10,34],[E.L*.5-30,yI-10,44],2.4,0x9aa0a8);}
  }else{
    box(g,4,E.L,E.pan-1,E.pan+8,-14,14,E.block);
    for(const s of [-1,1]){
      for(let k=0;k<=hB+hH;k++){const zc=s*(4+k*.75),y=E.pan+8+k;box(g,4,E.L,y,y,zc-5,zc+5,k<hB?E.block:E.head);}
      const kt=hB+hH,zt=s*(4+kt*.75);box(g,10,E.L-8,E.pan+8+kt+1,E.pan+8+kt+3,zt-5,zt+5,E.cover);
      for(let i=0;i<4;i++)box(g,13+i*((E.L-30)/3),13+i*((E.L-30)/3)+3,E.pan+8+kt+4,E.pan+8+kt+6,zt-2,zt+2,0xb3201b);
      segFill(g,[10,E.pan+10,s*22],[E.L-4,E.pan+10,s*26],2.6,COL.cast);                              // headers
    }
    box(g,14,E.L-12,E.pan+8+8,E.pan+8+hB+hH,-9,9,0x2a2c30);                                              // intake in the vee
    box(g,E.L-4,E.L+4,E.pan-1,E.pan+hB+hH+4,-14,14,COL.black);
  }
  cylY(g,5,0,5,E.pan+hB+hH-6,E.pan+hB+hH+1,COL.black);
  cylX(g,E.pan+4,E.W/2+6,5,E.L-18,E.L-8,0x70757c);                                                    // alternator
  return {grid:g,L:E.L,H:E.H,pan:E.pan,n:E.n};
}
function buildGearboxV(id){
  if(!['G260','G240','G265','G250','ZF320','G420','V160','T56'].includes(id))id='G260';   // other cars' gearboxes: the stock case stands in
  const len={G260:56,G240:52,G265:58,G250:56,ZF320:58,G420:62,V160:64,T56:72}[id],wid={G260:300,G240:280,G265:300,G250:300,ZF320:320,G420:340,V160:340,T56:400}[id]/20;
  const g=new Grid(-len-4,8,0,34,-Math.ceil(wid)-2,Math.ceil(wid)+2);
  g.fill((x,y,z)=>{const t=x>-8?1:Math.max(.55,1-(-8-x)/(len*1.5));const r=Math.hypot(y-15,z/(wid/30));if(r<=15*t)return x>-6?0x6f757c:0x80868d;return -1;});
  box(g,-30,-24,28,34,-3,3,0x5a5f66);return g;
}

/* ---- seats (world coordinates, 20 mm voxels), built around the hip point COCKPIT.H ----
   The seat surface sits about 4 voxels (80 mm) under the hip point; the backrest face follows the back angle. */
function buildSeatV(style,zc){
  const H=COCKPIT.H,t=Math.tan(COCKPIT.back*Math.PI/180),g=new Grid(-40,30,11,62,Math.round(zc-14),Math.round(zc+14));
  const ST={stock:[0x2d2f34,0x3a3d44,1.2],comfort:[0x4a4339,0x564e43,.5],sport:[0x26282c,0x3a3d44,2.0],recliner:[0x24262a,0x30333a,1.2],bucket:[0x1b1c1f,0x0f1012,2.5]}[style]||[0x24262a,0x30333a,1.2];
  const cush=ST[0],bol=ST[1],bolH=ST[2];   // cushion colour, bolster colour, bolster height (comfort seats are nearly flat, sport seats have high bolsters)
  const hw=style==='bucket'?9:9.5,x0=H.x-6,x1=H.x+18+(style==='sport'?1:0);   // sport seats: adjustable thigh extension
  for(let x=x0-2;x<=x1-4;x++)for(const s of [-1,1])g.set(x,12,Math.round(zc+s*(hw-3)),0x8d9298);                       // floor rails
  box(g,x0-1,x1-5,13,18,zc-(hw-2.5),zc+(hw-2.5),0x1b1c1f);                                                                 // seat base / riser
  for(let x=x0;x<=x1;x++){const top=22+(x-x0)/(x1-x0)*1.5;for(let z=Math.round(zc-hw);z<=Math.round(zc+hw);z++){const edge=Math.abs(z-zc)>hw-1.8;
    for(let y=19;y<=Math.round(top+(edge?bolH:0));y++)g.set(x,y,z,edge?bol:cush);}}
  const top=style==='bucket'?56:48;
  for(let y=19;y<=top;y++){const xf=Math.round(H.x-5-(y-22)*t);for(let x=xf-3;x<=xf;x++)for(let z=Math.round(zc-hw);z<=Math.round(zc+hw);z++){
    const edge=Math.abs(z-zc)>hw-2&&y<top-8;if(edge&&x===xf&&y<top-10){g.set(x+1,y,z,bol);}g.set(x,y,z,edge?bol:(style==='bucket'&&y>top-3?0x15161a:cush));}}
  if(style==='bucket'){for(let y=30;y<=46;y++)for(const sd of [-1,1])g.set(Math.round(H.x-5-(y-22)*t)-1,y,Math.round(zc+sd*(hw-.5)),0x9aa0a8);
    for(let z=Math.round(zc-3);z<=Math.round(zc+3);z++)for(let y=50;y<=52;y++)g.set(Math.round(H.x-5-(y-22)*t)+1,y,z,0x0b0c0e);}  // harness slots
  else{for(let y=49;y<=50;y++)for(const sd of [-1,1])g.set(Math.round(H.x-6.5-(y-22)*t),y,Math.round(zc+sd*3),0x8d9298);              // headrest posts
    for(let y=51;y<=57;y++){const xf=Math.round(H.x-6-(y-22)*t);for(let x=xf-3;x<=xf;x++)for(let z=Math.round(zc-5.5);z<=Math.round(zc+5.5);z++)g.set(x,y,z,style==='stock'?0x3a3d44:0x444851);}}
  return g;
}
// rear bench (10 mm cells, drawn at mesh scale .5), shaped after the E30 coupe's: one continuous cushion with a centre seam and a piped, rolled front edge, sloping 20 mm down to the back;
// a one-piece reclined backrest with piping along its top and two rows of buttons per outer seat; seat-belt buckles where cushion and backrest meet (reference photo: unixnerd.co.uk/images/e30rearseat.jpg).
// The backrest is built upright in its own frame and drawn rotated to the back angle, so its face is one flat surface (no stair steps). Both parts stop 10 mm clear of the body
// (wheel tubs, side trims, seat pan); the cushion's foam rides over the transmission tunnel. COCKPIT.rearH sets the depth and the back angle; heights are DESIGN (cushion top 300-320 mm above the floor).
function buildRearBenchHi(bodyHi,others){   // others: more 10 mm grids the bench must clear (the quarter glass)
  const H=COCKPIT.rearH,th=COCKPIT.rearBack*Math.PI/180,C0=0x2d2f34,PIPE=0x1f2125,BTN=0x24262b,SEAM=0x232529;
  const x0=H.x-6,x1=H.x+17,yTopR=25,yTopF=26,yBase=17,half=27.5,thick=4.5,backLen=21.5,bx=x0,by=yTopR-1.2;   // backrest foot (front face) at (bx, by); 430 mm tall along its face
  const near=(i,j,k)=>{if(!bodyHi)return false;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)for(let c=-1;c<=1;c++){if(bodyHi.get(i+a,j+b,k+c)>=0)return true;if(others)for(const O of others)if(O.get(i+a,j+b,k+c)>=0)return true;}return false;};
  const cushion=new Grid(Math.floor((x0-1)*2),Math.ceil(x1*2)+1,yBase*2-1,Math.ceil(yTopF*2)+2,-Math.ceil(half*2)-1,Math.ceil(half*2)+1);
  cushion.fill((i,j,k)=>{const x=i/2,y=j/2,z=k/2,az=Math.abs(z);if(az>half||x<x0-.5||x>x1||y<yBase)return -1;
    const f=(x-(x0-.5))/(x1-x0+.5),side=az>half-4?(az-(half-4))*.12:0,roll=Math.max(0,x-(x1-1.5)),top=yTopR+(yTopF-yTopR)*f+side-roll*roll*.45;
    if(y>top)return -1;if(roll>0&&y>top-.6)return PIPE;if(az<.3&&y>top-.6)return SEAM;return y>top-6.5?C0:COL.carpet;});   // 130 mm of foam on a carpeted base
  // seat-belt buckles at the cushion / backrest joint: a centre pair and one at each outer seat
  for(const zb of [-3.5,3.5,-19,19])for(let j=Math.round(yTopR*2);j<=Math.round(yTopR*2)+3;j++){const i=Math.round((x0+.4)*2);for(const di of [0,1])cushion.set(i+di,j,Math.round(zb*2),j>=Math.round(yTopR*2)+2?0xb3201b:0x111214);}
  // backrest in its own frame: local x = toward the front face (0) .. back (-thick), local y up the backrest from its foot, z as the car
  const back=new Grid(-Math.ceil(thick*2),0,0,Math.ceil(backLen*2),-Math.ceil(half*2)-1,Math.ceil(half*2)+1);
  back.fill((i,j,k)=>{const lx=-i/2,ly=j/2,z=k/2,az=Math.abs(z);if(az>half)return -1;const rTop=backLen-ly;if(rTop<1.5&&Math.abs(lx-thick/2)>thick/2-(1.5-rTop)*1.4)return -1;   // rounded top edge
    if(lx<.5){if(rTop>1.5&&rTop<2)return PIPE;for(const zc of [-14,14])for(const dz of [-4,4])for(const yb of [backLen*.5,backLen*.72])if(Math.abs(z-(zc+dz))<.3&&Math.abs(ly-yb)<.3)return BTN;}
    return C0;});
  const toBody=(i,j)=>{const lx=i/2,ly=j/2;return [bx+lx*Math.cos(th)-ly*Math.sin(th),by+lx*Math.sin(th)+ly*Math.cos(th)];};
  const pocket=(x,y,z)=>{if(typeof E30_SUSP==='undefined')return false;const S=E30_SUSP.rear.spring;return y<S.top+.75&&Math.hypot(x-S.x,Math.abs(z)-S.z)<S.r+.75;};   // clear of the rear spring pockets
  for(const [i,j,k] of back.list()){const [x,y]=toBody(i,j);if(near(Math.round(x*2),Math.round(y*2),k)||pocket(x,y,k/2))back.set(i,j,k,-1);}
  const held=(i,j,k)=>{if(!bodyHi)return true;for(let d=1;d<=24;d++)if(bodyHi.get(i,j-d,k)>=0)return true;return false;};   // the cushion rests on the floor or the tunnel's roof, never over the tunnel's void
  for(const [i,j,k] of cushion.list())if(near(i,j,k)||!held(i,j,k))cushion.set(i,j,k,-1);
  return {cushion,back,backPos:[bx,by,0],backRot:th,toBody};
}
// the same bench in 20 mm cells (fit and the older checks): a 20 mm cell is set where any of its 10 mm cells is
function buildRearBench(body,bodyHi){const h=buildRearBenchHi(bodyHi||null),g=new Grid(-75,-10,8,52,-36,36);
  for(const [i,j,k,c] of h.cushion.list())g.set(Math.round(i/2),Math.round(j/2),Math.round(k/2),c);
  for(const [i,j,k,c] of h.back.list()){const [x,y]=h.toBody(i,j);g.set(Math.round(x),Math.round(y),Math.round(k/2),c);}
  if(body&&!bodyHi)for(const [x,y,z] of g.list())if(body.get(x,y,z)>=0)g.set(x,y,z,-1);
  return g;}
/* ---- steering wheels (half res, x-y plane facing +z) ---- */
function buildSteeringWheelV(dia,style){
  const R=dia/20,g=new Grid(-Math.ceil(R)-2,Math.ceil(R)+2,-Math.ceil(R)-2,Math.ceil(R)+2,0,3);
  g.fill((x,y,z)=>{const r=Math.hypot(x,y),a=Math.atan2(y,x);
    const rimW={stock:3.2,mtech1:3.4,sport:2.8,deep:2.8,small:2.4,quick:2.8}[style]||2.8,flat=style==='quick'&&y<-(R-4.5);   // the quick-release wheel has a flat bottom
    if(flat)return (Math.abs(y+(R-4.5))<rimW*.6&&Math.abs(x)<R*.62)?0x2b2c2f:-1;
    if(r>=R-rimW&&r<=R)return style==='small'||style==='deep'?0x2b241c:(style==='mtech1'&&Math.abs(Math.sin(a))>.97&&a>0?0x1c69d4:0x141517);
    if(r<=5.5)return z>=2?(((x>=0)!==(y>=0))?COL.white:COL.blue):0x1a1b1d;
    const spokes={stock:[Math.PI,0,-Math.PI/2],mtech1:[Math.PI*1.05,-Math.PI*.05,-Math.PI/2],sport:[Math.PI*.9,Math.PI*.1,-Math.PI/2],deep:[Math.PI*.83,Math.PI*.17,-Math.PI/2],small:[Math.PI,0],quick:[Math.PI,0,-Math.PI/2]}[style]||[Math.PI,0];
    for(const s of spokes)if(Math.abs(Math.sin(a-s))<(style==='small'?.17:.12)&&Math.cos(a-s)>0&&r<R-rimW)return 0x1b1c1e;
    if(style==='small'&&z===0&&r>R-rimW-3&&Math.abs(Math.sin(a-Math.PI/2))<.06&&Math.cos(a-Math.PI/2)>0)return 0xb3201b;  // centre mark
    return -1;});
  return g;
}
/* ---- exhaust variants (rear section + tips; the front pipe is shared) ---- */
function buildExhaustV(tip,eng){
  // runs inside the tunnel beside the driveshaft, drops below the floor at the axle kick-up, muffler under the rear floor, tip below the bumper.
  // The stock and race systems run down the LEFT side (z negative) and the tip comes out through the cut-out in the left of the rear bumper valance, as on the real car (photograph);
  // the dual, quad and oval systems hang below the valance.
  if(tip==='single')tip='stock';                       // the catalogue calls the stock system 'single' (it used to draw no muffler and no tip when picked again in the shop)
  const jdm=typeof JDM_TIPS!=='undefined'&&JDM_TIPS.includes(tip);if(jdm)tip=tip==='side'?'jdmside':'jdmbase';   // Japanese tails: the stock silencer here, the tail itself is genJdmTail (10 mm)
  const g=new Grid(-109,40,2,24,-24,24);
  const S=(tip==='stock'||tip==='race'||tip==='jdmbase')?-1:1;
  const pr=tip==='oval'?2.4:2,col=tip==='oval'?0xc9ced4:0x7a7f86;
  if(tip==='jdmside'){segFill(g,[24,14,-5.5],[AX_R+ARCH_R+2,14,-5.5],pr,col);return g;}   // the side exit leaves the tunnel run ahead of the rear wheel (genJdmTail draws the rest)
  segFill(g,[24,14,5.5*S],[AX_R,14,5.5*S],pr,col);segFill(g,[AX_R,14,5.5*S],[AX_R-8,7,10*S],pr,col);segFill(g,[AX_R-8,7,10*S],[-74,7,12*S],pr,col);
  if(tip==='stock'){box(g,-92,-72,5,9,-18,-6,0x6c7178);box(g,-93,-92,5,9,-17,-7,0x5a5f66);segFill(g,[-92,7,-13],[-98,11.5,-13],1.9,COL.chrome);segFill(g,[-98,11.5,-13],[-108,11.5,-13],1.9,COL.chrome);}
  if(tip==='jdmbase'){box(g,-92,-72,5,9,-18,-6,0x6c7178);box(g,-93,-92,5,9,-17,-7,0x5a5f66);}
  if(tip==='dual'){box(g,-92,-72,5,9,-16,16,0x6c7178);segFill(g,[24,14,-5.5],[AX_R,14,-5.5],2,col);segFill(g,[AX_R,14,-5.5],[AX_R-8,7,-10],2,col);segFill(g,[AX_R-8,7,-10],[-74,7,-12],2,col);for(const z of [-13,13]){cylX(g,7,z,2.4,-108,-92,COL.chrome);cylX(g,7,z,1.5,-108,-107,0x1a1b1d);}}
  if(tip==='quad'){box(g,-92,-72,5,9,-16,16,0x6c7178);segFill(g,[24,14,-5.5],[AX_R,14,-5.5],2,col);segFill(g,[AX_R,14,-5.5],[AX_R-8,7,-10],2,col);segFill(g,[AX_R-8,7,-10],[-74,7,-12],2,col);
    for(const z of [-15,-10.5,10.5,15]){cylX(g,7,z,2,-108,-92,COL.chrome);cylX(g,7,z,1.2,-108,-107,0x1a1b1d);}}
  if(tip==='race'){segFill(g,[-74,7,-12],[-92,7,-13],2.2,0x8a9098);segFill(g,[-92,7,-13],[-98,11.5,-13],2.2,0x8a9098);segFill(g,[-98,11.5,-13],[-104,11.5,-13],2.2,0x8a9098);cylX(g,11.5,-13,2.6,-108,-102,0xb7bcc3);cylX(g,11.5,-13,1.8,-108,-107,0x1a1b1d);}   // no rear silencer, one 100 mm tip in the bumper cut-out   // no rear silencer, one 100 mm tip
  if(tip==='oval'){box(g,-92,-72,5,9,-9,9,0xc9ced4);for(let z=-5;z<=5;z++)for(let y=5;y<=9;y++){g.set(-108,y,z,COL.chrome);g.set(-107,y,z,COL.chrome);g.set(-106,y,z,0xb7bcc3);}for(let z=-4;z<=4;z++)for(let y=6;y<=8;y++)g.set(-108,y,z,0x1a1b1d);segFill(g,[-92,7,0],[-106,7,0],2,0xc9ced4);}
  return g;
}
/* ---- engine bay variant per engine: swap kits with an electric fan move a slimline radiator forward; the LS kit notches the towers and relocates the battery ---- */
function bayOptsFor(eid){return {radShift:(eid==='2JZGTE'||eid==='S54B32')?2:0,notch:eid==='LS3',relocate:eid==='LS3'};}
/* the widebody kit cuts the steel arch lips back under its flares (same cut the collision suite applies) */
function archCutBody(bodyGrid){const g=new Grid(bodyGrid.x0,bodyGrid.x1,bodyGrid.y0,bodyGrid.y1,bodyGrid.z0,bodyGrid.z1);
  for(const [x,y,z,c] of bodyGrid.list())if(![AX_F,AX_R].some(ax=>Math.hypot(x-ax,y-15)<21.5&&Math.abs(z)>halfAt(x,Math.max(y,22))-1.5))g.set(x,y,z,c);return g;}
/* the same cut on the 10 mm skin (what the page draws) */
function archCutHi(G){const g=new Grid(G.x0,G.x1,G.y0,G.y1,G.z0,G.z1);
  eachCell(G,null,(i,j,k,n)=>{const v=G.d[n];if(v<0)return;const x=i/2,y=j/2,z=k/2;if(![AX_F,AX_R].some(ax=>Math.hypot(x-ax,y-15)<21.5&&Math.abs(z)>halfAt(x,Math.max(y,22))-1.5))g.d[n]=v;});return g;}
/* ---- aero (E30). DESIGN parts, sizes typical of the aftermarket parts and of the factory 318iS lip and trunk spoiler, each seated on the panel it bolts to.
   10 mm cells in absolute hi-res indices (drawn at mesh scale .5); the trunk parts are built in body coordinates and ride on the trunk lid. ---- */
// drop the cells of a part that would sit inside a panel it bolts against (keep: grids that stay as they are)
const clearOf=(cells,keep)=>keep?cells.filter(c=>!keep.some(G=>G&&G.get(c[0],c[1],c[2])>=0)):cells;
// the chin spoiler's underside: per k, the lowest row of the front bumper's own moulding (ahead of the fenders) and its leading edge on that row
function chinEdge(bf){const bot=new Map(),jChin=Math.round(BF.bot*2)+1;for(const [i,j,k] of bf.list()){if(i<2*99)continue;const key=i+','+k;if(!bot.has(key)||j<bot.get(key))bot.set(key,j);}
  const ks=new Map();for(const key of bot.keys()){const [i,k]=key.split(',').map(Number);if(!ks.has(k))ks.set(k,[]);ks.get(k).push(i);}
  const edge=new Map();for(const [k,is] of ks){let jm=1e9;for(const i of is)jm=Math.min(jm,bot.get(i+','+k));if(jm>jChin)continue;let ie=-1e9;for(const i of is)if(bot.get(i+','+k)===jm)ie=Math.max(ie,i);edge.set(k,{ie,jb:jm});}
  return {edge,B:(i,k)=>bot.get(i+','+k),kMax:Math.max(...edge.keys())};}
// front lip (polyurethane): a 20 mm strip under the chin spoiler's leading edge and one cell proud of it (lip 20)
function buildFrontLipE30(bf,keep){const C=chinEdge(bf),cells=[];
  for(const [k,{ie,jb}] of C.edge){for(let i=ie-2;i<=ie;i++){const b=C.B(i,k);if(b===undefined)continue;for(let d=1;d<=2;d++)cells.push([i,b-d,k,d===1?0x16171a:0x0e0f11]);}
    for(let d=0;d<=2;d++)cells.push([ie+1,jb-d,k,0x0e0f11]);}
  return cellsToGrid(clearOf(closeUp(cells,[bf,...(keep||[])],8),keep));}   // its top follows the spoiler's underside
// factory 318iS front lip: a black blade 10 mm under the chin spoiler's leading edge, reaching 30 mm ahead of it (lip 10)
function buildISLipE30(bf,keep){const C=chinEdge(bf),cells=[];
  for(const [k,{ie,jb}] of C.edge){if(Math.abs(k)>C.kMax-2)continue;for(let i=ie-3;i<=ie+3;i++){const b=C.B(Math.min(i,ie),k);if(b===undefined)continue;cells.push([i,jb-1,k,0x141517]);if(i>ie&&i<ie+3)cells.push([i,jb,k,0x141517]);}}
  return cellsToGrid(clearOf(closeUp(cells,[bf,...(keep||[])],8),keep));}   // its top follows the spoiler's underside
// splitter: a 10 mm plate 20 mm under the chin spoiler on spacer blocks, 70 mm proud of its leading edge, 140 mm back under the car; end fences (lip 30)
function buildSplitterE30(bf,keep){const C=chinEdge(bf),cells=[];let jp=1e9;for(const [,e] of C.edge)jp=Math.min(jp,e.jb-3);const kE=C.kMax-6;
  for(const [k,{ie}] of C.edge){if(Math.abs(k)>kE)continue;for(let i=ie-14;i<=ie+7;i++)cells.push([i,jp,k,0x111214]);}
  for(const zc of [0,-14,14,-28,28])for(let dk=-1;dk<=1;dk++){const k=zc*2+dk,e=C.edge.get(k);if(!e)continue;for(let i=e.ie-4;i<=e.ie-2;i++){const jb=C.B(i,k);if(jb===undefined)continue;for(let j=jp+1;j<jb;j++)cells.push([i,j,k,0x2a2c30]);}}   // spacer blocks
  for(const s of [-1,1]){const k=s*kE,e=C.edge.get(k);if(!e)continue;for(let i=e.ie-4;i<=e.ie+7;i++)for(let j=jp+1;j<=jp+3;j++){const jb=C.B(i,k);if(jb!==undefined&&j>=jb)continue;cells.push([i,j,k,0x0e0f11]);}}   // end fences
  return cellsToGrid(clearOf(cells,keep));}
// trunk lid parts, seated on the lid's top skin: the 318iS lip spoiler on the rear edge (25 mm), a ducktail rising 60 mm over the last 110 mm, a GT wing on two stands
function buildTrunkAeroE30(trunk,kind){const top=new Map();for(const [i,j,k] of trunk.list()){const key=i+','+k;if(!top.has(key)||j>top.get(key))top.set(key,j);}
  const T=(i,k)=>top.get(i+','+k),cells=[],deck=88;   // the deck: the lid's top skin above 880 mm (the lid also wraps down the tail)
  const rear=new Map();for(const [key,j] of top){if(j<deck)continue;const [i,k]=key.split(',').map(Number);if(!rear.has(k)||i<rear.get(k))rear.set(k,i);}
  if(kind==='lip'||kind==='ducktail'||kind==='mtech'){const half=kind==='lip'?56:kind==='mtech'?58:60,len=kind==='lip'?4:kind==='mtech'?7:11;   // mtech: the M-Technik II lid spoiler, 70 mm long, 40 mm tall at its edge
    for(const [k,iR] of rear){if(Math.abs(k)>half)continue;for(let i=iR;i<=iR+len;i++){const t=T(i,k);if(t===undefined||t<deck)continue;
      const h=kind==='lip'?(i-iR<2?2:1):kind==='mtech'?Math.max(1,4-Math.floor((i-iR)/2)):Math.max(1,Math.round(1+(iR+len-i)*.45));for(let j=t+1;j<=t+h;j++)cells.push([i,j,k,PAINT]);}}}
  else{   // GT wing: stands 400 mm either side of the centre, 80 mm ahead of the lid's rear edge; a 200 mm chord blade 150 mm over the lid, its trailing edge 20 mm up and 40 mm behind the lid; end plates
    const iR=Math.min(...[...rear.values()]),iS=iR+8,iL=iR+16,iT=iR-4,half=62;let yb=-1e9;
    for(const zz of [-40,40])for(let i=iS-1;i<=iS+1;i++)for(let dk=-1;dk<=1;dk++){const t=T(i,zz+dk);if(t!==undefined)yb=Math.max(yb,t);}
    const yw=yb+15;
    for(let k=-half;k<=half;k++)for(let i=iT;i<=iL;i++){const L=(iL-i)/(iL-iT),yc=yw+Math.round(L*2);cells.push([i,yc,k,0x15161a]);if(L<.15)cells.push([i,yc+1,k,0x15161a]);}   // blade
    for(const s of [-1,1])for(let i=iT-2;i<=iL+1;i++)for(let j=yw-4;j<=yw+7;j++)cells.push([i,j,s*(half+1),0x0e0f11]);   // end plates
    for(const s of [-1,1])for(let i=iS-1;i<=iS;i++)for(let dk=-1;dk<=0;dk++){const k=s*40+dk,t=T(i,k);if(t===undefined)continue;const yc=yw+Math.round((iL-i)/(iL-iT)*2);for(let j=t+1;j<yc;j++)cells.push([i,j,k,0x2a2c30]);}}   // stands on the lid, up to the blade's underside where it is (it rises toward the leading edge)
  return cellsToGrid(cells);}
/* ---- M-Technik II (BMW's own body kit for the E30, 1988-91; standard on the 325iS / 325i Sport, optional on every body, the Touring included): a body-colour front
   air dam in place of the black chin spoiler with a central intake and two brake ducts, deeper sills, a body-colour rear apron under the bumper, and a rear
   spoiler (on the coupe the trunk-lid spoiler, on the Touring the roof spoiler). Sizes DESIGN after photographs: the air dam 30 mm deeper than the chin
   spoiler, the sills 40 mm under the stock sill with a crease 60 mm up, the apron 30 mm under the bumper's valance. ---- */
function buildMTechFrontE30(bf,keep){const C=chinEdge(bf),cells=[],front=new Map(),low=new Map();
  for(const [i,j,k,c] of bf.list()){if(c!==LIP_BLACK)continue;const key=j+','+k;if(!front.has(key)||i>front.get(key))front.set(key,i);   // the chin spoiler's front face per row
    const lk=low.get(k);if(!lk||j<lk.j)low.set(k,{j,i0:i,i1:i});else if(j===lk.j){lk.i0=Math.min(lk.i0,i);lk.i1=Math.max(lk.i1,i);}}   // and its lowest row's extent per column
  const duct=(j,k)=>{const az=Math.abs(k)/2,y=j/2;return (y>=13.25&&y<=15.75&&az<=9)||(y>=13.25&&y<=16.25&&az>=17&&az<=23);};
  const face=new Map();for(const [key,i] of front){const [j,k]=key.split(',').map(Number);if(Math.abs(k)>C.kMax-3)continue;const ck=(i+1)+','+k;if(!face.has(ck))face.set(ck,[]);face.get(ck).push(j);}
  for(const [ck,js] of face){const [i,k]=ck.split(',').map(Number),jt=Math.max(...js);if(bf.get(i,jt+1,k)<0&&bf.get(i,jt+2,k)<0)continue;   // a column of the face only where the bumper closes over its top
    for(const j of js)cells.push([i,j,k,duct(j,k)?0x0e0f11:PAINT]);}   // a painted face one cell proud of the chin's front (not round its ends)
  let jb=1e9;for(const [,e] of C.edge)jb=Math.min(jb,e.jb);
  for(const [k,L] of low){if(!C.edge.has(k))continue;for(let i=L.i0;i<=L.i1+1;i++){let b=C.B(Math.min(i,L.i1),k);if(b===undefined||b>L.j+1)continue;
    if(i>L.i1){const b2=C.B(i,k);if(Math.abs(k)>C.kMax-3||b2===undefined||b2>b+3)continue;b=b2;}   // the cell row ahead of the chin only under the painted face, closed up to what is over it
    for(let j=jb-3;j<b;j++)cells.push([i,j,k,j===jb-3?LIP_BLACK:PAINT]);}}   // the dam's lower edge level, 30 mm under the old chin, closed up to its underside; its bottom row black
  return cellsToGrid(clearOf(cells,keep));}
function buildMTechSkirtsE30(H){const g=genSkirts([H.body],{x0:AX_R+ARCH_RR.r+.8,x1:AX_F-ARCH_F.r-.8,j0:18,j1:28,arches:[ARCH_F,ARCH_RR],col:PAINT,ahead:0,colCap:true,doors:[H.doorL,H.doorR,H.doorRL,H.doorRR].filter(Boolean)});
  const out=new Map();for(const [i,j,k] of g.list()){const key=i+','+j,a=Math.abs(k);if(!out.has(key)||a>Math.abs(out.get(key)))out.set(key,k);}
  for(const [key,k] of out){const [i,j]=key.split(',').map(Number);if(j===24)g.set(i,j,k,PAINT_SHADE);}   // the crease along the sill, 240 mm up
  return g;}
function buildMTechApronE30(br,keep){const bot=new Map();for(const [i,j,k] of br.list()){const key=i+','+k;if(!bot.has(key)||j<bot.get(key))bot.set(key,j);}
  const cells=[],rear=new Map();for(const [key,j] of bot){const [i,k]=key.split(',').map(Number);if(j>Math.round(RR.bot*2)+1)continue;if(!rear.has(k)||i<rear.get(k).i)rear.set(k,{i,j});}
  let jl=1e9;for(const [,r] of rear)jl=Math.min(jl,r.j);jl-=3;   // the apron's lower edge level, 30 mm under the valance's lowest
  for(const [k,{i}] of rear){const z=k/2;if(z>=RR.cutZ[0]-1&&z<=RR.cutZ[1]+1)continue;for(let ii=i;ii<=i+5;ii++){const jb=bot.get(ii+','+k);if(jb===undefined)continue;   // each column up to the valance's underside over it
    for(let jj=jl;jj<jb;jj++)cells.push([ii,jj,k,jj===jl?BUMPER_UNDER:PAINT]);}}   // the exhaust's cut-out kept
  return cellsToGrid(clearOf(cells,keep));}
// the Touring's roof spoiler (M-Technik, 1988-91): a body-colour blade on the tailgate's top rail, carrying the roofline 120 mm out over the glass; 30 mm over the
// rail at its root, tapering to a 10 mm trailing edge; across the tailgate's width less 20 mm a side (DESIGN after photographs). Rides on the tailgate.
function buildRoofSpoilerE30T(trunk){const top=new Map();for(const [i,j,k] of trunk.list()){const key=i+','+k;if(!top.has(key)||j>top.get(key))top.set(key,j);}
  const T=(i,k)=>top.get(i+','+k),cells=[],i0=Math.round(TRUNK_X0*2),iG=Math.round(wxm(3560)*2),iE=iG-12;
  let kMax=0;for(const key of top.keys()){const [i,k]=key.split(',').map(Number);if(i===i0-2)kMax=Math.max(kMax,Math.abs(k));}
  for(let k=-(kMax-2);k<=kMax-2;k++){const jr=T(i0-2,k);if(jr===undefined)continue;
    for(let i=i0-1;i>=iE;i--){const jt=jr+3-Math.round((i0-1-i)*.06),th=i>=iG?99:Math.max(1,Math.round(3-(iG-i)*2/12)),t=T(i,k),jb=Math.max(t===undefined?-1e9:t+1,jt-th+1);
      if(i===iE&&Math.abs(k)>kMax-4)continue;for(let j=jb;j<=jt;j++)cells.push([i,j,k,PAINT]);}}
  return cellsToGrid(cells);}
// bolt-on widebody flares: a 60 mm ring round each wheel centre from the widened opening (430 mm radius; archCutHi cuts the steel lips back to it), 30 mm proud at the opening; down to 290 mm, where the side skirts (if fitted) take over
function buildFlaresE30(H,bumpers){const RD=!!H.doorRL,rf=RD?wxm(E30M.touring.rdFront):0,rb=RD?wxm(2915):0;   // the Touring's rear doors: no flare on them (they swing open past it)
  return genFlares([H.body,H.doorL,H.doorR,H.doorRL,H.doorRR].filter(Boolean),bumpers,{axles:[{x:AX_F,y:15},{x:AX_R,y:15}],R0:21.5,band:3,out:1.5,jMin:29,col:PAINT,skip:(x)=>(x<DOOR_F+1.5&&x>DOOR_R-1.5)||(RD&&x<rf+1.5&&x>wxm(E30M.touring.rdRearBelt)-1.5)});}
// side skirts: 195-280 mm (30 mm under the 226 mm sill, 20 mm under the doors' 300 mm bottom edge), between the arches
function buildSkirtsE30(H){return genSkirts([H.body],{x0:AX_R+ARCH_RR.r+.8,x1:AX_F-ARCH_F.r-.8,j0:20,j1:28,arches:[ARCH_F,ARCH_RR],col:PAINT,ahead:0,colCap:true,doors:[H.doorL,H.doorR,H.doorRL,H.doorRR].filter(Boolean)});}   // (the Touring's rear doors open over it too)
// front strut tower brace: a tube across the two strut tops, on plates bolted to the towers (under the hood, above the engine)
function buildStrutBar(){const g=new Grid(56,80,30,42,-28,28);segFill(g,[AX_F-3,38,-22],[AX_F-3,38,22],.7,0x2a6fd6);for(const sd of [-1,1])box(g,AX_F-5,AX_F-1,37,37,sd*20,sd*24,0x8d9298);return g;}
/* ---- roll cages and bars. Geometry from the cabin: main hoop behind the front seats' fully upright backs (x -32), front down tubes just behind the
   dash face and along the A-pillars, rear stays to the rear seat pan (the rear seat is removed). Tube 45 mm (DESIGN). Feet: front floor, hoop floor, seat pan. ---- */
// (MEASURED against the cabin's inner surfaces: at the main hoop the side glass is 280 mm off the centreline at 1200 mm and 260 at 1280; the roof's underside is
// 1320 mm at 480 mm off the centreline; the windshield's top edge is at x 18.75. The tubes' axes keep 20 mm or more inside all of it.)
const CAGE_FEET=[[25.5,13.5],[-32.6,13.5],[-53,25]];
const CAGE_Z=26;                                                                      // the main hoop's legs and stays at the floor
const CAGE_FRONT=[[[25.5,13.5,30],[25.5,45,28]],[[25.5,45,28],[16,61.5,23.5]]];   // front down tube and A-pillar tube (x,y,|z|): 30 at the floor (outboard of a fully pressed clutch
// pedal), 28 at the dash top (clear of the instrument binnacle's outer edge), in to 23.5 under the windshield's top corners; the dash is notched where they pass
const HOOP={x:-32.6,knee:57,top:63,legZ:25.5,topZ:21.5};                              // main hoop: legs up the B-pillars' insides, bent in under the roof's edge; 12 mm behind
// a stock seat's back at its rearmost rake (its shoulder corners reach x -30.75 at 1140 mm)
function cageHoop(g,t,C){const H=HOOP;for(const sd of [-1,1]){segFill(g,[H.x,13.5,sd*CAGE_Z],[H.x,H.knee,sd*H.legZ],t,C);segFill(g,[H.x,H.knee,sd*H.legZ],[H.x,H.top,sd*H.topZ],t,C);
    segFill(g,[H.x,H.top-.5,sd*(H.topZ+1)],[-53,25,sd*17],t,C);}                      // rear stays from the hoop's top corners to the rear seat pan
  segFill(g,[H.x,H.top,-H.topZ],[H.x,H.top,H.topZ],t,C);}
function buildCage(){const g=new Grid(-62,40,10,68,-36,36);const t=1.1,C=0xb9bec6;
  cageHoop(g,t,C);
  for(const sd of [-1,1]){for(const [a,b] of CAGE_FRONT)segFill(g,[a[0],a[1],sd*a[2]],[b[0],b[1],sd*b[2]],t,C);segFill(g,[16,61.5,sd*23.5],[HOOP.x,HOOP.top,sd*HOOP.topZ],t,C);   // front down tube, A-pillar tube, roof side bar
    segFill(g,[HOOP.x,40,sd*HOOP.legZ],[-53,25,sd*17],t*.9,C);}
  segFill(g,[HOOP.x,HOOP.top,-HOOP.topZ],[HOOP.x,14,CAGE_Z],t*.9,C);                // main hoop diagonal
  segFill(g,[16,61.5,-23.5],[16,61.5,23.5],t,C);return g;}                         // windshield header bar, under the glass's top edge
function buildRollBar(){const g=new Grid(-62,0,10,68,-36,36);const t=1.1,C=0x1b1c1f;cageHoop(g,t,C);segFill(g,[HOOP.x,42,-HOOP.legZ],[HOOP.x,42,HOOP.legZ],t*.8,C);return g;}   // 4-point bolt-in bar: hoop and two rear stays
function buildCage10(){const g=buildCage();const t=1.1,C=0xb9bec6;
  segFill(g,[16,61.5,-23.5],[HOOP.x,HOOP.top,HOOP.topZ],t*.9,C);segFill(g,[16,61.5,23.5],[HOOP.x,HOOP.top,-HOOP.topZ],t*.9,C);   // roof X
  {const [a,b]=CAGE_FRONT[0],zd=a[2]+(b[2]-a[2])*(32-a[1])/(b[1]-a[1]);segFill(g,[25.5,32,-zd],[25.5,32,zd],t,C);}segFill(g,[HOOP.x,46,-HOOP.legZ],[HOOP.x,46,HOOP.legZ],t*.9,C);              // dash bar, harness bar
  for(const sd of [-1,1])segFill(g,[HOOP.x,25,sd*CAGE_Z],[-53,25,sd*17],t*.9,C);return g;}                                       // lower rear stays
// notch a cabin grid (cells given by a mapping to world x,y,z) round the cage's front tubes and the hoop's feet, as real installs cut the dash and carpet
function cageNotch(frame){const d3=(p,a,b)=>{const ab=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],ap=[p[0]-a[0],p[1]-a[1],p[2]-a[2]],t=Math.max(0,Math.min(1,(ap[0]*ab[0]+ap[1]*ab[1]+ap[2]*ab[2])/(ab[0]**2+ab[1]**2+ab[2]**2)));return Math.hypot(p[0]-a[0]-ab[0]*t,p[1]-a[1]-ab[1]*t,p[2]-a[2]-ab[2]*t);};
  const cage=frame==='cage'||frame==='cage10',hoop=cage||frame==='rollbar';
  return (x,y,z)=>{const az=Math.abs(z);if(cage&&CAGE_FRONT.some(([a,b])=>d3([x,y,az],a,b)<1.9))return true;
    return hoop&&y<=15.5&&Math.abs(x-HOOP.x)<1.9&&Math.abs(az-CAGE_Z)<1.9;};}
if(typeof module!=='undefined')module.exports={cageNotch,buildMTechFrontE30,buildMTechSkirtsE30,buildMTechApronE30,buildRoofSpoilerE30T,buildRearBenchHi,archCutHi,archCutBody,CAGE_FEET,CAGE_FRONT,bayOptsFor,buildFrontLipE30,buildISLipE30,buildSplitterE30,buildTrunkAeroE30,buildFlaresE30,buildSkirtsE30,chinEdge,buildStrutBar,buildRollBar,buildCage10,buildTireP,buildRimP,buildRotorP,buildCaliperP,buildEngineV,buildGearboxV,buildSeatV,buildRearBench,buildSteeringWheelV,buildExhaustV,buildCage};
