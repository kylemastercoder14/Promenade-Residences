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
} from "@/components/ui/chart";

const chartConfig = {
  new: {
    label: "New",
    color: "#3b82f6",
  },
  inReview: {
    label: "In Review",
    color: "#eab308",
  },
  resolved: {
    label: "Resolved",
    color: "#22c55e",
  },
} satisfies ChartConfig;

export function FeedbackStatusChart() {
  const trpc = useTRPC();
  const { data: stats } = useSuspenseQuery(
    trpc.dashboard.getStatistics.queryOptions()
  );

  const chartData = [
    {
      name: "New",
      value: stats.feedback.byStatus.NEW || 0,
      fill: "var(--color-new)",
    },
    {
      name: "In Review",
      value: stats.feedback.byStatus.IN_REVIEW || 0,
      fill: "var(--color-inReview)",
    },
    {
      name: "Resolved",
      value: stats.feedback.byStatus.RESOLVED || 0,
      fill: "var(--color-resolved)",
    },
  ].filter((item) => item.value > 0);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feedback Status</CardTitle>
          <CardDescription>Breakdown of feedback submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[250px] text-muted-foreground">
            No feedback data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback Status</CardTitle>
        <CardDescription>Breakdown of feedback submissions</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-square h-[250px]">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
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
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

