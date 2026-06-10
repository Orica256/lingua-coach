import { Sidebar } from "@/components/app/sidebar";
import { Topbar } from "@/components/app/topbar";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // 未ログイン時のリダイレクトは middleware が担保する。
  // ここではヘッダー表示用にユーザー情報を取得する。
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar email={user?.email} />
        <main className="flex-1 px-5 py-6 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
