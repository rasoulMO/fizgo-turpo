'use client'

import { OrderEventStatus, orders } from '@prisma/client'
import { ColumnDef } from '@tanstack/react-table'

import { formatDate } from '@/utils/format'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'

import { DataTableRowActions } from './data-table-row-actions'

export const orderColumns: ColumnDef<orders>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order ID" />
    ),
    cell: ({ row }) => {
      return (
        <span>#{(row.getValue('id') as string).slice(-8).toUpperCase()}</span>
      )
    }
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      return <span>{formatDate(new Date(row.getValue('created_at')))}</span>
    }
  },
  {
    accessorKey: 'total',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total" />
    ),
    cell: ({ row }) => {
      const amount = Number(row.getValue('total'))
      return (
        <span>
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
          }).format(amount)}
        </span>
      )
    }
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as OrderEventStatus

      const statusConfig = {
        ORDER_PLACED: { label: 'New Order', variant: 'default' as const },
        PAYMENT_PENDING: {
          label: 'Payment Pending',
          variant: 'warning' as const
        },
        PAYMENT_COMPLETED: { label: 'Paid', variant: 'success' as const },
        ORDER_CONFIRMED: { label: 'Confirmed', variant: 'success' as const },
        PREPARATION_STARTED: {
          label: 'In Preparation',
          variant: 'default' as const
        },
        READY_FOR_PICKUP: {
          label: 'Ready for Pickup',
          variant: 'success' as const
        },
        PICKUP_COMPLETED: { label: 'Picked Up', variant: 'success' as const },
        OUT_FOR_DELIVERY: {
          label: 'Out for Delivery',
          variant: 'default' as const
        },
        DELIVERY_ATTEMPTED: {
          label: 'Delivery Attempted',
          variant: 'warning' as const
        },
        DELIVERED: { label: 'Delivered', variant: 'success' as const },
        CANCELLED: { label: 'Cancelled', variant: 'destructive' as const },
        REFUND_REQUESTED: {
          label: 'Refund Requested',
          variant: 'warning' as const
        },
        REFUND_PROCESSED: { label: 'Refunded', variant: 'default' as const }
      }

      const config = statusConfig[status]

      return <Badge variant={config.variant}>{config.label}</Badge>
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />
  }
]

export const orderFilterableColumns = [
  {
    id: 'status',
    title: 'Status',
    options: Object.entries(OrderEventStatus).map(([key, value]) => ({
      label: key.replace(/_/g, ' ').toLowerCase(),
      value: value
    }))
  }
]

export const orderSearchableColumns = [
  {
    id: 'id',
    title: 'Order ID'
  }
]
