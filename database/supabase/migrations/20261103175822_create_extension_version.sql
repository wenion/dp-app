create table public.extension_versions (
  id bigint generated always as identity primary key,
  version text not null unique,
  description text null,
  status text not null default 'draft',
  config_snapshot jsonb not null
    default '{"mutation_configs":[],"site_blacklist":[]}'::jsonb,
  created_at timestamptz not null default now(),
  published_at timestamptz null,
  created_by uuid null references auth.users(id)
    on delete set null,

  constraint extension_versions_status_check
    check (status in ('draft', 'published', 'deprecated')),

  constraint extension_versions_version_format
    check (version ~ '^[0-9]+\.[0-9]+\.[0-9]+$'),

  constraint extension_versions_snapshot_object_check
    check (jsonb_typeof(config_snapshot) = 'object'),

  constraint extension_versions_published_at_check
    check (
      (status = 'draft' and published_at is null)
      or
      (status in ('published', 'deprecated')
        and published_at is not null)
    )
);

alter table public.extension_versions enable row level security;