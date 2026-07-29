"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // Der Link führt über /auth/confirm (setzt die Recovery-Session) auf /reset-password.
      redirectTo: `${window.location.origin}/auth/confirm?next=/reset-password`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <div className="flex-1 flex flex-col">
      <header className="px-6 py-4 max-w-6xl mx-auto w-full">
        <Logo />
      </header>
      <main className="flex-1 grid place-items-center px-6 py-10">
        <div className="card p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-center">Reset your password</h1>

          {sent ? (
            <div className="mt-4 text-center">
              <div className="text-4xl">📧</div>
              <p className="text-sm text-cream mt-3">
                If an account exists for <span className="text-cream">{email}</span>, we&apos;ve sent a link to reset your password.
              </p>
              <p className="text-xs text-cream-dim mt-2">Check your inbox (and spam) and click the link.</p>
              <Link href="/login" className="btn-outline inline-block px-4 py-2 text-sm mt-5">Back to sign in</Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-cream-dim text-center mt-1">
                Enter your email and we&apos;ll send you a reset link.
              </p>
              <form className="mt-6 space-y-4" onSubmit={submit}>
                <div>
                  <label className="block text-sm mb-1 text-cream-dim">Email</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="w-full rounded-lg bg-bordeaux-deep/60 border border-gold/25 px-3 py-2 outline-none focus:border-gold"
                  />
                </div>
                {error && <p className="text-sm text-red-700 bg-red-accent/15 rounded-lg p-3">{error}</p>}
                <button type="submit" disabled={loading} className="btn-gold w-full py-2.5 disabled:opacity-50">
                  {loading ? "Sending…" : "Send reset link"}
                </button>
              </form>
              <p className="text-sm text-cream-dim text-center mt-6">
                Remembered it?{" "}
                <Link href="/login" className="text-gold-bright underline underline-offset-4">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
