'use client'

import { api } from '@/trpc/react'
import { type customer_addresses } from '@prisma/client'
import { Check, MoreVertical, TrashIcon } from 'lucide-react'

import { cn } from '@/utils/cn'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

interface AddressCardProps {
  address: customer_addresses
  isSelected: boolean
  onSelect: () => void
  variant?: 'select' | 'manage'
}

export function AddressCard({
  address,
  isSelected,
  onSelect,
  variant = 'select'
}: AddressCardProps) {
  const { toast } = useToast()
  const utils = api.useUtils()

  const { mutate: deleteAddress } = api.address.delete.useMutation({
    onSuccess: () => {
      utils.address.getAll.invalidate()
      toast({
        title: 'Success',
        description: 'Address deleted successfully'
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete address',
        variant: 'destructive'
      })
    }
  })

  const { mutate: setDefault } = api.address.update.useMutation({
    onSuccess: () => {
      utils.address.getAll.invalidate()
      toast({
        title: 'Success',
        description: 'Default address updated successfully'
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update default address',
        variant: 'destructive'
      })
    }
  })

  const handleDelete = () => {
    if (address.is_default) {
      toast({
        title: 'Error',
        description: 'Cannot delete default address',
        variant: 'destructive'
      })
      return
    }
    deleteAddress(address.id)
  }

  const handleSetDefault = () => {
    setDefault({
      id: address.id,
      data: { is_default: true }
    })
  }

  return (
    <Card
      className={cn(
        'relative p-4 transition-all',
        variant === 'select' && 'cursor-pointer hover:border-primary',
        isSelected && 'border-primary'
      )}
      onClick={variant === 'select' ? onSelect : undefined}
    >
      <div className="flex justify-between">
        <div className="space-y-1">
          {address.is_default && (
            <Button variant="secondary" size="sm" className="mb-2" disabled>
              Default
            </Button>
          )}
          <p className="font-medium">{address.full_name}</p>
          <p className="text-sm text-muted-foreground">
            {address.phone_number}
          </p>
          <p className="text-sm">
            {address.address_line1}
            {address.address_line2 && `, ${address.address_line2}`}
          </p>
          <p className="text-sm">
            {address.city}, {address.state} {address.postal_code}
          </p>
          <p className="text-sm">{address.country}</p>
        </div>

        {variant === 'manage' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!address.is_default && (
                <>
                  <DropdownMenuItem onClick={handleSetDefault}>
                    Set as default
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                className="text-destructive"
                onClick={handleDelete}
                disabled={address.is_default}
              >
                <TrashIcon className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {isSelected && variant === 'select' && (
        <div className="absolute right-2 top-2">
          <Check className="h-4 w-4 text-primary" />
        </div>
      )}
    </Card>
  )
}
