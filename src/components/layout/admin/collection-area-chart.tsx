"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

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

// Static data for all 12 months
const generateChartData = (year: string) => {
  const months = [
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
  ];

  // Sample data - in a real app, this would come from an API based on the selected year
  const sampleData: Record<string, number[]> = {
    "2024": [186000, 305000, 237000, 273000, 209000, 214000, 245000, 198000, 267000, 289000, 312000, 298000],
    "2025": [195000, 315000, 247000, 283000, 219000, 224000, 255000, 208000, 277000, 299000, 322000, 308000],
    "2026": [205000, 325000, 257000, 293000, 229000, 234000, 265000, 218000, 287000, 309000, 332000, 318000],
  };

  return months.map((month, index) => ({
    month,
    collection: sampleData[year]?.[index] || 0,
  }));
};

const chartConfig = {
  collection: {
    label: "Collection",
    color: "#327248",
  },
} satisfies ChartConfig;

export function CollectionAreaChart() {
  const [selectedYear, setSelectedYear] = React.useState("2024");
  const chartData = generateChartData(selectedYear);

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
              <SelectItem value="2024" className="rounded-lg">
                2024
              </SelectItem>
              <SelectItem value="2025" className="rounded-lg">
                2025
              </SelectItem>
              <SelectItem value="2026" className="rounded-lg">
                2026
              </SelectItem>
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
