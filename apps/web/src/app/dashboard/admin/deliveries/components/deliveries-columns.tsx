'use client'

import { ColumnDef } from '@tanstack/react-table'
import { format, formatDistanceToNow, parseISO } from 'date-fns'

import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'

import { DataTableRowActions } from './data-table-row-actions'

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

// Helper function to format location from JSON
const formatLocation = (location: Record<string, any>) => {
  try {
    const parts = [
      location.street,
      location.city,
      location.state,
      location.postal_code
    ].filter(Boolean)
    return parts.join(', ')
  } catch (error) {
    return 'Invalid address'
  }
}

// Helper function to get status badge styling
const getStatusStyles = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'assigned':
      return 'bg-blue-100 text-blue-800'
    case 'picked_up':
      return 'bg-purple-100 text-purple-800'
    case 'in_transit':
      return 'bg-orange-100 text-orange-800'
    case 'delivered':
      return 'bg-green-100 text-green-800'
    case 'failed':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export const deliveryColumns: ColumnDef<any>[] = [
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
    accessorKey: 'tracking_number',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tracking #" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">
        {row.getValue('tracking_number') || 'N/A'}
      </div>
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
    accessorKey: 'pickup_location',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pickup Location" />
    ),
    cell: ({ row }) => {
      const location = row.getValue('pickup_location') as Record<string, any>
      return (
        <div
          className="max-w-[200px] truncate"
          title={formatLocation(location)}
        >
          {formatLocation(location)}
        </div>
      )
    }
  },
  {
    accessorKey: 'delivery_location',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Delivery Location" />
    ),
    cell: ({ row }) => {
      const location = row.getValue('delivery_location') as Record<string, any>
      return (
        <div
          className="max-w-[200px] truncate"
          title={formatLocation(location)}
        >
          {formatLocation(location)}
        </div>
      )
    }
  },
  {
    accessorKey: 'estimated_pickup_time',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Est. Pickup" />
    ),
    cell: ({ row }) => {
      const dateString = row.getValue('estimated_pickup_time') as string | null
      const formatted = formatDate(dateString)

      if (!formatted) return <div className="text-gray-500">-</div>

      return <div title={formatted.full}>{formatted.relative}</div>
    }
  },
  {
    accessorKey: 'actual_pickup_time',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Actual Pickup" />
    ),
    cell: ({ row }) => {
      const dateString = row.getValue('actual_pickup_time') as string | null
      const formatted = formatDate(dateString)

      if (!formatted) return <div className="text-gray-500">-</div>

      return <div title={formatted.full}>{formatted.relative}</div>
    }
  },
  {
    accessorKey: 'estimated_delivery_time',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Est. Delivery" />
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

export const filterableColumns = [
  {
    id: 'status',
    title: 'Status',
    options: [
      { value: 'pending', label: 'Pending' },
      { value: 'assigned', label: 'Assigned' },
      { value: 'picked_up', label: 'Picked Up' },
      { value: 'in_transit', label: 'In Transit' },
      { value: 'delivered', label: 'Delivered' },
      { value: 'failed', label: 'Failed' }
    ]
  }
]

export const searchableColumns = [
  {
    id: 'tracking_number',
    title: 'Tracking Number'
  }
]
