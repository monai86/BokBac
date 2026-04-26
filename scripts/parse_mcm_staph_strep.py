"""Parse MCM Staphylococcus + Streptococcus tables (symbolic format).

Adds clinically-relevant tests for the 5 Staph species and 7 Strep species
that exist in our LIBRARY.

Output: appends to scripts/mcm_extract/parsed/mcm_master.json
"""
import json
from pathlib import Path

OUT = Path("scripts/mcm_extract/parsed/mcm_master.json")

# Symbol → percentage mapping
SYMBOL_PCT = {
    "+": 95, "−": 5, "-": 5, "V": 50, "v": 50, "d": 50,
    "(+)": 80, "(−)": 20, "(-)": 20, "(d)": 50,
    "ND": None, "NA": None,
}

# ─────────────────────────────────────────────────────────────────────────
# Staphylococcus Table 2 (ch.21, page 386-387)
# Selected clinically-useful tests only (12 of 36 columns)
# ─────────────────────────────────────────────────────────────────────────
# Column index ↔ test_id mapping (based on decoded MCM Table 2 headers)
STAPH_TESTS = [
    ("coagulase",                "coagulase"),
    ("clumping_factor",          "clumping_factor"),
    ("heat_stable_nuclease",     "dnase"),
    ("hemolysins",               "hemolysis"),
    ("catalase",                 "catalase"),
    ("oxidase",                  "oxidase"),
    ("urease",                   "urea"),
    ("nitrate_reduction",        "nitrate_reduction"),
    ("novobiocin_resistance",    "novobiocin"),
    ("d_trehalose",              "trehalose"),
    ("d_mannitol",               "mannitol_d"),
    ("d_mannose",                "mannose_d"),
    ("alpha_lactose",            "lactose"),
    ("sucrose",                  "sucrose"),
]

# Manually transcribed from page_386.txt and page_387.txt for our 5 LIBRARY species
# Order matches STAPH_TESTS above
STAPH_DATA = {
    "Staphylococcus aureus": {
        # S. aureus subsp. aureus (page_386.txt line 68)
        "lib_id": "s_aureus",
        "vals": ["+", "+", "+", "+", "+", "−", "d", "+", "−", "+", "+", "+", "+", "+"],
    },
    "Staphylococcus epidermidis": {
        # page_386.txt line 81
        "lib_id": "s_epidermidis",
        "vals": ["−", "−", "−", "(d)", "+", "−", "+", "+", "−", "−", "−", "−", "d", "+"],
    },
    "Staphylococcus haemolyticus": {
        # page_386.txt line 87
        "lib_id": "s_haemolyticus",
        "vals": ["−", "−", "−", "(+)", "+", "−", "−", "+", "−", "+", "d", "−", "+", "+"],
    },
    "Staphylococcus lugdunensis": {
        # page_386.txt line 94
        "lib_id": "s_lugdunensis",
        "vals": ["−", "(+)", "−", "(+)", "+", "−", "d", "+", "−", "d", "+", "+", "+", "+"],
    },
    "Staphylococcus saprophyticus": {
        # page_387.txt — saprophyticus subsp. saprophyticus
        "lib_id": "s_saprophyticus",
        "vals": ["−", "−", "−", "−", "+", "−", "+", "−", "+", "+", "d", "−", "d", "+"],
    },
}

# Prevalence symbols for Staph (clinical knowledge — MCM doesn't tabulate)
STAPH_PREVALENCE = {
    "Staphylococcus aureus": "++++",       # most common; pathogenic
    "Staphylococcus epidermidis": "+++",   # very common CoNS contaminant
    "Staphylococcus saprophyticus": "+++", # common UTI in young women
    "Staphylococcus haemolyticus": "++",   # 2nd most common CoNS
    "Staphylococcus lugdunensis": "++",    # uncommon but virulent
}

# ─────────────────────────────────────────────────────────────────────────
# Streptococcus Table 1 (ch.22, page 412)
# β-hemolytic Streptococci differentiation
# ─────────────────────────────────────────────────────────────────────────
STREP_TESTS = [
    ("bacitracin_susceptibility", "bacitracin"),
    ("PYR",                       "pyr"),
    ("CAMP",                      "camp"),
    ("VP",                        "voges_proskauer"),
    ("hippurate_hydrolysis",      "hippurate"),
    ("trehalose",                 "trehalose"),
    ("sorbitol",                  "sorbitol_d"),
]

# From page_412.txt (β-hemolytic) + clinical knowledge for α/γ
STREP_DATA = {
    "Streptococcus pyogenes": {
        # Group A; large colonies
        "lib_id": "s_pyogenes",
        "vals": ["+", "+", "−", "−", "−", "+", "−"],
        "prevalence": "++++",
    },
    "Streptococcus agalactiae": {
        # Group B
        "lib_id": "s_agalactiae",
        "vals": ["−", "−", "+", "−", "+", "V", "−"],
        "prevalence": "+++",
    },
    "Streptococcus pneumoniae": {
        # α-hemolytic; not in Table 1 but PYR−, optochin-S, bile-soluble
        "lib_id": "s_pneumoniae",
        "vals": ["−", "−", "−", "−", "−", "+", "−"],
        "prevalence": "++++",
    },
    # Enterococci — from MCM ch.23 (more variable; minimal data)
    "Enterococcus faecalis": {
        "lib_id": "enterococcus_faecalis",
        "vals": ["−", "+", "−", "+", "−", "+", "+"],
        "prevalence": "++++",
    },
    "Enterococcus faecium": {
        "lib_id": "enterococcus_faecium",
        "vals": ["−", "+", "−", "+", "−", "+", "−"],
        "prevalence": "+++",
    },
}


def symbols_to_tests(test_defs, vals):
    """Convert (label, test_id) tuples × symbol values → tests dict."""
    out = {}
    for (_, test_id), sym in zip(test_defs, vals):
        pct = SYMBOL_PCT.get(sym)
        if pct is not None:
            out[test_id] = pct
    return out


def main():
    new_species = []
    
    # Staph
    print("Staphylococcus species:")
    for name, info in STAPH_DATA.items():
        tests = symbols_to_tests(STAPH_TESTS, info["vals"])
        prev_sym = STAPH_PREVALENCE.get(name)
        prev_score = {"++++": 4, "+++": 3, "++": 2, "+": 1, "−": 0}.get(prev_sym)
        record = {
            "species": name,
            "source": "MCM 11th ch.21 Table 2",
            "scale": "symbolic",
            "tests": tests,
        }
        if prev_score is not None:
            record["prevalence_symbol"] = prev_sym
            record["prevalence_score"] = prev_score
        new_species.append(record)
        print(f"  {name}: {len(tests)} tests, prev={prev_sym}")
    
    # Strep
    print("\nStreptococcus/Enterococcus species:")
    for name, info in STREP_DATA.items():
        tests = symbols_to_tests(STREP_TESTS, info["vals"])
        prev_sym = info.get("prevalence")
        prev_score = {"++++": 4, "+++": 3, "++": 2, "+": 1, "−": 0}.get(prev_sym)
        record = {
            "species": name,
            "source": "MCM 11th ch.22/23",
            "scale": "symbolic",
            "tests": tests,
        }
        if prev_score is not None:
            record["prevalence_symbol"] = prev_sym
            record["prevalence_score"] = prev_score
        new_species.append(record)
        print(f"  {name}: {len(tests)} tests, prev={prev_sym}")
    
    # Merge
    existing = json.loads(OUT.read_text(encoding="utf-8"))
    new_names = [s["species"] for s in new_species]
    existing = [s for s in existing if s["species"] not in new_names]
    merged = existing + new_species
    OUT.write_text(json.dumps(merged, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n✅ Master JSON updated: {len(merged)} species total")

if __name__ == "__main__":
    main()
