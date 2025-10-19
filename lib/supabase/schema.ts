import { createClient } from "@supabase/supabase-js";

// Create Supabase client
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Database Types
export interface Project {
  id: string;
  owner_id: string;
  name: string;
  repo_url?: string;
  created_at: string;
}

export interface Scan {
  id: string;
  project_id: string;
  commit_sha: string;
  evidence: any;
  created_at: string;
}

export interface Policy {
  id: string;
  project_id: string;
  gate: string;
  ui_copy: any;
  version?: string;
  created_at: string;
}

export interface Gate {
  id: string;
  user_id: string;
  project_id: string;
  name: string;
  value: boolean;
  updated_at: string;
}

export interface Receipt {
  id: string;
  user_id: string;
  project_id: string;
  gate: string;
  choice: "on" | "off";
  commit_sha?: string;
  evidence_hash?: string;
  agent_versions?: any;
  created_at: string;
}

export interface Trace {
  id: string;
  project_id: string;
  endpoint: string;
  fields: any;
  session_id?: string;
  ts: string;
}

export interface DriftEvent {
  id: string;
  project_id: string;
  severity: "low" | "med" | "high";
  endpoint?: string;
  field?: string;
  file?: string;
  line?: number;
  reviewed: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  project_id: string;
  agent: string;
  input: any;
  output?: any;
  status?: string;
  created_at: string;
}

// Helper types for API responses
export type GateResponse = { name: string; value: boolean; updated_at: string };
export type ReceiptResponse = {
  id: string;
  gate: string;
  choice: "on" | "off";
  created_at: string;
};
export type DriftEventResponse = {
  id: string;
  severity: string;
  endpoint: string;
  field: string;
  file: string;
  line: number;
  reviewed: boolean;
  created_at: string;
};

// Database table names (without schema prefix - use .schema("app") instead)
export const TABLES = {
  PROJECTS: "projects",
  SCANS: "scans",
  POLICIES: "policies",
  GATES: "gates",
  RECEIPTS: "receipts",
  TRACES: "traces",
  DRIFT_EVENTS: "drift_events",
  AUDIT_LOGS: "audit_logs",
} as const;

// Helper functions for common queries
export const db = {
  // Get user's gates for a project
  async getUserGates(
    userId: string,
    projectId: string = "00000000-0000-0000-0000-000000000001"
  ): Promise<Record<string, boolean>> {
    const { data, error } = await supabase
      .schema("app")
      .from(TABLES.GATES)
      .select("name, value")
      .eq("user_id", userId)
      .eq("project_id", projectId);

    if (error) throw error;

    return data.reduce((acc, gate) => {
      acc[gate.name] = gate.value;
      return acc;
    }, {} as Record<string, boolean>);
  },

  // Update a gate value
  async updateGate(
    userId: string,
    projectId: string,
    gateName: string,
    value: boolean
  ): Promise<void> {
    const { error } = await supabase.schema("app").from(TABLES.GATES).upsert({
      user_id: userId,
      project_id: projectId,
      name: gateName,
      value,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;
  },

  // Get latest receipt for a user
  async getLatestReceipt(
    userId: string,
    projectId: string = "00000000-0000-0000-0000-000000000001"
  ): Promise<Receipt | null> {
    const { data, error } = await supabase
      .schema("app")
      .from(TABLES.RECEIPTS)
      .select("*")
      .eq("user_id", userId)
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  // Create a new receipt
  async createReceipt(
    receipt: Omit<Receipt, "id" | "created_at">
  ): Promise<Receipt> {
    const { data, error } = await supabase
      .schema("app")
      .from(TABLES.RECEIPTS)
      .insert(receipt)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get drift events for a project
  async getDriftEvents(
    projectId: string = "00000000-0000-0000-0000-000000000001"
  ): Promise<DriftEvent[]> {
    const { data, error } = await supabase
      .schema("app")
      .from(TABLES.DRIFT_EVENTS)
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get evidence scans for a project
  async getEvidence(
    projectId: string = "00000000-0000-0000-0000-000000000001"
  ): Promise<Scan[]> {
    const { data, error } = await supabase
      .schema("app")
      .from(TABLES.SCANS)
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get UI copy for a gate
  async getUICopy(
    gate: string,
    projectId: string = "00000000-0000-0000-0000-000000000001"
  ): Promise<Policy | null> {
    const { data, error } = await supabase
      .schema("app")
      .from(TABLES.POLICIES)
      .select("*")
      .eq("project_id", projectId)
      .eq("gate", gate)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },
};
