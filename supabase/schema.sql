create extension if not exists "pgcrypto";

create type change_request_status as enum ('draft', 'pending', 'approved', 'rejected', 'executed');

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users not null,
  name text not null,
  client_name text not null,
  client_email text not null,
  created_at timestamptz default now()
);

create table if not exists budget_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects on delete cascade not null,
  name text not null,
  approved_cost_cents bigint not null,
  created_at timestamptz default now()
);

create table if not exists change_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects on delete cascade not null,
  created_by uuid references auth.users not null,
  reason text not null,
  delta_cents bigint not null,
  delay_days int default 0,
  status change_request_status not null default 'draft',
  client_token text unique not null,
  created_at timestamptz default now()
);

create table if not exists approvals (
  id uuid primary key default gen_random_uuid(),
  change_request_id uuid references change_requests on delete cascade not null,
  action text not null check (action in ('approved', 'rejected')),
  acted_at timestamptz default now(),
  client_ip text,
  client_user_agent text
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects on delete cascade not null,
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  meta jsonb,
  created_at timestamptz default now()
);

alter table projects enable row level security;
alter table budget_items enable row level security;
alter table change_requests enable row level security;
alter table approvals enable row level security;
alter table audit_logs enable row level security;

create policy "projects_owner_select" on projects
  for select using (auth.uid() = owner_id);

create policy "projects_owner_insert" on projects
  for insert with check (auth.uid() = owner_id);

create policy "projects_owner_update" on projects
  for update using (auth.uid() = owner_id);

create policy "budget_items_owner_select" on budget_items
  for select using (
    exists (
      select 1 from projects where projects.id = budget_items.project_id and projects.owner_id = auth.uid()
    )
  );

create policy "budget_items_owner_insert" on budget_items
  for insert with check (
    exists (
      select 1 from projects where projects.id = budget_items.project_id and projects.owner_id = auth.uid()
    )
  );

create policy "budget_items_owner_delete" on budget_items
  for delete using (
    exists (
      select 1 from projects where projects.id = budget_items.project_id and projects.owner_id = auth.uid()
    )
  );

create policy "change_requests_owner_select" on change_requests
  for select using (
    exists (
      select 1 from projects where projects.id = change_requests.project_id and projects.owner_id = auth.uid()
    )
  );

create policy "change_requests_owner_insert" on change_requests
  for insert with check (
    exists (
      select 1 from projects where projects.id = change_requests.project_id and projects.owner_id = auth.uid()
    )
  );

create policy "change_requests_owner_update" on change_requests
  for update using (
    exists (
      select 1 from projects where projects.id = change_requests.project_id and projects.owner_id = auth.uid()
    )
  );

create policy "approvals_owner_select" on approvals
  for select using (
    exists (
      select 1 from change_requests
      join projects on projects.id = change_requests.project_id
      where change_requests.id = approvals.change_request_id
      and projects.owner_id = auth.uid()
    )
  );

create policy "audit_logs_owner_select" on audit_logs
  for select using (
    exists (
      select 1 from projects where projects.id = audit_logs.project_id and projects.owner_id = auth.uid()
    )
  );
