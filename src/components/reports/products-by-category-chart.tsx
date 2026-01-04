'use client';

import * as React from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
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

type CategoryProductInfo = {
  categoryId: number;
  categoryName: string;
  productCount: number;
  percentageOfTotal: number;
};

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

export default function ProductsByCategoryChart() {
  const [chartData, setChartData] = React.useState<CategoryProductInfo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  const getAuthHeaders = React.useCallback(() => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to view reports. Please log in again.',
      });
      return null;
    }
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }, [toast]);

  React.useEffect(() => {
    const fetchProductsByCategory = async (retries = 3) => {
      const headers = getAuthHeaders();
      if (!headers) {
        if (retries > 0) {
          setTimeout(() => fetchProductsByCategory(retries - 1), 500);
        } else {
          setLoading(false);
        }
        return;
      }
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/Product/products-by-category`,
          { headers }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch product distribution data.');
        }

        const apiResponse = await response.json();
        
        if (apiResponse.isSuccess && apiResponse.data && apiResponse.data.categories) {
          setChartData(apiResponse.data.categories);
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
    fetchProductsByCategory();
  }, [getAuthHeaders, toast]);

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
