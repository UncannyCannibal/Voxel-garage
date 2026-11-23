// dump every visible voxel cell (body frame, mm) with its colour and part label; returns {parts:[names], v:[x,y,z,col,partIdx,size_mm,...]}
(opt)=>{const G=window.__GARAGE,QA=window.__QA;const ps=QA.collect();const names=[],out=[];
  const PNT=0x00fe01;
  for(const p of ps){const pi=names.length;names.push(p.name);
    for(const m of p.meshes){const g=m.g,e=m.M.elements,sc=Math.hypot(e[0],e[1],e[2]);let idx=0;
      for(let x=g.x0;x<=g.x1;x++)for(let y=g.y0;y<=g.y1;y++)for(let z=g.z0;z<=g.z1;z++){const v=g.d[idx++];if(v<0)continue;if(!m.take(v,m.sel))continue;
        const X=e[0]*x+e[4]*y+e[8]*z+e[12],Y=e[1]*x+e[5]*y+e[9]*z+e[13],Z=e[2]*x+e[6]*y+e[10]*z+e[14];
        out.push(Math.round(X*200)/10,Math.round(Y*200)/10,Math.round(Z*200)/10,v===PNT||v===0x00fe02?0xdddddd:v,pi,Math.round(sc*20));}}}
  return {names,v:out};}
