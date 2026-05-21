import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type CartItemType = 'tire' | 'battery'

export type CartStoreItem = {
  item_type: CartItemType
  item_id: string
  item_name: string
  image_url: string | null
  unit_price: number
  quantity: number
  subtotal: number
  /** Tope según existencias mostradas en catálogo (el descuento de inventario ocurre al confirmar la venta en taller). */
  available_quantity: number
}

export type AddCartItemInput = {
  item_type: CartItemType
  item_id: string
  item_name: string
  image_url: string | null
  unit_price: number
  quantity: number
  available_quantity: number
}

const STORAGE_KEY = 'carsa-cart-store-v1'

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}

function withSubtotal(
  unit_price: number,
  quantity: number,
  rest: Omit<CartStoreItem, 'unit_price' | 'quantity' | 'subtotal'>
): CartStoreItem {
  const q = Math.max(1, Math.floor(quantity))
  return {
    ...rest,
    unit_price: roundMoney(unit_price),
    quantity: q,
    subtotal: roundMoney(roundMoney(unit_price) * q),
  }
}

type CartState = {
  items: CartStoreItem[]
  addItem: (input: AddCartItemInput) => void
  removeItem: (item_type: CartItemType, item_id: string) => void
  updateQuantity: (
    item_type: CartItemType,
    item_id: string,
    quantity: number
  ) => void
  /**
   * Sincroniza tope de existencias cuando el catálogo cambia en vivo (p. ej. venta en taller).
   * Si stock llega a 0, quita la línea del carrito.
   */
  applyStockFromCatalog: (
    item_type: CartItemType,
    item_id: string,
    stock: number
  ) => void
  clearCart: () => void
  /** Suma de subtotales */
  getTotal: () => number
  /** Unidades totales en carrito */
  getItemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (input) => {
        const cap = Math.max(0, Math.floor(input.available_quantity))
        if (cap <= 0 || input.quantity <= 0) return

        const qty = Math.min(Math.max(1, Math.floor(input.quantity)), cap)
        const unit = roundMoney(input.unit_price)

        set((state) => {
          const idx = state.items.findIndex(
            (i) =>
              i.item_type === input.item_type && i.item_id === input.item_id
          )
          const nextAvail = cap

          if (idx === -1) {
            const row = withSubtotal(unit, qty, {
              item_type: input.item_type,
              item_id: input.item_id,
              item_name: input.item_name,
              image_url: input.image_url,
              available_quantity: nextAvail,
            })
            return { items: [...state.items, row] }
          }

          const prev = state.items[idx]
          const mergedQty = Math.min(prev.quantity + qty, nextAvail)
          const row = withSubtotal(unit, mergedQty, {
            item_type: input.item_type,
            item_id: input.item_id,
            item_name: input.item_name,
            image_url: input.image_url,
            available_quantity: nextAvail,
          })
          const copy = [...state.items]
          copy[idx] = row
          return { items: copy }
        })
      },

      removeItem: (item_type, item_id) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.item_type === item_type && i.item_id === item_id)
          ),
        }))
      },

      updateQuantity: (item_type, item_id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(item_type, item_id)
          return
        }

        set((state) => ({
          items: state.items.map((i) => {
            if (i.item_type !== item_type || i.item_id !== item_id) return i
            const cap =
              i.available_quantity > 0 ? i.available_quantity : quantity
            const q = Math.min(Math.max(1, Math.floor(quantity)), cap)
            return withSubtotal(i.unit_price, q, {
              item_type: i.item_type,
              item_id: i.item_id,
              item_name: i.item_name,
              image_url: i.image_url,
              available_quantity: i.available_quantity,
            })
          }),
        }))
      },

      applyStockFromCatalog: (item_type, item_id, stock) => {
        const cap = Math.max(0, Math.floor(Number(stock)))
        set((state) => ({
          items: state.items
            .map((i) => {
              if (i.item_type !== item_type || i.item_id !== item_id) return i
              if (cap <= 0) return null
              const q = Math.min(Math.max(1, i.quantity), cap)
              return withSubtotal(i.unit_price, q, {
                item_type: i.item_type,
                item_id: i.item_id,
                item_name: i.item_name,
                image_url: i.image_url,
                available_quantity: cap,
              })
            })
            .filter((x): x is CartStoreItem => x != null),
        }))
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        const sum = get().items.reduce((acc, i) => acc + i.subtotal, 0)
        return roundMoney(sum)
      },

      getItemCount: () =>
        get().items.reduce((acc, i) => acc + i.quantity, 0),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items }),
      version: 1,
    }
  )
)
