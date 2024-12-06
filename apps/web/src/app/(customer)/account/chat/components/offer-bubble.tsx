import Image from 'next/image'
import { OfferStatus } from '@prisma/client'
import { formatDistanceToNow } from 'date-fns'

import { cn } from '@/utils/cn'
import { formatPrice } from '@/utils/format'
import { Button } from '@/components/ui/button'

interface OfferBubbleProps {
  message: any
  isSender: boolean
  isBuyer: boolean
  onRespond?: (offerId: string, status: OfferStatus) => void
}

export function OfferBubble({
  message,
  isSender,
  isBuyer,
  onRespond
}: OfferBubbleProps) {
  return (
    <div
      className={cn('flex gap-2', {
        'flex-row-reverse': isSender
      })}
    >
      <div className="relative h-8 w-8 flex-shrink-0">
        <Image
          src={message.sender?.avatar_url || '/placeholder-avatar.png'}
          alt={message.sender?.full_name}
          fill
          className="rounded-full object-cover"
        />
      </div>
      <div
        className={cn('flex max-w-[80%] flex-col gap-1', {
          'items-end': isSender
        })}
      >
        <div
          className={cn('rounded-lg border p-4', {
            'bg-primary/5': isSender,
            'bg-muted': !isSender
          })}
        >
          <div className="mb-2 flex items-center justify-between gap-4">
            <span className="font-medium">
              Offer: {formatPrice(parseFloat(message.offer.offer_amount))}
            </span>
            <span
              className={cn('text-sm', {
                'text-green-600': message.offer.status === 'ACCEPTED',
                'text-red-600': message.offer.status === 'REJECTED',
                'text-muted-foreground': [
                  'PENDING',
                  'EXPIRED',
                  'WITHDRAWN'
                ].includes(message.offer.status)
              })}
            >
              {message.offer.status.charAt(0) +
                message.offer.status.slice(1).toLowerCase()}
            </span>
          </div>

          {message.content && (
            <p className="text-sm text-muted-foreground">{message.content}</p>
          )}

          {onRespond && message.offer.status === 'PENDING' && (
            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                onClick={() => onRespond(message.offer.id, 'ACCEPTED')}
              >
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRespond(message.offer.id, 'REJECTED')}
              >
                Decline
              </Button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>
            {formatDistanceToNow(new Date(message.created_at), {
              addSuffix: true
            })}
          </span>
          {message.is_read && isSender && (
            <div className="text-xs text-muted-foreground">✓</div>
          )}
        </div>
      </div>
    </div>
  )
}
