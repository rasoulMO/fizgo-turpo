'use client'

import { useEffect, useState } from 'react'
import { api } from '@/trpc/react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

import { P2PCheckoutForm } from '../components/p2p-checkout-form'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

interface P2PCheckoutPageProps {
  params: {
    offerId: string
  }
}

export default function P2PCheckoutPage({ params }: P2PCheckoutPageProps) {
  const [options, setOptions] = useState<any>(null)
  const { data: offer } = api.p2p.getOfferById.useQuery(params.offerId)

  useEffect(() => {
    if (offer) {
      // Calculate total with shipping fee
      const shippingFee = 5 // Fixed shipping fee
      const total = Number(offer.offer_amount) + shippingFee
      const amount = Math.round(total * 100) // Convert to cents

      setOptions({
        mode: 'payment' as const,
        amount,
        currency: 'usd',
        appearance: {
          theme: 'stripe' as const,
          variables: {
            colorPrimary: '#0F172A'
          }
        }
      })
    }
  }, [offer])

  if (!offer || !options) {
    return <div>Loading...</div>
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <P2PCheckoutForm offerId={params.offerId} />
    </Elements>
  )
}
