"""With a fitted camera (camfit.py), turn photo pixels into body-frame positions on a plane.
    python bp.py cam.json '[[name, u, v, "z", -760], [name, u, v, "x", -2195], ...]'
Each row gives the plane: "z" = a side plane (|z| out from the centreline, signed), "x" = a cross plane (body x, mm). Prints the station from the
nose (2010 - x for the AE86: pass --nose 2010 to change), the height and the third coordinate."""
import json, sys, numpy as np, cv2
args = [a for a in sys.argv[1:] if not a.startswith('--')]; nose = 2010.0
for a in sys.argv[1:]:
    if a.startswith('--nose'): nose = float(a.split('=')[1])
c = json.load(open(args[0])); W, H = c['W'], c['H']; K = np.array([[c['f'], 0, W/2], [0, c['f'], H/2], [0, 0, 1]])
R, _ = cv2.Rodrigues(np.array(c['rvec'])); t = np.array(c['tvec']); C = -R.T@t
for row in json.loads(args[1]):
    n, u, v = row[0], row[1], row[2]; ax, val = (row[3], row[4]) if len(row) > 4 else ('z', row[3])
    dvec = R.T@np.linalg.inv(K)@np.array([u, v, 1.]); i = 2 if ax == 'z' else 0; s = (val-C[i])/dvec[i]; Pp = C + s*dvec
    print(f'{n:24s} station {nose-Pp[0]:7.0f}  height {Pp[1]:6.0f}  z {Pp[2]:6.0f}   (plane {ax}={val})')
