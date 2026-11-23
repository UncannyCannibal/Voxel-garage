"""Open doors collide (owner, Nov 14: "collision on the doors, like the car itself becomes one whole asset"). For each car, on the highway:
  1. the left front door open, the body 8 units off the median wall at 25 m/s: no point of the door below the wall's top may stay inside the wall
     (after the first frames), and the door must have touched it; with the doors closed, nothing touches it.
  2. a parked car 120 units (centre to centre) beside the right front door: open, the door pushes the car away; closed, nothing touches.

    python t/door_collide.py --all      every car with a module        python t/door_collide.py eclipse modelx
    options: --no-build (use gar/out/garage.html as it is). Software rendering: CHECK_SOFTWARE_GL=1. Needs playwright + chromium and `npm install` in t/."""
import sys, os, asyncio, subprocess, time, json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT = Path(__file__).resolve().parents[1]
PAGE = (ROOT / 'gar' / 'out' / 'garage.html').as_uri()
THREE = ROOT / 't' / 'node_modules' / 'three' / 'build' / 'three.min.js'
CARS = ['e30', 'e30t', 'ef', 'z32', 'ae86', 'eclipse', 'gt2000', 'modelx']
GL = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] if os.environ.get('CHECK_SOFTWARE_GL') else ['--ignore-gpu-blocklist']

PROBE = """async(car)=>{const G=window.__GARAGE,S=G.state,W=G.WORLD;G.setWorld('highway');S.mode='drive';W.frozen=false;W.density=.001;
  const keys=['doorL','doorR','rdoorL','rdoorR','hood','trunk'],upd=()=>{G.update(1/60);G.carRoot.position.set(S.x,0,S.z);G.carRoot.rotation.y=S.psi;G.carRoot.updateMatrixWorld(true);};
  const setOpen=open=>{for(const k of keys){S[k]=0;G.anim[k]=0;}for(const k of open){S[k]=1;G.anim[k]=1;}for(let f=0;f<3;f++)upd();};
  const medFace=y=>y<6?15:y<14?11:5;
  // 1. the median wall: the body 8 units off it, the left front door open, 25 m/s along it for 2 s
  const wall=open=>{setOpen(open);S.z=15+50+8;S.psi=0;S.vy=0;S.yawR=0;S.v=25;upd();let worst=0,hits=0;
    for(let f=0;f<120;f++){upd();if(W.panelHit)hits++;const c=Math.cos(S.psi),sn=Math.sin(S.psi);
      for(const q of W.openPanelPts()){if(q.y<0||q.y>40)continue;const d=S.z+(-q.x*sn+q.z*c)-medFace(q.y);if(f>2)worst=Math.min(worst,d);}}
    return {intoWall:+(-worst).toFixed(1),hits};};
  // 2. a parked car beside the right front door, 120 units centre to centre
  const parked=open=>{setOpen(open);S.z=400;S.psi=0;S.v=0;S.vy=0;S.yawR=0;for(let f=0;f<3;f++)upd();
    const o=W.npcs.find(n=>!n.ty.T.truck)||W.npcs[0];for(const n of W.npcs)if(n!==o)n.x=S.x+20000;
    S.z=400;S.v=.5;o.x=S.x;o.z=o.zt=S.z+120;o.v=0;o.v0=.0001;o.lc=1e9;o.dir=1;let hits=0;for(let f=0;f<60;f++){upd();if(W.panelHit)hits++;}return {movedZ:+(S.z-400).toFixed(1),hits};};
  return {wallDoorL:wall(['doorL']),wallClosed:wall([]),parkedDoorR:parked(['doorR']),parkedClosed:parked([])};}"""

async def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    cars = CARS if ('--all' in sys.argv or not args) else args
    if '--no-build' not in sys.argv:
        r = subprocess.run([sys.executable, str(ROOT / 'gar' / 'build_garage.py')], capture_output=True, text=True); print(r.stdout.strip().splitlines()[-1] if r.stdout.strip() else r.stderr[-400:])
    fails = 0; T = time.time()
    async with async_playwright() as p:
        b = await p.chromium.launch(args=GL)
        for car in cars:
            pg = await b.new_page(viewport={'width': 1280, 'height': 800})
            errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
            if THREE.exists():
                body = THREE.read_bytes(); await pg.route('**/*three*.js', lambda r: r.fulfill(status=200, body=body, headers={'content-type': 'application/javascript'}))
            await pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, body='', headers={'content-type': 'text/css'}))
            t0 = time.time()
            try:
                await pg.goto(PAGE, timeout=300000); await pg.wait_for_function("window.__bootDone===true", timeout=300000)
                if await pg.evaluate("window.__GARAGE.CARID") != car:
                    await pg.evaluate(f"window.__GARAGE.switchCar('{car}')")
                    await pg.wait_for_function(f"window.__bootDone===true&&window.__GARAGE.CARID==='{car}'", timeout=300000)
                res = await pg.evaluate(PROBE, car)
            except Exception as e:
                res = {'error': str(e)[:300]}
            why = []
            if errs: why.append('page errors: ' + ' | '.join(errs[:3]))
            if 'error' in res: why.append(res['error'])
            else:
                if res['wallDoorL']['intoWall'] > 6: why.append(f"open door {res['wallDoorL']['intoWall']} units into the median wall")
                if res['wallDoorL']['hits'] < 1: why.append('open door never touched the median wall')
                if res['wallClosed']['hits'] > 0: why.append('closed doors touched the median wall')
                if res['parkedDoorR']['hits'] < 1 or res['parkedDoorR']['movedZ'] > -5: why.append('open door went through the parked car')
                if res['parkedClosed']['hits'] > 0 or abs(res['parkedClosed']['movedZ']) > 1: why.append('closed car touched the parked car')
            ok = not why; fails += 0 if ok else 1
            print(f"  {'PASS' if ok else 'FAIL'}  {car:8s} {time.time()-t0:5.0f} s  " + (json.dumps(res) if 'error' not in res else '') + ('' if ok else '  -> ' + '; '.join(why)), flush=True)
            await pg.close()
        await b.close()
    print(('ALL PASS' if not fails else f'FAILED: {fails} car(s)') + f'  ({time.time()-T:.0f} s)')
    sys.exit(1 if fails else 0)

asyncio.run(main())
