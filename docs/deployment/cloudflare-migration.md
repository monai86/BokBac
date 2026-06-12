# Cloudflare Pages Deployment

Cloudflare Pages is the recommended production host for BokBac v4.

## Current Target

- Maintained app: `v2/`
- Build command: `npm run build`
- Output directory: `dist`
- Node.js version: `22` or higher
- Legacy app: `legacy/` reference only, not a deployment target

## Setup Steps

1. Push the repository to GitHub.
2. Open Cloudflare Dashboard → Workers & Pages → Create application → Pages.
3. Connect the GitHub repository.
4. Configure the Pages project:
   - **Project name:** `bokbac` or the preferred production name
   - **Production branch:** `main`
   - **Root directory:** `v2`
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node.js version:** `22`
5. Add Firebase environment variables only if Auth/Firestore sync is enabled.
6. Deploy.

## GitHub Actions Auto-Deploy

This repository now includes a production deploy job in [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml).

On every push to `main`, GitHub Actions will:

1. Run the maintained `v2` lint, typecheck, test, and build steps.
2. Run the legacy validation script.
3. Deploy to `https://bokbac.pages.dev` with Wrangler only after the checks pass.

Add these GitHub repository secrets before expecting automatic production deploys:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Recommended token scope: allow Wrangler deployment for the target Cloudflare account/project only.

## Firebase Variables

Set these in Cloudflare Pages → Settings → Environment variables when Firebase is enabled:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

Do not commit real Firebase values to the repository.

## Files Involved

| File | Purpose |
| --- | --- |
| `v2/public/_redirects` | SPA route fallback for Cloudflare Pages |
| `v2/public/_headers` | Security headers copied into the build |
| `v2/.env.example` | Local Firebase variable template |
| `config/netlify.toml` | Optional Netlify template targeting `v2/dist` |
