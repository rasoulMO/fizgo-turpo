// src/app/delivery/[appNumber]/delivery-application-status.tsx
import { DeliveryPartnerApplicationStatus } from '@prisma/client'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

interface DeliveryApplicationStatusProps {
  application: {
    id: string
    application_number: string
    full_name: string
    email: string
    phone_number: string
    vehicle_type: string
    vehicle_make?: string | null
    vehicle_model?: string | null
    has_delivery_experience: boolean
    years_of_experience?: number | null
    preferred_work_areas: string[]
    status: DeliveryPartnerApplicationStatus
    submitted_at: Date | null
    reviewed_at: Date | null
    notes?: string[]
    rejection_reason?: string | null
    reviewer?: {
      id: string
      email: string | null
      full_name: string | null
      avatar_url: string | null
      role: string
    } | null
  }
}

export function DeliveryApplicationStatusPreview({
  application
}: DeliveryApplicationStatusProps) {
  const getStatusColor = (status: DeliveryPartnerApplicationStatus) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-500'
      case 'SUBMITTED':
        return 'bg-blue-500'
      case 'UNDER_REVIEW':
        return 'bg-yellow-500'
      case 'APPROVED':
        return 'bg-green-500'
      case 'REJECTED':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Application Details</h2>
          <p className="text-sm text-muted-foreground">
            #{application.application_number}
          </p>
        </div>
        <Badge className={getStatusColor(application.status)}>
          {application.status}
        </Badge>
      </div>

      <Card className="p-6">
        <div className="grid gap-6">
          <div>
            <h3 className="font-semibold">Personal Information</h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{application.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{application.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone Number</p>
                <p className="font-medium">{application.phone_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Experience</p>
                <p className="font-medium">
                  {application.has_delivery_experience
                    ? `${application.years_of_experience} years`
                    : 'No prior experience'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Vehicle Information</h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Vehicle Type</p>
                <p className="font-medium">
                  {application.vehicle_type.charAt(0) +
                    application.vehicle_type.slice(1).toLowerCase()}
                </p>
              </div>
              {application.vehicle_make && (
                <div>
                  <p className="text-sm text-muted-foreground">Vehicle Make</p>
                  <p className="font-medium">{application.vehicle_make}</p>
                </div>
              )}
              {application.vehicle_model && (
                <div>
                  <p className="text-sm text-muted-foreground">Vehicle Model</p>
                  <p className="font-medium">{application.vehicle_model}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Work Areas</h3>
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {application.preferred_work_areas.map((area, index) => (
                  <Badge key={index} variant="secondary">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Application Timeline</h3>
            <div className="mt-4 grid gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Submitted At</p>
                <p className="font-medium">
                  {application.submitted_at
                    ? new Date(application.submitted_at).toLocaleString()
                    : 'Not submitted yet'}
                </p>
              </div>
              {application.reviewed_at && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Reviewed At</p>
                    <p className="font-medium">
                      {new Date(application.reviewed_at).toLocaleString()}
                    </p>
                  </div>
                  {application.reviewed_at && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Reviewed At
                        </p>
                        <p className="font-medium">
                          {new Date(application.reviewed_at).toLocaleString()}
                        </p>
                      </div>
                      {application.reviewer && (
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Reviewed by
                          </p>
                          <p className="font-medium">
                            {application.reviewer.full_name || 'System'}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                  {application.status === 'REJECTED' &&
                    application.rejection_reason && (
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Rejection Reason
                        </p>
                        <p className="font-medium text-red-600">
                          {application.rejection_reason}
                        </p>
                      </div>
                    )}
                </>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
