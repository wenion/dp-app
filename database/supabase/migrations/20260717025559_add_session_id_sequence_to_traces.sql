alter table public.traces
  add column session_id uuid
    references public.sessions(client_id)
    on delete cascade,
  add column sequence integer;

alter table public.traces
  add constraint traces_session_sequence_unique
  unique (session_id, sequence);
