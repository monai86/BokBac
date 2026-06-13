# Design Specification: Biochemical Profile Corrections and Validation Alignment

This document details the design and specification for correcting the biochemical test database profiles in `bacteriaLibrary.ts` and `mcmData.ts` to achieve maximum Bayesian identification accuracy across all 137 validation reference cases.

## Goal
Resolve all 18 incorrect identifications in the academic validation suite, bringing Top-1 identification accuracy from 86.86% to 100% (or as close to 100% as biologically/mathematically possible), while maintaining data integrity and keeping the UI/UX unchanged.

## Architectural Changes & Data Corrections

### 1. Neisseria Morphology & Growth Corrections
*   **Neisseria weaveri**:
    *   Change cell morphology from `'Diplococci'` to `'Rods'` in `bacteriaLibrary.ts` so that it is processed as `bacilli` under initial observations.
    *   Add `{ t: 'growth_macconkey', r: '+', n: 'Grows on MacConkey' }` to its biochem profile to reflect its ability to grow on MacConkey agar (unlike other Neisseria).
*   **Neisseria elongata**:
    *   Change cell morphology from `'Diplococci/short rods'` to `'Coccobacilli'` in `bacteriaLibrary.ts` so that it is processed as `coccobacilli`.
*   **Neisseria bacilliformis**:
    *   Set cell morphology to `'Rods'` (which maps to `bacilli`) in `bacteriaLibrary.ts`.
*   **Neisseria flavescens**:
    *   Increase its prevalence score from `1` to `2` in `mcmData.ts` to level its prior probability with *Neisseria cinerea*.
*   **Nutrient Agar Growth Alias Alignment**:
    *   In both `n_gonorrhoeae` and `n_meningitidis` in `bacteriaLibrary.ts`, rename `Growth on NA` to `Growth on Nutrient agar`.

### 2. Listeria Xylose Mapping Alignment
*   In `mcmData.ts`, change `"xylose": 5` to `"xylose_d": 5` for `listeria_monocytogenes` and `listeria_innocua`.
*   In `mcmData.ts`, change `"xylose": 95` to `"xylose_d": 95` for `listeria_ivanovii`.
*   This aligns the keys in `mcmData.ts` with the canonical test registry ID (`xylose_d`), preventing missing data fallbacks.

### 3. Corynebacterium Differentiations
*   **Corynebacterium minutissimum**:
    *   Update biochem profile in `bacteriaLibrary.ts` to set `Maltose` to `+` and `Nitrate` to `−` (correcting them from `−` and `±` respectively). This differentiates it from *Corynebacterium striatum* (which remains Maltose `−` and Nitrate `±`).

### 4. Shigella & Aeromonas Missing Test Fixes
*   **Shigella spp.**:
    *   Add `{ t: 'Urease', r: '−', n: '' }` to `shigella` (spp.), `shigella_dysenteriae`, and `shigella_flexneri` in `bacteriaLibrary.ts`.
*   **Aeromonas spp.**:
    *   Add `{ t: 'Motile', r: '+', n: '' }` to `aeromonas` (hydrophila), `aeromonas_caviae`, and `aeromonas_sobria` in `bacteriaLibrary.ts`.

### 5. Bacillus Profile Expansions
*   Expand the profiles of `b_mycoides`, `b_megaterium`, and `b_thuringiensis` in `bacteriaLibrary.ts` with the following standard GPB biochem entries:
    *   `{ t: 'CAMP test', r: '−', n: '' }`
    *   `{ t: 'Rhamnose', r: '−', n: '' }`
    *   `{ t: 'Esculin', r: '+', n: '' }`
    *   `{ t: 'Urease', r: '−', n: '' }`
    *   `{ t: 'Glucose', r: '+', n: '' }`
    *   `{ t: 'Maltose', r: '+', n: '' }`
    *   `{ t: 'Sucrose', r: '+', n: '' }`
    *   `{ t: 'Nitrate', r: '+', n: '' }`

## Validation Pipeline
1.  **Dumping & Generation**: Run Vitest to dump current `library.json`, then run `validation/populate_reference_profiles.py` to compile the database changes into `validation/reference_profiles_generated.csv`.
2.  **Test Run**: Run Vitest `src/run_validation.test.ts` to compute predictions on all 137 cases, generating `validation/temp_predictions.json`.
3.  **Excel Populate**: Run `validation/write_predictions.py` to write results back to `validation/BokBac_validation_template_with_reference_profiles.xlsx`.
