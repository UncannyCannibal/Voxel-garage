// the interior mirror's view as the page renders it, returned as a PNG data URL (with the aim's numbers) for a look at what the glass shows
(async()=>{const G=window.__GARAGE,T=G.THREE;G.state.view='cockpit';for(let i=0;i<30;i++)await new Promise(r=>requestAnimationFrame(r));
 const eye=G.camera.getWorldPosition(new T.Vector3()),m=G.MIRRORS.find(q=>q.name==='interior');if(!m)return 'no interior mirror';
 if(!G.aimMirror(m,eye))return 'aim false';m.plane.visible=false;for(const o of m.self)o.visible=false;G.renderer.clippingPlanes=[m.clip];G.renderer.setRenderTarget(m.rt);G.renderer.render(G.scene,m.cam);
 const W=m.rt.width,H=m.rt.height,b=new Uint8Array(4*W*H);G.renderer.readRenderTargetPixels(m.rt,0,0,W,H,b);G.renderer.setRenderTarget(null);G.renderer.clippingPlanes=[];for(const o of m.self)o.visible=true;m.plane.visible=true;
 const cv=document.createElement('canvas');cv.width=W;cv.height=H;const cx=cv.getContext('2d'),im=cx.createImageData(W,H);for(let y=0;y<H;y++)for(let x=0;x<W;x++){const s=((H-1-y)*W+x)*4,d=(y*W+x)*4;for(let c=0;c<4;c++)im.data[d+c]=b[s+c];}cx.putImageData(im,0,0);
 const cp=new T.Vector3().setFromMatrixPosition(m.cam.matrixWorld),dir=new T.Vector3(0,0,-1).transformDirection(m.cam.matrixWorld);
 return {png:cv.toDataURL(),eye:eye.toArray().map(v=>+v.toFixed(2)),cam:cp.toArray().map(v=>+v.toFixed(2)),dir:dir.toArray().map(v=>+v.toFixed(3)),plane:new T.Vector3().setFromMatrixPosition(m.plane.matrixWorld).toArray().map(v=>+v.toFixed(2))};})()
