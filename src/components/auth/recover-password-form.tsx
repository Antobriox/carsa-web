'use client'

import Link from 'next/link'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { AuthPageShell } from '@/components/auth/auth-page-shell'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { mapAuthError } from '@/lib/auth/map-auth-error'
import { recoverSchema, type RecoverFormValues } from '@/lib/auth/schemas'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export function RecoverPasswordForm() {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecoverFormValues>({
    resolver: zodResolver(recoverSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (values: RecoverFormValues) => {
    setSubmitError(null)
    const supabase = createSupabaseBrowser()
    const origin =
      typeof window !== 'undefined' ? window.location.origin : ''

    const { error } = await supabase.auth.resetPasswordForEmail(
      values.email.trim().toLowerCase(),
      {
        redirectTo: `${origin}/auth/callback?next=/cuenta`,
      }
    )

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
            Si el correo está registrado, recibirás un enlace para restablecer tu
            contraseña. El enlace caduca pasado un tiempo por seguridad.
          </p>
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'lg' }),
              'inline-flex w-full justify-center'
            )}
          >
            Volver al inicio de sesión
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
            Recuperar contraseña
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Te enviaremos un enlace para crear una contraseña nueva.
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
            <Label htmlFor="recover-email">Correo electrónico</Label>
            <Input
              id="recover-email"
              type="email"
              autoComplete="email"
              className={cn(errors.email && 'border-destructive')}
              {...register('email')}
            />
            {errors.email ? (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            ) : null}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full bg-carsa-primary text-white hover:bg-carsa-primary-hover"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Enviando…
              </>
            ) : (
              'Enviar enlace'
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-carsa-primary hover:underline">
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </AuthPageShell>
  )
}
