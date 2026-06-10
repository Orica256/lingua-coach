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

export default function SignupPage() {
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    // TODO(Phase 1): Supabase Auth でサインアップ＋確認メール送信を実装する
    setTimeout(() => {
      setPending(false);
      setNotice("認証バックエンド（Supabase）は Phase 1 で接続予定です。");
    }, 600);
  }

  return (
    <Card className="p-6">
      <CardHeader className="px-0 text-center">
        <CardTitle className="text-xl">無料で始める</CardTitle>
        <CardDescription>
          メールアドレスだけでアカウントを作成できます
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
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              type="password"
              placeholder="8文字以上"
              autoComplete="new-password"
              minLength={8}
              required
            />
            <p className="text-xs text-muted-foreground">
              8文字以上で設定してください。
            </p>
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
            {pending ? "登録中…" : "アカウントを作成"}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          登録すると利用規約とプライバシーポリシーに同意したものとみなされます。
        </p>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          すでにアカウントをお持ちですか？{" "}
          <Link
            href="/login"
            className="font-medium text-foreground hover:underline"
          >
            ログイン
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
