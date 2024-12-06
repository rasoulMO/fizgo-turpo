import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

export async function POST() {
  try {
    const account = await stripe.accounts.create({
      controller: {
        stripe_dashboard: {
          type: 'none'
        },
        fees: {
          payer: 'application'
        },
        losses: {
          payments: 'application'
        },
        requirement_collection: 'application'
      },
      capabilities: {
        transfers: { requested: true }
      },
      country: 'IT'
    })

    return NextResponse.json({ account: account.id })
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      )
    }
    return NextResponse.json(
      { error: 'An unknown error occurred' },
      { status: 500 }
    )
  }
}
