"""Page server: boots gar/out/garage.html once in headless Chromium, switches to one car, then answers probe requests on a localhost port.
A reload (rebuild + reboot) takes about 30 s; every probe after that takes seconds instead of the 1-2 minutes a fresh page costs.

    python t/probe/srv.py ae86            (leave it running; port 8765, or set VG_PORT)
    python t/probe/q.py evalf t/probe/map.js '{"y":540, ...}'

Requests (q.py): eval <js> [arg] | evalf <file.js> [arg] | reload [nobuild] | shot <png> <camjson> [js] | quit
Needs: pip install playwright, python -m playwright install chromium, and npm install inside t/ (for the local three.js)."""
import sys, os, json, asyncio, subprocess, traceback
from pathlib import Path
from playwright.async_api import async_playwright
ROOT = Path(__file__).resolve().parents[2]
PAGE = (ROOT / 'gar' / 'out' / 'garage.html').as_uri()
THREE = ROOT / 't' / 'node_modules' / 'three' / 'build' / 'three.min.js'
CAR = sys.argv[1] if len(sys.argv) > 1 else 'ae86'
PORT = int(os.environ.get('VG_PORT', '8765'))
GL = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] if os.environ.get('CHECK_SOFTWARE_GL') else ['--ignore-gpu-blocklist']

async def boot(b):
    pg = await b.new_page(viewport={'width': 1600, 'height': 1000})
    if THREE.exists():
        body = THREE.read_bytes()
        await pg.route('**/*three*.js', lambda r: r.fulfill(status=200, body=body, headers={'content-type': 'application/javascript'}))
    await pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, body='', headers={'content-type': 'text/css'}))
    pg.on('pageerror', lambda e: print('PAGE ERROR', e, flush=True))
    await pg.goto(PAGE, timeout=300000)
    await pg.wait_for_function("window.__bootDone===true", timeout=300000)
    if await pg.evaluate("window.__GARAGE.CARID") != CAR:
        await pg.evaluate(f"window.__GARAGE.switchCar('{CAR}')")
        await pg.wait_for_function(f"window.__bootDone===true&&window.__GARAGE.CARID==='{CAR}'", timeout=300000)
    await pg.add_style_tag(content="body.shot>*:not(#c){display:none!important}")   # screenshots: canvas only
    print('booted', CAR, flush=True)
    return pg

async def main():
    if not (ROOT / 'gar' / 'out' / 'garage.html').exists():
        subprocess.run([sys.executable, str(ROOT / 'gar' / 'build_garage.py')], check=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(args=GL)
        st = {'pg': await boot(b)}
        async def handle(r, w):
            try:
                req = json.loads((await r.read()).decode()); op = req['op']; pg = st['pg']
                if op == 'eval':
                    res = await pg.evaluate(req['js'], req.get('arg'))
                elif op == 'reload':
                    if req.get('build', True):
                        o = subprocess.run([sys.executable, str(ROOT / 'gar' / 'build_garage.py')], capture_output=True, text=True)
                        if o.returncode: raise RuntimeError(o.stdout + o.stderr)
                    await pg.close(); st['pg'] = await boot(b); res = 'reloaded'
                elif op == 'shot':
                    await pg.evaluate("()=>document.body.classList.add('shot')")
                    if req.get('js'): await pg.evaluate(req['js'])
                    await pg.evaluate("c=>{const G=window.__GARAGE;G.cam.goal=null;Object.assign(G.cam,c);}", req['cam'])
                    await pg.wait_for_timeout(req.get('wait', 1200))
                    await pg.screenshot(path=req['path'], timeout=180000)
                    await pg.evaluate("()=>document.body.classList.remove('shot')")
                    res = req['path']
                elif op == 'quit':
                    w.write(b'{"ok":true,"res":"bye"}'); await w.drain(); w.close(); os._exit(0)
                else:
                    raise ValueError('unknown op ' + op)
                out = json.dumps({'ok': True, 'res': res})
            except Exception:
                out = json.dumps({'ok': False, 'err': traceback.format_exc()[-3000:]})
            w.write(out.encode()); await w.drain(); w.close()
        srv = await asyncio.start_server(handle, '127.0.0.1', PORT)
        print('listening on 127.0.0.1:%d' % PORT, flush=True)
        async with srv: await srv.serve_forever()

asyncio.run(main())
