"use client";

import { DataTable } from "@/components/data-table";
import { useSuspenseNotifications } from "@/features/notifications/hooks/use-notifications";
import { columns } from "./columns";

const typeFilters = [
  { label: "Payment", value: "payment" },
  { label: "Reservation", value: "reservation" },
  { label: "Feedback", value: "feedback" },
];

export const Client = () => {
  const notifications = useSuspenseNotifications();

  return (
    <DataTable
      data={notifications.data}
      columns={columns}
      selectableFiltered={{
        title: "Filter by type",
        options: typeFilters,
      }}
    />
  );
};

