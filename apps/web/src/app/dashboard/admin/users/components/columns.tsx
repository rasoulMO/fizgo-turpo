"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

import { User } from "../data/schema";
import { DataTableRowActions } from "./data-table-row-actions";
import { UserRole } from "@prisma/client";

export const usersColumns: ColumnDef<User>[] = [
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
    accessorKey: "full_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => <div>{row.getValue("full_name")}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      return <div className="flex items-center">{row.getValue("email")}</div>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => <div>{row.getValue("role")}</div>,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];

export const usersFilterableColumns = [
  {
    id: "role",
    title: "Role",
    options: [
      { value: UserRole.CUSTOMER, label: "Customer" },
      { value: UserRole.SHOP_OWNER, label: "Shop Owner" },
      { value: UserRole.DELIVERY_PARTNER, label: "Delivery Partner" },
      { value: UserRole.INTERNAL_OPERATOR, label: "Internal Operator" },
      { value: UserRole.ADMIN, label: "Admin" },
      { value: UserRole.SUPER_ADMIN, label: "Super Admin" },
    ],
  },
];

export const usersSearchableColumns = [
  {
    id: "email",
    title: "Email",
  },
  {
    id: "full_name",
    title: "Name",
  },
];
