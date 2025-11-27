"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, MailIcon, PhoneIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Contact, ContactStatus } from "@prisma/client";
import { format } from "date-fns";
import { CellActions } from "./cell-actions";

type ContactRow = Contact;

const statusStyles: Record<
  ContactStatus,
  { label: string; className: string }
> = {
  NEW: {
    label: "New",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
  },
  RESOLVED: {
    label: "Resolved",
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100",
  },
  CLOSED: {
    label: "Closed",
    className:
      "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100",
  },
};

export const columns: ColumnDef<ContactRow>[] = [
  {
    accessorKey: "filtered",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Contact
        <ChevronsUpDown className="h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const contact = row.original;
      return (
        <div className="ml-2.5 space-y-1">
          <div className="font-semibold">{contact.fullName}</div>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {contact.email && (
              <span className="inline-flex items-center gap-1">
                <MailIcon className="h-3 w-3" />
                {contact.email}
              </span>
            )}
            {contact.phoneNumber && (
              <span className="inline-flex items-center gap-1">
                <PhoneIcon className="h-3 w-3" />
                {contact.phoneNumber}
              </span>
            )}
          </div>
        </div>
      );
    },
    filterFn: (row, filterValue) => {
      const contact = row.original;
      const search = (filterValue as string).toLowerCase();
      return (
        contact.fullName.toLowerCase().includes(search) ||
        (contact.email ?? "").toLowerCase().includes(search) ||
        (contact.phoneNumber ?? "").toLowerCase().includes(search) ||
        contact.subject.toLowerCase().includes(search) ||
        contact.message.toLowerCase().includes(search)
      );
    },
    sortingFn: (rowA, rowB) =>
      rowA.original.fullName.localeCompare(rowB.original.fullName),
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "subject",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Subject
        <ChevronsUpDown className="h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="ml-3.5">
        <div className="font-medium">{row.original.subject}</div>
        <p className="text-sm text-muted-foreground line-clamp-2 max-w-md">
          {row.original.message}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "selectableFiltered",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Status
        <ChevronsUpDown className="h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const status = statusStyles[row.original.status];
      return (
        <Badge className={`ml-3.5 ${status.className}`} variant="secondary">
          {status.label}
        </Badge>
      );
    },
    filterFn: (row, _id, filterValue) => {
      if (!filterValue || !Array.isArray(filterValue) || filterValue.length === 0) {
        return true;
      }
      return filterValue.includes(row.original.status);
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Submitted
        <ChevronsUpDown className="h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const createdAt = new Date(row.original.createdAt);
      return (
        <div className="ml-3.5 text-sm">
          <div>{format(createdAt, "MMM d, yyyy")}</div>
          <div className="text-xs text-muted-foreground">
            {format(createdAt, "hh:mm aaa")}
          </div>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    id: "actions",
    cell: ({ row }) => <CellActions contact={row.original} />,
  },
];

