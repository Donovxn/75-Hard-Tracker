"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { denverTodayISODate } from "@/lib/date/denver";

const TODAY_TOTAL = 6;

export type ScoreboardCardRow = {
  user_id: string;
  display_name: string;
  participant_start_date: string;
  participant_length_days: number;

  day_number: number; // 0 if not started yet
  starts_in_days: number | null;

  today_complete: number;
  today_total: number;
};

function daysBetweenISO(startISO: string, endISO: string) {
  // Use noon UTC to reduce DST weirdness
  const start = new Date(`${startISO}T12:00:00Z`);
  const end = new Date(`${endISO}T12:00:00Z`);
  return Math.floor((end.getTime() - start.getTime()) / 86_400_000);
}

export async function fetchScoreboardTodayCards(): Promise<{
  challengeId: string;
  dayDate: string;
  rows: ScoreboardCardRow[];
}> {
  const supabase = await supabaseServer();
  const challengeId = process.env.NEXT_PUBLIC_CHALLENGE_ID!;
  const dayDate = denverTodayISODate();

  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw authErr;
  if (!auth.user) throw new Error("Not authenticated");

  // Participants
  const { data: participants, error: pErr } = await supabase
    .from("challenge_participants")
    .select("user_id, display_name, participant_start_date, participant_length_days, created_at")
    .eq("challenge_id", challengeId)
    .order("created_at", { ascending: true });

  if (pErr) throw pErr;

  // Today's checkins + items for anyone who has a checkin row today
  const { data: checkins, error: cErr } = await supabase
    .from("daily_checkins")
    .select(
      `
      user_id,
      checkin_items ( is_complete )
    `
    )
    .eq("challenge_id", challengeId)
    .eq("day_date", dayDate);

  if (cErr) throw cErr;

  const completeByUser = new Map<string, number>();
  for (const c of checkins ?? []) {
    const items = (c as any).checkin_items ?? [];
    const complete = items.filter((i: any) => i.is_complete).length;
    completeByUser.set((c as any).user_id, complete);
  }

  const rows: ScoreboardCardRow[] = (participants ?? []).map((p: any) => {
    const dayOffset = daysBetweenISO(p.participant_start_date, dayDate);
    const started = dayOffset >= 0;

    return {
      user_id: p.user_id,
      display_name: p.display_name,
      participant_start_date: p.participant_start_date,
      participant_length_days: p.participant_length_days,

      day_number: started ? dayOffset + 1 : 0,
      starts_in_days: started ? null : Math.abs(dayOffset),

      today_complete: completeByUser.get(p.user_id) ?? 0,
      today_total: TODAY_TOTAL,
    };
  });

  return { challengeId, dayDate, rows };
}
