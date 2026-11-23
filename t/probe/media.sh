#!/bin/bash
# media.sh <repo> <port> <outdir>: the README stills (media/MANIFEST.md), rendered from the game: launch cars only
cd $1 && export VG_PORT=$2; O=$3; mkdir -p $O
(CHECK_SOFTWARE_GL=1 python3 t/probe/srv.py modelx > ${TMPDIR:-/tmp}/srv$2.log 2>&1 & echo $! > ${TMPDIR:-/tmp}/srv$2.log.pid)   # its own server, stopped by its PID at the end (a second script running at the same time keeps its own)
until grep -q "booted\|Error\|Traceback" ${TMPDIR:-/tmp}/srv$2.log; do sleep 2; done
Q="python3 t/probe/q.py shot"; E="python3 t/probe/q.py eval"; G="const G=window.__GARAGE,S=G.state,A=G.anim;"
sw(){ $E "()=>{window.__GARAGE.switchCar('$1');}" >/dev/null; $E "async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));for(let i=0;i<600&&!(window.__bootDone&&window.__GARAGE.CARID==='$1');i++)await w(500);return window.__GARAGE.CARID;}" >/dev/null; }
# hero: Model X, falcon wings and front doors open, low front three-quarter
$Q $O/hero_modelx_falcon.png '{"az":0.62,"el":0.06,"dist":215,"ty":48,"ox":30,"oy":0,"oz":0}' "()=>{$G S.view='orbit';S.mode='garage';for(const k of ['rdoorL','rdoorR','doorL','doorR'])S[k]=1;}" >/dev/null
sleep 5
$Q $O/hero_modelx_falcon.png '{"az":0.62,"el":0.06,"dist":215,"ty":48,"ox":30,"oy":0,"oz":0}' >/dev/null
# cockpit
$Q $O/modelx_cockpit.png '{}' "()=>{$G for(const k of ['rdoorL','rdoorR','doorL','doorR']){S[k]=0;A[k]=0;}S.view='cockpit';}" >/dev/null
$Q $O/fleet_modelx.png '{"az":0.7,"el":0.07,"dist":205,"ty":40,"ox":30,"oy":0,"oz":0}' "()=>{$G S.view='orbit';S.mode='garage';}" >/dev/null
for c in e30 e30t ef z32 ae86 eclipse; do
  sw $c
  $Q $O/fleet_$c.png '{"az":0.7,"el":0.07,"dist":175,"ty":32,"ox":30,"oy":0,"oz":0}' "()=>{const S=window.__GARAGE.state;S.view='orbit';S.mode='garage';}" >/dev/null
done
# the Eclipse: rear three-quarter, then on the highway in Busy traffic (chase camera)
$Q $O/eclipse_rear.png '{"az":-2.25,"el":0.07,"dist":180,"ty":30,"ox":-60,"oy":0,"oz":0}' >/dev/null
$E "()=>{const G=window.__GARAGE,S=G.state;G.setWorld('highway');G.WORLD.density=.5;document.getElementById('mDrive').click();S.v=28;for(let i=0;i<120;i++)G.update(1/30);return G.WORLD.npcs.length;}" >/dev/null
$Q $O/highway_traffic.png '{}' "()=>{const G=window.__GARAGE,S=G.state;S.view='chase';for(let i=0;i<20;i++)G.update(1/30);}" >/dev/null
kill $(cat ${TMPDIR:-/tmp}/srv$2.log.pid); sleep 2; ls -la $O
