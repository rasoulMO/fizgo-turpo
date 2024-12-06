'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { api } from '@/trpc/react'

import { formatPrice } from '@/utils/format'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'

import { useItemFilters } from './use-item-filters'

export function ItemGrid() {
  const { conditions, priceRange, sortBy } = useItemFilters()
  const { data, isLoading } = api.userItems.getAll.useQuery({
    limit: 20,
    condition: conditions.length > 0 ? conditions[0] : undefined,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    status: 'PUBLISHED'
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="h-[300px] animate-pulse" />
        ))}
      </div>
    )
  }

  const sortedItems = [...(data?.items || [])].sort((a, b) => {
    if (sortBy === 'newest') {
      return (
        new Date(b.created_at || 0).getTime() -
        new Date(a.created_at || 0).getTime()
      )
    }
    if (sortBy === 'price-asc') {
      return Number(a.price) - Number(b.price)
    }
    if (sortBy === 'price-desc') {
      return Number(b.price) - Number(a.price)
    }
    return 0
  })

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {sortedItems.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <Link href={`/items/${item.id}`}>
            <CardHeader className="p-0">
              <div className="relative aspect-square">
                <Image
                  src={
                    Array.isArray(item.images)
                      ? item.images[0]
                      : typeof item.images === 'string'
                        ? JSON.parse(item.images)[0]
                        : ''
                  }
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{item.name}</h3>
                <Badge>{item.condition}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.seller?.full_name}
              </p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <span className="font-bold">
                {formatPrice(item.price.toString())}
              </span>
              {item.is_negotiable && (
                <span className="ml-2 text-sm text-muted-foreground">
                  (Negotiable)
                </span>
              )}
            </CardFooter>
          </Link>
        </Card>
      ))}
    </div>
  )
}
