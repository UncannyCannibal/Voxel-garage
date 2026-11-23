/* Model X Plaid 2022 US, source: ref/modelx-plaid/{dims,spec,ev_spec}.md.
   Each field's provenance is explicit; missing factory packaging is DESIGN.
   No engine, gearbox, exhaust or combustion swap records are registered. */
const MODELX_SPEC=Object.freeze({
  powerKW:761,powerHP:1020,powerLabel:'VERIFIED', // ev_spec: system limit, not sum of ECE motor peaks
  torqueNM:1020,torqueLabel:'ESTIMATED',torqueRange:[1020,1424], // ev_spec: conflicting secondary figures; conservative end
  ratio:7.56,ratioLabel:'VERIFIED',grossKWh:100,grossLabel:'VERIFIED',usableKWh:95,usableLabel:'ESTIMATED',
  maxKph:262,reverseKph:24, // VERIFIED, spec.md
  motorKW:[314,309,309],motorLabel:'VERIFIED', // ECE R85 basis, not simultaneous power
  efficiency:.94,regenKW:80,regenG:.18,chargeEfficiency:.80, // DESIGN simulation, no published regen rating
  packMass:620,motorMass:[85,80,80],frontShare:.49,hcg:.48, // DESIGN mass packaging/CG; frontShare secondary ESTIMATED
  auxiliaryKW:.6 // DESIGN accessories load, no real-world range claim
});
LIB.motor=LIB.motor||[];LIB.battery=LIB.battery||[];LIB.reduction=LIB.reduction||[];
LIB.motor.push({id:'modelx-tri',name:'Three permanent-magnet motors',shells:['modelx'],count:3,positions:['front','rear-left','rear-right'],powerKW:MODELX_SPEC.motorKW,mass:245,label:'VERIFIED ratings / DESIGN mass'});
LIB.battery.push({id:'modelx-pack',name:'Floor battery: 100 kWh gross VERIFIED / 95 usable ESTIMATED',shells:['modelx'],gross:100,usable:95,mass:620,label:'VERIFIED gross / ESTIMATED usable / DESIGN mass'});
LIB.reduction.push({id:'modelx-756',name:'Fixed reduction 7.56:1 VERIFIED',shells:['modelx'],ratio:7.56,mass:0,label:'VERIFIED ratio; mass included in drive units'});
LIB.brakes.push({id:'modelx-brakes',name:'Plaid brakes: 380 / 365 mm DESIGN',shells:['modelx'],rotor:380,rotorR:365,cal:25,mass:0,label:'DESIGN: dimensions not in reference pack'});
LIB.seats.push({id:'modelx-six',name:'Six seats, 2+2+2 VERIFIED layout',shells:['modelx'],mass:25,label:'DESIGN per-seat mass; VERIFIED layout'});
LIB.steering.push({id:'modelx-yoke',name:'2022 yoke',shells:['modelx'],dia:360,mass:3,label:'VERIFIED type / DESIGN dimensions'},
  {id:'modelx-wheel',name:'2023+ round-wheel option',shells:['modelx'],dia:360,mass:3.5,label:'VERIFIED option / DESIGN dimensions and mass'});
LIB.wheel.push({id:'modelx-20',style:'modelx-20',name:'20-inch Cyberstream, staggered',shells:['modelx'],dia:20,width:9,et:35,pcd:'5x120',bore:64.1,tw:265,ar:45,label:'VERIFIED sizes / DESIGN offset and hub fit'},
  {id:'modelx-22',style:'modelx-22',name:'22-inch Turbine, staggered',shells:['modelx'],dia:22,width:9,et:35,pcd:'5x120',bore:64.1,tw:265,ar:35,label:'VERIFIED sizes / DESIGN offset and hub fit'});
