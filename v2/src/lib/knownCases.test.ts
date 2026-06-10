import { describe, expect, it } from 'vitest'
import { calcProbabilityBayes } from './bayesianEngine'
import { ALL_MCM_DATA, ALL_SUITES, LIBRARY_CLEAN } from './dataLoader'
import type { AnswersMap, InitialObservation } from './types'

const opts = {
  library: LIBRARY_CLEAN,
  mcmData: ALL_MCM_DATA,
  suites: ALL_SUITES,
}

interface CaseProfile {
  name: string
  group: string
  observation?: InitialObservation
  answers: AnswersMap
  expectedTopId: string
  alternativeExpectedIds?: string[]
}

const CASE_BANK: CaseProfile[] = [
  {
    name: 'Escherichia coli (Classic UTI)',
    group: 'enterobacterales',
    observation: {
      gramReaction: 'negative',
      morphology: 'bacilli',
    },
    answers: {
      Oxidase: '−',
      Indole: '+',
      Citrate: '−',
      Urease: '−',
      Motility: '+',
      Lactose: '+',
    },
    expectedTopId: 'e_coli',
  },
  {
    name: 'Klebsiella pneumoniae (Mucoid pneumonia)',
    group: 'enterobacterales',
    observation: {
      gramReaction: 'negative',
      morphology: 'bacilli',
    },
    answers: {
      Oxidase: '−',
      Indole: '−',
      VP: '+',
      Motility: '−',
      Urease: '+',
      Lactose: '+',
    },
    expectedTopId: 'klebsiella_pneumoniae',
  },
  {
    name: 'Proteus mirabilis (H2S+, swarm motility)',
    group: 'enterobacterales',
    observation: {
      gramReaction: 'negative',
      morphology: 'bacilli',
    },
    answers: {
      Oxidase: '−',
      Indole: '−',
      H2S: '+',
      Urease: '+',
      Motility: '+',
      Lactose: '−',
    },
    expectedTopId: 'proteus_mirabilis',
  },
  {
    name: 'Salmonella enterica (Gastroenteritis)',
    group: 'enterobacterales',
    observation: {
      gramReaction: 'negative',
      morphology: 'bacilli',
    },
    answers: {
      Oxidase: '−',
      H2S: '+',
      Indole: '−',
      Citrate: '+',
      Motility: '+',
      Lactose: '−',
      LDC: '+',
      VP: '−',
    },
    expectedTopId: 'salmonella',
  },
  {
    name: 'Shigella sonnei (Dysentery)',
    group: 'enterobacterales',
    observation: {
      gramReaction: 'negative',
      morphology: 'bacilli',
    },
    answers: {
      Oxidase: '−',
      H2S: '−',
      Indole: '−',
      Motility: '−',
      LDC: '−',
      ODC: '+',
      Lactose: '−',
    },
    expectedTopId: 'shigella_sonnei',
    alternativeExpectedIds: ['shigella'],
  },
  {
    name: 'Staphylococcus aureus (Coagulase+)',
    group: 'gpc_cluster',
    observation: {
      gramReaction: 'positive',
      morphology: 'cocci',
      arrangement: 'cluster',
    },
    answers: {
      Catalase: '+',
      Coagulase: '+',
      DNase: '+',
      Mannitol: '+',
      Novobiocin: 'S',
    },
    expectedTopId: 's_aureus',
  },
  {
    name: 'Staphylococcus epidermidis (CoNS, Novobiocin S)',
    group: 'gpc_cluster',
    observation: {
      gramReaction: 'positive',
      morphology: 'cocci',
      arrangement: 'cluster',
    },
    answers: {
      Catalase: '+',
      Coagulase: '−',
      Novobiocin: 'S',
      Urease: '+',
      DNase: '−',
      Mannitol: '−',
    },
    expectedTopId: 's_epidermidis',
  },
  {
    name: 'Staphylococcus saprophyticus (Novobiocin R)',
    group: 'gpc_cluster',
    observation: {
      gramReaction: 'positive',
      morphology: 'cocci',
      arrangement: 'cluster',
    },
    answers: {
      Catalase: '+',
      Coagulase: '−',
      Novobiocin: 'R', // Distinctive key resistance
      Urease: '+',
    },
    expectedTopId: 's_saprophyticus',
  },
  {
    name: 'Streptococcus pyogenes (Group A, Bacitracin S)',
    group: 'gpc_chain',
    observation: {
      gramReaction: 'positive',
      morphology: 'cocci',
      arrangement: 'chain',
    },
    answers: {
      Catalase: '−',
      Hemolysis: 'β',
      Bacitracin: 'S', // Sensitive
      PYR: '+',
      CAMP: '−',
    },
    expectedTopId: 's_pyogenes',
  },
  {
    name: 'Streptococcus agalactiae (Group B, CAMP+)',
    group: 'gpc_chain',
    observation: {
      gramReaction: 'positive',
      morphology: 'cocci',
      arrangement: 'chain',
    },
    answers: {
      Catalase: '−',
      Hemolysis: 'β',
      Bacitracin: 'R',
      CAMP: '+', // Enhanced hemolysis
      Hippurate: '+',
    },
    expectedTopId: 's_agalactiae',
  },
  {
    name: 'Streptococcus pneumoniae (Optochin S, Bile soluble)',
    group: 'gpc_chain',
    observation: {
      gramReaction: 'positive',
      morphology: 'cocci',
      arrangement: 'pairs',
    },
    answers: {
      Catalase: '−',
      Hemolysis: 'α',
      Optochin: 'S', // Sensitive
      'Bile Solubility': '+',
    },
    expectedTopId: 's_pneumoniae',
  },
  {
    name: 'Enterococcus faecalis (Group D, Bile Esculin+, Salt+)',
    group: 'gpc_chain',
    observation: {
      gramReaction: 'positive',
      morphology: 'cocci',
      arrangement: 'chain',
    },
    answers: {
      Catalase: '−',
      'Bile Esculin': '+',
      '6.5% NaCl': '+',
      PYR: '+',
      Arabinose: '−',
      Sorbitol: '+',
    },
    expectedTopId: 'enterococcus_faecalis',
  },
]

describe('Textbook Case Bank - Diagnostic Accuracy', () => {
  for (const c of CASE_BANK) {
    it(`correctly identifies ${c.name}`, () => {
      const results = calcProbabilityBayes(c.group, c.answers, opts, c.observation)
      
      expect(results.length).toBeGreaterThan(0)
      
      const topResult = results[0]
      const allowedIds = [c.expectedTopId, ...(c.alternativeExpectedIds || [])]
      
      expect(
        allowedIds,
        `Top predicted species should be one of [${allowedIds.join(', ')}] (got "${topResult.id}" with ${topResult.pct}%)`
      ).toContain(topResult.id)

      // Ensure the probability score is significant
      expect(topResult.pct).toBeGreaterThanOrEqual(15)

      // Assert that evidence coverage is also set
      expect(topResult.evidenceCoverage).toBeGreaterThan(0)
    })
  }
})

describe('Susceptibility Test Verification', () => {
  it('correctly ranks Staphylococcus saprophyticus high when Novobiocin R is entered', () => {
    const results = calcProbabilityBayes(
      'gpc_cluster',
      { Catalase: '+', Coagulase: '−', Novobiocin: 'R' },
      opts,
      { gramReaction: 'positive', morphology: 'cocci' }
    )
    const top = results[0]
    expect(top.id).toBe('s_saprophyticus')
  })

  it('correctly ranks Streptococcus pneumoniae high when Optochin S is entered', () => {
    const results = calcProbabilityBayes(
      'gpc_chain',
      { Catalase: '−', Hemolysis: 'α', Optochin: 'S' },
      opts,
      { gramReaction: 'positive', morphology: 'cocci' }
    )
    const top = results[0]
    expect(top.id).toBe('s_pneumoniae')
  })
})
