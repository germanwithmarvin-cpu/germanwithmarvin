"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex-1 flex flex-col">
      <header className="px-6 py-4 max-w-6xl mx-auto w-full">
        <Logo />
      </header>
      <main className="flex-1 grid place-items-center px-6 py-10">
        <div className="card p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-center">Welcome back</h1>
          <p className="text-sm text-cream-dim text-center mt-1">
            Sign in to keep learning.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleLogin}>
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
            <div>
              <label className="block text-sm mb-1 text-cream-dim">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                placeholder="••••••••"
                className="w-full rounded-lg bg-bordeaux-deep/60 border border-gold/25 px-3 py-2 outline-none focus:border-gold"
              />
            </div>

            {error && <p className="text-sm text-red-700 bg-red-accent/15 rounded-lg p-3">{error}</p>}

            <button type="submit" disabled={loading} className="btn-gold w-full py-2.5 disabled:opacity-50">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="text-sm text-cream-dim text-center mt-6">
            No account yet?{" "}
            <Link href="/" className="text-gold-bright underline underline-offset-4">
              Join now
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
