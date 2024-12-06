'use client'

import { useState } from 'react'
import { api } from '@/trpc/react'
import type { orders } from '@prisma/client'
import { ClipboardEdit } from 'lucide-react'

import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

import { orderStatusConfig } from './order-status-config'

interface UpdateOrderStatusDialogProps {
  order: orders
}

export function UpdateOrderStatusDialog({
  order
}: UpdateOrderStatusDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>()
  const { toast } = useToast()
  const utils = api.useUtils()

  // Define available status transitions based on current status
  const getAvailableTransitions = (currentStatus: string) => {
    const transitions: { [key: string]: string[] } = {
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
      utils.order.getOrderDetails.invalidate(order.id)
      setOpen(false)
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update order status'
      })
    }
  })

  const availableTransitions = getAvailableTransitions(order.status)

  const handleUpdateStatus = async () => {
    if (!selectedStatus) return

    await updateOrder.mutateAsync({
      orderId: order.id,
      status: selectedStatus as any // The type will be ensured by the backend
    })
  }

  if (availableTransitions.length === 0) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ClipboardEdit className="mr-2 h-4 w-4" />
          Update Status
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>
            Select a new status for order #{order.id.slice(0, 8)}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select new status" />
            </SelectTrigger>
            <SelectContent>
              {availableTransitions.map((status) => (
                <SelectItem key={status} value={status}>
                  <div className="flex items-center gap-2">
                    <span>
                      {
                        orderStatusConfig[
                          status as keyof typeof orderStatusConfig
                        ].label
                      }
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedStatus && (
            <div className="text-sm text-muted-foreground">
              This will change the order status from{' '}
              <span className="font-medium">
                {orderStatusConfig[order.status].label}
              </span>{' '}
              to{' '}
              <span className="font-medium">
                {
                  orderStatusConfig[
                    selectedStatus as keyof typeof orderStatusConfig
                  ].label
                }
              </span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateStatus}
            disabled={!selectedStatus || updateOrder.isPending}
          >
            {updateOrder.isPending ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
