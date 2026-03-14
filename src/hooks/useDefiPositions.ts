import { useState, useEffect, useCallback } from 'react';
import { defiApi, type DeFiPosition } from '@/lib/api';

export function useDefiPositions(accountId?: string) {
  const [data, setData] = useState<DeFiPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await defiApi.list(accountId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch DeFi positions');
    } finally {
      setIsLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}
