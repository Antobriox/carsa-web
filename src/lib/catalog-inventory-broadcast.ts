import type { RealtimeChannel } from '@supabase/supabase-js'

import { createSupabaseBrowser } from '@/lib/supabase/client'

/** Mismo topic en todos los clientes (anon o admin) para fan-out sin depender de postgres_changes. */
const BROADCAST_TOPIC = 'carsa-catalog-inventory'
const BROADCAST_EVENT = 'patch'

export type CatalogInventoryBroadcastPayload =
  | {
      table: 'tires'
      id: string
      deleted?: boolean
      stock?: number
      price?: unknown
      is_active?: boolean
    }
  | {
      table: 'batteries'
      id: string
      deleted?: boolean
      stock?: number
      price?: unknown
      is_active?: boolean
    }

type Handler = (payload: CatalogInventoryBroadcastPayload) => void

let browserSingleton: ReturnType<typeof createSupabaseBrowser> | null = null
const handlers = new Set<Handler>()
let listenChannel: RealtimeChannel | null = null

function getBrowserClient() {
  if (typeof window === 'undefined') return null
  if (!browserSingleton) browserSingleton = createSupabaseBrowser()
  return browserSingleton
}

/**
 * Recibe parches de inventario (otras pestañas, admin o venta).
 * Varios hooks pueden registrarse; un solo canal Realtime.
 */
export function subscribeCatalogInventoryBroadcast(handler: Handler): () => void {
  const supabase = getBrowserClient()
  if (!supabase) return () => {}

  handlers.add(handler)

  if (!listenChannel) {
    listenChannel = supabase.channel(BROADCAST_TOPIC)
    listenChannel.on('broadcast', { event: BROADCAST_EVENT }, ({ payload }) => {
      const p = payload as CatalogInventoryBroadcastPayload
      handlers.forEach((h) => {
        try {
          h(p)
        } catch {
          // no-op
        }
      })
    })
    listenChannel.subscribe()
  }

  return () => {
    handlers.delete(handler)
    if (handlers.size === 0 && listenChannel) {
      const sb = getBrowserClient()
      if (sb) void sb.removeChannel(listenChannel)
      listenChannel = null
    }
  }
}

/**
 * Notifica a todos los clientes del catálogo (misma clave anon).
 * No bloquea la UI; ignora errores de red.
 */
export function publishCatalogInventoryBroadcast(
  payload: CatalogInventoryBroadcastPayload
): void {
  const supabase = getBrowserClient()
  if (!supabase) return

  const ch = supabase.channel(BROADCAST_TOPIC)
  ch.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      void ch
        .send({
          type: 'broadcast',
          event: BROADCAST_EVENT,
          payload,
        })
        .finally(() => {
          void supabase.removeChannel(ch)
        })
    }
  })
}
