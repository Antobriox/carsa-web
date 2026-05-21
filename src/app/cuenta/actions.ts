'use server'

import { getSessionWithProfile, hasRole } from '@/lib/auth/session'
import { profilePhoneSchema } from '@/lib/auth/schemas'
import { createClient } from '@/lib/supabase/server'

export type UpdateProfilePhoneResult =
  | { ok: true }
  | { ok: false; message: string }

export async function updateProfilePhone(raw: {
  phone: string
}): Promise<UpdateProfilePhoneResult> {
  const parsed = profilePhoneSchema.safeParse(raw)
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors.phone?.[0]
    return {
      ok: false,
      message: first ?? 'Revisa el número de WhatsApp e inténtalo de nuevo.',
    }
  }

  const session = await getSessionWithProfile()
  if (!session) {
    return { ok: false, message: 'Inicia sesión para actualizar tu cuenta.' }
  }

  if (hasRole(session, 'admin')) {
    return {
      ok: false,
      message: 'Los administradores gestionan su contacto desde el equipo CARSA.',
    }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ phone: parsed.data.phone })
    .eq('id', session.userId)

  if (error) {
    return {
      ok: false,
      message:
        'No pudimos guardar tu número. Inténtalo de nuevo en unos minutos.',
    }
  }

  return { ok: true }
}
