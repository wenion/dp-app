create table if not exists public.sessions (
    id bigint generated always as identity primary key,

    client_id uuid not null unique,

    user_id uuid not null
        references auth.users(id)
        on delete cascade,

    name text,

    started_at bigint not null,
    ended_at bigint,

    event_count integer not null default 0,

    capture_state text not null
        check (capture_state in ('recording', 'paused', 'ended')),

    upload_status text not null
        check (upload_status in ('waiting', 'uploading', 'uploaded', 'failed')),

    urls text[] not null default '{}',

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index idx_sessions_user
    on public.sessions(user_id);

create index idx_sessions_started
    on public.sessions(started_at);