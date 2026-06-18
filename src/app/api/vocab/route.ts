import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { evaluateBadges } from "@/lib/badges";

const MAX_TERM = 200;
const MAX_MEANING = 500;
const MAX_EXAMPLE = 500;
/** 1ユーザーあたりの単語カード上限（DB肥大・濫用の防止）。 */
const MAX_CARDS = 2000;

/** 単語カードを新規作成する。 */
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

  const b = body as { term?: unknown; meaning?: unknown; example?: unknown; source?: unknown };
  const term = typeof b.term === "string" ? b.term.trim() : "";
  const meaning = typeof b.meaning === "string" ? b.meaning.trim() : "";
  const example =
    typeof b.example === "string" && b.example.trim().length > 0
      ? b.example.trim().slice(0, MAX_EXAMPLE)
      : null;
  const source = b.source === "correction" ? "correction" : "manual";

  if (!term) {
    return NextResponse.json({ error: "単語・表現を入力してください。" }, { status: 400 });
  }
  if (!meaning) {
    return NextResponse.json({ error: "意味を入力してください。" }, { status: 400 });
  }
  if (term.length > MAX_TERM || meaning.length > MAX_MEANING) {
    return NextResponse.json({ error: "入力が長すぎます。" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { count } = await admin
    .from("vocab_cards")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);
  if ((count ?? 0) >= MAX_CARDS) {
    return NextResponse.json(
      { error: `単語カードの上限（${MAX_CARDS}枚）に達しました。` },
      { status: 429 }
    );
  }

  const { data, error } = await admin
    .from("vocab_cards")
    .insert({ user_id: user.id, term, meaning, example, source })
    .select("id, term, meaning, example, box, due_at, created_at")
    .single();

  if (error) {
    console.error("vocab insert failed:", error.message);
    return NextResponse.json({ error: "保存に失敗しました。" }, { status: 500 });
  }

  // バッジ判定（単語帳デビューなど・非致命的）
  await evaluateBadges(user.id).catch((e) =>
    console.error("evaluateBadges failed:", e)
  );

  return NextResponse.json({ card: data });
}

/** 単語カードを削除する。 */
export async function DELETE(request: Request) {
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

  const id = (body as { id?: unknown }).id;
  if (typeof id !== "string" || !id) {
    return NextResponse.json({ error: "id がありません。" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("vocab_cards")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("vocab delete failed:", error.message);
    return NextResponse.json({ error: "削除に失敗しました。" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
