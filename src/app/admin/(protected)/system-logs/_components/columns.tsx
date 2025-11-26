/* eslint-disable @next/next/no-assign-module-variable */
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CheckIcon, ChevronsUpDown, CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SystemLog, User } from "@prisma/client";

export const columns: ColumnDef<SystemLog & {
  user: User
}>[] = [
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
      return (
        <div className="flex items-center gap-2 ml-2.5">
          <Avatar>
            <AvatarImage className="object-cover" src={user.user.image || ""} />
            <AvatarFallback>{(user.user.name ?? "").charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <span className="font-semibold">{user.user.name ?? "No Name"}</span>
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
                    toast.success("Log ID copied to clipboard");
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
      const name = (row.original.user.name ?? "").toLowerCase();
      const email = (row.original.user.email ?? "").toLowerCase();
      const id = (row.original.id ?? "").toLowerCase();
      const search = filterValue.toLowerCase();

      return (
        name.includes(search) ||
        id.includes(search) ||
        email.includes(search)
      );
    },
    sortingFn: (rowA, rowB) => {
      const nameA = rowA.original.user.name ?? "";
      const nameB = rowB.original.user.name ?? "";
      return nameA.localeCompare(nameB);
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "action",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Action
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const action = row.original.action;
      const actionColors: Record<string, string> = {
        CREATE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        UPDATE: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        DELETE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        ARCHIVE: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
        RETRIEVE: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
        LOGIN: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
        LOGOUT: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
        PASSWORD_CHANGE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        PROFILE_UPDATE: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
        STATUS_CHANGE: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
        PAYMENT_CREATE: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
        PAYMENT_UPDATE: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200",
        PAYMENT_DELETE: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
      };
      return (
        <Badge className={`ml-3.5 ${actionColors[action] || ""}`}>
          {action.replace(/_/g, " ")}
        </Badge>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "module",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Module
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const module = row.original.module;
      return (
        <Badge variant="outline" className="ml-3.5">
          {module.replace(/_/g, " ")}
        </Badge>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      return (
        <div className="max-w-[300px] ml-3.5">
          <p className="truncate text-sm">{row.original.description}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "entityType",
    header: "Entity Type",
    cell: ({ row }) => {
      const entityType = row.original.entityType;
      return entityType ? (
        <span className="ml-3.5 text-sm text-muted-foreground">{entityType}</span>
      ) : (
        <span className="ml-3.5 text-sm text-muted-foreground">—</span>
      );
    },
  },
  {
    accessorKey: "entityId",
    header: "Entity ID",
    cell: ({ row }) => {
      const entityId = row.original.entityId;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [copied, setCopied] = useState(false);

      if (!entityId) {
        return <span className="ml-3.5 text-sm text-muted-foreground">—</span>;
      }

      return (
        <div className="flex items-center gap-2 ml-3.5">
          <span className="text-xs font-mono w-[100px] truncate overflow-hidden whitespace-nowrap">
            {entityId}
          </span>
          {copied ? (
            <CheckIcon className="size-3 text-green-600" />
          ) : (
            <CopyIcon
              onClick={() => {
                navigator.clipboard.writeText(entityId);
                toast.success("Entity ID copied to clipboard");
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="size-3 text-muted-foreground cursor-pointer"
            />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "ipAddress",
    header: "IP Address",
    cell: ({ row }) => {
      const ipAddress = row.original.ipAddress;
      return ipAddress ? (
        <span className="ml-3.5 text-sm font-mono">{ipAddress}</span>
      ) : (
        <span className="ml-3.5 text-sm text-muted-foreground">—</span>
      );
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date Created
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const startDate = new Date(row.original.createdAt);
      return (
        <div className="ml-3.5">
          <div className="text-sm">{startDate.toLocaleDateString()}</div>
          <div className="text-xs text-muted-foreground">
            {startDate.toLocaleTimeString()}
          </div>
        </div>
      );
    },
    enableSorting: true,
  },
];
