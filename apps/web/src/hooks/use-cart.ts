import { type products } from '@prisma/client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  product: products
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (product: products, quantity: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  setItems: (items: CartItem[]) => void
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id
          )

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              )
            }
          }

          return { items: [...state.items, { product, quantity }] }
        })
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId)
        }))
      },

      updateQuantity: (productId, quantity) => {
        if (quantity === 0) {
          set((state) => ({
            items: state.items.filter((item) => item.product.id !== productId)
          }))
        } else {
          set((state) => ({
            items: state.items.map((item) =>
              item.product.id === productId ? { ...item, quantity } : item
            )
          }))
        }
      },

      setItems: (items) => set({ items }),

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce((total, item) => {
          const price = item.product.sale_price || item.product.price
          return total + Number(price) * item.quantity
        }, 0)
      }
    }),
    {
      name: 'cart-storage'
    }
  )
)
