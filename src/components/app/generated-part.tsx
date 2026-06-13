"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, RotateCcw, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const OPTION_LABELS = ["A", "B", "C", "D"] as const;

interface GenQuestion {
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
}
interface GeneratedSet {
  part: 6 | 7;
  title: string;
  passage: string;
  questions: GenQuestion[];
}

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

  // 解答状態
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [graded, setGraded] = useState(false);

  const generate = async () => {
    setPhase("loading");
    setError(null);
    setGraded(false);
    try {
      const res = await fetch("/api/toeic/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ part }),
      });
      const data = (await res.json()) as { set: GeneratedSet; error?: string };
      if (!res.ok) throw new Error(data.error ?? "生成に失敗しました");
      setSet(data.set);
      setAnswers(new Array(data.set.questions.length).fill(null));
      setPhase("quiz");
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
      setPhase("intro");
    }
  };

  const select = (qi: number, oi: number) => {
    if (graded) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[qi] = oi;
      return next;
    });
  };

  const allAnswered = set ? answers.every((a) => a !== null) : false;
  const correctCount = set
    ? set.questions.reduce(
        (acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0),
        0
      )
    : 0;

  const grade = async () => {
    if (!set || !allAnswered) return;
    setGraded(true);
    // 進捗記録（ストリーク・グラフ反映用・失敗は無視）
    try {
      await fetch("/api/toeic/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          part,
          total: set.questions.length,
          correct: set.questions.reduce(
            (acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0),
            0
          ),
        }),
      });
    } catch {
      // 記録失敗は致命的でない
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
          <CardContent className="flex flex-col gap-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={generate} size="lg" className="w-full">
              <Sparkles />
              問題を作る
            </Button>
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

  const accuracy = Math.round((correctCount / set.questions.length) * 100);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <Header />

      {/* 本文 */}
      <Card className="border-0 ring-1 ring-foreground/10">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {set.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-relaxed sm:text-base">
            {set.passage}
          </p>
        </CardContent>
      </Card>

      {/* 設問 */}
      {set.questions.map((q, qi) => (
        <Card key={qi} className="border-0 ring-1 ring-foreground/10">
          <CardContent className="flex flex-col gap-3 py-4">
            <p className="font-medium">
              {part === 6 ? `${q.prompt}` : `${qi + 1}. ${q.prompt}`}
            </p>
            <div className="grid grid-cols-1 gap-2">
              {q.options.map((opt, oi) => {
                const picked = answers[qi] === oi;
                const isCorrect = oi === q.answer;
                let state = picked
                  ? "border-foreground bg-foreground/10"
                  : "border-border hover:bg-muted/50";
                if (graded) {
                  if (isCorrect) state = "border-emerald-500/60 bg-emerald-500/10";
                  else if (picked) state = "border-rose-500/60 bg-rose-500/10";
                  else state = "border-border opacity-60";
                }
                return (
                  <button
                    key={oi}
                    onClick={() => select(qi, oi)}
                    disabled={graded}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors disabled:cursor-default",
                      state
                    )}
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted font-mono text-xs font-semibold">
                      {OPTION_LABELS[oi]}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {graded && isCorrect && (
                      <Check className="size-4 text-emerald-400" />
                    )}
                    {graded && picked && !isCorrect && (
                      <X className="size-4 text-rose-400" />
                    )}
                  </button>
                );
              })}
            </div>
            {graded && q.explanation && (
              <div className="rounded-lg bg-muted/40 p-3 text-sm leading-relaxed">
                <span className="text-xs font-medium text-muted-foreground">
                  解説：
                </span>
                {q.explanation}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* 採点 / 結果 */}
      {!graded ? (
        <Button onClick={grade} disabled={!allAnswered} size="lg" className="w-full">
          採点する
        </Button>
      ) : (
        <Card className="border-0 ring-1 ring-foreground/10">
          <CardContent className="flex flex-col items-center gap-3 py-5">
            <p className="text-sm text-muted-foreground">正答率</p>
            <p
              className={cn(
                "font-mono text-4xl font-bold",
                accuracy >= 80
                  ? "text-emerald-400"
                  : accuracy >= 60
                    ? "text-yellow-400"
                    : "text-orange-400"
              )}
            >
              {accuracy}
              <span className="text-xl">%</span>
            </p>
            <p className="text-sm tabular-nums">
              {correctCount} / {set.questions.length} 問正解
            </p>
            <Button onClick={generate} size="lg" className="w-full">
              <RotateCcw />
              新しい問題に挑戦
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
