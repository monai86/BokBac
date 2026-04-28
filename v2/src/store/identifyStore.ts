// Zustand store for the bacterial identification workflow.
import { create } from 'zustand'
import type { AnswersMap, RankedSpecies } from '@/lib/types'
import { calcProbabilityBayes } from '@/lib/bayesianEngine'
import { ALL_MCM_DATA, ALL_SUITES, LIBRARY_CLEAN } from '@/lib/dataLoader'

interface IdentifyState {
  group: string
  answers: AnswersMap
  results: RankedSpecies[]
  setGroup: (g: string) => void
  setAnswer: (testKey: string, value: string | null) => void
  resetAnswers: () => void
  recompute: () => void
}

export const useIdentifyStore = create<IdentifyState>()((set, get) => ({
  group: 'enterobacterales',
  answers: {},
  results: [],

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
