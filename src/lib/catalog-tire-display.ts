/** Campos mínimos para mostrar una llanta con medida y modelo sin repetirlos en el nombre. */
export type TireDisplayInput = {
  name: string
  size: string
  rim: number | string
  model?: string | null
  brandName?: string | null
}

function norm(s: string): string {
  return s.trim().toLowerCase()
}

function containsToken(haystack: string, token: string): boolean {
  if (!token) return true
  const h = norm(haystack).replace(/\s+/g, '')
  const t = norm(token).replace(/\s+/g, '')
  return h.includes(t)
}

/** Medida legible: ancho/alto + rin si no viene en la medida. */
export function formatTireMeasure(size: string, rim: number | string): string {
  const s = size.trim()
  const r = typeof rim === 'number' ? rim : Number(rim)
  if (!s && Number.isFinite(r) && r > 0) return `R${r}"`
  if (!s) return ''

  const hasRinInSize = /\br\s*\d{1,2}\b/i.test(s) || /r\d{2}/i.test(s.replace(/\s/g, ''))
  if (hasRinInSize) return s
  if (Number.isFinite(r) && r > 0) return `${s} · R${r}"`
  return s
}

/**
 * Título para catálogo, admin, pedidos y carrito.
 * Solo nombre + medida + modelo (sin marca). Ej.: "Kaytoon · 185/60r14 · Labrado"
 */
export function formatTireDisplayTitle(tire: TireDisplayInput): string {
  const name = tire.name?.trim() ?? ''
  const model = tire.model?.trim() ?? ''
  const measure = formatTireMeasure(tire.size, tire.rim)

  const parts: string[] = []

  if (name) parts.push(name)

  const joined = parts.join(' ')

  if (measure && !containsToken(joined, measure)) {
    parts.push(measure)
  }

  if (model && !containsToken(parts.join(' '), model)) {
    parts.push(model)
  }

  return parts.filter(Boolean).join(' · ') || 'Llanta'
}

export function tireBrandFromJoin(
  brand:
    | { name: string }
    | { name: string }[]
    | null
    | undefined
): string | undefined {
  if (!brand) return undefined
  if (Array.isArray(brand)) return brand[0]?.name?.trim() || undefined
  return brand.name?.trim() || undefined
}

type TireBrandJoin = Parameters<typeof tireBrandFromJoin>[0]

export function tireToDisplayInput(tire: {
  name: string
  size: string
  rim: number | string
  model?: string | null
  tire_brands?: TireBrandJoin
}): TireDisplayInput {
  return {
    name: tire.name,
    size: tire.size,
    rim: tire.rim,
    model: tire.model,
    brandName: tireBrandFromJoin(tire.tire_brands),
  }
}
