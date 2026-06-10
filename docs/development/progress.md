Microbial World — Progress & Backlog
=====================================
Last updated: 2026-06-10

Current state
-------------
- Branch: main (synced with origin/monai86/MicrobialWorld_WepApp)
- Latest commits:
    dc0dcd0  ci: Phase 4 — GitHub Actions + Cloudflare Pages config
    7a0bc8e  feat(v4): Phase 2 — UI shell + Liquid Glass + routing
    8b8f233  feat: v4.0.0-alpha modernization scaffold (Phase 0+1)
    48e4255  feat: v3.1.1 expanded validation suite (50 + DK concordance)
- Maintained app: v4 in `v2/`
- Archived reference: legacy v3.1.1 in `legacy/`
- Required validation: `cd v2 && npm ci && npm run lint && npm run typecheck && npm run test && npm run build`

Phases done
-----------
[x] Phase 0 — Vite + React 19 + TS + Tailwind v3 + Vitest scaffold (in v2/)
[x] Phase 1 — Bayesian engine ported to TS
              (lib/{types,testMatcher,mcmAdapter,bayesianEngine,dataLoader}.ts)
[x] Phase 2 — UI shell:
              Layout, GroupSelector, TestSelector, SpeciesCard,
              ConfidenceBadge, McmBadge,
              IdentifyPage, AboutPage,
              identifyStore (zustand)
[x] Phase 4 — GitHub Actions CI (.github/workflows/ci.yml: v4 lint/typecheck/test/build + legacy validation)
              Cloudflare Pages config (v2/public/_headers, _redirects)

Phase pending
-------------
[ ] Phase 3 — Cloudflare Pages bring-up
              (user-side: connect repo at dash.cloudflare.com → Pages)
              Settings:
                Build command:    npm run build
                Output directory: dist
                Root directory:   v2
                Node version:     22

Backlog (held by user 2026-04-28 — pick when ready)
---------------------------------------------------
A. UI expansion — Library + SpeciesDetail
   - LibraryPage (/library): grid of 157 species, search box, group filter
   - SpeciesDetailPage (/species/:id): clinical info, biochem table,
     MCM % positivity matrix, colony, gram stain, notes
   - SpecimenGuidePage (port from legacy index.html)
   - Add nav links in Layout.tsx

B. Reasoning panel inside result card
   - Top species: per-test log-likelihood breakdown
     (which biochem result pushed it up / down, in bits)
   - "What-if" suggestion: highest information-gain next test
   - Optional: visualize as small bar chart per test

C. DX / cleanup
   - Replace @ts-nocheck in bacteriaLibrary.ts + mcmData.ts with
     proper Species/McmEntry types
   - Add ESLint + Prettier config + lint job in CI
   - Add .github/dependabot.yml (npm + actions ecosystem)
   - Lazy-load routes (React.lazy + Suspense) — code-split AboutPage

D. Root docs
   - Keep root README.md, deployment docs, and project structure docs aligned on v2/ as the only maintained app
   - Keep legacy docs clearly marked as reference-only

E. Algorithm enhancements (longer-term)
   - PWA / offline (vite-plugin-pwa)
   - i18n separation (th/en) via i18next
   - Property-based tests (test-order invariance)
   - Snapshot tests for ranking output
   - Playwright e2e

F. Validation extensions
   - Edge-case scenarios (rare species, contradictory test patterns)
   - Performance benchmark v4 vs legacy

Notes for next session
----------------------
- testMatcher: '+' matches β/α hemolysis (clinical convention) —
  deliberate enhancement over legacy, covered by 50-scenario suite.
- Test thresholds in bayesianEngine.test.ts calibrated against FULL
  157-species LIBRARY (not the mini library in scripts/test_bayes.mjs).
  Some scenarios accept multiple top-IDs for taxonomic synonyms
  (enterobacter_aerogenes ≡ klebsiella_aerogenes) and genus-level
  entries (shigella, aeromonas).
- v2/ is self-contained: cd v2 && npm ci && npm run dev
- @ts-nocheck on data files is intentional for now — switching to
  proper types is task C.
