-- Run this entire file once in Supabase: Dashboard -> SQL Editor -> New query -> Run

-- 1. Profile for every user (auto-created on signup via trigger below)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  is_premium boolean default false,
  premium_until timestamptz,
  created_at timestamptz default now()
);

-- 2. Expenses
create table if not exists expenses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  amount numeric not null,
  category text not null,
  note text,
  expense_date date not null default current_date,
  created_at timestamptz default now()
);

-- 3. Bill-splitting requests (premium feature)
create table if not exists split_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  description text,
  total_amount numeric not null,
  split_with text[] default '{}',
  created_at timestamptz default now()
);

-- 4. Payment orders (so we can verify/track Cashfree payments)
create table if not exists payment_orders (
  order_id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  amount numeric not null,
  status text default 'CREATED',
  created_at timestamptz default now()
);

-- ---- Row Level Security ----
alter table profiles enable row level security;
alter table expenses enable row level security;
alter table split_requests enable row level security;
alter table payment_orders enable row level security;

drop policy if exists "select own profile" on profiles;
create policy "select own profile" on profiles for select using (auth.uid() = id);

drop policy if exists "update own profile" on profiles;
create policy "update own profile" on profiles for update using (auth.uid() = id);

drop policy if exists "insert own profile" on profiles;
create policy "insert own profile" on profiles for insert with check (auth.uid() = id);

drop policy if exists "crud own expenses" on expenses;
create policy "crud own expenses" on expenses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "crud own splits" on split_requests;
create policy "crud own splits" on split_requests for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "select own orders" on payment_orders;
create policy "select own orders" on payment_orders for select using (auth.uid() = user_id);

drop policy if exists "insert own orders" on payment_orders;
create policy "insert own orders" on payment_orders for insert with check (auth.uid() = user_id);

-- ---- Auto-create a profile row whenever someone signs up ----
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
