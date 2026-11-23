#!/bin/bash
# gif.sh <repo> <port> <frames> <outdir>: the falcon-wing clip frames (doors open, hold, close; the camera swings round the front quarter)
cd $1 && export VG_PORT=$2; O=$4; mkdir -p $O; N=$3
(CHECK_SOFTWARE_GL=1 python3 t/probe/srv.py modelx > ${TMPDIR:-/tmp}/srv$2.log 2>&1 & echo $! > ${TMPDIR:-/tmp}/srv$2.log.pid)   # its own server, stopped by its PID at the end (a second script running at the same time keeps its own)
until grep -q "booted\|Error\|Traceback" ${TMPDIR:-/tmp}/srv$2.log; do sleep 2; done
G="const G=window.__GARAGE,S=G.state,A=G.anim;"
for i in $(seq 0 $((N-1))); do
  read T AZ < <(python3 -c "
import math;i=$i;n=$N;u=i/(n-1)
t=(1-math.cos(math.pi*min(1,u/0.4)))/2 if u<0.4 else (1.0 if u<0.6 else (1+math.cos(math.pi*(u-0.6)/0.4))/2)
print(round(t,4),round(0.35+0.6*u,4))")
  python3 t/probe/q.py shot $O/f_$(printf %03d $i).png "{\"az\":$AZ,\"el\":0.08,\"dist\":230,\"ty\":50,\"ox\":20,\"oy\":0,\"oz\":0}" "()=>{$G S.view='orbit';S.mode='garage';for(const k of ['rdoorL','rdoorR','doorL','doorR']){S[k]=$T;A[k]=$T;}}" >/dev/null
done
kill $(cat ${TMPDIR:-/tmp}/srv$2.log.pid); sleep 2; ls $O | wc -l
