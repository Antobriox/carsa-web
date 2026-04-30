/** Solo dígitos, con código de país (ej. 593980822825, 5215512345678). Define `NEXT_PUBLIC_WHATSAPP_PHONE` en `.env.local`. */
export function getWhatsAppDigits(): string {
  return (process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? '').replace(/\D/g, '')
}

/** Formato legible para mostrar en UI (Ecuador +593 9XX XXX XXX). */
export function formatWhatsAppForDisplay(digits: string): string {
  const d = digits.replace(/\D/g, '')
  if (d.startsWith('593') && d.length === 12) {
    return `+593 ${d.slice(3, 6)} ${d.slice(6, 9)} ${d.slice(9)}`
  }
  if (d.length >= 10) return `+${d}`
  return d || ''
}

export function buildWhatsAppUrl(message: string): string | null {
  const digits = getWhatsAppDigits()
  if (!digits) return null
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
