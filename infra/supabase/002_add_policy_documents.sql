-- Add policy_documents table for storing current and new policies
-- This migration adds support for policy management and approval workflow

-- Policy documents table
create table if not exists app.policy_documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references app.projects(id) on delete cascade,
  type text not null check (type in ('current', 'new')),
  title text not null,
  content text not null,
  file_path text,
  compliance_score int,
  changes_summary text,
  requires_approval boolean default false,
  status text not null check (status in ('active', 'pending', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table app.policy_documents enable row level security;

-- RLS Policy: project owners can read/write policy documents
create policy "policy_documents_owner_rw"
  on app.policy_documents using (app.is_owner(project_id)) with check (app.is_owner(project_id));

-- Create indexes for better performance
create index if not exists idx_policy_documents_project_id on app.policy_documents(project_id);
create index if not exists idx_policy_documents_type_status on app.policy_documents(type, status);
create index if not exists idx_policy_documents_created_at on app.policy_documents(created_at);

-- Add trigger to automatically update updated_at timestamp
create or replace function app.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_policy_documents_updated_at
  before update on app.policy_documents
  for each row execute function app.update_updated_at_column();
