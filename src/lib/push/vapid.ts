export function getVapidPublicKey(): string | null {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() || null
}

export function getVapidServerConfig(): {
  publicKey: string
  privateKey: string
  subject: string
} | null {
  const publicKey = getVapidPublicKey()
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim()
  const subject = process.env.VAPID_SUBJECT?.trim()

  if (!publicKey || !privateKey || !subject) return null
  return { publicKey, privateKey, subject }
}
