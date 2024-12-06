// app/admin/partners/components/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

import { DataTableRowActions } from "./data-table-row-actions";
import { PartnerApplicationStatus } from "@prisma/client";
import { PartnerApplicationResponse } from "@/types/partner";

// Define status styles
const statusStyles = {
  DRAFT: { label: "Draft", variant: "secondary" },
  SUBMITTED: { label: "Submitted", variant: "warning" },
  UNDER_REVIEW: { label: "Under Review", variant: "info" },
  APPROVED: { label: "Approved", variant: "success" },
  REJECTED: { label: "Rejected", variant: "destructive" },
} as const;

export const partnerApplicationColumns: ColumnDef<PartnerApplicationResponse>[] =
  [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "application_number",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Application #" />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("application_number")}</div>
      ),
    },
    {
      accessorKey: "business_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Business" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex flex-col">
            <span className="font-medium">{row.getValue("business_name")}</span>
            <span className="text-muted-foreground text-xs">
              {row.original.business_type}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "user",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Applicant" />
      ),
      cell: ({ row }) => {
        const user = row.original.user;
        return user ? (
          <div className="flex flex-col">
            <span className="font-medium">{user.full_name || "N/A"}</span>
            <span className="text-muted-foreground text-xs">{user.email}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">Unknown</span>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status =
          statusStyles[row.getValue("status") as PartnerApplicationStatus];
        return <Badge variant={status.variant}>{status.label}</Badge>;
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "submitted_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Submitted" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("submitted_at");
        if (!date)
          return <span className="text-muted-foreground">Not submitted</span>;
        return format(new Date(date as string), "MMM d, yyyy");
      },
    },
    {
      accessorKey: "reviewer",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Reviewed By" />
      ),
      cell: ({ row }) => {
        const reviewer = row.original.reviewer;
        const reviewDate = row.original.reviewed_at;

        if (!reviewer) return <span className="text-muted-foreground">-</span>;

        return (
          <div className="flex flex-col">
            <span>{reviewer.full_name || "Unknown"}</span>
            {reviewDate && (
              <span className="text-muted-foreground text-xs">
                {format(new Date(reviewDate), "MMM d, yyyy")}
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => <DataTableRowActions row={row} />,
    },
  ];

export const partnerApplicationFilterableColumns = [
  {
    id: "status",
    title: "Status",
    options: [
      { value: PartnerApplicationStatus.DRAFT, label: "Draft" },
      { value: PartnerApplicationStatus.SUBMITTED, label: "Submitted" },
      { value: PartnerApplicationStatus.UNDER_REVIEW, label: "Under Review" },
      { value: PartnerApplicationStatus.APPROVED, label: "Approved" },
      { value: PartnerApplicationStatus.REJECTED, label: "Rejected" },
    ],
  },
];

export const partnerApplicationSearchableColumns = [
  {
    id: "application_number",
    title: "Application #",
  },
  {
    id: "business_name",
    title: "Business Name",
  },
];
