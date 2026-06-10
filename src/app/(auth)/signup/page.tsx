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
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(
        error.message.includes("already")
          ? "このメールアドレスは既に登録されています。"
          : "登録に失敗しました。入力内容を確認してください。"
      );
      setPending(false);
      return;
    }

    setDone(true);
    setPending(false);
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
        {done ? (
          <div className="flex flex-col gap-3">
            <p className="rounded-lg border border-border bg-muted/40 px-3 py-3 text-sm text-muted-foreground">
              確認メールを送信しました。メール内のリンクをクリックすると登録が完了します。
            </p>
            <Link
              href="/login"
              className="text-center text-sm font-medium text-foreground hover:underline"
            >
              ログインに戻る
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  name="email"
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
                  name="password"
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

              {error && (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {error}
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

            <p className="mt-5 text-center text-sm text-muted-foreground">
              すでにアカウントをお持ちですか？{" "}
              <Link
                href="/login"
                className="font-medium text-foreground hover:underline"
              >
                ログイン
              </Link>
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
