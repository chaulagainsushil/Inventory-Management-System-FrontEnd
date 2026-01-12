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
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

type PaymentMethodData = {
  paymentMethod: string;
  saleCount: number;
  totalAmount: number;
  percentage: number;
};

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export default function PaymentMethodSummaryChart() {
  const [chartData, setChartData] = React.useState<any[]>([]);
  const [chartConfig, setChartConfig] = React.useState<any>({});
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  const getAuthHeaders = React.useCallback(() => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to view reports.',
      });
      return null;
    }
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }, [toast]);

  React.useEffect(() => {
    const fetchPaymentSummary = async (retries = 3) => {
      const headers = getAuthHeaders();
      if (!headers) {
        if (retries > 0) {
          setTimeout(() => fetchPaymentSummary(retries - 1), 500);
        } else {
          setLoading(false);
        }
        return;
      }
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/Sales/payment-method-summary`,
          { headers }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch payment method summary.');
        }

        const apiResponse = await response.json();
        const data: PaymentMethodData[] = apiResponse.data;

        if (data && data.length > 0) {
          const newChartConfig: any = {
            percentage: { label: '%' },
          };
          
          const newChartData = data.map((item, index) => {
            const colorName = `payment${index + 1}`;
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

      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error fetching report data',
          description: error.message || 'An unknown error occurred.',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchPaymentSummary();
  }, [getAuthHeaders, toast]);

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
                              <p>Percentage: {`${value.toFixed(2)}%`}</p>
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
