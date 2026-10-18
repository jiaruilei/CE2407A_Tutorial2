# CE2407A Tutorial 2

Interactive exercises for all nine questions in Tutorial Questions Set 2, with a question-specific AI Coach.

## Repository and services

| Resource | Tutorial 2 configuration |
| --- | --- |
| Repository | [jiaruilei/CE2407A_Tutorial2](https://github.com/jiaruilei/CE2407A_Tutorial2) |
| Website | [GitHub Pages](https://jiaruilei.github.io/CE2407A_Tutorial2/) |
| Pages source | `main` branch, `/docs` folder |
| Render service | [`ce2407a-tutorial2`](https://dashboard.render.com/web/srv-db9puirncjis73a895ag) |
| API base URL | [https://ce2407a-tutorial2.onrender.com](https://ce2407a-tutorial2.onrender.com) |
| Service ID | `srv-db9puirncjis73a895ag` |
| Render workspace / region / plan | NUS / Singapore / Free |
| Render source | This repository, `main` branch, repository root, automatic deployment on commit |
| Runtime | Node.js 22–24 (`>=22 <25`) |
| Build / start commands | `npm test` / `npm start` |
| HTTP health check | [`/health`](https://ce2407a-tutorial2.onrender.com/health) |

## Independent maintenance

This repository contains the complete Tutorial 2 frontend in `docs/`, API in `server.mjs`, teaching context in `tutorial2-context.mjs`, preview server and tests. It has no build or runtime dependency on the Tutorial 1 repository or Render service. MathJax is bundled locally. No package installation or external JavaScript CDN is required.

Tutorial 2 deploys from its own `main` branch and has its own Render environment variables and in-memory request limits, which reset on restart. The same OpenAI API key is configured separately in each tutorial's Render service. It is not loaded from Tutorial 1 or a shared Render environment group. OpenAI billing and provider quotas remain shared through that credential. Rotating the shared key requires updating both services separately.

Keep the API key only in this service's Render environment settings or an ignored local `.env` file. Never put it in GitHub Pages, browser assets or the repository.

## Run locally

Use Node.js 22–24 and clone only this repository:

```sh
git clone https://github.com/jiaruilei/CE2407A_Tutorial2.git
cd CE2407A_Tutorial2
npm test
npm start
```

Open [http://localhost:3000](http://localhost:3000). `npm start` serves both the website and its own API. For local AI coaching, copy `.env.example` to `.env`, set `OPENAI_API_KEY`, then restart the server. Without a key, the exercises still work and the coach reports that it is not configured. `PORT` can override the local port.

To preview the website with the already deployed Tutorial 2 coach instead:

```sh
npm run preview
```

Open [http://127.0.0.1:4172](http://127.0.0.1:4172). This preview proxies `/health` and `/api/chat` to Tutorial 2's own Render service and needs no local API key. It requires that service and an internet connection for coaching. The exercises also work by opening `docs/index.html` directly. For chat, use HTTP hosting through `npm start`, the preview, or the published website. Direct `file://` access is blocked by the API's origin policy.

## Deploy independently

### GitHub Pages

1. Push the website files to this repository's `main` branch.
2. In **Settings → Pages**, choose **Deploy from a branch**, then `main` and `/docs`.
3. Save and wait for the Pages deployment. The published site is [CE2407A Tutorial 2](https://jiaruilei.github.io/CE2407A_Tutorial2/).

The site is static, with `.nojekyll` included. It needs no build command, API key or access to the Tutorial 1 repository. Calculations run in the browser, and input values are stored only in localStorage.

See [GitHub's publishing-source instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

### Render API

Use the existing [Tutorial 2 service](https://dashboard.render.com/web/srv-db9puirncjis73a895ag), or create a Node web service in NUS with the following settings:

1. Connect `jiaruilei/CE2407A_Tutorial2`, select `main`, and leave **Root Directory** blank.
2. Select Singapore and the Free instance type. Set **Build Command** to `npm test`, **Start Command** to `npm start`, and **Health Check Path** to `/health`.
3. Add these variables to this service's environment:

   | Variable | Value |
   | --- | --- |
   | `OPENAI_API_KEY` | The existing OpenAI key, entered as a secret |
   | `OPENAI_MODEL` | `gpt-6.1-sol` |
   | `OPENAI_MAX_OUTPUT_TOKENS` | `2048` |
   | `OPENAI_TIMEOUT_MS` | `55000` |

4. Enable automatic deployment on commits to `main`, then deploy. Render supplies `PORT` and its public service URL automatically. Additional request-limit settings are documented in `.env.example`.
5. Verify that `/health` returns `{"configured":true,"tutorials":["tutorial2"]}`, then send a message through the website's AI Coach. `configured: true` confirms that a key is present, while the chat check verifies that the provider accepts it.

Run `npm test` locally before pushing changes to this repository's `main` branch. For a manual redeploy, use **Manual Deploy → Deploy latest commit** in this service's dashboard. See [Render's deployment instructions](https://render.com/docs/deploys).

The existing website's `tutorial-api-base` meta tag in `docs/index.html` already points to `https://ce2407a-tutorial2.onrender.com`. If recreating the service under a new hostname, update that tag and the proxy target in `preview.mjs`, then publish Pages again. If hosting the website on a different origin, also update `PAGES_ORIGIN` in `server.mjs` and redeploy the API. The current allowed Pages origin is `https://jiaruilei.github.io`, alongside the service's own origin. Neither change requires editing or redeploying Tutorial 1.

For a custom frontend domain hosted separately from the API, also update `resolveApiBase` in `docs/chat.js` to use the configured API URL for that hostname. It currently selects the configured URL for `github.io` sites and otherwise uses the same origin for HTTP hosting.

## Features

- Nine compact question tabs with always-visible statements and editable parameters. Answers, SVG plots and working appear only after Calculate. No hints or descriptive question notes are shown.
- Editing an input clears the output until Calculate is clicked again.
- Reset restores the original question values and hides the output. Q7's physical values are explicitly illustrative.
- Bundled MathJax renders given equations, input symbols, results, chart formulas and working without an external CDN. Plain-text fallbacks remain accessible.
- Deep link with `?question=q4`. Use `?question=q4&embed=1` for slides.
- Responsive controls, accessible diagrams, labelled fields and keyboard navigation.

## AI Coach

Prof. Gary’s AI Proxy appears below each selected exercise. It keeps separate drafts and conversations for Q1–Q9, uses the current numeric inputs, and renders equations with bundled MathJax. Chat history stays in browser memory and Clear chat clears only the selected question.

The API accepts Q1–Q9 with `tutorial: "tutorial2"` or an omitted tutorial selector, rejects other tutorials, and advertises only Tutorial 2 in `/health`. Only the selected question, numeric exercise inputs and recent conversation are sent to the OpenAI Responses API, with `store: false`.

The coach waits for the service to advertise Tutorial 2 support. Service failures show an unavailable message. Calculator outputs still require Calculate and chatting never reveals those outputs automatically.

## Source and numerical notes

Content is adapted from the supplied CE2407A Tutorial Questions Set 2 and Tutorial Solutions Set 2 (complete). The original PDFs remain local and are not included in the public repository.

- Q2 uses SD √5 = 2.23606798, correcting the supplied solution's numerical typo.
- Q3 uses linear growth and an unrounded future z-score, giving 0.66153888 rather than the normal-table approximation 0.6628.
- Q4 uses exact lognormal conversion, giving per-storm risk 0.18534430 and annual risk 0.18733918. The printed approximations are explained in the working.
- Q6 follows the tutorial's interarrival comparison and independent binomial waiting outcomes.
- Q7 distinguishes an unbounded density at zero from a point probability.
- Q8 makes the joint-normality assumption explicit. N(mean, SD) uses standard deviation.
- Q9 follows the solution's independent lognormal resistance/load assumption. Exact area for failure probability 0.001 is 0.20367246 m².

The numerical tests cover defaults, distribution normalization, probability boundaries, transformations, and inverse reliability design. Browser checks cover tabs, inputs, Calculate gating, resetting, and math rendering.

The visual style and original MathJax copy came from Tutorial 1. MathJax 3.2.2 is stored entirely in this repository, with its Apache 2.0 license at `docs/assets/mathjax/LICENSE`.
