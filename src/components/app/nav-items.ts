import type { ComponentType } from "react";
import {
  BookOpen,
  Clock,
  LayoutDashboard,
  PenLine,
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
  { href: "/history", label: "学習履歴", icon: Clock },
  { href: "/badges", label: "バッジ", icon: Trophy },
  { href: "/settings", label: "設定", icon: Settings },
];
