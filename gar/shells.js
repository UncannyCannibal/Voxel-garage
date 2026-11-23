/* ===== SHELL RECORDS: what a car body offers to the parts bolted onto it. Pure data; every number carries a label (V/C/E/D). =====
   layout: drive layout of the shell ('FR' front engine rear drive, 'FF', 'MR', 'RR', 'AWD'); engineOrient: 'long' | 'trans'.
   hub: pcd, hubFaceZ (mm from the centreline to the hub face = half the front track + stock ET), stockET, stockOD (tyre rolling diameter), stock wheel.
   arch/fender/strut: the clearances the wheel and drop rules use. bay/tunnelWid/mountPatterns/bellPatterns: the factory engine bay and what bolts into it.
   removables: body and trim items that can be taken off for weight (mass kg, share of that mass the front axle carries, 0..1.2). */
function defaultRemovables(curb,hatch){   // E: used when a shell has no weighed figures yet (fractions of curb mass from typical small-car teardown weights)
  const f=x=>Math.round(curb*x*10)/10;
  return {
    bumperF:{name:'Front bumper and absorber',mass:f(.0055),front:1.2,label:'E'},
    bumperR:{name:'Rear bumper and absorber',mass:f(.0050),front:-.2,label:'E'},
    doorCards:{name:'Door cards, handles and winders',mass:f(.0085),front:.55,label:'E'},
    rearSeat:{name:'Rear seat',mass:f(.0115),front:.1,label:'E'},
    passengerSeat:{name:'Passenger seat and its rails',mass:f(.0155),front:.55,label:'E'},
    carpet:{name:'Carpet and sound deadening',mass:f(.019),front:.45,label:'E'},
    spare:{name:'Spare wheel and jack',mass:f(.012),front:0,label:'E'},
    ac:{name:'Air conditioning (if fitted) and heater core',mass:f(.012),front:.75,label:'E'},
    glass:{name:'Replace side and rear glass with polycarbonate',mass:f(.0095),front:.4,label:'E',swap:1}
  };
}
const SHELLS={};
SHELLS.e30={
  id:'e30',name:'BMW E30 325i coupe',short:'E30',years:'1982-1994',body:'coupe',layout:'FR',engineOrient:'long',drives:['FR'],
  baseMass:1275,            // V: 2811 lb (1275 kg) for the 325i 2-door, all years (bmwfaq.org, data from bmwcoches.com). Sources disagree: 1145 kg (auto-data.net, 1982-86 automatic), 1255 kg (carsales, convertible)
  wheelbase:2570,           // V: auto-data.net
  stockOD:590,              // C: 195/60R14 = 14*25.4 + 2*0.60*195
  stockDragCdA:0.62*1.85,   // E
  hubFaceZ:738,             // C: hub face to the car's centreline = half the front track 1407 mm (auto-data.net, VERIFIED) + the stock ET35 (bimmertips: 14x6 ET35)
  hubFaceZR:742.5,          // C: half the REAR track 1415 mm (V: e30zone wiki, auto-data.net E30 325i coupe: 1407 / 1415) + the stock ET35
  pcd:'4x100',              // V: E30 4-lug
  wheelDia:[14,15,16,17,18,19],wheelWid:[6,7,7.5,8,8.5,9,9.5,10,11],   // D: sizes the wheel controls offer
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
  airDamBottom:245,         // C: the 1988-91 chin spoiler's bottom edge, 245 mm (the-blueprints.com 1990 coupe drawing, MEASURED)
  sillBottom:226,           // C: rocker bottom (1987 drawing, MEASURED)
  rear:'notch',             // trunk lid (what rear spoilers bolt to)
  stockFrontWeight:0.53,    // V: 53/47 front/rear (bmwfaq.org; strictlyeta.net)
  wdist:{engine:.6,gearbox:.15,seats:.45,aero:.5,exhaust:.1},   // E: share of a part's mass the front axle carries
  stock:{engine:'M20B25',turbo:'none',gearbox:'G260',diff:'open373',exhaust:'stock',seats:'stock',shifter:'stock',steering:'stock',suspension:'stock',brakes:'stock',wheel:{style:'bottlecap',dia:14,width:6,et:35,pcd:'4x100'}},
  rearSeatDeleteBy:['rollbar','cage','cage10'],
  notBuilt:{turbo:['gt2560r','gt2860rs','gt3582r','stock-t25-4g63t','stock-ct12b-2jzgte','stock-t25-vg30dett','stock-t28-rb26dett','stock-turbo-sr20det','stock-turbo-1jzgte','rb26-twin-t28','vg30-twin-t25']},   // SPEC-TURBO §4 item 11: all fittable turbo ids — the slot is 'later' until this car's bay model lands (OPEN-11)
  removables:null           // filled below from defaultRemovables
};
SHELLS.e30.removables=defaultRemovables(SHELLS.e30.baseMass);
SHELLS.e30.hubBore=57.1;   // V: BMW E30 hub spigot 57.1 mm (published wheel-fitment data)
SHELLS.e30.rear='notch';
// the Touring (1988-94): the coupe's chassis, running gear and bay (BMW Group Classic; e30zone.net: the estate shares the saloon's floor and front end) with the
// five-door body. About 80 kg heavier than the saloon (unixnerd.co.uk); the extra mass sits mostly over the rear axle (C: the coupe's front axle load plus 10 kg).
// family: parts listed for the E30 fit it too, unless they bolt to the trunk lid (rear 'hatch' blocks those) or the shell refuses them
SHELLS.e30t=Object.assign(JSON.parse(JSON.stringify(SHELLS.e30)),{id:'e30t',family:'e30',name:'BMW E30 325i Touring',short:'E30 Touring',years:'1988-1994',body:'estate',
  baseMass:1355,stockFrontWeight:0.51,rear:'hatch',
  refuse:{aeroR:{gtwing:'A GT wing\'s uprights bolt through a trunk lid; the Touring\'s tailgate is mostly glass, with nothing under it to carry them.'}}});
SHELLS.e30t.removables=defaultRemovables(SHELLS.e30t.baseMass);
SHELLS.ef={
  id:'ef',name:'Honda Civic EF hatchback (SiR)',short:'EF Civic',years:'1988-1991',body:'hatchback',rear:'hatch',layout:'FF',engineOrient:'trans',drives:['FF'],
  baseMass:1010,            // V: 1,010 kg base, power steering (Honda EF9 SiR-II catalogue; j-pn.co.uk lists 990 kg for the same car, other sources 1,040-1,050 with options)
  wheelbase:2500,           // V: Honda catalogue
  stockOD:590,              // C: 195/60R14 = 14*25.4 + 2*0.60*195 (V: 195/60R14 85H per catalogue)
  stockDragCdA:0.34*1.78,   // E: Cd about 0.34, frontal area about 1.78 m2
  hubFaceZ:765,             // C: half the front track 1440 mm (V, Honda catalogue) + the stock ET45 (V, j-pn.co.uk)
  pcd:'4x100',hubBore:56.1, // V: Honda 4x100; centre bore 56.1 mm (koleso.ee, Integra / Civic family)
  wheelDia:[13,14,15,16,17,18],wheelWid:[5,5.5,6,6.5,7,7.5,8,8.5,9,9.5,10],stockET:45,
  archTop:676,hubY:280,     // C: front arch circle centre 300 mm + radius 376 mm (MEASURED on the Honda drawing); the hub sits 280 mm up in the body (loaded radius of the stock tyre), a taller tyre grows both ways
  archGapMin:52,archGapPerPoke:0.2,   // C: ef_collision arch sweep (185-225 tyres, ET20-45, 0-80 mm drop, 34 deg lock, 20 mm bump): every gap of 56 mm or more passes, every gap of 47 mm or less hits the arch
  fenderOuter:837,          // C: body half-width at the front arch lip (ef_body.js plan x section)
  strutInner:615,           // C: front damper tube's outer edge 588 mm at rest plus the full-lock sweep, rear tube 612 mm at the tyre top; the inner tyre face must stay outboard of 615 mm
  bay:{len:520,wid:820,hgt:585,pan:190},   // C from the modelled bay (ef_collision.js): len = (steering rack front face 971 mm - engine centre 730 mm) / 0.46 (drawn exhaust-side depth per mm of record length); wid = 2 x 420 mm wheelhouse walls less 10 mm a side; hgt = (hood underside 727 - crank 340) / 0.87 + a 140 mm pan; pan = crank 340 - ground clearance 150
  tunnelWid:150,
  bellPatterns:['HONDA-B'],mountPatterns:['HONDA-D','HONDA-EF9'],   // factory engines: D-series mounts (D15, D16) and the EF9's own B16A mounts
  bumperTipMax:90,airDamBottom:186,   // C: front bumper side lips 186 mm off the ground (MEASURED)
  sillBottom:180,           // C: rocker bottom (MEASURED side view)
  stockFrontWeight:0.62,    // E: typical for a front-drive compact
  wdist:{engine:.85,gearbox:.9,seats:.45,aero:.5,exhaust:.15},   // E
  stock:{engine:'B16A',turbo:'none',gearbox:'EF9-5MT',diff:'integral',exhaust:'stock',seats:'ef-si',shifter:'stock',steering:'honda-ef',suspension:'stock',brakes:'ef9',wheel:{style:'star',dia:14,width:5.5,et:45,pcd:'4x100',bore:56.1,tw:195,ar:60}},
  rearSeatDeleteBy:['rollbar','cage','cage10'],
  notBuilt:{frame:['strutbar','rollbar','cage','cage10'],turbo:['gt2560r','gt2860rs','gt3582r','stock-t25-4g63t','stock-ct12b-2jzgte','stock-t25-vg30dett','stock-t28-rb26dett','stock-turbo-sr20det','stock-turbo-1jzgte','rb26-twin-t28','vg30-twin-t25']},   // parts this shell has no model for yet: listed, not selectable (turbo: SPEC-TURBO §4 item 11, OPEN-11)
  removables:null
};
SHELLS.ef.removables=defaultRemovables(SHELLS.ef.baseMass);
SHELLS.z32={
  id:'z32',name:'Nissan Fairlady Z (Z32) Twin Turbo',short:'Z32',years:'1989-2000',body:'hatchback',rear:'hatch',layout:'FR',engineOrient:'long',drives:['FR'],
  baseMass:1550,            // V: 1,550 kg, E-CZ32 300ZX Twin Turbo 2-seater (carfromjapan catalogue); the Motor Trend US twin-turbo test car weighed 3,414 lb (1,549 kg)
  wheelbase:2450,           // V: Nissan Heritage / carfromjapan (96.5 in)
  stockOD:631,              // C: 225/50R16 = 16*25.4 + 2*0.50*225 (V: 225/50R16 per catalogue)
  stockDragCdA:0.31*1.80,   // E: Cd about 0.31, frontal area about 1.8 m2
  hubFaceZ:772,             // C: half the front track 1495 mm (V, Nissan Heritage) + the stock ET24 (wheel-sizes.com, E)
  hubFaceZR:791.5,          // C: half the REAR track 1535 mm (V: Nissan Heritage; carsales.com.au 1990 300ZX 2-seater listing, 1495 / 1535) + the stock ET24
  pcd:'5x114.3',hubBore:66.1,   // V: wheel-sizes.com (Nissan 5x114.3, centre bore 66.1 mm)
  wheelDia:[16,17,18,19],wheelWid:[7,7.5,8,8.5,9,9.5,10,10.5],stockET:24,
  archTop:673,hubY:305,     // C: arch circle centre 323 mm + radius 350 mm (MEASURED on the drawing); the hub 305 mm up (loaded radius of the stock tyre)
  archGapMin:52,archGapPerPoke:0.2,   // E: the EF's collision-fitted figures until the Z32's own sweep is run
  fenderOuter:905,          // C: body half-width at the front arch lip (z32_body.js plan and section)
  strutInner:615,           // C: the front coil's outer edge 602 mm from the centreline at rest, plus margin: the inner tyre face must stay outboard of 615 mm
  bay:{len:800,wid:900,hgt:680,pan:200},   // C from the modelled bay: the firewall to the cross-member and fan (len); between the towers' inner aprons (2 x 470 mm) less 20 mm a side (wid); the hood's underside over the engine less the crank height 320 mm plus a 170 mm pan (hgt); crank 320 less 120 mm clearance (pan)
  tunnelWid:360,            // E: transmission tunnel 400 mm wide at the floor (z32_body.js), the gearbox case 330
  bellPatterns:['NISSAN-VG'],mountPatterns:['NISSAN-VG'],   // factory engines: VG30DE and VG30DETT
  bumperTipMax:110,airDamBottom:131,   // C: the front bumper's bottom edge 131 mm (MEASURED side view)
  sillBottom:120,           // C: rocker bottom (MEASURED side view)
  stockFrontWeight:0.56,    // E: about 56 / 44 for the twin-turbo 2-seater
  wdist:{engine:.75,gearbox:.35,seats:.3,aero:.5,exhaust:.1},   // E
  stock:{tyre:'summer',engine:'VG30DETT',turbo:'stock-t25-vg30dett',gearbox:'Z32-5MT',diff:'lsd369',exhaust:'z32-quad',seats:'z32-stock',shifter:'stock',steering:'z32-stock',suspension:'stock',brakes:'z32-tt',aeroR:'z32wing',wheel:{style:'z32',dia:16,width:7.5,et:24,pcd:'5x114.3',bore:66.1,tw:225,ar:50}},
  rearSeatDeleteBy:[],
  notBuilt:{frame:['strutbar','rollbar','cage','cage10'],aeroR:['hatchspoiler','ducktail','trunklip'],aerokit:['streethatch','street'],turbo:['gt2560r','gt2860rs','gt3582r','stock-t25-4g63t','stock-ct12b-2jzgte','stock-t28-rb26dett','stock-turbo-sr20det','stock-turbo-1jzgte','rb26-twin-t28','vg30-twin-t25']},   // SPEC-TURBO §4 item 11 (OPEN-11); the Z32's own stock record (stock-t25-vg30dett) is NOT listed — it is the fitted default (§5 exempt)
  refuse:{exhaust:{side:'The Z32\'s sills sit 120 mm off the ground: a side exit would have to be cut through the sill (there is no room under it and still 100 mm of ground clearance).'}},
  removables:null
};
SHELLS.z32.removables=defaultRemovables(SHELLS.z32.baseMass);delete SHELLS.z32.removables.rearSeat;   // a 2-seater: no rear seat to take out
/* ---- SHELLS.ae86 (builder lane 2: from ae86-draft.js, spec §3b) ---- */
SHELLS.ae86={  id:'ae86',name:'Toyota Sprinter Trueno AE86',short:'AE86',years:'1983-1987',body:'hatchback',rear:'hatch',layout:'FR',engineOrient:'long',drives:['FR'],
  baseMass:940,            // V: zenki liftback GT-APEX (spec §1)
  wheelbase:2400,           // V
  stockOD:589,              // C: 185/70R13 = 13*25.4 + 2*0.70*185
  stockDragCdA:0.61,        // E: 0.35 Cd x 1.75 m2 estimated frontal area (MAJOR FIX 6) — replace with the OPEN-2 front-view measured value before final verification
  hubFaceZ:704.5,           // C: half front track 677.5 + stock ET27 (spec §2b)
  pcd:'4x114.3',hubBore:60.1, // V
  wheelDia:[13,14,15,16,17],wheelWid:[5.5,6,6.5,7,7.5,8],stockET:27,
  archTop:665,hubY:280,     // C/DESIGN: arch circle centre 300 + radius 365; hub 280 = loaded radius of the stock tyre
  archGapMin:52,archGapPerPoke:0.2,   // E: EF's collision-fitted figures until the AE86's own arch sweep is run
  fenderOuter:812,          // C: body half-width at the front arch lip (AE86_M plan max)
  strutInner:615,           // E: EF's figure until the AE86 full-lock sweep is run
  bay:{len:900,wid:1090,hgt:600,pan:160},   // DESIGN from the modelled bay clearing the 4A-GE block; pan 160 from the engine entry (V)
  tunnelWid:250,            // V: T50 tunnel (catalogue entry)
  bellPatterns:['TOYOTA-4A'],mountPatterns:['TOYOTA-4A-L'],   // V: from the file's 4A-GE entry
  bumperTipMax:90,airDamBottom:200,   // DESIGN (minor 14: bumperTipMax method = side-photo tip cut-out width, enforcer judges; airDamBottom DESIGN band, not EF's 186)
  sillBottom:160,           // MEASURED (ledger: sill 160)
  stockFrontWeight:0.53,    // SECONDARY: 53:47 distribution (spec §3b)
  wdist:{engine:.75,gearbox:.35,seats:.3,aero:.5,exhaust:.1},   // E: Z32 FR pattern (MAJOR FIX 5; EF's FF values must NOT be used)
  freeBay:{len:260,dia:180,hgt:240},   // v20 MEASURED on the built bay (probe map at 320-500 mm): free space beside the 4A-GE on the left, ahead of the strut tower
  stock:{engine:'4AGE-16V',turbo:'none',gearbox:'T50',diff:'open430',exhaust:'stock',seats:'stock',shifter:'stock',steering:'stock',suspension:'stock',brakes:'ae86',
    wheel:{style:'ae86-13',dia:13,width:5.5,et:27,pcd:'4x114.3',bore:60.1,tw:185,ar:70}},   // stock wheel ae86-13 (MAJOR FIX 1); ae86-14 is the option only; stock diff open430 (MAJOR FIX 2)
  rearSeatDeleteBy:['rollbar','cage','cage10'],
  notBuilt:{frame:['strutbar','rollbar','cage','cage10'],turbo:['gt2560r','gt2860rs','gt3582r','stock-t25-4g63t','stock-ct12b-2jzgte','stock-t25-vg30dett','stock-t28-rb26dett','stock-turbo-sr20det','stock-turbo-1jzgte','rb26-twin-t28','vg30-twin-t25']},   // DESIGN: parts this shell has no model for yet — listed, not selectable (turbo: SPEC-TURBO §4 item 11, OPEN-11)
  removables:null
};
SHELLS.ae86.removables=defaultRemovables(SHELLS.ae86.baseMass);   // liftback HAS a rear seat: no delete, unlike the Z32 2-seater
// Model X: VERIFIED dimensions ref/modelx-plaid/dims.md; DESIGN fit envelopes until geometry checks.
SHELLS.modelx={id:'modelx',name:'Tesla Model X Plaid',short:'Model X Plaid',years:'2022+',body:'SUV',rear:'hatch',layout:'AWD',powertrain:'electric',
  baseMass:2468,wheelbase:2965,stockOD:744.3,hubY:357.15,stockFrontWeight:.49, // VERIFIED mass/WB; CALCULATED tyre/hub; ESTIMATED split
  stockDragCdA:.70,hcg:.48,lltdF:.52,liftF:.05,liftR:.07, // DESIGN aero/CG/load transfer
  hubFaceZ:887.5,stockET:35,pcd:'5x120',hubBore:64.1,wheelDia:[20,22],wheelWid:[9], // DESIGN offset and hub fit; VERIFIED rim sizes
  archTop:770,archGapMin:25,archGapPerPoke:0,fenderOuter:999.5,strutInner:620,airDamBottom:230,sillBottom:250,
  stock:{motor:'modelx-tri',reduction:'modelx-756',battery:'modelx-pack',seats:'modelx-six',steering:'modelx-yoke',suspension:'stock',brakes:'modelx-brakes',tyre:'summer',
    wheel:{style:'modelx-22',dia:22,width:9,et:35,pcd:'5x120',bore:64.1,tw:265,ar:35}},removables:{},notBuilt:{}};
/* ---- SHELLS.eclipse (builder lane 2: from eclipse-draft.js, SPEC-ECLIPSE.md section 3) ---- */
SHELLS.eclipse={  id:'eclipse',name:'Mitsubishi Eclipse GSX',short:'GSX',years:'1997-1999',body:'hatchback',rear:'hatch',layout:'AWD',engineOrient:'trans',drives:['AWD'],
  baseMass:1483,            // V: kerb, 1999 GSX
  wheelbase:2510,           // V
  stockOD:647,              // C: 215/50R17 = 17*25.4 + 2*0.50*215 = 646.8
  stockDragCdA:0.53,        // E: 0.30 Cd SECONDARY x 1.75 m2 estimated frontal area — replace with the front-view measured value before final verification
  hubFaceZ:803.5,           // C on SECONDARY ET: half front track 757.5 + ET 46; provisional until OPEN-WHL
  pcd:'5x114.3',hubBore:67.1, // V
  wheelDia:[16,17],wheelWid:[6.5,7],stockET:46,   // wheelDia/wheelWid: the shop's offered range (16-in = 2Ga option row only); the STOCK width itself is OPEN-WHL, not a claim
  archTop:722,hubY:308,     // DESIGN: arch centre = hub 308 + 20 = 328, radius = tyre radius 323.5 + 70 = 393.5, top = 328 + 393.5 = 721.5 -> 722; OPEN-ARCH refines; arch lips are NOT cut until it closes. hubY 308 = loaded radius (nominal 323.4 - 15 deflection; nominal must NOT be used as loaded)
  archGapMin:52,archGapPerPoke:0.2,   // E: EF's collision-fitted figures until the Eclipse's own arch sweep is run
  fenderOuter:867,          // DESIGN: plan max 867.5 (1735/2), half-cell choice stated per spec section 2b
  strutInner:615,           // E: EF's figure until the Eclipse full-lock sweep is run
  bay:{len:530,wid:840,hgt:600,pan:150},   // DESIGN from the 4G63T entry dims (EF-pattern scaling); OPEN-BAY refines. Check: len 460 <= 530, across 500+280 = 780 <= 840, hgt 600 <= 600, pan 150 <= 150 (equalities pass, not exceed)
  tunnelWid:250,            // DESIGN: AWD tunnel carries the driveshaft only (narrower than an FR gearbox tunnel); W5M33 transaxle sits across the front
  bellPatterns:['MITSUBISHI-4G'],mountPatterns:['MITSUBISHI-4G'],   // new pattern strings, stated by the builder per spec section 3b
  bumperTipMax:90,airDamBottom:130,   // DESIGN (bumperTipMax: EF/AE86 pattern, enforcer judges by the side-photo tip cut-out width; airDamBottom DESIGN, OPEN-VERT refines — the lowered photo car's ~50 mm read is this-car-only and must NOT be used as stock)
  sillBottom:145,           // STOCK-EST (spec section 2b: 145 +/- 50); the stock value itself is OPEN (OPEN-VERT), usable for layout only
  stockFrontWeight:0.60,    // SECONDARY (single-source 60/40); physics calibration target, NOT a build fact (OPEN-WD)
  wdist:{engine:.8,gearbox:.6,seats:.3,aero:.5,exhaust:.1},   // DESIGN provisional (spec section 3a): front-biased, transverse engine + transaxle over the front axle, light rear hardware; physics calibrates against the 0.60 SECONDARY target
  stock:{engine:'4G63T',turbo:'stock-t25-4g63t',gearbox:'W5M33',diff:'w5m33',exhaust:'stock',seats:'stock',shifter:'stock',steering:'stock',suspension:'stock',brakes:'eclipse',aeroR:'gsxwing',
    wheel:{style:'split5',dia:17,width:6.5,et:46,pcd:'5x114.3',bore:67.1,tw:215,ar:50}},   // stock wheel face 'split5' (five split pairs, photo-derived — the picker maps the LIB row's style field, so the face must be a ringPatternP style, never a LIB id); width 6.5 DESIGN pending OPEN-WHL (see the LIB row); stock diff w5m33 ratio PROVISIONAL (OPEN-FD), lsd flag unwired (OPEN-LSD)
  rearSeatDeleteBy:['rollbar','cage','cage10'],
  notBuilt:{frame:['strutbar','rollbar','cage','cage10'],turbo:['gt2560r','gt2860rs','gt3582r','stock-ct12b-2jzgte','stock-t25-vg30dett','stock-t28-rb26dett','stock-turbo-sr20det','stock-turbo-1jzgte','rb26-twin-t28','vg30-twin-t25']},   // DESIGN: parts this shell has no model for yet — listed, not selectable; STAGE-2: aeroR hatchspoiler/gtwing builders landed (OPEN-12 closed), removed from notBuilt (turbo: SPEC-TURBO §4 item 11, OPEN-11; the Eclipse's own stock record (stock-t25-4g63t) is NOT listed — it is the fitted default (§5 exempt))
  removables:null
};
SHELLS.eclipse.removables=defaultRemovables(SHELLS.eclipse.baseMass);
/* ---- SHELLS.gt2000 (builder lane 2: from gt2000-draft.js, SPEC-GT2000.md) ----
   SPLICE CORRECTIONS vs the draft (from the live copy, not the draft's own
   vocabulary): (1) layout/drives 'RWD' -> 'FR' — the copy's layout tokens are
   'FR'/'FF'/'MR'/'RR'/'AWD' (all shells and longitudinal gearboxes use FR);
   checkFit BLOCKs when gb.drives does not include CAR.layout. (2) rear field — STAGE-1 CORRECTION: the draft's rear:'hatch' was a draft error on a coupe (fixed rear
   glass + separate deck lid, no hatch); the E30 coupe precedent carries rear:'notch' (lines 706, 714),
   and Stage 1 sets this shell to rear:'notch' with the atomic notBuilt aero list below, so the gates read it. Behaviour is carried by trunkLabel:'Trunk' + the deck lid. ---- */
SHELLS.gt2000={  id:'gt2000',name:'Toyota 2000GT',short:'2000GT',years:'1967-1968',body:'coupe',rear:'notch',layout:'FR',engineOrient:'long',drives:['FR'],
  baseMass:1120,            // V: kerb, early MF10
  wheelbase:2330,           // V
  stockOD:645,              // DERIVED: 15x25.4 + 2x0.80x165 (period ~80-aspect convention)
  stockDragCdA:0.52,        // E: 0.35 assumed Cd x 1.485 m2 estimated frontal area — replace with a sourced/measured value before any physics presentation quotes drag
  hubFaceZ:650,             // C on OPEN-5, PROVISIONAL, CENTRE-PLANE ONLY: half track 650; rim offset/backspacing OPEN, so this places the wheel CENTRE, never the rim face
  // NO pcd field (centre-lock — none exists). NO hubBore field (unsourced).
  stockET:null,             // OPEN-5: centre-lock specified by backspacing, not offset; null, never a string
  wheelDia:[15],wheelWid:[5],   // V: 15x5 — width KNOWN; offset/backspacing is what is OPEN
  archTop:655,hubY:308,     // PHOTO-DERIVED (Osaka side + early-wheel photos): arch centre 308 + radius 347.5 = 655.5 -> 655; hubY 308 = loaded radius 307.5 rounded (nominal 322.5 must NOT be used as loaded); OPEN-16 closed by this fix
  archGapMin:20,archGapPerPoke:0.2,   // GT2000's own arch sweep (this fix): stock gap 25 mm, so WARN below 20 mm; EF's 52 was an import, never a GT2000 figure
  fenderOuter:800,          // C: body half-width at the arch lip = plan max 1600/2
  strutInner:550,           // DESIGN provisional sweep placeholder: stock inner tyre face 567.5, so 550 leaves 17.5 mm; a value above 567.5 would false-WARN stock fitment (copying EF's 615 does exactly that); the arch sweep replaces it
  bay:{len:900,wid:900,hgt:600,pan:160},   // DESIGN from the 3M entry dims (700<=900, 560<=900, 600<=600, 160<=160, equalities pass); OPEN-BAY refines
  tunnelWid:250,            // DESIGN: 5MT tunnel (gearbox entry tunnel 250, T50 pattern)
  bellPatterns:['TOYOTA-3M'],mountPatterns:['TOYOTA-3M'],   // stated by the builder from the copy's mount patterns; checkFit BLOCKs if the engine mount is not in mountPatterns
  bumperTipMax:130,airDamBottom:140,   // DESIGN: twin Ø60 tips side by side (~120) + gap; bumper-bottom heights OPEN-21
  sillBottom:208,           // PHOTO-DERIVED ±40
  stockFrontWeight:0.49,    // SECONDARY: 49/51 — physics calibration target, NOT a build fact
  wdist:{engine:.5,gearbox:.4,seats:.3,aero:.5,exhaust:.1},   // DESIGN provisional (spec §3a); physics calibrates against the 0.49 SECONDARY target
  stock:{engine:'3M',turbo:'none',gearbox:'gt2000-5mt',diff:'gt2000-lsd',exhaust:'stock',seats:'stock',shifter:'stock',steering:'stock',suspension:'stock',brakes:'gt2000',
    wheel:{style:'gt2000-15',dia:15,width:5,et:null,tw:165,ar:80}},   // et:null OPEN-5; tw/ar 165HR15, ar 80 DERIVED period-aspect convention; NO pcd, NO bore (centre-lock rule)
  rearSeatDeleteBy:[],      // 2-seater: no rear bench to delete (Z32 pattern)
  notBuilt:{frame:['strutbar','rollbar','cage','cage10'],aeroF:['islip','frontlip','splitter','mtfront'],aeroR:['trunklip','ducktail','hatchspoiler','gtwing','mtrear','mtroof','z32wing','gsxwing'],flares:['wide'],skirts:['skirts','mtskirts'],turbo:['gt2560r','gt2860rs','gt3582r','stock-t25-4g63t','stock-ct12b-2jzgte','stock-t25-vg30dett','stock-t28-rb26dett','stock-turbo-sr20det','stock-turbo-1jzgte','rb26-twin-t28','vg30-twin-t25']},   // STAGE-1: family CLOSED except stock (SPEC §2.7) — no aero builder exists for this shell, atomic with rear:'notch'
  removables:null
};
SHELLS.gt2000.removables=defaultRemovables(SHELLS.gt2000.baseMass);delete SHELLS.gt2000.removables.rearSeat;   // 2-seater: the shop must NOT offer rear-seat removal on a car with no rear seat (Z32 pattern)   // liftback HAS a rear seat: no delete, unlike the Z32 2-seater
// STEER-03 (owner, Nov 14: "it should be realistic ... responsive to the steering wheel", picked real car steering): each car's steering, as sourced.
// turns: the steering wheel's turns from lock to lock; ratio: steering-wheel degrees per road-wheel degree. The car records whichever is sourced, and
// garage_core (steerSpec) works out the other from the car's own lock (its module's maxSteer, from its turning circle), so the cockpit wheel, the keys
// and the front wheels all agree. V = two sources agree; E = one good source, or two that differ a little (the value used is said).
SHELLS.e30.steer={turns:4.0,label:'V'};   // power rack, 4 turns lock to lock: e30zone wiki (325i page: "4 turns lock to lock (p/s), 4.4 turns L2L (m/s)", and Steering Rack Conversions: "The E30 rack is 4 turns lock-to-lock"); Grassroots Motorsports (Project 318is: "The stock E30 rack is said to be 4.0 turns lock to lock"). Cross-check: overall ratio 20.5:1 for the 325i (strictlyeta.net specifications); 4 turns over the 34.4 deg lock gives 20.9:1
SHELLS.e30t.steer={turns:4.0,label:'V'};   // the Touring has the 325i's front axle and rack (same sources)
SHELLS.e30.freeBay={len:600,dia:280,hgt:240};SHELLS.e30t.freeBay={len:600,dia:280,hgt:240};   // TURBO-02 MEASURED on the built bay (t/probe/map.js at 360, 480 and 600 mm up): beside the M20 on its exhaust side, from 1060 to 1700 mm (x) and from the block's side to 560 mm out (z), clear at all three heights; the turbo kit's own placement finds the exact spot
SHELLS.ef.steer={turns:4.0,label:'E'};   // EF9 SiR: rack and pinion without power assist (nextage.jp catalogue, E-EF9 SiR 5MT: "パワーアシストなしラック＆ピニオン"); 4 turns lock to lock for the 1988-90 racks, 3.1 for the 1991 EX's quicker power rack (motor-car.net, Civic 4th gen). Cross-check: Honda's next Civic (EG, 1992-95) manual rack is 19.0:1 and 3.88 turns (Honda specifications); 4 turns over the EF's 33.9 deg lock gives 21.2:1
SHELLS.z32.steer={turns:2.75,label:'E'};   // power rack: 2.7 turns lock to lock (motrs.au 300ZX Z32 specifications), 2.8 (carsales.com.au Z32 review: "2.8 turns lock to lock ensures minimal input and rapid response"); the mean is used. Over the car's 31.8 deg lock: 15.6:1. Super HICAS rear steer is not modelled
SHELLS.ae86.steer={ratio:16.0,label:'E'};   // manual rack 16:1 (aeu86.org, Quaife QSR thread rack list); an owner's measurement there, 23 deg of road wheel per turn of the stock non-power rack, is 15.7:1. Over the car's 34.6 deg lock: 3.1 turns lock to lock. (The power rack with the power-steering knuckles measured 20.5 deg per turn, 17.6:1, about 3.4 turns; the GT-APEX here is modelled with the manual rack)
SHELLS.eclipse.steer={ratio:15.8,label:'E'};   // 2G DSM power rack 15.8:1 (dsmtuners.com, Evo rack swap thread: "Our DSMs are 15.8:1", the Evo's 13:1); a '98 GS-T owner measured about 1 1/4 turns from centre to lock (dsmtuners.com, 2G steering rack question). Over the car's 28.6 deg lock: 2.5 turns lock to lock
SHELLS.modelx.steer={turns:2.33,label:'V'};   // Tesla Model X Owner's Manual, Specifications, Subsystems: "Variable rack and pinion ... Number of turns lock to lock 2.33", turning circle 12.3 m (40.3 ft); Tesla Motors Club (yoke thread, quoting the manual: 2.3 turns). The ratio is variable with speed in its assist, not its angle
SHELLS.gt2000.steer={turns:2.67,label:'E'};   // rack and pinion, "only 2.67 turns lock to lock" (Sports Car World, 1978, via uniquecarsandparts.com.au); Road & Track's 1967 test: "steering was light and quick". One source: the 2000GT is not on sale yet (Coming soon)
if(typeof module!=='undefined')module.exports={SHELLS,defaultRemovables};
