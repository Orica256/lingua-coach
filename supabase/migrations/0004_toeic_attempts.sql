-- ============================================================
-- Phase 5: toeic_attempts テーブル（TOEIC 演習の履歴・採点結果）
-- ============================================================
-- 実行方法: Supabase ダッシュボード → SQL Editor にこの内容を貼り付けて Run
-- 何度実行しても安全（idempotent）
--
-- 備考: Part 5 の問題自体は当面アプリ内の自作シードバンク
--       （src/data/toeic-part5-seed.ts）から出題する。
--       Claude 生成問題をバンク化する toeic_questions テーブルは
--       APIキー登録後のフェーズで別途追加する。
-- ============================================================

create table if not exists public.toeic_attempts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  part        integer not null check (part between 1 and 7),
  total       integer not null check (total >= 0),
  correct     integer not null check (correct >= 0),
  answers     jsonb,   -- [{ id, selected }] 出題された問題IDと選択肢
  created_at  timestamptz not null default now()
);

create index if not exists toeic_attempts_user_created_idx
  on public.toeic_attempts (user_id, created_at desc);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.toeic_attempts enable row level security;

drop policy if exists "Users can view own toeic attempts" on public.toeic_attempts;
create policy "Users can view own toeic attempts"
  on public.toeic_attempts for select
  using (auth.uid() = user_id);

-- 書き込みは API ルート（認証済みユーザー）から行う
drop policy if exists "Users can insert own toeic attempts" on public.toeic_attempts;
create policy "Users can insert own toeic attempts"
  on public.toeic_attempts for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- 権限付与（auto-expose OFF のため明示的に必要）
-- ============================================================
grant select, insert on public.toeic_attempts to authenticated;
