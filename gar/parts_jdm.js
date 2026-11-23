/* ===== JDM LIBRARY EXPANSION (batch 1): more Honda transverse engines, the Toyota / Nissan engines and gearboxes of the rear-drive cars that come next (AE86 first), rear diffs, wheels.
   Labels: V = VERIFIED against the source named, E = ESTIMATED (typical figure, not yet checked against a document), D = DESIGN.
   Power, torque and redline are VERIFIED unless marked; engine dimensions (len, wid, hgt, pan) and masses are ESTIMATED from the family's known records unless a source is named.
   Field meaning as parts_honda.js: len = engine depth along the car as installed, wid = across the car, hgt = pan bottom to top, pan = pan depth below the crank line.
   Sources:
   - Honda B, D, H, K engines: Wikipedia "Honda B engine" (B16B, B18C 96 spec, B20B 1998-2002), "Honda D engine" (D16Z6, ZC), "Honda H engine" (H22A JDM SiR), "Honda K engine" (K20A JDM DC5).
   - Toyota 4A-GE and 4A-GZE: Wikipedia "Toyota A engine" (gen 1 big-port 130 PS JDM gross, dry weight 123 kg; 20-valve silver top and black top; 4A-GZE gen 2).
     AE86 GT-APEX catalogue figures (130 PS / 6600, 149 N m / 5200, 940 kg, 4200 x 1625 x 1335 mm, wheelbase 2400, tread 1355 / 1345, 4.8 m turning radius, 185/70HR13): kurumaerabi.com catalogue 15268.
   - 1JZ-GTE: Wikipedia "Toyota JZ engine". SR20DET (S13): Wikipedia "Nissan SR20DET".
   - T50 and W58 ratios: Wikipedia "Toyota T transmission", "Toyota W transmission".
   - AE86 wheels 13x5.5 / 14x5.5 ET27, 4x114.3, bore 60.1, 185/70R13 and 185/60R14: tirewheelguide.com (1986 Sprinter Trueno). EK9 Type R wheel 15x6J ET50, 5x114.3: genuine-wheel listing (ebay 394313884331). ===== */
(function(){
const E=(id,o)=>Object.assign({id,orient:'trans',layout:'I',turbo:0,mechFan:0},o);
const PS=ps=>Math.round(ps*0.98632);   // the records keep hp (mechanical); PS figures are converted
LIB.engine.push(
 // Honda transverse (the EF takes these through its own kits or the generic conversions)
 E('B16B',{fam:'B',name:'B16B 1.6 L DOHC VTEC inline-4 (Civic Type R EK9)',donor:'Honda Civic EK9',len:450,wid:475,hgt:575,pan:140,mount:'HONDA-B',bell:'HONDA-B',hp:182,hpRpm:8200,tq:160,tqRpm:7500,red:8400,mass:110,cyl:4,label:'V/E',colors:{cover:0xb32420,block:0x7d8289,head:0x8c9298,intake:0x25272b,vtec:1}}),   // redline E
 E('B18C-96',{fam:'B',name:'B18C 1.8 L DOHC VTEC inline-4 (JDM Integra Type R, 96 spec)',donor:'Honda Integra DC2',len:455,wid:480,hgt:580,pan:140,mount:'HONDA-B',bell:'HONDA-B',hp:197,hpRpm:8000,tq:181,tqRpm:7500,red:8400,mass:112,cyl:4,label:'V/E',colors:{cover:0xb32420,block:0x7d8289,head:0x8c9298,intake:0x25272b,vtec:1}}),
 E('B20B',{fam:'B',name:'B20B 2.0 L DOHC inline-4 (CR-V 1998-2002)',donor:'Honda CR-V',len:455,wid:480,hgt:600,pan:145,mount:'HONDA-B',bell:'HONDA-B',hp:150,hpRpm:6300,tq:184,tqRpm:4500,red:6500,mass:118,cyl:4,label:'V/E',colors:{cover:0x1b1c1f,block:0x7d8289,head:0x8c9298,intake:0x2a2c30}}),   // taller deck than the B16/B18 (hgt E)
 E('D16Z6',{fam:'D',name:'D16Z6 1.6 L SOHC VTEC inline-4 (Civic EG Si / EX)',donor:'Honda Civic EG',len:430,wid:460,hgt:555,pan:130,mount:'HONDA-D',bell:'HONDA-D',hp:125,hpRpm:6600,tq:144,tqRpm:5200,red:7200,mass:100,cyl:4,label:'V/E',colors:{cover:0x1b1c1f,block:0x7d8289,head:0x8c9298,intake:0x2a2c30,vtec:1}}),
 E('ZC',{fam:'D',name:'ZC (D16A) 1.6 L DOHC inline-4 (JDM Civic / CR-X Si)',donor:'Honda Civic EF',len:430,wid:460,hgt:560,pan:130,mount:'HONDA-D',bell:'HONDA-D',hp:128,hpRpm:6800,tq:144,tqRpm:5700,red:7200,mass:104,cyl:4,label:'V/E',colors:{cover:0x2a2c30,block:0x7d8289,head:0x8c9298,intake:0x2a2c30}}),   // redline E
 E('H22A',{fam:'H',name:'H22A 2.2 L DOHC VTEC inline-4 (JDM Prelude SiR)',donor:'Honda Prelude',len:480,wid:540,hgt:650,pan:160,mount:'HONDA-H',bell:'HONDA-H',hp:PS(200),hpRpm:6800,tq:219,tqRpm:5500,red:7400,mass:150,cyl:4,label:'V/E',colors:{cover:0xb32420,block:0x7d8289,head:0x8c9298,intake:0x2a2c30,vtec:1}}),   // redline E (rev cut 8700-9100 per the source)
 E('K20A',{fam:'K',name:'K20A 2.0 L DOHC i-VTEC inline-4 (JDM Integra Type R DC5)',donor:'Honda Integra DC5',len:500,wid:520,hgt:640,pan:165,mount:'HONDA-K',bell:'HONDA-K',hp:217,hpRpm:8000,tq:206,tqRpm:7000,red:8400,mass:140,cyl:4,label:'V/E',colors:{cover:0xb32420,block:0x7d8289,head:0x8c9298,intake:0x1d1e21,vtec:1}}),
 // Toyota and Nissan
 E('4AGE-16V',{safeBoostPsi:10,   // v20 [E] hachiroku.com.au AE86 tuning guide: stock rods and pistons below 15 psi; a factory ECU only below 10 psi — 10 taken
  fam:'4A',name:'4A-GE 1.6 L DOHC 16-valve inline-4 (AE86 Levin / Trueno, JDM gross rating)',donor:'Toyota Corolla AE86',orient:'long',len:560,wid:560,hgt:600,pan:160,mount:'TOYOTA-4A-L',bell:'TOYOTA-4A',hp:128,hpRpm:6600,tq:149,tqRpm:5200,red:7600,mass:123,cyl:4,label:'V/E',colors:{cover:0x2d4f8e,block:0x7d8289,head:0x8c9298,intake:0x8c9298}}),   // gen 1 "blue top"; mass V
 E('4AGE-20V',{fam:'4A',name:'4A-GE 1.6 L DOHC 20-valve inline-4 "silver top" (AE101 Levin / Trueno)',donor:'Toyota Corolla AE101',len:480,wid:560,hgt:620,pan:150,mount:'TOYOTA-4A-T',bell:'TOYOTA-4A',hp:158,hpRpm:7400,tq:162,tqRpm:5200,red:7800,mass:125,cyl:4,label:'V/E',colors:{cover:0xb8bcc2,block:0x7d8289,head:0x8c9298,intake:0x8c9298}}),
 E('4AGE-BT',{fam:'4A',name:'4A-GE 1.6 L DOHC 20-valve inline-4 "black top" (AE111 Levin / Trueno)',donor:'Toyota Corolla AE111',len:480,wid:560,hgt:620,pan:150,mount:'TOYOTA-4A-T',bell:'TOYOTA-4A',hp:163,hpRpm:7800,tq:162,tqRpm:5600,red:8400,mass:125,cyl:4,label:'V/E',colors:{cover:0x1b1c1f,block:0x7d8289,head:0x8c9298,intake:0x8c9298}}),
 E('4AGZE',{sc:1,fam:'4A',name:'4A-GZE 1.6 L supercharged 16-valve inline-4 (AE92 / AE101, gen 2)',donor:'Toyota Corolla AE92',len:520,wid:560,hgt:640,pan:150,mount:'TOYOTA-4A-T',bell:'TOYOTA-4A',hp:163,hpRpm:6400,tq:208,tqRpm:4400,red:7600,mass:140,cyl:4,turbo:1,label:'V/E',colors:{cover:0xb8bcc2,block:0x7d8289,head:0x8c9298,intake:0x2a2c30}}),
 E('SR20DET',{fam:'SR',name:'SR20DET 2.0 L turbo inline-4 (Silvia S13, "red top")',donor:'Nissan Silvia S13',orient:'long',len:640,wid:620,hgt:680,pan:170,mount:'NISSAN-SR',bell:'NISSAN-SR',hp:202,hpRpm:6000,tq:275,tqRpm:4000,red:7500,mass:155,cyl:4,turbo:1,label:'V/E',colors:{cover:0xb32420,block:0x7d8289,head:0x8c9298,intake:0x2a2c30}}),   // redline E
 E('1JZGTE',{fam:'JZ',name:'1JZ-GTE 2.5 L turbo inline-6 (VVT-i, JZX100 / JZZ30)',donor:'Toyota Chaser JZX100',orient:'long',len:760,wid:620,hgt:680,pan:180,mount:'TOYOTA-JZ',bell:'TOYOTA-JZ',hp:276,hpRpm:6200,tq:379,tqRpm:2400,red:7000,mass:210,cyl:6,turbo:1,label:'V/E',colors:{cover:0x1b1c1f,block:0x7d8289,head:0x8c9298,intake:0xb8bcc2}})   // redline E
);
LIB.gearbox.push(
 {id:'T50',name:'Toyota T50 5-speed (AE86 Levin / Trueno)',donor:'Toyota Corolla AE86',kind:'trans',drives:['FR'],bell:'TOYOTA-4A',ratios:[3.587,2.022,1.384,1.000,0.861],mass:34,tunnel:250,tq:200,label:'V/E'},   // ratios V, mass / tunnel / torque rating E
 {id:'W58',name:'Toyota W58 5-speed (Supra / Soarer, non-turbo)',donor:'Toyota Supra',kind:'trans',drives:['FR'],bell:'TOYOTA-JZ',ratios:[3.285,1.894,1.275,1.000,0.783],mass:45,tunnel:290,tq:350,label:'V/E'}
);
LIB.diff.push(
 {id:'open430',name:'Open diff 4.30 (AE86 ratio)',ratio:4.30,lsd:0,mass:0,label:'E'},
 {id:'lsd430',name:'Limited-slip 4.30 (AE86 ratio)',ratio:4.30,lsd:1,mass:3,label:'E'}
);
const Wh=(id,o)=>Object.assign({id},o);
LIB.wheel.push(
 {id:'spoke6',name:'6-spoke forged'},{id:'spoke8',name:'8-spoke cast'},{id:'dish3',name:'3-piece deep dish'},   // generic styles: size, width and offset are free inputs
 Wh('ae86-13',{name:'Corolla Levin / Trueno GT steel',donor:'Toyota Corolla AE86',style:'steel',dia:13,width:5.5,et:27,pcd:'4x114.3',bore:60.1,tw:185,ar:70,label:'V'}),
 Wh('ae86-14',{name:'Corolla Levin / Trueno GT-APEX alloy',donor:'Toyota Corolla AE86',style:'dish',dia:14,width:5.5,et:27,pcd:'4x114.3',bore:60.1,tw:185,ar:60,label:'V'}),
 Wh('ek9-15',{name:'Civic Type R EK9 alloy (5-lug)',donor:'Honda Civic EK9',style:'star',dia:15,width:6,et:50,pcd:'5x114.3',bore:64.1,tw:195,ar:55,label:'V/E'})   // bore E
);
})();
if(typeof module!=='undefined')module.exports={};
// v17: the AE86's own brakes (it was borrowing the E30's 260 mm, which does not fit inside its 13-inch wheels: the shop's barrel rule needs 160 mm, a 13-inch wheel has 153).
// Front 238 x 18 vented: EBC RK336 listing for the Corolla GT-S (lpiracing.com); a second catalogue (mtecbrakes.com, AE86 1600 GT twin cam) gives 234 x 18, so ESTIMATED to +-4 mm.
// Rear 230 x 10 solid: mtecbrakes.com (single source, SECONDARY). Single-piston sliding calipers front and rear; cal 25 = the copy's barrel-check assumption (as the E30 stock).
LIB.brakes.push(
 {id:'ae86',name:'AE86 GT 238 mm vented front / 230 mm solid rear, single-piston',donor:'Toyota Corolla AE86',rotor:238,rotorR:230,cal:25,mass:0,label:'E'}
);
