'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/trpc/react'
import type { partner_applications } from '@prisma/client'
import { CheckIcon, Cross2Icon } from '@radix-ui/react-icons'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

interface PartnerActionsProps {
  application: partner_applications & {
    user?: {
      id: string
      email?: string | null
      full_name?: string | null
    } | null
    reviewer?: {
      id: string
      email?: string | null
      full_name?: string | null
    } | null
  }
}

export function PartnerActions({ application }: PartnerActionsProps) {
  const router = useRouter()
  const [isApproveOpen, setIsApproveOpen] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  // Use tRPC mutation for reviewing applications
  const reviewMutation = api.partnerApplications.review.useMutation({
    onSuccess: (data) => {
      toast.success(`Application ${data.status.toLowerCase()} successfully`)
      router.refresh()
      // Close dialogs based on status
      if (data.status === 'REJECTED') setIsRejectOpen(false)
      if (data.status === 'APPROVED') setIsApproveOpen(false)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update application status')
    }
  })

  const handleStatusUpdate = async (
    status: 'APPROVED' | 'REJECTED',
    reason?: string
  ) => {
    try {
      await reviewMutation.mutateAsync({
        id: application.id,
        status,
        ...(status === 'REJECTED' && {
          rejection_reason: reason
        }),
        notes: [] // Optional: Add notes if needed
      })
    } catch (error) {
      // Error handling is done in mutation callbacks
      console.error('Error updating application:', error)
    }
  }

  if (!['SUBMITTED', 'UNDER_REVIEW'].includes(application.status || '')) {
    return null
  }

  return (
    <>
      <div className="flex gap-4">
        <Button
          onClick={() => setIsApproveOpen(true)}
          className="gap-2"
          variant="default"
          disabled={reviewMutation.isPending}
        >
          <CheckIcon className="h-4 w-4" />
          Approve
        </Button>
        <Button
          onClick={() => setIsRejectOpen(true)}
          className="gap-2"
          variant="destructive"
          disabled={reviewMutation.isPending}
        >
          <Cross2Icon className="h-4 w-4" />
          Reject
        </Button>
      </div>

      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this partner application? This
              will create a new shop account for the partner.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsApproveOpen(false)}
              disabled={reviewMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleStatusUpdate('APPROVED')}
              disabled={reviewMutation.isPending}
            >
              {reviewMutation.isPending
                ? 'Approving...'
                : 'Approve Application'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this application.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter rejection reason..."
            className="min-h-[100px]"
            disabled={reviewMutation.isPending}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectOpen(false)}
              disabled={reviewMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleStatusUpdate('REJECTED', rejectionReason)}
              disabled={reviewMutation.isPending || !rejectionReason.trim()}
            >
              {reviewMutation.isPending ? 'Rejecting...' : 'Reject Application'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Optional: Add type for review mutation response
interface ReviewMutationResponse {
  success: boolean
  error?: string
  data?: {
    status: 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW'
    // Add other fields as needed
  }
}
