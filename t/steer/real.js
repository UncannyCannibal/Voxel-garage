// STEER-03: the real-car steering, measured on the page's own physics (G.update at 120 Hz). arg: {speeds:[kmh..], assist:'normal'|'drift'|'off'}
// Reports the steering wheel (sw, deg) and the front wheels (delta, deg) with what the car does: yaw rate, lateral g, body slip, heading, sideways step.
async(arg)=>{const G=window.__GARAGE,S=G.state,K=G.keys,wait=ms=>new Promise(r=>setTimeout(r,ms));
  document.getElementById('mDrive').click();await wait(300);if(arg.assist)G.setAssist(arg.assist);
  const dt=1/120,D=57.2958,reset=(v)=>{for(const k of ['w','s','a','d','arrowleft','arrowright',' ','shift','e'])K[k]=false;S.x=0;S.z=0;S.psi=0;S.v=v;S.vy=0;S.yawR=0;S.steer=0;S.sw=0;S.steerIn=0;S.throttle=0;S.brake=0;S.ayF=0;S.axF=0;S.roll=0;S.pitch=0;S.kT=0;S.kDir=0;},
        r1=x=>+x.toFixed(1),r2=x=>+x.toFixed(2);
  const out={car:G.CARID,lay:G.phys.EV?'EV':G.phys.LAYOUT,lockDeg:r1(((G.MOD&&G.MOD.maxSteer)||.52)*D),tests:{}};
  // parked: hold the key until the wheel stops; the steering wheel's angle at full lock and how long the hands take
  reset(0);K.a=true;let tFull=null;for(let i=0;i<600;i++){G.update(dt);if(tFull===null&&S.steer>=.999)tFull=r2(i*dt);}K.a=false;
  out.parked={swLockDeg:r1(S.sw*D),turnsLL:r2(2*S.sw*D/360),ratio:r1(S.sw/S.delta),deltaDeg:r1(S.delta*D),tFull};
  let tBack=null;for(let i=0;i<600;i++){G.update(dt);if(tBack===null&&Math.abs(S.sw*D)<2)tBack=r2(i*dt);}out.parked.tCentre=tBack;
  for(const kmh of arg.speeds){const v=kmh/3.6,o={};
    const hold=()=>{K.w=S.v<v;};   // the throttle holds about the speed
    // a tap: the key for 0.15 s, then hands off for 2 s
    reset(v);let sw0=0,pk=0,pkA=0;for(let i=0;i<=258;i++){K.a=i<18;hold();G.update(dt);if(i===17)sw0=S.sw*D;pk=Math.max(pk,Math.abs(S.delta*D));pkA=Math.max(pkA,Math.abs(S.ay||0));}
    o.tap={swDeg:r1(sw0),peakDeltaDeg:r2(pk),peakG:r2(pkA/9.81),headingDeg:r1(S.psi*D),stepM:r2(-S.z*.02)};
    // a hold of 0.5 s, then hands off: the most lateral g, the most body slip, how long the wheel takes back to within 2 deg, and the heading after
    reset(v);let sw1=0,pg=0,ps=0,tc=null;for(let i=0;i<=420;i++){K.a=i<60;hold();G.update(dt);if(i===59)sw1=S.sw*D;pg=Math.max(pg,Math.abs(S.ay||0));ps=Math.max(ps,Math.abs(S.slip||0));if(i>=60&&tc===null&&Math.abs(S.sw*D)<2)tc=r2((i-60)*dt);}
    o.hold05={swDeg:r1(sw1),deltaDeg:r2(sw1/(S.sw?S.sw/S.delta:1)/1),peakG:r2(pg/9.81),peakSlipDeg:r1(ps*D),tCentre:tc,headingDeg:r1(S.psi*D),kmhEnd:Math.round(S.v*3.6)};
    // a long corner on taps: 0.12 s on, 0.18 s off, for 6 s (the hold-a-part-turn technique on keys): the steering wheel's mean and ripple, the lateral g
    reset(v);let sws=[],ays=[];for(let i=0;i<=720;i++){K.a=(i%36)<14;hold();G.update(dt);if(i>360){sws.push(S.sw*D);ays.push((S.ay||0)/9.81);}}
    const mean=a=>a.reduce((x,y)=>x+y,0)/a.length;o.taps={swMean:r1(mean(sws)),swRipple:r1((Math.max(...sws)-Math.min(...sws))/2),gMean:r2(mean(ays)),kmhEnd:Math.round(S.v*3.6),slipDeg:r1((S.slip||0)*D)};
    // a lane change: left 0.35 s, right 0.35 s, hands off 3 s: the step, the heading left over, the most slip
    reset(v);let ms=0;for(let i=0;i<=444;i++){K.a=i<42;K.d=i>=42&&i<84;hold();G.update(dt);ms=Math.max(ms,Math.abs(S.slip||0));}
    o.lane={stepM:r2(-S.z*.02),headingDeg:r1(S.psi*D),peakSlipDeg:r1(ms*D),swEnd:r1(S.sw*D)};
    // the key held 3 s with full throttle: how far the body slides (with assists on, nothing should spin)
    reset(v);let mx=0;for(let i=0;i<=360;i++){K.a=true;K.w=true;G.update(dt);mx=Math.max(mx,Math.abs(S.slip||0));}o.long={peakSlipDeg:r1(mx*D),swEnd:r1(S.sw*D),kmhEnd:Math.round(S.v*3.6)};
    out.tests[kmh]=o;}
  reset(0);for(const k in K)K[k]=false;G.setAssist('normal');document.getElementById('mGarage').click();return out;}
