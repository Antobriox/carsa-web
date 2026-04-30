import { createClient } from '@/lib/supabase/server'

export type DashboardStats = {
  tires: number | null
  batteries: number | null
  services: number | null
  lowStockProducts: number | null
  pendingOrders: number | null
  salesRegistered: number | null
  /** Suma de `sales.total` (todas las ventas visibles para el admin). */
  salesRevenueTotal: number | null
  /** Suma de `sales.total` del mes calendario actual (zona del servidor). */
  salesRevenueThisMonth: number | null
  warnings: string[]
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient()
  const warnings: string[] = []

  const tires = await supabase
    .from('tires')
    .select('id', { count: 'exact', head: true })
  if (tires.error) warnings.push(`tires: ${tires.error.message}`)

  const batteries = await supabase
    .from('batteries')
    .select('id', { count: 'exact', head: true })
  if (batteries.error) warnings.push(`batteries: ${batteries.error.message}`)

  const services = await supabase
    .from('services')
    .select('id', { count: 'exact', head: true })
  if (services.error) warnings.push(`services: ${services.error.message}`)

  const lowTires = await supabase
    .from('tires')
    .select('id', { count: 'exact', head: true })
    .gt('stock', 0)
    .lt('stock', 5)
  if (lowTires.error) warnings.push(`tires bajo stock: ${lowTires.error.message}`)

  const lowBat = await supabase
    .from('batteries')
    .select('id', { count: 'exact', head: true })
    .gt('stock', 0)
    .lt('stock', 4)
  if (lowBat.error) warnings.push(`baterías bajo stock: ${lowBat.error.message}`)

  let lowStockProducts: number | null = null
  if (!lowTires.error && !lowBat.error && lowTires.count != null && lowBat.count != null) {
    lowStockProducts = lowTires.count + lowBat.count
  } else if (!lowTires.error && lowTires.count != null) {
    lowStockProducts = lowTires.count
  } else if (!lowBat.error && lowBat.count != null) {
    lowStockProducts = lowBat.count
  }

  const pendingOrders = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .in('status', [
      'pending',
      'pendiente',
      'processing',
      'en_proceso',
      'awaiting_payment',
    ])
  if (pendingOrders.error) {
    warnings.push(`pedidos pendientes: ${pendingOrders.error.message}`)
  }

  const salesRegistered = await supabase
    .from('sales')
    .select('id', { count: 'exact', head: true })
  if (salesRegistered.error) {
    warnings.push(`ventas: ${salesRegistered.error.message}`)
  }

  const salesForRevenue = await supabase.from('sales').select('total, created_at')
  if (salesForRevenue.error) {
    warnings.push(`ventas ingresos: ${salesForRevenue.error.message}`)
  }

  let salesRevenueTotal: number | null = null
  let salesRevenueThisMonth: number | null = null
  if (!salesForRevenue.error && salesForRevenue.data) {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    startOfMonth.setHours(0, 0, 0, 0)
    const startIso = startOfMonth.toISOString()

    let total = 0
    let month = 0
    for (const row of salesForRevenue.data) {
      const t = Number(row.total)
      if (Number.isFinite(t)) total += t
      if (row.created_at && row.created_at >= startIso && Number.isFinite(t)) {
        month += t
      }
    }
    salesRevenueTotal = total
    salesRevenueThisMonth = month
  }

  return {
    tires: tires.error ? null : tires.count ?? 0,
    batteries: batteries.error ? null : batteries.count ?? 0,
    services: services.error ? null : services.count ?? 0,
    lowStockProducts,
    pendingOrders: pendingOrders.error ? null : pendingOrders.count ?? 0,
    salesRegistered: salesRegistered.error ? null : salesRegistered.count ?? 0,
    salesRevenueTotal,
    salesRevenueThisMonth,
    warnings,
  }
}
