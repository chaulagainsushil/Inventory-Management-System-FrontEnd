"use client"
import { Line, LineChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartTooltipContent, ChartContainer } from '@/components/ui/chart';

const chartData = [
    { date: '2024-05-01', sales: 251 },
    { date: '2024-05-02', sales: 324 },
    { date: '2024-05-03', sales: 289 },
    { date: '2024-05-04', sales: 412 },
    { date: '2024-05-05', sales: 345 },
    { date: '2024-05-06', sales: 387 },
    { date: '2024-05-07', sales: 453 },
];

const chartConfig = {
    sales: {
      label: "Sales",
      color: "hsl(var(--primary))",
    },
} as const;

export default function SalesStatsChart() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Sales Statistics</CardTitle>
        <CardDescription>Recent sales trends.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
              accessibilityLayer
            >
                <Tooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                />
                <Line
                    dataKey="sales"
                    type="natural"
                    stroke="var(--color-sales)"
                    strokeWidth={2}
                    dot={false}
                />
            </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
