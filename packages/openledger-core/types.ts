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
}

export interface AnswerResult {
  answer: string;
  sources: string[];
  confidence: number;
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
