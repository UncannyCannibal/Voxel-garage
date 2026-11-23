"""Window tint (C-06). Run: python t/tint_check.py [cars] (run gar/build_garage.py first). Software rendering: CHECK_SOFTWARE_GL=1.
Per car, the slider moved by its own input events and nothing else touched: at 100 every glass material on the car is darker (higher opacity, darker
colour) than its stock look, at 50 in between, from the driver's seat lighter than outside, back at 0 exactly stock. The cars are visited in turn
with the tint left at 100 on the car before, so a car's own glass (a clone of the shared glass) must still start from its true stock look. A save
keeps the value and clamps it to 0-100."""
import sys,os,asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1];PAGE=(ROOT/'gar'/'out'/'garage.html').as_uri();THREE=ROOT/'t'/'node_modules'/'three'/'build'/'three.min.js'
GL=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] if os.environ.get('CHECK_SOFTWARE_GL') else ['--ignore-gpu-blocklist']
STOCK={'ae86':.42,'eclipse':.62,'gt2000':.42}   # a car's own glass opacity where it clones the shared glass (the rest: the shared .34; Model X its own)
PROBE="""async(car)=>{const G=window.__GARAGE,S=G.state,w=ms=>new Promise(r=>setTimeout(r,ms));
  if(G.CARID!==car){G.switchCar(car);for(let i=0;i<600&&!(window.__bootDone&&G.CARID===car);i++)await w(500);}await w(400);
  const mats=()=>{const s=new Set();G.carRoot.traverse(o=>{if(!o.isMesh)return;for(const m of [].concat(o.material))if(m&&m.userData&&m.userData.glass)s.add(m);});return [...s];};
  const look=()=>mats().map(m=>({op:+m.opacity.toFixed(3),lum:+((m.color.r+m.color.g+m.color.b)/3).toFixed(3)}));
  const slide=v=>{const e=document.getElementById('tint');e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));};
  S.view='orbit';await w(200);const a=look();slide(100);await w(200);const b=look();slide(50);await w(200);const c=look();
  S.view='cockpit';await w(300);const d=look();S.view='orbit';await w(300);slide(0);await w(200);const e=look();
  const keep=G.validCfg({wheel:G.cfg.wheel,glassTint:150}).glassTint,keep2=G.validCfg({wheel:G.cfg.wheel,glassTint:37}).glassTint;
  slide(100);await w(200);   // left tinted: the next car must still start from its own stock look
  return {n:a.length,stock:a,full:b,half:c,cockpitHalf:d,back:e,clamp150:keep,keep37:keep2,label:document.getElementById('tintO').textContent};}"""
async def main():
    cars=sys.argv[1:] or ['e30','e30t','ef','z32','ae86','eclipse','gt2000','modelx'];fails=0
    async with async_playwright() as p:
        b=await p.chromium.launch(args=GL);pg=await b.new_page(viewport={'width':1280,'height':800});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:200]))
        if THREE.exists():
            body=THREE.read_bytes();await pg.route('**/*three*.js',lambda r:r.fulfill(status=200,body=body,headers={'content-type':'application/javascript'}))
        await pg.route('**/fonts.googleapis.com/**',lambda r:r.fulfill(status=200,body='',headers={'content-type':'text/css'}))
        await pg.goto(PAGE,timeout=600000);await pg.wait_for_function("window.__bootDone===true",timeout=600000)
        for car in cars:
            r=await pg.evaluate(PROBE,car);why=[]
            if r['n']<1:why.append('no glass found')
            for i,(s0,f,h,ck,bk) in enumerate(zip(r['stock'],r['full'],r['half'],r['cockpitHalf'],r['back'])):
                if not(f['op']>h['op']>s0['op'] or s0['op']>=.95):why.append(f'mat{i} opacity not rising {s0["op"]}->{h["op"]}->{f["op"]}')
                if not(f['lum']<h['lum']<s0['lum']):why.append(f'mat{i} not darkening {s0["lum"]}->{h["lum"]}->{f["lum"]}')
                if not(ck['op']<h['op']):why.append(f'mat{i} cockpit not lighter')
                if abs(bk['op']-s0['op'])>1e-3 or abs(bk['lum']-s0['lum'])>1e-3:why.append(f'mat{i} not back to stock')
                if f['op']>.951:why.append(f'mat{i} opacity over .95')
            if car in STOCK and not any(abs(s['op']-STOCK[car])<1e-3 for s in r['stock']):why.append(f"own glass not at stock {STOCK[car]}: {[s['op'] for s in r['stock']]}")
            if r['clamp150']!=100 or r['keep37']!=37:why.append(f"save clamp {r['clamp150']}, {r['keep37']}")
            fails+=bool(why);print(f"  {'PASS' if not why else 'FAIL'}  {car:8s} glass materials {r['n']}: stock "+' '.join(f"{s['op']}/{s['lum']}" for s in r['stock'])+' | 100%: '+' '.join(f"{s['op']}/{s['lum']}" for s in r['full'])+('' if not why else '  -> '+'; '.join(why[:4])),flush=True)
        if errs:print('page errors:',errs[:3]);fails+=1
        await b.close()
    print('ALL PASS' if not fails else f'FAILED: {fails}');sys.exit(1 if fails else 0)
asyncio.run(main())
