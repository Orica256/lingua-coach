"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, Home, RotateCcw } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReviewGrade } from "@/lib/srs";

export interface ReviewCard {
  id: string;
  term: string;
  meaning: string;
  example: string | null;
  box: number;
}

const GRADE_BUTTONS: {
  grade: ReviewGrade;
  label: string;
  hint: string;
  className: string;
}[] = [
  {
    grade: "again",
    label: "まだ",
    hint: "最初に戻る",
    className: "border-rose-500/50 text-rose-300 hover:bg-rose-500/10",
  },
  {
    grade: "good",
    label: "覚えた",
    hint: "間隔を延ばす",
    className: "border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/10",
  },
  {
    grade: "easy",
    label: "簡単",
    hint: "大きく延ばす",
    className: "border-sky-500/50 text-sky-300 hover:bg-sky-500/10",
  },
];

export function VocabReview({ cards }: { cards: ReviewCard[] }) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // 復習対象が無い場合
  if (cards.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <Header />
        <Card className="border-0 ring-1 ring-foreground/10">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="text-lg font-semibold">復習待ちのカードはありません 🎉</p>
            <p className="text-sm text-muted-foreground">
              新しい単語を登録するか、間隔が来たカードが出てくるのを待ちましょう。
            </p>
            <Link href="/vocab" className={cn(buttonVariants(), "h-10 px-5")}>
              単語帳に戻る
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const done = index >= cards.length;

  // セッション完了
  if (done) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <Header />
        <Card className="border-0 ring-1 ring-foreground/10">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="font-mono text-5xl font-bold text-emerald-400">
              {reviewedCount}
            </p>
            <p className="text-lg font-semibold">枚の復習が完了しました</p>
            <p className="text-sm text-muted-foreground">
              お疲れさまでした。次の復習はまた間隔が来た頃に出題されます。
            </p>
            <div className="flex w-full flex-col gap-2 sm:flex-row">
              <Link
                href="/vocab"
                className={cn(buttonVariants(), "h-11 flex-1")}
              >
                <RotateCcw className="size-4" />
                単語帳に戻る
              </Link>
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-11 flex-1"
                )}
              >
                <Home className="size-4" />
                ホームへ
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const card = cards[index];
  const progress = (index / cards.length) * 100;

  const grade = async (g: ReviewGrade) => {
    if (submitting) return;
    setSubmitting(true);
    // 採点はサーバーに記録（失敗してもセッションは進める＝学習体験を止めない）
    try {
      await fetch("/api/vocab/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: card.id, grade: g }),
      });
    } catch {
      // ネットワークエラーは無視して次へ
    }
    setReviewedCount((c) => c + 1);
    setIndex((i) => i + 1);
    setRevealed(false);
    setSubmitting(false);
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Header />

      <div className="flex flex-col gap-2">
        <span className="text-sm text-muted-foreground">
          {index + 1} / {cards.length} 枚
        </span>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-foreground transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* カード（表＝英語、めくると裏＝意味） */}
      <Card className="border-0 ring-1 ring-foreground/10">
        <CardContent className="flex min-h-48 flex-col items-center justify-center gap-4 py-10 text-center">
          <p className="text-2xl font-semibold">{card.term}</p>
          {revealed ? (
            <>
              <div className="h-px w-16 bg-border" />
              <p className="text-lg">{card.meaning}</p>
              {card.example && (
                <p className="text-sm italic text-muted-foreground">
                  {card.example}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              意味を思い出してから「答えを見る」を押してください
            </p>
          )}
        </CardContent>
      </Card>

      {!revealed ? (
        <Button onClick={() => setRevealed(true)} size="lg" className="w-full">
          <Eye className="size-4" />
          答えを見る
        </Button>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {GRADE_BUTTONS.map((b) => (
            <button
              key={b.grade}
              onClick={() => grade(b.grade)}
              disabled={submitting}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg border py-3 transition-colors disabled:opacity-50",
                b.className
              )}
            >
              <span className="text-sm font-semibold">{b.label}</span>
              <span className="text-[11px] text-muted-foreground">{b.hint}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Header() {
  return (
    <div className="flex items-center gap-3">
      <Link
        href="/vocab"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        単語帳
      </Link>
      <span className="text-sm font-medium">復習</span>
    </div>
  );
}
