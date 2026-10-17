(() => {
  'use strict';
  const C=window.TutorialCalc, content=window.TutorialContent;
  const $=id=>document.getElementById(id);
  const states={};
  const storageKey='ce2407a-tutorial2-v1';
  let saved={};
  try{saved=JSON.parse(localStorage.getItem(storageKey)||'{}');}catch{}
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const params=new URLSearchParams(location.search);
  let active=Object.hasOwn(content,params.get('question'))?params.get('question'):'q1';
  if(params.get('embed')==='1')document.body.classList.add('tutorial-embed');
  function persist(){
    try{const data={};for(const[id,s]of Object.entries(states))data[id]={values:s.values,answer:s.answer||'',check:s.check||0};localStorage.setItem(storageKey,JSON.stringify(data));}catch{}
  }
  for(const[id,q]of Object.entries(content)){
    const defaults=C.DEFAULTS[id];
    const values={...defaults};
    if(saved?.[id]?.values && typeof saved[id].values==='object'){
      for(const field of q.fields){const v=saved[id].values[field.key];if(typeof v==='number'&&Number.isFinite(v))values[field.key]=v;}
      try{C.calculate(id,values);}catch{Object.assign(values,defaults);}
    }
    states[id]={values,revealed:false,hint:0,result:null,answer:typeof saved?.[id]?.answer==='string'?saved[id].answer:'',check:Math.min(q.checks.length-1,Math.max(0,Number(saved?.[id]?.check)||0))};
    const tab=document.createElement('button');tab.className='tab-btn';tab.dataset.tab=id;tab.setAttribute('aria-controls',id);tab.textContent=`${id.toUpperCase()} · ${q.short}`;tab.addEventListener('click',()=>activate(id,true));$('tabs').append(tab);
    const section=document.createElement('section');section.id=id;section.hidden=true;section.setAttribute('aria-labelledby',`${id}-title`);
    section.innerHTML=`<div class="section-heading"><p class="eyebrow">${q.lecture}</p><h2 id="${id}-title">${q.title}</h2><p>${q.intro}</p><details><summary>Question &amp; tasks</summary><div class="question-body"><p>${q.question}</p><ul>${q.tasks.map(task=>`<li>${task}</li>`).join('')}</ul></div></details></div>
    <div class="workspace"><div class="controls"><h3>Explore the inputs</h3><form id="${id}-form" novalidate><div class="kv">${q.fields.map(field=>`<label for="${id}-${field.key}">${field.label}</label><input id="${id}-${field.key}" name="${field.key}" type="number" step="${field.step}" ${field.min!==undefined?`min="${field.min}"`:''} ${field.max!==undefined?`max="${field.max}"`:''} value="${values[field.key]}" required>`).join('')}</div><div class="actions"><button type="submit">Calculate</button><button type="button" class="secondary" id="${id}-reset">Reset</button></div></form><p class="question-status" id="${id}-status"></p><div class="field-error" role="alert" id="${id}-error" hidden></div><p class="model-note">${q.note}</p>
    <div class="control-section check-panel"><h3>Try an answer</h3><label for="${id}-part">Part to check</label><select id="${id}-part">${q.checks.map((check,i)=>`<option value="${i}">${check.label}</option>`).join('')}</select><label for="${id}-answer">Your answer</label><input id="${id}-answer" type="text" inputmode="decimal" placeholder="e.g. 0.25 or 25%" autocomplete="off" value="${esc(states[id].answer)}"><p class="syntax">Decimals, fractions and percentages accepted.</p><div class="actions"><button type="button" class="secondary" id="${id}-check">Check answer</button></div><div class="feedback" id="${id}-feedback" role="status">Use the current inputs. Try before revealing the results.</div></div></div>
    <div class="visual-panel"><div class="panel-title"><h3>Explore the distribution</h3><span class="live-label">Plots update as you change inputs</span></div><div class="chart-stack" id="${id}-charts"></div><div class="card results-card"><h3>Results</h3><div id="${id}-results" aria-live="polite"><p class="result-placeholder">Choose <strong>Calculate</strong> to reveal the numerical results.</p></div><details class="working" id="${id}-working"><summary>Working &amp; formulas</summary><div id="${id}-steps"></div></details></div></div></div>
    <aside class="hint-panel"><h3>Need a starting point?</h3><p>Reveal a short hint for this question, one step at a time.</p><div class="actions"><button class="secondary" id="${id}-hint">Show first hint</button><button class="secondary" id="${id}-hide-hint" hidden>Hide hints</button></div><div id="${id}-hints" role="status"></div></aside>`;
    $('exercise').append(section);
    $(`${id}-part`).value=String(states[id].check);
    $(`${id}-form`).addEventListener('submit',e=>{e.preventDefault();states[id].revealed=true;update(id);});
    $(`${id}-form`).addEventListener('input',()=>{states[id].answer='';$(`${id}-answer`).value='';$(`${id}-feedback`).className='feedback';$(`${id}-feedback`).textContent='Inputs changed. Check your answer for this scenario.';update(id);});
    $(`${id}-reset`).addEventListener('click',()=>{
      for(const field of q.fields)$(`${id}-${field.key}`).value=defaults[field.key];
      states[id].revealed=false;states[id].answer='';states[id].hint=0;states[id].check=0;
      $(`${id}-part`).value='0';$(`${id}-answer`).value='';$(`${id}-working`).open=false;
      $(`${id}-results`).innerHTML='<p class="result-placeholder">Original tutorial values restored. Choose <strong>Calculate</strong> to reveal results.</p>';
      $(`${id}-feedback`).className='feedback';$(`${id}-feedback`).textContent='Use the original inputs. Try before revealing the results.';
      renderHints(id);update(id);
    });
    $(`${id}-part`).addEventListener('change',()=>{states[id].check=Number($(`${id}-part`).value);states[id].answer='';$(`${id}-answer`).value='';$(`${id}-feedback`).textContent='Enter your answer for this part.';$(`${id}-feedback`).className='feedback';persist();});
    $(`${id}-answer`).addEventListener('input',()=>{states[id].answer=$(`${id}-answer`).value;persist();});
    $(`${id}-answer`).addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();checkAnswer(id);}});
    $(`${id}-check`).addEventListener('click',()=>checkAnswer(id));
    $(`${id}-hint`).addEventListener('click',()=>{states[id].hint=Math.min(q.hints.length,states[id].hint+1);renderHints(id);});
    $(`${id}-hide-hint`).addEventListener('click',()=>{states[id].hint=0;renderHints(id);});
    update(id);
  }
  function update(id){
    const q=content[id],s=states[id],v={};
    try{
      for(const field of q.fields){const element=$(`${id}-${field.key}`);const text=element.value.trim();if(!text||!Number.isFinite(Number(text)))throw new Error(`Enter a number for ${field.label}.`);v[field.key]=Number(text);if(field.min!==undefined&&v[field.key]<field.min)throw new Error(`${field.label} must be at least ${field.min}.`);if(field.max!==undefined&&v[field.key]>field.max)throw new Error(`${field.label} must be at most ${field.max}.`);}
      const o=C.calculate(id,v);s.values=v;s.result=o;s.valid=true;
      $(`${id}-error`).hidden=true;
      const modified=Object.keys(v).some(k=>v[k]!==C.DEFAULTS[id][k]);
      $(`${id}-status`).textContent=modified?'Exploration values · Reset restores the tutorial.':id==='q7'?'Illustrative values · The question is symbolic.':'Original tutorial values';
      $(`${id}-status`).className=`question-status${modified?' modified':''}`;
      TutorialCharts.render($(`${id}-charts`),id,v,o);
      if(s.revealed)$(`${id}-results`).innerHTML=`<table class="result-table"><tbody>${q.results(v,o).map(row=>`<tr><th scope="row">${esc(row.label)}</th><td>${esc(row.value)}${row.unit?`<span class="unit">${esc(row.unit)}</span>`:''}</td></tr>`).join('')}</tbody></table>`;
      else $(`${id}-results`).innerHTML='<p class="result-placeholder">Choose <strong>Calculate</strong> to reveal the numerical results.</p>';
      TutorialMath.setLines(`${id}-steps`,q.working(v,o));persist();
      return true;
    }catch(error){s.valid=false;$(`${id}-error`).textContent=error.message;$(`${id}-error`).hidden=false;$(`${id}-charts`).innerHTML='<p class="result-placeholder">Correct the inputs to display the distribution.</p>';$(`${id}-results`).innerHTML='<p class="result-placeholder">Results are unavailable until the inputs are valid.</p>';TutorialMath.setText(`${id}-steps`,'Correct the inputs to show the working.');return false;}
  }
  function parseAnswer(text){
    const cleaned=text.trim().replace(/,/g,'');
    if(!cleaned)return NaN;
    const fraction=cleaned.match(/^([+-]?(?:\d+\.?\d*|\.\d+))\s*\/\s*([+-]?(?:\d+\.?\d*|\.\d+))$/);
    if(fraction)return Number(fraction[1])/Number(fraction[2]);
    if(cleaned.endsWith('%'))return Number(cleaned.slice(0,-1))/100;
    return Number(cleaned);
  }
  function checkAnswer(id){
    if(!update(id))return;
    const s=states[id],q=content[id],key=q.checks[Number($(`${id}-part`).value)].key;
    const actual=parseAnswer($(`${id}-answer`).value),expected=s.result[key],out=$(`${id}-feedback`);
    if(!Number.isFinite(actual)){out.className='feedback bad';out.textContent='Enter a finite number, a fraction such as 1/2, or a percentage such as 50%.';return;}
    const probabilityKeys=['le2','between','cdf','currentRisk','futureRisk','stormRisk','annualRisk','atMostOne','noGas','stranded','noneWait','atLeastTwo','failureRisk'];
    if(probabilityKeys.includes(key)&&(actual<0||actual>1)){out.className='feedback bad';out.textContent='A probability must be between 0 and 1 (or 0% and 100%).';return;}
    // Permit normal-table rounding and the supplied PDF approximations at default values.
    let tolerance=Math.max(0.00005,Math.abs(expected)*0.005);
    const original=Object.keys(s.values).every(k=>s.values[k]===C.DEFAULTS[id][k]);
    if(original&&((id==='q3'&&key==='futureRisk')||(id==='q4'&&/Risk$/.test(key))||(id==='q6'&&key==='cycleHours')))tolerance=Math.max(tolerance,.002);
    if(Math.abs(actual-expected)<=tolerance){out.className='feedback good';out.textContent='Correct within rounding tolerance. Open Working & formulas to review the method.';}
    else{out.className='feedback bad';out.textContent=`Not quite. ${actual<expected?'Your answer is too low.':'Your answer is too high.'} ${q.hints[0]}`;}
  }
  function renderHints(id){
    const s=states[id],q=content[id];$(`${id}-hints`).innerHTML=q.hints.slice(0,s.hint).map((hint,i)=>`<p class="hint-text"><strong>Hint ${i+1}.</strong> ${hint}</p>`).join('');
    $(`${id}-hint`).textContent=s.hint===0?'Show first hint':s.hint===q.hints.length?'All hints shown':'Next hint';$(`${id}-hint`).disabled=s.hint===q.hints.length;$(`${id}-hide-hint`).hidden=s.hint===0;
  }
  function activate(id,writeURL){
    active=id;
    for(const key of Object.keys(content)){$(key).hidden=key!==id;const tab=document.querySelector(`[data-tab="${key}"]`);tab.classList.toggle('active',key===id);if(key===id)tab.setAttribute('aria-current','true');else tab.removeAttribute('aria-current');}
    if(writeURL){const url=new URL(location.href);url.searchParams.set('question',id);history.pushState({question:id},'',url);}
    TutorialMath.typeset($(id));
    document.title=`${id.toUpperCase()} · ${content[id].short} | CE2407A Tutorial 2`;
  }
  addEventListener('popstate',()=>{const id=new URLSearchParams(location.search).get('question');activate(Object.hasOwn(content,id)?id:'q1',false);});
  activate(active,false);
})();
