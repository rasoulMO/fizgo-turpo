// components/products/dialogs/update-threshold-dialog.tsx
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
import { Input } from '@/components/ui/input'

interface UpdateThresholdDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentThreshold: number
  newThreshold: number
  onThresholdChange: (threshold: number) => void
  onConfirm: () => void
  isLoading?: boolean
}

export function UpdateThresholdDialog({
  open,
  onOpenChange,
  currentThreshold,
  newThreshold,
  onThresholdChange,
  onConfirm,
  isLoading
}: UpdateThresholdDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Set Low Stock Threshold</AlertDialogTitle>
          <AlertDialogDescription>
            Current threshold: {currentThreshold} units
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center gap-4 py-4">
          <Input
            type="number"
            value={newThreshold}
            onChange={(e) => onThresholdChange(parseInt(e.target.value) || 0)}
            min={0}
            className="w-24"
            disabled={isLoading}
          />
          <span className="text-sm text-muted-foreground">units</span>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Threshold'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
