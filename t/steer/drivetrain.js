// STEER-03 / #42: what the drivetrain does in a corner, with the steering wheel held still (the touch slider's analog input sets the wheel's angle).
// arg: {assist:'off'|'normal'|'drift', kmh:50, g:0.55}. A steady corner is set up at the speed with the wheel at the angle that gives about g lateral,
// then: (a) full throttle for 1.5 s, (b) from the same corner, the throttle lifted sharply. Body slip (deg, + = tail out), yaw rate, path radius.
async(arg)=>{const G=window.__GARAGE,S=G.state,K=G.keys,wait=ms=>new Promise(r=>setTimeout(r,ms));
  document.getElementById('mDrive').click();await wait(300);G.setAssist(arg.assist||'off');
  const dt=1/120,D=57.2958,kmh=arg.kmh||50,v0=kmh/3.6,gT=arg.g||.55,L=G.phys.WHEELBASE;
  const reset=()=>{for(const k in K)K[k]=false;S.gpThr=0;S.x=0;S.z=0;S.psi=0;S.v=v0;S.vy=0;S.yawR=0;S.steer=0;S.sw=0;S.steerIn=0;S.throttle=0;S.brake=0;S.ayF=0;S.axF=0;S.kT=0;S.kDir=0;S.wspin=0;};
  // find the wheel angle (as a fraction of lock) for gT at v0 by a few settles; the throttle is feathered to hold the speed
  const settle=(f,T)=>{reset();S.steerIn=Math.pow(f,1/1.5);for(let i=0;i<T*120;i++){S.gpThr=Math.max(0,Math.min(1,(v0-S.v)*.6+.12));G.update(dt);}return Math.abs(S.ay||0)/9.81;};
  let lo=0,hi=.6;for(let k=0;k<12;k++){const m=(lo+hi)/2;if(settle(m,2.5)<gT)lo=m;else hi=m;}const f=(lo+hi)/2;
  const snap=t=>({t,slip:+((S.slip||0)*D).toFixed(1),yaw:+(S.yawR*D).toFixed(1),g:+((S.ay||0)/9.81).toFixed(2),R:+Math.abs(S.v/(S.yawR||1e-6)).toFixed(1),kmh:Math.round(S.v*3.6),spin:+(S.wspin||0).toFixed(2),esc:S.esc});
  settle(f,3);const base=snap(0);const pw=[];for(let i=1;i<=180;i++){S.gpThr=1;G.update(dt);if(i%30===0)pw.push(snap(+(i*dt).toFixed(1)));}
  // lift-off: from the corner with a light throttle, then off
  settle(f,3);const pre=snap(0);const lf=[];for(let i=1;i<=120;i++){S.gpThr=0;G.update(dt);if(i%30===0)lf.push(snap(+(i*dt).toFixed(1)));}
  for(const k in K)K[k]=false;S.steerIn=0;S.gpThr=0;G.setAssist('normal');document.getElementById('mGarage').click();
  return {car:G.CARID,lay:G.phys.EV?'EV':G.phys.LAYOUT,diff:G.cfg.diff,wheelFrac:+f.toFixed(3),swDeg:+(f*(S.sw&&S.steer?S.sw/S.steer:0)*D).toFixed(0),base,power:pw,liftPre:pre,lift:lf};}
