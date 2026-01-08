create table if not exists public.extension_link_codes (
  code text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz
);

create index if not exists extension_link_codes_user_id_idx
on public.extension_link_codes(user_id);