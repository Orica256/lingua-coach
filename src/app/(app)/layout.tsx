import { Sidebar } from "@/components/app/sidebar";
import { Topbar } from "@/components/app/topbar";
import { createClient } from "@/lib/supabase/server";
import { currentStreak } from "@/lib/streak";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // 未ログイン時のリダイレクトは middleware が担保する。
  // ここではヘッダー表示用にユーザー情報とストリークを取得する。
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("streak_days, last_active_at")
    .eq("id", user!.id)
    .single();

  const streak = currentStreak(profile?.streak_days, profile?.last_active_at);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar email={user?.email} streak={streak} />
        <main className="flex-1 px-5 py-6 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
