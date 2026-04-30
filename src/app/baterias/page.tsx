import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

import { redirectAdminToPanel } from '@/lib/auth/redirect-admin-from-public'
import { CatalogPageShell } from '@/components/public/catalog-page-shell'
import { BatteryProductGrid } from '@/components/public/catalog-product-grids'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import {
  asBatteryList,
  fetchActiveBatteries,
} from '@/lib/supabase/catalog-fetch'
import { cn } from '@/lib/utils'

export const metadata = {
  title: 'Catálogo de baterías',
  description: 'Catálogo completo de baterías CARSA en Portoviejo.',
}

export default async function BateriasPage() {
  await redirectAdminToPanel()
  const { data, error } = await fetchActiveBatteries()

  if (error) {
    return (
      <CatalogPageShell>
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-16 sm:px-6">
          <Card className="max-w-lg border-destructive/30 bg-card/90">
            <CardHeader>
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="size-5 shrink-0" aria-hidden />
                <CardTitle>No se pudo cargar el catálogo</CardTitle>
              </div>
              <CardDescription>{error.message}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </CatalogPageShell>
    )
  }

  const batteries = asBatteryList(data)

  return (
    <CatalogPageShell>
      <div className="border-b border-border/60 bg-background">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-carsa-primary">
                CARSA
              </p>
              <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Catálogo de baterías
              </h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Todas las baterías activas con marca y precio. Abre cada ficha
                con &quot;Ver detalle&quot; para ver datos técnicos y consultar
                por WhatsApp.
              </p>
            </div>
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'h-11 shrink-0 border-carsa-tertiary/50'
              )}
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
        {batteries.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No hay baterías activas en el catálogo.
          </p>
        ) : (
          <BatteryProductGrid batteries={batteries} />
        )}
      </div>
    </CatalogPageShell>
  )
}
