import { beforeEach, describe, expect, it } from 'vitest'
import { getActiveSuite } from '@/lib/suiteCatalog'
import { useIdentifyStore } from './identifyStore'

describe('identifyStore reset flow', () => {
  beforeEach(() => {
    useIdentifyStore.setState({
      group: 'enterobacterales',
      answers: {},
      results: [],
      savedCases: [],
      customSuites: [],
      activeSuiteId: 'enterobacterales_default',
    })
    window.localStorage.clear()
    useIdentifyStore.getState().recompute()
  })

  it('recomputes priors-only results immediately after reset', () => {
    const store = useIdentifyStore.getState()
    const initialTop = store.results[0]

    expect(initialTop).toBeDefined()
    expect(store.answers).toEqual({})

    store.setAnswer('Indole', '+')

    const answeredState = useIdentifyStore.getState()
    expect(answeredState.answers).toEqual({ indole: '+' })
    expect(answeredState.results.length).toBeGreaterThan(0)

    answeredState.resetAnswers()

    const resetState = useIdentifyStore.getState()
    expect(resetState.answers).toEqual({})
    expect(resetState.results.length).toBeGreaterThan(0)
    expect(resetState.results[0]?.id).toBe(initialTop.id)
    expect(resetState.results[0]?.pct).toBe(initialTop.pct)
  })

  it('saves, loads, and deletes local cases', () => {
    const store = useIdentifyStore.getState()

    store.setAnswer('Indole', '+')
    useIdentifyStore.getState().saveCurrentCase()

    const saved = useIdentifyStore.getState().savedCases[0]
    expect(saved).toBeDefined()
    expect(saved.answers).toEqual({ indole: '+' })
    expect(saved.suiteId).toBe('enterobacterales_default')
    expect(saved.suiteName).toBe('Enterobacterales Suite')
    expect(saved.suiteVersion).toBe('unversioned')
    expect(saved.engineVersion).toBe('4.0.0')

    useIdentifyStore.getState().resetAnswers()
    expect(useIdentifyStore.getState().answers).toEqual({})

    useIdentifyStore.getState().loadCase(saved.id)
    expect(useIdentifyStore.getState().answers).toEqual({ indole: '+' })
    expect(useIdentifyStore.getState().results.length).toBeGreaterThan(0)

    useIdentifyStore.getState().deleteCase(saved.id)
    expect(useIdentifyStore.getState().savedCases).toEqual([])
  })

  it('restores saved custom suite provenance when loading a case', () => {
    const store = useIdentifyStore.getState()
    const baseSuite = store.defaultSuites.find((suite) => suite.id === 'enterobacterales_default')
    expect(baseSuite).toBeDefined()

    const customSuite = {
      ...baseSuite!,
      id: 'custom_enterobacterales_teaching',
      name: 'Teaching Enterobacterales Suite',
      owner: 'user' as const,
      tests: baseSuite!.tests.slice(0, 4),
    }

    store.setCustomSuites([customSuite])
    useIdentifyStore.getState().setActiveSuiteId(customSuite.id)
    useIdentifyStore.getState().setAnswer('Indole (IMViC)', '+')
    useIdentifyStore.getState().saveCurrentCase()

    const saved = useIdentifyStore.getState().savedCases[0]
    expect(saved.suiteId).toBe(customSuite.id)
    expect(saved.suiteName).toBe(customSuite.name)
    expect(saved.answers).toEqual({ indole: '+' })

    useIdentifyStore.getState().setActiveSuiteId('enterobacterales_default')
    expect(useIdentifyStore.getState().activeSuiteId).toBe('enterobacterales_default')

    useIdentifyStore.getState().loadCase(saved.id)
    const restored = useIdentifyStore.getState()
    const restoredSuite = getActiveSuite(
      restored.defaultSuites,
      restored.customSuites,
      restored.activeSuiteId,
      restored.group
    )

    expect(restored.activeSuiteId).toBe(customSuite.id)
    expect(restored.answers).toEqual({ indole: '+' })
    expect(restoredSuite?.id).toBe(customSuite.id)
    expect(restoredSuite?.tests.map((item) => item.testId)).toEqual(
      customSuite.tests.map((item) => item.testId)
    )
  })

  it('migrates legacy label-based saved answers when loading a case', () => {
    const legacyCase = {
      id: 'legacy-case',
      createdAt: new Date().toISOString(),
      title: 'Legacy saved case',
      tags: [],
      group: 'enterobacterales',
      answers: { Indole: '+' },
    }

    useIdentifyStore.setState({ savedCases: [legacyCase] })
    useIdentifyStore.getState().loadCase(legacyCase.id)

    expect(useIdentifyStore.getState().answers).toEqual({ indole: '+' })
    expect(useIdentifyStore.getState().results.length).toBeGreaterThan(0)
  })

  it('auto-selects group and suite from resolved initial observation', () => {
    useIdentifyStore.getState().setAnswer('Indole', '+')
    expect(useIdentifyStore.getState().answers).toEqual({ indole: '+' })

    useIdentifyStore.getState().setInitialObservation({
      gramReaction: 'positive',
      morphology: 'cocci',
      arrangement: 'cluster',
    })

    const state = useIdentifyStore.getState()
    expect(state.group).toBe('gpc_cluster')
    expect(state.activeSuiteId).toBe('gpc_cluster_default')
    expect(state.answers).toEqual({})
    expect(state.suiteSelectionReason).toContain('GPC Cluster Suite')
  })
})
