import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { PartnerActions } from "./partner-actions";
import { PartnerStatus } from "./partner-status";
import { api } from "@/trpc/server";

export const revalidate = 0;

interface PageProps {
  params: {
    appNumber: string;
  };
}

export default async function PartnerApplicationDetailPage({
  params,
}: PageProps) {
  const application = await api.partnerApplications.getByApplicationNumberAdmin(
    params.appNumber,
  );

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
    );
  }

  return (
    <div className="container grid gap-8 py-8">
      <div className="flex items-center justify-between">
        <div className="grid gap-1">
          <h1 className="text-3xl font-bold">Partner Application Details</h1>
          <p className="text-muted-foreground">
            Review and manage partner application
          </p>
        </div>
        <PartnerActions application={application} />
      </div>

      <div className="grid gap-6">
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <div className="grid gap-1">
              <p className="text-muted-foreground text-sm">
                Application Number
              </p>
              <p className="font-medium">{application.application_number}</p>
            </div>
            <PartnerStatus status={application.status} />
          </div>

          <Separator />

          <div className="grid gap-4">
            <h2 className="font-semibold">Business Information</h2>
            <div className="grid gap-4 rounded-lg border p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-muted-foreground text-sm">Business Name</p>
                  <p className="font-medium">{application.business_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Business Type</p>
                  <p className="font-medium">{application.business_type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">
                    Business Address
                  </p>
                  <p className="font-medium">{application.business_address}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">
                    Business Phone
                  </p>
                  <p className="font-medium">{application.business_phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">
                    Business Email
                  </p>
                  <p className="font-medium">{application.business_email}</p>
                </div>
                {application.business_registration_number && (
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Registration Number
                    </p>
                    <p className="font-medium">
                      {application.business_registration_number}
                    </p>
                  </div>
                )}
              </div>
              {application.business_description && (
                <div>
                  <p className="text-muted-foreground text-sm">Description</p>
                  <p className="font-medium">
                    {application.business_description}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="grid gap-4">
            <h2 className="font-semibold">Contact Information</h2>
            <div className="grid gap-4 rounded-lg border p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-muted-foreground text-sm">
                    Contact Person
                  </p>
                  <p className="font-medium">
                    {application.contact_person_name}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Position</p>
                  <p className="font-medium">
                    {application.contact_person_position}
                  </p>
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
                  <p className="text-muted-foreground text-sm">Created At</p>
                  <p className="font-medium">
                    {format(new Date(application.created_at), "PPpp")}
                  </p>
                </div>
                {application.submitted_at && (
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Submitted At
                    </p>
                    <p className="font-medium">
                      {format(new Date(application.submitted_at), "PPpp")}
                    </p>
                  </div>
                )}
                {application.reviewed_at && (
                  <>
                    <div>
                      <p className="text-muted-foreground text-sm">
                        Reviewed At
                      </p>
                      <p className="font-medium">
                        {format(new Date(application.reviewed_at), "PPpp")}
                      </p>
                    </div>
                    {application.reviewer && (
                      <div>
                        <p className="text-muted-foreground text-sm">
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
              {application.status === "REJECTED" &&
                application.rejection_reason && (
                  <div>
                    <p className="text-muted-foreground text-sm">
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
  );
}
