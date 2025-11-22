"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  IconUsers,
  IconCar,
  IconCalendarCheck,
  IconBuilding,
  IconPrinter,
} from "@tabler/icons-react";
import { CollectionAreaChart } from "@/components/layout/admin/collection-area-chart";
import { AmenityReservationCalendar } from "@/components/layout/admin/amenity-reservation-calendar";
import {
  RecentTransactionsTable,
  RecentTransaction,
} from "@/components/layout/admin/recent-transactions-table";

const Page = () => {
  const statistics = [
    {
      title: "Total Accounts",
      value: "234",
      details: "Residents • Tenants • Admin",
      icon: IconUsers,
    },
    {
      title: "Registered Vehicle",
      value: "87",
      details: "Active • Pending",
      icon: IconCar,
    },
    {
      title: "Monthly Dues Paid",
      value: "12 / 30",
      details: "Approved • Pending",
      icon: IconCalendarCheck,
    },
    {
      title: "Available Lots",
      value: "24",
      details: "Vacant • Owned",
      icon: IconBuilding,
    },
  ];

  const recentTransactions: RecentTransaction[] = [
    {
      date: "Nov. 25, 2025",
      type: "Monthly Due",
      resident: "John Carter",
      amount: "₱4,500.00",
      status: "Completed" as const,
    },
    {
      date: "Nov. 23, 2025",
      type: "Amenity Reservation",
      resident: "Isabella Cruz",
      amount: "₱2,000.00",
      status: "Pending" as const,
    },
    {
      date: "Nov. 22, 2025",
      type: "Vehicle Permit",
      resident: "Miguel Santos",
      amount: "₱1,200.00",
      status: "Completed" as const,
    },
    {
      date: "Nov. 21, 2025",
      type: "Lot Reservation",
      resident: "Erika Chan",
      amount: "₱15,000.00",
      status: "Rejected" as const,
    },
    {
      date: "Nov. 25, 2025",
      type: "Monthly Due",
      resident: "Alfonso Reyes",
      amount: "₱4,500.00",
      status: "Completed" as const,
    },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground max-w-6xl">
            Welcome to the Promenade Residence management dashboard. Monitor key
            metrics, track account activity, and manage community operations
            from this centralized view. Get real-time insights into residents,
            transactions, and property status.
          </p>
        </div>
        <Button onClick={handlePrint} variant="primary" className="shrink-0">
          <IconPrinter className="h-4 w-4" />
          <span>Print Report</span>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statistics.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card
              key={stat.title}
              className="relative hover:shadow-lg transition-all duration-300 overflow-hidden border-l-4 border-l-[#327248]"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <IconComponent className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.details}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-10 gap-6">
        <div className="md:col-span-7">
          <CollectionAreaChart />
          <div className="mt-6">
            <RecentTransactionsTable transactions={recentTransactions} />
          </div>
        </div>
        <div className="md:col-span-3">
          <AmenityReservationCalendar />
        </div>
      </div>
    </div>
  );
};

export default Page;
