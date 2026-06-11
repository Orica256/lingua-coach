"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Clock,
  LayoutDashboard,
  PenLine,
  Settings,
  Trophy,
} from "lucide-react";

import { Logo } from "@/components/brand";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/learn/typing", label: "英会話添削", icon: PenLine },
  { href: "/learn/toeic", label: "TOEIC学習", icon: BookOpen },
  { href: "/history", label: "学習履歴", icon: Clock },
  { href: "/badges", label: "バッジ", icon: Trophy },
  { href: "/settings", label: "設定", icon: Settings },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card/30 md:flex">
      <div className="flex h-16 items-center px-5">
        <Logo size="md" href="/dashboard" />
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
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
    </aside>
  );
}
