import webpush from 'web-push'

import { formatMxn } from '@/lib/format'
import { getVapidServerConfig } from '@/lib/push/vapid'
import {
  createServiceSupabase,
  hasServiceRoleKey,
} from '@/lib/supabase/service'

export type SendNewOrderPushInput = {
  order_id: string
  customer_name: string
  total: number
}

export type SendNewOrderPushResult = {
  ok: boolean
  sent: number
  failed: number
  message?: string
}

function buildPushPayload(customerName: string, total: number) {
  const title = 'Nuevo pedido recibido'
  const body = `Cliente: ${customerName.trim() || 'Cliente'} · Total: ${formatMxn(total)}`
  return {
    title,
    body,
    url: '/admin/pedidos',
    payload: JSON.stringify({ title, body, url: '/admin/pedidos' }),
  }
}

export async function sendNewOrderPush(
  input: SendNewOrderPushInput
): Promise<SendNewOrderPushResult> {
  const vapid = getVapidServerConfig()
  if (!vapid) {
    return { ok: false, sent: 0, failed: 0, message: 'VAPID no configurado' }
  }

  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey)

  const supabase = createServiceSupabase()
  const { title, body, payload } = buildPushPayload(
    input.customer_name,
    input.total
  )

  const { data: notificationRow } = await supabase
    .from('admin_notifications')
    .select('id')
    .eq('order_id', input.order_id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const notificationId = notificationRow?.id as string | undefined

  const { data: subscriptions, error: subsErr } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('is_active', true)

  if (subsErr) {
    return { ok: false, sent: 0, failed: 0, message: subsErr.message }
  }

  if (!subscriptions?.length) {
    if (!hasServiceRoleKey() && !subsErr) {
      return {
        ok: false,
        sent: 0,
        failed: 0,
        message:
          'Las notificaciones push no están disponibles en este entorno.',
      }
    }
    return { ok: true, sent: 0, failed: 0 }
  }

  let sent = 0
  let failed = 0

  for (const sub of subscriptions) {
    const endpoint = sub.endpoint as string
    const p256dh = sub.p256dh as string
    const auth = sub.auth as string

    let status: 'sent' | 'failed' = 'sent'
    let errorMessage: string | null = null

    try {
      await webpush.sendNotification(
        { endpoint, keys: { p256dh, auth } },
        payload
      )
      sent += 1
    } catch (err) {
      failed += 1
      status = 'failed'
      errorMessage =
        err instanceof Error ? err.message : 'No se pudo enviar la notificación'

      const statusCode =
        err && typeof err === 'object' && 'statusCode' in err
          ? Number((err as { statusCode: number }).statusCode)
          : 0

      if (statusCode === 404 || statusCode === 410) {
        await supabase
          .from('push_subscriptions')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('id', sub.id)
      }
    }

    await supabase.from('push_notification_logs').insert({
      notification_id: notificationId ?? null,
      order_id: input.order_id,
      title,
      body,
      status,
      error_message: errorMessage,
      sent_at: status === 'sent' ? new Date().toISOString() : null,
    })
  }

  return { ok: true, sent, failed }
}
