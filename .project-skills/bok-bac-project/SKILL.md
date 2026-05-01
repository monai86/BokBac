---
name: bok-bac-project
description: Project-local workflow for the BOK BAC / Microbial World bacterial identification web app. Use when working in this repository from an IDE or AI coding assistant on legacy v3 static React, v4 Vite React TypeScript, MCM clinical microbiology data extraction, Bayesian identification logic, validation scenarios, Firebase/auth/deploy hardening, release/version documentation, CI, Cloudflare Pages, or any code/documentation change in /Users/porschecaa/Desktop/NewML.
---

# BOK BAC Project

## Operating Rule

Treat this repository as two active product lines:

- Root legacy app: v3.x static React/Babel in `index.html`, `css/`, `js/`, and `scripts/`; current root `VERSION` is authoritative for v3.
- Modern app: v4.x Vite + React + TypeScript in `v2/`; `v2/package.json` is authoritative for v4.

Before editing, identify which product line the request targets. If unclear, prefer `v2/` for new app work and preserve root legacy behavior unless the user explicitly asks to change it.

## Start Here

Read only the reference needed for the task:

- App structure or ownership: `references/architecture.md`
- Coding and data workflows: `references/workflows.md`
- Tests and verification: `references/validation.md`
- Versioning, release, and deploy: `references/release-deploy.md`

## Task Routing

- UI/frontend feature: use the modern `v2/` path unless the user names legacy. Keep logic in `src/lib/`, state in `src/store/`, pages in `src/pages/`, and reusable UI in `src/components/`.
- Bayesian or organism identification logic: inspect both root legacy logic and `v2/src/lib/bayesianEngine.ts`; keep behavior aligned unless intentionally changing versions.
- MCM data work: update extraction/parsing/generation flow in `scripts/` first, then propagate generated/ported data into `js/mcm_data.js` and `v2/src/data/mcmData.ts` as needed.
- Release or meaningful behavior change: update the relevant version source, changelog, and README entries. Do not bump versions for formatting-only or docs-only cleanup unless the project docs explicitly require it for that change.
- Deployment/security: review `_headers`, `_redirects`, Firebase config handling, and Cloudflare Pages settings before recommending public sharing.

## Minimum Done Criteria

For any code change, finish with the smallest verification set that matches the touched area:

- Root legacy algorithm/data: run `node scripts/test_bayes.mjs`.
- `v2/` TypeScript app: run `npm run test` and `npm run build` from `v2/`.
- UI change: also inspect the running app in a browser when feasible.
- Release/deploy change: confirm version docs, CI expectations, and Cloudflare Pages root/output settings are still coherent.

Mention any verification you could not run.
