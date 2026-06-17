"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Home,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const OPTION_LABELS = ["A", "B", "C", "D"] as const;

interface ReviewQuestion {
  question: string;
  options: string[];
  answer: number;
  category: string;
  explanation: string;
}

type Phase = "intro" | "loading" | "quiz" | "result";

export default function ReviewPage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [questions, setQuestions] = useState<ReviewQuestion[]>([]);
  const [weakCategories, setWeakCategories] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setPhase("loading");
    setError(null);
    try {
      const res = await fetch("/api/review/generate", { method: "POST" });
      const data = (await res.json()) as {
        questions: ReviewQuestion[];
        weakCategories: string[];
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "生成に失敗しました");
      setQuestions(data.questions);
      setWeakCategories(data.weakCategories ?? []);
      setIndex(0);
      setSelected(null);
      setRevealed(false);
      setCorrectCount(0);
      setPhase("quiz");
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
      setPhase("intro");
    }
  };

  // ── イントロ ──────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <Header />
        <Card className="border-0 ring-1 ring-foreground/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-violet-300" />
              <CardTitle className="text-xl">弱点復習</CardTitle>
            </div>
            <CardDescription className="text-base">
              これまでの TOEIC 演習や英会話添削の弱点をもとに、AI があなた専用の復習問題（4択）を作ります。
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>• 苦手カテゴリ・過去の誤りに合わせて毎回新しく出題</li>
              <li>• 全5問・1問ごとに即時解説</li>
              <li>• 履歴が少なくても基礎の良問を出します</li>
            </ul>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={generate} size="lg" className="w-full">
              <Sparkles />
              復習問題を作る
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── 生成中 ────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <Header />
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="size-12 animate-spin rounded-full border-4 border-muted border-t-foreground" />
          <p className="text-muted-foreground">
            あなたの弱点から復習問題を作成しています…
          </p>
        </div>
      </div>
    );
  }

  // ── 結果 ──────────────────────────────────────────────
  if (phase === "result") {
    const total = questions.length;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const scoreColor =
      accuracy >= 80
        ? "text-emerald-400"
        : accuracy >= 60
          ? "text-yellow-400"
          : "text-orange-400";
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-5">
        <Header />
        <Card className="border-0 ring-1 ring-foreground/10">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">復習結果</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className={cn("font-mono text-6xl font-bold", scoreColor)}>
              {accuracy}
              <span className="text-2xl">%</span>
            </p>
            <p className="text-lg font-semibold tabular-nums">
              {correctCount} / {total} 問正解
            </p>
            <p className="text-center text-sm text-muted-foreground">
              間違えた問題の解説をもう一度確認しましょう。新しい問題に挑戦もできます。
            </p>
            <div className="flex w-full flex-col gap-2 sm:flex-row">
              <Button onClick={generate} size="lg" className="flex-1">
                <RotateCcw />
                新しい問題で復習
              </Button>
              <Link
                href="/history"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "flex-1"
                )}
              >
                傾向を見る
              </Link>
            </div>
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ variant: "ghost", size: "lg" }),
                "w-full"
              )}
            >
              <Home className="size-4" />
              ホームへ戻る
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── クイズ ────────────────────────────────────────────
  const q = questions[index];
  const isLast = index === questions.length - 1;
  const progress = (index / questions.length) * 100;

  const choose = (i: number) => {
    if (revealed) return;
    setSelected(i);
    setRevealed(true);
    if (i === q.answer) setCorrectCount((c) => c + 1);
  };

  const next = () => {
    if (!revealed) return;
    if (!isLast) {
      setIndex((p) => p + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      setPhase("result");
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Header />

      {weakCategories.length > 0 && (
        <p className="text-xs text-muted-foreground">
          弱点フォーカス: {weakCategories.join(" / ")}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-sm text-muted-foreground">
          問題 {index + 1} / {questions.length}
        </span>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-foreground transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Card className="border-0 ring-1 ring-foreground/10">
        <CardContent className="py-6">
          <span className="mb-2 inline-block rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {q.category}
          </span>
          <p className="text-lg font-medium leading-relaxed">{q.question}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3">
        {q.options.map((opt, i) => {
          const isCorrect = i === q.answer;
          const isPicked = selected === i;
          let state = "border-border hover:bg-muted/50";
          if (revealed) {
            if (isCorrect) state = "border-emerald-500/60 bg-emerald-500/10";
            else if (isPicked) state = "border-rose-500/60 bg-rose-500/10";
            else state = "border-border opacity-60";
          }
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={revealed}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3.5 text-left transition-colors disabled:cursor-default",
                state
              )}
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted font-mono text-xs font-semibold">
                {OPTION_LABELS[i]}
              </span>
              <span className="flex-1 text-sm">{opt}</span>
              {revealed && isCorrect && (
                <Check className="size-4 text-emerald-400" />
              )}
              {revealed && isPicked && !isCorrect && (
                <X className="size-4 text-rose-400" />
              )}
            </button>
          );
        })}
      </div>

      {revealed && (
        <Card className="border-0 bg-muted/40 ring-1 ring-foreground/10">
          <CardContent className="py-4">
            <p className="mb-1 text-xs font-medium text-muted-foreground">解説</p>
            <p className="text-sm leading-relaxed">{q.explanation}</p>
          </CardContent>
        </Card>
      )}

      <Button onClick={next} disabled={!revealed} size="lg" className="w-full">
        {isLast ? "結果を見る" : "次の問題"}
        <ArrowRight />
      </Button>
    </div>
  );
}

function Header() {
  return (
    <div className="flex items-center gap-3">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        ダッシュボード
      </Link>
      <span className="text-sm font-medium">弱点復習</span>
    </div>
  );
}
