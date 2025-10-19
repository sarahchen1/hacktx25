# Gemini-Based Agent System

This directory contains the Google Gemini-powered agent system that replaces the previous Gradient implementation while maintaining the same architecture and KB files.

## Setup

1. **Install dependencies** (already done):

   ```bash
   npm i @google/generative-ai yaml zod
   ```

2. **Set API key** in `.env.local`:

   ```
   GEMINI_API_KEY=your_key_here
   ```

   Get your key from: https://aistudio.google.com/app/apikey

3. **Test setup**:
   ```bash
   npm run agents:test
   ```

## Usage

### Run All Agents

```bash
npm run agents:all <repoUrl>
```

Example:

```bash
npm run agents:all https://github.com/example/fintech-app
```

### Individual Agents

```bash
# Parsing only
npm run agents:parse

# Audit only
npm run agents:audit
```

## Output

All results are written to `.out/` directory:

- `evidence.json` - Parsed codebase evidence
- `audit.json` - Compliance audit results
- `qa.json` - Sample Q&A response
- `receipt.json` - Drift detection results

## Architecture

### Core Components

1. **`infra/ai/gemini.ts`** - Gemini API client wrapper
2. **`infra/kb/loadKb.ts`** - Lightweight KB loader with naive retrieval
3. **`infra/agents/schemas.ts`** - Shared JSON schemas
4. **`infra/agents/*Agent.ts`** - Individual agent implementations
5. **`infra/agents/runAll.ts`** - Orchestration script

### Agent Flow

1. **Parsing Agent**: Clones repo, scans for PII/data patterns, extracts evidence
2. **Audit Agent**: Evaluates evidence against GDPR/CCPA/GLBA, generates policy
3. **Answer Agent**: Answers privacy questions using policy + evidence
4. **Receipt Agent**: Compares evidence changes, detects drift

### Safety Features

- ✅ Try/catch wrappers with fallback JSON
- ✅ Input truncation to stay under ~180k chars
- ✅ Secret scrubbing (no .env, tokens, keys in prompts)
- ✅ Git clone failure handling
- ✅ File read error handling

## KB Integration

The system uses the existing KB structure:

- `infra/gradient/kb/rules.yaml` - PII taxonomies, detectors, rules
- `infra/gradient/kb/compliance_frameworks.yaml` - GDPR/CCPA/GLBA controls
- `infra/gradient/kb/privacy_policies.yaml` - Policy templates
- `infra/gradient/kb/prompts/*.md` - Concise agent instructions

## Migration Notes

- **No UI changes required** - outputs go to `.out/` for OpenLedger to consume
- **Same KB files** - existing structure preserved
- **Same agent architecture** - just different LLM provider
- **Structured JSON outputs** - consistent with previous system
- **Local RAG layer** - lightweight keyword-based retrieval

## Model Information

The system uses **gemini-2.0-flash-exp** which is:

- ✅ Fast and efficient
- ✅ Supports JSON mode for structured outputs
- ✅ Compatible with most Gemini API keys
- ✅ Good balance of speed and quality

## Troubleshooting

### Common Issues

1. **"GEMINI_API_KEY missing"**

   - Set the API key in `.env.local`
   - Make sure it starts with `GEMINI_API_KEY=`
   - The `.env.local` file is automatically loaded by dotenv

2. **Git clone failures**

   - Check repo URL is accessible
   - Ensure git is installed
   - Agent will return empty evidence set

3. **JSON parsing errors**

   - Check Gemini API quota/limits
   - Verify API key is valid
   - Agent will return fallback JSON

4. **File not found errors**
   - Ensure KB files exist in `infra/gradient/kb/`
   - Run `npm run kb:validate` to check KB structure
