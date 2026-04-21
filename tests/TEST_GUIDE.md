# 🧪 MicrobialWorld Testing Guide

## 1. Functional Testing (console_test.js)

### วิธีรัน
1. เปิด `index.html` ใน browser
2. กด F12 → Console
3. Copy-paste โค้ดทั้งหมดจาก `console_test.js`
4. ดูผลลัพธ์ใน Console

### Test Coverage (19 test cases)

| Category | Test Cases |
|----------|-----------|
| **GPC CLUSTER** | S. aureus, S. saprophyticus, CoNS |
| **GPC CHAIN** | S. pyogenes, S. agalactiae, S. pneumoniae, E. faecalis, E. faecium |
| **NFB** | P. aeruginosa, P. fluorescens, P. stutzeri, S. maltophilia, B. pseudomallei, A. baumannii |

### Expected Output
```
══ GPC CLUSTER (Staphylococcus / Micrococcus) ══
✅ PASS: S. aureus: Catalase+ Coagulase+ Oxidase− → #1: S. aureus (91%)
✅ PASS: S. saprophyticus: Catalase+ Coagulase− Novobiocin R → #1: S. saprophyticus (73%)
✅ PASS: CoNS: Catalase+ Coagulase− Novobiocin S → #1: S. epidermidis (67%)

══ GPC CHAIN (Streptococcus / Enterococcus) ══
✅ PASS: S. pyogenes: β-hemolysis + Bacitracin S + PPR− → #1: S. pyogenes (88%)
...
```

---

## 2. Visual Testing (TestSprite)

### TestSprite คืออะไร?
**Visual Regression Testing** - เปรียบเทียบ screenshot UI ก่อน/หลัง deploy แบบ pixel-by-pixel

### วิธีตั้งค่า

#### Option A: Playwright + Pixelmatch (Recommended)

```bash
# 1. Install dependencies
npm init -y
npm install playwright pixelmatch pngjs
npx playwright install chromium

# 2. Create test script
node testsprite-runner.js
```

#### Option B: Manual Testing Checklist

| Page | Desktop | Tablet | Mobile |
|------|---------|--------|--------|
| Login | ☐ | ☐ | ☐ |
| Specimen Guide | ☐ | ☐ | ☐ |
| Diagnostic Flow | ☐ | ☐ | ☐ |
| Bacteria Library | ☐ | ☐ | ☐ |
| Test Suites | ☐ | ☐ | ☐ |

---

## 3. Manual Testing Scenarios

### Scenario 1: S. aureus Identification
1. เลือก Gram stain: GPC in Cluster
2. เลือก Catalase: +
3. เลือก Coagulase: +
4. **Expected**: S. aureus ต้องเป็น #1 ด้วย probability ≥ 70%

### Scenario 2: Complete Workflow
1. Login → Guest Mode
2. Go to Diagnostic page
3. เลือก test results ครบทุก required field
4. กด Calculate → ดู probability results
5. Save case → ตรวจสอบใน Cases page

### Scenario 3: Responsive Check
1. เปิด DevTools (F12)
2. Toggle Device Toolbar (Ctrl+Shift+M)
3. Test: iPhone 12 Pro, iPad, Desktop
4. ตรวจสอบ: ไม่มี horizontal scroll, touch target ≥ 44px

---

## 4. TestSprite Runner Script

```javascript
// testsprite-runner.js
const { chromium } = require('playwright');
const pixelmatch = require('pixelmatch');
const PNG = require('pngjs').PNG;
const fs = require('fs');

const CONFIG = {
  url: 'https://microbialworld.pages.dev',
  viewports: [
    { name: 'mobile', width: 375, height: 812 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1440, height: 900 }
  ],
  pages: ['/', '#/specimen', '#/workflow', '#/library']
};

async function captureScreenshots() {
  const browser = await chromium.launch();
  
  for (const page of CONFIG.pages) {
    for (const vp of CONFIG.viewports) {
      const context = await browser.newContext({ viewport: vp });
      const p = await context.newPage();
      await p.goto(`${CONFIG.url}${page}`);
      await p.waitForTimeout(2000); // Wait for animations
      
      const screenshot = await p.screenshot({ fullPage: true });
      const filename = `${page.replace('#', '')}_${vp.name}.png`;
      fs.writeFileSync(`./screenshots/${filename}`, screenshot);
      
      await context.close();
    }
  }
  
  await browser.close();
}

captureScreenshots();
```

---

## 5. CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
  functional:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Functional Tests
        run: node test-runner.js functional
  
  visual:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Playwright
        run: npm install playwright pixelmatch
      - name: Run Visual Tests
        run: node testsprite-runner.js
```

---

## Quick Start

```bash
# Run all tests
node test-runner.js all

# Run specific test
node test-runner.js functional
node test-runner.js visual

# Interactive mode
node test-runner.js --interactive
```
