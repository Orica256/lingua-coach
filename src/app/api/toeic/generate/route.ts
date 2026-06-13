import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generatePart6, generatePart7 } from "@/lib/toeic-generate";

const DAILY_LIMIT = 200;

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
  const part = (body as { part?: unknown }).part;
  if (part !== 6 && part !== 7) {
    return NextResponse.json({ error: "part は 6 または 7" }, { status: 400 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      {
        error:
          "問題の生成はまだ利用できません（管理者が GEMINI_API_KEY を設定する必要があります）。",
      },
      { status: 503 }
    );
  }

  const admin = createAdminClient();

  // レート制限（usage_log・他機能と共有の日次カウント）
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const { count, error: countError } = await admin
    .from("usage_log")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", startOfDay.toISOString());
  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }
  if ((count ?? 0) >= DAILY_LIMIT) {
    return NextResponse.json(
      { error: `本日の利用上限（${DAILY_LIMIT}回）に達しました。` },
      { status: 429 }
    );
  }

  let generated;
  try {
    generated = part === 6 ? await generatePart6() : await generatePart7();
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    console.error("toeic generate failed:", e);
    return NextResponse.json(
      { error: `問題の生成に失敗しました: ${detail}` },
      { status: 502 }
    );
  }

  try {
    await admin.from("usage_log").insert({
      user_id: user.id,
      endpoint: `/api/toeic/generate?part=${part}`,
      input_tokens: generated.usage.input_tokens,
      output_tokens: generated.usage.output_tokens,
      model: generated.model,
    });
  } catch (e) {
    console.error("usage_log insert failed:", e);
  }

  return NextResponse.json({ set: generated.set });
}
