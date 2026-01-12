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
import { type PaymentMethodData } from '@/lib/types';


const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

type Props = {
  data: PaymentMethodData[];
  loading: boolean;
};

export default function PaymentMethodSummaryChart({ data, loading }: Props) {
  const [chartData, setChartData] = React.useState<any[]>([]);
  const [chartConfig, setChartConfig] = React.useState<any>({});

  React.useEffect(() => {
    if (data && data.length > 0) {
      const newChartConfig: any = {
        percentage: { label: '%' },
      };
      
      const newChartData = data.map((item, index) => {
        newChartConfig[item.paymentMethod] = {
          label: item.paymentMethod,
          color: CHART_COLORS[index % CHART_COLORS.length],
        };
        return {
          ...item,
          fill: `var(--color-${item.paymentMethod})`,
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
        <CardTitle>Sales by Payment Method</CardTitle>
        <CardDescription>A breakdown of sales by payment method.</CardDescription>
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
                            <span className="font-bold">{payload.paymentMethod}</span>
                            <div className='text-sm'>
                              <p>Total Amount: Rs. {payload.totalAmount.toFixed(2)}</p>
                              <p>Sale Count: {payload.saleCount}</p>
                              <p>Percentage: {`${(value as number).toFixed(2)}%`}</p>
                            </div>
                        </div>
                    )
                  }} />}
                />
                <Pie
                  data={chartData}
                  dataKey="percentage"
                  nameKey="paymentMethod"
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
                    <Cell key={`cell-${entry.paymentMethod}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  formatter={(value, entry) => {
                    return (
                      <span className="text-sm text-foreground capitalize">
                        {value}
                      </span>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-[350px]">
            <p className="text-muted-foreground">No payment data available to display.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}