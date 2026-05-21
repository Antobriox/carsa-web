'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Battery,
  Circle,
  Loader2,
  LogOut,
  MapPin,
  Menu,
  Shield,
  ShoppingCart,
  Wrench,
  X,
} from 'lucide-react'

import { UserAccountAvatar } from '@/components/auth/user-account-avatar'
import { CarsaLogoMark } from '@/components/branding/carsa-logo-mark'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useAuth } from '@/context/auth-context'
import { devError } from '@/lib/dev-log'
import { getUserInitials } from '@/lib/user-initials'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { useCartStore } from '@/stores/cart-store'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/llantas', label: 'Llantas', icon: Circle },
  { href: '/baterias', label: 'Baterías', icon: Battery },
  { href: '/#servicios', label: 'Servicios', icon: Wrench },
  { href: '/#contacto', label: 'Contacto', icon: MapPin },
] as const

function isNavItemActive(href: string, pathname: string, hash: string) {
  if (href.startsWith('/#')) {
    const target = href.slice(1)
    return pathname === '/' && hash === target
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

function AuthSkeleton() {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2" aria-busy="true">
      <div className="size-9 animate-pulse rounded-full bg-muted/80 sm:size-10" />
      <div className="h-8 w-24 animate-pulse rounded-md bg-muted/80 sm:h-9" />
    </div>
  )
}

export function SiteHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const [locationHash, setLocationHash] = useState('')

  useEffect(() => {
    const syncHash = () => setLocationHash(window.location.hash)
    syncHash()
    window.addEventListener('hashchange', syncHash)
    return () => window.removeEventListener('hashchange', syncHash)
  }, [pathname])
  const itemCount = useCartStore((s) =>
    s.items.reduce((acc, i) => acc + i.quantity, 0)
  )
  const { user, profile, loading, clearClientSession } = useAuth()
  const supabase = useMemo(() => createSupabaseBrowser(), [])
  const signOutOnceRef = useRef(false)

  const [mobileOpen, setMobileOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState<string | null>(null)

  const isAdmin = profile?.role === 'admin'

  const closeMobile = () => setMobileOpen(false)

  const handleSignOut = async () => {
    if (signOutOnceRef.current) return
    signOutOnceRef.current = true
    setSignOutError(null)
    setSigningOut(true)

    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' })
      if (error) {
        devError('[CARSA logout] error', error)
        setSignOutError(
          'No se pudo cerrar sesión del todo. Si sigues viendo tu cuenta, recarga la página.'
        )
      }

      clearClientSession()
      useCartStore.getState().clearCart()
      closeMobile()
      router.replace('/')
      router.refresh()
    } catch (error) {
      devError('[CARSA logout] unexpected error', error)
      setSignOutError(
        'Ocurrió un error al cerrar sesión. Se actualizará la página.'
      )
      clearClientSession()
      useCartStore.getState().clearCart()
      closeMobile()
      router.replace('/')
      router.refresh()
    } finally {
      setSigningOut(false)
      signOutOnceRef.current = false
    }
  }

  const authDesktop = loading ? (
    <AuthSkeleton />
  ) : !user ? (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <Link
        href="/registro"
        className={cn(
          buttonVariants({ variant: 'outline', size: 'sm' }),
          'h-8 border-border/80 bg-muted/20 px-2.5 text-[0.7rem] font-semibold tracking-wide text-foreground',
          'shadow-sm shadow-black/20 backdrop-blur-sm',
          'transition duration-200',
          'hover:border-carsa-primary/45 hover:bg-carsa-primary/10 hover:text-foreground',
          'sm:h-9 sm:px-4 sm:text-sm sm:tracking-normal'
        )}
      >
        Crear cuenta
      </Link>
      <Link
        href="/login"
        className={cn(
          buttonVariants({ size: 'sm' }),
          'h-8 bg-carsa-primary px-2.5 text-[0.7rem] font-semibold tracking-wide text-white',
          'shadow-md shadow-carsa-primary/35 ring-1 ring-white/10',
          'transition duration-200',
          'hover:bg-carsa-primary-hover hover:shadow-lg hover:shadow-carsa-primary/40',
          'active:scale-[0.98] sm:h-9 sm:px-4 sm:text-sm sm:tracking-normal'
        )}
      >
        Iniciar sesión
      </Link>
    </div>
  ) : (
    <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
      {isAdmin ? (
        <Link
          href="/admin"
          className={cn(
            buttonVariants({ variant: 'outline', size: 'sm' }),
            'h-8 border-carsa-primary/40 bg-carsa-primary/10 px-2.5 text-[0.7rem] font-semibold text-carsa-primary',
            'sm:h-9 sm:px-3 sm:text-sm'
          )}
        >
          <Shield className="mr-1 size-3.5 sm:mr-1.5" aria-hidden />
          Admin
        </Link>
      ) : null}
      <UserAccountAvatar
        fullName={profile?.full_name}
        email={user.email}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 px-2.5 text-[0.7rem] text-muted-foreground hover:text-destructive sm:h-9 sm:px-3 sm:text-sm"
        onClick={handleSignOut}
        disabled={signingOut}
      >
        {signingOut ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <>
            <LogOut className="mr-1 size-3.5 sm:mr-1.5" aria-hidden />
            <span className="hidden lg:inline">Cerrar sesión</span>
          </>
        )}
      </Button>
    </div>
  )

  const authMobile = loading ? (
    <div className="flex flex-col gap-2" aria-busy="true">
      <div className="h-11 w-full animate-pulse rounded-xl bg-muted/60" />
      <div className="h-11 w-full animate-pulse rounded-xl bg-muted/60" />
    </div>
  ) : !user ? (
    <div className="flex flex-col gap-2">
      <Link
        href="/registro"
        onClick={closeMobile}
        className={cn(
          buttonVariants({ variant: 'outline', size: 'default' }),
          'h-11 w-full justify-center rounded-xl border-border/70 bg-muted/15 font-semibold shadow-sm shadow-black/20'
        )}
      >
        Crear cuenta
      </Link>
      <Link
        href="/login"
        onClick={closeMobile}
        className={cn(
          buttonVariants({ size: 'default' }),
          'h-11 w-full justify-center rounded-xl bg-carsa-primary font-semibold text-white shadow-md shadow-carsa-primary/30 ring-1 ring-white/10 hover:bg-carsa-primary-hover'
        )}
      >
        Iniciar sesión
      </Link>
    </div>
  ) : (
    <div className="flex flex-col gap-2">
      <Link
        href="/cuenta"
        onClick={closeMobile}
        className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/15 p-3 transition hover:border-carsa-primary/30 hover:bg-carsa-primary/5"
      >
        <span
          className={cn(
            'inline-flex size-10 shrink-0 items-center justify-center rounded-full',
            'bg-carsa-primary/20 text-sm font-semibold tracking-tight text-carsa-primary',
            'ring-2 ring-carsa-primary/25'
          )}
          aria-hidden
        >
          {getUserInitials(profile?.full_name, user.email)}
        </span>
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-semibold text-foreground">
            {profile?.full_name?.trim() || 'Mi cuenta'}
          </p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
      </Link>
      {isAdmin ? (
        <Link
          href="/admin"
          onClick={closeMobile}
          className={cn(
            buttonVariants({ variant: 'outline', size: 'default' }),
            'h-11 w-full justify-center gap-2 rounded-xl border-carsa-primary/40 bg-carsa-primary/10 font-semibold text-carsa-primary'
          )}
        >
          <Shield className="size-4" aria-hidden />
          Panel admin
        </Link>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        size="default"
        className="h-11 w-full justify-center gap-2 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={handleSignOut}
        disabled={signingOut}
      >
        {signingOut ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <>
            <LogOut className="size-4" aria-hidden />
            Cerrar sesión
          </>
        )}
      </Button>
    </div>
  )

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      {signOutError ? (
        <div
          role="alert"
          className="border-b border-destructive/40 bg-destructive/10 px-4 py-2 text-center text-sm text-destructive"
        >
          {signOutError}
        </div>
      ) : null}
      <div className="mx-auto flex min-h-14 max-w-6xl items-center justify-between gap-2 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:min-h-16 sm:gap-4 sm:pl-[max(1.5rem,env(safe-area-inset-left))] sm:pr-[max(1.5rem,env(safe-area-inset-right))]">
        <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-4">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 md:hidden"
                  aria-label="Abrir menú"
                >
                  <Menu className="size-5" />
                </Button>
              }
            />
            <SheetContent
              side="left"
              showCloseButton={false}
              className="w-[min(100%,19.5rem)] max-w-[19.5rem] gap-0 border-border/50 bg-gradient-to-b from-card via-background to-background p-0 shadow-2xl shadow-black/50"
            >
              <SheetHeader className="flex flex-row items-center justify-between gap-3 border-b border-border/50 bg-card/40 px-4 py-3.5 text-left">
                <Link
                  href="/"
                  onClick={closeMobile}
                  className="group flex min-w-0 items-center gap-2.5"
                >
                  <CarsaLogoMark
                    size={9}
                    className="bg-carsa-primary/10 ring-carsa-primary/25 transition group-hover:bg-carsa-primary/18"
                  />
                  <SheetTitle className="font-heading text-lg font-bold tracking-tight text-carsa-primary">
                    CARSA
                  </SheetTitle>
                </Link>
                <SheetClose
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-9 shrink-0 rounded-xl text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      aria-label="Cerrar menú"
                    />
                  }
                >
                  <X className="size-5" aria-hidden />
                </SheetClose>
              </SheetHeader>

              <div className="flex flex-col gap-4 px-3 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <nav className="flex flex-col gap-1" aria-label="Principal móvil">
                  {nav.map((item) => {
                    const Icon = item.icon
                    const active = isNavItemActive(
                      item.href,
                      pathname,
                      locationHash
                    )
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeMobile}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'flex h-11 items-center gap-3 rounded-xl px-3 text-[0.9375rem] font-medium transition duration-200',
                          active
                            ? 'bg-carsa-primary/15 text-foreground ring-1 ring-carsa-primary/25'
                            : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                        )}
                      >
                        <span
                          className={cn(
                            'flex size-8 shrink-0 items-center justify-center rounded-lg',
                            active
                              ? 'bg-carsa-primary/20 text-carsa-primary'
                              : 'bg-muted/30 text-muted-foreground'
                          )}
                          aria-hidden
                        >
                          <Icon className="size-4" strokeWidth={2} />
                        </span>
                        {item.label}
                      </Link>
                    )
                  })}
                </nav>

                <Link
                  href="/carrito"
                  onClick={closeMobile}
                  className={cn(
                    'flex h-11 items-center gap-3 rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] px-3 text-[0.9375rem] font-medium text-foreground shadow-inner shadow-black/25 ring-1 ring-white/[0.05] transition hover:border-carsa-primary/40 hover:text-carsa-primary'
                  )}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-carsa-primary/15 text-carsa-primary">
                    <ShoppingCart className="size-4" aria-hidden />
                  </span>
                  <span className="flex-1">Carrito</span>
                  {itemCount > 0 ? (
                    <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-carsa-primary px-1.5 text-xs font-bold text-white">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  ) : null}
                </Link>

                <div className="h-px bg-gradient-to-r from-transparent via-border/70 to-transparent" />

                {authMobile}
              </div>
            </SheetContent>
          </Sheet>

          <Link
            href="/"
            className="group flex min-w-0 shrink-0 items-center gap-2 font-heading text-lg font-bold tracking-tight sm:text-xl"
          >
            <CarsaLogoMark
              size={9}
              className="bg-carsa-primary/10 ring-carsa-primary/25 transition group-hover:bg-carsa-primary/18 sm:size-10"
            />
            <span className="truncate text-carsa-primary">CARSA</span>
          </Link>

          <nav
            className="-mx-1 hidden max-w-none flex-1 items-center gap-1 overflow-x-auto px-1 md:flex"
            aria-label="Principal"
          >
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'sm' }),
                  'shrink-0 text-carsa-neutral hover:text-foreground'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/carrito"
            className={cn(
              'relative flex size-10 shrink-0 items-center justify-center rounded-xl',
              'border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02]',
              'text-carsa-neutral shadow-inner shadow-black/30',
              'ring-1 ring-white/[0.06]',
              'transition duration-200',
              'hover:border-carsa-primary/50 hover:text-carsa-primary',
              'hover:shadow-md hover:shadow-carsa-primary/20 hover:ring-carsa-primary/20',
              'active:scale-[0.97]'
            )}
            aria-label={
              itemCount > 0
                ? `Carrito de compras, ${itemCount} artículos`
                : 'Carrito de compras'
            }
          >
            <ShoppingCart className="size-[1.125rem] sm:size-5" aria-hidden />
            {itemCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-carsa-primary px-1 text-[0.65rem] font-bold leading-none text-white shadow-sm shadow-black/40">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            ) : null}
          </Link>

          <div
            className="hidden h-8 w-px shrink-0 bg-gradient-to-b from-transparent via-border/80 to-transparent sm:block"
            aria-hidden
          />

          {!loading && user ? (
            <UserAccountAvatar
              fullName={profile?.full_name}
              email={user.email}
              className="md:hidden"
            />
          ) : null}

          <div className="hidden md:block">{authDesktop}</div>
        </div>
      </div>
    </header>
  )
}
