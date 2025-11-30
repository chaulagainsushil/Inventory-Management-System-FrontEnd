'use client';

import { useState, useEffect } from 'react';
import { LayoutGrid } from 'lucide-react';
import StatCard from '@/components/dashboard/stat-card';
import { useToast } from '@/hooks/use-toast';

export default function CategoryCountStat() {
  const [count, setCount] = useState('...');
  const { toast } = useToast();

  useEffect(() => {
    // This function will run only on the client side after the component mounts.
    const fetchCategoryCount = async () => {
      const token = localStorage.getItem('authToken');

      if (!token) {
        setCount('N/A');
        // Don't toast here as it might be an expected state before login.
        console.error('Authentication token not found.');
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
          // The API returned an error (e.g., 401, 500)
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
    
    // A small delay to ensure the token from a fresh login is available.
    const timer = setTimeout(() => {
        fetchCategoryCount();
    }, 100);

    return () => clearTimeout(timer);
  }, [toast]);

  return <StatCard title="Total Categories" value={count} icon={LayoutGrid} />;
}
