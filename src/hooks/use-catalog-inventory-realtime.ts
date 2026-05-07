'use client'

import { useEffect, useId, useMemo, useState } from 'react'

import {
  subscribeCatalogInventoryBroadcast,
  type CatalogInventoryBroadcastPayload,
} from '@/lib/catalog-inventory-broadcast'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { useCartStore } from '@/stores/cart-store'
import type { CatalogBattery, CatalogTire } from '@/types/catalog'

function num(v: unknown, fallback: number): number {
  const n = typeof v === 'string' ? Number(v) : Number(v)
  return Number.isFinite(n) ? n : fallback
}

function isInactive(row: Record<string, unknown>): boolean {
  const v = row.is_active
  return v === false || v === 0 || v === 'false'
}

function mergeTire(prev: CatalogTire, row: Record<string, unknown>): CatalogTire {
  return {
    ...prev,
    ...(row.name != null ? { name: String(row.name) } : {}),
    ...(row.stock != null ? { stock: num(row.stock, prev.stock) } : {}),
    ...(row.price != null ? { price: row.price as CatalogTire['price'] } : {}),
    ...(row.rim != null ? { rim: num(row.rim, prev.rim) } : {}),
    ...(row.size != null ? { size: String(row.size) } : {}),
    ...(row.model !== undefined
      ? { model: row.model == null ? null : String(row.model) }
      : {}),
    ...(row.description !== undefined
      ? { description: row.description == null ? null : String(row.description) }
      : {}),
    ...(row.image_url !== undefined ? { image_url: row.image_url as string | null } : {}),
    ...(row.is_featured != null ? { is_featured: Boolean(row.is_featured) } : {}),
  }
}

function mergeBattery(
  prev: CatalogBattery,
  row: Record<string, unknown>
): CatalogBattery {
  return {
    ...prev,
    ...(row.name != null ? { name: String(row.name) } : {}),
    ...(row.stock != null ? { stock: num(row.stock, prev.stock) } : {}),
    ...(row.price != null ? { price: row.price as CatalogBattery['price'] } : {}),
    ...(row.model !== undefined
      ? { model: row.model == null ? null : String(row.model) }
      : {}),
    ...(row.amperage !== undefined
      ? { amperage: row.amperage == null ? null : String(row.amperage) }
      : {}),
    ...(row.voltage !== undefined
      ? { voltage: row.voltage == null ? null : String(row.voltage) }
      : {}),
    ...(row.polarity !== undefined
      ? { polarity: row.polarity == null ? null : String(row.polarity) }
      : {}),
    ...(row.warranty_months !== undefined
      ? {
          warranty_months:
            row.warranty_months == null ? null : num(row.warranty_months, 0),
        }
      : {}),
    ...(row.description !== undefined
      ? { description: row.description == null ? null : String(row.description) }
      : {}),
    ...(row.image_url !== undefined ? { image_url: row.image_url as string | null } : {}),
    ...(row.is_featured != null ? { is_featured: Boolean(row.is_featured) } : {}),
  }
}

/** Catálogo público: stock y campos visibles se actualizan al vender o editar en admin. */
export function useTiresInventoryRealtime(initialTires: CatalogTire[]): CatalogTire[] {
  const [tires, setTires] = useState(initialTires)
  const channelId = useId()

  const tiresServerSnapshotKey = useMemo(
    () => initialTires.map((t) => `${t.id}:${t.stock}:${t.price}:${t.is_featured ? 1 : 0}`).join('|'),
    [initialTires]
  )

  useEffect(() => {
    queueMicrotask(() => {
      setTires(initialTires)
    })
  }, [tiresServerSnapshotKey, initialTires])

  useEffect(() => {
    const applyRow = (row: Record<string, unknown>) => {
      const id = String(row.id ?? '')
      if (!id) return

      if (row.deleted === true) {
        setTires((prev) => prev.filter((t) => t.id !== id))
        useCartStore.getState().applyStockFromCatalog('tire', id, 0)
        return
      }

      if (isInactive(row)) {
        setTires((prev) => prev.filter((t) => t.id !== id))
        useCartStore.getState().applyStockFromCatalog('tire', id, 0)
        return
      }

      setTires((prev) => {
        const idx = prev.findIndex((t) => t.id === id)
        if (idx === -1) return prev
        const merged = mergeTire(prev[idx], row)
        const next = [...prev]
        next[idx] = merged
        return next
      })

      if (row.stock != null) {
        useCartStore.getState().applyStockFromCatalog('tire', id, num(row.stock, 0))
      }
    }

    const onBroadcast = (p: CatalogInventoryBroadcastPayload) => {
      if (p.table !== 'tires') return
      applyRow({
        id: p.id,
        deleted: p.deleted,
        stock: p.stock,
        price: p.price,
        is_active: p.is_active,
      })
    }

    const unsubBroadcast = subscribeCatalogInventoryBroadcast(onBroadcast)

    const supabase = createSupabaseBrowser()
    const channel = supabase
      .channel(`catalog-tires-pg-${channelId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tires' },
        (payload) => {
          applyRow(payload.new as Record<string, unknown>)
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'tires' },
        (payload) => {
          const oldRow = payload.old as Record<string, unknown> | undefined
          const id = String(oldRow?.id ?? '')
          if (!id) return
          applyRow({ id, deleted: true })
        }
      )
      .subscribe()

    return () => {
      unsubBroadcast()
      void supabase.removeChannel(channel)
    }
  }, [channelId])

  return tires
}

export function useBatteriesInventoryRealtime(
  initialBatteries: CatalogBattery[]
): CatalogBattery[] {
  const [batteries, setBatteries] = useState(initialBatteries)
  const channelId = useId()

  const batteriesServerSnapshotKey = useMemo(
    () =>
      initialBatteries
        .map((b) => `${b.id}:${b.stock}:${b.price}:${b.is_featured ? 1 : 0}`)
        .join('|'),
    [initialBatteries]
  )

  useEffect(() => {
    queueMicrotask(() => {
      setBatteries(initialBatteries)
    })
  }, [batteriesServerSnapshotKey, initialBatteries])

  useEffect(() => {
    const applyRow = (row: Record<string, unknown>) => {
      const id = String(row.id ?? '')
      if (!id) return

      if (row.deleted === true) {
        setBatteries((prev) => prev.filter((b) => b.id !== id))
        useCartStore.getState().applyStockFromCatalog('battery', id, 0)
        return
      }

      if (isInactive(row)) {
        setBatteries((prev) => prev.filter((b) => b.id !== id))
        useCartStore.getState().applyStockFromCatalog('battery', id, 0)
        return
      }

      setBatteries((prev) => {
        const idx = prev.findIndex((b) => b.id === id)
        if (idx === -1) return prev
        const merged = mergeBattery(prev[idx], row)
        const next = [...prev]
        next[idx] = merged
        return next
      })

      if (row.stock != null) {
        useCartStore
          .getState()
          .applyStockFromCatalog('battery', id, num(row.stock, 0))
      }
    }

    const onBroadcast = (p: CatalogInventoryBroadcastPayload) => {
      if (p.table !== 'batteries') return
      applyRow({
        id: p.id,
        deleted: p.deleted,
        stock: p.stock,
        price: p.price,
        is_active: p.is_active,
      })
    }

    const unsubBroadcast = subscribeCatalogInventoryBroadcast(onBroadcast)

    const supabase = createSupabaseBrowser()
    const channel = supabase
      .channel(`catalog-batteries-pg-${channelId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'batteries' },
        (payload) => {
          applyRow(payload.new as Record<string, unknown>)
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'batteries' },
        (payload) => {
          const oldRow = payload.old as Record<string, unknown> | undefined
          const id = String(oldRow?.id ?? '')
          if (!id) return
          applyRow({ id, deleted: true })
        }
      )
      .subscribe()

    return () => {
      unsubBroadcast()
      void supabase.removeChannel(channel)
    }
  }, [channelId])

  return batteries
}
