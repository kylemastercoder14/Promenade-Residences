"use client";

import { DataTable } from "@/components/data-table";
import { useSuspenseVehicleRegistrations } from "@/features/vehicle-registrations/hooks/use-vehicle-registrations";
import { columns } from "./columns";

export const Client = () => {
  const vehicleRegistrations = useSuspenseVehicleRegistrations();
  return (
    <DataTable
      data={vehicleRegistrations.data}
      columns={columns}
      selectableFiltered={{
        title: "Filter by status",
        options: [
          { label: "Active", value: "Active" },
          { label: "Inactive", value: "Inactive" },
        ],
      }}
    />
  );
};

