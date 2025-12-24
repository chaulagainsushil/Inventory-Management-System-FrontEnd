
'use client';

import { useState, useEffect } from 'react';
import { CreditCard } from 'lucide-react';
import StatCard from '@/components/dashboard/stat-card';
import { useToast } from '@/hooks/use-toast';

export default function MonthlyRevenueStat() {
  const [revenue, setRevenue] = useState('...');
  const { toast } = useToast();

  useEffect(() => {
    const fetchMonthlyRevenue = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setRevenue('N/A');
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
          throw new Error(`Status: ${response.status}`);
        }
  
        const data = await response.json();
  
        const revenueValue =
          typeof data === 'number'
            ? data
            : Number(data.totalRevenue);
  
        setRevenue(revenueValue.toFixed(2));
      } catch (error: any) {
        setRevenue('N/A');
        toast({
          variant: 'destructive',
          title: 'API Error',
          description: error.message,
        });
      }
    };
  
    fetchMonthlyRevenue();
  }, [toast]);
  

  return <StatCard title="Monthly Revenue" value={revenue === '...' || revenue === 'N/A' ? revenue : `Rs. ${revenue}`} icon={CreditCard} />;
}
