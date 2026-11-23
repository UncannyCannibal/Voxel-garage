# Adding parts to Voxel Garage (for Muse, the local agent or Claude)

This is the recipe for adding mods: steering wheels, seats, aero and body kits, rims, exhausts and (not yet) intakes. Every part goes in the same way and passes the same checks. A part is
done only when its checks pass and its render looks right. "Written" does not mean done.

## Ground rules

- Edit the sources in `gar/`, never `gar/out/garage.html` (that is built). Build with `cd gar && python3 build_garage.py`.
- Units: one world unit = 20 mm. x points forward, y up, z to the car's right. The body and most parts are drawn on a 10 mm grid: cell index = world x 2,
  drawn at scale .5. The car's origin is between the axles at ground level.
- Honesty labels on every number: VERIFIED (from a source, cite it), CALCULATED (from verified numbers), DESIGN (chosen to look and fit right), ESTIMATED.
  Put the label in the catalogue entry's `label` field and in a comment next to the number.
- Real-brand parts are named "X-style" (for example "MOMO Prototipo-style") and use no logos. All brand text lives in `parts_lib.js`, so it can be renamed in one place.
- Do not change the E30 coupe's body when you work on `e30_core.js`. Check it cell by cell against a saved copy (`cmp_coupe.js` in the scratchpad does this).
- Never run `pkill -f <pattern>` with a pattern that matches your own command line, because it kills your own shell.

## Where things live

| File | What it holds |
|---|---|
| `parts_lib.js` | The catalogue `LIB`: every part's id, name, mass, label and look. Universal parts go here. |
| `parts_honda.js`, `parts_nissan.js`, `parts_jdm.js` | Car-family parts pushed into `LIB` (`shells:[...]` limits them to some cars). |
| `shells.js` | Each car's facts (mass, wheelbase, arch sizes, stock config) and `refuse` (parts a car turns down, with the reason shown in the shop). |
| `fit.js` | The fitment rules: what a car accepts or refuses, and the warnings. |
| `car_e30.js` (coupe and Touring), `car_ef.js`, `car_z32.js` | Each car's drawing code: `setSeats`, `setSteering`, `setWheels`, `setExhaust`, and `ADDON` for aero and frames. |
| `rig_gen.js` | The generic cabin: `RG.seat(look, z)` builds any seat from a look. |
| `rig_gen_ext.js` | Generic builders: `genSteeringWheel(dia, look)`, `genSkirts`, `genFlares`, `genExhaust`, door cards, links. |
| `e30_shop_parts.js` | E30 aero (lips, M-Technik, trunk spoilers, roof spoiler), the roll cages, tyres and rims (`buildTireP`, `buildRimP`, `ringPatternP`). |

## How to add each kind

**Steering wheel (all cars).** Add an entry to `LIB.steering`:

```js
{id:'prototipo',name:'MOMO Prototipo-style 350 mm',dia:350,mass:1.0,label:'D',look:{rim:0x161719,spoke:0xb9bdc3,hub:0x111214,badge:0xd8d8d8,stitch:0xe8e8e8,rimW:2.8}}
```

The look keys are `rim, spoke, hub, badge, stitch, rimW` (rim thickness in 10 mm cells) and `spokes` (spoke angles in radians). Every car draws it with
`genSteeringWheel`. A new shape (holes in the spokes, a flat bottom) is a new look key handled inside `genSteeringWheel`, not a copy of the function.

**Seat (all cars).** Add an entry to `LIB.seats` with `look:{base, cush, bol, bolH}`. `base` is a proven shape (`stock`, `sport`, `recliner` or `bucket`);
the look only changes colours and bolster height. A new shape (a new head restraint, a halo bucket) needs a new option in `RG.seat`. Then run the scene
audit on every car, because the seat has to clear each cabin's glass and pillars (the Z32's roof is lower: it keeps its own back height).

**Aero and body kits (per body).** Do three things:
1. Add the catalogue entry to `aeroF`, `aeroR`, `skirts` or `flares`. Give it `bodyOnly:'notch'` for trunk-lid parts or `'hatch'` for hatch and tailgate parts,
   `shells:[...]` if it fits only some cars, and `lip` or `skirt` in mm (the ride-height warnings use them).
2. Write a builder that returns a 10 mm Grid seated on the panel it bolts to. Read the panel's own cells to find where its surface is; never place cells at guessed
   coordinates. Copy `buildMTechFrontE30` or `buildRoofSpoilerE30T`.
3. Register it in each car module's `ADDON`: `{hi:1, fn:()=>[grid], p:'trunk'}` (use `p` only if it rides on the lid). Use `extra:'otherId'` to show a second
   part with it, and `onBumperR:1` to hide it when the rear bumper is removed.

A body kit set (several parts at once) is an `aerokit` entry: `{id, name, set:{aeroF, skirts, aeroR}}`.

**Rims.** Add a style to `LIB.wheel` and a branch for it in `ringPatternP` (`e30_shop_parts.js`). Diameter, width and offset are free inputs; the fitment rules check them.

**Exhaust.** Add an entry to `LIB.exhaust` with its tip type. Tip shapes live in `genExhaustTips` (`rig_gen_ext.js`). Each car routes its own pipe.

**Intakes (not supported yet).** This needs a new slot in `SLOTS` and `fit.js`, a builder that sits on each engine's throttle body (`E.pts.tb` in each car's
`setEngine`), and a route to the bumper or fender that clears the bay. Design that slot once for all cars before adding any intake.

## Checks every part must pass (run from `t/`)

1. `node scene_audit.js <car> rest` with `CFG='{"<slot>":"<id>"}'`: 0 colliding pairs, and every part attached.
2. `node seat_check.js <car>`: aero parts sit on their panels with no gap.
3. `node scene_audit.js <car> states`: doors, hood and tailgate swing clear; steering lock and body roll are clean.
4. Renders: `CAR=<car> python3 ../shots/shot_garage.py views.json outdir 1280 800` from the owner's angles (front 3/4, rear 3/4, side, a close-up of the
   part). Look at them: no floating pieces, no holes, no parts sunk into the body.
5. Run 1 to 4 on every car the part is offered on: `e30`, `e30t`, `ef`, `z32`.
