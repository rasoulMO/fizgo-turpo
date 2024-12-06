// src/app/partner/[appNumber]/partner-application-status.tsx
import { PartnerApplicationStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface PartnerApplicationStatusProps {
  application: {
    id: string;
    application_number: string;
    business_name: string;
    business_type: string;
    contact_person_name: string;
    contact_person_position: string;
    status: PartnerApplicationStatus;
    submitted_at: Date | null;
    reviewed_at: Date | null;
    reviewed_by?: {
      full_name: string | null;
    } | null;
  };
}

export function PartnerApplicationStatusPreview({
  application,
}: PartnerApplicationStatusProps) {
  const getStatusColor = (status: PartnerApplicationStatus) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-500";
      case "SUBMITTED":
        return "bg-blue-500";
      case "UNDER_REVIEW":
        return "bg-yellow-500";
      case "APPROVED":
        return "bg-green-500";
      case "REJECTED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Application Details</h2>
          <p className="text-muted-foreground text-sm">
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
            <h3 className="font-semibold">Business Information</h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground text-sm">Business Name</p>
                <p className="font-medium">{application.business_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Business Type</p>
                <p className="font-medium">{application.business_type}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Contact Person</p>
                <p className="font-medium">{application.contact_person_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Position</p>
                <p className="font-medium">
                  {application.contact_person_position}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Application Timeline</h3>
            <div className="mt-4 grid gap-4">
              <div>
                <p className="text-muted-foreground text-sm">Submitted At</p>
                <p className="font-medium">
                  {application.submitted_at
                    ? new Date(application.submitted_at).toLocaleString()
                    : "Not submitted yet"}
                </p>
              </div>
              {application.reviewed_at && (
                <>
                  <div>
                    <p className="text-muted-foreground text-sm">Reviewed At</p>
                    <p className="font-medium">
                      {new Date(application.reviewed_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Reviewed by</p>
                    <p className="font-medium">
                      {application.reviewed_by?.full_name || "System"}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
