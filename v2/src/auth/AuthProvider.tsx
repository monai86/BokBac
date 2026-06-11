import React, { createContext, useState, useEffect } from 'react'
import type { User } from 'firebase/auth'
import * as authService from './authService'
import { useIdentifyStore } from '@/store/identifyStore'
import { db as firestoreDb, isFirebaseActive } from './firebase'
import { caseStorage, getLocalCases } from '@/services/caseStorage'
import { doc, getDoc } from 'firebase/firestore'


const GUEST_MODE_KEY = 'bokbac:v4:guest-mode'

function loadGuestMode() {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(GUEST_MODE_KEY) === 'true'
}

function persistGuestMode(guest: boolean) {
  if (typeof window === 'undefined') return
  if (guest) {
    window.localStorage.setItem(GUEST_MODE_KEY, 'true')
  } else {
    window.localStorage.removeItem(GUEST_MODE_KEY)
  }
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  isGuest: boolean
  setGuest: (isGuest: boolean) => void
  logout: () => Promise<void>
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuestState] = useState(loadGuestMode)

  const setGuest = (guest: boolean) => {
    setIsGuestState(guest)
    persistGuestMode(guest)
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
    setIsGuestState(false)
    persistGuestMode(false)
    useIdentifyStore.getState().applyAuthSnapshot({
      authUserId: null,
      savedCases: getLocalCases(),
    })
  }

  useEffect(() => {
    // Process Google sign-in redirect result (triggered after loginWithGoogle redirect)
    authService.handleGoogleRedirectResult().catch((err) => {
      console.error('Google redirect processing error:', err)
    })

    const unsubscribe = authService.onAuthStateChanged(async (usr) => {
      setUser(usr)
      setLoading(false)

      if (usr) {
        setIsGuestState(false)
        persistGuestMode(false)
        try {
          let settings = useIdentifyStore.getState().settings
          if (isFirebaseActive && firestoreDb) {
            const prefDoc = await getDoc(doc(firestoreDb, 'users', usr.uid, 'settings', 'preferences'))
            if (prefDoc.exists()) {
              settings = prefDoc.data()
              window.localStorage.setItem('bokbac:v4:settings', JSON.stringify(settings))
            }
          }
          const syncedCases = await caseStorage.syncLocalToCloud(usr.uid)
          useIdentifyStore.getState().applyAuthSnapshot({
            authUserId: usr.uid,
            savedCases: syncedCases,
            settings,
          })
        } catch (error) {
          console.error('Error syncing authenticated BokBac data:', error)
          useIdentifyStore.getState().applyAuthSnapshot({
            authUserId: usr.uid,
            savedCases: getLocalCases(),
          })
        }
      } else {
        useIdentifyStore.getState().applyAuthSnapshot({
          authUserId: null,
          savedCases: getLocalCases(),
        })
      }
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, isGuest, setGuest, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
