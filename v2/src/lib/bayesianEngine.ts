// MCM 11th Edition Naive Bayes probability engine for bacterial identification
// (ported from index.html v3.1.0 → strongly-typed v4.0.0, refactored to support custom suites, gates, and separate coverage).

import type {
  AnswersMap,
  ConfidenceLevel,
  McmDataMap,
  RankedSpecies,
  Species,
  SuitesMap,
  EvidenceDirection,
  TestEvidence,
  RecommendedTest,
  InitialObservation,
} from './types'
import {
  HARD_EXCLUSION_TESTS,
  getCanonicalBiochemRows,
  getKeyTestsForBug,
  testMatch,
  TEST_ALIASES,
} from './testMatcher'
import { lookupMcmTest, mcmLikelihood, PRIOR_MAP } from './mcmAdapter'
import { lookupTestDefinition, BIOCHEMICAL_TEST_REGISTRY } from '../data/tests/biochemicalTestRegistry'
import { TEST_CORRELATION_GROUPS } from './correlationConfig'
import { categoricalLikelihood, OUTCOME_MODELS } from './outcomeModels'
import { normalizeTestKeyToId } from './suiteCatalog'

export interface BayesOptions {
  /** Library of all candidate species. */
  library: Species[]
  /** MCM canonical biochemical data, keyed by species id. */
  mcmData: McmDataMap
  /** Test suite definitions, keyed by group id. */
  suites: SuitesMap
  /** Mode for handling strict exclusions */
  gateMode?: 'strict' | 'hybrid' | 'exploratory'
}

const EPS = 0.02 // smoothing — represents 2% noise floor for log-likelihood
const STRONG_CONTRADICTION_LIKELIHOOD = 0.01
export const FALLBACK_WEIGHT = 0.7

function getCorrelationWeight(ansKey: string, answeredCanonicalKeys: string[]): number {
  const cleanAns = ansKey.toLowerCase().replace(/[^a-z0-9]/g, '')
  
  const group = TEST_CORRELATION_GROUPS.find(g => 
    g.some(testId => {
      const cleanId = testId.replace(/[^a-z0-9]/g, '')
      return cleanAns === cleanId || cleanAns.includes(cleanId) || cleanId.includes(cleanAns)
    })
  )

  if (!group) return 1.0

  const alreadyProcessed = answeredCanonicalKeys.some(otherKey => {
    if (otherKey === cleanAns) return false
    return group.some(testId => {
      const cleanId = testId.replace(/[^a-z0-9]/g, '')
      return otherKey === cleanId || otherKey.includes(cleanId) || cleanId.includes(otherKey)
    })
  })

  return alreadyProcessed ? 0.5 : 1.0
}

function getBaseId(id: string): string {
  const suffixes = ['_cluster', '_chain', '_nfb', '_gnc', '_gpb', '_v'];
  let base = id.toLowerCase();
  for (const suffix of suffixes) {
    if (base.endsWith(suffix)) {
      base = base.substring(0, base.length - suffix.length);
      break;
    }
  }
  return base;
}

function getGroupDefaultTestResult(group: string, testId: string): string | undefined {
  const cleanId = testId.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (cleanId === 'oxidase') {
    if (group === 'enterobacterales') return '−'
  }
  if (cleanId === 'catalase') {
    if (group === 'gpc_cluster') return '+'
    if (group === 'gpc_chain') return '−'
  }
  if (cleanId === 'coagulase') {
    if (group === 'gpc_cluster') return '−'
  }
  return undefined
}

function checkGateMatch(bug: Species, obs: InitialObservation): boolean {
  if (obs.gramReaction && obs.gramReaction !== 'unknown' && obs.gramReaction !== 'variable') {
    const bugGram = String(bug.gram || '').replace(/−/g, '-').trim()
    if (obs.gramReaction === 'positive' && bugGram !== '+') return false
    if (obs.gramReaction === 'negative' && bugGram !== '-') return false
  }

  if (obs.morphology && obs.morphology !== 'unknown') {
    const bugMorph = String(bug.morph || '').toLowerCase()
    const morph = obs.morphology
    if (morph === 'cocci') {
      if (!bugMorph.includes('cocci') && !bugMorph.includes('coccus')) return false
    } else if (morph === 'bacilli') {
      if (!bugMorph.includes('rod') && !bugMorph.includes('bacill') && !bugMorph.includes('coccobacill')) return false
    } else if (morph === 'coccobacilli') {
      if (!bugMorph.includes('coccobacill')) return false
    } else if (morph === 'curved_rod') {
      if (!bugMorph.includes('curved') && !bugMorph.includes('comma')) return false
    } else if (morph === 'branching_filament') {
      if (!bugMorph.includes('filament') && !bugMorph.includes('branching')) return false
    }
  }
  return true
}

function determineConfidence(
  topPct: number,
  gap: number,
  nAnswered: number,
  caseFitScore: number,
  evidenceCoverage: number
): ConfidenceLevel {
  if (caseFitScore < 0.2 || evidenceCoverage < 0.2) return 'very_low'
  if (caseFitScore >= 0.7 && topPct >= 70 && gap >= 25 && nAnswered >= 3) return 'high'
  if (caseFitScore >= 0.4 && (topPct >= 50 || gap >= 10)) return 'medium'
  if (topPct < 25) return 'very_low'
  return 'low'
}

function evidenceDirection(likelihood: number): EvidenceDirection {
  if (likelihood > 0.55) return 'supportive'
  if (likelihood < 0.35) return 'conflicting'
  return 'neutral'
}

interface IntermediateResult {
  bug: Species
  logPosterior: number
  hardExcluded: boolean
  keyMatch: number
  keyMismatch: number
  usedMcmTests: number
  mcmAvailable: boolean
  evidence: TestEvidence[]
  evidenceCoverage: number
  typicalityIndex: number
  contradictionCount: number
  caseFitScore: number
}

/**
 * Naive Bayes probability calculator using MCM data when available, with
 * fallback to legacy LIBRARY +/-/V data weighted at 70%.
 */
export function calcProbabilityBayes(
  group: string,
  answers: AnswersMap,
  opts: BayesOptions,
  initialObservation?: InitialObservation
): RankedSpecies[] {
  const { library, mcmData, suites, gateMode = 'hybrid' } = opts
  const candidates = gateMode === 'exploratory'
    ? library
    : library.filter((b) => b.group === group)
  const answerEntries = Object.entries(answers).filter(([, v]) => v != null && v !== '')

  const results: IntermediateResult[] = candidates.map((bug) => {
    const mcm = mcmData[bug.id]
    const tests = getCanonicalBiochemRows(bug, suites)
    const keyTestsForBug = getKeyTestsForBug(bug, suites)
    let hardExcluded = false
    let keyMatch = 0
    let keyMismatch = 0
    let contradictionCount = 0
    let logLik = 0
    const evidence: TestEvidence[] = []

    // Step 1: Gram / morphology gate check
    if (initialObservation && !checkGateMatch(bug, initialObservation)) {
      if (gateMode === 'strict') {
        hardExcluded = true
      } else if (gateMode === 'hybrid') {
        contradictionCount++
        logLik -= 4.0 // Strong penalty for hybrid mode
      } else {
        logLik -= 1.0 // Minor penalty for exploratory mode
      }
    }

    // Step 1.5: Cross-group penalty for exploratory mode
    if (gateMode === 'exploratory' && bug.group !== group) {
      logLik -= 3.0 // Prior penalty for searching outside target group
    }

    // Step 2: Compute log-likelihood
    let usedMcmTests = 0
    let answeredWithData = 0
    const processedCanonicalKeys: string[] = []
    let typicalityProd = 1.0
    let typicalityCount = 0

    for (const [ansKey, ans] of answerEntries) {
      const cleanKey = ansKey.toLowerCase().replace(/[^a-z0-9]/g, '')
      const testDef = lookupTestDefinition(cleanKey) || lookupTestDefinition(lookupMcmTest(ansKey) || '')
      const mcmTestId = lookupMcmTest(ansKey)
      const meaning = testDef?.resultKind === 'susceptibility' ? testDef.susceptibilityMeaning : undefined
      const categoricalModel = OUTCOME_MODELS[testDef?.id.toLowerCase() || cleanKey]

      const isKey = keyTestsForBug.some((kt) => {
        const kk = kt.t.toLowerCase().replace(/[^a-z0-9]/g, '')
        return kk === cleanKey || cleanKey.includes(kk) || kk.includes(cleanKey)
      })

      const isHardExclusionTest = HARD_EXCLUSION_TESTS.some((k) => {
        const kk = k.replace(/[^a-z0-9]/g, '')
        return cleanKey === kk || cleanKey.includes(kk) || kk.includes(cleanKey)
      })

      const mcmHasData = mcm && mcmTestId && mcm.tests && mcm.tests[mcmTestId] != null
      let bugBiochemRow = tests.find((b) => {
        if (b.id) {
          const bNorm = normalizeTestKeyToId(b.id)
          const kNorm = normalizeTestKeyToId(cleanKey)
          const bidClean = getBaseId(bNorm).replace(/[^a-z0-9]/g, '')
          const testIdClean = getBaseId(kNorm).replace(/[^a-z0-9]/g, '')
          return bidClean === testIdClean || b.id === cleanKey || bNorm === kNorm
        }
        const bk = b.t.toLowerCase().replace(/[^a-z0-9]/g, '')
        if (bk === cleanKey || cleanKey.includes(bk) || bk.includes(cleanKey)) return true
        const aliases = TEST_ALIASES[cleanKey] || []
        return aliases.some(alias => {
          const normAlias = alias.toLowerCase().replace(/[^a-z0-9]/g, '')
          return bk === normAlias || bk.includes(normAlias) || normAlias.includes(bk)
        })
      })

      // If missing from biochem rows, check group default
      if ((!bugBiochemRow || bugBiochemRow.r === '—' || bugBiochemRow.r === 'N/A') && testDef) {
        const defVal = getGroupDefaultTestResult(group, testDef.id)
        if (defVal) {
          bugBiochemRow = { t: testDef.label, r: defVal, n: 'Group default' }
        }
      }

      const libraryHasData = bugBiochemRow && bugBiochemRow.r !== '—' && bugBiochemRow.r !== 'N/A'
      const compositeMcmLikelihood = mcm && categoricalModel?.computeLikelihoodFromTraits
        ? categoricalModel.computeLikelihoodFromTraits(mcm.tests, ans, group)
        : null
      const hasCompositeMcmData = compositeMcmLikelihood != null

      // Check missing data
      if (!mcmHasData && !hasCompositeMcmData && !libraryHasData) {
        evidence.push({
          test: ansKey,
          answer: ans,
          source: 'missing',
          likelihood: 1.0,
          weight: 0,
          impact: 0,
          direction: 'neutral',
          isKey,
        })
        continue
      }

      answeredWithData++
      const correlationWeight = getCorrelationWeight(ansKey, processedCanonicalKeys)
      processedCanonicalKeys.push(cleanKey)

      // 2a. MCM-based likelihood. TSI can be a composite estimate from related MCM traits.
      if (mcmHasData || hasCompositeMcmData) {
        const pct = mcmHasData ? mcm!.tests[mcmTestId!] : undefined
        let lik = hasCompositeMcmData
          ? compositeMcmLikelihood
          : categoricalLikelihood(testDef?.id || cleanKey, pct, ans, group)
        if (lik === null) {
          lik = typeof pct === 'number' ? mcmLikelihood(pct, ans, meaning) : null
        }
        
        if (lik != null) {
          let smoothed = Math.max(EPS, Math.min(1 - EPS, lik))
          if (isHardExclusionTest && smoothed < 0.1) {
            smoothed = STRONG_CONTRADICTION_LIKELIHOOD
          }
          if (smoothed <= 0.1 || smoothed === STRONG_CONTRADICTION_LIKELIHOOD) {
            if (gateMode === 'strict' && isHardExclusionTest) {
              hardExcluded = true
            } else {
              contradictionCount++
            }
          }

          // Typicality ratio tracking
          const pVal = typeof pct === 'number' ? Math.max(0, Math.min(100, pct)) / 100 : smoothed
          const maxP = hasCompositeMcmData ? 0.9 : Math.max(pVal, 1 - pVal)
          let smoothedMax = Math.max(EPS, Math.min(1 - EPS, maxP))
          if (isHardExclusionTest && smoothedMax < 0.1) {
            smoothedMax = STRONG_CONTRADICTION_LIKELIHOOD
          }
          typicalityProd *= (smoothed / smoothedMax)
          typicalityCount++

          const impact = Math.log(smoothed / 0.5) * correlationWeight
          logLik += impact
          usedMcmTests++
          evidence.push({
            test: ansKey,
            answer: ans,
            source: 'mcm',
            likelihood: smoothed,
            expectedPct: typeof pct === 'number' ? pct : undefined,
            weight: correlationWeight,
            impact,
            direction: evidenceDirection(smoothed),
            isKey,
            note: hasCompositeMcmData ? 'Composite estimate from glucose/lactose/sucrose/H2S/gas MCM traits' : undefined,
          })
          if (isKey) {
            if (smoothed > 0.5) keyMatch++
            else if (smoothed < 0.3) keyMismatch++
          }
          continue
        }
      }

      // 2b. Fallback: legacy LIBRARY +/-/V data at FALLBACK_WEIGHT
      if (libraryHasData) {
        const isMatch = testMatch(bugBiochemRow!.r, ans)
        let smoothed = 0.5
        let smoothedMax = 0.5
        if (isMatch === true) {
          smoothed = 0.9
          smoothedMax = 0.9
        } else if (isMatch === false) {
          smoothed = isHardExclusionTest ? STRONG_CONTRADICTION_LIKELIHOOD : 0.1
          smoothedMax = 0.9
        } else {
          smoothed = 0.5
          smoothedMax = 0.5
        }

        if (smoothed <= 0.1 || smoothed === STRONG_CONTRADICTION_LIKELIHOOD) {
          if (gateMode === 'strict' && isHardExclusionTest) {
            hardExcluded = true
          } else {
            contradictionCount++
          }
        }

        typicalityProd *= (smoothed / smoothedMax)
        typicalityCount++

        const impact = Math.log(smoothed / 0.5) * FALLBACK_WEIGHT * correlationWeight
        logLik += impact
        evidence.push({
          test: ansKey,
          answer: ans,
          source: 'library',
          likelihood: smoothed,
          expectedPct: isMatch === true ? 90 : isMatch === false ? 10 : 50,
          weight: FALLBACK_WEIGHT * correlationWeight,
          impact,
          direction: evidenceDirection(smoothed),
          isKey,
          note: bugBiochemRow?.n,
        })
      }
    }

    // Step 3: Log-prior from prevalence
    const priorScore = mcm && typeof mcm.prevalence_score === 'number' ? mcm.prevalence_score : 2
    const prior = PRIOR_MAP[priorScore] ?? 0.2
    const logPrior = Math.log(prior)

    const evidenceCoverage = answerEntries.length > 0 ? answeredWithData / answerEntries.length : 1.0
    const geometricTypicality = typicalityCount > 0 ? Math.pow(typicalityProd, 1 / typicalityCount) : 1.0
    const caseFitScore = Math.max(0, Math.min(1, evidenceCoverage * geometricTypicality * Math.pow(0.5, contradictionCount)))

    return {
      bug,
      logPosterior: logLik + logPrior,
      hardExcluded,
      keyMatch,
      keyMismatch,
      usedMcmTests,
      mcmAvailable: !!mcm,
      evidence,
      evidenceCoverage,
      typicalityIndex: geometricTypicality,
      contradictionCount,
      caseFitScore,
    }
  })

  // Step 4: Softmax (numerically stable)
  const maxLp = Math.max(...results.map((r) => (r.hardExcluded ? -Infinity : r.logPosterior)))
  const weights = results.map((r) => (r.hardExcluded ? 0 : Math.exp(r.logPosterior - maxLp)))
  const totalW = weights.reduce((s, w) => s + w, 0) || 1

  // Step 4.5: Calculate coverage factor (based on number of tests answered vs suite size)
  const requiredTestsCount = suites[group]?.tests?.filter((t: any) => {
    if (t.required !== undefined) return t.required
    return t.extra !== true
  }).length || 0
  const baseSize = requiredTestsCount > 0 ? requiredTestsCount : (suites[group]?.tests?.length || 8)
  const SUITE_SIZE = Math.min(10, baseSize)
  const logSuite = Math.log2(SUITE_SIZE + 1)
  const nAnswered = answerEntries.length
  const coverageFactor = nAnswered === 0 ? 0.50 : Math.min(
    1.0,
    0.50 + 0.50 * (Math.log2(nAnswered + 1) / (logSuite || 1))
  )

  // Step 5: Final % (separate posterior scaled by coverage factor)
  const ranked: RankedSpecies[] = results
    .map((r, i) => {
      let rawPct = 0
      if (!r.hardExcluded) {
        rawPct = (weights[i] / totalW) * 100
      }
      const pct = Math.round(rawPct * coverageFactor)
      return {
        ...r.bug,
        pct: Math.max(0, Math.min(100, pct)),
        posteriorWithinCandidateSet: rawPct,
        caseFitScore: r.caseFitScore,
        contradictionCount: r.contradictionCount,
        evidenceCoverage: r.evidenceCoverage,
        typicalityIndex: r.typicalityIndex,
        _keyMatch: r.keyMatch,
        _keyMismatch: r.keyMismatch,
        _excluded: r.hardExcluded,
        _mcm: r.mcmAvailable,
        _usedMcmTests: r.usedMcmTests,
        _evidence: r.evidence,
        logPosterior: r.logPosterior,
      } as RankedSpecies
    })
    .sort((a, b) => {
      if (b.pct !== a.pct) return b.pct - a.pct
      if (b._usedMcmTests !== a._usedMcmTests) return b._usedMcmTests - a._usedMcmTests
      return b._keyMatch - a._keyMatch
    })

  // Step 6: Confidence label on top result
  if (ranked.length > 0) {
    const top = ranked[0]
    const second = ranked.find((r, i) => i > 0 && !r._excluded) ?? { pct: 0 }
    const gap = top.pct - second.pct
    top._confidence = determineConfidence(top.pct, gap, nAnswered, top.caseFitScore ?? 0, top.evidenceCoverage)
    top._gap = gap
  }

  return ranked
}

function getBugTestPositivity(
  bug: Species,
  testId: string,
  opts: BayesOptions
): number {
  const mcm = opts.mcmData[bug.id]
  const testDef = lookupTestDefinition(testId)
  const mcmTestId = testDef?.mcmKey || lookupMcmTest(testId)
  
  if (mcm && mcmTestId && mcm.tests && mcm.tests[mcmTestId] != null) {
    return mcm.tests[mcmTestId]
  }

  // Fallback
  const tests = getCanonicalBiochemRows(bug, opts.suites)
  const cleanKey = testId.toLowerCase().replace(/[^a-z0-9]/g, '')
  const bugRow = tests.find((b) => {
    const bk = b.t.toLowerCase().replace(/[^a-z0-9]/g, '')
    return bk === cleanKey || cleanKey.includes(bk) || bk.includes(cleanKey)
  })
  if (bugRow) {
    const r = bugRow.r.replace(/−/g, '-').toLowerCase()
    if (r === '+' || r.startsWith('+') || r === 's') return 90
    if (r === '-' || r.startsWith('-') || r === 'r') return 10
    if (r === 'v' || r.includes('+/-') || r.includes('-/+') || r === '—') return 50
  }

  return 50
}

export function calcNextBestTests(
  group: string,
  answers: AnswersMap,
  currentResults: RankedSpecies[],
  opts: BayesOptions
): RecommendedTest[] {
  const suite = opts.suites[group]
  if (!suite) return []

  // 1. Get candidate species that are not hard-excluded and have non-zero probability
  const candidates = currentResults.filter((r) => !r._excluded && (r.posteriorWithinCandidateSet ?? r.pct) > 0)
  if (candidates.length <= 1) return []

  // Sum of unrounded probabilities
  const sumPct = candidates.reduce((s, c) => s + (c.posteriorWithinCandidateSet ?? c.pct), 0)
  if (sumPct === 0) return []

  // Normalize candidate probabilities to sum to 1
  const candProbs = candidates.map((c) => ({
    c,
    p: (c.posteriorWithinCandidateSet ?? c.pct) / sumPct,
  }))

  // Current entropy H(C)
  let currentEntropy = 0
  for (const cp of candProbs) {
    if (cp.p > 0) {
      currentEntropy -= cp.p * Math.log2(cp.p)
    }
  }

  // 2. Find unanswered tests
  const answeredKeys = new Set(
    Object.keys(answers).map((k) => k.toLowerCase().replace(/[^a-z0-9]/g, ''))
  )
  const unansweredTests = BIOCHEMICAL_TEST_REGISTRY.filter((t) => {
    const cleanId = t.id.toLowerCase().replace(/[^a-z0-9]/g, '')
    return !answeredKeys.has(cleanId)
  })

  if (unansweredTests.length === 0) return []

  const recommendations: RecommendedTest[] = []

  // 3. For each unanswered test, calculate expected remaining entropy H(C | T)
  for (const test of unansweredTests) {
    let expectedEntropy = 0;
    const model = OUTCOME_MODELS[test.id.toLowerCase()];

    if (model) {
      // Categorical multi-outcome entropy
      let totalP = 0;
      const outcomeEntropies: { pOutcome: number, entropy: number }[] = [];

      for (const outcome of model.outcomes) {
        let pOutcomeTotal = 0;
        const testProps = candProbs.map((cp) => {
          const pct = getBugTestPositivity(cp.c, test.id, opts);
          const pCondOutcome = categoricalLikelihood(test.id, pct, outcome, group) ?? 0.5;
          pOutcomeTotal += cp.p * pCondOutcome;
          return { cp, pCondOutcome };
        });

        if (pOutcomeTotal > 0.001) {
          let entropyOutcome = 0;
          for (const tp of testProps) {
            const pCond = (tp.cp.p * tp.pCondOutcome) / pOutcomeTotal;
            if (pCond > 0) entropyOutcome -= pCond * Math.log2(pCond);
          }
          outcomeEntropies.push({ pOutcome: pOutcomeTotal, entropy: entropyOutcome });
          totalP += pOutcomeTotal;
        }
      }

      // Normalize if outcomes don't sum to exactly 1.0
      if (totalP > 0) {
        for (const oe of outcomeEntropies) {
          expectedEntropy += (oe.pOutcome / totalP) * oe.entropy;
        }
      }
    } else {
      // Binary outcome entropy
      let pTestPos = 0
      const testProps = candProbs.map((cp) => {
        const pct = getBugTestPositivity(cp.c, test.id, opts)
        const pPos = pct / 100
        pTestPos += cp.p * pPos
        return { cp, pPos }
      })

      const pTestNeg = 1 - pTestPos

      if (pTestPos < 0.001 || pTestPos > 0.999) {
        continue
      }

      // Compute H(C | T = +)
      let entropyPos = 0
      for (const tp of testProps) {
        const pCondPos = (tp.cp.p * tp.pPos) / pTestPos
        if (pCondPos > 0) {
          entropyPos -= pCondPos * Math.log2(pCondPos)
        }
      }

      // Compute H(C | T = -)
      let entropyNeg = 0
      for (const tp of testProps) {
        const pCondNeg = (tp.cp.p * (1 - tp.pPos)) / pTestNeg
        if (pCondNeg > 0) {
          entropyNeg -= pCondNeg * Math.log2(pCondNeg)
        }
      }

      expectedEntropy = pTestPos * entropyPos + pTestNeg * entropyNeg
    }

    const infoGain = currentEntropy - expectedEntropy
    const entropyReduction = currentEntropy > 0 ? (infoGain / currentEntropy) * 100 : 0

    if (entropyReduction > 0) {
      const isAvailableInSuite = suite.tests.some(st => st.id === test.id)
      
      let costPenalty = 0
      if (test.costLevel === 'high') costPenalty = 15
      else if (test.costLevel === 'medium') costPenalty = 5

      const timePenalty = (test.timePenalty ?? 0) * 10
      const availabilityBonus = isAvailableInSuite ? 30 : 0
      const priorityBonus = (test.curriculumPriority ?? 3) * 5

      const practicalScore = Math.round(entropyReduction + availabilityBonus + priorityBonus - costPenalty - timePenalty)

      let reason = `ช่วยแยกความแตกต่างระหว่าง ${candidates.slice(0, 3).map(c => c.name).join(', ')}`
      if (test.estimatedTime) {
        reason += ` (ใช้เวลาประมาณ ${test.estimatedTime})`
      }

      recommendations.push({
        testId: test.id,
        testLabel: test.label,
        entropyReduction: Math.round(entropyReduction),
        practicalScore,
        reason,
        estimatedTime: test.estimatedTime,
        costLevel: test.costLevel,
      })
    }
  }

  return recommendations.sort((a, b) => b.practicalScore - a.practicalScore || b.entropyReduction - a.entropyReduction)
}
