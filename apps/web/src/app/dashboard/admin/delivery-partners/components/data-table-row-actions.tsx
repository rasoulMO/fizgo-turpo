// app/admin/delivery-partners/components/data-table-row-actions.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/trpc/react'
import { delivery_partner_applications } from '@prisma/client'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'
import { toast } from 'sonner'

import { ROUTES } from '@/utils/paths'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row
}: DataTableRowActionsProps<TData>) {
  const router = useRouter()
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  const application = row.original as delivery_partner_applications

  const reviewMutation = api.deliveryPartnerApplications.review.useMutation({
    onSuccess: () => {
      toast.success('Application status updated successfully')
      router.refresh()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update application status')
    }
  })

  const handleStatusUpdate = async (
    status: 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW',
    reason?: string
  ) => {
    try {
      await reviewMutation.mutateAsync({
        id: application.id,
        status,
        ...(status === 'REJECTED' && {
          rejection_reason: reason
        }),
        notes: []
      })

      setShowReviewDialog(false)
      setShowRejectDialog(false)
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const isActionable =
    application.status === 'SUBMITTED' || application.status === 'UNDER_REVIEW'

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem
            onClick={() =>
              router.push(
                ROUTES.ADMIN_DELIVERY_PARTNERS +
                  `/${application.application_number}`
              )
            }
          >
            View details
          </DropdownMenuItem>
          {isActionable && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowReviewDialog(true)}
                className="text-blue-600"
                disabled={reviewMutation.isPending}
              >
                Start review
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowRejectDialog(true)}
                className="text-red-600"
                disabled={reviewMutation.isPending}
              >
                Reject
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start Application Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to start reviewing this delivery partner
              application? This will change the status to "under review".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleStatusUpdate('UNDER_REVIEW')}
              disabled={reviewMutation.isPending}
            >
              {reviewMutation.isPending ? 'Starting Review...' : 'Start Review'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <RejectionDialog
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
        onSubmit={(reason) => handleStatusUpdate('REJECTED', reason)}
        isPending={reviewMutation.isPending}
      />
    </>
  )
}

const RejectionDialog = ({
  open,
  onOpenChange,
  onSubmit,
  isPending
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (reason: string) => void
  isPending: boolean
}) => {
  const [reason, setReason] = useState('')

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reject Application</AlertDialogTitle>
          <AlertDialogDescription>
            Please provide a reason for rejecting this delivery partner
            application.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="my-4">
          <textarea
            className="w-full rounded-md border p-2"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter rejection reason..."
            rows={3}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onSubmit(reason)}
            disabled={isPending || !reason.trim()}
            className="bg-red-600"
          >
            {isPending ? 'Rejecting...' : 'Reject Application'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
