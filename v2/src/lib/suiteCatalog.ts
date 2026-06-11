import { BIOCHEMICAL_TEST_REGISTRY, lookupTestDefinition } from '@/data/tests/biochemicalTestRegistry'
import type { AnswersMap, Suite, SuitesMap, TestSuite, TestSuiteItem } from './types'

export const ENGINE_VERSION = '4.0.0'
export const UNVERSIONED_SUITE = 'unversioned'

export function getSuitesForGroup(suites: TestSuite[], group: string): TestSuite[] {
  return suites.filter((suite) => suite.group === group)
}

export function getActiveSuite(
  defaultSuites: TestSuite[],
  customSuites: TestSuite[],
  activeSuiteId: string,
  group: string,
): TestSuite | undefined {
  const allSuites = [...defaultSuites, ...customSuites]
  const active = allSuites.find((suite) => suite.id === activeSuiteId && suite.group === group)
  return active || allSuites.find((suite) => suite.group === group)
}

export function toLegacySuite(suite: TestSuite): Suite {
  return {
    name: suite.name,
    tests: [...suite.tests]
      .sort((a, b) => a.order - b.order)
      .map((item) => {
        const display = getSuiteTestDisplay(item)
        return {
          id: item.testId,
          label: display.label,
          importance: item.required ? ('critical' as const) : ('moderate' as const),
        }
      }),
  }
}

export function getSuiteTestDisplay(item: TestSuiteItem): {
  label: string
  options: string[]
  registryMissing: boolean
} {
  const definition = lookupTestDefinition(item.testId)
  return {
    label: item.labelOverride || definition?.label || item.testId,
    options: item.optionsOverride || definition?.options || ['+', '−'],
    registryMissing: !definition,
  }
}

export function buildSuitesMap(defaultSuites: TestSuite[], activeSuite?: TestSuite): SuitesMap {
  const suitesMap: SuitesMap = {}
  for (const suite of defaultSuites) {
    suitesMap[suite.group] = toLegacySuite(suite)
  }
  if (activeSuite) {
    suitesMap[activeSuite.group] = toLegacySuite(activeSuite)
  }
  return suitesMap
}

export function getGroupNames(suites: TestSuite[]): string[] {
  return Array.from(new Set(suites.map((suite) => suite.group)))
}

function cleanKey(value: string): string {
  return value.toLowerCase().normalize('NFKD').replace(/[₂]/g, '2').replace(/[^a-z0-9]/g, '')
}

const LEGACY_TEST_ID_ALIASES: Record<string, string> = {
  adc_v: 'adh',
  ad_ent: 'adh',
  arabinose_ent: 'arabinose',
  arabinose_nfb: 'arabinose',
  arabinose_v: 'arabinose',
  bile_sol: 'bile_solubility',
  ca_growth: 'growth_chocolate',
  catalase_cluster: 'catalase',
  catalase_gpb: 'catalase',
  cta_fru: 'fructose',
  cta_glu: 'glucose',
  cta_lac: 'lactose',
  cta_mal: 'maltose',
  cta_suc: 'sucrose',
  dulcitol: 'dulcitol',
  dnase_ent: 'dnase',
  dnase_neiss: 'dnase',
  dnase_nfb: 'dnase',
  esculin_gpb: 'esculin',
  esculin_nfb: 'esculin',
  esculin_v: 'esculin',
  glucose_gpb: 'glucose',
  glucose_of: 'glucose',
  glucose_of_nfb: 'glucose',
  glucose_v: 'glucose',
  growth_nu: 'growth_nutrient',
  growth42: 'growth_42',
  h2s_gpb: 'h2s',
  h2s_nfb: 'h2s',
  hemolysis_cluster: 'hemolysis',
  hemolysis_gpb: 'hemolysis',
  indole_gnc: 'indole',
  indole_gpb: 'indole',
  indole_nfb: 'indole',
  indole_v: 'indole',
  king_p: 'king_p',
  king_f: 'king_f',
  lactose_gnc: 'lactose',
  lactose_nfb: 'lactose',
  lactose_v: 'lactose',
  ldc_v: 'ldc',
  lecithinase_gpb: 'lecithinase',
  maltose_gnc: 'maltose',
  maltose_gpb: 'maltose',
  maltose_nfb: 'maltose',
  mannitol_ent: 'mannitol',
  mannitol_gnc: 'mannitol',
  mannitol_nfb: 'mannitol',
  mannitol_v: 'mannitol',
  motile_ent: 'motility',
  motile_gnc: 'motility',
  motile_gpb: 'motility',
  motile_nfb: 'motility',
  motile_v: 'motility',
  nacl_6_5: 'salt_tolerance',
  nacl_65_nfb: 'salt_tolerance',
  nacl_0: 'salt_0',
  nacl_1: 'salt_1',
  nacl_6: 'salt_6',
  nacl_8: 'salt_8',
  nacl_10: 'salt_10',
  n2_gas: 'n2_gas',
  nitrate_gpb: 'nitrate',
  nitrate_neiss: 'nitrate',
  nitrate_nfb: 'nitrate',
  od_cluster: 'odc',
  odc_v: 'odc',
  oxidase_cluster: 'oxidase',
  oxidase_ent: 'oxidase',
  oxidase_neiss: 'oxidase',
  oxidase_nfb: 'oxidase',
  oxidase_v: 'oxidase',
  raffinose_ent: 'raffinose',
  rhamnose_gpb: 'rhamnose',
  sorbitol_ent: 'sorbitol',
  sorbitol_v: 'sorbitol',
  starch_nfb: 'starch',
  sucrose_ent: 'sucrose',
  sucrose_gpb: 'sucrose',
  sucrose_nfb: 'sucrose',
  sucrose_nfb2: 'sucrose',
  sucrose_v: 'sucrose',
  tcbs: 'tcbs',
  tsi_gnc: 'tsi',
  tsi_gpb: 'tsi',
  tsi_nfb: 'tsi',
  tsi_v: 'tsi',
  urease_cluster: 'urease',
  urease_gnc: 'urease',
  urease_gpb: 'urease',
  urease_nfb: 'urease',
  vp_1nacl: 'vp',
  xylose_gpb: 'xylose',
  xylose_nfb: 'xylose',
}

export function normalizeTestKeyToId(testKey: string): string {
  const direct = lookupTestDefinition(testKey)
  if (direct) return direct.id

  const clean = cleanKey(testKey)
  const legacyAlias = LEGACY_TEST_ID_ALIASES[testKey.toLowerCase()] || LEGACY_TEST_ID_ALIASES[clean]
  if (legacyAlias && lookupTestDefinition(legacyAlias)) return legacyAlias

  const byLabelOrMcm = BIOCHEMICAL_TEST_REGISTRY.find((definition) => {
    return (
      cleanKey(definition.label) === clean ||
      cleanKey(definition.label).includes(clean) ||
      clean.includes(cleanKey(definition.label)) ||
      (definition.mcmKey ? cleanKey(definition.mcmKey) === clean : false)
    )
  })

  return byLabelOrMcm?.id || testKey
}

export function normalizeAnswersToTestIds(answers: AnswersMap): AnswersMap {
  const normalized: AnswersMap = {}
  for (const [key, value] of Object.entries(answers)) {
    if (value == null || value === '') continue
    normalized[normalizeTestKeyToId(key)] = value
  }
  return normalized
}
