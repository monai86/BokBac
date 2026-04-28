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
  // ── Yersinia (enterobacterales) ──
  {
    id: "yersinia_enterocolitica", group: "enterobacterales", name: "Yersinia enterocolitica",
    biochem: [
      { t: "Motility", r: "+" }, { t: "Urease", r: "+" }, { t: "VP", r: "+" },
      { t: "Indole", r: "−" }, { t: "Sucrose", r: "−" },
    ],
  },
  {
    id: "yersinia_pestis", group: "enterobacterales", name: "Yersinia pestis",
    biochem: [
      { t: "Motility", r: "−" }, { t: "Urease", r: "−" }, { t: "Indole", r: "−" },
    ],
  },
  // ── Aeromonas (vibrio-like) ──
  {
    id: "aeromonas_hydrophila", group: "vibrio", name: "Aeromonas hydrophila",
    biochem: [
      { t: "Oxidase", r: "+" }, { t: "Indole", r: "+" }, { t: "VP", r: "+" },
      { t: "Glucose", r: "+" }, { t: "Mannitol", r: "+" },
    ],
  },
  // ── Listeria (gpc_cluster) ──
  {
    id: "listeria_monocytogenes", group: "gpc_cluster", name: "Listeria monocytogenes",
    biochem: [
      { t: "Catalase", r: "+" }, { t: "Hemolysis", r: "+" },
      { t: "Motility", r: "+" }, { t: "CAMP", r: "+" },
    ],
  },
  // ── Serratia (enterobacterales) ──
  {
    id: "serratia_marcescens", group: "enterobacterales", name: "Serratia marcescens",
    biochem: [
      { t: "Indole", r: "−" }, { t: "VP", r: "+" }, { t: "Gelatin", r: "+" },
      { t: "Motility", r: "+" }, { t: "Sorbitol", r: "+" },
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
  // ── Enterobacter (enterobacterales) ──
  { id: "enterobacter_cloacae", group: "enterobacterales", name: "Enterobacter cloacae",
    biochem: [{ t: "Oxidase", r: "−" }, { t: "Indole", r: "−" }, { t: "VP", r: "+" }, { t: "Motility", r: "+" }, { t: "ODC", r: "+" }, { t: "LDC", r: "−" }, { t: "Lactose", r: "+" }] },
  { id: "enterobacter_aerogenes", group: "enterobacterales", name: "Enterobacter aerogenes",
    biochem: [{ t: "Oxidase", r: "−" }, { t: "Indole", r: "−" }, { t: "VP", r: "+" }, { t: "Motility", r: "+" }, { t: "ODC", r: "+" }, { t: "LDC", r: "+" }, { t: "Adonitol", r: "+" }] },
  // ── Providencia (enterobacterales) ──
  { id: "providencia_rettgeri", group: "enterobacterales", name: "Providencia rettgeri",
    biochem: [{ t: "Oxidase", r: "−" }, { t: "Indole", r: "+" }, { t: "Urease", r: "+" }, { t: "Motility", r: "+" }, { t: "Lactose", r: "−" }, { t: "Adonitol", r: "+" }] },
  { id: "providencia_stuartii", group: "enterobacterales", name: "Providencia stuartii",
    biochem: [{ t: "Oxidase", r: "−" }, { t: "Indole", r: "+" }, { t: "Urease", r: "V" }, { t: "Motility", r: "+" }, { t: "Lactose", r: "−" }] },
  // ── Pseudomonas additional (nfb) ──
  { id: "pseudomonas_stutzeri", group: "nfb", name: "Pseudomonas stutzeri",
    biochem: [{ t: "Oxidase", r: "+" }, { t: "Pyocyanin", r: "−" }, { t: "Glucose", r: "+" }, { t: "Nitrate", r: "+" }, { t: "Growth42c", r: "V" }, { t: "Maltose", r: "+" }] },
  { id: "pseudomonas_putida", group: "nfb", name: "Pseudomonas putida",
    biochem: [{ t: "Oxidase", r: "+" }, { t: "Pyocyanin", r: "−" }, { t: "Glucose", r: "+" }, { t: "Nitrate", r: "−" }, { t: "Growth42c", r: "−" }] },
  // ── Vibrio additional ──
  { id: "vibrio_alginolyticus", group: "vibrio", name: "Vibrio alginolyticus",
    biochem: [{ t: "Oxidase", r: "+" }, { t: "Indole", r: "+" }, { t: "VP", r: "+" }, { t: "Sucrose", r: "+" }, { t: "Salt0", r: "−" }, { t: "Salt6", r: "+" }] },
  { id: "vibrio_mimicus", group: "vibrio", name: "Vibrio mimicus",
    biochem: [{ t: "Oxidase", r: "+" }, { t: "Indole", r: "+" }, { t: "VP", r: "−" }, { t: "Sucrose", r: "−" }, { t: "Salt0", r: "+" }, { t: "O129", r: "+" }] },
  { id: "plesiomonas_shigelloides", group: "vibrio", name: "Plesiomonas shigelloides",
    biochem: [{ t: "Oxidase", r: "+" }, { t: "Indole", r: "+" }, { t: "Sucrose", r: "−" }, { t: "Salt0", r: "+" }, { t: "O129", r: "+" }, { t: "Inositol", r: "+" }] },
  { id: "aeromonas_caviae", group: "vibrio", name: "Aeromonas caviae",
    biochem: [{ t: "Oxidase", r: "+" }, { t: "Indole", r: "+" }, { t: "VP", r: "−" }, { t: "Sucrose", r: "+" }, { t: "Glucose", r: "+" }] },
  // ── Neisseria additional (gn_coccobacilli) ──
  { id: "neisseria_sicca", group: "gn_coccobacilli", name: "Neisseria sicca",
    biochem: [{ t: "Glucose", r: "+" }, { t: "Maltose", r: "+" }, { t: "Sucrose", r: "+" }, { t: "Fructose", r: "+" }] },
  { id: "neisseria_mucosa", group: "gn_coccobacilli", name: "Neisseria mucosa",
    biochem: [{ t: "Glucose", r: "+" }, { t: "Maltose", r: "+" }, { t: "Sucrose", r: "+" }, { t: "Fructose", r: "+" }, { t: "Nitrate", r: "+" }] },
  // ── GPC chain (Streptococcus/Enterococcus) ──
  { id: "s_pyogenes", group: "gpc_chain", name: "Streptococcus pyogenes",
    biochem: [{ t: "Bacitracin", r: "+" }, { t: "PYR", r: "+" }, { t: "CAMP", r: "−" }, { t: "Hippurate", r: "−" }] },
  { id: "s_agalactiae", group: "gpc_chain", name: "Streptococcus agalactiae",
    biochem: [{ t: "Bacitracin", r: "−" }, { t: "PYR", r: "−" }, { t: "CAMP", r: "+" }, { t: "Hippurate", r: "+" }] },
  { id: "enterococcus_faecalis", group: "gpc_chain", name: "Enterococcus faecalis",
    biochem: [{ t: "PYR", r: "+" }, { t: "VP", r: "+" }, { t: "Sorbitol", r: "+" }, { t: "Bacitracin", r: "−" }] },
  { id: "enterococcus_faecium", group: "gpc_chain", name: "Enterococcus faecium",
    biochem: [{ t: "PYR", r: "+" }, { t: "VP", r: "+" }, { t: "Sorbitol", r: "−" }, { t: "Bacitracin", r: "−" }] },
];

// --- Test infrastructure constants ---
const HARD_EXCLUSION_TESTS = ["oxidase", "catalase", "coagulase"];
const SUITES = {
  enterobacterales: { tests: new Array(10).fill(0) },
  nfb: { tests: new Array(8).fill(0) },
  vibrio: { tests: new Array(8).fill(0) },
  gpc_cluster: { tests: new Array(6).fill(0) },
  gn_coccobacilli: { tests: new Array(6).fill(0) },
  gpc_chain: { tests: new Array(6).fill(0) },
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
    expected: { topId: "klebsiella_oxytoca", minPct: 40 },
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
    expected: { topId: "e_coli", minPct: 15 },
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
  // ── Extended Enterobacterales ──
  {
    name: "Y. enterocolitica (Motile+, Urease+, VP+, Indole−, Sucrose−, Citrate−)",
    group: "enterobacterales",
    answers: { Motility: "+", Urease: "+", VP: "+", Indole: "−", Sucrose: "−", Citrate: "−", ODC: "+" },
    expected: { topId: "yersinia_enterocolitica", minPct: 30 },
  },
  {
    name: "Serratia marcescens (VP+, Gelatin+, Sorbitol+, Indole−)",
    group: "enterobacterales",
    answers: { Indole: "−", VP: "+", Gelatin: "+", Motility: "+", Sorbitol: "+", LDC: "+", ODC: "+" },
    expected: { topId: "serratia_marcescens", minPct: 20 },
  },
  // ── Aeromonas (O/129 resistant = '+' excludes Vibrio) ──
  {
    name: "A. hydrophila (Oxidase+, VP+, Indole+, O129 resistant, Sucrose+)",
    group: "vibrio",
    answers: { Oxidase: "+", VP: "+", Indole: "+", O129: "+", Sucrose: "+", Arginine: "+" },
    expected: { topId: "aeromonas_hydrophila", minPct: 30 },
  },
  // ── Listeria ──
  {
    name: "L. monocytogenes (Catalase+, Hemolysis+, Motility+, CAMP+)",
    group: "gpc_cluster",
    answers: { Catalase: "+", Hemolysis: "+", Motility: "+", CAMP: "+" },
    expected: { topId: "listeria_monocytogenes", minPct: 40 },
    dk: "GPC → Catalase+ → Hemolysis+ → Motility+ → CAMP+ → L. monocytogenes",
  },
  // ══════════════════════════════════════════════════════════════
  //  EXPANDED SCENARIOS (19–50) — with dichotomous key comparison
  // ══════════════════════════════════════════════════════════════
  // ── Extended Enterobacterales ──
  { name: "P. vulgaris (Indole+, H2S+, Urease+, Maltose+, Trehalose−)",
    answers: { Oxidase: "−", Indole: "+", H2S: "+", Urease: "+", Motility: "+", Lactose: "−", Maltose: "+", Trehalose: "−" },
    expected: { topId: "proteus_vulgaris", minPct: 25 },
    dk: "GNR → Oxidase− → Lactose− → H2S+ → Indole+ → Maltose+ → P. vulgaris" },
  { name: "Morganella morganii (Indole+, Urease+, ODC+, H2S−, Maltose−)",
    answers: { Oxidase: "−", Indole: "+", Urease: "+", Motility: "+", Lactose: "−", ODC: "+", H2S: "−", Maltose: "−", Trehalose: "−" },
    expected: { topId: "morganella_morganii", minPct: 20 },
    dk: "GNR → Oxidase− → Lactose− → H2S− → Indole+ → Urease+ → ODC+ → M. morganii" },
  { name: "C. freundii (Citrate+, H2S V, Lactose+, Indole−)",
    answers: { Oxidase: "−", Indole: "−", Citrate: "+", Motility: "+", Lactose: "+", Malonate: "−" },
    expected: { topId: "citrobacter_freundii", minPct: 20 },
    dk: "GNR → Oxidase− → Lactose+ → Citrate+ → Indole− → Malonate− → C. freundii" },
  { name: "S. sonnei (Non-motile, ODC+, Lactose−, Indole−)",
    answers: { Oxidase: "−", Motility: "−", Lactose: "−", Indole: "−", ODC: "+" },
    expected: { topId: "shigella_sonnei", minPct: 20 },
    dk: "GNR → Oxidase− → Non-motile → Lactose− → ODC+ → S. sonnei" },
  { name: "S. flexneri (Non-motile, Mannitol+, Lactose−, Indole V, ODC−)",
    answers: { Oxidase: "−", Motility: "−", Lactose: "−", Mannitol: "+", LDC: "−", ODC: "−", VP: "−" },
    expected: { topId: "shigella_flexneri", minPct: 10 },
    dk: "GNR → Oxidase− → Non-motile → Lactose− → Mannitol+ → ODC− → S. flexneri" },
  { name: "Salmonella Paratyphi A (Motile, H2S−, LDC−, Lactose−, ODC+, Dulcitol+)",
    answers: { Oxidase: "−", Motility: "+", Indole: "−", Lactose: "−", LDC: "−", ODC: "+", VP: "−", Sucrose: "−" },
    expected: { topId: "salmonella_paratyphi_a", minPct: 10 },
    dk: "GNR → Oxidase− → Lactose− → Motile → H2S− → LDC− → ODC+ → Salmonella Paratyphi A" },
  { name: "Hafnia alvei (VP+, LDC+, ODC+, Indole−, Lactose−, H2S−)",
    answers: { Oxidase: "−", VP: "+", LDC: "+", ODC: "+", Indole: "−", Motility: "+", Lactose: "−", H2S: "−", Urease: "−" },
    expected: { topId: "hafnia_alvei", minPct: 15 },
    dk: "GNR → Oxidase− → Lactose− → VP+ → LDC+ → ODC+ → Indole− → H. alvei" },
  { name: "Enterobacter cloacae (VP+, ODC+, LDC−, Indole−)",
    answers: { Oxidase: "−", VP: "+", Indole: "−", Motility: "+", ODC: "+", LDC: "−", Lactose: "+" },
    expected: { topId: "enterobacter_cloacae", minPct: 20 },
    dk: "GNR → Oxidase− → Lactose+ → VP+ → ODC+ → LDC− → E. cloacae" },
  { name: "Enterobacter aerogenes (VP+, LDC+, ODC+, Adonitol+)",
    answers: { Oxidase: "−", VP: "+", Indole: "−", Motility: "+", LDC: "+", ODC: "+", Adonitol: "+" },
    expected: { topId: "enterobacter_aerogenes", minPct: 20 },
    dk: "GNR → Oxidase− → VP+ → LDC+ → ODC+ → Adonitol+ → E. aerogenes" },
  { name: "Providencia rettgeri (Indole+, Urease+, Adonitol+, H2S−)",
    answers: { Oxidase: "−", Indole: "+", Urease: "+", Lactose: "−", Adonitol: "+" },
    expected: { topId: "providencia_rettgeri", minPct: 20 },
    dk: "GNR → Oxidase− → Lactose− → Indole+ → Urease+ → Adonitol+ → P. rettgeri" },
  // ── Extended NFB ──
  { name: "P. fluorescens (Oxidase+, Pyocyanin−, 42°C−, Nitrate−)",
    group: "nfb",
    answers: { Oxidase: "+", Pyocyanin: "−", Growth42c: "−", Nitrate: "−", Glucose: "+" },
    expected: { topId: "pseudomonas_fluorescens", minPct: 30 },
    dk: "NFB → Oxidase+ → Pyocyanin− → 42°C− → Nitrate− → P. fluorescens" },
  { name: "P. stutzeri (Oxidase+, Nitrate+, Maltose+, Pyocyanin−, Starch+)",
    group: "nfb",
    answers: { Oxidase: "+", Nitrate: "+", Pyocyanin: "−", Maltose: "+", Glucose: "+" },
    expected: { topId: "pseudomonas_stutzeri", minPct: 25 },
    dk: "NFB → Oxidase+ → Pyocyanin− → Nitrate+ → Maltose+ → P. stutzeri" },
  { name: "P. putida (Oxidase+, Nitrate−, 42°C−, Pyocyanin−, Gelatin−)",
    group: "nfb",
    answers: { Oxidase: "+", Pyocyanin: "−", Growth42c: "−", Nitrate: "−", Glucose: "+", Gelatin: "−", Sucrose: "−", Maltose: "+" },
    expected: { topId: "pseudomonas_putida", minPct: 10 },
    dk: "NFB → Oxidase+ → Pyocyanin− → 42°C− → Nitrate− → Gelatin− → P. putida" },
  { name: "A. baumannii (Oxidase−, Glucose+, Non-motile, Pyocyanin−)",
    group: "nfb",
    answers: { Oxidase: "−", Glucose: "+", Nitrate: "−", Motility: "−", Pyocyanin: "−" },
    expected: { topId: "acinetobacter_baumannii", minPct: 25 },
    dk: "NFB → Oxidase− → Glucose+ → Non-motile → A. baumannii" },
  { name: "B. thailandensis (Oxidase+, Arabinose+, Mannitol+, Pyocyanin−)",
    group: "nfb",
    answers: { Oxidase: "+", Glucose: "+", Arabinose: "+", Mannitol: "+", Motility: "+", Pyocyanin: "−", Nitrate: "−", Maltose: "+", Lactose: "+" },
    expected: { topId: "burkholderia_thailandensis", minPct: 15 },
    dk: "NFB → Oxidase+ → Glucose+ → Arabinose+ → Maltose+ → B. thailandensis" },
  // ── Extended Vibrio ──
  { name: "V. parahaemolyticus (Sucrose−, Salt0−, Salt6+, Indole+)",
    group: "vibrio",
    answers: { Oxidase: "+", Indole: "+", Sucrose: "−", Salt0: "−", Salt6: "+", O129: "−" },
    expected: { topId: "vibrio_parahaemolyticus", minPct: 30 },
    dk: "Vibrio → Oxidase+ → Salt0− → Sucrose− → Salt6+ → O129R → V. parahaemolyticus" },
  { name: "V. vulnificus (Lactose+, Cellobiose+, Sucrose−, O129S)",
    group: "vibrio",
    answers: { Oxidase: "+", Indole: "+", Sucrose: "−", Salt0: "−", Salt6: "+", O129: "+", Lactose: "+" },
    expected: { topId: "vibrio_vulnificus", minPct: 30 },
    dk: "Vibrio → Oxidase+ → Salt0− → Sucrose− → Lactose+ → O129S → V. vulnificus" },
  { name: "V. alginolyticus (VP+, Sucrose+, Salt0−, Salt6+, LDC+, Arabinose−)",
    group: "vibrio",
    answers: { Oxidase: "+", VP: "+", Sucrose: "+", Salt0: "−", Salt6: "+", Indole: "+", LDC: "+", Arabinose: "−" },
    expected: { topId: "vibrio_alginolyticus", minPct: 20 },
    dk: "Vibrio → Oxidase+ → Salt0− → Sucrose+ → VP+ → LDC+ → V. alginolyticus" },
  { name: "V. mimicus (Sucrose−, Salt0+, VP−, LDC+, ODC+, Inositol−)",
    group: "vibrio",
    answers: { Oxidase: "+", Indole: "+", Sucrose: "−", Salt0: "+", O129: "+", VP: "−", LDC: "+", ODC: "+", Inositol: "−" },
    expected: { topId: "vibrio_mimicus", minPct: 15 },
    dk: "Vibrio → Oxidase+ → Salt0+ → Sucrose− → LDC+ → Inositol− → V. mimicus" },
  { name: "Plesiomonas shigelloides (Inositol+, O129S, Salt0+)",
    group: "vibrio",
    answers: { Oxidase: "+", Indole: "+", Sucrose: "−", Salt0: "+", O129: "+", Inositol: "+" },
    expected: { topId: "plesiomonas_shigelloides", minPct: 25 },
    dk: "Vibrio → Oxidase+ → Salt0+ → Inositol+ → O129S → P. shigelloides" },
  { name: "A. caviae (VP−, Sucrose+, Oxidase+)",
    group: "vibrio",
    answers: { Oxidase: "+", Indole: "+", VP: "−", Sucrose: "+", Glucose: "+" },
    expected: { topId: "aeromonas_caviae", minPct: 15 },
    dk: "Vibrio → Oxidase+ → Sucrose+ → VP− → A. caviae" },
  // ── Extended GPC cluster ──
  { name: "S. epidermidis (Coag−, Novobiocin S, Urease+, DNase−)",
    group: "gpc_cluster",
    answers: { Coagulase: "−", Catalase: "+", Novobiocin: "−", Urease: "+", DNase: "−", Mannitol: "−" },
    expected: { topId: "s_epidermidis", minPct: 30 },
    dk: "GPC → Catalase+ → Coagulase− → Novobiocin S → S. epidermidis" },
  { name: "S. haemolyticus (Coag−, Hemolysis+, Novobiocin S, Urease−, Trehalose+)",
    group: "gpc_cluster",
    answers: { Coagulase: "−", Catalase: "+", Hemolysis: "+", Novobiocin: "−", Urease: "−", Trehalose: "+", Mannitol: "V" },
    expected: { topId: "s_haemolyticus", minPct: 15 },
    dk: "GPC → Catalase+ → Coagulase− → Novobiocin S → Hemolysis+ → Urease− → S. haemolyticus" },
  { name: "S. lugdunensis (Coag−, Clumping factor+, PYR+)",
    group: "gpc_cluster",
    answers: { Coagulase: "−", Catalase: "+", Novobiocin: "−", Mannitol: "+", Hemolysis: "+" },
    expected: { topId: "s_lugdunensis", minPct: 15 },
    dk: "GPC → Catalase+ → Coagulase− → Clumping factor+ → S. lugdunensis" },
  // ── GPC chain (Streptococcus / Enterococcus) ──
  { name: "S. pyogenes (Bacitracin S, PYR+, CAMP−)",
    group: "gpc_chain",
    answers: { Bacitracin: "+", PYR: "+", CAMP: "−", Hippurate: "−" },
    expected: { topId: "s_pyogenes", minPct: 40 },
    dk: "GPC chain → Beta-hemolytic → Bacitracin S → PYR+ → S. pyogenes (Group A)" },
  { name: "S. agalactiae (CAMP+, Hippurate+, PYR−, Bacitracin R)",
    group: "gpc_chain",
    answers: { CAMP: "+", Hippurate: "+", PYR: "−", Bacitracin: "−" },
    expected: { topId: "s_agalactiae", minPct: 40 },
    dk: "GPC chain → Beta-hemolytic → Bacitracin R → CAMP+ → Hippurate+ → S. agalactiae (Group B)" },
  { name: "E. faecalis (PYR+, VP+, Sorbitol+)",
    group: "gpc_chain",
    answers: { PYR: "+", VP: "+", Sorbitol: "+", Bacitracin: "−" },
    expected: { topId: "enterococcus_faecalis", minPct: 30 },
    dk: "GPC chain → PYR+ → VP+ → Sorbitol+ → E. faecalis" },
  { name: "E. faecium (PYR+, VP+, Sorbitol−)",
    group: "gpc_chain",
    answers: { PYR: "+", VP: "+", Sorbitol: "−", Bacitracin: "−" },
    expected: { topId: "enterococcus_faecium", minPct: 25 },
    dk: "GPC chain → PYR+ → VP+ → Sorbitol− → E. faecium" },
  // ── Extended Neisseria ──
  { name: "N. lactamica (Glucose+, Maltose+, Lactose+, Sucrose−)",
    group: "gn_coccobacilli",
    answers: { Glucose: "+", Maltose: "+", Lactose: "+", Sucrose: "−" },
    expected: { topId: "neisseria_lactamica", minPct: 40 },
    dk: "GN diplococci → Glucose+ → Maltose+ → Lactose+ → N. lactamica" },
  { name: "N. sicca (Glucose+, Maltose+, Sucrose+, Fructose+, Nitrate−)",
    group: "gn_coccobacilli",
    answers: { Glucose: "+", Maltose: "+", Sucrose: "+", Fructose: "+", Nitrate: "−" },
    expected: { topId: "neisseria_sicca", minPct: 25 },
    dk: "GN diplococci → Glucose+ → Maltose+ → Sucrose+ → Fructose+ → Nitrate− → N. sicca" },
  { name: "N. mucosa (Glucose+, Maltose+, Sucrose+, Fructose+, Nitrate+)",
    group: "gn_coccobacilli",
    answers: { Glucose: "+", Maltose: "+", Sucrose: "+", Fructose: "+", Nitrate: "+" },
    expected: { topId: "neisseria_mucosa", minPct: 25 },
    dk: "GN diplococci → Glucose+ → Maltose+ → Sucrose+ → Nitrate+ → N. mucosa" },
  // ── Yersinia pestis (non-motile, urease−) ──
  { name: "Y. pestis (Non-motile, Urease−, Indole−, VP−, Arabinose+)",
    answers: { Oxidase: "−", Motility: "−", Urease: "−", Indole: "−", VP: "−", LDC: "−", ODC: "−", Sucrose: "−", Arabinose: "+", Trehalose: "+" },
    expected: { topId: "yersinia_pestis", minPct: 10 },
    dk: "GNR → Oxidase− → Non-motile → Urease− → VP− → ODC− → Arabinose+ → Y. pestis" },
];

function runTests() {
  console.log("\n══════════════════════════════════════════════════════════════");
  console.log("  MCM Bayesian Algorithm — Expanded Validation Suite v2");
  console.log("  50 scenarios · Dichotomous Key concordance comparison");
  console.log("══════════════════════════════════════════════════════════════\n");

  let passed = 0, failed = 0;
  const groupStats = {};
  const concordance = []; // Bayes vs DK comparison

  for (const scenario of SCENARIOS) {
    const group = scenario.group || "enterobacterales";
    if (!groupStats[group]) groupStats[group] = { pass: 0, fail: 0, total: 0 };
    groupStats[group].total++;

    const results = calcProbabilityBayes(group, scenario.answers);
    const top = results[0];
    const top3 = results.slice(0, 3);

    const passTop = top.id === scenario.expected.topId;
    const passPct = top.pct >= scenario.expected.minPct;
    const ok = passTop && passPct;

    console.log(`▸ ${scenario.name}`);
    console.log(`  Expected: top=${scenario.expected.topId}, pct≥${scenario.expected.minPct}`);
    if (scenario.dk) console.log(`  DK path:  ${scenario.dk}`);
    console.log(`  Top 3:`);
    for (const r of top3) {
      const flag = r._mcm ? `[MCM ${r._usedMcmTests}t]` : "[legacy]";
      console.log(`    ${r.id.padEnd(30)} ${String(r.pct).padStart(3)}%  ${flag}`);
    }
    console.log(`  Result: ${ok ? "✅ PASS" : "❌ FAIL"} ` +
                `(top=${top.id}, ${top.pct}%${passTop ? "" : " — wrong species"}${passPct ? "" : " — pct too low"})`);

    // Track DK concordance
    if (scenario.dk) {
      const bayesId = top.id;
      const dkId = scenario.expected.topId;
      const agree = bayesId === dkId;
      concordance.push({ name: scenario.name, group, bayesId, dkId, agree, pct: top.pct });
    }

    console.log();
    if (ok) { passed++; groupStats[group].pass++; }
    else { failed++; groupStats[group].fail++; }
  }

  // ── Summary ──
  console.log("══════════════════════════════════════════════════════════════");
  console.log(`  OVERALL: ${passed}/${SCENARIOS.length} passed, ${failed} failed`);
  console.log("══════════════════════════════════════════════════════════════\n");

  // ── Group breakdown ──
  console.log("── Per-Group Results ──");
  for (const [g, s] of Object.entries(groupStats)) {
    const pct = Math.round((s.pass / s.total) * 100);
    console.log(`  ${g.padEnd(20)} ${s.pass}/${s.total} (${pct}%)`);
  }

  // ── DK Concordance ──
  const dkTotal = concordance.length;
  const dkAgree = concordance.filter(c => c.agree).length;
  console.log(`\n── Bayes vs Dichotomous Key Concordance ──`);
  console.log(`  Concordant: ${dkAgree}/${dkTotal} (${Math.round((dkAgree / dkTotal) * 100)}%)`);
  if (dkTotal > dkAgree) {
    console.log("  Discordant cases:");
    for (const c of concordance.filter(c => !c.agree)) {
      console.log(`    ❌ ${c.name}: Bayes→${c.bayesId} vs DK→${c.dkId}`);
    }
  }

  console.log("\n══════════════════════════════════════════════════════════════\n");
  process.exit(failed > 0 ? 1 : 0);
}

runTests();

