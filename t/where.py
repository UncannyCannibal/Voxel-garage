"""Where exactly is the problem? Measuring tools for the in-page check (gar/check.py).

    python t/where.py pair ae86 engMesh hoses        overlap of two parts, grouped into 40 mm clusters (x, y, z in mm)
    python t/where.py parts ae86 "engMesh|bay|fan"   extents of every part whose name matches (mm)
    python t/where.py map ae86 620 "engMesh,fan,bay" occupancy at one height: rows x, columns z (letters = parts, . = free)
    python t/where.py points ae86                     the car's named service points (thermostat, water inlet, throttle body)

Part names are the ones the check prints (bodyMesh, doorL, hoses, linkFL.lowF, tyreFR ...).
Build the page first (python gar/build_garage.py). Needs: pip install playwright; python -m playwright install chromium.
Coordinates: x along the car (+ forward, 0 = mid-wheelbase), y up from the ground, z across (+ right).
"""
import sys, asyncio, json, collections
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
PAGE = (ROOT / 'gar' / 'out' / 'garage.html').as_uri()
THREE = ROOT / 't' / 'node_modules' / 'three' / 'build' / 'three.min.js'

INSIDE = """const IN=X=>Math.abs(X-Math.round(X))<.49,inside=(parts,x,y,z)=>{for(const part of parts)for(const m of part.meshes){const e=m.Mi.elements,
  X=e[0]*x+e[4]*y+e[8]*z+e[12],Y=e[1]*x+e[5]*y+e[9]*z+e[13],Z=e[2]*x+e[6]*y+e[10]*z+e[14];if(IN(X)&&IN(Y)&&IN(Z)&&m.take(m.g.get(X,Y,Z),m.sel))return true;}return false;};"""

async def page(car):
    p = await async_playwright().start()
    b = await p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    pg = await b.new_page(viewport={'width': 600, 'height': 400})
    await pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, body='', headers={'content-type': 'text/css'}))
    if THREE.exists():
        body = THREE.read_bytes()
        await pg.route('**/*three*.js', lambda r: r.fulfill(status=200, body=body, headers={'content-type': 'application/javascript'}))
    await pg.goto(PAGE, timeout=300000)
    await pg.wait_for_function("window.__bootDone===true", timeout=300000)
    if await pg.evaluate("window.__GARAGE.CARID") != car:
        await pg.evaluate(f"window.__GARAGE.switchCar('{car}')")
        await pg.wait_for_function(f"window.__bootDone===true&&window.__GARAGE.CARID==='{car}'", timeout=300000)
    return p, b, pg

async def main(cmd, car, *a):
    p, b, pg = await page(car)
    try:
        if cmd == 'pair':
            pts = await pg.evaluate("""([A,B])=>{const ps=window.__QA.collect(),pa=ps.filter(p=>p.name===A),pb=ps.filter(p=>p.name===B);
              if(!pa.length||!pb.length)return 'missing; parts are: '+ps.map(p=>p.name).join(', ');""" + INSIDE + """
              const out=[];for(const [P,Q,n] of [[pa,pb,A],[pb,pa,B]])for(const part of P)for(const m of part.meshes){const s=m.pts;for(let i=0;i<s.length;i+=3)
                if(inside(Q,s[i],s[i+1],s[i+2]))out.push([n,Math.round(s[i]*20),Math.round(s[i+1]*20),Math.round(s[i+2]*20)]);}return out;}""", [a[0], a[1]])
            if isinstance(pts, str): print(pts); return
            C = collections.Counter((n, x // 40 * 40, y // 40 * 40, z // 40 * 40) for n, x, y, z in pts)
            print(f'{len(pts)} overlapping sample points; clusters of 40 mm (part whose points lie inside the other):')
            for (n, x, y, z), v in sorted(C.items()):
                print(f'  {n:14s} x {x:6d}  y {y:5d}  z {z:6d}   {v}')
        elif cmd == 'parts':
            r = await pg.evaluate("""(re)=>{const R=new RegExp('^('+re+')$');return window.__QA.collect().filter(p=>R.test(p.name)).map(p=>[p.name,...p.box.map(v=>Math.round(v*20))]);}""", a[0] if a else '.*')
            for n, *bx in r:
                print(f'{n:20s} x {bx[0]:6d}..{bx[1]:6d}  y {bx[2]:5d}..{bx[3]:5d}  z {bx[4]:6d}..{bx[5]:6d}')
        elif cmd == 'map':
            y, names = int(a[0]), a[1].split(',')
            x0, x1, z0, z1 = (int(v) for v in (a[2:6] if len(a) >= 6 else (-2300, 2300, -900, 900)))
            r = await pg.evaluate("""([y,names,x0,x1,z0,z1])=>{const ps=window.__QA.collect();""" + INSIDE + """
              const L=names.map(n=>[ps.filter(p=>p.name===n),n[0]]),dx=Math.max(20,Math.round((x1-x0)/40/20)*20),dz=Math.max(20,Math.round((z1-z0)/60/20)*20),rows=[];
              for(let x=x1;x>=x0;x-=dx){let s='';for(let z=z0;z<=z1;z+=dz){let c='.';for(const [pp,ch] of L)if(pp.length&&inside(pp,x/20,y/20,z/20)){c=ch;break;}s+=c;}rows.push(String(x).padStart(6)+' '+s);}
              return 'height '+y+' mm; rows x '+x1+'..'+x0+' step '+dx+'; columns z '+z0+'..'+z1+' step '+dz+'; letters = first letter of '+names.join(', ')+'\\n'+rows.join('\\n');}""",
                [y, names, x0, x1, z0, z1])
            print(r)
        elif cmd == 'points':
            r = await pg.evaluate("JSON.stringify(Object.fromEntries(Object.entries(window.__GARAGE.build.hosePts||{}).map(([k,v])=>[k,v.map(c=>Math.round(c*20))])))")
            print(r)
        else:
            print(__doc__)
    finally:
        await b.close(); await p.stop()

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print(__doc__); sys.exit(1)
    asyncio.run(main(*sys.argv[1:]))
