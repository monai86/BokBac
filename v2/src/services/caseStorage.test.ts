import { vi, describe, it, expect, beforeEach } from 'vitest'
import { caseStorage, getLocalCases, saveLocalCases } from './caseStorage'

import { doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore'
import type { SavedCase } from '@/lib/types'

vi.mock('@/auth/firebase', () => ({
  db: {},
  isFirebaseActive: true,
  app: {},
  auth: {}
}))

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  deleteDoc: vi.fn(),
  collection: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn()
}))

const mockCase: SavedCase = {
  id: 'case-1',
  createdAt: '2026-06-10T10:00:00Z',
  title: 'E. coli workup',
  tags: ['urine'],
  group: 'enterobacterales',
  initialObservation: { gramReaction: 'negative', morphology: 'bacilli', arrangement: 'single' },
  answers: { indole: '+' },
  suiteId: 'enterobacterales_default',
  suiteName: 'Enterobacterales Suite',
  suiteVersion: '1.0',
  engineVersion: '4.0.0',
  topSpecies: 'Escherichia coli',
  topPct: 99
}

describe('caseStorage service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    if (typeof window !== 'undefined') {
      window.localStorage.clear()
    }
  })

  it('saves and loads cases locally for anonymous users', async () => {
    // 1. Save case as anonymous
    const res = await caseStorage.saveCase(mockCase, null)
    expect(res.success).toBe(true)
    expect(res.isCloud).toBe(false)

    // 2. Verify localStorage contains the case
    const local = getLocalCases()
    expect(local).toHaveLength(1)
    expect(local[0].id).toBe('case-1')
    expect(setDoc).not.toHaveBeenCalled()

    // 3. Verify loadCases retrieves from local
    const loaded = await caseStorage.loadCases(null)
    expect(loaded).toHaveLength(1)
    expect(loaded[0].id).toBe('case-1')
  })

  it('saves cases to Firestore and mirrors locally for logged-in users', async () => {
    vi.mocked(setDoc).mockResolvedValueOnce(undefined)

    const res = await caseStorage.saveCase(mockCase, 'user123')
    expect(res.success).toBe(true)
    expect(res.isCloud).toBe(true)

    // Verify setDoc was called with appropriate path
    expect(setDoc).toHaveBeenCalled()
    expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', 'user123', 'cases', 'case-1')

    // Verify mirrored locally
    const local = getLocalCases()
    expect(local).toHaveLength(1)
    expect(local[0].id).toBe('case-1')
  })

  it('falls back to local storage when Firestore save fails (offline)', async () => {
    // Mock setDoc throwing a network/offline error
    vi.mocked(setDoc).mockRejectedValueOnce(new Error('Failed to reach Firestore (offline)'))

    const res = await caseStorage.saveCase(mockCase, 'user-offline')
    
    // We expect success to be true (since it successfully saved locally as fallback)
    expect(res.success).toBe(true)
    expect(res.isCloud).toBe(false)

    // Verify it is saved locally
    const local = getLocalCases()
    expect(local).toHaveLength(1)
    expect(local[0].id).toBe('case-1')
  })

  it('deletes case locally and in cloud', async () => {
    // Save locally first
    saveLocalCases([mockCase])
    vi.mocked(deleteDoc).mockResolvedValueOnce(undefined)

    const res = await caseStorage.deleteCase('case-1', 'user123')
    expect(res.success).toBe(true)
    expect(res.isCloud).toBe(true)

    // Verify deleted locally
    expect(getLocalCases()).toHaveLength(0)

    // Verify deleteDoc called
    expect(deleteDoc).toHaveBeenCalled()
    expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', 'user123', 'cases', 'case-1')
  })

  it('falls back locally when delete in cloud fails', async () => {
    saveLocalCases([mockCase])
    vi.mocked(deleteDoc).mockRejectedValueOnce(new Error('Deletion failed'))

    const res = await caseStorage.deleteCase('case-1', 'user123')
    expect(res.success).toBe(true)
    expect(res.isCloud).toBe(false)

    // Local copy is still deleted
    expect(getLocalCases()).toHaveLength(0)
  })

  it('syncs local cases to the cloud and resolves conflicts during login', async () => {
    // 1. Set up local cases: one new case and one conflicting newer case
    const localNewCase: SavedCase = { ...mockCase, id: 'case-local-only', title: 'Local Only Case' }
    const localConflictingCase: SavedCase = { 
      ...mockCase, 
      id: 'case-shared', 
      title: 'Local Newer Case', 
      updatedAt: '2026-06-10T12:00:00Z' 
    }
    saveLocalCases([localNewCase, localConflictingCase])

    // 2. Set up cloud cases: one distinct cloud case and one conflicting older case
    const cloudDistinctCase: SavedCase = { ...mockCase, id: 'case-cloud-only', title: 'Cloud Only Case' }
    const cloudConflictingCase: SavedCase = { 
      ...mockCase, 
      id: 'case-shared', 
      title: 'Cloud Older Case', 
      updatedAt: '2026-06-10T10:00:00Z' // Older than local
    }

    vi.mocked(getDocs).mockResolvedValueOnce({
      docs: [
        { data: () => cloudDistinctCase },
        { data: () => cloudConflictingCase }
      ]
    } as any)

    vi.mocked(setDoc).mockResolvedValue(undefined)

    // 3. Trigger sync
    const synced = await caseStorage.syncLocalToCloud('user123')

    // Expecting 3 merged cases: local-only, cloud-only, and the newer version of the conflicting case
    expect(synced).toHaveLength(3)
    
    const syncedMap = new Map(synced.map(c => [c.id, c]))
    expect(syncedMap.has('case-local-only')).toBe(true)
    expect(syncedMap.has('case-cloud-only')).toBe(true)
    expect(syncedMap.has('case-shared')).toBe(true)
    
    // Ensure conflicting case resolved to the newer local version
    expect(syncedMap.get('case-shared')?.title).toBe('Local Newer Case')

    // Ensure local-only was uploaded, and conflicting newer local case was uploaded
    expect(setDoc).toHaveBeenCalledTimes(2)
  })
})
