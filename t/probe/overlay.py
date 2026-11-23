"""Project the model onto a reference photo through a fitted camera (camfit.py), for a side-by-side and an overlay.
    python overlay.py dump.json cam.json photo.jpg outprefix
-> outprefix_model.png (the model alone, seen from the photo's camera), outprefix_over.png (photo with the model's outline in red and
   its feature edges in yellow), outprefix_pair.png (photo | model, side by side)."""
import json, sys, numpy as np, cv2
from PIL import Image
d = json.load(open(sys.argv[1])); c = json.load(open(sys.argv[2])); ph = Image.open(sys.argv[3]).convert('RGB'); pre = sys.argv[4]
W, H = ph.size; a = np.array(d['v'], float).reshape(-1, 6)
P = a[:, :3]; col = a[:, 3].astype(np.int64); sz = a[:, 5]
C3 = np.stack([(col >> 16) & 255, (col >> 8) & 255, col & 255], 1).astype(float)
K = np.array([[c['f'], 0, W/2], [0, c['f'], H/2], [0, 0, 1]]); R, _ = cv2.Rodrigues(np.array(c['rvec'])); t = np.array(c['tvec'])
Q = P @ R.T + t; z = Q[:, 2]; ok = z > 100
u = c['f']*Q[:, 0]/z + W/2; v = c['f']*Q[:, 1]/z + H/2
r = np.maximum(1, np.ceil(sz*c['f']/z*.75)).astype(int)
img = np.zeros((H, W, 3)); img[:] = 255; zb = np.full((H, W), np.inf); lab = np.full((H, W), -1)
# simple shading: darker with depth so stacked surfaces separate
dn = (z - z[ok].min())/(np.ptp(z[ok]) + 1e-9); shade = 1.0 - .35*dn
order = np.where(ok)[0][np.argsort(-z[ok])]
for k in range(1, r[order].max()+1):
    m = order[r[order] >= k]
    for dx in range(k):
        for dy in range(k):
            x = np.round(u[m]).astype(int) + dx - k//2; y = np.round(v[m]).astype(int) + dy - k//2
            g = (x >= 0) & (x < W) & (y >= 0) & (y < H); mm = m[g]; x = x[g]; y = y[g]
            better = z[mm] < zb[y, x]; zb[y[better], x[better]] = z[mm][better]
            img[y[better], x[better]] = C3[mm][better]*shade[mm][better, None]; lab[y[better], x[better]] = col[mm][better]
model = Image.fromarray(img.clip(0, 255).astype(np.uint8)); model.save(pre + '_model.png')
mask = np.isfinite(zb).astype(np.uint8)
mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
edge = cv2.morphologyEx(mask, cv2.MORPH_GRADIENT, np.ones((3, 3), np.uint8)) > 0
# feature edges: where the model's colour changes sharply (panel lines, glass, lamps, the panda break)
g = cv2.cvtColor(img.clip(0, 255).astype(np.uint8), cv2.COLOR_RGB2GRAY); fe = cv2.Canny(g, 60, 140) > 0
fe &= cv2.erode(mask, np.ones((5, 5), np.uint8)) > 0
ov = np.array(ph).astype(float); ov[fe] = ov[fe]*.2 + np.array([255, 230, 0])*.8; ov[edge] = [255, 0, 0]
Image.fromarray(ov.astype(np.uint8)).save(pre + '_over.png')
pair = Image.new('RGB', (W*2, H), (255, 255, 255)); pair.paste(ph, (0, 0)); pair.paste(model, (W, 0)); pair.save(pre + '_pair.png')
print('wrote', pre + '_over.png', pre + '_model.png', pre + '_pair.png')
