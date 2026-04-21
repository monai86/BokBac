// ═══════════════════════════════════════════════════════════════
// TestSprite Configuration for MicrobialWorld
// Visual Regression Testing Setup
// ═══════════════════════════════════════════════════════════════

module.exports = {
  // Target URLs to test
  urls: [
    'http://localhost:3000',           // Login page
    'http://localhost:3000/#/specimen', // Specimen guide
    'http://localhost:3000/#/workflow', // Diagnostic workflow
    'http://localhost:3000/#/library',   // Bacteria library
    'http://localhost:3000/#/tests',    // Biochemical tests
  ],

  // Viewport sizes to test
  viewports: [
    { name: 'mobile', width: 375, height: 812 },     // iPhone
    { name: 'tablet', width: 768, height: 1024 },    // iPad portrait
    { name: 'desktop', width: 1440, height: 900 },   // Desktop
  ],

  // Selectors to capture (full page vs specific elements)
  selectors: [
    'document',                                      // Full page
    '.nav-bar',                                      // Navigation
    '.login-card',                                   // Login form
    '.workflow-container',                           // Diagnostic flow
    '.bacteria-card',                                // Library cards
  ],

  // Threshold for pixel difference (0.1 = 10%)
  threshold: 0.1,

  // Delay before capture (ms) - wait for animations
  delay: 2000,

  // Output directory
  outputDir: './testsprite-screenshots',

  // Reference images directory (baseline)
  referenceDir: './testsprite-baseline',
};
