import {
  GradientAgentRequest,
  GradientAgentResponse,
  GradientJobRequest,
  GradientJobResponse,
  ParsingResult,
  AuditResult,
  AnswerResult,
  ReceiptResult,
} from "../packages/openledger-core/types";

const GRADIENT_API_URL =
  process.env.GRADIENT_API_URL || "https://api.gradient.ai";
const GRADIENT_API_KEY = process.env.GRADIENT_API_KEY;

export async function callAgent(
  agentId: string,
  payload: unknown,
  tools?: any[]
): Promise<GradientAgentResponse> {
  if (!GRADIENT_API_KEY) {
    // Return mock response if no API key
    return getMockResponse(agentId, payload);
  }

  try {
    const response = await fetch(
      `${GRADIENT_API_URL}/agents/${agentId}/actions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GRADIENT_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payload,
          tools,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Gradient API error: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Gradient API call failed:", error);
    // Fallback to mock response
    return getMockResponse(agentId, payload);
  }
}

function getMockResponse(
  agentId: string,
  payload: unknown
): GradientAgentResponse {
  const mockResponses: Record<string, any> = {
    [process.env.GRADIENT_AGENT_CLASSIFIER || "classifier"]: {
      result: {
        purpose: "budgeting",
        data_category: "financial_transaction",
        confidence: 0.95,
        reasoning:
          "Transaction data with merchant and category fields indicates budgeting use case",
      },
    },
    [process.env.GRADIENT_AGENT_COPYWRITER || "copywriter"]: {
      result: {
        headline: "We use your transaction categories for budgeting insights",
        body: "This helps us provide personalized spending analysis and budget recommendations. You can control this data usage with the toggle above.",
        tone: "friendly",
      },
    },
    [process.env.GRADIENT_AGENT_AUDIT || "audit"]: {
      result: {
        status: "pass",
        confidence: 0.88,
        issues: [],
        recommended_gate: "txn_category",
      },
    },
    [process.env.GRADIENT_AGENT_ANSWER || "answer"]: {
      result: {
        answer:
          "We use transaction categories to provide you with detailed spending insights and help you stay within your budget goals.",
        sources: ["evidence.json", "rules.yaml"],
        confidence: 0.92,
      },
    },
  };

  return (
    mockResponses[agentId] || {
      result: { error: "Unknown agent ID" },
      usage: { tokens: 0, cost: 0 },
    }
  );
}

export async function classifyDataUsage(
  endpoint: string,
  fields: string[],
  codeSnippet?: string
) {
  return callAgent(process.env.GRADIENT_AGENT_CLASSIFIER || "classifier", {
    endpoint,
    fields,
    code_snippet: codeSnippet,
  });
}

export async function generateCopy(
  purpose: string,
  fields: string[],
  retention: string,
  controls: string[]
) {
  return callAgent(process.env.GRADIENT_AGENT_COPYWRITER || "copywriter", {
    purpose,
    fields,
    retention,
    controls,
  });
}

export async function auditCompliance(
  evidence: any,
  classification: any,
  copy: any
) {
  return callAgent(process.env.GRADIENT_AGENT_AUDIT || "audit", {
    evidence,
    classification,
    copy,
  });
}

export async function answerQuestion(question: string, context: any) {
  return callAgent(process.env.GRADIENT_AGENT_ANSWER || "answer", {
    question,
    context,
  });
}

// New Agent Functions

/**
 * Parsing Agent - Uses Gradient Jobs/Compute Agents
 * Securely clones fintech repo, scans code and APIs, extracts structured evidence
 */
export async function parseCodebase(
  repoUrl: string,
  commitHash?: string
): Promise<GradientJobResponse> {
  if (!GRADIENT_API_KEY) {
    // Return mock response for development
    return getMockParsingResponse(repoUrl, commitHash);
  }

  try {
    const response = await fetch(`${GRADIENT_API_URL}/jobs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GRADIENT_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        job_type: "compute",
        agent_id: process.env.GRADIENT_AGENT_PARSING || "parsing",
        payload: {
          repo_url: repoUrl,
          commit_hash: commitHash,
          scan_config: {
            include_patterns: ["**/*.ts", "**/*.js", "**/*.tsx", "**/*.jsx"],
            exclude_patterns: ["node_modules/**", "dist/**", "build/**"],
            extract_evidence: true,
            analyze_data_flows: true,
            detect_pii: true,
          },
        },
      } as GradientJobRequest),
    });

    if (!response.ok) {
      throw new Error(
        `Gradient Job API error: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Parsing job failed:", error);
    return getMockParsingResponse(repoUrl, commitHash);
  }
}

/**
 * Audit Agent - Uses Orchestrated Agent + Knowledge Bases + Function Calls
 * Validates evidence against compliance frameworks and generates policies
 */
export async function auditComplianceWithPolicy(
  evidence: any,
  complianceFrameworks: string[] = ["GDPR", "CCPA", "GLBA"]
): Promise<GradientAgentResponse> {
  if (!GRADIENT_API_KEY) {
    return getMockAuditResponse(evidence, complianceFrameworks);
  }

  try {
    const response = await fetch(
      `${GRADIENT_API_URL}/agents/${
        process.env.GRADIENT_AGENT_AUDIT || "audit"
      }/actions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GRADIENT_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payload: {
            evidence,
            compliance_frameworks: complianceFrameworks,
            generate_policy: true,
            calculate_score: true,
          },
          tools: [
            "compliance_checker",
            "policy_generator",
            "risk_assessor",
            "drift_detector",
          ],
          knowledge_bases: [
            process.env.GRADIENT_KB_COMPLIANCE || "compliance_kb",
            process.env.GRADIENT_KB_POLICIES || "policies_kb",
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Gradient API error: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Audit with policy generation failed:", error);
    return getMockAuditResponse(evidence, complianceFrameworks);
  }
}

/**
 * Answer Agent - Uses Hosted Agent Endpoint + RAG from Collections
 * Exposes chatbot/API for end-user privacy questions
 */
export async function answerPrivacyQuestion(
  question: string,
  userId?: string
): Promise<GradientAgentResponse> {
  if (!GRADIENT_API_KEY) {
    return getMockAnswerResponse(question);
  }

  try {
    const response = await fetch(
      `${GRADIENT_API_URL}/hosted-agents/${
        process.env.GRADIENT_AGENT_ANSWER || "answer"
      }/chat`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GRADIENT_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: question,
          context: {
            user_id: userId,
            collections: [
              process.env.GRADIENT_COLLECTION_POLICIES || "policies",
              process.env.GRADIENT_COLLECTION_EVIDENCE || "evidence",
            ],
            rag_enabled: true,
            include_sources: true,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Gradient Hosted Agent error: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Privacy question answering failed:", error);
    return getMockAnswerResponse(question);
  }
}

/**
 * Receipt Agent - Uses Scheduled Agent + Memory Versioning
 * Periodically aggregates consent logs and code diffs
 */
export async function processReceiptsAndDrift(timeRange?: {
  start: string;
  end: string;
}): Promise<GradientJobResponse> {
  if (!GRADIENT_API_KEY) {
    return getMockReceiptResponse(timeRange);
  }

  try {
    const response = await fetch(`${GRADIENT_API_URL}/jobs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GRADIENT_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        job_type: "scheduled",
        agent_id: process.env.GRADIENT_AGENT_RECEIPT || "receipt",
        schedule: "0 */6 * * *", // Every 6 hours
        memory_versioning: true,
        payload: {
          time_range: timeRange,
          aggregate_consent_logs: true,
          detect_code_diffs: true,
          update_evidence_ledger: true,
          generate_drift_reports: true,
        },
      } as GradientJobRequest),
    });

    if (!response.ok) {
      throw new Error(
        `Gradient Scheduled Job error: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Receipt processing failed:", error);
    return getMockReceiptResponse(timeRange);
  }
}

// Mock response functions for development
function getMockParsingResponse(
  repoUrl: string,
  commitHash?: string
): GradientJobResponse {
  return {
    job_id: "mock-parsing-job-123",
    status: "completed",
    result: {
      evidence: [
        {
          file: "app/api/transactions/route.ts",
          line: 15,
          endpoint: "/api/transactions",
          fields: ["amount", "merchant", "category", "date"],
          method: "GET",
          timestamp: new Date().toISOString(),
        },
      ],
      data_flows: [
        {
          source: "user_input",
          destination: "database",
          data_type: "financial_transaction",
          purpose: "budgeting",
          fields: ["amount", "merchant", "category"],
        },
      ],
      pii_fields: ["email", "name", "phone"],
      endpoints: ["/api/transactions", "/api/account", "/api/budget"],
      db_operations: [
        {
          table: "transactions",
          operation: "INSERT",
          fields: ["amount", "merchant", "category", "user_id"],
        },
      ],
      scan_metadata: {
        repo_url: repoUrl,
        commit_hash: commitHash || "mock-commit-123",
        scan_timestamp: new Date().toISOString(),
        files_scanned: 45,
      },
    } as ParsingResult,
  };
}

function getMockAuditResponse(
  evidence: any,
  frameworks: string[]
): GradientAgentResponse {
  return {
    result: {
      status: "pass",
      confidence: 0.88,
      issues: [],
      recommended_gate: "txn_category",
      compliance_score: 85,
      policy_generated: `Based on our analysis of your data usage patterns, we have identified the following data processing activities:

1. **Transaction Data Processing**: We collect and process transaction amounts, merchant information, and categories to provide budgeting insights and spending analysis.

2. **Compliance Status**: Your current implementation meets ${frameworks.join(
        ", "
      )} requirements with a compliance score of 85%.

3. **Recommended Controls**: We recommend implementing user consent gates for transaction categorization to ensure full compliance.

This policy has been automatically generated based on your code evidence and is ready for legal review.`,
    } as AuditResult,
    usage: { tokens: 1250, cost: 0.05 },
  };
}

function getMockAnswerResponse(question: string): GradientAgentResponse {
  return {
    result: {
      answer: `Based on our privacy policy and data usage evidence, ${
        question.toLowerCase().includes("transaction")
          ? "we use your transaction data to provide personalized budgeting insights and spending analysis. You can control this data usage through the settings in your account."
          : "we process your data according to our privacy policy to provide you with the best possible service experience."
      }`,
      sources: [
        "privacy_policy.md",
        "evidence_ledger.json",
        "consent_logs.json",
      ],
      confidence: 0.92,
    } as AnswerResult,
    usage: { tokens: 800, cost: 0.03 },
  };
}

function getMockReceiptResponse(timeRange?: {
  start: string;
  end: string;
}): GradientJobResponse {
  return {
    job_id: "mock-receipt-job-456",
    status: "completed",
    result: {
      receipts: [
        {
          id: "receipt-123",
          gate: "txn_category",
          choice: true,
          commit: "abc123def",
          timestamp: new Date().toISOString(),
          evidence_hash: "hash123",
          user_id: "user-456",
          signature: "sig789",
        },
      ],
      drift_events: [],
      evidence_updates: [],
      ledger_hash: "ledger-hash-789",
      timestamp: new Date().toISOString(),
    } as ReceiptResult,
  };
}
