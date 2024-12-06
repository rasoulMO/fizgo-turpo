'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/trpc/react'
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
import { Package2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { P2POrderStatus } from './order-status-confing'
import { OrdersTable, P2POrdersTable } from './orders-table'

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

interface EmptyOrdersProps {
  type: 'regular' | 'p2p'
}

const OrdersSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    ))}
  </div>
)

const EmptyOrders: React.FC<EmptyOrdersProps> = ({ type }) => {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Package2 className="h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-medium">
        No {type === 'regular' ? 'store' : 'P2P'} orders yet
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {type === 'regular'
          ? 'When you place orders from our store, they will appear here.'
          : 'When you purchase items from other users, they will appear here.'}
      </p>
      <Button
        className="mt-4"
        onClick={() => router.push(type === 'regular' ? '/' : '/marketplace')}
      >
        {type === 'regular' ? 'Start Shopping' : 'Browse Marketplace'}
      </Button>
    </div>
  )
}

const OrdersTabs = () => {
  const [activeTab, setActiveTab] = React.useState('store')

  const { data: regularOrders, isLoading: isLoadingRegular } =
    api.order.getUserOrders.useQuery(
      { limit: 10 },
      { enabled: activeTab === 'store' }
    )

  const { data: p2pOrders, isLoading: isLoadingP2P } =
    api.p2p.getUserOrders.useQuery(
      { limit: 10 },
      { enabled: activeTab === 'p2p' }
    )

  return (
    <Tabs
      defaultValue="store"
      className="space-y-4"
      onValueChange={setActiveTab}
    >
      <TabsList className="mb-8 grid w-full grid-cols-2">
        <TabsTrigger value="store">Store Orders</TabsTrigger>
        <TabsTrigger value="p2p">P2P Orders</TabsTrigger>
      </TabsList>

      <TabsContent value="store">
        <Card>
          <CardContent className="px-4">
            {isLoadingRegular ? (
              <OrdersSkeleton />
            ) : regularOrders?.items && regularOrders.items.length > 0 ? (
              <OrdersTable
                orders={regularOrders.items as OrderWithRelations[]}
              />
            ) : (
              <EmptyOrders type="regular" />
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="p2p">
        <Card>
          <CardContent className="px-4">
            {isLoadingP2P ? (
              <OrdersSkeleton />
            ) : p2pOrders?.items && p2pOrders.items.length > 0 ? (
              <P2POrdersTable
                orders={p2pOrders.items as P2POrderWithRelations[]}
              />
            ) : (
              <EmptyOrders type="p2p" />
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

export default OrdersTabs
