'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { api } from '@/trpc/react'
import { format } from 'date-fns'
import { ArrowLeft, Building2, Clock, MapPin, Package } from 'lucide-react'

import { formatPrice } from '@/utils/format'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

import { orderStatusConfig } from '../components/order-status-confing'

const OrderDetailsSkeleton = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-48" />
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <Skeleton className="mb-2 h-5 w-5" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-1 h-4 w-32" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
    {[1, 2, 3].map((i) => (
      <Card key={i}>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    ))}
  </div>
)

export default function OrderDetailsPage({
  params
}: {
  params: { orderId: string }
}) {
  const router = useRouter()
  const { data: order, isLoading } = api.order.getOrderSummary.useQuery(
    params.orderId,
    {
      retry: false,
      refetchOnWindowFocus: false
    }
  )

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push('/account/orders')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
        <OrderDetailsSkeleton />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push('/account/orders')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
        <Card className="py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <Package className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Order not found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              The order you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push('/account/orders')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Orders
      </Button>

      <div className="space-y-6">
        {/* Order Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Order ID</p>
                <h1 className="text-2xl font-bold">#{order.id.slice(0, 8)}</h1>
              </div>
              <Badge
                className={`${
                  orderStatusConfig[order.status].variant
                } text-white`}
              >
                {orderStatusConfig[order.status].label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Clock className="mb-2 h-5 w-5 text-muted-foreground" />
                <p className="text-sm font-medium">Order Date</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(order.created_at), 'PPP')}
                </p>
              </div>
              <div>
                <Building2 className="mb-2 h-5 w-5 text-muted-foreground" />
                <p className="text-sm font-medium">Total Items</p>
                <p className="text-sm text-muted-foreground">
                  {order.order_items.length} items
                </p>
              </div>
              <div>
                <MapPin className="mb-2 h-5 w-5 text-muted-foreground" />
                <p className="text-sm font-medium">Delivery Address</p>
                <p className="text-sm text-muted-foreground">
                  {order.delivery_address.full_name}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.order_items.map((item) => {
                const images =
                  typeof item.product.images === 'string'
                    ? JSON.parse(item.product.images)
                    : item.product.images

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative h-16 w-16 overflow-hidden rounded-md">
                        <Image
                          src={images?.[0] || '/placeholder-avatar.png'}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity} × $
                          {item.unit_price.toString()}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">
                      {formatPrice(item.subtotal.toString())}
                    </p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Delivery Details */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium">Delivery Address:</p>
              <p className="text-sm text-muted-foreground">
                {order.delivery_address.full_name}
                <br />
                {order.delivery_address.phone_number}
                <br />
                {order.delivery_address.address_line1}
                {order.delivery_address.address_line2 && (
                  <>
                    <br />
                    {order.delivery_address.address_line2}
                  </>
                )}
                <br />
                {order.delivery_address.city}, {order.delivery_address.state}{' '}
                {order.delivery_address.postal_code}
                <br />
                {order.delivery_address.country}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">Subtotal</p>
                <p className="font-medium">
                  {formatPrice(order.subtotal.toString())}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">Delivery Fee</p>
                <p className="font-medium">
                  {formatPrice(order.delivery_fee.toString())}
                </p>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between">
                <p className="font-medium">Total</p>
                <p className="font-bold">
                  {formatPrice(order.total.toString())}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
