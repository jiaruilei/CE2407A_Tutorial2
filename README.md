# CE2407A Tutorial 2

Interactive exercises for all nine questions in Tutorial Questions Set 2, styled to match [Tutorial 1](https://jiaruilei.github.io/CE2407A_Tutorial1/).

Live site: https://jiaruilei.github.io/CE2407A_Tutorial2/

The static website is in `docs/`. GitHub Pages serves the `main` branch's `/docs` folder. It has no build dependencies or browser API keys. Exercise calculations run locally in the browser. Input values are saved only in localStorage.

## Features

- Nine compact question tabs with always-visible statements and editable parameters. Answers, SVG plots and working appear only after Calculate. No hints or descriptive question notes are shown.
- Editing an input clears the output until Calculate is clicked again.
- Reset restores the original question values and hides the output. Q7's physical values are explicitly illustrative.
- Bundled MathJax renders given equations, input symbols, results, chart formulas and working without an external CDN. Plain-text fallbacks remain accessible.
- Deep link with `?question=q4`; use `?question=q4&embed=1` for slides.
- Responsive controls, accessible diagrams, labelled fields and keyboard navigation.

## AI Coach

Prof. Gary’s AI Proxy matches Tutorial 1 and appears below each selected exercise. It keeps separate drafts and conversations for Q1–Q9, uses the current numeric inputs, and renders equations with bundled MathJax. Chat history stays in browser memory and Clear chat clears only the selected question.

The dedicated Render service at https://ce2407a-tutorial2.onrender.com handles AI requests with an explicit tutorial2 selector and verified Tutorial 2 teaching context. It is a separate deployment from Tutorial 1's existing service and uses the same OpenAI API key, stored only in Render's environment settings. Only the selected question, numeric exercise inputs and recent conversation are sent. The service uses the OpenAI Responses API with store: false and independent request limits. Tutorial 1 remains on its existing service.

The coach waits for the service to advertise Tutorial 2 support. Service failures show an unavailable message. Calculator outputs still require Calculate and chatting never reveals those outputs automatically.

## Run and verify

Use Node.js 22–24:

```sh
npm run preview
npm test
```

The preview runs at http://127.0.0.1:4172 and proxies coach requests to Tutorial 2's dedicated Render service. The exercises also work by opening `docs/index.html` directly, while the coach needs HTTP hosting and an internet connection.

### Standalone Tutorial 2 API

`server.mjs` provides a separate Tutorial 2 API and serves the website from `docs/`. It accepts Q1–Q9 for `tutorial2`, rejects other tutorial selectors, and advertises only Tutorial 2 in `/health`. Its request limits are independent of any other service instance.

For local development, copy `.env.example` to an ignored `.env`, set `OPENAI_API_KEY`, and run `npm start`. The server listens on port 3000 unless `PORT` is set. Without a key, the exercises still work and the coach reports that it is not configured.

For Render, use the Node runtime, `npm test` as the build command, `npm start` as the start command, and `/health` as the HTTP health check. Set the key in Render's environment settings. Keep keys out of the repository and browser assets.

## Source and numerical notes

Content is adapted from the supplied CE2407A Tutorial Questions Set 2 and Tutorial Solutions Set 2 (complete). The original PDFs remain local and are not included in the public repository.

- Q2 uses SD √5 = 2.23606798, correcting the supplied solution's numerical typo.
- Q3 uses linear growth and an unrounded future z-score, giving 0.66153888 rather than the normal-table approximation 0.6628.
- Q4 uses exact lognormal conversion, giving per-storm risk 0.18534430 and annual risk 0.18733918; the printed approximations are explained in the working.
- Q6 follows the tutorial's interarrival comparison and independent binomial waiting outcomes.
- Q7 distinguishes an unbounded density at zero from a point probability.
- Q8 makes the joint-normality assumption explicit; N(mean, SD) uses standard deviation.
- Q9 follows the solution's independent lognormal resistance/load assumption. Exact area for failure probability 0.001 is 0.20367246 m².

The numerical tests cover defaults, distribution normalization, probability boundaries, transformations, and inverse reliability design. Browser checks cover tabs, inputs, Calculate gating, resetting, and math rendering.

MathJax 3.2.2 is bundled from Tutorial 1. Its Apache 2.0 license is retained at `docs/assets/mathjax/LICENSE`.
