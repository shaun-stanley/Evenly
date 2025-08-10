import * as React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'recent_searches:';
const MAX_ITEMS = 8;

export type UseRecentSearches = {
  recents: string[];
  addRecent: (q: string) => void;
  removeRecent: (q: string) => void;
  clearRecents: () => void;
  loading: boolean;
};

export function useRecentSearches(key: string): UseRecentSearches {
  const storageKey = React.useMemo(() => `${PREFIX}${key}`, [key]);
  const [recents, setRecents] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (!mounted) return;
        if (raw) {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)) setRecents(arr.filter((x) => typeof x === 'string'));
        }
      } catch {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [storageKey]);

  const persist = React.useCallback(async (arr: string[]) => {
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(arr));
    } catch {
      // ignore
    }
  }, [storageKey]);

  const addRecent = React.useCallback((q: string) => {
    const query = q.trim();
    if (!query) return;
    setRecents((prev) => {
      const exists = new Set(prev.map((p) => p.toLowerCase()));
      const next = [query, ...prev.filter((p) => p.toLowerCase() !== query.toLowerCase())].slice(0, MAX_ITEMS);
      persist(next);
      return next;
    });
  }, [persist]);

  const removeRecent = React.useCallback((q: string) => {
    setRecents((prev) => {
      const next = prev.filter((p) => p.toLowerCase() !== q.toLowerCase());
      persist(next);
      return next;
    });
  }, [persist]);

  const clearRecents = React.useCallback(() => {
    setRecents(() => {
      const next: string[] = [];
      persist(next);
      return next;
    });
  }, [persist]);

  return { recents, addRecent, removeRecent, clearRecents, loading };
}

export default useRecentSearches;
