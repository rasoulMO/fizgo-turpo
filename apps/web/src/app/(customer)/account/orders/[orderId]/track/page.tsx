'use client'

import { useRouter } from 'next/navigation'
import { api } from '@/trpc/react'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import TrackingTimeline from '../../components/tracking-timeline'

const TrackingSkeleton = () => (
  <div className="space-y-8">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="flex items-start gap-6">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-4 w-24" />
      </div>
    ))}
  </div>
)

export default function OrderTrackingPage({
  params
}: {
  params: { orderId: string }
}) {
  const router = useRouter()
  const { data: orderWithEvents, isLoading } =
    api.order.getOrderWithEvents.useQuery(params.orderId)

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push('/account/orders')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Orders
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Order Timeline</span>
            {orderWithEvents && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/account/orders/${params.orderId}`)}
              >
                View Order Details
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TrackingSkeleton />
          ) : orderWithEvents ? (
            <>
              {orderWithEvents.order_events.length > 0 ? (
                <TrackingTimeline
                  events={orderWithEvents.order_events}
                  currentStatus={orderWithEvents.status}
                />
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No tracking information available yet.
                </div>
              )}
            </>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Order not found or you don&apos;t have permission to view it.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
