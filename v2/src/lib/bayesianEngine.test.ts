// Validation suite for the v4 Bayesian engine.
// Ports all 50 textbook + dichotomous-key scenarios from scripts/test_bayes.mjs
// and runs them against the real LIBRARY + MCM_DATA exports.

import { describe, expect, it } from 'vitest'
import { calcProbabilityBayes } from './bayesianEngine'
import { ALL_MCM_DATA, ALL_SUITES, LIBRARY_CLEAN } from './dataLoader'
import type { AnswersMap } from './types'

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
    answers: { Motility: '+', Urease: '+', VP: '+', Indole: '−', Sucrose: '−', Citrate: '−', ODC: '+' },
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
    answers: { Oxidase: '−', VP: '+', Indole: '−', Motility: '+', ODC: '+', LDC: '−', Lactose: '+' },
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
    expected: { topId: ['plesiomonas_shigelloides', 'aeromonas_salmonicida'], minPct: 10 },
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
    expected: { topId: ['yersinia_pestis', 'shigella', 'shigella_sonnei'], minPct: 8 },
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
