"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const chartConfig = {
  earnings: {
    label: "Earnings",
    color: "#327248",
  },
} satisfies ChartConfig;

export function AmenityEarningsChart() {
  const trpc = useTRPC();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [selectedYear, setSelectedYear] = React.useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = React.useState<string>("0");

  const { data: chartData } = useSuspenseQuery(
    trpc.dashboard.getAmenityEarnings.queryOptions({
      year: parseInt(selectedYear),
      month: selectedMonth === "0" ? undefined : parseInt(selectedMonth),
    })
  );

  const formatCurrency = (value: number) => {
    return `₱${value.toLocaleString("en-US")}`;
  };

  const totalEarnings = chartData.reduce((sum, item) => sum + item.earnings, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Amenities Earnings</CardTitle>
        <CardDescription>
          Earnings per amenity for selected period
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
                    <SelectItem key={year} value={year.toString()} className="rounded-lg">
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
                <SelectItem value="0" className="rounded-lg">All Months</SelectItem>
                {[
                  "January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"
                ].map((month, index) => (
                  <SelectItem key={index + 1} value={(index + 1).toString()} className="rounded-lg">
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer
          className="aspect-auto h-[300px] w-full"
          config={chartConfig}
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="amenity"
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
              cursor={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const value = payload[0].value as number;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm text-muted-foreground">
                            {payload[0].payload.amenity}
                          </span>
                          <span className="font-medium">
                            {formatCurrency(value)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="earnings"
              fill="var(--color-earnings)"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
        {totalEarnings > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Total Earnings: <span className="font-semibold">{formatCurrency(totalEarnings)}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

