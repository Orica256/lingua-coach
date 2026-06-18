import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { scheduleNext, type ReviewGrade } from "@/lib/srs";
import { touchStreak } from "@/lib/streak";
import { evaluateBadges } from "@/lib/badges";

const GRADES: ReviewGrade[] = ["again", "good", "easy"];

/** 単語カードの復習を1枚採点し、次回の box / due_at を更新する。 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body as { id?: unknown; grade?: unknown };
  const id = typeof b.id === "string" ? b.id : "";
  const grade = b.grade as ReviewGrade;
  if (!id || !GRADES.includes(grade)) {
    return NextResponse.json({ error: "入力が不正です。" }, { status: 400 });
  }

  const admin = createAdminClient();

  // 現在の box を取得（本人のカードのみ）
  const { data: card, error: fetchError } = await admin
    .from("vocab_cards")
    .select("box, reps, lapses")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !card) {
    return NextResponse.json({ error: "カードが見つかりません。" }, { status: 404 });
  }

  const { box, dueAt } = scheduleNext(card.box ?? 0, grade);

  const { error: updateError } = await admin
    .from("vocab_cards")
    .update({
      box,
      due_at: dueAt,
      reps: (card.reps ?? 0) + 1,
      lapses: (card.lapses ?? 0) + (grade === "again" ? 1 : 0),
      last_reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError) {
    console.error("vocab review update failed:", updateError.message);
    return NextResponse.json({ error: "更新に失敗しました。" }, { status: 500 });
  }

  // ストリーク更新＋バッジ判定（非致命的）
  await touchStreak(user.id).catch((e) =>
    console.error("touchStreak failed:", e)
  );
  await evaluateBadges(user.id).catch((e) =>
    console.error("evaluateBadges failed:", e)
  );

  return NextResponse.json({ box, dueAt });
}
