# Deploy MicroBactElite (Production Guide)

คู่มือนี้ทำให้เว็บในโฟลเดอร์นี้เปิดใช้กับคนอื่นผ่านลิงก์ได้จริง และปลอดภัยขึ้นสำหรับ Firebase.

> **⚠️ หมายเหตุสำคัญ:** Netlify ฟรีมีข้อจำกัด **300 build minutes/เดือน** อาจหมดเร็วถ้า deploy บ่อย แนะนำใช้ **Cloudflare Pages** หรือ **GitHub Pages** แทน (ไม่จำกัด bandwidth/traffic)

## 1) เตรียมไฟล์ก่อนปล่อย

- Entry page ใช้ `index.html` (redirect ไป `MicroBactElite.html` แล้ว)
- ไฟล์หลักแอป: `MicroBactElite.html`
- รูปประกอบ: `IMG_*.jpg`, `Unknown*.jpeg`

## 2) Deploy แบบฟรี ไม่จำกัด Traffic (แนะนำ)

### 🥇 Cloudflare Pages (แนะนำอันดับ 1 - ฟรีจริง ไม่จำกัด)

**ข้อดี:** ไม่จำกัด bandwidth, requests, build minutes | CDN เร็วทั่วโลก | ไม่มี surprise billing

1. push โค้ดไป GitHub repo (public หรือ private ก็ได้)
2. เข้า [dash.cloudflare.com](https://dash.cloudflare.com) → Workers & Pages → Create application → Pages
3. เชื่อมกับ GitHub repo
4. ตั้งค่า:
   - **Project name:** ตั้งชื่อเว็บของคุณ
   - **Build command:** (เว้นว่าง หรือใส่ `echo "No build"`)
   - **Output directory:** `.`
5. Deploy ได้ทันที
6. ได้ URL แบบ `https://[project-name].pages.dev`
7. (optional) ตั้งค่า Custom Domain ได้ฟรี

### 🥈 GitHub Pages (แนะนำอันดับ 2 - ง่ายที่สุด)

**ข้อดี:** ฟรี ไม่จำกัด traffic สำหรับ public repo | ไม่ต้องสมัครเพิ่ม

1. push โค้ดไป GitHub repo (public)
2. ที่ repo → Settings → Pages (แถบซ้าย)
3. Source: **Deploy from a branch**
4. เลือก branch: `main` และ folder: `/ (root)`
5. Save → รอ 1-2 นาที
6. ได้ URL แบบ `https://[username].github.io/[repo-name]/`

### 🥉 Vercel (แนะนำอันดับ 3)

**ข้อดี:** ฟรี ไม่จำกัด bandwidth สำหรับ static sites | Auto-deploy จาก GitHub

1. push โค้ดไป GitHub repo
2. เข้า [vercel.com](https://vercel.com) → Import Project
3. เลือก repo → Framework preset: `Other`
4. ตั้งค่า:
   - **Build command:** (เว้นว่าง)
   - **Output directory:** `.`
5. Deploy ได้ทันที

## 3) ทางเลือกอื่น (ระวังข้อจำกัด)

### Netlify (มีข้อจำกัด Build Minutes)

**ข้อควรระวัง:** แพลนฟรีจำกัด **300 build minutes/เดือน** - อาจหมดเร็วถ้า deploy บ่อย

**ใช้ได้กรณี:** ไม่ deploy บ่อย (เดือนละไม่กี่ครั้ง) หรือใช้ Netlify Drop (ไม่ผ่าน Git)

#### Netlify Drop (ไม่ผ่าน Git - ไม่ใช้ build minutes)

1. ไปที่ https://app.netlify.com/drop
2. ลากโฟลเดอร์ `NewML` เข้าไป
3. ได้ URL สำหรับแชร์ทันที
4. ข้อเสีย: ต้องลากไฟล์ใหม่ทุกครั้งที่อัปเดต

#### Netlify ผ่าน GitHub (ใช้ build minutes)

1. push โค้ดขึ้น GitHub
2. Netlify → Add new site → Import from Git
3. ตั้งค่า:
   - Build command: (เว้นว่าง)
   - Publish directory: `.`
4. Deploy

## 4) Firebase สำหรับ multi-user (สำคัญ)

ไฟล์ที่เตรียมไว้:

- `firestore.rules`
- `firebase.json`

### สิ่งที่ต้องทำใน Firebase Console

1. สร้าง Firebase project ของคุณเอง
2. เปิดบริการ:
   - Authentication (Email/Password + Google)
   - Firestore
3. สร้างไฟล์ `firebase-config.js` โดย copy จาก `firebase-config.example.js`
4. ใส่ค่า Firebase project จริงลงใน `firebase-config.js`
5. นำค่าเดิมใน `MicroBactElite.html` ออกแล้ว (โค้ดปัจจุบันอ่านจาก `window.MICROBACT_FIREBASE_CONFIG` ก่อนเสมอ)
6. Deploy rules:
   - ติดตั้ง CLI: `npm i -g firebase-tools`
   - login: `firebase login`
   - ผูกโปรเจกต์: `firebase use --add`
   - deploy rules: `firebase deploy --only firestore:rules`

## 5) Security checklist ก่อนแชร์ลิงก์

- [ ] Firestore rules ต้องไม่เป็น allow read,write: if true
- [ ] Authentication ต้องเปิดเฉพาะ provider ที่ใช้จริง
- [ ] ทดสอบ user A ไม่เห็นข้อมูล user B
- [ ] ทดสอบ Guest mode ยังทำงานได้ (localStorage)
- [ ] เปิดเว็บจากมือถือ/desktop แล้วใช้งาน flow ครบ
- [ ] ใน Netlify ตั้งค่า header `X-Frame-Options`/`X-Content-Type-Options` เพิ่ม (ถ้าต้องการ hardening)

## 6) อัปเดตเวอร์ชันในอนาคต

1. แก้โค้ด
2. ทดสอบ local (`python3 -m http.server 5500`)
3. push ขึ้น GitHub
4. ระบบ deploy จะอัปเดตลิงก์อัตโนมัติ (Vercel/Netlify/Pages)

## 7) ข้อควรระวังสำคัญ

- อย่า commit `firebase-config.js` ที่เป็นของจริงลง public repo
- ให้เก็บ `firebase-config.example.js` ไว้เป็น template เท่านั้น
