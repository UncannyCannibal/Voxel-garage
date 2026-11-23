// steering response, measured on the page's own physics (G.update at 120 Hz). arg: {speeds:[kmh..]}
async(arg)=>{const G=window.__GARAGE,S=G.state,K=G.keys,wait=ms=>new Promise(r=>setTimeout(r,ms));
  document.getElementById('mDrive').click();await wait(300);
  const dt=1/120,reset=(v)=>{for(const k of ['w','s','a','d','arrowleft','arrowright',' ','shift'])K[k]=false;S.x=0;S.z=0;S.psi=0;S.v=v;S.vy=0;S.yawR=0;S.steer=0;S.steerIn=0;S.throttle=0;S.brake=0;S.ayF=0;S.axF=0;S.roll=0;S.pitch=0;};
  const out={car:G.CARID,layout:G.phys.LAYOUT||'',ev:!!G.phys.EV,mass:G.phys.MASS,wb:G.phys.WHEELBASE,lockMax:+(((G.MOD&&G.MOD.maxSteer)||.52)*57.3).toFixed(1),tests:{}};
  for(const kmh of arg.speeds){const v=kmh/3.6;
    // 1. step steer: left key held 2 s (throttle held to keep the speed)
    reset(v);let rec=[];K.a=true;K.w=true;
    for(let i=0;i<=240;i++){G.update(dt);if(i%12===0)rec.push([+(i*dt).toFixed(2),+S.steer.toFixed(3),+(S.delta*57.3).toFixed(2),+(S.yawR*57.3).toFixed(1),+((S.ay||0)/9.81).toFixed(2),+(Math.abs(S.z)*.02).toFixed(2),+(S.v*3.6).toFixed(0)]);}
    K.a=false;const rEnd=rec[rec.length-1][3];const t=f=>{const x=rec.find(r=>Math.abs(r[3])>=Math.abs(rEnd)*f);return x?x[0]:null;};
    // 2. a tap: left key for 0.25 s then released (a quick correction) - peak yaw and lateral offset after 1.5 s
    reset(v);K.w=true;let pk=0,off=0;for(let i=0;i<=180;i++){K.a=i<30;G.update(dt);pk=Math.max(pk,Math.abs(S.yawR));off=Math.abs(S.z)*.02;}K.a=false;
    // 3. one-lane swerve: how long until the car is 3.6 m to the left, holding the key, then counter-steering to straighten (key time chosen by the test)
    reset(v);K.w=true;let tLane=null;for(let i=0;i<=600;i++){K.a=true;G.update(dt);if(Math.abs(S.z)*.02>=3.6){tLane=+(i*dt).toFixed(2);break;}}K.a=false;K.w=false;
    // 4. swerve: left key 0.6 s, right key 0.6 s, then hands off: the sideways step, the heading it ends with, and how far the car wanders after
    reset(v);K.w=true;let sw=[];for(let i=0;i<=360;i++){K.a=i<72;K.d=i>=72&&i<144;G.update(dt);if(i%24===0)sw.push([+(i*dt).toFixed(1),+S.steer.toFixed(2),+(S.yawR*57.3).toFixed(1),+(-S.z*.02).toFixed(2),+(S.psi*57.3).toFixed(1)]);}K.a=K.d=false;
    out.tests[kmh]={swerve:sw,step:rec,t50:t(.5),t90:t(.9),yawEnd:rEnd,ayEnd:rec[rec.length-1][4],tap:{peakYaw:+(pk*57.3).toFixed(1),offset15:+off.toFixed(2)},laneTime:tLane};}
  reset(0);document.getElementById('mGarage').click();return out;}
