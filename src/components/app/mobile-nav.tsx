"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";

/**
 * モバイル（< md）用のナビゲーション。
 * Topbar に置くハンバーガーボタンと、左から出るドロワーで構成。
 * PC では `md:hidden` で非表示（サイドバーが担当）。
 */
export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // ルート遷移したら閉じる
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // ドロワーを開いている間は背景スクロールを止める
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        className="md:hidden"
        aria-label="メニューを開く"
        onClick={() => setOpen(true)}
      >
        <Menu className="size-5" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* 背景オーバーレイ */}
          <button
            aria-label="メニューを閉じる"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/60"
          />

          {/* ドロワー本体 */}
          <div className="absolute inset-y-0 left-0 flex w-64 max-w-[80%] flex-col border-r border-border bg-card">
            <div className="flex h-16 items-center justify-between px-5">
              <Logo size="md" href="/dashboard" />
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="メニューを閉じる"
                onClick={() => setOpen(false)}
              >
                <X className="size-5" />
              </Button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const active =
                  pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    )}
                  >
                    <Icon className="size-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>
            <div className="px-5 py-4 text-xs text-muted-foreground">
              © {new Date().getFullYear()} LinguaCoach
            </div>
          </div>
        </div>
      )}
    </>
  );
}
