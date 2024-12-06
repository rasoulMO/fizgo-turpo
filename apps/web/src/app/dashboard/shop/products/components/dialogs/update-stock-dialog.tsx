// components/products/dialogs/update-stock-dialog.tsx
import { Minus, Plus } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface UpdateStockDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentStock: number
  quantityToAdd: number
  onQuantityChange: (quantity: number) => void
  onConfirm: () => void
  isLoading?: boolean
}

export function UpdateStockDialog({
  open,
  onOpenChange,
  currentStock,
  quantityToAdd,
  onQuantityChange,
  onConfirm,
  isLoading
}: UpdateStockDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Update Stock Quantity</AlertDialogTitle>
          <AlertDialogDescription>
            Current stock: {currentStock} units
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center gap-4 py-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              onQuantityChange(Math.max(quantityToAdd - 1, -currentStock))
            }
            disabled={isLoading}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            value={quantityToAdd}
            onChange={(e) => onQuantityChange(parseInt(e.target.value) || 0)}
            className="w-20 text-center"
            disabled={isLoading}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => onQuantityChange(quantityToAdd + 1)}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            New total: {currentStock + quantityToAdd}
          </span>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Stock'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
