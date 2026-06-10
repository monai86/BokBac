import { describe, expect, it } from 'vitest'
import { calcProbabilityBayes } from './bayesianEngine'
import { ALL_MCM_DATA, ALL_SUITES, LIBRARY_CLEAN } from './dataLoader'

const opts = {
  library: LIBRARY_CLEAN,
  mcmData: ALL_MCM_DATA,
  suites: ALL_SUITES,
}

describe('Profile Typicality Index Calculation', () => {
  it('returns 1.0 when no tests are answered', () => {
    const results = calcProbabilityBayes(
      'gpc_cluster',
      {},
      opts,
      { gramReaction: 'positive', morphology: 'cocci' }
    )
    const top = results.find(r => r.id === 's_aureus')
    expect(top).toBeDefined()
    expect(top!.typicalityIndex).toBe(1.0)
  })

  it('yields high typicality for classic Staph aureus results', () => {
    const results = calcProbabilityBayes(
      'gpc_cluster',
      { Catalase: '+', Coagulase: '+', DNase: '+' },
      opts,
      { gramReaction: 'positive', morphology: 'cocci', arrangement: 'cluster' }
    )
    const top = results.find(r => r.id === 's_aureus')
    expect(top).toBeDefined()
    expect(top!.typicalityIndex).toBeGreaterThanOrEqual(0.8)
  })

  it('yields very low typicality for atypical coagulase-negative Staph aureus isolate', () => {
    const results = calcProbabilityBayes(
      'gpc_cluster',
      { Catalase: '+', Coagulase: '−' }, // S. aureus is typically coagulase positive
      opts,
      { gramReaction: 'positive', morphology: 'cocci', arrangement: 'cluster' }
    )
    const top = results.find(r => r.id === 's_aureus')
    expect(top).toBeDefined()
    // Coagulase is 99% positive in S. aureus. Answering '-' is highly atypical.
    expect(top!.typicalityIndex).toBeLessThan(0.15)
  })

  it('yields very low typicality for atypical Optochin R Streptococcus pneumoniae isolate', () => {
    const results = calcProbabilityBayes(
      'gpc_chain',
      { Catalase: '−', Hemolysis: 'α', Optochin: 'R' }, // S. pneumoniae is typically Optochin sensitive (S)
      opts,
      { gramReaction: 'positive', morphology: 'cocci', arrangement: 'pairs' }
    )
    const top = results.find(r => r.id === 's_pneumoniae')
    expect(top).toBeDefined()
    // S. pneumoniae should be Optochin S. Answering R is atypical.
    expect(top!.typicalityIndex).toBeLessThan(0.5)
  })
})
