import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getToeicCategoryStats,
  getCorrectionMistakeStats,
  getRecentMistakeExamples,
} from "@/lib/activity";
import { generateReviewQuestions } from "@/lib/review";

const DAILY_LIMIT = 200;
const QUESTION_COUNT = 5;

export async function POST() {
  // ── 認証 ──────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 復習問題の生成は Gemini を使うため GEMINI_API_KEY が必須
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      {
        error:
          "復習問題の生成はまだ利用できません（管理者が GEMINI_API_KEY を設定する必要があります）。",
      },
      { status: 503 }
    );
  }

  const admin = createAdminClient();

  // ── レート制限（usage_log ベースの日次カウント・添削と共有） ──
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const { count, error: countError } = await admin
    .from("usage_log")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", startOfDay.toISOString());

  if (countError) {
    console.error("usage_log count failed:", countError);
    return NextResponse.json(
      { error: `レート制限の確認に失敗: ${countError.message}` },
      { status: 500 }
    );
  }
  if ((count ?? 0) >= DAILY_LIMIT) {
    return NextResponse.json(
      {
        error: `本日の利用上限（${DAILY_LIMIT}回）に達しました。また明日お試しください。`,
      },
      { status: 429 }
    );
  }

  // ── 弱点を収集（TOEIC低正答率 + 添削で多い誤り + 実際の誤り例） ──
  const [toeicStats, mistakeStats, mistakeExamples] = await Promise.all([
    getToeicCategoryStats(supabase, user.id),
    getCorrectionMistakeStats(supabase, user.id),
    getRecentMistakeExamples(supabase, user.id, 6),
  ]);

  const weakToeic = toeicStats
    .filter((s) => s.accuracy < 80)
    .slice(0, 3)
    .map((s) => s.category);
  const topMistakes = mistakeStats.slice(0, 3).map((s) => s.category);
  const weakCategories = Array.from(new Set([...weakToeic, ...topMistakes]));

  // ── Gemini で復習問題を生成 ───────────────────────────
  let generated;
  try {
    generated = await generateReviewQuestions({
      weakCategories,
      mistakeExamples,
      count: QUESTION_COUNT,
    });
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    console.error("generateReviewQuestions failed:", e);
    return NextResponse.json(
      { error: `復習問題の生成に失敗しました: ${detail}` },
      { status: 502 }
    );
  }

  // ── 使用量ログ（コスト管理・添削と同じ usage_log） ─────
  try {
    const { error: usageError } = await admin.from("usage_log").insert({
      user_id: user.id,
      endpoint: "/api/review/generate",
      input_tokens: generated.usage.input_tokens,
      output_tokens: generated.usage.output_tokens,
      model: generated.model,
    });
    if (usageError) console.error("usage_log insert failed:", usageError.message);
  } catch (e) {
    console.error("usage_log insert で例外:", e);
  }

  return NextResponse.json({
    questions: generated.questions,
    weakCategories,
  });
}
