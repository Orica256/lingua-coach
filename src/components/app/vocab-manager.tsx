"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface VocabCard {
  id: string;
  term: string;
  meaning: string;
  example: string | null;
  box: number;
  due_at: string;
  created_at: string;
}

/** 添削の誤りから抽出した語彙候補（誤→正）。 */
export interface VocabSuggestion {
  original: string;
  corrected: string;
}

export function VocabManager({
  initialCards,
  suggestions,
}: {
  initialCards: VocabCard[];
  suggestions: VocabSuggestion[];
}) {
  const router = useRouter();
  const [cards, setCards] = useState<VocabCard[]>(initialCards);
  const [term, setTerm] = useState("");
  const [meaning, setMeaning] = useState("");
  const [example, setExample] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 既に登録済みの term は候補から除外する
  const existing = new Set(cards.map((c) => c.term.toLowerCase()));
  const freshSuggestions = suggestions.filter(
    (s) => s.corrected && !existing.has(s.corrected.toLowerCase())
  );

  const add = async () => {
    if (!term.trim() || !meaning.trim()) {
      setError("単語と意味を入力してください。");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/vocab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          term: term.trim(),
          meaning: meaning.trim(),
          example: example.trim() || undefined,
        }),
      });
      const data = (await res.json()) as { card?: VocabCard; error?: string };
      if (!res.ok || !data.card) throw new Error(data.error ?? "保存に失敗しました");
      setCards((prev) => [data.card!, ...prev]);
      setTerm("");
      setMeaning("");
      setExample("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    const prev = cards;
    setCards((c) => c.filter((x) => x.id !== id)); // 楽観的更新
    const res = await fetch("/api/vocab", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      setCards(prev); // 失敗したら戻す
      return;
    }
    router.refresh();
  };

  const applySuggestion = (s: VocabSuggestion) => {
    setTerm(s.corrected);
    setExample(s.original ? `（添削前）${s.original}` : "");
    setMeaning("");
    const el = document.getElementById("vocab-term");
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    (el as HTMLInputElement | null)?.focus();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 追加フォーム */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">単語・表現を追加</CardTitle>
          <CardDescription>
            覚えたい英単語やフレーズと、その意味を登録します。
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="vocab-term">単語・表現（英語）</Label>
              <Input
                id="vocab-term"
                value={term}
                maxLength={200}
                placeholder="例: get along with"
                onChange={(e) => setTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="vocab-meaning">意味</Label>
              <Input
                id="vocab-meaning"
                value={meaning}
                maxLength={500}
                placeholder="例: 〜と仲良くやる"
                onChange={(e) => setMeaning(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="vocab-example">例文（任意）</Label>
            <Input
              id="vocab-example"
              value={example}
              maxLength={500}
              placeholder="例: I get along well with my coworkers."
              onChange={(e) => setExample(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={add} disabled={saving} size="sm">
              <Plus className="size-4" />
              {saving ? "追加中…" : "追加する"}
            </Button>
            {error && <span className="text-sm text-destructive">{error}</span>}
          </div>
        </CardContent>
      </Card>

      {/* 添削からの候補 */}
      {freshSuggestions.length > 0 && (
        <Card className="border-0 bg-muted/30">
          <CardHeader>
            <CardTitle className="text-sm">添削からの候補</CardTitle>
            <CardDescription>
              最近の添削で直された表現です。タップすると上のフォームに入ります（意味を入力して追加）。
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {freshSuggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => applySuggestion(s)}
                className="rounded-full border border-border bg-background px-3 py-1 text-sm transition-colors hover:bg-muted"
              >
                {s.corrected}
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* カード一覧 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">登録した単語（{cards.length}）</CardTitle>
        </CardHeader>
        <CardContent>
          {cards.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-10 text-center">
              <p className="text-sm text-muted-foreground">
                まだ単語が登録されていません。
              </p>
              <p className="text-xs text-muted-foreground">
                上のフォームから追加すると、ここに表示されます。
              </p>
            </div>
          ) : (
            <ul className="flex flex-col">
              {cards.map((c) => (
                <li
                  key={c.id}
                  className="flex items-start gap-3 border-b border-border py-3 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{c.term}</p>
                    <p className="text-sm text-muted-foreground">{c.meaning}</p>
                    {c.example && (
                      <p className="mt-0.5 truncate text-xs italic text-muted-foreground">
                        {c.example}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground tabular-nums">
                    Lv.{c.box}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(c.id)}
                    aria-label={`「${c.term}」を削除`}
                    className="shrink-0"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
