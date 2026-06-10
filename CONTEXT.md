# BokBac

BokBac is an educational bacterial identification context. Its language distinguishes the isolate workup, biochemical test suites, and ranked identification outputs used for teaching microbiology reasoning.

## Language

**Test Suite**:
A named biochemical test panel for one organism group. A Test Suite contains ordered test identifiers and may represent a system default, user custom panel, or institution panel.
_Avoid_: panel, checklist, assay bundle

**Canonical Test ID**:
The stable identifier for a biochemical test result across UI, saved cases, and calculation. Display labels may change, but the Canonical Test ID should remain stable.
_Avoid_: label key, test name key

**Saved Case**:
A locally stored isolate workup, including organism group, initial observation, biochemical answers, and the Test Suite provenance needed to replay the result later.
_Avoid_: history item, session snapshot

## Example Dialogue

Domain expert: "This saved case used our Enterobacterales Test Suite, not the default one."

Developer: "Then the Saved Case should keep the suite ID and answer values keyed by Canonical Test ID, so renaming 'Indole (IMViC)' does not break replay."
