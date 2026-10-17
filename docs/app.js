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
    try{const data={};for(const[id,s]of Object.entries(states))data[id]={values:s.values};localStorage.setItem(storageKey,JSON.stringify(data));}catch{}
  }
  for(const[id,q]of Object.entries(content)){
    const defaults=C.DEFAULTS[id];
    const values={...defaults};
    if(saved?.[id]?.values && typeof saved[id].values==='object'){
      for(const field of q.fields){const v=saved[id].values[field.key];if(typeof v==='number'&&Number.isFinite(v))values[field.key]=v;}
      try{C.calculate(id,values);}catch{Object.assign(values,defaults);}
    }
    states[id]={values,revealed:false};
    const tab=document.createElement('button');tab.className='tab-btn';tab.dataset.tab=id;tab.setAttribute('aria-controls',id);tab.textContent=`${id.toUpperCase()} · ${q.short}`;tab.addEventListener('click',()=>activate(id,true));$('tabs').append(tab);
    const section=document.createElement('section');section.id=id;section.hidden=true;section.setAttribute('aria-labelledby',`${id}-title`);
    section.innerHTML=`<div class="section-heading"><h2 id="${id}-title">${q.title}</h2>${q.formulaInQuestion?`<div class="model-line">${math(q.formula.tex,q.formula.fallback)}</div>`:''}<div class="question-body"><p>${q.question}</p><ul>${q.tasks.map(task=>`<li>${task}</li>`).join('')}</ul></div></div>
    <div class="workspace"><div class="controls"><h3>Inputs</h3><form id="${id}-form" novalidate><div class="kv">${q.fields.map(field=>`<label for="${id}-${field.key}"><span>${esc(field.label)}</span> ${math(field.tex,'')}${field.unit?`<span class="field-unit">${esc(field.unit)}</span>`:''}</label><input id="${id}-${field.key}" name="${field.key}" aria-label="${esc(field.label+(field.unit?' ('+field.unit+')':''))}" type="number" step="${field.step}" ${field.min!==undefined?`min="${field.min}"`:''} ${field.max!==undefined?`max="${field.max}"`:''} value="${values[field.key]}" required>`).join('')}</div><div class="actions"><button type="submit">Calculate</button><button type="button" class="secondary" id="${id}-reset">Reset</button></div></form><p class="question-status" id="${id}-status"></p><div class="field-error" role="alert" id="${id}-error" hidden></div>
    </div>
    <div class="visual-panel"><p class="calculate-prompt" id="${id}-prompt">Click Calculate to view plots and results.</p><div id="${id}-output" hidden><div class="chart-stack" id="${id}-charts"></div><div class="card results-card"><h3>Results</h3>${q.formula&&!q.formulaInQuestion?`<div class="model-line">${math(q.formula.tex,q.formula.fallback)}</div>`:''}<div id="${id}-results" aria-live="polite"></div><details class="working" id="${id}-working"><summary>Working</summary><div id="${id}-steps"></div></details></div></div></div></div>`;
    $('exercise').append(section);
    $(`${id}-form`).addEventListener('submit',e=>{e.preventDefault();states[id].revealed=true;update(id);});
    $(`${id}-form`).addEventListener('input',()=>{states[id].revealed=false;update(id);});
    $(`${id}-reset`).addEventListener('click',()=>{
      for(const field of q.fields)$(`${id}-${field.key}`).value=defaults[field.key];
      states[id].revealed=false;
      $(`${id}-working`).open=false;
      update(id);
    });
    update(id);
    TutorialMath.typeset(section);
  }
  function update(id){
    const q=content[id],s=states[id],v={};
    try{
      for(const field of q.fields){const element=$(`${id}-${field.key}`);const text=element.value.trim();if(!text||!Number.isFinite(Number(text)))throw new Error(`Enter a number for ${field.label}.`);v[field.key]=Number(text);if(field.min!==undefined&&v[field.key]<field.min)throw new Error(`${field.label} must be at least ${field.min}.`);if(field.max!==undefined&&v[field.key]>field.max)throw new Error(`${field.label} must be at most ${field.max}.`);}
      const o=C.calculate(id,v);s.values=v;
      $(`${id}-error`).hidden=true;
      const modified=Object.keys(v).some(k=>v[k]!==C.DEFAULTS[id][k]);
      $(`${id}-status`).textContent=modified?'Modified values':id==='q7'?'Illustrative values':'';
      $(`${id}-status`).className=`question-status${modified?' modified':''}`;
      clearOutput(id);
      if(s.revealed){
        TutorialCharts.render($(`${id}-charts`),id,v,o);
        $(`${id}-results`).innerHTML=`<table class="result-table"><tbody>${q.results(v,o).map(row=>`<tr><th scope="row"><span>${esc(row.label)}</span> ${math(row.tex,row.fallback||'')}</th><td>${esc(row.value)}${row.unit?`<span class="unit">${esc(row.unit)}</span>`:''}</td></tr>`).join('')}</tbody></table>`;
        TutorialMath.setLines(`${id}-steps`,q.working(v,o));
        $(`${id}-output`).hidden=false;$(`${id}-prompt`).hidden=true;
        TutorialMath.typeset($(`${id}-output`));
      }
      persist();
      return true;
    }catch(error){s.revealed=false;$(`${id}-error`).textContent=error.message;$(`${id}-error`).hidden=false;clearOutput(id);return false;}
  }
  function clearOutput(id){
    $(`${id}-output`).hidden=true;$(`${id}-prompt`).hidden=false;
    for(const suffix of ['charts','results','steps'])TutorialMath.setText(`${id}-${suffix}`,'');
    if(!states[id].revealed)$(`${id}-working`).open=false;
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
