"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CheckIcon, ChevronsUpDown, CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import CellActions from "./cell-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@prisma/client";
import { Badge } from '@/components/ui/badge';

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "filtered",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          User
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const user = row.original;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [copied, setCopied] = useState(false);
      const displayName = user.name ?? "No Name";
      return (
        <div className="flex items-center gap-2 ml-2.5">
          <Avatar>
            <AvatarImage className="object-cover" src={user.image || ""} />
            <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <span className="font-semibold">{displayName}</span>
            <div
              title={user.id}
              className="text-xs cursor-pointer text-primary gap-2 flex items-center"
            >
              <span className="w-[200px] text-muted-foreground hover:underline truncate overflow-hidden whitespace-nowrap">
                {user.id}
              </span>
              {copied ? (
                <CheckIcon className="size-3 text-green-600" />
              ) : (
                <CopyIcon
                  onClick={() => {
                    navigator.clipboard.writeText(user.id || "");
                    toast.success("User ID copied to clipboard");
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="size-3 text-muted-foreground cursor-pointer"
                />
              )}
            </div>
          </div>
        </div>
      );
    },
    filterFn: (row, filterValue) => {
      const name = (row.original.name ?? "").toLowerCase();
      const email = (row.original.email ?? "").toLowerCase();
      const id = (row.original.id ?? "").toLowerCase();
      const search = filterValue.toLowerCase();

      return (
        name.includes(search) ||
        id.includes(search) ||
        email.includes(search)
      );
    },
    sortingFn: (rowA, rowB) => {
      const nameA = rowA.original.name ?? "";
      const nameB = rowB.original.name ?? "";
      return nameA.localeCompare(nameB);
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const email = row.original.email;
      return <span className="ml-3.5">{email}</span>;
    },
  },
  {
    accessorKey: "selectableFiltered",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Role
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const role = row.original.role
      return <span className="ml-3.5 capitalize">{role}</span>;
    },
    filterFn: (row, id, filterValue) => {
      // If no filter is set, show all rows
      if (!filterValue || !Array.isArray(filterValue) || filterValue.length === 0) {
        return true;
      }
      // Check if the row's role is in the filter array
      const role = row.original.role;
      return filterValue.includes(role);
    },
  },
  {
    accessorKey: "selectableFiltered",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.original.isArchived ? "Inactive" : "Active";

      const variants: Record<
        typeof status,
        { label: string; className: string }
      > = {
        Active: {
          label: "Active",
          className: "bg-green-100 border border-green-600 text-green-600",
        },
        Inactive: {
          label: "Inactive",
          className: "bg-red-100 border border-red-600 text-red-600",
        },
      };

      const current = variants[status] ?? variants["Active"];

      return (
        <Badge
          variant="default"
          className={`ml-3.5 capitalize ${current.className}`}
        >
          {current.label}
        </Badge>
      );
    },
    enableColumnFilter: true,
    filterFn: (row, id, filterValue) => {
      // If no filter is set, show all rows
      if (!filterValue || !Array.isArray(filterValue) || filterValue.length === 0) {
        return true;
      }

      const role = row.original.role;
      return filterValue.includes(role);
    }
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date Joined
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const startDate = new Date(row.original.createdAt);
      return (
        <span className="ml-3.5">{`${startDate.toLocaleDateString()}`}</span>
      );
    },
  },
  {
    accessorKey: "actions",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Actions
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const actions = row.original;
      return <CellActions user={actions} />;
    },
  },
];
