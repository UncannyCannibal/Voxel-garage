/* ===== HONDA CIVIC EF: detail parts from the references (ref/ef/SOURCES.md): bumpers (JDM SiR two-tone: body colour over grey with a red pinstripe), wrap-around headlamps with amber
   corners, slot grille with the H emblem, tail-lamp band with the CIVIC garnish on the hatch, black door mirrors on the door's sail triangle, the roof spoiler on the hatch.
   All 10 mm grids in absolute hi-res cells (mount at the body origin, mesh scale .5). Millimetre tables: x rearward from the front bumper tip, y from the ground. MEASURED / DESIGN as in ef_body.js. ===== */
const EFD={
  // front bumper, centreline section (MEASURED side view): face x by height, with the rub strip; bottom 227 at the front, 190 on the side lips.
  // The pinstripe (two-tone line) runs along the step under the protruding upper band (463-470 mm; the factory drawing's front view shows the line at 461-473,
  // and on the SiR photograph it crosses the plate a third of the way down); the turn lamps sit below it in the grey (drawing: 388-431 mm; photograph: under the stripe),
  // the fog lamps lower still (drawing 291-340 mm); the intake beside the plate runs from under the stripe down to the fog lamps' level (photograph).
  bumperF:{face:[[227,68],[260,44],[440,31],[463,20],[470,4],[500,-5],[520,6],[530,16],[545,36],[552,56]],top:552,bot:227,botSide:192,bow:45,cornerZ:500,cornerR:340,stripe:466,
    turn:{z0:360,z1:620,y0:385,y1:432,amb:[.35,.6]},fog:{z0:470,z1:640,y0:298,y1:342},intake:{z:330,y0:290,y1:448},plate:{y:440,w:330,h:165}},
  // rear bumper (MEASURED): top 588, face at the tail, rounded lower edge, bottom 242
  bumperR:{face:[[242,3900],[300,3935],[404,3975],[440,3995],[560,3995],[575,3988],[588,3964]],top:588,bot:242,botSide:205,bow:25,cornerZ:580,cornerR:260,stripe:440,
    plate:{y:390,w:330,h:165},exhaust:{z:265,w:115,y:240}},
  headlamp:{y0:565,y1:676,zIn:292,zAmb:705,wrapX:300},              // MEASURED front view (lens 577-710, inner end 294 mm off centre) and photos (amber corner)
  grille:{y0:600,y1:652,half:285},
  tail:{y0:642,y1:779,zIn:330,zAmb:690,zRev:410,wrapX:3678},         // MEASURED side + rear views
  spoiler:{top:[[3300,1314],[3454,1308],[3587,1293],[3602,1282]],under:[[3602,1262],[3540,1258],[3470,1268],[3420,1282]],half:545},   // MEASURED side view; width from the rear view (inside the hatch's top edge)
  mirror:{x0:1285,x1:1375,y0:905,y1:1010,out0:35,out1:215},          // DESIGN from the photos (black housing on the sail, glass faces rearward)
  sail:{x0:1420,slope:1.2}                                            // door glass front edge at the belt; above it the sail triangle is black
};
function efTab(T,v){if(v<=T[0][0])return T[0][1];for(let i=0;i<T.length-1;i++){const a=T[i],b=T[i+1];if(v<=b[0])return a[1]+(b[1]-a[1])*(v-a[0])/(b[0]-a[0]);}return T[T.length-1][1];}

/* ---- bumpers: the body below the bumper line (front of the front arch, behind the rear arch) is cut back 40 mm; the bumper is the outer shell there ---- */
function efBumper(g,front,colours){
  const B=front?EFD.bumperF:EFD.bumperR,{wx,u,halfAt}=g,mmx=x=>g.mm(x);
  const SG=colours||{};const UP=PAINT,LOW=SG.low||0x6c7076,STR=SG.stripe||0xa8262a;
  const arch=front?g.ARCH_F:g.ARCH_RR,ext=Math.ceil(g.halfW+1.5);
  const plan=az=>{const k=az/840;let d=B.bow*k*k;if(az>B.cornerZ){const q=Math.min(B.cornerR,az-B.cornerZ);d+=B.cornerR-Math.sqrt(B.cornerR*B.cornerR-q*q);}return d;};
  const x0=front?wx(560):wx(4010),x1=front?wx(-12):wx(3500);
  const G=hgrid(Math.min(x0,x1)-1,Math.max(x0,x1)+1,u(Math.min(B.bot,B.botSide))-1,u(B.top)+1,-ext,ext);
  eachCell(G,null,(i,j,k,n)=>{if(efBumperIn(g,front,i/HR,j/HR,k/HR,40))G.d[n]=1;});   // a 40 mm thick moulding: within 40 mm of its face or of its side, continuous round the corner
  shellHi(G,(x,y,z,inner)=>{if(inner)return 0x1a1b1d;const ym=y*20;return ym>B.stripe+6?UP:(ym>B.stripe-6?STR:LOW);},2);
  // cut-outs: front turn lamps, fog lamps, centre intake, plate; rear plate recess, exhaust notch
  const faceCells=(pred,fn)=>eachCell(G,null,(i,j,k,n)=>{if(G.d[n]<0)return;const x=i/HR,y=j/HR,z=k/HR;if(pred(mmx(x),y*20,Math.abs(z)*20,z))fn(n,x,y,z);});
  const lamps={};const put=(kind,i,j,k,c)=>{(lamps[kind]=lamps[kind]||[]).push([i,j,k,c]);};
  if(front){
    const T=B.turn,F=B.fog,I=B.intake;
    faceCells((m,ym,az)=>az>=T.z0&&az<=T.z1&&ym>=T.y0&&ym<=T.y1&&m<efTab(B.face,ym)+plan(az)+12,(n,x,y,z)=>{const az=Math.abs(z)*20,edge=(az<T.z0+12||az>T.z1-12||y*20<T.y0+12||y*20>T.y1-12);
      const amb=az>=T.z0+(T.z1-T.z0)*T.amb[0]&&az<=T.z0+(T.z1-T.z0)*T.amb[1];   // clear lens with the amber bulb shield seen through its middle (photographs)
      put(edge?'frame':(amb?'famb':'head'),Math.round(x*HR),Math.round(y*HR),Math.round(z*HR),edge?0x1a1b1d:(amb?0xf09a2a:0xd9e2e6));G.d[n]=-1;});
    faceCells((m,ym,az)=>az>=F.z0&&az<=F.z1&&ym>=F.y0&&ym<=F.y1&&m<efTab(B.face,ym)+plan(az)+12,(n,x,y,z)=>{const az=Math.abs(z)*20,edge=(az<F.z0+12||az>F.z1-12||y*20<F.y0+12||y*20>F.y1-12);
      put('frame',Math.round(x*HR),Math.round(y*HR),Math.round(z*HR),edge?0x1a1b1d:0xe0b53a);G.d[n]=-1;});
    faceCells((m,ym,az)=>az<=I.z&&ym>=I.y0&&ym<=I.y1&&m<efTab(B.face,ym)+plan(az)+30,(n,x,y,z)=>{G.d[n]=(Math.round(y*20/22)%2)?0x0d0e10:0x2a2c30;});
  }else{
    const E=B.exhaust;faceCells((m,ym,az,z)=>Math.abs(az-E.z)<E.w&&ym<E.y+45,(n)=>{G.d[n]=-1;});   // tail-pipe cut-outs both sides (single, twin and quad systems)
  }
  const out={grid:G,lamps:{}};
  for(const k in lamps){const L=lamps[k];let b=[1e9,-1e9,1e9,-1e9,1e9,-1e9];for(const [i,j,kk] of L)b=[Math.min(b[0],i),Math.max(b[1],i),Math.min(b[2],j),Math.max(b[3],j),Math.min(b[4],kk),Math.max(b[5],kk)];
    const Gl=new Grid(b[0],b[1],b[2],b[3],b[4],b[5]);for(const [i,j,kk,c] of L)Gl.set(i,j,kk,c);out.lamps[k]=Gl;}
  // the plate sits on the bumper face at the centre
  const pl=B.plate,py=pl.y;let fx=front?efTab(B.face,py):efTab(B.face,py);out.plate={x:wx(fx)+(front?.6:-.6),y:u(py),w:u(pl.w),h:u(pl.h)};
  return out;
}
// the body behind a bumper is cut back 40 mm so the bumper is the outer skin there (called on the solid before the skin is made)
// inside a bumper moulding T mm thick (its face from the measured section and plan, its side wing on the body's outline, its bottom edge sweeping from the
// face's height to the wing's): the bumper is this at T = 40; the body is cut away inside it at T = 50 (a 10 mm gap behind the moulding)
function efBumperIn(g,front,x,y,z,T){const B=front?EFD.bumperF:EFD.bumperR,m=g.mm(x),ym=y*20,az=Math.abs(z)*20;
  if(ym>B.top||(front?m>560:m<3500))return false;const arch=front?g.ARCH_F:g.ARCH_RR;if(Math.hypot(x-arch.x,y-arch.y)<arch.r)return false;
  const hw=g.halfAt(x,Math.min(y,g.u(B.top)))*20;if(az>hw+4)return false;
  const sm=(a,b,v)=>Math.max(0,Math.min(1,(v-a)/(b-a))),bot=front?B.bot+(B.botSide-B.bot)*sm(200,360,m):B.botSide+(B.bot-B.botSide)*sm(3640,3800,m);if(ym<bot)return false;
  const k=az/840;let pl=B.bow*k*k;if(az>B.cornerZ){const q=Math.min(B.cornerR,az-B.cornerZ);pl+=B.cornerR-Math.sqrt(B.cornerR*B.cornerR-q*q);}
  const d=front?m-(efTab(B.face,ym)+pl):(efTab(B.face,ym)-pl)-m;if(d<0)return false;return d<=T||hw-az<=T;}
// outside a bumper moulding but within its height band and length (its rounded plan corners): the body must not show there, the bumper is the corner
function efBumperOutside(g,front,x,y,z){const B=front?EFD.bumperF:EFD.bumperR,m=g.mm(x),ym=y*20,az=Math.abs(z)*20;
  if(ym>B.top||(front?m>560:m<3500))return false;const arch=front?g.ARCH_F:g.ARCH_RR;if(Math.hypot(x-arch.x,y-arch.y)<arch.r)return false;
  const sm=(a,b,v)=>Math.max(0,Math.min(1,(v-a)/(b-a))),bot=front?B.bot+(B.botSide-B.bot)*sm(200,360,m):B.botSide+(B.bot-B.botSide)*sm(3640,3800,m);if(ym<bot)return false;
  const k=az/840;let pl=B.bow*k*k;if(az>B.cornerZ){const q=Math.min(B.cornerR,az-B.cornerZ);pl+=B.cornerR-Math.sqrt(B.cornerR*B.cornerR-q*q);}
  return (front?m-(efTab(B.face,ym)+pl):(efTab(B.face,ym)-pl)-m)<0;}
function efBumperRelief(g,x,y,z,more){const T=50+(more||0);return efBumperIn(g,true,x,y,z,T)||efBumperIn(g,false,x,y,z,T)||(!more&&(efBumperOutside(g,true,x,y,z)||efBumperOutside(g,false,x,y,z)));}   // more: the band of skin left just inside the relief (coloured dark)

/* ---- lamps, grille and garnish: outer skin cells in the lamp areas move from the body (and hatch) into lamp grids, so the lens is flush with the panel ---- */
function efLamps(g,hi){
  const {u,wx}=g,mmx=x=>g.mm(x),HL=EFD.headlamp,GR=EFD.grille,TL=EFD.tail;
  const cells={};const put=(kind,i,j,k,c)=>{(cells[kind]=cells[kind]||[]).push([i,j,k,c]);};
  const outer=(Gd,i,j,k)=>{for(const [a,b,c] of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]])if(Gd.get(i+a,j+b,k+c)<0&&hi.hood.get(i+a,j+b,k+c)<0&&hi.trunk.get(i+a,j+b,k+c)<0&&hi.body.get(i+a,j+b,k+c)<0)return true;return false;};
  // headlamps (clear lens with a reflector pattern, amber corner wrapping round to the side) and the grille between them
  const OUT=new Set();for(const [Gd,b] of [[hi.body,[wx(HL.wrapX),g.NOSE_X+1,u(HL.y0-10),u(HL.y1+20),-g.halfW-1,g.halfW+1]],[hi.body,[g.REAR_X-1,wx(TL.wrapX),u(TL.y0-10),u(TL.y1+10),-g.halfW-1,g.halfW+1]],[hi.trunk,null]])
    eachCell(Gd,b,(i,j,k,n)=>{if(Gd.d[n]>=0&&outer(Gd,i,j,k))OUT.add((Gd===hi.trunk?'t':'b')+i+','+j+','+k);});   // decide which cells face the outside before any are moved
  const isOut=(t,i,j,k)=>OUT.has(t+i+','+j+','+k);
  eachCell(hi.body,[wx(HL.wrapX),g.NOSE_X+1,u(HL.y0-10),u(HL.y1+20),-g.halfW-1,g.halfW+1],(i,j,k,n)=>{const v=hi.body.d[n];if(v!==PAINT)return;
    const x=i/HR,y=j/HR,z=k/HR,m=mmx(x),ym=y*20,az=Math.abs(z)*20;if(!isOut('b',i,j,k))return;
    const face=m<200,side=az>g.halfAt(x,y)*20-25&&m<HL.wrapX;
    if(ym>=HL.y0&&ym<=HL.y1&&az>=HL.zIn&&(face||side)){
      const edge=az<HL.zIn+12||ym<HL.y0+12||ym>HL.y1-10;
      if(edge)put('frame',i,j,k,0x1a1b1d);else if(az>HL.zAmb||side)put('famb',i,j,k,0xf09a2a);else put('head',i,j,k,(((i+j)%5===0)?0xc5ced4:((j%4===0)?0xd6dee2:0xe6edf0)));
      hi.body.d[n]=-1;return;}
    if(face&&ym>=GR.y0&&ym<=GR.y1&&az<GR.half){put('frame',i,j,k,(j%3===0)?0x2a2c30:0x0f1012);hi.body.d[n]=-1;}});
  // H emblem on the grille (silver, 70 x 50 mm)
  {let face=null;const j0=Math.round(u(626)*HR);for(let i=Math.round(g.NOSE_X*HR)+2;i>0;i--)if(hi.body.get(i,j0,0)>=0||(cells.frame||[]).some(c=>c[0]===i&&c[1]===j0&&c[2]===0)){face=i;break;}
   if(face!==null)for(let dj=-2;dj<=2;dj++)for(let dk=-3;dk<=3;dk++){const H=(Math.abs(dk)>=2)||dj===0;if(H)put('frame',face+1,j0+dj,dk,0xc9ced4);}}
  // tail lamps on the body (outer amber, red, inner white reverse lamp, on BOTH sides: the 3-door's back-up lights are in the left and right taillight
  // assemblies, 33550-SH3 / 33500-SH3, VERIFIED hondapartsnow 1991 3-door; it was on the right only); the garnish between them is on the hatch (red reflector panel)
  eachCell(hi.body,[g.REAR_X-1,wx(TL.wrapX),u(TL.y0-10),u(TL.y1+10),-g.halfW-1,g.halfW+1],(i,j,k,n)=>{const v=hi.body.d[n];if(v!==PAINT&&v!==0x1d1112)return;
    const x=i/HR,y=j/HR,z=k/HR,m=mmx(x),ym=y*20,az=Math.abs(z)*20;if(!isOut('b',i,j,k))return;
    if(ym<TL.y0||ym>TL.y1||az<TL.zIn)return;const face=m>3870,side=az>g.halfAt(x,y)*20-25;if(!face&&!side)return;
    const edge=ym<TL.y0+10||ym>TL.y1-10;
    if(edge)put('frame',i,j,k,0x1a1b1d);else if(az>TL.zAmb||side)put('amb',i,j,k,0xe8892a);else if(az<TL.zRev)put('wht',i,j,k,0xe8e8e8);else put('red',i,j,k,0xb3201b);
    hi.body.d[n]=-1;});
  eachCell(hi.trunk,null,(i,j,k,n)=>{const v=hi.trunk.d[n];if(v!==PAINT)return;const x=i/HR,y=j/HR,z=k/HR,ym=y*20;
    if(ym<TL.y0+6||ym>TL.y1-6||!isOut('t',i,j,k))return;if(mmx(x)<3860)return;
    put('garnish',i,j,k,0x8c1a17);hi.trunk.d[n]=-1;});   // plain red reflector panel; its lettering is efBadges
  // rear H emblem on the hatch panel above the garnish
  {const j0=Math.round(u(840)*HR),faceAt=(j,k)=>{for(let i=Math.round(g.REAR_X*HR)-2;i<0;i++)if(hi.trunk.get(i,j,k)>=0)return i;return null;};
   for(let dj=-2;dj<=2;dj++)for(let dk=-3;dk<=3;dk++){if(!((Math.abs(dk)>=2)||dj===0))continue;const f=faceAt(j0+dj,dk);if(f!==null)put('garnish',f-1,j0+dj,dk,0xc9ced4);}}   // rides on the hatch, one cell proud of its skin at every cell
  const out={};
  for(const kk in cells){const L=cells[kk];let b=[1e9,-1e9,1e9,-1e9,1e9,-1e9];for(const [i,j,k] of L)b=[Math.min(b[0],i),Math.max(b[1],i),Math.min(b[2],j),Math.max(b[3],j),Math.min(b[4],k),Math.max(b[5],k)];
    const G=new Grid(b[0],b[1],b[2],b[3],b[4],b[5]);for(const [i,j,k,c] of L)G.set(i,j,k,c);out[kk]=G;}
  return out;
}

/* ---- badge lettering on the hatch (5-row block letters, our own plain type, not Honda's badge typefaces): CIVIC centred on the red garnish with VTEC under it
   (E-EF9 SiR, ph_sir_rear34.jpg), HONDA on the hatch panel above the left tail lamp (1990 US car, ph_red_rear34.jpg). Sizes from the photos, scaled on the
   650 mm garnish: CIVIC about 150 x 25 mm, VTEC 55 x 12 mm, HONDA 80 x 15 mm (ESTIMATED). Each letter cell sits one cell proud of the panel under it. ---- */
const EF_GLYPH={C:['.1111','1....','1....','1....','.1111'],I:['1','1','1','1','1'],V:['1...1','1...1','.1.1.','.1.1.','..1..'],T:['11111','..1..','..1..','..1..','..1..'],
  E:['1111','1...','111.','1...','1111'],H:['1..1','1..1','1111','1..1','1..1'],O:['.111.','1...1','1...1','1...1','.111.'],N:['1...1','11..1','1.1.1','1..11','1...1'],
  D:['111.','1..1','1..1','1..1','111.'],A:['..1..','.1.1.','1...1','11111','1...1'],S:['.1111','1....','.111.','....1','1111.'],R:['111.','1..1','111.','1.1.','1..1']};
function efBadge(surfaces,text,cellMM,yMM,zMM,col){
  const c=cellMM/20,gap=1,glyphs=[...text].map(ch=>EF_GLYPH[ch]),W=glyphs.reduce((a,g)=>a+g[0].length,0)+gap*(glyphs.length-1);
  const face=(y,z)=>{const j=Math.round(y*2),k=Math.round(z*2);let m=1e9;for(const G of surfaces){if(!G)continue;for(let i=G.x0;i<=G.x1;i++)if(G.get(i,j,k)>=0){m=Math.min(m,i);break;}}return m===1e9?null:(m-.5)/2;};   // rear face of the panel (x of its rearmost cell's outer face)
  const cells=[];let col0=0;
  for(const g of glyphs){for(let r=0;r<5;r++)for(let q=0;q<g[r].length;q++){if(g[r][q]!=='1')continue;
      const y=yMM/20+(2-r)*c,z=zMM/20+(col0+q-(W-1)/2)*c,f=face(y,z);if(f===null)continue;cells.push([Math.round((f-c/2)/c),Math.round(y/c),Math.round(z/c)]);}
    col0+=g[0].length+gap;}
  if(!cells.length)return null;let b=[1e9,-1e9,1e9,-1e9,1e9,-1e9];for(const [i,j,k] of cells)b=[Math.min(b[0],i),Math.max(b[1],i),Math.min(b[2],j),Math.max(b[3],j),Math.min(b[4],k),Math.max(b[5],k)];
  const G=new Grid(b[0],b[1],b[2],b[3],b[4],b[5]);for(const [i,j,k] of cells)G.set(i,j,k,col||0xc9ced4);return {grid:G,scale:c};}
function efBadges(hi,lamps){const S=[hi.trunk,lamps.garnish];
  return [efBadge(S,'CIVIC',5,722,0),efBadge(S,'VTEC',2.5,688,0),efBadge(S,'HONDA',3,842,-520)].filter(Boolean);}

/* ---- aero parts for the EF, seated on the panels they bolt to (10 mm cells, absolute). DESIGN parts: sizes are typical of the aftermarket parts, not one product.
   lip: a 20 mm black strip under the bumper's leading edge, front and corners (the fit rule's lip 20).
   splitter: a 10 mm plate 20-30 mm under the bumper's front bottom on spacer blocks, 70 mm proud of the face, kept ahead of the front arches (lip 30).
   hatch spoiler: a roof-edge spoiler on the hatch's top frame, longer than the factory one, its base on the hatch skin.
   GT wing: two stands on the hatch's top frame, a 220 mm chord blade 150 mm above it, end plates. ---- */
function efAeroFront(g,bumper,kind){const cells=[],put=(i,j,k,c)=>cells.push([i,j,k,c]);const mmx=x=>g.mm(x);
  const bot=new Map(),B=(i,k)=>bot.get(i+','+k);for(const [i,j,k] of bumper.list()){if(mmx(i/2)>330)continue;const key=i+','+k;if(!bot.has(key)||j<bot.get(key))bot.set(key,j);}
  const ks=new Map();for(const key of bot.keys()){const [i,k]=key.split(',').map(Number);if(!ks.has(k))ks.set(k,[]);ks.get(k).push(i);}
  const edge=new Map();for(const [k,is] of ks){let jm=1e9;for(const i of is)jm=Math.min(jm,B(i,k));let ie=-1e9;for(const i of is)if(B(i,k)<=jm+1)ie=Math.max(ie,i);edge.set(k,ie);}   // leading edge of the bumper's underside
  const archFront=g.wx(EF_M.arch.f.x-EF_M.arch.f.r)-1,kMax=Math.max(...ks.keys());
  if(kind==='lip'){for(const [k,ie] of edge){for(let i=ie-2;i<=ie;i++){const jb=B(i,k);if(jb===undefined||i/2<archFront+1)continue;for(let d=1;d<=2;d++)put(i,jb-d,k,d===1?0x16171a:0x0e0f11);}
      const jb=B(ie,k);if(jb!==undefined){for(let d=0;d<=2;d++)put(ie+1,jb-d,k,0x0e0f11);let jt=null;for(let j=jb+1;j<=jb+4;j++)if(bumper.get(ie+1,j,k)>=0){jt=j;break;}if(jt!==null)for(let j=jb+1;j<jt;j++)put(ie+1,j,k,0x0e0f11);}}}   // under the leading edge and one cell proud of it, up to the bumper's face where it bulges over the lip (no slot between them)
  else{const foot=[];for(const [k,ie] of edge){if(Math.abs(k)>kMax-6)continue;for(let i=ie-14;i<=ie+7;i++)if(i/2>=archFront)foot.push([i,k]);}
    let jp=1e9;for(const [i,k] of foot){const jb=B(i,k);if(jb!==undefined)jp=Math.min(jp,jb-3);}
    for(const [i,k] of foot)put(i,jp,k,0x111214);
    for(const zc of [0,-25,25,-50,50])for(let dk=-1;dk<=1;dk++){const k=zc*2+dk,ie=edge.get(k);if(ie===undefined)continue;for(let i=ie-4;i<=ie-2;i++){const jb=B(i,k);if(jb===undefined)continue;for(let j=jp+1;j<jb;j++)put(i,j,k,0x2a2c30);}}   // spacer blocks up to the bumper's underside
    for(const s of [-1,1]){const k=s*(kMax-6),ie=edge.get(k);if(ie===undefined)continue;for(let i=ie-4;i<=ie+7;i++)for(let j=jp+1;j<=jp+4;j++){const jb=B(i,k);if(jb!==undefined&&j>=jb)continue;put(i,j,k,0x0e0f11);}}}   // end fences
  if(!cells.length)return new Grid(0,0,0,0,0,0);
  let b=[1e9,-1e9,1e9,-1e9,1e9,-1e9];for(const [i,j,k] of cells)b=[Math.min(b[0],i),Math.max(b[1],i),Math.min(b[2],j),Math.max(b[3],j),Math.min(b[4],k),Math.max(b[5],k)];
  const G=new Grid(b[0],b[1],b[2],b[3],b[4],b[5]);for(const [i,j,k,c] of cells)G.set(i,j,k,c);return G;}
function efAeroHatch(g,hatch,kind,glass){const cells=[],put=(i,j,k,c)=>cells.push([i,j,k,c]);
  const top=new Map();for(const [i,j,k] of hatch.list()){const key=i+','+k;if(!top.has(key)||j>top.get(key))top.set(key,j);}
  const gtop=new Map();if(glass)for(const [i,j,k] of glass.list()){const key=i+','+k;if(!gtop.has(key)||j>gtop.get(key))gtop.set(key,j);}
  const T=(i,k)=>top.get(i+','+k);
  if(kind==='spoiler'){   // roof-edge visor spoiler: glued to the hatch's top frame from 3300 to 3420 mm, the blade carried 140 mm further back over the glass. Every column of
    // its underside follows the surface under it (the frame, then the glass, 10 mm off it), so it follows the hatch's crown out to its ends; 20 mm thick, 35 mm at the tail
    const i0=Math.round(g.wx(3300)*2),i2=Math.round(g.wx(3560)*2),half=Math.round(g.u(520)*2);
    for(let k=-half;k<=half;k++)for(let i=i2;i<=i0;i++){const t=T(i,k),gt=gtop.get(i+','+k),onFrame=t!==undefined&&(gt===undefined||t>=gt),sf=onFrame?t:gt;if(sf===undefined)continue;
      const L=(i0-i)/(i0-i2),y0=sf+1+(onFrame?0:1),y1=y0+1+Math.round(L*1.5);for(let j=y0;j<=y1;j++)put(i,j,k,j===y1?0x1a1b1e:0x141517);}
  }else{   // GT wing: stands at 3360 mm, 400 mm either side of the centre; blade 150 mm over the frame, 220 mm chord, rear edge 20 mm up; 1240 mm span with end plates
    const iS=Math.round(g.wx(3360)*2),iL=Math.round(g.wx(3330)*2),iT=Math.round(g.wx(3550)*2),half=Math.round(g.u(620)*2);
    let yb=-1e9;for(const zz of [-40,40])for(let i=iS-2;i<=iS+2;i++)for(let dk=-1;dk<=1;dk++){const t=T(i,zz+dk);if(t!==undefined)yb=Math.max(yb,t);}
    const yw=yb+15;
    for(let k=-half;k<=half;k++)for(let i=iT;i<=iL;i++){const L=(iL-i)/(iL-iT),yc=yw+Math.round(L*2);put(i,yc,k,0x15161a);put(i,yc+1,k,L<.15?0x15161a:-1);}   // blade
    for(const s of [-1,1])for(let i=iT-2;i<=iL+1;i++)for(let j=yw-4;j<=yw+7;j++)put(i,j,s*(half+1),0x0e0f11);   // end plates
    for(const s of [-1,1])for(let i=iS-2;i<=iS+1;i++)for(let dk=-1;dk<=0;dk++){const k=s*40+dk,t=T(i,k);if(t===undefined)continue;for(let j=t+1;j<yw;j++)put(i,j,k,0x2a2c30);}}   // stands on the hatch frame
  const L=cells.filter(c=>c[3]>=0);if(!L.length)return new Grid(0,0,0,0,0,0);
  let b=[1e9,-1e9,1e9,-1e9,1e9,-1e9];for(const [i,j,k] of L)b=[Math.min(b[0],i),Math.max(b[1],i),Math.min(b[2],j),Math.max(b[3],j),Math.min(b[4],k),Math.max(b[5],k)];
  const G=new Grid(b[0],b[1],b[2],b[3],b[4],b[5]);for(const [i,j,k,c] of L)G.set(i,j,k,c);return G;}

/* ---- the cargo bay behind the rear seat (DESIGN from photos of EF hatches: carpeted load floor, grey side trims moulded round the damper towers and wheel tubs,
   black trim over the lock panel with the striker, the cargo cover, two gas struts).
   The cargo cover is described where it is built below. 10 mm cells, absolute. Heights: load floor 520 mm (ef_body cargoFloor), cover 880-900 mm. ---- */
function efCargo(g,hi,garnish){const B=hi.body,cells=[],put=(i,j,k,c)=>cells.push([i,j,k,c]);const TRIM=0x3a3c41,CARPET=0x2b2c30,BLK=0x161719;
  const I0=-116,I1=-175,J0=52,J1=87;   // x -58 .. -87.5, y 520 .. 870 mm
  const wall=(i,j)=>{for(let k=20;k<=90;k++)if(B.get(i,j,k)>=0||B.get(i,j,-k)>=0)return k;return null;};
  for(let i=I1;i<=I0;i++){
    for(let j=J0+1;j<=J1;j++){const kw=wall(i,j);if(kw===null)continue;for(const s of [-1,1])if(B.get(i,j,s*(kw-1))<0)put(i,j,s*(kw-1),TRIM);}   // side trims, one cell inside the body's inner skin
    const kf=wall(i,J0+1);if(kf!==null)for(let k=-(kf-1);k<=kf-1;k++)if(B.get(i,J0,k)<0)put(i,J0,k,CARPET);}   // load floor
  // trim caps on the tops of the damper towers and wheel tubs inside the bay
  for(let i=I1;i<=I0;i++)for(let k=20;k<=78;k++)for(const s of [-1,1])for(let j=J0+1;j<J1;j++)if(B.get(i,j,s*k)>=0&&B.get(i,j+1,s*k)<0){const kw=wall(i,j+1);if(kw!==null&&k<kw-1)put(i,j+1,s*k,TRIM);}
  // lock panel trim across the bottom of the opening, with the striker
  const hatchAt=(i,j,k)=>hi.trunk.get(i,j,k)>=0||(garnish&&garnish.get(i,j,k)>=0);
  for(let k=-30;k<=30;k++)for(let i=-185;i<=I1+1;i++){let jt=null;for(let j=64;j>=40;j--)if(B.get(i,j,k)>=0){jt=j;break;}if(jt!==null&&B.get(i,jt+1,k)<0&&!hatchAt(i,jt+1,k)&&!hatchAt(i,jt+2,k))put(i,jt+1,k,BLK);}   // in front of the closed hatch's lower edge
  {let jt=null;for(let j=64;j>=40;j--)if(B.get(-180,j,0)>=0){jt=j;break;}if(jt!==null)for(const [di,dj,dk] of [[0,2,-1],[0,2,1],[0,3,-1],[0,3,1],[0,4,-1],[0,4,0],[0,4,1]])put(-180+di,jt+1+dj,dk,0xb7bcc3);}
  // cargo cover (part 84400-SR3 'shelf, rear'; owner's photos ref/ef/cargo_cover*.png): one fabric-covered board, 20 mm (j J1+1..J1+2), filling the opening
  // from wall to wall (a 10 mm gap to each side) and from the seat back to 50 mm ahead of the closed hatch's lower panel (its inner face is at x -1740 mm at
  // this height); its rear edge straight across with a pull lip at the middle and rounded corners, a moulded recess in its front half. It rests on the
  // ledges and hangs on two black brackets at its front corners; it lifts out ('Cover').
  const FAB=0x4a4b50,FABE=0x2c2d31,FABR=0x404146,shelf=[],RE=-169,TAB=12;
  const hw=i=>{let m=null;for(let j=J1;j<=J1+2;j++){const kw=wall(i,j);if(kw!==null)m=m===null?kw:Math.min(m,kw);}return m===null?null:m-3;};
  const hR=hw(RE),corner=(i,k)=>{const r=5,ci=RE+r,ck=hR-r,a=Math.abs(k);return !(i<ci&&a>ck&&Math.hypot(i-ci,a-ck)>r);};
  const recess=(i,k)=>{const i0=-121,i1=-141,h=hw(i),r=4;if(i>i0||i<i1||h===null)return false;const kk=hw(i0)-7,a=Math.abs(k);if(a>kk)return false;   // rounded rectangle
    const ci=Math.min(i0-r,Math.max(i1+r,i)),ck=Math.min(a,kk-r);return Math.hypot(i-ci,a-ck)<=r;};
  for(let i=RE;i<=I0-1;i++){const h=hw(i);if(h===null)continue;
    for(let k=-h;k<=h;k++){if(!corner(i,k))continue;if(i>=-121&&i<=-118&&Math.abs(k)>=hw(-119)-5)continue;const rc=recess(i,k);shelf.push([i,J1+1,k,rc?FABR:FABE]);if(!rc)shelf.push([i,J1+2,k,FAB]);}}
  for(let i=RE;i<=RE+1;i++)for(let k=-TAB;k<=TAB;k++)shelf.push([i,J1,k,FABE]);   // the pull lip under the rear edge
  {const h=hw(-119);for(const sd of [-1,1])for(let i=-121;i<=-118;i++)for(let j=J1+1;j<=J1+6;j++)for(let k=h-5;k<=(j<=J1+2?h:h-4);k++)put(i,j,sd*k,BLK);}   // the brackets: a foot under the cover's corner and a post 40 mm proud of it, clear of the quarter glass's lean
  for(let i=I1;i<=I0;i++){const kw=wall(i,J1);if(kw===null)continue;for(const sd of [-1,1])for(let k=Math.min(kw-1,40);k<kw;k++)if(B.get(i,J1,sd*k)<0)put(i,J1,sd*k,TRIM);}   // ledges under the cover's sides

  const mkG=L=>{if(!L.length)return new Grid(0,0,0,0,0,0);let b=[1e9,-1e9,1e9,-1e9,1e9,-1e9];for(const [i,j,k] of L)b=[Math.min(b[0],i),Math.max(b[1],i),Math.min(b[2],j),Math.max(b[3],j),Math.min(b[4],k),Math.max(b[5],k)];
    const G=new Grid(b[0],b[1],b[2],b[3],b[4],b[5]);for(const [i,j,k,c] of L)G.set(i,j,k,c);return G;};
  return {fixed:mkG(cells),shelf:mkG(shelf),pivot:[(I0-1+.5)/2,(J1+1.5)/2]};}   // the cover's hinge: its front edge on the brackets
/* ---- D-pillar trims (owner's photo of an EF with the hatch open, ref/ef/cargo_cover2.png): inside the hatch opening each D-pillar, between the quarter glass's
   rear edge and the hatch's shut line, is lined with a smooth grey plastic trim from the cargo cover up to the roof; a black rubber seal runs along the opening's
   edge and the gas strut's lower ball stud stands on the trim. Built from the body's own skin row by row: the pillar is closed 80 mm inboard of its skin (60 mm
   at the roof), from the shut-line lip forward to the glass; its face toward the opening carries the seal by the skin. 10 mm cells, absolute (mesh scale .5). ---- */
function efDPillarTrim(g,hi){const B=hi.body,H=hi.trunk,TRIMG=0x7a7d82,SEAL=0x141517,cells=[],box=new Set(),key=(i,j,k)=>i+','+j+','+k;
  for(const sd of [-1,1]){const Q=sd<0?hi.glass.qgL:hi.glass.qgR;
    for(let j=90;j<=124;j++){let gi=null;for(let i=Q.x0;i<=Q.x1&&gi===null;i++)for(let k=Q.z0;k<=Q.z1;k++)if(Q.get(i,j,k)>=0){gi=i;break;}   // the quarter glass's rear edge in this row
      if(gi===null)gi=-150;let rear=null;const kin=new Map();
      for(let i=-192;i<gi;i++){let a=null;for(let k=40;k<=88;k++)if(B.get(i,j,sd*k)>=0){a=k;break;}if(a===null)continue;if(rear===null)rear=i;kin.set(i,a);}
      if(rear===null)continue;
      const cnt=new Map();for(const [i,a] of kin)if(i<=rear+6)cnt.set(a,(cnt.get(a)||0)+1);let ks=null,best=0;for(const [a,n] of cnt)if(n>best||(n===best&&a>ks)){best=n;ks=a;}   // the skin's inner face along the pillar by the shut line
      if(ks===null||ks<50)continue;
      const T=Math.round(j<=100?8:j>=120?6:8-2*(j-100)/20);   // the pillar's depth inboard of its skin: 80 mm low down, 60 mm at the roof
      for(const [i,a] of kin){if(a<ks-T)continue;for(let k=ks-T;k<=a-1;k++){if(B.get(i,j,sd*k)>=0)continue;let nearH=false;   // never within 10 mm of the closed hatch
          for(let di=-2;di<=1&&!nearH;di++)for(let dj=-1;dj<=1&&!nearH;dj++)for(let dk=-1;dk<=1&&!nearH;dk++)if(H.get(i+di,j+dj,sd*k+dk)>=0)nearH=true;
          if(!nearH){cells.push([i,j,sd*k,ks-k<=1?2:1]);box.add(key(i,j,sd*k));}}}}}
  // colour: grey trim; the face toward the opening carries the black rubber seal along its outer 20 mm (by the skin)
  for(const c of cells){const [i,j,k,o]=c;c[3]=(!box.has(key(i-1,j,k))&&o===2)?SEAL:TRIMG;}
  if(!cells.length)return new Grid(0,0,0,0,0,0);let b=[1e9,-1e9,1e9,-1e9,1e9,-1e9];for(const [i,j,k] of cells)b=[Math.min(b[0],i),Math.max(b[1],i),Math.min(b[2],j),Math.max(b[3],j),Math.min(b[4],k),Math.max(b[5],k)];
  const G=new Grid(b[0],b[1],b[2],b[3],b[4],b[5]);for(const [i,j,k,c] of cells)G.set(i,j,k,c);return G;}
/* ---- hatch gas strut: a 22 mm body from the ball stud on the body and an 8 mm rod to the stud on the hatch (10 mm cells along z, drawn with segTo) ---- */
/* ---- roof spoiler on the hatch top (paint), from the side profile; ends rounded down ---- */
function efSpoiler(g,hatch,glass){
  const {u,wx}=g,S=EFD.spoiler,mmx=x=>g.mm(x),hw=u(S.half);
  // over the glass the lip's underside keeps its measured gap at every point across the car: where the glass falls away with its crown the lip comes down with it
  const gtop=new Map();if(glass)for(const [i,j,k] of glass.list()){const key=i+','+k;if(!gtop.has(key)||j>gtop.get(key))gtop.set(key,j);}
  const crownDrop=(i,k)=>{const c=gtop.get(i+',0'),e=gtop.get(i+','+k);return (c!==undefined&&e!==undefined)?(c-e)*10:0;};
  const G=hgrid(wx(3610),wx(3290),u(1240),u(1330),-hw-1,hw+1);
  // top of the hatch skin in each column: the spoiler sits on it and never wider than the hatch under it
  const topJ=new Map();if(hatch)for(const [i,j,k] of hatch.list()){const key=i+','+k;if(!topJ.has(key)||topJ.get(key)<j)topJ.set(key,j);}
  eachCell(G,null,(i,j,k,n)=>{const x=i/HR,y=j/HR,z=k/HR,m=mmx(x),ym=y*20,az=Math.abs(z)*20;
    if(m<S.top[0][0]||m>S.top[S.top.length-1][0])return;
    const endDrop=az>S.half-60?(az-(S.half-60))*.6:0;
    const tj=topJ.get(i+','+k);if(hatch&&tj===undefined&&m<3540)return;   // over the glass the lip overhangs freely; elsewhere it needs hatch under it
    const cd=tj===undefined?crownDrop(i,k):0,tp=efTab(S.top,m)-endDrop-cd,un=efTab(S.under.slice().reverse().map(([a,b])=>[a,b]),m)-cd;
    if(ym>tp||az>S.half)return;if(tj!==undefined){if(j<=tj)return;}else if(ym<un)return;
    G.d[n]=1;});
  shellHi(G,(x,y,z,inner)=>inner?0x1a1b1d:PAINT,2);
  return G;
}

/* ---- door mirror (black housing on the sail triangle, glass on the rear face); built in the door's frame (absolute cells, the door group subtracts its hinge) ---- */
function efMirror(g,sd){
  const {u,wx}=g,Mi=EFD.mirror;
  const X0=wx(Mi.x1),X1=wx(Mi.x0),Y0=u(Mi.y0),Y1=u(Mi.y1);
  const zs=g.halfAt(wx((Mi.x0+Mi.x1)/2),u(940))*20;   // outer skin at the mount
  const Z0=u(zs+Mi.out0),Z1=u(zs+Mi.out1);
  const shell=hgrid(X0-1,X1+1,Y0-2,Y1+1,sd<0?-Z1-1:u(zs-30),sd<0?-u(zs-30):Z1+1),glass=hgrid(X0-1,X1+1,Y0-2,Y1+1,sd<0?-Z1-1:Z0,sd<0?-Z0:Z1+1);
  const BLK=0x16171a,GLS=0x9bb4c0,cy=(Y0+Y1)/2,cz=(Z0+Z1)/2,a=(Z1-Z0)/2,b=(Y1-Y0)/2;
  const inside=(y,z,s)=>Math.pow(Math.abs(z-cz)/(a*s),4)+Math.pow(Math.abs(y-cy)/(b*s),4)<=1;
  eachCell(shell,null,(i,j,k,n)=>{const x=i/HR,y=j/HR,z=Math.abs(k/HR);
    // housing: rounded box, tapering toward the front
    if(x>=X0&&x<=X1&&z>=Z0-.5&&z<=Z1+.5){const t=(x-X0)/(X1-X0),s=1-.18*t;if(inside(y,z,s)){if(x<X0+.6&&inside(y,z,.86)){glass.set(i,j,k,GLS);return;}shell.d[n]=(x<X0+1.1&&!inside(y,z,.93))?BLK:PAINT;return;}}   // body-colour housing (SiR), black rim round the glass
    // arm from the sail to the housing
    if(x>=X0+3.3&&x<=X0+4.1&&y>=Y0-.5&&y<=Y0+1.5&&z>=u(zs-30)&&z<cz)shell.d[n]=BLK;});   // the arm stands on the sail, ahead of the door glass's front edge, and runs up into the housing's rounded underside
  return {shell,glass,glassCenter:[X0-.05,cy,sd*cz],glassSize:[(Z1-Z0)*.86,(Y1-Y0)*.86]};
}
if(typeof module!=='undefined')module.exports={EFD,efBumper,efBumperRelief,efLamps,efSpoiler,efMirror};
