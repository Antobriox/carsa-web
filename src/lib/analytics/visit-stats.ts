import { createClient } from '@/lib/supabase/server'

export type SiteVisitStats = {
  available: boolean
  setupHint: string | null
  registeredCustomers: number | null
  uniqueVisitorsToday: number | null
  uniqueVisitorsWeek: number | null
  uniqueVisitorsMonth: number | null
  customerVisitorsToday: number | null
  pageViewsToday: number | null
}

type RpcStats = {
  ok?: boolean
  error?: string
  registered_customers?: number
  unique_today?: number
  unique_week?: number
  unique_month?: number
  customer_visitors_today?: number
  page_views_today?: number
}

export async function fetchSiteVisitStats(): Promise<SiteVisitStats> {
  const empty: SiteVisitStats = {
    available: false,
    setupHint: null,
    registeredCustomers: null,
    uniqueVisitorsToday: null,
    uniqueVisitorsWeek: null,
    uniqueVisitorsMonth: null,
    customerVisitorsToday: null,
    pageViewsToday: null,
  }

  const supabase = await createClient()

  const { data, error } = await supabase.rpc('admin_site_visit_stats')

  if (error) {
    const msg = error.message.toLowerCase()
    const missingFn =
      msg.includes('admin_site_visit_stats') &&
      (msg.includes('does not exist') ||
        msg.includes('could not find') ||
        msg.includes('schema cache'))

    return {
      ...empty,
      setupHint: missingFn
        ? 'Vuelve a ejecutar scripts/site-visits.sql en Supabase (el archivo estaba incompleto).'
        : 'No se pudieron leer las visitas. Verifica que tu usuario sea administrador.',
    }
  }

  const stats = (data ?? {}) as RpcStats

  if (!stats.ok) {
    return {
      ...empty,
      setupHint:
        stats.error === 'forbidden'
          ? 'Tu cuenta no tiene permisos de administrador para ver visitas.'
          : 'No se pudieron cargar las estadísticas de visitas.',
    }
  }

  return {
    available: true,
    setupHint: null,
    registeredCustomers: stats.registered_customers ?? 0,
    uniqueVisitorsToday: stats.unique_today ?? 0,
    uniqueVisitorsWeek: stats.unique_week ?? 0,
    uniqueVisitorsMonth: stats.unique_month ?? 0,
    customerVisitorsToday: stats.customer_visitors_today ?? 0,
    pageViewsToday: stats.page_views_today ?? 0,
  }
}
