import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { LoadingSplash } from './LoadingSplash'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isGuest } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#030712] text-zinc-400">
        <LoadingSplash label="กำลังตรวจสอบระบบ..." />
      </div>
    )
  }

  if (!user && !isGuest) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
