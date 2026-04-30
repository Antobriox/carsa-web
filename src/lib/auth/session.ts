import { cache } from 'react'

import { createClient } from '@/lib/supabase/server'
import type { Profile, ProfileRole } from '@/types/auth'

export type SessionWithProfile = {
  userId: string
  email: string
  profile: Profile
}

/**
 * Sesión + perfil en el servidor (React cache por request).
 * Usar en layouts/páginas protegidas; no exponer al cliente.
 */
export const getSessionWithProfile = cache(
  async (): Promise<SessionWithProfile | null> => {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.email) return null

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, full_name, phone, role')
      .eq('id', user.id)
      .single()

    if (error || !profile) return null

    return {
      userId: user.id,
      email: user.email,
      profile: profile as Profile,
    }
  }
)

export function hasRole(
  session: SessionWithProfile | null,
  role: ProfileRole
): boolean {
  return session?.profile.role === role
}
