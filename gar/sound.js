/* ---------- sound (SOUND-01) ----------
   The engine is heard as its cylinders firing, not as three fixed tones.
   - Firing: each cylinder's exhaust pulse is placed at its own crank angle, in the engine's real firing order, for 32 engine cycles,
     and played faster or slower with the revs. A pulse lasts about the same TIME at any revs (the gas leaves at the speed of sound),
     so the pulses are drawn three times, at 1000, 2400 and 5000 rpm, and the revs blend between the two nearest (each is then
     stretched no more than about 1.7x). Each set has two buffers from the same firing times: on the throttle (sharp, strong, steady)
     and off it (soft, weaker, uneven: the lumpy idle and the overrun). The throttle crossfades them. All six play in step.
   - Cylinder to cylinder: each cylinder fires a little differently (fill, runner length) and the pipes that merge (4-2-1 pairs, the
     inline-6's front and rear three, a V's two banks) differ a little. That is what gives an engine its burble under the firing note.
     The cross-plane V8 fires its banks unevenly (L R L R R L R L), which is its rumble.
   - The pipes: fixed resonances (body boom, pipe, rasp) and a tailpipe echo, which do NOT move with the revs; the exhaust part opens
     them up. The intake roars with the throttle open; individual throttle bodies and carburettors are louder than an airbox; VTEC
     (B16A) hardens the intake note above its crossover.
   - Turbo: the shaft spools with boost (whistle and compressor rush); lifting off on boost opens the bypass valve. Every turbo car
     here has a RECIRCULATING valve stock (the air goes back into the intake), so it is a muffled whoosh, not an open "psssh":
     Z32 (nicoclub.com "Twin turbo BOV"; 300zx-owners.club "BOV to fit or not"), 2G DSM (dsmtuners.com "2g blow off valve question"
     and "Does my GS-T have a BOV").
   - The rest: fuel cut at the limiter, the throttle lifting on each shift, reverse gear's whine, tyres, road, wind, an electric
     motor's whine on the Model X. From the driver's seat the engine is heard through the bulkhead (duller) and the road louder.
   Sourced: B16A VTEC at 5500 rpm (Wikipedia "Honda B engine"; drifted.com "Honda B Series"). LS V8 firing order 1-8-7-2-6-5-4-3 with
   odd cylinders on the left bank (Summit Racing HE-04970; corvetteforum "How are cylinders numbered"). 2000GT 3M: three twin-choke
   Mikuni-Solex 40 PHH carburettors (Wikipedia "Toyota 2000GT"; supercarnostalgia.com). Individual throttle bodies as standard on
   the S14 and RB26DETT (hpacademy.com "factory fitted ITB engines"; bmwe21.net "S14 mods"). Every level, frequency and pulse shape
   is a DESIGN value tuned by analysis (the firing order dominant at the right frequency), not taken from a recording. */
let audio=null;
const SND_RS=[1000,2400,5000],SND_CYC=32;   // the pulse sets: drawn at these revs, 32 engine cycles (two revolutions each) long

function sndSig(){return phys.EV?'ev':[cfg.engine,cfg.turbo,cfg.exhaust].join('|');}
// the firing: one entry per cylinder in firing order, at its crank angle (deg) and the pipe group it exhausts into
function sndFire(cyl,lay){
  if(lay==='V'&&cyl===8)return [1,8,7,2,6,5,4,3].map((c,i)=>({a:i*90,g:c%2?0:1}));   // cross-plane: L R L R R L R L
  if(lay==='V')return Array.from({length:cyl},(_,i)=>({a:i*720/cyl,g:i%2}));         // the banks take turns
  if(cyl===6)return [1,5,3,6,2,4].map((c,i)=>({a:i*120,g:c<=3?0:1}));                  // inline-6: front three / rear three
  if(cyl===4)return [1,3,4,2].map((c,i)=>({a:i*180,g:(c===1||c===4)?0:1}));             // 4-2-1: cylinders 1+4 and 2+3 pair
  return Array.from({length:cyl},(_,i)=>({a:i*720/cyl,g:i%2}));
}
function sndProfile(){
  if(phys.EV)return {ev:true,sig:'ev'};
  const eng=byId('engine',cfg.engine)||{},eff=effEngine(cfg),ex=byId('exhaust',cfg.exhaust)||{},tb=byId('turbo',cfg.turbo)||null;
  const nm=eng.name||'',cyl=eng.cyl||4,lay=eng.layout||(/\bV\d/.test(nm)?'V':'I');
  const turbo=eff.turbo&&!eff.sc?{twin:/twin/i.test(((tb&&tb.name)||'')+' '+nm),kit:!!(tb&&!tb.stock&&tb.id!=='none')}:null;
  const kind=lay==='V'?(cyl===8?'V8':'V6'):(cyl===6?'I6':'I4');
  // [D] character by layout: f1 body boom, f2 pipe, f3 rasp (Hz), tail pipe length (m), exhaust pulse decay (ms)
  const C={I4:{f:[95,420,1600],pipe:2.0,dec:1.45},I6:{f:[115,340,1400],pipe:2.4,dec:1.65},V6:{f:[105,300,1300],pipe:2.3,dec:1.65},V8:{f:[80,260,1100],pipe:2.6,dec:1.9}}[kind];
  const ind={S14B23:'itb',RB26DETT:'itb','3M':'carb'}[eng.id]||'box';
  return {sig:sndSig(),kind,cyl,fire:sndFire(cyl,lay),red:eng.red||phys.RED||7000,turbo,exh:+ex.sound||0,vtec:{B16A:5500}[eng.id]||0,
    ind,indMul:{box:.6,itb:1.3,carb:1.0}[ind],inF:{box:[420,1100],itb:[260,780],carb:[300,900]}[ind],
    f:C.f,pipe:C.pipe,dec:C.dec*(turbo?1.35:1),nz:.22*(turbo?1.5:1),grp:kind==='V8'?{A:[1,.82],T:[0,4]}:{A:[1,.88],T:[0,2.5]},
    seed:[...(eng.id||'x')].reduce((s,c)=>s*31+c.charCodeAt(0)>>>0,7)};
}
// one set of pulse buffers (on / off the throttle) drawn at R0 rpm. Every set uses the same seed, so every set has the same firing
// times and they all crossfade without beating. Returns R: the revs one cycle of the buffer really is (a whole number of samples).
function sndPulses(sr,P,R0){
  const per=Math.round(120/R0*sr),n=per*SND_CYC,dpd=per/720,dpm=R0*.006,on=new Float32Array(n),off=new Float32Array(n);   // dpm: crank degrees per ms
  let s=P.seed||1,s2=(P.seed^0x9e3779b9)>>>0||3;
  const r=()=>(s=(s*1664525+1013904223)>>>0)/4294967296,rn=()=>(s2=(s2*1664525+1013904223)>>>0)/4294967296*2-1,g=()=>(r()+r()+r()+r()-2)*1.732;
  const cA=P.fire.map(()=>1+.05*g()),cT=P.fire.map(()=>.7*g());   // fixed per cylinder: fill and timing
  const kern=(b,pos,A,rise,dec,nz,hump)=>{const p0=Math.floor(pos),fr=pos-p0,L=Math.min(n,Math.ceil(Math.max(dec*6,180)*dpd));
    for(let j=0;j<L;j++){const th=(j-fr)/dpd;if(th<0)continue;const e=(1-Math.exp(-th/rise))*Math.exp(-th/dec),h=th<180?hump*Math.pow(Math.sin(Math.PI*th/180),2):0;
      b[(p0+j)%n]+=A*(e*(1+nz*rn())+h);}};
  for(let c=0;c<SND_CYC;c++)P.fire.forEach((f,k)=>{const jT=g(),jA=g(),weak=r(),gA=P.grp.A[f.g],gT=P.grp.T[f.g],base=c*720+f.a+cT[k]+gT;
    kern(on,(base+.35*jT)*dpd,cA[k]*gA*(1+.05*jA),.17*dpm,P.dec*dpm*(f.g?1.12:1),P.nz,.10);
    kern(off,(base+1.1*jT)*dpd,.7*cA[k]*gA*(1+.28*jA)*(weak<.06?.35:1),.4*dpm,P.dec*1.5*dpm,P.nz*1.6,.04);});
  // no DC, nothing above 7 kHz (played at most ~1.7x faster, it stays under the output's limit), the same scale for both
  const lp=b=>{const a=Math.exp(-2*Math.PI*7000/sr);for(let pass=0;pass<2;pass++){let y=0;for(let k=0;k<2;k++)for(let i=0;i<n;i++){y=(1-a)*b[i]+a*y;if(k)b[i]=y;}}};
  for(const b of [on,off]){let m=0;for(let i=0;i<n;i++)m+=b[i];m/=n;for(let i=0;i<n;i++)b[i]-=m;lp(b);}
  let pk=1e-9;for(let i=0;i<n;i++)pk=Math.max(pk,Math.abs(on[i]));const k=.9/pk;for(let i=0;i<n;i++){on[i]*=k;off[i]*=k;}
  return {on,off,n,R:120*sr/per};
}
function sndGraph(ctx,P){
  const A={ctx,prof:P,sig:P.sig,st:{shaft:0,lastComb:0,limT:0,vtec:false,wob:0},srcs:[]};
  const G=v=>{const g=ctx.createGain();g.gain.value=v;return g;},F=(type,f,q,gain)=>{const b=ctx.createBiquadFilter();b.type=type;b.frequency.value=f;if(q!=null)b.Q.value=q;if(gain!=null)b.gain.value=gain;return b;};
  const O=(type,f)=>{const o=ctx.createOscillator();o.type=type;o.frequency.value=f;o.start();A.srcs.push(o);return o;};
  const chain=(...ns)=>{for(let i=0;i<ns.length-1;i++)ns[i].connect(ns[i+1]);return ns[ns.length-1];};
  if(!ctx.__noise){const nb=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),d=nb.getChannelData(0);let z=12345;for(let i=0;i<d.length;i++){z=(z*1664525+1013904223)>>>0;d[i]=z/2147483648-1;}ctx.__noise=nb;}
  const noise=off=>{const s=ctx.createBufferSource();s.buffer=ctx.__noise;s.loop=true;s.start(0,off);A.srcs.push(s);return s;};
  // out: master -> limiter-compressor -> speakers (and a tap the QA reads)
  A.master=G(0);A.comp=ctx.createDynamicsCompressor();A.comp.threshold.value=-12;A.comp.knee.value=8;A.comp.ratio.value=4;A.comp.attack.value=.004;A.comp.release.value=.18;
  chain(A.master,A.comp,ctx.destination);A.an=ctx.createAnalyser();A.an.fftSize=8192;A.comp.connect(A.an);
  A.cabin=F('lowpass',18000,.6);A.engBus=G(1);chain(A.engBus,A.cabin,A.master);
  const n1=noise(0),n2=noise(.77);
  // tyres: two narrow bands that wander (a squeal is a tone, not a hiss), road rumble, tyre roar, wind
  A.bpT1=F('bandpass',950,12);A.bpT2=F('bandpass',1900,9);A.gSq=G(0);const t2=G(.5);chain(n1,A.bpT1,A.gSq);chain(n1,A.bpT2,t2,A.gSq);A.gSq.connect(A.master);
  A.gRoad=G(0);chain(n2,F('lowpass',320,.7),A.gRoad,A.master);A.gRoar=G(0);chain(n1,F('bandpass',850,.8),A.gRoar,A.master);A.gWind=G(0);chain(n2,F('bandpass',1100,.35),A.gWind,A.master);
  if(P.ev){   // the motors and their gears: a whine that rises with the motor's speed
    A.oscM1=O('sine',60);A.oscM2=O('sine',120);A.gM=G(0);const m2=G(.35);chain(A.oscM1,A.gM);chain(A.oscM2,m2,A.gM);A.gM.connect(A.engBus);return A;}
  // the engine: three sets of phase-locked pulse buffers -> the pipes -> soft saturation -> brightness -> level
  A.eSum=G(1);const t0=ctx.currentTime+.02;
  A.sets=SND_RS.map(R0=>{const pb=sndPulses(ctx.sampleRate,P,R0),Z={R:pb.R,gOn:G(0),gOff:G(0)};
    for(const k of ['on','off']){const b=ctx.createBuffer(1,pb.n,ctx.sampleRate);b.getChannelData(0).set(pb[k]);const s=ctx.createBufferSource();s.buffer=b;s.loop=true;s.playbackRate.value=850/pb.R;
      chain(s,k==='on'?Z.gOn:Z.gOff,A.eSum);s.start(t0);A.srcs.push(s);Z[k]=s;}
    return Z;});
  A.pk3=F('peaking',P.f[2],1.2,2.5*P.exh);
  const pipeIn=chain(A.eSum,F('highpass',28,.7),F('peaking',P.f[0],1.0,5+1.5*P.exh),F('peaking',P.f[1],1.8,4),A.pk3);
  // the tail pipe: a short echo (there and back at ~480 m/s in hot gas) that lifts the revs where a firing harmonic meets the pipe
  const dl=ctx.createDelay(.05);dl.delayTime.value=2*P.pipe/480;const fb=G(.15+.05*P.exh),fbl=F('lowpass',1500,.5),wet=G(.3),pipeOut=G(1);
  pipeIn.connect(dl);chain(dl,fbl,fb,dl);chain(dl,wet,pipeOut);pipeIn.connect(pipeOut);
  A.drive=G(.2);const sh=ctx.createWaveShaper(),cv=new Float32Array(1025);for(let i=0;i<1025;i++){const x=i/512-1;cv[i]=Math.tanh(2.5*x)/Math.tanh(2.5);}sh.curve=cv;sh.oversample='2x';
  A.lpEx=F('lowpass',900,.7);A.gEx=G(0);chain(pipeOut,A.drive,sh,A.lpEx,A.gEx,A.engBus);
  // the intake: the same pulses through the airbox / trumpets, loud with the throttle open; air rush; reverse gear's whine
  A.bpI1=F('bandpass',P.inF[0],P.ind==='box'?2:3);A.bpI2=F('bandpass',P.inF[1],1.6);A.gIn=G(0);chain(A.eSum,A.bpI1,A.gIn);chain(A.eSum,A.bpI2,A.gIn);A.gIn.connect(A.engBus);
  A.gHiss=G(0);chain(n2,F('bandpass',2600,.7),A.gHiss,A.engBus);
  A.oscRev=O('triangle',200);A.gRev=G(0);chain(A.oscRev,A.gRev,A.engBus);
  if(P.turbo){A.oscW1=O('sine',2200);A.oscW2=O('sine',2280);A.gW=G(0);chain(A.oscW1,A.gW);if(P.turbo.twin)chain(A.oscW2,G(.8),A.gW);A.gW.connect(A.master);
    A.bpComp=F('bandpass',1800,1.2);A.gComp=G(0);chain(n1,A.bpComp,A.gComp,A.master);
    A.gBov=G(0);chain(n2,F('bandpass',1100,.9),F('lowpass',2400,.7),A.gBov,A.master);}
  return A;
}
// one frame: the drive's state in (I), every level and frequency scheduled at time t. The page calls it each frame; the QA renders a
// recorded drive through it offline.
function sndFrame(A,t,I){
  const P=A.prof,S=A.st,dt=I.dt||1/60,T=(p,v,tau)=>p.setTargetAtTime(v,t,tau),cab=I.view==='cockpit',v=I.v||0,rd=Math.min(1,v/30);
  T(A.master.gain,I.on?.18:0,.05);T(A.cabin.frequency,cab?1700:18000,.1);
  T(A.gRoad.gain,.05*Math.pow(rd,1.1)*(cab?1.5:1),.1);T(A.gRoar.gain,.016*rd*(cab?1.4:1),.1);T(A.gWind.gain,.04*Math.min(1,Math.pow(v/45,2))*(cab?1.2:1),.15);
  S.wob+=(Math.random()-.5)*.6;S.wob*=.9;const sl=Math.min(1.5,I.sl||0);
  T(A.gSq.gain,Math.min(.16,sl*Math.min(1,v/12)*.16),.06);T(A.bpT1.frequency,880+Math.min(1,sl)*260+90*S.wob,.03);T(A.bpT2.frequency,1850+Math.min(1,sl)*400+150*S.wob,.03);
  if(P.ev){const pw=Math.min(1,Math.abs(I.evP||0)/600),f=60+(I.rpm||0)*.11;T(A.oscM1.frequency,f,.03);T(A.oscM2.frequency,f*2.03,.03);
    T(A.gM.gain,(.012+.08*pw)*Math.min(1,v/3),.05);return;}
  const red=P.red,rpm=Math.max(500,I.rpm||800),x=Math.min(1,rpm/red),thr=I.thr||0;
  // fuel cut at the limiter (about 15 cuts a second); the throttle lifts for a shift
  const lim=rpm>=red-260&&thr>.85;S.limT=lim?S.limT+dt:0;const cut=I.cut||(lim&&Math.floor(S.limT*30)%2===1);
  const comb=cut?0:thr,L=Math.pow(comb,.7),idle=rpm<1300?2.6:Math.max(1.2,2.6-(rpm-1300)/900);   // off the throttle: light firing at idle, fuel cut on the overrun
  // the revs pick the two nearest pulse sets (blended in log rpm); all play at the same engine speed, so they stay in step
  const lr=Math.log(rpm),R=A.sets.map(z=>Math.log(z.R));
  A.sets.forEach((z,i)=>{const w=i===0&&lr<=R[0]?1:i===R.length-1&&lr>=R[i]?1:(i>0&&lr>R[i-1]&&lr<=R[i])?(lr-R[i-1])/(R[i]-R[i-1]):(i<R.length-1&&lr>R[i]&&lr<R[i+1])?(R[i+1]-lr)/(R[i+1]-R[i]):0;
    T(z.on.playbackRate,rpm/z.R,.02);T(z.off.playbackRate,rpm/z.R,.02);T(z.gOn.gain,L*w,.012);T(z.gOff.gain,((1-L)*.9*idle+.05)*w,.012);});
  T(A.gEx.gain,(.5+.4*L)*(.6+.4*x)*(1+.15*P.exh)*(cab?.85:1),.03);
  // brightness: a stock silencer takes the top off; each step of a freer exhaust opens it up
  T(A.lpEx.frequency,Math.min(12000,(900+rpm*(.2+.25*L)+900*L)*(1+.6*P.exh)*(P.turbo?.8:1)),.04);
  T(A.drive.gain,.2*(1+1.2*L+.25*P.exh),.05);
  // VTEC: the high-rpm cam takes over above the crossover with the throttle open (and drops back below it or off the throttle)
  if(P.vtec){if(!S.vtec&&rpm>=P.vtec&&thr>.6)S.vtec=true;else if(S.vtec&&(rpm<P.vtec-100||thr<.4))S.vtec=false;}
  const vt=S.vtec;if(vt)S.nVtec=(S.nVtec||0)+1;
  T(A.gIn.gain,(.04+.6*Math.pow(thr,1.5))*Math.pow(x,1.2)*P.indMul*(vt?1.8:1)*(cab?1.4:1)*(comb>0?1:.4),.04);
  T(A.bpI1.frequency,P.inF[0]*(vt?1.25:1),.06);T(A.pk3.gain,2.5*P.exh+(vt?4:0),.06);
  T(A.gHiss.gain,.018*thr*x*x*(P.turbo?1.5:1),.05);
  T(A.gRev.gain,I.gear===0&&v>.4?.012*Math.min(1,v/5):0,.05);T(A.oscRev.frequency,180+260*Math.min(1,v/7),.05);
  if(P.turbo){const tgt=I.boost!=null?I.boost*(.55+.45*x):comb*Math.min(1,Math.max(0,(rpm-2500)/2500));
    S.shaft+=(tgt-S.shaft)*Math.min(1,dt/(tgt>S.shaft?.5:1.4));const sh=S.shaft,fw=2200+4800*sh;
    T(A.oscW1.frequency,fw,.05);T(A.oscW2.frequency,fw*1.035,.05);T(A.gW.gain,(P.turbo.kit?.2:.12)*Math.pow(sh,1.6)*(cab?.7:1),.06);
    T(A.gComp.gain,.03*sh*(.3+.7*comb),.06);T(A.bpComp.frequency,1800+2400*sh,.08);
    // off the throttle on boost (a lift or a shift): the bypass valve lets the compressor's air back into the intake
    if(S.lastComb>.55&&comb<.15&&sh>.35){const a=.3*sh*(P.turbo.kit?1.2:1),g=A.gBov.gain;S.nBov=(S.nBov||0)+1;g.cancelScheduledValues(t);g.setValueAtTime(0,t);g.linearRampToValueAtTime(a,t+.02);g.setTargetAtTime(0,t+.03,.12);S.shaft*=.7;}}
  S.lastComb=comb;
}
function sndInputs(dt){return {on:state.sound,rpm:state.rpm,thr:state.throttle,cut:(state.shiftT||0)>0,gear:state.gear,v:Math.hypot(state.v,state.vy||0),view:state.view,
  sl:Math.max(0,Math.abs(state.slip||0)-.1)*3+(state.wspin||0)*.6+((state.hb&&Math.abs(state.v)>3)?.7:0),boost:phys.boost?state.boost:null,evP:state.evPowerKW||0,dt};}
function initAudio(){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;audio=sndGraph(new AC(),sndProfile());}
function updateAudio(){if(!audio||audio.ctx.state!=='running')return;const ctx=audio.ctx,t=ctx.currentTime,dt=Math.min(.1,Math.max(.001,t-(audio.lastT==null?t-1/60:audio.lastT)));audio.lastT=t;
  if(sndSig()!==audio.sig){   // a different engine, turbo or exhaust: fade the old sound out and build the new one
    const o=audio;o.master.gain.setTargetAtTime(0,t,.03);for(const s of o.srcs)try{s.stop(t+.2);}catch(e){}setTimeout(()=>{try{o.master.disconnect();}catch(e){}},400);
    audio=sndGraph(ctx,sndProfile());audio.lastT=t;}
  sndFrame(audio,t,sndInputs(dt));
  // left with the sound off, the audio clock stops (a phone's battery); the Sound button resumes it
  if(!state.sound){if(audio.offAt==null)audio.offAt=t;if(t-audio.offAt>2)ctx.suspend();}else audio.offAt=null;}
const SOUND={profile:sndProfile,graph:sndGraph,frame:sndFrame,inputs:sndInputs,pulses:sndPulses,RS:SND_RS,get audio(){return audio;}};
