/* ===== DSM / MITSUBISHI LIBRARY (Eclipse 2G GSX, 1997-1999 2Gb): the 4G63T,
   W5M33 AWD transaxle, w5m33 final drive, Eclipse brakes and wheels.
   Labels: V = VERIFIED, C = CALCULATED, E = ESTIMATED, D = DESIGN,
   SECONDARY = single-source lead, PROVISIONAL = working value depending on an
   OPEN item (SPEC-ECLIPSE.md section 9). Field meaning as parts_honda.js. ===== */
(function(){
const E=(id,o)=>Object.assign({id,orient:'trans',layout:'I',turbo:0,mechFan:0},o);
LIB.engine.push(
 E('4G63T',{safeBoostPsi:20,   // TURBO-02 [E]: the stock 2G 7-bolt bottom end and composite head gasket; dsmtuners.com (max boost on stock internals: "the 20 psi range is where most start blowing the stock composite headgasket", "max of 23 psi"; stock motor boost limits: "about 400-500hp before it's about dead"). The 450 cc injectors stop it first (14-15 psi, fit.js)
 fam:'4G',name:'4G63T 2.0 L DOHC 16-valve turbo inline-4 (Eclipse GSX)',donor:'Mitsubishi Eclipse GSX',len:460,wid:500,hgt:600,pan:150,mount:'MITSUBISHI-4G',bell:'MITSUBISHI-4G',hp:210,hpRpm:6000,tq:290,tqRpm:3000,red:7000,mass:150,cyl:4,turbo:1,label:'V/D',colors:{cover:0x8c9298,block:0x3a3d42,head:0x8c9298,intake:0x6b6f76}})
   // V: 210 hp @ 6000, 214 lb-ft = 290 Nm @ 3000, redline 7000. Dims DESIGN (transverse 4-cyl family + iron block + turbo; OPEN-BAY refines). Stock turbo Garrett T25 (SECONDARY); side-mount intercooler. NOT TD05H-14B (1G stock), NOT TD05H-16G (upgrade, never stock).
);
const T=(id,o)=>Object.assign({id,kind:'transaxle',drives:['AWD']},o);
LIB.gearbox.push(
 T('W5M33',{name:'Mitsubishi W5M33 5-speed AWD transaxle (Eclipse GSX)',donor:'Mitsubishi Eclipse GSX',bell:'MITSUBISHI-4G',ratios:[3.083,1.684,1.115,0.833,0.666],final:4.929,mass:45,tq:290,across:280,tunnel:220,label:'V/PROVISIONAL'})
   // ratios V (GEARS Magazine Apr 2001, W5M33 row). final 4.929 PROVISIONAL (OPEN-FD candidate A: 3.866 x 1.275 = 4.92915); candidate B 4.85 (carspecs, single aggregator, no breakdown) recorded in the diff entry, NEVER averaged, NEVER the FWD 4.529. mass/tq/across/tunnel DESIGN.
);
LIB.diff.push(
 {id:'w5m33',name:'W5M33 AWD final drive (provisional 4.929)',ratio:4.929,lsd:0,mass:0,label:'E/PROVISIONAL',
  primary:1.275,frontDiff:3.866,transfer:1.090,rearDiff:3.547,frontOverall:4.929,rearOverall:4.929}
   // Corrected rear-drive path (verifier R1 MAJOR-2, R2 verified): the copy's live FINAL comes from the gearbox entry (applyDrive: FINAL = gb.final || df.ratio); this entry carries the AWD hardware breakdown. rearDiff DERIVED 3.866/1.090 = 3.5468, PROVISIONAL with the final drive; DSM lore 3.545 is a cross-check only. frontOverall 1.275 x 3.866 = 4.9291; rearOverall 1.275 x 1.090 x 3.547 = 4.9291 — an AWD car requires them equal. Rear driveshaft rotates x final (4.929 PROVISIONAL), NOT x 3.866 (which would run the rear wheels ~21% slow). lsd: 0 because OPEN-LSD is UNWIRED (Cars&Bids says standard, Alchetron says option) — the stock block must NOT assert LSD until OPEN-LSD settles.
);
LIB.brakes.push(
 {id:'eclipse',name:'Eclipse GSX 276 mm front vented / 262 mm solid rear, single-piston',donor:'Mitsubishi Eclipse GSX',rotor:276,rotorR:262,cal:30,mass:0,label:'V'},
   // SOURCED (StopTech + EBC + DBA + spec page agree): front 276x24 vented, rear 262x10 solid. rotor = FRONT (the copy's barrel check uses br.rotor/2 + br.cal + 5); rotorR = REAR, read by the Eclipse module's rear-rotor-aware wheel builder (276 mm must never be drawn at the rear). cal 30 = ADOPTED check assumption (spec section 3b); OPEN-CAL refines the caliper FORM. Barrel check (spec figures): front need 138+30+5 = 173 <= 190 (17-in) / 178 (16-in), margins 17/5 mm; rear need 131+30+5 = 166 <= 190/178, margins 24/12 mm. Copy formula (barrel = dia*12.7-12) gives 203.9 / 191.2 — looser; the check passes under BOTH. NOT Wilwood 309.6 mm (aftermarket), NOT the single 284 mm rear listing (unconfirmed).
 // real big brake kits (C-10; board/done/M-13-eclipse.md section 3). cal: ADOPTED so the shop's barrel rule refuses the 16-inch wheel and passes the
 // 17-inch, as both sources say. mass: per corner over stock, ESTIMATED. No maker lettering is drawn.
 {id:'eclipse-stoptech-st40',name:'StopTech ST-40 4-piston, 328 mm (83.618.4300)',donor:'StopTech',rotor:328,rotorR:262,cal:30,pot:'4pot',calCol:0xc2202a,mass:1.5,shells:['eclipse'],label:'V',src:'M-13 Eclipse §3: 328 x 28 mm, 4-piston, front only, minimum wheel 17 in (StopTech); colour the buyer\'s choice, drawn red: DESIGN'},
 {id:'eclipse-evo-brembo',name:'Evo 8/9 Brembo swap: 4-piston 320 mm front, 2-piston 300 mm rear',donor:'Mitsubishi Lancer Evolution VIII/IX',rotor:320,rotorR:300,cal:30,pot:'4pot',potR:'stock',calCol:0xc2202a,calColR:0xc2202a,mass:2,shells:['eclipse'],label:'V/E',src:'M-13 Eclipse §3: front 320 x 32 mm Brembo 4-piston, rear 300 x 20 mm Brembo 2-piston; front calipers need conversion brackets (160 vs 130 mm mount); minimum wheel 17 in from the install write-up (ESTIMATED: spoke shape governs); colour DESIGN'}
);
const Wh=(id,o)=>Object.assign({id},o);
LIB.wheel.push(
 Wh('eclipse-17',{name:'Eclipse GSX 17-in 5-pair split-spoke alloy',donor:'Mitsubishi Eclipse GSX',style:'split5',dia:17,width:6.5,et:46,pcd:'5x114.3',bore:67.1,tw:215,ar:50,label:'V/OPEN-WHL'}),
   // Tyre P215/50VR17 VERIFIED (carspecs 1999 GSX manual). ET 46 SECONDARY. Width 6.5 DESIGN pending OPEN-WHL (candidates [6.5,7] unsourced; firmed by a wheel-weight listing naming the 1997 GSX cast wheel 17x6.5 — not catalogue-grade, so OPEN-WHL stays OPEN). Face 'split5': five split pairs = 10 spokes (photo-derived); the ringPatternP branch renders it (never a generic face labelled GSX stock). NOT a 3G/4G 17x7.5.
 Wh('eclipse-16',{name:'Eclipse GSX 16-in alloy (2Ga, 1995-96)',donor:'Mitsubishi Eclipse GSX',style:'spoke5',dia:16,width:6.5,et:46,pcd:'5x114.3',bore:67.1,tw:215,ar:55,label:'E/2GA-ONLY'})
   // 2Ga OPTION ROW ONLY (manual 215/55R16; automatic 205/55R16). NEVER stock for this 2Gb build; exists so a 2Ga re-issue does not have to re-derive it.
);
})();
