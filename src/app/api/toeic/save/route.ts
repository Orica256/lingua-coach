import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/** AI 生成した Part 6/7 のセットを個人バンク（toeic_generated）に保存する。 */
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

  const b = body as {
    part?: unknown;
    title?: unknown;
    passage?: unknown;
    questions?: unknown;
  };

  if (
    (b.part !== 6 && b.part !== 7) ||
    typeof b.passage !== "string" ||
    b.passage.trim().length === 0 ||
    !Array.isArray(b.questions) ||
    b.questions.length === 0
  ) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("toeic_generated")
    .insert({
      user_id: user.id,
      part: b.part,
      title: typeof b.title === "string" ? b.title : null,
      passage: b.passage,
      questions: b.questions,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
