import { describe, expect, it } from 'vitest'
import { DEFAULT_SUITES } from './defaultSuites'
import { lookupTestDefinition } from '../tests/biochemicalTestRegistry'
import { getSuiteTestDisplay, normalizeTestKeyToId } from '@/lib/suiteCatalog'

describe('default test suites', () => {
  it('keeps every default suite item backed by the biochemical registry', () => {
    const missing = DEFAULT_SUITES.flatMap((suite) =>
      suite.tests
        .filter((item) => !lookupTestDefinition(item.testId))
        .map((item) => `${suite.id}:${item.testId}`),
    )

    expect(missing).toEqual([])
  })

  it('includes PPR agar in the Gram-positive cocci chain workflow', () => {
    const suite = DEFAULT_SUITES.find((item) => item.id === 'gpc_chain_default')
    const suiteTestIds = suite?.tests.map((item) => item.testId)
    const pprItem = suite?.tests.find((item) => item.testId === 'ppr')
    const growthItem = suite?.tests.find((item) => item.testId === 'growth_45')

    expect(pprItem).toMatchObject({ required: true, order: 5 })
    expect(getSuiteTestDisplay(pprItem!).label).toBe('PPR test')
    expect(suiteTestIds).toEqual(expect.arrayContaining(['gas_glucose', 'lecithinase']))
    expect(getSuiteTestDisplay(growthItem!).label).toBe('Growth 45°C')
  })

  it('includes expanded Gram-positive bacilli tests and Reverse CAMP option', () => {
    const suite = DEFAULT_SUITES.find((item) => item.id === 'gpb_default')
    const suiteTestIds = suite?.tests.map((item) => item.testId)

    expect(suiteTestIds).toEqual(expect.arrayContaining(['oxidase', 'tsi', 'h2s', 'indole', 'lecithinase']))
    expect(lookupTestDefinition('camp')?.options).toContain('Reverse CAMP+')
    expect(getSuiteTestDisplay(suite!.tests.find((item) => item.testId === 'lecithinase')!).label).toBe('Lecithinase (Egg yolk)')
    expect(getSuiteTestDisplay(suite!.tests.find((item) => item.testId === 'h2s')!).label).toBe('H₂S in TSI')
  })

  it('uses suite-specific display names and options for contextual biochemical methods', () => {
    const cluster = DEFAULT_SUITES.find((item) => item.id === 'gpc_cluster_default')
    const nfb = DEFAULT_SUITES.find((item) => item.id === 'nfb_default')
    const enterobacterales = DEFAULT_SUITES.find((item) => item.id === 'enterobacterales_default')
    const gpb = DEFAULT_SUITES.find((item) => item.id === 'gpb_default')

    expect(getSuiteTestDisplay(cluster!.tests.find((item) => item.testId === 'glucose')!)).toMatchObject({
      label: 'Glucose O/F',
      options: ['+/+ (fermentative)', '+/− (oxidative)', '−/− (non-reactive)'],
    })
    expect(getSuiteTestDisplay(nfb!.tests.find((item) => item.testId === 'glucose')!)).toMatchObject({
      label: 'Glucose O/F',
      options: ['O (oxidative)', 'F (fermentative)', '−/− (non-reactive)'],
    })
    expect(getSuiteTestDisplay(enterobacterales!.tests.find((item) => item.testId === 'tsi')!)).toMatchObject({
      label: 'TSI',
      options: ['A/A (gas+)', 'A/A (gas−)', 'K/A', 'K/A H₂S', 'K/AG H₂S', 'K/K', 'K/N'],
    })
    expect(getSuiteTestDisplay(nfb!.tests.find((item) => item.testId === 'tsi')!).options).toEqual(['K/N', 'K/K', 'K/A', 'A/A'])
    expect(getSuiteTestDisplay(gpb!.tests.find((item) => item.testId === 'tsi')!).options).toEqual(['A/A', 'K/A', 'K/K', 'K/N'])
  })

  it('constrains signature biochemical results to the selected organism group', () => {
    const byGroup = Object.fromEntries(DEFAULT_SUITES.map((suite) => [suite.group, suite]))

    expect(getSuiteTestDisplay(byGroup.gpc_cluster.tests.find((item) => item.testId === 'catalase')!).options).toEqual(['+'])
    expect(getSuiteTestDisplay(byGroup.gpc_chain.tests.find((item) => item.testId === 'catalase')!).options).toEqual(['−'])
    expect(getSuiteTestDisplay(byGroup.enterobacterales.tests.find((item) => item.testId === 'oxidase')!).options).toEqual(['−'])
    expect(getSuiteTestDisplay(byGroup.vibrio.tests.find((item) => item.testId === 'oxidase')!).options).toEqual(['+', '−'])
    expect(getSuiteTestDisplay(byGroup.gn_coccobacilli.tests.find((item) => item.testId === 'oxidase')!).options).toEqual(['+'])
  })

  it('normalizes legacy suite ids into canonical test ids for custom suite imports', () => {
    expect(normalizeTestKeyToId('glucose_of')).toBe('glucose')
    expect(normalizeTestKeyToId('motile_gpb')).toBe('motility')
    expect(normalizeTestKeyToId('lecithinase_gpb')).toBe('lecithinase')
    expect(normalizeTestKeyToId('growth_45')).toBe('growth_45')
    expect(normalizeTestKeyToId('nacl_0')).toBe('salt_0')
    expect(normalizeTestKeyToId('cta_fru')).toBe('fructose')
  })

  it('restores legacy coverage for broader teaching suites without duplicate canonical ids', () => {
    const byGroup = Object.fromEntries(DEFAULT_SUITES.map((suite) => [suite.group, suite]))

    expect(byGroup.enterobacterales.tests.map((item) => item.testId)).toEqual(expect.arrayContaining([
      'pdc', 'gas_glucose', 'dulcitol', 'inositol', 'raffinose', 'rhamnose', 'salicin', 'kcn',
    ]))
    expect(byGroup.nfb.tests.map((item) => item.testId)).toEqual(expect.arrayContaining([
      'growth_42', 'n2_gas', 'esculin', 'h2s', 'salt_tolerance',
    ]))
    expect(byGroup.vibrio.tests.map((item) => item.testId)).toEqual(expect.arrayContaining([
      'salt_0', 'salt_1', 'salt_6', 'salt_8', 'salt_10', 'tcbs', 'inositol', 'salicin',
    ]))
    expect(byGroup.gn_coccobacilli.tests.map((item) => item.testId)).toEqual(expect.arrayContaining([
      'growth_nutrient', 'tsi', 'motility', 'indole', 'urease', 'mannitol', 'factor_x', 'factor_v',
      'satellitism', 'growth_chocolate', 'fructose',
    ]))

    for (const suite of DEFAULT_SUITES) {
      const ids = suite.tests.map((item) => item.testId)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })
})
