"""Parse MCM ch.41 (Vibrio) Table 2 and ch.42 (Pseudomonas) Table 1.

Both tables use the same numerical-% format as Ch.37 Table 1.
Output appended to scripts/mcm_extract/parsed/mcm_master.json.
"""
import json
import re
from pathlib import Path

LAYOUT_DIR = Path("scripts/mcm_extract/layout")
OUT = Path("scripts/mcm_extract/parsed/mcm_master.json")

# ─────────────────────────────────────────────────────────────────────────
# Pseudomonas Table 1 (ch.42, page 807)
# ─────────────────────────────────────────────────────────────────────────
PSEUDO_SPECIES_ORDER = [
    "Pseudomonas aeruginosa",
    "Pseudomonas fluorescens",
    "Pseudomonas putida",
    "Pseudomonas veronii",
    "Pseudomonas monteilii",
    "Pseudomonas mosselii",
    "Pseudomonas stutzeri",
    "Pseudomonas mendocina",
    "Pseudomonas pseudoalcaligenes",
    "Pseudomonas alcaligenes",
    "Pseudomonas luteola",
    "Pseudomonas oryzihabitans",
]

# Test rows in order with their canonical names
PSEUDO_TESTS = [
    ("Oxidase",                       "oxidase"),
    ("MacConkey agar",                "macconkey_growth"),
    ("Cetrimide",                     "cetrimide_growth"),
    ("6% NaCl",                       "salt_6pct"),
    ("42°C",                          "growth_42c"),
    ("Nitrate reduction",             "nitrate_reduction"),
    ("Gas from nitrate",              "nitrate_gas"),
    ("Pyoverdin",                     "pyoverdin"),
    ("Pyocyanin",                     "pyocyanin"),
    ("Arginine dihydrolase",          "arginine_dihydrolase"),
    ("Lysine decarboxylase",          "lysine_decarboxylase"),
    ("Ornithine decarboxylase",       "ornithine_decarboxylase"),
    ("Urea",                          "urea"),
    ("Gelatin (7-day incubation)",    "gelatin_hydrolysis"),
    ("Acetamide",                     "acetamide"),
    ("Esculin",                       "esculin"),
    ("Starch",                        "starch_hydrolysis"),
    ("Glucose",                       "glucose_acid"),
    ("Fructose",                      "fructose_acid"),
    ("Xylose",                        "xylose_d"),
    ("Lactose",                       "lactose"),
    ("Sucrose",                       "sucrose"),
    ("Maltose",                       "maltose"),
    ("Mannitol",                      "mannitol_d"),
    ("Simmons citrate",               "citrate_simmons"),
]


def parse_number(s):
    """Convert '94 (6)' → 94, 'ND' → None, '<1' → 0, 'V' → 50."""
    s = s.strip()
    if not s or s in ("ND", "NDc", "NA"):
        return None
    if s.startswith("V") or s.startswith("v"):
        return 50
    if s.startswith("<"):
        try:
            return max(0, int(s[1:].strip()) - 1)
        except ValueError:
            return 0
    # Strip footnote letters and parenthetical delayed-reaction info
    s = re.sub(r"\([^)]*\)", "", s).strip()
    s = re.sub(r"[^0-9]", "", s)
    if not s:
        return None
    try:
        return min(100, int(s))
    except ValueError:
        return None


def parse_pseudomonas():
    """Parse the Pseudomonas table from page_807.txt."""
    text = (LAYOUT_DIR / "page_807.txt").read_text(encoding="utf-8")
    
    # Find the start of data (after "Test" line)
    # Each row has format: "TestName  v1 v2 v3 ... v12"
    rows = {}
    for line in text.split("\n"):
        line = line.rstrip()
        if not line.strip():
            continue
        # Match against our known test patterns
        for label, test_id in PSEUDO_TESTS:
            # Build a flexible pattern: line starts (after whitespace) with the label
            label_norm = re.escape(label.replace(" ", "")).replace(r"\\ ", r"\\s*")
            pattern = re.compile(rf"^\s*{re.escape(label)}\s+(.+?)\s*$")
            m = pattern.match(line)
            if m:
                # Tokenize remaining values
                vals_str = m.group(1)
                # Split by whitespace, but preserve "94 (6)" as one token
                tokens = re.findall(r"[<\d]+\s*(?:\([^)]*\))?|ND[a-z]*|NA|V[a-z]?|>1|d", vals_str)
                tokens = [t.strip() for t in tokens if t.strip()]
                if 10 <= len(tokens) <= 14:  # expect ~12 species
                    rows[test_id] = [parse_number(t) for t in tokens[:12]]
                    break
    
    # Build species data
    species_list = []
    for i, name in enumerate(PSEUDO_SPECIES_ORDER):
        tests = {}
        for label, test_id in PSEUDO_TESTS:
            if test_id in rows and i < len(rows[test_id]) and rows[test_id][i] is not None:
                tests[test_id] = rows[test_id][i]
        if tests:
            species_list.append({
                "species": name,
                "source": "MCM 11th ch.42 Table 1",
                "scale": "numerical",
                "tests": tests,
            })
    return species_list


# ─────────────────────────────────────────────────────────────────────────
# Vibrio Table 2 (ch.41, page 792)
# ─────────────────────────────────────────────────────────────────────────
VIBRIO_SPECIES_ORDER = [
    "Plesiomonas shigelloides",
    "Vibrio cholerae",
    "Vibrio mimicus",
    "Vibrio metschnikovii",
    "Vibrio cincinnatiensis",
    "Grimontia hollisae",
    "Photobacterium damselae",
    "Vibrio fluvialis",
    "Vibrio furnissii",
    "Vibrio alginolyticus",
    "Vibrio parahaemolyticus",
    "Vibrio vulnificus",
    "Vibrio harveyi",
]

VIBRIO_TESTS = [
    ("Indole (HIB)",            "indole"),
    ("VP",                      "voges_proskauer"),
    ("Arginine",                "arginine_dihydrolase"),
    ("Lysine",                  "lysine_decarboxylase"),
    ("Ornithine",               "ornithine_decarboxylase"),
    ("Motility",                "motility"),
    ("Gelatin hydrolysis",      "gelatin_hydrolysis"),
    ("D-Glucose, gas",          "glucose_gas"),
    ("L-Arabinose",             "arabinose"),
    ("Cellobiose",              "cellobiose"),
    ("Lactose",                 "lactose"),
    ("myo-Inositol",            "inositol_myo"),
    ("Salicin",                 "salicin"),
    ("Sucrose",                 "sucrose"),
    ("ONPG",                    "onpg"),
    ("0% NaCl",                 "salt_0pct"),
    ("6% NaCl",                 "salt_6pct"),
    ("O/129 susceptibility",    "o129_susceptibility"),
]


def parse_vibrio():
    """Parse the Vibrio table from page_792.txt."""
    text = (LAYOUT_DIR / "page_792.txt").read_text(encoding="utf-8")
    
    rows = {}
    for line in text.split("\n"):
        line = line.rstrip()
        if not line.strip():
            continue
        for label, test_id in VIBRIO_TESTS:
            pattern = re.compile(rf"^\s*{re.escape(label)}[a-z]*\s+(.+?)\s*$")
            m = pattern.match(line)
            if m:
                vals_str = m.group(1)
                tokens = re.findall(r"[<>\d]+\s*(?:\([^)]*\))?|ND[a-z]*|NA|V[a-z]?|d", vals_str)
                tokens = [t.strip() for t in tokens if t.strip()]
                if 11 <= len(tokens) <= 15:
                    rows[test_id] = [parse_number(t) for t in tokens[:13]]
                    break
    
    species_list = []
    for i, name in enumerate(VIBRIO_SPECIES_ORDER):
        tests = {}
        for label, test_id in VIBRIO_TESTS:
            if test_id in rows and i < len(rows[test_id]) and rows[test_id][i] is not None:
                tests[test_id] = rows[test_id][i]
        if tests:
            species_list.append({
                "species": name,
                "source": "MCM 11th ch.41 Table 2",
                "scale": "numerical",
                "tests": tests,
            })
    return species_list


def main():
    pseudo = parse_pseudomonas()
    print(f"Pseudomonas: {len(pseudo)} species")
    for s in pseudo[:3]:
        print(f"  {s['species']}: {len(s['tests'])} tests")
    
    vibrio = parse_vibrio()
    print(f"\nVibrio: {len(vibrio)} species")
    for s in vibrio[:3]:
        print(f"  {s['species']}: {len(s['tests'])} tests")
    
    # Merge with existing master
    existing = json.loads(OUT.read_text(encoding="utf-8"))
    new_species = [s["species"] for s in pseudo + vibrio]
    # Remove any existing entries with same names (for re-runs)
    existing = [s for s in existing if s["species"] not in new_species]
    merged = existing + pseudo + vibrio
    OUT.write_text(json.dumps(merged, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n✅ Master JSON updated: {len(merged)} species total")
    
    # Sample
    if pseudo:
        s = next((x for x in pseudo if x["species"] == "Pseudomonas aeruginosa"), None)
        if s:
            print(f"\n📋 Pseudomonas aeruginosa sample:")
            print(f"   oxidase: {s['tests'].get('oxidase')}%")
            print(f"   pyocyanin: {s['tests'].get('pyocyanin')}%")
            print(f"   nitrate_reduction: {s['tests'].get('nitrate_reduction')}%")
            print(f"   42°C growth: {s['tests'].get('growth_42c')}%")

if __name__ == "__main__":
    main()
