-- Agentics runs + artifacts (per-user isolation + TTL)
create table if not exists public.agentics_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('queued','running','succeeded','failed')),
  budget jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agentics_artifacts (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.agentics_runs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  label text not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz null
);

-- Helpful indexes
create index if not exists idx_agentics_runs_user on public.agentics_runs(user_id);
create index if not exists idx_agentics_artifacts_run on public.agentics_artifacts(run_id);
create index if not exists idx_agentics_artifacts_user on public.agentics_artifacts(user_id);
create index if not exists idx_agentics_artifacts_expiry on public.agentics_artifacts(expires_at);

-- Row Level Security
alter table public.agentics_runs enable row level security;
alter table public.agentics_artifacts enable row level security;

-- Per-user isolation
create policy "runs are user isolated"
on public.agentics_runs
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "artifacts are user isolated"
on public.agentics_artifacts
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- TTL cleanup function (used by pg_cron or API hook)
create or replace function public.agentics_delete_expired_artifacts()
returns void
language sql
security definer
as $$
  delete from public.agentics_artifacts
  where expires_at is not null
    and expires_at < now();
$$;

-- Optional pg_cron (if enabled in your project; otherwise call via HTTP route)
-- select cron.schedule('agentics_ttl_cleanup', '*/15 * * * *', $$select public.agentics_delete_expired_artifacts();$$);
