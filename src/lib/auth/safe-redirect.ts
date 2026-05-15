/**
 * Evita redirecciones abiertas: solo rutas relativas internas.
 */
export function safeInternalPath(next: string | null | undefined): string {
  if (!next || typeof next !== 'string') return '/'
  const t = next.trim()
  if (!t.startsWith('/') || t.startsWith('//')) return '/'
  return t
}

/** Tras login como cliente: nunca enviar a rutas de admin. */
export function safeCustomerPostLoginPath(next: string | null | undefined): string {
  const p = safeInternalPath(next)
  if (p === '/admin' || p.startsWith('/admin/')) return '/'
  return p
}
