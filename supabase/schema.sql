-- Supabase SQL Editorで実行してください。
-- このアプリはログイン機能なしの個人用デモとして、user_key='personal' で保存します。

create table if not exists household_transactions (
  id uuid primary key default gen_random_uuid(),
  user_key text not null default 'personal',
  date date not null,
  type text not null check (type in ('income', 'expense')),
  category text not null,
  subcategory text,
  amount integer not null check (amount >= 0),
  memo text,
  created_at timestamptz not null default now()
);

create table if not exists household_budgets (
  id uuid primary key default gen_random_uuid(),
  user_key text not null default 'personal',
  month text not null,
  category text not null,
  budget integer not null default 0 check (budget >= 0),
  created_at timestamptz not null default now(),
  unique (user_key, month, category)
);

create index if not exists household_transactions_month_idx
on household_transactions (user_key, date desc);

create index if not exists household_budgets_month_idx
on household_budgets (user_key, month);

alter table household_transactions enable row level security;
alter table household_budgets enable row level security;

drop policy if exists "demo read transactions" on household_transactions;
drop policy if exists "demo insert transactions" on household_transactions;
drop policy if exists "demo update transactions" on household_transactions;
drop policy if exists "demo delete transactions" on household_transactions;
drop policy if exists "demo read budgets" on household_budgets;
drop policy if exists "demo insert budgets" on household_budgets;
drop policy if exists "demo update budgets" on household_budgets;
drop policy if exists "demo delete budgets" on household_budgets;

create policy "demo read transactions" on household_transactions for select using (true);
create policy "demo insert transactions" on household_transactions for insert with check (true);
create policy "demo update transactions" on household_transactions for update using (true) with check (true);
create policy "demo delete transactions" on household_transactions for delete using (true);

create policy "demo read budgets" on household_budgets for select using (true);
create policy "demo insert budgets" on household_budgets for insert with check (true);
create policy "demo update budgets" on household_budgets for update using (true) with check (true);
create policy "demo delete budgets" on household_budgets for delete using (true);
