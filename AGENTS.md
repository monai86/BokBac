# Project Instructions

Use the project-local skill at `.project-skills/bok-bac-project` for work in this repository.

Fast orientation:

- Root legacy app is v3.x: static React/Babel in `index.html`, `css/`, `js/`, and `scripts/`.
- Modern app is v4.x: Vite + React + TypeScript in `v2/`.
- Prefer `v2/` for new app work unless the user explicitly targets legacy.
- Run validation that matches the touched area:
  - Legacy algorithm/data: `node scripts/test_bayes.mjs`
  - Modern app: `cd v2 && npm run test && npm run build`
- For behavior/release changes, keep version docs coherent across the affected track.
