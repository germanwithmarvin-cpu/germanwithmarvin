"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { checkoutUrl, priceLabel, TAX_NOTE, SITE } from "@/lib/config";
import { appendRef } from "@/lib/referral";
import { createClient } from "@/lib/supabase/client";
import { DAILY_LIMITS, type LimitKind } from "@/lib/trialLimits";

// Warme Upgrade-Wand, wenn ein Trial-Nutzer sein Tageskontingent erreicht.
// Bewusst NICHT bestrafend: erst loben ("stark gelernt!"), dann das Angebot,
// und immer der sanfte Ausweg "morgen wieder" -- so bleibt der Kunde bei Laune.
const COPY: Record<LimitKind, { emoji: string; done: string }> = {
  cards: { emoji: "🔥", done: `${DAILY_LIMITS.cards} flashcards today` },
  units: { emoji: "💪", done: `${DAILY_LIMITS.units} training units today` },
  videos: { emoji: "🎬", done: `${DAILY_LIMITS.videos} video lessons today` },
};

export default function TrialLimitWall({ kind, trialExpiresAt }: { kind: LimitKind; trialExpiresAt?: string | null }) {
  const [email, setEmail] = useState<string | undefined>();
  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => setEmail(user?.email ?? undefined));
  }, []);

  const daysLeft = trialExpiresAt
    ? Math.max(0, Math.ceil((new Date(trialExpiresAt).getTime() - Date.now()) / 86_400_000))
    : null;
  const href = appendRef(checkoutUrl(email));
  const c = COPY[kind];

  return (
    <div className="card p-8 max-w-lg mx-auto text-center mt-10">
      <div className="text-5xl">{c.emoji}</div>
      <h2 className="text-2xl font-bold mt-3">Nice work — that&apos;s {c.done}!</h2>
      <p className="text-cream-dim mt-2">
        You&apos;ve reached today&apos;s free practice limit. <span className="text-cream">Members keep going with no daily
        limit</span> — or come back tomorrow for another free round.
      </p>
      <ul className="text-sm text-cream-dim space-y-1.5 mt-5 text-left max-w-xs mx-auto">
        <li>✓ Unlimited flashcards, exercises &amp; lessons</li>
        <li>✓ All levels A1–B2, every single day</li>
        <li>✓ Keep your streak &amp; momentum going</li>
      </ul>

      <a href={href} className="btn-gold px-6 py-3 mt-6 inline-block">
        Get unlimited — {priceLabel()}/month
      </a>
      <p className="text-xs text-cream-dim mt-2">{TAX_NOTE} · cancel anytime.</p>

      {daysLeft !== null && (
        <p className="text-xs text-cream-dim mt-4">
          Your free trial still runs for {daysLeft} more {daysLeft === 1 ? "day" : "days"}.
        </p>
      )}

      <div className="mt-5 pt-4 border-t border-gold/15">
        <Link href="/dashboard" className="text-sm text-cream-dim hover:text-cream underline underline-offset-4">
          Come back tomorrow →
        </Link>
      </div>

      <p className="text-xs text-cream-dim mt-5">
        Questions? Email{" "}
        <a href={`mailto:${SITE.contactEmail}`} className="text-gold-bright underline underline-offset-4">{SITE.contactEmail}</a>.
      </p>
    </div>
  );
}
