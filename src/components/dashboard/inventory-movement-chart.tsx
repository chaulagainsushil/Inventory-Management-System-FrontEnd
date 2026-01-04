"use client"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartTooltipContent, ChartContainer, ChartLegend, ChartLegendContent } from '@/components/ui/chart';

const chartData = [
  { week: 'Week 1', stockIn: 400, stockOut: 240 },
  { week: 'Week 2', stockIn: 300, stockOut: 139 },
  { week: 'Week 3', stockIn: 200, stockOut: 380 },
  { week: 'Week 4', stockIn: 278, stockOut: 390 },
  { week: 'Week 5', stockIn: 189, stockOut: 480 },
  { week: 'Week 6', stockIn: 239, stockOut: 380 },
  { week: 'Week 7', stockIn: 349, stockOut: 430 },
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

export default function InventoryMovementChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Movement</CardTitle>
        <CardDescription>Weekly stock movement analysis for the last 7 weeks</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line type="monotone" dataKey="stockIn" stroke="var(--color-stockIn)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="stockOut" stroke="var(--color-stockOut)" strokeWidth={2.5} dot={false} />
            </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
