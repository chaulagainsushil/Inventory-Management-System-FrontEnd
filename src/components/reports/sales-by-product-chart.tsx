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
import { Loader2 } from 'lucide-react';
import { type TopSellingProduct } from '@/lib/types';


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
  data: TopSellingProduct[];
  loading: boolean;
};

export default function SalesByProductChart({ data, loading }: Props) {
  const [chartData, setChartData] = React.useState<any[]>([]);
  const [chartConfig, setChartConfig] = React.useState<any>({});

  React.useEffect(() => {
    if (data && data.length > 0) {
      const newChartConfig: any = {
        salesPercentage: { label: 'Sales %' },
      };
      
      const newChartData = data.map((product, index) => {
        const colorName = `product${index + 1}`;
        newChartConfig[colorName] = {
          label: product.productName,
          color: CHART_COLORS[index % CHART_COLORS.length],
        };
        return {
          ...product,
          fill: `var(--color-${colorName})`,
        };
      });

      setChartConfig(newChartConfig);
      setChartData(newChartData);
    } else {
      setChartData([]);
    }
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Selling Products</CardTitle>
        <CardDescription>A breakdown of sales by product based on sales percentage.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-[350px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[350px]">
            <ResponsiveContainer>
              <PieChart>
                <Tooltip
                  cursor="pointer"
                  content={<ChartTooltipContent hideLabel formatter={(value, name, props) => {
                    const { payload } = props;
                    return (
                        <div className="flex flex-col gap-1 p-1">
                            <span className="font-bold">{payload.productName}</span>
                            <div className='text-sm'>
                              <p>Total Sales: Rs. {payload.totalSalesAmount.toFixed(2)}</p>
                              <p>Quantity Sold: {payload.totalQuantitySold}</p>
                              <p>Sales Percentage: {`${(value as number).toFixed(2)}%`}</p>
                            </div>
                        </div>
                    )
                  }} />}
                />
                <Pie
                  data={chartData}
                  dataKey="salesPercentage"
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
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                    return (
                      <text
                        x={x}
                        y={y}
                        fill="white"
                        textAnchor={x > cx ? 'start' : 'end'}
                        dominantBaseline="central"
                        className="text-xs font-bold"
                      >
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                >
                  {chartData.map((entry) => (
                    <Cell key={`cell-${entry.productId}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  formatter={(value, entry) => {
                    return (
                      <span className="text-sm text-foreground">
                        {entry.payload.label}
                      </span>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-[350px]">
            <p className="text-muted-foreground">No sales data available to display.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}