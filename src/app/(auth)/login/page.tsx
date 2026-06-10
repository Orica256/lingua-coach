"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    // TODO(Phase 1): Supabase Auth でサインインを実装する
    setTimeout(() => {
      setPending(false);
      setNotice("認証バックエンド（Supabase）は Phase 1 で接続予定です。");
    }, 600);
  }

  return (
    <Card className="p-6">
      <CardHeader className="px-0 text-center">
        <CardTitle className="text-xl">おかえりなさい</CardTitle>
        <CardDescription>
          アカウントにログインして学習を続けましょう
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">パスワード</Label>
              <Link
                href="/reset-password"
                className="text-xs text-muted-foreground hover:text-foreground hover:underline"
              >
                パスワードをお忘れですか？
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {notice && (
            <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              {notice}
            </p>
          )}

          <Button
            type="submit"
            disabled={pending}
            className="h-10 w-full text-base"
          >
            {pending ? "ログイン中…" : "ログイン"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          アカウントをお持ちでないですか？{" "}
          <Link
            href="/signup"
            className="font-medium text-foreground hover:underline"
          >
            無料で登録
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
