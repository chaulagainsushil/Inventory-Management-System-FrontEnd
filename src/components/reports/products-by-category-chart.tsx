'use client';

import * as React from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Cell } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Loader2 } from 'lucide-react';
import { type CategoryProductInfo } from '@/lib/types';

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(20, 80%, 50%)',
  'hsl(140, 70%, 40%)',
  'hsl(300, 70%, 60%)',
  'hsl(50, 90%, 55%)',
  'hsl(250, 60%, 70%)',
];

type Props = {
    data: CategoryProductInfo[];
    loading: boolean;
};

export default function ProductsByCategoryChart({ data: chartData, loading }: Props) {
  const chartConfig = React.useMemo(() => {
    const config: any = {
        productCount: {
            label: "Product Count"
        }
    };
    chartData.forEach((item, index) => {
        config[item.categoryName] = {
            label: item.categoryName,
            color: CHART_COLORS[index % CHART_COLORS.length]
        }
    })
    return config;
  }, [chartData])

  const legendPayload = chartData.map((item, index) => ({
    value: item.categoryName,
    type: 'square',
    color: CHART_COLORS[index % CHART_COLORS.length],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Products by Category</CardTitle>
        <CardDescription>Distribution of products across different categories.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-[350px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[350px]">
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <XAxis
                  dataKey="categoryName"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 10)}
                  height={60}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis dataKey="productCount" />
                <Tooltip
                  cursor={false}
                  content={<ChartTooltipContent 
                    formatter={(value, name, props) => {
                        const { payload } = props;
                        return (
                            <div className="flex flex-col gap-1 p-1 text-sm">
                                <span className="font-bold">{payload.categoryName}</span>
                                <p>Product Count: {payload.productCount}</p>
                                <p>Percentage: {payload.percentageOfTotal.toFixed(2)}%</p>
                            </div>
                        )
                    }}
                    indicator="dot" 
                    hideLabel
                  />}
                />
                <Bar dataKey="productCount" radius={4}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                </Bar>
                <Legend content={<CustomLegend payload={legendPayload} />} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-[350px]">
            <p className="text-muted-foreground">No product data available.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={`item-${index}`} className="flex items-center space-x-2">
          <span style={{ backgroundColor: entry.color, width: '12px', height: '12px', display: 'inline-block', borderRadius: '2px' }}></span>
          <span className="text-xs text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};