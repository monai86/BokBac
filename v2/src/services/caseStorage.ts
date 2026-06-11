import { 
  doc, 
  setDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy 
} from 'firebase/firestore'
import { db as firestoreDb, isFirebaseActive } from '@/auth/firebase'
import type { SavedCase } from '@/lib/types'

const SAVED_CASES_KEY = 'bokbac:v4:saved-cases'

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function getLocalCases(): SavedCase[] {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(SAVED_CASES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveLocalCases(cases: SavedCase[]) {
  if (!canUseStorage()) return
  window.localStorage.setItem(SAVED_CASES_KEY, JSON.stringify(cases))
}

export const caseStorage = {
  /**
   * Load cases.
   * If online and authenticated, loads from Firestore and syncs local cache.
   * If offline or unauthenticated, loads from localStorage.
   */
  async loadCases(uid?: string | null): Promise<SavedCase[]> {
    const local = getLocalCases()
    
    if (!isFirebaseActive || !firestoreDb || !uid) {
      return local
    }

    try {
      const casesQuery = query(collection(firestoreDb, 'users', uid, 'cases'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(casesQuery)
      const cloudCases = snap.docs.map(d => d.data() as SavedCase)
      
      saveLocalCases(cloudCases)
      return cloudCases
    } catch (error) {
      console.warn("⚠️ Firestore load failed, falling back to local cache:", error)
      return local
    }
  },

  /**
   * Save a single case.
   * Saves to localStorage first (as cache), then attempts Firestore save if uid is provided.
   */
  async saveCase(savedCase: SavedCase, uid?: string | null): Promise<{ success: boolean; isCloud: boolean }> {
    const local = getLocalCases()
    const updatedLocal = [savedCase, ...local.filter(c => c.id !== savedCase.id)].slice(0, 50)
    saveLocalCases(updatedLocal)

    if (!isFirebaseActive || !firestoreDb || !uid) {
      return { success: true, isCloud: false }
    }

    try {
      await setDoc(doc(firestoreDb, 'users', uid, 'cases', savedCase.id), savedCase)
      return { success: true, isCloud: true }
    } catch (error) {
      console.error("❌ Firestore save failed. Saved locally instead:", error)
      return { success: true, isCloud: false }
    }
  },

  /**
   * Update a case.
   * Updates locally, then attempts Firestore update if uid is provided.
   */
  async updateCase(caseId: string, updates: Partial<SavedCase>, uid?: string | null): Promise<{ success: boolean; isCloud: boolean }> {
    const local = getLocalCases()
    let updatedItem: SavedCase | null = null
    const updatedLocal = local.map((item) => {
      if (item.id === caseId) {
        updatedItem = {
          ...item,
          ...updates,
          updatedAt: new Date().toISOString(),
        } as SavedCase
        return updatedItem
      }
      return item
    })

    saveLocalCases(updatedLocal)

    if (!isFirebaseActive || !firestoreDb || !uid || !updatedItem) {
      return { success: true, isCloud: false }
    }

    try {
      await setDoc(doc(firestoreDb, 'users', uid, 'cases', caseId), updatedItem)
      return { success: true, isCloud: true }
    } catch (error) {
      console.error("❌ Firestore update failed. Updated locally instead:", error)
      return { success: true, isCloud: false }
    }
  },

  /**
   * Delete a case.
   * Deletes locally, then attempts Firestore deletion if uid is provided.
   */
  async deleteCase(caseId: string, uid?: string | null): Promise<{ success: boolean; isCloud: boolean }> {
    const local = getLocalCases()
    const updatedLocal = local.filter((item) => item.id !== caseId)
    saveLocalCases(updatedLocal)

    if (!isFirebaseActive || !firestoreDb || !uid) {
      return { success: true, isCloud: false }
    }

    try {
      await deleteDoc(doc(firestoreDb, 'users', uid, 'cases', caseId))
      return { success: true, isCloud: true }
    } catch (error) {
      console.error("❌ Firestore delete failed. Deleted locally instead:", error)
      return { success: true, isCloud: false }
    }
  },

  /**
   * Synchronization strategy on login.
   * Merges local guest cases into cloud storage under the authenticated userId.
   * Resolves conflicts by comparing updatedAt/createdAt timestamps.
   */
  async syncLocalToCloud(uid: string): Promise<SavedCase[]> {
    if (!isFirebaseActive || !firestoreDb || !uid) {
      return getLocalCases()
    }

    try {
      const casesQuery = query(collection(firestoreDb, 'users', uid, 'cases'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(casesQuery)
      const cloudCases = snap.docs.map(d => d.data() as SavedCase)
      const cloudMap = new Map(cloudCases.map(c => [c.id, c]))

      const localCases = getLocalCases()
      const syncPromises: Promise<void>[] = []
      const mergedMap = new Map<string, SavedCase>(cloudMap)

      for (const localCase of localCases) {
        const cloudCase = cloudMap.get(localCase.id)
        if (!cloudCase) {
          mergedMap.set(localCase.id, localCase)
          syncPromises.push(
            setDoc(doc(firestoreDb, 'users', uid, 'cases', localCase.id), localCase)
              .catch(err => console.error(`Failed to sync local case ${localCase.id} to cloud:`, err))
          )
        } else {
          const localTime = new Date(localCase.updatedAt || localCase.createdAt).getTime()
          const cloudTime = new Date(cloudCase.updatedAt || cloudCase.createdAt).getTime()
          if (localTime > cloudTime) {
            mergedMap.set(localCase.id, localCase)
            syncPromises.push(
              setDoc(doc(firestoreDb, 'users', uid, 'cases', localCase.id), localCase)
                .catch(err => console.error(`Failed to sync newer local case ${localCase.id} to cloud:`, err))
            )
          }
        }
      }

      if (syncPromises.length > 0) {
        await Promise.all(syncPromises)
      }

      const finalCases = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      saveLocalCases(finalCases)
      return finalCases
    } catch (error) {
      console.warn("⚠️ Firestore sync failed, returning local cases:", error)
      return getLocalCases()
    }
  }
}
