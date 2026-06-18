# Changelog

All notable changes to this project will be documented in this file.


The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Case-based validation table in `docs/validation.md` with 8 representative clinical microbiology scenarios covering Gram-positive clusters/chains, Enterobacterales, non-fermenting rods, and curved Gram-negative rods.
- New biochemical tests `colony_xld` (XLD colony characteristics) and `growth_macconkey` (growth on MacConkey agar) to the test registry.
- New auto-derivation rules in `testMatcher.ts` to automatically infer `colony_xld` (Enterobacterales), `growth_macconkey` (Fastidious GNs), and `pyr` (GPC chains) for engine matching.

### Changed
- Refined UI copy across login, layout navigation tabs, result explanation panels, and page footers to use educational identification terminology ("จำแนกชนิด", "Educational Support Engine") rather than diagnostic terms.
- Enhanced clinical and educational disclaimers on the About and Identify pages to clearly state that BokBac is for educational use only, confidence scores reflect consistency with reference data, and laboratory confirmation is required.
- Updated default test suites:
  - **Enterobacterales**: Added required Arginine Dihydrolase (`adh`) and optional XLD colony characteristics (`colony_xld`).
  - **NFB**: Added required `catalase` and optional `ldc`, `odc`, and `adh`.
  - **Fastidious GNs**: Added required `growth_macconkey` and optional `odc`.
  - **GPC chains**: Added optional `pyr` (PYR test).
  - **Vibrionaceae**: Updated `oxidase` option selection to allow both `+` and `−` outcomes.

### Fixed
- Disabled background Firebase initialization during automated Vitest runs to prevent network and timer hangs, resolving local test timeouts.

## [4.0.5] - 2026-06-18

### Fixed
- **v4 production Google sign-in deployment** — fixed the lint failure that prevented the updated Firebase/Google CSP policy from reaching Cloudflare Pages.
- **v4 Firebase config loading** — removed the ignored `/firebase-config.js` runtime request that Cloudflare rewrote to `index.html`, eliminating the MIME-type and inline CSP errors on the login page.

## [4.0.4] - 2026-06-12

### Added
- **v4 user custom suite library** — added "Test suite ของฉัน" management on the Test Suite page so users can create, name, edit, select, import/export, and delete multiple custom biochemical panels.
- **v4 custom suite persistence** — custom suites now persist locally for Guest Mode and sync under the authenticated user in Firestore when Firebase is enabled.

### Changed
- **v4 global custom suite calculation** — user-created custom suites can be used across organism groups; the Bayesian engine now evaluates the active custom suite against the currently selected group and uses the custom suite size for coverage/recommendation behavior.
- **v4 custom result options** — custom suites use the global biochemical test option set by default, while default organism-group suites keep their group-constrained result options.

## [4.0.3] - 2026-06-11

### Added
- **v4 suite-specific test display metadata** — added per-suite label and option overrides so a Canonical Test ID can render with the teaching method name used by that biochemical suite.
- **v4 legacy suite import normalization** — custom suite imports now normalize legacy test IDs such as `glucose_of`, `motile_gpb`, and `lecithinase_gpb` into canonical v4 test IDs while preserving imported labels/options as suite display overrides.
- **v4 expanded biochemical registry coverage** — restored legacy teaching tests for Enterobacterales, NFB, Vibrionaceae, and GN coccobacilli suites, including salt concentration tests, TCBS, CTA carbohydrates, nutrient/chocolate agar growth, PDC, KCN, Salicin, Inositol, and Dulcitol.

### Changed
- **v4 biochemical suite labels** — aligned Test Suite Reference, Custom Suite Manager, recommended tests, and biochemical result entry controls to use the same suite-aware display helper.
- **v4 suite-specific result options** — constrained default biochemical result buttons by selected Test Suite, so shared tests such as TSI, Oxidase, and Catalase show the organism-group-appropriate options instead of every global outcome.
- **v4 GPB and contextual glucose panels** — restored legacy-style display names/options such as `Glucose O/F`, `MSA (Mannitol)`, `Motility (25°C)`, `H₂S in TSI`, and `Lecithinase (Egg yolk)`.
- **v4 mobile navigation** — replaced the narrow-screen expanded navigation grid with a hamburger menu so the app header no longer consumes the first viewport on phones.
- **v4 mobile auth placement** — kept the login action in the right-side header control cluster on narrow screens instead of centering it between the brand and hamburger menu.
- **v4 Gram stain wording** — removed visible "Wizard" wording and tightened the introduction copy/layout on the morphology helper card.

### Fixed
- **v4 Test Suite Reference group selection** — fixed the Vibrio / Aeromonas tab to load the `vibrio` suite instead of falling back to the first suite.
- **v4 suite registry coverage** — added registry coverage for `growth_45` and `rhamnose`, and added regression tests to ensure every default suite item has a biochemical registry definition.

## [4.0.2] - 2026-06-11

### Added
- **v4 expanded teaching suite tests** — added PPR, Gas from Glucose, Lecithinase, GPB H₂S/TSI, GPB Indole/Oxidase, and Reverse CAMP coverage in the modern test-suite registry and regression tests.
- **v4 loading feedback** — added a reusable compact loading indicator for auth checks, login actions, reset email actions, and probability processing states.

### Changed
- **v4 narrow-screen workflow layout** — updated specimen selection, diagnostic step progress, library details, and Test Suite Reference layouts to avoid trapped horizontal scrolling on narrow windows.
- **v4 login action styling** — changed the primary login action to an animated pastel gradient while preserving reduced-motion behavior.

### Fixed
- **v4 library detail navigation** — made organism detail pages usable on narrow screens with visible back, previous, and next navigation instead of a fixed overlay that trapped users.

## [4.0.1] - 2026-06-11

### Added
- **v4 Playwright workflow coverage** — added login-first guest-mode E2E coverage for initial observation, suggested suite selection, biochemical inputs, ranked result review, saved case creation, and saved case reload.
- **v4 library browsing** — added searchable `LibraryPage` and linked `SpeciesDetailPage` in `v2/` so users can browse the species catalog, filter by bacterial group, and open organism-specific teaching details.
- **Project-local workflow skill** — added `.project-skills/bok-bac-project` and `AGENTS.md` to centralize repository workflow guidance for legacy v3, modern v4, MCM data pipeline, validation, release, and deploy tasks.
- **Version Update Checklist** — added `docs/development/version-update-checklist.md` to standardize the process of updating changelogs, versions, and documentation for workflow and tooling changes.
- **Repository organization** — moved secondary workflow/deployment docs under `docs/`, local reference materials under `assets/references/local/`, and deprecated local-only files under `archive/`.

### Fixed
- **Bacterial Scientific Names Font Family**: Standardized species nomenclature to a clean sans-serif typeface globally, maintaining italics while removing mismatched serif styles.
- **Specimen Page Layout**: Compacted hero cards and detail elements, and converted vertical sidebar selectors to responsive horizontal swipe scroll elements on mobile.
- **Library Page Spacing**: Removed the large empty gap between the search box and group filters on desktop layouts.
- **Theme Consistency**: Preserved standard dark mode system styling (neon color palette) and reverted design variations.
- **v4 authentication flow** — protected the modern app shell behind `ProtectedRoute`, made `/login` the unauthenticated entry point, and kept explicit Guest Mode from redirecting back to login on reload.
- **v4 auth state ownership** — consolidated Firebase session ownership in `AuthProvider`; Zustand now only mirrors the authenticated UID needed for case/settings persistence.
- **NaCl test alias collision** — split `6.5% NaCl` (`nacl_6_5`) from `6% NaCl` (`nacl_6`) across legacy and v4 data to remove duplicate-key overrides during Vite build.

### Changed
- **v4 workflow hierarchy** — moved saved-case actions to the ranked-result review step and reduced global Liquid Glass tilt/mouse tracking to opt-in surfaces for better readability and performance.

## [3.1.1] - 2026-04-27

### Added
- **Expanded Validation Suite (50 scenarios)** — test_bayes.mjs upgraded from 18 → 50 textbook-reference scenarios
  - 16 new LIBRARY entries for testing: Enterobacter (cloacae, aerogenes), Providencia (rettgeri, stuartii), Pseudomonas (stutzeri, putida), Vibrio (alginolyticus, mimicus), Plesiomonas shigelloides, Aeromonas caviae, Neisseria (sicca, mucosa), Streptococcus (pyogenes, agalactiae), Enterococcus (faecalis, faecium)
  - New `gpc_chain` group added for Streptococcus/Enterococcus testing
  - Coverage: **8 bacterial groups** (Enterobacterales, NFB, Vibrio/Aeromonas, GPC Cluster, GPC Chain, GN Coccobacilli)
- **Dichotomous Key (DK) Concordance Comparison** — each scenario now includes a `dk` field documenting the textbook dichotomous key identification path
  - `runTests()` compares Bayes engine output vs DK expected result
  - Per-group pass rate breakdown in summary output
  - Discordant cases listed individually for review
- **Validation results**: **50/50 PASS**, **33/33 DK concordance (100%)**

## [3.1.0] - 2026-04-26

### Added
- **Expanded MCM Bayesian coverage** — 157 species total, **93 with full biochemical test data** (+36 new)
  - Yersinia (12 spp): *Y. enterocolitica*, *Y. pestis*, *Y. pseudotuberculosis*, etc. (Ch.39 Table 1)
  - Aeromonas (10 spp): *A. hydrophila*, *A. caviae*, *A. veronii*, etc. (Ch.40 Table 3, numeric %)
  - Serratia (5 spp): *S. marcescens*, *S. liquefaciens*, etc. (Ch.38 Table 4)
  - Enterobacter (5 spp): *E. cloacae*, *E. aerogenes*, etc. (Ch.38 Table 5)
  - Listeria (5 spp): *L. monocytogenes*, *L. innocua*, etc. (Ch.27)
  - Bacillus (5 spp): *B. anthracis*, *B. cereus*, *B. subtilis*, etc. (Ch.26)
  - Acinetobacter (5 spp): *A. baumannii* (++++), *A. haemolyticus*, *A. lwoffii*, etc. (Ch.43 Table 1)
- New parser: `scripts/parse_mcm_extended.py` — unified parser for Ch.26/27/38/39/40/43
- Validation suite expanded to **18/18 PASS** — new scenarios: Y. enterocolitica, Serratia, A. hydrophila, L. monocytogenes

### Changed
- `scripts/generate_mcm_js.py` — species mapping expanded (93 LIBRARY-matched species with MCM data)

### Removed
- `public/` folder (outdated deployment copies; root files are canonical)
- Old `data/*.json` files from git tracking (kept locally; active data is `js/data.js` + `js/mcm_data.js`)
- Old `tests/*.js` files from git tracking (kept locally; active validation is `scripts/test_bayes.mjs`)

## [3.0.0] - 2026-04-26

### Added
- **🧬 MCM Bayesian Probability Engine** — Diagnostic algorithm completely rewritten using Naive Bayes with `Manual of Clinical Microbiology, 11th Edition (2015)` as the reference dataset
  - New `calcProbabilityBayes(group, answers)` function in `index.html` that scores each candidate species using log-likelihood + clinical prevalence priors
  - Per-test likelihoods derived from MCM published % positivity (e.g. *E. coli* indole 98%, motility 95%, sucrose 50%)
  - Prevalence-based priors from MCM Ch.38 Table 1 (`++++` frequent → prior 1.0, `+++` occasional → 0.40, `++` rare → 0.20, `+` very rare → 0.10)
  - Softmax normalisation produces calibrated probabilities that sum to 100% across candidates
  - Uninformative-prior smoothing for missing data (`log(0.5)` per untested attribute) so species with rich data correctly outrank species with sparse coverage
  - Hard-exclusion guards preserved (oxidase / catalase / coagulase mismatches collapse to 0%)
- **`js/mcm_data.js`** — auto-generated reference table covering **137 species across all groups**
  - **41 species** with full MCM biochemical test data:
    - Enterobacterales (19): *E. coli*, *Shigella spp.*, *Salmonella*, *Klebsiella*, *Proteus*, *Citrobacter*, *Hafnia*, *Morganella*, *Providencia*, etc. (Ch.37 Table 1 + Ch.38 Tables 3/5/7)
    - Pseudomonas / NFB (4 mapped of 12 extracted): *P. aeruginosa*, *P. fluorescens*, *P. putida*, *P. stutzeri* (Ch.42 Table 1)
    - Vibrionaceae (7 mapped of 13 extracted): *V. cholerae*, *V. parahaemolyticus*, *V. vulnificus*, *V. fluvialis*, *V. alginolyticus*, *V. mimicus*, *V. furnissii*, *Plesiomonas shigelloides* (Ch.41 Table 2)
    - Staphylococcus (5): *S. aureus*, *S. epidermidis*, *S. saprophyticus*, *S. lugdunensis*, *S. haemolyticus* (Ch.21 Table 2)
    - Streptococcus / Enterococcus (5): *S. pyogenes*, *S. agalactiae*, *S. pneumoniae*, *E. faecalis*, *E. faecium* (Ch.22/23)
  - **96 species** with prevalence-only priors (mapped from `LIBRARY.importance` field) — Bayes engine has prior data for every species in the catalog
- **Extended `MCM_TEST_MAP`** — covers Vibrio (`Salt0/6%`, `O/129`, `Arginine`), NFB (`Pyocyanin`, `Pyoverdin`, `Growth42c`, `Cetrimide`, `Acetamide`), Staph (`Coagulase`, `Novobiocin`, `DNase`, `Hemolysis`), Strep (`PYR`, `CAMP`, `Hippurate`, `Bacitracin`)
- **`MCM·N` UI badge** in Step 3 Results — surfaced next to species that received Bayesian scoring with MCM test data; the count `N` shows how many tests were matched. Pure prevalence-only species do not show the badge.
- **Validation suite** (`scripts/test_bayes.mjs`) — **11/11 textbook scenarios passing** across 4 groups (Enterobacterales, NFB, Vibrio, Staphylococci)
- **Extraction pipeline** (`scripts/`) — fully reproducible MCM ingestion: TOC scan, layout-aware page extraction, parsers for numerical tables (Ch.37/41/42 with actual % values 0-100) + symbolic tables (+/−/V), JS code generation, importance-based prior derivation

### Changed
- `calcProbability()` now dispatches to the Bayes engine by default; legacy heuristic preserved as `calcProbabilityLegacy()` and accessible by setting `window.__USE_LEGACY_PROB = true`
- Coverage scaling softened (1 test → 0.55, 5 tests → 0.87, 10 tests → 1.0) to better reflect Bayesian confidence

### Fixed
- Probability of *E. coli* on the textbook 5-test panel now reports **83 %** instead of capped 86 % (legacy)
- Single-test scenarios no longer treat *E. coli* and rare species (e.g. *Edwardsiella tarda*) as equally likely — clinical prevalence priors restore realistic ranking

## [2.0.0] - 2026-04-26

### Added
- **Liquid Glass Design System** - Apple-style glassmorphism with interactive effects
  - CSS variables for glass effects (`--lg-bg`, `--lg-blur`, `--lg-border-*`)
  - CSS classes (`.lg-surface`, `.lg-specular`, `.lg-caustic`, `.lg-content`)
  - `useLiquidGlass()` React hook with mouse tracking, 3D tilt, and border angle rotation
  - Applied to: Top result cards, Modal, Navigation bar
- **Ripple Button Effect** - Material Design style ripple on `.btn-primary`
- **Skeleton Loaders** - Animated loading placeholders with shimmer effect
- **Tooltip System** - CSS-only tooltips with fade animation
- **Mobile Bottom Navigation** - Responsive pill-style tabs with scroll snapping
- **Glass Header** - Frosted glass effect on navigation bar
- Project modularization:
  - Extracted CSS to `css/styles.css`
  - Extracted data constants to `js/data.js`
  - Firebase config isolated in `firebase-config.js`
  - README with full documentation
- Cloudflare Pages deployment config (`_headers`, `_redirects`)

### Changed
- **MAJOR**: Refactored from single-file to modular architecture
- Enhanced `.wf-test-card` with subtle glass gradient and inner highlight
- Improved mobile nav layout with horizontal scroll and better spacing
- Adjusted Liquid Glass parameters (tilt max: 5→2, scale: 1.01→1.005)
- Brightened glass border opacity (0.4→0.55) and padding (1px→1.5px)

### Removed
- **Theme Toggle Button** and light mode CSS (dark theme only)
- Double border on nav-bar from conflicting `.lg-surface` class

## [1.0.0] - 2026-04-XX

### Added
- Initial release of Microbial World Web App
- React 18 with Babel standalone for JSX transformation
- Bacterial identification algorithm with percentage matching
- Specimen guide system
- Dark theme UI
- Responsive design

---

## Version Guidelines

### Semantic Versioning Format: `MAJOR.MINOR.PATCH`

- **MAJOR** (`X.0.0`): Incompatible changes, breaking API modifications, major redesigns
- **MINOR** (`x.Y.0`): New features added, backwards compatible
- **PATCH** (`x.y.Z`): Bug fixes, small improvements, backwards compatible

### When to Increment:

| Change Type | Version Bump | Example |
|------------|--------------|---------|
| New feature | MINOR | Add chart visualization → `2.1.0` |
| Bug fix | PATCH | Fix modal not closing → `2.0.1` |
| Breaking change | MAJOR | Change data structure → `3.0.0` |
| UI redesign | MINOR/MAJOR | Major redesign → `3.0.0` |
