import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, PenLine } from "lucide-react";

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
import {
  getRecentActivity,
  getToeicCategoryStats,
  getCorrectionMistakeStats,
  formatActivityDate,
  type ActivityType,
} from "@/lib/activity";

const TYPE_ICON: Record<ActivityType, typeof BookOpen> = {
  toeic: BookOpen,
  correction: PenLine,
  level_test: GraduationCap,
};

function accuracyColor(accuracy: number): string {
  if (accuracy >= 80) return "bg-emerald-500";
  if (accuracy >= 60) return "bg-yellow-500";
  return "bg-orange-500";
}

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [activity, categoryStats, mistakeStats] = await Promise.all([
    getRecentActivity(supabase, user!.id, 30),
    getToeicCategoryStats(supabase, user!.id),
    getCorrectionMistakeStats(supabase, user!.id),
  ]);

  const mistakeMax = mistakeStats.length > 0 ? mistakeStats[0].count : 1;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">学習履歴</h1>
          <p className="text-sm text-muted-foreground">
            これまでの演習・添削の記録と、弱点の傾向を確認できます。
          </p>
        </div>
        <Link
          href="/learn/review"
          className={cn(buttonVariants(), "h-9 shrink-0 px-4")}
        >
          弱点を復習する
          <ArrowRight />
        </Link>
      </div>

      {/* TOEIC 傾向分析 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">TOEIC Part 5 傾向分析</CardTitle>
          <CardDescription>
            カテゴリ別の正答率です（正答率が低い順）。弱点から復習しましょう。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categoryStats.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-8 text-center">
              <p className="text-sm text-muted-foreground">
                まだ TOEIC の演習データがありません。
              </p>
              <Link
                href="/learn/toeic/part5"
                className={cn(buttonVariants({ variant: "outline" }), "h-9")}
              >
                Part 5 を演習する
                <ArrowRight />
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {categoryStats.map((s) => (
                <div key={s.category} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{s.category}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {s.accuracy}%（{s.correct}/{s.total}）
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        accuracyColor(s.accuracy)
                      )}
                      style={{ width: `${s.accuracy}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 英会話添削の傾向（よく出る誤り） */}
      {mistakeStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">英会話添削の傾向</CardTitle>
            <CardDescription>
              これまでの添削で指摘された誤りのカテゴリ別件数です（多い順）。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {mistakeStats.map((s) => (
                <div key={s.category} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{s.category}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {s.count}件
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-rose-500/70 transition-all"
                      style={{ width: `${(s.count / mistakeMax) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 学習履歴タイムライン */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">最近の記録</CardTitle>
          <CardDescription>直近30件まで表示します。</CardDescription>
        </CardHeader>
        <CardContent>
          {activity.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-10 text-center">
              <p className="text-sm text-muted-foreground">
                まだ学習履歴がありません。
              </p>
              <p className="text-xs text-muted-foreground">
                演習や添削を行うとここに記録されます。
              </p>
            </div>
          ) : (
            <ul className="flex flex-col">
              {activity.map((item) => {
                const Icon = TYPE_ICON[item.type];
                return (
                  <li
                    key={item.key}
                    className="flex items-center gap-3 border-b border-border py-3 last:border-0"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted ring-1 ring-foreground/10">
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {item.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.detail}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {formatActivityDate(item.createdAt)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
