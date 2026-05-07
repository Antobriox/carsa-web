'use server'

import { z } from 'zod'

import { getSessionWithProfile, hasRole } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'

const registerFromOrderSchema = z.object({
  order_id: z.string().uuid(),
  payment_method: z.enum(['cash', 'transfer', 'card', 'other']),
  notes: z.string().max(5000).optional().nullable(),
})

export type RegisterSaleFromOrderResult =
  | {
      ok: true
      /** Stock final por ítem tras la venta (para sincronizar catálogo en cliente). */
      inventory: { table: 'tires' | 'batteries'; id: string; stock: number }[]
    }
  | { ok: false; message: string }

function num(v: unknown): number {
  const n = typeof v === 'string' ? Number(v) : Number(v)
  return Number.isFinite(n) ? n : 0
}

type StockDeduction = { table: 'tires' | 'batteries'; id: string; qty: number }

async function reverseStockDeductions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  applied: StockDeduction[]
) {
  const now = new Date().toISOString()
  for (const a of [...applied].reverse()) {
    const { data: row } = await supabase
      .from(a.table)
      .select('stock')
      .eq('id', a.id)
      .maybeSingle()
    const cur = typeof row?.stock === 'number' ? row.stock : 0
    await supabase
      .from(a.table)
      .update({ stock: cur + a.qty, updated_at: now })
      .eq('id', a.id)
  }
}

/**
 * Registra venta solo desde un pedido en estado confirmado: sale + sale_items,
 * marca el pedido como completado y descuenta existencias solo en llantas y baterías.
 * Si algo falla tras crear la venta, revierte existencias aplicadas y elimina la venta.
 */
export async function registerSaleFromOrder(
  raw: z.infer<typeof registerFromOrderSchema>
): Promise<RegisterSaleFromOrderResult> {
  const parsed = registerFromOrderSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      ok: false,
      message:
        'No pudimos procesar los datos. Revisa el formulario e inténtalo de nuevo.',
    }
  }

  const session = await getSessionWithProfile()
  if (!session || !hasRole(session, 'admin')) {
    return {
      ok: false,
      message: 'No tienes permiso para registrar esta venta.',
    }
  }

  const supabase = await createClient()
  const { order_id, payment_method, notes } = parsed.data
  const notesTrimmed = notes?.trim() ? notes.trim().slice(0, 5000) : null

  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select(
      'id, customer_id, customer_name, customer_phone, customer_email, status, total'
    )
    .eq('id', order_id)
    .maybeSingle()

  if (orderErr || !order) {
    return {
      ok: false,
      message: 'No encontramos ese pedido. Actualiza la lista e inténtalo de nuevo.',
    }
  }

  const status = String(order.status ?? '').toLowerCase()
  if (status !== 'confirmed') {
    if (status === 'pending') {
      return {
        ok: false,
        message:
          'Este pedido sigue pendiente. Confírmalo primero con el cliente en Pedidos; después podrás registrarlo aquí como venta.',
      }
    }
    return {
      ok: false,
      message:
        'Este pedido ya no está disponible para registrar una venta.',
    }
  }

  const { data: orderItems, error: itemsErr } = await supabase
    .from('order_items')
    .select(
      'id, item_type, item_id, item_name, quantity, unit_price, subtotal'
    )
    .eq('order_id', order_id)
    .order('created_at', { ascending: true })

  if (itemsErr || !orderItems?.length) {
    return {
      ok: false,
      message:
        'Este pedido no tiene productos asociados. No se puede registrar la venta.',
    }
  }

  const lines = orderItems as {
    item_type: string
    item_id: string
    item_name: string
    quantity: number
    unit_price: unknown
    subtotal: unknown
  }[]

  for (const line of lines) {
    const t = String(line.item_type ?? '').toLowerCase()
    const qty = Math.floor(Number(line.quantity))
    if (!Number.isFinite(qty) || qty < 1) {
      return {
        ok: false,
        message:
          'Hay una cantidad no válida en el pedido. Revisa el pedido en administración.',
      }
    }

    if (t === 'tire') {
      const { data: tire, error } = await supabase
        .from('tires')
        .select('id, stock')
        .eq('id', line.item_id)
        .maybeSingle()
      if (error || !tire) {
        return {
          ok: false,
          message:
            'Una llanta del pedido ya no está en el catálogo. Actualiza el pedido antes de vender.',
        }
      }
      const stock = typeof tire.stock === 'number' ? tire.stock : 0
      if (stock < qty) {
        return { ok: false, message: 'No hay stock suficiente para completar esta venta.' }
      }
      continue
    }

    if (t === 'battery') {
      const { data: bat, error } = await supabase
        .from('batteries')
        .select('id, stock')
        .eq('id', line.item_id)
        .maybeSingle()
      if (error || !bat) {
        return {
          ok: false,
          message:
            'Una batería del pedido ya no está en el catálogo. Actualiza el pedido antes de vender.',
        }
      }
      const stock = typeof bat.stock === 'number' ? bat.stock : 0
      if (stock < qty) {
        return { ok: false, message: 'No hay stock suficiente para completar esta venta.' }
      }
    }
  }

  const total = num(order.total)
  const customerName = String(order.customer_name ?? '').trim() || 'Cliente'
  const customerPhone = String(order.customer_phone ?? '').trim()
  if (!customerPhone) {
    return {
      ok: false,
      message: 'Este pedido no tiene teléfono de contacto. Complétalo en pedidos antes de vender.',
    }
  }

  const now = new Date().toISOString()

  const { data: saleRow, error: saleErr } = await supabase
    .from('sales')
    .insert({
      order_id,
      customer_id: order.customer_id ?? null,
      customer_name: customerName,
      customer_phone: customerPhone,
      payment_method,
      total,
      notes: notesTrimmed,
      updated_at: now,
    })
    .select('id')
    .single()

  if (saleErr || !saleRow?.id) {
    return {
      ok: false,
      message: 'No se pudo registrar la venta. Inténtalo nuevamente.',
    }
  }

  const saleId = saleRow.id as string

  const saleItemRows = lines.map((line) => ({
    sale_id: saleId,
    item_type: line.item_type,
    item_id: line.item_id,
    item_name: line.item_name,
    quantity: Math.floor(Number(line.quantity)),
    unit_price: num(line.unit_price),
    subtotal: num(line.subtotal),
  }))

  const { error: saleItemsErr } = await supabase.from('sale_items').insert(saleItemRows)

  if (saleItemsErr) {
    await supabase.from('sales').delete().eq('id', saleId)
    return {
      ok: false,
      message:
        'No se pudieron guardar los productos de la venta. No se registró nada. Inténtalo de nuevo.',
    }
  }

  const applied: StockDeduction[] = []
  const inventory: { table: 'tires' | 'batteries'; id: string; stock: number }[] = []

  try {
    for (const line of lines) {
      const t = String(line.item_type ?? '').toLowerCase()
      if (t !== 'tire' && t !== 'battery') continue

      const qty = Math.floor(Number(line.quantity))
      const table = t === 'tire' ? 'tires' : 'batteries'

      const { data: row, error: readErr } = await supabase
        .from(table)
        .select('stock')
        .eq('id', line.item_id)
        .maybeSingle()

      if (readErr || row == null) {
        throw new Error('stock_read')
      }

      const cur = typeof row.stock === 'number' ? row.stock : 0
      if (cur < qty) {
        throw new Error('stock_insufficient')
      }

      const nextStock = cur - qty
      const { error: updErr } = await supabase
        .from(table)
        .update({ stock: nextStock, updated_at: now })
        .eq('id', line.item_id)

      if (updErr) {
        throw new Error('stock_update')
      }

      applied.push({ table, id: line.item_id, qty })
      inventory.push({ table, id: line.item_id, stock: nextStock })
    }
  } catch {
    await reverseStockDeductions(supabase, applied)
    await supabase.from('sales').delete().eq('id', saleId)
    return {
      ok: false,
      message: 'No hay stock suficiente para completar esta venta.',
    }
  }

  const { error: orderUpdErr } = await supabase
    .from('orders')
    .update({ status: 'completed', updated_at: now })
    .eq('id', order_id)

  if (orderUpdErr) {
    await reverseStockDeductions(supabase, applied)
    await supabase.from('sales').delete().eq('id', saleId)
    return {
      ok: false,
      message:
        'No se pudo cerrar el pedido. La venta no se guardó. Inténtalo nuevamente.',
    }
  }

  return { ok: true, inventory }
}
