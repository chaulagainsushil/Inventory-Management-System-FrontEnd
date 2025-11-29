'use client';

import { useState, useEffect } from 'react';
import { LayoutGrid } from 'lucide-react';
import StatCard from '@/components/dashboard/stat-card';

export default function CategoryCountStat() {
  const [count, setCount] = useState('...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWithToken = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          // If token is not found, wait and retry.
          // This can happen on initial load or if login state is still being set.
          setTimeout(fetchWithToken, 500);
          return;
        }

        const response = await fetch('https://localhost:7232/api/Category/count', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          // If response is not ok, it might be a temporary server issue or invalid token.
          // We set to N/A to indicate a problem.
          throw new Error('Failed to fetch category count.');
        }

        const data = await response.json();
        setCount(data.toString());
      } catch (error: any) {
        console.error('Failed to fetch category count:', error);
        setCount('N/A'); // Set to 'N/A' on error to indicate a problem.
      } finally {
        setLoading(false);
      }
    };

    fetchWithToken();
  }, []);

  return <StatCard title="Total Categories" value={count} icon={LayoutGrid} />;
}
