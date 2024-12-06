import { TaskLabel, TaskPriority, TaskStatus } from '@prisma/client'

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
] as const

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
] as const

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
] as const
