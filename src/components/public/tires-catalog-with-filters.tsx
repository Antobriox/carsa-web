'use client'

import { useMemo, useState } from 'react'

import { TireProductGrid } from '@/components/public/catalog-product-grids'
import { buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { tireMatchesQuery } from '@/lib/catalog-filters'
import { cn } from '@/lib/utils'
import { joinBrandName, type CatalogTire } from '@/types/catalog'

const ALL_BRANDS = 'todas'
const ALL_RIMS = 'todos'

export function TiresCatalogWithFilters({
  tires,
  initialSearch = '',
}: {
  tires: CatalogTire[]
  initialSearch?: string
}) {
  const [searchText, setSearchText] = useState(initialSearch)
  const [brand, setBrand] = useState<string>(ALL_BRANDS)
  const [rim, setRim] = useState<string>(ALL_RIMS)
  const [sizeContains, setSizeContains] = useState('')

  const brandOptions = useMemo(() => {
    const set = new Set<string>()
    for (const t of tires) {
      const b = joinBrandName(t.tire_brands)
      if (b) set.add(b)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'))
  }, [tires])

  const rimOptions = useMemo(() => {
    const set = new Set<number>()
    for (const t of tires) set.add(t.rim)
    return Array.from(set).sort((a, b) => a - b)
  }, [tires])

  const filtered = useMemo(() => {
    return tires.filter((t) => {
      if (brand !== ALL_BRANDS) {
        const b = joinBrandName(t.tire_brands)
        if (b !== brand) return false
      }
      if (rim !== ALL_RIMS && String(t.rim) !== rim) return false
      const sz = sizeContains.trim().toLowerCase()
      if (sz && !t.size.toLowerCase().includes(sz)) return false
      if (searchText.trim() && !tireMatchesQuery(searchText, t)) return false
      return true
    })
  }, [tires, brand, rim, sizeContains, searchText])

  const clearFilters = () => {
    setSearchText('')
    setBrand(ALL_BRANDS)
    setRim(ALL_RIMS)
    setSizeContains('')
  }

  const hasActiveFilters =
    brand !== ALL_BRANDS ||
    rim !== ALL_RIMS ||
    sizeContains.trim() !== '' ||
    searchText.trim() !== ''

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 sm:py-12">
      <div className="rounded-2xl border border-border/80 bg-card/60 p-5 shadow-sm ring-1 ring-white/5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-carsa-primary">
          Filtros
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Filtra por marca, rin y medida. La búsqueda general incluye nombre,
          modelo y descripción.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="tire-search" className="text-foreground">
              Búsqueda
            </Label>
            <Input
              id="tire-search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Marca, modelo, medida…"
              className="h-10 border-border bg-background/80"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tire-brand" className="text-foreground">
              Marca
            </Label>
            <select
              id="tire-brand"
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
            <Label htmlFor="tire-rim" className="text-foreground">
              Rin
            </Label>
            <select
              id="tire-rim"
              value={rim}
              onChange={(e) => setRim(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-border bg-background/80 px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <option value={ALL_RIMS}>Todos los rines</option>
              {rimOptions.map((r) => (
                <option key={r} value={String(r)}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tire-size" className="text-foreground">
              Medida contiene
            </Label>
            <Input
              id="tire-size"
              value={sizeContains}
              onChange={(e) => setSizeContains(e.target.value)}
              placeholder="ej. 205/55"
              className="h-10 border-border bg-background/80"
            />
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
          No hay llantas que coincidan con los filtros. Ajusta la búsqueda o
          escríbenos por WhatsApp.
        </p>
      ) : (
        <TireProductGrid tires={filtered} />
      )}
    </div>
  )
}
