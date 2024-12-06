'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { api } from '@/trpc/react'
import {
  CheckCircle,
  Clock,
  Package,
  Printer,
  ShoppingBag,
  Truck
} from 'lucide-react'

import { formatPrice } from '@/utils/format'
import { getImageUrl } from '@/utils/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

interface P2POrderConfirmationPageProps {
  params: {
    offerId: string
  }
}

export default function P2POrderConfirmationPage({
  params
}: P2POrderConfirmationPageProps) {
  const router = useRouter()

  const {
    data: order,
    isLoading,
    refetch
  } = api.p2p.getOrderByOfferId.useQuery(
    {
      offerId: params.offerId
    },
    {
      retry: false,
      refetchOnWindowFocus: false,
      enabled: !!params.offerId
    }
  )

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="space-y-8">
          <div className="flex items-center space-x-2">
            <Clock className="h-6 w-6 animate-spin text-primary" />
            <h2 className="text-lg font-semibold">Processing your order...</h2>
          </div>
          <Card className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Card className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <h2 className="text-lg font-semibold">Order Not Found</h2>
            <p className="text-muted-foreground">
              We couldn't find your order. Please check your purchases page for
              details.
            </p>
            <Button onClick={() => router.push('/account/purchases')}>
              View Purchases
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Parse images if they're stored as a JSON string
  const images =
    typeof order.item.images === 'string'
      ? JSON.parse(order.item.images)
      : order.item.images

  const orderStatus = [
    {
      icon: ShoppingBag,
      title: 'Order Placed',
      description: 'Your order has been placed successfully',
      completed: true
    },
    {
      icon: Clock,
      title: 'Payment Confirmed',
      description: 'Payment has been confirmed',
      completed:
        order.status === 'PAYMENT_CONFIRMED' ||
        order.status === 'READY_FOR_PICKUP' ||
        order.status === 'IN_TRANSIT' ||
        order.status === 'DELIVERED'
    },
    {
      icon: Package,
      title: 'Ready for Pickup',
      description: 'Item is ready for shipping',
      completed:
        order.status === 'READY_FOR_PICKUP' ||
        order.status === 'IN_TRANSIT' ||
        order.status === 'DELIVERED'
    },
    {
      icon: Truck,
      title: 'In Transit',
      description: 'Item is on its way',
      completed: order.status === 'IN_TRANSIT' || order.status === 'DELIVERED'
    }
  ]

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 space-y-2">
        <div className="flex items-center space-x-2 text-green-600">
          <CheckCircle className="h-8 w-8" />
          <h1 className="text-2xl font-bold">Order Confirmed!</h1>
        </div>
        <p className="text-muted-foreground">
          Thank you for your purchase. We'll notify you when the seller ships
          your item.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          {/* Order Status */}
          <Card className="p-6">
            <h2 className="mb-4 font-semibold">Order Status</h2>
            <div className="space-y-4">
              {orderStatus.map((status) => (
                <div key={status.title} className="flex items-start space-x-4">
                  <div
                    className={`rounded-full p-2 ${
                      status.completed
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <status.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{status.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {status.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Order Item */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Order Details</h2>
              <Button variant="outline" size="sm">
                <Printer className="mr-2 h-4 w-4" />
                Print Receipt
              </Button>
            </div>
            <Separator className="my-4" />
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="relative h-24 w-24 overflow-hidden rounded-md">
                  <Image
                    src={getImageUrl(images?.[0] || '')}
                    alt={order.item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{order.item.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Condition: {order.item.condition}
                  </p>
                  {order.item.brand && (
                    <p className="text-sm text-muted-foreground">
                      Brand: {order.item.brand}
                    </p>
                  )}
                </div>
                <p className="font-medium">
                  {formatPrice(order.total_amount.toString())}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Order Summary */}
        <Card className="h-fit p-6">
          <h2 className="mb-4 font-semibold">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Item Price</span>
              <span>
                {formatPrice((Number(order.total_amount) - 5).toString())}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping Fee</span>
              <span>{formatPrice('5')}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>{formatPrice(order.total_amount.toString())}</span>
            </div>
          </div>
          <Separator className="my-4" />
          {/* {order.delivery_address && (
            <>
              <div className="space-y-2">
                <h3 className="font-medium">Delivery Address</h3>
                <div className="text-sm text-muted-foreground">
                  <p>{order.delivery_address.fullName}</p>
                  <p>{order.delivery_address.phoneNumber}</p>
                  <p>
                    {order.delivery_address.addressLine1}
                    {order.delivery_address.addressLine2 &&
                      `, ${order.delivery_address.addressLine2}`}
                  </p>
                  <p>
                    {order.delivery_address.city},{' '}
                    {order.delivery_address.state}{' '}
                    {order.delivery_address.postalCode}
                  </p>
                  <p>{order.delivery_address.country}</p>
                </div>
              </div>
              <Separator className="my-4" />
            </>
          )} */}
          <div className="mt-6">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/account/purchases')}
            >
              View All Purchases
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
