/* ===== HONDA / ACURA PARTS (first donor family): real parts with the attributes that decide what they fit. Appended to LIB.
   Labels: V = VERIFIED against a source, C = CALCULATED, E = ESTIMATED (typical published figure, not yet checked against a document), D = DESIGN.
   engine (transverse): len = front-to-back depth, wid = across the car excluding the transaxle, hgt = crank-axis-to-top is NOT used; hgt is overall height from the pan bottom, pan = pan depth below the crank line.
   transaxle: across = width of the case across the car, final = final drive built into the case, bell = bolt pattern it shares with the engine block.
   Sources: EF9 SiR figures (B16A power and torque, five gear ratios, final drive 4.266, wheel 14x5.5J ET45, tyre 195/60R14): Honda Motor Co. EF9 SiR-II catalogue, honda.co.jp/auto-archive/civic/2-3door/1991/sir2_sy.html, and j-pn.co.uk.
   K-series gearbox ratios: Hybrid Racing "K-Series Transmission Guide" gear ratio chart. B16A / B18B / B18C power, torque, redline: Wikipedia "Honda B engine".
   Integra wheel sizes, offsets and bolt patterns: koleso.ee (DB/DC 1994-2001: LS/RS/GS 4x100, GS-R 4x100, Type R 5x114.3). D15 (88 Civic 1.5i, 89 hp / 112 Nm): encycarpedia.com. ===== */
(function(){
const E=(id,o)=>Object.assign({id,orient:'trans',layout:'I',turbo:0,mechFan:0},o);
LIB.engine.push(
 E('D15B',{fam:'D',name:'D15B 1.5 L SOHC inline-4 (Civic 1.5i)',donor:'Honda Civic EF',len:420,wid:450,hgt:540,pan:130,mount:'HONDA-D',bell:'HONDA-D',hp:89,hpRpm:6300,tq:112,tqRpm:4500,red:6800,mass:92,cyl:4,label:'V/E',colors:{cover:0xb7bbc1,block:0x7d8289,head:0x8c9298,intake:0x2a2c30}}),
 E('D16A6',{fam:'D',name:'D16A6 1.6 L SOHC PGM-FI inline-4 (US Civic Si)',donor:'Honda Civic EF',len:430,wid:460,hgt:550,pan:130,mount:'HONDA-D',bell:'HONDA-D',hp:108,hpRpm:6000,tq:136,tqRpm:5000,red:6700,mass:98,cyl:4,label:'E',colors:{cover:0xb7bbc1,block:0x7d8289,head:0x8c9298,intake:0x2a2c30}}),
 E('B16A',{fam:'B',name:'B16A 1.6 L DOHC VTEC inline-4 (Civic SiR EF9)',donor:'Honda Civic EF',len:450,wid:475,hgt:570,pan:140,mount:'HONDA-EF9',bell:'HONDA-B',hp:158,hpRpm:7600,tq:152,tqRpm:7000,red:8000,mass:108,cyl:4,label:'V/E',colors:{cover:0x1b1c1f,block:0x7d8289,head:0x8c9298,intake:0x25272b,vtec:1}}),
 E('B18B1',{fam:'B',name:'B18B1 1.8 L DOHC inline-4 (Integra LS / RS / GS)',donor:'Acura Integra',len:450,wid:480,hgt:570,pan:140,mount:'HONDA-B',bell:'HONDA-B',hp:140,hpRpm:6300,tq:172,tqRpm:5200,red:6800,mass:110,cyl:4,label:'V/E',colors:{cover:0x1b1c1f,block:0x7d8289,head:0x8c9298,intake:0x25272b}}),
 E('B18C1',{fam:'B',name:'B18C1 1.8 L DOHC VTEC inline-4 (Integra GS-R)',donor:'Acura Integra',len:455,wid:480,hgt:580,pan:140,mount:'HONDA-B',bell:'HONDA-B',hp:170,hpRpm:7600,tq:174,tqRpm:6200,red:8000,mass:112,cyl:4,label:'E',colors:{cover:0x15161a,block:0x7d8289,head:0x8c9298,intake:0x25272b,vtec:1}}),
 E('B18C5',{fam:'B',name:'B18C5 1.8 L DOHC VTEC inline-4 (Integra Type R)',donor:'Acura Integra',len:455,wid:480,hgt:580,pan:140,mount:'HONDA-B',bell:'HONDA-B',hp:195,hpRpm:8000,tq:176,tqRpm:7500,red:8400,mass:112,cyl:4,label:'E',colors:{cover:0xb32420,block:0x7d8289,head:0x8c9298,intake:0x25272b,vtec:1}}),
 E('K20A2',{fam:'K',name:'K20A2 2.0 L DOHC i-VTEC inline-4 (Acura RSX Type-S)',donor:'Acura RSX',len:500,wid:520,hgt:640,pan:165,mount:'HONDA-K',bell:'HONDA-K',hp:200,hpRpm:7400,tq:193,tqRpm:6000,red:8000,mass:140,cyl:4,label:'E',colors:{cover:0xb32420,block:0x7d8289,head:0x8c9298,intake:0x1d1e21,vtec:1}}),
 E('K24A2',{fam:'K',name:'K24A2 2.4 L DOHC i-VTEC inline-4 (Acura TSX)',donor:'Acura TSX',len:505,wid:520,hgt:650,pan:170,mount:'HONDA-K',bell:'HONDA-K',hp:200,hpRpm:6800,tq:225,tqRpm:4500,red:7100,mass:146,cyl:4,label:'E',colors:{cover:0x1b1c1f,block:0x7d8289,head:0x8c9298,intake:0x1d1e21,vtec:1}})
);
const T=(id,o)=>Object.assign({id,kind:'transaxle',drives:['FF']},o);
LIB.gearbox.push(
 T('D-5MT',{name:'Honda D-series 5-speed (Civic Si)',donor:'Honda Civic EF',bell:'HONDA-D',ratios:[3.25,1.9,1.25,0.91,0.71],final:4.11,mass:36,tq:170,across:250,label:'E'}),
 T('EF9-5MT',{name:'Honda B16A 5-speed (Civic SiR EF9)',donor:'Honda Civic EF',bell:'HONDA-B',ratios:[3.166,2.052,1.416,1.103,0.870],final:4.266,mass:38,tq:200,across:260,label:'V'}),
 T('Y21',{name:'Honda Y21 5-speed (Integra GS-R)',donor:'Acura Integra',bell:'HONDA-B',ratios:[3.23,2.105,1.458,1.107,0.848],final:4.4,mass:40,tq:220,across:260,label:'E'}),
 T('K-X2M5',{name:'Honda X2M5 6-speed (Acura RSX Type-S)',donor:'Acura RSX',bell:'HONDA-K',ratios:[3.266,2.13,1.517,1.147,0.921,0.738],final:4.388,mass:48,tq:260,across:280,label:'V/E'}),
 T('K-ASU5',{name:'Honda ASU5 6-speed (Acura TSX)',donor:'Acura TSX',bell:'HONDA-K',ratios:[3.266,1.88,1.354,1.027,0.825,0.659],final:4.764,mass:48,tq:290,across:280,label:'V/E'}),
 T('K-Y2M3',{name:'Honda Y2M3 6-speed (Integra Type-R DC5)',donor:'Acura RSX',bell:'HONDA-K',ratios:[3.266,2.13,1.517,1.212,0.972,0.78],final:4.764,mass:49,tq:260,across:280,label:'V/E'})
);
LIB.swapkit.push(
 {id:'kit-ef-b',name:'B-series swap (Integra B16 / B18 mounts, axles, hydraulic clutch conversion, shifter cables, wiring)',accepts:['HONDA-B'],adapts:[],tunnel:0,relief:{hgt:0,wid:0,pan:0,len:0},mass:7,label:'D',shells:['ef']},
 {id:'kit-ef-k',name:'K-series swap (K20 / K24 mounts and subframe brackets, axles, shifter cables, wiring, low-profile pan)',accepts:['HONDA-K'],adapts:[],tunnel:0,relief:{hgt:60,wid:20,pan:10,len:40},place:{dx:.5,dy:-1.5,panCut:30},mass:11,label:'D',shells:['ef']}   // D: the mounts sit the engine 10 mm forward (the down pipe clears the rack, the half-shafts stay inside their joint angles at full lock) and 30 mm lower, and the pan is 30 mm shallower: relief values CALCULATED from that placement (ef_collision.js)
);
LIB.diff.push({id:'integral',name:'Built into the transaxle',ratio:1,lsd:0,mass:0,internal:1});
LIB.seats.push(
 {id:'ef-si',name:'Civic EF Si / SiR front seats',donor:'Honda Civic EF',mass:13,label:'E',look:{cush:0x34373d,bol:0x2a2c31,bolH:1.5,back:22,hw:9,head:'post'}},
 {id:'delsol-si',name:'Civic del Sol Si front seats',donor:'Honda Civic del Sol',mass:12,label:'E',look:{cush:0x2d2f34,bol:0x24262a,bolH:1.8,back:20,hw:9,head:'post'}},
 {id:'dc2-gsr',name:'Integra GS-R front seats',donor:'Acura Integra',mass:14,label:'E',look:{cush:0x2a2c31,bol:0x3a3d44,bolH:2.0,back:23,hw:9.5,head:'post'}},
 {id:'dc2-itr',name:'Integra Type R front seats (red cloth, fixed headrest)',donor:'Acura Integra',mass:11,label:'E',look:{cush:0xa32820,bol:0x1a1b1e,bolH:2.4,back:24,hw:9,head:'integral'}}
);
LIB.steering.push(
 {id:'honda-ef',name:'Civic EF 3-spoke 360 mm',donor:'Honda Civic EF',dia:360,mass:1.1,label:'E'},
 {id:'honda-itr',name:'Integra Type R leather 3-spoke 365 mm',donor:'Acura Integra',dia:365,mass:1.2,label:'E'}
);
LIB.brakes.push(
 {id:'ef9',name:'EF9 SiR 240 mm front vented, single-piston',donor:'Honda Civic EF',rotor:240,cal:25,mass:0,label:'V/E'},
 {id:'integra262',name:'Integra GS-R 262 mm vented, single-piston',donor:'Acura Integra',rotor:262,cal:26,mass:2,label:'E'}
);
/* wheel sets: size, offset, bolt pattern and centre bore are fixed; the style is the look. tw = tyre width of the original tyre. */
const Wh=(id,o)=>Object.assign({id},o);
LIB.wheel.push(
 Wh('ef9-14',{name:'Civic EF9 SiR alloy',donor:'Honda Civic EF',style:'star',dia:14,width:5.5,et:45,pcd:'4x100',bore:56.1,tw:195,ar:60,label:'V'}),
 Wh('ef-dx-13',{name:'Civic DX pressed steel',donor:'Honda Civic EF',style:'steel',dia:13,width:5,et:45,pcd:'4x100',bore:56.1,tw:165,ar:70,label:'V/E'}),
 Wh('dc2-ls-14',{name:'Integra LS / RS alloy',donor:'Acura Integra',style:'dish',dia:14,width:5.5,et:45,pcd:'4x100',bore:56.1,tw:195,ar:60,label:'V'}),
 Wh('dc2-gsr-15',{name:'Integra GS-R alloy',donor:'Acura Integra',style:'split',dia:15,width:6,et:45,pcd:'4x100',bore:56.1,tw:195,ar:55,label:'V'}),
 Wh('dc2-itr-15',{name:'Integra Type R alloy (5-lug)',donor:'Acura Integra',style:'mesh',dia:15,width:6,et:50,pcd:'5x114.3',bore:64.1,tw:195,ar:55,label:'V'}),
 Wh('e30-14',{name:'E30 325i bottlecap alloy',donor:'BMW E30',style:'bottlecap',dia:14,width:6,et:35,pcd:'4x100',bore:57.1,tw:195,ar:60,label:'V/E'})
);
})();
