import Link from "next/link";
import { signOutAction } from "../actions";

export default function AppShell({
  title,
  active,
  children,
}: {
  title?: string;
  active?: "today" | "scoreboard";
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-50">
      <header className="sticky top-0 z-10 border-b border-neutral-900 bg-neutral-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/today" className="text-sm font-semibold tracking-tight">
              75 Hard
            </Link>

            <nav className="flex items-center gap-3 text-sm">
              <Link
                href="/today"
                className={`rounded-full px-3 py-1 border ${
                  active === "today"
                    ? "border-neutral-700 bg-neutral-900 text-neutral-50"
                    : "border-neutral-900 text-neutral-400 hover:text-neutral-200"
                }`}
              >
                Today
              </Link>
              <Link
                href="/scoreboard"
                className={`rounded-full px-3 py-1 border ${
                  active === "scoreboard"
                    ? "border-neutral-700 bg-neutral-900 text-neutral-50"
                    : "border-neutral-900 text-neutral-400 hover:text-neutral-200"
                }`}
              >
                Scoreboard
              </Link>
            </nav>
          </div>

          <form action={signOutAction}>
            <button className="text-sm text-neutral-400 hover:text-neutral-200">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-3xl p-6">
        {title ? <h1 className="text-xl font-semibold">{title}</h1> : null}
        {children}
      </main>
    </div>
  );
}
