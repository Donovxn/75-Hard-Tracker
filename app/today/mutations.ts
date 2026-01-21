"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

export async function setItemComplete(checkinItemId: string, isComplete: boolean) {
  const supabase = await supabaseServer();

  const { error } = await supabase
    .from("checkin_items")
    .update({ is_complete: isComplete, updated_at: new Date().toISOString() })
    .eq("id", checkinItemId);

  if (error) throw new Error(error.message);

  revalidatePath("/today");
}

export async function setItemNote(checkinItemId: string, note: string | null) {
  const supabase = await supabaseServer();

  const { error } = await supabase
    .from("checkin_items")
    .update({ note, updated_at: new Date().toISOString() })
    .eq("id", checkinItemId);

  if (error) throw new Error(error.message);

  revalidatePath("/today");
}
