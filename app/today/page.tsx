import { fetchToday } from "./actions";
import { supabaseServer } from "@/lib/supabase/server";
import ItemControls from "./ui/ItemControls";
import UploadProof from "./ui/UploadProof";

function prettyLabel(key: string) {
  switch (key) {
    case "diet":
      return "Follow diet";
    case "workouts":
      return "Two 45-min workouts (1 outdoors)";
    case "water":
      return "1 gallon water";
    case "reading":
      return "Read 10 pages (non-fiction)";
    case "progress_photo":
      return "Progress photo";
    case "no_alcohol":
      return "No alcohol";
    default:
      return key;
  }
}

export default async function TodayPage() {
  const supabase = await supabaseServer();

const {
  data: { user },
  error: userErr,
} = await supabase.auth.getUser();

if (userErr) {
  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-50 p-6">
      <p className="text-sm text-red-400">{userErr.message}</p>
    </div>
  );
}

if (!user) {
  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-50 p-6">
      <p className="text-sm text-neutral-400">Not signed in.</p>
    </div>
  );
}


  const challengeId = process.env.NEXT_PUBLIC_CHALLENGE_ID!;
  const { data: participant } = await supabase
    .from("challenge_participants")
    .select("display_name, participant_start_date, participant_length_days")
    .eq("challenge_id", challengeId)
    .eq("user_id", user?.id ?? "")
    .maybeSingle();

  const today = user ? await fetchToday() : null;

  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-50 p-6">
      <h1 className="text-xl font-semibold">Today</h1>

      <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4">
        <p className="text-sm text-neutral-400">Signed in as</p>
        <p className="text-sm">{user?.email}</p>

        <div className="mt-4">
          <p className="text-sm text-neutral-400">RLS check</p>
          {participant ? (
            <div className="mt-2 text-sm">
              <p>Name: {participant.display_name}</p>
              <p>Start: {participant.participant_start_date}</p>
              <p>Length: {participant.participant_length_days}</p>
            </div>
          ) : (
            <p className="text-sm text-red-400">
              Participant row not found. Check NEXT_PUBLIC_CHALLENGE_ID and seed.
            </p>
          )}
        </div>
      </div>

      {today ? (
        <div className="mt-6 space-y-3">
          <p className="text-sm text-neutral-400">Denver date: {today.day_date}</p>

          {today.checkin_items
            ?.slice()
            .sort((a: any, b: any) => String(a.item_key).localeCompare(String(b.item_key)))
            .map((item: any) => (
              <div
                key={item.id}
                className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{prettyLabel(item.item_key)}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full border ${
                      item.is_complete
                        ? "border-emerald-500/40 text-emerald-300"
                        : "border-neutral-700 text-neutral-400"
                    }`}
                  >
                    {item.is_complete ? "Complete" : "Incomplete"}
                  </span>
                </div>

                {item.note ? (
                  <p className="mt-2 text-xs text-neutral-300">Note: {item.note}</p>
                ) : (
                  <p className="mt-2 text-xs text-neutral-500">No note</p>
                )}

<div className="mt-2 text-xs text-neutral-500">
  Proofs: {item.item_proofs?.length ?? 0}
  {["workouts", "water", "reading", "progress_photo"].includes(item.item_key) ? (
  <UploadProof checkinItemId={item.id} />
) : null}
</div>

{(item.item_key === "diet" || item.item_key === "no_alcohol") ? (
  <ItemControls
    checkinItemId={item.id}
    initialComplete={item.is_complete}
    initialNote={item.note}
  />
) : null}

              </div>
            ))}
        </div>
      ) : null}
    </div>
  );
}
