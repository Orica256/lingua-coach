"use client";

import { useRouter } from "next/navigation";
import { Flame, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Topbar() {
  const router = useRouter();

  function handleLogout() {
    // TODO(Phase 1): Supabase Auth でサインアウトを実装する
    router.push("/login");
  }

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-border px-5">
      {/* ストリーク表示（Phase 5 で実データに接続） */}
      <div className="flex items-center gap-1.5 rounded-full border border-border bg-card/40 px-3 py-1 text-sm">
        <Flame className="size-4 text-orange-400" />
        <span className="font-medium">0</span>
        <span className="text-muted-foreground">日連続</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-muted text-sm font-medium">
            U
          </span>
          <span className="hidden text-sm text-muted-foreground sm:inline">
            ゲスト
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
