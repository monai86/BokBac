#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// TestSprite Visual Regression Runner
// Requires: npm install playwright pixelmatch pngjs
// ═══════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');

// Check if dependencies are installed
try {
  require.resolve('playwright');
  require.resolve('pixelmatch');
  require.resolve('pngjs');
} catch (e) {
  console.log('⚠️  Dependencies not found. Install first:\n');
  console.log('npm install playwright pixelmatch pngjs');
  console.log('npx playwright install chromium\n');
  process.exit(1);
}

const { chromium } = require('playwright');
const pixelmatch = require('pixelmatch');
const { PNG } = require('pngjs');

const CONFIG = {
  baseUrl: process.env.TEST_URL || 'https://microbialworld.pages.dev',
  viewports: [
    { name: 'mobile', width: 375, height: 812, deviceScaleFactor: 2 },
    { name: 'tablet', width: 768, height: 1024, deviceScaleFactor: 2 },
    { name: 'desktop', width: 1440, height: 900, deviceScaleFactor: 1 }
  ],
  pages: [
    { path: '/', name: 'login' },
    { path: '/#/specimen', name: 'specimen' },
    { path: '/#/workflow', name: 'workflow' },
    { path: '/#/library', name: 'library' },
    { path: '/#/tests', name: 'tests' },
    { path: '/#/suites', name: 'suites' }
  ],
  outputDir: './testsprite-screenshots',
  baselineDir: './testsprite-baseline',
  threshold: 0.1, // 10% pixel difference allowed
  delay: 2000 // ms to wait for animations
};

// Ensure directories exist
[CONFIG.outputDir, CONFIG.baselineDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

async function captureScreenshot(page, viewport, pageConfig) {
  const filename = `${pageConfig.name}_${viewport.name}.png`;
  const outputPath = path.join(CONFIG.outputDir, filename);
  const baselinePath = path.join(CONFIG.baselineDir, filename);
  
  console.log(`📸 Capturing: ${pageConfig.name} @ ${viewport.name}`);
  
  // Set viewport
  await page.setViewportSize({ 
    width: viewport.width, 
    height: viewport.height 
  });
  
  // Navigate and wait for load
  await page.goto(`${CONFIG.baseUrl}${pageConfig.path}`, {
    waitUntil: 'networkidle',
    timeout: 30000
  });
  
  // Wait for animations to complete
  await page.waitForTimeout(CONFIG.delay);
  
  // Capture screenshot
  const screenshot = await page.screenshot({ 
    fullPage: true,
    type: 'png'
  });
  
  fs.writeFileSync(outputPath, screenshot);
  
  // Compare with baseline if exists
  if (fs.existsSync(baselinePath)) {
    const diff = await compareImages(baselinePath, outputPath);
    return { filename, diff };
  } else {
    console.log(`   ⚠️  No baseline for ${filename}, creating new reference`);
    fs.copyFileSync(outputPath, baselinePath);
    return { filename, diff: null };
  }
}

async function compareImages(baselinePath, currentPath) {
  const baseline = PNG.sync.read(fs.readFileSync(baselinePath));
  const current = PNG.sync.read(fs.readFileSync(currentPath));
  
  const { width, height } = baseline;
  const diff = new PNG({ width, height });
  
  const numDiffPixels = pixelmatch(
    baseline.data, 
    current.data, 
    diff.data, 
    width, 
    height, 
    { threshold: CONFIG.threshold }
  );
  
  const diffPercentage = (numDiffPixels / (width * height)) * 100;
  
  // Save diff image if there are differences
  if (numDiffPixels > 0) {
    const diffPath = path.join(CONFIG.outputDir, `diff_${path.basename(currentPath)}`);
    fs.writeFileSync(diffPath, PNG.sync.write(diff));
  }
  
  return {
    numDiffPixels,
    diffPercentage: diffPercentage.toFixed(2)
  };
}

async function runTests() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('   🎨 TestSprite Visual Regression Testing');
  console.log(`   Target: ${CONFIG.baseUrl}`);
  console.log('═══════════════════════════════════════════════════\n');
  
  const browser = await chromium.launch();
  const results = [];
  
  for (const pageConfig of CONFIG.pages) {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    for (const viewport of CONFIG.viewports) {
      try {
        const result = await captureScreenshot(page, viewport, pageConfig);
        results.push({ ...result, page: pageConfig.name, viewport: viewport.name });
        
        if (result.diff) {
          const status = parseFloat(result.diff.diffPercentage) > CONFIG.threshold * 100 
            ? '❌ FAIL' 
            : '✅ PASS';
          console.log(`   ${status} - Diff: ${result.diff.diffPercentage}%`);
        }
      } catch (error) {
        console.error(`   ❌ ERROR: ${error.message}`);
        results.push({ 
          filename: `${pageConfig.name}_${viewport.name}.png`, 
          error: error.message 
        });
      }
    }
    
    await context.close();
  }
  
  await browser.close();
  
  // Summary
  console.log('\n═══════════════════════════════════════════════════');
  console.log('   📊 Test Summary');
  console.log('═══════════════════════════════════════════════════');
  console.log(`Total captures: ${results.length}`);
  console.log(`Passed: ${results.filter(r => r.diff && parseFloat(r.diff.diffPercentage) <= CONFIG.threshold * 100).length}`);
  console.log(`Failed: ${results.filter(r => r.diff && parseFloat(r.diff.diffPercentage) > CONFIG.threshold * 100).length}`);
  console.log(`Errors: ${results.filter(r => r.error).length}`);
  console.log(`\nScreenshots saved to: ${CONFIG.outputDir}/`);
  console.log('═══════════════════════════════════════════════════\n');
  
  // Save report
  const reportPath = path.join(CONFIG.outputDir, 'report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`📄 Report saved: ${reportPath}`);
}

// Handle CLI arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: node testsprite-runner.js [options]

Options:
  --url <url>      Set target URL (default: ${CONFIG.baseUrl})
  --threshold <n>  Set pixel diff threshold (default: ${CONFIG.threshold})
  --delay <ms>     Set animation delay (default: ${CONFIG.delay}ms)
  --help           Show this help

Environment Variables:
  TEST_URL         Override base URL

Examples:
  node testsprite-runner.js
  node testsprite-runner.js --url http://localhost:3000
  TEST_URL=http://localhost:3000 node testsprite-runner.js
`);
  process.exit(0);
}

// Parse arguments
args.forEach((arg, i) => {
  if (arg === '--url' && args[i + 1]) CONFIG.baseUrl = args[i + 1];
  if (arg === '--threshold' && args[i + 1]) CONFIG.threshold = parseFloat(args[i + 1]);
  if (arg === '--delay' && args[i + 1]) CONFIG.delay = parseInt(args[i + 1]);
});

runTests().catch(console.error);
