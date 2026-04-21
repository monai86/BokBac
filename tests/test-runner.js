#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// MicrobialWorld Test Runner
// Run: node test-runner.js [functional|visual|all]
// ═══════════════════════════════════════════════════════════════

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TEST_CONFIG = {
  functional: {
    name: 'Functional Testing',
    description: 'Test calcProbability() algorithm with 19 bacteria test cases',
    run: () => {
      console.log('\n📋 FUNCTIONAL TEST INSTRUCTIONS:');
      console.log('1. Open index.html in browser');
      console.log('2. Press F12 to open DevTools → Console');
      console.log('3. Copy-paste all code from console_test.js');
      console.log('4. Check results: ✅ PASS / ❌ FAIL\n');
      
      // Show test summary
      const testCode = fs.readFileSync(path.join(__dirname, 'console_test.js'), 'utf8');
      const testCount = (testCode.match(/expect\(/g) || []).length;
      console.log(`🧪 Total test cases: ${testCount}`);
      console.log('📊 Categories: GPC CLUSTER, GPC CHAIN, NFB, GNB, GPC, MICROSCOPY\n');
    }
  },
  
  visual: {
    name: 'Visual Regression (TestSprite)',
    description: 'Pixel-perfect UI comparison across devices',
    run: () => {
      console.log('\n📸 VISUAL TEST SETUP:');
      console.log('Option 1 - Playwright + Pixelmatch (Recommended):');
      console.log('  npm init -y');
      console.log('  npm install playwright pixelmatch pngjs');
      console.log('  npx playwright install chromium');
      console.log('  node testsprite-runner.js\n');
      
      console.log('Option 2 - Manual Screenshot Comparison:');
      console.log('  1. Open index.html on different devices');
      console.log('  2. Take screenshots of each page');
      console.log('  3. Compare with reference images\n');
    }
  }
};

// Main runner
const args = process.argv.slice(2);
const testType = args[0] || 'all';

console.log('═══════════════════════════════════════════════════');
console.log('   🦠 MicrobialWorld Test Runner');
console.log('═══════════════════════════════════════════════════');

if (testType === 'functional' || testType === 'all') {
  TEST_CONFIG.functional.run();
}

if (testType === 'visual' || testType === 'all') {
  TEST_CONFIG.visual.run();
}

console.log('═══════════════════════════════════════════════════');
console.log('For CI/CD: Set TEST_URL environment variable');
console.log('Example: TEST_URL=https://yoursite.com node test-runner.js');
console.log('═══════════════════════════════════════════════════\n');
