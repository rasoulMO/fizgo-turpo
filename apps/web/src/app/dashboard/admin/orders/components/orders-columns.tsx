'use client'

import { ColumnDef } from '@tanstack/react-table'
import { format, formatDistanceToNow, parseISO } from 'date-fns'

import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'

import { DataTableRowActions } from './data-table-row-actions'

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'pending_payment':
      return 'bg-yellow-100 text-yellow-800'
    case 'payment_confirmed':
      return 'bg-blue-100 text-blue-800'
    case 'preparing':
      return 'bg-purple-100 text-purple-800'
    case 'ready_for_pickup':
      return 'bg-indigo-100 text-indigo-800'
    case 'in_transit':
      return 'bg-orange-100 text-orange-800'
    case 'delivered':
      return 'bg-green-100 text-green-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Helper function to safely format dates
const formatDate = (dateString: string | null) => {
  if (!dateString) return null
  try {
    const date = parseISO(dateString)
    return {
      relative: formatDistanceToNow(date, { addSuffix: true }),
      full: format(date, 'PPpp')
    }
  } catch (error) {
    return null
  }
}

export const orderColumns: ColumnDef<any>[] = [
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
    accessorKey: 'order_number',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order Number" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('order_number')}</div>
    ),
    enableSorting: true,
    enableHiding: false
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <Badge className={getStatusStyles(status)}>
          {status?.replace('_', ' ').toUpperCase() || 'N/A'}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'total_price',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total" />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('total_price'))
      return <div className="font-medium">{formatCurrency(amount)}</div>
    },
    sortingFn: 'basic'
  },
  {
    accessorKey: 'delivery_address',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Delivery Address" />
    ),
    cell: ({ row }) => {
      const address = row.getValue('delivery_address') as Record<string, string>
      return (
        <div className="max-w-[200px] truncate">
          {address?.street
            ? `${address.street}, ${address.city}`
            : 'No address'}
        </div>
      )
    }
  },
  {
    accessorKey: 'estimated_delivery_time',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estimated Delivery" />
    ),
    cell: ({ row }) => {
      const dateString = row.getValue('estimated_delivery_time') as
        | string
        | null
      const formatted = formatDate(dateString)

      if (!formatted) return <div className="text-gray-500">-</div>

      return <div title={formatted.full}>{formatted.relative}</div>
    }
  },
  {
    accessorKey: 'actual_delivery_time',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Actual Delivery" />
    ),
    cell: ({ row }) => {
      const dateString = row.getValue('actual_delivery_time') as string | null
      const formatted = formatDate(dateString)

      if (!formatted) return <div className="text-gray-500">-</div>

      return <div title={formatted.full}>{formatted.relative}</div>
    }
  },
  {
    accessorKey: 'delivery_notes',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Notes" />
    ),
    cell: ({ row }) => {
      const notes = row.getValue('delivery_notes') as string
      return notes ? (
        <div className="max-w-[200px] truncate" title={notes}>
          {notes}
        </div>
      ) : (
        <div className="text-gray-500">-</div>
      )
    }
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const dateString = row.getValue('created_at') as string | null
      const formatted = formatDate(dateString)

      if (!formatted) return <div className="text-gray-500">-</div>

      return <div title={formatted.full}>{formatted.relative}</div>
    },
    sortingFn: 'datetime'
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
    options: [
      { value: 'pending_payment', label: 'Pending Payment' },
      { value: 'payment_confirmed', label: 'Payment Confirmed' },
      { value: 'preparing', label: 'Preparing' },
      { value: 'ready_for_pickup', label: 'Ready for Pickup' },
      { value: 'in_transit', label: 'In Transit' },
      { value: 'delivered', label: 'Delivered' },
      { value: 'cancelled', label: 'Cancelled' }
    ]
  }
]

export const orderSearchableColumns = [
  {
    id: 'order_number',
    title: 'Order Number'
  },
  {
    id: 'delivery_notes',
    title: 'Delivery Notes'
  }
]
