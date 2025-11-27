"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";

type NotificationRow = {
  id: string;
  type: "payment" | "reservation" | "feedback";
  title: string;
  description: string;
  timestamp: Date;
  link: string;
};

const typeStyles: Record<
  NotificationRow["type"],
  { label: string; className: string }
> = {
  payment: {
    label: "Payment",
    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  },
  reservation: {
    label: "Reservation",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  },
  feedback: {
    label: "Feedback",
    className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
  },
};

export const columns: ColumnDef<NotificationRow>[] = [
  {
    accessorKey: "type",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Type
        <ChevronsUpDown className="h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const type = typeStyles[row.original.type];
      return (
        <Badge className={`ml-3.5 ${type.className}`} variant="secondary">
          {type.label}
        </Badge>
      );
    },
    filterFn: (row, _id, filterValue) => {
      if (!filterValue || !Array.isArray(filterValue) || filterValue.length === 0) {
        return true;
      }
      return filterValue.includes(row.original.type);
    },
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Notification
        <ChevronsUpDown className="h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const notification = row.original;
      return (
        <div className="ml-3.5 space-y-1">
          <div className="font-semibold">{notification.title}</div>
          <p className="text-sm text-muted-foreground line-clamp-2 max-w-md">
            {notification.description}
          </p>
        </div>
      );
    },
    filterFn: (row, filterValue) => {
      const notification = row.original;
      const search = (filterValue as string).toLowerCase();
      return (
        notification.title.toLowerCase().includes(search) ||
        notification.description.toLowerCase().includes(search)
      );
    },
    sortingFn: (rowA, rowB) =>
      rowA.original.title.localeCompare(rowB.original.title),
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "timestamp",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date
        <ChevronsUpDown className="h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const timestamp = new Date(row.original.timestamp);
      return (
        <div className="ml-3.5 text-sm">
          <div>{format(timestamp, "MMM d, yyyy")}</div>
          <div className="text-xs text-muted-foreground">
            {format(timestamp, "hh:mm aaa")}
          </div>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const notification = row.original;
      return (
        <div className="ml-3.5">
          <Link
            href={notification.link}
            className="text-sm text-primary hover:underline"
          >
            View
          </Link>
        </div>
      );
    },
  },
];

