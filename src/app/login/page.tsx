import { Suspense } from 'react'
import { redirect } from 'next/navigation'

import { AuthPageShell } from '@/components/auth/auth-page-shell'
import { LoginForm } from '@/components/auth/login-form'
import { TireLoadingIcon } from '@/components/ui/tire-loading-icon'
import { getSessionWithProfile, hasRole } from '@/lib/auth/session'
import { safeCustomerPostLoginPath } from '@/lib/auth/safe-redirect'

export const metadata = {
  title: 'Iniciar sesión',
}

function LoginFallback() {
  return (
    <AuthPageShell>
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 py-8">
        <TireLoadingIcon className="size-10" decorative />
        <p className="text-sm text-muted-foreground">Cargando…</p>
      </div>
    </AuthPageShell>
  )
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const session = await getSessionWithProfile()
  const sp = await searchParams

  if (session) {
    if (hasRole(session, 'admin')) {
      redirect('/admin')
    }
    redirect(safeCustomerPostLoginPath(sp.next))
  }

  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  )
}
