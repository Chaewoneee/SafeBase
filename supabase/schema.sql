-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. Create ENUM types
create type user_role as enum ('ADMIN', 'MANAGER', 'VIEWER');
create type transaction_type as enum ('PURCHASE', 'RESALE');
create type risk_level as enum ('NORMAL', 'CAUTION', 'WARNING', 'DANGER');
create type transaction_status as enum ('PENDING', 'REVIEWED', 'REPORTED', 'DISMISSED');
create type report_status as enum ('RECEIVED', 'INVESTIGATING', 'RESOLVED', 'REJECTED');
create type blacklist_level as enum ('WATCH', 'SUSPENDED', 'BANNED');

-- 2. Create tables
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  name text,
  role user_role default 'VIEWER',
  team text,
  created_at timestamptz default now()
);

create table games (
  id uuid primary key default uuid_generate_v4(),
  home_team text not null,
  away_team text not null,
  stadium text not null,
  game_date timestamptz not null,
  is_soldout boolean default false,
  created_at timestamptz default now()
);

create table transactions (
  id uuid primary key default uuid_generate_v4(),
  account_id text not null,
  game_id uuid references games(id) on delete cascade,
  team text not null,
  seat_info text not null,
  original_price integer not null,
  resale_price integer,
  transaction_type transaction_type default 'PURCHASE',
  quantity integer default 1,
  source_platform text not null,
  listing_url text,
  risk_score integer default 0,
  risk_level risk_level default 'NORMAL',
  flagged_rules text[] default '{}',
  status transaction_status default 'PENDING',
  admin_note text,
  ip_address text,
  created_at timestamptz default now()
);

create table reports (
  id uuid primary key default uuid_generate_v4(),
  transaction_id uuid references transactions(id) on delete set null,
  reporter_name text not null,
  description text not null,
  evidence_url text,
  status report_status default 'RECEIVED',
  assigned_to uuid references profiles(id) on delete set null,
  admin_note text,
  created_at timestamptz default now(),
  resolved_at timestamptz
);

create table blacklist (
  id uuid primary key default uuid_generate_v4(),
  account_id text not null,
  reason text not null,
  level blacklist_level default 'WATCH',
  related_transactions uuid[] default '{}',
  registered_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now(),
  expires_at timestamptz
);

create table detection_rules (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text not null,
  description text,
  threshold jsonb not null default '{}'::jsonb,
  weight float not null,
  is_active boolean default true,
  updated_by uuid references profiles(id) on delete set null,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

-- 3. Indexes
create index idx_transactions_account on transactions(account_id);
create index idx_transactions_created_at on transactions(created_at);
create index idx_transactions_risk on transactions(risk_level, risk_score);
create index idx_blacklist_account on blacklist(account_id);

-- 4. Auth trigger for profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role)
  values (new.id, new.email, split_part(new.email, '@', 1), 'VIEWER');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Row Level Security (RLS)
alter table profiles enable row level security;
alter table games enable row level security;
alter table transactions enable row level security;
alter table reports enable row level security;
alter table blacklist enable row level security;
alter table detection_rules enable row level security;

-- (Simple RLS rules for MVP: authenticated users can read all, admins/managers can edit)
-- In a real app, these would be more strict.
create policy "Authenticated users can read profiles" on profiles for select using (auth.role() = 'authenticated');
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

create policy "Authenticated users can read games" on games for select using (auth.role() = 'authenticated');
create policy "Authenticated users can read transactions" on transactions for select using (auth.role() = 'authenticated');
create policy "Authenticated users can read reports" on reports for select using (auth.role() = 'authenticated');
create policy "Authenticated users can insert reports" on reports for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can read blacklist" on blacklist for select using (auth.role() = 'authenticated');
create policy "Authenticated users can read detection_rules" on detection_rules for select using (auth.role() = 'authenticated');

-- To avoid complex role-based RLS in this MVP SQL, we allow authenticated users to update transactions and reports.
-- In production, we should check `auth.uid() in (select id from profiles where role in ('ADMIN', 'MANAGER'))`
create policy "Authenticated users can update transactions" on transactions for update using (auth.role() = 'authenticated');
create policy "Authenticated users can update reports" on reports for update using (auth.role() = 'authenticated');
create policy "Authenticated users can update blacklist" on blacklist for all using (auth.role() = 'authenticated');
create policy "Authenticated users can update rules" on detection_rules for all using (auth.role() = 'authenticated');
