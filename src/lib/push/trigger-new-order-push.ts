import type { SendNewOrderPushInput } from '@/lib/push/send-new-order'

function getSiteOrigin(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL?.trim()) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  }
  if (process.env.VERCEL_URL?.trim()) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`
  }
  return 'http://127.0.0.1:3000'
}

/** Dispara el envío push vía API (solo servidor). No lanza si falla. */
export async function triggerNewOrderPushApi(
  input: SendNewOrderPushInput
): Promise<void> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  const secret = process.env.PUSH_INTERNAL_SECRET?.trim()
  if (secret) headers['x-push-secret'] = secret

  try {
    await fetch(`${getSiteOrigin()}/api/push/send-new-order`, {
      method: 'POST',
      headers,
      body: JSON.stringify(input),
      cache: 'no-store',
    })
  } catch {
    /* el pedido ya se creó; no bloquear al cliente */
  }
}
