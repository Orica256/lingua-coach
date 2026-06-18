import type { ComponentType } from "react";
import {
  BookMarked,
  BookOpen,
  Clock,
  LayoutDashboard,
  PenLine,
  Repeat,
  Settings,
  Trophy,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

/** サイドバー（PC）とモバイルドロワーで共有するナビゲーション項目。 */
export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/learn/typing", label: "英会話添削", icon: PenLine },
  { href: "/learn/toeic", label: "TOEIC学習", icon: BookOpen },
  { href: "/vocab", label: "単語帳", icon: BookMarked },
  { href: "/learn/review", label: "弱点復習", icon: Repeat },
  { href: "/history", label: "学習履歴", icon: Clock },
  { href: "/badges", label: "バッジ", icon: Trophy },
  { href: "/settings", label: "設定", icon: Settings },
];
