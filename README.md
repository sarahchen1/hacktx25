<div align="center">
  <h1>OpenLedger</h1>
  <p><strong>Making Fintech Apps Automatically Truthful About Data Usage</strong></p>
  <p>AI-powered transparency platform that eliminates privacy theater in financial applications</p>
  
  <p align="center">
    <a href="#the-problem"><strong>The Problem</strong></a> ·
    <a href="#the-solution"><strong>Our Solution</strong></a> ·
    <a href="#how-it-works"><strong>How It Works</strong></a> ·
    <a href="#demo"><strong>Demo</strong></a> ·
    <a href="#tech-stack"><strong>Tech Stack</strong></a> ·
    <a href="#getting-started"><strong>Getting Started</strong></a>
  </p>
</div>

<br/>

## The Problem

**Fintech apps have a transparency crisis.** Traditional privacy policies are:

- **Manually written** and often don't match what the code actually does
- **Static documents** that become outdated as features change
- **Legal jargon** that users can't understand or control
- **No real enforcement** - users can't actually control their data usage
- **Audit nightmares** - regulators can't verify if practices match policies

**Result:** Privacy theater where apps claim to be transparent but users have no real control or understanding of how their financial data is actually used.

## The Solution

**OpenLedger makes fintech apps automatically truthful about data usage** through:

- **Code Evidence Scanning** - Automatically extracts what data your app actually uses
- **AI Classification** - Google Gemini agents classify data usage and generate plain-language disclosures
- **Real-Time Consent Gates** - Users can instantly toggle data usage on/off with immediate effect
- **Drift Detection** - Automatically detects when code changes without policy updates

**Result:** True transparency where users understand exactly how their data is used and can control it in real-time.

## How It Works

### 1. **Code Evidence Scanning**

```
Codebase → Static Analysis → Evidence JSON
```

- Scans your fintech app's codebase
- Extracts API calls, data fields, and usage patterns
- Generates machine-readable evidence of actual data usage

### 2. **AI-Powered Classification & Disclosure**

```
Evidence → Google Gemini AI Agents → Plain-Language Disclosures + Policy Management
```

- **Parsing Agent**: Scans codebase and extracts evidence including current policy files
- **Audit Agent**: Analyzes evidence, scores current policy, generates new policy, detects drift
- **Answer Agent**: Responds to user questions about data usage

### 3. **Real-Time Consent Management**

```
User Toggle → Instant Feature Change → Signed Receipt
```

- Users see exactly what data is used and why
- Toggle data usage on/off with immediate visual feedback
- Every decision generates a cryptographically signed receipt
- Complete audit trail for compliance

### 4. **Policy Management & Approval**

```
Code Changes → Policy Analysis → New Policy Generation → Approval Workflow
```

- Automatically detects current policies in repositories
- Generates updated policies based on code evidence
- Provides approval workflow for policy changes
- Maintains compliance through policy versioning

### 5. **Drift Detection & Compliance**

```
Code Changes → Automatic Detection → Compliance Alerts
```

- Monitors for mismatches between code and policies
- Maintains continuous compliance


## Fintech-Facing Experience

**For Fintech Teams:**

- **Easy Integration**: Add OpenLedger scanner to your CI/CD pipeline
- **Compliance Dashboard**: Monitor drift events and compliance scores
- **AI-Generated Policies**: Automatically generate disclosures from code evidence
- **Audit Reports**: Export signed receipts and evidence for regulators
- **No Legal Team Required**: AI handles policy generation and compliance monitoring


<br/>

## Tech Stack

**Frontend:**

- **Next.js 15** with App Router for modern React development
- **Tailwind CSS** with custom deep space blue & light gold theme
- **shadcn/ui** components for consistent, accessible UI
- **OGL** for WebGL-powered galaxy background animations
- **Manrope** & **JetBrains Mono** typography

**Backend:**

- **Supabase** for PostgreSQL database, authentication, and real-time updates
- **Row Level Security (RLS)** for multi-tenant data isolation
- **RESTful API** routes with automatic fallback to mock data

**AI & Intelligence:**

- **Google Gemini 2.0 Flash** for multi-agent AI workflows
- **Knowledge Base** with GDPR/CCPA context and fintech best practices
- **Policy Management** with automatic detection and generation
- **Drift Detection** for continuous compliance monitoring

## Demo

**Try OpenLedger Live** at <a href="https://canitrustyou.vercel.app/" rel="noopener norefferer">https://canitrustyou.vercel.app/</a>.

**Watch the Demo:**

[![Watch the demo](https://img.youtube.com/vi/mXtLisXzxsA/0.jpg)](https://youtu.be/mXtLisXzxsA)

**Key Interactions:**

1. **Toggle Data Usage**: Turn off "Transaction Categories" and watch the budget chart disappear
2. **View Evidence**: Click "Why?" to see actual code that uses your data
3. **Download Receipts**: Get cryptographically signed proof of your consent decisions
4. **Inject Drift**: Create compliance alerts by adding new data usage without disclosure

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account ((https://supabase.com/dashboard))
- Google Gemini API key ((https://aistudio.google.com/app/apikey))

### Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/openledger.git
   cd openledger
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your Supabase credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Required: Google Gemini API
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the database migrations**

   ```bash
   # The database schema is automatically applied via Supabase MCP
   # Check infra/supabase/001_init.sql for the complete schema
   ```

5. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

### Running AI Agents

OpenLedger includes a Gemini-powered agent system for scanning repositories:

```bash
# Test the agent setup
npm run agents:test

# Verify the pipeline
npm run agents:verify

# Scan a repository
npm run agents:all https://github.com/your-org/your-repo

# View results
cat .out/evidence.json    # Parsed data collection evidence
cat .out/audit.json       # Compliance audit results with policy management
cat .out/qa.json          # Privacy Q&A
```

**Repository Scanning**: Use the dashboard to:

- Scan repositories for compliance analysis
- View generated policies and drift events
- Approve or reject new policy changes
- Monitor compliance scores and evidence


**Agent Architecture**: See `infra/ARCHITECTURE.md` for complete documentation


## Architecture

### Database Schema

OpenLedger uses a comprehensive PostgreSQL schema with Row Level Security:

- **`app.projects`** - Fintech applications and demo instances
- **`app.scans`** - Code evidence from static analysis
- **`app.policies`** - AI-generated UI copy and disclosures
- **`app.policy_documents`** - Current and new privacy policies with approval workflow
- **`app.gates`** - User consent toggles (per user per project)
- **`app.receipts`** - Cryptographically signed consent decisions
- **`app.traces`** - Runtime data usage for drift detection
- **`app.drift_events`** - Compliance violations and alerts
- **`app.audit_logs`** - AI agent decisions and reasoning

### API Endpoints

- **`/api/gates`** - Manage user consent gates
- **`/api/receipt`** - Create and retrieve consent receipts
- **`/api/drift`** - Monitor compliance drift events
- **`/api/evidence`** - Access code evidence and scans
- **`/api/policies`** - Manage current and new privacy policies
- **`/api/compliance`** - Get compliance scores and framework breakdown
- **`/api/agent-data`** - Access complete agent analysis results
- **`/api/run-scan`** - Trigger repository scanning

### AI Agent Workflow

```
Repository → Parsing Agent → Audit Agent → Answer Agent
     ↓            ↓              ↓            ↓
  Code Scan   Evidence +     Policy Mgmt +  User Q&A
              Policy Files   Drift Detection
```

**Enhanced Audit Agent Features:**
- **Current Policy Analysis**: Scans repository for existing privacy policies
- **New Policy Generation**: Creates updated policies based on code evidence
- **Drift Detection**: Identifies discrepancies between code and policies
- **Compliance Scoring**: Provides detailed scoring against GDPR/CCPA/GLBA
- **User Toggle Generation**: Creates implementation code for privacy controls


## Data
This sample fintech repo was created to use as a demo for OpenLedger: https://github.com/rtalla1/sample-fintech-platform
