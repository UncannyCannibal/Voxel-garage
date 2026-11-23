"""SOUND-01 live test: the real page in Chromium (audio allowed to start), the Sound button (it sits in the menu, so it is clicked from the page), driving on the real keyboard.
    python t/sound/live.py [car]
Checks: the sound starts on the button; while driving, the loudest tone in the output follows the engine's firing frequency; a
different car rebuilds the sound; the sound off stops the audio clock and on starts it again; no page errors. (The driver's view vs
outside is compared offline, at the same revs: render.js 'holds' with view.)"""
import sys, asyncio, json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT = Path(__file__).resolve().parents[2]
PAGE = (ROOT / 'gar' / 'out' / 'garage.html').as_uri()
THREE = ROOT / 't' / 'node_modules' / 'three' / 'build' / 'three.min.js'
CAR = sys.argv[1] if len(sys.argv) > 1 else 'e30'
PROBE = """()=>{const G=window.__GARAGE,A=G.sound.audio;if(!A)return null;const an=A.an,n=an.frequencyBinCount,d=new Float32Array(n);an.getFloatFrequencyData(d);
  const sr=A.ctx.sampleRate,bw=sr/an.fftSize;let best=-1e9,bi=0;for(let i=Math.floor(20/bw);i<Math.floor(1500/bw);i++)if(d[i]>best){best=d[i];bi=i;}
  let hi=0,all=0;for(let i=1;i<n;i++){const pw=Math.pow(10,d[i]/10);all+=pw;if(i*bw>1000)hi+=pw;}
  const t=new Float32Array(an.fftSize);an.getFloatTimeDomainData(t);let s=0;for(const v of t)s+=v*v;
  const S=G.state,P=A.prof;return {state:A.ctx.state,ctxT:+A.ctx.currentTime.toFixed(2),rpm:Math.round(S.rpm),gear:S.gear,thr:+S.throttle.toFixed(2),kmh:Math.round(S.v*3.6),
    peakHz:+(bi*bw).toFixed(1),hiDb:+(10*Math.log10(hi/all+1e-12)).toFixed(1),peakDb:+best.toFixed(1),rmsDb:+(10*Math.log10(s/t.length+1e-12)).toFixed(1),fire:P.cyl?+(S.rpm/60*P.cyl/2).toFixed(1):null,sig:A.sig,view:S.view};}"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required', '--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width': 1400, 'height': 900})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        if THREE.exists():
            body = THREE.read_bytes(); await pg.route('**/*three*.js', lambda r: r.fulfill(status=200, body=body, headers={'content-type': 'application/javascript'}))
        await pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, body='', headers={'content-type': 'text/css'}))
        await pg.goto(PAGE, timeout=300000); await pg.wait_for_function("window.__bootDone===true", timeout=300000)
        if await pg.evaluate("window.__GARAGE.CARID") != CAR:
            await pg.evaluate(f"window.__GARAGE.switchCar('{CAR}')"); await pg.wait_for_function(f"window.__bootDone===true&&window.__GARAGE.CARID==='{CAR}'", timeout=300000)
        rows = []
        async def snap(tag):
            r = await pg.evaluate(PROBE); r['tag'] = tag; rows.append(r); print(json.dumps(r), flush=True); return r
        await pg.click('#mDrive', no_wait_after=True); await pg.wait_for_timeout(500)
        await pg.evaluate("document.getElementById('tSound').click()"); await pg.wait_for_timeout(1500); await snap('idle')
        await pg.mouse.click(700, 450)   # focus the canvas for the keys
        await pg.keyboard.down('w')
        for i in range(10): await pg.wait_for_timeout(500); await snap('full throttle')
        await pg.keyboard.up('w')
        for i in range(3): await pg.wait_for_timeout(400); await snap('lift')
        await pg.keyboard.down('w'); await pg.wait_for_timeout(4000); await snap('outside, on throttle')
        for _ in range(3):
            if await pg.evaluate("window.__GARAGE.state.view") == 'cockpit': break
            await pg.evaluate("document.getElementById('tView').click()"); await pg.wait_for_timeout(300)
        await pg.wait_for_timeout(600); await snap('cockpit, on throttle'); await pg.keyboard.up('w')
        await pg.keyboard.down(' '); await pg.wait_for_timeout(3000); await pg.keyboard.up(' ')
        sig0 = rows[-1]['sig']
        other = 'z32' if CAR != 'z32' else 'e30'
        await pg.evaluate(f"window.__GARAGE.switchCar('{other}')"); await pg.wait_for_function(f"window.__bootDone===true&&window.__GARAGE.CARID==='{other}'", timeout=300000)
        await pg.wait_for_timeout(1500); r = await snap('after switching to ' + other)
        await pg.evaluate("document.getElementById('tSound').click()")
        for _ in range(20):   # 2 s of audio clock and then the next frame (a slow software renderer can take a few seconds per frame)
            await pg.wait_for_timeout(500)
            if await pg.evaluate("window.__GARAGE.sound.audio.ctx.state") == 'suspended': break
        r2 = await snap('sound off')
        await pg.evaluate("document.getElementById('tSound').click()"); await pg.wait_for_timeout(4000); r3 = await snap('sound back on')
        # verdicts
        drv = [x for x in rows if x['tag'] == 'full throttle' and x['rpm'] > 2000 and x['fire']]
        def near_order(x):   # the loudest tone is the firing frequency or one of its multiples / halves (within 6 %)
            k = x['peakHz'] / x['fire']; return min(abs(k - m) / m for m in (0.5, 1, 1.5, 2, 3, 4)) < 0.06
        ok = {'started': rows[0]['state'] == 'running',
              'tone follows the firing (share of samples)': round(sum(near_order(x) for x in drv) / max(1, len(drv)), 2),
              'rebuilt for the other car': r['sig'] != sig0, 'off -> suspended': r2['state'] == 'suspended', 'back on -> running and heard': r3['state'] == 'running' and r3['rmsDb'] > -80, 'page errors': errs}
        print('VERDICT', json.dumps(ok), flush=True)
        await b.close()
asyncio.run(main())
