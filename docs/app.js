(() => {
  'use strict';
  const C=window.TutorialCalc, content=window.TutorialContent;
  const $=id=>document.getElementById(id);
  const states={};
  const storageKey='ce2407a-tutorial2-v1';
  let saved={};
  try{saved=JSON.parse(localStorage.getItem(storageKey)||'{}');}catch{}
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const math=(tex,fallback)=>tex?`<span class="inline-math" data-tex="${esc(tex)}">${esc(fallback??tex)}</span>`:'';
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
    section.innerHTML=`<div class="section-heading"><h2 id="${id}-title">${q.title}</h2><div class="model-line">${q.intro?`<span>${q.intro}</span>`:''}${q.formula?math(q.formula.tex,q.formula.fallback):''}</div><details class="question-details"><summary>Question</summary><div class="question-body"><p>${q.question}</p><ul>${q.tasks.map(task=>`<li>${task}</li>`).join('')}</ul><p class="model-note">${q.note}</p></div></details></div>
    <div class="workspace"><div class="controls"><h3>Inputs</h3><form id="${id}-form" novalidate><div class="kv">${q.fields.map(field=>`<label for="${id}-${field.key}"><span>${esc(field.label)}</span> ${math(field.tex,'')}${field.unit?`<span class="field-unit">${esc(field.unit)}</span>`:''}</label><input id="${id}-${field.key}" name="${field.key}" aria-label="${esc(field.label+(field.unit?' ('+field.unit+')':''))}" type="number" step="${field.step}" ${field.min!==undefined?`min="${field.min}"`:''} ${field.max!==undefined?`max="${field.max}"`:''} value="${values[field.key]}" required>`).join('')}</div><div class="actions"><button type="submit">Calculate</button><button type="button" class="secondary" id="${id}-reset">Reset</button></div></form><p class="question-status" id="${id}-status"></p><div class="field-error" role="alert" id="${id}-error" hidden></div>
    <div class="control-section check-panel"><h3>Check your answer</h3><label class="sr-only" for="${id}-part">Part</label><select id="${id}-part">${q.checks.map((check,i)=>`<option value="${i}">${esc(check.label)}</option>`).join('')}</select><div class="answer-row"><label class="sr-only" for="${id}-answer">Your answer</label><input id="${id}-answer" type="text" inputmode="decimal" placeholder="Answer · e.g. 0.5 or 50%" autocomplete="off" value="${esc(states[id].answer)}"><button type="button" class="secondary" id="${id}-check">Check</button></div><div class="feedback" id="${id}-feedback" role="status"></div></div>
    <details class="hint-panel" id="${id}-hint-panel"><summary>Hints</summary><div id="${id}-hints" role="status"></div><div class="actions"><button class="secondary" id="${id}-hint">Show hint</button><button class="secondary" id="${id}-hide-hint" hidden>Clear</button></div></details></div>
    <div class="visual-panel"><div class="chart-stack" id="${id}-charts"></div><div class="card results-card"><h3 id="${id}-results-title" hidden>Results</h3><div id="${id}-results" aria-live="polite"></div><details class="working" id="${id}-working"><summary>Working</summary><div id="${id}-steps"></div></details></div></div></div>`;
    $('exercise').append(section);
    $(`${id}-part`).value=String(states[id].check);
    $(`${id}-form`).addEventListener('submit',e=>{e.preventDefault();states[id].revealed=true;update(id);});
    $(`${id}-form`).addEventListener('input',()=>{states[id].answer='';$(`${id}-answer`).value='';$(`${id}-feedback`).className='feedback';$(`${id}-feedback`).textContent='';update(id);});
    $(`${id}-reset`).addEventListener('click',()=>{
      for(const field of q.fields)$(`${id}-${field.key}`).value=defaults[field.key];
      states[id].revealed=false;states[id].answer='';states[id].hint=0;states[id].check=0;
      $(`${id}-part`).value='0';$(`${id}-answer`).value='';$(`${id}-working`).open=false;
      $(`${id}-feedback`).className='feedback';$(`${id}-feedback`).textContent='';$(`${id}-hint-panel`).open=false;
      renderHints(id);update(id);
    });
    $(`${id}-part`).addEventListener('change',()=>{states[id].check=Number($(`${id}-part`).value);states[id].answer='';$(`${id}-answer`).value='';$(`${id}-feedback`).textContent='';$(`${id}-feedback`).className='feedback';persist();});
    $(`${id}-answer`).addEventListener('input',()=>{states[id].answer=$(`${id}-answer`).value;persist();});
    $(`${id}-answer`).addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();checkAnswer(id);}});
    $(`${id}-check`).addEventListener('click',()=>checkAnswer(id));
    $(`${id}-hint`).addEventListener('click',()=>{states[id].hint=Math.min(q.hints.length,states[id].hint+1);renderHints(id);});
    $(`${id}-hide-hint`).addEventListener('click',()=>{states[id].hint=0;renderHints(id);});
    update(id);
    TutorialMath.typeset(section);
  }
  function update(id){
    const q=content[id],s=states[id],v={};
    try{
      for(const field of q.fields){const element=$(`${id}-${field.key}`);const text=element.value.trim();if(!text||!Number.isFinite(Number(text)))throw new Error(`Enter a number for ${field.label}.`);v[field.key]=Number(text);if(field.min!==undefined&&v[field.key]<field.min)throw new Error(`${field.label} must be at least ${field.min}.`);if(field.max!==undefined&&v[field.key]>field.max)throw new Error(`${field.label} must be at most ${field.max}.`);}
      const o=C.calculate(id,v);s.values=v;s.result=o;s.valid=true;
      $(`${id}-error`).hidden=true;
      const modified=Object.keys(v).some(k=>v[k]!==C.DEFAULTS[id][k]);
      $(`${id}-status`).textContent=modified?'Modified values':id==='q7'?'Illustrative values':'';
      $(`${id}-status`).className=`question-status${modified?' modified':''}`;
      TutorialMath.setText(`${id}-charts`,'');
      TutorialCharts.render($(`${id}-charts`),id,v,o);
      TutorialMath.typeset($(`${id}-charts`));
      TutorialMath.setText(`${id}-results`,'');
      $(`${id}-results-title`).hidden=!s.revealed;
      if(s.revealed){$(`${id}-results`).innerHTML=`<table class="result-table"><tbody>${q.results(v,o).map(row=>`<tr><th scope="row"><span>${esc(row.label)}</span> ${math(row.tex,row.fallback||'')}</th><td>${esc(row.value)}${row.unit?`<span class="unit">${esc(row.unit)}</span>`:''}</td></tr>`).join('')}</tbody></table>`;TutorialMath.typeset($(`${id}-results`));}
      TutorialMath.setLines(`${id}-steps`,q.working(v,o));persist();
      return true;
    }catch(error){s.valid=false;$(`${id}-error`).textContent=error.message;$(`${id}-error`).hidden=false;TutorialMath.setText(`${id}-charts`,'');TutorialMath.setText(`${id}-results`,'');$(`${id}-results-title`).hidden=true;TutorialMath.setText(`${id}-steps`,'Correct the inputs first.');return false;}
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
    if(!Number.isFinite(actual)){out.className='feedback bad';out.textContent='Enter a number, fraction or percentage.';return;}
    const probabilityKeys=['le2','between','cdf','currentRisk','futureRisk','stormRisk','annualRisk','atMostOne','noGas','stranded','noneWait','atLeastTwo','failureRisk'];
    if(probabilityKeys.includes(key)&&(actual<0||actual>1)){out.className='feedback bad';out.textContent='A probability must be between 0 and 1 (or 0% and 100%).';return;}
    // Permit normal-table rounding and the supplied PDF approximations at default values.
    let tolerance=Math.max(0.00005,Math.abs(expected)*0.005);
    const original=Object.keys(s.values).every(k=>s.values[k]===C.DEFAULTS[id][k]);
    if(original&&((id==='q3'&&key==='futureRisk')||(id==='q4'&&/Risk$/.test(key))||(id==='q6'&&key==='cycleHours')))tolerance=Math.max(tolerance,.002);
    if(Math.abs(actual-expected)<=tolerance){out.className='feedback good';out.textContent='Correct (within rounding).';}
    else{out.className='feedback bad';out.textContent=actual<expected?'Too low. Try a hint.':'Too high. Try a hint.';}
  }
  function renderHints(id){
    const s=states[id],q=content[id];TutorialMath.setText(`${id}-hints`,'');$(`${id}-hints`).innerHTML=q.hints.slice(0,s.hint).map((hint,i)=>`<p class="hint-text"><strong>${i+1}.</strong> ${hint}</p>`).join('');TutorialMath.typeset($(`${id}-hints`));
    $(`${id}-hint`).textContent=s.hint===0?'Show hint':s.hint===q.hints.length?'All hints shown':'Next hint';$(`${id}-hint`).disabled=s.hint===q.hints.length;$(`${id}-hide-hint`).hidden=s.hint===0;
  }
  function activate(id,writeURL){
    active=id;
    for(const key of Object.keys(content)){$(key).hidden=key!==id;const tab=document.querySelector(`[data-tab="${key}"]`);tab.classList.toggle('active',key===id);if(key===id)tab.setAttribute('aria-current','true');else tab.removeAttribute('aria-current');}
    document.querySelector(`[data-tab="${id}"]`).scrollIntoView({block:'nearest',inline:'nearest'});
    if(writeURL){const url=new URL(location.href);url.searchParams.set('question',id);history.pushState({question:id},'',url);}
    TutorialMath.typeset($(id));
    document.title=`${id.toUpperCase()} · ${content[id].short} | CE2407A Tutorial 2`;
  }
  addEventListener('popstate',()=>{const id=new URLSearchParams(location.search).get('question');activate(Object.hasOwn(content,id)?id:'q1',false);});
  activate(active,false);
})();
