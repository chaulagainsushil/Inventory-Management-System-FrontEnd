'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type StockAlert } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const apiBaseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/Sales/reorder-alerts`;

export default function StockAlertList() {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const getAuthHeaders = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to view stock alerts. Please log in again.',
      });
      return null;
    }
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }, [toast]);

  const fetchAlerts = useCallback(async (retries = 3) => {
    const headers = getAuthHeaders();
    if (!headers) {
      if (retries > 0) {
        setTimeout(() => fetchAlerts(retries - 1), 500);
      } else {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(apiBaseUrl, { headers });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error('Failed to fetch stock alerts from the server.');
      }
      const data = await response.json();
      setAlerts(data.alerts || []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error Fetching Alerts',
        description: error.message || 'An unknown error occurred.',
      });
    } finally {
      setLoading(false);
    }
  }, [toast, getAuthHeaders]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const getUrgencyBadge = (level: string) => {
    switch (level.toUpperCase()) {
      case 'HIGH':
        return <Badge variant="destructive">HIGH</Badge>;
      case 'MEDIUM':
        return <Badge variant="secondary" className="bg-yellow-500 text-black">MEDIUM</Badge>;
      case 'LOW':
        return <Badge variant="secondary" className="bg-blue-500 text-white">LOW</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Stock Alerts</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reorder Suggestions</CardTitle>
          <CardDescription>Products that have reached their reorder point.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Reorder Point</TableHead>
                    <TableHead>Safety Stock</TableHead>
                    <TableHead className="hidden md:table-cell">Avg. Daily Sales</TableHead>
                    <TableHead>Lead Time</TableHead>
                    <TableHead>Suggested Qty</TableHead>
                    <TableHead className="text-right">Urgency</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.length > 0 ? (
                    alerts.map((alert) => (
                      <TableRow key={alert.productId}>
                        <TableCell className="font-medium">{alert.productName}</TableCell>
                        <TableCell className="text-destructive font-bold">{alert.currentStock}</TableCell>
                        <TableCell>{alert.reorderPoint}</TableCell>
                        <TableCell>{alert.safetyStock}</TableCell>
                        <TableCell className="hidden md:table-cell">{alert.averageDailySales.toFixed(2)}</TableCell>
                        <TableCell>{alert.leadTimeDays} days</TableCell>
                        <TableCell className="text-green-600 font-bold">{alert.suggestedOrderQty}</TableCell>
                        <TableCell className="text-right">{getUrgencyBadge(alert.urgencyLevel)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center h-24">
                        <div className="flex flex-col items-center justify-center gap-2">
                            <AlertTriangle className="h-8 w-8 text-green-500" />
                            <span className="text-muted-foreground">No stock alerts right now. Well done!</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}