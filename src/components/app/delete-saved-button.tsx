"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

/** 保存済み問題セットを削除する（RLS により本人の行のみ）。 */
export function DeleteSavedButton({ id }: { id: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const remove = async () => {
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from("toeic_generated").delete().eq("id", id);
    if (error) {
      setDeleting(false);
      setConfirming(false);
      return;
    }
    router.push("/learn/toeic/saved");
    router.refresh();
  };

  if (!confirming) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setConfirming(true)}
        aria-label="この保存問題を削除"
      >
        <Trash2 className="size-4" />
        削除
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">削除しますか？</span>
      <Button
        variant="destructive"
        size="sm"
        onClick={remove}
        disabled={deleting}
      >
        {deleting ? "削除中…" : "削除する"}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setConfirming(false)}
        disabled={deleting}
      >
        やめる
      </Button>
    </div>
  );
}
