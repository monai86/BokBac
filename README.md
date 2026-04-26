# BOK BAC — Premium Diagnostic Guide

ระบบวินิจฉัยเชื้อแบคทีเรียแบบ Interactive สำหรับนักเทคนิคการแพทย์

---

## 📌 Version History (ประวัติเวอร์ชัน)

| Version | Date | Description |
|---------|------|-------------|
| **3.0.0** | 2026-04-26 | MCM 11th Bayesian Probability Engine — Naive Bayes + clinical priors |
| **2.0.0** | 2026-04-26 | Liquid Glass Design System + Project Modularization |
| **1.0.0** | 2026-04-XX | Initial Release - Single File React App |

**Current Version**: `3.0.0` — See [`CHANGELOG.md`](CHANGELOG.md) for detailed changes

### Semantic Versioning (SemVer)

โปรเจกต์นี้ใช้มาตรฐาน **Semantic Versioning** (`MAJOR.MINOR.PATCH`):

- **MAJOR** (`X.0.0`): Breaking changes, incompatible modifications
- **MINOR** (`x.Y.0`): New features, backwards compatible  
- **PATCH** (`x.y.Z`): Bug fixes, small improvements

**ไฟล์ที่เกี่ยวข้อง**:
- [`VERSION`](VERSION) — เวอร์ชันปัจจุบัน
- [`CHANGELOG.md`](CHANGELOG.md) — รายละเอียดการเปลี่ยนแปลงทั้งหมด

---

## โครงสร้างไฟล์ (Refactored)

```
/Users/porschecaa/Desktop/NewML/
├── index.html              # HTML structure + React components
├── css/
│   └── styles.css          # All CSS styles (dark theme, animations, responsive)
├── js/
│   ├── data.js             # Data constants (PAGES, LIBRARY, SUITES, etc.)
│   └── mcm_data.js         # MCM 11th edition reference data (% positivity + prevalence)
├── firebase-config.js      # Firebase configuration (API keys, auth settings)
├── VERSION                 # Current version number (SemVer)
├── CHANGELOG.md            # Detailed version history
├── README.md               # This file
└── index.backup.html       # Original single-file backup (for rollback)
```

### รายละเอียดไฟล์

#### `index.html`
- **Framework**: React 18 + Babel (inline JSX transformation)
- **Content**: React components, hooks, probability engine, UI logic
- **Dependencies**: โหลด `css/styles.css` และ `js/data.js` ก่อน React code

#### `css/styles.css`
- **Size**: ~24KB (873 lines)
- **Features**:
  - Dark theme with glass morphism effects
  - CSS Grid/Flexbox layouts
  - Animations and transitions
  - Responsive design for mobile/tablet
  - Custom scrollbar, gradients, glow effects

#### `js/data.js`
- **Size**: ~90KB (2,429 lines)
- **Constants**:
  - `PAGES` - Navigation menu items
  - `SPECIMEN_GUIDE` - Specimen collection guide
  - `LIBRARY`, `LIBRARY_EXTRA`, `LIBRARY_BATCH3` - Bacteria database
  - `LIBRARY_ALL` - Combined library array
  - `SUITES` - Test suites by group
  - `TEST_ALIASES` - Test name aliases for matching
  - `HARD_EXCLUSION_TESTS`, `KEY_TESTS` - Important test lists
  - `GRAM_OPTIONS`, `GROUP_MAP` - Group classification
  - `BIOCHEM_TESTS_DATA` - Biochemical test database
  - `MEDIA_DATA`, `REAGENT_STORAGE` - Lab resources
  - `PH_INDICATORS_DATA` - pH indicator reference

#### `firebase-config.js` (Optional)
- Firebase project configuration
- API keys, auth domain, project ID
- **Note**: This file is gitignored for security

### การแก้ไขโค้ด

#### แก้ไข Style (CSS)
```bash
# แก้ในนี้
css/styles.css
```

#### แก้ไขข้อมูล (Data)
```bash
# เพิ่ม/แก้ bacteria, test suites, aliases
js/data.js
```

#### แก้ไข React Components
```bash
# แก้ใน <script type="text/babel"> ในนี้
index.html
```

### การ Rollback (ถ้ามีปัญหา)

```bash
# กลับไปใช้ไฟล์เดิม (single-file)
cp index.backup.html index.html
```

### Dependencies (CDN)

- **React 18**: `unpkg.com/react@18`
- **ReactDOM 18**: `unpkg.com/react-dom@18`
- **Babel**: `unpkg.com/@babel/standalone`
- **Firebase v9**: `gstatic.com/firebasejs/9.23.0`

### Browser Support

- Chrome/Edge (latest)
- Safari (latest)
- Firefox (latest)

### การทดสอบ (Testing)

#### Manual Testing Checklist
- [ ] **หน้าแรก (Specimen)**: แสดงตัวอย่างตรวจทั้งหมด 6 ประเภท
- [ ] **หน้าวินิจฉัย (Workflow)**: 
  - Step 1: เลือก Gram stain ได้
  - Step 2: กรอกข้อมูล biochem tests
  - Step 3: แสดงผลลัพธ์ probability
- [ ] **หน้า Case ที่บันทึก**: บันทึก/โหลด/ลบ cases ได้
- [ ] **หน้าคลังเชื้อ (Library)**: แสดง bacteria ครบถ้วน
- [ ] **หน้าการทดสอบ (Tests)**: แสดงข้อมูล biochemical tests
- [ ] **หน้า Test Suites**: แสดง test importance by group
- [ ] **ระบบ Login**: Google OAuth และ Guest mode ทำงาน

#### Console Testing
```javascript
// เปิด DevTools (F12) → Console
// รัน test suite:
runTests()
```

---

## 🚀 Deployment

### Deploy ด้วย Cloudflare Pages (แนะนำ)

**วิธีที่ 1: Cloudflare Dashboard (Drag & Drop)**
1. ไปที่ [https://dash.cloudflare.com](https://dash.cloudflare.com)
2. เลือก **Pages** → **Create a project**
3. เลือก **Upload an asset** (สำหรับ manual upload)
4. ลากโฟลเดอร์ `NewML` ทั้งหมดไปวาง
5. ได้ URL ทันที!

**วิธีที่ 2: GitHub + Cloudflare Pages (Auto-deploy)**
1. Push โค้ดขึ้น GitHub
2. ไปที่ [Cloudflare Pages](https://dash.cloudflare.com) → **Create a project**
3. เลือก **Connect to Git**
4. Connect GitHub repository
5. Build settings:
   - **Build command**: (leave empty - no build needed)
   - **Build output directory**: `/`
6. Save & Deploy → Auto-deploy ทุกครั้งที่ push

**วิธีที่ 3: Wrangler CLI**
```bash
# Install Wrangler
npm install -g wrangler

# Login
wrangler login

# Deploy (จากโฟลเดอร์ NewML)
wrangler pages deploy .
```

### Deploy ด้วย Netlify (Alternative)

**Netlify Drop:**
1. ไปที่ [https://app.netlify.com/drop](https://app.netlify.com/drop)
2. ลากโฟลเดอร์ `NewML` ทั้งหมดไปวาง
3. ได้ URL ทันที!

### Deploy ด้วย Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Init hosting
firebase init hosting

# Deploy
firebase deploy --only hosting
```

### Files to Deploy
ไฟล์ที่ต้องอัพโหลดทั้งหมด:
```
index.html          ← Main HTML (ใช้ตัวใหม่ที่แยกไฟล์แล้ว)
css/styles.css      ← CSS styles
js/data.js          ← Data constants
firebase-config.js  ← Firebase config (ถ้ามี)
netlify.toml        ← Netlify config (optional)
```

**ไม่ต้อง deploy:**
- `index.backup.html` - ไฟล์สำรอง ไม่ต้องใช้

---

## ⚠️ Troubleshooting

### ปัญหาที่พบบ่อย

#### `PAGES is not defined`
**สาเหตุ**: `js/data.js` โหลดไม่สำเร็จ
**แก้ไข**: 
- ตรวจสอบ path `./js/data.js` ถูกต้องไหม
- เปิด DevTools → Network → ดูว่าไฟล์โหลด 200 หรือ 404
- ตรวจสอบว่าไฟล์อยู่ในโฟลเดอร์ `js/`

#### CSS ไม่ทำงาน
**สาเหตุ**: `css/styles.css` โหลดไม่สำเร็จ
**แก้ไข**: ตรวจสอบ path `css/styles.css` และโฟลเดอร์ `css/`

#### `ReferenceError: XXX is not defined`
**สาเหตุ**: มี const ที่เรียก function ก่อนที่ function จะถูก define
**แก้ไข**: ย้าย const ที่มี dependency ไปไว้ใน `index.html` หลัง function declaration

### Rollback
ถ้ามีปัญหาร้ายแรง:
```bash
# กลับไปใช้ไฟล์รวมเดิม
cp index.backup.html index.html
```

---

## 📝 การพัฒนาต่อ

### Phase ที่เสร็จแล้ว
- ✅ **Phase 1**: แยก CSS และ Data constants

### Phase ที่แนะนำ (ต้องใช้ Build Tool)
- 🔲 **Phase 2**: แยก React components เป็นไฟล์ `.jsx` แยก - ต้องใช้ Vite/Webpack
- 🔲 **Phase 3**: Add TypeScript
- 🔲 **Phase 4**: Add Unit Tests (Jest/Vitest)

### Build Tool ที่แนะนำ
ถ้าต้องการ refactor ต่อ:
- **Vite** - เร็ว ตั้งค่าง่าย
- **Parcel** - Zero config
- **Create React App** - คลาสสิก แต่ช้ากว่า

---

## 📞 ติดต่อ/สนับสนุน

สำหรับคำถามหรือปัญหา:
1. ตรวจสอบ Console ใน DevTools ก่อน
2. ตรวจสอบ Network tab ว่าไฟล์โหลดครบไหม
3. เปรียบเทียบกับ `index.backup.html` เพื่อหาความแตกต่าง

---

### License

สำหรับการศึกษาและใช้งานภายในเท่านั้น

---

## 🔖 Versioning Workflow (สำหรับการอัพเดตต่อไป)

เมื่อมีการแก้ไขโปรเจกต์ ให้ปฏิบัติตามขั้นตอนนี้:

### 1. ก่อนเริ่มแก้ไข
- ตรวจสอบเวอร์ชันปัจจุบันใน [`VERSION`](VERSION)
- อ่าน [`CHANGELOG.md`](CHANGELOG.md) เพื่อดูประวัติ

### 2. ระหว่างแก้ไข
- ตัดสินใจว่าเป็น **MAJOR** / **MINOR** / **PATCH**
  - Feature ใหม่ → MINOR (`x.Y.0`)
  - Bug fix → PATCH (`x.y.Z`)
  - Breaking change → MAJOR (`X.0.0`)

### 3. หลังแก้ไขเสร็จ
- อัพเดตไฟล์ [`VERSION`](VERSION)
- เพิ่ม entry ใน [`CHANGELOG.md`](CHANGELOG.md) ใต้ `## [Unreleased]`
- อัพเดตตาราง Version History ใน [`README.md`](README.md)
- Commit message ควรระบุว่าแก้อะไร เช่น:
  ```
  feat: add chart visualization (v2.1.0)
  fix: modal not closing on mobile (v2.0.1)
  ```

### 4. Commit & Push
```bash
git add .
git commit -m "feat: เพิ่ม feature X (v2.1.0)"
git push origin main
```

---

**Last Updated**: 2026-04-26
**Current Version**: 3.0.0
**Refactored by**: AI Assistant (Cascade)
**Status**: Phase 3 Complete ✅ (MCM Bayesian Engine + Liquid Glass + Versioning)
