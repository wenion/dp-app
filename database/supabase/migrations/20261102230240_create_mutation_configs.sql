create table public.mutation_configs (
  id bigint generated always as identity primary key,
  platform text not null,
  selectors jsonb not null,
  created_at timestamptz not null default now()
);