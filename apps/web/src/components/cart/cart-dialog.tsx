'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

import { Cart } from './cart'

interface CartDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartDialog({ open, onOpenChange }: CartDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Shopping Cart</DialogTitle>
        </DialogHeader>
        <Cart />
      </DialogContent>
    </Dialog>
  )
}
