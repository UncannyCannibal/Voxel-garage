"""STEER-03 play test: the built page in Chromium, driven with real key presses through the game's own loop (not G.update calls).
    python t/steer/play.py <car> <outdir>
Drives off, holds A at a crawl and at speed, lets go, takes driver's-view and chase shots with the wheel turned, and logs the steering wheel, the
front wheels and the car's yaw. Prints any page error. Needs the same setup as t/probe/srv.py."""
import sys, os, json, asyncio
from pathlib import Path
from playwright.async_api import async_playwright
ROOT = Path(__file__).resolve().parents[2]
PAGE = (ROOT / 'gar' / 'out' / 'garage.html').as_uri()
THREE = ROOT / 't' / 'node_modules' / 'three' / 'build' / 'three.min.js'
CAR, OUT = sys.argv[1], Path(sys.argv[2]); OUT.mkdir(parents=True, exist_ok=True)
GL = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
LOG = "()=>{const S=window.__GARAGE.state;return {sw:+(S.sw*57.3).toFixed(1),delta:+(S.delta*57.3).toFixed(2),yaw:+(S.yawR*57.3).toFixed(1),kmh:Math.round(S.v*3.6),g:+((S.ay||0)/9.81).toFixed(2),slip:+((S.slip||0)*57.3).toFixed(1),view:S.view,rimRot:+((window.__GARAGE.P.swheel?(window.__GARAGE.P.swheel.rotation.z||-window.__GARAGE.P.swheel.rotation.x):0)*57.3).toFixed(1)}}"
async def main():
    errs = []
    async with async_playwright() as p:
        b = await p.chromium.launch(args=GL)
        pg = await b.new_page(viewport={'width': 640, 'height': 400})
        body = THREE.read_bytes()
        await pg.route('**/*three*.js', lambda r: r.fulfill(status=200, body=body, headers={'content-type': 'application/javascript'}))
        await pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, body='', headers={'content-type': 'text/css'}))
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(PAGE, timeout=300000)
        await pg.wait_for_function("window.__bootDone===true", timeout=300000)
        if await pg.evaluate("window.__GARAGE.CARID") != CAR:
            await pg.evaluate(f"window.__GARAGE.switchCar('{CAR}')")
            await pg.wait_for_function(f"window.__bootDone===true&&window.__GARAGE.CARID==='{CAR}'", timeout=300000)
        await pg.evaluate("document.getElementById('mDrive').click()"); await pg.wait_for_timeout(800); await pg.mouse.click(320, 150); await pg.evaluate("window.__GARAGE.gfxPick('low')")
        log = {}
        # software GL draws about 2 frames a second here, and the game caps a frame at 0.05 s, so game time runs slow: every wait is in GAME seconds
        # (state.t), polled, so a hold of 0.15 s is 0.15 s of the car's time however slow the machine is
        async def wait_game(secs):
            t0 = await pg.evaluate("window.__GARAGE.state.t")
            while await pg.evaluate("window.__GARAGE.state.t") < t0 + secs: await pg.wait_for_timeout(40)
        async def hold(key, secs):
            await pg.keyboard.down(key); await wait_game(secs); r = await pg.evaluate(LOG); await pg.keyboard.up(key); return r
        # 1. at a crawl: roll off, then the left key held 1.5 s; the driver's view shows the wheel turned
        await pg.keyboard.down('w'); await wait_game(.7); await pg.keyboard.up('w')
        log['crawl_hold_left_1.5s'] = await hold('a', 1.5)
        await pg.evaluate("window.__GARAGE.state.view='cockpit'"); await pg.keyboard.down('a'); await wait_game(.3)
        log['crawl_cockpit'] = await pg.evaluate(LOG); await pg.screenshot(path=str(OUT / f'{CAR}_cockpit_left.png'))
        await pg.keyboard.up('a'); await wait_game(2.5); log['crawl_released_2.5s'] = await pg.evaluate(LOG)
        await pg.screenshot(path=str(OUT / f'{CAR}_cockpit_released.png'))
        # 2. at speed: build speed, then a tap and a hold, from the chase view
        await pg.evaluate("window.__GARAGE.state.view='chase'")
        await pg.keyboard.down('w'); await wait_game(5); log['speed'] = await pg.evaluate(LOG)
        log['speed_tap_0.15s'] = await hold('a', .15); await wait_game(.8); log['speed_after_tap'] = await pg.evaluate(LOG)
        log['speed_hold_0.6s'] = await hold('d', .6); await pg.screenshot(path=str(OUT / f'{CAR}_chase_right.png'))
        await wait_game(1.5); log['speed_released_1.5s'] = await pg.evaluate(LOG); await pg.keyboard.up('w')
        fps = await pg.evaluate("new Promise(r=>{let n=0;const t0=performance.now();const f=()=>{n++;if(performance.now()-t0<1000)requestAnimationFrame(f);else r(n);};requestAnimationFrame(f);})")
        log['fps'] = fps; log['errors'] = errs
        await b.close()
    print(json.dumps(log, indent=1))
asyncio.run(main())
