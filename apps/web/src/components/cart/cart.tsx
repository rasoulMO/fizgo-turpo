'use client'

import Image from 'next/image'
import Link from 'next/link'
import { api } from '@/trpc/react'
import { Minus, Plus, Trash2 } from 'lucide-react'

import { formatPrice } from '@/utils/format'
import { getImageUrl } from '@/utils/image'
import { useCartActions } from '@/hooks/use-card-action'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

export function Cart() {
  const { data: serverCart, isLoading } = api.cart.getCart.useQuery()
  const { items, removeItem, updateQuantity, getTotal } = useCartActions()

  if (isLoading) {
    return (
      <div className="flex flex-col items-center space-y-4 p-8">
        <p>Loading cart...</p>
      </div>
    )
  }

  if (!serverCart || serverCart.items.length === 0) {
    return (
      <div className="flex flex-col items-center space-y-4 p-8">
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <p className="text-muted-foreground">Add items to get started</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-4 p-4">
      <ScrollArea className="h-[400px] pr-4">
        {serverCart.items.map((item) => {
          const images =
            typeof item.product.images === 'string'
              ? JSON.parse(item.product.images)
              : item.product.images

          return (
            <div key={item.product.id} className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="relative h-20 w-20">
                  <Image
                    src={getImageUrl(images?.[0] || '')}
                    alt={item.product.name}
                    fill
                    className="rounded-md object-cover"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-medium">{item.product.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(
                      item.product.sale_price?.toString() ||
                        item.product.price.toString()
                    )}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      updateQuantity(
                        item.product.id,
                        Math.max(0, item.quantity - 1)
                      )
                    }
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      updateQuantity(item.product.id, item.quantity + 1)
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeItem(item.product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Separator />
            </div>
          )
        })}
      </ScrollArea>
      <div className="space-y-4">
        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>{formatPrice(getTotal().toString())}</span>
        </div>
        <Link href="/checkout">
          <Button className="w-full">Proceed to Checkout</Button>
        </Link>
      </div>
    </div>
  )
}
