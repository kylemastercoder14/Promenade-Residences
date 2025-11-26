"use client";

import { DataTable } from "@/components/data-table";
import { useSuspenseResidents } from "@/features/residents/hooks/use-residents";
import { columns } from "./columns";

export const Client = () => {
  const residents = useSuspenseResidents();
  return (
    <DataTable
      data={residents.data}
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

