'use client'

import { useEffect, useId, useLayoutEffect, useRef } from 'react'

import { createSupabaseBrowser } from '@/lib/supabase/client'

type PublicTable = 'tires' | 'batteries' | 'orders' | 'sales'

/**
 * Vuelve a cargar datos cuando cambia una fila en Supabase (otra pestaña, venta, admin).
 * Debounce evita ráfagas de peticiones.
 */
export function useSupabaseTableDebouncedRefresh(
  table: PublicTable,
  refresh: () => void,
  ms = 280
) {
  const refreshRef = useRef(refresh)
  const instanceId = useId().replace(/:/g, '')

  useLayoutEffect(() => {
    refreshRef.current = refresh
  }, [refresh])

  useEffect(() => {
    const supabase = createSupabaseBrowser()
    let timer: ReturnType<typeof setTimeout> | null = null

    const schedule = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        timer = null
        refreshRef.current()
      }, ms)
    }

    const channel = supabase
      .channel(`admin-refresh-${table}-${instanceId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        () => {
          schedule()
        }
      )
      .subscribe()

    return () => {
      if (timer) clearTimeout(timer)
      void supabase.removeChannel(channel)
    }
  }, [table, ms, instanceId])
}
