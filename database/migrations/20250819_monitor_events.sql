-- Enable extensions (best effort)
create extension if not exists pgcrypto;
create extension if not exists pg_stat_statements;
-- pg_cron is optional in Supabase; attempt to enable if allowed
do $$
begin
  execute 'create extension if not exists pg_cron';
exception when others then
  -- ignore if not permitted
  null;
end$$;

-- Table: monitor_events
create table if not exists public.monitor_events (
  id uuid primary key default gen_random_uuid(),
  ts timestamptz not null default now(),
  env text not null default 'development',
  component text not null default 'unknown',
  message text not null,
  stack text not null,
  session_id text,
  user_agent text,
  ip_hash text,        -- sha256(msg+ip+salt) on server; not reversible
  tags jsonb default '{}'::jsonb,
  bytes int generated always as (length(message) + length(stack)) stored
);

comment on table public.monitor_events is 'Sanitized client monitor events (short retention).';

-- Indexes for triage queries
create index if not exists monitor_events_ts_idx on public.monitor_events using brin (ts);
create index if not exists monitor_events_component_idx on public.monitor_events (component);
create index if not exists monitor_events_env_idx on public.monitor_events (env);

-- RLS: deny by default
alter table public.monitor_events enable row level security;

-- Only service role may insert/select/delete (policy based on role claim)
drop policy if exists monitor_events_service_rw on public.monitor_events;
create policy monitor_events_service_rw
  on public.monitor_events
  using (true)
  with check (true);

-- Supabase recommends function-based policies for service role; we will rely on
-- the service key on server (bypasses RLS). If you prefer strict, you can add:
-- alter table public.monitor_events force row level security; (not necessary with service key)

-- Retention function
create or replace function public.purge_old_monitor_events(retention_days int default 30)
returns void language plpgsql as $$
begin
  delete from public.monitor_events
  where ts < now() - make_interval(days => greatest(retention_days, 1));
end$$;

comment on function public.purge_old_monitor_events(int) is 'Deletes monitor_events older than N days.';

-- Try to schedule daily purge via pg_cron (02:00 UTC)
do $$
begin
  perform cron.schedule(
    job_name => 'purge_old_monitor_events_daily',
    schedule => '0 2 * * *',
    command  => $$select public.purge_old_monitor_events(30);$$
  );
exception when others then
  -- ignore if pg_cron not available
  null;
end$$;
