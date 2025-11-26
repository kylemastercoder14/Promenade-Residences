"use client";

import { DataTable } from "@/components/data-table";
import { useSuspenseFeedbacks } from "@/features/feedback/hooks/use-feedback";
import { columns } from "./columns";

const statusFilters = [
  { label: "New", value: "NEW" },
  { label: "In review", value: "IN_REVIEW" },
  { label: "Resolved", value: "RESOLVED" },
];

export const Client = () => {
  const feedbacks = useSuspenseFeedbacks();

  return (
    <DataTable
      data={feedbacks.data}
      columns={columns}
      selectableFiltered={{
        title: "Filter by status",
        options: statusFilters,
      }}
    />
  );
};


