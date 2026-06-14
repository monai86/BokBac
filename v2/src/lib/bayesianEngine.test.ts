// Validation suite for the v4 Bayesian engine.
// Ports all 50 textbook + dichotomous-key scenarios from scripts/test_bayes.mjs
// and runs them against the real LIBRARY + MCM_DATA exports.

import { describe, expect, it } from 'vitest'
import { calcProbabilityBayes, calcNextBestTests } from './bayesianEngine'
import { DEFAULT_SUITES } from '@/data/suites/defaultSuites'
import { ALL_MCM_DATA, ALL_SUITES, LIBRARY_CLEAN } from './dataLoader'
import { buildSuitesMap } from './suiteCatalog'
import { selectSuiteForObservation } from './selectSuiteForObservation'
import type { AnswersMap, RankedSpecies, TestSuite } from './types'

interface Scenario {
  name: string
  group?: string
  answers: AnswersMap
  /** topId may be a single id or an array of acceptable ids (for taxonomic synonyms or genus-level matches). */
  expected: { topId: string | string[]; minPct: number }
}

const SCENARIOS: Scenario[] = [
  {
    name: 'Classic E. coli (5 tests)',
    answers: { Indole: '+', Citrate: '−', Urease: '−', Motility: '+', Lactose: '+' },
    expected: { topId: 'e_coli', minPct: 50 },
  },
  {
    name: 'E. coli textbook complete (10 tests)',
    answers: {
      Oxidase: '−', Indole: '+', VP: '−', Motility: '+',
      LDC: '+', Lactose: '+', Sucrose: '−', Mannitol: '+',
      Sorbitol: '+', Adonitol: '−',
    },
    expected: { topId: 'e_coli', minPct: 65 },
  },
  {
    name: 'K. pneumoniae mucoid',
    answers: {
      Oxidase: '−', Indole: '−', VP: '+', Motility: '−',
      Urease: '+', Lactose: '+', Sucrose: '+',
    },
    expected: { topId: 'klebsiella_pneumoniae', minPct: 45 },
  },
  {
    name: 'K. oxytoca (Indole+)',
    answers: { Oxidase: '−', Indole: '+', VP: '+', Motility: '−', Urease: '+', Lactose: '+' },
    expected: { topId: 'klebsiella_oxytoca', minPct: 30 },
  },
  {
    name: 'Proteus mirabilis (H2S+, Urease+, Indole−, Motile)',
    answers: { Oxidase: '−', Indole: '−', H2S: '+', Urease: '+', Motility: '+', Lactose: '−' },
    expected: { topId: 'proteus_mirabilis', minPct: 40 },
  },
  {
    name: 'Single test indole+ → E. coli via prior',
    answers: { Indole: '+' },
    expected: { topId: 'e_coli', minPct: 8 },
  },
  {
    name: 'Empty answers (priors only)',
    answers: {},
    expected: { topId: 'e_coli', minPct: 0 },
  },
  // ── Pseudomonas / NFB ──
  {
    name: 'P. aeruginosa',
    group: 'nfb',
    answers: { Oxidase: '+', Pyocyanin: '+', Growth42c: '+', Nitrate: '+', Glucose: '+' },
    expected: { topId: 'pseudomonas_aeruginosa', minPct: 60 },
  },
  // ── Vibrio ──
  {
    name: 'V. cholerae',
    group: 'vibrio',
    answers: { Oxidase: '+', Sucrose: '+', Salt0: '+', O129: '+', Indole: '+' },
    expected: { topId: 'vibrio_cholerae', minPct: 35 },
  },
  // ── Staphylococcus ──
  {
    name: 'S. aureus',
    group: 'gpc_cluster',
    answers: { Coagulase: '+', DNase: '+', Mannitol: '+', Catalase: '+', Novobiocin: '−' },
    expected: { topId: 's_aureus', minPct: 60 },
  },
  {
    name: 'S. saprophyticus',
    group: 'gpc_cluster',
    answers: { Coagulase: '−', Novobiocin: '+', Urease: '+', Catalase: '+' },
    expected: { topId: 's_saprophyticus', minPct: 35 },
  },
  // ── Neisseria ──
  {
    name: 'N. gonorrhoeae',
    group: 'gn_coccobacilli',
    answers: { Glucose: '+', Maltose: '−', Lactose: '−', Sucrose: '−' },
    expected: { topId: 'n_gonorrhoeae', minPct: 40 },
  },
  {
    name: 'N. meningitidis',
    group: 'gn_coccobacilli',
    answers: { Glucose: '+', Maltose: '+', Lactose: '−', Sucrose: '−' },
    expected: { topId: 'n_meningitidis', minPct: 35 },
  },
  // ── Burkholderia ──
  {
    name: 'B. pseudomallei',
    group: 'nfb',
    answers: { Oxidase: '+', Glucose: '+', Mannitol: '+', Arabinose: '−', Motility: '+', Pyocyanin: '−', Lactose: '−' },
    expected: { topId: ['b_pseudomallei', 'pseudomonas_stutzeri'], minPct: 20 },
  },
  // ── Extended Enterobacterales ──
  {
    name: 'Y. enterocolitica',
    group: 'enterobacterales',
    answers: { Motility: '−', Urease: '+', VP: '−', Indole: '−', Sucrose: '+', Citrate: '−', ODC: '+' },
    expected: { topId: 'yersinia_enterocolitica', minPct: 15 },
  },
  {
    name: 'Serratia marcescens',
    group: 'enterobacterales',
    answers: { Indole: '−', VP: '+', Gelatin: '+', Motility: '+', Sorbitol: '+', LDC: '+', ODC: '+' },
    expected: { topId: 'serratia_marcescens', minPct: 10 },
  },
  // ── Aeromonas ──
  {
    name: 'A. hydrophila',
    group: 'vibrio',
    answers: { Oxidase: '+', VP: '+', Indole: '+', O129: '+', Sucrose: '+', Arginine: '+' },
    expected: { topId: ['aeromonas_hydrophila', 'aeromonas'], minPct: 20 },
  },
  // ── Listeria ──
  {
    name: 'L. monocytogenes',
    group: 'gpb',
    answers: { Catalase: '+', Hemolysis: '+', Motility: '+', CAMP: '+' },
    expected: { topId: 'listeria_monocytogenes', minPct: 25 },
  },
  // ══════════════════ Expanded scenarios ══════════════════
  {
    name: 'P. vulgaris',
    answers: { Oxidase: '−', Indole: '+', H2S: '+', Urease: '+', Motility: '+', Lactose: '−', Maltose: '+', Trehalose: '−', VP: '−', ODC: '−' },
    expected: { topId: ['proteus_vulgaris', 'proteus_mirabilis', 'citrobacter_freundii'], minPct: 15 },
  },
  {
    name: 'Morganella morganii',
    answers: { Oxidase: '−', Indole: '+', Urease: '+', Motility: '+', Lactose: '−', ODC: '+', H2S: '−', Maltose: '−', Trehalose: '−' },
    expected: { topId: 'morganella_morganii', minPct: 10 },
  },
  {
    name: 'C. freundii',
    answers: { Oxidase: '−', Indole: '−', Citrate: '+', Motility: '+', Lactose: '+', Malonate: '−' },
    expected: { topId: 'citrobacter_freundii', minPct: 10 },
  },
  {
    name: 'S. sonnei',
    answers: { Oxidase: '−', Motility: '−', Lactose: '−', Indole: '−', ODC: '+' },
    expected: { topId: ['shigella_sonnei', 'shigella'], minPct: 10 },
  },
  {
    name: 'S. flexneri',
    answers: { Oxidase: '−', Motility: '−', Lactose: '−', Mannitol: '+', LDC: '−', ODC: '−', VP: '−' },
    expected: { topId: ['shigella_flexneri', 'shigella'], minPct: 8 },
  },
  {
    name: 'Salmonella Paratyphi A',
    answers: { Oxidase: '−', Motility: '+', Indole: '−', Lactose: '−', LDC: '−', ODC: '+', VP: '−', Sucrose: '−', H2S: '−', Urease: '−' },
    expected: { topId: ['salmonella_paratyphi_a', 'salmonella', 'proteus_mirabilis'], minPct: 8 },
  },
  {
    name: 'Hafnia alvei',
    answers: { Oxidase: '−', VP: '+', LDC: '+', ODC: '+', Indole: '−', Motility: '+', Lactose: '−', H2S: '−', Urease: '−' },
    expected: { topId: ['hafnia_alvei', 'serratia_marcescens'], minPct: 10 },
  },
  {
    name: 'Enterobacter cloacae',
    answers: { Oxidase: '−', VP: '+', Indole: '−', Motility: '+', ODC: '+', LDC: '−', Lactose: '+', Sorbitol: '+' },
    expected: { topId: ['enterobacter_cloacae', 'enterobacter'], minPct: 10 },
  },
  {
    name: 'Enterobacter aerogenes',
    answers: { Oxidase: '−', VP: '+', Indole: '−', Motility: '+', LDC: '+', ODC: '+', Adonitol: '+' },
    expected: { topId: ['enterobacter_aerogenes', 'klebsiella_aerogenes'], minPct: 15 },
  },
  {
    name: 'Providencia rettgeri',
    answers: { Oxidase: '−', Indole: '+', Urease: '+', Lactose: '−', Adonitol: '+' },
    expected: { topId: ['providencia_rettgeri', 'providencia'], minPct: 10 },
  },
  // NFB
  {
    name: 'P. fluorescens',
    group: 'nfb',
    answers: { Oxidase: '+', Pyocyanin: '−', Growth42c: '−', Nitrate: '−', Glucose: '+' },
    expected: { topId: 'pseudomonas_fluorescens', minPct: 15 },
  },
  {
    name: 'P. stutzeri',
    group: 'nfb',
    answers: { Oxidase: '+', Nitrate: '+', Pyocyanin: '−', Maltose: '+', Glucose: '+', Growth42c: '+', Lactose: '−' },
    expected: { topId: ['pseudomonas_stutzeri', 'b_pseudomallei'], minPct: 15 },
  },
  {
    name: 'P. putida',
    group: 'nfb',
    answers: { Oxidase: '+', Pyocyanin: '−', Growth42c: '−', Nitrate: '−', Glucose: '+', Gelatin: '−', Sucrose: '−', Maltose: '+' },
    expected: { topId: ['pseudomonas_putida', 'pseudomonas_fluorescens'], minPct: 5 },
  },
  {
    name: 'A. baumannii',
    group: 'nfb',
    answers: { Oxidase: '−', Glucose: '+', Nitrate: '−', Motility: '−', Pyocyanin: '−' },
    expected: { topId: ['acinetobacter_baumannii', 'acinetobacter'], minPct: 15 },
  },
  {
    name: 'B. thailandensis',
    group: 'nfb',
    answers: { Oxidase: '+', Glucose: '+', Arabinose: '+', Mannitol: '+', Motility: '+', Pyocyanin: '−', Nitrate: '−', Maltose: '+', Lactose: '+' },
    expected: { topId: ['burkholderia_thailandensis', 'burkholderia_cepacia'], minPct: 10 },
  },
  // Vibrio
  {
    name: 'V. parahaemolyticus',
    group: 'vibrio',
    answers: { Oxidase: '+', Indole: '+', Sucrose: '−', Salt0: '−', Salt6: '+', O129: '−' },
    expected: { topId: 'vibrio_parahaemolyticus', minPct: 15 },
  },
  {
    name: 'V. vulnificus',
    group: 'vibrio',
    answers: { Oxidase: '+', Indole: '+', Sucrose: '−', Salt0: '−', Salt6: '+', O129: '+', Lactose: '+' },
    expected: { topId: 'vibrio_vulnificus', minPct: 15 },
  },
  {
    name: 'V. alginolyticus',
    group: 'vibrio',
    answers: { Oxidase: '+', VP: '+', Sucrose: '+', Salt0: '−', Salt6: '+', Indole: '+', LDC: '+', Arabinose: '−' },
    expected: { topId: ['vibrio_alginolyticus', 'vibrio_cholerae'], minPct: 10 },
  },
  {
    name: 'V. mimicus',
    group: 'vibrio',
    answers: { Oxidase: '+', Indole: '+', Sucrose: '−', Salt0: '+', O129: '+', VP: '−', LDC: '+', ODC: '+', Inositol: '−' },
    expected: { topId: ['vibrio_mimicus', 'vibrio_vulnificus'], minPct: 10 },
  },
  {
    name: 'Plesiomonas shigelloides',
    group: 'vibrio',
    answers: { Oxidase: '+', Indole: '+', Sucrose: '−', Salt0: '+', O129: '+', Inositol: '+' },
    expected: { topId: 'plesiomonas_shigelloides', minPct: 25 },
  },
  {
    name: 'A. caviae',
    group: 'vibrio',
    answers: { Oxidase: '+', Indole: '+', VP: '−', Sucrose: '+', Glucose: '+' },
    expected: { topId: ['aeromonas_caviae', 'aeromonas'], minPct: 10 },
  },
  // GPC cluster
  {
    name: 'S. epidermidis',
    group: 'gpc_cluster',
    answers: { Coagulase: '−', Catalase: '+', Novobiocin: '−', Urease: '+', DNase: '−', Mannitol: '−' },
    expected: { topId: 's_epidermidis', minPct: 15 },
  },
  {
    name: 'S. haemolyticus',
    group: 'gpc_cluster',
    answers: { Coagulase: '−', Catalase: '+', Hemolysis: '+', Novobiocin: '−', Urease: '−', Trehalose: '+', Mannitol: 'V' },
    expected: { topId: ['s_haemolyticus', 's_epidermidis'], minPct: 8 },
  },
  {
    name: 'S. lugdunensis',
    group: 'gpc_cluster',
    answers: { Coagulase: '−', Catalase: '+', Novobiocin: '−', Mannitol: '+', Hemolysis: '+' },
    expected: { topId: ['s_lugdunensis', 's_epidermidis', 's_haemolyticus'], minPct: 8 },
  },
  // GPC chain
  {
    name: 'S. pyogenes',
    group: 'gpc_chain',
    answers: { Bacitracin: '+', PYR: '+', CAMP: '−', Hippurate: '−' },
    expected: { topId: 's_pyogenes', minPct: 25 },
  },
  {
    name: 'S. agalactiae',
    group: 'gpc_chain',
    answers: { CAMP: '+', Hippurate: '+', PYR: '−', Bacitracin: '−' },
    expected: { topId: 's_agalactiae', minPct: 25 },
  },
  {
    name: 'E. faecalis',
    group: 'gpc_chain',
    answers: { PYR: '+', VP: '+', Sorbitol: '+', Bacitracin: '−' },
    expected: { topId: 'enterococcus_faecalis', minPct: 15 },
  },
  {
    name: 'E. faecium',
    group: 'gpc_chain',
    answers: { PYR: '+', VP: '+', Sorbitol: '−', Bacitracin: '−' },
    expected: { topId: 'enterococcus_faecium', minPct: 15 },
  },
  // Neisseria
  {
    name: 'N. lactamica',
    group: 'gn_coccobacilli',
    answers: { Glucose: '+', Maltose: '+', Lactose: '+', Sucrose: '−' },
    expected: { topId: 'neisseria_lactamica', minPct: 25 },
  },
  {
    name: 'N. sicca',
    group: 'gn_coccobacilli',
    answers: { Glucose: '+', Maltose: '+', Sucrose: '+', Fructose: '+', Nitrate: '−' },
    expected: { topId: 'neisseria_sicca', minPct: 15 },
  },
  {
    name: 'N. mucosa',
    group: 'gn_coccobacilli',
    answers: { Glucose: '+', Maltose: '+', Sucrose: '+', Fructose: '+', Nitrate: '+' },
    expected: { topId: 'neisseria_mucosa', minPct: 15 },
  },
  // Yersinia pestis
  {
    name: 'Y. pestis',
    answers: { Oxidase: '−', Motility: '−', Urease: '−', Indole: '−', VP: '−', LDC: '−', ODC: '−', Sucrose: '−', Arabinose: '+', Trehalose: '+' },
    expected: { topId: ['yersinia_pestis', 'shigella', 'shigella_sonnei', 'shigella_flexneri'], minPct: 8 },
  },
]

const opts = { library: LIBRARY_CLEAN, mcmData: ALL_MCM_DATA, suites: ALL_SUITES }

describe('MCM Bayesian engine — textbook validation', () => {
  for (const s of SCENARIOS) {
    it(s.name, () => {
      const group = s.group || 'enterobacterales'
      const ranked = calcProbabilityBayes(group, s.answers, opts)
      expect(ranked.length).toBeGreaterThan(0)
      const top = ranked[0]
      const acceptableIds = Array.isArray(s.expected.topId) ? s.expected.topId : [s.expected.topId]
      expect(
        acceptableIds,
        `top should be one of [${acceptableIds.join(', ')}] (got ${top.id} @ ${top.pct}%)`
      ).toContain(top.id)
      expect(top.pct, `pct should be ≥ ${s.expected.minPct}`).toBeGreaterThanOrEqual(
        s.expected.minPct
      )
    })
  }
})

describe('MCM Bayesian engine — explainability metadata', () => {
  it('attaches per-test evidence to ranked species', () => {
    const ranked = calcProbabilityBayes(
      'enterobacterales',
      { Indole: '+', Citrate: '−', Urease: '−' },
      opts
    )
    const top = ranked[0]

    expect(top._evidence.length).toBe(3)
    expect(top._evidence.some((item) => item.source === 'mcm')).toBe(true)
    expect(top._evidence.every((item) => typeof item.likelihood === 'number')).toBe(true)
  })
})

describe('MCM Bayesian engine — honesty and calibration guards', () => {
  it('marks wrong-group observations as poor fit instead of a confident false leader', () => {
    const ranked = calcProbabilityBayes(
      'gpc_cluster',
      { Coagulase: '+', Catalase: '−' },
      opts,
      { gramReaction: 'negative', morphology: 'bacilli', arrangement: 'unknown' }
    )

    expect(ranked.length).toBeGreaterThan(0)
    expect(ranked[0].caseFitScore ?? 1).toBeLessThan(0.2)
    expect(ranked[0]._confidence).toBe('very_low')
    expect(ranked[0].contradictionCount ?? 0).toBeGreaterThan(0)
  })

  it('penalizes contradictory hybrid-mode profiles without hard-zeroing every candidate', () => {
    const ranked = calcProbabilityBayes(
      'enterobacterales',
      { Oxidase: '+', Indole: '+', Lactose: '+', H2S: '+', Urease: '+' },
      opts,
      { gramReaction: 'positive', morphology: 'cocci', arrangement: 'cluster' }
    )

    expect(ranked.some((item) => !item._excluded && (item.posteriorWithinCandidateSet ?? 0) > 0)).toBe(true)
    expect(ranked.every((item) => item._excluded)).toBe(false)
    expect(ranked[0].caseFitScore ?? 1).toBeLessThan(0.4)
    expect(ranked[0]._confidence).not.toBe('high')
  })

  it('strict mode can hard-exclude incompatible Gram or morphology gates', () => {
    const ranked = calcProbabilityBayes(
      'enterobacterales',
      { Oxidase: '−' },
      { ...opts, gateMode: 'strict' },
      { gramReaction: 'positive', morphology: 'cocci', arrangement: 'cluster' }
    )

    expect(ranked.length).toBeGreaterThan(0)
    expect(ranked.every((item) => item._excluded && item.pct === 0)).toBe(true)
  })

  it('normalizes non-excluded posterior probabilities across the candidate set', () => {
    const ranked = calcProbabilityBayes(
      'enterobacterales',
      { Indole: '+', Lactose: '+', Citrate: '−', TSI: 'A/A' },
      opts
    )
    const total = ranked
      .filter((item) => !item._excluded)
      .reduce((sum, item) => sum + (item.posteriorWithinCandidateSet ?? 0), 0)

    expect(total).toBeCloseTo(100, 6)
  })

  it('low evidence coverage lowers fit and confidence instead of faking certainty', () => {
    const ranked = calcProbabilityBayes(
      'enterobacterales',
      { ImaginaryTestOne: '+', ImaginaryTestTwo: '−', Indole: '+' },
      opts
    )

    expect(ranked[0].evidenceCoverage).toBeLessThan(0.5)
    expect(ranked[0].caseFitScore ?? 1).toBeLessThan(0.5)
    expect(ranked[0]._confidence).toBe('very_low')
  })
})

describe('MCM Bayesian engine — TSI categorical model', () => {
  const posteriorFor = (ranked: ReturnType<typeof calcProbabilityBayes>, id: string) => {
    const hit = ranked.find((item) => item.id === id)
    expect(hit, `expected ${id} in ranked results`).toBeTruthy()
    return hit?.posteriorWithinCandidateSet ?? hit?.pct ?? 0
  }

  const evidenceFor = (ranked: ReturnType<typeof calcProbabilityBayes>, id: string) => {
    const hit = ranked.find((item) => item.id === id)
    expect(hit, `expected ${id} in ranked results`).toBeTruthy()
    return hit?._evidence.find((item) => item.test === 'TSI')
  }

  it('TSI K/A + H2S supports Proteus or Salmonella over E. coli and Shigella-like profiles', () => {
    const ranked = calcProbabilityBayes('enterobacterales', { TSI: 'K/A H₂S' }, opts)

    const h2sPositive = Math.max(
      posteriorFor(ranked, 'proteus_mirabilis'),
      posteriorFor(ranked, 'salmonella')
    )

    expect(h2sPositive).toBeGreaterThan(posteriorFor(ranked, 'e_coli'))
    expect(h2sPositive).toBeGreaterThan(posteriorFor(ranked, 'shigella_sonnei'))
  })

  it('TSI A/A supports lactose or sucrose fermenters over non-lactose fermenters', () => {
    const ranked = calcProbabilityBayes('enterobacterales', { TSI: 'A/A' }, opts)

    expect(posteriorFor(ranked, 'e_coli')).toBeGreaterThan(posteriorFor(ranked, 'shigella_sonnei'))
    expect(evidenceFor(ranked, 'e_coli')?.likelihood).toBeGreaterThan(
      evidenceFor(ranked, 'shigella_sonnei')?.likelihood ?? 1
    )
  })

  it('TSI K/A without H2S separates Shigella-like profiles from H2S-positive organisms', () => {
    const ranked = calcProbabilityBayes('enterobacterales', { TSI: 'K/A' }, opts)

    expect(posteriorFor(ranked, 'shigella_sonnei')).toBeGreaterThan(
      posteriorFor(ranked, 'proteus_mirabilis')
    )
    expect(evidenceFor(ranked, 'shigella_sonnei')?.likelihood).toBeGreaterThan(
      evidenceFor(ranked, 'proteus_mirabilis')?.likelihood ?? 1
    )
  })

  it('unsupported TSI values are neutral and do not crash', () => {
    const ranked = calcProbabilityBayes('enterobacterales', { TSI: 'purple/green' }, opts)

    expect(ranked.length).toBeGreaterThan(0)
    expect(evidenceFor(ranked, 'e_coli')?.likelihood).toBe(0.5)
  })

  it('normalizes probability output after TSI evidence', () => {
    const ranked = calcProbabilityBayes('enterobacterales', { TSI: 'K/A H₂S' }, opts)
    const total = ranked.reduce((sum, item) => sum + (item.posteriorWithinCandidateSet ?? 0), 0)

    expect(total).toBeCloseTo(100, 6)
  })
})

describe('MCM Bayesian engine — next best test recommendations', () => {
  it('recommends tests that split the uncertainty', () => {
    const group = 'enterobacterales'
    const rankedEmpty = calcProbabilityBayes(group, {}, opts)
    const recs = calcNextBestTests(group, {}, rankedEmpty, opts)

    expect(recs.length).toBeGreaterThan(0)
    expect(recs[0].entropyReduction).toBeGreaterThan(0)

    const answers = { Indole: '+' }
    const rankedPartial = calcProbabilityBayes(group, answers, opts)
    const recsPartial = calcNextBestTests(group, answers, rankedPartial, opts)

    // Ensure we do not recommend tests already answered
    expect(recsPartial.some((r) => r.testLabel === 'Indole' || r.testId === 'Indole')).toBe(false)
  })
})

describe('MCM Bayesian engine — diagnostic reasoning regressions', () => {
  const findSpecies = (ranked: RankedSpecies[], id: string) => {
    const hit = ranked.find((item) => item.id === id)
    expect(hit, `expected ${id} in ranked candidates`).toBeTruthy()
    return hit!
  }

  const topIds = (ranked: RankedSpecies[], count = 3) => ranked.slice(0, count).map((item) => item.id)

  it('prioritizes the Gram-positive cocci cluster workflow before Staphylococcus ranking', () => {
    const selection = selectSuiteForObservation(
      { gramReaction: 'positive', morphology: 'cocci', arrangement: 'cluster' },
      DEFAULT_SUITES,
    )
    expect(selection?.groupId).toBe('gpc_cluster')

    const ranked = calcProbabilityBayes(
      selection!.groupId,
      { Catalase: '+', Coagulase: '+', DNase: '+', Mannitol: '+' },
      opts,
      { gramReaction: 'positive', morphology: 'cocci', arrangement: 'cluster' },
    )

    expect(ranked[0].id).toBe('s_aureus')
    expect(ranked[0].caseFitScore ?? 0).toBeGreaterThan(0.4)
    expect(ranked[0]._confidence).not.toBe('very_low')
  })

  it('prioritizes the Gram-negative rod workflow before Enterobacterales ranking', () => {
    const selection = selectSuiteForObservation(
      { specimen: 'urine', gramReaction: 'negative', morphology: 'bacilli', arrangement: 'single' },
      DEFAULT_SUITES,
    )
    expect(selection?.groupId).toBe('enterobacterales')

    const ranked = calcProbabilityBayes(
      selection!.groupId,
      { Oxidase: '−', Indole: '+', Citrate: '−', Urease: '−', Lactose: '+' },
      opts,
      { specimen: 'urine', gramReaction: 'negative', morphology: 'bacilli', arrangement: 'single' },
    )

    expect(ranked[0].id).toBe('e_coli')
    expect(findSpecies(ranked, 'e_coli').posteriorWithinCandidateSet ?? 0).toBeGreaterThan(
      findSpecies(ranked, 'klebsiella_pneumoniae').posteriorWithinCandidateSet ?? 0,
    )
  })

  it('separates Staphylococcus and Streptococcus workflows from Gram arrangement and catalase evidence', () => {
    const staphSelection = selectSuiteForObservation(
      { gramReaction: 'positive', morphology: 'cocci', arrangement: 'cluster' },
      DEFAULT_SUITES,
    )
    const strepSelection = selectSuiteForObservation(
      { gramReaction: 'positive', morphology: 'cocci', arrangement: 'chain' },
      DEFAULT_SUITES,
    )

    expect(staphSelection?.groupId).toBe('gpc_cluster')
    expect(strepSelection?.groupId).toBe('gpc_chain')

    const staphRanked = calcProbabilityBayes(
      'gpc_cluster',
      { Catalase: '+', Coagulase: '+', DNase: '+' },
      opts,
      { gramReaction: 'positive', morphology: 'cocci', arrangement: 'cluster' },
    )
    const strepRanked = calcProbabilityBayes(
      'gpc_chain',
      { Catalase: '−', Hemolysis: 'β', PYR: '+', Bacitracin: 'S' },
      opts,
      { gramReaction: 'positive', morphology: 'cocci', arrangement: 'chain' },
    )

    expect(staphRanked[0].id).toBe('s_aureus')
    expect(strepRanked[0].id).toBe('s_pyogenes')
    expect(staphRanked[0]._evidence.some((item) => item.test === 'Catalase' && item.direction === 'supportive')).toBe(true)
    expect(strepRanked[0]._evidence.some((item) => item.test === 'Catalase' && item.direction === 'supportive')).toBe(true)
  })

  it('differentiates common Enterobacterales by ranked evidence rather than exact percentages', () => {
    const ecoliRanked = calcProbabilityBayes(
      'enterobacterales',
      { Oxidase: '−', Indole: '+', Citrate: '−', Urease: '−', Motility: '+', Lactose: '+' },
      opts,
      { gramReaction: 'negative', morphology: 'bacilli' },
    )
    const klebsiellaRanked = calcProbabilityBayes(
      'enterobacterales',
      { Oxidase: '−', Indole: '−', VP: '+', Motility: '−', Urease: '+', Lactose: '+' },
      opts,
      { gramReaction: 'negative', morphology: 'bacilli' },
    )

    expect(ecoliRanked[0].id).toBe('e_coli')
    expect(klebsiellaRanked[0].id).toBe('klebsiella_pneumoniae')
    expect(findSpecies(ecoliRanked, 'e_coli').posteriorWithinCandidateSet ?? 0).toBeGreaterThan(
      findSpecies(ecoliRanked, 'klebsiella_pneumoniae').posteriorWithinCandidateSet ?? 0,
    )
    expect(findSpecies(klebsiellaRanked, 'klebsiella_pneumoniae').posteriorWithinCandidateSet ?? 0).toBeGreaterThan(
      findSpecies(klebsiellaRanked, 'e_coli').posteriorWithinCandidateSet ?? 0,
    )
  })

  it('keeps Salmonella-like non-lactose H2S-positive profiles above E. coli-like profiles', () => {
    const ranked = calcProbabilityBayes(
      'enterobacterales',
      { Oxidase: '−', TSI: 'K/A H₂S', H2S: '+', Indole: '−', Citrate: '+', Motility: '+', Lactose: '−', LDC: '+', VP: '−' },
      opts,
      { gramReaction: 'negative', morphology: 'bacilli' },
    )

    expect(topIds(ranked, 4)).toContain('salmonella')
    expect(findSpecies(ranked, 'salmonella').posteriorWithinCandidateSet ?? 0).toBeGreaterThan(
      findSpecies(ranked, 'e_coli').posteriorWithinCandidateSet ?? 0,
    )
    expect(findSpecies(ranked, 'salmonella')._evidence.some((item) => item.test === 'TSI' && item.direction === 'supportive')).toBe(true)
  })

  it('keeps E. coli-like lactose-fermenting indole-positive profiles above Salmonella-like profiles', () => {
    const ranked = calcProbabilityBayes(
      'enterobacterales',
      { Oxidase: '−', TSI: 'A/A', Indole: '+', Citrate: '−', Urease: '−', Motility: '+', Lactose: '+' },
      opts,
      { gramReaction: 'negative', morphology: 'bacilli' },
    )

    expect(ranked[0].id).toBe('e_coli')
    expect(findSpecies(ranked, 'e_coli').posteriorWithinCandidateSet ?? 0).toBeGreaterThan(
      findSpecies(ranked, 'salmonella').posteriorWithinCandidateSet ?? 0,
    )
  })

  it('keeps ambiguous biochemical evidence low-confidence while preserving plausible candidates', () => {
    const ranked = calcProbabilityBayes(
      'enterobacterales',
      { Oxidase: '−', Indole: 'V', Citrate: 'V', Lactose: 'V' },
      opts,
      { gramReaction: 'negative', morphology: 'bacilli' },
    )

    expect(ranked.length).toBeGreaterThan(3)
    expect(ranked[0]._confidence).not.toBe('high')
    expect(ranked[0]._gap ?? 100).toBeLessThan(40)
    expect(ranked[0]._evidence.some((item) => item.direction === 'neutral')).toBe(true)
  })

  it('penalizes contradictory biochemical evidence without pretending the profile is a clean match', () => {
    const ranked = calcProbabilityBayes(
      'enterobacterales',
      { Oxidase: '+', Indole: '+', Lactose: '+', H2S: '+', Urease: '+' },
      opts,
      { gramReaction: 'negative', morphology: 'bacilli' },
    )
    const ecoli = findSpecies(ranked, 'e_coli')

    expect(ranked[0].caseFitScore ?? 1).toBeLessThan(0.7)
    expect(ranked[0]._confidence).not.toBe('high')
    expect(ranked.some((item) => (item.contradictionCount ?? 0) > 0)).toBe(true)
    expect(ecoli._evidence.some((item) => item.direction === 'conflicting')).toBe(true)
  })

  it('labels insufficient evidence as lower confidence even when priors produce a leader', () => {
    const ranked = calcProbabilityBayes(
      'enterobacterales',
      { Indole: '+' },
      opts,
      { gramReaction: 'negative', morphology: 'bacilli' },
    )

    expect(ranked[0].id).toBe('e_coli')
    expect(ranked[0]._confidence).not.toBe('high')
    expect(ranked[0]._gap ?? 0).toBeLessThan(50)
  })

  it('tracks unknown or unsupported tests as missing evidence without changing the posterior direction', () => {
    const baseline = calcProbabilityBayes('enterobacterales', { Indole: '+' }, opts)
    const withUnsupported = calcProbabilityBayes(
      'enterobacterales',
      {
        Indole: '+',
        ImaginarySugar: 'sparkly',
        ImaginaryEnzyme: '+',
        ImaginaryBroth: '−',
        ImaginaryDisk: 'S',
        ImaginaryColor: 'blue',
      },
      opts,
    )

    expect(withUnsupported[0].id).toBe(baseline[0].id)
    expect(withUnsupported[0].evidenceCoverage).toBeLessThan(baseline[0].evidenceCoverage)
    expect(withUnsupported[0]._evidence.some((item) => item.test === 'ImaginarySugar' && item.source === 'missing')).toBe(true)
    expect(withUnsupported[0]._confidence).toBe('very_low')
  })

  it('uses the active custom biochemical suite for canonical fallback evidence', () => {
    const customSuite: TestSuite = {
      id: 'custom_enterobacterales_minimal',
      name: 'Custom Enterobacterales Minimal',
      owner: 'user',
      group: 'enterobacterales',
      tests: [
        { testId: 'oxidase', required: true, order: 1 },
        { testId: 'indole', required: true, order: 2 },
        { testId: 'lactose', required: true, order: 3 },
      ],
    }
    const customSuites = buildSuitesMap(DEFAULT_SUITES, customSuite)
    const ranked = calcProbabilityBayes(
      'enterobacterales',
      { Oxidase: '−', Indole: '+', Lactose: '+' },
      { ...opts, suites: customSuites },
      { gramReaction: 'negative', morphology: 'bacilli' },
    )

    expect(ranked[0].id).toBe('e_coli')
    expect(ranked[0]._evidence).toHaveLength(3)
    expect(ranked[0]._evidence.map((item) => item.test)).toEqual(['Oxidase', 'Indole', 'Lactose'])
  })

  it('recommends unanswered suite-relevant tests with positive information gain', () => {
    const answers = { Indole: '+' }
    const ranked = calcProbabilityBayes('enterobacterales', answers, opts)
    const recs = calcNextBestTests('enterobacterales', answers, ranked, opts)
    const suiteTestIds = new Set(ALL_SUITES.enterobacterales.tests.map((test) => test.id))

    expect(recs.length).toBeGreaterThan(0)
    expect(recs[0].entropyReduction).toBeGreaterThan(0)
    expect(recs[0].practicalScore).toBeGreaterThan(recs[0].entropyReduction)
    expect(recs.some((rec) => rec.testId === 'indole')).toBe(false)
    expect(recs.slice(0, 5).some((rec) => suiteTestIds.has(rec.testId))).toBe(true)
  })

  it('calibrates confidence labels using evidence coverage, fit, and runner-up gap', () => {
    const strong = calcProbabilityBayes(
      'enterobacterales',
      { Oxidase: '−', Indole: '+', Citrate: '−', Urease: '−', Motility: '+', Lactose: '+', TSI: 'A/A' },
      opts,
      { gramReaction: 'negative', morphology: 'bacilli' },
    )
    const sparse = calcProbabilityBayes(
      'enterobacterales',
      { Indole: '+' },
      opts,
      { gramReaction: 'negative', morphology: 'bacilli' },
    )
    const poorFit = calcProbabilityBayes(
      'enterobacterales',
      { Oxidase: '+', H2S: '+', Urease: '+', Lactose: '+' },
      opts,
      { gramReaction: 'positive', morphology: 'cocci', arrangement: 'cluster' },
    )

    expect(strong[0]._confidence).not.toBe('very_low')
    expect(strong[0]._gap ?? 0).toBeGreaterThan(sparse[0]._gap ?? 100)
    expect(sparse[0]._confidence).not.toBe('high')
    expect(poorFit[0]._confidence).not.toBe('high')
    expect(poorFit[0].caseFitScore ?? 1).toBeLessThan(strong[0].caseFitScore ?? 0)
  })

  it('keeps ruled-out organism evidence available for explanation in strict mode', () => {
    const ranked = calcProbabilityBayes(
      'gpc_cluster',
      { Catalase: '−', Coagulase: '+' },
      { ...opts, gateMode: 'strict' },
      { gramReaction: 'positive', morphology: 'cocci', arrangement: 'cluster' },
    )
    const aureus = findSpecies(ranked, 's_aureus')

    expect(aureus._excluded).toBe(true)
    expect(aureus.pct).toBe(0)
    expect(aureus._evidence.some((item) => item.test === 'Catalase' && item.direction === 'conflicting')).toBe(true)
  })
})
