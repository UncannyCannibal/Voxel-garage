"""table of an env.js result: python envshow.py [x0 x1 ymax] < env.json"""
import json, sys
d = json.load(sys.stdin); M = {(r[0], r[1]): r[2] for r in d}
xs = sorted({r[0] for r in d}); ys = sorted({r[1] for r in d}, reverse=True)
x0 = int(sys.argv[1]) if len(sys.argv) > 1 else min(xs); x1 = int(sys.argv[2]) if len(sys.argv) > 2 else max(xs); y1 = int(sys.argv[3]) if len(sys.argv) > 3 else 10**9
xs = [x for x in xs if x0 <= x <= x1]; ys = [y for y in ys if y <= y1]
print('y\\x ' + ' '.join(f'{x:5d}' for x in xs))
for y in ys: print(f'{y:5d} ' + ' '.join(f'{M[(x, y)]:5d}' if (x, y) in M else '    .' for x in xs))
