// Mock implementation for testing
import { useState, useEffect } from 'react';

export const useOptimizedFirebase = (path: string, options?: any) => {
  const [data, setData] = useState({ items: [{ id: '1', name: 'Test Item' }] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 100);
  }, [path]);

  const refetch = () => {
    setLoading(false); // Don't show loading for cached data
  };

  return { data, loading, error, refetch };
};