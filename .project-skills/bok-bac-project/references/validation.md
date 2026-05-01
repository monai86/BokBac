# Validation Reference

## Command Matrix

Run from repository root unless noted.

Legacy v3:

```bash
node scripts/test_bayes.mjs
```

Modern v4:

```bash
cd v2
npm run test
npm run build
```

Modern v4 lint when style or TypeScript structure changed:

```bash
cd v2
npm run lint
```

## CI Expectations

GitHub Actions runs:

- `v2`: `npm ci`, `npm run test`, `npm run build`
- legacy root: `node scripts/test_bayes.mjs`

Keep local verification aligned with CI for any code path touched.

## Manual UI Checks

Legacy:

- Specimen page renders.
- Workflow step 1 selects Gram stain.
- Workflow step 2 records biochemical tests.
- Workflow step 3 ranks species and shows probability/confidence.
- Saved cases load/save/delete if affected.
- Library, Tests, and Test Suites render.
- Google OAuth/Guest mode works if auth was touched.

Modern v4:

- Group selector updates available tests.
- Test selector records positive/negative/unknown states.
- Ranked species update after inputs.
- MCM/confidence badges display correctly.
- About page and routing work after build.

## Algorithm Checks

For Bayesian changes, verify:

- Hard exclusions still zero out incompatible candidates.
- MCM percent positivity is preferred over fallback library symbols.
- Fallback symbols still map to calibrated likelihoods.
- Prevalence priors affect sparse scenarios.
- Softmax probabilities remain sane and sum coherently in the result set.
- Confidence labels reflect test coverage.

Add or update Vitest scenarios when a bug fix would otherwise regress silently.
