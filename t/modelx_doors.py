"""MX-04 motion evidence, using the unmodified in-page QA collector/collision check.
Usage: python t/modelx_doors.py output.json [--coarse]
Samples are discrete, not a continuous collision certificate. Envelope measurements
include the transformed voxel half-cell extent. Angles/hinge locations are DESIGN.
"""
import asyncio, json, sys, time
from pathlib import Path
from where import page

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / sys.argv[1]

async def main():
    p, b, pg = await page('modelx')
    # All poses below call update explicitly; stop redundant display frames.
    await pg.evaluate('window.requestAnimationFrame=()=>0')
    errors = []
    pg.on('pageerror', lambda e: errors.append(str(e)))
    started = time.perf_counter()
    try:
        result = await pg.evaluate(r'''async coarse=>{
          const G=window.__GARAGE,keys=['doorL','doorR','rdoorL','rdoorR','hood','trunk'],out=[];
          const under=(o,parent)=>{for(let p=o;p;p=p.parent)if(p===parent)return true;return false;};
          const poses=[],count=coarse?10:40;
          for(let i=0;i<=count;i++)poses.push({label:'together',f:i/count,values:keys.map(()=>i/count)});
          if(!coarse){
            for(let k=0;k<6;k++)for(const f of [.025,.05,.1,.25,.5,.75,.9,1])poses.push({label:keys[k],f,values:keys.map((_,i)=>i===k?f:0)});
            for(const side of ['L','R'])for(const a of [.25,.5,.75,1])for(const b of [.25,.5,.75,1]){
              poses.push({label:'front/rear '+side,f:a,values:keys.map(k=>k==='door'+side?a:k==='rdoor'+side?b:0)});
            }
          }
          for(const size of coarse?[22]:[20,22]){
            G.cfg.wheel=Object.assign({},byId('wheel','modelx-'+size));G.refresh(true);
            for(const pose of poses){
              Object.assign(G.state,{mode:'garage',x:0,z:0,psi:0,v:0,vy:0,roll:0,pitch:0,steer:0,spin:0,bobExtra:0});
              keys.forEach((k,i)=>G.state[k]=G.anim[k]=pose.values[i]);G.update(0);
              const ps=window.__QA.collect(),bounds={},angles={},moving=[];
              for(const key of keys){
                const bound=[Infinity,-Infinity,Infinity,-Infinity,Infinity,-Infinity];
                for(const part of ps)for(const m of part.meshes)if(under(m.o,G.P[key])){
                  moving.push(part.name);const e=m.M.elements;
                  const half=[0,1,2].map(i=>(Math.abs(e[i])+Math.abs(e[i+4])+Math.abs(e[i+8]))*.5);
                  for(let j=0;j<m.pts.length;j+=3)for(let a=0;a<3;a++){
                    bound[a*2]=Math.min(bound[a*2],(m.pts[j+a]-half[a])*20);
                    bound[a*2+1]=Math.max(bound[a*2+1],(m.pts[j+a]+half[a])*20);
                  }
                }
                bounds[key]=bound;angles[key]=G.P[key].rotation.toArray().slice(0,3).map(v=>v*180/Math.PI);
              }
              const only=new RegExp('^('+[...new Set(moving)].map(n=>n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')$');
              const collisions=window.__QA.collisions(ps,only);
              // At endpoints also verify actual geometry attachment; transforms alone
              // must not make doors appear connected to an absent hinge.
              const loose=pose.label==='together'&&[0,1].includes(pose.f)?window.__QA.pieces(ps):[];
              const doorGapMM=['L','R'].map(s=>bounds['door'+s][0]-bounds['rdoor'+s][1]);
              const lowerDoorGroundMM=['L','R'].map(s=>ps.find(p=>p.name==='rdoor'+s).box[2]*20-8.661);
              out.push({size,...pose,boundsMM:bounds,frontRearAxialGapMM:doorGapMM,
                lowerDoorGroundLowerBoundMM:lowerDoorGroundMM,anglesDeg:angles,
                elbowDeg:['L','R'].map(s=>G.build['elbow'+s].rotation.x*180/Math.PI),collisions,loose});
              await new Promise(r=>setTimeout(r,10));
            }
          }
          // Exercise the actual animated path, including reversal mid-swing.
          keys.forEach(k=>G.state[k]=G.anim[k]=0);G.update(0);
          keys.forEach(k=>G.state[k]=1);for(let i=0;i<45;i++)G.update(1/60);
          const reversal=keys.map(k=>G.anim[k]);keys.forEach(k=>G.state[k]=0);
          for(let i=0;i<300;i++)G.update(1/60);
          const closed=keys.map(k=>G.anim[k]);
          return {samples:out,animation:{reversal,closed}};
        }''', '--coarse' in sys.argv)
        for row in result['samples']:
            if row['collisions'] or row['loose']:
                errors.append({'size':row['size'],'pose':row['label'],'f':row['f'],
                               'collisions':row['collisions'],'loose':row['loose']})
        if max(abs(v) for v in result['animation']['closed']) > 1e-5:
            errors.append('Animation failed to return to closed after reversal')
        result.update(result='FAIL' if errors else 'PASS',errors=errors,seconds=time.perf_counter()-started)
        OUT.parent.mkdir(parents=True,exist_ok=True)
        OUT.write_text(json.dumps(result,indent=2),encoding='utf-8')
        print(f"{result['result']}: {len(result['samples'])} poses, {len(errors)} failing poses/errors; {result['seconds']:.2f} s")
        for error in errors[:8]: print(error)
        if errors: raise SystemExit(1)
    finally:
        await b.close()
        await p.stop()

asyncio.run(main())
