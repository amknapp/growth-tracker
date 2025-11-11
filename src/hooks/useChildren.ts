import { useCallback, useEffect, useState } from 'react';
import SecureStorage from '../services/SecureStorage';
import { Child } from '../types';
import { logger } from '../utils/logger';

interface UseChildrenResult {
  children: Child[];
  loading: boolean;
  error: Error | null;
  refreshChildren: () => Promise<void>;
}

export const useChildren = (): UseChildrenResult => {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadChildren = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const childrenData = await SecureStorage.getChildren();
      setChildren(childrenData);
    } catch (err) {
      logger.error('Error loading children:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChildren();
  }, [loadChildren]);

  return { children, loading, error, refreshChildren: loadChildren };
};
