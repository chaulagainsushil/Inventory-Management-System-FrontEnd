'use client';

import { useState, useEffect } from 'react';
import { Boxes } from 'lucide-react';
import StatCard from '@/components/dashboard/stat-card';
import { useToast } from '@/hooks/use-toast';

export default function ProductCountStat() {
  const [count, setCount] = useState('...');
  const { toast } = useToast();

  useEffect(() => {
    const fetchProductCount = async () => {
      const token = localStorage.getItem('authToken');

      if (!token) {
        setCount('N/A');
        console.error('Authentication token not found.');
        return;
      }

      try {
        const response = await fetch('https://localhost:7232/api/Product/Productcount', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch product count. Status: ${response.status}`);
        }

        const data = await response.json();
        setCount(data.totalProducts);
      } catch (error: any) {
        console.error('Error fetching product count:', error.message);
        setCount('N/A');
        toast({
          variant: 'destructive',
          title: 'API Error',
          description: error.message || 'Could not fetch product count from the server.',
        });
      }
    };
    
    // A small delay to ensure the token from a fresh login is available.
    const timer = setTimeout(() => {
        fetchProductCount();
    }, 100);

    return () => clearTimeout(timer);
  }, [toast]);

  return <StatCard title="Total Products" value={count} icon={Boxes} />;
}
