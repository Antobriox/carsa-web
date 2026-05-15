/**
 * Iniciales para avatar: primeras letras del nombre y apellido,
 * o las dos primeras del nombre si solo hay una palabra.
 */
export function getUserInitials(
  fullName: string | null | undefined,
  email?: string | null
): string {
  const name = fullName?.trim()
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      const first = parts[0]?.[0] ?? ''
      const last = parts[parts.length - 1]?.[0] ?? ''
      return `${first}${last}`.toUpperCase()
    }
    if (parts.length === 1 && parts[0]) {
      return parts[0].slice(0, 2).toUpperCase()
    }
  }

  const mail = email?.trim()
  if (mail) {
    const local = mail.split('@')[0] ?? mail
    return local.slice(0, 2).toUpperCase()
  }

  return '?'
}
