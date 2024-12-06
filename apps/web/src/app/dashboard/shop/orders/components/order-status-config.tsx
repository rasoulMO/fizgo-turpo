import type { OrderEventStatus } from '@prisma/client'
import { Package, Package2, RefreshCcw, ShoppingBag, Truck } from 'lucide-react'

// Define common badge variant types
export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'ghost'
  | 'link'
  | 'success'
  | 'warning'

// Define the P2P order status type
export type P2POrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_CONFIRMED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'

// Status config type definitions
type StatusConfig = {
  readonly label: string
  readonly variant: BadgeVariant
  readonly icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

type P2PStatusConfig = {
  readonly label: string
  readonly variant: BadgeVariant
}

// Define the orderStatusConfig with keys matching the enum values
export const orderStatusConfig: {
  readonly [key in OrderEventStatus]: StatusConfig
} = {
  ORDER_PLACED: {
    label: 'Order Placed',
    variant: 'secondary',
    icon: Package
  },
  PAYMENT_PENDING: {
    label: 'Payment Pending',
    variant: 'secondary',
    icon: Package
  },
  PAYMENT_COMPLETED: {
    label: 'Payment Completed',
    variant: 'default',
    icon: ShoppingBag
  },
  ORDER_CONFIRMED: {
    label: 'Order Confirmed',
    variant: 'default',
    icon: ShoppingBag
  },
  PREPARATION_STARTED: {
    label: 'Preparing',
    variant: 'default',
    icon: RefreshCcw
  },
  READY_FOR_PICKUP: {
    label: 'Ready for Pickup',
    variant: 'default',
    icon: Package
  },
  PICKUP_COMPLETED: {
    label: 'Pickup Completed',
    variant: 'default',
    icon: Truck
  },
  OUT_FOR_DELIVERY: {
    label: 'Out for Delivery',
    variant: 'default',
    icon: Truck
  },
  DELIVERY_ATTEMPTED: {
    label: 'Delivery Attempted',
    variant: 'default',
    icon: Truck
  },
  DELIVERED: {
    label: 'Delivered',
    variant: 'success',
    icon: Package2
  },
  CANCELLED: {
    label: 'Cancelled',
    variant: 'destructive',
    icon: Package2
  },
  REFUND_REQUESTED: {
    label: 'Refund Requested',
    variant: 'warning',
    icon: Package
  },
  REFUND_PROCESSED: {
    label: 'Refund Processed',
    variant: 'warning',
    icon: Package
  }
} as const

// Define the p2pStatusConfig with proper typing
export const p2pStatusConfig: {
  readonly [key in P2POrderStatus]: P2PStatusConfig
} = {
  PENDING_PAYMENT: {
    label: 'Pending Payment',
    variant: 'warning'
  },
  PAYMENT_RECEIVED: {
    label: 'Payment Received',
    variant: 'default'
  },
  PAYMENT_CONFIRMED: {
    label: 'Payment Confirmed',
    variant: 'default'
  },
  SHIPPED: {
    label: 'Shipped',
    variant: 'default'
  },
  DELIVERED: {
    label: 'Delivered',
    variant: 'success'
  },
  CANCELLED: {
    label: 'Cancelled',
    variant: 'destructive'
  }
} as const
