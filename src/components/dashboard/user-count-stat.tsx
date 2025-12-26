'use client';

import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import StatCard from '@/components/dashboard/stat-card';
import { useToast } from '@/hooks/use-toast';

export default function UserCountStat() {
  const [count, setCount] = useState('...');
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserCount = async (retries = 3) => {
      if (typeof window === 'undefined') {
        return;
      }
      
      const token = localStorage.getItem('authToken');

      if (!token) {
        if (retries > 0) {
          setTimeout(() => fetchUserCount(retries - 1), 500);
        } else {
          setCount('N/A');
        }
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/Auth/UserCount`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        if (!response.ok) {
           if (response.status === 401) {
            throw new Error('Your session has expired. Please log in again.');
          }
          throw new Error('The server could not process the request for user count.');
        }

        const data = await response.json();
        setCount(data.totalUsers.toString());
      } catch (error: any) {
        setCount('N/A');
        toast({
          variant: 'destructive',
          title: 'API Error',
          description: error.message || 'Could not fetch user count from the server.',
        });
      }
    };
    
    fetchUserCount();

  }, [toast]);

  return <StatCard title="Total Users" value={count} icon={Users} />;
}
