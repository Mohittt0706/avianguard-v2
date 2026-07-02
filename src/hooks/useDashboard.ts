import { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from '@/services/dashboardApi';
import type { DashboardStats } from '@/types/dashboard';

interface UseDashboardResult {
  data: DashboardStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDashboard(): UseDashboardResult {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dashboardApi.getStats();
      setData(response.data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load dashboard data.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
