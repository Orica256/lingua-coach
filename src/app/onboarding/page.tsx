"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, GraduationCap } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  QUESTIONS,
  type CefrLevel,
  type QuizQuestion,
} from "@/data/level-quiz";

type Phase = "welcome" | "quiz" | "submitting" | "result";

interface TestResult {
  score: number;
  cefr_level: CefrLevel;
}

const CEFR_INFO: Record<
  CefrLevel,
  { label: string; desc: string; color: string }
> = {
  A1: {
    label: "入門",
    desc: "基本的な日常表現を理解し、使えるレベルです。LinguaCoach があなたの成長をサポートします！",
    color: "text-blue-400",
  },
  A2: {
    label: "初級",
    desc: "日常会話の基本フレーズを理解し、簡単な情報交換ができるレベルです。",
    color: "text-cyan-400",
  },
  B1: {
    label: "中級",
    desc: "日常的な話題について、ある程度まとまった内容を話せるレベルです。",
    color: "text-green-400",
  },
  B2: {
    label: "中上級",
    desc: "複雑な内容の主旨を理解し、ネイティブとも流暢に会話できるレベルです。",
    color: "text-yellow-400",
  },
  C1: {
    label: "上級",
    desc: "多様な目的のために、言語を柔軟かつ効果的に使えるレベルです。",
    color: "text-orange-400",
  },
  C2: {
    label: "熟達",
    desc: "ほぼネイティブ同等の理解力と表現力を持つ、英語の達人レベルです。",
    color: "text-red-400",
  },
};

export default function OnboardingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("welcome");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnswer = async (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setPhase("submitting");
      try {
        const res = await fetch("/api/level-test/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: newAnswers }),
        });
        const data = (await res.json()) as TestResult & { error?: string };
        if (!res.ok) throw new Error(data.error ?? "判定に失敗しました");
        setResult(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "エラーが発生しました");
      } finally {
        setPhase("result");
      }
    }
  };

  if (phase === "welcome") {
    return <WelcomeScreen onStart={() => setPhase("quiz")} />;
  }

  if (phase === "quiz") {
    return (
      <QuizScreen
        key={currentIndex}
        question={QUESTIONS[currentIndex]}
        currentIndex={currentIndex}
        total={QUESTIONS.length}
        onAnswer={handleAnswer}
      />
    );
  }

  if (phase === "submitting") {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="size-12 animate-spin rounded-full border-4 border-muted border-t-foreground" />
        <p className="text-muted-foreground">結果を集計しています…</p>
      </div>
    );
  }

  return (
    <ResultScreen
      result={result}
      error={error}
      onGoToDashboard={() => router.push("/dashboard")}
    />
  );
}

// ── サブコンポーネント ─────────────────────────────────────────

function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <Card className="border-0 ring-1 ring-foreground/10">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-muted ring-1 ring-foreground/10">
          <GraduationCap className="size-8" />
        </div>
        <CardTitle className="text-2xl">レベル判定テスト</CardTitle>
        <CardDescription className="mt-1 text-base">
          20問の選択式クイズで、あなたの英語レベル（CEFR）を判定します。
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• 全20問の選択式（4択）</li>
          <li>• 文法・語彙・表現を幅広くカバー</li>
          <li>• 所要時間の目安: 5〜10分</li>
          <li>• 後からいつでも再受験可能</li>
        </ul>
        <Button onClick={onStart} className="w-full" size="lg">
          テストを始める
          <ArrowRight />
        </Button>
      </CardContent>
    </Card>
  );
}

function QuizScreen({
  question,
  currentIndex,
  total,
  onAnswer,
}: {
  question: QuizQuestion;
  currentIndex: number;
  total: number;
  onAnswer: (i: number) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const OPTION_LABELS = ["A", "B", "C", "D"] as const;
  const progress = (currentIndex / total) * 100;
  const isLast = currentIndex === total - 1;

  return (
    <div className="flex flex-col gap-6">
      {/* プログレスバー */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            問題 {currentIndex + 1} / {total}
          </span>
        </div>
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
          <p className="text-lg font-medium leading-relaxed">
            {question.question}
          </p>
        </CardContent>
      </Card>

      {/* 選択肢 */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {question.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={cn(
              "flex items-center gap-3 rounded-lg border p-4 text-left transition-colors",
              "hover:bg-muted/50",
              selected === i ? "border-foreground bg-foreground/10" : "border-border"
            )}
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted font-mono text-xs font-semibold">
              {OPTION_LABELS[i]}
            </span>
            <span className="text-sm">{opt}</span>
          </button>
        ))}
      </div>

      {/* 次へボタン */}
      <Button
        onClick={() => {
          if (selected !== null) onAnswer(selected);
        }}
        disabled={selected === null}
        className="w-full"
        size="lg"
      >
        {isLast ? "結果を見る" : "次の問題"}
        <ArrowRight />
      </Button>
    </div>
  );
}

function ResultScreen({
  result,
  error,
  onGoToDashboard,
}: {
  result: TestResult | null;
  error: string | null;
  onGoToDashboard: () => void;
}) {
  if (!result) {
    return (
      <Card className="border-0 ring-1 ring-foreground/10">
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-destructive">
            {error ?? "結果の取得に失敗しました。"}
          </p>
          <Button onClick={onGoToDashboard}>ダッシュボードへ</Button>
        </CardContent>
      </Card>
    );
  }

  const info = CEFR_INFO[result.cefr_level];

  return (
    <Card className="border-0 ring-1 ring-foreground/10">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 grid size-16 place-items-center rounded-2xl bg-muted ring-1 ring-foreground/10">
          <CheckCircle2 className="size-8 text-emerald-400" />
        </div>
        <CardTitle className="text-2xl">判定完了！</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">あなたの英語レベル</p>
          <p
            className={cn(
              "mt-2 font-mono text-7xl font-bold tracking-wide",
              info.color
            )}
          >
            {result.cefr_level}
          </p>
          <p className="mt-2 text-xl font-semibold">{info.label}</p>
          <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
            {info.desc}
          </p>
        </div>

        <div className="w-full rounded-lg bg-muted px-4 py-3 text-center">
          <p className="text-xs text-muted-foreground">スコア</p>
          <p className="text-3xl font-bold tabular-nums">
            {result.score}
            <span className="ml-1 text-lg font-normal text-muted-foreground">
              / {QUESTIONS.length}
            </span>
          </p>
        </div>

        <Button onClick={onGoToDashboard} className="w-full" size="lg">
          ダッシュボードへ
          <ArrowRight />
        </Button>
      </CardContent>
    </Card>
  );
}
