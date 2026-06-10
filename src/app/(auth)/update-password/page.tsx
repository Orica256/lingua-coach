"use client";

import { useRouter } from "next/navigation";
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

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const password = String(form.get("password"));

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError("パスワードの更新に失敗しました。リンクの有効期限切れの可能性があります。");
      setPending(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card className="p-6">
      <CardHeader className="px-0 text-center">
        <CardTitle className="text-xl">新しいパスワードを設定</CardTitle>
        <CardDescription>新しいパスワードを入力してください</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">新しいパスワード</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="8文字以上"
              autoComplete="new-password"
              minLength={8}
              required
            />
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
            {pending ? "更新中…" : "パスワードを更新"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
