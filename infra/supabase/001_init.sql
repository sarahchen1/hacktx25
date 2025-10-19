-- OpenLedger Database Schema Migration
-- This migration creates the complete database schema for OpenLedger
-- including evidence scans, policies, consent gates, receipts, drift detection, and audit logs

-- Enable required extensions
create extension if not exists pgcrypto;

-- Create app schema
create schema if not exists app;

-- Projects: one per fintech repo or demo instance
create table if not exists app.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  repo_url text,
  created_at timestamptz not null default now()
);

-- Evidence scans (code analysis output)
create table if not exists app.scans (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references app.projects(id) on delete cascade,
  commit_sha text not null,
  evidence jsonb not null,
  created_at timestamptz not null default now()
);

-- Generated policies and UI copy
create table if not exists app.policies (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references app.projects(id) on delete cascade,
  gate text not null,
  ui_copy jsonb not null,
  version text,
  created_at timestamptz not null default now()
);

-- Consent gates (per user per project)
create table if not exists app.gates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references app.projects(id) on delete cascade,
  name text not null,
  value boolean not null default true,
  updated_at timestamptz not null default now(),
  unique(user_id, project_id, name)
);

-- Signed consent receipts
create table if not exists app.receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references app.projects(id) on delete cascade,
  gate text not null,
  choice text not null check (choice in ('on','off')),
  commit_sha text,
  evidence_hash text,
  agent_versions jsonb,
  created_at timestamptz not null default now()
);

-- Runtime traces (for drift detection)
create table if not exists app.traces (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references app.projects(id) on delete cascade,
  endpoint text not null,
  fields jsonb not null,
  session_id uuid,
  ts timestamptz not null default now()
);

-- Drift events
create table if not exists app.drift_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references app.projects(id) on delete cascade,
  severity text not null check (severity in ('low','med','high')),
  endpoint text,
  field text,
  file text,
  line int,
  reviewed boolean not null default false,
  created_at timestamptz not null default now()
);

-- Audit logs for AI decisions
create table if not exists app.audit_logs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references app.projects(id) on delete cascade,
  agent text not null,
  input jsonb not null,
  output jsonb,
  status text,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security (RLS)
alter table app.projects enable row level security;
alter table app.scans enable row level security;
alter table app.policies enable row level security;
alter table app.gates enable row level security;
alter table app.receipts enable row level security;
alter table app.traces enable row level security;
alter table app.drift_events enable row level security;
alter table app.audit_logs enable row level security;

-- Ownership helper function
create or replace function app.is_owner(pid uuid)
returns boolean language sql stable as $$
  select exists(select 1 from app.projects p where p.id = pid and p.owner_id = auth.uid());
$$;

-- RLS Policies

-- Projects: owners can read/write their own projects
create policy "projects_owner_rw"
  on app.projects using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Scans: project owners can read/write scans
create policy "scans_owner_rw"
  on app.scans using (app.is_owner(project_id)) with check (app.is_owner(project_id));

-- Policies: project owners can read/write policies
create policy "policies_owner_rw"
  on app.policies using (app.is_owner(project_id)) with check (app.is_owner(project_id));

-- Gates: users can read/write their own gates
create policy "gates_user_rw"
  on app.gates using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Receipts: users can read/write their own receipts, project owners can read all receipts
create policy "receipts_user_rw"
  on app.receipts using (user_id = auth.uid() or app.is_owner(project_id))
  with check (user_id = auth.uid());

-- Traces: project owners can read/write traces
create policy "traces_owner_rw"
  on app.traces using (app.is_owner(project_id)) with check (app.is_owner(project_id));

-- Drift events: project owners can read/write drift events
create policy "drift_owner_rw"
  on app.drift_events using (app.is_owner(project_id)) with check (app.is_owner(project_id));

-- Audit logs: project owners can read/write audit logs
create policy "audit_owner_rw"
  on app.audit_logs using (app.is_owner(project_id)) with check (app.is_owner(project_id));

-- Create indexes for better performance
create index if not exists idx_projects_owner_id on app.projects(owner_id);
create index if not exists idx_scans_project_id on app.scans(project_id);
create index if not exists idx_policies_project_id on app.policies(project_id);
create index if not exists idx_gates_user_project on app.gates(user_id, project_id);
create index if not exists idx_receipts_user_id on app.receipts(user_id);
create index if not exists idx_traces_project_id on app.traces(project_id);
create index if not exists idx_drift_events_project_id on app.drift_events(project_id);
create index if not exists idx_audit_logs_project_id on app.audit_logs(project_id);

-- Create a default demo project for testing
insert into app.projects (id, owner_id, name, repo_url) 
values (
  '00000000-0000-0000-0000-000000000001'::uuid,
  auth.uid(),
  'OpenLedger Demo',
  'https://github.com/openledger/demo'
) on conflict (id) do nothing;
