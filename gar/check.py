"""One command that says whether the build is healthy.

    python check.py                 build the page, then run the quick check on every car
    python check.py --full          the full check (doors, hood and hatch open, suspension settled)
    python check.py ae86 eclipse    only these cars
    python check.py --no-build      check out/garage.html as it is
    python check.py ae86 --all      list every problem instead of the first 30

What it does: builds out/garage.html from the source files (build_garage.py), opens it in a
headless Chromium, and for each car presses the page's own "Check this build" button
(View tab). The check finds parts that overlap each other and pieces that float loose.
It also records any script error the page throws.

Exit code 0 means every car passed. Anything else means something failed, and the report
says which car and which parts. Nobody calls work done until this passes.

Reports are written to out/check/<car>.txt.

Setup, once:  pip install playwright   then   python -m playwright install chromium
"""
import sys, os, asyncio, time, subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE / 'out'
PAGE = OUT / 'garage.html'
args = [a for a in sys.argv[1:] if not a.startswith('--')]
FULL = '--full' in sys.argv
JOBS = int(os.environ.get('CHECK_JOBS', '3'))      # cars checked at the same time

def build():
    r = subprocess.run([sys.executable, str(HERE / 'build_garage.py')], capture_output=True, text=True)
    sys.stdout.write(r.stdout)
    if r.returncode != 0:
        sys.stdout.write(r.stderr)
        sys.exit('BUILD FAILED')

async def check_car(browser, car, three, sem, results):
    async with sem:
        t0 = time.time()
        pg = await browser.new_page(viewport={'width': 1280, 'height': 800})
        errors = []
        pg.on('pageerror', lambda e: errors.append(str(e)))
        if three:   # offline: serve three.js from a local copy instead of the CDN
            await pg.route('**/*three*.js', lambda r: r.fulfill(status=200, body=three, headers={'content-type': 'application/javascript'}))
        await pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, body='', headers={'content-type': 'text/css'}))
        try:
            await pg.goto(PAGE.as_uri(), timeout=300000)   # the page is 1.2 MB of script; several cars loading at once can take a while
            await pg.wait_for_function("window.__GARAGE!==undefined && window.__bootDone===true", timeout=300000)
            if await pg.evaluate("window.__GARAGE.CARID") != car:
                await pg.evaluate(f"window.__GARAGE.switchCar('{car}')")
                await pg.wait_for_function(f"window.__bootDone===true && window.__GARAGE.CARID==='{car}'", timeout=300000)
            if '--all' in sys.argv:
                await pg.evaluate('window.QA_MAX=1e9')   # list every failing pair, not just the first 30
            await pg.evaluate("document.getElementById('%s').click()" % ('bQA2' if FULL else 'bQA'))
            await pg.wait_for_function("/QA (PASS|FAIL)|QA error/.test(document.getElementById('qaOut').value)",
                                       timeout=3600000, polling=2000)
            report = await pg.evaluate("document.getElementById('qaOut').value")
        except Exception as e:
            report = 'CHECK COULD NOT RUN: ' + str(e).split('\n')[0]
        await pg.close()
        if errors:
            report += '\nSCRIPT ERRORS:\n' + '\n'.join(errors)
        ok = ('QA PASS' in report) and not errors
        (OUT / 'check').mkdir(exist_ok=True)
        (OUT / 'check' / f'{car}.txt').write_text(report, encoding='utf-8')
        first_fail = next((l.strip() for l in report.split('\n') if l.startswith('FAIL') or 'COULD NOT' in l or 'SCRIPT ERRORS' in l), '')
        results[car] = (ok, time.time() - t0, first_fail)
        print(f"  {'PASS' if ok else 'FAIL'}  {car:<8} {time.time()-t0:5.0f} s  {first_fail}", flush=True)

async def main():
    from playwright.async_api import async_playwright
    if '--no-build' not in sys.argv:
        build()
    local3 = HERE.parent / 't' / 'node_modules' / 'three' / 'build' / 'three.min.js'
    three = local3.read_bytes() if local3.exists() and os.environ.get('CHECK_LOCAL_THREE', '1') == '1' else None
    async with async_playwright() as p:
        gl = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] if os.environ.get('CHECK_SOFTWARE_GL') else ['--ignore-gpu-blocklist']
        browser = await p.chromium.launch(args=gl)
        pg = await browser.new_page()
        if three:
            await pg.route('**/*three*.js', lambda r: r.fulfill(status=200, body=three, headers={'content-type': 'application/javascript'}))
        await pg.goto(PAGE.as_uri(), timeout=300000)
        await pg.wait_for_function("window.__GARAGE!==undefined && window.__bootDone===true", timeout=300000)
        cars = args or await pg.evaluate("Object.keys(CAR_MODULES)")
        await pg.close()
        print(f"Checking {len(cars)} cars ({'full' if FULL else 'quick'}): {', '.join(cars)}", flush=True)
        sem = asyncio.Semaphore(JOBS); results = {}
        await asyncio.gather(*(check_car(browser, c, three, sem, results) for c in cars))
        await browser.close()
    bad = [c for c in cars if not results[c][0]]
    print('\nALL PASS' if not bad else f"\nFAILED: {', '.join(bad)}  (details in out/check/<car>.txt)")
    sys.exit(0 if not bad else 1)

asyncio.run(main())
