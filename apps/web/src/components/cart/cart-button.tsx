'use client'

import { useState } from 'react'
import { ShoppingBag } from 'lucide-react'

import { useCartActions } from '@/hooks/use-card-action'
import { Button } from '@/components/ui/button'

import { CartDialog } from './cart-dialog'

export function CartButton() {
  const [open, setOpen] = useState(false)
  const { items } = useCartActions()
  const itemCount = items.length

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="relative"
      >
        <ShoppingBag className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
            {itemCount}
          </span>
        )}
      </Button>
      <CartDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
