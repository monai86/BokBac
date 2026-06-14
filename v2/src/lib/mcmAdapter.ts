// Maps user-facing biochemical test ids to MCM canonical test ids
// (ported from index.html v3.1.0 — MCM_TEST_MAP).

export const MCM_TEST_MAP: Record<string, string | null> = {
  indole: 'indole_production',
  indoleent: 'indole_production',
  vp: 'voges_proskauer',
  vpimvic: 'voges_proskauer',
  vpvogesproskauer: 'voges_proskauer',
  motility: 'motility',
  motile: 'motility',
  ldc: 'lysine_decarboxylase',
  ldclysinedecarboxylase: 'lysine_decarboxylase',
  lysine: 'lysine_decarboxylase',
  odc: 'ornithine_decarboxylase',
  odcornithinedecarboxylase: 'ornithine_decarboxylase',
  ornithine: 'ornithine_decarboxylase',
  kcn: 'kcn_growth',
  gasfromglucose: 'glucose_gas',
  gas: 'glucose_gas',
  adonitol: 'adonitol',
  arabinose: 'arabinose',
  cellobiose: 'cellobiose',
  dulcitol: 'dulcitol',
  lactose: 'lactose',
  sucrose: 'sucrose',
  mannitol: 'mannitol_d',
  raffinose: 'raffinose',
  rhamnose: 'rhamnose_l',
  sorbitol: 'sorbitol_d',
  xylose: 'xylose_d',
  h2s: 'h2s',
  h2stsi: 'h2s',
  urease: 'urea',
  urea: 'urea',
  malonate: 'malonate',
  onpg: 'onpg',
  maltose: 'maltose',
  trehalose: 'trehalose',
  inositol: 'inositol_myo',
  melibiose: 'melibiose',

  // Vibrio / NFB
  argininedihydrolase: 'arginine_dihydrolase',
  adh: 'arginine_dihydrolase',
  arginine: 'arginine_dihydrolase',
  salicin: 'salicin',
  o129: 'o129_susceptibility',
  o129susceptibility: 'o129_susceptibility',
  nacl0: 'salt_0pct',
  nacl0pct: 'salt_0pct',
  '0nacl': 'salt_0pct',
  nacl6: 'salt_6pct',
  nacl6pct: 'salt_6pct',
  '6nacl': 'salt_6pct',
  '65nacl': 'salt_6pct',
  gelatin: 'gelatin_hydrolysis',
  gelatinhydrolysis: 'gelatin_hydrolysis',

  // Pseudomonas
  oxidase: 'oxidase',
  pyocyanin: 'pyocyanin',
  pyoverdin: 'pyoverdin',
  kingp: 'pyocyanin',
  kingf: 'pyoverdin',
  growth42: 'growth_42c',
  growth42c: 'growth_42c',
  growthmacconkey: 'macconkey_growth',
  '42c': 'growth_42c',
  cetrimide: 'cetrimide_growth',
  nitrate: 'nitrate_reduction',
  nitratereduction: 'nitrate_reduction',
  acetamide: 'acetamide',
  esculin: 'esculin',
  starch: 'starch_hydrolysis',
  starchhydrolysis: 'starch_hydrolysis',
  glucose: 'glucose_acid',
  glucoseof: 'glucose_acid',
  fructose: 'fructose_acid',
  simmonscitrate: 'citrate_simmons',

  // Staphylococcus
  coagulase: 'coagulase',
  catalase: 'catalase',
  catalasecluster: 'catalase',
  novobiocin: 'novobiocin',
  novobiocinresistance: 'novobiocin',
  dnase: 'dnase',
  hemolysis: 'hemolysis',
  clumping: 'clumping_factor',
  clumpingfactor: 'clumping_factor',
  mannose: 'mannose_d',

  // Streptococcus
  pyr: 'pyr',
  camp: 'camp',
  camptest: 'camp',
  hippurate: 'hippurate',
  hippuratehydrolysis: 'hippurate',
  bacitracin: 'bacitracin',
  optochin: null,

  // Generic
  citrate: 'citrate',
  polysaccharide: 'polysaccharide_from_suc',
  polysaccharidefromsuc: 'polysaccharide_from_suc',
}

/**
 * Convert a "+", "-", "V", "S", or "R" answer to P(observation | bug) using bug's % positivity.
 * Returns probability of observing this answer given this bug (0..1), or null if unknown.
 */
export function mcmLikelihood(
  pct: number,
  ans: string,
  meaning?: 'percent_resistant' | 'percent_susceptible'
): number | null {
  const p = Math.max(0, Math.min(100, pct)) / 100
  const a = String(ans).trim().toLowerCase()

  // Handle susceptibility results if we have the meaning
  if (meaning) {
    const isS = a.startsWith('s')
    const isR = a.startsWith('r')
    if (isS || isR) {
      if (meaning === 'percent_resistant') {
        return isR ? p : 1 - p
      } else {
        return isS ? p : 1 - p
      }
    }
  }

  const cleanAns = a.replace(/−/g, '-').toLowerCase()
  if (cleanAns === '+' || cleanAns.startsWith('+')) return p
  if (cleanAns === '-' || cleanAns.startsWith('-')) return 1 - p
  if (cleanAns === 'v' || cleanAns.includes('variable') || cleanAns.includes('+/-') || cleanAns.includes('-/+')) return 0.5
  return null
}

export function lookupMcmTest(answerKey: string): string | null | undefined {
  const cleanKey = answerKey.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (cleanKey in MCM_TEST_MAP) return MCM_TEST_MAP[cleanKey]
  const lower = answerKey.toLowerCase()
  if (lower in MCM_TEST_MAP) return MCM_TEST_MAP[lower]
  return undefined
}

/** Prevalence_score → log-prior weight. ++++ → 1.0, +++ → 0.4, ++ → 0.2, + → 0.1, none → 0.05 */
export const PRIOR_MAP: Record<number, number> = {
  0: 0.05,
  1: 0.1,
  2: 0.2,
  3: 0.4,
  4: 1.0,
}
