'use client'

import { useState } from 'react'
import { api } from '@/trpc/react'
import { type payment_methods, type payments } from '@prisma/client'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import { AddPaymentMethodDialog } from './add-payment-method-dialog'
import { PaymentMethodCard } from './payment-method-card'

export interface PaymentMethodWithPayments extends payment_methods {
  payments: Pick<payments, 'id'>[]
}
interface PaymentsPageProps {
  initialPaymentMethods: PaymentMethodWithPayments[]
}

export default function PaymentsPage({
  initialPaymentMethods
}: PaymentsPageProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data: paymentMethods } = api.payment.getAllPaymentMethods.useQuery(
    undefined,
    {
      initialData: initialPaymentMethods,
      refetchOnMount: false
    }
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payment Methods</h2>
          <p className="text-muted-foreground">
            Manage your saved payment methods.
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Payment Method
        </Button>
      </div>

      <Card>
        <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
          {paymentMethods?.map((method) => (
            <PaymentMethodCard
              key={method.id}
              paymentMethod={method}
              isSelected={false}
              onSelect={() => {}}
              variant="manage"
            />
          ))}

          {paymentMethods?.length === 0 && (
            <div className="col-span-2 flex flex-col items-center justify-center space-y-2 rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No payment methods found
              </p>
              <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                Add your first payment method
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AddPaymentMethodDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  )
}
