"""True-scale orthographic views of a dump.js file: python ortho.py dump.json outprefix [px_per_mm]  ->  outprefix_side_r.png, _side_l, _front, _rear, _top"""
import json, sys, numpy as np
from PIL import Image, ImageDraw
d = json.load(open(sys.argv[1])); a = np.array(d['v'], dtype=np.float64).reshape(-1, 6)
pre = sys.argv[2]; S = float(sys.argv[3]) if len(sys.argv) > 3 else 0.25
P = a[:, :3]; col = a[:, 3].astype(np.int64); sz = a[:, 5]
C = np.stack([(col >> 16) & 255, (col >> 8) & 255, col & 255], 1).astype(np.float64)
def view(name, u, v, depth, flipu=False, grid=True, shade_axis=None):
    # u right, v up, depth: larger = closer to the viewer
    uu = -u if flipu else u
    umin, umax, vmin, vmax = uu.min()-100, uu.max()+100, -50, v.max()+100
    W = int((umax-umin)*S)+1; H = int((vmax-vmin)*S)+1
    img = np.zeros((H, W, 3)); img[:] = (225, 228, 232); zb = np.full((H, W), -np.inf)
    px = ((uu-umin)*S).astype(int); py = ((vmax-v)*S).astype(int); r = np.maximum(1, np.ceil(sz*S)+1).astype(int)
    order = np.argsort(depth)
    # darken by depth slightly so overlapping surfaces read
    dn = (depth-depth.min())/(np.ptp(depth)+1e-9); shade = .70+.30*dn
    for k in range(1, r.max()+1):
        m = order[r[order] >= k]
        for dx in range(k):
            for dy in range(k):
                x = px[m]+dx-k//2; y = py[m]+dy-k//2; ok = (x >= 0)&(x < W)&(y >= 0)&(y < H)
                mm = m[ok]; x = x[ok]; y = y[ok]; better = depth[mm] >= zb[y, x]
                zb[y[better], x[better]] = depth[mm][better]; img[y[better], x[better]] = C[mm][better]*shade[mm][better, None]
    im = Image.fromarray(img.clip(0, 255).astype(np.uint8)); dr = ImageDraw.Draw(im)
    if grid:   # 100 mm ticks along the ground, labelled every 500
        for t in range(int(np.floor(umin/100))*100, int(umax)+1, 100):
            X = int((t-umin)*S); dr.line([X, H-1, X, H-(12 if t % 500 == 0 else 5)], fill=(0, 0, 0))
        for t in range(0, int(vmax)+1, 100):
            Y = int((vmax-t)*S); dr.line([0, Y, 12 if t % 500 == 0 else 5, Y], fill=(0, 0, 0))
    im.save(f'{pre}_{name}.png'); return im, (umin, vmax)
x, y, z = P[:, 0], P[:, 1], P[:, 2]
info = {}
_, info['side_r'] = view('side_r', x, y, z)      # from +z (right side): front (+x) on the right? camera at +z looking -z: right of image = -x... keep nose on the right
_, info['side_l'] = view('side_l', -x, y, -z)
_, info['front'] = view('front', -z, y, x)                 # from +x looking back: image right = car's left (-z)? camera at +x facing -x: right hand = +z... 
_, info['rear'] = view('rear', z, y, -x)
_, info['top'] = view('top', x, -z, y)
json.dump(info, open(f'{pre}_info.json', 'w'))
print('bbox mm x', x.min(), x.max(), 'y', y.min(), y.max(), 'z', z.min(), z.max())
