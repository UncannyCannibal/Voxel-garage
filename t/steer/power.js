// power in a corner: steady turn (key held 2.5 s, light throttle) at 60 km/h, then full throttle 1.5 s. arg: {assist:'normal'|'off'}
async(arg)=>{const G=window.__GARAGE,S=G.state,K=G.keys,wait=ms=>new Promise(r=>setTimeout(r,ms));
  document.getElementById('mDrive').click();await wait(300);G.setAssist(arg.assist);
  const dt=1/120;for(const k of ['w','s','a','d',' ','shift'])K[k]=false;S.x=0;S.z=0;S.psi=0;S.v=60/3.6;S.vy=0;S.yawR=0;S.steer=0;S.throttle=0;S.brake=0;S.ayF=0;S.axF=0;
  const snap=()=>({t:0,v:+(S.v*3.6).toFixed(0),yaw:+(S.yawR*57.3).toFixed(1),slip:+((S.slip||0)*57.3).toFixed(1),ay:+((S.ay||0)/9.81).toFixed(2),R:+(Math.abs(S.v/(S.yawR||1e-6))).toFixed(1),spin:+(S.wspin||0).toFixed(2),esc:S.esc});
  K.a=true;let i=0;for(;i<300;i++){K.w=(i%4===0);G.update(dt);}const before=snap();   // steady: a feathered throttle (one step in four) holds about the speed
  const tr=[];for(let j=0;j<180;j++){K.w=true;G.update(dt);if(j%30===29)tr.push(snap());}
  K.a=K.w=false;G.setAssist('normal');document.getElementById('mGarage').click();
  return {car:G.CARID,lay:G.phys.EV?'EV':G.phys.LAYOUT,before,trace:tr};}
