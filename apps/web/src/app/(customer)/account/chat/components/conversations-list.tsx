'use client'

import Image from 'next/image'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

import { formatPrice } from '@/utils/format'
import { getAvatarUrl, getImageUrl } from '@/utils/image'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

interface ConversationsListProps {
  conversations: any[]
  currentUserId: string
}

export function ConversationsList({
  conversations,
  currentUserId
}: ConversationsListProps) {
  return (
    <div className="space-y-4">
      {conversations.map((conversation) => {
        const isBuyer = currentUserId === conversation.buyer_id
        const otherUser = isBuyer ? conversation.seller : conversation.buyer
        const latestMessage = conversation.messages[0]
        const itemImage = Array.isArray(conversation.item?.images)
          ? conversation.item.images[0]
          : typeof conversation.item?.images === 'string'
            ? JSON.parse(conversation.item.images)[0]
            : null

        return (
          <Card
            key={conversation.id}
            className="transition-colors hover:bg-muted/50"
          >
            <Link
              href={`/account/chat/${conversation.id}`}
              className="flex items-center gap-4 p-4"
            >
              <div className="relative h-16 w-16">
                <Image
                  src={
                    itemImage
                      ? getImageUrl(itemImage)
                      : '/placeholder-avatar.png'
                  }
                  alt={conversation.item?.name || 'Item'}
                  fill
                  className="rounded-md object-cover"
                  sizes="(max-width: 64px) 100vw, 64px"
                />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{conversation.item?.name}</h3>
                  <Badge variant="outline">
                    {formatPrice(conversation.item?.price)}
                  </Badge>
                </div>

                {latestMessage && (
                  <p className="line-clamp-1 text-sm text-muted-foreground">
                    {latestMessage.content}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="relative h-6 w-6">
                      <Image
                        src={getAvatarUrl(otherUser?.avatar_url)}
                        alt={otherUser?.full_name || 'User'}
                        fill
                        className="rounded-full object-cover"
                        sizes="(max-width: 24px) 100vw, 24px"
                      />
                    </div>
                    <span>{otherUser?.full_name}</span>
                  </div>

                  {latestMessage && (
                    <span>
                      {formatDistanceToNow(new Date(latestMessage.created_at), {
                        addSuffix: true
                      })}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </Card>
        )
      })}
    </div>
  )
}
