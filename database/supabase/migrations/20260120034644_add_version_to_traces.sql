alter table public.traces
add column if not exists version text;
