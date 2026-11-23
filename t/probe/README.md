# Probes: measuring a car fast

`check.py` says **whether** a car passes; `t/where.py` and these tools say **where** and **why**. They keep one page open (`srv.py`), so each question takes seconds instead of a one-to-two-minute page boot.

Setup, once: `pip install playwright`, `python -m playwright install chromium`, `npm install` inside `t/`.
On a machine without a GPU (a cloud session) set `CHECK_SOFTWARE_GL=1`.

```
python t/probe/srv.py ae86          leave running (127.0.0.1:8765; VG_PORT changes the port)
python t/probe/q.py reload          after editing source: rebuild the page and reboot it (about 30 s)
```

Coordinates everywhere: millimetres in the body frame. x forward (0 = mid-wheelbase), y up from the ground, z to the car's right. A station "from the nose" is the car's nose x minus x.

## In-page probes (`q.py evalf <file> '<json arg>'`)

| File | Arg | What it returns |
|---|---|---|
| `fullqa.js` | `true` (full) or `false` (quick) | presses the page's own Check button and returns the report, every line (`QA_MAX` off). Same check as `check.py`. |
| `check1.js` | `{"steer":1,"roll":0.035,"pitch":0.025,"re":"^(tyre\|link)"}` | the collision lines in one state, for the parts matching `re` (default: wheels, links, exhaust, underbody, rack). `{"re":"."}` = everything, parked. |
| `pair.js` | `{"A":"knuckleFR","B":"linkFR.spring","steer":1}` | where two parts overlap in a state, in 20 mm clusters, plus both parts' extents |
| `parts.js` | `"tyreFR\|rimFR\|under"` (a regex string) | extents of the parts whose names match |
| `map.js` | `{"y":540,"names":["tyreRR","bodyMesh"],"ch":["T","b"],"x0":-1400,"x1":-1000,"dx":10,"z0":540,"z1":700,"dz":10,"pitch":0.025}` | what fills the car at one height: rows x, columns z |
| `col.js` | `{"zs":[360,400],"x0":1100,"x1":1880,"dx":60,"y0":200,"y1":900,"names":["bodyMesh","bay"]}` | the first structure above a point, along x: where a post or bracket can bolt on |
| `env.js` | `{"re":"tyreFR\|rimFR","states":[{"steer":1},{"steer":-1}],"sd":1,"bin":20}` | the inward-most \|z\| a part reaches over several states, per (x, y) bin: a tyre's swept envelope at full lock or travel. Pipe through `python t/probe/envshow.py x0 x1 ymax` for a table. |
| `dump.js` | none | every visible voxel (body frame, colour, part) as JSON, for `ortho.py` |

## Drawings and photos (plain Python)

| File | Use |
|---|---|
| `ortho.py dump.json out 0.4` | true-scale orthographic side (both), front, rear and top views from a `dump.js` file (0.4 px per mm), 100 mm ticks on the edges: compare with `ref/<car>/dims.md` and drawings |
| `crop.py photo.jpg x0 y0 x1 y1 out.png [scale] [step]` | a zoomed crop of a reference photo with a labelled pixel grid, for reading feature positions |
| `camfit.py pts.json photo.jpg cam.json` | fits a camera (focal length and pose) to a photo from known 3D points (wheel hubs, contact patches, door corners) and prints each point's error |
| `bp.py cam.json '[[name,u,v,z],...]'` | with a fitted camera, turns photo pixels into station and height on the plane at that z. Fit two photos from opposite ends and average: their errors run in opposite directions. |

The camera fit is good to roughly ±50–100 mm on 3/4 photos. It's for finding big errors (a whole windshield 250 mm too far back), not for final numbers; a dimensioned drawing beats it.
