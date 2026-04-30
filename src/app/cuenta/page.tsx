import { redirect } from 'next/navigation'

import { CuentaView } from '@/components/auth/cuenta-view'
import { getSessionWithProfile, hasRole } from '@/lib/auth/session'

export const metadata = {
  title: 'Mi cuenta',
}

export default async function CuentaPage({
  searchParams,
}: {
  searchParams: Promise<{ admin?: string }>
}) {
  const session = await getSessionWithProfile()
  const sp = await searchParams

  if (!session) {
    redirect('/login?next=/cuenta')
  }

  if (hasRole(session, 'admin')) {
    redirect('/admin')
  }

  return (
    <CuentaView
      profile={session.profile}
      email={session.email}
      adminAccessDenied={sp.admin === 'forbidden'}
    />
  )
}
