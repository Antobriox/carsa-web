'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'

import { CarsaLogoMark } from '@/components/branding/carsa-logo-mark'
import { SiteFooter } from '@/components/public/site-footer'
import { SiteHeader } from '@/components/public/site-header'
import { WhatsAppFloatingButton } from '@/components/public/whatsapp-floating-button'
import { cn } from '@/lib/utils'

const easeOut = [0.22, 1, 0.36, 1] as const

export function AuthPageShell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(227,27,35,0.08),transparent)]" />
      <SiteHeader />
      <main className="relative flex flex-1 flex-col px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
          <Link
            href="/"
            className="mb-8 flex items-center justify-center gap-2 text-carsa-primary transition hover:opacity-90"
          >
            <CarsaLogoMark className="bg-carsa-primary/10 ring-carsa-primary/25" />
            <span className="font-heading text-xl font-bold tracking-tight">
              CARSA
            </span>
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: easeOut }}
            className={cn(
              'rounded-2xl border border-border/70 bg-card/90 p-6 shadow-xl shadow-black/20 ring-1 ring-white/[0.04] backdrop-blur-sm sm:p-8',
              className
            )}
          >
            {children}
          </motion.div>
        </div>
      </main>
      <div className="hidden md:block">
        <SiteFooter />
      </div>
      <WhatsAppFloatingButton />
    </div>
  )
}
