"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, GraduationCap, LogOut } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export function SettingsForm({
  userId,
  email,
  initialName,
  level,
}: {
  userId: string;
  email: string;
  initialName: string;
  level: string | null;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = name.trim() !== (initialName ?? "").trim();

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: name.trim() || null })
      .eq("id", userId);
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  };

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* プロフィール */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">プロフィール</CardTitle>
          <CardDescription>表示名はダッシュボードの挨拶に使われます。</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-muted-foreground">メールアドレス</Label>
            <p className="truncate text-sm">{email || "—"}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="display_name">表示名</Label>
            <Input
              id="display_name"
              value={name}
              maxLength={50}
              placeholder="例: Taro"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={save} disabled={!dirty || saving} size="sm">
              {saving ? "保存中…" : "保存"}
            </Button>
            {saved && (
              <span className="inline-flex items-center gap-1 text-sm text-emerald-400">
                <Check className="size-4" />
                保存しました
              </span>
            )}
            {error && <span className="text-sm text-destructive">{error}</span>}
          </div>
        </CardContent>
      </Card>

      {/* レベル */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">英語レベル（CEFR）</CardTitle>
          <CardDescription>
            レベル判定テストはいつでもやり直せます。
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <GraduationCap className="size-5 text-muted-foreground" />
            <span className="text-sm">
              現在のレベル:{" "}
              {level ? (
                <span className="font-mono font-semibold">{level}</span>
              ) : (
                <span className="text-muted-foreground">未判定</span>
              )}
            </span>
          </div>
          <Link
            href="/onboarding"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            {level ? "再判定する" : "判定する"}
          </Link>
        </CardContent>
      </Card>

      {/* アカウント */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">アカウント</CardTitle>
          <CardDescription>この端末からログアウトします。</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="size-4" />
            ログアウト
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
