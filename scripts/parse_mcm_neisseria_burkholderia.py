"""Parse MCM ch.34 (Neisseria) Table 2 + ch.43 (Burkholderia mallei/pseudomallei) Table 2.

Both tables use the symbolic +/V/− notation but with different scoring.
Output is appended to scripts/mcm_extract/parsed/mcm_master.json.
"""
import json
from pathlib import Path

OUT = Path("scripts/mcm_extract/parsed/mcm_master.json")

# Symbol → percentage mapping
# Per Burkholderia footnote: "+, ≥90% of isolates are positive; v, 10 to 90% are positive; −, <10% are positive"
SYMBOL_PCT = {
    "+": 95, "−": 5, "-": 5, "V": 50, "v": 50,
    "(+)": 80, "0": 5, "ND": None, "NA": None,
}

# ─────────────────────────────────────────────────────────────────────────
# Neisseria ch.34 Table 2 (page 669)
# Columns: GLU, MAL, LAC, SUC, FRU, Nitrate reduction, Polysaccharide from SUC
# ─────────────────────────────────────────────────────────────────────────
NEISSERIA_TESTS = [
    ("glucose",          "glucose_acid"),
    ("maltose",          "maltose"),
    ("lactose",          "lactose"),
    ("sucrose",          "sucrose"),
    ("fructose",         "fructose_acid"),
    ("nitrate_reduction", "nitrate_reduction"),
    ("polysaccharide",   "polysaccharide_from_suc"),
]

# Manually transcribed from page_669.txt
NEISSERIA_DATA = [
    # name, [GLU, MAL, LAC, SUC, FRU, Nitrate, Poly]
    ("Neisseria animaloris",   ["+",  "0", "0", "0", "ND", "+",  "ND"]),
    ("Neisseria bacilliformis", ["0",  "0", "0", "0", "ND", "V",  "ND"]),
    ("Neisseria cinerea",      ["V",  "0", "0", "0", "0",  "0",  "0"]),
    ("Neisseria flavescens",   ["0",  "0", "0", "0", "0",  "0",  "+"]),
    ("Neisseria gonorrhoeae",  ["+",  "0", "0", "0", "0",  "0",  "0"]),
    ("Neisseria lactamica",    ["+",  "+", "+", "0", "0",  "0",  "0"]),
    ("Neisseria meningitidis", ["+",  "+", "0", "0", "0",  "0",  "0"]),
    ("Neisseria mucosa",       ["+",  "+", "0", "+", "+",  "+",  "+"]),
    ("Neisseria polysaccharea", ["V", "+", "0", "V", "0",  "0",  "+"]),
    ("Neisseria sicca",        ["+",  "+", "0", "+", "+",  "0",  "+"]),
    ("Neisseria subflava",     ["V",  "+", "0", "V", "V",  "0",  "V"]),
    ("Neisseria weaveri",      ["0",  "0", "0", "0", "0",  "0",  "ND"]),
    ("Neisseria zoodegmatis",  ["V",  "0", "0", "0", "ND", "V",  "ND"]),
    ("Neisseria elongata",     ["0",  "0", "0", "0", "0",  "V",  "0"]),  # combined subspecies
]


# ─────────────────────────────────────────────────────────────────────────
# Burkholderia mallei/pseudomallei/thailandensis (ch.43 Table 2, page 828)
# ─────────────────────────────────────────────────────────────────────────
BURK_TESTS = [
    ("urea",            "urea"),
    ("citrate",         "citrate"),
    ("gelatin",         "gelatin_hydrolysis"),
    ("esculin",         "esculin"),
    ("glucose",         "glucose_acid"),
    ("xylose",          "xylose_d"),
    ("lactose",         "lactose"),
    ("sucrose",         "sucrose"),
    ("maltose",         "maltose"),
    ("mannitol",        "mannitol_d"),
    ("arabinose",       "arabinose"),
    ("motility",        "motility"),
]

# From page_828.txt — columns are: B. mallei, B. pseudomallei, B. thailandensis
BURK_DATA = [
    ("Burkholderia mallei",         ["v", "−", "−", "−", "+", "v", "v", "−", "−", "−", "ND", "0"]),
    ("Burkholderia pseudomallei",   ["v", "v", "v", "v", "+", "+", "+", "v", "+", "+", "−",  "+"]),
    ("Burkholderia thailandensis",  ["v", "v", "v", "v", "+", "+", "+", "v", "+", "+", "+",  "+"]),
]


# Prevalence (clinical relevance — Thailand-specific weighting for B. pseudomallei)
PREVALENCE_DATA = {
    "Neisseria gonorrhoeae": "++++",
    "Neisseria meningitidis": "++++",
    "Neisseria lactamica": "+++",
    "Neisseria mucosa": "++",
    "Neisseria sicca": "++",
    "Neisseria cinerea": "++",
    "Neisseria flavescens": "+",
    "Neisseria polysaccharea": "+",
    "Neisseria subflava": "++",
    "Neisseria elongata": "+",
    "Neisseria weaveri": "+",
    "Neisseria animaloris": "+",
    "Neisseria bacilliformis": "+",
    "Neisseria zoodegmatis": "+",
    "Burkholderia pseudomallei": "+++",  # endemic in SE Asia
    "Burkholderia thailandensis": "+",
    "Burkholderia mallei": "−",  # extremely rare; bioterror agent
}

PREVALENCE_MAP = {"++++": 4, "+++": 3, "++": 2, "+": 1, "−": 0}


def symbols_to_tests(test_defs, vals):
    out = {}
    for (_, test_id), sym in zip(test_defs, vals):
        pct = SYMBOL_PCT.get(sym)
        if pct is not None:
            out[test_id] = pct
    return out


def build(name, vals, test_defs, source):
    record = {
        "species": name,
        "source": source,
        "scale": "symbolic",
        "tests": symbols_to_tests(test_defs, vals),
    }
    prev_sym = PREVALENCE_DATA.get(name)
    if prev_sym is not None:
        record["prevalence_symbol"] = prev_sym
        record["prevalence_score"] = PREVALENCE_MAP[prev_sym]
    return record


def main():
    new_species = []
    
    print("Neisseria species:")
    for name, vals in NEISSERIA_DATA:
        rec = build(name, vals, NEISSERIA_TESTS, "MCM 11th ch.34 Table 2")
        new_species.append(rec)
        print(f"  {name}: {len(rec['tests'])} tests, prev={rec.get('prevalence_symbol')}")
    
    print("\nBurkholderia species:")
    for name, vals in BURK_DATA:
        rec = build(name, vals, BURK_TESTS, "MCM 11th ch.43 Table 2")
        new_species.append(rec)
        print(f"  {name}: {len(rec['tests'])} tests, prev={rec.get('prevalence_symbol')}")
    
    # Merge
    existing = json.loads(OUT.read_text(encoding="utf-8"))
    new_names = [s["species"] for s in new_species]
    existing = [s for s in existing if s["species"] not in new_names]
    merged = existing + new_species
    OUT.write_text(json.dumps(merged, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n✅ Master JSON updated: {len(merged)} species total")

if __name__ == "__main__":
    main()
