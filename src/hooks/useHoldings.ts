import { useState, useEffect, useCallback } from 'react';
import { tokensApi, type Token } from '@/lib/api';

export function useHoldings(accountId?: string) {
  const [data, setData] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await tokensApi.list(accountId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch holdings');
    } finally {
      setIsLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}
