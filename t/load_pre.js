// load the shared garage modules (build_garage.py's pre list) into one vm context for quick offline probes: const C=require('./load_pre.js')()
module.exports=function(){const fs=require('fs'),vm=require('vm'),path=require('path'),GAR=path.join(process.env.VG_ROOT||path.resolve(__dirname,'..'),'gar');const py=fs.readFileSync(path.join(GAR,'build_garage.py'),'utf8');
  const pre=JSON.parse(py.match(/pre=(\[[^\]]*\])/)[1].replace(/'/g,'"'));
  const ctx={console,Math,Date,JSON,Map,Set,Array,Object,Number,String,Float32Array,Float64Array,Int32Array,Uint8Array,Uint16Array,Uint32Array,Int8Array,Int16Array,Infinity,NaN,isFinite,parseFloat,parseInt,THREE:require('three')};
  ctx.globalThis=ctx;ctx.window=ctx;vm.createContext(ctx);
  const src=pre.map(f=>fs.readFileSync(path.join(GAR,f),'utf8').replace(/if\(typeof module!=='undefined'\)module\.exports=[^\n]*/g,'')).join('\n;\n');
  vm.runInContext(src+'\n;this.__ok=1;',ctx,{filename:'pre.js'});ctx.ev=s=>vm.runInContext(s,ctx);return ctx;};
