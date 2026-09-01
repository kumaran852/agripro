import { useCallback, useEffect, useState } from "react";
import { apiFetch, ApiError } from "../lib/api-client";

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useApi<T>(
  path: string | null,
  options: { auto?: boolean; init?: RequestInit } = {}
): ApiState<T> {
  const { auto = true, init } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(auto && !!path);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    setError(null);
    try {
      const d = await apiFetch<T>(path, init);
      setData(d);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : String(e);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [path, JSON.stringify(init)]);

  useEffect(() => {
    if (auto) run();
  }, [path, auto, run]);

  return { data, loading, error, refresh: run };
}

export function useMutation<In, Out>(fn: (input: In) => Promise<Out>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const exec = useCallback(
    async (input: In) => {
      setLoading(true);
      setError(null);
      try {
        const r = await fn(input);
        return r;
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : String(e);
        setError(msg);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [fn]
  );
  return { exec, loading, error };
}
