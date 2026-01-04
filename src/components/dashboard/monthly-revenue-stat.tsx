'use client';

import { useState, useEffect } from 'react';
import { CreditCard } from 'lucide-react';
import StatCard from '@/components/dashboard/stat-card';
import { useToast } from '@/hooks/use-toast';

export default function MonthlyRevenueStat() {
  const [revenue, setRevenue] = useState('...');
  const { toast } = useToast();

  useEffect(() => {
    const fetchMonthlyRevenue = async (retries = 3) => {
      if (typeof window === 'undefined') {
        return;
      }
      
      const token = localStorage.getItem('authToken');

      if (!token) {
        if (retries > 0) {
          setTimeout(() => fetchMonthlyRevenue(retries - 1), 500);
        } else {
          setRevenue('N/A');
        }
        return;
      }
  
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/Sales/monthly-revenue`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        if (!response.ok) {
           if (response.status === 401) {
            throw new Error('Your session has expired. Please log in again.');
          }
          throw new Error('The server could not process the request for monthly revenue.');
        }
  
        const data = await response.json();
  
        const revenueValue =
          typeof data.revenue === 'number'
            ? data.revenue
            : Number(data.revenue);
  
        setRevenue(revenueValue.toFixed(2));
      } catch (error: any) {
        setRevenue('N/A');
        toast({
          variant: 'destructive',
          title: 'API Error',
          description: error.message || 'An unknown error occurred while fetching revenue.',
        });
      }
    };
  
    fetchMonthlyRevenue();
  }, [toast]);
  

  return <StatCard title="Monthly Revenue" value={revenue === '...' || revenue === 'N/A' ? revenue : `Rs. ${revenue}`} icon={CreditCard} />;
}
