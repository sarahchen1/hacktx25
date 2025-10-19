# Gradient AI Agents Implementation

## Overview

This document outlines the implementation of the four new Gradient AI agents for OpenLedger, leveraging specific DigitalOcean Gradient™ AI Agentic Cloud capabilities as requested.

## Agent Architecture

### 1. Parsing Agent (Gradient Jobs/Compute Agents)

**Purpose**: Securely clones fintech repositories, scans code and APIs, extracts structured evidence of data flows.

**Implementation**:

- **File**: `lib/gradient.ts` - `parseCodebase()` function
- **API Route**: `app/api/ai/parse/route.ts`
- **System Prompt**: `infra/gradient/kb/prompts/parsing.system.md`
- **Agent Type**: `compute`
- **Capabilities**: `["code_scanning", "evidence_extraction", "data_flow_analysis", "pii_detection"]`

**Gradient Features Used**:

- **Jobs API**: `/jobs` endpoint for compute-intensive tasks
- **Secure Environment**: Sandboxed code analysis
- **Parallel Processing**: Efficient repository scanning
- **Evidence Extraction**: Structured data flow analysis

**Input/Output**:

```typescript
Input: { repo_url: string, commit_hash?: string }
Output: {
  evidence: Evidence[],
  data_flows: DataFlow[],
  pii_fields: string[],
  endpoints: string[],
  db_operations: DatabaseOperation[],
  scan_metadata: ScanMetadata
}
```

### 2. Audit Agent (Orchestrated Agent + Knowledge Bases + Function Calls)

**Purpose**: Validates evidence against compliance frameworks (GDPR/CCPA/GLBA), generates auto-written policies, calculates compliance scores.

**Implementation**:

- **File**: `lib/gradient.ts` - `auditComplianceWithPolicy()` function
- **API Route**: `app/api/ai/audit/route.ts` (updated)
- **System Prompt**: `infra/gradient/kb/prompts/audit.system.md`
- **Knowledge Base**: `infra/gradient/kb/compliance_frameworks.yaml`
- **Agent Type**: `orchestrated`
- **Tools**: `["compliance_checker", "policy_generator", "risk_assessor", "drift_detector"]`

**Gradient Features Used**:

- **Orchestrated Agents**: Multi-step compliance validation workflow
- **Knowledge Bases**: Compliance frameworks and policy templates
- **Function Calling**: Integration with compliance checking tools
- **Policy Generation**: Automated privacy policy creation

**Input/Output**:

```typescript
Input: { evidence: any, compliance_frameworks: string[] }
Output: {
  status: "pass" | "fail" | "warning",
  confidence: number,
  issues: string[],
  compliance_score: number,
  policy_generated: string
}
```

### 3. Answer Agent (Hosted Agent Endpoint + RAG from Collections)

**Purpose**: Exposes chatbot/API that answers end-user privacy questions using OpenLedger's policy and evidence as grounding data.

**Implementation**:

- **File**: `lib/gradient.ts` - `answerPrivacyQuestion()` function
- **API Route**: `app/api/ai/answer/route.ts` (updated)
- **System Prompt**: `infra/gradient/kb/prompts/answer.system.md`
- **Knowledge Base**: `infra/gradient/kb/privacy_policies.yaml`
- **Agent Type**: `hosted`
- **Capabilities**: `["question_answering", "rag_retrieval", "source_citation"]`

**Gradient Features Used**:

- **Hosted Agent Endpoint**: `/hosted-agents/{agent_id}/chat`
- **RAG from Collections**: Real-time retrieval from policy and evidence collections
- **Source Citation**: Grounded answers with source references
- **Context Awareness**: User-specific privacy question answering

**Input/Output**:

```typescript
Input: { question: string, user_id?: string }
Output: {
  answer: string,
  sources: string[],
  confidence: number
}
```

### 4. Receipt Agent (Scheduled Agent + Memory Versioning)

**Purpose**: Periodically aggregates consent logs and code diffs to update the evidence ledger and drift reports.

**Implementation**:

- **File**: `lib/gradient.ts` - `processReceiptsAndDrift()` function
- **API Route**: `app/api/ai/receipt/route.ts`
- **System Prompt**: `infra/gradient/kb/prompts/receipt.system.md`
- **Agent Type**: `scheduled`
- **Capabilities**: `["consent_aggregation", "drift_detection", "ledger_versioning"]`

**Gradient Features Used**:

- **Scheduled Jobs**: Cron-based execution (every 6 hours)
- **Memory Versioning**: Historical evidence ledger tracking
- **Drift Detection**: Code change monitoring and compliance impact analysis
- **Consent Aggregation**: User consent decision processing

**Input/Output**:

```typescript
Input: { time_range?: { start: string, end: string } }
Output: {
  receipts: Receipt[],
  drift_events: DriftEvent[],
  evidence_updates: Evidence[],
  ledger_hash: string,
  timestamp: string
}
```

## Environment Configuration

### Required Environment Variables

```bash
# Core Gradient Configuration
GRADIENT_API_URL=https://api.gradient.ai
GRADIENT_API_KEY=your_api_key

# New Agent Configuration
GRADIENT_AGENT_PARSING=parsing_agent_id
GRADIENT_AGENT_AUDIT=audit_agent_id
GRADIENT_AGENT_ANSWER=answer_agent_id
GRADIENT_AGENT_RECEIPT=receipt_agent_id

# Knowledge Base Configuration
GRADIENT_KB_COMPLIANCE=compliance_kb_id
GRADIENT_KB_POLICIES=policies_kb_id

# RAG Collections Configuration
GRADIENT_COLLECTION_POLICIES=policies_collection_id
GRADIENT_COLLECTION_EVIDENCE=evidence_collection_id
```

## API Endpoints

### New Endpoints

1. **POST /api/ai/parse**

   - Triggers codebase parsing job
   - Input: `{ repo_url: string, commit_hash?: string }`

2. **POST /api/ai/receipt**

   - Processes receipts and drift detection
   - Input: `{ time_range?: { start: string, end: string } }`

3. **GET /api/ai/receipt**
   - Manual trigger for receipt processing
   - Query params: `?start=timestamp&end=timestamp`

### Updated Endpoints

1. **POST /api/ai/audit**

   - Enhanced with policy generation
   - Input: `{ evidence, compliance_frameworks?, generate_policy? }`

2. **POST /api/ai/answer**
   - Enhanced with RAG capabilities
   - Input: `{ question, user_id?, use_rag? }`

## Knowledge Base Structure

### Compliance Frameworks (`compliance_frameworks.yaml`)

- GDPR, CCPA, GLBA framework definitions
- Policy templates and scoring criteria
- Risk assessment factors
- Compliance scoring weights

### Privacy Policies (`privacy_policies.yaml`)

- Data collection and usage policies
- User rights and controls
- Security measures and procedures
- FAQ and common questions

## Backward Compatibility

The implementation maintains full backward compatibility with existing agents:

- **Classifier Agent**: Legacy data usage classification
- **Copywriter Agent**: Legacy disclosure generation
- **Legacy API Routes**: Continue to work with existing integrations

## Development Mode

All agents include comprehensive mock responses for development:

- **Mock Parsing**: Sample evidence extraction results
- **Mock Audit**: Sample compliance scores and policies
- **Mock Answer**: Sample privacy question responses
- **Mock Receipt**: Sample consent and drift data

## Security Considerations

1. **Sandboxed Execution**: Parsing agent runs in isolated environments
2. **No Data Persistence**: Sensitive data not stored during analysis
3. **Access Control**: Repository access requires proper authorization
4. **Audit Trail**: All agent activities logged for compliance
5. **Encryption**: All data encrypted in transit and at rest

## Next Steps

1. **Agent Creation**: Use `infra/gradient/agents/create_agents.ts` to create actual Gradient agents
2. **Knowledge Base Setup**: Upload compliance frameworks and policies to Gradient
3. **Collection Configuration**: Set up RAG collections for policies and evidence
4. **Testing**: Validate all agents with real repositories and compliance scenarios
5. **Monitoring**: Implement logging and monitoring for production deployment

## Usage Examples

### Parse a Repository

```typescript
const result = await parseCodebase(
  "https://github.com/company/fintech-app",
  "abc123"
);
console.log(result.evidence); // Structured evidence array
```

### Audit with Policy Generation

```typescript
const result = await auditComplianceWithPolicy(evidence, ["GDPR", "CCPA"]);
console.log(result.policy_generated); // Auto-generated privacy policy
```

### Answer Privacy Questions

```typescript
const result = await answerPrivacyQuestion(
  "How do you use my transaction data?",
  "user123"
);
console.log(result.answer); // Grounded answer with sources
```

### Process Receipts and Drift

```typescript
const result = await processReceiptsAndDrift({
  start: "2024-01-01",
  end: "2024-01-31",
});
console.log(result.drift_events); // Detected compliance drift
```
