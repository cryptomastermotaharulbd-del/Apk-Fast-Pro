import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'

// Admin routes require BOTH a Supabase session AND an active row in the
// admins table (enforced again by RLS in the database). Hiding /admin is
// never treated as the security measure.
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, isAdmin, loading } = useAuth()
  const location = useLocation()
  if (loading) return <p className="py-20 text-center text-slate-400">Checking access…</p>
  if (!session || !isAdmin) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  return <>{children}</>
}
