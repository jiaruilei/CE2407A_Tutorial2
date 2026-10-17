/* Accessible SVG illustrations for the Tutorial 2 calculators. No dependencies. */
(function (root, factory) {
  'use strict';
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TutorialCharts = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const C = { blue: '#2563eb', orange: '#b45309', ink: '#142033', muted: '#5d6b7d', grid: '#dce4ee', pale: '#dbeafe', risk: '#f5d4b5' };
  let serial = 0;
  function number(v, names, fallback) {
    for (const name of names) if (v[name] !== undefined && Number.isFinite(Number(v[name]))) return Number(v[name]);
    return fallback;
  }
  function fmt(v) {
    if (!Number.isFinite(v)) return '';
    if (v === 0) return '0';
    if (Math.abs(v) < 0.001 || Math.abs(v) >= 1e5) return v.toExponential(1);
    return String(Number(v.toPrecision(3)));
  }
  function pct(v) { return Number.isFinite(v) ? (100 * v).toFixed(v < 0.01 ? 3 : 2) + '%' : ''; }
  function el(doc, name, attrs, content) {
    const node = doc.createElementNS(NS, name);
    for (const [key, value] of Object.entries(attrs || {})) node.setAttribute(key, String(value));
    if (content !== undefined) node.textContent = content;
    return node;
  }
  function add(parent, name, attrs, content) {
    const node = el(parent.ownerDocument, name, attrs, content); parent.appendChild(node); return node;
  }
  function html(parent, name, content) {
    const node = parent.ownerDocument.createElement(name); if (content !== undefined) node.textContent = content; parent.appendChild(node); return node;
  }
  function text(parent, x, y, content, attrs) { return add(parent, 'text', Object.assign({ x, y, fill: C.muted, 'font-size': 13 }, attrs), content); }
  function figure(container, title, description, note) {
    const fig = html(container, 'figure'); fig.className = 'tutorial-chart';
    Object.assign(fig.style, { margin: '0 0 18px', padding: '14px', border: '1px solid ' + C.grid, borderRadius: '12px', background: '#fff', minWidth: '0' });
    const heading = html(fig, 'figcaption', title); Object.assign(heading.style, { fontSize: '16px', fontWeight: '700', color: C.ink, marginBottom: '8px' });
    const svg = add(fig, 'svg', { viewBox: '0 0 560 300', role: 'img', 'aria-labelledby': 'chart-title-' + (++serial) + ' chart-desc-' + serial, preserveAspectRatio: 'xMidYMid meet' });
    Object.assign(svg.style, { display: 'block', width: '100%', height: 'auto', overflow: 'visible', fontFamily: 'inherit' });
    add(svg, 'title', { id: 'chart-title-' + serial }, title);
    add(svg, 'desc', { id: 'chart-desc-' + serial }, description);
    if (note) { const para = html(fig, 'p', note); Object.assign(para.style, { margin: '6px 0 0', color: C.muted, fontSize: '14px', lineHeight: '1.45' }); }
    return { fig, svg };
  }
  function legend(fig, entries) {
    const row = html(fig, 'div'); Object.assign(row.style, { display: 'flex', flexWrap: 'wrap', gap: '5px 18px', fontSize: '13px', color: C.muted, marginTop: '6px' });
    for (const entry of entries) {
      const item = html(row, 'span'); Object.assign(item.style, { display: 'inline-flex', alignItems: 'center', gap: '6px' });
      const swatch = html(item, 'span'); Object.assign(swatch.style, { display: 'inline-block', width: '16px', height: '4px', background: entry[1], borderRadius: '2px' });
      html(item, 'span', entry[0]);
    }
  }
  function plot(container, title, description, options) {
    const frame = figure(container, title, description, options.note);
    const svg = frame.svg, x0 = 64, x1 = 539, y0 = 38, y1 = 246;
    const xmin = options.xmin, xmax = options.xmax, ymax = options.ymax > 0 ? options.ymax : 1;
    const X = x => x0 + (x - xmin) / (xmax - xmin) * (x1 - x0);
    const Y = y => y1 - y / ymax * (y1 - y0);
    const clipId = 'chart-clip-' + serial;
    const defs = add(svg, 'defs'); add(add(defs, 'clipPath', { id: clipId }), 'rect', { x: x0, y: y0, width: x1 - x0, height: y1 - y0 });
    for (let i = 0; i <= 4; i++) {
      const value = ymax * i / 4, y = Y(value);
      add(svg, 'line', { x1: x0, y1: y, x2: x1, y2: y, stroke: C.grid, 'stroke-width': 1 });
      text(svg, x0 - 8, y + 4, (options.yFormat || fmt)(value), { 'text-anchor': 'end' });
    }
    const ticks = options.xticks || Array.from({ length: 6 }, (_, i) => xmin + (xmax - xmin) * i / 5);
    for (const tick of ticks) {
      const value = typeof tick === 'object' ? tick.value : tick;
      const label = typeof tick === 'object' ? tick.label : (options.xFormat || fmt)(tick);
      add(svg, 'line', { x1: X(value), y1, x2: X(value), y2: y1 + 5, stroke: C.muted });
      text(svg, X(value), y1 + 22, label, { 'text-anchor': 'middle', 'font-size': ticks.length > 14 ? 11 : 13 });
    }
    add(svg, 'line', { x1: x0, y1, x2: x1, y2: y1, stroke: C.muted });
    add(svg, 'line', { x1: x0, y1: y0, x2: x0, y2: y1, stroke: C.muted });
    text(svg, x0, 18, options.ylabel || 'Probability density', { fill: C.ink, 'font-size': 13 });
    text(svg, (x0 + x1) / 2, 291, options.xlabel || '', { fill: C.ink, 'text-anchor': 'middle', 'font-size': 13 });
    const layer = add(svg, 'g', { 'clip-path': 'url(#' + clipId + ')' });
    function path(points, attrs) {
      const clean = points.filter(p => Number.isFinite(p[0]) && Number.isFinite(p[1]));
      if (!clean.length) return;
      return add(layer, 'path', Object.assign({ d: clean.map((p, i) => (i ? 'L' : 'M') + X(p[0]).toFixed(2) + ',' + Y(p[1]).toFixed(2)).join(' '), fill: 'none', stroke: C.blue, 'stroke-width': 2.6, 'stroke-linejoin': 'round' }, attrs));
    }
    function samples(fn, from, to, count) {
      return Array.from({ length: (count || 180) + 1 }, (_, i) => { const x = from + (to - from) * i / (count || 180); return [x, fn(x)]; });
    }
    function curve(fn, color, from, to) { return path(samples(fn, from === undefined ? xmin : from, to === undefined ? xmax : to), { stroke: color || C.blue }); }
    function shade(fn, from, to, color) {
      from = Math.max(xmin, from); to = Math.min(xmax, to); if (!(to > from)) return;
      return path([[from, 0], ...samples(fn, from, to), [to, 0]], { fill: color || C.risk, stroke: 'none', 'fill-opacity': 0.7 });
    }
    function marker(x, label, color, labelY = 33) {
      if (x < xmin || x > xmax) return;
      add(layer, 'line', { x1: X(x), y1: y0, x2: X(x), y2: y1, stroke: color || C.orange, 'stroke-width': 1.6, 'stroke-dasharray': '5 4' });
      if (label) text(svg, Math.max(x0 + 4, Math.min(x1 - 4, X(x))), labelY, label, { fill: color || C.orange, 'text-anchor': x > (xmin + xmax) / 2 ? 'end' : 'start', 'font-size': 12 });
    }
    return Object.assign(frame, { X, Y, layer, xmin, xmax, ymax, path, curve, shade, marker });
  }
  function bars(container, title, probabilities, options) {
    options = options || {};
    const max = Math.max(...probabilities, 0.1);
    const ticks = probabilities.map((p, i) => ({ value: i, label: options.labels ? options.labels[i] : String(i) }));
    const chart = plot(container, title, options.description || probabilities.map((p, i) => (options.labels ? options.labels[i] : i) + ': ' + fmt(p)).join('; '), {
      xmin: -0.6, xmax: probabilities.length - 0.4, ymax: Math.min(1, max * 1.2), ylabel: options.ylabel || 'Probability', xlabel: options.xlabel || 'Count', xticks: ticks.filter((t, i) => ticks.length <= 15 || i % Math.ceil(ticks.length / 12) === 0 || i === ticks.length - 1), note: options.note
    });
    const bw = (chart.X(1) - chart.X(0)) * 0.58;
    probabilities.forEach((p, i) => {
      const color = options.highlight && options.highlight(i) ? C.orange : C.blue;
      const bar = add(chart.layer, 'rect', { x: chart.X(i) - bw / 2, y: chart.Y(p), width: bw, height: chart.Y(0) - chart.Y(p), fill: color, rx: 2 });
      add(bar, 'title', {}, (options.labels ? options.labels[i] : i) + ': ' + fmt(p));
      if (probabilities.length < 13) text(chart.svg, chart.X(i), chart.Y(p) - 7, fmt(p), { 'text-anchor': 'middle', fill: color, 'font-size': 12 });
    });
    if (options.legend) legend(chart.fig, options.legend);
    return chart;
  }
  function normal(x, mu, sd) {
    if (root.TutorialCalc && root.TutorialCalc.normalPDF) return root.TutorialCalc.normalPDF(x, mu, sd);
    return Math.exp(-0.5 * Math.pow((x - mu) / sd, 2)) / (sd * Math.sqrt(2 * Math.PI));
  }
  function poissonSeries(mu, stop) {
    const calc = root.TutorialCalc;
    let p = Math.exp(-mu), sum = 0; const probabilities = [];
    for (let i = 0; i < stop; i++) {
      if (calc && typeof calc.poissonPMF === 'function') p = calc.poissonPMF(i, mu);
      else if (i > 0) p *= mu / i;
      probabilities.push(p); sum += p;
    }
    probabilities.push(Math.max(0, 1 - sum));
    return probabilities;
  }
  function normalFailure(container, title, mean, sd, risk, xlabel, note) {
    const xmin = Math.min(mean - 4 * sd, -0.5 * sd), xmax = Math.max(mean + 4 * sd, 0.5 * sd);
    const pdf = x => normal(x, mean, sd);
    const chart = plot(container, title, 'Normal safety margin with mean ' + fmt(mean) + ' and standard deviation ' + fmt(sd) + '. The orange left tail below zero is the failure probability, ' + pct(risk) + '.', { xmin, xmax, ymax: pdf(mean) * 1.12, xlabel, note });
    chart.shade(pdf, xmin, 0); chart.curve(pdf); chart.marker(0, 'Failure boundary: 0');
    legend(chart.fig, [['Safety margin density', C.blue], ['Failure: ' + pct(risk), C.orange]]);
    return chart;
  }
  function q1(container, v, r) {
    bars(container, 'How many jobs will be won?', r.pmf, { xlabel: 'Number of jobs, x', ylabel: 'PMF  P(X = x)', highlight: i => i === 1 || i === 2, note: 'Orange bars represent 0 < X ≤ 2. Each bar is a probability, so the four heights sum to 1.', legend: [['Other outcomes', C.blue], ['1 or 2 jobs: ' + pct(r.between), C.orange]] });
    const cdf = r.cdf;
    const chart = plot(container, 'Cumulative probability', 'The right-continuous CDF jumps to ' + cdf.map(fmt).join(', ') + ' at x = 0, 1, 2, 3.', { xmin: -0.5, xmax: 3.5, ymax: 1.05, ylabel: 'CDF  F(x) = P(X ≤ x)', xlabel: 'Number of jobs, x', xticks: [0, 1, 2, 3], note: 'Filled dots include the jump value. Open dots show the value just before each jump.' });
    chart.path([[-0.5, 0], [0, 0]]);
    cdf.forEach((p, i) => chart.path([[i, p], [i === cdf.length - 1 ? 3.5 : i + 1, p]]));
    cdf.forEach((p, i) => {
      add(chart.layer, 'circle', { cx: chart.X(i), cy: chart.Y(i ? cdf[i - 1] : 0), r: 4, fill: '#fff', stroke: C.blue, 'stroke-width': 2 });
      add(chart.layer, 'circle', { cx: chart.X(i), cy: chart.Y(p), r: 4, fill: C.blue });
    });
  }
  function q2(container, v, r) {
    const a = number(v, ['lo', 'a', 'lower'], 10), b = number(v, ['hi', 'b', 'upper'], 20), cut = number(v, ['r', 'cutoff', 'threshold'], 15), width = b - a;
    const pdf = x => root.TutorialCalc ? root.TutorialCalc.quadraticPDF(x, a, b) : (x >= a && x <= b ? 6 * (x - a) * (b - x) / Math.pow(width, 3) : 0);
    const cdf = x => { if (root.TutorialCalc) return root.TutorialCalc.quadraticCDF(x, a, b); const u = Math.max(0, Math.min(1, (x - a) / width)); return 3 * u * u - 2 * u * u * u; };
    const chart = plot(container, 'Area under the density', 'The symmetric parabolic probability density on ' + a + ' to ' + b + '. The shaded area is P(R ≤ ' + fmt(cut) + ') = ' + fmt(cdf(cut)) + '.', { xmin: a - width * .08, xmax: b + width * .08, ymax: 1.5 / width * 1.18, xlabel: 'Value of R', note: 'A PDF height is a density. Probability is an area under the curve.' });
    chart.shade(pdf, a, cut, C.pale); chart.curve(pdf); chart.marker(cut, 'r = ' + fmt(cut), C.blue);
    legend(chart.fig, [['Density fR(r)', C.blue], ['Area to r: ' + pct(cdf(cut)), C.pale]]);
    const second = plot(container, 'The CDF accumulates that area', 'The CDF is 0 below ' + a + ', rises smoothly to 1, and stays at 1 above ' + b + '.', { xmin: a - width * .08, xmax: b + width * .08, ymax: 1.08, ylabel: 'Cumulative probability', xlabel: 'Value of R', note: 'Inside the interval, F(r) = 3u² − 2u³, where u = (r − ' + a + ')/' + fmt(width) + '.' });
    second.curve(cdf); second.marker(cut, 'F(r) = ' + fmt(cdf(cut)), C.blue);
    if (cut >= second.xmin && cut <= second.xmax) add(second.layer, 'circle', { cx: second.X(cut), cy: second.Y(cdf(cut)), r: 4, fill: C.blue });
  }
  function q3(container, v, r) {
    const mean = number(v, ['mean', 'mu', 'currentMean', 'mean0'], 200), sd = number(v, ['sd', 'sigma', 'currentSD', 'sd0'], 60), capacity = number(v, ['capacity', 'cap'], 350);
    const xmin = Math.min(mean - 4 * sd, r.futureMean - 4 * r.futureSD, capacity - sd), xmax = Math.max(mean + 4 * sd, r.futureMean + 4 * r.futureSD, capacity + sd);
    const now = x => normal(x, mean, sd), future = x => normal(x, r.futureMean, r.futureSD);
    const chart = plot(container, 'Traffic growth and runway capacity', 'The current normal traffic distribution and projected distribution are shown against runway capacity. Current congestion risk is ' + pct(r.currentRisk) + '; projected congestion risk is ' + pct(r.futureRisk) + '.', { xmin, xmax, ymax: Math.max(now(mean), future(r.futureMean)) * 1.16, xlabel: 'Peak-hour traffic (planes/hour)', note: 'Orange shading is projected traffic above capacity. The mean grows linearly; the COV stays constant.' });
    chart.shade(future, capacity, xmax); chart.curve(now, C.blue); chart.curve(future, C.orange); chart.marker(capacity, 'Capacity ' + fmt(capacity));
    legend(chart.fig, [['Present: ' + pct(r.currentRisk) + ' congestion', C.blue], ['Projected: ' + pct(r.futureRisk), C.orange]]);
  }
  function q4(container, v, r) {
    bars(container, 'How many storms occur in a year?', r.pmf, { xlabel: 'Storms per year, n', ylabel: 'PMF  P(N = n)', note: 'Annual flooding combines the storm-count probabilities with the chance of at least one flood in each case.' });
    const capacity = number(v, ['capacity', 'threshold', 'runoffCapacity'], 8), median = Math.exp(r.lambda);
    const xmin = 0, xmax = Math.max(Math.exp(r.lambda + 3.3 * r.zeta), capacity * 1.15), mode = Math.exp(r.lambda - r.zeta * r.zeta);
    const pdf = x => root.TutorialCalc ? root.TutorialCalc.lognormalPDF(x, r.lambda, r.zeta) : (x > 0 ? normal(Math.log(x), r.lambda, r.zeta) / x : 0);
    const chart = plot(container, 'Runoff from one storm', 'Lognormal runoff has median ' + fmt(median) + ' cubic feet per second. Flooding is the orange area above the capacity ' + capacity + ', with probability ' + pct(r.stormRisk) + '.', { xmin, xmax, ymax: pdf(mode) * 1.14, xlabel: 'Maximum runoff (cfs)', note: 'Per-storm risk: ' + pct(r.stormRisk) + '. Risk of one or more floods in a year: ' + pct(r.annualRisk) + '.' });
    chart.shade(pdf, capacity, xmax); chart.curve(pdf); chart.marker(capacity, 'Capacity ' + fmt(capacity) + ' cfs');
    legend(chart.fig, [['Runoff density', C.blue], ['Flooding in one storm', C.orange]]);
  }
  function q5(container, v, r) {
    const stop = Math.max(5, Math.min(20, Math.ceil(r.mu + 3 * Math.sqrt(r.mu + 1))));
    const labels = Array.from({ length: stop + 1 }, (_, i) => i === stop ? '≥' + stop : String(i));
    bars(container, 'Stations within the remaining driving range', poissonSeries(r.mu, stop), { labels, xlabel: 'Number of service stations', ylabel: 'Poisson probability', highlight: i => i < 2, note: 'Orange bars are 0 or 1 station: ' + pct(r.atMostOne) + '. The final bar groups all higher counts.', legend: [['0 or 1 station', C.orange], ['2 or more stations', C.blue]] });
    bars(container, 'Stations with gasoline available', poissonSeries(r.availableMu, stop), { labels, xlabel: 'Number of stations with gasoline', ylabel: 'Poisson probability', highlight: i => i === 0, note: 'Independent availability thins the Poisson process. Being stranded means zero stations with gasoline: ' + pct(r.stranded) + '.', legend: [['No usable station: stranded', C.orange], ['At least one usable station', C.blue]] });
  }
  function q6(container, v, r) {
    const rate = r.rate, xmax = Math.max(4 / rate, r.cycleHours * 1.3), density = x => rate * Math.exp(-rate * x);
    const chart = plot(container, 'Can the lock finish before the next arrival?', 'Exponential interarrival times at rate ' + fmt(rate) + ' per hour. The blue shaded tail beyond cycle time is the probability of no waiting: ' + pct(1 - r.waitProbability) + '.', { xmin: 0, xmax, ymax: rate * 1.12, xlabel: 'Interarrival time (hours)', note: 'A boat does not wait in the tutorial model when the interarrival time exceeds the lock cycle time.' });
    chart.shade(density, r.cycleHours, xmax, C.pale); chart.curve(density); chart.marker(r.cycleHours, 'Cycle: ' + fmt(r.cycleMinutes) + ' min', C.blue);
    legend(chart.fig, [['Interarrival density', C.blue], ['No waiting: ' + pct(1 - r.waitProbability), C.pale]]);
    bars(container, 'How many of the daily boats must wait?', r.pmf, { xlabel: 'Number of boats waiting', ylabel: 'Binomial probability', highlight: i => i >= 2, note: 'Independent waiting outcomes are assumed. Orange bars represent at least two boats waiting: ' + pct(r.atLeastTwo) + '.', legend: [['0 or 1 boat waits', C.blue], ['At least 2 wait', C.orange]] });
  }
  function q7(container, v, r) {
    const pdf = z => z > 0 ? Math.exp(-Math.sqrt(z)) / (2 * Math.sqrt(z)) : 0;
    const cdf = z => z > 0 ? 1 - Math.exp(-Math.sqrt(z)) : 0;
    const v0 = number(v, ['v0', 'meanVelocity'], 1), y = number(v, ['y', 'force'], r.k * v0 * v0), z = y / (r.k * v0 * v0);
    const xmax = Math.max(9, Math.min(25, z * 1.2));
    const chart = plot(container, 'Squared velocity changes the density', 'Normalized drag Z = Y divided by C times v0 squared has density exp(−sqrt(z))/(2 sqrt(z)). It grows without bound near zero but has no point mass there. The plot clips that unbounded peak.', { xmin: 0, xmax, ymax: 1.5, xlabel: 'Normalized drag, z = y / (C v₀²)', note: 'The PDF tends to infinity as z approaches 0. The peak is clipped for display; P(Y = 0) is still zero.' });
    const sampledDensity = end => Array.from({ length: 241 }, (_, i) => { const x = Math.pow(.001 + (Math.sqrt(end) - .001) * i / 240, 2); return [x, pdf(x)]; });
    if (z > 0.000001) chart.path([[.000001, 0], ...sampledDensity(Math.min(z, xmax)), [Math.min(z, xmax), 0]], { fill: C.pale, stroke: 'none', 'fill-opacity': .7 });
    chart.path(sampledDensity(xmax)); chart.marker(z, 'Selected z = ' + fmt(z), C.blue);
    text(chart.svg, chart.X(.12), 55, '↑ unbounded near 0', { fill: C.blue, 'font-size': 12 });
    const second = plot(container, 'Transformation preserves probability', 'The exact normalized CDF is 1 − exp(−sqrt(z)). It equals ' + fmt(cdf(z)) + ' at the selected normalized force ' + fmt(z) + '.', { xmin: 0, xmax, ymax: 1.05, ylabel: 'CDF  P(Z ≤ z)', xlabel: 'Normalized drag, z = y / (C v₀²)', note: 'P(Y ≤ y) = P(V ≤ √(y/C)). At the selected force, probability = ' + pct(cdf(z)) + '.' });
    second.curve(cdf); second.marker(z, 'F = ' + fmt(cdf(z)), C.blue);
  }
  function beam(container, v) {
    const frame = figure(container, 'Cantilever beam and its loads', 'A 10-foot beam is fixed at the left end. A uniformly distributed downward load W acts along its length and a downward point load P acts at its free right end. The fixed-end bending moment is M = 50W + 10P.', 'A 10 ft span gives M = W L²/2 + P L = 50W + 10P.');
    const s = frame.svg; s.setAttribute('viewBox', '0 0 560 230');
    const markerId = 'beam-arrow-' + (++serial), defs = add(s, 'defs');
    add(add(defs, 'marker', { id: markerId, markerWidth: 8, markerHeight: 8, refX: 6, refY: 3, orient: 'auto', markerUnits: 'strokeWidth' }), 'path', { d: 'M0,0 L6,3 L0,6', fill: C.blue });
    add(s, 'rect', { x: 70, y: 113, width: 420, height: 9, fill: '#cbd5e1', stroke: C.ink, 'stroke-width': 1.5 });
    add(s, 'line', { x1: 70, y1: 90, x2: 70, y2: 145, stroke: C.ink, 'stroke-width': 3 });
    for (let y = 92; y < 150; y += 9) add(s, 'line', { x1: 58, y1: y + 8, x2: 69, y2: y, stroke: C.muted });
    for (let x = 88; x <= 471; x += 38) add(s, 'line', { x1: x, y1: 78, x2: x, y2: 110, stroke: C.blue, 'stroke-width': 1.5, 'marker-end': 'url(#' + markerId + ')' });
    add(s, 'line', { x1: 88, y1: 78, x2: 471, y2: 78, stroke: C.blue, 'stroke-width': 1.3 });
    add(s, 'line', { x1: 490, y1: 40, x2: 490, y2: 109, stroke: C.blue, 'stroke-width': 2.5, 'marker-end': 'url(#' + markerId + ')' });
    text(s, 280, 60, 'Distributed load W (kips/ft)', { 'text-anchor': 'middle', fill: C.blue, 'font-size': 15 });
    text(s, 490, 29, 'P (kips)', { 'text-anchor': 'middle', fill: C.blue, 'font-size': 15 });
    add(s, 'line', { x1: 71, y1: 163, x2: 490, y2: 163, stroke: C.muted });
    [71, 490].forEach(x => add(s, 'line', { x1: x, y1: 156, x2: x, y2: 170, stroke: C.muted }));
    text(s, 280, 188, '10 ft', { 'text-anchor': 'middle', fill: C.ink, 'font-size': 15 });
    text(s, 75, 215, 'Fixed support', { fill: C.muted, 'font-size': 13 });
  }
  function q8(container, v, r) {
    beam(container, v);
    normalFailure(container, 'The safety margin R − M', r.meanMargin, r.sdMargin, r.failureRisk, 'Safety margin R − M (ft-kips)', 'Failure occurs when resistance is smaller than the applied moment. Correlation between W and P changes the spread of M.');
  }
  function q9(container, v, r) {
    normalFailure(container, 'Compare resistance and stress on a log scale', r.lambdaRatio, r.zetaRatio, r.failureRisk, 'Log safety ratio, ln(R/S)', 'Independent lognormal resistance and stress give a normal log ratio. Crushing occurs when ln(R/S) < 0, equivalent to R < S.');
    const area = number(v, ['area', 'A'], .16);
    const xmin = Math.max(.001, Math.min(area, r.requiredArea) * .45), xmax = Math.max(area, r.requiredArea) * 1.6;
    const calc = root.TutorialCalc;
    if (!calc) return;
    const Phi = calc.normalCDF || calc.normalCdf || calc.phi;
    if (typeof Phi !== 'function') return;
    const atArea = a => Phi(-(r.lambdaRatio + Math.log(a / area)) / r.zetaRatio);
    const target = number(v, ['target', 'targetRisk', 'targetProbability', 'targetFailure'], .001);
    const chart = plot(container, 'How cross-sectional area changes risk', 'Crushing probability decreases as the area increases. The required area for the chosen target probability is ' + fmt(r.requiredArea) + ' square metres.', { xmin, xmax, ymax: Math.max(atArea(xmin) * 1.08, target * 2), ylabel: 'Crushing probability', xlabel: 'Cross-sectional area (m²)', note: 'Required area: ' + fmt(r.requiredArea) + ' m²; equivalent square side: ' + fmt(r.requiredSide) + ' m. The curve uses the same load and resistance model.' });
    chart.curve(atArea); chart.marker(area, 'Chosen A = ' + fmt(area), C.blue); chart.marker(r.requiredArea, 'Target A = ' + fmt(r.requiredArea), C.orange, 51);
    chart.path([[xmin, target], [xmax, target]], { stroke: C.orange, 'stroke-width': 1.4, 'stroke-dasharray': '5 4' });
    legend(chart.fig, [['Crushing probability', C.blue], ['Target ' + pct(target), C.orange]]);
  }
  const renderers = { q1, q2, q3, q4, q5, q6, q7, q8, q9 };
  function render(container, qId, values, result) {
    if (typeof container === 'string') container = root.document.querySelector(container);
    if (!container) throw new Error('A chart container is required.');
    const key = 'q' + String(qId).replace(/^q/i, '');
    if (!renderers[key]) throw new Error('Unknown tutorial question: ' + qId);
    container.replaceChildren();
    renderers[key](container, values || {}, result || {});
  }
  return { render };
});
