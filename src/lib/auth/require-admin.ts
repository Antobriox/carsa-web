import { redirect } from 'next/navigation'

import { getSessionWithProfile, hasRole } from '@/lib/auth/session'

/**
 * Protege rutas del panel admin en el servidor (sin flash de UI).
 */
export async function requireAdmin() {
  const session = await getSessionWithProfile()

  if (!session) {
    redirect('/login?next=/admin')
  }

  if (!hasRole(session, 'admin')) {
    redirect('/cuenta?admin=forbidden')
  }

  return session
}
