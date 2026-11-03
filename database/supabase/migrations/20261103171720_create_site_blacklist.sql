create table public.site_blacklist (
  id bigint generated always as identity primary key,

  domain text not null,

  match_type text not null default 'domain',

  path text null,

  reason text null,

  created_at timestamptz not null default now(),

  created_by uuid null references auth.users(id)
    on delete set null,

  constraint site_blacklist_match_type_check
    check (
      match_type in (
        'domain',
        'hostname',
        'path_prefix'
      )
    ),

  constraint site_blacklist_domain_format
    check (
      domain = lower(domain)
      and domain ~
        '^[a-z0-9-]+(\.[a-z0-9-]+)+$'
    ),

  constraint site_blacklist_path_check
    check (
      (
        match_type = 'path_prefix'
        and path is not null
        and path like '/%'
        and path <> '/'
      )
      or
      (
        match_type <> 'path_prefix'
        and path is null
      )
    ),

  constraint site_blacklist_unique_rule
    unique nulls not distinct (
      domain,
      match_type,
      path
    )
);

alter table public.site_blacklist
enable row level security;