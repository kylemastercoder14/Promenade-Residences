"use client";

import { DataTable } from "@/components/data-table";
import { useSuspenseLogs } from "@/features/logs/hooks/use-logs";
import { columns } from "./columns";

export const Client = () => {
  const logs = useSuspenseLogs();
  return (
    <DataTable
      data={logs.data}
      columns={columns}
    />
  );
};
