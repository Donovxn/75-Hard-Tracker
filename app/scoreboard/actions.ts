"use server";

import { supabaseServer } from "@/lib/supabase/server";

export type ScoreboardParticipant = {
  user_id: string;
  display_name: string;
};

export type ScoreboardDay = {
  dayIndex: number;
  dayDate: string;
  statusByUser: Record<string, boolean>;
};

type RpcRow = {
  day_index: number;
  day_date: string;
  user_id: string;
  display_name: string;
  day_complete: boolean;
};

export async function fetchScoreboardGrid(): Promise<{
  challengeId: string;
  participants: ScoreboardParticipant[];
  days: ScoreboardDay[];
}> {
  const supabase = await supabaseServer();
  const challengeId = process.env.NEXT_PUBLIC_CHALLENGE_ID!;

  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw authErr;
  if (!auth.user) throw new Error("Not authenticated");

  const { data, error } = await supabase.rpc("scoreboard_grid", {
    p_challenge_id: challengeId,
  });

  if (error) throw error;

  const rows = (data ?? []) as RpcRow[];

  const participants: ScoreboardParticipant[] = [];
  const seen = new Set<string>();
  for (const r of rows) {
    if (r.day_index !== 1) continue;
    if (seen.has(r.user_id)) continue;
    seen.add(r.user_id);
    participants.push({ user_id: r.user_id, display_name: r.display_name });
  }

  const byDay = new Map<number, ScoreboardDay>();
  for (const r of rows) {
    if (!byDay.has(r.day_index)) {
      byDay.set(r.day_index, {
        dayIndex: r.day_index,
        dayDate: r.day_date,
        statusByUser: {},
      });
    }
    byDay.get(r.day_index)!.statusByUser[r.user_id] = !!r.day_complete;
  }

  const days = Array.from(byDay.values()).sort((a, b) => a.dayIndex - b.dayIndex);

  return { challengeId, participants, days };
}
