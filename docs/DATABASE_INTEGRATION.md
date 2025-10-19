# Database Integration Complete

## Overview
OpenLedger now properly integrates with Supabase to persist scan results and user data.

## What Was Implemented

### 1. Repository Scanning with Database Storage
**File**: `app/api/run-scan/route.ts`

When a user scans a repository:
1. ✅ User authentication is verified
2. ✅ Repository URL is validated (GitHub/GitLab only)
3. ✅ A **project record** is created/updated in `app.projects`:
   - `owner_id`: User's Supabase auth ID
   - `name`: Repository name extracted from URL
   - `repo_url`: Full repository URL
4. ✅ AI agents scan the repository
5. ✅ **Scan results** are saved to `app.scans`:
   - `project_id`: Links to the project
   - `commit_sha`: Git commit (currently "latest")
   - `evidence`: Full JSON evidence object from agents
6. ✅ **Audit results** are saved to `app.audit_logs`:
   - `project_id`: Links to the project
   - `agent`: "audit"
   - `input`: Repository URL
   - `output`: Full audit results (compliance scores, policy, etc.)
   - `status`: "completed"

### 2. Evidence API Integration
**File**: `app/api/evidence/route.ts`

- ✅ Fetches latest scan evidence from `app.scans` for the authenticated user
- ✅ Filters by project ownership
- ✅ Extracts evidence array from scan results
- ✅ Supports filtering by gate and file
- ✅ Falls back to mock data if no scans found

### 3. Drift Detection
**File**: `app/api/drift/route.ts`

- ✅ Already integrated with `app.drift_events` table
- ✅ Queries user's projects and associated drift events
- ✅ Supports status and severity filtering

### 4. Receipts
**Files**: `app/api/receipt/route.ts`

- ✅ Already integrated with `app.receipts` table
- ✅ Records user consent choices
- ✅ Links to projects and users

## Database Schema

### app.projects
```sql
CREATE TABLE app.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id),
  name text NOT NULL,
  repo_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

### app.scans
```sql
CREATE TABLE app.scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES app.projects(id),
  commit_sha text NOT NULL,
  evidence jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

### app.audit_logs
```sql
CREATE TABLE app.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES app.projects(id),
  agent text NOT NULL,
  input jsonb NOT NULL,
  output jsonb,
  status text,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

## Data Flow

### Scanning a Repository

```
User enters repo URL
      ↓
RepositoryScanner component
      ↓
POST /api/run-scan
      ↓
1. Authenticate user
2. Create/find project record
3. Run AI agents (parsing, audit, answer, receipt)
4. Save to app.scans (evidence)
5. Save to app.audit_logs (audit results)
      ↓
Return success with projectId
      ↓
Dashboard reloads and shows data from Supabase
```

### Viewing Evidence

```
EvidenceTable component
      ↓
GET /api/evidence
      ↓
1. Get user's projects
2. Get latest scan for each project
3. Extract evidence array
4. Filter if needed
      ↓
Return evidence array
      ↓
Display in table
```

## Testing the Integration

### 1. Scan a Repository
```bash
# In the dashboard, enter:
https://github.com/vercel/next.js

# Or use curl:
curl -X POST http://localhost:3000/api/run-scan \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/vercel/next.js"}'
```

### 2. Verify Database
```sql
-- Check projects
SELECT * FROM app.projects;

-- Check scans
SELECT id, project_id, commit_sha, created_at 
FROM app.scans 
ORDER BY created_at DESC;

-- Check audit logs
SELECT id, project_id, agent, status, created_at 
FROM app.audit_logs 
ORDER BY created_at DESC;
```

### 3. Check Dashboard
- Navigate to `/dashboard`
- Evidence Table should show scan results
- Compliance Score should reflect audit data
- All data persists across page reloads

## Benefits

1. **Persistence**: Scan results are saved and accessible across sessions
2. **Multi-user**: Each user sees only their own projects and scans
3. **History**: All scans are retained (can be queried by date)
4. **Auditable**: Complete audit trail in `app.audit_logs`
5. **Scalable**: Can handle multiple projects per user
6. **Secure**: RLS policies ensure data isolation

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

## Next Steps

1. Add project selection UI (if user has multiple projects)
2. Show scan history (list of past scans with timestamps)
3. Add "Re-scan" button for existing projects
4. Implement drift detection between scans
5. Add export functionality for compliance reports

