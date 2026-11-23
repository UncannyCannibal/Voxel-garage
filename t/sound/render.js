// SOUND-01 QA: drive the car on the page's own physics (G.update at 120 Hz), record what the sound reads each 1/60 s, then render
// that drive OFFLINE through the new sound (and, for comparison, the old three-oscillator sound) to 48 kHz mono.
// arg: {script:'pull'|'holds', old:true|false, view:'orbit'|'cockpit' (holds), engine:id (holds: another engine's profile)}. Returns {car, prof, secs, trace (summary), wav:{new,old} as base64 16-bit PCM, stats}.
// 'pull': idle 1.5 s, full throttle 9 s (launch and upshifts), lift 2.5 s, brake 3 s, idle 1 s.
// 'holds': no physics: the throttle held fully open at 1500, 3000, 4500 and 6000 rpm for 1.5 s each, then closed at 3000 (for the spectra).
async(arg)=>{const G=window.__GARAGE,S=G.state,K=G.keys,SO=G.sound,wait=ms=>new Promise(r=>setTimeout(r,ms));
  document.getElementById('mDrive').click();await wait(300);G.setAssist('normal');
  const clr=()=>{for(const k of ['w','s','a','d','arrowleft','arrowright','arrowup','arrowdown',' ','shift','e'])K[k]=false;};
  clr();Object.assign(S,{x:0,z:0,psi:0,v:0,vy:0,yawR:0,steer:0,sw:0,steerIn:0,throttle:0,brake:0,gear:1,rpm:850,shiftT:0,boost:0,wspin:0,slip:0});
  const tr=[],FR=60,dt=1/120;
  if(arg.script==='holds'){const red=G.phys.RED;for(const [r,th] of [[1500,1],[3000,1],[4500,1],[Math.min(6000,red-300),1],[3000,0]])for(let i=0;i<FR*1.5;i++){
      const I={on:true,rpm:r,thr:th,cut:false,gear:2,v:15,view:arg.view||'orbit',sl:0,boost:G.phys.boost?Math.min(1,i/FR/0.8)*th:null,evP:0,dt:1/FR};tr.push(I);}}
  else{const ph=[[1.5,()=>{}],[9,()=>{K.w=true;}],[2.5,()=>{}],[3,()=>{K[' ']=true;}],[1,()=>{}]];
    for(const [secs,set] of ph){for(let i=0;i<secs*120;i++){clr();set();G.update(dt);if(i%2===1){const I=SO.inputs(1/FR);I.on=true;I.view='orbit';tr.push(I);}}}}
  clr();
  const secs=tr.length/FR,sr=48000;
  const b64=f=>{const n=f.length,u=new Uint8Array(n*2);for(let i=0;i<n;i++){const v=Math.max(-1,Math.min(1,f[i]))*32767|0;u[2*i]=v&255;u[2*i+1]=(v>>8)&255;}
    let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s);};
  const stats=f=>{let pk=0,ss=0,nan=0;for(let i=0;i<f.length;i++){const v=f[i];if(!isFinite(v)){nan++;continue;}pk=Math.max(pk,Math.abs(v));ss+=v*v;}return {peak:+pk.toFixed(3),rms:+Math.sqrt(ss/f.length).toFixed(4),nan};};
  const out={car:G.CARID,engine:G.cfg.engine,turbo:G.cfg.turbo,exhaust:G.cfg.exhaust,secs,wav:{},stats:{}};
  // the new sound
  {const e0=G.cfg.engine,t0=G.cfg.turbo;if(arg.engine){G.cfg.engine=arg.engine;G.cfg.turbo=arg.turbo||'none';}   // a profile for another engine (holds only: the drive is not re-run)
    const ctx=new OfflineAudioContext(1,Math.ceil(secs*sr)+sr/2,sr),P=SO.profile(),A=SO.graph(ctx,P);G.cfg.engine=e0;G.cfg.turbo=t0;
    out.prof={kind:P.kind,cyl:P.cyl,red:P.red,turbo:P.turbo,exh:P.exh,vtec:P.vtec,ind:P.ind,ev:!!P.ev};
    tr.forEach((I,i)=>SO.frame(A,.05+i/FR,I));const r=await ctx.startRendering(),f=r.getChannelData(0);out.wav.new=b64(f);out.stats.new=stats(f);out.stats.events={bov:A.st.nBov||0,vtecFrames:A.st.nVtec||0};}
  // the old sound (the code this replaces, reproduced as it was)
  if(arg.old!==false){const ctx=new OfflineAudioContext(1,Math.ceil(secs*sr)+sr/2,sr),ph=G.phys;
    const m=ctx.createGain(),lp=ctx.createBiquadFilter();m.gain.value=0;lp.type='lowpass';lp.frequency.value=900;lp.Q.value=1.1;
    const o=[ctx.createOscillator(),ctx.createOscillator(),ctx.createOscillator()],g=[ctx.createGain(),ctx.createGain(),ctx.createGain()];
    o[0].type='sawtooth';o[1].type='square';o[2].type='sawtooth';g[0].gain.value=.5;g[1].gain.value=.22;g[2].gain.value=.16;
    o.forEach((x,i)=>{x.connect(g[i]);g[i].connect(lp);x.start();});lp.connect(m);m.connect(ctx.destination);
    const nb=ctx.createBuffer(1,sr,sr),nd=nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
    const ns=ctx.createBufferSource();ns.buffer=nb;ns.loop=true;const bp=ctx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=1500;bp.Q.value=6;const sq=ctx.createGain();sq.gain.value=0;
    ns.connect(bp);bp.connect(sq);sq.connect(ctx.destination);ns.start();
    tr.forEach((I,i)=>{const t=.05+i/FR,sl=I.sl,sv=Math.min(1,I.v/12);
      if(ph.EV){m.gain.setTargetAtTime(0,t,.04);sq.gain.setTargetAtTime(Math.min(.16,sl*sv*.16),t,.06);return;}
      sq.gain.setTargetAtTime(Math.min(.16,sl*sv*.16),t,.06);bp.frequency.setTargetAtTime(1200+Math.min(1,sl)*700,t,.1);
      const f=I.rpm/60*ph.CYL/2;o[0].frequency.setTargetAtTime(f,t,.04);o[1].frequency.setTargetAtTime(f/2,t,.04);o[2].frequency.setTargetAtTime(f*2,t,.04);
      lp.frequency.setTargetAtTime(380+I.rpm*.55+I.thr*900+ph.EXH*700,t,.06);m.gain.setTargetAtTime(.05+.1*I.thr+I.rpm/90000,t,.08);});
    const r=await ctx.startRendering(),f=r.getChannelData(0);out.wav.old=b64(f);out.stats.old=stats(f);}
  const pick=k=>tr.filter((_,i)=>i%6===0).map(I=>+(+I[k]||0).toFixed(2));
  out.trace={rpm:pick('rpm'),thr:pick('thr'),v:pick('v'),gear:pick('gear'),cut:tr.filter((_,i)=>i%6===0).map(I=>I.cut?1:0),boost:pick('boost')};
  document.getElementById('mGarage').click();return out;}
