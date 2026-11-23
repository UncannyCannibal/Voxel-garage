"""SOUND-01 QA driver. Needs the probe server running (t/probe/srv.py) on VG_PORT.
    python t/sound/run.py <outdir> <car> [<car> ...] [--script=pull|holds] [--no-old] [--view=cockpit] [--engine=<id>]
For each car: switches to it, runs t/sound/render.js, writes <car>_<script>_new.wav (and _old.wav), a spectrogram PNG of each, and
prints the stats. With --script=holds it also measures, at each held rpm, the strongest tone and where it sits in engine orders
(order = Hz / (rpm/60)): an inline-4 should show order 2, an inline-6 or V6 order 3, a V8 order 4."""
import sys, os, json, base64, subprocess, wave
import numpy as np
from scipy import signal
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
HERE = os.path.dirname(os.path.abspath(__file__)); Q = os.path.join(HERE, '..', 'probe', 'q.py')
args = [a for a in sys.argv[1:] if not a.startswith('--')]; flags = [a for a in sys.argv[1:] if a.startswith('--')]
out = args[0]; cars = args[1:]; eng = next((f[9:] for f in flags if f.startswith('--engine=')), None); view = next((f[7:] for f in flags if f.startswith('--view=')), None); script = next((f[9:] for f in flags if f.startswith('--script=')), 'pull'); old = '--no-old' not in flags
os.makedirs(out, exist_ok=True)
def q(*a):
    r = subprocess.run([sys.executable, Q] + list(a), capture_output=True, text=True)
    if r.returncode: raise SystemExit(r.stdout[-3000:] + r.stderr[-3000:])
    return r.stdout.strip()
def wav(path, b64):
    pcm = base64.b64decode(b64)
    with wave.open(path, 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(48000); w.writeframes(pcm)
    return np.frombuffer(pcm, dtype='<i2').astype(np.float32) / 32767
for car in cars:
    q('eval', "async(c)=>{const G=window.__GARAGE;if(G.CARID!==c){G.switchCar(c);const w=ms=>new Promise(r=>setTimeout(r,ms));for(let i=0;i<600&&!(window.__bootDone&&G.CARID===c);i++)await w(500);}return G.CARID;}", json.dumps(car))
    res = json.loads(q('evalf', os.path.join(HERE, 'render.js'), json.dumps({'script': script, 'old': old, 'engine': eng, 'view': view})))
    print(car, res['engine'], res['turbo'], res['exhaust'], json.dumps(res['prof']), 'secs', round(res['secs'], 1), 'stats', json.dumps(res['stats']), flush=True)
    for k, b in res['wav'].items():
        base = os.path.join(out, '%s_%s_%s' % (car + ('-' + eng if eng else '') + ('-' + view if view else ''), script, k)); x = wav(base + '.wav', b)
        f, t, Z = signal.spectrogram(x, 48000, nperseg=4096, noverlap=3584)
        plt.figure(figsize=(12, 4.5)); plt.pcolormesh(t, f, 10 * np.log10(Z + 1e-12), shading='auto', vmin=-110, vmax=-30); plt.ylim(0, 3000)
        plt.title('%s %s (%s)' % (car, script, k)); plt.xlabel('s'); plt.ylabel('Hz'); plt.colorbar(); plt.tight_layout(); plt.savefig(base + '.png', dpi=80); plt.close()
        if script == 'holds' and k == 'new':
            held = [1500, 3000, 4500, None, 3000]; rows = []
            for i, rpm in enumerate(held):
                if rpm is None: rpm = min(6000, res['prof']['red'] - 300) if res['prof'].get('red') else 6000
                seg = x[int((0.05 + i * 1.5 + 0.5) * 48000):int((0.05 + i * 1.5 + 1.4) * 48000)]
                fr, P = signal.welch(seg, 48000, nperseg=16384); band = (fr > 15) & (fr < 1500)
                fo = rpm / 60; pk = fr[band][np.argmax(P[band])]
                # strength of each half-order up to 8, in dB relative to the strongest
                ords = {}
                for o2 in range(1, 17):
                    fz = fo * o2 / 2; m = (fr > fz * 0.97) & (fr < fz * 1.03)
                    ords[o2 / 2] = 10 * np.log10(P[m].max() + 1e-20) if m.any() else -200
                top = max(ords.values()); rows.append((rpm, 'on' if i < 4 else 'off', round(pk, 1), round(pk / fo, 2), {k2: round(v - top, 1) for k2, v in ords.items() if v - top > -20}))
            for r in rows: print('   hold %5d rpm %-3s strongest %7.1f Hz = order %.2f | orders within 20 dB: %s' % r, flush=True)
    print('   trace rpm', res['trace']['rpm'][::4], flush=True)
