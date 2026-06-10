import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * サーバー（Server Component / Route Handler / Server Action）用の Supabase クライアント。
 * Cookie を通じてセッションを読み書きする。
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component から呼ばれた場合 set は失敗する。
            // セッション更新は middleware が行うため、ここは無視してよい。
          }
        },
      },
    }
  );
}
