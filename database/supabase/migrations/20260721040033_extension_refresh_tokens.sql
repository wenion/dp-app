create table if not exists public.extension_refresh_tokens (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references auth.users(id)
        on delete cascade,

    token_hash text not null unique,

    created_at timestamptz not null default now(),

    expires_at timestamptz not null,

    revoked_at timestamptz
);

create index extension_refresh_tokens_user_idx
on public.extension_refresh_tokens(user_id);