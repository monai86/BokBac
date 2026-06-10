# BokBac System Limitations & Clinical Safety

This document outlines the scientific, statistical, and operational limitations of the BokBac application. It is provided to ensure transparent and safe use of the software by students, educators, and software auditors.

---

## 1. Clinical Safety & Legal Disclaimers

> [!CAUTION]
> **Not a Clinical Diagnostic Tool**
> BokBac is designed and distributed exclusively for educational and training purposes. It **must not** be used to guide patient diagnosis, direct clinical treatment, or replace professional laboratory test validation.
>
> All identification outputs are probabilistic models and do not constitute medical advice or diagnostic confirmation. Real-world isolate identification requires standard professional confirmation protocols (e.g., automated phenotypic systems, mass spectrometry, or molecular assays).

---

## 2. Statistical & Algorithmic Limitations

### The Naive Bayes Assumption (Conditional Independence)
BokBac uses a Naive Bayes classifier to calculate species probabilities. The core assumption of Naive Bayes is that the result of any given biochemical test is conditionally independent of all other tests, given the species identity:

$$P(A_1, A_2, \dots, A_n | S_i) = \prod_{j=1}^n P(A_j | S_i)$$

In biological systems, this assumption is frequently violated:
* **Genetic Linkage**: Genes encoding specific metabolic enzymes or resistance factors may reside on the same operon or plasmid, meaning their expressions are highly correlated.
* **Shared Metabolic Pathways**: Lactose fermentation and glucose fermentation are biochemically linked; an organism that cannot utilize glucose generally cannot ferment lactose.
* **Correlated Tests**: Triple Sugar Iron (TSI) acid production is directly related to individual glucose, lactose, and sucrose tests.

**Consequences of the Assumption Violation**:
When many correlated tests are recorded, Naive Bayes can "double-count" the evidence. This often leads to over-confident posterior probabilities, skewing results toward $0\%$ or $100\%$ and exaggerating confidence scores. BokBac mitigates this using a correlation weight penalty ($w = 0.5$ for correlated tests), but this heuristic is an approximation and does not fully model complex biological correlations.

### Numeric Smoothing Boundaries ($\epsilon$)
The engine uses a smoothing factor of $\epsilon = 0.02$ (a 2% noise floor) to prevent a single atypical test result from completely eliminating a species.
* **Limitation**: If an organism displays a rare mutation or test error, this smoothing allows it to remain in the differential diagnosis. However, for tests that represent true biological impossibilities (e.g., an oxidase-positive member of the Enterobacterales), the smoothing can prevent the system from completely excluding the candidate.
* **Mitigation**: To balance this, BokBac implements a strict morphology/Gram reaction gate check and designated "hard exclusion" tests (e.g., oxidase, catalase, coagulase) that bypass smoothing when strict mode is active.

---

## 3. Data Boundaries & Taxonomic Coverage

### Database Coverage
* **Incomplete Reference Data**: The database includes 157 species, but only 137 are fully mapped in the active calculator, and only 93 have complete quantitative percentage positivity data derived from the *Manual of Clinical Microbiology (11th Ed.)*.
* **Qualitative Fallbacks**: The remaining species rely on qualitative database symbols (`+`, `-`, `V`). These fallbacks are assigned estimated probabilities ($90\%$, $10\%$, $50\%$) and are weighted lower ($w = 0.7$). This mixture of high-fidelity quantitative data and estimated qualitative heuristics can create minor ranking anomalies in complex cases.
* **Static Database**: Bacterial taxonomy and biochemical profiles evolve. The BokBac database is a static snapshot based on the 11th Edition (2015). It does not reflect recent taxonomic reclassifications or newly emerging resistance profiles.

### Prevalence Score Biases (Priors)
The prior probability weights ($0.05$ to $1.0$) are mapped to general clinical prevalence scores (0 to 4).
* **Limitation**: These priors represent typical hospital isolation rates. They do not account for:
  * Local geographic epidemiology (e.g., specific endemic strains in regional provinces).
  * Seasonal variations.
  * Specimen collection site variations (e.g., prior probability of a specific pathogen in urine vs. CSF).

---

## 4. Codebase Synchronization

BokBac maintains one active application: **Modern Track v4.x** in `v2/`, using TypeScript files (`v2/src/data/mcmData.ts` and `v2/src/data/bacteriaLibrary.ts`) loaded as ES Modules. Legacy v3 is archived under `legacy/` for reference only.

### The Risk of Divergence
The archived legacy reference and the maintained v4 app do not share a single runtime database.
* Production behavior should be changed in `v2/`.
* Legacy files under `legacy/` should not be treated as deployment sources.
* Updates to the data parsing pipelines under `scripts/` must be propagated into `v2/src/data/` before they affect the maintained app.
