"""MX-03: authoritative full UI checks on both wheels, plus playable EV controls."""
import asyncio, json, time
from pathlib import Path
from where import page
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'board/done/MX-03-drivetrain/final'
async def main():
    OUT.mkdir(parents=True,exist_ok=True)
    p,b,pg=await page('modelx');errors=[];pg.on('pageerror',lambda e:errors.append(str(e)))
    results=[]
    try:
        for size in [20,22]:
            await pg.evaluate("size=>{const G=window.__GARAGE;G.cfg.wheel=Object.assign({},byId('wheel','modelx-'+size));G.refresh(true);window.QA_MAX=1e9;}",size)
            started=time.perf_counter()
            await pg.evaluate("document.getElementById('bQA2').click()")
            await pg.wait_for_function("/QA (PASS|FAIL)|QA error/.test(document.getElementById('qaOut').value)",timeout=300000)
            report=await pg.evaluate("document.getElementById('qaOut').value")
            seconds=time.perf_counter()-started
            (OUT/f'modelx-{size}-full.txt').write_text(report,encoding='utf-8')
            assert report.endswith('QA PASS'),report
            drive=await pg.evaluate("""()=>{
                const G=window.__GARAGE;G.setMode('drive');
                const before=G.state.batteryKWh;G.keys.w=true;
                for(let i=0;i<180;i++)G.update(1/60);
                G.keys.w=false;const speed=G.state.v,afterDrive=G.state.batteryKWh;
                for(let i=0;i<60;i++)G.update(1/60);
                const coast=G.state.v,afterCoast=G.state.batteryKWh;
                G.keys.s=true;for(let i=0;i<120;i++)G.update(1/60);G.keys.s=false;
                const braked=G.state.v;
                G.setMode('garage');G.setMode('drive');G.keys.w=true;G.keys.a=true;
                for(let i=0;i<120;i++)G.update(1/60);
                G.keys.w=G.keys.a=false;const turn={yaw:G.state.psi,speed:G.state.v,delta:G.state.delta,frontAngles:Object.fromEntries(['FL','FR'].map(n=>[n,G.wheels[n].st.rotation.y]))};
                G.setMode('garage');
                return {before,afterDrive,speed,coast,afterCoast,braked,turn,engineKey:'engine' in G.cfg,gearboxKey:'gearbox' in G.cfg};
            }""")
            results.append({'wheel':size,'fullUISeconds':seconds,'drive':drive})
            assert drive['speed']>1 and drive['coast']<drive['speed'] and drive['braked']<drive['coast'],drive
            assert drive['afterDrive']<drive['before'] and drive['afterCoast']>drive['afterDrive'],drive
            assert abs(drive['turn']['yaw'])>.01 and not drive['engineKey'] and not drive['gearboxKey'],drive
        assert not errors,errors
        (OUT/'smoke.json').write_text(json.dumps({'result':'PASS','wheels':results,'scriptErrors':errors},indent=2),encoding='utf-8')
        print('PASS: both wheel sets full UI QA, acceleration, coast regeneration, braking and steering; no script errors')
    finally:
        await b.close();await p.stop()
asyncio.run(main())
