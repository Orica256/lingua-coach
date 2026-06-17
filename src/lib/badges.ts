import type { ComponentType } from "react";
import {
  Award,
  Flame,
  GraduationCap,
  PenLine,
  Star,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

import { createAdminClient } from "@/lib/supabase/admin";
import { currentStreak } from "@/lib/streak";

export interface BadgeStat {
  corrections: number;
  toeicAttempts: number;
  levelTests: number;
  streak: number;
  perfectPart5: boolean;
}

export interface BadgeDef {
  key: string;
  name: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  /** 獲得条件 */
  condition: (s: BadgeStat) => boolean;
}

/** バッジ定義（表示順）。条件は累積カウント・連続日数・達成で判定。 */
export const BADGE_DEFS: BadgeDef[] = [
  {
    key: "onboarded",
    name: "スタートライン",
    description: "レベル判定テストを完了した",
    icon: GraduationCap,
    condition: (s) => s.levelTests >= 1,
  },
  {
    key: "first_correction",
    name: "はじめての添削",
    description: "英会話添削を初めて行った",
    icon: PenLine,
    condition: (s) => s.corrections >= 1,
  },
  {
    key: "corrections_10",
    name: "添削の習慣",
    description: "英会話添削を10回行った",
    icon: PenLine,
    condition: (s) => s.corrections >= 10,
  },
  {
    key: "corrections_50",
    name: "添削マスター",
    description: "英会話添削を50回行った",
    icon: Award,
    condition: (s) => s.corrections >= 50,
  },
  {
    key: "first_toeic",
    name: "TOEIC デビュー",
    description: "TOEIC 演習を初めて行った",
    icon: Target,
    condition: (s) => s.toeicAttempts >= 1,
  },
  {
    key: "toeic_10",
    name: "TOEIC 常連",
    description: "TOEIC 演習を10回行った",
    icon: Target,
    condition: (s) => s.toeicAttempts >= 10,
  },
  {
    key: "perfect_part5",
    name: "パーフェクト",
    description: "TOEIC Part 5 演習で全問正解した",
    icon: Star,
    condition: (s) => s.perfectPart5,
  },
  {
    key: "streak_3",
    name: "3日継続",
    description: "3日連続で学習した",
    icon: Flame,
    condition: (s) => s.streak >= 3,
  },
  {
    key: "streak_7",
    name: "1週間継続",
    description: "7日連続で学習した",
    icon: Zap,
    condition: (s) => s.streak >= 7,
  },
  {
    key: "streak_30",
    name: "1ヶ月継続",
    description: "30日連続で学習した",
    icon: Trophy,
    condition: (s) => s.streak >= 30,
  },
];

/** バッジ判定に必要な統計をまとめて取得する（service_role）。 */
async function getBadgeStats(userId: string): Promise<BadgeStat> {
  const admin = createAdminClient();
  const [corr, toeic, lvl, profile, part5] = await Promise.all([
    admin
      .from("corrections")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    admin
      .from("toeic_attempts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    admin
      .from("level_tests")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    admin
      .from("profiles")
      .select("streak_days, last_active_at")
      .eq("id", userId)
      .single(),
    admin
      .from("toeic_attempts")
      .select("correct, total")
      .eq("user_id", userId)
      .eq("part", 5),
  ]);

  const perfectPart5 = (part5.data ?? []).some(
    (r) => r.total > 0 && r.correct === r.total
  );

  return {
    corrections: corr.count ?? 0,
    toeicAttempts: toeic.count ?? 0,
    levelTests: lvl.count ?? 0,
    streak: currentStreak(
      profile.data?.streak_days,
      profile.data?.last_active_at
    ),
    perfectPart5,
  };
}

/**
 * 条件を満たした未獲得バッジを付与し、獲得済みバッジ（key→earned_at）を返す。
 * 学習アクション後（API ルート）や /badges 表示時に呼ぶ。冪等。
 */
export async function evaluateBadges(
  userId: string
): Promise<Map<string, string>> {
  const admin = createAdminClient();
  const [stats, existingRes] = await Promise.all([
    getBadgeStats(userId),
    admin.from("badges").select("badge_key, earned_at").eq("user_id", userId),
  ]);

  const earned = new Map<string, string>();
  for (const b of existingRes.data ?? []) earned.set(b.badge_key, b.earned_at);

  const toAward = BADGE_DEFS.filter(
    (d) => !earned.has(d.key) && d.condition(stats)
  );

  if (toAward.length > 0) {
    const now = new Date().toISOString();
    await admin
      .from("badges")
      .insert(toAward.map((d) => ({ user_id: userId, badge_key: d.key })));
    for (const d of toAward) earned.set(d.key, now);
  }

  return earned;
}
