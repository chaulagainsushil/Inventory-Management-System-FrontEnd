'use client';

import { useState, useEffect, useRef } from 'react';
import { LayoutGrid } from 'lucide-react';
import StatCard from '@/components/dashboard/stat-card';

const MAX_RETRIES = 5;
const RETRY_DELAY = 1000;

export default function CategoryCountStat() {
  const [count, setCount] = useState('...');
  const retries = useRef(0);

  useEffect(() => {
    const fetchWithToken = async () => {
      try {
        const token = localStorage.getItem('authToken');

        if (!token) {
          if (retries.current < MAX_RETRIES) {
            retries.current += 1;
            setTimeout(fetchWithToken, RETRY_DELAY);
          } else {
            throw new Error('Auth token not found after multiple retries.');
          }
          return;
        }

        const response = await fetch('https://localhost:7232/api/Category/count', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch category count.');
        }

        const data = await response.json();
        setCount(data.toString());
      } catch (error: any) {
        console.error('Failed to fetch category count:', error.message);
        setCount('N/A');
      }
    };

    fetchWithToken();
  }, []);

  return <StatCard title="Total Categories" value={count} icon={LayoutGrid} />;
}
