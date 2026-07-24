"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { checkoutUrl, discountCheckoutUrl, priceLabel, discountPriceLabel, hasDiscountLink, TAX_NOTE, SITE } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";
import { getAccess } from "@/lib/access";

// Wird angezeigt, wenn ein Inhalt ohne Vollzugang geöffnet wird.
// Zugang: entweder Abo (Stripe) oder Freischaltcode (Preply / Skool).
export default function Paywall({ title = "Unlock full access" }: { title?: string }) {
  const [email, setEmail] = useState<string | undefined>();
  const [trialEnded, setTrialEnded] = useState(false);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? undefined);
    });
    getAccess().then((a) => setTrialEnded(Boolean(a.trialExpiresAt) && new Date(a.trialExpiresAt!).getTime() < Date.now()));
  }, []);

  // Trial-Absolventen bekommen den rabattierten Link/Preis – aber nur, wenn er
  // hinterlegt ist. Sonst normaler Link + „Rabattcode beim Checkout"-Hinweis.
  const useDiscount = trialEnded && hasDiscountLink();
  const payHref = useDiscount ? discountCheckoutUrl(email) : checkoutUrl(email);
  const payLabel = useDiscount ? discountPriceLabel() : priceLabel();

  return (
    <div className="card p-8 max-w-lg mx-auto text-center mt-10">
      <div className="text-5xl">{trialEnded ? "⏳" : "🔓"}</div>
      <h2 className="text-2xl font-bold mt-3">{trialEnded ? "Your 2-week trial has ended" : title}</h2>
      <p className="text-cream-dim mt-2">
        {trialEnded
          ? (useDiscount
              ? <>Keep everything going at your reduced <span className="text-cream">Preply / Skool price</span>.</>
              : <>Keep everything going with <span className="text-cream">All-Access</span>. Have a discount code? Enter it at checkout for your reduced price.</>)
          : <>Get <span className="text-cream">German Simplified — All-Access</span>: every video lesson, interactive exercise, the full flashcard trainer and reading stories.</>}
      </p>
      <ul className="text-sm text-cream-dim space-y-1.5 mt-5 text-left max-w-xs mx-auto">
        <li>✓ All levels A1–B2 (videos + flashcards)</li>
        <li>✓ Interactive exercises after every lesson</li>
        <li>✓ Reading stories, statistics & progress</li>
      </ul>

      <a href={payHref} className="btn-gold px-6 py-3 mt-6 inline-block">
        Get full access — {payLabel}/month
      </a>
      <p className="text-xs text-cream-dim mt-2">
        {TAX_NOTE} · cancel anytime{useDiscount ? "" : " · got a discount code? Enter it at checkout"}.
      </p>

      <div className="mt-5 pt-4 border-t border-gold/15">
        <p className="text-sm text-cream-dim">Learning with me on Preply or Skool?</p>
        <Link href="/redeem" className="btn-outline px-4 py-2 text-sm mt-2 inline-block">I have a code</Link>
      </div>

      <p className="text-xs text-cream-dim mt-5">
        Already paid but still locked out? Make sure you signed up with the email you paid with, or email{" "}
        <a href={`mailto:${SITE.contactEmail}`} className="text-gold-bright underline underline-offset-4">{SITE.contactEmail}</a>.
      </p>
    </div>
  );
}
