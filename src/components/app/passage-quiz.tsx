"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { BookmarkPlus, Check, Home, X } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const OPTION_LABELS = ["A", "B", "C", "D"] as const;

/**
 * 長文 passage を読みやすく表示する。
 * 空行（\n\n）で段落に分割し、段落間に余白を入れる。
 * 段落内の単一改行（手紙の宛名・署名など）は維持する。
 * 1ブロックで返ってきた本文も、文末（. ! ?）の直後で緩く段落化して可読性を上げる。
 */
function Passage({ text }: { text: string }) {
  const normalized = text.replace(/\r\n/g, "\n").trim();

  // まず空行で段落分割。空行が無い（1ブロック）なら、約3文ごとに段落を区切る。
  let paragraphs = normalized
    .split(/\n[ \t]*\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 1) {
    paragraphs = chunkSentences(paragraphs[0]);
  }

  return (
    <div className="flex max-w-prose flex-col gap-4 text-sm leading-7 sm:text-base sm:leading-8">
      {paragraphs.map((p, i) => (
        <p key={i} className="whitespace-pre-wrap">
          {p}
        </p>
      ))}
    </div>
  );
}

/** 改行の無い1ブロック本文を、約3文ごとの段落に分けて可読性を上げる。 */
function chunkSentences(block: string): string[] {
  // 文末（. ! ?）+空白 で分割しつつ区切り文字を保持
  const sentences = block.match(/[^.!?]+[.!?]+["')\]]?\s*|[^.!?]+$/g);
  if (!sentences || sentences.length <= 3) return [block];

  const out: string[] = [];
  const PER = 3;
  for (let i = 0; i < sentences.length; i += PER) {
    out.push(
      sentences
        .slice(i, i + PER)
        .join("")
        .trim()
    );
  }
  return out.filter(Boolean);
}

export interface GenQuestion {
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
}
export interface GeneratedSet {
  part: 6 | 7;
  title: string;
  passage: string;
  questions: GenQuestion[];
}

/**
 * 本文＋設問を表示し、全問解答→採点→正誤＆解説を出す共通クイズ。
 * 生成フロー（canSave=true で保存ボタン表示）と保存問題の再演習で共有。
 */
export function PassageQuiz({
  set,
  canSave = false,
  footer,
}: {
  set: GeneratedSet;
  canSave?: boolean;
  footer?: ReactNode;
}) {
  const { part } = set;
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(set.questions.length).fill(null)
  );
  const [graded, setGraded] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");

  const allAnswered = answers.every((a) => a !== null);
  const correctCount = set.questions.reduce(
    (acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0),
    0
  );
  const accuracy = Math.round((correctCount / set.questions.length) * 100);

  const select = (qi: number, oi: number) => {
    if (graded) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[qi] = oi;
      return next;
    });
  };

  const grade = async () => {
    if (!allAnswered) return;
    setGraded(true);
    try {
      await fetch("/api/toeic/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ part, total: set.questions.length, correct: correctCount }),
      });
    } catch {
      // 進捗記録の失敗は致命的でない
    }
  };

  const save = async () => {
    setSaveState("saving");
    try {
      const res = await fetch("/api/toeic/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          part,
          title: set.title,
          passage: set.passage,
          questions: set.questions,
        }),
      });
      if (!res.ok) throw new Error();
      setSaveState("saved");
    } catch {
      setSaveState("idle");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 本文 */}
      <Card className="border-0 ring-1 ring-foreground/10">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {set.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Passage text={set.passage} />
        </CardContent>
      </Card>

      {/* 設問 */}
      {set.questions.map((q, qi) => (
        <Card key={qi} className="border-0 ring-1 ring-foreground/10">
          <CardContent className="flex flex-col gap-3 py-4">
            <p className="font-medium">
              {part === 6 ? q.prompt : `${qi + 1}. ${q.prompt}`}
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

            {/* 保存（生成フローのみ・気に入った問題を個人バンクへ） */}
            {canSave && (
              <Button
                variant="outline"
                size="sm"
                onClick={save}
                disabled={saveState !== "idle"}
              >
                {saveState === "saved" ? (
                  <>
                    <Check className="size-4 text-emerald-400" />
                    保存しました
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="size-4" />
                    {saveState === "saving" ? "保存中…" : "この問題を保存"}
                  </>
                )}
              </Button>
            )}

            {footer}

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
      )}
    </div>
  );
}
