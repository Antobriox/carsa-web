'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'

import { createSupabaseBrowser } from '@/lib/supabase/client'
import type { Profile } from '@/types/auth'

type AuthContextValue = {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  /** Limpia sesión/usuario/perfil en React sin esperar a Supabase (p. ej. tras signOut). */
  clearClientSession: () => void
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = useMemo(() => createSupabaseBrowser(), [])

  const fetchProfile = useCallback(
    async (userId: string): Promise<Profile | null> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone, role')
        .eq('id', userId)
        .maybeSingle()

      if (error || !data) {
        setProfile(null)
        return null
      }

      const p = data as Profile
      setProfile(p)
      return p
    },
    [supabase]
  )

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      const {
        data: { session: s },
      } = await supabase.auth.getSession()

      if (cancelled) return

      setSession(s)
      setUser(s?.user ?? null)

      if (s?.user) {
        await fetchProfile(s.user.id)
      } else {
        setProfile(null)
      }

      if (!cancelled) setLoading(false)
    }

    void init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (cancelled) return
      setSession(newSession)
      setUser(newSession?.user ?? null)
      if (newSession?.user) {
        // No await: un callback async puede retrasar o bloquear signOut() del cliente.
        void fetchProfile(newSession.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

  const clearClientSession = useCallback(() => {
    setSession(null)
    setUser(null)
    setProfile(null)
    setLoading(false)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id)
  }, [user, fetchProfile])

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      loading,
      clearClientSession,
      refreshProfile,
    }),
    [session, user, profile, loading, clearClientSession, refreshProfile]
  )

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return ctx
}
