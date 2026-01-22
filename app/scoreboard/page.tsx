import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { fetchScoreboardTodayCards } from "./actions";

export default async function ScoreboardPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr) {
    return (
      <main className="min-h-dvh bg-neutral-950 text-neutral-50 p-6">
        <p className="text-sm text-red-400">{userErr.message}</p>
      </main>
    );
  }

  if (!user) redirect("/login");

  const { dayDate, rows } = await fetchScoreboardTodayCards();

  return (
    <main className="min-h-dvh bg-neutral-950 text-neutral-50 p-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Scoreboard</h1>
          <p className="mt-1 text-sm text-neutral-400">Denver date: {dayDate}</p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/today" className="text-sm text-neutral-300 underline">
            Today
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {rows.map((r) => {
          const pct =
            r.today_total > 0 ? Math.round((r.today_complete / r.today_total) * 100) : 0;

          const dayLabel =
            r.day_number > 0
              ? `Day ${r.day_number} / ${r.participant_length_days}`
              : `Starts in ${r.starts_in_days ?? 0} days`;

          return (
            <div
              key={r.user_id}
              className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">{r.display_name}</p>
                  <p className="mt-1 text-xs text-neutral-400">{dayLabel}</p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-neutral-400">Today</p>
                  <p className="text-sm font-semibold">
                    {r.today_complete}/{r.today_total}
                  </p>
                </div>
              </div>

              <div className="mt-3 h-2 w-full rounded-full bg-neutral-800">
                <div
                  className="h-2 rounded-full bg-emerald-500/60"
                  style={{ width: `${pct}%` }}
                />
              </div>

              <p className="mt-2 text-[11px] text-neutral-500">{pct}%</p>
            </div>
          );
        })}
      </div>
    </main>
  );
}
