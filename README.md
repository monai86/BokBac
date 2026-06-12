# BokBac — Interactive Educational Bacterial Identification

BokBac is an interactive educational web application and decision-support tool designed for medical technology students, microbiology educators, and software reviewers. It demonstrates how clinical microbiology reasoning, standard biochemical testing, and Bayesian probability models intersect to identify bacterial species.

The maintained modern app uses a login-first workflow. Users start at the login page, then either sign in for account-linked settings and cloud sync or explicitly continue as guests for local-only case storage.

> [!WARNING]
> **Clinical Safety & Usage Disclaimer**: BokBac is strictly an educational tool and simulation platform. It **must not** be used for clinical diagnosis, patient management, or to replace standard professional microbiology laboratory confirmation (e.g., automated systems, culture confirmation, or mass spectrometry). It does not guarantee clinical accuracy.

---

## 📌 Version History & Track Authority

* **Maintained Modern Track (v4.x)**: Built using Vite + React + TypeScript, located in the [`v2/`](v2/) directory. **This is the only maintained version of the application.** Its version authority is [`v2/package.json`](v2/package.json).
* **Archived Legacy Track (v3.x)**: Built using static React/Babel, archived in the [`legacy/`](legacy/) directory. Its version authority is [`VERSION`](VERSION), currently `3.1.1`.

| Track | Version | Release Date | Status | Description |
|---|---|---|---|---|
| **Modern v4** | **4.0.0** | 2026-06-10 | **Maintained** | Modern Vite rewrite, TypeScript type safety, custom suites, information-gain recommendation |
| **Legacy v3** | **3.1.1** | 2026-04-27 | *Archived* | Expanded Validation Suite (50 scenarios, 8 groups, Dichotomous Key concordance) |
| **Legacy v3** | **3.1.0** | 2026-04-26 | *Archived* | MCM coverage expanded to 157 species (93 with full positivity data) |
| **Legacy v3** | **3.0.0** | 2026-04-26 | *Archived* | MCM 11th Edition Bayesian Probability Engine (Naive Bayes + clinical priors) |
| **Legacy v3** | **2.0.0** | 2026-04-26 | *Archived* | Liquid Glass Design System + Project Modularization |
| **Legacy v3** | **1.0.0** | 2026-04-XX | *Archived* | Initial Release - Single File React App |

---

## 📖 Project Documentation Index

For detailed reviews of the engineering, algorithms, and design choices behind BokBac, refer to the following sub-topic guides:

1. **[Algorithm & Probability Engine Guide](docs/algorithm.md)**
   * Explains the Gram stain-first workflow gate check.
   * Details the Naive Bayes scoring formulas, numeric smoothing ($\epsilon = 0.02$), clinical prevalence priors, and typicality indexes.
   * Formulates the "Next-Best-Test" recommendation engine via Information Gain / Shannon Entropy.
2. **[Validation & Benchmark Suite](docs/validation.md)**
   * Documents the 50 textbook scenarios used to validate engine accuracy.
   * Compares Bayesian probabilistic outcomes to traditional dichotomous key (DK) logic.
   * Describes how validation runs locally and in Continuous Integration (CI).
3. **[User & Workflow Guide](docs/user-guide.md)**
   * Provides a walkthrough of isolate workup steps, test suites, and custom suite creation.
   * Explains user-facing confidence badges and the interactive recommendations panel.
   * Details the JSON structure of Saved Cases.
4. **[System Limitations & Clinical Safety](docs/limitations.md)**
   * Critically evaluates the independence assumption of Naive Bayes in biological contexts.
   * Defines data boundaries (137 species coverage) and known clinical trade-offs.
5. **[Local Execution & Deployment Guide](docs/deployment.md)**
   * Explains how to run and deploy the maintained modern v4 app.
   * Provides Cloudflare Pages, Vercel, Netlify, and Firebase Hosting settings that point to `v2/dist`.
   * Covers Firebase environment variables, security rules, and secret hygiene.

---

## 📂 Repository Structure

```
/ (Root Workspace)
├── AGENTS.md               # Project-wide instructions for AI assistant tools
├── .project-skills/        # Project-local workflows and reference sheets
├── legacy/                 # Archived Legacy Track v3.x (static React/Babel)
│   ├── index.html          # Legacy HTML entry point
│   ├── css/
│   │   └── styles.css      # Legacy stylesheet
│   └── js/
│       ├── data.js         # Legacy library data
│       └── mcm_data.js     # Legacy MCM data
├── docs/                   # Secondary documentation, technical manuals, and slide decks
│   ├── algorithm.md        # Technical breakdown of calculation models
│   ├── validation.md       # 50 validation scenarios and dichotomous key comparisons
│   ├── user-guide.md       # User manuals, interface workflows, and custom suites
│   ├── limitations.md      # Scientific and statistical caveats
│   └── deployment.md       # Local developer startup and hosting guidelines
├── scripts/                # Data extraction/parsing and legacy validation helpers
│   ├── parse_mcm_*.py      # Genus-group text extraction and parsers
│   ├── generate_mcm_js.py  # Compiler for mcm_extract/parsed JSON → legacy/js/mcm_data.js & v2
│   └── test_bayes.mjs      # Node.js console validation suite (50 scenarios)
├── v2/                     # Modern Track v4.x (Vite + React + TypeScript)
│   ├── src/lib/            # Bayesian engine, adapters, and Shannon entropy recommendation
│   └── package.json        # NPM scripts and dependencies for modern v4.x
├── config/                 # Optional deployment config templates targeting v2/dist
├── VERSION                 # Version authority for Legacy v3.x
└── CHANGELOG.md            # Git changelog history
```

---

## ⚡ Quick Start for Developers

### Maintained Modern Track (v4.x)
The repository root now proxies the standard npm commands to the maintained `v2/` app, so the default local workflow is:

```bash
# Install dependencies for the maintained app
cd v2
npm ci
cd ..

# Start the maintained local app on http://127.0.0.1:5173
npm run dev

# Run static linting checks
npm run lint

# Run TypeScript typechecks
npm run typecheck

# Run unit and integration tests (Vitest)
npm run test

# Build production assets
npm run build
```

If you want to work inside the Vite app directory directly, the equivalent commands remain:

```bash
# Navigate to the maintained application directory
cd v2

# Install dependencies (use npm ci for clean builds)
npm ci

# Run local development server
npm run dev

# Run static linting checks
npm run lint

# Run TypeScript typechecks
npm run typecheck

# Run unit and integration tests (Vitest)
npm run test

# Build production assets
npm run build
```

To create a shareable source archive from the repository root:

```bash
scripts/create_export_zip.sh
```

The export helper excludes Git metadata, dependency folders, build outputs, local deployment caches, test reports, macOS archive folders, logs, and environment files.

Firebase is optional. To enable Firebase Auth/Firestore in v2, copy [`v2/.env.example`](v2/.env.example) to `v2/.env.local` and fill:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

Do not commit `v2/.env`, `v2/.env.local`, or any real Firebase values.

### Archived Legacy Track (v3.x)
The legacy app is archived under [`legacy/`](legacy/) and is no longer actively maintained. 
- To run it locally, serve the directory: `npx serve legacy` or open [`legacy/index.html`](legacy/index.html) in your browser.
- To run the legacy Node Naive Bayes validation script: `node scripts/test_bayes.mjs` (loads data from `legacy/js/mcm_data.js`).

For full setup guidelines, including deployment variables and build configurations, see the **[Local Execution & Deployment Guide](docs/deployment.md)**.
