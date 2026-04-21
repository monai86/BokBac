# ย้ายจาก Netlify ไป Cloudflare Pages

## ขั้นตอนการย้าย

### 1. สร้างไฟล์ `_redirects` (เสร็จแล้ว)
ไฟล์นี้จัดการ routing สำหรับ Cloudflare Pages:
- Redirect `/` ไป `MicroBactElite.html`
- SPA fallback สำหรับทุก route

### 2. หยุด/ลบ Netlify Site

#### วิธีที่ 1: หยุด Deploy ชั่วคราว (แนะนำ)
1. เข้า https://app.netlify.com
2. เลือก Site ของคุณ
3. ไปที่ **Site settings** → **Build & deploy** → **Continuous deployment**
4. กด **Stop builds** (ปุ่มสีแดง)
5. เว็บจะยังเข้าได้ แต่จะไม่ auto-deploy อีกต่อไป

#### วิธีที่ 2: ลบ Site ถาวร
1. เข้า https://app.netlify.com
2. เลือก Site ของคุณ
3. ไปที่ **Site settings** → **General** → **Site details**
4. เลื่อนลงไปล่างสุด → กด **Delete site** (ปุ่มสีแดง)

### 3. Deploy บน Cloudflare Pages

1. Push โค้ดขึ้น GitHub (รวมไฟล์ `_redirects` ที่สร้างไว้)
2. เข้า https://dash.cloudflare.com
3. ไปที่ **Workers & Pages** → **Create application** → **Pages**
4. เลือก **Connect to Git**
5. เลือก GitHub repo ของคุณ
6. ตั้งค่า:
   - **Project name:** `microbactelite` (หรือชื่อที่ต้องการ)
   - **Production branch:** `main`
   - **Build command:** (เว้นว่าง)
   - **Output directory:** `.`
7. กด **Save and Deploy**
8. รอ 1-2 นาที จะได้ URL: `https://microbactelite.pages.dev`

### 4. ตั้งค่า Custom Domain (ถ้ามี)

1. ใน Cloudflare Pages → เลือก project → **Custom domains**
2. กด **Set up a custom domain**
3. ใส่โดเมนของคุณ เช่น `microbactelite.com`
4. ทำตามขั้นตอนเพิ่ม DNS records

## ไฟล์ที่เกี่ยวข้อง

| ไฟล์ | ใช้กับ | สถานะ |
|------|--------|--------|
| `_redirects` | Cloudflare Pages | ✅ สร้างแล้ว |
| `netlify.toml` | Netlify | ⏸️ ไม่จำเป็นแล้ว |

## หมายเหตุ

- ไฟล์ `netlify.toml` ไม่ต้องลบออก แต่จะไม่มีผลบน Cloudflare Pages
- ถ้าต้องการ deploy ทั้งสองที่พร้อมกัน สามารถทำได้ (แต่ไม่แนะนำ เพราะจะสับสน)
- Cloudflare Pages มี CDN เร็วกว่า Netlify ในเอเชีย

## การตรวจสอบว่าใช้ Cloudflare สำเร็จแล้ว

1. เข้าเว็บที่ได้จาก Cloudflare Pages
2. เปิด DevTools (F12) → Network tab
3. รีเฟรชหน้า (F5)
4. ดู Response Headers ของ request ใดก็ได้
5. ควรเห็น: `server: cloudflare` และ `cf-cache-status: HIT`
