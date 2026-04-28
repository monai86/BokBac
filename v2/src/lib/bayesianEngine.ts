// MCM 11th Edition Naive Bayes probability engine for bacterial identification
// (ported from index.html v3.1.0 → strongly-typed v4.0.0).

import type {
  AnswersMap,
  ConfidenceLevel,
  McmDataMap,
  RankedSpecies,
  Species,
  SuitesMap,
} from './types'
import {
  HARD_EXCLUSION_TESTS,
  getCanonicalBiochemRows,
  getKeyTestsForBug,
  testMatch,
} from './testMatcher'
import { lookupMcmTest, mcmLikelihood, PRIOR_MAP } from './mcmAdapter'

export interface BayesOptions {
  /** Library of all candidate species (already normalized by suite labels). */
  library: Species[]
  /** MCM canonical biochemical data, keyed by species id. */
  mcmData: McmDataMap
  /** Test suite definitions, keyed by group id. */
  suites: SuitesMap
}

const EPS = 0.02 // smoothing — represents 2% noise floor for log-likelihood

interface IntermediateResult {
  bug: Species
  logPosterior: number
  hardExcluded: boolean
  keyMatch: number
  keyMismatch: number
  usedMcmTests: number
  mcmAvailable: boolean
}

function determineConfidence(topPct: number, gap: number, nAnswered: number): ConfidenceLevel {
  if (topPct >= 70 && gap >= 25 && nAnswered >= 3) return 'high'
  if (topPct >= 50 || gap >= 10) return 'medium'
  if (topPct < 25) return 'very_low'
  return 'low'
}

/**
 * Naive Bayes probability calculator using MCM data when available, with
 * fallback to legacy LIBRARY +/-/V data weighted at 70%.
 *
 * Algorithm (high level):
 *   1. Hard-exclude species whose oxidase/catalase/coagulase/hemolysis result
 *      mismatches the user's answer.
 *   2. Sum per-test log-likelihoods from MCM % positivity (smoothed).
 *   3. Add log-prior from clinical prevalence (++++ frequent → 1.0, etc.).
 *   4. Softmax over remaining candidates → calibrated %.
 *   5. Coverage scaling so single-test scenarios stay below 100%.
 *   6. Tag the top result with a confidence level (HIGH/MEDIUM/LOW/VERY_LOW).
 */
export function calcProbabilityBayes(
  group: string,
  answers: AnswersMap,
  opts: BayesOptions
): RankedSpecies[] {
  const { library, mcmData, suites } = opts
  const candidates = library.filter((b) => b.group === group)
  const answerEntries = Object.entries(answers).filter(([, v]) => v != null && v !== '')

  const results: IntermediateResult[] = candidates.map((bug) => {
    const mcm = mcmData[bug.id]
    const tests = getCanonicalBiochemRows(bug, suites)
    const keyTestsForBug = getKeyTestsForBug(bug, suites)
    let hardExcluded = false
    let keyMatch = 0
    let keyMismatch = 0

    // Step 1: Hard exclusion check
    for (const [ansKey, ans] of answerEntries) {
      const cleanKey = ansKey.toLowerCase().replace(/[^a-z0-9]/g, '')
      const isHard = HARD_EXCLUSION_TESTS.some((k) => {
        const kk = k.replace(/[^a-z0-9]/g, '')
        return cleanKey === kk || cleanKey.includes(kk) || kk.includes(cleanKey)
      })
      if (!isHard) continue
      const testDef = tests.find((b) => {
        const bk = b.t.toLowerCase().replace(/[^a-z0-9]/g, '')
        return bk === cleanKey || cleanKey.includes(bk) || bk.includes(cleanKey)
      })
      if (testDef && testMatch(testDef.r, ans) === false) {
        hardExcluded = true
        break
      }
    }

    // Step 2: Compute log-likelihood
    let logLik = 0
    let usedMcmTests = 0

    for (const [ansKey, ans] of answerEntries) {
      const cleanKey = ansKey.toLowerCase().replace(/[^a-z0-9]/g, '')
      const mcmTestId = lookupMcmTest(ansKey)

      // MCM-based likelihood
      if (mcm && mcmTestId && mcm.tests && mcm.tests[mcmTestId] != null) {
        const pct = mcm.tests[mcmTestId]
        const lik = mcmLikelihood(pct, ans)
        if (lik != null) {
          const smoothed = Math.max(EPS, Math.min(1 - EPS, lik))
          logLik += Math.log(smoothed)
          usedMcmTests++
          const isKey = keyTestsForBug.some((kt) => {
            const kk = kt.t.toLowerCase().replace(/[^a-z0-9]/g, '')
            return kk === cleanKey || cleanKey.includes(kk) || kk.includes(cleanKey)
          })
          if (isKey) {
            if (smoothed > 0.5) keyMatch++
            else if (smoothed < 0.3) keyMismatch++
          }
          continue
        }
      }

      // Fallback: legacy LIBRARY +/-/V data at 70% weight
      const testDef = tests.find((b) => {
        const bk = b.t.toLowerCase().replace(/[^a-z0-9]/g, '')
        return bk === cleanKey || cleanKey.includes(bk) || bk.includes(cleanKey)
      })
      let usedFallback = false
      if (testDef) {
        const r = testDef.r.replace(/−/g, '-').toLowerCase()
        let estPct: number | null = null
        if (r === '+') estPct = 90
        else if (r === '-') estPct = 10
        else if (r === 'v' || r.includes('+/-') || r.includes('-/+')) estPct = 50
        if (estPct != null) {
          const lik = mcmLikelihood(estPct, ans)
          if (lik != null) {
            const smoothed = Math.max(EPS, Math.min(1 - EPS, lik))
            logLik += Math.log(smoothed) * 0.7
            usedFallback = true
          }
        }
      }
      if (!usedFallback) {
        // Uninformative likelihood — log(0.5) ≈ -0.693 ensures rich-data species win.
        logLik += Math.log(0.5)
      }
    }

    // Step 3: Log-prior from prevalence
    const priorScore = mcm && typeof mcm.prevalence_score === 'number' ? mcm.prevalence_score : 2
    const prior = PRIOR_MAP[priorScore] ?? 0.2
    const logPrior = Math.log(prior)

    return {
      bug,
      logPosterior: logLik + logPrior,
      hardExcluded,
      keyMatch,
      keyMismatch,
      usedMcmTests,
      mcmAvailable: !!mcm,
    }
  })

  // Step 4: Softmax (numerically stable)
  const maxLp = Math.max(...results.map((r) => (r.hardExcluded ? -Infinity : r.logPosterior)))
  const weights = results.map((r) => (r.hardExcluded ? 0 : Math.exp(r.logPosterior - maxLp)))
  const totalW = weights.reduce((s, w) => s + w, 0) || 1

  // Step 5: Coverage scaling
  const nAnswered = answerEntries.length
  const SUITE_SIZE = suites[group]?.tests?.length || 8
  const coverageFactor = Math.min(
    1,
    0.5 + 0.5 * (Math.log2(nAnswered + 1) / Math.log2(SUITE_SIZE + 1))
  )

  // Step 6: Final %
  const ranked: RankedSpecies[] = results
    .map((r, i) => {
      let pct: number
      if (r.hardExcluded) {
        pct = 0
      } else {
        const rawPct = (weights[i] / totalW) * 100
        pct = Math.round(rawPct * coverageFactor)
      }
      return {
        ...r.bug,
        pct: Math.max(0, Math.min(99, pct)),
        _keyMatch: r.keyMatch,
        _keyMismatch: r.keyMismatch,
        _excluded: r.hardExcluded,
        _mcm: r.mcmAvailable,
        _usedMcmTests: r.usedMcmTests,
      } as RankedSpecies
    })
    .sort((a, b) => {
      if (b.pct !== a.pct) return b.pct - a.pct
      if (b._usedMcmTests !== a._usedMcmTests) return b._usedMcmTests - a._usedMcmTests
      return b._keyMatch - a._keyMatch
    })

  // Step 7: Confidence label on top result
  if (ranked.length > 0) {
    const top = ranked[0]
    const second = ranked.find((r, i) => i > 0 && !r._excluded) ?? { pct: 0 }
    const gap = top.pct - second.pct
    top._confidence = determineConfidence(top.pct, gap, nAnswered)
    top._gap = gap
  }

  return ranked
}
