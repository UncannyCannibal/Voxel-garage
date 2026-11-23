/* Explicit electric adapter. Shared dispatch calls this only for CAR.powertrain==='electric'.
   Dynamics are DESIGN simulation, with VERIFIED / ESTIMATED inputs in parts_modelx.js.
   The shared two-axle tyre model does not simulate independent rear-wheel torque vectoring. */
const MODELX_EV={
  slots:[['motor','Motors'],['reduction','Reduction'],['battery','Battery'],['steering','Steering'],['suspension','Suspension'],['brakes','Brakes'],['wheel','Wheels and tires'],['tyre','Tire compound']],
  allowed:{motor:['modelx-tri'],reduction:['modelx-756'],battery:['modelx-pack'],steering:['modelx-yoke','modelx-wheel'],suspension:['stock'],brakes:['modelx-brakes'],wheel:['modelx-20','modelx-22'],tyre:['touring','summer','sport','semi','slick']},
  config(){return {motor:'modelx-tri',reduction:'modelx-756',battery:'modelx-pack',seats:'modelx-six',steering:'modelx-yoke',suspension:'stock',brakes:'modelx-brakes',tyre:'summer',frame:'stock',aeroF:'none',aeroR:'none',flares:'none',skirts:'none',wheel:JSON.parse(JSON.stringify(CAR.stock.wheel)),drop:0,removed:{}};},
  fit(c){
    const issues=[],add=(slot,text)=>issues.push({sev:'BLOCK',slot,text});
    for(const s of ['engine','gearbox','turbo','swapkit','diff','exhaust','shifter','rearArea'])if(c[s]!==undefined)add(s,'This electric drivetrain has no '+s+' slot.');
    for(const [s,ids] of Object.entries(this.allowed))if(s!=='wheel'&&(!ids.includes(c[s])||!byId(s,c[s])))add(s,'This part is not built for the Model X.');
    const w=c.wheel||{},ty=tyreFor(w.dia,w.width,w.tw,w.ar),expected=LIB.wheel.find(p=>p.id===w.style);
    if(!expected||!this.allowed.wheel.includes(w.style)||['dia','width','et','pcd','tw','ar'].some(k=>w[k]!==expected[k]))add('wheel','Use a complete 20-inch or 22-inch staggered Model X wheel set. Custom wheel geometry is not built.');
    if((c.drop||0)!==0||c.camberF||c.camberR)add('suspension','Medium stock ride height and stock camber are the built configuration.');
    for(const s of AERO_SLOTS)if(c[s]!=='none')add(s,'Model X aftermarket body parts are not built.');
    if(c.frame!=='stock'||c.seats!=='modelx-six'||Object.values(c.removed||{}).some(Boolean))add('frame','The six-seat stock cabin and frame are the built configuration.');
    const zc=852.5,archGap=CAR.archTop-CAR.hubY-ty.OD/2; // CALCULATED, front track / 2
    return {ok:!issues.length,runs:!issues.length,issues,tyre:ty,zc,outer:zc+ty.tw/2,inner:zc-ty.tw/2,archGap,gapNeed:25,gc:166,muLat:.88*Math.pow(ty.tw/195,.25),muLong:1.08};
  },
  mass(c){const d=(byId('steering',c.steering)||{}).mass-3;return {mass:2468+(d||0),fw:.49,items:d?[['steering',d,.8]]:[]};}, // VERIFIED total; ESTIMATED split; DESIGN optional mass
  readout(c){const m=this.mass(c),ty=tyreFor(c.wheel.dia,c.wheel.width,c.wheel.tw,c.wheel.ar),s=MODELX_SPEC;return {mass:m.mass,hp:s.powerHP,pw:s.powerHP/m.mass*1000,vmaxGear:[s.maxKph],top:s.maxKph,drag:s.maxKph,speedoErr:0,frontPct:m.fw*100,OD:ty.OD,items:m.items,tq:s.torqueNM,powerLabel:s.powerLabel,torqueLabel:s.torqueLabel};},
  physics(c,res,ro){const tc=byId('tyre',c.tyre)||{mu:1,B:0};return {B:9+(70-c.wheel.ar)*.15+(tc.B||0),muMul:tc.mu||1,rollPerG:2.2,lag:.14,lltdF:.52,hcg:MODELX_SPEC.hcg,track:1.7075,tbr:2.5,heat:Math.pow(380/260,2.2),clF:-.05,clR:-.07,boost:null,abs:true};}, // DESIGN chassis dynamics
  apply(c,slot,id,extra){const n=clone(c);if(slot==='wheel'){const p=LIB.wheel.find(p=>p.id===id);if(p&&this.allowed.wheel.includes(id))n.wheel={style:id,dia:p.dia,width:p.width,et:p.et,pcd:p.pcd,bore:p.bore,tw:p.tw,ar:p.ar};else if(extra)n.wheel=Object.assign({},n.wheel,extra);}
    else n[slot]=id;const r=this.fit(n);return {cfg:n,notes:[],state:r.ok?'fits':'blocked',reason:r.issues.length?r.issues[0].text:'',warns:[]};},
  valid(c){const n=this.config();if(!c)return n;for(const [s,ids] of Object.entries(this.allowed)){if(s==='wheel'){if(c.wheel&&ids.includes(c.wheel.style))n.wheel=this.apply(n,'wheel',c.wheel.style).cfg.wheel;}else if(ids.includes(c[s])&&byId(s,c[s]))n[s]=c[s];}return n;},
  driveSetup(phys,state,c,res){const ro=this.readout(c),ty=res.tyre;
    Object.assign(phys,this.physics(c,res,ro),{EV:true,GEAR:[0,1],FINAL:7.56,MASS:ro.mass,WR_M:(ty.OD/2-15)/1000,RED:18000,CYL:0,EXH:0,TQ:1,NQ:0,BUILD_OK:res.runs,MU:res.muLat,MU_LONG:res.muLong,WHEELBASE:2.965,LAYOUT:'AWD',WF:.49,HCG:MODELX_SPEC.hcg,CdA:CAR.stockDragCdA,BRAKE:1.15*9.81*ro.mass});
    phys.MU*=phys.muMul;phys.MU_LONG*=phys.muMul;state.gear=state.gear===0?0:1;state.nitrous=null;
    if(!Number.isFinite(state.batteryKWh))state.batteryKWh=MODELX_SPEC.usableKWh*.8; // DESIGN initial charge 80%, not refilled on shop refresh
  },
  force(phys,state,reverse){const s=MODELX_SPEC,v=Math.abs(state.v),r=phys.WR_M,omega=v/r*s.ratio;
    state.rpm=omega*60/(2*Math.PI);state.gear=reverse?0:1;state.evRequestedKW=0;
    if(!phys.BUILD_OK)return 0;
    if(state.throttle>0&&state.batteryKWh>0){const lim=(reverse?s.reverseKph:s.maxKph)/3.6,fade=Math.max(0,Math.min(1,(lim-v)/.5)),tq=Math.min(s.torqueNM,s.powerKW*1000/Math.max(1,omega));
      return (reverse?-1:1)*tq*s.ratio*s.efficiency/r*state.throttle*fade;}
    if(v>.5&&state.batteryKWh<s.usableKWh-.01){const f=Math.min(phys.MASS*9.81*s.regenG,s.regenKW*1000/Math.max(v,1))*Math.min(1,(v-.5)/2);return -Math.sign(state.v)*f;}
    return 0;
  },
  energy(state,powerW,dt){const s=MODELX_SPEC;state.evPowerKW=powerW/1000;const dc=powerW>=0?powerW/s.efficiency:powerW*s.chargeEfficiency;
    state.batteryKWh=Math.max(0,Math.min(s.usableKWh,state.batteryKWh-(dc+s.auxiliaryKW*1000)*dt/3600000));}
};
