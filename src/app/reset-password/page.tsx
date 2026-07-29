"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";

// Landet hier NACH dem Klick auf den Reset-Link (über /auth/confirm, das die
// Recovery-Session gesetzt hat). Ohne gültige Session -> Link abgelaufen/ungültig.
export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => setReady(Boolean(user)));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await createClient().auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
    setTimeout(() => { router.push("/dashboard"); router.refresh(); }, 1300);
  }

  return (
    <div className="flex-1 flex flex-col">
      <header className="px-6 py-4 max-w-6xl mx-auto w-full">
        <Logo />
      </header>
      <main className="flex-1 grid place-items-center px-6 py-10">
        <div className="card p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-center">Set a new password</h1>

          {ready === null ? (
            <p className="text-sm text-cream-dim text-center mt-4">Checking your link…</p>
          ) : ready === false ? (
            <div className="mt-4 text-center">
              <div className="text-4xl">⏳</div>
              <p className="text-sm text-cream mt-3">This reset link is invalid or has expired.</p>
              <Link href="/forgot-password" className="btn-gold inline-block px-4 py-2 text-sm mt-5">Request a new link</Link>
            </div>
          ) : done ? (
            <div className="mt-4 text-center">
              <div className="text-4xl">✅</div>
              <p className="text-sm text-cream mt-3">Password updated! Taking you to your dashboard…</p>
            </div>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={submit}>
              <div>
                <label className="block text-sm mb-1 text-cream-dim">New password</label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  className="w-full rounded-lg bg-bordeaux-deep/60 border border-gold/25 px-3 py-2 outline-none focus:border-gold"
                />
              </div>
              {error && <p className="text-sm text-red-700 bg-red-accent/15 rounded-lg p-3">{error}</p>}
              <button type="submit" disabled={loading} className="btn-gold w-full py-2.5 disabled:opacity-50">
                {loading ? "Saving…" : "Update password"}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
