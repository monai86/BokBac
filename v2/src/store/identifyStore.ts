// Zustand store for the bacterial identification workflow.
import { create } from 'zustand'
import type {
  AnswersMap,
  RankedSpecies,
  SavedCase,
  RecommendedTest,
  InitialObservation,
  TestSuite,
} from '@/lib/types'
import { calcProbabilityBayes, calcNextBestTests } from '@/lib/bayesianEngine'
import { ALL_MCM_DATA, LIBRARY_CLEAN } from '@/lib/dataLoader'
import { DEFAULT_SUITES } from '@/data/suites/defaultSuites'
import {
  buildSuitesMap,
  ENGINE_VERSION,
  getActiveSuite,
  normalizeAnswersToTestIds,
  normalizeTestKeyToId,
  UNVERSIONED_SUITE,
} from '@/lib/suiteCatalog'
import { selectSuiteForObservation } from '@/lib/selectSuiteForObservation'
import { db as firestoreDb, isFirebaseActive } from '@/auth/firebase'
import { caseStorage, getLocalCases } from '@/services/caseStorage'
import { doc, setDoc } from 'firebase/firestore'

const CUSTOM_SUITES_KEY = 'bokbac:v4:custom-suites'
const ACTIVE_SUITE_ID_KEY = 'bokbac:v4:active-suite-id'

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
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
  suiteSelectionReason?: string
  
  // AuthProvider is the auth source of truth. The store only mirrors the UID
  // needed by case/settings persistence.
  authUserId: string | null
  settings: {
    displayName?: string
    defaultGram?: string
    autoSave?: boolean
    gateMode?: 'strict' | 'hybrid' | 'exploratory'
  }
  
  setGroup: (g: string) => void
  setInitialObservation: (obs: Partial<InitialObservation>) => void
  resetInitialObservation: () => void
  setAnswer: (testKey: string, value: string | null) => void
  resetAnswers: () => void
  saveCurrentCase: () => Promise<void>
  updateCase: (id: string, updates: Partial<Pick<SavedCase, 'title' | 'tags' | 'note'>>) => Promise<void>
  loadCase: (id: string) => void
  deleteCase: (id: string) => Promise<void>
  setCustomSuites: (suites: TestSuite[]) => void
  setActiveSuiteId: (id: string) => void
  recompute: () => void
  
  applyAuthSnapshot: (snapshot: {
    authUserId: string | null
    savedCases?: SavedCase[]
    settings?: IdentifyState['settings']
  }) => void
  saveSettings: (settings: any) => Promise<void>
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
  savedCases: getLocalCases(),
  defaultSuites: DEFAULT_SUITES,
  customSuites: loadCustomSuites(),
  activeSuiteId: canUseStorage() ? window.localStorage.getItem(ACTIVE_SUITE_ID_KEY) || 'enterobacterales_default' : 'enterobacterales_default',
  suiteSelectionReason: undefined,
  
  authUserId: null,
  settings: canUseStorage() ? JSON.parse(window.localStorage.getItem('bokbac:v4:settings') || '{}') : {},

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
    const selection = selectSuiteForObservation(next, [...get().defaultSuites, ...get().customSuites])
    if (selection) {
      if (canUseStorage()) {
        window.localStorage.setItem(ACTIVE_SUITE_ID_KEY, selection.suiteId)
      }
      const groupChanged = get().group !== selection.groupId || get().activeSuiteId !== selection.suiteId
      set({
        initialObservation: next,
        group: selection.groupId,
        activeSuiteId: selection.suiteId,
        answers: groupChanged ? {} : get().answers,
        results: groupChanged ? [] : get().results,
        recommendedTests: groupChanged ? [] : get().recommendedTests,
        suiteSelectionReason: `${selection.suiteName}: ${selection.reason}`,
      })
    } else {
      set({ initialObservation: next, suiteSelectionReason: undefined })
    }
    get().recompute()
  },

  resetInitialObservation: () => {
    set({
      initialObservation: {
        gramReaction: 'unknown',
        morphology: 'unknown',
        arrangement: 'unknown',
      },
      suiteSelectionReason: undefined,
    })
    get().recompute()
  },

  setAnswer: (testKey, value) => {
    const testId = normalizeTestKeyToId(testKey)
    const next = { ...get().answers }
    if (value == null || value === '') {
      delete next[testId]
    } else {
      next[testId] = value
    }
    set({ answers: next })
    get().recompute()
  },

  resetAnswers: () => {
    set({ answers: {}, results: [], recommendedTests: [] })
    get().recompute()
  },

  saveCurrentCase: async () => {
    const { group, answers, results, initialObservation, defaultSuites, customSuites, activeSuiteId, authUserId } = get()
    const activeSuite = getActiveSuite(defaultSuites, customSuites, activeSuiteId, group)
    const top = results.find((r) => !r._excluded)
    const savedCase: SavedCase = {
      id: `case-${Date.now()}`,
      createdAt: new Date().toISOString(),
      title: top?.name ? `${top.name} workup` : 'Untitled case',
      tags: [],
      group,
      initialObservation: { ...initialObservation },
      answers: normalizeAnswersToTestIds(answers),
      suiteId: activeSuite?.id,
      suiteName: activeSuite?.name,
      suiteVersion: activeSuite?.version || UNVERSIONED_SUITE,
      engineVersion: ENGINE_VERSION,
      topSpecies: top?.name,
      topPct: top?.pct,
    }

    await caseStorage.saveCase(savedCase, authUserId || undefined)
    set({ savedCases: getLocalCases() })
  },

  updateCase: async (id, updates) => {
    const { authUserId } = get()
    await caseStorage.updateCase(id, updates, authUserId || undefined)
    set({ savedCases: getLocalCases() })
  },

  loadCase: (id) => {
    const match = get().savedCases.find((item) => item.id === id)
    if (!match) return
    const allSuites = [...get().defaultSuites, ...get().customSuites]
    const suite = match.suiteId
      ? allSuites.find((item) => item.id === match.suiteId && item.group === match.group)
      : undefined
    const fallbackSuite = allSuites.find((item) => item.group === match.group)
    const activeSuiteId = suite?.id || fallbackSuite?.id || get().activeSuiteId
    if (canUseStorage()) {
      window.localStorage.setItem(ACTIVE_SUITE_ID_KEY, activeSuiteId)
    }
    set({
      group: match.group,
      activeSuiteId,
      initialObservation: match.initialObservation || {
        gramReaction: 'unknown',
        morphology: 'unknown',
        arrangement: 'unknown',
      },
      answers: normalizeAnswersToTestIds(match.answers),
      results: [],
      recommendedTests: [],
    })
    get().recompute()
  },

  deleteCase: async (id) => {
    const { authUserId } = get()
    await caseStorage.deleteCase(id, authUserId || undefined)
    set({ savedCases: getLocalCases() })
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
    const { group, answers, initialObservation, defaultSuites, customSuites, activeSuiteId, settings } = get()
    const activeSuite = getActiveSuite(defaultSuites, customSuites, activeSuiteId, group)
    const suitesMap = buildSuitesMap(defaultSuites, activeSuite)

    const opts = {
      library: LIBRARY_CLEAN,
      mcmData: ALL_MCM_DATA,
      suites: suitesMap,
      gateMode: (settings.gateMode || 'hybrid') as 'strict' | 'hybrid' | 'exploratory',
    }

    const normalizedAnswers = normalizeAnswersToTestIds(answers)
    const ranked = calcProbabilityBayes(group, normalizedAnswers, opts, initialObservation)
    const recs = calcNextBestTests(group, normalizedAnswers, ranked, opts)
    set({ results: ranked, recommendedTests: recs })
  },

  applyAuthSnapshot: ({ authUserId, savedCases, settings }) => {
    const next: Partial<IdentifyState> = { authUserId }
    if (savedCases) next.savedCases = savedCases
    if (settings) next.settings = settings
    set(next)
  },

  saveSettings: async (newSettings) => {
    set({ settings: newSettings })
    if (canUseStorage()) {
      window.localStorage.setItem('bokbac:v4:settings', JSON.stringify(newSettings))
    }
    const { authUserId } = get()
    if (isFirebaseActive && firestoreDb && authUserId) {
      try {
        await setDoc(doc(firestoreDb, 'users', authUserId, 'settings', 'preferences'), newSettings)
      } catch (e) {
        console.error('Error saving settings to Firestore:', e)
      }
    }
  },
}))
