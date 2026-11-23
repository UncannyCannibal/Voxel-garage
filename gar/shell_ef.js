/* ===== HONDA CIVIC EF HATCHBACK (1988-1991, 3-door): shell spec. All lengths mm; x from the front tip of the BODY panels rearward (the bumper covers add 45 mm in front and 55 mm behind, so the
   overall 3995 mm is body 3895 + bumpers), y from the ground.
   V = verified against a source, E = estimated from the car's known proportions (no photograph or drawing has been measured yet), D = design choice.
   Verified (Honda EF9 SiR-II catalogue, honda.co.jp): overall length 3995, width 1680, height 1335, wheelbase 2500, track 1440 / 1445, 195/60R14, double-wishbone suspension front and rear.
   The roof / glass / hood profile and every panel line below are E until the car is measured from photographs or a drawing. ===== */
const EF_SPEC={
  id:'ef',L:3895,W:1680,H:1335,WB:2500,axF:690,wheelR:295,rock:180,belt:875,archR:350,
  top:[[0,575],[25,625],[75,655],[965,790],[1795,1318],[1955,1335],[2455,1330],[2675,1315],[3715,935],[3855,930],[3880,915],[3894,880],[3895,850]],
  wsSeg:[3,4],rwSeg:[7,8],
  plan:{noseLen:380,noseDrop:.10,tailLen:330,tailDrop:.065,swell:.004},roofNarrow:.15,noseRc:5,tailRc:4,
  frontPanelBottom:540,frontPanelLen:130,tailPanelBottom:480,tailPanelLen:520,
  door:{front:1085,rear:2185,sill:240},
  hood:{x:965,inset:210,yMin:680},
  rear:{type:'hatch',hingeX:2655,bottomY:640,inset:210,cargo:{x0:2800,x1:3905,floor:430,half:600}},
  glass:{ws:[1045,1785],rw:[2735,3675],rwY:945,quarter:true,dgFront:90},
  bay:{x0:25,x1:965,half:520,floor:150},
  tunnels:[{x0:955,x1:2555,half:150,top:230}],
  cuts:[]
};
if(typeof module!=='undefined')module.exports={EF_SPEC};
