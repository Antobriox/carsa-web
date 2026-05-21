import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { CatalogPageShell } from '@/components/public/catalog-page-shell'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type LegalSection = {
  title: string
  paragraphs: string[]
  listItems?: string[]
}

type LegalPageLayoutProps = {
  title: string
  updated: string
  intro: string
  sections: LegalSection[]
}

export function LegalPageLayout({
  title,
  updated,
  intro,
  sections,
}: LegalPageLayoutProps) {
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

          <article className="rounded-2xl border border-border/70 bg-card/40 p-6 shadow-xl shadow-black/20 sm:p-10">
            <header className="border-b border-border/60 pb-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-carsa-primary">
                CARSA · Legal
              </p>
              <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {title}
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Última actualización: {updated}
              </p>
            </header>

            <p className="mt-6 text-sm leading-relaxed text-foreground/90 sm:text-base">
              {intro}
            </p>

            <div className="mt-10 space-y-8">
              {sections.map((section) => (
                <section key={section.title}>
                  <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">
                    {section.title}
                  </h2>
                  <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">
                    {section.paragraphs.map((p, index) => (
                      <p key={index}>{p}</p>
                    ))}
                    {section.listItems?.length ? (
                      <ul className="list-disc space-y-2 pl-5 marker:text-carsa-primary/80">
                        {section.listItems.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </section>
              ))}
            </div>
          </article>

          <div className="mt-8 text-center">
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
