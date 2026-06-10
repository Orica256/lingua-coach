import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * メール内リンク（サインアップ確認・パスワード再設定）からのコールバック。
 * 認証コードをセッションに交換してから目的のページへリダイレクトする。
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // 再設定リンクなどで遷移先を指定したい場合に使用
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // 失敗時はエラーを示してログインへ
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
