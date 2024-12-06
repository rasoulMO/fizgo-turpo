import { useSupabaseServer } from '@/utils/supabase/server'
import { checkAuth } from '@/utils/utils'

import OrdersTabs from './components/orders-tabs'

export default async function OrdersPage() {
  const supabase = useSupabaseServer()
  await checkAuth(supabase)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Orders</h2>
          <p className="text-muted-foreground">
            View and manage your order history
          </p>
        </div>
      </div>
      <OrdersTabs />
    </div>
  )
}
