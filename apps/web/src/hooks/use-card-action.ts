'use client'

import { useCallback } from 'react'
import { api } from '@/trpc/react'
import { type products } from '@prisma/client'

import { useCart } from './use-cart'

export function useCartActions() {
  const { mutateAsync: addToCart } = api.cart.addItem.useMutation()
  const { mutateAsync: removeFromCart } = api.cart.removeItem.useMutation()
  const { mutateAsync: updateCart } = api.cart.updateQuantity.useMutation()
  const { data: serverCart, refetch } = api.cart.getCart.useQuery()

  const cartStore = useCart()

  const addItem = useCallback(
    async (product: products, quantity: number) => {
      try {
        await addToCart({ productId: product.id, quantity })
        cartStore.addItem(product, quantity)
        refetch()
      } catch (error) {
        console.error('Failed to add item to cart:', error)
      }
    },
    [addToCart, cartStore, refetch]
  )

  const removeItem = useCallback(
    async (productId: string) => {
      try {
        await removeFromCart({ productId })
        cartStore.removeItem(productId)
        refetch()
      } catch (error) {
        console.error('Failed to remove item from cart:', error)
      }
    },
    [removeFromCart, cartStore, refetch]
  )

  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      try {
        await updateCart({ productId, quantity })
        cartStore.updateQuantity(productId, quantity)
        refetch()
      } catch (error) {
        console.error('Failed to update cart quantity:', error)
      }
    },
    [updateCart, cartStore, refetch]
  )

  const clearCart = useCallback(async () => {
    cartStore.clearCart()
    refetch()
  }, [cartStore, refetch])

  return {
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    items: serverCart?.items || [],
    getTotal: () =>
      serverCart?.items.reduce((total, item) => {
        const price = item.product.sale_price || item.product.price
        return total + Number(price) * item.quantity
      }, 0) || 0
  }
}
