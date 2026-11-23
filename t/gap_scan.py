"""Gap scan: can you see INTO the car from outside with every opening shut? (owner, Nov 13: "check every inch when verifying")

For each car whose module exposes its body envelope (MOD.envelope; the Model X so far): every door, falcon wing, hood and the liftgate shut, the glass
drawn solid, then the car is looked at from 144 directions a player's camera can take (whole car, 6 heights x 24 round) and from 504 close views
(1.8 m from 36 points down each side, 7 directions each, about 1 mm a pixel). For every pixel the first surface is found; from it the scan steps
back toward the camera, and a surface on the outside of the car leaves the body's envelope within a few mm. One still inside the envelope 35 mm
back was seen through a hole (a seat, the carpet, the inside of a panel: whatever it is). Under the floor (below 300 mm) is the underbody and is
not counted. The JS is t/gap_scan.js. PASS means no such pixel anywhere.

    python t/gap_scan.py                 the cars that support it
    python t/gap_scan.py modelx          one car
    options: --no-build (use gar/out/garage.html as it is)
Software rendering (cloud machines): set CHECK_SOFTWARE_GL=1. Needs playwright + chromium and `npm install` in t/, as gar/check.py."""
import sys, os, asyncio, subprocess, time, json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT = Path(__file__).resolve().parents[1]
PAGE = (ROOT / 'gar' / 'out' / 'garage.html').as_uri()
THREE = ROOT / 't' / 'node_modules' / 'three' / 'build' / 'three.min.js'
SCAN = (ROOT / 't' / 'gap_scan.js').read_text(encoding='utf-8')
CARS = ['modelx']
GL = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] if os.environ.get('CHECK_SOFTWARE_GL') else ['--ignore-gpu-blocklist']

async def main():
    cars = [a for a in sys.argv[1:] if not a.startswith('--')] or CARS
    if '--no-build' not in sys.argv:
        r = subprocess.run([sys.executable, str(ROOT / 'gar' / 'build_garage.py')], capture_output=True, text=True); print(r.stdout.strip().splitlines()[-1] if r.stdout.strip() else r.stderr[-400:])
    fails = 0; T = time.time()
    async with async_playwright() as p:
        b = await p.chromium.launch(args=GL)
        for car in cars:
            pg = await b.new_page(viewport={'width': 1280, 'height': 800}); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
            if THREE.exists():
                body = THREE.read_bytes(); await pg.route('**/*three*.js', lambda r: r.fulfill(status=200, body=body, headers={'content-type': 'application/javascript'}))
            await pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, body='', headers={'content-type': 'text/css'}))
            t0 = time.time()
            try:
                await pg.goto(PAGE, timeout=300000); await pg.wait_for_function("window.__bootDone===true", timeout=300000)
                if await pg.evaluate("window.__GARAGE.CARID") != car:
                    await pg.evaluate(f"window.__GARAGE.switchCar('{car}')")
                    await pg.wait_for_function(f"window.__bootDone===true&&window.__GARAGE.CARID==='{car}'", timeout=300000)
                if not await pg.evaluate("typeof window.__GARAGE.MOD.envelope==='function'"):
                    print(f'  SKIP  {car:8s} its module does not expose its body envelope yet'); await pg.close(); continue
                res = await pg.evaluate(SCAN, {})
            except Exception as e:
                res = {'error': str(e)[:300]}
            ok = not errs and 'error' not in res and res['flaggedPx'] == 0; fails += 0 if ok else 1
            head = {k: res[k] for k in res if k != 'gaps'}
            print(f"  {'PASS' if ok else 'FAIL'}  {car:8s} {time.time()-t0:5.0f} s  {json.dumps(head)}" + (('  page errors: ' + ' | '.join(errs[:3])) if errs else ''), flush=True)
            for g in res.get('gaps', [])[:20]: print('        ' + g['tag'] + f": {g['px']} px, at (mm, nearest 100) " + '; '.join(g['at'][:4]))
            await pg.close()
        await b.close()
    print(('ALL PASS' if not fails else f'FAILED: {fails} car(s)') + f'  ({time.time()-T:.0f} s)')
    sys.exit(1 if fails else 0)

asyncio.run(main())
