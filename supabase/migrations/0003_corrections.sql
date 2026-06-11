-- ============================================================
-- Phase 3: corrections テーブル（タイピング添削の結果保存）
-- ============================================================
-- 実行方法: Supabase ダッシュボード → SQL Editor にこの内容を貼り付けて Run
-- 何度実行しても安全（idempotent）
-- ============================================================

create table if not exists public.corrections (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles (id) on delete cascade,
  scene           text,                              -- シーン名（プリセット名 or 自由入力）
  original_text   text not null,                     -- ユーザーが入力した英文
  corrected_text  text,                              -- 修正後の英文全体
  naturalness     integer check (naturalness >= 0 and naturalness <= 100), -- 自然さスコア
  overall_comment text,                              -- 総評（日本語）
  feedback        jsonb,                             -- 添削詳細（誤り配列・改善例など）
  model           text,                              -- 使用モデル
  created_at      timestamptz not null default now()
);

create index if not exists corrections_user_created_idx
  on public.corrections (user_id, created_at desc);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.corrections enable row level security;

-- 参照は本人のみ（履歴・ダッシュボード表示用）
drop policy if exists "Users can view own corrections" on public.corrections;
create policy "Users can view own corrections"
  on public.corrections for select
  using (auth.uid() = user_id);

-- 書き込みはサーバー側（service_role）が RLS をバイパスして行うため、
-- insert ポリシーは設けない（クライアントから直接 insert させない）。

-- ============================================================
-- 権限付与（auto-expose OFF のため明示的に必要）
-- ============================================================
grant select on public.corrections to authenticated;
