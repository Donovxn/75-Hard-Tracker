# 75 Hard Tracker – Project State

Last updated: 2026-01-20

## Stack
- Next.js (App Router), TypeScript, Tailwind
- Supabase: Auth + Postgres + Storage + RLS
- Timezone/cutoff: America/Denver (11:59 PM)

## Envs (local)
- NEXT_PUBLIC_SUPABASE_URL=...
- NEXT_PUBLIC_SUPABASE_ANON_KEY=...
- NEXT_PUBLIC_CHALLENGE_ID=... (seed output)

## Supabase DB
Tables exist:
- challenges
- challenge_participants (includes participant_start_date + participant_length_days default 75)
- daily_checkins
- checkin_items
- item_proofs

Seed:
- Challenge start date: 2026-02-01
- Donnie participant row exists (brother TBD)

RLS:
- v1 policies currently allow users to read/write only their own rows (non-recursive fix applied)

## Supabase Storage
- Bucket: proofs (private)
- Policies: user can read/write/delete only files under prefix: <auth.uid()>/...

Path convention:
- <userId>/<checkinItemId>/<uuid>.<ext>

## App routes
- /login (auth)
- /today (works)
- /scoreboard (stub or WIP)

## Today screen (working)
Behavior:
- Ensures today’s daily_checkin exists (Denver date) and creates 6 checkin_items on first load
- Items:
  - diet + no_alcohol: toggle complete + optional note (persists)
  - workouts/water/reading/progress_photo: photo proof upload (persists; increments Proofs count)
- Files:
  - src/app/today/actions.ts (ensureTodayCheckin, fetchToday, uploadProofAction)
  - app/today/mutations.ts (toggle/note)
  - app/today/ui/ItemControls.tsx
  - src/app/today/ui/UploadProof.tsx
  - src/lib/date/denver.ts
  - src/lib/supabase/server.ts (async cookies fix)

## Known TODOs (next)
1) Enforce rule: proof-required items cannot be marked complete unless at least 1 proof exists.
2) Scoreboard v1: day 1–75 grid, side-by-side completion (no image viewing needed v1).
3) Add brother user + seed participant row.
