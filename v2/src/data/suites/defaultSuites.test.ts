import { describe, expect, it } from 'vitest'
import { DEFAULT_SUITES } from './defaultSuites'
import { lookupTestDefinition } from '../tests/biochemicalTestRegistry'

describe('default test suites', () => {
  it('includes PPR agar in the Gram-positive cocci chain workflow', () => {
    const suite = DEFAULT_SUITES.find((item) => item.id === 'gpc_chain_default')
    const suiteTestIds = suite?.tests.map((item) => item.testId)
    const pprItem = suite?.tests.find((item) => item.testId === 'ppr')

    expect(pprItem).toMatchObject({ required: false, order: 14 })
    expect(lookupTestDefinition('ppr')?.label).toBe('PPR agar')
    expect(suiteTestIds).toEqual(expect.arrayContaining(['gas_glucose', 'lecithinase']))
  })

  it('includes expanded Gram-positive bacilli tests and Reverse CAMP option', () => {
    const suite = DEFAULT_SUITES.find((item) => item.id === 'gpb_default')
    const suiteTestIds = suite?.tests.map((item) => item.testId)

    expect(suiteTestIds).toEqual(expect.arrayContaining(['oxidase', 'tsi', 'h2s', 'indole', 'lecithinase']))
    expect(lookupTestDefinition('camp')?.options).toContain('Reverse CAMP+')
    expect(lookupTestDefinition('lecithinase')?.label).toBe('Lecithinase')
  })
})
