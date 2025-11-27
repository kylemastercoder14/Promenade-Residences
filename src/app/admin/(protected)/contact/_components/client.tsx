"use client";

import { DataTable } from "@/components/data-table";
import { useSuspenseContacts } from "@/features/contact/hooks/use-contact";
import { columns } from "./columns";
import { ContactStatus } from "@prisma/client";

const statusFilters = [
  { label: "New", value: "NEW" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Resolved", value: "RESOLVED" },
  { label: "Closed", value: "CLOSED" },
];

export const Client = () => {
  const contacts = useSuspenseContacts();

  return (
    <DataTable
      data={contacts.data}
      columns={columns}
      selectableFiltered={{
        title: "Filter by status",
        options: statusFilters,
      }}
    />
  );
};

