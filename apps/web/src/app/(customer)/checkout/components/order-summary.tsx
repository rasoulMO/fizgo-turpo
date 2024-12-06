'use client'

import { formatPrice } from '@/utils/format'
import { type CartItem } from '@/hooks/use-cart'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface OrderSummaryProps {
  items: CartItem[]
  total: number
}

export function OrderSummary({ items, total }: OrderSummaryProps) {
  const subtotal = total
  const shipping = 5
  const finalTotal = subtotal + shipping

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold">Order Summary</h2>
      <div className="mt-4 space-y-4">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(subtotal.toString())}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span>{formatPrice(shipping.toString())}</span>
        </div>
        <Separator />
        <div className="flex justify-between font-medium">
          <span>Total</span>
          <span>{formatPrice(finalTotal.toString())}</span>
        </div>
      </div>
    </Card>
  )
}
