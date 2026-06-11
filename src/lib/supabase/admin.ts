import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * service_role キーを使うサーバー専用の Supabase クライアント。
 *
 * - RLS をバイパスするため、**必ずサーバー側（Route Handler / Server Action）でのみ**使用する。
 * - クライアントへ漏れないよう、このモジュールを Client Component から import しないこと。
 * - 操作対象は必ず user_id を明示的に指定し、本人のデータのみを書き込む。
 *
 * 主な用途: usage_log / corrections など、認証ユーザーには insert 権限を与えていない
 * テーブルへのサーバー側書き込み。
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
