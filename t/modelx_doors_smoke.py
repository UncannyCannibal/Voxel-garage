"""Actual Body-tab buttons, animated doors and full UI check on both wheel sets."""
import asyncio,json,sys,time
from pathlib import Path
from where import page

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/sys.argv[1]

async def main():
    OUT.mkdir(parents=True,exist_ok=True)
    p,b,pg=await page('modelx');errors=[];rows=[]
    pg.on('pageerror',lambda e:errors.append(str(e)))
    await pg.set_viewport_size({'width':1280,'height':800})
    await pg.evaluate('window.requestAnimationFrame=()=>0')
    try:
        await pg.locator('#mGarage').click()
        for size in [20,22]:
            await pg.evaluate("size=>{const G=window.__GARAGE;G.cfg.wheel=Object.assign({},byId('wheel','modelx-'+size));G.refresh(true);}",size)
            await pg.locator('#tabs [data-tab="body"]').click()
            await pg.locator('#tDoorL').click()
            independent=await pg.evaluate("()=>{const G=window.__GARAGE;for(let i=0;i<180;i++)G.update(1/60);return {left:G.P.doorL.rotation.y,right:G.P.doorR.rotation.y};}")
            assert independent['left'] < -1 and abs(independent['right'])<1e-8,independent
            await pg.locator('#tDoorL').click()
            await pg.evaluate('()=>{for(let i=0;i<300;i++)window.__GARAGE.update(1/60);}')
            ids=['tDoorL','tDoorR','tRDoor','tHood','tTrunk']
            for id in ids: await pg.locator('#'+id).click()
            opened=await pg.evaluate("""()=>{const G=window.__GARAGE;for(let i=0;i<240;i++)G.update(1/60);
              return {front:[G.P.doorL.rotation.y,G.P.doorR.rotation.y],rear:[G.P.rdoorL.rotation.x,G.P.rdoorR.rotation.x],hood:G.P.hood.rotation.z,trunk:G.P.trunk.rotation.z};}""")
            assert abs(opened['front'][0])>1 and abs(opened['rear'][0])>1.3 and opened['hood']>1 and opened['trunk']<-1.3,opened
            for id in ids: await pg.locator('#'+id).click()
            closed=await pg.evaluate("""()=>{const G=window.__GARAGE;for(let i=0;i<300;i++)G.update(1/60);
              return ['doorL','doorR','rdoorL','rdoorR','hood','trunk'].map(k=>Math.max(...G.P[k].rotation.toArray().slice(0,3).map(Math.abs)));}""")
            assert max(closed)<1e-5,closed
            # Drive after a complete door cycle; door work must not disturb MX-03.
            drive=await pg.evaluate("""()=>{const G=window.__GARAGE;G.setMode('drive');G.keys.w=true;
              for(let i=0;i<180;i++)G.update(1/60);G.keys.w=false;const speed=G.state.v,energy=G.state.batteryKWh;
              for(let i=0;i<60;i++)G.update(1/60);const coast=G.state.v,regenerated=G.state.batteryKWh-energy;
              G.keys.s=true;for(let i=0;i<120;i++)G.update(1/60);G.keys.s=false;const brake=G.state.v;
              G.setMode('garage');return {speed,coast,regenerated,brake};}""")
            assert drive['speed']>drive['coast']>abs(drive['brake']) and drive['regenerated']>0,drive
            started=time.perf_counter()
            await pg.evaluate("document.getElementById('bQA2').click()")
            await pg.wait_for_function("/QA (PASS|FAIL)|QA error/.test(document.getElementById('qaOut').value)",timeout=300000)
            report=await pg.evaluate("document.getElementById('qaOut').value")
            (OUT/f'modelx-{size}-full.txt').write_text(report,encoding='utf-8')
            assert report.endswith('QA PASS'),report
            rows.append({'wheel':size,'independent':independent,'openRadians':opened,'closedMaxRadians':max(closed),'drive':drive,'fullUISeconds':time.perf_counter()-started})
        assert not errors,errors
        (OUT/'smoke.json').write_text(json.dumps({'result':'PASS','wheels':rows,'scriptErrors':errors},indent=2),encoding='utf-8')
        print('PASS: actual opening buttons, independence, animation, closing, EV drive and full UI checks on both wheel sets')
    finally:
        await b.close();await p.stop()

asyncio.run(main())
