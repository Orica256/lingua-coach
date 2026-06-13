import { SettingsForm } from "@/components/app/settings-form";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, cefr_level")
    .eq("id", user!.id)
    .single();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">設定</h1>
        <p className="text-sm text-muted-foreground">
          プロフィールとアカウントを管理します。
        </p>
      </div>

      <SettingsForm
        userId={user!.id}
        email={user?.email ?? ""}
        initialName={profile?.display_name ?? ""}
        level={profile?.cefr_level ?? null}
      />
    </div>
  );
}
