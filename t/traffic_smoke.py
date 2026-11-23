"""Traffic smoke test (launch gate B2, board/LAUNCH.md). For each car: load it, switch to the highway at Busy traffic, Drive, hold the throttle for a
while (the simulation stepped at 30 Hz, independent of the frame rate), then brake to a stop. It fails a car on: a page error, a non-finite number in the car's state, no traffic cars on the road, or the car not moving.
It reports (does not judge) the top speed reached, the frame rate and the number of traffic cars, so a run on the owner's PC records the real frame rate.

    python t/traffic_smoke.py --all              every car with a module
    python t/traffic_smoke.py modelx ef          the named cars
    options: --secs 30 (throttle time, default 30)  --no-build (use gar/out/garage.html as it is)
Software rendering (cloud machines): set CHECK_SOFTWARE_GL=1. Needs playwright + chromium and `npm install` in t/ (the local three.js), as gar/check.py."""
import sys, os, asyncio, subprocess, time, json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT = Path(__file__).resolve().parents[1]
PAGE = (ROOT / 'gar' / 'out' / 'garage.html').as_uri()
THREE = ROOT / 't' / 'node_modules' / 'three' / 'build' / 'three.min.js'
CARS = ['e30', 'e30t', 'ef', 'z32', 'ae86', 'eclipse', 'gt2000', 'modelx']
GL = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] if os.environ.get('CHECK_SOFTWARE_GL') else ['--ignore-gpu-blocklist']

PROBE = """async(secs)=>{const G=window.__GARAGE,S=G.state,K=G.keys,W=G.WORLD,wait=ms=>new Promise(r=>setTimeout(r,ms));
  const fin=()=>['x','z','v','psi','steer','throttle','brake'].every(k=>S[k]===undefined||Number.isFinite(S[k]));
  G.setWorld('highway');W.density=.5;   // Busy (the slider's 0.30-0.65 band)
  document.getElementById('mDrive').click();await wait(1500);
  // the simulation is stepped here at 30 Hz (the page's own update), so the drive does not depend on the machine's frame rate; the frame rate is
  // measured afterwards on the page's own render loop and only reported
  const x0=S.x;let vmax=0,bad=!fin(),npcMax=0;
  K.w=true;for(let i=0;i<secs*30;i++){G.update(1/30);vmax=Math.max(vmax,S.v||0);npcMax=Math.max(npcMax,W.npcs.length);if(!fin())bad=true;if(i%30===29)await wait(0);}
  K.w=false;K.s=true;for(let i=0;i<20*30&&(S.v||0)>.5;i++){G.update(1/30);if(!fin())bad=true;if(i%30===29)await wait(0);}K.s=false;
  let frames=0,run=true;const tick=()=>{frames++;if(run)requestAnimationFrame(tick);};requestAnimationFrame(tick);const t0=performance.now();await wait(5000);run=false;
  return {vmaxKmh:+(vmax*3.6).toFixed(1),dist:+(Math.abs(S.x-x0)*.02).toFixed(1),stopped:(S.v||0)<=.5,npcMax,fps:+(frames*1000/(performance.now()-t0)).toFixed(1),finite:!bad};}"""

async def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    secs = 30
    if '--secs' in sys.argv: secs = float(sys.argv[sys.argv.index('--secs') + 1]); args = [a for a in args if a != sys.argv[sys.argv.index('--secs') + 1]]
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
                res = await pg.evaluate(PROBE, secs)
            except Exception as e:
                res = {'error': str(e)[:300]}
            why = []
            if errs: why.append('page errors: ' + ' | '.join(errs[:3]))
            if 'error' in res: why.append(res['error'])
            else:
                if not res['finite']: why.append('non-finite car state')
                if res['npcMax'] < 1: why.append('no traffic on the road')
                if res['dist'] < 5: why.append('the car did not move')
            ok = not why; fails += 0 if ok else 1
            print(f"  {'PASS' if ok else 'FAIL'}  {car:8s} {time.time()-t0:5.0f} s  " + (json.dumps(res) if 'error' not in res else '') + ('' if ok else '  -> ' + '; '.join(why)), flush=True)
            await pg.close()
        await b.close()
    print(('ALL PASS' if not fails else f'FAILED: {fails} car(s)') + f'  ({time.time()-T:.0f} s, throttle {secs:g} s each)')
    sys.exit(1 if fails else 0)

asyncio.run(main())
