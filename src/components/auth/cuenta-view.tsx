'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { ChevronRight, Loader2, LogOut, Package, Shield } from 'lucide-react'

import { AuthPageShell } from '@/components/auth/auth-page-shell'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/context/auth-context'
import { devError } from '@/lib/dev-log'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import type { Profile } from '@/types/auth'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/stores/cart-store'

const easeOut = [0.22, 1, 0.36, 1] as const

export function CuentaView({
  profile,
  email,
  adminAccessDenied = false,
  orderJustPlaced = false,
}: {
  profile: Profile
  email: string
  /** True si intentó entrar a /admin sin ser administrador. */
  adminAccessDenied?: boolean
  /** True si llegó tras confirmar un pedido desde el carrito. */
  orderJustPlaced?: boolean
}) {
  const router = useRouter()
  const { clearClientSession } = useAuth()
  const supabase = useMemo(() => createSupabaseBrowser(), [])
  const signOutOnceRef = useRef(false)

  const [signingOut, setSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState<string | null>(null)

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
      router.replace('/')
      router.refresh()
    } catch (error) {
      devError('[CARSA logout] unexpected error', error)
      setSignOutError(
        'Ocurrió un error al cerrar sesión. Se actualizará la página.'
      )
      clearClientSession()
      useCartStore.getState().clearCart()
      router.replace('/')
      router.refresh()
    } finally {
      setSigningOut(false)
      signOutOnceRef.current = false
    }
  }

  const isAdmin = profile.role === 'admin'

  return (
    <AuthPageShell className="max-w-lg">
      <div className="space-y-6">
        {orderJustPlaced ? (
          <div
            role="status"
            className="rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100"
          >
            Pedido enviado correctamente. CARSA se pondrá en contacto contigo para
            confirmar disponibilidad.
          </div>
        ) : null}
        {adminAccessDenied ? (
          <div
            role="alert"
            className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100"
          >
            No tienes permiso para acceder al panel de administración. Si necesitas
            ayuda, contacta a CARSA.
          </div>
        ) : null}
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            Mi cuenta
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Datos de tu perfil CARSA.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easeOut }}
        >
          <Card className="border-border/70 bg-muted/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Perfil</CardTitle>
              <CardDescription>Información de contacto y rol</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex flex-col gap-1 border-b border-border/50 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <span className="text-muted-foreground">Nombre</span>
                <span className="font-medium text-foreground sm:text-right">
                  {profile.full_name ?? '—'}
                </span>
              </div>
              <div className="flex justify-between gap-4 border-b border-border/50 py-2">
                <span className="text-muted-foreground">Teléfono</span>
                <span className="text-right font-medium text-foreground">
                  {profile.phone ?? '—'}
                </span>
              </div>
              <div className="flex justify-between gap-4 border-b border-border/50 py-2">
                <span className="text-muted-foreground">Correo</span>
                <span className="max-w-[60%] break-all text-right font-medium text-foreground">
                  {email}
                </span>
              </div>
              <div className="flex justify-between gap-4 py-2">
                <span className="text-muted-foreground">Rol</span>
                <span className="rounded-full bg-carsa-primary/15 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-carsa-primary">
                  {profile.role === 'admin' ? 'Administrador' : 'Cliente'}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {isAdmin ? (
          <Link
            href="/admin"
            className={cn(
              'flex items-center justify-between rounded-xl border border-carsa-primary/35 bg-carsa-primary/10 px-4 py-3',
              'text-sm font-medium text-foreground transition hover:bg-carsa-primary/15'
            )}
          >
            <span className="flex items-center gap-2">
              <Shield className="size-4 text-carsa-primary" aria-hidden />
              Panel administración
            </span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        ) : null}

        <div className="rounded-xl border border-dashed border-border/80 bg-muted/5 px-4 py-4">
          <div className="flex items-start gap-3">
            <Package className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">Mis pedidos</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Pronto podrás ver el historial y seguimiento de tus compras aquí.
              </p>
            </div>
          </div>
        </div>

        {signOutError ? (
          <div
            role="alert"
            className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {signOutError}
          </div>
        ) : null}

        <Button
          type="button"
          variant="outline"
          className="w-full border-destructive/40 text-destructive hover:bg-destructive/10"
          onClick={handleSignOut}
          disabled={signingOut}
        >
          {signingOut ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 size-4" />
          )}
          Cerrar sesión
        </Button>
      </div>
    </AuthPageShell>
  )
}
