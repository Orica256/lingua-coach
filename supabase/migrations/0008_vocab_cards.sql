-- ============================================================
-- 単語帳（Anki 風スペース反復）: vocab_cards
-- ============================================================
-- 実行方法: Supabase ダッシュボード → SQL Editor に貼り付けて Run
-- 何度実行しても安全（idempotent）
--
-- 用途: ユーザーが覚えたい単語・表現をカードとして登録し、Leitner 方式の
--       スペース反復（box 0〜5）で復習する。読み取りは本人の RLS、
--       書き込み（作成・採点・削除）はサーバーの service_role が行う。
-- ============================================================

create table if not exists public.vocab_cards (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles (id) on delete cascade,
  term             text not null,                 -- 表（英語の単語・表現）
  meaning          text not null,                 -- 裏（意味・日本語など）
  example          text,                          -- 例文（任意）
  source           text not null default 'manual',-- manual | correction
  box              int  not null default 0,       -- Leitner box（0〜5）
  due_at           timestamptz not null default now(), -- 次に復習する日時
  reps             int  not null default 0,       -- 累計復習回数
  lapses           int  not null default 0,       -- 間違えた回数
  last_reviewed_at timestamptz,
  created_at       timestamptz not null default now()
);

create index if not exists vocab_cards_user_idx on public.vocab_cards (user_id);
create index if not exists vocab_cards_due_idx on public.vocab_cards (user_id, due_at);

-- ============================================================
-- Row Level Security（本人のみ参照。書き込みは service_role が行う）
-- ============================================================
alter table public.vocab_cards enable row level security;

drop policy if exists "Users can view own vocab" on public.vocab_cards;
create policy "Users can view own vocab"
  on public.vocab_cards for select
  using (auth.uid() = user_id);

-- ============================================================
-- 権限付与（auto-expose OFF のため明示的に必要）
-- ============================================================
grant select on public.vocab_cards to authenticated;
grant select, insert, update, delete on public.vocab_cards to service_role;
