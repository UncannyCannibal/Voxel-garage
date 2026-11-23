// envelope: for the given states, the inward-most |z| reached by parts matching re, per (x, y) bin of 20 mm, on one side (sd)
(a)=>{const G=window.__GARAGE,st=G.state,QA=window.__QA,R=new RegExp('^('+a.re+')$');const keep={steer:st.steer,roll:st.roll,pitch:st.pitch};const env=new Map();
  for(const s of a.states){st.v=st.vy=st.yawR=0;st.steer=s.steer||0;st.roll=s.roll||0;st.pitch=s.pitch||0;st.bodyY=0;st.bobExtra=0;G.update(0);
    for(const p of QA.collect()){if(!R.test(p.name))continue;for(const m of p.meshes){const q=m.pts;for(let i=0;i<q.length;i+=3){const z=q[i+2]*20;if(Math.sign(z)!==a.sd)continue;
      const kx=Math.floor(q[i]*20/a.bin)*a.bin,ky=Math.floor(q[i+1]*20/a.bin)*a.bin,k=kx+','+ky,az=Math.abs(z);const v=env.get(k);if(v===undefined||(a.max?az>v:az<v))env.set(k,az);}}}}
  Object.assign(st,keep);st.steer=keep.steer;G.update(0);
  return [...env.entries()].map(([k,v])=>[...k.split(',').map(Number),Math.round(v)]);}
