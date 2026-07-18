"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { checkoutUrl, priceLabel } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";

// Wird angezeigt, wenn ein Inhalt ohne Vollzugang geöffnet wird.
// Zugang: entweder Abo (Stripe) oder Freischaltcode (Preply / Skool).
export default function Paywall({ title = "Unlock full access" }: { title?: string }) {
  const [email, setEmail] = useState<string | undefined>();

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? undefined);
    });
  }, []);

  return (
    <div className="card p-8 max-w-lg mx-auto text-center mt-10">
      <div className="text-5xl">🔓</div>
      <h2 className="text-2xl font-bold mt-3">{title}</h2>
      <p className="text-cream-dim mt-2">
        Get <span className="text-cream">German Simplified — All-Access</span>: every video lesson,
        interactive exercise, the full flashcard trainer and reading stories.
      </p>
      <ul className="text-sm text-cream-dim space-y-1.5 mt-5 text-left max-w-xs mx-auto">
        <li>✓ All levels A1–B2 (videos + flashcards)</li>
        <li>✓ Interactive exercises after every lesson</li>
        <li>✓ Reading stories, statistics & progress</li>
      </ul>

      <a href={checkoutUrl(email)} className="btn-gold px-6 py-3 mt-6 inline-block">
        Get full access — {priceLabel()}/month
      </a>
      <p className="text-xs text-cream-dim mt-2">Cancel anytime.</p>

      <div className="mt-5 pt-4 border-t border-gold/15">
        <p className="text-sm text-cream-dim">Learning with me on Preply or Skool?</p>
        <Link href="/redeem" className="btn-outline px-4 py-2 text-sm mt-2 inline-block">I have a code</Link>
      </div>
    </div>
  );
}
