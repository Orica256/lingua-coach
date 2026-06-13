import type { createClient } from "@/lib/supabase/server";
import { TOEIC_PART5_SEED } from "@/data/toeic-part5-seed";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type ActivityType = "toeic" | "correction" | "level_test";

export interface ActivityItem {
  key: string;
  type: ActivityType;
  createdAt: string;
  title: string;
  detail: string;
}

/**
 * 学習履歴を横断的に取得して時系列（新しい順）にまとめる。
 * 各テーブルは RLS により本人の行のみ返る。テーブル未作成（マイグレーション未実行）
 * でも supabase-js はエラーを throw せず data=null を返すため、空配列として扱う。
 */
export async function getRecentActivity(
  supabase: SupabaseServerClient,
  userId: string,
  limit = 20
): Promise<ActivityItem[]> {
  const [toeic, corrections, levelTests] = await Promise.all([
    supabase
      .from("toeic_attempts")
      .select("id, part, total, correct, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("corrections")
      .select("id, scene, naturalness, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("level_tests")
      .select("id, score, cefr_level, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit),
  ]);

  const items: ActivityItem[] = [];

  for (const a of toeic.data ?? []) {
    const pct = a.total > 0 ? Math.round((a.correct / a.total) * 100) : 0;
    items.push({
      key: `toeic-${a.id}`,
      type: "toeic",
      createdAt: a.created_at,
      title: `TOEIC Part ${a.part} 演習`,
      detail: `${a.correct}/${a.total}問正解・正答率 ${pct}%`,
    });
  }

  for (const c of corrections.data ?? []) {
    items.push({
      key: `correction-${c.id}`,
      type: "correction",
      createdAt: c.created_at,
      title: "英会話添削",
      detail: `${c.scene ?? "自由入力"}・自然さ ${c.naturalness ?? "-"}`,
    });
  }

  for (const l of levelTests.data ?? []) {
    items.push({
      key: `level-${l.id}`,
      type: "level_test",
      createdAt: l.created_at,
      title: "レベル判定テスト",
      detail: `${l.cefr_level}（${l.score}/20）`,
    });
  }

  items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return items.slice(0, limit);
}

export interface CategoryStat {
  category: string;
  correct: number;
  total: number;
  accuracy: number;
}

const SEED_BY_ID = new Map(TOEIC_PART5_SEED.map((q) => [q.id, q]));

/**
 * TOEIC Part 5 のカテゴリ別正答率を集計する（弱点の可視化用）。
 * toeic_attempts.answers（[{ id, selected }]）をシードと突き合わせて算出。
 * 正答率が低い順（弱点が上）に並べて返す。
 */
export async function getToeicCategoryStats(
  supabase: SupabaseServerClient,
  userId: string
): Promise<CategoryStat[]> {
  const { data } = await supabase
    .from("toeic_attempts")
    .select("answers")
    .eq("user_id", userId);

  const buckets = new Map<string, { correct: number; total: number }>();

  for (const row of data ?? []) {
    const answers = (row.answers ?? []) as { id: number; selected: number }[];
    for (const ans of answers) {
      const q = SEED_BY_ID.get(ans.id);
      if (!q) continue;
      const b = buckets.get(q.category) ?? { correct: 0, total: 0 };
      b.total += 1;
      if (ans.selected === q.answer) b.correct += 1;
      buckets.set(q.category, b);
    }
  }

  const stats: CategoryStat[] = Array.from(buckets.entries()).map(
    ([category, b]) => ({
      category,
      correct: b.correct,
      total: b.total,
      accuracy: b.total > 0 ? Math.round((b.correct / b.total) * 100) : 0,
    })
  );
  stats.sort((a, b) => a.accuracy - b.accuracy);
  return stats;
}

export interface DailyCount {
  /** "M/D" 形式のラベル */
  label: string;
  count: number;
}

/**
 * 直近 days 日間の1日あたりの学習回数（TOEIC演習＋英会話添削）を集計する。
 * 生データから render 時に集計するため daily_stats バッチ／Cron は不要。
 * 古い日付→新しい日付の順に days 個返す（演習0の日も0で埋める）。
 */
export async function getDailyActivity(
  supabase: SupabaseServerClient,
  userId: string,
  days = 7
): Promise<DailyCount[]> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  const [toeic, corrections] = await Promise.all([
    supabase
      .from("toeic_attempts")
      .select("created_at")
      .eq("user_id", userId)
      .gte("created_at", start.toISOString()),
    supabase
      .from("corrections")
      .select("created_at")
      .eq("user_id", userId)
      .gte("created_at", start.toISOString()),
  ]);

  const keyOf = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
  const buckets = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    buckets.set(keyOf(d), 0);
  }
  const bump = (iso: string) => {
    const k = keyOf(new Date(iso));
    if (buckets.has(k)) buckets.set(k, (buckets.get(k) ?? 0) + 1);
  };
  for (const r of toeic.data ?? []) bump(r.created_at);
  for (const r of corrections.data ?? []) bump(r.created_at);

  return Array.from(buckets.entries()).map(([label, count]) => ({
    label,
    count,
  }));
}

export interface MistakeStat {
  category: string;
  count: number;
}

/**
 * 英会話添削（corrections.feedback.corrections[].category）を横断集計し、
 * よく指摘される誤りカテゴリを件数の多い順に返す（弱点の可視化）。
 */
export async function getCorrectionMistakeStats(
  supabase: SupabaseServerClient,
  userId: string
): Promise<MistakeStat[]> {
  const { data } = await supabase
    .from("corrections")
    .select("feedback")
    .eq("user_id", userId);

  const buckets = new Map<string, number>();
  for (const row of data ?? []) {
    const fb = row.feedback as { corrections?: { category?: string }[] } | null;
    for (const c of fb?.corrections ?? []) {
      const cat = (c.category && String(c.category)) || "その他";
      buckets.set(cat, (buckets.get(cat) ?? 0) + 1);
    }
  }

  return Array.from(buckets.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * 直近の英会話添削から、実際の誤り例（誤→正）を最大 limit 件取り出す。
 * 復習問題の生成プロンプトに「学習者の実際の落とし穴」として渡す用途。
 */
export async function getRecentMistakeExamples(
  supabase: SupabaseServerClient,
  userId: string,
  limit = 6
): Promise<{ original: string; corrected: string }[]> {
  const { data } = await supabase
    .from("corrections")
    .select("feedback, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  const out: { original: string; corrected: string }[] = [];
  for (const row of data ?? []) {
    const fb = row.feedback as {
      corrections?: { original?: string; corrected?: string }[];
    } | null;
    for (const c of fb?.corrections ?? []) {
      if (c.original && c.corrected) {
        out.push({ original: String(c.original), corrected: String(c.corrected) });
        if (out.length >= limit) return out;
      }
    }
  }
  return out;
}

/** ISO 日時を「MM/DD HH:mm」形式（日本語ロケール）に整形する。 */
export function formatActivityDate(iso: string): string {
  return new Date(iso).toLocaleString("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
