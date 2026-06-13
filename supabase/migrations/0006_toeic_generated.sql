-- ============================================================
-- TOEIC Part 6/7 の保存問題バンク（個人用）
-- ============================================================
-- 実行方法: Supabase ダッシュボード → SQL Editor に貼り付けて Run
-- 何度実行しても安全（idempotent）
--
-- 用途: AI 生成した Part 6/7 の問題セットのうち、ユーザーが
--       「保存」した良問を蓄積し、再演習で API を呼ばずに使い回す。
-- ============================================================

create table if not exists public.toeic_generated (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  part        integer not null check (part in (6, 7)),
  title       text,
  passage     text not null,
  questions   jsonb not null,   -- [{ prompt, options, answer, explanation }, ...]
  created_at  timestamptz not null default now()
);

create index if not exists toeic_generated_user_created_idx
  on public.toeic_generated (user_id, created_at desc);

-- ============================================================
-- Row Level Security（本人のみ・個人用バンク）
-- ============================================================
alter table public.toeic_generated enable row level security;

drop policy if exists "Users can view own saved questions" on public.toeic_generated;
create policy "Users can view own saved questions"
  on public.toeic_generated for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own saved questions" on public.toeic_generated;
create policy "Users can insert own saved questions"
  on public.toeic_generated for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own saved questions" on public.toeic_generated;
create policy "Users can delete own saved questions"
  on public.toeic_generated for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 権限付与（auto-expose OFF のため明示的に必要）
-- authenticated: クライアント/サーバーの cookie クライアント用
-- service_role : サーバーの admin クライアント用（0005 の方針に合わせ付与）
-- ============================================================
grant select, insert, delete on public.toeic_generated to authenticated;
grant select, insert, update, delete on public.toeic_generated to service_role;
