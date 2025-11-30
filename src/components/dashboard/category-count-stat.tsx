'use client';

import { useState, useEffect } from 'react';
import { LayoutGrid } from 'lucide-react';
import StatCard from '@/components/dashboard/stat-card';
import { useToast } from '@/hooks/use-toast';

export default function CategoryCountStat() {
  const [count, setCount] = useState('...');
  const { toast } = useToast();

  useEffect(() => {
    // This effect runs once after the component mounts on the client.
    const token = localStorage.getItem('authToken');

    if (!token) {
      // If there's no token, don't even try to fetch.
      // This might happen if the user is not logged in.
      // We'll wait for a short period in case the token is being set.
      const handle = setTimeout(() => {
        if (!localStorage.getItem('authToken')) {
            setCount('N/A');
        }
      }, 1500);
      return () => clearTimeout(handle);
    }

    const fetchCategoryCount = async () => {
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
          description: 'Could not fetch category count from the server.',
        });
      }
    };

    fetchCategoryCount();
  }, [toast]);

  return <StatCard title="Total Categories" value={count} icon={LayoutGrid} />;
}
