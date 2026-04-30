import {
  joinBrandName,
  type CatalogBattery,
  type CatalogService,
  type CatalogTire,
} from '@/types/catalog'

export function normalizeCatalogQuery(q: string): string {
  return q.trim().toLowerCase()
}

export function tireMatchesQuery(q: string, tire: CatalogTire): boolean {
  const n = normalizeCatalogQuery(q)
  if (!n) return true
  const brand = joinBrandName(tire.tire_brands)?.toLowerCase() ?? ''
  const parts = [
    tire.name,
    tire.size,
    tire.model,
    tire.description,
    brand,
    String(tire.rim),
  ]
  return parts.some((x) => x && String(x).toLowerCase().includes(n))
}

export function batteryMatchesQuery(q: string, battery: CatalogBattery): boolean {
  const n = normalizeCatalogQuery(q)
  if (!n) return true
  const brand = joinBrandName(battery.battery_brands)?.toLowerCase() ?? ''
  const parts = [
    battery.name,
    battery.model,
    battery.description,
    battery.amperage,
    battery.voltage,
    battery.polarity,
    brand,
  ]
  return parts.some((x) => x && String(x).toLowerCase().includes(n))
}

export function serviceMatchesQuery(q: string, service: CatalogService): boolean {
  const n = normalizeCatalogQuery(q)
  if (!n) return true
  const parts = [service.name, service.description, service.slug]
  return parts.some((x) => x && String(x).toLowerCase().includes(n))
}
