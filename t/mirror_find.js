// which drawn part fills the interior mirror's view: hide each part in turn and measure the view's brightness spread
(async()=>{const G=window.__GARAGE,T=G.THREE,P=G.P;G.state.view='cockpit';for(let i=0;i<30;i++)await new Promise(r=>requestAnimationFrame(r));
 const eye=G.camera.getWorldPosition(new T.Vector3()),m=G.MIRRORS.find(q=>q.name==='interior');if(!G.aimMirror(m,eye))return 'aim false';
 const spread=()=>{m.plane.visible=false;for(const o of m.self)o.visible=false;G.renderer.clippingPlanes=[m.clip];G.renderer.setRenderTarget(m.rt);G.renderer.render(G.scene,m.cam);
   const W=m.rt.width,H=m.rt.height,b=new Uint8Array(4*W*H);G.renderer.readRenderTargetPixels(m.rt,0,0,W,H,b);G.renderer.setRenderTarget(null);G.renderer.clippingPlanes=[];for(const o of m.self)o.visible=true;m.plane.visible=true;
   let s=0,s2=0,n=W*H;for(let p=0;p<b.length;p+=4){const L=(b[p]+b[p+1]+b[p+2])/3;s+=L;s2+=L*L;}return Math.sqrt(Math.max(0,s2/n-(s/n)**2)).toFixed(1)+' mean '+(s/n).toFixed(0);};
 const out=['all: '+spread()];const objs=[];for(const k of Object.keys(P)){const v=P[k];if(v&&v.isObject3D)objs.push([k,v]);else if(Array.isArray(v))v.forEach((o,i)=>{if(o&&o.isObject3D)objs.push([k+i,o]);});}
 for(const [k,o] of objs){if(!o.visible)continue;o.visible=false;const s=spread();o.visible=true;out.push(k+': '+s);}
 return out.filter(l=>!/: 1\.[0-9] /.test(l)||l.startsWith('all'));})()
