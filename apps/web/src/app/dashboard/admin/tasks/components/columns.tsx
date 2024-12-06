'use client'

import { TaskLabel, TaskPriority, TaskStatus } from '@prisma/client'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'

import { Task } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const statuses = [
  {
    value: TaskStatus.TODO,
    label: 'Todo',
    variant: 'secondary'
  },
  {
    value: TaskStatus.IN_PROGRESS,
    label: 'In Progress',
    variant: 'default'
  },
  {
    value: TaskStatus.BLOCKED,
    label: 'Blocked',
    variant: 'destructive'
  },
  {
    value: TaskStatus.COMPLETED,
    label: 'Completed',
    variant: 'success'
  },
  {
    value: TaskStatus.CANCELLED,
    label: 'Cancelled',
    variant: 'secondary'
  }
]

export const priorities = [
  {
    value: TaskPriority.LOW,
    label: 'Low',
    variant: 'secondary'
  },
  {
    value: TaskPriority.MEDIUM,
    label: 'Medium',
    variant: 'default'
  },
  {
    value: TaskPriority.HIGH,
    label: 'High',
    variant: 'destructive'
  },
  {
    value: TaskPriority.URGENT,
    label: 'Urgent',
    variant: 'destructive'
  }
]

export const labels = [
  {
    value: TaskLabel.PLATFORM_ISSUE,
    label: 'Platform Issue'
  },
  {
    value: TaskLabel.SHOP_MANAGEMENT,
    label: 'Shop Management'
  },
  {
    value: TaskLabel.ORDER_MANAGEMENT,
    label: 'Order Management'
  },
  {
    value: TaskLabel.DELIVERY_MANAGEMENT,
    label: 'Delivery Management'
  },
  {
    value: TaskLabel.CUSTOMER_SERVICE,
    label: 'Customer Service'
  },
  {
    value: TaskLabel.SUPPORT,
    label: 'Support'
  },
  {
    value: TaskLabel.INVENTORY,
    label: 'Inventory'
  },
  {
    value: TaskLabel.BUG,
    label: 'Bug'
  },
  {
    value: TaskLabel.FEATURE,
    label: 'Feature'
  },
  {
    value: TaskLabel.USER_MANAGEMENT,
    label: 'User Management'
  },
  {
    value: TaskLabel.NEW_ORDER,
    label: 'New Order'
  },
  {
    value: TaskLabel.DELIVERY_PICKUP,
    label: 'Delivery Pickup'
  },
  {
    value: TaskLabel.DELIVERY_ISSUE,
    label: 'Delivery Issue'
  }
]

export const tasksColumns: ColumnDef<Task>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
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
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue('title')}
          </span>
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
      const status = statuses.find(
        (status) => status.value === row.getValue('status')
      )

      if (!status) {
        return null
      }

      return (
        <div className="flex w-[100px] items-center">
          <Badge
            variant={
              status.value === 'COMPLETED'
                ? 'success'
                : status.value === 'BLOCKED'
                  ? 'destructive'
                  : status.value === 'IN_PROGRESS'
                    ? 'default'
                    : 'secondary'
            }
          >
            {status.label}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'priority',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Priority" />
    ),
    cell: ({ row }) => {
      const priority = priorities.find(
        (priority) => priority.value === row.getValue('priority')
      )

      if (!priority) {
        return null
      }

      return (
        <div className="flex items-center">
          <Badge
            variant={
              priority.value === 'URGENT'
                ? 'destructive'
                : priority.value === 'HIGH'
                  ? 'default'
                  : 'secondary'
            }
          >
            {priority.label}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'label',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Label" />
    ),
    cell: ({ row }) => {
      const label = labels.find(
        (label) => label.value === row.getValue('label')
      )

      if (!label) {
        return null
      }

      return (
        <div className="flex w-[100px] items-center">
          <Badge variant="outline">{label.label}</Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'assignee',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Assignee" />
    ),
    cell: ({ row }) => {
      const assignee = row.original.assignee

      if (!assignee) {
        return <span className="text-muted-foreground">Unassigned</span>
      }

      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={assignee.avatar_url || ''}
              alt={assignee.full_name || ''}
            />
            <AvatarFallback>{assignee.full_name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <span>{assignee.full_name}</span>
        </div>
      )
    }
  },
  {
    accessorKey: 'due_date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Due Date" />
    ),
    cell: ({ row }) => {
      const due_date = row.getValue('due_date') as string | null

      if (!due_date) {
        return <span className="text-muted-foreground">No due date</span>
      }

      return (
        <div className="flex items-center">
          {format(new Date(due_date), 'MMM dd, yyyy')}
        </div>
      )
    }
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
    options: statuses
  },
  {
    id: 'priority',
    title: 'Priority',
    options: priorities
  },
  {
    id: 'label',
    title: 'Label',
    options: labels
  }
]

export const searchableColumns = [
  {
    id: 'title',
    title: 'Title'
  }
]
