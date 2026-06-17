-- ============================================================
-- ゲーミフィケーション: badges（獲得バッジ）
-- ============================================================
-- 実行方法: Supabase ダッシュボード → SQL Editor に貼り付けて Run
-- 何度実行しても安全（idempotent）
--
-- 用途: 学習の節目（初添削・連続学習・TOEIC満点など）で付与するバッジ。
--       付与はサーバー側（admin / service_role）が条件判定して insert する。
-- ============================================================

create table if not exists public.badges (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  badge_key  text not null,
  earned_at  timestamptz not null default now(),
  unique (user_id, badge_key)
);

create index if not exists badges_user_idx on public.badges (user_id);

-- ============================================================
-- Row Level Security（本人のみ参照。付与は service_role が行う）
-- ============================================================
alter table public.badges enable row level security;

drop policy if exists "Users can view own badges" on public.badges;
create policy "Users can view own badges"
  on public.badges for select
  using (auth.uid() = user_id);

-- ============================================================
-- 権限付与（auto-expose OFF のため明示的に必要）
-- ============================================================
grant select on public.badges to authenticated;
grant select, insert, update, delete on public.badges to service_role;
