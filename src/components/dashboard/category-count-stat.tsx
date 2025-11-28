'use client';

import { useState, useEffect } from 'react';
import { LayoutGrid } from 'lucide-react';
import StatCard from '@/components/dashboard/stat-card';

export default function CategoryCountStat() {
  const [count, setCount] = useState('0');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryCount = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          // Don't throw an error, just wait. The token might not be ready yet.
          setCount('N/A');
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
        console.error('Failed to fetch category count:', error);
        setCount('N/A');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryCount();
  }, []);

  if (loading) {
    return <StatCard title="Total Categories" value="..." icon={LayoutGrid} />;
  }

  return <StatCard title="Total Categories" value={count} icon={LayoutGrid} />;
}
