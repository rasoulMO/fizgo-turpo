// /server/api/routers/payment.ts
import { env } from '@/env'
import { PaymentMethodType } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import Stripe from 'stripe'
import { z } from 'zod'

import { calculateFees, FEES } from '@/config/fees'

import { createTRPCRouter, protectedProcedure } from '../trpc'

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
    // Verify the customer still exists in Stripe
    try {
      const customer = await stripe.customers.retrieve(user.stripe_customer_id)
      if (!customer.deleted) {
        return user.stripe_customer_id
      }
    } catch (error) {
      // Customer not found in Stripe, create a new one
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

export const paymentRouter = createTRPCRouter({
  getPaymentMethodById: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const paymentMethod = await ctx.db.payment_methods.findUnique({
        where: { id: input }
      })

      if (!paymentMethod) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Payment method not found'
        })
      }

      if (paymentMethod.user_id !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to use this payment method'
        })
      }

      return paymentMethod
    }),

  savePaymentMethod: protectedProcedure
    .input(
      z.object({
        stripe_payment_method_id: z.string(),
        type: z.nativeEnum(PaymentMethodType),
        last4: z.string().optional(),
        exp_month: z.number().optional(),
        exp_year: z.number().optional(),
        card_brand: z.string().optional(),
        is_default: z.boolean().default(false)
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Ensure user has a Stripe customer ID
        const customerId = await getOrCreateCustomer(
          ctx.user.id,
          ctx.db,
          ctx.user.email
        )

        // Attach payment method to customer
        await stripe.paymentMethods.attach(input.stripe_payment_method_id, {
          customer: customerId
        })

        // Set as default payment method if requested
        if (input.is_default) {
          await stripe.customers.update(customerId, {
            invoice_settings: {
              default_payment_method: input.stripe_payment_method_id
            }
          })
        }

        // Save to database
        if (input.is_default) {
          await ctx.db.payment_methods.updateMany({
            where: { user_id: ctx.user.id },
            data: { is_default: false }
          })
        }

        return ctx.db.payment_methods.create({
          data: {
            user_id: ctx.user.id,
            stripe_payment_method_id: input.stripe_payment_method_id,
            type: input.type,
            last4: input.last4,
            exp_month: input.exp_month,
            exp_year: input.exp_year,
            card_brand: input.card_brand,
            is_default: input.is_default
          }
        })
      } catch (error) {
        if (error instanceof Stripe.errors.StripeError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message
          })
        }
        throw error
      }
    }),

  createPaymentIntent: protectedProcedure
    .input(
      z.object({
        order_id: z.string().uuid(),
        stripe_payment_method_id: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.db.orders.findUnique({
        where: { id: input.order_id },
        include: {
          order_items: {
            include: {
              product: {
                include: {
                  shop: true
                }
              }
            }
          }
        }
      })

      if (!order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found'
        })
      }

      if (order.user_id !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to pay for this order'
        })
      }

      try {
        const customerId = await getOrCreateCustomer(
          ctx.user.id,
          ctx.db,
          ctx.user.email
        )

        // Calculate fees
        const amount = Math.round(Number(order.total) * 100)
        const {
          platformFee,
          platformFeePercentage,
          shopAmount,
          shopFeePercentage,
          deliveryFee,
          deliveryFeePercentage
        } = calculateFees(amount)

        // Get shop's Stripe account
        const shopStripeAccountId =
          order.order_items[0]?.product?.shop?.stripe_account_id
        if (!shopStripeAccountId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Shop is not properly connected to Stripe'
          })
        }

        // Get or create payment method
        const paymentMethod = await ctx.db.payment_methods.upsert({
          where: {
            stripe_payment_method_id: input.stripe_payment_method_id
          },
          create: {
            user_id: ctx.user.id,
            stripe_payment_method_id: input.stripe_payment_method_id,
            type: 'CARD',
            status: 'ACTIVE'
          },
          update: {}
        })

        // Create payment record first
        const payment = await ctx.db.payments.create({
          data: {
            customer_id: ctx.user.id,
            user_id: ctx.user.id,
            order_id: order.id,
            payment_method_id: paymentMethod.id,
            amount: order.total,
            status: 'PENDING',
            payment_type: 'SHOP_ORDER',
            provider: 'STRIPE',
            metadata: {
              shop_amount: shopAmount,
              delivery_fee: deliveryFee,
              platform_fee: platformFee,
              shop_account_id: shopStripeAccountId
            }
          }
        })

        // Create payment fees record
        await ctx.db.payment_fees.create({
          data: {
            payment_id: payment.id,
            platform_fee_amount: platformFee / 100,
            platform_fee_percentage: platformFeePercentage,
            shop_fee_amount: shopAmount / 100,
            shop_fee_percentage: shopFeePercentage,
            delivery_fee_amount: deliveryFee / 100,
            delivery_fee_percentage: deliveryFeePercentage,
            shop_account_id: shopStripeAccountId,
            delivery_partner_id: null
          }
        })

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
          amount,
          currency: 'usd',
          customer: customerId,
          payment_method: input.stripe_payment_method_id,
          confirm: false,
          setup_future_usage: 'off_session',
          application_fee_amount: platformFee,
          transfer_data: {
            destination: shopStripeAccountId
          },
          transfer_group: payment.id,
          metadata: {
            payment_id: payment.id,
            order_id: order.id
          }
        })

        // Update payment with Stripe details
        await ctx.db.payments.update({
          where: { id: payment.id },
          data: {
            provider_payment_id: paymentIntent.id,
            provider_client_secret: paymentIntent.client_secret,
            provider: 'STRIPE'
          }
        })

        return {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id
        }
      } catch (error) {
        console.error('Payment error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error ? error.message : 'Failed to process payment'
        })
      }
    }),

  getById: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const paymentMethod = await ctx.db.payment_methods.findUnique({
        where: { id: input }
      })

      if (!paymentMethod) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Payment method not found'
        })
      }

      if (paymentMethod.user_id !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to view this payment method'
        })
      }

      return paymentMethod
    }),

  getDefaultPaymentMethod: protectedProcedure.query(({ ctx }) => {
    return ctx.db.payment_methods.findFirst({
      where: {
        user_id: ctx.user.id,
        is_default: true
      }
    })
  }),

  setAsDefault: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      const paymentMethod = await ctx.db.payment_methods.findUnique({
        where: { id: input }
      })

      if (!paymentMethod) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Payment method not found'
        })
      }

      if (paymentMethod.user_id !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to modify this payment method'
        })
      }

      try {
        // Get or create customer
        const customerId = await getOrCreateCustomer(
          ctx.user.id,
          ctx.db,
          ctx.user.email
        )

        // Update default payment method in Stripe
        await stripe.customers.update(customerId, {
          invoice_settings: {
            default_payment_method: paymentMethod.stripe_payment_method_id
          }
        })

        // Update in database
        await ctx.db.payment_methods.updateMany({
          where: { user_id: ctx.user.id },
          data: { is_default: false }
        })

        return ctx.db.payment_methods.update({
          where: { id: input },
          data: { is_default: true }
        })
      } catch (error) {
        if (error instanceof Stripe.errors.StripeError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message
          })
        }
        throw error
      }
    }),

  getAllPaymentMethods: protectedProcedure
    .input(
      z
        .object({
          includeArchived: z.boolean().default(false)
        })
        .optional()
    )
    .query(({ ctx, input }) => {
      return ctx.db.payment_methods.findMany({
        where: {
          user_id: ctx.user.id,
          status: input?.includeArchived ? undefined : ('ACTIVE' as const)
        },
        include: {
          payments: {
            select: { id: true }
          }
        },
        orderBy: { created_at: 'desc' }
      })
    }),

  removePaymentMethod: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      const paymentMethod = await ctx.db.payment_methods.findUnique({
        where: { id: input },
        include: {
          payments: {
            take: 1, // We only need to know if any payments exist
            select: { id: true }
          }
        }
      })

      if (!paymentMethod) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Payment method not found'
        })
      }

      if (paymentMethod.user_id !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to modify this payment method'
        })
      }

      if (paymentMethod.is_default) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot remove default payment method'
        })
      }

      try {
        // Get customer ID first
        const user = await ctx.db.users.findUnique({
          where: { id: ctx.user.id },
          select: { stripe_customer_id: true }
        })

        if (!user?.stripe_customer_id) {
          // If no customer exists, we can skip the detachment process
          console.warn('No Stripe customer found for user, skipping detachment')
        } else {
          try {
            // Verify the payment method exists and is attached to the customer
            const stripePaymentMethod = await stripe.paymentMethods.retrieve(
              paymentMethod.stripe_payment_method_id
            )

            if (stripePaymentMethod.customer === user.stripe_customer_id) {
              // Only detach if it's actually attached to our customer
              await stripe.paymentMethods.detach(
                paymentMethod.stripe_payment_method_id
              )
            }
          } catch (error) {
            if (error instanceof Stripe.errors.StripeError) {
              // Log the error but continue with the database operation
              console.error('Stripe detachment error:', error)
            }
          }
        }

        // If payment method has been used in transactions, archive it
        if (paymentMethod.payments.length > 0) {
          return ctx.db.payment_methods.update({
            where: { id: input },
            data: {
              status: 'ARCHIVED',
              archived_at: new Date(),
              updated_at: new Date()
            }
          })
        }

        // If never used in transactions, delete it
        return ctx.db.payment_methods.delete({
          where: { id: input }
        })
      } catch (error) {
        console.error('Payment method removal error:', error)

        if (error instanceof TRPCError) {
          throw error
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove payment method'
        })
      }
    })
})
