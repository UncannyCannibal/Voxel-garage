# Adding a car to Voxel Garage (for Muse, the local agent or Claude)

This is the recipe for a new car (the AE86, the DC2, the EK9, the EP3, and any after them). It goes with `ADDING_PARTS.md` (parts) and
`MUSE_AE86_REVIEW.md` (what went wrong on the first AE86 draft). Follow the steps in order. **A step is done only when its check passes and the
check output is pasted with the hand-off.** "Written", "added" or "fixed" without the check output does not count.

## 1. Rules

1. **Never edit an existing car or the published page.** A new car is new files: `car_<id>.js`, its `SHELLS.<id>` entry, its parts, its
   mounts. Save every step as a new versioned page (`Voxel_Garage-<n>-<CAR>-step<k>.html`). Never overwrite a file the owner or Claude made.
2. **Shared code is shared.** If you change a shared function (`mkGlass`, `fit.js`, `rig_gen*.js`, `parts_lib.js`), every other car must still
   pass its Full check afterwards (e30, e30t, ef, z32). Paste those four results too. Prefer an optional argument that defaults to the old behaviour,
   as you did with `mkGlass`.
3. **Every number has a label and a source.** VERIFIED (a published spec: name it), MEASURED (taken from a drawing or photo: say which),
   CALCULATED (from verified numbers), DESIGN (chosen to look and fit right), ESTIMATED. Put the label in a comment next to the number.
4. **Never copy another car's numbers or layout without saying so.** The AE86 is a live-axle car; the E30 and Z32 are not. The Civic is FF;
   the AE86 is FR. Copying a layout gave the first AE86 rear knuckles on a live axle and calipers inside 13-inch rims.
5. **Proof of change.** For every change you claim, give: the new file name; the check line for that item before and after (for example
   `FAIL doorL fully open ... 150 cells` then `PASS doorL fully open`); and the source of any new number. A bigger file is not proof.
   A new car is proven by its card in the car picker and its own check report, not by code in the file.
6. **Small steps.** One step below at a time, a check after each, a save after each.

## 2. The two checks

**In the page (anyone, no tools needed).** View tab, *Check this build*:

- **Quick check** (about 30–45 s on a laptop): the car parked, everything shut. Collisions between every pair of parts, and every separate piece
  of every part must reach the body through parts it touches.
- **Full check** (a little longer): also the doors, hood, hatch and cargo cover at half and full swing with the windows down; each doorway and the
  hatch opening with the panel fully open (nothing may be left where the closed panel was); full steering lock both ways; body roll and pitch at
  the car's limits; full lock with full roll.

The report is plain text, already selected: copy it and paste it. It checks the build that is on screen, so pick the preset or parts first.
`QA PASS` on the last line means every check passed.

**With the Node tools (authoritative, includes every part of every slot).** From `t/`, after `python3 build_garage.py` in `gar/`:

```
node scene_audit.js <id> rest       # the same as the Quick check, plus ground clearance
node scene_audit.js <id> states     # the same as the Full check, for every preset
node scene_audit.js <id> library    # every part in every slot, wheel and camber sweeps, swaps, removals (slow)
node seat_check.js <id>             # aero and body parts sit on their panels (gap per 10 mm column)
```

"Done" for a car means: `SCENE AUDIT (<id>, states): PASS`, `library` passing, and `seat_check` passing. Paste the last 20 lines of each.

## 3. What a car is

| Piece | Where | What it holds |
|---|---|---|
| `SHELLS.<id>` | `shells.js` | The facts: name, mass and weight split, wheelbase, track, hub face, arch sizes, stock wheel and tyre, drive layout (`FR`, `FF`...), `hcg`, stock config, `refuse` (parts the car turns down, with the reason), `notBuilt` (slots not drawn yet). |
| `CAR_MODULES.<id>=function(G){...}` | `car_<id>.js` | Builds the meshes into `body` (moves with the body) and `carRoot` (wheels), and returns the car's interface (below). |
| Parts | `parts_*.js` | Car-specific parts pushed into `LIB` with `shells:['<id>']`. Universal parts need no change. |
| Mounts | `t/scene_mounts.js` | `<id>:[[partA regex, partB regex, most cells, why], ...]`, and `joins:{<id>:[[partA regex, partB regex], ...]}` for a link through a part the page does not draw (no car needs one today). Only real joints where one part is fastened into another (a bolt through a bush, a hose on its pipe). Keep the limits tight and write the reason. The build copies this file into the page as `QA_MOUNTS`, so the in-page check uses the same list. |
| Build | `build_garage.py` | Add `car_<id>.js` to `mods` (or pass it as an argument while testing: `python3 build_garage.py out/test.html car_<id>.js`). |

The interface `CAR_MODULES.<id>` returns (copy the shape from `car_z32.js`, not its numbers):
`id, title, maxSteer, bodyLimits(cfg) -> {roll, pitch, rollLock}, paints, stages, pre, post, presets, apply:{wheels, engine, seats, steering,
exhaust, aero, suspension, ...}, sigs, cockpit, camPresets, camOpens, trunkLabel, coverLabel, sound:{cyl}, onLoaded`.

**Part names matter.** The checks find parts by name, and the Full check moves them by name. Use the same names as the other cars:

| Name | Part |
|---|---|
| `bodyMesh` | the body shell (everything else must connect to it) |
| `doorL`, `doorR`, `rdoorL`, `rdoorR`, `hood`, `trunk` | opening panels; door glass `dglassL/R`, rear `rglassL/R` |
| `tyreFL`, `rimFL`, `rotorFL`, `caliperFL`, `knuckleFL` | wheel corners (FL, FR, RL, RR); a live axle has no rear knuckles |
| `link<corner>.<piece>` | suspension and steering links, for example `linkFL.lowF`, `linkRL.spring`, `linkDSF.m` (driveshaft), `linkSL.rod` (hatch strut) |
| `rack`, `swheel` or `swm` | steering rack, steering wheel |
| `engMesh`, `gbMesh`, `accMesh`, `hoses`, `mounts`, `exh`, `under` | engine, gearbox, accessories, hoses, engine mounts, exhaust, underbody |
| `interior`, `dashDetail`, `seatMeshes`, `plateF`, `plateR` | cabin, dash details, seats, number plates |

## 4. Order of work: the parts first, then the body around them

Every failure on the first AE86 had one cause: the body was drawn first and the parts were put inside it. Build in this order instead.

1. **Measurement sheet.** Wheelbase, track front and rear, length, width, height, overhangs, ground clearance, hub height, stock tyre and wheel
   (size, offset, bolt pattern), weight and split, engine and gearbox position and length, driveshaft, axle type, steering rack position, seat
   hip point, glass lines. Each number labelled with its source. Nothing gets drawn until this sheet exists.
2. **Wheels and suspension of this car.** Tyres, rims, hubs, rotors and calipers (measure the caliper's outer radius against the stock rim's
   inner barrel), then the car's own suspension geometry. Check: Full check, steering lock and roll lines pass.
3. **Driveline.** Engine, gearbox, driveshaft, axle or half-shafts, exhaust, steering rack, from the car's own numbers. Check: no two of them
   share space (Quick check).
4. **Body around them.** Tunnel, strut towers, rear tubs, floor humps over the axle's full travel, firewall, bay. Leave real clearance (for
   example the gearbox plus 15 mm). Check: Quick check passes with nothing inside `bodyMesh`.
5. **Openings.** Each door, the hood and the hatch is drawn **and cut out of the body**, with shut gaps (3–5 mm on most cars of this era; measure
   yours). Check: Full check, the swing lines and the `fully open` lines pass.
6. **Cabin around the tunnel.** Console cut around the tunnel, dash, seats, column, steering wheel on the column, gauges in the binnacle, pedals.
   Check: Quick check, no floating pieces.
7. **Outside details with mounts.** Lamps, plates on the bumpers, door mirrors (run the arm to the housing's centre, `z < cz`, not to its edge),
   badges, wipers resting on the glass. Check: Quick check, no floating pieces.
8. **Parts and presets.** Aero, flares, skirts, wings, seats, wheels, swaps; three or more presets. Check: Full check on every preset, then the
   Node `library` run and `seat_check`.
9. **Hand-off.** The final reports for stock and every preset, and a list of which numbers are VERIFIED and which are DESIGN or ESTIMATED.

## 5. Reading a report and fixing what it finds

Positions are in millimetres: x forward from the middle of the wheelbase, y up from the ground, z to the car's right. One cell is 10 mm.

| Report line | What it means | Fix |
|---|---|---|
| `bodyMesh / gbMesh: 1618 cells at ...` | A part is inside the body. | Cut the body around the part (tunnel, tower, tub, floor), with clearance. Do not move the part unless its position is wrong. |
| `gbMesh / rack: 206 cells` | Two parts share one space. | One of them is in the wrong place. Find which from references and label the corrected number. |
| `... (mount allows 40)` | A declared joint has grown past its limit. | The joint is wrong now. Do not raise the limit unless the real joint is bigger, and then write why. |
| `swm piece of 1960 points at ...` (floating) | That piece touches nothing that reaches the body. | Give it a mount: run the bracket, arm or column into the part behind it. |
| `doorL fully open: ... bodyMesh 150 cells` | Body skin is left in the doorway. | Carve the body along the door's outline. |
| `strip across the opening at y 890 mm` | A strip of body is left across the hatch opening. | Carve it. |
| `full right steering lock: bodyMesh / tyreFR` | The tyre hits the body at full lock. | Check the arch and the car's real lock angle (`maxSteer`). |

## 6. What the checks do not cover

The checks prove fit, not looks or numbers. They do not tell you that the car looks like the car, that a dimension is right, or that the
physics values are real. Compare renders against reference photos from several angles, and keep the labels honest. Claude reviews looks,
sources and physics, and runs the full library sweep before a car goes into the published page.
