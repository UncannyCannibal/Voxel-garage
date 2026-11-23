async (full)=>{window.QA_MAX=1e9;const o=document.getElementById('qaOut');o.value='';document.getElementById(full?'bQA2':'bQA').click();
  for(let i=0;i<3600;i++){await new Promise(r=>setTimeout(r,1000));if(/QA (PASS|FAIL)|QA error/.test(o.value))return o.value;}return 'timeout';}
