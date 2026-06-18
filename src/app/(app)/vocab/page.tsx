import Link from "next/link";
import { ArrowRight, BookMarked } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { getRecentMistakeExamples } from "@/lib/activity";
import { VocabManager, type VocabCard } from "@/components/app/vocab-manager";

export default async function VocabPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const nowIso = new Date().toISOString();

  const [cardsRes, dueRes, suggestions] = await Promise.all([
    supabase
      .from("vocab_cards")
      .select("id, term, meaning, example, box, due_at, created_at")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("vocab_cards")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user!.id)
      .lte("due_at", nowIso),
    getRecentMistakeExamples(supabase, user!.id, 6),
  ]);

  const cards = (cardsRes.data ?? []) as VocabCard[];
  const dueCount = dueRes.count ?? 0;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">単語帳</h1>
          <p className="text-sm text-muted-foreground">
            覚えたい単語・表現を登録して、スペース反復（忘れた頃に再出題）で定着させます。
          </p>
        </div>
      </div>

      {/* 今日の復習 */}
      <Card className="border-0 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent ring-1 ring-foreground/10">
        <CardContent className="flex flex-col items-start justify-between gap-4 py-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30">
              <BookMarked className="size-5" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">今日の復習</p>
              <p className="text-lg font-semibold">
                <span className="font-mono text-2xl tabular-nums">{dueCount}</span>{" "}
                枚が復習待ち
              </p>
              <p className="text-xs text-muted-foreground">
                登録カード合計 {cards.length} 枚
              </p>
            </div>
          </div>
          {dueCount > 0 ? (
            <Link
              href="/vocab/review"
              className={cn(buttonVariants(), "h-10 shrink-0 px-5")}
            >
              復習を始める
              <ArrowRight />
            </Link>
          ) : (
            <p className="text-xs text-muted-foreground">
              いまは復習待ちのカードはありません 🎉
            </p>
          )}
        </CardContent>
      </Card>

      <VocabManager initialCards={cards} suggestions={suggestions} />

      <Card className="border-0 bg-muted/30">
        <CardHeader>
          <CardTitle className="text-sm">スペース反復のしくみ</CardTitle>
          <CardDescription>
            復習で「覚えた」を選ぶほど次の出題までの間隔が延び（1日→3日→7日→…）、「まだ」を選ぶと最初に戻ります。忘れそうな頃に出題されるので効率よく定着します。
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
