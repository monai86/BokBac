# Microbial World v4

Modern rewrite of the bacterial identification web app using Vite + React 19 + TypeScript.

## Version

Current modern app version: `v4.0.2`

Legacy v3 remains `3.1.1` in the root `VERSION` file. The modern v4 version is authoritative in [`v2/package.json`](v2/package.json).

## 🛠 Tech Stack

| Layer | Tool | Why |
|---|---|---|
| Build | **Vite 6** | Sub-second HMR, modern bundling |
| UI | **React 19** + **TypeScript 5.7** | Type-safe components |
| Styling | **Tailwind CSS v3** + custom Liquid Glass | Utility-first + design system |
| State | **Zustand** | 1.5 KB store, no boilerplate |
| Routing | **React Router v7** | SPA navigation |
| Tests | **Vitest 3** + **jsdom** | 50/50 textbook scenarios PASS |
| Deploy | **Cloudflare Pages** | Free CDN, auto-deploy via GitHub |

## 🚀 Commands

```bash
# Development
npm ci
npm run dev          # http://localhost:5173

# Testing (50 textbook scenarios)
npm run lint         # static analysis
npm run typecheck    # TypeScript project check
npm run test         # one-shot
npm run test:watch   # watch mode
npm run test:e2e     # browser flow tests (Playwright)

# Production
npm run build        # outputs to dist/
npm run preview      # preview built bundle
```

## Firebase Environment

Firebase Auth/Firestore is optional. The app reads Firebase client config from Vite environment variables:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

Use [`v2/.env.example`](v2/.env.example) as the template for local development and configure the same names in the hosting provider. Keep `.env`, `.env.local`, and real project values out of git.

## Auth And Guest Access

The app shell is protected by default. Opening `/`, `/cases`, `/library`, `/reference`, `/suites`, `/settings`, or `/about` redirects unauthenticated users to `/login`. From there, users can sign in with Firebase-backed email or Google authentication, or explicitly choose Guest Mode. Guest Mode is local-only, persists in the browser until sign-out or storage reset, and does not bypass the educational disclaimer or diagnostic workflow safeguards.

## 📁 Structure

```
src/
├── components/        # UI components
│   ├── Layout.tsx
│   ├── GroupSelector.tsx
│   ├── TestSelector.tsx
│   ├── SpeciesCard.tsx
│   ├── ConfidenceBadge.tsx
│   └── McmBadge.tsx
├── pages/
│   ├── IdentifyPage.tsx    # Main identification UI
│   ├── LibraryPage.tsx     # Searchable species catalog
│   ├── SpeciesDetailPage.tsx
│   └── AboutPage.tsx
├── store/
│   └── identifyStore.ts    # Zustand state
├── lib/                    # Pure logic — no React deps
│   ├── types.ts            # Species, McmEntry, RankedSpecies
│   ├── testMatcher.ts      # Biochemical matching
│   ├── mcmAdapter.ts       # MCM_TEST_MAP + likelihood + priors
│   ├── bayesianEngine.ts   # Naive Bayes algorithm
│   ├── dataLoader.ts       # Normalized exports
│   └── bayesianEngine.test.ts  # 50 scenarios
├── data/
│   ├── bacteriaLibrary.ts  # LIBRARY + SUITES (from js/data.js)
│   └── mcmData.ts          # MCM_DATA (from js/mcm_data.js)
├── App.tsx
├── main.tsx
└── index.css               # Tailwind directives + Liquid Glass
```

## 🧪 Algorithm

Same Naive Bayes engine as legacy v3.1.1, ported to TypeScript:

1. **Hard exclusion** — oxidase / catalase / coagulase / hemolysis mismatch → 0%
2. **Per-test log-likelihood** — from MCM published % positivity
3. **Fallback** — LIBRARY +/-/V → 90/50/10% at 0.7 weight
4. **Prevalence priors** — `++++` → 1.0, `+++` → 0.40, `++` → 0.20, `+` → 0.10
5. **Softmax** — calibrated probabilities sum to 100%
6. **Coverage scaling** — penalty for low test count
7. **Confidence label** — HIGH / MEDIUM / LOW / UNCERTAIN

## 📊 Coverage

- **157 species** total
- **93 species** with full MCM biochemical % positivity
- **8 bacterial groups**: Enterobacterales, NFB, Vibrio, GPC cluster/chain, GPB, GN coccobacilli
- **50/50 textbook scenarios** PASS

## Workflow Features

- **Result explanation panel** shows confidence, runner-up gap, MCM evidence coverage, key-test alignment, hard exclusions, and per-test evidence for the leading species.
- **Runner-up comparison** highlights which answered tests separate the leading species from the nearest alternative.
- **Local saved cases** lets users save, rename, tag, search, export, reload, and delete recent identification sessions in browser localStorage.
- **Library browser** adds searchable, group-filtered access to the full 157-species catalog.
- **Species detail pages** surface colony morphology, gram stain, biochemical rows, media, and clinical teaching notes per organism.
- **Accessible controls** expose pressed state and descriptive labels for group selection, biochemical answers, reset, save, load, and delete actions.
- **Browser-level QA** covers the main identify, explain, save, reset, and reload workflow in desktop and mobile Chromium.

## Backend/Auth Readiness

The v4 app remains static-hostable and deploys to Cloudflare Pages. Firebase is optional for authenticated sync; guest users continue to save cases locally. If multi-user sync expands later, keep saved case contracts compatible with `SavedCase` in `src/lib/types.ts` and add server-side validation around:

- case ownership and sharing permissions
- immutable audit timestamps for created/updated cases
- protected export/import flows
- PHI/PII guidance before storing real clinical data

## 🚀 Deployment (Cloudflare Workers Builds)

Connect this repo to Cloudflare Workers Builds with:

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Root directory / Path | `v2` |
| Node version | `22` |

The Wrangler config in [`v2/wrangler.jsonc`](v2/wrangler.jsonc) points Workers static assets at `dist/` and enables SPA fallback with `assets.not_found_handling = "single-page-application"`. Keep [`v2/public/_headers`](v2/public/_headers) for security headers; do not use a `public/_redirects` SPA rule with this Workers deploy flow because Wrangler validates redirects separately and can reject looping `index.html` rewrites.

Security headers include a self-only CSP, frame protection, MIME sniffing protection, referrer policy, and disabled camera/microphone/geolocation permissions.
