
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/Sales/monthly-revenue`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch monthly revenue. Status: ${response.status}`);
        }

        const data = await response.json();
        // Assuming the API returns a number directly or an object like { monthlyRevenue: 12345.67 }
        const revenueValue = typeof data === 'number' ? data : data.monthlyRevenue;
        setRevenue(revenueValue.toFixed(2));
      } catch (error: any) {
        setRevenue('N/A');
        toast({
          variant: 'destructive',
          title: 'API Error',
          description: error.message || 'Could not fetch monthly revenue from the server.',
        });
      }
    };
    
    fetchMonthlyRevenue();

  }, [toast]);

  return <StatCard title="Monthly Revenue" value={revenue} icon={CreditCard} />;
}
