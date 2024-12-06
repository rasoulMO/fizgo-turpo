// app/(customer)/checkout/confirmation/[orderId]/page.tsx
'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { api } from '@/trpc/react'
import {
  CheckCircle,
  Package,
  Printer,
  RefreshCcw,
  ShoppingBag,
  Truck
} from 'lucide-react'

import { formatPrice } from '@/utils/format'
import { getImageUrl } from '@/utils/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

interface OrderConfirmationPageProps {
  params: {
    orderId: string
  }
}

export default function OrderConfirmationPage({
  params
}: OrderConfirmationPageProps) {
  const router = useRouter()
  const { data: order, isLoading } = api.order.getOrderSummary.useQuery(
    params.orderId,
    {
      retry: false,
      refetchOnWindowFocus: false
    }
  )

  useEffect(() => {
    if (!isLoading && !order) {
      router.push('/cart')
    }
  }, [isLoading, order, router])

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="space-y-8">
          <Skeleton className="h-8 w-64" />
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
    return null
  }

  const orderStatus = [
    {
      icon: ShoppingBag,
      title: 'Order Placed',
      description: 'Your order has been placed successfully',
      completed: true
    },
    {
      icon: Package,
      title: 'Order Confirmed',
      description: 'Your order has been confirmed',
      completed:
        order.status === 'PAYMENT_COMPLETED' ||
        order.status === 'PREPARATION_STARTED' ||
        order.status === 'OUT_FOR_DELIVERY' ||
        order.status === 'DELIVERED'
    },
    {
      icon: RefreshCcw,
      title: 'Preparing Order',
      description: 'Your order is being prepared',
      completed:
        order.status === 'PREPARATION_STARTED' ||
        order.status === 'OUT_FOR_DELIVERY' ||
        order.status === 'DELIVERED'
    },
    {
      icon: Truck,
      title: 'Out for Delivery',
      description: 'Your order is on its way',
      completed:
        order.status === 'OUT_FOR_DELIVERY' || order.status === 'DELIVERED'
    }
  ]

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 space-y-2">
        <div className="flex items-center space-x-2 text-green-600">
          <CheckCircle className="h-8 w-8" />
          <h1 className="text-2xl font-bold">Order Confirmed!</h1>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          {/* Order Status */}
          <Card className="p-6">
            <h2 className="mb-4 font-semibold">Order Status</h2>
            <div className="space-y-4">
              {orderStatus.map((status, index) => (
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

          {/* Order Items */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Order Items</h2>
              <Button variant="outline" size="sm">
                <Printer className="mr-2 h-4 w-4" />
                Print Receipt
              </Button>
            </div>
            <Separator className="my-4" />
            <div className="space-y-4">
              {order.order_items.map((item) => {
                const images =
                  typeof item.product.images === 'string'
                    ? JSON.parse(item.product.images)
                    : item.product.images

                return (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="relative h-20 w-20 overflow-hidden rounded-md">
                      <Image
                        src={getImageUrl(images?.[0] || '')}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      {formatPrice(item.subtotal.toString())}
                    </p>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Order Summary */}
        <Card className="h-fit p-6">
          <h2 className="mb-4 font-semibold">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(order.subtotal.toString())}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span>{formatPrice(order.delivery_fee.toString())}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>{formatPrice(order.total.toString())}</span>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="space-y-2">
            <h3 className="font-medium">Delivery Address</h3>
            <div className="text-sm text-muted-foreground">
              <p>{order.delivery_address.full_name}</p>
              <p>{order.delivery_address.phone_number}</p>
              <p>
                {order.delivery_address.address_line1}
                {order.delivery_address.address_line2 &&
                  `, ${order.delivery_address.address_line2}`}
              </p>
              <p>
                {order.delivery_address.city}, {order.delivery_address.state}{' '}
                {order.delivery_address.postal_code}
              </p>
              <p>{order.delivery_address.country}</p>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="mt-6">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/account/orders')}
            >
              View All Orders
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
