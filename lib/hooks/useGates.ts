"use client";

import { useState, useEffect, useCallback } from "react";
import { setGate, getGates, getGateTimestamps } from "../gates";

export interface UseGatesReturn {
  gates: Record<string, boolean>;
  timestamps: Record<string, string>;
  loading: boolean;
  error: string | null;
  updateGate: (name: string, value: boolean) => Promise<void>;
  refreshGates: () => Promise<void>;
}

export function useGates(): UseGatesReturn {
  const [gates, setGatesState] = useState<Record<string, boolean>>({});
  const [timestamps, setTimestamps] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshGates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [gatesData, timestampsData] = await Promise.all([
        getGates(),
        getGateTimestamps(),
      ]);

      setGatesState(gatesData);
      setTimestamps(timestampsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load gates");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateGate = useCallback(
    async (name: string, value: boolean) => {
      try {
        setError(null);
        await setGate(name, value);

        // Update local state immediately for responsive UI
        setGatesState((prev) => ({ ...prev, [name]: value }));
        setTimestamps((prev) => ({
          ...prev,
          [name]: new Date().toISOString(),
        }));

        // Refresh from server to ensure consistency
        await refreshGates();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update gate");
        // Revert on error
        await refreshGates();
      }
    },
    [refreshGates]
  );

  useEffect(() => {
    refreshGates();
  }, [refreshGates]);

  return {
    gates,
    timestamps,
    loading,
    error,
    updateGate,
    refreshGates,
  };
}
