import { Metadata } from 'next'

import { useSupabaseServer } from '@/utils/supabase/server'
import { checkAuth } from '@/utils/utils'

import AddItemForm from '../components/add-item-form'

export const metadata: Metadata = {
  title: 'List Your Item',
  description: 'List your clothing item for sale in the marketplace'
}

export default async function NewItemPage() {
  const supabase = useSupabaseServer()
  const user = await checkAuth(supabase)

  return (
    <div className="container max-w-3xl py-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">List Your Item</h1>
        <p className="text-muted-foreground">
          Fill in the details below to list your item in the marketplace
        </p>
        <AddItemForm userId={user.id} />
      </div>
    </div>
  )
}
