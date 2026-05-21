import { createClient } from '@/lib/supabase/server'
import type { CatalogBattery, CatalogService, CatalogTire } from '@/types/catalog'

const tireSelect = `
  id,
  name,
  rim,
  size,
  model,
  description,
  price,
  stock,
  image_url,
  is_featured,
  tire_brands (
    name
  )
` as const

const batterySelect = `
  id,
  name,
  model,
  amperage,
  voltage,
  polarity,
  warranty_months,
  description,
  price,
  stock,
  image_url,
  is_featured,
  battery_brands (
    name
  )
` as const

const serviceSelect = `
  id,
  name,
  slug,
  description,
  price,
  image_url,
  is_featured
` as const

export async function fetchActiveTires() {
  const supabase = await createClient()
  return supabase
    .from('tires')
    .select(tireSelect)
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('name')
}

export async function fetchActiveBatteries() {
  const supabase = await createClient()
  return supabase
    .from('batteries')
    .select(batterySelect)
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('name')
}

export async function fetchActiveServices() {
  const supabase = await createClient()
  return supabase
    .from('services')
    .select(serviceSelect)
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('name')
}

export function asTireList(data: unknown): CatalogTire[] {
  return (data ?? []) as CatalogTire[]
}

export function asBatteryList(data: unknown): CatalogBattery[] {
  return (data ?? []) as CatalogBattery[]
}

export function asServiceList(data: unknown): CatalogService[] {
  return (data ?? []) as CatalogService[]
}
