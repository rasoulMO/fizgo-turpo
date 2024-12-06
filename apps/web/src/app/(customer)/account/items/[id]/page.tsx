import { notFound } from 'next/navigation'
import { api } from '@/trpc/server'

import { useSupabaseServer } from '@/utils/supabase/server'
import { checkAuth } from '@/utils/utils'

import { ItemDetail } from '../components/item-detail'

interface ItemPageProps {
  params: {
    id: string
  }
}

export default async function ItemPage({ params }: ItemPageProps) {
  const supabase = useSupabaseServer()
  const user = await checkAuth(supabase)
  const item = await api.userItems.getById(params.id)

  if (!item) {
    return notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ItemDetail
        item={item}
        initialLikeCount={3}
        initialIsLiked={false}
        userId={user.id}
      />
    </div>
  )
}