'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api } from '@/trpc/react'
import { type Prisma } from '@prisma/client'
import { Edit, Heart, MessageCircle, Share } from 'lucide-react'

import { formatPrice } from '@/utils/format'
import { getImageUrl } from '@/utils/image'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import { ChatProvider } from '../../account/chat/components/chat-context'
import { MakeOfferDialog } from '../../account/chat/components/make-offer'

type ItemWithRelations = Prisma.user_itemsGetPayload<{
  include: {
    seller: true
    likes: true
  }
}>

interface ItemDetailProps {
  item: ItemWithRelations
  initialLikeCount: number
  initialIsLiked: boolean
  userId: string
}

export function ItemDetail({
  item,
  initialLikeCount,
  initialIsLiked,
  userId
}: ItemDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [showOfferDialog, setShowOfferDialog] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  const isOwner = userId === item.seller_id

  const { mutate: toggleLike, isPending: isLikePending } =
    api.userItems.toggleLike.useMutation({
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

  const { mutateAsync: createOffer, isPending: isOfferLoading } =
    api.chat.createOffer.useMutation({
      onSuccess: (result) => {
        router.push(`/account/chat/${result.conversation.id}`)
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to start conversation',
          variant: 'destructive'
        })
      }
    })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleLikeToggle = () => {
    if (!userId) {
      toast({
        title: 'Error',
        description: 'You must be logged in to like items.',
        variant: 'destructive'
      })
      return
    }

    toggleLike({ itemId: item.id })
  }

  const handleContactSeller = async () => {
    if (!userId) {
      toast({
        title: 'Error',
        description: 'You must be logged in to contact sellers.',
        variant: 'destructive'
      })
      return
    }

    try {
      // Create or get existing chat conversation
      await createOffer({
        itemId: item.id,
        offerAmount: Number(item.price),
        message: `Hi, I'm interested in ${item.name}`
      })
    } catch (error) {
      // Error handling is done in the onError callback of useMutation
      console.error('Error contacting seller:', error)
    }
  }

  if (!isMounted) return null

  const itemImages: string[] = Array.isArray(item.images)
    ? item.images
    : typeof item.images === 'string'
      ? JSON.parse(item.images)
      : []

  const getConditionBadgeColor = (condition: string) => {
    const colors = {
      NEW: 'bg-green-500',
      LIKE_NEW: 'bg-blue-500',
      GOOD: 'bg-yellow-500',
      FAIR: 'bg-orange-500',
      POOR: 'bg-red-500'
    }
    return colors[condition as keyof typeof colors] || 'bg-gray-500'
  }

  return (
    <ChatProvider itemId={item.id} currentUserId={userId}>
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg">
              {itemImages.length > 0 ? (
                <Image
                  src={getImageUrl(itemImages[selectedImage])}
                  alt={item.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <Image
                  src=""
                  alt={item.name}
                  fill
                  className="object-cover"
                  priority
                />
              )}
              <Badge className="absolute left-2 top-2">
                {item.status === 'PUBLISHED' ? 'Active' : item.status}
              </Badge>
              <Badge
                className={`absolute right-2 top-2 ${getConditionBadgeColor(
                  item.condition
                )}`}
              >
                {item.condition}
              </Badge>
            </div>
            {itemImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {itemImages.map((image, index) => (
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
                      alt={`${item.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">{item.name}</h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{likeCount} likes</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!isOwner ? (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleLikeToggle}
                      disabled={isLikePending}
                      className={
                        isLiked ? 'text-red-500 hover:text-red-600' : ''
                      }
                    >
                      <Heart
                        className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`}
                      />
                    </Button>
                  ) : null}
                  <Button variant="outline" size="icon">
                    <Share className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-2xl font-bold text-primary">
                {formatPrice(item.price.toString())}
                {item.is_negotiable && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    (Negotiable)
                  </span>
                )}
              </p>
              <p className="text-muted-foreground">{item.description}</p>
            </div>

            <Separator />

            {/* Specifications */}
            <div className="space-y-4">
              {/* Size */}
              {item.size && (
                <div className="space-y-2">
                  <h3 className="font-medium">Size</h3>
                  <Badge variant="secondary">{item.size}</Badge>
                </div>
              )}

              {/* Color */}
              {item.color && (
                <div className="space-y-2">
                  <h3 className="font-medium">Color</h3>
                  <Badge variant="secondary">{item.color}</Badge>
                </div>
              )}

              {/* Dimensions */}
              {(item.length || item.width || item.height) && (
                <div className="space-y-2">
                  <h3 className="font-medium">Dimensions</h3>
                  <div className="flex flex-wrap gap-2">
                    {item.length && (
                      <Badge variant="secondary">Length: {item.length}</Badge>
                    )}
                    {item.width && (
                      <Badge variant="secondary">Width: {item.width}</Badge>
                    )}
                    {item.height && (
                      <Badge variant="secondary">Height: {item.height}</Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Materials */}
              {item.materials && item.materials.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium">Materials</h3>
                  <div className="flex flex-wrap gap-2">
                    {item.materials.map((material) => (
                      <Badge key={material} variant="secondary">
                        {material}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Seller Info */}
            <div className="flex items-center space-x-4">
              <div className="relative h-12 w-12">
                <Image
                  src={item.seller?.avatar_url || ''}
                  alt={item.seller?.full_name || 'Seller'}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div>
                <p className="font-semibold">{item.seller?.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  Listed on{' '}
                  {new Date(item.created_at ?? new Date()).toLocaleDateString()}
                </p>
              </div>
            </div>

            {isOwner ? (
              <div className="flex gap-4">
                <Button asChild className="flex-1">
                  <Link href={`/items/${item.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Item
                  </Link>
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            ) : (
              <div className="flex gap-4">
                {item.is_negotiable ? (
                  <>
                    <Button
                      className="flex-1"
                      onClick={() => setShowOfferDialog(true)}
                      disabled={isOfferLoading}
                    >
                      Make Offer
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleContactSeller}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Contact Seller
                    </Button>
                  </>
                ) : (
                  <Button className="flex-1" onClick={handleContactSeller}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Contact Seller
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <MakeOfferDialog
          itemPrice={Number(item.price)}
          open={showOfferDialog}
          onOpenChange={setShowOfferDialog}
        />
      </div>
    </ChatProvider>
  )
}
