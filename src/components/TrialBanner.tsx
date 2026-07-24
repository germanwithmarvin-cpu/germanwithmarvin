"use client";

import { useEffect, useState } from "react";
import { getAccess } from "@/lib/access";
import { discountCheckoutUrl, discountPriceLabel } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";

// Schmales, dezentes Banner oben, wenn der Zugang über einen laufenden Trial-Code
// kommt. Zeigt verbleibende Tage + führt direkt zum (rabattierten) Checkout.
export default function TrialBanner() {
  const [days, setDays] = useState<number | null>(null);
  const [href, setHref] = useState("#");

  useEffect(() => {
    (async () => {
      const a = await getAccess();
      if (a.tier !== "full" || !a.trialExpiresAt) return;
      const ms = new Date(a.trialExpiresAt).getTime() - Date.now();
      if (ms <= 0) return;
      setDays(Math.ceil(ms / 86400000));
      const { data: { user } } = await createClient().auth.getUser();
      setHref(discountCheckoutUrl(user?.email ?? undefined));
    })();
  }, []);

  if (days === null) return null;

  return (
    <div
      className="w-full flex justify-center py-2 px-4"
      style={{
        background: "color-mix(in srgb, var(--gold) 22%, transparent)",
        borderBottom: "1px solid color-mix(in srgb, var(--gold) 40%, transparent)",
      }}
    >
      <p className="text-sm text-center" style={{ color: "var(--cream)" }}>
        🎁 Free trial — <b className="text-gold-bright">{days} day{days === 1 ? "" : "s"} left</b>.{" "}
        <a href={href} className="underline underline-offset-2 hover:opacity-90">
          Keep your access for {discountPriceLabel()}/mo →
        </a>
      </p>
    </div>
  );
}
