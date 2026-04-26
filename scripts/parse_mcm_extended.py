"""Parse MCM 11th Ed. biochemical tables for:
  - Yersinia (Ch.39 p.768 Table 1) — symbolic +/V/−/(+)/ND
  - Aeromonas (Ch.40 p.784 Table 3) — numerical % in parentheses
  - Serratia + Enterobacter extra (Ch.38 p.752-755 Table 3-7) — symbolic
  - Listeria / Bacillus (Ch.26/27 — symbolic, manually transcribed)
  - Acinetobacter (Ch.43 — symbolic, manually transcribed key species)

All records are appended to scripts/mcm_extract/parsed/mcm_master.json.
"""
import json
from pathlib import Path

OUT = Path("scripts/mcm_extract/parsed/mcm_master.json")

SYMBOL_PCT = {
    "+": 95, "−": 5, "-": 5, "V": 50, "v": 50,
    "(+)": 80, "0": 5, "ND": None, "NA": None, "NF": None,
}

PREVALENCE_MAP = {"++++": 4, "+++": 3, "++": 2, "+": 1, "−": 0}

PREVALENCE = {
    # Yersinia
    "Yersinia enterocolitica": "+++",
    "Yersinia pestis": "++",
    "Yersinia pseudotuberculosis": "++",
    "Yersinia frederiksenii": "+",
    "Yersinia kristensenii": "+",
    "Yersinia intermedia": "+",
    "Yersinia mollaretii": "+",
    "Yersinia bercovieri": "+",
    "Yersinia aldovae": "+",
    "Yersinia rohdei": "+",
    "Yersinia ruckeri": "+",
    # Aeromonas
    "Aeromonas hydrophila": "+++",
    "Aeromonas caviae": "+++",
    "Aeromonas veronii": "++",
    "Aeromonas jandaei": "+",
    "Aeromonas bestiarum": "+",
    "Aeromonas schubertii": "+",
    "Aeromonas trota": "+",
    # Serratia / Enterobacter
    "Serratia marcescens": "+++",
    "Serratia liquefaciens": "++",
    "Serratia odorifera": "+",
    "Serratia rubidaea": "+",
    "Enterobacter cloacae": "+++",
    "Enterobacter aerogenes": "+++",   # now Klebsiella aerogenes
    "Enterobacter agglomerans": "++",
    "Enterobacter asburiae": "+",
    "Enterobacter gergoviae": "+",
    # GP bacilli
    "Listeria monocytogenes": "+++",
    "Listeria innocua": "++",
    "Listeria ivanovii": "+",
    "Bacillus anthracis": "++",
    "Bacillus cereus": "++",
    "Bacillus subtilis": "++",
    "Bacillus thuringiensis": "+",
    # Acinetobacter
    "Acinetobacter baumannii": "++++",
    "Acinetobacter haemolyticus": "++",
    "Acinetobacter lwoffii": "++",
    "Acinetobacter johnsonii": "+",
    "Acinetobacter junii": "+",
}


def sym_pct(sym):
    return SYMBOL_PCT.get(str(sym).strip(), None)


# ─────────────────────────────────────────────────────────────────────────
# YERSINIA  Ch.39 Table 1 (p.768)
# Cols: Motility, Urease, VP, Citrate, Indole, Rhamnose, Sucrose,
#       Cellobiose, Sorbose, Sorbitol, ODC, Melibiose, Salicin, Arabinose, Trehalose
# ─────────────────────────────────────────────────────────────────────────
YERSINIA_TESTS = [
    "motility", "urea", "voges_proskauer", "citrate_simon", "indole_production",
    "rhamnose", "sucrose", "cellobiose", "sorbose", "sorbitol",
    "ornithine_decarboxylase", "melibiose", "salicin", "arabinose", "trehalose",
]
# From page 768 layout text (manually aligned)
YERSINIA_DATA = [
    # name,              [mot, ure, VP, cit, ind, rha, suc, cel, sor, sorb, ODC, mel, sal, ara, tre]
    ("Yersinia pestis",              ["−","−","−","−","−","−","−","−","−","−","−","−","−","+","+"]),
    ("Yersinia pseudotuberculosis",  ["+","−","+","−","−","−","(+)","−","−","−","−","+","−","+","−"]),
    ("Yersinia enterocolitica",      ["+","+","+","V","−","V","−","+","+","+","+","−","−","−","+"]),
    ("Yersinia frederiksenii",       ["+","+","+","+","+","+","+","+","+","+","+","−","−","+","+"]),
    ("Yersinia kristensenii",        ["+","+","+","−","−","+","−","−","+","+","+","−","−","+","+"]),
    ("Yersinia ruckeri",             ["V","+","−","−","−","−","−","−","−","−","−","−","−","−","−"]),
    ("Yersinia mollaretii",          ["+","+","+","−","+","−","−","+","+","+","+","−","−","(+)","+"]),
    ("Yersinia bercovieri",          ["+","+","+","−","−","−","−","+","+","−","+","−","−","−","+"]),
    ("Yersinia rohdei",              ["+","+","+","−","+","−","−","+","+","−","+","+","+","−","+"]),
    ("Yersinia aldovae",             ["+","+","+","+","+","−","+","−","−","−","+","−","−","−","+"]),
    ("Yersinia intermedia",          ["+","+","+","+","+","+","+","+","+","+","+","+","+","+","+"]),
    ("Yersinia aleksiciae",          ["+","+","+","−","−","−","−","−","−","+","−","−","−","−","+"]),
]

# ─────────────────────────────────────────────────────────────────────────
# AEROMONAS  Ch.40 Table 3 (p.784) — actual % in parentheses
# 10 species × 17 tests  (only using numerics — skip ND)
# ─────────────────────────────────────────────────────────────────────────
AEROMONAS_TESTS = [
    "citrate_simon", "dl_lactate", "gas_glucose", "indole_production",
    "voges_proskauer", "lipase", "cellobiose", "lactose", "rhamnose",
    "sorbitol", "mannose_d", "glycerol", "mannitol_d", "sucrose", "ampicillin_r",
]
# Rows from Table 3 — (species, [A.hydrophila, A.bestiarum, A.salmonicida,
#   A.caviae, A.media, A.eucrenophila, A.veronii, A.jandaei, A.schubertii, A.trota])
# Each value is the % for that species
# Format: species index → % positivity per test
_AERO_COLS = [
    "Aeromonas hydrophila", "Aeromonas bestiarum", "Aeromonas salmonicida",
    "Aeromonas caviae", "Aeromonas media", "Aeromonas eucrenophila",
    "Aeromonas veronii", "Aeromonas jandaei", "Aeromonas schubertii", "Aeromonas trota",
]
# Test rows in order: each row = (test_name, [values for 10 species])
_AERO_TABLE = [
    # test_id,             [hyd, bes, sal, cav, med, euc, ver, jan, sch, tro]
    ("citrate_simon",      [92,  38,  85,  88,  82,  0,   52,  87,  58,  94]),
    ("gas_glucose",        [92,  69,  77,  0,   0,   78,  92,  100, 0,   69]),
    ("indole_production",  [96,  100, 100, 84,  100, 89,  100, 100, 17,  100]),
    ("voges_proskauer",    [92,  63,  62,  0,   0,   0,   92,  87,  17,  0]),
    ("lipase",             [100, 88,  92,  76,  82,  89,  92,  100, 100, 0]),
    ("cellobiose",         [4,   38,  69,  100, 100, 56,  20,  20,  0,   100]),
    ("lactose",            [64,  13,  92,  60,  64,  11,  12,  0,   0,   0]),
    ("rhamnose",           [24,  69,  0,   0,   0,   22,  0,   0,   0,   0]),
    ("sorbitol",           [0,   0,   85,  4,   0,   0,   0,   0,   0,   0]),
    ("mannose_d",          [100, 100, 100, 32,  100, 100, None,100, 92,  100]),
    ("glycerol",           [96,  100, 100, 68,  55,  11,  100, 100, 0,   94]),
    ("mannitol_d",         [96,  100, 100, 100, 100, 100, 100, 100, 0,   69]),
    ("sucrose",            [100, 94,  100, 100, 100, 33,  100, 0,   0,   19]),
]

def build_aeromonas():
    records = []
    for ci, species in enumerate(_AERO_COLS):
        tests = {}
        for test_id, vals in _AERO_TABLE:
            v = vals[ci]
            if v is not None:
                tests[test_id] = int(v)
        prev_sym = PREVALENCE.get(species)
        rec = {
            "species": species,
            "source": "MCM 11th ch.40 Table 3",
            "scale": "numeric",
            "tests": tests,
        }
        if prev_sym:
            rec["prevalence_symbol"] = prev_sym
            rec["prevalence_score"] = PREVALENCE_MAP[prev_sym]
        records.append(rec)
    return records


# ─────────────────────────────────────────────────────────────────────────
# SERRATIA / ENTEROBACTER EXTRA (Ch.38 Tables 3–7, symbolic)
# MCM Table 3: separation of Citrobacter (already done)
# Table 4: Serratia separation
# Table 5: Enterobacter separation
# ─────────────────────────────────────────────────────────────────────────
SERRATIA_TESTS = [
    "ornithine_decarboxylase", "lysine_decarboxylase", "gelatin_hydrolysis",
    "voges_proskauer", "d_sorbitol", "sucrose", "dulcitol",
    "indole_production", "motility",
]
SERRATIA_DATA = [
    # From MCM Ch.38 Table 4 (separation of Serratia spp.)
    # [ODC, LDC, Gel, VP, Sorb, Suc, Dul, Ind, Mot]
    ("Serratia marcescens",   ["+", "+", "+", "+", "+", "+", "−", "−", "+"]),
    ("Serratia liquefaciens", ["+", "+", "+", "+", "V", "+", "−", "−", "+"]),
    ("Serratia odorifera",    ["+", "−", "+", "+", "+", "+", "−", "V", "+"]),
    ("Serratia rubidaea",     ["−", "−", "+", "+", "+", "+", "−", "−", "+"]),
    ("Serratia ficaria",      ["+", "−", "+", "+", "+", "+", "−", "−", "+"]),
]

ENTEROBACTER_TESTS = [
    "ornithine_decarboxylase", "lysine_decarboxylase", "indole_production",
    "voges_proskauer", "motility", "sorbitol_d", "adonitol",
    "malonate", "yellow_pigment",
]
ENTEROBACTER_DATA = [
    # From MCM Ch.38 Table 5 (separation of Enterobacter spp.) [ODC, LDC, Ind, VP, Mot, Sorb, Adon, Mal, Yell]
    ("Enterobacter cloacae",    ["+", "−", "−", "+", "+", "+", "−", "V", "−"]),
    ("Enterobacter aerogenes",  ["+", "+", "−", "+", "+", "+", "+", "+", "−"]),
    ("Enterobacter agglomerans",["−", "−", "V", "+", "+", "V", "−", "−", "+"]),
    ("Enterobacter asburiae",   ["+", "−", "−", "+", "+", "+", "−", "−", "−"]),
    ("Enterobacter gergoviae",  ["+", "+", "+", "+", "+", "−", "−", "+", "−"]),
]

# ─────────────────────────────────────────────────────────────────────────
# LISTERIA (Ch.27 Table 1 / 2) + BACILLUS (Ch.26 Table 1) — symbolic
# ─────────────────────────────────────────────────────────────────────────
LISTERIA_TESTS = [
    "hemolysis", "motility", "catalase", "camp", "rhamnose", "xylose", "mannitol_d",
]
LISTERIA_DATA = [
    # [Hemo, Mot, Cat, CAMP, Rha, Xyl, Man]
    ("Listeria monocytogenes", ["+", "+", "+", "+", "+", "−", "−"]),
    ("Listeria innocua",       ["−", "+", "+", "−", "+", "−", "−"]),
    ("Listeria ivanovii",      ["+", "+", "+", "−", "−", "+", "+"]),
    ("Listeria seeligeri",     ["+", "+", "+", "−", "−", "+", "−"]),
    ("Listeria welshimeri",    ["−", "+", "+", "−", "V", "+", "+"]),
]

BACILLUS_TESTS = [
    "motility", "hemolysis", "catalase", "voges_proskauer",
    "glucose_acid", "mannitol_d", "gelatin_hydrolysis", "urea",
]
BACILLUS_DATA = [
    # [Mot, Hemo, Cat, VP, Glu, Man, Gel, Ure]
    ("Bacillus anthracis",   ["−", "−", "+", "+", "+", "−", "+", "V"]),
    ("Bacillus cereus",      ["+", "+", "+", "+", "+", "−", "+", "V"]),
    ("Bacillus subtilis",    ["+", "V", "+", "+", "+", "+", "+", "+"]),
    ("Bacillus thuringiensis",["+", "+", "+", "+", "+", "−", "+", "V"]),
    ("Bacillus mycoides",    ["−", "+", "+", "+", "+", "−", "+", "V"]),
]

# ─────────────────────────────────────────────────────────────────────────
# ACINETOBACTER (Ch.43 Table 1, p.842) — manually transcribed
# Only most clinically relevant species
# ─────────────────────────────────────────────────────────────────────────
ACINETOBACTER_TESTS = [
    "oxidase", "motility", "hemolysis", "glucose_acid", "mannitol_d",
    "sucrose", "lactose", "nitrate_reduction", "gelatin_hydrolysis",
]
ACINETOBACTER_DATA = [
    # MCM Table 1: A. baumannii most common, others rarer
    # [Ox, Mot, Hem, Glu, Man, Suc, Lac, Nitr, Gel]
    ("Acinetobacter baumannii",  ["−", "−", "V", "+", "V", "−", "−", "−", "−"]),
    ("Acinetobacter haemolyticus",["−","−", "+", "+", "+", "+", "+", "−", "+"]),
    ("Acinetobacter lwoffii",    ["−", "−", "−", "−", "−", "−", "−", "−", "−"]),
    ("Acinetobacter johnsonii",  ["−", "−", "−", "−", "−", "−", "−", "+", "−"]),
    ("Acinetobacter junii",      ["−", "−", "V", "V", "V", "−", "−", "−", "−"]),
]


def symbols_to_tests(test_names, vals):
    out = {}
    for test, sym in zip(test_names, vals):
        pct = sym_pct(sym)
        if pct is not None:
            out[test] = pct
    return out


def build_symbolic(name, vals, test_names, source):
    prev_sym = PREVALENCE.get(name)
    rec = {
        "species": name,
        "source": source,
        "scale": "symbolic",
        "tests": symbols_to_tests(test_names, vals),
    }
    if prev_sym:
        rec["prevalence_symbol"] = prev_sym
        rec["prevalence_score"] = PREVALENCE_MAP[prev_sym]
    return rec


def main():
    new_records = []

    print("=== Yersinia ===")
    for name, vals in YERSINIA_DATA:
        r = build_symbolic(name, vals, YERSINIA_TESTS, "MCM 11th ch.39 Table 1")
        new_records.append(r)
        print(f"  {name}: {len(r['tests'])} tests, prev={r.get('prevalence_symbol')}")

    print("\n=== Aeromonas ===")
    for r in build_aeromonas():
        new_records.append(r)
        print(f"  {r['species']}: {len(r['tests'])} tests, prev={r.get('prevalence_symbol')}")

    print("\n=== Serratia ===")
    for name, vals in SERRATIA_DATA:
        r = build_symbolic(name, vals, SERRATIA_TESTS, "MCM 11th ch.38 Table 4")
        new_records.append(r)
        print(f"  {name}: {len(r['tests'])} tests, prev={r.get('prevalence_symbol')}")

    print("\n=== Enterobacter extra ===")
    for name, vals in ENTEROBACTER_DATA:
        r = build_symbolic(name, vals, ENTEROBACTER_TESTS, "MCM 11th ch.38 Table 5")
        new_records.append(r)
        print(f"  {name}: {len(r['tests'])} tests, prev={r.get('prevalence_symbol')}")

    print("\n=== Listeria ===")
    for name, vals in LISTERIA_DATA:
        r = build_symbolic(name, vals, LISTERIA_TESTS, "MCM 11th ch.27 Table 2")
        new_records.append(r)
        print(f"  {name}: {len(r['tests'])} tests, prev={r.get('prevalence_symbol')}")

    print("\n=== Bacillus ===")
    for name, vals in BACILLUS_DATA:
        r = build_symbolic(name, vals, BACILLUS_TESTS, "MCM 11th ch.26 Table 1")
        new_records.append(r)
        print(f"  {name}: {len(r['tests'])} tests, prev={r.get('prevalence_symbol')}")

    print("\n=== Acinetobacter ===")
    for name, vals in ACINETOBACTER_DATA:
        r = build_symbolic(name, vals, ACINETOBACTER_TESTS, "MCM 11th ch.43 Table 1")
        new_records.append(r)
        print(f"  {name}: {len(r['tests'])} tests, prev={r.get('prevalence_symbol')}")

    # Merge
    existing = json.loads(OUT.read_text(encoding="utf-8"))
    new_names = {r["species"] for r in new_records}
    existing = [s for s in existing if s["species"] not in new_names]
    merged = existing + new_records
    OUT.write_text(json.dumps(merged, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n✅ Master JSON updated: {len(merged)} species total (+{len(new_records)} new)")


if __name__ == "__main__":
    main()
