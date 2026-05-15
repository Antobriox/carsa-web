import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getSessionWithProfile, hasRole } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'

const bodySchema = z.object({
  endpoint: z.string().url().max(2048),
  p256dh: z.string().min(1).max(512),
  auth: z.string().min(1).max(512),
})

export async function POST(request: Request) {
  const session = await getSessionWithProfile()
  if (!session || !hasRole(session, 'admin')) {
    return NextResponse.json({ ok: false, message: 'No autorizado' }, { status: 401 })
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Cuerpo inválido' },
      { status: 400 }
    )
  }

  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: 'Datos incompletos' },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  const now = new Date().toISOString()

  const { data: existing } = await supabase
    .from('push_subscriptions')
    .select('id')
    .eq('user_id', session.userId)
    .eq('endpoint', parsed.data.endpoint)
    .maybeSingle()

  if (existing?.id) {
    const { error } = await supabase
      .from('push_subscriptions')
      .update({
        p256dh: parsed.data.p256dh,
        auth: parsed.data.auth,
        is_active: true,
        updated_at: now,
      })
      .eq('id', existing.id)

    if (error) {
      return NextResponse.json(
        { ok: false, message: 'No se pudo actualizar la suscripción' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  }

  const { error } = await supabase.from('push_subscriptions').insert({
    user_id: session.userId,
    endpoint: parsed.data.endpoint,
    p256dh: parsed.data.p256dh,
    auth: parsed.data.auth,
    is_active: true,
    created_at: now,
    updated_at: now,
  })

  if (error) {
    return NextResponse.json(
      { ok: false, message: 'No se pudo guardar la suscripción' },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true })
}
