// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { env } from '@/env'
import {
  handlePaymentIntentFailure,
  handlePaymentIntentSuccess,
  stripe
} from '@/lib/stripe'
import { db } from '@/server/db'
import Stripe from 'stripe'

import { FEES } from '@/config/fees'

export const dynamic = 'force-dynamic'
export const preferredRegion = 'auto'
export const maxDuration = 60

const webhookSecret = env.STRIPE_WEBHOOK_SECRET

export async function POST(req: NextRequest) {
  const body = await req.text()
  const headersList = headers()
  const signature = headersList.get('stripe-signature')

  if (!signature || !webhookSecret) {
    console.error('Missing signature or webhook secret')
    return NextResponse.json(
      { error: 'Missing stripe signature' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    )
  } catch (err) {
    console.error('Error verifying webhook signature:', err)
    return NextResponse.json(
      {
        error: `Webhook signature verification failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      // Payment Intent Events
      case 'payment_intent.created': {
        event.data.object as Stripe.PaymentIntent
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentIntentSuccess(paymentIntent)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentIntentFailure(paymentIntent)
        break
      }

      case 'payment_intent.processing': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await db.payments.update({
          where: { id: paymentIntent.metadata.payment_id },
          data: { status: 'PROCESSING' }
        })
        break
      }

      // Transfer Events
      case 'transfer.created': {
        try {
          const transfer = event.data.object as Stripe.Transfer

          if (!transfer.transfer_group) {
            console.error('No transfer group found:', transfer.id)
            return new NextResponse('Missing transfer group', { status: 400 })
          }

          const payment = await db.payments.findFirst({
            where: { id: transfer.transfer_group }
          })

          if (!payment || !payment.metadata) {
            console.error(
              'No payment or metadata found:',
              transfer.transfer_group
            )
            return new NextResponse('Payment not found', { status: 404 })
          }

          const metadata = payment.metadata as Record<string, any>

          await db.payment_fees.update({
            where: { payment_id: payment.id },
            data: {
              shop_transfer_id: transfer.id,
              shop_fee_amount: metadata.shop_amount / 100,
              shop_fee_percentage: FEES.SHOP.PERCENTAGE,
              shop_account_id: metadata.shop_account_id
            }
          })
        } catch (error) {
          console.error('Error processing transfer webhook:', error)
          return new NextResponse('Error processing transfer webhook', {
            status: 500
          })
        }
        break
      }

      case 'transfer.reversed': {
        const transfer = event.data.object as Stripe.Transfer
        const paymentId = transfer.metadata.payment_id as string
        const transferType = transfer.metadata.transfer_type as
          | 'shop'
          | 'delivery'

        if (transferType === 'shop') {
          await db.payment_fees.update({
            where: { payment_id: paymentId },
            data: {
              shop_transfer_id: null,
              shop_fee_amount: 0,
              shop_fee_percentage: 0
            }
          })
        } else {
          await db.payment_fees.update({
            where: { payment_id: paymentId },
            data: {
              delivery_transfer_id: null,
              delivery_fee_amount: 0,
              delivery_fee_percentage: 0
            }
          })
        }
        break
      }

      case 'transfer.updated': {
        const transfer = event.data.object as Stripe.Transfer
        if (
          !transfer.reversed &&
          transfer.metadata?.payment_id &&
          transfer.metadata?.transfer_type
        ) {
          const paymentId = transfer.metadata.payment_id
          const transferType = transfer.metadata.transfer_type as
            | 'shop'
            | 'delivery'

          if (transferType === 'shop') {
            await db.payment_fees.update({
              where: { payment_id: paymentId },
              data: {
                shop_fee_amount: transfer.amount / 100
              }
            })
          } else {
            await db.payment_fees.update({
              where: { payment_id: paymentId },
              data: {
                delivery_fee_amount: transfer.amount / 100
              }
            })
          }
        }
        break
      }

      // Payout Events
      case 'payout.created': {
        const payout = event.data.object as Stripe.Payout
        if (payout.metadata?.payment_id && payout.metadata?.payout_type) {
          const paymentId = payout.metadata.payment_id
          const payoutType = payout.metadata.payout_type as 'shop' | 'delivery'

          if (payoutType === 'shop') {
            await db.payment_fees.update({
              where: { payment_id: paymentId },
              data: {
                shop_payout_id: payout.id,
                payout_schedule_date: new Date(payout.arrival_date * 1000)
              }
            })
          } else {
            await db.payment_fees.update({
              where: { payment_id: paymentId },
              data: {
                delivery_payout_id: payout.id,
                payout_schedule_date: new Date(payout.arrival_date * 1000)
              }
            })
          }
        }
        break
      }

      case 'payout.paid': {
        const payout = event.data.object as Stripe.Payout
        if (payout.metadata?.payment_id && payout.metadata?.payout_type) {
          const paymentId = payout.metadata.payment_id
          const payoutType = payout.metadata.payout_type as 'shop' | 'delivery'

          if (payoutType === 'shop') {
            await db.payment_fees.update({
              where: { payment_id: paymentId },
              data: {
                shop_payout_id: payout.id
              }
            })
          } else {
            await db.payment_fees.update({
              where: { payment_id: paymentId },
              data: {
                delivery_payout_id: payout.id
              }
            })
          }
        }
        break
      }

      case 'payout.failed': {
        const payout = event.data.object as Stripe.Payout
        if (payout.metadata?.payment_id && payout.metadata?.payout_type) {
          const paymentId = payout.metadata.payment_id
          const payoutType = payout.metadata.payout_type as 'shop' | 'delivery'

          if (payoutType === 'shop') {
            await db.payment_fees.update({
              where: { payment_id: paymentId },
              data: {
                shop_payout_id: null
              }
            })
          } else {
            await db.payment_fees.update({
              where: { payment_id: paymentId },
              data: {
                delivery_payout_id: null
              }
            })
          }
        }
        break
      }

      // Charge Events
      case 'charge.succeeded': {
        event.data.object as Stripe.Charge
        break
      }

      case 'charge.failed': {
        event.data.object as Stripe.Charge
        break
      }

      case 'charge.updated': {
        const charge = event.data.object as Stripe.Charge
        if (charge.payment_intent) {
          const payment = await db.payments.findFirst({
            where: { provider_payment_id: charge.payment_intent as string }
          })

          if (payment) {
            await db.payment_fees.update({
              where: { payment_id: payment.id },
              data: {
                platform_fee_amount: charge.application_fee_amount
                  ? Math.round(charge.application_fee_amount / 100)
                  : 0
              }
            })
          }
        }
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge

        if (typeof charge.payment_intent === 'string') {
          const payment = await db.payments.findFirst({
            where: { provider_payment_id: charge.payment_intent }
          })

          if (payment?.order_id) {
            await db.$transaction(async (tx) => {
              await tx.payments.update({
                where: { id: payment.id },
                data: { status: 'REFUNDED' }
              })

              await tx.orders.update({
                where: { id: payment.order_id! },
                data: { status: 'REFUND_PROCESSED' }
              })
            })
          }
        }
        break
      }

      // Payment Method Events
      case 'payment_method.attached': {
        event.data.object as Stripe.PaymentMethod
        break
      }

      case 'payment_method.detached': {
        event.data.object as Stripe.PaymentMethod
        break
      }

      // Account Events
      case 'account.updated': {
        const account = event.data.object as Stripe.Account

        // Find the shop with this Stripe account ID
        const shop = await db.shops.findFirst({
          where: { stripe_account_id: account.id }
        })

        if (!shop) {
          console.error('Shop not found for Stripe account:', account.id)
          return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
        }

        let status: 'PENDING' | 'ACTIVE' | 'RESTRICTED' = 'PENDING'

        // Account is fully enabled
        if (
          account.charges_enabled &&
          account.payouts_enabled &&
          account.details_submitted
        ) {
          status = 'ACTIVE'
        }
        // Account has restrictions
        else if (
          account.requirements?.disabled_reason ||
          account.requirements?.errors?.length ||
          account.requirements?.past_due?.length
        ) {
          status = 'RESTRICTED'
        }
        // Account is still pending
        else {
          status = 'PENDING'
        }

        console.log('Updating shop status:', {
          shopId: shop.id,
          newStatus: status,
          onboarding_completed: account.details_submitted
        })

        // Update shop based on account status
        await db.shops.update({
          where: { id: shop.id },
          data: {
            stripe_account_status: status,
            onboarding_completed: account.details_submitted
          }
        })
        break
      }

      case 'account.application.deauthorized': {
        const accountId = (event.data.object as { id: string }).id

        // Find and update the shop
        const shop = await db.shops.findFirst({
          where: { stripe_account_id: accountId }
        })

        if (shop) {
          await db.shops.update({
            where: { id: shop.id },
            data: {
              stripe_account_status: 'DEAUTHORIZED',
              onboarding_completed: false
            }
          })
        }
        break
      }

      case 'account.external_account.created':
      case 'account.external_account.updated':
      case 'account.external_account.deleted': {
        const accountId = (event.data.object as { account: string }).account
        const account = await stripe.accounts.retrieve(accountId)

        // Find and update the shop
        const shop = await db.shops.findFirst({
          where: { stripe_account_id: accountId }
        })

        if (shop) {
          await db.shops.update({
            where: { id: shop.id },
            data: {
              stripe_account_status: account.charges_enabled
                ? 'ACTIVE'
                : 'PENDING'
            }
          })
        }
        break
      }

      // Application Fee Events
      case 'application_fee.created': {
        break
      }
    }

    return new NextResponse('Webhook processed successfully', { status: 200 })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new NextResponse('Webhook processing failed', { status: 500 })
  }
}
