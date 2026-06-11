import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { QUESTIONS, scoreToCefr } from "@/data/level-quiz";

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

  const rawAnswers = (body as { answers?: unknown }).answers;
  if (
    !Array.isArray(rawAnswers) ||
    rawAnswers.length !== QUESTIONS.length ||
    !rawAnswers.every((a) => typeof a === "number" && a >= 0 && a <= 3)
  ) {
    return NextResponse.json({ error: "Invalid answers" }, { status: 400 });
  }

  const answers = rawAnswers as number[];
  const score = QUESTIONS.reduce(
    (acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0),
    0
  );
  const cefrLevel = scoreToCefr(score);

  const { error: insertError } = await supabase.from("level_tests").insert({
    user_id: user.id,
    score,
    cefr_level: cefrLevel,
    answers,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ cefr_level: cefrLevel })
    .eq("id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ score, cefr_level: cefrLevel });
}
