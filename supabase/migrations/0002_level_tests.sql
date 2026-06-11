-- ============================================================
-- Phase 2: level_tests テーブル
-- ============================================================
-- 実行方法: Supabase ダッシュボード → SQL Editor にこの内容を貼り付けて Run
-- ============================================================

create table if not exists public.level_tests (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  score       integer not null check (score >= 0 and score <= 20),
  cefr_level  text not null check (cefr_level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  answers     jsonb,   -- [selectedIndex, ...] 各問題の選択肢インデックス (0–3)
  created_at  timestamptz not null default now()
);

create index if not exists level_tests_user_created_idx
  on public.level_tests (user_id, created_at desc);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.level_tests enable row level security;

drop policy if exists "Users can view own level tests" on public.level_tests;
create policy "Users can view own level tests"
  on public.level_tests for select
  using (auth.uid() = user_id);

-- 書き込みは API ルート（認証済みユーザー）から行う
drop policy if exists "Users can insert own level tests" on public.level_tests;
create policy "Users can insert own level tests"
  on public.level_tests for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- 権限付与（auto-expose OFF のため明示的に必要）
-- ============================================================
grant select, insert on public.level_tests to authenticated;
