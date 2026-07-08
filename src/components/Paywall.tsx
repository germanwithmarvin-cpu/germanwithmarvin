"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SITE, checkoutUrl, priceLabel } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";

// Wird angezeigt, wenn ein gesperrter Inhalt (A2–B2 oder Premium) ohne Zugang
// geöffnet wird. Zugang gibt es per Abo (Stripe) oder per Code (Preply / Skool).
export default function Paywall({ title = "Unlock everything" }: { title?: string }) {
  const [userId, setUserId] = useState<string | undefined>();
  const [email, setEmail] = useState<string | undefined>();

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id);
      setEmail(user?.email ?? undefined);
    });
  }, []);

  return (
    <div className="card p-8 max-w-lg mx-auto text-center mt-10">
      <div className="text-5xl">🔓</div>
      <h2 className="text-2xl font-bold mt-3">{title}</h2>
      <p className="text-cream-dim mt-2">
        A1 stays free forever. Unlock all levels, videos, flashcards and stories with
        German Simplified — All-Access.
      </p>
      <ul className="text-sm text-cream-dim space-y-1.5 mt-5 text-left max-w-xs mx-auto">
        <li>✓ All levels A1–B2 (videos + flashcards)</li>
        <li>✓ Smart review path, statistics & placement test</li>
        <li>✓ Reading stories & writing feedback</li>
      </ul>

      <a href={checkoutUrl(userId, email)} className="btn-gold px-6 py-3 mt-6 inline-block">
        Get full access — {priceLabel()}/month
      </a>
      <p className="text-xs text-cream-dim mt-2">Cancel anytime.</p>

      <div className="mt-5 pt-4 border-t border-gold/15">
        <p className="text-sm text-cream-dim">Learning with me on Preply or Skool?</p>
        <div className="flex items-center justify-center gap-3 mt-2">
          <Link href="/redeem" className="btn-outline px-4 py-2 text-sm">I have a code</Link>
          <a href={SITE.skoolUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-cream-dim underline underline-offset-4">Join on Skool</a>
        </div>
      </div>
    </div>
  );
}
