"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { denverTodayISODate } from "@/lib/date/denver";

const ITEM_KEYS = [
  "diet",
  "workouts",
  "water",
  "reading",
  "progress_photo",
  "no_alcohol",
] as const;

export async function ensureTodayCheckin() {
  const supabase = await supabaseServer();
  const challengeId = process.env.NEXT_PUBLIC_CHALLENGE_ID!;
  const dayDate = denverTodayISODate();

  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw authErr;
  const user = auth.user;
  if (!user) throw new Error("Not authenticated");

  const { data: existing, error: findErr } = await supabase
    .from("daily_checkins")
    .select("id")
    .eq("challenge_id", challengeId)
    .eq("user_id", user.id)
    .eq("day_date", dayDate)
    .maybeSingle();

  if (findErr) throw new Error(findErr.message);

  let checkinId = existing?.id as string | undefined;

  if (!checkinId) {
    const { data: created, error: createErr } = await supabase
      .from("daily_checkins")
      .insert({
        challenge_id: challengeId,
        user_id: user.id,
        day_date: dayDate,
      })
      .select("id")
      .single();

    if (createErr) throw new Error(createErr.message);
    checkinId = created.id;

    const { error: itemsErr } = await supabase.from("checkin_items").insert(
      ITEM_KEYS.map((k) => ({
        checkin_id: checkinId,
        item_key: k,
        is_complete: false,
        note: null,
      }))
    );

    if (itemsErr) throw new Error(itemsErr.message);
  }

  return { checkinId, dayDate };
}

export async function fetchToday() {
  const supabase = await supabaseServer();
  const challengeId = process.env.NEXT_PUBLIC_CHALLENGE_ID!;
  const dayDate = denverTodayISODate();

  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw authErr;
  const user = auth.user;
  if (!user) throw new Error("Not authenticated");

  await ensureTodayCheckin();

  const { data, error } = await supabase
    .from("daily_checkins")
    .select(
      `
      id,
      day_date,
      checkin_items (
        id,
        item_key,
        is_complete,
        note,
        item_proofs ( id, storage_path, meta, created_at )
      )
    `
    )
    .eq("challenge_id", challengeId)
    .eq("user_id", user.id)
    .eq("day_date", dayDate)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

function extFromType(type: string) {
  if (type === "image/jpeg") return "jpg";
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

export async function uploadProofAction(formData: FormData) {
  const checkinItemId = String(formData.get("checkinItemId") ?? "");
  const file = formData.get("file") as File | null;

  if (!checkinItemId) throw new Error("Missing checkinItemId");
  if (!file) throw new Error("Missing file");
  if (!file.type.startsWith("image/")) throw new Error("File must be an image");

  const maxBytes = 4 * 1024 * 1024; // 4MB
  if (file.size > maxBytes) throw new Error("Image too large (max 4MB)");

  const supabase = await supabaseServer();

  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw authErr;
  const user = auth.user;
  if (!user) throw new Error("Not authenticated");

  const ext = extFromType(file.type);
  const filename = crypto.randomUUID();
  const storagePath = `${user.id}/${checkinItemId}/${filename}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from("proofs")
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (upErr) throw upErr;

  const { error: dbErr } = await supabase.from("item_proofs").insert({
    checkin_item_id: checkinItemId,
    storage_path: storagePath,
    meta: { mime: file.type, size: file.size },
  });

  if (dbErr) throw dbErr;

  revalidatePath("/today");
}
