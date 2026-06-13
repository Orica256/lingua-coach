import { createAdminClient } from "@/lib/supabase/admin";

/** 指定日時の「日付」を JST（Asia/Tokyo）の YYYY-MM-DD で返す（サーバーTZに依存しない）。 */
function jstDayKey(d: Date): string {
  return d.toLocaleDateString("en-CA", { timeZone: "Asia/Tokyo" });
}

/**
 * 学習アクティビティ時にストリーク（連続学習日数）を更新する。
 * - 同じ日に複数回学習しても二重カウントしない。
 * - 前日に学習していれば +1、間が空いていれば 1 にリセット。
 *
 * 非致命的: 失敗してもアクティビティ自体は成功扱いにすること（呼び出し側で catch）。
 * 書き込みは service_role（admin）で行う。
 */
export async function touchStreak(userId: string): Promise<void> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("streak_days, last_active_at")
    .eq("id", userId)
    .single();

  const now = new Date();
  const todayKey = jstDayKey(now);
  const lastKey = data?.last_active_at
    ? jstDayKey(new Date(data.last_active_at))
    : null;

  if (lastKey === todayKey) return; // 本日は既にカウント済み

  const yesterdayKey = jstDayKey(new Date(now.getTime() - 86_400_000));
  const newStreak = lastKey === yesterdayKey ? (data?.streak_days ?? 0) + 1 : 1;

  await admin
    .from("profiles")
    .update({ streak_days: newStreak, last_active_at: now.toISOString() })
    .eq("id", userId);
}

/**
 * 表示用の現在ストリーク。
 * 最終学習が「今日」か「昨日」なら streak_days を、それ以外（途切れ）は 0 を返す。
 * （streak_days はアクティビティ時のみ更新されるため、途切れの判定を表示側で行う）
 */
export function currentStreak(
  streakDays: number | null | undefined,
  lastActiveAt: string | null | undefined
): number {
  if (!lastActiveAt) return 0;
  const now = new Date();
  const todayKey = jstDayKey(now);
  const yesterdayKey = jstDayKey(new Date(now.getTime() - 86_400_000));
  const lastKey = jstDayKey(new Date(lastActiveAt));
  return lastKey === todayKey || lastKey === yesterdayKey
    ? streakDays ?? 0
    : 0;
}
