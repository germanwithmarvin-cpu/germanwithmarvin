"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";
import { getAttribution } from "@/lib/attribution";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [marketing, setMarketing] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    const supabase = createClient();
    const src = getAttribution();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          marketing_consent: marketing,
          // Herkunft für die spätere Auswertung (siehe handle_new_user()).
          utm_source: src.utm_source,
          utm_medium: src.utm_medium,
          utm_campaign: src.utm_campaign,
          gclid: src.gclid,
          referrer: src.referrer,
          ref: src.ref,
        },
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    // Zugang wird über die bezahlte E-Mail bzw. einen Code abgeleitet (my_access()).
    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }
    setInfo("Check your email to confirm your account, then sign in.");
    setLoading(false);
  }

  return (
    <div className="flex-1 flex flex-col">
      <header className="px-6 py-4 max-w-6xl mx-auto w-full">
        <Logo />
      </header>
      <main className="flex-1 grid place-items-center px-6 py-10">
        <div className="card p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-center">Start your 5-day free trial</h1>

          {/* Trial-Highlight */}
          <div className="mt-4 rounded-xl border-2 border-gold/50 bg-gold/10 p-4 text-center">
            <div className="text-2xl">🎁</div>
            <p className="text-sm text-cream mt-1">
              <span className="text-gold-bright font-bold">Full access, free for 5 days.</span> No credit card needed.
            </p>
            <p className="text-xs text-cream-dim mt-1">Videos, flashcard trainer, the vocab game & stories — everything.</p>
            <p className="text-xs text-cream-dim mt-2">
              Already paid or have a code? Sign up with the{" "}
              <span className="text-cream">same email</span> — your access unlocks automatically.
            </p>
          </div>

          <form className="mt-5 space-y-4" onSubmit={handleRegister}>
            <div>
              <label className="block text-sm mb-1 text-cream-dim">Name</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} type="text" required placeholder="Your name" className="w-full rounded-lg bg-bordeaux-deep/60 border border-gold/25 px-3 py-2 outline-none focus:border-gold" />
            </div>
            <div>
              <label className="block text-sm mb-1 text-cream-dim">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="you@example.com" className="w-full rounded-lg bg-bordeaux-deep/60 border border-gold/25 px-3 py-2 outline-none focus:border-gold" />
            </div>
            <div>
              <label className="block text-sm mb-1 text-cream-dim">Password</label>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required minLength={6} placeholder="At least 6 characters" className="w-full rounded-lg bg-bordeaux-deep/60 border border-gold/25 px-3 py-2 outline-none focus:border-gold" />
            </div>

            <label className="flex items-start gap-2 text-xs text-cream-dim cursor-pointer">
              <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-0.5 accent-[color:var(--gold)]" />
              <span>Send me German learning tips &amp; occasional offers by email. Optional — you can unsubscribe anytime.</span>
            </label>

            {error && <p className="text-sm text-red-700 bg-red-accent/15 rounded-lg p-3">{error}</p>}
            {info && <p className="text-sm text-cream bg-green-accent/20 rounded-lg p-3">{info}</p>}

            <button type="submit" disabled={loading} className="btn-gold w-full py-2.5 disabled:opacity-50">
              {loading ? "Starting…" : "Start my free trial"}
            </button>
          </form>

          <p className="text-xs text-cream-dim text-center mt-4">
            🎟️ Have a code? Create your account first — then unlock access with{" "}
            <span className="text-gold-bright">“Redeem code”</span> inside the app.
          </p>
          <p className="text-xs text-cream-dim text-center mt-3">
            Haven’t joined yet?{" "}
            <Link href="/" className="text-gold-bright underline underline-offset-4">See the plan</Link>.
          </p>
          <p className="text-sm text-cream-dim text-center mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-gold-bright underline underline-offset-4">Sign in</Link>
          </p>
          <p className="text-xs text-cream-dim text-center mt-4">
            By creating an account you agree to our{" "}
            <Link href="/agb" className="underline underline-offset-4">terms</Link> and{" "}
            <Link href="/datenschutz" className="underline underline-offset-4">privacy policy</Link>.
          </p>
        </div>
      </main>
    </div>
  );
}
