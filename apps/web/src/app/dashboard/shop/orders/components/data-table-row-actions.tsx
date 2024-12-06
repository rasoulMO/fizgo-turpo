'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/trpc/react'
import { OrderEventStatus, orders } from '@prisma/client'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'

import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row
}: DataTableRowActionsProps<TData>) {
  const router = useRouter()
  const { toast } = useToast()
  const order = row.original as orders
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [nextStatus, setNextStatus] = useState<OrderEventStatus | null>(null)

  const utils = api.useUtils()

  // Define available status transitions based on current status
  const getAvailableTransitions = (currentStatus: OrderEventStatus) => {
    const transitions: { [key in OrderEventStatus]?: OrderEventStatus[] } = {
      ORDER_PLACED: ['ORDER_CONFIRMED', 'CANCELLED'],
      ORDER_CONFIRMED: ['PREPARATION_STARTED', 'CANCELLED'],
      PREPARATION_STARTED: ['READY_FOR_PICKUP'],
      READY_FOR_PICKUP: ['PICKUP_COMPLETED'],
      PICKUP_COMPLETED: ['OUT_FOR_DELIVERY'],
      OUT_FOR_DELIVERY: ['DELIVERED', 'DELIVERY_ATTEMPTED'],
      DELIVERY_ATTEMPTED: ['OUT_FOR_DELIVERY', 'CANCELLED'],
      PAYMENT_PENDING: ['PAYMENT_COMPLETED', 'CANCELLED'],
      PAYMENT_COMPLETED: ['ORDER_CONFIRMED']
    }
    return transitions[currentStatus] || []
  }

  const updateOrder = api.order.updateStatus.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Order status updated successfully.'
      })
      utils.order.getShopOrders.invalidate()
      setShowUpdateDialog(false)
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update order status'
      })
    }
  })

  const handleUpdateStatus = async (status: OrderEventStatus) => {
    await updateOrder.mutateAsync({
      orderId: order.id,
      status: status
    })
  }

  const availableTransitions = getAvailableTransitions(order.status)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/shop/orders/${order.id}`)}
          >
            View details
          </DropdownMenuItem>

          {availableTransitions.length > 0 && (
            <>
              <DropdownMenuSeparator />
              {availableTransitions.map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => {
                    setNextStatus(status)
                    setShowUpdateDialog(true)
                  }}
                >
                  Update to {status.replace(/_/g, ' ').toLowerCase()}
                </DropdownMenuItem>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Are you sure you want to update the status of order #
              {order.id.slice(-8)} to{' '}
              {nextStatus?.replace(/_/g, ' ').toLowerCase()}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUpdateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => nextStatus && handleUpdateStatus(nextStatus)}
              disabled={updateOrder.isPending}
            >
              {updateOrder.isPending ? 'Updating...' : 'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
