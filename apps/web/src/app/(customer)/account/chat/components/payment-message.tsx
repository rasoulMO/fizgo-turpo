import React from 'react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { CreditCard } from 'lucide-react'

import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'

interface PaymentPromptMessageProps {
  message: any
  isSender: boolean
  onPaymentClick: () => void
}

export function PaymentPromptMessage({
  message,
  isSender,
  onPaymentClick
}: PaymentPromptMessageProps) {
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
          className={cn('rounded-lg border bg-background p-4', {
            'bg-primary/5': isSender
          })}
        >
          <div className="mb-2">{message.content}</div>
          <Button size="sm" onClick={onPaymentClick} className="gap-2">
            <CreditCard className="h-4 w-4" />
            Proceed to Payment
          </Button>
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
