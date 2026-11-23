/* ===== EF rig parameters (world units, 20 mm; x forward, y up, z = car's right; x = 0 is the middle of the wheelbase).
   The car is the JDM EF9 SiR: right-hand drive (cp.side +1). Cabin numbers from the catalogue (interior length 1830 mm, width 1360) and the Honda drawing's top view
   (front seats 510 mm wide either side of the centre, front seat backs at about 1960 mm from the bumper tip, rear seat near 2780 mm). DESIGN where nothing shows them.
   Suspension hardpoints (double wishbones front and rear) are DESIGN, placed inside the body's wheelhouses and damper towers (ef_body.js) and checked by ef_collision.js. ===== */
const EF_RIG={
  cp:{side:1,H:{x:10,y:25.5,z:18.5},back:24,rearH:{x:-37,y:25},rearBack:22,wheel:{x:26,y:42,z:18.5,n:[-.9,.436,0]},pedalX:38,pedalY:31.5,pedalLen:330,pedals:[['clutch',12.5,75,65],['brake',18.5,75,65],['gas',24,50,110]],shifter:{x:22,y:28},eye:{x:-1.5,y:56.5,z:18.5}},
  dash:{rearX:31,top:42,bot:33,cowlX:47.5,halfZ:33,slope:.12},
  console:{rearX:-6,shiftX0:15,shiftX1:26,top:28,y0:15.5},
  floorY:12.5,rackR:1.3,carpetIn:10,columnGap:3.4,   // column shroud axis starts 68 mm behind the wheel's centre: its 30 mm radius end stays clear of the boss
  floorAt:x=>x>(2040-2250)/20?12.5:16.5,   // carpet on the 230 mm floor pan, and on the 300 mm raised floor under the rear seat (ef_body.js)
  floorHalf:(x,y)=>{const fa=Math.abs(x-62.35)<=20,ra=Math.abs(x+62.5)<=19.5,tw=Math.abs(x+62.5)<=8.5;return fa?20:(tw?22:(ra?27.5:34));},   // inside the front wheelhouse walls (440 mm), the rear tubs (585), the sills
  cargo:{frontX:-58,rearX:-90,floorY:26,half:24,hi:true},   // load floor and side trims 450 mm either side: between the rear damper towers (470); hi: the bay is drawn by efCargo at 10 mm
  bay:{x0:50.5,x1:94.5,top:35.5,radX:89,batX:78,towerTop:40,airZ:1,towers:false,rails:false,
       battery:{x0:80,x1:85,y0:13,y1:20,z0:-12,z1:-20.5},airbox:{x0:72,x1:80,y0:28,y1:34,z0:-20.5,z1:-12.5},boosterZ:17,boosterR:3.8,mcLen:7,fuse:{z0:-20.5,z1:-15}},   // battery front right of the transaxle side, air box above the transaxle (z signs follow airZ)
  crash:{y0:15,y1:21,half:30},   // bumper reinforcements 300-420 mm up, 600 mm across the frame-rail ends
  hoses:{r:.9,intakeR:1.5,tankZ:22.5,shroudX:85.2,turnX:82.7,upY:26.3,loY:16.5},   // radiator hoses 36 mm, intake tube 60 mm (DESIGN); routed inboard of the front wheelhouse walls (420 mm) before x 82.5
  doorCard:{y0:18},                       // door card bottom 360 mm: above the carpet on the raised rear floor (the door's rear part stands over it)
  links:{n:40,arm:2,rod:1.2,fork:1.2,shaft:1.4},
  damper:{n:60,bodyR:2.5,rodR:1,bodyFrac:.5},coil:{n:40,R:4.5,w:.9,turns:6},   // dampers 50 mm body, 20 mm rod; springs 90 mm mean coil diameter, 110 mm outside (DESIGN, EF sizes)   // round links in 10 mm cells: wishbone legs 40 mm, tie rods 24 mm, damper fork legs 24 mm, half-shaft bars 28 mm (DESIGN, typical)
  // powertrain: crank line 3 units (60 mm) ahead of the front axle, 340 mm up (the bellhousing clears the 150 mm ground clearance); DESIGN
  power:{dx:3,crankY:17},
  // exhaust route (DESIGN): header at the firewall side, pipe in the floor tunnel, silencer under the rear floor on the right, tip under the right of the rear bumper (photos)
  exh:{dx:-10,y0:12,pipeY:10.2,zRun:0,catX:36,mufX0:-66,mufX1:-86,mufZ:13,side:1,tipMM:3965,tipY:9.9},
  // underbody (DESIGN): front subframe under the bay only, rear lower-arm brackets, fuel tank under the rear seat to the left of the exhaust channel
  under:{subY:8,railZ:21,railX0:47,railX1:92.5,brkX:61.5,fx1dx:13.5,tank:{x0:-46,x1:-28,y0:7.6,y1:14,half:8,zc:-11},rearBeam:false,rearRails:{x0:-76,x1:-52,z:22},trailBr:[[-42.5,26]]},   // brkX: the lower link's pivot bracket on the rail; railX1: the rails reach the radiator support; tank y1: its top on the rear floor pan (strapped up to it); rear sub-frame (DESIGN, placed on the lower arms' inner pivots); trailBr: trailing-link brackets
  // suspension hardpoints: [dx from the axle, y, |z|]; ball joints follow the wheel (see car_ef.js post()). DESIGN, laid out so nothing crosses:
  //  ball joints [dy from the hub, dz from the knuckle line ZK]: the front upper ball joint stands above the tyre (Honda's tall knuckle), both front joints on the kingpin
  //  front (EF type: lower link + radius rod): lowR = the transverse lower link (pivot on the subframe rail just behind the axle), lowF = the radius rod forward to the front cross-member, meeting the link at rodTo of its length,
  //    so the space behind the axle stays clear for the tyre at full lock; the upper A-arm's legs (pivots 150 mm either side) straddle the damper and spring; the damper fork straddles the half-shaft
  //  rear: the damper stands 140 mm behind the axle, behind the upper arm, on the lower arm's rear leg; the trailing link runs forward to the floor inboard of the sill
  susp:{
    front:{lowF:[13,8.5,23],lowR:[-1,8.25,20.5],rodTo:.6,upF:[9,33,24],upR:[-9,33,24],lbj:[-5.5,0],ubj:[18,0],strutTop:[0,38.5,25],springTopY:30,strutDx:.5,strutLy:-3.5,strutLowDz:5,springLow:.375,forkTop:3,forkDx:3,rack:{dx:-10.85,y:14,half:15}},   // the damper ends 52 mm above the hub line; a fork (two legs 44 mm either side of its axis) straddles the half-shaft down to the lower arm, as on Honda's front double wishbone
    rear:{lowF:[9,8.25,21],lowR:[-12,8.25,23],upF:[4,33,25],upR:[-3,33,25],lbj:[-5.5,0],ubj:[18,0],trail:[20,8,26],trailY:-2.5,strutTop:[-7,40.5,29.5],springTopY:36.5,strutDx:-7,strutLy:-2.5,strutLowDz:5,springLow:.72}
  }
};
if(typeof module!=='undefined')module.exports={EF_RIG};
