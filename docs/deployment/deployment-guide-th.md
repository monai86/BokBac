# Deploy BokBac v4

คู่มือนี้เป็นเส้นทาง deploy ที่ maintain อยู่สำหรับ BokBac หลังรวม legacy และ v2 แล้ว

## สถานะ app

- **Modern v4 ใน `v2/`** คือ app เดียวที่ maintain และใช้ deploy production
- **Legacy v3 ใน `legacy/`** เก็บไว้เพื่ออ้างอิงเท่านั้น ไม่ใช่ deploy target
- Build output ของ production คือ `v2/dist`

## ตรวจ local ก่อน deploy

```bash
cd v2
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
```

ถ้าทุกคำสั่งผ่าน ให้ deploy จาก output `dist`

## Cloudflare Pages

แนะนำให้ใช้ Cloudflare Pages เป็น production host หลัก

| Setting | Value |
| --- | --- |
| Root directory | `v2` |
| Framework preset | `Vite` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node.js version | `22` หรือสูงกว่า |

ไฟล์ `v2/public/_headers` และ `v2/public/_redirects` จะถูก copy เข้า build output อัตโนมัติ

## Vercel

ใช้ `v2/vercel.json` เมื่อ import repo:

| Setting | Value |
| --- | --- |
| Root directory | `v2` |
| Build command | `npm run build` |
| Output directory | `dist` |

ถ้าใช้ config template ที่ root ให้ดู `config/vercel.json` ซึ่งชี้ไปที่ `v2/dist`

## Netlify

ใช้ `config/netlify.toml` เป็น template:

```toml
[build]
  base = "v2"
  command = "npm run build"
  publish = "dist"
```

Redirect `/* -> /index.html` ใช้สำหรับ SPA route refresh

## Firebase Hosting และ Firestore

Firebase เป็น optional สำหรับ Auth/Firestore saved cases

- Hosting target ต้องเป็น `v2/dist`
- Firestore rules อยู่ที่ `config/firestore.rules`
- Firebase config template สำหรับ v4 อยู่ที่ `v2/.env.example`

ตัวแปร environment ที่ต้องตั้งเมื่อเปิด Firebase:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

สำหรับ local development ให้ copy `v2/.env.example` เป็น `v2/.env.local` แล้วใส่ค่าจริงในเครื่องเท่านั้น

## Security checklist ก่อนแชร์ลิงก์

- [ ] Deploy จาก `v2` และ publish เฉพาะ `dist`
- [ ] ไม่ commit `.env`, `.env.local`, `firebase-config.js`, service-account key, token, หรือค่า Firebase จริง
- [ ] Firestore rules ไม่เปิด `allow read, write: if true`
- [ ] ทดสอบ user A ไม่เห็นข้อมูล user B เมื่อเปิด Firebase sync
- [ ] Guest/localStorage mode ยังทำงานได้ถ้าไม่ได้ตั้ง Firebase env
- [ ] ตรวจว่าไม่มี PDF, CSV, raw extraction output, `node_modules`, `dist`, `test-results`, `.DS_Store`, หรือ `__MACOSX` ใน commit
