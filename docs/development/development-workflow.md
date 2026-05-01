# Development Workflow

> **โปรเจกต์:** Microbial World Web App — BOK BAC Diagnostic Guide  
> **วันที่:** 26 เมษายน 2026

---

## Project Skill

โปรเจกต์นี้มี project-local skill สำหรับใช้ใน IDE หรือ AI coding assistant ที่:

- `.project-skills/bok-bac-project/SKILL.md`

ให้ใช้ skill นี้เป็น entry point ก่อนเริ่มงานใน repository เพื่อแยกให้ชัดว่าเป็นงาน legacy v3, modern v4, MCM data pipeline, validation, release หรือ deploy workflow.

---

## 📋 Checklist ก่อน commit ทุกครั้ง

### 1. อัปเดต README.md (ทุกครั้งที่มีการเปลี่ยนแปลงใน project)

**สำคัญ:** README.md คือ entry point ของ project ต้องอัปเดตทุกครั้งที่มีการเปลี่ยนแปลง

**เมื่ออะไรต้องอัปเดต README.md:**
- ✅ เพิ่ม feature ใหม่ (เช่น Liquid Glass, Mobile Nav)
- ✅ เปลี่ยนโครงสร้างโฟลเดอร์
- ✅ เพิ่ม/ลบ dependencies สำคัญ
- ✅ เปลี่ยนวิธี deploy หรือการใช้งาน
- ✅ อัปเดต version ใหม่

**สิ่งที่ไม่ต้องอัปเดต README.md:**
- ❌ การแก้ bug เล็ก ๆ (เช่น แก้สี CSS)
- ❌ การเปลี่ยน format code
- ❌ การเพิ่ม comments

---

### 2. อัปเดต CHANGELOG.md (เฉพาะเมื่อมีการเปลี่ยนแปลงระบบจริงๆ)

**สำคัญ:** เฉพาะการเปลี่ยนแปลง **ระบบจริงๆ** เท่านั้นที่ต้อง bump version

**สิ่งที่ไม่ต้อง bump version:**
- ❌ การจัดระเบียบไฟล์ (move files, rename folders)
- ❌ การเปลี่ยนแปลง documentation เท่านั้น (เช่น edit README.md)
- ❌ การเปลี่ยนแปลง format ของไฟล์ (เช่น indent code)
- ❌ การเพิ่ม comments หรือ docstrings

**สิ่งที่ต้อง bump version:**
- ✅ เพิ่ม feature ใหม่ใน code (เช่น add ระบบ login, หน้าใหม่)
- ✅ แก้ bug ที่ส่งผลต่อการทำงาน (เช่น แก้ algorithm คำนวณผิด)
- ✅ เปลี่ยน UI/UX สำคัญ (เช่น redesign ทั้งหมด)
- ✅ เปลี่ยน behavior ของระบบ (เช่น เปลี่ยนวิธีคำนวณ probability)

เมื่อต้อง bump version:
- เพิ่ม version ใหม่ (เช่น `[2.1.0] - 2026-04-XX`)
- บันทึกสิ่งที่เปลี่ยนแปลงในหมวด `Added`, `Changed`, `Fixed`, `Removed`
- ตัวอย่าง:
  ```markdown
  ## [2.1.0] - 2026-04-XX
  ### Added
  - **Feature X** — คำอธิบายสั้น ๆ
  ### Changed
  - **Module Y** — แก้ไขอะไร
  ```

### 3. ทดสอบว่า code รันได้
- เปิด `index.html` ใน browser → ตรวจสอบว่าโหลดไม่ error
- ตรวจสอบ Console (F12) → ไม่มี error แดง
- Test หน้า Workflow → Step 1-3 ทำงานได้
- Test หน้า Library → แสดงข้อมูลครบ

### 4. Commit message ต้องชัดเจน

ใช้ **Conventional Commits** format ตามมาตรฐาน:
```
<type>[optional scope]: <subject>

<optional body>

<optional footer>
```

**Rules:**
- ✅ Subject line: ไม่เกิน 50 ตัวอักษร
- ✅ Subject line: ใช้ imperative mood (เช่น "Add feature" ไม่ใช่ "Added feature")
- ✅ Subject line: ตัวแรกตัวพิมพ์ใหญ่ ไม่มีจุดท้าย
- ✅ Body: ไม่เกิน 72 ตัวอักษรต่อบรรทัด
- ✅ Body: อธิบาย **what** และ **why** (ไม่ใช่ how)
- ✅ Body: ใช้ bullet points ถ้ามีหลายข้อ
- ✅ แยก subject และ body ด้วย blank line
- ❌ หลีกเลี่ยง filler words (though, maybe, I think, kind of)

**Types:**
- `feat:` — เพิ่ม feature ใหม่
- `fix:` — แก้ bug
- `docs:` — เปลี่ยน documentation เท่านั้น
- `refactor:` — refactor code (ไม่เปลี่ยน behavior)
- `style:` — แก้ format code (indent, spacing)
- `test:` — เพิ่ม/แก้ test
- `chore:` — อื่น ๆ (update dependencies, config)
- `perf:` — performance improvements
- `ci:` — continuous integration
- `build:` — เปลี่ยน build system

**ตัวอย่างดี:**
```
feat(ui): add Liquid Glass design system (v2.0.0)

Implement Apple-style glassmorphism effects across the app.

- Add CSS variables for glass effects
- Add useLiquidGlass() React hook
- Apply to cards, modal, and navigation
- Update CHANGELOG.md to v2.0.0
```

**ตัวอย่างไม่ดี:**
```
fixed bug
Changed style
oops
I think I fixed it this time?
```

---

## 🌿 Branching Strategy

### ใช้ `main` branch + Git Tags (แนะนำสำหรับโปรเจกต์นี้)

**เพราะ:**
- Branch แยกต่อ version เป็น **overkill** สำหรับโปรเจกต์นี้
- Git tags ทำหน้าที่ mark version แต่เรียบง่ายกว่า
- CHANGELOG.md เก็บ history อยู่แล้ว

### Workflow ที่แนะนำ

```
main branch (default)
  ↓
[commit changes with clear messages]
  ↓
[update CHANGELOG.md + VERSION + README.md]
  ↓
git add .
git commit -m "feat: add new feature (v2.1.0)"
git push origin main
  ↓
[ทุกครั้งที่ release version ใหม่]
git tag v2.1.0
git push origin v2.1.0
```

### เมื่อไหร่ควรใช้ feature branch?

เฉพาะเมื่อมี **major feature** ที่ใช้เวลาหลาย session:
- `feature/liquid-glass` — พัฒนา design system ใหม่
- `feature/deployment` — เพิ่ม deployment config
- `feature/auth` — ระบบ login ใหม่

**Workflow:**
```bash
git checkout -b feature/liquid-glass
# ... develop ...
git checkout main
git merge feature/liquid-glass
git branch -d feature/liquid-glass
```

---

## 🏷️ Git Tags สำหรับ Versioning

เมื่อ release version ใหม่ (เช่น 2.0.0 → 2.1.0):

```bash
# สร้าง tag
git tag -a v2.1.0 -m "Release v2.1.0: add chart visualization"

# Push tag ไป GitHub
git push origin v2.1.0

# ดู tags ทั้งหมด
git tag

# ดู diff ระหว่าง tags
git diff v2.0.0..v2.1.0
```

---

## 📝 Checklist ก่อน deploy

1. **อัปเดต CHANGELOG.md** — บันทึก version ล่าสุด
2. **อัปเดต VERSION** — เลขเวอร์ชันตรงกับ CHANGELOG
3. **อัปเดต README.md** — ตาราง Version History
4. **ทดสอบใน browser** — เปิด index.html ตรวจสอบไม่มี error
5. **Push ไป GitHub** — ตรวจสอบว่าทุกอย่าง sync แล้ว
6. **Create git tag** — ถ้าเป็น major milestone
7. **Deploy ไป Cloudflare Pages** — ตามขั้นตอนใน README

---

## 🚨 ข้อห้าม

- ❌ อย่า commit โดยไม่อัปเดต CHANGELOG.md (ถ้ามีการเปลี่ยนแปลงระบบ)
- ❌ อย่า commit ข้อความที่ไม่ชัดเจน (เช่น "update", "fix bug")
- ❌ อย่า push โค้ดที่รันไม่ได้ (เปิดแล้ว error)
- ❌ อย่า commit sensitive data (API keys, tokens)
- ❌ อย่า commit ไฟล์ backup ขนาดใหญ่ (ไม่จำเป็น)

---

## 📚 References

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Tagging](https://git-scm.com/book/en/v2/Git-Basics-Tagging)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
