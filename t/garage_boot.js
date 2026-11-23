// Headless boot of the one-product E30 page (jsdom, stubbed WebGL). Not a real browser.
const {JSDOM,VirtualConsole}=require('jsdom');const fs=require('fs');
const path=require('path'),ROOT=process.env.VG_ROOT||path.resolve(__dirname,'..');   // project root (holds gar/ and t/)
const html=fs.readFileSync(process.env.PAGE||path.join(ROOT,'gar','out','garage.html'),'utf8');
const errs=[];const vc=new VirtualConsole();
vc.on('jsdomError',e=>errs.push('JSDOM:'+(e.detail&&e.detail.stack||e.message).split('\n').slice(0,4).join(' | ')));
vc.on('error',e=>errs.push('console.error:'+String(e&&e.stack||e).slice(0,400)));
const inline=html.slice(html.lastIndexOf('<script>')+8,html.lastIndexOf('</script>'));
const body=html.replace(/<script[^>]*src=[^>]*><\/script>/,'').replace(/<script>[\s\S]*?<\/script>/,'');
const dom=new JSDOM(body,{runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc,url:'http://localhost/'});
const w=dom.window;
const mk=(cv)=>{const f=function(){return mk(cv)};return new Proxy(f,{get:(t,k)=>k==='canvas'?cv:(k===Symbol.toPrimitive?()=>0:mk(cv)),set:()=>true,apply:()=>mk(cv)})};
w.HTMLCanvasElement.prototype.getContext=function(){return mk(this)};
w.matchMedia=w.matchMedia||(q=>({matches:false,addEventListener(){}}));
w.addEventListener('error',e=>errs.push('window.onerror:'+e.message));
w.eval(fs.readFileSync(path.join(__dirname,'node_modules','three','build','three.min.js'),'utf8'));
w.eval(`(function(){const T=THREE;class R{constructor(o){this.domElement=o.canvas;}setPixelRatio(){}setSize(){}render(){}setRenderTarget(){}}T.WebGLRenderer=R;})()`);
try{w.eval(inline);}catch(e){errs.push('EVAL:'+e.stack.split('\n').slice(0,4).join(' | '));}
module.exports=async function(){
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  for(let i=0;i<300&&w.document.getElementById('boot').style.display!=='none';i++)await sleep(200);
  return {w,E:w.__E30,errs,$:id=>w.document.getElementById(id)};
};
