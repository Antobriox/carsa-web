import type { CatalogService } from '@/types/catalog'

const COMBINED_ID = '__carsa-alineacion-y-balanceo'

function stripDiacritics(s: string): string {
  return s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
}

/**
 * Detecta filas de catálogo que corresponden solo a Alineación o solo a Balanceo
 * (sin fusionar en BD). Si ya existe un servicio combinado en nombre/slug, no
 * lo toca.
 */
export function classifyAlignmentBalance(
  s: CatalogService
): 'align' | 'balance' | 'other' {
  const slugNorm = stripDiacritics(s.slug.trim())
  const nm = stripDiacritics(s.name.trim())

  if (nm.includes('alineacion') && nm.includes('balanceo')) {
    return 'other'
  }
  if (
    slugNorm === 'alineacion-y-balanceo' ||
    slugNorm === 'alineacion-balanceo'
  ) {
    return 'other'
  }

  if (slugNorm === 'alineacion' || slugNorm === 'alignment') return 'align'
  if (slugNorm === 'balanceo' || slugNorm === 'balance') return 'balance'

  const hasAlign = nm.includes('alineacion')
  const hasBal = nm.includes('balanceo')
  if (hasAlign && hasBal) return 'other'
  if (hasAlign && !hasBal) return 'align'
  if (hasBal && !hasAlign) return 'balance'

  return 'other'
}

const COMBINED_DESCRIPTION =
  'Servicio completo para mejorar la estabilidad del vehículo, reducir vibraciones y evitar desgaste irregular de las llantas.'

/**
 * Sustituye las dos cards de Alineación y Balanceo por una sola card visual,
 * sin tocar Supabase. Si no hay par claro, devuelve el arreglo original.
 */
export function mergeAlignmentBalanceServices(
  services: CatalogService[]
): CatalogService[] {
  let iAlign = -1
  let iBal = -1

  for (let i = 0; i < services.length; i++) {
    const k = classifyAlignmentBalance(services[i])
    if (k === 'align' && iAlign === -1) iAlign = i
    if (k === 'balance' && iBal === -1) iBal = i
  }

  if (iAlign === -1 || iBal === -1) {
    return services
  }

  const align = services[iAlign]
  const balance = services[iBal]
  const insertAt = Math.min(iAlign, iBal)

  const combined: CatalogService = {
    id: COMBINED_ID,
    name: 'Alineación y balanceo',
    slug: 'alineacion-y-balanceo',
    description: COMBINED_DESCRIPTION,
    price: 0,
    image_url: align.image_url ?? balance.image_url ?? null,
    is_featured: align.is_featured || balance.is_featured,
    display_placeholder: 'gauge',
  }

  const out: CatalogService[] = []
  let placed = false
  const alignId = align.id
  const balanceId = balance.id

  for (let i = 0; i < services.length; i++) {
    const s = services[i]
    if (s.id === alignId || s.id === balanceId) {
      if (i === insertAt && !placed) {
        out.push(combined)
        placed = true
      }
      continue
    }
    out.push(s)
  }

  return out
}
