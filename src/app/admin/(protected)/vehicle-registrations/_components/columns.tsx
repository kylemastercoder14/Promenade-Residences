"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import CellActions from "./cell-actions";
import { Badge } from "@/components/ui/badge";
import { VehicleRegistration } from "@prisma/client";
import { format } from "date-fns";

const getVehicleTypeLabel = (type: string) => {
  switch (type) {
    case "SEDAN":
      return "Sedan";
    case "SUV":
      return "SUV";
    case "TRUCK":
      return "Truck";
    case "MOTORCYCLE":
      return "Motorcycle";
    default:
      return type;
  }
};

const getRelationshipLabel = (relationship: string) => {
  switch (relationship) {
    case "OWNER":
      return "Owner";
    case "FAMILY_MEMBER":
      return "Family Member";
    case "COMPANY_DRIVER":
      return "Company Driver";
    default:
      return relationship;
  }
};

export const columns: ColumnDef<VehicleRegistration>[] = [
  {
    accessorKey: "filtered",
    id: "filtered",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Vehicle
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const vehicle = row.original;
      return (
        <div className="ml-2.5">
          <div className="font-semibold">
            {vehicle.brand} {vehicle.model}
          </div>
          <div className="text-sm text-muted-foreground">
            {vehicle.plateNumber}
          </div>
        </div>
      );
    },
    filterFn: (row, id, filterValue) => {
      if (!filterValue || typeof filterValue !== "string") {
        return true;
      }
      const brand = (row.original.brand ?? "").toLowerCase();
      const model = (row.original.model ?? "").toLowerCase();
      const plateNumber = (row.original.plateNumber ?? "").toLowerCase();
      const search = filterValue.toLowerCase();

      return (
        brand.includes(search) ||
        model.includes(search) ||
        plateNumber.includes(search)
      );
    },
    sortingFn: (rowA, rowB) => {
      const brandA = rowA.original.brand ?? "";
      const brandB = rowB.original.brand ?? "";
      return brandA.localeCompare(brandB);
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "vehicleType",
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
      const type = row.original.vehicleType;
      return <span className="ml-3.5">{getVehicleTypeLabel(type)}</span>;
    },
  },
  {
    accessorKey: "yearOfManufacture",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Year
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <span className="ml-3.5">{row.original.yearOfManufacture}</span>;
    },
  },
  {
    accessorKey: "color",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Color
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <span className="ml-3.5 capitalize">{row.original.color}</span>;
    },
  },
  {
    accessorKey: "relationshipToVehicle",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Relationship
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const relationship = row.original.relationshipToVehicle;
      return <span className="ml-3.5">{getRelationshipLabel(relationship)}</span>;
    },
  },
  {
    accessorKey: "resident",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Owner (Resident/Tenant)
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const resident = (row.original as any).resident;
      if (!resident) {
        return <span className="ml-3.5 text-muted-foreground">N/A</span>;
      }
      const fullName = [
        resident.firstName,
        resident.middleName,
        resident.lastName,
        resident.suffix,
      ]
        .filter(Boolean)
        .join(" ");
      return <span className="ml-3.5">{fullName}</span>;
    },
    filterFn: (row, id, filterValue) => {
      if (!filterValue || !Array.isArray(filterValue) || filterValue.length === 0) {
        return true;
      }
      const resident = (row.original as any).resident;
      if (!resident) {
        return filterValue.includes("N/A");
      }
      const residentId = resident.id;
      return filterValue.includes(residentId);
    },
  },
  {
    accessorKey: "expiryDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Expiry Date
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const expiryDate = new Date(row.original.expiryDate);
      const isExpired = expiryDate < new Date();
      return (
        <span className={`ml-3.5 ${isExpired ? "text-destructive font-semibold" : ""}`}>
          {format(expiryDate, "MMM d, yyyy")}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
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
      const registrationStatus = (row.original as any).status || "PENDING";
      const isArchived = row.original.isArchived;

      const statusVariants: Record<
        string,
        { label: string; className: string }
      > = {
        PENDING: {
          label: "Pending",
          className: "bg-yellow-100 border border-yellow-600 text-yellow-600",
        },
        APPROVED: {
          label: "Approved",
          className: "bg-green-100 border border-green-600 text-green-600",
        },
        REJECTED: {
          label: "Rejected",
          className: "bg-red-100 border border-red-600 text-red-600",
        },
        Inactive: {
          label: "Inactive",
          className: "bg-gray-100 border border-gray-600 text-gray-600",
        },
      };

      const current = isArchived
        ? statusVariants["Inactive"]
        : statusVariants[registrationStatus] ?? statusVariants["PENDING"];

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
      const registrationStatus = (row.original as any).status || "PENDING";
      const isArchived = row.original.isArchived;
      const status = isArchived ? "Inactive" : registrationStatus;
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
      const vehicle = row.original;
      return <CellActions vehicle={vehicle} />;
    },
  },
];

