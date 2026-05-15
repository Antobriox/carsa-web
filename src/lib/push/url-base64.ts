/** Convierte clave VAPID pública (base64url) a Uint8Array para PushManager. */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const output = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i += 1) {
    output[i] = rawData.charCodeAt(i)
  }
  return output
}

/**
 * Clave de aplicación VAPID válida: 65 bytes, primer byte 0x04 (curva P-256 sin comprimir).
 * Si falla, suele ser una clave truncada al copiar o un par público/privado que no coincide.
 */
export function isValidVapidPublicKey(base64String: string): boolean {
  const trimmed = base64String.trim().replace(/^["']|["']$/g, '')
  if (!trimmed || !/^[A-Za-z0-9_-]+$/.test(trimmed)) return false
  try {
    const bytes = urlBase64ToUint8Array(trimmed)
    return bytes.length === 65 && bytes[0] === 0x04
  } catch {
    return false
  }
}
