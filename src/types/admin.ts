/** Filas admin (Supabase). Ajusta si tus columnas difieren. */

export type AdminTireBrand = {
  id: string
  name: string
  created_at?: string
}

export type AdminBatteryBrand = {
  id: string
  name: string
  created_at?: string
}

export type AdminTire = {
  id: string
  brand_id: string
  supplier_code: string | null
  name: string
  rim: number
  size: string
  model: string | null
  description: string | null
  price: number
  stock: number
  image_url: string | null
  is_active: boolean
  is_featured: boolean
  tire_brands?: { id: string; name: string } | { id: string; name: string }[] | null
}

export type AdminBattery = {
  id: string
  brand_id: string
  supplier_code: string | null
  name: string
  model: string | null
  amperage: string | null
  voltage: string | null
  polarity: string | null
  warranty_months: number | null
  description: string | null
  price: number
  stock: number
  image_url: string | null
  is_active: boolean
  is_featured: boolean
  battery_brands?: { id: string; name: string } | { id: string; name: string }[] | null
}

export type AdminService = {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  image_url: string | null
  is_active: boolean
  is_featured: boolean
}

/** Pedidos / ventas: columnas flexibles según esquema real. */
export type AdminOrderRow = Record<string, unknown> & {
  id?: string
  status?: string
  total?: number
  created_at?: string
}

export type AdminSaleRow = Record<string, unknown> & {
  id?: string
  total?: number
  created_at?: string
}

export type AdminPromotion = {
  id: string
  title: string | null
  image_url: string | null
  is_active: boolean
  is_popup: boolean
  created_at?: string
  updated_at?: string
}
