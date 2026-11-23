/* ===== E30 rig parameters for the generic builders (rig_gen.js, rig_gen_ext.js): world units (20 mm), x forward, y up, z = the car's right; x = 0 is the middle
   of the wheelbase (front axle x 70.5, rear axle x -58). The 325i coupe is left-hand drive (cp.side -1: the driver at -z).
   Cabin positions are the E30 cockpit (COCKPIT in e30_parts.js, DESIGN from photographs) fitted to the measured body (e30_core.js): the floor pan's top skin is
   at 245 mm (y 12.25), the transmission tunnel's top at 470 mm with the bellhousing hump at 570 mm ahead of x 18, the rear floor kicks up to 460-490 mm behind
   x -46 (over the rear axle), the rear wheel tubs' inner walls stand 480 mm from the centreline (x -77 .. -39), the door apertures run x -13 .. 41.25. ===== */
const E30_RIG={
  cp:{side:-1,H:{x:-6,y:26,z:20.5},back:25,rearH:{x:-41.5,y:24},rearBack:24,
      wheel:{x:14,y:45.5,z:-20.5,n:[-0.906,0.423,0]},
      // hanging pedals on a pivot shaft under the dash: pads 330 mm below the pivot, clutch and brake 70 x 60 mm, throttle 45 x 110 mm (DESIGN, E30 layout: clutch, brake, gas left to right)
      pedalX:33,pedalY:30.5,pedalLen:330,pedals:[['clutch',-26.5,70,60],['brake',-20.5,70,60],['gas',-14.5,45,110]],
      shifter:{x:15,y:29},eye:{x:-17.4,y:55.9,z:-20.5}},
  // dashboard: rear face 27 (the binnacle hood one unit behind it), top 890 mm falling toward the windshield, bottom 660 mm, front edge against the firewall
  dash:{rearX:27,top:44.5,bot:33,cowlX:42.5,halfZ:30.5,slope:.15},   // cowlX: against the firewall's cabin skin (x 43); halfZ: inside the doors' inner skin (655 mm)
  // console on the tunnel: the low rear part with the handbrake between the seats, the shift console, the ramp up to the centre stack; its foot on the tunnel's top
  console:{rearX:-6,shiftX0:6,shiftX1:22,top:29,y0:24},   // the shift console runs forward onto the bellhousing hump (570 mm high ahead of x 18); its ramp meets the centre stack at the dash's bottom
  floorY:12.5,carpetIn:10,columnGap:3.4,rackR:1.3,
  floorAt:x=>12.5,
  // carpet half-width: inside the sills' inner skin, and inside the rear wheel tubs (480 mm) where the cabin floor reaches them
  floorHalf:(x,y)=>x<-38.5?23:halfAt(x,y)-2.5,
  cargo:{frontX:-41.5,rearX:-100,floorY:24,half:28,hi:true},   // the trunk is drawn with the body (e30_core.js): only the cabin carpet comes from here
  doorCard:{y0:16.5},                                           // door card bottom 330 mm, above the sill's inner flange
  // powertrain: the engine's flywheel face on the firewall plane (x 52: 41 units, 820 mm, ahead of it stands the radiator, the fit rule's bay length), crank 350 mm up;
  // the sump ahead of the axle carrier (sumpX0: the fraction of the block where the deep part starts); incline: the block's lean to the right (exhaust side), degrees
  power:{x:52,crankY:17.5,sumpX0:.68,incline:{M20B25:20,M20B27:20,M42B18:30,S14B23:30,M50B25:30,S52B32:30,S54B32:30,'2JZGTE':0,LS3:0},inclineDefault:20},   // M20 20 deg (V); the others E
  // round links (10 mm cells): forged lower arms 40 mm, tie rods 24 mm, semi-trailing arm legs 50 mm, half-shafts 24 mm (DESIGN, typical)
  links:{n:40,arm:2,rod:1.2,trail:2.5},
  damper:{n:60,bodyR:2.5,rodR:1,bodyFrac:.5},rdamper:{n:60,bodyR:2.5,rodR:.9,bodyFrac:.55},   // strut tube 50 mm, rear damper 50 mm (10 mm cells)
  coil:{n:40,R:5.1,w:.9,turns:6},rcoil:{n:40,R:5.6,w:1,turns:4.5},   // front 120 mm outside (within the fit rule's strut clearance), rear 132 mm, short and stiff (10 mm cells; DESIGN)
  // exhaust (DESIGN after the 325i's layout): front pipes from the two manifolds join under the bellhousing's right; the run goes back in the tunnel's right
  // half to the converter, crosses under the driveshaft behind it, passes the rear sub-frame under its arch, steps down under the left half-shaft, silencer
  // across the left of the trunk floor, the tail up through the cut-out in the left of the rear valance (bumper RR.cutZ)
  exh:{x0:44,frontY:8.5,pipeY:13,zRun:5.5,pr:1.25,catX:18,catW:2,catH:2.2,mufH:2.2,lowY:10,dropX:-8,dropLen:12,dropZ:-5.5,via:[[-50,10,-5.5],[-66,10,-8]],tipYLow:10.75,mufX0:-78,mufX1:-96,mufZ:13.5,mufDark:1,side:-1,tipX:-106.75,tipY:12.75,stockTips:1,stockR:2.4}
};
// the E30 body as the generic builders see a shell
function makeE30Shell(){return {NOSE_X,REAR_X,AX_F,AX_R,WR,BELT,ROOF,halfAt,topY,u,wx:wxm,mm:mmx,DOOR_F,DOOR_R};}
if(typeof module!=='undefined')module.exports={E30_RIG,makeE30Shell};
