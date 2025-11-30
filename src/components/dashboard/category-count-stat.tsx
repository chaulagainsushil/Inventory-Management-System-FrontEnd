'use client';

import { useState, useEffect } from 'react';
import { LayoutGrid } from 'lucide-react';
import StatCard from '@/components/dashboard/stat-card';
import { useToast } from '@/hooks/use-toast';

export default function CategoryCountStat() {
  const [count, setCount] = useState('...');
  const { toast } = useToast();

  useEffect(() => {
    const fetchWithToken = async (retries = 3) => {
      const token = localStorage.getItem('authToken');

      if (!token) {
        if (retries > 0) {
          // If token not found, wait a bit and retry.
          setTimeout(() => fetchWithToken(retries - 1), 500);
        } else {
          setCount('N/A');
          const errorMessage = "Auth token not found after multiple retries.";
          console.error('Failed to fetch category count:', errorMessage);
        }
        return;
      }

      try {
        const response = await fetch('https://localhost:7232/api/Category/count', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch category count. Status: ${response.status}`);
        }

        const data = await response.json();
        setCount(data.toString());
      } catch (error: any) {
        console.error('Error fetching category count:', error.message);
        setCount('N/A');
        toast({
          variant: 'destructive',
          title: 'API Error',
          description: error.message || 'Could not fetch category count from the server.',
        });
      }
    };
    
    fetchWithToken();
  }, [toast]);

  return <StatCard title="Total Categories" value={count} icon={LayoutGrid} />;
}
