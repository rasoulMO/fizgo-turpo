'use client'

import { ColumnDef } from '@tanstack/react-table'
import { formatDistanceToNow } from 'date-fns'

import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'
import { shops, ShopStatus } from '@prisma/client'

export const shopColumns: ColumnDef<shops>[] = [
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
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Shop Name" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('name')}</div>
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
      const status = row.getValue('status') as ShopStatus
      return (
        <Badge
          className={
            status === 'ACTIVE'
              ? 'bg-green-400 text-green-800'
              : status === 'PENDING'
                ? 'bg-yellow-400 text-yellow-800'
                : 'bg-red-400 text-red-800'
          }
        >
          {status.toLowerCase()}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
    cell: ({ row }) => <div>{row.getValue('phone')}</div>
  },
  {
    accessorKey: 'address',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Address" />
    ),
    cell: ({ row }) => <div>{row.getValue('address')}</div>
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate">
        {row.getValue('description')}
      </div>
    )
  },
  {
    accessorKey: 'business_hours',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Business Hours" />
    ),
    cell: ({ row }) => {
      const hours = row.getValue('business_hours') as Record<string, string>
      return (
        <div className="max-w-[200px] truncate">
          {hours ? JSON.stringify(hours) : 'Not set'}
        </div>
      )
    }
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const date = row.getValue('created_at') as Date
      return date ? (
        <div>{formatDistanceToNow(date, { addSuffix: true })}</div>
      ) : (
        <div>-</div>
      )
    },
    sortingFn: 'datetime'
  },
  {
    accessorKey: 'updated_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Updated" />
    ),
    cell: ({ row }) => {
      const date = row.getValue('updated_at') as Date
      return date ? (
        <div>{formatDistanceToNow(date, { addSuffix: true })}</div>
      ) : (
        <div>-</div>
      )
    },
    sortingFn: 'datetime'
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />
  }
]

export const shopFilterableColumns = [
  {
    id: 'status',
    title: 'Status',
    options: [
      { value: 'ACTIVE', label: 'Active' },
      { value: 'PENDING', label: 'Pending' },
      { value: 'SUSPENDED', label: 'Suspended' }
    ]
  }
]

export const shopSearchableColumns = [
  {
    id: 'name',
    title: 'Shop Name'
  }
]