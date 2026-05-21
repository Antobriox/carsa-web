import type { AdminNotification } from '@/types/admin-notifications'

export function formatAdminNotificationMessage(
  notification: AdminNotification,
  orderPhoneById?: Map<string, string>
): string {
  const base = notification.message?.trim() || ''
  const orderId = notification.order_id
  if (!orderId) return base

  const fromPayload =
    typeof notification.payload?.customer_phone === 'string'
      ? notification.payload.customer_phone.trim()
      : ''

  const phone =
    fromPayload || orderPhoneById?.get(orderId)?.trim() || ''

  if (!phone) return base
  if (base.toLowerCase().includes(phone.toLowerCase())) return base
  return base ? `${base} · WhatsApp: ${phone}` : `WhatsApp: ${phone}`
}
