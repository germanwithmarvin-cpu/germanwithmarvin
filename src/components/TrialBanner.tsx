"use client";

import { useEffect, useState } from "react";
import { getAccess, isCodeRedeemer } from "@/lib/access";
import { checkoutUrl, discountCheckoutUrl, priceLabel, discountPriceLabel, hasDiscountLink } from "@/lib/config";
import { appendRef } from "@/lib/referral";
import { createClient } from "@/lib/supabase/client";

// Schmales, dezentes Banner oben während eines laufenden Trials. Zeigt
// verbleibende Tage + führt zum Checkout. Preis: $39 (Self-Service-Trial) bzw.
// $19 nur für Code-Nutzer (Preply/Skool).
export default function TrialBanner() {
  const [days, setDays] = useState<number | null>(null);
  const [href, setHref] = useState("#");
  const [price, setPrice] = useState(priceLabel());

  useEffect(() => {
    (async () => {
      const a = await getAccess();
      if (a.tier !== "full" || !a.trialExpiresAt) return;
      const ms = new Date(a.trialExpiresAt).getTime() - Date.now();
      if (ms <= 0) return;
      setDays(Math.ceil(ms / 86400000));
      const { data: { user } } = await createClient().auth.getUser();
      const redeemer = hasDiscountLink() && (await isCodeRedeemer());
      setPrice(redeemer ? discountPriceLabel() : priceLabel());
      setHref(appendRef(redeemer ? discountCheckoutUrl(user?.email ?? undefined) : checkoutUrl(user?.email ?? undefined)));
    })();
  }, []);

  if (days === null) return null;

  return (
    <div className="w-full flex justify-center px-4 pt-3">
      <p
        className="text-sm text-center rounded-full px-5 py-1.5"
        style={{
          color: "var(--cream)",
          background: "color-mix(in srgb, var(--gold) 20%, transparent)",
          border: "1px solid color-mix(in srgb, var(--gold) 40%, transparent)",
        }}
      >
        🎁 Free trial — <b className="text-gold-bright">{days} day{days === 1 ? "" : "s"} left</b>.{" "}
        <a href={href} className="underline underline-offset-2 hover:opacity-90">
          Keep your access for {price}/mo →
        </a>
      </p>
    </div>
  );
}
