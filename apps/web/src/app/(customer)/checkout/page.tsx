// app/(customer)/checkout/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { api } from '@/trpc/react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { ShoppingBag } from 'lucide-react'

import { useCartActions } from '@/hooks/use-card-action'
import { Button } from '@/components/ui/button'

import { CheckoutForm } from './components/checkout-form'
import CheckoutLoading from './loading'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

export default function CheckoutPage() {
  const router = useRouter()
  const { getTotal } = useCartActions()
  const { data: cart, isLoading } = api.cart.getCart.useQuery()

  const amount = Math.round(getTotal() * 100)

  // Show loading state while cart is being fetched
  if (isLoading) {
    return <CheckoutLoading />
  }

  // Show empty cart message
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 px-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold">Your cart is empty</h2>
          <p className="mt-2 text-muted-foreground">
            Add items to your cart to proceed with checkout
          </p>
        </div>
        <Button onClick={() => router.push('/')} className="mt-4">
          Continue Shopping
        </Button>
      </div>
    )
  }

  const options = {
    mode: 'payment' as const,
    amount,
    currency: 'usd',
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#0F172A'
      }
    }
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm />
    </Elements>
  )
}
