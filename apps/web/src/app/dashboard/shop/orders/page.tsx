import { api } from '@/trpc/server'
import type { orders } from '@prisma/client'

import { useSupabaseServer } from '@/utils/supabase/server'
import { checkAuth } from '@/utils/utils'
import { DataTable } from '@/components/data-table'

import {
  orderColumns,
  orderFilterableColumns,
  orderSearchableColumns
} from './components/columns'

export default async function OrdersPage() {
  const supabase = useSupabaseServer()
  await checkAuth(supabase)

  const { items } = await api.order.getShopOrders({
    limit: 100
  })

  const ordersWithoutRelations: orders[] = items.map(
    ({ order_items, delivery_address, payment, ...order }) => order
  )

  return (
    <div className="container py-8">
      <div className="grid gap-8">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track your shop orders
          </p>
        </div>

        <DataTable
          columns={orderColumns}
          data={ordersWithoutRelations}
          filterableColumns={orderFilterableColumns}
          searchableColumns={orderSearchableColumns}
        />
      </div>
    </div>
  )
}
