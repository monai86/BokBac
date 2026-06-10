# โครงสร้างไฟล์โปรเจกต์ BOK BAC

เอกสารนี้สรุปว่าไฟล์และโฟลเดอร์หลักในโปรเจกต์คืออะไร ใช้ทำอะไร และควรวางไฟล์ใหม่ไว้ตรงไหน เพื่อให้ repo ไม่ปะปนระหว่าง legacy app, modern app, เอกสาร, reference assets และ pipeline ข้อมูล MCM

## ภาพรวม

โปรเจกต์นี้มี app ที่ maintain อยู่เพียงตัวเดียว:

- **Modern v4 ที่ `v2/`**: Vite + React + TypeScript app อยู่ที่ `v2/` และเป็น production target เดียว
- **Legacy v3 ที่ `legacy/`**: static React/Babel app ถูกเก็บไว้เพื่อ reference เท่านั้น ไม่ใช่ runtime/deploy target

ถ้าเพิ่มฟีเจอร์แอปใหม่ ให้ทำใน `v2/` เท่านั้น เว้นแต่เป็นงานกู้ข้อมูลหรือเทียบ behavior จาก legacy

## โฟลเดอร์และไฟล์ระดับ root

| Path | คืออะไร | วิธีใช้ / หมายเหตุ |
| --- | --- | --- |
| `AGENTS.md` | คำสั่งสำหรับ AI coding assistant / IDE | ใช้เป็น project instruction หลัก |
| `.project-skills/bok-bac-project/` | project-local skill และ reference workflow | ใช้แยกงาน v3/v4, MCM, validation, release, deploy |
| `.github/workflows/ci.yml` | GitHub Actions CI | ใช้รัน validation อัตโนมัติ |
| `.editorconfig` | กติกา formatting พื้นฐาน | ใช้ควบคุม indentation/encoding |
| `.gitignore` | รายการไฟล์ที่ไม่ควร commit | กัน dependency, build output, test output, local env, PDF/CSV, archive |
| `README.md` | เอกสารหลักของโปรเจกต์ | อธิบาย modern v4 เป็น app ที่ maintain และ legacy เป็น reference |
| `CHANGELOG.md` | ประวัติการเปลี่ยนแปลง | ใช้คู่กับ version docs เมื่อมี behavior/release change |
| `VERSION` | version authority ของ legacy v3 | `v2/package.json` เป็น version authority ของ modern v4 |
| `_headers`, `_redirects` | legacy hosting reference | production v4 ใช้ `v2/public/_headers` และ `v2/public/_redirects` |

## Legacy v3 Reference

| Path | คืออะไร | วิธีใช้ / หมายเหตุ |
| --- | --- | --- |
| `legacy/index.html` | entry point ของ legacy v3 | reference-only static React/Babel app |
| `legacy/css/styles.css` | stylesheet ของ legacy app | reference-only Liquid Glass UI, responsive styles, animations |
| `legacy/js/data.js` | data หลักของ legacy app | organism library, specimen guide, test suites, aliases, media/reagents |
| `legacy/js/mcm_data.js` | MCM data ที่ generate แล้ว | อย่าแก้มือถ้าไม่จำเป็น ให้แก้ parser/generator ใน `scripts/` ก่อน |
| `scripts/test_bayes.mjs` | validation suite ของ legacy Bayesian engine | รันด้วย `node scripts/test_bayes.mjs` |

## Modern v4 ใน `v2/`

| Path | คืออะไร | วิธีใช้ / หมายเหตุ |
| --- | --- | --- |
| `v2/package.json` | npm scripts และ version authority ของ v4 | ใช้ `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` |
| `v2/.env.example` | template Firebase env vars | copy เป็น `.env.local` ในเครื่องหรือใส่ค่าใน hosting provider; ห้าม commit ค่าจริง |
| `v2/index.html` | Vite HTML entry | shell ของ modern app |
| `v2/src/main.tsx` | React bootstrap | mount แอปเข้ากับ DOM |
| `v2/src/App.tsx` | app routing / top-level composition | เชื่อม pages และ layout |
| `v2/src/index.css` | Tailwind/global styles | style หลักของ modern app |
| `v2/src/components/` | reusable UI components | เช่น layout, result card, selectors, badges, panels |
| `v2/src/pages/` | page-level screens | เช่น identify, library, species detail, specimen, tests reference |
| `v2/src/store/` | state management | Zustand store สำหรับ workflow identify |
| `v2/src/lib/` | pure business logic | Bayesian engine, adapters, matchers, catalog, gram-stain suggestions |
| `v2/src/data/` | app data | bacteria library, MCM data, test registry, default suites |
| `v2/tests/e2e/` | Playwright tests | ใช้กับ browser-level flow |
| `v2/public/` | static public assets/config | favicon, icons, headers, redirects |
| `v2/dist/` | build output | เป็นไฟล์ generate ไม่ควรแก้มือ |
| `v2/node_modules/` | installed dependencies | เป็นไฟล์ local ไม่ควร commit |
| `v2/test-results/` | test output | เป็นไฟล์ generate ไม่ควร commit |

## Data Pipeline และ MCM Extraction

| Path | คืออะไร | วิธีใช้ / หมายเหตุ |
| --- | --- | --- |
| `scripts/extract_*.py` | scripts สำหรับดึงข้อมูลจาก reference PDF/table | ใช้เมื่อต้อง regenerate MCM source data |
| `scripts/parse_*.py` | parsers แยกตาม organism group | ใช้แปลง extracted text/table เป็น structured JSON |
| `scripts/generate_mcm_js.py` | generator จาก parsed JSON ไปเป็น `js/mcm_data.js` | ใช้หลัง parse ข้อมูลเสร็จ |
| `scripts/mcm_master_extract.py` | extraction รวมระดับ master | ใช้กับ workflow MCM หลัก |
| `scripts/mcm_extract/parsed/` | parsed JSON ที่ commit ไว้เพื่อ reproducibility | เก็บไว้เป็น source ที่ตรวจซ้ำได้ |
| `scripts/mcm_extract/layout/` | intermediate layout text | generate ได้ใหม่และถูก ignore |
| `scripts/mcm_extract/raw_tables/` | raw extracted table JSON | generate ได้ใหม่และถูก ignore |
| `scripts/mcm_extract/tables/` | intermediate table JSON | generate ได้ใหม่และถูก ignore |
| `scripts/mcm_extract/*.txt` | extracted text chunks | generate ได้ใหม่และถูก ignore |

## Assets และ References

| Path | คืออะไร | วิธีใช้ / หมายเหตุ |
| --- | --- | --- |
| `assets/images/` | รูปภาพประกอบ/ภาพ reference | ใช้เป็น visual assets ของโปรเจกต์ |
| `assets/references/` | PDF อ้างอิงทั่วไป | PDF ถูก ignore เพื่อหลีกเลี่ยงปัญหา copyright/local-only |
| `assets/references/local/` | reference PDF/CSV ที่ควรอยู่ local เท่านั้น | ไม่ควร commit |

## Config และ Deployment

| Path | คืออะไร | วิธีใช้ / หมายเหตุ |
| --- | --- | --- |
| `config/firebase-config.example.js` | legacy Firebase config template | reference-only; v4 ใช้ `VITE_FIREBASE_*` ใน `v2/.env.example` |
| `config/firebase.json` | Firebase hosting/config | target ต้องเป็น `v2/dist` |
| `config/firestore.rules` | Firestore security rules | ใช้กำหนด permission |
| `config/netlify.toml` | Netlify config | config เก่าหรือทางเลือก |
| `config/vercel.json` | Vercel config | config ทางเลือก |
| `docs/deployment/` | deployment guides | Cloudflare migration และคู่มือ deploy ภาษาไทย |

## Docs และ Archive

| Path | คืออะไร | วิธีใช้ / หมายเหตุ |
| --- | --- | --- |
| `docs/README.md` | index ของเอกสารรอง | จุดเริ่มต้นของ docs |
| `docs/development/` | workflow, progress, version checklist | ใช้กับงานพัฒนาและ release |
| `docs/presentations/` | presentation exports | เก็บ slide/presentation HTML |
| `archive/deprecated-public/` | public files เก่าที่เลิกใช้ | เก็บเพื่ออ้างอิง ไม่ใช่ runtime active |
| `archive/legacy-data/` | data เก่า | ใช้เทียบย้อนหลัง |
| `archive/legacy-tests/` | tests เก่า | ใช้เป็น historical reference |

## สถานะการจัดระเบียบปัจจุบัน

สถานะหลัง cleanup:

- `v2/src/`, `v2/public/`, `v2/package.json` คือ app ที่ maintain และเป็น production target
- `legacy/` เก็บ legacy v3 เพื่อ reference เท่านั้น
- `v2/public/_headers`, `v2/public/_redirects` ใช้กับ production hosting
- `scripts/mcm_extract/parsed/` เพราะเป็น parsed source ที่ commit เพื่อ reproducibility

สิ่งที่ควรรักษาให้เป็นระเบียบ:

- ไฟล์ UI/feature ใหม่ของ modern app วางใน `v2/src/pages/`, `v2/src/components/`, `v2/src/lib/`, `v2/src/store/`, หรือ `v2/src/data/` ตามหน้าที่
- เอกสารใหม่วางใน `docs/development/` หรือ `docs/deployment/` ถ้าเป็นเอกสารใช้งานเฉพาะทาง
- ไฟล์ reference ขนาดใหญ่หรือมี copyright เก็บ local ใน `assets/references/local/`
- ไฟล์ generated เช่น `v2/dist/`, `test-results/`, `node_modules/`, extraction intermediate ไม่ควร commit

## Validation ตามพื้นที่ที่แก้

| พื้นที่ที่แก้ | คำสั่งตรวจ |
| --- | --- |
| Legacy algorithm/data | `node scripts/test_bayes.mjs` |
| Modern v4 app | `cd v2 && npm run test && npm run build` |
| UI behavior | รันแอปและตรวจใน browser เพิ่มเติม |
| Release/deploy docs | ตรวจ `VERSION`, `CHANGELOG.md`, `README.md`, `v2/package.json`, และ deployment config ที่เกี่ยวข้อง |
