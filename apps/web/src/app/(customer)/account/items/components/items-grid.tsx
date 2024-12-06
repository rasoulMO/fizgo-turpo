'use client'

import { api } from '@/trpc/react'
import { ItemCondition, ItemStatus, users } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

import { useToast } from '@/hooks/use-toast'
import { Card } from '@/components/ui/card'

import { ItemCard } from './item-card'

interface ItemsGridProps {
  userId: string
}

export interface Item {
  id: string
  name: string
  description: string | null
  condition: ItemCondition
  price: Decimal
  status: ItemStatus
  images: string[] | null
  brand: string | null
  size: string | null
  color: string | null
  created_at: Date | null
  seller: users | null
  seller_id: string | null
}

export function ItemsGrid({ userId }: ItemsGridProps) {
  const { toast } = useToast()
  const utils = api.useUtils()
  const { data, isLoading } = api.userItems.getAllByUerId.useQuery(userId)

  const publish = api.userItems.publish.useMutation({
    onSuccess: () => {
      toast({ title: 'Item published successfully' })
      utils.userItems.getAllByUerId.invalidate(userId)
    }
  })

  const archive = api.userItems.archive.useMutation({
    onSuccess: () => {
      toast({ title: 'Item archived successfully' })
      utils.userItems.getAllByUerId.invalidate(userId)
    }
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="h-[400px] w-full animate-pulse bg-muted" />
        ))}
      </div>
    )
  }

  if (!data?.length) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No items listed yet</p>
      </div>
    )
  }

  const items: Item[] =
    data?.map((item) => ({
      ...item,
      images: Array.isArray(item.images)
        ? item.images
        : item.images
          ? JSON.parse(item.images as string)
          : null
    })) ?? []

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          onPublish={() => publish.mutate(item.id)}
          onArchive={() => archive.mutate(item.id)}
        />
      ))}
    </div>
  )
}
