"use client";

import { useState, useEffect, useCallback } from "react";
import { UICopy } from "../../packages/openledger-core/types";
import { fetchWithFallback, fetchMockData, MOCK_PATHS } from "../api";

export interface UseUICopyReturn {
  uiCopy: UICopy | null;
  loading: boolean;
  error: string | null;
  refreshCopy: () => Promise<void>;
}

export function useUICopy(gate: string): UseUICopyReturn {
  const [uiCopy, setUiCopy] = useState<UICopy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshCopy = useCallback(async () => {
    if (!gate) return;

    try {
      setLoading(true);
      setError(null);

      // Determine mock path based on gate
      const mockPath =
        gate === "txn_category"
          ? MOCK_PATHS.UI_COPY_TXN_CATEGORY
          : MOCK_PATHS.UI_COPY_ACCT_PROFILE;

      // Try API first, fallback to mock
      const copy = await fetchWithFallback(
        `/api/ui-copy?gate=${encodeURIComponent(gate)}`,
        await fetchMockData<UICopy>(mockPath)
      );

      setUiCopy(copy);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load UI copy");
    } finally {
      setLoading(false);
    }
  }, [gate]);

  useEffect(() => {
    refreshCopy();
  }, [refreshCopy]);

  return {
    uiCopy,
    loading,
    error,
    refreshCopy,
  };
}
