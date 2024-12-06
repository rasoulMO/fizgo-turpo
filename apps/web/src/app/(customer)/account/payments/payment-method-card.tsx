'use client'

import { useState } from 'react'
import { api } from '@/trpc/react'
import { type payment_methods } from '@prisma/client'
import { Archive, Check, CreditCard, MoreVertical, Trash } from 'lucide-react'

import { cn } from '@/utils/cn'
import { useToast } from '@/hooks/use-toast'
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
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

interface PaymentMethodCardProps {
  paymentMethod: payment_methods & { payments: { id: string }[] }
  isSelected: boolean
  onSelect: () => void
  variant?: 'select' | 'manage'
}

export function PaymentMethodCard({
  paymentMethod,
  isSelected,
  onSelect,
  variant = 'select'
}: PaymentMethodCardProps) {
  const { toast } = useToast()
  const utils = api.useUtils()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const hasTransactions = paymentMethod.payments.length > 0
  const canDelete = !paymentMethod.is_default && !hasTransactions
  const canArchive =
    !paymentMethod.is_default &&
    hasTransactions &&
    paymentMethod.status !== 'ARCHIVED'

  // Remove payment method (either delete or archive)
  const { mutate: removePaymentMethod } =
    api.payment.removePaymentMethod.useMutation({
      onSuccess: () => {
        utils.payment.getAllPaymentMethods.invalidate()
        toast({
          title: 'Success',
          description: hasTransactions
            ? 'Payment method archived successfully'
            : 'Payment method deleted successfully'
        })
        setIsDeleteDialogOpen(false)
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to remove payment method',
          variant: 'destructive'
        })
      }
    })

  // Set as default payment method
  const { mutate: setAsDefault } = api.payment.setAsDefault.useMutation({
    onSuccess: () => {
      utils.payment.getAllPaymentMethods.invalidate()
      toast({
        title: 'Success',
        description: 'Default payment method updated successfully'
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update default payment method',
        variant: 'destructive'
      })
    }
  })

  const handleDelete = () => setIsDeleteDialogOpen(true)
  const confirmDelete = () => removePaymentMethod(paymentMethod.id)
  const handleSetDefault = () => setAsDefault(paymentMethod.id)

  const getPaymentMethodStatus = () => {
    if (paymentMethod.status === 'ARCHIVED') return '(Archived)'
    if (paymentMethod.status === 'EXPIRED') return '(Expired)'
    return ''
  }

  return (
    <>
      <Card
        className={cn(
          'relative p-4 transition-all',
          variant === 'select' && 'cursor-pointer hover:border-primary',
          isSelected && 'border-primary',
          paymentMethod.status === 'ARCHIVED' && 'opacity-60'
        )}
        onClick={variant === 'select' ? onSelect : undefined}
      >
        <div className="flex justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-6 w-6" />
              <div>
                <p className="font-medium">
                  {paymentMethod.card_brand?.toUpperCase()} ••••{' '}
                  {paymentMethod.last4}{' '}
                  <span className="text-sm text-muted-foreground">
                    {getPaymentMethodStatus()}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Expires {paymentMethod.exp_month}/{paymentMethod.exp_year}
                </p>
              </div>
            </div>
            {paymentMethod.is_default && (
              <Button variant="secondary" size="sm" disabled>
                Default
              </Button>
            )}
          </div>

          {variant === 'manage' && paymentMethod.status !== 'ARCHIVED' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {paymentMethod.is_default ? (
                  <DropdownMenuItem disabled className="text-muted-foreground">
                    Default payment method
                  </DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuItem onClick={handleSetDefault}>
                      Set as default
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {(canDelete || canArchive) && (
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={handleDelete}
                      >
                        {canArchive ? (
                          <>
                            <Archive className="mr-2 h-4 w-4" />
                            Archive
                          </>
                        ) : (
                          <>
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </>
                        )}
                      </DropdownMenuItem>
                    )}
                  </>
                )}
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

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {hasTransactions
                ? 'Archive Payment Method'
                : 'Delete Payment Method'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {hasTransactions
                ? 'This payment method has been used in transactions. It will be archived instead of deleted and can still be viewed in your payment history.'
                : 'Are you sure you want to delete this payment method? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {hasTransactions ? 'Archive' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
