import sys,os
D=os.path.join(os.path.dirname(os.path.abspath(__file__)),'')   # the source folder (this script's folder)
rd=lambda f:open(D+f,encoding='utf-8').read().replace("if(typeof module!=='undefined')module.exports=","if(false)module.exports=")
head=open(D+'garage_head.html',encoding='utf-8').read()
pre=["parts_lib.js","parts_honda.js","parts_jdm.js","parts_nissan.js","parts_dsm.js","parts_2000gt.js","parts_modelx.js","shells.js","fit.js","modelx_ev.js","e30_core.js","surfnet.js","glass_trim.js","frame_seal.js","e30_parts.js","e30_shop_parts.js","e30_detail.js","e30_rig.js","genshell.js","ef_detail.js","ef_body.js","ef_rig.js","z32_body.js","z32_detail.js","z32_rig.js","rig_gen_ext.js","rig_gen.js","e30_mech.js"]
# arguments: [out.html] [extra car modules...] [--hide=id,id]. --hide builds the page with those cars off the list (their card shows "Coming soon");
# the launch build hides the 2000GT (owner's decision, Nov 13: LAUNCH.md A3). Their code is still built in: gt2000_body.js also registers the E30s
ARGS=[a for a in sys.argv[1:] if not a.startswith('--')]
HIDE=[x for a in sys.argv[1:] if a.startswith('--hide=') for x in a[7:].split(',') if x]
mods=["car_e30.js","ae86_body.js","eclipse_body.js","gt2000_body.js","car_ef.js","car_z32.js","car_ae86.js","car_eclipse.js","car_gt2000.js","modelx_body.js","car_modelx.js"]+ARGS[1:]
# the declared mounts the checks allow (t/scene_mounts.js), for the in-page QA panel
_mp=os.path.join(D,'..','t','scene_mounts.js');qam=open(_mp,encoding='utf-8').read().replace('module.exports.','QA_MOUNTS.').replace('module.exports=','const QA_MOUNTS=') if os.path.exists(_mp) else 'const QA_MOUNTS={};'
js=qam+"\n"+"\n".join(rd(f) for f in pre)+"\nconst CAR_MODULES={};\n"+"\n".join(rd(f) for f in mods)+"\nconst HIDDEN_CARS="+repr(HIDE).replace("'",'"')+";for(const id of HIDDEN_CARS)delete CAR_MODULES[id];\n(function(){\n'use strict';\n"+rd('garage_core.js')+"\n"+rd('sound.js')+"\n"+rd('world.js')+"\n"+rd('garage_ui.js')+"\n"+rd('qa.js')+"\n"+rd('kit.js')+"\n})();\n"
out=ARGS[0] if ARGS else os.path.join(D,'out','garage.html')
os.makedirs(os.path.dirname(out),exist_ok=True)
# lint: code that a comment swallowed (a '// ...' followed on the same line by a statement) runs as a comment and silently does nothing
import re
for f in pre+mods+['garage_core.js','sound.js','world.js','garage_ui.js','qa.js']:
    for i,l in enumerate(open(D+f,encoding='utf-8').read().split('\n')):
        k=l.find('// ')
        if k<0 or l[:k].count("'")%2 or l[:k].count('"')%2: continue
        t=l[k+3:]
        if re.search(r'\)\s*;?\s*[A-Za-z_$][\w$.]*\s*(\(|=[^=>])',t) and re.search(r'[;}]\s*$',t) and re.search(r'\b(push|set|box|cyl\w*|segFill|const|let|if|for|return|state\.|phys\.|h\.\w+|g\.\w+)\b',t.split(')')[-2] if ')' in t else t):
            print('LINT %s:%d code after a comment? ...%s'%(f,i+1,t[-90:]))
# the script must parse: a syntax slip anywhere would leave the page blank (checked with node, if it is installed)
import subprocess,tempfile,shutil
if shutil.which('node'):
    with tempfile.NamedTemporaryFile('w',suffix='.js',delete=False,encoding='utf-8') as t:t.write(js);tp=t.name
    r=subprocess.run(['node','--check',tp],capture_output=True,text=True);os.unlink(tp)
    if r.returncode!=0:sys.exit('SYNTAX ERROR, page not written:\n'+r.stderr[:1500])
# written to a temporary file and moved into place, so a test reading the page never sees half of it
tmp=out+'.tmp';open(tmp,'w',encoding='utf-8').write(head+js+"\n</script>\n</body>\n</html>\n");os.replace(tmp,out)
print('page',len(head+js)//1000,'KB ->',out+(' (hidden: '+','.join(HIDE)+')' if HIDE else ''))
