import { CartPageContent } from '@/components/public/cart-page-content'
import { CatalogPageShell } from '@/components/public/catalog-page-shell'
import { redirectAdminToPanel } from '@/lib/auth/redirect-admin-from-public'

export const metadata = {
  title: 'Carrito',
}

export default async function CarritoPage() {
  await redirectAdminToPanel()
  return (
    <CatalogPageShell>
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Carrito
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Revisa cantidades y el total antes de contactarnos por WhatsApp.
        </p>
        <div className="mt-10">
          <CartPageContent />
        </div>
      </div>
    </CatalogPageShell>
  )
}
