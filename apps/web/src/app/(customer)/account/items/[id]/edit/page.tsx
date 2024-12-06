import { Metadata } from 'next'

import { useSupabaseServer } from '@/utils/supabase/server'
import { checkAuth } from '@/utils/utils'

import { EditItemForm } from '../../components/edit-item-form'

export const metadata: Metadata = {
  title: 'Edit Item',
  description: 'Edit your listed item'
}

export default async function EditItemPage({
  params
}: {
  params: { id: string }
}) {
  const supabase = useSupabaseServer()
  const user = await checkAuth(supabase)

  return (
    <div className="container max-w-3xl py-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Edit Item</h1>
        <p className="text-muted-foreground">Update your item&apos;s details</p>
      </div>
      <EditItemForm itemId={params.id} userId={user.id} />
    </div>
  )
}
