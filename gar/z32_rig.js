/* ===== Z32 rig parameters for the generic builders (rig_gen.js, rig_gen_ext.js): world units (20 mm), x forward, y up, z = the car's right; x = 0 is the middle
   of the wheelbase (front axle x 61.25, rear axle x -61.25). The JDM Fairlady Z is right-hand drive (cp.side +1: the driver at +z).
   Cabin numbers are DESIGN fitted to the measured body (z32_body.js) and the photographs of the 2-seater's cabin: the floor pan's top skin 210 mm (carpet 230), the
   transmission tunnel 400 mm wide and 420 mm high, the dash top at the belt (820 mm), the seats low and far back (hip point 470 mm up, 2420 mm behind the bumper tip),
   the cargo deck 520 mm up behind the seat backs. Suspension: multi-link front and rear (Nissan's), drawn as an upper and a lower A-arm at each corner with the
   damper and coil on the lower arm; hardpoints DESIGN inside the body's wheelhouses and towers. ===== */
const Z32_RIG={
  cp:{side:1,H:{x:-13.35,y:23.5,z:21.5},back:25,rearH:{x:-46,y:28},rearBack:20,
      wheel:{x:8.15,y:39,z:21.5,n:[-.9,.436,0]},
      // hanging pedals: pads 300 mm under the pivot (clutch, brake, gas left to right; the gas outboard on the right-hand drive car)
      pedalX:25.65,pedalY:29,pedalLen:300,pedals:[['clutch',16,70,60],['brake',21.5,70,60],['gas',26.75,45,110]],
      shifter:{x:2,y:26},eye:{x:-24.3,y:51,z:21.5}},
  dash:{rearX:16,top:41,bot:31,cowlX:35,halfZ:34,slope:.12},
  console:{rearX:-27.4,shiftX0:-9.85,shiftX1:10.5,top:26,y0:22.5},kickY0:25.5,   // on the tunnel's roof (420 mm, its skin to 445)
  floorY:11.5,rackR:1.3,rackHalf:15,carpetIn:12,columnGap:3.4,
  floorAt:x=>11.5,
  floorHalf:(x,y)=>{const fa=Math.abs(x-61.25)<=20,ra=Math.abs(x+61.25)<=20;return fa?24:(ra?28:36);},   // inside the front wheelhouse walls, the rear tubs (600 mm), the sills
  cargo:{frontX:-36.9,rearX:-96.5,floorY:26,half:22.5},   // the side trims 420 mm out: inboard of the rear towers' inner walls (460)   // the deck behind the seat backs (the 2-seater's luggage area), side trims inside the tubs
  bay:{x0:36.5,x1:95,top:31,radX:91,batX:79,towerTop:39,airZ:1,towers:false,rails:false,fwX:36,batTray:{outZ:29},   // fwX: the firewall face; batTray: out to the inner fender (DESIGN)
       battery:{x0:80,x1:86,y0:14,y1:21,z0:14,z1:23},res:{z0:16,z1:18},airbox:{x0:82,x1:88,y0:22,y1:28,z0:14,z1:23,inlet:false},fan:{y:20.5,z:0,r:8.5},boosterZ:17,boosterR:4,mcLen:7,fuse:{z0:-24,z1:-19}},
  crash:{y0:15,y1:21,half:30},
  doorCard:{y0:15},
  links:{n:40,arm:2,rod:1.2,shaft:1.4},
  damper:{n:60,bodyR:2.5,rodR:1,bodyFrac:.5},coil:{n:40,R:4.5,w:.9,turns:6},
  // powertrain: the VG30's flywheel face 1500 mm behind the bumper tip (the engine sits behind the front axle, its bell in the tunnel), crank 320 mm up (DESIGN)
  power:{x:36.4,crankY:15.5,incline:{},inclineDefault:0},   // the flywheel face at the firewall (1425 mm), the bellhousing in the tunnel's hump
  // exhaust (DESIGN after photographs: the two turbines' outlets join under the bellhousing, one pipe back in the tunnel to the converter, a transverse silencer behind
  // the final drive, two pipes each side to the four tips in the rear valance's cut-outs)
  exh:{x0:-3,frontY:7.8,pipeY:7.8,zRun:-7,pr:1.6,catX:-14,catW:3.2,catH:2.2,mufH:2.4,mufX0:-80,mufX1:-96,mufZ:0,side:1,tipX:-103.4,tipY:11.25,tipsZ:[-25,-20.25,20.25,25],tipR:3.4,mufDark:1,
       via:[[-50,7.8,-7],[-72,7.8,-7],[-79,7.8,-3]]},   // the two turbines' pipes run back either side of the gearbox and join behind its tail; the run passes left of the final drive
  // underbody (DESIGN): front sub-frame under the bay, rear sub-frame carrying the arms and the final drive, the saddle tank over the driveshaft under the cargo deck
  under:{subY:7,rearY:10.75,railZ:20,railX0:36,railX1:90,brkX:63,fx1dx:0,rx:-52,tank:{x0:-53,x1:-41,y0:12.5,y1:21.5,half:16,zc:0,saddle:1},rearBeam:false,rearRails:{x0:-72,x1:-50,z:20}},
  // suspension hardpoints: [dx from the axle, y, |z|]; ball joints [dy from the hub, dz from the kingpin line]
  susp:{
    front:{lowF:[12,8,19],lowR:[-1,8,19.5],upF:[6,34,24.5],upR:[-6,34,24.5],lbj:[-5.5,0],ubj:[18,0],strutTop:[0,37.5,26.5],springTopY:31,strutDx:.5,strutLy:-3,strutLowDz:5.3,springLow:.3,rack:{dx:11.25,y:10.5,half:16}},   // the rack ahead of the axle and low (the engine's deep sump behind it, the shallow front of the pan and the crank pulley over it)
    rear:{lowF:[9,10.5,20],lowR:[-11,10.5,22],upF:[4,33.5,27],upR:[-3,33.5,27],lbj:[-5.5,0],ubj:[17.5,0],trail:[-6,12,22],trailY:-2.5,strutTop:[-6.5,38,27.5],springTopY:30.5,strutDx:-6.5,strutLy:-2.5,strutLowDz:4.5,springLow:.6}
  }
};
if(typeof module!=='undefined')module.exports={Z32_RIG};
