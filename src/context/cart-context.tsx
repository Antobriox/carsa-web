'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  joinBrandName,
  type CatalogBattery,
  type CatalogTire,
} from '@/types/catalog'

const STORAGE_KEY = 'carsa-cart-v3'

type CartLineBase = {
  id: string
  name: string
  unitPrice: number
  quantity: number
  imageSrc: string
  brand?: string
  maxStock: number
}

export type CartTireLine = CartLineBase & { kind: 'tire' }
export type CartBatteryLine = CartLineBase & { kind: 'battery' }
export type CartLine = CartTireLine | CartBatteryLine

function priceNumber(value: number | string): number {
  const n = typeof value === 'string' ? Number(value) : value
  return Number.isFinite(n) ? n : 0
}

function normalizeLine(x: unknown): CartLine | null {
  if (typeof x !== 'object' || x === null) return null
  const o = x as Record<string, unknown>
  const kind = o.kind === 'battery' ? 'battery' : 'tire'
  const id = typeof o.id === 'string' ? o.id : null
  if (!id) return null
  const name = typeof o.name === 'string' ? o.name : ''
  const unitPrice = priceNumber(o.unitPrice as number | string)
  const quantity =
    typeof o.quantity === 'number' && o.quantity > 0 ? o.quantity : 1
  const imageSrc = typeof o.imageSrc === 'string' ? o.imageSrc : ''
  const brand = typeof o.brand === 'string' ? o.brand : undefined
  const ms =
    typeof o.maxStock === 'number' && o.maxStock > 0 ? o.maxStock : 99
  const base = {
    id,
    name,
    unitPrice,
    quantity,
    imageSrc,
    brand,
    maxStock: ms,
  }
  return kind === 'battery'
    ? ({ kind: 'battery', ...base } as CartBatteryLine)
    : ({ kind: 'tire', ...base } as CartTireLine)
}

function loadFromStorage(): CartLine[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .map(normalizeLine)
      .filter((x): x is CartLine => x !== null)
  } catch {
    return []
  }
}

type CartContextValue = {
  lines: CartLine[]
  addTire: (tire: CatalogTire, quantity: number, imageSrc: string) => void
  addBattery: (
    battery: CatalogBattery,
    quantity: number,
    imageSrc: string
  ) => void
  removeLine: (kind: 'tire' | 'battery', id: string) => void
  setLineQuantity: (
    kind: 'tire' | 'battery',
    id: string,
    quantity: number
  ) => void
  clear: () => void
  itemCount: number
  subtotal: number
}

const CartContext = createContext<CartContextValue | null>(null)

function mergeLine(
  prev: CartLine[],
  nextLine: CartLine,
  maxStock: number
): CartLine[] {
  const idx = prev.findIndex(
    (l) => l.kind === nextLine.kind && l.id === nextLine.id
  )
  if (idx === -1) return [...prev, nextLine]
  const copy = [...prev]
  const cap = Math.min(maxStock, copy[idx].maxStock ?? maxStock)
  const merged = Math.min(copy[idx].quantity + nextLine.quantity, cap)
  copy[idx] = {
    ...copy[idx],
    quantity: merged,
    unitPrice: nextLine.unitPrice,
    maxStock: cap,
  }
  return copy
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])

  useEffect(() => {
    queueMicrotask(() => {
      setLines(loadFromStorage())
    })
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  }, [lines])

  const addTire = useCallback(
    (tire: CatalogTire, quantity: number, imageSrc: string) => {
      const unit = priceNumber(tire.price)
      const maxStock = tire.stock > 0 ? tire.stock : 0
      if (maxStock <= 0 || quantity <= 0) return

      const brand = joinBrandName(tire.tire_brands)
      const q = Math.min(quantity, maxStock)

      const line: CartTireLine = {
        kind: 'tire',
        id: tire.id,
        name: tire.name,
        unitPrice: unit,
        quantity: q,
        imageSrc,
        brand,
        maxStock,
      }

      setLines((prev) => mergeLine(prev, line, maxStock))
    },
    []
  )

  const addBattery = useCallback(
    (battery: CatalogBattery, quantity: number, imageSrc: string) => {
      const unit = priceNumber(battery.price)
      const maxStock = battery.stock > 0 ? battery.stock : 0
      if (maxStock <= 0 || quantity <= 0) return

      const brand = joinBrandName(battery.battery_brands)
      const q = Math.min(quantity, maxStock)

      const line: CartBatteryLine = {
        kind: 'battery',
        id: battery.id,
        name: battery.name,
        unitPrice: unit,
        quantity: q,
        imageSrc,
        brand,
        maxStock,
      }

      setLines((prev) => mergeLine(prev, line, maxStock))
    },
    []
  )

  const removeLine = useCallback((kind: 'tire' | 'battery', id: string) => {
    setLines((prev) => prev.filter((l) => !(l.kind === kind && l.id === id)))
  }, [])

  const setLineQuantity = useCallback(
    (kind: 'tire' | 'battery', id: string, quantity: number) => {
      if (quantity <= 0) {
        setLines((prev) => prev.filter((l) => !(l.kind === kind && l.id === id)))
        return
      }
      setLines((prev) =>
        prev.map((l) => {
          if (l.kind !== kind || l.id !== id) return l
          const cap = l.maxStock > 0 ? l.maxStock : quantity
          const q = Math.min(quantity, cap)
          return { ...l, quantity: q }
        })
      )
    },
    []
  )

  const clear = useCallback(() => setLines([]), [])

  const { itemCount, subtotal } = useMemo(() => {
    let count = 0
    let sum = 0
    for (const l of lines) {
      count += l.quantity
      sum += l.unitPrice * l.quantity
    }
    return { itemCount: count, subtotal: sum }
  }, [lines])

  const value = useMemo(
    () => ({
      lines,
      addTire,
      addBattery,
      removeLine,
      setLineQuantity,
      clear,
      itemCount,
      subtotal,
    }),
    [
      lines,
      addTire,
      addBattery,
      removeLine,
      setLineQuantity,
      clear,
      itemCount,
      subtotal,
    ]
  )

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart debe usarse dentro de CartProvider')
  }
  return ctx
}
