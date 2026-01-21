"use client";

import { useState, useTransition } from "react";
import { setItemComplete, setItemNote } from "../mutations";

export default function ItemControls({
  checkinItemId,
  initialComplete,
  initialNote,
}: {
  checkinItemId: string;
  initialComplete: boolean;
  initialNote: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [note, setNote] = useState(initialNote ?? "");
  const [complete, setComplete] = useState(initialComplete);

  return (
    <div className="mt-3 space-y-2">
      <div className="flex gap-2">
        <button
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              setComplete(true);
              await setItemComplete(checkinItemId, true);
            })
          }
          className="rounded-lg border border-neutral-700 px-3 py-1.5 text-xs disabled:opacity-60"
        >
          Complete
        </button>
        <button
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              setComplete(false);
              await setItemComplete(checkinItemId, false);
            })
          }
          className="rounded-lg border border-neutral-700 px-3 py-1.5 text-xs disabled:opacity-60"
        >
          Reset
        </button>

        <span className="ml-auto text-xs text-neutral-400">
          {complete ? "Marked complete" : "Not complete"}
        </span>
      </div>

      <div className="space-y-2">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note..."
          className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-xs outline-none focus:border-neutral-600"
          rows={2}
        />
        <button
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const trimmed = note.trim();
              await setItemNote(checkinItemId, trimmed.length ? trimmed : null);
            })
          }
          className="rounded-lg bg-neutral-50 text-neutral-950 px-3 py-1.5 text-xs font-medium disabled:opacity-60"
        >
          Save note
        </button>
      </div>
    </div>
  );
}
