"""Generate js/mcm_data.js from mcm_master.json.

The output file declares MCM_DATA — a lookup table:
  MCM_DATA[<library_id>] = {
    prevalence_score: 4,    // 0-4 from MCM Table 1 (ch.38)
    tests: {                // % positivity per test_id
      indole: 98,
      motility: 95,
      ...
    }
  }

Test IDs follow MCM canonical names (lowercase snake_case).
The runtime algorithm maps these back to LIBRARY's biochem labels.
"""
import json
from pathlib import Path
from datetime import datetime

PARSED = Path("scripts/mcm_extract/parsed/mcm_master.json")
PRIORS = Path("scripts/mcm_extract/parsed/library_priors.json")
OUT = Path("js/mcm_data.js")

# MCM species → LIBRARY id (manual curated mapping)
SPECIES_TO_LIBRARY_ID = {
    # Numerical Table 1 (Ch.37)
    "Escherichia coli": "e_coli",
    "Escherichia coli (inactive biotypes)": None,  # variant
    "Escherichia albertii biogroup 1": None,
    "Escherichia albertii biogroup 2": None,
    "Escherichia blattae": None,
    "Escherichia fergusonii": None,
    "Escherichia hermannii": None,
    "Escherichia vulneris": None,
    "Shigella boydii": None,
    "Shigella dysenteriae": "shigella_dysenteriae",
    "Shigella flexneri": "shigella_flexneri",
    "Shigella sonnei": "shigella_sonnei",
    "Hafnia alvei": "hafnia_alvei",
    "Hafnia alvei biogroup 1": None,
    "Salmonella serotype Paratyphi A": "salmonella_paratyphi_a",
    "Salmonella serotype Choleraesuis": None,
    "Yersinia ruckeri": None,
    
    # Citrobacter (Table 3, ch.38)
    "Citrobacter amalonaticus": "citrobacter_amalonaticus",
    "Citrobacter braakii": None,
    "Citrobacter farmeri": None,
    "Citrobacter freundii": "citrobacter_freundii",
    "Citrobacter koseri": "citrobacter_koseri",
    "Citrobacter rodentium": None,
    "Citrobacter sedlakii": None,
    "Citrobacter werkmanii": None,
    "Citrobacter youngae": None,
    "Citrobacter gillenii": None,
    "Citrobacter murliniae": None,
    
    # Klebsiella/Raoultella (Table 5)
    "Raoultella ornithinolytica": None,
    "Klebsiella oxytoca": "klebsiella_oxytoca",
    "Klebsiella ozaenae": "klebsiella_ozaenae",
    "Klebsiella pneumoniae": "klebsiella_pneumoniae",
    "Raoultella planticola": None,
    "Raoultella terrigena": None,
    "Klebsiella rhinoscleromatis": None,
    
    # Proteus/Providencia/Morganella (Table 7)
    "Proteus hauseri": None,
    "Proteus mirabilis": "proteus_mirabilis",
    "Proteus penneri": "proteus_penneri",
    "Proteus vulgaris": "proteus_vulgaris",
    "Providencia alcalifaciens": "providencia_alcalifaciens",
    "Providencia heimbachae": None,
    "Providencia rettgeri": "providencia_rettgeri",
    "Providencia rustigianii": None,
    "Providencia stuartii": "providencia_stuartii",
    "Morganella morganii subsp. morganii": "morganella_morganii",
    "Morganella morganii subsp. sibonii": None,
    
    # Pseudomonas (Ch.42 Table 1)
    "Pseudomonas aeruginosa": "pseudomonas_aeruginosa",
    "Pseudomonas fluorescens": "pseudomonas_fluorescens",
    "Pseudomonas putida": "pseudomonas_putida",
    "Pseudomonas stutzeri": "pseudomonas_stutzeri",
    "Pseudomonas veronii": None,
    "Pseudomonas monteilii": None,
    "Pseudomonas mosselii": None,
    "Pseudomonas mendocina": None,
    "Pseudomonas pseudoalcaligenes": None,
    "Pseudomonas alcaligenes": None,
    "Pseudomonas luteola": None,
    "Pseudomonas oryzihabitans": None,
    
    # Vibrionaceae (Ch.41 Table 2)
    "Plesiomonas shigelloides": "plesiomonas_shigelloides",
    "Vibrio cholerae": "vibrio_cholerae",
    "Vibrio mimicus": "vibrio_mimicus",
    "Vibrio fluvialis": "vibrio_fluvialis",
    "Vibrio alginolyticus": "vibrio_alginolyticus",
    "Vibrio parahaemolyticus": "vibrio_parahaemolyticus",
    "Vibrio vulnificus": "vibrio_vulnificus",
    "Vibrio metschnikovii": None,
    "Vibrio cincinnatiensis": None,
    "Grimontia hollisae": None,
    "Photobacterium damselae": None,
    "Vibrio furnissii": "vibrio_furnissii",
    "Vibrio harveyi": None,
    
    # Staphylococcus (Ch.21 Table 2)
    "Staphylococcus aureus": "s_aureus",
    "Staphylococcus epidermidis": "s_epidermidis",
    "Staphylococcus saprophyticus": "s_saprophyticus",
    "Staphylococcus haemolyticus": "s_haemolyticus",
    "Staphylococcus lugdunensis": "s_lugdunensis",
    
    # Streptococcus (Ch.22 Table 1) + Enterococcus (Ch.23)
    "Streptococcus pyogenes": "s_pyogenes",
    "Streptococcus agalactiae": "s_agalactiae",
    "Streptococcus pneumoniae": "s_pneumoniae",
    "Enterococcus faecalis": "enterococcus_faecalis",
    "Enterococcus faecium": "enterococcus_faecium",
    
    # Neisseria (Ch.34 Table 2)
    "Neisseria gonorrhoeae": "n_gonorrhoeae",
    "Neisseria meningitidis": "n_meningitidis",
    "Neisseria lactamica": "neisseria_lactamica",
    "Neisseria mucosa": "neisseria_mucosa",
    "Neisseria sicca": "neisseria_sicca",
    "Neisseria cinerea": "neisseria_cinerea",
    "Neisseria flavescens": "neisseria_flavescens",
    "Neisseria polysaccharea": "neisseria_polysaccharea",
    "Neisseria subflava": "neisseria_subflava",
    "Neisseria elongata": "neisseria_elongata",
    "Neisseria weaveri": "neisseria_weaveri",
    "Neisseria animaloris": "neisseria_animaloris",
    "Neisseria bacilliformis": "neisseria_bacilliformis",
    "Neisseria zoodegmatis": "neisseria_zooedgmatis",  # note typo in LIBRARY id
    
    # Burkholderia (Ch.43 Table 2)
    "Burkholderia pseudomallei": "b_pseudomallei",
    "Burkholderia thailandensis": "burkholderia_thailandensis",
    "Burkholderia mallei": None,  # not in LIBRARY

    # Yersinia (Ch.39 Table 1)
    "Yersinia enterocolitica": "yersinia_enterocolitica",
    "Yersinia pestis": "yersinia_pestis",
    "Yersinia pseudotuberculosis": "yersinia_pseudotuberculosis",
    "Yersinia frederiksenii": "yersinia_frederiksenii",
    "Yersinia kristensenii": "yersinia_kristensenii",
    "Yersinia intermedia": "yersinia_intermedia",
    "Yersinia mollaretii": "yersinia_mollaretii",
    "Yersinia bercovieri": "yersinia_bercovieri",
    "Yersinia rohdei": "yersinia_rohdei",
    "Yersinia aldovae": "yersinia_aldovae",
    "Yersinia ruckeri": "yersinia_ruckeri",
    "Yersinia aleksiciae": None,  # not in LIBRARY

    # Aeromonas (Ch.40 Table 3)
    "Aeromonas hydrophila": "aeromonas_hydrophila",
    "Aeromonas caviae": "aeromonas_caviae",
    "Aeromonas veronii": "aeromonas_veronii",
    "Aeromonas jandaei": "aeromonas_jandaei",
    "Aeromonas bestiarum": None,
    "Aeromonas salmonicida": None,
    "Aeromonas media": None,
    "Aeromonas eucrenophila": None,
    "Aeromonas schubertii": None,
    "Aeromonas trota": None,

    # Serratia (Ch.38 Table 4)
    "Serratia marcescens": "serratia_marcescens",
    "Serratia liquefaciens": "serratia_liquefaciens",
    "Serratia odorifera": "serratia_odorifera",
    "Serratia rubidaea": "serratia_rubidaea",
    "Serratia ficaria": None,

    # Enterobacter extra (Ch.38 Table 5)
    "Enterobacter cloacae": "enterobacter_cloacae",
    "Enterobacter aerogenes": "enterobacter_aerogenes",
    "Enterobacter agglomerans": "enterobacter_agglomerans",
    "Enterobacter asburiae": "enterobacter_asburiae",
    "Enterobacter gergoviae": "enterobacter_gergoviae",

    # Listeria (Ch.27)
    "Listeria monocytogenes": "listeria_monocytogenes",
    "Listeria innocua": "listeria_innocua",
    "Listeria ivanovii": "listeria_ivanovii",
    "Listeria seeligeri": None,
    "Listeria welshimeri": None,

    # Bacillus (Ch.26)
    "Bacillus anthracis": "bacillus_anthracis",
    "Bacillus cereus": "b_cereus",
    "Bacillus subtilis": "bacillus_subtilis",
    "Bacillus thuringiensis": "bacillus_thuringiensis",
    "Bacillus mycoides": None,

    # Acinetobacter (Ch.43 Table 1)
    "Acinetobacter baumannii": "acinetobacter_baumannii",
    "Acinetobacter haemolyticus": "acinetobacter_haemolyticus",
    "Acinetobacter lwoffii": "acinetobacter_lwoffii",
    "Acinetobacter johnsonii": "acinetobacter_johnsonii",
    "Acinetobacter junii": "acinetobacter_junii",
}


def main():
    data = json.loads(PARSED.read_text(encoding="utf-8"))
    
    # Build MCM_DATA dict
    mcm_data = {}
    matched = 0
    unmatched = []
    for entry in data:
        lib_id = SPECIES_TO_LIBRARY_ID.get(entry["species"])
        if lib_id is None:
            if entry["species"] not in SPECIES_TO_LIBRARY_ID:
                unmatched.append(entry["species"])
            continue
        record = {
            "species": entry["species"],
            "source": entry["source"],
            "tests": entry["tests"],
        }
        if "prevalence_score" in entry:
            record["prevalence_score"] = entry["prevalence_score"]
            record["prevalence_symbol"] = entry["prevalence_symbol"]
        mcm_data[lib_id] = record
        matched += 1
    
    print(f"Matched {matched} species to LIBRARY ids")
    if unmatched:
        print(f"Unmatched MCM species (need to add to mapping):")
        for u in unmatched[:10]:
            print(f"  - {u}")
    
    # Merge importance-derived priors for ALL LIBRARY species (so Bayes always
    # has a prior to work with, even when MCM doesn't tabulate the species).
    # Strategy: only add prevalence_score (no tests) for species without MCM data.
    if PRIORS.exists():
        priors = json.loads(PRIORS.read_text(encoding="utf-8"))
        added = 0
        for lib_id, info in priors.items():
            if lib_id in mcm_data:
                # Already has MCM data; only fill in prevalence if missing
                if "prevalence_score" not in mcm_data[lib_id]:
                    mcm_data[lib_id]["prevalence_score"] = info["prevalence_score"]
                    mcm_data[lib_id]["prevalence_symbol"] = info["prevalence_symbol"]
                    mcm_data[lib_id]["prevalence_source"] = "LIBRARY importance"
                continue
            # No MCM tests but we do have prevalence
            mcm_data[lib_id] = {
                "species": info["name"],
                "source": "LIBRARY importance proxy",
                "prevalence_score": info["prevalence_score"],
                "prevalence_symbol": info["prevalence_symbol"],
                "prevalence_source": "LIBRARY importance",
                "tests": {},  # no test data; Bayes will fall back to LIBRARY +/-/V
            }
            added += 1
        print(f"Added {added} prevalence-only entries from LIBRARY importance")
    
    # Generate JS file
    js_lines = [
        f"// js/mcm_data.js — Auto-generated from MCM 11th edition extraction",
        f"// Generated: {datetime.now().isoformat()}",
        f"// Source: Manual of Clinical Microbiology, 11th Edition (2015)",
        f"// DO NOT EDIT MANUALLY — re-run scripts/generate_mcm_js.py instead",
        f"",
        f"// % positivity scale:",
        f"//   numerical: actual % from MCM ch.37 Table 1 (E.coli/Shigella/Salmonella)",
        f"//   symbolic:  + (≥90%) → 95; V (11-89%) → 50; − (≤10%) → 5",
        f"",
        f"// Prevalence scale (clinical isolation frequency from MCM ch.38 Table 1):",
        f"//   4 = ++++ frequent  (most common)",
        f"//   3 = +++ occasional",
        f"//   2 = ++ rare",
        f"//   1 = + very rare",
        f"//   0 = − not isolated from humans",
        f"",
        f"const MCM_DATA = " + json.dumps(mcm_data, ensure_ascii=False, indent=2) + ";",
        f"",
        f"// Export for ES module / non-module use",
        f"if (typeof window !== 'undefined') window.MCM_DATA = MCM_DATA;",
    ]
    
    OUT.write_text("\n".join(js_lines), encoding="utf-8")
    print(f"\n✅ Generated {OUT}")
    print(f"   {len(mcm_data)} species, file size: {OUT.stat().st_size / 1024:.1f} KB")
    
    # Show E. coli sample
    if "e_coli" in mcm_data:
        ec = mcm_data["e_coli"]
        print(f"\n📋 Sample MCM_DATA['e_coli']:")
        print(f"   prevalence: {ec.get('prevalence_score')} ({ec.get('prevalence_symbol')})")
        print(f"   tests count: {len(ec['tests'])}")
        for k in ["indole_production", "motility", "lactose", "sucrose"]:
            if k in ec["tests"]:
                print(f"   {k}: {ec['tests'][k]}%")

if __name__ == "__main__":
    main()
