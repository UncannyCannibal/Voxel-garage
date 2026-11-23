/* ===== NISSAN Z32: detail parts from the references (ref/z32/SOURCES.md): body-colour bumpers (front: turn and clearance lamps wrapping round the corners, fog lamps,
   the plate and the intake slot; rear: plate, quad tail pipes in two cut-outs, red side reflectors), the headlamps under clear covers in the front corners, the full-width
   tail-lamp panel (red over amber, the reverse lamps and the 300ZX garnish in the middle), the hatch's black lip with the high-mount stop lamp, the door mirrors on the
   black sail triangles, the twin-turbo rear wing (option), badges in our own plain block type (no maker's logo or badge typeface).
   All 10 mm grids in absolute hi-res cells (mount at the body origin, mesh scale .5). Millimetre tables: x rearward from the front bumper tip, y from the ground. ===== */
const Z32D={
  // front bumper (MEASURED side view: face 0 mm at 348-406 mm high, 58 mm back at the chin; top 466 at the centre falling to 430 at the arch; bottom 131 / 160 at the arch)
  bumperF:{face:[[131,58],[184,58],[266,35],[301,12],[348,0],[406,0],[454,12],[466,30]],top:466,topSide:430,bot:131,botSide:160,len:560,
    turn:{z0:600,z1:815,y0:338,y1:440,amb:.62},fog:{z0:305,z1:500,y0:342,y1:430},intake:{z:450,y0:222,y1:300},plate:{y:370,w:330,h:165},
    marker:null},
  // rear bumper (MEASURED side view: face 4310 at 517-558 mm, rolling under to 4222 at the bottom 243; top 658 under the tail-lamp panel, 622-646 on the sides)
  bumperR:{face:[[230,4214],[243,4222],[336,4240],[359,4257],[395,4280],[430,4292],[482,4304],[517,4310],[558,4310],[605,4298],[622,4275],[640,4228],[658,4211]],top:658,topSide:640,bot:230,botSide:222,len:3740,
    plate:{y:378,w:330,h:165},exhaust:{zc:453,w:105,y:282,tips:[[405,225],[500,225]],r:34},marker:{x0:3903,x1:4048,y0:523,y1:547}},
  headlamp:{x0:190,x1:450,z0:300,z1:655,y0:555,y1:680,proj:{z:395,r:48},hi:{z:560}},   // MEASURED (side, top, front views); projector low beam inboard, reflector high beam outboard (photographs)
  tail:{y0:735,y1:903,yMid:815,zLamp:430,zRev0:230,zRev1:335,wrapX:4060},              // MEASURED side view (lamp wrap 4066-4182 mm, 728-903 mm); rear photographs for the split
  lip:{x0:4040,y1:975,hmsl:{z:210,y0:958,y1:972}},                                     // the hatch's black lip over the lamps with the high-mount stop lamp (photographs)
  markerF:{x0:1352,x1:1456,y0:611,y1:634},                                              // amber side lamp on the front fender (MEASURED)
  mirror:{x0:1690,x1:1850,y0:838,y1:940,out0:40,out1:255},                              // MEASURED front and top views (tip 1035-1048 mm off the centre, 836-936 mm high); body-colour housing on the black sail
  handle:{x0:2724,x1:2850,y0:681,y1:739},fuel:{x0:2947,x1:3138,y0:669,y1:810,r:30},   // MEASURED (contrast-stretched side view); fuel flap on the left quarter (photographs)
  wing:{x0:3940,x1:4195,top:1007,thick:32,gap:28,posts:[450],postX:3995,half:790}      // twin-turbo rear wing (MEASURED side view: 3944-4193 mm, top 997-1007)
};
function z32Tab(T,v){if(v<=T[0][0])return T[0][1];for(let i=0;i<T.length-1;i++){const a=T[i],b=T[i+1];if(v<=b[0])return a[1]+(b[1]-a[1])*(v-a[0])/(b[0]-a[0]);}return T[T.length-1][1];}
// how far the bumper face stands back from its centreline face at lateral az (mm): the body's plan read backwards (MEASURED top view)
function z32PlanBack(front,az){const P=Z32_M.plan;
  if(front){if(az<=P[0][1])return 0;for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1];if(az<=b[1])return a[0]+(b[0]-a[0])*(az-a[1])/(b[1]-a[1]);}return 700;}
  for(let i=P.length-1;i>0;i--){const a=P[i],b=P[i-1];if(az<=a[1])return 0;if(az<=b[1])return (Z32_M.L-a[0])+((Z32_M.L-b[0])-(Z32_M.L-a[0]))*(az-a[1])/(b[1]-a[1]);}return 700;}
// inside a bumper moulding T mm thick (its face from the measured section and plan, its side wing on the body's outline, its bottom edge sweeping from the face's
// height to the wing's): the bumper is this at T = 40; the body is cut away inside it at T = 50 (a 10 mm gap behind the moulding)
function z32BumperGeom(g,front,x,y,z){const B=front?Z32D.bumperF:Z32D.bumperR,m=g.mm(x),ym=y*20,az=Math.abs(z)*20;
  if(front?m>B.len:m<B.len)return null;const arch=front?g.ARCH_F:g.ARCH_RR;if(Math.hypot(x-arch.x,y-arch.y)<arch.r)return null;
  const s=front?clampv(m/B.len,0,1):clampv((Z32_M.L-m)/(Z32_M.L-B.len),0,1),t=s*s;   // 0 at the centre face, 1 at the arch
  const top=B.top+(B.topSide-B.top)*t,bot=B.bot+(B.botSide-B.bot)*t;if(ym>top||ym<bot)return null;
  const hw=g.halfAt(x,Math.min(y,g.u(top)))*20;if(az>hw+4)return null;
  const face=front?z32Tab(B.face,ym)+z32PlanBack(true,az):z32Tab(B.face,ym)-z32PlanBack(false,az);
  return {d:front?m-face:face-m,hw,az,top,bot};}
function z32BumperIn(g,front,x,y,z,T){const q=z32BumperGeom(g,front,x,y,z);if(!q||q.d<0)return false;return q.d<=T||q.hw-q.az<=T;}
function z32BumperOutside(g,front,x,y,z){const q=z32BumperGeom(g,front,x,y,z);return !!q&&q.d<0;}
function z32BumperRelief(g,x,y,z,more){const T=50+(more||0);return z32BumperIn(g,true,x,y,z,T)||z32BumperIn(g,false,x,y,z,T)||(!more&&(z32BumperOutside(g,true,x,y,z)||z32BumperOutside(g,false,x,y,z)));}

/* ---- bumpers: body-colour mouldings 40 mm thick; lamps, plate recess, intake slot and tail-pipe cut-outs ---- */
function z32Bumper(g,front){
  const B=front?Z32D.bumperF:Z32D.bumperR,{wx,u}=g,mmx=x=>g.mm(x),ext=Math.ceil(g.halfW+1.5);
  const x0=front?wx(B.len+10):wx(Z32_M.L+20),x1=front?wx(-20):wx(B.len-10);
  const G=hgrid(Math.min(x0,x1)-1,Math.max(x0,x1)+1,u(Math.min(B.bot,B.botSide))-1,u(Math.max(B.top,B.topSide))+1,-ext,ext);
  eachCell(G,null,(i,j,k,n)=>{if(z32BumperIn(g,front,i/HR,j/HR,k/HR,40))G.d[n]=1;});
  shellHi(G,(x,y,z,inner)=>inner?0x1a1b1d:PAINT,2);
  const lamps={},put=(kind,i,j,k,c)=>{(lamps[kind]=lamps[kind]||[]).push([i,j,k,c]);};
  // the outer skin facing forward / rearward (or the wing's side for the wrap-round lamps)
  const faceCells=(pred,fn)=>eachCell(G,null,(i,j,k,n)=>{if(G.d[n]<0)return;const x=i/HR,y=j/HR,z=k/HR,q=z32BumperGeom(g,front,x,y,z);if(!q)return;
    if(pred(mmx(x),y*20,Math.abs(z)*20,q))fn(n,i,j,k,x,y,z,q);});
  const outer=q=>q.d<=12||q.hw-q.az<=12;
  if(front){
    const T=B.turn,F=B.fog,I=B.intake,edge=(a,b,v)=>v<a+12||v>b-12;
    // turn and clearance lamp: one housing from 600 mm out round the corner onto the side (amber outboard of 62 % of its width, clear inboard)
    faceCells((m,ym,az,q)=>az>=T.z0&&ym>=T.y0&&ym<=T.y1&&outer(q)&&(az<=T.z1||m<B.len-200),(n,i,j,k,x,y,z,q)=>{const ym=y*20,az=Math.abs(z)*20;
      const e=edge(T.y0,T.y1,ym)||(az<T.z0+12),amb=az>T.z0+(T.z1-T.z0)*T.amb||q.hw-q.az<=12;
      put(e?'frame':(amb?'famb':'head'),i,j,k,e?0x1a1b1d:(amb?0xf09a2a:0xd9e2e6));G.d[n]=-1;});
    // fog lamps (clear), inboard
    faceCells((m,ym,az,q)=>az>=F.z0&&az<=F.z1&&ym>=F.y0&&ym<=F.y1&&q.d<=12,(n,i,j,k,x,y,z)=>{const ym=y*20,az=Math.abs(z)*20,e=edge(F.y0,F.y1,ym)||edge(F.z0,F.z1,az);
      put(e?'frame':'fog',i,j,k,e?0x1a1b1d:((j+k)%3===0?0xc9d3d8:0xe2e8ec));G.d[n]=-1;});
    // intake slot across the lower bumper (black, horizontal vanes)
    faceCells((m,ym,az,q)=>az<=I.z&&ym>=I.y0&&ym<=I.y1&&q.d<=30,(n,i,j,k,x,y)=>{G.d[n]=(Math.round(y*20/20)%2)?0x0d0e10:0x2a2c30;});
  }else{
    const E=B.exhaust;faceCells((m,ym,az)=>Math.abs(az-E.zc)<E.w&&ym<E.y,(n)=>{G.d[n]=-1;});   // the tail pipes' cut-outs, one each side (two pipes in each)
    const R=B.marker;faceCells((m,ym,az,q)=>m>=R.x0&&m<=R.x1&&ym>=R.y0&&ym<=R.y1&&q.hw-q.az<=12,(n,i,j,k)=>{put('red',i,j,k,0xb3201b);G.d[n]=-1;});   // red side reflectors
  }
  // plate recess: 10 mm deep behind the plate (the plate is a separate part)
  // the plate stands in a vertical pocket: its back wall 10 mm behind the deepest point of the face over the plate, the face cut away in front of it, a 10 mm
  // wall round the pocket from the back wall out to the face (no opening into the moulding's hollow)
  {const pl=B.plate,hw=pl.w/2+10,hh=pl.h/2+10,J0=Math.round((pl.y-hh)/10),J1=Math.round((pl.y+hh)/10),K=Math.round(hw/10),sg=front?1:-1;
   const outerI=new Map();for(const [i,j,k] of G.list()){if(j<J0-1||j>J1+1||Math.abs(k)>K+1)continue;const key=j+','+k,o=outerI.get(key);if(o===undefined||(front?i>o:i<o))outerI.set(key,i);}
   let deep=front?1e9:-1e9;for(const [key,i] of outerI){const [j,k]=key.split(',').map(Number);if(j>=J0&&j<=J1&&Math.abs(k)<=K)deep=front?Math.min(deep,i):Math.max(deep,i);}
   const back=deep-sg;   // the back wall's cell
   for(const [key,io] of outerI){const [j,k]=key.split(',').map(Number),ring=j===J0-1||j===J1+1||Math.abs(k)===K+1;if(j<J0-1||j>J1+1||Math.abs(k)>K+1)continue;
     if(ring){for(let i=back;front?i<=io:i>=io;i+=sg)if(G.get(i,j,k)<0)G.set(i,j,k,PAINT);continue;}
     for(let i=back+sg;front?i<=io:i>=io;i+=sg)G.set(i,j,k,-1);G.set(back,j,k,PAINT);G.set(back-sg,j,k,0x1a1b1d);}
   B.plate.backI=back;}   // the plate's back face sits on this wall
  const out={grid:G,lamps:{}};
  for(const kk in lamps){const L=lamps[kk];let b=[1e9,-1e9,1e9,-1e9,1e9,-1e9];for(const [i,j,k] of L)b=[Math.min(b[0],i),Math.max(b[1],i),Math.min(b[2],j),Math.max(b[3],j),Math.min(b[4],k),Math.max(b[5],k)];
    const Gl=new Grid(b[0],b[1],b[2],b[3],b[4],b[5]);for(const [i,j,k,c] of L)Gl.set(i,j,k,c);out.lamps[kk]=Gl;}
  out.plate=B.plate;
  return out;
}

/* ---- lamps on the body and the hatch: the outer skin cells in the lamp areas move into lamp grids, so the lenses are flush with the panels ---- */
function z32Lamps(g,hi){
  const {u,wx}=g,mmx=x=>g.mm(x),HL=Z32D.headlamp,TL=Z32D.tail,LP=Z32D.lip,MF=Z32D.markerF;
  const cells={};const put=(kind,i,j,k,c)=>{(cells[kind]=cells[kind]||[]).push([i,j,k,c]);};
  const OUT=new Set(),isEmpty=(i,j,k)=>hi.body.get(i,j,k)<0&&hi.hood.get(i,j,k)<0&&hi.trunk.get(i,j,k)<0&&hi.doorL.get(i,j,k)<0&&hi.doorR.get(i,j,k)<0;
  const outer=(Gd,i,j,k)=>{for(const [a,b,c] of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]])if(isEmpty(i+a,j+b,k+c))return true;return false;};
  const BH=[wx(HL.x1)-1,wx(HL.x0)+1,u(HL.y0)-1,u(HL.y1)+1,-g.halfW-1,g.halfW+1],BT=[g.REAR_X-1,wx(TL.wrapX)+1,u(TL.y0)-1,u(TL.y1)+1,-g.halfW-1,g.halfW+1],BM=[wx(MF.x1)-1,wx(MF.x0)+1,u(MF.y0)-1,u(MF.y1)+1,-g.halfW-1,g.halfW+1];
  for(const [Gd,b,t] of [[hi.body,BH,'b'],[hi.body,BT,'b'],[hi.body,BM,'b'],[hi.trunk,null,'t']])eachCell(Gd,b,(i,j,k,n)=>{if(Gd.d[n]>=0&&outer(Gd,i,j,k))OUT.add(t+i+','+j+','+k);});
  const isOut=(t,i,j,k)=>OUT.has(t+i+','+j+','+k);
  // headlamps: clear cover over a projector (dark bowl, bright lens, chrome ring) inboard and a reflector outboard; a black frame round the cover
  eachCell(hi.body,BH,(i,j,k,n)=>{const v=hi.body.d[n];if(v!==PAINT||!isOut('b',i,j,k))return;const x=i/HR,y=j/HR,z=k/HR,m=mmx(x),ym=y*20,az=Math.abs(z)*20;
    if(m<HL.x0||m>HL.x1||az<HL.z0||az>HL.z1||ym<HL.y0||ym>HL.y1)return;
    const e=m<HL.x0+14||m>HL.x1-14||az<HL.z0+14||az>HL.z1-14;
    if(e){put('frame',i,j,k,0x1a1b1d);hi.body.d[n]=-1;return;}
    const P=HL.proj,dp=Math.hypot(az-P.z,(m-(HL.x0+HL.x1)/2)*.8);
    const refl=Math.abs(az-HL.hi.z)<75&&m>HL.x0+30&&m<HL.x1-40;   // the high-beam reflector bowl outboard (silvered), the projector's lens and chrome ring inboard, the black housing round them, under the clear cover
    put('head',i,j,k,dp<P.r*.5?0xe9eef2:(dp<P.r*.8?0x5d646b:(dp<P.r+10?0xc4cad0:(refl?(j%4===0?0x8e969e:0xa3abb3):0x2e3439))));hi.body.d[n]=-1;});
  // front side lamps (amber) on the fenders
  eachCell(hi.body,BM,(i,j,k,n)=>{if(hi.body.d[n]!==PAINT||!isOut('b',i,j,k))return;const x=i/HR,y=j/HR,z=k/HR,m=mmx(x),ym=y*20;
    if(m<MF.x0||m>MF.x1||ym<MF.y0||ym>MF.y1||Math.abs(z)<g.halfAt(x,y)-1)return;put('famb',i,j,k,0xf09a2a);hi.body.d[n]=-1;});
  // tail-lamp panel: full width on the tail face and 120 mm round each corner; red over amber outboard, two reverse lamps each side of the black middle with its 300ZX garnish
  eachCell(hi.body,BT,(i,j,k,n)=>{const v=hi.body.d[n];if((v!==PAINT&&v!==PAINT_SHADE)||!isOut('b',i,j,k))return;const x=i/HR,y=j/HR,z=k/HR,m=mmx(x),ym=y*20,az=Math.abs(z)*20;
    if(ym<TL.y0||ym>TL.y1)return;const face=m>4130,side=az>g.halfAt(x,y)*20-25&&m>=TL.wrapX;if(!face&&!side)return;
    const edge=ym<TL.y0+10||ym>TL.y1-10;
    if(edge)put('frame',i,j,k,0x101113);
    else if(az>=TL.zLamp||side){if(Math.abs(ym-TL.yMid)<=6)put('frame',i,j,k,0x101113);else if(ym>TL.yMid)put('red',i,j,k,(az>TL.zLamp+150&&az<TL.zLamp+260&&ym>TL.yMid+30&&ym<TL.y1-30)?0xd42a22:0xa81c1a);else put('amb',i,j,k,0xe8892a);}
    else if(az>=TL.zRev0&&az<=TL.zRev1&&Math.abs(ym-TL.yMid)>10&&Math.abs(ym-TL.yMid)<70)put('wht',i,j,k,0xe4e7ea);
    else put('frame',i,j,k,(az<TL.zRev0-20&&ym>TL.yMid-40&&ym<TL.yMid+40)?0x1d1e21:0x141517);
    hi.body.d[n]=-1;});
  // the hatch's black lip over the lamps, with the high-mount stop lamp across its top in the middle
  eachCell(hi.trunk,null,(i,j,k,n)=>{const v=hi.trunk.d[n];if(v!==PAINT&&v!==PAINT_SHADE)return;const x=i/HR,y=j/HR,z=k/HR,m=mmx(x),ym=y*20,az=Math.abs(z)*20;
    if(m<LP.x0||ym>LP.y1)return;const H=LP.hmsl;
    if(az<=H.z&&ym>=H.y0&&ym<=H.y1&&isOut('t',i,j,k)){put('hmsl',i,j,k,0xb3201b);hi.trunk.d[n]=-1;return;}
    if(isOut('t',i,j,k)){put('garnish',i,j,k,0x18191c);hi.trunk.d[n]=-1;}});
  const out={};
  for(const kk in cells){const L=cells[kk];let b=[1e9,-1e9,1e9,-1e9,1e9,-1e9];for(const [i,j,k] of L)b=[Math.min(b[0],i),Math.max(b[1],i),Math.min(b[2],j),Math.max(b[3],j),Math.min(b[4],k),Math.max(b[5],k)];
    const G=new Grid(b[0],b[1],b[2],b[3],b[4],b[5]);for(const [i,j,k,c] of L)G.set(i,j,k,c);out[kk]=G;}
  return out;
}

/* ---- badge lettering (5-row block letters, our own plain type): 300ZX on the middle of the tail-lamp panel, NISSAN on the left of the hatch lip (photographs).
   Sizes from the rear photographs: 300ZX about 190 x 30 mm, NISSAN 120 x 15 mm (ESTIMATED). Each cell sits one cell proud of the surface behind it. ---- */
const Z32_GLYPH={'3':['111.','...1','.11.','...1','111.'],'0':['.11.','1..1','1..1','1..1','.11.'],Z:['1111','..1.','.1..','1...','1111'],X:['1..1','.11.','.11.','.11.','1..1'],
  N:['1...1','11..1','1.1.1','1..11','1...1'],I:['1','1','1','1','1'],S:['.111','1...','.11.','...1','111.'],A:['.11.','1..1','1111','1..1','1..1']};
function z32Badge(surfaces,text,cellMM,yMM,zMM,col){
  const c=cellMM/20,gap=1,glyphs=[...text].map(ch=>Z32_GLYPH[ch]),W=glyphs.reduce((a,g)=>a+g[0].length,0)+gap*(glyphs.length-1);
  const face=(y,z)=>{const j=Math.round(y*2),k=Math.round(z*2);let m=1e9;for(const G of surfaces){if(!G)continue;for(let i=G.x0;i<=G.x1;i++)if(G.get(i,j,k)>=0){m=Math.min(m,i);break;}}return m===1e9?null:(m-.5)/2;};
  const cells=[];let col0=0;
  for(const gl of glyphs){for(let r=0;r<5;r++)for(let q=0;q<gl[r].length;q++){if(gl[r][q]!=='1')continue;
      const y=yMM/20+(2-r)*c,z=zMM/20+(col0+q-(W-1)/2)*c,f=face(y,z);if(f===null)continue;cells.push([Math.round((f-c/2)/c),Math.round(y/c),Math.round(z/c)]);}
    col0+=gl[0].length+gap;}
  if(!cells.length)return null;let b=[1e9,-1e9,1e9,-1e9,1e9,-1e9];for(const [i,j,k] of cells)b=[Math.min(b[0],i),Math.max(b[1],i),Math.min(b[2],j),Math.max(b[3],j),Math.min(b[4],k),Math.max(b[5],k)];
  const G=new Grid(b[0],b[1],b[2],b[3],b[4],b[5]);for(const [i,j,k] of cells)G.set(i,j,k,col||0xc9ced4);return {grid:G,scale:c};}
function z32Badges(hi,lamps){const T=[hi.body,lamps.frame,lamps.red,lamps.amb,lamps.wht],L=[hi.trunk,lamps.garnish];
  return {body:[z32Badge(T,'300ZX',6,815,0,0xaeb4bb)].filter(Boolean),hatch:[z32Badge(L,'NISSAN',3,935,-560,0xc9ced4)].filter(Boolean)};}

/* ---- door mirror: body-colour housing on an arm from the black sail, glass on its rear face; built in the door's frame (absolute cells, the door group subtracts its hinge) ---- */
function z32Mirror(g,sd){
  const {u,wx}=g,Mi=Z32D.mirror;
  const X0=wx(Mi.x1),X1=wx(Mi.x0),Y0=u(Mi.y0),Y1=u(Mi.y1);
  const zs=g.halfAt(wx((Mi.x0+Mi.x1)/2),u(890))*20;   // outer skin at the mount
  const Z0=u(zs+Mi.out0),Z1=u(zs+Mi.out1);
  const shell=hgrid(X0-1,X1+1,Y0-2,Y1+1,sd<0?-Z1-1:u(zs-30),sd<0?-u(zs-30):Z1+1),glass=hgrid(X0-1,X1+1,Y0-2,Y1+1,sd<0?-Z1-1:Z0,sd<0?-Z0:Z1+1);
  const BLK=0x16171a,GLS=0x9bb4c0,cy=(Y0+Y1)/2,cz=(Z0+Z1)/2,a=(Z1-Z0)/2,b=(Y1-Y0)/2;
  const inside=(y,z,s)=>Math.pow(Math.abs(z-cz)/(a*s),3)+Math.pow(Math.abs(y-cy)/(b*s),3)<=1;
  eachCell(shell,null,(i,j,k,n)=>{const x=i/HR,y=j/HR,z=Math.abs(k/HR);
    if(x>=X0&&x<=X1&&z>=Z0-.5&&z<=Z1+.5){const t=(x-X0)/(X1-X0),s=1-.28*t*t;if(inside(y,z,s)){if(x<X0+.6&&inside(y,z,.86)){glass.set(i,j,k,GLS);return;}shell.d[n]=(x<X0+1.1&&!inside(y,z,.93))?BLK:PAINT;return;}}
    if(x>=X0+3.5&&x<=X0+5.5&&y>=Y0-.5&&y<=Y0+1.5&&z>=u(zs-30)&&z<Z0)shell.d[n]=BLK;});   // the arm stands on the sail
  return {shell,glass,glassCenter:[X0-.05,cy,sd*cz],glassSize:[(Z1-Z0)*.86,(Y1-Y0)*.86]};
}

/* ---- the twin-turbo rear wing: a body-colour blade on two short posts on the hatch's rear frame, ends turned down (MEASURED side view; width from the rear view) ---- */
function z32Wing(g,hatch){
  const {u,wx}=g,W=Z32D.wing,cells=[],put=(i,j,k,c)=>cells.push([i,j,k,c]);
  const topJ=new Map();for(const [i,j,k] of hatch.list()){const key=i+','+k;if(!topJ.has(key)||topJ.get(key)<j)topJ.set(key,j);}
  const i0=Math.round(wx(W.x0)*2),i1=Math.round(wx(W.x1)*2),half=Math.round(u(W.half)*2),jt=Math.round(u(W.top)*2),th=Math.round(W.thick/10);
  for(let k=-half;k<=half;k++){const az=Math.abs(k)*10,drop=az>W.half-90?Math.round((az-(W.half-90))/30):0;
    for(let i=i1;i<=i0;i++){const t=(i0-i)/(i0-i1),yTop=jt-drop-Math.round(t*t*1.5),yBot=yTop-th+Math.round(t*1.2);   // thicker leading edge, thin trailing edge
      for(let j=yBot;j<=yTop;j++)put(i,j,k,PAINT);}}
  for(const zp of W.posts)for(const s of [-1,1])for(let di=-3;di<=3;di++)for(let dk=-2;dk<=2;dk++){const i=Math.round(wx(W.postX)*2)+di,k=s*Math.round(u(zp)*2)+dk,t=topJ.get(i+','+k);if(t===undefined)continue;
    const yB=jt-th;for(let j=t+1;j<yB;j++)put(i,j,k,PAINT);}
  const L=cells;if(!L.length)return new Grid(0,0,0,0,0,0);
  let b=[1e9,-1e9,1e9,-1e9,1e9,-1e9];for(const [i,j,k] of L)b=[Math.min(b[0],i),Math.max(b[1],i),Math.min(b[2],j),Math.max(b[3],j),Math.min(b[4],k),Math.max(b[5],k)];
  const G=new Grid(b[0],b[1],b[2],b[3],b[4],b[5]);for(const [i,j,k,c] of L)if(hatch.get(i,j,k)<0)G.set(i,j,k,c);return G;}

/* ---- fuel flap (left rear quarter) and door pull: shut lines in the paint (PAINT_SHADE), a finger recess at the flap's rear edge ---- */
function z32Flap(g,hi){const F=Z32D.fuel,{u,wx}=g;
  eachCell(hi.body,[wx(F.x1)-1,wx(F.x0)+1,u(F.y0)-1,u(F.y1)+1,-g.halfW-2,0],(i,j,k,n)=>{if(hi.body.d[n]!==PAINT)return;const x=i/HR,y=j/HR,z=k/HR,m=g.mm(x),ym=y*20;
    if(Math.abs(z)<g.halfAt(x,y)-1.1)return;const cx=clampv(m,F.x0+F.r,F.x1-F.r),cy=clampv(ym,F.y0+F.r,F.y1-F.r),d=Math.hypot(m-cx,ym-cy);
    if(d>F.r-6&&d<=F.r+4&&m>=F.x0-4&&m<=F.x1+4&&ym>=F.y0-4&&ym<=F.y1+4)hi.body.d[n]=PAINT_SHADE;
    else if(m>F.x1-28&&m<F.x1-8&&Math.abs(ym-(F.y0+F.y1)/2)<14)hi.body.d[n]=PAINT_SHADE;});}

/* ---- aero on the Z32 (10 mm cells, absolute; DESIGN sizes typical of the parts, no one maker's product):
   lip / splitter under the front bumper's leading edge (as the EF's, kept ahead of the front arches); GT wing on two stands on the hatch's rear frame. ---- */
function z32AeroFront(g,bumper,kind,bodyHi){const cells=[],put=(i,j,k,c)=>cells.push([i,j,k,c]);const mmx=x=>g.mm(x);
  const bot=new Map(),B=(i,k)=>bot.get(i+','+k);for(const [i,j,k] of bumper.list()){if(mmx(i/2)>420)continue;const key=i+','+k;if(!bot.has(key)||j<bot.get(key))bot.set(key,j);}
  const ks=new Map();for(const key of bot.keys()){const [i,k]=key.split(',').map(Number);if(!ks.has(k))ks.set(k,[]);ks.get(k).push(i);}
  const edge=new Map();for(const [k,is] of ks){let jm=1e9;for(const i of is)jm=Math.min(jm,B(i,k));let ie=-1e9;for(const i of is)if(B(i,k)<=jm+1)ie=Math.max(ie,i);edge.set(k,ie);}
  const archFront=g.wx(Z32_M.arch.f.x-Z32_M.arch.f.r)-1,kMax=Math.max(...ks.keys());
  if(kind==='lip'){for(const [k,ie] of edge){for(let i=ie-2;i<=ie;i++){const jb=B(i,k);if(jb===undefined||i/2<archFront+1)continue;for(let d=1;d<=2;d++)put(i,jb-d,k,d===1?0x16171a:0x0e0f11);}
      const jb=B(ie,k);if(jb!==undefined){let jt=null;for(let j=jb;j<=jb+4;j++)if(bumper.get(ie+1,j,k)>=0){jt=j;break;}if(jt!==null){for(let d=0;d<=2;d++)put(ie+1,jb-d,k,0x0e0f11);for(let j=jb+1;j<jt;j++)put(ie+1,j,k,0x0e0f11);}}}}   // the lip's nose only where the bumper face is within 40 mm above it (not under the corners' steep wrap)
  else{const foot=[];for(const [k,ie] of edge){if(Math.abs(k)>kMax-6)continue;for(let i=ie-14;i<=ie+7;i++)if(i/2>=archFront)foot.push([i,k]);}
    let jp=1e9;for(const [i,k] of foot){const jb=B(i,k);if(jb!==undefined)jp=Math.min(jp,jb-3);}
    for(const [i,k] of foot)put(i,jp,k,0x111214);
    for(const zc of [0,-25,25,-50,50])for(let dk=-1;dk<=1;dk++){const k=zc*2+dk,ie=edge.get(k);if(ie===undefined)continue;for(let i=ie-4;i<=ie-2;i++){const jb=B(i,k);if(jb===undefined)continue;for(let j=jp+1;j<jb;j++)put(i,j,k,0x2a2c30);}}
    for(const s of [-1,1]){const k=s*(kMax-6),ie=edge.get(k);if(ie===undefined)continue;for(let i=ie-4;i<=ie+7;i++)for(let j=jp+1;j<=jp+4;j++){const jb=B(i,k);if(jb!==undefined&&j>=jb)continue;put(i,j,k,0x0e0f11);}}}
  const C=bodyHi?cells.filter(c=>bodyHi.get(c[0],c[1],c[2])<0):cells;   // nothing inside the body (the splitter's end fences by the front arches)
  return C.length?cellsToGrid(C):new Grid(0,0,0,0,0,0);}
// GT wing: stands 420 mm either side of the centre on the hatch's rear frame (3990 mm), blade 160 mm over it, 260 mm chord, end plates; span 1500 mm
function z32GTWing(g,hatch){const cells=[],put=(i,j,k,c)=>cells.push([i,j,k,c]);
  const top=new Map();for(const [i,j,k] of hatch.list()){const key=i+','+k;if(!top.has(key)||j>top.get(key))top.set(key,j);}const T=(i,k)=>top.get(i+','+k);
  const iS=Math.round(g.wx(4000)*2),iL=Math.round(g.wx(3930)*2),iT=Math.round(g.wx(4190)*2),half=Math.round(g.u(750)*2);
  let yb=-1e9;for(const zz of [-42,42])for(let i=iS-2;i<=iS+2;i++)for(let dk=-1;dk<=1;dk++){const t=T(i,zz+dk);if(t!==undefined)yb=Math.max(yb,t);}
  const yw=yb+16;
  for(let k=-half;k<=half;k++)for(let i=iT;i<=iL;i++){const L=(iL-i)/(iL-iT),yc=yw+Math.round(L*2);put(i,yc,k,0x15161a);if(L<.15)put(i,yc+1,k,0x15161a);}
  for(const s of [-1,1])for(let i=iT-2;i<=iL+1;i++)for(let j=yw-5;j<=yw+7;j++)put(i,j,s*(half+1),0x0e0f11);
  for(const s of [-1,1])for(let i=iS-2;i<=iS+1;i++)for(let dk=-1;dk<=0;dk++){const k=s*42+dk,t=T(i,k);if(t===undefined)continue;for(let j=t+1;j<yw;j++)put(i,j,k,0x2a2c30);}
  return cellsToGrid(cells.filter(c=>hatch.get(c[0],c[1],c[2])<0));}

if(typeof module!=='undefined')module.exports={Z32D,z32AeroFront,z32GTWing,z32Bumper,z32BumperRelief,z32Lamps,z32Badges,z32Mirror,z32Wing,z32Flap};
