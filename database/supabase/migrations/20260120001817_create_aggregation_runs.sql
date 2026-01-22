create table if not exists aggregation_runs (
  id bigserial primary key,
  user_id uuid,

  -- execution metadata
  version text not null,
  session_id text,
  status text not null check (status in ('running', 'success', 'failed')),

  started_at timestamptz not null default now(),
  finished_at timestamptz,

  start_raw_trace_id bigint,
  end_raw_trace_id bigint,
  count bigint,

  -- diagnostics
  error text,

  constraint aggregation_runs_user_id_fkey
    foreign key (user_id)
    references auth.users (id)
    on delete set null
);
