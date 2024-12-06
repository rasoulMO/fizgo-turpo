'use client'

import { useState } from 'react'
import { api } from '@/trpc/react'
import { type customer_addresses } from '@prisma/client'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import { AddAddressDialog } from './add-address-dialog'
import { AddressCard } from './address-card'

interface AddressesPageProps {
  initialAddresses: customer_addresses[]
}

export default function AddressesPage({
  initialAddresses
}: AddressesPageProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data: addresses } = api.address.getAll.useQuery(undefined, {
    initialData: initialAddresses,
    refetchOnMount: false
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Addresses</h2>
          <p className="text-muted-foreground">Manage your saved addresses.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Address
        </Button>
      </div>

      <Card>
        <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
          {addresses?.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              isSelected={false}
              onSelect={() => {}}
              variant="manage"
            />
          ))}

          {addresses?.length === 0 && (
            <div className="col-span-2 flex flex-col items-center justify-center space-y-2 rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No addresses found
              </p>
              <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                Add your first address
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AddAddressDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  )
}
