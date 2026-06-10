import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isGuest } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030712] text-zinc-400">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
          <p className="text-sm font-semibold tracking-wide">กำลังตรวจสอบระบบ...</p>
        </div>
      </div>
    )
  }

  if (!user && !isGuest) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
