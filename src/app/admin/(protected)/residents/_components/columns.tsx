"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import CellActions from "./cell-actions";
import { Badge } from "@/components/ui/badge";
import { Resident } from "@/generated/prisma/client";
import type { Maps } from "@/generated/prisma/client";
import { format } from "date-fns";

const getResidencyTypeLabel = (type: string) => {
  switch (type) {
    case "RESIDENT":
      return "Resident";
    case "TENANT":
      return "Tenant";
    default:
      return type;
  }
};

const getSexLabel = (sex: string) => {
  switch (sex) {
    case "MALE":
      return "Male";
    case "FEMALE":
      return "Female";
    case "PREFER_NOT_TO_SAY":
      return "Prefer not to say";
    default:
      return sex;
  }
};

type ResidentWithMap = Resident & { map?: Pick<Maps, "id" | "blockNo" | "lotNo" | "street"> | null };

const getFullName = (resident: ResidentWithMap) => {
  const parts = [
    resident.firstName,
    resident.middleName,
    resident.lastName,
    resident.suffix,
  ].filter(Boolean);
  return parts.join(" ");
};

export const columns: ColumnDef<ResidentWithMap>[] = [
  {
    accessorKey: "filtered",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const resident = row.original;
      const fullName = getFullName(resident);
      return (
        <div className="ml-2.5">
          <div className="font-semibold">{fullName}</div>
          {resident.isHead && (
            <Badge variant="outline" className="text-xs mt-1">
              Head
            </Badge>
          )}
        </div>
      );
    },
    filterFn: (row, filterValue) => {
      const resident = row.original;
      const fullName = getFullName(resident).toLowerCase();
      const email = (resident.emailAddress ?? "").toLowerCase();
      const contact = (resident.contactNumber ?? "").toLowerCase();
      const search = filterValue.toLowerCase();

      return (
        fullName.includes(search) ||
        email.includes(search) ||
        contact.includes(search)
      );
    },
    sortingFn: (rowA, rowB) => {
      const nameA = getFullName(rowA.original);
      const nameB = getFullName(rowB.original);
      return nameA.localeCompare(nameB);
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "typeOfResidency",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Type
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const type = row.original.typeOfResidency;
      return <span className="ml-3.5">{getResidencyTypeLabel(type)}</span>;
    },
  },
  {
    accessorKey: "sex",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Sex
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const sex = row.original.sex;
      return <span className="ml-3.5">{getSexLabel(sex)}</span>;
    },
  },
  {
    accessorKey: "dateOfBirth",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date of Birth
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const dateOfBirth = new Date(row.original.dateOfBirth);
      return (
        <span className="ml-3.5">{format(dateOfBirth, "MMM d, yyyy")}</span>
      );
    },
  },
  {
    accessorKey: "contactNumber",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Contact
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <span className="ml-3.5">{row.original.contactNumber}</span>;
    },
  },
  {
    accessorKey: "emailAddress",
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
      const email = row.original.emailAddress;
      return (
        <span className="ml-3.5">{email || <span className="text-muted-foreground">-</span>}</span>
      );
    },
  },
  {
    accessorKey: "map",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Property
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const map = row.original.map;
      if (!map) {
        return <span className="ml-3.5 text-muted-foreground">-</span>;
      }
      return (
        <span className="ml-3.5">
          Block {map.blockNo} - Lot {map.lotNo || "N/A"} - {map.street}
        </span>
      );
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
      if (!filterValue || !Array.isArray(filterValue) || filterValue.length === 0) {
        return true;
      }
      const isArchived = row.original.isArchived;
      const status = isArchived ? "Inactive" : "Active";
      return filterValue.includes(status);
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
      const resident = row.original;
      return <CellActions resident={resident} />;
    },
  },
];

