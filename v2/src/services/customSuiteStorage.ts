import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore'
import { db as firestoreDb, isFirebaseActive } from '@/auth/firebase'
import type { TestSuite } from '@/lib/types'

export const CUSTOM_SUITES_KEY = 'bokbac:v4:custom-suites'

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function getLocalCustomSuites(): TestSuite[] {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(CUSTOM_SUITES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveLocalCustomSuites(suites: TestSuite[]) {
  if (!canUseStorage()) return
  window.localStorage.setItem(CUSTOM_SUITES_KEY, JSON.stringify(suites))
}

function normalizeUserSuite(suite: TestSuite): TestSuite {
  return {
    ...suite,
    owner: 'user',
    scope: suite.scope || 'global',
    group: suite.group || 'custom',
    updatedAt: suite.updatedAt || new Date().toISOString(),
  }
}

export const customSuiteStorage = {
  async loadSuites(uid?: string | null): Promise<TestSuite[]> {
    const local = getLocalCustomSuites()
    if (!isFirebaseActive || !firestoreDb || !uid) return local

    try {
      const suitesQuery = query(collection(firestoreDb, 'users', uid, 'customSuites'), orderBy('updatedAt', 'desc'))
      const snap = await getDocs(suitesQuery)
      const cloudSuites = snap.docs.map((item) => normalizeUserSuite(item.data() as TestSuite))
      saveLocalCustomSuites(cloudSuites)
      return cloudSuites
    } catch (error) {
      console.warn('⚠️ Firestore custom suite load failed, falling back to local cache:', error)
      return local
    }
  },

  async saveSuites(suites: TestSuite[], uid?: string | null): Promise<{ success: boolean; isCloud: boolean }> {
    const normalized = suites.map(normalizeUserSuite)
    saveLocalCustomSuites(normalized)

    if (!isFirebaseActive || !firestoreDb || !uid) {
      return { success: true, isCloud: false }
    }

    try {
      await Promise.all(
        normalized.map((suite) => setDoc(doc(firestoreDb, 'users', uid, 'customSuites', suite.id), suite)),
      )
      return { success: true, isCloud: true }
    } catch (error) {
      console.error('❌ Firestore custom suite save failed. Saved locally instead:', error)
      return { success: true, isCloud: false }
    }
  },

  async deleteSuite(suiteId: string, suitesAfterDelete: TestSuite[], uid?: string | null): Promise<{ success: boolean; isCloud: boolean }> {
    saveLocalCustomSuites(suitesAfterDelete)

    if (!isFirebaseActive || !firestoreDb || !uid) {
      return { success: true, isCloud: false }
    }

    try {
      await deleteDoc(doc(firestoreDb, 'users', uid, 'customSuites', suiteId))
      return { success: true, isCloud: true }
    } catch (error) {
      console.error('❌ Firestore custom suite delete failed. Deleted locally instead:', error)
      return { success: true, isCloud: false }
    }
  },

  async syncLocalToCloud(uid: string): Promise<TestSuite[]> {
    if (!isFirebaseActive || !firestoreDb || !uid) return getLocalCustomSuites()

    try {
      const suitesQuery = query(collection(firestoreDb, 'users', uid, 'customSuites'), orderBy('updatedAt', 'desc'))
      const snap = await getDocs(suitesQuery)
      const cloudSuites = snap.docs.map((item) => normalizeUserSuite(item.data() as TestSuite))
      const merged = new Map<string, TestSuite>(cloudSuites.map((suite) => [suite.id, suite]))

      for (const localSuite of getLocalCustomSuites()) {
        const normalizedLocal = normalizeUserSuite(localSuite)
        const cloudSuite = merged.get(normalizedLocal.id)
        const localTime = new Date(normalizedLocal.updatedAt || normalizedLocal.createdAt || 0).getTime()
        const cloudTime = cloudSuite ? new Date(cloudSuite.updatedAt || cloudSuite.createdAt || 0).getTime() : -1
        if (!cloudSuite || localTime > cloudTime) {
          merged.set(normalizedLocal.id, normalizedLocal)
          await setDoc(doc(firestoreDb, 'users', uid, 'customSuites', normalizedLocal.id), normalizedLocal)
        }
      }

      const finalSuites = Array.from(merged.values()).sort(
        (a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime(),
      )
      saveLocalCustomSuites(finalSuites)
      return finalSuites
    } catch (error) {
      console.warn('⚠️ Firestore custom suite sync failed, returning local suites:', error)
      return getLocalCustomSuites()
    }
  },
}
