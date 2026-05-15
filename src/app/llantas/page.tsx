import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

import { redirectAdminToPanel } from '@/lib/auth/redirect-admin-from-public'
import { CatalogPageShell } from '@/components/public/catalog-page-shell'
import { TiresCatalogWithFilters } from '@/components/public/tires-catalog-with-filters'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import {
  asTireList,
  fetchActiveTires,
} from '@/lib/supabase/catalog-fetch'
import { CATALOG_LOAD_MESSAGE } from '@/lib/user-facing-error'
import { cn } from '@/lib/utils'

export const metadata = {
  title: 'Catálogo de llantas',
  description: 'Catálogo completo de llantas CARSA en Portoviejo.',
}

type SearchParams = Promise<{ q?: string }>

export default async function LlantasPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  await redirectAdminToPanel()
  const { q: initialQ } = await searchParams

  const { data, error } = await fetchActiveTires()

  if (error) {
    return (
      <CatalogPageShell>
        <div className="mx-auto flex max-w-6xl flex-col items-center py-16 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:pl-[max(1.5rem,env(safe-area-inset-left))] sm:pr-[max(1.5rem,env(safe-area-inset-right))]">
          <Card className="max-w-lg border-destructive/30 bg-card/90">
            <CardHeader>
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="size-5 shrink-0" aria-hidden />
                <CardTitle>No se pudo cargar el catálogo</CardTitle>
              </div>
              <CardDescription>{CATALOG_LOAD_MESSAGE}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </CatalogPageShell>
    )
  }

  const tires = asTireList(data)

  return (
    <CatalogPageShell>
      <div className="border-b border-border/60 bg-background">
        <div className="mx-auto max-w-6xl py-10 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:py-12 sm:pl-[max(1.5rem,env(safe-area-inset-left))] sm:pr-[max(1.5rem,env(safe-area-inset-right))]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-carsa-primary">
                CARSA
              </p>
              <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Catálogo de llantas
              </h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Todas las llantas activas del catálogo, con marca y precio. Usa
                los filtros o abre &quot;Ver detalle&quot; para ver rin, medida y
                modelo; desde ahí puedes escribirnos por WhatsApp.
              </p>
            </div>
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'h-11 w-full shrink-0 border-carsa-tertiary/50 sm:w-auto'
              )}
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>

      {tires.length === 0 ? (
        <div className="mx-auto max-w-6xl py-12 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:pl-[max(1.5rem,env(safe-area-inset-left))] sm:pr-[max(1.5rem,env(safe-area-inset-right))]">
          <p className="text-center text-muted-foreground">
            No hay llantas activas en el catálogo.
          </p>
        </div>
      ) : (
        <TiresCatalogWithFilters
          tires={tires}
          initialSearch={typeof initialQ === 'string' ? initialQ : ''}
        />
      )}
    </CatalogPageShell>
  )
}
