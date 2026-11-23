async(opt)=>{opt=opt||{};const G=window.__GARAGE,T=G.THREE,S=G.state,A=G.anim,R=G.renderer,root=G.carRoot,P=G.P,env=G.MOD.envelope;
 // ENVELOPE GAP SCAN (Model X): every opening shut, glass drawn solid. Each pixel's first surface is found (a position pass); from it we step back toward
 // the camera: a surface on the outside of the car leaves the body's envelope within a few mm, a surface seen through a hole is still inside it 35 mm
 // back (whatever it is: seat, carpet, the inside of a panel). Under the floor (below 300 mm) is the underbody and is not counted.
 for(const k of ['doorL','doorR','rdoorL','rdoorR','trunk','hood','frunk']){if(k in S)S[k]=0;if(A&&k in A)A[k]=0;}
 S.mode='garage';S.view='orbit';for(let i=0;i<40;i++)G.update(1/30);
 const rev=new Map();for(const [n,o] of Object.entries(P))if(o&&o.isObject3D)rev.set(o,n);
 const owner=o=>{for(let q=o;q;q=q.parent){if(rev.has(q))return rev.get(q);if(q===root)break;}return 'body?';};
 const posMat=new T.ShaderMaterial({vertexShader:'varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.0);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
   fragmentShader:'varying vec3 vW;void main(){gl_FragColor=vec4(vW,1.0);}',side:T.DoubleSide});
 const saved=[];root.traverse(o=>{if(o.isMesh){saved.push([o,o.material,o.visible]);o.material=posMat;}else if(o.isLine||o.isLineSegments||o.isPoints){saved.push([o,o.material,o.visible]);o.visible=false;}});
 const vis=[];G.scene.children.forEach(c=>{let has=false;c.traverse(q=>{if(q===root)has=true;});vis.push([c,c.visible]);if(!has&&!c.isLight)c.visible=false;});
 const bg=G.scene.background;G.scene.background=null;const cc=R.getClearColor(new T.Color()),ca=R.getClearAlpha();R.setClearColor(0x000000,0);
 G.body.updateMatrixWorld(true);const inv=new T.Matrix4().copy(G.body.matrixWorld).invert();
 const car=new T.Box3().setFromObject(root),c0=car.getCenter(new T.Vector3()),rad=car.getSize(new T.Vector3()).length()/2;
 const W=opt.W||1200,H=opt.H||750,rt=new T.WebGLRenderTarget(W,H,{type:T.FloatType}),buf=new Float32Array(W*H*4),cam=new T.PerspectiveCamera(30,W/H,1,100);
 const step=opt.step||2,back=opt.back||1.75,gaps=[];let views=0,hitsN=0,flagN=0;const t0=performance.now();
 const v=new T.Vector3(),cl=new T.Vector3();
 const look=(near,far)=>{cam.near=near;cam.far=far;cam.updateProjectionMatrix();cam.updateMatrixWorld();R.setRenderTarget(rt);R.clear();R.render(G.scene,cam);R.readRenderTargetPixels(rt,0,0,W,H,buf);R.setRenderTarget(null);views++;
   cl.copy(cam.position).applyMatrix4(inv);const fl=[];
   for(let py=0;py<H;py+=step)for(let px=0;px<W;px+=step){const i=(py*W+px)*4;if(buf[i+3]<.5)continue;hitsN++;
     v.set(buf[i],buf[i+1],buf[i+2]).applyMatrix4(inv);if(v.y<15)continue;   // underbody
     const dx=cl.x-v.x,dy=cl.y-v.y,dz=cl.z-v.z,L=Math.hypot(dx,dy,dz);let out=false;
     for(let k=.25;k<=back;k+=.25){if(!env(v.x+dx/L*k,v.y+dy/L*k,v.z+dz/L*k)){out=true;break;}}
     if(!out)fl.push([px,py,v.x*20,v.y*20,v.z*20]);}
   // a hole is wider than a pixel: a flagged pixel counts only with at least two flagged neighbours (at a grazing angle on the silhouette one pixel can
   // stay inside the envelope 35 mm back along the ray while its surface is the outside skin)
   const set=new Set(fl.map(f=>f[0]+','+f[1])),kept=fl.filter(([x,y])=>{let n=0;for(const [a,b] of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,1],[-1,1],[1,-1]])if(set.has((x+a*step)+','+(y+b*step)))n++;return n>=2;});
   // and a hole shows as a patch: at least 5 such pixels within one 100 mm cube of the car (a 10 mm opening is about 25 of them in a close view). The
   // clean Model X's residue (10 pixels in 5 of 648 views, never more than 2 in one cube) is the arches' stepped edges at grazing angles: looked at, no opening
   const by=new Map();for(const f of kept){const k=[0,1,2].map(i=>Math.round(f[2+i]/100)).join(',');(by.get(k)||by.set(k,[]).get(k)).push(f);}
   const holes=[...by.values()].filter(g=>g.length>=5).flat();flagN+=holes.length;if(opt.keep&&holes.length)lastFl=holes;return holes;};
 let lastFl=null;
 const report=(tag,fl)=>{if(!fl.length)return;const m=new Map();for(const f of fl){const k=[Math.round(f[2]/100),Math.round(f[3]/100),Math.round(f[4]/100)].join(',');m.set(k,(m.get(k)||0)+1);}
   gaps.push({tag,px:fl.length,at:[...m.entries()].sort((a,b)=>b[1]-a[1]).slice(0,6).map(([k,n])=>k.split(',').map(q=>q*100).join(',')+' x'+n)});};
 // wide: whole car, every direction a player's camera can take
 for(const el of (opt.els||[0.03,0.2,0.45,0.75,1.05,1.4]))for(let a=0;a<(opt.naz||24);a++){const az=a*2*Math.PI/(opt.naz||24);
   cam.fov=30;cam.position.set(c0.x+Math.cos(el)*Math.cos(az)*rad*3.2,c0.y+Math.sin(el)*rad*3.2,c0.z+Math.cos(el)*Math.sin(az)*rad*3.2);cam.lookAt(c0);
   report('wide el '+el+' az '+az.toFixed(2),look(rad*2,rad*4.4));}
 // close: 1.8 m from points all round the body
 if(!opt.wideOnly){const L=q=>new T.Vector3(...q.map(t=>t/20)).applyMatrix4(G.body.matrixWorld);
   for(const sd of [1,-1])for(const x of (opt.xs||[2300,1700,1100,500,-100,-700,-1300,-1900,-2400]))for(const y of (opt.ys||[420,820,1150,1450]))for(const [daz,el] of (opt.dirs||[[0,.1],[-.9,.15],[.9,.15],[-.5,.6],[.5,.6],[0,.9],[0,1.3]])){
     const tg=L([x,y,sd*700]),az=(sd>0?Math.PI/2:-Math.PI/2)+daz;cam.fov=40;cam.position.copy(tg).add(new T.Vector3(Math.cos(el)*Math.cos(az),Math.sin(el),Math.cos(el)*Math.sin(az)).multiplyScalar(90));
     if(cam.position.y<.6)continue;cam.lookAt(tg);report('close '+(sd>0?'R':'L')+' x'+x+' y'+y+' daz'+daz+' el'+el,look(8,400));}}
 for(const [o,m,vv] of saved){o.material=m;o.visible=vv;}for(const [c,vv] of vis)c.visible=vv;G.scene.background=bg;R.setClearColor(cc,ca);rt.dispose();posMat.dispose();
 return {views,surfacePx:hitsN,flaggedPx:flagN,gapViews:gaps.length,secs:Math.round((performance.now()-t0)/1000),gaps,lastFl:opt.keep?lastFl:undefined};}
