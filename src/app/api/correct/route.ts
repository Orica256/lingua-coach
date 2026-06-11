import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { correctText } from "@/lib/anthropic";

/** 1ユーザーあたりの1日のリクエスト上限（API濫用・コスト暴走の防止）。 */
const DAILY_LIMIT = 200;
const MAX_TEXT_LENGTH = 2000;
const MAX_SCENE_LENGTH = 100;

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

  const rawText = (body as { text?: unknown }).text;
  const rawScene = (body as { scene?: unknown }).scene;

  if (typeof rawText !== "string" || rawText.trim().length === 0) {
    return NextResponse.json(
      { error: "英文を入力してください。" },
      { status: 400 }
    );
  }
  const text = rawText.trim();
  if (text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      { error: `英文は ${MAX_TEXT_LENGTH} 文字以内で入力してください。` },
      { status: 400 }
    );
  }

  let scene: string | undefined;
  if (typeof rawScene === "string" && rawScene.trim().length > 0) {
    scene = rawScene.trim().slice(0, MAX_SCENE_LENGTH);
  }

  // ── APIキー未設定時のフォールバック ──────────────────
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      {
        error:
          "AI 添削はまだ利用できません（管理者が ANTHROPIC_API_KEY を設定する必要があります）。",
      },
      { status: 503 }
    );
  }

  const admin = createAdminClient();

  // ── レート制限（usage_log ベースの日次カウント） ──────
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
      {
        error: `本日の利用上限（${DAILY_LIMIT}回）に達しました。また明日お試しください。`,
      },
      { status: 429 }
    );
  }

  // ── Claude API 呼び出し ───────────────────────────────
  let correction;
  try {
    correction = await correctText(text, scene);
  } catch (e) {
    console.error("correctText failed:", e);
    return NextResponse.json(
      { error: "添削処理に失敗しました。しばらくして再度お試しください。" },
      { status: 502 }
    );
  }

  const { result, usage, model } = correction;

  // ── 使用量ログ（コスト管理） ─────────────────────────
  await admin.from("usage_log").insert({
    user_id: user.id,
    endpoint: "/api/correct",
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
    model,
  });

  // ── 添削結果の保存（履歴・ダッシュボード用） ─────────
  const { error: insertError } = await admin.from("corrections").insert({
    user_id: user.id,
    scene: scene ?? null,
    original_text: text,
    corrected_text: result.corrected_text,
    naturalness: result.naturalness,
    overall_comment: result.overall_comment,
    feedback: {
      has_errors: result.has_errors,
      corrections: result.corrections,
      better_expression: result.better_expression,
    },
    model,
  });

  if (insertError) {
    // 保存に失敗しても添削結果自体はユーザーに返す（致命的ではない）
    console.error("corrections insert failed:", insertError.message);
  }

  return NextResponse.json(result);
}
