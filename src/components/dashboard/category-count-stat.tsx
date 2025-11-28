'use client';

import { useState, useEffect, useCallback } from 'react';
import { LayoutGrid } from 'lucide-react';
import StatCard from '@/components/dashboard/stat-card';
import { useToast } from '@/hooks/use-toast';

export default function CategoryCountStat() {
  const [count, setCount] = useState('0');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCategoryCount = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found.');
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
      // We don't show a toast here to avoid spamming the user on the dashboard.
      // The error will be visible in the console.
      setCount('N/A');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategoryCount();
  }, [fetchCategoryCount]);

  if (loading) {
    return <StatCard title="Total Categories" value="..." icon={LayoutGrid} />;
  }

  return <StatCard title="Total Categories" value={count} icon={LayoutGrid} />;
}
