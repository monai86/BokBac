# Workflow Reference

## General Change Workflow

1. Inspect current status with `git status --short`.
2. Identify target line: root legacy v3, `v2/` modern v4, or both.
3. Read the smallest relevant source files and docs.
4. Make scoped edits.
5. Run targeted validation.
6. Update release docs only when the change affects behavior, features, structure, dependencies, deploy, or version.
7. Summarize touched files and verification.

## Legacy v3 Workflow

Use when changing root app behavior, static deployment files, or legacy data:

1. Edit:
   - UI/components/engine: `index.html`
   - styles: `css/styles.css`
   - library/suites/reference data: `js/data.js`
   - generated MCM output: prefer `scripts/` then regenerate `js/mcm_data.js`
2. Validate with `node scripts/test_bayes.mjs`.
3. For UI behavior, open `index.html` or serve the root folder and check console/network.
4. If behavior changes, update `VERSION`, `CHANGELOG.md`, and root `README.md`.

## Modern v4 Workflow

Use for new app work unless legacy is requested:

1. Work inside `v2/`.
2. Keep pure algorithm code in `v2/src/lib/`.
3. Keep app state in `v2/src/store/identifyStore.ts`.
4. Keep page orchestration in `v2/src/pages/`.
5. Keep reusable display controls in `v2/src/components/`.
6. Validate with:
   - `npm run test`
   - `npm run build`
7. If running locally, use `npm run dev` from `v2/` and verify in browser.

## MCM Data Pipeline

Use when adding species, changing probability inputs, or reworking extraction:

1. Inspect existing parsers in `scripts/parse_mcm_*.py`.
2. Update parsed JSON under `scripts/mcm_extract/parsed/` only through pipeline logic when possible.
3. Regenerate legacy MCM JS with `python3 scripts/generate_mcm_js.py`.
4. Port or sync generated data into `v2/src/data/mcmData.ts` if v4 is affected.
5. Add or adjust textbook validation scenarios.
6. Run both legacy and v4 tests when behavior should remain aligned.

## Documentation Workflow

Update docs deliberately:

- `README.md`: public project overview, version history, usage, testing, deployment.
- `docs/development/development-workflow.md`: contributor workflow and rules.
- `docs/development/version-update-checklist.md`: detailed release checklist.
- `docs/development/progress.md`: current progress and backlog.
- `docs/deployment/`: Cloudflare and deployment guides.
- `v2/README.md`: modern app commands, architecture, deployment settings.

Do not duplicate long instructions. Prefer linking or summarizing in one authoritative place.
