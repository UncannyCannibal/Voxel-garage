// occupancy at one height y (mm): rows x, cols z; letters = first letter of part (in order given); state optional
(a)=>{const G=window.__GARAGE,st=G.state,QA=window.__QA;st.steer=a.steer||0;st.roll=a.roll||0;st.pitch=a.pitch||0;G.update(0);const ps=QA.collect();
 const IN=X=>Math.abs(X-Math.round(X))<.49,inside=(parts,x,y,z)=>{for(const part of parts)for(const m of part.meshes){const e=m.Mi.elements,X=e[0]*x+e[4]*y+e[8]*z+e[12],Y=e[1]*x+e[5]*y+e[9]*z+e[13],Z=e[2]*x+e[6]*y+e[10]*z+e[14];if(IN(X)&&IN(Y)&&IN(Z)&&m.take(m.g.get(X,Y,Z),m.sel))return true;}return false;};
 const L=a.names.map(n=>[ps.filter(p=>p.name===n),a.ch?a.ch[a.names.indexOf(n)]:n[0]]),rows=[];
 for(let x=a.x1;x>=a.x0;x-=a.dx){let s='';for(let z=a.z0;z<=a.z1;z+=a.dz){let c='.';for(const [pp,ch] of L)if(pp.length&&inside(pp,x/20,a.y/20,z/20)){c=ch;break;}s+=c;}rows.push(String(x).padStart(6)+' '+s);}
 st.steer=0;st.roll=0;st.pitch=0;G.update(0);return 'y '+a.y+' cols z '+a.z0+'..'+a.z1+' step '+a.dz+'\n'+rows.join('\n');}
