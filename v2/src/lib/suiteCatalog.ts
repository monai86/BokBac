import { BIOCHEMICAL_TEST_REGISTRY, lookupTestDefinition } from '@/data/tests/biochemicalTestRegistry'
import type { AnswersMap, Suite, SuitesMap, TestSuite } from './types'

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
        const definition = lookupTestDefinition(item.testId)
        return {
          id: item.testId,
          label: definition?.label || item.testId,
          importance: item.required ? ('critical' as const) : ('moderate' as const),
        }
      }),
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

export function normalizeTestKeyToId(testKey: string): string {
  const direct = lookupTestDefinition(testKey)
  if (direct) return direct.id

  const clean = cleanKey(testKey)
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

