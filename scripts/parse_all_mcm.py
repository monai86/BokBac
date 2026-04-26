"""Comprehensive MCM 11th biochemical table parser.

Outputs a unified JSON with all parsed species & their biochemical profiles.

Output format:
[
  {
    "species": "Escherichia coli",
    "source": "MCM ch.37 Table 1",
    "scale": "numerical",  // or "symbolic"
    "tests": {
      "indole": 98,             // % positive (0-100)
      "motility": 95,
      ...
    }
  },
  ...
]
"""
import json
import re
from pathlib import Path

RAW_DIR = Path("scripts/mcm_extract/raw_tables")
OUT_DIR = Path("scripts/mcm_extract/parsed")
OUT_DIR.mkdir(exist_ok=True, parents=True)

# Symbol → percentage mapping (Enterobacteriaceae-style notation)
# +, ≥90%; V, 11-89%; −, ≤10%
SYMBOL_PCT = {
    "+": 95,
    "−": 5,
    "-": 5,
    "V": 50,
    "v": 50,
    "(+)": 80,
    "(±)": 50,
    "±": 50,
    "(d)": 50,
    "d": 50,
    "(-)": 20,
    "(−)": 20,
    "ND": None,  # not determined → skip
    "NA": None,
}

# ---------- Table 1 (numerical, ch.37) ----------
TABLE1_TESTS = [
    "indole_production",
    "voges_proskauer",
    "motility",
    "yellow_pigment",
    "lysine_decarboxylase",
    "ornithine_decarboxylase",
    "kcn_growth",
    "acetate_utilization",
    "mucate_utilization",
    "glucose_gas",
    "adonitol",
    "arabinose",
    "arabitol_d",
    "cellobiose",
    "dulcitol",
    "lactose",
    "sucrose",
    "mannitol_d",
    "raffinose",
    "rhamnose_l",
    "sorbitol_d",
    "xylose_d",
]

# Hardcoded species names in order they appear in Table 1
# (because the parser had multi-line name issues)
TABLE1_SPECIES_ORDER = [
    "Escherichia albertii biogroup 1",
    "Escherichia albertii biogroup 2",
    "Escherichia blattae",
    "Escherichia coli",
    "Escherichia coli (inactive biotypes)",
    "Escherichia fergusonii",
    "Escherichia hermannii",
    "Escherichia vulneris",
    "Shigella boydii",
    "Shigella dysenteriae",
    "Shigella flexneri",
    "Shigella sonnei",
    "Hafnia alvei",
    "Hafnia alvei biogroup 1",
    "Salmonella serotype Paratyphi A",
    "Salmonella serotype Choleraesuis",
    "Yersinia ruckeri",
]

ROW_VALUES_RE = re.compile(r"(?:\d{1,3}\s+){21}\d{1,3}(?:\s|$)")

def parse_table1():
    """Parse Ch.37 Table 1: numerical % positivity."""
    src = RAW_DIR / "ch37_escherichia_salmonella_shigella.json"
    data = json.loads(src.read_text(encoding="utf-8"))
    table1 = next(t for t in data if t["table_num"] == "1")
    body = table1["body"]
    
    # Find all 22-number sequences
    matches = ROW_VALUES_RE.findall(body)
    species_data = []
    for i, m in enumerate(matches):
        if i >= len(TABLE1_SPECIES_ORDER):
            break
        nums = [int(x) for x in m.split()]
        if len(nums) != 22:
            continue
        species_data.append({
            "species": TABLE1_SPECIES_ORDER[i],
            "source": "MCM 11th ch.37 Table 1",
            "scale": "numerical",
            "tests": dict(zip(TABLE1_TESTS, nums)),
        })
    return species_data

# ---------- Symbol tables (Tables 3-12, ch.38) ----------

# Table 3: Citrobacter — Indole, ODC, Malonate, Sucrose, Dulcitol, Melibiose, Adonitol
TABLE3_TESTS = ["indole", "ornithine_decarboxylase", "malonate",
                "sucrose", "dulcitol", "melibiose", "adonitol"]
TABLE3_SPECIES = [
    "Citrobacter amalonaticus",
    "Citrobacter braakii",
    "Citrobacter farmeri",
    "Citrobacter freundii",
    "Citrobacter koseri",
    "Citrobacter rodentium",
    "Citrobacter sedlakii",
    "Citrobacter werkmanii",
    "Citrobacter youngae",
    "Citrobacter gillenii",
    "Citrobacter murliniae",
]

# Table 5: Klebsiella & Raoultella
TABLE5_TESTS = ["indole", "ornithine_decarboxylase", "voges_proskauer",
                "malonate", "onpg", "growth_10c", "growth_44c", "melezitose_d"]
TABLE5_SPECIES = [
    "Raoultella ornithinolytica",
    "Klebsiella oxytoca",
    "Klebsiella ozaenae",
    "Klebsiella pneumoniae",
    "Raoultella planticola",
    "Raoultella terrigena",
    "Klebsiella rhinoscleromatis",
]

# Table 7: Proteus, Providencia, Morganella
TABLE7_TESTS = ["indole", "h2s", "urea", "ornithine_decarboxylase",
                "maltose", "adonitol_d", "arabitol_d", "trehalose", "inositol_myo"]
TABLE7_SPECIES = [
    "Proteus hauseri",
    "Proteus mirabilis",
    "Proteus penneri",
    "Proteus vulgaris",
    "Providencia alcalifaciens",
    "Providencia heimbachae",
    "Providencia rettgeri",
    "Providencia rustigianii",
    "Providencia stuartii",
    "Morganella morganii subsp. morganii",
    "Morganella morganii subsp. sibonii",
]

# Hardcoded reference data — manually transcribed from the layout-extracted text
# (more reliable than regex parsing of complex multi-column tables)
# These come from pages we already extracted: page_751.txt, page_752.txt
TABLE3_DATA = [
    # Indole, ODC, Malonate, Sucrose, Dulcitol, Melibiose, Adonitol
    ("Citrobacter amalonaticus",  ["+", "+", "−", "−", "−", "−", "−"]),
    ("Citrobacter braakii",       ["V", "+", "−", "−", "V", "V", "−"]),
    ("Citrobacter farmeri",       ["+", "+", "−", "+", "−", "+", "−"]),
    ("Citrobacter freundii",      ["V", "−", "−", "V", "−", "+", "−"]),
    ("Citrobacter koseri",        ["+", "+", "+", "V", "V", "−", "+"]),
    ("Citrobacter rodentium",     ["−", "+", "+", "−", "−", "−", "−"]),
    ("Citrobacter sedlakii",      ["V", "+", "+", "−", "+", "+", "−"]),
    ("Citrobacter werkmanii",     ["−", "−", "+", "−", "−", "−", "−"]),
    ("Citrobacter youngae",       ["V", "−", "−", "V", "+", "−", "−"]),
    ("Citrobacter gillenii",      ["−", "−", "+", "V", "−", "V", "−"]),
    ("Citrobacter murliniae",     ["+", "−", "−", "V", "+", "V", "−"]),
]

TABLE5_DATA = [
    # Indole, ODC, VP, Malonate, ONPG, 10C, 44C, Melezitose
    ("Raoultella ornithinolytica",     ["+", "+", "V", "+", "+", "+", "NA", "NA"]),
    ("Klebsiella oxytoca",             ["+", "−", "+", "+", "+", "−", "+", "−"]),
    ("Klebsiella ozaenae",             ["−", "−", "−", "−", "V", "NA", "NA", "NA"]),
    ("Klebsiella pneumoniae",          ["−", "−", "+", "+", "+", "−", "+", "−"]),
    ("Raoultella planticola",          ["V", "−", "+", "+", "+", "+", "−", "−"]),
    ("Raoultella terrigena",           ["−", "−", "+", "+", "+", "+", "−", "+"]),
    ("Klebsiella rhinoscleromatis",    ["−", "−", "−", "+", "−", "NA", "NA", "NA"]),
]

TABLE7_DATA = [
    # Indole, H2S, Urea, ODC, Maltose, Adonitol-D, Arabitol-D, Trehalose, Inositol-myo
    ("Proteus hauseri",      ["+", "V", "+", "−", "+", "−", "−", "+", "−"]),
    ("Proteus mirabilis",    ["−", "+", "+", "+", "−", "−", "−", "+", "−"]),
    ("Proteus penneri",      ["−", "V", "+", "−", "+", "−", "−", "V", "−"]),
    ("Proteus vulgaris",     ["+", "V", "+", "−", "+", "−", "−", "−", "−"]),
    ("Providencia alcalifaciens",   ["+", "−", "−", "−", "−", "+", "−", "−", "−"]),
    ("Providencia heimbachae",      ["−", "−", "−", "−", "V", "+", "+", "−", "V"]),
    ("Providencia rettgeri",        ["+", "−", "+", "−", "−", "+", "+", "−", "+"]),
    ("Providencia rustigianii",     ["+", "−", "−", "−", "−", "−", "−", "−", "−"]),
    ("Providencia stuartii",        ["+", "−", "V", "−", "−", "−", "−", "+", "+"]),
    ("Morganella morganii subsp. morganii",  ["+", "−", "+", "+", "−", "−", "−", "−", "−"]),
    ("Morganella morganii subsp. sibonii",   ["V", "−", "+", "+", "−", "−", "−", "+", "−"]),
]


def symbol_table_to_species(species_data, tests, source):
    """Convert symbolic table rows to species data."""
    out = []
    for name, symbols in species_data:
        tests_dict = {}
        for test_id, sym in zip(tests, symbols):
            pct = SYMBOL_PCT.get(sym)
            if pct is not None:
                tests_dict[test_id] = pct
        out.append({
            "species": name,
            "source": source,
            "scale": "symbolic",
            "tests": tests_dict,
        })
    return out

# ---------- Prevalence (Table 1, ch.38) ----------
# ++++ frequent, +++ occasional, ++ rare, + very rare, − not isolated
PREVALENCE_MAP = {
    "++++": 4,
    "+++": 3,
    "++": 2,
    "+": 1,
    "−": 0,
    "Unk": None,
}

# Manually transcribed from page_744.txt and page_745.txt (Table 1 ch.38)
# This is authoritative prevalence data
PREVALENCE_DATA = {
    "Averyella dalhousiensis": "Unk",
    "Citrobacter amalonaticus": "++",
    "Citrobacter braakii": "+++",
    "Citrobacter farmeri": "++",
    "Citrobacter freundii": "++++",
    "Citrobacter koseri": "++",
    "Citrobacter sedlakii": "+",
    "Citrobacter werkmanii": "+",
    "Citrobacter youngae": "++",
    "Cronobacter sakazakii": "++",
    "Enterobacter aerogenes": "++++",
    "Enterobacter asburiae": "++",
    "Enterobacter cancerogenus": "++",
    "Enterobacter cloacae": "++++",
    "Enterobacter hormaechei": "++",
    "Enterobacter kobei": "+",
    "Hafnia alvei": "++",
    "Klebsiella granulomatis": "++",
    "Klebsiella pneumoniae": "++++",
    "Klebsiella ozaenae": "++",
    "Klebsiella oxytoca": "+++",
    "Klebsiella variicola": "++",
    "Morganella morganii": "++",
    "Pantoea agglomerans": "+++",
    "Plesiomonas shigelloides": "+++",
    "Pluralibacter gergoviae": "++",
    "Proteus mirabilis": "++++",
    "Proteus penneri": "++",
    "Proteus vulgaris": "+++",
    "Providencia alcalifaciens": "+++",
    "Providencia rettgeri": "+++",
    "Providencia stuartii": "+++",
    "Raoultella ornithinolytica": "+",
    "Serratia liquefaciens": "+++",
    "Serratia marcescens": "++++",
    # External — not in MCM Table 1 ch.38 but added from clinical knowledge
    "Escherichia coli": "++++",
    "Salmonella serotype Typhi": "++++",
    "Salmonella enterica": "++++",
    "Shigella sonnei": "+++",
    "Shigella flexneri": "+++",
    "Shigella dysenteriae": "++",
    "Shigella boydii": "+",
}


def main():
    all_species = []
    
    # Numerical table
    print("Parsing Ch.37 Table 1 (numerical)...")
    rows = parse_table1()
    all_species.extend(rows)
    print(f"  → {len(rows)} species")
    
    # Symbolic tables
    for label, data, tests in [
        ("Citrobacter (Table 3)", TABLE3_DATA, TABLE3_TESTS),
        ("Klebsiella/Raoultella (Table 5)", TABLE5_DATA, TABLE5_TESTS),
        ("Proteus/Providencia/Morganella (Table 7)", TABLE7_DATA, TABLE7_TESTS),
    ]:
        print(f"Parsing Ch.38 {label}...")
        rows = symbol_table_to_species(data, tests, f"MCM 11th ch.38 {label}")
        all_species.extend(rows)
        print(f"  → {len(rows)} species")
    
    # Add prevalence to each species
    for s in all_species:
        # Try direct match, then fuzzy
        prev_sym = PREVALENCE_DATA.get(s["species"])
        if prev_sym is None:
            # fuzzy: try genus + species (first 2 words)
            short_name = " ".join(s["species"].split()[:2])
            prev_sym = PREVALENCE_DATA.get(short_name)
        if prev_sym is not None:
            s["prevalence_symbol"] = prev_sym
            s["prevalence_score"] = PREVALENCE_MAP.get(prev_sym)
    
    # Save
    out_path = OUT_DIR / "mcm_master.json"
    out_path.write_text(json.dumps(all_species, ensure_ascii=False, indent=2),
                        encoding="utf-8")
    print(f"\n✅ Total: {len(all_species)} species → {out_path}")
    
    # Summary
    with_prev = sum(1 for s in all_species if "prevalence_score" in s)
    print(f"   {with_prev} species have prevalence data")
    
    # Show E. coli sample
    for s in all_species:
        if s["species"] == "Escherichia coli":
            print(f"\n📋 Sample — {s['species']}:")
            print(f"   prevalence: {s.get('prevalence_symbol')} (score={s.get('prevalence_score')})")
            print(f"   indole: {s['tests']['indole_production']}%")
            print(f"   motility: {s['tests']['motility']}%")
            print(f"   lactose: {s['tests']['lactose']}%")
            print(f"   sucrose: {s['tests']['sucrose']}%")
            break

if __name__ == "__main__":
    main()
