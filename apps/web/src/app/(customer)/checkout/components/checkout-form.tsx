// app/(customer)/checkout/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/trpc/react'
import { useElements, useStripe } from '@stripe/react-stripe-js'
import { CheckCircle } from 'lucide-react'

import { useCartActions } from '@/hooks/use-card-action'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

import { AddressStep } from './address-step'
import { OrderSummary } from './order-summary'
import { PaymentStep } from './payment-step'
import { ReviewStep } from './review-step'

const STEPS = [
  { id: 'address', title: 'Delivery Address' },
  { id: 'payment', title: 'Payment Method' },
  { id: 'review', title: 'Review Order' }
]

export function CheckoutForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedAddressId, setSelectedAddressId] = useState<string>()
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] =
    useState<string>()
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const { items, getTotal, clearCart } = useCartActions()
  const { toast } = useToast()
  const stripe = useStripe()
  const elements = useElements()

  const { mutateAsync: createOrder } = api.order.create.useMutation()
  const { mutateAsync: createPaymentIntent } =
    api.payment.createPaymentIntent.useMutation()
  const { data: cart } = api.cart.getCart.useQuery()

  const { data: selectedPaymentMethod } =
    api.payment.getPaymentMethodById.useQuery(selectedPaymentMethodId!, {
      enabled: !!selectedPaymentMethodId,
      refetchOnWindowFocus: false
    })

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId)
  }

  const handlePaymentMethodSelect = (paymentMethodId: string) => {
    setSelectedPaymentMethodId(paymentMethodId)
  }

  const handleSubmit = async () => {
    if (!stripe || !elements) {
      toast({
        title: 'Error',
        description: 'Stripe has not been initialized',
        variant: 'destructive'
      })
      return
    }

    if (
      !selectedAddressId ||
      !selectedPaymentMethodId ||
      !cart ||
      !selectedPaymentMethod
    ) {
      toast({
        title: 'Error',
        description: 'Please complete all required fields',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    try {
      const order = await createOrder({
        address_id: selectedAddressId,
        cart_id: cart.id
      })

      const { clientSecret } = await createPaymentIntent({
        order_id: order.id,
        stripe_payment_method_id: selectedPaymentMethod.stripe_payment_method_id
      })

      if (!clientSecret) {
        throw new Error('Failed to create payment intent')
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: selectedPaymentMethod.stripe_payment_method_id
        }
      )

      if (error) {
        throw error
      }

      if (paymentIntent.status === 'succeeded') {
        await clearCart()
        router.push(`/checkout/confirmation/${order.id}`)
      } else {
        throw new Error('Payment failed')
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to process your order',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isProcessing =
    isLoading || (!selectedPaymentMethod && !!selectedPaymentMethodId)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Progress value={((currentStep + 1) / STEPS.length) * 100} />
        <div className="mt-4 flex justify-between">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center ${
                index <= currentStep ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <CheckCircle
                className={`mr-2 h-5 w-5 ${
                  index < currentStep ? 'fill-current' : ''
                }`}
              />
              <span>{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="p-6">
            {currentStep === 0 && (
              <AddressStep
                selectedAddressId={selectedAddressId}
                onSelect={handleAddressSelect}
              />
            )}
            {currentStep === 1 && (
              <div className="space-y-4">
                <PaymentStep
                  selectedPaymentMethodId={selectedPaymentMethodId}
                  onSelect={handlePaymentMethodSelect}
                />
              </div>
            )}
            {currentStep === 2 && (
              <ReviewStep
                addressId={selectedAddressId}
                paymentMethodId={selectedPaymentMethodId}
                items={items}
              />
            )}

            <div className="mt-6 flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                Back
              </Button>
              {currentStep === STEPS.length - 1 ? (
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isProcessing ? (
                    <div className="flex items-center">
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      Processing...
                    </div>
                  ) : (
                    'Place Order'
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 0 && !selectedAddressId) ||
                    (currentStep === 1 && !selectedPaymentMethodId)
                  }
                >
                  Continue
                </Button>
              )}
            </div>
          </Card>
        </div>

        <OrderSummary items={items} total={getTotal()} />
      </div>
    </div>
  )
}
