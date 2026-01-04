'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import StatCard from '@/components/dashboard/stat-card';
import { useToast } from '@/hooks/use-toast';

export default function StockAlertStat() {
  const [count, setCount] = useState('...');
  const { toast } = useToast();

  useEffect(() => {
    const fetchStockAlerts = async (retries = 3) => {
      if (typeof window === 'undefined') {
        return;
      }
      
      const token = localStorage.getItem('authToken');

      if (!token) {
        if (retries > 0) {
          setTimeout(() => fetchStockAlerts(retries - 1), 500);
        } else {
          setCount('N/A');
        }
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/Sales/reorder-alerts`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        if (!response.ok) {
           if (response.status === 401) {
            throw new Error('Your session has expired. Please log in again.');
          }
          throw new Error('The server could not process the request for stock alerts.');
        }

        const data = await response.json();
        setCount(data.totalAlerts.toString());
      } catch (error: any) {
        setCount('N/A');
        toast({
          variant: 'destructive',
          title: 'API Error',
          description: error.message || 'Could not fetch stock alerts.',
        });
      }
    };
    
    fetchStockAlerts();

  }, [toast]);

  return <StatCard title="Stock Alerts" value={count} icon={AlertTriangle} variant="destructive" />;
}
