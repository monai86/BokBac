// src/data/mcmData.ts — Auto-generated from MCM 11th edition extraction
// Generated: 2026-06-10T16:52:49.583637
// Source: Manual of Clinical Microbiology, 11th Edition (2015)
// DO NOT EDIT MANUALLY — re-run scripts/generate_mcm_js.py instead

// % positivity scale:
//   numerical: actual % from MCM ch.37 Table 1 (E.coli/Shigella/Salmonella)
//   symbolic:  + (≥90%) → 95; V (11-89%) → 50; − (≤10%) → 5

// Prevalence scale (clinical isolation frequency from MCM ch.38 Table 1):
//   4 = ++++ frequent  (most common)
//   3 = +++ occasional
//   2 = ++ rare
//   1 = + very rare
//   0 = − not isolated from humans

export const MCM_DATA = {
  "e_coli": {
    "species": "Escherichia coli",
    "source": "MCM 11th ch.37 Table 1",
    "tests": {
      "indole_production": 98,
      "voges_proskauer": 0,
      "motility": 95,
      "yellow_pigment": 0,
      "lysine_decarboxylase": 90,
      "ornithine_decarboxylase": 65,
      "kcn_growth": 0,
      "acetate_utilization": 90,
      "mucate_utilization": 95,
      "glucose_gas": 95,
      "adonitol": 5,
      "arabinose": 99,
      "arabitol_d": 5,
      "cellobiose": 2,
      "dulcitol": 60,
      "lactose": 95,
      "sucrose": 50,
      "mannitol_d": 98,
      "raffinose": 50,
      "rhamnose_l": 80,
      "sorbitol_d": 94,
      "xylose_d": 95
    },
    "prevalence_score": 4,
    "prevalence_symbol": "++++"
  },
  "shigella_dysenteriae": {
    "species": "Shigella dysenteriae",
    "source": "MCM 11th ch.37 Table 1",
    "tests": {
      "indole_production": 40,
      "voges_proskauer": 0,
      "motility": 0,
      "yellow_pigment": 0,
      "lysine_decarboxylase": 0,
      "ornithine_decarboxylase": 0,
      "kcn_growth": 0,
      "acetate_utilization": 0,
      "mucate_utilization": 0,
      "glucose_gas": 0,
      "adonitol": 0,
      "arabinose": 45,
      "arabitol_d": 0,
      "cellobiose": 0,
      "dulcitol": 4,
      "lactose": 0,
      "sucrose": 0,
      "mannitol_d": 0,
      "raffinose": 0,
      "rhamnose_l": 30,
      "sorbitol_d": 29,
      "xylose_d": 3
    },
    "prevalence_score": 2,
    "prevalence_symbol": "++"
  },
  "shigella_flexneri": {
    "species": "Shigella flexneri",
    "source": "MCM 11th ch.37 Table 1",
    "tests": {
      "indole_production": 42,
      "voges_proskauer": 0,
      "motility": 0,
      "yellow_pigment": 0,
      "lysine_decarboxylase": 0,
      "ornithine_decarboxylase": 0,
      "kcn_growth": 0,
      "acetate_utilization": 8,
      "mucate_utilization": 0,
      "glucose_gas": 3,
      "adonitol": 0,
      "arabinose": 60,
      "arabitol_d": 1,
      "cellobiose": 0,
      "dulcitol": 2,
      "lactose": 0,
      "sucrose": 1,
      "mannitol_d": 91,
      "raffinose": 33,
      "rhamnose_l": 5,
      "sorbitol_d": 30,
      "xylose_d": 3
    },
    "prevalence_score": 3,
    "prevalence_symbol": "+++"
  },
  "shigella_sonnei": {
    "species": "Shigella sonnei",
    "source": "MCM 11th ch.37 Table 1",
    "tests": {
      "indole_production": 0,
      "voges_proskauer": 0,
      "motility": 0,
      "yellow_pigment": 0,
      "lysine_decarboxylase": 0,
      "ornithine_decarboxylase": 98,
      "kcn_growth": 0,
      "acetate_utilization": 0,
      "mucate_utilization": 10,
      "glucose_gas": 0,
      "adonitol": 0,
      "arabinose": 95,
      "arabitol_d": 0,
      "cellobiose": 5,
      "dulcitol": 0,
      "lactose": 2,
      "sucrose": 1,
      "mannitol_d": 99,
      "raffinose": 3,
      "rhamnose_l": 77,
      "sorbitol_d": 1,
      "xylose_d": 1
    },
    "prevalence_score": 3,
    "prevalence_symbol": "+++"
  },
  "hafnia_alvei": {
    "species": "Hafnia alvei",
    "source": "MCM 11th ch.37 Table 1",
    "tests": {
      "indole_production": 0,
      "voges_proskauer": 85,
      "motility": 85,
      "yellow_pigment": 0,
      "lysine_decarboxylase": 100,
      "ornithine_decarboxylase": 98,
      "kcn_growth": 95,
      "acetate_utilization": 15,
      "mucate_utilization": 0,
      "glucose_gas": 98,
      "adonitol": 0,
      "arabinose": 95,
      "arabitol_d": 0,
      "cellobiose": 15,
      "dulcitol": 0,
      "lactose": 5,
      "sucrose": 10,
      "mannitol_d": 99,
      "raffinose": 2,
      "rhamnose_l": 97,
      "sorbitol_d": 0,
      "xylose_d": 98
    },
    "prevalence_score": 2,
    "prevalence_symbol": "++"
  },
  "salmonella_paratyphi_a": {
    "species": "Salmonella serotype Paratyphi A",
    "source": "MCM 11th ch.37 Table 1",
    "tests": {
      "indole_production": 0,
      "voges_proskauer": 0,
      "motility": 95,
      "yellow_pigment": 0,
      "lysine_decarboxylase": 0,
      "ornithine_decarboxylase": 95,
      "kcn_growth": 0,
      "acetate_utilization": 0,
      "mucate_utilization": 0,
      "glucose_gas": 99,
      "adonitol": 0,
      "arabinose": 100,
      "arabitol_d": 0,
      "cellobiose": 5,
      "dulcitol": 90,
      "lactose": 0,
      "sucrose": 0,
      "mannitol_d": 100,
      "raffinose": 0,
      "rhamnose_l": 100,
      "sorbitol_d": 95,
      "xylose_d": 0
    },
    "prevalence_score": 3,
    "prevalence_symbol": "+++",
    "prevalence_source": "LIBRARY importance"
  },
  "citrobacter_amalonaticus": {
    "species": "Citrobacter amalonaticus",
    "source": "MCM 11th ch.38 Citrobacter (Table 3)",
    "tests": {
      "indole": 95,
      "ornithine_decarboxylase": 95,
      "malonate": 5,
      "sucrose": 5,
      "dulcitol": 5,
      "melibiose": 5,
      "adonitol": 5
    },
    "prevalence_score": 2,
    "prevalence_symbol": "++"
  },
  "citrobacter_freundii": {
    "species": "Citrobacter freundii",
    "source": "MCM 11th ch.38 Citrobacter (Table 3)",
    "tests": {
      "indole": 50,
      "ornithine_decarboxylase": 5,
      "malonate": 5,
      "sucrose": 50,
      "dulcitol": 5,
      "melibiose": 95,
      "adonitol": 5
    },
    "prevalence_score": 4,
    "prevalence_symbol": "++++"
  },
  "citrobacter_koseri": {
    "species": "Citrobacter koseri",
    "source": "MCM 11th ch.38 Citrobacter (Table 3)",
    "tests": {
      "indole": 95,
      "ornithine_decarboxylase": 95,
      "malonate": 95,
      "sucrose": 50,
      "dulcitol": 50,
      "melibiose": 5,
      "adonitol": 95
    },
    "prevalence_score": 2,
    "prevalence_symbol": "++"
  },
  "klebsiella_oxytoca": {
    "species": "Klebsiella oxytoca",
    "source": "MCM 11th ch.38 Klebsiella/Raoultella (Table 5)",
    "tests": {
      "indole": 95,
      "ornithine_decarboxylase": 5,
      "voges_proskauer": 95,
      "malonate": 95,
      "onpg": 95,
      "growth_10c": 5,
      "growth_44c": 95,
      "melezitose_d": 5
    },
    "prevalence_score": 3,
    "prevalence_symbol": "+++"
  },
  "klebsiella_ozaenae": {
    "species": "Klebsiella ozaenae",
    "source": "MCM 11th ch.38 Klebsiella/Raoultella (Table 5)",
    "tests": {
      "indole": 5,
      "ornithine_decarboxylase": 5,
      "voges_proskauer": 5,
      "malonate": 5,
      "onpg": 50
    },
    "prevalence_score": 2,
    "prevalence_symbol": "++"
  },
  "klebsiella_pneumoniae": {
    "species": "Klebsiella pneumoniae",
    "source": "MCM 11th ch.38 Klebsiella/Raoultella (Table 5)",
    "tests": {
      "indole": 5,
      "ornithine_decarboxylase": 5,
      "voges_proskauer": 95,
      "malonate": 95,
      "onpg": 95,
      "growth_10c": 5,
      "growth_44c": 95,
      "melezitose_d": 5
    },
    "prevalence_score": 4,
    "prevalence_symbol": "++++"
  },
  "proteus_mirabilis": {
    "species": "Proteus mirabilis",
    "source": "MCM 11th ch.38 Proteus/Providencia/Morganella (Table 7)",
    "tests": {
      "indole": 5,
      "h2s": 95,
      "urea": 95,
      "ornithine_decarboxylase": 95,
      "maltose": 5,
      "adonitol_d": 5,
      "arabitol_d": 5,
      "trehalose": 95,
      "inositol_myo": 5
    },
    "prevalence_score": 4,
    "prevalence_symbol": "++++"
  },
  "proteus_penneri": {
    "species": "Proteus penneri",
    "source": "MCM 11th ch.38 Proteus/Providencia/Morganella (Table 7)",
    "tests": {
      "indole": 5,
      "h2s": 50,
      "urea": 95,
      "ornithine_decarboxylase": 5,
      "maltose": 95,
      "adonitol_d": 5,
      "arabitol_d": 5,
      "trehalose": 50,
      "inositol_myo": 5
    },
    "prevalence_score": 2,
    "prevalence_symbol": "++"
  },
  "proteus_vulgaris": {
    "species": "Proteus vulgaris",
    "source": "MCM 11th ch.38 Proteus/Providencia/Morganella (Table 7)",
    "tests": {
      "indole": 95,
      "h2s": 50,
      "urea": 95,
      "ornithine_decarboxylase": 5,
      "maltose": 95,
      "adonitol_d": 5,
      "arabitol_d": 5,
      "trehalose": 5,
      "inositol_myo": 5
    },
    "prevalence_score": 3,
    "prevalence_symbol": "+++"
  },
  "providencia_alcalifaciens": {
    "species": "Providencia alcalifaciens",
    "source": "MCM 11th ch.38 Proteus/Providencia/Morganella (Table 7)",
    "tests": {
      "indole": 95,
      "h2s": 5,
      "urea": 5,
      "ornithine_decarboxylase": 5,
      "maltose": 5,
      "adonitol_d": 95,
      "arabitol_d": 5,
      "trehalose": 5,
      "inositol_myo": 5
    },
    "prevalence_score": 3,
    "prevalence_symbol": "+++"
  },
  "providencia_rettgeri": {
    "species": "Providencia rettgeri",
    "source": "MCM 11th ch.38 Proteus/Providencia/Morganella (Table 7)",
    "tests": {
      "indole": 95,
      "h2s": 5,
      "urea": 95,
      "ornithine_decarboxylase": 5,
      "maltose": 5,
      "adonitol_d": 95,
      "arabitol_d": 95,
      "trehalose": 5,
      "inositol_myo": 95
    },
    "prevalence_score": 3,
    "prevalence_symbol": "+++"
  },
  "providencia_stuartii": {
    "species": "Providencia stuartii",
    "source": "MCM 11th ch.38 Proteus/Providencia/Morganella (Table 7)",
    "tests": {
      "indole": 95,
      "h2s": 5,
      "urea": 50,
      "ornithine_decarboxylase": 5,
      "maltose": 5,
      "adonitol_d": 5,
      "arabitol_d": 5,
      "trehalose": 95,
      "inositol_myo": 95
    },
    "prevalence_score": 3,
    "prevalence_symbol": "+++"
  },
  "morganella_morganii": {
    "species": "Morganella morganii subsp. morganii",
    "source": "MCM 11th ch.38 Proteus/Providencia/Morganella (Table 7)",
    "tests": {
      "indole": 95,
      "h2s": 5,
      "urea": 95,
      "ornithine_decarboxylase": 95,
      "maltose": 5,
      "adonitol_d": 5,
      "arabitol_d": 5,
      "trehalose": 5,
      "inositol_myo": 5
    },
    "prevalence_score": 2,
    "prevalence_symbol": "++"
  },
  "pseudomonas_aeruginosa": {
    "species": "Pseudomonas aeruginosa",
    "source": "MCM 11th ch.42 Table 1",
    "tests": {
      "oxidase": 99,
      "macconkey_growth": 100,
      "cetrimide_growth": 94,
      "salt_6pct": 65,
      "growth_42c": 100,
      "nitrate_reduction": 98,
      "nitrate_gas": 93,
      "pyoverdin": 65,
      "pyocyanin": 97,
      "arginine_dihydrolase": 100,
      "lysine_decarboxylase": 0,
      "ornithine_decarboxylase": 0,
      "urea": 48,
      "gelatin_hydrolysis": 82,
      "acetamide": 100,
      "esculin": 0,
      "starch_hydrolysis": 0,
      "glucose_acid": 97,
      "xylose_d": 90,
      "lactose": 0,
      "sucrose": 0,
      "maltose": 0,
      "mannitol_d": 70,
      "citrate_simmons": 95
    },
    "prevalence_score": 4,
    "prevalence_symbol": "++++",
    "prevalence_source": "LIBRARY importance"
  },
  "pseudomonas_fluorescens": {
    "species": "Pseudomonas fluorescens",
    "source": "MCM 11th ch.42 Table 1",
    "tests": {
      "oxidase": 97,
      "macconkey_growth": 100,
      "cetrimide_growth": 89,
      "salt_6pct": 43,
      "growth_42c": 0,
      "nitrate_reduction": 19,
      "nitrate_gas": 3,
      "pyoverdin": 96,
      "pyocyanin": 0,
      "arginine_dihydrolase": 97,
      "lysine_decarboxylase": 0,
      "ornithine_decarboxylase": 0,
      "urea": 21,
      "gelatin_hydrolysis": 100,
      "acetamide": 6,
      "esculin": 0,
      "starch_hydrolysis": 0,
      "glucose_acid": 100,
      "xylose_d": 100,
      "lactose": 24,
      "sucrose": 48,
      "maltose": 2,
      "mannitol_d": 53,
      "citrate_simmons": 93
    },
    "prevalence_score": 2,
    "prevalence_symbol": "++",
    "prevalence_source": "LIBRARY importance"
  },
  "pseudomonas_putida": {
    "species": "Pseudomonas putida",
    "source": "MCM 11th ch.42 Table 1",
    "tests": {
      "oxidase": 100,
      "macconkey_growth": 100,
      "cetrimide_growth": 81,
      "salt_6pct": 100,
      "growth_42c": 0,
      "nitrate_reduction": 0,
      "nitrate_gas": 0,
      "pyoverdin": 93,
      "pyocyanin": 0,
      "arginine_dihydrolase": 100,
      "lysine_decarboxylase": 0,
      "ornithine_decarboxylase": 0,
      "urea": 31,
      "gelatin_hydrolysis": 0,
      "acetamide": 0,
      "esculin": 0,
      "starch_hydrolysis": 0,
      "glucose_acid": 100,
      "xylose_d": 100,
      "lactose": 25,
      "sucrose": 0,
      "maltose": 31,
      "mannitol_d": 25,
      "citrate_simmons": 94
    },
    "prevalence_score": 1,
    "prevalence_symbol": "+",
    "prevalence_source": "LIBRARY importance"
  },
  "pseudomonas_stutzeri": {
    "species": "Pseudomonas stutzeri",
    "source": "MCM 11th ch.42 Table 1",
    "tests": {
      "oxidase": 100,
      "macconkey_growth": 100,
      "cetrimide_growth": 4,
      "salt_6pct": 80,
      "growth_42c": 69,
      "nitrate_reduction": 100,
      "nitrate_gas": 100,
      "pyoverdin": 0,
      "pyocyanin": 0,
      "arginine_dihydrolase": 0,
      "lysine_decarboxylase": 0,
      "ornithine_decarboxylase": 0,
      "urea": 33,
      "gelatin_hydrolysis": 0,
      "acetamide": 0,
      "esculin": 0,
      "starch_hydrolysis": 100,
      "glucose_acid": 96,
      "xylose_d": 93,
      "lactose": 0,
      "sucrose": 0,
      "maltose": 100,
      "mannitol_d": 89,
      "citrate_simmons": 82
    },
    "prevalence_score": 2,
    "prevalence_symbol": "++",
    "prevalence_source": "LIBRARY importance"
  },
  "plesiomonas_shigelloides": {
    "species": "Plesiomonas shigelloides",
    "source": "MCM 11th ch.41 Table 2",
    "tests": {
      "indole": 100,
      "voges_proskauer": 0,
      "arginine_dihydrolase": 98,
      "lysine_decarboxylase": 99,
      "ornithine_decarboxylase": 95,
      "motility": 95,
      "gelatin_hydrolysis": 0,
      "glucose_gas": 0,
      "arabinose": 0,
      "cellobiose": 0,
      "lactose": 80,
      "inositol_myo": 95,
      "salicin": 0,
      "sucrose": 0,
      "onpg": 90,
      "salt_0pct": 100,
      "o129_susceptibility": 100
    },
    "prevalence_score": 2,
    "prevalence_symbol": "++",
    "prevalence_source": "LIBRARY importance"
  },
  "vibrio_cholerae": {
    "species": "Vibrio cholerae",
    "source": "MCM 11th ch.41 Table 2",
    "tests": {
      "indole": 99,
      "voges_proskauer": 75,
      "arginine_dihydrolase": 0,
      "lysine_decarboxylase": 99,
      "ornithine_decarboxylase": 99,
      "motility": 99,
      "gelatin_hydrolysis": 90,
      "glucose_gas": 0,
      "arabinose": 0,
      "cellobiose": 8,
      "lactose": 7,
      "inositol_myo": 0,
      "salicin": 1,
      "sucrose": 100,
      "onpg": 94,
      "salt_0pct": 100,
      "salt_6pct": 53,
      "o129_susceptibility": 99
    },
    "prevalence_score": 4,
    "prevalence_symbol": "++++",
    "prevalence_source": "LIBRARY importance"
  },
  "vibrio_mimicus": {
    "species": "Vibrio mimicus",
    "source": "MCM 11th ch.41 Table 2",
    "tests": {
      "indole": 98,
      "voges_proskauer": 9,
      "arginine_dihydrolase": 0,
      "lysine_decarboxylase": 100,
      "ornithine_decarboxylase": 99,
      "motility": 98,
      "gelatin_hydrolysis": 65,
      "glucose_gas": 0,
      "arabinose": 1,
      "cellobiose": 0,
      "lactose": 21,
      "inositol_myo": 0,
      "salicin": 0,
      "sucrose": 0,
      "onpg": 90,
      "salt_0pct": 100,
      "salt_6pct": 49,
      "o129_susceptibility": 95
    },
    "prevalence_score": 1,
    "prevalence_symbol": "+",
    "prevalence_source": "LIBRARY importance"
  },
  "vibrio_fluvialis": {
    "species": "Vibrio fluvialis",
    "source": "MCM 11th ch.41 Table 2",
    "tests": {
      "indole": 13,
      "voges_proskauer": 0,
      "arginine_dihydrolase": 93,
      "lysine_decarboxylase": 0,
      "ornithine_decarboxylase": 0,
      "motility": 70,
      "gelatin_hydrolysis": 85,
      "glucose_gas": 0,
      "arabinose": 93,
      "cellobiose": 30,
      "lactose": 3,
      "inositol_myo": 0,
      "salicin": 0,
      "sucrose": 100,
      "onpg": 40,
      "salt_0pct": 0,
      "salt_6pct": 96,
      "o129_susceptibility": 31
    },
    "prevalence_score": 1,
    "prevalence_symbol": "+",
    "prevalence_source": "LIBRARY importance"
  },
  "vibrio_furnissii": {
    "species": "Vibrio furnissii",
    "source": "MCM 11th ch.41 Table 2",
    "tests": {
      "indole": 11,
      "voges_proskauer": 0,
      "arginine_dihydrolase": 100,
      "lysine_decarboxylase": 0,
      "ornithine_decarboxylase": 0,
      "motility": 89,
      "gelatin_hydrolysis": 86,
      "glucose_gas": 100,
      "arabinose": 100,
      "cellobiose": 11,
      "lactose": 0,
      "inositol_myo": 0,
      "salicin": 0,
      "sucrose": 100,
      "onpg": 35,
      "salt_0pct": 0,
      "salt_6pct": 100,
      "o129_susceptibility": 0
    },
    "prevalence_score": 1,
    "prevalence_symbol": "+",
    "prevalence_source": "LIBRARY importance"
  },
  "vibrio_alginolyticus": {
    "species": "Vibrio alginolyticus",
    "source": "MCM 11th ch.41 Table 2",
    "tests": {
      "indole": 85,
      "voges_proskauer": 95,
      "arginine_dihydrolase": 0,
      "lysine_decarboxylase": 99,
      "ornithine_decarboxylase": 50,
      "motility": 99,
      "gelatin_hydrolysis": 90,
      "glucose_gas": 0,
      "arabinose": 1,
      "cellobiose": 3,
      "lactose": 0,
      "inositol_myo": 0,
      "salicin": 4,
      "sucrose": 99,
      "onpg": 0,
      "salt_0pct": 0,
      "salt_6pct": 100,
      "o129_susceptibility": 19
    },
    "prevalence_score": 1,
    "prevalence_symbol": "+",
    "prevalence_source": "LIBRARY importance"
  },
  "vibrio_parahaemolyticus": {
    "species": "Vibrio parahaemolyticus",
    "source": "MCM 11th ch.41 Table 2",
    "tests": {
      "indole": 98,
      "voges_proskauer": 0,
      "arginine_dihydrolase": 0,
      "lysine_decarboxylase": 100,
      "ornithine_decarboxylase": 95,
      "motility": 99,
      "gelatin_hydrolysis": 95,
      "glucose_gas": 0,
      "arabinose": 80,
      "cellobiose": 5,
      "lactose": 1,
      "inositol_myo": 0,
      "salicin": 1,
      "sucrose": 1,
      "onpg": 5,
      "salt_0pct": 0,
      "salt_6pct": 99,
      "o129_susceptibility": 20
    },
    "prevalence_score": 3,
    "prevalence_symbol": "+++",
    "prevalence_source": "LIBRARY importance"
  },
  "vibrio_vulnificus": {
    "species": "Vibrio vulnificus",
    "source": "MCM 11th ch.41 Table 2",
    "tests": {
      "indole": 97,
      "voges_proskauer": 0,
      "arginine_dihydrolase": 0,
      "lysine_decarboxylase": 99,
      "ornithine_decarboxylase": 55,
      "motility": 99,
      "gelatin_hydrolysis": 75,
      "glucose_gas": 0,
      "arabinose": 0,
      "cellobiose": 99,
      "lactose": 85,
      "inositol_myo": 0,
      "salicin": 95,
      "sucrose": 15,
      "onpg": 75,
      "salt_0pct": 0,
      "salt_6pct": 65,
      "o129_susceptibility": 98
    },
    "prevalence_score": 4,
    "prevalence_symbol": "++++",
    "prevalence_source": "LIBRARY importance"
  },
  "s_aureus": {
    "species": "Staphylococcus aureus",
    "source": "MCM 11th ch.21 Table 2",
    "tests": {
      "coagulase": 95,
      "clumping_factor": 95,
      "dnase": 95,
      "hemolysis": 95,
      "catalase": 95,
      "oxidase": 5,
      "urea": 50,
      "nitrate_reduction": 95,
      "novobiocin": 5,
      "trehalose": 95,
      "mannitol_d": 95,
      "mannose_d": 95,
      "lactose": 95,
      "sucrose": 95
    },
    "prevalence_score": 4,
    "prevalence_symbol": "++++"
  },
  "s_epidermidis": {
    "species": "Staphylococcus epidermidis",
    "source": "MCM 11th ch.21 Table 2",
    "tests": {
      "coagulase": 5,
      "clumping_factor": 5,
      "dnase": 5,
      "hemolysis": 50,
      "catalase": 95,
      "oxidase": 5,
      "urea": 95,
      "nitrate_reduction": 95,
      "novobiocin": 5,
      "trehalose": 5,
      "mannitol_d": 5,
      "mannose_d": 5,
      "lactose": 50,
      "sucrose": 95
    },
    "prevalence_score": 3,
    "prevalence_symbol": "+++"
  },
  "s_haemolyticus": {
    "species": "Staphylococcus haemolyticus",
    "source": "MCM 11th ch.21 Table 2",
    "tests": {
      "coagulase": 5,
      "clumping_factor": 5,
      "dnase": 5,
      "hemolysis": 80,
      "catalase": 95,
      "oxidase": 5,
      "urea": 5,
      "nitrate_reduction": 95,
      "novobiocin": 5,
      "trehalose": 95,
      "mannitol_d": 50,
      "mannose_d": 5,
      "lactose": 95,
      "sucrose": 95
    },
    "prevalence_score": 2,
    "prevalence_symbol": "++"
  },
  "s_lugdunensis": {
    "species": "Staphylococcus lugdunensis",
    "source": "MCM 11th ch.21 Table 2",
    "tests": {
      "coagulase": 5,
      "clumping_factor": 80,
      "dnase": 5,
      "hemolysis": 80,
      "catalase": 95,
      "oxidase": 5,
      "urea": 50,
      "nitrate_reduction": 95,
      "novobiocin": 5,
      "trehalose": 50,
      "mannitol_d": 95,
      "mannose_d": 95,
      "lactose": 95,
      "sucrose": 95
    },
    "prevalence_score": 2,
    "prevalence_symbol": "++"
  },
  "s_saprophyticus": {
    "species": "Staphylococcus saprophyticus",
    "source": "MCM 11th ch.21 Table 2",
    "tests": {
      "coagulase": 5,
      "clumping_factor": 5,
      "dnase": 5,
      "hemolysis": 5,
      "catalase": 95,
      "oxidase": 5,
      "urea": 95,
      "nitrate_reduction": 5,
      "novobiocin": 95,
      "trehalose": 95,
      "mannitol_d": 50,
      "mannose_d": 5,
      "lactose": 50,
      "sucrose": 95
    },
    "prevalence_score": 3,
    "prevalence_symbol": "+++"
  },
  "s_pyogenes": {
    "species": "Streptococcus pyogenes",
    "source": "MCM 11th ch.22/23",
    "tests": {
      "bacitracin": 95,
      "pyr": 95,
      "camp": 5,
      "voges_proskauer": 5,
      "hippurate": 5,
      "trehalose": 95,
      "sorbitol_d": 5
    },
    "prevalence_score": 4,
    "prevalence_symbol": "++++"
  },
  "s_agalactiae": {
    "species": "Streptococcus agalactiae",
    "source": "MCM 11th ch.22/23",
    "tests": {
      "bacitracin": 5,
      "pyr": 5,
      "camp": 95,
      "voges_proskauer": 5,
      "hippurate": 95,
      "trehalose": 50,
      "sorbitol_d": 5
    },
    "prevalence_score": 3,
    "prevalence_symbol": "+++"
  },
  "s_pneumoniae": {
    "species": "Streptococcus pneumoniae",
    "source": "MCM 11th ch.22/23",
    "tests": {
      "bacitracin": 5,
      "pyr": 5,
      "camp": 5,
      "voges_proskauer": 5,
      "hippurate": 5,
      "trehalose": 95,
      "sorbitol_d": 5
    },
    "prevalence_score": 4,
    "prevalence_symbol": "++++"
  },
  "enterococcus_faecalis": {
    "species": "Enterococcus faecalis",
    "source": "MCM 11th ch.22/23",
    "tests": {
      "bacitracin": 5,
      "pyr": 95,
      "camp": 5,
      "voges_proskauer": 95,
      "hippurate": 5,
      "trehalose": 95,
      "sorbitol_d": 95
    },
    "prevalence_score": 4,
    "prevalence_symbol": "++++"
  },
  "enterococcus_faecium": {
    "species": "Enterococcus faecium",
    "source": "MCM 11th ch.22/23",
    "tests": {
      "bacitracin": 5,
      "pyr": 95,
      "camp": 5,
      "voges_proskauer": 95,
      "hippurate": 5,
      "trehalose": 95,
      "sorbitol_d": 5
    },
    "prevalence_score": 3,
    "prevalence_symbol": "+++"
  },
  "neisseria_animaloris": {
    "species": "Neisseria animaloris",
    "source": "MCM 11th ch.34 Table 2",
    "tests": {
      "glucose_acid": 95,
      "maltose": 5,
      "lactose": 5,
      "sucrose": 5,
      "nitrate_reduction": 95
    },
    "prevalence_score": 1,
    "prevalence_symbol": "+"
  },
  "neisseria_bacilliformis": {
    "species": "Neisseria bacilliformis",
    "source": "MCM 11th ch.34 Table 2",
    "tests": {
      "glucose_acid": 5,
      "maltose": 5,
      "lactose": 5,
      "sucrose": 5,
      "nitrate_reduction": 50
    },
    "prevalence_score": 1,
    "prevalence_symbol": "+"
  },
  "neisseria_cinerea": {
    "species": "Neisseria cinerea",
    "source": "MCM 11th ch.34 Table 2",
    "tests": {
      "glucose_acid": 50,
      "maltose": 5,
      "lactose": 5,
      "sucrose": 5,
      "fructose_acid": 5,
      "nitrate_reduction": 5,
      "polysaccharide_from_suc": 5
    },
    "prevalence_score": 2,
    "prevalence_symbol": "++"
  },
  "neisseria_flavescens": {
    "species": "Neisseria flavescens",
    "source": "MCM 11th ch.34 Table 2",
    "tests": {
      "glucose_acid": 5,
      "maltose": 5,
      "lactose": 5,
      "sucrose": 5,
      "fructose_acid": 5,
      "nitrate_reduction": 5,
      "polysaccharide_from_suc": 95
    },
    "prevalence_score": 1,
    "prevalence_symbol": "+"
  },
  "n_gonorrhoeae": {
    "species": "Neisseria gonorrhoeae",
    "source": "MCM 11th ch.34 Table 2",
    "tests": {
      "glucose_acid": 95,
      "maltose": 5,
      "lactose": 5,
      "sucrose": 5,
      "fructose_acid": 5,
      "nitrate_reduction": 5,
      "polysaccharide_from_suc": 5
    },
    "prevalence_score": 4,
    "prevalence_symbol": "++++"
  },
  "neisseria_lactamica": {
    "species": "Neisseria lactamica",
    "source": "MCM 11th ch.34 Table 2",
    "tests": {
      "glucose_acid": 95,
      "maltose": 95,
      "lactose": 95,
      "sucrose": 5,
      "fructose_acid": 5,
      "nitrate_reduction": 5,
      "polysaccharide_from_suc": 5
    },
    "prevalence_score": 3,
    "prevalence_symbol": "+++"
  },
  "n_meningitidis": {
    "species": "Neisseria meningitidis",
    "source": "MCM 11th ch.34 Table 2",
    "tests": {
      "glucose_acid": 95,
      "maltose": 95,
      "lactose": 5,
      "sucrose": 5,
      "fructose_acid": 5,
      "nitrate_reduction": 5,
      "polysaccharide_from_suc": 5
    },
    "prevalence_score": 4,
    "prevalence_symbol": "++++"
  },
  "neisseria_mucosa": {
    "species": "Neisseria mucosa",
    "source": "MCM 11th ch.34 Table 2",
    "tests": {
      "glucose_acid": 95,
      "maltose": 95,
      "lactose": 5,
      "sucrose": 95,
      "fructose_acid": 95,
      "nitrate_reduction": 95,
      "polysaccharide_from_suc": 95
    },
    "prevalence_score": 2,
    "prevalence_symbol": "++"
  },
  "neisseria_polysaccharea": {
    "species": "Neisseria polysaccharea",
    "source": "MCM 11th ch.34 Table 2",
    "tests": {
      "glucose_acid": 50,
      "maltose": 95,
      "lactose": 5,
      "sucrose": 50,
      "fructose_acid": 5,
      "nitrate_reduction": 5,
      "polysaccharide_from_suc": 95
    },
    "prevalence_score": 1,
    "prevalence_symbol": "+"
  },
  "neisseria_sicca": {
    "species": "Neisseria sicca",
    "source": "MCM 11th ch.34 Table 2",
    "tests": {
      "glucose_acid": 95,
      "maltose": 95,
      "lactose": 5,
      "sucrose": 95,
      "fructose_acid": 95,
      "nitrate_reduction": 5,
      "polysaccharide_from_suc": 95
    },
    "prevalence_score": 2,
    "prevalence_symbol": "++"
  },
  "neisseria_subflava": {
    "species": "Neisseria subflava",
    "source": "MCM 11th ch.34 Table 2",
    "tests": {
      "glucose_acid": 50,
      "maltose": 95,
      "lactose": 5,
      "sucrose": 50,
      "fructose_acid": 50,
      "nitrate_reduction": 5,
      "polysaccharide_from_suc": 50
    },
    "prevalence_score": 2,
    "prevalence_symbol": "++"
  },
  "neisseria_weaveri": {
    "species": "Neisseria weaveri",
    "source": "MCM 11th ch.34 Table 2",
    "tests": {
      "glucose_acid": 5,
      "maltose": 5,
      "lactose": 5,
      "sucrose": 5,
      "fructose_acid": 5,
      "nitrate_reduction": 5
    },
    "prevalence_score": 1,
    "prevalence_symbol": "+"
  },
  "neisseria_zooedgmatis": {
    "species": "Neisseria zoodegmatis",
    "source": "MCM 11th ch.34 Table 2",
    "tests": {
      "glucose_acid": 50,
      "maltose": 5,
      "lactose": 5,
      "sucrose": 5,
      "nitrate_reduction": 50
    },
    "prevalence_score": 1,
    "prevalence_symbol": "+"
  },
  "neisseria_elongata": {
    "species": "Neisseria elongata",
    "source": "MCM 11th ch.34 Table 2",
    "tests": {
      "glucose_acid": 5,
      "maltose": 5,
      "lactose": 5,
      "sucrose": 5,
      "fructose_acid": 5,
      "nitrate_reduction": 50,
      "polysaccharide_from_suc": 5
    },
    "prevalence_score": 1,
    "prevalence_symbol": "+"
  },
  "b_pseudomallei": {
    "species": "Burkholderia pseudomallei",
    "source": "MCM 11th ch.43 Table 2",
    "tests": {
      "urea": 50,
      "citrate": 50,
      "gelatin_hydrolysis": 50,
      "esculin": 50,
      "glucose_acid": 95,
      "xylose_d": 95,
      "lactose": 95,
      "sucrose": 50,
      "maltose": 95,
      "mannitol_d": 95,
      "arabinose": 5,
      "motility": 95
    },
    "prevalence_score": 3,
    "prevalence_symbol": "+++"
  },
  "burkholderia_thailandensis": {
    "species": "Burkholderia thailandensis",
    "source": "MCM 11th ch.43 Table 2",
    "tests": {
      "urea": 50,
      "citrate": 50,
      "gelatin_hydrolysis": 50,
      "esculin": 50,
      "glucose_acid": 95,
      "xylose_d": 95,
      "lactose": 95,
      "sucrose": 50,
      "maltose": 95,
      "mannitol_d": 95,
      "arabinose": 95,
      "motility": 95
    },
    "prevalence_score": 1,
    "prevalence_symbol": "+"
  },
  "yersinia_pestis": {
    "species": "Yersinia pestis",
    "source": "MCM 11th ch.39 Table 1",
    "tests": {
      "motility": 5,
      "urea": 5,
      "voges_proskauer": 5,
      "citrate_simon": 5,
      "indole_production": 5,
      "rhamnose": 5,
      "sucrose": 5,
      "cellobiose": 5,
      "sorbose": 5,
      "sorbitol": 5,
      "ornithine_decarboxylase": 5,
      "melibiose": 5,
      "salicin": 5,
      "arabinose": 95,
      "trehalose": 95
    },
    "prevalence_score": 2,
    "prevalence_symbol": "++"
  },
  "yersinia_pseudotuberculosis": {
    "species": "Yersinia pseudotuberculosis",
    "source": "MCM 11th ch.39 Table 1",
    "tests": {
      "motility": 95,
      "urea": 5,
      "voges_proskauer": 95,
      "citrate_simon": 5,
      "indole_production": 5,
      "rhamnose": 5,
      "sucrose": 80,
      "cellobiose": 5,
      "sorbose": 5,
      "sorbitol": 5,
      "ornithine_decarboxylase": 5,
      "melibiose": 95,
      "salicin": 5,
      "arabinose": 95,
      "trehalose": 5
    },
    "prevalence_score": 2,
    "prevalence_symbol": "++"
  },
  "yersinia_enterocolitica": {
    "species": "Yersinia enterocolitica",
    "source": "MCM 11th ch.39 Table 1",
    "tests": {
      "motility": 95,
      "urea": 95,
      "voges_proskauer": 95,
      "citrate_simon": 50,
      "indole_production": 5,
      "rhamnose": 50,
      "sucrose": 5,
      "cellobiose": 95,
      "sorbose": 95,
      "sorbitol": 95,
      "ornithine_decarboxylase": 95,
      "melibiose": 5,
      "salicin": 5,
      "arabinose": 5,
      "trehalose": 95
    },
    "prevalence_score": 3,
    "prevalence_symbol": "+++"
  },
  "yersinia_frederiksenii": {
    "species": "Yersinia frederiksenii",
    "source": "MCM 11th ch.39 Table 1",
    "tests": {
      "motility": 95,
      "urea": 95,
      "voges_proskauer": 95,
      "citrate_simon": 95,
      "indole_production": 95,
      "rhamnose": 95,
      "sucrose": 95,
      "cellobiose": 95,
      "sorbose": 95,
      "sorbitol": 95,
      "ornithine_decarboxylase": 95,
      "melibiose": 5,
      "salicin": 5,
      "arabinose": 95,
      "trehalose": 95
    },
    "prevalence_score": 1,
    "prevalence_symbol": "+"
  },
  "yersinia_kristensenii": {
    "species": "Yersinia kristensenii",
    "source": "MCM 11th ch.39 Table 1",
    "tests": {
      "motility": 95,
      "urea": 95,
      "voges_proskauer": 95,
      "citrate_simon": 5,
      "indole_production": 5,
      "rhamnose": 95,
      "sucrose": 5,
      "cellobiose": 5,
      "sorbose": 95,
      "sorbitol": 95,
      "ornithine_decarboxylase": 95,
      "melibiose": 5,
      "salicin": 5,
      "arabinose": 95,
      "trehalose": 95
    },
    "prevalence_score": 1,
    "prevalence_symbol": "+"
  },
  "yersinia_ruckeri": {
    "species": "Yersinia ruckeri",
    "source": "MCM 11th ch.39 Table 1",
    "tests": {
      "motility": 50,
      "urea": 95,
      "voges_proskauer": 5,
      "citrate_simon": 5,
      "indole_production": 5,
      "rhamnose": 5,
      "sucrose": 5,
      "cellobiose": 5,
      "sorbose": 5,
      "sorbitol": 5,
      "ornithine_decarboxylase": 5,
      "melibiose": 5,
      "salicin": 5,
      "arabinose": 5,
      "trehalose": 5
    },
    "prevalence_score": 1,
    "prevalence_symbol": "+"
  },
  "yersinia_mollaretii": {
    "species": "Yersinia mollaretii",
    "source": "MCM 11th ch.39 Table 1",
    "tests": {
      "motility": 95,
      "urea": 95,
      "voges_proskauer": 95,
      "citrate_simon": 5,
      "indole_production": 95,
      "rhamnose": 5,
      "sucrose": 5,
      "cellobiose": 95,
      "sorbose": 95,
      "sorbitol": 95,
      "ornithine_decarboxylase": 95,
      "melibiose": 5,
      "salicin": 5,
      "arabinose": 80,
      "trehalose": 95
    },
    "prevalence_score": 1,
    "prevalence_symbol": "+"
  },
  "yersinia_bercovieri": {
    "species": "Yersinia bercovieri",
    "source": "MCM 11th ch.39 Table 1",
    "tests": {
      "motility": 95,
      "urea": 95,
      "voges_proskauer": 95,
      "citrate_simon": 5,
      "indole_production": 5,
      "rhamnose": 5,
      "sucrose": 5,
      "cellobiose": 95,
      "sorbose": 95,
      "sorbitol": 5,
      "ornithine_decarboxylase": 95,
      "melibiose": 5,
      "salicin": 5,
      "arabinose": 5,
      "trehalose": 95
    },
    "prevalence_score": 1,
    "prevalence_symbol": "+"
  },
  "yersinia_rohdei": {
    "species": "Yersinia rohdei",
    "source": "MCM 11th ch.39 Table 1",
    "tests": {
      "motility": 95,
      "urea": 95,
      "voges_proskauer": 95,
      "citrate_simon": 5,
      "indole_production": 95,
      "rhamnose": 5,
      "sucrose": 5,
      "cellobiose": 95,
      "sorbose": 95,
      "sorbitol": 5,
      "ornithine_decarboxylase": 95,
      "melibiose": 95,
      "salicin": 95,
      "arabinose": 5,
      "trehalose": 95
    },
    "prevalence_score": 1,
    "prevalence_symbol": "+"
  },
  "yersinia_aldovae": {
    "species": "Yersinia aldovae",
    "source": "MCM 11th ch.39 Table 1",
    "tests": {
      "motility": 95,
      "urea": 95,
      "voges_proskauer": 95,
      "citrate_simon": 95,
      "indole_production": 95,
      "rhamnose": 5,
      "sucrose": 95,
      "cellobiose": 5,
      "sorbose": 5,
      "sorbitol": 5,
      "ornithine_decarboxylase": 95,
      "melibiose": 5,
      "salicin": 5,
      "arabinose": 5,
      "trehalose": 95
    },
    "prevalence_score": 1,
    "prevalence_symbol": "+"
  },
  "yersinia_intermedia": {
    "species": "Yersinia intermedia",
    "source": "MCM 11th ch.39 Table 1",
    "tests": {
      "motility": 95,
      "urea": 95,
      "voges_proskauer": 95,
      "citrate_simon": 95,
      "indole_production": 95,
      "rhamnose": 95,
      "sucrose": 95,
      "cellobiose": 95,
      "sorbose": 95,
      "sorbitol": 95,
      "ornithine_decarboxylase": 95,
      "melibiose": 95,
      "salicin": 95,
      "arabinose": 95,
      "trehalose": 95
    },
    "prevalence_score": 1,
    "prevalence_symbol": "+"
  },
  "aeromonas_hydrophila": {
    "species": "Aeromonas hydrophila",
    "source": "MCM 11th ch.40 Table 3",
    "tests": {
      "citrate_simon": 92,
      "gas_glucose": 92,
      "indole_production": 96,
      "voges_proskauer": 92,
      "lipase": 100,
      "cellobiose": 4,
      "lactose": 64,
      "rhamnose": 24,
      "sorbitol": 0,
      "mannose_d": 100,
      "glycerol": 96,
      "mannitol_d": 96,
      "sucrose": 100
    },
    "prevalence_score": 3,
    "prevalence_symbol": "+++"
  },
  "aeromonas_caviae": {
    "species": "Aeromonas caviae",
    "source": "MCM 11th ch.40 Table 3",
    "tests": {
      "citrate_simon": 88,
      "gas_glucose": 0,
      "indole_production": 84,
      "voges_proskauer": 0,
      "lipase": 76,
      "cellobiose": 100,
      "lactose": 60,
      "rhamnose": 0,
      "sorbitol": 4,
      "mannose_d": 32,
      "glycerol": 68,
      "mannitol_d": 100,
      "sucrose": 100
    },
    "prevalence_score": 3,
    "prevalence_symbol": "+++"
  },
  "aeromonas_veronii": {
    "species": "Aeromonas veronii",
    "source": "MCM 11th ch.40 Table 3",
    "tests": {
      "citrate_simon": 52,
      "gas_glucose": 92,
      "indole_production": 100,
      "voges_proskauer": 92,
      "lipase": 92,
      "cellobiose": 20,
      "lactose": 12,
      "rhamnose": 0,
      "sorbitol": 0,
      "glycerol": 100,
      "mannitol_d": 100,
      "sucrose": 100
    },
    "prevalence_score": 2,
    "prevalence_symbol": "++"
  },
  "aeromonas_jandaei": {
    "species": "Aeromonas jandaei",
    "source": "MCM 11th ch.40 Table 3",
    "tests": {
      "citrate_simon": 87,
      "gas_glucose": 100,
      "indole_production": 100,
      "voges_proskauer": 87,
      "lipase": 100,
      "cellobiose": 20,
      "lactose": 0,
      "rhamnose": 0,
      "sorbitol": 0,
      "mannose_d": 100,
      "glycerol": 100,
      "mannitol_d": 100,
      "sucrose": 0
    },
    "prevalence_score": 1,
    "prevalence_symbol": "+"
  },
  "serratia_marcescens": {
    "species": "Serratia marcescens",
    "source": "MCM 11th ch.38 Table 4",
    "tests": {
      "ornithine_decarboxylase": 95,
      "lysine_decarboxylase": 95,
      "gelatin_hydrolysis": 95,
      "voges_proskauer": 95,
      "d_sorbitol": 95,
      "sucrose": 95,
      "dulcitol": 5,
      "indole_production": 5,
      "motility": 95
    },
    "prevalence_score": 3,
    "prevalence_symbol": "+++"
  },
  "serratia_liquefaciens": {
    "species": "Serratia liquefaciens",
    "source": "MCM 11th ch.38 Table 4",
    "tests": {
      "ornithine_decarboxylase": 95,
      "lysine_decarboxylase": 95,
      "gelatin_hydrolysis": 95,
      "voges_proskauer": 95,
      "d_sorbitol": 50,
      "sucrose": 95,
      "dulcitol": 5,
      "indole_production": 5,
      "motility": 95
    },
    "prevalence_score": 2,
    "prevalence_symbol": "++"
  },
  "serratia_odorifera": {
    "species": "Serratia odorifera",
    "source": "MCM 11th ch.38 Table 4",
    "tests": {
      "ornithine_decarboxylase": 95,
      "lysine_decarboxylase": 5,
      "gelatin_hydrolysis": 95,
      "voges_proskauer": 95,
      "d_sorbitol": 95,
      "sucrose": 95,
      "dulcitol": 5,
      "indole_production": 50,
      "motility": 95
    },
    "prevalence_score": 1,
    "prevalence_symbol": "+"
  },
  "serratia_rubidaea": {
    "species": "Serratia rubidaea",
    "source": "MCM 11th ch.38 Table 4",
    "tests": {
      "ornithine_decarboxylase": 5,
      "lysine_decarboxylase": 5,
      "gelatin_hydrolysis": 95,
      "voges_proskauer": 95,
      "d_sorbitol": 95,
      "sucrose": 95,
      "dulcitol": 5,
      "indole_production": 5,
      "motility": 95
    },
    "prevalence_score": 1,
    "prevalence_symbol": "+"
  },
  "enterobacter_cloacae": {
    "species": "Enterobacter cloacae",
    "source": "MCM 11th ch.38 Table 5",
    "tests": {
      "ornithine_decarboxylase": 95,
      "lysine_decarboxylase": 5,
      "indole_production": 5,
      "voges_proskauer": 95,
      "motility": 95,
      "sorbitol_d": 95,
      "adonitol": 5,
      "malonate": 50,
      "yellow_pigment": 5
    },
    "prevalence_score": 3,
    "prevalence_symbol": "+++"
  },
  "enterobacter_aerogenes": {
    "species": "Enterobacter aerogenes",
    "source": "MCM 11th ch.38 Table 5",
    "tests": {
      "ornithine_decarboxylase": 95,
      "lysine_decarboxylase": 95,
      "indole_production": 5,
      "voges_proskauer": 95,
      "motility": 95,
      "sorbitol_d": 95,
      "adonitol": 95,
      "malonate": 95,
      "yellow_pigment": 5
    },
    "prevalence_score": 3,
    "prevalence_symbol": "+++"
  },
  "enterobacter_agglomerans": {
    "species": "Enterobacter agglomerans",
    "source": "MCM 11th ch.38 Table 5",
    "tests": {
      "ornithine_decarboxylase": 5,
      "lysine_decarboxylase": 5,
      "indole_production": 50,
      "voges_proskauer": 95,
      "motility": 95,
      "sorbitol_d": 50,
      "adonitol": 5,
      "malonate": 5,
      "yellow_pigment": 95
    },
    "prevalence_score": 2,
    "prevalence_symbol": "++"
  },
  "enterobacter_asburiae": {
    "species": "Enterobacter asburiae",
    "source": "MCM 11th ch.38 Table 5",
    "tests": {
      "ornithine_decarboxylase": 95,
      "lysine_decarboxylase": 5,
      "indole_production": 5,
      "voges_proskauer": 95,
      "motility": 95,
      "sorbitol_d": 95,
      "adonitol": 5,
      "malonate": 5,
      "yellow_pigment": 5
    },
    "prevalence_score": 1,
    "prevalence_symbol": "+"
  },
  "enterobacter_gergoviae": {
    "species": "Enterobacter gergoviae",
    "source": "MCM 11th ch.38 Table 5",
    "tests": {
      "ornithine_decarboxylase": 95,
      "lysine_decarboxylase": 95,
      "indole_production": 95,
      "voges_proskauer": 95,
      "motility": 95,
      "sorbitol_d": 5,
      "adonitol": 5,
      "malonate": 95,
      "yellow_pigment": 5
    },
    "prevalence_score": 1,
    "prevalence_symbol": "+"
  },
  "listeria_monocytogenes": {
    "species": "Listeria monocytogenes",
    "source": "MCM 11th ch.27 Table 2",
    "tests": {
      "hemolysis": 95,
      "motility": 95,
      "catalase": 95,
      "camp": 95,
      "rhamnose": 95,
      "xylose": 5,
      "mannitol_d": 5
    },
    "prevalence_score": 3,
    "prevalence_symbol": "+++"
  },
  "listeria_innocua": {
    "species": "Listeria innocua",
    "source": "MCM 11th ch.27 Table 2",
    "tests": {
      "hemolysis": 5,
      "motility": 95,
      "catalase": 95,
      "camp": 5,
      "rhamnose": 95,
      "xylose": 5,
      "mannitol_d": 5
    },
    "prevalence_score": 2,
    "prevalence_symbol": "++"
  },
  "listeria_ivanovii": {
    "species": "Listeria ivanovii",
    "source": "MCM 11th ch.27 Table 2",
    "tests": {
      "hemolysis": 95,
      "motility": 95,
      "catalase": 95,
      "camp": 5,
      "rhamnose": 5,
      "xylose": 95,
      "mannitol_d": 95
    },
    "prevalence_score": 1,
    "prevalence_symbol": "+"
  },
  "bacillus_anthracis": {
    "species": "Bacillus anthracis",
    "source": "MCM 11th ch.26 Table 1",
    "tests": {
      "motility": 5,
      "hemolysis": 5,
      "catalase": 95,
      "voges_proskauer": 95,
      "glucose_acid": 95,
      "mannitol_d": 5,
      "gelatin_hydrolysis": 95,
      "urea": 50
    },
    "prevalence_score": 2,
    "prevalence_symbol": "++"
  },
  "b_cereus": {
    "species": "Bacillus cereus",
    "source": "MCM 11th ch.26 Table 1",
    "tests": {
      "motility": 95,
      "hemolysis": 95,
      "catalase": 95,
      "voges_proskauer": 95,
      "glucose_acid": 95,
      "mannitol_d": 5,
      "gelatin_hydrolysis": 95,
      "urea": 50
    },
    "prevalence_score": 2,
    "prevalence_symbol": "++"
  },
  "bacillus_subtilis": {
    "species": "Bacillus subtilis",
    "source": "MCM 11th ch.26 Table 1",
    "tests": {
      "motility": 95,
      "hemolysis": 50,
      "catalase": 95,
      "voges_proskauer": 95,
      "glucose_acid": 95,
      "mannitol_d": 95,
      "gelatin_hydrolysis": 95,
      "urea": 95
    },
    "prevalence_score": 2,
    "prevalence_symbol": "++"
  },
  "bacillus_thuringiensis": {
    "species": "Bacillus thuringiensis",
    "source": "MCM 11th ch.26 Table 1",
    "tests": {
      "motility": 95,
      "hemolysis": 95,
      "catalase": 95,
      "voges_proskauer": 95,
      "glucose_acid": 95,
      "mannitol_d": 5,
      "gelatin_hydrolysis": 95,
      "urea": 50
    },
    "prevalence_score": 1,
    "prevalence_symbol": "+"
  },
  "acinetobacter_baumannii": {
    "species": "Acinetobacter baumannii",
    "source": "MCM 11th ch.43 Table 1",
    "tests": {
      "oxidase": 5,
      "motility": 5,
      "hemolysis": 50,
      "glucose_acid": 95,
      "mannitol_d": 50,
      "sucrose": 5,
      "lactose": 5,
      "nitrate_reduction": 5,
      "gelatin_hydrolysis": 5
    },
    "prevalence_score": 4,
    "prevalence_symbol": "++++"
  },
  "acinetobacter_haemolyticus": {
    "species": "Acinetobacter haemolyticus",
    "source": "MCM 11th ch.43 Table 1",
    "tests": {
      "oxidase": 5,
      "motility": 5,
      "hemolysis": 95,
      "glucose_acid": 95,
      "mannitol_d": 95,
      "sucrose": 95,
      "lactose": 95,
      "nitrate_reduction": 5,
      "gelatin_hydrolysis": 95
    },
    "prevalence_score": 2,
    "prevalence_symbol": "++"
  },
  "acinetobacter_lwoffii": {
    "species": "Acinetobacter lwoffii",
    "source": "MCM 11th ch.43 Table 1",
    "tests": {
      "oxidase": 5,
      "motility": 5,
      "hemolysis": 5,
      "glucose_acid": 5,
      "mannitol_d": 5,
      "sucrose": 5,
      "lactose": 5,
      "nitrate_reduction": 5,
      "gelatin_hydrolysis": 5
    },
    "prevalence_score": 2,
    "prevalence_symbol": "++"
  },
  "acinetobacter_johnsonii": {
    "species": "Acinetobacter johnsonii",
    "source": "MCM 11th ch.43 Table 1",
    "tests": {
      "oxidase": 5,
      "motility": 5,
      "hemolysis": 5,
      "glucose_acid": 5,
      "mannitol_d": 5,
      "sucrose": 5,
      "lactose": 5,
      "nitrate_reduction": 95,
      "gelatin_hydrolysis": 5
    },
    "prevalence_score": 1,
    "prevalence_symbol": "+"
  },
  "acinetobacter_junii": {
    "species": "Acinetobacter junii",
    "source": "MCM 11th ch.43 Table 1",
    "tests": {
      "oxidase": 5,
      "motility": 5,
      "hemolysis": 50,
      "glucose_acid": 50,
      "mannitol_d": 50,
      "sucrose": 5,
      "lactose": 5,
      "nitrate_reduction": 5,
      "gelatin_hydrolysis": 5
    },
    "prevalence_score": 1,
    "prevalence_symbol": "+"
  },
  "micrococcus": {
    "species": "Micrococcus spp.",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 1,
    "prevalence_symbol": "+",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "salmonella": {
    "species": "Salmonella spp.",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 4,
    "prevalence_symbol": "++++",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "shigella": {
    "species": "Shigella spp.",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 3,
    "prevalence_symbol": "+++",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "aeromonas": {
    "species": "Aeromonas hydrophila",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 2,
    "prevalence_symbol": "++",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "c_diphtheriae": {
    "species": "Corynebacterium diphtheriae",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 4,
    "prevalence_symbol": "++++",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "h_influenzae": {
    "species": "Haemophilus influenzae",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 4,
    "prevalence_symbol": "++++",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "e_avium": {
    "species": "Enterococcus avium",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 1,
    "prevalence_symbol": "+",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "e_casseliflavus": {
    "species": "Enterococcus casseliflavus",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 1,
    "prevalence_symbol": "+",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "e_dispar": {
    "species": "Enterococcus dispar",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 1,
    "prevalence_symbol": "+",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "e_durans": {
    "species": "Enterococcus durans",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 1,
    "prevalence_symbol": "+",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "e_gallinorum": {
    "species": "Enterococcus gallinarum",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 1,
    "prevalence_symbol": "+",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "e_hirae": {
    "species": "Enterococcus hirae",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 1,
    "prevalence_symbol": "+",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "e_mundtii": {
    "species": "Enterococcus mundtii",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 1,
    "prevalence_symbol": "+",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "e_raffinosus": {
    "species": "Enterococcus raffinosus",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 1,
    "prevalence_symbol": "+",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "strep_group_d": {
    "species": "Streptococcus bovis group (Group D Streptococcus)",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 2,
    "prevalence_symbol": "++",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "viridans_strep": {
    "species": "Viridans streptococcus group",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 2,
    "prevalence_symbol": "++",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "erysipelothrix_rhusiopathiae": {
    "species": "Erysipelothrix rhusiopathiae",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 2,
    "prevalence_symbol": "++",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "gardnerella_vaginalis": {
    "species": "Gardnerella vaginalis",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 2,
    "prevalence_symbol": "++",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "arcanobacterium_haemolyticum": {
    "species": "Arcanobacterium haemolyticum",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 2,
    "prevalence_symbol": "++",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "stenotrophomonas_maltophilia": {
    "species": "Stenotrophomonas maltophilia",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 3,
    "prevalence_symbol": "+++",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "burkholderia_cepacia": {
    "species": "Burkholderia cepacia complex",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 3,
    "prevalence_symbol": "+++",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "shewanella_putrefaciens": {
    "species": "Shewanella putrefaciens",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 2,
    "prevalence_symbol": "++",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "shewanella_algae": {
    "species": "Shewanella algae",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 2,
    "prevalence_symbol": "++",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "elizabethkingia_meningoseptica": {
    "species": "Elizabethkingia meningoseptica",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 3,
    "prevalence_symbol": "+++",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "klebsiella_aerogenes": {
    "species": "Klebsiella (Enterobacter) aerogenes",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 3,
    "prevalence_symbol": "+++",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "cronobacter_sakazakii": {
    "species": "Cronobacter sakazakii",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 3,
    "prevalence_symbol": "+++",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "edwardsiella_tarda": {
    "species": "Edwardsiella tarda",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 1,
    "prevalence_symbol": "+",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "salmonella_arizonae": {
    "species": "Salmonella arizonae",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 1,
    "prevalence_symbol": "+",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "aeromonas_sobria": {
    "species": "Aeromonas sobria",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 2,
    "prevalence_symbol": "++",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "aeromonas_salmonicida": {
    "species": "Aeromonas salmonicida",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 1,
    "prevalence_symbol": "+",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "alcaligenes_faecalis": {
    "species": "Alcaligenes faecalis",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 1,
    "prevalence_symbol": "+",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "moraxella_catarrhalis": {
    "species": "Moraxella catarrhalis",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 3,
    "prevalence_symbol": "+++",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "pasteurella_multocida": {
    "species": "Pasteurella multocida",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 3,
    "prevalence_symbol": "+++",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "pasteurella_bettyae": {
    "species": "Pasteurella bettyae",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 1,
    "prevalence_symbol": "+",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "pasteurella_canis": {
    "species": "Pasteurella canis",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 2,
    "prevalence_symbol": "++",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "pasteurella_dagmatis": {
    "species": "Pasteurella dagmatis",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 2,
    "prevalence_symbol": "++",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "pasteurella_pneumotropica": {
    "species": "Pasteurella pneumotropica",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 1,
    "prevalence_symbol": "+",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "pasteurella_stomatis": {
    "species": "Pasteurella stomatis",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 1,
    "prevalence_symbol": "+",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "pasteurella_zoohelcum": {
    "species": "Pasteurella zoohelcum",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 1,
    "prevalence_symbol": "+",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "h_aphrophilus": {
    "species": "Haemophilus aphrophilus",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 1,
    "prevalence_symbol": "+",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "h_ducreyi": {
    "species": "Haemophilus ducreyi",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 3,
    "prevalence_symbol": "+++",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "h_haemolyticus": {
    "species": "Haemophilus haemolyticus",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 1,
    "prevalence_symbol": "+",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "h_parahaemolyticus": {
    "species": "Haemophilus parahaemolyticus",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 1,
    "prevalence_symbol": "+",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "h_parainfluenzae": {
    "species": "Haemophilus parainfluenzae",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 2,
    "prevalence_symbol": "++",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "h_paraphrophilus": {
    "species": "Haemophilus paraphrophilus",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 1,
    "prevalence_symbol": "+",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "h_segnis": {
    "species": "Haemophilus segnis",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 1,
    "prevalence_symbol": "+",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "arcanobacterium_pyogenes": {
    "species": "Arcanobacterium pyogenes",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 1,
    "prevalence_symbol": "+",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "arcanobacterium_bernardiae": {
    "species": "Arcanobacterium bernardiae",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 1,
    "prevalence_symbol": "+",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "c_amycolatum": {
    "species": "Corynebacterium amycolatum",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 1,
    "prevalence_symbol": "+",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "c_glucuronolyticum": {
    "species": "Corynebacterium glucuronolyticum",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 1,
    "prevalence_symbol": "+",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "c_minutissimum": {
    "species": "Corynebacterium minutissimum",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 1,
    "prevalence_symbol": "+",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "c_pseudodiphtheriticum": {
    "species": "Corynebacterium pseudodiphtheriticum",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 1,
    "prevalence_symbol": "+",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "c_pseudotuberculosis": {
    "species": "Corynebacterium pseudotuberculosis",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 1,
    "prevalence_symbol": "+",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "c_striatum": {
    "species": "Corynebacterium striatum",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 1,
    "prevalence_symbol": "+",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "c_ulcerans": {
    "species": "Corynebacterium ulcerans",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 2,
    "prevalence_symbol": "++",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "c_urealyticum": {
    "species": "Corynebacterium urealyticum",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 2,
    "prevalence_symbol": "++",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "c_xerosis": {
    "species": "Corynebacterium xerosis",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 1,
    "prevalence_symbol": "+",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "listeria_grayi": {
    "species": "Listeria grayi",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 1,
    "prevalence_symbol": "+",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "listeria_seeligeri": {
    "species": "Listeria seeligeri",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 1,
    "prevalence_symbol": "+",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "listeria_welshimeri": {
    "species": "Listeria welshimeri",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 1,
    "prevalence_symbol": "+",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "b_mycoides": {
    "species": "Bacillus mycoides",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 1,
    "prevalence_symbol": "+",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "b_megaterium": {
    "species": "Bacillus megaterium",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 1,
    "prevalence_symbol": "+",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "b_thuringiensis": {
    "species": "Bacillus thuringiensis",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 1,
    "prevalence_symbol": "+",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  },
  "rhodococcus_equi": {
    "species": "Rhodococcus equi",
    "source": "LIBRARY importance proxy",
    "prevalence_score": 2,
    "prevalence_symbol": "++",
    "prevalence_source": "LIBRARY importance",
    "tests": {}
  }
};