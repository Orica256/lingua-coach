import type { ComponentType } from "react";
import {
  Award,
  BookMarked,
  Crown,
  Flame,
  GraduationCap,
  Languages,
  Medal,
  PenLine,
  Sparkles,
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
  /** 添削で記録した自然さスコアの最高値（0〜100） */
  maxNaturalness: number;
  /** TOEIC リーディング目安スコア（5〜495・公式ではない） */
  readingScore: number;
  /** 作成した単語カードの枚数 */
  vocabCards: number;
  /** 単語カードの累計復習回数 */
  vocabReviews: number;
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
    key: "corrections_100",
    name: "添削の鬼",
    description: "英会話添削を100回行った",
    icon: Award,
    condition: (s) => s.corrections >= 100,
  },
  {
    key: "naturalness_90",
    name: "ネイティブ級",
    description: "添削で自然さスコア90以上を獲得した",
    icon: Sparkles,
    condition: (s) => s.maxNaturalness >= 90,
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
    key: "toeic_50",
    name: "TOEIC やり込み",
    description: "TOEIC 演習を50回行った",
    icon: Target,
    condition: (s) => s.toeicAttempts >= 50,
  },
  {
    key: "perfect_part5",
    name: "パーフェクト",
    description: "TOEIC Part 5 演習で全問正解した",
    icon: Star,
    condition: (s) => s.perfectPart5,
  },
  {
    key: "reading_300",
    name: "リーディング300",
    description: "TOEIC リーディング目安スコアが300以上になった",
    icon: Medal,
    condition: (s) => s.readingScore >= 300,
  },
  {
    key: "reading_400",
    name: "リーディング400",
    description: "TOEIC リーディング目安スコアが400以上になった",
    icon: Medal,
    condition: (s) => s.readingScore >= 400,
  },
  {
    key: "vocab_first",
    name: "単語帳デビュー",
    description: "単語カードを初めて登録した",
    icon: BookMarked,
    condition: (s) => s.vocabCards >= 1,
  },
  {
    key: "vocab_100",
    name: "語彙コレクター",
    description: "単語カードを累計100回復習した",
    icon: Languages,
    condition: (s) => s.vocabReviews >= 100,
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
    key: "streak_14",
    name: "2週間継続",
    description: "14日連続で学習した",
    icon: Flame,
    condition: (s) => s.streak >= 14,
  },
  {
    key: "streak_30",
    name: "1ヶ月継続",
    description: "30日連続で学習した",
    icon: Trophy,
    condition: (s) => s.streak >= 30,
  },
  {
    key: "streak_100",
    name: "継続の達人",
    description: "100日連続で学習した",
    icon: Crown,
    condition: (s) => s.streak >= 100,
  },
];

/** バッジ判定に必要な統計をまとめて取得する（service_role）。 */
async function getBadgeStats(userId: string): Promise<BadgeStat> {
  const admin = createAdminClient();
  const [corr, toeic, lvl, profile, part5, naturalness, reading, vocab] =
    await Promise.all([
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
      admin
        .from("corrections")
        .select("naturalness")
        .eq("user_id", userId)
        .order("naturalness", { ascending: false })
        .limit(1),
      // リーディング目安スコア算出用（全 part の累計正答率）
      admin.from("toeic_attempts").select("correct, total").eq("user_id", userId),
      // 単語カード枚数と累計復習回数（テーブル未作成でも data=null で安全）
      admin.from("vocab_cards").select("reps").eq("user_id", userId),
    ]);

  const perfectPart5 = (part5.data ?? []).some(
    (r) => r.total > 0 && r.correct === r.total
  );

  const maxNaturalness = naturalness.data?.[0]?.naturalness ?? 0;

  let rTotal = 0;
  let rCorrect = 0;
  for (const r of reading.data ?? []) {
    rTotal += r.total ?? 0;
    rCorrect += r.correct ?? 0;
  }
  const readingScore =
    rTotal > 0
      ? Math.max(5, Math.min(495, Math.round((5 + (rCorrect / rTotal) * 490) / 5) * 5))
      : 0;

  const vocabRows = (vocab.data ?? []) as { reps: number | null }[];
  const vocabCards = vocabRows.length;
  const vocabReviews = vocabRows.reduce((sum, r) => sum + (r.reps ?? 0), 0);

  return {
    corrections: corr.count ?? 0,
    toeicAttempts: toeic.count ?? 0,
    levelTests: lvl.count ?? 0,
    streak: currentStreak(
      profile.data?.streak_days,
      profile.data?.last_active_at
    ),
    perfectPart5,
    maxNaturalness,
    readingScore,
    vocabCards,
    vocabReviews,
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
