// app/admin/delivery-partners/[appNumber]/delivery-status.tsx
import { DeliveryPartnerApplicationStatus } from '@prisma/client'

interface DeliveryStatusProps {
  status: DeliveryPartnerApplicationStatus
}

export function DeliveryStatus({ status }: DeliveryStatusProps) {
  const statusStyles = {
    DRAFT: 'bg-gray-100 text-gray-800',
    SUBMITTED: 'bg-blue-100 text-blue-800',
    UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800'
  } as const

  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-medium ${statusStyles[status]}`}
    >
      {status.replace('_', ' ')}
    </span>
  )
}
