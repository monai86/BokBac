// Type definitions for the Microbial World v4 Bayesian engine.

export interface BiochemRow {
  /** Test name shown to user (e.g. "Indole", "Oxidase") */
  t: string
  /** Result symbol: '+', '-', 'V', 'γ/α', etc. */
  r: string
  /** Optional note. Tests prefixed with 'KEY' are key discriminators. */
  n?: string
}

export interface Species {
  id: string
  name: string
  group: string
  thai?: string
  gram?: string
  morph?: string
  importance?: 'critical' | 'high' | 'moderate' | 'low'
  biochem?: BiochemRow[]
  tags?: string[]
  media?: string[]
  condition?: string
  notes?: string
  gramStain?: string
  colony?: Record<string, string>
  clinical?: Record<string, unknown>
  /** Free-text description (Thai/English) */
  desc?: string
  /** Optional treatment / clinical info */
  treatment?: string
  [key: string]: unknown
}

// Custom and system test suite types
export interface TestSuiteItem {
  testId: string
  required?: boolean
  order: number
  weightOverride?: number
  note?: string
}

export interface TestSuite {
  id: string
  name: string
  description?: string
  source?: string
  owner?: 'system' | 'user' | 'institution'
  group: string // OrganismGroup, e.g. 'gpc_cluster'
  trigger?: Partial<InitialObservation>
  tests: TestSuiteItem[]
}

// Deprecated suite format (kept for backwards compatibility with legacy parts if needed)
export interface SuiteTest {
  id: string
  label: string
  importance?: 'critical' | 'high' | 'moderate' | 'low'
}

export interface Suite {
  name: string
  tests: SuiteTest[]
}

export type SuitesMap = Record<string, Suite>

export interface McmEntry {
  /** Prevalence on 0..4 scale (++++ = 4) */
  prevalence_score?: number
  prevalence_symbol?: string
  prevalence_source?: string
  source?: string
  tests: Record<string, number>
}

export type McmDataMap = Record<string, McmEntry>

/** A single user answer ("+", "-", "V", "S", "R" or hemolysis strings). */
export type UserAnswer = string

export type AnswersMap = Record<string, UserAnswer>

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'very_low'

export type EvidenceDirection = 'supportive' | 'conflicting' | 'neutral'

export type EvidenceSource = 'mcm' | 'library' | 'uninformative' | 'missing'

export interface TestEvidence {
  test: string
  answer: string
  source: EvidenceSource
  likelihood: number
  expectedPct?: number
  weight: number
  impact: number
  direction: EvidenceDirection
  isKey: boolean
}

export interface RankedSpecies extends Species {
  /** Posterior probability % (0–100). */
  pct: number
  /** Number of MCM tests that contributed log-likelihood. */
  _usedMcmTests: number
  /** Per-answer evidence used to explain why this species ranked where it did. */
  _evidence: TestEvidence[]
  _keyMatch: number
  _keyMismatch: number
  _excluded: boolean
  /** True when MCM_DATA has an entry for this species. */
  _mcm: boolean
  /** Coverage of evidence: how many of the answered tests have available data for this organism (0..1) */
  evidenceCoverage: number
  /** Only set on the top result. */
  _confidence?: ConfidenceLevel
  /** Only set on the top result — pp gap to runner-up. */
  _gap?: number
  /** Typicality index (0..1) showing typicality of this isolate compared to taxon standard. */
  typicalityIndex?: number
}

export type SpecimenType =
  | 'urine'
  | 'blood'
  | 'stool'
  | 'wound'
  | 'respiratory'
  | 'csf'
  | 'genital'
  | 'throat'
  | 'ear'
  | 'unknown';

export interface InitialObservation {
  specimen?: SpecimenType
  gramReaction: 'positive' | 'negative' | 'variable' | 'unknown'
  morphology: 'cocci' | 'bacilli' | 'coccobacilli' | 'curved_rod' | 'branching_filament' | 'unknown'
  arrangement?: 'cluster' | 'chain' | 'pairs' | 'diplococci' | 'palisade' | 'single' | 'unknown'
  spore?: boolean | 'unknown'
  capsule?: boolean | 'unknown'
  intracellular?: boolean | 'unknown'
}

export interface SavedCase {
  id: string
  createdAt: string
  updatedAt?: string
  title: string
  tags: string[]
  note?: string
  group: string
  initialObservation?: InitialObservation
  answers: AnswersMap
  topSpecies?: string
  topPct?: number
}

export interface RecommendedTest {
  testId: string
  testLabel: string
  entropyReduction: number // Percentage reduction in uncertainty
  practicalScore: number
  reason: string
  estimatedTime?: string
  costLevel?: 'low' | 'medium' | 'high'
}
