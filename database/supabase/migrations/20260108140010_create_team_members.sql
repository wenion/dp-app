create table if not exists public."TeamMember" (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  title text,
  role text not null,
  bio text not null,
  image text,
  order_index int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
