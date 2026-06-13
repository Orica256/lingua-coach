"use client";

import { useRouter } from "next/navigation";
import { Flame, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/app/mobile-nav";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function Topbar({
  email,
  streak = 0,
}: {
  email?: string | null;
  streak?: number;
}) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initial = email?.[0]?.toUpperCase() ?? "U";

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-border px-4 sm:px-5">
      <div className="flex items-center gap-2">
        {/* モバイル用メニュー（PC では非表示） */}
        <MobileNav />
        {/* ストリーク表示（実データ） */}
        <div className="flex items-center gap-1.5 rounded-full border border-border bg-card/40 px-3 py-1 text-sm">
          <Flame
            className={cn(
              "size-4",
              streak > 0 ? "text-orange-400" : "text-muted-foreground"
            )}
          />
          <span className="font-medium tabular-nums">{streak}</span>
          <span className="text-muted-foreground">日連続</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-muted text-sm font-medium">
            {initial}
          </span>
          <span className="hidden max-w-40 truncate text-sm text-muted-foreground sm:inline">
            {email ?? "ゲスト"}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="size-4" />
          <span className="hidden sm:inline">ログアウト</span>
        </Button>
      </div>
    </header>
  );
}
