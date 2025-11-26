"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, MailIcon, PhoneIcon, StarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Feedback,
  FeedbackCategory,
  FeedbackStatus,
  Resident,
} from "@/generated/prisma/client";
import { format } from "date-fns";

type FeedbackRow = Feedback & { resident?: Resident | null };

const statusStyles: Record<
  FeedbackStatus,
  { label: string; className: string }
> = {
  NEW: {
    label: "New",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  },
  IN_REVIEW: {
    label: "In review",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
  },
  RESOLVED: {
    label: "Resolved",
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100",
  },
};

const categoryLabels: Record<FeedbackCategory, string> = {
  GENERAL: "General",
  AMENITIES: "Amenities",
  SECURITY: "Security",
  BILLING: "Billing",
  EVENT: "Events",
  SUGGESTION: "Suggestion",
  OTHER: "Other",
};

const renderStars = (rating?: number | null) => {
  if (!rating) return <span className="text-muted-foreground">—</span>;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => (
        <StarIcon
          key={index}
          className={`h-3.5 w-3.5 ${
            index < rating
              ? "fill-yellow-400 text-yellow-500"
              : "text-muted-foreground"
          }`}
        />
      ))}
    </div>
  );
};

export const columns: ColumnDef<FeedbackRow>[] = [
  {
    accessorKey: "filtered",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Resident
        <ChevronsUpDown className="h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const feedback = row.original;
      return (
        <div className="ml-2.5 space-y-1">
          <div className="font-semibold">{feedback.residentName}</div>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {feedback.contactEmail && (
              <span className="inline-flex items-center gap-1">
                <MailIcon className="h-3 w-3" />
                {feedback.contactEmail}
              </span>
            )}
            {feedback.contactNumber && (
              <span className="inline-flex items-center gap-1">
                <PhoneIcon className="h-3 w-3" />
                {feedback.contactNumber}
              </span>
            )}
          </div>
        </div>
      );
    },
    filterFn: (row, filterValue) => {
      const feedback = row.original;
      const search = (filterValue as string).toLowerCase();
      return (
        feedback.residentName.toLowerCase().includes(search) ||
        (feedback.contactEmail ?? "").toLowerCase().includes(search) ||
        (feedback.contactNumber ?? "").toLowerCase().includes(search) ||
        feedback.subject.toLowerCase().includes(search) ||
        feedback.message.toLowerCase().includes(search)
      );
    },
    sortingFn: (rowA, rowB) =>
      rowA.original.residentName.localeCompare(rowB.original.residentName),
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
    accessorKey: "category",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Category
        <ChevronsUpDown className="h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <Badge variant="outline" className="ml-3.5">
        {categoryLabels[row.original.category]}
      </Badge>
    ),
  },
  {
    accessorKey: "rating",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Rating
        <ChevronsUpDown className="h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="ml-3.5">{renderStars(row.original.rating)}</div>,
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
];


