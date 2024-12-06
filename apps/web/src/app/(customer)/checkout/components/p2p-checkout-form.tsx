'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/trpc/react'
import { type payment_methods } from '@prisma/client'
import { useStripe } from '@stripe/react-stripe-js'

import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

import { AddressStep } from './address-step'
import { P2POrderSummary } from './p2p-order-summary'
import { PaymentStep } from './payment-step'

const STEPS = [
  { id: 'shipping', title: 'Shipping Address' },
  { id: 'payment', title: 'Payment Method' }
]

interface P2PCheckoutFormProps {
  offerId: string
}

export function P2PCheckoutForm({ offerId }: P2PCheckoutFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedAddressId, setSelectedAddressId] = useState<string>()
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] =
    useState<string>()
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<payment_methods>()
  const [isProcessing, setIsProcessing] = useState(false)

  const { toast } = useToast()
  const stripe = useStripe()

  // Get offer details
  const { data: offer } = api.p2p.getOfferById.useQuery(offerId)

  const createPaymentIntent = api.p2p.createPaymentIntent.useMutation({
    onSuccess: async (data) => {
      if (!stripe || !selectedPaymentMethod) {
        toast({
          title: 'Error',
          description: 'Payment processing is not available',
          variant: 'destructive'
        })
        setIsProcessing(false)
        return
      }

      try {
        const { error, paymentIntent } = await stripe.confirmCardPayment(
          data.clientSecret!,
          {
            payment_method: selectedPaymentMethod.stripe_payment_method_id
          }
        )

        if (error) {
          toast({
            title: 'Payment Failed',
            description: error.message,
            variant: 'destructive'
          })
          setIsProcessing(false)
          return
        }

        if (paymentIntent.status === 'succeeded') {
          toast({
            title: 'Payment Successful',
            description: 'Your payment has been processed successfully.'
          })

          // Redirect to confirmation page
          router.push(`/checkout/${offerId}/confirmation`)
        } else {
          setIsProcessing(false)
          toast({
            title: 'Payment Status',
            description: `Payment status: ${paymentIntent.status}. Please try again.`,
            variant: 'destructive'
          })
        }
      } catch (error) {
        console.error(error)
        toast({
          title: 'Payment Error',
          description: 'An unexpected error occurred',
          variant: 'destructive'
        })
        setIsProcessing(false)
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong',
        variant: 'destructive'
      })
      setIsProcessing(false)
    }
  })

  // Query to get payment methods
  const { data: paymentMethods } = api.payment.getAllPaymentMethods.useQuery(
    undefined,
    {
      enabled: currentStep === 1
    }
  )

  // Update selectedPaymentMethod when a payment method is selected
  useEffect(() => {
    if (selectedPaymentMethodId && paymentMethods) {
      const method = paymentMethods.find(
        (m) => m.id === selectedPaymentMethodId
      )
      setSelectedPaymentMethod(method)
    }
  }, [selectedPaymentMethodId, paymentMethods])

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

  const handleSubmit = async () => {
    if (
      !stripe ||
      !selectedAddressId ||
      !selectedPaymentMethodId ||
      !selectedPaymentMethod
    ) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }

    setIsProcessing(true)
    try {
      await createPaymentIntent.mutateAsync({
        offerId,
        addressId: selectedAddressId,
        paymentMethodId: selectedPaymentMethod.stripe_payment_method_id
      })
    } catch (error) {
      setIsProcessing(false)
    }
  }

  if (!offer) {
    return <div>Loading...</div>
  }

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
                onSelect={setSelectedAddressId}
              />
            )}
            {currentStep === 1 && (
              <PaymentStep
                selectedPaymentMethodId={selectedPaymentMethodId}
                onSelect={setSelectedPaymentMethodId}
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
                <Button onClick={handleSubmit} disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : 'Pay Now'}
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

        <P2POrderSummary offer={offer} />
      </div>
    </div>
  )
}
