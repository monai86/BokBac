# BokBac Diagnostic Validation Framework

This directory contains scripts and files for evaluating the performance and algorithmic consistency of the BokBac Bayesian diagnostic engine.

## Critical Limitation Statement

> [!IMPORTANT]
> Reference-profile validation evaluates internal algorithmic consistency using known biochemical profiles. Real-case validation using de-identified laboratory cases is required to estimate real-world diagnostic performance.

---

## Validation Files & Architecture

* **Input Workbook**: `validation/BokBac_validation_template_with_reference_profiles.xlsx`
  * Sheet `Reference_Profile_Input`: Academic reference cases generated directly from the known database definitions.
  * Sheet `Real_Case_Input`: Real clinical cases filled from de-identified laboratory results.
* **Control Script**: `validation/run_validation.py`
  * A Python script using `openpyxl` to read raw inputs, call the TypeScript prediction engine, write results back into the Excel sheets, compute metrics, and export reports.
* **Prediction Runner**: `v2/src/run_validation_runner.test.ts`
  * A TypeScript Vitest test that runs the active `calcProbabilityBayes` diagnostic algorithm on the extracted cases, ensuring the validation uses the exact production code.

---

## How to Run Validation

1. **Verify Setup**: Ensure your filled Excel workbook is placed at `validation/BokBac_validation_template_with_reference_profiles.xlsx`.
2. **Execute Validation Pipeline**:
   Run the following command in the root directory:
   ```bash
   python3 validation/run_validation.py
   ```
3. **Execution Steps**:
   * The control script parses the Excel workbook, filter cases where `Included In Analysis` = `Yes`.
   * It runs the Vitest-based prediction runner to calculate top 1-3 candidate matching species.
   * It writes the predictions and review notes back to the Excel workbook.
   * It computes accuracy, precision, recall, F1 scores, and exports CSV reports.

---

## Output Files

The runner automatically generates the following reports in the `validation/` directory:

1. **Detailed Results CSVs**:
   * `validation/reference_profile_validation_results.csv`: Row-level predictions for reference cases.
   * `validation/real_case_validation_results.csv`: Row-level predictions for clinical cases.
2. **Performance Metrics CSVs**:
   * `validation/reference_summary_metrics.csv`
   * `validation/real_case_summary_metrics.csv`
   * Provides counts of processed/excluded rows, Top-1 and Top-3 Accuracy, and Macro-averaged Precision, Recall, and F1-score.
3. **Confusion Matrices**:
   * `validation/reference_confusion_matrix_organism_level.csv`
   * `validation/real_case_confusion_matrix_organism_level.csv`
   * `validation/real_case_confusion_matrix_group_level.csv`: Group-level confusion matrix (e.g. tracking misclassifications between Enterobacterales and NFB).

---

## Interpreting Validation Metrics

### 1. Top-1 Accuracy
The percentage of cases where the true (expected) organism matches the system's **highest-ranked (top-1) prediction**. 
* **Interpretation**: Represents the probability that the system's primary recommendation is correct.

### 2. Top-3 Accuracy
The percentage of cases where the true (expected) organism is included in the **top three predicted candidates**.
* **Interpretation**: Represents the utility of the system as a differential diagnosis aid. Since clinical microbiologists use the top candidates to choose follow-up tests, a high Top-3 accuracy is highly valuable.

### 3. Precision, Recall, and F1-Score
* **Precision**: The proportion of predicted instances for a species that actually belong to that species. High precision means fewer false positives.
* **Recall**: The proportion of actual instances of a species that were correctly identified. High recall means fewer missed cases (false negatives).
* **F1-Score**: The harmonic mean of Precision and Recall.
* **Macro-averaged Metrics**: The average of the metric across all unique species classes present in the dataset. This ensures that rare species are weighted equally to common species, preventing the overall score from being skewed by a few highly prevalent organisms.

### 4. Confusion Matrix
A grid showing how many times a true organism (rows) was predicted as another organism (columns).
* **Interpretation**:
  * Diagonal elements represent correct predictions (True Positives).
  * Off-diagonal elements identify specific misidentification trends (e.g. *E. cloacae* frequently misidentified as *C. sakazakii*).
  * **Group-level matrix**: Shows whether the system is routing specimens to the wrong biochemical group (e.g., misidentifying a fermenting Enterobacterales as a non-fermenting NFB), which could lead to incorrect secondary testing choices.

---

## Reference-Profile vs. Real-Case Validation

It is vital to understand why these two validation methods produce different results:

* **Reference-Profile Validation**:
  * Uses idealized phenotypes derived directly from clinical manuals (MCM).
  * **Purpose**: Verifies that the mathematical logic of the Bayesian engine is internally consistent (i.e. if we give it the exact textbook answers for *E. coli*, does it recognize *E. coli*?).
  * This is why it yields **100% accuracy**.
* **Real-Case Validation**:
  * Uses actual, de-identified clinical lab cases.
  * **Purpose**: Evaluates how the system handles real-world biological variations (atypical strains, mutated phenotypes), test-reading errors, and missing/unperformed tests.
  * This reflects real-world clinical performance (resulting in a lower, realistic accuracy like **~63%**).
