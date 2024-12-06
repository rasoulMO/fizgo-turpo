import { task } from '@trigger.dev/sdk/v3'
import { Resend } from 'resend'

import { ChatMessageEmail } from '../emails/chat-notification'
import { OfferNotificationEmail } from '../emails/offer-notification'
import { OfferResponseEmail } from '../emails/offer-response-notification'

const resend = new Resend(process.env.RESEND_API_KEY)

interface MessageEmailPayload {
  recipientName: string
  recipientEmail: string
  senderName: string
  itemName: string
  messagePreview: string
  conversationUrl: string
}

interface OfferEmailPayload {
  recipientName: string
  recipientEmail: string
  senderName: string
  itemName: string
  offerAmount: number
  message?: string
  conversationUrl: string
}

export const sendChatMessageEmail = task({
  id: 'send-chat-message-email',
  run: async (payload: MessageEmailPayload) => {
    const emailHtml = ChatMessageEmail({
      recipientName: payload.recipientName,
      senderName: payload.senderName,
      itemName: payload.itemName,
      messagePreview: payload.messagePreview,
      conversationUrl: payload.conversationUrl
    })

    return await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@fizgo.ai',
      to: payload.recipientEmail,
      subject: `New message from ${payload.senderName} about ${payload.itemName}`,
      react: emailHtml
    })
  },
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10000,
    factor: 2
  }
})

export const sendOfferNotificationEmail = task({
  id: 'send-offer-notification-email',
  run: async (payload: OfferEmailPayload) => {
    const emailHtml = OfferNotificationEmail({
      recipientName: payload.recipientName,
      senderName: payload.senderName,
      itemName: payload.itemName,
      offerAmount: payload.offerAmount,
      message: payload.message,
      conversationUrl: payload.conversationUrl
    })

    return await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@fizgo.ai',
      to: payload.recipientEmail,
      subject: `New offer from ${payload.senderName} for ${payload.itemName}`,
      react: emailHtml
    })
  },
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10000,
    factor: 2
  }
})

interface OfferResponseEmailPayload {
  recipientName: string
  recipientEmail: string
  sellerName: string
  itemName: string
  offerAmount: number
  status: 'ACCEPTED' | 'REJECTED'
  conversationUrl: string
}

export const sendOfferResponseEmail = task({
  id: 'send-offer-response-email',
  run: async (payload: OfferResponseEmailPayload) => {
    const emailHtml = OfferResponseEmail({
      recipientName: payload.recipientName,
      sellerName: payload.sellerName,
      itemName: payload.itemName,
      offerAmount: payload.offerAmount,
      status: payload.status,
      conversationUrl: payload.conversationUrl
    })

    return await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com',
      to: payload.recipientEmail,
      subject: `Your offer for ${payload.itemName} has been ${payload.status.toLowerCase()}`,
      react: emailHtml
    })
  },
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10000,
    factor: 2
  }
})
