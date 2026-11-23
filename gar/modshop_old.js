/* ===== E30 MOD SHOP: catalog + fitment engine + readouts. Pure logic (no THREE), unit-tested in Node. =====
   Labels: V = VERIFIED, C = CALCULATED, E = ESTIMATED, D = DESIGN.  Dimensions in mm, mass in kg. */
const CAR={
  name:'BMW E30 325i coupe',
  baseMass:1275,            // V: 2811 lb (1275 kg) for the 325i 2-door, all years (bmwfaq.org, data from bmwcoches.com). Sources disagree: 1145 kg (auto-data.net, 1982-86 automatic), 1255 kg (carsales, convertible)
  stockOD:590,              // C: 195/60R14 = 14*25.4 + 2*0.60*195
  stockDragCdA:0.62*1.85,   // E
  hubFaceZ:738,             // C: hub face to the car's centreline = half the front track 1407 mm (auto-data.net, VERIFIED) + the stock ET35 (bimmertips: 14x6 ET35)
  pcd:'4x100',              // V: E30 4-lug
  stockET:35,
  archTop:656,              // C: arch cut-out radius 17.8 vox x 20 mm + centre height 15 vox
  archGapMin:31,            // C: tyre-to-arch gap (at rest) needed to clear the arch at full steering lock, plus archGapPerPoke mm per mm the tyre's outer face sits
  archGapPerPoke:0.33,      //    outboard of the stock tyre (801 mm). Fitted to the collision suite's full-lock test on 14x6 to 18x9 wheels at 0 to 45 mm drop; it never allows a drop the suite finds hitting (conservative)
  fenderOuter:821,          // C: body half-width at the fender lip height over the tyre (y 28 voxels) at the front axle
  strutInner:566,           // C: strut axis 23 voxels at the tower and 27 at the knuckle, spring outer radius 2.85 voxels (57 mm), plus 5 mm margin: limits the inner tyre face
  bay:{len:700,wid:600,hgt:600,pan:200},   // C: engine length incl. pulley, with the stock mechanical fan: 41 voxels from the firewall plane to the radiator (820 mm) minus 20 mm gap minus 90 mm fan stack. Width, height, pan: E
  tunnelWid:330,            // E: transmission tunnel width
  bellPatterns:['BMW-M20'], // stock bellhousing
  mountPatterns:['E30-M20','E30-S14','E30-M42'], // factory E30 engines: M20 (325i/325e), S14 (M3), M42 (318is); each bolts in with its own engine arms
  bumperTipMax:100,         // E: rear bumper cut-out width for tips
  airDamBottom:160,         // E: front valance bottom height at stock ride
  stockFrontWeight:0.53       // V: 53/47 front/rear (bmwfaq.org; strictlyeta.net)
};
const CATALOG={
 engine:[
  {id:'M20B25',name:'M20B25 2.5 L inline-6 (stock 325i)',len:700,wid:520,hgt:560,pan:150,mount:'E30-M20',bell:'BMW-M20',hp:170,red:6500,mass:135,cyl:6,layout:'I',turbo:0,mechFan:1,label:'V/E'},
  {id:'M20B27',name:'M20B27 2.7 L inline-6 "eta" (325e)',len:700,wid:520,hgt:560,pan:150,mount:'E30-M20',bell:'BMW-M20',hp:121,red:4800,mass:140,cyl:6,layout:'I',turbo:0,mechFan:1,label:'V/E'},
  {id:'M42B18',name:'M42B18 1.8 L 16-valve inline-4 (318is)',len:600,wid:520,hgt:600,pan:150,mount:'E30-M42',bell:'BMW-M42',hp:136,red:7000,mass:130,cyl:4,layout:'I',turbo:0,mechFan:1,label:'V/E'},
  {id:'S14B23',name:'S14B23 2.3 L inline-4 (E30 M3)',len:620,wid:500,hgt:560,pan:140,mount:'E30-S14',bell:'BMW-S14',hp:200,red:7250,mass:125,cyl:4,layout:'I',turbo:0,mechFan:1,label:'V/E'},
  {id:'M50B25',name:'M50B25 2.5 L 24-valve inline-6 (E36 325i)',len:720,wid:560,hgt:640,pan:170,mount:'BMW-M50',bell:'BMW-M20',hp:192,red:6500,mass:168,cyl:6,layout:'I',turbo:0,mechFan:0,label:'V/E'},
  {id:'S52B32',name:'S52B32 3.2 L inline-6 (US E36 M3)',len:730,wid:580,hgt:650,pan:180,mount:'BMW-M50',bell:'BMW-M20',hp:240,red:6500,mass:175,cyl:6,layout:'I',turbo:0,mechFan:0,label:'V/E'},
  {id:'S54B32',name:'S54B32 3.2 L inline-6 (E46 M3)',len:760,wid:600,hgt:680,pan:190,mount:'BMW-S54',bell:'BMW-S54',hp:343,red:8000,mass:205,cyl:6,layout:'I',turbo:0,mechFan:0,label:'V/E'},
  {id:'2JZGTE',name:'2JZ-GTE 3.0 L twin-turbo inline-6',len:780,wid:580,hgt:640,pan:190,mount:'TOYOTA-JZ',bell:'TOYOTA-JZ',hp:320,red:7000,mass:230,cyl:6,layout:'I',turbo:1,mechFan:0,label:'V/E'},
  {id:'LS3',name:'LS3 6.2 L V8',len:700,wid:660,hgt:640,pan:210,mount:'GM-LS',bell:'GM-LS',hp:430,red:6600,mass:200,cyl:8,layout:'V',turbo:0,mechFan:0,label:'V/E'}
 ],
 swapkit:[
  {id:'none',name:'No swap kit',accepts:[],adapts:[],tunnel:0,mass:0},
  {id:'kit-m5x',name:'M50 / S52 swap kit (E30 engine arms for the M50 block, rear-sump oil pan and pickup, electric fan (the longer engine leaves no room for the mechanical fan), wiring harness)',accepts:['BMW-M50'],adapts:[],tunnel:0,relief:{hgt:80,wid:0,pan:30,len:40},mass:10,label:'D'},
  {id:'kit-s54',name:'S54 swap kit (mounts, E30 oil pan, electric fan, 6-speed crossmember, tunnel clearance)',accepts:['BMW-S54'],adapts:[],tunnel:360,relief:{hgt:120,wid:20,pan:50,len:70},mass:16,label:'D'},
  {id:'kit-jz',name:'2JZ swap kit (low mounts, shallow sump, adapter plate, driveshaft, electric fan, slimline radiator moved forward 40 mm)',accepts:['TOYOTA-JZ'],adapts:[['TOYOTA-JZ','BMW-M20']],tunnel:360,relief:{hgt:60,wid:0,pan:40,len:90},mass:12,label:'D'},
  {id:'kit-ls',name:'LS swap kit (low mounts, front sump, notched strut towers, electric fan, battery and washer bottle relocated to the trunk, tunnel)',accepts:['GM-LS'],adapts:[['GM-LS','BMW-M20']],tunnel:420,relief:{hgt:60,wid:90,pan:60,len:50},mass:14,label:'D'}
 ],
 gearbox:[
  {id:'G260',name:'Getrag 260 5-speed (stock)',bell:'BMW-M20',ratios:[3.83,2.20,1.40,1.00,0.81],mass:55,tunnel:300,label:'V'},
  {id:'G240',name:'Getrag 240 5-speed (318is)',bell:'BMW-M42',ratios:[4.23,2.52,1.66,1.22,1.00],mass:50,tunnel:280,label:'E'},
  {id:'G265',name:'Getrag 265 5-speed (E30 M3)',bell:'BMW-S14',ratios:[3.72,2.40,1.77,1.26,1.00],mass:57,tunnel:300,label:'V/E'},
  {id:'G250',name:'Getrag 250 5-speed (E36 325i)',bell:'BMW-M20',ratios:[4.20,2.49,1.66,1.24,1.00],mass:55,tunnel:300,label:'E'},
  {id:'ZF320',name:'ZF S5D 320Z 5-speed (E36 M3)',bell:'BMW-M20',ratios:[4.20,2.49,1.66,1.24,1.00],mass:60,tunnel:320,label:'E'},
  {id:'G420',name:'Getrag 420G 6-speed (E46 M3)',bell:'BMW-S54',ratios:[4.23,2.53,1.67,1.23,1.00,0.83],mass:70,tunnel:340,label:'V/E'},
  {id:'V160',name:'Getrag V160 6-speed (Supra)',bell:'TOYOTA-JZ',ratios:[3.83,2.36,1.69,1.31,1.00,0.79],mass:68,tunnel:340,label:'V/E'},
  {id:'T56',name:'T56 6-speed (LS)',bell:'GM-LS',ratios:[2.66,1.78,1.30,1.00,0.74,0.50],mass:78,tunnel:400,label:'V/E'}
 ],
 diff:[
  {id:'open279',name:'Open diff 2.79 (325e)',ratio:2.79,lsd:0,mass:0},
  {id:'open373',name:'Open diff 3.73 (stock)',ratio:3.73,lsd:0,mass:0},
  {id:'lsd325',name:'Limited-slip 3.25',ratio:3.25,lsd:1,mass:3},
  {id:'lsd346',name:'Limited-slip 3.46',ratio:3.46,lsd:1,mass:3},
  {id:'lsd373',name:'Limited-slip 3.73',ratio:3.73,lsd:1,mass:3},
  {id:'lsd410',name:'Limited-slip 4.10',ratio:4.10,lsd:1,mass:3},
  {id:'lsd445',name:'Limited-slip 4.45',ratio:4.45,lsd:1,mass:3}
 ],
 exhaust:[
  {id:'stock',name:'Stock single-tip',tip:'single',tipW:60,mass:0,sound:0,hp:0,label:'D'},
  {id:'catback',name:'Cat-back, dual round tips',tip:'dual',tipW:70,mass:-6,sound:1,hp:4,label:'D/E'},
  {id:'quad',name:'Cat-back, quad tips (two each side)',tip:'quad',tipW:70,mass:-8,sound:2,hp:6,label:'D/E'},
  {id:'oval',name:'Titanium cat-back, oval tip',tip:'oval',tipW:115,mass:-14,sound:2,hp:7,label:'D/E'},
  {id:'race',name:'Straight-through race pipe, 100 mm tip',tip:'race',tipW:100,mass:-18,sound:3,hp:9,label:'D/E'}
 ],
 seats:[
  {id:'stock',name:'Stock sport seats',mass:15,label:'D'},
  {id:'comfort',name:'Base comfort seats',mass:17,label:'D'},
  {id:'sport',name:'Sport seats with thigh extension',mass:16,label:'D'},
  {id:'recliner',name:'Reclining bucket seats',mass:13,label:'D'},
  {id:'bucket',name:'Fixed-back bucket seats',mass:8,label:'D'}
 ],
 wheel:[ // style only; diameter, width and offset are free inputs under the fitment rules
  {id:'mesh',name:'Cross-spoke mesh'},{id:'star',name:'5-spoke'},{id:'dish',name:'Slotted dish'},{id:'bottlecap',name:'Bottlecap'},{id:'turbine',name:'Turbine'},{id:'split',name:'10-spoke split'}
 ],
 steering:[
  {id:'stock',name:'Stock 380 mm 3-spoke',dia:380,mass:1.2,label:'D'},
  {id:'mtech1',name:'M-Technic 370 mm 3-spoke',dia:370,mass:1.1,label:'D'},
  {id:'sport',name:'350 mm sport',dia:350,mass:1.0,label:'D'},
  {id:'deep',name:'350 mm deep-dish 6-bolt',dia:350,mass:1.0,label:'D'},
  {id:'small',name:'320 mm small wheel',dia:320,mass:0.9,label:'D'},
  {id:'quick',name:'330 mm flat-bottom with quick release',dia:330,mass:1.3,label:'D'}
 ],
 suspension:[
  {id:'stock',name:'Stock springs and dampers',minDrop:0,maxDrop:0,mass:0},
  {id:'hd',name:'Stock springs, heavy-duty dampers',minDrop:0,maxDrop:0,mass:1},
  {id:'sport',name:'Sport springs (-30 mm)',minDrop:30,maxDrop:30,mass:0},
  {id:'cup',name:'Cup springs and dampers (-35 mm)',minDrop:35,maxDrop:35,mass:1},
  {id:'coil',name:'Coilovers (adjustable)',minDrop:0,maxDrop:80,mass:4},
  {id:'air',name:'Air suspension (adjustable)',minDrop:0,maxDrop:100,mass:18}
 ],
 brakes:[
  {id:'stock',name:'Stock 260 mm, single-piston',rotor:260,cal:25,mass:0},
  {id:'m3',name:'E30 M3 280 mm, single-piston',rotor:280,cal:25,mass:2},
  {id:'e36',name:'E36 325i 286 mm, single-piston',rotor:286,cal:26,mass:2},
  {id:'bbk4',name:'Big brake kit, 330 mm, 4-piston',rotor:330,cal:30,mass:6},
  {id:'bbk6',name:'Track kit, 355 mm, 6-piston',rotor:355,cal:34,mass:9}
 ],
 aero:[
  {id:'none',name:'No aero'},
  {id:'islip',name:'Factory iS front lip and trunk lip spoiler',lip:15,mass:2},
  {id:'splitter',name:'Front splitter',lip:30,mass:3},
  {id:'ducktail',name:'Ducktail spoiler',mass:2},
  {id:'gtwing',name:'GT wing + splitter',lip:30,mass:9},
  {id:'wide',name:'Widebody flares (+30 mm per side)',flare:30,mass:8}
 ],
 frame:[
  {id:'stock',name:'Stock shell',mass:0},
  {id:'strutbar',name:'Front strut tower brace',mass:3},
  {id:'rollbar',name:'4-point bolt-in roll bar',mass:14,deletesRearSeat:1},
  {id:'cage',name:'6-point roll cage',mass:28,needsSeats:'bucket',deletesRearSeat:1},
  {id:'cage10',name:'10-point welded cage (A-pillar and roof bars)',mass:38,needsSeats:'bucket',deletesRearSeat:1}
 ]
};
const byId=(slot,id)=>CATALOG[slot].find(p=>p.id===id);

/* ---- tyre sizing: keep rolling diameter within 3% of stock ---- */
function tyreFor(rimIn,widthIn){
  const tw={6:195,7:205,8:225,9:245}[Math.round(widthIn)]||Math.round(25.4*widthIn*1.28);
  const rimMM=rimIn*25.4,side=(CAR.stockOD-rimMM)/2;
  let aspect=Math.round(side/tw*100/5)*5;aspect=Math.max(25,Math.min(65,aspect));
  const OD=rimMM+2*tw*aspect/100;
  return {tw,aspect,OD,sizeStr:tw+'/'+aspect+'R'+rimIn};
}

/* ---- the fitment engine: returns {ok, issues:[{sev:'BLOCK'|'WARN', slot, text}]} ---- */
function checkFit(cfg){
  const I=[];const add=(sev,slot,text)=>I.push({sev,slot,text});
  const eng=byId('engine',cfg.engine),gb=byId('gearbox',cfg.gearbox),kit=byId('swapkit',cfg.swapkit),ex=byId('exhaust',cfg.exhaust),
        br=byId('brakes',cfg.brakes),su=byId('suspension',cfg.suspension),ae=byId('aero',cfg.aero),fr=byId('frame',cfg.frame),se=byId('seats',cfg.seats);
  // engine mounts
  const mountOK=CAR.mountPatterns.includes(eng.mount)||kit.accepts.includes(eng.mount);
  if(!mountOK)add('BLOCK','engine',eng.name+' uses the '+eng.mount+' mount pattern. The E30 accepts '+CAR.mountPatterns.join(' / ')+'. Needs a swap kit.');
  // envelope (a swap kit with lowered mounts / notched towers / shallow sump relaxes it)
  const rel=kit.relief||{hgt:0,wid:0,pan:0,len:0},bay={len:CAR.bay.len+(rel.len||0),wid:CAR.bay.wid+rel.wid,hgt:CAR.bay.hgt+rel.hgt,pan:CAR.bay.pan+rel.pan};
  if(eng.len>bay.len)add('BLOCK','engine','Engine length '+eng.len+' mm is longer than the bay envelope ('+bay.len+' mm).');
  if(eng.wid>bay.wid)add('BLOCK','engine','Engine width '+eng.wid+' mm exceeds the bay width ('+bay.wid+' mm).');
  if(eng.hgt>bay.hgt)add('BLOCK','engine','Engine height '+eng.hgt+' mm would hit the hood (limit '+bay.hgt+' mm).');
  if(eng.pan>bay.pan)add('BLOCK','engine','Oil pan depth '+eng.pan+' mm hits the subframe (limit '+bay.pan+' mm).');
  // gearbox bellhousing
  const bellOK=gb.bell===eng.bell||kit.adapts.some(a=>a[0]===eng.bell&&gb.bell===a[1])||kit.adapts.some(a=>a[0]===gb.bell&&eng.bell===a[1]);
  if(!bellOK)add('BLOCK','gearbox',gb.name+' has a '+gb.bell+' bellhousing; the '+eng.id+' needs '+eng.bell+' or an adapter plate.');
  // tunnel
  const tunnelLimit=Math.max(CAR.tunnelWid,kit.tunnel||0);
  if(gb.tunnel>tunnelLimit)add('BLOCK','gearbox','Gearbox width '+gb.tunnel+' mm does not fit the transmission tunnel ('+tunnelLimit+' mm). A swap kit with tunnel clearance is needed.');
  // exhaust
  if(ex.tipW>CAR.bumperTipMax)add('WARN','exhaust','Tip is '+ex.tipW+' mm wide; the rear bumper cut-out is '+CAR.bumperTipMax+' mm. It will need trimming.');
  if(cfg.exhaust==='stock'&&cfg.engine!=='M20B25')add('WARN','exhaust','The stock single-tip system is built around the M20 header flange; a different engine needs a custom manifold.');
  // wheels
  const w=cfg.wheel,ty=tyreFor(w.dia,w.width);
  if(w.pcd!==CAR.pcd)add('BLOCK','wheel','Wheel bolt pattern '+w.pcd+' does not match the E30 hub ('+CAR.pcd+').');
  const zc=CAR.hubFaceZ-w.et,flare=(ae.flare||0);
  const outer=zc+ty.tw/2,inner=zc-ty.tw/2;
  const outerLimit=CAR.fenderOuter+flare-3;   // up to the fender lip less a 3 mm margin (DESIGN): the OEM 15x7 ET24 Style 10 with a 205 tyre sits 6 mm inside it
  if(outer>outerLimit)add('BLOCK','wheel','Outer tyre face reaches '+Math.round(outer)+' mm from centreline; the fender allows '+Math.round(outerLimit)+' mm. Raise the offset or add widebody flares.');
  if(inner<CAR.strutInner)add('BLOCK','wheel','Inner tyre face reaches '+Math.round(inner)+' mm and hits the strut at '+CAR.strutInner+' mm. Lower the offset.');
  if(Math.abs(ty.OD/CAR.stockOD-1)>0.03)add('WARN','wheel','Rolling diameter is '+Math.round((ty.OD/CAR.stockOD-1)*1000)/10+'% off stock, so the speedometer will be wrong.');
  // brakes vs wheel barrel
  const barrel=w.dia*12.7-12,need=br.rotor/2+br.cal+5;
  if(need>barrel)add('BLOCK','brakes',br.name+' needs about '+Math.round(need)+' mm of barrel radius; a '+w.dia+'-inch wheel has '+Math.round(barrel)+' mm. Fit a larger wheel.');
  // suspension drop vs arch
  const drop=cfg.drop||0;
  if(drop<su.minDrop||drop>su.maxDrop)add('BLOCK','suspension',su.name+' allows '+su.minDrop+' to '+su.maxDrop+' mm of drop; '+drop+' mm was requested.');
  const archGap=CAR.archTop-drop-ty.OD;
  const poke=Math.max(0,outer-(CAR.hubFaceZ-CAR.stockET+97.5)),gapNeed=Math.round(CAR.archGapMin+CAR.archGapPerPoke*poke);
  if(archGap<gapNeed)add('BLOCK','suspension','Only '+Math.round(archGap)+' mm between tyre and arch at '+drop+' mm drop; the front tyre hits the arch at full steering lock (this wheel needs '+gapNeed+' mm).');
  // ground clearance with aero
  const gc=CAR.airDamBottom-drop-(ae.lip||0);
  if(gc<60)add('WARN','aero','Front lip is '+Math.round(gc)+' mm off the ground at this ride height and will scrape.');
  // cage rules
  if(fr.needsSeats&&cfg.seats!=='bucket')add('BLOCK','frame','The '+fr.name.toLowerCase()+' needs fixed-back bucket seats (the cage tubes run where a reclining seat back swings).');
  if(cfg.exhaust==='race')add('WARN','exhaust','A straight-through pipe is louder than most track-day noise limits.');
  return {ok:!I.some(i=>i.sev==='BLOCK'),issues:I,tyre:ty,zc,outer,inner,archGap,gapNeed,gc};
}

/* ---- readouts (CALCULATED from labelled inputs; estimates marked) ---- */
function readout(cfg){
  const eng=byId('engine',cfg.engine),gb=byId('gearbox',cfg.gearbox),df=byId('diff',cfg.diff),ex=byId('exhaust',cfg.exhaust),
        se=byId('seats',cfg.seats),su=byId('suspension',cfg.suspension),br=byId('brakes',cfg.brakes),ae=byId('aero',cfg.aero),fr=byId('frame',cfg.frame),kit=byId('swapkit',cfg.swapkit),
        sw=byId('steering',cfg.steering);
  const ty=tyreFor(cfg.wheel.dia,cfg.wheel.width);
  const mass=CAR.baseMass+(eng.mass-135)+(gb.mass-55)+df.mass+ex.mass+(se.mass-15)*2+su.mass+br.mass*2+(ae.mass||0)+fr.mass+kit.mass+(sw.mass-1.2)
              -(fr.deletesRearSeat?15:0);
  const hp=eng.hp+ex.hp;
  const rEff=ty.OD/2000;                                        // m
  const vmaxGear=gb.ratios.map(g=>eng.red/60*2*Math.PI*rEff/(g*df.ratio)*3.6);   // km/h at redline per gear
  const rho=1.2,eta=.88,CdA=CAR.stockDragCdA*(cfg.aero==='gtwing'?1.12:cfg.aero==='ducktail'?1.02:1),Crr=.012;
  let vd=0;for(let v=1;v<120;v+=.05){const P=0.5*rho*CdA*v*v*v+Crr*mass*9.81*v;if(P>hp*745.7*eta){vd=v;break;}}
  const top=Math.min(vmaxGear[vmaxGear.length-1],vd*3.6);
  // front weight: engine ahead of the axle line moves weight forward (E: 0.6 of engine delta acts on the front axle)
  const fw=(CAR.stockFrontWeight*CAR.baseMass+0.6*(eng.mass-135)+0.15*(gb.mass-55))/mass;
  return {mass:Math.round(mass),hp,pw:hp/mass*1000,vmaxGear,top,drag:vd*3.6,speedoErr:(ty.OD/CAR.stockOD-1)*100,frontPct:fw*100,OD:ty.OD};
}
function defaultCfg(){return {engine:'M20B25',swapkit:'none',gearbox:'G260',diff:'open373',exhaust:'stock',seats:'stock',steering:'stock',suspension:'stock',brakes:'stock',aero:'none',frame:'stock',
  wheel:{style:'bottlecap',dia:14,width:6,et:35,pcd:'4x100'},drop:0};}
if(typeof module!=='undefined')module.exports={CAR,CATALOG,byId,tyreFor,checkFit,readout,defaultCfg};
