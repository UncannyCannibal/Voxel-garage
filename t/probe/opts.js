// fit parts and check them: arg {set:[[slot,id],...], re:"regex of parts to report"} -> the fit result per part, the build time, the collisions and loose pieces
async (a)=>{const G=window.__GARAGE,out=[];const t0=performance.now();
  for(const [slot,id] of a.set){const r=G.applyPart(G.cfg,slot,id);out.push(slot+'='+id+': '+r.state+(r.reason?' ('+r.reason+')':''));if(r.state==='blocked'||r.state==='later')continue;for(const k of Object.keys(G.cfg))delete G.cfg[k];Object.assign(G.cfg,r.cfg);}
  G.refresh();await new Promise(r=>setTimeout(r,300));out.push('rebuilt in '+Math.round(performance.now()-t0)+' ms');
  const ps=window.__QA.collect(),re=a.re?new RegExp(a.re):null;
  const col=window.__QA.collisions(ps,re);out.push('collisions: '+(col.length?'\n  '+col.join('\n  '):'none'));
  const pc=window.__QA.pieces(ps).filter(l=>!re||re.test(l));out.push('loose pieces: '+(pc.length?'\n  '+pc.join('\n  '):'none'));
  out.push('seatMeshes '+(G.P.seatMeshes||[]).length+' cabinGroups '+(G.P.cabinGroups||[]).length);
  return out.join('\n');}
