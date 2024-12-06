// app/admin/delivery-partners/components/columns.tsx
'use client'

import { DeliveryPartnerApplicationStatus } from '@prisma/client'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'

import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'

import { DataTableRowActions } from './data-table-row-actions'

// Define status styles
const statusStyles = {
  DRAFT: { label: 'Draft', variant: 'secondary' },
  SUBMITTED: { label: 'Submitted', variant: 'warning' },
  UNDER_REVIEW: { label: 'Under Review', variant: 'info' },
  APPROVED: { label: 'Approved', variant: 'success' },
  REJECTED: { label: 'Rejected', variant: 'destructive' }
} as const

export const deliveryPartnerColumns: ColumnDef<any>[] = [
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
    accessorKey: 'application_number',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Application #" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('application_number')}</div>
    )
  },
  {
    accessorKey: 'full_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Applicant" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue('full_name')}</span>
          <span className="text-xs text-muted-foreground">
            {row.original.email}
          </span>
        </div>
      )
    }
  },
  {
    accessorKey: 'vehicle_type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vehicle" />
    ),
    cell: ({ row }) => {
      const vehicleType = row.getValue('vehicle_type') as string
      const vehicleMake = row.original.vehicle_make
      const vehicleModel = row.original.vehicle_model

      return (
        <div className="flex flex-col">
          <span className="font-medium">
            {vehicleType.charAt(0) + vehicleType.slice(1).toLowerCase()}
          </span>
          {vehicleMake && vehicleModel && (
            <span className="text-xs text-muted-foreground">
              {vehicleMake} {vehicleModel}
            </span>
          )}
        </div>
      )
    }
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status =
        statusStyles[row.getValue('status') as DeliveryPartnerApplicationStatus]
      return <Badge variant={status.variant}>{status.label}</Badge>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'submitted_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Submitted" />
    ),
    cell: ({ row }) => {
      const date = row.getValue('submitted_at')
      if (!date)
        return <span className="text-muted-foreground">Not submitted</span>
      return format(new Date(date as string), 'MMM d, yyyy')
    }
  },
  {
    accessorKey: 'reviewer',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Reviewed By" />
    ),
    cell: ({ row }) => {
      const reviewer = row.original.reviewer
      const reviewDate = row.original.reviewed_at

      if (!reviewer) return <span className="text-muted-foreground">-</span>

      return (
        <div className="flex flex-col">
          <span>{reviewer.full_name || 'Unknown'}</span>
          {reviewDate && (
            <span className="text-xs text-muted-foreground">
              {format(new Date(reviewDate), 'MMM d, yyyy')}
            </span>
          )}
        </div>
      )
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />
  }
]

export const deliveryPartnerFilterableColumns = [
  {
    id: 'status',
    title: 'Status',
    options: [
      { value: 'DRAFT', label: 'Draft' },
      { value: 'SUBMITTED', label: 'Submitted' },
      { value: 'UNDER_REVIEW', label: 'Under Review' },
      { value: 'APPROVED', label: 'Approved' },
      { value: 'REJECTED', label: 'Rejected' }
    ]
  },
  {
    id: 'vehicle_type',
    title: 'Vehicle Type',
    options: [
      { value: 'BICYCLE', label: 'Bicycle' },
      { value: 'MOTORCYCLE', label: 'Motorcycle' },
      { value: 'CAR', label: 'Car' },
      { value: 'VAN', label: 'Van' }
    ]
  }
]

export const deliveryPartnerSearchableColumns = [
  {
    id: 'application_number',
    title: 'Application #'
  },
  {
    id: 'full_name',
    title: 'Full Name'
  },
  {
    id: 'email',
    title: 'Email'
  }
]
