import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import {
  PassageQuiz,
  type GeneratedSet,
  type GenQuestion,
} from "@/components/app/passage-quiz";
import { DeleteSavedButton } from "@/components/app/delete-saved-button";

export default async function SavedToeicSetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("toeic_generated")
    .select("id, part, title, passage, questions")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();

  if (!data) notFound();

  const set: GeneratedSet = {
    part: data.part as 6 | 7,
    title: data.title ?? `Part ${data.part} の問題`,
    passage: data.passage,
    questions: (data.questions as GenQuestion[]) ?? [],
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/learn/toeic/saved"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          保存した問題
        </Link>
        <DeleteSavedButton id={data.id} />
      </div>

      <PassageQuiz
        set={set}
        footer={
          <Link
            href="/learn/toeic/saved"
            className={cn(buttonVariants({ variant: "outline" }), "w-full")}
          >
            保存一覧に戻る
          </Link>
        }
      />
    </div>
  );
}
