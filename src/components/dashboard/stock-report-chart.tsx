"use client";
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartTooltipContent, ChartContainer, ChartLegend, ChartLegendContent } from '@/components/ui/chart';

const chartData = [
  { month: 'Jan', stockIn: 186, stockOut: 80 },
  { month: 'Feb', stockIn: 305, stockOut: 200 },
  { month: 'Mar', stockIn: 237, stockOut: 120 },
  { month: 'Apr', stockIn: 73, stockOut: 190 },
  { month: 'May', stockIn: 209, stockOut: 130 },
  { month: 'Jun', stockIn: 214, stockOut: 140 },
];

const chartConfig = {
    stockIn: {
      label: "Stock In",
      color: "hsl(var(--chart-1))",
    },
    stockOut: {
      label: "Stock Out",
      color: "hsl(var(--chart-2))",
    },
} as const;

export default function StockReportChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Report</CardTitle>
        <CardDescription>Monthly Stock In vs. Stock Out</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart data={chartData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis />
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="stockIn" fill="var(--color-stockIn)" radius={4} />
            <Bar dataKey="stockOut" fill="var(--color-stockOut)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
