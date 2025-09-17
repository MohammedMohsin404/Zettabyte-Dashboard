// hooks/useFetch.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type FetchState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
};

export function useFetch<T>(url: string | null) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  // Keep most recent URL for refetch()
  const urlRef = useRef<string | null>(url);
  urlRef.current = url;

  const run = useCallback(async () => {
    if (!urlRef.current) return;

    let didCancel = false; // soft-cancel flag (prevents setState after unmount)

    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const res = await fetch(urlRef.current, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as T;
      if (!didCancel) {
        setState({ data: json, loading: false, error: null });
      }
    } catch (err) {
      // Swallow AbortError-like issues; only surface "real" errors
      const e = err as Error & { name?: string };
      if (!didCancel && e?.name !== "AbortError") {
        setState({ data: null, loading: false, error: e });
      } else if (!didCancel) {
        setState((s) => ({ ...s, loading: false }));
      }
    }

    // cleanup for this invocation only
    return () => {
      didCancel = true;
    };
  }, []);

  // Auto-run when URL changes
  useEffect(() => {
    if (!url) return;
    let cleanup: (() => void) | undefined;
    (async () => {
      cleanup = await run();
    })();
    return () => {
      // soft-cancel; don't call AbortController.abort(), which logs in dev
      if (cleanup) cleanup();
    };
  }, [url, run]);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    refetch: run,
  };
}
