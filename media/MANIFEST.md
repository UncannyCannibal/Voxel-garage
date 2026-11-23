# media/: README stills and GIF, rendered from the game

Everything in this folder is a render of the game itself, made from the launch cars on main. It never holds reference photos.
`tools/export_public.py` copies a file from here only if it is listed below, with the command that rendered it.

The renders come from the probe server (`t/probe/srv.py`, 1600 × 1000, software GL) using `t/probe/media.sh` (the stills) and `t/probe/gif.sh` (the GIF's frames), Nov 14, from main at `b4747e5` (after #51 to #53: the sealed Model X, smooth paint, window-rubber lines). The camera values are azimuth / elevation / distance as in `t/probe/q.py shot`.

- `hero_modelx_falcon.png`: Model X Plaid, falcon wings and front doors open, low front three-quarter. render command: `q.py shot {"az":0.62,"el":0.06,"dist":215,"ty":48,"ox":30} (doors rdoorL/R, doorL/R = 1)`
- `eclipse_rear.png`: Eclipse GSX, rear three-quarter. render command: `q.py shot {"az":-2.25,"el":0.07,"dist":180,"ty":30,"ox":-60}`
- `modelx_cockpit.png`: Model X driver's view (yoke and screens). render command: `q.py shot {} (state.view = 'cockpit')`
- `highway_traffic.png`: Eclipse on the highway, Busy traffic, chase camera. render command: `q.py shot {} (setWorld('highway'), density .5, Drive, 28 m/s, view 'chase')`
- `fleet.png`: the seven launch cars, front three-quarter, one tile each (composited with PIL: 640 × 400 tiles, four over three). render command: `q.py shot {"az":0.7,"el":0.07,"dist":175,"ty":32,"ox":30} per car (Model X dist 205, ty 40)`
- `falcon_wings.gif`: the Model X's falcon wings opening and closing while the camera swings round the front quarter. render command: `gif.sh: q.py shot {"az":0.35..0.95,"el":0.08,"dist":230,"ty":50,"ox":20} per frame, doors 0 -> 1 -> 0`
