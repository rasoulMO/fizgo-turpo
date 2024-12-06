'use client'

import { useMemo } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

import { useCartActions } from '@/hooks/use-card-action'

import { CheckoutForm } from './checkout-form'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

export function CheckoutContent() {
  const { items, getTotal } = useCartActions()

  // Calculate the total in cents for Stripe
  const amount = Math.round(getTotal() * 100)

  const options = useMemo(
    () => ({
      mode: 'payment' as const,
      amount,
      currency: 'usd',
      payment_method_types: ['card'],
      appearance: {
        theme: 'stripe' as const,
        variables: {
          colorPrimary: '#0F172A'
        }
      }
    }),
    [amount]
  )

  if (amount === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <p className="text-muted-foreground">Add items to get started</p>
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm />
    </Elements>
  )
}
