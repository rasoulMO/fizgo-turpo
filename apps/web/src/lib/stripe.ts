import { env } from '@/env'
import { db } from '@/server/db'
import Stripe from 'stripe'

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-10-28.acacia',
  typescript: true
})

export const calculateApplicationFee = (amount: number) => {
  // Platform fee: 10% of the total amount
  return Math.round(amount * 0.1)
}

export const createPaymentIntent = async ({
  amount,
  customerId,
  paymentMethodId,
  connectedAccountId,
  orderId,
  metadata = {}
}: {
  amount: number
  customerId: string
  paymentMethodId: string
  connectedAccountId: string
  orderId: string
  metadata?: Record<string, string>
}) => {
  const applicationFee = calculateApplicationFee(amount)

  return stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    customer: customerId,
    payment_method: paymentMethodId,
    off_session: false,
    confirm: false,
    application_fee_amount: applicationFee,
    transfer_data: {
      destination: connectedAccountId
    },
    metadata: {
      orderId,
      ...metadata
    }
  })
}

export const retrieveTransfer = async (transferId: string) => {
  return stripe.transfers.retrieve(transferId)
}

export const retrievePayout = async (
  payoutId: string,
  connectedAccountId: string
) => {
  return stripe.payouts.retrieve(payoutId, {
    stripeAccount: connectedAccountId
  })
}

export const getAccountBalance = async (connectedAccountId: string) => {
  return stripe.balance.retrieve({
    stripeAccount: connectedAccountId
  })
}

export const getPayoutSchedule = async (connectedAccountId: string) => {
  const account = await stripe.accounts.retrieve(connectedAccountId)
  return account.settings?.payouts
}

export const listAccountPayouts = async ({
  connectedAccountId,
  limit = 10,
  startingAfter
}: {
  connectedAccountId: string
  limit?: number
  startingAfter?: string
}) => {
  return stripe.payouts.list(
    {
      limit,
      starting_after: startingAfter
    },
    {
      stripeAccount: connectedAccountId
    }
  )
}

export const listAccountTransfers = async ({
  connectedAccountId,
  limit = 10,
  startingAfter
}: {
  connectedAccountId: string
  limit?: number
  startingAfter?: string
}) => {
  return stripe.transfers.list({
    limit,
    destination: connectedAccountId,
    starting_after: startingAfter,
    expand: ['data.destination_payment']
  })
}

export const handlePaymentIntentSuccess = async (
  paymentIntent: Stripe.PaymentIntent
) => {
  if (paymentIntent.metadata.orderType === 'P2P') {
    const { offerId, itemId, buyerId, sellerId, orderId } =
      paymentIntent.metadata

    // Validate required metadata
    if (!offerId || !itemId || !buyerId || !sellerId || !orderId) {
      console.error('Missing required metadata:', paymentIntent.metadata)
      return
    }

    await db.$transaction(async (tx) => {
      // Update payment status
      await tx.payments.update({
        where: { provider_payment_id: paymentIntent.id },
        data: {
          status: 'SUCCEEDED',
          updated_at: new Date()
        }
      })

      // Update P2P order status
      await tx.p2p_orders.update({
        where: { id: orderId },
        data: {
          status: 'PAYMENT_CONFIRMED',
          updated_at: new Date()
        }
      })

      // Update item status
      await tx.user_items.update({
        where: { id: itemId },
        data: {
          status: 'SOLD',
          updated_at: new Date()
        }
      })

      // Update offer status
      await tx.user_item_offers.update({
        where: { id: offerId },
        data: {
          status: 'ACCEPTED',
          updated_at: new Date()
        }
      })

      // Add payment confirmation message to chat
      const conversation = await tx.chat_conversations.findFirst({
        where: {
          item_id: itemId,
          buyer_id: buyerId,
          seller_id: sellerId,
          status: 'ACTIVE'
        }
      })

      if (conversation) {
        await tx.chat_messages.create({
          data: {
            conversation_id: conversation.id,
            sender_id: buyerId,
            message_type: 'TEXT',
            content:
              'Payment completed successfully! The order has been created.',
            offer_id: offerId,
            is_read: false,
            created_at: new Date()
          }
        })

        await tx.chat_conversations.update({
          where: { id: conversation.id },
          data: { last_message_at: new Date() }
        })
      }
    })
  } else {
    if (!paymentIntent.metadata.order_id) {
      console.error('No order ID in metadata:', paymentIntent.id)
      return
    }

    await db.$transaction(async (tx) => {
      const updatedPayment = await tx.payments.update({
        where: { provider_payment_id: paymentIntent.id },
        data: {
          status: 'SUCCEEDED',
          updated_at: new Date()
        }
      })
      console.log('Updated payment:', updatedPayment)

      const updatedOrder = await tx.orders.update({
        where: { id: paymentIntent.metadata.order_id },
        data: {
          status: 'ORDER_CONFIRMED',
          updated_at: new Date()
        }
      })
      console.log('Updated order:', updatedOrder)
    })
  }
}

export const handlePaymentIntentFailure = async (
  paymentIntent: Stripe.PaymentIntent
) => {
  if (paymentIntent.metadata.orderType === 'P2P') {
    const { offerId, itemId, orderId } = paymentIntent.metadata

    await db.$transaction(async (tx) => {
      // Update payment status
      await tx.payments.update({
        where: { provider_payment_id: paymentIntent.id },
        data: {
          status: 'FAILED',
          error_message: paymentIntent.last_payment_error?.message,
          updated_at: new Date()
        }
      })

      // Update P2P order status
      if (orderId) {
        await tx.p2p_orders.update({
          where: { id: orderId },
          data: {
            status: 'CANCELLED',
            updated_at: new Date()
          }
        })
      }

      // Update item status back to PUBLISHED
      await tx.user_items.update({
        where: { id: itemId },
        data: {
          status: 'PUBLISHED',
          updated_at: new Date()
        }
      })

      // Update offer status
      await tx.user_item_offers.update({
        where: { id: offerId },
        data: {
          status: 'EXPIRED',
          updated_at: new Date()
        }
      })
    })
  } else {
    if (!paymentIntent.metadata.order_id) {
      console.error('No order ID in metadata:', paymentIntent.id)
      return
    }

    await db.$transaction(async (tx) => {
      await tx.payments.update({
        where: { provider_payment_id: paymentIntent.id },
        data: {
          status: 'FAILED',
          error_message: paymentIntent.last_payment_error?.message,
          updated_at: new Date()
        }
      })

      await tx.orders.update({
        where: { id: paymentIntent.metadata.order_id },
        data: {
          status: 'CANCELLED',
          updated_at: new Date()
        }
      })
    })
  }
}
