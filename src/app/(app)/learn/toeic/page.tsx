import Link from "next/link";
import { ArrowRight, BookOpen, Headphones, Lock } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const parts = [
  {
    key: "part5",
    href: "/learn/toeic/part5",
    label: "Part 5",
    title: "短文穴埋め（文法・語彙）",
    description: "4択で文法と語彙を鍛える定番パート。今すぐ演習できます。",
    icon: BookOpen,
    available: true,
  },
  {
    key: "part6",
    label: "Part 6",
    title: "長文穴埋め",
    description: "文脈に合う語句・文を選ぶパート。今後追加予定。",
    icon: BookOpen,
    available: false,
  },
  {
    key: "part7",
    label: "Part 7",
    title: "読解",
    description: "パッセージを読んで設問に答えるパート。今後追加予定。",
    icon: BookOpen,
    available: false,
  },
  {
    key: "listening",
    label: "Part 1–4",
    title: "リスニング",
    description: "音声読み上げで擬似的に演習。APIや音声整備後に追加予定。",
    icon: Headphones,
    available: false,
  },
];

export default function ToeicHubPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">TOEIC 学習</h1>
        <p className="text-sm text-muted-foreground">
          パートを選んで演習しましょう。問題はオリジナル作成（公式過去問の転載なし）です。
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {parts.map(({ key, href, label, title, description, icon: Icon, available }) => {
          const inner = (
            <>
              <div className="flex items-center gap-2">
                <span className="grid size-9 place-items-center rounded-lg bg-muted ring-1 ring-foreground/10">
                  <Icon className="size-4" />
                </span>
                <span className="font-mono text-sm font-semibold text-muted-foreground">
                  {label}
                </span>
                {!available && (
                  <Lock className="ml-auto size-3.5 text-muted-foreground" />
                )}
                {available && (
                  <ArrowRight className="ml-auto size-4 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="font-medium">{title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {description}
                </p>
              </div>
            </>
          );

          if (available && href) {
            return (
              <Link
                key={key}
                href={href}
                className="flex flex-col gap-3 rounded-lg border border-border bg-card/30 p-4 transition-colors hover:border-foreground hover:bg-muted/40"
              >
                {inner}
              </Link>
            );
          }

          return (
            <div
              key={key}
              className="flex cursor-not-allowed flex-col gap-3 rounded-lg border border-dashed border-border bg-card/20 p-4 opacity-60"
            >
              {inner}
            </div>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">まずは Part 5 から</CardTitle>
          <CardDescription>
            短文穴埋めで文法・語彙の土台を固めましょう。1問ごとに解説が表示されます。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/learn/toeic/part5"
            className={cn(buttonVariants(), "h-10 px-5 text-base")}
          >
            Part 5 を始める
            <ArrowRight />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
