// Zustand store for the bacterial identification workflow.
import { create } from 'zustand'
import type {
  AnswersMap,
  RankedSpecies,
  SavedCase,
  RecommendedTest,
  InitialObservation,
  TestSuite,
  SuitesMap,
} from '@/lib/types'
import { calcProbabilityBayes, calcNextBestTests } from '@/lib/bayesianEngine'
import { ALL_MCM_DATA, LIBRARY_CLEAN } from '@/lib/dataLoader'
import { DEFAULT_SUITES } from '@/data/suites/defaultSuites'
import { lookupTestDefinition } from '@/data/tests/biochemicalTestRegistry'

const SAVED_CASES_KEY = 'microbial-world:v4:saved-cases'
const CUSTOM_SUITES_KEY = 'microbial-world:v4:custom-suites'
const ACTIVE_SUITE_ID_KEY = 'microbial-world:v4:active-suite-id'

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function loadSavedCases(): SavedCase[] {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(SAVED_CASES_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    if (!Array.isArray(parsed)) return []
    return parsed.map((item): SavedCase => ({
      ...item,
      title: typeof item.title === 'string' && item.title.trim() ? item.title : item.topSpecies || 'Untitled case',
      tags: Array.isArray(item.tags) ? item.tags : [],
    }))
  } catch {
    return []
  }
}

function persistSavedCases(cases: SavedCase[]) {
  if (!canUseStorage()) return
  window.localStorage.setItem(SAVED_CASES_KEY, JSON.stringify(cases))
}

function loadCustomSuites(): TestSuite[] {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(CUSTOM_SUITES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function persistCustomSuites(suites: TestSuite[]) {
  if (!canUseStorage()) return
  window.localStorage.setItem(CUSTOM_SUITES_KEY, JSON.stringify(suites))
}

interface IdentifyState {
  group: string
  initialObservation: InitialObservation
  answers: AnswersMap
  results: RankedSpecies[]
  recommendedTests: RecommendedTest[]
  savedCases: SavedCase[]
  defaultSuites: TestSuite[]
  customSuites: TestSuite[]
  activeSuiteId: string
  setGroup: (g: string) => void
  setInitialObservation: (obs: Partial<InitialObservation>) => void
  resetInitialObservation: () => void
  setAnswer: (testKey: string, value: string | null) => void
  resetAnswers: () => void
  saveCurrentCase: () => void
  updateCase: (id: string, updates: Partial<Pick<SavedCase, 'title' | 'tags' | 'note'>>) => void
  loadCase: (id: string) => void
  deleteCase: (id: string) => void
  setCustomSuites: (suites: TestSuite[]) => void
  setActiveSuiteId: (id: string) => void
  recompute: () => void
}

export const useIdentifyStore = create<IdentifyState>()((set, get) => ({
  group: 'enterobacterales',
  initialObservation: {
    gramReaction: 'unknown',
    morphology: 'unknown',
    arrangement: 'unknown',
  },
  answers: {},
  results: [],
  recommendedTests: [],
  savedCases: loadSavedCases(),
  defaultSuites: DEFAULT_SUITES,
  customSuites: loadCustomSuites(),
  activeSuiteId: canUseStorage() ? window.localStorage.getItem(ACTIVE_SUITE_ID_KEY) || 'enterobacterales_default' : 'enterobacterales_default',

  setGroup: (g) => {
    // Find active suite or default for this group
    const all = [...get().defaultSuites, ...get().customSuites]
    let active = all.find((s) => s.group === g && s.id === get().activeSuiteId)
    if (!active) {
      active = all.find((s) => s.group === g)
    }
    const nextSuiteId = active ? active.id : `${g}_default`
    
    if (canUseStorage()) {
      window.localStorage.setItem(ACTIVE_SUITE_ID_KEY, nextSuiteId)
    }

    set({
      group: g,
      activeSuiteId: nextSuiteId,
      answers: {},
      results: [],
      recommendedTests: [],
    })
    get().recompute()
  },

  setInitialObservation: (obs) => {
    const next = { ...get().initialObservation, ...obs }
    set({ initialObservation: next })
    get().recompute()
  },

  resetInitialObservation: () => {
    set({
      initialObservation: {
        gramReaction: 'unknown',
        morphology: 'unknown',
        arrangement: 'unknown',
      },
    })
    get().recompute()
  },

  setAnswer: (testKey, value) => {
    const next = { ...get().answers }
    if (value == null || value === '') {
      delete next[testKey]
    } else {
      next[testKey] = value
    }
    set({ answers: next })
    get().recompute()
  },

  resetAnswers: () => {
    set({ answers: {}, results: [], recommendedTests: [] })
    get().recompute()
  },

  saveCurrentCase: () => {
    const { group, answers, results, savedCases, initialObservation } = get()
    const top = results.find((r) => !r._excluded)
    const savedCase: SavedCase = {
      id: `case-${Date.now()}`,
      createdAt: new Date().toISOString(),
      title: top?.name ? `${top.name} workup` : 'Untitled case',
      tags: [],
      group,
      initialObservation: { ...initialObservation },
      answers: { ...answers },
      topSpecies: top?.name,
      topPct: top?.pct,
    }
    const next = [savedCase, ...savedCases].slice(0, 12)
    persistSavedCases(next)
    set({ savedCases: next })
  },

  updateCase: (id, updates) => {
    const next = get().savedCases.map((item) =>
      item.id === id
        ? {
            ...item,
            ...updates,
            title: updates.title ?? item.title,
            tags: updates.tags?.map((tag) => tag.trim()).filter(Boolean) ?? item.tags,
            updatedAt: new Date().toISOString(),
          }
        : item
    )
    persistSavedCases(next)
    set({ savedCases: next })
  },

  loadCase: (id) => {
    const match = get().savedCases.find((item) => item.id === id)
    if (!match) return
    set({
      group: match.group,
      initialObservation: match.initialObservation || {
        gramReaction: 'unknown',
        morphology: 'unknown',
        arrangement: 'unknown',
      },
      answers: { ...match.answers },
      results: [],
      recommendedTests: [],
    })
    get().recompute()
  },

  deleteCase: (id) => {
    const next = get().savedCases.filter((item) => item.id !== id)
    persistSavedCases(next)
    set({ savedCases: next })
  },

  setCustomSuites: (suites) => {
    persistCustomSuites(suites)
    set({ customSuites: suites })
    get().recompute()
  },

  setActiveSuiteId: (id) => {
    if (canUseStorage()) {
      window.localStorage.setItem(ACTIVE_SUITE_ID_KEY, id)
    }
    set({ activeSuiteId: id })
    get().recompute()
  },

  recompute: () => {
    const { group, answers, initialObservation, defaultSuites, customSuites, activeSuiteId } = get()
    
    // 1. Find active suite
    const all = [...defaultSuites, ...customSuites]
    let activeSuite = all.find((s) => s.id === activeSuiteId)
    if (!activeSuite || activeSuite.group !== group) {
      activeSuite = all.find((s) => s.group === group)
    }

    // 2. Map active suite to old format
    const mappedSuite = activeSuite
      ? {
          name: activeSuite.name,
          tests: activeSuite.tests.map((t) => {
            const def = lookupTestDefinition(t.testId)
            return {
              id: t.testId,
              label: def?.label || t.testId,
              importance: t.required ? ('critical' as const) : ('moderate' as const),
            }
          }),
        }
      : undefined

    // 3. Map all default suites to old format
    const suitesMap: SuitesMap = {}
    for (const s of defaultSuites) {
      suitesMap[s.group] = {
        name: s.name,
        tests: s.tests.map((t) => {
          const def = lookupTestDefinition(t.testId)
          return {
            id: t.testId,
            label: def?.label || t.testId,
            importance: t.required ? ('critical' as const) : ('moderate' as const),
          }
        }),
      }
    }

    // Override active group suite with custom one if applicable
    if (group && mappedSuite) {
      suitesMap[group] = mappedSuite
    }

    const opts = {
      library: LIBRARY_CLEAN,
      mcmData: ALL_MCM_DATA,
      suites: suitesMap,
    }

    const ranked = calcProbabilityBayes(group, answers, opts, initialObservation)
    const recs = calcNextBestTests(group, answers, ranked, opts)
    set({ results: ranked, recommendedTests: recs })
  },
}))
