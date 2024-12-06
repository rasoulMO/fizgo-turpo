// /server/api/routers/p2p.ts
import { env } from '@/env'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { TRPCError } from '@trpc/server'
import Stripe from 'stripe'
import { z } from 'zod'

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-10-28.acacia',
  typescript: true
})

async function getOrCreateCustomer(
  userId: string,
  db: any,
  email?: string | null
) {
  const user = await db.users.findUnique({
    where: { id: userId }
  })

  if (user?.stripe_customer_id) {
    try {
      const customer = await stripe.customers.retrieve(user.stripe_customer_id)
      if (!customer.deleted) {
        return user.stripe_customer_id
      }
    } catch (error) {
      // Customer not found in Stripe, will create new one
    }
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email: email || undefined,
    metadata: {
      userId
    }
  })

  // Update user with new Stripe customer ID
  await db.users.update({
    where: { id: userId },
    data: { stripe_customer_id: customer.id }
  })

  return customer.id
}

export const p2pRouter = createTRPCRouter({
  getOfferById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const offer = await ctx.db.user_item_offers.findUnique({
        where: { id: input },
        include: {
          item: true,
          buyer: true
        }
      })

      if (!offer) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Offer not found'
        })
      }

      if (offer.buyer_id !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to view this offer'
        })
      }

      return offer
    }),

  createPaymentIntent: protectedProcedure
    .input(
      z.object({
        offerId: z.string(),
        addressId: z.string(),
        paymentMethodId: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.$transaction(async (tx) => {
        // Get offer details
        const offer = await tx.user_item_offers.findUnique({
          where: { id: input.offerId },
          include: {
            item: {
              include: {
                seller: true
              }
            }
          }
        })

        if (!offer) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Offer not found'
          })
        }

        if (offer.status !== 'ACCEPTED') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Offer must be accepted before payment'
          })
        }

        if (offer.buyer_id !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Not authorized to pay for this offer'
          })
        }

        // Get customer ID
        const customerId = await getOrCreateCustomer(
          ctx.user.id,
          tx,
          ctx.user.email
        )

        // Verify payment method belongs to customer
        const paymentMethod = await tx.payment_methods.findFirst({
          where: {
            stripe_payment_method_id: input.paymentMethodId,
            user_id: ctx.user.id
          }
        })

        if (!paymentMethod) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid payment method'
          })
        }

        const address = await tx.customer_addresses.findUnique({
          where: { id: input.addressId }
        })

        if (!address) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid shipping address'
          })
        }

        const conversation = await tx.chat_conversations.findFirst({
          where: {
            item_id: offer.item_id,
            buyer_id: offer.buyer_id,
            seller_id: offer.item.seller_id,
            status: 'ACTIVE'
          }
        })

        if (!conversation) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'No active conversation found for this offer'
          })
        }

        // Calculate total with shipping
        const shippingFee = 5 // Fixed shipping fee
        const total = Number(offer.offer_amount) + shippingFee

        const p2pOrder = await tx.p2p_orders.create({
          data: {
            item_id: offer.item_id,
            buyer_id: offer.buyer_id,
            seller_id: offer.item.seller_id,
            accepted_offer_id: offer.id,
            total_amount: total,
            status: 'PENDING_PAYMENT',
            delivery_method: 'SHIPPING',
            delivery_address: {
              fullName: address.full_name,
              phoneNumber: address.phone_number,
              addressLine1: address.address_line1,
              addressLine2: address.address_line2,
              city: address.city,
              state: address.state,
              postalCode: address.postal_code,
              country: address.country
            }
          }
        })

        // Create payment intent without confirming
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(total * 100),
          currency: 'usd',
          customer: customerId,
          payment_method: input.paymentMethodId,
          capture_method: 'automatic_async',
          metadata: {
            offerId: offer.id,
            itemId: offer.item_id,
            buyerId: offer.buyer_id,
            sellerId: offer.item.seller_id,
            orderId: p2pOrder.id,
            orderType: 'P2P',
            conversationId: conversation.id
          }
        })

        await tx.payments.create({
          data: {
            p2p_order_id: p2pOrder.id,
            payment_method_id: paymentMethod.id,
            amount: total,
            status: 'PENDING',
            provider_payment_id: paymentIntent.id,
            provider_client_secret: paymentIntent.client_secret,
            payment_type: 'P2P_ORDER',
            provider: 'STRIPE',
            user_id: ctx.user.id,
            customer_id: ctx.user.id
          }
        })

        return {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          orderId: p2pOrder.id
        }
      })
    }),

  getOrderByOfferId: protectedProcedure
    .input(
      z.object({
        offerId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.p2p_orders.findFirst({
        where: {
          accepted_offer_id: input.offerId,
          buyer_id: ctx.user.id
        },
        include: {
          item: true,
          buyer: true,
          seller: true
        }
      })

      if (!order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found'
        })
      }

      return order
    }),

  getUserOrders: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().uuid().optional()
      })
    )
    .query(async ({ ctx, input }) => {
      const orders = await ctx.db.p2p_orders.findMany({
        where: {
          buyer_id: ctx.user.id
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { created_at: 'desc' },
        include: {
          item: true,
          seller: true
        }
      })

      let nextCursor: typeof input.cursor = undefined
      if (orders.length > input.limit) {
        const nextItem = orders.pop()
        nextCursor = nextItem?.id
      }

      return {
        items: orders,
        nextCursor
      }
    })
})
