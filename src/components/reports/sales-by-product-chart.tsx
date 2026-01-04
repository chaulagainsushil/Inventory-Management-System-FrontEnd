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
import { ChartTooltipContent } from '@/components/ui/chart';

const chartData = [
  { productName: 'Dell Laptop', sales: 456, fill: 'hsl(var(--chart-1))' },
  { productName: 'Samsung TV', sales: 341, fill: 'hsl(var(--chart-2))' },
  { productName: 'Gaming Mouse', sales: 298, fill: 'hsl(var(--chart-3))' },
  { productName: 'iPhone 15', sales: 254, fill: 'hsl(var(--chart-4))' },
  { productName: 'Air Pods', sales: 187, fill: 'hsl(var(--chart-5))' },
];

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
        <div className="h-[350px] w-full">
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
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Legend
                iconType="circle"
                formatter={(value, entry) => (
                  <span className="text-sm text-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
