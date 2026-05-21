'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { updateProfilePhone } from '@/app/cuenta/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/auth-context'
import {
  profilePhoneSchema,
  type ProfilePhoneFormValues,
} from '@/lib/auth/schemas'
import { sanitizeUserMessage } from '@/lib/user-facing-error'
import { cn } from '@/lib/utils'

type ProfilePhoneFormProps = {
  initialPhone?: string | null
  onSaved?: () => void
  compact?: boolean
  submitLabel?: string
}

export function ProfilePhoneForm({
  initialPhone = '',
  onSaved,
  compact = false,
  submitLabel = 'Guardar número',
}: ProfilePhoneFormProps) {
  const { refreshProfile } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfilePhoneFormValues>({
    resolver: zodResolver(profilePhoneSchema),
    defaultValues: { phone: initialPhone?.trim() ?? '' },
  })

  const onSubmit = async (values: ProfilePhoneFormValues) => {
    setServerError(null)
    setSuccess(false)

    const result = await updateProfilePhone({ phone: values.phone.trim() })
    if (!result.ok) {
      setServerError(sanitizeUserMessage(result.message))
      return
    }

    await refreshProfile()
    setSuccess(true)
    onSaved?.()
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn('space-y-3', compact && 'space-y-2')}
    >
      {serverError ? (
        <p className="text-xs text-destructive" role="alert">
          {serverError}
        </p>
      ) : null}
      {success ? (
        <p className="text-xs text-emerald-400" role="status">
          Número guardado. Ya puedes confirmar tu pedido.
        </p>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="profile-phone" className={compact ? 'text-xs' : undefined}>
          WhatsApp / teléfono
        </Label>
        <Input
          id="profile-phone"
          type="tel"
          autoComplete="tel"
          placeholder="Ej. 098 765 4321"
          className={cn(errors.phone && 'border-destructive')}
          {...register('phone')}
        />
        {errors.phone ? (
          <p className="text-xs text-destructive">{errors.phone.message}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            CARSA usará este número para confirmar pedidos y disponibilidad.
          </p>
        )}
      </div>
      <Button
        type="submit"
        disabled={isSubmitting}
        size={compact ? 'sm' : 'default'}
        className={cn(
          compact ? 'w-full sm:w-auto' : 'w-full',
          'bg-carsa-primary text-white hover:bg-carsa-primary-hover'
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
            Guardando…
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  )
}
