// app/(checkout)/checkout/components/address-card.tsx
'use client'

import { type customer_addresses } from '@prisma/client'
import { Check } from 'lucide-react'

import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface AddressCardProps {
  address: customer_addresses
  isSelected: boolean
  onSelect: () => void
}

export function AddressCard({
  address,
  isSelected,
  onSelect
}: AddressCardProps) {
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
      {address.is_default && (
        <Button variant="secondary" size="sm" className="mb-2" disabled>
          Default
        </Button>
      )}
      <div className="space-y-1">
        <p className="font-medium">{address.full_name}</p>
        <p className="text-sm text-muted-foreground">{address.phone_number}</p>
        <p className="text-sm">
          {address.address_line1}
          {address.address_line2 && `, ${address.address_line2}`}
        </p>
        <p className="text-sm">
          {address.city}, {address.state} {address.postal_code}
        </p>
        <p className="text-sm">{address.country}</p>
      </div>
    </Card>
  )
}
