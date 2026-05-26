export type BatteryDisplayInput = {
  name: string
  amperage?: string | null
  model?: string | null
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

export function formatBatteryDisplayTitle(
  battery: BatteryDisplayInput
): string {
  const name = battery.name?.trim() ?? ''
  const amperage = battery.amperage?.trim() ?? ''
  const model = battery.model?.trim() ?? ''

  const parts: string[] = []

  if (name) parts.push(name)

  if (model && !containsToken(parts.join(' '), model)) {
    parts.push(model)
  }

  if (amperage && !containsToken(parts.join(' '), amperage)) {
    parts.push(amperage)
  }

  return parts.filter(Boolean).join(' · ') || 'Bateria'
}
