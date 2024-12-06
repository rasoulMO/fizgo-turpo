// app/(customer)/checkout/components/payment-step.tsx
'use client'

import { useState } from 'react'
import { api } from '@/trpc/react'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { AddPaymentMethodDialog } from './add-payment-method-dialog'
import { PaymentMethodCard } from './payment-method-card'

interface PaymentStepProps {
  selectedPaymentMethodId?: string
  onSelect: (paymentMethodId: string) => void
}

export function PaymentStep({
  selectedPaymentMethodId,
  onSelect
}: PaymentStepProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const {
    data: paymentMethods,
    isLoading,
    isError,
    error,
    refetch
  } = api.payment.getAllPaymentMethods.useQuery()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="p-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-6 w-6" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center space-y-4 p-6">
        <p className="text-sm text-red-500">
          {error.message || 'Failed to load payment methods'}
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Select Payment Method</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Add New Payment Method
        </Button>
      </div>

      {paymentMethods?.length === 0 ? (
        <div className="flex flex-col items-center space-y-4 p-6">
          <p className="text-sm text-muted-foreground">
            No payment methods found
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            Add Payment Method
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {paymentMethods?.map((method) => (
            <PaymentMethodCard
              key={method.id}
              paymentMethod={method}
              isSelected={method.id === selectedPaymentMethodId}
              onSelect={() => onSelect(method.id)}
            />
          ))}
        </div>
      )}

      <AddPaymentMethodDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  )
}
