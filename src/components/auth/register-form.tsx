'use client'

import Link from 'next/link'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'

import { AuthPageShell } from '@/components/auth/auth-page-shell'
import { Button, buttonVariants } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { mapAuthError } from '@/lib/auth/map-auth-error'
import { registerSchema, type RegisterFormValues } from '@/lib/auth/schemas'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export function RegisterForm() {
  const [showPw, setShowPw] = useState(false)
  const [showPw2, setShowPw2] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setSubmitError(null)
    setSuccess(false)

    const supabase = createSupabaseBrowser()
    const origin =
      typeof window !== 'undefined' ? window.location.origin : ''

    const { error } = await supabase.auth.signUp({
      email: values.email.trim().toLowerCase(),
      password: values.password,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=/cuenta`,
        data: {
          full_name: values.full_name.trim(),
          phone: values.phone.trim(),
        },
      },
    })

    if (error) {
      setSubmitError(mapAuthError(error.message))
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <AuthPageShell>
        <div className="space-y-4 text-center">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            Revisa tu correo
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Te enviamos un enlace para confirmar tu cuenta. Si no ves el mensaje,
            revisa spam o promociones.
          </p>
          <Link
            href="/login"
            className={cn(
              buttonVariants({ size: 'lg' }),
              'inline-flex w-full justify-center bg-carsa-primary text-white hover:bg-carsa-primary-hover'
            )}
          >
            Ir a iniciar sesión
          </Link>
        </div>
      </AuthPageShell>
    )
  }

  return (
    <AuthPageShell>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            Crear cuenta
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Regístrate como cliente. El acceso administrador solo se asigna desde
            el equipo CARSA.
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
            <Label htmlFor="full_name">Nombre completo</Label>
            <Input
              id="full_name"
              autoComplete="name"
              className={cn(errors.full_name && 'border-destructive')}
              {...register('full_name')}
            />
            {errors.full_name ? (
              <p className="text-xs text-destructive">
                {errors.full_name.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              className={cn(errors.phone && 'border-destructive')}
              {...register('phone')}
            />
            {errors.phone ? (
              <p className="text-xs text-destructive">{errors.phone.message}</p>
            ) : null}
          </div>

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
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPw ? 'text' : 'password'}
                autoComplete="new-password"
                className={cn('pr-10', errors.password && 'border-destructive')}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                aria-label={showPw ? 'Ocultar' : 'Mostrar'}
              >
                {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <p className="text-[0.7rem] text-muted-foreground">
              Mín. 8 caracteres: mayúscula, minúscula, número y símbolo.
            </p>
            {errors.password ? (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPw2 ? 'text' : 'password'}
                autoComplete="new-password"
                className={cn(
                  'pr-10',
                  errors.confirmPassword && 'border-destructive'
                )}
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowPw2((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                aria-label={showPw2 ? 'Ocultar' : 'Mostrar'}
              >
                {showPw2 ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.confirmPassword ? (
              <p className="text-xs text-destructive">
                {errors.confirmPassword.message}
              </p>
            ) : null}
          </div>

          <div className="flex items-start gap-3">
            <Controller
              name="acceptTerms"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="acceptTerms"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  className="mt-0.5"
                />
              )}
            />
            <Label htmlFor="acceptTerms" className="text-sm font-normal leading-snug">
              Acepto los términos y condiciones y el tratamiento de mis datos
              para gestionar mi cuenta.
            </Label>
          </div>
          {errors.acceptTerms ? (
            <p className="text-xs text-destructive">{errors.acceptTerms.message}</p>
          ) : null}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full bg-carsa-primary text-white hover:bg-carsa-primary-hover"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Creando cuenta…
              </>
            ) : (
              'Registrarse'
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{' '}
          <Link
            href="/login"
            className="font-medium text-carsa-primary hover:underline"
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </AuthPageShell>
  )
}
