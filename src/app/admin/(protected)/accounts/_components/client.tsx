"use client";

import { DataTable } from "@/components/data-table";
import { useSuspenseAccounts } from "@/features/accounts/hooks/use-accounts";
import { columns } from "./columns";
import { Role } from '@/generated/prisma/enums';

export const Client = () => {
  const accounts = useSuspenseAccounts();
  return (
    <DataTable
      data={accounts.data}
      columns={columns}
      selectableFiltered={{
        title: "Filter by role",
        options: Object.values(Role).map((role) => ({
          label: role,
          value: role,
        })),
      }}
    />
  );
};
