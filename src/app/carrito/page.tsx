import { redirect } from 'next/navigation'

import { CartPageContent } from '@/components/public/cart-page-content'
import { CatalogPageShell } from '@/components/public/catalog-page-shell'
import { getSessionWithProfile, hasRole } from '@/lib/auth/session'

export const metadata = {
  title: 'Carrito',
}

export default async function CarritoPage() {
  const session = await getSessionWithProfile()

  if (!session) {
    redirect('/login?next=/carrito')
  }

  if (hasRole(session, 'admin')) {
    redirect('/admin')
  }

  if (session.profile.role !== 'customer') {
    redirect('/cuenta')
  }

  return (
    <CatalogPageShell>
      <div className="mx-auto max-w-6xl py-16 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:pl-[max(1.5rem,env(safe-area-inset-left))] sm:pr-[max(1.5rem,env(safe-area-inset-right))]">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Carrito
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Revisa cantidades y el total. Cuando confirmes, enviaremos tu pedido a
          CARSA para validar disponibilidad.
        </p>
        <div className="mt-10">
          <CartPageContent />
        </div>
      </div>
    </CatalogPageShell>
  )
}
