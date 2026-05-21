'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { AuthPageShell } from '@/components/auth/auth-page-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { mapAuthError } from '@/lib/auth/map-auth-error'
import { safeCustomerPostLoginPath } from '@/lib/auth/safe-redirect'
import { loginSchema, type LoginFormValues } from '@/lib/auth/schemas'
import { devError } from '@/lib/dev-log'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import type { Profile } from '@/types/auth'
import { cn } from '@/lib/utils'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const errParam = searchParams.get('error')
  const nextParam = searchParams.get('next')

  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(
    errParam === 'auth'
      ? 'No se pudo completar el inicio de sesión. Inténtalo de nuevo.'
      : null
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitError(null)
    setLoading(true)

    try {
      const supabase = createSupabaseBrowser()

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      })

      if (signInError) {
        devError('[CARSA login] signInWithPassword', signInError)
        setSubmitError(mapAuthError(signInError.message))
        return
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        devError('[CARSA login] getUser', userError)
        setSubmitError(
          'No se pudo obtener tu sesión. Cierra sesión en otro dispositivo e inténtalo de nuevo.'
        )
        return
      }

      if (!user) {
        setSubmitError(
          'No se pudo obtener tu sesión. Vuelve a intentar o revisa tu conexión.'
        )
        return
      }

      // Siempre por id de auth.users (profiles no tiene email).
      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from('profiles')
        .select('id, full_name, phone, role')
        .eq('id', user.id)
        .single()

      if (profileError) {
        devError('[CARSA login] profile', profileError)
        setSubmitError(
          'No pudimos cargar tu perfil. Inténtalo de nuevo o contacta a CARSA si el problema continúa.'
        )
        return
      }

      const typed = profile as Pick<
        Profile,
        'id' | 'full_name' | 'phone' | 'role'
      >

      const role = typed.role

      if (role !== 'admin' && role !== 'customer') {
        setSubmitError(
          'Tu cuenta tiene un rol no reconocido. Contacta a CARSA para asistencia.'
        )
        return
      }

      if (role === 'admin') {
        router.replace('/admin')
      } else {
        router.replace(safeCustomerPostLoginPath(nextParam))
      }

      queueMicrotask(() => {
        router.refresh()
      })
    } catch (err) {
      devError('[CARSA login] error inesperado', err)
      setSubmitError(
        'Ocurrió un error inesperado. Inténtalo de nuevo en unos segundos.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthPageShell>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            Iniciar sesión
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Accede a tu cuenta CARSA para ver tu perfil y futuros pedidos.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {submitError ? (
            <div
              role="alert"
              className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {submitError}
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              className={cn(errors.email && 'border-destructive')}
              {...register('email')}
            />
            {errors.email ? (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Link
                href="/recuperar-password"
                className="text-xs font-medium text-carsa-primary hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                className={cn('pr-10', errors.password && 'border-destructive')}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={showPw ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPw ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {errors.password ? (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full bg-carsa-primary text-white hover:bg-carsa-primary-hover"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Entrando…
              </>
            ) : (
              'Entrar'
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          ¿No tienes cuenta?{' '}
          <Link
            href="/registro"
            className="font-medium text-carsa-primary hover:underline"
          >
            Crear cuenta
          </Link>
        </p>
      </div>
    </AuthPageShell>
  )
}
