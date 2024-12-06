import { notFound } from 'next/navigation'
import { api } from '@/trpc/server'
import { PartnerApplicationStatus } from '@prisma/client'

import { useSupabaseServer } from '@/utils/supabase/server'
import { checkAuth } from '@/utils/utils'

import { PartnerApplicationStatusPreview } from './partner-application-status'
import { PartnerResubmitForm } from './partner-resubmit-form'

export const revalidate = 0

interface PageProps {
  params: {
    appNumber: string
  }
}

export default async function PartnerApplicationStatusPage({
  params
}: PageProps) {
  const supabase = useSupabaseServer()
  await checkAuth(supabase)

  const application = await api.partnerApplications.getByApplicationNumber(
    params.appNumber
  )

  if (!application || application.status === null) {
    notFound()
  }

  const validApplication = {
    ...application,
    status: application.status as PartnerApplicationStatus,
    reviewed_by: application.reviewed_by
      ? { full_name: application.reviewed_by }
      : null
  }

  return (
    <div>
      <PartnerApplicationStatusPreview application={validApplication} />
      {application.status === 'REJECTED' && (
        <PartnerResubmitForm application={application} />
      )}
    </div>
  )
}
