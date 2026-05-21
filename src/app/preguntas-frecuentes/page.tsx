import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { CatalogPageShell } from '@/components/public/catalog-page-shell'
import { FaqAccordion } from '@/components/public/faq-accordion'
import { buttonVariants } from '@/components/ui/button'
import { FAQ_SUBTITLE } from '@/content/faq'
import { redirectAdminToPanel } from '@/lib/auth/redirect-admin-from-public'
import { cn } from '@/lib/utils'

export const metadata = {
  title: 'Preguntas frecuentes',
  description:
    'Respuestas sobre pedidos, llantas, baterías, servicios y atención en CARSA.',
}

export default async function PreguntasFrecuentesPage() {
  await redirectAdminToPanel()

  return (
    <CatalogPageShell>
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_70%_60%_at_50%_-10%,rgba(227,27,35,0.12),transparent)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl py-14 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:py-16 sm:pl-[max(1.5rem,env(safe-area-inset-left))] sm:pr-[max(1.5rem,env(safe-area-inset-right))]">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'mb-8 gap-2 text-muted-foreground hover:text-foreground'
            )}
          >
            <ArrowLeft className="size-4" aria-hidden />
            Volver al inicio
          </Link>

          <header className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-carsa-primary">
              CARSA · Ayuda
            </p>
            <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Preguntas frecuentes
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {FAQ_SUBTITLE}
            </p>
          </header>

          <FaqAccordion />

          <div className="mt-10 text-center">
            <Link
              href="/"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'bg-carsa-primary text-white hover:bg-carsa-primary-hover'
              )}
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </CatalogPageShell>
  )
}
