'use client'

import { useState } from 'react'
import { api } from '@/trpc/react'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { AddAddressDialog } from './add-address-dialog'
import { AddressCard } from './address-card'

interface AddressStepProps {
  selectedAddressId?: string
  onSelect: (addressId: string) => void
}

export function AddressStep({ selectedAddressId, onSelect }: AddressStepProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { data: addresses } = api.address.getAll.useQuery()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Select Delivery Address</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Add New Address
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {addresses?.map((address) => (
          <AddressCard
            key={address.id}
            address={address}
            isSelected={address.id === selectedAddressId}
            onSelect={() => onSelect(address.id)}
          />
        ))}
      </div>

      <AddAddressDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  )
}
