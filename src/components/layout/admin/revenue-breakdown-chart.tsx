"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
} from "@/components/ui/chart";

const chartConfig = {
  monthlyDues: {
    label: "Monthly Dues",
    color: "#3b82f6",
  },
  reservations: {
    label: "Reservations",
    color: "#10b981",
  },
} satisfies ChartConfig;

export function RevenueBreakdownChart() {
  const trpc = useTRPC();
  const { data: stats } = useSuspenseQuery(
    trpc.dashboard.getStatistics.queryOptions()
  );

  const chartData = [
    {
      category: "Monthly Dues",
      amount: stats.monthlyDues.revenue,
    },
    {
      category: "Reservations",
      amount: stats.reservations.revenue,
    },
  ];

  const formatCurrency = (value: number) => {
    return `₱${value.toLocaleString("en-US")}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Breakdown</CardTitle>
        <CardDescription>Revenue by source</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px]">
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Bar
              dataKey="amount"
              fill="var(--color-monthlyDues)"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

