'use client'

import { type payment_methods } from '@prisma/client'
import { Check, CreditCard } from 'lucide-react'

import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface PaymentMethodCardProps {
  paymentMethod: payment_methods
  isSelected: boolean
  onSelect: () => void
}

export function PaymentMethodCard({
  paymentMethod,
  isSelected,
  onSelect
}: PaymentMethodCardProps) {
  const cardBrandIcon = () => {
    return <CreditCard className="h-6 w-6" />
  }

  return (
    <Card
      className={cn(
        'relative cursor-pointer p-4 transition-all hover:border-primary',
        isSelected && 'border-primary'
      )}
      onClick={onSelect}
    >
      {isSelected && (
        <div className="absolute right-2 top-2">
          <Check className="h-4 w-4 text-primary" />
        </div>
      )}
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          {cardBrandIcon()}
          <div>
            <p className="font-medium">
              {paymentMethod.card_brand?.toUpperCase()} ••••{' '}
              {paymentMethod.last4}
            </p>
            <p className="text-sm text-muted-foreground">
              Expires {paymentMethod.exp_month}/{paymentMethod.exp_year}
            </p>
          </div>
        </div>
        {paymentMethod.is_default && (
          <Button variant="secondary" size="sm" className="mt-2" disabled>
            Default
          </Button>
        )}
      </div>
    </Card>
  )
}
