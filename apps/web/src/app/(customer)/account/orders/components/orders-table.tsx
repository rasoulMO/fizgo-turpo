'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import type {
  customer_addresses,
  order_items,
  OrderEventStatus,
  orders,
  p2p_orders,
  payment_methods,
  payments,
  products,
  user_items,
  users
} from '@prisma/client'
import { format } from 'date-fns'
import { ExternalLink, Truck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

import {
  orderStatusConfig,
  P2POrderStatus,
  p2pStatusConfig
} from './order-status-confing'

// Types
export type OrderItem = order_items & {
  product: products
}

export type OrderPayment = payments & {
  payment_method: payment_methods
}

export type OrderWithRelations = Omit<orders, 'status'> & {
  status: OrderEventStatus
  order_items: OrderItem[]
  payment: OrderPayment | null
  delivery_address: customer_addresses
}

export type P2POrderWithRelations = p2p_orders & {
  status: P2POrderStatus
  item: user_items
  seller: users
  payment: payments | null
}

interface OrdersTableProps {
  orders: OrderWithRelations[]
}

interface P2POrdersTableProps {
  orders: P2POrderWithRelations[]
}

export const OrdersTable: React.FC<OrdersTableProps> = ({ orders }) => {
  const router = useRouter()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Payment Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">
              #{order.id.slice(0, 8)}
            </TableCell>
            <TableCell>
              {order.created_at
                ? format(new Date(order.created_at), 'MMM d, yyyy')
                : 'N/A'}
            </TableCell>
            <TableCell>
              <Badge variant={orderStatusConfig[order.status].variant}>
                {orderStatusConfig[order.status].label}
              </Badge>
            </TableCell>
            <TableCell>${order.total.toString()}</TableCell>
            <TableCell>{order.order_items.length} items</TableCell>
            <TableCell>
              {order.payment && (
                <Badge
                  variant={
                    order.payment.status === 'SUCCEEDED'
                      ? 'success'
                      : 'secondary'
                  }
                >
                  {order.payment.status}
                </Badge>
              )}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/account/orders/${order.id}`)}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Details
                </Button>
                {order.status !== 'DELIVERED' &&
                  order.status !== 'CANCELLED' && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() =>
                        router.push(`/account/orders/${order.id}/track`)
                      }
                    >
                      <Truck className="mr-2 h-4 w-4" />
                      Track
                    </Button>
                  )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export const P2POrdersTable: React.FC<P2POrdersTableProps> = ({ orders }) => {
  const router = useRouter()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Item</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Seller</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">
              #{order.id.slice(0, 8)}
            </TableCell>
            <TableCell>
              {order.created_at
                ? format(new Date(order.created_at), 'MMM d, yyyy')
                : 'N/A'}
            </TableCell>
            <TableCell>{order.item.name}</TableCell>
            <TableCell>
              <Badge variant={p2pStatusConfig[order.status].variant}>
                {p2pStatusConfig[order.status].label}
              </Badge>
            </TableCell>
            <TableCell>${order.total_amount.toString()}</TableCell>
            <TableCell>{order.seller.full_name}</TableCell>
            <TableCell className="text-right">
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/account/p2p-orders/${order.id}`)}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Details
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
