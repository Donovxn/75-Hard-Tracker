import LoginForm from "./ui/LoginForm";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/today");

  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
        <h1 className="text-xl font-semibold">75 Hard Tracker</h1>
        <p className="mt-1 text-sm text-neutral-400">Sign in to continue</p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
