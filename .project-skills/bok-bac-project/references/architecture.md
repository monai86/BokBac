# Architecture Reference

## Product Lines

This repository contains a legacy static app and a modern rewrite.

## Root Legacy v3

Primary files:

- `index.html`: HTML shell, inline React/Babel components, UI behavior, probability engine.
- `css/styles.css`: dark Liquid Glass UI and responsive styling.
- `js/data.js`: navigation, organism library, test suites, aliases, media/reagent data.
- `js/mcm_data.js`: generated MCM 11th biochemical positivity and prevalence data.
- `scripts/`: extraction, parsing, generation, and legacy validation pipeline.
- `VERSION`, `CHANGELOG.md`, `README.md`, `docs/development/development-workflow.md`: v3 version and workflow docs.

Important constraints:

- `js/mcm_data.js` is generated. Prefer updating generator/parsers before manual data edits.
- Keep `index.backup.html` as rollback reference only; do not use it as canonical source.
- `firebase-config.js` is optional and sensitive. Do not hard-code private project credentials beyond the existing public Firebase client config pattern.

## Modern v4 in `v2/`

Primary files:

- `v2/src/pages/IdentifyPage.tsx`: main identification workflow UI.
- `v2/src/components/`: reusable UI components.
- `v2/src/store/identifyStore.ts`: Zustand state.
- `v2/src/lib/`: pure logic with no React dependency.
- `v2/src/data/bacteriaLibrary.ts`: library and suites ported from legacy data.
- `v2/src/data/mcmData.ts`: MCM data ported from generated legacy output.
- `v2/package.json`: v4 version and npm commands.

Architecture rules:

- Keep computation in `src/lib/`, not React components.
- Keep user interaction state in `src/store/`.
- Keep visual changes consistent with the existing Liquid Glass + Tailwind design.
- Prefer type-safe changes and focused Vitest scenarios for logic changes.

## Version Authority

- Root `VERSION` currently describes the legacy v3 line.
- `v2/package.json` describes the modern v4 line.
- If docs mention old values, clarify whether the change updates v3, v4, or both.

## Repository Organization

- Keep root focused on deploy/runtime entry points and project metadata.
- Keep secondary development docs in `docs/development/`.
- Keep deployment guides in `docs/deployment/`.
- Keep deprecated local-only files in `archive/`; active legacy data is `js/data.js` and `js/mcm_data.js`.
- Keep protected local reference PDFs/CSVs in `assets/references/local/`.
