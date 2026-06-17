import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { BADGE_DEFS, evaluateBadges } from "@/lib/badges";
import { formatActivityDate } from "@/lib/activity";

export default async function BadgesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 表示時に条件を満たした未獲得バッジを付与し、獲得状況を取得
  const earned = await evaluateBadges(user!.id);
  const earnedCount = BADGE_DEFS.filter((d) => earned.has(d.key)).length;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">バッジ</h1>
        <p className="text-sm text-muted-foreground">
          学習の節目で獲得できます。獲得済み {earnedCount} / {BADGE_DEFS.length}。
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {BADGE_DEFS.map(({ key, name, description, icon: Icon }) => {
          const earnedAt = earned.get(key);
          const isEarned = Boolean(earnedAt);
          return (
            <Card
              key={key}
              className={cn(
                "border-0 ring-1",
                isEarned
                  ? "bg-gradient-to-br from-amber-500/10 to-transparent ring-amber-500/30"
                  : "ring-foreground/10 opacity-70"
              )}
            >
              <CardContent className="flex items-start gap-3 py-4">
                <div
                  className={cn(
                    "grid size-11 shrink-0 place-items-center rounded-xl ring-1",
                    isEarned
                      ? "bg-amber-500/15 text-amber-300 ring-amber-500/30"
                      : "bg-muted text-muted-foreground ring-foreground/10"
                  )}
                >
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{name}</p>
                  <p className="text-sm text-muted-foreground">{description}</p>
                  {isEarned ? (
                    <p className="mt-1 text-xs text-amber-300/80">
                      獲得: {formatActivityDate(earnedAt!)}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-muted-foreground">未獲得</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-0 bg-muted/30">
        <CardHeader>
          <CardTitle className="text-sm">ヒント</CardTitle>
          <CardDescription>
            添削・TOEIC 演習・連続学習を続けると自動でバッジが増えます。条件を満たすと学習直後に獲得されます。
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
