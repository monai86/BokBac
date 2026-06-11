// Test result matching utilities (ported from index.html v3.1.0).
// Compares a database result symbol (e.g. "+", "−", "V", "γ/α") to a user answer.

import type { BiochemRow, Species, Suite, SuiteTest } from './types'
import { BIOCHEMICAL_TEST_REGISTRY } from '../data/tests/biochemicalTestRegistry'

export function normalizeKey(value: string | number | undefined = ''): string {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[₂]/g, '2')
    .replace(/[₃]/g, '3')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function normalizeSR(val: string): string {
  const v = String(val).toLowerCase().trim()
  if (v.startsWith('s')) return 's'
  if (v.startsWith('r')) return 'r'
  return v
}

export function isSRTest(testName: string): boolean {
  const n = testName.toLowerCase()
  return n.includes('bacitracin') || n.includes('optochin') || n.includes('novobiocin')
}

/**
 * Compare a DB result to a user answer.
 * Returns:
 *   true  → exact match
 *   false → mismatch
 *   null  → variable/partial (don't penalize)
 */
export function testMatch(dbResult: string, userAnswer: string): boolean | null {
  const normR = String(dbResult).replace(/−/g, '-').toLowerCase().trim()
  const normAns = String(userAnswer).replace(/−/g, '-').toLowerCase().trim()

  if (normR === normAns) return true

  const isV =
    normR === 'v' ||
    normR.includes('+/-') ||
    normR.includes('-/+') ||
    normR.includes('v)') ||
    normR === 'γ/α' ||
    normR === 'α/γ'
  if (isV) return null

  const rSign = normR.replace(/[^+-]/g, '').charAt(0)
  const aSign = normAns.replace(/[^+-]/g, '').charAt(0)
  if (rSign && aSign && rSign !== '/' && aSign !== '/') {
    return rSign === aSign
  }

  const rSR = normalizeSR(normR)
  const aSR = normalizeSR(normAns)
  if ((rSR === 's' || rSR === 'r') && (aSR === 's' || aSR === 'r')) {
    return rSR === aSR
  }

  // Hemolysis: α / β / γ — also accept '+' as "any positive hemolysis (β or α)"
  // and '-' as "non-hemolytic (γ)"
  const hemTypes = ['β', 'α', 'γ', 'beta', 'alpha', 'gamma']
  const rHasHem = hemTypes.some((h) => normR.includes(h))
  const aHasHem = hemTypes.some((h) => normAns.includes(h))
  if (rHasHem || aHasHem) {
    const toHem = (v: string) => {
      if (v.includes('β') || v.includes('beta') || v.includes('complete')) return 'β'
      if (v.includes('α') || v.includes('alpha') || v.includes('partial') || v.includes('green')) return 'α'
      if (v.includes('γ') || v.includes('gamma') || v.includes('none')) return 'γ'
      return v
    }
    const rHem = toHem(normR)
    const aHem = toHem(normAns)
    if ((rHem === 'β' || rHem === 'α' || rHem === 'γ') && (aHem === 'β' || aHem === 'α' || aHem === 'γ')) {
      return rHem === aHem
    }
    // '+' from user means hemolytic (β or α); '−' means γ.
    if ((aSign === '+' || aSign === '-') && (rHem === 'β' || rHem === 'α' || rHem === 'γ')) {
      const positiveHem = rHem === 'β' || rHem === 'α'
      return aSign === '+' ? positiveHem : !positiveHem
    }
    if (normR.includes('/')) return normR.includes(aHem)
  }

  return false
}

// Test alias map — copied from index.html
export const TEST_ALIASES: Record<string, string[]> = {
  catalase: ['catalase'],
  catalase_cluster: ['catalase'],
  coagulase: ['coagulase'],
  dnase: ['dnase'],
  oxidase: ['oxidase'],
  hemolysis: ['hemolysis', 'hemolytic'],
  novobiocin: ['novobiocin'],
  bacitracin: ['bacitracin'],
  optochin: ['optochin'],
  bile_solubility: ['bile solubility', 'bile sol'],
  bile_esculin: ['bile esculin', 'esculin bile'],
  pyr: ['pyr', 'pyrrolidonyl'],
  camp: ['camp'],
  hippurate: ['hippurate'],
  '6.5_nacl': ['6.5% nacl', '6.5 nacl', '6 5 nacl', 'salt 6'],
  growth_42: ['growth 42', 'growth42', '42c', '42 c'],
  king_p: ['king p', 'pyocyanin'],
  king_f: ['king f', 'pyoverdin', 'pyoverdine'],
  cetrimide: ['cetrimide'],
  acetamide: ['acetamide'],
  o129: ['o/129', 'o129', 'vibriostatic'],
  string_test: ['string test'],
  indole: ['indole'],
  motility: ['motility', 'motile'],
  vp: ['vp', 'voges-proskauer', 'voges proskauer'],
  citrate: ['citrate', 'simmons citrate'],
  urease: ['urease', 'urea'],
  h2s: ['h2s', 'h₂s'],
  ldc: ['ldc', 'lysine'],
  odc: ['odc', 'ornithine'],
  pdc: ['pdc', 'phenylalanine'],
  adh: ['adh', 'arginine'],
  lactose: ['lactose'],
  sucrose: ['sucrose'],
  mannitol: ['mannitol'],
  sorbitol: ['sorbitol'],
  xylose: ['xylose'],
  glucose: ['glucose'],
  maltose: ['maltose'],
  dulcitol: ['dulcitol'],
  inositol: ['inositol'],
  trehalose: ['trehalose'],
  arabinose: ['arabinose'],
  raffinose: ['raffinose'],
  rhamnose: ['rhamnose'],
  salicin: ['salicin'],
  esculin: ['esculin'],
  gelatin: ['gelatin'],
  starch: ['starch'],
  onpg: ['onpg'],
  nitrate: ['nitrate'],
  n2_gas: ['n2 gas', 'n2 gas from no3', 'n₂ gas from no₃'],
  malonate: ['malonate'],
  kcn: ['kcn'],
  salt_0: ['0% nacl', '0 nacl'],
  salt_1: ['1% nacl', '1 nacl'],
  salt_6: ['6% nacl', '6 nacl'],
  salt_8: ['8% nacl', '8 nacl'],
  salt_10: ['10% nacl', '10 nacl'],
  tcbs: ['tcbs', 'tcbs colony'],
  growth_nutrient: ['growth on nutrient agar', 'nutrient agar'],
  factor_x: ['x factor', 'factor x', 'hemin', 'x required'],
  factor_v: ['v factor', 'factor v', 'nad', 'v required'],
  satellitism: ['satellitism', 'staph streak', 'satellite', 'xv test'],
  growth_chocolate: ['growth on chocolate agar', 'chocolate agar', 'ca growth'],
  fructose: ['fructose', 'cta fructose'],
}

export function isTestMatchByAlias(rowName: string, suiteTest: SuiteTest): boolean {
  const rn = normalizeKey(rowName)
  const sn = normalizeKey(suiteTest.label)
  if (!rn || !sn) return false
  if (rn === sn || rn.includes(sn) || sn.includes(rn)) return true
  const aliases = TEST_ALIASES[suiteTest.id] || []
  return aliases.some((a) => {
    const an = normalizeKey(a)
    return !!an && (rn === an || rn.includes(an) || an.includes(rn))
  })
}

export function getCanonicalBiochemRows(bug: Species, suites: Record<string, Suite>): BiochemRow[] {
  if (!bug) return []
  const suite = suites[bug.group]
  const rows = bug.biochem || []
  if (!suite?.tests?.length) return rows

  const used = new Set<number>()
  const canonical = suite.tests.map((st) => {
    const idx = rows.findIndex((r, i) => !used.has(i) && isTestMatchByAlias(r.t, st))
    if (idx >= 0) {
      used.add(idx)
      return { ...rows[idx], t: st.label }
    }
    return { t: st.label, r: '—', n: 'N/A' }
  })
  const extras = rows.filter((_, i) => !used.has(i))
  return [...canonical, ...extras]
}

export function getKeyTestsForBug(bug: Species, suites: Record<string, Suite>): BiochemRow[] {
  const rows = getCanonicalBiochemRows(bug, suites)
  return rows.filter((row) => row.n && row.n.toUpperCase().startsWith('KEY'))
}

/** Normalize bug.biochem rows so test names match the suite labels. */
export function normalizeBiochemNamesForBug(bug: Species, suites: Record<string, Suite>): Species {
  if (!bug) return bug
  const suite = suites[bug.group]
  if (!suite?.tests?.length) return bug
  const rows = bug.biochem || []
  const seenSuiteTestIds = new Set<string>()
  const normalizedRows = rows.map((row) => {
    const matched = suite.tests.find((st) => isTestMatchByAlias(row.t, st))
    if (!matched) return row
    if (seenSuiteTestIds.has(matched.id)) {
      const prevNote = row.n ? `${row.n}; ` : ''
      return { ...row, t: matched.label, n: `${prevNote}Extra duplicate entry` }
    }
    seenSuiteTestIds.add(matched.id)
    return { ...row, t: matched.label }
  })
  return { ...bug, biochem: normalizedRows }
}

export const HARD_EXCLUSION_TESTS = BIOCHEMICAL_TEST_REGISTRY
  .filter((t) => t.hardExclusion)
  .map((t) => t.id)
