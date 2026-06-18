import { createClient } from "@/lib/supabase/server";
import {
  VocabReview,
  type ReviewCard,
} from "@/components/app/vocab-review";

/** 1セッションで出題する最大枚数。 */
const SESSION_LIMIT = 30;

export default async function VocabReviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("vocab_cards")
    .select("id, term, meaning, example, box")
    .eq("user_id", user!.id)
    .lte("due_at", new Date().toISOString())
    .order("due_at", { ascending: true })
    .limit(SESSION_LIMIT);

  const cards = (data ?? []) as ReviewCard[];

  return <VocabReview cards={cards} />;
}
