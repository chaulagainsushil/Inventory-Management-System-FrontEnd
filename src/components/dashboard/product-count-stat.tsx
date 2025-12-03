'use client';

import { useState, useEffect } from 'react';
import { Boxes } from 'lucide-react';
import StatCard from '@/components/dashboard/stat-card';
import { useToast } from '@/hooks/use-toast';

const apiBaseUrl = 'https://localhost:7232/api/Product/Productcount';

export default function ProductCountStat() {
  const [count, setCount] = useState('...');
  const [shouldRetry, setShouldRetry] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProductCount = async (retries = 3) => {
      if (typeof window === 'undefined' || !shouldRetry) {
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
        const response = await fetch(apiBaseUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch product count. Status: ${response.status}`);
        }

        const data = await response.json();
        setCount(data.totalProductCount);
        setShouldRetry(false); 
      } catch (error: any) {
        setCount('N/A');
        setShouldRetry(false); // Stop retrying on network errors
        toast({
          variant: 'destructive',
          title: 'API Connection Error',
          description: 'Could not connect to the server. Please ensure the backend is running and CORS is configured correctly.',
        });
        console.error('Error fetching product count:', error.message);
      }
    };
    
    fetchProductCount();

  }, [toast, shouldRetry]);

  return <StatCard title="Total Products" value={count} icon={Boxes} />;
}
