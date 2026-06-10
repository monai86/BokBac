# Version Update Checklist

> **สำหรับ:** Microbial World Web App — BOK BAC Diagnostic Guide

---

เมื่อมีการเปลี่ยนแปลง code สำคัญใน project:

## Step 1: อัปเดต CHANGELOG.md

1. เปิดไฟล์ `CHANGELOG.md`
2. เพิ่ม version ใหม่ที่ด้านบนสุด (ต่อจาก version ล่าสุด)
3. ใช้รูปแบบ:
   ```markdown
   ## [2.X.0] - 2026-04-XX
   
   ### Added
   - **Feature Name** — คำอธิบายสั้น ๆ ว่าทำอะไร
   ### Changed
   - **Module Name** — คำอธิบายสิ่งที่เปลี่ยน
   ### Fixed
   - **Bug Name** — คำอธิบาย bug ที่แก้
   ### Removed
   - **Feature Name** — คำอธิบายสิ่งที่ลบออก
   ```

## Step 2: อัปเดต version authority

1. สำหรับ modern v4 ให้แก้ `v2/package.json`
2. สำหรับ legacy v3 reference เท่านั้น ให้แก้ `VERSION`
3. เปลี่ยนเลข version ให้ตรงกับ CHANGELOG.md
   ```
   4.1.0
   ```

## Step 3: ตัดสินใจ version bump (เฉพาะเมื่อมีการเปลี่ยนแปลงระบบจริงๆ)

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
- **PATCH** (4.0.0 → 4.0.1): Bug fixes, small improvements
- **MINOR** (4.0.0 → 4.1.0): เพิ่ม features ใหม่, backward compatible
- **MAJOR** (4.0.0 → 5.0.0): Breaking changes, ลบ features สำคัญ, ขยาย scope ใหญ่

## Step 4: อัปเดต README.md

- อัปเดตตาราง **Version History** ให้ตรงกับ version ล่าสุด
- อัปเดต **Current Version**
- อัปเดต **Last Updated** date

## Step 5: Commit พร้อม message ชัดเจน

ใช้ Conventional Commits format:
```
<type>: <subject>

<body>
```

**ตัวอย่าง:**
```
feat(ui): add Liquid Glass design system (v2.0.0)

- Add CSS variables for glass effects
- Add useLiquidGlass() React hook
- Apply to cards, modal, and navigation
   - Update CHANGELOG.md, v2/package.json, README.md
```

## Step 6: Push ไป GitHub

```bash
git add CHANGELOG.md v2/package.json v2/package-lock.json README.md <other_files>
git commit -m "feat: add new feature (v4.1.0)"
git push origin main
```

## Step 7: (ถ้าเป็น major milestone) สร้าง Git Tag

```bash
git tag -a v4.1.0 -m "Release v4.1.0: add new feature"
git push origin v4.1.0
```

---

# ตัวอย่างการใช้งานจริง

## Scenario 1: เพิ่ม feature ใหม่ใน modern v4 (เช่น Chart Visualization)

1. เขียน code ใน `v2/src/` → เพิ่ม component/page/lib ตามหน้าที่
2. อัปเดต styles ใน `v2/src/index.css` หรือ component ที่เกี่ยวข้อง
3. อัปเดต `CHANGELOG.md`:
   ```markdown
   ## [4.1.0] - 2026-06-10
   ### Added
   - **Chart Visualization** — แสดงกราฟผลลัพธ์การวินิจฉัย
   ```
4. อัปเดต `v2/package.json`:
   ```
   4.1.0
   ```
5. อัปเดต `README.md` → ตาราง Version History
6. Commit:
   ```bash
   git add v2/src CHANGELOG.md v2/package.json v2/package-lock.json README.md
   git commit -m "feat(chart): add visualization for diagnostic results (v4.1.0)"
   git push origin main
   ```
7. (ถ้าเป็น release) สร้าง tag:
   ```bash
   git tag -a v4.1.0 -m "Release v4.1.0: add chart visualization"
   git push origin v4.1.0
   ```

## Scenario 2: แก้ bug (เช่น Modal ไม่ปิด)

1. แก้ code ใน `v2/src/`
2. อัปเดต `CHANGELOG.md`:
   ```markdown
   ## [4.0.1] - 2026-06-10
   ### Fixed
   - **Modal not closing** — แก้ปัญหากดปิด modal ไม่ได้บน mobile
   ```
3. อัปเดต `v2/package.json`:
   ```
   4.0.1
   ```
4. อัปเดต `README.md`
5. Commit:
   ```bash
   git add v2/src CHANGELOG.md v2/package.json v2/package-lock.json README.md
   git commit -m "fix(modal): resolve close button issue on mobile (v4.0.1)"
   git push origin main
   ```

## Scenario 3: เปลี่ยน documentation เท่านั้น

1. อัปเดต `README.md` → เพิ่มคำอธิบาย
2. อัปเดต `CHANGELOG.md`:
   ```markdown
   ## [4.0.1] - 2026-06-10
   ### Changed
   - **README.md** — เพิ่มคำอธิบายการ deploy
   ```
3. Commit:
   ```bash
   git add README.md docs/
   git commit -m "docs: update deployment instructions"
   git push origin main
   ```

---

# Quick Reference

| ไฟล์ | ใช้ทำอะไร | ต้องอัปเดตเมื่อ |
|------|----------|----------------|
| `CHANGELOG.md` | บันทึกประวัติการเปลี่ยนแปลง | ทุกครั้งที่มีการเปลี่ยนแปลงระบบ |
| `v2/package.json` | version authority ของ modern v4 | ทุกครั้งที่ bump version v4 |
| `VERSION` | version authority ของ legacy v3 reference | เฉพาะงาน legacy reference |
| `README.md` | เอกสารหลัก | ทุกครั้งที่มี feature ใหม่ |
| `docs/development/development-workflow.md` | แนวทางการพัฒนา | เมื่อเปลี่ยน workflow |
