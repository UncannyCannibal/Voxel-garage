"""MX-05: real screen clicks, cabin motion/fit and private cabin renders.
Uses the unmodified in-page QA; no geometry exemptions. Usage: output directory.
"""
import asyncio, base64, json, sys, time
from pathlib import Path
from where import page

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / sys.argv[1]

async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    p,b,pg = await page('modelx')
    errors=[];pg.on('pageerror',lambda e:errors.append(str(e)))
    pg.on('console',lambda m:print(m.text,flush=True) if m.text.startswith('MX05 ') else None)
    started=time.perf_counter();report={}
    try:
        await pg.evaluate('window.requestAnimationFrame=()=>0')
        await pg.set_viewport_size({'width':1440,'height':960})
        await pg.click('#mGarage')
        async def camera(eye,target):
            await pg.evaluate('''([eye,target])=>{const G=__GARAGE;G.camera.position.set(...eye.map(v=>v/20));
            G.camera.near=.5;G.camera.fov=65;G.camera.aspect=1.5;G.camera.lookAt(...target.map(v=>v/20));
            G.camera.updateProjectionMatrix();G.camera.updateMatrixWorld();G.renderer.setSize(1440,960,false);}''',[eye,target])
        async def image(name):
            uri=await pg.evaluate('''()=>{const G=__GARAGE;G.renderer.render(G.scene,G.camera);return G.renderer.domElement.toDataURL('image/png');}''')
            (OUT/(name+'.png')).write_bytes(base64.b64decode(uri.split(',')[1]))
        async def tick():
            await pg.evaluate('for(let i=0;i<180;i++)__GARAGE.update(1/60)')
        async def click(name,index):
            xy=await pg.evaluate('''([name,index])=>{const G=__GARAGE,d=G.build.mxCabin.displays.find(d=>d.name===name),b=d.buttons[index];
            G.body.updateWorldMatrix(true,true);const q=d.plane.geometry.parameters;
            const p=d.plane.localToWorld(new G.THREE.Vector3(((b.x+b.w/2)/d.cv.width-.5)*q.width,(.5-(b.y+b.h/2)/d.cv.height)*q.height,0)).project(G.camera);
            return [(p.x+1)*innerWidth/2,(1-p.y)*innerHeight/2];}''',[name,index])
            await pg.mouse.click(*xy);await tick();return xy
        await tick();await camera([250,1300,-470],[620,1000,0]);await image('driver-controls')
        controls=[]
        for i,key in enumerate(['win','lights','doorL','doorR','rdoorL','trunk','hood','cover']):
            before=await pg.evaluate(f'__GARAGE.state.{key}')
            xy=await click('screenCentre',i)
            after=await pg.evaluate(f'__GARAGE.state.{key}')
            effect=await pg.evaluate('''key=>{const G=__GARAGE;return key==='win'?G.build.mxCabin.windows.map(a=>a.findIndex(m=>m&&m.visible)):
            key==='lights'?G.P.headlampL.children[0].material.emissiveIntensity:key==='cover'?G.P.cover.children[0].scale.x:G.P[key].rotation.toArray().slice(0,3);}''',key)
            if not after or after==before:errors.append('Screen click failed: '+key)
            controls.append({'key':key,'pointerXY':xy,'before':before,'after':after,'effect':effect})
            await click('screenCentre',i)
            if await pg.evaluate(f'__GARAGE.state.{key}')!=before:errors.append('Screen return failed: '+key)
        report['centreClicks']=controls
        await camera([-900,850,0],[-270,580,0]);await image('rear-display')
        await click('screenRear',0)
        report['rearClick']=await pg.evaluate('__GARAGE.state.win')
        if not report['rearClick']:errors.append('Rear screen window button failed')
        await click('screenRear',0)
        await pg.evaluate("__GARAGE.setMode('drive')")
        await camera([250,1300,-470],[620,1000,0]);await click('screenCentre',2)
        report['driveInterlock']=await pg.evaluate('__GARAGE.state.doorL===0')
        if not report['driveInterlock']:errors.append('Door screen control opened in Drive')
        await pg.evaluate("__GARAGE.setMode('garage')")
        (OUT/'controls.json').write_text(json.dumps(dict(report,errors=errors),indent=2),encoding='utf-8')
        if errors:raise RuntimeError('Screen interaction failed: '+str(errors))
        print('MX05 screen controls PASS; starting 110-pose sweep',flush=True)
        # Window travel + cargo retraction, including intermediate exposed panes,
        # with panels shut, partially open and fully open, both wheel sets.
        report['sweep']=await pg.evaluate('''async()=>{const G=__GARAGE,out=[];
          for(const size of [20,22]){G.cfg.wheel=Object.assign({},byId('wheel','modelx-'+size));G.refresh(true);
            for(const f of [0,.25,.5,.75,1])for(let i=0;i<=10;i++){
              for(const k of ['doorL','doorR','rdoorL','rdoorR','hood','trunk'])G.state[k]=G.anim[k]=f;
              for(const k of ['win','cover'])G.state[k]=G.anim[k]=i/10;G.update(0);
              const ps=__QA.collect(),collisions=__QA.collisions(ps),attachmentChecked=[0,1].includes(f)&&[0,10].includes(i),loose=attachmentChecked?__QA.pieces(ps):[];
              out.push({size,opening:f,window:i/10,collisions,loose,attachmentChecked,windows:G.build.mxCabin.windows.map(a=>{const m=a.find(m=>m&&m.visible);return m?m.geometry.userData.src.list().length:0;})});
              if(i===10)console.log('MX05 '+size+' inch opening '+f+': 11 window/cover poses checked');
              await new Promise(r=>setTimeout(r,1));
            }
          }return out;}''')
        for r in report['sweep']:
            if r['collisions'] or r['loose']:errors.append(r)
        await pg.evaluate('''()=>{const G=__GARAGE;for(const k of ['win','cover'])G.state[k]=G.anim[k]=0;
          for(const k of ['doorL','doorR','rdoorL','rdoorR','hood','trunk'])G.state[k]=G.anim[k]=1;G.update(0);}''')
        await camera([-2500,2600,-2800],[-500,850,0]);await image('six-seat-cabin')
        await camera([3300,2400,-1800],[1600,850,0]);await image('front-storage')
        await camera([-3400,2100,1100],[-2000,700,0]);await image('cargo-covered')
        await pg.evaluate('__GARAGE.state.cover=1');await tick();await image('cargo-retracted')
        # Repeated unload/reload must leave a single responder (double listeners
        # would toggle back off) and no stale screen/texture attached to other cars.
        for _ in range(2):
            await pg.evaluate("__GARAGE.switchCar('e30')")
            await pg.wait_for_function("__bootDone&&__GARAGE.CARID==='e30'",timeout=300000)
            if await pg.evaluate("!!__GARAGE.P.screenCentre"):errors.append('Cabin leaked into E30')
            await pg.evaluate("__GARAGE.switchCar('modelx')")
            await pg.wait_for_function("__bootDone&&__GARAGE.CARID==='modelx'",timeout=300000)
            await pg.evaluate("__GARAGE.setMode('garage')")
            await camera([250,1300,-470],[620,1000,0]);await click('screenCentre',0)
            if await pg.evaluate('__GARAGE.state.win')!=1:errors.append('Reload screen responder failed')
        report['reloads']=2
    finally:
        await b.close();await p.stop()
    report.update(seconds=round(time.perf_counter()-started,2),errors=errors,pass_=not errors)
    (OUT/'result.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    print(('PASS' if not errors else 'FAIL'),report['seconds'],'seconds;',len(report.get('sweep',[])),'poses;',len(errors),'errors')
    if errors:print(json.dumps(errors[:8],indent=2));sys.exit(1)

asyncio.run(main())
