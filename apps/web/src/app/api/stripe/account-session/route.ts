// src/app/api/stripe/account-session/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.account) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      )
    }

    const accountSession = await stripe.accountSessions.create({
      account: body.account,
      components: {
        account_onboarding: {
          enabled: !body.isManagement
        },
        account_management: {
          enabled: body.isManagement,
          features: {
            external_account_collection: true
          }
        }
      }
    })

    return NextResponse.json({
      client_secret: accountSession.client_secret
    })
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
