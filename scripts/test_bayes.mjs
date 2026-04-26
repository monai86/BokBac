/**
 * Validation suite for calcProbabilityBayes (v3.0.0).
 *
 * Loads MCM_DATA, simulates the algorithm, and runs textbook scenarios
 * to verify the new Naive Bayes engine produces sensible results.
 *
 * Usage:  node scripts/test_bayes.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// --- Load MCM_DATA from js/mcm_data.js ---
const mcmJs = fs.readFileSync(path.join(ROOT, "js/mcm_data.js"), "utf-8");
const mcmObjMatch = mcmJs.match(/const\s+MCM_DATA\s*=\s*(\{[\s\S]*?\});\s*\n/);
if (!mcmObjMatch) throw new Error("Could not parse MCM_DATA");
const MCM_DATA = JSON.parse(mcmObjMatch[1]);

// --- Minimal library entries needed for testing ---
// (mirrors LIBRARY structure from index.html)
const LIBRARY = [
  {
    id: "e_coli", group: "enterobacterales", name: "Escherichia coli",
    biochem: [
      { t: "Oxidase", r: "−" }, { t: "Indole", r: "+" }, { t: "Motility", r: "+" },
      { t: "VP", r: "−" }, { t: "Citrate", r: "−" }, { t: "Urease", r: "−" },
      { t: "Lactose", r: "+" }, { t: "Sucrose", r: "−" },
      { t: "LDC", r: "+" }, { t: "ODC", r: "+/−" },
    ],
  },
  {
    id: "klebsiella_pneumoniae", group: "enterobacterales", name: "Klebsiella pneumoniae",
    biochem: [
      { t: "Oxidase", r: "−" }, { t: "Indole", r: "−" }, { t: "Motile", r: "−" },
      { t: "VP", r: "+" }, { t: "Citrate", r: "+" }, { t: "Urease", r: "+" },
      { t: "Lactose", r: "+" }, { t: "Sucrose", r: "+" },
      { t: "LDC", r: "+" }, { t: "ODC", r: "−" }, { t: "Malonate", r: "+" },
    ],
  },
  {
    id: "klebsiella_oxytoca", group: "enterobacterales", name: "Klebsiella oxytoca",
    biochem: [
      { t: "Oxidase", r: "−" }, { t: "Indole", r: "+" }, { t: "Motile", r: "−" },
      { t: "VP", r: "+" }, { t: "Citrate", r: "+" }, { t: "Urease", r: "+" },
      { t: "Lactose", r: "+" }, { t: "Sucrose", r: "+" },
    ],
  },
  {
    id: "salmonella_paratyphi_a", group: "enterobacterales", name: "Salmonella Paratyphi A",
    biochem: [
      { t: "Oxidase", r: "−" }, { t: "Indole", r: "−" }, { t: "Motility", r: "+" },
      { t: "H₂S (TSI)", r: "−" }, { t: "Urease", r: "−" }, { t: "Lactose", r: "−" },
      { t: "LDC", r: "−" },
    ],
  },
  {
    id: "shigella_sonnei", group: "enterobacterales", name: "Shigella sonnei",
    biochem: [
      { t: "Oxidase", r: "−" }, { t: "Indole", r: "−" }, { t: "Motility", r: "−" },
      { t: "Lactose", r: "−" }, { t: "ODC", r: "+" }, { t: "LDC", r: "−" },
    ],
  },
  {
    id: "shigella_dysenteriae", group: "enterobacterales", name: "Shigella dysenteriae",
    biochem: [
      { t: "Oxidase", r: "−" }, { t: "Indole", r: "V" }, { t: "Motility", r: "−" },
      { t: "Lactose", r: "−" }, { t: "Mannitol", r: "−" }, { t: "LDC", r: "−" },
    ],
  },
  {
    id: "shigella_flexneri", group: "enterobacterales", name: "Shigella flexneri",
    biochem: [
      { t: "Oxidase", r: "−" }, { t: "Indole", r: "V" }, { t: "Motility", r: "−" },
      { t: "Lactose", r: "−" }, { t: "Mannitol", r: "+" }, { t: "LDC", r: "−" },
    ],
  },
  {
    id: "proteus_mirabilis", group: "enterobacterales", name: "Proteus mirabilis",
    biochem: [
      { t: "Oxidase", r: "−" }, { t: "Indole", r: "−" }, { t: "Motility", r: "+" },
      { t: "H₂S (TSI)", r: "+" }, { t: "Urease", r: "+" }, { t: "Lactose", r: "−" },
      { t: "ODC", r: "+" },
    ],
  },
  {
    id: "proteus_vulgaris", group: "enterobacterales", name: "Proteus vulgaris",
    biochem: [
      { t: "Oxidase", r: "−" }, { t: "Indole", r: "+" }, { t: "Motility", r: "+" },
      { t: "H₂S (TSI)", r: "+" }, { t: "Urease", r: "+" },
    ],
  },
  {
    id: "morganella_morganii", group: "enterobacterales", name: "Morganella morganii",
    biochem: [
      { t: "Oxidase", r: "−" }, { t: "Indole", r: "+" }, { t: "Motility", r: "+" },
      { t: "Urease", r: "+" }, { t: "ODC", r: "+" }, { t: "Lactose", r: "−" },
    ],
  },
  {
    id: "citrobacter_freundii", group: "enterobacterales", name: "Citrobacter freundii",
    biochem: [
      { t: "Oxidase", r: "−" }, { t: "Indole", r: "−" }, { t: "Motility", r: "+" },
      { t: "Urease", r: "V" }, { t: "Citrate", r: "+" }, { t: "Lactose", r: "+" },
      { t: "Malonate", r: "−" },
    ],
  },
  {
    id: "hafnia_alvei", group: "enterobacterales", name: "Hafnia alvei",
    biochem: [
      { t: "Oxidase", r: "−" }, { t: "Indole", r: "−" }, { t: "Motility", r: "+" },
      { t: "Urease", r: "−" }, { t: "Citrate", r: "−" }, { t: "Lactose", r: "−" },
      { t: "VP", r: "+" }, { t: "LDC", r: "+" },
    ],
  },
  // ── NFB ──
  {
    id: "pseudomonas_aeruginosa", group: "nfb", name: "Pseudomonas aeruginosa",
    biochem: [
      { t: "Oxidase", r: "+" }, { t: "Pyocyanin", r: "+" }, { t: "Glucose", r: "+" },
      { t: "Nitrate", r: "+" }, { t: "Growth42c", r: "+" },
    ],
  },
  {
    id: "pseudomonas_fluorescens", group: "nfb", name: "Pseudomonas fluorescens",
    biochem: [
      { t: "Oxidase", r: "+" }, { t: "Pyocyanin", r: "−" }, { t: "Glucose", r: "+" },
      { t: "Nitrate", r: "−" }, { t: "Growth42c", r: "−" },
    ],
  },
  {
    id: "acinetobacter_baumannii", group: "nfb", name: "Acinetobacter baumannii",
    biochem: [
      { t: "Oxidase", r: "−" }, { t: "Glucose", r: "+" }, { t: "Nitrate", r: "−" },
    ],
  },
  // ── Vibrio ──
  {
    id: "vibrio_cholerae", group: "vibrio", name: "Vibrio cholerae",
    biochem: [
      { t: "Oxidase", r: "+" }, { t: "Indole", r: "+" }, { t: "Sucrose", r: "+" },
      { t: "Salt0", r: "+" }, { t: "Salt6", r: "+" }, { t: "O129", r: "+" },
      { t: "LDC", r: "+" }, { t: "ODC", r: "+" },
    ],
  },
  {
    id: "vibrio_parahaemolyticus", group: "vibrio", name: "Vibrio parahaemolyticus",
    biochem: [
      { t: "Oxidase", r: "+" }, { t: "Indole", r: "+" }, { t: "Sucrose", r: "−" },
      { t: "Salt0", r: "−" }, { t: "Salt6", r: "+" }, { t: "O129", r: "−" },
    ],
  },
  {
    id: "vibrio_vulnificus", group: "vibrio", name: "Vibrio vulnificus",
    biochem: [
      { t: "Oxidase", r: "+" }, { t: "Indole", r: "+" }, { t: "Sucrose", r: "−" },
      { t: "Salt0", r: "−" }, { t: "Salt6", r: "+" },
    ],
  },
  // ── GPC cluster (Staph) ──
  {
    id: "s_aureus", group: "gpc_cluster", name: "Staphylococcus aureus",
    biochem: [
      { t: "Coagulase", r: "+" }, { t: "Catalase", r: "+" }, { t: "DNase", r: "+" },
      { t: "Novobiocin", r: "−" }, { t: "Mannitol", r: "+" }, { t: "Hemolysis", r: "+" },
    ],
  },
  {
    id: "s_epidermidis", group: "gpc_cluster", name: "Staphylococcus epidermidis",
    biochem: [
      { t: "Coagulase", r: "−" }, { t: "Catalase", r: "+" }, { t: "DNase", r: "−" },
      { t: "Novobiocin", r: "−" }, { t: "Mannitol", r: "−" }, { t: "Urease", r: "+" },
    ],
  },
  {
    id: "s_saprophyticus", group: "gpc_cluster", name: "Staphylococcus saprophyticus",
    biochem: [
      { t: "Coagulase", r: "−" }, { t: "Catalase", r: "+" }, { t: "DNase", r: "−" },
      { t: "Novobiocin", r: "+" }, { t: "Urease", r: "+" }, { t: "Mannitol", r: "V" },
    ],
  },
  {
    id: "s_lugdunensis", group: "gpc_cluster", name: "Staphylococcus lugdunensis",
    biochem: [
      { t: "Coagulase", r: "−" }, { t: "Catalase", r: "+" }, { t: "Novobiocin", r: "−" },
    ],
  },
  {
    id: "s_haemolyticus", group: "gpc_cluster", name: "Staphylococcus haemolyticus",
    biochem: [
      { t: "Coagulase", r: "−" }, { t: "Catalase", r: "+" }, { t: "Novobiocin", r: "−" },
      { t: "Mannitol", r: "V" },
    ],
  },
  // ── Neisseria (gn_coccobacilli) ──
  {
    id: "n_gonorrhoeae", group: "gn_coccobacilli", name: "Neisseria gonorrhoeae",
    biochem: [
      { t: "Glucose", r: "+" }, { t: "Maltose", r: "−" }, { t: "Lactose", r: "−" }, { t: "Sucrose", r: "−" },
    ],
  },
  {
    id: "n_meningitidis", group: "gn_coccobacilli", name: "Neisseria meningitidis",
    biochem: [
      { t: "Glucose", r: "+" }, { t: "Maltose", r: "+" }, { t: "Lactose", r: "−" }, { t: "Sucrose", r: "−" },
    ],
  },
  {
    id: "neisseria_lactamica", group: "gn_coccobacilli", name: "Neisseria lactamica",
    biochem: [
      { t: "Glucose", r: "+" }, { t: "Maltose", r: "+" }, { t: "Lactose", r: "+" }, { t: "Sucrose", r: "−" },
    ],
  },
  // ── Burkholderia (NFB) ──
  {
    id: "b_pseudomallei", group: "nfb", name: "Burkholderia pseudomallei",
    biochem: [
      { t: "Oxidase", r: "+" }, { t: "Glucose", r: "+" }, { t: "Maltose", r: "+" },
      { t: "Mannitol", r: "+" }, { t: "Motility", r: "+" }, { t: "Arabinose", r: "−" },
    ],
  },
  {
    id: "burkholderia_thailandensis", group: "nfb", name: "Burkholderia thailandensis",
    biochem: [
      { t: "Oxidase", r: "+" }, { t: "Glucose", r: "+" }, { t: "Mannitol", r: "+" },
      { t: "Arabinose", r: "+" }, { t: "Motility", r: "+" },
    ],
  },
];

// --- Test infrastructure constants ---
const HARD_EXCLUSION_TESTS = ["oxidase", "catalase", "coagulase"];
const SUITES = {
  enterobacterales: { tests: new Array(10).fill(0) },
  nfb: { tests: new Array(8).fill(0) },
  vibrio: { tests: new Array(8).fill(0) },
  gpc_cluster: { tests: new Array(6).fill(0) },
  gn_coccobacilli: { tests: new Array(6).fill(0) },
};

const MCM_TEST_MAP = {
  indole: "indole_production",
  indoleent: "indole_production",
  vp: "voges_proskauer",
  motility: "motility",
  motile: "motility",
  ldc: "lysine_decarboxylase",
  odc: "ornithine_decarboxylase",
  kcn: "kcn_growth",
  gasfromglucose: "glucose_gas",
  adonitol: "adonitol",
  arabinose: "arabinose",
  cellobiose: "cellobiose",
  dulcitol: "dulcitol",
  lactose: "lactose",
  sucrose: "sucrose",
  mannitol: "mannitol_d",
  raffinose: "raffinose",
  rhamnose: "rhamnose_l",
  sorbitol: "sorbitol_d",
  xylose: "xylose_d",
  h2s: "h2s",
  h2stsi: "h2s",
  urease: "urea",
  urea: "urea",
  malonate: "malonate",
  onpg: "onpg",
  maltose: "maltose",
  trehalose: "trehalose",
  inositol: "inositol_myo",
  melibiose: "melibiose",
  citrate: null,
  // Vibrio / NFB / Staph extensions
  arginine: "arginine_dihydrolase",
  adh: "arginine_dihydrolase",
  oxidase: "oxidase",
  pyocyanin: "pyocyanin",
  pyoverdin: "pyoverdin",
  growth42c: "growth_42c",
  cetrimide: "cetrimide_growth",
  nitrate: "nitrate_reduction",
  nitratereduction: "nitrate_reduction",
  coagulase: "coagulase",
  catalase: "catalase",
  novobiocin: "novobiocin",
  hemolysis: "hemolysis",
  pyr: "pyr",
  camp: "camp",
  hippurate: "hippurate",
  bacitracin: "bacitracin",
  salt0: "salt_0pct",
  salt6: "salt_6pct",
  o129: "o129_susceptibility",
  glucose: "glucose_acid",
  fructose: "fructose_acid",
  citrate: "citrate",
  polysaccharide: "polysaccharide_from_suc",
};

// --- Algorithm implementation (mirrors index.html) ---
function testMatch(dbResult, userAnswer) {
  const normR = String(dbResult).replace(/−/g, "-").toLowerCase().trim();
  const normAns = String(userAnswer).replace(/−/g, "-").toLowerCase().trim();
  if (normR === normAns) return true;
  if (normR === "v" || normR.includes("+/-") || normR.includes("-/+")) return null;
  const rSign = normR.replace(/[^+\-]/g, "").charAt(0);
  const aSign = normAns.replace(/[^+\-]/g, "").charAt(0);
  if (rSign && aSign) return rSign === aSign;
  return false;
}

function getKeyTestsForBug(bug) {
  return (bug.biochem || []).filter(b => b.n && /^KEY/i.test(b.n));
}

function mcmLikelihood(pct, ans) {
  const p = Math.max(0, Math.min(100, pct)) / 100;
  const a = String(ans).replace(/−/g, "-").trim().toLowerCase();
  if (a === "+" || a.startsWith("+")) return p;
  if (a === "-" || a.startsWith("-")) return 1 - p;
  if (a === "v" || a.includes("variable")) return 0.5;
  return null;
}

function calcProbabilityBayes(group, answers) {
  const candidates = LIBRARY.filter(b => b.group === group);
  const answerEntries = Object.entries(answers).filter(([, v]) => v != null && v !== "");
  const EPS = 0.02;

  const results = candidates.map(bug => {
    const mcm = MCM_DATA[bug.id];
    const tests = bug.biochem || [];
    const keyTestsForBug = getKeyTestsForBug(bug);
    let hardExcluded = false;
    let keyMatch = 0, keyMismatch = 0;

    for (const [ansKey, ans] of answerEntries) {
      const cleanKey = ansKey.toLowerCase().replace(/[^a-z0-9]/g, "");
      const isHard = HARD_EXCLUSION_TESTS.some(k => {
        const kk = k.replace(/[^a-z0-9]/g, "");
        return cleanKey === kk || cleanKey.includes(kk) || kk.includes(cleanKey);
      });
      if (!isHard) continue;
      const testDef = tests.find(b => {
        const bk = b.t.toLowerCase().replace(/[^a-z0-9]/g, "");
        return bk === cleanKey || cleanKey.includes(bk) || bk.includes(cleanKey);
      });
      if (testDef && testMatch(testDef.r, ans) === false) {
        hardExcluded = true;
        break;
      }
    }

    let logLik = 0;
    let usedMcmTests = 0;

    for (const [ansKey, ans] of answerEntries) {
      const cleanKey = ansKey.toLowerCase().replace(/[^a-z0-9]/g, "");
      const mcmTestId = MCM_TEST_MAP[cleanKey] || MCM_TEST_MAP[ansKey.toLowerCase()];
      if (mcm && mcmTestId && mcm.tests && mcm.tests[mcmTestId] != null) {
        const pct = mcm.tests[mcmTestId];
        const lik = mcmLikelihood(pct, ans);
        if (lik != null) {
          const smoothed = Math.max(EPS, Math.min(1 - EPS, lik));
          logLik += Math.log(smoothed);
          usedMcmTests++;
          continue;
        }
      }

      const testDef = tests.find(b => {
        const bk = b.t.toLowerCase().replace(/[^a-z0-9]/g, "");
        return bk === cleanKey || cleanKey.includes(bk) || bk.includes(cleanKey);
      });
      let usedFallback = false;
      if (testDef) {
        const r = testDef.r.replace(/−/g, "-").toLowerCase();
        let estPct = null;
        if (r === "+") estPct = 90;
        else if (r === "-") estPct = 10;
        else if (r === "v" || r.includes("+/-") || r.includes("-/+")) estPct = 50;
        if (estPct != null) {
          const lik = mcmLikelihood(estPct, ans);
          if (lik != null) {
            const smoothed = Math.max(EPS, Math.min(1 - EPS, lik));
            logLik += Math.log(smoothed) * 0.7;
            usedFallback = true;
          }
        }
      }
      // No data anywhere → uninformative prior (0.5 likelihood = neutral)
      // Adds log(0.5) ≈ -0.693 ensuring species with rich matching data win
      if (!usedFallback) {
        logLik += Math.log(0.5);
      }
    }

    const PRIOR_MAP = { 0: 0.05, 1: 0.10, 2: 0.20, 3: 0.40, 4: 1.0 };
    const priorScore = (mcm && typeof mcm.prevalence_score === "number") ? mcm.prevalence_score : 2;
    const prior = PRIOR_MAP[priorScore] || 0.20;
    const logPosterior = logLik + Math.log(prior);

    return { bug, logPosterior, hardExcluded, usedMcmTests, mcmAvailable: !!mcm };
  });

  const maxLp = Math.max(...results.map(r => r.hardExcluded ? -Infinity : r.logPosterior));
  const weights = results.map(r => r.hardExcluded ? 0 : Math.exp(r.logPosterior - maxLp));
  const totalW = weights.reduce((s, w) => s + w, 0) || 1;

  const nAnswered = answerEntries.length;
  const SUITE_SIZE = (SUITES[group]?.tests?.length) || 8;
  // Softer coverage: 1 test → 0.55, 5 tests → 0.87, 10 tests → 1.0
  const coverageFactor = Math.min(1, 0.50 + 0.50 * (Math.log2(nAnswered + 1) / Math.log2(SUITE_SIZE + 1)));

  const ranked = results.map((r, i) => {
    let pct;
    if (r.hardExcluded) pct = 0;
    else pct = Math.round((weights[i] / totalW) * 100 * coverageFactor);
    return {
      ...r.bug,
      pct: Math.max(0, Math.min(99, pct)),
      _excluded: r.hardExcluded,
      _mcm: r.mcmAvailable,
      _usedMcmTests: r.usedMcmTests,
    };
  }).sort((a, b) => {
    if (b.pct !== a.pct) return b.pct - a.pct;
    if ((b._usedMcmTests || 0) !== (a._usedMcmTests || 0))
      return (b._usedMcmTests || 0) - (a._usedMcmTests || 0);
    return 0;
  });

  if (ranked.length > 0) {
    const top = ranked[0];
    const second = ranked.find((r, i) => i > 0 && !r._excluded) || { pct: 0 };
    const gap = top.pct - second.pct;
    let level = 'low';
    if (top.pct >= 70 && gap >= 25 && nAnswered >= 3) level = 'high';
    else if (top.pct >= 50 || gap >= 10) level = 'medium';
    else if (top.pct < 25) level = 'very_low';
    ranked[0]._confidence = level;
    ranked[0]._gap = gap;
  }

  return ranked;
}

// --- Test scenarios ---
const SCENARIOS = [
  {
    name: "Classic E. coli (5 tests)",
    answers: { Indole: "+", Citrate: "−", Urease: "−", Motility: "+", Lactose: "+" },
    expected: { topId: "e_coli", minPct: 70 },
  },
  {
    name: "E. coli textbook complete (10 tests)",
    answers: {
      Oxidase: "−", Indole: "+", VP: "−", Motility: "+",
      LDC: "+", Lactose: "+", Sucrose: "−", Mannitol: "+",
      Sorbitol: "+", Adonitol: "−",
    },
    expected: { topId: "e_coli", minPct: 80 },
  },
  {
    name: "K. pneumoniae mucoid (Indole−, VP+, Citrate+, Urease+, Non-motile)",
    answers: {
      Oxidase: "−", Indole: "−", VP: "+", Motility: "−",
      Urease: "+", Lactose: "+", Sucrose: "+",
    },
    expected: { topId: "klebsiella_pneumoniae", minPct: 70 },
  },
  {
    name: "K. oxytoca (like K. pneumo but Indole+)",
    answers: {
      Oxidase: "−", Indole: "+", VP: "+", Motility: "−",
      Urease: "+", Lactose: "+",
    },
    expected: { topId: "klebsiella_oxytoca", minPct: 50 },
  },
  {
    name: "Proteus mirabilis (H2S+, Urease+, Indole−, Motile)",
    answers: {
      Oxidase: "−", Indole: "−", H2S: "+", Urease: "+",
      Motility: "+", Lactose: "−",
    },
    expected: { topId: "proteus_mirabilis", minPct: 50 },
  },
  {
    name: "Single test indole+ (should rank E. coli first via prior)",
    answers: { Indole: "+" },
    expected: { topId: "e_coli", minPct: 20 },
  },
  {
    name: "Empty answers (priors only — E.coli wins)",
    answers: {},
    expected: { topId: "e_coli", minPct: 0 },
  },
  // ── Pseudomonas / NFB ──
  {
    name: "P. aeruginosa (Oxidase+, Pyocyanin+, 42°C+, Nitrate+)",
    group: "nfb",
    answers: { Oxidase: "+", Pyocyanin: "+", Growth42c: "+", Nitrate: "+", Glucose: "+" },
    expected: { topId: "pseudomonas_aeruginosa", minPct: 60 },
  },
  // ── Vibrio ──
  {
    name: "V. cholerae (Oxidase+, Sucrose+, Salt 0%+, O/129+)",
    group: "vibrio",
    answers: { Oxidase: "+", Sucrose: "+", Salt0: "+", O129: "+", Indole: "+" },
    expected: { topId: "vibrio_cholerae", minPct: 50 },
  },
  // ── Staphylococcus ──
  {
    name: "S. aureus (Coagulase+, DNase+, Mannitol+, Catalase+)",
    group: "gpc_cluster",
    answers: { Coagulase: "+", DNase: "+", Mannitol: "+", Catalase: "+", Novobiocin: "−" },
    expected: { topId: "s_aureus", minPct: 70 },
  },
  {
    name: "S. saprophyticus (Coag−, Novobiocin-resistant, Urease+)",
    group: "gpc_cluster",
    answers: { Coagulase: "−", Novobiocin: "+", Urease: "+", Catalase: "+" },
    expected: { topId: "s_saprophyticus", minPct: 50 },
  },
  // ── Neisseria ──
  {
    name: "N. gonorrhoeae (Glucose+, Maltose−, Lactose−)",
    group: "gn_coccobacilli",
    answers: { Glucose: "+", Maltose: "−", Lactose: "−", Sucrose: "−" },
    expected: { topId: "n_gonorrhoeae", minPct: 60 },
  },
  {
    name: "N. meningitidis (Glucose+, Maltose+, Lactose−)",
    group: "gn_coccobacilli",
    answers: { Glucose: "+", Maltose: "+", Lactose: "−", Sucrose: "−" },
    expected: { topId: "n_meningitidis", minPct: 50 },
  },
  // ── Burkholderia (Thailand-specific clinical relevance) ──
  {
    name: "B. pseudomallei (Oxidase+, Glucose+, Mannitol+, Arabinose−)",
    group: "nfb",
    answers: { Oxidase: "+", Glucose: "+", Mannitol: "+", Arabinose: "−", Motility: "+" },
    expected: { topId: "b_pseudomallei", minPct: 50 },
  },
];

function runTests() {
  console.log("\n══════════════════════════════════════════════════════════════");
  console.log("  MCM Bayesian Algorithm — Validation Suite");
  console.log("══════════════════════════════════════════════════════════════\n");

  let passed = 0, failed = 0;

  for (const scenario of SCENARIOS) {
    const group = scenario.group || "enterobacterales";
    const results = calcProbabilityBayes(group, scenario.answers);
    const top = results[0];
    const top3 = results.slice(0, 3);

    const passTop = top.id === scenario.expected.topId;
    const passPct = top.pct >= scenario.expected.minPct;
    const ok = passTop && passPct;

    console.log(`▸ ${scenario.name}`);
    console.log(`  Expected: top=${scenario.expected.topId}, pct≥${scenario.expected.minPct}`);
    console.log(`  Top 3:`);
    for (const r of top3) {
      const flag = r._mcm ? `[MCM ${r._usedMcmTests}t]` : "[legacy]";
      console.log(`    ${r.id.padEnd(30)} ${String(r.pct).padStart(3)}%  ${flag}`);
    }
    console.log(`  Result: ${ok ? "✅ PASS" : "❌ FAIL"} ` +
                `(top=${top.id}, ${top.pct}%${passTop ? "" : " — wrong species"}${passPct ? "" : " — pct too low"})`);
    console.log();
    if (ok) passed++; else failed++;
  }

  console.log("══════════════════════════════════════════════════════════════");
  console.log(`  ${passed}/${SCENARIOS.length} passed, ${failed} failed`);
  console.log("══════════════════════════════════════════════════════════════\n");
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
