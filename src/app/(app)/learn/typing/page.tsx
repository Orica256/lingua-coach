"use client";

import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  PenLine,
  RotateCcw,
  Sparkles,
  Wand2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TYPING_SCENES, type TypingScene } from "@/data/typing-scenes";

const MAX_TEXT_LENGTH = 2000;

interface CorrectionItem {
  original: string;
  corrected: string;
  category: string;
  explanation: string;
}

interface CorrectionResult {
  corrected_text: string;
  has_errors: boolean;
  naturalness: number;
  overall_comment: string;
  corrections: CorrectionItem[];
  better_expression: string | null;
}

type Status = "idle" | "loading" | "done";

export default function TypingPage() {
  // 選択中のシーン。null = まだ未選択（シーン選択画面）
  const [scene, setScene] = useState<TypingScene | "free" | null>(null);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<CorrectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sceneLabel =
    scene === "free" ? "自由入力" : scene ? scene.label : "";

  const handleSubmit = async () => {
    if (text.trim().length === 0) return;
    setStatus("loading");
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/correct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, scene: sceneLabel }),
      });
      const data = (await res.json()) as CorrectionResult & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "添削に失敗しました");
      setResult(data);
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
      setStatus("idle");
    }
  };

  const resetAll = () => {
    setScene(null);
    setText("");
    setResult(null);
    setError(null);
    setStatus("idle");
  };

  // ── シーン選択 ────────────────────────────────────────
  if (scene === null) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">タイピング添削</h1>
          <p className="text-sm text-muted-foreground">
            シーンを選んで英文を入力すると、AI が文法や自然な表現を添削します。
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {TYPING_SCENES.map((s) => (
            <button
              key={s.key}
              onClick={() => setScene(s)}
              className="flex flex-col items-start gap-1 rounded-lg border border-border bg-card/30 p-4 text-left transition-colors hover:border-foreground hover:bg-muted/40"
            >
              <span className="font-medium">{s.label}</span>
              <span className="text-sm text-muted-foreground">
                {s.description}
              </span>
            </button>
          ))}
          <button
            onClick={() => setScene("free")}
            className="flex flex-col items-start gap-1 rounded-lg border border-dashed border-border bg-card/30 p-4 text-left transition-colors hover:border-foreground hover:bg-muted/40"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <PenLine className="size-4" />
              自由入力
            </span>
            <span className="text-sm text-muted-foreground">
              好きな英文を自由に書いて添削する
            </span>
          </button>
        </div>
      </div>
    );
  }

  // ── 入力・結果 ────────────────────────────────────────
  const prompt =
    scene === "free"
      ? "好きな英文を自由に入力してください。"
      : scene.prompt;
  const placeholder =
    scene === "free"
      ? "Type your English here..."
      : scene.placeholder;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={resetAll}
          className="shrink-0"
        >
          <ArrowLeft />
          シーン選択
        </Button>
        <h1 className="text-lg font-semibold tracking-tight">{sceneLabel}</h1>
      </div>

      {/* お題 */}
      <Card className="border-0 bg-gradient-to-r from-indigo-500/15 via-violet-500/10 to-transparent ring-1 ring-foreground/10">
        <CardContent className="flex items-start gap-3 py-4">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-violet-300" />
          <p className="text-sm leading-relaxed">{prompt}</p>
        </CardContent>
      </Card>

      {/* 入力フォーム */}
      <div className="flex flex-col gap-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_TEXT_LENGTH))}
          placeholder={placeholder}
          rows={6}
          disabled={status === "loading"}
          className="w-full resize-y rounded-lg border border-input bg-input/30 px-3.5 py-3 text-base leading-relaxed outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground tabular-nums">
            {text.length} / {MAX_TEXT_LENGTH}
          </span>
          <Button
            onClick={handleSubmit}
            disabled={text.trim().length === 0 || status === "loading"}
            size="lg"
          >
            {status === "loading" ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-background/40 border-t-background" />
                添削中…
              </>
            ) : (
              <>
                <Wand2 />
                添削する
              </>
            )}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {/* 結果 */}
      {status === "done" && result && (
        <ResultView result={result} onRetry={() => setResult(null)} />
      )}
    </div>
  );
}

// ── 結果表示 ────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  時制: "bg-blue-500/15 text-blue-300",
  前置詞: "bg-cyan-500/15 text-cyan-300",
  冠詞: "bg-teal-500/15 text-teal-300",
  語順: "bg-amber-500/15 text-amber-300",
  語彙: "bg-violet-500/15 text-violet-300",
  スペル: "bg-rose-500/15 text-rose-300",
  句読点: "bg-pink-500/15 text-pink-300",
  その他: "bg-muted text-muted-foreground",
};

function ResultView({
  result,
  onRetry,
}: {
  result: CorrectionResult;
  onRetry: () => void;
}) {
  const scoreColor =
    result.naturalness >= 80
      ? "text-emerald-400"
      : result.naturalness >= 60
        ? "text-yellow-400"
        : "text-orange-400";

  return (
    <div className="flex flex-col gap-4">
      {/* 総評 + 自然さスコア */}
      <Card className="border-0 ring-1 ring-foreground/10">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-base">
              {result.has_errors ? (
                <Wand2 className="size-5 text-violet-300" />
              ) : (
                <CheckCircle2 className="size-5 text-emerald-400" />
              )}
              添削結果
            </CardTitle>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">自然さ</p>
              <p className={cn("font-mono text-2xl font-bold", scoreColor)}>
                {result.naturalness}
                <span className="ml-0.5 text-sm font-normal text-muted-foreground">
                  /100
                </span>
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {result.overall_comment && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {result.overall_comment}
            </p>
          )}

          {/* 修正後の英文 */}
          <div className="rounded-lg bg-muted/50 p-3.5">
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              修正後の英文
            </p>
            <p className="leading-relaxed">{result.corrected_text}</p>
          </div>
        </CardContent>
      </Card>

      {/* 個別の指摘 */}
      {result.corrections.length > 0 && (
        <Card className="border-0 ring-1 ring-foreground/10">
          <CardHeader>
            <CardTitle className="text-base">
              指摘ポイント（{result.corrections.length}件）
            </CardTitle>
            <CardDescription>
              間違いやすいポイントを確認しましょう。
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {result.corrections.map((c, i) => (
              <div
                key={i}
                className="flex flex-col gap-2 rounded-lg border border-border p-3.5"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-md px-2 py-0.5 text-xs font-medium",
                      CATEGORY_COLORS[c.category] ?? CATEGORY_COLORS["その他"]
                    )}
                  >
                    {c.category}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-rose-300 line-through decoration-rose-400/50">
                    {c.original}
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-emerald-300">
                    {c.corrected}
                  </span>
                </div>
                {c.explanation && (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {c.explanation}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* より自然な言い換え */}
      {result.better_expression && (
        <Card className="border-0 bg-gradient-to-r from-emerald-500/10 to-transparent ring-1 ring-foreground/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-5 text-emerald-300" />
              もっと自然な言い方
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed">{result.better_expression}</p>
          </CardContent>
        </Card>
      )}

      <Button variant="outline" onClick={onRetry} className="self-start">
        <RotateCcw />
        同じシーンでもう一度
      </Button>
    </div>
  );
}
