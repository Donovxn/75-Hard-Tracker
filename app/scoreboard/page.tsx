import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import AppShell from "../ui/AppShell";
import { fetchScoreboardGrid } from "./actions";

export default async function ScoreboardPage() {
  const supabase = await supabaseServer();
  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw authErr;
  if (!auth.user) redirect("/login");

  const { participants, days } = await fetchScoreboardGrid();

  return (
    <AppShell title="Scoreboard" active="scoreboard">
      <div className="p-6">
        <div className="mt-5 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4">
          <div className="grid grid-cols-[64px_1fr] gap-3">
            <div className="text-xs text-neutral-500">Day</div>
            <div
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${participants.length}, minmax(0, 1fr))`,
              }}
            >
              {participants.map((p) => (
                <div key={p.user_id} className="text-xs text-neutral-300 text-center">
                  {p.display_name}
                </div>
              ))}
            </div>

            {days.map((d) => (
              <div key={d.dayIndex} className="contents">
                <div className="text-xs text-neutral-400">
                  {String(d.dayIndex).padStart(2, "0")}
                  <div className="text-[11px] text-neutral-600">{d.dayDate}</div>
                </div>

                <div
                  className="grid gap-2"
                  style={{
                    gridTemplateColumns: `repeat(${participants.length}, minmax(0, 1fr))`,
                  }}
                >
                  {participants.map((p) => {
                    const ok = d.statusByUser[p.user_id] === true;
                    return (
                      <div
                        key={p.user_id}
                        className={`h-8 rounded-xl border ${
                          ok
                            ? "border-emerald-500/40 bg-emerald-500/10"
                            : "border-neutral-800 bg-neutral-950/40"
                        }`}
                        title={ok ? "Complete" : "Incomplete"}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
