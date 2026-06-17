import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { touchStreak } from "@/lib/streak";
import { evaluateBadges } from "@/lib/badges";

/**
 * 生成系（Part 6/7）の演習結果を記録する。
 * 問題は AI 生成のためサーバーで再採点できない → クライアント集計の total/correct を信頼して保存。
 * （成績の厳密性より進捗トラッキング＝ストリーク/グラフ反映が目的）
 */
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
  const b = body as { part?: unknown; total?: unknown; correct?: unknown };
  const part = b.part;
  const total = b.total;
  const correct = b.correct;
  if (
    (part !== 6 && part !== 7) ||
    typeof total !== "number" ||
    typeof correct !== "number" ||
    total <= 0 ||
    correct < 0 ||
    correct > total
  ) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { error } = await supabase.from("toeic_attempts").insert({
    user_id: user.id,
    part,
    total,
    correct,
    answers: null,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await touchStreak(user.id).catch((e) =>
    console.error("touchStreak failed:", e)
  );
  await evaluateBadges(user.id).catch((e) =>
    console.error("evaluateBadges failed:", e)
  );

  return NextResponse.json({ ok: true });
}
