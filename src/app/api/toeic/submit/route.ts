import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { TOEIC_PART5_SEED } from "@/data/toeic-part5-seed";
import { touchStreak } from "@/lib/streak";
import { evaluateBadges } from "@/lib/badges";

/** id → 正解インデックスの早見表（サーバー側採点用） */
const ANSWER_BY_ID = new Map(
  TOEIC_PART5_SEED.map((q) => [q.id, q.answer] as const)
);

interface SubmittedAnswer {
  id: number;
  selected: number;
}

export async function POST(request: Request) {
  // ── 認証 ──────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── 入力バリデーション ────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const rawAnswers = (body as { answers?: unknown }).answers;
  if (!Array.isArray(rawAnswers) || rawAnswers.length === 0) {
    return NextResponse.json({ error: "Invalid answers" }, { status: 400 });
  }

  const answers: SubmittedAnswer[] = [];
  for (const a of rawAnswers) {
    const id = (a as { id?: unknown }).id;
    const selected = (a as { selected?: unknown }).selected;
    if (
      typeof id !== "number" ||
      !ANSWER_BY_ID.has(id) ||
      typeof selected !== "number" ||
      selected < 0 ||
      selected > 3
    ) {
      return NextResponse.json({ error: "Invalid answers" }, { status: 400 });
    }
    answers.push({ id, selected });
  }

  // ── サーバー側で採点（クライアントの自己申告を信用しない） ──
  const total = answers.length;
  const correct = answers.reduce(
    (acc, a) => acc + (ANSWER_BY_ID.get(a.id) === a.selected ? 1 : 0),
    0
  );

  // ── 履歴を保存（RLS の insert ポリシーで本人のみ） ────
  const { error: insertError } = await supabase.from("toeic_attempts").insert({
    user_id: user.id,
    part: 5,
    total,
    correct,
    answers,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // ストリーク更新＋バッジ判定（非致命的）
  await touchStreak(user.id).catch((e) =>
    console.error("touchStreak failed:", e)
  );
  await evaluateBadges(user.id).catch((e) =>
    console.error("evaluateBadges failed:", e)
  );

  return NextResponse.json({ total, correct });
}
