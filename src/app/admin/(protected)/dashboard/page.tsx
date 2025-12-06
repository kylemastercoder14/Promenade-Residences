"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconUsers,
  IconCar,
  IconCalendarCheck,
  IconBuilding,
  IconCurrencyDollar,
  IconMessageCircle,
  IconCalendarEvent,
  IconFileReport,
} from "@tabler/icons-react";
import { ReportDialog } from "./_components/report-dialog";
import { CollectionAreaChart } from "@/components/layout/admin/collection-area-chart";
import { AmenityReservationCalendar } from "@/components/layout/admin/amenity-reservation-calendar";
import { ReservationStatusChart } from "@/components/layout/admin/reservation-status-chart";
import { AmenityEarningsChart } from "@/components/layout/admin/amenity-earnings-chart";
import { MonthlyDuesPieChart } from "@/components/layout/admin/monthly-dues-pie-chart";
import {
  RecentTransactionsTable,
  RecentTransaction,
} from "@/components/layout/admin/recent-transactions-table";
import { format } from "date-fns";
import { useMemo } from "react";

type Period = "daily" | "weekly" | "monthly" | "annually";

const Page = () => {
  const [period, setPeriod] = useState<Period>("monthly");
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const trpc = useTRPC();
  const { data: stats, isLoading } = useQuery(
    trpc.dashboard.getStatistics.queryOptions({ period })
  );

  const statistics = useMemo(() => {
    if (!stats) return [];
    const userCount = stats.accounts.byRole.USER || 0;
    const adminCount = (stats.accounts.byRole.ADMIN || 0) + (stats.accounts.byRole.SUPERADMIN || 0) + (stats.accounts.byRole.ACCOUNTING || 0);

    return [
      {
        title: "Total Accounts",
        value: stats.accounts.total.toString(),
        details: `${userCount} Users • ${adminCount} Admins`,
        icon: IconUsers,
      },
      {
        title: "Registered Vehicles",
        value: stats.vehicles.total.toString(),
        details: `${stats.vehicles.byType.SEDAN || 0} Sedan • ${stats.vehicles.byType.SUV || 0} SUV`,
        icon: IconCar,
      },
      {
        title: "Monthly Dues",
        value: `${stats.monthlyDues.paid} / ${stats.monthlyDues.total}`,
        details: `${stats.monthlyDues.paid} Approved • ${stats.monthlyDues.pending} Pending`,
        icon: IconCalendarCheck,
      },
      {
        title: "Available Lots",
        value: stats.lots.available.toString(),
        details: `${stats.lots.available} Vacant • ${stats.lots.owned} Owned`,
        icon: IconBuilding,
      },
      {
        title: "Total Residents",
        value: stats.residents.total.toString(),
        details: `${stats.residents.byType.RESIDENT || 0} Residents • ${stats.residents.byType.TENANT || 0} Tenants`,
        icon: IconUsers,
      },
      {
        title: "Amenity Reservations",
        value: stats.reservations.total.toString(),
        details: `${stats.reservations.byStatus.APPROVED || 0} Approved • ${stats.reservations.byStatus.PENDING || 0} Pending`,
        icon: IconCalendarEvent,
      },
      {
        title: "Total Revenue",
        value: `₱${(stats.monthlyDues.revenue + stats.reservations.revenue).toLocaleString()}`,
        details: `Dues: ₱${stats.monthlyDues.revenue.toLocaleString()} • Reservations: ₱${stats.reservations.revenue.toLocaleString()}`,
        icon: IconCurrencyDollar,
      },
      {
        title: "Feedback",
        value: stats.feedback.total.toString(),
        details: `${stats.feedback.byStatus.NEW || 0} New • ${stats.feedback.byStatus.RESOLVED || 0} Resolved`,
        icon: IconMessageCircle,
      },
    ];
  }, [stats]);

  const recentTransactions: RecentTransaction[] = useMemo(() => {
    if (!stats) return [];
    const transactions: RecentTransaction[] = [];

    // Add recent monthly dues
    stats.recentMonthlyDues.forEach((due) => {
      const residentName = `${due.resident.firstName} ${due.resident.lastName}`;
      const dueStatus =
        due.status === "APPROVED"
          ? ("Completed" as const)
          : due.status === "REJECTED"
            ? ("Rejected" as const)
            : ("Pending" as const);
      transactions.push({
        date: format(new Date(due.createdAt), "MMM. d, yyyy"),
        type: "Monthly Due",
        resident: residentName,
        amount: `₱${due.amountPaid.toLocaleString()}`,
        status: dueStatus,
      });
    });

    // Add recent reservations
    stats.recentReservations.forEach((reservation) => {
      const reservationStatus =
        reservation.status === "APPROVED"
          ? ("Completed" as const)
          : reservation.status === "REJECTED" || reservation.status === "CANCELLED"
            ? ("Rejected" as const)
            : ("Pending" as const);
      transactions.push({
        date: format(new Date(reservation.date), "MMM. d, yyyy"),
        type: "Amenity Reservation",
        resident: reservation.fullName,
        amount: `₱${reservation.amountPaid.toLocaleString()}`,
        status: reservationStatus,
      });
    });

    // Sort by date (most recent first) and take top 5
    return transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [stats]);

  // Prepare print data
  const printData = useMemo(() => {
    if (!stats) return null;
    const userCount = stats.accounts.byRole.USER || 0;
    const adminCount = (stats.accounts.byRole.ADMIN || 0) + (stats.accounts.byRole.SUPERADMIN || 0) + (stats.accounts.byRole.ACCOUNTING || 0);

    const periodLabels: Record<Period, string> = {
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
      annually: "Annually",
    };

    const periodLabel = periodLabels[period];
    const periodRange = stats.periodRange
      ? `${format(stats.periodRange.start, "MMM d, yyyy")} - ${format(stats.periodRange.end, "MMM d, yyyy")}`
      : "";

    return {
      generatedAt: format(new Date(), "MMMM d, yyyy 'at' h:mm a"),
      period: periodLabel,
      periodRange,
      statistics: [
        { label: "Total Accounts", value: stats.accounts.total, details: `${userCount} Users, ${adminCount} Admins` },
        { label: "Total Residents", value: stats.residents.total, details: `${stats.residents.byType.RESIDENT || 0} Residents, ${stats.residents.byType.TENANT || 0} Tenants` },
        { label: "Registered Vehicles", value: stats.vehicles.total, details: `${stats.vehicles.byType.SEDAN || 0} Sedan, ${stats.vehicles.byType.SUV || 0} SUV` },
        { label: "Monthly Dues", value: `${stats.monthlyDues.paid}/${stats.monthlyDues.total}`, details: `${stats.monthlyDues.paid} Paid, ${stats.monthlyDues.pending} Pending` },
        { label: "Available Lots", value: stats.lots.available, details: `${stats.lots.available} Vacant, ${stats.lots.owned} Owned` },
        { label: "Amenity Reservations", value: stats.reservations.total, details: `${stats.reservations.byStatus.APPROVED || 0} Approved, ${stats.reservations.byStatus.PENDING || 0} Pending` },
        { label: "Total Revenue", value: `₱${(stats.monthlyDues.revenue + stats.reservations.revenue).toLocaleString()}`, details: `Dues: ₱${stats.monthlyDues.revenue.toLocaleString()}, Reservations: ₱${stats.reservations.revenue.toLocaleString()}` },
        { label: "Feedback", value: stats.feedback.total, details: `${stats.feedback.byStatus.NEW || 0} New, ${stats.feedback.byStatus.RESOLVED || 0} Resolved` },
      ],
      reservations: {
        approved: stats.reservations.byStatus.APPROVED || 0,
        pending: stats.reservations.byStatus.PENDING || 0,
        rejected: stats.reservations.byStatus.REJECTED || 0,
        cancelled: stats.reservations.byStatus.CANCELLED || 0,
      },
      feedback: {
        new: stats.feedback.byStatus.NEW || 0,
        inReview: stats.feedback.byStatus.IN_REVIEW || 0,
        resolved: stats.feedback.byStatus.RESOLVED || 0,
      },
      revenue: {
        monthlyDues: stats.monthlyDues.revenue,
        reservations: stats.reservations.revenue,
        total: stats.monthlyDues.revenue + stats.reservations.revenue,
      },
      recentTransactions,
    };
  }, [stats, recentTransactions, period]);

  if (isLoading || !stats || !printData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      {/* Print View */}
      <div className="print-only print-section">
        <div className="mb-6 border-b-2 border-black pb-4">
          <h1 className="text-2xl font-bold">Promenade Residence Dashboard Report</h1>
          <p className="text-sm mt-1">
            Generated on {printData.generatedAt}
          </p>
          <p className="text-sm mt-1 font-semibold">
            Period: {printData.period} ({printData.periodRange})
          </p>
        </div>

        <div className="mb-6 print-section">
          <h2 className="text-xl font-semibold mb-4">Statistics Overview</h2>
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-2 font-semibold border border-black">Metric</th>
                <th className="text-left p-2 font-semibold border border-black">Value</th>
                <th className="text-left p-2 font-semibold border border-black">Details</th>
              </tr>
            </thead>
            <tbody>
              {printData.statistics.map((stat, index) => (
                <tr key={index}>
                  <td className="p-2 border border-black">{stat.label}</td>
                  <td className="p-2 font-semibold border border-black">{stat.value}</td>
                  <td className="p-2 text-sm border border-black">{stat.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-6 print-section">
          <div>
            <h3 className="text-lg font-semibold mb-3">Reservation Status</h3>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-2 font-semibold border border-black">Status</th>
                  <th className="text-right p-2 font-semibold border border-black">Count</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border border-black">Approved</td>
                  <td className="p-2 text-right border border-black">{printData.reservations.approved}</td>
                </tr>
                <tr>
                  <td className="p-2 border border-black">Pending</td>
                  <td className="p-2 text-right border border-black">{printData.reservations.pending}</td>
                </tr>
                <tr>
                  <td className="p-2 border border-black">Rejected</td>
                  <td className="p-2 text-right border border-black">{printData.reservations.rejected}</td>
                </tr>
                <tr>
                  <td className="p-2 border border-black">Cancelled</td>
                  <td className="p-2 text-right border border-black">{printData.reservations.cancelled}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Feedback Status</h3>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-2 font-semibold border border-black">Status</th>
                  <th className="text-right p-2 font-semibold border border-black">Count</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border border-black">New</td>
                  <td className="p-2 text-right border border-black">{printData.feedback.new}</td>
                </tr>
                <tr>
                  <td className="p-2 border border-black">In Review</td>
                  <td className="p-2 text-right border border-black">{printData.feedback.inReview}</td>
                </tr>
                <tr>
                  <td className="p-2 border border-black">Resolved</td>
                  <td className="p-2 text-right border border-black">{printData.feedback.resolved}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-6 print-section">
          <h3 className="text-lg font-semibold mb-3">Revenue Breakdown</h3>
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-2 font-semibold border border-black">Source</th>
                <th className="text-right p-2 font-semibold border border-black">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border border-black">Monthly Dues</td>
                <td className="p-2 text-right border border-black">₱{printData.revenue.monthlyDues.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="p-2 border border-black">Reservations</td>
                <td className="p-2 text-right border border-black">₱{printData.revenue.reservations.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="p-2 font-semibold border border-black">Total Revenue</td>
                <td className="p-2 text-right font-semibold border border-black">₱{printData.revenue.total.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="print-section">
          <h3 className="text-lg font-semibold mb-3">Recent Transactions</h3>
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-2 font-semibold border border-black">Date</th>
                <th className="text-left p-2 font-semibold border border-black">Type</th>
                <th className="text-left p-2 font-semibold border border-black">Resident</th>
                <th className="text-right p-2 font-semibold border border-black">Amount</th>
                <th className="text-left p-2 font-semibold border border-black">Status</th>
              </tr>
            </thead>
            <tbody>
              {printData.recentTransactions.map((transaction, index) => (
                <tr key={index}>
                  <td className="p-2 border border-black">{transaction.date}</td>
                  <td className="p-2 border border-black">{transaction.type}</td>
                  <td className="p-2 border border-black">{transaction.resident}</td>
                  <td className="p-2 text-right border border-black">{transaction.amount}</td>
                  <td className="p-2 border border-black">{transaction.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Screen View */}
      <div className="space-y-6 no-print">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4">
        <div className="space-y-2 flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-6xl">
            Welcome to the Promenade Residence management dashboard. Monitor key
            metrics, track account activity, and manage community operations
            from this centralized view. Get real-time insights into residents,
            transactions, and property status.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto shrink-0">
          <Select value={period} onValueChange={(value) => setPeriod(value as Period)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="annually">Annually</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setReportDialogOpen(true)} variant="primary" className="w-full sm:w-auto shrink-0 no-print">
            <IconFileReport className="h-4 w-4" />
            <span className="hidden sm:inline">Create Report</span>
            <span className="sm:hidden">Report</span>
          </Button>
        </div>
      </div>

      {/* Period Indicator */}
      {stats.periodRange && (
        <div className="bg-muted/50 rounded-lg p-4 border">
          <p className="text-sm text-muted-foreground">
            Showing data for <span className="font-semibold capitalize">{period}</span> period:{" "}
            <span className="font-medium">
              {format(stats.periodRange.start, "MMM d, yyyy")} - {format(stats.periodRange.end, "MMM d, yyyy")}
            </span>
          </p>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
      <div className="grid gap-6 lg:grid-cols-10">
        <div className="lg:col-span-7 min-w-0 space-y-6">
          <CollectionAreaChart />
          <AmenityEarningsChart />
          <div className="w-full overflow-x-auto">
            <RecentTransactionsTable
              transactions={recentTransactions}
              onCtaClick={() => window.location.href = "/admin/transactions"}
            />
          </div>
        </div>
        <div className="lg:col-span-3 space-y-6 min-w-0">
          <div className="w-full overflow-x-auto">
            <AmenityReservationCalendar />
          </div>
          <ReservationStatusChart />
          <MonthlyDuesPieChart />
        </div>
      </div>
    </div>

    {stats && (
      <ReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        stats={stats}
        periodRange={stats.periodRange}
      />
    )}
    </>
  );
};

export default Page;
