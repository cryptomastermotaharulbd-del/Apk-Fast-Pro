import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthState {
  session: Session | null; user: User | null; isAdmin: boolean; loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}
const Ctx = createContext<AuthState>({
  session: null, user: null, isAdmin: false, loading: true,
  signIn: async () => ({}), signOut: async () => {},
})
export const useAuth = () => useContext(Ctx)

async function checkAdmin(userId: string) {
  const { data } = await supabase.from('admins').select('id')
    .eq('user_id', userId).eq('is_active', true).maybeSingle()
  return Boolean(data)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session)
      setIsAdmin(data.session ? await checkAdmin(data.session.user.id) : false)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, s) => {
      setSession(s)
      setIsAdmin(s ? await checkAdmin(s.user.id) : false)
      setLoading(false)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const signIn: AuthState['signIn'] = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    if (data.user && !(await checkAdmin(data.user.id))) {
      await supabase.auth.signOut()
      return { error: 'This account is not an authorized admin. Ask a super admin to add it in Admin → Users (see docs/ADMIN_SETUP.md).' }
    }
    return {}
  }
  const signOut = async () => { await supabase.auth.signOut() }
  return <Ctx.Provider value={{ session, user: session?.user || null, isAdmin, loading, signIn, signOut }}>{children}</Ctx.Provider>
}
