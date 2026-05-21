import { NextResponse } from 'next/server'
import { z } from 'zod'

import { sendNewOrderPush } from '@/lib/push/send-new-order'

const bodySchema = z.object({
  order_id: z.string().uuid(),
  customer_name: z.string().min(1).max(200),
  customer_phone: z.string().max(20).optional().nullable(),
  total: z.number().finite().nonnegative(),
})

function isAuthorized(request: Request): boolean {
  const secret = process.env.PUSH_INTERNAL_SECRET?.trim()
  if (!secret) return true
  return request.headers.get('x-push-secret') === secret
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
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

  try {
    const result = await sendNewOrderPush(parsed.data)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { ok: false, message: 'No se pudieron enviar las notificaciones' },
      { status: 500 }
    )
  }
}
