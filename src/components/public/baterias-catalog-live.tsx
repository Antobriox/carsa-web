'use client'

import { useMemo, useState } from 'react'

import { BatteryProductGrid } from '@/components/public/catalog-product-grids'
import { buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useBatteriesInventoryRealtime } from '@/hooks/use-catalog-inventory-realtime'
import { batteryMatchesQuery } from '@/lib/catalog-filters'
import { cn } from '@/lib/utils'
import { joinBrandName, type CatalogBattery } from '@/types/catalog'

const ALL_BRANDS = 'todas'
const ALL_AMPERAGES = 'todos'

function uniqueSortedStrings(values: (string | null | undefined)[]): string[] {
  return Array.from(
    new Set(values.map((v) => v?.trim()).filter((v): v is string => Boolean(v)))
  ).sort((a, b) => a.localeCompare(b, 'es', { numeric: true }))
}

export function BateriasCatalogLive({
  batteries,
  initialSearch = '',
}: {
  batteries: CatalogBattery[]
  initialSearch?: string
}) {
  const live = useBatteriesInventoryRealtime(batteries)
  const [searchText, setSearchText] = useState(initialSearch)
  const [brand, setBrand] = useState<string>(ALL_BRANDS)
  const [amperage, setAmperage] = useState<string>(ALL_AMPERAGES)

  const brandOptions = useMemo(() => {
    const set = new Set<string>()
    for (const battery of live) {
      const b = joinBrandName(battery.battery_brands)
      if (b) set.add(b)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'))
  }, [live])

  const amperageOptions = useMemo(
    () => uniqueSortedStrings(live.map((battery) => battery.amperage)),
    [live]
  )

  const filtered = useMemo(() => {
    return live.filter((battery) => {
      if (brand !== ALL_BRANDS) {
        const b = joinBrandName(battery.battery_brands)
        if (b !== brand) return false
      }
      if (amperage !== ALL_AMPERAGES && battery.amperage?.trim() !== amperage) {
        return false
      }
      if (searchText.trim() && !batteryMatchesQuery(searchText, battery)) {
        return false
      }
      return true
    })
  }, [live, brand, amperage, searchText])

  const clearFilters = () => {
    setSearchText('')
    setBrand(ALL_BRANDS)
    setAmperage(ALL_AMPERAGES)
  }

  const hasActiveFilters =
    brand !== ALL_BRANDS ||
    amperage !== ALL_AMPERAGES ||
    searchText.trim() !== ''

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border/80 bg-card/60 p-5 shadow-sm ring-1 ring-white/5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-carsa-primary">
          Filtros
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Filtra por marca, amperaje y voltaje. La busqueda general incluye
          nombre, modelo, polaridad y descripcion.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="battery-search" className="text-foreground">
              Busqueda
            </Label>
            <Input
              id="battery-search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Marca, modelo, amperaje..."
              className="h-10 border-border bg-background/80"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="battery-brand" className="text-foreground">
              Marca
            </Label>
            <select
              id="battery-brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-border bg-background/80 px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <option value={ALL_BRANDS}>Todas las marcas</option>
              {brandOptions.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="battery-amperage" className="text-foreground">
              Amperaje
            </Label>
            <select
              id="battery-amperage"
              value={amperage}
              onChange={(e) => setAmperage(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-border bg-background/80 px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <option value={ALL_AMPERAGES}>Todos los amperajes</option>
              {amperageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasActiveFilters ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {filtered.length} resultado{filtered.length === 1 ? '' : 's'}
            </span>
            <button
              type="button"
              onClick={clearFilters}
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'sm' }),
                'text-carsa-primary'
              )}
            >
              Limpiar filtros
            </button>
          </div>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-14 text-center text-sm text-muted-foreground">
          No hay baterias que coincidan con los filtros. Ajusta la busqueda o
          escribenos por WhatsApp.
        </p>
      ) : (
        <BatteryProductGrid batteries={filtered} />
      )}
    </div>
  )
}
