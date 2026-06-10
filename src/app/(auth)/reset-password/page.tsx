"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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

export default function ResetPasswordPage() {
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));

    const supabase = createClient();
    // 再設定リンクは callback 経由でパスワード更新ページへ誘導する
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
    });

    // メール存在の有無は伝えない（アカウント列挙を防ぐ）
    setSent(true);
    setPending(false);
  }

  return (
    <Card className="p-6">
      <CardHeader className="px-0 text-center">
        <CardTitle className="text-xl">パスワードの再設定</CardTitle>
        <CardDescription>
          登録メールアドレスに再設定用リンクを送ります
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        {sent ? (
          <p className="rounded-lg border border-border bg-muted/40 px-3 py-3 text-sm text-muted-foreground">
            入力したメールアドレスが登録済みであれば、再設定用のリンクを送信しました。
            メールをご確認ください。
          </p>
        ) : (
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
            <Button
              type="submit"
              disabled={pending}
              className="h-10 w-full text-base"
            >
              {pending ? "送信中…" : "再設定リンクを送信"}
            </Button>
          </form>
        )}

        <Link
          href="/login"
          className="mt-5 flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          ログインに戻る
        </Link>
      </CardContent>
    </Card>
  );
}
