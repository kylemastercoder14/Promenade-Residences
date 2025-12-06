"use client";

import * as React from "react";
import { Pie, PieChart, Cell } from "recharts";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import {
  Card,
  CardAction,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const chartConfig = {
  paid: {
    label: "Paid",
    color: "#22c55e",
  },
  unpaid: {
    label: "Unpaid",
    color: "#ef4444",
  },
} satisfies ChartConfig;

export function MonthlyDuesPieChart() {
  const trpc = useTRPC();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [selectedYear, setSelectedYear] = React.useState(
    currentYear.toString()
  );
  const [selectedMonth, setSelectedMonth] = React.useState<string>("0");

  const { data: chartData } = useSuspenseQuery(
    trpc.dashboard.getMonthlyDuesPaidUnpaid.queryOptions({
      year: parseInt(selectedYear),
      month: selectedMonth === "0" ? undefined : parseInt(selectedMonth),
    })
  );

  const formatCurrency = (value: number) => {
    return `₱${value.toLocaleString("en-US")}`;
  };

  const pieData = [
    {
      name: "Paid",
      value: chartData.paid,
      fill: "var(--color-paid)",
    },
    {
      name: "Unpaid",
      value: chartData.unpaid,
      fill: "var(--color-unpaid)",
    },
  ].filter((item) => item.value > 0);

  const total = chartData.total;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2">
          <CardTitle>Monthly Dues Status</CardTitle>
          <CardDescription>
            Paid vs Unpaid monthly dues breakdown
          </CardDescription>
          <CardAction>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger
                  className="w-full sm:w-32"
                  size="sm"
                  aria-label="Select year"
                >
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = currentYear - 2 + i;
                    return (
                      <SelectItem
                        key={year}
                        value={year.toString()}
                        className="rounded-lg"
                      >
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger
                  className="w-full sm:w-40"
                  size="sm"
                  aria-label="Select month"
                >
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="0" className="rounded-lg">
                    All Months
                  </SelectItem>
                  {[
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December",
                  ].map((month, index) => (
                    <SelectItem
                      key={index + 1}
                      value={(index + 1).toString()}
                      className="rounded-lg"
                    >
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardAction>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-square mx-auto w-full h-[250px] sm:h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent />}
              formatter={(value: number) => [formatCurrency(value), ""]}
            />
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, percent, value }) => {
                if (value === 0) return "";
                return `${name}: ${(percent * 100).toFixed(1)}%`;
              }}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              className="-translate-y-2 flex-wrap gap-2"
            />
          </PieChart>
        </ChartContainer>
        {total > 0 && (
          <div className="mt-4 pt-4 border-t space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-semibold">{formatCurrency(total)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Paid:</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(chartData.paid)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Unpaid:</span>
              <span className="font-semibold text-red-600">
                {formatCurrency(chartData.unpaid)}
              </span>
            </div>
          </div>
        )}
        {total === 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              No data available for the selected period
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
