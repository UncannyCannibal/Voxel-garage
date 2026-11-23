/* ===== TOYOTA 2000GT LIBRARY (early MF10, 1967-1968): the 3M inline-6,
   5-speed manual, LSD final drive, brakes, centre-lock wheels.
   Labels: V = VERIFIED, C = CALCULATED, E = ESTIMATED, D = DESIGN,
   SECONDARY = single-source lead, PROVISIONAL = working value depending on
   an OPEN item (SPEC-GT2000.md section 9). Field meaning as parts_honda.js.
   CENTRE-LOCK RULE: the factory wheel has NO bolt circle — no pcd, no bore
   on either the shell or the wheel row. The copy's PCD check compares
   shell-vs-wheel pcd, so a one-sided pcd (or null on one side, null !==
   undefined) BLOCKs stock fitment. Both sides omit pcd entirely. ===== */
(function(){
const E=(id,o)=>Object.assign({id,orient:'long',layout:'I',turbo:0,mechFan:0},o);
LIB.engine.push(
 E('3M',{fam:'3M',name:'Toyota 3M 2.0 L DOHC inline-6 (2000GT)',donor:'Toyota 2000GT',len:700,wid:560,hgt:600,pan:160,mount:'TOYOTA-3M',bell:'TOYOTA-3M',hp:150,hpRpm:6600,tq:176,tqRpm:5000,red:7000,mass:170,cyl:6,label:'V/D/SECONDARY',colors:{cover:0x8c9298,block:0x3a3d42,head:0x8c9298,intake:0x6b6f76}})
   // V: 150 PS @ 6600, 176 Nm @ 5000, triple Mikuni-Solex 40 PHH, 1988 cc 75x75. Dims/mass DESIGN (OPEN-BAY refines). Redline 7000 SECONDARY (tach display scale only until OPEN-2). layout:'I' EXPLICIT: Z32's setEngine defaults layout:'V'; a straight-six drawn as a V is a wrong engine, not a simplification. mechFan helper default 0 (falsy — no mech fan drawn; the fan arrangement is OPEN-BAY, not a claim). turbo 0: the 3M is naturally aspirated.
);
LIB.gearbox.push(
 {id:'gt2000-5mt',name:'Toyota 2000GT 5-speed manual (MF10)',donor:'Toyota 2000GT',kind:'trans',drives:['FR'],bell:'TOYOTA-3M',ratios:[3.145,1.636,1.179,1.000,0.844],mass:40,tunnel:250,label:'SECONDARY/D'}
   // Ratios SECONDARY. NO final field (T50 pattern): the live FINAL comes from the diff (4.375 SECONDARY standard). Reverse ratio OPEN-3 — no field, never another car's ratio. Two optional finals OPEN-4, values unknown, never guessed from 4.375. mass/tunnel DESIGN. tq rating OMITTED: the gearbox-torque WARN fires only when gb.tq AND eng.tq both present.
);
LIB.diff.push(
 {id:'gt2000-lsd',name:'Toyota 2000GT limited-slip differential 4.375 (standard)',ratio:4.375,lsd:1,mass:3,label:'SECONDARY/V'}
   // Ratio 4.375 SECONDARY standard (OPEN-4: two optional finals unknown). lsd:1 VERIFIED standard. HONEST LIMIT: the copy consumes lsd in exactly ONE place (the shop display string), NOT applyDrive — this is NOT a functional LSD claim.
);
LIB.brakes.push(
 {id:'gt2000',name:'Toyota 2000GT servo-assisted discs 279 mm front / 267 mm rear',donor:'Toyota 2000GT',rotor:279,rotorR:267,cal:30,mass:0,label:'SECONDARY'}
   // Sizes SECONDARY (OPEN-6). Disc/disc type VERIFIED. cal 30 ADOPTED check-only. Barrel check under the COPY formula (barrel = dia*12.7-12 = 178.5): front need 139.5+30+5 = 174.5, margin 4.0 mm — thin, re-run if OPEN-6 revises a rotor, never shrink a rotor to fit. The copy's barrel check uses the FRONT rotor only; the rear (need 133.5+30+5 = 168.5, margin 10.0 mm) is covered by the module's rear-rotor-aware wheel builder (Eclipse pattern). Caliper FORM unseen (hidden behind solid-face wheels) — no caliper detail modelled until a source shows one.
);
const Wh=(id,o)=>Object.assign({id},o);
LIB.wheel.push(
 Wh('gt2000-15',{name:'Toyota 2000GT 15x5 cast magnesium centre-lock wheel',donor:'Toyota 2000GT',style:'gt2000-15',dia:15,width:5,et:null,tw:165,ar:80,label:'V/OPEN-5'})
   // Tyre 165HR15 front+rear VERIFIED period stock. 15x5 VERIFIED. Centre-lock: NO pcd, NO bore (see header rule). et:null OPEN-5 (centre-lock specified by backspacing, not offset; null never a string). ar 80 DERIVED period-aspect convention. Face form PHOTO-CONFIRMED: black face, 8 elongated slots in a ring, polished rim lip, single large chrome knock-off nut marked 'TOYOTA' + 'UNDO' + side, handed threads, 5 small hub bolts around the nut. The face builder is the module's work — NEVER a bolted face, the knock-off nut is a new mesh, never a bolt circle. BARRED AS STOCK: 205/60R15, wire wheels, any bolted-pattern variant. No stock-tyre wheel photo exists in the measurement set. Shop display wart: the wheel row reads 'ETnull' until OPEN-5 closes — display only, not a fitment defect. NOTE: 'gt2000-15' is NOT a ringPatternP branch — the module builds this face itself (gt2000Wheel); any buildRimP call with this style would fall through to the generic 8-hole pattern and must never be used for this car.
);
})();
