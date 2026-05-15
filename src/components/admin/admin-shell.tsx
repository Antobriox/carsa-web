'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo, useState } from 'react'
import { Loader2, LogOut, Menu } from 'lucide-react'

import { adminNavItems } from '@/components/admin/admin-nav'
import { CarsaLogoMark } from '@/components/branding/carsa-logo-mark'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { AdminNotifications } from '@/components/admin/admin-notifications'
import { useAdminLogout } from '@/hooks/use-admin-logout'
import { cn } from '@/lib/utils'

function getAdminPageTitle(pathname: string) {
  if (pathname === '/admin') return 'Dashboard'
  const item = adminNavItems.find(
    (i) =>
      i.href !== '/admin' &&
      (pathname === i.href || pathname.startsWith(`${i.href}/`))
  )
  return item?.label ?? 'Administración'
}

function NavLinks({
  onNavigate,
  className,
}: {
  onNavigate?: () => void
  className?: string
}) {
  const pathname = usePathname()

  return (
    <nav className={cn('flex flex-col gap-1', className)} aria-label="Admin">
      {adminNavItems.map(({ href, label, icon: Icon }) => {
        const active =
          href === '/admin'
            ? pathname === '/admin'
            : pathname === href || pathname.startsWith(`${href}/`)
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'justify-start gap-2.5 rounded-xl px-3 py-2 font-medium transition-colors',
              active
                ? 'bg-carsa-primary/15 text-carsa-primary shadow-sm ring-1 ring-carsa-primary/20 hover:bg-carsa-primary/20'
                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
            )}
          >
            <Icon className="size-4 shrink-0 opacity-90" aria-hidden />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sheetOpen, setSheetOpen] = useState(false)
  const { logout, busy } = useAdminLogout()
  const pageTitle = useMemo(() => getAdminPageTitle(pathname), [pathname])

  return (
    <div
      className={cn(
        'flex min-h-screen bg-background text-foreground',
        '[&_a[href]]:cursor-pointer [&_button:not(:disabled)]:cursor-pointer',
        '[&_select:not(:disabled)]:cursor-pointer [&_summary]:cursor-pointer',
        '[&_[role=tab]]:cursor-pointer [&_label:has(input)]:cursor-pointer'
      )}
    >
      <aside className="hidden w-64 shrink-0 border-r border-border/60 bg-gradient-to-b from-card/90 via-card/50 to-background md:flex md:flex-col">
        <div className="flex h-[3.75rem] items-center justify-between gap-2 border-b border-border/50 bg-card/40 px-4 backdrop-blur-sm">
          <div className="flex min-w-0 items-center gap-3">
            <CarsaLogoMark variant="plain" size={10} />
            <div className="min-w-0">
              <p className="truncate font-heading text-sm font-bold tracking-tight text-carsa-primary">
                CARSA Admin
              </p>
              <p className="text-[0.65rem] text-muted-foreground">Panel de control</p>
            </div>
          </div>
          <AdminNotifications />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-3">
          <NavLinks />
          <div className="mt-auto border-t border-border/50 pt-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
              disabled={busy}
              onClick={() => void logout()}
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <LogOut className="size-4" aria-hidden />
              )}
              Cerrar sesión
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex min-h-14 items-center gap-3 border-b border-border/60 bg-background/90 px-[max(1rem,env(safe-area-inset-left))] pt-[env(safe-area-inset-top)] pr-[max(1rem,env(safe-area-inset-right))] backdrop-blur-md md:hidden">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Abrir menú admin">
                  <Menu className="size-5" />
                </Button>
              }
            />
            <SheetContent side="left" className="w-[min(100%,19rem)] gap-0 border-border/60 bg-gradient-to-b from-card to-background p-0">
              <SheetHeader className="flex flex-row items-center gap-3 border-b border-border/50 bg-card/50 p-4 text-left">
                <CarsaLogoMark variant="plain" size={9} />
                <SheetTitle className="font-heading text-base">CARSA Admin</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-3 p-3">
                <NavLinks onNavigate={() => setSheetOpen(false)} />
                <div className="border-t border-border/50 pt-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 rounded-xl text-destructive"
                    disabled={busy}
                    onClick={() => {
                      void logout()
                      setSheetOpen(false)
                    }}
                  >
                    {busy ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <LogOut className="size-4" aria-hidden />
                    )}
                    Cerrar sesión
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <div className="min-w-0 flex-1">
            <p className="truncate font-heading text-sm font-semibold text-foreground">
              {pageTitle}
            </p>
            <p className="truncate text-[0.65rem] text-muted-foreground">
              Administración
            </p>
          </div>
          <AdminNotifications />
        </header>

        <main className="relative min-w-0 flex-1 overflow-x-clip overflow-y-auto bg-gradient-to-b from-transparent via-carsa-primary/[0.02] to-transparent p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:p-5 md:p-6 md:pb-6">
          <div className="mx-auto w-full min-w-0 max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
