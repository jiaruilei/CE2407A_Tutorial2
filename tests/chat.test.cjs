const test = require('node:test');
const assert = require('node:assert/strict');
const { parseAssistantMessage, safeMath, snapshotQuestion, resolveApiBase, createChatController } = require('../docs/chat.js');
const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };
const response = (body, status = 200) => ({ ok: status < 400, status, json: async () => body });
const settle = () => new Promise(resolve => setImmediate(resolve));

function fixture(options = {}) {
  class Element {
    constructor(tag = 'div', attributes = {}) {
      this.tagName = tag.toUpperCase(); this.attributes = attributes; this.children = []; this.listeners = {};
      this.ownText = ''; this.value = ''; this.className = ''; this.disabled = false; this.checked = false;
      this.classList = { toggle: (name, enabled) => { const classes = new Set(this.className.split(/\s+/).filter(Boolean)); enabled ? classes.add(name) : classes.delete(name); this.className = [...classes].join(' '); } };
    }
    get id() { return this.attributes.id; }
    get name() { return this.attributes.name; }
    get type() { return this.attributes.type || ''; }
    get content() { return this.attributes.content; }
    get textContent() { return this.ownText + this.children.map(node => node.textContent).join(''); }
    set textContent(text) { this.ownText = String(text); this.children = []; }
    getAttribute(key) { return this.attributes[key] ?? null; }
    setAttribute(key, value) { this.attributes[key] = String(value); }
    appendChild(child) { this.children.push(child); return child; }
    focus() { this.focused = true; }
    addEventListener(name, handler) { (this.listeners[name] ??= []).push(handler); }
    fire(name, extra = {}) { const event = { preventDefault() { this.prevented = true; }, ...extra }; (this.listeners[name] || []).forEach(fn => fn(event)); return event; }
    matches(selector) {
      return selector.split(',').some(piece => {
        piece = piece.trim();
        if (piece.startsWith('.')) return this.className.split(/\s+/).includes(piece.slice(1));
        const tag = piece.match(/^[a-z]+/i)?.[0];
        if (tag && tag.toUpperCase() !== this.tagName) return false;
        const attrs = [...piece.matchAll(/\[([^=\]]+)(?:=(?:"([^"]*)"|([^\]]+)))?\]/g)];
        return Boolean(tag || attrs.length) && attrs.every(([, key, quoted, unquoted]) => {
          const value = quoted ?? unquoted;
          return this.getAttribute(key) !== null && (value === undefined || this.getAttribute(key) === value);
        });
      });
    }
    querySelectorAll(selector) { return this.children.flatMap(child => [...(child.matches(selector) ? [child] : []), ...child.querySelectorAll(selector)]); }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  }
  const body = new Element('body'), elements = {};
  const add = (id, tag = 'div', attrs = {}, parent = body) => { const node = new Element(tag, { id, ...attrs }); elements[id] = node; parent.appendChild(node); return node; };
  for (let i = 1; i <= 9; i++) {
    const tab = add(`tab${i}`, 'button', { 'data-tab': `q${i}`, 'aria-current': String(`q${i}` === (options.initialQuestion || 'q1')) });
    tab.textContent = `Q${i} · Topic ${i}`;
    tab.addEventListener('click', () => { for (let j = 1; j <= 9; j++) elements[`tab${j}`].setAttribute('aria-current', String(i === j)); });
    add(`q${i}`, 'section');
  }
  const chips = add('chips'); chips.className = 'coach-chips';
  add('chip', 'button', { 'data-question': 'Explain the formula.' }, chips);
  for (const id of ['coachLog', 'coachStatus', 'coachSend', 'coachClear']) add(id);
  add('coachForm', 'form'); add('coachQuestion', 'textarea');
  if (options.meta) add('apiMeta', 'meta', { name: 'tutorial-api-base', content: options.meta });
  const doc = {
    getElementById: id => elements[id] || null,
    createElement: tag => new Element(tag),
    querySelector: selector => body.querySelector(selector),
    querySelectorAll: selector => selector === '.coach-chips [data-question]' ? chips.querySelectorAll('[data-question]') : body.querySelectorAll(selector)
  };
  const calls = [], timers = new Map(), clears = [], typesets = [];
  const fetch = (url, settings) => {
    const pending = deferred(); calls.push({ url, settings, ...pending });
    return pending.promise;
  };
  let timerId = 0;
  const globalListeners = {}, originalAddEventListener = global.addEventListener;
  global.addEventListener = (name, callback) => { (globalListeners[name] ??= []).push(callback); };
  let controller;
  try { controller = createChatController(doc, {
    fetch, location: options.location || { protocol: 'https:', hostname: 'ce2407a.onrender.com' },
    setTimeout(callback, duration) { const id = ++timerId; timers.set(id, { callback, duration }); return id; },
    clearTimeout(id) { timers.delete(id); },
    math: { setText(node, text) { clears.push(node); node.textContent = text; }, typeset(node) { typesets.push(node); return Promise.resolve(); } }
  }); } finally {
    if (originalAddEventListener === undefined) delete global.addEventListener;
    else global.addEventListener = originalAddEventListener;
  }
  const health = async (configured, tutorials = ['tutorial1', 'tutorial2']) => {
    calls[0].resolve(response({ configured, tutorials })); await controller.ready;
  };
  const fireGlobal = name => (globalListeners[name] || []).forEach(callback => callback());
  return { controller, elements, add, doc, calls, timers, clears, typesets, health, fireGlobal };
}

test('assistant equations are isolated while markup and unsafe TeX stay plain text', () => {
  const parts = parseAssistantMessage(String.raw`Use <img src=x onerror=alert(1)> and \(P(A\mid B)=\frac{43}{50}\). Then \[\sum_i p_i=1\].`);
  assert.equal(parts.filter(p => p.tex).length, 2);
  assert.equal(parts.find(p => p.tex).fallback, 'P(A| B)=(43)/(50)');
  assert.equal(parts.filter(p => p.tex)[1].display, true);
  for (const command of ['href{https://example.com}{link}', 'require{html}', 'htmlClass{x}{y}', 'def\\x{\\x}\\x', 'newcommand{\\a}{b}', 'csname input\\endcsname', 'includegraphics{x}']) {
    assert.equal(safeMath(`\\${command}`), false);
    const value = `Unsafe \\(\\${command}\\)`;
    assert.deepEqual(parseAssistantMessage(value), [{ text: value }]);
  }
  assert.equal(safeMath(String.raw`\begin{aligned}P(A)&=0.4\\P(B)&=0.6\end{aligned}`), true);
  assert.equal(safeMath(String.raw`\begin{html}abc\end{html}`), false);
  assert.equal(safeMath(String.raw`P(A\triangle B)=30\%`), true);
  assert.equal(safeMath('x% hide following source'), false);
  assert.deepEqual(parseAssistantMessage('Unclosed \\(x+1'), [{ text: 'Unclosed \\(x+1' }]);
});

test('only local files and GitHub Pages use the configured API destination', () => {
  assert.equal(resolveApiBase({ protocol: 'https:', hostname: 'ce.onrender.com' }, 'https://other.example'), '');
  assert.equal(resolveApiBase({ protocol: 'http:', hostname: 'localhost' }, 'https://other.example'), '');
  assert.equal(resolveApiBase({ protocol: 'file:' }, 'https://ce.onrender.com/'), 'https://ce.onrender.com');
  assert.equal(resolveApiBase({ protocol: 'https:', hostname: 'jiaruilei.github.io' }, 'https://ce.onrender.com'), 'https://ce.onrender.com');
  for (const value of ['javascript:alert(1)', 'https://user:pass@example.com', 'https://example.com/?key=secret', 'invalid']) {
    assert.equal(resolveApiBase({ protocol: 'file:' }, value), '');
  }
});

test('a Tutorial 1 backend cannot appear ready or receive Tutorial 2 chat requests', async () => {
  for (const tutorials of [undefined, ['tutorial1'], 'tutorial2']) {
    const p = fixture();
    p.calls[0].resolve(response({ configured: true, tutorials }));
    await p.controller.ready;
    assert.equal(p.elements.coachStatus.textContent, 'Server unavailable');
    p.elements.coachQuestion.value = 'Explain the normal distribution';
    assert.equal(await p.controller.send(), false);
    assert.equal(p.elements.coachQuestion.value, 'Explain the normal distribution');
    assert.ok(p.calls.every(call => call.url.endsWith('/health')), 'old server receives no chat POST');
    p.calls[1].resolve(response({ configured: true, tutorials: ['tutorial1', 'tutorial2'] }));
    await settle();
    const request = p.controller.send();
    assert.equal(p.calls[2].url, '/api/chat');
    assert.equal(JSON.parse(p.calls[2].settings.body).tutorial, 'tutorial2');
    p.calls[2].resolve(response({ tutorial: 'tutorial2', answer: 'Use the normal model for Q3.' }));
    assert.equal(await request, true);
    assert.equal(p.elements.coachStatus.textContent, 'AI online');
  }
});

test('health readiness requires an explicitly configured Tutorial 2 backend', async () => {
  for (const [configured, tutorials, expected] of [
    [true, ['tutorial1', 'tutorial2'], 'AI online'],
    [false, ['tutorial1', 'tutorial2'], 'AI not configured'],
    [undefined, ['tutorial1', 'tutorial2'], 'Server unavailable'],
    [true, [], 'Server unavailable']
  ]) {
    const p = fixture();
    await p.health(configured, tutorials);
    assert.equal(p.elements.coachStatus.textContent, expected);
  }
});

test('Q9 deep links send Tutorial 2 and numeric context to the configured Pages API', async () => {
  const p = fixture({ initialQuestion: 'q9', location: { protocol: 'https:', hostname: 'jiaruilei.github.io' }, meta: 'https://ce2407a-tutorial1.onrender.com' });
  p.add('q9-n', 'input', { type: 'number', name: 'n' }, p.elements.q9).value = '10';
  p.add('privateNote', 'textarea', {}, p.elements.q9).value = 'Do not send this draft';
  await p.health(true);
  assert.equal(p.elements.coachQuestion.placeholder, 'Ask about Q9…');
  const pending = p.controller.send('Explain part (a).');
  assert.equal(p.calls[1].url, 'https://ce2407a-tutorial1.onrender.com/api/chat');
  const payload = JSON.parse(p.calls[1].settings.body);
  assert.equal(payload.question, 'q9');
  assert.equal(payload.tutorial, 'tutorial2');
  assert.deepEqual(payload.context, { fields: { n: '10' } });
  assert.doesNotMatch(p.calls[1].settings.body, /Do not send this draft/);
  p.calls[1].resolve(response({ tutorial: 'tutorial2', answer: 'Use 43/50.' }));
  await pending;
});

test('snapshots include only enabled numeric question inputs and exclude coach drafts or other question state', () => {
  const p = fixture();
  const rate = p.add('q6-rate', 'input', { type: 'number', name: 'rate' }, p.elements.q6); rate.value = '2.5';
  p.add('q6-limit', 'input', { type: 'number' }, p.elements.q6).value = '30';
  const disabled = p.add('disabled', 'input', { type: 'number' }, p.elements.q6); disabled.value = '99'; disabled.disabled = true;
  p.add('q6coach', 'textarea', {}, p.elements.q6).value = 'Unsent private draft';
  p.add('textField', 'input', { type: 'text' }, p.elements.q6).value = 'Free text';
  const radio = p.add('quiz', 'input', { name: 'q6quiz', type: 'radio' }, p.elements.q6); radio.value = 'wrong';
  radio.checked = true;
  p.add('otherQuestion', 'input', { type: 'number', name: 'rate' }, p.elements.q7).value = '10';
  p.add('prototype', 'input', { type: 'number', name: '__proto__' }, p.elements.q6).value = 'bad';
  p.add('constructor', 'input', { type: 'number', name: 'constructor' }, p.elements.q6).value = 'bad';
  assert.deepEqual(snapshotQuestion(p.doc, 'q6'), { fields: { rate: '2.5', 'q6-limit': '30' } });
  assert.deepEqual(snapshotQuestion(p.doc, 'q10'), { fields: {} });
  assert.deepEqual(snapshotQuestion(p.doc, 'coachLog'), { fields: {} });
});

test('browser back and forward navigation restores each question draft', async () => {
  const p = fixture({ initialQuestion: 'q9' }); await p.health(true);
  p.elements.coachQuestion.value = 'My Q9 draft';
  p.elements.tab1.fire('click');
  p.elements.coachQuestion.value = 'My Q1 draft';
  p.elements.tab1.setAttribute('aria-current', 'false');
  p.elements.tab9.setAttribute('aria-current', 'true');
  p.fireGlobal('popstate');
  assert.equal(p.elements.coachQuestion.placeholder, 'Ask about Q9…');
  assert.equal(p.elements.coachQuestion.value, 'My Q9 draft');
  p.elements.tab1.fire('click');
  assert.equal(p.elements.coachQuestion.value, 'My Q1 draft');
});

test('question switching preserves drafts and replies arrive in their original conversation', async () => {
  const p = fixture(); await p.health(true);
  p.elements.coachQuestion.value = 'My first question';
  const request = p.controller.send();
  assert.equal(await p.controller.send('duplicate'), false);
  assert.equal(p.calls.length, 2);
  assert.equal(JSON.parse(p.calls[1].settings.body).question, 'q1');
  p.elements.coachQuestion.value = 'Next Q1 draft';
  p.elements.tab2.fire('click');
  assert.equal(p.elements.coachQuestion.value, '');
  p.elements.coachQuestion.value = 'Q2 draft';
  p.calls[1].resolve(response({ tutorial: 'tutorial2', answer: 'Answer for Q1.' })); await request;
  assert.doesNotMatch(p.elements.coachLog.textContent, /Answer for Q1/);
  p.elements.tab1.fire('click');
  assert.match(p.elements.coachLog.textContent, /Answer for Q1/);
  assert.equal(p.elements.coachQuestion.value, 'Next Q1 draft');
  p.elements.tab2.fire('click'); assert.equal(p.elements.coachQuestion.value, 'Q2 draft');
  const other = p.controller.send();
  assert.deepEqual(JSON.parse(p.calls[2].settings.body).history, []);
  p.calls[2].resolve(response({ tutorial: 'tutorial2', answer: 'Answer for Q2.' })); await other;
  p.elements.tab1.fire('click');
  const followup = p.controller.send();
  assert.deepEqual(JSON.parse(p.calls[3].settings.body).history, [
    { role: 'user', content: 'My first question' },
    { role: 'assistant', content: 'Answer for Q1.' }
  ]);
  p.calls[3].resolve(response({ tutorial: 'tutorial2', answer: 'Q1 follow-up.' })); await followup;
});

test('clear aborts the request and ignores its late completion', async () => {
  const p = fixture(); await p.health(true);
  const request = p.controller.send('Explain Q1');
  p.controller.clear();
  assert.equal(p.calls[1].settings.signal.aborted, true);
  const next = p.controller.send('Start again');
  assert.deepEqual(JSON.parse(p.calls[2].settings.body).history, []);
  p.calls[1].resolve(response({ tutorial: 'tutorial2', answer: 'Late answer' }));
  assert.equal(await request, false);
  assert.doesNotMatch(p.elements.coachLog.textContent, /Late answer|Explain Q1/);
  assert.equal(p.elements.coachSend.disabled, true, 'old completion cannot end the new request');
  p.calls[2].resolve(response({ tutorial: 'tutorial2', answer: 'Fresh reply' })); await next;
  assert.ok(p.clears.length >= 4, 'MathJax cleanup runs before every log replacement');
});

test('rate errors restore the sent input for retry and exclude failed turns from API history', async () => {
  const p = fixture(); await p.health(true);
  p.elements.coachQuestion.value = 'Please help';
  const first = p.controller.send(); p.calls[1].resolve(response({ error: 'limit' }, 429));
  assert.equal(await first, false);
  assert.equal(p.elements.coachQuestion.value, 'Please help');
  assert.equal(p.elements.coachStatus.textContent, 'Rate limit · retry');
  assert.match(p.elements.coachLog.textContent, /Too many requests/);
  assert.equal(p.elements.coachSend.disabled, false);
  const retry = p.controller.send();
  assert.deepEqual(JSON.parse(p.calls[2].settings.body).history, []);
  p.calls[2].resolve(response({ tutorial: 'tutorial2', answer: 'Try a conditional probability.' })); await retry;
  assert.equal(p.elements.coachStatus.textContent, 'AI online');
});

test('missing or incorrect tutorial identifiers never reveal an answer and remain retryable', async () => {
  for (const tutorial of [undefined, 'tutorial1']) {
    const p = fixture(); await p.health(true);
    p.elements.coachQuestion.value = 'Explain Q1';
    const first = p.controller.send();
    p.calls[1].resolve(response({ tutorial, answer: 'Answer from an incompatible tutorial.' }));
    assert.equal(await first, false);
    assert.doesNotMatch(p.elements.coachLog.textContent, /Answer from an incompatible tutorial/);
    assert.equal(p.elements.coachQuestion.value, 'Explain Q1');
    assert.equal(p.elements.coachSend.disabled, false);
    assert.equal(p.elements.coachStatus.textContent, 'AI unavailable');
    const retry = p.controller.send();
    assert.equal(p.calls[2].url, '/api/chat');
    assert.deepEqual(JSON.parse(p.calls[2].settings.body).history, []);
    p.calls[2].resolve(response({ tutorial: 'tutorial2', answer: 'The correct Tutorial 2 reply.' }));
    assert.equal(await retry, true);
    assert.match(p.elements.coachLog.textContent, /The correct Tutorial 2 reply/);
  }
});

test('a failure in another question restores its draft without overwriting the active input', async () => {
  const p = fixture(); await p.health(true);
  p.elements.coachQuestion.value = 'Saved request'; const request = p.controller.send();
  p.elements.tab3.fire('click'); p.elements.coachQuestion.value = 'Unrelated draft';
  p.calls[1].reject(new TypeError('Network error')); await request;
  assert.equal(p.elements.coachQuestion.value, 'Unrelated draft');
  p.elements.tab1.fire('click'); assert.equal(p.elements.coachQuestion.value, 'Saved request');
});

test('health and request timeouts use cold-start limits and truthful unavailable states', async () => {
  const p = fixture();
  assert.equal([...p.timers.values()][0].duration, 90000);
  await p.health(false); assert.equal(p.elements.coachStatus.textContent, 'AI not configured');
  const request = p.controller.send('Hello');
  const timeout = [...p.timers.values()][0]; assert.equal(timeout.duration, 65000);
  timeout.callback(); assert.equal(p.calls[1].settings.signal.aborted, true);
  p.calls[1].reject(Object.assign(new Error('aborted'), { name: 'AbortError' })); await request;
  assert.equal(p.elements.coachStatus.textContent, 'AI unavailable');
  assert.match(p.elements.coachLog.textContent, /timed out/);
  assert.equal(p.elements.coachSend.disabled, false);
});

test('assistant HTML is never inserted, user TeX stays plain and valid reply math is scoped', async () => {
  const p = fixture(); await p.health(true);
  const request = p.controller.send(String.raw`User \(x\) <img>`);
  p.calls[1].resolve(response({ tutorial: 'tutorial2', answer: String.raw`Answer <img> \(\frac{1}{2}\) and \(\href{https://example.com}{x}\).` })); await request;
  const [user, assistant] = p.elements.coachLog.children;
  assert.equal(user.children.length, 0);
  assert.equal(assistant.querySelectorAll('[data-tex]').length, 1);
  assert.equal(assistant.querySelector('[data-tex]').getAttribute('data-tex'), String.raw`\frac{1}{2}`);
  assert.match(assistant.textContent, /<img>/);
  assert.equal(assistant.querySelectorAll('img').length, 0);
});

test('history stays at eight bounded messages and chips preserve an unsent draft', async () => {
  const p = fixture(); await p.health(true);
  for (let i = 0; i < 6; i++) {
    const request = p.controller.send(`Question ${i}`);
    const call = p.calls.at(-1), payload = JSON.parse(call.settings.body);
    assert.ok(payload.history.length <= 8);
    assert.ok(payload.history.every(item => item.content.length <= 1000));
    call.resolve(response({ tutorial: 'tutorial2', answer: 'a'.repeat(1200) })); await request;
  }
  p.elements.coachQuestion.value = 'An unfinished thought';
  const chip = p.controller.send('Explain the formula.');
  assert.equal(p.elements.coachQuestion.value, 'An unfinished thought');
  assert.equal(JSON.parse(p.calls.at(-1).settings.body).history.length, 8);
  p.calls.at(-1).resolve(response({ tutorial: 'tutorial2', answer: 'A formula.' })); await chip;
  assert.equal(p.elements.coachQuestion.value, 'An unfinished thought');
  const count = p.calls.length;
  assert.equal(await p.controller.send('x'.repeat(801)), false);
  assert.equal(p.calls.length, count);
});

test('Enter submits, Shift+Enter and IME composition retain multiline editing', async () => {
  const p = fixture(); await p.health(true);
  p.elements.coachQuestion.value = 'Question';
  assert.equal(p.elements.coachQuestion.fire('keydown', { key: 'Enter', shiftKey: true }).prevented, undefined);
  assert.equal(p.elements.coachQuestion.fire('keydown', { key: 'Enter', isComposing: true }).prevented, undefined);
  assert.equal(p.calls.length, 1);
  assert.equal(p.elements.coachQuestion.fire('keydown', { key: 'Enter' }).prevented, true);
  assert.equal(p.calls.length, 2);
  p.calls[1].resolve(response({ tutorial: 'tutorial2', answer: 'Reply' }));
});

test('a delayed startup health result cannot overwrite a successful live reply', async () => {
  const p = fixture();
  assert.equal(await p.controller.send('Hello'), false);
  p.calls[1].resolve(response({ configured: true, tutorials: ['tutorial1', 'tutorial2'] }));
  await settle();
  const request = p.controller.send('Hello');
  p.calls[2].resolve(response({ tutorial: 'tutorial2', answer: 'Ready.' })); await request;
  assert.equal(p.elements.coachStatus.textContent, 'AI online');
  await p.health(false, []);
  assert.equal(p.elements.coachStatus.textContent, 'AI online');
  const followup = p.controller.send('Follow up');
  assert.equal(p.calls[3].url, '/api/chat', 'an older health response cannot disable later chat requests');
  p.calls[3].resolve(response({ tutorial: 'tutorial2', answer: 'Still ready.' }));
  assert.equal(await followup, true);
});
