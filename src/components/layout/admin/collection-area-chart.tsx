"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
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

export const description = "Collection revenue area chart";

const chartConfig = {
  collection: {
    label: "Collection",
    color: "#327248",
  },
} satisfies ChartConfig;

export function CollectionAreaChart() {
  const trpc = useTRPC();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = React.useState(currentYear.toString());

  const { data: chartData } = useSuspenseQuery(
    trpc.dashboard.getCollectionData.queryOptions({
      year: parseInt(selectedYear),
    })
  );

  const formatCurrency = (value: number) => {
    return `₱${value.toLocaleString("en-US")}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Collection Revenue</CardTitle>
        <CardDescription>
          Monthly collection revenue overview
        </CardDescription>
        <CardAction>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
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
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer
          className="aspect-auto h-[350px] w-full"
          config={chartConfig}
        >
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
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
                            {payload[0].payload.month}
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
            <Area
              dataKey="collection"
              type="natural"
              fill="var(--color-collection)"
              fillOpacity={0.4}
              stroke="var(--color-collection)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex items-center gap-4 w-full">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: "#327248" }}
            />
            <span className="text-sm text-muted-foreground">Collection</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-muted-foreground">
              Total: {formatCurrency(
                chartData.reduce((sum, item) => sum + item.collection, 0)
              )}
            </span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
