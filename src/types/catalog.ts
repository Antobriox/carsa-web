/** Supabase puede inferir la relación como objeto o arreglo de una fila. */
export type BrandNameJoin = { name: string } | { name: string }[] | null

export function joinBrandName(brand: BrandNameJoin): string | undefined {
  if (!brand) return undefined
  if (Array.isArray(brand)) return brand[0]?.name
  return brand.name
}

export type CatalogTire = {
  id: string
  name: string
  rim: number
  size: string
  model: string | null
  description: string | null
  price: number | string
  stock: number
  image_url: string | null
  is_featured: boolean
  tire_brands: BrandNameJoin
}

export type CatalogBattery = {
  id: string
  name: string
  model: string | null
  amperage: string | null
  voltage: string | null
  polarity: string | null
  warranty_months: number | null
  description: string | null
  price: number | string
  stock: number
  image_url: string | null
  is_featured: boolean
  battery_brands: BrandNameJoin
}

export type CatalogService = {
  id: string
  name: string
  slug: string
  description: string | null
  price: number | string
  image_url: string | null
  is_featured: boolean
  /** Solo frontend (p. ej. servicio fusionado); no viene de Supabase. */
  display_placeholder?: 'gauge' | 'wrench'
}

export type CatalogPayload = {
  tires: CatalogTire[]
  batteries: CatalogBattery[]
  services: CatalogService[]
}

/** Imágenes opcionales para el hero / tarjetas de categoría (primera destacada o primera con foto). */
export type CatalogHeroAssets = {
  heroTireImageUrl: string | null
  heroBatteryImageUrl: string | null
}

export type CatalogPageProps = CatalogPayload & CatalogHeroAssets
