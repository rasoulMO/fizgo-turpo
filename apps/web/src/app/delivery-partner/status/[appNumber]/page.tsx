import { notFound } from 'next/navigation'
import { api } from '@/trpc/server'
import { DeliveryPartnerApplicationStatus } from '@prisma/client'

import { useSupabaseServer } from '@/utils/supabase/server'
import { checkAuth } from '@/utils/utils'

import { DeliveryApplicationStatusPreview } from './delivery-application-status'
import { DeliveryResubmitForm } from './delivery-resubmit-form'

export const revalidate = 0

interface PageProps {
  params: {
    appNumber: string
  }
}

export default async function DeliveryApplicationStatusPage({
  params
}: PageProps) {
  const supabase = useSupabaseServer()
  await checkAuth(supabase)

  const application =
    await api.deliveryPartnerApplications.getByApplicationNumber(
      params.appNumber
    )

  if (!application || application.status === null) {
    notFound()
  }

  const validApplication = {
    ...application,
    status: application.status as DeliveryPartnerApplicationStatus,
    reviewed_by: application.reviewed_by
      ? { full_name: application.reviewed_by }
      : null
  }

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <DeliveryApplicationStatusPreview application={validApplication} />
        {application.status === 'REJECTED' && (
          <DeliveryResubmitForm application={application} />
        )}
      </div>
    </div>
  )
}
