'use client'

import { useState } from 'react'
import { api } from '@/trpc/react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  CardElement,
  Elements,
  useElements,
  useStripe
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

const paymentMethodSchema = z.object({
  is_default: z.boolean().default(false)
})

type PaymentMethodFormValues = z.infer<typeof paymentMethodSchema>

function AddPaymentMethodForm({
  onSuccess,
  onOpenChange
}: {
  onSuccess: () => void
  onOpenChange: (open: boolean) => void
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const stripe = useStripe()
  const elements = useElements()
  const utils = api.useUtils()

  const form = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      is_default: false
    }
  })

  const { mutateAsync: savePaymentMethod } =
    api.payment.savePaymentMethod.useMutation({
      onSuccess: () => {
        utils.payment.getAllPaymentMethods.invalidate()
        toast({
          title: 'Success',
          description: 'Payment method has been added successfully.'
        })
        onSuccess()
        onOpenChange(false)
        form.reset()
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to add payment method',
          variant: 'destructive'
        })
      }
    })

  const onSubmit = async (values: PaymentMethodFormValues) => {
    if (!stripe || !elements) {
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      return
    }

    setIsSubmitting(true)
    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement
      })

      if (error) {
        throw new Error(error.message)
      }

      if (!paymentMethod) {
        throw new Error('Failed to create payment method')
      }

      await savePaymentMethod({
        stripe_payment_method_id: paymentMethod.id,
        type: 'CARD',
        last4: paymentMethod.card?.last4 ?? '',
        exp_month: paymentMethod.card?.exp_month ?? 1,
        exp_year: paymentMethod.card?.exp_year ?? 2024,
        card_brand: paymentMethod.card?.brand ?? '',
        is_default: values.is_default
      })
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Card Details</label>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#32325d',
                  '::placeholder': {
                    color: '#aab7c4'
                  }
                },
                invalid: {
                  color: '#dc2626'
                }
              }
            }}
          />
        </div>

        <FormField
          control={form.control}
          name="is_default"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Set as Default Payment Method</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !stripe}>
            {isSubmitting ? 'Adding...' : 'Add Payment Method'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

interface AddPaymentMethodDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddPaymentMethodDialog({
  open,
  onOpenChange
}: AddPaymentMethodDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Payment Method</DialogTitle>
        </DialogHeader>
        <Elements stripe={stripePromise}>
          <AddPaymentMethodForm
            onSuccess={() => onOpenChange(false)}
            onOpenChange={onOpenChange}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  )
}
