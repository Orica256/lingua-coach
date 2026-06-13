-- ============================================================
-- Phase 3 修正: service_role への GRANT 付与
-- ============================================================
-- 実行方法: Supabase ダッシュボード → SQL Editor に貼り付けて Run
-- 何度実行しても安全（idempotent）
--
-- 背景:
--   プロジェクト設定「Automatically expose new tables: OFF」のため、
--   新規テーブルは明示的に GRANT した role しかアクセスできない。
--   既存マイグレーション(0001/0003/0004)は authenticated にのみ GRANT しており、
--   サーバー側の書き込み（usage_log / corrections）に使う service_role への
--   GRANT が抜けていた。service_role は RLS は飛び越えるが、テーブルの
--   GRANT 権限は別途必要なため、添削API が usage_log 参照で 403 → 500 になっていた。
--
--   ※service_role はサーバー専用キー（src/lib/supabase/admin.ts）でのみ使用。
--     クライアントには露出しないため、全権限を付与しても安全。
-- ============================================================

grant usage on schema public to service_role;

grant select, insert, update, delete on public.usage_log      to service_role;
grant select, insert, update, delete on public.corrections    to service_role;
grant select, insert, update, delete on public.toeic_attempts to service_role;
grant select, insert, update, delete on public.profiles       to service_role;
grant select, insert, update, delete on public.level_tests    to service_role;
