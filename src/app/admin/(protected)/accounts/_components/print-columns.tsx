"use client";

import { User } from "@prisma/client";

export const getPrintColumns = () => {
  return [
    {
      header: "Name",
      accessor: (row: User) => row.name || "No Name",
    },
    {
      header: "Email",
      accessor: (row: User) => row.email || "",
    },
    {
      header: "Role",
      accessor: (row: User) => row.role || "",
    },
    {
      header: "Status",
      accessor: (row: User) => row.isArchived ? "Inactive" : "Active",
    },
    {
      header: "Approval",
      accessor: (row: User) => {
        const isApproved = row.isApproved ?? false;
        const role = row.role;
        const approved = isApproved || role !== "USER";
        return approved ? "Approved" : "Pending";
      },
    },
    {
      header: "Date Joined",
      accessor: (row: User) => {
        const date = new Date(row.createdAt);
        return date.toLocaleDateString();
      },
    },
  ];
};

