'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { api } from '@/trpc/react'
import { type Prisma } from '@prisma/client'
import { Heart, Share } from 'lucide-react'

import { formatPrice } from '@/utils/format'
import { getImageUrl } from '@/utils/image'
import { useCartActions } from '@/hooks/use-card-action'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

type ProductWithRelations = Prisma.productsGetPayload<{
  include: {
    shop: true
    specifications: true
    likes: true
  }
}>

interface ProductDetailProps {
  product: ProductWithRelations
  initialLikeCount: number
  initialIsLiked: boolean
  userId: string
}

export function ProductDetail({
  product,
  initialLikeCount,
  initialIsLiked,
  userId
}: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)

  const router = useRouter()
  const { addItem } = useCartActions()
  const { toast } = useToast()

  const { mutate: toggleLike, isPending } = api.product.toggleLike.useMutation({
    onSuccess: () => {
      setIsLiked(!isLiked)
      setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1))
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update like status',
        variant: 'destructive'
      })
    }
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleLikeToggle = async () => {
    if (!userId) {
      toast({
        title: 'Error',
        description: 'You must be logged in to like products.',
        variant: 'destructive'
      })
      return
    }

    toggleLike({ productId: product.id })
  }

  const handleAddToCart = async () => {
    try {
      await addItem(product, 1)
      toast({
        title: 'Added to cart',
        description: `${product.name} has been added to your cart.`
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add item to cart. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const handleBuyNow = async () => {
    try {
      await addItem(product, 1)
      router.push('/checkout')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process. Please try again.',
        variant: 'destructive'
      })
    }
  }

  if (!isMounted) return null

  // Parse images from JSON if needed
  const productImages = product.images
    ? ((typeof product.images === 'string'
        ? JSON.parse(product.images)
        : product.images) as string[])
    : []

  const specification = product.specifications

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg">
            {productImages.length > 0 ? (
              <Image
                src={getImageUrl(productImages[selectedImage])}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <Image
                src=""
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            )}
            {product.sale_price && (
              <Badge className="absolute left-2 top-2">Sale</Badge>
            )}
            {!product.is_available && (
              <Badge variant="secondary" className="absolute right-2 top-2">
                Out of Stock
              </Badge>
            )}
          </div>
          {productImages.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {productImages.map((image: string, index: number) => (
                <button
                  key={image}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square overflow-hidden rounded-lg ${
                    selectedImage === index
                      ? 'ring-2 ring-primary'
                      : 'hover:opacity-75'
                  }`}
                >
                  <Image
                    src={getImageUrl(image)}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">{product.name}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{likeCount} likes</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleLikeToggle}
                  disabled={isPending}
                  className={isLiked ? 'text-red-500 hover:text-red-600' : ''}
                >
                  <Heart
                    className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`}
                  />
                </Button>
                <Button variant="outline" size="icon">
                  <Share className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-primary">
                {formatPrice(
                  product.sale_price?.toString() || product.price.toString()
                )}
              </p>
              {product.sale_price && (
                <p className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.price.toString())}
                </p>
              )}
            </div>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          <Separator />

          {/* Specifications */}
          <div className="space-y-4">
            {/* Sizes */}
            {specification?.available_sizes &&
              specification.available_sizes.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium">Available Sizes</h3>
                  <div className="flex flex-wrap gap-2">
                    {specification.available_sizes.map((size: string) => (
                      <Badge key={size} variant="secondary">
                        {size}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

            {/* Colors */}
            {specification?.colors && specification.colors.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium">Colors</h3>
                <div className="flex flex-wrap gap-2">
                  {specification.colors.map((color: string) => (
                    <Badge key={color} variant="secondary">
                      {color}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Materials */}
            {specification?.materials && specification.materials.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium">Materials</h3>
                <div className="flex flex-wrap gap-2">
                  {specification.materials.map((material: string) => (
                    <Badge key={material} variant="secondary">
                      {material}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Dimensions */}
            {(specification?.height ||
              specification?.width ||
              specification?.length) && (
              <div className="space-y-2">
                <h3 className="font-medium">Dimensions</h3>
                <div className="grid grid-cols-3 gap-4">
                  {specification.height && (
                    <div>
                      <p className="text-sm text-muted-foreground">Height</p>
                      <p>{specification.height}</p>
                    </div>
                  )}
                  {specification.width && (
                    <div>
                      <p className="text-sm text-muted-foreground">Width</p>
                      <p>{specification.width}</p>
                    </div>
                  )}
                  {specification.length && (
                    <div>
                      <p className="text-sm text-muted-foreground">Length</p>
                      <p>{specification.length}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Shop Info */}
          <div className="flex items-center space-x-4">
            <div className="relative h-12 w-12">
              <Image
                src={product.shop?.logo_url || ''}
                alt={product.shop?.name || 'Shop'}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div>
              <p className="font-semibold">{product.shop?.name}</p>
              <p className="text-sm text-muted-foreground">
                Listed on{' '}
                {product.created_at
                  ? new Date(product.created_at).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              className="flex-1"
              onClick={handleBuyNow}
              disabled={!product.is_available}
            >
              Buy Now
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={!product.is_available}
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
