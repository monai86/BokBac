import { describe, expect, it } from 'vitest'
import { DEFAULT_SUITES } from '@/data/suites/defaultSuites'
import { selectSuiteForObservation } from './selectSuiteForObservation'
import type { TestSuite } from './types'

describe('selectSuiteForObservation', () => {
  it('selects the GPC cluster suite for gram-positive cocci in clusters', () => {
    const selection = selectSuiteForObservation(
      { gramReaction: 'positive', morphology: 'cocci', arrangement: 'cluster' },
      DEFAULT_SUITES,
    )

    expect(selection?.groupId).toBe('gpc_cluster')
    expect(selection?.suiteId).toBe('gpc_cluster_default')
    expect(selection?.reason).toContain('matched')
  })

  it('selects the GPC chain suite for gram-positive cocci in chains', () => {
    const selection = selectSuiteForObservation(
      { gramReaction: 'positive', morphology: 'cocci', arrangement: 'chain' },
      DEFAULT_SUITES,
    )

    expect(selection?.groupId).toBe('gpc_chain')
    expect(selection?.suiteId).toBe('gpc_chain_default')
  })

  it('prioritizes the GPC chain suite for gram-positive cocci in pairs', () => {
    const selection = selectSuiteForObservation(
      { gramReaction: 'positive', morphology: 'cocci', arrangement: 'pairs' },
      DEFAULT_SUITES,
    )

    expect(selection?.groupId).toBe('gpc_chain')
    expect(selection?.suiteId).toBe('gpc_chain_default')
  })

  it('selects an appropriate GN rod suite for gram-negative rods', () => {
    const selection = selectSuiteForObservation(
      { gramReaction: 'negative', morphology: 'bacilli', arrangement: 'unknown' },
      DEFAULT_SUITES,
    )

    expect(['enterobacterales_default', 'nfb_default', 'vibrio_default']).toContain(selection?.suiteId)
    expect(selection?.suiteId).toBe('enterobacterales_default')
  })

  it('uses specimen context to promote genital gram-negative diplococci', () => {
    const selection = selectSuiteForObservation(
      {
        specimen: 'genital',
        gramReaction: 'negative',
        morphology: 'cocci',
        arrangement: 'diplococci',
      },
      DEFAULT_SUITES,
    )

    expect(selection?.groupId).toBe('gn_coccobacilli')
  })

  it('selects the GN coccobacilli suite for gram-negative diplococci without hardcoded selector rules', () => {
    const selection = selectSuiteForObservation(
      {
        gramReaction: 'negative',
        morphology: 'cocci',
        arrangement: 'diplococci',
      },
      DEFAULT_SUITES,
    )

    expect(selection?.groupId).toBe('gn_coccobacilli')
    expect(selection?.suiteId).toBe('gn_coccobacilli_default')
  })

  it('does not silently default to Enterobacterales when observation is unknown', () => {
    const selection = selectSuiteForObservation(
      { gramReaction: 'unknown', morphology: 'unknown', arrangement: 'unknown' },
      DEFAULT_SUITES,
    )

    expect(selection).toBeUndefined()
  })

  it('does not auto-select a suite from specimen alone', () => {
    const selection = selectSuiteForObservation(
      { specimen: 'stool', gramReaction: 'unknown', morphology: 'unknown', arrangement: 'unknown' },
      DEFAULT_SUITES,
    )

    expect(selection).toBeUndefined()
  })

  it('does not crash when a suite lacks trigger metadata', () => {
    const noTriggerSuite: TestSuite = {
      id: 'manual_custom_suite',
      name: 'Manual Custom Suite',
      owner: 'user',
      group: 'nfb',
      tests: [],
    }

    const selection = selectSuiteForObservation(
      { gramReaction: 'negative', morphology: 'bacilli', arrangement: 'unknown' },
      [noTriggerSuite, ...DEFAULT_SUITES],
    )

    expect(selection?.suiteId).toBe('enterobacterales_default')
  })

  it('changes selection when trigger metadata changes without selector code changes', () => {
    const nfbSuite = DEFAULT_SUITES.find((suite) => suite.id === 'nfb_default')
    expect(nfbSuite).toBeTruthy()

    const urineNfbSuite: TestSuite = {
      ...nfbSuite!,
      trigger: {
        gramReaction: 'negative',
        morphology: 'bacilli',
        specimen: 'urine',
      },
    }
    const suites = DEFAULT_SUITES.map((suite) =>
      suite.id === urineNfbSuite.id ? urineNfbSuite : suite
    )

    const selection = selectSuiteForObservation(
      {
        specimen: 'urine',
        gramReaction: 'negative',
        morphology: 'bacilli',
        arrangement: 'unknown',
      },
      suites,
    )

    expect(selection?.suiteId).toBe('nfb_default')
  })
})
