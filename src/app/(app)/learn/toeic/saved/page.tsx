import Link from "next/link";
import { ArrowLeft, ArrowRight, Bookmark } from "lucide-react";

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
import { formatActivityDate } from "@/lib/activity";

interface SavedRow {
  id: string;
  part: number;
  title: string | null;
  questions: unknown;
  created_at: string;
}

export default async function SavedToeicPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("toeic_generated")
    .select("id, part, title, questions, created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const saved = (data ?? []) as SavedRow[];

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link
          href="/learn/toeic"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          TOEIC
        </Link>
        <span className="text-sm font-medium">保存した問題</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">保存した問題</h1>
        <p className="text-sm text-muted-foreground">
          採点後に「この問題を保存」した Part 6/7 をいつでも再演習できます（生成不要・無料）。
        </p>
      </div>

      {saved.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <Bookmark className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              まだ保存した問題がありません。
            </p>
            <p className="text-xs text-muted-foreground">
              Part 6/7 を解いて気に入った問題を「この問題を保存」で追加しましょう。
            </p>
            <Link
              href="/learn/toeic"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              TOEIC へ
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {saved.map((s) => {
            const count = Array.isArray(s.questions) ? s.questions.length : 0;
            return (
              <Link
                key={s.id}
                href={`/learn/toeic/saved/${s.id}`}
                className="flex items-center gap-3 rounded-lg border border-border bg-card/30 p-4 transition-colors hover:border-foreground hover:bg-muted/40"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted font-mono text-xs font-semibold">
                  P{s.part}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {s.title || `Part ${s.part} の問題`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {count}問 ・ {formatActivityDate(s.created_at)}
                  </p>
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            );
          })}
        </div>
      )}

      {saved.length === 0 ? null : (
        <Card className="border-0 bg-muted/30">
          <CardHeader>
            <CardTitle className="text-sm">ヒント</CardTitle>
            <CardDescription>
              保存問題は何度でも無料で解けます。新しい傾向の問題が欲しいときは TOEIC ハブから「問題を作る」で生成してください。
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
