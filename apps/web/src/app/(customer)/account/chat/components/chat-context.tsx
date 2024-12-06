'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/trpc/react'
import { ChatMessageType, OfferStatus } from '@prisma/client'

import { useToast } from '@/hooks/use-toast'

interface ChatContextType {
  messages: any[]
  sendMessage: (
    content: string,
    type?: ChatMessageType,
    offerId?: string
  ) => Promise<void>
  makeOffer: (amount: number, message?: string) => Promise<void>
  respondToOffer: (offerId: string, status: OfferStatus) => Promise<void>
  isLoading: boolean
  currentOffer: any | null
  handlePaymentClick: (offerId: string) => void
}

const ChatContext = createContext<ChatContextType | null>(null)

interface ChatProviderProps {
  children: React.ReactNode
  conversationId?: string
  itemId?: string
  currentUserId: string
}

export function ChatProvider({
  children,
  conversationId,
  itemId,
  currentUserId
}: ChatProviderProps) {
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentOffer, setCurrentOffer] = useState<any | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Find accepted offer in messages when component mounts or messages update
  useEffect(() => {
    if (messages.length > 0) {
      const lastAcceptedOffer = messages
        .filter(
          (msg) =>
            msg.message_type === 'OFFER' &&
            msg.offer?.status === 'ACCEPTED' &&
            msg.offer.buyer_id === currentUserId
        )
        .pop()

      if (lastAcceptedOffer?.offer) {
        setCurrentOffer(lastAcceptedOffer.offer)
      }
    }
  }, [messages, currentUserId])

  // Send message mutation
  const sendMessageMutation = api.chat.sendMessage.useMutation({
    onSuccess: (newMessage) => {
      setMessages((prev) => [...prev, newMessage])
      router.refresh()
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive'
      })
    }
  })

  // Create offer mutation
  const createOfferMutation = api.chat.createOffer.useMutation({
    onSuccess: (result) => {
      const { conversation, message } = result
      if (message) {
        setMessages((prev) => [...prev, message])
      }
      router.push(`/account/chat/${conversation.id}`)
      router.refresh()
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create offer',
        variant: 'destructive'
      })
    }
  })

  // Respond to offer mutation
  const respondToOfferMutation = api.chat.respondToOffer.useMutation({
    onSuccess: async (result) => {
      const { offer, message, paymentMessage } = result

      // Update messages with the new offer status
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === message.id
            ? { ...msg, offer: { ...msg.offer, status: offer.status } }
            : msg
        )
      )

      // Add the status message
      setMessages((prev) => [...prev, message])

      // Add payment message if offer was accepted
      if (paymentMessage) {
        setMessages((prev) => [...prev, paymentMessage])
      }

      router.refresh()
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to respond to offer',
        variant: 'destructive'
      })
    }
  })

  // Fetch initial messages
  const { data: initialMessages } = api.chat.getMessages.useQuery(
    { conversationId: conversationId! },
    {
      enabled: !!conversationId,
      refetchInterval: 5000 // Poll every 5 seconds for new messages
    }
  )

  // Update messages when new data is received
  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages)
    }
  }, [initialMessages])

  // Send message function
  const sendMessage = async (
    content: string,
    type: ChatMessageType = 'TEXT',
    offerId?: string
  ) => {
    if (!conversationId || !content.trim()) return

    try {
      setIsLoading(true)
      await sendMessageMutation.mutateAsync({
        conversationId,
        content: content.trim(),
        messageType: type,
        offerId
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Make offer function
  const makeOffer = async (amount: number, message?: string) => {
    if (!itemId) return

    try {
      setIsLoading(true)
      await createOfferMutation.mutateAsync({
        itemId,
        offerAmount: amount,
        message
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Respond to offer function
  const respondToOffer = async (offerId: string, status: OfferStatus) => {
    if (!conversationId) return

    try {
      setIsLoading(true)
      await respondToOfferMutation.mutateAsync({
        offerId,
        conversationId,
        status
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle payment click
  const handlePaymentClick = (offerId: string) => {
    router.push(`/checkout/${offerId}`)
  }

  // Check if any mutation is loading
  const isLoadingAny =
    isLoading ||
    sendMessageMutation.isPending ||
    createOfferMutation.isPending ||
    respondToOfferMutation.isPending

  const contextValue = {
    messages,
    sendMessage,
    makeOffer,
    respondToOffer,
    isLoading: isLoadingAny,
    currentOffer,
    handlePaymentClick
  }

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
