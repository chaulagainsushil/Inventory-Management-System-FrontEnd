'use client';

import * as React from 'react';
import { Pie, PieChart, ResponsiveContainer, Cell, Legend, Tooltip } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

const chartData = [
  { productName: 'Dell Laptop', sales: 456, fill: 'var(--color-dell)' },
  { productName: 'Samsung TV', sales: 341, fill: 'var(--color-samsung)' },
  { productName: 'Gaming Mouse', sales: 298, fill: 'var(--color-mouse)' },
  { productName: 'iPhone 15', sales: 254, fill: 'var(--color-iphone)' },
  { productName: 'Air Pods', sales: 187, fill: 'var(--color-airpods)' },
];

const chartConfig = {
  sales: {
    label: 'Sales',
  },
  dell: {
    label: 'Dell Laptop',
    color: 'hsl(var(--chart-1))',
  },
  samsung: {
    label: 'Samsung TV',
    color: 'hsl(var(--chart-2))',
  },
  mouse: {
    label: 'Gaming Mouse',
    color: 'hsl(var(--chart-3))',
  },
  iphone: {
    label: 'iPhone 15',
    color: 'hsl(var(--chart-4))',
  },
  airpods: {
    label: 'Air Pods',
    color: 'hsl(var(--chart-5))',
  },
};

export default function SalesByProductChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Selling Products</CardTitle>
        <CardDescription>
          A breakdown of sales by product.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[350px]"
        >
          <ResponsiveContainer>
            <PieChart>
              <Tooltip cursor="pointer" content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={chartData}
                dataKey="sales"
                nameKey="productName"
                cx="50%"
                cy="50%"
                outerRadius={120}
                labelLine={false}
                label={({
                  cx,
                  cy,
                  midAngle,
                  innerRadius,
                  outerRadius,
                  percent,
                }) => {
                  const radius =
                    innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                  const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                  return (
                    <text
                      x={x}
                      y={y}
                      fill="white"
                      textAnchor={x > cx ? 'start' : 'end'}
                      dominantBaseline="central"
                    >
                      {`${(percent * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
              >
                {chartData.map((entry) => (
                  <Cell key={`cell-${entry.productName}`} fill={entry.fill} />
                ))}
              </Pie>
              <Legend
                iconType="circle"
                formatter={(value) => {
                  const configEntry = Object.values(chartConfig).find(
                    (c) => c.label === value
                  );
                  return (
                    <span className="text-sm text-foreground">
                      {configEntry?.label || value}
                    </span>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
