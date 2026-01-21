import { supabaseServer } from "@/lib/supabase/server";

export default async function ScoreboardPage() {
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();

  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-50 p-6">
      <h1 className="text-xl font-semibold">Scoreboard</h1>
      <p className="mt-2 text-sm text-neutral-400">
        Signed in as: {data.user?.email}
      </p>
    </div>
  );
}
