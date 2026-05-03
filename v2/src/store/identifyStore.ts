// Zustand store for the bacterial identification workflow.
import { create } from 'zustand'
import type { AnswersMap, RankedSpecies, SavedCase } from '@/lib/types'
import { calcProbabilityBayes } from '@/lib/bayesianEngine'
import { ALL_MCM_DATA, ALL_SUITES, LIBRARY_CLEAN } from '@/lib/dataLoader'

const SAVED_CASES_KEY = 'microbial-world:v4:saved-cases'

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function loadSavedCases(): SavedCase[] {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(SAVED_CASES_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persistSavedCases(cases: SavedCase[]) {
  if (!canUseStorage()) return
  window.localStorage.setItem(SAVED_CASES_KEY, JSON.stringify(cases))
}

interface IdentifyState {
  group: string
  answers: AnswersMap
  results: RankedSpecies[]
  savedCases: SavedCase[]
  setGroup: (g: string) => void
  setAnswer: (testKey: string, value: string | null) => void
  resetAnswers: () => void
  saveCurrentCase: () => void
  loadCase: (id: string) => void
  deleteCase: (id: string) => void
  recompute: () => void
}

export const useIdentifyStore = create<IdentifyState>()((set, get) => ({
  group: 'enterobacterales',
  answers: {},
  results: [],
  savedCases: loadSavedCases(),

  setGroup: (g) => {
    set({ group: g, answers: {}, results: [] })
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
    set({ answers: {}, results: [] })
    get().recompute()
  },

  saveCurrentCase: () => {
    const { group, answers, results, savedCases } = get()
    const top = results.find((r) => !r._excluded)
    const savedCase: SavedCase = {
      id: `case-${Date.now()}`,
      createdAt: new Date().toISOString(),
      group,
      answers: { ...answers },
      topSpecies: top?.name,
      topPct: top?.pct,
    }
    const next = [savedCase, ...savedCases].slice(0, 12)
    persistSavedCases(next)
    set({ savedCases: next })
  },

  loadCase: (id) => {
    const match = get().savedCases.find((item) => item.id === id)
    if (!match) return
    set({ group: match.group, answers: match.answers, results: [] })
    get().recompute()
  },

  deleteCase: (id) => {
    const next = get().savedCases.filter((item) => item.id !== id)
    persistSavedCases(next)
    set({ savedCases: next })
  },

  recompute: () => {
    const { group, answers } = get()
    const ranked = calcProbabilityBayes(group, answers, {
      library: LIBRARY_CLEAN,
      mcmData: ALL_MCM_DATA,
      suites: ALL_SUITES,
    })
    set({ results: ranked })
  },
}))
