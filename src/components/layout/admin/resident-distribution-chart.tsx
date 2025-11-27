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
  residents: {
    label: "Residents",
    color: "#3b82f6",
  },
  tenants: {
    label: "Tenants",
    color: "#10b981",
  },
} satisfies ChartConfig;

export function ResidentDistributionChart() {
  const trpc = useTRPC();
  const { data: stats } = useSuspenseQuery(
    trpc.dashboard.getStatistics.queryOptions()
  );

  const chartData = [
    {
      type: "Residents",
      count: stats.residents.byType.RESIDENT || 0,
    },
    {
      type: "Tenants",
      count: stats.residents.byType.TENANT || 0,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resident Distribution</CardTitle>
        <CardDescription>Residents vs Tenants</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px]">
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="type"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="count"
              fill="var(--color-residents)"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

