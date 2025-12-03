'use client';

import { useState, useEffect } from 'react';
import { Boxes } from 'lucide-react';
import StatCard from '@/components/dashboard/stat-card';
import { useToast } from '@/hooks/use-toast';

export default function ProductCountStat() {
  const [count, setCount] = useState('...');
  const { toast } = useToast();

  useEffect(() => {
    const fetchProductCount = async (retries = 3) => {
      if (typeof window === 'undefined') {
        return;
      }
      
      const token = localStorage.getItem('authToken');

      if (!token) {
        if (retries > 0) {
          setTimeout(() => fetchProductCount(retries - 1), 500);
        } else {
          setCount('N/A');
        }
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
    
    fetchProductCount();

  }, [toast]);

  return <StatCard title="Total Products" value={count} icon={Boxes} />;
}
