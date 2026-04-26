# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
