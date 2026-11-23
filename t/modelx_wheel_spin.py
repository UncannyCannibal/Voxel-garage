"""Check rotating rim/bead contact at 5-degree phases over the bead grid's 90-degree period."""
import asyncio,json,sys
from pathlib import Path
from where import page
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/(sys.argv[1] if len(sys.argv)>1 else 'board/done/MX-03-drivetrain/final/wheel-spin.json')
async def main():
    p,b,pg=await page('modelx')
    try:
        rows=await pg.evaluate("""async()=>{const G=window.__GARAGE,out=[];
          for(const size of [20,22]){G.cfg.wheel=Object.assign({},byId('wheel','modelx-'+size));G.refresh(true);
            for(let deg=0;deg<=90;deg+=5){Object.assign(G.state,{v:0,vy:0,steer:0,roll:0,pitch:0,bobExtra:0,spin:deg*Math.PI/180});G.update(0);
              out.push({size,spinDeg:deg,collisions:window.__QA.collisions(window.__QA.collect(),/^(tyre|rim)/)});await new Promise(r=>setTimeout(r,20));}
          }return out;}
        """)
        errors=[r for r in rows if r['collisions']]
        OUT.parent.mkdir(parents=True,exist_ok=True);OUT.write_text(json.dumps({'result':'FAIL' if errors else 'PASS','samples':rows},indent=2),encoding='utf-8')
        print(f"{'FAIL' if errors else 'PASS'}: {len(rows)} wheel-size/spin phases; {len(errors)} states with collisions")
        if errors:raise SystemExit(1)
    finally:await b.close();await p.stop()
asyncio.run(main())
