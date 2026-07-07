-- 解讀紀錄資料表
-- 使用方式:Supabase Dashboard → SQL Editor → 貼上執行

create table if not exists public.readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  category text not null,
  question text not null,
  gender text not null,
  solar_date text not null,
  chart jsonb not null,          -- 完整命盤(BaziChart JSON),供歷史頁重現
  interpretation text not null   -- AI 解讀全文
);

-- Row Level Security:每個人只能讀寫自己的紀錄
alter table public.readings enable row level security;

create policy "select own readings"
  on public.readings for select
  using (auth.uid() = user_id);

create policy "insert own readings"
  on public.readings for insert
  with check (auth.uid() = user_id);

create policy "delete own readings"
  on public.readings for delete
  using (auth.uid() = user_id);

create index if not exists readings_user_created_idx
  on public.readings (user_id, created_at desc);
