# Microbial World v4

Modern rewrite of the bacterial identification web app using Vite + React 19 + TypeScript.

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
npm install
npm run dev          # http://localhost:5173

# Testing (50 textbook scenarios)
npm run test         # one-shot
npm run test:watch   # watch mode

# Production
npm run build        # outputs to dist/
npm run preview      # preview built bundle
```

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

## 🚀 Deployment (Cloudflare Pages)

Connect this repo to Cloudflare Pages with:

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Output directory | `dist` |
| Root directory | `v2` |
| Node version | `22` |

The `public/_headers` and `public/_redirects` files are picked up automatically.
