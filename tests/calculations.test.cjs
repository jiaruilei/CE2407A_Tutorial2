'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const C = require('../docs/calculations.js');
function close(actual, expected, tolerance = 1e-12) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} differs from ${expected} by more than ${tolerance}`);
}
function sum(xs) { return xs.reduce((a, b) => a + b, 0); }

test('UMD loads in the browser without require or a build step', () => {
  const context = vm.createContext({});
  vm.runInContext(fs.readFileSync(require.resolve('../docs/calculations.js'), 'utf8'), context);
  close(context.TutorialCalc.calculate('q1').le2, .92);
});

test('normal CDF and inverse are accurate in the centre and tails', () => {
  close(C.normalCDF(0), .5);
  close(C.normalPDF(0), .3989422804014327);
  close(C.normalCDF(-1), .15865525393145707);
  close(C.normalCDF(-2.5), .006209665325776132);
  close(C.normalCDF(-8), 6.220960574271784e-16, 2e-29);
  close(C.normalCDF(100), 1); close(C.normalCDF(-100), 0);
  assert.equal(C.normalCDF(-Infinity), 0); assert.equal(C.normalCDF(Infinity), 1);
  close(C.inverseNormal(.001), -3.090232306167813, 1e-13);
  close(C.inverseNormal(.975), 1.959963984540054, 1e-13);
  assert.equal(C.inverseNormal(0), -Infinity); assert.equal(C.inverseNormal(1), Infinity);
  for (const p of [1e-14, 1e-8, .001, .1, .49, .5, .51, .9, .999, 1 - 1e-8]) {
    close(C.normalCDF(C.inverseNormal(p)), p, Math.max(1e-28, Math.min(p, 1 - p) * 1e-12));
  }
  assert.throws(() => C.normalCDF(0, 0, 0), RangeError);
  assert.throws(() => C.inverseNormal(1.1), RangeError);
  assert.throws(() => C.normalCDF(NaN), RangeError);
});

test('discrete distributions normalize and respect support and endpoint probabilities', () => {
  close(sum(Array.from({ length: 40 }, (_, k) => C.poissonPMF(k, 1.5))), 1);
  close(sum(Array.from({ length: 21 }, (_, k) => C.binomialPMF(k, 20, .2))), 1);
  assert.equal(C.poissonPMF(0, 0), 1); assert.equal(C.poissonPMF(1, 0), 0);
  assert.equal(C.binomialPMF(0, 4, 0), 1); assert.equal(C.binomialPMF(4, 4, 1), 1);
  assert.equal(C.binomialPMF(1, 4, 1), 0); assert.equal(C.binomialPMF(5, 4, .2), 0);
  assert.equal(C.poissonPMF(-1, 2), 0); assert.equal(C.poissonPMF(.5, 2), 0);
  assert.throws(() => C.poissonPMF(0, -1), RangeError);
  assert.throws(() => C.binomialPMF(0, 1.5, .1), RangeError);
});

test('Q1 exact default PMF/CDF and deterministic endpoints', () => {
  const r = C.calculate('q1');
  r.pmf.forEach((p, i) => close(p, [.08, .42, .42, .08][i]));
  r.cdf.forEach((p, i) => close(p, [.08, .5, .92, 1][i]));
  close(r.le2, .92); close(r.between, .84); close(r.mean, 1.5); close(r.variance, .57);
  assert.deepEqual(C.calculate('q1', { a: 0, b: 1, c: 1 }).pmf, [0, 0, 1, 0]);
});

test('Q2 PDF normalization, exact moments, symmetry and piecewise CDF', () => {
  const r = C.calculate('q2');
  close(r.c, .006); close(r.mean, 15); close(r.median, 15); close(r.mode, 15);
  close(r.variance, 5); close(r.sd, Math.sqrt(5)); close(r.cov, Math.sqrt(5) / 15);
  close(r.pdf, .15); close(r.cdf, .5); close(r.skewness, 0);
  assert.equal(C.quadraticCDF(9), 0); assert.equal(C.quadraticCDF(10), 0);
  assert.equal(C.quadraticCDF(20), 1); assert.equal(C.quadraticCDF(21), 1);
  assert.equal(C.quadraticPDF(9), 0); assert.equal(C.quadraticPDF(20), 0);
  // Simpson integration is exact for the quadratic density.
  close(10 / 6 * (C.quadraticPDF(10) + 4 * C.quadraticPDF(15) + C.quadraticPDF(20)), 1);
  close(C.quadraticCDF(12), 1 - C.quadraticCDF(18));
});

test('Q3 uses linear growth and retains the original congestion probability', () => {
  const r = C.calculate('q3');
  close(r.currentRisk, .006209665325776132); close(r.futureMean, 400); close(r.futureSD, 120);
  close(r.futureRisk, .6615388804893103); close(r.requiredCapacity, 700);
  close(C.normalCDF((r.futureMean - r.requiredCapacity) / r.futureSD), r.currentRisk);
  close(C.calculate('q3', { growth: 0 }).futureRisk, r.currentRisk);
});

test('Q4 exact lognormal parameters and total annual flood probability', () => {
  const r = C.calculate('q4');
  close(r.meanN, 1.1); close(r.varN, .89);
  close(r.lambda, Math.log(7)); close(r.zeta, Math.sqrt(Math.log1p(.15 ** 2)));
  // Independent reference: Python math.erfc with exact lognormal parameters.
  close(r.stormRisk, .18534430388354461, 1e-12);
  close(r.annualRisk, .18733918300432367, 1e-12);
  close(r.annualRisk, 1 - sum(r.pmf.map((p, n) => p * (1 - r.stormRisk) ** n)));
  close(C.calculate('q4', { capacity: 0 }).annualRisk, .7);
  assert.equal(C.calculate('q4', { p0: 1, p1: 0, p2: 0, p3: 0 }).annualRisk, 0);
  assert.equal(C.lognormalCDF(0, 1, .2), 0); assert.equal(C.lognormalPDF(0, 1, .2), 0);
  assert.throws(() => C.calculate('q4', { p0: .4 }), /sum to 1/);
});

test('Q5 thinning and zero-distance/availability boundaries', () => {
  const r = C.calculate('q5');
  close(r.mu, 1.5); close(r.availableMu, 1.2); close(r.atMostOne, 2.5 * Math.exp(-1.5));
  close(r.noGas, .008); close(r.stranded, Math.exp(-1.2));
  assert.equal(C.calculate('q5', { distance: 0 }).stranded, 1);
  assert.equal(C.calculate('q5', { empty: 1 }).stranded, 1);
  close(C.calculate('q5', { empty: 0 }).stranded, Math.exp(-1.5));
});

test('Q6 exponential survival and binomial waiting counts', () => {
  const r = C.calculate('q6');
  close(r.rate, 2); close(r.cycleHours, -.5 * Math.log(.8)); close(r.cycleMinutes, 6.694306539426291);
  close(r.noneWait, .4096); close(r.atLeastTwo, .1808); close(sum(r.pmf), 1);
  close(Math.exp(-r.rate * r.cycleHours), .8);
  assert.equal(C.calculate('q6', { boats: 0 }).atLeastTwo, 0);
  assert.equal(C.calculate('q6', { boats: 1 }).atLeastTwo, 0);
  assert.equal(C.calculate('q6', { service: 1 }).noneWait, 1);
  assert.throws(() => C.calculate('q6', { service: 0 }), /finite cycle/);
});

test('Q7 transformed distribution has correct Jacobian, support, moments and singular endpoint', () => {
  const r = C.calculate('q7');
  close(r.k, 500); close(r.velocity, 2); close(r.pdf, Math.exp(-1) / 4000);
  close(r.cdf, 1 - Math.exp(-1)); close(r.meanY, 4000); close(r.sdY, Math.sqrt(20) * 2000);
  const h = .01;
  close((C.calculate('q7', { y: 2000 + h }).cdf - C.calculate('q7', { y: 2000 - h }).cdf) / (2 * h), r.pdf, 1e-12);
  assert.equal(C.calculate('q7', { y: 0 }).pdf, Infinity); assert.equal(C.calculate('q7', { y: 0 }).cdf, 0);
  assert.equal(C.calculate('q7', { y: -1 }).pdf, 0); assert.equal(C.calculate('q7', { y: -1 }).cdf, 0);
});

test('Q8 covariance term and independent resistance margin', () => {
  const r = C.calculate('q8');
  close(r.covWP, .1); close(r.meanM, 100); close(r.varM, 300); close(r.sdM, Math.sqrt(300));
  close(r.meanMargin, 100); close(r.varMargin, 2800); close(r.failureRisk, .0293908606776794, 1e-12);
  close(C.calculate('q8', { corr: 0 }).varM, 200);
  close(C.calculate('q8', { corr: -1 }).varM, 0);
  close(C.calculate('q8', { meanR: 100 }).failureRisk, .5);
});

test('Q9 lognormal ratio and inverse design meet target without rounding', () => {
  const r = C.calculate('q9');
  close(r.meanS, 18750); close(r.covS, .2); close(r.zetaRatio, Math.sqrt(2 * Math.log(1.04)));
  close(r.lambdaRatio, Math.log(35000 / 18750));
  close(r.failureRisk, .012922468829268424, 1e-12);
  close(C.calculate('q9', { area: r.requiredArea }).failureRisk, .001, 1e-14);
  assert.ok(r.requiredArea > .2 && r.requiredArea < .21);
  close(r.requiredSide ** 2, r.requiredArea);
  assert.ok(C.calculate('q9', { area: .2 }).failureRisk < r.failureRisk);
  const unequal = C.calculate('q9', { covW: .3, covR: .1 });
  close(C.calculate('q9', { covW: .3, covR: .1, area: unequal.requiredArea }).failureRisk, .001, 1e-14);
});

test('invalid, missing, nonnumeric and physically invalid inputs produce useful errors', () => {
  for (const [q, values] of [
    ['q1', { a: -1 }], ['q1', { a: NaN }], ['q1', { a: undefined }], ['q1', { a: '.5' }],
    ['q2', { lo: 20, hi: 10 }], ['q2', { lo: -1 }], ['q3', { mean: 0 }], ['q3', { sd: 0 }],
    ['q4', { cov: 0 }], ['q4', { capacity: -1 }], ['q5', { distance: -1 }], ['q5', { empty: 1.1 }],
    ['q6', { boats: 2.5 }], ['q6', { boats: 1001 }], ['q7', { v0: 0 }], ['q7', { cd: 0 }],
    ['q8', { corr: 1.1 }], ['q8', { sdR: 0 }], ['q9', { area: 0 }], ['q9', { target: 0 }],
    ['q9', { target: 1 }], ['q9', { meanR: Infinity }]
  ]) assert.throws(() => C.calculate(q, values), RangeError, `${q} ${JSON.stringify(values)}`);
  assert.throws(() => C.calculate('q10'), RangeError);
});

