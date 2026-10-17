/* CE2407A Tutorial 2: pure calculations. All inputs use the units shown on the page. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.TutorialCalc = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const SQRT2PI = Math.sqrt(2 * Math.PI);
  const DEFAULTS = Object.freeze(Object.fromEntries(Object.entries({
    q1: { a: .5, b: .8, c: .2 },
    q2: { lo: 10, hi: 20, r: 15 },
    q3: { mean: 200, sd: 60, capacity: 350, growth: .1, years: 10 },
    q4: { p0: .3, p1: .4, p2: .2, p3: .1, median: 7, cov: .15, capacity: 8 },
    q5: { rate: .1, distance: 15, empty: .2, stations: 3 },
    q6: { mean: .5, service: .8, boats: 4 },
    q7: { cd: 1, rho: 1000, area: 1, v0: 2, y: 2000 },
    q8: { meanW: 1, sdW: .2, meanP: 5, sdP: 1, corr: .5, meanR: 200, sdR: 50 },
    q9: { meanW: 3000, covW: .2, meanR: 35000, covR: .2, area: .16, target: .001 }
  }).map(([key, value]) => [key, Object.freeze(value)])));

  function finite(value, label) {
    if (typeof value !== 'number' || !Number.isFinite(value)) throw new RangeError(`${label} must be a finite number.`);
    return value;
  }
  function nonnegative(value, label) {
    finite(value, label);
    if (value < 0) throw new RangeError(`${label} must be zero or greater.`);
    return value;
  }
  function positive(value, label) {
    finite(value, label);
    if (value <= 0) throw new RangeError(`${label} must be greater than zero.`);
    return value;
  }
  function probability(value, label, interior = false) {
    finite(value, label);
    if (interior ? value <= 0 || value >= 1 : value < 0 || value > 1) {
      throw new RangeError(`${label} must be ${interior ? 'strictly between 0 and 1' : 'between 0 and 1, inclusive'}.`);
    }
    return value;
  }
  function count(value, label, maximum = 100000) {
    nonnegative(value, label);
    if (!Number.isSafeInteger(value) || value > maximum) throw new RangeError(`${label} must be a whole number from 0 to ${maximum}.`);
    return value;
  }
  function realOrInfinity(value, label) {
    if (typeof value !== 'number' || Number.isNaN(value)) throw new RangeError(`${label} must be a number.`);
  }
  function checkedResult(result, allowInfinite = []) {
    Object.entries(result).forEach(([key, value]) => {
      if (typeof value === 'number' && !Number.isFinite(value) && !allowInfinite.includes(key)) {
        throw new RangeError('These inputs are too large or too small for a reliable calculation. Choose more moderate values.');
      }
    });
    return result;
  }

  function normalPDF(x, mean = 0, sd = 1) {
    realOrInfinity(x, 'Evaluation point'); finite(mean, 'Mean'); positive(sd, 'Standard deviation');
    const z = (x - mean) / sd;
    return Math.exp(-.5 * z * z) / (sd * SQRT2PI);
  }

  // Q(1/2,x), evaluated by a convergent series near zero and a continued
  // fraction in the tail. This avoids subtraction of nearly equal CDF values.
  function gammaHalfQ(x) {
    if (x === 0) return 1;
    if (x >= 800) return 0;
    const scale = Math.exp(-x + .5 * Math.log(x) - .5 * Math.log(Math.PI));
    if (x < 1.5) {
      let term = 2, sum = 2, a = .5;
      for (let n = 1; n < 1000; n++) {
        a += 1; term *= x / a; sum += term;
        if (Math.abs(term) < Math.abs(sum) * 2e-16) break;
      }
      return 1 - scale * sum;
    }
    const tiny = 1e-300;
    let b = x + .5, c = 1 / tiny, d = 1 / b, h = d;
    for (let n = 1; n < 1000; n++) {
      const a = -n * (n - .5);
      b += 2; d = a * d + b;
      if (Math.abs(d) < tiny) d = tiny;
      c = b + a / c;
      if (Math.abs(c) < tiny) c = tiny;
      d = 1 / d;
      const delta = d * c; h *= delta;
      if (Math.abs(delta - 1) < 2e-15) break;
    }
    return scale * h;
  }
  function normalCDF(x, mean = 0, sd = 1) {
    realOrInfinity(x, 'Evaluation point'); finite(mean, 'Mean'); positive(sd, 'Standard deviation');
    const z = (x - mean) / sd;
    if (z === 0) return .5;
    const tail = .5 * gammaHalfQ(.5 * z * z);
    return z < 0 ? tail : 1 - tail;
  }
  // Acklam's rational starting value, refined against the CDF in the lower
  // tail. Reflecting upper-tail inputs keeps the refinement numerically stable.
  function inverseNormal(p) {
    probability(p, 'CDF probability');
    if (p === 0) return -Infinity;
    if (p === 1) return Infinity;
    if (p === .5) return 0;
    if (p > .5) return -inverseNormal(1 - p);
    const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
    const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
    const c = [-.007784894002430293, -.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
    const d = [.007784695709041462, .3224671290700398, 2.445134137142996, 3.754408661907416];
    const poly = (xs, x) => xs.reduce((acc, coefficient) => acc * x + coefficient, 0);
    let z;
    if (p < .02425) {
      const q = Math.sqrt(-2 * Math.log(p));
      z = poly(c, q) / (poly(d, q) * q + 1);
    } else {
      const q = p - .5, r = q * q;
      z = poly(a, r) * q / (poly(b, r) * r + 1);
    }
    for (let n = 0; n < 2; n++) {
      const density = normalPDF(z);
      if (density === 0) break;
      const adjustment = (normalCDF(z) - p) / density;
      z -= adjustment / (1 + z * adjustment / 2);
    }
    return z;
  }
  function lognormalPDF(x, lambda, zeta) {
    realOrInfinity(x, 'Evaluation point'); finite(lambda, 'Log mean'); positive(zeta, 'Log standard deviation');
    if (x <= 0 || x === Infinity) return 0;
    return normalPDF(Math.log(x), lambda, zeta) / x;
  }
  function lognormalCDF(x, lambda, zeta) {
    realOrInfinity(x, 'Evaluation point'); finite(lambda, 'Log mean'); positive(zeta, 'Log standard deviation');
    return x <= 0 ? 0 : normalCDF(Math.log(x), lambda, zeta);
  }
  function logFactorial(n) {
    if (n < 2) return 0;
    if (n < 256) {
      let sum = 0;
      for (let k = 2; k <= n; k++) sum += Math.log(k);
      return sum;
    }
    // Stirling with correction terms; error is below floating-point precision
    // at this threshold for the supported integer range.
    const inv = 1 / n, inv2 = inv * inv;
    return (n + .5) * Math.log(n) - n + .5 * Math.log(2 * Math.PI) + inv / 12 - inv * inv2 / 360 + inv * inv2 * inv2 / 1260;
  }
  function poissonPMF(k, mu) {
    finite(k, 'Count'); nonnegative(mu, 'Poisson mean');
    if (k < 0 || !Number.isInteger(k)) return 0;
    count(k, 'Count');
    if (mu === 0) return k === 0 ? 1 : 0;
    return Math.exp(k * Math.log(mu) - mu - logFactorial(k));
  }
  function binomialPMF(k, n, p) {
    finite(k, 'Count'); count(n, 'Number of trials'); probability(p, 'Success probability');
    if (k < 0 || k > n || !Number.isInteger(k)) return 0;
    if (p === 0) return k === 0 ? 1 : 0;
    if (p === 1) return k === n ? 1 : 0;
    if (n === 0) return 1;
    return Math.exp(logFactorial(n) - logFactorial(k) - logFactorial(n - k) + k * Math.log(p) + (n - k) * Math.log1p(-p));
  }
  function quadraticBounds(lo, hi) {
    nonnegative(lo, 'Lower bound'); positive(hi, 'Upper bound');
    if (hi <= lo) throw new RangeError('Upper bound must exceed lower bound.');
  }
  function quadraticPDF(r, lo = 10, hi = 20) {
    realOrInfinity(r, 'Evaluation point'); quadraticBounds(lo, hi);
    if (r <= lo || r >= hi) return 0;
    const width = hi - lo, t = (r - lo) / width;
    return 6 * t * (1 - t) / width;
  }
  function quadraticCDF(r, lo = 10, hi = 20) {
    realOrInfinity(r, 'Evaluation point'); quadraticBounds(lo, hi);
    if (r <= lo) return 0;
    if (r >= hi) return 1;
    const t = (r - lo) / (hi - lo);
    return t * t * (3 - 2 * t);
  }

  function calculate(qId, supplied = {}) {
    if (!Object.prototype.hasOwnProperty.call(DEFAULTS, qId)) throw new RangeError('Choose a question from q1 to q9.');
    if (!supplied || typeof supplied !== 'object' || Array.isArray(supplied)) throw new TypeError('Question inputs must be an object.');
    const v = { ...DEFAULTS[qId], ...supplied };
    Object.keys(DEFAULTS[qId]).forEach(key => finite(v[key], key));
    if (qId === 'q1') {
      const ps = [v.a, v.b, v.c]; ps.forEach((p, i) => probability(p, `P(${'ABC'[i]})`));
      let pmf = [1];
      for (const p of ps) {
        const next = Array(pmf.length + 1).fill(0);
        pmf.forEach((mass, k) => { next[k] += mass * (1 - p); next[k + 1] += mass * p; });
        pmf = next;
      }
      let sum = 0; const cdf = pmf.map(p => sum += p);
      return { pmf, cdf, le2: pmf[0] + pmf[1] + pmf[2], between: pmf[1] + pmf[2], mean: ps.reduce((s, p) => s + p, 0), variance: ps.reduce((s, p) => s + p * (1 - p), 0) };
    }
    if (qId === 'q2') {
      quadraticBounds(v.lo, v.hi);
      const width = v.hi - v.lo, mean = v.lo + width / 2, variance = width * width / 20, sd = Math.sqrt(variance);
      return checkedResult({ c: 6 / (width * width * width), mean, median: mean, mode: mean, variance, sd, cov: sd / mean, skewness: 0, pdf: quadraticPDF(v.r, v.lo, v.hi), cdf: quadraticCDF(v.r, v.lo, v.hi) });
    }
    if (qId === 'q3') {
      positive(v.mean, 'Current mean'); positive(v.sd, 'Current standard deviation');
      nonnegative(v.capacity, 'Capacity'); nonnegative(v.growth, 'Annual growth fraction'); nonnegative(v.years, 'Years');
      const factor = 1 + v.growth * v.years, cov = v.sd / v.mean;
      const futureMean = v.mean * factor, futureSD = v.sd * factor;
      const currentZ = (v.capacity - v.mean) / v.sd, futureZ = (v.capacity - futureMean) / futureSD;
      return checkedResult({ cov, currentZ, currentRisk: normalCDF(-currentZ), futureMean, futureSD, futureZ, futureRisk: normalCDF(-futureZ), requiredCapacity: v.capacity * factor });
    }
    if (qId === 'q4') {
      const pmf = [v.p0, v.p1, v.p2, v.p3]; pmf.forEach((p, n) => probability(p, `P(N = ${n})`));
      if (Math.abs(pmf.reduce((s, p) => s + p, 0) - 1) > 1e-10) throw new RangeError('The four storm-count probabilities must sum to 1.');
      positive(v.median, 'Median runoff'); positive(v.cov, 'Runoff COV'); nonnegative(v.capacity, 'Sewer capacity');
      const meanN = pmf.reduce((s, p, n) => s + n * p, 0), varN = pmf.reduce((s, p, n) => s + (n - meanN) ** 2 * p, 0);
      const lambda = Math.log(v.median), zeta = Math.sqrt(Math.log1p(v.cov * v.cov));
      const stormRisk = v.capacity === 0 ? 1 : normalCDF((lambda - Math.log(v.capacity)) / zeta);
      const conditionalFlood = pmf.map((_, n) => n === 0 ? 0 : stormRisk === 1 ? 1 : -Math.expm1(n * Math.log1p(-stormRisk)));
      const annualContributions = pmf.map((p, n) => p * conditionalFlood[n]);
      return checkedResult({ pmf, meanN, varN, lambda, zeta, stormRisk, annualRisk: annualContributions.reduce((s, p) => s + p, 0), conditionalFlood, annualContributions });
    }
    if (qId === 'q5') {
      nonnegative(v.rate, 'Station rate'); nonnegative(v.distance, 'Driving distance'); probability(v.empty, 'No-gas probability'); count(v.stations, 'Number of stations');
      const mu = v.rate * v.distance, availableMu = mu * (1 - v.empty);
      finite(mu, 'Expected station count');
      return { mu, availableMu, atMostOne: poissonPMF(0, mu) + poissonPMF(1, mu), noGas: v.empty ** v.stations, stranded: Math.exp(-availableMu) };
    }
    if (qId === 'q6') {
      positive(v.mean, 'Mean inter-arrival time'); probability(v.service, 'No-waiting probability'); count(v.boats, 'Number of boats', 1000);
      if (v.service === 0) throw new RangeError('No-waiting probability must be greater than zero for a finite cycle time.');
      const rate = 1 / v.mean, cycleHours = -v.mean * Math.log(v.service), waitProbability = 1 - v.service;
      const pmf = Array.from({ length: v.boats + 1 }, (_, k) => binomialPMF(k, v.boats, waitProbability));
      return checkedResult({ rate, cycleHours, cycleMinutes: cycleHours * 60, waitProbability, noneWait: pmf[0], atLeastTwo: pmf.slice(2).reduce((sum, p) => sum + p, 0), pmf });
    }
    if (qId === 'q7') {
      positive(v.cd, 'Drag coefficient'); positive(v.rho, 'Fluid density'); positive(v.area, 'Cross-sectional area'); positive(v.v0, 'Mean velocity');
      const k = .5 * v.cd * v.rho * v.area, velocity = v.y < 0 ? null : Math.sqrt(v.y / k);
      positive(k, 'Force coefficient');
      const pdf = v.y < 0 ? 0 : v.y === 0 ? Infinity : Math.exp(-velocity / v.v0) / (2 * v.v0 * Math.sqrt(k * v.y));
      const cdf = v.y <= 0 ? 0 : -Math.expm1(-velocity / v.v0);
      return checkedResult({ k, velocity, pdf, cdf, meanY: 2 * k * v.v0 * v.v0, sdY: Math.sqrt(20) * k * v.v0 * v.v0 }, v.y === 0 ? ['pdf'] : []);
    }
    if (qId === 'q8') {
      nonnegative(v.sdW, 'Distributed-load standard deviation'); nonnegative(v.sdP, 'Point-load standard deviation'); positive(v.sdR, 'Resistance standard deviation');
      if (v.corr < -1 || v.corr > 1) throw new RangeError('Correlation must be between −1 and 1.');
      const covWP = v.corr * v.sdW * v.sdP, meanM = 50 * v.meanW + 10 * v.meanP;
      const a = 50 * v.sdW, b = 10 * v.sdP;
      const varM = (a - b) ** 2 + 2 * a * b * (1 + v.corr), sdM = Math.sqrt(varM);
      const meanMargin = v.meanR - meanM, varMargin = v.sdR ** 2 + varM, sdMargin = Math.sqrt(varMargin), beta = meanMargin / sdMargin;
      return checkedResult({ covWP, meanM, varM, sdM, meanMargin, varMargin, sdMargin, beta, failureRisk: normalCDF(-beta) });
    }
    positive(v.meanW, 'Mean load'); positive(v.covW, 'Load COV'); positive(v.meanR, 'Mean strength'); positive(v.covR, 'Strength COV'); positive(v.area, 'Column area'); probability(v.target, 'Target failure probability', true);
    const zetaW = Math.sqrt(Math.log1p(v.covW ** 2)), zetaR = Math.sqrt(Math.log1p(v.covR ** 2));
    const lambdaW = Math.log(v.meanW) - .5 * zetaW ** 2, lambdaR = Math.log(v.meanR) - .5 * zetaR ** 2;
    const lambdaS = lambdaW - Math.log(v.area), lambdaRatio = lambdaR - lambdaS, zetaRatio = Math.hypot(zetaW, zetaR), beta = lambdaRatio / zetaRatio;
    const targetBeta = -inverseNormal(v.target), requiredArea = Math.exp(lambdaW - lambdaR + targetBeta * zetaRatio);
    return checkedResult({ meanS: v.meanW / v.area, covS: v.covW, lambdaW, lambdaR, lambdaS, zetaW, zetaR, zetaS: zetaW, lambdaRatio, zetaRatio, beta, failureRisk: normalCDF(-beta), targetBeta, requiredArea, requiredSide: Math.sqrt(requiredArea) });
  }

  return Object.freeze({ DEFAULTS, normalPDF, normalCDF, inverseNormal, inverseNormalCDF: inverseNormal, lognormalPDF, lognormalCDF, poissonPMF, binomialPMF, quadraticPDF, quadraticCDF, calculate });
});
