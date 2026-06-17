# Biochemical Profile Corrections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct all incorrect biochemical test profiles in the library/database files to achieve 100% Top-1 academic validation accuracy.

**Architecture:** Update taxonomic attributes (morphology, growth, reactions) in `bacteriaLibrary.ts` and `mcmData.ts` to properly differentiate highly similar species under the Bayesian logic.

**Tech Stack:** TypeScript, Node.js, Python 3, Vitest, openpyxl.

---

### Task 1: Correct Shigella Urease and Aeromonas Motility

**Files:**
- Modify: `v2/src/data/bacteriaLibrary.ts`

- [ ] **Step 1: Add Urease to Shigella profiles**
  Add `{ t: 'Urease', r: '−', n: '' }` to:
  - `shigella` (Shigella spp., line 238)
  - `shigella_dysenteriae` (line 1065)
  - `shigella_flexneri` (line 1075)

  *Expected code structure:*
  ```typescript
  // For shigella (spp.)
  biochem: [{ t: 'Oxidase', r: '−', n: '' }, { t: 'TSI', r: 'K/A', n: 'No H₂S, no gas' }, { t: 'H₂S (TSI)', r: '−', n: 'KEY vs Salmonella' }, { t: 'Indole', r: 'V', n: '' }, { t: 'MR (IMViC)', r: '+', n: '' }, { t: 'VP (IMViC)', r: '−', n: '' }, { t: 'Citrate (IMViC)', r: '−', n: '' }, { t: 'Urease', r: '−', n: '' }, { t: 'Motility', r: '−', n: 'KEY: non-motile' }, ...]
  ```

- [ ] **Step 2: Add Motility to Aeromonas profiles**
  Add `{ t: 'Motile', r: '+', n: '' }` to:
  - `aeromonas` (Aeromonas hydrophila, line 298)
  - `aeromonas_caviae` (line 1127)
  - `aeromonas_sobria` (line 1136)

  *Expected code structure:*
  ```typescript
  // For aeromonas (hydrophila)
  biochem: [{ t: 'Oxidase', r: '+', n: 'KEY' }, { t: 'Hemolysis', r: '+', n: 'β-hemolysis wide' }, { t: 'Motile', r: '+', n: '' }, { t: 'TSI', r: 'A/AG', n: '' }, ...]
  ```

- [ ] **Step 3: Verify build passes**
  Run: `npm run build` in `v2/`
  Expected: PASS

- [ ] **Step 4: Commit**
  Run:
  ```bash
  git add v2/src/data/bacteriaLibrary.ts
  git commit -m "fix: add Shigella urease and Aeromonas motility profiles"
  ```

---

### Task 2: Correct Neisseria Morphology and Growth in library

**Files:**
- Modify: `v2/src/data/bacteriaLibrary.ts`

- [ ] **Step 1: Update Neisseria species morphologies**
  - For `neisseria_elongata` (line 1456), set `morph: 'Coccobacilli'`.
  - For `neisseria_weaveri` (line 1466), set `morph: 'Rods'`.
  - For `neisseria_bacilliformis` (line 1476), set `morph: 'Rods'`.

- [ ] **Step 2: Add MacConkey growth to Neisseria weaveri**
  Add `{ t: 'growth_macconkey', r: '+', n: 'Grows on MacConkey' }` to `neisseria_weaveri` biochem profile.

  *Expected code structure:*
  ```typescript
    id: 'neisseria_weaveri', group: 'gn_coccobacilli', name: 'Neisseria weaveri', thai: 'ไนซีเรีย วีเวอรี', gram: '−', morph: 'Rods',
    importance: 'low', tags: ['Animal-associated'],
    ...
    biochem: [{ t: 'Oxidase', r: '+', n: '' }, { t: 'Growth on Nutrient agar', r: '+', n: '' }, { t: 'growth_macconkey', r: '+', n: 'Grows on MacConkey' }, { t: 'CTA Glucose', r: '−', n: '' }, { t: 'CTA Maltose', r: '−', n: '' }, { t: 'CTA Lactose', r: '−', n: '' }, { t: 'CTA Sucrose', r: '−', n: '' }, { t: 'CTA Fructose', r: '−', n: '' }, { t: 'Nitrate reduction', r: '−', n: '' }, { t: 'DNase', r: '−', n: '' }],
  ```

- [ ] **Step 3: Align Nutrient agar growth naming**
  In both `n_gonorrhoeae` (line 339) and `n_meningitidis` (line 328), rename biochem item `{ t: 'Growth on NA', ... }` to `{ t: 'Growth on Nutrient agar', ... }`.

- [ ] **Step 4: Verify build**
  Run: `npm run build` in `v2/`
  Expected: PASS

- [ ] **Step 5: Commit**
  Run:
  ```bash
  git add v2/src/data/bacteriaLibrary.ts
  git commit -m "fix: update Neisseria morphology, MacConkey growth, and Nutrient agar names"
  ```

---

### Task 3: Align Neisseria flavescens Prevalence in mcmData

**Files:**
- Modify: `v2/src/data/mcmData.ts`

- [ ] **Step 1: Set prevalence_score of Neisseria flavescens to 2**
  Under `neisseria_flavescens` (around line 981), set `"prevalence_score": 2` and `"prevalence_symbol": "++"`.

  *Expected code structure:*
  ```json
  "neisseria_flavescens": {
    "species": "Neisseria flavescens",
    "source": "MCM 11th ch.34 Table 2",
    "tests": {
      "glucose_acid": 5,
      "maltose": 5,
      "lactose": 5,
      "sucrose": 5,
      "fructose_acid": 5,
      "nitrate_reduction": 5,
      "polysaccharide_from_suc": 95
    },
    "prevalence_score": 2,
    "prevalence_symbol": "++"
  },
  ```

- [ ] **Step 2: Verify build**
  Run: `npm run build` in `v2/`
  Expected: PASS

- [ ] **Step 3: Commit**
  Run:
  ```bash
  git add v2/src/data/mcmData.ts
  git commit -m "fix: set Neisseria flavescens prevalence score to 2"
  ```

---

### Task 4: Correct Listeria Xylose keys in mcmData

**Files:**
- Modify: `v2/src/data/mcmData.ts`

- [ ] **Step 1: Rename xylose to xylose_d for Listeria**
  In `mcmData.ts` under:
  - `listeria_monocytogenes` (line 1684), change `"xylose": 5` to `"xylose_d": 5`.
  - `listeria_innocua` (line 1699), change `"xylose": 5` to `"xylose_d": 5`.
  - `listeria_ivanovii` (line 1714), change `"xylose": 95` to `"xylose_d": 95`.

- [ ] **Step 2: Verify build**
  Run: `npm run build` in `v2/`
  Expected: PASS

- [ ] **Step 3: Commit**
  Run:
  ```bash
  git add v2/src/data/mcmData.ts
  git commit -m "fix: rename Listeria xylose keys to xylose_d in mcmData"
  ```

---

### Task 5: Correct Corynebacterium minutissimum biochem profile

**Files:**
- Modify: `v2/src/data/bacteriaLibrary.ts`

- [ ] **Step 1: Set c_minutissimum Maltose to + and Nitrate to −**
  In `bacteriaLibrary.ts` under `c_minutissimum` (line 1548):
  - Change `Maltose` reaction from `−` to `+`.
  - Change `Nitrate` reaction from `±` to `−`.

  *Expected code structure:*
  ```typescript
    biochem: [{ t: 'Catalase', r: '+', n: '' }, { t: 'Urease', r: '−', n: '' }, { t: 'Glucose', r: '+', n: '' }, { t: 'Maltose', r: '+', n: '' }, { t: 'Sucrose', r: '±', n: '' }, { t: 'Nitrate', r: '−', n: '' }, { t: 'CAMP test', r: '−', n: '' }],
  ```

- [ ] **Step 2: Verify build**
  Run: `npm run build` in `v2/`
  Expected: PASS

- [ ] **Step 3: Commit**
  Run:
  ```bash
  git add v2/src/data/bacteriaLibrary.ts
  git commit -m "fix: correct Corynebacterium minutissimum maltose and nitrate profiles"
  ```

---

### Task 6: Expand Bacillus profiles

**Files:**
- Modify: `v2/src/data/bacteriaLibrary.ts`

- [ ] **Step 1: Expand Bacillus mycoides biochem profile**
  Add the standard GPB biochem results to `b_mycoides` (line 1672):
  - `{ t: 'CAMP test', r: '−', n: '' }`
  - `{ t: 'Rhamnose', r: '−', n: '' }`
  - `{ t: 'Esculin', r: '+', n: '' }`
  - `{ t: 'Urease', r: '−', n: '' }`
  - `{ t: 'Glucose', r: '+', n: '' }`
  - `{ t: 'Maltose', r: '+', n: '' }`
  - `{ t: 'Sucrose', r: '+', n: '' }`
  - `{ t: 'Nitrate', r: '+', n: '' }`

- [ ] **Step 2: Expand Bacillus megaterium biochem profile**
  Add the same standard biochem results to `b_megaterium` (line 1682):
  - `{ t: 'CAMP test', r: '−', n: '' }`
  - `{ t: 'Rhamnose', r: '−', n: '' }`
  - `{ t: 'Esculin', r: '+', n: '' }`
  - `{ t: 'Urease', r: '−', n: '' }`
  - `{ t: 'Glucose', r: '+', n: '' }`
  - `{ t: 'Maltose', r: '+', n: '' }`
  - `{ t: 'Sucrose', r: '+', n: '' }`
  - `{ t: 'Nitrate', r: '+', n: '' }`

- [ ] **Step 3: Expand Bacillus thuringiensis biochem profile**
  Add the same standard biochem results to `b_thuringiensis` (line 1692):
  - `{ t: 'CAMP test', r: '−', n: '' }`
  - `{ t: 'Rhamnose', r: '−', n: '' }`
  - `{ t: 'Esculin', r: '+', n: '' }`
  - `{ t: 'Urease', r: '−', n: '' }`
  - `{ t: 'Glucose', r: '+', n: '' }`
  - `{ t: 'Maltose', r: '+', n: '' }`
  - `{ t: 'Sucrose', r: '+', n: '' }`
  - `{ t: 'Nitrate', r: '+', n: '' }`

- [ ] **Step 4: Verify build**
  Run: `npm run build` in `v2/`
  Expected: PASS

- [ ] **Step 5: Commit**
  Run:
  ```bash
  git add v2/src/data/bacteriaLibrary.ts
  git commit -m "fix: expand Bacillus mycoides, megaterium, and thuringiensis biochem profiles"
  ```

---

### Task 7: Correct Haemophilus influenzae profile

**Files:**
- Modify: `v2/src/data/bacteriaLibrary.ts`

- [ ] **Step 1: Add missing sugars, catalase, and hemolysis to Haemophilus influenzae**
  Under `h_influenzae` (line 580) in `bacteriaLibrary.ts`, expand `biochem` with:
  - `{ t: 'Catalase', r: '+', n: '' }`
  - `{ t: 'Hemolysis', r: 'γ', n: '' }`
  - `{ t: 'Glucose', r: '+', n: '' }`
  - `{ t: 'Sucrose', r: '−', n: '' }`
  - `{ t: 'Lactose', r: '−', n: '' }`

  *Expected code structure:*
  ```typescript
    biochem: [{ t: 'X factor (hemin)', r: 'Required', n: 'For respiratory enzymes' }, { t: 'V factor (NAD)', r: 'Required', n: 'Electron carrier' }, { t: 'Satellitism', r: '+', n: 'Grows near S. aureus on BAP' }, { t: 'Oxidase', r: '+', n: '' }, { t: 'Urease', r: '+', n: '' }, { t: 'Indole', r: '−', n: '' }, { t: 'Catalase', r: '+', n: '' }, { t: 'Hemolysis', r: 'γ', n: '' }, { t: 'Glucose', r: '+', n: '' }, { t: 'Sucrose', r: '−', n: '' }, { t: 'Lactose', r: '−', n: '' }],
  ```

- [ ] **Step 2: Verify build**
  Run: `npm run build` in `v2/`
  Expected: PASS

- [ ] **Step 3: Commit**
  Run:
  ```bash
  git add v2/src/data/bacteriaLibrary.ts
  git commit -m "fix: expand Haemophilus influenzae biochemical profile"
  ```

---

### Task 8: Run Validation and Update Excel sheet

**Files:**
- Modify: `validation/BokBac_validation_template_with_reference_profiles.xlsx`
- Modify: `validation/reference_profiles_generated.csv`

- [ ] **Step 1: Run Vitest to dump library, suites and tests to validation/temp**
  Run: `npx vitest run src/run_validation.test.ts` in `v2/`
  Expected: PASSes and writes to `validation/temp/`

- [ ] **Step 2: Run Python script to populate reference profiles in CSV and Excel template**
  Run: `python3 validation/populate_reference_profiles.py` from project root
  Expected: Output `CSV exported successfully to validation/reference_profiles_generated.csv` and `Populated workbook successfully saved to validation/BokBac_validation_template_with_reference_profiles.xlsx`

- [ ] **Step 3: Run Vitest to execute predictions on the updated CSV**
  Run: `npx vitest run src/run_validation.test.ts` in `v2/`
  Expected: Generated predictions for 137 cases, with **137/137 (100.00%)** accuracy.

- [ ] **Step 4: Run Python script to write predictions back to the Excel template**
  Run: `python3 validation/write_predictions.py` from project root
  Expected: Output `Populated validation results successfully saved to validation/BokBac_validation_template_with_reference_profiles.xlsx` with report confirming 100% correct.

- [ ] **Step 5: Commit changes**
  Run:
  ```bash
  git add validation/BokBac_validation_template_with_reference_profiles.xlsx validation/reference_profiles_generated.csv
  git commit -m "chore: run validation pipeline and update Excel template with 100% accuracy"
  ```
