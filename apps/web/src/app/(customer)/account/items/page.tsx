import Link from 'next/link'

import { useSupabaseServer } from '@/utils/supabase/server'
import { checkAuth } from '@/utils/utils'
import { Button } from '@/components/ui/button'

import { ItemsGrid } from './components/items-grid'

export default async function MyItemsPage() {
  const supabase = useSupabaseServer()
  const user = await checkAuth(supabase)

  return (
    <div className="container">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Items</h2>
          <p className="text-muted-foreground">
            Manage and track your listed items
          </p>
        </div>
        <Button asChild>
          <Link href="/account/items/new">List New Item</Link>
        </Button>
      </div>
      <ItemsGrid userId={user.id} />
    </div>
  )
}
