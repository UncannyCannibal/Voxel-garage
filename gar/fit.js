/* ===== FIT + PHYSICS: any part on any shell, decided from real attributes. Pure logic (no THREE), unit-tested in Node. =====
   Labels: V = VERIFIED, C = CALCULATED, E = ESTIMATED, D = DESIGN.  Dimensions in mm, mass in kg, torque in Nm.
   The current shell is CAR (setShell switches it). A part is never refused because of its donor car: it is refused only when it cannot physically or mechanically work,
   and the reason says which attribute disagrees. Where a real shop could make it work (custom mounts, adapter plates) a conversion option is offered, with its mass. */
let CAR=SHELLS.e30;
const CATALOG=LIB;
function setShell(id){CAR=SHELLS[id];if(!CAR)throw new Error('unknown shell '+id);return CAR;}
const byId=(slot,id)=>{const l=(slot==='swapkit')?allKits():LIB[slot];return l.find(p=>p.id===id);};
/* ---- aero: four slots, each from its own list; kits fit several at once ---- */
const AERO_SLOTS=['aeroF','aeroR','flares','skirts'];
function aeroParts(cfg){const o={};for(const s of AERO_SLOTS)o[s]=byId(s,cfg[s])||byId(s,'none');return o;}
function aeroDrag(cfg){const A=aeroParts(cfg);let k=1;for(const s of AERO_SLOTS)k*=1+(A[s].drag||0);return k;}   // E: multiplies the stock drag area
/* ---- aero balance (SPEC-AERO §4.5, FROZEN): one source of truth for aero downforce balance — checkFit's rear-balance WARN and vehiclePhysics both read it (AERO_CL is read at call time, after the script has initialised) ---- */
function aeroBalance(cfg){let clF=-(CAR.liftF!==undefined?CAR.liftF:.10),clR=-(CAR.liftR!==undefined?CAR.liftR:.14);for(const s of AERO_SLOTS){const c=AERO_CL[cfg[s]];if(c){clF+=c[0];clR+=c[1];}}return {clF,clR};}
// a part listed for some shells fits this one when it names it or its family (the E30 Touring takes the E30's parts)
function shellOK(p){return !p.shells||p.shells.includes(CAR.id)||(!!CAR.family&&p.shells.includes(CAR.family));}
function refusedBy(slot,id){return !!(CAR.refuse&&CAR.refuse[slot]&&CAR.refuse[slot][id]);}
function aeroKits(){return LIB.aerokit.filter(k=>shellOK(k)&&(!k.bodyOnly||!CAR.rear||k.bodyOnly===CAR.rear)&&!Object.entries(k.set||{}).some(([s,id])=>refusedBy(s,id)));}
function kitMatch(cfg){for(const k of aeroKits()){if(AERO_SLOTS.every(s=>(k.set[s]||'none')===(cfg[s]||'none')))return k;}return null;}
// a save from before the aero slots: its one 'aero' part becomes the parts it stood for
function migrateAero(c){if(!c||typeof c.aero!=='string'||AERO_SLOTS.some(s=>typeof c[s]==='string'))return c;
  const m={none:{},islip:{aeroF:'islip',aeroR:'trunklip'},frontlip:{aeroF:'frontlip'},splitter:{aeroF:'splitter'},ducktail:{aeroR:'ducktail'},hatchspoiler:{aeroR:'hatchspoiler'},gtwing:{aeroF:'splitter',aeroR:'gtwing'},wide:{flares:'wide'}}[c.aero]||{};
  for(const s of AERO_SLOTS)c[s]=m[s]||'none';delete c.aero;return c;}
/* ---- conversion kits: the shell's own packages (E30: M50, S54, 2JZ, LS) plus three generic conversions that exist for any shell ---- */
const GENERIC_KITS=[
  {id:'conv',name:'Conversion mounts: fabricated engine mounts and crossmember, custom driveshaft and adapter plate where needed',accepts:'*',adapts:'*',tunnel:0,relief:{hgt:0,wid:0,pan:0,len:0},mass:8,label:'D',generic:1},
  {id:'conv-pro',name:'Full conversion: low-profile mounts, shallow oil pan, electric fan with slimline radiator, hammered tunnel',accepts:'*',adapts:'*',tunnel:60,relief:{hgt:60,wid:30,pan:40,len:70},mass:14,label:'D',generic:1},
  {id:'conv-xl',name:'Extreme conversion: notched strut towers, relocated battery, cut firewall and tunnel',accepts:'*',adapts:'*',tunnel:120,relief:{hgt:80,wid:90,pan:60,len:90},mass:22,label:'D',generic:1}
];
function allKits(){return LIB.swapkit.filter(k=>shellOK(k)).concat(GENERIC_KITS);}
function kitsFor(){return allKits();}
/* ---- tyre sizing: keep rolling diameter within 3% of stock ---- */
function tyreFor(rimIn,widthIn,twOverride,arOverride){   // twOverride: the width of the wheel set's own tyre (a stock 14x5.5 wears a 195, not the generic 175)
  const tw=twOverride||{5:165,5.5:175,6:195,6.5:205,7:205,7.5:215,8:225,8.5:235,9:245,9.5:255,10:265,11:285}[widthIn]||Math.round(25.4*widthIn*1.28);
  const rimMM=rimIn*25.4,side=(CAR.stockOD-rimMM)/2;
  let aspect=arOverride||Math.max(25,Math.min(65,Math.round(side/tw*100/5)*5));
  const OD=rimMM+2*tw*aspect/100;
  return {tw,aspect,OD,sizeStr:tw+'/'+aspect+'R'+rimIn};
}
const stockPart=(slot)=>byId(slot,CAR.stock[slot]);
const removed=(cfg,k)=>!!(cfg.removed&&cfg.removed[k]);
/* ---- the fitment engine: returns {ok, issues:[{sev:'BLOCK'|'WARN', slot, text}]} ---- */
function checkFit(cfg){
  if(CAR.powertrain==='electric')return MODELX_EV.fit(cfg);
  const I=[];const add=(sev,slot,text)=>I.push({sev,slot,text});const nm=CAR.short||CAR.name;
  const eng=byId('engine',cfg.engine),gb=byId('gearbox',cfg.gearbox),kit=byId('swapkit',cfg.swapkit)||byId('swapkit','none'),ex=byId('exhaust',cfg.exhaust),
        br=byId('brakes',cfg.brakes),su=byId('suspension',cfg.suspension),fr=byId('frame',cfg.frame),se=byId('seats',cfg.seats),A=aeroParts(cfg);
  const generic=!!kit.generic,any=a=>a==='*';
  const tb=byId('turbo',cfg.turbo)||byId('turbo','none');   // SPEC-TURBO §4/§5: the 'none' record resolves, so tb is never undefined
  const stockRec=(tb&&tb.stock)?tb:null,fittedKit=(tb&&!tb.stock&&tb.id!=='none')?tb:null;   // §3.4 chain's record split
  const turboFlangePass=!!(fittedKit&&fittedKit.bundle&&(fittedKit.bundle.manifold==='included'||fittedKit.bundle.manifold==='adapter'));   // §5.1 interim pass — §5.4 suppression condition
  // TURBO-02: an upgrade that bolts into the engine's own factory turbo's place (inPlaceOf names that stock record): it uses the factory manifold and sits
  // where the factory turbo sits, so the flange and bay checks are the factory ones; on any other engine it is just an unfittable kit
  const inPlace=!!(fittedKit&&fittedKit.inPlaceOf&&eng&&eng.turbo&&stockRecordFor(eng)&&stockRecordFor(eng).id===fittedKit.inPlaceOf);
  // layout: the engine's orientation and the gearbox's drive layout must suit the shell
  if(eng.orient&&CAR.engineOrient&&eng.orient!==CAR.engineOrient)add('BLOCK','engine',eng.name+' is a '+(eng.orient==='trans'?'transverse':'longitudinal')+' engine; the '+nm+' is built for a '+(CAR.engineOrient==='trans'?'transverse':'longitudinal')+' one (the gearbox, driveline and bay all follow that).');
  if(gb.drives&&!gb.drives.includes(CAR.layout))add('BLOCK','gearbox',gb.name+' serves '+gb.drives.join(' / ')+' cars; the '+nm+' is '+CAR.layout+'.');
  // engine mounts
  const own=CAR.mountPatterns.includes(eng.mount),kitAccepts=kit.accepts&&(any(kit.accepts)||kit.accepts.includes(eng.mount));
  if(!own&&!kitAccepts){
    if(kit.id!=='none'&&!generic)add('BLOCK','engine',eng.name+' uses the '+eng.mount+' mount pattern, which the '+kit.id+' swap kit does not accept.');   // a shell's own kit only takes its own patterns
    else add('BLOCK','engine',eng.name+' uses the '+eng.mount+' mount pattern. The '+nm+' accepts '+CAR.mountPatterns.join(' / ')+'. Needs a swap kit.');}
  // envelope (a swap kit with lowered mounts / notched towers / shallow sump relaxes it)
  const rel=(own&&kit.id==='none')?{hgt:0,wid:0,pan:0,len:0}:(kit.relief||{hgt:0,wid:0,pan:0,len:0}),bay={len:CAR.bay.len+(rel.len||0),wid:CAR.bay.wid+rel.wid,hgt:CAR.bay.hgt+rel.hgt,pan:CAR.bay.pan+rel.pan};
  const trans=CAR.engineOrient==='trans'&&eng.orient==='trans',across=trans?eng.wid+(gb.across||0):eng.wid;   // a transverse engine and its transaxle share the width between the inner aprons
  if(eng.len>bay.len)add('BLOCK','engine',trans?'Engine depth front to back '+eng.len+' mm does not fit between the radiator support and the firewall ('+bay.len+' mm).':'Engine length '+eng.len+' mm is longer than the bay envelope ('+bay.len+' mm).');
  if(across>bay.wid)add('BLOCK',trans&&gb.across&&eng.wid<=bay.wid?'gearbox':'engine',trans?'Engine '+eng.wid+' mm plus transaxle '+gb.across+' mm is '+across+' mm across; the bay is '+bay.wid+' mm between the inner aprons.':'Engine width '+eng.wid+' mm exceeds the bay width ('+bay.wid+' mm).');
  if(eng.hgt>bay.hgt)add('BLOCK','engine','Engine height '+eng.hgt+' mm would hit the hood (limit '+bay.hgt+' mm).');
  if(eng.pan>bay.pan)add('BLOCK','engine','Oil pan depth '+eng.pan+' mm hits the subframe (limit '+bay.pan+' mm).');
  // gearbox bellhousing
  const adapts=kit.adapts;
  const pairOK=(a,b)=>Array.isArray(adapts)&&adapts.some(p=>(p[0]===a&&p[1]===b)||(p[0]===b&&p[1]===a));
  const bellSame=gb.bell===eng.bell,bellAdapt=any(adapts)||pairOK(eng.bell,gb.bell);
  if(!bellSame&&!bellAdapt)add('BLOCK','gearbox',gb.name+' has a '+gb.bell+' bellhousing; the '+eng.id+' needs '+eng.bell+' or an adapter plate.');
  if(!bellSame&&bellAdapt&&any(adapts))add('WARN','gearbox','The '+eng.bell+' engine meets the '+gb.bell+' gearbox through a custom-machined adapter plate, flywheel and input-shaft sleeve (no off-the-shelf kit assumed).');
  // tunnel
  const tunnelLimit=Math.max(CAR.tunnelWid,(kit.id!=='none'&&kit.tunnel)?(generic?CAR.tunnelWid+kit.tunnel:kit.tunnel):0);
  if(gb.tunnel>tunnelLimit)add('BLOCK','gearbox','Gearbox width '+gb.tunnel+' mm does not fit the transmission tunnel ('+tunnelLimit+' mm). A swap kit with tunnel clearance is needed.');
  // driveline strength: a gearbox rated below the engine's torque will not last (physics, not geometry)
  // SPEC-TURBO §5.3: the WARN compares the EFFECTIVE torque — the old no-op multiplier eng.tq*(eng.turbo?1:1) is DELETED
  const effTq=effEngine(cfg).tq;
  if(gb.tq&&effTq>gb.tq)add('WARN','gearbox',gb.name+' is rated about '+gb.tq+' Nm; the '+eng.id+' makes '+Math.round(effTq)+' Nm'+(tb&&tb.id!=='none'?' with the '+tb.name+' fitted':'')+'. It will not survive hard launches.');
  // exhaust
  if(ex.tipW>CAR.bumperTipMax&&!removed(cfg,'bumperR'))add('WARN','exhaust','Tip is '+ex.tipW+' mm wide; the rear bumper cut-out is '+CAR.bumperTipMax+' mm. It will need trimming.');
  if(!turboFlangePass&&cfg.exhaust==='stock'&&cfg.engine!==CAR.stock.engine)add('WARN','exhaust','The stock exhaust is built around the '+(byId('engine',CAR.stock.engine).fam?byId('engine',CAR.stock.engine).fam+'-series':CAR.stock.engine)+' header flange; a different engine needs a custom manifold or downpipe.');
  // ---- turbo (SPEC-TURBO §5) ----
  // Incompleteness BLOCK (R2-2): no record with [O] in a load-bearing field is fittable. Exempt: a stock record on its OWN engine (LEGACY default/refit path).
  // A stock record on a DIFFERENT engine is BLOCKED (it would fall through to the gain path on [O] fields).
  if(tb&&tb.id!=='none'&&!(stockRec&&stockRec.stockFor===eng.id)){
    const openField=(tb.spoolStart==null)?['spoolStart','OPEN-19']:(tb.fullBoost==null)?['fullBoost','OPEN-19']:(tb.boostPsi==null)?['boostPsi',tb.stock?'OPEN-17':'OPEN-15']:(tb.icEff==null)?['icEff','OPEN-20']:(tb.mass==null)?['mass','OPEN-6']:(!inPlace&&(tb.envLen==null||tb.envDia==null||tb.envHgt==null))?['envelope','OPEN-6/11']:null;
    if(openField)add('BLOCK','turbo','The '+tb.name+' is not fittable yet — its '+openField[0]+' is not sourced ('+openField[1]+').');}
  if(stockRec&&stockRec.stockFor!==eng.id)add('BLOCK','turbo','The '+stockRec.name+' is the stock turbo for the '+stockRec.stockFor+', not the '+eng.id+'.');
  // §5.6 removal: 'none' on a stock-turbo engine. sc engines EXCLUDED — the 4AGZE is supercharged, not turbocharged; 'none' is its correct state (the bullet's scope is stock-turbo engines).
  if(cfg.turbo==='none'&&eng.turbo&&!eng.sc)add('BLOCK','turbo','The '+eng.id+' was built around its turbos — removing them needs an NA baseline that is not in the record.');
  if(fittedKit){
    if(eng.sc)add('BLOCK','turbo','The '+eng.id+' is supercharged; the file has no supercharger-removal path.');   // §5.6: turbo on a supercharged engine (4AGZE)
    else{
      // §5.6 upgrade on a stock-turbo engine: allowed only when the stock record's boostPsi AND icEff are BOTH frozen
      if(eng.turbo){const sr=stockRecordFor(eng);if(!sr||sr.boostPsi==null||sr.icEff==null)add('BLOCK','turbo','Cannot size the gain over the stock '+(sr?sr.name:eng.id+' turbo')+' — its stock boost / intercooler effectiveness is not sourced (OPEN-17/OPEN-3/OPEN-20).');}
      // §5.1 flange, INTERIM (until OPEN-11 closes): included fits, adapter WARNs, anything else BLOCKs
      if(inPlace){if(fittedKit.warn)add('WARN','turbo',fittedKit.warn);}   // TURBO-02: on the factory manifold, in the factory turbo's place; the kit says what else it needs
      else if(fittedKit.bundle&&fittedKit.bundle.manifold==='included'){/* kit brings its own manifold — fits */}
      else if(fittedKit.bundle&&fittedKit.bundle.manifold==='adapter')add('WARN','turbo','The '+fittedKit.name+' fits through an adapter plate (custom-machined, no off-the-shelf kit assumed).');
      else add('BLOCK','turbo','Cannot size the fit — OPEN-11 (the '+eng.id+' manifold flange is not in the record and the bay map is not built).');
      // §5.2 envelope, GUARDED (MAJOR-5): the comparison never runs on an [O] value
      const free=CAR.freeBay||{};
      if(inPlace){/* TURBO-02: the factory turbo's place; the kit's own install hardware (inPlaceKit) is what makes it fit there */}
      else if(fittedKit.envLen==null||fittedKit.envDia==null||fittedKit.envHgt==null||free.len==null||free.dia==null||free.hgt==null)add('BLOCK','turbo','Bay fit cannot be sized — OPEN-6/11.');
      else if(fittedKit.envLen>free.len||fittedKit.envDia>free.dia||fittedKit.envHgt>free.hgt)add('BLOCK','turbo','The '+fittedKit.name+' does not fit the '+nm+' bay (envelope '+fittedKit.envLen+'×'+fittedKit.envDia+'×'+fittedKit.envHgt+' mm vs free '+free.len+'×'+free.dia+'×'+free.hgt+' mm on the exhaust side).');
      // §5.5 safe boost, GUARDED (MAJOR-5)
      if(fittedKit.boostPsi==null)add('BLOCK','turbo','Cannot size the boost for the '+fittedKit.name+' — its boost target is not sourced (OPEN-15).');
      else if(eng.id==='4G63T'&&fittedKit.boostPsi>15)add('BLOCK','turbo','Stock 450 cc injectors give up at ~14–15 psi on pump gas; fueling upgrade required.');
      else if(eng.safeBoostPsi==null)add('BLOCK','turbo','Safe boost for the '+eng.id+' is not sourced — OPEN-10.');
      else if(fittedKit.boostPsi>eng.safeBoostPsi)add('BLOCK','turbo',eng.id+' stock bottom end is safe to '+eng.safeBoostPsi+' psi; the '+fittedKit.name+' runs '+fittedKit.boostPsi+' psi.');
    }
  }
  // §5.5 2JZ power limit: WARN, not BLOCK (dormant until an upgrade is allowed — effEngine.hp is computable only once the stock record's boostPsi AND icEff freeze)
  if(eng.id==='2JZGTE'){const effHp=effEngine(cfg).hp;if(effHp>700)add('WARN','turbo','The 2JZ-GTE stock bottom end is safe to about 700 hp with supporting modifications; this setup makes '+Math.round(effHp)+' hp.');}
  // wheels
  const w=cfg.wheel,ty=tyreFor(w.dia,w.width,w.tw,w.ar);
  if(w.pcd!==CAR.pcd)add('BLOCK','wheel','Wheel bolt pattern '+w.pcd+' does not match the '+nm+' hub ('+CAR.pcd+').');
  if(w.bore&&CAR.hubBore){   // centre bore against the hub spigot (a wheel with no stated bore is taken as hub-centric to this car)
    if(w.bore<CAR.hubBore-.05)add('BLOCK','wheel','Wheel centre bore '+w.bore+' mm is smaller than the '+nm+' hub spigot ('+CAR.hubBore+' mm); the wheel will not seat on the hub.');
    else if(w.bore>CAR.hubBore+.05)add('WARN','wheel','Wheel centre bore '+w.bore+' mm is larger than the '+nm+' hub ('+CAR.hubBore+' mm): fit hub-centric rings to stop vibration.');}
  const zc=CAR.hubFaceZ-w.et+(cfg.spacerF||0),flare=(A.flares.flare||0);
  // camber (degrees, negative = the top leans in) turns the wheel about the lower ball joint 110 mm under the hub: at the top of the tyre, where the fender lip
  // and the strut are, both tyre faces move inward by (35 mm under the tread top + 110 mm) x sin(camber); the faces' width shrinks by cos(camber)
  const camF=Math.abs(cfg.camberF||0)*Math.PI/180,lean=(ty.OD/2-35+110)*Math.sin(camF),hw=ty.tw/2*Math.cos(camF);
  const outer=zc+hw-lean,inner=zc-hw-lean;
  const outerLimit=CAR.fenderOuter+flare-3;   // up to the fender lip less a 3 mm margin (DESIGN)
  // tyre fitment never stops the car: a tyre past the lip or against the strut rubs (and will wear or cut), which is the owner's call
  if(outer>outerLimit)add('WARN','wheel','Outer tire face reaches '+Math.round(outer)+' mm from the centreline at the top of the tire; the fender lip is at '+Math.round(outerLimit)+' mm, so it pokes '+Math.round(outer-outerLimit)+' mm and will rub the lip over bumps. More negative camber, a higher offset, rolled lips or flares stop it.');
  if(inner<CAR.strutInner)add('WARN','wheel','Inner tire face reaches '+Math.round(inner)+' mm at the top of the tire and rubs the strut (clearance line '+CAR.strutInner+' mm) by '+Math.round(CAR.strutInner-inner)+' mm. Less camber, a lower offset or a spacer clears it.');
  if(camF>3.5*Math.PI/180)add('WARN','suspension','Camber of '+(cfg.camberF||0)+' degrees at the front: the inner shoulder carries the load, so straight-line braking and tire life suffer.');
  if(Math.abs(cfg.camberR||0)>3.5)add('WARN','suspension','Camber of '+(cfg.camberR||0)+' degrees at the rear: less traction under power, inner-edge tire wear.');
  if(Math.abs(ty.OD/CAR.stockOD-1)>0.03)add('WARN','wheel','Rolling diameter is '+Math.round((ty.OD/CAR.stockOD-1)*1000)/10+'% off stock, so the speedometer will be wrong.');
  // brakes vs wheel barrel
  const barrel=w.dia*12.7-12,need=br.rotor/2+br.cal+5;
  if(need>barrel)add('BLOCK','brakes',br.name+' needs about '+Math.round(need)+' mm of barrel radius; a '+w.dia+'-inch wheel has '+Math.round(barrel)+' mm. Fit a larger wheel.');
  // suspension drop vs arch
  const drop=cfg.drop||0;
  if(drop<su.minDrop||drop>su.maxDrop)add('BLOCK','suspension',su.name+' allows '+su.minDrop+' to '+su.maxDrop+' mm of drop; '+drop+' mm was requested.');
  const archGap=CAR.hubY?CAR.archTop-CAR.hubY-ty.OD/2-drop:CAR.archTop-drop-ty.OD;   // hubY: shells whose hub stays at a fixed height in the body (the tyre grows both ways)
  const poke=Math.max(0,outer-(CAR.hubFaceZ-CAR.stockET+97.5)),gapNeed=Math.round(CAR.archGapMin+CAR.archGapPerPoke*poke);
  if(archGap<gapNeed)add('WARN','suspension','Only '+Math.round(archGap)+' mm between tire and arch at '+drop+' mm drop; the front tire rubs the arch at full steering lock and over bumps (this wheel wants '+gapNeed+' mm). It still drives.');
  // aero: each slot on its own (any lip with any spoiler); a rear part must suit the body's rear (trunk lid or hatch)
  for(const s of AERO_SLOTS){const a=A[s];if(a.bodyOnly&&CAR.rear&&a.bodyOnly!==CAR.rear)add('BLOCK',s,a.name+' bolts to a '+(a.bodyOnly==='notch'?'trunk lid':'hatchback')+'; the '+nm+' has a '+(CAR.rear==='hatch'?'hatch':'trunk')+'.');}
  // bumper dependency (SPEC-AERO §4.1, FROZEN): a bumper-mounted part fitted with its bumper removed BLOCKs — fitment must match depiction (setAero already hides these)
  if(A.aeroF.mount==='addon'&&A.aeroF.onBumper==='front'&&removed(cfg,'bumperF'))add('BLOCK','aeroF',A.aeroF.name+' bolts to the front bumper; the front bumper is removed.');
  if(A.aeroR.mount==='addon'&&A.aeroR.onBumper==='rear'&&removed(cfg,'bumperR'))add('BLOCK','aeroR',A.aeroR.name+' bolts to the rear bumper; the rear bumper is removed.');
  // flares without wide wheels (SPEC-AERO §4.5, FROZEN): +2.5 in of width moves the outer face ~31.8 mm/side, covering the +30 mm/side flare
  if(cfg.flares!=='none'&&cfg.wheel.width<CAR.stock.wheel.width+2.5)add('WARN','flares','Wide flares with stock-width wheels: the arches sit empty — fit wider wheels to fill them.');
  // rear aero balance (SPEC-AERO §4.5, FROZEN): the diff threshold governs — no "no front device" clause; a lip leaves lip+wing at +0.33, still unbalanced
  {const bal=aeroBalance(cfg),d=bal.clR-bal.clF;if(d>.30)add('WARN','aeroR','Rear downforce exceeds front by '+d.toFixed(2)+' m² — the aero balance shifts rearward; fit a front splitter to balance it. A front lip is not enough against a GT wing.');}
  // ground clearance with aero: the front lip below the valance, the skirts below the sills
  const gc=A.aeroF.mount==='replacement'&&A.aeroF.bottom!==undefined?A.aeroF.bottom-drop:CAR.airDamBottom-drop-(A.aeroF.lip||0);   // §4.1: a replacement bumper uses its own bottom edge (latent: no replacement records at launch)
  if(gc<60)add('WARN','aeroF','Front lip is '+Math.round(gc)+' mm off the ground at this ride height and will scrape.');
  const sc=(CAR.sillBottom||CAR.airDamBottom)-drop-(A.skirts.skirt||0);
  if(A.skirts.skirt&&sc<60)add('WARN','skirts','Side skirts are '+Math.round(sc)+' mm off the ground at this ride height and will scrape over kerbs and ramps.');
  // cage rules
  if(fr.needsSeats&&!(cfg.seats===fr.needsSeats||((byId('seats',cfg.seats)||{}).look||{}).base===fr.needsSeats))add('BLOCK','frame','The '+fr.name.toLowerCase()+' needs fixed-back bucket seats (the cage tubes run where a reclining seat back swings).');
  // interior (SPEC-INTERIOR §1.5/§6.4, Stage B): a deleting frame + any rearArea replacement BLOCKs; a dash set whose plush crosses the driver's sightline BLOCKs
  if(Array.isArray(cfg.rearArea))add('BLOCK','rearArea','one area holds one replacement');
  if(Array.isArray(cfg.passArea))add('BLOCK','passArea','one area holds one replacement');
  {const rp=byId('rearArea',cfg.rearArea);if(rp&&fr.deletesRearSeat)add('BLOCK','rearArea','The '+fr.name.toLowerCase()+' tubes run through the space the '+rp.name.toLowerCase()+' would occupy.');}
  if(byId('dashPlush',cfg.dashPlush)&&eyeLineCheck(CAR.id).blocked)add('BLOCK','dashPlush',"The plush dash set sits in the driver's sightline to the windscreen.");
  // Stage C (SPEC-INTERIOR §5.4): nitrous fitment bands + the turbo ceiling. A shot in a
  // band gap (NA 4-cyl 61-74, turbo 4/6-cyl 41-49, turbo V8 61-74, NA V8 101-124 hp) gets
  // NO band verdict — the gaps stay open, never silently extended.
  {const P=byId('rearArea',cfg.rearArea);
   if(P&&P.kind==='nitrous'){const e=byId('engine',cfg.engine)||{},cyl=e.cyl||0,turbo=!!e.turbo,shot=P.shotHp;
    if(P.wet===0&&shot>125)add('BLOCK','rearArea','Dry nitrous above 125 hp — wet kit required above 125 hp.');
    else if(turbo){add('WARN','rearArea','Nitrous stacks on boost — cylinder pressures already elevated; '+shot+' hp adds to boosted cylinder pressure.');
      if(cyl===8){if(shot>100)add('BLOCK','rearArea','Turbo + nitrous stacks on boost — needs forged internals / built engine.');else if(shot>=75)add('WARN','rearArea','Turbo V8 + '+shot+' hp nitrous — needs fuel pump + colder plugs + timing retard.');}
      else{if(shot>60)add('BLOCK','rearArea','Turbo + nitrous stacks on boost — needs forged internals / built engine.');else if(shot>=50)add('WARN','rearArea','Turbo '+cyl+'-cyl + '+shot+' hp nitrous — needs fuel pump + colder plugs + timing retard.');}}
    else if(cyl===8){if(shot>150)add('BLOCK','rearArea','V8 + '+shot+' hp nitrous — needs forged internals / built engine.');else if(shot>=125)add('WARN','rearArea','V8 + '+shot+' hp nitrous — needs fuel pump + colder plugs + timing retard (wet kit).');}
    else{if(shot>100)add('BLOCK','rearArea',cyl+'-cyl + '+shot+' hp nitrous — needs forged internals / built engine.');else if(shot>=75)add('WARN','rearArea',cyl+'-cyl + '+shot+' hp nitrous — needs fuel pump + colder plugs + timing retard.');}}}
  if(cfg.exhaust==='race')add('WARN','exhaust','A straight-through pipe is louder than most track-day noise limits.');
  // grip (E): lateral grip grows slowly with tyre width and with negative camber up to about 3 degrees, then falls; braking grip falls with camber past 1.5 degrees
  const cA=(Math.abs(cfg.camberF||0)+Math.abs(cfg.camberR||0))/2,widthF=Math.pow(ty.tw/195,.25);
  const muLat=.88*widthF*(1+.035*Math.min(cA,3)-.05*Math.max(0,cA-3)),muLong=Math.max(.55,(1-.03*Math.max(0,cA-1.5)))*Math.min(1.15,widthF);
  // the car starts and drives unless the DRIVETRAIN cannot work (engine, gearbox, swap kit, differential); anything else is a warning or a part that is not fitted
  const runs=!I.some(i=>i.sev==='BLOCK'&&['engine','gearbox','swapkit','diff'].includes(i.slot));
  return {ok:!I.some(i=>i.sev==='BLOCK'),runs,issues:I,tyre:ty,zc,outer,inner,archGap,gapNeed,gc,muLat,muLong};
}

/* ===== PART PICKER SUPPORT: what happens if the person picks part X in slot S ===== */
const REL={engine:['engine','gearbox'],turbo:['turbo','engine','exhaust','gearbox'],gearbox:['gearbox','engine'],swapkit:['engine','gearbox'],exhaust:['exhaust'],seats:['seats','frame'],rearArea:['rearArea'],passArea:['passArea'],dashPlush:['dashPlush'],shifter:['shifter'],steering:['steering'],suspension:['suspension'],brakes:['brakes'],aeroF:['aeroF','suspension'],aeroR:['aeroR'],flares:['flares','wheel'],skirts:['skirts','suspension'],aerokit:['aeroF','aeroR','flares','skirts','wheel','suspension'],frame:['frame'],diff:['diff'],wheel:['wheel','brakes','suspension']};
const clone=o=>JSON.parse(JSON.stringify(o));
const blocksOf=(c,slots)=>checkFit(c).issues.filter(i=>i.sev==='BLOCK'&&slots.includes(i.slot));
const shortKit=k=>k.name.split('(')[0].split(':')[0].trim();
function kitCandidates(){const ks=allKits();return ks.filter(k=>k.id==='none').concat(ks.filter(k=>k.id!=='none'&&!k.generic).sort((a,b)=>a.mass-b.mass),ks.filter(k=>k.generic).sort((a,b)=>a.mass-b.mass));}
/* the lightest conversion that lets this engine and gearbox go in; {ok,cfg,kit} (when nothing works: the most permissive kit and the blocks that remain) */
function resolveDrivetrain(c){
  for(const k of kitCandidates()){const c2=Object.assign({},c,{swapkit:k.id});if(!blocksOf(c2,['engine','gearbox']).length)return {ok:true,cfg:c2,kit:k};}
  const c2=Object.assign({},c,{swapkit:'conv-xl'});return {ok:false,cfg:c2,kit:byId('swapkit','conv-xl'),issues:blocksOf(c2,['engine','gearbox'])};
}
const cleanPair=(eng,gb)=>gb.bell===eng.bell;
/* when an engine is chosen and the current gearbox is not its bellhousing family, offer the closest real gearbox that is (donor car first, then torque rating) */
function bestGearboxFor(c){
  const eng=byId('engine',c.engine);let best=null;
  for(const g of LIB.gearbox){if(!g.drives.includes(CAR.layout)||!cleanPair(eng,g))continue;
    const r=resolveDrivetrain(Object.assign({},c,{gearbox:g.id}));if(!r.ok)continue;
    const score=(g.donor===eng.donor?100:0)+((g.tq||0)>=effEngine(c).tq?20:0)-g.mass/10-r.kit.mass/2;if(!best||score>best.score)best={score,g,r};}
  return best;
}
function clampDrop(c){const su=byId('suspension',c.suspension);c.drop=Math.max(su.minDrop,Math.min(su.maxDrop,su.id==='sport'?30:(c.drop||0)));return c;}
/* apply a part with its consequences. {cfg, notes, state: 'fits'|'kit'|'blocked', reason, warns} */
function notBuilt(slot,id){const n=CAR.notBuilt&&CAR.notBuilt[slot];return !!(n&&n.includes(id));}
function applyPart(cfg,slot,id,extra){
  if(CAR.powertrain==='electric')return MODELX_EV.apply(cfg,slot,id,extra);
  if(notBuilt(slot,id))return {cfg:clone(cfg),notes:[],state:'later',reason:'Not built for the '+(CAR.short||CAR.name)+' yet: this car has no model for it, so it cannot be fitted or drawn.',warns:[]};
  {const why=CAR.refuse&&CAR.refuse[slot]&&CAR.refuse[slot][id];if(why)return {cfg:clone(cfg),notes:[],state:'blocked',reason:why,warns:[]};}   // a part this body physically cannot take (the reason says why)
  if(slot==='aerokit'){const k=aeroKits().find(x=>x.id===id)||byId('aerokit',id),c=clone(cfg),notes=[];for(const s of AERO_SLOTS)if(k.set[s])c[s]=k.set[s];
    for(const s of ['aeroF','aeroR']){const p=byId(s,c[s]);if(p&&p.mount==='replacement'){const rk=s==='aeroF'?'bumperF':'bumperR';if(c.removed&&c.removed[rk]){delete c.removed[rk];notes.push((s==='aeroF'?'Front':'Rear')+' bumper refitted as part of \''+p.name+'\'');}}}   // §4.1: a replacement bumper refits the bumper it replaces (latent: no replacement records at launch)
    const nb=AERO_SLOTS.find(s=>notBuilt(s,c[s]));if(nb)return {cfg:c,notes,state:'later',reason:'Not built for the '+(CAR.short||CAR.name)+' yet: '+byId(nb,c[nb]).name+'.',warns:[]};
    const sl=REL.aerokit,bl=blocksOf(c,sl),warns=checkFit(c).issues.filter(i=>i.sev==='WARN'&&sl.includes(i.slot)).map(i=>i.text);return {cfg:c,notes,state:bl.length?'blocked':'fits',reason:bl.length?bl[0].text:'',warns};}
  if(slot==='rearArea'&&!(CAR.removables&&CAR.removables.rearSeat))return {cfg:clone(cfg),notes:[],state:'later',reason:'The '+(CAR.short||CAR.name)+' has no rear seat area (2-seater): no rearArea replacement is built for it.',warns:[]};   // Stage B (SPEC-INTERIOR §1.5/§1.6): a rearArea replacement on a 2-seater is not offered — refused, never guessed
  const c=clone(cfg),notes=[];if(slot==='wheel'){const base=Object.assign({},c.wheel);if(extra&&extra.dia){delete base.bore;delete base.tw;delete base.ar;}c.wheel=Object.assign(base,extra||{});}else c[slot]=id;
  if(slot==='rearArea'||slot==='passArea'){const ak=slot==='rearArea'?'rearSeat':'passengerSeat';c.removed=c.removed||{};if(id==='stock')delete c.removed[ak];else c.removed[ak]=true;}   // Stage B (SPEC-INTERIOR §1.3): a replacement id => flag true, 'removed' => flag true, 'stock' => flag absent
  if(slot==='aeroF'||slot==='aeroR'){const p=byId(slot,id);if(p&&p.mount==='replacement'){const rk=slot==='aeroF'?'bumperF':'bumperR';if(c.removed&&c.removed[rk]){delete c.removed[rk];notes.push((slot==='aeroF'?'Front':'Rear')+' bumper refitted as part of \''+p.name+'\'');}}}   // §4.1: a replacement bumper refits the bumper it replaces (latent: no replacement records at launch)
  if(slot==='suspension')clampDrop(c);
  if(slot==='engine'||slot==='gearbox'){
    const eng=byId('engine',c.engine),gb=byId('gearbox',c.gearbox);
    if(slot==='engine'&&(!gb.drives.includes(CAR.layout)||!cleanPair(eng,gb))){const b=bestGearboxFor(c);if(b){c.gearbox=b.g.id;notes.push('Gearbox changed to '+b.g.name+' (it bolts straight to this engine)');}}
    const r=resolveDrivetrain(c);c.swapkit=r.cfg.swapkit;
    if(r.ok&&r.kit.id!=='none')notes.push('Swap kit added: '+shortKit(r.kit));
    if(!r.ok)return {cfg:c,notes,state:'blocked',reason:r.issues[0].text,warns:[]};
  }
  const bl=blocksOf(c,REL[slot]||[slot]);
  const warns=checkFit(c).issues.filter(i=>i.sev==='WARN'&&(REL[slot]||[slot]).includes(i.slot)).map(i=>i.text);
  if(bl.length)return {cfg:c,notes,state:'blocked',reason:bl[0].text,warns};
  return {cfg:c,notes,state:(slot==='engine'||slot==='gearbox')&&c.swapkit!=='none'?'kit':(notes.length?'swap':'fits'),reason:'',warns};
}

/* ---- engine torque curve (Nm) from the labelled peaks: idle, torque peak, power peak, redline. ESTIMATED shape; the peaks are the data. ---- */
function torqueCurve(eng){
  const idle=eng.idle||850,tqPk=eng.tq,Pn=eng.hp*7121/eng.hpRpm,pts=[[Math.max(500,idle-300),.45*tqPk],[idle,.58*tqPk],[(idle+eng.tqRpm)/2,.9*tqPk],[eng.tqRpm,tqPk]];
  if(eng.hpRpm>eng.tqRpm+300)pts.push([eng.hpRpm,Math.min(tqPk,Pn)]);
  pts.push([eng.red,Math.max(.55*Math.min(tqPk,Pn),Pn*.8)],[eng.red+400,.15*Math.min(tqPk,Pn)]);
  return rpm=>{if(rpm<=pts[0][0])return pts[0][1];for(let i=0;i<pts.length-1;i++)if(rpm<=pts[i+1][0]){const t=(rpm-pts[i][0])/(pts[i+1][0]-pts[i][0]);return pts[i][1]+(pts[i+1][1]-pts[i][1])*t;}return pts[pts.length-1][1];};
}
/* ---- what the build does to the car's behaviour (the driving model in garage_core.js reads these). Labels as everywhere: V verified, C calculated,
   E estimated (a typical figure from the references, not this car's own), D design (chosen). References: Milliken & Milliken, Race Car Vehicle Dynamics
   (tyre load sensitivity: peak Fy/Fz 1.10 at 900 lbf falls to 0.97 at 1800 lbf, fig. 2.9; production tyres peak at 6-10 deg slip); anti-roll bars move
   lateral load transfer to their axle, and the axle carrying more of it loses grip (suspensionsecrets.co.uk); roll gradients: passenger cars about 4-7
   deg/g, sports cars 3-4, race cars 1-2 (E). ---- */
const SUSP_PHYS={   // roll gradient deg/g (E), front share of the roll stiffness change (D), load-transfer lag s: how fast the dampers let the body take a set (D)
  stock:{roll:4.6,dF:0,lag:.16},hd:{roll:4.3,dF:0,lag:.11},sport:{roll:3.5,dF:.01,lag:.12},cup:{roll:2.9,dF:.02,lag:.09},coil:{roll:2.4,dF:0,lag:.08},air:{roll:4.0,dF:0,lag:.14}};
const AERO_CL={   // downforce area ClA (m2) front, rear; positive = downforce (E: typical of street parts of each kind; a street car's stock body lifts)
  islip:[.02,0],frontlip:[.03,0],splitter:[.10,0],mtfront:[.04,0],trunklip:[0,.03],ducktail:[0,.06],hatchspoiler:[0,.03],gtwing:[0,.40],mtrear:[0,.04],mtroof:[0,.03],z32wing:[0,.04],gsxwing:[0,.05]};
/* ---- turbo (SPEC-TURBO §3): density-ratio gain, single-source effective engine ---- */
const T_AMB=288.7;   // §3.3: ambient 59 °F = 288.7 K
function densityRatio(boostPsi,icEff){   // §3.3 FROZEN, verified: 1.30 @5 psi / 1.87 @15 psi intercooled (ε=0.75); 1.19 / 1.53 no-intercooler
  const psi=(boostPsi==null?0:+boostPsi),eps=(icEff==null?0:+icEff),hasIC=icEff!=null;
  const PR=1+psi/14.7,T_out=T_AMB*(1+(Math.pow(PR,0.286)-1)/0.70);
  const T_ic=hasIC?T_out-eps*(T_out-T_AMB):T_out;
  return PR*T_AMB/T_ic;}
function stockRecordFor(eng){return LIB.turbo.find(t=>t.stock&&t.stockFor===eng.id)||null;}   // §3.2: the engine's stock-turbo record, or null
function stockBoostOf(eng){const r=stockRecordFor(eng);return r?r.boostPsi:undefined;}   // §3.2: undefined when the stock record's field is [O] — NO fallback (no silent gain)
function stockIcEffOf(eng){const r=stockRecordFor(eng);return r?r.icEff:undefined;}
function LEGACY(eng){return eng.turbo&&!eng.sc?{from:(eng.tqRpm||4000)*.62,full:eng.tqRpm||4000,tau:/twin/i.test(eng.name||'')?.6:.8,off:.6}:null;}   // §3.5: the OLD boost construction, fenced — stock-turbo engines with an INCOMPLETE stock record only; NEVER a part-fitted engine
function effEngine(cfg){   // §3.2: the single source of effective engine numbers — base record + fitted turbo record's gain, or the base record unchanged
  const eng=byId('engine',cfg.engine)||{};
  const tb=byId('turbo',cfg.turbo)||null;   // 'none' record for NA cars (§1.1); stock record id for stock-turbo cars; kit id when fitted
  if(!tb)return Object.assign({},eng,{turbo:eng.turbo?1:0});
  if(tb.id==='none')return Object.assign({},eng,{turbo:eng.turbo?1:0});
  if(tb.stock&&tb.stockFor===eng.id)return Object.assign({},eng,{turbo:1});   // stock record: peaks already boosted; record supplies curve shape only (§3.5)
  // SPEC-GAP GUARD (BUILD note — see build report): the §5.6 BLOCK is what keeps this branch from running on [O] stock fields, but applyPart's engine-swap path checks only REL.engine — it never consults the turbo slot — so a stock-turbo car that swaps engines keeps its stale stock record and WOULD reach this branch with stockBoostOf/stockIcEffOf undefined (NaN hp). In that BLOCKed state the gain is uncomputable, so return the base record unchanged (no gain, no NaN) — never a silent gain.
  if(eng.turbo&&(stockBoostOf(eng)==null||stockIcEffOf(eng)==null))return Object.assign({},eng,{turbo:1});
  const dr=densityRatio(tb.boostPsi,tb.icEff);   // §3.3
  const base=eng.turbo?dr/densityRatio(stockBoostOf(eng),stockIcEffOf(eng)):dr;   // eng.turbo: upgrade gains RELATIVE to its stock turbo; !eng.turbo: kit gains from the NA baseline
  return Object.assign({},eng,{turbo:1,hp:eng.hp*base,tq:eng.tq*base,tqRpm:tb.fullBoost,hpRpm:eng.hpRpm,red:eng.red,idle:eng.idle});}   // tqRpm = tb.fullBoost [D]: on a turbocharged engine the torque peak sits at/just after full boost
function vehiclePhysics(cfg,res,ro){
  if(CAR.powertrain==='electric')return MODELX_EV.physics(cfg,res,ro);
  const eng=byId('engine',cfg.engine)||{},df=byId('diff',cfg.diff)||{},br=byId('brakes',cfg.brakes)||byId('brakes','stock'),su=SUSP_PHYS[cfg.suspension]||SUSP_PHYS.stock,w=cfg.wheel||{},A=aeroParts(cfg),fr=byId('frame',cfg.frame)||{};
  const layout=CAR.layout||'FR',ty=res&&res.tyre;
  // tyres: a lower profile stiffens the sidewall: the cornering stiffness factor B grows as the aspect ratio falls (D: 9 at a 70 profile, 13.5 at 40)
  const tc=byId('tyre',cfg.tyre||(CAR.stock&&CAR.stock.tyre)||'touring')||{mu:1,B:0},ar=(ty&&ty.ar)||w.ar||60,B=9+(70-ar)*.15+(tc.B||0);   // and the compound: grip (muMul) and stiffness
  // roll: the car's own lateral load transfer split (front share, D from its layout unless the car says) shifted by the springs and bars
  const lltd0=CAR.lltdF||({FF:.62,FR:.55,MR:.48,RR:.45,AWD:.56}[layout]||.55);
  // centre of gravity: the car's own (E) lowered 0.8 mm per mm of drop (the unsprung parts do not move: D), a cage adds a little high up (C from its mass)
  const hcg=(CAR.hcg||.5)-(cfg.drop||0)*.0008+((fr.mass||0)*.6)/(ro.mass||1200)*.6;
  // track: twice the tyre centre's distance from the car's centreline (C from the wheel's offset; spacers and lower offsets widen it)
  const track=res&&res.zc?2*res.zc/1000:1.42;
  // differential: torque bias ratio (E: open 1; clutch-type LSD about 2.5; viscous about 2; welded locks both wheels together)
  const tbr=df.welded?99:df.viscous?2:df.lsd?2.5:1;
  // brakes: heat capacity grows with the rotor's size (D: as its diameter to the power 2.2, relative to a 260 mm rotor), so bigger brakes fade later
  const heat=Math.pow((br.rotor||260)/260,2.2);
  // aero: the stock body lifts (E: ClA +0.10 front, +0.14 rear for an 80s / 90s road car); parts add downforce
  const {clF,clR}=aeroBalance(cfg);   // §4.5: one source of truth — checkFit's rear-balance WARN reads the same values
  // forced induction (SPEC-TURBO §3.4 — the old boost construction is DELETED; see LEGACY): a turbo's boost builds with exhaust flow (revs) and takes time (lag)
  const eff=effEngine(cfg);   // §3.4: the chain reads the same eff applyDrive/readout use
  const tb=byId('turbo',cfg.turbo)||null;   // 'none' record, stock record, or fitted kit (§1.1)
  const stockRec=(tb&&tb.stock)?tb:null;
  const fittedKit=(tb&&!tb.stock&&tb.id!=='none')?tb:null;
  // Completeness predicate [D]: a record drives a curve ONLY when every field the curve reads is frozen. tau is always defined ([D] 0.8 single / 0.6 twin); spoolStart, fullBoost, boostPsi, icEff must all be frozen.
  const complete=(r)=>r&&r.spoolStart!=null&&r.fullBoost!=null&&r.boostPsi!=null&&r.icEff!=null;
  const curveOf=(r)=>({from:r.spoolStart,full:r.fullBoost,tau:r.tau,off:clampv(1/densityRatio(r.boostPsi,r.icEff),.40,.75)});
  const boost=(eff.turbo&&!eff.sc&&fittedKit&&complete(fittedKit))?curveOf(fittedKit)
    :(eff.turbo&&!eff.sc&&stockRec&&complete(stockRec))?curveOf(stockRec)
    :(eff.turbo&&!eff.sc&&!fittedKit)?LEGACY(eng)   // §3.5 fallback, fenced
    :null;
  return {B,muMul:tc.mu||1,rollPerG:su.roll,lag:su.lag,lltdF:lltd0+su.dF,hcg,track,tbr,heat,clF,clR,boost,abs:CAR.abs!==false};
}
/* ---- readouts (CALCULATED from labelled inputs; estimates marked) ---- */
function massOf(cfg){
  if(CAR.powertrain==='electric')return MODELX_EV.mass(cfg);
  const eng=byId('engine',cfg.engine),gb=byId('gearbox',cfg.gearbox),df=byId('diff',cfg.diff),ex=byId('exhaust',cfg.exhaust),
        se=byId('seats',cfg.seats),su=byId('suspension',cfg.suspension),br=byId('brakes',cfg.brakes),A=aeroParts(cfg),fr=byId('frame',cfg.frame),kit=byId('swapkit',cfg.swapkit)||byId('swapkit','none'),
        sw=byId('steering',cfg.steering),sh=byId('shifter',cfg.shifter),tb=byId('turbo',cfg.turbo)||byId('turbo','none');
  const S={eng:stockPart('engine'),gb:stockPart('gearbox'),df:stockPart('diff'),ex:stockPart('exhaust'),se:stockPart('seats'),su:stockPart('suspension'),br:stockPart('brakes'),sw:stockPart('steering'),sh:stockPart('shifter'),tb:stockPart('turbo')||byId('turbo','none')};
  const items=[];   // [label, delta kg, front share]
  const W=CAR.wdist||{engine:.6,gearbox:.15,seats:.45};
  const push=(l,m,k)=>{if(m)items.push([l,m,k]);};
  push('engine',eng.mass-S.eng.mass,W.engine);push('turbocharger',tb.mass-S.tb.mass,W.turbo||.8);push('gearbox',gb.mass-S.gb.mass,W.gearbox);push('diff',df.mass-S.df.mass,0);push('exhaust',ex.mass-S.ex.mass,W.exhaust||.1);
  push('seats',(se.mass-S.se.mass)*2,W.seats);push('shifter',sh.mass-S.sh.mass,.5);push('suspension',su.mass-S.su.mass,.5);push('brakes',(br.mass-S.br.mass)*2,.5);push('front lip',A.aeroF.mass||0,1.3);push('rear spoiler',A.aeroR.mass||0,-.3);push('flares',A.flares.mass||0,.5);push('side skirts',A.skirts.mass||0,.5);push('frame',fr.mass,.45);   // E: front axle shares from where they sit (a lip ahead of the front axle, a wing behind the rear one)
  push('swap kit',kit.mass,.7);push('steering',sw.mass-S.sw.mass,.9);
  {const hb=byId('handbrake',cfg.handbrake||'stock'),mh=byId('mirrorHang',cfg.mirrorHang||'none');if(hb)push('handbrake',hb.mass,.45);if(mh)push('mirror hanger',mh.mass,.6);const tk=byId('trunk',cfg.trunk||'none');if(tk)push('trunk',tk.mass,.05);}   // v20
  { // Stage B (SPEC-INTERIOR §1.4): a replaced area pushes EXACTLY ONE net entry (part mass - seat mass); the dash set only adds its mass
    const net=(key,seatKey,label)=>{const id=cfg[key];if(!id||id==='stock'||id==='removed')return;const P=byId(key,id),S=(CAR.removables||{})[seatKey];if(!P||!S)return;const m=P.kind==='nitrous'?nitrousKitMass(P):P.mass,d=m-S.mass;push(label+': '+P.name,d,Math.abs(d)>=5?(m*P.front-S.mass*S.front)/d:S.front);};
    net('rearArea','rearSeat','rear seat area');net('passArea','passengerSeat','passenger seat area');
    const dp=byId('dashPlush',cfg.dashPlush);if(dp)push('dash plush set',dp.mass,dp.front);}
  const R=CAR.removables||{};let rm=0;
  for(const k in R){const wantOff=removed(cfg,k);
    if(k==='rearSeat'&&cfg.rearArea&&cfg.rearArea!=='stock'&&cfg.rearArea!=='removed')continue;   // Stage B (§1.4): a replaced area's seat is inside its net entry — never also a removal saving
    if(k==='passengerSeat'&&cfg.passArea&&cfg.passArea!=='stock'&&cfg.passArea!=='removed')continue;
    if(k==='rearSeat'&&!wantOff&&fr.deletesRearSeat){push('rear seat (deleted by '+fr.name.toLowerCase()+')',-R.rearSeat.mass,R.rearSeat.front);continue;}
    if(wantOff){push('removed: '+R[k].name,-R[k].mass,R[k].front);}}
  let mass=CAR.baseMass+items.reduce((a,b)=>a+b[1],0);
  const fw=(CAR.stockFrontWeight*CAR.baseMass+items.reduce((a,b)=>a+b[1]*b[2],0))/mass;
  return {mass,fw,items};
}
// Stage C (SPEC-INTERIOR §5.2/§1.4): the nitrous kit's live mass — the bottle mass follows
// the fill (full kit 12.9 kg → empty 8.35 kg), so the car gets lighter as it sprays.
// Reads the ONE state (window.__GARAGE.state === the driver IIFE's state); absent ⇒ 10.0 lb,
// exactly a fresh kit. With the standard share formula this reproduces §1.4's worked nets
// exactly: full kit −1.8 kg share 0.1, empty kit −6.35 kg share 0.36.
function nitrousFillLb(){try{const nz=window.__GARAGE&&window.__GARAGE.state?window.__GARAGE.state.nitrous:null;return nz&&typeof nz.fill==='number'?nz.fill:10.0;}catch(e){return 10.0;}}
function nitrousKitMass(P){return P.emptyKg+nitrousFillLb()*0.4536+P.kitHardwareKg;}
function readout(cfg){
  if(CAR.powertrain==='electric')return MODELX_EV.readout(cfg);
  const eng=byId('engine',cfg.engine),gb=byId('gearbox',cfg.gearbox),df=byId('diff',cfg.diff),ex=byId('exhaust',cfg.exhaust),effEng=effEngine(cfg);
  const ty=tyreFor(cfg.wheel.dia,cfg.wheel.width,cfg.wheel.tw,cfg.wheel.ar),M=massOf(cfg),mass=M.mass;
  const nz=window.__GARAGE&&window.__GARAGE.state?window.__GARAGE.state.nitrous:null,hp=effEng.hp+ex.hp+(nz&&nz.spraying?nz.shotHp:0);   // Stage C: the readout reads the SAME state.nitrous the drive loop reads — spraying adds the shot, and only while spraying
  const rEff=ty.OD/2000;                                        // m
  const fd=gb.final||df.ratio,vmaxGear=gb.ratios.map(g=>eng.red/60*2*Math.PI*rEff/(g*fd)*3.6);   // km/h at redline per gear
  const rho=1.2,eta=.88,CdA=CAR.stockDragCdA*aeroDrag(cfg),Crr=.012;
  let vd=0;for(let v=1;v<120;v+=.05){const P=0.5*rho*CdA*v*v*v+Crr*mass*9.81*v;if(P>hp*745.7*eta){vd=v;break;}}
  const top=Math.min(vmaxGear[vmaxGear.length-1],vd*3.6);
  return {mass:Math.round(mass),hp,pw:hp/mass*1000,vmaxGear,top,drag:vd*3.6,speedoErr:(ty.OD/CAR.stockOD-1)*100,frontPct:M.fw*100,OD:ty.OD,items:M.items,tq:effEng.tq};
}
// handling at a glance (E: estimates from the same numbers the driving model uses), for the shop's "Handling vs stock" panel
//  - cornering: the steady lateral acceleration where the weaker axle runs out of grip, with each axle's load transfer (CG height over track, its
//    share from the springs and bars) and the tyres' load sensitivity, as stepCar computes them (the rear's 7 % grip bias included)
//  - braking from 100 km/h: the tyres' braking grip with ABS (97 %), rolling resistance and drag, plus 0.1 s for the pedal to bite
//  - lean: degrees of body roll per g from the suspension; steering response: the tyres' cornering stiffness (profile, compound);
//    brake fade: the brakes' heat capacity (rotor size)
function handling(cfg,res,ro){res=res||checkFit(cfg);ro=ro||readout(cfg);const vp=vehiclePhysics(cfg,res,ro);
  const mu=(res.muLat||.9)*vp.muMul,muL=Math.min(mu*1.05,(res.muLong||1)*vp.muMul),wf=(ro.frontPct||53)/100,M=ro.mass,g=9.81,h=vp.hcg,tr=vp.track,lt=vp.lltdF;
  const F0f=M*g*wf/2,F0r=M*g*(1-wf)/2;let ay=mu*g;
  for(let i=0;i<30;i++){const dT=M*ay*h/tr,df=Math.min(F0f,dT*lt),dr=Math.min(F0r,dT*(1-lt));const Gf=mu*(2*F0f-.24*df*df/F0f),Gr=mu*1.07*(2*F0r-.24*dr*dr/F0r);
    ay=ay*.5+Math.min(Gf/(M*wf),Gr/(M*(1-wf)))*.5;}
  const v=100/3.6,a=Math.min(muL*.97,1.15)*g+.011*g+.5*1.2*CAR.stockDragCdA*aeroDrag(cfg)*v*v/2/M;   // plus rolling resistance and drag (its mean over the stop)
  return {lat:ay/g,brake:v*.1+v*v/(2*a),roll:vp.rollPerG,resp:vp.B,fade:vp.heat};}
let HSTOCK=null;function handlingStock(){const id=CAR&&CAR.id;if(!HSTOCK||HSTOCK.id!==id){const c=defaultCfg();HSTOCK=Object.assign({id},handling(c));}return HSTOCK;}
function defaultCfg(){if(CAR.powertrain==='electric')return MODELX_EV.config();const s=CAR.stock;const c={tyre:s.tyre||'touring',engine:s.engine,turbo:s.turbo||'none',swapkit:'none',handbrake:'stock',mirrorHang:'none',trunk:'none',gearbox:s.gearbox,diff:s.diff,exhaust:s.exhaust,seats:s.seats,steering:s.steering,suspension:s.suspension,brakes:s.brakes,aeroF:(s.aeroF||'none'),aeroR:(s.aeroR||'none'),flares:(s.flares||'none'),skirts:(s.skirts||'none'),frame:'stock',shifter:'stock',rearArea:'stock',passArea:'stock',dashPlush:'none',
  wheel:JSON.parse(JSON.stringify(s.wheel)),drop:0,removed:{}};
  if(!(CAR.removables&&CAR.removables.rearSeat))delete c.rearArea;   // Stage B (SPEC-INTERIOR §1.2): 2-seaters have no rear area — no cfg key
  return c;}
if(typeof module!=='undefined')module.exports={handling,handlingStock,vehiclePhysics,SUSP_PHYS,AERO_CL,AERO_SLOTS,aeroParts,aeroDrag,aeroKits,kitMatch,migrateAero,notBuilt,CAR:()=>CAR,setShell,SHELLS,LIB,CATALOG,byId,tyreFor,checkFit,readout,defaultCfg,massOf,torqueCurve,effEngine,densityRatio,kitsFor,GENERIC_KITS,applyPart,resolveDrivetrain,bestGearboxFor,shortKit,REL};
