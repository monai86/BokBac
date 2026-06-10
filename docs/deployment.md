# BokBac Local Execution & Deployment Manual

This document provides the maintained setup, build, and deployment path for BokBac. The only maintained app is the modern v4 Vite + React + TypeScript application in [`v2/`](../v2/). Legacy v3 is preserved under [`legacy/`](../legacy/) for reference and should not be used as the production deployment target.

---

## 1. Running Locally

The maintained app is built using Vite, React, and TypeScript.

To run the modern app locally:
```bash
# Navigate to the v2 workspace directory
cd v2

# Install dependencies from the lockfile (requires Node.js v22+)
npm ci

# Start the Vite local development server
npm run dev
```
Open the URL shown in the console (usually `http://localhost:5173`).

The maintained UI is login-first with explicit Guest Mode. If Firebase variables are absent, the app should still render the login page, allow Guest Mode, and save guest cases locally with `localStorage`.

---

## 2. Compiling the Production Bundle

To compile the TypeScript code and bundle assets for web deployment, execute:

```bash
cd v2

# Run linter checks
npm run lint

# Verify type safety
npm run typecheck

# Run unit and integration tests
npm run test

# Compile production build
npm run build
```

The output bundle is written to the [`v2/dist/`](../v2/dist/) directory. This directory is self-contained and ready to be hosted on any static site hosting provider.

---

## 3. Production Deployment: Cloudflare Workers Builds

The recommended hosting platform is **Cloudflare Workers Builds** for the current hosted setup.

Configure the Cloudflare Git-connected project using the following parameters:

| Configuration Setting | Value |
|---|---|
| **Path / Root Directory** | `v2` |
| **Build Command** | `npm run build` |
| **Deploy Command** | `npx wrangler deploy` |
| **Node.js Version** | `22` (or higher) |

The Worker deployment behavior is defined in [`v2/wrangler.jsonc`](../v2/wrangler.jsonc):

- `assets.directory = "./dist"`
- `assets.not_found_handling = "single-page-application"`

Because SPA routing is handled by Wrangler static-assets configuration, do **not** deploy a `v2/public/_redirects` rule that rewrites `/*` to `/index.html` in this flow. That redirect is valid for Pages-style hosting but can fail Workers deploy validation with an infinite-loop error.

### Deploying to Vercel (Modern Track)
Vercel is fully supported using the provided [`v2/vercel.json`](../v2/vercel.json) file. 
* **Build Command**: `npm run build`
* **Output Directory**: `dist`
* **Root Directory**: `v2`
* The routing rewrite is automatically applied by `vercel.json` so page refreshes do not yield 404 errors.

### Deploying to GitHub Pages (Subpath Hosting)
If hosting under a repository subpath (e.g., `https://<username>.github.io/BokBac/`):
1. **Base Path Configuration**: Update `v2/vite.config.ts` to include the `base` setting:
   ```typescript
   export default defineConfig({
     base: '/BokBac/', // Must match the repository name
     // ... rest of config
   })
   ```
2. **Routing Adjustments**: Because GitHub Pages lacks custom routing redirect fallbacks, you should change `BrowserRouter` in `v2/src/App.tsx` to `HashRouter` to prevent page refreshes on nested routes from returning 404 errors.


---

## 4. Security Hardening & Configuration

Before publishing the project to a public environment, review the following security considerations:

### 1. Firebase Environment Variables
If enabling Google Sign-In or Firestore case syncing:
* The v2 app reads Firebase settings from Vite environment variables.
* Use [`v2/.env.example`](../v2/.env.example) as the local template.
* Configure the same variables in Cloudflare Pages, Vercel, Netlify, or Firebase Hosting:
  ```bash
  VITE_FIREBASE_API_KEY=
  VITE_FIREBASE_AUTH_DOMAIN=
  VITE_FIREBASE_PROJECT_ID=
  VITE_FIREBASE_STORAGE_BUCKET=
  VITE_FIREBASE_MESSAGING_SENDER_ID=
  VITE_FIREBASE_APP_ID=
  VITE_FIREBASE_MEASUREMENT_ID=
  ```
* Do not commit `.env`, `.env.local`, real Firebase values, private service-account keys, or authentication tokens.

### 2. Firestore Security Rules
If using Firestore database sync, deploy the security rules in [`config/firestore.rules`](../config/firestore.rules) to enforce user isolation:
* Ensure users can only write or edit cases that they own (based on their authenticated user ID).
* Restrict public read access to system suites.

### 3. Build & Deployment Audit Checklist
* **Deployment target**: Production hosts must build from `v2`; for Workers Builds, Wrangler then publishes `v2/dist` using `v2/wrangler.jsonc`.
* **Excluding Reference Materials**: Ensure that no local reference textbooks, copyright PDFs, raw extraction CSVs, or local-only assets are included in the public deployment output directory.
* **HTTP Headers**: Use [`v2/public/_headers`](../v2/public/_headers) for security policies (e.g., Content-Security-Policy, X-Frame-Options, X-Content-Type-Options).
