begin;

create table public.user_extension_clients (
  id bigint generated always as identity primary key,

  user_id uuid not null
    references auth.users(id) on delete cascade,

  client_id varchar(36) not null,

  extension_version varchar(50) not null,

  config_version varchar(50) null,

  last_seen_at timestamptz not null default now(),

  created_at timestamptz not null default now(),

  constraint user_extension_clients_unique
    unique (user_id, client_id)
);

create index idx_user_extension_clients_user
  on public.user_extension_clients (user_id);

alter table public.user_extension_clients
  enable row level security;

commit;