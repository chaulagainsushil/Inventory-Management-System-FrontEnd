'use client';

import { useState, useEffect } from 'react';
import { LayoutGrid } from 'lucide-react';
import StatCard from '@/components/dashboard/stat-card';
import { useToast } from '@/hooks/use-toast';

export default function CategoryCountStat() {
  const [count, setCount] = useState('...');
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategoryCount = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await fetch('https://localhost:7232/api/Category/count', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          setCount(data.toString());
        } catch (error: any) {
          console.error('Failed to fetch category count:', error);
          setCount('N/A');
          toast({
            variant: 'destructive',
            title: 'API Error',
            description: 'Could not fetch category count from the server.',
          });
        }
      } else {
        // Wait for the token to be set. This effect will re-run when dependencies change,
        // but we'll add a timeout to retry after a short delay if the token isn't found initially.
        setTimeout(fetchCategoryCount, 1000);
      }
    };

    fetchCategoryCount();
  }, [toast]);

  return <StatCard title="Total Categories" value={count} icon={LayoutGrid} />;
}
