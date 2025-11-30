'use client';

import { useState, useEffect } from 'react';
import { LayoutGrid } from 'lucide-react';
import StatCard from '@/components/dashboard/stat-card';

const MAX_RETRIES = 5;
const RETRY_DELAY = 1000;

export default function CategoryCountStat() {
  const [count, setCount] = useState('...');

  useEffect(() => {
    let attempts = 0;

    const fetchWithToken = async () => {
      const token = localStorage.getItem('authToken');

      if (token) {
        try {
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
      } else if (attempts < MAX_RETRIES) {
        attempts++;
        setTimeout(fetchWithToken, RETRY_DELAY);
      } else {
        console.error('Auth token not found after multiple retries.');
        setCount('N/A');
      }
    };

    // Ensure we run this only on the client-side after initial mount
    fetchWithToken();
  }, []);

  return <StatCard title="Total Categories" value={count} icon={LayoutGrid} />;
}
