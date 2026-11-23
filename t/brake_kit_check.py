"""Real brake kits (C-10). Run: python t/brake_kit_check.py (run gar/build_garage.py first). Software rendering: CHECK_SOFTWARE_GL=1.
Per kit: it is offered on its own car only; the fit refuses it on the wheel the maker's sheet refuses and passes it on the smallest the sheet allows;
fitted, the drawn front rotor has the kit's diameter and the front calipers are drawn in the kit's colour (Brembo red), the rear stays stock where the
kit is front-only."""
import sys,os,asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1];PAGE=(ROOT/'gar'/'out'/'garage.html').as_uri();THREE=ROOT/'t'/'node_modules'/'three'/'build'/'three.min.js'
GL=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] if os.environ.get('CHECK_SOFTWARE_GL') else ['--ignore-gpu-blocklist']
KITS=[('z32','z32-brembo-gt4',16,17),('z32','z32-brembo-gt6',17,18),('z32','z32-stoptech-st60',17,18),('eclipse','eclipse-stoptech-st40',16,17),('eclipse','eclipse-evo-brembo',16,17)]
PROBE="""async([car,id,bad,good])=>{const G=window.__GARAGE,w=ms=>new Promise(r=>setTimeout(r,ms));
  if(G.CARID!==car){G.switchCar(car);for(let i=0;i<600&&!(window.__bootDone&&G.CARID===car);i++)await w(500);}await w(300);
  const offered=G.partList('brakes').some(p=>p.id===id);
  const blocked=dia=>{G.cfg.wheel.dia=dia;G.cfg.brakes=id;const R=G.checkFit(G.cfg),I=Array.isArray(R)?R:(R.issues||R.I||R.list||[]);return I.some(m=>m.sev==='BLOCK'&&m.slot==='brakes');};
  const stockWheel=JSON.parse(JSON.stringify(G.cfg.wheel)),stockBr=G.cfg.brakes;
  const r={offered,blockedBad:blocked(bad),blockedGood:blocked(good)};
  G.cfg.wheel.dia=good;G.cfg.brakes=id;G.refresh(true);await w(500);
  // the drawn parts: the rotor's radius and the calipers' dominant colour, front and rear
  const col=m=>{const c=m.geometry.attributes.color;if(!c)return null;const n={};for(let i=0;i<c.count;i++){const k=[c.getX(i),c.getY(i),c.getZ(i)].map(v=>Math.round(v*255)).join(',');n[k]=(n[k]||0)+1;}return Object.entries(n).sort((a,b)=>b[1]-a[1])[0][0];};
  const rad=m=>{m.geometry.computeBoundingBox();const b=m.geometry.boundingBox;return Math.round(Math.max(b.max.x-b.min.x,b.max.y-b.min.y)*m.scale.x*20);};
  const W=G.wheels;r.frontRotorMM=rad(W.FL.rot);r.frontCal=col(W.FL.cal);r.rearCal=col(W.RL.cal);r.rearRotorMM=rad(W.RL.rot);
  G.cfg.wheel=stockWheel;G.cfg.brakes=stockBr;G.refresh(true);await w(300);
  // and not on another car
  return r;}"""
async def main():
    fails=0
    async with async_playwright() as p:
        b=await p.chromium.launch(args=GL);pg=await b.new_page(viewport={'width':1280,'height':800});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:200]))
        if THREE.exists():
            body=THREE.read_bytes();await pg.route('**/*three*.js',lambda r:r.fulfill(status=200,body=body,headers={'content-type':'application/javascript'}))
        await pg.route('**/fonts.googleapis.com/**',lambda r:r.fulfill(status=200,body='',headers={'content-type':'text/css'}))
        await pg.goto(PAGE,timeout=600000);await pg.wait_for_function("window.__bootDone===true",timeout=600000)
        for car,id,bad,good in KITS:
            r=await pg.evaluate(PROBE,[car,id,bad,good]);why=[]
            if not r['offered']:why.append('not offered on its car')
            if not r['blockedBad']:why.append(f'not refused on {bad} in')
            if r['blockedGood']:why.append(f'refused on {good} in')
            red=lambda c:c and (lambda v:v[0]>120 and v[1]<70 and v[2]<70)([int(x) for x in c.split(',')])
            if not red(r['frontCal']):why.append('front caliper not red '+str(r['frontCal']))
            if id!='eclipse-evo-brembo' and red(r['rearCal']) and r['rearRotorMM']>=r['frontRotorMM']:why.append('front-only kit drawn at the rear too')
            fails+=bool(why);print(f"  {'PASS' if not why else 'FAIL'}  {car:8s} {id:24s} "+json.dumps(r)+('' if not why else '  -> '+'; '.join(why)),flush=True)
        other=await pg.evaluate("async()=>{const G=window.__GARAGE,w=ms=>new Promise(r=>setTimeout(r,ms));G.switchCar('e30');for(let i=0;i<600&&!(window.__bootDone&&G.CARID==='e30');i++)await w(500);return G.partList('brakes').map(p=>p.id).filter(i=>/brembo|stoptech/.test(i));}")
        print('  on the E30, real kits offered:',other);fails+=bool(other)
        if errs:print('page errors:',errs[:3]);fails+=1
        await b.close()
    print('ALL PASS' if not fails else f'FAILED: {fails}');sys.exit(1 if fails else 0)
asyncio.run(main())
