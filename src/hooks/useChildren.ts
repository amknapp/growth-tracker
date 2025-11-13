import { useAppDataStore } from '../store/appDataStore';
import { Child } from '../types';

interface UseChildrenResult {
  children: Child[];
  loading: boolean;
  error: Error | null;
  refreshChildren: () => Promise<void>;
}

export const useChildren = (): UseChildrenResult => {
  const children = useAppDataStore(state => state.children);
  const loading = useAppDataStore(state => state.loading);
  const error = useAppDataStore(state => state.error);
  const initialize = useAppDataStore(state => state.initialize);

  return {
    children,
    loading,
    error,
    refreshChildren: initialize,
  };
};
