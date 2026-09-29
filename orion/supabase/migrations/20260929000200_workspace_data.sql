-- Workspace data behind the Missions, Usage, Integrations, knowledge, and
-- Settings screens. Supabase grants every privilege on new public tables by
-- default, so each table revokes first and grants exactly what its policies
-- are written for. Mission runs, Drive file listing, and usage writes are
-- performed server-side (service role) once the Phase 3 runtime lands.

-- Profiles: editable name, job title, and avatar ----------------------------

alter table public.profiles
  add column job_title text not null default '' check (char_length(job_title) <= 80),
  -- Only files in the user's own folder of the avatars bucket.
  add column avatar_url text check (
    avatar_url is null
    or (
      char_length(avatar_url) <= 500
      and avatar_url like ('https://%/storage/v1/object/public/avatars/' || id::text || '/%')
    )
  );

-- NOT VALID: enforce for new writes without failing on existing rows.
alter table public.profiles
  add constraint profiles_full_name_length check (char_length(trim(full_name)) between 2 and 80) not valid;

-- Keep sign-up working under the name constraint: clamp long names and
-- replace too-short ones (e.g. a one-letter email local part).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  display_name text := left(
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1)),
    80
  );
begin
  if char_length(trim(display_name)) < 2 then
    display_name := 'New member';
  end if;

  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, trim(display_name), 'user');

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

-- Supabase's default grants include table-wide UPDATE; without this revoke the
-- policy above would let a user rewrite their own role. Only these columns.
revoke insert, update, delete, truncate, references, trigger on table public.profiles from anon, authenticated;
grant update (full_name, job_title, avatar_url) on table public.profiles to authenticated;

-- Avatar storage: public read, owners write inside their own folder.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 1000000, array['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

create policy "Users manage their own avatar files"
on storage.objects
for all
to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Missions -------------------------------------------------------------------

create type public.mission_status as enum ('queued', 'in_progress', 'completed', 'failed');
create type public.output_format as enum ('google_doc', 'google_sheet', 'pdf');

create table public.missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  agent_id uuid not null references public.agents (id) on delete restrict,
  title text not null check (char_length(trim(title)) between 3 and 120),
  brief text not null check (char_length(trim(brief)) between 20 and 8000),
  web_search boolean not null default false,
  output_format public.output_format not null default 'google_doc',
  status public.mission_status not null default 'queued',
  output_url text check (output_url is null or output_url like 'https://%'),
  output_text text,
  error text,
  -- Claude Managed Agents session, set by the Phase 3 runtime.
  session_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);

create index missions_user_id_updated_at_idx on public.missions (user_id, updated_at desc);
create index missions_agent_id_idx on public.missions (agent_id);

alter table public.missions enable row level security;

create trigger missions_set_updated_at
before update on public.missions
for each row execute procedure public.set_updated_at();

-- True when the signed-in user may brief this agent (assigned and active).
create or replace function public.can_use_agent(target_agent uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_agents
    join public.agents on agents.id = user_agents.agent_id
    where user_agents.user_id = (select auth.uid())
      and user_agents.agent_id = target_agent
      and agents.status = 'active'
  );
$$;

revoke all on function public.can_use_agent(uuid) from public;
grant execute on function public.can_use_agent(uuid) to authenticated;

create policy "Users can read their own missions"
on public.missions
for select
to authenticated
using (user_id = (select auth.uid()));

create policy "Admins can read all missions"
on public.missions
for select
to authenticated
using ((select public.is_admin()));

create policy "Users can queue missions for their own agents"
on public.missions
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and status = 'queued'
  and public.can_use_agent(agent_id)
);

create policy "Users can edit their queued or failed missions"
on public.missions
for update
to authenticated
using (user_id = (select auth.uid()) and status in ('queued', 'failed'))
with check (user_id = (select auth.uid()) and public.can_use_agent(agent_id));

create policy "Users can delete their missions that are not running"
on public.missions
for delete
to authenticated
using (user_id = (select auth.uid()) and status <> 'in_progress');

revoke all on table public.missions from anon, authenticated;
grant select, delete on table public.missions to authenticated;
-- Status, output, and run fields are written only by the server runtime.
grant insert (user_id, agent_id, title, brief, web_search, output_format) on table public.missions to authenticated;
grant update (agent_id, title, brief, web_search, output_format) on table public.missions to authenticated;

-- Usage events ---------------------------------------------------------------

create type public.usage_event_type as enum ('mission_run', 'prompt_generation');

create table public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  agent_id uuid references public.agents (id) on delete set null,
  mission_id uuid references public.missions (id) on delete set null,
  event_type public.usage_event_type not null,
  model text not null,
  input_tokens integer not null check (input_tokens >= 0),
  output_tokens integer not null check (output_tokens >= 0),
  cost_usd numeric(12, 6) not null check (cost_usd >= 0),
  created_at timestamptz not null default now()
);

create index usage_events_created_at_idx on public.usage_events (created_at desc);
create index usage_events_user_id_created_at_idx on public.usage_events (user_id, created_at desc);

alter table public.usage_events enable row level security;

create policy "Users can read their own usage"
on public.usage_events
for select
to authenticated
using (user_id = (select auth.uid()));

create policy "Admins can read all usage"
on public.usage_events
for select
to authenticated
using ((select public.is_admin()));

-- No insert policy: usage is recorded by the server with the service role.
revoke all on table public.usage_events from anon, authenticated;
grant select on table public.usage_events to authenticated;

-- Company integrations -------------------------------------------------------

create table public.integrations (
  provider text primary key check (provider in ('google_drive')),
  status text not null check (status in ('connected', 'disconnected')),
  account_email text,
  -- Pipedream Connect account reference (an id, never a token).
  external_account_id text,
  connected_at timestamptz,
  connected_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.integrations enable row level security;

create trigger integrations_set_updated_at
before update on public.integrations
for each row execute procedure public.set_updated_at();

create policy "Signed-in users can read integration status"
on public.integrations
for select
to authenticated
using (true);

create policy "Admins manage integrations"
on public.integrations
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

revoke all on table public.integrations from anon, authenticated;
grant select, insert, update, delete on table public.integrations to authenticated;

-- Agent knowledge (Drive file references only, never contents) --------------

create table public.agent_knowledge (
  agent_id uuid not null references public.agents (id) on delete cascade,
  file_id text not null check (file_id ~ '^[A-Za-z0-9_-]{1,120}$'),
  name text not null check (char_length(name) between 1 and 300),
  kind text not null check (kind in ('doc', 'sheet', 'pdf', 'docx', 'txt', 'csv')),
  modified_at timestamptz,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  attached_at timestamptz not null default now(),
  attached_by uuid references public.profiles (id) on delete set null,
  primary key (agent_id, file_id)
);

alter table public.agent_knowledge enable row level security;

create policy "Admins manage agent knowledge"
on public.agent_knowledge
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Users can read knowledge of agents they can use"
on public.agent_knowledge
for select
to authenticated
using (public.can_use_agent(agent_id));

revoke all on table public.agent_knowledge from anon, authenticated;
grant select, insert, update, delete on table public.agent_knowledge to authenticated;
