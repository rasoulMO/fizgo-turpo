import { PartnerApplicationStatus } from '@prisma/client'

interface PartnerStatusProps {
  status: PartnerApplicationStatus
}

export function PartnerStatus({ status }: PartnerStatusProps) {
  const statusStyles = {
    DRAFT: { label: 'Draft', variant: 'secondary' },
    SUBMITTED: { label: 'Submitted', variant: 'warning' },
    UNDER_REVIEW: { label: 'Under Review', variant: 'info' },
    APPROVED: { label: 'Approved', variant: 'success' },
    REJECTED: { label: 'Rejected', variant: 'destructive' }
  } as const

  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-medium ${statusStyles[status]}`}
    >
      {status.replace('_', ' ')}
    </span>
  )
}
