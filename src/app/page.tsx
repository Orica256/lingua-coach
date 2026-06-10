import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  GraduationCap,
  ShieldCheck,
  SpellCheck2,
  Trophy,
  Volume2,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: SpellCheck2,
    title: "AI 添削",
    description:
      "入力した英文を Claude が即座に添削。修正前後の比較と、なぜ間違いなのかの解説付きで学べます。",
  },
  {
    icon: GraduationCap,
    title: "レベル判定",
    description:
      "選択式クイズで CEFR（A1〜C2）のレベルを判定。あなたに合った難易度から学習をスタート。",
  },
  {
    icon: BarChart3,
    title: "進捗分析",
    description:
      "間違いの傾向をカテゴリ別に可視化。ダッシュボードで弱点と成長が一目でわかります。",
  },
  {
    icon: Trophy,
    title: "ゲーミフィケーション",
    description:
      "連続学習でストリークが伸び、条件達成でバッジを獲得。続けるモチベーションを後押し。",
  },
  {
    icon: Volume2,
    title: "音声で確認",
    description:
      "ブラウザ標準の音声合成で例文を読み上げ。発音とリズムを耳で確認できます。",
  },
  {
    icon: ShieldCheck,
    title: "安心のセキュリティ",
    description:
      "APIキーはサーバー側のみで管理し、データはアカウントごとに保護。個人開発でも本格対応。",
  },
];

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* 背景のグロー演出 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(60%_50%_at_50%_0%,oklch(0.488_0.243_264.376/0.18),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04] [background-image:linear-gradient(to_right,var(--foreground)_1px,transparent_1px),linear-gradient(to_bottom,var(--foreground)_1px,transparent_1px)] [background-size:48px_48px]"
      />

      {/* ヘッダー */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <span className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground font-mono text-sm">
            L
          </span>
          LinguaCoach
        </span>
        <nav className="flex items-center gap-2">
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}
          >
            ログイン
          </Link>
          <Link
            href="/signup"
            className={cn(buttonVariants({ size: "lg" }))}
          >
            無料で始める
          </Link>
        </nav>
      </header>

      {/* ヒーロー */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-6">
        <section className="flex flex-col items-center py-20 text-center sm:py-28">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            Powered by Claude AI
          </span>
          <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-6xl">
            AI があなた専属の
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400 bg-clip-text text-transparent">
              英会話コーチ
            </span>
            になる
          </h1>
          <p className="mt-6 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
            英文を入力するだけで、文法・表現を即座に添削。レベル判定から進捗分析まで、
            あなたの学習を一気通貫でサポートします。
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className={cn(buttonVariants({ size: "lg" }), "h-11 px-6 text-base")}
            >
              無料で始める
              <ArrowRight />
            </Link>
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 px-6 text-base"
              )}
            >
              ログイン
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            クレジットカード不要・メールアドレスだけで登録できます
          </p>
        </section>

        {/* 機能カード */}
        <section className="grid w-full grid-cols-1 gap-4 pb-24 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group rounded-xl border border-border bg-card/40 p-6 transition-colors hover:bg-card/70"
            >
              <div className="mb-4 grid size-10 place-items-center rounded-lg border border-border bg-background text-foreground">
                <Icon className="size-5" />
              </div>
              <h2 className="mb-1.5 font-semibold">{title}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </section>
      </main>

      {/* フッター */}
      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-sm text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} LinguaCoach</span>
          <span className="text-xs">個人学習用・英会話 AI コーチ</span>
        </div>
      </footer>
    </div>
  );
}
