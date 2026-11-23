"""camfit.py pts.json img -> cam.json. pts: {name:[[x,y,z] body-frame mm (x fwd, y up, z right), [u,v] px]}.
Fits focal (principal point = image centre) + pose by PnP over a focal scan, then refines all 7 with least squares."""
import json, sys, numpy as np, cv2
from scipy.optimize import least_squares
from PIL import Image
P = json.load(open(sys.argv[1])); W, H = Image.open(sys.argv[2]).size
names = list(P); X = np.array([P[n][0] for n in names], float); U = np.array([P[n][1] for n in names], float)
def K(f): return np.array([[f, 0, W/2], [0, f, H/2], [0, 0, 1]], float)
best = None
for f in np.geomspace(W*.5, W*8, 120):
    ok, r, t = cv2.solvePnP(X, U, K(f), None, flags=cv2.SOLVEPNP_SQPNP)
    if not ok: continue
    ok, r, t = cv2.solvePnP(X, U, K(f), None, r, t, True, flags=cv2.SOLVEPNP_ITERATIVE)
    pr, _ = cv2.projectPoints(X, r, t, K(f), None); e = np.sqrt(((pr[:, 0]-U)**2).sum(1)).mean()
    if best is None or e < best[0]: best = (e, f, r, t)
e, f, r, t = best
def res(p):
    pr, _ = cv2.projectPoints(X, p[1:4], p[4:7], K(p[0]), None); return (pr[:, 0]-U).ravel()
s = least_squares(res, np.r_[f, r.ravel(), t.ravel()]); p = s.x
pr, _ = cv2.projectPoints(X, p[1:4], p[4:7], K(p[0]), None)
for n, a, b in zip(names, U, pr[:, 0]): print(f'{n:22s} meas {a}  fit {np.round(b,1)}  err {np.hypot(*(a-b)):.1f}')
R, _ = cv2.Rodrigues(p[1:4]); C = -R.T@p[4:7]
print('focal px', round(p[0]), ' (35mm-equiv', round(p[0]/W*36), 'mm)  camera pos mm', np.round(C), ' mean err', np.abs(res(p)).mean().round(1))
json.dump({'W': W, 'H': H, 'f': p[0], 'rvec': list(p[1:4]), 'tvec': list(p[4:7]), 'C': list(C)}, open(sys.argv[3], 'w'))
