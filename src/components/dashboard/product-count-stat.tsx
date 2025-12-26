'use client';

import { useState, useEffect } from 'react';
import { Boxes } from 'lucide-react';
import StatCard from '@/components/dashboard/stat-card';
import { useToast } from '@/hooks/use-toast';

const apiBaseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/Product/Productcount`;

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
          if (response.status === 401) {
            throw new Error('Your session has expired. Please log in again.');
          }
          throw new Error('The server could not process the request for product count.');
        }

        const data = await response.json();
        setCount(data.totalProductCount);
        setShouldRetry(false); 
      } catch (error: any) {
        setCount('N/A');
        setShouldRetry(false); // Stop retrying on network errors
        toast({
          variant: 'destructive',
          title: 'API Error',
          description: error.message || 'Could not fetch product count from the server.',
        });
      }
    };
    
    fetchProductCount();

  }, [toast, shouldRetry]);

  return <StatCard title="Total Products" value={count} icon={Boxes} />;
}
