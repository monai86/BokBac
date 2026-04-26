# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
