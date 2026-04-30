import { redirect } from 'next/navigation'

import { getSessionWithProfile, hasRole } from '@/lib/auth/session'

/**
 * Si el usuario es admin, manda al panel sin pintar la página pública.
 * Refuerza el middleware (Edge) por si la sesión/rol no se detectó igual en Node.
 */
export async function redirectAdminToPanel() {
  const session = await getSessionWithProfile()
  if (session && hasRole(session, 'admin')) {
    redirect('/admin')
  }
}
