import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'

import { cn } from '@/utils/cn'

interface MessageBubbleProps {
  message: any
  isSender: boolean
}

// Message bubble component
export function MessageBubble({ message, isSender }: MessageBubbleProps) {
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
          className={cn('rounded-lg px-3 py-2', {
            'bg-primary text-primary-foreground': isSender,
            'bg-muted': !isSender
          })}
        >
          <p className="break-words">{message.content}</p>
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
