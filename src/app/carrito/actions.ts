'use server'

import { z } from 'zod'

import { getSessionWithProfile, hasRole } from '@/lib/auth/session'
import { formatBatteryDisplayTitle } from '@/lib/catalog-battery-display'
import {
  formatTireDisplayTitle,
  tireToDisplayInput,
} from '@/lib/catalog-tire-display'
import { sendNewOrderPush } from '@/lib/push/send-new-order'
import { createClient } from '@/lib/supabase/server'

const cartLineSchema = z.object({
  item_type: z.enum(['tire', 'battery']),
  item_id: z.string().uuid(),
  quantity: z.number().int().min(1).max(500),
})

const submitSchema = z.object({
  lines: z.array(cartLineSchema).min(1).max(80),
})

export type SubmitCartOrderResult =
  | { ok: true }
  | { ok: false; message: string }

function num(v: unknown): number {
  const n = typeof v === 'string' ? Number(v) : Number(v)
  return Number.isFinite(n) ? n : 0
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

/**
 * Crea cliente (o reutiliza por teléfono), pedido en estado pendiente e ítems.
 * Precios y existencias se validan contra el catálogo en el momento del envío.
 */
export async function submitCartOrder(
  raw: z.infer<typeof submitSchema>
): Promise<SubmitCartOrderResult> {
  const parsed = submitSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      ok: false,
      message:
        'No pudimos validar tu pedido. Vuelve a intentarlo o recarga la página.',
    }
  }

  const session = await getSessionWithProfile()
  if (!session) {
    return { ok: false, message: 'Inicia sesión para enviar tu pedido.' }
  }

  if (hasRole(session, 'admin')) {
    return {
      ok: false,
      message:
        'El carrito en línea es solo para clientes. Gestiona pedidos desde el área de administración.',
    }
  }

  if (session.profile.role !== 'customer') {
    return { ok: false, message: 'Tu cuenta no puede enviar pedidos desde aquí.' }
  }

  const phone = session.profile.phone?.trim()
  if (!phone) {
    return {
      ok: false,
      message:
        'Necesitamos tu número de WhatsApp para confirmar el pedido.',
    }
  }

  const supabase = await createClient()
  const customerName =
    session.profile.full_name?.trim() ||
    session.email.split('@')[0] ||
    'Cliente'
  const customerEmail = session.email

  type ResolvedLine = {
    item_type: 'tire' | 'battery'
    item_id: string
    item_name: string
    quantity: number
    unit_price: number
    subtotal: number
  }

  const resolved: ResolvedLine[] = []

  for (const line of parsed.data.lines) {
    if (line.item_type === 'tire') {
      const { data, error } = await supabase
        .from('tires')
        .select(
          `
          id,
          name,
          price,
          stock,
          is_active,
          size,
          rim,
          model,
          tire_brands ( name )
        `
        )
        .eq('id', line.item_id)
        .maybeSingle()

      if (error || !data || !data.is_active) {
        return {
          ok: false,
          message:
            'Una de las llantas ya no está disponible en el catálogo. Actualiza el carrito e inténtalo de nuevo.',
        }
      }

      const stock = typeof data.stock === 'number' ? data.stock : 0
      if (stock < line.quantity) {
        return {
          ok: false,
          message:
            'La cantidad solicitada supera las existencias de una llanta. Ajusta cantidades en el carrito.',
        }
      }

      const unit = round2(num(data.price))
      const name =
        typeof data.name === 'string' && data.size
          ? formatTireDisplayTitle(
              tireToDisplayInput({
                name: data.name,
                size: String(data.size),
                rim: data.rim ?? 0,
                model:
                  typeof data.model === 'string' ? data.model : null,
                tire_brands: data.tire_brands,
              })
            )
          : typeof data.name === 'string'
            ? data.name
            : 'Llanta'
      resolved.push({
        item_type: 'tire',
        item_id: data.id as string,
        item_name: name,
        quantity: line.quantity,
        unit_price: unit,
        subtotal: round2(unit * line.quantity),
      })
      continue
    }

    const { data, error } = await supabase
      .from('batteries')
      .select('id, name, model, amperage, price, stock, is_active')
      .eq('id', line.item_id)
      .maybeSingle()

    if (error || !data || !data.is_active) {
      return {
        ok: false,
        message:
          'Una de las baterías ya no está disponible en el catálogo. Actualiza el carrito e inténtalo de nuevo.',
      }
    }

    const stock = typeof data.stock === 'number' ? data.stock : 0
    if (stock < line.quantity) {
      return {
        ok: false,
        message:
          'La cantidad solicitada supera las existencias de una batería. Ajusta cantidades en el carrito.',
      }
    }

    const unit = round2(num(data.price))
    const name =
      typeof data.name === 'string'
        ? formatBatteryDisplayTitle({
            name: data.name,
            amperage:
              typeof data.amperage === 'string' ? data.amperage : null,
            model: typeof data.model === 'string' ? data.model : null,
          })
        : 'Batería'
    resolved.push({
      item_type: 'battery',
      item_id: data.id as string,
      item_name: name,
      quantity: line.quantity,
      unit_price: unit,
      subtotal: round2(unit * line.quantity),
    })
  }

  const total = round2(resolved.reduce((a, r) => a + r.subtotal, 0))

  const { data: existingCustomer, error: findErr } = await supabase
    .from('customers')
    .select('id')
    .eq('phone', phone)
    .maybeSingle()

  if (findErr) {
    return {
      ok: false,
      message:
        'No pudimos registrar tu pedido en este momento. Inténtalo de nuevo en unos minutos.',
    }
  }

  let customerId: string

  if (existingCustomer?.id) {
    customerId = existingCustomer.id as string
  } else {
    const { data: inserted, error: insErr } = await supabase
      .from('customers')
      .insert({
        full_name: customerName,
        phone,
        email: customerEmail,
      })
      .select('id')
      .single()

    if (insErr || !inserted?.id) {
      return {
        ok: false,
        message:
          'No pudimos guardar tus datos de contacto. Revisa tu información en Mi cuenta e inténtalo de nuevo.',
      }
    }
    customerId = inserted.id as string
  }

  const { data: orderRow, error: orderErr } = await supabase
    .from('orders')
    .insert({
      customer_id: customerId,
      customer_name: customerName,
      customer_phone: phone,
      customer_email: customerEmail,
      status: 'pending',
      total,
      notes: null,
    })
    .select('id')
    .single()

  if (orderErr || !orderRow?.id) {
    return {
      ok: false,
      message:
        'No pudimos crear tu pedido. Si el problema continúa, escríbenos por WhatsApp.',
    }
  }

  const orderId = orderRow.id as string

  const itemRows = resolved.map((r) => ({
    order_id: orderId,
    item_type: r.item_type,
    item_id: r.item_id,
    item_name: r.item_name,
    quantity: r.quantity,
    unit_price: r.unit_price,
    subtotal: r.subtotal,
  }))

  const { error: itemsErr } = await supabase.from('order_items').insert(itemRows)

  if (itemsErr) {
    return {
      ok: false,
      message:
        'Tu pedido quedó incompleto. Escríbenos por WhatsApp y lo revisamos de inmediato.',
    }
  }

  try {
    await sendNewOrderPush({
      order_id: orderId,
      customer_name: customerName,
      customer_phone: phone,
      total,
    })
  } catch {
    /* el pedido ya se creó */
  }

  return { ok: true }
}
