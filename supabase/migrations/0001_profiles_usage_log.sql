-- ============================================================
-- Phase 1: profiles / usage_log テーブル
-- ============================================================
-- 実行方法: Supabase ダッシュボード → SQL Editor にこの内容を貼り付けて Run
-- 何度実行しても安全（idempotent）になるよう IF NOT EXISTS / OR REPLACE を使用
--
-- 前提（プロジェクト作成時の設定）:
--   - Enable Data API: ON
--   - Automatically expose new tables: OFF  → 明示的に GRANT が必要
--   - Enable automatic RLS: ON              → 念のため明示的にも RLS を有効化
-- ============================================================

-- ---------- profiles ----------
create table if not exists public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  email          text,
  display_name   text,
  cefr_level     text check (cefr_level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  streak_days    integer not null default 0,
  last_active_at timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ---------- usage_log（Claude API 使用量・コスト管理用） ----------
create table if not exists public.usage_log (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  endpoint      text,
  input_tokens  integer,
  output_tokens integer,
  model         text,
  created_at    timestamptz not null default now()
);

create index if not exists usage_log_user_created_idx
  on public.usage_log (user_id, created_at desc);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles  enable row level security;
alter table public.usage_log enable row level security;

-- profiles: 本人のみ参照・更新可（作成はトリガーが行う）
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- usage_log: 本人のみ参照可（書き込みはサーバー側の service_role が行う）
drop policy if exists "Users can view own usage" on public.usage_log;
create policy "Users can view own usage"
  on public.usage_log for select
  using (auth.uid() = user_id);

-- ============================================================
-- 権限付与（auto-expose OFF のため明示的に必要）
-- ============================================================
grant usage on schema public to anon, authenticated;
grant select, update on public.profiles  to authenticated;
grant select          on public.usage_log to authenticated;

-- ============================================================
-- トリガー: 新規ユーザー作成時に profiles を自動生成
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- トリガー: profiles.updated_at を自動更新
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 既存ユーザーのバックフィル
-- （トリガー作成前にテストで登録したユーザーの profiles を補完）
-- ============================================================
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;
