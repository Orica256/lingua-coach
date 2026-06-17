"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Home,
  RotateCcw,
  X,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  TOEIC_PART5_SEED,
  accuracyToComment,
  type ToeicQuestion,
} from "@/data/toeic-part5-seed";

const QUESTIONS_PER_SESSION = 10;
const OPTION_LABELS = ["A", "B", "C", "D"] as const;

type Phase = "quiz" | "submitting" | "result";

interface Answer {
  id: number;
  selected: number;
}

function pickRandom(pool: ToeicQuestion[], n: number): ToeicQuestion[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, pool.length));
}

export default function ToeicPart5Page() {
  const [questions, setQuestions] = useState<ToeicQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [phase, setPhase] = useState<Phase>("quiz");
  const [result, setResult] = useState<{ total: number; correct: number } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // 出題はクライアントマウント後に確定（ハイドレーション不整合を避ける）
  useEffect(() => {
    setQuestions(pickRandom(TOEIC_PART5_SEED, QUESTIONS_PER_SESSION));
  }, []);

  const restart = () => {
    setQuestions(pickRandom(TOEIC_PART5_SEED, QUESTIONS_PER_SESSION));
    setIndex(0);
    setSelected(null);
    setRevealed(false);
    setAnswers([]);
    setResult(null);
    setError(null);
    setPhase("quiz");
  };

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="size-10 animate-spin rounded-full border-4 border-muted border-t-foreground" />
        <p className="text-muted-foreground">問題を準備しています…</p>
      </div>
    );
  }

  // ── 結果画面 ──────────────────────────────────────────
  if (phase === "result") {
    return (
      <ResultView
        questions={questions}
        answers={answers}
        result={result}
        error={error}
        onRestart={restart}
      />
    );
  }

  const question = questions[index];
  const isLast = index === questions.length - 1;
  const progress = (index / questions.length) * 100;

  const choose = (i: number) => {
    if (revealed) return;
    setSelected(i);
    setRevealed(true);
    setAnswers((prev) => [...prev, { id: question.id, selected: i }]);
  };

  const next = async () => {
    if (!revealed) return;
    if (!isLast) {
      setIndex((p) => p + 1);
      setSelected(null);
      setRevealed(false);
      return;
    }
    // 最終問題 → 採点
    setPhase("submitting");
    try {
      const res = await fetch("/api/toeic/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = (await res.json()) as {
        total: number;
        correct: number;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "採点に失敗しました");
      setResult({ total: data.total, correct: data.correct });
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setPhase("result");
    }
  };

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
        <span className="text-sm font-medium">Part 5 — 文法・語彙</span>
      </div>

      {/* プログレス */}
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

      {/* 問題文 */}
      <Card className="border-0 ring-1 ring-foreground/10">
        <CardContent className="py-6">
          <span className="mb-2 inline-block rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {question.category}
          </span>
          <p className="text-lg font-medium leading-relaxed">
            {question.question}
          </p>
        </CardContent>
      </Card>

      {/* 選択肢 */}
      <div className="grid grid-cols-1 gap-3">
        {question.options.map((opt, i) => {
          const isCorrect = i === question.answer;
          const isPicked = selected === i;

          let state = "border-border hover:bg-muted/50";
          if (revealed) {
            if (isCorrect) {
              state = "border-emerald-500/60 bg-emerald-500/10";
            } else if (isPicked) {
              state = "border-rose-500/60 bg-rose-500/10";
            } else {
              state = "border-border opacity-60";
            }
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

      {/* 解説 */}
      {revealed && (
        <Card className="border-0 bg-muted/40 ring-1 ring-foreground/10">
          <CardContent className="py-4">
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              解説
            </p>
            <p className="text-sm leading-relaxed">{question.explanation}</p>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={next}
        disabled={!revealed || phase === "submitting"}
        size="lg"
        className="w-full"
      >
        {isLast ? "結果を見る" : "次の問題"}
        <ArrowRight />
      </Button>
    </div>
  );
}

// ── 結果表示 ────────────────────────────────────────────

function ResultView({
  questions,
  answers,
  result,
  error,
  onRestart,
}: {
  questions: ToeicQuestion[];
  answers: Answer[];
  result: { total: number; correct: number } | null;
  error: string | null;
  onRestart: () => void;
}) {
  const selectedById = new Map(answers.map((a) => [a.id, a.selected]));
  const total = result?.total ?? questions.length;
  const correct = result?.correct ?? 0;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const scoreColor =
    accuracy >= 80
      ? "text-emerald-400"
      : accuracy >= 60
        ? "text-yellow-400"
        : "text-orange-400";

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <Card className="border-0 ring-1 ring-foreground/10">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">演習結果（Part 5）</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">正答率</p>
            <p className={cn("font-mono text-6xl font-bold", scoreColor)}>
              {accuracy}
              <span className="text-2xl">%</span>
            </p>
            <p className="mt-1 text-lg font-semibold tabular-nums">
              {correct} / {total} 問正解
            </p>
          </div>
          <p className="mx-auto max-w-sm text-center text-sm text-muted-foreground">
            {accuracyToComment(accuracy)}
          </p>
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button onClick={onRestart} size="lg" className="flex-1">
              <RotateCcw />
              もう一度演習する
            </Button>
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "flex-1"
              )}
            >
              <Home className="size-4" />
              ホームへ戻る
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 復習 */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">復習</h2>
        {questions.map((q) => {
          const picked = selectedById.get(q.id);
          const isCorrect = picked === q.answer;
          return (
            <Card key={q.id} className="border-0 ring-1 ring-foreground/10">
              <CardContent className="flex flex-col gap-2 py-4">
                <div className="flex items-start gap-2">
                  {isCorrect ? (
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                  ) : (
                    <X className="mt-0.5 size-4 shrink-0 text-rose-400" />
                  )}
                  <p className="text-sm font-medium leading-relaxed">
                    {q.question}
                  </p>
                </div>
                <div className="flex flex-col gap-1 pl-6 text-sm">
                  {picked !== undefined && picked !== q.answer && (
                    <p className="text-rose-300">
                      あなたの回答: {OPTION_LABELS[picked]}. {q.options[picked]}
                    </p>
                  )}
                  <p className="text-emerald-300">
                    正解: {OPTION_LABELS[q.answer]}. {q.options[q.answer]}
                  </p>
                  <p className="mt-1 text-muted-foreground">{q.explanation}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
