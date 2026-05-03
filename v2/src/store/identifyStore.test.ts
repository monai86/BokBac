import { beforeEach, describe, expect, it } from 'vitest'
import { useIdentifyStore } from './identifyStore'

describe('identifyStore reset flow', () => {
  beforeEach(() => {
    useIdentifyStore.setState({
      group: 'enterobacterales',
      answers: {},
      results: [],
      savedCases: [],
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
    expect(answeredState.answers).toEqual({ Indole: '+' })
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
    expect(saved.answers).toEqual({ Indole: '+' })

    useIdentifyStore.getState().resetAnswers()
    expect(useIdentifyStore.getState().answers).toEqual({})

    useIdentifyStore.getState().loadCase(saved.id)
    expect(useIdentifyStore.getState().answers).toEqual({ Indole: '+' })
    expect(useIdentifyStore.getState().results.length).toBeGreaterThan(0)

    useIdentifyStore.getState().deleteCase(saved.id)
    expect(useIdentifyStore.getState().savedCases).toEqual([])
  })
})
