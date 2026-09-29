-- Phase 2: company context, agents, and employee agent assignments ("My Squad").
-- Every table is protected by row-level security; server actions also
-- re-check roles before mutating, so neither layer is trusted alone.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Company context -----------------------------------------------------------

-- Single-row table: the boolean primary key can only ever be true.
create table public.company_settings (
  id boolean primary key default true check (id),
  company_name text not null default '' check (char_length(company_name) <= 120),
  overview text not null default '' check (char_length(overview) <= 4000),
  audience text not null default '' check (char_length(audience) <= 2000),
  brand_voice text not null default '' check (char_length(brand_voice) <= 2000),
  writing_guidelines text not null default '' check (char_length(writing_guidelines) <= 4000),
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.company_settings enable row level security;

create trigger company_settings_set_updated_at
before update on public.company_settings
for each row execute procedure public.set_updated_at();

create policy "Signed-in users can read company context"
on public.company_settings
for select
to authenticated
using (true);

create policy "Admins can create company context"
on public.company_settings
for insert
to authenticated
with check ((select public.is_admin()));

create policy "Admins can update company context"
on public.company_settings
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

-- Supabase grants every privilege on new public tables by default; reset to
-- exactly what the policies above are written for.
revoke all on table public.company_settings from anon, authenticated;
grant select, insert, update on table public.company_settings to authenticated;

-- Agents --------------------------------------------------------------------

create type public.agent_status as enum ('active', 'archived');

create table public.agents (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 80),
  description text not null default '' check (char_length(description) <= 500),
  model text not null check (char_length(model) between 1 and 80),
  system_prompt text not null check (char_length(trim(system_prompt)) between 20 and 20000),
  icon text not null default 'bot' check (char_length(icon) between 1 and 40),
  status public.agent_status not null default 'active',
  -- Filled in Phase 3 when agents are mirrored to Claude Managed Agents.
  managed_agent_id text unique,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index agents_name_unique on public.agents (lower(name));

alter table public.agents enable row level security;

create trigger agents_set_updated_at
before update on public.agents
for each row execute procedure public.set_updated_at();

-- Employee assignments ------------------------------------------------------

create table public.user_agents (
  user_id uuid not null references public.profiles (id) on delete cascade,
  agent_id uuid not null references public.agents (id) on delete cascade,
  custom_instructions text not null default '' check (char_length(custom_instructions) <= 4000),
  assigned_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, agent_id)
);

create index user_agents_agent_id_idx on public.user_agents (agent_id);

alter table public.user_agents enable row level security;

create trigger user_agents_set_updated_at
before update on public.user_agents
for each row execute procedure public.set_updated_at();

-- Agent policies (defined after user_agents because they reference it)

create policy "Admins can read all agents"
on public.agents
for select
to authenticated
using ((select public.is_admin()));

create policy "Users can read active agents assigned to them"
on public.agents
for select
to authenticated
using (
  status = 'active'
  and exists (
    select 1
    from public.user_agents
    where user_agents.agent_id = agents.id
      and user_agents.user_id = (select auth.uid())
  )
);

create policy "Admins can create agents"
on public.agents
for insert
to authenticated
with check ((select public.is_admin()));

create policy "Admins can update agents"
on public.agents
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Admins can delete agents"
on public.agents
for delete
to authenticated
using ((select public.is_admin()));

revoke all on table public.agents from anon, authenticated;
grant select, insert, update, delete on table public.agents to authenticated;

-- Assignment policies

create policy "Users can read their own assignments"
on public.user_agents
for select
to authenticated
using (user_id = (select auth.uid()));

create policy "Admins can read all assignments"
on public.user_agents
for select
to authenticated
using ((select public.is_admin()));

create policy "Admins can assign agents"
on public.user_agents
for insert
to authenticated
with check ((select public.is_admin()));

create policy "Admins can remove assignments"
on public.user_agents
for delete
to authenticated
using ((select public.is_admin()));

create policy "Users can edit their own instructions"
on public.user_agents
for update
to authenticated
using (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.agents
    where agents.id = user_agents.agent_id
      and agents.status = 'active'
  )
)
with check (user_id = (select auth.uid()));

create policy "Admins can edit any instructions"
on public.user_agents
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

-- Only personal instructions are editable; ownership columns stay fixed.
-- The table-level revoke matters: without it Supabase's default UPDATE grant
-- would let a user repoint their own row at any agent_id.
revoke all on table public.user_agents from anon, authenticated;
grant select, insert, delete on table public.user_agents to authenticated;
grant update (custom_instructions) on table public.user_agents to authenticated;
