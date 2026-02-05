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
import { Loader2, AlertTriangle, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type StockAlert } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const apiBaseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

export default function StockAlertList() {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingProductId, setUpdatingProductId] = useState<number | null>(null);
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
      const response = await fetch(`${apiBaseUrl}/Sales/reorder-alerts`, { headers });
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

  const handleAddStock = async (alert: StockAlert) => {
    setUpdatingProductId(alert.productId);
    const headers = getAuthHeaders();
    if (!headers) {
      setUpdatingProductId(null);
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/Product/${alert.productId}/add-quantity`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ quantityToAdd: alert.suggestedOrderQty }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || `Failed to add stock for ${alert.productName}`);
      }

      toast({
        title: 'Success',
        description: `Successfully added ${alert.suggestedOrderQty} units to ${alert.productName}.`,
      });

      fetchAlerts();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Operation Failed',
        description: error.message,
      });
    } finally {
      setUpdatingProductId(null);
    }
  };

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
                    <TableHead>Urgency</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
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
                        <TableCell>{getUrgencyBadge(alert.urgencyLevel)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => handleAddStock(alert)}
                            disabled={updatingProductId === alert.productId}
                          >
                            {updatingProductId === alert.productId ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Plus className="mr-2 h-4 w-4" />
                            )}
                            Add Stock
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center h-24">
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
