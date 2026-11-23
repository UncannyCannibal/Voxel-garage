// one named state of the full check: returns the collision lines (moving-part filter as qa.js)
(a)=>{const G=window.__GARAGE,st=G.state,QA=window.__QA;st.v=st.vy=st.yawR=0;st.steer=a.steer||0;st.roll=a.roll||0;st.pitch=a.pitch||0;st.bodyY=0;st.bobExtra=0;G.update(0);
  const r=QA.collisions(QA.collect(),new RegExp(a.re||'^(tyre|rim|rotor|caliper|link|exh|under|rack|swheel|swm)'));st.steer=0;st.roll=0;st.pitch=0;G.update(0);return r.join('\n')||'clean';}
