# OpenLedger AI Integration Guide

## Overview

OpenLedger uses DigitalOcean Gradient AI Agentic Cloud to power a multi-agent system that automatically classifies data usage, generates disclosures, audits compliance, and answers user questions.

## AI Agent Architecture

### Agent Network

```
Code Evidence → Classifier → Copywriter → Audit → UI Copy
                     ↓
User Questions → Answer Agent → Response
```

### Agent Responsibilities

#### 1. Classifier Agent

- **Input**: Code evidence (endpoints, fields, usage patterns)
- **Output**: Purpose classification, data category, confidence score
- **Knowledge Base**: Rules and examples for data usage patterns
- **Tools**: Evidence analysis, pattern matching

#### 2. Copywriter Agent

- **Input**: Classified data usage, retention policies, user controls
- **Output**: Plain-language disclosures, headlines, explanations
- **Knowledge Base**: Writing guidelines, tone examples, compliance templates
- **Tools**: Text generation, tone analysis, compliance checking

#### 3. Audit Agent

- **Input**: Evidence, classification, generated copy
- **Output**: Compliance status, issues, recommendations
- **Knowledge Base**: Privacy regulations, compliance frameworks
- **Tools**: Compliance checking, drift detection, risk assessment

#### 4. Answer Agent

- **Input**: User questions, context, evidence
- **Output**: Accurate answers with sources and confidence
- **Knowledge Base**: Privacy policies, evidence, compliance docs
- **Tools**: Question answering, source citation, context retrieval

## Gradient AI Configuration

### Environment Variables

```bash
GRADIENT_API_URL=https://api.gradient.ai
GRADIENT_API_KEY=your_api_key
GRADIENT_AGENT_CLASSIFIER=agent_id_1
GRADIENT_AGENT_COPYWRITER=agent_id_2
GRADIENT_AGENT_AUDIT=agent_id_3
GRADIENT_AGENT_ANSWER=agent_id_4
GRADIENT_KB_ID=knowledge_base_id
```

### Knowledge Base Setup

The knowledge base contains:

- **Rules**: Data usage patterns and compliance requirements
- **Examples**: Golden test cases and exemplars
- **Prompts**: System prompts for each agent
- **Schema**: Validation schemas for outputs

### Agent Creation

```typescript
// Create agents programmatically
import { createAgents } from "./infra/gradient/agents/create_agents";

await createAgents();
```

## API Integration

### Agent Calls

```typescript
import { callAgent } from "@/lib/gradient";

// Classify data usage
const classification = await callAgent("classifier", {
  endpoint: "GET /api/transactions",
  fields: ["amount", "merchant", "category"],
});

// Generate disclosure copy
const copy = await callAgent("copywriter", {
  purpose: "budgeting",
  fields: ["amount", "merchant", "category"],
  retention: "12m",
});

// Audit compliance
const audit = await callAgent("audit", {
  evidence: codeEvidence,
  classification: classification,
  copy: copy,
});

// Answer user question
const answer = await callAgent("answer", {
  question: "Why do you need my transaction categories?",
  context: { evidence, policies },
});
```

### Error Handling

```typescript
try {
  const result = await callAgent(agentId, payload);
  return result;
} catch (error) {
  console.error("Gradient API call failed:", error);
  // Fallback to mock response
  return getMockResponse(agentId, payload);
}
```

## Knowledge Base Management

### Rules Configuration

```yaml
# infra/gradient/kb/rules.yaml
rules:
  - match:
      endpoint: "GET /api/transactions"
      fields: ["amount", "merchant", "category"]
    purpose: "budgeting"
    gate: "txn_category"
    retention: "12m"
    data_category: "financial_transaction"
```

### System Prompts

Each agent has a specialized system prompt:

- **Classifier**: `infra/gradient/kb/prompts/classifier.system.md`
- **Copywriter**: `infra/gradient/kb/prompts/copywriter.system.md`
- **Audit**: `infra/gradient/kb/prompts/audit.system.md`
- **Answer**: `infra/gradient/kb/prompts/answer.system.md`

### Exemplars

Golden examples for training and evaluation:

```json
{
  "example_id": "example-01",
  "evidence": { "endpoint": "GET /api/transactions", "fields": [...] },
  "classification": { "purpose": "budgeting", "confidence": 0.95 },
  "disclosure": { "headline": "...", "body": "..." },
  "audit": { "status": "pass", "issues": [] }
}
```

## Evaluation and Testing

### Golden Test Cases

```typescript
// Run evaluations
import { runEvaluation } from "./infra/gradient/eval/run_eval";

const results = await runEvaluation();
console.log(`Success rate: ${(results.passed / results.total) * 100}%`);
```

### Test Case Format

```json
{
  "test_case_id": "case-01",
  "input": { "endpoint": "GET /api/transactions", "fields": [...] },
  "expected_output": { "purpose": "budgeting", "confidence": 0.9 },
  "tolerance": { "confidence_min": 0.8, "purpose_exact": true }
}
```

## Performance Optimization

### Caching

- Cache agent responses for identical inputs
- Store classifications in Supabase for reuse
- Implement TTL-based cache invalidation

### Batch Processing

- Process multiple evidence items in batches
- Use parallel agent calls where possible
- Implement queue-based processing for large datasets

### Error Recovery

- Implement retry logic with exponential backoff
- Fallback to mock responses when agents fail
- Graceful degradation for non-critical features

## Monitoring and Observability

### Metrics

- Agent response times
- Classification accuracy
- User satisfaction scores
- Compliance audit results

### Logging

```typescript
console.log("Agent call:", {
  agent: agentId,
  input: payload,
  output: result,
  duration: Date.now() - startTime,
  confidence: result.confidence,
});
```

### Alerts

- Agent failure rates above threshold
- Classification confidence below minimum
- Compliance audit failures
- Response time degradation

## Security Considerations

### API Key Management

- Store API keys in environment variables
- Use different keys for different environments
- Rotate keys regularly
- Monitor key usage

### Input Validation

- Validate all inputs to agents
- Sanitize user questions
- Check for prompt injection attempts
- Implement rate limiting

### Output Validation

- Validate agent responses against schemas
- Check for hallucination or off-topic responses
- Implement confidence thresholds
- Log suspicious outputs

## Troubleshooting

### Common Issues

#### Agent Not Responding

1. Check API key validity
2. Verify agent ID is correct
3. Check network connectivity
4. Review rate limits

#### Low Classification Confidence

1. Review knowledge base content
2. Add more exemplars
3. Improve system prompts
4. Check input data quality

#### Compliance Audit Failures

1. Update compliance frameworks
2. Review evidence quality
3. Check rule definitions
4. Validate audit criteria

### Debug Mode

```bash
OPENLEDGER_DEBUG=true npm run dev
```

This enables:

- Detailed agent call logging
- Mock response fallbacks
- Performance metrics
- Error stack traces

## Future Enhancements

### Advanced Features

- Multi-language support
- Custom compliance frameworks
- Real-time agent updates
- A/B testing for prompts

### Integration Options

- Custom model fine-tuning
- External knowledge bases
- Third-party compliance APIs
- Enterprise SSO integration

### Scalability

- Agent load balancing
- Distributed processing
- Caching layers
- CDN integration
