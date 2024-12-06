'use client'

import React, { useState } from 'react'
import { api } from '@/trpc/react'
import { Heart, Loader2, Package, Store } from 'lucide-react'

import { formatPrice } from '@/utils/format'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const FavoritesPage = () => {
  const [activeTab, setActiveTab] = useState('products')
  const { toast } = useToast()
  const utils = api.useUtils()

  const { data: likedProducts, isLoading: isLoadingProducts } =
    api.favorites.getLikedProducts.useQuery()
  const { data: likedItems, isLoading: isLoadingItems } =
    api.favorites.getLikedItems.useQuery()

  const toggleProductLike = api.favorites.toggleProductLike.useMutation({
    onSuccess: () => {
      utils.favorites.getLikedProducts.invalidate()
    }
  })

  const toggleItemLike = api.favorites.toggleItemLike.useMutation({
    onSuccess: () => {
      utils.favorites.getLikedItems.invalidate()
    }
  })

  const handleUnlikeProduct = async (productId: string) => {
    try {
      await toggleProductLike.mutateAsync({ productId })
      toast({
        description: 'Product removed from favorites',
        variant: 'default'
      })
    } catch (error) {
      toast({
        description: 'Failed to remove product from favorites',
        variant: 'destructive'
      })
    }
  }

  const handleUnlikeItem = async (itemId: string) => {
    try {
      await toggleItemLike.mutateAsync({ itemId })
      toast({
        description: 'Item removed from favorites',
        variant: 'default'
      })
    } catch (error) {
      toast({
        description: 'Failed to remove item from favorites',
        variant: 'destructive'
      })
    }
  }

  if (isLoadingProducts || isLoadingItems) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container max-w-4xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Your Favorites</h2>
        <p className="text-muted-foreground">
          View and manage your liked products and items.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8 grid w-full grid-cols-2">
          <TabsTrigger value="products">
            <Store className="mr-2 h-4 w-4" />
            Liked Products
          </TabsTrigger>
          <TabsTrigger value="items">
            <Package className="mr-2 h-4 w-4" />
            Liked Items
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Liked Products</CardTitle>
              <CardDescription>
                Products you've liked from shops
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!likedProducts?.length ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Heart className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-lg font-medium">No liked products yet</p>
                  <p className="text-sm text-muted-foreground">
                    Products you like will appear here
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {likedProducts.map((product) => (
                    <Card key={product.id} className="group overflow-hidden">
                      <div className="relative aspect-square">
                        <img
                          src={
                            (product.images as any)?.[0] ||
                            '/api/placeholder/400/400'
                          }
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100"
                          onClick={() => handleUnlikeProduct(product.id)}
                        >
                          <Heart className="h-4 w-4 fill-current" />
                        </Button>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="line-clamp-1 font-medium">
                          {product.name}
                        </h3>
                        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                          {product.shop?.name}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <p className="font-medium">
                            {formatPrice(product.price.toString())}
                          </p>
                          {product.sale_price && (
                            <p className="text-sm text-red-500">
                              Sale: {formatPrice(product.sale_price.toString())}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items">
          <Card>
            <CardHeader>
              <CardTitle>Liked Items</CardTitle>
              <CardDescription>
                Items you've liked from other users
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!likedItems?.length ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Heart className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-lg font-medium">No liked items yet</p>
                  <p className="text-sm text-muted-foreground">
                    Items you like will appear here
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {likedItems.map((item) => (
                    <Card key={item.id} className="group overflow-hidden">
                      <div className="relative aspect-square">
                        <img
                          src={
                            (item.images as any)?.[0] ||
                            '/api/placeholder/400/400'
                          }
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100"
                          onClick={() => handleUnlikeItem(item.id)}
                        >
                          <Heart className="h-4 w-4 fill-current" />
                        </Button>
                        <div className="absolute bottom-2 right-2 rounded-full bg-white px-2 py-1 text-xs font-medium">
                          {item.condition}
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="line-clamp-1 font-medium">
                          {item.name}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {item.description}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <p className="font-medium">
                            {formatPrice(item.price.toString())}
                          </p>
                          {item.is_negotiable && (
                            <span className="text-xs text-muted-foreground">
                              Negotiable
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default FavoritesPage
