# CE2407A Tutorial 2

Interactive exercises for all nine questions in Tutorial Questions Set 2, styled to match [Tutorial 1](https://jiaruilei.github.io/CE2407A_Tutorial1/).

Live site: https://jiaruilei.github.io/CE2407A_Tutorial2/

The static website is in `docs/`. GitHub Pages serves the `main` branch's `/docs` folder. It has no build dependencies or API keys. All calculations and hints run locally in the browser. Input values and typed answers are saved only in localStorage. This version uses authored step-by-step hints, not an AI chat service.

## Features

- Nine compact question tabs, editable parameters and live SVG plots. Question statements, hints and working expand on demand.
- Numerical answer checks accept decimal values, fractions and percentages, with rounding tolerance.
- Reset restores the original question values; Q7's physical values are explicitly illustrative.
- Bundled MathJax renders model equations, input symbols, results, chart formulas, hints and working without an external CDN. Plain-text fallbacks remain accessible.
- Deep link with `?question=q4`; use `?question=q4&embed=1` for slides.
- Responsive controls, accessible diagrams, labelled fields and keyboard navigation.

## Run and verify

Use Node.js 22 or newer:

```sh
npm start
npm test
```

The preview runs at http://127.0.0.1:4172. The static site also works by opening `docs/index.html` directly.

## Source and numerical notes

Content is adapted from the supplied CE2407A Tutorial Questions Set 2 and Tutorial Solutions Set 2 (complete). The original PDFs remain local and are not included in the public repository.

- Q2 uses SD √5 = 2.23606798, correcting the supplied solution's numerical typo.
- Q3 uses linear growth and an unrounded future z-score, giving 0.66153888 rather than the normal-table approximation 0.6628.
- Q4 uses exact lognormal conversion, giving per-storm risk 0.18534430 and annual risk 0.18733918; the printed approximations are explained in the working.
- Q6 follows the tutorial's interarrival comparison and independent binomial waiting outcomes.
- Q7 distinguishes an unbounded density at zero from a point probability.
- Q8 makes the joint-normality assumption explicit; N(mean, SD) uses standard deviation.
- Q9 follows the solution's independent lognormal resistance/load assumption. Exact area for failure probability 0.001 is 0.20367246 m².

The numerical tests cover defaults, distribution normalization, probability boundaries, transformations, and inverse reliability design. Browser checks cover tabs, inputs, answer feedback, resetting, hints, and math rendering.

MathJax 3.2.2 is bundled from Tutorial 1. Its Apache 2.0 license is retained at `docs/assets/mathjax/LICENSE`.
