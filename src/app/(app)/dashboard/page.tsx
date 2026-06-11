import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Flame,
  GraduationCap,
  PenLine,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 自分のプロフィールと添削回数を取得（RLS により本人の行のみ返る）
  const [{ data: profile }, { count: correctionCount }] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, cefr_level, streak_days")
      .eq("id", user!.id)
      .single(),
    supabase
      .from("corrections")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user!.id),
  ]);

  const greetingName =
    profile?.display_name || user?.email?.split("@")[0] || "ゲスト";
  const level = profile?.cefr_level ?? null;
  const streak = profile?.streak_days ?? 0;

  const stats = [
    { label: "連続学習", value: String(streak), unit: "日", icon: Flame },
    {
      label: "添削回数",
      value: String(correctionCount ?? 0),
      unit: "回",
      icon: CheckCircle2,
    },
    { label: "学習時間", value: "0", unit: "分", icon: BarChart3 },
  ];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          こんにちは、{greetingName} さん
        </h1>
        <p className="text-sm text-muted-foreground">
          今日も英語の練習を始めましょう。
        </p>
      </div>

      {/* レベル判定の案内 / 判定済みならレベル表示（Phase 2 で判定機能を実装） */}
      {level ? (
        <Card className="border-0 bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-transparent ring-1 ring-foreground/10">
          <CardContent className="flex items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-background ring-1 ring-foreground/10">
              <GraduationCap className="size-5" />
            </div>
            <div>
              <p className="font-medium">
                あなたのレベル: <span className="font-mono">{level}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                このレベルに合わせて学習を最適化します。
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 bg-gradient-to-r from-indigo-500/15 via-violet-500/10 to-transparent ring-1 ring-foreground/10">
          <CardContent className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-background ring-1 ring-foreground/10">
                <GraduationCap className="size-5" />
              </div>
              <div>
                <p className="font-medium">まずはレベル判定から</p>
                <p className="text-sm text-muted-foreground">
                  20問の選択式クイズであなたの CEFR レベルを判定します。
                </p>
              </div>
            </div>
            <Link
              href="/onboarding"
              className={cn(buttonVariants(), "h-9 shrink-0 px-4")}
            >
              判定を始める
              <ArrowRight />
            </Link>
          </CardContent>
        </Card>
      )}

      {/* 統計サマリー（添削回数・学習時間は Phase 4 で接続） */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, unit, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4">
              <div className="grid size-10 place-items-center rounded-lg bg-muted">
                <Icon className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold tabular-nums">
                  {value}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    {unit}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 学習スタート */}
      <Card>
        <CardHeader>
          <CardTitle>学習を始める</CardTitle>
          <CardDescription>
            英会話の添削、または TOEIC の問題演習から選べます。
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/learn/typing"
            className={cn(buttonVariants(), "h-10 px-5 text-base")}
          >
            <PenLine />
            英会話添削を始める
          </Link>
          <Link
            href="/learn/toeic"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-10 px-5 text-base"
            )}
          >
            <BookOpen />
            TOEIC 学習を始める
          </Link>
        </CardContent>
      </Card>

      {/* 直近のアクティビティ（Phase 4 で実装） */}
      <Card>
        <CardHeader>
          <CardTitle>最近の学習</CardTitle>
          <CardDescription>学習履歴がここに表示されます。</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-10 text-center">
            <p className="text-sm text-muted-foreground">
              まだ学習履歴がありません。
            </p>
            <p className="text-xs text-muted-foreground">
              最初の添削を行うとここに記録されます。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
