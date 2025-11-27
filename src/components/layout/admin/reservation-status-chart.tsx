"use client";

import * as React from "react";
import { Pie, PieChart, Cell } from "recharts";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

const chartConfig = {
  approved: {
    label: "Approved",
    color: "#22c55e",
  },
  pending: {
    label: "Pending",
    color: "#eab308",
  },
  rejected: {
    label: "Rejected",
    color: "#ef4444",
  },
  cancelled: {
    label: "Cancelled",
    color: "#6b7280",
  },
} satisfies ChartConfig;

export function ReservationStatusChart() {
  const trpc = useTRPC();
  const { data: stats } = useSuspenseQuery(
    trpc.dashboard.getStatistics.queryOptions()
  );

  const chartData = [
    {
      name: "Approved",
      value: stats.reservations.byStatus.APPROVED || 0,
      fill: "var(--color-approved)",
    },
    {
      name: "Pending",
      value: stats.reservations.byStatus.PENDING || 0,
      fill: "var(--color-pending)",
    },
    {
      name: "Rejected",
      value: stats.reservations.byStatus.REJECTED || 0,
      fill: "var(--color-rejected)",
    },
    {
      name: "Cancelled",
      value: stats.reservations.byStatus.CANCELLED || 0,
      fill: "var(--color-cancelled)",
    },
  ].filter((item) => item.value > 0);

  const totalReservations = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reservation Status</CardTitle>
        <CardDescription>
          Distribution of amenity reservations by status.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-square mx-auto w-full h-[250px]">
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent />}
              formatter={(value: number) => [`${value} reservations`, ""]}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              className="-translate-y-2 flex-wrap gap-2"
            />
          </PieChart>
        </ChartContainer>
        {totalReservations > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Total Reservations: <span className="font-semibold">{totalReservations}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

