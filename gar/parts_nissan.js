/* ===== NISSAN PARTS (the Z32's family and its common swaps): real parts with the attributes that decide what they fit. Appended to LIB.
   Labels: V = VERIFIED against the source named, C = CALCULATED, E = ESTIMATED (typical figure, not yet checked against a document), D = DESIGN.
   Sources: E-CZ32 300ZX Twin Turbo catalogue (carfromjapan): VG30DETT 2960 cc, 87.0 x 83.0 mm, 8.5:1, 280 PS / 6400, 388 N m / 3600, 1550 kg, 225/50R16, final 3.692 with LSD;
   Nissan Heritage 300ZX T-Top 1992: VG30DE 230 PS / 6400, 273 N m / 4800, 4310 x 1790 x 1250, wheelbase 2450, tread 1495 / 1535, multilink front and rear;
   Motor Trend twin-turbo test (twinturbo.net): 16 x 7.5 / 16 x 8.5 wheels, 225/50 / 245/45 tyres, 5-speed, final 3.69; hybridz.org: Z32 twin-turbo 5-speed 3.214 / 1.925 / 1.302 /
   1.000 / 0.752, final R230 3.692 (twin turbo), R200 4.08 (non-turbo); wheel-sizes.com: 5x114.3, centre bore 66.1 mm. RB26DETT (R32 GT-R): Wikipedia "Nissan RB engine"; VQ35DE (350Z 2003):
   Wikipedia "Nissan VQ engine". Engine dimensions (len, wid, hgt, pan) and masses are ESTIMATED from the families' known records. ===== */
(function(){
const E=(id,o)=>Object.assign({id,orient:'long',layout:'I',turbo:0,mechFan:0},o);
const PS=ps=>Math.round(ps*0.98632);
LIB.engine.push(
 E('VG30DETT',{safeBoostPsi:14,   // TURBO-02 [E]: 300zx-owners.club (what's a sensible boost on a stock engine: 14 psi a safe maximum with a remapped ECU and the stock injectors; 16 the most on the stock injectors); autospeed.com.au (past about 15 psi the stock ceramic turbos are at risk)
 fam:'VG',name:'VG30DETT 3.0 L twin-turbo V6 (Fairlady Z / 300ZX Twin Turbo)',donor:'Nissan 300ZX Z32',len:680,wid:760,hgt:600,pan:170,mount:'NISSAN-VG',bell:'NISSAN-VG',hp:PS(280),hpRpm:6400,tq:388,tqRpm:3600,red:7000,mass:235,cyl:6,layout:'V',turbo:1,mechFan:0,label:'V/E',colors:{cover:0x1d1f22,block:0x6b7078,head:0x8c9298,intake:0x6f757c,man:0x7a6a5e}}),
 E('VG30DE',{fam:'VG',name:'VG30DE 3.0 L V6 (300ZX non-turbo)',donor:'Nissan 300ZX Z32',len:680,wid:700,hgt:600,pan:170,mount:'NISSAN-VG',bell:'NISSAN-VG',hp:PS(230),hpRpm:6400,tq:273,tqRpm:4800,red:7000,mass:200,cyl:6,layout:'V',turbo:0,mechFan:0,label:'V/E',colors:{cover:0x1d1f22,block:0x6b7078,head:0x8c9298,intake:0x6f757c}}),
 E('RB26DETT',{fam:'RB',name:'RB26DETT 2.6 L twin-turbo inline-6 (Skyline GT-R R32)',donor:'Nissan Skyline GT-R',len:800,wid:640,hgt:700,pan:190,mount:'NISSAN-RB',bell:'NISSAN-RB',hp:PS(280),hpRpm:6800,tq:353,tqRpm:4400,red:8000,mass:260,cyl:6,layout:'I',turbo:1,label:'V/E',colors:{cover:0xb32420,block:0x6b7078,head:0x8c9298,intake:0x8d9298,red:1}}),
 E('VQ35DE',{fam:'VQ',name:'VQ35DE 3.5 L V6 (350Z, 2003)',donor:'Nissan 350Z',len:620,wid:700,hgt:700,pan:170,mount:'NISSAN-VQ',bell:'NISSAN-VQ',hp:287,hpRpm:6200,tq:363,tqRpm:4800,red:6600,mass:165,cyl:6,layout:'V',turbo:0,label:'V/E',colors:{cover:0x9aa0a8,block:0x6b7078,head:0x8c9298,intake:0x9aa0a8}})
);
LIB.gearbox.push(
 {id:'Z32-5MT',name:'Nissan 5-speed (300ZX Twin Turbo)',donor:'Nissan 300ZX Z32',kind:'trans',drives:['FR'],bell:'NISSAN-VG',ratios:[3.214,1.925,1.302,1.000,0.752],mass:58,tunnel:330,tq:450,label:'V/E'}   // ratios V (hybridz), mass / tunnel / rating E
);
LIB.diff.push(
 {id:'lsd369',name:'Viscous limited-slip 3.692 (R230, Twin Turbo)',ratio:3.692,lsd:1,viscous:1,mass:0,label:'V'},
 {id:'lsd408',name:'Viscous limited-slip 4.083 (R200, non-turbo)',ratio:4.083,lsd:1,mass:-6,label:'V/E'}
);
LIB.swapkit.push(
 {id:'kit-z32-rb',name:'RB26 swap kit (Z32): engine mounts and cross-member brackets, RB-to-Z32 adapter plate and flywheel, rear-sump pan (the deep well behind the cross-member, a shallow front over the rack), electric fans, wiring',accepts:['NISSAN-RB'],adapts:[['NISSAN-RB','NISSAN-VG']],tunnel:0,relief:{hgt:30,wid:0,pan:20,len:60},mass:12,label:'D',shells:['z32']},
 {id:'kit-z32-vq',name:'VQ35 swap kit (Z32): mounts, adapter plate to the Z32 gearbox, wiring, intake',accepts:['NISSAN-VQ'],adapts:[['NISSAN-VQ','NISSAN-VG']],tunnel:0,relief:{hgt:30,wid:0,pan:0,len:0},mass:8,label:'D',shells:['z32']},
 {id:'kit-z32-jz',name:'2JZ swap kit (Z32): mounts, cross-member, adapter plate, driveshaft, electric fans',accepts:['TOYOTA-JZ'],adapts:[['TOYOTA-JZ','NISSAN-VG']],tunnel:360,relief:{hgt:30,wid:0,pan:30,len:60},mass:12,label:'D',shells:['z32']},
 {id:'kit-z32-ls',name:'LS swap kit (Z32): mounts, rear-sump pan, electric fans, T56 cross-member and driveshaft',accepts:['GM-LS'],adapts:[],tunnel:420,relief:{hgt:30,wid:0,pan:30,len:0},mass:14,label:'D',shells:['z32']}
);
LIB.exhaust.push(
 {id:'z32-quad',name:'Twin Turbo exhaust, quad tips (two each side)',tip:'quad',tipW:70,mass:0,sound:1,hp:0,label:'V/D',shells:['z32']}
);
LIB.seats.push(
 {id:'z32-stock',name:'Fairlady Z 2-seater sport seats',donor:'Nissan 300ZX Z32',mass:16,label:'E',look:{cush:0x2b2c30,bol:0x3a3c42,bolH:1.8,back:23,hw:9.5,head:'integral'}}
);
LIB.steering.push(
 {id:'z32-stock',name:'Fairlady Z 4-spoke 370 mm',donor:'Nissan 300ZX Z32',dia:370,mass:1.4,label:'E'}
);
LIB.brakes.push(
 {id:'z32-tt',name:'Twin Turbo 296 mm vented, 4-piston',donor:'Nissan 300ZX Z32',rotor:296,cal:32,pot:'4pot',calCol:0x9ea3a8,potR:'stock',calColR:0x9ea3a8,mass:0,label:'E'},   // calipers: unpainted Sumitomo cast aluminium (M-13 Z32 §3, Nissan FSM), 4-piston front, 2-piston rear (they were drawn Brembo red, front and rear)
 {id:'z32-na',name:'Non-turbo 280 mm vented, 2-piston',donor:'Nissan 300ZX Z32',rotor:280,cal:28,mass:-2,label:'E'},
 // real big brake kits (C-10; board/done/M-13-z32.md section 3, VERIFIED from the makers' catalogues and templates): front only, the stock rear stays
 // (rotorR 296: the stock Twin Turbo disc as this file draws it).
 // rotor: the kit's disc diameter (the 32 mm thickness is not drawn). cal: ADOPTED so the shop's barrel rule (rotor/2 + cal + 5 mm against the wheel's
 // barrel) refuses exactly the wheels the maker refuses: 332 mm kits pass 17-inch and are refused on 16-inch; 355 mm kits pass 18-inch and are refused
 // on 17-inch. mass: per corner over stock, ESTIMATED. Calipers drawn in their catalogued colour (Brembo red: 1M3.8053A2); no maker lettering is drawn.
 {id:'z32-brembo-gt4',name:'Brembo GT 4-piston, 332 mm (1B1.7011A)',donor:'Brembo',rotor:332,rotorR:296,cal:30,pot:'4pot',calCol:0xc2202a,mass:1,shells:['z32'],label:'V',src:'M-13 Z32 §3: 332 x 32 mm, 4-piston, minimum wheel 17 in'},
 {id:'z32-brembo-gt6',name:'Brembo GT 6-piston, 355 mm (1M3.8053A)',donor:'Brembo',rotor:355,rotorR:296,cal:32,pot:'6pot',calCol:0xc2202a,mass:2,shells:['z32'],label:'V',src:'M-13 Z32 §3: 355 x 32 mm, 6-piston monobloc, minimum wheel 18 in'},
 {id:'z32-stoptech-st60',name:'StopTech ST-60 6-piston, 355 mm (83.642.6700)',donor:'StopTech',rotor:355,rotorR:296,cal:30,pot:'6pot',calCol:0xc2202a,mass:2,shells:['z32'],label:'V',src:'M-13 Z32 §3: 355 x 32 mm, 6-piston, minimum wheel 18 in (colour: the buyer\'s choice, drawn red: DESIGN)'}
);
const Wh=(id,o)=>Object.assign({id},o);
LIB.wheel.push(
 Wh('z32-tt-16',{name:'300ZX Twin Turbo alloy',donor:'Nissan 300ZX Z32',style:'z32',dia:16,width:7.5,et:24,pcd:'5x114.3',bore:66.1,tw:225,ar:50,label:'V/E'})   // ET E
);
LIB.aeroR.push(
 {id:'z32wing',name:'Factory rear wing — Version S pedestal (1994+)',donor:'Nissan Fairlady Z Version S',mass:3,drag:.03,shells:['z32'],kit:'z32-versions',mount:'addon',onBumper:null,label:'V',src:'SPEC-AERO §2.3; Z32D.wing (file line 4102) + z32Wing header (line 4238)'}
);
LIB.aeroR.push(
 {id:'gsxwing',name:'Factory GSX pedestal spoiler',donor:'Mitsubishi Eclipse GSX',mass:4,drag:.03,shells:['eclipse'],bodyOnly:'hatch',mount:'addon',onBumper:null,label:'V',src:'SPEC-ECLIPSE §§179/437/439 (span 1150 ±60, hatch-edge mount)'}
);
LIB.aerokit.push(
 {id:'z32-versions',name:'Version S package: the factory rear wing',token:'Version S',donor:'Nissan Fairlady Z Version S',set:{aeroR:'z32wing'},shells:['z32']},
 {id:'z32-nismo',name:'Street bundle (generic): front lip, side skirts and factory rear wing',set:{aeroF:'frontlip',skirts:'skirts',aeroR:'z32wing'},generic:1,shells:['z32']}
);
})();
if(typeof module!=='undefined')module.exports={};
