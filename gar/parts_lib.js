/* ===== PARTS LIBRARY: real parts with real attributes. A part belongs to no car; fitment is computed against a shell (fit.js).
   Labels: V = VERIFIED against a source, C = CALCULATED, E = ESTIMATED, D = DESIGN. Dimensions mm, mass kg, torque Nm, power hp.
   engine.orient: 'long' (crank along the car) or 'trans' (across it). engine.mount / bell: the engine's own mount-pattern and bellhousing families (adapters bridge families).
   gearbox.kind: 'trans' (longitudinal transmission + driveshaft + rear axle), 'transaxle' (gearbox with the final drive inside, front or rear); gearbox.drives = layouts it can serve; gearbox.tq = rated input torque (E). ===== */
const LIB={
 engine:[
  {id:'M20B25',safeBoostPsi:12,   // TURBO-02 [E]: the 8.8:1 stock internals (e30zone.net turbo 325 thread: "8.8 compression is fine for whatever you need on stock internals", "5-12 psi" a fun-car setup without stronger pistons); the M20 kit's listing runs a stock motor at 8 psi (mmispeedshop.com)
   fam:'M20',name:'M20B25 2.5 L inline-6 (stock 325i)',donor:'BMW E30 325i',len:700,wid:520,hgt:560,pan:150,mount:'E30-M20',bell:'BMW-M20',orient:'long',hp:170,hpRpm:5800,tq:226,tqRpm:4000,red:6500,mass:135,cyl:6,layout:'I',turbo:0,mechFan:1,label:'V/E'},
  {id:'M20B27',name:'M20B27 2.7 L inline-6 "eta" (325e)',donor:'BMW E30 325e',len:700,wid:520,hgt:560,pan:150,mount:'E30-M20',bell:'BMW-M20',orient:'long',hp:121,hpRpm:4250,tq:230,tqRpm:3250,red:4800,mass:140,cyl:6,layout:'I',turbo:0,mechFan:1,label:'V/E'},
  {id:'M42B18',name:'M42B18 1.8 L 16-valve inline-4 (318is)',donor:'BMW E30 318is',len:600,wid:520,hgt:600,pan:150,mount:'E30-M42',bell:'BMW-M42',orient:'long',hp:136,hpRpm:6000,tq:172,tqRpm:4600,red:7000,mass:130,cyl:4,layout:'I',turbo:0,mechFan:1,label:'V/E'},
  {id:'S14B23',name:'S14B23 2.3 L inline-4 (E30 M3)',donor:'BMW E30 M3',len:620,wid:500,hgt:560,pan:140,mount:'E30-S14',bell:'BMW-S14',orient:'long',hp:200,hpRpm:6750,tq:240,tqRpm:4750,red:7250,mass:125,cyl:4,layout:'I',turbo:0,mechFan:1,label:'V/E'},
  {id:'M50B25',name:'M50B25 2.5 L 24-valve inline-6 (E36 325i)',donor:'BMW E36 325i',len:720,wid:560,hgt:640,pan:170,mount:'BMW-M50',bell:'BMW-M20',orient:'long',hp:192,hpRpm:5900,tq:245,tqRpm:4700,red:6500,mass:168,cyl:6,layout:'I',turbo:0,mechFan:0,label:'V/E'},
  {id:'S52B32',name:'S52B32 3.2 L inline-6 (US E36 M3)',donor:'BMW E36 M3 (US)',len:730,wid:580,hgt:650,pan:180,mount:'BMW-M50',bell:'BMW-M20',orient:'long',hp:240,hpRpm:6000,tq:320,tqRpm:3800,red:6500,mass:175,cyl:6,layout:'I',turbo:0,mechFan:0,label:'V/E'},
  {id:'S54B32',name:'S54B32 3.2 L inline-6 (E46 M3)',donor:'BMW E46 M3',len:760,wid:600,hgt:680,pan:190,mount:'BMW-S54',bell:'BMW-S54',orient:'long',hp:343,hpRpm:7900,tq:365,tqRpm:4900,red:8000,mass:205,cyl:6,layout:'I',turbo:0,mechFan:0,label:'V/E'},
  {id:'2JZGTE',name:'2JZ-GTE 3.0 L twin-turbo inline-6',donor:'Toyota Supra Mk4',len:780,wid:580,hgt:640,pan:190,mount:'TOYOTA-JZ',bell:'TOYOTA-JZ',orient:'long',hp:320,hpRpm:5600,tq:440,tqRpm:4000,red:7000,mass:230,cyl:6,layout:'I',turbo:1,mechFan:0,label:'V/E'},
  {id:'LS3',name:'LS3 6.2 L V8',donor:'Chevrolet Corvette C6',len:700,wid:660,hgt:640,pan:210,mount:'GM-LS',bell:'GM-LS',orient:'long',hp:430,hpRpm:5900,tq:575,tqRpm:4600,red:6600,mass:200,cyl:8,layout:'V',turbo:0,mechFan:0,label:'V/E'}
 ],
 swapkit:[   // the E30's own conversion packages; any other shell gets the generic conversion options in fit.js
  {id:'none',name:'No swap kit',accepts:[],adapts:[],tunnel:0,mass:0},
  {id:'kit-m5x',name:'M50 / S52 swap kit (E30 engine arms for the M50 block, rear-sump oil pan and pickup, electric fan (the longer engine leaves no room for the mechanical fan), wiring harness)',accepts:['BMW-M50'],adapts:[],tunnel:0,relief:{hgt:80,wid:0,pan:30,len:40},mass:10,label:'D',shells:['e30']},
  {id:'kit-s54',name:'S54 swap kit (mounts, E30 oil pan, electric fan, 6-speed crossmember, tunnel clearance)',accepts:['BMW-S54'],adapts:[],tunnel:360,relief:{hgt:120,wid:20,pan:50,len:70},mass:16,label:'D',shells:['e30']},
  {id:'kit-jz',name:'2JZ swap kit (low mounts, shallow sump, adapter plate, driveshaft, electric fan, slimline radiator moved forward 40 mm)',accepts:['TOYOTA-JZ'],adapts:[['TOYOTA-JZ','BMW-M20']],tunnel:360,relief:{hgt:60,wid:0,pan:40,len:90},mass:12,label:'D',shells:['e30']},
  {id:'kit-ls',name:'LS swap kit (low mounts, front sump, notched strut towers, electric fan, battery and washer bottle relocated to the trunk, short-body brake master cylinder for valve-cover clearance, tunnel)',accepts:['GM-LS'],adapts:[['GM-LS','BMW-M20']],tunnel:420,relief:{hgt:60,wid:90,pan:60,len:50},mass:14,label:'D',shells:['e30']}
 ],
 gearbox:[
  {id:'G260',name:'Getrag 260 5-speed (stock)',donor:'BMW E30 325i',kind:'trans',drives:['FR'],bell:'BMW-M20',ratios:[3.83,2.20,1.40,1.00,0.81],mass:55,tunnel:300,tq:300,label:'V'},
  {id:'G240',name:'Getrag 240 5-speed (318is)',donor:'BMW E30 318is',kind:'trans',drives:['FR'],bell:'BMW-M42',ratios:[4.23,2.52,1.66,1.22,1.00],mass:50,tunnel:280,tq:240,label:'E'},
  {id:'G265',name:'Getrag 265 5-speed (E30 M3)',donor:'BMW E30 M3',kind:'trans',drives:['FR'],bell:'BMW-S14',ratios:[3.72,2.40,1.77,1.26,1.00],mass:57,tunnel:300,tq:300,label:'V/E'},
  {id:'G250',name:'Getrag 250 5-speed (E36 325i)',donor:'BMW E36 325i',kind:'trans',drives:['FR'],bell:'BMW-M20',ratios:[4.20,2.49,1.66,1.24,1.00],mass:55,tunnel:300,tq:300,label:'E'},
  {id:'ZF320',name:'ZF S5D 320Z 5-speed (E36 M3)',donor:'BMW E36 M3',kind:'trans',drives:['FR'],bell:'BMW-M20',ratios:[4.20,2.49,1.66,1.24,1.00],mass:60,tunnel:320,tq:380,label:'E'},
  {id:'G420',name:'Getrag 420G 6-speed (E46 M3)',donor:'BMW E46 M3',kind:'trans',drives:['FR'],bell:'BMW-S54',ratios:[4.23,2.53,1.67,1.23,1.00,0.83],mass:70,tunnel:340,tq:420,label:'V/E'},
  {id:'V160',name:'Getrag V160 6-speed (Supra)',donor:'Toyota Supra Mk4',kind:'trans',drives:['FR'],bell:'TOYOTA-JZ',ratios:[3.83,2.36,1.69,1.31,1.00,0.79],mass:68,tunnel:340,tq:600,label:'V/E'},
  {id:'T56',name:'T56 6-speed (LS)',donor:'Chevrolet Camaro / Corvette',kind:'trans',drives:['FR'],bell:'GM-LS',ratios:[2.66,1.78,1.30,1.00,0.74,0.50],mass:78,tunnel:400,tq:650,label:'V/E'}
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
  {id:'race',name:'Straight-through race pipe, 100 mm tip',tip:'race',tipW:100,mass:-18,sound:3,hp:9,label:'D/E'},
  // Japanese kaido / shakotan tails on the stock silencer (DESIGN shapes after period street cars, no one maker's part; mass and sound E)
  {id:'takeyari2',name:'Takeyari twin spears (kaido style, red)',tip:'takeyari2',tipW:0,mass:4,sound:2,hp:0,label:'D/E',jdm:1},
  {id:'takeyari1',name:'Takeyari single spear (red)',tip:'takeyari1',tipW:0,mass:2,sound:2,hp:0,label:'D/E',jdm:1},
  {id:'takeyari3',name:'Takeyari triple spears (red)',tip:'takeyari3',tipW:0,mass:6,sound:3,hp:0,label:'D/E',jdm:1},
  {id:'takeyari4',name:'Takeyari quad spears, bosozoku (red)',tip:'takeyari4',tipW:0,mass:8,sound:3,hp:0,label:'D/E',jdm:1},
  {id:'naname2',name:'Naname-dashi twin pipes raked back at 35 degrees',tip:'naname2',tipW:0,mass:3,sound:2,hp:0,label:'D/E',jdm:1},
  {id:'turndown',name:'Kanjo turn-down straight pipe',tip:'turndown',tipW:0,mass:-3,sound:3,hp:2,label:'D/E',jdm:1},
  {id:'canon',name:'Cannon tip, 120 mm N1 street style',tip:'canon',tipW:130,mass:2,sound:2,hp:1,label:'D/E',jdm:1},
  {id:'side',name:'Yoko-dashi side exit ahead of the rear wheel',tip:'side',tipW:0,mass:-1,sound:2,hp:1,label:'D/E',jdm:1},
  {id:'rappa',name:'Rappa trumpet tip (flared 120 mm)',tip:'rappa',tipW:120,mass:1,sound:2,hp:0,label:'D/E',jdm:1},
  {id:'slash',name:'Shakotan slash-cut straight pipe, 70 mm',tip:'slash',tipW:70,mass:-2,sound:2,hp:1,label:'D/E',jdm:1}
 ],
 turbo:[   // SPEC-TURBO §1/§2: turbocharger kits + stock-turbo records. 'none' FIRST (§1.1/§4 item 1).
  // [O] = OPEN, never used as a number. [F] frozen (sourced), [E] estimate (labelled), [D] design decision, [C] computed.
  {id:'none',name:'No turbo',family:null,stock:false,stockFor:null,pn:null,chra:null,compIn:null,compEx:null,compTrim:null,compAR:null,turbIn:null,turbEx:null,turbTrim:null,turbAR:null,bearing:null,cooling:null,wg:null,flangeIn:null,flangeOut:null,mass:0,envLen:null,envDia:null,envHgt:null,spoolStart:null,fullBoost:null,tau:null,boostPsi:null,icEff:null,flowLbMin:null,hpClass:null,dispL:null,bundle:null,label:null},   // §1.1: every other field null (never read — effEngine/massOf/nameOf treat 'none' as no turbo)
  // v20 (owner, 2026-11-05: 'you didn't add the turbos'): the first fittable kit, for the AE86's 4A-GE. Sources: hachiroku.com.au AE86 tuning guide (turbo 4A-G):
  // the T25 is the most common turbo on the 4A-G, stock rods and pistons are kept below 15 psi, a factory GZE runs 6-8 psi, a VF34 on a 4A-G starts making boost
  // ~2000 rpm with full boost before 3000. turbozentrum.de GT2560R listing: compressor 46.5/60.1 mm 0.60 A/R, turbine 53.0 mm 0.64 A/R, T25 flange, internal
  // wastegate, item weight 10 kg (shipping weight, so an upper bound for the turbo alone). boostPsi 7 [D: the GZE's own boost, under both limits];
  // spool 2500/3500 [E: a T25 on a 1.6 is slower than the guide's VF34]; no intercooler at 7 psi (icEff 0: the bay has no free route for front-mount pipes
  // past the radiator support — probe A* on 20 mm cells); kit mass 14 kg [E: turbo <=10 + manifold, downpipe, pipe];
  // envelope [E] from the drawn unit. Fits only the AE86 (its bay was measured for it: CAR.freeBay).
  {id:'4age-t25-kit',name:'4A-GE turbo kit — T25-class ball-bearing turbo, 7 psi, blow-through, no intercooler',family:'single',stock:false,stockFor:null,pn:null,chra:null,compIn:46.5,compEx:60.1,compTrim:60,compAR:0.60,turbIn:53.0,turbEx:null,turbTrim:62,turbAR:0.64,bearing:'ball',cooling:'oil+water',wg:{type:'internal',actuatorPsi:7},flangeIn:'T25',flangeOut:null,mass:14,envLen:220,envDia:150,envHgt:200,spoolStart:2500,fullBoost:3500,tau:0.7,boostPsi:7,icEff:0,flowLbMin:null,hpClass:[150,220],dispL:[1.5,1.8],shells:['ae86'],bundle:{intercooler:null,piping:true,downpipe:true,manifold:'included',bov:{type:'recirc',holdPsi:null},intake:{pipe:true,futureSlot:false},oilWater:true},label:'E'},
  // v20b the same kit with a front-mount intercooler: icEff 0.70 [D]; +5 kg [E] core, end tanks, two charge pipes; the pipes pass through holes cut in the
  // radiator support's side panels (how AE86 front-mount kits are fitted)
  {id:'4age-t25-fmic',name:'4A-GE turbo kit — T25-class, 7 psi, front-mount intercooler (pipes through the radiator support)',family:'single',stock:false,stockFor:null,pn:null,chra:null,compIn:46.5,compEx:60.1,compTrim:60,compAR:0.60,turbIn:53.0,turbEx:null,turbTrim:62,turbAR:0.64,bearing:'ball',cooling:'oil+water',wg:{type:'internal',actuatorPsi:7},flangeIn:'T25',flangeOut:null,mass:19,envLen:220,envDia:150,envHgt:200,spoolStart:2500,fullBoost:3500,tau:0.7,boostPsi:7,icEff:0.70,flowLbMin:null,hpClass:[150,220],dispL:[1.5,1.8],shells:['ae86'],bundle:{intercooler:'front',piping:true,downpipe:true,manifold:'included',bov:{type:'recirc',holdPsi:null},intake:{pipe:true,futureSlot:false},oilWater:true},label:'E'},
  // TURBO-02 (owner, Nov 14): the E30's turbo kit, the M20 bolt-on sold for 84-91 E30s. Sources: mmispeedshop.com ("BMW E30 84-91 Turbo Kit T3 325
  // 3-Series 6 cyl M20": T3/T4 hybrid, .50 A/R compressor housing, .57 trim wheel, .63 A/R turbine housing, wet-float bearings, 321 stainless manifold,
  // internal wastegate, aluminium front-mount intercooler, 2.5" piping, BOV, fuel pressure regulator; "about a 100 hp gain at 8 PSI" on a stock motor,
  // more on a built one); cxracing.com (the same manifold, downpipe and intercooler kits listed "with stock M20"). boostPsi 8 [F: the listing's
  // stock-motor setting]; the M20B25's 8.8:1 stock internals take it (e30zone.net: "5-12 psi" a "fun car setup that doesn't need stronger pistons";
  // 240-280 hp estimated at 8 psi). spoolStart 2500 / fullBoost 3500 [E]: a .63 A/R T3 on a 2.5 L six. icEff 0.70 [D] (as the AE86's front-mount).
  // mass 24 [E]: turbo about 10 (the GT2560R's 10 kg shipping weight is the nearest sourced figure), manifold, intercooler, pipes. Envelope [E] the
  // drawn unit (as the AE86 kit). The listing's fuel regulator is in the kit; the game has no fuel or ECU slot yet.
  {id:'m20-t3t4-kit',name:'M20 turbo kit — T3/T4 hybrid (.57 trim, .63 A/R), stainless manifold, internal wastegate, front-mount intercooler, 8 psi',family:'single',stock:false,stockFor:null,pn:null,chra:null,compIn:null,compEx:null,compTrim:57,compAR:0.50,turbIn:null,turbEx:null,turbTrim:null,turbAR:0.63,bearing:'journal',cooling:'oil',wg:{type:'internal',actuatorPsi:null},flangeIn:'T3',flangeOut:null,mass:24,envLen:220,envDia:150,envHgt:200,spoolStart:2500,fullBoost:3500,tau:0.8,boostPsi:8,icEff:0.70,flowLbMin:null,hpClass:[450,495],dispL:null,shells:['e30','e30t'],bundle:{intercooler:'front',piping:true,downpipe:true,manifold:'included',bov:{type:'atmo',holdPsi:null},intake:{pipe:true,futureSlot:false},oilWater:true},label:'E'},
  // TURBO-02 (owner, Nov 14): the Z32's twin-turbo upgrade, Garrett GT2860RS twins in the factory turbos' places. Source: GCG (gcg.com.au, "XTR Turbo
  // Charger Kit GT2860RS, Nissan 300ZX TT (Z31/Z32, VG30DETT)", code 1000-00729: 2 x Garrett GT2860RS, internally wastegated, 0.64 A/R turbines, GCG /
  // Turbosmart actuators, turbine outlet flanges for the Nissan 5-bolt pattern, oil and water fittings, 51 mm compressor elbows; the downpipes need custom
  // work; the "375hp" version assumes intercooler, fuel, exhaust and engine work). The GT2860RS itself: Garrett catalogue (see gt2860rs: 47.2 / 60.0 mm
  // compressor, 53.8 mm turbine, 250-320 hp class each). boostPsi 14 [D]: the stock engine's safe maximum on stock injectors with a remap
  // (300zx-owners.club), the VG30DETT's safeBoostPsi. spoolStart 2200 / fullBoost 3800 [E]: bigger than the stock T25s (full boost about 3600, the
  // torque peak), on 1.5 L a bank. icEff 0.60 [D]: the stock side-mounts kept. mass 4 [E]: two larger turbos over the stock pair (the stock record's
  // mass is open, so this is the difference).
  {id:'z32-gt2860rs-twins',name:'Garrett GT2860RS twins (GCG XTR kit) in the factory turbos\' places, 14 psi',family:'parallel-twin',stock:false,stockFor:null,inPlaceOf:'stock-t25-vg30dett',inPlaceKit:'turbine outlet flanges for the 5-bolt pattern, oil and water fittings, compressor elbows; custom downpipes',pn:null,chra:null,compIn:47.2,compEx:60.0,compTrim:62,compAR:0.60,turbIn:53.8,turbEx:null,turbTrim:76,turbAR:0.64,bearing:'ball',cooling:'oil+water',wg:{type:'internal',actuatorPsi:null},flangeIn:'T25',flangeOut:'Nissan 5-bolt',mass:4,envLen:null,envDia:null,envHgt:null,spoolStart:2200,fullBoost:3800,tau:0.6,boostPsi:14,icEff:0.60,flowLbMin:null,hpClass:[500,640],dispL:null,shells:['z32'],bundle:{intercooler:'stock',piping:false,downpipe:false,manifold:'stock',bov:{type:'recirc',holdPsi:null},intake:{pipe:false,futureSlot:true},oilWater:true},warn:'The GT2860RS twins\' turbine outlets need custom downpipes (GCG: "custom fabrication of the exhaust system"), and 14 psi needs a remapped ECU.',label:'E'},
  {id:'gt2560r',name:'Garrett GT2560R',family:'single',stock:false,stockFor:null,pn:'466541-1',chra:'446179-12',compIn:46.5,compEx:60.0,compTrim:60,compAR:0.60,turbIn:53.0,turbEx:null,turbTrim:62,turbAR:0.64,bearing:'ball',cooling:'oil+water',wg:{type:'internal',actuatorPsi:7},flangeIn:'T25',flangeOut:null,mass:null,envLen:null,envDia:null,envHgt:null,spoolStart:null,fullBoost:3000,tau:0.8,boostPsi:7,icEff:0.75,flowLbMin:null,hpClass:[200,280],dispL:[1.6,2.5],bundle:{intercooler:'front',piping:true,downpipe:true,manifold:'included',bov:{type:'recirc',holdPsi:null},intake:{pipe:true,futureSlot:true},oilWater:true},label:'D'},   // §2.1 [F] catalog 2006 (C-1 ball bearing, C-5 hp 200-280); compTrim 60 [C] (46.5/60)^2; turbEx [O] catalog gives inducer 53.0 + trim 62 only, so turbTrim 62 is the [F] catalog value, not re-derivable from stored diameters; wg actuator 6-7 psi [F ATP], 7 used = boostPsi [E]; fullBoost ~3000 [E] DSM owner report — OPTIMISTIC (MIN-2: borrows the smaller stock T25 spool); spoolStart/mass/env [O] OPEN-19/OPEN-6; bov holdPsi [O] OPEN-7; icEff 0.75 [D] bundled
  {id:'gt2860rs',name:'Garrett GT2860RS',family:'single',stock:false,stockFor:null,pn:'739548-1',chra:'446179-66',compIn:47.2,compEx:60.0,compTrim:62,compAR:0.60,turbIn:53.8,turbEx:null,turbTrim:76,turbAR:[0.86,0.64],bearing:'ball',cooling:'oil+water',wg:{type:'internal',actuatorPsi:null},flangeIn:'T25',flangeOut:null,mass:null,envLen:null,envDia:null,envHgt:null,spoolStart:null,fullBoost:null,tau:0.8,boostPsi:null,icEff:0.75,flowLbMin:null,hpClass:[250,320],dispL:[1.8,2.7],bundle:{intercooler:'front',piping:true,downpipe:true,manifold:'included',bov:{type:'recirc',holdPsi:null},intake:{pipe:true,futureSlot:true},oilWater:true},label:'D'},   // §2.2 [F] catalog 2006 (C-2 turbine 53.8/compEx 60.0, C-3 A/R 0.86 std + 0.64 via housing 430609-230, C-4 hp 250-320); compTrim 62 [C] (47.2/60)^2; turbEx [O], turbTrim 76 [F] catalog (not re-derivable — turbEx [O]); flowLbMin 35 SECONDARY, not frozen; fullBoost [O] (MIN-1: FP2544 anecdote withdrawn); boostPsi/spoolStart/mass/env [O] OPEN-15/OPEN-19/OPEN-6; turbAR ships 0.86 (first in array)
  {id:'gt3582r',name:'Garrett GT3582R',family:'single',stock:false,stockFor:null,pn:'714568-1',chra:'706451-5',compIn:61.4,compEx:82.0,compTrim:56,compAR:0.70,turbIn:68.0,turbEx:62.3,turbTrim:84,turbAR:[0.63,0.82,1.06],bearing:'ball',cooling:'oil+water',wg:null,flangeIn:'T3',flangeOut:'GT 4-bolt',mass:null,envLen:null,envDia:null,envHgt:null,spoolStart:null,fullBoost:3750,tau:0.8,boostPsi:null,icEff:0.75,flowLbMin:null,hpClass:[400,600],dispL:null,bundle:{intercooler:'front',piping:true,downpipe:true,manifold:'included',bov:{type:'recirc',holdPsi:null},intake:{pipe:true,futureSlot:true},oilWater:true},label:'D'},   // §2.3 [F] catalog (turbEx 62.3 [E] ATP, C-6; compTrim 56 [C] (61.4/82)^2; turbTrim 84 [C] (62.3/68)^2); pn 714568-1/-2/-3, -1 shipped; turbAR ships 0.63 [D] fast-spool housing; wg [O] internal-or-external by housing choice; fullBoost ~3750 [E] AGP vendor (0.63 A/R on 2.0 L); boostPsi/spoolStart/mass/env [O] OPEN-15/OPEN-19/OPEN-6; dispL [O]
  {id:'rb26-twin-t28',name:'RB26DETT twin T28',family:'parallel-twin',stock:false,stockFor:null,pn:null,chra:null,compIn:null,compEx:null,compTrim:null,compAR:null,turbIn:null,turbEx:null,turbTrim:null,turbAR:null,bearing:null,cooling:null,wg:null,flangeIn:null,flangeOut:null,mass:null,envLen:null,envDia:null,envHgt:null,spoolStart:null,fullBoost:null,tau:0.6,boostPsi:null,icEff:0.75,flowLbMin:null,hpClass:null,dispL:null,bundle:{intercooler:'front',piping:true,downpipe:true,manifold:'included',bov:{type:'recirc',holdPsi:null},intake:{pipe:true,futureSlot:true},oilWater:true},label:'D'},   // §2.4 SPEC-OPEN: per-turbo numbers SECONDARY (Zilvia: ~150 kW, max 1.3 bar, exh A/R 0.48, comp A/R 0.60, 4-bolt flange; WG limit 10 psi, restrictor under 14 psi) — NOT frozen, all size fields null [O] OPEN-4; tau 0.6 [D] twin; icEff 0.75 [D] bundled
  {id:'vg30-twin-t25',name:'VG30DETT twin T25',family:'parallel-twin',stock:false,stockFor:null,pn:null,chra:null,compIn:null,compEx:null,compTrim:null,compAR:null,turbIn:null,turbEx:null,turbTrim:null,turbAR:null,bearing:null,cooling:null,wg:null,flangeIn:null,flangeOut:null,mass:null,envLen:null,envDia:null,envHgt:null,spoolStart:null,fullBoost:null,tau:0.6,boostPsi:null,icEff:0.75,flowLbMin:null,hpClass:null,dispL:null,bundle:{intercooler:'front',piping:true,downpipe:true,manifold:'included',bov:{type:'recirc',holdPsi:null},intake:{pipe:true,futureSlot:true},oilWater:true},label:'D'},   // §2.5 SPEC-OPEN: dual Garrett T25, one per bank, SECONDARY (Zilvia) — all size/boost fields null [O] OPEN-3; NEVER borrow Eclipse T25 numbers; tau 0.6 [D] twin; icEff 0.75 [D] bundled
  {id:'stock-t25-4g63t',name:'Stock T25 (4G63T)',family:'single',stock:true,stockFor:'4G63T',pn:null,chra:null,compIn:null,compEx:null,compTrim:null,compAR:null,turbIn:null,turbEx:null,turbTrim:null,turbAR:null,bearing:'journal',cooling:null,wg:{type:'internal',actuatorPsi:12},flangeIn:'T25',flangeOut:null,mass:null,envLen:null,envDia:null,envHgt:null,spoolStart:null,fullBoost:3000,tau:0.8,boostPsi:12,icEff:0.60,flowLbMin:null,hpClass:null,dispL:null,bundle:{intercooler:'side',piping:true,downpipe:true,manifold:'included',bov:{type:'recirc',holdPsi:12},intake:{pipe:true,futureSlot:true},oilWater:true},label:'D'},   // §2.7/§3.5 Eclipse stock: boostPsi 12 [F] (Hagerty/DSM); fullBoost ~3000 [E] owner report; spoolStart [O] OPEN-19/OPEN-16; icEff [O] OPEN-20 (stock SMIC, NEVER the bundled 0.75 — MAJOR-6); bearing journal (C-1: the old T25 is journal); wg actuatorPsi 12 [E] (stock boost is the actuator base); bov holdPsi 12 [E] (leak point 12-13 psi, scout §2.1); pn [O] OPEN-13 (SECONDARY flag stays); record INCOMPLETE → LEGACY   // TURBO-02 (Nov 14): icEff 0.60 [D] — the stock side-mount's effectiveness is not published (DSM owners log only the air after it: just over 200 F at 18-20 psi on a 1G, dsmtuners.com); 0.60 is used for this record AND the in-place upgrades that keep the side-mount, so their gain comes from boost alone. Nothing else reads it: the stock car still runs the LEGACY curve (spoolStart open)
  // TURBO-02 (owner, Nov 14: "add some turbos. we have 0 turbos"): the Eclipse's classic bolt-on, the Mitsubishi TD05H "Evo III big 16G", in the factory
  // T25's place on the factory manifold. Sources: extremepsi.com (genuine MHI 49178-01470, rated 380 hp, 550 CFM; "95-99 Eclipse Turbo models require a
  // 2G install kit": oil feed and return lines, J pipe, turbo-to-manifold and O2-housing gaskets); Road Race Engineering (the 2G 16G install kit: the
  // Garrett-era cars' oil, water and intercooler-pipe routing differs, so the kit brings 2 1/4" piping, braided oil feed, drain, water lines and a 7 cm
  // turbo-to-manifold gasket); galantvr4.org OEM turbo list (TD05H-16G: 505 CFM at 15 psi, 68 mm compressor; the stock 2G T25 tops out at 235-250 hp);
  // dsmtuners.com (2G 16G upgrade: about 20-30 hp at the wheels on an otherwise stock car; it "spools slower than the T25 but the difference is small";
  // on the stock fuel system keep boost low: past 12 psi is a risk, and the 450 cc injectors are the limit).
  // boostPsi 14 [D]: under the 450 cc injectors' 14-15 psi (fit.js's own rule) — the game has no fuel slot yet, so the kit is set where the stock fuel
  // holds. fullBoost 3500 / spoolStart 2500 [E]: a little later than the T25's ~3000 (the forum's "slower, but small"). icEff 0.60 [D]: the factory
  // side-mount it keeps (see the stock record). mass 3 [E]: the larger TD05H over the T25 it replaces (the stock record's mass is open, so this is the
  // difference). The density model raises power with boost only; a bigger turbo's real gain is mostly at high revs, where the T25 runs out, so the
  // game's +13 hp (14 psi over 12) is the low end of what owners report.
  {id:'evo3-16g',name:'Mitsubishi TD05H "Evo III big 16G" (MHI 49178-01470) in the factory turbo\'s place, 2G install kit, 14 psi on the stock fuel',family:'single',stock:false,stockFor:null,inPlaceOf:'stock-t25-4g63t',inPlaceKit:'2G install kit: oil feed and return lines, water lines, 2 1/4" intercooler pipe, J pipe, 7 cm turbo-to-manifold and O2-housing gaskets',pn:'49178-01470',chra:null,compIn:null,compEx:68,compTrim:null,compAR:null,turbIn:null,turbEx:null,turbTrim:null,turbAR:null,bearing:'journal',cooling:'oil+water',wg:{type:'internal',actuatorPsi:null},flangeIn:'4G63 7 cm TD05',flangeOut:'Evo III O2 housing',mass:3,envLen:null,envDia:null,envHgt:null,spoolStart:2500,fullBoost:3500,tau:0.8,boostPsi:14,icEff:0.60,flowLbMin:null,hpClass:[345,380],dispL:[2.0,2.0],shells:['eclipse'],bundle:{intercooler:'stock',piping:true,downpipe:false,manifold:'stock',bov:{type:'recirc',holdPsi:null},intake:{pipe:true,futureSlot:true},oilWater:true},label:'E'},
  {id:'stock-ct12b-2jzgte',name:'Stock CT12B twins (2JZ-GTE)',family:'sequential-twin',stock:true,stockFor:'2JZGTE',pn:null,chra:null,compIn:null,compEx:null,compTrim:null,compAR:null,turbIn:null,turbEx:null,turbTrim:null,turbAR:null,bearing:null,cooling:null,wg:null,flangeIn:null,flangeOut:null,mass:null,envLen:null,envDia:null,envHgt:null,spoolStart:1800,fullBoost:3500,tau:0.6,boostPsi:null,icEff:null,flowLbMin:null,hpClass:null,dispL:null,bundle:{intercooler:'side',piping:true,downpipe:true,manifold:'included',bov:{type:'recirc',holdPsi:null},intake:{pipe:true,futureSlot:true},oilWater:true},label:'D'},   // §2.7/§3.5 2JZ stock: spoolStart ~1800 / fullBoost ~3500 [E] staging numbers (second turbo ~4000); boostPsi [O] OPEN-17; icEff [O] OPEN-20; COMBINED curve only — the ~4000 rpm changeover step is NOT modelled [D]; tau 0.6 [D] twin
  {id:'stock-t25-vg30dett',name:'Stock T25 twins (VG30DETT)',family:'parallel-twin',stock:true,stockFor:'VG30DETT',pn:null,chra:null,compIn:null,compEx:null,compTrim:null,compAR:null,turbIn:null,turbEx:null,turbTrim:null,turbAR:null,bearing:null,cooling:null,wg:null,flangeIn:null,flangeOut:null,mass:null,envLen:null,envDia:null,envHgt:null,spoolStart:null,fullBoost:null,tau:0.6,boostPsi:9.5,icEff:0.60,flowLbMin:null,hpClass:null,dispL:null,bundle:{intercooler:'side',piping:true,downpipe:true,manifold:'included',bov:{type:'recirc',holdPsi:null},intake:{pipe:true,futureSlot:true},oilWater:true},label:'D'},   // §2.7/§3.5 Z32 stock: all spool/boost/icEff/mass/env [O] OPEN-16/OPEN-20/OPEN-3; model T25 SECONDARY (Zilvia), not frozen; tau 0.6 [D] twin; record INCOMPLETE → LEGACY   // TURBO-02 (Nov 14): boostPsi 9.5 [E] — 300zx-owners.club ("stock boost is 9psi roughly") and autospeed.com.au ("roughly 10 psi"); icEff 0.60 [D] — the twin side-mount intercoolers (autospeed: a reputation for weak heat exchange), the same value the in-place upgrade keeps. The stock car still runs the LEGACY curve (spool fields open)
  {id:'stock-t28-rb26dett',name:'Stock T28 twins (RB26DETT)',family:'parallel-twin',stock:true,stockFor:'RB26DETT',pn:null,chra:null,compIn:null,compEx:null,compTrim:null,compAR:null,turbIn:null,turbEx:null,turbTrim:null,turbAR:null,bearing:null,cooling:null,wg:null,flangeIn:null,flangeOut:null,mass:null,envLen:null,envDia:null,envHgt:null,spoolStart:null,fullBoost:null,tau:0.6,boostPsi:null,icEff:null,flowLbMin:null,hpClass:null,dispL:null,bundle:{intercooler:'front',piping:true,downpipe:true,manifold:'included',bov:{type:'recirc',holdPsi:null},intake:{pipe:true,futureSlot:true},oilWater:true},label:'D'},   // §2.7/§3.5 RB26 stock: all spool/boost/icEff/mass/env [O] OPEN-16/OPEN-20/OPEN-4; model T28 SECONDARY (Zilvia), not frozen; tau 0.6 [D] twin; intercooler front [D] (R32/R33/R34 stock FMIC); record INCOMPLETE → LEGACY
  {id:'stock-turbo-sr20det',name:'Stock turbo (SR20DET)',family:'single',stock:true,stockFor:'SR20DET',pn:null,chra:null,compIn:null,compEx:null,compTrim:null,compAR:null,turbIn:null,turbEx:null,turbTrim:null,turbAR:null,bearing:null,cooling:null,wg:null,flangeIn:null,flangeOut:null,mass:null,envLen:null,envDia:null,envHgt:null,spoolStart:null,fullBoost:null,tau:0.8,boostPsi:null,icEff:null,flowLbMin:null,hpClass:null,dispL:null,bundle:{intercooler:'side',piping:true,downpipe:true,manifold:'included',bov:{type:'recirc',holdPsi:null},intake:{pipe:true,futureSlot:true},oilWater:true},label:'D'},   // §2.7/§3.5 SR20 stock: all spool/boost/icEff/mass/env [O] OPEN-16/OPEN-20; model [O] (id renamed MIN-10, no model asserted); tau 0.8 [D] single; record INCOMPLETE → LEGACY
  {id:'stock-turbo-1jzgte',name:'Stock turbo (1JZ-GTE)',family:'single',stock:true,stockFor:'1JZGTE',pn:null,chra:null,compIn:null,compEx:null,compTrim:null,compAR:null,turbIn:null,turbEx:null,turbTrim:null,turbAR:null,bearing:null,cooling:null,wg:null,flangeIn:null,flangeOut:null,mass:null,envLen:null,envDia:null,envHgt:null,spoolStart:null,fullBoost:null,tau:0.8,boostPsi:null,icEff:null,flowLbMin:null,hpClass:null,dispL:null,bundle:{intercooler:'front',piping:true,downpipe:true,manifold:'included',bov:{type:'recirc',holdPsi:null},intake:{pipe:true,futureSlot:true},oilWater:true},label:'D'}   // §2.7/§3.5 1JZ stock: all spool/boost/icEff/mass/env [O] OPEN-16/OPEN-20; model [O] (id renamed MIN-10; file figures match the VVT-i single CT15B, not a T25 — family single on that basis); tau 0.8 [D] single; record INCOMPLETE → LEGACY
 ],
 seats:[
  {id:'stock',name:'Stock sport seats',donor:'BMW E30',mass:15,label:'D'},
  {id:'comfort',name:'Base comfort seats',donor:'BMW E30',mass:17,label:'D'},
  {id:'sport',name:'Sport seats with thigh extension',mass:16,label:'D'},
  {id:'recliner',name:'Reclining bucket seats',mass:13,label:'D'},
  {id:'bucket',name:'Fixed-back bucket seats',mass:8,label:'D'},
  // universal seats (any car): a look over a proven seat shape (the shape is the named base's, so it fits every cabin the base fits); styles after popular seats
  {id:'sr-sport',name:'Recaro SR-style sport seats (grey cloth)',mass:14,label:'D',look:{base:'sport',cush:0x3a3c41,bol:0x1c1d20,bolH:2.4}},
  {id:'zeta-bucket',name:'Bride Zeta-style FRP buckets (blue gradation)',mass:7,label:'D',look:{base:'bucket',cush:0x1d3566,bol:0x0f1012}},
  {id:'red-bucket',name:'Red cloth reclining buckets',mass:12,label:'D',look:{base:'recliner',cush:0x8e1d1f,bol:0x1c1d20,bolH:1.8}},
  {id:'tan-leather',name:'Tan leather sport seats',mass:17,label:'D',look:{base:'sport',cush:0x8a5a35,bol:0x6b4428,bolH:1.8}},
  // Stage A (SPEC-INTERIOR §3): sourced-shell aftermarket seats. shellKg = sourced shell mass; mass = installed per seat (shell + rails: 4.1 kg fixed bucket, 6.4 kg recliner). look.base 'bucket' satisfies the cage needsSeats rule; 'recliner' does not. Colours DESIGN; dims FROZEN only for the Pole Position (OPEN-INT-9 for the rest).
  {id:'pole-position',name:'Recaro Pole Position-style fixed bucket (black)',donor:'Recaro',shellKg:7.0,mass:11.1,label:'C',dims:[584,457,762],look:{base:'bucket',cush:0x1b1c1f,bol:0x0f1012}},
  {id:'pro-2000',name:'Sparco Pro 2000-style fixed bucket (blue bolsters)',donor:'Sparco',shellKg:8.6,mass:12.7,label:'C',look:{base:'bucket',cush:0x22252a,bol:0x2a4a7a}},
  {id:'evo-2',name:'Sparco Evo 2-style fixed bucket (red bolsters)',donor:'Sparco',shellKg:8.5,mass:12.6,label:'C',look:{base:'bucket',cush:0x1e2023,bol:0x7a1f1f}},
  {id:'zeta-iv',name:'Bride Zeta IV-style fixed bucket (black gradation)',donor:'Bride',shellKg:7.3,mass:11.4,label:'C',look:{base:'bucket',cush:0x2b2d31,bol:0x121316}},
  {id:'zeta-iii-cf',name:'Bride Zeta III CF-style fixed bucket (carbon grey)',donor:'Bride',shellKg:7.7,mass:11.8,label:'C',look:{base:'bucket',cush:0x33363a,bol:0x141518}},
  {id:'profi-spg',name:'Recaro Profi SPG-style fixed bucket (red bolsters)',donor:'Recaro',shellKg:9.55,mass:13.65,label:'E',look:{base:'bucket',cush:0x202226,bol:0x8e1d1f}},
  {id:'gias-iii',name:'Bride Gias III-style reclining sport seat (dark grey)',donor:'Bride',shellKg:9.5,mass:15.9,label:'C',look:{base:'recliner',cush:0x2a2c30,bol:0x1c1d20}},
  {id:'sportster-cs',name:'Recaro Sportster CS-style reclining sport seat (black leather)',donor:'Recaro',shellKg:11.35,mass:17.75,label:'E',look:{base:'recliner',cush:0x17181b,bol:0x2e2f33}},
  {id:'r100',name:'Sparco R100-style reclining sport seat (grey cloth)',donor:'Sparco',shellKg:12.2,mass:18.6,label:'C',look:{base:'recliner',cush:0x3a3d44,bol:0x232528}}
 ],
 shifter:[   // Stage A (SPEC-INTERIOR §2): short-throw shifters. mass = whole assembly (lever + knob + boot + base), 1.5 kg (E) interim = the stock assembly mass (OPEN-INT-4); the mass delta vs stock is 0 at launch. throwReduction drives shiftT (§2.3) and the lever rotation targets (§2.4). Knob: ball frozen from the file baseline (58 x ~53 mm ellipsoid, 0.20 kg E); pistol height 100-130 mm E, mass DESIGN interim (OPEN-INT-4); wood/leather dims OPEN-INT-4. Thread is cosmetic, never a BLOCK (§2.1). The B&M Ripper 60% is EXCLUDED (frozen).
  {id:'stock',name:'Stock shifter',mass:1.5,label:'E',throwReduction:0,leverH:'stock',knob:{style:'ball',diaMm:58,massKg:0.20,thread:'M12x1.25'},boot:{material:'leather',colour:'black'},gate:'generic'},
  {id:'street',name:'Street short shifter — 30% shorter throw',mass:1.5,label:'E',throwReduction:0.30,leverH:'stock',knob:{style:'wood',diaMm:58,massKg:0.20,thread:'M12x1.25'},boot:{material:'leather',colour:'black'},gate:'generic'},
  {id:'sport',name:'Sport short shifter — 40% shorter throw',mass:1.5,label:'E',throwReduction:0.40,leverH:'stock',knob:{style:'ball',diaMm:58,massKg:0.20,thread:'M12x1.25'},boot:{material:'leather',colour:'black'},gate:'generic'},
  {id:'race',name:'Race short shifter — 45% shorter throw',mass:1.5,label:'E',throwReduction:0.45,leverH:'stock',knob:{style:'pistol',heightMm:115,massKg:0.30,thread:'M12x1.25'},boot:{material:'leather',colour:'black'},gate:'generic'},
  // v20 tall and drift levers (owner, 2026-11-05: taller metal shifters, the drift ones). leverExtMm: extension above the stock lever's knob height
  // (M-07 VERIFIED: threaded extensions are sold 50 / 75 / 100 mm; the +150 and +200 are custom one-piece levers, DESIGN). The throw ANGLE is the base lever's, so the shift time
  // is the base lever's too (a longer lever moves the hand further for the same angle, it does not shift faster). Metal finishes: lever / knob colours.
  {id:'ext-75',name:'Shifter extension +75 mm — polished aluminium lever, aluminium puck knob',mass:1.7,label:'E',throwReduction:0,leverH:'ext',leverExtMm:75,lever:'alu',knob:{style:'puck',diaMm:50,massKg:0.25,thread:'M12x1.25'},boot:{material:'leather',colour:'black'},gate:'generic'},
  {id:'drift-150',name:'Custom tall drift shifter +150 mm — chrome lever, weighted steel teardrop knob',mass:2.0,label:'D',throwReduction:0,leverH:'ext',leverExtMm:150,lever:'chrome',knob:{style:'teardrop',diaMm:52,massKg:0.48,thread:'M12x1.25'},boot:{material:'leather',colour:'black'},gate:'generic'},
  {id:'drift-200-ti',name:'Custom tall drift shifter +200 mm — burnt-titanium lever and ball knob',mass:2.1,label:'D',throwReduction:0,leverH:'ext',leverExtMm:200,lever:'ti',knob:{style:'tiball',diaMm:50,massKg:0.30,thread:'M12x1.25'},boot:{material:'leather',colour:'black'},gate:'generic'},
  {id:'race-ext-100',name:'Race short shifter + 100 mm extension — 45% shorter throw, billet aluminium knob',mass:1.8,label:'E',throwReduction:0.45,leverH:'ext',leverExtMm:100,lever:'alu',knob:{style:'alucyl',diaMm:45,massKg:0.22,thread:'M12x1.25'},boot:{material:'leather',colour:'black'},gate:'generic'}
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
  {id:'quick',name:'330 mm flat-bottom with quick release',dia:330,mass:1.3,label:'D'},
  // universal wheels (any car), drawn by genSteeringWheel from their look; styles after popular aftermarket wheels
  {id:'prototipo',name:'MOMO Prototipo-style 350 mm (black leather, white stitch)',dia:350,mass:1.0,label:'D',look:{rim:0x161719,spoke:0xb9bdc3,hub:0x111214,badge:0xd8d8d8,stitch:0xe8e8e8,rimW:2.8}},
  {id:'nardi',name:'Nardi Classic-style 360 mm wood rim',dia:360,mass:1.1,label:'D',look:{rim:0x6b3f1f,spoke:0xc9cdd2,hub:0x111214,badge:0xc9cdd2,rimW:2.6}},
  {id:'suede-dish',name:'350 mm deep-dish suede, red stitch',dia:350,mass:1.0,label:'D',look:{rim:0x2a2b2e,spoke:0x111214,hub:0x111214,badge:0xb3201b,stitch:0xb3201b,rimW:3.0,spokes:[Math.PI*.83,Math.PI*.17,-Math.PI/2]}}
 ],
 // tyre compound (any car): the grip of the rubber, as a multiple of a period touring tyre's, and how much stiffer it builds its cornering force (B).
 // E: typical relative differences between tyre classes in published tyre tests; not measured on these cars
 tyre:[
  {id:'touring',name:'Touring tires (period original fit)',mu:1.00,B:0,label:'E'},
  {id:'summer',name:'Summer sport tires',mu:1.06,B:.5,label:'E'},
  {id:'uhp',name:'Ultra-high-performance summer tires (200 treadwear)',mu:1.13,B:1,label:'E'},
  {id:'rcomp',name:'R-compound semi-slicks (street legal, poor in the wet)',mu:1.25,B:1.5,label:'E'},
  {id:'hard',name:'Hard budget tires (drift practice: slide early, last long)',mu:.9,B:-.5,label:'E'}
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
 // aero and body: four independent slots (any lip with any spoiler, flares and skirts); a kit is only a shortcut that fits several of them at once.
 // drag: added share of the stock drag area (E); lip / skirt: how far the part reaches below the valance / sill (mm, D); flare: extra fender width per side (mm, D)
 aeroF:[
  {id:'none',name:'Stock (no lip)'},
  {id:'islip',name:'Factory 318iS front lip',donor:'BMW E30 318iS',lip:15,mass:1.5,shells:['e30'],kit:'is',mount:'addon',onBumper:'front',label:'D',src:'OPEN-2'},
  {id:'frontlip',name:'Front lip spoiler',lip:20,mass:2,mount:'addon',onBumper:'front',label:'D',src:'DESIGN (generic form; SCOUT-AERO §1.7)'},
  {id:'splitter',name:'Front splitter',lip:30,mass:3,mount:'addon',onBumper:'front',label:'D',src:'DESIGN (generic form; SCOUT-AERO §1.7)'},
  {id:'mtfront',name:'M-Technik II front air dam',donor:'BMW E30 325iS',lip:30,mass:3,shells:['e30','e30t'],kit:['mtech2','mtech2t'],mount:'addon',onBumper:'front',label:'D',src:'OPEN-1'}
 ],
 aeroR:[
  {id:'none',name:'Stock'},
  {id:'trunklip',name:'Factory 318iS trunk lip spoiler',donor:'BMW E30 318iS',mass:1,bodyOnly:'notch',shells:['e30'],kit:'is',mount:'addon',onBumper:null,label:'D',src:'OPEN-2'},
  {id:'ducktail',name:'Ducktail spoiler (trunk lid)',mass:2,bodyOnly:'notch',drag:.02,mount:'addon',onBumper:null,label:'D',src:'DESIGN (generic form; SCOUT-AERO §1.7)'},
  {id:'hatchspoiler',name:'Hatch roof spoiler',mass:3,bodyOnly:'hatch',mount:'addon',onBumper:null,label:'D',src:'DESIGN (generic form; SCOUT-AERO §1.7)'},
  {id:'gtwing',name:'GT wing on uprights',mass:6,drag:.12,mount:'addon',onBumper:null,label:'D',src:'DESIGN (generic form; SCOUT-AERO §1.7)'},
  {id:'mtrear',name:'M-Technik II trunk spoiler and rear apron',donor:'BMW E30 325iS',mass:4,bodyOnly:'notch',shells:['e30'],kit:'mtech2',mount:'addon',onBumper:'rear',label:'D',src:'OPEN-1'},
  {id:'mtroof',name:'M-Technik II roof spoiler and rear apron',donor:'BMW E30 Touring',mass:5,bodyOnly:'hatch',shells:['e30t'],kit:'mtech2t',mount:'addon',onBumper:'rear',label:'D',src:'OPEN-1'}
 ],
 flares:[
  {id:'none',name:'Stock fenders'},
  {id:'wide',name:'Bolt-on widebody flares (+30 mm per side)',flare:30,mass:8,mount:'addon',onBumper:null,label:'D',src:'DESIGN (generic form; SCOUT-AERO §1.7)'}
 ],
 skirts:[
  {id:'none',name:'Stock sills'},
  {id:'skirts',name:'Side skirts',skirt:30,mass:4,mount:'addon',onBumper:null,label:'D',src:'DESIGN (generic form; SCOUT-AERO §1.7)'},
  {id:'mtskirts',name:'M-Technik II side skirts',donor:'BMW E30 325iS',skirt:40,mass:5,shells:['e30','e30t'],kit:['mtech2','mtech2t'],mount:'addon',onBumper:null,label:'D',src:'OPEN-1'}
 ],
 // aero kits: shortcuts that fit several aero parts at once (each part stays changeable on its own afterwards)
 aerokit:[
  {id:'none',name:'Remove all aero',set:{aeroF:'none',aeroR:'none',flares:'none',skirts:'none'}},
  {id:'mtech2',name:'M-Technik II: air dam, side skirts, trunk spoiler and rear apron',token:'M-Technik II',donor:'BMW E30 325iS',set:{aeroF:'mtfront',skirts:'mtskirts',aeroR:'mtrear'},shells:['e30'],bodyOnly:'notch'},
  {id:'mtech2t',name:'M-Technik II (Touring): air dam, side skirts, roof spoiler and rear apron',token:'M-Technik II',donor:'BMW E30 Touring',set:{aeroF:'mtfront',skirts:'mtskirts',aeroR:'mtroof'},shells:['e30t']},
  {id:'is',name:'318iS package: front lip and trunk lip spoiler',token:'318iS',donor:'BMW E30 318iS',set:{aeroF:'islip',aeroR:'trunklip'},shells:['e30'],bodyOnly:'notch'},
  {id:'street',name:'Street bundle (generic): front lip, side skirts and ducktail',set:{aeroF:'frontlip',skirts:'skirts',aeroR:'ducktail'},generic:1,bodyOnly:'notch'},
  {id:'streethatch',name:'Street bundle (generic): front lip, side skirts and roof spoiler',set:{aeroF:'frontlip',skirts:'skirts',aeroR:'hatchspoiler'},generic:1,bodyOnly:'hatch'},
  {id:'track',name:'Track bundle (generic): splitter and GT wing',set:{aeroF:'splitter',aeroR:'gtwing'},generic:1},
  {id:'widebody',name:'Widebody bundle (generic): flares, side skirts, splitter and GT wing',set:{flares:'wide',skirts:'skirts',aeroF:'splitter',aeroR:'gtwing'},generic:1}
 ],
 frame:[
  {id:'stock',name:'Stock shell',mass:0},
  {id:'strutbar',name:'Front strut tower brace',mass:3},
  {id:'rollbar',name:'4-point bolt-in roll bar',mass:14,deletesRearSeat:1},
  {id:'cage',name:'6-point roll cage',mass:28,needsSeats:'bucket',deletesRearSeat:1},
  {id:'cage10',name:'10-point welded cage (A-pillar and roof bars)',mass:38,needsSeats:'bucket',deletesRearSeat:1}
 ],
 // Stage B (SPEC-INTERIOR §1.8/§4): rear-area replacements. 'stock'/'removed' are STATE values, never records (§1.3).
 // Walls are VISUAL + MASS ONLY — no audio system in this garage (yet) (OPEN-INT-3, §4.5). Nitrous kits live here in Stage C, not this lane.
 // Masses: wall components sum to 46.2 / 90.8 kg; the record mass is the spec's frozen rounded 46 / 91 kg (§4.3 table + worked nets §1.4).
 rearArea:[
  {id:'wall-street',name:'Street speaker wall',area:'rearArea',kind:'wall',mass:46,front:-0.1,cars:['e30','e30t','ef','ae86','eclipse'],shells:['e30','e30t','ef','ae86','eclipse'],contents:'2× 12-inch subs + chuchero quad box + amp',components:{subs:[{model:'12W3v3',n:2,kg:13.2}],enclosureKg:17,midBoxes:[{n:1,kg:9}],ampsKg:5,structureKg:0,wiringKg:2}},
  {id:'wall-full',name:'Full chuchero wall',area:'rearArea',kind:'wall',mass:91,front:-0.1,cars:['e30','e30t','ef','ae86','eclipse'],shells:['e30','e30t','ef','ae86','eclipse'],contents:'2× 12-inch subs + 2 chuchero quad boxes + 2 amps',components:{subs:[{model:'12W7AE',n:2,kg:40.8}],enclosureKg:0,midBoxes:[{n:2,kg:18}],ampsKg:12,structureKg:20,wiringKg:0}},
  {id:'plush-bench',name:'Plush bench set',area:'rearArea',kind:'plush',mass:1.2,front:0.1,cars:['e30','e30t','ef','ae86','eclipse'],shells:['e30','e30t','ef','ae86','eclipse'],contents:'1 large bear + 2 medium (bunny + white cat)'},
  {id:'plush-wall',name:'Plush wall — the rear seat area stacked full',area:'rearArea',kind:'plushwall',mass:6,front:0.1,cars:['e30','e30t','ef','ae86','eclipse'],shells:['e30','e30t','ef','ae86','eclipse'],contents:'large bears at the bottom, medium and small plushies stacked to the headliner, wall to wall'},
  {id:'nitrous-50',name:'Nitrous kit — 50 hp dry shot, 10 lb bottle',area:'rearArea',kind:'nitrous',shotHp:50,wet:0,bottleLb:10,emptyKg:6.35,fullKg:11.3,bottleDiaMm:178,bottleLenMm:480,front:-0.1,kitHardwareKg:2.0,mass:12.9,cars:['e30','e30t','ef','ae86','eclipse'],shells:['e30','e30t','ef','ae86','eclipse'],contents:'10 lb bottle + brackets + feed line + nitrous solenoid + fogger nozzle + purge valve + bottle heater + pressure gauge + arming switch + WOT switch'},
  {id:'nitrous-75',name:'Nitrous kit — 75 hp dry shot, 10 lb bottle',area:'rearArea',kind:'nitrous',shotHp:75,wet:0,bottleLb:10,emptyKg:6.35,fullKg:11.3,bottleDiaMm:178,bottleLenMm:480,front:-0.1,kitHardwareKg:2.0,mass:12.9,cars:['e30','e30t','ef','ae86','eclipse'],shells:['e30','e30t','ef','ae86','eclipse'],contents:'10 lb bottle + brackets + feed line + nitrous solenoid + fogger nozzle + purge valve + bottle heater + pressure gauge + arming switch + WOT switch'},
  {id:'nitrous-100',name:'Nitrous kit — 100 hp dry shot, 10 lb bottle',area:'rearArea',kind:'nitrous',shotHp:100,wet:0,bottleLb:10,emptyKg:6.35,fullKg:11.3,bottleDiaMm:178,bottleLenMm:480,front:-0.1,kitHardwareKg:2.0,mass:12.9,cars:['e30','e30t','ef','ae86','eclipse'],shells:['e30','e30t','ef','ae86','eclipse'],contents:'10 lb bottle + brackets + feed line + nitrous solenoid + fogger nozzle + purge valve + bottle heater + pressure gauge + arming switch + WOT switch'},
  {id:'nitrous-150',name:'Nitrous kit — 150 hp wet shot, 10 lb bottle',area:'rearArea',kind:'nitrous',shotHp:150,wet:1,bottleLb:10,emptyKg:6.35,fullKg:11.3,bottleDiaMm:178,bottleLenMm:480,front:-0.1,kitHardwareKg:2.0,mass:12.9,cars:['e30','e30t','ef','ae86','eclipse'],shells:['e30','e30t','ef','ae86','eclipse'],contents:'10 lb bottle + brackets + feed line + nitrous solenoid + fuel solenoid + fogger nozzle + purge valve + bottle heater + pressure gauge + arming switch + WOT switch'}
 ],
 // Stage B (SPEC-INTERIOR §1.8/§6): passenger-area replacements — the plush passenger set ONLY at launch (§1.6).
 passArea:[
  {id:'plush-pass',name:'Plush passenger set',area:'passArea',kind:'plush',mass:0.6,front:0.55,contents:'2 medium (blue alien + frog)'},
  {id:'plush-pass-pile',name:'Plush passenger pile — the seat space stacked full',area:'passArea',kind:'plushwall',mass:3,front:0.55,contents:'a pile of medium and small plushies from the floor to the dash top'}
 ],
 // Stage B (SPEC-INTERIOR §1.8/§6.3): the dash set is a record, not a boolean — 'none' | 'dash-set', default 'none'. Standalone cosmetic; it removes nothing.
 // v20 the trunk / hatch area behind the rear seat (owner, 2026-11-05: speakers in the trunk, plushies in the trunk). AE86 for now.
 trunk:[
  {id:'none',name:'Empty trunk',mass:0},
  {id:'trunk-plush',name:'Plush crowd — rows by size, facing the hatch',kind:'plush',mass:4,label:'E',shells:['ae86']},
  {id:'trunk-subs',name:'Twin 12-inch sub box — against the seat back, firing at the hatch',kind:'box',mass:32,label:'E',shells:['ae86']},
  {id:'trunk-wall',name:'Trunk speaker wall — 2x 12-inch subs, 2 quad boxes, 2 amps, fitted to the cargo area',kind:'wall',wall:'wall-full',mass:70,label:'E',shells:['ae86']}
 ],
 // v20 drift handbrake (owner, 2026-11-05: the drifting parts). The hydraulic lever stands on the tunnel beside the shifter and works the rear calipers
 // through its own master cylinder; in this garage the handbrake locks the rear wheels with either lever (garage_core), so the hydro adds mass and the lever.
 handbrake:[
  {id:'stock',name:'Stock cable handbrake',mass:0,label:'D'},
  {id:'hydro',name:'Hydraulic drift handbrake — vertical lever, inline master cylinder',mass:1.6,label:'E',leverMm:300}
 ],
 // v20 rear-view mirror hangers: original generic designs, hung on a cord from the mirror stem; they swing with the car (mass ~0, visual)
 mirrorHang:[
  {id:'none',name:'Nothing on the mirror',mass:0},
  {id:'dice',name:'Fuzzy dice (pair, 75 mm)',mass:0.08,kind:'dice'},
  {id:'tsurikawa',name:'Tsurikawa strap ring (train handle)',mass:0.12,kind:'ring'},
  {id:'omamori',name:'Omamori charm bag (red silk)',mass:0.01,kind:'charm'},
  {id:'tree',name:'Air freshener tree (green)',mass:0.01,kind:'tree'},
  {id:'beads',name:'Wooden bead string with tassel',mass:0.03,kind:'beads'},
  {id:'plushie',name:'Mini plush on a cord (white cat)',mass:0.05,kind:'plush'}
 ],
 dashPlush:[
  {id:'dash-set',name:'Plush dash set',area:'dashPlush',kind:'plush',mass:0.3,front:0.9,contents:'3 small (white cat + blue alien + frog)'}
 ]
};
if(typeof module!=='undefined')module.exports={LIB};
