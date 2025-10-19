// Core types for OpenLedger platform

export interface Evidence {
  file: string;
  line: number;
  endpoint: string;
  fields: string[];
  method: string;
  timestamp: string;
}

export interface Rule {
  match: {
    endpoint: string;
    fields: string[];
  };
  purpose: string;
  gate: string;
  retention: string;
  data_category: string;
}

export interface Gate {
  name: string;
  value: boolean;
  timestamp: string;
  user_id?: string;
}

export interface UICopy {
  gate: string;
  headline: string;
  body: string;
  evidenceRef: string[];
  purpose: string;
  retention: string;
}

export interface Receipt {
  id: string;
  gate: string;
  choice: boolean;
  commit: string;
  timestamp: string;
  evidence_hash: string;
  user_id?: string;
  signature?: string;
}

export interface DriftEvent {
  id: string;
  severity: "low" | "medium" | "high";
  endpoint: string;
  field: string;
  file: string;
  line: number;
  timestamp: string;
  status: "open" | "resolved";
  description: string;
}

export interface ComplianceScore {
  score: number;
  total_checks: number;
  passed_checks: number;
  open_drift: number;
  last_updated: string;
}

// AI Agent types
export interface ClassificationResult {
  purpose: string;
  data_category: string;
  confidence: number;
  reasoning?: string;
}

export interface CopyResult {
  headline: string;
  body: string;
  tone: "professional" | "friendly" | "technical";
}

export interface AuditResult {
  status: "pass" | "fail" | "warning";
  issues?: string[];
  recommended_gate?: string;
  confidence: number;
  compliance_score?: number;
  policy_generated?: string;
}

export interface AnswerResult {
  answer: string;
  sources: string[];
  confidence: number;
}

// New Agent Types
export interface ParsingResult {
  evidence: Evidence[];
  data_flows: DataFlow[];
  pii_fields: string[];
  endpoints: string[];
  db_operations: DatabaseOperation[];
  scan_metadata: {
    repo_url: string;
    commit_hash: string;
    scan_timestamp: string;
    files_scanned: number;
  };
}

export interface DataFlow {
  source: string;
  destination: string;
  data_type: string;
  purpose: string;
  fields: string[];
}

export interface DatabaseOperation {
  table: string;
  operation: "SELECT" | "INSERT" | "UPDATE" | "DELETE";
  fields: string[];
  conditions?: string[];
}

export interface ReceiptResult {
  receipts: Receipt[];
  drift_events: DriftEvent[];
  evidence_updates: Evidence[];
  ledger_hash: string;
  timestamp: string;
}

// Gradient API types
export interface GradientAgentRequest {
  agent_id: string;
  payload: unknown;
  tools?: any[];
}

export interface GradientAgentResponse {
  result: unknown;
  usage?: {
    tokens: number;
    cost: number;
  };
}

// Gradient Job types
export interface GradientJobRequest {
  job_type: "compute" | "scheduled" | "orchestrated" | "hosted";
  payload: unknown;
  schedule?: string; // For scheduled jobs
  memory_versioning?: boolean;
}

export interface GradientJobResponse {
  job_id: string;
  status: "queued" | "running" | "completed" | "failed";
  result?: unknown;
  logs?: string[];
}
