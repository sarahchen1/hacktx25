# 🏗️ OpenLedger Infrastructure Architecture

**Status**: ✅ Locked and Production-Ready  
**Last Updated**: October 19, 2024  
**AI Provider**: Google Gemini (gemini-2.0-flash-exp)

---

## 📁 Directory Structure

```
infra/
├── agents/          # Gemini-powered agent implementations
│   ├── parsingAgent.ts      # Repository scanner
│   ├── auditAgent.ts        # Compliance auditor
│   ├── answerAgent.ts       # Privacy Q&A bot
│   ├── receiptAgent.ts      # Drift detector
│   ├── runAll.ts            # Orchestration pipeline
│   ├── schemas.ts           # JSON output schemas
│   ├── testSetup.ts         # Setup validator
│   ├── verify.ts            # Pipeline verification
│   └── README.md            # Complete documentation
│
├── ai/              # AI client wrapper
│   └── gemini.ts            # Google Gemini API client
│
├── kb/              # Knowledge Base system
│   ├── files/               # Normalized KB location
│   │   ├── rules.yaml                    # PII taxonomies & detectors
│   │   ├── compliance_frameworks.yaml    # GDPR/CCPA/GLBA controls
│   │   ├── privacy_policies.yaml         # Policy templates
│   │   ├── schema.json                   # Validation schemas
│   │   ├── _manifest.yaml                # Version control
│   │   ├── prompts/                      # Agent instructions
│   │   │   ├── parsing.system.md
│   │   │   ├── audit.system.md
│   │   │   ├── answer.system.md
│   │   │   └── receipt.system.md
│   │   └── exemplars/                    # Test fixtures
│   │       ├── example-01.json
│   │       └── expected-01.json
│   │
│   ├── loadKb.ts            # KB file loader with naive RAG
│   └── scripts/             # Validation utilities
│       ├── validate-kb.ts   # Schema validation
│       ├── test-fixtures.ts # Fixture testing
│       └── update-manifest.ts # Hash management
│
└── supabase/        # Database schema
    └── 001_init.sql         # Core tables
```

---

## 🎯 Agent Pipeline

### Flow

```
User Request
    ↓
1. Parsing Agent → Scans repository for evidence
    ↓
2. Audit Agent → Evaluates compliance (GDPR/CCPA/GLBA)
    ↓
3. Answer Agent → Answers privacy questions (RAG)
    ↓
4. Receipt Agent → Detects drift from previous scans
    ↓
.out/ directory → JSON results
```

### Agents

#### 1. **Parsing Agent** (`parsingAgent.ts`)

- **Purpose**: Extract data collection evidence from codebases
- **Input**: Repository URL
- **Output**: Evidence artifacts (PII, data flows, API endpoints)
- **Detects**: localStorage, cookies, API calls, database queries
- **Safety**: Git clone failures return empty evidence set

#### 2. **Audit Agent** (`auditAgent.ts`)

- **Purpose**: Evaluate compliance and generate policies
- **Input**: Evidence from parsing agent
- **Output**: Compliance score, policy markdown, recommended fixes
- **Frameworks**: GDPR, CCPA, GLBA
- **Scoring**: 0-100 weighted by control severity

#### 3. **Answer Agent** (`answerAgent.ts`)

- **Purpose**: Answer user privacy questions
- **Input**: Question, policy markdown, evidence
- **Output**: Answer with citations
- **Method**: RAG with KB templates + policy + evidence
- **Model**: gemini-2.0-flash-exp (fast)

#### 4. **Receipt Agent** (`receiptAgent.ts`)

- **Purpose**: Detect compliance drift
- **Input**: Previous vs current evidence
- **Output**: Diff summary, drift flags, update decision
- **Flags**: new_pii_collection, consent_changes, policy_modified

---

## 🔧 Core Components

### AI Client (`infra/ai/gemini.ts`)

```typescript
// Functions:
getModel(name: "pro" | "flash")      // Get configured Gemini model
generateJSON({ system, user, schemaHint }) // Generate structured JSON

// Features:
✅ Auto-loads .env.local with dotenv
✅ JSON mode for structured outputs
✅ Error handling with fallback JSON
✅ Uses gemini-2.0-flash-exp model
```

### KB Loader (`infra/kb/loadKb.ts`)

```typescript
// Functions:
readText(rel: string)                // Read text files
readYaml(rel: string)                // Parse YAML files
selectKbSections({ file, keywords, maxChars }) // Naive RAG

// Features:
✅ Simple keyword-based retrieval
✅ Scores lines by keyword matches
✅ Returns top-N relevant sections
✅ Truncates to maxChars (12k default)
```

### Schemas (`infra/agents/schemas.ts`)

```typescript
EvidenceSchema; // Parsed codebase evidence
AuditSchema; // Compliance scores + policy
QASchema; // Q&A responses with citations
ReceiptSchema; // Drift detection results
```

---

## 📚 Knowledge Base

### Structure

All KB files use **stable IDs** for referencing:

#### **rules.yaml**

```yaml
taxonomies:
  pii: [PII.EMAIL, PII.SSN, PII.PHONE, ...]

detectors:
  - id: DETECTOR.LOCALSTORAGE
    pattern: "localStorage\\.(setItem|getItem)..."
    pii_tags: [PII.EMAIL, PII.PHONE]

mapping:
  - id: RULE.ACCOUNT.PROFILE
    match: { endpoint: "GET /api/account" }
    purpose: "account_management"
    detectors: [DETECTOR.API_ENDPOINT]
```

#### **compliance_frameworks.yaml**

```yaml
frameworks:
  - id: GDPR
    controls:
      - id: GDPR.A6 # Lawful Basis
      - id: GDPR.A7 # Consent
      - id: GDPR.A32 # Security
    scoring:
      method: weighted_sum
      thresholds: { excellent: 90, good: 75, poor: 45 }
```

#### **privacy_policies.yaml**

```yaml
templates:
  - id: POLICY.TEMPLATE.STANDARD
    sections:
      - id: POLICY.SECTION.DATA_COLLECTION
        placeholders: ["{data_types}", "{legal_basis}"]
        content: "We collect: {data_types}..."
```

---

## 🚀 Usage

### Quick Start

```bash
# Test setup
npm run agents:test

# Verify pipeline
npm run agents:verify

# Run all agents
npm run agents:all https://github.com/example/repo

# View results
cat .out/evidence.json
cat .out/audit.json
cat .out/qa.json
cat .out/receipt.json
```

### Available Scripts

```bash
npm run agents:test     # Test Gemini setup
npm run agents:verify   # Verify pipeline integrity
npm run agents:all      # Run full pipeline
npm run agents:parse    # Parsing agent only
npm run agents:audit    # Audit agent only

npm run kb:validate     # Validate KB structure
npm run kb:test         # Run test fixtures
npm run kb:hash         # Update manifest hashes
```

### Environment

```bash
# Required in .env.local:
GEMINI_API_KEY=your_key_here
```

---

## 🔒 Safety Features

### Error Handling

- ✅ Try/catch wrappers on all agents
- ✅ Fallback JSON on parsing errors
- ✅ Error state written to `.out/error.json`
- ✅ Git clone failures handled gracefully

### Input Validation

- ✅ Truncates inputs to ~180k chars
- ✅ Validates KB structure with AJV
- ✅ Checks for stable ID references
- ✅ Detects dangling references

### Output Guarantees

- ✅ Always writes to `.out/` directory
- ✅ Creates directory if missing
- ✅ Structured JSON schemas
- ✅ Logs progress at each step

---

## 📊 Verification

Run `npm run agents:verify` to check:

1. ✅ GEMINI_API_KEY is set
2. ✅ All KB files present
3. ✅ No legacy gradient references
4. ✅ All agent files exist
5. ✅ AI client configured
6. ✅ KB loader ready
7. ✅ Output directory exists

---

## 🎯 Key Concepts

### Stable IDs

Every KB concept has a unique, immutable ID:

- `PII.EMAIL`, `PII.SSN`, `PII.PHONE`
- `DETECTOR.LOCALSTORAGE`, `DETECTOR.FETCH_REQUEST`
- `RULE.ACCOUNT.PROFILE`, `RULE.TXN.PROCESSING`
- `GDPR.A6`, `CCPA.1798.100`, `GLBA.6801`
- `POLICY.SECTION.DATA_COLLECTION`

### Evidence → Findings → Score

```
Evidence (parsed code patterns)
    ↓
Findings (control violations)
    ↓
Score (0-100 compliance percentage)
    ↓
Policy (generated markdown)
```

### Drift Detection

```
Previous Scan → Current Scan
    ↓
Compare Evidence
    ↓
Flag Changes (new PII, policy updates)
    ↓
Update Ledger (if material)
```

---

## 🔄 Data Flow

### Input

```
Repository URL → Parsing Agent
```

### Processing

```
1. Clone repo (depth=1)
2. Scan files for patterns
3. Extract evidence artifacts
4. Evaluate against frameworks
5. Generate compliance score
6. Draft policy markdown
7. Answer sample question
8. Compare with previous scan
```

### Output

```
.out/
├── evidence.json   # Parsed artifacts
├── audit.json      # Compliance report
├── qa.json         # Q&A response
├── receipt.json    # Drift report
└── error.json      # Error state (if failed)
```

---

## 🧹 Cleanup

### What Was Removed

- ❌ `infra/gradient/` - Legacy Gradient AI implementation
- ❌ `infra/gradient/agents/` - Old agent stubs
- ❌ `infra/gradient/loaders/` - Advanced loaders
- ❌ `infra/gradient/factory.ts` - Provider abstraction
- ❌ `infra/gradient/eval/` - Evaluation framework

### What Was Kept

- ✅ KB files (moved to `infra/kb/files/`)
- ✅ Validation scripts (moved to `infra/kb/scripts/`)
- ✅ Test fixtures (in `infra/kb/files/exemplars/`)

---

## 🎉 Result

**Clean Gemini-only stack:**

- ✅ Single AI provider (Google Gemini)
- ✅ Normalized KB location (`infra/kb/files/`)
- ✅ No dead legacy code
- ✅ All scripts updated
- ✅ Full verification suite
- ✅ Production-ready pipeline

**Active paths only:**

```
infra/
  agents/      # Gemini agent implementations
  ai/          # Gemini API client
  kb/
    files/     # Normalized KB (rules, frameworks, policies)
    scripts/   # Validation utilities
    loadKb.ts  # Simple KB loader
  supabase/    # Database schema
```

---

**For detailed usage, see**: `infra/agents/README.md`  
**For setup guide, see**: `infra/agents/SETUP_COMPLETE.md`
