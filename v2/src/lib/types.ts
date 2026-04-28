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
  importance?: 'critical' | 'high' | 'moderate' | 'low'
  biochem?: BiochemRow[]
  /** Free-text description (Thai/English) */
  desc?: string
  /** Optional treatment / clinical info */
  treatment?: string
  [key: string]: unknown
}

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

/** A single user answer ("+", "-", "V", or hemolysis/SR strings). */
export type UserAnswer = string

export type AnswersMap = Record<string, UserAnswer>

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'very_low'

export interface RankedSpecies extends Species {
  /** Probability % (0–99). 0 means hard-excluded. */
  pct: number
  /** Number of MCM tests that contributed log-likelihood. */
  _usedMcmTests: number
  _keyMatch: number
  _keyMismatch: number
  _excluded: boolean
  /** True when MCM_DATA has an entry for this species. */
  _mcm: boolean
  /** Only set on the top result. */
  _confidence?: ConfidenceLevel
  /** Only set on the top result — pp gap to runner-up. */
  _gap?: number
}
