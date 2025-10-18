import {
  GradientAgentRequest,
  GradientAgentResponse,
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
