import fs from "node:fs";
import path from "node:path";
import { Evidence } from "@/packages/openledger-core/types";

const OUT_DIR = path.join(process.cwd(), ".out");

export interface AgentEvidence {
  repo_url: string;
  artifacts: Array<{
    type: "code" | "api" | "db" | "config";
    path: string;
    summary: string;
    pii: string[];
    data_flows: Array<{
      from: string;
      to: string;
      purpose: string;
    }>;
    risk_flags: string[];
  }>;
}

export interface AgentAudit {
  compliance_score: number;
  framework_breakdown: Array<{
    framework: "GDPR" | "CCPA" | "GLBA";
    score: number;
    passed: string[];
    failed: Array<{
      id: string;
      title: string;
      why: string;
      evidence_refs: number[];
    }>;
  }>;
  recommended_fixes: Array<{
    title: string;
    change: string;
    impact: "low" | "med" | "high";
  }>;
  current_policy: {
    file_path: string;
    content: string;
    last_modified: string;
    compliance_score: number;
  };
  new_policy: {
    content: string;
    changes_summary: string;
    compliance_score: number;
    requires_approval: boolean;
  };
  drift_events: Array<{
    id: string;
    severity: "low" | "medium" | "high";
    type: "new_endpoint" | "removed_endpoint" | "new_pii" | "changed_data_flow" | "security_risk" | "policy_violation";
    file: string;
    endpoint: string;
    description: string;
    evidence_refs: number[];
    policy_update_required: boolean;
    recommended_action: string;
  }>;
  user_toggles: Array<{
    id: string;
    name: string;
    category: string;
    description: string;
    implementation: {
      file: string;
      language: string;
      diff: string;
      instructions: string;
    };
    affected_endpoints: string[];
    policy_impact: string;
  }>;
}

export interface AgentReceipt {
  updated: boolean;
  diff_summary: string;
  drift_events: Array<{
    id: string;
    severity: "low" | "medium" | "high";
    type: "new_endpoint" | "removed_endpoint" | "new_pii" | "changed_data_flow" | "security_risk";
    file: string;
    endpoint: string;
    description: string;
    evidence_refs: number[];
    policy_update_required: boolean;
  }>;
  new_artifacts: number[];
  removed_artifacts: number[];
  modified_artifacts: number[];
}

export function loadAgentData() {
  try {
    // Load evidence data
    const evidencePath = path.join(OUT_DIR, "evidence.json");
    const evidenceData: AgentEvidence = fs.existsSync(evidencePath)
      ? JSON.parse(fs.readFileSync(evidencePath, "utf8"))
      : null;

    // Load audit data
    const auditPath = path.join(OUT_DIR, "audit.json");
    const auditData: AgentAudit = fs.existsSync(auditPath)
      ? JSON.parse(fs.readFileSync(auditPath, "utf8"))
      : null;

    // Load receipt data
    const receiptPath = path.join(OUT_DIR, "receipt.json");
    const receiptData: AgentReceipt = fs.existsSync(receiptPath)
      ? JSON.parse(fs.readFileSync(receiptPath, "utf8"))
      : null;

    return {
      evidence: evidenceData,
      audit: auditData,
      receipt: receiptData,
    };
  } catch (error) {
    console.error("Failed to load agent data:", error);
    return {
      evidence: null,
      audit: null,
      receipt: null,
    };
  }
}

export function convertAgentEvidenceToComponent(agentEvidence: AgentEvidence): Evidence[] {
  if (!agentEvidence || !agentEvidence.artifacts) {
    return [];
  }

  return agentEvidence.artifacts.map((artifact, index) => {
    // Extract data types from PII and data flows
    let dataTypes: string[] = [...artifact.pii];
    
    // Add data types from data flows
    artifact.data_flows.forEach(flow => {
      if (flow.purpose.toLowerCase().includes("account")) {
        dataTypes.push("account_data");
      }
      if (flow.purpose.toLowerCase().includes("transaction") || flow.purpose.toLowerCase().includes("purchase")) {
        dataTypes.push("transaction_data");
      }
      if (flow.purpose.toLowerCase().includes("user") || flow.purpose.toLowerCase().includes("customer")) {
        dataTypes.push("user_data");
      }
    });

    // If no specific data types found, use generic ones
    if (dataTypes.length === 0) {
      dataTypes = ["data_collection"];
    }

    // Remove duplicates
    dataTypes = [...new Set(dataTypes)];

    return {
      id: `evidence-${index}`,
      file: artifact.path,
      endpoint: artifact.type === "api" ? artifact.path : "",
      method: artifact.type === "api" ? "GET" : "N/A",
      fields: dataTypes,
      line: 0, // Not available in agent output
      timestamp: new Date().toISOString(),
    };
  });
}

export function convertAgentAuditToDriftEvents(agentAudit: AgentAudit) {
  if (!agentAudit || !agentAudit.drift_events) {
    return [];
  }

  return agentAudit.drift_events.map(event => ({
    id: event.id,
    severity: event.severity,
    status: "open" as const,
    endpoint: event.endpoint,
    field: event.type,
    file: event.file,
    line: 0, // Not available in agent output
    timestamp: new Date().toISOString(),
    description: event.description,
  }));
}
