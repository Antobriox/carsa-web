/** Solo dígitos, con código de país (ej. 593980822825, 5215512345678). Define `NEXT_PUBLIC_WHATSAPP_PHONE` en `.env.local`. */
export function getWhatsAppDigits(): string {
  return (process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? '').replace(/\D/g, '')
}

/** Formato legible para mostrar en UI (Ecuador: +593 98 082 2825). */
export function formatWhatsAppForDisplay(digits: string): string {
  const d = digits.replace(/\D/g, '')
  if (d.startsWith('593') && d.length === 12) {
    return `+593 ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8)}`
  }
  if (d.length === 10 && d.startsWith('0')) {
    const mobile = d.slice(1)
    return `+593 ${mobile.slice(0, 2)} ${mobile.slice(2, 5)} ${mobile.slice(5)}`
  }
  if (d.length === 9 && d.startsWith('9')) {
    return `+593 ${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5)}`
  }
  if (d.length >= 10) return `+${d}`
  return d || ''
}

export function buildWhatsAppUrl(message: string): string | null {
  const digits = getWhatsAppDigits()
  if (!digits) return null
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

/** Dígitos para wa.me a partir del teléfono del cliente (pedidos / perfil). */
export function normalizePhoneToWhatsAppDigits(phone: string): string | null {
  const d = phone.replace(/\D/g, '')
  if (d.length < 8) return null
  if (d.length === 9 && d.startsWith('9')) return `593${d}`
  if (d.length === 10 && d.startsWith('0')) return `593${d.slice(1)}`
  if (d.startsWith('593') && d.length >= 11) return d
  return d
}

export function buildWhatsAppUrlForCustomerPhone(
  phone: string,
  message?: string
): string | null {
  const digits = normalizePhoneToWhatsAppDigits(phone)
  if (!digits) return null
  const base = `https://wa.me/${digits}`
  if (!message?.trim()) return base
  return `${base}?text=${encodeURIComponent(message.trim())}`
}
