# BokBac Local Execution & Deployment Manual

This document provides a technical guide for setting up, running, building, and deploying the BokBac project in both local development environments and production hosting environments.

---

## 1. Running Locally

BokBac contains two separate tracks that run differently.

### Track 1: Legacy v3.x Static Application (Root Directory)
The legacy track is a pure client-side application. It loads React 18, ReactDOM, and Babel standalone from CDNs.

* **Option A: Direct File Open**:
  You can run the application offline by double-clicking the root [`index.html`](../index.html) file.
* **Option B: Local Static Server**:
  To serve the files with proper HTTP headers and simulate hosting behavior:
  ```bash
  # Install and run a simple static server
  npx serve .
  ```
  Open `http://localhost:3000` (or the port specified) in your browser.

### Track 2: Modern v4.x Vite Application (Located in `v2/`)
The modern track is built using Vite, React 18, and TypeScript.

To run the modern app locally:
```bash
# Navigate to the v2 workspace directory
cd v2

# Install dependencies (requires Node.js v22+)
npm install

# Start the Vite local development server
npm run dev
```
Open the URL shown in the console (usually `http://localhost:5173`).

---

## 2. Compiling the Production Bundle (Modern Track)

To compile the TypeScript code and bundle assets for web deployment, execute:

```bash
cd v2

# Verify type safety
npm run typecheck

# Run linter checks
npm run lint

# Compile production build
npm run build
```

The output bundle is written to the [`v2/dist/`](../v2/dist/) directory. This directory is self-contained and ready to be hosted on any static site hosting provider.

---

## 3. Production Deployment: Cloudflare Pages

The recommended hosting platform for both tracks is **Cloudflare Pages**.

### Deploying the Modern Vite Track (v4.x)
Configure the Cloudflare Pages project using the following parameters:

| Configuration Setting | Value |
|---|---|
| **Root Directory** | `v2` |
| **Framework Preset** | `Vite` |
| **Build Command** | `npm run build` |
| **Build Output Directory** | `dist` |
| **Node.js Version** | `22` (or higher) |

### Deploying the Legacy Static Track (v3.x)
If deploying the legacy app directly from the repository root:

| Configuration Setting | Value |
|---|---|
| **Root Directory** | `/` (Repository root) |
| **Build Command** | *Leave empty* |
| **Build Output Directory** | `/` (Repository root) |

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

### 1. Firebase API Configuration Separation
If enabling Google Sign-In or Firestore case syncing:
* The application loads configuration settings from `firebase-config.js` at runtime.
* For security, the actual active `firebase-config.js` is excluded from git version control via `.gitignore`.
* A template file is provided at [`config/firebase-config.example.js`](../config/firebase-config.example.js). Copy this template to create your local config:
  ```bash
  cp config/firebase-config.example.js firebase-config.js
  # Edit firebase-config.js to insert your actual Firebase developer credentials
  ```
* Do not commit your private API keys or authentication credentials to the repository.

### 2. Firestore Security Rules
If using Firestore database sync, deploy the security rules in [`config/firestore.rules`](../config/firestore.rules) to enforce user isolation:
* Ensure users can only write or edit cases that they own (based on their authenticated user ID).
* Restrict public read access to system suites.

### 3. Build & Deployment Audit Checklist
* **Excluding Reference Materials**: Ensure that no local reference textbooks, copyright PDFs, raw extraction CSVs, or internal scripts are included in the public deployment output directory.
* **HTTP Headers**: Configure [`_headers`](../_headers) to set security policies (e.g., Content-Security-Policy, X-Frame-Options, X-Content-Type-Options) to protect client sessions.
