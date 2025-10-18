import { createClient } from "./supabase/client";
import { Gate } from "../packages/openledger-core/types";

// In-memory store for gates (fallback when Supabase is not available)
let gatesStore: Record<string, boolean> = {
  txn_category: true,
  acct_profile: true,
};

let lastUpdated: Record<string, string> = {};

export function gate(name: string): boolean {
  return gatesStore[name] ?? false;
}

export async function setGate(name: string, value: boolean): Promise<void> {
  const supabase = createClient();

  try {
    // Try to update in Supabase first
    const { error } = await supabase.from("gates").upsert({
      name,
      value,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.warn(
        "Supabase gates update failed, using in-memory store:",
        error
      );
    }
  } catch (error) {
    console.warn("Supabase not available, using in-memory store:", error);
  }

  // Update in-memory store regardless
  gatesStore[name] = value;
  lastUpdated[name] = new Date().toISOString();
}

export async function getGates(): Promise<Record<string, boolean>> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("gates")
      .select("name, value, updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      console.warn(
        "Supabase gates fetch failed, using in-memory store:",
        error
      );
      return gatesStore;
    }

    if (data && data.length > 0) {
      const gates: Record<string, boolean> = {};
      data.forEach((row) => {
        gates[row.name] = row.value;
        lastUpdated[row.name] = row.updated_at;
      });
      return gates;
    }
  } catch (error) {
    console.warn("Supabase not available, using in-memory store:", error);
  }

  return gatesStore;
}

export async function getGateTimestamps(): Promise<Record<string, string>> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("gates")
      .select("name, updated_at")
      .order("updated_at", { ascending: false });

    if (error || !data) {
      return lastUpdated;
    }

    const timestamps: Record<string, string> = {};
    data.forEach((row) => {
      timestamps[row.name] = row.updated_at;
    });
    return timestamps;
  } catch (error) {
    return lastUpdated;
  }
}

export function getAllGates(): Record<string, boolean> {
  return { ...gatesStore };
}

export function getGateTimestamp(name: string): string {
  return lastUpdated[name] || new Date().toISOString();
}
