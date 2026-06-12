# BokBac

BokBac is an educational bacterial identification context. Its language distinguishes the isolate workup, biochemical test suites, and ranked identification outputs used for teaching microbiology reasoning.

## Language

**Test Suite**:
A named biochemical test panel for one organism group. A Test Suite contains ordered test identifiers and may represent a system default, user custom panel, or institution panel.
_Avoid_: panel, checklist, assay bundle

**User Custom Suite**:
A user-created Test Suite made from any biochemical tests in the registry. It is not locked to one organism group by default; the active organism group still controls the candidate species set during calculation.
_Avoid_: default group suite, organism-specific suite

**Canonical Test ID**:
The stable identifier for a biochemical test result across UI, saved cases, and calculation. Display labels may change, but the Canonical Test ID should remain stable.
_Avoid_: label key, test name key

**Suite Test Display Name**:
The name shown for a Canonical Test ID inside a specific Test Suite. The same Canonical Test ID may be displayed differently when the teaching panel uses a context-specific method or medium.
_Avoid_: canonical name, saved answer key

**Suite Result Options**:
The allowed answer values for a Canonical Test ID inside a specific Test Suite. The same biochemical test can expose a narrower or different option set after the organism group is selected.
_Avoid_: global options, all possible test outcomes

**Saved Case**:
A locally stored isolate workup, including organism group, initial observation, biochemical answers, and the Test Suite provenance needed to replay the result later.
_Avoid_: history item, session snapshot

## Example Dialogue

Domain expert: "This saved case used our Enterobacterales Test Suite, not the default one."

Developer: "Then the Saved Case should keep the suite ID and answer values keyed by Canonical Test ID, so renaming 'Indole (IMViC)' does not break replay."

Domain expert: "This Test Suite calls glucose 'Glucose O/F', but another suite just calls it 'Glucose'."

Developer: "Both can share the same Canonical Test ID while each Test Suite keeps its own Suite Test Display Name."

Domain expert: "TSI appears in several Test Suites, but each organism group should only show the TSI interpretations that belong in that group."

Developer: "Keep TSI as one Canonical Test ID, then use Suite Result Options to constrain the buttons in the selected Test Suite."
