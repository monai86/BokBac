# Release and Deploy Reference

## Versioning

This repository has two version tracks:

- Root legacy v3: `VERSION`, root `CHANGELOG.md`, root `README.md`.
- Modern v4: `v2/package.json`, `v2/README.md`, and CI/deploy settings.

Before bumping, decide which track changed.

## Bump Rules

- MAJOR: breaking behavior, major scope expansion, migration that changes compatibility.
- MINOR: new feature, backward-compatible capability, meaningful UI/UX addition.
- PATCH: bug fix, small behavior correction, small improvement.
- No bump: formatting-only, comments-only, internal cleanup with no behavior change, unless release docs explicitly require it.

## Required Release Edits

For legacy v3 release:

1. Update `VERSION`.
2. Add top entry to `CHANGELOG.md`.
3. Update root `README.md` version history and current version text.
4. Run `node scripts/test_bayes.mjs`.

For modern v4 release:

1. Update `v2/package.json` version.
2. Update `v2/README.md` if commands, coverage, architecture, or deploy settings changed.
3. Update root docs if the project-level overview/version table references v4.
4. Run `npm run test` and `npm run build` in `v2/`.

## Commit Style

Use Conventional Commits:

```text
feat(scope): Add concise subject
fix(scope): Correct concise subject
docs(scope): Update concise subject
refactor(scope): Improve concise subject
test(scope): Cover concise subject
ci(scope): Update concise subject
```

Prefer subject lines under 50 characters. Explain what and why in the body when the change is non-obvious.

## Deploy

Recommended production target: Cloudflare Pages.

Legacy static root:

- Build command: empty
- Output directory: `/`

Modern v4:

- Root directory: `v2`
- Build command: `npm run build`
- Output directory: `dist`
- Node version: `22`

Before public sharing:

- Check `_headers` and `_redirects`.
- Check Firebase config separation and Firestore rules if auth/data storage is used.
- Confirm no private PDFs, CSVs, raw extraction materials, secrets, or local-only files are included in deployment output.
