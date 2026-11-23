"""Run: python t/spacer_check.py [cars] (builds nothing: run gar/build_garage.py first). Software rendering: CHECK_SOFTWARE_GL=1.
Spacers (C-08): per car, drag Spacer front and rear 0 -> 80 by the sliders' own input events, nothing else touched. The wheel (tyre) must move
out by 80 mm on its axle, live; the brake rotor must stay where it was (on the hub); back to 0 restores stock. Also: old saves load unchanged."""
import sys,os,asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1];PAGE=(ROOT/'gar'/'out'/'garage.html').as_uri();THREE=ROOT/'t'/'node_modules'/'three'/'build'/'three.min.js'
GL=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] if os.environ.get('CHECK_SOFTWARE_GL') else ['--ignore-gpu-blocklist']
PROBE="""async(car)=>{const G=window.__GARAGE,w=ms=>new Promise(r=>setTimeout(r,ms));
  if(G.CARID!==car){G.switchCar(car);for(let i=0;i<600&&!(window.__bootDone&&G.CARID===car);i++)await w(500);}await w(300);
  const T=G.THREE,ib=new T.Matrix4();
  const meas=()=>{G.carRoot.updateMatrixWorld(true);ib.copy(G.carRoot.matrixWorld).invert();const o={};
    for(const k in G.wheels){const W=G.wheels[k],p=new T.Vector3();const z=m=>{m.updateMatrixWorld(true);const v=new T.Vector3().setFromMatrixPosition(m.matrixWorld).applyMatrix4(ib);return Math.abs(v.z)*20;};
      o[k]={tire:+z(W.tire).toFixed(1),rotor:+z(W.rot).toFixed(1),front:!!W.steer};}return o;};
  const slide=(id,v)=>{const e=document.getElementById(id);if(!e)return false;e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));return true;};
  const shown=id=>{const e=document.getElementById(id);return !!e&&e.parentNode.style.display!=='none';};
  slide('wSpF',0);slide('wSpR',0);await w(400);const a=meas();
  const okF=slide('wSpF',80);await w(400);const b=meas();
  const okR=slide('wSpR',80);await w(400);const c=meas();
  slide('wSpF',0);slide('wSpR',0);await w(400);const d=meas();
  const out={car,sliders:okF&&okR,shown:shown('wSpF')&&shown('wSpR'),max:document.getElementById('wSpF').max,wheels:{}};
  for(const k in a)out.wheels[k]={front:a[k].front,tireMovedF:+(b[k].tire-a[k].tire).toFixed(1),tireMovedBoth:+(c[k].tire-a[k].tire).toFixed(1),rotorMovedBoth:+(c[k].rotor-a[k].rotor).toFixed(1),backToStock:+(d[k].tire-a[k].tire).toFixed(1)};
  // an old save (no spacer fields) loads unchanged
  const clean=G.validCfg?G.validCfg({wheel:G.cfg.wheel}):null;out.oldSave=clean?[clean.spacerF===undefined||clean.spacerF===0,clean.spacerR===undefined||clean.spacerR===0]:null;
  const big=G.validCfg?G.validCfg({wheel:G.cfg.wheel,spacerF:200,spacerR:-5}):null;out.clamp=big?[big.spacerF,big.spacerR]:null;
  return out;}"""
async def main():
    cars=sys.argv[1:] or ["e30","e30t","ef","z32","ae86","eclipse","gt2000","modelx"];fails=0
    async with async_playwright() as p:
        b=await p.chromium.launch(args=GL);pg=await b.new_page(viewport={'width':1280,'height':800});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:200]))
        body=THREE.read_bytes();await pg.route('**/*three*.js',lambda r:r.fulfill(status=200,body=body,headers={'content-type':'application/javascript'}))
        await pg.route('**/fonts.googleapis.com/**',lambda r:r.fulfill(status=200,body='',headers={'content-type':'text/css'}))
        await pg.goto(PAGE,timeout=600000);await pg.wait_for_function("window.__bootDone===true",timeout=600000)
        for car in cars:
            r=await pg.evaluate(PROBE,car);why=[]
            if car=='modelx':
                if r['shown']:why.append('spacer sliders shown on the Model X')
            else:
                if not r['shown']:why.append('sliders hidden')
                if str(r['max'])!='80':why.append('max '+str(r['max']))
                for k,v in r['wheels'].items():
                    want_f=80 if v['front'] else 0
                    if abs(v['tireMovedF']-want_f)>1.5:why.append(f"{k}: front slider moved it {v['tireMovedF']} mm (want {want_f})")
                    if abs(v['tireMovedBoth']-80)>1.5:why.append(f"{k}: both at 80 moved it {v['tireMovedBoth']} mm")
                    if abs(v['rotorMovedBoth'])>1.5:why.append(f"{k}: rotor moved {v['rotorMovedBoth']} mm (should stay on the hub)")
                    if abs(v['backToStock'])>0.5:why.append(f"{k}: back to 0 left {v['backToStock']} mm")
                if r['oldSave'] and not all(r['oldSave']):why.append('old save gains spacers')
                if r['clamp'] and r['clamp']!=[80,0]:why.append('clamp '+str(r['clamp']))
            fails+=bool(why);print(f"  {'PASS' if not why else 'FAIL'}  {car:8s} "+json.dumps({k:r[k] for k in ('max','shown','oldSave','clamp')})+' '+json.dumps({k:[v['tireMovedF'],v['tireMovedBoth'],v['rotorMovedBoth']] for k,v in r['wheels'].items()})+('' if not why else '  -> '+'; '.join(why)),flush=True)
        if errs:print('page errors:',errs[:3]);fails+=1
        await b.close()
    print('ALL PASS' if not fails else f'FAILED: {fails}')
asyncio.run(main())
