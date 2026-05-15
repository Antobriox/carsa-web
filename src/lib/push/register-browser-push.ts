import {
  isValidVapidPublicKey,
  urlBase64ToUint8Array,
} from '@/lib/push/url-base64'

export type RegisterBrowserPushResult =
  | { ok: true }
  | { ok: false; reason: 'unsupported' | 'denied' | 'config' | 'register' }

function getPublicVapidKey(): string | null {
  const raw = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim()
  if (!raw) return null
  return raw.replace(/^["']|["']$/g, '')
}

/** Registra SW, suscripción push y la guarda en el servidor (admin). */
export async function registerBrowserPush(): Promise<RegisterBrowserPushResult> {
  const vapidKey = getPublicVapidKey()
  if (!vapidKey) return { ok: false, reason: 'config' }
  if (!isValidVapidPublicKey(vapidKey)) return { ok: false, reason: 'config' }

  if (
    typeof window === 'undefined' ||
    !('Notification' in window) ||
    !('serviceWorker' in navigator)
  ) {
    return { ok: false, reason: 'unsupported' }
  }

  let permission = Notification.permission
  if (permission === 'default') {
    permission = await Notification.requestPermission()
  }
  if (permission === 'denied') return { ok: false, reason: 'denied' }
  if (permission !== 'granted') return { ok: false, reason: 'denied' }

  const registration = await navigator.serviceWorker.register('/sw.js', {
    scope: '/',
  })
  await navigator.serviceWorker.ready

  let subscription = await registration.pushManager.getSubscription()
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
    })
  }

  const json = subscription.toJSON()
  const endpoint = json.endpoint
  const p256dh = json.keys?.p256dh
  const auth = json.keys?.auth

  if (!endpoint || !p256dh || !auth) {
    return { ok: false, reason: 'register' }
  }

  const res = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint, p256dh, auth }),
  })

  if (!res.ok) return { ok: false, reason: 'register' }
  return { ok: true }
}
