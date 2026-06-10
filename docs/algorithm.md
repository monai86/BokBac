# BokBac Bayesian Probability Engine: Mathematical & Algorithmic Specification

This document provides a rigorous mathematical and logical specification of the probabilistic classification and recommendation engines driving the BokBac application. It is intended for software reviewers, educators, and domain experts.

---

## 1. Overview of the Probability Framework

BokBac implements a **Naive Bayes Classifier** optimized for bacterial identification. It models the posterior probability of a candidate species $S_i$ (where $i \in \{1, 2, \dots, M\}$ within a specific organism group) given a vector of observed biochemical test answers $\mathbf{A} = (A_1, A_2, \dots, A_n)$.

Under Bayes' Theorem:

$$P(S_i | \mathbf{A}) = \frac{P(\mathbf{A} | S_i) \cdot P(S_i)}{P(\mathbf{A})}$$

By applying the Naive Bayes conditional independence assumption—which assumes that the outcome of one biochemical test is independent of any other test given the species identity—the likelihood $P(\mathbf{A} | S_i)$ factorizes as:

$$P(\mathbf{A} | S_i) = \prod_{j=1}^{n} P(A_j | S_i)$$

Therefore, the posterior probability is proportional to:

$$P(S_i | \mathbf{A}) \propto P(S_i) \cdot \prod_{j=1}^{n} P(A_j | S_i)$$

Where:
* $P(S_i)$ is the prior probability of species $S_i$, derived from clinical prevalence scores.
* $P(A_j | S_i)$ is the likelihood of observing answer $A_j$ for test $j$ given species $S_i$, derived from standard clinical references.

---

## 2. Gram Stain-First Workflow & Gate Checks

Before biochemical calculation occurs, an initial observation phase filters candidates or applies statistical penalties based on cellular morphology and Gram reaction. This is governed by a **Specimen & Gram Stain Gate Check**.

Let $\mathbf{O} = (\text{Gram Reaction}, \text{Morphology}, \text{Arrangement})$ represent the initial observation vector. The system supports three configurable **Gate Modes** ($G$) for handling incompatibilities between $\mathbf{O}$ and a candidate species $S_i$:

1. **Strict Mode ($G = \text{strict}$)**:
   Any candidate $S_i$ whose database profile is incompatible with $\mathbf{O}$ is immediately excluded from the candidate set:
   $$P(\mathbf{O} | S_i) = 0 \implies P(S_i | \mathbf{A}, \mathbf{O}) = 0$$

2. **Hybrid Mode ($G = \text{hybrid}$)** (Default):
   Incompatibilities do not cause absolute exclusion but incur a heavy log-likelihood penalty and increment the contradiction counter:
   $$\ln P(\mathbf{O} | S_i) = -4.0$$
   $$\text{contradictionCount}_i \leftarrow \text{contradictionCount}_i + 1$$

3. **Exploratory Mode ($G = \text{exploratory}$)**:
   Incompatibilities incur a minor penalty to allow student exploration of atypical morphologies:
   $$\ln P(\mathbf{O} | S_i) = -1.0$$

### Compatibility Mappings

* **Gram Reaction Gate**:
  * If observations specify `positive`, candidate $S_i$ must have `gram` property equal to `+`.
  * If observations specify `negative`, candidate $S_i$ must have `gram` property equal to `-`.
  * If `unknown` or `variable`, the gate bypasses check (likelihood = 1.0).

* **Morphology Gate**:
  * If observation is `cocci`, the species' morphology description must contain `cocci` or `coccus`.
  * If observation is `bacilli`, the description must contain `rod`, `bacill`, or `coccobacill`.
  * If observation is `curved_rod`, the description must contain `curved` or `comma`.
  * If observation is `branching_filament`, the description must contain `filament` or `branching`.

---

## 3. Log-Posterior Formulation & Smoothing

To prevent numerical underflow when multiplying many small probabilities, calculations are performed in log-space. The unnormalized log-posterior score $L_i$ for each species $S_i$ is computed as:

$$L_i = \ln P(S_i) + \sum_{j=1}^{n} w_j \cdot \ln P^*(A_j | S_i)$$

Where:
* $w_j$ is a correlation and fallback weight factor.
* $P^*(A_j | S_i)$ is the smoothed likelihood.

### Likelihood Smoothing ($\epsilon$)

For robustness against biological outliers or data errors, we introduce a smoothing factor $\epsilon = 0.02$, representing a 2% noise floor. Let $p$ be the reference percentage positivity (expressed as a probability in $[0, 1]$) of a species for a test. The raw likelihood $P(A_j | S_i)$ is smoothed as:

$$P^*(A_j | S_i) = \max\left(\epsilon, \min\left(1 - \epsilon, P(A_j | S_i)\right)\right)$$

This restricts smoothed likelihoods to the interval $[0.02, 0.98]$, preventing a single conflicting test result from yielding a likelihood of 0 and completely eliminating a species (except for designated hard-exclusion tests in strict gate mode).

### Correlation and Fallback Weights

* **Correlation Weight Adjustment**:
  Certain biochemical tests are biologically correlated (e.g., TSI Acid/Acid and separate glucose/lactose/sucrose fermentations). To prevent "double-counting" redundant evidence, tests belonging to the same correlation group (defined in `correlationConfig.ts`) are penalized. The first answered test in a correlation group receives a weight of 1.0; subsequent answered tests in that group are weighted at 0.5.
* **Fallback Weighting**:
  If a test lacks a precise reference percentage positivity from the *Manual of Clinical Microbiology* (MCM), the system falls back to the qualitative database symbols (`+` $\rightarrow 0.9$, `-` $\rightarrow 0.1$, `V` $\rightarrow 0.5$). To reflect the lower certainty of these heuristics, a fallback weight modifier of $w_{\text{fallback}} = 0.7$ is applied to their log-likelihood contributions.
* **Uninformative Tests**:
  If a test is answered but neither MCM nor legacy database fallback has data for candidate $S_i$, it receives an uninformative likelihood $P(A_j | S_i) = 0.5$. This adds $\ln(0.5) \approx -0.693$ to the log-posterior, ensuring that species with rich, matched data naturally score higher than species with sparse documentation.

---

## 4. Prior Probabilities (Prevalence Scores)

The prior probability $P(S_i)$ models the natural occurrence rate of the organism in clinical specimens. In the MCM dataset, species are assigned a categorical **Prevalence Score** from 0 to 4. These are mapped to priors as follows:

| Prevalence Symbol | Score | Prior Probability $P(S_i)$ | Log-Prior $\ln P(S_i)$ | Interpretation |
|---|---|---|---|---|
| `++++` | 4 | 1.00 | 0.000 | Highly common clinical isolate |
| `+++` | 3 | 0.40 | -0.916 | Moderately common |
| `++` | 2 | 0.20 | -1.609 | Occasional isolate (Default prior) |
| `+` | 1 | 0.10 | -2.302 | Rare |
| None | 0 | 0.05 | -2.996 | Extremely rare / environmental contaminant |

---

## 5. Softmax Normalization

The final posterior probability percentage for each non-excluded species $S_i$ is computed using the **Softmax function**. Let $L_{\max} = \max_k L_k$ among non-excluded candidates (to ensure numerical stability and avoid overflow):

$$P(S_i | \mathbf{A}) = \frac{\exp(L_i - L_{\max})}{\sum_{k \in \text{Candidates}} \exp(L_k - L_{\max})} \cdot 100$$

If a species is hard-excluded by a gate or test contradiction in strict mode, its probability is set to $0\%$.

---

## 6. Typicality Index & Case Fit Score

To provide educators and students with insights into how "typical" the isolate's reactions are compared to the standard taxon profile, BokBac calculates two auxiliary metrics:

### Typicality Index ($T_i$)

The Typicality Index measures the geometric mean of the observed likelihoods relative to the maximum possible likelihoods for that species:

$$T_i = \left( \prod_{j=1}^{N_a} \frac{P^*(A_j | S_i)}{\max\left(P^*(+ | S_i), P^*(- | S_i)\right)} \right)^{\frac{1}{N_a}}$$

Where $N_a$ is the number of answered tests with reference data. A value of $1.0$ indicates the isolate matches the species' most common presentation perfectly; low values indicate the isolate displays highly atypical traits.

### Case Fit Score ($F_i$)

The Case Fit Score assesses the overall coherence of the case. It incorporates typicality, evidence coverage (the proportion of answered tests that had reference data), and penalties for strong contradictions:

$$F_i = \text{evidenceCoverage}_i \cdot T_i \cdot 0.5^{\text{contradictionCount}_i}$$

A strong contradiction occurs when the smoothed likelihood of an answered test falls below $0.1$.

---

## 7. Confidence Classification

The top-ranked species is assigned a qualitative confidence label $C \in \{\text{high}, \text{medium}, \text{low}, \text{very\\_low}\}$. This label is derived from the posterior probability, the margin of difference (gap) between the top species and the runner-up, and the completeness of the workup.

Let:
* $P_1$ be the probability of the top-ranked species.
* $P_2$ be the probability of the second-ranked non-excluded species.
* $\text{gap} = P_1 - P_2$.
* $N_{\text{ans}}$ be the total number of biochem tests recorded.
* $F_1$ be the Case Fit Score of the top-ranked species.
* $\text{Cov}_1$ be the Evidence Coverage of the top-ranked species.

The confidence level is assigned based on the first matching condition in the table below:

| Condition | Confidence Label |
|---|---|
| $F_1 < 0.2$ OR $\text{Cov}_1 < 0.2$ | **VERY LOW** |
| $F_1 \ge 0.7$ AND $P_1 \ge 70\%$ AND $\text{gap} \ge 25\%$ AND $N_{\text{ans}} \ge 3$ | **HIGH** |
| $F_1 \ge 0.4$ AND ($P_1 \ge 50\%$ OR $\text{gap} \ge 10\%$) | **MEDIUM** |
| $P_1 < 25\%$ | **VERY LOW** |
| Default (if no other condition is met) | **LOW** |

---

## 8. Next-Best-Test Recommendation Engine

BokBac guides students toward the most efficient diagnostic path by identifying the test that will most rapidly reduce uncertainty. This is calculated using **Information Gain** (reduction in Shannon Entropy).

### Shannon Entropy ($H$)

The uncertainty of the current classification state is measured as the Shannon Entropy of the normalized candidate probabilities:

$$H(C) = -\sum_{i=1}^{M'} p'_i \log_2(p'_i)$$

Where:
* $M'$ is the number of non-excluded candidates with non-zero probability.
* $p'_i$ is the normalized probability of candidate species $S_i$ (so that $\sum p'_i = 1$).

### Expected Remaining Entropy ($H(C | T)$)

For an unanswered test $T$, we compute the expected remaining entropy across its possible outcomes $o \in \text{Outcomes}(T)$. For binary tests, $\text{Outcomes} = \{+, -\}$:

$$H(C | T) = \sum_{o \in \{+, -\}} P(T = o) \cdot H(C | T = o)$$

Where:
* $P(T = o)$ is the probability of observing outcome $o$ across the candidate set, weighted by the species' posteriors:
  $$P(T = o) = \sum_{i=1}^{M'} p'_i \cdot P(T = o | S_i)$$
* $H(C | T = o)$ is the entropy of the candidate set if we update the posteriors assuming test $T$ returned outcome $o$.

### Information Gain ($IG$) & Entropy Reduction

The Information Gain is the difference between current and expected entropy:

$$IG(T) = H(C) - H(C | T)$$

The percentage **Entropy Reduction** is expressed as:

$$\text{Entropy Reduction}(T) = \frac{IG(T)}{H(C)} \cdot 100$$

### Practical Suitability Score ($S_{\text{practical}}$)

Information gain alone might recommend expensive or extremely slow tests (e.g., DNA sequencing). To recommend practically useful tests for clinical education, BokBac computes a **Practical Suitability Score**:

$$S_{\text{practical}}(T) = \text{Entropy Reduction}(T) + B_{\text{suite}} + B_{\text{priority}} - P_{\text{cost}} - P_{\text{time}}$$

Where:
* **Suite Availability Bonus ($B_{\text{suite}}$)**: $+30$ if the test is part of the standard default Test Suite for the current organism group.
* **Curriculum Priority Bonus ($B_{\text{priority}}$)**: $+5 \times (3 - \text{priority})$, prioritizing core tests.
* **Cost Penalty ($P_{\text{cost}}$)**: $-15$ for high-cost tests (e.g., molecular/MALDI), $-5$ for medium-cost (e.g., complex media), $0$ for low-cost (e.g., simple reagent tests).
* **Time Penalty ($P_{\text{time}}$)**: $-10 \times \text{timePenaltyFactor}$ (e.g., overnight incubation vs instant reagent checks).
