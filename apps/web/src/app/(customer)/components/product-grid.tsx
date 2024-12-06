'use client'

import Link from 'next/link'
import { api } from '@/trpc/react'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'

import { useProductFilters } from './use-product-filters'

export function ProductGrid() {
  const { categories, gender, priceRange, sortBy } = useProductFilters()

  const { data: productsData, isLoading } = api.product.getAll.useQuery({
    limit: 20,
    category: categories.length > 0 ? categories[0] : undefined, // API needs to be updated to handle multiple categories
    gender: gender || undefined,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    orderBy:
      sortBy === 'newest'
        ? 'created_at'
        : sortBy === 'price-asc'
          ? 'price_asc'
          : sortBy === 'price-desc'
            ? 'price_desc'
            : undefined
  })

  if (isLoading) {
    return <div>Loading products...</div>
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {productsData?.items.map((product) => (
        <Card key={product.id} className="overflow-hidden">
          <Link href={`/${product.id}`}>
            <CardHeader className="p-0">
              {product.images && (
                <img
                  src={JSON.parse(product.images as string)[0]}
                  alt={product.name}
                  className="h-48 w-full object-cover"
                />
              )}
            </CardHeader>
            <CardContent className="p-4">
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-sm text-gray-500">{product.shop?.name}</p>
            </CardContent>
            <CardFooter className="flex items-center justify-between p-4 pt-0">
              <span className="font-bold">
                ${Number(product.price).toFixed(2)}
              </span>
              {product.sale_price && (
                <span className="text-sm text-red-500 line-through">
                  ${Number(product.sale_price).toFixed(2)}
                </span>
              )}
            </CardFooter>
          </Link>
        </Card>
      ))}
    </div>
  )
}
