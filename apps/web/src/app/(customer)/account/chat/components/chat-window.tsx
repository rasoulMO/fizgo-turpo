'use client'

import React, { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api } from '@/trpc/react'
import { ChevronLeft, Send } from 'lucide-react'

import { formatPrice } from '@/utils/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

import { useChat } from './chat-context'
import { MakeOfferDialog } from './make-offer'
import { MessageBubble } from './message-bubble'
import { OfferBubble } from './offer-bubble'
import { PaymentPromptMessage } from './payment-message'

interface ChatWindowProps {
  conversation: any
  currentUserId: string
  backUrl: string
}

export function ChatWindow({
  conversation,
  currentUserId,
  backUrl
}: ChatWindowProps) {
  const [newMessage, setNewMessage] = React.useState('')
  const [showOfferDialog, setShowOfferDialog] = React.useState(false)
  const messageEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const {
    messages,
    sendMessage,
    isLoading,
    respondToOffer,
    handlePaymentClick
  } = useChat()

  const isBuyer = currentUserId === conversation.buyer_id
  const otherUser = isBuyer ? conversation.seller : conversation.buyer

  // Check if the buyer can make a new offer
  const canMakeOffer =
    isBuyer &&
    conversation.item?.status === 'PUBLISHED' &&
    !messages.some(
      (message) =>
        message.message_type === 'OFFER' && message.offer?.status === 'PENDING'
    )

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isLoading) return

    await sendMessage(newMessage)
    setNewMessage('')
  }

  const renderMessage = (message: any) => {
    if (message.message_type === 'OFFER') {
      return (
        <OfferBubble
          key={message.id}
          message={message}
          isSender={message.sender_id === currentUserId}
          isBuyer={isBuyer}
          onRespond={!isBuyer ? respondToOffer : undefined}
        />
      )
    }

    if (message.message_type === 'PENDING_PAYMENT') {
      return (
        <PaymentPromptMessage
          key={message.id}
          message={message}
          isSender={message.sender_id === currentUserId}
          onPaymentClick={() => handlePaymentClick(message.offer_id)}
        />
      )
    }

    return (
      <MessageBubble
        key={message.id}
        message={message}
        isSender={message.sender_id === currentUserId}
      />
    )
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(backUrl)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="relative h-10 w-10">
            <Image
              src={otherUser?.avatar_url || '/placeholder-avatar.png'}
              alt={otherUser?.full_name || 'User'}
              fill
              className="rounded-full object-cover"
            />
          </div>
          <div>
            <h2 className="font-semibold">{otherUser?.full_name}</h2>
            <Link
              href={`/items/${conversation.item?.id}`}
              className="text-sm text-muted-foreground hover:underline"
            >
              {conversation.item?.name}
            </Link>
          </div>
        </div>

        {canMakeOffer && (
          <div className="text-right">
            <div className="text-sm font-medium">
              {formatPrice(conversation.item?.price)}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOfferDialog(true)}
            >
              Make Offer
            </Button>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-4">
          {messages.map((message) => renderMessage(message))}
          <div ref={messageEndRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSendMessage} className="flex gap-2 px-4 pb-4">
        <Input
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading}>
          <Send className="h-4 w-4" />
        </Button>
      </form>

      <MakeOfferDialog
        itemPrice={Number(conversation.item?.price)}
        open={showOfferDialog}
        onOpenChange={setShowOfferDialog}
      />
    </div>
  )
}
