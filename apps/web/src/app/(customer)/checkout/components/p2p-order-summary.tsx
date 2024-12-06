// app/(customer)/checkout/[offerId]/order-summary.tsx
'use client'

import Image from 'next/image'

import { formatPrice } from '@/utils/format'
import { getImageUrl } from '@/utils/image'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface P2POrderSummaryProps {
  offer: any
}

export function P2POrderSummary({ offer }: P2POrderSummaryProps) {
  const images =
    typeof offer.item.images === 'string'
      ? JSON.parse(offer.item.images)
      : offer.item.images

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold">Order Summary</h2>
      <div className="mt-4 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="relative h-16 w-16">
            <Image
              src={getImageUrl(images?.[0] || '')}
              alt={offer.item.name}
              fill
              className="rounded-md object-cover"
            />
          </div>
          <div>
            <h3 className="font-medium">{offer.item.name}</h3>
            <p className="text-sm text-muted-foreground">
              List Price: {formatPrice(offer.item.price.toString())}
            </p>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Your Offer</span>
            <span>{formatPrice(offer.offer_amount.toString())}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping Fee</span>
            <span>{formatPrice('5')}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>
              {formatPrice((Number(offer.offer_amount) + 5).toString())}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
