"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import type { VehicleRegistration, Resident } from "@prisma/client";

type VehicleWithResident = VehicleRegistration & {
  resident?: Pick<Resident, "id" | "firstName" | "middleName" | "lastName" | "suffix"> | null;
};

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

const getStatusLabel = (status: string) => {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Rejected";
    default:
      return status;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-700 border-yellow-300";
    case "APPROVED":
      return "bg-green-100 text-green-700 border-green-300";
    case "REJECTED":
      return "bg-red-100 text-red-700 border-red-300";
    default:
      return "bg-gray-100 text-gray-700 border-gray-300";
  }
};

const getResidentFullName = (resident?: {
  firstName: string;
  middleName?: string | null;
  lastName: string;
  suffix?: string | null;
} | null) => {
  if (!resident) return "—";
  const parts = [
    resident.firstName,
    resident.middleName,
    resident.lastName,
    resident.suffix,
  ].filter(Boolean);
  return parts.join(" ");
};

export const VehiclesTable = () => {
  const trpc = useTRPC();
  const { data: vehicles = [], isLoading } = useQuery(
    trpc.vehicleRegistrations.getMyVehicles.queryOptions()
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No vehicles registered yet. Add a vehicle using the form above.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vehicle</TableHead>
            <TableHead>Plate Number</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Color</TableHead>
            <TableHead>Registered To</TableHead>
            <TableHead>Relationship</TableHead>
            <TableHead>License Expiry</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Registered Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((vehicle) => {
            const vehicleName = `${vehicle.brand} ${vehicle.model}`;
            const isExpired = new Date(vehicle.expiryDate) < new Date();

            return (
              <TableRow key={vehicle.id}>
                <TableCell className="font-medium">
                  {vehicleName}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{vehicle.plateNumber}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {getVehicleTypeLabel(vehicle.vehicleType)}
                  </Badge>
                </TableCell>
                <TableCell>{vehicle.yearOfManufacture}</TableCell>
                <TableCell>{vehicle.color}</TableCell>
                <TableCell className="text-muted-foreground">
                  {getResidentFullName(vehicle.resident)}
                </TableCell>
                <TableCell>
                  {getRelationshipLabel(vehicle.relationshipToVehicle)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {format(new Date(vehicle.expiryDate), "MMM dd, yyyy")}
                    {isExpired && (
                      <Badge variant="destructive" className="text-xs">
                        Expired
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`${getStatusColor(vehicle.status || "PENDING")} border`}
                  >
                    {getStatusLabel(vehicle.status || "PENDING")}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(vehicle.createdAt), "MMM dd, yyyy")}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};


