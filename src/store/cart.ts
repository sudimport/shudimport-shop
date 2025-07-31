// src/store/cart.ts
import { create } from 'zustand'

type CartItem = {
  name: string
  item_name: string
  price: number
  qty: number
  image: string | null
  // Aggiunte B2B per UOM
  uom?: string                    // "kg", "lt", "Stk", "Karton"
  weight_per_unit?: string | null // "6 kg ca.", "750 ml", "12 Stk"
  pack_size?: string | null       // "Confezione da 12"
  minimum_order_qty?: number      // Quantità minima ordine
  price_per_uom?: string          // "€/kg", "€/lt", "€/Stk"
}

type CartStore = {
  items: CartItem[]
  isOpen: boolean
  addToCart: (item: Omit<CartItem, 'qty'>) => void
  removeFromCart: (name: string) => void
  updateQty: (name: string, qty: number) => void
  clearCart: () => void
  toggleCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,
  
  addToCart: (item) =>
    set((state) => {
      const exists = state.items.find((i) => i.name === item.name)
      if (exists) {
        return {
          items: state.items.map((i) =>
            i.name === item.name ? { ...i, qty: i.qty + 1 } : i
          ),
        }
      } else {
        return { items: [...state.items, { ...item, qty: 1 }] }
      }
    }),
  
  removeFromCart: (name) =>
    set((state) => ({
      items: state.items.filter((i) => i.name !== name),
    })),
  
  updateQty: (name, qty) =>
    set((state) => {
      if (qty <= 0) {
        return {
          items: state.items.filter((i) => i.name !== name),
        }
      }
      return {
        items: state.items.map((i) =>
          i.name === name ? { ...i, qty } : i
        ),
      }
    }),
  
  clearCart: () => set({ items: [] }),
  
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  
  getTotalItems: () => {
    const { items } = get()
    return items.reduce((total, item) => total + item.qty, 0)
  },
  
  getTotalPrice: () => {
    const { items } = get()
    return items.reduce((total, item) => total + (item.price * item.qty), 0)
  },
}))
