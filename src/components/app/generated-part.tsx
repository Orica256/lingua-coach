"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bookmark, RotateCcw, Sparkles } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PassageQuiz, type GeneratedSet } from "@/components/app/passage-quiz";

type Phase = "intro" | "loading" | "quiz";

const PART_META = {
  6: {
    label: "Part 6",
    name: "長文穴埋め",
    desc: "ビジネス文書の空所に最適な語句を選びます。AI が問題を毎回新しく作成します。",
  },
  7: {
    label: "Part 7",
    name: "読解",
    desc: "文書を読んで内容に関する設問に答えます。AI が問題を毎回新しく作成します。",
  },
} as const;

export function GeneratedPart({ part }: { part: 6 | 7 }) {
  const meta = PART_META[part];
  const [phase, setPhase] = useState<Phase>("intro");
  const [set, setSet] = useState<GeneratedSet | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setPhase("loading");
    setError(null);
    try {
      const res = await fetch("/api/toeic/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ part }),
      });
      const data = (await res.json()) as { set: GeneratedSet; error?: string };
      if (!res.ok) throw new Error(data.error ?? "生成に失敗しました");
      setSet(data.set);
      setPhase("quiz");
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
      setPhase("intro");
    }
  };

  const Header = () => (
    <div className="flex items-center gap-3">
      <Link
        href="/learn/toeic"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        TOEIC
      </Link>
      <span className="text-sm font-medium">
        {meta.label} — {meta.name}
      </span>
    </div>
  );

  if (phase === "intro") {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <Header />
        <Card className="border-0 ring-1 ring-foreground/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-violet-300" />
              <CardTitle className="text-xl">
                {meta.label} {meta.name}
              </CardTitle>
            </div>
            <CardDescription className="text-base">{meta.desc}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={generate} size="lg" className="w-full">
              <Sparkles />
              問題を作る
            </Button>
            <Link
              href="/learn/toeic/saved"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "w-full"
              )}
            >
              <Bookmark className="size-4" />
              保存した問題から選ぶ
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <Header />
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="size-12 animate-spin rounded-full border-4 border-muted border-t-foreground" />
          <p className="text-muted-foreground">問題を作成しています…</p>
        </div>
      </div>
    );
  }

  if (!set) return null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <Header />
      <PassageQuiz
        key={set.passage}
        set={set}
        canSave
        footer={
          <Button onClick={generate} size="lg" className="w-full">
            <RotateCcw />
            新しい問題に挑戦
          </Button>
        }
      />
    </div>
  );
}
