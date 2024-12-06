// app/admin/delivery-partners/[appNumber]/page.tsx
import { api } from '@/trpc/server'
import { format } from 'date-fns'

import { Separator } from '@/components/ui/separator'

import { DeliveryActions } from './delivery-actions'
import { DeliveryStatus } from './delivery-status'

export const revalidate = 0

interface PageProps {
  params: {
    appNumber: string
  }
}

export default async function DeliveryPartnerDetailPage({ params }: PageProps) {
  const application =
    await api.deliveryPartnerApplications.getByApplicationNumberAdmin(
      params.appNumber
    )

  if (!application) {
    return (
      <div className="container py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h1 className="text-xl font-semibold text-red-600">
            Application Not Found
          </h1>
          <p className="mt-2 text-sm text-red-700">
            The requested application could not be found. Please check the
            application number and try again.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container grid gap-8 py-8">
      <div className="flex items-center justify-between">
        <div className="grid gap-1">
          <h1 className="text-3xl font-bold">
            Delivery Partner Application Details
          </h1>
          <p className="text-muted-foreground">
            Review and manage delivery partner application
          </p>
        </div>
        <DeliveryActions application={application} />
      </div>

      <div className="grid gap-6">
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <div className="grid gap-1">
              <p className="text-sm text-muted-foreground">
                Application Number
              </p>
              <p className="font-medium">{application.application_number}</p>
            </div>
            <DeliveryStatus status={application.status} />
          </div>

          <Separator />

          <div className="grid gap-4">
            <h2 className="font-semibold">Personal Information</h2>
            <div className="grid gap-4 rounded-lg border p-4">
              <div className="grid gap-4 md:grid-cols-2">
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
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">
                    {format(new Date(application.date_of_birth), 'PPP')}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{application.address}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4">
            <h2 className="font-semibold">Vehicle Information</h2>
            <div className="grid gap-4 rounded-lg border p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Vehicle Type</p>
                  <p className="font-medium">
                    {application.vehicle_type.charAt(0) +
                      application.vehicle_type.slice(1).toLowerCase()}
                  </p>
                </div>
                {application.vehicle_make && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Vehicle Make
                    </p>
                    <p className="font-medium">{application.vehicle_make}</p>
                  </div>
                )}
                {application.vehicle_model && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Vehicle Model
                    </p>
                    <p className="font-medium">{application.vehicle_model}</p>
                  </div>
                )}
                {application.vehicle_year && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Vehicle Year
                    </p>
                    <p className="font-medium">{application.vehicle_year}</p>
                  </div>
                )}
                {application.vehicle_plate_number && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Plate Number
                    </p>
                    <p className="font-medium">
                      {application.vehicle_plate_number}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4">
            <h2 className="font-semibold">Experience & Availability</h2>
            <div className="grid gap-4 rounded-lg border p-4">
              <div className="grid gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Delivery Experience
                  </p>
                  <p className="font-medium">
                    {application.has_delivery_experience
                      ? `${application.years_of_experience} years`
                      : 'No prior experience'}
                  </p>
                </div>
                {application.previous_companies &&
                  application.previous_companies.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Previous Companies
                      </p>
                      <ul className="list-inside list-disc">
                        {application.previous_companies.map(
                          (company, index) => (
                            <li key={index} className="font-medium">
                              {company}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                <div>
                  <p className="text-sm text-muted-foreground">
                    Preferred Work Areas
                  </p>
                  <ul className="list-inside list-disc">
                    {application.preferred_work_areas.map((area, index) => (
                      <li key={index} className="font-medium">
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4">
            <h2 className="font-semibold">Application Timeline</h2>
            <div className="grid gap-4 rounded-lg border p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Created At</p>
                  <p className="font-medium">
                    {format(new Date(application.created_at), 'PPpp')}
                  </p>
                </div>
                {application.submitted_at && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Submitted At
                    </p>
                    <p className="font-medium">
                      {format(new Date(application.submitted_at), 'PPpp')}
                    </p>
                  </div>
                )}
                {application.reviewed_at && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Reviewed At
                      </p>
                      <p className="font-medium">
                        {format(new Date(application.reviewed_at), 'PPpp')}
                      </p>
                    </div>
                    {application.reviewer && (
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Reviewed By
                        </p>
                        <p className="font-medium">
                          {application.reviewer.full_name}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
