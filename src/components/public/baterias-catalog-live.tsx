'use client'

import { BatteryProductGrid } from '@/components/public/catalog-product-grids'
import { useBatteriesInventoryRealtime } from '@/hooks/use-catalog-inventory-realtime'
import type { CatalogBattery } from '@/types/catalog'

export function BateriasCatalogLive({ batteries }: { batteries: CatalogBattery[] }) {
  const live = useBatteriesInventoryRealtime(batteries)
  return <BatteryProductGrid batteries={live} />
}
