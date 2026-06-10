import type { InitialObservation, TestSuite, TestSuiteTrigger } from './types'

export interface SuiteSelection {
  groupId: string
  suiteId: string
  suiteName: string
  reason: string
  score: number
}

interface TriggerFieldScore {
  key: keyof InitialObservation
  label: string
  matched: boolean
  score: number
}

const TRIGGER_FIELD_WEIGHTS: Partial<Record<keyof InitialObservation, number>> = {
  gramReaction: 4,
  morphology: 4,
  arrangement: 3,
  specimen: 2,
  spore: 2,
  capsule: 1,
  intracellular: 1,
}

const TRIGGER_FIELD_LABELS: Partial<Record<keyof InitialObservation, string>> = {
  gramReaction: 'Gram reaction',
  morphology: 'morphology',
  arrangement: 'arrangement',
  specimen: 'specimen',
  spore: 'spore',
  capsule: 'capsule',
  intracellular: 'intracellular location',
}

function isKnownValue(value: unknown): boolean {
  return value != null && value !== 'unknown' && value !== 'variable'
}

function isKnownObservation(obs: InitialObservation): boolean {
  return Object.values(obs).some(isKnownValue)
}

function expectedValuesFor(
  trigger: TestSuiteTrigger,
  key: keyof InitialObservation,
): unknown[] {
  const expected = trigger[key]
  if (expected == null) return []
  return Array.isArray(expected) ? [...expected] : [expected]
}

function scoreTriggerField<K extends keyof InitialObservation>(
  trigger: TestSuiteTrigger,
  obs: InitialObservation,
  key: K,
): TriggerFieldScore | undefined {
  const expected = expectedValuesFor(trigger, key)
  if (expected.length === 0) return undefined

  const observed = obs[key]
  if (!isKnownValue(observed)) return undefined

  const weight = TRIGGER_FIELD_WEIGHTS[key] ?? 1
  const matched = expected.includes(observed)
  return {
    key,
    label: TRIGGER_FIELD_LABELS[key] ?? String(key),
    matched,
    score: matched ? weight : -weight,
  }
}

function scoreSuiteTrigger(suite: TestSuite, obs: InitialObservation): TriggerFieldScore[] {
  if (!suite.trigger) return []

  return (Object.keys(suite.trigger) as Array<keyof InitialObservation>)
    .map((key) => scoreTriggerField(suite.trigger!, obs, key))
    .filter((item): item is TriggerFieldScore => item != null)
}

function buildReason(suite: TestSuite, fieldScores: TriggerFieldScore[]): string {
  const matched = fieldScores.filter((item) => item.matched)
  const conflicting = fieldScores.filter((item) => !item.matched)

  const parts: string[] = []
  if (matched.length > 0) {
    parts.push(`matched ${matched.map((item) => item.label).join(', ')}`)
  }
  if (conflicting.length > 0) {
    parts.push(`lower confidence: ${conflicting.map((item) => item.label).join(', ')} differed`)
  }
  if (suite.trigger && fieldScores.length === 0) {
    parts.push('waiting for matching trigger fields')
  }

  return parts.join('; ') || 'selected by highest suite trigger score'
}

export function selectSuiteForObservation(
  obs: InitialObservation,
  suites: TestSuite[],
): SuiteSelection | undefined {
  if (!isKnownObservation(obs)) return undefined

  const scored = suites.map((suite, index) => {
    const fieldScores = scoreSuiteTrigger(suite, obs)
    const score = fieldScores.reduce((sum, item) => sum + item.score, 0)
    const matchedCount = fieldScores.filter((item) => item.matched).length
    const nonSpecimenMatchedCount = fieldScores.filter((item) => item.matched && item.key !== 'specimen').length
    return { suite, score, matchedCount, nonSpecimenMatchedCount, fieldScores, index }
  })

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    if (b.matchedCount !== a.matchedCount) return b.matchedCount - a.matchedCount
    return a.index - b.index
  })

  const best = scored[0]
  if (!best || best.score <= 0 || best.nonSpecimenMatchedCount === 0) return undefined

  return {
    groupId: best.suite.group,
    suiteId: best.suite.id,
    suiteName: best.suite.name,
    score: best.score,
    reason: buildReason(best.suite, best.fieldScores),
  }
}
