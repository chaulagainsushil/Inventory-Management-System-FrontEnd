'use client';

import { useState, useEffect, useCallback } from 'react';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartTooltipContent, ChartContainer, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

type WeeklyReportData = {
  year: number;
  weekNumber: number;
  productIn: number;
  productOut: number;
};

const chartConfig = {
  productIn: {
    label: "Stock In",
    color: "hsl(var(--chart-1))",
  },
  productOut: {
    label: "Stock Out",
    color: "hsl(var(--chart-2))",
  },
} as const;

export default function InventoryMovementChart() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchWeeklyReport = useCallback(async (retries = 3) => {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('authToken');
    if (!token) {
      if (retries > 0) {
        setTimeout(() => fetchWeeklyReport(retries - 1), 500);
      } else {
        setLoading(false);
        toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: 'You must be logged in to view this report.',
        });
      }
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/report/weekly`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch weekly report data.');
      }

      const data: WeeklyReportData[] = await response.json();
      const formattedData = data
        .sort((a, b) => a.weekNumber - b.weekNumber)
        .slice(-4) // Take last 4 weeks
        .map(item => ({
          week: `Week ${item.weekNumber}`,
          productIn: item.productIn,
          productOut: item.productOut,
      }));
      setChartData(formattedData);

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'API Error',
        description: error.message || 'Could not fetch weekly report data.',
      });
      setChartData([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchWeeklyReport();
  }, [fetchWeeklyReport]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Movement</CardTitle>
        <CardDescription>Weekly stock movement analysis for the last 4 weeks</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line type="monotone" dataKey="productIn" stroke="var(--color-productIn)" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="productOut" stroke="var(--color-productOut)" strokeWidth={2.5} dot={false} />
              </LineChart>
          </ChartContainer>
        ) : (
            <div className="flex flex-col items-center justify-center h-[300px]">
                <p className="text-muted-foreground">No inventory movement data available.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
