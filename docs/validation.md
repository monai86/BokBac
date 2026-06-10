# BokBac Validation & Benchmarking Manual

This document details the validation framework, regression test scenarios, and methodology used to ensure the reliability and educational utility of the BokBac Bayesian Probability Engine.

---

## 1. Probabilistic vs. Dichotomous Key Logic

Traditional computer-aided bacterial identification tools rely on **Dichotomous Keys (DK)**. A Dichotomous Key is a decision tree where a series of binary choices (e.g., *Is Oxidase positive? Yes $\rightarrow$ Go to Step 2; No $\rightarrow$ Go to Step 3*) leads to a single species outcome.

While simple to implement, DK logic suffers from critical limitations in educational and clinical settings. The table below contrasts the rigid DK approach with BokBac's Bayesian framework:

| Dimension | Dichotomous Key (DK) | BokBac Bayesian Engine |
|---|---|---|
| **Outlier Tolerance** | **Zero tolerance**. A single atypical test result (due to strain mutation, experimental error, or misinterpretation) leads down a completely wrong branch. | **High tolerance**. Outliers slightly reduce posterior probability and Case Fit, but the correct species remains visible. |
| **Output Representation** | A single deterministic leaf node. Provides no alternatives. | A ranked list of candidates with posterior probabilities, simulating differential diagnosis. |
| **Handling of Missing Data** | Fails or stalls if a user cannot answer a step in the path. | Gracefully handles missing answers using neutral likelihood updates. |
| **Educational Value** | Promotes rote memorization of fixed diagnostic pathways. | Encourages comparative analysis of likelihood ratios, expected values, and test selection efficiency. |

---

## 2. Validation Methodology & Scenario Design

To benchmark the accuracy of the probability engine, BokBac uses a validation suite of **50 clinical scenarios** spanning **8 genus/organism groups**. These scenarios are derived from standard clinical microbiology textbooks and represent classic, intermediate, and atypical presentations.

Each scenario defines:
1. **Organism Group**: (e.g., `enterobacterales`, `nfb`, `vibrio`, `gpc_cluster`, `gpc_chain`, `gn_coccobacilli`).
2. **A Vector of Answers**: A set of simulated biochemical test inputs.
3. **Expected Outcome**: The expected top-ranked species ID.
4. **Minimum Posterior Probability ($P_{\min}$)**: The threshold probability the expected species must meet to pass validation.

### Example Key Scenarios

#### Scenario 1: Classic *Escherichia coli* (5 tests)
* **Group**: `enterobacterales`
* **Answers**: Indole: `+`, Citrate: `-`, Urease: `-`, Motility: `+`, Lactose: `+`
* **Expected ID**: `e_coli`
* **Expected Probability**: $\ge 70\%$
* **Logic**: Classic IMViC profile ($++--$) for *E. coli*. Because *E. coli* has a high prior (prevalence score 4), a minimal 5-test workup is sufficient to yield high confidence.

#### Scenario 2: *Listeria monocytogenes* (GPC Cluster / Catalase+)
* **Group**: `gpc_cluster`
* **Answers**: Catalase: `+`, Hemolysis: `+`, Motility: `+`, CAMP: `+`
* **Expected ID**: `listeria_monocytogenes`
* **Expected Probability**: $\ge 40\%$
* **Logic**: Tests represent classic Gram-positive rod differentiation. Motility at room temperature and a positive CAMP test differentiate *Listeria* from other catalase-positive coryneform bacteria.

#### Scenario 3: *Burkholderia pseudomallei* (NFB)
* **Group**: `nfb`
* **Answers**: Oxidase: `+`, Glucose: `+`, Mannitol: `+`, Arabinose: `-`, Motility: `+`
* **Expected ID**: `b_pseudomallei`
* **Expected Probability**: $\ge 50\%$
* **Logic**: Specifically tests clinical differentiation in Southeast Asia. Differentiated from *Burkholderia thailandensis* by its inability to assimilate arabinose (Arabinose `-`).

---

## 3. Running Validation Locally

Developers must run the validation suite before pushing code changes to main.

### 1. Legacy JavaScript Engine Tests
To run the 50-scenario validation suite in Node.js:
```bash
node scripts/test_bayes.mjs
```
Upon successful execution, the script will output verification results for all 50 scenarios:
```text
PASS: Classic E. coli (5 tests) -> e_coli (98%)
PASS: K. pneumoniae mucoid (Indole−, VP+, Citrate+, Urease+, Non-motile) -> klebsiella_pneumoniae (94%)
...
Scenario Concordance: 50 / 50 scenario validations PASSED.
```

### 2. Modern TypeScript Unit Tests
To run the type-safety checks, data loaders, test matchers, and Z-store state tests in the modern Vite project:
```bash
cd v2
npm run test
```
This executes the **Vitest** test suite, verifying unit behavior in:
* `v2/src/lib/bayesianEngine.test.ts`
* `v2/src/lib/typicality.test.ts`
* `v2/src/lib/selectSuiteForObservation.test.ts`

---

## 4. Continuous Integration (CI) Specifications

BokBac utilizes GitHub Actions for automated regression testing. The CI configuration (defined in `.github/workflows/ci.yml`) executes the following steps on every pull request and push to the `main` branch:

```yaml
# Conceptual CI Workflow Steps
jobs:
  validate-legacy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: node scripts/test_bayes.mjs

  validate-modern:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 22
      - name: Install dependencies
        run: cd v2 && npm ci
      - name: Run Vitest
        run: cd v2 && npm run test -- --run
      - name: Test Production Build
        run: cd v2 && npm run build
```
This dual check ensures that changes to the core algorithm remain backward-compatible across both product lines.
