import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type CacheEntry<T> = {
  value: T;
  updatedAt: number;
};

const memoryCache = new Map<string, CacheEntry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();

// PUBLIC_INTERFACE
export function invalidateCache(keyPrefix: string) {
  /** Invalidates all cache keys with the given prefix. Useful after mutations (upload/delete). */
  for (const key of memoryCache.keys()) {
    if (key.startsWith(keyPrefix)) memoryCache.delete(key);
  }
}

type UseCachedQueryOptions = {
  enabled?: boolean;
  staleTimeMs?: number;
};

// PUBLIC_INTERFACE
export function useCachedQuery<T>(
  key: string,
  queryFn: (signal: AbortSignal) => Promise<T>,
  options?: UseCachedQueryOptions
) {
  /**
   * Simple cache hook (no external deps) with:
   * - in-memory cache
   * - request de-duplication
   * - staleTime based background refresh
   *
   * Contract:
   * - key must uniquely identify query inputs.
   * - queryFn must be stable or wrapped in useCallback.
   */
  const enabled = options?.enabled ?? true;
  const staleTimeMs = options?.staleTimeMs ?? 15_000;

  const [data, setData] = useState<T | null>(() => (memoryCache.get(key)?.value as T | undefined) ?? null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState<boolean>(() => enabled && !memoryCache.has(key));

  const abortRef = useRef<AbortController | null>(null);

  const refetch = useCallback(async () => {
    if (!enabled) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    const cached = memoryCache.get(key);
    const now = Date.now();
    const isFresh = cached ? now - cached.updatedAt < staleTimeMs : false;
    if (cached && isFresh) {
      setData(cached.value as T);
      setLoading(false);
      return;
    }

    try {
      const existing = inFlight.get(key) as Promise<T> | undefined;
      const promise = existing ?? queryFn(controller.signal);
      if (!existing) inFlight.set(key, promise);

      const result = await promise;
      memoryCache.set(key, { value: result, updatedAt: Date.now() });
      setData(result);
    } catch (e) {
      setError(e);
    } finally {
      inFlight.delete(key);
      setLoading(false);
    }
  }, [enabled, key, queryFn, staleTimeMs]);

  useEffect(() => {
    void refetch();
    return () => abortRef.current?.abort();
  }, [refetch]);

  const state = useMemo(
    () => ({
      data,
      error,
      loading,
      refetch,
    }),
    [data, error, loading, refetch]
  );

  return state;
}
