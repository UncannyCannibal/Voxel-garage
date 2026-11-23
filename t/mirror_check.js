// MIRROR CHECK (run in the real-browser page, shots/mirdbg.py t/mirror_check.js): from the cockpit eye each live mirror's view is rendered as the page does
// (clipped at the glass, its own housing hidden) and judged: not one flat colour (it reflects the scene, not its own glass), the horizon in view, and for the
// door mirrors the car's own flank only as a sliver along the inboard edge (paint-coloured pixels in the inboard 35 % of the width, none in the outboard half)
(async()=>{const G=window.__GARAGE,T=G.THREE;G.state.view='cockpit';for(let i=0;i<30;i++)await new Promise(r=>requestAnimationFrame(r));
 const eye=G.camera.getWorldPosition(new T.Vector3()),out=[];
 for(const m of G.MIRRORS){if(!G.aimMirror(m,eye)){out.push('FAIL '+m.name+': the eye is behind the glass');continue;}
  m.plane.visible=false;for(const o of m.self)o.visible=false;G.renderer.clippingPlanes=[m.clip];G.renderer.setRenderTarget(m.rt);G.renderer.render(G.scene,m.cam);
  const W=m.rt.width,H=m.rt.height,b=new Uint8Array(4*W*H);G.renderer.readRenderTargetPixels(m.rt,0,0,W,H,b);G.renderer.setRenderTarget(null);G.renderer.clippingPlanes=[];for(const o of m.self)o.visible=true;m.plane.visible=true;
  let s=0,s2=0,n=W*H,paintIn=0,paintOut=0;const side=/L$/.test(m.name)?-1:/R$/.test(m.name)?1:0;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const p=(y*W+x)*4,r=b[p],g=b[p+1],bl=b[p+2],L=(r+g+bl)/3;s+=L;s2+=L*L;
    const paint=r>120&&r>g*1.8&&r>bl*1.8;if(!paint)continue;const xs=W-1-x;   // the driver sees the image mirrored
    const f=xs/W,inb=side<0?f>.65:f<.35,outb=side<0?f<.5:f>.5;if(inb)paintIn++;else if(outb)paintOut++;}
  const sd=Math.sqrt(Math.max(0,s2/n-(s/n)**2));let ok=sd>6,msg=m.name+': brightness spread '+sd.toFixed(1);
  if(side){ok=ok&&paintIn>W*H*.01&&paintOut===0;msg+=', flank in the inboard edge '+(100*paintIn/n).toFixed(1)+' % of the glass, in the outboard half '+(100*paintOut/n).toFixed(1)+' %';}
  out.push((ok?'PASS ':'FAIL ')+msg);}
 return out;})()
