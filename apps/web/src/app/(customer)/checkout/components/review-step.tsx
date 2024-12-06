'use client'

import Image from 'next/image'
import { api } from '@/trpc/react'

import { formatPrice } from '@/utils/format'
import { getImageUrl } from '@/utils/image'
import { type CartItem } from '@/hooks/use-cart'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

interface ReviewStepProps {
  addressId?: string
  paymentMethodId?: string
  items: CartItem[]
}

export function ReviewStep({
  addressId,
  paymentMethodId,
  items
}: ReviewStepProps) {
  const { data: address } = api.address.getById.useQuery(addressId!, {
    enabled: !!addressId
  })
  const { data: paymentMethod } = api.payment.getById.useQuery(
    paymentMethodId!,
    { enabled: !!paymentMethodId }
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Review Your Order</h2>
        <p className="text-sm text-muted-foreground">
          Please review your order details before proceeding with payment.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Delivery Address</h3>
        {address && (
          <div className="rounded-lg border p-4">
            <p className="font-medium">{address.full_name}</p>
            <p>{address.phone_number}</p>
            <p>
              {address.address_line1}
              {address.address_line2 && `, ${address.address_line2}`}
            </p>
            <p>
              {address.city}, {address.state} {address.postal_code}
            </p>
            <p>{address.country}</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Payment Method</h3>
        {paymentMethod && (
          <div className="rounded-lg border p-4">
            <p className="font-medium">
              {paymentMethod.card_brand?.toUpperCase()} ••••{' '}
              {paymentMethod.last4}
            </p>
            <p className="text-sm text-muted-foreground">
              Expires {paymentMethod.exp_month}/{paymentMethod.exp_year}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Order Items</h3>
        <ScrollArea className="h-[200px]">
          {items.map((item) => {
            const images =
              typeof item.product.images === 'string'
                ? JSON.parse(item.product.images)
                : item.product.images

            return (
              <div
                key={item.product.id}
                className="flex items-center space-x-4 py-2"
              >
                <div className="relative h-16 w-16">
                  <Image
                    src={getImageUrl(images?.[0] || '')}
                    alt={item.product.name}
                    fill
                    className="rounded-md object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <p className="font-medium">
                  {formatPrice(
                    (
                      Number(item.product.sale_price || item.product.price) *
                      item.quantity
                    ).toString()
                  )}
                </p>
              </div>
            )
          })}
        </ScrollArea>
      </div>
    </div>
  )
}
