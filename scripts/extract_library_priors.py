"""Extract `id` + `importance` from inline LIBRARY in index.html.

Maps LIBRARY's clinical importance scale to MCM-equivalent prevalence_score:
  critical  → 4 (++++ frequent)
  high      → 3 (+++ occasional)
  moderate  → 2 (++ rare)
  low       → 1 (+ very rare)

Output: scripts/mcm_extract/parsed/library_priors.json
"""
import re
import json
from pathlib import Path

OUT = Path("scripts/mcm_extract/parsed/library_priors.json")
OUT.parent.mkdir(exist_ok=True, parents=True)

IMPORTANCE_TO_PREVALENCE = {
    "critical": 4,
    "high": 3,
    "moderate": 2,
    "low": 1,
}

def main():
    src = Path("index.html").read_text(encoding="utf-8")

    # Match each species block: id: '...', group: '...', name: '...', ... importance: '...'
    # The block can span multiple lines; we use a forgiving regex.
    pattern = re.compile(
        r"id: '([^']+)', group: '([^']+)', name: '([^']+)'.*?importance: '([^']+)'",
        re.DOTALL,
    )
    matches = pattern.findall(src)
    print(f"Found {len(matches)} species with importance fields")

    priors = {}
    for sid, grp, name, imp in matches:
        score = IMPORTANCE_TO_PREVALENCE.get(imp.lower())
        if score is None:
            continue
        priors[sid] = {
            "name": name,
            "group": grp,
            "importance": imp,
            "prevalence_score": score,
            "prevalence_symbol": ["−", "+", "++", "+++", "++++"][score],
        }

    OUT.write_text(json.dumps(priors, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n✅ Wrote {len(priors)} priors → {OUT}")

    # Group breakdown
    from collections import Counter
    by_group = Counter(p["group"] for p in priors.values())
    by_imp = Counter(p["importance"] for p in priors.values())
    print(f"\nBy importance: {dict(by_imp)}")
    print(f"By group:      {dict(by_group)}")

if __name__ == "__main__":
    main()
