# OpenLedger

<div align="center">
  <h1>🚀 OpenLedger</h1>
  <p><strong>Making Fintech Apps Automatically Truthful About Data Usage</strong></p>
  <p>AI-powered transparency platform that eliminates privacy theater in financial applications</p>
  
  <p align="center">
    <a href="#the-problem"><strong>The Problem</strong></a> ·
    <a href="#the-solution"><strong>Our Solution</strong></a> ·
    <a href="#how-it-works"><strong>How It Works</strong></a> ·
    <a href="#demo"><strong>Live Demo</strong></a> ·
    <a href="#tech-stack"><strong>Tech Stack</strong></a> ·
    <a href="#getting-started"><strong>Getting Started</strong></a>
  </p>
</div>

<br/>

## 🎯 The Problem

**Fintech apps have a transparency crisis.** Traditional privacy policies are:

- ❌ **Manually written** and often don't match what the code actually does
- ❌ **Static documents** that become outdated as features change
- ❌ **Legal jargon** that users can't understand or control
- ❌ **No real enforcement** - users can't actually control their data usage
- ❌ **Audit nightmares** - regulators can't verify if practices match policies

**Result:** Privacy theater where apps claim to be transparent but users have no real control or understanding of how their financial data is actually used.

## ✨ The Solution

**OpenLedger makes fintech apps automatically truthful about data usage** through:

- 🔍 **Code Evidence Scanning** - Automatically extracts what data your app actually uses
- 🤖 **AI-Powered Classification** - DigitalOcean Gradient™ agents classify data usage and generate plain-language disclosures
- ⚡ **Real-Time Consent Gates** - Users can instantly toggle data usage on/off with immediate effect
- 📋 **Signed Receipts** - Every consent decision is cryptographically signed and auditable
- 🚨 **Drift Detection** - Automatically detects when code changes without policy updates

**Result:** True transparency where users understand exactly how their data is used and can control it in real-time.

## 🔧 How It Works

### 1. **Code Evidence Scanning**

```
Codebase → Static Analysis → Evidence JSON
```

- Scans your fintech app's codebase
- Extracts API calls, data fields, and usage patterns
- Generates machine-readable evidence of actual data usage

### 2. **AI-Powered Classification & Disclosure**

```
Evidence → DigitalOcean Gradient™ AI Agents → Plain-Language Disclosures
```

- **Classifier Agent**: Analyzes evidence and categorizes data usage
- **Copywriter Agent**: Generates user-friendly privacy explanations
- **Audit Agent**: Validates that disclosures match actual code
- **Answer Agent**: Responds to user questions about data usage

### 3. **Real-Time Consent Management**

```
User Toggle → Instant Feature Change → Signed Receipt
```

- Users see exactly what data is used and why
- Toggle data usage on/off with immediate visual feedback
- Every decision generates a cryptographically signed receipt
- Complete audit trail for compliance

### 4. **Drift Detection & Compliance**

```
Code Changes → Automatic Detection → Compliance Alerts
```

- Monitors for mismatches between code and policies
- Alerts when new data usage isn't disclosed
- Maintains continuous compliance without manual oversight

## 🎭 User-Facing Experience

**For End Users:**

- 📱 **Clear Disclosures**: "We use your transaction categories for budgeting insights"
- 🔍 **Evidence Links**: Click "Why?" to see actual code that uses your data
- ⚡ **Instant Control**: Toggle data usage and see features change immediately
- 📄 **Receipts**: Download signed proof of your consent decisions
- ❓ **AI Answers**: Ask questions like "Why do you need my merchant categories?"

## 🏢 Fintech-Facing Experience

**For Fintech Teams:**

- 🔧 **Easy Integration**: Add OpenLedger scanner to your CI/CD pipeline
- 📊 **Compliance Dashboard**: Monitor drift events and compliance scores
- 🤖 **AI-Generated Policies**: Automatically generate disclosures from code evidence
- 📈 **Audit Reports**: Export signed receipts and evidence for regulators
- 🚀 **No Legal Team Required**: AI handles policy generation and compliance monitoring

## 🧠 AI Integration

**DigitalOcean Gradient™ Agentic Cloud Powers:**

- **Multi-Agent Workflow**: Classifier → Copywriter → Audit → Answer
- **Knowledge Base**: Stores GDPR/CCPA context and fintech best practices
- **Function Calling**: Agents can call internal tools and APIs
- **Evaluation Pipelines**: Continuous testing ensures stable classifications
- **Versioning**: Every receipt stores AI agent versions for auditability

## 🚀 Live Demo

Experience OpenLedger in action:

- **Landing Page**: [http://localhost:3001](http://localhost:3001) - Overview and value proposition
- **Client Demo**: [http://localhost:3001/client-demo](http://localhost:3001/client-demo) - Live consent gates and evidence
- **Dashboard**: [http://localhost:3001/dashboard](http://localhost:3001/dashboard) - Compliance monitoring
- **Manage Policy**: [http://localhost:3001/manage-policy](http://localhost:3001/manage-policy) - Review and approve new policies
- **Current Policy**: [http://localhost:3001/current-policy](http://localhost:3001/current-policy) - View active privacy policy

**Demo Features:**

- Toggle transaction category usage and watch the budget view change
- Click "Why?" to see actual code evidence
- Download signed consent receipts
- Inject drift events to see compliance alerts

<br/>

## 🛠️ Tech Stack

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

- **DigitalOcean Gradient™ Agentic Cloud** for multi-agent AI workflows
- **Knowledge Base** with GDPR/CCPA context and fintech best practices
- **Function Calling** for agent-to-system integration
- **Evaluation Pipelines** for continuous AI performance monitoring

**Security & Compliance:**

- **Cryptographic Receipts** with commit and evidence hashing
- **Signed Consent** with tamper-proof audit trails
- **Drift Detection** for continuous compliance monitoring
- **Evidence-Based** transparency with code-to-policy traceability

## 🎮 Demo

**Try OpenLedger Live:**

- **Landing Page**: [http://localhost:3001](http://localhost:3001) - See the value proposition
- **Client Demo**: [http://localhost:3001/client-demo](http://localhost:3001/client-demo) - Toggle consent gates and see instant changes
- **Dashboard**: [http://localhost:3001/dashboard](http://localhost:3001/dashboard) - Monitor compliance and drift events
- **Manage Policy**: [http://localhost:3001/manage-policy](http://localhost:3001/manage-policy) - Review and approve new policies
- **Current Policy**: [http://localhost:3001/current-policy](http://localhost:3001/current-policy) - View active privacy policy

**Key Demo Interactions:**

1. **Toggle Data Usage**: Turn off "Transaction Categories" and watch the budget chart disappear
2. **View Evidence**: Click "Why?" to see actual code that uses your data
3. **Download Receipts**: Get cryptographically signed proof of your consent decisions
4. **Inject Drift**: Create compliance alerts by adding new data usage without disclosure

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account ([create one here](https://supabase.com/dashboard))
- Google Gemini API key ([get one free](https://aistudio.google.com/app/apikey))
- DigitalOcean Gradient™ API access (legacy, no longer required)

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

6. **Open your browser**
   - Landing page: [http://localhost:3001](http://localhost:3001)
   - Client demo: [http://localhost:3001/client-demo](http://localhost:3001/client-demo)
   - Dashboard: [http://localhost:3001/dashboard](http://localhost:3001/dashboard)
   - Manage Policy: [http://localhost:3001/manage-policy](http://localhost:3001/manage-policy)
   - Current Policy: [http://localhost:3001/current-policy](http://localhost:3001/current-policy)
   - Agent Dashboard: [http://localhost:3001/openledger](http://localhost:3001/openledger)

### 🤖 Running AI Agents

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
cat .out/audit.json       # Compliance audit results
cat .out/qa.json          # Privacy Q&A
cat .out/receipt.json     # Drift detection
```

**Agent Dashboard UI**: Visit `/openledger` to:

- View compliance scores and findings
- Run repository scans via the UI
- Download evidence and audit results
- Monitor drift detection

**Output Location**: All agent outputs are written to `.out/` directory (gitignored)

**Agent Architecture**: See `infra/ARCHITECTURE.md` for complete documentation

### Deploy to Production

**Option 1: Vercel (Recommended)**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-org%2Fopenledger)

**Option 2: DigitalOcean App Platform**

- Connect your GitHub repository
- Set environment variables in the dashboard
- Deploy with automatic builds

**Option 3: Self-hosted**

- Build: `npm run build`
- Start: `npm run start`
- Configure reverse proxy (nginx/Apache)

## 🏗️ Architecture

### Database Schema

OpenLedger uses a comprehensive PostgreSQL schema with Row Level Security:

- **`app.projects`** - Fintech applications and demo instances
- **`app.scans`** - Code evidence from static analysis
- **`app.policies`** - AI-generated UI copy and disclosures
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
- **`/api/ui-copy`** - Get AI-generated privacy disclosures
- **`/api/ai/*`** - DigitalOcean Gradient™ AI agent endpoints

### AI Agent Workflow

```
Code Evidence → Classifier Agent → Copywriter Agent → Audit Agent → Answer Agent
     ↓              ↓                    ↓               ↓            ↓
  Static Scan   Purpose & Category   Plain Language   Validation   User Q&A
```

## 🎯 Hackathon Value Proposition

**Why OpenLedger Wins:**

- ✅ **Solves Real Problem**: Addresses actual fintech transparency crisis
- ✅ **Technical Depth**: Multi-agent AI, cryptographic receipts, real-time enforcement
- ✅ **Visual Impact**: Instant UI changes, beautiful animations, clear evidence
- ✅ **Social Relevance**: Privacy, transparency, regulatory compliance
- ✅ **Demo-Ready**: Interactive features that judges can experience immediately
- ✅ **Production-Ready**: Complete database schema, security, and deployment

**Key Differentiators:**

- **Not just AI text generation** - Real code analysis and enforcement
- **Not just privacy policies** - Actual user control with immediate effects
- **Not just compliance** - Beautiful, understandable user experience
- **Not just transparency** - Cryptographically provable audit trails

## 📚 Additional Resources

- **Database Schema**: See `infra/supabase/001_init.sql` for complete schema
- **AI Integration**: Check `infra/gradient/` for agent configurations
- **Mock Data**: Explore `public/mock/` for offline development
- **Documentation**: Review `docs/` for detailed implementation guides

## 🤝 Contributing

OpenLedger is built for the HackTX hackathon. We welcome contributions that enhance:

- AI agent accuracy and capabilities
- User experience and accessibility
- Security and compliance features
- Integration with additional fintech platforms

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ for HackTX 2024** | **Powered by DigitalOcean Gradient™** | **Secured by Supabase**
