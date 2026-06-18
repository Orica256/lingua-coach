// 単語帳のスペース反復（SRS）ロジック。
// 実装は Leitner 方式（box 0〜5）。box が上がるほど次回復習までの間隔が延びる。
// 副作用の無い純粋関数として切り出し、API・テストの両方から使えるようにする。

/** box 0〜5 に対応する「次回復習までの日数」。box が高いほど間隔が長い。 */
export const BOX_INTERVALS_DAYS = [0, 1, 3, 7, 16, 35] as const;

/** 最大 box。これ以上は上がらない（十分に定着したカード）。 */
export const MAX_BOX = BOX_INTERVALS_DAYS.length - 1; // = 5

/** 復習時の自己評価。 */
export type ReviewGrade = "again" | "good" | "easy";

export interface ScheduleResult {
  /** 更新後の box（0〜MAX_BOX） */
  box: number;
  /** 次に復習する日時（ISO 文字列） */
  dueAt: string;
}

function clampBox(box: number): number {
  if (!Number.isFinite(box)) return 0;
  return Math.max(0, Math.min(MAX_BOX, Math.round(box)));
}

/**
 * 現在の box と自己評価から、次の box と復習日時を決める。
 * - again: 振り出し（box 0）に戻し、当日中に再度出題する。
 * - good : box を 1 つ上げる。
 * - easy : box を 2 つ上げる（既に定着しているカードを早く間引く）。
 */
export function scheduleNext(
  currentBox: number,
  grade: ReviewGrade,
  now: Date = new Date()
): ScheduleResult {
  const box = clampBox(currentBox);

  let nextBox: number;
  if (grade === "again") nextBox = 0;
  else if (grade === "easy") nextBox = Math.min(box + 2, MAX_BOX);
  else nextBox = Math.min(box + 1, MAX_BOX);

  const days = BOX_INTERVALS_DAYS[nextBox];
  const due = new Date(now.getTime());
  due.setDate(due.getDate() + days);

  return { box: nextBox, dueAt: due.toISOString() };
}

/** カードが現時点で復習対象（due_at <= now）かどうか。 */
export function isDue(dueAt: string, now: Date = new Date()): boolean {
  return new Date(dueAt).getTime() <= now.getTime();
}
