import React, { createContext, useState, useEffect } from 'react'
import type { User } from 'firebase/auth'
import * as authService from './authService'
import { useIdentifyStore } from '@/store/identifyStore'

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
  const [isGuest, setIsGuestState] = useState(false)

  const setGuest = (guest: boolean) => {
    setIsGuestState(guest)
    useIdentifyStore.setState({ isGuest: guest })
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
    setIsGuestState(false)
    useIdentifyStore.setState({ user: null, isGuest: false })
  }

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((usr) => {
      setUser(usr)
      setLoading(false)

      const currentGuest = useIdentifyStore.getState().isGuest
      useIdentifyStore.setState({
        user: usr,
        loadingAuth: false,
        isGuest: usr ? false : currentGuest,
      })

      if (usr) {
        setIsGuestState(false)
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
